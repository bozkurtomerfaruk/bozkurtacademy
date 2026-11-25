// Kaynak kütüphanesi, hesap tarafı (Firebase Emulator: auth + firestore; Drive: js/account/drive-mock.js).
// Çalıştırma: npm run test:kutuphane
// Öğretmen PDF'leri çoklu seçim ve sürükle bırak ile sıraya alır → dosya adından seviye/konu önerisi, düzeltme →
// gizli yükleme → etiket düzenleme, arama → asistan konuya göre önerir → taslakta paylaşılmaz → onayda paylaşılır →
// paylaşım hatasında ödev verilmez → yardımcı kaynaklara "Kütüphaneden" → öğrenci kütüphaneyi okuyamaz.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'kutuphane-'));

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
const pdfFile = (name, body = '%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF') => ({ name, mimeType: 'application/pdf', buffer: Buffer.from(body) });
const mockFiles = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('baDriveMock') || '[]'));
const library = async () => (await listDocs('library')).map((d) => ({ id: d.name.split('/').pop(), ...plain(d) }));

const { ctx, page: t } = await newPage(1440);
await signIn(t, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await t.goto(`${BASE}/ogretmen-kutuphane.html`); await t.waitForSelector('#libApp:not([hidden])', { timeout: 15000 });
ok((await t.textContent('#libList')).includes('Kütüphane boş'), 'boş kütüphane');

// 1. Çoklu seçim + sürükle bırak, dosya adından etiket önerisi.
await t.setInputFiles('#libFiles', [pdfFile('B1_Relativsatz_Übung-3.pdf'), pdfFile('lassen-arbeitsblatt.pdf'), pdfFile('Scan_2026-11-03.pdf'), pdfFile('not.pdf', 'merhaba')]);
await t.waitForFunction(() => document.querySelectorAll('#queueList .lib-item').length === 4);
const row = (name) => t.locator('#queueList .lib-item', { hasText: name });
ok((await row('B1_Relativsatz').locator('.lib-chip').allTextContents()).join() === 'B1 · Relativsätze×' && (await row('B1_Relativsatz').locator('.lib-level').inputValue()) === 'B1', 'öneri: B1_Relativsatz → B1 · Relativsätze');
ok((await row('lassen-arbeitsblatt').locator('.lib-chip').first().textContent()).startsWith('B1 · lassen') && (await row('lassen-arbeitsblatt').locator('.lib-level').inputValue()) === 'B1', 'öneri: lassen-arbeitsblatt → B1 · lassen + Infinitiv');
ok(await row('Scan_2026').locator('.lib-chip').count() === 0 && (await row('Scan_2026').locator('.lib-level').inputValue()) === '', 'öneri yok: Scan_2026-11-03');
ok((await row('not.pdf').textContent()).includes('geçerli bir PDF değil') && await row('not.pdf').locator('.lib-tags').count() === 0, 'geçersiz PDF yüklenmeyecek');
await row('Scan_2026').locator('.lib-topic').selectOption('A1|perfekt');
ok((await row('Scan_2026').locator('.lib-level').inputValue()) === 'A1' && (await row('Scan_2026').locator('.lib-chip').textContent()).startsWith('A1 · '), 'elle konu eklenince seviye de A1');
await t.evaluate(() => {
  const dt = new DataTransfer();
  dt.items.add(new File([new TextEncoder().encode('%PDF-1.4\n%%EOF')], 'A2-Dativ-Uebungen.pdf', { type: 'application/pdf' }));
  const zone = document.getElementById('libDrop');
  zone.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
  zone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
});
await t.waitForFunction(() => document.querySelectorAll('#queueList .lib-item').length === 5);
ok((await row('A2-Dativ').locator('.lib-level').inputValue()) === 'A2' && (await row('A2-Dativ').locator('.lib-chip').count()) >= 1, 'sürükle bırak: A2-Dativ-Uebungen sıraya eklendi, A2 önerildi');
ok((await t.textContent('#uploadAll')) === "4 PDF'i yükle", 'geçersiz dosya sayılmıyor: "4 PDF\'i yükle"');
ok(await noOverflow(t), '1440: yükleme sırası taşmıyor');
await shot(t, 'kutuphane-sira-1440');

// 2. Yükleme: Drive'da gizli, library kayıtları etiketli.
await t.click('#uploadAll');
await t.waitForFunction(() => document.querySelector('#queueStatus')?.textContent.includes('4 PDF kütüphaneye eklendi'), null, { timeout: 20000 });
const files = await mockFiles(t);
ok(files.length === 4 && files.every((f) => f.folder === 'Bozkurt Academy Kütüphane' && f.shared === ''), 'Drive: 4 PDF "Bozkurt Academy Kütüphane" klasöründe, paylaşılmamış');
let lib = await library();
const relativ = lib.find((x) => x.fileName === 'B1_Relativsatz_Übung-3.pdf');
ok(lib.length === 4 && relativ.level === 'B1' && relativ.topics.values[0].mapValue.fields.topic.stringValue === 'relativsaetze' && relativ.shared === false, 'library kayıtları: seviye, konu, shared false');
ok(await t.locator('#libList .lib-item').count() === 4 && (await t.locator('#libList .acc-badge').allTextContents()).every((x) => x === 'gizli'), 'listede 4 PDF, hepsi "gizli"');
await t.setInputFiles('#libFiles', [pdfFile('B1_Relativsatz_Übung-3.pdf')]);
await t.waitForFunction(() => document.querySelector('#queueList')?.textContent.includes('zaten kütüphanede'));
ok(true, 'aynı dosya ikinci kez: "Bu dosya zaten kütüphanede."');
await t.click('#clearQueue');

// 3. Arama, seviye filtresi, etiket düzenleme.
await t.selectOption('#libLevel', 'B1');
ok(await t.locator('#libList .lib-item').count() === 2, 'seviye filtresi B1: 2 PDF');
await t.selectOption('#libLevel', '');
await t.fill('#libSearch', 'dativ');
ok(await t.locator('#libList .lib-item').count() === 1, 'arama "dativ": 1 PDF');
await t.fill('#libSearch', '');
const lassenItem = t.locator('#libList .lib-item', { hasText: 'lassen-arbeitsblatt' });
await lassenItem.locator('.lib-chip-remove').first().click();
await t.waitForFunction(() => document.querySelector('#libStatus')?.textContent.includes('etiketleri kaydedildi'), null, { timeout: 10000 });
ok(!(await library()).find((x) => x.fileName === 'lassen-arbeitsblatt.pdf').topics.values?.length, 'etiket kaldırıldı (Firestore)');
await lassenItem.locator('.lib-topic').selectOption('B1|lassen-infinitiv');
await t.waitForFunction(async () => true);
await t.waitForTimeout(900);
ok((await library()).find((x) => x.fileName === 'lassen-arbeitsblatt.pdf').topics.values?.[0]?.mapValue.fields.topic.stringValue === 'lassen-infinitiv', 'etiket yeniden eklendi (Firestore)');
ok(await noOverflow(t), '1440: kütüphane listesi taşmıyor');
await shot(t, 'kutuphane-liste-1440');

// 4. Asistan: konu araması ve konu seçimi kütüphane PDF'ini önerir; taslakta paylaşılmaz, onayda paylaşılır.
await t.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await t.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await t.fill('#aSearch', 'Relativsatz');
await t.waitForFunction(() => document.querySelector('#aSuggest .odev-lib')?.textContent.includes('B1_Relativsatz_Übung-3'), null, { timeout: 15000 });
const libCard = t.locator('#aSuggest .odev-suggest-item').first();
ok((await libCard.locator('.odev-lib').textContent()).includes('onaylayınca paylaşılır'), 'öneride kütüphane PDF\'i, "Drive\'da gizli; onaylayınca paylaşılır"');
await libCard.locator('.odev-lib .odev-suggest-add').click();
ok(await t.locator('#aLinks li').count() === 1 && (await t.textContent('#aLinks')).includes('B1_Relativsatz_Übung-3'), 'PDF ödevin bağlantılarına eklendi');
ok((await libCard.locator('.odev-lib .odev-suggest-add').textContent()) === 'Eklendi', 'öneride "Eklendi"');
await libCard.getByRole('button', { name: 'Konuyu aç' }).click();
await t.waitForFunction(() => document.querySelector('#aLibrary')?.textContent.includes('B1_Relativsatz_Übung-3'), null, { timeout: 10000 });
ok(true, 'konu seçilince alıştırma listesinin altında kütüphane PDF\'i');
await t.fill('#aTitle', 'Relativsatz PDF');
await t.click('#aDraft'); await t.waitForURL(/ogretmen-taslaklar\.html/, { timeout: 15000 });
ok((await mockFiles(t)).every((f) => f.shared === ''), 'taslak kaydedilince PDF paylaşılmadı');
await t.waitForSelector('.odev-draft');
await t.uncheck('#draftNotify');
await t.locator('.odev-draft', { hasText: 'Relativsatz PDF' }).getByRole('button', { name: 'Onayla ve gönder' }).click();
await t.waitForURL(/ogretmen-odevler\.html\?durum=verildi/, { timeout: 15000 });
const relFile = (await mockFiles(t)).find((f) => f.name === 'B1_Relativsatz_Übung-3.pdf');
ok(relFile.shared === 'anyone:reader' && (await mockFiles(t)).filter((f) => f.shared).length === 1, 'onaylayınca yalnızca o PDF paylaşıldı');
ok((await library()).find((x) => x.fileName === 'B1_Relativsatz_Übung-3.pdf').shared === true, 'library: shared true');
const a1 = (await listDocs('users/ogrenci1/assignments')).map(plain);
ok(a1.length === 1 && a1[0].links.values[0].mapValue.fields.url.stringValue === `https://drive.google.com/file/d/${relFile.id}/view`, 'ödevde PDF bağlantısı');

// 5. Paylaşım hatası: ödev verilmez.
await t.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await t.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await t.fill('#aSearch', 'lassen');
await t.waitForSelector('#aSuggest .odev-lib .odev-suggest-add', { timeout: 15000 });
await t.locator('#aSuggest .odev-lib .odev-suggest-add').first().click();
await t.evaluate(() => localStorage.setItem('baDriveMockShareFail', '1'));
await t.uncheck('#aNotify');
await t.click('#aSubmit');
await t.waitForFunction(() => document.querySelector('#aStatus')?.textContent.includes('PDF paylaşılamadı'), null, { timeout: 10000 });
ok((await listDocs('users/ogrenci1/assignments')).length === 1 && await t.isEnabled('#aSubmit'), 'paylaşım hatası: ödev verilmedi, form yine gönderilebilir');
await t.evaluate(() => localStorage.removeItem('baDriveMockShareFail'));

// 6. Yardımcı kaynaklar: "Kütüphaneden".
await t.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`); await t.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
await t.waitForFunction(() => document.querySelectorAll('#rLibSelect option').length > 1, null, { timeout: 10000 });
await t.check('#rKindLib');
ok(await t.isVisible('#rLibSelect') && !(await t.isVisible('#rUrl')), '"Kütüphaneden": liste görünüyor');
const lassenId = (await library()).find((x) => x.fileName === 'lassen-arbeitsblatt.pdf').id;
ok((await t.locator(`#rLibSelect option[value="${lassenId}"]`).textContent()).includes('(gizli)'), 'listede gizli PDF işaretli');
await t.selectOption('#rLibSelect', lassenId);
await t.click('#rSubmit');
await t.waitForFunction(() => document.querySelector('#actionStatus')?.textContent.includes('Kaynak eklendi'), null, { timeout: 15000 });
const res = (await listDocs('users/ogrenci1/resources')).map(plain);
const lassenFile = (await mockFiles(t)).find((f) => f.name === 'lassen-arbeitsblatt.pdf');
ok(res.length === 1 && res[0].kind === 'pdf' && res[0].fileId === lassenFile.id && res[0].title === 'lassen-arbeitsblatt', 'kaynak: kind pdf, fileId, başlık kütüphaneden');
ok(lassenFile.shared === 'anyone:reader' && (await library()).find((x) => x.id === lassenId).shared === true, 'kaynağa eklenince PDF paylaşıldı');

// 7. Kütüphaneden çıkarma: kayıt silinir, dosya Drive'da kalır.
await t.goto(`${BASE}/ogretmen-kutuphane.html`); await t.waitForSelector('#libApp:not([hidden])', { timeout: 15000 });
ok((await t.locator('#libList .lib-item', { hasText: 'lassen-arbeitsblatt' }).locator('.acc-badge').textContent()) === 'paylaşıldı', 'listede "paylaşıldı"');
await t.locator('#libList .lib-item', { hasText: 'A2-Dativ' }).getByRole('button', { name: /kütüphaneden çıkar/ }).click();
await t.waitForFunction(() => document.querySelector('#libStatus')?.textContent.includes('kütüphaneden çıkarıldı'));
ok((await library()).length === 3 && (await mockFiles(t)).length === 4, 'kayıt silindi, dosya Drive\'da duruyor');

// 8. 390 ve koyu tema.
for (const [width, theme] of [[390, 'light'], [1440, 'dark']]) {
  const { ctx: c, page } = await newPage(width, theme);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  await page.goto(`${BASE}/ogretmen-kutuphane.html`); await page.waitForSelector('#libList .lib-item', { timeout: 15000 });
  await page.setInputFiles('#libFiles', [pdfFile('C1_Nominalisierung_sehr_langer_Dateiname_fuer_den_Test.pdf')]);
  await page.waitForSelector('#queueList .lib-item');
  ok(await noOverflow(page), `${width} ${theme}: kütüphane taşmıyor`);
  await shot(page, `kutuphane-${width}-${theme}`);
  await page.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await page.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
  await page.fill('#aSearch', 'Relativsatz'); await page.waitForSelector('#aSuggest .odev-lib', { timeout: 15000 });
  ok(await noOverflow(page), `${width} ${theme}: form (kütüphane önerisi) taşmıyor`);
  await c.close();
}

// 9. Öğrenci: kütüphaneyi okuyamaz; ödevdeki PDF'i görür.
const { page: s } = await newPage(1440);
await signIn(s, 'ogrenci@example.com', 'ogrenci123', 'student');
const denied = await s.evaluate(async () => {
  const { db, fs } = await import('/js/account/firebase.js');
  try{ await fs.getDocs(fs.collection(db, 'library')); return false; }catch(e){ return e.code === 'permission-denied'; }
});
ok(denied, 'öğrenci library okuyamıyor');
await s.goto(`${BASE}/odevlerim.html`); await s.waitForSelector('.odev-item', { timeout: 15000 });
ok(await s.locator(`a.odev-chip[href="https://drive.google.com/file/d/${relFile.id}/view"]`).count() === 1, 'öğrenci ödevdeki PDF bağlantısını görüyor');

ok(!errors.length, `sayfa hatası yok ${errors.join(' | ')}`);
await browser.close();
server.close();
console.log(`Ekran görüntüleri: ${shotDir}`);
if (fails.length) { console.log(`\n${fails.length} hata`); process.exit(1); }
console.log('\nHepsi geçti.');
