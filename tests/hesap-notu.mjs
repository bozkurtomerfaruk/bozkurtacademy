// Giriş ve kayıt sayfasındaki "hesaplar yalnızca öğrencilerim için" notu (TR/DE/EN, bağlantı seçilen dilin iletişim
// sayfasına) ve onay bekleyen hesabın panelindeki hatırlatma. Firebase Emulator (auth + firestore) gerekir:
//   npx firebase emulators:exec --only auth,firestore --project demo-bozkurtacademy "node tests/hesap-notu.mjs"
// Site için kendi statik sunucusunu açar; Firebase SDK dosyaları gstatic yerine node_modules/firebase'den verilir.
// Ekran görüntüleri: $S ya da geçici klasör (390/1440 px, açık/koyu).
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = 'demo-bozkurtacademy';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'hesap-notu-'));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://localhost:${server.address().port}`;

// Onay bekleyen bir öğrenci hesabı.
const FS = 'http://127.0.0.1:8080', AUTH = 'http://127.0.0.1:9099';
const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const docsUrl = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId: 'bekleyen', email: 'bekleyen@example.com', password: 'ogrenci123' }) });
const year = new Date().getUTCFullYear();
await fetch(`${docsUrl}/users/bekleyen`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  name: { stringValue: 'Ece Bekler' }, email: { stringValue: 'bekleyen@example.com' }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: 'pending' },
  emailVerified: { booleanValue: true }, createdAt: { timestampValue: new Date().toISOString() }
} }) });

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
async function newPage({ width = 1440, theme = 'light', lang = 'tr' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(([t, l]) => { try { localStorage.setItem('baEmulator', '1'); localStorage.setItem('ba-theme', t); localStorage.setItem('baLang', l); } catch (_) {} }, [theme, lang]);
  await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
    const file = path.join(ROOT, 'node_modules/firebase', path.basename(new URL(route.request().url()).pathname));
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  });
  await ctx.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)(?!www\.gstatic\.com\/firebasejs)/, (route) => route.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  return { ctx, page };
}

const EXPECT = {
  tr: { start: 'Hesaplar yalnızca benden ders alan', link: 'iletişime geç', href: '/iletisim/', reminder: 'Öğretmenin kaydını onaylayınca giriş yapabileceksin.' },
  de: { start: 'Die Konten sind nur für meine', link: 'kontaktiere mich bitte zuerst', href: '/de/kontakt/', reminder: 'Sobald dein Lehrer deine Registrierung freigeschaltet hat, kannst du dich anmelden.' },
  en: { start: 'Accounts are only for students', link: 'get in touch first', href: '/en/contact/', reminder: 'You will be able to sign in once your teacher has approved your registration.' }
};

// 1) Giriş ve kayıt sayfası: not her dilde, bağlantı o dilin iletişim sayfasına, formun üstünde.
for (const [lang, e] of Object.entries(EXPECT)) {
  const { ctx, page } = await newPage({ lang });
  for (const file of ['giris.html', 'kayit.html']) {
    await page.goto(`${BASE}/${file}`); await page.waitForTimeout(700);
    const note = page.locator('.acc-notice');
    ok(await note.count() === 1, `${lang} ${file}: not var`);
    const text = (await note.textContent()).replace(/\s+/g, ' ').trim();
    ok(text.startsWith(e.start) && text.endsWith(`${e.link}.`), `${lang} ${file}: metin ("${text.slice(0, 40)}…${text.slice(-25)}")`);
    ok(await page.getAttribute('.acc-notice a', 'href') === e.href, `${lang} ${file}: bağlantı ${e.href}`);
    const formSel = file === 'giris.html' ? '#loginForm' : '#regForm';
    const above = await page.evaluate((s) => document.querySelector('.acc-notice').getBoundingClientRect().bottom <= document.querySelector(s).getBoundingClientRect().top, formSel);
    ok(above, `${lang} ${file}: not formun üstünde`);
  }
  await ctx.close();
}
// Menüdeki "Giriş" bağlantısı genel sayfalarda gizli kalır (giris.html'in kendi menüsünde zaten bulunulan sayfa olarak görünür).
{
  const { ctx, page } = await newPage();
  for (const p of ['/', '/iletisim/', '/de/kontakt/']) {
    await page.goto(`${BASE}${p}`); await page.waitForTimeout(400);
    ok(await page.locator('#navAccount').isHidden(), `${p}: menüdeki Giriş bağlantısı gizli`);
  }
  await ctx.close();
}

// 2) Onay bekleyen hesap: panelde hatırlatma, dile göre.
for (const [lang, e] of Object.entries(EXPECT)) {
  const { ctx, page } = await newPage({ lang });
  await page.goto(`${BASE}/giris.html`); await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, 'bekleyen@example.com', 'ogrenci123');
    localStorage.setItem('baAccount', 'student');
  });
  await page.goto(`${BASE}/panel.html`);
  await page.waitForSelector('#stateCard:not([hidden])', { timeout: 15000 }).catch(() => {});
  ok(await page.locator('#stateNote').isVisible(), `${lang} panel: hatırlatma görünüyor`);
  ok((await page.textContent('#stateNote')).trim() === e.reminder, `${lang} panel: hatırlatma metni`);
  await ctx.close();
}

// 3) Ekran görüntüleri ve taşma: 390/1440 px, açık/koyu.
for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  const { ctx, page } = await newPage({ width, theme, lang: theme === 'dark' ? 'de' : 'tr' });
  for (const file of ['giris.html', 'kayit.html']) {
    await page.goto(`${BASE}/${file}`); await page.waitForTimeout(600);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `${width} ${theme} ${file}: yatay taşma yok (${over})`);
    await page.screenshot({ path: path.join(shotDir, `${file.replace('.html', '')}-${width}-${theme}.png`) });
  }
  await page.evaluate(async () => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, 'bekleyen@example.com', 'ogrenci123');
    localStorage.setItem('baAccount', 'student');
  });
  await page.goto(`${BASE}/panel.html`);
  await page.waitForSelector('#stateCard:not([hidden])', { timeout: 15000 }).catch(() => {});
  await page.screenshot({ path: path.join(shotDir, `panel-bekliyor-${width}-${theme}.png`) });
  await ctx.close();
}
console.log('Ekran görüntüleri: ' + shotDir);

ok(errors.length === 0, 'sayfa hatası yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
server.close();
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: hesap notu');
