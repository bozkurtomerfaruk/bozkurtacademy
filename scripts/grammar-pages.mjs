// Statik gramer sayfaları: /almanca-gramer/, /almanca-gramer/<seviye>/ ve /almanca-gramer/<seviye>/<ders>/.
// İçerik data/<seviye>-grammar.json'dan birebir gelir; ders HTML'i SPA ile aynı şablondan (js/a1-lessons.js →
// articleHtml) üretilir. Sıra data/catalog.json'daki konu sırasıdır. scripts/build-pages.mjs bu modülü kullanır.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export const GRAMMAR_DATE = '2026-11-10'; // sitemap lastmod; gramer içeriği değişince güncelle
const COURSE = { A1: '/a1-almanca-kursu/', A2: '/a2-almanca-kursu/', B1: '/b1-almanca-kursu/' };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ~155 karakter: önce cümle sonunda, olmazsa kelime sınırında keser.
function clip(text, max = 155) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,:;–-]+$/, '') + '…';
}

// Kısa açıklama noktalama işaretiyle bitmiyorsa, giriş cümlesine yapışmasın diye nokta eklenir.
const sentence = text => { const t = String(text).trim(); return t && !/[.!?…]$/.test(t) ? t + '.' : t; };

export function loadGrammar(root) {
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'js/html.js'), 'utf8'), ctx); // escapeHtml/safeUrl (window.baHtml)
  vm.runInContext(fs.readFileSync(path.join(root, 'js/a1-lessons.js'), 'utf8'), ctx);
  const { articleHtml, lessonPath } = ctx.window.BAA1Lessons;
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/catalog.json'), 'utf8'));
  const index = JSON.parse(fs.readFileSync(path.join(root, 'data/grammar-index.json'), 'utf8'));
  const levels = [];
  for (const [level, file] of Object.entries(index.levels)) {
    const data = JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
    const cat = catalog.levels.find(l => l.id === level);
    const order = (cat?.topics || []).map(t => t.id);
    const lessons = [...data.lessons].sort((a, b) => {
      const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
      return (ia < 0 ? 1e3 : ia) - (ib < 0 ? 1e3 : ib);
    });
    levels.push({ level, name: cat?.title?.tr || level, about: cat?.description?.tr || '', data, lessons });
  }
  return { levels, articleHtml, lessonPath };
}

function lessonTitle(level, lesson, used) {
  const short = lesson.title.split(' – ')[0];
  for (const t of [`${lesson.title} | ${level} Almanca Gramer`, `${short} | ${level} Almanca Gramer`, `${short} (${level} Almanca)`, short]) {
    if (t.length <= 62 && !used.has(t)) { used.add(t); return t; }
  }
  throw new Error(`${level}/${lesson.id}: benzersiz başlık bulunamadı`);
}

// Arama sonuçları için başlık/açıklama (data/grammar-seo.json; ders içeriğinden ayrı). Yoksa üretilir.
function loadSeo(root) {
  const file = path.join(root, 'data/grammar-seo.json');
  const seo = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  for (const [k, v] of Object.entries(seo)) {
    if (k.startsWith('_')) continue;
    if (v.title && v.title.length > 60) throw new Error(`grammar-seo.json ${k}: başlık 60 karakterden uzun (${v.title.length})`);
    if (v.description && v.description.length > 160) throw new Error(`grammar-seo.json ${k}: açıklama 160 karakterden uzun (${v.description.length})`);
  }
  return seo;
}

// Sayfa tanımları: { path, title, description, crumb, parent, kind, ... }
export function grammarPages(root) {
  const { levels, articleHtml, lessonPath } = loadGrammar(root);
  const seo = loadSeo(root);
  const pages = [];
  const used = new Set();
  const hub = {
    path: '/almanca-gramer/', crumb: 'Almanca Gramer', kind: 'hub',
    title: 'Almanca Gramer Konuları A1–B1: Konu Anlatımı ve Alıştırma',
    description: `Almanca gramer konuları: A1, A2 ve B1 seviyelerinde ${levels.reduce((n, lv) => n + lv.lessons.length, 0)} konu anlatımı, örnek cümleler, kısa tekrar, sık sorulan sorular ve her konu için ücretsiz alıştırmalar.`,
    levels
  };
  pages.push(hub);
  for (const lv of levels) {
    const levelPage = {
      path: lessonPath(lv.level), parent: hub.path, crumb: lv.level, kind: 'level', lv,
      title: `${lv.level} Almanca Gramer Konuları: ${lv.lessons.length} Konu Anlatımı ve Alıştırma`,
      description: clip(`${lv.level} Almanca gramer konuları, örnekler ve alıştırmalarla: ${lv.lessons.map(l => l.title.split(' – ')[0]).join(', ')}.`)
    };
    pages.push(levelPage);
    lv.lessons.forEach((lesson, i) => {
      pages.push({
        path: lessonPath(lv.level, lesson.id), parent: levelPage.path, crumb: lesson.title.split(' – ')[0], kind: 'lesson',
        lv, lesson, prev: lv.lessons[i - 1] || null, next: lv.lessons[i + 1] || null,
        title: seo[`${lv.level}/${lesson.id}`]?.title || lessonTitle(lv.level, lesson, used),
        description: seo[`${lv.level}/${lesson.id}`]?.description || clip(`${sentence(lesson.description?.tr || '')} ${lesson.lead}`),
        article: articleHtml(lesson, lv.data, lv.level, { static: true })
      });
    });
  }
  // Benzersizlik: iki sayfa aynı başlığı veya açıklamayı kullanamaz.
  for (const key of ['title', 'description']) {
    const seen = new Map();
    for (const p of pages) {
      if (seen.has(p[key])) throw new Error(`Aynı ${key}: ${seen.get(p[key])} ve ${p.path}`);
      seen.set(p[key], p.path);
    }
  }
  return { pages, lessonPath };
}

// ---------- Sayfa gövdeleri ----------
const leadSentence = text => {
  const m = String(text).match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
};

function lessonList(lv, lessonPath, { full = false } = {}) {
  return `<ol class="gr-list">${lv.lessons.map((l, i) => `<li><a href="${lessonPath(lv.level, l.id)}"><span class="gr-num">${i + 1}</span><span class="gr-text"><strong>${esc(l.title)}</strong>${full ? `<span>${esc(leadSentence(l.lead))}</span>` : ''}</span></a></li>`).join('')}</ol>`;
}

export function grammarBody(page, lessonPath) {
  if (page.kind === 'hub') {
    return `
      <section class="lp-prose" aria-labelledby="gr-title">
        <h1 id="gr-title">Almanca Gramer Konuları</h1>
        <p class="lp-lead">A1, A2 ve B1 seviyelerinde Türkçe Almanca gramer anlatımları. Her derste örnek cümleler, kısa tekrar, kendini kontrol sorusu, sık sorulan sorular ve konuya ait alıştırmalar var.</p>
        <p><a href="/#grammar">Konu veya ders bölümü ara →</a></p>
      </section>
${page.levels.map(lv => `
      <section class="lp-section" aria-labelledby="gr-${lv.level}">
        <div class="gr-level-head">
          <h2 id="gr-${lv.level}"><a href="${lessonPath(lv.level)}">${lv.level} · ${esc(lv.name)}</a></h2>
          <p>${esc(lv.about)}</p>
          <p class="gr-level-links"><a href="${lessonPath(lv.level)}">${lv.level} konularının hepsi (${lv.lessons.length}) →</a> <a href="${COURSE[lv.level]}">${lv.level} Almanca kursu →</a></p>
        </div>
        ${lessonList(lv, lessonPath)}
      </section>`).join('')}

      <section class="lp-cta" aria-labelledby="gr-cta">
        <div>
          <h2 id="gr-cta">Gramer konularını birlikte çalışalım</h2>
          <p>Takıldığın konuları birebir veya grup dersinde örneklerle çalışabiliriz. İlk ders ücretsiz.</p>
        </div>
        <a class="btn" href="/iletisim/">Ücretsiz bilgi al</a>
      </section>
`;
  }
  if (page.kind === 'level') {
    const lv = page.lv;
    return `
      <section class="lp-prose" aria-labelledby="gr-title">
        <h1 id="gr-title">${lv.level} Almanca Gramer Konuları</h1>
        <p class="lp-lead">${esc(lv.about)} Bu sayfada ${lv.level} seviyesindeki ${lv.lessons.length} gramer konusu yer alıyor.</p>
        <p><a href="${COURSE[lv.level]}">${lv.level} Almanca kursu</a> · <a href="/#exercises/${lv.level}">${lv.level} alıştırmaları</a> · <a href="/almanca-gramer/">Bütün seviyeler</a></p>
      </section>
      <section class="lp-section" aria-label="${lv.level} konuları">
        ${lessonList(lv, lessonPath, { full: true })}
      </section>${page.blogNote || ''}
      <section class="lp-cta" aria-labelledby="gr-cta">
        <div>
          <h2 id="gr-cta">${lv.level} konularını birlikte çalışalım</h2>
          <p>Bu konuları birebir veya grup dersinde örneklerle ve konuşma pratiğiyle çalışabiliriz. İlk ders ücretsiz.</p>
        </div>
        <a class="btn" href="/iletisim/">Ücretsiz bilgi al</a>
      </section>
`;
  }
  const { lv, lesson, prev, next } = page;
  const pager = `
        <nav class="gr-pager" aria-label="Önceki ve sonraki ders">
          ${prev ? `<a class="gr-prev" href="${lessonPath(lv.level, prev.id)}"><span>← Önceki ders</span><strong>${esc(prev.title)}</strong></a>` : '<span></span>'}
          ${next ? `<a class="gr-next" href="${lessonPath(lv.level, next.id)}"><span>Sonraki ders →</span><strong>${esc(next.title)}</strong></a>` : '<span></span>'}
        </nav>`;
  return `
      <section class="page active" id="page-grammar">
        ${page.article}${page.blogNote || ''}
${pager}
        <section class="lp-cta gr-cta" aria-labelledby="gr-cta">
          <div>
            <h2 id="gr-cta">Bu konuyu birebir veya grup dersinde çalışmak ister misin?</h2>
            <p>${esc(lesson.title.split(' – ')[0])} konusunu <a href="/almanca-ozel-ders/">birebir</a> veya <a href="/almanca-grup-dersi/">grup dersinde</a> örneklerle çalışabiliriz. ${lv.level} seviyesinin bütün konuları için <a href="${COURSE[lv.level]}">${lv.level} Almanca kursu</a> sayfasına bak. İlk ders ücretsiz.</p>
          </div>
          <a class="btn" href="/iletisim/">İletişime geç</a>
        </section>
      </section>
`;
}

// Ders sayfasının şeması: yalnızca sayfada görünen bilgiler (ad, giriş, seviye, yazar kutusu, SSS).
export function lessonSchema(page, SITE) {
  if (page.kind !== 'lesson') return [];
  const url = SITE + page.path;
  return [{
    '@type': 'LearningResource', '@id': `${url}#lesson`, name: page.lesson.title, description: page.lesson.lead,
    url, inLanguage: 'tr', educationalLevel: page.lv.level, learningResourceType: 'Konu anlatımı',
    about: { '@type': 'Thing', name: 'Almanca dil bilgisi' },
    author: { '@id': `${SITE}/#person` }, isPartOf: { '@id': `${SITE}/#website` }
  }];
}

export const lessonFaq = page => page.kind === 'lesson' ? page.lesson.faq.map(f => ({ q: f.question, a: f.answer })) : [];
