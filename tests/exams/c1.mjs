// Goethe C1 Lesen: start links, Teil 1 a/b/c/d gaps show the chosen word, Teil 3 sentence gaps,
// Teil 4 "0" option, overflow on every set, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const total = Array.from({ length: teileOf('c1') }, (_, i) => setsOf('c1', i + 1)).reduce((a, b) => a + b, 0);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${B}#exams/goethe/c1/lesen`); await page.waitForTimeout(1000);
  const starts = await page.locator('a.exam-start[href^="#exams/goethe/c1/lesen/"]').count();
  ok(starts === total, `${w} ${th}: ${starts} start links for ${total} sets`);
  for (let t = 1; t <= teileOf('c1'); t++) for (let s = 1; s <= setsOf('c1', t); s++) {
    const label = `${w} ${th} T${t} set-${s}`;
    await page.goto('about:blank'); await page.goto(`${B}#exams/goethe/c1/lesen/${t}/set-${s}`); await page.waitForTimeout(1000);
    if (t === 1) {
      const q = readSet('c1', 1, s).groups.flatMap(g => g.questions).find(q => !q.example);
      ok(await page.locator(`input[data-task-answer="${q.number}"]`).count() === 4, `${label}: four options for gap ${q.number}`);
      await page.check(`input[data-task-answer="${q.number}"][value="d"]`);
      const pick = await page.locator(`.task-gap[data-gap="${q.number}"] .task-gap-pick`).textContent();
      ok(pick === q.options.d, `${label}: gap ${q.number} shows "${pick}"`);
    }
    if (t === 3) ok(await page.locator('.task-gap[data-gap]').count() === 8, `${label}: eight sentence gaps`);
    if (t === 4) ok(await page.locator('select:not([disabled]) option[value="0"]').count() === 7, `${label}: 0 option in every select`);
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`c1-t${t}-${w}.png`) });
    const over = await overflow(page);
    ok(over <= 0, `${label}: no horizontal overflow (${over})`);
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
