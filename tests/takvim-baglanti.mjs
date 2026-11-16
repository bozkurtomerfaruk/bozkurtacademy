// Öğretmen takvimi: Google Calendar bağlantısı (sahte takvim, js/account/calendar-mock.js). Firebase Emulator gerekir:
//   npx firebase emulators:exec --only auth,firestore --project demo-bozkurtacademy "node tests/takvim-baglanti.mjs"
// Senaryo: bağlan → sayfayı yenile → hâlâ bağlı (sessionStorage) · süre dolunca rozet "süresi doldu" → ders eklerken
// izin kendiliğinden yenilenir · bağlantıyı kes (iptal + silme) · yeni sekmede belirteç yok · ekran görüntüleri 390/1440 açık/koyu.
// Gerçek Google kod yolu (GIS + iptal adresi + CSP) tests/csp.mjs'te sınanır.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = 'demo-bozkurtacademy';
const RULES = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
const TEACHER = RULES.match(/function teacherUid\(\)\s*{\s*return '([^']+)'/)[1];
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'takvim-baglanti-'));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://localhost:${server.address().port}`;

// Öğretmen ve bir onaylı öğrenci.
const FS = 'http://127.0.0.1:8080', AUTH = 'http://127.0.0.1:9099';
const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const docsUrl = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
const year = new Date().getUTCFullYear();
await fetch(`${docsUrl}/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  name: { stringValue: 'Deniz Kaya' }, email: { stringValue: 'ogrenci@example.com' }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: 'active' }, emailVerified: { booleanValue: true },
  createdAt: { timestampValue: new Date().toISOString() }, approvedAt: { timestampValue: new Date().toISOString() }
} }) });

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
async function newContext({ width = 1440, theme = 'light' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript((t) => { try { localStorage.setItem('baEmulator', '1'); localStorage.setItem('ba-theme', t); } catch (_) {} }, theme);
  await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
    const file = path.join(ROOT, 'node_modules/firebase', path.basename(new URL(route.request().url()).pathname));
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  });
  await ctx.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)(?!www\.gstatic\.com\/firebasejs)/, (route) => route.abort());
  return ctx;
}
async function teacherPage(ctx) {
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(`${BASE}/giris.html`); await page.waitForTimeout(800);
  await page.evaluate(async () => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, 'ogretmen@example.com', 'ogretmen123');
    localStorage.setItem('baAccount', 'teacher');
  });
  await page.goto(`${BASE}/ogretmen-takvim.html`);
  await page.waitForSelector('#calApp:not([hidden])', { timeout: 15000 });
  return page;
}
const badge = (page) => page.textContent('#gcalStatus').then((s) => s.trim());
const connects = (page) => page.evaluate(() => Number(localStorage.getItem('baCalendarMockConnects') || 0));

const ctx = await newContext();
const page = await teacherPage(ctx);

// 1) Başlangıçta bağlı değil.
ok((await badge(page)).startsWith('Google Calendar bağlı değil'), 'başlangıç: "bağlı değil"');
ok(await page.locator('#gcalDisconnect').isHidden(), 'başlangıç: "Bağlantıyı kes" gizli');

// 2) Bağlan → rozet kalan süreyle.
await page.click('#gcalConnect'); await page.waitForTimeout(300);
ok(/^Google Calendar bağlı \(yaklaşık (5\d|60) dk\)/.test(await badge(page)), `bağlandı: "${await badge(page)}"`);
ok(await page.locator('#gcalConnect').isHidden() && await page.locator('#gcalDisconnect').isVisible(), 'bağlı: "Bağlan" gizli, "Bağlantıyı kes" görünür');
const stored = await page.evaluate(() => ({ s: sessionStorage.getItem('baGcalSession'), flag: localStorage.getItem('baGcalConnected'), ls: Object.keys(localStorage).filter((k) => /gcal/i.test(k)) }));
ok(Boolean(stored.s) && stored.flag === '1', 'belirteç sessionStorage\'da, localStorage\'da yalnızca "daha önce bağlandı" işareti');
ok(!Object.values(await page.evaluate(() => ({ ...localStorage }))).some((v) => String(v).includes('mock-token-')), 'belirteç localStorage\'a yazılmıyor');

// 3) Yenile → hâlâ bağlı, yeniden izin istenmedi.
const before = await connects(page);
await page.reload(); await page.waitForSelector('#calApp:not([hidden])', { timeout: 15000 });
ok((await badge(page)).startsWith('Google Calendar bağlı (yaklaşık'), 'sayfa yenilenince bağlantı korunuyor');
ok(await connects(page) === before, 'yenilemede yeniden izin istenmedi');

// 4) Süre dolar → rozet "süresi doldu" → ders eklerken izin kendiliğinden yenilenir.
await page.evaluate(() => {
  const s = JSON.parse(sessionStorage.getItem('baGcalSession')); s.expiresAt = Date.now() - 1000; sessionStorage.setItem('baGcalSession', JSON.stringify(s));
});
await page.reload(); await page.waitForSelector('#calApp:not([hidden])', { timeout: 15000 });
ok((await badge(page)).startsWith('Bağlantı süresi doldu, bir sonraki işlemde otomatik yenilenecek'), `süre dolunca: "${await badge(page)}"`);
ok((await page.textContent('#gcalConnect')).trim() === 'Şimdi yenile', 'süre dolunca düğme "Şimdi yenile"');
if (shotDir) await page.screenshot({ path: path.join(shotDir, 'takvim-suresi-doldu-1440-light.png') });
const beforeRenew = await connects(page);
await page.click('#newLessonBtn');
await page.selectOption('#nlStudent', 'ogrenci1');
const day = await page.evaluate(async () => { const c = await import('/js/account/common.js'); return c.addDaysToKey(c.todayKey(), 3); });
await page.fill('#nlDate', day); await page.fill('#nlTime', '18:00');
await page.click('#nlSubmit');
await page.waitForFunction(() => document.getElementById('newLessonDialog')?.open === false, null, { timeout: 15000 }).catch(() => {});
ok(await connects(page) === beforeRenew + 1, 'ders eklerken izin kendiliğinden yenilendi');
ok((await badge(page)).startsWith('Google Calendar bağlı (yaklaşık'), 'yenilemeden sonra rozet "bağlı"');
const created = await page.evaluate(() => JSON.parse(localStorage.getItem('baCalendarMockCalls') || '[]').filter((c) => c.method === 'POST').length);
ok(created === 1, 'ders sahte takvime eklendi');

// 5) Bağlantıyı kes → iptal edildi, belirteç ve işaret silindi, rozet "bağlı değil".
await page.click('#gcalDisconnect'); await page.waitForTimeout(300);
const gone = await page.evaluate(() => ({ s: sessionStorage.getItem('baGcalSession'), flag: localStorage.getItem('baGcalConnected'), revoked: Number(localStorage.getItem('baCalendarMockRevoked') || 0) }));
ok(gone.revoked === 1 && !gone.s && !gone.flag, '"Bağlantıyı kes": iptal edildi, belirteç ve işaret silindi');
ok((await badge(page)).startsWith('Google Calendar bağlı değil') && await page.locator('#gcalDisconnect').isHidden(), 'kesince rozet "bağlı değil"');
await page.reload(); await page.waitForSelector('#calApp:not([hidden])', { timeout: 15000 });
ok((await badge(page)).startsWith('Google Calendar bağlı değil'), 'kesip yenileyince de "bağlı değil"');

// 6) Yeni sekme: belirteç sekmeye özel (sessionStorage), "daha önce bağlandı" işareti rozeti "süresi doldu" yapar.
await page.click('#gcalConnect'); await page.waitForTimeout(300);
const tab = await ctx.newPage();
tab.on('pageerror', (e) => errors.push(e.message));
await tab.goto(`${BASE}/ogretmen-takvim.html`); await tab.waitForSelector('#calApp:not([hidden])', { timeout: 15000 });
ok((await badge(tab)).startsWith('Bağlantı süresi doldu'), 'yeni sekmede belirteç yok, rozet "süresi doldu"');
await tab.close();

// 7) Çıkış (öğretmen paneli → "Çıkış yap"): belirteç ve işaret silinir.
await page.goto(`${BASE}/ogretmen.html`); await page.waitForTimeout(1500);
await page.click('#logoutBtn');
await page.waitForURL(/index\.html/, { timeout: 10000 }).catch(() => {});
const afterLogout = await page.evaluate(() => ({ s: sessionStorage.getItem('baGcalSession'), flag: localStorage.getItem('baGcalConnected') }));
ok(!afterLogout.s && !afterLogout.flag, 'çıkış yapınca belirteç ve işaret silindi');
await ctx.close();

// 8) Ekran görüntüleri: bağlı ve bağlı değil, 390/1440 açık/koyu; taşma yok.
for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
  const c = await newContext({ width, theme });
  const p = await teacherPage(c);
  if (theme === 'light') { await p.click('#gcalConnect'); await p.waitForTimeout(300); }
  const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(over <= 0, `${width} ${theme}: yatay taşma yok (${over})`);
  await p.screenshot({ path: path.join(shotDir, `takvim-${theme === 'light' ? 'bagli' : 'bagli-degil'}-${width}-${theme}.png`) });
  await c.close();
}
console.log('Ekran görüntüleri: ' + shotDir);

ok(errors.length === 0, 'sayfa hatası yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
server.close();
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: takvim bağlantısı');
