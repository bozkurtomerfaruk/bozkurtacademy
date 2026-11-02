// Alıştırma aramasının alt başlık dizini: data/search-index.json.
// Alıştırma paketlerinin başlıkları konu dosyalarının (data/<seviye>/<konu>.json) içinde duruyor; aramada
// hepsini (~10 MB) indirmemek için başlıklar bu küçük dosyada toplanır. Dosya sadece arama kutusuna
// yazılmaya başlanınca yüklenir (js/quiz.js).
//
//   node scripts/build-search-index.mjs          dizini yeniden yazar
//   node scripts/build-search-index.mjs --check  dizin güncel değilse hata verir (GitHub'da çalışır)
//
// Yeni alıştırma paketi eklendiğinde ya da başlığı değiştiğinde dizini yeniden üret.
// Gramer derslerinin bölüm başlıkları burada değil: gramer sayfası ders dosyalarını zaten yüklüyor (js/grammar.js).
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = 'data/search-index.json';
const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));

// { tr, de, en } aynıysa tek metin; değilse nesne.
const compact = (value) => {
  if (!value || typeof value === 'string') return value || '';
  const { tr = '', de = tr, en = tr } = value;
  return tr === de && tr === en ? tr : { tr, de, en };
};

const exercises = [];
for (const level of catalog.levels) {
  for (const topic of level.topics) {
    if (!topic.path || topic.status !== 'ready') continue;
    const data = JSON.parse(readFileSync(topic.path, 'utf8'));
    for (const exercise of data.exercises || []) {
      exercises.push({ level: level.id, topic: topic.id, id: exercise.id, title: compact(exercise.title) });
    }
  }
}

const text = JSON.stringify({ version: 1, exercises }) + '\n';

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(OUT, 'utf8'); } catch (_) {}
  if (current !== text) {
    console.error(`FAIL: ${OUT} güncel değil. Çalıştır: node scripts/build-search-index.mjs`);
    process.exit(1);
  }
  console.log(`PASS: ${OUT} güncel (${exercises.length} alıştırma paketi).`);
} else {
  writeFileSync(OUT, text);
  console.log(`${OUT} yazıldı: ${exercises.length} alıştırma paketi, ${Math.round(text.length / 1024)} KB.`);
}
