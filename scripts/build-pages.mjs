// Statik sayfalardaki ortak parçaları (head, header, sayfa yolu, footer, betikler) ve sitemap.xml'i üretir.
//   node scripts/build-pages.mjs          dosyaları günceller
//   node scripts/build-pages.mjs --check  bir dosya güncel değilse hata verir (CI)
//
// Her sayfa dosyasında işaretler vardır: <!-- ba:head -->…<!-- /ba:head --> gibi. İşaretlerin
// ARASI bu betik tarafından yeniden yazılır; sayfa içeriğini işaretlerin dışında düzenle.
// SSS şeması (FAQPage), sayfadaki <details class="lp-faq-item"> bloklarından otomatik çıkarılır.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { SITE, PAGES } from './site-pages.mjs';
import { GRAMMAR_DATE, grammarPages, grammarBody, lessonSchema, lessonFaq } from './grammar-pages.mjs';
import { blogPages, blogBody, blogSchema, homeBlog, blogBacklinks, blogFeed } from './blog-pages.mjs';
import { CSP } from './csp.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const SITEMAP_DATE = '2026-11-04';
const V = { themeInit: 1, html: 1, style: 13, base: 14, landing: 1, app: 50, theme: 10, analytics: 7, a1lessons: 19, a1css: 8, grammarPages: 3, blog: 6 };
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

// Arayüz metinleri tek kaynakta: js/app.js içindeki translations nesnesi. Almanca/İngilizce sayfaların menüsü,
// alt bilgisi ve sayfa yolu buradan doğrudan o dilde yazılır (Google da o dilde görür).
const UI = (() => {
  const src = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
  const start = src.indexOf('const translations = {');
  const end = src.indexOf('\n};', start);
  if (start < 0 || end < 0) throw new Error('js/app.js: translations nesnesi bulunamadı');
  return vm.runInNewContext('(' + src.slice(start + 'const translations = '.length, end + 2) + ')');
})();
// Türkçe sayfalarda mevcut yazılar aynen kalır (trText); diğer dillerde js/app.js'teki çeviri kullanılır.
const L = (lang, key, trText) => lang === 'tr' ? trText : (UI[lang]?.[key] || UI.tr[key] || trText);
const LANG_NAMES = { tr: 'TR', de: 'DE', en: 'EN' };

// Aynı sayfanın dil sürümleri (scripts/site-pages.mjs → group). ALT_BY_PATH['/iletisim/'] = {tr, de, en}.
const ALT_GROUPS = (() => {
  const groups = {};
  for (const p of PAGES) if (p.group) (groups[p.group] ||= {})[p.lang || 'tr'] = p.path;
  return groups;
})();
const ALT_BY_PATH = Object.fromEntries(Object.values(ALT_GROUPS).flatMap(g => Object.values(g).map(p => [p, g])));
// Site içi adresin o dildeki sürümü; yoksa Türkçe adres kalır.
const localHref = (href, lang) => {
  const [p, rest = ''] = href.split(/(?=[?#])/);
  return (ALT_BY_PATH[p]?.[lang] || p) + rest;
};

// spa: index.html (tek sayfa uygulaması, dil seçimi var); current: menüde etkin bölüm.
// langSwitch: dil düğmesi (öğretmenin yönetim sayfası hariç her sayfada). lang: sayfanın dili.
function header({ spa = false, current = null, langSwitch = true, lang = 'tr' } = {}) {
  const links = NAV.map(n => {
    const isSpa = spa && n.spa;
    const href = isSpa ? n.spa : localHref(n.href, lang);
    const attrs = [`class="nav-link${(spa ? n.key === 'home' : n.key === current) ? ' active' : ''}"`, `href="${href}"`];
    if (isSpa) attrs.push(`data-page="${n.key}"`);
    if (!spa && n.key === current) attrs.push('aria-current="page"');
    attrs.push(`data-i18n="${n.i18n}"`);
    return `          <a ${attrs.join(' ')}>${L(lang, n.i18n, n.label)}</a>`;
  }).join('\n');
  const home = spa ? 'href="#home" data-page="home"' : 'href="/"';
  const langButtons = Object.entries(LANG_NAMES).map(([code, name]) => `
          <button data-lang="${code}"${code === lang ? ' class="active"' : ''}>${name}</button>`).join('');
  return `
    <header class="topbar">
      <nav class="nav" aria-label="${L(lang, 'navMenuLabel', 'Site menüsü')}" data-i18n-aria="navMenuLabel">
        <a class="brand" ${home} aria-label="${L(lang, 'brandHomeLabel', 'Bozkurt Academy ana sayfa')}" data-i18n-aria="brandHomeLabel">
          <img src="/images/logo-mark.svg" width="64" height="64" alt="" class="brand-logo brand-logo-light"><img src="/images/logo-mark-dark.svg" width="64" height="64" alt="" class="brand-logo brand-logo-dark">
          <div><div class="brand-title">Bozkurt Academy</div><div class="brand-sub" data-i18n="brandSub">${L(lang, 'brandSub', 'Almancada net ilerleme')}</div></div>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="siteMenu" data-i18n="menuOpen">${L(lang, 'menuOpen', 'Menü')}</button>
        <div class="nav-links" id="siteMenu">
${links}
          <!-- Hesap bağlantısı: ziyaretçide "Giriş"; daha önce giriş yapmış öğrencide "Panelim", öğretmende "Öğretmen paneli" (js/app.js → accountNav). -->
          <a class="nav-link nav-account" href="/giris.html" id="navAccount" data-i18n="navLogin">${L(lang, 'navLogin', 'Giriş')}</a>
        </div>
        <div class="nav-actions">
        <a class="btn primary nav-cta" href="${localHref('/iletisim/', lang)}" data-i18n="ctaFreeInfo">${L(lang, 'ctaFreeInfo', 'Ücretsiz bilgi al')}</a>
        <button id="themeToggle" class="theme-toggle" type="button" aria-label="${{ tr: 'Koyu temaya geç', de: 'Dunkles Design aktivieren', en: 'Switch to dark theme' }[lang]}" aria-pressed="false">${THEME_ICONS}</button>${langSwitch ? `
        <div class="lang" aria-label="${L(lang, 'langChoice', 'Dil seçimi')}" data-i18n-aria="langChoice">${langButtons}
        </div>` : ''}
        </div>
      </nav>
    </header>
    `;
}

// [başlık, çeviri anahtarı, [[adres, yazı, çeviri anahtarı], …]] – çeviriler js/app.js'te (footer…).
const FOOTER_GROUPS = [
  ['Dersler', 'footerGroupLessons', [['/online-almanca-dersi/', 'Online Almanca dersi', 'footerOnline'], ['/almanca-ozel-ders/', 'Almanca özel ders', 'footerPrivate'], ['/almanca-grup-dersi/', 'Almanca grup dersi', 'footerGroup'], ['/almanca-sinav-hazirlik/', 'Sınav hazırlık', 'footerExamPrep']]],
  ['Seviyeler', 'footerGroupLevels', [['/a1-almanca-kursu/', 'A1 Almanca kursu', 'footerA1'], ['/a2-almanca-kursu/', 'A2 Almanca kursu', 'footerA2'], ['/b1-almanca-kursu/', 'B1 Almanca kursu', 'footerB1'], ['/b2-almanca-kursu/', 'B2 Almanca kursu', 'footerB2']]],
  ['Ücretsiz çalış', 'footerGroupFree', [['/almanca-gramer/', 'Gramer konuları', 'footerGrammar'], ['/#exercises', 'Alıştırmalar', 'footerExercises'], ['/#exams', 'Sınav deneme setleri', 'footerExamSets'], ['/#seviye-testi', 'Seviye testi', 'footerPlacement'], ['/almanca-alfabe/', 'Almanca alfabe oyunu', 'footerAlphabet']]],
  ['Bozkurt Academy', null, [['/hakkimda/', 'Hakkımda', 'navAbout'], ['/blog/', 'Blog', 'navBlog'], ['/sss/', 'Sıkça sorulan sorular', 'footerFaq'], ['/iletisim/', 'İletişim', 'navContact']]]
];

function footer({ current = null, sticky = true, lang = 'tr' } = {}) {
  const i18n = key => key ? ` data-i18n="${key}"` : '';
  const groups = FOOTER_GROUPS.map(([title, titleKey, links]) => `          <div class="footer-group"><p class="footer-group-title"${i18n(titleKey)}>${titleKey ? L(lang, titleKey, title) : title}</p><ul>${links.map(([href, label, key]) => {
    const local = localHref(href, lang);
    return `<li><a href="${local}"${local === current ? ' aria-current="page"' : ''}${i18n(key)}>${L(lang, key, label)}</a></li>`;
  }).join('')}</ul></div>`).join('\n');
  const cta = localHref('/iletisim/', lang);
  return `
    <footer>
      <div class="footer-brand"><img src="/images/logo-mark.svg" width="64" height="64" alt="" class="footer-logo brand-logo-light"><img src="/images/logo-mark-dark.svg" width="64" height="64" alt="" class="footer-logo brand-logo-dark"><div><strong>Bozkurt Academy</strong><br><span data-i18n="footerText">${L(lang, 'footerText', 'Online Almanca dersleri ve öğrenme materyalleri')}</span></div></div>
      <nav class="footer-pages" aria-label="${L(lang, 'footerPages', 'Site sayfaları')}" data-i18n-aria="footerPages">
${groups}
      </nav>
      <div class="footer-meta">
        <nav class="footer-links" aria-label="${L(lang, 'footerLegal', 'Yasal bilgiler')}" data-i18n-aria="footerLegal">
          <a href="/privacy.html" data-i18n="footerPrivacy">${L(lang, 'footerPrivacy', 'Gizlilik politikası')}</a>
          <a href="/impressum/"${current === '/impressum/' ? ' aria-current="page"' : ''} data-i18n="footerImprint">${L(lang, 'footerImprint', 'Künye (Impressum)')}</a>
        </nav>
        <span>© 2026 Bozkurt Academy</span>
      </div>
    </footer>${sticky ? `
    <a class="ba-sticky-cta btn primary" href="${cta}" data-i18n="ctaFreeInfo">${L(lang, 'ctaFreeInfo', 'Ücretsiz bilgi al')}</a>` : ''}
    `;
}

function trail(page) {
  const items = [];
  for (let p = page; p; p = p.parent ? byPath[p.parent] : null) items.unshift(p);
  const lang = page.lang || 'tr';
  return [{ path: '/', crumb: L(lang, 'breadcrumbHome', 'Ana sayfa') }, ...items];
}

function breadcrumb(page) {
  const t = trail(page);
  const lang = page.lang || 'tr';
  const lis = t.map((p, i) => i === t.length - 1
    ? `<li aria-current="page">${esc(p.crumb)}</li>`
    : `<li><a href="${p.path}">${esc(p.crumb)}</a></li>`).join('');
  return `\n      <nav class="lp-breadcrumb" aria-label="${L(lang, 'breadcrumbLabel', 'Sayfa yolu')}" data-i18n-aria="breadcrumbLabel"><ol>${lis}</ol></nav>\n      `;
}

const strip = html => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function faqs(html) {
  const out = [];
  const re = /<details class="lp-faq-item">\s*<summary>([\s\S]*?)<\/summary>\s*<div class="lp-faq-answer">([\s\S]*?)<\/div>\s*<\/details>/g;
  let m;
  while ((m = re.exec(html))) out.push({ q: strip(m[1]), a: strip(m[2]) });
  return out;
}

const IN_LANGUAGE = { tr: 'tr-TR', de: 'de-DE', en: 'en' };
const OG_LOCALE = { tr: 'tr_TR', de: 'de_DE', en: 'en_GB' };
const OG_ALT = { tr: 'Bozkurt Academy: A1’den B2’ye online Almanca dersi', de: 'Bozkurt Academy: Online-Deutschunterricht von A1 bis B2', en: 'Bozkurt Academy: online German lessons from A1 to B2' };
const JOB_TITLE = { tr: 'Almanca eğitmeni', de: 'Deutschlehrer', en: 'German teacher' };

// hreflang: Google'a "bu sayfanın diğer dil sürümleri" bilgisi. Her sürüm hepsini (kendisi dahil) listeler; varsayılan Türkçe.
function hreflang(page) {
  const group = ALT_BY_PATH[page.path];
  if (!group) return '';
  return Object.keys(LANG_NAMES).filter(l => group[l]).map(l => `
  <link rel="alternate" hreflang="${l}" href="${SITE}${group[l]}" />`).join('') + `
  <link rel="alternate" hreflang="x-default" href="${SITE}${group.tr}" />`;
}

function head(page, html) {
  const url = SITE + page.path;
  const t = trail(page);
  const lang = page.lang || 'tr';
  const group = ALT_BY_PATH[page.path];
  const graph = [
    {
      '@type': page.type || 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: page.title,
      description: page.description,
      inLanguage: IN_LANGUAGE[lang],
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
  // Kişi ve kurum tanımı ana sayfada; burada yalnızca @id ile bağlanır. Hakkımda sayfası (her dil sürümü) kişiyi tekrar tanımlar.
  if (page.type === 'ProfilePage') graph.push({
    '@type': 'Person', '@id': `${SITE}/#person`, name: 'Ömer Faruk Bozkurt', jobTitle: JOB_TITLE[lang],
    url, image: `${SITE}/images/omer-faruk-768.jpg`, worksFor: { '@id': `${SITE}/#organization` },
    homeLocation: { '@type': 'Country', name: { tr: 'Almanya', de: 'Deutschland', en: 'Germany' }[lang] }, knowsLanguage: ['tr', 'de', 'en']
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
  <link rel="canonical" href="${url}" />${hreflang(page)}${page.kind?.startsWith('blog') ? `
  <link rel="alternate" type="application/atom+xml" title="Bozkurt Academy Blog" href="${SITE}/blog/feed.xml" />` : ''}
  <link rel="icon" type="image/x-icon" href="/favicon.ico?v=3">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=3">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=3">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3">
  <!-- Manifest bilerek yok (PWA kurulumu kapalı). Play Store uygulaması çıkınca geri eklenecek: README.md › "PWA / uygulama kurulumu". -->
  <meta property="og:type" content="${page.ogType || 'website'}" />
  <meta property="og:site_name" content="Bozkurt Academy" />
  <meta property="og:locale" content="${OG_LOCALE[lang]}" />${group ? Object.keys(LANG_NAMES).filter(l => l !== lang && group[l]).map(l => `
  <meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`).join('') : ''}
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(page.title)}" />
  <meta property="og:description" content="${esc(page.description)}" />
  <meta property="og:image" content="${page.ogImage ? SITE + page.ogImage : OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${page.ogImageAlt ? esc(page.ogImageAlt) : OG_ALT[lang]}" />
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
const langErrors = [];
// Dil sürümleri: her grup tr, de ve en'i içermeli (dil düğmesi ve hreflang karşılıklı olsun).
for (const [name, group] of Object.entries(ALT_GROUPS)) {
  const missing = Object.keys(LANG_NAMES).filter(l => !group[l]);
  if (missing.length) langErrors.push(`site-pages.mjs: "${name}" grubunda eksik dil: ${missing.join(', ')}`);
}
const placeholderErrors = [];
for (const page of PAGES) {
  const file = path.join(root, page.path, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const lang = page.lang || 'tr';
  // <html lang> sayfanın diliyle aynı olmalı; Almanca/İngilizce sayfa data-ba-fixed-lang ile işaretlenir.
  const htmlTag = /<html[^>]*>/.exec(html)?.[0] || '';
  if (!page.mixedLang && (!htmlTag.includes(`lang="${lang}"`) || !htmlTag.includes(`data-ba-fixed-lang="${lang}"`))) langErrors.push(`${page.path}: <html lang="${lang}" data-ba-fixed-lang="${lang}"> olmalı (şu an: ${htmlTag})`);
  // Almanca/İngilizce içerikte, o dilde sürümü olan sayfaya Türkçe adresle bağlantı verilmesin.
  if (lang !== 'tr') {
    // Yalnızca elle yazılan içerik (alt bilgi ve menü bu betikle zaten doğru dilde üretilir).
    const body = (html.split('İÇERİK BAŞLANGICI')[1] || '').split('<!-- İÇERİK SONU -->')[0];
    for (const [, href] of body.matchAll(/href="(\/[^"?#]*)/g)) {
      const better = ALT_BY_PATH[href]?.[lang];
      if (better && better !== href) langErrors.push(`${page.path}: ${href} yerine ${better} bağlantısını kullan`);
    }
  }
  // Blogdan geri dönüş cümleleri (_blog/posts.json "backlinks"): yalnızca yazı yayınlanınca görünür.
  for (const post of BLOG.posts) {
    const sentence = post.backlinks?.[page.path];
    if (sentence) html = fill(html, `blog:${post.slug}`, post.draft ? '' : ' ' + sentence.replace('{link}', `<a href="${post.path}">${esc(post.h1)}</a>`), file);
  }
  html = fill(html, 'head', head(page, html), file);
  html = fill(html, 'header', header({ current: page.nav, lang }), file);
  html = fill(html, 'breadcrumb', breadcrumb(page), file);
  html = fill(html, 'footer', footer({ current: page.path, sticky: !page.noStickyCta, lang }), file);
  html = fill(html, 'scripts', scripts(page), file);
  if (page.noPlaceholders) {
    // İçerik: talimat yorumunun bittiği yerden "İÇERİK SONU"na kadar (yorumun içindeki örnek parantezler sayılmaz).
    const start = html.indexOf('-->', html.indexOf('İÇERİK BAŞLANGICI'));
    const end = html.indexOf('<!-- İÇERİK SONU -->');
    const body = start >= 0 && end > start ? html.slice(start + 3, end) : '';
    const left = [...new Set(body.match(/\[[^\]<>]+\]/g) || [])];
    if (left.length) placeholderErrors.push(`${page.path}: doldurulmamış yer tutucu: ${left.join(', ')}`);
  }
  outputs.push([file, html]);
}
// Menü ve footer'ı paylaşan diğer sayfalar (sitemap'e girmez). Yönetim sayfası: sabit iletişim düğmesi yok.
// Ortak <head> kullanmayan, elle yazılmış sayfalar: yalnızca güvenlik bölümü (CSP, referrer, tema başlatıcı).
for (const name of ['giris.html', 'kayit.html', 'panel.html', 'privacy.html', 'ogretmen.html', 'ogretmen-odev.html', 'ogretmen-ogrenci.html', 'ogretmen-takvim.html', 'tools/audio-check.html']) {
  const file = path.join(root, name);
  outputs.push([file, fill(fs.readFileSync(file, 'utf8'), 'security', SECURITY, file)]);
}
for (const [name, opts, footerOpts] of [['index.html', { spa: true }, {}], ['404.html', {}, {}], ['yonetim/yorumlar/index.html', { langSwitch: false }, { sticky: false }]]) {
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

const urls = [{ path: '/', updated: '2026-11-10' }, ...PAGES.filter(p => !p.noindex), ...GRAMMAR.pages.map(p => ({ path: p.path, updated: GRAMMAR_DATE })), ...blogUrls].map(p => `  <url>\n    <loc>${SITE}${p.path}</loc>\n    <lastmod>${p.updated || SITEMAP_DATE}</lastmod>\n  </url>`).join('\n');
outputs.push([path.join(root, 'blog/feed.xml'), blogFeed(BLOG.published, BLOG.index, SITE)]);
outputs.push([path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`]);

// Dil sürümleri listesi tarayıcıya da gider (js/app.js → BA_ALTS: dil düğmesi, not ve site içi bağlantılar).
// Liste değişince app.js'in ?v= sürümünü bütün sayfalarda artır.
{
  const file = path.join(root, 'js/app.js');
  const src = fs.readFileSync(file, 'utf8');
  const re = /(\/\* ba:alts \*\/\[)[\s\S]*?(\]\/\* \/ba:alts \*\/)/;
  if (!re.test(src)) throw new Error('js/app.js: /* ba:alts */ işareti yok');
  const list = Object.values(ALT_GROUPS).map(g => '  ' + JSON.stringify(Object.fromEntries(Object.keys(LANG_NAMES).map(l => [l, g[l]])))).join(',\n');
  outputs.push([file, src.replace(re, (_, a, b) => `${a}\n${list}\n${b}`)]);
}

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
if (langErrors.length) { console.error('Dil sürümleri:\n  ' + langErrors.join('\n  ')); process.exit(1); }
// Impressum gibi yasal sayfalar yer tutucuyla yayına çıkmasın: yazarken uyar, --check'te (CI) hata ver.
if (placeholderErrors.length) {
  console.error(placeholderErrors.join('\n'));
  if (check) process.exit(1);
}
console.log(`PASS: ${PAGES.length} statik sayfa, ${GRAMMAR.pages.length} gramer sayfası ve ${BLOG.posts.length + 1} blog sayfası${check ? ' güncel' : ''}.`);
