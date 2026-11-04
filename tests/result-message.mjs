// Sonuç ekranındaki övgü metni her konuya uyuyor: konu adı metinde, "Artikel" ve kapalı "soldaki özet" yok.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/result-message.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'result-shots-'));
const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
const topic = JSON.parse(fs.readFileSync('data/b1/relativsaetze.json', 'utf8'));
const ex = topic.exercises.find(e => e.id === 'nominativ-2');

// Answers the exercise with `right` correct answers, the rest wrong; returns the result message.
async function play(p, right) {
  await p.goto('about:blank'); await p.goto(B + '#exercises/B1/relativsaetze/nominativ-2/q1'); await p.waitForTimeout(1500);
  for (const [i, q] of ex.questions.entries()) {
    const good = i < right;
    if (q.type === 'text') { await p.fill('#writtenAnswerInput', good ? q.correct : 'falsch'); await p.press('#writtenAnswerInput', 'Enter'); }
    else {
      const value = good ? q.correct : q.options.find(o => o !== q.correct);
      await p.click(`#quizOptions .quiz-option[data-answer="${value.replace(/"/g, '\\"')}"]`); await p.click('#checkAnswerBtn');
    }
    await p.waitForTimeout(150); await p.click('#nextQuestionBtn'); await p.waitForTimeout(150);
  }
  await p.waitForTimeout(300);
  return (await p.textContent('#quizResult .result-message')).trim();
}

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const title = topic.title.tr;
let msg = await play(page, 10);
ok(msg === `Harika! „${title}“ konusunda çok iyi gidiyorsun.`, `10/10: ${msg}`);
msg = await play(page, 8);
ok(msg.startsWith('Güzel sonuç.') && msg.includes('aşağıda') && await page.locator('#quizResult .wrong-summary').count() === 1, `8/10: ${msg}`);
msg = await play(page, 3);
ok(msg.startsWith('Biraz daha tekrar') && !/soldaki|özet/.test(msg), `3/10: ${msg}`);
for (const [lang, perfect] of [['de', `Beim Thema „${topic.title.de}“`], ['en', `with “${topic.title.en}”`]]) {
  await page.click(`.lang button[data-lang="${lang}"]`); await page.waitForTimeout(500);
  msg = await play(page, 10);
  ok(msg.includes(perfect) && !/Artikel|article/i.test(msg.replace(topic.title[lang], '')), `${lang} 10/10: ${msg}`);
  msg = await play(page, 3);
  ok(!/links|left|Zusammenfassung|summary/i.test(msg), `${lang} 3/10: ${msg}`);
}
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(500);
// Every topic: no result text mentions articles unless the topic is about articles.
const app = fs.readFileSync('js/app.js', 'utf8');
for (const key of ['resultPerfect', 'resultGood', 'resultPractice']) {
  const texts = [...app.matchAll(new RegExp(`${key}:'([^']*)'`, 'g'))].map(m => m[1]);
  ok(texts.length === 3 && texts.every(text => !/artikel|article|soldaki|links|left/i.test(text.replace('{topic}', ''))), `${key}: üç dilde de konudan bağımsız`);
}
await page.close();

for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t); } catch (_) {} }, th);
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
  await play(p, w === 390 ? 10 : 6);
  ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${w} ${th}: yatay taşma yok`);
  await p.locator('#quizResult .result-message').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(shotDir, `sonuc-mesaji-${w}-${th}.png`) });
  await ctx.close();
}
console.log('screenshots in', shotDir);
await browser.close();
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
