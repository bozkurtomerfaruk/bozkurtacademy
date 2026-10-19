// Goethe B2 Lesen Teil 2 (sentence gaps) and Teil 5 (headings): gap markers, chosen text, colours, overflow.
import { chromium, B, shot, shotDir, setsOf, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
for (const [w, th] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const page = await ctx.newPage(); page.on('pageerror', e => errors.push(e.message));
  for (const t of [2, 5]) for (let s = 1; s <= setsOf('b2', t); s++) {
    await page.goto(`${B}#exams/goethe/b2/lesen/${t}/set-${s}`); await page.waitForTimeout(1200);
    const gaps = await page.locator('.task-gap[data-gap]').count();
    const select = page.locator('select:not([disabled])').first();
    await select.selectOption({ index: 2 });
    const picked = await select.locator('option:checked').getAttribute('value');
    const pick = t === 2 ? await page.locator('.task-gap[data-gap] .task-gap-pick').first().textContent() : picked;
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    const colored = await page.locator('.task-gap.is-right, .task-gap.is-wrong').count();
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok((t === 2 ? gaps >= 6 && colored === gaps && pick === picked : gaps === 0) && over <= 0,
      `${w} ${th} T${t} set-${s}: gaps ${gaps}, pick ${JSON.stringify(pick)}, coloured ${colored}, overflow ${over}`);
    if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`b2-t${t}-${w}.png`) });
  }
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
