// Artikel Evleri (#artikel-evleri, #artikel-evleri/<konu>): çocuklar için artikel oyunu.
// Resme bak, kelimeyi oku, doğru eve dokun (der, die, das). Konular data/cocuk/artikel-evleri.json'da; artikel ve
// Türkçe anlam data/sozluk.json'dan (öğretmenin kontrol ettiği kelimeler), resimler data/cocuk/resimler.json'da
// (node scripts/check-kids-games.mjs). Skor: ilk denemede doğru bilinen kelime sayısı.
// Hesap, form ve sunucuya gönderim yok. localStorage'da (baKelimeOyunlari) sadece ses ayarı ve konu başına en iyi skor.
// Ses: önce sitenin kendi MP3 dosyaları (data/cocuk/ses, liste data/cocuk/sesler.json; Thorsten-Voice CC0 ile Coqui TTS
// Apache 2.0, bkz. data/cocuk/ses/LISANS.md). Dosya yoksa ya da çalınamazsa tarayıcının cihazdaki Almanca sesi
// (speechSynthesis, sadece localService); o da yoksa oyun sessiz devam eder.
// "Dinle" düğmesi sadece kelimeyi okur; artikel doğru cevaptan sonra okunur. Metinler js/app.js'te (ae…).
(() => {
  'use strict';
  const root = document.getElementById('artikelApp');
  if (!root) return;

  const PAGE = 'artikel-evleri';
  const STORE = 'baKelimeOyunlari';
  const ARTS = ['der', 'die', 'das'];
  const initialHash = location.hash;
  const t = (key) => window.BA?.t ? window.BA.t(key) : key;
  const fill = (key, values) => t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const lang = () => window.BA?.lang || 'tr';
  const esc = (v) => window.baHtml.escapeHtml(v); // ortak kaçışlayıcı: js/html.js
  // html-safe-names: cls x y wins inner houseSvg() picHtml()
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Only the sound setting and the best score per topic; the game works when storage is blocked.
  function readStore() {
    try { const v = JSON.parse(localStorage.getItem(STORE) || 'null'); return v && typeof v === 'object' ? v : {}; } catch (_) { return {}; }
  }
  function writeStore(patch) {
    try { localStorage.setItem(STORE, JSON.stringify({ ...readStore(), ...patch })); } catch (_) {}
  }
  const bestOf = (id) => { const b = readStore().best?.[id]; return Number.isInteger(b) ? b : null; };

  // Turkish accusative after a number: 9'unu, 12'sini, 3'ünü …
  function trAcc(n) {
    const ones = ['', 'ini', 'sini', 'ünü', 'ünü', 'ini', 'sını', 'sini', 'ini', 'unu'];
    const tens = { 0: 'ını', 10: 'unu', 20: 'sini', 30: 'unu', 40: 'ını', 50: 'sini', 60: 'ını', 70: 'ini', 80: 'ini', 90: 'ını' };
    return `${n}'${n % 10 ? ones[n % 10] : tens[n % 100] || 'ünü'}`;
  }

  /* ---------- Sound ---------- */
  let soundOn = readStore().sound !== false;
  let voice = null;
  let voiceChecked = false;
  let current = null; // the word on the board, for the sound controls
  function pickVoice() {
    try {
      const list = 'speechSynthesis' in window ? speechSynthesis.getVoices() : [];
      // Voices on the device only: an online voice would send the words to the browser maker's server.
      voice = list.find((v) => /^de([-_]|$)/i.test(v.lang) && v.localService) || null;
    } catch (_) { voice = null; }
    updateSoundUi();
  }
  function speak(text) {
    if (!soundOn || !voice) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = voice; u.lang = voice.lang; u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch (_) {}
  }
  // Recorded files (one Audio per file, loaded when its word appears); a file that fails is not tried again.
  const AUDIO_DIR = 'data/cocuk/ses/';
  const clips = new Map();
  const broken = new Set();
  let playing = null;
  let onFail = null; // fallback for the clip that is playing now
  const fileFor = (w, kind) => { const f = data?.audio?.[w.word]?.[kind]; return f && !broken.has(f) ? f : null; };
  function clip(file) {
    if (!clips.has(file)) {
      const a = new Audio();
      a.preload = 'auto';
      a.addEventListener('error', () => { broken.add(file); if (playing === a) onFail?.(); updateSoundUi(); });
      a.src = AUDIO_DIR + file + '?v=1';
      clips.set(file, a);
    }
    return clips.get(file);
  }
  function stopAll() {
    try { playing?.pause(); } catch (_) {}
    playing = null; onFail = null;
    try { speechSynthesis.cancel(); } catch (_) {}
  }
  // kind: 'word' ("Hund", the Dinle button) or 'article' ("der Hund", after the right answer).
  function say(w, kind) {
    if (!soundOn) return;
    stopAll();
    const text = kind === 'article' ? `${w.article} ${w.word}` : w.word;
    const file = fileFor(w, kind);
    if (!file) { speak(text); return; }
    const a = clip(file);
    let fellBack = false;
    const fallback = () => {
      if (fellBack || playing !== a) return;
      fellBack = true; onFail = null; broken.add(file); speak(text); updateSoundUi();
    };
    playing = a;
    onFail = fallback;
    if (a.error) { fallback(); return; }
    try { a.currentTime = 0; } catch (_) {}
    // AbortError: this play was stopped by the next one (e.g. Dinle pressed twice); the file itself is fine.
    try { const p = a.play(); if (p && p.catch) p.catch((e) => { if (e?.name !== 'AbortError') fallback(); }); } catch (_) { fallback(); }
  }
  function preload(w) {
    if (!soundOn) return;
    for (const kind of ['word', 'article']) { const f = fileFor(w, kind); if (f) clip(f); }
  }
  function updateSoundUi() {
    const btn = root.querySelector('[data-ae-sound]');
    if (btn) {
      btn.setAttribute('aria-pressed', String(soundOn));
      btn.querySelector('span').textContent = t(soundOn ? 'aeSoundOn' : 'aeSoundOff');
    }
    // "No German voice" only matters for a word without a working file.
    const files = current ? Boolean(fileFor(current, 'word') && fileFor(current, 'article')) : true;
    const note = root.querySelector('[data-ae-novoice]');
    if (note) note.hidden = !voiceChecked || !soundOn || Boolean(voice) || files;
    root.querySelectorAll('[data-ae-listen]').forEach((b) => { b.hidden = !soundOn || (!voice && !(current && fileFor(current, 'word'))); });
  }
  if ('speechSynthesis' in window) { try { speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch (_) {} }
  // Voices can arrive a moment after the page loads: wait before saying there is none.
  setTimeout(() => { voiceChecked = true; pickVoice(); }, 1500);

  /* ---------- Data ---------- */
  let data = null;
  let loading = null;
  function load() {
    const get = (url) => fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
    loading ||= Promise.all([get('data/cocuk/artikel-evleri.json?v=1'), get('data/cocuk/resimler.json?v=1'), get('data/sozluk.json?v=1'),
      get('data/cocuk/sesler.json?v=1').catch(() => ({ files: {} }))]) // without the list the game uses the device voice
      .then(([game, pics, dict, audio]) => {
        const themes = game.themes.map((th) => ({
          ...th,
          words: th.words.filter((w) => dict.words[w] && pics.pictures[w]).map((w) => ({
            word: w, article: dict.words[w].article, tr: String(dict.words[w].tr).split(';')[0].trim(), pic: pics.pictures[w]
          }))
        }));
        data = { themes, pics: pics.pictures, audio: audio.files || {} };
        return data;
      })
      .catch((e) => { loading = null; throw e; });
    return loading;
  }

  const shuffle = (list) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const title = (th) => th.title[lang()] || th.title.tr;
  // Çizimler data/cocuk/resimler.json'dan gelir: yalnızca izinli SVG öğeleri kalır (js/html.js → sanitizeSvg).
  const picHtml = (svg, cls = 'ae-pic') => `<div class="${cls}" aria-hidden="true"><svg viewBox="0 0 100 100" focusable="false">${window.baHtml.sanitizeSvg(svg)}</svg></div>`;
  function houseSvg(a, lit, total) {
    const spots = [[26, 58], [54, 58], [26, 86], [54, 86], [40, 30]].slice(0, Math.max(4, total));
    const wins = spots.map(([x, y], i) => `<rect class="ae-win${i < lit ? ' is-on' : ''}" x="${x}" y="${y}" width="20" height="18" rx="3"/>`).join('');
    return `<svg viewBox="0 0 100 120" aria-hidden="true" focusable="false"><path class="ae-roof" d="M8 50L50 12l42 38z"/><rect class="ae-wall" x="16" y="48" width="68" height="66"/>${wins}</svg>`;
  }

  /* ---------- Views ---------- */
  let game = null; // { theme, order, i, firstTry, missed, tried:[], answered, lit, feedback }

  function shell(inner, { back = false } = {}) {
    root.innerHTML = `
      <header class="ae-head">
        <div>
          <p class="ae-kicker">${esc(t('aeKicker'))}</p>
          <h1 tabindex="-1">${esc(t('aeTitle'))}</h1>
        </div>
        <div class="ae-tools">
          ${back ? `<a class="btn ghost ae-back" href="#${PAGE}" data-ae-topics><span aria-hidden="true">←</span> ${esc(t('aeTopics'))}</a>` : ''}
          <button class="btn ghost ae-sound" type="button" data-ae-sound aria-pressed="true">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="ae-waves" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <span></span>
          </button>
        </div>
      </header>
      <p class="ae-note" data-ae-novoice hidden>${esc(t('aeNoVoice'))}</p>
      ${inner}
      <p class="ae-privacy">${esc(t('aePrivacy'))}${lang() !== 'tr' ? ' ' + esc(t('aeMeaningsTr')) : ''}</p>
      ${data && Object.keys(data.audio).length ? `<p class="ae-privacy" data-ae-credit>${esc(t('aeVoiceCredit'))}</p>` : ''}`;
    root.querySelector('[data-ae-sound]').addEventListener('click', () => {
      soundOn = !soundOn;
      writeStore({ sound: soundOn });
      if (!soundOn) stopAll(); else if (current) preload(current);
      updateSoundUi();
    });
    updateSoundUi();
  }

  function renderPick() {
    game = null;
    current = null;
    shell(`
      <p class="ae-lead">${esc(t('aeLead'))}</p>
      <h2>${esc(t('aePickTheme'))}</h2>
      <ul class="ae-themes">${data.themes.map((th) => {
        const best = bestOf(th.id);
        return `<li><a class="ae-theme" href="#${PAGE}/${esc(th.id)}" data-ae-theme="${esc(th.id)}">
          ${picHtml(data.pics[th.cover], 'ae-pic ae-pic--small')}
          <span class="ae-theme-text"><strong>${esc(title(th))}</strong>
          <span>${esc(fill('aeWordCount', { n: th.words.length }))}${best !== null ? ' · ' + esc(fill('aeBest', { best, n: th.words.length })) : ''}</span></span>
        </a></li>`;
      }).join('')}</ul>`);
  }

  function start(theme) {
    game = { theme, order: shuffle(theme.words), i: 0, firstTry: 0, missed: false, tried: [], answered: false,
      lit: { der: 0, die: 0, das: 0 }, feedback: null };
    renderWord();
  }

  function renderWord({ focus = null } = {}) {
    const g = game;
    if (g.i >= g.order.length) return renderEnd();
    const w = g.order[g.i];
    current = w;
    preload(w);
    const total = g.order.length;
    const perHouse = Math.ceil(total / 3);
    const fb = g.feedback;
    shell(`
      <section class="ae-board" aria-labelledby="aeWord">
        <div class="ae-status"><span>${esc(title(g.theme))} · ${esc(fill('aeProgress', { i: g.i + 1, n: total }))}</span><span data-ae-score>${esc(fill('aeFirstTry', { k: g.firstTry }))}</span></div>
        <div class="ae-card">
          ${picHtml(w.pic)}
          <div class="ae-card-text">
            <p class="ae-word" id="aeWord" lang="de">${g.answered ? `<span class="ae-art is-${esc(w.article)}">${esc(w.article)}</span> ` : ''}${esc(w.word)}</p>
            <p class="ae-tr" lang="tr">${esc(w.tr)}</p>
            <button class="btn ghost ae-listen" type="button" data-ae-listen aria-label="${esc(fill('aeListenLabel', { word: w.word }))}" hidden>
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              ${esc(t('aeListen'))}
            </button>
          </div>
        </div>
        <p class="ae-feedback${fb ? ' is-' + esc(fb.type) : ''}" role="status" data-ae-feedback>${fb ? esc(fb.text) : ''}</p>
        <div class="ae-houses">${ARTS.map((a) => {
          const tried = g.tried.includes(a);
          return `<button class="ae-house is-${esc(a)}${tried ? ' is-tried' : ''}" type="button" data-ae-house="${esc(a)}" aria-label="${esc(fill('aeHouse', { art: a }))}"${g.answered || tried ? ' disabled' : ''}>
            ${houseSvg(a, g.lit[a], perHouse)}<span class="ae-house-label" lang="de">${esc(a)}</span></button>`;
        }).join('')}</div>
        ${g.answered ? `<div class="ae-actions"><button class="btn primary" type="button" data-ae-next>${esc(t(g.i + 1 < total ? 'aeNext' : 'aeShowResult'))} <span aria-hidden="true">→</span></button></div>` : ''}
      </section>`, { back: true });
    root.querySelector('[data-ae-listen]').addEventListener('click', () => say(w, 'word'));
    root.querySelectorAll('[data-ae-house]').forEach((b) => b.addEventListener('click', () => answer(b.dataset.aeHouse)));
    root.querySelector('[data-ae-next]')?.addEventListener('click', () => {
      g.i++; g.missed = false; g.tried = []; g.answered = false; g.feedback = null;
      renderWord({ focus: 'house' });
      root.querySelector('.ae-board')?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'nearest' });
    });
    if (focus === 'next') root.querySelector('[data-ae-next]')?.focus();
    else if (focus === 'house') root.querySelector('[data-ae-house]:not([disabled])')?.focus({ preventScroll: true });
  }

  function answer(a) {
    const g = game;
    const w = g.order[g.i];
    if (g.answered || g.tried.includes(a)) return;
    if (a === w.article) {
      if (!g.missed) g.firstTry++;
      g.lit[a]++;
      g.answered = true;
      g.feedback = { type: 'right', text: `${t('aeRight')} ${w.article} ${w.word} – ${w.tr}${g.missed ? '' : '. ' + t('aeRightFirst')}` };
      say(w, 'article');
      renderWord({ focus: 'next' });
    } else {
      g.missed = true;
      g.tried.push(a);
      g.feedback = { type: 'wrong', text: fill('aeWrong', { art: a }) };
      renderWord({ focus: 'house' });
      const house = root.querySelector(`[data-ae-house="${esc(a)}"]`);
      if (house && !reduceMotion()) house.classList.add('is-shaking');
    }
  }

  function renderEnd() {
    const g = game;
    current = null;
    const n = g.order.length;
    const k = g.firstTry;
    // Saved once per game; a later redraw (e.g. a language change) shows the same result.
    if (!g.result) {
      const old = bestOf(g.theme.id);
      g.result = { best: Math.max(old ?? 0, k), record: old !== null && k > old };
      writeStore({ best: { ...(readStore().best || {}), [g.theme.id]: g.result.best } });
    }
    const { best, record } = g.result;
    const perHouse = Math.ceil(n / 3);
    shell(`
      <section class="ae-board ae-end" aria-labelledby="aeEndTitle">
        <div class="ae-houses" aria-hidden="true">${ARTS.map((a) => `<div class="ae-house is-${esc(a)}">${houseSvg(a, g.lit[a], perHouse)}<span class="ae-house-label" lang="de">${esc(a)}</span></div>`).join('')}</div>
        <h2 id="aeEndTitle" tabindex="-1">${esc(t('aeEndTitle'))}</h2>
        <p class="ae-end-score" data-ae-end-score>${esc(k ? fill('aeEndScore', { n, k, kk: lang() === 'tr' ? trAcc(k) : k }) : t('aeEndNone'))}</p>
        <p class="ae-end-best">${record ? `<strong>${esc(t('aeNewBest'))}</strong> ` : ''}${esc(fill('aeEndBest', { best, n }))}</p>
        <div class="ae-actions">
          <button class="btn primary" type="button" data-ae-again>${esc(t('aeAgain'))}</button>
          <a class="btn ghost" href="#${PAGE}" data-ae-other>${esc(t('aeOtherTopic'))}</a>
        </div>
      </section>`, { back: true });
    root.querySelector('[data-ae-again]').addEventListener('click', () => { start(g.theme); });
    root.querySelector('#aeEndTitle').focus({ preventScroll: true });
  }

  /* ---------- Routing ---------- */
  const active = () => document.getElementById('page-' + PAGE)?.classList.contains('active');
  async function show(hash, { focus = true } = {}) {
    const m = new RegExp(`^#${PAGE}(?:/([a-z0-9-]+))?$`).exec(hash);
    if (!m) return;
    if (!active()) window.BA?.showPage(PAGE, { historyMode: 'none', scroll: false });
    if (location.hash !== hash) history.replaceState({ ...(history.state || {}), baPage: PAGE }, '', hash);
    if (!data) root.innerHTML = `<p class="ae-status-line" role="status">${esc(t('aeLoading'))}</p>`;
    try { await load(); }
    catch (_) {
      root.innerHTML = `<p class="ae-status-line" role="alert">${esc(t('aeLoadError'))}</p><button class="btn primary" type="button" data-ae-retry>${esc(t('aeRetry'))}</button>`;
      root.querySelector('[data-ae-retry]').addEventListener('click', () => show(location.hash));
      return;
    }
    if (location.hash !== hash) return; // the visitor moved on while the files loaded
    const theme = data.themes.find((th) => th.id === m[1]);
    if (m[1] && !theme) { history.replaceState({ ...(history.state || {}), baPage: PAGE }, '', `#${PAGE}`); renderPick(); }
    else if (theme) { if (game?.theme.id !== theme.id) start(theme); else renderWord(); }
    else renderPick();
    if (focus) {
      root.querySelector('h1')?.focus({ preventScroll: true });
      root.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    }
  }

  // A link fires both hashchange and popstate; the second call finds the same game and only redraws it.
  window.addEventListener('hashchange', () => { if (location.hash.startsWith('#' + PAGE)) show(location.hash); });
  window.addEventListener('popstate', () => { if (location.hash.startsWith('#' + PAGE + '/')) show(location.hash, { focus: false }); });
  window.addEventListener('ba:languagechange', () => {
    if (!data || !active()) return;
    if (!game) renderPick();
    else if (game.i >= game.order.length) renderEnd();
    else renderWord();
  });
  document.addEventListener('DOMContentLoaded', () => {
    // app.js shortens the address to "#artikel-evleri" on load; open the topic from the full one.
    if (initialHash === '#' + PAGE || initialHash.startsWith('#' + PAGE + '/')) show(initialHash, { focus: false });
  });
})();
