// Schreiben görevleri, ziyaretçi tarafı (#exams/goethe/b1/schreiben/1/set-1): Teil listesi, görev, kelime sayacı (70–100),
// boş gönderim, taslak (localStorage), kontrol listesi, Redemittel, örnek cevap, sonraki set, yeniden yaz, diller,
// Firebase'in hiç yüklenmemesi, öğretmen ipucu notu, 390/1440 px açık/koyu ve taşma.
// Hesap tarafı (kayıt, öğretmen geri bildirimi, panel, ödev, günlük sınır): tests/schreiben-account.mjs (emülatör).
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/schreiben.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'schreiben-'));
const set1 = JSON.parse(fs.readFileSync('data/exams/goethe/b1/schreiben/teil-1/set-1.json', 'utf8'));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const words = (n) => Array.from({ length: n }, (_, i) => `Wort${i}`).join(' ');

async function newPage({ width = 1280, theme = 'light', lang = null, account = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.addInitScript(([t, l, a]) => { try { if (!sessionStorage.getItem('i')) { sessionStorage.setItem('i', '1'); localStorage.setItem('ba-theme', t); if (l) localStorage.setItem('baLang', l); if (a) localStorage.setItem('baAccount', a); } } catch (_) {} }, [theme, lang, account]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page };
}

// 1. Teil listesi ve görev.
const { ctx, page } = await newPage();
const requests = [];
page.on('request', (r) => requests.push(r.url()));
await page.goto(B + '#exams/goethe/b1/schreiben'); await page.waitForTimeout(1200);
const teile = await page.textContent('#examView');
ok(['Neue Wohnung', 'Geburtstag verpasst', 'Neue Arbeit', 'Zurück vom Urlaub', 'Abendkurs'].every((x) => teile.includes(x)), 'Goethe B1 Schreiben Teil 1: 5 set listede');
await page.goto(B + '#exams/goethe/b1/schreiben/1/set-1'); await page.waitForTimeout(1200);
ok((await page.textContent('.wt-task')).includes(set1.points[2]), 'görev metni ve üç madde');
ok((await page.locator('.wt-points li').count()) === 3, 'üç içerik maddesi');
ok(await page.getAttribute('#wtText', 'spellcheck') === 'false' && await page.getAttribute('#wtText', 'lang') === 'de', 'metin alanı: yazım denetimi kapalı, lang=de');
ok(await page.locator('[data-wt-check]').count() === set1.checklist.length && await page.locator('.wt-crit').count() === 3, `kontrol listesi: ${set1.checklist.length} madde, 3 kriter`);
ok((await page.textContent('[data-wt-who]')).includes('hiçbir yere gönderilmez'), 'ziyaretçiye "metnin gönderilmez" notu');

// 2. Kelime sayacı.
const state = async () => [(await page.textContent('[data-wt-count]')).trim(), (await page.textContent('[data-wt-state]')).trim(), await page.getAttribute('[data-wt-state]', 'class')];
ok((await state())[0] === '0 kelime', 'sayaç 0');
await page.fill('#wtText', words(69));
let s = await state();
ok(s[0] === '69 kelime' && s[1].includes('Biraz daha yaz') && !s[2].includes('is-ok'), `69 kelime: kısa (${s[1]})`);
await page.fill('#wtText', words(70));
s = await state();
ok(s[0] === '70 kelime' && s[1] === 'Uzunluk iyi' && s[2].includes('is-ok'), '70 kelime: iyi');
await page.fill('#wtText', words(100));
s = await state();
ok(s[0] === '100 kelime' && s[2].includes('is-ok'), '100 kelime: iyi');
await page.fill('#wtText', words(101));
s = await state();
ok(s[0] === '101 kelime' && s[2].includes('is-long'), '101 kelime: uzun uyarısı');
await page.fill('#wtText', "Ich habe die B1-Prüfung. Wie geht's?");
ok((await state())[0] === '6 kelime', 'tireli ve kesme işaretli kelimeler tek sayılıyor');
await page.fill('#wtText', 'Erste Zeile');
await page.press('#wtText', 'Enter');
await page.type('#wtText', 'Zweite Zeile');
ok((await page.inputValue('#wtText')) === 'Erste Zeile\nZweite Zeile' && await page.locator('[data-wt-result]').count() === 0, 'Enter yeni satır açar, göndermez');

// 3. Boş gönderim, taslak.
await page.fill('#wtText', '   ');
await page.click('[data-wt-submit]');
ok(await page.locator('[data-wt-error]').isVisible() && (await page.textContent('[data-wt-error]')).includes('Önce metnini yaz'), 'boş metin gönderilemez');
const text = set1.model.text.replace('Deniz', 'Mert');
await page.fill('#wtText', text);
ok(await page.locator('[data-wt-error]').isHidden(), 'yazınca hata kalkıyor');
await page.reload(); await page.waitForTimeout(1200);
ok((await page.inputValue('#wtText')) === text, 'taslak yeniden yüklemede duruyor');
await page.check('#wt-c-0');
ok((await page.evaluate(() => localStorage.getItem('baWriting:goethe-b1-1-set-1'))).includes('Mert'), 'taslak sadece bu cihazda: baWriting:goethe-b1-1-set-1');
await page.click('.wt-redemittel summary');
ok((await page.textContent('.wt-rm')).includes('Ich bin umgezogen, weil'), 'Redemittel açılıyor');
await page.screenshot({ path: path.join(shotDir, 'yaz-1440-light.png'), fullPage: true });

// 4. Gönder: örnek cevap, sonraki set, yeniden yaz.
await page.click('[data-wt-submit]'); await page.waitForTimeout(500);
ok((await page.textContent('[data-wt-status]')).includes('Metnin kaydedilmedi') && await page.locator('[data-wt-status] a[href="giris.html"]').count() === 1, 'ziyaretçi: "kaydedilmedi" + giriş bağlantısı');
ok((await page.textContent('#wtMineTitle')).includes('80 kelime') && (await page.textContent('.wt-cols')).includes('Mert'), 'kendi metni ve kelime sayısı');
ok((await page.textContent('#wtModelTitle')).includes('Örnek cevap') && (await page.locator('.wt-notes li').count()) === set1.model.notes.length, 'örnek cevap ve notlar');
ok(await page.locator('a.task-next[href="#exams/goethe/b1/schreiben/1/set-2"]').count() === 1, 'sonraki set: Geburtstag verpasst');
await page.screenshot({ path: path.join(shotDir, 'sonuc-1440-light.png'), fullPage: true });
await page.click('[data-wt-again]'); await page.waitForTimeout(300);
ok((await page.inputValue('#wtText')) === text && await page.isChecked('#wt-c-0'), 'yeniden yaz: metin ve işaretler duruyor');
await page.click('[data-lang="de"]').catch(() => {}); await page.waitForTimeout(600);
ok((await page.inputValue('#wtText')) === text && (await page.textContent('.wt')).includes('Checkliste und Hinweise auf Türkisch'), 'dil değişince metin korunuyor (DE)');
await page.click('[data-lang="tr"]').catch(() => {}); await page.waitForTimeout(400);
await page.goto(B + '#exams/goethe/b1/schreiben/1/set-5'); await page.waitForTimeout(800);
await page.fill('#wtText', 'Lieber Paul, …'); await page.click('[data-wt-submit]'); await page.waitForTimeout(400);
ok(await page.locator('[data-wt-result] a[href="#exams/goethe/b1/schreiben"]').count() === 1, 'son sette Teil listesine dönüş');
ok(!requests.some((u) => /gstatic\.com\/firebasejs|firestore\.googleapis|identitytoolkit/.test(u)), 'ziyaretçide Firebase hiç yüklenmiyor');
await ctx.close();

// 5. Öğretmen ipucu: metin kaydedilmez notu.
{
  const { ctx, page } = await newPage({ account: 'teacher' });
  // Firebase SDK, gstatic yerine node_modules/firebase'den (oturum yok: ipucu silinir, hata olmaz).
  await page.route('https://www.gstatic.com/firebasejs/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript',
    body: fs.readFileSync(path.join('node_modules/firebase', path.basename(new URL(route.request().url()).pathname))) }));
  await page.addInitScript(() => { try { localStorage.setItem('baEmulator', '1'); } catch (_) {} });
  await page.goto(B + '#exams/goethe/b1/schreiben/1/set-2'); await page.waitForTimeout(1200);
  ok((await page.textContent('[data-wt-who]')).includes('Öğretmen hesabıyla'), 'öğretmen hesabında "kaydedilmez" notu');
  await ctx.close();
}

// 6. Diller.
for (const [l, title, submit, count] of [['de', 'Dein Text', 'Abschicken und Musterlösung ansehen', '0 Wörter'], ['en', 'Your text', 'Submit and see the model answer', '0 words']]) {
  const { ctx, page } = await newPage({ lang: l });
  await page.goto(B + '#exams/goethe/b1/schreiben/1/set-3'); await page.waitForTimeout(1200);
  const body = await page.textContent('.wt');
  ok(body.includes(title) && body.includes(submit) && (await page.textContent('[data-wt-count]')).trim() === count, `${l}: arayüz metinleri`);
  ok(!/\bwt[A-Z]\w+/.test(body), `${l}: eksik çeviri anahtarı yok`);
  await ctx.close();
}

// 7. 390 / 1440, açık / koyu.
for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    const { ctx, page } = await newPage({ width, theme });
    await page.goto(B + '#exams/goethe/b1/schreiben/1/set-4'); await page.waitForTimeout(1200);
    await page.fill('#wtText', set1.model.text);
    await page.check('#wt-c-1');
    ok(await overflow(page) <= 0, `${width} ${theme}: yazarken taşma yok`);
    await page.screenshot({ path: path.join(shotDir, `yaz-${width}-${theme}.png`), fullPage: true });
    await page.click('[data-wt-submit]'); await page.waitForTimeout(500);
    ok(await overflow(page) <= 0, `${width} ${theme}: sonuçta taşma yok`);
    await page.screenshot({ path: path.join(shotDir, `sonuc-${width}-${theme}.png`), fullPage: true });
    await ctx.close();
  }
}

await browser.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
