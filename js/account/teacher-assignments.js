// ogretmen-odevler.html: Google Classroom'daki "Sınıf çalışmaları" gibi ödev listesi. Üstte öğrenci seçimi
// ("Tüm öğrenciler" ya da tek öğrenci), altta ödevler verildiği günün tarih başlıkları altında, en yenisi üstte.
// "+ Oluştur" ve "Düzenle" ogretmen-odev.html'yi açar. Veri biçimi: js/account/assignments.js.
import { $, exerciseUrl, h, loadResults, scoreText } from './common.js';
import { assignmentBody, expandExercises, groupByDay, solvedCount, withResults } from './assignments.js?v=1';
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
  return card({
    a, done: copy.done,
    meta: [dueText(a.due), others > 0 ? `${studentName(copy.uid)} ve ${others} öğrenci daha` : null],
    badges: [
      count ? h('span', { class: `acc-badge ${count.solved === count.total ? 'success' : ''}` }, `${count.solved}/${count.total} çözüldü`) : null,
      h('span', { class: `acc-badge ${copy.done ? 'success' : ''}` }, copy.done ? `Tamamladı · ${fmtDate(copy.doneAt)}` : 'Bekliyor'),
      overdue ? h('span', { class: 'acc-badge warning' }, 'Süresi geçti') : null
    ],
    body: [
      ...assignmentBody(a, exercises, { tx, scoreText, exerciseUrl }),
      copy.studentDocUrl ? h('p', { class: 'odev-text' }, 'Öğrencinin dokümanı: ', h('a', { class: 'ba-link', href: copy.studentDocUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Aç')) : null
    ],
    actions: [edit, removeOne]
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
  return card({
    a, done: done === g.copies.length,
    meta: [dueText(a.due), `${g.copies.length} öğrenci`],
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
          h('span', { class: `acc-badge ${c.done ? 'success' : ''}` }, c.done ? `Tamamladı · ${fmtDate(c.doneAt)}` : 'Bekliyor')))))
    ],
    actions: [edit, remove]
  });
}

function card({ a, done, meta, badges, body, actions }){
  return h('article', { class: 'odev-item', id: `odev-${a.groupId || a.id}` },
    h('span', { class: `odev-icon${done ? ' done' : ''}`, 'aria-hidden': 'true' }, done ? '✓' : '✎'),
    h('div', { class: 'odev-main' },
      h('div', { class: 'odev-head' },
        h('h3', {}, a.title),
        h('span', { class: 'acc-badges' }, badges)),
      h('p', { class: 'odev-meta' }, meta.filter(Boolean).join(' · ')),
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
    [students, groups] = await Promise.all([listStudents(), loadAssignmentGroups()]);
    studentsById = new Map(students.map((s) => [s.id, s]));
    fillStudents(params.get('ogrenci'));
    const status = params.get('durum');
    if(status === 'verildi') setNotice('success', 'Ödev verildi.');
    if(status === 'guncellendi') setNotice('success', 'Ödev güncellendi.');
    $('studentSelect').addEventListener('change', () => { setNotice('', ''); render(); });
    await render();
    $('listLoading').hidden = true;
    $('listApp').hidden = false;
  }catch(error){
    console.error(error);
    $('listLoading').hidden = true;
    $('listError').hidden = false;
    $('listError').textContent = 'Ödevler yüklenemedi. Tekrar dene.';
  }
}
