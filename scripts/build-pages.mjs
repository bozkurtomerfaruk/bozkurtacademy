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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const SITEMAP_DATE = '2026-11-04';
const V = { themeInit: 1, html: 1, style: 13, base: 12, landing: 1, app: 37, theme: 10, analytics: 7, a1lessons: 19, a1css: 8, grammarPages: 3, blog: 5 };
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
  ['Ücretsiz çalış', [['/almanca-gramer/', 'Gramer konuları'], ['/#exercises', 'Alıştırmalar'], ['/#exams', 'Sınav deneme setleri'], ['/#seviye-testi', 'Seviye testi'], ['/almanca-alfabe/', 'Almanca alfabe oyunu']]],
  ['Bozkurt Academy', [['/hakkimda/', 'Hakkımda'], ['/blog/', 'Blog'], ['/sss/', 'Sıkça sorulan sorular'], ['/iletisim/', 'İletişim']]]
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
    ...(page.schema || []),
    ...lessonSchema(page, SITE),
    ...blogSchema(page, SITE)
  ];
  // Kişi ve kurum tanımı ana sayfada; burada yalnızca @id ile bağlanır. Hakkımda sayfası kişiyi tekrar tanımlar.
  if (page.type === 'ProfilePage') graph.push({
    '@type': 'Person', '@id': `${SITE}/#person`, name: 'Ömer Faruk Bozkurt', jobTitle: 'Almanca eğitmeni',
    url, image: `${SITE}/images/omer-faruk-768.jpg`, worksFor: { '@id': `${SITE}/#organization` },
    homeLocation: { '@type': 'Country', name: 'Almanya' }, knowsLanguage: ['tr', 'de', 'en']
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
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3">
  <!-- Manifest bilerek yok (PWA kurulumu kapalı). Play Store uygulaması çıkınca geri eklenecek: README.md › "PWA / uygulama kurulumu". -->
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
for (const page of PAGES) {
  const file = path.join(root, page.path, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  // Blogdan geri dönüş cümleleri (_blog/posts.json "backlinks"): yalnızca yazı yayınlanınca görünür.
  for (const post of BLOG.posts) {
    const sentence = post.backlinks?.[page.path];
    if (sentence) html = fill(html, `blog:${post.slug}`, post.draft ? '' : ' ' + sentence.replace('{link}', `<a href="${post.path}">${esc(post.h1)}</a>`), file);
  }
  html = fill(html, 'head', head(page, html), file);
  html = fill(html, 'header', header({ current: page.nav }), file);
  html = fill(html, 'breadcrumb', breadcrumb(page), file);
  html = fill(html, 'footer', footer({ current: page.path, sticky: !page.noStickyCta }), file);
  html = fill(html, 'scripts', scripts(page), file);
  outputs.push([file, html]);
}
// Menü ve footer'ı paylaşan diğer sayfalar (sitemap'e girmez). Yönetim sayfası: sabit iletişim düğmesi yok.
// Ortak <head> kullanmayan, elle yazılmış sayfalar: yalnızca güvenlik bölümü (CSP, referrer, tema başlatıcı).
for (const name of ['giris.html', 'kayit.html', 'panel.html', 'privacy.html', 'ogretmen.html', 'ogretmen-odev.html', 'ogretmen-ogrenci.html', 'ogretmen-takvim.html', 'tools/audio-check.html']) {
  const file = path.join(root, name);
  outputs.push([file, fill(fs.readFileSync(file, 'utf8'), 'security', SECURITY, file)]);
}
for (const [name, opts, footerOpts] of [['index.html', { spa: true }, {}], ['404.html', {}, {}], ['yonetim/yorumlar/index.html', {}, { sticky: false }]]) {
  const file = path.join(root, name);
  let html = fs.readFileSync(file, 'utf8');
  html = fill(html, 'security', SECURITY, file);
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
<html lang="tr" data-ba-fixed-lang="tr">
<head>${head(page, '')}</head>
<body class="academy-theme lp-page gr-page">
  <a class="skip-link" href="#main" data-skip-link>Ana içeriğe geç</a>
  <div class="shell">${header({ current: 'grammar' })}<main id="main" tabindex="-1" class="${page.kind === 'lesson' ? 'gr-main' : 'lp-main'}">${breadcrumb(page)}${grammarBody(page, GRAMMAR.lessonPath)}    </main>${footer({ current: page.path })}</div>${scripts(page)}
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
<html lang="tr" data-ba-fixed-lang="tr">
<head>${head(page, '')}</head>
<body class="academy-theme lp-page bl-page">
  <a class="skip-link" href="#main" data-skip-link>Ana içeriğe geç</a>
  <div class="shell">${header({ current: 'blog' })}<main id="main" tabindex="-1" class="lp-main">${breadcrumb(page)}${blogBody(page)}    </main>${footer({ current: page.path })}</div>${scripts(page)}
</body>
</html>
`;
  outputs.push([file, html]);
}
const blogUrls = BLOG.published.length ? [{ path: BLOG.index.path, updated: BLOG.published[0].updated || BLOG.published[0].date }, ...BLOG.published.map(p => ({ path: p.path, updated: p.updated || p.date }))] : [];

const urls = [{ path: '/' }, ...PAGES, ...GRAMMAR.pages.map(p => ({ path: p.path, updated: GRAMMAR_DATE })), ...blogUrls].map(p => `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${p.updated || SITEMAP_DATE}</lastmod>\n  </url>`).join('\n');
outputs.push([path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`]);

// Her HTML sayfası CSP'yi taşımalı: listede unutulan yeni bir sayfa (ör. ogretmen-yeni.html) burada yakalanır.
{
  const produced = new Map(outputs);
  const skip = new Set(['node_modules', '.git', 'docs', 'tests', '.claude', 'Material', '_blog', '.tts-modeller']);
  const missing = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      // tools/audio-check-offline.html: a downloaded, offline review file (scripts/build-audio-check-offline.mjs), never
      // published (_config.yml → exclude: tools). It has its own strict CSP (no network at all) and inline code by design.
      else if (entry.name.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(entry.name) && path.relative(root, full) !== path.join('tools', 'audio-check-offline.html')) {
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
console.log(`PASS: ${PAGES.length} statik sayfa, ${GRAMMAR.pages.length} gramer sayfası ve ${BLOG.posts.length + 1} blog sayfası${check ? ' güncel' : ''}.`);
