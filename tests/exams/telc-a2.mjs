// telc A2 (Start Deutsch 2) Lesen: start links, Teil 1 a/b/c, Teil 2 richtig/falsch, Teil 3 ads with x option
// (example 0 included), solution after checking, overflow, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const total = Array.from({ length: teileOf('ta2') }, (_, i) => setsOf('ta2', i + 1)).reduce((a, b) => a + b, 0);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${B}#exams/telc/a2/lesen`); await page.waitForTimeout(1000);
  const starts = await page.locator('a.exam-start[href^="#exams/telc/a2/lesen/"]').count();
  ok(starts === total, `${w} ${th}: ${starts} start links for ${total} sets`);
  for (let t = 1; t <= teileOf('ta2'); t++) for (let s = 1; s <= setsOf('ta2', t); s++) {
    const label = `${w} ${th} T${t} set-${s}`;
    await page.goto('about:blank'); await page.goto(`${B}#exams/telc/a2/lesen/${t}/set-${s}`); await page.waitForTimeout(1000);
    const set = readSet('ta2', t, s), q = set.groups.flatMap(g => g.questions).find(x => !x.example);
    if (t === 1) ok(await page.locator(`input[data-task-answer="${q.number}"]`).count() === 3, `${label}: three options a/b/c`);
    if (t === 2) ok(await page.locator('.task-q--richtig-falsch').count() === 5, `${label}: five richtig/falsch`);
    if (t === 3) ok(await page.locator('select:not([disabled]) option[value="x"]').count() === 5, `${label}: x option in five selects`);
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    const sol = await page.locator(`.task-q[data-q="${q.number}"] .task-solution`).textContent();
    ok(sol.includes(q.answer), `${label}: solution "${sol.trim().slice(0, 40)}"`);
    if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`ta2-t${t}-${w}.png`) });
    const over = await overflow(page);
    ok(over <= 0, `${label}: no horizontal overflow (${over})`);
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
