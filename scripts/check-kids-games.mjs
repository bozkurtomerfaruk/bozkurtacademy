// Çocuk oyunları (Artikel Evleri, #artikel-evleri): konu setlerinin ve resimlerin denetimi. GitHub'da da çalışır.
//   node scripts/check-kids-games.mjs
// Kurallar:
// - Her kelime data/sozluk.json'da var, öğretmen kontrol etmiş (checked), "emin değilim" değil, sadece çoğul değil,
//   tek artikelli (der, die ya da das) ve Türkçe anlamı boş değil.
// - Her konuda der, die ve das sayısı eşit; bir kelime iki konuda birden yok; konu kimlikleri benzersiz.
// - Her kelimenin data/cocuk/resimler.json'da resmi var. Resimler sadece çizim içerir
//   (script, bağlantı, olay işleyici ya da dış adres yok).
import { readFileSync } from 'node:fs';

const errors = [];
const dict = JSON.parse(readFileSync('data/sozluk.json', 'utf8')).words;
const game = JSON.parse(readFileSync('data/cocuk/artikel-evleri.json', 'utf8'));
const pictures = JSON.parse(readFileSync('data/cocuk/resimler.json', 'utf8')).pictures;
const ARTICLES = ['der', 'die', 'das'];
const LANGS = ['tr', 'de', 'en'];

const ALLOWED_TAGS = new Set(['path', 'rect', 'circle', 'ellipse', 'g', 'line', 'polygon', 'polyline']);
for (const [word, svg] of Object.entries(pictures)) {
  for (const [, tag] of svg.matchAll(/<\/?([a-zA-Z]+)/g)) {
    if (!ALLOWED_TAGS.has(tag)) errors.push(`resimler.json ${word}: <${tag}> kullanılamaz`);
  }
  if (/\son\w+\s*=|href|url\(|javascript:|<!|&/i.test(svg)) errors.push(`resimler.json ${word}: izin verilmeyen içerik`);
}

const themeIds = new Set();
const seen = new Map();
for (const theme of game.themes || []) {
  const where = `artikel-evleri.json ${theme.id}`;
  if (!/^[a-z0-9-]{2,40}$/.test(theme.id || '')) errors.push(`${where}: konu kimliği küçük harf, rakam ve tire olmalı`);
  if (themeIds.has(theme.id)) errors.push(`${where}: konu kimliği tekrar ediyor`);
  themeIds.add(theme.id);
  for (const lang of LANGS) if (!theme.title?.[lang]) errors.push(`${where}: ${lang} başlığı yok`);
  if (!theme.words?.includes(theme.cover)) errors.push(`${where}: kapak resmi (cover) konunun kelimelerinden biri olmalı`);
  const counts = { der: 0, die: 0, das: 0 };
  for (const word of theme.words || []) {
    const w = dict[word];
    if (seen.has(word)) errors.push(`${where}: "${word}" ${seen.get(word)} konusunda da var`);
    seen.set(word, theme.id);
    if (!w) { errors.push(`${where}: "${word}" sözlükte yok`); continue; }
    if (!w.checked) errors.push(`${where}: "${word}" henüz kontrol edilmedi`);
    if (w.unsure) errors.push(`${where}: "${word}" emin değilim olarak işaretli`);
    if (w.pluralOnly) errors.push(`${where}: "${word}" sadece çoğul`);
    if (!ARTICLES.includes(w.article)) errors.push(`${where}: "${word}" tek artikelli değil (${w.article})`);
    else counts[w.article]++;
    if (!String(w.tr || '').split(';')[0].trim()) errors.push(`${where}: "${word}" Türkçe anlamı yok`);
    if (!pictures[word]) errors.push(`${where}: "${word}" için resim yok`);
  }
  if (!(theme.words || []).length || counts.der !== counts.die || counts.die !== counts.das) {
    errors.push(`${where}: der/die/das sayıları eşit değil (${counts.der}/${counts.die}/${counts.das})`);
  }
}
if (themeIds.size < 1) errors.push('artikel-evleri.json: konu yok');

if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} hata`);
  process.exit(1);
}
console.log(`Artikel Evleri: ${themeIds.size} konu, ${seen.size} kelime, ${Object.keys(pictures).length} resim; hepsi uygun.`);
