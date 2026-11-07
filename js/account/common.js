// Giriş, kayıt ve panellerin ortak yardımcıları.
import { auth, db, fa, fs } from './firebase.js';
import '../html.js'; // window.baHtml (escapeHtml, safeUrl): sitenin geri kalanıyla aynı denetim
const { safeUrl } = window.baHtml;

export const $ = (id) => document.getElementById(id);

// Güvenli eleman oluşturucu: metinler her zaman textContent olarak eklenir. href/src yalnızca https: ya da göreli
// olabilir (Firestore'dan gelen meetUrl, docUrl…); başka bir şema (javascript:, data:, http:) gelirse nitelik yazılmaz.
export function h(tag, attrs = {}, ...children){
  const el = document.createElement(tag);
  for(const [key, value] of Object.entries(attrs || {})){
    if(value == null || value === false) continue;
    if(key === 'class') el.className = value;
    else if(key === 'dataset') Object.assign(el.dataset, value);
    else if(key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else if(value === true) el.setAttribute(key, '');
    else if(key === 'href' || key === 'src'){ const url = safeUrl(value); if(url) el.setAttribute(key, url); }
    else el.setAttribute(key, value);
  }
  for(const child of children.flat()){
    if(child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

// Bağlantılar sadece https olabilir ve yeni sekmede açılır.
export function safeLink(url, text){
  const ok = /^https:/i.test(safeUrl(url));
  if(!ok) return h('span', {}, text);
  return h('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, text);
}

// Yaş: sadece doğum yılı bilindiği için bu yıl 16'ya girenler de 16 yaş altı sayılır (kurallarla aynı).
export const currentYear = () => new Date().getUTCFullYear();
export const isMinorBirthYear = (year) => currentYear() - year <= 16;
export const validBirthYear = (year) => Number.isInteger(year) && year >= currentYear() - 100 && year <= currentYear() - 5;
export const validEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.length <= 254;

export const LOCALES = { tr: 'tr-TR', de: 'de-DE', en: 'en-GB' };
export const BERLIN = 'Europe/Berlin';

export function toDate(value){
  if(!value) return null;
  if(value instanceof Date) return value;
  if(typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

export function formatDateTime(value, { lang = 'tr', timeZone } = {}){
  const date = toDate(value);
  if(!date) return '—';
  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.tr, { dateStyle: 'medium', timeStyle: 'short', timeZone }).format(date);
}

export function formatDate(value, { lang = 'tr', timeZone } = {}){
  const date = toDate(value);
  if(!date) return '—';
  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.tr, { dateStyle: 'medium', timeZone }).format(date);
}

// Menüdeki "Giriş/Panelim" bağlantısı ve index.html'de Firebase'in yüklenip yüklenmeyeceği için ipucu.
// İçinde kişisel veri yok: sadece "student" ya da "teacher".
const HINT = 'baAccount';
export function setHint(role){ try{ localStorage.setItem(HINT, role); }catch(_){} }
export function clearHint(){ try{ localStorage.removeItem(HINT); }catch(_){} }
export function getHint(){ try{ return localStorage.getItem(HINT); }catch(_){ return null; } }

export function authErrorKey(error){
  switch(error?.code){
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'loginWrong';
    case 'auth/invalid-email': return 'regErrEmail';
    case 'auth/email-already-in-use': return 'regErrEmailInUse';
    case 'auth/weak-password': return 'regErrPassword';
    case 'auth/too-many-requests': return 'accErrorTooMany';
    case 'auth/network-request-failed':
    case 'unavailable':
      return 'accErrorNetwork';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'accErrorPopup';
    case 'permission-denied': return 'regErrSave';
    default: return 'accErrorGeneric';
  }
}

// Kullanıcının giriş durumunu bir kez bekler.
export function currentUser(){
  return new Promise((resolve) => {
    const stop = auth.onAuthStateChanged((user) => { stop(); resolve(user); });
  });
}

export async function loadProfile(uid){
  const snap = await fs.getDoc(fs.doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export const consentGiven = (profile) => profile?.parentConsent?.given === true;

// E-posta doğrulama: bağlantı öğrenci paneline döner. Google hesapları zaten doğrulanmıştır.
export function sendVerification(user, language){
  auth.languageCode = language || 'tr';
  return fa.sendEmailVerification(user, { url: `${location.origin}/panel.html` });
}

// Öğrenci bağlantıya tıkladıysa profile "emailVerified: true" yazılır (kurallar bunu giriş
// bilgisindeki email_verified ile kontrol eder). Öğretmen panelde bu bilgiyi görür.
export async function syncEmailVerified(user, profile){
  if(profile.emailVerified === true) return true;
  await user.reload();
  if(!user.emailVerified) return false;
  await user.getIdToken(true);
  await fs.updateDoc(fs.doc(db, 'users', user.uid), { emailVerified: true });
  profile.emailVerified = true;
  return true;
}

// Hesabın öğrenci açısından durumu. Kurallardaki isActive() ile aynı mantık.
export function accountState(profile){
  if(!profile) return 'none';
  if(profile.status === 'inactive') return 'inactive';
  if(profile.minor && !consentGiven(profile)) return 'parent';
  if(profile.status !== 'active') return 'pending';
  return 'active';
}

// Alıştırma adları: data/catalog.json ve konu dosyalarından, sadece gereken konular yüklenir.
let catalogPromise = null;
const topicCache = new Map();

function loadCatalog(){
  catalogPromise ||= fetch('data/catalog.json').then((r) => r.json());
  return catalogPromise;
}

export async function loadCatalogLevels(){
  return (await loadCatalog()).levels || [];
}

// Seviye sonu sınavı (#seviye-sonu/A1, js/level-exam.js): sonuçlarda konu "seviye-sonu", alıştırma "a1".
// Seviyenin sınavı data/catalog.json'da "levelExam" ile bağlı.
export const LEVEL_EXAM = 'seviye-sonu';
const LEVEL_EXAM_NAMES = {
  topic: { tr: 'Seviye sonu sınavı', de: 'Abschlusstest', en: 'End-of-level test' },
  exercise: (level) => ({ tr: `${level} seviye sonu sınavı`, de: `Abschlusstest ${level}`, en: `${level} end-of-level test` })
};
export const levelExamTopic = (lang = 'tr') => localize(LEVEL_EXAM_NAMES.topic, lang);

// "perfekt:2,akkusativ:1" → "Perfekt 2, Akkusativ 1" (konu adları katalogdan).
export async function topicErrorsText(levelId, value, lang = 'tr'){
  if(!value) return '';
  const level = (await loadCatalogLevels().catch(() => [])).find((l) => l.id === levelId);
  return value.split(',').filter(Boolean).map((part) => {
    const [id, n] = part.split(':');
    return `${localize(level?.topics?.find((t) => t.id === id)?.title, lang) || id} ${n}`;
  }).join(', ');
}

// Schreiben (sınav hazırlığı): yazma görevleri js/examsData.js'teki "schreiben" bölümlerinden okunur.
// Ödevde konu "schreiben", alıştırma "goethe-b1-1-set-1" (sınav-seviye-teil-set); metinler users/{uid}/writings'te.
export const WRITING = 'schreiben';
const EXAMS_DATA = 'js/examsData.js?v=16'; // index.html'deki sürümle aynı tutulmalı
let examsData = null;
export function loadExamsData(){
  examsData ||= new Promise((resolve, reject) => {
    if(window.BA_EXAMS) return resolve(window.BA_EXAMS);
    const script = document.createElement('script');
    script.src = EXAMS_DATA;
    script.onload = () => resolve(window.BA_EXAMS);
    script.onerror = () => { examsData = null; reject(new Error('examsData')); };
    document.head.append(script);
  });
  return examsData;
}

// [{ id: 'goethe-b1-1-set-1', exam, level, teil, set, title: 'Goethe B1 · Teil 1 · Neue Wohnung', catalogLevel: 'B1' }]
export async function writingTasks(){
  const data = await loadExamsData();
  const list = [];
  for(const exam of data?.exams || []) for(const level of exam.levels || []) for(const section of level.sections || []){
    if(section.id !== WRITING) continue;
    section.teile.forEach((teil, index) => (teil.exercises || []).filter((e) => e?.set).forEach((e) => {
      const code = data.levels?.[level.id]?.code || level.id.toUpperCase();
      list.push({
        id: `${exam.id}-${level.id}-${index + 1}-${e.set}`, exam: exam.id, level: level.id, teil: index + 1, set: e.set,
        title: `${exam.shortName || exam.name.replace(/-Zertifikat$/, '')} ${localize(code)} · Teil ${index + 1} · ${localize(e.title)}`,
        catalogLevel: String(localize(code)).toUpperCase()
      });
    }));
  }
  return list;
}
export const writingId = (w) => `${w.exam}-${w.level}-${w.teil}-${w.set}`;
export async function writingTitle(w){
  return (await writingTasks().catch(() => [])).find((x) => x.id === writingId(w))?.title || `${w.exam} ${w.level} · Teil ${w.teil} · ${w.set}`;
}
export function writingUrl({ exam, level, teil, set }){
  return `index.html#exams/${[exam, level, WRITING, String(teil), set].map(encodeURIComponent).join('/')}`;
}
// Öğrenci geri bildirimi henüz açmadıysa yeni sayılır.
// Yeni geri bildirim: öğretmenin geri bildirimi (feedbackAt) ya da "Anında göster" modundaki yapay zekâ önerisi (aiAt).
export const feedbackTime = (w) => Math.max(toDate(w.feedbackAt)?.getTime() || 0, toDate(w.aiAt)?.getTime() || 0);
export const unseenFeedback = (w) => feedbackTime(w) > 0 && (!w.seenAt || toDate(w.seenAt).getTime() < feedbackTime(w));

export async function loadWritings(uid){
  const snap = await fs.getDocs(fs.collection(db, 'users', uid, 'writings'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (toDate(b.at) || 0) - (toDate(a.at) || 0));
}

// Ödev oluştururken: bir konunun alıştırmaları (data/<seviye>/<konu>.json).
export async function loadTopicExercises(levelId, topicId){
  if(topicId === WRITING){
    return (await writingTasks()).filter((w) => w.catalogLevel === levelId).map((w) => ({ id: w.id, title: w.title }));
  }
  const levels = await loadCatalogLevels();
  if(topicId === LEVEL_EXAM){
    const level = levels.find((l) => l.id === levelId);
    return level?.levelExam ? [{ id: levelId.toLowerCase(), title: LEVEL_EXAM_NAMES.exercise(levelId) }] : [];
  }
  const topic = levels.find((l) => l.id === levelId)?.topics?.find((t) => t.id === topicId);
  if(!topic?.path) return [];
  const data = await loadTopic(topic.path);
  return (data?.exercises || []).map((e) => ({ id: e.id, title: e.title }));
}

async function loadTopic(path){
  if(!topicCache.has(path)) topicCache.set(path, fetch(path).then((r) => r.json()).catch(() => null));
  return topicCache.get(path);
}

export function localize(value, lang = 'tr'){
  if(value == null) return '';
  if(typeof value === 'string') return value;
  return value[lang] || value.tr || value.de || value.en || '';
}

// { "A1/artikel/kontext-1": { topic, exercise, link } }
export async function exerciseNames(results, lang = 'tr'){
  const names = {};
  const levels = await loadCatalogLevels().catch(() => []);
  const needed = new Map();
  for(const r of results){
    const topic = levels.find((l) => l.id === r.level)?.topics?.find((tp) => tp.id === r.topic);
    if(topic?.path) needed.set(topic.path, topic);
  }
  await Promise.all([...needed.keys()].map(loadTopic));
  for(const r of results){
    const key = `${r.level}/${r.topic}/${r.exercise}`;
    if(names[key]) continue;
    if(r.topic === LEVEL_EXAM){
      names[key] = { topic: localize(LEVEL_EXAM_NAMES.topic, lang), exercise: localize(LEVEL_EXAM_NAMES.exercise(r.level), lang) };
      continue;
    }
    if(r.topic === WRITING){
      const task = (await writingTasks().catch(() => [])).find((w) => w.id === r.exercise);
      names[key] = { topic: 'Schreiben', exercise: task?.title || r.exercise };
      continue;
    }
    const topic = levels.find((l) => l.id === r.level)?.topics?.find((tp) => tp.id === r.topic);
    const data = topic?.path ? await loadTopic(topic.path) : null;
    const exercise = data?.exercises?.find((e) => e.id === r.exercise);
    names[key] = {
      topic: localize(topic?.title, lang) || r.topic,
      exercise: localize(exercise?.title, lang) || r.exercise
    };
  }
  return names;
}

// Denemeleri alıştırma başına özetler: deneme sayısı, ilk, son ve en iyi skor, son tarih.
export function summarizeResults(results){
  const groups = new Map();
  for(const r of results){
    const key = `${r.level}/${r.topic}/${r.exercise}`;
    const at = toDate(r.at);
    const g = groups.get(key) || { key, level: r.level, topic: r.topic, exercise: r.exercise, attempts: [], best: null, last: null, first: null };
    const attempt = { score: r.score, total: r.total, at, topicErrors: r.topicErrors };
    g.attempts.push(attempt);
    if(!g.best || r.score / r.total > g.best.score / g.best.total) g.best = attempt;
    if(!g.last || (at && at > g.last.at)) g.last = attempt;
    if(!g.first || (at && g.first.at && at < g.first.at)) g.first = attempt;
    groups.set(key, g);
  }
  const list = [...groups.values()];
  list.forEach((g) => g.attempts.sort((a, b) => (b.at || 0) - (a.at || 0)));
  return list.sort((a, b) => (b.last?.at || 0) - (a.last?.at || 0));
}

export async function loadResults(uid){
  const snap = await fs.getDocs(fs.collection(db, 'users', uid, 'results'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const scoreText = (a) => a ? `${a.score}/${a.total}` : '—';

export function setStatus(el, type, message){
  if(!el) return;
  el.hidden = !message;
  el.className = `acc-status${type ? ' ' + type : ''}`;
  el.textContent = message || '';
}

// Google Docs, Sheets ve Slides linkleri "/copy" biçimine çevrilir: her öğrenci kendi kopyasını alır.
// Tanınmayan linklerde null döner. Google Drive API kullanılmaz; sadece link.
const DOCS_RE = /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([A-Za-z0-9_-]+)/;
export function docsCopyUrl(url){
  const m = DOCS_RE.exec(String(url || '').trim());
  return m ? `https://docs.google.com/${m[1]}/d/${m[2]}/copy` : null;
}

// Öğrencinin kendi doküman linki: sadece Google Docs / Drive (kurallarla aynı).
export const validStudentDocUrl = (url) => url === '' || (url.length <= 500 && /^https:\/\/(docs|drive)\.google\.com\//.test(url));

export const validHttpsUrl = (url) => {
  try{ return new URL(url).protocol === 'https:' && url.length <= 1000; }catch(_){ return false; }
};

// Sitedeki alıştırmaya doğrudan bağlantı (js/exercise-links.js'teki adres biçimi).
export function exerciseUrl({ level, topic, exercise }){
  if(topic === LEVEL_EXAM) return `index.html#seviye-sonu/${encodeURIComponent(level)}`;
  if(topic === WRITING){
    const m = /^([a-z0-9]+)-([a-z0-9]+)-(\d+)-(set-\d+)$/.exec(exercise || '');
    if(m) return writingUrl({ exam: m[1], level: m[2], teil: m[3], set: m[4] });
  }
  return `index.html#exercises/${[level, topic, exercise].map(encodeURIComponent).join('/')}`;
}

// Berlin saatindeki "YYYY-MM-DDTHH:MM" değerini gerçek zamana çevirir (tarayıcının saat diliminden bağımsız).
function berlinOffsetMs(date){
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: BERLIN, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  }).formatToParts(date).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export function berlinInputToDate(value){
  const m = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/.exec(value || '');
  if(!m) return null;
  const guess = Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]);
  let date = new Date(guess - berlinOffsetMs(new Date(guess)));
  date = new Date(guess - berlinOffsetMs(date));
  return date;
}

export function dateToBerlinInput(date){
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: BERLIN, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).formatToParts(date).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export async function loadAssignments(uid){
  const snap = await fs.getDocs(fs.collection(db, 'users', uid, 'assignments'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function loadResources(uid){
  const snap = await fs.getDocs(fs.collection(db, 'users', uid, 'resources'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (toDate(b.createdAt) || 0) - (toDate(a.createdAt) || 0));
}

// Ödevdeki alıştırma bu ödev verildikten sonra çözüldü mü: en iyi sonuç.
export function bestResultSince(results, exercise, since){
  const from = toDate(since);
  let best = null;
  for(const r of results){
    if(r.level !== exercise.level || r.topic !== exercise.topic || r.exercise !== exercise.exercise) continue;
    const at = toDate(r.at);
    if(from && at && at < from) continue;
    if(!best || r.score / r.total > best.score / best.total) best = r;
  }
  return best;
}

// Takvim için Berlin duvar saati. Gün anahtarı "YYYY-MM-DD"; gün hesapları tarayıcının saat diliminden bağımsız.
const berlinFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: BERLIN, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short'
});
const WEEKDAYS = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

export function berlinParts(date){
  const p = Object.fromEntries(berlinFmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { key: `${p.year}-${p.month}-${p.day}`, y: +p.year, m: +p.month, d: +p.day, hh: +p.hour, mm: +p.minute, dow: WEEKDAYS[p.weekday], time: `${p.hour}:${p.minute}` };
}

export function addDaysToKey(key, days){
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

// Haftanın pazartesisi.
export function weekStartKey(key){
  const [y, m, d] = key.split('-').map(Number);
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
  return addDaysToKey(key, -dow);
}

export const berlinAt = (key, time) => berlinInputToDate(`${key}T${time}`);
export const todayKey = () => berlinParts(new Date()).key;
