// ogretmen-ders.html: ders defteri (öğretmen). ?ogrenci=<uid>[&not=<id>][&ders=<lessonId>]
//  - ?not yoksa yeni sayfa; ?ders varsa ve o derse bağlı not varsa o açılır, yoksa yeni sayfa o derse bağlanır.
//  - Otomatik kayıt: js/account/autosave.js (1,5 sn / en geç 10 sn / en az 2 sn arayla). Her değişiklik önce bu
//    tarayıcıya yedeklenir (localStorage), sunucu onaylayınca yedek silinir: sekme kapansa ya da bağlantı kopsa da
//    kayıt kaybolmaz.
//  - Aynı cihazda ikinci sekme salt okunur açılır (BroadcastChannel). Başka bir cihazda değişmiş notun üzerine yazmadan
//    önce sorulur (rev).
//  - Öğrenci aynı belgeyi ders-notlarim.html'de canlı ve salt okunur görür.
import { db, fs } from './firebase.js';
import { $, berlinParts, h, loadProfile, todayKey, toDate } from './common.js';
import { requireTeacher } from './teacher-common.js';
import { createAutosave } from './autosave.js?v=1';
import { COLOR_NAMES, MAX_BYTES, NOTE_COLORS, NOTE_HIGHLIGHTS, cleanTitle, defaultTitle, noteBytes, parseContent, safeUrl, sizeLevel } from './note-format.js?v=1';
import { createNoteQuill, getOps, setContents, setupNoteSize } from './note-editor.js?v=1';
import { deleteNote, findNoteForLesson, loadNote, newNoteId, noteRef, noteUrl, readBackup, removeBackup, writeBackup } from './lesson-notes.js?v=1';

const params = new URLSearchParams(location.search);
const uid = params.get('ogrenci') || '';
let noteId = params.get('not') || '';
const lessonParam = params.get('ders') || '';

let quill = null;
let autosave = null;
let exists = false;      // belge sunucuda var mı (ilk kayıttan sonra true)
let rev = 0;             // sunucudaki son bilinen sürüm
let remoteChecked = false;
let day = todayKey();
let lessonId = null;
let studentName = '';
let readOnly = false;
let savedOnce = false;
let offlineTimer = null;
const tabId = Math.random().toString(36).slice(2);

const fmtTime = (d) => new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' }).format(d);
const fmtKb = (bytes) => `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('tr-TR')} KB`;
const currentTitle = () => cleanTitle($('noteTitle').value, day);

function fail(message){
  $('noteLoading').hidden = true;
  $('noteApp').hidden = true;
  $('noteError').hidden = false;
  $('noteError').textContent = message;
}

// ---- Durum satırı ----
function showState(state, info){
  const el = $('saveState');
  let text = 'Kaydedildi ✓', kind = 'saved';
  const offline = navigator.onLine === false;
  if(readOnly){ text = 'Salt okunur'; kind = 'readonly'; }
  else if(state === 'saved'){ text = savedOnce ? `Kaydedildi ✓ ${fmtTime(new Date())}` : 'Kaydedildi ✓'; kind = 'saved'; }
  else if(state === 'error' && info?.code === 'too-large'){ text = 'Not çok büyük, kaydedilemedi'; kind = 'error'; }
  else if(state === 'error' && info?.code === 'conflict'){ text = 'Kayıt durdu'; kind = 'error'; }
  else if(state === 'error' && info?.code === 'deleted'){ text = 'Not silinmiş, kaydedilmedi'; kind = 'error'; }
  else if(offline || (state === 'error' && isOfflineError(info))){ text = 'Bağlantı yok, bağlantı gelince kaydedilecek'; kind = 'offline'; }
  else if(state === 'error'){ text = 'Kaydedilemedi, tekrar deneniyor…'; kind = 'error'; }
  else { text = 'Kaydediliyor…'; kind = 'saving'; }
  el.textContent = text;
  el.dataset.state = kind;
  // Kayıt 5 sn içinde onaylanmazsa bağlantı yok sayılır (Firestore çevrimdışıyken yazmayı bekletir).
  clearTimeout(offlineTimer);
  if(state === 'saving') offlineTimer = setTimeout(() => {
    if(autosave?.saving){ el.textContent = 'Bağlantı yok, bağlantı gelince kaydedilecek'; el.dataset.state = 'offline'; }
  }, 5000);
}

const isOfflineError = (e) => ['unavailable', 'deadline-exceeded', 'failed-precondition'].includes(e?.code) || /offline/i.test(String(e?.message || ''));

function showSize(bytes){
  const level = sizeLevel(bytes);
  $('sizeInfo').textContent = `Boyut: ${fmtKb(bytes)} / ${fmtKb(MAX_BYTES)}`;
  $('sizeInfo').dataset.level = level;
  const warn = $('sizeWarn');
  warn.hidden = level === 'ok';
  warn.classList.toggle('error', level !== 'warn');
  if(level === 'warn') warn.textContent = `Not büyüyor (${fmtKb(bytes)}). Bir sayfa en çok yaklaşık ${fmtKb(MAX_BYTES)} olabilir; uzun dersleri "Yeni sayfa" ile bölebilirsin.`;
  if(level === 'danger') warn.textContent = `Not sınıra çok yakın (${fmtKb(bytes)}). Devam etmek için "Yeni sayfa" aç.`;
  if(level === 'over') warn.textContent = `Not ${fmtKb(MAX_BYTES)} sınırını geçti ve sunucuya kaydedilmiyor. Son değişiklikler bu tarayıcıda yedekli; biraz sil ya da "Yeni sayfa" aç.`;
}

// ---- Kayıt ----
function snapshot(){
  const ops = getOps(quill);
  const content = JSON.stringify({ ops });
  const title = currentTitle();
  return { ops, content, title, bytes: noteBytes(title, content) };
}

function backupNow(){
  if(!quill || readOnly) return;
  const { ops, title } = snapshot();
  writeBackup(uid, noteId, { ops, title, baseRev: rev, day, lessonId });
}

let backupTimer = null;
function scheduleBackup(){
  clearTimeout(backupTimer);
  backupTimer = setTimeout(backupNow, 600);
}

const timeout = (promise, ms) => Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('timeout'), { code: 'timeout' })), ms))]);

async function save(){
  const snap = snapshot();
  showSize(snap.bytes);
  if(snap.bytes > MAX_BYTES) throw Object.assign(new Error('Not çok büyük'), { code: 'too-large', retry: false });
  const ref = noteRef(uid, noteId);
  // Oturumun ilk kaydı: başka bir cihaz bu arada değiştirdiyse üzerine yazma.
  if(exists && !remoteChecked){
    try{
      const remote = await timeout(fs.getDocFromServer(ref), 4000);
      remoteChecked = true;
      if(!remote.exists()) throw Object.assign(new Error('silinmiş'), { code: 'deleted', retry: false });
      if((remote.data().rev || 0) > rev) throw Object.assign(new Error('çakışma'), { code: 'conflict', retry: false, remoteRev: remote.data().rev });
    }catch(error){
      if(error.code === 'conflict' || error.code === 'deleted'){
        if(error.code === 'conflict') showConflict();
        throw error;
      }
      // Çevrimdışı: kontrol bağlantı gelince yapılır; yazma Firestore kuyruğunda bekler.
    }
  }
  const next = rev + 1;
  const data = { title: snap.title, content: snap.content, bytes: snap.bytes, rev: next, updatedAt: fs.serverTimestamp() };
  if(!exists){
    await fs.setDoc(ref, { ...data, day, lessonId, createdAt: fs.serverTimestamp() });
    exists = true;
    remoteChecked = true;
    history.replaceState(null, '', noteUrl(uid, noteId));
  }else{
    await fs.updateDoc(ref, data);
  }
  rev = next;
  savedOnce = true;
  if(!autosave.dirty) removeBackup(uid, noteId);
}

function showConflict(){
  $('conflictBanner').hidden = false;
}

// Belgenin sonu tablo olursa altına yazmak için imleç tablodan çıkamaz: sona her zaman boş bir satır bırak.
function keepLineAfterTable(){
  const end = quill.getLength() - 1;
  const [line] = quill.getLine(end);
  if(line?.statics?.blotName !== 'table') return;
  // Son hücrenin satır sonunu çoğalt, en sondakini düz satıra çevir.
  const Delta = window.Quill.import('delta');
  const sel = quill.getSelection();
  quill.updateContents(new Delta().retain(end).insert('\n', { table: line.formats().table }).retain(1, { table: null }), 'api');
  if(sel) quill.setSelection(sel, 'silent');
}

function onChange(){
  if(readOnly) return;
  scheduleBackup();
  autosave.change();
}

// ---- Araç çubuğu ----
function swatches(listId, format, values){
  const list = $(listId);
  const items = [h('button', { class: 'note-swatch note-swatch-none', type: 'button', 'data-format': format, 'data-value': '', 'aria-label': 'Renksiz', title: 'Renksiz' }, '×'),
    ...values.map((v) => h('button', { class: `note-swatch ${format === 'color' ? 'ba-c-' : 'ba-bg-'}${v}`, type: 'button', 'data-format': format, 'data-value': v, 'aria-label': COLOR_NAMES[v], title: COLOR_NAMES[v] }, format === 'color' ? 'A' : ''))];
  list.replaceChildren(...items);
}

function updateToolbar(){
  if(!quill) return;
  const range = quill.getSelection();
  const f = range ? quill.getFormat(range) : {};
  for(const b of $('noteToolbar').querySelectorAll('button[data-format]')){
    const name = b.dataset.format;
    if(b.closest('.note-swatches')){
      b.setAttribute('aria-pressed', String((f[name] || '') === b.dataset.value));
      continue;
    }
    const value = b.dataset.value;
    const on = value ? String(f[name]) === value : Boolean(f[name]);
    b.setAttribute('aria-pressed', String(on));
  }
  $('noteToolbar').querySelector('[data-action="link"]').setAttribute('aria-pressed', String(Boolean(f.link)));
  $('colorSample').className = `note-swatch-a${f.color ? ' ba-c-' + f.color : ''}`;
  const inTable = Boolean(f.table);
  for(const b of document.querySelectorAll('[data-needs-table]')) b.disabled = !inTable || readOnly;
  $('tableHint').hidden = inTable;
}

function applyFormat(name, value){
  if(readOnly) return;
  const range = quill.getSelection(true);
  const f = quill.getFormat(range);
  if(name === 'header' || name === 'list'){
    const v = name === 'header' ? Number(value) : value;
    quill.format(name, f[name] === v ? false : v, 'user');
  }else if(name === 'color' || name === 'background'){
    quill.format(name, value || false, 'user');
  }else{
    quill.format(name, !f[name], 'user');
  }
  updateToolbar();
}

function tableAction(action){
  if(readOnly) return;
  const table = quill.getModule('table');
  quill.focus();
  if(action === 'insertTable'){
    const rows = Math.min(30, Math.max(1, Number($('tableRows').value) || 3));
    const cols = Math.min(10, Math.max(1, Number($('tableCols').value) || 3));
    if(quill.getFormat().table){ alert('Tablonun içine tablo eklenemez. İmleci tablonun dışına koy.'); return; }
    table.insertTable(rows, cols);
  }else{
    table[action]?.();
  }
  $('tableMenu').open = false;
  updateToolbar();
}

// Bağlantı penceresi: seçili metne bağlantı ekler; seçim yoksa adres metin olarak eklenir.
let linkRange = null;
function openLink(){
  if(readOnly) return;
  linkRange = quill.getSelection(true);
  const f = quill.getFormat(linkRange);
  $('linkUrl').value = f.link || '';
  $('linkError').hidden = true;
  $('linkRemove').hidden = !f.link;
  $('linkDialog').showModal();
  $('linkUrl').focus();
}

function saveLink(event){
  event.preventDefault();
  const url = safeUrl($('linkUrl').value);
  if(!url){ $('linkError').hidden = false; $('linkUrl').focus(); return; }
  $('linkDialog').close();
  const range = linkRange || { index: quill.getLength() - 1, length: 0 };
  if(range.length === 0){
    const f = quill.getFormat(range);
    if(f.link){
      const [leaf, offset] = quill.getLeaf(range.index);
      const start = range.index - offset;
      quill.formatText(start, leaf.length(), 'link', url, 'user');
    }else{
      quill.insertText(range.index, url, { link: url }, 'user');
      quill.setSelection(range.index + url.length, 0, 'silent');
    }
  }else{
    quill.formatText(range.index, range.length, 'link', url, 'user');
  }
  quill.focus();
}

function removeLink(){
  $('linkDialog').close();
  const range = linkRange;
  if(!range) return;
  if(range.length) quill.formatText(range.index, range.length, 'link', false, 'user');
  else{
    const [leaf, offset] = quill.getLeaf(range.index);
    quill.formatText(range.index - offset, leaf.length(), 'link', false, 'user');
  }
  quill.focus();
}

function setupToolbar(){
  swatches('colorList', 'color', NOTE_COLORS);
  swatches('highlightList', 'background', NOTE_HIGHLIGHTS);
  const bar = $('noteToolbar');
  // Fareyle tıklayınca editördeki seçim kaybolmasın.
  bar.addEventListener('mousedown', (e) => { if(e.target.closest('button, summary')) e.preventDefault(); });
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if(!b || b.disabled) return;
    if(b.dataset.format){
      applyFormat(b.dataset.format, b.dataset.value);
      b.closest('details')?.removeAttribute('open');
    }else if(b.dataset.action === 'undo'){ quill.history.undo(); updateToolbar(); }
    else if(b.dataset.action === 'redo'){ quill.history.redo(); updateToolbar(); }
    else if(b.dataset.action === 'link') openLink();
    else if(b.dataset.table) tableAction(b.dataset.table);
  });
  // Açılan menülerden biri açılınca diğerleri kapanır; dışarı tıklayınca ya da Esc ile kapanır.
  const menus = [...bar.querySelectorAll('details')];
  for(const m of menus) m.addEventListener('toggle', () => { if(m.open) menus.filter((x) => x !== m).forEach((x) => { x.open = false; }); updateToolbar(); });
  document.addEventListener('click', (e) => { for(const m of menus) if(m.open && !m.contains(e.target)) m.open = false; });
  document.addEventListener('keydown', (e) => {
    if(e.key !== 'Escape') return;
    const open = menus.find((m) => m.open);
    if(open){ open.open = false; open.querySelector('summary').focus(); }
  });
  $('linkForm').addEventListener('submit', saveLink);
  $('linkCancel').addEventListener('click', () => { $('linkDialog').close(); quill.focus(); });
  $('linkRemove').addEventListener('click', removeLink);
}

// ---- Görünüm: tam ekran, yazdır, sil, yeni sayfa ----
function setupView(){
  setupNoteSize($('noteCard'), $('sizeDown'), $('sizeUp'), $('sizeLabel'));
  const card = $('noteCard');
  const full = $('fullBtn');
  const isFull = () => document.fullscreenElement === card || document.body.classList.contains('note-fullscreen');
  const label = () => { full.textContent = isFull() ? 'Tam ekrandan çık' : 'Tam ekran'; full.setAttribute('aria-pressed', String(isFull())); };
  full.addEventListener('click', async () => {
    if(isFull()){
      if(document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      document.body.classList.remove('note-fullscreen');
    }else if(card.requestFullscreen && document.fullscreenEnabled){
      await card.requestFullscreen().catch(() => document.body.classList.add('note-fullscreen'));
    }else{
      document.body.classList.add('note-fullscreen'); // iPhone Safari: tam ekran API'si yok, sayfayı kaplar.
    }
    label();
    quill.focus();
  });
  document.addEventListener('fullscreenchange', label);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && document.body.classList.contains('note-fullscreen') && !document.querySelector('details[open], dialog[open]')){ document.body.classList.remove('note-fullscreen'); label(); } });
  $('printBtn').addEventListener('click', async () => {
    await autosave.flush();
    window.print();
  });
  $('newPageLink').href = noteUrl(uid, null);
  $('newPageLink').addEventListener('click', () => { backupNow(); autosave.flush(); });
  $('deleteBtn').addEventListener('click', async () => {
    if(!confirm(`"${currentTitle()}" silinsin mi? Öğrenci de artık göremez. Bu geri alınamaz.`)) return;
    autosave.stop();
    readOnly = true;
    try{
      if(exists) await deleteNote(uid, noteId);
      removeBackup(uid, noteId);
      location.replace(`ogretmen-ogrenci.html?id=${encodeURIComponent(uid)}#ders-notlari`);
    }catch(error){
      console.error(error);
      readOnly = false;
      autosave.resume();
      alert('Not silinemedi. Bağlantını kontrol edip tekrar dene.');
    }
  });
}

function setReadOnly(value){
  readOnly = value;
  quill.enable(!value);
  $('noteTitle').readOnly = value;
  for(const b of $('noteToolbar').querySelectorAll('button, summary')) b.toggleAttribute('disabled', value);
  $('deleteBtn').disabled = value;
  showState(autosave?.state || 'saved');
}

// ---- Aynı cihazda ikinci sekme ----
let channel = null;
function setupTabLock(){
  if(!('BroadcastChannel' in window)) return Promise.resolve();
  channel = new BroadcastChannel('baDersDefteri');
  const key = `${uid}/${noteId}`;
  channel.addEventListener('message', async (e) => {
    const m = e.data || {};
    if(m.key !== key || m.tab === tabId) return;
    if(m.t === 'hello' && !readOnly) channel.postMessage({ t: 'busy', key, tab: tabId });
    if(m.t === 'takeover' && !readOnly){
      backupNow();
      await Promise.race([autosave.flush(), new Promise((r) => setTimeout(r, 8000))]);
      const { ops, title } = snapshot();
      autosave.stop();
      setReadOnly(true);
      $('tabBanner').hidden = false;
      channel.postMessage({ t: 'released', key, tab: tabId, to: m.tab, ops, title, rev, exists, pending: autosave.pending });
    }
    if(m.t === 'released' && m.to === tabId){
      setContents(quill, m.ops);
      $('noteTitle').value = m.title;
      $('noteTitle').dispatchEvent(new Event('ba:fit'));
      rev = m.rev;
      exists = m.exists;
      remoteChecked = !m.pending;
      $('tabBanner').hidden = true;
      setReadOnly(false);
      autosave.resume();
      if(m.pending) autosave.change();
      quill.focus();
    }
  });
  $('tabTakeover').addEventListener('click', () => channel.postMessage({ t: 'takeover', key, tab: tabId }));
  return new Promise((resolve) => {
    const onBusy = (e) => {
      if(e.data?.key === key && e.data.t === 'busy'){
        channel.removeEventListener('message', onBusy);
        autosave.stop();
        setReadOnly(true);
        $('tabBanner').hidden = false;
        resolve();
      }
    };
    channel.addEventListener('message', onBusy);
    channel.postMessage({ t: 'hello', key, tab: tabId });
    setTimeout(() => { channel.removeEventListener('message', onBusy); resolve(); }, 300);
  });
}

// ---- Yerel yedek ----
function offerBackup(note){
  const backup = readBackup(uid, noteId);
  if(!backup) return;
  const serverOps = note ? JSON.stringify(parseContent(note.content)) : JSON.stringify(parseContent(''));
  const same = JSON.stringify(backup.ops) === serverOps && (!note || backup.title === note.title);
  if(same){ removeBackup(uid, noteId); return; }
  $('backupText').textContent = `Bu tarayıcıda kaydedilmemiş değişiklikler bulundu (${new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Berlin', dateStyle: 'short', timeStyle: 'short' }).format(new Date(backup.at))}). Geri yüklersen sunucuya kaydedilir.`;
  $('backupBanner').hidden = false;
  $('backupRestore').onclick = () => {
    setContents(quill, backup.ops);
    if(backup.title){ $('noteTitle').value = backup.title; $('noteTitle').dispatchEvent(new Event('ba:fit')); }
    $('backupBanner').hidden = true;
    autosave.change();
    autosave.flush();
  };
  $('backupDiscard').onclick = () => {
    if(!confirm('Kaydedilmemiş değişiklikler silinsin mi?')) return;
    removeBackup(uid, noteId);
    $('backupBanner').hidden = true;
  };
}

async function lessonDay(id){
  const snap = await fs.getDoc(fs.doc(db, 'users', uid, 'lessons', id)).catch(() => null);
  const start = snap?.exists() ? toDate(snap.data().startAt) : null;
  return start ? berlinParts(start).key : null;
}

async function start(){
  const user = await requireTeacher({ loadingId: 'noteLoading', errorId: 'noteError' });
  if(!user) return;
  if(!uid) return fail('Öğrenci seçilmedi. Öğretmen panelinden bir öğrenci aç.');
  const student = await loadProfile(uid);
  if(!student) return fail('Öğrenci bulunamadı. Silinmiş olabilir.');
  studentName = student.name || '';
  $('backLink').href = `ogretmen-ogrenci.html?id=${encodeURIComponent(uid)}#ders-notlari`;
  $('backLink').textContent = `← ${studentName || 'Öğrenci'}`;
  $('noteEyebrow').textContent = `Ders defteri · ${studentName}`;

  let note = null;
  if(!noteId && lessonParam){
    const linked = await findNoteForLesson(uid, lessonParam);
    if(linked){ note = linked; noteId = linked.id; }
  }
  if(noteId && !note){
    note = await loadNote(uid, noteId);
    if(!note && !readBackup(uid, noteId)) return fail('Not bulunamadı. Silinmiş olabilir.');
  }
  if(note){
    exists = true;
    rev = Number(note.rev) || 0;
    day = note.day || day;
    lessonId = note.lessonId || null;
  }else{
    const backup = noteId ? readBackup(uid, noteId) : null;
    if(!noteId) noteId = newNoteId(uid);
    lessonId = backup?.lessonId || lessonParam || null;
    day = backup?.day || (lessonId ? await lessonDay(lessonId) : null) || todayKey();
  }
  history.replaceState(null, '', noteUrl(uid, noteId, !exists && lessonId ? { ders: lessonId } : {}));
  document.title = `${note?.title || defaultTitle(day)} · ${studentName} | Bozkurt Academy`;

  $('noteLoading').hidden = true;
  $('noteApp').hidden = false;
  quill = createNoteQuill($('editor'), { placeholder: 'Derse buradan başla…' });
  quill.root.setAttribute('aria-label', 'Ders notu');
  quill.root.setAttribute('aria-multiline', 'true');
  quill.root.setAttribute('role', 'textbox');
  setContents(quill, note ? parseContent(note.content) : []);
  quill.history.clear();
  $('noteTitle').value = note?.title || defaultTitle(day);
  $('notePrintMeta').textContent = [studentName, defaultTitle(day).replace(' – Ders', '')].filter(Boolean).join(' · ');
  showSize(snapshot().bytes);

  autosave = createAutosave({ save, onState: showState });
  window.__baNoteAutosave = autosave; // testler için (tests/ders-defteri-account.mjs)
  quill.on('text-change', (delta, old, source) => {
    if(source !== 'user') return;
    keepLineAfterTable();
    onChange();
  });
  quill.on('editor-change', updateToolbar);
  quill.keyboard.addBinding({ key: 'K', shortKey: true }, () => { openLink(); return false; });
  const title = $('noteTitle');
  // Başlık kutusu metin kadar uzar (telefonda uzun başlık alt satıra geçer).
  const fit = () => { title.style.height = 'auto'; title.style.height = `${title.scrollHeight}px`; };
  fit();
  window.addEventListener('resize', fit);
  title.addEventListener('ba:fit', fit);
  document.fonts?.ready.then(fit);
  title.addEventListener('input', () => { fit(); onChange(); });
  title.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); quill.focus(); } });
  title.addEventListener('change', () => {
    title.value = currentTitle();
    fit();
    document.title = `${title.value} · ${studentName} | Bozkurt Academy`;
    autosave.flush();
  });

  setupToolbar();
  setupView();
  updateToolbar();
  showState('saved');

  window.addEventListener('online', () => { showState(autosave.state); autosave.retryNow(); });
  window.addEventListener('offline', () => showState(autosave.state));
  // Sayfadan çıkarken: önce yerel yedek, sonra hemen kayıt. Kaydedilmemiş değişiklik varsa tarayıcı uyarır.
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden' && autosave.pending){ backupNow(); autosave.flush(); } });
  window.addEventListener('pagehide', () => { if(autosave.pending){ backupNow(); autosave.flush(); } });
  window.addEventListener('beforeunload', (e) => { if(autosave.pending && !readOnly){ backupNow(); autosave.flush(); e.preventDefault(); e.returnValue = ''; } });

  $('conflictReload').addEventListener('click', () => { backupNow(); location.reload(); });
  $('conflictKeep').addEventListener('click', async () => {
    try{
      const remote = await fs.getDocFromServer(noteRef(uid, noteId));
      rev = Number(remote.data()?.rev) || rev;
    }catch(error){ console.warn(error); }
    remoteChecked = true;
    $('conflictBanner').hidden = true;
    autosave.change();
    autosave.flush();
  });

  await setupTabLock();
  offerBackup(note);
  if(!readOnly) quill.focus();
}

start().catch((error) => {
  console.error(error);
  fail('Ders defteri açılamadı. Sayfayı yenileyip tekrar dene.');
});
