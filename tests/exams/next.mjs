// "Sonraki alıştırma" after checking a set: next set in the same Teil, then Teil n+1 set 1, and after the last
// set of the section a closing note with links back. Also: Sprachbausteine, TestDaF "Aufgabe", language change,
// focus, overflow and screenshots at 390/1440 px in light and dark.
import { chromium, B, shot, shotDir, checker } from './lib.mjs';
const browser = await chromium.launch();
const { ok, done } = checker();
const errors = [];
const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const hash = page => page.url().split('#')[1];

async function openAndCheck(page, route) {
  await page.goto(B + '#exams/' + route); await page.waitForTimeout(900);
  await page.click('[data-task-check]'); await page.waitForTimeout(700);
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

// Before checking: no next link.
await page.goto(B + '#exams/goethe/b1/lesen/1/set-1'); await page.waitForTimeout(900);
ok(await page.locator('.task-next').count() === 0, 'no next link before checking');

// Inside a Teil: set-1 → set-2.
await page.click('[data-task-check]'); await page.waitForTimeout(700);
const next = page.locator('.task-actions .task-next');
ok(await next.getAttribute('href') === '#exams/goethe/b1/lesen/1/set-2', 'Teil 1 set-1 → set-2');
ok((await next.textContent()).includes('Sonraki alıştırma') && (await next.textContent()).includes('Teil 1 ·'), 'button shows label and next set title');
ok(await page.locator('.task-summary-next a').getAttribute('href') === '#exams/goethe/b1/lesen/1/set-2', 'link in the result box too');
ok(await page.locator('[data-task-retry].ghost').count() === 1, 'retry stays, as a secondary button');

// Language change keeps the checked state and translates the link.
await page.click('.lang button[data-lang="de"]'); await page.waitForTimeout(700);
ok((await next.textContent()).includes('Nächste Übung') && await page.locator('.task-summary').count() === 1, 'German label after language change');
await page.click('.lang button[data-lang="en"]'); await page.waitForTimeout(700);
ok((await next.textContent()).includes('Next exercise'), 'English label');
await page.click('.lang button[data-lang="tr"]'); await page.waitForTimeout(700);

// Clicking opens the next set unchecked, focus on its heading, no reload.
let loads = 0; page.on('load', () => loads++);
await page.click('.task-actions .task-next'); await page.waitForTimeout(1000);
ok(hash(page) === 'exams/goethe/b1/lesen/1/set-2', 'click opens set-2');
ok(await page.locator('[data-task-check]').count() === 1 && await page.locator('.task-summary').count() === 0, 'next set starts unchecked');
ok(await page.evaluate(() => document.activeElement.id) === 'examFlowTitle', 'focus moves to the new heading');
ok(loads === 0, 'no page reload');
await page.goBack(); await page.waitForTimeout(900);
ok(hash(page) === 'exams/goethe/b1/lesen/1/set-1', 'browser back returns to the previous set');

// Last set of a Teil → Teil n+1 set-1.
await openAndCheck(page, 'goethe/b1/lesen/1/set-5');
ok(await page.locator('.task-actions .task-next').getAttribute('href') === '#exams/goethe/b1/lesen/2/set-1', 'Teil 1 set-5 → Teil 2 set-1');
ok((await page.locator('.task-actions .task-next').textContent()).includes('Teil 2 ·'), 'label names Teil 2');

// Last set of the section → closing note and links back.
await openAndCheck(page, 'goethe/b1/lesen/5/set-5');
ok(await page.locator('.task-next').count() === 0, 'no next link after the last set');
ok((await page.textContent('.task-finished')).includes('son setine geldin'), 'closing note');
ok(await page.locator('.task-actions a[href="#exams/goethe/b1"]').count() === 1, 'link to the section list');
ok(await page.locator('.task-actions a[href="#exams/goethe/b1/lesen"]').count() === 1, 'link to the Teil list');
await page.click('.task-actions a[href="#exams/goethe/b1"]'); await page.waitForTimeout(900);
ok(hash(page) === 'exams/goethe/b1' && await page.locator('.exam-card').count() > 0, 'section list opens');

// Sprachbausteine (telc B1): Teil 1 set-5 → Teil 2 set-1, then the end.
await openAndCheck(page, 'telc/b1/sprachbausteine/1/set-5');
ok(await page.locator('.task-actions .task-next').getAttribute('href') === '#exams/telc/b1/sprachbausteine/2/set-1', 'Sprachbausteine Teil 1 → Teil 2');
await openAndCheck(page, 'telc/b1/sprachbausteine/2/set-5');
ok(await page.locator('.task-actions a[href="#exams/telc/b1"]').count() === 1, 'Sprachbausteine end links to the section list');

// DTZ has no level step: section list is #exams/dtz.
await openAndCheck(page, 'dtz/lesen/5/set-5');
ok(await page.locator('.task-actions a[href="#exams/dtz"]').count() === 1 && await page.locator('.task-actions a[href="#exams/dtz/lesen"]').count() === 1, 'DTZ end links');

// TestDaF says "Aufgabe".
await openAndCheck(page, 'testdaf/digital/lesen/1/set-5');
ok((await page.locator('.task-actions .task-next').textContent()).includes('Aufgabe 2 ·'), 'TestDaF next label uses Aufgabe');
await openAndCheck(page, 'testdaf/digital/lesen/7/set-5');
ok((await page.textContent('.task-actions')).includes('Aufgabe listesine dön'), 'TestDaF end: Aufgabe list');
await ctx.close();

// Overflow and screenshots: 390 and 1440, light and dark; next button and the end of a section.
for (const [w, th] of [[390, 'light'], [390, 'dark'], [1440, 'light'], [1440, 'dark']]) {
  const c = await browser.newContext({ viewport: { width: w, height: 900 } });
  await c.addInitScript(t => { try { localStorage.setItem('ba-theme', t) } catch (_) {} }, th);
  const p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
  for (const [route, name] of [['goethe/b1/lesen/1/set-1', 'next'], ['goethe/b1/lesen/5/set-5', 'end']]) {
    await openAndCheck(p, route);
    ok(await overflow(p) <= 0, `${w} ${th} ${name}: no horizontal overflow`);
    await p.locator('.task-summary').screenshot({ path: shot(`next-${name}-summary-${w}-${th}.png`) });
    await p.locator('.task-actions').scrollIntoViewIfNeeded();
    await p.screenshot({ path: shot(`next-${name}-actions-${w}-${th}.png`) });
  }
  await c.close();
}
console.log('screenshots in', shotDir);
await browser.close();
done(errors);
