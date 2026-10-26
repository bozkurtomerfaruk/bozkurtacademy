// Yönetim: seviye testi sonuçları (#yonetim/seviye-testleri, detay: #yonetim/seviye-testleri/<id>).
// Öğretmen paneli gibi sadece Türkçe. Sitenin hiçbir yerinden bağlantı verilmez; ama güvenlik bağlantının
// gizli olmasına değil firestore.rules'a dayanır (okuma/güncelleme/silme sadece öğretmen UID'i).
// Öğretmen olarak giriş yapılmamışsa Firestore'dan hiçbir şey istenmez.
import { auth, configured, db, fs } from './firebase.js';
import { TEACHER_UID } from './config.js';

const P = () => window.BA_PLACEMENT;
const BASE = '#yonetim/seviye-testleri';
const GOALS = { daily: 'Günlük hayat', exam: 'Sınav', work: 'İş', school: 'Okul / üniversite', other: 'Diğer' };
const EXPERIENCE = { none: 'Hiç', lt6m: '6 aydan az', '6to12m': '6–12 ay', '1to2y': '1–2 yıl', gt2y: '2 yıldan fazla' };
const LANGS = { tr: 'Türkçe', de: 'Almanca', en: 'İngilizce' };

let cache = null;   // { docs: [...], bank }
let filters = { q: '', level: '' };

const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for(const [k, v] of Object.entries(attrs)){
    if(v === null || v === undefined || v === false) continue;
    if(k === 'class') node.className = v;
    else if(k === 'text') node.textContent = v;
    else if(k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for(const child of children.flat()) if(child !== null && child !== undefined && child !== false) node.append(child.nodeType ? child : document.createTextNode(child));
  return node;
};

const toDate = (ts) => ts?.toDate ? ts.toDate() : null;
const fmtDate = (ts, time = true) => {
  const d = toDate(ts);
  if(!d) return '—';
  return d.toLocaleString('tr-TR', time ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
};
const fmtDuration = (sec) => {
  if(!sec) return '—';
  const m = Math.floor(sec / 60), s = sec % 60;
  return m ? `${m} dk ${s} sn` : `${s} sn`;
};
const levelText = (r) => r.level === 'A0' ? (r.near ? 'A0 – A1’e yakın' : 'Başlangıç (A0)') : (r.near ? `${r.level} – ${r.near}’e yakın` : r.level);
const words = (text) => (String(text || '').trim().match(/\S+/g) || []).length;

function denied(box){
  box.replaceChildren(el('p', { class: 'admin-denied', role: 'alert', 'data-admin-denied': true, text: P()?.t('adminNoAccess') || 'Bu sayfaya erişimin yok.' }));
}

function currentUser(){
  return new Promise((resolve) => {
    const stop = auth.onAuthStateChanged((user) => { stop(); resolve(user); });
  });
}

async function loadAll(){
  const [snap, bank] = await Promise.all([
    fs.getDocs(fs.query(fs.collection(db, 'placementTests'), fs.orderBy('createdAt', 'desc'), fs.limit(500))),
    fetch('data/seviye-testi/sorular.json?v=1').then((r) => r.json())
  ]);
  const questions = {};
  for(const block of bank.blocks){
    for(const q of block.questions) questions[q.id] = { ...q, level: block.level };
    for(const q of block.reading.questions) questions[q.id] = { ...q, level: block.level, reading: block.reading.title };
  }
  cache = { docs: snap.docs.map((d) => ({ id: d.id, ...d.data() })), bank, questions };
}

export async function open(box, parts){
  // Giriş yoksa veya öğretmen değilse: hiçbir veri istemeden reddet.
  if(!configured){ denied(box); return; }
  const user = await currentUser();
  if(!user || user.uid !== TEACHER_UID){ denied(box); return; }
  if(!cache){
    try{ await loadAll(); }
    catch(error){ console.error(error); denied(box); return; }
  }
  const id = parts[1] ? decodeURIComponent(parts[1]) : '';
  const record = id && cache.docs.find((d) => d.id === id);
  if(record) renderDetail(box, record);
  else renderList(box);
  box.querySelector('h1')?.setAttribute('tabindex', '-1');
}

function navigate(box, hash){
  history.pushState({ baPage: 'yonetim' }, '', hash);
  open(box, hash.split('/').slice(1)).then(() => {
    box.querySelector('h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
}

function renderList(box){
  const list = el('ul', { class: 'admin-list', 'data-admin-list': true });
  const count = el('p', { class: 'admin-muted', role: 'status', 'aria-live': 'polite' });
  const search = el('input', { type: 'search', id: 'adminSearch', placeholder: 'Ad veya e-posta ara', autocomplete: 'off' });
  search.value = filters.q;
  const level = el('select', { id: 'adminLevel' },
    el('option', { value: '', text: 'Tüm seviyeler' }),
    ['A0', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lv) => el('option', { value: lv, text: lv })));
  level.value = filters.level;

  function draw(){
    const q = filters.q.trim().toLocaleLowerCase('tr');
    const rows = cache.docs.filter((d) => (!filters.level || d.level === filters.level)
      && (!q || d.name.toLocaleLowerCase('tr').includes(q) || d.email.toLocaleLowerCase('tr').includes(q)));
    const unread = cache.docs.filter((d) => !d.read).length;
    count.textContent = `${rows.length} sonuç · ${unread} okunmamış`;
    list.replaceChildren(...rows.map((d) => el('li', { class: d.read ? 'admin-row' : 'admin-row is-unread' },
      el('a', { href: `${BASE}/${encodeURIComponent(d.id)}`, 'data-admin-open': d.id,
        onclick: (e) => { if(e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); navigate(box, `${BASE}/${encodeURIComponent(d.id)}`); } },
        el('span', { class: 'admin-row-date', text: fmtDate(d.createdAt) }),
        el('strong', { class: 'admin-row-name', text: d.name }),
        el('span', { class: 'admin-row-level', text: levelText(d) }),
        el('span', { class: 'admin-row-goal', text: GOALS[d.goal] || d.goal }),
        d.read ? null : el('span', { class: 'admin-badge', text: 'Yeni' })))));
    if(!rows.length) list.append(el('li', { class: 'admin-empty', text: cache.docs.length ? 'Aramaya uyan sonuç yok.' : 'Henüz sonuç yok.' }));
  }
  search.addEventListener('input', () => { filters.q = search.value; draw(); });
  level.addEventListener('change', () => { filters.level = level.value; draw(); });

  box.replaceChildren(
    el('header', { class: 'admin-head' },
      el('h1', { text: 'Seviye testleri' }),
      el('p', { class: 'admin-muted', text: 'Bu sayfa sadece öğretmen hesabıyla açılır. Kayıtlar 6 ay sonra otomatik silinir.' })),
    el('div', { class: 'admin-toolbar' },
      el('div', { class: 'field' }, el('label', { for: 'adminSearch', text: 'Ara' }), search),
      el('div', { class: 'field' }, el('label', { for: 'adminLevel', text: 'Seviye' }), level)),
    count, list);
  draw();
}

function section(title, ...children){
  return el('section', { class: 'admin-section ba-card' }, el('div', { class: 'admin-section-body' }, el('h2', { text: title }), ...children));
}
function dl(pairs){
  return el('dl', { class: 'admin-dl' }, pairs.filter(Boolean).map(([k, v]) => el('div', {}, el('dt', { text: k }), el('dd', {}, v))));
}

function parseTopics(text){
  return String(text || '').split(',').filter(Boolean).map((p) => { const [id, n] = p.split(':'); return [id, Number(n) || 0]; })
    .sort((a, b) => b[1] - a[1]);
}
function parseWrong(text){
  return String(text || '').split('\n').filter(Boolean).map((line) => { const i = line.indexOf('\t'); return { id: line.slice(0, i), answer: line.slice(i + 1) }; });
}

function renderDetail(box, d){
  const status = el('p', { class: 'admin-status', role: 'status', 'aria-live': 'polite' });
  const readBtn = el('button', { class: 'btn ghost', type: 'button', 'data-admin-read': true, text: d.read ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle' });
  readBtn.addEventListener('click', async () => {
    readBtn.disabled = true;
    try{
      await fs.updateDoc(fs.doc(db, 'placementTests', d.id), { read: !d.read });
      d.read = !d.read;
      readBtn.textContent = d.read ? 'Okunmadı olarak işaretle' : 'Okundu olarak işaretle';
      status.textContent = d.read ? 'Okundu olarak işaretlendi.' : 'Okunmadı olarak işaretlendi.';
    }catch(error){ console.error(error); status.textContent = 'Kaydedilemedi. Tekrar dene.'; }
    readBtn.disabled = false;
  });

  const confirmBox = el('div', { class: 'admin-confirm', hidden: true },
    el('p', { text: `${d.name} adlı kişinin sonucu kalıcı olarak silinsin mi?` }));
  const delBtn = el('button', { class: 'btn ghost admin-danger', type: 'button', 'data-admin-delete': true, text: 'Sil' });
  const yes = el('button', { class: 'btn primary admin-danger-fill', type: 'button', 'data-admin-delete-yes': true, text: 'Evet, sil' });
  const no = el('button', { class: 'btn ghost', type: 'button', text: 'Vazgeç' });
  confirmBox.append(el('div', { class: 'admin-actions' }, yes, no));
  delBtn.addEventListener('click', () => { confirmBox.hidden = false; no.focus(); });
  no.addEventListener('click', () => { confirmBox.hidden = true; delBtn.focus(); });
  yes.addEventListener('click', async () => {
    yes.disabled = true;
    try{
      await fs.deleteDoc(fs.doc(db, 'placementTests', d.id));
      cache.docs = cache.docs.filter((x) => x.id !== d.id);
      navigate(box, BASE);
    }catch(error){ console.error(error); status.textContent = 'Silinemedi. Tekrar dene.'; yes.disabled = false; }
  });

  const note = el('textarea', { id: 'adminNote', rows: '4', maxlength: '2000' });
  note.value = d.adminNote || '';
  const saveNote = el('button', { class: 'btn primary', type: 'button', 'data-admin-note-save': true, text: 'Notu kaydet' });
  const noteStatus = el('p', { class: 'admin-status', role: 'status', 'aria-live': 'polite' });
  saveNote.addEventListener('click', async () => {
    saveNote.disabled = true;
    try{
      await fs.updateDoc(fs.doc(db, 'placementTests', d.id), { adminNote: note.value.slice(0, 2000) });
      d.adminNote = note.value.slice(0, 2000);
      noteStatus.textContent = 'Not kaydedildi.';
    }catch(error){ console.error(error); noteStatus.textContent = 'Not kaydedilemedi.'; }
    saveNote.disabled = false;
  });

  const blocks = Object.entries(d.blocks || {}).sort(([a], [b]) => a.localeCompare(b));
  const topics = parseTopics(d.topicErrors);
  const wrong = parseWrong(d.wrong);
  const back = el('a', { class: 'ba-link admin-back', href: BASE, onclick: (e) => { e.preventDefault(); navigate(box, BASE); }, text: '← Tüm sonuçlar' });

  box.replaceChildren(
    back,
    el('header', { class: 'admin-head' },
      el('h1', { text: d.name }),
      el('p', { class: 'admin-level', 'data-admin-level': true }, 'Tahmini seviye: ', el('strong', { text: levelText(d) }), d.skipped ? ' (testi atladı: “Hiç Almanca bilmiyorum”)' : '')),
    el('div', { class: 'admin-actions' }, readBtn, delBtn),
    confirmBox, status,
    section('Bilgiler', dl([
      ['E-posta', el('a', { class: 'ba-link', href: `mailto:${d.email}`, text: d.email })],
      ['Hedef', GOALS[d.goal] || d.goal],
      ['Sınav', [d.examName, d.examDate && new Date(d.examDate + 'T12:00:00').toLocaleDateString('tr-TR', { dateStyle: 'medium' })].filter(Boolean).join(' · ') || '—'],
      ['Almanca öğrenme süresi', EXPERIENCE[d.experience] || d.experience],
      ['Not', d.note ? el('span', { class: 'admin-pre', text: d.note }) : '—'],
      ['Gönderim tarihi', fmtDate(d.createdAt)],
      ['Toplam süre', fmtDuration(d.durationSec)],
      ['Arayüz dili', LANGS[d.lang] || d.lang],
      ['Otomatik silinme', fmtDate(d.expireAt, false)]
    ])),
    blocks.length ? section('Bölümlere göre doğru sayısı',
      el('table', { class: 'admin-table' },
        el('thead', {}, el('tr', {}, el('th', { scope: 'col', text: 'Bölüm' }), el('th', { scope: 'col', text: 'Doğru' }), el('th', { scope: 'col', text: 'Sonuç' }))),
        el('tbody', {}, blocks.map(([lv, b]) => el('tr', {},
          el('th', { scope: 'row', text: lv }), el('td', { text: `${b.correct} / ${b.total}` }),
          el('td', { text: b.correct >= cache.bank.passCorrect ? 'Geçti' : 'Geçemedi' })))))) : null,
    blocks.length ? section('Konu bazında hatalar', topics.length
      ? el('ul', { class: 'admin-topics' }, topics.map(([id, n]) => el('li', {}, el('span', { text: P()?.topicName(id) || id }), el('strong', { text: String(n) }))))
      : el('p', { text: 'Hata yok.' })) : null,
    blocks.length ? section(`Yanlış cevaplanan sorular (${wrong.length})`, wrong.length ? el('ol', { class: 'admin-wrong' }, wrong.map((w) => {
      const q = cache.questions[w.id];
      return el('li', { 'data-admin-wrong': w.id },
        el('p', { class: 'admin-muted', text: q ? `${q.level} · ${q.reading ? 'Okuma metni: ' + q.reading : (P()?.topicName(q.topic) || q.topic)}` : w.id }),
        el('p', { class: 'admin-q', lang: 'de', text: q ? q.prompt : '(Bu soru soru bankasında yok.)' }),
        dl([
          ['Öğrencinin cevabı', el('span', { class: 'admin-answer is-wrong', lang: 'de', text: w.answer === '?' ? 'Bilmiyorum' : w.answer })],
          q && ['Doğru cevap', el('span', { class: 'admin-answer is-right', lang: 'de', text: q.answer })]
        ]));
    })) : el('p', { text: 'Yanlış cevap yok.' })) : null,
    section('Yazma görevi', d.writing
      ? [el('p', { class: 'admin-muted', text: `${words(d.writing)} kelime` }), el('div', { class: 'admin-pre admin-writing', lang: 'de', 'data-admin-writing': true, text: d.writing })]
      : el('p', { text: 'Yazma görevi boş bırakıldı.' })),
    section('Notum', el('div', { class: 'field' }, el('label', { for: 'adminNote', text: 'Sadece sen görürsün' }), note), saveNote, noteStatus)
  );
}
