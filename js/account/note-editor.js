// Ders defteri: Quill kurulumu (öğretmenin editörü ve öğrencinin salt okunur görünümü) ve yazı boyutu düğmeleri.
// Quill 2 depoda: js/vendor/quill/quill.js (window.Quill, BSD-3, bkz. js/vendor/README.md). CDN'den yüklenmez.
import { NOTE_COLORS, NOTE_FORMATS, NOTE_HIGHLIGHTS, paletteColor, safeUrl, sanitizeOps } from './note-format.js?v=1';

let registered = false;

function register(Quill){
  if(registered) return;
  registered = true;
  const P = Quill.import('parchment');
  // Renk ve vurgu: yalnızca paletteki sınıflar (ba-c-kirmizi, ba-bg-sari). Satır içi stil yazılmaz.
  Quill.register('formats/color', new P.ClassAttributor('color', 'ba-c', { scope: P.Scope.INLINE, whitelist: NOTE_COLORS }), true);
  Quill.register('formats/background', new P.ClassAttributor('background', 'ba-bg', { scope: P.Scope.INLINE, whitelist: NOTE_HIGHLIGHTS }), true);
  // Bağlantı: yalnızca http/https; yeni sekmede, rel="noopener noreferrer" (Quill'in Link'i ikisini de ekler).
  const Link = Quill.import('formats/link');
  class SafeLink extends Link {
    static sanitize(url){ return safeUrl(url) || 'about:blank'; }
    static formats(node){ return safeUrl(node.getAttribute('href')) || undefined; }
  }
  SafeLink.PROTOCOL_WHITELIST = ['http', 'https'];
  Quill.register('formats/link', SafeLink, true);
}

// Yapıştırılan tablolarda Quill satırları 1, 2, 3 diye numaralar; aynı numaralı iki tablo birleşmesin diye her
// tabloya yeni satır kimlikleri verilir.
function remapTableRows(Delta){
  return (node, delta) => {
    const ids = new Map();
    const ops = delta.ops.map((op) => {
      const row = op.attributes?.table;
      if(row === undefined) return op;
      if(!ids.has(row)) ids.set(row, `row-${Math.random().toString(36).slice(2, 8)}`);
      return { ...op, attributes: { ...op.attributes, table: ids.get(row) } };
    });
    return new Delta(ops);
  };
}

// Quill tablosunda bir hücre tek satırdır. Google Docs hücresinde birden çok paragraf ya da liste varsa her biri ayrı
// hücreye dağılıp tabloyu kaydırırdı; bunun yerine paragraflar aynı hücrede " / " ile birleştirilir.
function joinCellLines(Delta){
  return (node, delta) => {
    const parts = [];
    for(const op of delta.ops){
      if(typeof op.insert !== 'string') continue;
      op.insert.split('\n').forEach((text, i) => {
        if(i > 0) parts.push(null);
        if(text) parts.push(op.attributes ? { insert: text, attributes: op.attributes } : { insert: text });
      });
    }
    while(parts.length && parts[parts.length - 1] === null) parts.pop();
    while(parts.length && parts[0] === null) parts.shift();
    const ops = [];
    for(const part of parts){
      if(part) ops.push(part);
      else if(ops.length && ops[ops.length - 1].insert !== ' / ') ops.push({ insert: ' / ' });
    }
    ops.push({ insert: '\n' });
    return new Delta(ops);
  };
}

const KEYS = (Quill) => ({
  strike: { key: 'X', shortKey: true, shiftKey: true, handler(range, ctx){ this.quill.format('strike', !ctx.format.strike, 'user'); } },
  strikeDocs: { key: '5', altKey: true, shiftKey: true, handler(range, ctx){ this.quill.format('strike', !ctx.format.strike, 'user'); } },
  bullet: { key: '8', shortKey: true, shiftKey: true, handler(range, ctx){ this.quill.format('list', ctx.format.list === 'bullet' ? false : 'bullet', 'user'); } },
  ordered: { key: '7', shortKey: true, shiftKey: true, handler(range, ctx){ this.quill.format('list', ctx.format.list === 'ordered' ? false : 'ordered', 'user'); } },
  h2: { key: '2', shortKey: true, altKey: true, handler(range, ctx){ this.quill.format('header', ctx.format.header === 2 ? false : 2, 'user'); } },
  h3: { key: '3', shortKey: true, altKey: true, handler(range, ctx){ this.quill.format('header', ctx.format.header === 3 ? false : 3, 'user'); } },
  normal: { key: '0', shortKey: true, altKey: true, handler(){ this.quill.format('header', false, 'user'); this.quill.format('list', false, 'user'); } }
});

export function createNoteQuill(el, { readOnly = false, placeholder = '' } = {}){
  const Quill = window.Quill;
  if(!Quill) throw new Error('Quill yüklenemedi');
  register(Quill);
  const Delta = Quill.import('delta');
  const quill = new Quill(el, {
    readOnly,
    placeholder,
    formats: NOTE_FORMATS,
    modules: {
      table: true,
      history: { delay: 800, maxStack: 500, userOnly: true },
      // Resim yok: yapıştırılan ya da sürüklenen dosyalar eklenmez (base64 resim belgeyi şişirirdi).
      uploader: { mimetypes: [], handler(){} },
      ...(readOnly ? {} : {
        keyboard: { bindings: KEYS(Quill) },
        clipboard: {
          matchers: [
            ['td, th', joinCellLines(Delta)],
            ['table', remapTableRows(Delta)],
            // Her yapıştırma izin listesinden geçer: Google Docs'un renkleri, yazı tipleri, resimleri atılır.
            [Node.ELEMENT_NODE, (node, delta) => new Delta(stripTrailing(delta.ops, sanitizeOps(delta.ops.map(toPalette))))]
          ]
        }
      })
    }
  });
  if(!readOnly){
    // Hemen bir tablonun altına tablo yapıştırılırsa Quill iki tabloyu birleştirir: araya boş satır bırak.
    const onPaste = quill.clipboard.onPaste.bind(quill.clipboard);
    quill.clipboard.onPaste = (range, data) => {
      if(/<table/i.test(data?.html || '') && range.index > 0){
        const [prev] = quill.getLine(range.index - 1);
        if(prev?.statics?.blotName === 'table'){
          quill.insertText(range.index, '\n', 'user');
          range = { index: range.index + 1, length: range.length };
        }
      }
      return onPaste(range, data);
    };
    // Geri al / yinele her zaman Quill'in geçmişine gider. Tarayıcının kendi geri alması sayfa genelinde olduğu için
    // (ör. az önce düzenlenen başlık kutusu) hiç çalışmasın.
    quill.root.addEventListener('keydown', (e) => {
      if(!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if(key !== 'z' && key !== 'y') return;
      e.preventDefault();
      e.stopPropagation();
      if(key === 'y' || e.shiftKey) quill.history.redo();
      else quill.history.undo();
    }, true);
    quill.root.addEventListener('beforeinput', (e) => {
      if(e.inputType === 'historyUndo' || e.inputType === 'historyRedo'){
        e.preventDefault();
        e.stopPropagation();
        if(e.inputType === 'historyUndo') quill.history.undo();
        else quill.history.redo();
      }
    }, true);
  }
  return quill;
}

// Yapıştırılan renk ve vurgu paletteki en yakın renge çevrilir (note-format.js → paletteColor).
function toPalette(op){
  const a = op.attributes;
  if(!a || (a.color === undefined && a.background === undefined)) return op;
  const attributes = { ...a };
  for(const kind of ['color', 'background']){
    if(attributes[kind] === undefined) continue;
    const mapped = paletteColor(attributes[kind], kind);
    if(mapped) attributes[kind] = mapped;
    else delete attributes[kind];
  }
  return { ...op, attributes };
}

// sanitizeOps sona '\n' ekler; yapıştırılan parçada bu satır sonu yoksa eklememeliyiz.
function stripTrailing(original, clean){
  const last = original[original.length - 1];
  const endsWithNewline = typeof last?.insert === 'string' && last.insert.endsWith('\n');
  if(endsWithNewline || !clean.length) return clean;
  const out = clean.slice();
  const tail = out[out.length - 1];
  if(tail.insert === '\n' && !tail.attributes) out.pop();
  else if(tail.insert.endsWith('\n') && !tail.attributes) out[out.length - 1] = { insert: tail.insert.slice(0, -1) };
  return out.filter((op) => op.insert);
}

export function setContents(quill, ops){
  const Delta = window.Quill.import('delta');
  quill.setContents(new Delta(sanitizeOps(ops)), 'silent');
}

export const getOps = (quill) => sanitizeOps(quill.getContents().ops);

// A− / A+: yalnızca görünüm; nota kaydedilmez, bu tarayıcıda hatırlanır (localStorage baNotBoyut).
const SIZES = [0.875, 1, 1.125, 1.25, 1.5, 1.75, 2];
const SIZE_KEY = 'baNotBoyut';
export function setupNoteSize(target, smaller, bigger, label){
  let index = 1;
  try{
    const saved = Number(localStorage.getItem(SIZE_KEY));
    if(SIZES.includes(saved)) index = SIZES.indexOf(saved);
  }catch(_){}
  const apply = () => {
    target.style.setProperty('--note-scale', String(SIZES[index]));
    smaller.disabled = index === 0;
    bigger.disabled = index === SIZES.length - 1;
    if(label) label.textContent = `${Math.round(SIZES[index] * 100)} %`;
    try{ localStorage.setItem(SIZE_KEY, String(SIZES[index])); }catch(_){}
  };
  smaller.addEventListener('click', () => { if(index > 0){ index--; apply(); } });
  bigger.addEventListener('click', () => { if(index < SIZES.length - 1){ index++; apply(); } });
  apply();
}
