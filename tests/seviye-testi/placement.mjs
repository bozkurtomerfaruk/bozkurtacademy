// Seviye testi (#seviye-testi) ve yönetim sayfası (#yonetim/seviye-testleri) tarayıcı testleri.
// Gerçek Firestore'a hiçbir şey yazmaz: Firebase Emulator (auth + firestore) gerekir.
//   npm run test:placement
// (firebase emulators:exec içinde çalışır; site için kendi statik sunucusunu açar. Firebase SDK
// dosyaları gstatic yerine node_modules/firebase'den verilir.) Ekran görüntüleri: $S ya da geçici klasör.
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const PROJECT = 'demo-bozkurtacademy';
const RULES = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8');
const TEACHER = RULES.match(/function teacherUid\(\)\s*{\s*return '([^']+)'/)[1];
const bank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/seviye-testi/sorular.json'), 'utf8'));
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'placement-shots-'));

// ---------- statik sunucu ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if(!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){ res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const B = `http://localhost:${server.address().port}/index.html`;

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
}
// Kuralları atlayarak okur (sadece doğrulama için).
async function listDocs(collection){
  const r = await fetch(`${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${collection}?pageSize=100`, { headers: { Authorization: 'Bearer owner' } });
  return (await r.json()).documents || [];
}

// ---------- yardımcılar ----------
const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if(!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();

async function newPage({ width = 1280, theme = 'light', lang = 'tr', emulator = true } = {}){
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(([th, lg, emu]) => {
    try{
      if(!sessionStorage.getItem('init')){
        sessionStorage.setItem('init', '1');
        localStorage.setItem('ba-theme', th); localStorage.setItem('baLang', lg);
        if(emu) localStorage.setItem('baEmulator', '1');
      }
    }catch(_){}
  }, [theme, lang, emulator]);
  await ctx.route('https://www.gstatic.com/firebasejs/**', (route) => {
    const file = path.join(ROOT, 'node_modules/firebase', path.basename(new URL(route.request().url()).pathname));
    route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(file) });
  });
  // GoatCounter: count.js yerine bir kayıt tutucu; hangi yolların sayıldığını görürüz.
  await ctx.route('**/js/vendor/count.js*', (route) => route.fulfill({ status: 200, contentType: 'text/javascript',
    body: 'window.__counted=[];window.goatcounter={count:o=>window.__counted.push(o.path),filter:()=>false};' }));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.accept());
  return { ctx, page };
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const blockQs = (i) => [...bank.blocks[i].questions, ...bank.blocks[i].reading.questions];
const wrongOption = (q) => q.options.find((o) => o !== q.answer);
const css = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
async function answerBlock(page, i, correctCount, { unknown = false } = {}){
  const qs = blockQs(i);
  for(let k = 0; k < qs.length; k++){
    const q = qs[k];
    const value = k < correctCount ? q.answer : (unknown ? '?' : wrongOption(q));
    await page.locator(`.pl-q[data-q="${q.id}"] input[value="${css(value)}"]`).check();
  }
  await page.click('[data-pl-finish]');
  await page.waitForTimeout(150);
}
async function start(page, hash = '#seviye-testi'){
  await page.goto(B + hash);
  await page.waitForSelector('[data-pl-start], [data-pl-finish], #plForm, [data-pl-writing-done], [data-pl-done]');
}
async function fillForm(page, { name = 'Deniz Kaya', email = 'deniz@example.com', consent = true } = {}){
  await page.fill('#plName', name);
  await page.fill('#plEmail', email);
  await page.selectOption('#plGoal', 'exam');
  await page.selectOption('#plExperience', '6to12m');
  await page.fill('#plExamName', 'Goethe B1');
  await page.fill('#plExamDate', '2027-03-15');
  await page.fill('#plNote', 'Konuşmada zorlanıyorum.');
  if(consent) await page.check('#plConsent');
}
async function signIn(page, email, password){
  await page.evaluate(async ([e, p]) => {
    const { auth, fa } = await import('/js/account/firebase.js');
    await fa.signInWithEmailAndPassword(auth, e, p);
  }, [email, password]);
}

await resetEmulators();

// 1. Bağlantılar ve menü
{
  const { ctx, page } = await newPage();
  await page.goto(B + '#home'); await page.waitForTimeout(400);
  ok(await page.locator('.nav-links a[href="#seviye-testi"]').count() === 0, 'menüde seviye testi öğesi yok');
  ok(await page.locator('a[href*="yonetim"]').count() === 0, 'sitede yönetim sayfasına bağlantı yok');
  await page.click('#page-home a[href="#seviye-testi"]'); await page.waitForTimeout(400);
  ok(await page.locator('#page-seviye-testi.active [data-pl-start]').isVisible(), 'ana sayfadaki "Seviyeni ölç" testi açıyor');
  await page.goto(B + '#lessons'); await page.waitForTimeout(400);
  ok((await page.locator('#page-lessons .pl-promo h2').textContent()).includes('seviyeni ölç'), 'Dersler sayfasında kart var');
  await page.click('#page-lessons .pl-promo a'); await page.waitForTimeout(400);
  ok(page.url().endsWith('#seviye-testi') && await page.locator('[data-pl-start]').isVisible(), 'Dersler kartı testi açıyor');
  await page.goto(B + '#contact'); await page.waitForTimeout(400);
  ok((await page.locator('#page-contact .contact-level-link').textContent()).includes('Seviyeni bilmiyor musun?'), 'İletişim sayfasında not var');
  await page.click('#page-contact .contact-level-link'); await page.waitForTimeout(400);
  ok(await page.locator('[data-pl-start]').isVisible(), 'İletişim bağlantısı testi açıyor');
  const counted = await page.evaluate(() => window.__counted);
  ok(counted.includes('/#seviye-testi'), `sayaç testi ayrı sayfa sayıyor (${counted.join(' ')})`);
  await ctx.close();
}

// 2. Blok geçişleri: hepsi doğru → C1'e kadar; sonra yazma ve sonuç
{
  const { ctx, page } = await newPage();
  await start(page);
  await page.click('[data-pl-start]');
  for(let i = 0; i < 5; i++){
    ok((await page.locator('.pl-kicker').textContent()).includes(`${i + 1} / 5`), `blok ${bank.blocks[i].level} açıldı`);
    await answerBlock(page, i, 10);
  }
  ok(await page.locator('#plWriting').isVisible(), 'C1 sonrası yazma görevi');
  ok((await page.locator('#plWritingExpected').textContent()).includes('150–200'), 'C1 için beklenen uzunluk 150–200');
  await page.click('[data-pl-writing-skip]'); await page.waitForTimeout(200);
  ok((await page.locator('[data-pl-level]').textContent()).trim() === 'C1', 'hepsi doğru → C1');
  ok(await page.locator('.pl-weak').count() === 0, 'zayıf konu yok');
  await ctx.close();
}

// 3. Erken bitiş: A1'de 5 doğru → test biter, A0 – A1'e yakın; cevapsız uyarısı
{
  const { ctx, page } = await newPage();
  await start(page);
  await page.click('[data-pl-start]');
  await page.click('[data-pl-finish]'); await page.waitForTimeout(150);
  ok((await page.locator('.pl-status').textContent()).includes('10 soru cevapsız'), 'cevapsız sorular için uyarı');
  ok(await page.locator('.pl-q.is-missing').count() === 10, 'cevapsız sorular işaretli');
  await answerBlock(page, 0, 5, { unknown: true });
  ok(await page.locator('#plWriting').isVisible(), 'A1 geçilemeyince test biter (yazma görevine geçer)');
  ok((await page.locator('#plWritingExpected').textContent()).includes('20–40'), 'A0 için beklenen uzunluk 20–40');
  await page.fill('#plWriting', 'Ich heiße Ali.');
  ok((await page.locator('#plWordCount').textContent()).includes('3'), 'kelime sayacı');
  await page.click('[data-pl-writing-done]'); await page.waitForTimeout(200);
  ok((await page.locator('[data-pl-level]').textContent()).includes('A0 – A1'), 'A1 5/10 → A0 – A1’e yakın');
  ok((await page.locator('.pl-blocks').textContent()).includes('5 / 10'), 'blok sonucu gösteriliyor');
  ok(await page.locator('.pl-disclaimer').textContent().then((t) => t.includes('kesin seviyeni ilk derste')), 'tahmini sonuç notu');
  await ctx.close();
}

// 4. Sonuç hesaplama ve zayıf konu bağlantıları: A1 10, A2 6 (sınırda geçer), B1 4 → A2 – B1'e yakın
{
  const { ctx, page } = await newPage();
  await start(page);
  await page.click('[data-pl-start]');
  await answerBlock(page, 0, 10);
  await answerBlock(page, 1, 6);
  ok((await page.locator('.pl-kicker').textContent()).includes('3 / 5'), 'A2’de 6/10 → B1’e geçiş');
  await answerBlock(page, 2, 4);
  await page.click('[data-pl-writing-skip]'); await page.waitForTimeout(200);
  ok((await page.locator('[data-pl-level]').textContent()).trim() === 'A2 – B1 seviyesine yakın', 'A2 – B1’e yakın');
  const links = await page.locator('.pl-weak a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const wrongTopics = new Set([...blockQs(1).slice(6), ...blockQs(2).slice(4)].map((q) => q.topic));
  ok(links.includes('#grammar/B1/relativsaetze') === wrongTopics.has('relativsaetze'), `gramer bağlantıları: ${links.join(' ')}`);
  ok(links.every((h) => /^#(grammar|exercises)\/(A1|A2|B1|B2)\//.test(h)), 'bağlantılar sitedeki gramer/alıştırma sayfalarına gidiyor');
  await page.click('.pl-weak a[href^="#grammar/"]'); await page.waitForTimeout(800);
  ok(await page.locator('#page-grammar.active').count() === 1, 'zayıf konu bağlantısı gramer sayfasını açıyor');
  await ctx.close();
}

// 5. "Hiç Almanca bilmiyorum" → doğrudan form
{
  const { ctx, page } = await newPage();
  await start(page);
  await page.click('[data-pl-skip]'); await page.waitForTimeout(200);
  ok(await page.locator('.pl-q').count() === 0 && await page.locator('#plForm').isVisible(), 'test atlanır, form açılır');
  ok((await page.locator('[data-pl-level]').textContent()).includes('A0'), 'seviye A0');
  await ctx.close();
}

// 6. Seçenek sırası karışıyor; yenileyince kaldığı yerden devam (aynı sıra, aynı cevaplar)
{
  const orders = new Set();
  for(let i = 0; i < 4; i++){
    const { ctx, page } = await newPage();
    await start(page); await page.click('[data-pl-start]');
    orders.add((await page.locator('.pl-q').first().locator('input').evaluateAll((xs) => xs.map((x) => x.value))).join('|')
      + (await page.locator('.pl-q').nth(1).locator('input').evaluateAll((xs) => xs.map((x) => x.value))).join('|'));
    await ctx.close();
  }
  ok(orders.size > 1, `seçenek sırası açılıştan açılışa değişiyor (${orders.size} farklı sıra)`);

  const { ctx, page } = await newPage();
  await start(page); await page.click('[data-pl-start]');
  await answerBlock(page, 0, 10);
  const q = blockQs(1)[0], q2 = blockQs(1)[1];
  await page.locator(`.pl-q[data-q="${q.id}"] input[value="${css(q.answer)}"]`).check();
  await page.locator(`.pl-q[data-q="${q2.id}"] input[value="?"]`).check();
  const before = await page.locator(`.pl-q[data-q="${q.id}"] input`).evaluateAll((xs) => xs.map((x) => x.value));
  await page.waitForTimeout(1200);
  await page.reload(); await page.waitForSelector('[data-pl-finish]');
  ok((await page.locator('.pl-kicker').textContent()).includes('2 / 5'), 'yenileme sonrası aynı blok (A2)');
  ok(await page.locator(`.pl-q[data-q="${q.id}"] input[value="${css(q.answer)}"]`).isChecked(), 'yenileme sonrası cevap korunuyor');
  ok(await page.locator(`.pl-q[data-q="${q2.id}"] input[value="?"]`).isChecked(), '“Bilmiyorum” cevabı korunuyor');
  const after = await page.locator(`.pl-q[data-q="${q.id}"] input`).evaluateAll((xs) => xs.map((x) => x.value));
  ok(before.join() === after.join(), 'yenileme sonrası seçenek sırası aynı');
  const elapsed = await page.evaluate(() => JSON.parse(localStorage.getItem('baPlacement')).elapsedMs);
  ok(elapsed >= 1000, `geçen süre kaydediliyor (${elapsed} ms)`);
  await ctx.close();
}

// 7. Form doğrulama, gönderim (emülatör), bekleme süresi
let submittedId = null;
{
  const { ctx, page } = await newPage();
  await start(page); await page.click('[data-pl-start]');
  await answerBlock(page, 0, 10);
  await answerBlock(page, 1, 7);
  await answerBlock(page, 2, 3);
  await page.fill('#plWriting', 'Ich heiße Deniz. Ich möchte in Deutschland studieren.');
  await page.click('[data-pl-writing-done]'); await page.waitForTimeout(200);
  await page.click('[data-pl-submit]'); await page.waitForTimeout(200);
  ok(await page.locator('.pl-field.is-invalid').count() === 5, 'boş form: 5 zorunlu alan hatalı (ad, e-posta, hedef, süre, onay)');
  ok(await page.evaluate(() => document.activeElement?.id) === 'plName', 'ilk hatalı alana odak');
  await fillForm(page, { email: 'deniz@', consent: false });
  await page.click('[data-pl-submit]'); await page.waitForTimeout(200);
  ok((await page.locator('#plEmailError').textContent()).length > 0, 'geçersiz e-posta reddediliyor');
  ok((await page.locator('#plConsentError').textContent()).length > 0, 'onay kutusu zorunlu');
  ok((await listDocs('placementTests')).length === 0, 'hatalı formda hiçbir şey yazılmadı');
  await page.fill('#plEmail', 'deniz@example.com');
  await page.check('#plConsent');
  await page.click('[data-pl-submit]');
  await page.waitForSelector('[data-pl-done]', { timeout: 15000 });
  ok((await page.locator('[data-pl-done]').textContent()).includes('Sonucun bana ulaştı'), 'gönderim sonrası teşekkür mesajı');
  ok(await page.locator('.pl-done a[href^="mailto:"]').count() === 1, 'ilk ders için iletişim bilgisi');
  const docs = await listDocs('placementTests');
  ok(docs.length === 1, 'emülatörde 1 sonuç kaydı');
  const f = docs[0]?.fields || {};
  submittedId = docs[0]?.name.split('/').pop();
  ok(f.level?.stringValue === 'A2' && f.near?.stringValue === '', `kayıtta seviye A2 (${f.level?.stringValue}/${f.near?.stringValue})`);
  ok(f.blocks?.mapValue?.fields?.B1?.mapValue?.fields?.correct?.integerValue === '3', 'kayıtta blok doğru sayıları');
  ok((f.wrong?.stringValue || '').split('\n').length === 3 + 7, 'kayıtta 10 yanlış cevap');
  ok(f.topicErrors?.stringValue.includes('lesen:'), 'kayıtta konu bazında hatalar');
  ok(f.writing?.stringValue.startsWith('Ich heiße Deniz'), 'kayıtta yazma metni');
  ok(Number(f.durationSec?.integerValue) >= 0 && 'createdAt' in f && 'expireAt' in f, 'kayıtta süre, tarih, expireAt');
  const days = (Date.parse(f.expireAt.timestampValue) - Date.parse(f.createdAt.timestampValue)) / 864e5;
  ok(Math.abs(days - 183) < 0.1, `expireAt = createdAt + 183 gün (${days.toFixed(2)})`);
  ok(f.read?.booleanValue === false && !('adminNote' in f), 'okunmadı, yönetici notu yok');
  ok(await page.evaluate(async () => { const { auth } = await import('/js/account/firebase.js'); return auth.currentUser === null; }), 'anonim oturum gönderimden sonra kapandı');
  ok(await page.evaluate(() => localStorage.getItem('baPlacement') === null), 'gönderimden sonra ilerleme silindi');

  // Hemen ikinci gönderim: tarayıcıdaki bekleme uyarısı
  await page.click('.pl-done .btn.ghost'); await page.click('[data-pl-skip]'); await page.waitForTimeout(200);
  await fillForm(page);
  await page.click('[data-pl-submit]'); await page.waitForTimeout(500);
  ok((await page.locator('#plFormStatus').textContent()).includes('10 dakika'), 'ikinci gönderimde bekleme süresi uyarısı');
  ok((await listDocs('placementTests')).length === 1, 'bekleme süresinde yeni kayıt yok');
  await ctx.close();
}

// 8. Yönetim sayfası: giriş yok / öğretmen değil → veri yüklenmez
for(const who of ['guest', 'student']){
  const { ctx, page } = await newPage();
  const firestoreRequests = [];
  page.on('request', (r) => { if(r.url().startsWith(FS) || r.url().includes('firestore.googleapis.com')) firestoreRequests.push(r.url()); });
  await page.goto(B + '#home'); await page.waitForTimeout(300);
  if(who === 'student') await signIn(page, 'ogrenci@example.com', 'ogrenci123');
  await page.goto(B + '#yonetim/seviye-testleri'); await page.waitForSelector('[data-admin-denied]', { timeout: 15000 });
  ok((await page.locator('#adminApp').textContent()).trim() === 'Bu sayfaya erişimin yok.', `${who}: sadece "Bu sayfaya erişimin yok"`);
  ok(await page.locator('[data-admin-list]').count() === 0, `${who}: liste yok`);
  ok(firestoreRequests.length === 0, `${who}: Firestore'a hiç istek gitmedi (${firestoreRequests.length})`);
  // Kurallar da engelliyor: tarayıcıdan doğrudan okumayı dene
  const denied = await page.evaluate(async () => {
    const { db, fs } = await import('/js/account/firebase.js');
    try{ await fs.getDocs(fs.collection(db, 'placementTests')); return false; }catch(e){ return e.code; }
  });
  ok(denied === 'permission-denied', `${who}: kurallar doğrudan okumayı reddediyor (${denied})`);
  await ctx.close();
}

// 9. Yönetim sayfası: öğretmen — liste, arama, filtre, detay, okundu, not, sil
{
  const { ctx, page } = await newPage({ width: 1280 });
  await page.goto(B + '#home'); await page.waitForTimeout(300);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123');
  // İkinci bir kayıt (öğretmen her şeyi yazabilir)
  await page.evaluate(async () => {
    const { db, fs } = await import('/js/account/firebase.js');
    await fs.addDoc(fs.collection(db, 'placementTests'), {
      uid: 'x', name: 'Ayla Demir', email: 'ayla@example.com', goal: 'work', examName: '', examDate: '', experience: 'gt2y', note: '',
      level: 'B2', near: 'C1', skipped: false, blocks: { A1: { correct: 10, total: 10 }, A2: { correct: 9, total: 10 }, B1: { correct: 8, total: 10 }, B2: { correct: 7, total: 10 }, C1: { correct: 4, total: 10 } },
      topicErrors: 'lesen:2', wrong: '', writing: '', durationSec: 1320, bank: 1, lang: 'de', consent: true, read: true,
      createdAt: fs.Timestamp.fromMillis(Date.now() - 864e5), expireAt: fs.Timestamp.fromMillis(Date.now() + 182 * 864e5)
    });
    // Saklama süresi dolmuş iki kayıt (biri 1 dakika, biri 20 gün önce): sayfa açılınca silinmeli.
    for(const [name, ago] of [['Eski Bir', 60e3], ['Daha Eski', 20 * 864e5]]){
      await fs.addDoc(fs.collection(db, 'placementTests'), {
        uid: 'y', name, email: 'eski@example.com', goal: 'daily', examName: '', examDate: '', experience: 'none', note: '',
        level: 'A1', near: '', skipped: false, blocks: { A1: { correct: 6, total: 10 } }, topicErrors: '', wrong: '', writing: '',
        durationSec: 300, bank: 1, lang: 'tr', consent: true, read: true,
        createdAt: fs.Timestamp.fromMillis(Date.now() - 183 * 864e5 - ago), expireAt: fs.Timestamp.fromMillis(Date.now() - ago)
      });
    }
  });
  ok((await listDocs('placementTests')).length === 4, 'yönetim açılmadan önce 4 kayıt (2’si süresi dolmuş)');
  await page.goto(B + '#yonetim/seviye-testleri'); await page.waitForSelector('[data-admin-list] li');
  ok((await page.locator('[data-admin-cleanup]').textContent()) === 'Saklama süresi (6 ay) dolan 2 sonuç silindi.', 'süresi dolan kayıtlar silindi, sayısı üstte gösteriliyor');
  ok(await page.locator('#adminApp > *').first().getAttribute('data-admin-cleanup') !== null, 'bilgi notu sayfanın en üstünde');
  const remaining = await listDocs('placementTests');
  ok(remaining.length === 2 && remaining.every((d) => !['Eski Bir', 'Daha Eski'].includes(d.fields.name.stringValue)), 'emülatörde sadece süresi dolanlar silindi');
  ok(remaining.every((d) => 'expireAt' in d.fields), 'kalan kayıtlarda expireAt duruyor');
  const names = await page.locator('.admin-row-name').allTextContents();
  ok(names.join() === 'Deniz Kaya,Ayla Demir', `liste en yeni üstte (${names.join(', ')})`);
  ok(await page.locator('.admin-row.is-unread').count() === 1 && (await page.locator('.admin-row.is-unread .admin-row-name').textContent()) === 'Deniz Kaya', 'okunmamış işaretli');
  ok((await page.locator('.admin-row').first().textContent()).includes('Sınav') && (await page.locator('.admin-row').nth(1).textContent()).includes('B2 – C1'), 'satırda hedef ve seviye');
  await page.fill('#adminSearch', 'ayla@'); ok(await page.locator('.admin-row').count() === 1, 'e-postaya göre arama');
  await page.fill('#adminSearch', 'deniz'); ok(await page.locator('.admin-row').count() === 1, 'ada göre arama');
  await page.fill('#adminSearch', '');
  await page.selectOption('#adminLevel', 'B2'); ok(await page.locator('.admin-row').count() === 1, 'seviyeye göre filtre');
  await page.selectOption('#adminLevel', 'C1'); ok((await page.locator('.admin-empty').textContent()).includes('uyan sonuç yok'), 'filtre boş sonuç');
  await page.selectOption('#adminLevel', '');
  await page.screenshot({ path: path.join(shotDir, 'admin-list-1280.png'), fullPage: true });
  await page.click(`[data-admin-open="${submittedId}"]`); await page.waitForSelector('[data-admin-level]');
  ok(page.url().endsWith(`#yonetim/seviye-testleri/${submittedId}`), 'detay adresi');
  const detail = await page.locator('#adminApp').textContent();
  for(const text of ['deniz@example.com', 'Sınav', 'Goethe B1', '6–12 ay', 'Konuşmada zorlanıyorum.', 'Tahmini seviye: A2', 'Geçti', 'Geçemedi', 'Ich heiße Deniz', 'Okuma'])
    ok(detail.includes(text), `detayda "${text}"`);
  const firstWrong = page.locator('[data-admin-wrong]').first();
  const wid = await firstWrong.getAttribute('data-admin-wrong');
  const wq = [...blockQs(1), ...blockQs(2)].find((q) => q.id === wid);
  ok((await firstWrong.textContent()).includes(wq.prompt) && (await firstWrong.locator('.is-right').textContent()) === wq.answer, 'yanlış soruda soru metni ve doğru cevap');
  ok((await firstWrong.locator('.is-wrong').textContent()) === wrongOption(wq), 'yanlış soruda öğrencinin cevabı');
  await page.screenshot({ path: path.join(shotDir, 'admin-detail-1280.png'), fullPage: true });
  await page.click('[data-admin-read]'); await page.waitForTimeout(500);
  await page.fill('#adminNote', 'Perfekt ve Dativ ile başla.');
  await page.click('[data-admin-note-save]'); await page.waitForTimeout(500);
  let docs = await listDocs('placementTests');
  let mine = docs.find((d) => d.name.endsWith(submittedId)).fields;
  ok(mine.read.booleanValue === true, 'okundu kaydedildi');
  ok(mine.adminNote?.stringValue === 'Perfekt ve Dativ ile başla.', 'not kaydedildi');
  // yenileme: doğrudan detay bağlantısı
  await page.reload(); await page.waitForSelector('[data-admin-level]');
  ok(await page.inputValue('#adminNote') === 'Perfekt ve Dativ ile başla.', 'detay bağlantısı yenilemede açılıyor, not görünüyor');
  // sil: önce vazgeç, sonra onayla
  await page.click('[data-admin-delete]');
  ok(await page.locator('.admin-confirm').isVisible(), 'silmeden önce onay soruluyor');
  await page.click('.admin-confirm .btn.ghost');
  ok((await listDocs('placementTests')).length === 2, 'vazgeçince silinmedi');
  await page.click('[data-admin-delete]'); await page.click('[data-admin-delete-yes]');
  await page.waitForSelector('[data-admin-list]');
  ok((await listDocs('placementTests')).length === 1 && await page.locator('.admin-row').count() === 1, 'onaylanınca silindi, listeye dönüldü');
  // klavye: listede Tab ile bir satıra gelip Enter
  await page.locator('[data-admin-open]').first().focus(); await page.keyboard.press('Enter');
  await page.waitForSelector('[data-admin-level]');
  ok(true, 'klavye ile detay açılıyor');
  const counted = await page.evaluate(() => window.__counted);
  ok(!counted.some((p) => p.includes('yonetim')), `sayaç yönetim sayfasını saymıyor (${counted.join(' ')})`);
  await ctx.close();
}

// 10. Üç dil, iki tema, mobil (390 px): taşma yok, klavye ile çözülebilir
for(const [lang, title] of [['tr', 'Seviye tespit sınavı'], ['de', 'Einstufungstest'], ['en', 'Placement test']]){
  for(const [width, theme] of [[1280, 'light'], [390, 'dark']]){
    const { ctx, page } = await newPage({ width, theme, lang });
    await start(page);
    const label = `${lang} ${width} ${theme}`;
    ok((await page.locator('#placementApp h1').textContent()) === title, `${label}: başlık "${title}"`);
    ok(await page.evaluate(() => document.documentElement.dataset.theme) === theme, `${label}: tema`);
    ok(await overflow(page) <= 0, `${label}: giriş ekranında taşma yok`);
    await page.click('[data-pl-start]');
    ok(await overflow(page) <= 0, `${label}: soru ekranında taşma yok`);
    ok((await page.locator('.pl-option--unknown').first().textContent()) === { tr: 'Bilmiyorum', de: 'Weiß ich nicht', en: 'I don’t know' }[lang], `${label}: "Bilmiyorum" çevrildi`);
    if(width === 390) await page.screenshot({ path: path.join(shotDir, `block-${lang}-${width}-${theme}.png`), fullPage: true });
    // Klavye: ilk sorunun seçeneklerine Tab ile gel, ok tuşuyla seç
    await page.locator('.pl-q input').first().focus();
    await page.keyboard.press('ArrowDown');
    ok(await page.locator('.pl-q').first().locator('input:checked').count() === 1, `${label}: ok tuşuyla seçenek seçiliyor`);
    await answerBlock(page, 0, 2);
    await page.click('[data-pl-writing-skip]'); await page.waitForTimeout(200);
    ok(await overflow(page) <= 0, `${label}: sonuç ve formda taşma yok`);
    await page.click('[data-pl-submit]'); await page.waitForTimeout(150);
    const err = await page.locator('#plNameError').textContent();
    ok(err === { tr: 'Adını yaz (en az 2 karakter).', de: 'Schreib deinen Namen (mindestens 2 Zeichen).', en: 'Enter your name (at least 2 characters).' }[lang], `${label}: hata mesajı çevrildi`);
    if(width === 390) await page.screenshot({ path: path.join(shotDir, `result-${lang}-${width}-${theme}.png`), fullPage: true });
    await ctx.close();
  }
}
// Dil test içinde de değişebiliyor
{
  const { ctx, page } = await newPage();
  await start(page); await page.click('[data-pl-start]');
  await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(200);
  ok((await page.locator('[data-pl-finish]').textContent()) === 'Teil abschließen', 'test sırasında dil değişince arayüz değişiyor');
  ok((await page.locator('.pl-q-prompt').first().textContent()).includes(bank.blocks[0].questions[0].prompt.split('___')[0].trim()), 'sorular Almanca kalıyor');
  await ctx.close();
}
// 9b. Yönetim tekrar açılınca: silinecek kayıt yoksa bilgi; süresi dolmak üzere olan kayıt kalır; testi atlayan öğrencinin detayı
{
  const { ctx, page } = await newPage({ width: 1280 });
  await page.goto(B + '#home'); await page.waitForTimeout(300);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123');
  await page.evaluate(async () => {
    const { db, fs } = await import('/js/account/firebase.js');
    await fs.addDoc(fs.collection(db, 'placementTests'), {
      uid: 'z', name: 'Can Yıldız', email: 'can@example.com', goal: 'daily', examName: '', examDate: '', experience: 'none', note: '',
      level: 'A0', near: '', skipped: true, blocks: {}, topicErrors: '', wrong: '', writing: '', durationSec: 0, bank: 1, lang: 'tr',
      consent: true, read: false, createdAt: fs.Timestamp.fromMillis(Date.now() - 183 * 864e5 + 36e5), expireAt: fs.Timestamp.fromMillis(Date.now() + 36e5)
    });
  });
  await page.goto(B + '#yonetim/seviye-testleri'); await page.waitForSelector('[data-admin-list] li');
  ok((await page.locator('[data-admin-cleanup]').textContent()) === 'Saklama süresi dolmuş sonuç yok.', 'silinecek kayıt yoksa kısa bilgi');
  ok(await page.locator('.admin-row-name', { hasText: 'Can Yıldız' }).count() === 1, 'süresi 1 saat sonra dolacak kayıt silinmedi');
  await page.locator('[data-admin-open]', { hasText: 'Can Yıldız' }).click(); await page.waitForSelector('[data-admin-level]');
  const detail = await page.locator('#adminApp').textContent();
  ok(!detail.includes('null') && detail.includes('testi atladı') && detail.includes('Yazma görevi boş bırakıldı.'), 'testi atlayan öğrencinin detayı ("null" yazmıyor)');
  ok(await page.locator('[data-admin-cleanup]').count() === 1, 'bilgi notu detay sayfasında da üstte');
  await ctx.close();
}

// Yönetim sayfası mobil + koyu tema
{
  const { ctx, page } = await newPage({ width: 390, theme: 'dark' });
  await page.goto(B + '#home'); await page.waitForTimeout(300);
  await signIn(page, 'ogretmen@example.com', 'ogretmen123');
  await page.goto(B + '#yonetim/seviye-testleri'); await page.waitForSelector('[data-admin-list] li');
  ok(await overflow(page) <= 0, 'yönetim listesi 390 koyu: taşma yok');
  await page.locator('[data-admin-open]').first().click(); await page.waitForSelector('[data-admin-level]');
  ok(await overflow(page) <= 0, 'yönetim detayı 390 koyu: taşma yok');
  await page.screenshot({ path: path.join(shotDir, 'admin-detail-390-dark.png'), fullPage: true });
  await ctx.close();
}

// 11. Gizlilik sayfası: metnin tamamı TR/DE/EN; dil düğmesine göre tek dil görünür
const PRIVACY = {
  tr: { h1: 'Gizlilik politikası', title: '5a. Seviye testi', firebase: 'Tek istisna: Seviye testinin sonucunu göndermek', updated: 'Son güncelleme: 27 Ekim 2026', foreign: ['Verantwortlicher', 'Controller'], doc: 'Gizlilik politikası | Bozkurt Academy' },
  de: { h1: 'Datenschutzerklärung', title: '5a. Einstufungstest', firebase: 'Einzige Ausnahme: Wenn Sie nach dem Einstufungstest', updated: 'Stand: 27. Oktober 2026', foreign: ['Sorumlu', 'Controller', 'Siteyi ziyaret'], doc: 'Datenschutzerklärung | Bozkurt Academy' },
  en: { h1: 'Privacy policy', title: '5a. Placement test', firebase: 'The only exception: when you press “Send result”', updated: 'Last updated: 27 October 2026', foreign: ['Sorumlu', 'Verantwortlicher', 'Siteyi ziyaret'], doc: 'Privacy policy | Bozkurt Academy' }
};
const visibleText = (page) => page.evaluate(() => document.querySelector('.acc-legal').innerText);
for(const [lang, x] of Object.entries(PRIVACY)){
  for(const [width, theme] of [[1280, 'light'], [390, 'dark']]){
    const { ctx, page } = await newPage({ width, theme, lang, emulator: false });
    await page.goto(B.replace('index.html', 'privacy.html#seviye-testi')); await page.waitForTimeout(600);
    const label = `gizlilik ${lang} ${width} ${theme}`;
    const block = page.locator(`[data-privacy-lang="${lang}"]`);
    ok(await page.locator('[data-privacy-lang]:not([hidden])').count() === 1 && await block.isVisible(), `${label}: tek dil bloğu görünüyor`);
    ok(await block.getAttribute('lang') === lang && await page.evaluate(() => document.documentElement.lang) === lang, `${label}: lang öznitelikleri`);
    ok((await block.locator('h1').textContent()) === x.h1 && await page.title() === x.doc, `${label}: başlık "${x.h1}"`);
    ok(await block.locator('section h2').count() === 12, `${label}: 12 bölüm (1–11 ve 5a)`);
    const text = await visibleText(page);
    ok(x.foreign.every((w) => !text.includes(w)), `${label}: görünen metinde başka dil yok`);
    ok(text.includes(x.title) && text.includes(x.firebase) && text.includes(x.updated), `${label}: 5a, Firebase cümlesi ve tarih`);
    ok(/6 (ay|Monate|months)|sechs Monate|six months/.test(text), `${label}: 6 ay saklama`);
    ok(await block.locator('a[href="mailto:bozkurtt.omerfaruk@gmail.com"]').count() === 4, `${label}: e-posta bağlantıları (sorumlu, 5a, haklar ×2)`);
    ok(!/Gielen|41460|Neuss/.test(text), `${label}: adres yok`);
    ok(await block.locator('code').count() === 8, `${label}: localStorage anahtarları ve örnek adresler`);
    const anchor = await page.evaluate(() => { const el = [...document.querySelectorAll('[data-anchor="seviye-testi"]')].find((e) => !e.closest('[hidden]')); const r = el.getBoundingClientRect(); return r.top >= -5 && r.top < innerHeight; });
    ok(anchor, `${label}: #seviye-testi bağlantısı görünen dildeki 5a bölümüne gidiyor`);
    ok(await overflow(page) <= 0, `${label}: taşma yok`);
    if(width === 390) await page.screenshot({ path: path.join(shotDir, `privacy-${lang}-${width}-${theme}.png`), fullPage: true });
    await ctx.close();
  }
}
// Dil sayfadayken de değişiyor; JavaScript yokken Türkçe görünüyor; formdaki bağlantı 5a'ya gidiyor
{
  const { ctx, page } = await newPage({ emulator: false });
  await page.goto(B.replace('index.html', 'privacy.html')); await page.waitForTimeout(400);
  for(const lang of ['de', 'en', 'tr']){
    await page.click(`.lang button[data-lang="${lang}"]`); await page.waitForTimeout(200);
    ok(await page.locator(`[data-privacy-lang="${lang}"]`).isVisible() && await page.locator('[data-privacy-lang]:not([hidden])').count() === 1
      && await page.title() === PRIVACY[lang].doc, `gizlilik: ${lang} düğmesi sayfanın tamamını değiştiriyor`);
  }
  await start(page); await page.click('[data-pl-skip]'); await page.waitForTimeout(200);
  ok(await page.locator('.pl-consent a').getAttribute('href') === 'privacy.html#seviye-testi', 'onay kutusundaki bağlantı 5a bölümüne gidiyor');
  await ctx.close();
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await noJs.newPage();
  await p2.goto(B.replace('index.html', 'privacy.html'));
  ok(await p2.locator('[data-privacy-lang="tr"]').isVisible() && !(await p2.locator('[data-privacy-lang="de"]').isVisible()), 'JavaScript kapalıyken Türkçe metin görünüyor');
  await noJs.close();
}

await browser.close();
server.close();
console.log('screenshots', shotDir);
console.log('errors', errors);
if(errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
