// Player behaviour on Goethe B1 Lesen 1/1, then every Lesen set of every exam: all right, then all wrong.
import { chromium, B, ROUTE, sectionOf, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
let loads = 0; page.on('load', () => loads++);
const { ok, done } = checker();
const hash = () => page.url().split('#')[1];
const set = (t, s, level = 'b1') => readSet(level, t, s);
const questions = d => d.groups.flatMap(g => g.questions.filter(q => !q.example).map(q => ({ q, g })));
const optionsOf = (q, g) => q.type === 'richtig-falsch' ? ['richtig', 'falsch'] : q.type === 'ja-nein' ? ['ja', 'nein'] : q.type === 'ja-nein-nichts' ? ['ja', 'nein', 'nichts'] : q.type === 'richtig-falsch-nichts' ? ['richtig', 'falsch', 'nichts'] : q.type === 'abc' || q.type === 'fehlerauswahl' ? Object.keys(q.options) : q.type === 'reihenfolge' ? q.options.map(String) : [...g.texts.filter(t => t.label).map(t => t.label), ...(g.none === false ? [] : [g.none || '0'])];
async function answer(number, value) {
  if (Array.isArray(value)) { for (const v of value) await page.check(`input[data-task-answer="${number}"][value="${v}"]`); return; }
  const select = await page.$(`select[data-task-answer="${number}"]`);
  if (select) await select.selectOption(value);
  else await page.check(`input[data-task-answer="${number}"][value="${value}"]`);
}
const score = () => page.textContent('.task-score').catch(() => null);

// 1. Open from the Teil list
await page.goto(B + '#exams/goethe/b1/lesen'); await page.waitForTimeout(800);
await page.click('a.exam-start[href="#exams/goethe/b1/lesen/1/set-1"]'); await page.waitForTimeout(1200);
ok(hash() === 'exams/goethe/b1/lesen/1/set-1', 'Başla opens the set address');
ok(await page.evaluate(() => document.activeElement.id) === 'examFlowTitle', 'focus moves to the set heading');
ok(await page.evaluate(() => { const r = document.getElementById('examFlowTitle').getBoundingClientRect(); return r.top >= 0 && r.top < 300; }), 'set heading is scrolled into view');
ok(await page.locator('.task-q.is-example input:checked').count() === 1 && await page.locator('.task-q.is-example input:disabled').count() === 2, 'example answer shown and locked');

// 2. Mixed answers and check
const d11 = set(1, 1); const q11 = questions(d11);
await answer(q11[0].q.number, q11[0].q.answer);                                   // right
await answer(q11[1].q.number, q11[1].q.answer === 'richtig' ? 'falsch' : 'richtig'); // wrong
for (const { q } of q11.slice(2, 5)) await answer(q.number, q.answer);              // right ×3, one left empty
await page.click('[data-task-check]'); await page.waitForTimeout(900);
ok((await score()) === '4 / 6 doğru', `score after check: ${await score()}`);
ok(await page.locator('.task-q.is-right').count() === 4 && await page.locator('.task-q.is-wrong').count() === 1 && await page.locator('.task-q.is-empty').count() === 1, 'right / wrong / empty states');
ok(await page.locator('.task-explanation').count() === 7, 'explanations for all questions and the example');
ok(await page.locator('.task-q.is-wrong .task-solution').count() === 1 && await page.locator('.task-q.is-right .task-solution').count() === 0, 'solution shown only where needed');
ok(await page.locator('input[data-task-answer]:not([disabled])').count() === 0, 'answers are locked after checking');
const evidenceStyled = await page.evaluate(() => getComputedStyle(document.querySelector('.task-evidence')).backgroundColor !== 'rgba(0, 0, 0, 0)');
ok(evidenceStyled, 'evidence sentences are highlighted after checking');
await page.evaluate(() => window.scrollTo(0, 0));
await page.click(`[data-task-show="${q11[5].q.number}"]`); await page.waitForTimeout(900);
ok(await page.evaluate(n => { const el = document.querySelector(`.task-evidence[data-q="${n}"]`); const r = el.getBoundingClientRect(); return document.activeElement === el && r.top > 0 && r.bottom < innerHeight; }, String(q11[5].q.number)), '"Metinde göster" scrolls to and focuses the sentence');

// 3. Language change keeps the checked state
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(700);
ok((await score()) === '4 von 6 richtig', `score in German: ${await score()}`);
ok((await page.textContent('[data-task-retry]')).trim() === 'Noch einmal lösen' && await page.locator('.task-meta span', { hasText: 'Türkisch' }).count() === 1, 'German labels and the Turkish-explanations note');
await page.click('.lang button[data-lang="en"]'); await page.waitForTimeout(700);
ok((await score()) === '4 of 6 correct', `score in English: ${await score()}`);
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(700);

// 4. Retry
await page.click('[data-task-retry]'); await page.waitForTimeout(900);
ok(await page.locator('.task-summary').count() === 0 && await page.locator('[data-task-check]').count() === 1, 'retry clears the result');
ok(await page.locator('input[data-task-answer]:checked:not([disabled])').count() === 0 && await page.locator('.task-q.is-example input:checked').count() === 1, 'retry clears the answers but keeps the example');

// 5. Answers survive a language change before checking
await answer(q11[0].q.number, 'falsch');
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(700);
ok(await page.isChecked(`input[data-task-answer="${q11[0].q.number}"][value="falsch"]`), 'unchecked answers survive a language change');
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(500);

// 6. Breadcrumb, back and forward
await page.click('.exam-step.is-current a'); await page.waitForTimeout(700);
ok(hash() === 'exams/goethe/b1/lesen', 'step 4 link returns to the Teil list');
await page.goBack(); await page.waitForTimeout(1000);
ok(hash() === 'exams/goethe/b1/lesen/1/set-1' && await page.locator('.task-q').count() === 7, 'back returns to the set');
await page.goBack(); await page.waitForTimeout(800);
ok(hash() === 'exams/goethe/b1/lesen', 'back again shows the Teil list');
await page.goForward(); await page.waitForTimeout(1000);
ok(hash() === 'exams/goethe/b1/lesen/1/set-1' && await page.locator('.task-q').count() === 7, 'forward opens the set again');
await page.click('.exam-back'); await page.waitForTimeout(700);
ok(hash() === 'exams/goethe/b1/lesen', '"Önceki adım" returns to the Teil list');

// 7. Every set: all right, then all wrong
for (const level of Object.keys(ROUTE)) for (let t = 1; t <= teileOf(level); t++) for (let s = 1; s <= setsOf(level, t); s++) {
  const d = set(t, s, level); const qs = questions(d);
  await page.goto('about:blank'); await page.goto(`${B}#exams/${ROUTE[level]}/${sectionOf(level)}/${t}/set-${s}`); await page.waitForTimeout(1000);
  for (const { q } of qs) await answer(q.number, q.answer);
  await page.click('[data-task-check]'); await page.waitForTimeout(500);
  const allRight = await score();
  const marks = await page.locator('.task-evidence').count();
  await page.click('[data-task-retry]'); await page.waitForTimeout(500);
  for (const { q, g } of qs) await answer(q.number, Array.isArray(q.answer) ? optionsOf(q, g).filter(v => !q.answer.includes(v)).slice(0, q.answer.length) : optionsOf(q, g).find(v => v !== q.answer));
  await page.click('[data-task-check]'); await page.waitForTimeout(500);
  const allWrong = await score();
  const n = qs.reduce((sum, { q }) => sum + (Array.isArray(q.answer) ? q.answer.length : 1), 0);
  ok(allRight === `${n} / ${n} doğru` && allWrong === `0 / ${n} doğru` && marks > 0, `${level} teil-${t}/set-${s}: ${allRight} | ${allWrong} | ${marks} highlighted`);
}

// 8. Invalid set addresses
for (const [from, to] of [['#exams/goethe/b1/lesen/1/set-9', 'exams/goethe/b1/lesen'], ['#exams/goethe/b1/lesen/9/set-1', 'exams/goethe/b1/lesen'], ['#exams/goethe/b1/hoeren/1/set-1', 'exams/goethe/b1/hoeren']]) {
  await page.goto('about:blank'); await page.goto(B + from); await page.waitForTimeout(800);
  ok(hash() === to, `${from} → #${hash()}`);
}
console.log('loads', loads);
done(errors);
await browser.close();
