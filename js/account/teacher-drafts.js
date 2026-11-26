// ogretmen-taslaklar.html: ödev asistanının ve "Taslak kaydet"in taslakları (homeworkDrafts, js/account/homework-drafts.js).
// Taslağı öğrenci görmez, e-posta gitmez. Öğretmen taslaktan öğe çıkarır ("Kaldır"), öğe eklemek için formu açar
// ("Düzenle / öğe ekle" → ogretmen-odev.html?taslak=<id>) ve bir ya da birden çok taslağı tek seferde onaylar.
// Onay: her taslak için ödev kopyaları + taslağın silinmesi tek yazmada; sonra yeni ödev e-postaları (Worker).
import { $, exerciseNames, h, setStatus } from './common.js';
import { linkLabel, topicTitles } from './assignments.js?v=1';
import { approveDraft, deleteDraft, draftData, draftEmpty, loadDrafts, updateDraft } from './homework-drafts.js?v=2';
import { mailConfigured, notifyHomework, rememberResult } from './homework-mail.js?v=1';
import { loadLibrary, shareItems, unsharedIn } from './library.js?v=1';
import { fmtDate, isEnabled, listStudents, requireTeacher } from './teacher-common.js';

let drafts = [];
let library = []; // kütüphaneden eklenen gizli PDF'ler onayda paylaşılır
let studentsById = new Map();
const names = { topics: {}, exercises: {} };
const exKey = (e) => `${e.level}/${e.topic}/${e.exercise}`;
const topicKey = (t) => `${t.level}/${t.topic}`;

const studentName = (uid) => studentsById.get(uid)?.name || 'Silinmiş öğrenci';
// Ödevi alabilecek öğrenciler: hesabı açık (16 yaş altında veli onayı var).
const receivers = (d) => d.uids.filter((u) => studentsById.has(u) && isEnabled(studentsById.get(u)));

function setNotice(type, message){
  setStatus($('draftNotice'), type, message);
}

async function loadNames(){
  const topics = drafts.flatMap((d) => d.topics).filter((t, i, all) => all.findIndex((x) => topicKey(x) === topicKey(t)) === i);
  const exercises = drafts.flatMap((d) => d.exercises);
  const [t, e] = await Promise.all([topicTitles(topics, 'tr').catch(() => ({})), exerciseNames(exercises, 'tr').catch(() => ({}))]);
  names.topics = t;
  names.exercises = e;
}

const exerciseLabel = (e) => {
  const n = names.exercises[exKey(e)];
  return `${e.level} · ${n?.topic || e.topic} · ${n?.exercise || e.exercise}`;
};

// Taslaktan bir öğe çıkarma (topics, exercises ya da links listesinden).
async function removeItem(d, field, index, button){
  button.disabled = true;
  const next = d[field].filter((_, i) => i !== index);
  try{
    await updateDraft(d.id, { [field]: next });
    d[field] = next;
    render();
    setNotice('success', 'Öğe taslaktan çıkarıldı.');
  }catch(error){
    console.error(error);
    button.disabled = false;
    setNotice('error', 'Öğe çıkarılamadı. Tekrar dene.');
  }
}

async function removeDraft(d, button){
  if(!confirm(`"${d.title}" taslağı silinsin mi? Öğrenciye bir şey gitmez.`)) return;
  button.disabled = true;
  try{
    await deleteDraft(d.id);
    drafts = drafts.filter((x) => x.id !== d.id);
    render();
    setNotice('success', 'Taslak silindi.');
  }catch(error){
    console.error(error);
    button.disabled = false;
    setNotice('error', 'Taslak silinemedi. Tekrar dene.');
  }
}

function itemRow(text, d, field, index){
  const b = h('button', { class: 'acc-text-button', type: 'button', 'aria-label': `${text} kaldır` }, 'Kaldır');
  b.addEventListener('click', () => removeItem(d, field, index, b));
  return h('li', {}, h('span', {}, text), b);
}

function draftCard(d){
  const ok = receivers(d);
  const skipped = d.uids.filter((u) => !ok.includes(u));
  const items = [
    ...d.topics.map((t, i) => itemRow(`${t.level} · ${names.topics[topicKey(t)] || t.topic} · konunun tamamı`, d, 'topics', i)),
    ...d.exercises.map((e, i) => itemRow(exerciseLabel(e), d, 'exercises', i)),
    ...d.links.map((l, i) => itemRow(`${(l.kind || 'web').toUpperCase()} · ${linkLabel(l)}`, d, 'links', i))
  ];
  const empty = draftEmpty(d);
  const check = h('input', { type: 'checkbox', name: 'draft', value: d.id, 'aria-label': `"${d.title}" taslağını seç`, disabled: empty || !ok.length });
  check.addEventListener('change', updateSelected);
  const approve = h('button', { class: 'btn primary', type: 'button', disabled: empty || !ok.length }, 'Onayla ve gönder');
  approve.addEventListener('click', () => approveDrafts([d]));
  const remove = h('button', { class: 'acc-text-button', type: 'button' }, 'Sil');
  remove.addEventListener('click', () => removeDraft(d, remove));
  return h('article', { class: 'odev-draft', id: `taslak-${d.id}` },
    check,
    h('div', { class: 'odev-draft-main' },
      h('div', {},
        h('h3', {}, d.title || 'Başlıksız taslak'),
        h('p', { class: 'odev-meta' }, [
          `Öğrenci: ${d.uids.map(studentName).join(', ') || '—'}`,
          d.due ? `Teslim: ${fmtDate(d.due)}` : 'Teslim tarihi yok',
          d.source === 'ders-defteri' ? 'Ders defterinden' : null,
          d.updated ? `Güncellendi: ${fmtDate(d.updated)}` : null
        ].filter(Boolean).join(' · ')),
        skipped.length ? h('p', { class: 'acc-status error' }, `Hesabı kapalı, ödev verilmez: ${skipped.map(studentName).join(', ')}`) : null),
      d.description ? h('p', { class: 'odev-text' }, d.description) : null,
      items.length ? h('ul', { class: 'odev-draft-items', 'aria-label': 'Taslaktaki öğeler' }, items) : null,
      empty ? h('p', { class: 'acc-hint' }, 'Taslak boş: onaylamak için öğe ekle.') : null,
      h('div', { class: 'odev-draft-actions' },
        approve,
        h('a', { class: 'btn ghost', href: `ogretmen-odev.html?taslak=${encodeURIComponent(d.id)}` }, 'Düzenle / öğe ekle'),
        d.noteId && d.uids.length ? h('a', { class: 'ba-link', href: `ogretmen-ders.html?ogrenci=${encodeURIComponent(d.uids[0])}&not=${encodeURIComponent(d.noteId)}` }, 'Ders notunu aç') : null,
        remove)));
}

function render(){
  const list = $('draftList');
  list.replaceChildren(...(drafts.length
    ? drafts.map(draftCard)
    : [h('p', { class: 'acc-empty' }, 'Taslak yok. Ödev formunda "Taslak kaydet" ile taslak hazırlayabilirsin.')]));
  $('draftAllRow').hidden = !drafts.length;
  $('approveBar').hidden = !drafts.length;
  updateSelected();
}

function selectedDrafts(){
  const ids = new Set([...document.querySelectorAll('input[name="draft"]:checked')].map((i) => i.value));
  return drafts.filter((d) => ids.has(d.id));
}

function updateSelected(){
  const n = selectedDrafts().length;
  $('draftSelected').textContent = String(n);
  $('approveSelected').disabled = !n;
  const boxes = [...document.querySelectorAll('input[name="draft"]:not(:disabled)')];
  $('draftAll').checked = boxes.length > 0 && boxes.every((b) => b.checked);
}

let approving = false;
async function approveDrafts(list){
  if(approving || !list.length) return;
  const count = list.reduce((sum, d) => sum + receivers(d).length, 0);
  if(!confirm(`${list.length} taslak onaylanıp ${count} öğrenciye ödev olarak verilsin mi?${mailConfigured && $('draftNotify').checked ? ' Öğrencilere e-posta gider.' : ''}`)) return;
  approving = true;
  document.querySelectorAll('#draftApp button').forEach((b) => { b.disabled = true; });
  const status = $('approveStatus');
  // Kütüphaneden eklenen gizli PDF'ler önce paylaşılır; paylaşılamazsa hiçbir taslak onaylanmaz.
  const toShare = [...new Set(list.flatMap((d) => unsharedIn(d.links, library)))];
  if(toShare.length){
    setStatus(status, '', 'Kütüphane PDF\'leri paylaşılıyor…');
    try{
      await shareItems(toShare);
    }catch(error){
      console.error(error);
      approving = false;
      render();
      setStatus(status, 'error', `PDF paylaşılamadı, taslaklar onaylanmadı: ${error.message} Tekrar dene.`);
      return;
    }
  }
  setStatus(status, '', 'Onaylanıyor…');
  const copies = [];
  const failed = [];
  for(const d of list){
    try{
      copies.push(...await approveDraft(d.id, receivers(d), draftData(d)));
    }catch(error){
      console.error(error);
      failed.push(d);
    }
  }
  if(mailConfigured && $('draftNotify').checked && copies.length){
    setStatus(status, '', 'Ödevler verildi. E-postalar gönderiliyor…');
    rememberResult(await notifyHomework('new', copies));
  }
  approving = false;
  if(!failed.length){
    location.href = 'ogretmen-odevler.html?durum=verildi';
    return;
  }
  // Bir kısmı onaylanamadı: liste yenilenir, onaylananlar listeden çıkar.
  drafts = (await loadDrafts().catch(() => drafts));
  render();
  setStatus(status, 'error', `Onaylanamadı: ${failed.map((d) => `"${d.title}"`).join(', ')}. ${copies.length ? 'Diğerleri verildi. ' : ''}Tekrar dene.`);
}

const user = await requireTeacher({ loadingId: 'draftLoading', errorId: 'draftError' });
if(user){
  try{
    const [list, students, lib] = await Promise.all([loadDrafts(), listStudents(), loadLibrary().catch((error) => { console.warn(error); return []; })]);
    library = lib;
    drafts = list;
    studentsById = new Map(students.map((s) => [s.id, s]));
    await loadNames();
    render();
    if(new URLSearchParams(location.search).get('durum') === 'kaydedildi') setNotice('success', 'Taslak kaydedildi. Öğrenci görmez; onaylayınca verilir.');
    if(!mailConfigured) $('draftNotifyRow').hidden = true;
    $('draftAll').addEventListener('change', () => {
      document.querySelectorAll('input[name="draft"]:not(:disabled)').forEach((b) => { b.checked = $('draftAll').checked; });
      updateSelected();
    });
    $('approveSelected').addEventListener('click', () => approveDrafts(selectedDrafts()));
    $('draftLoading').hidden = true;
    $('draftApp').hidden = false;
    if(location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center' });
  }catch(error){
    console.error(error);
    $('draftLoading').hidden = true;
    $('draftError').hidden = false;
    $('draftError').textContent = 'Taslaklar yüklenemedi. Tekrar dene.';
  }
}
