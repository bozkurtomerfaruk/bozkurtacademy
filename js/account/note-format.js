// Ders defteri: içerik biçimi ve temizleme. DOM ve Firebase kullanmaz (node --test ile de çalışır).
// İçerik Quill Delta'sıdır ({ ops: [{ insert: 'metin', attributes: {...} }] }); Firestore'da JSON metni olarak saklanır.
// Öğretmenin editöründe yapıştırılan içerik de, öğrencinin ekranında gösterilen içerik de buradan geçer: yalnızca
// aşağıdaki biçimler kalır, geri kalan her şey (resim, video, HTML, stil, bilinmeyen alanlar) atılır.

// Renkler satır içi stil değil, sınıf olarak saklanır (ba-c-kirmizi, ba-bg-sari); karşılıkları css/base.css'teki
// --ba-note-* token'larında, açık ve koyu temada okunur.
export const NOTE_COLORS = ['kirmizi', 'mavi', 'yesil', 'turuncu', 'mor', 'gri'];
export const NOTE_HIGHLIGHTS = ['sari', 'yesil', 'mavi', 'pembe'];
export const COLOR_NAMES = { kirmizi: 'Kırmızı', mavi: 'Mavi', yesil: 'Yeşil', turuncu: 'Turuncu', mor: 'Mor', gri: 'Gri', sari: 'Sarı', pembe: 'Pembe' };

// Quill'e kaydedilen biçimler (indent: iç içe liste, Tab / Shift+Tab). Başka biçim (resim, video, kod, hizalama, yazı tipi) editöre de giremez.
export const NOTE_FORMATS = ['bold', 'italic', 'underline', 'strike', 'color', 'background', 'link', 'header', 'list', 'indent', 'table'];

// Firestore belge sınırı 1 MiB (1.048.576 bayt, alan adları dahil). Notun kendisi bunun altında kalmalı.
export const WARN_BYTES = 700_000;
export const DANGER_BYTES = 900_000;
export const MAX_BYTES = 1_000_000;
export const MAX_TITLE = 120;
export const MAX_URL = 2000;

const INLINE_FLAGS = ['bold', 'italic', 'underline', 'strike'];
const TABLE_ROW = /^row-[a-z0-9]{1,16}$/;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// Yalnızca http:// ve https:// bağlantıları; boşluk, kontrol karakteri ve kullanıcı adı/şifre içeren adresler olmaz.
export function safeUrl(value){
  if(typeof value !== 'string') return null;
  const url = value.trim();
  if(!url || url.length > MAX_URL || /[\s\u0000-\u001f\u007f"'<>\\`]/.test(url)) return null;
  if(!/^https?:\/\//i.test(url)) return null;
  try{
    const parsed = new URL(url);
    if(parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if(parsed.username || parsed.password || !parsed.hostname) return null;
    return url;
  }catch(_){
    return null;
  }
}

function inlineAttributes(attrs){
  const out = {};
  for(const key of INLINE_FLAGS) if(own(attrs, key) && attrs[key] === true) out[key] = true;
  if(own(attrs, 'color') && NOTE_COLORS.includes(attrs.color)) out.color = attrs.color;
  if(own(attrs, 'background') && NOTE_HIGHLIGHTS.includes(attrs.background)) out.background = attrs.background;
  if(own(attrs, 'link')){
    const url = safeUrl(attrs.link);
    if(url) out.link = url;
  }
  return out;
}

function lineAttributes(attrs){
  const out = {};
  if(own(attrs, 'table')){
    const v = attrs.table;
    if(typeof v === 'string' && TABLE_ROW.test(v)) out.table = v;
    // Yapıştırılan tablolarda Quill satır numarası verir (1, 2, …).
    else if((typeof v === 'number' && Number.isInteger(v) && v > 0 && v < 10000) || (typeof v === 'string' && /^\d{1,4}$/.test(v))) out.table = `row-p${Number(v)}`;
    if(out.table) return out; // Tablo hücresinde başlık ya da liste olamaz.
  }
  if(own(attrs, 'header')){
    const n = Number(attrs.header);
    if(Number.isInteger(n) && n >= 1 && n <= 6) out.header = n <= 2 ? 2 : 3;
  }
  if(own(attrs, 'list') && (attrs.list === 'bullet' || attrs.list === 'ordered')) out.list = attrs.list;
  if(own(attrs, 'indent')){
    const n = Number(attrs.indent);
    if(Number.isInteger(n) && n >= 1 && n <= 8) out.indent = n;
  }
  return out;
}

const cleanText = (s) => s.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');

// Delta'yı temizler; sonuç her zaman yeni nesnelerden oluşur ve '\n' ile biter.
export function sanitizeOps(input){
  const source = Array.isArray(input) ? input : (input && Array.isArray(input.ops) ? input.ops : []);
  const ops = [];
  for(const op of source){
    if(!op || typeof op !== 'object' || !own(op, 'insert') || typeof op.insert !== 'string') continue;
    const whole = cleanText(op.insert);
    if(!whole) continue;
    const attrs = op.attributes && typeof op.attributes === 'object' && !Array.isArray(op.attributes) ? op.attributes : {};
    // Metin ve satır sonu parçalara ayrılır: satır sonu satır biçimini (başlık, liste, tablo), metin satır içi
    // biçimleri taşır. (Yapıştırmada Quill "Akkusativ\nden\n" gibi karışık parçaya tablo biçimi verir.)
    for(const text of whole.split(/(\n+)/)){
      if(!text) continue;
      const clean = text[0] === '\n' ? lineAttributes(attrs) : inlineAttributes(attrs);
      const next = Object.keys(clean).length ? { insert: text, attributes: clean } : { insert: text };
      const prev = ops[ops.length - 1];
      if(prev && sameAttributes(prev.attributes, next.attributes) && !(/\n/.test(prev.insert) && prev.attributes)) prev.insert += text;
      else ops.push(next);
    }
  }
  const last = ops[ops.length - 1];
  if(!last) ops.push({ insert: '\n' });
  else if(!last.insert.endsWith('\n')){
    if(last.attributes) ops.push({ insert: '\n' });
    else last.insert += '\n';
  }
  return ops;
}

function sameAttributes(a, b){
  if(!a && !b) return true;
  if(!a || !b) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => a[k] === b[k]);
}

// Firestore'daki metni okur; bozuk ya da eski içerik boş not olarak açılır.
export function parseContent(value){
  if(typeof value !== 'string' || !value) return sanitizeOps([]);
  try{
    return sanitizeOps(JSON.parse(value));
  }catch(_){
    return sanitizeOps([]);
  }
}

export const serializeContent = (ops) => JSON.stringify({ ops: sanitizeOps(ops) });

// Belgenin yaklaşık boyutu (UTF-8 bayt): içerik + başlık + alan adları ve diğer alanlar için pay.
export function noteBytes(title, content){
  const enc = new TextEncoder();
  return enc.encode(content || '').length + enc.encode(title || '').length + 400;
}

export function sizeLevel(bytes){
  if(bytes > MAX_BYTES) return 'over';
  if(bytes >= DANGER_BYTES) return 'danger';
  if(bytes >= WARN_BYTES) return 'warn';
  return 'ok';
}

// "2026-11-23" → "23.11.2026 – Ders"
export function defaultTitle(dayKey){
  const m = /^(\d{4})-(\d\d)-(\d\d)$/.exec(dayKey || '');
  return m ? `${m[3]}.${m[2]}.${m[1]} – Ders` : 'Ders';
}

export function cleanTitle(value, dayKey){
  const title = String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_TITLE);
  return title || defaultTitle(dayKey);
}

export const isEmptyContent = (ops) => sanitizeOps(ops).every((op) => /^\n*$/.test(op.insert));

// Yapıştırılan renkler (Google Docs: "#ff0000", "rgb(255, 0, 0)") paletteki en yakın renge çevrilir; siyah, beyaz,
// gri ve şeffaf atılır (normal yazı). Ton (hue) aralıklarına göre: kırmızı, turuncu, yeşil, mavi, mor.
function parseColor(value){
  if(typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
  if(m){
    const hex = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  m = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+)\s*)?\)$/.exec(v);
  if(m){
    if(m[4] !== undefined && Number(m[4]) < 0.3) return null;
    return [m[1], m[2], m[3]].map((x) => Math.min(255, Number(x)));
  }
  return null;
}

export function paletteColor(value, kind){
  const palette = kind === 'background' ? NOTE_HIGHLIGHTS : NOTE_COLORS;
  if(palette.includes(value)) return value;
  const rgb = parseColor(value);
  if(!rgb) return null;
  const [r, g, b] = rgb.map((x) => x / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if(s < 0.25 || d < (kind === 'background' ? 0.06 : 0.12)){
    // Gri tonlar: yazıda belirgin griyse "gri", vurguda yok.
    return kind !== 'background' && l > 0.3 && l < 0.75 ? 'gri' : null;
  }
  let hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  hue = (hue * 60 + 360) % 360;
  if(kind === 'background'){
    if(hue < 15 || hue >= 290) return 'pembe';
    if(hue < 75) return 'sari';
    if(hue < 170) return 'yesil';
    if(hue < 260) return 'mavi';
    return 'pembe';
  }
  if(hue < 15 || hue >= 330) return 'kirmizi';
  if(hue < 70) return 'turuncu';
  if(hue < 170) return 'yesil';
  if(hue < 255) return 'mavi';
  return 'mor';
}
