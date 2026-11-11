// Almanca Alfabe oyunu (/almanca-alfabe/): profil seçimi ve hatırlanması, profil başına ayrı ilerleme, beş mod, doğru/yanlış
// geri bildirim (Enter ile gönderme dahil), sonuç ekranı ve "Zor harflerimi çalış", Zamana Karşı, ses yok / ses kapalı,
// depolama kapalıyken çalışma, dışarıya istek olmaması, 320/390/1280 px açık/koyu taşma, dokunma alanları, reduced motion.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/alfabe.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = (process.env.BASE || 'http://localhost:8765') + '/almanca-alfabe/';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'alfabe-'));
const data = JSON.parse(fs.readFileSync('data/alfabe.json', 'utf8'));
const byName = Object.fromEntries(data.harfler.map((l) => [l.ad, l]));
const signs = Object.fromEntries(Object.entries(data.isaretler).map(([ch, s]) => [s.ad, ch]));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const external = [];
const browser = await chromium.launch();
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function newPage({ width = 1280, theme = 'light', voice = true, blockStorage = false, reducedMotion = 'no-preference', clock = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
  await ctx.route('**/*', (r) => { const u = new URL(r.request().url()); if (u.hostname !== 'localhost') { external.push(u.href); return r.abort(); } return r.continue(); });
  await ctx.addInitScript((t) => { try { if (!sessionStorage.getItem('i')) { sessionStorage.setItem('i', '1'); localStorage.setItem('ba-theme', t); } } catch (_) {} }, theme);
  await ctx.addInitScript((hasVoice) => {
    window.__spoken = [];
    const voices = hasVoice ? [{ lang: 'de-DE', localService: true, name: 'Test Deutsch' }, { lang: 'tr-TR', localService: true, name: 'Test Türkçe' },
      { lang: 'de-DE', localService: false, name: 'Online Deutsch' }] : [{ lang: 'de-DE', localService: false, name: 'Online Deutsch' }];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => voices, speak: (u) => window.__spoken.push({ text: u.text, lang: u.lang, rate: u.rate, local: u.voice.localService }), cancel() {}, addEventListener() {}
    } });
  }, voice);
  if (blockStorage) {
    await ctx.addInitScript(() => {
      Storage.prototype.getItem = function () { throw new DOMException('blocked', 'SecurityError'); };
      Storage.prototype.setItem = function () { throw new DOMException('blocked', 'SecurityError'); };
    });
  }
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return { ctx, page };
}
const spoken = (p) => p.evaluate(() => window.__spoken.slice());
const clearSpoken = (p) => p.evaluate(() => { window.__spoken.length = 0; });
async function pick(p, profile) { await p.click(`[data-ab-pick="${profile}"]`); await p.waitForSelector('.ab-modes, .ab-qhead, .ab-grid'); }

// The answer of the current question, read the way a learner would: from what was said or shown.
async function answerOf(p) {
  const title = (await p.textContent('.ab-qtitle')).trim();
  if (title === 'Duy ve Seç') { const s = await spoken(p); const name = s.filter((x) => byName[x.text]).pop().text; return byName[name].id; }
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
  // No fixed delays: measure only once the new tiles are enabled and have not moved for two animation frames
  // (scrolling or re-rendering after "next" would otherwise make the mouse press beside the tile).
  await page.waitForFunction(() => new Promise((resolve) => {
    const tiles = () => [...document.querySelectorAll('[data-ab-pos]')];
    const where = () => tiles().map((t) => { const r = t.getBoundingClientRect(); return `${r.x},${r.y},${r.width}`; }).join('|');
    const first = where();
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(tiles().length === 5 && !tiles().some((t) => t.disabled) && where() === first)));
  }), null, { timeout: 10000 });
  const before = await page.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
  const want = [before[1], before[2], before[3], before[0], before[4]].join();
  const b0 = await page.locator('[data-ab-pos="0"]').boundingBox(); const b3 = await page.locator('[data-ab-pos="3"]').boundingBox();
  await page.mouse.move(b0.x + b0.width / 2, b0.y + b0.height / 2); await page.mouse.down();
  await page.mouse.move(b3.x + b3.width / 2, b3.y + b3.height / 2, { steps: 8 }); await page.mouse.up();
  // Wait for the redraw with the new order (condition, not a delay); on timeout the check below reports what is shown.
  await page.waitForFunction((w) => [...document.querySelectorAll('[data-ab-pos]')].map((e) => e.textContent.trim()).join() === w, want, { timeout: 5000 }).catch(() => {});
  const after = await page.$$eval('[data-ab-pos]', (els) => els.map((e) => e.textContent.trim()));
  ok(after.join() === want, `sürükle-bırak taşıyor (${before} → ${after})`);
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
  ok((await spoken(page)).every((s) => s.rate === 0.7), 'yavaş oku: rate 0.7');
  await ctx.close();
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
