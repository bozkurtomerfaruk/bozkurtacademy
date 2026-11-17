// IndexNow (Bing, Yandex vb.): iki commit arasında içeriği değişen, yayınlanmış sayfaları bildirir.
// Kullanım: node scripts/indexnow.mjs --from <sha> --to <sha> [--dry-run]
// - Yalnızca sitemap.xml'de olan adresler gönderilir (noindex sayfalar ve taslaklar sitemap'te yoktur).
// - Yalnızca ?v= sürüm numarası değişen sayfalar gönderilmez (CSS/JS güncellemesinde bütün site gitmesin).
// - Anahtar: kökteki <32 hex>.txt dosyası (içeriği dosya adıyla aynı).
// - Hata olursa yalnızca uyarı yazar ve 0 ile çıkar; yayını hiçbir zaman bozmaz.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HOST = 'bozkurtacademy.com';
const SITE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : ''; };
const dryRun = process.argv.includes('--dry-run');
const log = msg => console.log(`[indexnow] ${msg}`);
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// Dosya yolu → sayfa adresi ("a/index.html" → "/a/", "index.html" → "/").
const toUrlPath = file => file === 'index.html' ? '/' : file.endsWith('/index.html') ? `/${file.slice(0, -'index.html'.length)}` : null;

// Değişiklik yalnızca ?v=… sürüm numaralarından mı ibaret?
function onlyVersionBump(from, to, file) {
  const diff = git('diff', '--unified=0', from, to, '--', file).split('\n');
  const norm = l => l.slice(1).replace(/\?v=[\w.-]+/g, '?v=');
  const removed = diff.filter(l => l.startsWith('-') && !l.startsWith('---')).map(norm).sort();
  const added = diff.filter(l => l.startsWith('+') && !l.startsWith('+++')).map(norm).sort();
  return removed.length === added.length && removed.every((l, i) => l === added[i]);
}

export function changedUrls(from, to) {
  const sitemap = git('show', `${to}:sitemap.xml`); // o yayındaki sitemap: taslaklar ve noindex sayfalar yok
  const indexable = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  const files = git('diff', '--name-only', '--diff-filter=AMR', from, to).split('\n').filter(Boolean);
  const urls = [];
  for (const file of files) {
    const p = toUrlPath(file);
    if (!p) continue;
    const url = SITE + p;
    if (!indexable.has(url)) continue;
    if (onlyVersionBump(from, to, file)) continue;
    urls.push(url);
  }
  return [...new Set(urls)].sort();
}

function findKey() {
  const name = fs.readdirSync(root).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
  if (!name) return null;
  const key = name.slice(0, -4);
  return fs.readFileSync(path.join(root, name), 'utf8').trim() === key ? key : null;
}

async function main() {
  const from = arg('--from'), to = arg('--to') || 'HEAD';
  if (!from || /^0+$/.test(from)) return log('Önceki commit yok (ilk gönderim veya yeni dal); bildirim atlandı.');
  const key = findKey();
  if (!key) return log('UYARI: Kökte geçerli bir IndexNow anahtar dosyası (<32 hex>.txt) yok; bildirim atlandı.');
  const urlList = changedUrls(from, to);
  if (!urlList.length) return log('Bildirilecek değişmiş, yayınlanmış sayfa yok.');
  log(`${urlList.length} adres:\n  ${urlList.join('\n  ')}`);
  if (dryRun) return log('--dry-run: gönderilmedi.');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE}/${key}.txt`, urlList: urlList.slice(0, 10000) }),
    signal: AbortSignal.timeout(30000)
  });
  const body = (await res.text()).slice(0, 300);
  if (res.ok) log(`Gönderildi: HTTP ${res.status}`);
  else log(`UYARI: IndexNow HTTP ${res.status} döndü (yayın etkilenmedi). ${body}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => log(`UYARI: ${err.message} (yayın etkilenmedi)`)).finally(() => process.exit(0));
}
