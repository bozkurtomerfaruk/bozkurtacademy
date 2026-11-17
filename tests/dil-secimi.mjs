// Dil seçimi ve dil sürümleri: sabit Türkçe sayfalarda not + çalışan dil düğmesi (Aşama 1),
// /de/… ve /en/… sürümleri, dil düğmesiyle sürümler arasında geçiş, site içi bağlantılar (Aşama 2).
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/dil-secimi.mjs
// Ekran görüntüleri: S=<klasör> verilirse oraya (390/1440 px, açık/koyu).
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
const newPage = async (viewport = { width: 1440, height: 900 }) => {
  const ctx = await browser.newContext({ viewport });
  // Dışarıya istek gitmesin; iletişim formu gönderimi taklit edilir.
  await ctx.route(/^https?:\/\/(?!localhost)/, route => route.abort());
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/i.test(m.text())) errors.push(m.text()); });
  return page;
};
const page = await newPage();
const saved = () => page.evaluate(() => localStorage.getItem('baLang'));
const note = () => page.locator('.ba-lang-note');
const htmlLang = () => page.evaluate(() => document.documentElement.lang);
const path_ = () => new URL(page.url()).pathname;
const text = async sel => (await page.textContent(sel)).trim();

// 1) Ana sayfada DE → menüdeki "Über mich" Almanca sürüme gider.
await page.goto(B + '/');
await page.click('.lang button[data-lang="de"]');
ok(await saved() === 'de', 'ana sayfada DE kaydedildi');
ok(await page.getAttribute('.nav-link[data-i18n="navAbout"]', 'href') === '/de/ueber-mich/', 'ana sayfa menüsü: Über mich → /de/ueber-mich/');
ok(await page.getAttribute('.nav-cta', 'href') === '/de/kontakt/', 'ana sayfa: "Kostenlos anfragen" → /de/kontakt/');
await page.click('.nav-link[data-i18n="navAbout"]');
await page.waitForURL('**/de/ueber-mich/');
ok(await htmlLang() === 'de', '/de/ueber-mich/: sayfa dili de');
ok((await text('h1')) === 'Ömer Faruk Bozkurt' && (await text('.lp-lead')).startsWith('Ich studiere'), '/de/ueber-mich/: içerik Almanca');
ok(await note().count() === 0, '/de/ueber-mich/: not yok');
ok(await page.getAttribute('.lang button[data-lang="de"]', 'aria-pressed') === 'true', '/de/ueber-mich/: DE düğmesi etkin');
ok(await page.locator('link[rel="alternate"][hreflang]').count() === 4, '/de/ueber-mich/: 4 hreflang (tr, de, en, x-default)');
ok((await text('.lp-breadcrumb li:first-child')) === 'Startseite', '/de/ueber-mich/: sayfa yolu Almanca');

// 2) Sürümler arasında dil düğmesi: DE → EN → TR.
await page.click('.lang button[data-lang="en"]');
await page.waitForURL('**/en/about/');
ok(await saved() === 'en' && await htmlLang() === 'en', 'EN düğmesi → /en/about/, seçim en');
await page.click('.lang button[data-lang="tr"]');
await page.waitForURL('**/hakkimda/');
ok(await saved() === 'tr' && await note().count() === 0, 'TR düğmesi → /hakkimda/, seçim tr, not yok');
await page.goBack(); await page.waitForURL('**/en/about/');
ok(await htmlLang() === 'en', 'geri tuşu → /en/about/');

// 3) Türkçe sayfaya DE seçiliyken doğrudan gelmek: otomatik yönlendirme yok, "Almanca sürümü de var" notu.
await page.evaluate(() => localStorage.setItem('baLang', 'de'));
await page.goto(B + '/iletisim/');
ok(path_() === '/iletisim/', '/iletisim/: yönlendirme yok');
ok((await note().textContent()).includes('auch auf Deutsch'), '/iletisim/: "auch auf Deutsch" notu');
ok(await page.getAttribute('.ba-lang-note a', 'href') === '/de/kontakt/', '/iletisim/: not → /de/kontakt/');
ok((await text('h1')) === 'İletişim ve ücretsiz ilk ders', '/iletisim/: içerik Türkçe');

// 4) Sürümü olmayan Türkçe sayfa: "nur auf Türkisch", menü Almanca, düğme sayfada kalır.
await page.goto(B + '/404.html');
ok((await note().textContent()).includes('nur auf Türkisch'), '/404.html: "nur auf Türkisch" notu');
ok(await page.getAttribute('.ba-lang-note a', 'href') === '/', '/404.html: not ana sayfaya bağlantı veriyor');
ok((await text('.nav-link[data-i18n="navAbout"]')) === 'Über mich', '/404.html: menü Almanca');
ok(await page.getAttribute('.nav-link[data-i18n="navContact"]', 'href') === '/de/kontakt/', '/404.html: menü Kontakt → /de/kontakt/');
ok(await page.getAttribute('footer a[data-i18n="navContact"]', 'href') === '/de/kontakt/', '/404.html: alt bilgi Kontakt → /de/kontakt/');
ok(await htmlLang() === 'tr' && await page.getAttribute('.topbar', 'lang') === 'de', '/404.html: içerik tr, menü lang=de');
await page.click('.lang button[data-lang="en"]');
ok(path_() === '/404.html' && await saved() === 'en', '/404.html: EN düğmesi sayfada kalır, kaydedilir');
ok((await note().textContent()).includes('only available in Turkish'), '/404.html: not İngilizce');
ok(await page.getAttribute('.nav-link[data-i18n="navContact"]', 'href') === '/en/contact/', '/404.html: menü Contact → /en/contact/');
if (shotDir) {
  for (const [w, h] of [[390, 844], [1440, 900]]) for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: w, height: h });
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(shotDir, `dil-not-404-en-${w}-${theme}.png`) });
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = 'light'; });
  await page.setViewportSize({ width: 1440, height: 900 });
}
await page.click('.lang button[data-lang="tr"]');
ok(await note().count() === 0 && await page.getAttribute('.topbar', 'lang') === null, '/404.html: TR → not yok');
ok(await page.getAttribute('.nav-link[data-i18n="navContact"]', 'href') === '/iletisim/', '/404.html: TR → menü İletişim → /iletisim/');

// 5) Notun bağlantıları (sürümü olmayan sayfalar).
await page.evaluate(() => localStorage.setItem('baLang', 'de'));
for (const [p, href, txt] of [
  ['/almanca-sinav-hazirlik/', '/de/pruefungsvorbereitung-deutsch/', 'auch auf Deutsch'],
  ['/almanca-ozel-ders/', '/de/deutsch-einzelunterricht/', 'auch auf Deutsch'],
  ['/almanca-gramer/a1/', '/#exercises', 'Übungen'],
  ['/a1-almanca-kursu/', '/de/deutschkurs-a1/', 'auch auf Deutsch'],
  ['/404.html', '/', 'Startseite'],
  ['/sss/', '/de/faq/', 'auch auf Deutsch'],
  ['/blog/', null, null],
  ['/almanca-alfabe/', null, null],
]) {
  await page.goto(B + p); await page.waitForTimeout(150);
  ok(await note().count() === 1, `${p}: not var`);
  ok(await page.locator('.ba-lang-note a').count() === (href ? 1 : 0), `${p}: bağlantı sayısı`);
  if (href) ok(await page.getAttribute('.ba-lang-note a', 'href') === href, `${p}: bağlantı ${href}`);
  if (txt) ok((await note().textContent()).includes(txt), `${p}: metin "${txt}"`);
}

// 6) Kapatma: aynı oturumda o dil için gizli; başka dil seçince yeniden çıkar.
await page.goto(B + '/404.html');
await page.click('.ba-lang-note-close');
ok(await note().count() === 0, 'kapatınca not gitti');
await page.goto(B + '/almanca-gramer/a1/');
ok(await note().count() === 0, 'kapatılan not başka sayfada da çıkmıyor');
await page.click('.lang button[data-lang="en"]');
ok(await note().count() === 1, 'başka dil seçince not yeniden çıktı');

// 7) Yönetim sayfası (dil düğmesi yok): tamamen Türkçe, seçim korunur.
await page.goto(B + '/yonetim/yorumlar/'); await page.waitForTimeout(150);
ok(await note().count() === 0 && await page.locator('.lang button').count() === 0, 'yönetim: not ve dil düğmesi yok');
ok((await text('.nav-link[data-i18n="navAbout"]')) === 'Hakkımda', 'yönetim: menü Türkçe');
ok(await page.getAttribute('.nav-link[data-i18n="navContact"]', 'href') === '/iletisim/', 'yönetim: bağlantılar Türkçe');
ok(await saved() === 'en', 'yönetim: kayıtlı seçim silinmedi');

// 8) Almanca sayfaya TR seçiliyken gelmek: seçim de olur.
await page.evaluate(() => localStorage.setItem('baLang', 'tr'));
await page.goto(B + '/de/kontakt/');
ok(await saved() === 'de', '/de/kontakt/ açılınca seçim de');
await page.goto(B + '/');
ok(await htmlLang() === 'de' && (await text('footer [data-i18n="footerGroupFree"]')) === 'Kostenlos üben', 'ana sayfa sonra Almanca');

// 9) Almanca iletişim formu: "Sie" mesajları ve gönderim (Web3Forms taklit).
await page.goto(B + '/de/kontakt/');
await page.click('#contactSubmitBtn');
ok((await text('#formStatus')).startsWith('Bitte geben Sie'), 'DE form: eksik alan mesajı (Sie)');
let sent = null;
await page.route('https://api.web3forms.com/submit', route => { sent = JSON.parse(route.request().postData()); route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
await page.fill('#name', 'Test'); await page.fill('#email', 'test@example.com'); await page.fill('#message', 'Hallo, ich habe eine Frage.');
await page.press('#message', 'Tab'); await page.keyboard.press('Enter');
await page.waitForTimeout(400);
ok((await text('#formStatus')).startsWith('Vielen Dank! Ihre Nachricht'), 'DE form: gönderildi mesajı (Sie)');
ok(sent?.subject?.endsWith('(DE)') && sent?.page === 'https://bozkurtacademy.com/de/kontakt/', 'DE form: konu (DE) ve sayfa adresi');
ok((await text('#contactSubmitBtn')) === 'Nachricht senden', 'DE form: düğme yazısı geri geldi');

// 10) İngilizce sayfada menü ve alt bilgi İngilizce, bağlantılar İngilizce sürümlere.
await page.goto(B + '/en/contact/');
ok((await text('.nav-link[data-i18n="navAbout"]')) === 'About Me' && await page.getAttribute('.nav-link[data-i18n="navAbout"]', 'href') === '/en/about/', '/en/contact/: menü İngilizce');
ok(await page.getAttribute('.nav-link[aria-current="page"]', 'href') === '/en/contact/', '/en/contact/: menüde etkin sayfa');
ok(await page.locator('.ba-sticky-cta').count() === 0, '/en/contact/: sabit iletişim düğmesi yok');

// 10b) Ders sayfaları (Aşama 2 / PR 2): menü, alt bilgi, sayfa yolu ve dil düğmesi.
await page.goto(B + '/de/deutsch-einzelunterricht/');
ok(await page.getAttribute('.nav-link[data-i18n="navLessons"]', 'href') === '/de/online-deutschunterricht/', '/de/deutsch-einzelunterricht/: menü Deutschunterricht → DE');
ok(await page.getAttribute('.nav-link[data-i18n="navExams"]', 'href') === '/de/pruefungsvorbereitung-deutsch/', '/de/deutsch-einzelunterricht/: menü Prüfungsvorbereitung → DE');
ok(await page.getAttribute('.nav-link[aria-current="page"]', 'href') === '/de/online-deutschunterricht/', '/de/deutsch-einzelunterricht/: menüde "Deutschunterricht" etkin');
ok(await page.getAttribute('.lp-breadcrumb li:nth-child(2) a', 'href') === '/de/online-deutschunterricht/', '/de/deutsch-einzelunterricht/: sayfa yolu üst sayfa DE');
ok(await page.getAttribute('footer a[data-i18n="footerGroup"]', 'href') === '/de/deutsch-gruppenkurs/', '/de/deutsch-einzelunterricht/: alt bilgi Gruppenkurs → DE');
await page.click('.lang button[data-lang="en"]');
await page.waitForURL('**/en/private-german-lessons/');
ok(await htmlLang() === 'en', 'EN düğmesi → /en/private-german-lessons/');
await page.click('.lang button[data-lang="tr"]');
await page.waitForURL('**/almanca-ozel-ders/');
ok(await note().count() === 0, 'TR düğmesi → /almanca-ozel-ders/, not yok');

// 10c) Kurs sayfaları (Aşama 2 / PR 3): seviye kartları ve sürümler arası geçiş.
await page.goto(B + '/de/online-deutschunterricht/');
ok(await page.locator('a.lp-card-link[href^="/de/deutschkurs-"]').count() === 4, '/de/online-deutschunterricht/: 4 seviye kartı bağlı');
await page.goto(B + '/en/online-german-lessons/');
ok(await page.locator('a.lp-card-link[href^="/en/german-course-"]').count() === 4, '/en/online-german-lessons/: 4 seviye kartı bağlı');
await page.goto(B + '/de/deutschkurs-b1/');
ok(await page.getAttribute('.lp-breadcrumb li:nth-child(2) a', 'href') === '/de/online-deutschunterricht/', '/de/deutschkurs-b1/: sayfa yolu');
ok(await page.getAttribute('footer a[data-i18n="footerB2"]', 'href') === '/de/deutschkurs-b2/', '/de/deutschkurs-b1/: alt bilgi B2 → DE');
await page.click('.lang button[data-lang="en"]');
await page.waitForURL('**/en/german-course-b1/');
ok(await htmlLang() === 'en', 'EN düğmesi → /en/german-course-b1/');

// 11) Mobil: yatay taşma yok.
const mobile = await newPage({ width: 390, height: 844 });
await mobile.goto(B + '/'); await mobile.evaluate(() => localStorage.setItem('baLang', 'de'));
for (const p of ['/de/ueber-mich/', '/de/kontakt/', '/en/about/', '/en/contact/', '/de/online-deutschunterricht/', '/de/deutsch-einzelunterricht/', '/de/deutsch-gruppenkurs/', '/de/pruefungsvorbereitung-deutsch/', '/en/online-german-lessons/', '/en/private-german-lessons/', '/en/german-group-lessons/', '/en/german-exam-preparation/', '/de/deutschkurs-a1/', '/de/deutschkurs-a2/', '/de/deutschkurs-b1/', '/de/deutschkurs-b2/', '/en/german-course-a1/', '/en/german-course-a2/', '/en/german-course-b1/', '/en/german-course-b2/', '/de/faq/', '/en/faq/', '/sss/', '/hakkimda/', '/']) {
  await mobile.goto(B + p); await mobile.waitForTimeout(150);
  const over = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(over <= 0, `390 px ${p}: yatay taşma yok (${over})`);
}

ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: dil seçimi');
