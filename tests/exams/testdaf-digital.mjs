// Digital TestDaF Lesen: start links, Aufgabe 1 a–d gaps, Aufgabe 2 position buttons per paragraph,
// Aufgabe 4 marked passages, Aufgabe 6 a/b buttons, Aufgabe 7 three clickable sentences in one summary,
// overflow on every set, light and dark.
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
    if (t === 2) {
      ok(await page.locator('.task-q--reihenfolge').count() === 4 && await page.locator('select').count() === 0, `${label}: four paragraphs with position buttons`);
      const box = await page.locator('.task-q--reihenfolge .task-option').first().boundingBox();
      ok(box && box.height >= 44 && box.width >= 44, `${label}: position buttons are large enough to tap`);
    }
    if (t === 7) {
      const q = qs.find(x => x.type === 'fehlerauswahl'), sel = `.task-q[data-q="${q.number}"]`;
      ok(await page.locator('.task-q--fehlerauswahl').count() === 1, `${label}: one summary`);
      for (let i = 0; i < 3; i++) await page.locator(`${sel} .task-option-text`).nth(i).click();
      ok(await page.locator(`${sel} .task-option.is-chosen`).count() === 3, `${label}: three sentences chosen`);
      ok(await page.locator(`${sel} input:not(:checked):disabled`).count() === Object.keys(q.options).length - 3, `${label}: no fourth sentence can be chosen`);
      await page.locator(`${sel} .task-option-text`).nth(0).click();
      ok(await page.locator(`${sel} input:disabled`).count() === 0, `${label}: unchoosing frees the other sentences`);
    }
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
