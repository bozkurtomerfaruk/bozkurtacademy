// Giriş, kayıt ve panellerin ortak yardımcıları.
import { auth, db, fs } from './firebase.js';

export const $ = (id) => document.getElementById(id);

// Güvenli eleman oluşturucu: metinler her zaman textContent olarak eklenir.
export function h(tag, attrs = {}, ...children){
  const el = document.createElement(tag);
  for(const [key, value] of Object.entries(attrs || {})){
    if(value == null || value === false) continue;
    if(key === 'class') el.className = value;
    else if(key === 'dataset') Object.assign(el.dataset, value);
    else if(key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2), value);
    else if(value === true) el.setAttribute(key, '');
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
  let ok = false;
  try{ ok = new URL(url).protocol === 'https:'; }catch(_){}
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

// Denemeleri alıştırma başına özetler: deneme sayısı, son skor, en iyi skor, son tarih.
export function summarizeResults(results){
  const groups = new Map();
  for(const r of results){
    const key = `${r.level}/${r.topic}/${r.exercise}`;
    const at = toDate(r.at);
    const g = groups.get(key) || { key, level: r.level, topic: r.topic, exercise: r.exercise, attempts: [], best: null, last: null };
    const attempt = { score: r.score, total: r.total, at };
    g.attempts.push(attempt);
    if(!g.best || r.score / r.total > g.best.score / g.best.total) g.best = attempt;
    if(!g.last || (at && at > g.last.at)) g.last = attempt;
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
