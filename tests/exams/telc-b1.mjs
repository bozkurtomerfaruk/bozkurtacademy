// telc B1 Lesen and Sprachbausteine: start links, Teil 1 headline selects, Teil 3 x option,
// Sprachbausteine Teil 1 a/b/c gaps and Teil 2 word-list gaps show the chosen word, overflow, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, sectionOf, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  for (const key of ['tb1', 'tb1s']) {
    const section = sectionOf(key);
    const total = Array.from({ length: teileOf(key) }, (_, i) => setsOf(key, i + 1)).reduce((a, b) => a + b, 0);
    await page.goto(`${B}#exams/telc/b1/${section}`); await page.waitForTimeout(1000);
    const starts = await page.locator(`a.exam-start[href^="#exams/telc/b1/${section}/"]`).count();
    ok(starts === total, `${w} ${th} ${section}: ${starts} start links for ${total} sets`);
    for (let t = 1; t <= teileOf(key); t++) for (let s = 1; s <= setsOf(key, t); s++) {
      const label = `${w} ${th} ${section} T${t} set-${s}`;
      await page.goto('about:blank'); await page.goto(`${B}#exams/telc/b1/${section}/${t}/set-${s}`); await page.waitForTimeout(1000);
      const set = readSet(key, t, s), qs = set.groups.flatMap(g => g.questions);
      if (key === 'tb1' && t === 1) ok(await page.locator('select:not([disabled])').first().locator('option').count() === 11, `${label}: headlines a–j`);
      if (key === 'tb1' && t === 3) ok(await page.locator('select:not([disabled]) option[value="x"]').count() === 10, `${label}: x option`);
      if (key === 'tb1s' && t === 1) {
        await page.check(`input[data-task-answer="${qs[0].number}"][value="b"]`);
        const pick = await page.locator(`.task-gap[data-gap="${qs[0].number}"] .task-gap-pick`).textContent();
        ok(pick === qs[0].options.b, `${label}: gap shows "${pick}"`);
      }
      if (key === 'tb1s' && t === 2) {
        await page.selectOption(`select[data-task-answer="${qs[0].number}"]`, 'a');
        const word = set.groups[0].texts.find(x => x.label === 'a').paragraphs[0];
        const pick = await page.locator(`.task-gap[data-gap="${qs[0].number}"] .task-gap-pick`).textContent();
        ok(pick === word, `${label}: gap shows word "${pick}"`);
      }
      await page.click('[data-task-check]'); await page.waitForTimeout(400);
      if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`tb1-${section}-t${t}-${w}.png`) });
      const over = await overflow(page);
      ok(over <= 0, `${label}: no horizontal overflow (${over})`);
    }
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
