// ogretmen-kutuphane.html: kaynak kütüphanesi (js/account/library.js). PDF'ler çoklu seçimle ya da sürükle bırak ile
// sıraya alınır; her biri için dosya adından seviye ve konu önerilir (js/account/homework-assistant.js suggestTags),
// öğretmen etiketleri değiştirip "Hepsini yükle"ye basar. Dosyalar sırayla, gizli olarak Drive'a yüklenir.
// Öğrenci bu sayfayı ve library koleksiyonunu göremez.
import { $, h, loadCatalogLevels, localize, setStatus } from './common.js';
import { requireTeacher, fmtDate } from './teacher-common.js';
import * as drive from './drive.js?v=3';
import { buildTopicIndex, suggestTags } from './homework-assistant.js?v=4';
import { addLibraryItem, deleteLibraryItem, LEVELS, libraryUrl, loadLibrary, MAX_TOPICS, updateLibraryItem } from './library.js?v=1';

const MAX_QUEUE = 50;
let levels = [];        // katalog seviyeleri
let topicIndex = [];
let library = [];
const queue = [];       // { key, file, title, level, topics, status, progress, message }
let uploading = false;

const topicTitle = (t) => localize(levels.find((l) => l.id === t.level)?.topics?.find((x) => x.id === t.topic)?.title, 'tr') || t.topic;
const sizeText = (bytes) => (bytes < 1048576
  ? `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('tr-TR')} KB`
  : `${(bytes / 1048576).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MB`);
const sameTopic = (a, b) => a.level === b.level && a.topic === b.topic;

// Etiket düzenleyici: seviye seçimi + konu çipleri (en çok 3) + "konu ekle" listesi. onChange(state) her değişiklikte.
function tagEditor(state, label, onChange){
  const id = `tag-${Math.random().toString(36).slice(2, 9)}`;
  const level = h('select', { id: `${id}-level`, class: 'lib-level' },
    h('option', { value: '' }, 'Seviye yok'), LEVELS.map((l) => h('option', { value: l, selected: state.level === l }, l)));
  const chips = h('ul', { class: 'lib-chips', 'aria-label': `${label}: konular` });
  const add = h('select', { id: `${id}-topic`, class: 'lib-topic' });
  const fill = () => {
    chips.replaceChildren(...state.topics.map((t, i) => {
      const remove = h('button', { class: 'lib-chip-remove', type: 'button', 'aria-label': `${t.level} · ${topicTitle(t)} etiketini kaldır` }, '×');
      remove.addEventListener('click', () => { state.topics.splice(i, 1); fill(); onChange(state); });
      return h('li', { class: 'lib-chip' }, h('span', {}, `${t.level} · ${topicTitle(t)}`), remove);
    }));
    const order = state.level ? [levels.find((l) => l.id === state.level), ...levels.filter((l) => l.id !== state.level)] : levels;
    add.replaceChildren(h('option', { value: '' }, state.topics.length >= MAX_TOPICS ? `En çok ${MAX_TOPICS} konu` : '+ Konu ekle'),
      ...order.filter(Boolean).map((l) => h('optgroup', { label: l.id }, (l.topics || []).filter((t) => t.path)
        .filter((t) => !state.topics.some((x) => sameTopic(x, { level: l.id, topic: t.id })))
        .map((t) => h('option', { value: `${l.id}|${t.id}` }, `${l.id} · ${localize(t.title, 'tr')}`)))));
    add.disabled = state.topics.length >= MAX_TOPICS;
  };
  level.addEventListener('change', () => { state.level = level.value; fill(); onChange(state); });
  add.addEventListener('change', () => {
    const [l, topic] = add.value.split('|');
    if(l && topic && state.topics.length < MAX_TOPICS){
      state.topics.push({ level: l, topic });
      if(!state.level) { state.level = l; level.value = l; }
      fill();
      onChange(state);
    }
  });
  fill();
  return h('div', { class: 'lib-tags' },
    h('div', { class: 'field' }, h('label', { for: `${id}-level` }, 'Seviye'), level),
    h('div', { class: 'field lib-topics' }, h('label', { for: `${id}-topic` }, 'Konu'), chips, add));
}

// Sıra -----------------------------------------------------------------------------------------------------------------

async function enqueue(files){
  const pdfs = [...files];
  if(!pdfs.length) return;
  let skipped = 0;
  for(const file of pdfs){
    if(queue.length >= MAX_QUEUE){ skipped++; continue; }
    // Sırada bekleyen aynı dosya tekrar eklenmez; yüklenmiş olan "zaten kütüphanede" diye görünür.
    if(queue.some((q) => q.status !== 'done' && q.file.name === file.name && q.file.size === file.size)) continue;
    const problem = await drive.checkPdf(file);
    const known = library.find((item) => item.fileName === file.name && item.bytes === file.size);
    const tags = suggestTags(file.name, topicIndex);
    queue.push({
      key: `${file.name}-${file.size}-${queue.length}`, file, title: file.name.replace(/\.pdf$/i, '').slice(0, 120),
      level: tags.level, topics: tags.topics.map(({ level, topic }) => ({ level, topic })), suggested: tags.topics.length > 0 || Boolean(tags.level),
      status: problem || known ? 'error' : 'waiting', progress: 0,
      message: problem || (known ? 'Bu dosya zaten kütüphanede.' : '')
    });
  }
  setStatus($('queueStatus'), skipped ? 'error' : '', skipped ? `Bir seferde en çok ${MAX_QUEUE} dosya; ${skipped} dosya alınmadı.` : '');
  renderQueue();
}

const STATUS = { waiting: 'Bekliyor', uploading: 'Yükleniyor…', done: 'Kütüphanede', error: 'Yüklenmeyecek' };

function renderQueue(){
  $('queueList').replaceChildren(...queue.map((q, i) => {
    const remove = h('button', { class: 'acc-text-button', type: 'button', 'aria-label': `${q.file.name} listeden çıkar`, disabled: uploading || q.status === 'uploading' }, 'Çıkar');
    remove.addEventListener('click', () => { queue.splice(i, 1); renderQueue(); });
    return h('li', { class: `lib-item lib-${q.status}` },
      h('div', { class: 'lib-item-head' },
        h('span', { class: 'lib-name' }, h('strong', {}, q.file.name), h('span', { class: 'acc-sub' }, [sizeText(q.file.size), q.suggested && q.status === 'waiting' ? 'etiketler dosya adından önerildi' : null].filter(Boolean).join(' · '))),
        h('span', { class: `acc-badge ${q.status === 'done' ? 'success' : q.status === 'error' ? 'warning' : 'muted'}` }, STATUS[q.status]),
        q.status === 'done' ? null : remove),
      q.message ? h('p', { class: `acc-hint lib-message` }, q.message) : null,
      q.status === 'uploading' ? h('progress', { class: 'odev-progress', max: '1', value: String(q.progress), 'aria-label': `${q.file.name} yükleniyor` }) : null,
      q.status === 'waiting' ? tagEditor(q, q.file.name, () => {}) : null);
  }));
  const waiting = queue.filter((q) => q.status === 'waiting').length;
  $('queueActions').hidden = !queue.length;
  $('uploadAll').disabled = uploading || !waiting;
  $('uploadAll').textContent = waiting > 1 ? `${waiting} PDF'i yükle` : 'Yükle';
  $('clearQueue').disabled = uploading;
}

async function uploadAll(){
  if(uploading) return;
  const items = queue.filter((q) => q.status === 'waiting');
  if(!items.length) return;
  uploading = true;
  renderQueue();
  try{
    if(!drive.isConnected()){
      setStatus($('queueStatus'), '', 'Google Drive izni isteniyor…');
      await drive.connect();
    }
  }catch(error){
    console.warn(error);
    uploading = false;
    setStatus($('queueStatus'), 'error', `Google Drive'a bağlanılamadı: ${error.message}`);
    renderQueue();
    return;
  }
  let done = 0;
  for(const q of items){
    q.status = 'uploading';
    q.progress = 0;
    setStatus($('queueStatus'), '', `${done + 1}/${items.length}: "${q.file.name}" yükleniyor…`);
    renderQueue();
    try{
      const result = await drive.uploadPdf(q.file, { folderName: drive.LIBRARY_FOLDER, share: false, onProgress: (p) => {
        q.progress = p;
        const bar = document.querySelector('.lib-uploading progress');
        if(bar) bar.value = p;
      } });
      const item = await addLibraryItem({ fileId: result.id, fileName: result.name, title: q.title, level: q.level, topics: q.topics, bytes: q.file.size });
      library.push(item);
      q.status = 'done';
      q.message = '';
      done++;
    }catch(error){
      console.warn(error);
      q.status = 'error';
      q.message = `Yüklenemedi: ${error.message}`;
    }
    renderQueue();
  }
  uploading = false;
  const failed = items.length - done;
  setStatus($('queueStatus'), failed ? 'error' : 'success', failed
    ? `${done} PDF kütüphaneye eklendi, ${failed} PDF yüklenemedi.`
    : `${done} PDF kütüphaneye eklendi (Drive'da gizli).`);
  renderQueue();
  renderLibrary();
}

// Kütüphane listesi ----------------------------------------------------------------------------------------------------

function matches(item){
  const q = $('libSearch').value.trim().toLocaleLowerCase('tr');
  const lv = $('libLevel').value;
  if(lv === '-' && item.level) return false;
  if(lv && lv !== '-' && item.level !== lv) return false;
  if(!q) return true;
  const text = [item.title, item.fileName, ...item.topics.map(topicTitle)].join(' ').toLocaleLowerCase('tr');
  return text.includes(q);
}

const saveTimers = new Map();
function saveTags(item){
  clearTimeout(saveTimers.get(item.id));
  saveTimers.set(item.id, setTimeout(async () => {
    try{
      await updateLibraryItem(item.id, { level: item.level, topics: item.topics.map(({ level, topic }) => ({ level, topic })) });
      setStatus($('libStatus'), 'success', `"${item.title}" etiketleri kaydedildi.`);
    }catch(error){
      console.error(error);
      setStatus($('libStatus'), 'error', 'Etiketler kaydedilemedi. Tekrar dene.');
    }
  }, 400));
}

async function removeItem(item, button){
  if(!confirm(`"${item.title}" kütüphaneden çıkarılsın mı? Dosya Drive'da kalır; daha önce verilen ödev ve kaynaklardaki bağlantı çalışmaya devam eder.`)) return;
  button.disabled = true;
  try{
    await deleteLibraryItem(item.id);
    library = library.filter((x) => x.id !== item.id);
    renderLibrary();
    setStatus($('libStatus'), 'success', `"${item.title}" kütüphaneden çıkarıldı. Dosya Drive'da duruyor.`);
  }catch(error){
    console.error(error);
    button.disabled = false;
    setStatus($('libStatus'), 'error', 'Çıkarılamadı. Tekrar dene.');
  }
}

function renderLibrary(){
  $('libCount').textContent = String(library.length);
  const shown = library.filter(matches);
  $('libList').replaceChildren(...(shown.length ? shown.map((item) => {
    const remove = h('button', { class: 'acc-text-button', type: 'button', 'aria-label': `${item.title} kütüphaneden çıkar` }, 'Çıkar');
    remove.addEventListener('click', () => removeItem(item, remove));
    const open = h('a', { class: 'ba-link', target: '_blank', rel: 'noopener noreferrer' }, "Drive'da aç");
    open.setAttribute('href', libraryUrl(item));
    return h('li', { class: 'lib-item', id: `pdf-${item.id}` },
      h('div', { class: 'lib-item-head' },
        h('span', { class: 'lib-name' }, h('strong', {}, item.title), h('span', { class: 'acc-sub' }, [item.fileName, item.bytes ? sizeText(item.bytes) : null, item.created ? fmtDate(item.created) : null].filter(Boolean).join(' · '))),
        h('span', { class: `acc-badge ${item.shared ? 'success' : 'muted'}`, title: item.shared ? 'Bir ödevde ya da yardımcı kaynakta kullanıldı; bağlantıyla görüntülenebilir.' : 'Henüz hiçbir öğrenciye verilmedi; bağlantıyla açılamaz.' }, item.shared ? 'paylaşıldı' : 'gizli')),
      tagEditor(item, item.title, saveTags),
      h('div', { class: 'lib-actions' }, open, remove));
  }) : [h('li', { class: 'acc-empty' }, library.length ? 'Bu aramaya uyan PDF yok.' : 'Kütüphane boş. Yukarıdan PDF yükle.')]));
}

// Sürükle bırak ---------------------------------------------------------------------------------------------------------

function setupDrop(){
  const zone = $('libDrop');
  const isFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
  // Bölgenin dışına bırakılan dosya tarayıcıda açılıp sayfadan çıkılmasın.
  for(const type of ['dragover', 'drop']) window.addEventListener(type, (e) => { if(isFiles(e)) e.preventDefault(); });
  zone.addEventListener('dragover', (e) => { if(!isFiles(e)) return; e.preventDefault(); zone.classList.add('is-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
  zone.addEventListener('drop', (e) => {
    if(!isFiles(e)) return;
    e.preventDefault();
    zone.classList.remove('is-over');
    if(uploading) return;
    enqueue(e.dataTransfer.files);
  });
}

const user = await requireTeacher({ loadingId: 'libLoading', errorId: 'libError' });
if(user){
  try{
    const [catalogLevels, searchIndex, items] = await Promise.all([
      loadCatalogLevels(), fetch('data/search-index.json').then((r) => r.json()).catch(() => null), loadLibrary()
    ]);
    levels = catalogLevels;
    topicIndex = buildTopicIndex(catalogLevels, searchIndex);
    library = items;
    renderLibrary();
    renderQueue();
    if(drive.driveConfigured){
      drive.preload();
      setupDrop();
      $('libPick').addEventListener('click', () => $('libFiles').click());
      $('libFiles').addEventListener('change', () => { enqueue($('libFiles').files); $('libFiles').value = ''; });
      $('uploadAll').addEventListener('click', uploadAll);
      $('clearQueue').addEventListener('click', () => { if(!uploading){ queue.length = 0; renderQueue(); setStatus($('queueStatus'), '', ''); } });
    }else{
      $('libPick').disabled = true;
      $('libDriveHint').textContent = 'PDF yükleme için Google Drive bağlantısı kurulu değil (docs/kurulum.md).';
    }
    $('libSearch').addEventListener('input', renderLibrary);
    $('libLevel').addEventListener('change', renderLibrary);
    $('libLoading').hidden = true;
    $('libApp').hidden = false;
  }catch(error){
    console.error(error);
    $('libLoading').hidden = true;
    $('libError').hidden = false;
    $('libError').textContent = 'Kütüphane yüklenemedi. Tekrar dene.';
  }
}
