// Artikel Evleri (#artikel-evleri): Alıştırmalar sayfasındaki "Çocuklar için" kartı, konu seçimi, ilk denemeye göre skor,
// en iyi skor (sadece localStorage), "Dinle" düğmesi (sadece kelime; artikel doğru cevaptan sonra), ses kapalı/ses yok,
// derin bağlantı, diller, kayıt yazılamazken çalışma, dışarıya gönderim olmaması, 390/1440 px açık/koyu.
// Çalıştırma: python3 -m http.server 8765 açıkken node tests/artikel-evleri.mjs (ekran görüntüleri $S ya da geçici klasör).
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const B = process.env.BASE || 'http://localhost:8765/index.html';
const shotDir = process.env.S || fs.mkdtempSync(path.join(os.tmpdir(), 'artikel-evleri-'));
const dict = JSON.parse(fs.readFileSync('data/sozluk.json', 'utf8')).words;
const game = JSON.parse(fs.readFileSync('data/cocuk/artikel-evleri.json', 'utf8'));

const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };
const errors = [];
const browser = await chromium.launch();
const overflow = (p) => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// voice: a German voice on the device (spoken texts go to window.__spoken) or none at all.
// files: 'none' (no list of recorded files: device voice only), 'real' (data/cocuk/ses), 'broken' (list there, files 404).
// Played files go to window.__played.
async function newPage({ width = 1280, theme = 'light', voice = true, lang = null, blockStorage = false, files = 'none' } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  if (files === 'none') await ctx.route('**/data/cocuk/sesler.json*', (r) => r.fulfill({ status: 404, body: '' }));
  if (files === 'broken') await ctx.route('**/data/cocuk/ses/*.mp3*', (r) => r.fulfill({ status: 404, body: '' }));
  await ctx.addInitScript(() => {
    window.__played = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { window.__played.push(decodeURIComponent(this.src.split('/').pop().split('?')[0])); return play.call(this); };
  });
  await ctx.addInitScript(([t, l]) => { try { if (!sessionStorage.getItem('i')) { sessionStorage.setItem('i', '1'); localStorage.setItem('ba-theme', t); if (l) localStorage.setItem('baLang', l); } } catch (_) {} }, [theme, lang]);
  if (voice) {
    await ctx.addInitScript(() => {
      window.__spoken = [];
      const v = { lang: 'de-DE', localService: true, name: 'Test Deutsch', voiceURI: 'test', default: false };
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
        getVoices: () => [v], speak: (u) => window.__spoken.push(u.text), cancel() {}, addEventListener() {}
      } });
    });
  } else {
    await ctx.addInitScript(() => {
      Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { getVoices: () => [], speak() { throw new Error('no voice'); }, cancel() {}, addEventListener() {} } });
    });
  }
  if (blockStorage) {
    // The game's own record is unreadable and cannot be written (full or blocked storage); the rest of the site is untouched.
    await ctx.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function (k) { return k === 'baKelimeOyunlari' ? '{bozuk' : get.call(this, k); };
      Storage.prototype.setItem = function (k, v) { if (k === 'baKelimeOyunlari') throw new DOMException('full', 'QuotaExceededError'); return set.call(this, k, v); };
    });
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  // In 'none' and 'broken' the 404s are made on purpose by the routes above.
  page.on('console', (m) => { if (m.type() === 'error' && !(files !== 'real' && /Failed to load resource.*404/.test(m.text()))) errors.push(m.text()); });
  return { ctx, page };
}
const currentWord = async (p) => (await p.locator('#aeWord').textContent()).trim().split(' ').pop();
const articleOf = (w) => dict[w].article;
async function playWord(p, { wrongFirst = false } = {}) {
  const w = await currentWord(p);
  const a = articleOf(w);
  if (wrongFirst) await p.click(`[data-ae-house="${['der', 'die', 'das'].find((x) => x !== a)}"]`);
  await p.click(`[data-ae-house="${a}"]`);
  return w;
}
async function playAll(p, wrongAt = []) {
  const n = await p.locator('#aeWord').count() ? 12 : 0;
  for (let i = 0; i < n; i++) {
    await playWord(p, { wrongFirst: wrongAt.includes(i) });
    await p.click('[data-ae-next]');
  }
}

// 1. Kart (sadece A1) ve konu seçimi.
const { ctx, page } = await newPage();
const requests = [];
page.on('request', (r) => requests.push({ url: r.url(), method: r.method() }));
await page.goto(B + '#exercises/A1'); await page.waitForTimeout(1500);
ok(await page.locator('.kids-card [data-kids-game][href="#artikel-evleri"]').count() === 1, 'A1 alıştırma listesinde "Çocuklar için" kartı');
ok((await page.textContent('.kids-card:has([data-kids-game])')).includes('Çocuklar için'), 'kartın başlığı "Çocuklar için"');
await page.locator('.kids-card:has([data-kids-game])').screenshot({ path: path.join(shotDir, 'kart-1440.png') });
await page.click('[data-hub-level="A2"]'); await page.waitForTimeout(300);
ok(await page.locator('.kids-card').count() === 0, 'A2 listesinde kart yok');
await page.click('[data-hub-level="A1"]'); await page.waitForTimeout(300);
await page.click('[data-kids-game]'); await page.waitForTimeout(1200);
ok(page.url().endsWith('#artikel-evleri') && (await page.textContent('#artikelApp h1')).includes('Artikel Evleri'), 'kart oyunu açıyor');
ok(await page.locator('.ae-theme').count() === game.themes.length && game.themes.length === 4, '4 konu seçilebiliyor');
ok((await page.textContent('#artikelApp')).includes('Hesap yok, form yok. Sadece en iyi skor bu cihazın tarayıcısında saklanır.'), 'gizlilik notu görünüyor');
for (const th of game.themes) {
  const c = th.words.reduce((m, w) => (m[dict[w].article]++, m), { der: 0, die: 0, das: 0 });
  ok(th.words.length >= 12 && c.der === c.die && c.die === c.das, `${th.id}: ${th.words.length} kelime, der/die/das ${c.der}/${c.die}/${c.das}`);
}
await page.screenshot({ path: path.join(shotDir, 'konular-1440-light.png'), fullPage: true });

// 2. Oyun: ilk kelimede önce yanlış, sonra doğru → ilk denemede sayılmaz.
await page.click('[data-ae-theme="yiyecekler"]'); await page.waitForTimeout(600);
ok(page.url().endsWith('#artikel-evleri/yiyecekler'), 'konu adresi #artikel-evleri/yiyecekler');
ok((await page.textContent('.ae-status')).includes('Kelime 1 / 12'), 'durum: Kelime 1 / 12');
const listen = page.locator('[data-ae-listen]');
ok(await listen.isVisible(), 'Almanca ses varsa "Dinle" düğmesi görünüyor');
const w1 = await currentWord(page);
await listen.click();
ok((await page.evaluate(() => window.__spoken.at(-1))) === w1, `"Dinle" sadece kelimeyi okuyor (${w1})`);
ok(!(await page.textContent('#aeWord')).match(/^(der|die|das) /), 'cevaptan önce artikel yazmıyor');
const wrong = ['der', 'die', 'das'].find((x) => x !== articleOf(w1));
await page.click(`[data-ae-house="${wrong}"]`); await page.waitForTimeout(100);
ok((await page.textContent('[data-ae-feedback]')).includes(`${wrong} değil`), 'yanlış evde "… değil. Başka bir ev dene."');
ok(await page.locator(`[data-ae-house="${wrong}"]`).isDisabled(), 'denenmiş ev kapanıyor');
ok((await page.evaluate(() => window.__spoken.length)) === 1, 'yanlış cevapta bir şey okunmuyor');
await page.screenshot({ path: path.join(shotDir, 'yanlis-1440-light.png') });
await page.click(`[data-ae-house="${articleOf(w1)}"]`); await page.waitForTimeout(100);
ok((await page.evaluate(() => window.__spoken.at(-1))) === `${articleOf(w1)} ${w1}`, 'doğru cevaptan sonra artikel ile okunuyor');
ok((await page.textContent('#aeWord')).startsWith(articleOf(w1)), 'doğru cevaptan sonra artikel yazıyor');
ok((await page.textContent('[data-ae-feedback]')).includes(`Evet! ${articleOf(w1)} ${w1} – ${dict[w1].tr.split(';')[0].trim()}`), 'doğru cevapta "Evet! artikel kelime – anlam"');
ok(!(await page.textContent('[data-ae-feedback]')).includes('İlk denemede bildin'), 'ikinci denemede "ilk denemede" yazmıyor');
ok((await page.textContent('[data-ae-score]')).includes('İlk denemede: 0'), 'ikinci denemedeki doğru sayılmıyor');
ok(await page.locator('.ae-win.is-on').count() === 1, 'bir pencere yandı');
await page.click('[data-ae-next]'); await page.waitForTimeout(100);
const w2 = await playWord(page);
ok((await page.textContent('[data-ae-feedback]')).includes('İlk denemede bildin'), 'ilk denemede doğru: "İlk denemede bildin."');
ok((await page.textContent('[data-ae-score]')).includes('İlk denemede: 1'), `ilk denemede doğru sayılıyor (${w2})`);
await page.screenshot({ path: path.join(shotDir, 'dogru-1440-light.png') });
await page.click('[data-ae-next]');
for (let i = 2; i < 12; i++) { await playWord(page); if (i < 11) await page.click('[data-ae-next]'); }
ok((await page.textContent('[data-ae-next]')).includes('Sonucu gör'), 'son kelimede "Sonucu gör"');
await page.click('[data-ae-next]'); await page.waitForTimeout(200);
ok((await page.textContent('[data-ae-end-score]')).trim() === "12 kelimeden 11'ini ilk denemede bildin.", `bitiş: "12 kelimeden 11'ini ilk denemede bildin." (${await page.textContent('[data-ae-end-score]')})`);
ok((await page.textContent('#artikelApp')).includes('En iyi skorun: 11 / 12') && !(await page.textContent('#artikelApp')).includes('Yeni rekor'), 'ilk oyunda en iyi skor 11, rekor yazısı yok');
ok(await page.locator('.ae-end .ae-win.is-on').count() === 12, 'bitişte 12 pencere yanık');
ok((await page.evaluate(() => JSON.parse(localStorage.getItem('baKelimeOyunlari')).best.yiyecekler)) === 11, 'en iyi skor tarayıcıda: 11');
await page.screenshot({ path: path.join(shotDir, 'bitis-1440-light.png') });

// 3. Yeniden oyna: hepsi ilk denemede → 12'sini, yeni rekor. Sonra kötü oyun en iyi skoru düşürmüyor.
await page.click('[data-ae-again]'); await page.waitForTimeout(100);
for (let i = 0; i < 12; i++) { await playWord(page); await page.click('[data-ae-next]'); }
ok((await page.textContent('[data-ae-end-score]')).includes("12 kelimeden 12'sini"), "ikinci oyun: 12'sini");
ok((await page.textContent('#artikelApp')).includes('Yeni rekor!') && (await page.textContent('#artikelApp')).includes('En iyi skorun: 12 / 12'), 'yeni rekor ve en iyi 12');
await page.click('[data-ae-again]'); await page.waitForTimeout(100);
for (let i = 0; i < 12; i++) { await playWord(page, { wrongFirst: i < 9 }); await page.click('[data-ae-next]'); }
ok((await page.textContent('[data-ae-end-score]')).includes("12 kelimeden 3'ünü"), "üçüncü oyun: 3'ünü");
ok((await page.textContent('#artikelApp')).includes('En iyi skorun: 12 / 12'), 'kötü oyun en iyi skoru düşürmüyor');
await page.click('[data-ae-other]'); await page.waitForTimeout(300);
ok(page.url().endsWith('#artikel-evleri') && (await page.textContent('[data-ae-theme="yiyecekler"]')).includes('En iyi: 12 / 12'), 'konu kartında en iyi skor');

// 4. Ses kapalı: "Dinle" gizli, ayar saklanıyor, hiçbir şey okunmuyor.
await page.click('[data-ae-theme="evde"]'); await page.waitForTimeout(300);
await page.click('[data-ae-sound]');
ok((await page.textContent('[data-ae-sound]')).includes('Ses kapalı') && !(await listen.isVisible()), 'ses kapalı: "Dinle" gizli');
const spokenBefore = await page.evaluate(() => window.__spoken.length);
await playWord(page);
ok((await page.evaluate(() => window.__spoken.length)) === spokenBefore, 'ses kapalıyken okunmuyor');
await page.reload(); await page.waitForTimeout(1500);
ok((await page.textContent('[data-ae-sound]')).includes('Ses kapalı'), 'ses ayarı yeniden yüklemede kalıyor');
ok(page.url().endsWith('#artikel-evleri/evde') && (await page.textContent('.ae-status')).includes('Evde'), 'derin bağlantı yeniden yüklemede konuyu açıyor');
await page.click('[data-ae-sound]');
ok(await listen.isVisible(), 'ses açılınca "Dinle" geri geliyor');
const out = requests.filter((r) => !r.url.startsWith('http://localhost:8765/') && !r.url.startsWith('data:'));
ok(out.every((r) => r.url.startsWith('https://bozkurtacademy.goatcounter.com/')) && !requests.some((r) => r.method !== 'GET'), `oyun dışarıya veri göndermiyor (yalnızca sayfa sayacı: ${out.length})`);
ok(requests.every((r) => !/goatcounter/.test(r.url) || !/sozluk|yiyecek|Apfel/.test(decodeURIComponent(r.url)) || /p=%2F%23artikel-evleri/.test(r.url)), 'sayaçta sadece sayfa adresi');
await ctx.close();

// 5. Ses dosyası listesi yok ve Almanca ses yok: not görünüyor, "Dinle" gizli, oyun hatasız oynanıyor.
{
  const { ctx, page } = await newPage({ voice: false, width: 390 });
  await page.goto(B + '#artikel-evleri/disarida'); await page.waitForTimeout(2200);
  ok(await page.locator('[data-ae-novoice]').isVisible(), 'ses yoksa "Almanca ses bulunamadı" notu');
  ok(!(await page.locator('[data-ae-listen]').isVisible()), 'ses yoksa "Dinle" gizli');
  await playWord(page, { wrongFirst: true }); await page.click('[data-ae-next]'); await playWord(page);
  ok((await page.textContent('[data-ae-score]')).includes('İlk denemede: 1'), 'ses yokken oyun devam ediyor');
  await page.click('[data-ae-sound]');
  ok(!(await page.locator('[data-ae-novoice]').isVisible()), 'ses kapatılınca not gizleniyor');
  await page.goto(B + '#artikel-evleri/olmayan-konu'); await page.waitForTimeout(800);
  ok(page.url().endsWith('#artikel-evleri') && await page.locator('.ae-theme').count() === 4, 'bilinmeyen konu konu seçimine dönüyor');
  await ctx.close();
}

// 5b. Kayıtlı ses dosyaları (data/cocuk/ses): önce dosya, dosyası olmayan ya da bozuk dosyada cihaz sesi.
{
  const audioList = JSON.parse(fs.readFileSync('data/cocuk/sesler.json', 'utf8')).files;
  const slug = (s) => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/ /g, '-');
  const { ctx, page } = await newPage({ files: 'real' });
  const reqs = [];
  page.on('request', (r) => reqs.push(r.url()));
  await page.goto(B + '#artikel-evleri/evde'); await page.waitForTimeout(1500);
  ok(await page.locator('[data-ae-credit]').count() === 1 && (await page.textContent('[data-ae-credit]')).includes('Thorsten-Voice (Thorsten Müller, CC0)'), 'oyunda ses atfı (Thorsten-Voice, CC0; Coqui, Apache 2.0)');
  let fileWords = 0, deviceWords = 0;
  for (let i = 0; i < 12; i++) {
    const w = await currentWord(page);
    const before = await page.evaluate(() => [window.__played.length, window.__spoken.length]);
    await page.click('[data-ae-listen]'); await page.waitForTimeout(250);
    const after = await page.evaluate(() => [window.__played.at(-1), window.__spoken.at(-1), window.__played.length, window.__spoken.length]);
    if (audioList[w]?.word) {
      fileWords++;
      ok(after[0] === `${slug(w)}.mp3` && after[3] === before[1], `"Dinle" ${w}: dosya çalıyor (${after[0]}), cihaz sesi kullanılmıyor`);
    } else {
      deviceWords++;
      ok(after[1] === w && after[2] === before[0], `"Dinle" ${w}: dosyası yok, cihaz sesi kelimeyi okuyor`);
    }
    await playWord(page); await page.waitForTimeout(250);
    const end = await page.evaluate(() => [window.__played.at(-1), window.__spoken.at(-1)]);
    if (audioList[w]?.article) ok(end[0] === `${slug(`${articleOf(w)} ${w}`)}.mp3`, `doğru cevap ${w}: artikelli dosya çalıyor (${end[0]})`);
    else ok(end[1] === `${articleOf(w)} ${w}`, `doğru cevap ${w}: dosyası yok, cihaz sesi artikelle okuyor`);
    await page.click('[data-ae-next]');
  }
  ok(fileWords > 0, `Evde konusunda ${fileWords} kelime dosyadan, ${deviceWords} kelime cihaz sesinden`);
  const audioReqs = reqs.filter((u) => u.endsWith('.mp3') || u.includes('.mp3?'));
  ok(audioReqs.length > 0 && audioReqs.every((u) => u.startsWith('http://localhost:8765/data/cocuk/ses/')), `ses dosyaları sadece bu siteden yükleniyor (${audioReqs.length})`);
  await ctx.close();
}
{
  // Dosyalar yüklenemiyor (404): hata yok, cihaz sesine geçiyor.
  const { ctx, page } = await newPage({ files: 'broken' });
  await page.goto(B + '#artikel-evleri/yiyecekler'); await page.waitForTimeout(1500);
  const w = await currentWord(page);
  await page.click('[data-ae-listen]'); await page.waitForTimeout(800);
  ok((await page.evaluate(() => window.__spoken.at(-1))) === w, `bozuk dosyada cihaz sesine geçiyor (${w})`);
  await page.click('[data-ae-listen]'); await page.waitForTimeout(300);
  ok((await page.evaluate(() => window.__spoken.filter((x) => x === window.__spoken.at(-1)).length)) >= 2, 'bozuk dosya bir daha denenmiyor, yine cihaz sesi');
  await ctx.close();
}
{
  // Cihazda Almanca ses yok ama dosyalar var: "Dinle" görünüyor ve dosyayı çalıyor; not sadece dosyası olmayan kelimede.
  const audioList = JSON.parse(fs.readFileSync('data/cocuk/sesler.json', 'utf8')).files;
  const { ctx, page } = await newPage({ files: 'real', voice: false, width: 390 });
  await page.goto(B + '#artikel-evleri/disarida'); await page.waitForTimeout(2200);
  const w = await currentWord(page);
  ok(audioList[w]?.word && await page.locator('[data-ae-listen]').isVisible() && !(await page.locator('[data-ae-novoice]').isVisible()), `ses yok, dosya var (${w}): "Dinle" görünüyor, not yok`);
  await page.click('[data-ae-listen]'); await page.waitForTimeout(250);
  ok((await page.evaluate(() => window.__played.at(-1))) === w.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue') + '.mp3', 'cihaz sesi yokken dosya çalıyor');
  await page.goto(B + '#artikel-evleri/evde'); await page.waitForTimeout(800);
  let checked = false;
  for (let i = 0; i < 12 && !checked; i++) {
    const x = await currentWord(page);
    if (!audioList[x]?.word) {
      ok(!(await page.locator('[data-ae-listen]').isVisible()) && await page.locator('[data-ae-novoice]').isVisible(), `ses yok, dosya yok (${x}): "Dinle" gizli, not görünüyor`);
      checked = true;
    } else { await playWord(page); await page.click('[data-ae-next]'); }
  }
  if (!checked) ok(true, 'Evde konusunda dosyası olmayan kelime kalmadı');
  await ctx.close();
}

// 6. Oyunun kaydı okunamıyor ve yazılamıyor (dolu ya da engelli depolama): oyun yine çalışıyor.
{
  const { ctx, page } = await newPage({ blockStorage: true });
  await page.goto(B + '#artikel-evleri/okul-ve-oyun'); await page.waitForTimeout(1500);
  for (let i = 0; i < 12; i++) { await playWord(page); await page.click('[data-ae-next]'); }
  ok((await page.textContent('[data-ae-end-score]')).includes("12'sini"), 'kayıt yazılamazken de oyun bitiyor');
  await ctx.close();
}

// 7. Diller.
for (const [l, h1, end, note] of [['de', 'Artikelhäuser', 'Du hast 12 von 12 Wörtern beim ersten Versuch gewusst.', 'Die Wortbedeutungen stehen auf Türkisch.'],
  ['en', 'Article Houses', 'You knew 12 of 12 words on the first try.', 'Word meanings are in Turkish.']]) {
  const { ctx, page } = await newPage({ lang: l });
  await page.goto(B + '#exercises/A1'); await page.waitForTimeout(1500);
  ok((await page.textContent('#kidsCardTitle')) === h1, `${l}: kart başlığı ${h1}`);
  await page.goto(B + '#artikel-evleri/evde'); await page.waitForTimeout(1500);
  ok((await page.textContent('#artikelApp h1')) === h1 && (await page.textContent('#artikelApp')).includes(note), `${l}: başlık ve Türkçe anlam notu`);
  for (let i = 0; i < 12; i++) { await playWord(page); await page.click('[data-ae-next]'); }
  ok((await page.textContent('[data-ae-end-score]')).trim() === end, `${l}: bitiş metni`);
  const missing = await page.evaluate(() => [...document.querySelectorAll('#artikelApp *')].map((e) => e.childNodes).flatMap((n) => [...n]).filter((n) => n.nodeType === 3 && /\bae[A-Z]\w+/.test(n.textContent)).length);
  ok(missing === 0, `${l}: eksik çeviri anahtarı yok`);
  await ctx.close();
}

// 8. 390 / 1440, açık / koyu: taşma yok, ekran görüntüleri.
for (const width of [390, 1440]) {
  for (const theme of ['light', 'dark']) {
    const { ctx, page } = await newPage({ width, theme, files: 'real' });
    await page.goto(B + '#artikel-evleri'); await page.waitForTimeout(1500);
    ok(await overflow(page) <= 0, `${width} ${theme}: konu seçiminde taşma yok`);
    await page.screenshot({ path: path.join(shotDir, `konular-${width}-${theme}.png`), fullPage: true });
    await page.click('[data-ae-theme="yiyecekler"]'); await page.waitForTimeout(400);
    const w = await currentWord(page);
    await page.click(`[data-ae-house="${['der', 'die', 'das'].find((x) => x !== articleOf(w))}"]`);
    await page.click(`[data-ae-house="${articleOf(w)}"]`); await page.waitForTimeout(400);
    ok(await overflow(page) <= 0, `${width} ${theme}: oyunda taşma yok`);
    const box = await page.locator('[data-ae-house="der"]').boundingBox();
    ok(box.width >= 88 && box.height >= 88, `${width} ${theme}: evler parmakla dokunacak kadar büyük (${Math.round(box.width)}×${Math.round(box.height)})`);
    await page.screenshot({ path: path.join(shotDir, `oyun-${width}-${theme}.png`), fullPage: true });
    await page.click('[data-ae-next]');
    for (let i = 1; i < 12; i++) { await playWord(page); await page.click('[data-ae-next]'); }
    await page.waitForTimeout(400);
    ok(await overflow(page) <= 0, `${width} ${theme}: bitişte taşma yok`);
    await page.screenshot({ path: path.join(shotDir, `bitis-${width}-${theme}.png`), fullPage: true });
    if (width === 390) {
      await page.goto(B + '#exercises/A1'); await page.waitForTimeout(1500);
      ok(await overflow(page) <= 0, `${width} ${theme}: alıştırmalar sayfasında taşma yok`);
      await page.locator('.kids-card:has([data-kids-game])').screenshot({ path: path.join(shotDir, `kart-390-${theme}.png`) });
    }
    await ctx.close();
  }
}

await browser.close();
console.log('screenshots in', shotDir);
console.log('errors', errors);
if (errors.length) fails.push('page errors');
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
