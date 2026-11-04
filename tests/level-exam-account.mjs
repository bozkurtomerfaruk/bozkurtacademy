// Seviye sonu sınavı, hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:level-exam
// Öğrenci sınavı iki kez çözer → results'a puan ve konu bazında hatalar yazılır (sorular yazılmaz) →
// öğretmen detayında deneme sayısı, ilk ve son puan, son denemedeki hatalar → öğretmen sınavı ödev olarak verir →
// öğrenci panelindeki ödev bağlantısı sınavı açar. Site için kendi statik sunucusunu açar; Firebase SDK
// dosyaları gstatic yerine node_modules/firebase'den verilir. Ekran görüntüleri: $S ya da geçici klasör.
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
const exam = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/seviye-sonu/a1.json'), 'utf8'));
const byId = Object.fromEntries(exam.questions.map((q) => [q.id, q]));
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'level-exam-account-'));

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const BASE = `http://localhost:${server.address().port}`;

const FS = 'http://127.0.0.1:8080', AUTH = 'http://127.0.0.1:9099';
const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
// Onaylı yetişkin öğrenci profili (kuralları atlayarak).
const year = new Date().getUTCFullYear();
await fetch(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  name: { stringValue: 'Deniz Kaya' }, email: { stringValue: 'ogrenci@example.com' }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: 'active' },
  createdAt: { timestampValue: new Date().toISOString() }, approvedAt: { timestampValue: new Date().toISOString() }
} }) });
const listDocs = async (p) => ((await (await fetch(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${p}?pageSize=100`, { headers: owner })).json()).documents || []);

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
async function newPage(width = 1280) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('baEmulator', '1'); } catch (_) {} });
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
const css = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
async function takeExam(page, correct) {
  await page.goto(`${BASE}/index.html#seviye-sonu/A1`); await page.waitForTimeout(1500);
  await page.click('[data-le-start], [data-le-retry]'); await page.waitForTimeout(400);
  const ids = await page.locator('.le-q').evaluateAll((els) => els.map((e) => e.dataset.q));
  for (const [i, id] of ids.entries()) {
    const q = byId[id];
    await page.locator(`.le-q[data-q="${id}"] input[value="${css(i < correct ? q.answer : q.options.find((o) => o !== q.answer))}"]`).check();
  }
  await page.click('[data-le-finish]');
  await page.waitForSelector('#levelExamResult .result-saved-note', { timeout: 10000 }).catch(() => {});
  return ids;
}

// 1. Öğrenci iki kez çözer.
const { ctx: sctx, page: student } = await newPage();
await signIn(student, 'ogrenci@example.com', 'ogrenci123', 'student');
const ids1 = await takeExam(student, 15);
const note = await student.textContent('#levelExamResult .result-saved-note').catch(() => '');
ok(note.includes('kaydedildi') && await student.locator('[data-le-visitor]').count() === 0, `giriş yapmış öğrenciye "kaydedildi" notu (${note})`);
await student.screenshot({ path: path.join(shotDir, 'sinav-kaydedildi.png') });
await student.waitForTimeout(500);
const ids2 = await takeExam(student, 25);
await student.waitForTimeout(800);
const docs = await listDocs('users/ogrenci1/results');
const results = docs.map((d) => Object.fromEntries(Object.entries(d.fields).map(([k, v]) => [k, Object.values(v)[0]])));
ok(results.length === 2 && results.every((r) => r.level === 'A1' && r.topic === 'seviye-sonu' && r.exercise === 'a1' && r.total === '30'), 'iki sonuç kaydedildi (A1, seviye-sonu, a1, 30 soru)');
ok(results.map((r) => r.score).sort().join() === '15,25', 'puanlar 15 ve 25');
const wrongIn = (ids, from) => ids.slice(from).reduce((m, id) => (m[byId[id].topic] = (m[byId[id].topic] || 0) + 1, m), {});
const first = results.find((r) => r.score === '15');
ok(JSON.stringify(Object.fromEntries(first.topicErrors.split(',').map((x) => x.split(':')).map(([k, v]) => [k, +v]))) === JSON.stringify(wrongIn(ids1, 15)), `konu bazında hatalar kaydedildi (${first.topicErrors})`);
ok(docs.every((d) => Object.keys(d.fields).sort().join() === 'at,exercise,level,score,topic,topicErrors,total') && !JSON.stringify(docs).includes(ids1[0]), 'kayıtta soru kimlikleri yok, sadece puan ve konu hataları');
await sctx.close();

// 2. Öğretmen detayı: deneme sayısı, ilk ve son puan, son denemedeki hatalar.
const { ctx: tctx, page: teacher } = await newPage();
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`); await teacher.waitForSelector('#resultsList table', { timeout: 15000 }).catch(() => {});
const row = teacher.locator('#resultsList tr', { hasText: 'A1 seviye sonu sınavı' });
const cells = await row.locator('td').allTextContents();
ok(cells.length === 7 && cells[2] === '15/30' && cells[3] === '25/30' && cells[5].includes('2 deneme'), `öğretmen: ilk 15/30, son 25/30, 2 deneme (${cells.join(' | ')})`);
const lastErrors = await row.locator('[data-level-exam-errors]').textContent();
ok(lastErrors.startsWith('Son denemedeki hatalar:') && Object.keys(wrongIn(ids2, 25)).every((t) => lastErrors.length > 20), `son denemedeki hatalar gösteriliyor (${lastErrors})`);
await teacher.locator('#resultsList').screenshot({ path: path.join(shotDir, 'ogretmen-sonuclar.png') });

// 3. Ödev: konu listesinde "Seviye sonu sınavı", alıştırma "A1 seviye sonu sınavı".
await teacher.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await teacher.selectOption('#aLevel', 'A1');
ok(await teacher.locator('#aTopic option[value="seviye-sonu"]').count() === 1, 'ödev ekranında A1 için "Seviye sonu sınavı" seçilebiliyor');
await teacher.selectOption('#aTopic', 'seviye-sonu'); await teacher.waitForTimeout(500);
await teacher.locator('#aExerciseList label', { hasText: 'A1 seviye sonu sınavı' }).locator('input').check();
await teacher.fill('#aTitle', 'A1 seviye sonu sınavı');
await teacher.click('#aSubmit'); await teacher.waitForURL(/ogretmen\.html/, { timeout: 15000 }).catch(() => {});
const assignments = await listDocs('users/ogrenci1/assignments');
ok(assignments.length === 1 && JSON.stringify(assignments[0].fields.exercises).includes('seviye-sonu'), 'ödev kaydedildi');
await tctx.close();

// 4. Öğrenci panelinde ödev bağlantısı sınavı açıyor.
const { ctx: s2, page: panel } = await newPage(390);
await signIn(panel, 'ogrenci@example.com', 'ogrenci123', 'student');
await panel.goto(`${BASE}/panel.html`); await panel.waitForTimeout(3000);
const link = panel.locator('a[href="index.html#seviye-sonu/A1"]');
ok(await link.count() >= 1, 'öğrenci panelinde ödev bağlantısı #seviye-sonu/A1');
await panel.screenshot({ path: path.join(shotDir, 'panel-odev-390.png'), fullPage: true });
await link.first().click(); await panel.waitForTimeout(2000);
ok(panel.url().endsWith('#seviye-sonu/A1') && (await panel.textContent('#levelExamApp h1')).includes('A1'), 'bağlantı sınavı açıyor');
await s2.close();

await browser.close();
server.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
