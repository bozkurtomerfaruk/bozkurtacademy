// Statik sayfalardaki ortak parçaları (head, header, sayfa yolu, footer, betikler) ve sitemap.xml'i üretir.
//   node scripts/build-pages.mjs          dosyaları günceller
//   node scripts/build-pages.mjs --check  bir dosya güncel değilse hata verir (CI)
//
// Her sayfa dosyasında işaretler vardır: <!-- ba:head -->…<!-- /ba:head --> gibi. İşaretlerin
// ARASI bu betik tarafından yeniden yazılır; sayfa içeriğini işaretlerin dışında düzenle.
// SSS şeması (FAQPage), sayfadaki <details class="lp-faq-item"> bloklarından otomatik çıkarılır.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, PAGES } from './site-pages.mjs';
import { GRAMMAR_DATE, grammarPages, grammarBody, lessonSchema, lessonFaq } from './grammar-pages.mjs';
import { blogPages, blogBody, blogSchema, homeBlog, blogBacklinks } from './blog-pages.mjs';
import { CSP } from './csp.mjs';
import { LANGS, LOCALE, IN_LANGUAGE, UI, FOOTER, appText, routes, alternates, localHref } from './site-i18n.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const SITEMAP_DATE = '2026-11-04';
const V = { themeInit: 1, html: 1, style: 13, base: 13, landing: 1, app: 40, theme: 11, analytics: 7, a1lessons: 19, a1css: 8, grammarPages: 3, blog: 6 };
const OG_IMAGE = `${SITE}/images/og-bozkurt-academy.jpg`;

const SECURITY = `
  <meta http-equiv="Content-Security-Policy" content="${CSP}" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <script src="/js/theme-init.js?v=${V.themeInit}"></script>
  `;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const root0 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GRAMMAR = grammarPages(root0);
const BLOG = blogPages(root0);
for (const p of GRAMMAR.pages) if (p.kind !== 'hub') p.blogNote = blogBacklinks(BLOG.linkedFrom[p.path]);
const byPath = Object.fromEntries([...PAGES, ...GRAMMAR.pages, BLOG.index, ...BLOG.posts].map(p => [p.path, p]));
// Slug eşleme tablosu: Türkçe adres → { en, de } (scripts/site-pages.mjs TRANSLATIONS).
const ROUTES = routes(Object.values(byPath));
for (const p of Object.values(byPath)) {
  p.lang ||= 'tr';
  if (p.of && !byPath[p.of]) throw new Error(`${p.path}: Türkçe karşılığı ${p.of} yok`);
}
const ROUTES_BACK = Object.fromEntries(Object.entries(ROUTES).flatMap(([tr, alt]) => Object.values(alt).map(p => [p, tr])));
const hasAlternates = page => Object.keys(alternates(page, ROUTES)).length > 1;
// <html> etiketi: çevirisi olan sayfalar dilini sabitler; çevirisi olmayan Türkçe sayfalarda içerik Türkçe kalır,
// menü ve footer seçilen dili izler (js/app.js, data-ba-content-lang).
const htmlTag = page => hasAlternates(page)
  ? `<html lang="${page.lang}" data-ba-fixed-lang="${page.lang}">`
  : `<html lang="tr" data-ba-content-lang="tr">`;

const NAV = [
  { key: 'home', label: 'Ana Sayfa', i18n: 'navHome', href: '/', spa: '#home' },
  { key: 'lessons', label: 'Almanca Dersleri', i18n: 'navLessons', href: '/online-almanca-dersi/' },
  { key: 'grammar', label: 'Gramer', i18n: 'navGrammar', href: '/almanca-gramer/' },
  { key: 'exercises', label: 'Alıştırmalar', i18n: 'navExercises', href: '/#exercises', spa: '#exercises' },
  { key: 'exams', label: 'Sınav Hazırlığı', i18n: 'navExams', href: '/almanca-sinav-hazirlik/' },
  { key: 'blog', label: 'Blog', i18n: 'navBlog', href: '/blog/' },
  { key: 'about', label: 'Hakkımda', i18n: 'navAbout', href: '/hakkimda/' },
  { key: 'contact', label: 'İletişim', i18n: 'navContact', href: '/iletisim/' }
];

const THEME_ICONS = '<svg class="theme-icon theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor"/></svg><svg class="theme-icon theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// Dil düğmeleri her sayfada aynı yerde ve aynı görünümde. Çevirisi olan sayfada her düğme o sayfanın
// diğer dildeki karşılığına giden bir bağlantıdır; diğer sayfalarda düğmeler dili yerinde değiştirir (js/app.js).
function langSwitch(lang, page) {
  const alt = page && hasAlternates(page) ? alternates(page, ROUTES) : null;
  const items = LANGS.map(l => {
    const active = l === (alt ? lang : 'tr');
    if (!alt) return `<button type="button" data-lang="${l}"${active ? ' class="active"' : ''}>${l.toUpperCase()}</button>`;
    const href = alt[l] || alt.tr;
    return `<a href="${href}" hreflang="${l}" lang="${l}" data-lang="${l}"${active ? ' class="active" aria-current="true"' : ''}>${l.toUpperCase()}</a>`;
  }).join('\n          ');
  return `
        <div class="lang" role="group" aria-label="${UI[lang].langGroup}" data-i18n-aria="langGroup">
          ${items}
        </div>`;
}

// spa: index.html (tek sayfa uygulaması); current: menüde etkin bölüm; page: dil düğmelerinin karşılıkları.
function header({ spa = false, current = null, lang = 'tr', page = null } = {}) {
  const u = UI[lang];
  const label = (key, tr) => lang === 'tr' ? tr : appText(lang, key);
  const links = NAV.map(n => {
    const isSpa = spa && n.spa;
    const href = isSpa ? n.spa : localHref(n.href, lang, ROUTES);
    const attrs = [`class="nav-link${(spa ? n.key === 'home' : n.key === current) ? ' active' : ''}"`, `href="${href}"`];
    if (isSpa) attrs.push(`data-page="${n.key}"`);
    if (!spa && n.key === current) attrs.push('aria-current="page"');
    attrs.push(`data-i18n="${n.i18n}"`);
    return `          <a ${attrs.join(' ')}>${label(n.i18n, n.label)}</a>`;
  }).join('\n');
  const home = spa ? 'href="#home" data-page="home"' : 'href="/"';
  return `
    <header class="topbar">
      <nav class="nav" aria-label="${u.siteMenu}">
        <a class="brand" ${home} aria-label="${u.homeAria}">
          <img src="/images/logo-mark.svg" width="64" height="64" alt="" class="brand-logo brand-logo-light"><img src="/images/logo-mark-dark.svg" width="64" height="64" alt="" class="brand-logo brand-logo-dark">
          <div><div class="brand-title">Bozkurt Academy</div><div class="brand-sub" data-i18n="brandSub">${label('brandSub', 'Almancada net ilerleme')}</div></div>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="siteMenu" data-i18n="menuOpen">${label('menuOpen', 'Menü')}</button>
        <div class="nav-links" id="siteMenu">
${links}
          <!-- Quiet launch: the account link stays hidden until the privacy policy is final. Login pages still open by URL. -->
          <a class="nav-link nav-account" href="/giris.html" id="navAccount" data-i18n="navLogin" hidden>${label('navLogin', 'Giriş')}</a>
        </div>
        <div class="nav-actions">
        <a class="btn primary nav-cta" href="${localHref('/iletisim/', lang, ROUTES)}" data-i18n="ctaFreeInfo">${label('ctaFreeInfo', 'Ücretsiz bilgi al')}</a>
        <button id="themeToggle" class="theme-toggle" type="button" aria-label="${u.themeAria}" aria-pressed="false">${THEME_ICONS}</button>${langSwitch(lang, page)}
        </div>
      </nav>
    </header>
    `;
}

// Footer grupları: scripts/site-i18n.mjs (FOOTER), etiketler js/app.js sözlüğünde (ft… anahtarları, data-i18n).
function footer({ current = null, sticky = true, lang = 'tr' } = {}) {
  const label = (key, tr) => lang === 'tr' ? tr : appText(lang, key);
  const groups = FOOTER.map(([title, links]) => `          <div class="footer-group"><p class="footer-group-title" data-i18n="${title}">${appText(lang, title)}</p><ul>${links.map(([href, key]) => {
    const local = localHref(href, lang, ROUTES);
    return `<li><a href="${local}"${local === current ? ' aria-current="page"' : ''} data-i18n="${key}">${appText(lang, key)}</a></li>`;
  }).join('')}</ul></div>`).join('\n');
  return `
    <footer>
      <div class="footer-brand"><img src="/images/logo-mark.svg" width="64" height="64" alt="" class="footer-logo brand-logo-light"><img src="/images/logo-mark-dark.svg" width="64" height="64" alt="" class="footer-logo brand-logo-dark"><div><strong>Bozkurt Academy</strong><br><span data-i18n="footerText">${label('footerText', 'Online Almanca dersleri ve öğrenme materyalleri')}</span></div></div>
      <nav class="footer-pages" aria-label="${UI[lang].sitePages}">
${groups}
      </nav>
      <div class="footer-meta">
        <nav class="footer-links" aria-label="${label('footerLegal', 'Yasal bilgiler')}" data-i18n-aria="footerLegal">
          <a href="/privacy.html" data-i18n="footerPrivacy">${label('footerPrivacy', 'Gizlilik politikası')}</a>
        </nav>
        <span>© 2026 Bozkurt Academy</span>
      </div>
    </footer>${sticky ? `
    <a class="ba-sticky-cta btn primary" href="${localHref('/iletisim/', lang, ROUTES)}" data-i18n="ctaFreeInfo">${label('ctaFreeInfo', 'Ücretsiz bilgi al')}</a>` : ''}
    `;
}

function trail(page) {
  const items = [];
  for (let p = page; p; p = p.parent ? byPath[p.parent] : null) items.unshift(p);
  return [{ path: '/', crumb: UI[page.lang || 'tr'].crumbHome }, ...items];
}

function breadcrumb(page) {
  const t = trail(page);
  const nav = UI[page.lang || 'tr'].crumbNav;
  const lis = t.map((p, i) => i === t.length - 1
    ? `<li aria-current="page">${esc(p.crumb)}</li>`
    : `<li><a href="${p.path}">${esc(p.crumb)}</a></li>`).join('');
  return `\n      <nav class="lp-breadcrumb" aria-label="${nav}"><ol>${lis}</ol></nav>\n      `;
}

const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function faqs(html) {
  const out = [];
  const re = /<details class="lp-faq-item">\s*<summary>([\s\S]*?)<\/summary>\s*<div class="lp-faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g;
  let m;
  while ((m = re.exec(html))) out.push({ q: strip(m[1]), a: strip(m[2]) });
  return out;
}

// hreflang: sayfanın bütün dil sürümleri ve x-default (Türkçe). Çevirisi olmayan sayfada tr ve x-default.
function hreflang(page) {
  const alt = alternates(page, ROUTES);
  return [...LANGS.filter(l => alt[l]).map(l => [l, alt[l]]), ['x-default', alt.tr]]
    .map(([l, p]) => `\n  <link rel="alternate" hreflang="${l}" href="${SITE}${p}" />`).join('');
}

function head(page, html) {
  const url = SITE + page.path;
  const t = trail(page);
  const graph = [
    {
      '@type': page.type || 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: IN_LANGUAGE[page.lang],
      isPartOf: { '@id': `${SITE}/#website` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      ...(page.type === 'ProfilePage' ? { mainEntity: { '@id': `${SITE}/#person` } } : {}),
      primaryImageOfPage: { '@type': 'ImageObject', url: page.ogImage ? SITE + page.ogImage : OG_IMAGE }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: t.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.crumb, item: SITE + p.path }))
    },
    ...(page.schema || []),
    ...lessonSchema(page, SITE),
    ...blogSchema(page, SITE)
  ];
  // Kişi ve kurum tanımı ana sayfada; burada yalnızca @id ile bağlanır. Hakkımda sayfası kişiyi tekrar tanımlar.
  if (page.type === 'ProfilePage') graph.push({
    '@type': 'Person', '@id': `${SITE}/#person`, name: 'Ömer Faruk Bozkurt', jobTitle: { tr: 'Almanca eğitmeni', en: 'German teacher', de: 'Deutschlehrer' }[page.lang],
    url, image: `${SITE}/images/omer-faruk-768.jpg`, worksFor: { '@id': `${SITE}/#organization` },
    homeLocation: { '@type': 'Country', name: { tr: 'Almanya', en: 'Germany', de: 'Deutschland' }[page.lang] }, knowsLanguage: ['tr', 'de', 'en']
  });
  const qa = page.kind === 'lesson' ? lessonFaq(page) : faqs(html);
  if (qa.length) graph.push({
    '@type': 'FAQPage', '@id': `${url}#faq`,
    mainEntity: qa.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  });
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/\n/g, '\n  ');
  return `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!-- ba:security -->${SECURITY}<!-- /ba:security -->
  <meta name="theme-color" content="#f8f7f3" />
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />${page.noindex ? `
  <meta name="robots" content="noindex" />` : ''}
  <link rel="canonical" href="${url}" />${hreflang(page)}
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3">
  <!-- Manifest bilerek yok (PWA kurulumu kapalı). Play Store uygulaması çıkınca geri eklenecek: README.md › "PWA / uygulama kurulumu". -->
  <meta property="og:type" content="${page.ogType || 'website'}" />
  <meta property="og:site_name" content="Bozkurt Academy" />
  <meta property="og:locale" content="${LOCALE[page.lang]}" />${Object.keys(alternates(page, ROUTES)).filter(l => l !== page.lang).map(l => `
  <meta property="og:locale:alternate" content="${LOCALE[l]}" />`).join('')}
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:image" content="${page.ogImage ? SITE + page.ogImage : OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${page.ogImageAlt ? esc(page.ogImageAlt) : UI[page.lang].ogAlt}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(page.title)}" />
  <meta name="twitter:description" content="${esc(page.description)}" />
  <meta name="twitter:image" content="${page.ogImage ? SITE + page.ogImage : OG_IMAGE}" />
  <link rel="preload" href="/fonts/albert-sans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/stix-two-text.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/style.css?v=${V.style}" />
  <link rel="stylesheet" href="/css/base.css?v=${V.base}" />
  <link rel="stylesheet" href="/css/landing.css?v=${V.landing}" />${(page.css || []).map(href => `
  <link rel="stylesheet" href="${href}" />`).join('')}${page.kind === 'lesson' ? `
  <link rel="stylesheet" href="/css/a1-lessons.css?v=${V.a1css}" />` : ''}${['hub', 'level', 'lesson'].includes(page.kind) ? `
  <link rel="stylesheet" href="/css/grammar-pages.css?v=${V.grammarPages}" />` : ''}${page.kind?.startsWith('blog') ? `
  <link rel="stylesheet" href="/css/blog.css?v=${V.blog}" />` : ''}
  <script type="application/ld+json">
  ${ld}
  </script>
  `;
}

const scripts = (page = {}) => `
  <script src="/js/app.js?v=${V.app}"></script>${page.kind === 'lesson' ? `
  <script src="/js/html.js?v=${V.html}"></script>
  <script src="/js/a1-lessons.js?v=${V.a1lessons}"></script>` : ''}
  <script src="/js/theme.js?v=${V.theme}"></script>${(page.js || []).map(src => `
  <script src="${src}"></script>`).join('')}
  <script defer data-goatcounter="https://bozkurtacademy.goatcounter.com/count" data-goatcounter-settings='{"no_onload": true}' src="/js/vendor/count.js?v=2.7.0"></script>
  <script defer src="/js/analytics.js?v=${V.analytics}"></script>
  `;

function fill(html, name, content, file) {
  const re = new RegExp(`(<!-- ba:${name} -->)[\\s\\S]*?(<!-- /ba:${name} -->)`);
  if (!re.test(html)) throw new Error(`${file}: <!-- ba:${name} --> işareti yok`);
  return html.replace(re, (_, a, b) => a + content + b);
}

const outputs = [];
// İngilizce/Almanca sayfanın içeriğindeki site içi bağlantılar o dildeki karşılığa çevrilir; karşılığı
// yoksa Türkçe sayfa kalır. Kalan sayfalar çevrildikçe bağlantılar bir sonraki üretimde kendiliğinden güncellenir.
const localizeLinks = (html, lang) => html.replace(/href="(\/[^"]*)"/g, (m, href) => `href="${localHref(ROUTES_BACK[href.split(/[?#]/)[0]] ? href.replace(/^[^?#]*/, ROUTES_BACK[href.split(/[?#]/)[0]]) : href, lang, ROUTES)}"`);
for (const page of PAGES) {
  const file = path.join(root, page.path, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  // Blogdan geri dönüş cümleleri (_blog/posts.json "backlinks"): yalnızca yazı yayınlanınca görünür.
  for (const post of BLOG.posts) {
    const sentence = post.backlinks?.[page.path];
    if (sentence) html = fill(html, `blog:${post.slug}`, post.draft ? '' : ' ' + sentence.replace('{link}', `<a href="${post.path}">${esc(post.h1)}</a>`), file);
  }
  if (!/<html[^>]*>/.test(html)) throw new Error(`${file}: <html> etiketi yok`);
  html = html.replace(/<html[^>]*>/, htmlTag(page));
  if (page.lang !== 'tr') html = localizeLinks(html, page.lang);
  html = fill(html, 'head', head(page, html), file);
  html = fill(html, 'header', header({ current: page.nav, lang: page.lang, page }), file);
  html = fill(html, 'breadcrumb', breadcrumb(page), file);
  html = fill(html, 'footer', footer({ current: page.path, sticky: !page.noStickyCta, lang: page.lang }), file);
  html = fill(html, 'scripts', scripts(page), file);
  outputs.push([file, html]);
}
// Menü ve footer'ı paylaşan diğer sayfalar (sitemap'e girmez). Yönetim sayfası: sabit iletişim düğmesi yok.
// Ortak <head> kullanmayan, elle yazılmış sayfalar: yalnızca güvenlik bölümü (CSP, referrer, tema başlatıcı).
for (const name of ['giris.html', 'kayit.html', 'panel.html', 'privacy.html', 'ogretmen.html', 'ogretmen-odev.html', 'ogretmen-ogrenci.html', 'ogretmen-takvim.html']) {
  const file = path.join(root, name);
  outputs.push([file, fill(fs.readFileSync(file, 'utf8'), 'security', SECURITY, file)]);
}
for (const [name, opts, footerOpts] of [['index.html', { spa: true }, {}], ['404.html', {}, {}], ['yonetim/yorumlar/index.html', {}, { sticky: false }]]) {
  const file = path.join(root, name);
  let html = fs.readFileSync(file, 'utf8');
  html = fill(html, 'security', SECURITY, file);
  if (name === 'index.html') html = fill(html, 'hreflang', hreflang({ path: '/' }), file);
  html = fill(html, 'header', header(opts), file);
  html = fill(html, 'footer', footer(footerOpts), file);
  if (name === 'index.html') html = fill(html, 'home-blog', homeBlog(BLOG.published), file);
  outputs.push([file, html]);
}
// Gramer sayfaları: dosyanın tamamı üretilir (elle düzenleme yapılmaz; içerik data/<seviye>-grammar.json'da).
for (const page of GRAMMAR.pages) {
  const file = path.join(root, page.path, 'index.html');
  const html = `<!DOCTYPE html>
<!-- Bu dosya scripts/build-pages.mjs ile üretilir. İçeriği data/<seviye>-grammar.json'da düzenle, sonra: node scripts/build-pages.mjs -->
${htmlTag(page)}
<head>${head(page, '')}</head>
<body class="academy-theme lp-page gr-page">
  <a class="skip-link" href="#main" data-skip-link>Ana içeriğe geç</a>
  <div class="shell">${header({ current: 'grammar', lang: page.lang, page })}<main id="main" tabindex="-1" class="${page.kind === 'lesson' ? 'gr-main' : 'lp-main'}">${breadcrumb(page)}${grammarBody(page, GRAMMAR.lessonPath)}    </main>${footer({ current: page.path, lang: page.lang })}</div>${scripts(page)}
</body>
</html>
`;
  outputs.push([file, html]);
}

// Blog: ana sayfa ve yazılar (dosyanın tamamı üretilir; kaynak _blog/). Taslaklar ve boş blog sitemap'e girmez.
for (const page of [BLOG.index, ...BLOG.posts]) {
  const file = path.join(root, page.path, 'index.html');
  const html = `<!DOCTYPE html>
<!-- Bu dosya scripts/build-pages.mjs ile üretilir. Yazılar _blog/ klasöründe; değiştirince: node scripts/build-pages.mjs -->
${htmlTag(page)}
<head>${head(page, '')}</head>
<body class="academy-theme lp-page bl-page">
  <a class="skip-link" href="#main" data-skip-link>Ana içeriğe geç</a>
  <div class="shell">${header({ current: 'blog', lang: page.lang, page })}<main id="main" tabindex="-1" class="lp-main">${breadcrumb(page)}${blogBody(page)}    </main>${footer({ current: page.path })}</div>${scripts(page)}
</body>
</html>
`;
  outputs.push([file, html]);
}
const blogUrls = BLOG.published.length ? [{ path: BLOG.index.path, updated: BLOG.published[0].updated || BLOG.published[0].date }, ...BLOG.published.map(p => ({ path: p.path, updated: p.updated || p.date }))] : [];

// Dil sürümü olan adresler sitemap'te birbirine xhtml:link ile bağlanır.
const urls = [{ path: '/', updated: '2026-11-10' }, ...PAGES, ...GRAMMAR.pages.map(p => ({ ...p, updated: GRAMMAR_DATE })), ...blogUrls].map(p => {
  const page = byPath[p.path] || p;
  const alt = alternates(page, ROUTES);
  const links = Object.keys(alt).length > 1
    ? [...LANGS.filter(l => alt[l]).map(l => [l, alt[l]]), ['x-default', alt.tr]].map(([l, u]) => `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE}${u}"/>`).join('')
    : '';
  return `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${p.updated || SITEMAP_DATE}</lastmod>${links}\n  </url>`;
}).join('\n');
outputs.push([path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`]);

// Slug eşleme tablosu tarayıcı tarafında da gerekli: dil düğmesi, menü bağlantıları ve eski #about adresleri.
{
  const json = JSON.stringify(ROUTES);
  for (const name of ['js/app.js', 'js/legacy-hash.js']) {
    const file = path.join(root, name);
    const src = fs.readFileSync(file, 'utf8');
    const re = /(\/\*ba:routes\*\/)[\s\S]*?(\/\*\/ba:routes\*\/)/;
    if (!re.test(src)) throw new Error(`${name}: /*ba:routes*/ işareti yok`);
    outputs.push([file, src.replace(re, (_, a, b) => a + json + b)]);
  }
}

// Her HTML sayfası CSP'yi taşımalı: listede unutulan yeni bir sayfa (ör. ogretmen-yeni.html) burada yakalanır.
{
  const produced = new Map(outputs);
  const skip = new Set(['node_modules', '.git', 'docs', 'tests', '.claude', 'Material', '_blog']);
  const missing = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(entry.name)) {
        const html = produced.get(full) ?? fs.readFileSync(full, 'utf8');
        if (!html.includes('<!-- ba:security -->') || !html.includes('http-equiv="Content-Security-Policy"')) missing.push(path.relative(root, full));
        if (/<script(?![^>]*\bsrc=)(?![^>]*type="application\/ld\+json")[^>]*>/.test(html) || /\son[a-z]+="/.test(html)) missing.push(path.relative(root, full) + ' (satır içi betik veya on…= niteliği)');
      }
    }
  })(root);
  if (missing.length) { console.error('CSP eksik:\n  ' + missing.join('\n  ') + '\nSayfayı yukarıdaki listelere ekle; satır içi betiği js/ altına taşı.'); process.exit(1); }
}

let stale = 0;
for (const [file, html] of outputs) {
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (old === html) continue;
  stale++;
  if (check) console.error(`Güncel değil: ${path.relative(root, file)}`);
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, html); console.log(`Yazıldı: ${path.relative(root, file)}`); }
}
if (check && stale) { console.error('node scripts/build-pages.mjs çalıştır ve sonucu commit et.'); process.exit(1); }
console.log(`PASS: ${PAGES.length} statik sayfa (${PAGES.filter(p => p.lang !== 'tr').length} çeviri), ${GRAMMAR.pages.length} gramer sayfası ve ${BLOG.posts.length + 1} blog sayfası${check ? ' güncel' : ''}.`);
