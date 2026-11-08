// Schreiben yapay zekâ (Aşama B), uçtan uca (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:schreiben-ai
// Worker (worker/schreiben-kontrol.js) Node'da 127.0.0.1:8787'de çalışır; Firebase istekleri emülatöre gider, yapay zekâ
// sahte (gerçek Cloudflare çağrısı yok). Akış: mod yokken kontrol yapılmaz → öğretmen paneli varsayılan "Taslak"ı yazar
// → öğrenci gönderir, taslak oluşur (öğrenci görmez; yapay zekâya sadece görev adı ve metin gider) → öğretmen düzeltip
// onaylar → öğrenci işaretli hataları görür → 16 yaş altı: yapay zekâ onayı yokken kontrol yok, öğretmen işaretleyince
// var → günlük sınır → "Anında göster" modu. Ekran görüntüleri 390/1440, açık/koyu: $S ya da geçici klasör.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import worker from '../worker/schreiben-kontrol.js';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = 'demo-bozkurtacademy';
const RULES = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
const TEACHER = RULES.match(/function teacherUid\(\)\s*{\s*return '([^']+)'/)[1];
const AI_UID = RULES.match(/function aiUid\(\)\s*{\s*return '([^']+)'/)[1];
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'schreiben-ai-'));

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

// Sahte yapay zekâ: metinde geçen bir hata ve metinde geçmeyen (Worker'ın elemesi gereken) bir öneri döner.
const aiCalls = [];
const WRONG = 'weil die alte Wohnung war zu teuer';
const RIGHT = 'weil die alte Wohnung zu teuer war';
const env = {
  FIREBASE_API_KEY: 'fake-api-key', FIREBASE_PROJECT_ID: PROJECT, ALLOWED_ORIGINS: BASE, SITE_URL: BASE,
  AI_EMAIL: 'yapayzeka@example.com', AI_PASSWORD: 'yapayzeka-sifre-123',
  AUTH_BASE: `${AUTH}/identitytoolkit.googleapis.com`, FIRESTORE_BASE: FS,
  AI: { run: async (model, input) => {
    aiCalls.push({ model, input });
    const text = input.messages[1].content.split('Metin:\n')[1] || '';
    const fehler = [
      { original: WRONG, korrektur: RIGHT, erklaerung: 'weil yan cümle kurar: çekimli fiil (war) sona gider.' },
      { original: 'Diese Wörter stehen nicht im Text', korrektur: 'x', erklaerung: 'uydurma öneri' }
    ];
    return { response: JSON.stringify({ fehler, korrigierter_text: text.replace(WRONG, RIGHT) }) };
  } }
};
const statuses = [];
const wserver = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const headers = {};
  for (const k of ['authorization', 'content-type', 'origin']) if (req.headers[k]) headers[k] = req.headers[k];
  const request = new Request(`http://127.0.0.1:8787${req.url}`, { method: req.method, headers, body: req.method === 'POST' ? Buffer.concat(chunks) : undefined });
  const r = await worker.fetch(request, env);
  const text = await r.text();
  if (req.method === 'POST') { try { statuses.push(JSON.parse(text).status); } catch (_) { statuses.push('?'); } }
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(text);
});
await new Promise((resolve) => wserver.listen(8787, '127.0.0.1', resolve));

const owner = { Authorization: 'Bearer owner', 'Content-Type': 'application/json' };
const docsUrl = `${FS}/v1/projects/${PROJECT}/databases/(default)/documents`;
await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
for (const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123'],
  ['ogrenci3', 'genc@example.com', 'ogrenci123'], [AI_UID, env.AI_EMAIL, env.AI_PASSWORD]]) {
  await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, { method: 'POST', headers: owner, body: JSON.stringify({ localId, email, password }) });
}
const year = new Date().getUTCFullYear();
const now = () => ({ timestampValue: new Date().toISOString() });
const profile = (name, email, minor) => ({ fields: {
  name: { stringValue: name }, email: { stringValue: email }, birthYear: { integerValue: String(year - (minor ? 14 : 25)) },
  minor: { booleanValue: minor }, provider: { stringValue: 'password' }, status: { stringValue: 'active' },
  emailVerified: { booleanValue: true }, createdAt: now(), approvedAt: now(),
  ...(minor ? {
    parent: { mapValue: { fields: { name: { stringValue: 'Ayşe Genç' }, email: { stringValue: 'veli@example.com' } } } },
    parentConsent: { mapValue: { fields: { given: { booleanValue: true }, at: now(), method: { stringValue: 'form' }, recordedAt: now() } } }
  } : {})
} });
await fetch(`${docsUrl}/users/ogrenci1`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Deniz Kaya', 'ogrenci@example.com', false)) });
await fetch(`${docsUrl}/users/ogrenci3`, { method: 'PATCH', headers: owner, body: JSON.stringify(profile('Mert Genç', 'genc@example.com', true)) });
const listDocs = async (p) => ((await (await fetch(`${docsUrl}/${p}?pageSize=100`, { headers: owner })).json()).documents || []);
const getDocRest = async (p) => { const r = await fetch(`${docsUrl}/${p}`, { headers: owner }); return r.ok ? r.json() : null; };
const plain = (d) => Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, Object.values(v)[0]]));
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin' }).format(new Date());
const setLimit = (id, count) => fetch(`${docsUrl}/aiLimits/${id}`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields: { day: { stringValue: today }, count: { integerValue: String(count) }, updatedAt: now() } }) });

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
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
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
const TEXT = `Liebe Lena,\nwie geht es dir? Ich wohne jetzt seit zwei Wochen in meiner neuen Wohnung. Sie ist klein, aber sehr hell. Ich bin umgezogen, ${WRONG}. Hast du am Samstag Zeit? Dann kochen wir zusammen.\nLiebe Grüße\nDeniz`;
// Gönderir ve Worker'ın cevabını bekler; Worker'ın döndürdüğü durumu verir.
async function submit(page, text = TEXT) {
  const before = statuses.length;
  await page.goto('about:blank');
  await page.goto(`${BASE}/index.html#exams/goethe/b1/schreiben/1/set-1`); await page.waitForTimeout(1500);
  await page.fill('#wtText', text);
  await page.click('[data-wt-submit]');
  for (let i = 0; i < 100 && statuses.length === before; i++) await new Promise((r) => setTimeout(r, 100));
  return statuses[before];
}
const latestWriting = async (uid) => {
  const list = (await listDocs(`users/${uid}/writings`)).map((d) => ({ id: d.name.split('/').pop(), ...plain(d), raw: d }));
  return list.sort((a, b) => String(b.at).localeCompare(String(a.at)))[0];
};

// 1. Mod henüz yok: kontrol yapılmaz.
const { ctx: sctx, page: student } = await newPage();
await signIn(student, 'ogrenci@example.com', 'ogrenci123', 'student');
ok(await submit(student) === 'off', 'settings/ai yokken Worker "off" der, kontrol yapılmaz');
ok(aiCalls.length === 0 && (await listDocs('aiDrafts')).length === 0, 'yapay zekâ çağrılmadı, taslak yok');

// 2. Öğretmen paneli varsayılan modu "Taslak" olarak yazar.
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#aiModeSelect', { timeout: 15000 }).catch(() => {});
ok(await teacher.inputValue('#aiModeSelect') === 'draft' && plain(await getDocRest('settings/ai')).mode === 'draft', 'öğretmen paneli açılınca mod "Taslak" (settings/ai oluşturuldu)');

// 3. Taslak modu: öğrenci gönderir, taslak oluşur, öğrenci görmez.
ok(await submit(student) === 'draft', 'Taslak modunda Worker "draft" der');
const w2 = await latestWriting('ogrenci1');
const draftDoc = await getDocRest(`aiDrafts/ogrenci1_${w2.id}`);
const draft = draftDoc && plain(draftDoc);
const draftErrors = draftDoc?.fields?.errors?.arrayValue?.values || [];
ok(draft && draft.uid === 'ogrenci1' && draftErrors.length === 1 && draftErrors[0].mapValue.fields.original.stringValue === WRONG,
  'aiDrafts/ogrenci1_<id>: metinde geçmeyen öneri elendi, 1 öneri kaldı');
const sent = JSON.stringify(aiCalls.at(-1).input);
ok(sent.includes('Görev: Goethe B1 · Teil 1 · Neue Wohnung') && sent.includes('Ich wohne jetzt seit zwei Wochen'), 'yapay zekâya görev adı ve metin gitti');
ok(!/Deniz Kaya|ogrenci@example\.com|ogrenci1|Bearer/.test(sent), 'yapay zekâya ad, e-posta, uid ya da belirteç gitmedi');
ok(!w2.aiAt && !w2.aiFeedback && !w2.feedbackAt, 'Taslak modunda metne hiçbir şey yazılmadı');
ok(plain(await getDocRest('aiLimits/ogrenci1')).count === '1' && plain(await getDocRest('aiLimits/_global')).count === '1', 'günlük sayaçlar: öğrenci 1, site 1');
await student.goto(`${BASE}/panel.html`); await student.waitForSelector('#writingList [data-writing]', { timeout: 15000 }).catch(() => {});
ok(!(await student.textContent('#writingList')).includes(RIGHT) && await student.locator('#writingList mark').count() === 0, 'öğrenci panelinde taslak görünmüyor');
const leak = await student.evaluate(async (id) => {
  const { db, fs } = await import('/js/account/firebase.js');
  try { await fs.getDoc(fs.doc(db, 'aiDrafts', id)); return 'okundu'; } catch (e) { return e.code; }
}, `ogrenci1_${w2.id}`);
ok(leak === 'permission-denied', `öğrenci taslağı Firestore'dan da okuyamıyor (${leak})`);

// 4. Öğretmen: işaret, taslağı düzenleyip onaylama.
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#teacherApp:not([hidden])', { timeout: 15000 }).catch(() => {}); await teacher.waitForTimeout(800);
ok(await teacher.locator('#list-ogrenciler [data-ai-drafts="1"]').count() === 1 && (await teacher.textContent('#writingNotice')).includes('yapay zekâ taslağı hazır'), 'öğretmen listesinde "1 taslak hazır"');
await teacher.screenshot({ path: path.join(shotDir, 'ogretmen-mod-1440.png') });
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1#yazilar`); await teacher.waitForSelector(`[data-ai-draft="${w2.id}"]`, { timeout: 15000 }).catch(() => {});
const panelEl = teacher.locator(`[data-ai-draft="${w2.id}"]`);
ok(await panelEl.locator('[data-ai-item]').count() === 1 && (await panelEl.locator('[data-ai-korrektur]').inputValue()) === RIGHT, 'taslak paneli: 1 öneri, doğrusu düzenlenebilir');
ok((await teacher.textContent('#aiConsentBox')).includes('Açık'), 'yetişkin öğrencide yapay zekâ kontrolü "Açık"');
for (const [width, theme] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const { ctx, page } = await newPage(width, theme);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123', 'teacher');
  await page.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1#yazilar`); await page.waitForSelector(`[data-ai-draft="${w2.id}"]`, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);
  ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${width} ${theme}: öğretmen taslak panelinde taşma yok`);
  await page.locator(`[data-ai-draft="${w2.id}"]`).screenshot({ path: path.join(shotDir, `ogretmen-taslak-${width}-${theme}.png`) });
  await ctx.close();
}
await panelEl.locator('[data-ai-erklaerung]').fill('weil yan cümle kurar; çekimli fiil "war" cümlenin sonuna gider.');
await panelEl.locator('[data-ai-note]').fill('Çok iyi bir mektup! Sadece bir yerde fiil sırasına dikkat.');
await panelEl.locator('[data-ai-approve]').click(); await teacher.waitForTimeout(1500);
const w2b = await latestWriting('ogrenci1');
ok(w2b.feedbackSource === 'ai-edited' && w2b.feedback.startsWith('Çok iyi') && w2b.feedbackAt && w2b.correctedText.includes(RIGHT), 'onay: geri bildirim, düzeltilmiş metin ve "ai-edited" kaydedildi');
const items = w2b.raw.fields.feedbackItems.arrayValue.values;
ok(items.length === 1 && items[0].mapValue.fields.erklaerung.stringValue.includes('"war"'), 'düzenlenen açıklama kaydedildi');
ok(!(await getDocRest(`aiDrafts/ogrenci1_${w2.id}`)), 'onaydan sonra taslak silindi');
ok((await teacher.textContent(`[data-writing="${w2.id}"]`)).includes('düzenlenerek onaylandı'), 'öğretmen detayında "düzenlenerek onaylandı"');

// 5. Öğrenci işaretli hataları görür (390 ve 1440, açık/koyu).
for (const [width, theme] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const { ctx, page } = await newPage(width, theme);
  await signIn(page, 'ogrenci@example.com', 'ogrenci123', 'student');
  await page.goto(`${BASE}/panel.html`); await page.waitForSelector(`[data-writing="${w2.id}"]`, { timeout: 15000 }).catch(() => {});
  const card = page.locator(`[data-writing="${w2.id}"]`);
  if (width === 390 && theme === 'light') ok(await card.locator('.acc-new-dot:not([hidden])').count() === 1, 'öğrencide yeni geri bildirim işareti');
  await card.locator(':scope > summary').click(); await page.waitForTimeout(800);
  if (width === 390 && theme === 'light') {
    ok((await card.locator('mark').textContent()) === `${WRONG}1`, 'metinde hatalı yer numarayla işaretli');
    ok((await card.locator('.acc-feedback-items').textContent()).includes(RIGHT) && (await card.textContent()).includes('kontrol edip düzeltti'), 'düzeltme listesi ve "öğretmenin düzeltti" etiketi');
    ok((await card.textContent()).includes('Çok iyi bir mektup'), 'öğretmenin notu görünüyor');
  }
  ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${width} ${theme}: öğrenci panelinde taşma yok`);
  await card.screenshot({ path: path.join(shotDir, `ogrenci-geri-bildirim-${width}-${theme}.png`) });
  await ctx.close();
}

// 6. 16 yaş altı: yapay zekâ onayı yokken kontrol yok; öğretmen işaretleyince var.
const { ctx: mctx, page: minor } = await newPage(390);
await signIn(minor, 'genc@example.com', 'ogrenci123', 'student');
ok(await submit(minor) === 'not-allowed', '16 yaş altı, yapay zekâ onayı yok: "not-allowed"');
ok((await listDocs('aiDrafts')).length === 0, 'taslak oluşmadı');
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci3#yazilar`); await teacher.waitForSelector('#aiConsentBox [data-ai-allowed]', { timeout: 15000 }).catch(() => {});
ok((await teacher.textContent('#aiConsentBox')).includes('Kapalı'), 'öğretmen sayfasında 16 yaş altı için "Kapalı"');
await teacher.click('#aiConsentBox summary');
await teacher.locator('#aiConsentBox').screenshot({ path: path.join(shotDir, 'ogretmen-ai-onay.png') });
await teacher.click('[data-ai-consent-record]'); await teacher.waitForTimeout(1500);
const consent = (await getDocRest('users/ogrenci3')).fields.aiConsent?.mapValue?.fields;
ok(consent?.given?.booleanValue === true && consent?.method?.stringValue === 'form', 'velinin yapay zekâ onayı kaydedildi (tarih, yöntem)');
ok((await teacher.textContent('#aiConsentBox')).includes('Açık'), 'onaydan sonra "Açık"');
ok(await submit(minor) === 'draft' && (await listDocs('aiDrafts')).length === 1, 'onaydan sonra 16 yaş altı öğrencide de taslak oluşuyor');
await teacher.reload(); await teacher.waitForSelector('[data-ai-draft]', { timeout: 15000 }).catch(() => {});
await teacher.locator('[data-ai-draft] [data-ai-delete]').click(); await teacher.waitForTimeout(1500);
ok((await listDocs('aiDrafts')).length === 0, '"Taslağı sil" taslağı siliyor');
await mctx.close();

// 7. Günlük sınır: öğrenci başına 3.
await setLimit('ogrenci1', 3);
ok(await submit(student) === 'limit' && (await listDocs('aiDrafts')).length === 0, 'öğrenci başına günde 3: 4. kontrol yapılmadı');
await setLimit('ogrenci1', 1);
await setLimit('_global', 600);
ok(await submit(student) === 'limit', 'site genelinde günde 600: sınır dolunca kontrol yok');
await setLimit('_global', 5);

// 8. "Anında göster": öğrenci öneriyi hemen, etiketle görür.
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#aiModeSelect', { timeout: 15000 });
await teacher.selectOption('#aiModeSelect', 'instant'); await teacher.waitForTimeout(1000);
ok(plain(await getDocRest('settings/ai')).mode === 'instant', 'öğretmen modu "Anında göster" yaptı');
ok(await submit(student) === 'instant', 'Anında göster modunda Worker "instant" der');
const w5 = await latestWriting('ogrenci1');
ok(w5.aiAt && w5.raw.fields.aiFeedback.mapValue.fields.errors.arrayValue.values.length === 1 && !w5.feedbackAt, 'metne aiFeedback ve aiAt yazıldı, öğretmen geri bildirimi bekleniyor');
ok(await submit(student) === 'instant', 'ikinci metin de kontrol edildi (sayaç 3)');
await student.goto(`${BASE}/panel.html`); await student.waitForSelector(`[data-writing="${w5.id}"]`, { timeout: 15000 }).catch(() => {});
const card5 = student.locator(`[data-writing="${w5.id}"]`);
ok(await card5.locator('.acc-new-dot:not([hidden])').count() === 1, 'otomatik öneri "yeni" olarak işaretli');
await card5.locator(':scope > summary').click(); await student.waitForTimeout(800);
ok((await card5.textContent()).includes('Otomatik öneri (öğretmenin henüz bakmadı)') && await card5.locator('mark').count() === 1, 'öğrenci "Otomatik öneri" etiketini ve işaretli hatayı görüyor');
await card5.screenshot({ path: path.join(shotDir, 'ogrenci-aninda-1280.png') });
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1#yazilar`); await teacher.waitForSelector(`[data-writing="${w5.id}"] [data-ai-instant]`, { timeout: 15000 }).catch(() => {});
ok(await teacher.locator(`[data-writing="${w5.id}"] [data-ai-instant]`).count() === 1, 'öğretmen detayında "öğrenciye gösterildi" notu');

// 9. Kapalı: Worker hiçbir şey yapmaz.
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#aiModeSelect', { timeout: 15000 });
await teacher.selectOption('#aiModeSelect', 'off'); await teacher.waitForTimeout(1000);
const callsBefore = aiCalls.length;
ok(await submit(student) === 'off' && aiCalls.length === callsBefore, 'Kapalı modunda yapay zekâ çağrılmıyor');
await sctx.close();
await tctx.close();

await browser.close();
server.close();
wserver.close();
console.log('statuses', statuses.join(' '));
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
