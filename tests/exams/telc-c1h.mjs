// telc C1 Hochschule Lesen and Sprachbausteine: start links, Teil 1 sentence selects, Teil 3 richtig/falsch/nicht im Text
// plus the a–d main-idea item, Sprachbausteine a–d gaps show the chosen word, overflow, light and dark.
import { chromium, B, shot, shotDir, teileOf, setsOf, readSet, sectionOf, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  for (const key of ['tc1', 'tc1s']) {
    const section = sectionOf(key);
    const total = Array.from({ length: teileOf(key) }, (_, i) => setsOf(key, i + 1)).reduce((a, b) => a + b, 0);
    await page.goto(`${B}#exams/telc/c1/${section}`); await page.waitForTimeout(1000);
    const starts = await page.locator(`a.exam-start[href^="#exams/telc/c1/${section}/"]`).count();
    ok(starts === total, `${w} ${th} ${section}: ${starts} start links for ${total} sets`);
    for (let t = 1; t <= teileOf(key); t++) for (let s = 1; s <= setsOf(key, t); s++) {
      const label = `${w} ${th} ${section} T${t} set-${s}`;
      await page.goto('about:blank'); await page.goto(`${B}#exams/telc/c1/${section}/${t}/set-${s}`); await page.waitForTimeout(1000);
      const set = readSet(key, t, s), qs = set.groups.flatMap(g => g.questions);
      if (key === 'tc1' && t === 3) {
        ok(await page.locator('.task-q--richtig-falsch-nichts').count() === 11, `${label}: eleven richtig/falsch/nicht im Text`);
        ok(await page.locator('.task-q--richtig-falsch-nichts .task-option-text', { hasText: 'Nicht im Text' }).count() === 11, `${label}: "Nicht im Text" option`);
        const macro = qs.find(q => q.type === 'abc');
        ok(macro && await page.locator(`input[data-task-answer="${macro.number}"]`).count() === 4, `${label}: main-idea item a–d`);
      }
      if (key === 'tc1s') {
        await page.check(`input[data-task-answer="${qs[0].number}"][value="b"]`);
        const pick = await page.locator(`.task-gap[data-gap="${qs[0].number}"] .task-gap-pick`).textContent();
        ok(pick === qs[0].options.b, `${label}: gap shows "${pick}"`);
      }
      await page.click('[data-task-check]'); await page.waitForTimeout(400);
      if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`tc1-${section}-t${t}-${w}.png`) });
      const over = await overflow(page);
      ok(over <= 0, `${label}: no horizontal overflow (${over})`);
    }
  }
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
