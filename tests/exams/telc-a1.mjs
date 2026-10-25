// telc A1 (Start Deutsch 1, same format as Goethe A1) Lesen: start links, Teil 2 a/b buttons with ad titles (no select), richtig/falsch in Teil 1 and 3,
// solution text after checking, overflow on every set, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const total = Array.from({ length: teileOf('ta1') }, (_, i) => setsOf('ta1', i + 1)).reduce((a, b) => a + b, 0);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${B}#exams/telc/a1/lesen`); await page.waitForTimeout(1000);
  const starts = await page.locator('a.exam-start[href^="#exams/telc/a1/lesen/"]').count();
  ok(starts === total, `${w} ${th}: ${starts} start links for ${total} sets`);
  for (let t = 1; t <= teileOf('ta1'); t++) for (let s = 1; s <= setsOf('ta1', t); s++) {
    const label = `${w} ${th} T${t} set-${s}`;
    await page.goto('about:blank'); await page.goto(`${B}#exams/telc/a1/lesen/${t}/set-${s}`); await page.waitForTimeout(1000);
    if (t === 2) {
      const set = readSet('ta1', 2, s), q = set.groups[1].questions[0];
      ok(await page.locator('select').count() === 0, `${label}: no select`);
      ok(await page.locator('.task-q--pair').count() === 6, `${label}: six a/b questions incl. example`);
      const title = set.groups[1].texts.find(x => x.label === 'b').title;
      const shown = await page.locator(`input[data-task-answer="${q.number}"][value="b"]`).locator('..').locator('.task-option-text').textContent();
      ok(shown === title, `${label}: option b shows "${shown}"`);
      const wrong = q.answer === 'a' ? 'b' : 'a';
      await page.check(`input[data-task-answer="${q.number}"][value="${wrong}"]`);
      await page.click('[data-task-check]'); await page.waitForTimeout(400);
      const sol = await page.locator(`.task-q[data-q="${q.number}"] .task-solution`).textContent();
      ok(sol.includes(`${q.answer} – `), `${label}: solution "${sol.trim()}"`);
      if (s === 1) await page.locator('.task-group').nth(1).screenshot({ path: shot(`ta1-t2-${w}.png`) });
    } else {
      ok(await page.locator('.task-q--richtig-falsch').count() === 6, `${label}: six richtig/falsch incl. example`);
      if (s === 1) await page.screenshot({ path: shot(`ta1-t${t}-${w}.png`), fullPage: true });
    }
    const over = await overflow(page);
    ok(over <= 0, `${label}: no horizontal overflow (${over})`);
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
