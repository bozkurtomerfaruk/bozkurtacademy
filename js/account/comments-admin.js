// /yonetim/yorumlar/: gramer dersi yorumlarını onaylama, cevaplama, yayından kaldırma ve silme.
// Asıl koruma firestore.rules içindedir: öğretmen dışında kimse bekleyen yorumları okuyamaz veya değiştiremez.
// Bu sayfa öğretmen olmayan bir hesapla açılırsa hiçbir sorgu çalıştırmaz.
import { auth, configured, db, fa, fs } from './firebase.js';
import { TEACHER_UID } from './config.js';

const $ = (id) => document.getElementById(id);
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const fmt = (ts) => {
  const d = ts?.toDate ? ts.toDate() : null;
  if(!d) return '';
  const hm = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hm}`;
};
const el = (tag, cls, text) => {
  const node = document.createElement(tag);
  if(cls) node.className = cls;
  if(text !== undefined) node.textContent = text;
  return node;
};

function setStatus(type, message){
  const s = $('caStatus');
  s.hidden = !message;
  s.className = 'acc-status' + (type ? ' ' + type : '');
  s.textContent = message || '';
}

// Ders anahtarı ("A1/artikel") → ders adı
let titles = null;
async function lessonTitles(){
  if(titles) return titles;
  titles = {};
  try{
    const index = await (await fetch('/data/grammar-index.json', { cache: 'no-store' })).json();
    await Promise.all(Object.entries(index.levels || {}).map(async ([level, file]) => {
      const data = await (await fetch('/' + file, { cache: 'no-store' })).json();
      for(const lesson of data.lessons || []) titles[`${level}/${lesson.id}`] = lesson.title;
    }));
  }catch(error){ console.warn('Ders adları yüklenemedi:', error); }
  return titles;
}

async function run(action, button){
  const buttons = document.querySelectorAll('.ca-actions button, .ca-reply-form button');
  buttons.forEach((b) => { b.disabled = true; });
  try{
    await action();
    await load();
  }catch(error){
    console.error(error);
    setStatus('error', 'İşlem yapılamadı: ' + (error.code === 'permission-denied'
      ? 'izin yok. Firestore kuralları yayınlanmış mı ve öğretmen hesabıyla mı giriş yaptın?'
      : (error.message || error)));
    buttons.forEach((b) => { b.disabled = false; });
  }
}

function replyForm(item, ref, current){
  const form = el('form', 'ca-reply-form');
  const label = el('label', 'visually-hidden', 'Cevabın');
  const area = el('textarea');
  area.maxLength = 2000;
  area.value = current || '';
  area.id = 'reply-' + ref.id;
  label.htmlFor = area.id;
  const row = el('div', 'ca-actions');
  const save = el('button', 'btn primary', 'Cevabı kaydet');
  save.type = 'submit';
  const cancel = el('button', 'btn ghost', 'Vazgeç');
  cancel.type = 'button';
  cancel.addEventListener('click', () => form.remove());
  row.append(save, cancel);
  form.append(label, area, row);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = area.value.trim();
    run(() => fs.updateDoc(ref, { reply: text ? text : fs.deleteField() }));
  });
  item.append(form);
  area.focus();
}

function card(docSnap, approved){
  const data = docSnap.data();
  const ref = docSnap.ref;
  const item = el('article', 'ca-item');
  const meta = el('p', 'ca-meta');
  const [level, id] = String(data.lesson || '').split('/');
  const link = el('a', '', `${level} · ${titles?.[data.lesson] || id || data.lesson}`);
  link.href = `/#grammar/${level}/${id}`;
  link.target = '_blank';
  link.rel = 'noopener';
  meta.append(link, el('span', '', fmt(data.createdAt)));
  if(approved && data.approvedAt) meta.append(el('span', '', 'Onay: ' + fmt(data.approvedAt)));
  item.append(meta, el('p', 'ca-name', String(data.name || '')), el('p', 'ca-text', String(data.comment || '')));
  if(data.reply){
    const reply = el('div', 'ca-reply');
    reply.append(el('strong', '', 'Cevabın'), document.createTextNode(String(data.reply)));
    item.append(reply);
  }
  const actions = el('div', 'ca-actions');
  const button = (label, cls, handler) => {
    const b = el('button', 'btn ' + cls, label);
    b.type = 'button';
    b.addEventListener('click', handler);
    actions.append(b);
  };
  if(!approved) button('Onayla', 'primary', () => run(() => fs.updateDoc(ref, { status: 'approved', approvedAt: fs.serverTimestamp() })));
  else button('Yayından kaldır', 'ghost', () => run(() => fs.updateDoc(ref, { status: 'pending' })));
  button(data.reply ? 'Cevabı düzenle' : 'Cevap yaz', 'ghost', () => {
    item.querySelector('.ca-reply-form')?.remove();
    replyForm(item, ref, data.reply);
  });
  button('Sil', 'ghost ca-danger', () => {
    if(confirm(`${data.name} adlı kişinin yorumu kalıcı olarak silinsin mi?`)) run(() => fs.deleteDoc(ref));
  });
  item.append(actions);
  return item;
}

async function list(status){
  const snap = await fs.getDocs(fs.query(fs.collection(db, 'comments'), fs.where('status', '==', status)));
  return snap.docs.sort((a, b) => (b.data().createdAt?.toMillis?.() || 0) - (a.data().createdAt?.toMillis?.() || 0));
}

function fill(container, docs, approved, emptyText){
  container.replaceChildren(...(docs.length ? docs.map((d) => card(d, approved)) : [el('p', 'ca-empty', emptyText)]));
}

async function load(){
  setStatus('', 'Yükleniyor…');
  await lessonTitles();
  const [pending, approved] = await Promise.all([list('pending'), list('approved')]);
  $('caPendingCount').textContent = String(pending.length);
  $('caSummary').hidden = false;
  fill($('caPendingList'), pending, false, 'Onay bekleyen yorum yok.');
  fill($('caApprovedList'), approved, true, 'Yayında yorum yok.');
  $('caApp').hidden = false;
  setStatus('', '');
}

function start(){
  if(!configured){
    setStatus('error', 'Firebase yapılandırılmamış (js/account/config.js).');
    return;
  }
  const stop = auth.onAuthStateChanged(async (user) => {
    stop();
    if(!user || user.isAnonymous){
      setStatus('', '');
      $('caLogin').hidden = false;
      return;
    }
    $('caLogout').hidden = false;
    $('caLogout').addEventListener('click', async () => { await fa.signOut(auth); location.replace('/'); });
    if(user.uid !== TEACHER_UID){
      setStatus('error', 'Bu sayfa sadece öğretmen içindir.');
      return;
    }
    $('caRefresh').hidden = false;
    $('caRefresh').addEventListener('click', () => load().catch(failed));
    load().catch(failed);
  });
}

function failed(error){
  console.error(error);
  setStatus('error', error.code === 'permission-denied'
    ? 'Yorumlar okunamadı: izin yok. Firestore kurallarının güncel hâli yayınlanmış olmalı (docs/kurulum.md).'
    : 'Yorumlar yüklenemedi: ' + (error.message || error));
}

start();
