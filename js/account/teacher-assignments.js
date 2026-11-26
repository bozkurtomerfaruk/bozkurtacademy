// ogretmen-odevler.html: Google Classroom'daki "Sınıf çalışmaları" gibi ödev listesi. Üstte öğrenci seçimi
// ("Tüm öğrenciler" ya da tek öğrenci), altta ödevler verildiği günün tarih başlıkları altında, en yenisi üstte.
// "+ Oluştur" ve "Düzenle" ogretmen-odev.html'yi açar. Veri biçimi: js/account/assignments.js.
import { $, exerciseUrl, h, loadCatalogLevels, loadResults, localize, scoreText } from './common.js';
import { assignmentSummary, studentNamesText } from './assignment-summary.js?v=1';
import { assignmentBody, expandExercises, groupByDay, solvedCount, withResults } from './assignments.js?v=1';
import { describeResult, mailConfigured, notifyHomework, takeResult } from './homework-mail.js?v=1';
import { loadDrafts } from './homework-drafts.js?v=2';
import { deleteAssignmentCopies, fmtDate, isEnabled, listStudents, loadAssignmentGroups, requireTeacher } from './teacher-common.js';

const TX = {
  assignLinks: 'Bağlantılar', assignCopyShort: 'kopya', assignCopyHint: 'Docs "kopya" bağlantısı her öğrenciye dokümanın kendi kopyasını oluşturur.',
  assignWholeTopic: 'konunun tamamı', assignExercises: 'Alıştırmalar', assignSolved: 'Çözüldü', assignNotSolved: 'Henüz çözülmedi'
};
const tx = (key) => TX[key] || key;
const fmtDateTime = (d) => d ? `${fmtDate(d)} ${new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(d)}` : '';

let students = [];
let studentsById = new Map();
let groups = [];
let levels = []; // katalog: özetteki konu adları
const topicTitle = (level, topic) => localize(levels.find((l) => l.id === level)?.topics?.find((t) => t.id === topic)?.title, 'tr');
// Kartta öğrenci adları: en çok 3 ad, fazlası "ve n kişi daha" (tamamı "Ayrıntılar"da). first: önce yazılacak öğrenci.
function namesOf(g, first = ''){
  const names = g.copies.filter((c) => c.uid !== first).map((c) => studentName(c.uid)).sort((a, b) => a.localeCompare(b, 'tr'));
  return studentNamesText(first ? [studentName(first), ...names] : names);
}
const resultsCache = new Map();
let renderToken = 0;

function selected(){
  return $('studentSelect').value;
}

function fillStudents(preselect){
  const withCopies = new Set(groups.flatMap((g) => g.copies.map((c) => c.uid)));
  const shown = students.filter((s) => isEnabled(s) || withCopies.has(s.id))
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  $('studentSelect').replaceChildren(
    h('option', { value: '' }, 'Tüm öğrenciler'),
    ...shown.map((s) => h('option', { value: s.id }, s.name + (isEnabled(s) ? '' : ' (hesap kapalı)'))));
  if(preselect && shown.some((s) => s.id === preselect)) $('studentSelect').value = preselect;
}

function studentName(uid){
  return studentsById.get(uid)?.name || 'Silinmiş öğrenci';
}

function updateUrl(){
  const uid = selected();
  const url = uid ? `ogretmen-odevler.html?ogrenci=${encodeURIComponent(uid)}` : 'ogretmen-odevler.html';
  history.replaceState(null, '', url);
  $('createLink').href = uid ? `ogretmen-odev.html?ogrenci=${encodeURIComponent(uid)}` : 'ogretmen-odev.html';
}

async function studentResults(uid){
  if(!resultsCache.has(uid)) resultsCache.set(uid, loadResults(uid).catch((error) => { console.warn(error); return []; }));
  return resultsCache.get(uid);
}

function dueText(due){
  return due ? `Teslim: ${fmtDateTime(due)}` : 'Teslim tarihi yok';
}

async function removeCopies(refs, button, question){
  if(!confirm(question)) return;
  button.disabled = true;
  try{
    await deleteAssignmentCopies(refs);
    setNotice('success', 'Ödev silindi.');
    await reload();
  }catch(error){
    console.error(error);
    button.disabled = false;
    setNotice('error', 'Ödev silinemedi. Tekrar dene.');
  }
}

function setNotice(type, message){
  const el = $('listNotice');
  el.hidden = !message;
  el.className = `acc-status${type ? ' ' + type : ''}`;
  el.textContent = message || '';
}

// E-posta: "yeni ödev" e-postası gitmemiş kopyalara gönderir (tekrar dene). Sonuç bildirim satırında.
async function sendMail(copies, button){
  button.disabled = true;
  setNotice('', 'E-postalar gönderiliyor…');
  const result = await notifyHomework('new', copies.map((c) => ({ uid: c.uid, id: c.id })));
  const view = describeResult(result, studentName);
  await reload();
  setNotice(view.type, view.text);
}

const mailSent = (copy) => copy.assignment?.mailNewAt;
const mailOff = (uid) => studentsById.get(uid)?.homeworkMail === false;
function mailText(copy){
  const a = copy.assignment;
  if(mailSent(copy)) return `E-posta gönderildi · ${fmtDate(a.mailNewAt)}${a.mailUpdateAt ? ` · değişiklik bildirildi ${fmtDate(a.mailUpdateAt)}` : ''}`;
  if(mailOff(copy.uid)) return 'Ödev e-postaları kapalı';
  return 'E-posta gönderilmedi';
}

// Tek öğrencinin görünümü: o öğrencinin kopyası, alıştırma durumları ve öğrencinin işaretleri.
async function studentCard(g, copy, results){
  const a = copy.assignment;
  const exercises = withResults(await expandExercises(a, 'tr'), results, a.createdAt);
  const count = solvedCount(exercises);
  const overdue = !copy.done && a.due && a.due < new Date();
  const edit = h('a', { class: 'btn ghost', href: `ogretmen-odev.html?duzenle=${encodeURIComponent(g.groupId)}` }, 'Düzenle');
  const removeOne = h('button', { class: 'acc-text-button', type: 'button' }, 'Bu öğrenciden kaldır');
  removeOne.addEventListener('click', () => removeCopies([copy.ref], removeOne, `"${a.title}" ödevi ${studentName(copy.uid)} adlı öğrenciden kaldırılsın mı?`));
  const others = g.copies.length - 1;
  const actions = [edit, removeOne];
  let mailAction = null;
  if(mailConfigured && !mailSent(copy) && !mailOff(copy.uid) && isEnabled(studentsById.get(copy.uid) || {})){
    mailAction = h('button', { class: 'acc-text-button', type: 'button' }, 'E-posta gönder');
    mailAction.addEventListener('click', () => sendMail([copy], mailAction));
  }
  return card({
    a, done: copy.done,
    meta: [dueText(a.due), others > 0 ? namesOf(g, copy.uid) : null],
    mail: mailConfigured ? mailText(copy) : null,
    mailAction,
    badges: [
      count ? h('span', { class: `acc-badge ${count.solved === count.total ? 'success' : ''}` }, `${count.solved}/${count.total} çözüldü`) : null,
      h('span', { class: `acc-badge ${copy.done ? 'success' : ''}` }, copy.done ? `Tamamladı · ${fmtDate(copy.doneAt)}` : 'Bekliyor'),
      overdue ? h('span', { class: 'acc-badge warning' }, 'Süresi geçti') : null
    ],
    body: [
      ...assignmentBody(a, exercises, { tx, scoreText, exerciseUrl }),
      copy.studentDocUrl ? h('p', { class: 'odev-text' }, 'Öğrencinin dokümanı: ', h('a', { class: 'ba-link', href: copy.studentDocUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Aç')) : null
    ],
    actions
  });
}

// Tüm öğrenciler: ödev bir kez, öğrencilerin durumuyla.
async function groupCard(g){
  const a = g.data;
  const exercises = await expandExercises(a, 'tr');
  const done = g.copies.filter((c) => c.done).length;
  const overdue = a.due && a.due < new Date() && done < g.copies.length;
  const edit = h('a', { class: 'btn ghost', href: `ogretmen-odev.html?duzenle=${encodeURIComponent(g.groupId)}` }, 'Düzenle');
  const remove = h('button', { class: 'acc-text-button', type: 'button' }, 'Sil');
  remove.addEventListener('click', () => removeCopies(g.copies.map((c) => c.ref), remove,
    `"${a.title}" ödevi ${g.copies.length} öğrenciden silinsin mi? Öğrencilerin işaretleri de silinir. (Drive'daki PDF'ler silinmez.)`));
  const people = [...g.copies].sort((x, y) => studentName(x.uid).localeCompare(studentName(y.uid), 'tr'));
  const unsent = mailConfigured ? g.copies.filter((c) => !mailSent(c) && !mailOff(c.uid) && isEnabled(studentsById.get(c.uid) || {})) : [];
  const unsentButton = h('button', { class: 'acc-text-button', type: 'button' }, 'Gönder');
  unsentButton.addEventListener('click', () => sendMail(unsent, unsentButton));
  return card({
    a, done: done === g.copies.length,
    who: namesOf(g),
    meta: [dueText(a.due)],
    badges: [
      h('span', { class: `acc-badge ${done === g.copies.length ? 'success' : ''}` }, `${done}/${g.copies.length} tamamladı`),
      overdue ? h('span', { class: 'acc-badge warning' }, 'Süresi geçti') : null
    ],
    body: [
      ...assignmentBody(a, exercises, { tx, showStatus: false, exerciseUrl }),
      h('div', { class: 'odev-ex-block' },
        h('h4', {}, 'Öğrenciler'),
        h('ul', { class: 'odev-ex-list' }, people.map((c) => h('li', {},
          studentsById.has(c.uid)
            ? h('a', { class: 'ba-link', href: `ogretmen-odevler.html?ogrenci=${encodeURIComponent(c.uid)}` }, studentName(c.uid))
            : h('span', {}, studentName(c.uid)),
          h('span', { class: `acc-badge ${c.done ? 'success' : ''}` }, c.done ? `Tamamladı · ${fmtDate(c.doneAt)}` : 'Bekliyor'),
          mailConfigured ? h('span', { class: 'odev-mail' }, mailText(c)) : null))))
    ],
    mail: unsent.length ? `${unsent.length} öğrenciye e-posta gitmedi` : null,
    mailAction: unsent.length ? unsentButton : null,
    actions: [edit, remove]
  });
}

function card({ a, done, meta, badges, body, actions, mail, mailAction, who = '' }){
  const summary = assignmentSummary(a, topicTitle);
  return h('article', { class: 'odev-item', id: `odev-${a.groupId || a.id}` },
    h('span', { class: `odev-icon${done ? ' done' : ''}`, 'aria-hidden': 'true' }, done ? '✓' : '✎'),
    h('div', { class: 'odev-main' },
      h('div', { class: 'odev-head' },
        h('h3', {}, a.title),
        h('span', { class: 'acc-badges' }, badges)),
      summary ? h('p', { class: 'odev-summary' }, summary) : null,
      who ? h('p', { class: 'odev-who' }, who) : null,
      h('p', { class: 'odev-meta' }, meta.filter(Boolean).join(' · ')),
      mail ? h('p', { class: 'odev-mail' }, mail, mailAction ? ' · ' : null, mailAction) : null,
      h('details', { class: 'odev-details' },
        h('summary', {}, 'Ayrıntılar'),
        h('div', { class: 'odev-body' }, body),
        h('div', { class: 'acc-actions odev-actions' }, actions))));
}

async function render(){
  const token = ++renderToken;
  const uid = selected();
  updateUrl();
  let items;
  if(uid){
    const results = await studentResults(uid);
    const mine = groups.flatMap((g) => g.copies.filter((c) => c.uid === uid).map((c) => ({ g, c, created: c.assignment.created })));
    items = await Promise.all(mine.map(async (x) => ({ created: x.created, node: await studentCard(x.g, x.c, results) })));
    $('listSummary').textContent = mine.length
      ? `${studentName(uid)}: ${mine.length} ödev, ${mine.filter((x) => !x.c.done).length} açık.`
      : '';
  }else{
    items = await Promise.all(groups.map(async (g) => ({ created: g.createdAt, node: await groupCard(g) })));
    $('listSummary').textContent = groups.length ? `${groups.length} ödev.` : '';
  }
  if(token !== renderToken) return;
  const days = groupByDay(items);
  $('assignmentDays').replaceChildren(...(days.length
    ? days.map((d) => h('section', { class: 'odev-day', 'aria-label': d.label },
      h('h2', { class: 'odev-day-title' }, d.label),
      h('div', { class: 'odev-day-list' }, d.items.map((x) => x.node))))
    : [h('p', { class: 'acc-empty' }, uid ? 'Bu öğrenciye henüz ödev verilmedi.' : 'Henüz ödev verilmedi.')]));
}

async function reload(){
  groups = await loadAssignmentGroups();
  resultsCache.clear();
  await render();
}

const user = await requireTeacher({ loadingId: 'listLoading', errorId: 'listError' });
if(user){
  try{
    const params = new URLSearchParams(location.search);
    [students, groups, levels] = await Promise.all([listStudents(), loadAssignmentGroups(), loadCatalogLevels().catch(() => [])]);
    studentsById = new Map(students.map((s) => [s.id, s]));
    fillStudents(params.get('ogrenci'));
    const status = params.get('durum');
    if(status === 'verildi') setNotice('success', 'Ödev verildi.');
    if(status === 'guncellendi') setNotice('success', 'Ödev güncellendi.');
    const mail = describeResult(takeResult(), studentName);
    if(mail) setNotice(mail.type, `${status === 'guncellendi' ? 'Ödev güncellendi.' : 'Ödev verildi.'} ${mail.text}`);
    $('studentSelect').addEventListener('change', () => { setNotice('', ''); render(); });
    await render();
    // Taslak sayısı (homeworkDrafts; öğrenci görmez).
    loadDrafts().then((list) => { if(list.length) $('draftsLink').textContent = `Taslaklar (${list.length})`; }).catch((error) => console.warn(error));
    $('listLoading').hidden = true;
    $('listApp').hidden = false;
  }catch(error){
    console.error(error);
    $('listLoading').hidden = true;
    $('listError').hidden = false;
    $('listError').textContent = 'Ödevler yüklenemedi. Tekrar dene.';
  }
}
