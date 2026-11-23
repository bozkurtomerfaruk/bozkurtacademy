// Giriş, kayıt ve öğrenci paneli: Firebase yüklenemese de (reklam engelleyici, kötü bağlantı) seçilen dil uygulanıyor mu?
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/hesap-ceviri.mjs
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765';

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
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: hesap sayfası çevirileri');
