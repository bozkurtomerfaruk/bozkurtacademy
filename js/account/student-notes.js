// ders-notlarim.html: öğrencinin ders notları (TR/DE/EN, hitap "du"). Liste: en yeni gün üstte.
// ?not=<id>: not salt okunur ve CANLI açılır (onSnapshot): öğretmen yazdıkça ekranda güncellenir.
// İçerik gösterilmeden önce izin listesinden geçer (note-format.js → sanitizeOps) ve Quill'in salt okunur
// görünümüyle çizilir; HTML hiç doğrudan eklenmez. Öğrenci yazamaz (firestore.rules).
import { configured, fs } from './firebase.js';
import { TEACHER_UID } from './config.js';
import { registerStrings, t, lang } from './i18n.js';
import { $, accountState, clearHint, currentUser, h, loadProfile, setHint, syncLang } from './common.js';
import { parseContent, defaultTitle } from './note-format.js?v=1';
import { createNoteQuill, setContents, setupNoteSize } from './note-editor.js?v=1';
import { isLive, loadNotes, noteRef } from './lesson-notes.js?v=1';
import { toDate } from './common.js';

registerStrings();

const noteId = new URLSearchParams(location.search).get('not') || '';
let uid = null;
let notes = [];
let current = null;
let viewer = null;
let liveTimer = null;

const locale = () => ({ tr: 'tr-TR', de: 'de-DE', en: 'en-GB' }[lang()] || 'tr-TR');
const fmtDay = (key) => {
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(key || '');
  if(!m) return '';
  return new Intl.DateTimeFormat(locale(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])));
};
const fmtTime = (d) => d ? new Intl.DateTimeFormat(locale(), { timeZone: 'Europe/Berlin', dateStyle: 'medium', timeStyle: 'short' }).format(d) : '';

function done(id){
  $('notesLoading').hidden = true;
  if(id) $(id).hidden = false;
}

function renderList(){
  $('notesCount').textContent = notes.length ? t('notesCount').replace('{n}', String(notes.length)) : '';
  $('notesList').replaceChildren(...(notes.length
    ? notes.map((n) => h('li', {},
      h('a', { class: 'note-list-item', href: `ders-notlarim.html?not=${encodeURIComponent(n.id)}` },
        h('span', { class: 'note-list-title' }, n.title || defaultTitle(n.day)),
        h('span', { class: 'note-list-meta' }, fmtDay(n.day)),
        isLive(n) ? h('span', { class: 'note-live' }, t('notesLive')) : null)))
    : [h('li', { class: 'acc-empty' }, t('notesEmpty'))]));
}

function renderMeta(){
  if(!current) return;
  $('noteHeading').textContent = current.title || defaultTitle(current.day);
  document.title = `${current.title || defaultTitle(current.day)} | Bozkurt Academy`;
  const updated = toDate(current.updatedAt);
  $('noteMeta').textContent = [fmtDay(current.day), updated ? `${t('notesUpdated')}: ${fmtTime(updated)}` : ''].filter(Boolean).join(' · ');
  const live = isLive({ updatedAt: updated });
  $('noteLive').hidden = !live;
  $('liveHint').hidden = !live;
}

function openNote(){
  $('notesBackLink').href = 'ders-notlarim.html';
  $('notesBackLink').dataset.i18n = 'notesListBack';
  $('notesBackLink').textContent = t('notesListBack');
  viewer = createNoteQuill($('viewer'), { readOnly: true });
  viewer.root.setAttribute('aria-readonly', 'true');
  viewer.root.removeAttribute('contenteditable');
  viewer.root.setAttribute('tabindex', '0');
  setupNoteSize($('noteCard'), $('sizeDown'), $('sizeUp'), $('sizeLabel'));
  $('printBtn').addEventListener('click', () => window.print());
  let first = true;
  let lastContent = null;
  // includeMetadataChanges: bağlantı kopunca "önbellekten" bilgisi gelir → "bağlantı yok" uyarısı.
  fs.onSnapshot(noteRef(uid, noteId), { includeMetadataChanges: true }, (snap) => {
    $('offlineHint').hidden = navigator.onLine !== false;
    if(!snap.exists()){
      if(snap.metadata.fromCache && first) return; // sunucunun cevabını bekle
      current = null;
      $('noteMissing').hidden = false;
      $('noteLive').hidden = true;
      $('liveHint').hidden = true;
      setContents(viewer, []);
      if(first){ first = false; done('noteView'); }
      return;
    }
    $('noteMissing').hidden = true;
    current = { id: snap.id, ...snap.data() };
    if(current.content !== lastContent){
      lastContent = current.content;
      setContents(viewer, parseContent(current.content));
    }
    renderMeta();
    if(first){ first = false; done('noteView'); }
  }, (error) => {
    console.error(error);
    done('notesError');
  });
  // "Canlı" rozeti zamanla kendiliğinden kalkar.
  liveTimer = setInterval(renderMeta, 30000);
  const offline = () => { $('offlineHint').hidden = navigator.onLine !== false; };
  window.addEventListener('online', offline);
  window.addEventListener('offline', offline);
}

async function start(){
  const user = await currentUser();
  if(!user){
    clearHint();
    location.replace('giris.html');
    return;
  }
  if(user.uid === TEACHER_UID){
    location.replace('ogretmen.html');
    return;
  }
  try{
    const profile = await loadProfile(user.uid);
    if(!profile){
      location.replace('kayit.html');
      return;
    }
    setHint('student');
    uid = user.uid;
    syncLang(uid, profile, lang());
    if(accountState(profile) !== 'active') return done('notesInactive');
    if(noteId){
      openNote();
    }else{
      notes = await loadNotes(uid);
      renderList();
      done('notesListView');
    }
  }catch(error){
    console.error(error);
    done('notesError');
  }
}

window.addEventListener('ba:languagechange', () => {
  if(!uid) return;
  if(noteId){ renderMeta(); $('notesBackLink').textContent = t('notesListBack'); }
  else renderList();
});

if(!configured){
  $('notConfigured').hidden = false;
  $('notesLoading').hidden = true;
}else{
  start();
}
