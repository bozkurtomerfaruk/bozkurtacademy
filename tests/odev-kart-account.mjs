// Ödev kartlarında öğrenci adları ve kısa içerik özeti (öğretmen paneli "Ödevler" sekmesi ve ogretmen-odevler.html).
// Çalıştırma: npm run test:odev (Firebase Emulator: auth + firestore). Tek öğrenci, iki öğrenci (çok uzun adlar), beş öğrenci
// ("ve 3 kişi daha", tamamı "Ayrıntılar"da); 1440 ve 390 (açık/koyu), taşma yok.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'odev-kart-'));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg' };
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
const year = new Date().getUTCFullYear();
const profile = (name, email, status) => ({ fields: {
  name: { stringValue: name }, email: { stringValue: email }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: status },
  emailVerified: { booleanValue: true },
  createdAt: { timestampValue: new Date().toISOString() }, ...(status === 'active' ? { approvedAt: { timestampValue: new Date().toISOString() } } : {})
} });
await fetch(`${docsUrl}/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Deniz Kaya', 'ogrenci@example.com', 'active')) });
const listDocs = async (p) => ((await (await fetch(`${docsUrl}/${p}?pageSize=100`, { headers: owner })).json()).documents || []);
const getDocRest = async (p) => (await fetch(`${docsUrl}/${p}`, { headers: owner })).json();
const plain = (d) => Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, Object.values(v)[0]]));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
async function newPage(width = 1280, theme = 'light') {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript((t) => { try { localStorage.setItem('baEmulator', '1'); if (!sessionStorage.getItem('th')) { sessionStorage.setItem('th', '1'); localStorage.setItem('ba-theme', t); } } catch (_) {} }, theme);
  await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
    const file = path.join(ROOT, 'node_modules/firebase', path.basename(new URL(route.request().url()).pathname));
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  return { ctx, page };
}
async function signIn(page, email, password, role) {
  await page.goto(`${BASE}/giris.html`); await page.waitForTimeout(800);
  await page.evaluate(async ([e, p, r]) => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, e, p);
    localStorage.setItem('baAccount', r);
  }, [email, password, role]);
}


const shot = async (page, name) => { await page.evaluate(() => window.scrollTo(0, 0)); return page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: true }); };
// Sayfa ve her kartın içi: hiçbir öğe kartın sağ kenarını geçmez.
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 0
  && [...document.querySelectorAll('.odev-item, .acc-card, .odev-draft, .odev-approve-bar')].every((c) => {
    const right = c.getBoundingClientRect().right + 1;
    return [...c.querySelectorAll('*')].every((e) => !e.getClientRects().length || e.getBoundingClientRect().right <= right);
  }));
const LONG1 = 'Maximilian Alexander Konstantin Schwarzenberger-Hohenlohe-Waldenburg';
const LONG2 = 'Ayşegülnurhayatperihan Karaosmanoğlubüyükşehirlioğullarından';
const people = [['ogrenci1', 'Deniz Kaya'], ['s2', 'Arda Can'], ['s3', 'Ece Bekler'], ['s4', 'Zeynep Ak'], ['s5', 'Mert Su'], ['s6', LONG1], ['s7', LONG2]];
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
for (const [id, name] of people) await fetch(`${docsUrl}/users/${id}`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile(name, `${id}@example.com`, 'active')) });
const val = (v) => v === null ? { nullValue: null } : typeof v === 'boolean' ? { booleanValue: v } : typeof v === 'number' ? { integerValue: String(v) }
  : v instanceof Date ? { timestampValue: v.toISOString() } : Array.isArray(v) ? { arrayValue: { values: v.map(val) } }
  : typeof v === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x)])) } } : { stringValue: v };
async function give(groupId, uids, data, ago){
  for (const uid of uids) {
    await fetch(`${docsUrl}/users/${uid}/assignments/${groupId}-${uid}`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: val({
      schemaVersion: 2, groupId, createdAt: new Date(Date.now() - ago * 60e3), done: false, doneAt: null, studentDocUrl: '', dueAt: null,
      description: '', links: [], topics: [], exercises: [], ...data
    }).mapValue.fields }) });
  }
}
await give('tek', ['ogrenci1'], { title: 'lassen tekrar', exercises: [
  { level: 'B1', topic: 'lassen-infinitiv', exercise: 'a-1' }, { level: 'B1', topic: 'lassen-infinitiv', exercise: 'b-2' }, { level: 'B1', topic: 'lassen-infinitiv', exercise: 'c-3' },
  { level: 'B1', topic: 'sinav', exercise: 'goethe-b1-lesen-2-set-3' }],
  links: [{ url: 'https://drive.google.com/file/d/abc/view', title: 'Arbeitsblatt', kind: 'pdf', copy: false }] }, 1);
await give('bes', ['ogrenci1', 's2', 's3', 's4', 's5'], { title: 'Perfekt bütün grup', topics: [{ level: 'A1', topic: 'perfekt' }] }, 2);
await give('uzun', ['s6', 's7'], { title: 'Uzun adlar', links: [{ url: 'https://www.youtube.com/watch?v=x', title: '', kind: 'youtube', copy: false }] }, 3);
const SUMMARY_TEK = 'lassen + Infinitiv · 3 paket · Goethe B1 Lesen Teil 2 Set 3 · 1 PDF';

for (const [width, theme] of [[1440, 'light'], [390, 'light'], [390, 'dark']]) {
  const { ctx, page } = await newPage(width, theme);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  // Öğretmen paneli, "Ödevler" sekmesi.
  await page.goto(`${BASE}/ogretmen.html`); await page.waitForSelector('#tab-odevler', { timeout: 15000 });
  await page.click('#tab-odevler');
  await page.waitForSelector('#list-odevler .acc-assign-row .acc-assign-who', { timeout: 15000 });
  const row = (title) => page.locator('#list-odevler .acc-assign-row', { hasText: title });
  if (width === 1440) {
    ok((await row('lassen tekrar').locator('.acc-assign-who').textContent()) === 'Deniz Kaya', 'panel: tek öğrenci "Deniz Kaya"');
    ok((await row('lassen tekrar').locator('.acc-assign-summary').textContent()) === SUMMARY_TEK, `panel: özet "${SUMMARY_TEK}"`);
    ok((await row('Perfekt bütün grup').locator('.acc-assign-who').textContent()) === 'Arda Can, Deniz Kaya ve 3 kişi daha', 'panel: 5 öğrenci → "Arda Can, Deniz Kaya ve 3 kişi daha"');
    ok((await row('Perfekt bütün grup').locator('.acc-assign-summary').textContent()) === "Perfekt'e giriş · konunun tamamı", 'panel: konunun tamamı özeti');
    await row('Perfekt bütün grup').locator('.acc-assign-all summary').click();
    ok((await row('Perfekt bütün grup').locator('.acc-assign-all li').allTextContents()).join('|') === 'Arda Can|Deniz Kaya|Ece Bekler|Mert Su|Zeynep Ak', 'panel: "Ayrıntılar"da 5 adın tamamı');
    ok((await row('Uzun adlar').locator('.acc-assign-who').textContent()) === `${LONG2} ve ${LONG1}` && await row('Uzun adlar').locator('.acc-assign-all').count() === 0, 'panel: iki ad tam, "Ayrıntılar" yok');
  } else {
    await row('Perfekt bütün grup').locator('.acc-assign-all summary').click();
  }
  ok(await noOverflow(page), `${width} ${theme}: panel "Ödevler" taşmıyor`);
  ok(!(await page.textContent('#list-odevler')).includes('null'), `${width} ${theme}: panelde "null" yazısı yok`);
  ok(await page.evaluate(() => [...document.querySelectorAll('#list-odevler .acc-assign-row')].every((r) => r.scrollWidth <= r.clientWidth + 1 && r.getBoundingClientRect().right <= innerWidth)), `${width} ${theme}: uzun adlar kartı geçmiyor (panel)`);
  await page.locator('#panel-odevler').screenshot({ path: path.join(shotDir, `panel-odevler-${width}-${theme}.png`) });

  // ogretmen-odevler.html: tüm öğrenciler ve tek öğrenci görünümü.
  await page.goto(`${BASE}/ogretmen-odevler.html`); await page.waitForSelector('.odev-item .odev-who', { timeout: 15000 });
  const item = (title) => page.locator('.odev-item', { hasText: title });
  if (width === 1440) {
    ok(await item('lassen tekrar').locator('.odev-who').textContent() === 'Deniz Kaya', 'ödev sayfası: tek öğrenci "Deniz Kaya"');
    ok(await item('lassen tekrar').locator('.odev-summary').textContent() === SUMMARY_TEK, 'ödev sayfası: özet');
    ok(await item('Perfekt bütün grup').locator('.odev-who').textContent() === 'Arda Can, Deniz Kaya ve 3 kişi daha', 'ödev sayfası: 5 öğrenci kısaltılmış');
    await item('Perfekt bütün grup').locator('.odev-details > summary').click();
    ok((await item('Perfekt bütün grup').locator('.odev-ex-block', { hasText: 'Öğrenciler' }).locator('li').count()) === 5, 'ödev sayfası: "Ayrıntılar"da 5 öğrencinin tamamı');
    ok(await item('Uzun adlar').locator('.odev-summary').textContent() === '1 video', 'ödev sayfası: bağlantı özeti "1 video"');
  } else {
    await item('Uzun adlar').locator('.odev-details > summary').click();
  }
  ok(await noOverflow(page), `${width} ${theme}: ödev sayfası (tüm öğrenciler) taşmıyor`);
  await shot(page, `odevler-hepsi-${width}-${theme}`);
  await page.goto(`${BASE}/ogretmen-odevler.html?ogrenci=ogrenci1`); await page.waitForSelector('.odev-item .odev-summary', { timeout: 15000 });
  if (width === 1440) {
    ok(await item('Perfekt bütün grup').locator('.odev-who').count() === 0 && (await item('Perfekt bütün grup').locator('.odev-meta').textContent()).includes('Deniz Kaya, Arda Can ve 3 kişi daha'), 'tek öğrenci görünümü: seçili öğrenci önce, "ve 3 kişi daha"');
    ok(!(await item('lassen tekrar').locator('.odev-meta').textContent()).includes('Deniz'), 'tek öğrenci görünümü: yalnız ona verilen ödevde ad tekrar edilmiyor');
  }
  await page.goto(`${BASE}/ogretmen-odevler.html?ogrenci=s6`); await page.waitForSelector('.odev-item .odev-meta', { timeout: 15000 });
  ok(await noOverflow(page), `${width} ${theme}: tek öğrenci görünümü (uzun ad) taşmıyor`);
  await ctx.close();
}

ok(!errors.length, `sayfa hatası yok ${errors.join(' | ')}`);
await browser.close();
server.close();
console.log(`Ekran görüntüleri: ${shotDir}`);
if (fails.length) { console.log(`\n${fails.length} hata`); process.exit(1); }
console.log('\nHepsi geçti.');
