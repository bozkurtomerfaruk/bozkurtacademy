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
await t.waitForFunction(() => document.querySelector('#aSuggest .odev-suggest-item')?.textContent.includes('çözdü'), null, { timeout: 15000 });
const first = t.locator('#aSuggest .odev-suggest-item').first();
ok((await first.textContent()).includes('A1 · Perfekt'), '"Perfekt" → ilk sonuç A1 · Perfekt');
ok((await first.textContent()).includes(`Deniz Kaya: 1/${perfekt.length} çözdü`), 'öğrencinin konudaki ilerlemesi görünüyor');
const suggested = await first.locator('.odev-suggest-list li > span').allTextContents();
ok(JSON.stringify(suggested) === JSON.stringify(perfekt.slice(2, 5).map((e) => e.title)), `çözülen ve verilen paket atlanıyor, sıradaki 3 paket öneriliyor (${suggested.length})`);
ok((await t.textContent('#aChosenCount')) === '0', 'öneriler kendiliğinden ödeve eklenmiyor');
await t.press('#aSearch', 'Enter'); await t.waitForTimeout(400);
ok(new URL(t.url()).pathname.endsWith('/ogretmen-odev.html') && (await t.textContent('#aChosenCount')) === '0', 'arama kutusunda Enter ödevi göndermiyor');
await first.locator('.odev-suggest-add').first().click();
ok((await t.textContent('#aChosenCount')) === '1' && (await t.textContent('#aChosen')).includes(perfekt[2].title), '"Ekle" paketi seçilenlere ekliyor');
ok((await t.locator('#aSuggest .odev-suggest-item').first().locator('.odev-suggest-list li > span').first().textContent()) === perfekt[3].title, 'eklenen paket öneriden çıkıyor, sıradaki geliyor');
await t.locator('#aSuggest .odev-suggest-item').first().getByRole('button', { name: 'Konuyu aç' }).click();
await t.waitForFunction(() => document.querySelectorAll('#aExerciseList .odev-state').length >= 2, null, { timeout: 10000 });
const badges = await t.locator('#aExerciseList .acc-check').evaluateAll((els) => els.slice(0, 3).map((e) => e.querySelector('.odev-state')?.textContent || ''));
ok(badges[0] === 'çözdü' && badges[1] === 'verildi' && (await t.inputValue('#aTopic')) === 'perfekt', '"Konuyu aç": listede "çözdü" ve "verildi" işaretleri');
await t.fill('#aSearch', 'Relativsatz'); await t.waitForTimeout(400);
ok((await t.locator('#aSuggest .odev-suggest-item strong').first().textContent()) === 'B1 · Relativsätze', '"Relativsatz" → B1 · Relativsätze');
await t.fill('#aSearch', 'qqqzzz'); await t.waitForTimeout(400);
ok((await t.textContent('#aSuggest')).includes('konu bulunamadı'), 'bulunamayan arama için ipucu');
await t.fill('#aSearch', 'Perfekt'); await t.waitForTimeout(400);
ok(await noOverflow(t), '1440: form taşmıyor');
await shot(t, 'form-1440');

// 1b. Öneri sayısı (3/5/10, tarayıcıda hatırlanır), "Çözülmemiş paketlerin hepsini ekle", "Konunun tamamını ekle".
{
  const { ctx, page } = await newPage(1440);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  const open = async () => {
    await page.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await page.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
    await page.fill('#aSearch', 'Perfekt');
    await page.waitForFunction(() => document.querySelector('#aSuggest .odev-suggest-item')?.textContent.includes('çözdü'), null, { timeout: 15000 });
  };
  const card = () => page.locator('#aSuggest .odev-suggest-item').first();
  await open();
  ok((await page.inputValue('#aSuggestCount')) === '3' && await card().locator('.odev-suggest-list li').count() === 3, 'öneri sayısı varsayılan 3');
  await page.selectOption('#aSuggestCount', '5');
  ok(await card().locator('.odev-suggest-list li').count() === 5 && (await card().textContent()).includes('Önerilen 5 paketi ekle'), 'öneri sayısı 5 seçilince 5 paket');
  await open();
  ok((await page.inputValue('#aSuggestCount')) === '5' && await card().locator('.odev-suggest-list li').count() === 5, 'öneri sayısı sayfa yenilenince hatırlanıyor (5)');
  await page.selectOption('#aSuggestCount', '10');
  ok(await card().locator('.odev-suggest-list li').count() === 10, 'öneri sayısı 10');
  const unsolvedBtn = card().locator('[data-action="unsolved"]');
  ok((await unsolvedBtn.textContent()) === `Çözülmemiş paketlerin hepsini ekle (${perfekt.length - 2})`, `"Çözülmemiş paketlerin hepsini ekle (${perfekt.length - 2})": çözülen ve verilen sayılmıyor`);
  ok((await card().locator('[data-action="whole"]').textContent()) === `Konunun tamamını ekle (${perfekt.length} paket)`, `"Konunun tamamını ekle (${perfekt.length} paket)"`);
  await unsolvedBtn.click();
  ok((await page.textContent('#aChosenCount')) === String(perfekt.length - 2), 'çözülmemiş paketlerin hepsi seçilenlere eklendi');
  ok(!(await page.textContent('#aChosen')).includes(perfekt[0].title) && !(await page.textContent('#aChosen')).includes(perfekt[1].title), 'çözülen ve verilen paket eklenmedi');
  ok(await card().locator('[data-action="unsolved"]').count() === 0, 'hepsi eklenince "Çözülmemiş …" düğmesi kalkıyor');
  await card().locator('[data-action="whole"]').click();
  ok((await page.textContent('#aChosenCount')) === '1' && (await page.textContent('#aChosen')).includes('konunun tamamı'), '"Konunun tamamını ekle": konu tek öğe, tek tek paketler içine alındı');
  ok((await card().textContent()).includes('Konunun tamamı ödevde.') && await card().locator('[data-action="whole"]').count() === 0, 'konu kartı: "Konunun tamamı ödevde."');
  await card().getByRole('button', { name: 'Konuyu aç' }).click();
  const wholeChecked = await page.waitForFunction(() => document.querySelector('#aTopic')?.value === 'perfekt' && document.querySelector('#aWhole')?.checked, null, { timeout: 10000 }).then(() => true).catch(() => false);
  ok(wholeChecked, 'formdaki "Bu konunun tamamını ekle" işaretli (aynı kayıt)');
  await page.uncheck('#aNotify');
  await page.click('#aSubmit'); await page.waitForURL(/durum=verildi/, { timeout: 15000 });
  const whole = (await listDocs('users/ogrenci1/assignments')).map(plain).find((a) => a.topics?.values?.length);
  ok(whole && whole.topics.values[0].mapValue.fields.topic.stringValue === 'perfekt' && !(whole.exercises?.values || []).length, 'ödevde konunun tamamı (topics), tek paket yok');
  // Sonraki adımların sayıları değişmesin: bu ödev silinir.
  await fetch(`${docsUrl}/users/ogrenci1/assignments/${(await listDocs('users/ogrenci1/assignments')).find((d) => plain(d).topics?.values?.length).name.split('/').pop()}`, { method: 'DELETE', headers: owner });
  ok(await noOverflow(page), '1440: yeni düğmelerle form taşmıyor');
  await ctx.close();
}
{
  const { ctx, page } = await newPage(390);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  await page.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await page.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
  await page.fill('#aSearch', 'Perfekt');
  await page.waitForFunction(() => document.querySelector('#aSuggest [data-action="unsolved"]'), null, { timeout: 15000 });
  ok(await noOverflow(page), '390: yeni düğmelerle form taşmıyor');
  await shot(page, 'konu-dugmeleri-390');
  await ctx.close();
}

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
await t.waitForSelector('#aSuggest .odev-suggest-item');
ok((await t.locator('#aSuggest .odev-suggest-item strong').first().textContent()).startsWith('B1 · lassen'), '"lassen" → B1 · lassen + Infinitiv');
await t.locator('#aSuggest .odev-suggest-item').first().getByRole('button', { name: /Önerilen 3 paketi ekle/ }).click();
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
await t.fill('#aSearch', 'Perfekt'); await t.waitForSelector('#aSuggest .odev-suggest-add');
await t.locator('#aSuggest .odev-suggest-item').first().locator('.odev-suggest-add').first().click();
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
  await page.fill('#aSearch', 'Perfekt'); await page.waitForFunction(() => document.querySelector('#aSuggest .odev-suggest-item')?.textContent.includes('çözdü'), null, { timeout: 15000 });
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

// 6b. Hedef sınav: profilde seçilir; formda sıradaki Lesen seti ve Schreiben görevi, "Son verilen", başka Teil/Set seçimi.
// Deniz: Lesen T1S1 çözülmüş (results), T2S1 12 gün önce verilmiş; Schreiben T1S1 yazılmış (writings).
const GIVEN = new Date(Date.now() - 12 * 864e5);
await fetch(`${docsUrl}/users/ogrenci1/results/r2`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  level: field('b1'), topic: field('sinav'), exercise: field('goethe-b1-lesen-1-set-1'), score: field(5), total: field(6), at: { timestampValue: new Date().toISOString() }
} }) });
await fetch(`${docsUrl}/users/ogrenci1/assignments/sinav1`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  title: field('Lesen'), schemaVersion: field(2), groupId: field('sinav1'), createdAt: { timestampValue: GIVEN.toISOString() },
  exercises: { arrayValue: { values: [mapValue({ level: 'B1', topic: 'sinav', exercise: 'goethe-b1-lesen-2-set-1' })] } },
  topics: { arrayValue: { values: [] } }, links: { arrayValue: { values: [] } }, done: { booleanValue: false }, studentDocUrl: field('')
} }) });
await fetch(`${docsUrl}/users/ogrenci1/writings/w1`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  exam: field('goethe'), level: field('b1'), teil: field(1), set: field('set-1'), text: field('Hallo'), words: field(1), at: { timestampValue: new Date().toISOString() }
} }) });
await t.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`); await t.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
await t.waitForFunction(() => document.querySelectorAll('#targetExam option').length > 5, null, { timeout: 15000 });
const targetOptions = await t.locator('#targetExam option').allTextContents();
ok(['Goethe B1', 'telc B2', 'DTZ'].every((l) => targetOptions.includes(l)), 'profil: hedef sınav listesinde Goethe B1, telc B2, DTZ');
await t.selectOption('#targetExam', 'goethe|b1');
await t.waitForFunction(() => document.querySelector('#targetExamStatus')?.textContent.includes('Goethe B1'));
const target = (await getDocRest('users/ogrenci1')).fields.targetExam?.mapValue?.fields;
ok(target?.exam?.stringValue === 'goethe' && target?.level?.stringValue === 'b1', 'hedef sınav profile kaydedildi');
await shot(t, 'profil-hedef-sinav-1440');

await t.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await t.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await t.waitForSelector('#aExam-ogrenci1-lesen', { timeout: 15000 });
ok((await t.textContent('.odev-exam-item strong')) === 'Deniz Kaya · Goethe B1', 'formda hedef sınav kartı');
ok((await t.inputValue('#aExam-ogrenci1-lesen')) === 'goethe-b1-lesen-3-set-1', 'Lesen: çözülen T1S1 ve verilen T2S1 atlanıyor → T3S1');
ok((await t.inputValue('#aExam-ogrenci1-schreiben')) === 'goethe-b1-2-set-1', 'Schreiben: yazılan T1S1 atlanıyor → T2S1');
const lastTexts = await t.locator('.odev-exam-last').allTextContents();
const GIVEN_LABEL = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Berlin', day: '2-digit', month: 'short', year: 'numeric' }).format(GIVEN);
ok(lastTexts[0].startsWith('Son verilen: Goethe B1 · Lesen · Teil 2') && lastTexts[0].includes(`(${GIVEN_LABEL})`), `"Son verilen" Lesen T2S1 ve tarihi (${lastTexts[0]})`);
ok(lastTexts[1] === 'Son verilen: henüz yok', 'Schreiben: henüz verilen yok');
ok((await t.textContent('#aChosenCount')) === '0', 'sınav önerileri de kendiliğinden eklenmiyor');
await t.selectOption('#aExam-ogrenci1-lesen', 'goethe-b1-lesen-5-set-2');
await t.getByRole('button', { name: 'Lesen: seçileni ekle (Deniz Kaya)' }).click();
await t.getByRole('button', { name: 'Schreiben: seçileni ekle (Deniz Kaya)' }).click();
ok((await t.textContent('#aChosenCount')) === '2', 'başka Teil/Set seçilip ekleniyor (Lesen T5S2) ve Schreiben önerisi ekleniyor');
ok((await t.locator('#aExam-ogrenci1-lesen option[value="goethe-b1-lesen-5-set-2"]').textContent()).includes('(ödevde)'), 'listede formdaki set "(ödevde)"');
ok(await noOverflow(t), '1440: sınav önerileriyle form taşmıyor');
await shot(t, 'form-hedef-sinav-1440');
await t.uncheck('#aNotify');
await t.fill('#aTitle', 'Sınav ödevi');
await t.click('#aSubmit'); await t.waitForURL(/durum=verildi/, { timeout: 15000 });
const given = (await listDocs('users/ogrenci1/assignments')).map(plain).find((a) => a.title === 'Sınav ödevi');
const givenEx = given?.exercises?.values?.map((v) => `${v.mapValue.fields.topic.stringValue}:${v.mapValue.fields.exercise.stringValue}:${v.mapValue.fields.level.stringValue}`) || [];
ok(givenEx.includes('sinav:goethe-b1-lesen-5-set-2:B1') && givenEx.includes('schreiben:goethe-b1-2-set-1:B1'), 'ödevde sınav seti ve Schreiben görevi');
await t.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await t.waitForSelector('#aExam-ogrenci1-schreiben', { timeout: 15000 });
ok((await t.inputValue('#aExam-ogrenci1-schreiben')) === 'goethe-b1-3-set-1', 'verilen T2S1 sonra atlanıyor → Schreiben T3S1');
ok((await t.locator('.odev-exam-last').first().textContent()).startsWith('Son verilen: Goethe B1 · Lesen · Teil 5'), '"Son verilen" en yeni ödevden');
await t.uncheck('input[name="student"][value="ogrenci1"]');
await t.check('input[name="student"][value="ogrenci3"]');
await t.waitForFunction(() => document.querySelector('#aExamSuggest')?.textContent.includes('hedef sınav seçilmemiş'));
ok((await t.getAttribute('#aExamSuggest a', 'href')) === 'ogretmen-ogrenci.html?id=ogrenci3', 'hedef sınavı olmayan öğrenci: profil bağlantısı');
ok(await t.evaluate(async () => (await import('/js/account/common.js')).exerciseUrl({ level: 'B1', topic: 'schreiben', exercise: 'dtz-a2-b1-1-set-1' })) === 'index.html#exams/dtz/a2-b1/schreiben/1/set-1', 'DTZ Schreiben bağlantısı doğru');
{
  const { ctx, page } = await newPage(390, 'dark');
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  await page.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await page.waitForSelector('#aExam-ogrenci1-lesen', { timeout: 15000 });
  ok(await noOverflow(page), '390 koyu: sınav önerileriyle form taşmıyor');
  await shot(page, 'form-hedef-sinav-390-dark');
  await page.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`); await page.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
  await page.waitForFunction(() => document.querySelector('#targetExam')?.value === 'goethe|b1', null, { timeout: 15000 });
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), '390 koyu: profil sayfası taşmıyor');
  await ctx.close();
}

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
await s.goto(`${BASE}/panel.html`); await s.waitForTimeout(2500);
ok(!/hedef sınav|zielprüfung|target exam/i.test(await s.textContent('main')), 'öğrenci panelinde hedef sınav görünmüyor (öğrenci kodu targetExam okumuyor)');

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
