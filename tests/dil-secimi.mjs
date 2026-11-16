// Dil seçimi sabit Türkçe sayfalarda da korunuyor mu? (Aşama 1: not + çalışan dil düğmesi)
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/dil-secimi.mjs
// Ekran görüntüleri: S=<klasör> verilirse oraya (390/1440 px, açık/koyu).
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765';
const shotDir = process.env.S || '';

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const browser = await chromium.launch();
const errors = [];
const watch = page => {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|goatcounter/i.test(m.text())) errors.push(m.text()); });
};
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
watch(page);
const saved = () => page.evaluate(() => localStorage.getItem('baLang'));
const note = () => page.locator('.ba-lang-note');

// 1) Ana sayfada DE seç → statik sayfaya geç.
await page.goto(B + '/');
await page.click('.lang button[data-lang="de"]');
ok(await saved() === 'de', 'ana sayfada DE kaydedildi');
await page.click('.nav-link[href="/hakkimda/"]');
await page.waitForURL('**/hakkimda/');
ok(await saved() === 'de', 'statik sayfada seçim silinmedi');
ok(await page.locator('.lang button[data-lang="de"]').count() === 1, 'statik sayfada dil düğmesi var');
ok(await page.getAttribute('.lang button[data-lang="de"]', 'aria-pressed') === 'true', 'DE düğmesi etkin görünüyor');
ok(await page.evaluate(() => document.documentElement.lang) === 'tr', 'sayfanın dili (içerik) tr kalıyor');
ok(await note().count() === 1, 'not görünüyor');
ok((await note().textContent()).includes('nur auf Türkisch'), 'not Almanca');
ok(await page.getAttribute('.ba-lang-note', 'lang') === 'de', 'notun lang değeri de');
ok(await page.getAttribute('.ba-lang-note a', 'href') === '/', 'not ana sayfaya bağlantı veriyor');
ok((await page.textContent('.nav-link[href="/hakkimda/"]')).trim() === 'Über mich', 'menü Almanca');
ok((await page.textContent('footer [data-i18n="footerGroupLessons"]')).trim() === 'Unterricht', 'alt bilgi Almanca');
ok((await page.textContent('h1')).includes('Ömer Faruk Bozkurt'), 'içerik Türkçe kalıyor');
ok(await page.getAttribute('.topbar', 'lang') === 'de', 'menünün lang değeri de');

// 2) Statik sayfada EN'e bas → kaydedilir, not güncellenir.
await page.click('.lang button[data-lang="en"]');
ok(await saved() === 'en', 'statik sayfada EN kaydedildi');
ok((await note().textContent()).includes('only available in Turkish'), 'not İngilizceye döndü');
ok((await page.textContent('.nav-link[href="/hakkimda/"]')).trim() === 'About Me', 'menü İngilizce');
if (shotDir) {
  for (const [w, h] of [[390, 844], [1440, 900]]) for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(shotDir, `dil-not-hakkimda-en-${w}-${theme}.png`) });
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await page.setViewportSize({ width: 1440, height: 900 });
}

// 3) TR'ye bas → not kaybolur, menü Türkçe.
await page.click('.lang button[data-lang="tr"]');
ok(await saved() === 'tr', 'TR kaydedildi');
ok(await note().count() === 0, 'TR seçilince not yok');
ok(await page.getAttribute('.topbar', 'lang') === null, 'TR\'de menüde ayrı lang yok');
ok((await page.textContent('.nav-link[href="/hakkimda/"]')).trim() === 'Hakkımda', 'menü Türkçe');

// 4) DE seç, geri tuşu → ana sayfa Almanca.
await page.click('.lang button[data-lang="de"]');
await page.goBack(); await page.waitForTimeout(400);
ok(await page.evaluate(() => document.documentElement.lang) === 'de', 'geri dönünce ana sayfa Almanca');
await page.reload(); await page.waitForTimeout(300);
ok(await page.evaluate(() => document.documentElement.lang) === 'de', 'yeniden yüklenince ana sayfa Almanca');

// 5) Notun bağlantıları sayfaya göre.
for (const [p, href, text] of [
  ['/almanca-sinav-hazirlik/', '/#exams', 'Prüfungstraining'],
  ['/almanca-gramer/a1/', '/#exercises', 'Übungen'],
  ['/a1-almanca-kursu/', '/', 'Startseite'],
  ['/iletisim/', null, 'auf Deutsch schreiben'],
  ['/blog/', null, null],
  ['/almanca-alfabe/', null, null],
]) {
  await page.goto(B + p); await page.waitForTimeout(200);
  ok(await note().count() === 1, `${p}: not var`);
  ok(await page.locator('.ba-lang-note a').count() === (href ? 1 : 0), `${p}: bağlantı sayısı`);
  if (href) ok(await page.getAttribute('.ba-lang-note a', 'href') === href, `${p}: bağlantı ${href}`);
  if (text) ok((await note().textContent()).includes(text), `${p}: metin "${text}"`);
}
// İletişim formu düğmesi içerik olduğu için Türkçe kalır.
await page.goto(B + '/iletisim/');
ok((await page.textContent('#contactSubmitBtn')).trim() === 'Mesaj gönder', 'iletişim formu Türkçe kalıyor');

// 6) Kapatma: aynı oturumda o dil için gizli; başka dil seçince yeniden çıkar.
await page.click('.ba-lang-note-close');
ok(await note().count() === 0, 'kapatınca not gitti');
await page.goto(B + '/sss/');
ok(await note().count() === 0, 'kapatılan not başka sayfada da çıkmıyor');
await page.click('.lang button[data-lang="en"]');
ok(await note().count() === 1, 'başka dil seçince not yeniden çıktı');

// 7) Yönetim sayfası (dil düğmesi yok): tamamen Türkçe, seçim korunur.
await page.goto(B + '/yonetim/yorumlar/'); await page.waitForTimeout(200);
ok(await note().count() === 0, 'yönetim: not yok');
ok(await page.locator('.lang button').count() === 0, 'yönetim: dil düğmesi yok');
ok((await page.textContent('.nav-link[href="/hakkimda/"]')).trim() === 'Hakkımda', 'yönetim: menü Türkçe');
ok(await saved() === 'en', 'yönetim: kayıtlı seçim silinmedi');

// 8) Ana sayfa alt bilgisi artık çevriliyor.
await page.goto(B + '/'); await page.waitForTimeout(300);
ok((await page.textContent('footer [data-i18n="footerGroupFree"]')).trim() === 'Practise for free', 'ana sayfa alt bilgi İngilizce');

// 9) Mobil: yatay taşma yok.
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
watch(mobile);
await mobile.goto(B + '/'); await mobile.evaluate(() => localStorage.setItem('baLang', 'de'));
for (const p of ['/hakkimda/', '/almanca-gramer/a1/', '/iletisim/', '/']) {
  await mobile.goto(B + p); await mobile.waitForTimeout(200);
  const over = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(over <= 0, `390 px ${p}: yatay taşma yok (${over})`);
}

ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: dil seçimi');
