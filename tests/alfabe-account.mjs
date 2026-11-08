// Almanca Alfabe oyunu, hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:alfabe-account
// Ziyaretçide Firebase yüklenmiyor → girişten önceki yerel ilerleme ile hesaptaki ilerleme en iyi değerlerle birleşip
// iki tarafa yazılıyor → tur sonunda hesap güncelleniyor → başka cihazdaki ilerleme kaybolmuyor → başka hesabın yerel
// ilerlemesi karışmıyor → onaysız hesapta sadece yerel. Site için kendi statik sunucusunu açar; Firebase SDK dosyaları
// gstatic yerine node_modules/firebase'den verilir.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = 'demo-bozkurtacademy';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  let file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://localhost:${server.address().port}`;

const FS = 'http://127.0.0.1:8080', AUTH = 'http://127.0.0.1:9099';
const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const docsUrl = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
for (const [localId, email] of [['ogrenci1', 'ogrenci@example.com'], ['ogrenci2', 'bekleyen@example.com']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password: 'ogrenci123' }) });
}
const year = new Date().getUTCFullYear();
const profile = (name, email, status) => ({ fields: {
  name: { stringValue: name }, email: { stringValue: email }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: status },
  createdAt: { timestampValue: new Date().toISOString() }
} });
await fetch(`${docsUrl}/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Deniz Kaya', 'ogrenci@example.com', 'active')) });
await fetch(`${docsUrl}/users/ogrenci2`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Ece Bekler', 'bekleyen@example.com', 'pending')) });

// JS value ⇄ Firestore REST value
const toFs = (v) => Number.isInteger(v) ? { integerValue: String(v) } : typeof v === 'string' ? { stringValue: v }
  : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toFs(x)])) } };
const fromFs = (v) => 'integerValue' in v ? Number(v.integerValue) : 'mapValue' in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFs(x)])) : Object.values(v)[0];
const PROGRESS = (uid) => `${docsUrl}/users/${uid}/progress/alfabe`;
const readRemote = async (uid) => { const d = await (await fetch(PROGRESS(uid), { headers: owner })).json(); return d.fields ? fromFs({ mapValue: { fields: d.fields } }) : null; };
const writeRemote = (uid, p) => fetch(PROGRESS(uid), { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: { ...toFs(p).mapValue.fields, updatedAt: { timestampValue: new Date().toISOString() } } }) });

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const firebaseLoads = [];
  await ctx.addInitScript(() => { try { localStorage.setItem('baEmulator', '1'); } catch (_) {} });
  await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
    firebaseLoads.push(route.request().url());
    const file = path.join(ROOT, 'node_modules/firebase', path.basename(new URL(route.request().url()).pathname));
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || /alfabe sync/.test(m.text())) errors.push(m.text()); });
  return { ctx, page, firebaseLoads };
}
async function signIn(page, email) {
  await page.goto(`${BASE}/giris.html`); await page.waitForTimeout(800);
  await page.evaluate(async (e) => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, e, 'ogrenci123');
    localStorage.setItem('baAccount', 'student');
  }, email);
}
const setLocal = (page, v) => page.evaluate((x) => localStorage.setItem('baAlfabe', JSON.stringify(x)), v);
const getLocal = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('baAlfabe') || 'null'));
const empty = () => ({ stats: {}, best: {}, stars: 0 });
// One "Sıraya Diz" round for children, sorting by taps; the first question is answered wrong.
async function playOrderRound(page) {
  await page.goto(`${BASE}/almanca-alfabe/#sirala`); await page.waitForSelector('[data-ab-pos]');
  for (let q = 0; q < 10; q++) {
    await page.waitForSelector('[data-ab-pos]:not([disabled])');
    if (q > 0) {
      for (let guard = 0; guard < 20; guard++) {
        const cur = await page.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
        const sorted = [...cur].sort();
        const i = cur.findIndex((x, k) => x !== sorted[k]);
        if (i < 0) break;
        await page.click(`[data-ab-pos="${cur.indexOf(sorted[i])}"]`); await page.click(`[data-ab-pos="${i}"]`);
      }
    }
    await page.click('[data-ab-check]');
    await page.click('[data-ab-next]');
  }
  await page.waitForSelector('.ab-result');
}

// 1. Visitor: the game works and Firebase is never downloaded.
{
  const { ctx, page, firebaseLoads } = await newPage();
  await page.goto(`${BASE}/almanca-alfabe/`); await page.waitForSelector('[data-ab-pick]');
  await page.click('[data-ab-pick="cocuk"]'); await page.waitForSelector('.ab-modes');
  await page.waitForTimeout(800);
  ok(firebaseLoads.length === 0, 'ziyaretçide Firebase yüklenmiyor');
  ok(await page.locator('[data-ab-synced]').count() === 0, 'ziyaretçide "hesabına kaydediliyor" notu yok');
  await ctx.close();
}

// 2. Active student: local progress from before sign-in and the account's progress are merged (best values).
await writeRemote('ogrenci1', { cocuk: { stats: { A: { r: 1, w: 2 }, B: { r: 2, w: 0 } }, best: { duy: 9 }, stars: 12 }, yetiskin: { stats: {}, best: { sirala: 40 }, stars: 0 } });
{
  const { ctx, page } = await newPage();
  await signIn(page, 'ogrenci@example.com');
  await setLocal(page, { profil: 'cocuk', ses: false, p: { cocuk: { stats: { A: { r: 3, w: 1 }, V: { r: 0, w: 2 } }, best: { duy: 7, sirala: 5 }, stars: 5 }, yetiskin: { stats: {}, best: { sirala: 60 }, stars: 0 } } });
  await page.goto(`${BASE}/almanca-alfabe/`);
  await page.waitForSelector('[data-ab-synced]', { timeout: 15000 });
  ok(true, 'onaylı öğrenci: menüde "İlerlemen hesabına da kaydediliyor"');
  const local = await getLocal(page);
  const remote = await readRemote('ogrenci1');
  const want = { stats: { A: { r: 3, w: 2 }, B: { r: 2, w: 0 }, V: { r: 0, w: 2 } }, best: { duy: 9, sirala: 5 }, stars: 12 };
  ok(JSON.stringify(local.p.cocuk) === JSON.stringify(want), 'yerel kayıt birleşti: ' + JSON.stringify(local.p.cocuk));
  ok(JSON.stringify(remote.cocuk) === JSON.stringify(want), 'hesaptaki kayıt birleşti: ' + JSON.stringify(remote.cocuk));
  ok(remote.yetiskin.best.sirala === 60 && local.uid === 'ogrenci1', 'yetişkin en iyi skoru ve hesap kimliği (yerel uid)');
  ok(local.profil === 'cocuk' && local.ses === false && !('profil' in remote) && !('ses' in remote), 'profil ve ses ayarı sadece yerelde');
  ok((await page.textContent('.ab-stars')).includes('12'), 'birleşen yıldızlar ekranda');

  // A round updates the account; progress another device wrote in the meantime is kept.
  await writeRemote('ogrenci1', { ...remote, yetiskin: { stats: { Z: { r: 4, w: 0 } }, best: { sirala: 60 }, stars: 0 } });
  await playOrderRound(page);
  await page.waitForTimeout(1500);
  const after = await readRemote('ogrenci1');
  ok(after.cocuk.stars === 21, `tur sonunda hesap güncellendi (yıldız ${after.cocuk.stars})`);
  ok(after.yetiskin.stats.Z?.r === 4, 'başka cihazın ilerlemesi korunuyor');
  ok((await getLocal(page)).p.yetiskin.stats.Z?.r === 4, 'başka cihazın ilerlemesi bu cihaza da geldi');
  await ctx.close();
}

// 3. Local progress that belongs to another account is not mixed into this one.
{
  const before = await readRemote('ogrenci1');
  const { ctx, page } = await newPage();
  await signIn(page, 'ogrenci@example.com');
  await setLocal(page, { profil: 'cocuk', uid: 'baskaHesap', p: { cocuk: { stats: { Q: { r: 50, w: 0 } }, best: { duy: 10 }, stars: 999 }, yetiskin: empty() } });
  await page.goto(`${BASE}/almanca-alfabe/`); await page.waitForSelector('[data-ab-synced]', { timeout: 15000 });
  const remote = await readRemote('ogrenci1');
  const local = await getLocal(page);
  ok(remote.cocuk.stars === before.cocuk.stars && !remote.cocuk.stats.Q, 'başka hesabın yerel ilerlemesi hesaba karışmıyor');
  ok(local.uid === 'ogrenci1' && local.p.cocuk.stars === before.cocuk.stars, 'cihazda bu hesabın ilerlemesi gösteriliyor');
  await ctx.close();
}

// 4. Account waiting for approval: local only, nothing is written.
{
  const { ctx, page } = await newPage();
  await signIn(page, 'bekleyen@example.com');
  await setLocal(page, { profil: 'cocuk', p: { cocuk: { stats: { A: { r: 1, w: 0 } }, best: {}, stars: 3 }, yetiskin: empty() } });
  await page.goto(`${BASE}/almanca-alfabe/`); await page.waitForSelector('.ab-modes');
  await page.waitForTimeout(2500);
  ok(await readRemote('ogrenci2') === null, 'onaysız hesapta hesaba yazılmıyor');
  ok(await page.locator('[data-ab-synced]').count() === 0 && (await getLocal(page)).p.cocuk.stars === 3, 'onaysız hesapta oyun yerelde devam ediyor');
  await ctx.close();
}

ok(errors.length === 0, 'konsol hatası yok: ' + errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
if (fails.length) { console.log(`\n${fails.length} FAIL`); process.exit(1); }
console.log('\nHepsi geçti.');
