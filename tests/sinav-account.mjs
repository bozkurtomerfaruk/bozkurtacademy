// Sınav seti sonuçları, hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:sinav
// Onaylı öğrenci Goethe A1 Lesen Teil 1 ve Schreiben Teil 1 (form) setini çözer → "Kontrol et"te puanı results'a
// (konu "sinav", seviye "a1", alıştırma "goethe-a1-lesen-1-set-1") kaydedilir; dil değişince ikinci kez kaydedilmez →
// öğretmen sınav setlerini ödev olarak verir (A1 ve katalogda olmayan C1) → öğrenci çözünce ödevde "çözüldü" → öğretmenin
// öğrenci sayfasında ve öğrenci panelinde sonuç listesi. Onaysız hesap ve öğretmen hesabı sonuç yazmaz.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'sinav-account-'));

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
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123'], ['ogrenci2', 'bekleyen@example.com', 'ogrenci123']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
const year = new Date().getUTCFullYear();
const profile = (name, email, status) => ({ fields: {
  name: { stringValue: name }, email: { stringValue: email }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: status },
  emailVerified: { booleanValue: true },
  createdAt: { timestampValue: new Date().toISOString() }, ...(status === 'active' ? { approvedAt: { timestampValue: new Date().toISOString() } } : {})
} });
await fetch(`${docsUrl}/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Deniz Kaya', 'ogrenci@example.com', 'active')) });
await fetch(`${docsUrl}/users/ogrenci2`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Ece Bekler', 'bekleyen@example.com', 'pending')) });
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

const results = async (uid) => (await listDocs(`users/${uid}/results`)).map(plain);

// 1. Öğrenci Lesen setini çözer.
const { ctx: sctx, page: student } = await newPage();
await signIn(student, 'ogrenci@example.com', 'ogrenci123', 'student');
await student.goto(`${BASE}/index.html#exams/goethe/a1/lesen/1/set-1`); await student.waitForTimeout(1500);
for (const [n, v] of [[1, 'falsch'], [2, 'richtig'], [3, 'richtig']]) await student.locator(`input[data-task-answer="${n}"][value="${v}"]`).check({ force: true });
await student.click('[data-task-check]'); await student.waitForTimeout(2000);
let r = await results('ogrenci1');
ok(r.length === 1 && r[0].topic === 'sinav' && r[0].level === 'a1' && r[0].exercise === 'goethe-a1-lesen-1-set-1' && r[0].score === '2' && r[0].total === '5' && r[0].at,
  `Lesen sonucu kaydedildi: sinav / a1 / goethe-a1-lesen-1-set-1 / 2 von 5 (${JSON.stringify(r[0])})`);
ok(Object.keys(r[0]).sort().join() === 'at,exercise,level,score,topic,total', 'sadece puan kaydedildi; cevaplar yok');
ok((await student.textContent('#examTask .task-summary')).includes('Sonucun paneline kaydedildi'), 'öğrenciye "Sonucun paneline kaydedildi" notu');
await student.click('[data-lang="de"]').catch(() => {}); await student.waitForTimeout(800);
await student.click('[data-lang="tr"]').catch(() => {}); await student.waitForTimeout(800);
ok((await results('ogrenci1')).length === 1, 'dil değişince sonuç ikinci kez kaydedilmiyor');
await student.click('[data-task-retry]'); await student.waitForTimeout(300);
await student.click('[data-task-check]'); await student.waitForTimeout(1500);
ok((await results('ogrenci1')).length === 2, '"Tekrar çöz" sonrası yeni deneme ayrı kaydediliyor');

// 2. Form seti.
await student.goto(`${BASE}/index.html#exams/goethe/a1/schreiben/1/set-2`); await student.waitForTimeout(1500);
await student.fill('#ft-1', '34'); await student.fill('#ft-2', 'AOK'); await student.fill('#ft-3', 'Kopfschmerzen');
await student.click('[data-ft-check]'); await student.waitForTimeout(1500);
r = (await results('ogrenci1')).filter((x) => x.exercise === 'goethe-a1-schreiben-1-set-2');
ok(r.length === 1 && r[0].score === '3' && r[0].total === '5' && r[0].level === 'a1', `form sonucu kaydedildi: 3 / 5 (${JSON.stringify(r[0])})`);
ok((await student.textContent('[data-ft-summary]')).includes('Sonucun paneline kaydedildi'), 'formda da "kaydedildi" notu');
ok((await listDocs('users/ogrenci1/writings')).length === 0, 'form bir yazma görevi değil: writings boş');
await sctx.close();

// 3. Öğretmen ödev verir: A1 sınav setleri (Lesen + form) ve C1 (katalogda yok).
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok(await teacher.locator('#aLevel option[value="C1"]').count() === 1, 'ödev ekranında C1 (sadece sınav setleri) seviyesi');
await teacher.selectOption('#aLevel', 'A1'); await teacher.waitForTimeout(500);
ok(await teacher.locator('#aTopic option[value="sinav"]').count() === 1, 'A1 için "Sınav setleri" konusu');
await teacher.selectOption('#aTopic', 'sinav'); await teacher.waitForTimeout(800);
const labels = await teacher.locator('#aExerciseList label').allTextContents();
ok(labels.some((x) => x.includes('Lesen · Teil 1 · Grüße aus dem Urlaub')) && labels.some((x) => x.includes('Schreiben · Teil 1 · Beim Arzt')) && !labels.some((x) => x.includes('Zusammen kochen')),
  `A1 sınav setleri: Lesen ve form var, kısa mesaj (yazma görevi) yok (${labels.length} set)`);
await teacher.locator('#aExerciseList label', { hasText: 'Lesen · Teil 1 · Grüße aus dem Urlaub' }).locator('input').check();
await teacher.locator('#aExerciseList label', { hasText: 'Lesen · Teil 2 · Einkaufen in der Stadt' }).locator('input').check();
await teacher.selectOption('#aTopic', 'schreiben'); await teacher.waitForTimeout(800);
ok(!(await teacher.locator('#aExerciseList').textContent()).includes('Beim Arzt') && (await teacher.locator('#aExerciseList').textContent()).includes('Zusammen kochen'), '"Schreiben" konusunda sadece yazma görevleri (form yok)');
await teacher.fill('#aTitle', 'Sınav: Lesen A1');
await teacher.click('#aSubmit'); await teacher.waitForURL(/ogretmen\.html/, { timeout: 15000 }).catch(() => {});
const a = await listDocs('users/ogrenci1/assignments');
ok(a.length === 1 && JSON.stringify(a[0].fields.exercises).includes('goethe-a1-lesen-1-set-1') && JSON.stringify(a[0].fields.exercises).includes('"sinav"'), 'ödev kaydedildi (konu sinav)');

// 4. Öğrenci ödevdeki seti çözer → "çözüldü".
const { ctx: pctx, page: panel } = await newPage(390);
await signIn(panel, 'ogrenci@example.com', 'ogrenci123', 'student');
await panel.goto(`${BASE}/panel.html`); await panel.waitForSelector('.acc-assign-exercises', { timeout: 15000 }).catch(() => {});
const link = panel.locator('.acc-assign-exercises a[href="index.html#exams/goethe/a1/lesen/2/set-1"]');
ok(await link.count() === 1, 'ödevdeki bağlantı sınav setini açıyor');
ok((await panel.locator('.acc-assign-exercises li').filter({ hasText: 'Grüße aus dem Urlaub' }).textContent()).includes('Henüz çözülmedi'), 'ödev verilmeden önceki sonuç sayılmıyor: "Henüz çözülmedi"');
await link.click(); await panel.waitForTimeout(1500);
await panel.click('[data-task-check]'); await panel.waitForTimeout(1500);
await panel.goto(`${BASE}/panel.html`); await panel.waitForSelector('.acc-assign-exercises', { timeout: 15000 }).catch(() => {});
ok((await panel.locator('.acc-assign-exercises li').filter({ hasText: 'Einkaufen in der Stadt' }).textContent()).includes('Çözüldü'), 'çözülen set ödevde "Çözüldü"');
const hist = await panel.textContent('#historyList');
ok(hist.includes('Goethe A1 · Lesen · Teil 1 · Grüße aus dem Urlaub') && hist.includes('Sınav hazırlığı') && hist.includes('Schreiben · Teil 1 · Beim Arzt'), 'öğrenci panelindeki sonuç listesinde sınav setleri');
ok(await panel.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, '390: panelde taşma yok');
await panel.screenshot({ path: path.join(shotDir, 'panel-sinav-390.png'), fullPage: true });
await pctx.close();

// 5. Öğretmenin öğrenci sayfası.
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`); await teacher.waitForSelector('#resultsList table', { timeout: 15000 }).catch(() => {});
const row = teacher.locator('#resultsList tr', { hasText: 'Grüße aus dem Urlaub' });
ok(await row.count() === 1 && (await row.textContent()).includes('A1') && (await row.textContent()).includes('2 deneme'), 'öğretmen sonuç listesinde: Goethe A1 Lesen seti, seviye A1, 2 deneme');
await teacher.locator('#resultsList').screenshot({ path: path.join(shotDir, 'ogretmen-sonuclar-1440.png') });

// 6. Öğretmen hesabı ve onaysız hesap sonuç yazmaz.
await teacher.goto(`${BASE}/index.html#exams/goethe/a1/lesen/1/set-2`); await teacher.waitForTimeout(1500);
await teacher.click('[data-task-check]'); await teacher.waitForTimeout(1200);
ok((await listDocs(`users/${TEACHER}/results`)).length === 0, 'öğretmen hesabıyla sonuç kaydedilmiyor');
await tctx.close();
const { ctx: qctx, page: pending } = await newPage();
await signIn(pending, 'bekleyen@example.com', 'ogrenci123', 'student');
await pending.goto(`${BASE}/index.html#exams/goethe/a1/lesen/1/set-1`); await pending.waitForTimeout(1500);
await pending.click('[data-task-check]'); await pending.waitForTimeout(1500);
ok((await listDocs('users/ogrenci2/results')).length === 0, 'onaysız hesabın sonucu kaydedilmiyor');
await qctx.close();

await browser.close();
server.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
