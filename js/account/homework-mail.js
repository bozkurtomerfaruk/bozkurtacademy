// Ödev e-postası (öğretmen sayfaları): ödev kaydedildikten sonra Worker'a (POST /odev-bildirim) sadece ödev kopyalarının
// kimlikleri gönderilir; e-posta adreslerini, dili ve başlığı Worker Firestore'dan kendisi okur (worker/schreiben-kontrol.js).
// E-posta gönderilemese bile ödev kayıtlı kalır; sonuç ödev listesinde gösterilir ve oradan tekrar denenebilir.
import { AI_WORKER_URL } from './config.js';
import { auth, emulator } from './firebase.js';

export const mailConfigured = emulator || Boolean(AI_WORKER_URL);
const workerUrl = () => `${emulator ? 'http://127.0.0.1:8787' : AI_WORKER_URL.replace(/\/$/, '')}/odev-bildirim`;
const RESULT_KEY = 'baOdevMail';
const BATCH = 50;

export const MAIL_STATUS = {
  sent: 'gönderildi',
  already: 'daha önce gönderilmişti',
  off: 'öğrencinin ödev e-postaları kapalı',
  inactive: 'hesap açık değil',
  limit: 'günlük e-posta sınırı doldu',
  'no-email': 'e-posta adresi yok',
  'not-found': 'ödev bulunamadı',
  error: 'gönderilemedi'
};

// items: [{ uid, id }]. Döner: { ok, results: [{ uid, id, status, recipients, parentError }], sent, count, limit, error }
export async function notifyHomework(kind, items){
  if(!items.length) return { ok: true, results: [], sent: 0 };
  if(!mailConfigured) return { ok: false, results: [], sent: 0, error: 'Worker henüz kurulmadı.' };
  const out = { ok: true, results: [], sent: 0, count: 0, limit: 0 };
  try{
    const token = await auth.currentUser.getIdToken();
    for(let i = 0; i < items.length; i += BATCH){
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      let response;
      try{
        response = await fetch(workerUrl(), {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind, items: items.slice(i, i + BATCH) }),
          signal: controller.signal
        });
      }finally{
        clearTimeout(timer);
      }
      const data = await response.json().catch(() => ({}));
      if(!response.ok){
        const reason = { 'not-configured': 'Worker\'da Brevo anahtarı ya da TEACHER_UID ayarlı değil.', unauthorized: 'Öğretmen oturumu doğrulanamadı.' }[data.status];
        return { ...out, ok: false, error: reason || `Worker hatası (${response.status}).` };
      }
      out.results.push(...(data.results || []));
      out.sent += Number(data.sent) || 0;
      out.count = data.count;
      out.limit = data.limit;
    }
  }catch(error){
    console.warn(error);
    return { ...out, ok: false, error: error?.name === 'AbortError' ? 'Worker zamanında cevap vermedi.' : 'Worker\'a ulaşılamadı.' };
  }
  return out;
}

// Ödev listesinde gösterilmek üzere sonucu sakla (sayfa değişince bir kez okunur).
export function rememberResult(result){
  try{ sessionStorage.setItem(RESULT_KEY, JSON.stringify(result)); }catch(_){}
}
export function takeResult(){
  try{
    const raw = sessionStorage.getItem(RESULT_KEY);
    sessionStorage.removeItem(RESULT_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(_){
    return null;
  }
}

// "E-posta: 2 gönderildi. Gönderilemedi: Deniz Kaya (günlük e-posta sınırı doldu)."
export function describeResult(result, nameOf){
  if(!result) return null;
  if(!result.ok && !result.results?.length) return { type: 'error', text: `E-posta gönderilemedi: ${result.error || 'bilinmeyen hata'} Ödev kaydedildi; listeden tekrar deneyebilirsin.` };
  const sent = result.results.filter((r) => r.status === 'sent');
  const skipped = result.results.filter((r) => !['sent', 'already'].includes(r.status));
  const parts = [`E-posta: ${sent.length} öğrenciye gönderildi${result.sent > sent.length ? ` (velilerle birlikte ${result.sent} e-posta)` : ''}.`];
  if(skipped.length) parts.push(`Gönderilmedi: ${skipped.map((r) => `${nameOf(r.uid)} (${MAIL_STATUS[r.status] || r.status})`).join(', ')}.`);
  const parentFailed = result.results.filter((r) => r.parentError);
  if(parentFailed.length) parts.push(`Veliye gidemedi: ${parentFailed.map((r) => nameOf(r.uid)).join(', ')}.`);
  if(result.error) parts.push(result.error);
  if(result.limit) parts.push(`Bugün ${result.count}/${result.limit} e-posta.`);
  return { type: skipped.some((r) => ['limit', 'error'].includes(r.status)) || !result.ok ? 'error' : 'success', text: parts.join(' ') };
}
