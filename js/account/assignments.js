// Ödevlerin ortak yardımcıları: öğretmenin ödev sayfası (ogretmen-odevler.html), yeni/düzenle formu (ogretmen-odev.html)
// ve öğrencinin "Ödevlerim" sayfası (odevlerim.html) aynı veri biçimini kullanır.
//
// users/{uid}/assignments/{id} (her öğrenciye ayrı kopya, ortak groupId):
//   title, description, dueAt (Timestamp | null: teslim tarihi isteğe bağlı), createdAt, groupId, schemaVersion: 2
//   links:     [{ url, title, kind: 'web' | 'youtube' | 'docs' | 'drive' | 'pdf', copy }]  (http/https, en çok 10)
//   topics:    [{ level, topic }]                (konunun bütün paketleri; paket listesi ekranda katalogdan okunur)
//   exercises: [{ level, topic, exercise }]      (tek tek seçilen paketler, sınav setleri, Schreiben görevleri)
//   done, doneAt, studentDocUrl                  (öğrencinin değiştirebildiği tek alanlar, firestore.rules)
// Eski ödevler (schemaVersion yok): docUrl + copyPerStudent tek bir bağlantı olarak okunur; veritabanına yazılmaz.
import { berlinParts, bestResultSince, BERLIN, exerciseNames, h, LEVEL_EXAM, loadTopicExercises, SINAV, toDate, WRITING } from './common.js';

export const SCHEMA_VERSION = 2;
export const MAX_LINKS = 10;
export const MAX_URL = 1000;
export const LINK_KINDS = ['web', 'youtube', 'docs', 'drive', 'pdf'];

// Sadece http ve https; kullanıcı adı/şifre içeren adresler reddedilir.
export function validLinkUrl(value){
  const url = String(value || '').trim();
  if(!url || url.length > MAX_URL || /[\s<>"]/.test(url)) return false;
  try{
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') && Boolean(u.hostname) && !u.username && !u.password;
  }catch(_){
    return false;
  }
}

export function linkKind(url){
  let host = '';
  try{ host = new URL(url).hostname.toLowerCase(); }catch(_){ return 'web'; }
  if(/(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/.test(host)) return 'youtube';
  if(host === 'docs.google.com') return 'docs';
  if(host === 'drive.google.com') return 'drive';
  if(/\.pdf($|[?#])/i.test(url)) return 'pdf';
  return 'web';
}

// Bağlantı için kısa bir ad: başlık yoksa alan adı ve yolun başı.
export function linkLabel(link){
  if(link.title) return link.title;
  try{
    const u = new URL(link.url);
    const rest = u.pathname.length > 1 ? u.pathname.slice(0, 24) + (u.pathname.length > 24 ? '…' : '') : '';
    return u.hostname.replace(/^www\./, '') + rest;
  }catch(_){
    return link.url;
  }
}

// "23.11.2026" (Berlin günü).
const dayFmt = new Intl.DateTimeFormat('de-DE', { timeZone: BERLIN, day: '2-digit', month: '2-digit', year: 'numeric' });
export const berlinDateLabel = (date) => dayFmt.format(date);
export const defaultTitle = (now = new Date()) => berlinDateLabel(now);

// Eski ve yeni biçimi tek biçime çevirir (yalnızca okurken).
export function normalizeAssignment(a){
  const legacy = !a.schemaVersion;
  let links = Array.isArray(a.links) ? a.links.filter((l) => l && validLinkUrl(l.url)) : [];
  if(!Array.isArray(a.links) && a.docUrl && validLinkUrl(a.docUrl)){
    links = [{ url: a.docUrl, title: '', kind: 'docs', copy: a.copyPerStudent === true }];
  }
  return {
    ...a,
    legacy,
    title: a.title || '',
    description: a.description || '',
    links: links.map((l) => ({ url: l.url, title: l.title || '', kind: LINK_KINDS.includes(l.kind) ? l.kind : linkKind(l.url), copy: l.copy === true })),
    topics: Array.isArray(a.topics) ? a.topics.filter((t) => t?.level && t?.topic) : [],
    exercises: Array.isArray(a.exercises) ? a.exercises.filter((e) => e?.level && e?.topic && e?.exercise) : [],
    due: toDate(a.dueAt),
    created: toDate(a.createdAt) || toDate(a.dueAt)
  };
}

// Tarih başlıkları: ödevin verildiği gün (Berlin), en yeni gün üstte; gün içinde en yeni üstte.
export function groupByDay(items, dateOf = (x) => x.created){
  const days = new Map();
  for(const item of items){
    const date = dateOf(item);
    const key = date ? berlinParts(date).key : '0000-00-00';
    if(!days.has(key)) days.set(key, { key, label: date ? berlinDateLabel(date) : '—', items: [] });
    days.get(key).items.push(item);
  }
  const list = [...days.values()].sort((a, b) => b.key.localeCompare(a.key));
  list.forEach((d) => d.items.sort((a, b) => (dateOf(b) || 0) - (dateOf(a) || 0)));
  return list;
}

const exKey = (e) => `${e.level}/${e.topic}/${e.exercise}`;

// Ödevdeki bütün alıştırmalar: konunun tamamı (katalogdan, sonradan eklenen paketler de) + tek tek seçilenler.
// Her biri: { level, topic, exercise, topicTitle, title, wholeTopic }.
export async function expandExercises(a, lang = 'tr'){
  const list = [];
  const seen = new Set();
  for(const t of a.topics){
    const exercises = await loadTopicExercises(t.level, t.topic).catch(() => []);
    for(const ex of exercises){
      const item = { level: t.level, topic: t.topic, exercise: ex.id, wholeTopic: true };
      if(seen.has(exKey(item))) continue;
      seen.add(exKey(item));
      list.push(item);
    }
  }
  for(const e of a.exercises){
    if(seen.has(exKey(e))) continue;
    seen.add(exKey(e));
    list.push({ level: e.level, topic: e.topic, exercise: e.exercise, wholeTopic: false });
  }
  const names = await exerciseNames(list, lang).catch(() => ({}));
  return list.map((e) => ({ ...e, topicTitle: names[exKey(e)]?.topic || e.topic, title: names[exKey(e)]?.exercise || e.exercise }));
}

// Konu adı (topics listesi için): exerciseNames ilk alıştırmadan konu adını verir.
export async function topicTitles(topics, lang = 'tr'){
  const out = {};
  for(const t of topics){
    const first = (await loadTopicExercises(t.level, t.topic).catch(() => []))[0];
    const names = first ? await exerciseNames([{ level: t.level, topic: t.topic, exercise: first.id }], lang).catch(() => ({})) : {};
    out[`${t.level}/${t.topic}`] = Object.values(names)[0]?.topic || t.topic;
  }
  return out;
}

// Her alıştırma için ödev verildikten sonraki en iyi sonuç.
export function withResults(exercises, results, since){
  return exercises.map((e) => ({ ...e, best: bestResultSince(results, e, since) }));
}

// "Konunun tamamı" sadece normal konular için (sınav setleri, Schreiben ve seviye sonu sınavı tek tek seçilir).
export const wholeTopicAllowed = (topic) => Boolean(topic) && ![WRITING, SINAV, LEVEL_EXAM].includes(topic);

// Dış bağlantı: h() yalnızca https'e izin verdiği için (http bağlantıları da kabul ediliyor) href burada,
// validLinkUrl denetiminden sonra yazılır. Her zaman yeni sekmede ve rel="noopener noreferrer" ile açılır.
export function externalLink(url, attrs, ...children){
  if(!validLinkUrl(url)) return h('span', { class: attrs?.class }, ...children);
  const a = h('a', { ...attrs, target: '_blank', rel: 'noopener noreferrer' }, ...children);
  a.setAttribute('href', String(url).trim());
  return a;
}

export const KIND_LABELS = { web: 'Web', youtube: 'YouTube', docs: 'Docs', drive: 'Drive', pdf: 'PDF' };

// Bağlantı "çipi": tür etiketi + ad. copy ise Docs'un /copy bağlantısı (her öğrenci kendi kopyasını alır).
export function linkChip(link, { copyLabel = 'kopya', extra } = {}){
  const tag = h('span', { class: `odev-tag odev-tag-${link.kind}` }, KIND_LABELS[link.kind] + (link.copy ? ` · ${copyLabel}` : ''));
  return externalLink(link.url, { class: 'odev-chip' }, tag, h('span', { class: 'odev-chip-text' }, linkLabel(link)), extra || null);
}

// Ödevin içeriği (öğretmen ve öğrenci sayfalarında aynı): açıklama, bağlantılar, alıştırmalar ve durumları.
// tx(key) metinleri verir (öğrenci: i18n, öğretmen: Türkçe sabitler). exercises: expandExercises + withResults çıktısı;
// showStatus false ise (öğretmenin "tüm öğrenciler" görünümü) çözüldü/çözülmedi rozeti yazılmaz.
export function assignmentBody(a, exercises, { tx, showStatus = true, scoreText = (r) => `${r.score}/${r.total}`, exerciseUrl }){
  const parts = [];
  if(a.description) parts.push(h('p', { class: 'odev-text' }, a.description));
  if(a.links.length){
    parts.push(h('div', { class: 'odev-chips', role: 'list', 'aria-label': tx('assignLinks') },
      a.links.map((l) => h('span', { role: 'listitem' }, linkChip(l, { copyLabel: tx('assignCopyShort') })))));
    if(a.links.some((l) => l.copy)) parts.push(h('p', { class: 'acc-hint' }, tx('assignCopyHint')));
  }
  if(exercises.length){
    const blocks = new Map();
    for(const e of exercises){
      const key = e.wholeTopic ? `${e.level}/${e.topic}` : '';
      if(!blocks.has(key)) blocks.set(key, { whole: e.wholeTopic, head: e.wholeTopic ? `${e.level} · ${e.topicTitle} · ${tx('assignWholeTopic')}` : tx('assignExercises'), items: [] });
      blocks.get(key).items.push(e);
    }
    const ordered = [...blocks.values()].sort((x, y) => Number(y.whole) - Number(x.whole));
    parts.push(h('div', { class: 'odev-exercises' }, ordered.map((b) => h('div', { class: 'odev-ex-block' },
      h('h4', {}, b.head),
      h('ul', { class: 'odev-ex-list' }, b.items.map((e) => h('li', {},
        h('a', { class: 'ba-link', href: exerciseUrl(e) }, b.whole ? e.title : `${e.level} · ${e.topicTitle} · ${e.title}`),
        showStatus ? h('span', { class: `acc-badge ${e.best ? 'success' : ''}` }, e.best ? `${tx('assignSolved')} · ${scoreText(e.best)}` : tx('assignNotSolved')) : null)))))));
  }
  return parts;
}

// "2/6" gibi çözülen paket sayısı (sadece alıştırma varsa).
export function solvedCount(exercises){
  return exercises.length ? { solved: exercises.filter((e) => e.best).length, total: exercises.length } : null;
}
