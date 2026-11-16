// B2 gramer dersleri: statik sayfa, eski #grammar bağlantıları, alıştırmaya geçiş, "Konuyu çalış", seviyeler arası
// benzer konular, hatırlatma kutusu, 390/1440 px açık/koyu (taşma + ekran görüntüsü). Bütün B2 dersleri denenir.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/gramer-b2.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const ORIGIN = process.env.ORIGIN || 'http://localhost:8765';
const B = ORIGIN + '/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'gramer-b2-'));
const lessons = JSON.parse(fs.readFileSync('data/b2-grammar.json', 'utf8')).lessons;
const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
const b2 = catalog.levels.find(l => l.id === 'B2');

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const watch = p => { p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/.test(m.text())) errors.push(m.text()); }); };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
watch(page);
const overflow = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const lesson of lessons) {
  const url = `/almanca-gramer/b2/${lesson.id}/`;
  const topic = b2.topics.find(t => t.id === lesson.id);
  await page.goto(ORIGIN + url); await page.waitForTimeout(800);
  ok(await page.textContent('h1') === lesson.title, `${lesson.id}: statik sayfa başlığı`);
  ok(await page.locator('[id^="a1-step-"] h2').count() === lesson.sections.length && await page.locator('.a1-summary .a1-check').count() === 1, `${lesson.id}: ${lesson.sections.length} bölüm, kısa tekrar ve kendini kontrol`);
  ok(await page.locator('.a1-faq').count() === lesson.faq.length, `${lesson.id}: SSS`);
  ok(await page.locator('.a1-comment-form').count() === 1 && await page.locator('.a1-author').count() === 1, `${lesson.id}: yazar kutusu ve yorum formu`);
  const boxes = lesson.sections.filter(s => s.box).length;
  ok(await page.locator('.a1-box').count() === boxes, `${lesson.id}: ${boxes} hatırlatma kutusu`);
  // Benzer konular: başka seviyedeki dersler gerçek sayfalara gider ve seviye etiketi taşır.
  const hrefs = await page.$$eval('.a1-related a', as => as.map(a => a.getAttribute('href')));
  const expected = lesson.related.map(r => r.includes('/') ? `/almanca-gramer/${r.split('/')[0].toLowerCase()}/${r.split('/')[1]}/` : `/almanca-gramer/b2/${r}/`);
  ok(JSON.stringify(hrefs) === JSON.stringify(expected), `${lesson.id}: benzer konu bağlantıları ${hrefs.join(', ')}`);
  for (const h of hrefs) { const r = await page.request.get(ORIGIN + h); ok(r.ok(), `${lesson.id}: ${h} açılıyor`); }
  ok(await page.locator('.a1-related-level').count() === lesson.related.filter(r => r.includes('/')).length, `${lesson.id}: seviye etiketi`);
  // Alıştırmaya geçiş.
  const practice = await page.getAttribute('[data-a1-practice]', 'href');
  ok(practice === `/#exercises/B2/${lesson.id}`, `${lesson.id}: alıştırma bağlantısı ${practice}`);
  if (topic?.status === 'ready') {
    await page.click('[data-a1-practice]'); await page.waitForTimeout(1800);
    ok(page.url().endsWith(`#exercises/B2/${lesson.id}`) && (await page.textContent('[data-crumb="sets"]').catch(() => '')).trim() === topic.title.tr, `${lesson.id}: alıştırma paketleri açıldı`);
  }
  // Eski SPA bağlantıları statik sayfaya yönlenir; bölüm numarası korunur.
  const fresh = await browser.newPage(); watch(fresh);
  await fresh.goto(B + `#grammar/B2/${lesson.id}/3`); await fresh.waitForURL(`**${url}**`);
  const focused = await fresh.waitForFunction(() => document.activeElement?.closest('#a1-step-2') !== null, null, { timeout: 5000 }).then(() => true, () => false);
  ok(new URL(fresh.url()).pathname === url && focused, `${lesson.id}: #grammar/B2/${lesson.id}/3 üçüncü bölümü açıyor (${fresh.url()})`);
  await fresh.close();
}

// Gramer sayfası: B2 sekmesi yazılmış dersleri açıyor, diğerleri "hazırlanıyor".
await page.goto(B + '#grammar'); await page.waitForTimeout(1500);
await page.click('[data-grammar-level="B2"]'); await page.waitForTimeout(300);
ok(await page.locator('.grammar-topic-card[data-topic-level="B2"]').count() === b2.topics.length, 'B2 sekmesinde bütün konular');
await page.click(`.grammar-topic-card[data-topic-id="${lessons[0].id}"]`); await page.waitForTimeout(1500);
ok(new URL(page.url()).pathname === `/almanca-gramer/b2/${lessons[0].id}/`, 'B2 kartı statik derse gidiyor');
// Seviye sayfası ve gramer ana sayfası.
await page.goto(ORIGIN + '/almanca-gramer/b2/'); await page.waitForTimeout(500);
ok(await page.locator('.gr-list li').count() === lessons.length, 'B2 seviye sayfasında bütün dersler');
await page.goto(ORIGIN + '/almanca-gramer/'); await page.waitForTimeout(500);
ok(await page.locator('#gr-B2').count() === 1, 'gramer ana sayfasında B2 bölümü');
const sitemap = fs.readFileSync('sitemap.xml', 'utf8');
ok(lessons.every(l => sitemap.includes(`/almanca-gramer/b2/${l.id}/`)) && sitemap.includes('/almanca-gramer/b2/<'), 'sitemap B2 sayfalarını içeriyor');

// Alıştırmadaki "Konuyu çalış" düğmesi derse götürüyor.
const readyLesson = lessons.find(l => b2.topics.find(t => t.id === l.id)?.status === 'ready');
if (readyLesson) {
  const data = JSON.parse(fs.readFileSync(b2.topics.find(t => t.id === readyLesson.id).path, 'utf8'));
  await page.goto('about:blank'); await page.goto(B + `#exercises/B2/${readyLesson.id}/${data.exercises[0].id}/q1`); await page.waitForTimeout(2500);
  const study = page.locator('#studyTopicBtn');
  ok(await study.count() === 1, '"Konuyu çalış" düğmesi var');
  if (await study.count()) { await study.click(); await page.waitForTimeout(2000); ok(new URL(page.url()).pathname === `/almanca-gramer/b2/${readyLesson.id}/` || page.url().includes(`#grammar/B2/${readyLesson.id}`), `"Konuyu çalış" derse götürüyor (${page.url()})`); }
}
await page.close();

// 390 ve 1440 px, açık ve koyu.
for (const lesson of lessons) for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t); } catch (_) {} }, th);
  const p = await ctx.newPage(); watch(p);
  await p.goto(ORIGIN + `/almanca-gramer/b2/${lesson.id}/`); await p.waitForTimeout(700);
  ok(await overflow(p) <= 0, `${lesson.id} ${w} ${th}: yatay taşma yok`);
  ok(await p.evaluate(() => document.documentElement.dataset.theme || '') === th || th === 'light', `${lesson.id} ${w} ${th}: tema`);
  await p.screenshot({ path: path.join(shotDir, `${lesson.id}-${w}-${th}.png`) });
  const box = p.locator('.a1-box').first();
  if (await box.count()) { await box.scrollIntoViewIfNeeded(); await p.waitForTimeout(1200); await p.screenshot({ path: path.join(shotDir, `${lesson.id}-${w}-${th}-kutu.png`) }); }
  await ctx.close();
}

console.log('screenshots in', shotDir);
await browser.close();
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
