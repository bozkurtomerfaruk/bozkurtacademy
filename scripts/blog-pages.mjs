// Blog: /blog/ ve /blog/<slug>/. Kaynaklar _blog/ klasöründe (GitHub Pages/Jekyll alt çizgili klasörü yayınlamaz):
//   _blog/posts.json   → yazı listesi: slug, title, seoTitle, description, lead, date, status, related
//   _blog/<slug>.html  → yazının gövdesi (HTML; H2'den başlar, H1 şablonda)
// status "draft": sayfa noindex, sitemap'e girmez, üstte "Taslak" notu. "published": index, sitemap, BlogPosting.
// Blog ana sayfası, yayınlanmış yazı olmadıkça noindex kalır ve taslakları listeler. Menüye elle eklenir.
// Görseller images/blog/<slug>/ klasöründe (kaynaklar: images/blog/KAYNAKLAR.md):
//   kapak-{480,800,1200}.{webp,jpg} → kapak (1200×630; OG görseli ve şemadaki image). posts.json: "cover": {"alt": "…"}
//   <ad>.svg → içerik görseli; posts.json: "figures": [{"file", "after": "<h2/h3 başlık metni>", "alt"}]
//   SVG, başlıktan sonraki ilk paragraf/listenin (":" ile biten girişte listenin) arkasına satır içi eklenir (temaya uyar; <style> çıkarılır).
//   Kapak görseli olmayan yazı üretilmez (taslak dahil).
import fs from 'node:fs';
import path from 'node:path';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const trDate = iso => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const AUTHOR = 'Ömer Faruk Bozkurt';
const COVER_W = [480, 800, 1200];
const coverUrl = (slug, w, ext) => `/images/blog/${slug}/kapak-${w}.${ext}`;
const srcset = (slug, ext) => COVER_W.map(w => `${coverUrl(slug, w, ext)} ${w}w`).join(', ');

// Kapak resmi (picture: WebP + JPEG yedeği). thumb: kartlardaki küçük hâli.
export function coverPicture(p, { sizes, thumb = false } = {}) {
  const w = thumb ? 480 : 1200, h = Math.round(w * 630 / 1200);
  const attrs = thumb ? 'loading="lazy" decoding="async" alt=""' : `fetchpriority="high" decoding="async" alt="${esc(p.cover.alt)}"`;
  return `<picture><source type="image/webp" srcset="${srcset(p.slug, 'webp')}" sizes="${sizes}"><img src="${coverUrl(p.slug, thumb ? 480 : 800, 'jpg')}" srcset="${srcset(p.slug, 'jpg')}" sizes="${sizes}" width="${w}" height="${h}" ${attrs}></picture>`;
}

function inlineSvg(root, p, f) {
  const file = path.join(root, 'images/blog', p.slug, f.file);
  if (!fs.existsSync(file)) throw new Error(`${p.slug}: görsel yok: images/blog/${p.slug}/${f.file}`);
  if (!f.alt) throw new Error(`${p.slug}: ${f.file} için alt metin yok`);
  const svg = fs.readFileSync(file, 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\n\s*\n/g, '\n').trim()
    .replace(/^<svg /, `<svg role="img" aria-label="${esc(f.alt)}" focusable="false" `);
  return `\n<figure class="bl-fig">${svg}</figure>\n`;
}

// İçerik görsellerini, "after" başlığından sonraki ilk blok öğenin (p, ul, ol, div, table, aside) arkasına ekler.
function placeFigures(root, p, body) {
  for (const f of p.figures || []) {
    const h = new RegExp(`<h([23])[^>]*>${f.after.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h\\1>`).exec(body);
    if (!h) throw new Error(`${p.slug}: "${f.after}" başlığı bulunamadı (${f.file})`);
    // İlk bloğu atla; blok bir not (aside) ya da ":" ile biten giriş cümlesiyse arkasındaki listeyi/tabloyu da atla.
    let at = h.index + h[0].length;
    for (;;) {
      const rest = body.slice(at);
      const open = /^\s*<(p|ul|ol|div|table|aside)[\s>]/.exec(rest);
      if (!open) break;
      const end = rest.indexOf(`</${open[1]}>`) + open[1].length + 3;
      const block = rest.slice(0, end);
      at += end;
      if (!(open[1] === 'aside' || (open[1] === 'p' && /:\s*(<!--[\s\S]*?-->\s*)?<\/p>$/.test(block.trim())))) break;
    }
    body = body.slice(0, at) + inlineSvg(root, p, f) + body.slice(at);
  }
  return body;
}

export function blogPages(root) {
  const dir = path.join(root, '_blog');
  const reg = JSON.parse(fs.readFileSync(path.join(dir, 'posts.json'), 'utf8'));
  const posts = reg.posts.map(p => {
    if (!/^[a-z0-9-]+$/.test(p.slug)) throw new Error(`_blog/posts.json: geçersiz slug "${p.slug}"`);
    if (!['draft', 'published'].includes(p.status)) throw new Error(`${p.slug}: status "draft" veya "published" olmalı`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw new Error(`${p.slug}: date YYYY-AA-GG olmalı`);
    let body = fs.readFileSync(path.join(dir, `${p.slug}.html`), 'utf8');
    if (/<h1[\s>]/i.test(body)) throw new Error(`${p.slug}.html: gövdede H1 olmamalı (başlık şablondan gelir)`);
    if (!p.cover?.alt) throw new Error(`${p.slug}: kapak görseli ("cover": {"alt": …}) zorunlu`);
    for (const w of COVER_W) for (const ext of ['jpg', 'webp'])
      if (!fs.existsSync(path.join(root, coverUrl(p.slug, w, ext)))) throw new Error(`${p.slug}: kapak dosyası yok: ${coverUrl(p.slug, w, ext)}`);
    body = placeFigures(root, p, body);
    return {
      ...p, body, draft: p.status !== 'published', kind: 'blog-post', path: `/blog/${p.slug}/`, parent: '/blog/',
      crumb: p.crumb || p.title, title: p.seoTitle || `${p.title} | Bozkurt Academy`, h1: p.title,
      noindex: p.status !== 'published', ogType: 'article',
      ogImage: coverUrl(p.slug, 1200, 'jpg'), ogImageAlt: p.cover.alt
    };
  });
  // Yeniden eskiye; aynı tarihli yazılarda posts.json'da sonra eklenen önce gelir.
  const published = posts.map((p, i) => [p, i]).filter(([p]) => !p.draft).sort(([a, i], [b, j]) => b.date.localeCompare(a.date) || j - i).map(([p]) => p);
  const index = {
    path: '/blog/', crumb: 'Blog', kind: 'blog-index',
    title: 'Almanca Öğrenme Blogu | Bozkurt Academy',
    description: 'Almanca öğrenme, A1–B2 sınavlarına hazırlık, günlük kalıplar ve Almanya’da yaşam ve iş için Almanca üzerine Türkçe yazılar.',
    noindex: published.length === 0,
    list: published.length ? published : posts
  };
  // Geri dönüş linkleri: yayınlanmış yazıların gövdesinde ve "related" listesinde link verdiği sayfalar → o yazılar.
  const linkedFrom = {};
  for (const p of published) {
    const targets = new Set([...p.body.matchAll(/href="(\/[^"#?]*)"/g)].map(m => m[1]).concat((p.related || []).map(r => r[0])));
    for (const t of targets) (linkedFrom[t] ||= []).push(p);
  }
  return { index, posts, published, linkedFrom };
}

// Ana sayfadaki "Blogdan son yazılar" bölümü (index.html, <!-- ba:home-blog -->). Yayınlanmış yazı yoksa boş.
export function homeBlog(published) {
  if (!published.length) return '\n        ';
  const items = published.slice(0, 3).map(p => `
              <li><a href="${p.path}"><span class="home-blog-thumb">${coverPicture(p, { sizes: '160px', thumb: true })}</span><span class="home-blog-text"><strong>${esc(p.h1)}</strong><span>${esc(p.teaser || p.lead.split(/(?<=[.?!])\s/)[0])}</span></span></a></li>`).join('');
  return `
        <section class="home-section home-blog" aria-labelledby="home-blog-title">
          <div class="home-section-heading" data-home-reveal>
            <h2 id="home-blog-title" data-i18n="homeBlogTitle">Blogdan son yazılar</h2>
            <p data-i18n="homeBlogIntro">Almanca öğrenmeye ve sınavlara dair Türkçe yazılar.</p>
            <a class="home-text-link" href="/blog/"><span data-i18n="homeBlogLink">Bütün yazılar</span><span aria-hidden="true">→</span></a>
          </div>
          <ul class="home-blog-list" data-home-reveal lang="tr">${items}
          </ul>
        </section>
        `;
}

// Gramer ve kurs sayfalarındaki "Blog'da bu konu" notu.
export function blogBacklinks(posts) {
  if (!posts?.length) return '';
  return `
        <aside class="gr-blog" aria-label="Blog yazıları"><p><strong>Blogda bu konu:</strong> ${posts.map(p => `<a href="${p.path}">${esc(p.h1)}</a>`).join(' · ')}</p></aside>`;
}

export function blogSchema(page, SITE) {
  if (page.kind !== 'blog-post' || page.draft) return [];
  const url = SITE + page.path;
  return [{
    '@type': 'BlogPosting', '@id': `${url}#post`, headline: page.h1, description: page.description, url,
    inLanguage: 'tr-TR', datePublished: page.date, dateModified: page.updated || page.date,
    author: { '@type': 'Person', name: AUTHOR },
    publisher: { '@id': `${SITE}/#organization` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    image: { '@type': 'ImageObject', url: SITE + page.ogImage, width: 1200, height: 630 }
  }];
}

export function blogBody(page, all) {
  if (page.kind === 'blog-index') {
    const items = page.list.map(p => `
          <li><a href="${p.path}"><span class="bl-thumb">${coverPicture(p, { sizes: '(max-width: 640px) calc(100vw - 32px), 240px', thumb: true })}</span><span class="bl-item-meta">${p.draft ? '<span class="bl-badge">Taslak</span> Planlanan: ' : ''}${trDate(p.date)}</span><strong>${esc(p.h1)}</strong><span>${esc(p.description)}</span></a></li>`).join('');
    return `
      <section class="lp-prose" aria-labelledby="bl-title">
        <h1 id="bl-title">Almanca Öğrenme Blogu</h1>
        <p class="lp-lead">Almanca öğrenmeye, sınavlara hazırlanmaya ve Almancayı günlük hayatta kullanmaya dair Türkçe yazılar.</p>
        ${page.noindex ? '<p class="bl-draft" role="note">Bu sayfa henüz yayında değil: listedeki yazılar taslak.</p>' : ''}
      </section>
      <section class="lp-section" aria-label="Yazılar">
        <ul class="bl-list">${items}
        </ul>
      </section>
      <section class="lp-cta" aria-labelledby="bl-cta">
        <div>
          <h2 id="bl-cta">Almancayı birlikte çalışalım</h2>
          <p>Seviyene ve hedefine göre birebir veya grup dersi. İlk ders ücretsiz.</p>
        </div>
        <a class="btn" href="/iletisim/">Ücretsiz bilgi al</a>
      </section>
`;
  }
  const related = (page.related || []).map(([href, label]) => `<li><a href="${href}"><strong>${esc(label)}</strong></a></li>`).join('');
  return `
      <article class="bl-article" aria-labelledby="bl-title">
        ${page.draft ? `<p class="bl-draft" role="note">Taslak: Bu yazı henüz yayınlanmadı (planlanan tarih: ${trDate(page.date)}).</p>` : ''}
        <header class="bl-header">
          <p class="bl-meta">${AUTHOR} · <time datetime="${page.date}">${trDate(page.date)}</time></p>
          <h1 id="bl-title">${esc(page.h1)}</h1>
          <p class="lp-lead">${esc(page.lead)}</p>
        </header>
        <figure class="bl-cover">${coverPicture(page, { sizes: '(max-width: 800px) calc(100vw - 32px), 760px' })}</figure>
        <div class="lp-prose bl-body">
${page.body.trim()}
        </div>
        ${related ? `<section class="lp-section" aria-labelledby="bl-related"><h2 id="bl-related">İlgili sayfalar</h2><ul class="lp-related">${related}</ul></section>` : ''}
      </article>
      <section class="lp-cta" aria-labelledby="bl-cta">
        <div>
          <h2 id="bl-cta">Bu konuyu birlikte çalışmak ister misin?</h2>
          <p>Seviyene ve hedefine göre <a href="/almanca-ozel-ders/">birebir</a> veya <a href="/almanca-grup-dersi/">grup dersi</a>. İlk ders ücretsiz.</p>
        </div>
        <a class="btn" href="/iletisim/">Ücretsiz bilgi al</a>
      </section>
`;
}
