// Almanca Alfabe oyunu: ses oynatıcı (js/alfabe.js ve tools/audio-check.html kullanır). DOM'a dokunmaz.
// Önce sitenin kendi ses dosyaları (audio/alfabe/<dil>/<id>.mp3, liste audio/alfabe/manifest.json; üretim:
// scripts/generate-alfabe-audio.mjs). Dosya yoksa ya da yüklenemezse tarayıcının cihazdaki sesi (speechSynthesis).
// - Aynı anda tek ses: yeni bir play() öncekini durdurur.
// - İlk dokunuş/tuştan önce hiçbir şey çalmaz (mobil tarayıcılar zaten engeller; hata yerine sessiz kalınır).
// - Yavaş: dosyada playbackRate 0.75 (ses perdesi korunur), cihaz sesinde rate 0.7.
// - Cihaz sesi: sadece cihazda çalışan sesler (localService). Çevrim içi sesler okunan metni tarayıcı üreticisinin
//   sunucusuna gönderir; gizlilik politikası gereği kullanılmaz. Bu sesler arasında adı "Natural", "Neural", "Premium",
//   "Enhanced", "Google", "Anna", "Katja" … olanlar öne alınır.
(function (g) {
  'use strict';
  var GOOD_NAME = /natural|neural|premium|enhanced|online|google|anna|katja|helena|petra|yelda|emel/i;
  var REGION = { de: /^de[-_]DE$/i, tr: /^tr[-_]TR$/i };

  function scoreVoice(v, lang) {
    return (REGION[lang] && REGION[lang].test(v.lang) ? 2 : 0) + (GOOD_NAME.test(v.name || '') ? 4 : 0) + (v.default ? 1 : 0);
  }
  // The best on-device voice for 'de' or 'tr'; null when the device has none.
  function pickVoice(list, lang) {
    var re = new RegExp('^' + lang + '([-_]|$)', 'i');
    var cands = (list || []).filter(function (v) { return v && v.localService && re.test(v.lang || ''); });
    cands.sort(function (a, b) { return scoreVoice(b, lang) - scoreVoice(a, lang); });
    return cands[0] || null;
  }

  // opts: { base: '/audio/alfabe/', slowRate (file, 0.75), slowTts (0.7), onVoices() }
  function create(opts) {
    opts = opts || {};
    var base = opts.base || '/audio/alfabe/';
    var files = {};      // id → url (with ?v=hash)
    var cache = {};      // id → HTMLAudioElement
    var failed = {};     // id → true once a file could not be loaded; the voice is used instead
    var current = null;  // { audio | null, done() }
    var seq = 0;
    var unlocked = false;
    var synth = 'speechSynthesis' in g ? g.speechSynthesis : null;
    var voices = { de: null, tr: null };

    // silent: the first look while create() runs does not call back (the caller is not ready yet).
    function pickVoices(silent) {
      try {
        var list = synth ? synth.getVoices() : [];
        voices.de = pickVoice(list, 'de');
        voices.tr = pickVoice(list, 'tr');
      } catch (_) { voices.de = null; voices.tr = null; }
      if (opts.onVoices && silent !== true) opts.onVoices();
    }
    if (synth) { try { synth.addEventListener('voiceschanged', () => pickVoices()); } catch (_) {} }
    pickVoices(true);

    // Sound only after the visitor has touched or typed something on the page.
    function unlock() { unlocked = true; }
    if (g.document) ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { g.document.addEventListener(t, unlock, { capture: true, passive: true }); });

    function setManifest(m) {
      files = {};
      var clips = (m && m.clips) || {};
      Object.keys(clips).forEach(function (id) {
        var c = clips[id];
        if (c && c.file && c.audioHash && !c.stale) files[id] = base + c.file + '?v=' + encodeURIComponent(c.audioHash);
      });
    }
    function has(id) { return Boolean(id && files[id] && !failed[id]); }
    function audioFor(id) {
      if (!cache[id]) { var a = new Audio(); a.preload = 'auto'; a.src = files[id]; cache[id] = a; }
      return cache[id];
    }
    function preload(ids) { (ids || []).forEach(function (id) { if (has(id)) { try { audioFor(id); } catch (_) {} } }); }

    function stop() {
      seq += 1;
      if (current) { var c = current; current = null; try { if (c.audio) c.audio.pause(); } catch (_) {} c.done(true); }
      try { if (synth) synth.cancel(); } catch (_) {}
    }
    // Resolves true when the file played (or was stopped), false when it could not be played.
    function playFile(id, slow) {
      return new Promise(function (resolve) {
        var audio, finished = false;
        var done = function (ok) {
          if (finished) return; finished = true;
          if (audio) { audio.removeEventListener('ended', onEnd); audio.removeEventListener('error', onError); }
          if (current && current.audio === audio) current = null;
          resolve(ok);
        };
        var onEnd = function () { done(true); };
        var onError = function () { failed[id] = true; done(false); };
        try { audio = audioFor(id); } catch (_) { failed[id] = true; resolve(false); return; }
        current = { audio: audio, done: done };
        audio.addEventListener('ended', onEnd);
        audio.addEventListener('error', onError);
        try {
          audio.pause(); audio.currentTime = 0;
          audio.playbackRate = slow ? (opts.slowRate || 0.75) : 1;
          audio.preservesPitch = true; audio.mozPreservesPitch = true; audio.webkitPreservesPitch = true;
          var p = audio.play();
          if (p && p.catch) p.catch(function (e) {
            if (e && e.name === 'AbortError') return done(true);       // stopped by a newer sound
            if (e && e.name === 'NotAllowedError') return done(true);  // browser blocked sound: stay silent
            onError();
          });
        } catch (_) { onError(); }
      });
    }
    function speakText(part, slow) {
      return new Promise(function (resolve) {
        var v = voices[part.lang];
        if (!synth || !v || !part.text) return resolve();
        var finished = false;
        var done = function () { if (finished) return; finished = true; if (current && current.utterance === u) current = null; resolve(); };
        var u;
        try {
          u = new SpeechSynthesisUtterance(part.text);
          u.voice = v; u.lang = v.lang;
          u.rate = slow ? (opts.slowTts || 0.7) : (part.rate || 1);
          u.onend = done; u.onerror = done;
          current = { audio: null, utterance: u, done: done };
          synth.speak(u);
        } catch (_) { return done(); }
        // Some browsers never fire "end": do not wait for ever.
        setTimeout(done, 1200 + String(part.text).length * 160 / (u.rate || 1));
      });
    }
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

    // parts: [{ clip, text, lang, rate }]; o: { slow, gap (ms between parts) }. Resolves when everything was said.
    function play(parts, o) {
      o = o || {};
      if (!unlocked) return Promise.resolve(false);
      stop();
      var my = seq;
      var list = (parts || []).filter(Boolean);
      var i = 0;
      function next() {
        if (my !== seq || i >= list.length) return Promise.resolve(my === seq);
        var part = list[i++];
        var step = has(part.clip)
          ? playFile(part.clip, o.slow).then(function (ok) { return ok || my !== seq ? null : speakText(part, o.slow); })
          : speakText(part, o.slow);
        return step.then(function () {
          if (my !== seq || i >= list.length) return null;
          return o.gap ? wait(o.gap) : null;
        }).then(next);
      }
      return next();
    }

    return {
      setManifest: setManifest, has: has, preload: preload, play: play, stop: stop,
      voice: function (lang) { return voices[lang]; },
      canSay: function (part) { return has(part.clip) || Boolean(voices[part.lang]); },
      isUnlocked: function () { return unlocked; },
      refreshVoices: function () { pickVoices(); }
    };
  }

  g.baAlfabeAudio = { create: create, pickVoice: pickVoice };
})(typeof window !== 'undefined' ? window : globalThis);
