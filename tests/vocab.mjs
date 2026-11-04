// Alıştırmalarda kelime listesi (data/sozluk.json + soruların "vocab" alanı).
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/vocab.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'vocab-shots-'));
const artikel = JSON.parse(fs.readFileSync('data/a1/artikel.json', 'utf8'));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
let dictRequests = 0;
page.on('request', r => { if (r.url().includes('sozluk.json')) dictRequests++; });

const open = async (hash) => { await page.goto('about:blank'); await page.goto(B + '#' + hash); await page.waitForTimeout(1500); };
const items = (sel) => page.locator(`${sel} .quiz-vocab li`).allTextContents().then(list => list.map(x => x.replace(/\s+/g, ' ').trim()));
const choose = async (value) => { await page.click(`#quizOptions .quiz-option[data-answer="${value}"]`); await page.click('#checkAnswerBtn'); await page.waitForTimeout(300); };

// Kelime listesi olmayan bir alıştırmada sözlük yüklenmiyor (bütün konular listelendiyse bu kontrol atlanır).
const noVocab = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8')).levels.flatMap(l => l.topics.filter(t => t.path).map(t => [l.id, t]))
  .map(([level, t]) => [level, t, JSON.parse(fs.readFileSync(t.path, 'utf8')).exercises.find(e => e.questions.every(q => !q.vocab))]).find(([, , e]) => e);
if (noVocab) {
  await open(`exercises/${noVocab[0]}/${noVocab[1].id}/${noVocab[2].id}/q1`);
  ok(dictRequests === 0, `kelime listesi olmayan alıştırmada (${noVocab[0]} ${noVocab[1].id}) data/sozluk.json yüklenmiyor`);
} else console.log('skip kelime listesi olmayan alıştırma kalmadı');

// Doğru cevap: "der Bahnhof – tren istasyonu" ve "das Hotel – otel".
const q1 = artikel.exercises[0].questions[0];
await open('exercises/A1/artikel/kontext-1/q1');
ok(await page.locator('#quizFeedback .quiz-vocab').count() === 0, 'kontrol etmeden önce liste yok');
await choose(q1.correct);
let list = await items('#quizFeedback');
ok(list.join(' | ') === 'der Bahnhof – tren istasyonu | das Hotel – otel', `doğru cevaptan sonra soru kelimeleri: ${list.join(' | ')}`);
ok(await page.textContent('#quizFeedback .quiz-vocab strong') === 'Bu sorudaki kelimeler', 'liste başlığı');

// Yanlış cevap: açıklama ve liste birlikte.
await page.click('#nextQuestionBtn'); await page.waitForTimeout(300);
const q2 = artikel.exercises[0].questions[1];
await choose(q2.options.find(o => o !== q2.correct));
ok(await page.locator('#quizFeedback.bad .wrong-explanation').count() === 1 && (await items('#quizFeedback'))[0] === 'die Wohnung – daire, ev', 'yanlış cevapta açıklama ve kelimeler');

// Dil değişimi: başlık Almanca, anlam Türkçe, not var.
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(600);
ok(await page.textContent('#quizFeedback .quiz-vocab strong') === 'Wörter in dieser Aufgabe' && (await items('#quizFeedback'))[0] === 'die Wohnung – daire, ev'
  && (await page.textContent('#quizFeedback .quiz-vocab small')).includes('Türkisch'), 'Almanca arayüzde Türkçe anlam ve not');
await page.click('.lang button[data-lang="en"]'); await page.waitForTimeout(600);
ok(await page.textContent('#quizFeedback .quiz-vocab strong') === 'Words in this question', 'İngilizce başlık');
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(600);

// Yazmalı soru, Enter ile, yanlış cevap.
await open('exercises/A1/artikel/schreiben-3/q1');
const w1 = artikel.exercises[2].questions[0];
const wrongArticle = ['der', 'die', 'das'].find(a => !w1.correct.startsWith(a + ' '));
await page.fill('#writtenAnswerInput', wrongArticle + ' ' + w1.word); await page.press('#writtenAnswerInput', 'Enter'); await page.waitForTimeout(400);
ok(await page.locator('#quizFeedback.bad').count() === 1 && (await items('#quizFeedback')).length === w1.vocab.length, `yazmalı soru Enter ile, yanlış: ${(await items('#quizFeedback')).join(' | ')}`);

// Sonuç ekranı: paketin bütün kelimeleri, tekrar yok.
await open('exercises/A1/artikel/kontext-1/q1');
for (let i = 0; i < 10; i++) {
  const q = artikel.exercises[0].questions[i];
  await choose(q.correct);
  await page.click('#nextQuestionBtn'); await page.waitForTimeout(250);
}
await page.waitForTimeout(400);
const expected = [...new Set(artikel.exercises[0].questions.flatMap(q => q.vocab))];
list = await items('#quizResult');
ok(list.length === expected.length && await page.textContent('#quizResult .quiz-vocab strong') === 'Bu alıştırmadaki kelimeler', `sonuç ekranında ${list.length}/${expected.length} kelime`);
ok(new Set(list).size === list.length, 'sonuç listesinde tekrar yok');
await page.screenshot({ path: path.join(shotDir, 'vocab-sonuc-1280.png'), fullPage: false });

// Emin olunmayan kelime kontrol edilene kadar gizli; diğerleri görünüyor. Sözlüğün bir kopyasında Karte ve Laptop
// "emin değilim, kontrol edilmedi" yapılır (gerçek verideki işaretlerden bağımsız). Sadece çoğul: die Eltern.
const testDict = JSON.parse(fs.readFileSync('data/sozluk.json', 'utf8'));
for (const key of ['Karte', 'Laptop']) Object.assign(testDict.words[key], { unsure: true, checked: false });
await page.route('**/sozluk.json*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(testDict) }));
await open('exercises/A2/dativ/zwei-pronomen-22/q6');
await page.fill('#writtenAnswerInput', 'Ich kaufe sie dir'); await page.click('#checkAnswerBtn'); await page.waitForTimeout(400);
ok(await page.locator('#quizFeedback .quiz-vocab').count() === 0, 'emin olunmayan "Karte" gizli (bu soruda başka kelime yok, liste çıkmıyor)');
await open('exercises/A2/dativ/wem-fragen-6/q4');
const lq = JSON.parse(fs.readFileSync('data/a2/dativ.json', 'utf8')).exercises.find(e => e.id === 'wem-fragen-6').questions[3];
await choose(lq.correct);
list = await items('#quizFeedback');
ok(list.join(' | ') === 'die Schwester – kız kardeş', `"Laptop" gizli, "Schwester" görünüyor: ${list.join(' | ')}`);
await open('exercises/B1/relativsaetze/genitiv-10/q4');
await choose('deren');
await page.unroute('**/sozluk.json*');
ok((await items('#quizFeedback'))[0] === 'die Eltern (sadece çoğul) – anne baba', 'sadece çoğul olan kelime işaretli');

// Emin olunmayan ama kontrol edilmiş kelime görünüyor.
const shownDict = JSON.parse(fs.readFileSync('data/sozluk.json', 'utf8'));
Object.assign(shownDict.words.Laptop, { unsure: true, checked: true });
await page.route('**/sozluk.json*', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(shownDict) }));
await open('exercises/A2/dativ/wem-fragen-6/q4');
await choose(lq.correct);
ok((await items('#quizFeedback')).join(' | ') === 'der Laptop – dizüstü bilgisayar | die Schwester – kız kardeş', 'emin olunmayan kelime kontrol edilince görünüyor');
await page.unroute('**/sozluk.json*');

// Kelime listesi olan her konu: ilk alıştırmanın ilk sorusu kontrol edilince beklenen kelimeler görünüyor.
const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
const words = JSON.parse(fs.readFileSync('data/sozluk.json', 'utf8')).words;
let covered = 0;
for (const level of catalog.levels) for (const topic of level.topics) {
  if (!topic.path) continue;
  const data = JSON.parse(fs.readFileSync(topic.path, 'utf8'));
  const exercise = data.exercises.find(e => e.questions[0]?.vocab);
  if (!exercise) continue;
  const q = exercise.questions[0];
  await open(`exercises/${level.id}/${topic.id}/${exercise.id}/q1`);
  if (q.type === 'text') { await page.fill('#writtenAnswerInput', 'x'); await page.press('#writtenAnswerInput', 'Enter'); await page.waitForTimeout(300); }
  else await choose(q.options[0]);
  const expected = q.vocab.filter(k => !words[k].unsure || words[k].checked).map(k => `${words[k].article} ${words[k].word || k.split('|')[0]}${words[k].pluralOnly ? ' (sadece çoğul)' : ''} – ${words[k].tr}`);
  const got = await items('#quizFeedback');
  if (got.join('|') !== expected.join('|')) ok(false, `${level.id} ${topic.id}: ${got.join(' | ')} ≠ ${expected.join(' | ')}`);
  else covered++;
}
ok(covered > 0, `${covered} konuda ilk sorunun kelime listesi doğru`);

// Sınav setlerinde liste yok.
await open('exams/goethe/b1/lesen/1/set-1');
await page.click('[data-task-check]'); await page.waitForTimeout(600);
ok(await page.locator('.quiz-vocab').count() === 0, 'sınav setinde kelime listesi yok');

// Sözlük yüklenemezse alıştırma hatasız çalışıyor.
const p2 = await browser.newPage(); p2.on('pageerror', e => errors.push(e.message));
await p2.route('**/sozluk.json*', r => r.abort());
await p2.goto(B + '#exercises/A1/artikel/kontext-1/q1'); await p2.waitForTimeout(1500);
await p2.click(`#quizOptions .quiz-option[data-answer="${q1.correct}"]`); await p2.click('#checkAnswerBtn'); await p2.waitForTimeout(300);
ok(await p2.locator('#quizFeedback.good').count() === 1 && await p2.locator('.quiz-vocab').count() === 0, 'sözlük yüklenemezse liste olmadan devam');
await p2.close();
await page.close();

// 390 ve 1440 px, açık ve koyu.
for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t); } catch (_) {} }, th);
  const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
  await p.goto(B + '#exercises/A2/dativ/dativartikel-bestimmt-1/q1'); await p.waitForTimeout(1500);
  const q = JSON.parse(fs.readFileSync('data/a2/dativ.json', 'utf8')).exercises[0].questions[0];
  await p.click(`#quizOptions .quiz-option[data-answer="${q.options.find(o => o !== q.correct)}"]`); await p.click('#checkAnswerBtn'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${w} ${th}: soru ekranında yatay taşma yok`);
  await p.locator('#quizFeedback').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(shotDir, `vocab-soru-${w}-${th}.png`) });
  await p.goto('about:blank'); await p.goto(B + '#exercises/B1/relativsaetze/nominativ-2/q1'); await p.waitForTimeout(1500);
  const ex = JSON.parse(fs.readFileSync('data/b1/relativsaetze.json', 'utf8')).exercises.find(e => e.id === 'nominativ-2');
  for (const qq of ex.questions) {
    if (qq.type === 'text') { await p.fill('#writtenAnswerInput', qq.correct); await p.press('#writtenAnswerInput', 'Enter'); }
    else { await p.click(`#quizOptions .quiz-option[data-answer="${qq.correct.replace(/"/g, '\\"')}"]`); await p.click('#checkAnswerBtn'); }
    await p.waitForTimeout(200); await p.click('#nextQuestionBtn'); await p.waitForTimeout(200);
  }
  await p.waitForTimeout(400);
  ok(await p.locator('#quizResult .quiz-vocab li').count() > 0 && await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${w} ${th}: sonuç ekranında liste, yatay taşma yok`);
  await p.locator('#quizResult .quiz-vocab').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(shotDir, `vocab-sonuc-${w}-${th}.png`) });
  await ctx.close();
}

console.log('screenshots in', shotDir);
await browser.close();
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
