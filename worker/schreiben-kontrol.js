// Schreiben yapay zekâ kontrolü (madde 7 Aşama B): Cloudflare Worker, Free plan. Tek dosya; Cloudflare panelinde
// "Edit code" ekranına olduğu gibi yapıştırılır (kurulum: docs/yapay-zeka-kurulum.md).
//
// Akış: Öğrenci metnini gönderir (Aşama A, users/{uid}/writings). Tarayıcı ardından POST /check { writingId } ile buraya
// gelir (Authorization: Bearer <Firebase oturum belirteci>). Worker:
//  1. belirteci Firebase Auth'a sordurur (accounts:lookup) → öğrencinin uid'i;
//  2. "yapay zekâ hesabı" ile giriş yapar ve Firestore'dan okur: settings/ai (mod), users/{uid} (aktif mi, 16 yaş altıysa
//     veli onayı ve yapay zekâ onayı), users/{uid}/writings/{id} (metin; öğrenci başka bir metin gönderemez), günlük sayaçlar;
//  3. Gemma 4 26B'ye (Workers AI, düşünme kapalı) SADECE metni ve görev adını gönderir; ad, e-posta, uid gitmez;
//  4. sonucu denetler (yanlış kısım metinde geçmek zorunda) ve yazar: "Taslak" modunda aiDrafts/{uid}_{id} (öğrenci
//     okuyamaz, öğretmen onaylar), "Anında göster" modunda metne aiFeedback.
// Sınırlar: öğrenci başına günde 3, site genelinde günde 600 kontrol (Berlin günü). Workers AI ücretsiz kotası
// (günde 10.000 Neuron) dolarsa istek hata verir, taslak oluşmaz, ücret çıkmaz.
//
// Ortam (Cloudflare → Worker → Settings → Variables and Secrets; yapay zekâ bağlantısı: Bindings → Workers AI, adı "AI"):
//   FIREBASE_API_KEY, FIREBASE_PROJECT_ID, ALLOWED_ORIGINS (virgülle), SITE_URL   (düz metin, gizli değil)
//   AI_EMAIL, AI_PASSWORD                                                          (gizli: Secret)
//   AUTH_BASE, FIRESTORE_BASE   (sadece testlerde: Firebase Emulator adresleri)

export const MODEL = '@cf/google/gemma-4-26b-a4b-it';
export const LIMIT_STUDENT = 3;
export const LIMIT_GLOBAL = 600;

export const PROMPT = `Sen Türkçe konuşan öğrencilere (A1–B1) Almanca öğreten deneyimli bir öğretmensin.
Görev: Öğrencinin Almanca metnindeki gerçek dil bilgisi, yazım ve noktalama hatalarını bul.
Kullanıcı mesajının ilk satırları görev adı ("Görev: …") ve metin türüdür ("Metin türü: …"); sadece "Metin:" satırından sonraki metni düzelt.
Kurallar:
- Sadece gerçek hataları işaretle. Doğru cümleler ve üslup tercihleri hata DEĞİLDİR. Özel isimler hata değildir.
- Her hata için: metindeki yanlış kısım (aynen), düzeltmesi ve TÜRKÇE kısa bir açıklama (1–2 cümle, yeni başlayan biri için, kuralı söyle; ör. "weil'den sonra çekimli fiil cümlenin sonuna gider").
- Açıklamalar mutlaka Türkçe olsun; Almanca kelimeleri sadece örnek olarak kullan.
Fiil sırası (açıklamalarda hangi cümle türü olduğunu söyle; "fiil her zaman ikinci sırada" gibi genelleme yapma):
- Ana cümlede (düz cümle) çekimli fiil 2. sıradadır: Heute koche ich …, Trotzdem bleibt er …
- Yan cümlede (weil, dass, wenn, ob, als, dolaylı soru …) çekimli fiil sondadır: …, weil es regnet.
- Yan cümle başa gelirse ana cümlenin çekimli fiili hemen arkasından gelir: Wenn es regnet, bleibe ich zu Hause.
- Evet/hayır sorularında ve emir cümlelerinde çekimli fiil 1. sıradadır: Hast du Hunger? Mach das Fenster zu!
- und, aber, oder, denn, sondern'den sonra ana cümle sırası değişmez: …, denn er ist krank.
- Başka bir öğe başa alınabilir (nesne, Partizip, yan cümle); fiil 2. sıradaysa bu hata DEĞİLDİR.
- Konuşma dilinde der, die, das gösterme zamiri olarak ana cümlenin öznesi olabilir (ör. "Der ist nett.", "Das weiß ich nicht."); bunları hata sayma ve ilgi cümlesi (Relativsatz) sanma.
Hâl adları (her açıklamada aynen bunları kullan, başka karşılık uydurma):
- Nominativ = yalın hâl, Akkusativ = -i hâli (belirtme), Dativ = -e hâli (yönelme), Genitiv = -in hâli (tamlayan).
- "-de hâli" deme. Yer bildiren edatlarda: "Wo? (nerede?) sorusunda Dativ, Wohin? (nereye?) sorusunda Akkusativ" de.
- Emin olmadığın bir şeyi hata olarak gösterme; iki biçim de doğruysa (ör. nächstes Mal / das nächste Mal, zu dem / zum) hata değildir.
- Bir kelimenin birden çok anlamı olabilir (ör. "Bank": banka ya da bank); hangi anlamda kullanıldığını cümlenin bağlamından çıkar ve cümlenin anlamını değiştiren bir düzeltme önerme.
Metin türüne göre (sadece dil ve resmiyet hatalarını işaretle; içeriği, uzunluğu ve görevi yerine getirip getirmediğini değerlendirme):
- E-posta metni "Betreff: …" satırıyla başlayabilir (konu satırı; telc); bu satır doğrudur, hitap onun altındadır. Betreff satırında nokta gerekmez.
- E-posta ve mesajlarda hitaptan sonra virgül gelir ve sonraki satır küçük harfle başlar (Liebe Lena, / wie geht es dir?). Hitaptan sonraki ilk kelime büyük harfle yazılmışsa (Vielen Dank …, Leider …, Wie geht …) hata say; isimler ve Sie, Ihnen, Ihr hariç. Kapanış selamından (Viele Grüße, Liebe Grüße, Mit freundlichen Grüßen) sonra virgül ve nokta gelmez. Kısa kapanışlar (Grüße, Gruß, Bis bald, LG) da doğrudur; uygun kapanışı hata sayma, sadece resmiyet derecesine uymayanı işaretle. Liebe kadına, Lieber erkeğe; Sehr geehrte Frau …, Sehr geehrter Herr ….
- Gayriresmî e-posta ve Kısa mesaj (du): arkadaşa du ile yazılır. Metinde du ile Sie karışırsa (dich/Sie, dein/Ihr) hata say. Mektupta du, dich, dein büyük ya da küçük yazılabilir; ikisi de doğru.
- Yarı resmî e-posta (Sie; tanıdık biri: kurs öğretmeni, şef, ev sahibi, komşu): Sie, Ihnen, Ihr her zaman büyük harfle. Bu kişiye du, dich, dein ya da Tschüss, Hi kullanmak resmiyet hatasıdır; açıklamada "Bu kişiye Sie ile yazılır" de. Liebe Frau … / Sehr geehrte Frau …, Hallo Frau …, Viele Grüße, Freundliche Grüße ve Mit freundlichen Grüßen burada doğrudur, hata sayma.
- Resmî yazı (Sie; tanımadığın biri ya da kurum): Hallo, Tschüss, Liebe Grüße, du ve dein resmiyet hatasıdır; doğrusu Sehr geehrte Damen und Herren, / Sehr geehrte Frau …, ve Mit freundlichen Grüßen.
- Forum yazısı (görüş): hitap ve imza gerekmez; Hallo zusammen da olabilir. Okurlara ihr ile ya da genel (man) yazmak doğrudur. Görüş kalıplarında fiil sırasına bak: Meiner Meinung nach ist … doğru, "Meiner Meinung nach ich finde" yanlış.
Seviye A1 (görev adında "A1" geçiyorsa; kısa mesaj, yaklaşık 30 kelime):
- Sadece açık hataları işaretle. Basit ama doğru cümleleri daha "güzel" yapmaya çalışma; bunlar hata DEĞİLDİR.
- A1'de beklenmeyen yapıları (yan cümle, Präteritum, Konjunktiv II, Passiv) önerme; bunların yokluğunu eksik sayma. Düzeltmede de sadece A1 kelime ve yapılarını kullan.
- Açıklamaları en basit Türkçeyle, tek kısa cümleyle yaz.
- Ama A1'de de şunlar her zaman hatadır, mutlaka işaretle: çekimli fiilin yeri ve mastarın (kommen, gehen …) cümle sonunda olmaması, hâl ve çoğul ekleri, du/Sie karışması, uygunsuz hitap ve kapanış, hitaptan sonraki satırın büyük harfle başlaması (Das Fenster … → das Fenster …).
- Sonra düzeltilmiş metnin tamamını ver.
- SADECE şu biçimde JSON ile cevap ver:
{"fehler":[{"original":"...","korrektur":"...","erklaerung":"..."}],"korrigierter_text":"..."}
- Hata yoksa: {"fehler":[],"korrigierter_text":"<metnin aslı>"}`;

const EXAM_NAMES = { goethe: 'Goethe', telc: 'telc', testdaf: 'TestDaF', dtz: 'DTZ', osd: 'ÖSD' };
// Set dosyasındaki textType → yapay zekâya giden "Metin türü" satırı (talimattaki kurallarla aynı adlar).
export const TEXT_TYPES = {
  'email-informal': 'Gayriresmî e-posta (du), arkadaşa',
  sms: 'Kısa mesaj (du), arkadaşa',
  'email-semiformal': 'Yarı resmî e-posta (Sie), tanıdık birine',
  'email-formal': 'Resmî yazı (Sie), tanımadığın birine ya da bir kuruma',
  forum: 'Forum yazısı (görüş)'
};

// ---------- Firestore REST değerleri ----------
export function decode(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  return null;
}
const decodeFields = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, decode(v)]));
export function encode(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
}

// ---------- Yardımcılar ----------
export function berlinDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

// Model yanıtındaki JSON'u ayıklar ve denetler: yanlış kısım metinde aynen geçmeli, düzeltme farklı olmalı.
export function cleanResult(raw, text) {
  const s = String(raw || '');
  const from = s.indexOf('{'), to = s.lastIndexOf('}');
  if (from < 0 || to <= from) return null;
  let data;
  try { data = JSON.parse(s.slice(from, to + 1)); } catch (_) { return null; }
  const list = Array.isArray(data?.fehler) ? data.fehler : null;
  if (!list) return null;
  const seen = new Set();
  const errors = [];
  // Hitap virgülle bitiyorsa sonraki satır küçük harfle başlar (Liebe Lena, / wie geht …). Model bazen bunu "düzeltip"
  // büyük harfe çeviriyor; doğru olanı bozan bu öneri atılır.
  // İlk satır "Betreff: …" ise (telc B1) hitap ikinci satırdadır.
  const lines = text.split('\n');
  const g = /^\s*Betreff\s*:/i.test(lines[0] || '') ? 1 : 0;
  const afterGreeting = /,\s*$/.test(lines[g] || '') ? (lines[g + 1] || '').trimStart() : '';
  const capitalizesAfterGreeting = (original, korrektur) => afterGreeting && /^\p{Ll}/u.test(original) && afterGreeting.startsWith(original)
    && korrektur === original.charAt(0).toUpperCase() + original.slice(1);
  for (const item of list) {
    const original = typeof item?.original === 'string' ? item.original.trim() : '';
    const korrektur = typeof item?.korrektur === 'string' ? item.korrektur.trim() : '';
    const erklaerung = typeof item?.erklaerung === 'string' ? item.erklaerung.trim() : '';
    if (!original || !korrektur || !erklaerung || original === korrektur || !text.includes(original) || seen.has(original)) continue;
    if (capitalizesAfterGreeting(original, korrektur)) continue;
    seen.add(original);
    errors.push({ original: original.slice(0, 300), korrektur: korrektur.slice(0, 300), erklaerung: erklaerung.slice(0, 600) });
    if (errors.length >= 30) break;
  }
  const corrected = typeof data.korrigierter_text === 'string' ? data.korrigierter_text.slice(0, 6000) : '';
  return { errors, correctedText: corrected, model: MODEL };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } });
}
function cors(origin) {
  return origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : {};
}

// ---------- Firebase ----------
// API anahtarı Google Cloud'da web sitesi (HTTP referrer) ile kısıtlanmışsa istek sitenin adresinden geliyormuş gibi gönderilir.
const authHeaders = (env) => ({ 'Content-Type': 'application/json', ...(env.SITE_URL ? { Referer: `${env.SITE_URL.replace(/\/$/, '')}/` } : {}) });
let botToken = null; // { token, until }
async function botSignIn(env) {
  if (botToken && botToken.until > Date.now() + 60000) return botToken.token;
  const base = env.AUTH_BASE || 'https://identitytoolkit.googleapis.com';
  const r = await fetch(`${base}/v1/accounts:signInWithPassword?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: 'POST', headers: authHeaders(env),
    body: JSON.stringify({ email: env.AI_EMAIL, password: env.AI_PASSWORD, returnSecureToken: true })
  });
  if (!r.ok) throw new Error(`bot sign-in ${r.status}`);
  const d = await r.json();
  botToken = { token: d.idToken, until: Date.now() + Number(d.expiresIn || 3600) * 1000 };
  return botToken.token;
}
export function resetBotToken() { botToken = null; }

async function studentUid(env, idToken) {
  const base = env.AUTH_BASE || 'https://identitytoolkit.googleapis.com';
  const r = await fetch(`${base}/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: 'POST', headers: authHeaders(env), body: JSON.stringify({ idToken })
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d?.users?.[0]?.localId || null;
}

function db(env, token) {
  const root = `${env.FIRESTORE_BASE || 'https://firestore.googleapis.com'}/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return {
    name: (path) => `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
    async get(path) {
      const r = await fetch(`${root}/${path}`, { headers });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`get ${path} ${r.status}`);
      const d = await r.json();
      return { data: decodeFields(d.fields), updateTime: d.updateTime };
    },
    async commit(writes) {
      const r = await fetch(`${root}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
      if (!r.ok) { const e = new Error(`commit ${r.status}`); e.status = r.status; e.body = await r.text(); throw e; }
      return r.json();
    }
  };
}

// Görev adı ve metin türü sitedeki set dosyasından okunur: "Goethe B1 · Teil 1 · Neue Wohnung", textType.
async function taskInfo(env, w) {
  const ok = [w.exam, w.level, w.set].every((v) => typeof v === 'string' && /^[a-z0-9-]{1,20}$/.test(v)) && Number.isInteger(w.teil);
  const fallback = { name: `${EXAM_NAMES[w.exam] || 'Sınav'} ${String(w.level || '').toUpperCase()} · Teil ${w.teil}`, type: null };
  if (!ok || !env.SITE_URL) return fallback;
  try {
    const r = await fetch(`${env.SITE_URL.replace(/\/$/, '')}/data/exams/${w.exam}/${w.level}/schreiben/teil-${w.teil}/${w.set}.json`);
    if (!r.ok) return fallback;
    const set = await r.json();
    return {
      name: typeof set.title === 'string' ? `${fallback.name} · ${set.title.slice(0, 80)}` : fallback.name,
      type: TEXT_TYPES[set.textType] || null
    };
  } catch (_) { return fallback; }
}

// Yapay zekâya giden kullanıcı mesajı: sadece görev adı, metin türü ve metin (ad, e-posta, uid yok).
export const userMessage = (task, text) => `Görev: ${task.name}\n${task.type ? `Metin türü: ${task.type}\n` : ''}Metin:\n${text}`;

// Hesap açık mı ve yapay zekâ kontrolüne izin var mı: 16 yaş altında veli onayı VE ayrı yapay zekâ onayı gerekir.
export function aiAllowed(profile) {
  if (!profile || profile.status !== 'active') return false;
  if (profile.minor === false) return profile.aiConsent?.given !== false;
  return profile.parentConsent?.given === true && profile.aiConsent?.given === true;
}

async function runModel(env, task, text) {
  const result = await env.AI.run(MODEL, {
    messages: [{ role: 'system', content: PROMPT }, { role: 'user', content: userMessage(task, text) }],
    max_tokens: 1500, temperature: 0.2, chat_template_kwargs: { enable_thinking: false }
  });
  return typeof result?.response === 'string' ? result.response
    : result?.choices?.[0]?.message?.content || (typeof result === 'string' ? result : JSON.stringify(result?.response || ''));
}

// ---------- İstek ----------
export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');
    const okOrigin = origin && allowed.includes(origin) ? origin : null;
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: okOrigin ? 204 : 403, headers: cors(okOrigin) });
    if (url.pathname !== '/check' || request.method !== 'POST') return json({ status: 'not-found' }, 404, okOrigin);
    if (!okOrigin) return json({ status: 'forbidden' }, 403, null);

    let body;
    try { body = await request.json(); } catch (_) { return json({ status: 'bad-request' }, 400, okOrigin); }
    const writingId = body?.writingId;
    if (typeof writingId !== 'string' || !/^[A-Za-z0-9]{10,40}$/.test(writingId)) return json({ status: 'bad-request' }, 400, okOrigin);
    const idToken = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!idToken) return json({ status: 'unauthorized' }, 401, okOrigin);

    try {
      const uid = await studentUid(env, idToken);
      if (!uid || !/^[A-Za-z0-9]{1,128}$/.test(uid)) return json({ status: 'unauthorized' }, 401, okOrigin);
      const store = db(env, await botSignIn(env));

      const settings = await store.get('settings/ai');
      const mode = settings?.data?.mode;
      if (mode !== 'draft' && mode !== 'instant') return json({ status: 'off' }, 200, okOrigin);

      const profile = await store.get(`users/${uid}`);
      if (!aiAllowed(profile?.data)) return json({ status: 'not-allowed' }, 200, okOrigin);

      const writing = await store.get(`users/${uid}/writings/${writingId}`);
      if (!writing) return json({ status: 'not-found' }, 404, okOrigin);
      const w = writing.data;
      if (typeof w.text !== 'string' || !w.text.trim()) return json({ status: 'bad-request' }, 400, okOrigin);
      if (w.aiAt) return json({ status: 'exists' }, 200, okOrigin);

      const day = berlinDay();
      const [mine, all] = await Promise.all([store.get(`aiLimits/${uid}`), store.get('aiLimits/_global')]);
      const count = (doc) => (doc?.data?.day === day ? Number(doc.data.count) || 0 : 0);
      if (count(mine) >= LIMIT_STUDENT || count(all) >= LIMIT_GLOBAL) return json({ status: 'limit' }, 200, okOrigin);

      let raw;
      try { raw = await runModel(env, await taskInfo(env, w), w.text); }
      catch (error) { console.error('model', String(error)); return json({ status: 'unavailable' }, 503, okOrigin); }
      const result = cleanResult(raw, w.text);

      const limitWrite = (path, doc, n) => ({
        update: { name: store.name(path), fields: { day: encode(day), count: encode(n) } },
        updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
        currentDocument: doc ? { updateTime: doc.updateTime } : { exists: false }
      });
      const writes = [limitWrite(`aiLimits/${uid}`, mine, count(mine) + 1), limitWrite('aiLimits/_global', all, count(all) + 1)];
      if (result && mode === 'draft') {
        writes.push({
          update: { name: store.name(`aiDrafts/${uid}_${writingId}`), fields: {
            uid: encode(uid), writingId: encode(writingId), errors: encode(result.errors), correctedText: encode(result.correctedText), model: encode(result.model)
          } },
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { exists: false }
        });
      } else if (result && mode === 'instant') {
        writes.push({
          update: { name: store.name(`users/${uid}/writings/${writingId}`), fields: { aiFeedback: encode(result) } },
          updateMask: { fieldPaths: ['aiFeedback'] },
          updateTransforms: [{ fieldPath: 'aiAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { exists: true }
        });
      }
      try { await store.commit(writes); }
      catch (error) {
        // Aynı metin ikinci kez geldi ya da sayaç bu arada değişti.
        if (error.status === 400 || error.status === 409 || error.status === 412 || error.status === 403) return json({ status: 'busy' }, 409, okOrigin);
        throw error;
      }
      return json({ status: result ? mode : 'no-result' }, 200, okOrigin);
    } catch (error) {
      console.error(String(error));
      return json({ status: 'error' }, 500, okOrigin);
    }
  }
};
