// Schreiben yapay zekâ (Aşama B), uçtan uca (Firebase Emulator: auth + firestore). Çalıştırma: npm run test:schreiben-ai
// Worker (worker/schreiben-kontrol.js) Node'da 127.0.0.1:8787'de çalışır; Firebase istekleri emülatöre gider, yapay zekâ
// sahte (gerçek Cloudflare çağrısı yok). Akış: mod yokken kontrol yapılmaz → öğretmen paneli varsayılan "Anında göster"i
// yazar, öğretmen "Taslak"a çevirir → öğrenci gönderir, taslak oluşur (öğrenci görmez; yapay zekâya sadece görev adı ve metin gider) → öğretmen düzeltip
// onaylar → öğrenci işaretli hataları görür → 16 yaş altı: yapay zekâ onayı yokken kontrol yok, öğretmen işaretleyince
// var → günlük sınır → "Anında göster" (varsayılan): geri bildirim görev sayfasında, "yanlış görünüyor" bildirimi öğretmen
// panelinde, öğretmen düzeltir, düzeltilmiş hâl (yeni deneme), sınır mesajı, 16 yaş altı (eski onay → taslak, onaysız →
// kontrol yok), ziyaretçide Firebase yüklenmez → Kapalı. Ekran görüntüleri 390/1440, açık/koyu: $S ya da geçici klasör.
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
let aiDelay = 0; // ms; "kontrol ediyor" durumunu görebilmek için
const WRONG = 'weil die alte Wohnung war zu teuer';
const RIGHT = 'weil die alte Wohnung zu teuer war';
const env = {
  FIREBASE_API_KEY: 'fake-api-key', FIREBASE_PROJECT_ID: PROJECT, ALLOWED_ORIGINS: BASE, SITE_URL: BASE,
  AI_EMAIL: 'yapayzeka@example.com', AI_PASSWORD: 'yapayzeka-sifre-123',
  AUTH_BASE: `${AUTH}/identitytoolkit.googleapis.com`, FIRESTORE_BASE: FS,
  AI: { run: async (model, input) => {
    aiCalls.push({ model, input });
    if (aiDelay) await new Promise((r) => setTimeout(r, aiDelay));
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

// 2. Öğretmen paneli varsayılan modu "Anında göster" olarak yazar; öğretmen "Taslak"a çevirebilir.
const { ctx: tctx, page: teacher } = await newPage(1440);
await signIn(teacher, 'ogretmen@example.com', 'ogretmen123', 'teacher');
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#aiModeSelect', { timeout: 15000 }).catch(() => {});
ok(await teacher.inputValue('#aiModeSelect') === 'instant' && plain(await getDocRest('settings/ai')).mode === 'instant', 'öğretmen paneli açılınca varsayılan mod "Anında göster" (settings/ai)');
ok(await teacher.locator('#aiModeSelect option').count() === 3, 'Kapalı ve Taslak seçenekleri duruyor');
ok(!(await teacher.textContent('#aiMode')).includes('null') && await teacher.locator('#aiMode [data-ai-mode-hint]').count() === 1, 'mod kutusunun altında "null" yazısı yok');
await teacher.selectOption('#aiModeSelect', 'draft'); await teacher.waitForTimeout(1000);
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
ok(sent.includes('Görev: Goethe B1 · Teil 1 · Neue Wohnung\\nMetin türü: Gayriresmî e-posta (du), arkadaşa') && sent.includes('Ich wohne jetzt seit zwei Wochen'), 'yapay zekâya görev adı, metin türü ve metin gitti');
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

// 8. "Anında göster" (varsayılan mod): geri bildirim görev sayfasında, öğretmen onayı beklenmeden.
const TASK = `${BASE}/index.html#exams/goethe/b1/schreiben/1/set-1`;
const resetWritingLimit = () => fetch(`${docsUrl}/users/ogrenci1/limits/writing`, { method: 'DELETE', headers: owner });
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#aiModeSelect', { timeout: 15000 });
await teacher.selectOption('#aiModeSelect', 'instant'); await teacher.waitForTimeout(1000);
ok(plain(await getDocRest('settings/ai')).mode === 'instant', 'öğretmen modu "Anında göster" yaptı');
await resetWritingLimit(); await setLimit('ogrenci1', 1);

// 8a. Öğrenci gönderir: önce "kontrol ediyor", sonra aynı sayfada işaretli metin, açıklama, düzeltilmiş metin, örnek cevap.
aiDelay = 1500;
await student.goto('about:blank'); await student.goto(TASK); await student.waitForSelector('#wtText');
ok((await student.textContent('[data-wt-who]')).includes('yapay zekâ'), 'gönderme notu yapay zekâ kontrolünü anlatıyor');
await student.fill('#wtText', TEXT); await student.click('[data-wt-submit]');
await student.waitForFunction(() => document.querySelector('.wt-status.is-pending')?.textContent.includes('Yapay zekâ'), null, { timeout: 10000 }).catch(() => {});
ok((await student.textContent('[data-wt-status]')).includes('Yapay zekâ kontrol ediyor'), 'gönderince "Yapay zekâ kontrol ediyor" durumu');
ok(await student.locator('[data-wt-model-later]').count() === 1 && await student.locator('[data-wt-model]').count() === 0, 'kontrol sürerken örnek cevap henüz kapalı');
ok(await student.locator('[data-wt-again]').isDisabled(), 'kontrol sürerken "yeniden yaz" kapalı');
await student.waitForSelector('[data-wf]', { timeout: 15000 }).catch(() => {});
aiDelay = 0;
ok(student.url().includes('#exams/goethe/b1/schreiben/1/set-1') && await student.locator('[data-wf]').count() === 1, 'geri bildirim aynı görev sayfasında göründü');
ok((await student.textContent('.wf-badge')) === 'Yapay zekâ geri bildirimi – nadiren hata yapabilir', 'etiket: "Yapay zekâ geri bildirimi – nadiren hata yapabilir"');
ok(!(await student.textContent('#examTask')).includes('öğretmenin henüz bakmadı'), '"öğretmen henüz bakmadı" etiketi yok');
ok(await student.locator('.wf-mark').count() === 1 && (await student.locator('.wf-mark').textContent()) === `${WRONG}1`, 'hatalı yer metin içinde işaretli');
await student.locator('.wf-mark').click();
ok(await student.locator('.wf-item.is-active').count() === 1 && (await student.textContent('.wf-item.is-active .wf-why')).includes('weil yan cümle kurar')
  && await student.getAttribute('.wf-mark', 'aria-expanded') === 'true', 'işarete tıklayınca Türkçe açıklaması öne çıkıyor');
await student.locator('.wf-mark').focus(); await student.keyboard.press('Enter');
ok(await student.evaluate(() => document.activeElement?.matches('.wf-item')), 'klavyeyle (Enter) de açıklamaya gidiliyor');
await student.click('.wf-corrected summary');
ok((await student.textContent('[data-wf-corrected]')).includes(RIGHT), 'düzeltilmiş metin açılıyor');
ok(await student.locator('[data-wt-model]').count() === 1 && (await student.textContent('[data-wt-status]')).includes('Kontrol bitti'), 'kontrol bitince örnek cevap açıldı');
ok(await student.evaluate(() => { const a = document.querySelector('[data-wf]'), b = document.querySelector('[data-wt-model]'); return Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING); }), 'örnek cevap geri bildirimden sonra geliyor');
ok((await student.textContent('[data-wt-again]')).trim() === 'Düzeltilmiş hâlini yaz', '"Düzeltilmiş hâlini yaz" düğmesi');
const w5 = await latestWriting('ogrenci1');
ok(w5.aiAt && w5.raw.fields.aiFeedback.mapValue.fields.errors.arrayValue.values.length === 1 && !w5.feedbackAt && w5.seenAt, 'metne aiFeedback ve aiAt yazıldı; öğretmen onayı yok; görüldü işaretli');
ok(!(await getDocRest(`aiDrafts/ogrenci1_${w5.id}`)), 'anında modunda taslak oluşmadı');

// 8b. Dil değişince geri bildirim ve durum kaybolmaz (DE/EN).
for (const [code, label] of [['de', 'KI-Rückmeldung – kann selten Fehler enthalten'], ['en', 'AI feedback – may occasionally be wrong']]) {
  await student.evaluate((l) => document.querySelector(`[data-lang="${l}"], [data-set-lang="${l}"], #lang-${l}`)?.click(), code);
  await student.waitForTimeout(600);
  const got = await student.locator('.wf-badge').textContent().catch(() => '');
  ok(got === label, `${code.toUpperCase()}: etiket çevrildi (${got})`);
}
await student.evaluate(() => document.querySelector('[data-lang="tr"], [data-set-lang="tr"], #lang-tr')?.click()); await student.waitForTimeout(600);

// 8c. "Bu açıklama yanlış görünüyor": öğretmene bildirilir.
await student.click('[data-wf-flag="0"]');
await student.waitForSelector('[data-wf-flagged="0"]', { timeout: 10000 }).catch(() => {});
ok((await student.textContent('.wf-flag-box')).includes('Öğretmenine bildirildi'), '"yanlış görünüyor" → "Öğretmenine bildirildi"');
const w5f = await latestWriting('ogrenci1');
ok(w5f.raw.fields.aiFlags?.arrayValue.values.length === 1 && w5f.raw.fields.aiFlags.arrayValue.values[0].integerValue === '0' && w5f.aiFlaggedAt, 'işaret Firestore\'da (aiFlags: [0])');

// 8d. Ekran görüntüleri (390/1440, açık/koyu) ve taşma: işaretlenmemiş, yapay zekânın kontrol ettiği dört yazı daha.
for (const [width, theme] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  await setLimit('ogrenci1', 1);
  const { ctx, page } = await newPage(width, theme);
  await signIn(page, 'ogrenci@example.com', 'ogrenci123', 'student');
  await page.goto(TASK); await page.waitForSelector('#wtText');
  await page.fill('#wtText', TEXT); await page.click('[data-wt-submit]');
  await page.waitForSelector('[data-wf]', { timeout: 15000 }).catch(() => {});
  await page.locator('.wf-mark').click().catch(() => {}); await page.waitForTimeout(400);
  ok(await page.locator('[data-wf]').count() === 1 && await overflow(page) <= 0, `${width} ${theme}: görev sayfasında geri bildirim var, taşma yok`);
  await page.locator('.wt-result').screenshot({ path: path.join(shotDir, `gorev-geri-bildirim-${width}-${theme}.png`) });
  await ctx.close();
}

// 8e. Öğretmen paneli: sayaç yapay zekânın kontrol ettiği yazıları saymaz; işaretlenen madde ve kontrol edilemeyenler sayılır.
const all = (await listDocs('users/ogrenci1/writings')).map((d) => d.fields);
const expected = all.filter((f) => !f.feedbackAt && (!f.aiFeedback || f.aiFlags)).length;
const checked = all.filter((f) => !f.feedbackAt && f.aiFeedback && !f.aiFlags).length;
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#list-ogrenciler [data-pending-writings]', { timeout: 15000 }).catch(() => {});
const badge = teacher.locator('#list-ogrenciler [data-flagged-writings="1"]');
ok(checked === 4 && await badge.count() === 1 && await badge.getAttribute('data-pending-writings') === String(expected),
  `sayaç: ${expected} yazı (1 işaretli + kontrol edilemeyenler); yapay zekânın kontrol ettiği ${checked} yazı sayılmıyor`);
ok((await teacher.textContent('#writingNotice')).includes('yanlış görünüyor') && await teacher.getAttribute('#writingNotice', 'data-flagged') === '1', 'öğretmen panelinde "yanlış görünüyor" bildirimi');
await teacher.screenshot({ path: path.join(shotDir, 'ogretmen-sayac-1440.png') });
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci1#yazilar`); await teacher.waitForSelector(`[data-ai-live="${w5.id}"]`, { timeout: 15000 }).catch(() => {});
const live = teacher.locator(`[data-ai-live="${w5.id}"]`);
ok(await teacher.locator(`[data-writing="${w5.id}"] [data-writing-flagged="1"]`).count() === 1 && await live.locator('[data-ai-flagged]').count() === 1, 'öğretmen: hangi yazı, hangi madde işaretlenmiş görünüyor');
ok(await teacher.locator('[data-writing-ai]').count() === 4 && await teacher.locator('details[data-writing][open]').count() === expected, 'kontrol edilmiş yazılar kapalı duruyor ama görülebiliyor; sadece bakılacaklar açık');
ok(await teacher.locator('[data-writing-waiting="limit"]').count() >= 1 && (await teacher.textContent('#writingsList')).includes('günlük sınır dolmuştu'), 'kontrol edilemeyen yazıda neden yazıyor (günlük sınır)');
await live.scrollIntoViewIfNeeded();
await live.screenshot({ path: path.join(shotDir, 'ogretmen-isaretli-madde-1440.png') });
await teacher.setViewportSize({ width: 390, height: 900 });
ok(await overflow(teacher) <= 0, '390: öğretmen sayfasında taşma yok');
await live.screenshot({ path: path.join(shotDir, 'ogretmen-isaretli-madde-390.png') });
await teacher.setViewportSize({ width: 1280, height: 900 });
await live.locator('[data-ai-erklaerung]').fill('Öğretmen: weil yan cümlesinde çekimli fiil sonda durur: … zu teuer war.');
await live.locator('[data-ai-note]').fill('Haklısın, açıklama eksikti; düzelttim.');
await live.locator('[data-ai-approve]').click(); await teacher.waitForTimeout(1500);
const w5t = (await listDocs('users/ogrenci1/writings')).map((d) => ({ id: d.name.split('/').pop(), f: d.fields })).find((d) => d.id === w5.id).f;
ok(w5t.feedbackSource.stringValue === 'ai-edited' && w5t.feedbackItems.arrayValue.values[0].mapValue.fields.by?.stringValue === 'teacher' && w5t.feedback.stringValue.startsWith('Haklısın'), 'öğretmen maddeyi düzeltti ve not yazdı (by: teacher)');
await teacher.goto(`${BASE}/ogretmen.html`); await teacher.waitForSelector('#list-ogrenciler [data-pending-writings]', { timeout: 15000 }).catch(() => {});
ok(await teacher.locator(`#list-ogrenciler [data-pending-writings="${expected - 1}"][data-flagged-writings="0"]`).count() === 1, 'düzeltmeden sonra işaretli yazı sayaçtan düştü');

// 8f. Öğrenci paneli: geçmiş geri bildirim, "Öğretmenin düzeltti" etiketi ve not.
const { ctx: pctx, page: panel } = await newPage(390);
await signIn(panel, 'ogrenci@example.com', 'ogrenci123', 'student');
await panel.goto(`${BASE}/panel.html`); await panel.waitForSelector(`[data-writing="${w5.id}"]`, { timeout: 15000 }).catch(() => {});
const card5 = panel.locator(`[data-writing="${w5.id}"]`);
await card5.locator(':scope > summary').click(); await panel.waitForTimeout(800);
ok(await card5.locator('[data-item-by="teacher"]').count() === 1 && (await card5.textContent()).includes('Öğretmenin düzeltti') && (await card5.textContent()).includes('Haklısın'), 'öğrenci panelinde düzeltilen maddede "Öğretmenin düzeltti" ve not');
await card5.screenshot({ path: path.join(shotDir, 'ogrenci-ogretmen-duzeltti-390.png') });
const other = panel.locator('[data-writing]:has([data-writing-auto])').first();
await other.locator(':scope > summary').click(); await panel.waitForTimeout(800);
ok(await other.locator('.wf-mark').count() === 1 && (await other.textContent()).includes('Yapay zekâ geri bildirimi – nadiren hata yapabilir') && await other.locator('[data-wf-flag]').count() === 1, 'panelde geçmiş yapay zekâ geri bildirimi (işaretli metin, etiket, "yanlış görünüyor" düğmesi) duruyor');
ok(await overflow(panel) <= 0, '390: öğrenci panelinde taşma yok');
await other.screenshot({ path: path.join(shotDir, 'ogrenci-panel-yapay-zeka-390.png') });

// 8g. Düzeltilmiş hâl: yeni deneme, ilk yazıya bağlı, günlük yapay zekâ sınırına dahil.
await setLimit('ogrenci1', 2);
await student.click('[data-wt-again]'); await student.waitForSelector('#wtText');
ok((await student.inputValue('#wtText')) === TEXT && await student.locator('[data-wt-revision]').count() === 1, 'düzenleyicide önceki metin ve "yeni deneme" notu');
await student.fill('#wtText', TEXT.replace(WRONG, RIGHT)); await student.click('[data-wt-submit]');
await student.waitForSelector('[data-wf]', { timeout: 15000 }).catch(() => {});
const w6 = await latestWriting('ogrenci1');
ok(w6.revisionOf === w5.id && w6.id !== w5.id && w6.aiAt, 'düzeltilmiş hâl yeni bir yazı olarak kaydedildi (revisionOf) ve kontrol edildi');
ok(await student.locator('.wf-mark').count() === 0 && (await student.textContent('[data-wf]')).includes('hata bulmadı'), 'düzeltilmiş metinde hata kalmadı');
ok(plain(await getDocRest('aiLimits/ogrenci1')).count === '3', 'düzeltilmiş hâl günlük yapay zekâ sınırına sayıldı (3/3)');
await panel.reload(); await panel.waitForSelector(`[data-writing="${w6.id}"]`, { timeout: 15000 }).catch(() => {});
ok(await panel.locator(`[data-writing="${w6.id}"] [data-writing-attempt="2"]`).count() === 1 && await panel.locator(`[data-writing="${w5.id}"] [data-writing-attempt="1"]`).count() === 1
  && await panel.evaluate(([a, b]) => document.querySelector(`[data-writing="${a}"]`).nextElementSibling === document.querySelector(`[data-writing="${b}"]`), [w5.id, w6.id]), 'panelde "2. deneme" ilk yazının hemen altında');
await pctx.close();

// 8h. Sınır dolunca açık mesaj; metin öğretmene kalır.
await student.click('[data-wt-again]'); await student.waitForSelector('#wtText');
await student.fill('#wtText', TEXT); await student.click('[data-wt-submit]');
await student.waitForSelector('.wt-status.error', { timeout: 15000 }).catch(() => {});
ok((await student.textContent('[data-wt-status]')) === 'Bugünkü yapay zekâ kontrolün bitti (günde 3 metin), yarın tekrar dene; metnin öğretmenine iletildi.', 'sınır dolunca açık mesaj');
ok(await student.locator('[data-wf]').count() === 0 && await student.locator('[data-wt-model]').count() === 1 && await student.locator('#wtText').count() === 0, 'sınırda geri bildirim yok; örnek cevap açık');
const w7 = await latestWriting('ogrenci1');
ok(w7.aiSkip === 'limit' && !w7.aiAt && w7.revisionOf === w6.id, 'neden yazıya kaydedildi (aiSkip: limit); öğretmen sayacına girer');
await student.screenshot({ path: path.join(shotDir, 'gorev-sinir-1280.png') });

// 8i. 16 yaş altı: eski formla alınmış onay → taslak öğretmene (öğrenci görmez); onay yok → yapay zekâ çalışmaz.
const patchConsent = (fields) => fetch(`${docsUrl}/users/ogrenci3?updateMask.fieldPaths=aiConsent`, { method: 'PATCH', headers: owner, body: JSON.stringify({ fields }) });
ok(plain(await getDocRest('users/ogrenci3')).aiConsent.fields.version?.integerValue === '2', 'öğretmenin kaydettiği veli onayı yeni form sürümüyle (2)');
await patchConsent({ aiConsent: { mapValue: { fields: { given: { booleanValue: true }, at: now(), method: { stringValue: 'form' }, recordedAt: now() } } } });
const { ctx: mctx2, page: minor2 } = await newPage();
await signIn(minor2, 'genc@example.com', 'ogrenci123', 'student');
const draftsBefore = (await listDocs('aiDrafts')).length;
ok(await submit(minor2) === 'draft' && (await listDocs('aiDrafts')).length === draftsBefore + 1, '16 yaş altı, eski onay, mod "Anında göster": sonuç taslak olarak öğretmene gitti');
await minor2.waitForSelector('.wt-status.success', { timeout: 15000 }).catch(() => {});
ok(await minor2.locator('[data-wf]').count() === 0 && (await minor2.textContent('[data-wt-status]')).includes('Öğretmenin okuyup') && await minor2.locator('[data-wt-model]').count() === 1, 'öğrenci yapay zekâ sonucunu görmüyor; kontrol listesi akışı (örnek cevap + öğretmen)');
ok(!(await latestWriting('ogrenci3')).aiFeedback, 'metne aiFeedback yazılmadı');
await teacher.goto(`${BASE}/ogretmen-ogrenci.html?id=ogrenci3#yazilar`); await teacher.waitForSelector('#aiConsentBox [data-ai-allowed]', { timeout: 15000 }).catch(() => {});
ok(await teacher.locator('[data-ai-consent-old]').count() === 1, 'öğretmen sayfasında "eski formla alındı" uyarısı');
await patchConsent({});
const callsMinor = aiCalls.length;
ok(await submit(minor2) === 'not-allowed' && aiCalls.length === callsMinor, '16 yaş altı, yapay zekâ onayı yok: yapay zekâ çalışmadı');
await minor2.waitForSelector('.wt-status.success', { timeout: 15000 }).catch(() => {});
ok(await minor2.locator('[data-wf]').count() === 0 && await minor2.locator('[data-wt-model]').count() === 1 && (await latestWriting('ogrenci3')).aiSkip === 'consent', 'onaysız öğrencide akış eskisi gibi; neden kaydedildi (aiSkip: consent)');
await mctx2.close();

// 8j. Ziyaretçi: Firebase, Worker ve geri bildirim modülü hiç yüklenmez.
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.goto(TASK); await page.waitForSelector('#wtText');
  await page.fill('#wtText', TEXT); await page.click('[data-wt-submit]'); await page.waitForTimeout(1500);
  ok(!requests.some((u) => /firebasejs|firestore|identitytoolkit|:8080|:9099|:8787|writing-feedback\.js|account\/firebase\.js/.test(u)), 'ziyaretçide Firebase, Worker ve geri bildirim modülü yüklenmedi');
  ok(await page.locator('[data-wt-model]').count() === 1 && await page.locator('.is-pending').count() === 0 && (await page.textContent('[data-wt-again]')).trim() === 'Yeniden yaz', 'ziyaretçi örnek cevabı hemen görüyor');
  await ctx.close();
}
await setLimit('ogrenci1', 1);

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
