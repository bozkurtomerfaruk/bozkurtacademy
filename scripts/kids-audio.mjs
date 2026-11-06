// Çocuk oyunlarının ses dosyaları: data/cocuk/ses/*.mp3 → data/cocuk/sesler.json (oyun hangi dosyanın olduğunu buradan bilir).
//   node scripts/kids-audio.mjs           listeyi klasöre göre yeniden yazar
//   node scripts/kids-audio.mjs --check   liste güncel mi, dosya adları doğru mu (scripts/check-kids-games.mjs de çağırır)
// Dosya adı: kelime ("hund.mp3") ve artikelle ("der-hund.mp3"); küçük harf, ä→ae, ö→oe, ü→ue, ß→ss.
// Dosyası olmayan kelimede oyun cihazın Almanca sesine, o da yoksa sessiz moda geçer.
// Seslerin nasıl üretildiği ve lisansları: data/cocuk/ses/LISANS.md, scripts/cocuk-ses/README.md.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';

export const slug = (s) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/ /g, '-');
const DIR = 'data/cocuk/ses';
const OUT = 'data/cocuk/sesler.json';

export function build() {
  const dict = JSON.parse(readFileSync('data/sozluk.json', 'utf8')).words;
  const game = JSON.parse(readFileSync('data/cocuk/artikel-evleri.json', 'utf8'));
  const have = new Set(readdirSync(DIR).filter((f) => f.endsWith('.mp3')));
  const words = [...new Set(game.themes.flatMap((t) => t.words))].sort((a, b) => a.localeCompare(b, 'de'));
  const files = {};
  const used = new Set();
  const errors = [];
  for (const w of words) {
    const entry = {};
    const one = `${slug(w)}.mp3`, two = `${slug(`${dict[w].article} ${w}`)}.mp3`;
    if (have.has(one)) { entry.word = one; used.add(one); }
    if (have.has(two)) { entry.article = two; used.add(two); }
    if (Object.keys(entry).length) files[w] = entry;
  }
  for (const f of have) {
    if (!used.has(f)) errors.push(`${DIR}/${f}: oyundaki hiçbir kelimeye ait değil`);
    else if (statSync(`${DIR}/${f}`).size > 20000) errors.push(`${DIR}/${f}: 20 KB'tan büyük`);
  }
  const missing = words.flatMap((w) => [files[w]?.word ? null : w, files[w]?.article ? null : `${dict[w].article} ${w}`]).filter(Boolean);
  const json = JSON.stringify({ version: 1, note: 'node scripts/kids-audio.mjs ile üretilir; elle düzenleme. Sesler: data/cocuk/ses/LISANS.md', files }, null, 1) + '\n';
  return { json, errors, missing, count: used.size };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { json, errors, missing, count } = build();
  if (process.argv.includes('--check')) {
    let current = '';
    try { current = readFileSync(OUT, 'utf8'); } catch (_) {}
    if (current !== json) errors.push(`${OUT} güncel değil: node scripts/kids-audio.mjs`);
  } else writeFileSync(OUT, json);
  if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
  console.log(`Sesler: ${count} dosya${missing.length ? `; dosyası olmayan (cihaz sesi): ${missing.join(', ')}` : ''}.`);
}
