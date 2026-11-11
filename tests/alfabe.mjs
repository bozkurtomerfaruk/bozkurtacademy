// Almanca Alfabe oyunu (/almanca-alfabe/): profil seçimi ve hatırlanması, profil başına ayrı ilerleme, beş mod, doğru/yanlış
// geri bildirim (Enter ile gönderme dahil), sonuç ekranı ve "Zor harflerimi çalış", Zamana Karşı, ses yok / ses kapalı,
// depolama kapalıyken çalışma, dışarıya istek olmaması, 320/390/1280 px açık/koyu taşma, dokunma alanları, reduced motion.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/alfabe.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import vm from 'vm';
import { spawnSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = (process.env.BASE || 'http://localhost:8765') + '/almanca-alfabe/';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-'));
const data = JSON.parse(fs.readFileSync('data/alfabe.json', 'utf8'));
// What the device voice says for a letter (soyle: "Kuh") and the name shown when spelling (ad: "Qu").
const bySaid = Object.fromEntries(data.harfler.map((l) => [l.soyle, l]));
const byName = Object.fromEntries(data.harfler.map((l) => [l.ad, l]));
const signs = Object.fromEntries(Object.entries(data.isaretler).map(([ch, s]) => [s.ad, ch]));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const external = [];
const browser = await chromium.launch();
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function newPage({ width = 1280, theme = 'light', voice = true, blockStorage = false, reducedMotion = 'no-preference', clock = false, audio = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
  await ctx.route('**/*', (r) => { const u = new URL(r.request().url()); if (u.hostname !== 'localhost') { external.push(u.href); return r.abort(); } return r.continue(); });
  await ctx.addInitScript((t) => { try { if (!sessionStorage.getItem('i')) { sessionStorage.setItem('i', '1'); localStorage.setItem('ba-theme', t); } } catch (_) {} }, theme);
  await ctx.addInitScript((hasVoice) => {
    window.__spoken = [];
    const voices = hasVoice ? [{ lang: 'de-DE', localService: true, name: 'Test Deutsch' }, { lang: 'tr-TR', localService: true, name: 'Test Türkçe' },
      { lang: 'de-DE', localService: false, name: 'Online Deutsch' }] : [{ lang: 'de-DE', localService: false, name: 'Online Deutsch' }];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => voices, cancel() {}, addEventListener() {},
      // The utterance "ends" right away, so the next part of a sequence follows.
      speak: (u) => { window.__spoken.push({ text: u.text, lang: u.lang, rate: u.rate, local: u.voice.localService }); setTimeout(() => u.onend && u.onend(), 5); }
    } });
  }, voice);
  if (blockStorage) {
    await ctx.addInitScript(() => {
      Storage.prototype.getItem = function () { throw new DOMException('blocked', 'SecurityError'); };
      Storage.prototype.setItem = function () { throw new DOMException('blocked', 'SecurityError'); };
    });
  }
  if (audio) await audio(ctx);
  else await ctx.route('**/audio/alfabe/manifest.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"clips":{}}' }));
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !(audio && /Failed to load resource.*404/.test(m.text()))) errors.push(m.text()); });
  return { ctx, page };
}
const spoken = (p) => p.evaluate(() => window.__spoken.slice());
const clearSpoken = (p) => p.evaluate(() => { window.__spoken.length = 0; });
// Parts are said one after another: wait until the condition holds (at most 4 s).
const waitSpoken = (p, fn, arg) => p.waitForFunction(fn, arg, { timeout: 4000 }).then(() => true, () => false);
async function pick(p, profile) { await p.click(`[data-ab-pick="${profile}"]`); await p.waitForSelector('.ab-modes, .ab-qhead, .ab-grid'); }

// The answer of the current question, read the way a learner would: from what was said or shown.
async function answerOf(p) {
  const title = (await p.textContent('.ab-qtitle')).trim();
  if (title === 'Duy ve Seç') {
    // Press "Dinle" and take the letter it says (sound needs a first touch, and the previous answer may still be heard).
    await clearSpoken(p); await p.click('[data-ab-play]');
    await waitSpoken(p, (names) => window.__spoken.some((x) => names.includes(x.text)), Object.keys(bySaid));
    const s = await spoken(p); const name = s.filter((x) => bySaid[x.text]).pop().text; return bySaid[name].id;
  }
  if (title === 'İlk Harf') { const w = (await p.textContent('.ab-word')).trim().split(' ').pop(); return data.harfler.find((l) => l.kucuk === w[0].toLocaleLowerCase('de-DE')).id; }
  if (title.startsWith('Buchstabieren')) {
    const text = (await p.textContent('[data-ab-spelled]')).trim();
    return text.split(' – ').map((n, i) => (signs[n] ? signs[n] : (i === 0 ? (byName[n].buyuk || byName[n].kucuk) : byName[n].kucuk))).join('');
  }
  return null;
}
async function answerRight(p) {
  const title = (await p.textContent('.ab-qtitle')).trim();
  if (title === 'Sıraya Diz') {
    for (let guard = 0; guard < 30; guard++) {
      const cur = await p.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
      const sorted = [...cur].sort();
      const i = cur.findIndex((x, k) => x !== sorted[k]);
      if (i < 0) break;
      const j = cur.indexOf(sorted[i]);
      await p.click(`[data-ab-pos="${j}"]`); await p.click(`[data-ab-pos="${i}"]`); // tap two tiles to swap
    }
    await p.click('[data-ab-check]');
    return;
  }
  const a = await answerOf(p);
  if (title.startsWith('Buchstabieren')) {
    if (await p.locator('#abSpell').count()) { await p.fill('#abSpell', a); await p.press('#abSpell', 'Enter'); return; }
    for (const ch of [...a.toLocaleLowerCase('de-DE')]) {
      const btns = await p.$$('[data-ab-tile]:not([disabled])');
      for (const b of btns) { if ((await b.textContent()).trim().toLocaleLowerCase('de-DE') === ch) { await b.click(); break; } }
    }
    await p.click('[data-ab-check]');
    return;
  }
  await p.click(`[data-ab-opt="${a}"]`);
}
async function answerWrong(p) {
  const title = (await p.textContent('.ab-qtitle')).trim();
  if (title === 'Sıraya Diz') { await p.click('[data-ab-check]'); return; }
  if (title.startsWith('Buchstabieren')) {
    if (await p.locator('#abSpell').count()) { await p.fill('#abSpell', 'xyz'); await p.press('#abSpell', 'Enter'); return; }
    await p.click('[data-ab-tile]'); await p.click('[data-ab-check]'); return;
  }
  const a = await answerOf(p);
  const wrong = await p.$$eval('[data-ab-opt]', (els, a) => els.map((e) => e.dataset.abOpt).find((x) => x !== a), a);
  await p.click(`[data-ab-opt="${wrong}"]`);
}
async function playRound(p, wrongAt = []) {
  for (let i = 0; i < 10; i++) {
    await p.waitForSelector('.ab-qtitle');
    if (wrongAt.includes(i)) await answerWrong(p); else await answerRight(p);
    await p.waitForSelector('[data-ab-next]');
    await p.click('[data-ab-next]');
  }
  await p.waitForSelector('.ab-result');
}

// 1. Profile choice, remembered, menu with five modes; separate progress per profile.
{
  const { ctx, page } = await newPage();
  await page.goto(B);
  await page.waitForSelector('[data-ab-pick]');
  ok(await page.locator('[data-ab-pick]').count() === 2 && (await page.textContent('.ab-profiles')).includes('Çocuk') && (await page.textContent('.ab-profiles')).includes('Yetişkin'), 'açılışta iki profil kartı');
  await pick(page, 'yetiskin');
  ok(await page.locator('.ab-mode').count() === 5, 'beş mod');
  ok(await page.locator('[data-ab-timed]').count() === 1, 'yetişkinde Zamana Karşı seçeneği');
  await page.reload(); await page.waitForSelector('.ab-modes');
  ok((await page.getAttribute('#alfabeApp', 'data-profil')) === 'yetiskin', 'profil yeniden yüklemede hatırlanıyor');
  ok((await page.textContent('[data-ab-profile]')).includes('Yetişkin'), 'köşede profil düğmesi');

  // Explore (adult): name, Turkish reading, adult example and the detailed tip; spoken in German.
  await page.click('[data-ab-mode="kesfet"]'); await page.waitForSelector('.ab-grid');
  ok(page.url().endsWith('#kesfet'), 'mod adresi #kesfet');
  ok(await page.locator('[data-ab-letter]').count() === 30, '30 harf ızgarada');
  await clearSpoken(page);
  await page.click('[data-ab-letter="V"]');
  await waitSpoken(page, () => window.__spoken.some((s) => s.text === 'der Vertrag'));
  const d = await page.textContent('[data-ab-detail]');
  ok(d.includes('fau') && d.includes('Vertrag') && d.includes('sözleşme') && d.includes('fertraak'), 'V: okunuş, yetişkin örneği, anlam, kelime okunuşu');
  const sp = await spoken(page);
  ok(sp.some((s) => s.text === 'Vau' && s.lang === 'de-DE') && sp.some((s) => s.text === 'der Vertrag'), 'harf adı (Vau) ve örnek kelime Almanca okunuyor');
  ok(sp.every((s) => s.local), 'sadece cihazdaki sesler');
  ok(await page.locator('.ab-bonus').count() === 1 && (await page.textContent('.ab-bonus')).includes('ei'), 'yetişkinde ei/ie bonus tablosu');
  await page.click('[data-ab-letter="ß"]');
  ok((await page.innerHTML('[data-ab-detail] .ab-example')).includes('<mark>ß</mark>'), 'ß: harf kelimenin içinde vurgulanıyor (Straße)');
  ok((await page.textContent('.ab-info')).includes('ae, oe, ue'), 'bilgi notu ae/oe/ue/ss');

  // Adult rounds.
  await page.goto(B + '#duy'); await page.waitForSelector('.ab-qtitle');
  ok(await page.locator('[data-ab-opt]').count() === 4, 'yetişkin: 4 seçenek');
  const optH = await page.$eval('[data-ab-opt]', (e) => e.getBoundingClientRect().height);
  ok(optH >= 48, `yetişkin seçenek yüksekliği ≥ 48 (${optH})`);
  await clearSpoken(page);
  await page.click('[data-ab-play]');
  await waitSpoken(page, () => window.__spoken.length >= 1);
  await page.waitForTimeout(150);
  ok((await spoken(page)).length === 1, 'Dinle düğmesi harf adını okuyor');
  await answerRight(page);
  ok((await page.textContent('[data-ab-feedback]')).includes('Richtig!') && (await page.textContent('[data-ab-feedback]')).includes('Doğru!'), 'doğru: Richtig! / Doğru!');
  ok((await page.evaluate(() => document.activeElement?.dataset.abNext !== undefined)), 'odak Devam düğmesinde');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.ab-count:has-text("Soru 2")');
  ok(true, 'Enter ile sonraki soru');
  await answerWrong(page);
  const fb = await page.textContent('[data-ab-feedback]');
  ok(fb.includes('Doğru cevap') && fb.includes('okunuşu') && /💡/.test(fb), 'yanlış: doğru cevap, okunuş ve ipucu');
  ok(await page.locator('.ab-option.is-right').count() === 1 && await page.locator('.ab-option.is-wrong').count() === 1, 'yanlış ve doğru seçenek işaretli');
  await page.click('[data-ab-next]');
  for (let i = 2; i < 10; i++) { await answerRight(page); await page.click('[data-ab-next]'); }
  await page.waitForSelector('.ab-result');
  const res = await page.textContent('.ab-result');
  ok(res.includes('9 / 10') && res.includes('puan'), 'sonuç: 9 / 10 ve puan');
  ok(await page.locator('.ab-star.is-on').count() === 3, '9/10 → 3 yıldız');
  ok(await page.locator('[data-ab-again-round]').count() === 1 && await page.locator('[data-ab-hard]').count() === 1, 'Tekrar oyna ve Zor harflerimi çalış');
  const hard = await page.$$eval('.ab-result .ab-chip', (els) => els.map((e) => e.textContent.trim()));
  await page.click('[data-ab-hard]'); await page.waitForSelector('.ab-qtitle');
  const hardAnswers = [];
  for (let i = 0; i < 3; i++) { hardAnswers.push(await answerOf(page)); await answerRight(page); await page.click('[data-ab-next]'); }
  ok(hard.length >= 1 && (await page.textContent('.ab-qtitle')) === 'Duy ve Seç', `zor harf turu açıldı (${hardAnswers} / ${hard})`);

  // Adult first letter, spelling with ae/oe/ss and the helper keys, Enter submission.
  await page.goto(B + '#ilk-harf'); await page.waitForSelector('.ab-word');
  await answerRight(page);
  ok((await page.textContent('[data-ab-feedback]')).includes('Richtig'), 'İlk Harf doğru');
  await page.goto(B + '#heceleme'); await page.waitForSelector('#abSpell');
  ok(await page.evaluate(() => document.activeElement?.id === 'abSpell'), 'heceleme: odak yazı alanında');
  ok(await page.locator('.ab-scene').count() + await page.locator('.ab-prompt .ab-muted').count() >= 1, 'heceleme: senaryo ya da anlam');
  await page.click('[data-ab-key="ä"]');
  ok((await page.inputValue('#abSpell')) === 'ä', 'Ä/Ö/Ü/ß yardımcı tuşu yazıyor');
  const target = await answerOf(page);
  const alt = target.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss').toLocaleUpperCase('de-DE');
  await page.fill('#abSpell', alt); await page.press('#abSpell', 'Enter');
  ok((await page.textContent('[data-ab-feedback]')).includes('Richtig'), `büyük harf ve ae/oe/ue/ss yazımı kabul (${alt})`);
  await page.click('[data-ab-next]'); await page.waitForSelector('#abSpell:not([disabled])');
  await page.fill('#abSpell', 'qqq'); await page.press('#abSpell', 'Enter');
  const sfb = await page.textContent('[data-ab-feedback]');
  ok(sfb.includes('Doğru yazılış') && sfb.includes('Senin cevabın: qqq'), 'yanlış heceleme (Enter): doğru yazılış ve senin cevabın');
  await page.click('[data-ab-next]');
  await page.waitForSelector('#abSpell:not([disabled])');
  await page.press('#abSpell', 'Enter');
  ok((await page.textContent('[data-ab-feedback]')) === '', 'boş cevapla Enter bir şey göndermiyor');

  // Order with the keyboard (← →) and with a mouse drag.
  await page.goto(B + '#sirala'); await page.waitForSelector('[data-ab-pos]');
  ok(await page.locator('[data-ab-pos]').count() === 5, 'yetişkin: 5 harf sıralama');
  for (let guard = 0; guard < 40; guard++) {
    const cur = await page.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
    const sorted = [...cur].sort();
    const i = cur.findIndex((x, k) => x !== sorted[k]);
    if (i < 0) break;
    const j = cur.indexOf(sorted[i]);
    await page.focus(`[data-ab-pos="${j}"]`); await page.keyboard.press('ArrowLeft');
  }
  ok(await page.evaluate(() => document.activeElement?.dataset.abPos !== undefined), 'oklarla taşırken odak harfte kalıyor');
  await page.click('[data-ab-check]');
  ok((await page.textContent('[data-ab-feedback]')).includes('Richtig'), 'klavyeyle sıralama doğru');
  await page.click('[data-ab-next]'); await page.waitForSelector('[data-ab-pos]:not([disabled])');
  const before = await page.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
  // The smooth scroll to the previous "Devam" button may still be running: measure the tiles once it has stopped.
  await page.waitForFunction(() => new Promise((r) => { const y = scrollY; setTimeout(() => r(scrollY === y), 150); }));
  const a0 = await page.$('[data-ab-pos="0"]'); const a3 = await page.$('[data-ab-pos="3"]');
  const b0 = await a0.boundingBox(); const b3 = await a3.boundingBox();
  await page.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2); await page.mouse.down();
  await page.mouse.move(b3.x + b3.width / 2, b3.y + b3.height / 2, { steps: 8 }); await page.mouse.up();
  const after = await page.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
  ok(after.join() === [before[1], before[2], before[3], before[0], before[4]].join(), `sürükle-bırak taşıyor (${before} → ${after})`);
  ok(await page.locator('.ab-ordertile.is-picked').count() === 0, 'sürüklemeden sonra seçili harf kalmıyor');

  // Profile switch: children's progress is separate.
  await page.goto(B);  await page.waitForSelector('.ab-modes');
  const adultLearned = await page.textContent('.ab-progress');
  await page.click('[data-ab-profile]'); await pick(page, 'cocuk');
  ok((await page.getAttribute('#alfabeApp', 'data-profil')) === 'cocuk', 'profil değiştirildi');
  ok((await page.textContent('.ab-progress')).includes('0 / 30') && !adultLearned.includes('0 / 30'), `ilerleme profil başına ayrı (${adultLearned.trim()})`);
  ok(await page.locator('[data-ab-timed]').count() === 0, 'çocukta Zamana Karşı yok');
  const store = await page.evaluate(() => JSON.parse(localStorage.getItem('baAlfabe')));
  ok(store.profil === 'cocuk' && Object.keys(store.p.yetiskin.stats).length > 0 && Object.keys(store.p.cocuk.stats).length === 0, 'localStorage: profil başına ayrı kayıt');
  await page.screenshot({ path: path.join(shotDir, 'menu-cocuk-1280.png'), fullPage: true });

  // Children: 3 options, 64px, Turkish instruction spoken, stars, no penalty.
  await clearSpoken(page);
  await page.click('[data-ab-mode="duy"]'); await page.waitForSelector('.ab-qtitle');
  ok(await page.locator('[data-ab-opt]').count() === 3, 'çocuk: 3 seçenek');
  const kidH = await page.$eval('[data-ab-opt]', (e) => Math.min(e.getBoundingClientRect().height, e.getBoundingClientRect().width));
  ok(kidH >= 64, `çocuk dokunma alanı ≥ 64 (${kidH})`);
  ok(await page.locator('.ab-timer').count() === 0, 'çocukta süre yok');
  await waitSpoken(page, () => window.__spoken.some((s) => s.lang === 'de-DE'));
  const ks = await spoken(page);
  ok(ks.some((s) => s.lang === 'tr-TR' && s.text.includes('Dinle')) && ks.some((s) => s.lang === 'de-DE'), 'çocuk: Türkçe talimat sesli + Almanca harf adı');
  await answerWrong(page);
  ok((await page.textContent('[data-ab-feedback]')).includes('Neredeyse'), 'çocuk: cezalandırıcı olmayan geri bildirim');
  ok((await page.textContent('.ab-qstars')).includes('0'), 'yanlışta yıldız kaybı yok');
  await page.click('[data-ab-next]');
  for (let i = 1; i < 10; i++) { await answerRight(page); await page.click('[data-ab-next]'); }
  await page.waitForSelector('.ab-result');
  ok((await page.textContent('.ab-stars')).includes('9'), 'çocuk: 9 yıldız toplandı');
  await page.screenshot({ path: path.join(shotDir, 'sonuc-cocuk-1280.png') });

  // Children spelling with letter buttons, first letter, order with taps.
  await page.goto(B + '#heceleme'); await page.waitForSelector('[data-ab-tile]');
  ok(await page.locator('#abSpell').count() === 0, 'çocuk hecelemede klavye alanı yok, harf düğmeleri var');
  await playRound(page, [3]);
  ok((await page.textContent('.ab-result-score')).includes('9 / 10'), 'çocuk heceleme turu tamamlandı');
  await page.goto(B + '#ilk-harf'); await page.waitForSelector('.ab-big-emoji');
  await playRound(page);
  ok((await page.textContent('.ab-result-score')).includes('10 / 10'), 'çocuk İlk Harf 10/10');
  await page.goto(B + '#sirala'); await page.waitForSelector('[data-ab-pos]');
  ok(await page.locator('[data-ab-pos]').count() === 4, 'çocuk: 4 harf sıralama');
  await playRound(page, [0]);
  ok((await page.textContent('.ab-result-score')).includes('9 / 10'), 'çocuk Sıraya Diz turu tamamlandı (dokunarak değiştirme)');
  await ctx.close();
}

// 1b. Exercises page (A1): "Almanca Alfabe" card next to Artikel Evleri, in all three languages, no overflow on a phone.
for (const [lang, title, width] of [[null, 'Almanca Alfabe', 1280], ['de', 'Deutsches Alphabet', 390], ['en', 'German Alphabet', 320]]) {
  const { ctx, page } = await newPage({ width });
  if (lang) await page.addInitScript((l) => { try { localStorage.setItem('baLang', l); } catch (_) {} }, lang);
  await page.goto((process.env.BASE || 'http://localhost:8765') + '/index.html#exercises');
  await page.waitForSelector('.kids-card [data-alfabe-game]');
  ok((await page.textContent('#alfabeCardTitle')).trim() === title, `alıştırmalar: Alfabe kartı (${lang || 'tr'})`);
  ok(await page.locator('.kids-card').count() === 2 && await page.locator('[data-kids-game][href="#artikel-evleri"]').count() === 1, 'Artikel Evleri kartı yerinde, iki kart');
  ok(await overflow(page) <= 0, `alıştırmalar ${width}px: yatay kaydırma yok`);
  if (!lang) {
    await page.locator('.kids-card').last().screenshot({ path: path.join(shotDir, 'alistirmalar-kart.png') });
    await page.click('[data-alfabe-game]');
    await page.waitForSelector('[data-ab-pick]');
    ok(new URL(page.url()).pathname === '/almanca-alfabe/', 'kart oyunu açıyor');
  }
  await ctx.close();
}

// 2. Time attack: a question that runs out of time counts as wrong and shows the answer.
{
  const { ctx, page } = await newPage({ clock: true });
  await page.goto(B); await page.waitForSelector('[data-ab-pick]'); await pick(page, 'yetiskin');
  await page.check('[data-ab-timed]');
  await page.click('[data-ab-mode="duy"]'); await page.waitForSelector('.ab-timer');
  await page.clock.runFor(11000);
  const t = await page.textContent('[data-ab-feedback]');
  ok(t.includes('Süre doldu') && t.includes('Doğru cevap'), 'Zamana Karşı: süre dolunca doğru cevap gösteriliyor');
  await page.click('[data-ab-next]');
  await answerRight(page);
  ok(/\+1\d|\+20/.test(await page.textContent('[data-ab-feedback]')), 'Zamana Karşı: kalan saniyeler puana ekleniyor');
  await ctx.close();
}

// 3. No German voice on the device: warning, silent, text fallback. Sound off hides nothing from the game.
{
  const { ctx, page } = await newPage({ voice: false });
  await page.goto(B + '#duy'); await page.waitForSelector('[data-ab-pick]'); await pick(page, 'cocuk');
  await page.waitForTimeout(1700);
  ok(await page.isVisible('[data-ab-novoice]'), 'ses yok: Türkçe uyarı');
  ok(await page.isVisible('[data-ab-textfallback]'), 'ses yok: okunuş yazıyla gösteriliyor');
  ok((await spoken(page)).length === 0, 'çevrim içi ses kullanılmıyor');
  await answerWrong(page).catch(() => {});
  await ctx.close();
}
{
  const { ctx, page } = await newPage();
  await page.goto(B); await page.waitForSelector('[data-ab-pick]'); await pick(page, 'yetiskin');
  await page.click('[data-ab-sound]');
  ok((await page.getAttribute('[data-ab-sound]', 'aria-pressed')) === 'false', 'ses kapatma düğmesi');
  await page.click('[data-ab-slow]');
  await page.click('[data-ab-sound]');
  await page.click('[data-ab-mode="kesfet"]'); await page.waitForSelector('.ab-grid');
  await clearSpoken(page);
  await page.click('[data-ab-letter="W"]');
  await waitSpoken(page, () => window.__spoken.length >= 2);
  ok((await spoken(page)).length >= 2 && (await spoken(page)).every((s) => s.rate === 0.7), 'yavaş oku: rate 0.7');
  await ctx.close();
}

// 3b. Recorded files (audio/alfabe/): played with HTMLAudioElement, one at a time, only after the first touch,
// slow = playbackRate 0.75 with the pitch kept, a pause between spelled letters, the device voice when a file fails.
// The test files are short tones made with ffmpeg; the list (manifest) names every clip of the game.
const hasFfmpeg = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' }).status === 0;
if (!hasFfmpeg) console.log('skip ses dosyaları: ffmpeg yok');
else {
  const logicCtx = { window: {} }; vm.createContext(logicCtx);
  vm.runInContext(fs.readFileSync('js/alfabe-logic.js', 'utf8'), logicCtx);
  const clips = JSON.parse(JSON.stringify(logicCtx.window.baAlfabeLogic.audioClips(data)));
  const toneFile = path.join(shotDir, 'ton.mp3');
  spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', 'sine=frequency=500:duration=0.12', '-ac', '1', '-b:a', '48k', toneFile]);
  const tone = fs.readFileSync(toneFile);
  const manifestBody = JSON.stringify({ clips: Object.fromEntries(clips.map((c) => [c.id, { file: c.file, lang: c.lang, kind: c.kind, text: c.text, audioHash: 't1', bytes: tone.length, source: 'test' }])) });
  const requested = [];
  const withFiles = (broken = []) => async (ctx) => {
    await ctx.route('**/audio/alfabe/manifest.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: manifestBody }));
    await ctx.route('**/audio/alfabe/*/*.mp3*', (r) => {
      const file = new URL(r.request().url()).pathname.replace('/audio/alfabe/', '');
      requested.push(file);
      if (broken.some((id) => file.endsWith('/' + id + '.mp3'))) return r.fulfill({ status: 404, body: '' });
      return r.fulfill({ status: 200, contentType: 'audio/mpeg', body: tone });
    });
    await ctx.addInitScript(() => {
      window.__played = []; window.__overlap = 0;
      const all = new Set();
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        all.add(this);
        for (const a of all) if (a !== this && !a.paused) window.__overlap++;
        window.__played.push({ file: decodeURIComponent(new URL(this.src).pathname.replace('/audio/alfabe/', '')), v: new URL(this.src).searchParams.get('v'), rate: this.playbackRate, pitch: this.preservesPitch, t: performance.now() });
        return play.call(this);
      };
    });
  };
  const played = (p) => p.evaluate(() => window.__played.map((x) => x.file));
  const clearPlayed = (p) => p.evaluate(() => { window.__played.length = 0; window.__spoken.length = 0; });
  const waitPlayed = (p, file) => p.waitForFunction((f) => window.__played.some((x) => x.file === f), file, { timeout: 5000 }).then(() => true, () => false);

  // Children, opened directly on #duy: nothing plays before the first touch, then the recorded files and no device voice.
  {
    const { ctx, page } = await newPage({ audio: withFiles() });
    await page.addInitScript(() => { try { if (!localStorage.getItem('baAlfabe')) localStorage.setItem('baAlfabe', JSON.stringify({ profil: 'cocuk' })); } catch (_) {} });
    await page.goto(B + '#duy'); await page.waitForSelector('.ab-qtitle');
    await page.waitForTimeout(1200);
    ok((await played(page)).length === 0 && (await spoken(page)).length === 0, 'ses dosyası: ilk dokunuştan önce hiçbir şey çalmıyor');
    ok(requested.some((f) => /^de\/harf-/.test(f)), 'sık kullanılan sesler (harf adları) önceden yükleniyor');
    await page.click('[data-ab-play]');
    ok(await page.waitForFunction(() => window.__played.some((x) => /^de\/harf-/.test(x.file)), null, { timeout: 5000 }).then(() => true, () => false), 'Dinle: harf adı dosyadan çalıyor');
    const first = (await page.evaluate(() => window.__played[0]));
    ok(first.v === 't1' && first.rate === 1, `dosya sürüm parametresiyle (?v=${first.v}) ve normal hızda`);
    ok((await spoken(page)).length === 0, 'dosya varken cihaz sesi kullanılmıyor');
    // Wrong answer: "Doğru cevap:" in Turkish, then the letter.
    const letterFile = (await played(page)).find((f) => /^de\/harf-/.test(f));
    const answer = clips.find((c) => c.file === letterFile).id;
    await clearPlayed(page);
    const wrong = await page.$$eval('[data-ab-opt]', (els, a) => els.map((e) => e.dataset.abOpt).find((x) => 'harf-' + x.toLowerCase() !== a && !(x === 'Ä' && a === 'harf-ae') && !(x === 'Ö' && a === 'harf-oe') && !(x === 'Ü' && a === 'harf-ue') && !(x === 'ß' && a === 'harf-eszett')), answer);
    await page.click(`[data-ab-opt="${wrong}"]`);
    ok(await waitPlayed(page, letterFile), 'yanlış cevap: önce "Doğru cevap:" sonra harf');
    ok(JSON.stringify((await played(page)).slice(0, 2)) === JSON.stringify(['tr/dogru-cevap.mp3', letterFile]), `sıra: ${(await played(page)).slice(0, 2)}`);
    await ctx.close();
  }

  // Adults: explore, slow, one sound at a time, spelling with pauses, a missing file falls back to the device voice.
  {
    const { ctx, page } = await newPage({ audio: withFiles(['harf-q']) });
    await page.goto(B); await page.waitForSelector('[data-ab-pick]'); await pick(page, 'yetiskin');
    await page.click('[data-ab-mode="kesfet"]'); await page.waitForSelector('.ab-grid');
    await clearPlayed(page);
    await page.click('[data-ab-letter="V"]');
    ok(await waitPlayed(page, 'de/kelime-der-vertrag.mp3'), 'Keşfet: harf adı ve örnek kelime artikelle (der Vertrag) dosyadan');
    ok(JSON.stringify(await played(page)) === JSON.stringify(['de/harf-v.mp3', 'de/kelime-der-vertrag.mp3']), 'önce "Vau", sonra "der Vertrag"');
    // A new sound stops the previous one: V then W at once → W's clips, never two at the same time.
    await clearPlayed(page);
    await page.click('[data-ab-letter="V"]'); await page.click('[data-ab-letter="W"]');
    ok(await waitPlayed(page, 'de/kelime-die-wohnung.mp3'), 'ikinci harf çalıyor');
    await page.waitForTimeout(600);
    const seq = await played(page);
    ok(!seq.slice(seq.indexOf('de/harf-w.mp3')).includes('de/kelime-der-vertrag.mp3'), `yeni ses öncekini durduruyor (${seq})`);
    ok((await page.evaluate(() => window.__overlap)) === 0, 'aynı anda iki ses çalmıyor');
    // A file that cannot be loaded: the device voice says "Kuh".
    await clearPlayed(page);
    await page.click('[data-ab-letter="Q"]');
    ok(await waitSpoken(page, () => window.__spoken.some((s) => s.text === 'Kuh')), 'dosya yüklenemezse cihaz sesi: Q → "Kuh"');
    ok(await waitPlayed(page, 'de/kelime-die-quittung.mp3'), 'sonraki parça yine dosyadan');
    // Slow: playbackRate 0.75, pitch kept.
    await page.click('[data-ab-slow]');
    await clearPlayed(page);
    await page.click('[data-ab-letter="Z"]');
    await waitPlayed(page, 'de/harf-z.mp3');
    const slow = await page.evaluate(() => window.__played[0]);
    ok(slow.rate === 0.75 && slow.pitch === true, `yavaş oku: playbackRate ${slow.rate}, preservesPitch ${slow.pitch}`);
    await page.click('[data-ab-slow]');
    // Spelling: letters one after another with a pause.
    await page.goto(B + '#heceleme'); await page.waitForSelector('#abSpell');
    await clearPlayed(page);
    await page.click('[data-ab-play]');
    const spelled = (await page.textContent('[data-ab-spelled]')).trim().split(' – ');
    const lastName = spelled[spelled.length - 1];
    const lastLetter = byName[lastName];
    const lastFile = lastLetter ? clips.find((c) => c.kind === 'harf' && c.text === (lastLetter.soyle || lastLetter.ad)).file : clips.find((c) => c.kind === 'isaret' && c.text === lastName).file;
    // Wait for every clip (question + letters): the last letter can also occur earlier in the word (Gartenstraße).
    const expected = spelled.length + (await page.locator('.ab-scene').count());
    await page.waitForFunction((n) => window.__played.length >= n, expected, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(300);
    const times = await page.evaluate(() => window.__played.map((x) => x.t));
    const files = await played(page);
    const gaps = times.slice(2).map((t, i) => t - times[i + 1]);
    const scene = await page.locator('.ab-scene').count() === 1;
    ok((scene ? files[0].startsWith('de/soru-') : true) && files.length === spelled.length + (scene ? 1 : 0) && files[files.length - 1] === lastFile, `heceleme: ${scene ? 'önce soru, sonra ' : ''}${spelled.length} harf (${files.slice(0, 4)}…)`);
    ok(gaps.length > 0 && Math.min(...gaps) >= 380, `harfler arasında doğal duraklama (en kısa ${Math.round(Math.min(...gaps))} ms)`);
    // Sound off: nothing plays.
    await page.goto(B + '#kesfet'); await page.waitForSelector('.ab-grid');
    await page.click('[data-ab-sound]');
    await clearPlayed(page);
    await page.click('[data-ab-letter="A"]');
    await page.waitForTimeout(500);
    ok((await played(page)).length === 0 && (await spoken(page)).length === 0, 'ses kapalıyken hiçbir şey çalmıyor');
    ok((await page.evaluate(() => JSON.parse(localStorage.getItem('baAlfabe')).ses)) === false, 'ses tercihi saklanıyor');
    await ctx.close();
  }

  // The check page (tools/audio-check.html): every clip with its file and text, playable.
  {
    const { ctx, page } = await newPage({ audio: withFiles() });
    await page.goto(B.replace('/almanca-alfabe/', '/tools/audio-check.html'));
    await page.waitForSelector('[data-play]');
    ok(await page.locator('#acRows tr').count() === clips.length, `kontrol sayfası: ${clips.length} klip listeleniyor`);
    ok((await page.textContent('#acRows')).includes('de/harf-v.mp3') && (await page.textContent('#acRows')).includes('/faʊ/'), 'dosya adı, metin ve IPA görünüyor');
    await clearPlayed(page);
    await page.click('[data-play="harf-v"]');
    ok(await waitPlayed(page, 'de/harf-v.mp3'), 'kontrol sayfasında dinleme');
    ok(await page.evaluate(() => document.querySelector('meta[name="robots"]').content.includes('noindex')), 'kontrol sayfası noindex');
    await ctx.close();
  }
  ok(/^exclude:\s*\n(\s*-.*\n)*\s*-\s*tools\s*$/m.test(fs.readFileSync('_config.yml', 'utf8')), 'tools/ yayına girmiyor (_config.yml exclude)');
}

// 3c. tools/audio-check-offline.html, opened from disk (file://): every clip inside, judging, notes, letter choice,
// "Sonuçları kopyala"; no network at all; phone width and dark mode.
{
  const offline = 'file://' + path.resolve('tools/audio-check-offline.html');
  for (const [width, scheme] of [[1280, 'light'], [375, 'dark']]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
    const net = [];
    await ctx.route('**/*', (r) => { const u = r.request().url(); if (!u.startsWith('file:') && !u.startsWith('data:')) net.push(u); return u.startsWith('file:') || u.startsWith('data:') ? r.continue() : r.abort(); });
    await ctx.addInitScript(() => {
      window.__played = [];
      const pl = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { const a = this; window.__played.push(a.src.slice(0, 30)); const r = pl.call(this); a.addEventListener('ended', () => window.__played.push('ended'), { once: true }); return r; };
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(offline);
    await page.waitForSelector('.item');
    const label = `çevrimdışı ${width}px ${scheme}`;
    if (width === 1280) {
      const titles = await page.$$eval('h2', (h) => h.map((x) => x.textContent));
      ok(['Harf adları', 'Çocuk kelimeleri', 'Yetişkin kelimeleri', 'Heceleme', 'Türkçe talimat'].every((t) => titles.some((x) => x.startsWith(t))), `${label}: beş grup (${titles.length})`);
      ok(await page.locator('#g-harf ~ .list .letter').count() === 30 && await page.locator('.letter').first().locator('.item').count() === 4, 'harf adları alternatifleriyle yan yana (oyundaki + 3)');
      ok((await page.textContent('#groups')).includes('audio/alfabe/de/kelime-die-gabel.mp3') && !(await page.textContent('#groups')).includes('Giraffe'), 'G çocuk örneği: die Gabel (Giraffe yok)');
      const v = page.locator('.letter', { hasText: 'Vau' });
      ok((await v.textContent()).includes('audio/alfabe/de/harf-v.mp3') && (await v.textContent()).includes('okunan metin: Fau.'), 'okunan metin ve dosya adı görünüyor');
      await v.locator('.item').first().locator('.play button').first().click();
      ok(await page.waitForFunction(() => window.__played.includes('ended'), null, { timeout: 5000 }).then(() => true, () => false), 'gömülü ses çalıyor (data:audio/mpeg)');
      ok((await page.evaluate(() => window.__played[0])).startsWith('data:audio/mpeg;base64,'), 'ses dosyanın içinden');
      // Bad + note on the game's V, choose alternative 2 ([[ fˈaʊ ]]), good on a Turkish clip, a note without judgement.
      await v.locator('.item').first().locator('button.b').click();
      await v.locator('.item').first().locator('textarea').fill('çok kısa, "fau" daha uzun olsun');
      await v.locator('.item').nth(2).locator('input[type=radio]').check();
      const tr = page.locator('.item', { hasText: 'tr/aferin.mp3' });
      await tr.locator('button.g').click();
      await page.locator('.item', { hasText: 'de/kelime-der-vogel.mp3' }).locator('textarea').fill('iyi ama biraz hızlı');
      // A spelling sequence plays several clips in a row.
      await page.evaluate(() => { window.__played.length = 0; });
      await page.locator('.item', { hasText: 'Heceleme dizisi: Jana' }).locator('.play button').click();
      ok(await page.waitForFunction(() => window.__played.filter((x) => x === 'ended').length >= 4, null, { timeout: 8000 }).then(() => true, () => false), 'heceleme dizisi harf harf çalıyor (Jana: 4 harf)');
      await page.reload(); await page.waitForSelector('.item');
      ok(await page.locator('.letter', { hasText: 'Vau' }).locator('.item').first().evaluate((e) => e.classList.contains('is-bad')), 'işaretler yeniden açınca duruyor');
      await page.click('#copy');
      const out = await page.inputValue('#out');
      ok(/KÖTÜ \(1\):\n- audio\/alfabe\/de\/harf-v\.mp3 · “Oyundaki: Fau\.” · not: çok kısa/.test(out), 'sonuç: kötü işaretlenen ve notu');
      ok(/- Vau: \[\[ fˈaʊ \]\] \(tools\/audio-alternatifler\/de\/harf-v--2\.mp3\) ← DEĞİŞTİR/.test(out), 'sonuç: seçilen harf alternatifi');
      ok(/NOTLAR .*\n- audio\/alfabe\/de\/kelime-der-vogel\.mp3 .*iyi ama biraz hızlı/.test(out), 'sonuç: diğer notlar');
      ok(/iyi 1 · kötü 1/.test(out), 'sonuç: özet sayıları');
      ok(await page.waitForFunction(() => document.getElementById('copied').textContent.length > 0, null, { timeout: 4000 }).then(() => true, () => false), '"Sonuçları kopyala" geri bildirim veriyor');
      await page.screenshot({ path: path.join(shotDir, 'offline-1280.png') });
    } else {
      ok(await overflow(page) <= 0, `${label}: yatay kaydırma yok`);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      ok(bg === 'rgb(22, 26, 20)', `${label}: koyu tema (${bg})`);
      await page.screenshot({ path: path.join(shotDir, 'offline-375-dark.png') });
    }
    ok(net.length === 0, `${label}: dışarıya istek yok ${net.slice(0, 2)}`);
    ok(errs.length === 0, `${label}: hata yok ${errs.slice(0, 2)}`);
    await ctx.close();
  }
}

// 4. Storage blocked: the game opens and plays, nothing breaks.
{
  const { ctx, page } = await newPage({ blockStorage: true });
  await page.goto(B); await page.waitForSelector('[data-ab-pick]'); await pick(page, 'cocuk');
  await page.click('[data-ab-mode="duy"]'); await page.waitForSelector('.ab-qtitle');
  await answerRight(page);
  ok((await page.textContent('[data-ab-feedback]')).includes('Richtig'), 'depolama kapalıyken oyun çalışıyor');
  await ctx.close();
}

// 5. Widths, themes, reduced motion.
for (const width of [320, 390, 1280]) {
  for (const theme of ['light', 'dark']) {
    const { ctx, page } = await newPage({ width, theme, reducedMotion: 'reduce' });
    await page.goto(B); await page.waitForSelector('[data-ab-pick]');
    let o = await overflow(page);
    await pick(page, width === 390 ? 'yetiskin' : 'cocuk');
    o = Math.max(o, await overflow(page));
    for (const m of ['kesfet', 'duy', 'ilk-harf', 'heceleme', 'sirala']) {
      await page.goto(B + '#' + m); await page.waitForSelector('.ab-grid, .ab-qtitle');
      if (m === 'kesfet') await page.click('[data-ab-letter="Ü"]');
      else { await answerWrong(page); }
      o = Math.max(o, await overflow(page));
      if (m === 'heceleme' || m === 'kesfet') await page.screenshot({ path: path.join(shotDir, `${m}-${width}-${theme}.png`), fullPage: width < 400 });
    }
    ok(o <= 0, `${width}px ${theme}: yatay kaydırma yok (${o})`);
    if (width === 320 && theme === 'dark') {
      const anim = await page.$eval('[data-ab-feedback] .ab-fb-title', (e) => getComputedStyle(e).animationName);
      ok(anim === 'none', 'prefers-reduced-motion: animasyon yok');
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      ok(bg !== 'rgb(221, 214, 198)', 'koyu tema uygulanıyor');
    }
    await ctx.close();
  }
}

ok(external.length === 0, 'dışarıya istek yok: ' + external.slice(0, 3).join(', '));
ok(errors.length === 0, 'konsol hatası yok: ' + errors.slice(0, 3).join(' | '));
await browser.close();
console.log(`\nEkran görüntüleri: ${shotDir}`);
if (fails.length) { console.log(`\n${fails.length} FAIL`); process.exit(1); }
console.log('\nHepsi geçti.');
