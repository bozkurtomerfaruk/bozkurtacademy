// Giriş, kayıt ve öğrenci paneli: Firebase yüklenemese de (reklam engelleyici, kötü bağlantı) seçilen dil uygulanıyor mu?
// Çalıştırma: node tests/hesap-ceviri.mjs (site dosyalarını kendi yerel sunucusuyla verir; BASE ile başka adres verilebilir)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
let server = null;
let B = process.env.BASE;
if (!B) {
  server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  B = `http://localhost:${server.address().port}`;
}

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const browser = await chromium.launch();

const cases = [
  ['de', '/giris.html', '#loginTitle', 'Anmelden'],
  ['de', '/kayit.html', '#regTitle', 'Registrieren'],
  ['de', '/panel.html', '#panelLoading', 'Wird geladen…'],
  ['de', '/odevlerim.html', '#odevTitle', 'Meine Hausaufgaben'],
  ['en', '/odevlerim.html', '#odevTitle', 'My homework'],
  ['en', '/giris.html', '#loginTitle', 'Sign in'],
  ['en', '/kayit.html', '#regTitle', 'Register'],
  ['tr', '/giris.html', '#loginTitle', 'Giriş yap'],
  ['de', '/ders-notlarim.html', '#notesLoading', 'Wird geladen…'],
  ['en', '/ders-notlarim.html', '#notesBackLink', '← My area'],
];
for (const [lang, url, sel, expected] of cases) {
  const ctx = await browser.newContext();
  // Dışarıya giden her istek (Firebase dahil) engellenir.
  await ctx.route(/^https?:\/\/(?!localhost)/, route => route.abort());
  await ctx.addInitScript(l => { try { localStorage.setItem('baLang', l); } catch (_) {} }, lang);
  const page = await ctx.newPage();
  await page.goto(B + url); await page.waitForTimeout(600);
  const text = (await page.textContent(sel)).trim();
  ok(text === expected, `Firebase engelli · ${lang} ${url}: "${text}"`);
  await ctx.close();
}
await browser.close();
server?.close();
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: hesap sayfası çevirileri');
