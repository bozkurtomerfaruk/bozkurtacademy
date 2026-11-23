// Yeni B2 alıştırma konuları (TOPICS): her soru tarayıcıda cevaplanır.
// - Her paketin ilk seçmeli sorusu ve ilk yazılı sorusu (Enter ile) yanlış cevaplanır: kırmızı geri bildirim ve o sorunun
//   kendi Türkçe açıklaması görünmeli.
// - Diğer bütün sorular doğru cevapla (yazılılarda Enter ile) çözülür: kabul edilmeli.
// - Kelime listesinde yalnızca kontrol edilmiş kelimeler görünür; "checked": false olanlar gizli.
// - Almanca ve İngilizce arayüzde açıklama o dilde; 390/1440 px açık/koyu taşma yok + ekran görüntüsü.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/alistirma-b2-yeni.mjs [konu …] (ekran görüntüleri $S).
// Başka seviye: LEVEL=B1 node tests/alistirma-b2-yeni.mjs lassen-infinitiv
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'alistirma-b2-'));
const LEVEL = process.env.LEVEL || 'B2';
const TOPICS = process.argv.slice(2).length ? process.argv.slice(2) : ['konnektoren-b2'];
const catalog = JSON.parse(fs.readFileSync('data/catalog.json', 'utf8'));
const words = JSON.parse(fs.readFileSync('data/sozluk.json', 'utf8')).words;

const fails = [];
const ok = (cond, label) => { if (!cond) { console.log('FAIL ' + label); fails.push(label); } };
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const open = async (hash) => { await page.goto('about:blank'); await page.goto(B + '#' + hash); await page.waitForTimeout(1300); };
const vocabItems = () => page.locator('#quizFeedback .quiz-vocab li').allTextContents().then(l => l.map(x => x.replace(/\s+/g, ' ').trim()));
const shownWord = k => `${words[k].article} ${words[k].word || k.split('|')[0]}${words[k].pluralOnly ? ' (sadece çoğul)' : ''} – ${words[k].tr}`;
let answered = 0, wrongChecked = 0;

for (const topicId of TOPICS) {
  const topic = catalog.levels.find(l => l.id === LEVEL).topics.find(t => t.id === topicId);
  const data = JSON.parse(fs.readFileSync(topic.path, 'utf8'));
  for (const ex of data.exercises) {
    await open(`exercises/${LEVEL}/${topicId}/${ex.id}/q1`);
    let wrongMc = false, wrongText = false;
    for (const [i, q] of ex.questions.entries()) {
      const where = `${topicId}/${ex.id} #${i + 1}`;
      ok((await page.textContent('#quizQuestion, .quiz-question').catch(() => '') || '').length >= 0, where);
      let expectWrong = false;
      if (q.options) {
        let pick = q.correct;
        if (!wrongMc) { pick = q.options.find(o => o !== q.correct); expectWrong = wrongMc = true; }
        await page.click(`#quizOptions .quiz-option[data-answer="${pick.replace(/"/g, '\\"')}"]`);
        await page.click('#checkAnswerBtn');
      } else {
        let text = q.correct;
        if (!wrongText) { text = 'falsch'; expectWrong = wrongText = true; }
        await page.fill('#writtenAnswerInput', text);
        await page.press('#writtenAnswerInput', 'Enter');
      }
      await page.waitForTimeout(250);
      const cls = expectWrong ? 'bad' : 'good';
      ok(await page.locator(`#quizFeedback.${cls}`).count() === 1, `${where}: ${expectWrong ? 'yanlış' : 'doğru'} cevap ${cls} olmalı`);
      if (expectWrong) {
        const fb = await page.textContent('#quizFeedback');
        ok(fb.includes(q.explanations.tr.slice(0, 60)), `${where}: kendi Türkçe açıklaması görünüyor`);
        wrongChecked++;
      }
      // Kelime listesi: yalnızca kontrol edilmiş kelimeler.
      await page.waitForTimeout(100);
      const expected = (q.vocab || []).filter(k => words[k].checked).map(shownWord);
      const got = await vocabItems();
      ok(got.join('|') === expected.join('|'), `${where}: kelimeler ${got.join(', ')} ≠ ${expected.join(', ')}`);
      answered++;
      if (i < ex.questions.length - 1) { await page.click('#nextQuestionBtn'); await page.waitForTimeout(200); }
    }
  }
  // Almanca ve İngilizce arayüz: açıklama o dilde.
  const ex = data.exercises[0];
  const q = ex.questions.find(x => x.options);
  const qi = ex.questions.indexOf(q);
  for (const lang of ['de', 'en']) {
    await open(`exercises/${LEVEL}/${topicId}/${ex.id}/q${qi + 1}`);
    await page.click(`.lang button[data-lang="${lang}"]`); await page.waitForTimeout(500);
    await page.click(`#quizOptions .quiz-option[data-answer="${q.options.find(o => o !== q.correct).replace(/"/g, '\\"')}"]`);
    await page.click('#checkAnswerBtn'); await page.waitForTimeout(300);
    ok((await page.textContent('#quizFeedback')).includes(q.explanations[lang].slice(0, 50)), `${topicId}: ${lang} açıklama`);
  }
  await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(400);

  for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 });
    await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t); } catch (_) {} }, th);
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message));
    const tq = ex.questions.findIndex(x => !x.options);
    await p.goto(B + `#exercises/${LEVEL}/${topicId}/${ex.id}/q${tq + 1}`); await p.waitForTimeout(1300);
    await p.fill('#writtenAnswerInput', 'falsch'); await p.press('#writtenAnswerInput', 'Enter'); await p.waitForTimeout(400);
    ok(await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 0, `${topicId} ${w} ${th}: yatay taşma yok`);
    await p.locator('#quizFeedback').scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(shotDir, `${topicId}-${w}-${th}.png`) });
    await ctx.close();
  }
}

console.log(`${answered} soru cevaplandı, ${wrongChecked} yanlış cevap denendi; ekran görüntüleri: ${shotDir}`);
await browser.close();
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
