// Alıştırmalardaki kelime listesi: data/sozluk.json (artikel + Türkçe anlam) ve soruların "vocab" anahtarları.
//
//   node scripts/sozluk.mjs                   denetler ve kontrol tablolarını yazar: docs/sozluk-kontrol.csv (bütün
//                                             sözlük) ve docs/sozluk-bekleyen.csv (sadece henüz kontrol edilmemiş kelimeler)
//   node scripts/sozluk.mjs --check           denetler; tablo güncel değilse hata verir (GitHub'da çalışır)
//   node scripts/sozluk.mjs --import tablo.csv  Excel'de düzeltilmiş tabloyu sözlüğe geri yazar, sonra tabloyu yeniler
//
// İki cinsiyetli isimlerde artikel "der/die" yazılabilir.
// Tablo Excel için noktalı virgülle ayrılmış ve UTF-8 BOM'lu. Düzeltilebilen sütunlar: Artikel, Türkçe anlam,
// Sadece çoğul, Emin değilim, Not, Kontrol edildi (evet/hayır). "Emin değilim = evet" olan kelimeler,
// "Kontrol edildi = evet" yapılana kadar öğrenciye gösterilmez.
// Sözlük anahtarı kelimenin kendisidir; aynı yazılışlı iki farklı isim için "See|die" gibi bir anahtar ve
// "word": "See" kullanılır.
import { readFileSync, writeFileSync } from 'node:fs';

const DICT = 'data/sozluk.json';
const CSV = 'docs/sozluk-kontrol.csv';
// Words added since the last check: the table to look at for a new pull request.
const PENDING = 'docs/sozluk-bekleyen.csv';
const ARTICLES = ['der', 'die', 'das'];
const HEAD = ['Kelime', 'Artikel', 'Türkçe anlam', 'Sadece çoğul', 'Emin değilim', 'Not', 'Kontrol edildi', 'Soru sayısı', 'Konular', 'Örnek cümle'];

const errors = [];
const dict = JSON.parse(readFileSync(DICT, 'utf8'));
const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));

// Every vocab key used by the exercises, with where it is used.
const usage = new Map();
for (const level of catalog.levels) {
  for (const topic of level.topics) {
    if (!topic.path) continue;
    const data = JSON.parse(readFileSync(topic.path, 'utf8'));
    for (const exercise of data.exercises || []) {
      for (const q of exercise.questions || []) {
        if (q.vocab === undefined) continue;
        if (!Array.isArray(q.vocab) || !q.vocab.length || q.vocab.some((k) => typeof k !== 'string')) {
          errors.push(`${topic.path} ${exercise.id}: vocab bir kelime listesi olmalı`);
          continue;
        }
        if (new Set(q.vocab).size !== q.vocab.length) errors.push(`${topic.path} ${exercise.id}: vocab içinde tekrar var`);
        for (const key of q.vocab) {
          if (!dict.words[key]) errors.push(`${topic.path} ${exercise.id}: "${key}" sözlükte yok`);
          const u = usage.get(key) || { count: 0, topics: new Set(), example: '' };
          u.count++;
          u.topics.add(`${level.id} ${topic.id}`);
          if (!u.example) {
            const correct = Array.isArray(q.correct) ? q.correct[0] : q.correct || '';
            u.example = q.sentence.split('___').length === 2 ? q.sentence.replace('___', correct) : `${q.sentence} → ${correct}`;
          }
          usage.set(key, u);
        }
      }
    }
  }
}

function validate() {
  for (const [key, w] of Object.entries(dict.words)) {
    // Two articles for nouns made from adjectives or with two genders: "der/die" (Jugendliche).
    const parts = String(w.article).split('/');
    if (parts.length > 2 || !parts.every((a) => ARTICLES.includes(a)) || new Set(parts).size !== parts.length) errors.push(`${key}: artikel der/die/das ya da der/die gibi iki artikel olmalı (${w.article})`);
    if (typeof w.tr !== 'string' || !w.tr.trim()) errors.push(`${key}: Türkçe anlam boş`);
    if (w.pluralOnly && w.article !== 'die') errors.push(`${key}: sadece çoğul olan kelimenin artikeli die olmalı`);
    for (const flag of ['pluralOnly', 'unsure', 'checked']) {
      if (w[flag] !== undefined && typeof w[flag] !== 'boolean') errors.push(`${key}: ${flag} true/false olmalı`);
    }
    if (key.includes('|') && !w.word) errors.push(`${key}: "|" içeren anahtarda "word" alanı gerekli`);
    if (!usage.has(key)) errors.push(`${key}: hiçbir soruda kullanılmıyor`);
  }
}

const yes = (value) => (value ? 'evet' : 'hayır');
const cell = (value) => {
  const text = String(value ?? '');
  return /[;"\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function csvText(onlyPending = false) {
  // Unsure words first, then alphabetical: the ones that most need a look are at the top.
  const keys = Object.keys(dict.words).filter((key) => !onlyPending || !dict.words[key].checked).sort((a, b) =>
    Number(Boolean(dict.words[b].unsure)) - Number(Boolean(dict.words[a].unsure)) || a.localeCompare(b, 'de'));
  const rows = keys.map((key) => {
    const w = dict.words[key];
    const u = usage.get(key) || { count: 0, topics: new Set(), example: '' };
    return [key, w.article, w.tr, yes(w.pluralOnly), yes(w.unsure), w.note || '', yes(w.checked), u.count, [...u.topics].join(', '), u.example];
  });
  return '﻿' + [HEAD, ...rows].map((row) => row.map(cell).join(';')).join('\r\n') + '\r\n';
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  text = text.replace(/^﻿/, '');
  const sep = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ',';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim()));
}

function importCsv(file) {
  const [head, ...rows] = parseCsv(readFileSync(file, 'utf8'));
  const col = (name) => head.findIndex((h) => h.trim().toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'));
  const at = Object.fromEntries(HEAD.map((h) => [h, col(h)]));
  if (at['Kelime'] < 0) throw new Error('Tabloda "Kelime" sütunu yok');
  const bool = (value, key, name) => {
    const v = String(value ?? '').trim().toLocaleLowerCase('tr');
    if (['evet', 'e', 'yes', 'ja', 'x', '1', 'true'].includes(v)) return true;
    if (['hayır', 'hayir', 'h', 'no', 'nein', '', '0', 'false'].includes(v)) return false;
    errors.push(`${key}: "${name}" evet/hayır olmalı ("${value}")`);
    return false;
  };
  let changed = 0;
  for (const r of rows) {
    const key = r[at['Kelime']]?.trim();
    const w = dict.words[key];
    if (!w) { errors.push(`Tablodaki "${key}" sözlükte yok (yeni kelime tablodan eklenemez)`); continue; }
    const before = JSON.stringify(w);
    if (at['Artikel'] >= 0) w.article = r[at['Artikel']].trim().toLowerCase();
    if (at['Türkçe anlam'] >= 0) w.tr = r[at['Türkçe anlam']].trim();
    const flags = [['Sadece çoğul', 'pluralOnly'], ['Emin değilim', 'unsure'], ['Kontrol edildi', 'checked']];
    for (const [name, field] of flags) {
      if (at[name] < 0) continue;
      const value = bool(r[at[name]], key, name);
      if (value) w[field] = true; else if (field === 'checked') w.checked = false; else delete w[field];
    }
    if (at['Not'] >= 0) { const note = r[at['Not']].trim(); if (note) w.note = note; else delete w.note; }
    if (JSON.stringify(w) !== before) changed++;
  }
  return changed;
}

const args = process.argv.slice(2);
let imported = null;
if (args[0] === '--import') {
  if (!args[1]) { console.error('Kullanım: node scripts/sozluk.mjs --import tablo.csv'); process.exit(1); }
  imported = importCsv(args[1]);
}
validate();
if (errors.length) {
  console.error(errors.map((e) => 'FAIL: ' + e).join('\n'));
  process.exit(1);
}
const text = csvText();
const pending = csvText(true);
const words = Object.values(dict.words);
const summary = `${words.length} kelime, ${words.filter((w) => w.checked).length} kontrol edildi, ${words.filter((w) => w.unsure && !w.checked).length} emin olunmayan (gizli)`;
if (args[0] === '--check') {
  let current = '';
  try { current = readFileSync(CSV, 'utf8'); } catch (_) {}
  let currentPending = '';
  try { currentPending = readFileSync(PENDING, 'utf8'); } catch (_) {}
  if (current !== text || currentPending !== pending) { console.error(`FAIL: ${CSV} ya da ${PENDING} güncel değil. Çalıştır: node scripts/sozluk.mjs`); process.exit(1); }
  console.log(`PASS: sözlük, ${CSV} ve ${PENDING} güncel (${summary}).`);
} else {
  if (imported !== null) writeFileSync(DICT, JSON.stringify(dict, null, 2) + '\n');
  writeFileSync(CSV, text);
  writeFileSync(PENDING, pending);
  console.log(`${imported !== null ? `${imported} kelime güncellendi. ` : ''}${CSV} yazıldı: ${summary}.`);
}
