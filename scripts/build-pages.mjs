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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const SITEMAP_DATE = '2026-11-04';
const V = { style: 11, base: 9, landing: 1, app: 31, theme: 9, analytics: 6 };
const OG_IMAGE = `${SITE}/images/og-bozkurt-academy.jpg`;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const byPath = Object.fromEntries(PAGES.map(p => [p.path, p]));

const NAV = [
  { key: 'home', label: 'Ana Sayfa', i18n: 'navHome', href: '/', spa: '#home' },
  { key: 'lessons', label: 'Almanca Dersleri', i18n: 'navLessons', href: '/online-almanca-dersi/' },
  { key: 'grammar', label: 'Gramer', i18n: 'navGrammar', href: '/#grammar', spa: '#grammar' },
  { key: 'exercises', label: 'Alıştırmalar', i18n: 'navExercises', href: '/#exercises', spa: '#exercises' },
  { key: 'exams', label: 'Sınav Hazırlığı', i18n: 'navExams', href: '/almanca-sinav-hazirlik/' },
  { key: 'about', label: 'Hakkımda', i18n: 'navAbout', href: '/hakkimda/' },
  { key: 'contact', label: 'İletişim', i18n: 'navContact', href: '/iletisim/' }
];

const THEME_ICONS = '<svg class="theme-icon theme-icon-moon" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" fill="currentColor"/></svg><svg class="theme-icon theme-icon-sun" aria-hidden="true" viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="4.5" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

// spa: index.html (tek sayfa uygulaması, dil seçimi var); current: menüde etkin bölüm.
function header({ spa = false, current = null } = {}) {
  const links = NAV.map(n => {
    const isSpa = spa && n.spa;
    const href = isSpa ? n.spa : n.href;
    const attrs = [`class="nav-link${(spa ? n.key === 'home' : n.key === current) ? ' active' : ''}"`, `href="${href}"`];
    if (isSpa) attrs.push(`data-page="${n.key}"`);
    if (!spa && n.key === current) attrs.push('aria-current="page"');
    attrs.push(`data-i18n="${n.i18n}"`);
    return `          <a ${attrs.join(' ')}>${n.label}</a>`;
  }).join('\n');
  const home = spa ? 'href="#home" data-page="home"' : 'href="/"';
  return `
    <header class="topbar">
      <nav class="nav" aria-label="Site menüsü">
        <a class="brand" ${home} aria-label="Bozkurt Academy ana sayfa">
          <img src="/images/logo-mark.svg" width="64" height="64" alt="" class="brand-logo brand-logo-light"><img src="/images/logo-mark-dark.svg" width="64" height="64" alt="" class="brand-logo brand-logo-dark">
          <div><div class="brand-title">Bozkurt Academy</div><div class="brand-sub" data-i18n="brandSub">Almancada net ilerleme</div></div>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="siteMenu" data-i18n="menuOpen">Menü</button>
        <div class="nav-links" id="siteMenu">
${links}
          <!-- Quiet launch: the account link stays hidden until the privacy policy is final. Login pages still open by URL. -->
          <a class="nav-link nav-account" href="/giris.html" id="navAccount" data-i18n="navLogin" hidden>Giriş</a>
        </div>
        <div class="nav-actions">
        <a class="btn primary nav-cta" href="/iletisim/" data-i18n="ctaFreeInfo">Ücretsiz bilgi al</a>
        <button id="themeToggle" class="theme-toggle" type="button" aria-label="Koyu temaya geç" aria-pressed="false">${THEME_ICONS}</button>${spa ? `
        <div class="lang" aria-label="Dil seçimi">
          <button data-lang="tr" class="active">TR</button>
          <button data-lang="de">DE</button>
          <button data-lang="en">EN</button>
        </div>` : ''}
        </div>
      </nav>
    </header>
    `;
}

const FOOTER_GROUPS = [
  ['Dersler', [['/online-almanca-dersi/', 'Online Almanca dersi'], ['/almanca-ozel-ders/', 'Almanca özel ders'], ['/almanca-grup-dersi/', 'Almanca grup dersi'], ['/almanca-sinav-hazirlik/', 'Sınav hazırlık']]],
  ['Seviyeler', [['/a1-almanca-kursu/', 'A1 Almanca kursu'], ['/a2-almanca-kursu/', 'A2 Almanca kursu'], ['/b1-almanca-kursu/', 'B1 Almanca kursu'], ['/b2-almanca-kursu/', 'B2 Almanca kursu']]],
  ['Ücretsiz çalış', [['/#grammar', 'Gramer konuları'], ['/#exercises', 'Alıştırmalar'], ['/#exams', 'Sınav deneme setleri'], ['/#seviye-testi', 'Seviye testi']]],
  ['Bozkurt Academy', [['/hakkimda/', 'Hakkımda'], ['/sss/', 'Sıkça sorulan sorular'], ['/iletisim/', 'İletişim']]]
];

function footer({ current = null, sticky = true } = {}) {
  const groups = FOOTER_GROUPS.map(([title, links]) => `          <div class="footer-group"><p class="footer-group-title">${title}</p><ul>${links.map(([href, label]) => `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul></div>`).join('\n');
  return `
    <footer>
      <div class="footer-brand"><img src="/images/logo-mark.svg" width="64" height="64" alt="" class="footer-logo brand-logo-light"><img src="/images/logo-mark-dark.svg" width="64" height="64" alt="" class="footer-logo brand-logo-dark"><div><strong>Bozkurt Academy</strong><br><span data-i18n="footerText">Online Almanca dersleri ve öğrenme materyalleri</span></div></div>
      <nav class="footer-pages" aria-label="Site sayfaları">
${groups}
      </nav>
      <div class="footer-meta">
        <nav class="footer-links" aria-label="Yasal bilgiler" data-i18n-aria="footerLegal">
          <a href="/privacy.html" data-i18n="footerPrivacy">Gizlilik politikası</a>
        </nav>
        <span>© 2026 Bozkurt Academy</span>
      </div>
    </footer>${sticky ? `
    <a class="ba-sticky-cta btn primary" href="/iletisim/" data-i18n="ctaFreeInfo">Ücretsiz bilgi al</a>` : ''}
    `;
}

function trail(page) {
  const items = [];
  for (let p = page; p; p = p.parent ? byPath[p.parent] : null) items.unshift(p);
  return [{ path: '/', crumb: 'Ana sayfa' }, ...items];
}

function breadcrumb(page) {
  const t = trail(page);
  const lis = t.map((p, i) => i === t.length - 1
    ? `<li aria-current="page">${esc(p.crumb)}</li>`
    : `<li><a href="${p.path}">${esc(p.crumb)}</a></li>`).join('');
  return `\n      <nav class="lp-breadcrumb" aria-label="Sayfa yolu"><ol>${lis}</ol></nav>\n      `;
}

const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function faqs(html) {
  const out = [];
  const re = /<details class="lp-faq-item">\s*<summary>([\s\S]*?)<\/summary>\s*<div class="lp-faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g;
  let m;
  while ((m = re.exec(html))) out.push({ q: strip(m[1]), a: strip(m[2]) });
  return out;
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
      inLanguage: 'tr-TR',
      isPartOf: { '@id': `${SITE}/#website` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
      ...(page.type === 'ProfilePage' ? { mainEntity: { '@id': `${SITE}/#person` } } : {}),
      primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: t.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.crumb, item: SITE + p.path }))
    },
    ...(page.schema || [])
  ];
  // Kişi ve kurum tanımı ana sayfada; burada yalnızca @id ile bağlanır. Hakkımda sayfası kişiyi tekrar tanımlar.
  if (page.type === 'ProfilePage') graph.push({
    '@type': 'Person', '@id': `${SITE}/#person`, name: 'Ömer Faruk Bozkurt', jobTitle: 'Almanca eğitmeni',
    url, image: `${SITE}/images/omer-faruk-768.jpg`, worksFor: { '@id': `${SITE}/#organization` },
    homeLocation: { '@type': 'Country', name: 'Almanya' }, knowsLanguage: ['tr', 'de', 'en']
  });
  const qa = faqs(html);
  if (qa.length) graph.push({
    '@type': 'FAQPage', '@id': `${url}#faq`,
    mainEntity: qa.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  });
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/\n/g, '\n  ');
  return `
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#f8f7f3" />
  <script>try{document.documentElement.dataset.theme=localStorage.getItem('ba-theme')==='dark'?'dark':'light'}catch(_){document.documentElement.dataset.theme='light'}</script>
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3">
  <link rel="manifest" href="/site.webmanifest">
  <meta property="og:type" content="${page.ogType || 'website'}" />
  <meta property="og:site_name" content="Bozkurt Academy" />
  <meta property="og:locale" content="tr_TR" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Bozkurt Academy: A1’den B2’ye online Almanca dersi" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(page.title)}" />
  <meta name="twitter:description" content="${esc(page.description)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />
  <link rel="preload" href="/fonts/albert-sans.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/stix-two-text.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/css/style.css?v=${V.style}" />
  <link rel="stylesheet" href="/css/base.css?v=${V.base}" />
  <link rel="stylesheet" href="/css/landing.css?v=${V.landing}" />
  <script type="application/ld+json">
  ${ld}
  </script>
  `;
}

const scripts = () => `
  <script src="/js/app.js?v=${V.app}"></script>
  <script src="/js/theme.js?v=${V.theme}"></script>
  <script defer data-goatcounter="https://bozkurtacademy.goatcounter.com/count" data-goatcounter-settings='{"no_onload": true}' src="/js/vendor/count.js?v=2.7.0"></script>
  <script defer src="/js/analytics.js?v=${V.analytics}"></script>
  `;

function fill(html, name, content, file) {
  const re = new RegExp(`(<!-- ba:${name} -->)[\\s\\S]*?(<!-- /ba:${name} -->)`);
  if (!re.test(html)) throw new Error(`${file}: <!-- ba:${name} --> işareti yok`);
  return html.replace(re, (_, a, b) => a + content + b);
}

const outputs = [];
for (const page of PAGES) {
  const file = path.join(root, page.path, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  html = fill(html, 'head', head(page, html), file);
  html = fill(html, 'header', header({ current: page.nav }), file);
  html = fill(html, 'breadcrumb', breadcrumb(page), file);
  html = fill(html, 'footer', footer({ current: page.path, sticky: !page.noStickyCta }), file);
  html = fill(html, 'scripts', scripts(), file);
  outputs.push([file, html]);
}
// Menü ve footer'ı paylaşan diğer sayfalar (sitemap'e girmez). Yönetim sayfası: sabit iletişim düğmesi yok.
for (const [name, opts, footerOpts] of [['index.html', { spa: true }, {}], ['404.html', {}, {}], ['yonetim/yorumlar/index.html', {}, { sticky: false }]]) {
  const file = path.join(root, name);
  let html = fs.readFileSync(file, 'utf8');
  html = fill(html, 'header', header(opts), file);
  html = fill(html, 'footer', footer(footerOpts), file);
  outputs.push([file, html]);
}
const urls = [{ path: '/' }, ...PAGES].map(p => `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${p.updated || SITEMAP_DATE}</lastmod>\n  </url>`).join('\n');
outputs.push([path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`]);

let stale = 0;
for (const [file, html] of outputs) {
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (old === html) continue;
  stale++;
  if (check) console.error(`Güncel değil: ${path.relative(root, file)}`);
  else { fs.writeFileSync(file, html); console.log(`Yazıldı: ${path.relative(root, file)}`); }
}
if (check && stale) { console.error('node scripts/build-pages.mjs çalıştır ve sonucu commit et.'); process.exit(1); }
console.log(`PASS: ${PAGES.length} statik sayfa${check ? ' güncel' : ''}.`);
