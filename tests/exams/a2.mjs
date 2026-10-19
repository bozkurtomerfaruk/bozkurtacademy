// Goethe A2 Lesen: Teil 2 board table, Teil 4 X option, mobile overflow, dark mode, start links.
import { chromium, B, shot, shotDir, setsOf, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
for (const [w, scheme] of [[1280, 'light'], [390, 'dark']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript(th => { try { localStorage.setItem('ba-theme', th) } catch (_) {} }, scheme);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(e.message));
  for (let s = 1; s <= setsOf('a2', 2); s++) {
    await page.goto(`${B}#exams/goethe/a2/lesen/2/set-${s}`); await page.waitForTimeout(1200);
    const rows = await page.locator('.task-table tr').count();
    ok(rows >= 6, `${w} T2 set-${s}: table rows ${rows}`);
    const over = await overflow(page);
    ok(over <= 0, `${w} T2 set-${s}: no horizontal overflow (${over})`);
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    ok(await page.locator('.task-table .task-evidence').count() > 0, `${w} T2 set-${s}: evidence marked inside table`);
    if (s === 1) await page.locator('.task-group').first().screenshot({ path: shot(`a2-t2-${w}-${scheme}.png`) });
  }
  for (let s = 1; s <= setsOf('a2', 4); s++) {
    await page.goto(`${B}#exams/goethe/a2/lesen/4/set-${s}`); await page.waitForTimeout(1200);
    const xs = await page.locator('select option[value="x"]').allTextContents();
    ok(xs.length >= 5 && xs.every(t => /^X – /.test(t)), `${w} T4 set-${s}: X option "${xs[0]}"`);
    ok(await page.locator('select option[value="0"]').count() === 0, `${w} T4 set-${s}: no 0 option`);
    await page.click('[data-task-check]'); await page.waitForTimeout(400);
    const sol = await page.locator('.task-solution').allTextContents();
    ok(sol.some(t => t.includes('X (')), `${w} T4 set-${s}: solution shows X`);
    const over = await overflow(page);
    ok(over <= 0, `${w} T4 set-${s}: no horizontal overflow (${over})`);
    if (s === 1) await page.screenshot({ path: shot(`a2-t4-${w}-${scheme}.png`), fullPage: true });
  }
  await page.goto(`${B}#exams/goethe/a2/lesen`); await page.waitForTimeout(1000);
  ok(await page.locator('a.exam-start[href^="#exams/goethe/a2/lesen/"]').count() >= 8, `${w} A2 Teil list shows start links`);
  await page.close();
}
console.log('screenshots', shotDir);
done(errors);
await browser.close();
