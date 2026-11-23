// Ödev e-postası, uçtan uca (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:odev-eposta
// Worker (worker/schreiben-kontrol.js → POST /odev-bildirim) Node'da 127.0.0.1:8787'de çalışır; Firebase istekleri emülatöre,
// Brevo istekleri yerel sahte Brevo sunucusuna gider (gerçek e-posta yok). Akış: öğretmen ödev verir ("e-posta ile bildir"
// işaretli) → yetişkin öğrenciye kendi dilinde (DE), 16 yaş altına ve veliye Türkçe, bildirimi kapalı öğrenciye hiç →
// listede sonuç ve "E-posta gönderildi" → düzenleme (kutu işaretsiz: e-posta yok; işaretli: "güncellendi") → Brevo hatası
// ve "E-posta gönder" ile tekrar → Worker ayarsız → günlük sınır → öğrenci detayında kapatma → öğrencinin dili profile yazılır.
// Ekran görüntüleri 390/1440, açık/koyu: $S ya da geçici klasör.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import worker, { homeworkMail, formatDue } from '../worker/schreiben-kontrol.js';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = 'demo-bozkurtacademy';
const RULES = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
const TEACHER = RULES.match(/function teacherUid\(\)\s*{\s*return '([^']+)'/)[1];
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'odev-eposta-'));

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

// Sahte Brevo: gönderilen e-postaları toplar; brevoFail içindeki adreslere 500 döner.
const mails = [];
const brevoFail = new Set();
const brevo = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
  if (req.url !== '/v3/smtp/email' || req.headers['api-key'] !== 'test-brevo-key') { res.writeHead(401); res.end('{}'); return; }
  if (brevoFail.has(body.to?.[0]?.email)) { res.writeHead(500); res.end('{}'); return; }
  mails.push(body);
  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ messageId: `<${mails.length}@brevo>` }));
});
await new Promise((resolve) => brevo.listen(0, '127.0.0.1', resolve));

const env = {
  FIREBASE_API_KEY: 'fake-api-key', FIREBASE_PROJECT_ID: PROJECT, ALLOWED_ORIGINS: BASE, SITE_URL: 'https://bozkurtacademy.com',
  AUTH_BASE: `${AUTH}/identitytoolkit.googleapis.com`, FIRESTORE_BASE: FS,
  TEACHER_UID: TEACHER, BREVO_API_KEY: 'test-brevo-key', BREVO_BASE: `http://127.0.0.1:${brevo.address().port}`, MAIL_DAILY_LIMIT: '100'
};
const wserver = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const headers = {};
  for (const k of ['authorization', 'content-type', 'origin']) if (req.headers[k]) headers[k] = req.headers[k];
  const request = new Request(`http://127.0.0.1:8787${req.url}`, { method: req.method, headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
  const r = await worker.fetch(request, env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(await r.text());
});
await new Promise((resolve) => wserver.listen(8787, '127.0.0.1', resolve));

const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const docsUrl = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123'],
  ['ogrenci2', 'genc@example.com', 'ogrenci123'], ['ogrenci3', 'kapali@example.com', 'ogrenci123'], ['ogrenci4', 'dorduncu@example.com', 'ogrenci123']]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
const year = new Date().getUTCFullYear();
const now = () => ({ timestampValue: new Date().toISOString() });
const profile = (name, email, { minor = false, extra = {} } = {}) => ({ fields: {
  name: { stringValue: name }, email: { stringValue: email }, birthYear: { integerValue: String(year - (minor ? 14 : 25)) },
  minor: { booleanValue: minor }, provider: { stringValue: 'password' }, status: { stringValue: 'active' },
  emailVerified: { booleanValue: true }, createdAt: now(), approvedAt: now(), ...extra,
  ...(minor ? {
    parent: { mapValue: { fields: { name: { stringValue: 'Ayşe Genç' }, email: { stringValue: 'veli@example.com' } } } },
    parentConsent: { mapValue: { fields: { given: { booleanValue: true }, at: now(), method: { stringValue: 'form' }, recordedAt: now() } } }
  } : {})
} });
await fetch(`${docsUrl}/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Deniz Kaya', 'ogrenci@example.com', { extra: { lang: { stringValue: 'de' } } })) });
await fetch(`${docsUrl}/users/ogrenci2`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Mert Genç', 'genc@example.com', { minor: true })) });
await fetch(`${docsUrl}/users/ogrenci3`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Ece Kapalı', 'kapali@example.com', { extra: { homeworkMail: { booleanValue: false } } })) });
await fetch(`${docsUrl}/users/ogrenci4`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Arda Can', 'dorduncu@example.com')) });
const listDocs = async (p) => ((await (await fetch(`${docsUrl}/${p}?pageSize=100`, { headers: owner })).json()).documents || []);
const getDocRest = async (p) => { const r = await fetch(`${docsUrl}/${p}`, { headers: owner }); return r.ok ? r.json() : null; };
const plain = (d) => Object.fromEntries(Object.entries(d?.fields || {}).map(([k, v]) => [k, Object.values(v)[0]]));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());

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
const shot = async (page, name) => { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path: path.join(shotDir, `${name}.png`), fullPage: true }); };
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth <= 0
  && [...document.querySelectorAll('.odev-item, .acc-card')].every((c) => {
    const right = c.getBoundingClientRect().right + 1;
    return [...c.querySelectorAll('*')].every((e) => !e.getClientRects().length || e.getBoundingClientRect().right <= right);
  }));
const copies = async (uid) => (await listDocs(`users/${uid}/assignments`)).map((d) => ({ id: d.name.split('/').pop(), ...plain(d) }));
const limitCount = async () => Number(plain(await getDocRest('mailLimits/_global')).count || 0);
const notice = (page) => page.textContent('#listNotice');

async function giveAssignment(page, { students, title, due, notify = true, description = 'GİZLİ NOT: sayfa 3' }) {
  await page.goto(`${BASE}/ogretmen-odev.html`); await page.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
  await page.fill('#aTitle', title);
  await page.fill('#aDescription', description);
  if (due) await page.fill('#aDue', due);
  await page.fill('#aLinkUrl', 'https://gizli-baglanti.example/x'); await page.click('#aLinkAdd');
  for (const s of students) await page.check(`input[name="student"][value="${s}"]`);
  if (!notify) await page.uncheck('#aNotify');
  await page.click('#aSubmit');
  await page.waitForURL(/ogretmen-odevler\.html/, { timeout: 30000 });
  await page.waitForSelector('#listApp:not([hidden])', { timeout: 15000 });
}

// 1. Öğretmen: yeni ödev, "e-posta ile bildir" (varsayılan işaretli).
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen-odev.html`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok(await teacher.isChecked('#aNotify') && await teacher.locator('#aNotifyUpdateRow').isHidden(), 'yeni ödevde "e-posta ile bildir" işaretli; "değişikliği bildir" yok');
ok((await teacher.locator('#aStudents label', { hasText: 'Ece Kapalı' }).textContent()).includes('ödev e-postası kapalı'), 'bildirimi kapalı öğrenci formda işaretli');
await teacher.check('input[name="student"][value="ogrenci1"]'); await teacher.check('input[name="student"][value="ogrenci2"]');
ok(await noOverflow(teacher), '1440: formda taşma yok');
await shot(teacher, 'form-1440-acik');
await giveAssignment(teacher, { students: ['ogrenci1', 'ogrenci2', 'ogrenci3'], title: 'Perfekt <b>tekrar</b>', due: '2030-01-15T18:00' });
ok(mails.length === 3, `3 e-posta gitti (öğrenci, 16 yaş altı öğrenci, veli) (${mails.length})`);
const toDeniz = mails.find((m) => m.to[0].email === 'ogrenci@example.com');
const toMert = mails.find((m) => m.to[0].email === 'genc@example.com');
const toVeli = mails.find((m) => m.to[0].email === 'veli@example.com');
ok(toDeniz?.subject === 'Neue Hausaufgabe: Perfekt <b>tekrar</b>' && toDeniz.textContent.includes('Abgabe: 15.01.2030, 18:00 (Berliner Zeit)'), 'yetişkin öğrenciye kendi dilinde (DE), teslim tarihi Berlin saatiyle');
ok(toDeniz?.htmlContent.includes('Perfekt &lt;b&gt;tekrar&lt;/b&gt;'), 'HTML\'de başlık kaçışlandı');
ok(toMert?.subject === 'Yeni ödev: Perfekt <b>tekrar</b>' && toVeli?.textContent.includes('öğrencinize yeni bir ödev verildi'), '16 yaş altı: öğrenci ve veli (Türkçe, veliye ayrı metin)');
ok(!mails.some((m) => m.to[0].email === 'kapali@example.com'), 'bildirimi kapalı öğrenciye e-posta yok');
ok(mails.every((m) => m.sender.email === 'info@bozkurtacademy.com' && m.replyTo.email === 'info@bozkurtacademy.com'), 'gönderen ve yanıt adresi info@bozkurtacademy.com');
ok(mails.every((m) => m.to.every((t) => t.contactPixelTrackingConsent === false)), 'her alıcıda açılma/tıklama takibi kapalı (contactPixelTrackingConsent: false)');
ok(mails.every((m) => !JSON.stringify(m).includes('GİZLİ NOT') && !JSON.stringify(m).includes('gizli-baglanti') && !JSON.stringify(m).includes('Deniz') && !JSON.stringify(m).includes('Mert')),
  'e-postada ödevin notu, bağlantıları ve öğrencinin adı yok');
ok(mails.every((m) => /https:\/\/bozkurtacademy\.com\/odevlerim\.html#odev-[A-Za-z0-9]+/.test(m.textContent)), 'e-postada "Ödevlerim" bağlantısı');
const n1 = await notice(teacher);
ok(n1.includes('Ödev verildi.') && n1.includes('E-posta: 2 öğrenciye gönderildi (velilerle birlikte 3 e-posta)') && n1.includes('Ece Kapalı (öğrencinin ödev e-postaları kapalı)'), `listede sonuç: ${n1}`);
const denizCopy = (await copies('ogrenci1'))[0];
ok(denizCopy.mailNewAt && !(await copies('ogrenci3'))[0].mailNewAt, 'gönderilen kopyada mailNewAt var, kapalı olanda yok');
ok(await limitCount() === 3, 'günlük sayaç 3');
await teacher.selectOption('#studentSelect', 'ogrenci1'); await teacher.waitForTimeout(800);
ok((await teacher.locator('.odev-item').first().textContent()).includes('E-posta gönderildi'), 'öğrenci görünümünde "E-posta gönderildi"');
await teacher.selectOption('#studentSelect', ''); await teacher.waitForTimeout(800);
await teacher.locator('.odev-item').first().locator('summary').click();
ok((await teacher.locator('.odev-item').first().textContent()).includes('Ödev e-postaları kapalı'), 'tüm öğrenciler görünümünde öğrenci başına e-posta durumu');
ok(await noOverflow(teacher), '1440: ödev listesinde taşma yok');
await shot(teacher, 'liste-1440-acik');

// 2. Düzenleme: "değişikliği bildir" varsayılan işaretsiz → e-posta yok; işaretliyken "güncellendi".
const groupId = denizCopy.groupId;
await teacher.goto(`${BASE}/ogretmen-odev.html?duzenle=${groupId}`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok(await teacher.locator('#aNotifyUpdateRow').isVisible() && !(await teacher.isChecked('#aNotifyUpdate')) && (await teacher.textContent('#aNotifyLabel')).includes('Yeni eklediğin'), 'düzenlemede "değişikliği bildir" işaretsiz');
await teacher.fill('#aTitle', 'Perfekt tekrar (düzeltildi)');
await teacher.click('#aSubmit'); await teacher.waitForURL(/durum=guncellendi/, { timeout: 30000 });
ok(mails.length === 3, 'işaretsizken düzenleme e-postası gitmedi');
// Ödev başına günde bir e-posta: bugün "yeni ödev" alan öğrenciye bugün "güncellendi" gitmez. Ertesi günü taklit etmek için
// "yeni ödev" e-postasının zamanı bir gün geriye alınır.
const yesterday = { timestampValue: new Date(Date.now() - 864e5).toISOString() };
for (const uid of ['ogrenci1', 'ogrenci2']) {
  for (const c of await copies(uid)) await fetch(`${docsUrl}/users/${uid}/assignments/${c.id}?updateMask.fieldPaths=mailNewAt`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: { mailNewAt: yesterday } }) });
}
await teacher.goto(`${BASE}/ogretmen-odev.html?duzenle=${groupId}`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await teacher.check('#aNotifyUpdate');
await teacher.check('input[name="student"][value="ogrenci4"]');
await teacher.click('#aSubmit'); await teacher.waitForURL(/durum=guncellendi/, { timeout: 30000 });
await teacher.waitForSelector('#listApp:not([hidden])', { timeout: 15000 });
const updates = mails.slice(3);
ok(updates.filter((m) => m.subject.startsWith('Hausaufgabe geändert') || m.subject.startsWith('Ödev güncellendi')).length === 3
  && updates.some((m) => m.to[0].email === 'dorduncu@example.com' && m.subject === 'Yeni ödev: Perfekt tekrar (düzeltildi)'),
  `işaretliyken: mevcutlara "güncellendi" (3), yeni eklenen öğrenciye "yeni ödev" (${updates.map((m) => m.subject).join(' | ')})`);
ok((await notice(teacher)).includes('Ödev güncellendi.'), 'listede "Ödev güncellendi" ve e-posta sonucu');
await teacher.goto(`${BASE}/ogretmen-odev.html?duzenle=${groupId}`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
await teacher.check('#aNotifyUpdate');
await teacher.click('#aSubmit'); await teacher.waitForURL(/durum=guncellendi/, { timeout: 30000 });
await teacher.waitForSelector('#listApp:not([hidden])', { timeout: 15000 });
ok(mails.length === 7 && (await notice(teacher)).includes('0 öğrenciye gönderildi'), 'aynı gün ikinci "güncellendi" gönderilmedi');

// 3. Brevo hatası ve "E-posta gönder" ile tekrar.
brevoFail.add('dorduncu@example.com');
await giveAssignment(teacher, { students: ['ogrenci4'], title: 'Hata denemesi' });
const n3 = await notice(teacher);
ok(n3.includes('Arda Can (gönderilemedi)'), `Brevo hatası listede gösteriliyor (${n3})`);
ok((await copies('ogrenci4')).some((c) => c.title === 'Hata denemesi' && !c.mailNewAt), 'ödev kaydedildi, e-posta işareti yok');
brevoFail.clear();
const sendBtn = teacher.locator('.odev-item', { hasText: 'Hata denemesi' }).locator('button', { hasText: 'E-posta gönder' });
ok(await sendBtn.count() === 1, '"E-posta gönder" düğmesi (tekrar dene)');
await sendBtn.click(); await teacher.waitForTimeout(2500);
ok(mails.at(-1).to[0].email === 'dorduncu@example.com' && mails.at(-1).subject === 'Yeni ödev: Hata denemesi' && (await notice(teacher)).includes('1 öğrenciye gönderildi'), 'tekrar denemede gönderildi');

// 4. Worker'da Brevo anahtarı yok: ödev kaydedilir, açık bir mesaj.
env.BREVO_API_KEY = '';
await giveAssignment(teacher, { students: ['ogrenci4'], title: 'Ayarsız' });
ok((await notice(teacher)).includes('Brevo anahtarı ya da TEACHER_UID ayarlı değil') && (await copies('ogrenci4')).some((c) => c.title === 'Ayarsız'), 'Worker ayarsız: ödev kaydedildi, mesaj gösterildi');
env.BREVO_API_KEY = 'test-brevo-key';

// 5. Günlük sınır.
await fetch(`${docsUrl}/mailLimits/_global`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: { day: { stringValue: today }, count: { integerValue: '100' }, updatedAt: now() } }) });
const before = mails.length;
await giveAssignment(teacher, { students: ['ogrenci1'], title: 'Sınır denemesi' });
ok(mails.length === before && (await notice(teacher)).includes('günlük e-posta sınırı doldu') && (await notice(teacher)).includes('100/100'), 'günde 100 sınırı: gönderilmedi, mesaj');
await teacher.setViewportSize({ width: 390, height: 900 });
await teacher.evaluate(() => { localStorage.setItem('ba-theme', 'dark'); document.documentElement.setAttribute('data-theme', 'dark'); });
ok(await noOverflow(teacher), '390: ödev listesinde (uzun bildirimle) taşma yok');
await shot(teacher, 'liste-sinir-390-koyu');
await teacher.goto(`${BASE}/ogretmen-odev.html?duzenle=${groupId}`); await teacher.waitForSelector('#assignForm:not([hidden])', { timeout: 15000 });
ok(await noOverflow(teacher), '390: düzenleme formunda taşma yok');
await shot(teacher, 'duzenle-390-koyu');

// 6. Öğrenci detayı: ödev e-postalarını kapat; "veliyi de ekle" ödev e-postalarını da kapsıyor.
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci2`); await teacher.waitForSelector('#homeworkMailInput', { timeout: 15000 });
ok((await teacher.textContent('#parentContent')).includes('Ders davetlerine, hatırlatma ve ödev e-postalarına veliyi de ekle'), '"veliyi de ekle" anahtarı ödev e-postalarını da kapsıyor');
ok(await teacher.isChecked('#homeworkMailInput'), 'ödev e-postaları varsayılan açık');
await teacher.uncheck('#homeworkMailInput'); await teacher.waitForTimeout(1200);
ok(plain(await getDocRest('users/ogrenci2')).homeworkMail === false, 'öğrenci detayında kapatıldı (homeworkMail: false)');
ok(!(await teacher.textContent('#lessonsList')).includes('null'), 'ders listesinde "null" yazısı yok');
ok(await noOverflow(teacher), '390: öğrenci detayında taşma yok');
await shot(teacher, 'ogrenci-detay-390-koyu');
await teacher.setViewportSize({ width: 1440, height: 900 });
await teacher.evaluate(() => { localStorage.setItem('ba-theme', 'light'); document.documentElement.setAttribute('data-theme', 'light'); });
await shot(teacher, 'ogrenci-detay-1440-acik');
await tctx.close();

// 7. Öğrenci: seçtiği dil profile yazılır.
const { ctx: sctx, page: student } = await newPage(1440);
await signIn(student, 'dorduncu@example.com', 'ogrenci123', 'student');
await student.goto(`${BASE}/panel.html`); await student.waitForSelector('#panelLayout:not([hidden])', { timeout: 15000 });
await student.waitForTimeout(1000);
ok(plain(await getDocRest('users/ogrenci4')).lang === 'tr', 'panel açılınca dil profile yazıldı (tr)');
await student.click('[data-lang="en"]'); await student.waitForTimeout(1500);
ok(plain(await getDocRest('users/ogrenci4')).lang === 'en', 'dil değişince profile yazıldı (en)');
await student.goto(`${BASE}/odevlerim.html`); await student.waitForSelector('#odevApp:not([hidden])', { timeout: 15000 });
await student.click('[data-lang="de"]'); await student.waitForTimeout(1500);
ok(plain(await getDocRest('users/ogrenci4')).lang === 'de', 'Ödevlerim sayfasında da yazılıyor (de)');
await sctx.close();

// 8. E-postanın kendisi (HTML önizleme): 390 ve 1440.
for (const [width, lang, role] of [[390, 'tr', 'student'], [1440, 'de', 'parent']]) {
  const { ctx, page } = await newPage(width);
  const m = homeworkMail({ lang, role, kind: 'new', title: '23.11.2026', due: formatDue('2026-11-30T17:00:00Z', lang), url: 'https://bozkurtacademy.com/odevlerim.html#odev-abc123' });
  await page.setContent(m.html);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: e-posta HTML'i taşmıyor`);
  await page.screenshot({ path: path.join(shotDir, `eposta-${lang}-${role}-${width}.png`), fullPage: true });
  await ctx.close();
}

await browser.close();
server.close(); wserver.close(); brevo.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
