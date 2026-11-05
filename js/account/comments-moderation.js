// Gramer dersi yorumlarının onay ekranı (ortak modül). İki yerde kullanılır:
// - /yonetim/yorumlar/ (js/account/comments-admin.js): yorum e-postalarındaki "onay_paneli" linki
// - ogretmen.html → "Yorumlar" sekmesi (js/account/teacher.js)
// Asıl koruma firestore.rules içindedir: öğretmen dışında kimse bekleyen yorumları okuyamaz veya değiştiremez.
// Bütün metinler textContent ile yazılır, hiçbir zaman HTML olarak değil.
import { db, fs } from './firebase.js';

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

// Ders anahtarı ("A1/artikel") → ders adı
let titlesPromise = null;
function lessonTitles(){
  titlesPromise ??= (async () => {
    const titles = {};
    try{
      const index = await (await fetch('/data/grammar-index.json', { cache: 'no-store' })).json();
      await Promise.all(Object.entries(index.levels || {}).map(async ([level, file]) => {
        const data = await (await fetch('/' + file, { cache: 'no-store' })).json();
        for(const lesson of data.lessons || []) titles[`${level}/${lesson.id}`] = lesson.title;
      }));
    }catch(error){ console.warn('[yorum onayı] Ders adları yüklenemedi:', error); }
    return titles;
  })();
  return titlesPromise;
}

export function permissionMessage(error){
  return error?.code === 'permission-denied'
    ? 'izin yok. Firestore kurallarının güncel hâli yayınlanmış mı ve öğretmen hesabıyla mı giriş yaptın? (docs/kurulum.md)'
    : (error?.message || String(error));
}

// pendingList, approvedList: listelerin yazılacağı elemanlar.
// onCounts({ pending, approved }): her yüklemeden sonra; onStatus(type, message): yükleniyor / hata mesajı.
export function createModeration({ pendingList, approvedList, onCounts = () => {}, onStatus = () => {} }){
  let titles = {};

  async function run(action){
    const buttons = [pendingList, approvedList].flatMap((list) => [...list.querySelectorAll('button')]);
    buttons.forEach((b) => { b.disabled = true; });
    try{
      await action();
      await load();
    }catch(error){
      console.error('[yorum onayı] İşlem yapılamadı:', error?.code || '', error);
      onStatus('error', 'İşlem yapılamadı: ' + permissionMessage(error));
      buttons.forEach((b) => { b.disabled = false; });
    }
  }

  function replyForm(item, ref, current){
    const form = el('form', 'ca-reply-form');
    const area = el('textarea');
    area.maxLength = 2000;
    area.value = current || '';
    area.id = 'reply-' + ref.id;
    const label = el('label', 'visually-hidden', 'Cevabın');
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
    const link = el('a', '', `${level} · ${titles[data.lesson] || id || data.lesson}`);
    link.href = `/almanca-gramer/${String(level).toLowerCase()}/${id}/`;
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

  // Kurallar sorgunun status ile sınırlı olmasını ister; öğretmen için de aynı sorgu kullanılır.
  async function list(status){
    const snap = await fs.getDocs(fs.query(fs.collection(db, 'comments'), fs.where('status', '==', status)));
    return snap.docs.sort((a, b) => (b.data().createdAt?.toMillis?.() || 0) - (a.data().createdAt?.toMillis?.() || 0));
  }

  function fill(container, docs, approved, emptyText){
    container.replaceChildren(...(docs.length ? docs.map((d) => card(d, approved)) : [el('p', 'ca-empty', emptyText)]));
  }

  async function load(){
    onStatus('', 'Yorumlar yükleniyor…');
    titles = await lessonTitles();
    const [pending, approved] = await Promise.all([list('pending'), list('approved')]);
    console.info('[yorum onayı] yüklendi', { bekleyen: pending.length, yayinda: approved.length });
    fill(pendingList, pending, false, 'Onay bekleyen yorum yok.');
    fill(approvedList, approved, true, 'Yayında yorum yok.');
    onCounts({ pending: pending.length, approved: approved.length });
    onStatus('', '');
  }

  return { load };
}
