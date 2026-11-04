// Gramer dersi yorumları (Firestore, koleksiyon "comments"). js/a1-lessons.js bu modülü yalnızca gerektiğinde yükler:
// - loadApproved: ziyaretçi yorum bölümüne yaklaşınca, Firebase SDK'sı olmadan tek bir REST isteğiyle onaylı yorumları okur.
// - submitComment: "Yorumu gönder"e basılınca Firebase SDK'sını yükler, anonim oturumla yorumu "pending" olarak kaydeder
//   ve Web3Forms ile öğretmene bildirim gönderir. E-posta adresi Firestore'a yazılmaz, yalnızca bildirim e-postasında bulunur.
// Kurallar: firestore.rules → "Gramer dersi yorumları". Onay sayfası: /yonetim/yorumlar/.
import { firebaseConfig } from './account/config.js';

const SITE = 'https://bozkurtacademy.com';
const ADMIN_URL = SITE + '/yonetim/yorumlar/';
const WEB3FORMS_KEY = '21c1c876-3c08-4019-a29d-8181b1f640f0';

// Yerelde ?emulator=1 ile açılan sayfalar emülatörü kullanır (js/account/firebase.js ile aynı kural).
function emulatorMode(){
  if(!['localhost', '127.0.0.1'].includes(location.hostname)) return false;
  try{ return localStorage.getItem('baEmulator') === '1' || new URLSearchParams(location.search).get('emulator') === '1'; }
  catch(_){ return false; }
}

function restBase(){
  return emulatorMode()
    ? 'http://127.0.0.1:8080/v1/projects/demo-bozkurtacademy/databases/(default)/documents'
    : `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
}

const text = (field) => field?.stringValue ?? '';

// Onaylı yorumlar, en yenisi önce: [{ name, comment, reply, date: Date }]
export async function loadApproved(lessonKey){
  const where = (field, value) => ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } });
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'comments' }],
      where: { compositeFilter: { op: 'AND', filters: [where('lesson', lessonKey), where('status', 'approved')] } },
      limit: 100
    }
  };
  const key = emulatorMode() ? '' : `?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
  const response = await fetch(`${restBase()}:runQuery${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if(!response.ok) throw new Error(`Firestore HTTP ${response.status}`);
  const rows = await response.json();
  return rows
    .filter((row) => row.document)
    .map((row) => {
      const f = row.document.fields || {};
      return { name: text(f.name), comment: text(f.comment), reply: text(f.reply), date: f.createdAt?.timestampValue ? new Date(f.createdAt.timestampValue) : null };
    })
    .filter((row) => row.name && row.comment)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
}

// Yorumu kaydeder; kayıt başarısızsa hata fırlatır. Bildirim e-postası başarısız olsa da yorum kayıtlı kalır.
export async function submitComment({ lesson, title, link, name, email, comment }){
  const { auth, configured, db, fa, fs } = await import('./account/firebase.js');
  if(!configured) throw new Error('Firebase is not configured');
  let user = auth.currentUser || await new Promise((resolve) => {
    const stop = auth.onAuthStateChanged((u) => { stop(); resolve(u); });
  });
  if(!user) user = (await fa.signInAnonymously(auth)).user;
  const ref = fs.doc(fs.collection(db, 'comments'));
  const batch = fs.writeBatch(db);
  batch.set(ref, { lesson, name, comment, status: 'pending', createdAt: fs.serverTimestamp() });
  // Bekleme süresi: kurallar bu belgenin aynı batch'te bu yorumun kimliğiyle yazılmasını ister.
  batch.set(fs.doc(db, 'commentLimits', user.uid), { lastAt: fs.serverTimestamp(), lastId: ref.id });
  try{
    await batch.commit();
  }finally{
    if(user.isAnonymous) await fa.signOut(auth).catch(() => {});
  }
  const [level] = lesson.split('/');
  try{
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Bozkurt Academy – ${level} yorum incelemesi: ${title}`,
        from_name: 'Bozkurt Academy Web Sitesi',
        replyto: email,
        name,
        email,
        message: comment,
        ders: `${level} · ${title}`,
        ders_linki: link,
        onay_paneli: ADMIN_URL,
        durum: 'Onay bekliyor. Onaylamak için onay panelini aç.'
      })
    });
    const result = await response.json().catch(() => ({}));
    if(!response.ok || result.success !== true) throw new Error(result.message || `Web3Forms HTTP ${response.status}`);
  }catch(error){
    console.warn('Yorum kaydedildi, ancak bildirim e-postası gönderilemedi:', error);
  }
  return ref.id;
}
