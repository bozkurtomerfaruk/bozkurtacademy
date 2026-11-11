// Schreiben, hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:schreiben
// Onaylı öğrenci Goethe B1 Teil 1 görevini gönderir → users/{uid}/writings + limits/writing → öğretmen panelinde
// "geri bildirim bekliyor" işareti → öğrenci detayında geri bildirim → ödev olarak verme → öğrenci panelinde yeni
// geri bildirim işareti ve açınca "görüldü" → günlük sınır (24 saatte 10) → onaysız hesap. Site için kendi statik
// sunucusunu açar; Firebase SDK dosyaları gstatic yerine node_modules/firebase'den verilir. Ekran görüntüleri: $S ya da geçici klasör.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'schreiben-account-'));

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
const TEXT = 'Liebe Lena,\nwie geht es dir? Ich wohne jetzt seit zwei Wochen in meiner neuen Wohnung. Sie ist klein, aber sehr hell. Ich bin umgezogen, weil die alte Wohnung zu teuer war. Hast du am Samstag Zeit? Dann kochen wir zusammen.\nLiebe Grüße\nDeniz';
async function writeAndSubmit(page, text = TEXT) {
  await page.goto(`${BASE}/index.html#exams/goethe/b1/schreiben/1/set-1`); await page.waitForTimeout(1500);
  await page.fill('#wtText', text);
  await page.click('[data-wt-submit]');
  await page.waitForFunction(() => !/kaydediliyor/i.test(document.querySelector('[data-wt-status]')?.textContent || 'kaydediliyor'), null, { timeout: 15000 }).catch(() => {});
  return (await page.textContent('[data-wt-status]')).trim();
}

// 1. Onaylı öğrenci gönderir.
const { ctx: sctx, page: student } = await newPage();
await signIn(student, 'ogrenci@example.com', 'ogrenci123', 'student');
const note = await writeAndSubmit(student);
ok(note.includes('Metnin kaydedildi'), `öğrenciye "kaydedildi" notu (${note})`);
ok((await student.textContent('#wtModelTitle')).includes('Örnek cevap'), 'gönderince örnek cevap açılıyor');
await student.screenshot({ path: path.join(shotDir, 'ogrenci-gonderdi-1280.png'), fullPage: true });
let writings = await listDocs('users/ogrenci1/writings');
const w1 = writings[0] && plain(writings[0]);
ok(writings.length === 1 && w1.exam === 'goethe' && w1.level === 'b1' && w1.teil === '1' && w1.set === 'set-1' && w1.text === TEXT && Number(w1.words) === (TEXT.match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []).length && w1.at,
  `metin kaydedildi (goethe/b1/1/set-1, ${w1?.words} kelime)`);
ok(!('feedback' in (w1 || {})), 'kayıtta geri bildirim alanı yok');
const lim = plain(await getDocRest('users/ogrenci1/limits/writing'));
ok(lim.count === '1' && lim.lastId === writings[0].name.split('/').pop(), 'günlük sınır belgesi: 1. metin');
await sctx.close();

// 2. Öğretmen: genel ekranda işaret, detayda geri bildirim.
const { ctx: tctx, page: teacher } = await newPage();
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#teacherApp:not([hidden])', { timeout: 15000 }).catch(() => {});
await teacher.waitForTimeout(800);
ok((await teacher.textContent('#writingNotice')).includes('Geri bildirim bekleyen 1 yazı'), 'öğretmen genel ekranında "geri bildirim bekleyen 1 yazı"');
const badge = teacher.locator('#list-ogrenciler [data-pending-writings="1"]');
ok(await badge.count() === 1 && (await badge.getAttribute('href')).endsWith('id=ogrenci1#yazilar'), 'öğrenci satırında "1 geri bildirim bekliyor" işareti, detaya gidiyor');
await teacher.locator('#list-ogrenciler').screenshot({ path: path.join(shotDir, 'ogretmen-liste.png') });
await badge.click(); await teacher.waitForSelector('#writingsList [data-writing]', { timeout: 15000 }).catch(() => {});
const item = teacher.locator('#writingsList [data-writing]').first();
ok((await item.textContent()).includes('Goethe B1 · Teil 1 · Neue Wohnung') && (await item.textContent()).includes('Geri bildirim bekliyor'), 'detayda görev adı ve "geri bildirim bekliyor"');
ok((await teacher.textContent('#writingsCount')).includes('1 geri bildirim bekliyor'), 'bölüm başlığında sayaç');
ok((await item.locator('.acc-writing-text').textContent()) === TEXT, 'öğrencinin metni olduğu gibi görünüyor');
await item.locator('textarea').fill('Üç maddenin hepsi var. "Ich bin umgezogen, weil …" doğru; "seit zwei Wochen" da güzel.');
await teacher.locator('#writingsList').screenshot({ path: path.join(shotDir, 'ogretmen-geri-bildirim.png') });
await item.locator('button', { hasText: 'Geri bildirimi kaydet' }).click(); await teacher.waitForTimeout(1500);
writings = await listDocs('users/ogrenci1/writings');
const fb = plain(writings[0]);
ok(fb.feedback.startsWith('Üç maddenin hepsi var') && fb.feedbackAt, 'geri bildirim Firestore\'a kaydedildi');
ok(!(await teacher.locator('#writingsCount').isVisible()) && (await teacher.textContent('#writingsList')).includes('Geri bildirim verildi'), 'detayda "geri bildirim verildi"');
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForTimeout(2500);
ok(await teacher.locator('#writingNotice').isHidden() && await teacher.locator('#list-ogrenciler [data-pending-writings]').count() === 0, 'geri bildirimden sonra işaret kalkıyor');

// 3. Ödev olarak verme.
await teacher.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await teacher.selectOption('#aLevel', 'B1'); await teacher.waitForTimeout(500);
ok(await teacher.locator('#aTopic option[value="schreiben"]').count() === 1, 'ödev ekranında B1 için "Schreiben (sınav hazırlığı)"');
await teacher.selectOption('#aLevel', 'A1'); await teacher.waitForTimeout(300);
await teacher.selectOption('#aTopic', 'schreiben').catch(() => {}); await teacher.waitForTimeout(800);
ok(await teacher.locator('#aExerciseList label').count() === 10 && await teacher.locator('#aExerciseList label', { hasText: 'Teil 1 · Beim Arzt' }).count() === 1, 'A1 için 10 Schreiben görevi (form + kısa mesaj)');
await teacher.selectOption('#aLevel', 'A2'); await teacher.waitForTimeout(300);
ok(await teacher.locator('#aTopic option[value="schreiben"]').count() === 0, 'A2 için Schreiben yok (henüz görev yok)');
await teacher.selectOption('#aLevel', 'B1'); await teacher.waitForTimeout(300);
await teacher.selectOption('#aTopic', 'schreiben'); await teacher.waitForTimeout(800);
ok(await teacher.locator('#aExerciseList label').count() === 15 && await teacher.locator('#aExerciseList label', { hasText: 'Teil 3 · Teambesprechung' }).count() === 1, 'ödevde B1 için 15 Schreiben görevi (Teil 1–3) seçilebiliyor');
await teacher.locator('#aExerciseList label', { hasText: 'Geburtstag verpasst' }).locator('input').check();
await teacher.fill('#aTitle', 'Schreiben: Geburtstag verpasst');
await teacher.click('#aSubmit'); await teacher.waitForURL(/ogretmen\.html/, { timeout: 15000 }).catch(() => {});
const assignments = await listDocs('users/ogrenci1/assignments');
ok(assignments.length === 1 && JSON.stringify(assignments[0].fields.exercises).includes('goethe-b1-1-set-2'), 'ödev kaydedildi (goethe-b1-1-set-2)');
await tctx.close();

// 4. Öğrenci paneli: yeni geri bildirim işareti, açınca görüldü; ödev bağlantısı.
const { ctx: pctx, page: panel } = await newPage(390);
await signIn(panel, 'ogrenci@example.com', 'ogrenci123', 'student');
await panel.goto(`${BASE}/panel.html`); await panel.waitForSelector('#writingList [data-writing]', { timeout: 15000 }).catch(() => {});
ok(await panel.locator('#writingAlert').isVisible() && (await panel.textContent('#writingAlertText')).includes('1 yeni geri bildirim'), 'panelin üstünde "1 yeni geri bildirim"');
ok((await panel.textContent('#writingNew')).includes('1 yeni geri bildirim') && await panel.locator('[data-writing-new]:not([hidden])').count() === 1, 'bölüm başlığında ve metinde yeni işareti');
const link = panel.locator('a[href="index.html#exams/goethe/b1/schreiben/2/set-2"], a[href="index.html#exams/goethe/b1/schreiben/1/set-2"]');
ok(await link.count() >= 1, 'ödevdeki bağlantı Schreiben görevini açıyor');
await panel.screenshot({ path: path.join(shotDir, 'panel-yeni-390.png'), fullPage: true });
await panel.locator('#writingList [data-writing] summary').first().click(); await panel.waitForTimeout(1500);
ok((await panel.textContent('#writingList')).includes('Üç maddenin hepsi var'), 'öğrenci geri bildirimi okuyor');
ok(await panel.locator('#writingAlert').isHidden() && await panel.locator('#writingNew').isHidden(), 'açınca yeni işareti kalkıyor');
ok(Boolean(plain((await listDocs('users/ogrenci1/writings'))[0]).seenAt), 'görüldü zamanı kaydedildi');
await panel.screenshot({ path: path.join(shotDir, 'panel-okundu-390.png'), fullPage: true });
await panel.reload(); await panel.waitForTimeout(3000);
ok(await panel.locator('#writingAlert').isHidden(), 'yeniden açınca da işaret yok');

// 5. Günlük sınır: 24 saatte 10 metin.
await fetch(`${docsUrl}/users/ogrenci1/limits/writing`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  windowStart: { timestampValue: new Date(Date.now() - 3600e3).toISOString() }, count: { integerValue: '10' },
  lastAt: { timestampValue: new Date(Date.now() - 600e3).toISOString() }, lastId: { stringValue: 'eskimetin0000001' } } }) });
const limitNote = await writeAndSubmit(panel, 'Lieber Jonas, es tut mir leid.');
ok(limitNote.includes('Bugünlük gönderim sınırı doldu'), `11. metinde "bugünlük sınır" notu (${limitNote})`);
ok((await listDocs('users/ogrenci1/writings')).length === 1, 'sınırda yeni metin kaydedilmedi');
await panel.screenshot({ path: path.join(shotDir, 'sinir-390.png'), fullPage: true });
await pctx.close();

// 6. Onaylanmamış hesap: metin kaydedilmez, bilgi notu.
const { ctx: qctx, page: pending } = await newPage();
await signIn(pending, 'bekleyen@example.com', 'ogrenci123', 'student');
const pendingNote = await writeAndSubmit(pending);
ok(pendingNote.includes('henüz onaylanmadığı'), `onaysız hesapta "kaydedilmedi" notu (${pendingNote})`);
ok((await listDocs('users/ogrenci2/writings')).length === 0, 'onaysız hesabın metni kaydedilmedi');
await qctx.close();

await browser.close();
server.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
