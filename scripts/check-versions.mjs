// Önbellek sürümleri tutarlı mı? Aynı JS/CSS dosyası bütün sayfalarda aynı ?v= sürümüyle yüklenmeli.
//   node scripts/check-versions.mjs
// Bir dosya değiştiğinde ?v= değerini HER sayfada artır; aksi hâlde bazı sayfalar eski kodu önbellekten çalıştırır.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skip = new Set(['node_modules', '.git', 'docs', 'tests', '.claude', 'Material', '.tts-modeller']);
const pages = [];
(function walk(dir){
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    if(skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.name.endsWith('.html')) pages.push(full);
  }
})(root);

const seen = new Map(); // dosya → Map(sürüm → [sayfalar])
const re = /(?:src|href)="\/?((?:js|css)\/[^"?#]+\.(?:js|css))(?:\?v=([^"#]+))?"/g;
for(const file of pages){
  const html = fs.readFileSync(file, 'utf8');
  for(const m of html.matchAll(re)){
    const asset = m[1];
    const version = m[2] || '(sürümsüz)';
    if(!seen.has(asset)) seen.set(asset, new Map());
    const byVersion = seen.get(asset);
    if(!byVersion.has(version)) byVersion.set(version, []);
    byVersion.get(version).push(path.relative(root, file));
  }
}
let errors = 0;
for(const [asset, byVersion] of [...seen].sort()){
  if(byVersion.size < 2) continue;
  errors++;
  console.error(`FAIL: ${asset} farklı sürümlerle yükleniyor:`);
  for(const [version, list] of byVersion) console.error(`  v=${version}: ${list.join(', ')}`);
}
if(errors){ console.error('Aynı dosyayı bütün sayfalarda aynı ?v= ile yükle.'); process.exit(1); }
console.log(`PASS: ${seen.size} JS/CSS dosyası, ${pages.length} sayfa; sürümler tutarlı.`);
