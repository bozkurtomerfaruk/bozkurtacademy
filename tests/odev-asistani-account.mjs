// Ödev asistanı ve taslaklar, hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:odev-asistani
// Öğretmen formda konu arar ("Perfekt", "Relativsatz", "lassen") → asistan seçili öğrencinin çözmediği ve ona
// verilmemiş sıradaki paketleri önerir, hiçbirini kendiliğinden eklemez → "Taslak kaydet" (öğrenciye ödev yazılmaz) →
// taslaklar sayfasında öğe çıkarır, taslağı formda açıp öğe ekler → iki öğrencinin taslağını tek seferde onaylar.
// Ekran görüntüleri: 1440 (açık/koyu) ve 390.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'odev-asistani-'));

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
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123'], ['ogrenci2', 'bekleyen@example.com', 'ogrenci123'], ['ogrenci3', 'ikinci@example.com', 'ogrenci123']]) {
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
await fetch(`${docsUrl}/users/ogrenci3`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Arda Can', 'ikinci@example.com', 'active')) });
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
const field = (v) => typeof v === 'string' ? { stringValue: v } : { integerValue: String(v) };
const mapValue = (o) => ({ mapValue: { fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, field(v)])) } });
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/search-index.json'), 'utf8')).exercises;
const perfekt = catalog.filter((e) => e.level === 'A1' && e.topic === 'perfekt');
// Deniz (ogrenci1): Perfekt'in 1. paketini çözmüş, 2. paketi önceki bir ödevde verilmiş.
await fetch(`${docsUrl}/users/ogrenci1/results/r1`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  level: field('A1'), topic: field('perfekt'), exercise: field(perfekt[0].id), score: field(8), total: field(10), at: { timestampValue: new Date().toISOString() }
} }) });
await fetch(`${docsUrl}/users/ogrenci1/assignments/eski`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  title: field('Eski'), schemaVersion: field(2), groupId: field('eski'), createdAt: { timestampValue: new Date(Date.now() - 864e5).toISOString() },
  exercises: { arrayValue: { values: [mapValue({ level: 'A1', topic: 'perfekt', exercise: perfekt[1].id })] } },
  topics: { arrayValue: { values: [] } }, links: { arrayValue: { values: [] } }, done: { booleanValue: false }, studentDocUrl: field('')
} }) });

const { page: t } = await newPage(1440);
await signIn(t, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await t.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await t.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok((await t.textContent('#aSubmit')).trim() === 'Onayla ve gönder' && (await t.textContent('#aDraft')).trim() === 'Taslak kaydet', 'düğmeler: "Onayla ve gönder" ve "Taslak kaydet"');

// 1. Konu araması ve sıradaki paketler.
await t.fill('#aSearch', 'Perfekt');
await t.waitForFunction(() => document.querySelector('.odev-suggest-item')?.textContent.includes('çözdü'), null, { timeout: 15000 });
const first = t.locator('.odev-suggest-item').first();
ok((await first.textContent()).includes('A1 · Perfekt'), '"Perfekt" → ilk sonuç A1 · Perfekt');
ok((await first.textContent()).includes(`Deniz Kaya: 1/${perfekt.length} çözdü`), 'öğrencinin konudaki ilerlemesi görünüyor');
const suggested = await first.locator('.odev-suggest-list li > span').allTextContents();
ok(JSON.stringify(suggested) === JSON.stringify(perfekt.slice(2, 5).map((e) => e.title)), `çözülen ve verilen paket atlanıyor, sıradaki 3 paket öneriliyor (${suggested.length})`);
ok((await t.textContent('#aChosenCount')) === '0', 'öneriler kendiliğinden ödeve eklenmiyor');
await t.press('#aSearch', 'Enter'); await t.waitForTimeout(400);
ok(new URL(t.url()).pathname.endsWith('/ogretmen-odev.html') && (await t.textContent('#aChosenCount')) === '0', 'arama kutusunda Enter ödevi göndermiyor');
await first.locator('.odev-suggest-add').first().click();
ok((await t.textContent('#aChosenCount')) === '1' && (await t.textContent('#aChosen')).includes(perfekt[2].title), '"Ekle" paketi seçilenlere ekliyor');
ok((await t.locator('.odev-suggest-item').first().locator('.odev-suggest-list li > span').first().textContent()) === perfekt[3].title, 'eklenen paket öneriden çıkıyor, sıradaki geliyor');
await t.locator('.odev-suggest-item').first().getByRole('button', { name: 'Konuyu aç' }).click();
await t.waitForFunction(() => document.querySelectorAll('#aExerciseList .odev-state').length >= 2, null, { timeout: 10000 });
const badges = await t.locator('#aExerciseList .acc-check').evaluateAll((els) => els.slice(0, 3).map((e) => e.querySelector('.odev-state')?.textContent || ''));
ok(badges[0] === 'çözdü' && badges[1] === 'verildi' && (await t.inputValue('#aTopic')) === 'perfekt', '"Konuyu aç": listede "çözdü" ve "verildi" işaretleri');
await t.fill('#aSearch', 'Relativsatz'); await t.waitForTimeout(400);
ok((await t.locator('.odev-suggest-item strong').first().textContent()) === 'B1 · Relativsätze', '"Relativsatz" → B1 · Relativsätze');
await t.fill('#aSearch', 'qqqzzz'); await t.waitForTimeout(400);
ok((await t.textContent('#aSuggest')).includes('konu bulunamadı'), 'bulunamayan arama için ipucu');
await t.fill('#aSearch', 'Perfekt'); await t.waitForTimeout(400);
ok(await noOverflow(t), '1440: form taşmıyor');
await shot(t, 'form-1440');

// 2. Taslak kaydet: öğrenciye ödev yazılmaz.
await t.fill('#aTitle', 'Perfekt tekrar');
await t.click('#aDraft'); await t.waitForURL(/ogretmen-taslaklar\.html\?durum=kaydedildi/, { timeout: 15000 });
await t.waitForSelector('#draftApp:not([hidden])');
ok((await listDocs('users/ogrenci1/assignments')).length === 1, 'taslak öğrencinin ödevlerine yazılmadı');
const d1 = (await listDocs('homeworkDrafts'))[0];
ok(d1 && plain(d1).title === 'Perfekt tekrar', 'taslak homeworkDrafts\'ta');
ok((await t.textContent('#draftNotice')).includes('Taslak kaydedildi'), 'taslaklar sayfası: kaydedildi bildirimi');

// 3. İkinci öğrenci için ikinci taslak: "lassen" önerilerinin hepsi + açıklama.
await t.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci3`); await t.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await t.fill('#aSearch', 'lassen');
await t.waitForSelector('.odev-suggest-item');
ok((await t.locator('.odev-suggest-item strong').first().textContent()).startsWith('B1 · lassen'), '"lassen" → B1 · lassen + Infinitiv');
await t.locator('.odev-suggest-item').first().getByRole('button', { name: /Önerilen 3 paketi ekle/ }).click();
ok((await t.textContent('#aChosenCount')) === '3', '"Önerilen 3 paketi ekle"');
await t.fill('#aTitle', 'lassen');
await t.fill('#aDescription', 'Bu hafta lassen.');
await t.click('#aDraft'); await t.waitForURL(/ogretmen-taslaklar\.html/, { timeout: 15000 });
await t.waitForSelector('.odev-draft');
ok(await t.locator('.odev-draft').count() === 2, 'taslaklar sayfasında iki taslak');

// 4. Taslaktan öğe çıkarma ve taslağı formda açıp öğe ekleme.
const lassenCard = t.locator('.odev-draft', { hasText: 'Bu hafta lassen.' });
await lassenCard.locator('.odev-draft-items button').last().click();
await t.waitForFunction(() => document.querySelector('#draftNotice')?.textContent.includes('çıkarıldı'));
const d2 = (await listDocs('homeworkDrafts')).find((d) => plain(d).title === 'lassen');
ok(d2.fields.exercises.arrayValue.values.length === 2, 'taslaktan öğe çıkarıldı (Firestore)');
await t.locator('.odev-draft', { hasText: 'Perfekt tekrar' }).getByRole('link', { name: 'Düzenle / öğe ekle' }).click();
await t.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok((await t.inputValue('#aTitle')) === 'Perfekt tekrar' && await t.locator('input[name="student"][value="ogrenci1"]').isChecked() && (await t.textContent('#aChosenCount')) === '1', 'taslak formda açılıyor (başlık, öğrenci, paketler)');
ok((await t.textContent('#aDraft')).trim() === 'Taslağı güncelle', 'taslakta düğme "Taslağı güncelle"');
await t.fill('#aSearch', 'Perfekt'); await t.waitForSelector('.odev-suggest-add');
await t.locator('.odev-suggest-item').first().locator('.odev-suggest-add').first().click();
await t.click('#aDraft'); await t.waitForURL(/ogretmen-taslaklar\.html/, { timeout: 15000 });
await t.waitForSelector('.odev-draft');
ok((await listDocs('homeworkDrafts')).length === 2 && (await t.locator('.odev-draft', { hasText: 'Perfekt tekrar' }).locator('.odev-draft-items li').count()) === 2, 'taslak güncellendi (yeni taslak açılmadı)');
ok(await noOverflow(t), '1440: taslaklar sayfası taşmıyor');
await shot(t, 'taslaklar-1440');

// 5. 390 ve koyu tema.
for (const [width, theme] of [[390, 'light'], [1440, 'dark']]) {
  const { ctx, page } = await newPage(width, theme);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  await page.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await page.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
  await page.fill('#aSearch', 'Perfekt'); await page.waitForFunction(() => document.querySelector('.odev-suggest-item')?.textContent.includes('çözdü'), null, { timeout: 15000 });
  ok(await noOverflow(page), `${width} ${theme}: form taşmıyor`);
  await shot(page, `form-${width}-${theme}`);
  await page.goto(`${BASE}/ogretmen-taslaklar.html`); await page.waitForSelector('.odev-draft', { timeout: 15000 });
  ok(await noOverflow(page), `${width} ${theme}: taslaklar taşmıyor`);
  if (theme === 'dark') ok(await page.evaluate(() => getComputedStyle(document.querySelector('.odev-draft')).backgroundColor !== 'rgb(243, 240, 232)'), 'koyu tema: taslak kartı koyu');
  await shot(page, `taslaklar-${width}-${theme}`);
  await ctx.close();
}

// 6. Toplu onay: iki taslak, iki öğrenci, tek seferde.
await t.check('#draftAll');
ok((await t.textContent('#draftSelected')) === '2', '"Hepsini seç": 2 taslak seçili');
if (await t.isVisible('#draftNotify')) await t.uncheck('#draftNotify'); // e-posta Worker'ı bu testte çalışmıyor (test:odev-eposta)
await t.click('#approveSelected'); await t.waitForURL(/ogretmen-odevler\.html\?durum=verildi/, { timeout: 15000 });
await t.waitForSelector('#listApp:not([hidden])', { timeout: 15000 });
const a1 = (await listDocs('users/ogrenci1/assignments')).map(plain);
const a3 = (await listDocs('users/ogrenci3/assignments')).map(plain);
ok(a1.length === 2 && a1.some((a) => a.title === 'Perfekt tekrar' && a.schemaVersion === '2'), 'Deniz: onaylanan ödev verildi');
ok(a3.length === 1 && a3[0].title === 'lassen' && a3[0].description === 'Bu hafta lassen.', 'Arda: onaylanan ödev verildi');
ok((await listDocs('homeworkDrafts')).length === 0, 'onaylanan taslaklar silindi');
ok((await t.textContent('#listNotice')).includes('Ödev verildi'), 'ödevler sayfası: "Ödev verildi"');

// 7. Öğrenci ödevini görür; taslak koleksiyonunu okuyamaz.
const { page: s } = await newPage(1440);
await signIn(s, 'ogrenci@example.com', 'ogrenci123', 'student');
const denied = await s.evaluate(async () => {
  const { db, fs } = await import('/js/account/firebase.js');
  try{ await fs.getDocs(fs.collection(db, 'homeworkDrafts')); return false; }catch(e){ return e.code === 'permission-denied'; }
});
ok(denied, 'öğrenci homeworkDrafts okuyamıyor');
await s.goto(`${BASE}/odevlerim.html`); await s.waitForSelector('.odev-item', { timeout: 15000 });
ok((await s.textContent('main')).includes('Perfekt tekrar'), 'öğrenci onaylanan ödevi Ödevlerim\'de görüyor');

// 8. Öğrenci verileri silinince (deleteStudentData) taslaklardan da çıkar; başka öğrenci kalmayan taslak silinir.
await t.goto(`${BASE}/ogretmen-odevler.html`); await t.waitForSelector('#listApp:not([hidden])', { timeout: 15000 });
await t.evaluate(async () => {
  const { saveDraft } = await import('/js/account/homework-drafts.js?v=1');
  const data = { title: 'Ortak', description: 'x', dueAt: null, links: [], topics: [], exercises: [] };
  await saveDraft(null, ['ogrenci1', 'ogrenci3'], data);
  await saveDraft(null, ['ogrenci3'], { ...data, title: 'Sadece Arda' });
  const { deleteStudentData } = await import('/js/account/teacher-common.js');
  await deleteStudentData('ogrenci3');
});
const left = (await listDocs('homeworkDrafts')).map(plain);
ok(left.length === 1 && left[0].title === 'Ortak' && JSON.stringify(left[0].uids.values.map((v) => v.stringValue)) === '["ogrenci1"]', 'öğrenci silinince taslaklardan çıkarılıyor');

ok(!errors.length, `sayfa hatası yok ${errors.join(' | ')}`);
await browser.close();
server.close();
console.log(`Ekran görüntüleri: ${shotDir}`);
if (fails.length) { console.log(`\n${fails.length} hata`); process.exit(1); }
console.log('\nHepsi geçti.');
