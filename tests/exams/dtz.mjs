// DTZ Lesen: start links, Teil 1 table, Teil 2 x option, Teil 4 a/b/c,
// Teil 5 chosen word inside the gap, overflow on every set, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const total = Array.from({ length: teileOf('dtz') }, (_, i) => setsOf('dtz', i + 1)).reduce((a, b) => a + b, 0);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${B}#exams/dtz/lesen`); await page.waitForTimeout(1000);
  const starts = await page.locator('a.exam-start[href^="#exams/dtz/lesen/"]').count();
  ok(starts === total, `${w} ${th}: ${starts} start links for ${total} sets`);
  for (let t = 1; t <= teileOf('dtz'); t++) for (let s = 1; s <= setsOf('dtz', t); s++) {
    const label = `${w} ${th} T${t} set-${s}`;
    await page.goto('about:blank'); await page.goto(`${B}#exams/dtz/lesen/${t}/set-${s}`); await page.waitForTimeout(1000);
    if (t === 1) ok(await page.locator('.task-table tr').count() >= 8, `${label}: contents table`);
    if (t === 2) ok(await page.locator('select:not([disabled]) option[value="x"]').count() === 5, `${label}: x option in every select`);
    if (t === 4) ok(await page.locator('input[data-task-answer][value="c"]').count() === 3, `${label}: a/b/c for 37–39`);
    if (t === 5) {
      const q = readSet('dtz', 5, s).groups[0].questions.find(q => !q.example);
      const wrong = ['a', 'b', 'c'].find(v => v !== q.answer);
      await page.check(`input[data-task-answer="${q.number}"][value="${wrong}"]`);
      const pick = await page.locator(`.task-gap[data-gap="${q.number}"] .task-gap-pick`).textContent();
      ok(pick === q.options[wrong], `${label}: gap ${q.number} shows "${pick}"`);
      await page.click('[data-task-check]'); await page.waitForTimeout(400);
      ok(await page.locator(`.task-gap.is-wrong[data-gap="${q.number}"]`).count() === 1, `${label}: wrong gap coloured`);
      if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`dtz-t5-${w}.png`) });
    }
    const over = await overflow(page);
    ok(over <= 0, `${label}: no horizontal overflow (${over})`);
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
