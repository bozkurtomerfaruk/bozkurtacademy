// Çoklu dil (TR / EN / DE) tarayıcı testi: node tests/i18n.mjs
// Her sayfa her dilde açılır; 404, boş sayfa, yanlış dil, dil düğmeleri, menü bağlantıları, eski #about
// adresleri, "yalnızca Türkçe" notu, 404 yönlendirmeleri, hreflang, telefon genişliği ve koyu tema denetlenir.
// Sunucu GitHub Pages gibi davranır: olmayan adreste 404.html'i 404 koduyla döndürür.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.xml': 'application/xml' };

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(root, decodeURIComponent(url.pathname));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return res.end(fs.readFileSync(path.join(root, '404.html')));
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(r => server.listen(0, r));
const BASE = `http://127.0.0.1:${server.address().port}`;

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) pass++; else { fail++; console.error('FAIL', msg); } };

// Sitemap'teki bütün adresler (çeviriler dahil) ve slug eşleme tablosu.
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/bozkurtacademy\.com([^<]*)<\/loc>/g)].map(m => m[1]);
const routes = JSON.parse(/\/\*ba:routes\*\/(.*?)\/\*\/ba:routes\*\//.exec(fs.readFileSync(path.join(root, 'js/app.js'), 'utf8'))[1]);
const back = Object.fromEntries(Object.entries(routes).flatMap(([tr, alt]) => Object.entries(alt).map(([l, p]) => [p, { tr, lang: l }])));
const langOf = u => back[u]?.lang || 'tr';
const group = u => { const tr = back[u]?.tr || u; return { tr, ...(routes[tr] || {}) }; };
const NAV_ABOUT = { tr: 'Hakkımda', en: 'About Me', de: 'Über mich' };

const browser = await chromium.launch();
async function open(url, { lang, width = 1280, theme = 'light', session } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(([l, t, s]) => {
    try {
      if (sessionStorage.getItem('baTestInit')) return;
      sessionStorage.setItem('baTestInit', '1');
      if (l) localStorage.setItem('baLang', l);
      localStorage.setItem('ba-theme', t);
      if (s) sessionStorage.setItem('baLangNoteClosed', '1');
    } catch (_) {}
  }, [lang, theme, session]);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const res = await page.goto(BASE + url, { waitUntil: 'load' });
  await page.waitForTimeout(80);
  return { ctx, page, res, errors };
}

// 1) Her sayfa, her kayıtlı dil tercihiyle.
for (const u of urls) {
  const pageLang = langOf(u);
  const g = group(u);
  const translated = Object.keys(g).length > 1;
  for (const pref of ['tr', 'en', 'de']) {
    const { ctx, page, res, errors } = await open(u, { lang: pref });
    const info = await page.evaluate(() => ({
      path: location.pathname,
      htmlLang: document.documentElement.lang,
      headerLang: document.querySelector('.topbar')?.lang || document.documentElement.lang,
      text: (document.querySelector('main')?.innerText || '').trim().length,
      about: document.querySelector('.nav-link[data-i18n="navAbout"]')?.textContent,
      aboutHref: document.querySelector('.nav-link[data-i18n="navAbout"]')?.getAttribute('href'),
      switcher: [...document.querySelectorAll('.topbar .lang [data-lang]')].map(el => [el.dataset.lang, el.tagName, el.getAttribute('href'), el.classList.contains('active')]),
      note: document.querySelector('.ba-lang-note')?.innerText || '',
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(l => [l.hreflang, l.getAttribute('href')])
    }));
    const tag = `${u} [${pref}]`;
    ok(res.status() === 200 && info.path === u, `${tag}: durum ${res.status()}, adres ${info.path}`);
    ok(!errors.length, `${tag}: JS hatası ${errors.join('; ')}`);
    ok(u === '/' || info.text > 200, `${tag}: içerik boş (${info.text})`);
    ok(info.switcher.length === 3, `${tag}: dil düğmeleri yok`);
    ok(info.hreflang.some(([l]) => l === 'x-default'), `${tag}: hreflang x-default yok`);
    if (u === '/') continue;
    if (translated) {
      // Dili adresinde olan sayfa: dil sabit, düğmeler karşılık sayfalara bağlantı.
      ok(info.htmlLang === pageLang, `${tag}: html lang ${info.htmlLang}, beklenen ${pageLang}`);
      ok(info.about === NAV_ABOUT[pageLang], `${tag}: menü dili yanlış (${info.about})`);
      for (const [l, tagName, href, active] of info.switcher) {
        ok(tagName === 'A' && href === (g[l] || g.tr), `${tag}: ${l} düğmesi ${href}`);
        ok(active === (l === pageLang), `${tag}: ${l} düğmesinin etkinliği yanlış`);
      }
      for (const l of ['tr', 'en', 'de']) ok(info.hreflang.some(([h, href]) => h === l && href.endsWith(g[l])), `${tag}: hreflang ${l} yok`);
      ok(!info.note, `${tag}: çevrilmiş sayfada not çıkmamalı`);
    } else {
      // Çevirisi olmayan Türkçe sayfa: içerik Türkçe, menü seçilen dilde, Türkçe dışında not.
      ok(info.htmlLang === 'tr', `${tag}: içerik dili ${info.htmlLang}`);
      ok(info.headerLang === pref, `${tag}: menü dili ${info.headerLang}`);
      ok(info.about === NAV_ABOUT[pref], `${tag}: menü etiketi ${info.about}`);
      ok(info.aboutHref === (pref === 'tr' ? '/hakkimda/' : routes['/hakkimda/'][pref]), `${tag}: Hakkımda bağlantısı ${info.aboutHref}`);
      ok(pref === 'tr' ? !info.note : info.note.length > 10, `${tag}: not "${info.note}"`);
    }
    await ctx.close();
  }
}

// 2) Ana sayfada dil seçimi menü bağlantılarını değiştirir; eski #about/#lessons/#contact doğru dile gider.
for (const lang of ['tr', 'en', 'de']) {
  const { ctx, page } = await open('/', { lang });
  const hrefs = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.topbar .nav-link')].map(a => [a.dataset.i18n, a.getAttribute('href')])));
  ok(hrefs.navAbout === (routes['/hakkimda/'][lang] || '/hakkimda/'), `ana sayfa [${lang}]: Hakkımda ${hrefs.navAbout}`);
  ok(hrefs.navLessons === (routes['/online-almanca-dersi/'][lang] || '/online-almanca-dersi/'), `ana sayfa [${lang}]: Dersler ${hrefs.navLessons}`);
  ok(hrefs.navContact === (routes['/iletisim/']?.[lang] || '/iletisim/'), `ana sayfa [${lang}]: İletişim ${hrefs.navContact}`);
  await ctx.close();
  for (const [hash, tr] of [['about', '/hakkimda/'], ['lessons', '/online-almanca-dersi/'], ['contact', '/iletisim/']]) {
    const r = await open('/#' + hash, { lang });
    await r.page.waitForLoadState('load');
    const want = lang === 'tr' ? tr : (routes[tr]?.[lang] || tr);
    ok(new URL(r.page.url()).pathname === want, `/#${hash} [${lang}] → ${new URL(r.page.url()).pathname}, beklenen ${want}`);
    await r.ctx.close();
  }
}
{
  // Ana sayfada düğmeyle EN seçilince menü bağlantısı hemen /en/… olur.
  const { ctx, page } = await open('/', { lang: 'tr' });
  await page.click('.lang button[data-lang="en"]');
  ok(await page.getAttribute('.nav-link[data-i18n="navAbout"]', 'href') === routes['/hakkimda/'].en, 'ana sayfa: EN düğmesi menüyü çevirmedi');
  await page.click('.nav-link[data-i18n="navAbout"]');
  await page.waitForLoadState('load');
  ok(new URL(page.url()).pathname === routes['/hakkimda/'].en, `ana sayfa EN → Hakkımda: ${page.url()}`);
  // Çeviri sayfasında TR düğmesi Türkçe karşılığa gider ve seçimi kaydeder.
  await page.click('.lang a[data-lang="tr"]');
  await page.waitForLoadState('load');
  ok(new URL(page.url()).pathname === '/hakkimda/', `EN → TR düğmesi: ${page.url()}`);
  ok(await page.evaluate(() => localStorage.getItem('baLang')) === 'tr', 'TR düğmesi seçimi kaydetmedi');
  await page.click('.lang a[data-lang="de"]');
  await page.waitForLoadState('load');
  ok(new URL(page.url()).pathname === routes['/hakkimda/'].de, `TR → DE düğmesi: ${page.url()}`);
  // Seçim sayfalar arasında korunur: ana sayfa Almanca açılır.
  await page.click('.brand');
  await page.waitForLoadState('load');
  ok(await page.evaluate(() => document.documentElement.lang) === 'de', 'DE sayfasından ana sayfaya dönünce dil korunmadı');
  await ctx.close();
}

// 3) Çevirisi olmayan sayfada not: kapatılabilir, oturum boyunca kapalı kalır, dil düğmesiyle gelir ve gider.
{
  const lesson = '/almanca-gramer/a1/artikel/';
  const { ctx, page } = await open(lesson, { lang: 'tr' });
  ok(!(await page.$('.ba-lang-note')), 'not TR iken görünmemeli');
  await page.click('.lang button[data-lang="de"]');
  ok((await page.textContent('.ba-lang-note p')).includes('Türkisch'), 'DE notu yok');
  ok(await page.evaluate(() => document.documentElement.lang) === 'tr', 'içerik dili değişmemeli');
  ok(await page.getAttribute('.topbar', 'lang') === 'de', 'menü DE olmalı');
  ok(await page.getAttribute('#themeToggle', 'aria-label') === 'Dunkles Design aktivieren', 'tema düğmesi menü dilinde olmalı');
  await page.click('.lang button[data-lang="en"]');
  ok((await page.textContent('.ba-lang-note p')).includes('Turkish'), 'EN notu yok');
  ok(await page.getAttribute('.ba-lang-note-close', 'aria-label') === 'Close note', 'kapatma düğmesi etiketi');
  await page.click('.ba-lang-note-close');
  ok(!(await page.$('.ba-lang-note')), 'not kapanmadı');
  await page.goto(BASE + '/blog/');
  ok(!(await page.$('.ba-lang-note')), 'kapatılan not aynı oturumda tekrar çıktı');
  await page.click('.lang button[data-lang="tr"]');
  ok(await page.getAttribute('.topbar', 'lang') === 'tr', 'TR düğmesi menüyü geri çevirmedi');
  await ctx.close();
}

// 4) 404: dil önekli adresler ilgili sayfaya, olmayan adres seçilen dilde 404 sayfası.
for (const [from, to, lang] of [['/en/hakkimda/', routes['/hakkimda/'].en, 'en'], ['/de/online-almanca-dersi/', routes['/online-almanca-dersi/'].de, 'de'], ['/de/', '/', 'de'], ['/en/', '/', 'en'], ['/en/almanca-gramer/a1/artikel/', '/almanca-gramer/a1/artikel/', 'en']]) {
  const { ctx, page } = await open(from, { lang: 'tr' });
  await page.waitForURL(u => new URL(u).pathname === to, { timeout: 5000 }).catch(() => {});
  ok(new URL(page.url()).pathname === to, `${from} → ${new URL(page.url()).pathname}, beklenen ${to}`);
  const shown = await page.evaluate(() => document.querySelector('.topbar')?.lang || document.documentElement.lang);
  ok(shown === lang, `${from}: dil ${shown}, beklenen ${lang}`);
  await ctx.close();
}
for (const [lang, title] of [['tr', 'Aradığın sayfa bulunamadı'], ['en', 'We couldn’t find this page'], ['de', 'Diese Seite wurde nicht gefunden']]) {
  const { ctx, page, res } = await open('/olmayan-sayfa/', { lang });
  ok(res.status() === 404 && (await page.textContent('h1')) === title, `404 [${lang}]: ${await page.textContent('h1')}`);
  await ctx.close();
}

// 5) Telefon genişliği (menü açık) ve koyu tema: yatay taşma yok, dil düğmeleri görünür.
const mobile = [...Object.values(routes).flatMap(Object.values), '/hakkimda/', '/almanca-gramer/a1/artikel/', '/'];
for (const u of mobile) for (const theme of ['light', 'dark']) {
  const { ctx, page } = await open(u, { lang: 'de', width: 390, theme, session: true });
  await page.click('.menu-toggle');
  const m = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    lang: getComputedStyle(document.querySelector('.topbar .lang')).display,
    // Menü, footer, not ve çevrilmiş sayfa içeriği (Almanca uzun kelimeler); kendi kaydırma kutusundaki öğeler hariç.
    wide: [...document.querySelectorAll(`.topbar *, footer *, .ba-lang-note *${document.documentElement.dataset.baFixedLang ? ', main *' : ''}`)].filter(el => { const r = el.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.lp-table-wrap, .nav-links'); }).map(el => el.tagName + '.' + el.className).slice(0, 3),
    theme: document.documentElement.dataset.theme
  }));
  ok(m.overflow <= 0 && !m.wide.length, `${u} [390px ${theme}]: taşma ${m.overflow}px ${m.wide.join(', ')}`);
  ok(m.lang === 'flex', `${u} [390px]: menü açıkken dil düğmeleri görünmüyor`);
  ok(m.theme === theme, `${u}: tema ${m.theme}`);
  await ctx.close();
}

// 6) İletişim formu: hata ve başarı mesajları sayfanın dilinde, konu satırında [EN] / [DE]. Web3Forms isteği yakalanır.
{
  const MSG = {
    tr: ['Lütfen ad, geçerli e-posta ve mesaj alanlarını doldur.', 'Mesajın iletildi'],
    en: ['Please enter your name, a valid email address and a message.', 'Your message was sent'],
    de: ['Bitte Name, gültige E-Mail-Adresse und Nachricht ausfüllen.', 'Ihre Nachricht wurde gesendet']
  };
  for (const lang of ['tr', 'en', 'de']) {
    const url = lang === 'tr' ? '/iletisim/' : routes['/iletisim/'][lang];
    const { ctx, page } = await open(url, { lang: 'tr' });
    let body = null;
    await page.route('https://api.web3forms.com/**', route => { body = JSON.parse(route.request().postData() || '{}'); route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }); });
    await page.click('#contactSubmitBtn');
    const err = await page.textContent('#formStatus');
    ok(err.startsWith(MSG[lang][0].slice(0, 20)), `iletişim [${lang}]: hata mesajı "${err}"`);
    await page.fill('#name', 'Test Kişi');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Test mesajı');
    await page.press('#message', 'Tab');
    await page.click('#contactSubmitBtn');
    await page.waitForFunction(() => document.querySelector('#formStatus')?.classList.contains('success'), null, { timeout: 5000 }).catch(() => {});
    const done = await page.textContent('#formStatus');
    ok(done.startsWith(MSG[lang][1]), `iletişim [${lang}]: başarı mesajı "${done}"`);
    const prefix = lang === 'tr' ? 'Bozkurt Academy' : `[${lang.toUpperCase()}] Bozkurt Academy`;
    ok(body?.subject?.startsWith(prefix) && body?.language === lang, `iletişim [${lang}]: konu "${body?.subject}", dil ${body?.language}`);
    const hidden = await page.getAttribute('input[name="subject"]', 'value');
    ok(hidden.startsWith(prefix), `iletişim [${lang}]: JavaScript kapalıyken konu "${hidden}"`);
    ok(await page.getAttribute('input[name="redirect"]', 'value') === `https://bozkurtacademy.com${url}?gonderildi=1`, `iletişim [${lang}]: yönlendirme adresi`);
    await ctx.close();
  }
}

// 7) Almanca metinler "Sie" ile: sözlüklerde ve /de/ sayfalarında "du" biçimi yok (çocuk oyunu Artikel Evleri hariç).
{
  const du = /\b(du|dich|dir|dein|deine|deinen|deinem|deiner|deines)\b/i;
  for (const file of ['js/app.js', 'js/account/i18n.js', 'js/placement.js']) {
    const src = fs.readFileSync(path.join(root, file), 'utf8');
    const start = src.search(/\n\s*de\s*:\s*\{/), end = src.search(/\n\s*en\s*:\s*\{/);
    const bad = src.slice(start, end).split('\n').filter(line => du.test(line) && !/^\s*(ae|kidsCard)\w*\s*:/.test(line) && !/plWritingPrompt/.test(line));
    ok(!bad.length, `${file}: Almancada "du" kaldı: ${bad.map(l => l.trim().slice(0, 60)).join(' | ')}`);
  }
  for (const p of Object.values(routes).map(a => a.de).filter(Boolean)) {
    const text = fs.readFileSync(path.join(root, p, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/mein, dein, sein, ihr/g, '');
    const m = du.exec(text);
    ok(!m, `${p}: "du" biçimi: …${m ? text.slice(Math.max(0, m.index - 30), m.index + 30) : ''}…`);
  }
}

// 8) Masaüstünde menünün son bağlantısı düğmelerin (CTA, tema, dil) altına girmez; Almanca etiketler en uzunu.
for (const [u, lang] of [['/', 'de'], ['/', 'en'], ['/', 'tr'], [routes['/hakkimda/'].de, 'de'], [routes['/hakkimda/'].en, 'en'], ['/almanca-gramer/a1/artikel/', 'de']]) {
  for (const width of [1021, 1121, 1200, 1280, 1366, 1440, 1600]) {
    const { ctx, page } = await open(u, { lang, width, session: true });
    const gap = await page.evaluate(() => {
      const last = [...document.querySelectorAll('.topbar .nav-link:not([hidden])')].pop().getBoundingClientRect();
      return Math.round(document.querySelector('.topbar .nav-actions').getBoundingClientRect().left - last.right);
    });
    ok(gap >= 0, `${u} [${lang} ${width}px]: menü düğmelerin altına giriyor (${gap}px)`);
    await ctx.close();
  }
}

await browser.close();
server.close();
console.log(`${fail ? 'FAIL' : 'PASS'}: ${pass} kontrol geçti${fail ? `, ${fail} kontrol başarısız` : ''}.`);
process.exit(fail ? 1 : 0);
