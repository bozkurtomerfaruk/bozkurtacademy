// Ödevler (Classroom düzeni), hesap tarafı (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:odev
// Eski biçimli bir ödev (docUrl) yeni sayfalarda görünür → öğretmen "+ Oluştur" ile tarih başlıklı, bağlantılı
// (YouTube, http, Docs kopya), konunun tamamı + sınav seti içeren, teslim tarihsiz ödevi bir öğrenciye verir →
// düzenler (başlık, bağlantı, ikinci öğrenci) → eski ödevi düzenler (docUrl → links, işaret korunur) → öğrenci
// odevlerim.html'de tarih başlıklarını, bağlantıları, paket durumlarını görür ve "Tamamladım" der → panel özeti.
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
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'odev-account-'));

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
  && [...document.querySelectorAll('.odev-item, .acc-card')].every((c) => {
    const right = c.getBoundingClientRect().right + 1;
    return [...c.querySelectorAll('*')].every((e) => !e.getClientRects().length || e.getBoundingClientRect().right <= right);
  }));
const berlinLabel = (d) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
const TODAY = berlinLabel(new Date());
const OLD = new Date(Date.now() - 10 * 864e5);

// 0. Eski biçimli ödev (schemaVersion yok, docUrl + copyPerStudent), 10 gün önce verilmiş, öğrenci tamamlamış.
await fetch(`${docsUrl}/users/ogrenci1/assignments/eski1`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: {
  title: { stringValue: 'Eski Akkusativ ödevi' }, description: { stringValue: 'Eski açıklama' },
  dueAt: { timestampValue: new Date(OLD.getTime() + 3 * 864e5).toISOString() }, createdAt: { timestampValue: OLD.toISOString() },
  exercises: { arrayValue: { values: [{ mapValue: { fields: { level: { stringValue: 'A1' }, topic: { stringValue: 'artikel' }, exercise: { stringValue: 'kontext-1' } } } }] } },
  docUrl: { stringValue: 'https://docs.google.com/document/d/eski/copy' }, copyPerStudent: { booleanValue: true }, groupId: { stringValue: 'eski-grup' },
  done: { booleanValue: true }, doneAt: { timestampValue: new Date(OLD.getTime() + 864e5).toISOString() }, studentDocUrl: { stringValue: '' }
} }) });

// 1. Öğretmen: ödev sayfası, eski ödev yeni düzende.
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen-odevler.html?ogrenci=ogrenci1`); await teacher.waitForSelector('#listApp:not([hidden])', { timeout: 15000 });
await teacher.waitForSelector('.odev-item', { timeout: 15000 });
ok((await teacher.textContent('.odev-day-title')) === berlinLabel(OLD), `eski ödev verildiği günün başlığı altında (${berlinLabel(OLD)})`);
ok(await teacher.locator('.odev-item a.odev-chip[href="https://docs.google.com/document/d/eski/copy"]').count() === 1, 'eski docUrl bağlantı olarak görünüyor');
ok((await teacher.textContent('#studentSelect')).includes('Deniz Kaya') && !(await teacher.textContent('#studentSelect')).includes('Ece Bekler'), 'öğrenci seçiminde sadece hesabı açık öğrenciler');
ok((await teacher.getAttribute('#createLink', 'href')) === 'ogretmen-odev.html?ogrenci=ogrenci1', '"+ Oluştur" seçili öğrenciyle açılıyor');

// 2. Yeni ödev formu.
await teacher.click('#createLink'); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok((await teacher.inputValue('#aTitle')) === TODAY, `başlık varsayılan olarak bugünün tarihi (${TODAY})`);
ok((await teacher.inputValue('#aDue')) === '', 'teslim tarihi varsayılan olarak boş');
ok(await teacher.locator('input[name="student"][value="ogrenci1"]').isChecked(), 'seçili öğrenci işaretli');
// Boş gönderim
await teacher.fill('#aTitle', TODAY);
await teacher.click('#aSubmit');
ok((await teacher.textContent('#aStatus')).includes('en az bir alıştırma'), 'boş ödev reddediliyor');
// Geçersiz bağlantılar: Enter ile ekleme denemesi
for (const bad of ['javascript:alert(1)', 'ftp://example.com/x', 'example.com']) {
  await teacher.fill('#aLinkUrl', bad); await teacher.press('#aLinkUrl', 'Enter');
  ok((await teacher.textContent('#aStatus')).includes('http:// ya da https://') && await teacher.locator('#aLinks li').count() === 0, `geçersiz bağlantı reddedildi: ${bad}`);
}
ok(teacher.url().includes('ogretmen-odev.html'), 'bağlantı kutusunda Enter formu göndermiyor');
await teacher.fill('#aLinkUrl', 'https://www.youtube.com/watch?v=perfekt'); await teacher.fill('#aLinkTitle', 'Perfekt videosu'); await teacher.press('#aLinkTitle', 'Enter');
await teacher.fill('#aLinkUrl', 'http://example.com/arbeitsblatt'); await teacher.click('#aLinkAdd');
await teacher.fill('#aLinkUrl', 'https://docs.google.com/document/d/abc123/edit');
ok(await teacher.locator('#aLinkCopyRow').isVisible(), 'Docs bağlantısında "her öğrenciye kopya" seçeneği çıkıyor');
await teacher.check('#aLinkCopy');
ok((await teacher.textContent('#aLinkPreview')) === 'Öğrenciye verilecek bağlantı: https://docs.google.com/document/d/abc123/copy', 'kopya önizlemesi /copy');
await teacher.click('#aLinkAdd');
ok(await teacher.locator('#aLinks li').count() === 3, '3 bağlantı eklendi');
ok((await teacher.textContent('#aLinks')).includes('YouTube') && (await teacher.textContent('#aLinks')).includes('Docs · kopya'), 'bağlantı türleri: YouTube, Docs · kopya');
// Konunun tamamı
await teacher.selectOption('#aLevel', 'A1'); await teacher.waitForTimeout(300);
await teacher.selectOption('#aTopic', 'plural'); await teacher.waitForTimeout(800);
ok(await teacher.locator('#aWholeRow').isVisible() && (await teacher.textContent('#aWholeCount')).includes('20 paket'), '"Bu konunun tamamını ekle" (20 paket)');
await teacher.locator('#aExerciseList label', { hasText: 'Umlaut' }).first().locator('input').check().catch(() => {});
await teacher.check('#aWhole'); await teacher.waitForTimeout(300);
ok(await teacher.locator('#aExerciseList').evaluate((f) => f.disabled) && await teacher.locator('#aExerciseList input:checked').count() === 20, 'konunun tamamı seçilince bütün paketler işaretli ve kilitli');
ok((await teacher.textContent('#aChosen')).includes('konunun tamamı') && await teacher.locator('#aChosen li').count() === 1, 'seçilenlerde konunun tamamı tek satır (tek tek seçilen paket içine katıldı)');
// Sınav setleri ve Schreiben hâlâ seçilebiliyor; onlarda "konunun tamamı" yok.
await teacher.selectOption('#aTopic', 'sinav'); await teacher.waitForTimeout(800);
ok(await teacher.locator('#aWholeRow').isHidden(), 'sınav setlerinde "konunun tamamı" yok');
await teacher.locator('#aExerciseList label', { hasText: 'Lesen · Teil 1 · Grüße aus dem Urlaub' }).locator('input').check();
await teacher.selectOption('#aTopic', 'schreiben'); await teacher.waitForTimeout(800);
ok(await teacher.locator('#aExerciseList label').count() > 0 && await teacher.locator('#aWholeRow').isHidden(), 'Schreiben görevleri seçilebiliyor');
await teacher.fill('#aDescription', 'Videoyu izle,\nsonra paketleri çöz.');
ok(await noOverflow(teacher), '1440: formda taşma yok');
await shot(teacher, 'form-1440-acik');
await teacher.click('#aSubmit'); await teacher.waitForURL(/ogretmen-odevler\.html\?ogrenci=ogrenci1&durum=verildi/, { timeout: 15000 });
let docs = (await listDocs('users/ogrenci1/assignments')).map((d) => ({ id: d.name.split('/').pop(), ...d.fields }));
const created = docs.find((d) => d.id !== 'eski1');
ok(docs.length === 2 && created, 'ödev kaydedildi');
const links = created.links.arrayValue.values.map((v) => plain(v.mapValue));
ok(created.title.stringValue === TODAY && created.dueAt.nullValue === null && created.schemaVersion.integerValue === '2', 'başlık bugünün tarihi, teslim tarihi yok, schemaVersion 2');
ok(links.length === 3 && links[0].kind === 'youtube' && links[0].title === 'Perfekt videosu' && links[1].url === 'http://example.com/arbeitsblatt' && links[2].url.endsWith('/abc123/copy') && links[2].copy === true,
  `bağlantılar doğru kaydedildi (${JSON.stringify(links)})`);
ok(JSON.stringify(created.topics).includes('plural') && JSON.stringify(created.exercises).includes('goethe-a1-lesen-1-set-1') && !JSON.stringify(created.exercises).includes('umlaut'),
  'konunun tamamı topics\'te, sınav seti exercises\'te');
await teacher.waitForSelector('.odev-item', { timeout: 15000 });
ok((await teacher.textContent('#listNotice')).includes('Ödev verildi'), '"Ödev verildi" bildirimi');
const days = await teacher.locator('.odev-day-title').allTextContents();
ok(days.length === 2 && days[0] === TODAY && days[1] === berlinLabel(OLD), `tarih başlıkları en yenisi üstte (${days.join(', ')})`);
await teacher.locator('.odev-item').first().locator('summary').click();
ok((await teacher.locator('.odev-item').first().textContent()).includes('A1 · Plural · konunun tamamı'), 'öğretmen görünümünde konunun tamamı başlığı');
ok(await noOverflow(teacher), '1440: ödev sayfasında taşma yok');
await shot(teacher, 'ogretmen-odevler-1440-acik');

// 3. Düzenleme: başlık, bir bağlantıyı kaldır, ikinci öğrenciyi ekle.
await teacher.locator('.odev-item').first().locator('a', { hasText: 'Düzenle' }).click();
await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok((await teacher.textContent('#assignTitle')) === 'Ödevi düzenle' && (await teacher.inputValue('#aTitle')) === TODAY, 'düzenleme formu mevcut içerikle açılıyor');
ok(await teacher.locator('#aLinks li').count() === 3 && (await teacher.textContent('#aChosen')).includes('konunun tamamı') && (await teacher.textContent('#aChosen')).includes('Grüße aus dem Urlaub'), 'bağlantılar ve alıştırmalar dolu');
ok(await teacher.locator('input[name="student"][value="ogrenci1"]').isDisabled(), 'ödevi almış öğrenci kilitli');
await teacher.fill('#aTitle', 'Perfekt ve Plural');
await teacher.locator('#aLinks li', { hasText: 'example.com' }).locator('button').click();
await teacher.check('input[name="student"][value="ogrenci3"]');
await teacher.fill('#aDue', '2030-01-15T18:00');
await teacher.click('#aSubmit'); await teacher.waitForURL(/durum=guncellendi/, { timeout: 15000 });
const one = plain((await listDocs('users/ogrenci1/assignments')).find((d) => !d.name.endsWith('eski1')));
const three = (await listDocs('users/ogrenci3/assignments')).map(plain);
ok(one.title === 'Perfekt ve Plural' && one.links.values.length === 2 && one.dueAt && one.updatedAt, 'düzenleme bütün kopyalara yazıldı');
ok(three.length === 1 && three[0].groupId === one.groupId && three[0].title === 'Perfekt ve Plural' && Math.abs(Date.parse(three[0].createdAt) - Date.parse(one.createdAt)) < 1000, 'eklenen öğrenci aynı gruba, aynı "verildiği gün" ile eklendi');
await teacher.waitForSelector('.odev-item', { timeout: 15000 });
ok((await teacher.textContent('#listNotice')).includes('güncellendi'), '"Ödev güncellendi" bildirimi');

// 4. Eski ödevi düzenle: docUrl → links; öğrencinin "tamamladı" işareti korunur.
await teacher.goto(`${BASE}/ogretmen-odev.html?duzenle=eski-grup`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok(await teacher.locator('#aLinks li').count() === 1 && (await teacher.textContent('#aLinks')).includes('Docs · kopya'), 'eski ödevin dokümanı bağlantı listesinde');
await teacher.click('#aSubmit'); await teacher.waitForURL(/durum=guncellendi/, { timeout: 15000 });
const eski = plain(await getDocRest('users/ogrenci1/assignments/eski1'));
ok(!('docUrl' in eski) && !('copyPerStudent' in eski) && eski.links.values.length === 1 && eski.done === true && eski.schemaVersion === '2', 'eski ödev yeni biçime geçti, işaret korundu');

// 5. Tüm öğrenciler görünümü.
await teacher.goto(`${BASE}/ogretmen-odevler.html`); await teacher.waitForSelector('.odev-item', { timeout: 15000 });
ok((await teacher.locator('.odev-item').first().textContent()).includes('0/2 tamamladı'), '"Tüm öğrenciler": 0/2 tamamladı');
await teacher.setViewportSize({ width: 390, height: 900 });
await teacher.evaluate(() => { localStorage.setItem('ba-theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); });
await teacher.locator('.odev-item').first().locator('summary').click();
ok(await noOverflow(teacher), '390: ödev sayfasında taşma yok');
await shot(teacher, 'ogretmen-odevler-390-koyu');
await teacher.goto(`${BASE}/ogretmen-odev.html?duzenle=${one.groupId}`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok(await noOverflow(teacher), '390: formda taşma yok');
await shot(teacher, 'form-390-koyu');
await tctx.close();

// 6. Öğrenci: bir paketi çözmüş (ödevden sonra).
await fetch(`${docsUrl}/users/ogrenci1/results`, { method: 'POST', headers: owner, body: JSON.stringify({ fields: {
  level: { stringValue: 'A1' }, topic: { stringValue: 'plural' }, exercise: { stringValue: 'umlaut-4' }, score: { integerValue: '8' }, total: { integerValue: '10' },
  at: { timestampValue: new Date(Date.now() + 60e3).toISOString() } } }) });
const { ctx: sctx, page: student } = await newPage(390, 'dark');
await signIn(student, 'ogrenci@example.com', 'ogrenci123', 'student');
await student.goto(`${BASE}/panel.html`); await student.waitForSelector('#assignList a', { timeout: 15000 });
ok((await student.textContent('#assignList')).includes('1 açık ödevin var') && await student.locator('#assignList a[href^="odevlerim.html#odev-"]').count() === 1, 'panelde açık ödev özeti ve bağlantısı');
await student.click('a[href="odevlerim.html"]'); await student.waitForSelector('#odevApp:not([hidden])', { timeout: 15000 });
const sdays = await student.locator('.odev-day-title').allTextContents();
ok(sdays.length === 2 && sdays[0] === TODAY, `öğrencide tarih başlıkları (${sdays.join(', ')})`);
const card = student.locator('.odev-item').first();
ok(await card.locator('details').evaluate((d) => d.open), 'açık ödev açık geliyor');
ok((await card.textContent()).includes('Perfekt ve Plural') && (await card.textContent()).includes('Teslim'), 'başlık ve teslim tarihi');
ok(await card.locator('a.odev-chip[href="https://www.youtube.com/watch?v=perfekt"][target="_blank"][rel="noopener noreferrer"]').count() === 1, 'YouTube bağlantısı yeni sekmede');
ok(await card.locator('a.odev-chip[href$="/abc123/copy"]').count() === 1, 'Docs kopya bağlantısı');
ok((await card.textContent()).includes('A1 · Plural · konunun tamamı') && await card.locator('.odev-ex-list li').count() === 21, 'konunun 20 paketi + sınav seti listeleniyor');
ok((await card.locator('.odev-ex-list li', { hasText: 'Umlaut' }).first().textContent()).includes('Çözüldü · 8/10'), 'çözülen paket: "Çözüldü · 8/10"');
ok((await card.locator('.odev-ex-list li', { hasText: 'Grüße aus dem Urlaub' }).textContent()).includes('Henüz çözülmedi'), 'çözülmeyen set: "Henüz çözülmedi"');
ok((await card.textContent()).includes('1/21 çözüldü'), 'rozet: 1/21 çözüldü');
ok(await card.locator('a[href="index.html#exams/goethe/a1/lesen/1/set-1"]').count() === 1, 'sınav seti bağlantısı');
const old = student.locator('#odev-eski1');
ok(!(await old.locator('details').evaluate((d) => d.open)) && (await old.textContent()).includes('Tamamlandı'), 'tamamlanan eski ödev kapalı, "Tamamlandı"');
ok(await noOverflow(student), '390: Ödevlerim sayfasında taşma yok');
await shot(student, 'odevlerim-390-koyu');
// Yanlış doküman linki, sonra tamamla
await card.locator('input[type="url"]').fill('https://example.com/x');
await card.locator('button', { hasText: 'Tamamladım' }).click();
ok((await card.locator('.acc-status').textContent()).includes('Google Docs'), 'Google dışı öğrenci linki reddedildi');
await card.locator('input[type="url"]').fill('');
await card.locator('input[type="url"]').press('Enter');
await card.locator('button', { hasText: 'Tamamladım' }).click(); await student.waitForTimeout(1500);
ok(plain((await listDocs('users/ogrenci1/assignments')).find((d) => !d.name.endsWith('eski1'))).done === true, 'öğrenci ödevi tamamladı');
ok((await student.textContent('#odevCounts')).includes('Açık: 0'), 'sayaç: Açık 0');
await student.setViewportSize({ width: 1440, height: 900 });
await student.click('[data-lang="de"]'); await student.waitForTimeout(800);
ok((await student.textContent('#odevTitle')) === 'Meine Hausaufgaben' && (await student.textContent('#odevDays')).includes('Erledigt'), 'Almanca arayüz');
await student.click('[data-lang="en"]'); await student.waitForTimeout(800);
ok((await student.textContent('#odevTitle')) === 'My homework', 'İngilizce arayüz');
await student.click('[data-lang="tr"]'); await student.waitForTimeout(500);
await student.evaluate(() => { localStorage.setItem('ba-theme', 'light'); document.documentElement.setAttribute('data-theme', 'light'); });
await student.locator('.odev-item').first().locator('summary').click();
ok(await noOverflow(student), '1440: Ödevlerim sayfasında taşma yok');
await shot(student, 'odevlerim-1440-acik');
await sctx.close();

// 7. Onaysız öğrenci ödev göremez.
const { ctx: pctx, page: pending } = await newPage(390);
await signIn(pending, 'bekleyen@example.com', 'ogrenci123', 'student');
await pending.goto(`${BASE}/odevlerim.html`); await pending.waitForSelector('#odevInactive:not([hidden])', { timeout: 15000 }).catch(() => {});
ok(await pending.locator('#odevInactive').isVisible() && await pending.locator('#odevApp').isHidden(), 'onaysız öğrenciye "hesabın onaylandıktan sonra" notu');
await pctx.close();

// 8. Ekran görüntüsü matrisi: 3 sayfa × 390/1440 × açık/koyu, her birinde taşma denetimi.
for (const theme of ['light', 'dark']) {
  for (const width of [390, 1440]) {
    const { ctx: mt, page: tp } = await newPage(width, theme);
    await signIn(tp, 'ogretmen@example.com', 'ogretmen123', 'teacher');
    await tp.goto(`${BASE}/ogretmen-odevler.html?ogrenci=ogrenci1`); await tp.waitForSelector('.odev-item', { timeout: 15000 });
    await tp.locator('.odev-item summary').first().click();
    ok(await noOverflow(tp), `${width} ${theme}: öğretmen ödev sayfası taşmıyor`);
    await shot(tp, `m-ogretmen-odevler-${width}-${theme}`);
    await tp.goto(`${BASE}/ogretmen-odev.html?ogrenci=ogrenci1`); await tp.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
    await tp.fill('#aLinkUrl', 'https://docs.google.com/document/d/abc/edit'); await tp.check('#aLinkCopy'); await tp.click('#aLinkAdd');
    await tp.selectOption('#aLevel', 'A1'); await tp.selectOption('#aTopic', 'plural'); await tp.waitForTimeout(600); await tp.check('#aWhole');
    ok(await noOverflow(tp), `${width} ${theme}: yeni ödev formu taşmıyor`);
    await shot(tp, `m-yeni-odev-${width}-${theme}`);
    await mt.close();
    const { ctx: ms, page: sp } = await newPage(width, theme);
    await signIn(sp, 'ikinci@example.com', 'ogrenci123', 'student');
    await sp.goto(`${BASE}/odevlerim.html`); await sp.waitForSelector('.odev-item', { timeout: 15000 });
    ok(await noOverflow(sp), `${width} ${theme}: Ödevlerim taşmıyor`);
    await shot(sp, `m-odevlerim-${width}-${theme}`);
    await ms.close();
  }
}

await browser.close();
server.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
