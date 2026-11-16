// Menüdeki hesap bağlantısı (#navAccount): her sayfada görünür (masaüstü ve mobil menü), dile göre yazı,
// öğrencide "Panelim", öğretmende "Öğretmen paneli"; ziyaretçide giriş sayfası dışında Firebase hiç yüklenmez.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/giris-baglantisi.mjs
// Ekran görüntüleri: S=<klasör> verilirse oraya (390 px menü açık / 1440 px, açık/koyu).
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
// Firebase isteklerini say (gstatic SDK, Firestore, Auth). Dış istekler engellenir ama sayılır.
const FIREBASE = /gstatic\.com\/firebasejs|firestore\.googleapis|identitytoolkit|securetoken/;
async function newPage({ width = 1440, theme = 'light', lang = 'tr', role = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(([t, l, r]) => { try {
    localStorage.setItem('ba-theme', t); localStorage.setItem('baLang', l);
    if (r) localStorage.setItem('baAccount', r); else localStorage.removeItem('baAccount');
  } catch (_) {} }, [theme, lang, role]);
  const firebase = [];
  await ctx.route(/^https?:\/\/(?!localhost)/, route => { if (FIREBASE.test(route.request().url())) firebase.push(route.request().url()); route.abort(); });
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  return { ctx, page, firebase };
}

const PAGES = ['/', '/#exercises', '/online-almanca-dersi/', '/sss/', '/almanca-gramer/a1/', '/almanca-gramer/a1/artikel/', '/blog/', '/almanca-alfabe/',
  '/de/kontakt/', '/de/deutschkurs-a1/', '/en/about/', '/en/german-course-b1/', '/impressum/', '/privacy.html', '/404.html'];

// 1) Ziyaretçi: her sayfada görünür, /giris.html'e gider, Firebase yüklenmez.
{
  const { ctx, page, firebase } = await newPage();
  for (const p of PAGES) {
    await page.goto(B + p); await page.waitForTimeout(250);
    const link = page.locator('#navAccount');
    ok(await link.isVisible(), `${p}: Giriş bağlantısı görünür`);
    ok(/\/?giris\.html$/.test(await link.getAttribute('href')), `${p}: bağlantı giris.html`);
  }
  ok(firebase.length === 0, `ziyaretçi: ${PAGES.length} sayfada Firebase isteği yok (${firebase.length})`);
  // Öğretmenin yorum onay sayfası giriş gerektirdiği için Firebase'i kendisi yükler (değişmedi); bağlantı orada da görünür.
  await page.goto(B + '/yonetim/yorumlar/'); await page.waitForTimeout(250);
  ok(await page.locator('#navAccount').isVisible(), '/yonetim/yorumlar/: Giriş bağlantısı görünür');
  firebase.length = 0;
  // Giriş sayfasına tıklayınca Firebase o zaman yüklenir.
  await page.goto(B + '/sss/');
  await page.click('#navAccount');
  await page.waitForURL('**/giris.html'); await page.waitForTimeout(500);
  ok(firebase.length > 0, 'giriş sayfası açılınca Firebase yükleniyor');
  await ctx.close();
}

// 2) Dile göre yazı.
for (const [lang, label, p] of [['tr', 'Giriş', '/sss/'], ['de', 'Anmelden', '/de/kontakt/'], ['en', 'Sign in', '/en/contact/'], ['de', 'Anmelden', '/almanca-gramer/a1/']]) {
  const { ctx, page } = await newPage({ lang });
  await page.goto(B + p); await page.waitForTimeout(250);
  ok((await page.textContent('#navAccount')).trim() === label, `${lang} ${p}: "${label}"`);
  await ctx.close();
}

// 3) Öğrenci ve öğretmen: "Panelim" / "Öğretmen paneli", mutlak adres (alt klasörlerde de çalışır). Firebase yine yüklenmez.
for (const [role, label, href] of [['student', 'Panelim', '/panel.html'], ['teacher', 'Öğretmen paneli', '/ogretmen.html']]) {
  const { ctx, page, firebase } = await newPage({ role });
  for (const p of ['/sss/', '/almanca-gramer/a1/artikel/', '/de/kontakt/']) {
    await page.goto(B + p); await page.waitForTimeout(250);
    ok((await page.textContent('#navAccount')).trim() === (p.startsWith('/de/') ? { student: 'Mein Bereich', teacher: 'Lehrerbereich' }[role] : label), `${role} ${p}: yazı`);
    ok(await page.getAttribute('#navAccount', 'href') === href, `${role} ${p}: ${href}`);
  }
  ok(firebase.length === 0, `${role}: statik sayfalarda Firebase isteği yok`);
  await ctx.close();
}

// 4) Mobil menü: menü açılınca bağlantı görünür; taşma yok. Ekran görüntüleri.
for (const [width, height] of [[390, 844], [1440, 900]]) for (const theme of ['light', 'dark']) {
  const { ctx, page } = await newPage({ width, theme, lang: theme === 'dark' ? 'de' : 'tr' });
  const p = theme === 'dark' ? '/de/kontakt/' : '/sss/';
  await page.goto(B + p); await page.waitForTimeout(250);
  if (width < 900) {
    ok(await page.locator('#navAccount').isHidden(), `${width} ${p}: menü kapalıyken gizli (menü içinde)`);
    await page.click('.menu-toggle'); await page.waitForTimeout(300);
  }
  ok(await page.locator('#navAccount').isVisible(), `${width} ${theme} ${p}: bağlantı görünür`);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(over <= 0, `${width} ${theme} ${p}: yatay taşma yok (${over})`);
  if (shotDir) await page.screenshot({ path: path.join(shotDir, `giris-baglantisi-${width}-${theme}.png`) });
  await ctx.close();
}

// 5) Masaüstü menü taşmıyor: TR/DE/EN, ziyaretçi ve öğretmen ("Öğretmen paneli" en uzun yazı), 1024–1700 px.
for (const [p, lang] of [['/sss/', 'tr'], ['/de/kontakt/', 'de'], ['/en/contact/', 'en'], ['/', 'de']]) for (const role of [null, 'teacher']) {
  const { ctx, page } = await newPage({ lang, role });
  await page.goto(B + p); await page.waitForTimeout(200);
  const bad = [];
  for (const width of [1024, 1100, 1200, 1280, 1366, 1440, 1536, 1700]) {
    await page.setViewportSize({ width, height: 800 }); await page.waitForTimeout(60);
    const r = await page.evaluate(() => {
      const links = document.querySelector('.nav-links'), brand = document.querySelector('.brand').getBoundingClientRect();
      const first = links.querySelector('.nav-link').getBoundingClientRect(), acc = document.querySelector('#navAccount').getBoundingClientRect();
      const actions = document.querySelector('.nav-actions').getBoundingClientRect();
      return links.scrollWidth - links.clientWidth > 0 || brand.right > first.left || acc.right > actions.left;
    });
    if (r) bad.push(width);
  }
  ok(bad.length === 0, `${lang} ${role || 'ziyaretçi'} ${p}: masaüstü menü sığıyor${bad.length ? ' (taşan: ' + bad.join(', ') + ')' : ''}`);
  await ctx.close();
}

ok(errors.length === 0, 'sayfa hatası yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
await browser.close();
if (fails.length) { console.error(`\n${fails.length} hata`); process.exit(1); }
console.log('\nPASS: giriş bağlantısı');
