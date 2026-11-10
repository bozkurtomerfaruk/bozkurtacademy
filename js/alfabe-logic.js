// Almanca Alfabe oyunu (/almanca-alfabe/): oyun mantığı. DOM, ses ve depolama yok; bu yüzden Node'da test edilir
// (node --test tests/alfabe-logic.test.mjs, dosya node:vm içinde çalıştırılır). Arayüz: js/alfabe.js, veri: data/alfabe.json.
// Çocuk ve yetişkin modu aynı mantığı kullanır; farklar yalnızca PROFILES ayar nesnesindedir.
(function (g) {
  'use strict';

  // Profil ayarları. Görünüm farkları css/alfabe.css'te [data-profil] altındaki CSS değişkenleriyle yönetilir.
  var PROFILES = {
    cocuk: {
      id: 'cocuk', options: 3, timer: false, combo: false, spellInput: 'buttons', orderLength: 4,
      spellDistractors: 2, rate: 0.85, speakInstructions: true, detail: false
    },
    yetiskin: {
      id: 'yetiskin', options: 4, timer: true, combo: true, spellInput: 'keyboard', orderLength: 5,
      spellDistractors: 0, rate: 1, speakInstructions: false, detail: true, secondsPerQuestion: 12
    }
  };
  var SLOW_RATE = 0.7;
  var ROUND_LENGTH = 10;
  var MODES = ['kesfet', 'duy', 'ilk-harf', 'heceleme', 'sirala'];
  var QUIZ_MODES = ['duy', 'ilk-harf', 'heceleme', 'sirala'];

  /* ---------- Random numbers (seedable for the tests) ---------- */
  function createRng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rnd(rng) { return typeof rng === 'function' ? rng : Math.random; }
  function shuffle(list, rng) {
    var r = rnd(rng), a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }

  /* ---------- Text ---------- */
  var lower = function (s) { return String(s == null ? '' : s).toLocaleLowerCase('de-DE'); };
  // "Öztürk", "oeztuerk" and "OEZTÜRK" are the same answer; so are "Straße" and "Strasse".
  function normalizeAnswer(s) {
    return lower(s).normalize('NFC').trim()
      .replace(/\s+/g, '')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  }
  function checkSpelling(input, target) {
    var a = normalizeAnswer(input);
    return a.length > 0 && a === normalizeAnswer(target);
  }

  /* ---------- Letters ---------- */
  function byId(letters) { var m = {}; letters.forEach(function (l) { m[l.id] = l; }); return m; }
  // The letter entry for one character of a word ("a", "Ä", "ß"); null for anything else.
  function letterForChar(ch, letters) {
    var c = lower(ch);
    for (var i = 0; i < letters.length; i++) if (letters[i].kucuk === c) return letters[i];
    return null;
  }
  // The 26 letters of the basic alphabet in order (Ä, Ö, Ü and ß have no fixed place in the order).
  function baseAlphabet(letters) { return letters.filter(function (l) { return /^[A-Z]$/.test(l.id); }); }
  // Where the letter is in the word, for highlighting (der Bär → 1, das Taxi → 2). -1 if it is not there.
  function letterIndexInWord(word, letter) {
    var w = lower(word);
    return w.indexOf(letter.kucuk);
  }
  function firstLetterId(word, letters) {
    var l = letterForChar(String(word).charAt(0), letters);
    return l ? l.id : null;
  }
  // "Ball" → [{char:'B', letter:{…B}}, …]; "@", ".", "-" use data.isaretler; everything else is skipped.
  function spellOut(word, letters, signs) {
    var out = [];
    Array.from(String(word)).forEach(function (ch) {
      var l = letterForChar(ch, letters);
      if (l) out.push({ char: ch, id: l.id, name: l.ad, okunus: l.okunus });
      else if (signs && signs[ch]) out.push({ char: ch, id: null, name: signs[ch].ad, okunus: signs[ch].aciklama });
    });
    return out;
  }

  /* ---------- Progress per letter ---------- */
  function statFor(stats, id) { var s = stats && stats[id]; return { r: (s && s.r) || 0, w: (s && s.w) || 0 }; }
  function recordAnswer(stats, id, correct) {
    var next = Object.assign({}, stats || {});
    var s = statFor(next, id);
    if (correct) s.r += 1; else s.w += 1;
    next[id] = s;
    return next;
  }
  // A letter answered wrong comes back more often; each right answer afterwards brings the weight down again.
  function weightFor(stat) {
    var s = stat || { r: 0, w: 0 };
    return 1 + Math.min(7, Math.max(0, 2 * (s.w || 0) - (s.r || 0)));
  }
  function hardLetters(stats, letters) {
    return letters.filter(function (l) { return weightFor(statFor(stats, l.id)) > 1; })
      .sort(function (a, b) { return weightFor(statFor(stats, b.id)) - weightFor(statFor(stats, a.id)); });
  }
  function isLearned(stat) { var s = stat || { r: 0, w: 0 }; return s.r >= 2 && s.r >= 2 * s.w; }
  function weightedPick(items, weights, rng) {
    var r = rnd(rng), total = 0, i;
    for (i = 0; i < items.length; i++) total += weights[i];
    var x = r() * total;
    for (i = 0; i < items.length; i++) { x -= weights[i]; if (x < 0) return items[i]; }
    return items[items.length - 1];
  }
  // n letters for one round, weighted by progress; no letter twice in a row.
  function pickLetters(pool, stats, n, rng) {
    var out = [];
    for (var k = 0; k < n; k++) {
      var cands = pool.length > 1 ? pool.filter(function (l) { return !out.length || l.id !== out[out.length - 1].id; }) : pool;
      out.push(weightedPick(cands, cands.map(function (l) { return weightFor(statFor(stats, l.id)); }), rng));
    }
    return out;
  }

  /* ---------- Options ---------- */
  function partnersOf(id, confusables) {
    var out = [];
    (confusables || []).forEach(function (pair) {
      if (pair[0] === id && out.indexOf(pair[1]) < 0) out.push(pair[1]);
      if (pair[1] === id && out.indexOf(pair[0]) < 0) out.push(pair[0]);
    });
    return out;
  }
  // count option ids with the answer among them; letters that are often confused (V/W, Z/S …) come first.
  function buildOptions(answerId, poolIds, count, confusables, rng) {
    var opts = [answerId];
    partnersOf(answerId, confusables).forEach(function (p) { if (opts.length < count && poolIds.indexOf(p) >= 0) opts.push(p); });
    shuffle(poolIds, rng).forEach(function (id) { if (opts.length < count && opts.indexOf(id) < 0) opts.push(id); });
    return shuffle(opts, rng);
  }

  /* ---------- Questions ---------- */
  function exampleOf(letter, profile) { return letter[profile] || letter.cocuk; }

  // ctx: { data, profile ('cocuk'|'yetiskin'), stats, focus (letter ids or null), rng }
  function poolFor(ctx, letters) {
    if (!ctx.focus || !ctx.focus.length) return letters;
    var ids = focusPool(ctx.focus, letters, ctx.data.karistirilanlar, 4);
    var f = letters.filter(function (l) { return ids.indexOf(l.id) >= 0; });
    return f.length ? f : letters;
  }
  // "Zor harflerimi çalış": the hard letters, and when there are only a few, the letters they are confused with and
  // their neighbours in the alphabet, so a round is never ten times the same letter. The hard ones keep their weight.
  function focusPool(focus, letters, confusables, min) {
    var all = letters.map(function (l) { return l.id; });
    var out = focus.filter(function (id) { return all.indexOf(id) >= 0; });
    if (!out.length) return out;
    var add = function (id) { if (out.length < min && all.indexOf(id) >= 0 && out.indexOf(id) < 0) out.push(id); };
    focus.forEach(function (id) { partnersOf(id, confusables).forEach(add); });
    for (var d = 1; out.length < min && d < all.length; d++) {
      focus.forEach(function (id) { var i = all.indexOf(id); add(all[i + d]); add(all[i - d]); });
    }
    return out;
  }

  function listenQuestions(ctx, n) {
    var letters = ctx.data.harfler, ids = letters.map(function (l) { return l.id; });
    var count = PROFILES[ctx.profile].options;
    return pickLetters(poolFor(ctx, letters), ctx.stats, n, ctx.rng).map(function (l) {
      return { mode: 'duy', answer: l.id, letters: [l.id], options: buildOptions(l.id, ids, count, ctx.data.karistirilanlar, ctx.rng) };
    });
  }

  function firstLetterQuestions(ctx, n) {
    var letters = ctx.data.harfler, ids = letters.map(function (l) { return l.id; });
    var count = PROFILES[ctx.profile].options;
    // Every example word of the profile; the answer is the word's own first letter (das Taxi → T, der Bär → B).
    var words = letters.map(function (l) { var ex = exampleOf(l, ctx.profile); return { ex: ex, first: firstLetterId(ex.kelime, letters) }; })
      .filter(function (w) { return w.first; });
    var focus = poolFor(ctx, letters).map(function (l) { return l.id; });
    var cands = words.filter(function (w) { return focus.indexOf(w.first) >= 0; });
    if (!cands.length) cands = words;
    var out = [];
    for (var k = 0; k < n; k++) {
      var c = cands.length > 1 ? cands.filter(function (w) { return !out.length || w.ex.kelime !== out[out.length - 1].word.kelime; }) : cands;
      var pick = weightedPick(c, c.map(function (w) { return weightFor(statFor(ctx.stats, w.first)); }), ctx.rng);
      out.push({ mode: 'ilk-harf', answer: pick.first, letters: [pick.first], word: pick.ex, options: buildOptions(pick.first, ids, count, ctx.data.karistirilanlar, ctx.rng) });
    }
    return out;
  }

  // Words for spelling. Children: their own example words up to enFazlaHarf letters. Adults: the real-life
  // situations (name, e-mail, address) and their example words.
  function spellItems(data, profile) {
    var letters = data.harfler;
    var onlyLetters = function (w) { return Array.from(w).every(function (ch) { return letterForChar(ch, letters); }); };
    if (profile === 'cocuk') {
      var max = (data.heceleme && data.heceleme.cocuk && data.heceleme.cocuk.enFazlaHarf) || 5;
      return letters.map(function (l) { return l.cocuk; })
        .filter(function (ex) { return onlyLetters(ex.kelime) && Array.from(ex.kelime).length <= max; })
        .map(function (ex) { return { word: ex.kelime, example: ex }; });
    }
    var scenes = ((data.heceleme && data.heceleme.yetiskin) || []).map(function (s) { return { word: s.cevap, scene: s }; });
    var words = letters.map(function (l) { return l.yetiskin; }).filter(function (ex) { return onlyLetters(ex.kelime); })
      .map(function (ex) { return { word: ex.kelime, example: ex }; });
    return scenes.concat(words);
  }
  function lettersIn(word, letters) {
    var seen = [];
    Array.from(word).forEach(function (ch) { var l = letterForChar(ch, letters); if (l && seen.indexOf(l.id) < 0) seen.push(l.id); });
    return seen;
  }
  function spellQuestions(ctx, n) {
    var letters = ctx.data.harfler, settings = PROFILES[ctx.profile];
    var items = spellItems(ctx.data, ctx.profile);
    if (ctx.focus && ctx.focus.length) {
      var f = items.filter(function (it) { return lettersIn(it.word, letters).some(function (id) { return ctx.focus.indexOf(id) >= 0; }); });
      if (f.length) items = f;
    }
    // Adults get the real-life situations first in every round.
    var weightOf = function (it) {
      var w = Math.max.apply(null, lettersIn(it.word, letters).map(function (id) { return weightFor(statFor(ctx.stats, id)); }).concat([1]));
      return it.scene ? w * 2 : w;
    };
    var out = [];
    for (var k = 0; k < n; k++) {
      var used = out.map(function (q) { return q.word; });
      var c = items.filter(function (it) { return used.indexOf(it.word) < 0; });
      if (!c.length) c = items;
      var it = weightedPick(c, c.map(weightOf), ctx.rng);
      var q = { mode: 'heceleme', answer: it.word, word: it.word, example: it.example || null, scene: it.scene || null,
        letters: lettersIn(it.word, letters), tokens: spellOut(it.word, letters, ctx.data.isaretler) };
      if (settings.spellInput === 'buttons') q.tiles = spellTiles(it.word, letters, ctx.data.karistirilanlar, settings.spellDistractors, ctx.rng);
      out.push(q);
    }
    return out;
  }
  // Letter buttons for children: the letters of the word plus a few look-alike or sound-alike letters.
  function spellTiles(word, letters, confusables, extra, rng) {
    var chars = Array.from(word).map(function (ch) { return letterForChar(ch, letters).kucuk; });
    var tiles = chars.slice();
    var add = [];
    lettersIn(word, letters).forEach(function (id) { partnersOf(id, confusables).forEach(function (p) { if (add.indexOf(p) < 0) add.push(p); }); });
    var map = byId(letters);
    shuffle(add, rng).concat(shuffle(baseAlphabet(letters).map(function (l) { return l.id; }), rng)).forEach(function (id) {
      var ch = map[id] && map[id].kucuk;
      if (extra > 0 && ch && tiles.indexOf(ch) < 0) { tiles.push(ch); extra--; }
    });
    return shuffle(tiles, rng);
  }

  // 4–5 consecutive letters of the alphabet, shuffled (never already in order).
  function orderQuestions(ctx, n) {
    var base = baseAlphabet(ctx.data.harfler), len = PROFILES[ctx.profile].orderLength;
    var targets = pickLetters(poolFor(ctx, base), ctx.stats, n, ctx.rng);
    return targets.map(function (target) {
      var idx = base.indexOf(target);
      var lo = Math.max(0, idx - len + 1), hi = Math.min(idx, base.length - len);
      var start = lo + Math.floor(rnd(ctx.rng)() * (hi - lo + 1));
      var seq = base.slice(start, start + len).map(function (l) { return l.id; });
      return { mode: 'sirala', answer: seq, letters: seq, shuffled: shuffleUnsorted(seq, ctx.rng) };
    });
  }
  function shuffleUnsorted(seq, rng) {
    if (seq.length < 2) return seq.slice();
    for (var tries = 0; tries < 20; tries++) { var s = shuffle(seq, rng); if (s.join() !== seq.join()) return s; }
    var r = seq.slice(); r.push(r.shift()); return r;
  }
  function isInOrder(ids, letters) {
    var order = baseAlphabet(letters).map(function (l) { return l.id; });
    for (var i = 1; i < ids.length; i++) if (order.indexOf(ids[i]) !== order.indexOf(ids[i - 1]) + 1) return false;
    return ids.every(function (id) { return order.indexOf(id) >= 0; });
  }
  // Letters that are in the wrong place (for progress): compared with the right order.
  function misplaced(ids, answer) { return answer.filter(function (id, i) { return ids[i] !== id; }); }
  function moveItem(list, from, to) {
    var a = list.slice();
    if (from < 0 || from >= a.length || to < 0 || to >= a.length) return a;
    var x = a.splice(from, 1)[0]; a.splice(to, 0, x); return a;
  }
  function swapItems(list, i, j) { var a = list.slice(); var x = a[i]; a[i] = a[j]; a[j] = x; return a; }

  function buildRound(mode, ctx) {
    var n = ctx.length || ROUND_LENGTH;
    if (mode === 'duy') return listenQuestions(ctx, n);
    if (mode === 'ilk-harf') return firstLetterQuestions(ctx, n);
    if (mode === 'heceleme') return spellQuestions(ctx, n);
    if (mode === 'sirala') return orderQuestions(ctx, n);
    throw new Error('Bilinmeyen mod: ' + mode);
  }

  // Letters in a wrong spelling: compared position by position (lower case, without the ae/oe/ue/ss forms).
  function spellingMistakes(input, word, letters) {
    var a = Array.from(lower(input)), b = Array.from(lower(word)), out = [];
    b.forEach(function (ch, i) { var l = letterForChar(ch, letters); if (l && a[i] !== ch && out.indexOf(l.id) < 0) out.push(l.id); });
    return out;
  }

  /* ---------- Score ---------- */
  // Children: one star per right answer, nothing is taken away. Adults: 10 points, ×2 from a streak of 3,
  // ×3 from 6; in "Zamana Karşı" each second left adds a point. A wrong answer only ends the streak.
  function scoreAnswer(state, correct, profile, secondsLeft) {
    var s = { points: state.points || 0, streak: state.streak || 0, best: state.best || 0, right: state.right || 0 };
    if (!correct) { s.streak = 0; return Object.assign(s, { gained: 0 }); }
    s.right += 1; s.streak += 1; s.best = Math.max(s.best, s.streak);
    var gained = 1;
    if (PROFILES[profile].combo) {
      var mult = s.streak >= 6 ? 3 : s.streak >= 3 ? 2 : 1;
      gained = 10 * mult + (secondsLeft > 0 ? Math.round(secondsLeft) : 0);
    }
    s.points += gained;
    return Object.assign(s, { gained: gained, multiplier: PROFILES[profile].combo ? (s.streak >= 6 ? 3 : s.streak >= 3 ? 2 : 1) : 1 });
  }
  function starsFor(right, total) {
    var t = total || ROUND_LENGTH, p = right / t;
    return p >= 0.9 ? 3 : p >= 0.6 ? 2 : 1;
  }

  /* ---------- Progress in the account (js/account/alfabe-sync.js, users/{uid}/progress/alfabe) ---------- */
  var PROFILE_IDS = ['cocuk', 'yetiskin'];
  var BEST_KEYS = [];
  QUIZ_MODES.forEach(function (m) { BEST_KEYS.push(m, m + ':zaman'); });
  var count = function (v) { var n = Math.floor(Number(v)); return isFinite(n) && n > 0 ? Math.min(n, 1000000) : 0; };
  // Only the fields the rules (firestore.rules → validAlfabeProgress) allow: known letters and modes, whole numbers ≥ 0.
  function cleanProgress(p, letterIds) {
    var out = {};
    PROFILE_IDS.forEach(function (id) {
      var x = (p && p[id]) || {}, stats = {}, best = {};
      letterIds.forEach(function (l) {
        var s = x.stats && x.stats[l];
        if (s && (count(s.r) || count(s.w))) stats[l] = { r: count(s.r), w: count(s.w) };
      });
      BEST_KEYS.forEach(function (k) { if (x.best && x.best[k] != null && isFinite(Number(x.best[k]))) best[k] = count(x.best[k]); });
      out[id] = { stats: stats, best: best, stars: count(x.stars) };
    });
    return out;
  }
  // Local and account progress together: the better value of each field wins (right and wrong answers per letter,
  // best score per mode, stars). Taking the maximum instead of the sum means merging the same data twice changes nothing.
  function mergeProgress(a, b, letterIds) {
    var x = cleanProgress(a, letterIds), y = cleanProgress(b, letterIds), out = {};
    PROFILE_IDS.forEach(function (id) {
      var stats = {}, best = {};
      letterIds.forEach(function (l) {
        var s = x[id].stats[l], t = y[id].stats[l];
        if (s || t) stats[l] = { r: Math.max(s ? s.r : 0, t ? t.r : 0), w: Math.max(s ? s.w : 0, t ? t.w : 0) };
      });
      BEST_KEYS.forEach(function (k) {
        if (k in x[id].best || k in y[id].best) best[k] = Math.max(k in x[id].best ? x[id].best[k] : 0, k in y[id].best ? y[id].best[k] : 0);
      });
      out[id] = { stats: stats, best: best, stars: Math.max(x[id].stars, y[id].stars) };
    });
    return out;
  }
  // Stable text form for "has anything changed?" (key order does not matter).
  function progressKey(p, letterIds) {
    var c = cleanProgress(p, letterIds);
    return JSON.stringify(PROFILE_IDS.map(function (id) {
      return [letterIds.map(function (l) { var s = c[id].stats[l]; return s ? s.r + '/' + s.w : ''; }),
        BEST_KEYS.map(function (k) { return k in c[id].best ? c[id].best[k] : ''; }), c[id].stars];
    }));
  }

  /* ---------- Audio clips (audio/alfabe/, scripts/generate-alfabe-audio.mjs, docs/alfabe-oyunu.md) ---------- */
  // One list for the game, the generator script and the check page (tools/audio-check.html). File: <lang>/<id>.mp3.
  // Ids are simple and stable so an own recording can replace a file: harf-v, kelime-der-vogel, soru-wie-ist-ihr-nachname …
  var SLOW_PLAYBACK = 0.75;     // "Yavaş oku" with recorded files (playbackRate, pitch kept)
  var SPELL_GAP = 380;          // ms between letters when spelling; slow: SPELL_GAP_SLOW
  var SPELL_GAP_SLOW = 600;
  function slug(text) {
    return lower(text).replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ş/g, 's')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // é → e (Café)
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  var LETTER_SLUG = { 'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue', 'ß': 'eszett' };
  var SIGN_SLUG = { '@': 'at', '.': 'punkt', '-': 'bindestrich' };
  var audioId = {
    letter: function (l) { return 'harf-' + (LETTER_SLUG[l.id] || slug(l.id)); },
    word: function (ex) { return 'kelime-' + slug(ex.artikel + ' ' + ex.kelime); },
    sign: function (ch, sign) { return 'isaret-' + (SIGN_SLUG[ch] || slug(sign.ad)); },
    question: function (scene) { return 'soru-' + slug(scene.soru); },
    answer: function (scene) { return 'cevap-' + slug(scene.cevap); },
    phrase: function (key) { return key; } // keys of data.seslendirme.tr / .de
  };
  // What a local engine (Piper) reads for an answer: the signs with their own text ("[[ ˈɛt ]]" for @).
  function answerSay(text, signs) {
    return Array.from(String(text)).map(function (ch) { return signs && signs[ch] ? ' ' + (signs[ch].sesMetni || signs[ch].ad) + ' ' : ch; }).join('')
      .replace(/\s+/g, ' ').trim();
  }
  // "mia.wolf@web.de" is read as "mia Punkt wolf ät web Punkt de".
  function spokenAnswer(text, signs) {
    return Array.from(String(text)).map(function (ch) { return signs && signs[ch] ? ' ' + signs[ch].ad + ' ' : ch; }).join('')
      .replace(/\s+/g, ' ').trim();
  }
  var xml = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var signSsml = function (s) { return s.ipa ? '<phoneme alphabet="ipa" ph="' + xml(s.ipa) + '">' + xml(s.ad) + '</phoneme>' : xml(s.ad); };
  // SSML of an answer: the signs with their own reading, a short pause around them.
  function answerSsml(text, signs) {
    return Array.from(String(text)).map(function (ch) {
      return signs && signs[ch] ? ' <break time="150ms"/>' + signSsml(signs[ch]) + '<break time="150ms"/> ' : xml(ch);
    }).join('').replace(/\s+/g, ' ').trim();
  }
  // Every clip: id, lang ('de' | 'tr'), file, kind, text (what it says, also the browser-voice fallback),
  // say (what a local engine such as Piper reads: data sesMetni, [[ … ]] = phonemes; alts: other spellings to compare),
  // expect (what a listener should hear, for the generator's speech-recognition check; default: text),
  // ssml (body without <speak>; letter names with their IPA so V is "Vau", Q "Kuh", Ä a long "ä"),
  // tone ('cocuk': warm Turkish voice for the children's mode; 'notr' otherwise), preload (often used).
  function audioClips(data) {
    var out = [];
    var add = function (c) { c.file = c.lang + '/' + c.id + '.mp3'; out.push(c); };
    data.harfler.forEach(function (l) {
      add({ id: audioId.letter(l), lang: 'de', kind: 'harf', text: l.soyle || l.ad, ipa: l.ipa || null,
        say: l.sesMetni || (l.soyle || l.ad) + '.', alts: l.sesAlternatifleri || [],
        ssml: l.ipa ? '<phoneme alphabet="ipa" ph="' + xml(l.ipa) + '">' + xml(l.soyle || l.ad) + '</phoneme>' : xml(l.soyle || l.ad),
        tone: 'notr', preload: true });
    });
    ['cocuk', 'yetiskin'].forEach(function (p) {
      data.harfler.forEach(function (l) {
        var ex = l[p], text = ex.artikel + ' ' + ex.kelime;
        add({ id: audioId.word(ex), lang: 'de', kind: 'kelime', text: text, say: ex.sesMetni || text + '.', ssml: xml(text), tone: 'notr', profile: p });
      });
    });
    Object.keys(data.isaretler || {}).forEach(function (ch) {
      var s = data.isaretler[ch];
      add({ id: audioId.sign(ch, s), lang: 'de', kind: 'isaret', text: s.ad, say: (s.sesMetni || s.ad) + '.', ssml: signSsml(s), tone: 'notr' });
    });
    ((data.heceleme && data.heceleme.yetiskin) || []).forEach(function (sc) {
      add({ id: audioId.question(sc), lang: 'de', kind: 'soru', text: sc.soru, say: sc.soru, ssml: xml(sc.soru), tone: 'notr' });
      var said = spokenAnswer(sc.cevap, data.isaretler);
      add({ id: audioId.answer(sc), lang: 'de', kind: 'cevap', text: said, say: sc.sesMetni || answerSay(sc.cevap, data.isaretler) + '.', expect: sc.cevap, ssml: answerSsml(sc.cevap, data.isaretler), tone: 'notr' });
    });
    var phrases = data.seslendirme || {};
    ['de', 'tr'].forEach(function (lang) {
      Object.keys(phrases[lang] || {}).forEach(function (key) {
        var text = phrases[lang][key];
        add({ id: audioId.phrase(key), lang: lang, kind: /^talimat-/.test(key) ? 'talimat' : 'geri', text: text, say: text, ssml: xml(text),
          tone: lang === 'tr' ? 'cocuk' : 'notr', preload: !/^talimat-/.test(key) });
      });
    });
    // Same id twice would overwrite a file: keep the first and let the tests catch it.
    var seen = {};
    return out.filter(function (c) { var k = c.file; if (seen[k]) return false; seen[k] = true; return true; });
  }

  var api = {
    SLOW_PLAYBACK: SLOW_PLAYBACK, SPELL_GAP: SPELL_GAP, SPELL_GAP_SLOW: SPELL_GAP_SLOW,
    slug: slug, audioId: audioId, audioClips: audioClips, spokenAnswer: spokenAnswer,
    BEST_KEYS: BEST_KEYS, cleanProgress: cleanProgress, mergeProgress: mergeProgress, progressKey: progressKey,
    PROFILES: PROFILES, SLOW_RATE: SLOW_RATE, ROUND_LENGTH: ROUND_LENGTH, MODES: MODES, QUIZ_MODES: QUIZ_MODES,
    createRng: createRng, shuffle: shuffle, normalizeAnswer: normalizeAnswer, checkSpelling: checkSpelling,
    letterForChar: letterForChar, baseAlphabet: baseAlphabet, letterIndexInWord: letterIndexInWord, firstLetterId: firstLetterId,
    spellOut: spellOut, statFor: statFor, recordAnswer: recordAnswer, weightFor: weightFor, hardLetters: hardLetters,
    isLearned: isLearned, weightedPick: weightedPick, pickLetters: pickLetters, partnersOf: partnersOf, buildOptions: buildOptions,
    spellItems: spellItems, focusPool: focusPool, spellTiles: spellTiles, buildRound: buildRound, isInOrder: isInOrder, misplaced: misplaced,
    moveItem: moveItem, swapItems: swapItems, shuffleUnsorted: shuffleUnsorted, spellingMistakes: spellingMistakes,
    scoreAnswer: scoreAnswer, starsFor: starsFor, exampleOf: exampleOf, byId: byId
  };
  g.baAlfabeLogic = api;
})(typeof window !== 'undefined' ? window : globalThis);
