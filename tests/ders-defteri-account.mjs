// Ders defteri, hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:ders-defteri
// Öğretmen öğrenci sayfasında "Derse başla" → boş sayfa (bugünün tarihi, takvimdeki derse bağlı) → yazar, otomatik
// kayıt (1,5 sn; durmadan yazınca en geç 10 sn; yazma sayısı rev ile ölçülür) → öğrenci aynı notu canlı ve salt okunur
// görür → biçimler, kısayollar, geri al/yinele, tablo, bağlantı → bağlantı kesilip gelme (durum yazısı, yerel yedek,
// kapanan sekmenin yedeğini geri yükleme) → ikinci sekme → boyut uyarısı → Google Docs'tan tablo yapıştırma →
// XSS denemeleri → yazdırma görünümü → yazı boyutu, tam ekran → takvim bağlantısı → silme.
// Ekran görüntüleri: 390/1440, açık/koyu.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'ders-defteri-'));

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
// Bugün, takvimde Deniz'in dersi (Berlin günü bugün olsun diye şimdiki zaman).
await patch('users/ogrenci1/lessons/ders1', { fields: {
  startAt: { timestampValue: new Date().toISOString() }, durationMin: { integerValue: '50' }, status: { stringValue: 'scheduled' },
  studentName: { stringValue: 'Deniz Kaya' }, calendarSync: { stringValue: 'ok' }, note: { stringValue: '' }
} });
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

// ---- 1. Öğretmen: öğrenci sayfası, "Derse başla" ----
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`);
await teacher.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
ok((await teacher.textContent('#startLessonLink')).trim() === 'Derse başla', 'öğrenci sayfasında "Derse başla" düğmesi');
ok((await teacher.getAttribute('#startLessonLink', 'href')).includes('ders=ders1'), 'bugün takvimde ders varsa sayfa o derse bağlanıyor');
ok((await teacher.textContent('#notesList')).includes('Henüz ders notu yok'), 'boş not listesi');
await teacher.click('#startLessonLink');
await teacher.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
const noteId = new URL(teacher.url()).searchParams.get('not');
ok(Boolean(noteId), 'yeni not kimliği adreste');
ok((await teacher.inputValue('#noteTitle')) === `${TODAY} – Ders`, `başlık varsayılan olarak bugünün tarihi (${TODAY} – Ders)`);
ok((await saveState(teacher)).includes('Kaydedildi'), 'başlangıçta durum "Kaydedildi ✓"');
ok(await noteDoc(noteId) === null, 'boş sayfa açılınca belge oluşmuyor');
ok(await waitFor(() => teacher.evaluate(() => document.activeElement?.classList.contains('ql-editor')), 3000), 'imleç editörde');

// ---- 2. Öğrenci: liste boş ----
const { ctx: sctx, page: student } = await newPage(390, 'dark');
await signIn(student, 'ogrenci@example.com', 'ogrenci123', 'student');
await student.goto(`${BASE}/ders-notlarim.html`);
await student.waitForSelector('#notesListView:not([hidden])', { timeout: 15000 });
ok((await student.textContent('#notesList')).includes('Henüz ders notun yok'), 'öğrencinin listesi boş');

// ---- 3. Yazma ve otomatik kayıt ----
await teacher.keyboard.type('Hallo zusammen! Heute: Perfekt.');
await teacher.waitForTimeout(400);
ok((await saveState(teacher)).includes('Kaydedilmeyi bekliyor'), 'yazarken durum "Kaydedilmeyi bekliyor" (henüz yazma isteği yok)');
// "Kaydediliyor…" yalnızca sunucuya yazılırken; yazmayı bırakınca en geç ~3 sn'de "Kaydedildi ✓".
await teacher.evaluate(() => { window.__tl = []; const el = document.querySelector('#saveState'); const t0 = performance.now(); new MutationObserver(() => window.__tl.push([Math.round(performance.now() - t0), el.textContent])).observe(el, { childList: true, characterData: true, subtree: true }); });
const t0 = Date.now();
const saved = await waitFor(async () => (await noteText(noteId)).includes('Heute: Perfekt.'), 6000, 100);
ok(saved, `yazmayı bırakınca kaydedildi (${Date.now() - t0} ms)`);
await waitFor(async () => (await saveState(teacher)).includes('Kaydedildi'), 3000);
ok((await saveState(teacher)).includes('Kaydedildi ✓'), 'durum "Kaydedildi ✓"');
{
  const tl = await teacher.evaluate(() => window.__tl);
  const start = tl.find(([, t]) => t === 'Kaydediliyor…')?.[0], end = tl.find(([, t]) => t.startsWith('Kaydedildi'))?.[0];
  console.log('     durum zaman çizelgesi:', JSON.stringify(tl));
  ok(start !== undefined && end !== undefined && end - start < 1500 && end < 3500, `"Kaydediliyor…" kısa görünüyor (${end - start} ms), takılı kalmıyor`);
}
let d = await noteDoc(noteId);
ok(d.lessonId === 'ders1' && /^\d{4}-\d\d-\d\d$/.test(d.day) && d.title === `${TODAY} – Ders`, 'belge: takvimdeki derse bağlı, gün ve başlık doğru');
ok(new URL(teacher.url()).searchParams.get('ders') === null, 'ilk kayıttan sonra adres ?not ile (ders parametresi kalktı)');

// ---- 4. Öğrenci canlı görür ----
await student.goto(`${BASE}/ders-notlarim.html`);
await student.waitForSelector('.note-list-item', { timeout: 15000 });
ok((await student.textContent('.note-list-item')).includes(`${TODAY} – Ders`) && await student.locator('.note-list-item .note-live').count() === 1, 'öğrencinin listesinde not "Canlı" rozetiyle');
await student.click('.note-list-item');
await student.waitForSelector('#noteView:not([hidden])', { timeout: 15000 });
ok((await student.textContent('#viewer')).includes('Heute: Perfekt.'), 'öğrenci notu görüyor');
ok(await student.evaluate(() => document.querySelector('#viewer .ql-editor').getAttribute('contenteditable') !== 'true'), 'öğrencinin görünümü salt okunur');
ok(!(await student.locator('#liveHint').isHidden()), 'öğrenciye "öğretmenin şu an yazıyor" bilgisi');
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('Ich habe gegessen.');
const tLive = Date.now();
ok(await waitFor(async () => (await student.textContent('#viewer')).includes('Ich habe gegessen.'), 8000, 100), `öğretmen yazdıkça öğrencinin ekranı güncelleniyor (${Date.now() - tLive} ms)`);
// Öğrenci yazmaya çalışırsa: ekranda yazamaz, Firestore'a da yazamaz.
await student.click('#viewer .ql-editor');
await student.keyboard.type('HACK');
ok(!(await student.textContent('#viewer')).includes('HACK'), 'öğrenci notu ekranda değiştiremiyor');
const writeDenied = await student.evaluate(async (id) => {
  const { db, fs } = await import('/js/account/firebase.js');
  try { await fs.updateDoc(fs.doc(db, 'users', 'ogrenci1', 'lessonNotes', id), { title: 'HACK' }); return false; } catch (e) { return e.code === 'permission-denied'; }
}, noteId);
ok(writeDenied, 'öğrenci Firestore\'a yazamıyor (permission-denied)');

// ---- 5. Biçimler, kısayollar, geri al / yinele ----
const ed = '#editor .ql-editor';
await teacher.click(ed);
await teacher.keyboard.press('Control+End');
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('Wichtig');
await teacher.keyboard.press('Shift+Home');
await teacher.waitForTimeout(1000); // yazma ve biçim ayrı geri alma adımları olsun
await teacher.keyboard.press('Control+B');
await teacher.keyboard.press('Control+I');
await teacher.keyboard.press('Control+U');
await teacher.keyboard.press('Control+Shift+X');
let ops = await editorOps(teacher);
let w = ops.find((o) => o.insert === 'Wichtig');
ok(w && w.attributes?.bold && w.attributes?.italic && w.attributes?.underline && w.attributes?.strike, 'Ctrl+B / I / U / Shift+X: kalın, italik, altı çizili, üstü çizili');
ok(await teacher.getAttribute('[data-format="bold"]', 'aria-pressed') === 'true', 'araç çubuğunda "Kalın" basılı görünüyor');
// Quill 0,8 sn içindeki değişiklikleri tek adımda geri alır (dört kısayol birlikte).
await teacher.keyboard.press('Control+Z');
ops = await editorOps(teacher);
w = ops.find((o) => o.insert === 'Wichtig');
ok((await teacher.textContent(ed)).includes('Wichtig') && await teacher.locator(`${ed} strong, ${ed} em, ${ed} u, ${ed} s`).count() === 0, 'Ctrl+Z biçimleri geri alıyor (metin kalıyor)');
await teacher.keyboard.press('Control+Y');
ops = await editorOps(teacher);
ok(ops.find((o) => o.insert === 'Wichtig')?.attributes?.strike, 'Ctrl+Y yineliyor');
await teacher.click('[data-action="undo"]');
ok(!(await editorOps(teacher)).find((o) => o.insert === 'Wichtig')?.attributes?.bold, 'Geri al düğmesi');
await teacher.click('[data-action="redo"]');
ok((await editorOps(teacher)).find((o) => o.insert === 'Wichtig')?.attributes?.strike, 'Yinele düğmesi');
// Renk ve vurgu (Yinele imleci değişikliğin sonuna koyar; kelimeyi yeniden seç)
await teacher.keyboard.press('End');
await teacher.keyboard.press('Shift+Home');
await teacher.click('#colorMenu summary');
await teacher.click('#colorList [data-value="kirmizi"]');
await teacher.click('#highlightMenu summary');
await teacher.click('#highlightList [data-value="sari"]');
ops = await editorOps(teacher);
w = ops.find((o) => o.insert.endsWith('Wichtig'));
ok(w?.attributes?.color === 'kirmizi' && w?.attributes?.background === 'sari' && w?.attributes?.bold, `yazı rengi ve vurgu (palet sınıfı) ${JSON.stringify(w)}`);
ok(await teacher.locator(`${ed} .ba-c-kirmizi.ba-bg-sari`).count() === 1 && !(await teacher.getAttribute(`${ed} .ba-c-kirmizi`, 'style')), 'renk satır içi stil değil sınıf olarak');
// Başlık ve listeler
await teacher.keyboard.press('End');
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('Regeln');
await teacher.keyboard.press('Control+Alt+2');
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('Unterpunkt');
await teacher.click('[data-format="header"][data-value="3"]');
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('erstens');
await teacher.keyboard.press('Control+Shift+7');
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('zweitens');
await teacher.keyboard.press('Enter');
await teacher.keyboard.press('Control+Shift+7');
await teacher.keyboard.type('Punkt');
await teacher.click('[data-format="list"][data-value="bullet"]');
await teacher.keyboard.press('Home');
await teacher.keyboard.press('Tab');
// Satırın biçimi: editördeki blok öğesi (h2, h3, li[data-list], ql-indent-1).
const line = (text) => teacher.evaluate((t) => { const e = [...document.querySelectorAll('#editor .ql-editor > *, #editor .ql-editor li')].find((x) => x.textContent === t); return e ? { tag: e.tagName, list: e.getAttribute('data-list'), cls: e.className } : {}; }, text);
ok((await line('Regeln')).tag === 'H2' && (await line('Unterpunkt')).tag === 'H3', 'başlık ve alt başlık (Ctrl+Alt+2, düğme)');
ok((await line('erstens')).list === 'ordered' && (await line('zweitens')).list === 'ordered', 'numaralı liste (Ctrl+Shift+7)');
const punkt = await line('Punkt');
ok(punkt.list === 'bullet' && punkt.cls.includes('ql-indent-1'), `madde listesi ve satır başında Tab ile girinti ${JSON.stringify(punkt)}`);
await teacher.keyboard.press('Shift+Tab');
await teacher.keyboard.press('Enter'); await teacher.keyboard.press('Enter');
// Tablo: ızgara (Google Docs gibi). Önce klavyeyle: Enter ile aç, oklarla seç, Esc ile kapat, Enter ile ekle.
const lastTable = () => teacher.evaluate(() => { const t = [...document.querySelectorAll('#editor table')].pop(); return t ? [...t.querySelectorAll('tr')].map((tr) => tr.children.length) : []; });
const tableCount = () => teacher.locator('#editor table').count();
ok(await teacher.getAttribute('#tableEditMenu summary', 'aria-disabled') === 'true', 'tablo dışındayken "Tabloyu düzenle" kapalı');
await teacher.click('#tableEditMenu summary', { force: true });
ok(!(await teacher.evaluate(() => document.querySelector('#tableEditMenu').open)), 'kapalı "Tabloyu düzenle" menüsü açılmıyor');
await teacher.focus('#tableMenu summary');
await teacher.keyboard.press('Enter');
await waitFor(() => teacher.evaluate(() => document.activeElement.id === 'tableGrid'), 2000, 50);
ok(await teacher.evaluate(() => document.querySelector('#tableMenu').open && document.activeElement.id === 'tableGrid'), 'klavye: Enter ızgarayı açıyor, odak ızgarada');
ok(await teacher.locator('#tableGrid .note-grid-cell').count() === 80, 'ızgara 10 sütun × 8 satır');
await teacher.keyboard.press('ArrowRight'); await teacher.keyboard.press('ArrowDown');
ok((await teacher.textContent('#tableSize')) === '2 × 2' && await teacher.locator('#tableGrid .is-on').count() === 4, 'klavye: oklarla 2 × 2 seçiliyor, 4 kare boyalı');
await teacher.keyboard.press('Escape');
ok(await teacher.evaluate(() => !document.querySelector('#tableMenu').open && document.activeElement === document.querySelector('#tableMenu summary')), 'Esc ızgarayı kapatıyor, odak "Tablo" düğmesinde');
await teacher.keyboard.press('Enter');
await waitFor(() => teacher.evaluate(() => document.activeElement.id === 'tableGrid'), 2000, 50);
for (let i = 0; i < 12; i++) await teacher.keyboard.press('ArrowRight');
for (let i = 0; i < 12; i++) await teacher.keyboard.press('ArrowDown');
ok((await teacher.textContent('#tableSize')) === '10 × 8', 'klavye: sınırda duruyor (10 × 8)');
for (let i = 0; i < 8; i++) await teacher.keyboard.press('ArrowLeft');
for (let i = 0; i < 6; i++) await teacher.keyboard.press('ArrowUp');
await teacher.keyboard.press('Enter');
ok(JSON.stringify(await lastTable()) === '[2,2]' && !(await teacher.evaluate(() => document.querySelector('#tableMenu').open)), 'klavye: Enter 2 × 2 tablo ekliyor');
await teacher.keyboard.type('der');
ok(await teacher.getAttribute('#tableMenu summary', 'aria-disabled') === 'true' && await teacher.getAttribute('#tableEditMenu summary', 'aria-disabled') === 'false', 'tablonun içindeyken "Tablo" kapalı, "Tabloyu düzenle" açık');
// Fareyle: imleç tablonun altında; 3 × 4 (sütun × satır) üzerine gel, kareler boyansın, tıkla.
await teacher.keyboard.press('Control+End');
await teacher.click('#tableMenu summary');
await teacher.hover('#tableCell-4-3');
ok((await teacher.textContent('#tableSize')) === '3 × 4' && await teacher.locator('#tableGrid .is-on').count() === 12, 'fare: 3 × 4 üzerine gelince 12 kare boyalı, altında "3 × 4"');
await teacher.screenshot({ path: path.join(shotDir, 'tablo-izgarasi-3x4-1440-acik.png'), clip: await teacher.locator('#tableMenu .note-menu-panel').boundingBox().then((b) => ({ x: b.x - 40, y: b.y - 70, width: b.width + 80, height: b.height + 90 })) });
const before34 = await tableCount();
await teacher.click('#tableCell-4-3');
ok(await tableCount() === before34 + 1 && JSON.stringify(await lastTable()) === '[3,3,3,3]', 'fare: ızgaradan 3 sütun × 4 satır tablo eklendi (önceki tabloyla birleşmedi)');
// Satır/sütun ekle-sil: "Tabloyu düzenle" menüsünde.
const edit = async (action) => { await teacher.click('#tableEditMenu summary'); await teacher.click(`[data-table="${action}"]`); };
await edit('insertRowBelow'); await edit('insertColumnRight');
ok(JSON.stringify(await lastTable()) === '[4,4,4,4,4]', 'alta satır ve sağa sütun eklendi');
await edit('deleteColumn'); await edit('deleteRow');
ok(JSON.stringify(await lastTable()) === '[3,3,3,3]', 'sütun ve satır silindi');
await edit('insertRowAbove'); await edit('insertColumnLeft');
ok(JSON.stringify(await lastTable()) === '[4,4,4,4,4]', 'üste satır ve sola sütun eklendi');
// Dolu bir satırın ortasındayken tablo: satır bölünmez, tablo altına gelir.
await teacher.keyboard.press('Control+End');
await teacher.keyboard.type('Vorher Nachher');
for (let i = 0; i < 8; i++) await teacher.keyboard.press('ArrowLeft');
await teacher.click('#tableMenu summary');
await teacher.click('#tableCell-1-2');
ok(await teacher.evaluate(() => { const p = [...document.querySelectorAll('#editor .ql-editor > p')].find((e) => e.textContent.includes('Vorher')); return p?.textContent === 'Vorher Nachher' && p.nextElementSibling?.tagName === 'TABLE'; }), 'satırın ortasındayken tablo satırı bölmüyor, altına ekleniyor');
// Bağlantı
await teacher.keyboard.press('Control+End');
await teacher.keyboard.type('Grammatik');
await teacher.keyboard.down('Shift'); for (let i = 0; i < 9; i++) await teacher.keyboard.press('ArrowLeft'); await teacher.keyboard.up('Shift');
await teacher.keyboard.press('Control+K');
await teacher.waitForSelector('#linkDialog[open]');
for (const bad of ['javascript:alert(1)', 'ftp://example.com', 'example.com', 'data:text/html,x']) {
  await teacher.fill('#linkUrl', bad); await teacher.press('#linkUrl', 'Enter');
  ok(await teacher.locator('#linkDialog[open]').count() === 1 && !(await teacher.locator('#linkError').isHidden()), `geçersiz bağlantı reddedildi: ${bad}`);
}
await teacher.fill('#linkUrl', 'https://bozkurtacademy.com/almanca-gramer/');
await teacher.press('#linkUrl', 'Enter');
const link = teacher.locator(`${ed} a`, { hasText: 'Grammatik' });
ok(await link.count() === 1 && await link.getAttribute('href') === 'https://bozkurtacademy.com/almanca-gramer/' && await link.getAttribute('target') === '_blank' && await link.getAttribute('rel') === 'noopener noreferrer', 'bağlantı eklendi: https, yeni sekme, noopener noreferrer');
await teacher.keyboard.press('Control+End');
await teacher.keyboard.press('Enter');

await waitFor(async () => (await saveState(teacher)).includes('Kaydedildi'), 8000);
await waitFor(async () => (await student.locator('#viewer table').count()) === 3 && (await student.locator('#viewer a').count()) === 1, 8000);
ok(await student.locator('#viewer .ba-c-kirmizi.ba-bg-sari').count() === 1 && await student.locator('#viewer h2').count() >= 1 && await student.locator('#viewer table').count() === 3 && await student.locator('#viewer table').nth(1).locator('tr').count() === 5, 'öğrenci biçimleri, başlığı ve tabloları görüyor');
const sLink = student.locator('#viewer a');
ok(await sLink.getAttribute('target') === '_blank' && await sLink.getAttribute('rel') === 'noopener noreferrer' && (await sLink.getAttribute('href')).startsWith('https://'), 'öğrencinin ekranında bağlantı yeni sekmede (noopener noreferrer)');

// ---- 6. Durmadan yazma: yazma sayısı ----
let revStart = Number((await noteDoc(noteId)).rev);
const typeStart = Date.now();
await teacher.click(ed); await teacher.keyboard.press('Control+End');
while (Date.now() - typeStart < 25000) await teacher.keyboard.type('a', { delay: 0 }).then(() => teacher.waitForTimeout(140));
const midRev = Number((await noteDoc(noteId)).rev);
ok(midRev - revStart >= 2 && midRev - revStart <= 4, `25 sn kesintisiz yazarken ${midRev - revStart} kayıt (en geç 10 sn'de bir; beklenen 2–4)`);
await waitFor(async () => (await saveState(teacher)).includes('Kaydedildi'), 5000);
const endRev = Number((await noteDoc(noteId)).rev);
ok(endRev - midRev === 1, 'yazma bitince son hâl bir kez daha kaydedildi');
console.log(`     hesap: 25 sn'de ${endRev - revStart} yazma → 1 saatlik kesintisiz yazmada ≈ ${Math.round((endRev - revStart) * 3600 / 27)} yazma`);

// ---- 7. Bağlantı kesilip gelme ----
await tctx.setOffline(true);
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('Offline geschrieben.');
await teacher.waitForTimeout(1000);
ok(await waitFor(async () => (await saveState(teacher)).includes('Bağlantı yok, bağlantı gelince kaydedilecek'), 9000), 'bağlantı yokken durum "Bağlantı yok, bağlantı gelince kaydedilecek"');
const backup = await teacher.evaluate((k) => localStorage.getItem(k), `baDersDefteri:ogrenci1:${noteId}`);
ok(backup && backup.includes('Offline geschrieben.'), 'kaydedilmemiş değişiklik yerel yedekte');
ok(!(await noteText(noteId)).includes('Offline geschrieben.'), 'bağlantı yokken sunucuda yok');
await teacher.waitForTimeout(3000);
await tctx.setOffline(false);
ok(await waitFor(async () => (await noteText(noteId)).includes('Offline geschrieben.'), 30000, 300), 'bağlantı gelince kaydedildi');
ok(await waitFor(async () => (await saveState(teacher)).includes('Kaydedildi ✓'), 10000), 'durum yeniden "Kaydedildi ✓"');
ok(await waitFor(async () => !(await teacher.evaluate((k) => localStorage.getItem(k), `baDersDefteri:ogrenci1:${noteId}`)), 4000), 'kayıttan sonra yerel yedek silindi');
ok(await waitFor(async () => (await student.textContent('#viewer')).includes('Offline geschrieben.'), 8000), 'öğrenci de çevrimdışı yazılanı görüyor');

// Bağlantı yokken sekme kapanırsa: yedek kalır, tekrar açınca geri yüklenir.
await tctx.setOffline(true);
await teacher.keyboard.press('Enter');
await teacher.keyboard.type('Vor dem Schließen.');
await teacher.waitForTimeout(1200);
await teacher.close({ runBeforeUnload: true });
await tctx.setOffline(false);
ok(!(await noteText(noteId)).includes('Vor dem Schließen.'), 'kapanan sekmenin son yazdığı sunucuya ulaşmadı');
let { page: teacher2 } = await newPage(1440, 'light', tctx);
await teacher2.goto(`${BASE}/ogretmen-ders.html?ogrenci=ogrenci1&not=${noteId}`);
await teacher2.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
ok(await waitFor(async () => !(await teacher2.locator('#backupBanner').isHidden()), 3000), 'tekrar açınca "kaydedilmemiş değişiklikler bulundu" uyarısı');
await teacher2.click('#backupRestore');
ok(await waitFor(async () => (await noteText(noteId)).includes('Vor dem Schließen.'), 10000), 'geri yükle: kayıp olmadan sunucuya kaydedildi');

// ---- 8. Aynı notu ikinci sekmede açmak ----
const { page: tab2 } = await newPage(1440, 'light', tctx);
await tab2.goto(`${BASE}/ogretmen-ders.html?ogrenci=ogrenci1&not=${noteId}`);
await tab2.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
await tab2.waitForTimeout(500);
ok(!(await tab2.locator('#tabBanner').isHidden()) && await tab2.evaluate(() => document.querySelector('#editor .ql-editor').getAttribute('contenteditable') === 'false'), 'ikinci sekme salt okunur ve uyarı gösteriyor');
await tab2.click('#tabTakeover');
ok(await waitFor(async () => !(await teacher2.locator('#tabBanner').isHidden()), 10000) && await waitFor(async () => (await tab2.locator('#tabBanner').isHidden()), 10000), '"Burada düzenle": düzenleme ikinci sekmeye geçti, ilki salt okunur');
await tab2.click(ed); await tab2.keyboard.press('Control+End'); await tab2.keyboard.type(' Zweiter Tab.');
ok(await waitFor(async () => (await noteText(noteId)).includes('Zweiter Tab.'), 8000), 'ikinci sekmeden kayıt');
await teacher2.close();
teacher2 = tab2;

// ---- 9. Başlık düzenleme ----
await teacher2.click('#noteTitle');
await teacher2.fill('#noteTitle', 'Perfekt mit haben und sein');
await teacher2.press('#noteTitle', 'Enter');
ok(await waitFor(async () => (await noteDoc(noteId)).title === 'Perfekt mit haben und sein', 6000), 'başlık tıklayınca düzenlenip kaydedildi');
ok(await waitFor(async () => (await student.textContent('#noteHeading')) === 'Perfekt mit haben und sein', 8000), 'öğrenci yeni başlığı görüyor');

// ---- 10. Google Docs'tan yapıştırma ----
const GDOCS = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1234abcd-7fff-ffff-ffff-123456789abc"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:transparent;font-weight:700;font-style:normal;vertical-align:baseline;white-space:pre-wrap;">Artikel-Tabelle</span></p><br><div dir="ltr" style="margin-left:0pt;" align="left"><table style="border:none;border-collapse:collapse;"><colgroup><col width="120"><col width="120"><col width="120"></colgroup><tbody><tr style="height:0pt"><td style="border-left:solid #000000 1pt;border-right:solid #000000 1pt;border-bottom:solid #000000 1pt;border-top:solid #000000 1pt;vertical-align:top;padding:5pt 5pt 5pt 5pt;overflow:hidden;overflow-wrap:break-word;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;font-weight:700;white-space:pre-wrap;">Kasus</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;font-weight:700;white-space:pre-wrap;">maskulin</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;font-weight:700;white-space:pre-wrap;">feminin</span></p></td></tr><tr style="height:0pt"><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;white-space:pre-wrap;">Nominativ</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#ff0000;white-space:pre-wrap;">der</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;color:#000000;background-color:#ffff00;white-space:pre-wrap;">die</span></p></td></tr><tr style="height:0pt"><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;white-space:pre-wrap;">Akkusativ</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;white-space:pre-wrap;">den</span></p></td><td style="border:solid #000000 1pt;vertical-align:top;padding:5pt;"><p dir="ltr" style="line-height:1.2;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial,sans-serif;white-space:pre-wrap;">die</span></p></td></tr></tbody></table></div></b>`;
const GDOCS_MULTI = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-5678"><div dir="ltr"><table><tbody><tr><td><p dir="ltr"><span>Satz 1</span></p><p dir="ltr"><span>Satz 2</span></p></td><td><p dir="ltr"><span>B</span></p></td></tr><tr><td colspan="2"><p dir="ltr"><span>birleşik hücre</span></p></td></tr></tbody></table></div><p dir="ltr"><img src="https://lh3.googleusercontent.com/x.png" onerror="window.__xss=1"><span>Nach der Tabelle</span></p></b>`;
const GDOCS_LIST = `<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-9"><ul style="margin-top:0;margin-bottom:0;"><li dir="ltr" style="list-style-type:disc;" aria-level="1"><p dir="ltr" role="presentation"><span>ich habe</span></p></li><li dir="ltr" style="list-style-type:disc;" aria-level="1"><p dir="ltr" role="presentation"><span style="font-weight:700;">du hast</span></p></li></ul><h1 dir="ltr"><span>Überschrift 1</span></h1><p dir="ltr"><a href="https://www.duden.de/" style="text-decoration:none;"><span style="color:#1155cc;text-decoration:underline;">Duden</span></a> <a href="javascript:alert(1)"><span>böse</span></a></p></b>`;
const tablesBefore = await teacher2.locator('#editor table').count();
await teacher2.click(ed); await teacher2.keyboard.press('Control+End'); await teacher2.keyboard.press('Enter');
await paste(teacher2, { html: GDOCS, text: 'Artikel-Tabelle\nKasus\tmaskulin\tfeminin' });
await teacher2.waitForTimeout(300);
const gTable = await teacher2.evaluate((n) => { const t = document.querySelectorAll('#editor table')[n]; return t ? [...t.querySelectorAll('tr')].map((tr) => [...tr.children].map((td) => td.textContent)) : null; }, tablesBefore);
console.log('     Google Docs tablosu →', JSON.stringify(gTable));
ok(JSON.stringify(gTable) === JSON.stringify([['Kasus', 'maskulin', 'feminin'], ['Nominativ', 'der', 'die'], ['Akkusativ', 'den', 'die']]), 'Google Docs: basit tablo (3×3) bozulmadan yapıştı');
ops = await editorOps(teacher2);
ok(ops.find((o) => o.insert === 'Artikel-Tabelle')?.attributes?.bold === true, 'Google Docs: kalın yazı korunuyor');
ok(!ops.some((o) => o.attributes && (o.attributes.color || o.attributes.background) && !['kirmizi', 'mavi', 'yesil', 'turuncu', 'mor', 'gri', 'sari', 'pembe'].includes(o.attributes.color || o.attributes.background)), 'Google Docs: palet dışı renk kalmadı');
ok(ops.some((o) => o.insert === 'der' && o.attributes?.color === 'kirmizi') && ops.find((o) => o.insert === 'die' && o.attributes?.background)?.attributes?.background === 'sari' && !ops.some((o) => o.insert === 'Nominativ' && o.attributes?.color), 'Google Docs: kırmızı yazı ve sarı vurgu palete çevrildi, siyah atıldı');
ok(await teacher2.evaluate(() => ![...document.querySelectorAll('#editor .ql-editor *')].some((e) => e.getAttribute('style'))), 'Google Docs: satır içi stil kalmadı');
await teacher2.keyboard.press('Control+End'); await teacher2.keyboard.press('Enter');
ok(await teacher2.evaluate(() => { const last = document.querySelector('#editor .ql-editor').lastElementChild; return last.tagName === 'P'; }), 'tablo en sonda kalınca altında boş satır var (imleç tablodan çıkabiliyor)');
await teacher2.keyboard.press('Control+End');
expectInlineBlock = true;
await paste(teacher2, { html: GDOCS_MULTI, text: 'Satz 1\nSatz 2\tB' });
await teacher2.waitForTimeout(300);
expectInlineBlock = false;
console.log(`     yapıştırılan onerror=… CSP tarafından ${blockedInline} kez engellendi`);
const mTable = await teacher2.evaluate(() => { const t = [...document.querySelectorAll('#editor table')].find((x) => x.textContent.includes('Satz 1')); return t ? [...t.querySelectorAll('tr')].map((tr) => [...tr.children].map((td) => td.textContent)) : null; });
console.log('     Google Docs: çok paragraflı hücre + birleşik hücre →', JSON.stringify(mTable));
ok(JSON.stringify(mTable[0]) === JSON.stringify(['Satz 1 / Satz 2', 'B']), 'Google Docs: çok paragraflı hücre tek hücrede kalıyor (paragraflar " / " ile)');
ok(JSON.stringify(mTable[1]) === JSON.stringify(['birleşik hücre', '']), 'Google Docs: birleşik hücre birleşik kalmıyor (metin ilk hücrede, yanına boş hücre) – Quill 2 sınırı');
ok(await teacher2.locator('#editor img').count() === 0 && await teacher2.evaluate(() => !window.__xss), 'Google Docs: resim ve onerror atıldı');
ok((await teacher2.textContent(ed)).includes('Nach der Tabelle'), 'Google Docs: tablodan sonraki metin korunuyor');
// Dosya olarak resim yapıştırma (ekran görüntüsü): eklenmez.
const imgCount = await teacher2.evaluate(() => {
  const dt = new DataTransfer();
  dt.items.add(new File([new Uint8Array([137, 80, 78, 71])], 'ekran.png', { type: 'image/png' }));
  document.querySelector('#editor .ql-editor').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  return new Promise((r) => setTimeout(() => r(document.querySelectorAll('#editor img').length), 500));
});
ok(imgCount === 0, 'yapıştırılan resim dosyası eklenmiyor');
await teacher2.keyboard.press('Control+End'); await teacher2.keyboard.press('Enter');
await paste(teacher2, { html: GDOCS_LIST, text: 'ich habe\ndu hast' });
await teacher2.waitForTimeout(300);
ops = await editorOps(teacher2);
const la = (text) => { const i = ops.findIndex((o) => o.insert === text || o.insert.startsWith(text)); return ops.slice(i + 1).find((o) => o.insert.includes('\n'))?.attributes || {}; };
const gl = await teacher2.evaluate(() => [...document.querySelectorAll('#editor li[data-list="bullet"]')].map((li) => [li.textContent, Boolean(li.querySelector('strong'))].join()));
ok(gl.includes('ich habe,false') && gl.includes('du hast,true'), 'Google Docs: madde listesi ve kalın korunuyor');
ok(await teacher2.evaluate(() => [...document.querySelectorAll('#editor h2')].some((e) => e.textContent === 'Überschrift 1')), 'Google Docs: Başlık 1 → bizim "Başlık" (H2)');
ok(ops.find((o) => o.insert === 'Duden')?.attributes?.link === 'https://www.duden.de/' && !ops.some((o) => String(o.attributes?.link || '').startsWith('javascript')), 'Google Docs: https bağlantısı kaldı, javascript: bağlantısı atıldı');
ok(await waitFor(async () => (await saveState(teacher2)).includes('Kaydedildi'), 8000), 'yapıştırma sonrası kaydedildi');
const pasteSaved = JSON.parse((await noteDoc(noteId)).content).ops;
ok(!JSON.stringify(pasteSaved).includes('javascript:') && !JSON.stringify(pasteSaved).includes('#ff0000'), 'kaydedilen içerikte javascript: ve ham renk yok');

// ---- 11. Boyut uyarısı ----
const bigText = ('Lorem ipsum dolor sit amet. '.repeat(40) + '\n').repeat(700); // ≈ 790 KB
await teacher2.keyboard.press('Control+End');
await paste(teacher2, { text: bigText });
ok(await waitFor(async () => !(await teacher2.locator('#sizeWarn').isHidden()), 8000) && (await teacher2.textContent('#sizeWarn')).includes('Not büyüyor'), '700 KB üstünde "Not büyüyor" uyarısı');
await waitFor(async () => (await saveState(teacher2)).includes('Kaydedildi'), 15000);
await paste(teacher2, { text: bigText.slice(0, 140_000) });

ok(await waitFor(async () => (await teacher2.textContent('#sizeWarn')).includes('sınıra çok yakın'), 8000) && await teacher2.locator('#sizeWarn.error').count() === 1, `900 KB üstünde "Yeni sayfa aç" uyarısı (${await teacher2.textContent('#sizeInfo')} · ${await teacher2.textContent('#sizeWarn')})`);
await waitFor(async () => (await saveState(teacher2)).includes('Kaydedildi'), 15000);
const revBeforeOver = Number((await noteDoc(noteId)).rev);
await paste(teacher2, { text: bigText.slice(0, 200_000) });
ok(await waitFor(async () => (await saveState(teacher2)).includes('Not çok büyük'), 8000) && (await teacher2.textContent('#sizeWarn')).includes('sunucuya kaydedilmiyor'), '1.000.000 baytı geçince kayıt duruyor, uyarı gösteriliyor');
await teacher2.waitForTimeout(3000);
ok(Number((await noteDoc(noteId)).rev) === revBeforeOver, 'sınır aşılınca sunucuya yazılmadı');
ok((await teacher2.evaluate((k) => localStorage.getItem(k) || '', `baDersDefteri:ogrenci1:${noteId}`)).length > 1_000_000, 'sınırı aşan hâl yerel yedekte');
for (let i = 0; i < 3; i++) await teacher2.keyboard.press('Control+Z');
ok((await teacher2.inputValue('#noteTitle')) === 'Perfekt mit haben und sein', 'Ctrl+Z başlık kutusundaki eski düzenlemeyi geri almıyor');
ok(await waitFor(async () => (await saveState(teacher2)).includes('Kaydedildi'), 15000) && (await teacher2.locator('#sizeWarn').isHidden()), 'geri alınca kayıt devam ediyor, uyarı kalkıyor');
ok(!(await noteText(noteId)).includes('Lorem ipsum'), 'büyük metin geri alındı ve kaydedildi');

// ---- 12. XSS: Firestore'a doğrudan yazılmış kötü içerik öğrencide çalışmaz ----
const evil = { ops: [
  { insert: '<script>window.__xss=1</script><img src=x onerror="window.__xss=2">' },
  { insert: 'tıkla', attributes: { link: 'javascript:window.__xss=3' } },
  { insert: 'veri', attributes: { link: 'data:text/html,<script>parent.__xss=4</script>' } },
  { insert: { image: 'javascript:window.__xss=5' } },
  { insert: { video: 'https://evil.example/' } },
  { insert: 'stil', attributes: { color: 'red;background:url(https://evil.example/x)', background: 'url(javascript:alert(1))', class: 'x', style: 'position:fixed' } },
  { insert: '\n', attributes: { table: 'row-"><img src=x onerror=window.__xss=6>' } },
  { insert: 'iyi', attributes: { link: 'https://example.com/ok' } }, { insert: '\n' }
] };
await patch('users/ogrenci1/lessonNotes/kotu', { fields: { title: { stringValue: '<img src=x onerror="window.__xss=7">Kötü' }, day: { stringValue: '2026-01-01' }, content: { stringValue: JSON.stringify(evil) }, rev: { integerValue: '1' }, updatedAt: { timestampValue: new Date(Date.now() - 864e5).toISOString() } } });
await patch('users/ogrenci1/lessonNotes/bozuk', { fields: { title: { stringValue: 'Bozuk' }, day: { stringValue: '2026-01-02' }, content: { stringValue: '{bozuk json' }, rev: { integerValue: '1' } } });
const { ctx: xctx, page: xs } = await newPage(1440);
await signIn(xs, 'ogrenci@example.com', 'ogrenci123', 'student');
await xs.goto(`${BASE}/ders-notlarim.html?not=kotu`);
await xs.waitForSelector('#noteView:not([hidden])', { timeout: 15000 });
await xs.waitForTimeout(800);
const xssState = await xs.evaluate(() => ({
  flag: window.__xss, scripts: document.querySelectorAll('#viewer script, #noteHeading script').length, imgs: document.querySelectorAll('#viewer img, #noteHeading img, #viewer iframe').length,
  badLinks: [...document.querySelectorAll('#viewer a')].filter((a) => !/^https:\/\//.test(a.getAttribute('href'))).length,
  links: [...document.querySelectorAll('#viewer a')].map((a) => a.getAttribute('href')),
  styles: [...document.querySelectorAll('#viewer .ql-editor *')].filter((e) => e.getAttribute('style')).length,
  onAttrs: [...document.querySelectorAll('#viewer *, #noteHeading *')].filter((e) => [...e.attributes].some((a) => a.name.startsWith('on'))).length,
  heading: document.querySelector('#noteHeading').textContent, text: document.querySelector('#viewer').textContent
}));
ok(!xssState.flag && !xssState.scripts && !xssState.imgs && !xssState.onAttrs && !xssState.styles, 'XSS: script, img, iframe, on…= ve stil öğrencinin ekranına girmiyor');
ok(xssState.badLinks === 0 && JSON.stringify(xssState.links) === JSON.stringify(['https://example.com/ok']), 'XSS: javascript: ve data: bağlantıları atıldı, https kaldı');
ok(xssState.heading.startsWith('<img') && xssState.text.includes('<script>'), 'XSS: başlıktaki ve metindeki HTML yalnızca yazı olarak görünüyor');
await xs.goto(`${BASE}/ders-notlarim.html?not=bozuk`);
await xs.waitForSelector('#noteView:not([hidden])', { timeout: 15000 });
ok((await xs.textContent('#noteHeading')) === 'Bozuk', 'bozuk içerikli not hata vermeden (boş) açılıyor');
await xs.goto(`${BASE}/ders-notlarim.html?not=baskasinin`);
await xs.waitForSelector('#noteView:not([hidden]), #notesError:not([hidden])', { timeout: 15000 });
ok(!(await xs.locator('#noteMissing').isHidden()), 'olmayan not: "bulunamadı" mesajı');
await xctx.close();
// Diğer öğrenci Deniz'in notunu açamaz.
const { ctx: octx, page: other } = await newPage(1440);
await signIn(other, 'ikinci@example.com', 'ogrenci123', 'student');
const otherRead = await other.evaluate(async (id) => {
  const { db, fs } = await import('/js/account/firebase.js');
  try { await fs.getDoc(fs.doc(db, 'users', 'ogrenci1', 'lessonNotes', id)); return 'okundu'; } catch (e) { return e.code; }
}, noteId);
ok(otherRead === 'permission-denied', 'başka öğrenci notu okuyamıyor');
await other.goto(`${BASE}/ders-notlarim.html`);
await other.waitForSelector('#notesListView:not([hidden])', { timeout: 15000 });
ok((await other.textContent('#notesList')).includes('Henüz ders notun yok'), 'başka öğrencinin listesinde Deniz\'in notları yok');
await octx.close();
// Onay bekleyen öğrenci
const { ctx: pctx, page: pend } = await newPage(390);
await signIn(pend, 'bekleyen@example.com', 'ogrenci123', 'student');
await pend.goto(`${BASE}/ders-notlarim.html`);
await pend.waitForSelector('#notesInactive:not([hidden])', { timeout: 15000 });
ok(true, 'onay bekleyen öğrenci: "hesabın onaylandıktan sonra" mesajı');
await pctx.close();

// ---- 13. Yazı boyutu, tam ekran, yazdırma ----
await teacher2.click('#sizeUp'); await teacher2.click('#sizeUp');
ok(await teacher2.evaluate(() => getComputedStyle(document.querySelector('#noteCard')).getPropertyValue('--note-scale').trim()) === '1.25' && (await teacher2.textContent('#sizeLabel')) === '125 %', 'A+ yazıyı büyütüyor (görünüm)');
ok(Number((await noteDoc(noteId)).rev) === Number((await noteDoc(noteId)).rev) && !(await noteDoc(noteId)).content.includes('scale'), 'yazı boyutu nota kaydedilmiyor');
await teacher2.reload(); await teacher2.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
ok((await teacher2.textContent('#sizeLabel')) === '125 %', 'yazı boyutu tarayıcıda hatırlanıyor');
await teacher2.click('#sizeDown'); await teacher2.click('#sizeDown');
await teacher2.click('#fullBtn');
await teacher2.waitForTimeout(400);
ok(await teacher2.evaluate(() => document.fullscreenElement?.id === 'noteCard' || document.body.classList.contains('note-fullscreen')) && (await teacher2.textContent('#fullBtn')) === 'Tam ekrandan çık', 'tam ekran açılıyor');
await teacher2.click('#fullBtn');
await teacher2.waitForTimeout(300);
ok(await teacher2.evaluate(() => !document.fullscreenElement && !document.body.classList.contains('note-fullscreen')), 'tam ekrandan çıkılıyor');
await teacher2.emulateMedia({ media: 'print' });
const printView = await teacher2.evaluate(() => ({
  hidden: ['.topbar', 'footer', '#noteToolbar', '.note-view-actions', '#saveState', '.acc-back'].every((s) => { const e = document.querySelector(s); return !e || !e.checkVisibility(); }),
  meta: document.querySelector('#notePrintMeta').checkVisibility() && document.querySelector('#notePrintMeta').textContent.includes('Deniz Kaya'),
  table: getComputedStyle(document.querySelector('#editor td')).borderTopStyle === 'solid'
}));
console.log('     yazdırma:', JSON.stringify(printView));
ok(printView.hidden && printView.meta && printView.table, 'yazdırma görünümü: menü, araç çubuğu ve durum gizli; öğrenci adı ve tarih var; tablo kenarlıklı');
await teacher2.pdf({ path: path.join(shotDir, 'ders-notu.pdf'), format: 'A4' }).catch(() => {});
await teacher2.emulateMedia({ media: 'screen' });
await student.emulateMedia({ media: 'print' });
ok(await student.evaluate(() => ['.topbar', 'footer', '.note-view-actions', '#liveHint'].every((s) => { const e = document.querySelector(s); return !e || !e.checkVisibility(); })), 'öğrencinin yazdırma görünümü sade');
await student.emulateMedia({ media: 'screen' });

// ---- 13b. Yapışkan araç çubuğu: uzun notta aşağı inince çubuk ve kayıt durumu görünür, imleçteki satırı örtmez ----
const stickyState = (pg) => pg.evaluate(() => {
  const q = window.Quill.find(document.querySelector('#editor'));
  const tb = document.querySelector('#noteToolbar').getBoundingClientRect();
  const save = document.querySelector('#saveState').getBoundingClientRect();
  const full = document.fullscreenElement === document.querySelector('#noteCard') || document.body.classList.contains('note-fullscreen');
  const topbar = full ? 0 : document.querySelector('.topbar').getBoundingClientRect().bottom;
  const sel = q.getSelection();
  const b = sel ? q.getBounds(sel.index) : null;
  const root = q.root.getBoundingClientRect();
  const caret = b ? { top: root.top + b.top, bottom: root.top + b.top + b.height } : null;
  const hit = document.elementFromPoint(tb.left + 20, tb.top + tb.height / 2);
  return {
    scrolled: Math.max(scrollY, document.querySelector('#noteCard').scrollTop), toolbarTop: Math.round(tb.top), toolbarBottom: Math.round(tb.bottom), topbar: Math.round(topbar),
    toolbarOnTop: Boolean(hit?.closest('#noteToolbar')), saveVisible: save.top >= topbar - 1 && save.bottom <= innerHeight && save.height > 0,
    caret, caretVisible: Boolean(caret && caret.top >= tb.bottom - 1 && caret.bottom <= innerHeight), vh: innerHeight
  };
});
await teacher2.goto(`${BASE}/ogretmen-ders.html?ogrenci=ogrenci1&not=${noteId}`);
await teacher2.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
await teacher2.click(ed); await teacher2.keyboard.press('Control+End');
await paste(teacher2, { text: Array.from({ length: 120 }, (_, i) => `Satz ${i + 1}: Ich habe heute Deutsch gelernt.`).join('\n') });
await teacher2.keyboard.press('Control+End');
await teacher2.keyboard.type(' Ende');
await teacher2.waitForTimeout(300);
let st = await stickyState(teacher2);
console.log('     yapışkan (sayfa sonu):', JSON.stringify(st));
ok(st.scrolled > 1500 && Math.abs(st.toolbarTop - st.topbar) <= 8 && st.toolbarOnTop, 'uzun notta aşağı inince araç çubuğu üst menünün hemen altında, üstünde başka bir şey yok');
ok(st.saveVisible, 'kayıt durumu da görünür kalıyor');
ok(st.caretVisible, 'en altta yazarken imleçteki satır görünür (çubuk örtmüyor)');
await waitFor(async () => (await saveState(teacher2)).includes('Kaydedildi'), 8000);
ok((await teacher2.textContent('#saveState')).includes('Kaydedildi ✓') && (await stickyState(teacher2)).saveVisible, '"Kaydedildi ✓" aşağıdayken de görünüyor');
await teacher2.screenshot({ path: path.join(shotDir, 'yapiskan-cubuk-1440-acik.png') });
// Yukarı doğru imleçle gidince satır çubuğun altında kalmamalı.
for (let i = 0; i < 40; i++) await teacher2.keyboard.press('ArrowUp');
st = await stickyState(teacher2);
ok(st.caretVisible && Math.abs(st.toolbarTop - st.topbar) <= 8, `yukarı çıkarken imleçteki satır çubuğun altında kalmıyor (imleç ${Math.round(st.caret?.top)} px, çubuk altı ${st.toolbarBottom} px)`);
// Koyu tema
await teacher2.evaluate(() => { localStorage.setItem('ba-theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); });
await teacher2.keyboard.press('Control+End');
await teacher2.waitForTimeout(200);
st = await stickyState(teacher2);
ok(st.toolbarOnTop && st.saveVisible && await teacher2.evaluate(() => getComputedStyle(document.querySelector('#noteSticky')).backgroundColor !== 'rgba(0, 0, 0, 0)'), 'koyu temada çubuk yapışık ve arka planı dolu (metin altından görünmüyor)');
await teacher2.screenshot({ path: path.join(shotDir, 'yapiskan-cubuk-1440-koyu.png') });
// Tam ekran
await teacher2.click('#fullBtn');
await teacher2.waitForTimeout(400);
await teacher2.click(ed); await teacher2.keyboard.press('Control+End'); await teacher2.keyboard.type('!');
await teacher2.waitForTimeout(300);
st = await stickyState(teacher2);
console.log('     yapışkan (tam ekran):', JSON.stringify(st));
ok(st.scrolled > 1500 && st.toolbarTop <= 8 && st.toolbarOnTop && st.saveVisible && st.caretVisible, 'tam ekranda da araç çubuğu ve kayıt durumu üstte, imleçteki satır görünür');
await teacher2.screenshot({ path: path.join(shotDir, 'yapiskan-cubuk-tam-ekran-1440-koyu.png') });
await teacher2.click('#fullBtn');
await teacher2.waitForTimeout(300);
// Telefon genişliği
await teacher2.setViewportSize({ width: 390, height: 844 });
await teacher2.click(ed); await teacher2.keyboard.press('Control+End'); await teacher2.keyboard.type('?');
await teacher2.waitForTimeout(400);
st = await stickyState(teacher2);
ok(Math.abs(st.toolbarTop - st.topbar) <= 8 && st.toolbarOnTop && st.saveVisible && st.caretVisible && st.toolbarBottom - st.toolbarTop < 70, `390: çubuk tek satır (${st.toolbarBottom - st.toolbarTop} px), yapışık, imleç görünür`);
ok(await noOverflow(teacher2), '390: uzun notta yatay taşma yok');
await teacher2.screenshot({ path: path.join(shotDir, 'yapiskan-cubuk-390-koyu.png') });
await teacher2.setViewportSize({ width: 1440, height: 900 });
await teacher2.evaluate(() => { localStorage.setItem('ba-theme', 'light'); document.documentElement.setAttribute('data-theme', 'light'); });
// Uzun metni geri al (sonraki adımlar kısa notla devam etsin).
await teacher2.keyboard.press('Control+Z'); await teacher2.keyboard.press('Control+Z'); await teacher2.keyboard.press('Control+Z'); await teacher2.keyboard.press('Control+Z');
await waitFor(async () => !(await teacher2.textContent(ed)).includes('Satz 120'), 3000);
await waitFor(async () => (await saveState(teacher2)).includes('Kaydedildi'), 8000);

// ---- 14. Takvimden açma ----
await teacher2.goto(`${BASE}/ogretmen-takvim.html`);
await teacher2.waitForSelector('[data-lesson], .cal-lesson, .acc-cal-lesson', { timeout: 15000 }).catch(() => {});
const lessonButton = teacher2.locator('button', { hasText: 'Deniz Kaya' }).first();
if (await lessonButton.count()) {
  await lessonButton.click();
  await teacher2.waitForSelector('#lessonNoteLink', { timeout: 5000 }).catch(() => {});
  ok((await teacher2.getAttribute('#lessonNoteLink', 'href')) === 'ogretmen-ders.html?ogrenci=ogrenci1&ders=ders1', 'takvimdeki ders penceresinde "Ders defteri" bağlantısı');
  await teacher2.click('#lessonNoteLink');
  await teacher2.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
  ok(new URL(teacher2.url()).searchParams.get('not') === noteId, 'takvimden açınca o derse bağlı mevcut not açılıyor');
} else ok(false, 'takvimde ders bulunamadı');
await teacher2.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`);
await teacher2.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
ok((await teacher2.textContent('#startLessonLink')).trim() === 'Bugünün notunu aç' && (await teacher2.textContent('#newNoteLink')).trim() === 'Yeni sayfa', 'bugünün notu varsa "Bugünün notunu aç" ve "Yeni sayfa"');
ok(await teacher2.locator('.note-teacher-list li').count() === 3, 'öğretmenin listesinde eski notlar');

// ---- 15. Ekran görüntüleri: 390/1440 × açık/koyu ----
for (const theme of ['light', 'dark']) {
  for (const width of [390, 1440]) {
    const { ctx: mt, page: tp } = await newPage(width, theme);
    await signIn(tp, 'ogretmen@example.com', 'ogretmen123', 'teacher');
    await tp.goto(`${BASE}/ogretmen-ders.html?ogrenci=ogrenci1&not=${noteId}`);
    await tp.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
    await tp.waitForTimeout(400);
    ok(await noOverflow(tp), `${width} ${theme}: öğretmenin ders sayfası taşmıyor`);
    ok(await tp.evaluate(() => { const t = document.querySelector('#noteTitle'); return t.scrollHeight <= t.clientHeight + 2 && t.scrollWidth <= t.clientWidth + 1; }), `${width} ${theme}: başlık kesilmeden görünüyor`);
    await shot(tp, `ogretmen-ders-${width}-${theme}`);
    await tp.click('#editor .ql-editor'); await tp.keyboard.press('Control+End');
    await tp.click('#tableMenu summary');
    await tp.hover('#tableCell-4-3');
    ok(await tp.evaluate(() => { const r = document.querySelector('#tableMenu .note-menu-panel').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight; }), `${width} ${theme}: tablo ızgarası ekrana sığıyor`);
    await tp.screenshot({ path: path.join(shotDir, `ogretmen-ders-tablo-menusu-${width}-${theme}.png`) });
    await tp.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1`);
    await tp.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
    await tp.locator('#ders-notlari').screenshot({ path: path.join(shotDir, `ogretmen-ogrenci-notlar-${width}-${theme}.png`) });
    await mt.close();
    const { ctx: ms, page: sp } = await newPage(width, theme);
    await signIn(sp, 'ogrenci@example.com', 'ogrenci123', 'student');
    await sp.goto(`${BASE}/ders-notlarim.html`);
    await sp.waitForSelector('.note-list-item', { timeout: 15000 });
    ok(await noOverflow(sp), `${width} ${theme}: öğrencinin not listesi taşmıyor`);
    await shot(sp, `ders-notlarim-liste-${width}-${theme}`);
    await sp.goto(`${BASE}/ders-notlarim.html?not=${noteId}`);
    await sp.waitForSelector('#noteView:not([hidden])', { timeout: 15000 });
    await sp.waitForTimeout(300);
    ok(await noOverflow(sp), `${width} ${theme}: öğrencinin not görünümü taşmıyor`);
    await shot(sp, `ders-notlarim-not-${width}-${theme}`);
    await sp.goto(`${BASE}/panel.html`);
    await sp.waitForSelector('#notesSection:not([hidden])', { timeout: 15000 });
    ok((await sp.textContent('#notesList')).includes('Perfekt mit haben und sein'), `${width} ${theme}: panelde "Ders notlarım" bölümü`);
    await sp.locator('#notesSection').screenshot({ path: path.join(shotDir, `panel-notlar-${width}-${theme}.png`) });
    await ms.close();
  }
}
// Almanca ve İngilizce arayüz (hitap "du")
{
  const { ctx: lc, page: lp } = await newPage(1440);
  await signIn(lp, 'ogrenci@example.com', 'ogrenci123', 'student');
  await lp.goto(`${BASE}/ders-notlarim.html`);
  await lp.waitForSelector('.note-list-item', { timeout: 15000 });
  await lp.click('[data-lang="de"]');
  ok((await lp.textContent('#notesHeading')) === 'Meine Unterrichtsnotizen' && (await lp.textContent('#notesCount')).includes('Unterrichtsnotizen'), 'Almanca arayüz');
  await lp.click('[data-lang="en"]');
  ok((await lp.textContent('#notesHeading')) === 'My lesson notes', 'İngilizce arayüz');
  await lp.click('[data-lang="tr"]');
  await lc.close();
}

// ---- 16. Silme ----
await teacher2.goto(`${BASE}/ogretmen-ders.html?ogrenci=ogrenci1&not=kotu`);
await teacher2.waitForSelector('#noteApp:not([hidden])', { timeout: 15000 });
await teacher2.click('#deleteBtn');
await teacher2.waitForURL(/ogretmen-ogrenci\.html/, { timeout: 10000 });
ok(await noteDoc('kotu') === null, 'ders sayfasından silme');
await teacher2.waitForSelector('#studentApp:not([hidden])', { timeout: 15000 });
await teacher2.locator('.note-teacher-list li', { hasText: 'Perfekt mit haben und sein' }).locator('button', { hasText: 'Sil' }).click();
ok(await waitFor(async () => (await noteDoc(noteId)) === null, 6000), 'öğrenci sayfasındaki listeden silme');
ok(await waitFor(async () => !(await student.locator('#noteMissing').isHidden()), 8000), 'silinen not öğrencinin açık ekranında "bulunamadı" oluyor');

await browser.close();
server.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED:\n  ${fails.join('\n  ')}` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
