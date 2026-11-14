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
ok(await page.locator('[data-wt-result] a.task-next[href="#exams/goethe/b1/schreiben/2/set-1"]').count() === 1, 'Teil 1 son setinden Teil 2 ilk sete geçiş');
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

// 6b. Teil 2 (forum, Gästebuch görüşü, madde yok) ve Teil 3 (yarı resmî e-posta, ~40 kelime).
{
  const { ctx, page } = await newPage();
  await page.goto(B + '#exams/goethe/b1/schreiben'); await page.waitForTimeout(1000);
  const list = await page.textContent('#examView');
  ok(['Kinder und Smartphones', 'Hunde in der Mietwohnung', 'Termin mit dem Vermieter', 'Spiel am Sonntag'].every((x) => list.includes(x)), 'Teil 2 ve Teil 3 setleri listede');
  const t2 = JSON.parse(fs.readFileSync('data/exams/goethe/b1/schreiben/teil-2/set-1.json', 'utf8'));
  await page.goto(B + '#exams/goethe/b1/schreiben/2/set-1'); await page.waitForTimeout(1000);
  ok((await page.textContent('.wt-post blockquote')).includes(t2.post.text) && (await page.textContent('.wt-post figcaption')).includes('Markus'), 'Teil 2: Gästebuch görüşü ve yazarı');
  ok(await page.locator('.wt-points').count() === 0 && await page.locator('.wt-instructions').count() === 0, 'Teil 2: madde listesi ve ayrı yönerge yok');
  ok(await page.getAttribute('#wtText', 'placeholder') === 'Ich finde, …', 'Teil 2: metin alanı ipucu forum yazısına uygun');
  await page.fill('#wtText', t2.model.text);
  ok((await page.getAttribute('[data-wt-state]', 'class')).includes('is-ok'), 'Teil 2: örnek cevap uzunluğu iyi');
  await page.goto(B + '#exams/goethe/b1/schreiben/3/set-2'); await page.waitForTimeout(1000);
  ok((await page.textContent('.wt-task')).includes('Frau Wagner') && (await page.textContent('.wt-instructions')).includes('circa 40 Wörter'), 'Teil 3: görev ve "circa 40 Wörter"');
  ok(await page.getAttribute('#wtText', 'placeholder') === 'Liebe Frau …, / Sehr geehrter Herr …,', 'Teil 3: ipucu yarı resmî hitap');
  for (const [n, cls] of [[34, 'is-short'], [35, 'is-ok'], [50, 'is-ok'], [51, 'is-long']]) {
    await page.fill('#wtText', words(n));
    ok((await page.getAttribute('[data-wt-state]', 'class')).includes(cls), `Teil 3: ${n} kelime → ${cls}`);
  }
  await page.goto(B + '#exams/goethe/b1/schreiben/3/set-5'); await page.waitForTimeout(800);
  await page.fill('#wtText', 'Lieber Herr Braun, …'); await page.click('[data-wt-submit]'); await page.waitForTimeout(400);
  ok(await page.locator('[data-wt-result] a[href="#exams/goethe/b1/schreiben"]').count() === 1, 'Teil 3 son sette Teil listesine dönüş');
  await ctx.close();
}

// 6c. Goethe A1: Teil 1 form doldurma (otomatik kontrol, yapay zekâ yok), Teil 2 kısa mesaj (~30 kelime).
{
  const { ctx, page } = await newPage();
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto(B + '#exams/goethe/a1/schreiben'); await page.waitForTimeout(1000);
  const list = await page.textContent('#examView');
  ok(['Anmeldung zum Deutschkurs', 'Wohnung anmelden beim Bürgeramt', 'Zusammen kochen', 'Schwimmkurs für Kinder'].every((x) => list.includes(x)), 'A1: Teil 1 ve Teil 2 setleri listede');
  // Eşleştirme kuralları (js/form-task.js).
  const judge = await page.evaluate(() => {
    const j = (row, v) => window.BAFormTask.judge(row, v).status;
    const street = { accept: ['Goethestraße 7'] }, num = { accept: ['3', 'drei'] }, pick = { choices: ['bar', 'Überweisung'], answer: 'Überweisung' };
    return [j(street, '  goethestrasse 7. '), j(street, 'Goethestrase 7'), j(street, 'Goethestraße 8'), j(num, 'Drei'), j(num, '4'), j(num, ''), j(pick, 'Überweisung'), j(pick, 'bar'),
      j({ accept: ['Casablanca'] }, 'Casablnaca'), j({ accept: ['AOK'] }, 'AOX')];
  });
  ok(JSON.stringify(judge) === JSON.stringify(['right', 'almost', 'wrong', 'right', 'wrong', 'empty', 'right', 'wrong', 'almost', 'wrong']),
    `form kontrolü: büyük-küçük harf/ß/boşluk önemsiz, tek harf yazım hatası "almost", sayı farklıysa yanlış, kısa kelimede tolerans yok (${judge})`);
  await page.goto(B + '#exams/goethe/a1/schreiben/1/set-1'); await page.waitForTimeout(1000);
  ok(await page.locator('.ft-input').count() === 3 && await page.locator('.ft-choice input').count() === 5 && await page.locator('.ft-no.is-example').count() === 1, 'form: 3 yazı alanı, 2 seçenekli alan, örnek (0)');
  ok(await page.locator('#wtText').count() === 0 && await page.locator('.task-evidence').count() === 5, 'form: metin alanı yok; 5 dayanak işareti hazır');
  await page.fill('#ft-1', 'casablanca');
  await page.press('#ft-1', 'Enter');
  ok(await page.evaluate(() => document.activeElement?.id) === 'ft-2', 'Enter bir sonraki alana geçiyor');
  await page.fill('#ft-2', 'Franzosisch');
  await page.fill('#ft-3', '3.3.');
  await page.check('input[name="ft-4"][value="abends"]');
  await page.press('#ft-3', 'Enter');
  await page.waitForTimeout(400);
  ok((await page.textContent('[data-ft-summary]')).includes('3 / 5 doğru'), 'son alanda Enter kontrol ediyor: 3 / 5 doğru');
  ok((await page.textContent('[data-ft-row="2"] .task-result')).includes('Doğru sayıldı, ama yazımı: Französisch'), '"Franzosisch" → doğru, ama yazımı: Französisch');
  ok((await page.textContent('[data-ft-row="3"] .task-result')).includes('Doğru cevap: 2. März') && (await page.getAttribute('[data-ft-row="3"]', 'class')).includes('is-wrong'), 'yanlış tarih: doğru cevap gösteriliyor');
  ok((await page.textContent('[data-ft-row="5"] .task-result')).includes('Cevap verilmedi'), 'boş seçim: "Cevap verilmedi"');
  ok(await page.locator('.ft-situation.is-checked .task-evidence[data-q="5"]').count() === 1 && await page.locator('.ft-input:disabled').count() === 3, 'kontrolden sonra dayanaklar numaralı, alanlar kilitli');
  await page.click('[data-task-show="1"]'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => document.activeElement?.dataset.q) === '1', '"Metinde göster" dayanağa gidiyor');
  ok(await page.locator('a.task-next[href="#exams/goethe/a1/schreiben/1/set-2"]').count() === 1, 'sonraki set bağlantısı');
  await page.click('[data-ft-retry]'); await page.waitForTimeout(300);
  ok(await page.inputValue('#ft-1') === '' && await page.locator('[data-ft-summary]').count() === 0, '"Tekrar çöz" formu boşaltıyor');
  await page.goto(B + '#exams/goethe/a1/schreiben/1/set-5'); await page.waitForTimeout(800);
  await page.click('[data-ft-check]'); await page.waitForTimeout(300);
  ok(await page.locator('a[href="#exams/goethe/a1/schreiben/2/set-1"]').count() === 1 && (await page.textContent('[data-ft-summary]')).includes('0 / 5'), 'Teil 1 son setinden Teil 2\'ye geçiş; boş form 0 / 5');
  await page.goto(B + '#exams/goethe/a1/schreiben/2/set-3'); await page.waitForTimeout(1000);
  ok((await page.textContent('.wt-instructions')).includes('circa 30 Wörter') && await page.locator('.wt-points li').count() === 3, 'A1 Teil 2: üç madde ve "circa 30 Wörter"');
  for (const [n, cls] of [[24, 'is-short'], [25, 'is-ok'], [40, 'is-ok'], [41, 'is-long']]) {
    await page.fill('#wtText', words(n));
    ok((await page.getAttribute('[data-wt-state]', 'class')).includes(cls), `A1 Teil 2: ${n} kelime → ${cls}`);
  }
  ok(!reqs.some((u) => /gstatic\.com\/firebasejs|firestore\.googleapis|identitytoolkit/.test(u)), 'A1 Schreiben: ziyaretçide Firebase yüklenmiyor');
  await ctx.close();
  for (const [l, check, spelling] of [['de', 'Prüfen', 'Als richtig gezählt'], ['en', 'Check answers', 'Counted as correct']]) {
    const { ctx, page } = await newPage({ lang: l });
    await page.goto(B + '#exams/goethe/a1/schreiben/1/set-3'); await page.waitForTimeout(1000);
    await page.fill('#ft-2', 'Goethestrase 7');
    ok((await page.textContent('[data-ft-check]')).includes(check), `${l}: form düğmesi`);
    await page.click('[data-ft-check]'); await page.waitForTimeout(300);
    const body = await page.textContent('.ft');
    ok(body.includes(spelling) && !/\bft[A-Z]\w+/.test(body), `${l}: form metinleri çevrili`);
    await ctx.close();
  }
}

// 6d. telc B1: gelen e-postaya cevap, 4 madde, Betreff ilk satırda, önerilen uzunluk (resmî sınır yok).
{
  const { ctx, page } = await newPage();
  await page.goto(B + '#exams/telc/b1/schreiben'); await page.waitForTimeout(1000);
  const list = await page.textContent('#examView');
  ok(['Ein Freund zieht in Ihre Stadt', 'Einladung zur Hochzeit', 'Tipps zum Deutschlernen', 'Kursausflug', 'Abschied einer Kollegin', 'Hoffest im Haus'].every((x) => list.includes(x)), 'telc B1: 6 set listede');
  const t1 = JSON.parse(fs.readFileSync('data/exams/telc/b1/schreiben/teil-1/set-4.json', 'utf8'));
  await page.goto(B + '#exams/telc/b1/schreiben/1/set-4'); await page.waitForTimeout(1000);
  ok((await page.textContent('.wt-mail')).includes('Claudia Neumann') && (await page.textContent('.wt-mail')).includes('Ausflug zum Kursende') && (await page.textContent('.wt-mail blockquote')).includes('bis Freitag'), 'telc: gelen e-posta kartı (gönderen, konu, metin)');
  ok(await page.locator('.wt-points li').count() === 4 && (await page.textContent('.wt-instructions')).includes('passenden Betreff'), 'telc: 4 madde ve resmî yönerge');
  ok((await page.textContent('.task-meta')).includes('Önerilen uzunluk: yaklaşık 120 kelime (resmî sınır yok)') && (await page.textContent('.task-meta')).includes('30'), 'telc: "önerilen uzunluk, resmî sınır yok" ve 30 dk');
  ok((await page.getAttribute('#wtText', 'placeholder')).startsWith('Betreff: …\nLiebe Frau'), 'telc: ipucu Betreff ile başlıyor');
  for (const [n, cls] of [[99, 'is-short'], [100, 'is-ok'], [150, 'is-ok'], [151, 'is-long']]) {
    await page.fill('#wtText', words(n));
    ok((await page.getAttribute('[data-wt-state]', 'class')).includes(cls), `telc: ${n} kelime → ${cls}`);
  }
  await page.fill('#wtText', t1.model.text);
  await page.click('[data-wt-submit]'); await page.waitForTimeout(400);
  ok((await page.textContent('#wtModelTitle')).includes('Örnek cevap') && (await page.textContent('.wt-cols')).includes('Betreff: Unser Ausflug zum Kursende'), 'telc: gönderince örnek cevap (Betreff ile)');
  ok(await page.locator('a.task-next[href="#exams/telc/b1/schreiben/1/set-5"]').count() === 1, 'telc: sonraki set');
  await ctx.close();
  const { ctx: c2, page: p2 } = await newPage({ lang: 'de' });
  await p2.goto(B + '#exams/telc/b1/schreiben/1/set-1'); await p2.waitForTimeout(1000);
  ok((await p2.textContent('.task-meta')).includes('Empfohlene Länge') && (await p2.textContent('.wt-mail')).includes('Von: Jonas'), 'de: telc metinleri çevrili');
  await c2.close();
}

// 6e. DTZ: tek görev, 4 madde, Betreff yok, önerilen ~80 kelime (60–120), 40'ın altında uyarı, "sınavda iki görevden biri" notu.
{
  const { ctx, page } = await newPage();
  await page.goto(B + '#exams/dtz/schreiben'); await page.waitForTimeout(1000);
  const list = await page.textContent('#examView');
  ok(['Die Heizung funktioniert nicht', 'Elternabend in der Schule', 'Schwimmkurs für Ihre Tochter', 'Falsche Lieferung', 'Ein freier Tag', 'Geburtstagsfeier im Haus'].every((x) => list.includes(x)), 'DTZ: 6 set listede');
  const d1 = JSON.parse(fs.readFileSync('data/exams/dtz/a2-b1/schreiben/teil-1/set-1.json', 'utf8'));
  await page.goto(B + '#exams/dtz/schreiben/1/set-1'); await page.waitForTimeout(1000);
  ok(await page.locator('.wt-points li').count() === 4 && (await page.textContent('.wt-task')).includes('Herrn Brandt') && (await page.textContent('.wt-instructions')).includes('Anrede und den Gruß'), 'DTZ: durum, 4 madde, "Anrede und Gruß" yönergesi');
  ok((await page.textContent('[data-wt-choice]')).includes('iki görevden (Aufgabe A ya da B) birini seçersin'), 'DTZ: "gerçek sınavda iki görevden birini seçersin" notu');
  ok((await page.textContent('.task-meta')).includes('Önerilen uzunluk: yaklaşık 80 kelime (resmî sınır yok)') && (await page.textContent('.task-meta')).includes('30'), 'DTZ: önerilen ~80 kelime ve 30 dk');
  const hint = await page.getAttribute('#wtText', 'placeholder');
  ok(!hint.includes('Betreff') && hint.startsWith('Liebe Frau'), `DTZ: ipucunda Betreff yok (${hint})`);
  ok(await page.locator('.wt-mail').count() === 0, 'DTZ: gelen e-posta kartı yok');
  ok((await page.textContent('.wt-checklist')).includes('Maddeleri numaralamadım ve her maddeye tek cümle yazıp geçmedim; metnim bağlantılı.'), 'DTZ: kontrol listesinde "numaralamadım, metnim bağlantılı" maddesi');
  for (const [n, cls, text] of [[39, 'is-very-short', '40 kelimenin altında'], [40, 'is-short', '60–120'], [59, 'is-short', '60–120'], [60, 'is-ok', ''], [120, 'is-ok', ''], [121, 'is-long', '']]) {
    await page.fill('#wtText', words(n));
    ok((await page.getAttribute('[data-wt-state]', 'class')).includes(cls) && (await page.textContent('[data-wt-state]')).includes(text), `DTZ: ${n} kelime → ${cls}`);
  }
  ok(!(await page.getAttribute('[data-wt-state]', 'class')).includes('is-very-short'), 'DTZ: uzun metinde "çok kısa" uyarısı yok');
  await page.fill('#wtText', words(20)); await page.click('[data-wt-submit]'); await page.waitForTimeout(400);
  ok(await page.locator('[data-wt-result]').count() === 1, 'DTZ: 40 kelimenin altında da gönderilebiliyor (uyarı engellemiyor)');
  ok((await page.textContent('.wt-cols')).includes('Sehr geehrter Herr Brandt,') && !(await page.textContent('.wt-cols')).includes('Betreff'), 'DTZ: örnek cevap hitapla başlıyor, Betreff yok');
  ok(await page.locator('a.task-next[href="#exams/dtz/schreiben/1/set-2"]').count() === 1, 'DTZ: sonraki set');
  ok(d1.model.text.startsWith('Sehr geehrter Herr Brandt,'), 'DTZ: set dosyası');
  await ctx.close();
  for (const [lang, meta, choice, short] of [['de', 'Empfohlene Länge', 'In der echten Prüfung wählst du eine von zwei Aufgaben', 'Unter 40 Wörtern'], ['en', 'Suggested length', 'In the real exam you choose one of two tasks', 'Under 40 words']]) {
    const { ctx: c2, page: p2 } = await newPage({ lang });
    await p2.goto(B + '#exams/dtz/schreiben/1/set-3'); await p2.waitForTimeout(1000);
    await p2.fill('#wtText', words(10));
    ok((await p2.textContent('.task-meta')).includes(meta) && (await p2.textContent('[data-wt-choice]')).includes(choice) && (await p2.textContent('[data-wt-state]')).includes(short), `${lang}: DTZ metinleri çevrili`);
    await c2.close();
  }
}

// 7. 390 / 1440, açık / koyu.
for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    for (const teil of ['b1/schreiben/2/set-1', 'b1/schreiben/3/set-1', 'a1/schreiben/1/set-3', 'a1/schreiben/2/set-1', 'telc-b1', 'dtz']) {
      const { ctx, page } = await newPage({ width, theme });
      await page.goto(B + (teil === 'telc-b1' ? '#exams/telc/b1/schreiben/1/set-2' : teil === 'dtz' ? '#exams/dtz/schreiben/1/set-6' : `#exams/goethe/${teil}`)); await page.waitForTimeout(1200);
      const name = teil.replace(/\/schreiben\/(\d)\/set-\d/, '-teil$1');
      if (teil.startsWith('a1/schreiben/1')) { await page.fill('#ft-1', 'drei'); await page.fill('#ft-2', 'Goethestrase 7'); await page.check('input[name="ft-4"][value="vormittags"]'); await page.click('[data-ft-check]'); await page.waitForTimeout(400); }
      ok(await overflow(page) <= 0, `${width} ${theme} ${name}: taşma yok`);
      await page.screenshot({ path: path.join(shotDir, `${name}-${width}-${theme}.png`), fullPage: true });
      await ctx.close();
    }
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
