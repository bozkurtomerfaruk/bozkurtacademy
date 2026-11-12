// Content-Security-Policy tarayıcı testleri (scripts/build-pages.mjs → CSP_DIRECTIVES).
//   npm run test:csp   (firebase emulators:exec içinde; Firebase Emulator auth + firestore gerekir)
//
// İki ortam:
//  - "Canlı": site dosyaları https://bozkurtacademy.com kökeninden verilir (Playwright route). Böylece hostname
//    kontrolleri (emülatör, takvim taklidi, GoatCounter'ın localhost atlaması) gerçekteki gibi çalışır.
//    Dış servisler (Firebase, Google, Web3Forms, GoatCounter) taklit edilir; CSP yine de tarayıcıda uygulanır,
//    çünkü izin kontrolü istek gönderilmeden önce yapılır.
//  - "Yerel emülatör": http://localhost + Firebase Emulator; öğretmen/öğrenci sayfaları, yorum gönderme, seviye testi.
// Her sayfada 'securitypolicyviolation' olayları ve "Content Security Policy" konsol mesajları toplanır; hiçbiri olmamalı.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LIVE = 'https://bozkurtacademy.com';
const PROJECT = 'demo-bozkurtacademy';
const RULES = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
const TEACHER = RULES.match(/function teacherUid\(\)\s*{\s*return '([^']+)'/)[1];

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };
function resolveFile(pathname){
  let file = path.join(ROOT, decodeURIComponent(pathname));
  if(!file.startsWith(ROOT)) return null;
  if(fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  return fs.existsSync(file) && fs.statSync(file).isFile() ? file : null;
}

// ---------- yerel statik sunucu (emülatör testleri) ----------
const server = http.createServer((req, res) => {
  const file = resolveFile(new URL(req.url, 'http://x').pathname);
  if(!file){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const LOCAL = `http://localhost:${server.address().port}`;

// ---------- emülatör ----------
const FS = 'http://127.0.0.1:8080', AUTH = 'http://127.0.0.1:9099';
async function resetEmulators(){
  await fetch(`${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  for(const [localId, email, password] of [[TEACHER, 'ogretmen@example.com', 'ogretmen123'], ['ogrenci1', 'ogrenci@example.com', 'ogrenci123']]){
    await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts`, {
      method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({ localId, email, password })
    });
  }
  // Öğrenci profili (öğretmen sayfaları listede bir öğrenci görsün); kuralları atlayarak yazılır.
  const now = { timestampValue: new Date().toISOString() };
  await fetch(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/users/ogrenci1`, {
    method: 'PATCH', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: {
      name: { stringValue: 'Deniz Kaya' }, email: { stringValue: 'ogrenci@example.com' }, birthYear: { integerValue: String(new Date().getUTCFullYear() - 25) },
      minor: { booleanValue: false }, provider: { stringValue: 'password' }, status: { stringValue: 'active' }, createdAt: now, approvedAt: now
    } })
  });
}
async function listDocs(collection){
  const r = await fetch(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${collection}?pageSize=100`, { headers: { Authorization: 'Bearer owner' } });
  return (await r.json()).documents || [];
}

// ---------- yardımcılar ----------
const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if(!cond) fails.push(label); };
const browser = await chromium.launch();
const GIF = Buffer.from('R0lGODlhAQABAAAAACw=', 'base64');

// Taklit Google Identity Services: gerçek betik gibi accounts.google.com/gsi/style yükler ve belirteç verir.
const GIS_STUB = `(function(){
  var l=document.createElement('link');l.rel='stylesheet';l.href='https://accounts.google.com/gsi/style';document.head.append(l);
  window.google={accounts:{oauth2:{
    initTokenClient:function(o){return{requestAccessToken:function(){setTimeout(function(){o.callback({access_token:'test-token',expires_in:3600,scope:o.scope})},10)}}},
    hasGrantedAllScopes:function(){return true}
  }}};
})();`;

// Bir tarayıcı bağlamı: CSP ihlallerini, sayfa hatalarını ve dış isteklerin hepsini kaydeder.
async function context({ live = true, theme = 'light', emulator = false, extraInit } = {}){
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const log = { violations: [], errors: [], requests: [], unknown: [] };
  await ctx.exposeBinding('__cspViolation', (_, v) => log.violations.push(v));
  await ctx.addInitScript(([th, emu]) => {
    document.addEventListener('securitypolicyviolation', (e) => window.__cspViolation(`${e.violatedDirective} ${e.blockedURI || '(inline)'} @ ${location.pathname}`));
    try{
      if(!sessionStorage.getItem('init')){
        sessionStorage.setItem('init', '1');
        localStorage.setItem('ba-theme', th); localStorage.setItem('baLang', 'tr');
        if(emu) localStorage.setItem('baEmulator', '1');
      }
    }catch(_){}
  }, [theme, emulator]);
  if(extraInit) await ctx.addInitScript(extraInit);

  await ctx.route('**/*', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    log.requests.push(req.url());
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'Access-Control-Allow-Origin': '*' } });
    if(url.origin === LIVE){
      const file = resolveFile(url.pathname);
      return file ? route.fulfill({ status: 200, contentType: TYPES[path.extname(file)] || 'application/octet-stream', body: fs.readFileSync(file) }) : route.fulfill({ status: 404, body: 'yok' });
    }
    if(url.origin === LOCAL || url.origin === FS || url.origin === AUTH) return route.continue();
    if(url.href.startsWith('https://www.gstatic.com/firebasejs/'))
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(path.join(ROOT, 'node_modules/firebase', path.basename(url.pathname))) });
    if(url.href.startsWith('https://accounts.google.com/gsi/client')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: GIS_STUB });
    if(url.href.startsWith('https://accounts.google.com/gsi/style')) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    if(url.href.startsWith('https://apis.google.com/js/api.js')) return route.fulfill({ status: 200, contentType: 'text/javascript', body: 'window.__gapiLoaded=true;' });
    if(url.hostname === 'bozkurtacademy-8ab85.firebaseapp.com' || url.hostname === 'accounts.google.com') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>taklit</title>' });
    if(url.hostname === 'bozkurtacademy.goatcounter.com') return route.fulfill({ status: 200, contentType: 'image/gif', body: GIF });
    if(url.hostname === 'api.web3forms.com') return json({ success: true, message: 'ok' });
    if(url.hostname === 'firestore.googleapis.com' && url.pathname.endsWith(':runQuery')) return json(log.runQuery || []);
    if(url.hostname === 'identitytoolkit.googleapis.com') return json({ error: { code: 400, message: 'INVALID_LOGIN_CREDENTIALS' } }, 400);
    if(url.hostname === 'www.googleapis.com' && url.pathname.startsWith('/calendar/')) return json({ id: 'ev1', hangoutLink: 'https://meet.google.com/abc-defg-hij', items: [] });
    log.unknown.push(req.url());
    return route.abort();
  });
  const page = await ctx.newPage();
  const watch = (p) => {
    p.on('pageerror', (e) => log.errors.push(e.message));
    p.on('console', (m) => { if(/Content Security Policy/i.test(m.text())) log.violations.push('konsol: ' + m.text().slice(0, 200)); });
  };
  watch(page);
  ctx.on('page', watch);
  page.on('dialog', (d) => d.accept());
  return { ctx, page, log };
}
const clean = (log, label, { errors = true } = {}) => {
  ok(log.violations.length === 0, `${label}: CSP ihlali yok${log.violations.length ? ' → ' + [...new Set(log.violations)].slice(0, 5).join(' | ') : ''}`);
  if(errors) ok(log.errors.length === 0, `${label}: sayfa hatası yok${log.errors.length ? ' → ' + log.errors.slice(0, 3).join(' | ') : ''}`);
  log.violations.length = 0; log.errors.length = 0;
};
async function signIn(page, email, password){
  await page.evaluate(async ([e, p]) => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, e, p);
  }, [email, password]);
}

// ---------- 0. Politika metni ----------
const allPages = [];
(function walk(dir){
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    if(['node_modules', '.git', 'docs', 'tests', '.claude', 'Material', '_blog', '.tts-modeller'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walk(full);
    // tools/audio-check-offline.html: offline review file with its own CSP, never published (scripts/build-audio-check-offline.mjs).
    else if(entry.name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(entry.name) && entry.name !== 'audio-check-offline.html') allPages.push('/' + path.relative(ROOT, full).replace(/index\.html$/, ''));
  }
})(ROOT);
allPages.sort();
{
  const { CSP } = await import('../scripts/csp.mjs').catch(() => ({}));
  const policies = new Set(allPages.map((p) => {
    const html = fs.readFileSync(resolveFile(p), 'utf8');
    return html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1] || '';
  }));
  ok(policies.size === 1 && !policies.has(''), `bütün ${allPages.length} sayfada aynı CSP var`);
  const policy = [...policies][0];
  ok(!/script-src[^;]*'unsafe-inline'/.test(policy) && !/script-src[^;]*'unsafe-eval'/.test(policy), "script-src 'unsafe-inline' / 'unsafe-eval' içermiyor");
  ok(/object-src 'none'/.test(policy) && /base-uri 'self'/.test(policy), "object-src 'none' ve base-uri 'self' var");
  if(CSP) ok(CSP === policy, 'sayfalardaki CSP build-pages.mjs ile aynı');
}

await resetEmulators();

// ---------- 1. Bütün sayfalar (canlı köken) ----------
{
  const { ctx, page, log } = await context({ theme: 'dark' });
  for(const p of allPages){
    await page.goto(LIVE + p, { waitUntil: 'load' });
    await page.waitForTimeout(150);
    const theme = await page.evaluate(() => document.documentElement.dataset.theme);
    if(theme !== 'dark') ok(false, `${p}: koyu tema başlatıcısı çalıştı (${theme})`);
  }
  ok(true, `${allPages.length} sayfa koyu temayla açıldı`);
  clean(log, 'bütün sayfalar');
  ok(log.unknown.length === 0, `izin listesinde olmayan dış istek yok${log.unknown.length ? ' → ' + log.unknown.slice(0, 5).join(' ') : ''}`);
  await ctx.close();
}

// ---------- 1a. security.txt ve Jekyll ----------
{
  const txt = fs.readFileSync(path.join(ROOT, '.well-known/security.txt'), 'utf8');
  const expires = new Date(txt.match(/^Expires: (.+)$/m)?.[1]);
  ok(/^Contact: mailto:\S+@\S+$/m.test(txt) && expires > new Date() && expires - new Date() <= 366 * 864e5, `security.txt: iletişim var, Expires gelecekte ve en çok 1 yıl sonra (${expires.toISOString?.()})`);
  ok(txt.includes(fs.readFileSync(path.join(ROOT, 'iletisim/index.html'), 'utf8').match(/mailto:([^"?]+)/)[1]), 'security.txt iletişim sayfasındaki e-postayı kullanıyor');
  ok(/include:\s*\n\s*-\s*\.well-known/.test(fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8')), '_config.yml .well-known klasörünü yayına dahil ediyor');
}

// ---------- 1b. GoatCounter (canlı köken; count.js localhost'u ve otomasyon tarayıcısını atlar, burada atlamamalı) ----------
{
  const { ctx, page, log } = await context({ extraInit: () => Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false }) });
  for(const p of ['/', '/hakkimda/', '/almanca-gramer/a1/artikel/', '/iletisim/', '/giris.html']){
    await page.goto(LIVE + p); await page.waitForTimeout(900);
  }
  const counts = log.requests.filter((u) => u.startsWith('https://bozkurtacademy.goatcounter.com/count')).map((u) => new URL(u).searchParams.get('p'));
  ok(['/', '/hakkimda/', '/almanca-gramer/a1/artikel/', '/iletisim/'].every((p) => counts.includes(p)), `GoatCounter herkese açık sayfaları saydı (${counts.join(' ')})`);
  ok(!counts.some((p) => /giris/.test(p)), 'GoatCounter giriş sayfasını saymadı');
  clean(log, 'GoatCounter');
  await ctx.close();
}

// ---------- 2. Resim yedeği (eski onerror) ve eski hash yönlendirmesi ----------
{
  const { ctx, page, log } = await context();
  await ctx.route(/omer-faruk-[a-z0-9]+\.webp$/, (route) => route.fulfill({ status: 404, body: '' }));
  for(const p of ['/hakkimda/', '/almanca-gramer/a1/artikel/', '/index.html']){
    await page.goto(LIVE + p); await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }));
    await page.locator('picture img').last().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(600);
    const r = await page.evaluate(() => [...document.querySelectorAll('picture img[src*="omer-faruk"]')].map((i) => ({ w: i.naturalWidth, sources: i.parentNode.querySelectorAll('source').length, src: i.currentSrc })));
    ok(r.length > 0 && r.every((i) => i.w > 0 && i.sources === 0 && /\.jpg/.test(i.src)), `${p}: WebP yoksa JPEG yedeği gösteriliyor (${JSON.stringify(r)})`);
  }
  await page.goto(LIVE + '/#about'); await page.waitForURL('**/hakkimda/');
  ok(page.url() === LIVE + '/hakkimda/', 'eski #about adresi /hakkimda/ sayfasına gidiyor');
  await page.goto(LIVE + '/#grammar/A1/artikel/3'); await page.waitForURL('**/almanca-gramer/a1/artikel/**');
  ok(page.url() === LIVE + '/almanca-gramer/a1/artikel/#a1-step-2', `eski #grammar/A1/artikel/3 adresi (${page.url()})`);
  clean(log, 'resim yedeği ve yönlendirme');
  await ctx.close();
}

// ---------- 3. CSP gerçekten uygulanıyor (negatif kontroller) ----------
{
  const { ctx, page, log } = await context();
  await page.goto(LIVE + '/iletisim/'); await page.waitForTimeout(300);
  await page.evaluate(() => {
    const s = document.createElement('script'); s.textContent = 'window.__inlineRan = true'; document.body.append(s);
    const d = document.createElement('div'); d.innerHTML = '<img src="/yok.png" onerror="window.__handlerRan=true">'; document.body.append(d);
    const f = document.createElement('iframe'); f.src = 'https://example.org/'; document.body.append(f);
    const x = document.createElement('script'); x.src = 'https://example.org/x.js'; document.body.append(x);
  });
  await page.waitForTimeout(800);
  ok(!(await page.evaluate(() => window.__inlineRan)), 'satır içi <script> çalışmıyor');
  ok(!(await page.evaluate(() => window.__handlerRan)), 'onerror="" niteliği çalışmıyor');
  const v = log.violations.join(' ');
  ok(/script-src/.test(v) && /frame-src https:\/\/example\.org/.test(v) && /example\.org\/x\.js/.test(v), 'izinsiz betik ve iframe engellendi (ihlal raporlandı)');
  log.violations.length = 0;
  // İzinli çerçeveler: Firebase Auth (authDomain), Google hesapları.
  await page.evaluate(() => {
    for(const src of ['https://bozkurtacademy-8ab85.firebaseapp.com/__/auth/iframe', 'https://accounts.google.com/gsi/iframe']){
      const f = document.createElement('iframe'); f.src = src; document.body.append(f);
    }
  });
  await page.waitForTimeout(600);
  clean(log, 'izinli iframe (Firebase Auth, Google)');
  await ctx.close();
}

// ---------- 4. Giriş sayfası: e-posta ve Google girişi (canlı köken) ----------
{
  const { ctx, page, log } = await context();
  await page.goto(LIVE + '/giris.html'); await page.waitForTimeout(800);
  await page.fill('#loginEmail', 'deneme@example.com');
  await page.fill('#loginPassword', 'yanlis-sifre');
  await page.click('#loginSubmit');
  await page.waitForSelector('#loginStatus:not([hidden])', { timeout: 15000 });
  ok(log.requests.some((u) => u.startsWith('https://identitytoolkit.googleapis.com/')), 'e-posta girişi Firebase Auth\'a ulaştı');
  // signInWithPopup önce apis.google.com yükleyicisiyle authDomain iframe'ini kurar, sonra pencereyi açar. Çevrimdışı
  // taklitte iframe hiç hazır olmadığından pencere açılmaz; burada betiğin yüklendiği ve iframe'in (bölüm 3) izinli
  // olduğu doğrulanır. Gerçek Google girişini yayından sonra elle dene (PR açıklamasındaki kontrol listesi).
  await page.click('#googleBtn');
  await page.waitForTimeout(1500);
  ok(await page.evaluate(() => window.__gapiLoaded === true), 'Google girişi için apis.google.com yükleyicisi CSP\'den geçti');
  clean(log, 'giriş sayfası', { errors: false });
  await ctx.close();
}

// ---------- 5. Google Takvim bağlantısı (canlı köken, gerçek kod yolu) ----------
{
  const { ctx, page, log } = await context({ emulator: true });
  await page.goto(LIVE + '/ogretmen-takvim.html'); await page.waitForTimeout(800);
  const r = await page.evaluate(async () => {
    const cal = await import('/js/account/calendar.js');
    cal.preload();
    await cal.connect();
    const ev = await cal.insertEvent({ summary: 'test' });
    return { usingMock: cal.usingMock, connected: cal.isConnected(), ev };
  });
  ok(r.usingMock === false, 'canlı adreste localStorage.baEmulator=1 olsa da takvim taklidi kullanılmıyor');
  ok(r.connected && r.ev.meetUrl === 'https://meet.google.com/abc-defg-hij', 'Google Identity Services ile bağlanıp Calendar API\'ye etkinlik eklendi');
  ok(log.requests.some((u) => u.startsWith('https://accounts.google.com/gsi/client')) && log.requests.some((u) => u.startsWith('https://www.googleapis.com/calendar/v3/')), 'gsi/client ve Calendar API istekleri CSP\'den geçti');
  ok(!log.requests.some((u) => /calendar-mock\.js/.test(u)), 'calendar-mock.js canlı adreste hiç istenmedi');
  const direct = await page.evaluate(() => import('/js/account/calendar-mock.js').then(() => 'yüklendi', (e) => 'reddedildi: ' + e.message));
  ok(direct.startsWith('reddedildi'), `calendar-mock.js canlı adreste doğrudan içe aktarılsa da çalışmıyor (${direct})`);
  // ?emulator=1 ile de canlıda emülatör/taklit açılmıyor.
  const viaQuery = await page.evaluate(async () => { history.replaceState(null, '', '?emulator=1'); const m = await import('/js/account/firebase.js?q=1'); return m.emulator; });
  ok(viaQuery === false, 'canlı adreste ?emulator=1 emülatör modunu açmıyor');
  clean(log, 'takvim bağlantısı', { errors: false });
  await ctx.close();
}

// ---------- 6. İletişim formu (canlı köken) ----------
{
  const { ctx, page, log } = await context();
  await page.goto(LIVE + '/iletisim/'); await page.waitForTimeout(500);
  await page.fill('#name', 'Deniz Kaya');
  await page.fill('#email', 'deniz@example.com');
  await page.fill('#message', 'B1 sınavına hazırlanıyorum.');
  await page.click('#contactSubmitBtn');
  await page.waitForSelector('#formStatus.success', { timeout: 10000 });
  ok(log.requests.some((u) => u === 'https://api.web3forms.com/submit'), 'iletişim formu Web3Forms\'a gönderildi');
  clean(log, 'iletişim formu');
  await ctx.close();
}

// ---------- 7. Yorumlar: onaylı yorumların okunması (canlı köken) ----------
{
  const { ctx, page, log } = await context();
  log.runQuery = [{ document: { fields: { name: { stringValue: 'Ayşe <b>kalın</b>' }, comment: { stringValue: 'Teşekkürler <img src=x onerror="window.__xss=1">' }, reply: { stringValue: '' }, createdAt: { timestampValue: '2026-10-01T10:00:00Z' } } } }];
  await page.goto(LIVE + '/almanca-gramer/a1/artikel/'); await page.waitForTimeout(400);
  await page.locator('.a1-comments').scrollIntoViewIfNeeded();
  await page.waitForSelector('.a1-comments-published:not([hidden]) .a1-comment-list *', { timeout: 10000 });
  const list = await page.locator('.a1-comment-list').innerHTML();
  ok(!/<img/.test(list) && !/<b>/.test(list) && (await page.locator('.a1-comment-list').textContent()).includes('<img src=x'), 'onaylı yorumdaki HTML metin olarak gösteriliyor');
  ok(!(await page.evaluate(() => window.__xss)), 'yorumdaki betik çalışmadı');
  ok(log.requests.some((u) => u.startsWith('https://firestore.googleapis.com/v1/projects/bozkurtacademy-8ab85/')), 'Firestore REST okuması CSP\'den geçti');
  clean(log, 'onaylı yorumlar');
  await ctx.close();
}

// ---------- 7b. XSS: veriden gelen kötü niyetli metin, seçenek, açıklama ve çizim (canlı köken) ----------
{
  const { ctx, page, log } = await context();
  const BAD = '<img src=x onerror="window.__xss=1">';
  await ctx.route(LIVE + '/data/a1/artikel.json*', (route) => {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/a1/artikel.json'), 'utf8'));
    const ex = data.exercises.find((e) => e.id === 'kontext-1');
    ex.title = { tr: 'Başlık ' + BAD, de: 'Titel ' + BAD, en: 'Title ' + BAD };
    Object.assign(ex.questions[0], { word: 'Wort' + BAD, options: [BAD, 'die', 'das'], correct: BAD, explanations: { tr: 'Açıklama ' + BAD, de: BAD, en: BAD } });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await ctx.route(LIVE + '/data/cocuk/resimler.json*', (route) => {
    const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/cocuk/resimler.json'), 'utf8'));
    for(const key of Object.keys(data.pictures)) data.pictures[key] += '<script>window.__xss=2</script><image href="x" onerror="window.__xss=3"/><a href="javascript:window.__xss=4"><rect width="1" height="1"/></a>';
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto(LIVE + '/#exercises/A1/artikel/kontext-1/q1'); await page.waitForSelector('.quiz-option');
  await page.locator('.quiz-option', { hasText: 'die' }).click();
  await page.click('#checkAnswerBtn'); await page.waitForTimeout(400);
  const quiz = await page.evaluate(() => ({ imgs: document.querySelectorAll('#quizOptions img, #quizFeedback img').length, text: document.querySelector('#quizFeedback').textContent }));
  ok(quiz.imgs === 0 && quiz.text.includes('<img src=x'), 'alıştırma: seçenek, doğru cevap ve açıklamadaki HTML metin olarak gösteriliyor');
  await page.goto(LIVE + '/#exercises/A1/artikel'); await page.waitForSelector('[data-exercise]');
  ok(await page.locator('.exercise-set-card img').count() === 0, 'alıştırma listesi: başlıktaki HTML metin olarak gösteriliyor');
  await page.goto(LIVE + '/#artikel-evleri'); await page.waitForSelector('[data-ae-theme]');
  await page.locator('[data-ae-theme]').first().click(); await page.waitForSelector('.ae-pic svg');
  const pic = await page.locator('.ae-pic svg').innerHTML();
  ok(!/script|image|<a\b|javascript/i.test(pic) && /<(path|circle|rect|g)\b/.test(pic), 'Artikel Evleri: çizimde yalnızca izinli SVG öğeleri kaldı');
  await page.waitForTimeout(300);
  ok(!(await page.evaluate(() => window.__xss)), 'kötü niyetli veriden hiçbir betik çalışmadı');
  clean(log, 'XSS verisi');
  await ctx.close();
}

// ---------- 7c. App Check: APPCHECK_SITE_KEY doluyken reCAPTCHA Enterprise CSP'den geçer (canlı köken) ----------
{
  const { ctx, page, log } = await context();
  const headers = [];
  await ctx.route(LIVE + '/js/account/config.js*', (route) => route.fulfill({ status: 200, contentType: 'text/javascript',
    body: fs.readFileSync(path.join(ROOT, 'js/account/config.js'), 'utf8').replace("APPCHECK_SITE_KEY = ''", "APPCHECK_SITE_KEY = 'test-site-key'") }));
  // Taklit reCAPTCHA Enterprise: görünmez pencereyi "çizer", hemen başarılı sayılır ve belirteç verir.
  await ctx.route('https://www.google.com/recaptcha/enterprise.js*', (route) => { log.requests.push(route.request().url()); return route.fulfill({ status: 200, contentType: 'text/javascript',
    body: "window.grecaptcha={enterprise:{ready:function(f){setTimeout(f)},render:function(el,o){setTimeout(function(){o.callback&&o.callback('ok')});return 'w1'},execute:function(){return Promise.resolve('recaptcha-token')}}};" }); });
  await ctx.route('https://content-firebaseappcheck.googleapis.com/**', (route) => route.fulfill({ status: 200, contentType: 'application/json',
    headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ token: 'appcheck-token', ttl: '3600s' }) }));
  await ctx.route('https://firestore.googleapis.com/**', (route) => { headers.push(route.request().headers()['x-firebase-appcheck'] || ''); return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '[]' }); });
  await page.goto(LIVE + '/almanca-gramer/a1/artikel/'); await page.waitForTimeout(400);
  await page.locator('.a1-comments').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  ok(log.requests.some((u) => u.startsWith('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js')) && log.requests.some((u) => u.startsWith('https://www.google.com/recaptcha/enterprise.js')), 'App Check SDK ve reCAPTCHA Enterprise betiği yüklendi');
  ok(headers.includes('appcheck-token'), `onaylı yorumların REST okuması X-Firebase-AppCheck başlığı taşıyor (${headers.join(',') || 'istek yok'})`);
  clean(log, 'App Check');
  await ctx.close();
}
{
  // Anahtar boşken (bugünkü ayar) App Check ve reCAPTCHA hiç yüklenmez.
  const { ctx, page, log } = await context();
  await page.goto(LIVE + '/almanca-gramer/a1/artikel/'); await page.locator('.a1-comments').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
  ok(!log.requests.some((u) => /app-check|recaptcha/.test(u)), 'APPCHECK_SITE_KEY boşken App Check atlanıyor');
  await ctx.close();
}

// ---------- 8. Yorum gönderme (yerel emülatör) ----------
{
  const { ctx, page, log } = await context({ live: false, emulator: true });
  await page.goto(LOCAL + '/almanca-gramer/a1/artikel/'); await page.waitForTimeout(500);
  const form = page.locator('.a1-comment-form');
  await form.scrollIntoViewIfNeeded();
  const fillComment = async () => {
    await form.locator('[name=name]').fill('Deniz');
    await form.locator('[name=email]').fill('deniz@example.com');
    await form.locator('[name=comment]').fill('Artikel konusunu çok iyi anladım, teşekkürler.');
    await form.locator('[name=consent]').check();
  };
  // Süre tuzağı: sayfa açıldıktan hemen sonra gelen gönderim kaydedilmez (bota başarı gibi görünür).
  await fillComment(); await form.locator('[type=submit]').click(); await page.waitForTimeout(800);
  ok(await page.locator('.a1-comment-status.success').count() === 1 && (await listDocs('comments')).length === 0, 'ilk 3 saniyedeki gönderim kaydedilmedi (süre tuzağı)');
  await page.waitForTimeout(3200);
  // Gizli "website" alanı (honeypot) doluysa da kayıt yok.
  await fillComment(); await form.locator('[name=website]').evaluate((el) => { el.value = 'http://spam.example'; });
  await form.locator('[type=submit]').click(); await page.waitForTimeout(800);
  ok((await listDocs('comments')).length === 0 && !log.requests.some((u) => u.includes('web3forms')), 'gizli alan dolu gönderim kaydedilmedi (honeypot)');
  await page.evaluate(() => { const st = document.querySelector('.a1-comment-status'); st.className = 'a1-comment-status'; st.textContent = ''; });
  await fillComment();
  await form.locator('[type=submit]').click();
  await page.waitForSelector('.a1-comment-status.success', { timeout: 20000 });
  const docs = await listDocs('comments');
  ok(docs.length === 1 && docs[0].fields.status.stringValue === 'pending', 'yorum emülatöre "pending" olarak kaydedildi');
  ok(log.requests.some((u) => u === 'https://api.web3forms.com/submit'), 'yorum bildirimi Web3Forms\'a gönderildi');
  clean(log, 'yorum gönderme');
  await ctx.close();
}

// ---------- 9. Seviye testi gönderimi (yerel emülatör) ----------
{
  const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/seviye-testi/sorular.json'), 'utf8'));
  const { ctx, page, log } = await context({ live: false, emulator: true });
  await page.goto(LOCAL + '/index.html#seviye-testi');
  await page.click('[data-pl-start]');
  const css = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  // İlk blokta bilerek yanlış cevaplar: test erken biter ve iletişim formu açılır.
  for(let guard = 0; guard < 10 && !(await page.locator('#plForm').count()); guard++){
    const ids = await page.locator('.pl-q[data-q]').evaluateAll((els) => els.map((e) => e.dataset.q));
    const qs = bank.blocks.flatMap((b) => [...b.questions, ...b.reading.questions]);
    for(const id of ids){
      const q = qs.find((x) => x.id === id);
      await page.locator(`.pl-q[data-q="${id}"] input[value="${css(q.options.find((o) => o !== q.answer))}"]`).check();
    }
    await page.click('[data-pl-finish]');
    await page.waitForTimeout(300);
    if(await page.locator('[data-pl-writing-done]').count()) await page.click('[data-pl-writing-done]');
  }
  await page.fill('#plName', 'Deniz Kaya');
  await page.fill('#plEmail', 'deniz@example.com');
  await page.selectOption('#plGoal', 'exam');
  await page.selectOption('#plExperience', '6to12m');
  await page.check('#plConsent');
  await page.locator('#plForm [type=submit]').click();
  await page.waitForSelector('[data-pl-done]', { timeout: 20000 });
  ok((await listDocs('placementTests')).length === 1, 'seviye testi emülatöre kaydedildi');
  clean(log, 'seviye testi');
  await ctx.close();
}

// ---------- 10. Öğretmen, yönetim ve öğrenci panelleri (yerel emülatör) ----------
{
  const { ctx, page, log } = await context({ live: false, emulator: true });
  await page.goto(LOCAL + '/giris.html'); await page.waitForTimeout(500);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123');
  for(const p of ['/ogretmen.html', '/ogretmen-ogrenci.html?id=ogrenci1', '/ogretmen-odev.html?ogrenci=ogrenci1', '/yonetim/yorumlar/', '/index.html#yonetim/seviye-testleri']){
    await page.goto(LOCAL + p); await page.waitForTimeout(1800);
    clean(log, `öğretmen ${p}`);
  }
  await page.goto(LOCAL + '/ogretmen-takvim.html');
  await page.waitForSelector('#calApp:not([hidden])', { timeout: 15000 });
  await page.click('#gcalConnect'); await page.waitForTimeout(800);
  ok((await page.locator('#gcalStatus').textContent()).includes('bağlı') && !(await page.locator('#gcalStatus').textContent()).includes('değil'), 'öğretmen takvimi (emülatör taklidi) bağlandı');
  clean(log, 'öğretmen takvimi');
  await ctx.close();

  const s = await context({ live: false, emulator: true });
  await s.page.goto(LOCAL + '/giris.html'); await s.page.waitForTimeout(500);
  await signIn(s.page, 'ogrenci@example.com', 'ogrenci123');
  await s.page.goto(LOCAL + '/panel.html'); await s.page.waitForTimeout(2500);
  clean(s.log, 'öğrenci paneli');
  await s.ctx.close();
}

await browser.close();
server.close();
if(fails.length){ console.log(`\n${fails.length} FAIL`); process.exit(1); }
console.log('\nALL PASSED');
