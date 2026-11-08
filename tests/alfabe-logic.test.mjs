// Almanca Alfabe oyunu: oyun mantığı (js/alfabe-logic.js) ve veri dosyası (data/alfabe.json) birim testleri.
// Tarayıcı gerekmez: node --test tests/alfabe-logic.test.mjs  (npm run test:alfabe)
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/alfabe-logic.js', import.meta.url), 'utf8'), ctx);
const L = ctx.window.baAlfabeLogic;
const data = JSON.parse(fs.readFileSync(new URL('../data/alfabe.json', import.meta.url), 'utf8'));
const letters = data.harfler;
const ids = letters.map((l) => l.id);
const plain = (v) => JSON.parse(JSON.stringify(v)); // values from the vm context have another Array prototype
const round = (mode, profile, extra = {}) => plain(L.buildRound(mode, { data, profile, stats: {}, rng: L.createRng(7), ...extra }));

test('veri: 26 harf + Ä Ö Ü ß, her harfte gerekli alanlar', () => {
  assert.equal(letters.length, 30);
  assert.deepEqual(ids, [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'Ä', 'Ö', 'Ü', 'ß']);
  const names = { A: 'a', B: 'be', C: 'tse', D: 'de', E: 'e', F: 'ef', G: 'ge', H: 'ha', I: 'i', J: 'yot', K: 'ka', L: 'el', M: 'em', N: 'en', O: 'o', P: 'pe', Q: 'ku', R: 'er', S: 'es', T: 'te', U: 'u', V: 'fau', W: 've', X: 'iks', Y: 'üpsilon', Z: 'tset', 'Ä': 'e', 'Ö': 'ö', 'Ü': 'ü', 'ß': 'estset' };
  for (const l of letters) {
    assert.equal(l.okunus, names[l.id], l.id);
    assert.ok(l.ad && l.ipucu && l.kucuk, l.id);
    for (const p of ['cocuk', 'yetiskin']) {
      const ex = l[p];
      assert.ok(['der', 'die', 'das'].includes(ex.artikel) && ex.kelime && ex.anlam && ex.emoji, `${l.id} ${p}`);
      assert.ok(L.letterIndexInWord(ex.kelime, l) >= 0, `${l.id} ${p}: ${ex.kelime} harfi içermiyor`);
    }
  }
  assert.equal(letters.find((l) => l.id === 'V').ad, 'Vau');
  assert.equal(letters.find((l) => l.id === 'J').ad, 'Jot');
  assert.equal(letters.find((l) => l.id === 'ß').buyuk, null);
  for (const pair of [['V', 'W'], ['Z', 'S'], ['J', 'Y'], ['E', 'I'], ['Ü', 'U']])
    assert.ok(data.karistirilanlar.some((p) => p.join() === pair.join()), pair.join('/'));
});

test('ae/oe/ue/ss normalizasyonu ve büyük/küçük harf', () => {
  assert.equal(L.normalizeAnswer(' Öztürk '), 'oeztuerk');
  assert.ok(L.checkSpelling('oeztuerk', 'Öztürk'));
  assert.ok(L.checkSpelling('OEZTÜRK', 'Öztürk'));
  assert.ok(L.checkSpelling('strasse', 'Straße'));
  assert.ok(L.checkSpelling('GARTENSTRASSE', 'Gartenstraße'));
  assert.ok(L.checkSpelling('Aenderung', 'Änderung'));
  assert.ok(L.checkSpelling('mia.wolf@web.de', 'mia.wolf@web.de'));
  assert.ok(!L.checkSpelling('Oztürk', 'Öztürk'));
  assert.ok(!L.checkSpelling('', 'a'));
  assert.ok(!L.checkSpelling('Fogel', 'Vogel'));
});

test('heceleme: harf adları (Be – A – El …), işaretler', () => {
  const t = plain(L.spellOut('Fuß', letters, data.isaretler)).map((x) => x.name);
  assert.deepEqual(t, ['Ef', 'U', 'Eszett']);
  assert.deepEqual(plain(L.spellOut('mia.wolf@web.de', letters, data.isaretler)).map((x) => x.name).slice(3, 4), ['Punkt']);
  assert.ok(plain(L.spellOut('a@b', letters, data.isaretler)).some((x) => x.name === 'ät'));
  assert.equal(L.firstLetterId('Taxi', letters), 'T');
  assert.equal(L.firstLetterId('Änderung', letters), 'Ä');
});

test('soru üretme: 10 soru, profilin seçenek sayısı, doğru cevap seçeneklerde', () => {
  for (const [profile, n] of [['cocuk', 3], ['yetiskin', 4]]) {
    for (const mode of ['duy', 'ilk-harf']) {
      const qs = round(mode, profile);
      assert.equal(qs.length, 10);
      for (const q of qs) {
        assert.equal(q.options.length, n, `${profile} ${mode}`);
        assert.equal(new Set(q.options).size, n);
        assert.ok(q.options.includes(q.answer));
      }
      for (let i = 1; i < qs.length; i++) assert.notEqual(JSON.stringify(qs[i]), JSON.stringify(qs[i - 1]));
    }
  }
  for (const q of round('ilk-harf', 'yetiskin')) assert.equal(L.firstLetterId(q.word.kelime, letters), q.answer);
});

test('sık karıştırılan harfler seçeneklerde yan yana', () => {
  for (const [a, b] of [['V', 'W'], ['W', 'V'], ['Z', 'S'], ['J', 'Y'], ['E', 'I'], ['Ü', 'U']]) {
    for (const count of [3, 4]) {
      const opts = plain(L.buildOptions(a, ids, count, data.karistirilanlar, L.createRng(3)));
      assert.ok(opts.includes(a) && opts.includes(b), `${a}: ${opts}`);
    }
  }
});

test('heceleme soruları: çocukta harf düğmeleri, yetişkinde senaryolar', () => {
  const kid = round('heceleme', 'cocuk');
  for (const q of kid) {
    assert.ok([...q.word].length <= 5, q.word);
    const need = [...q.word.toLocaleLowerCase('de-DE')];
    const tiles = q.tiles.slice();
    for (const ch of need) { const i = tiles.indexOf(ch); assert.ok(i >= 0, `${q.word}: ${ch} düğmesi yok`); tiles.splice(i, 1); }
    assert.equal(tiles.length, 2, 'iki fazladan harf');
  }
  const adult = round('heceleme', 'yetiskin');
  assert.ok(adult.some((q) => q.scene), 'gerçek hayat senaryosu var');
  assert.ok(adult.every((q) => !q.tiles));
  assert.equal(new Set(adult.map((q) => q.word)).size, 10, 'aynı turda tekrar yok');
});

test('sıralama: ardışık harfler, karışık başlar, doğrulama ve taşıma', () => {
  for (const [profile, len] of [['cocuk', 4], ['yetiskin', 5]]) {
    for (const q of round('sirala', profile)) {
      assert.equal(q.answer.length, len);
      assert.ok(L.isInOrder(q.answer, letters));
      assert.ok(!L.isInOrder(q.shuffled, letters));
      assert.deepEqual([...q.shuffled].sort(), [...q.answer].sort());
    }
  }
  assert.ok(L.isInOrder(['V', 'W', 'X', 'Y'], letters));
  assert.ok(!L.isInOrder(['W', 'V', 'X', 'Y'], letters));
  assert.ok(!L.isInOrder(['A', 'C'], letters));
  assert.deepEqual(plain(L.moveItem(['B', 'A', 'C'], 1, 0)), ['A', 'B', 'C']);
  assert.deepEqual(plain(L.swapItems(['C', 'B', 'A'], 0, 2)), ['A', 'B', 'C']);
  assert.deepEqual(plain(L.misplaced(['B', 'A', 'C'], ['A', 'B', 'C'])), ['A', 'B']);
  assert.notDeepEqual(plain(L.shuffleUnsorted(['A', 'B'], L.createRng(1))), ['A', 'B']);
});

test('zor harfler ağırlıklandırılır ve daha sık sorulur', () => {
  let stats = {};
  assert.equal(L.weightFor(L.statFor(stats, 'V')), 1);
  stats = L.recordAnswer(stats, 'V', false);
  stats = L.recordAnswer(stats, 'V', false);
  assert.equal(L.weightFor(L.statFor(stats, 'V')), 5);
  stats = L.recordAnswer(stats, 'V', true);
  assert.equal(L.weightFor(L.statFor(stats, 'V')), 4, 'doğru cevap ağırlığı azaltır');
  assert.deepEqual(plain(L.hardLetters(stats, letters)).map((l) => l.id), ['V']);
  const count = (s) => plain(L.buildRound('duy', { data, profile: 'yetiskin', stats: s, rng: L.createRng(11), length: 300 })).filter((q) => q.answer === 'V').length;
  assert.ok(count(stats) > 2.5 * count({}), `${count(stats)} / ${count({})}`);
  // "Zor harflerimi çalış": the hard letters plus partners/neighbours up to four letters; the hard ones come most often.
  assert.deepEqual(plain(L.focusPool(['V'], letters, data.karistirilanlar, 4)), ['V', 'W', 'F', 'U']);
  assert.deepEqual(plain(L.focusPool(['B'], letters, data.karistirilanlar, 4)), ['B', 'C', 'A', 'D']);
  assert.deepEqual(plain(L.focusPool(['A', 'B', 'C', 'D', 'E'], letters, data.karistirilanlar, 4)), ['A', 'B', 'C', 'D', 'E']);
  const focused = plain(L.buildRound('duy', { data, profile: 'cocuk', stats, focus: ['V'], rng: L.createRng(5), length: 200 }));
  assert.ok(focused.every((q) => ['V', 'W', 'F', 'U'].includes(q.answer)), 'zor harf turu zor harf ve yakın harflerden');
  assert.ok(focused.filter((q) => q.answer === 'V').length > 60, 'zor harf en sık soruluyor');
  for (let i = 1; i < focused.length; i++) assert.notEqual(focused[i].answer, focused[i - 1].answer);
  assert.ok(L.isLearned({ r: 2, w: 1 }) && !L.isLearned({ r: 1, w: 0 }) && !L.isLearned({ r: 2, w: 2 }));
});

test('puan: çocukta ceza yok, yetişkinde seri çarpanı ve süre bonusu; yıldızlar', () => {
  let s = L.scoreAnswer({}, true, 'cocuk');
  s = L.scoreAnswer(s, false, 'cocuk');
  assert.equal(s.points, 1);
  let a = {};
  for (let i = 0; i < 3; i++) a = L.scoreAnswer(a, true, 'yetiskin', 0);
  assert.equal(a.points, 40);
  assert.equal(a.multiplier, 2);
  a = L.scoreAnswer(a, false, 'yetiskin');
  assert.equal(a.points, 40);
  assert.equal(a.streak, 0);
  assert.equal(a.best, 3);
  assert.equal(L.scoreAnswer({}, true, 'yetiskin', 5).gained, 15);
  assert.equal(L.starsFor(10, 10), 3);
  assert.equal(L.starsFor(9, 10), 3);
  assert.equal(L.starsFor(6, 10), 2);
  assert.equal(L.starsFor(2, 10), 1);
  assert.deepEqual(plain(L.spellingMistakes('Fogel', 'Vogel', letters)), ['V']);
});
