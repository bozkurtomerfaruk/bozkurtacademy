// Seviye sonu sınavı (#seviye-sonu/A1): kart, rastgele 30 soru ve dağılım, kaldığı yerden devam, puan, geçme sınırı,
// sonuç ekranı (konu tablosu, telefonda da bağlantılar, yanlışlar ve açıklamaları), kayıt olayı, diller, eski bağlantı,
// 390/1440 px açık/koyu. Hesap ve kayıt tarafı: tests/level-exam-account.mjs (emülatör).
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/level-exam.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'level-exam-shots-'));
const exam = JSON.parse(fs.readFileSync('data/seviye-sonu/a1.json', 'utf8'));
const byId = Object.fromEntries(exam.questions.map((q) => [q.id, q]));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const css = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

async function newPage(width = 1280, theme = 'light') {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript((t) => { try { if (!sessionStorage.getItem('i')) { sessionStorage.setItem('i', '1'); localStorage.setItem('ba-theme', t); } } catch (_) {} }, theme);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page };
}
const shownIds = (p) => p.locator('.le-q').evaluateAll((els) => els.map((e) => e.dataset.q));
async function answer(p, ids, correct) {
  for (const [i, id] of ids.entries()) {
    const q = byId[id];
    const value = i < correct ? q.answer : q.options.find((o) => o !== q.answer);
    await p.locator(`.le-q[data-q="${id}"] input[value="${css(value)}"]`).check();
  }
}

const { ctx, page } = await newPage();
let finished = [];
await page.exposeFunction('__finished', (d) => finished.push(d));
await page.addInitScript(() => addEventListener('ba:exercise-finished', (e) => window.__finished(e.detail)));

// Kart alıştırmalar sayfasında, A1 konularının sonunda.
await page.goto(B + '#exercises/A1'); await page.waitForTimeout(1500);
ok(await page.locator('.le-card [data-level-exam][href="#seviye-sonu/A1"]').count() === 1, 'A1 konu listesinin sonunda sınav kartı var');
await page.click('[data-level-exam]'); await page.waitForTimeout(1200);
ok(page.url().endsWith('#seviye-sonu/A1') && (await page.textContent('#levelExamApp h1')).includes('A1 seviye sonu sınavı'), 'kart sınavı açıyor');
ok(await page.locator('.le-info li').count() === 4, 'giriş ekranında bilgiler');

// Rastgele 30 soru, dağılım her denemede aynı.
await page.click('[data-le-start]'); await page.waitForTimeout(400);
const ids1 = await shownIds(page);
const count = (ids) => ids.reduce((m, id) => (m[byId[id].topic] = (m[byId[id].topic] || 0) + 1, m), {});
const expected = Object.fromEntries(exam.distribution.map((d) => [d.topic, d.count]));
ok(ids1.length === 30 && new Set(ids1).size === 30, '30 farklı soru');
ok(JSON.stringify(count(ids1)) === JSON.stringify(expected), 'konu dağılımı tablodaki gibi');
ok(await page.locator('.le-option').count() === 120 && await page.locator('text=Bilmiyorum').count() === 0, 'her soruda 4 seçenek, "Bilmiyorum" yok');

// Kaldığı yerden devam: cevaplar ve sorular yenilemeden sonra aynı.
await answer(page, ids1.slice(0, 5), 5);
await page.reload(); await page.waitForTimeout(1200);
ok((await page.textContent('[data-le-start]')).includes('Kaldığın yerden'), 'yarım kalan sınav için "Kaldığın yerden devam et"');
await page.click('[data-le-start]'); await page.waitForTimeout(400);
ok(JSON.stringify(await shownIds(page)) === JSON.stringify(ids1) && await page.locator('.le-q input:checked').count() === 5, 'yenilemeden sonra aynı sorular ve cevaplar');

// Cevapsız soru varken bitirilemez.
await page.click('[data-le-finish]'); await page.waitForTimeout(200);
ok((await page.textContent('.le-status')).includes('25 soru cevapsız') && await page.locator('.le-q.is-missing').count() === 25, 'cevapsız sorular işaretleniyor');
ok(finished.length === 0, 'eksikken sonuç gönderilmiyor');

// 17 doğru: geçemedi (sınır 18).
await answer(page, ids1, 17);
await page.click('[data-le-finish]'); await page.waitForTimeout(500);
ok((await page.textContent('[data-le-score]')) === '17 / 30' && await page.getAttribute('[data-le-passed]', 'data-le-passed') === 'false', '17/30: geçemedi');
ok(finished.length === 1 && finished[0].topic === 'seviye-sonu' && finished[0].exercise === 'a1' && finished[0].score === 17 && finished[0].total === 30, 'sonuç olayı bir kez, doğru alanlarla');
const errs = Object.fromEntries(finished[0].topicErrors.split(',').map((x) => x.split(':')).map(([k, v]) => [k, +v]));
const wrongTopics = ids1.slice(17).reduce((m, id) => (m[byId[id].topic] = (m[byId[id].topic] || 0) + 1, m), {});
ok(JSON.stringify(errs) === JSON.stringify(wrongTopics), `konu bazında hatalar doğru (${finished[0].topicErrors})`);
ok(!('questions' in finished[0]) && !JSON.stringify(finished[0]).includes(ids1[0]), 'çıkan sorular kayda gönderilmiyor');
ok(await page.locator('.le-wrong-item').count() === 13 && await page.locator('.le-wrong-item .le-expl').count() === 13, '13 yanlış, her birinde açıklama');
ok(await page.locator('[data-le-visitor]').count() === 1, 'ziyaretçiye "kaydedilmedi" notu');
const weakRows = page.locator('.le-topics li.is-weak');
ok(await weakRows.count() === Object.keys(wrongTopics).length && await page.locator('.le-topics li').count() === 17, 'konu tablosu: 17 konu, hatalı olanlar işaretli');
ok(await weakRows.first().locator('a').count() === 2, 'hatalı konuda anlatım ve alıştırma bağlantısı');
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(500);
ok((await page.textContent('#levelExamApp h1')).includes('Abschlusstest A1') && (await page.textContent('.le-badge')).includes('Noch nicht bestanden'), 'Almanca');
await page.click('.lang button[data-lang="en"]'); await page.waitForTimeout(500);
ok((await page.textContent('.le-badge')).includes('Not passed yet') && finished.length === 1, 'İngilizce; dil değişince ikinci kez gönderilmiyor');
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(500);

// Tekrar: yeni sorular, aynı dağılım; 18 doğru geçiyor.
await page.click('[data-le-retry]'); await page.waitForTimeout(400);
const ids2 = await shownIds(page);
ok(JSON.stringify(count(ids2)) === JSON.stringify(expected), 'yeni denemede dağılım aynı');
// With 2 questions per slot, all 30 being the same again has a probability of about 1 in 10^9.
ok(JSON.stringify(ids2) !== JSON.stringify(ids1), 'yeni denemede sorular değişiyor');
await answer(page, ids2, 18);
await page.click('[data-le-finish]'); await page.waitForTimeout(500);
ok((await page.textContent('[data-le-score]')) === '18 / 30' && await page.getAttribute('[data-le-passed]', 'data-le-passed') === 'true', '18/30: geçti (%60)');
ok(finished.length === 2, 'ikinci deneme de gönderildi');

// Sonuç, yenilemeden sonra da duruyor.
await page.reload(); await page.waitForTimeout(1200);
ok((await page.textContent('[data-le-score]')) === '18 / 30', 'sonuç yenilemeden sonra görünüyor');
await page.click('.le-topics li.is-weak a >> nth=1'); await page.waitForTimeout(1500);
ok(page.url().includes('#exercises/A1/'), 'zayıf konu bağlantısı alıştırmayı açıyor');

// Eski biçim bağlantı (ör. ödevden): #exercises/A1/seviye-sonu/a1 → #seviye-sonu/A1.
await page.goto('about:blank'); await page.goto(B + '#exercises/A1/seviye-sonu/a1'); await page.waitForTimeout(1500);
ok(page.url().endsWith('#seviye-sonu/A1') && await page.locator('#page-seviye-sonu.active').count() === 1, 'ödev bağlantısı sınavı açıyor');
// Sınavı olmayan seviye.
await page.goto('about:blank'); await page.goto(B + '#seviye-sonu/B2'); await page.waitForTimeout(1200);
ok((await page.textContent('#levelExamApp')).includes('henüz bir seviye sonu sınavı yok'), 'sınavı olmayan seviyede not');
await ctx.close();

// Diğer seviyeler (data/catalog.json → levelExam): kart, 30 soru, dağılım, puan.
for (const level of JSON.parse(fs.readFileSync('data/catalog.json', 'utf8')).levels.filter((l) => l.levelExam && l.id !== 'A1')) {
  const data = JSON.parse(fs.readFileSync(level.levelExam, 'utf8'));
  const ids_ = Object.fromEntries(data.questions.map((q) => [q.id, q]));
  const { ctx: c, page: p } = await newPage();
  await p.goto(B + '#exercises/' + level.id); await p.waitForTimeout(1500);
  ok(await p.locator(`.le-card [data-level-exam][href="#seviye-sonu/${level.id}"]`).count() === 1, `${level.id}: konu listesinin sonunda sınav kartı`);
  await p.click('[data-level-exam]'); await p.waitForTimeout(1200);
  await p.click('[data-le-start]'); await p.waitForTimeout(400);
  const ids = await shownIds(p);
  const got = ids.reduce((m, id) => (m[ids_[id].topic] = (m[ids_[id].topic] || 0) + 1, m), {});
  ok(ids.length === 30 && JSON.stringify(got) === JSON.stringify(Object.fromEntries(data.distribution.map((d) => [d.topic, d.count]))), `${level.id}: 30 soru, dağılım tablodaki gibi`);
  for (const [i, id] of ids.entries()) {
    const q = ids_[id];
    await p.locator(`.le-q[data-q="${id}"] input[value="${css(i < 18 ? q.answer : q.options.find((o) => o !== q.answer))}"]`).check();
  }
  await p.click('[data-le-finish]'); await p.waitForTimeout(500);
  ok((await p.textContent('[data-le-score]')) === '18 / 30' && await p.getAttribute('[data-le-passed]', 'data-le-passed') === 'true'
    && (await p.textContent('#levelExamApp h1')).includes(level.id) && await p.locator('.le-topics li').count() === data.distribution.length, `${level.id}: 18/30 geçti, ${data.distribution.length} konu tablosu`);
  await p.screenshot({ path: path.join(shotDir, `sinav-sonuc-${level.id}-1280.png`), fullPage: true });
  await c.close();
}

// 390 ve 1440 px, açık ve koyu: sorular ve sonuç; telefonda da bağlantılar görünüyor.
for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const { ctx: c, page: p } = await newPage(w, th);
  await p.goto(B + '#seviye-sonu/A1'); await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(shotDir, `sinav-giris-${w}-${th}.png`) });
  await p.click('[data-le-start]'); await p.waitForTimeout(400);
  const ids = await shownIds(p);
  await answer(p, ids.slice(0, 3), 2);
  ok(await overflow(p) <= 0, `${w} ${th}: sorularda yatay taşma yok`);
  await p.screenshot({ path: path.join(shotDir, `sinav-sorular-${w}-${th}.png`) });
  await answer(p, ids, 22);
  await p.click('[data-le-finish]'); await p.waitForTimeout(500);
  ok(await overflow(p) <= 0, `${w} ${th}: sonuçta yatay taşma yok`);
  ok(await p.locator('.le-topics li.is-weak a').first().isVisible(), `${w} ${th}: konu bağlantıları görünüyor`);
  await p.screenshot({ path: path.join(shotDir, `sinav-sonuc-${w}-${th}.png`), fullPage: true });
  await c.close();
}

console.log('screenshots in', shotDir);
await browser.close();
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
