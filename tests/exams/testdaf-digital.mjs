// Digital TestDaF Lesen: start links (Aufgabe 2 and 7 have none yet), Aufgabe 1 a–d gaps,
// Aufgabe 4 marked passages, Aufgabe 6 a/b buttons, overflow on every set, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const teile = Array.from({ length: teileOf('tdd') }, (_, i) => i + 1);
const total = teile.reduce((sum, t) => sum + setsOf('tdd', t), 0);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${B}#exams/testdaf/digital/lesen`); await page.waitForTimeout(1000);
  const starts = await page.locator('a.exam-start[href^="#exams/testdaf/digital/lesen/"]').count();
  ok(starts === total, `${w} ${th}: ${starts} start links for ${total} sets`);
  for (const t of teile) for (let s = 1; s <= setsOf('tdd', t); s++) {
    const label = `${w} ${th} Aufgabe ${t} set-${s}`;
    await page.goto('about:blank'); await page.goto(`${B}#exams/testdaf/digital/lesen/${t}/set-${s}`); await page.waitForTimeout(1000);
    const qs = readSet('tdd', t, s).groups.flatMap(g => g.questions);
    if (t === 1) {
      await page.check(`input[data-task-answer="${qs[0].number}"][value="d"]`);
      const pick = await page.locator(`.task-gap[data-gap="${qs[0].number}"] .task-gap-pick`).textContent();
      ok(pick === qs[0].options.d, `${label}: gap shows "${pick}"`);
    }
    if (t === 4) ok(await page.locator('.task-gap[data-gap]').count() === 4, `${label}: four marked passages`);
    if (t === 6) ok(await page.locator('.task-q--pair').count() === 4 && await page.locator('select').count() === 0, `${label}: four a/b questions`);
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`tdd-a${t}-${w}.png`) });
    const over = await overflow(page);
    ok(over <= 0, `${label}: no horizontal overflow (${over})`);
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
