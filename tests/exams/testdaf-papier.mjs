// Paper-based TestDaF Lesen: start links, Lesetext 1 with A–H and I, two examples (01, 02),
// Lesetext 3 Ja / Nein / Text sagt dazu nichts, overflow on every set, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const total = Array.from({ length: teileOf('tdp') }, (_, i) => setsOf('tdp', i + 1)).reduce((a, b) => a + b, 0);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${B}#exams/testdaf/papier/lesen`); await page.waitForTimeout(1000);
  const starts = await page.locator('a.exam-start[href^="#exams/testdaf/papier/lesen/"]').count();
  ok(starts === total, `${w} ${th}: ${starts} start links for ${total} sets`);
  for (let t = 1; t <= teileOf('tdp'); t++) for (let s = 1; s <= setsOf('tdp', t); s++) {
    const label = `${w} ${th} Aufgabe ${t} set-${s}`;
    await page.goto('about:blank'); await page.goto(`${B}#exams/testdaf/papier/lesen/${t}/set-${s}`); await page.waitForTimeout(1000);
    const examples = readSet('tdp', t, s).groups.flatMap(g => g.questions).filter(q => q.example).length;
    ok(await page.locator('.task-q.is-example').count() === examples, `${label}: ${examples} example(s) shown`);
    if (t === 1) {
      const opts = await page.locator('select:not([disabled])').first().locator('option').allTextContents();
      ok(opts.length === 10 && /^I – /.test(opts[9]), `${label}: options A–H and "${opts[9]}"`);
    }
    if (t === 3) {
      const keys = await page.locator('.task-q:not(.is-example)').first().locator('.task-option-key').allTextContents();
      ok(keys.join('|') === 'Ja|Nein|Text sagt dazu nichts', `${label}: ${keys.join(' / ')}`);
    }
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`tdp-t${t}-${w}.png`) });
    const over = await overflow(page);
    ok(over <= 0, `${label}: no horizontal overflow (${over})`);
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
