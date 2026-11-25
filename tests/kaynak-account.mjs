// Yardımcı kaynaklar, hesap tarafı (Firebase Emulator: auth + firestore; Drive taklidi js/account/drive-mock.js).
// Çalıştırma: npm run test:kaynak
// Eski kayıt (kind yok) bağlantı olarak görünür → öğretmen bağlantıyı iki öğrenciye ekler → geçersiz bağlantı / PDF
// olmayan / 20 MB üstü dosya reddedilir → PDF bir kez "Bozkurt Academy Kaynaklar" klasörüne yüklenir, üç öğrenciye
// kopya yazılır, listede "3 öğrenciye verildi" → bir kopyayı silmek diğerlerine ve Drive'daki dosyaya dokunmaz →
// öğrenci panelinde PDF simgesi, yeni sekme, TR/DE/EN → 390/1440 açık/koyu ekran görüntüleri ve taşma denetimi.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'kaynak-'));

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
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123'], ['ogrenci3', 'ikinci@example.com', 'ogrenci123'], ['ogrenci2', 'bekleyen@example.com', 'ogrenci123']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
const year = new Date().getUTCFullYear();
const profile = (name, email, status) => ({ fields: {
  name: { stringValue: name }, email: { stringValue: email }, birthYear: { integerValue: String(year - 25) },
  minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: status },
  emailVerified: { booleanValue: true }, createdAt: { timestampValue: new Date().toISOString() }
} });
const patch = (p, body) => fetch(`${docsUrl}/${p}`, { method: 'PATCH', headers: owner, body: JSON.stringify(body) });
await patch('users/ogrenci1', profile('Deniz Kaya', 'ogrenci@example.com', 'active'));
await patch('users/ogrenci3', profile('Arda Can', 'ikinci@example.com', 'active'));
await patch('users/ogrenci2', profile('Ece Bekler', 'bekleyen@example.com', 'pending'));
const getDocRest = async (p) => (await fetch(`${docsUrl}/${p}`, { headers: owner })).json();
const listDocs = async (p) => ((await (await fetch(`${docsUrl}/${p}?pageSize=100`, { headers: owner })).json()).documents || []);
const plain = (d) => Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, Object.values(v)[0]]));
const noteDoc = async (id) => { const d = await getDocRest(`users/ogrenci1/lessonNotes/${id}`); return d.fields ? plain(d) : null; };
const noteText = async (id) => { const d = await noteDoc(id); return d ? JSON.parse(d.content).ops.map((o) => o.insert).join('') : ''; };

const fails = [];
let lastLabel = '';
// Yapıştırılan HTML'deki onerror=… Quill'in DOMParser'ında da CSP'ye takılır (beklenen; engellendiği sayılır).
let expectInlineBlock = false, blockedInline = 0;
const ok = (cond, label) => { lastLabel = label; console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
async function newPage(width = 1440, theme = 'light', ctxIn = null) {
  const ctx = ctxIn || await browser.newContext({ viewport: { width, height: 900 } });
  if (!ctxIn) {
    await ctx.addInitScript((t) => { try { localStorage.setItem('baEmulator', '1'); if (!sessionStorage.getItem('th')) { sessionStorage.setItem('th', '1'); localStorage.setItem('ba-theme', t); } } catch (_) {} }, theme);
    await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
      const file = path.join(ROOT, 'node_modules/firebase', path.basename(new URL(route.request().url()).pathname));
      route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
    });
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && expectInlineBlock && /inline event handler/.test(m.text())) { blockedInline++; return; } if (m.type() === 'error' && /Content Security Policy|Refused/.test(m.text())) errors.push(`${m.text().slice(0, 90)}… (${page.url().replace(BASE, '')}, "${lastLabel}" adımından sonra)`); });
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
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 0
  && [...document.querySelectorAll('.note-card, .note-list-item, .acc-section')].every((c) => {
    const right = c.getBoundingClientRect().right + 1;
    // Telefonda araç çubuğu yana kayar: içindeki düğmeler değil, çubuğun kendisi karta sığmalı.
    return [...c.querySelectorAll('*')].filter((e) => !e.closest('.note-menu-panel') && (!e.closest('.note-toolbar') || e.classList.contains('note-toolbar'))).every((e) => !e.getClientRects().length || e.getBoundingClientRect().right <= right);
  }));
const waitFor = async (fn, ms = 10000, step = 200) => { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v) return v; if (Date.now() > end) return v; await new Promise((r) => setTimeout(r, step)); } };
const TODAY = new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date());
const editorOps = (page) => page.evaluate(() => window.Quill.find(document.querySelector('#editor')).getContents().ops);
const saveState = (page) => page.textContent('#saveState');
const paste = (page, { html = '', text = '' }) => page.evaluate(([h, t]) => {
  const dt = new DataTransfer();
  if (h) dt.setData('text/html', h);
  dt.setData('text/plain', t);
  document.querySelector('#editor .ql-editor').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
}, [html, text]);


await patch('users/ogrenci5', profile('Ece Yıldız', 'ece@example.com', 'active'));
await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId: 'ogrenci5', email: 'ece@example.com', password: 'ogrenci123' }) });
// Eski biçimli kaynak (kind, groupId yok).
await patch('users/ogrenci1/resources/eski1', { fields: { title: { stringValue: 'Eski Duden linki' }, url: { stringValue: 'https://www.duden.de/' }, note: { stringValue: 'Kelime anlamları için' }, createdAt: { timestampValue: new Date(Date.now() - 864e5).toISOString() } } });
const resources = async (uid) => (await listDocs(`users/${uid}/resources`)).map((d) => ({ id: d.name.split('/').pop(), ...plain(d) }));
const PDF = (name) => ({ name, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\n%%EOF') });

// ---- 1. Öğretmen: eski kayıt ve yeni başlık ----
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`);
await teacher.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
await teacher.waitForSelector('input[name="rStudent"]', { timeout: 10000 });
ok((await teacher.textContent('#resourcesTitle')) === 'Yardımcı kaynaklar' && (await teacher.textContent('#resourceForm h3')) === 'Yardımcı kaynak ekle', 'öğretmen sayfasında "Yardımcı kaynaklar" ve "Yardımcı kaynak ekle"');
const oldItem = teacher.locator('#resourcesList li[data-resource="eski1"]');
ok(await oldItem.locator('a.acc-res-link').getAttribute('href') === 'https://www.duden.de/' && await oldItem.locator('.acc-res-icon-link').count() === 1 && (await oldItem.textContent()).includes('Kelime anlamları için'), 'eski kayıt bağlantı olarak (bağlantı simgesi, not) görünüyor');
ok(await teacher.locator('input[name="rStudent"][value="ogrenci1"]').isChecked() && !(await teacher.locator('input[name="rStudent"][value="ogrenci5"]').isChecked()), 'öğrenci seçimi: açık olan öğrenci işaretli, diğerleri değil');
ok(await teacher.locator('input[name="rStudent"][value="ogrenci2"]').count() === 0 && !(await teacher.textContent('#rStudents')).includes('Ece Bekler'), 'onay bekleyen öğrenci listede yok');

// ---- 2. Bağlantıyı iki öğrenciye ----
await teacher.fill('#rTitle', 'Perfekt videosu');
await teacher.fill('#rUrl', 'javascript:alert(1)');
await teacher.click('#rSubmit');
ok((await teacher.textContent('#actionStatus')).includes('https://'), 'geçersiz bağlantı reddedildi');
await teacher.fill('#rUrl', 'https://www.youtube.com/watch?v=perfekt');
await teacher.fill('#rNote', 'İlk 5 dakika');
await teacher.check('input[name="rStudent"][value="ogrenci3"]');
ok((await teacher.textContent('#rSubmit')) === 'Kaynağı 2 öğrenciye ekle', 'düğme seçilen öğrenci sayısını gösteriyor');
await teacher.click('#rSubmit');
await waitFor(async () => (await teacher.textContent('#actionStatus')).includes('2 öğrenciye eklendi'), 8000);
const r1 = await resources('ogrenci1'), r3 = await resources('ogrenci3');
const v1 = r1.find((r) => r.title === 'Perfekt videosu'), v3 = r3.find((r) => r.title === 'Perfekt videosu');
ok(v1 && v3 && v1.kind === 'link' && v1.groupId && v1.groupId === v3.groupId && v1.note === 'İlk 5 dakika' && !(await resources('ogrenci5')).length, 'iki öğrenciye ayrı kopya (aynı groupId), üçüncüye değil');
ok(await teacher.inputValue('#rTitle') === '' && await teacher.locator('input[name="rStudent"][value="ogrenci3"]').isChecked() === false, 'form temizlendi');
await waitFor(async () => (await teacher.textContent('#resourcesList')).includes('Perfekt videosu'), 5000);
ok((await teacher.locator('#resourcesList li', { hasText: 'Perfekt videosu' }).textContent()).includes('2 öğrenciye verildi'), 'listede "2 öğrenciye verildi"');

// ---- 3. PDF: denetimler, bir yükleme, üç öğrenciye ----
await teacher.check('#rKindPdf');
ok(await teacher.locator('#rPdfBox').isVisible() && await teacher.locator('#rLinkBox').isHidden(), '"PDF yükle" seçilince PDF alanı görünüyor');
await teacher.click('#rSubmit');
ok((await teacher.textContent('#actionStatus')).includes('Önce bir PDF'), 'PDF seçmeden eklenemiyor');
const first = teacher.waitForEvent('filechooser', { timeout: 5000 });
await teacher.click('#rPdfAdd');
const pick = async (file) => { await (await (async () => { const c = teacher.waitForEvent('filechooser', { timeout: 5000 }); await teacher.click('#rPdfAdd'); return c; })()).setFiles(file); await teacher.waitForTimeout(600); };
await (await first).setFiles({ name: 'notlar.txt', mimeType: 'text/plain', buffer: Buffer.from('merhaba') });
await teacher.waitForTimeout(500);
ok((await teacher.textContent('#rPdfStatus')).includes('Sadece PDF'), 'PDF olmayan dosya reddedildi');
await pick({ name: 'buyuk.pdf', mimeType: 'application/pdf', buffer: Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(20 * 1024 * 1024)]) });
ok((await teacher.textContent('#rPdfStatus')).includes('çok büyük'), '20 MB üstü PDF reddedildi');
await pick({ name: 'sahte.pdf', mimeType: 'application/pdf', buffer: Buffer.from('merhaba') });
ok((await teacher.textContent('#rPdfStatus')).includes('geçerli bir PDF değil'), 'içeriği PDF olmayan .pdf reddedildi');
await teacher.evaluate(() => localStorage.setItem('baDriveMockFail', '1'));
await pick(PDF('Artikel-Tabelle.pdf'));
ok((await teacher.textContent('#rPdfStatus')).includes('PDF yüklenemedi') && await teacher.isEnabled('#rSubmit'), 'yükleme hatası: mesaj, form yine kullanılabilir');
await teacher.evaluate(() => localStorage.removeItem('baDriveMockFail'));
await pick(PDF('Artikel-Tabelle.pdf'));
ok((await teacher.textContent('#rPdfStatus')).includes('yüklendi ve paylaşıldı') && (await teacher.textContent('#rPdfName')) === 'Artikel-Tabelle.pdf' && await teacher.inputValue('#rTitle') === 'Artikel-Tabelle', 'PDF yüklendi; dosya adı ve başlık dolduruldu');
await teacher.fill('#rTitle', 'Artikel-Tabelle (der/die/das)');
await teacher.check('#rAll');
ok((await teacher.textContent('#rSubmit')) === 'Kaynağı 3 öğrenciye ekle', '"Hepsini seç": 3 öğrenci');
await teacher.click('#rSubmit');
await waitFor(async () => (await teacher.textContent('#actionStatus')).includes('3 öğrenciye eklendi'), 8000);
const drive = await teacher.evaluate(() => JSON.parse(localStorage.getItem('baDriveMock') || '[]'));
ok(drive.length === 1 && drive[0].folder === 'Bozkurt Academy Kaynaklar' && drive[0].shared === 'anyone:reader', 'PDF bir kez, "Bozkurt Academy Kaynaklar" klasörüne, bağlantıyla görüntülenebilir');
const copies = [];
for (const u of ['ogrenci1', 'ogrenci5', 'ogrenci3']) copies.push((await resources(u)).find((r) => r.kind === 'pdf'));
ok(copies.every((c) => c && c.fileId === drive[0].id && c.fileName === 'Artikel-Tabelle.pdf' && c.url === `https://drive.google.com/file/d/${drive[0].id}/view` && c.groupId === copies[0].groupId && c.title === 'Artikel-Tabelle (der/die/das)'), 'üç öğrencide ayrı kopya: aynı dosya, aynı groupId');
await waitFor(async () => (await teacher.textContent('#resourcesList')).includes('Artikel-Tabelle'), 5000);
const pdfItem = teacher.locator('#resourcesList li', { hasText: 'Artikel-Tabelle' });
ok(await pdfItem.locator('.acc-res-icon-pdf').count() === 1 && (await pdfItem.textContent()).includes('3 öğrenciye verildi') && await pdfItem.locator('a').getAttribute('target') === '_blank' && await pdfItem.locator('a').getAttribute('rel') === 'noopener noreferrer', 'öğretmen listesinde PDF simgesi, "3 öğrenciye verildi", yeni sekme');
// Ödev PDF'leri hâlâ "Ödevler" klasörüne (drive.js varsayılanı).
const folderDefault = await teacher.evaluate(async () => { const d = await import('/js/account/drive.js?v=3'); return [d.FOLDER_NAME, d.RESOURCE_FOLDER]; });
ok(folderDefault[0] === 'Bozkurt Academy Ödevler' && folderDefault[1] === 'Bozkurt Academy Kaynaklar', 'ödevlerin varsayılan klasörü değişmedi');

// ---- 4. Silme: yalnızca bu öğrencinin kopyası, PDF Drive'da kalır ----
await pdfItem.locator('button', { hasText: 'Sil' }).click();
await waitFor(async () => !(await resources('ogrenci1')).some((r) => r.kind === 'pdf'), 6000);
ok(!(await resources('ogrenci1')).some((r) => r.kind === 'pdf') && (await resources('ogrenci5')).some((r) => r.kind === 'pdf') && (await resources('ogrenci3')).some((r) => r.kind === 'pdf'), 'silme yalnızca bu öğrencinin kopyasını sildi');
ok((await teacher.evaluate(() => JSON.parse(localStorage.getItem('baDriveMock') || '[]'))).length === 1, 'PDF Drive\'da kaldı');

// ---- 5. Öğrenci paneli: TR/DE/EN, PDF simgesi, yeni sekme ----
const { ctx: sctx, page: student } = await newPage(1440);
await signIn(student, 'ece@example.com', 'ogrenci123', 'student');
await student.goto(`${BASE}/panel.html`);
await student.waitForSelector('#resourceSection:not([hidden]) li', { timeout: 15000 });
ok((await student.textContent('#resourceTitle')) === 'Yardımcı kaynaklar', 'öğrenci paneli: "Yardımcı kaynaklar"');
const sp = student.locator('#resourceList li', { hasText: 'Artikel-Tabelle' });
ok(await sp.locator('.acc-res-icon-pdf').count() === 1 && await sp.locator('a').getAttribute('target') === '_blank' && await sp.locator('a').getAttribute('rel') === 'noopener noreferrer' && (await sp.locator('a').getAttribute('href')).startsWith('https://drive.google.com/file/d/'), 'öğrenci: PDF simgesiyle, Drive bağlantısı yeni sekmede');
await sctx.route('https://drive.google.com/**', (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Drive</title>' }));
const popup = student.waitForEvent('popup', { timeout: 5000 }).catch(() => null);
await sp.locator('a').click();
const pop = await popup;
await pop?.waitForLoadState().catch(() => {});
ok(pop && pop.url().startsWith('https://drive.google.com/file/d/') && student.url().includes('panel.html'), 'tıklayınca PDF yeni sekmede açılıyor, panel yerinde kalıyor');
await pop?.close();
await student.click('[data-lang="de"]');
ok((await student.textContent('#resourceTitle')) === 'Hilfreiche Materialien', 'DE: "Hilfreiche Materialien"');
await student.click('[data-lang="en"]');
ok((await student.textContent('#resourceTitle')) === 'Helpful resources', 'EN: "Helpful resources"');
await student.click('[data-lang="tr"]');
await sctx.close();
// Boş liste (Arda'nın PDF kopyası ve linki silinmiş bir öğrenci yerine: yeni öğrenci)
await patch('users/ogrenci4', profile('Bora Boş', 'bos@example.com', 'active'));
await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId: 'ogrenci4', email: 'bos@example.com', password: 'ogrenci123' }) });
const { ctx: ectx, page: empty } = await newPage(1440);
await signIn(empty, 'bos@example.com', 'ogrenci123', 'student');
await empty.goto(`${BASE}/panel.html`);
await empty.waitForSelector('#resourceSection:not([hidden])', { timeout: 15000 });
await empty.waitForTimeout(500);
ok((await empty.textContent('#resourceList')).includes('Öğretmenin sana henüz yardımcı kaynak eklemedi'), 'boş liste metni (TR)');
await empty.click('[data-lang="de"]');
ok((await empty.textContent('#resourceList')).includes('Dein Lehrer hat dir noch keine Materialien gegeben'), 'boş liste metni (DE, "du")');
await empty.click('[data-lang="en"]');
ok((await empty.textContent('#resourceList')).includes('Your teacher has not given you any resources yet'), 'boş liste metni (EN)');
await empty.click('[data-lang="tr"]');
await ectx.close();

// ---- 6. Ekran görüntüleri: 390/1440 × açık/koyu ----
for (const theme of ['light', 'dark']) {
  for (const width of [390, 1440]) {
    const { ctx: mt, page: tp } = await newPage(width, theme);
    await signIn(tp, 'ogretmen@example.com', 'ogretmen123', 'teacher');
    await tp.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci5#kaynaklar`);
    await tp.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
    await tp.waitForSelector('input[name="rStudent"]', { timeout: 10000 });
    await tp.check('#rKindPdf');
    ok(await noOverflow(tp), `${width} ${theme}: öğretmen sayfası (kaynak formu) taşmıyor`);
    await tp.locator('#kaynaklar').screenshot({ path: path.join(shotDir, `ogretmen-kaynaklar-${width}-${theme}.png`) });
    await mt.close();
    const { ctx: ms, page: st } = await newPage(width, theme);
    await signIn(st, 'ece@example.com', 'ogrenci123', 'student');
    await st.goto(`${BASE}/panel.html`);
    await st.waitForSelector('#resourceSection:not([hidden]) li', { timeout: 15000 });
    ok(await noOverflow(st), `${width} ${theme}: öğrenci paneli taşmıyor`);
    await st.locator('#resourceSection').screenshot({ path: path.join(shotDir, `panel-kaynaklar-${width}-${theme}.png`) });
    await ms.close();
  }
}

await browser.close();
server.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED:\n  ${fails.join('\n  ')}` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
