// innerHTML'e kaçışsız değer verilmesini yakalayan basit denetim (CI: .github/workflows/site-pages.yml).
//   node scripts/check-html-escape.mjs
//
// HTML üreten her şablon dizgisi (içinde <etiket bulunan `...`) taranır. İçindeki her ${...} şunlardan biri olmalı:
//  - kaçışlayıcı/temizleyici çağrısı: escapeHtml(…), esc(…), h(…) (js/a1-lessons.js), safeUrl(…), sanitizeSvg(…), window.baHtml.…(…)
//  - HTML döndüren başka bir yardımcı: adı …Html( ile biten ya da render…( ile başlayan fonksiyon (o fonksiyonun
//    şablonları da bu betikle taranır), dizi.map(…).join(…) (map içindeki şablonlar ayrıca taranır)
//  - sayı ya da sayı üreten ifade: sayı sabiti, .length, Math.…, Number(…), String.fromCharCode(…), toFixed(…)
//  - çeviriler t('…') (kod içi sabitler, js/app.js), BÜYÜK_HARF kod sabitleri
//  - koşul ? A : B / A || B / A && B / A + B : yazılan her parça aynı kurallara uyar; karşılaştırma (true/false)
//  - dosyanın "// html-safe-names: …" yorumunda listelenen yerel HTML değişkenleri ve fonksiyonları
// Bilerek izin verilen başka bir ifade için satırın sonuna /* html-safe: neden */ yorumu yaz.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILES = ['js/quiz.js', 'js/grammar.js', 'js/exams.js', 'js/exam-task.js', 'js/a1-lessons.js', 'js/artikel-evleri.js', 'js/app.js', 'js/home.js', 'js/level-exam.js', 'js/placement.js', 'js/exercise-links.js'];

// Şablon dizgilerini ve içlerindeki ${…} ifadelerini çıkarır (iç içe şablonlar, dizgiler ve yorumlar dahil).
function templates(src){
  const out = [];
  let i = 0;
  function skipString(q){ i++; while(i < src.length && src[i] !== q){ if(src[i] === '\\') i++; i++; } i++; }
  function skipRegexOrDivide(){
    // Basit: önceki anlamlı karakter bir değer bitiriyorsa bölme, değilse düzenli ifade.
    let j = i - 1; while(j >= 0 && /\s/.test(src[j])) j--;
    if(j >= 0 && /[\w)\]$]/.test(src[j])){ i++; return; }
    i++; let cls = false;
    while(i < src.length){ const c = src[i]; if(c === '\\'){ i += 2; continue; } if(c === '[') cls = true; else if(c === ']') cls = false; else if(c === '/' && !cls) break; else if(c === '\n') break; i++; }
    i++;
  }
  function readTemplate(){
    const start = i; i++;
    const exprs = [];
    let text = '';
    while(i < src.length && src[i] !== '`'){
      if(src[i] === '\\'){ text += src[i] + src[i + 1]; i += 2; continue; }
      if(src[i] === '$' && src[i + 1] === '{'){
        i += 2; const s = i; let depth = 1;
        while(i < src.length && depth){
          const c = src[i];
          if(c === '`'){ readTemplate(); continue; }
          if(c === '"' || c === "'"){ skipString(c); continue; }
          if(c === '{') depth++;
          else if(c === '}') depth--;
          if(depth) i++;
        }
        exprs.push({ code: src.slice(s, i), pos: s });
        text += '\u0000';
        i++;
        continue;
      }
      text += src[i]; i++;
    }
    i++;
    out.push({ start, text, exprs });
  }
  while(i < src.length){
    const c = src[i];
    if(c === '/' && src[i + 1] === '/'){ while(i < src.length && src[i] !== '\n') i++; continue; }
    if(c === '/' && src[i + 1] === '*'){ i = src.indexOf('*/', i + 2) + 2; continue; }
    if(c === '"' || c === "'"){ skipString(c); continue; }
    if(c === '`'){ readTemplate(); continue; }
    if(c === '/'){ skipRegexOrDivide(); continue; }
    i++;
  }
  return out;
}

const SAFE_CALL = /^(?:escapeHtml|esc|h|safeUrl|sanitizeSvg|(?:window\.)?baHtml\.\w+|Number|Math\.\w+|String\.fromCharCode|encodeURIComponent|t|tf)\s*\(/;
const HTML_CALL = /^(?:[\w$.]*Html|render\w*|[\w$.]*\.render\w*|views\[[\w$.]+\])\s*\(/;

// Dizgi ya da şablonun (iç içe ${…} dahil) bittiği konum.
function skipQuoted(code, k){
  const q = code[k];
  for(k++; k < code.length; k++){
    const c = code[k];
    if(c === '\\'){ k++; continue; }
    if(c === q) return k;
    if(q === '`' && c === '$' && code[k + 1] === '{'){
      let depth = 1; k += 2;
      for(; k < code.length && depth; k++){
        if(code[k] === '"' || code[k] === "'" || code[k] === '`'){ k = skipQuoted(code, k); continue; }
        if(code[k] === '{') depth++;
        else if(code[k] === '}') depth--;
      }
      k--;
    }
  }
  return k;
}
// En üst düzeyde (parantez, dizgi ve şablon dışında) bir işlecin konumları.
function topLevel(code, test){
  const hits = []; let depth = 0;
  for(let k = 0; k < code.length; k++){
    const c = code[k];
    if(c === '"' || c === "'" || c === '`'){ k = skipQuoted(code, k); continue; }
    if('([{'.includes(c)) depth++;
    else if(')]}'.includes(c)) depth--;
    else if(!depth){ const n = test(code, k); if(n) { hits.push([k, n]); k += n - 1; } }
  }
  return hits;
}
const splitAt = (code, hits) => { const parts = []; let last = 0; for(const [k, n] of hits){ parts.push(code.slice(last, k)); last = k + n; } parts.push(code.slice(last)); return parts.map((p) => p.trim()); };
const QUESTION = (s, k) => s[k] === '?' && s[k + 1] !== '.' && s[k + 1] !== '?' && s[k - 1] !== '?' ? 1 : 0;
const COLON = (s, k) => s[k] === ':' ? 1 : 0;
const OR = (s, k) => (s.startsWith('||', k) || s.startsWith('??', k)) ? 2 : 0;
const AND = (s, k) => s.startsWith('&&', k) ? 2 : 0;
const PLUS = (s, k) => s[k] === '+' && s[k + 1] !== '+' && s[k - 1] !== '+' && s[k + 1] !== '=' ? 1 : 0;
const COMPARE = (s, k) => /^(===|!==|==|!=|<=|>=)/.test(s.slice(k)) || ((s[k] === '<' || s[k] === '>') && s[k + 1] === ' ') ? 1 : 0;

// Tek bir çağrının tamamı mı (ör. esc(a) + b değil)?
function wholeCall(code){
  const open = code.indexOf('(');
  if(open < 0) return false;
  let depth = 0;
  for(let k = open; k < code.length; k++){
    const c = code[k];
    if(c === '"' || c === "'" || c === '`'){ k = skipQuoted(code, k); continue; }
    if(c === '(') depth++;
    else if(c === ')'){ depth--; if(!depth) return /^\s*(?:\.\w+\([^()]*\)\s*)*$/.test(code.slice(k + 1)); }
  }
  return false;
}

function safe(code, names){
  let c = code.trim();
  while(/^\(/.test(c) && wholeParen(c)) c = c.slice(1, -1).trim();
  if(!c) return true;
  const q = topLevel(c, QUESTION);
  if(q.length){
    const rest = c.slice(q[0][0] + 1);
    const colon = topLevel(rest, COLON)[0];
    if(!colon) return false;
    return safe(rest.slice(0, colon[0]), names) && safe(rest.slice(colon[0] + 1), names);
  }
  const or = topLevel(c, OR);
  if(or.length) return splitAt(c, or).every((p) => safe(p, names));
  const and = topLevel(c, AND);
  if(and.length) return safe(splitAt(c, and).pop(), names);   // a && b → b (ya da false) yazılır
  if(topLevel(c, COMPARE).length || /^![\w$.?()]+$/.test(c)) return true; // karşılaştırma, !x: true/false                 // karşılaştırma: true/false
  const plus = topLevel(c, PLUS);
  if(plus.length) return splitAt(c, plus).every((p) => safe(p, names));
  if(/^'[^'\\]*'$|^"[^"\\]*"$/.test(c)) return true;            // kod içi sabit dizgi
  if(c[0] === '`' && skipQuoted(c, 0) === c.length - 1) return true; // iç içe şablon: ayrıca taranır                       // iç içe şablon: ayrıca taranır
  if(/^-?\d+(\.\d+)?$/.test(c)) return true;
  if(/^[\w$.[\]?]+\.length$/.test(c)) return true;
  if(/^[\w$.]+\s*[-*/%]\s*[\w$.]+$/.test(c)) return true;     // i-1, a*b: sayı
  if(/^[A-Z][A-Z0-9_]*$/.test(c)) return true;                  // kod sabiti (PAGE, H)
  if(/^(i|j|k|n|idx|index)$/.test(c)) return true;             // döngü sayaçları
  if(names.has(c) || /^[\w$]+Html$/.test(c)) return true;     // …Html: kodda kurulmuş HTML (adlandırma kuralı)
  const callee = c.match(/^([\w$.]+)\s*\(/)?.[1];
  if(callee && wholeCall(c) && (SAFE_CALL.test(c) || HTML_CALL.test(c) || names.has(callee + '()'))) return true;
  if(/\.map\(/.test(c) && /\.join\([^)]*\)\s*$/.test(c)) return true;  // map içindeki şablonlar ayrıca taranır
  return false;
}
function wholeParen(c){
  let depth = 0;
  for(let k = 0; k < c.length; k++){ if(c[k] === '(') depth++; else if(c[k] === ')'){ depth--; if(!depth) return k === c.length - 1; } }
  return false;
}

export function check(file, src = fs.readFileSync(path.join(root, file), 'utf8')){
  const problems = [];
  const lines = src.split('\n');
  const lineOf = (pos) => src.slice(0, pos).split('\n').length;
  // Dosyada "// html-safe-names: a b fn()" yorumu: kodda kaçışlanmış parçalardan kurulan HTML değişkenleri ve
  // HTML döndüren yerel fonksiyonlar. Bunların şablonları da taranır; listeye yalnızca bu tür adları yaz.
  const names = new Set([...src.matchAll(/\/\/ html-safe-names:([^\n]*)/g)].flatMap((m) => m[1].trim().split(/\s+/)));
  for(const tpl of templates(src)){
    if(!/<\/?[a-z][\w-]*[\s>/]/i.test(tpl.text)) continue; // HTML üretmeyen şablon
    for(const e of tpl.exprs){
      const line = lineOf(e.pos);
      if(/html-safe:/.test(lines[line - 1])) continue;
      if(!safe(e.code, names)) problems.push(`${file}:${line}: \${${e.code.replace(/\s+/g, ' ').slice(0, 100)}}`);
    }
  }
  return problems;
}

if(process.argv[1] === fileURLToPath(import.meta.url)){
  const problems = FILES.filter((f) => fs.existsSync(path.join(root, f))).flatMap((f) => check(f));
  if(problems.length){
    console.error(`FAIL: HTML şablonunda kaçışsız ${problems.length} değer:\n  ` + problems.join('\n  '));
    console.error('Değeri escapeHtml(…) / safeUrl(…) ile sar (js/html.js) ya da bilerek güvenliyse satıra /* html-safe: neden */ yaz.');
    process.exit(1);
  }
  console.log(`PASS: ${FILES.length} dosyadaki HTML şablonlarında kaçışsız değer yok.`);
}
