// Alt başlıklarda arama: alıştırma paketleri (data/search-index.json) ve gramer ders bölümleri.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/search.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'search-shots-'));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const hash = () => page.url().split('#')[1];
const packages = () => page.locator('[data-hub-package]');
const sections = () => page.locator('[data-grammar-section]');
const index = JSON.parse(fs.readFileSync('data/search-index.json', 'utf8')).exercises;

// --- Alıştırmalar ---
let indexRequests = 0;
page.on('request', r => { if (r.url().includes('search-index.json')) indexRequests++; });
await page.goto(B + '#exercises'); await page.waitForTimeout(1200);
ok(indexRequests === 0, 'dizin arama yapılmadan yüklenmiyor');
ok(await page.getAttribute('#exerciseHubSearch', 'placeholder') === 'Konu veya alıştırma ara...', 'arama kutusu metni');

await page.fill('#exerciseHubSearch', 'bağlam'); await page.waitForTimeout(600);
ok(indexRequests === 1, 'dizin ilk aramada bir kez yükleniyor');
const bag = await packages().count();
ok(bag > 0 && await page.locator('#hubPackagesTitle').textContent() === 'Alıştırma paketleri', `"bağlam": ${bag} paket`);
ok(await page.evaluate(() => document.activeElement.id) === 'exerciseHubSearch', 'dizin gelince imleç arama kutusunda kalıyor');
await page.fill('#exerciseHubSearch', 'baglam'); await page.waitForTimeout(300);
ok(await packages().count() === bag, '"baglam" (Türkçe harfsiz) aynı sonuçları buluyor');
await page.fill('#exerciseHubSearch', 'BAĞLAM'); await page.waitForTimeout(300);
ok(await packages().count() === bag, 'büyük harf fark etmiyor');

// Konusu zaten eşleşen paketler tekrar listelenmiyor.
await page.fill('#exerciseHubSearch', 'artikel'); await page.waitForTimeout(300);
const artikelHrefs = await packages().evaluateAll(els => els.map(e => e.getAttribute('href')));
ok(await page.locator('.exercise-discovery-topic[data-hub-topic="artikel"]').count() === 1 && !artikelHrefs.some(h => h.startsWith('#exercises/A1/artikel/')), 'eşleşen konunun paketleri ayrıca gösterilmiyor');

// Sadece alt başlık eşleşince boş kutu yok.
await page.fill('#exerciseHubSearch', 'Vorgangspassiv temel'); await page.waitForTimeout(300);
ok(await page.locator('.exercise-discovery-topic').count() === 0 && await packages().count() === 1 && await page.locator('.exercise-discovery-empty').count() === 0, 'sadece paket eşleşince "bulunamadı" kutusu çıkmıyor');
await page.fill('#exerciseHubSearch', 'zzzqqq'); await page.waitForTimeout(300);
ok(await page.locator('.exercise-discovery-empty').count() === 1 && await packages().count() === 0, 'hiç eşleşme yoksa "bulunamadı"');

// Çok sonuç: ilk 40 ve "daha var" notu.
await page.fill('#exerciseHubSearch', 'übung'); await page.waitForTimeout(300);
ok(await packages().count() === 40 && (await page.textContent('.ba-subresults-more')).includes('paket daha'), 'en fazla 40 paket, kalanı için not');

// Tıklayınca alıştırma doğrudan açılıyor; geri tuşu konu listesine dönüyor.
await page.fill('#exerciseHubSearch', 'Partizip II im Passiv'); await page.waitForTimeout(300);
const target = index.find(e => e.title === 'Übung 3 – Partizip II im Passiv');
ok(await packages().count() === 1 && await packages().first().getAttribute('href') === `#exercises/${target.level}/${target.topic}/${target.id}`, 'paket bağlantısı doğru adreste');
await packages().first().click(); await page.waitForTimeout(1500);
ok(hash() === `exercises/${target.level}/${target.topic}/${target.id}/q1`, `alıştırma ilk sorusuyla açıldı (${hash()})`);
ok(await page.locator('#quizView').isVisible().catch(() => false) || await page.locator('#checkAnswerBtn').isVisible(), 'soru ekranı görünüyor');
await page.goBack(); await page.waitForTimeout(1200);
ok(hash() === 'exercises' && await page.locator('#exerciseHubSearch').isVisible(), 'geri tuşu alıştırma listesine döndürüyor');

// Dil değişimi.
await page.fill('#exerciseHubSearch', 'bağlam'); await page.waitForTimeout(300);
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(600);
ok(await page.textContent('#hubPackagesTitle') === 'Übungspakete', 'Almanca başlık');
await page.click('.lang button[data-lang="en"]'); await page.waitForTimeout(600);
ok(await page.textContent('#hubPackagesTitle') === 'Exercise sets', 'İngilizce başlık');
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(600);

// Dizin yüklenemezse konular yine çalışıyor.
const p2 = await browser.newPage();
p2.on('pageerror', e => errors.push(e.message));
await p2.route('**/search-index.json*', r => r.abort());
await p2.goto(B + '#exercises'); await p2.waitForTimeout(1200);
await p2.fill('#exerciseHubSearch', 'artikel'); await p2.waitForTimeout(800);
ok(await p2.locator('.exercise-discovery-topic').count() > 0 && (await p2.textContent('.ba-subresults-note')).includes('aranamadı'), 'dizin yüklenemezse konular ve kısa bir not');
await p2.close();

// --- Gramer ---
await page.goto(B + '#grammar'); await page.waitForTimeout(1500);
ok(await page.getAttribute('#grammarSearchInput', 'placeholder') === 'Konu veya ders bölümü ara...', 'gramer arama kutusu metni');
await page.fill('#grammarSearchInput', 'isim'); await page.waitForTimeout(300);
const isimTitles = await sections().locator('h4').allTextContents();
ok(isimTitles.length > 0 && isimTitles.every(t => /(^|[^a-zçğıöşü])[iİ]sim/i.test(t)), `"isim": ${isimTitles.length} bölüm, hepsi kelime başında eşleşiyor`);
ok(!isimTitles.some(t => /değişim/i.test(t)), '"isim" araması "değişim"i bulmuyor');
await page.fill('#grammarSearchInput', 'olumsuz'); await page.waitForTimeout(300);
ok(await sections().count() === 2, '"olumsuz": 2 bölüm');
// Bölüm sonuçları statik ders sayfasının ilgili başlığına gider: /almanca-gramer/<seviye>/<ders>/#a1-step-N
const sh = await sections().first().getAttribute('href');
ok(/^\/almanca-gramer\/(a1|a2|b1)\/[a-z0-9-]+\/#a1-step-\d+$/.test(sh), `bölüm bağlantısı statik sayfaya (${sh})`);
await sections().first().click(); await page.waitForTimeout(1800);
const focused = await page.evaluate(() => ({ text: document.activeElement.textContent, top: document.activeElement.getBoundingClientRect().top, inSection: !!document.activeElement.closest('.a1-section') }));
ok(page.url().endsWith(sh) && focused.inSection && focused.top >= 0 && focused.top < 300, `bölüme gidildi ve başlığı odaklandı (${focused.text.slice(0, 40)})`);
await page.goBack(); await page.waitForTimeout(1200);
ok(hash() === 'grammar' && await page.locator('#grammarListView').isVisible(), 'geri tuşu gramer listesine döndürüyor');

// Sadece bölüm eşleşince boş kutu yok; doğrudan bağlantı.
await page.fill('#grammarSearchInput', 'yumuşak rica'); await page.waitForTimeout(300);
ok(await page.locator('#grammarTopicGrid').isHidden() && await sections().count() === 1, 'sadece bölüm eşleşince konu kutusu gizli');
await page.goto('about:blank'); await page.goto(B + '#grammar/A1/artikel/3'); await page.waitForTimeout(2000);
ok(new URL(page.url()).pathname === '/almanca-gramer/a1/artikel/' && await page.evaluate(() => document.activeElement.closest('#a1-step-2') !== null), 'eski bağlantı #grammar/A1/artikel/3 statik sayfada üçüncü bölümü açıyor');
await page.goto('about:blank'); await page.goto(B + '#grammar/A1/artikel'); await page.waitForTimeout(1800);
ok(new URL(page.url()).pathname === '/almanca-gramer/a1/artikel/' && await page.evaluate(() => scrollY < 50 && document.querySelector('h1').textContent.startsWith('Artikel')), 'bölümsüz eski bağlantı statik dersin başını açıyor');
// Statik ders sayfası yalnızca Türkçe; dil seçimi SPA'daki gramer aramasında denenir.
await page.goto(B + '#grammar'); await page.waitForTimeout(1500);
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(500);
await page.goto(B + '#grammar'); await page.waitForTimeout(1500);
await page.fill('#grammarSearchInput', 'olumsuz'); await page.waitForTimeout(300);
ok(await page.textContent('#grammarSectionsTitle') === 'Lektionsabschnitte', 'gramerde Almanca başlık');
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(500);
await page.close();

// --- 390 ve 1440 px, açık ve koyu ---
for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t); } catch (_) {} }, th);
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
  await p.goto(B + '#exercises'); await p.waitForTimeout(1200);
  await p.fill('#exerciseHubSearch', 'bağlam'); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${w} ${th}: alıştırma aramasında yatay taşma yok`);
  await p.locator('.ba-subresults').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(shotDir, `arama-alistirma-${w}-${th}.png`) });
  await p.goto(B + '#grammar'); await p.waitForTimeout(1500);
  await p.fill('#grammarSearchInput', 'isim'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${w} ${th}: gramer aramasında yatay taşma yok`);
  await p.locator('#grammarSubresults').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(shotDir, `arama-gramer-${w}-${th}.png`) });
  await ctx.close();
}

console.log('screenshots in', shotDir);
await browser.close();
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
