// Onaylı gramer yorumlarını denetler: data/grammar-comments.json
//   node scripts/check-comments.mjs
// Biçim: { "A1/artikel": [ { "name": "…", "date": "2026-11-04", "comment": "…", "reply": "…" } ] }
// Anahtar "SEVİYE/ders-kimliği" biçimindedir ve data/<seviye>-grammar.json içinde bulunmalıdır.
// E-posta adresi, telefon numarası veya izin verilmeyen alanlar dosyaya giremez.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(root, 'data/grammar-comments.json');
const errors = [];
let data;
try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
catch (e) { console.error(`FAIL: data/grammar-comments.json okunamadı: ${e.message}`); process.exit(1); }
if (!data || typeof data !== 'object' || Array.isArray(data)) { console.error('FAIL: dosya bir nesne olmalı: { "A1/artikel": [ … ] }'); process.exit(1); }

const lessons = {};
const index = JSON.parse(fs.readFileSync(path.join(root, 'data/grammar-index.json'), 'utf8'));
for (const level of Object.keys(index.levels || {})) {
  const f = path.join(root, `data/${level.toLowerCase()}-grammar.json`);
  if (!fs.existsSync(f)) continue;
  const g = JSON.parse(fs.readFileSync(f, 'utf8'));
  const list = Array.isArray(g.lessons) ? g.lessons : Object.values(g.lessons || {});
  for (const l of list) lessons[`${level}/${l.id}`] = l.title;
}

const ALLOWED = new Set(['name', 'date', 'comment', 'reply']);
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /(?:\+|00)?\d[\d\s().-]{8,}\d/;
let count = 0;
for (const [key, rows] of Object.entries(data)) {
  if (!lessons[key]) { errors.push(`${key}: bilinmeyen ders anahtarı (ör. "A1/artikel"; data/<seviye>-grammar.json içindeki id)`); continue; }
  if (!Array.isArray(rows)) { errors.push(`${key}: değer bir liste [ … ] olmalı`); continue; }
  rows.forEach((row, i) => {
    const at = `${key} #${i + 1}`;
    if (!row || typeof row !== 'object') { errors.push(`${at}: kayıt bir nesne olmalı`); return; }
    for (const k of Object.keys(row)) if (!ALLOWED.has(k)) errors.push(`${at}: izin verilmeyen alan "${k}" (yalnızca name, date, comment, reply)`);
    if (typeof row.name !== 'string' || !row.name.trim() || row.name.length > 60) errors.push(`${at}: name 1–60 karakter olmalı`);
    if (typeof row.comment !== 'string' || row.comment.trim().length < 10 || row.comment.length > 2000) errors.push(`${at}: comment 10–2000 karakter olmalı`);
    if (typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) || Number.isNaN(Date.parse(row.date))) errors.push(`${at}: date YYYY-AA-GG olmalı (ör. 2026-11-04)`);
    if ('reply' in row && (typeof row.reply !== 'string' || !row.reply.trim())) errors.push(`${at}: reply boş olmamalı (gerekmiyorsa alanı sil)`);
    for (const k of ['name', 'comment', 'reply']) {
      if (typeof row[k] !== 'string') continue;
      if (EMAIL.test(row[k])) errors.push(`${at}: ${k} içinde e-posta adresi var; yayımlanamaz`);
      if (PHONE.test(row[k])) errors.push(`${at}: ${k} içinde telefon numarasına benzeyen bir sayı var; yayımlanamaz`);
    }
    count++;
  });
}
if (errors.length) { console.error(errors.map(e => 'FAIL: ' + e).join('\n')); process.exit(1); }
console.log(`PASS: data/grammar-comments.json geçerli (${count} onaylı yorum, ${Object.keys(data).length} ders).`);
