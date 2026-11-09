// Almanca Alfabe oyunu (/almanca-alfabe/): arayüz, ses ve kayıt. Oyun mantığı js/alfabe-logic.js'te, veri data/alfabe.json'da.
// Adresler: #kesfet, #duy, #ilk-harf, #heceleme, #sirala (boş: mod seçimi). Profil (çocuk/yetişkin) seçimi ilk açılışta sorulur.
// Form yok. localStorage'da (baAlfabe) profil seçimi, ses ayarları ve profil başına harf ilerlemesi, en iyi skorlar ve
// yıldızlar. Depolama kapalıysa oyun yine çalışır, sadece hatırlamaz. Giriş yapmış onaylı öğrencide ilerleme ayrıca
// hesaba yazılır (js/account/alfabe-sync.js, users/{uid}/progress/alfabe); Firebase sadece öğrenci ipucu varsa yüklenir.
// Ses: tarayıcının cihazda çalışan Almanca (de) ve çocuk modunda Türkçe (tr) sesi (speechSynthesis, sadece localService:
// çevrim içi bir ses okunan metni tarayıcı üreticisinin sunucusuna gönderirdi). Ses yoksa oyun sessiz devam eder.
(() => {
  'use strict';
  const root = document.getElementById('alfabeApp');
  const L = window.baAlfabeLogic;
  if (!root || !L || !window.baHtml) return;

  const esc = (v) => window.baHtml.escapeHtml(v); // ortak kaçışlayıcı: js/html.js
  // html-safe-names: cards tiles head gainedTxt html wordLine line inner body
  const STORE = 'baAlfabe';
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const MODE_INFO = {
    kesfet: { title: 'Harfleri Keşfet', kid: '🔤', adult: 'Aa',
      text: { cocuk: 'Harfe dokun, adını dinle.', yetiskin: 'Bütün harfler: adı, okunuşu, örnek kelime ve ipucu.' },
      say: { cocuk: 'Bir harfe dokun ve dinle.', yetiskin: 'Bir harf seç: adını, okunuşunu ve örnek kelimeyi gör.' } },
    duy: { title: 'Duy ve Seç', kid: '👂', adult: 'A?',
      text: { cocuk: 'Dinle ve doğru harfi bul.', yetiskin: 'Harfin Almanca adını dinle, doğru harfi seç.' },
      say: { cocuk: 'Dinle ve doğru harfe dokun.', yetiskin: 'Harfin Almanca adını dinle ve doğru harfi seç.' } },
    'ilk-harf': { title: 'İlk Harf', kid: '🍎', adult: 'A…',
      text: { cocuk: 'Kelime hangi harfle başlıyor?', yetiskin: 'Günlük kelimelerin ilk harfini bul.' },
      say: { cocuk: 'Bu kelime hangi harfle başlıyor?', yetiskin: 'Bu kelime hangi harfle başlıyor?' } },
    heceleme: { title: 'Buchstabieren (Heceleme)', kid: '🧩', adult: 'B-A-L',
      text: { cocuk: 'Harfleri dinle, kelimeyi kur.', yetiskin: 'Telefonda isim, e-posta ve adres hecelemesi.' },
      say: { cocuk: 'Harfleri dinle ve kelimeyi kur.', yetiskin: 'Harf harf söyleneni dinle ve kelimeyi yaz.' } },
    sirala: { title: 'Sıraya Diz', kid: '🚂', adult: 'A→Z',
      text: { cocuk: 'Harfleri sıraya koy.', yetiskin: 'Karışık harfleri alfabe sırasına diz.' },
      say: { cocuk: 'Harfleri sıraya diz.', yetiskin: 'Harfleri sürükleyerek ya da dokunarak alfabe sırasına diz.' } }
  };
  const PROFILE_INFO = {
    cocuk: { label: 'Çocuk', icon: '🧒', text: 'Renkli, sesli ve kolay: üç seçenek, süre yok, yıldız topla.' },
    yetiskin: { label: 'Yetişkin', icon: '🎓', text: 'Günlük hayattan kelimeler, ayrıntılı telaffuz, zamana karşı mod.' }
  };
  const STICKERS = ['🐞', '🌈', '🎈', '🦋', '🍓', '🚲', '🌻', '🐢', '🎨', '🪁', '🐙', '🌙'];
  const TIMER = { duy: 10, 'ilk-harf': 10, heceleme: 35, sirala: 25 };

  /* ---------- Storage (every access in try/catch) ---------- */
  const emptyProgress = () => ({ stats: {}, best: {}, stars: 0 });
  function readStore() {
    let v = null;
    try { v = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (_) { v = null; }
    if (!v || typeof v !== 'object') v = {};
    const p = v.p && typeof v.p === 'object' ? v.p : {};
    const prog = (x) => (x && typeof x === 'object' ? { stats: x.stats && typeof x.stats === 'object' ? x.stats : {}, best: x.best && typeof x.best === 'object' ? x.best : {}, stars: Number(x.stars) || 0 } : emptyProgress());
    return {
      profil: v.profil === 'cocuk' || v.profil === 'yetiskin' ? v.profil : null,
      // Hangi hesapla eşitlendi: başka bir hesabın yerel ilerlemesi yeni girişteki hesaba karıştırılmaz.
      uid: typeof v.uid === 'string' && v.uid ? v.uid : null,
      ses: v.ses !== false, yavas: v.yavas === true, zaman: v.zaman === true,
      p: { cocuk: prog(p.cocuk), yetiskin: prog(p.yetiskin) }
    };
  }
  const store = readStore();
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(store)); } catch (_) { /* depolama kapalı: oyun hatırlamadan devam eder */ }
  }
  const progress = () => store.p[store.profil];
  const settings = () => L.PROFILES[store.profil];

  /* ---------- Sound ---------- */
  // js/alfabe-audio.js: the site's own recordings (audio/alfabe/, list audio/alfabe/manifest.json) first, then an
  // on-device voice. Nothing plays before the first touch or key press; a new sound stops the previous one.
  const audio = window.baAlfabeAudio
    ? window.baAlfabeAudio.create({ base: '/audio/alfabe/', slowRate: L.SLOW_PLAYBACK, slowTts: L.SLOW_RATE, onVoices: () => updateSoundUi() })
    : null;
  let voiceChecked = false;
  // o.gap: pause between the parts in ms (spelling: letter by letter).
  function speak(parts, o) {
    if (!store.ses || !audio || !parts.length) return;
    audio.play(parts, { slow: store.yavas, gap: (o && o.gap) || 0 });
  }
  function stopSound() { if (audio) audio.stop(); }
  const spellGap = () => (store.yavas ? L.SPELL_GAP_SLOW : L.SPELL_GAP);
  // Parts: clip id (file), text (on-device voice when there is no file), language.
  const letterPart = (l) => ({ clip: L.audioId.letter(l), text: l.soyle || l.ad, lang: 'de', rate: settings().rate });
  const wordPart = (ex) => ({ clip: L.audioId.word(ex), text: ex.artikel + ' ' + ex.kelime, lang: 'de', rate: settings().rate });
  const phrasePart = (key, lang) => ({ clip: L.audioId.phrase(key), text: (data.seslendirme && data.seslendirme[lang] && data.seslendirme[lang][key]) || '', lang });
  function tokenPart(t) {
    if (t.id) return letterPart(letter(t.id));
    const sign = data.isaretler[t.char];
    return { clip: L.audioId.sign(t.char, sign), text: sign.ad, lang: 'de', rate: settings().rate };
  }
  // Children hear the Turkish instruction too.
  function instruction(mode) { return settings().speakInstructions ? [phrasePart('talimat-' + mode, 'tr')] : []; }
  const canHear = () => store.ses && Boolean(audio) && (audio.has('harf-a') || Boolean(audio.voice('de')));
  function updateSoundUi() {
    const note = root.querySelector('[data-ab-novoice]');
    if (note) note.hidden = !voiceChecked || !store.ses || canHear();
    root.querySelectorAll('[data-ab-textfallback]').forEach((el) => { el.hidden = canHear(); });
  }
  setTimeout(() => { voiceChecked = true; if (audio) audio.refreshVoices(); updateSoundUi(); }, 1500);

  /* ---------- Data ---------- */
  let data = null;
  const letterHtml = (l) => esc(l.buyuk ? l.buyuk + l.kucuk : l.kucuk);
  const big = (l) => l.buyuk || l.kucuk;

  /* ---------- State ---------- */
  let game = null; // { mode, focus, questions, index, score, answered, picked, order, timer… }
  let timerId = null;
  let selected = null; // Keşfet: chosen letter id
  let dragEnd = 0; // the click that follows a drag is not a tap
  function clearTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

  /* ---------- Shell ---------- */
  function toolbarHtml() {
    const p = PROFILE_INFO[store.profil];
    const kid = store.profil === 'cocuk';
    return `<div class="ab-toolbar" role="toolbar" aria-label="Oyun ayarları">
      <a class="ab-tool ab-home" href="#" data-ab-home aria-label="Modlara dön">${kid ? '🏠' : '☰'}<span>Modlar</span></a>
      ${kid ? `<span class="ab-stars" aria-label="${esc(progress().stars + ' yıldız')}"><span aria-hidden="true">⭐</span> ${Number(progress().stars)}</span>` : ''}
      <span class="ab-tool-gap"></span>
      <button class="ab-tool" type="button" data-ab-sound aria-pressed="${store.ses ? 'true' : 'false'}" aria-label="${store.ses ? 'Sesi kapat' : 'Sesi aç'}">${store.ses ? '🔊' : '🔇'}<span>${store.ses ? 'Ses açık' : 'Ses kapalı'}</span></button>
      <button class="ab-tool" type="button" data-ab-slow aria-pressed="${store.yavas ? 'true' : 'false'}" aria-label="Yavaş oku">${kid ? '🐢' : '½×'}<span>Yavaş oku</span></button>
      <button class="ab-tool ab-profile" type="button" data-ab-profile aria-label="${esc('Profil: ' + p.label + '. Profili değiştir')}"><span aria-hidden="true">${esc(p.icon)}</span><span>${esc(p.label)}</span></button>
    </div>
    <p class="ab-note" data-ab-novoice role="status" hidden>Bu cihazda Almanca ses bulunamadı. Oyun sessiz devam ediyor; okunuşlar yazıyla gösteriliyor.</p>`;
  }
  function paint(inner) {
    root.dataset.profil = store.profil || 'secim';
    root.innerHTML = (store.profil ? toolbarHtml() : '') + `<div class="ab-stage">${inner}</div>`;
    root.querySelector('[data-ab-home]')?.addEventListener('click', (e) => { e.preventDefault(); go(''); });
    root.querySelector('[data-ab-sound]')?.addEventListener('click', () => {
      store.ses = !store.ses; save(); if (!store.ses) stopSound(); rerender();
      root.querySelector('[data-ab-sound]')?.focus();
    });
    root.querySelector('[data-ab-slow]')?.addEventListener('click', () => {
      store.yavas = !store.yavas; save(); rerender();
      root.querySelector('[data-ab-slow]')?.focus();
    });
    root.querySelector('[data-ab-profile]')?.addEventListener('click', () => { clearTimer(); stopSound(); renderProfiles(true); });
    updateSoundUi();
  }
  // Re-render after a settings change without starting a new round.
  let rerender = () => {};
  let view = 'yukleniyor'; // the account sync redraws only the menu and the letter grid
  let accountSynced = false;
  function focusStage(sel) {
    const el = root.querySelector(sel || '.ab-stage h2');
    if (!el) return;
    if (!el.hasAttribute('tabindex') && !/^(BUTTON|INPUT|A)$/.test(el.tagName)) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }

  /* ---------- Profile ---------- */
  function renderProfiles(changing) {
    rerender = () => renderProfiles(changing);
    view = 'profil';
    const cards = ['cocuk', 'yetiskin'].map((id) => {
      const p = PROFILE_INFO[id];
      const cur = store.profil === id;
      return `<button class="ab-profile-card is-${esc(id)}" type="button" data-ab-pick="${esc(id)}" aria-pressed="${cur ? 'true' : 'false'}">
        <span class="ab-profile-icon" aria-hidden="true">${esc(p.icon)}</span>
        <span class="ab-profile-name">${esc(p.label)}</span>
        <span class="ab-profile-text">${esc(p.text)}</span>
      </button>`;
    }).join('');
    const body = `<h2 class="ab-title">${changing ? 'Profili değiştir' : 'Kim oynuyor?'}</h2>
      <p class="ab-lead">Profil seç. İlerlemen her profil için ayrı tutulur; seçimi her zaman sağ üstten değiştirebilirsin.</p>
      <div class="ab-profiles">${cards}</div>
      ${changing && store.profil ? '<p class="ab-center"><button class="btn ghost" type="button" data-ab-cancel>Vazgeç</button></p>' : ''}`;
    root.dataset.profil = 'secim';
    root.innerHTML = `<div class="ab-stage">${body}</div>`;
    root.querySelectorAll('[data-ab-pick]').forEach((b) => b.addEventListener('click', () => {
      store.profil = b.dataset.abPick; save();
      route();
    }));
    root.querySelector('[data-ab-cancel]')?.addEventListener('click', route);
    focusStage();
  }

  /* ---------- Menu ---------- */
  function bestKey(mode, timed) { return mode + (timed ? ':zaman' : ''); }
  function renderMenu() {
    clearTimer(); game = null;
    rerender = renderMenu;
    view = 'menu';
    const kid = store.profil === 'cocuk';
    const prog = progress();
    const learned = data.harfler.filter((l) => L.isLearned(L.statFor(prog.stats, l.id))).length;
    const hard = L.hardLetters(prog.stats, data.harfler).slice(0, 8);
    const cards = L.MODES.map((m) => {
      const info = MODE_INFO[m];
      const best = prog.best[bestKey(m, false)];
      const bestT = prog.best[bestKey(m, true)];
      const bestTxt = m === 'kesfet' ? '' : [best != null ? 'En iyi: ' + best : '', !kid && bestT != null ? 'Zamana karşı: ' + bestT : ''].filter(Boolean).join(' · ');
      return `<li><a class="ab-mode" href="#${esc(m)}" data-ab-mode="${esc(m)}">
        <span class="ab-mode-icon" aria-hidden="true">${esc(kid ? info.kid : info.adult)}</span>
        <span class="ab-mode-body"><strong>${esc(info.title)}</strong><span>${esc(info.text[store.profil])}</span>${bestTxt ? `<em>${esc(bestTxt)}</em>` : ''}</span>
      </a></li>`;
    }).join('');
    const stickers = kid ? STICKERS.slice(0, Math.min(STICKERS.length, Math.floor(prog.stars / 10))) : [];
    const body = `<h2 class="ab-title">${kid ? 'Ne oynayalım?' : 'Bir mod seç'}</h2>
      <div class="ab-progress" aria-label="${esc('Öğrenilen harfler: ' + learned + ' / ' + data.harfler.length)}">
        <div class="ab-progress-bar"><span style="width:${Math.round((learned / data.harfler.length) * 100)}%"></span></div>
        <span>Öğrenilen harfler: <strong>${Number(learned)} / ${data.harfler.length}</strong></span>
      </div>
      ${kid ? `<p class="ab-stickers" aria-label="Çıkartmalar">${stickers.length ? stickers.map((s) => `<span class="ab-sticker">${esc(s)}</span>`).join('') : '<span class="ab-muted">Her 10 yıldızda yeni bir çıkartma kazanırsın.</span>'}</p>` : ''}
      <ul class="ab-modes">${cards}</ul>
      ${!kid ? `<label class="ab-switch"><input type="checkbox" data-ab-timed${store.zaman ? ' checked' : ''}> <span><strong>Zamana Karşı</strong> · Her soru için süre var; kalan her saniye puan getirir.</span></label>` : ''}
      ${hard.length ? `<p class="ab-hard">Zor harflerin: ${hard.map((l) => `<span class="ab-chip">${esc(big(l))}</span>`).join('')} <span class="ab-muted">Bu harfler sonraki turlarda daha sık gelir.</span></p>` : ''}
      <p class="ab-info">${esc(data.bilgiNotu)}</p>
      ${accountSynced ? '<p class="ab-muted ab-small" data-ab-synced>İlerlemen hesabına da kaydediliyor.</p>' : ''}`;
    paint(body);
    root.querySelector('[data-ab-timed]')?.addEventListener('change', (e) => { store.zaman = e.target.checked; save(); });
    root.querySelectorAll('[data-ab-mode]').forEach((a) => a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      go(a.dataset.abMode);
    }));
  }

  /* ---------- Explore ---------- */
  function wordHtml(ex, letter, mark) {
    // der Vogel with the letter highlighted (der Bär: the ä in the middle).
    const word = Array.from(ex.kelime);
    const at = mark === 'first' ? 0 : L.letterIndexInWord(ex.kelime, letter);
    const lowerWord = ex.kelime.toLocaleLowerCase('de-DE');
    const idx = at >= 0 ? Array.from(lowerWord.slice(0, at)).length : -1;
    return `<span class="ab-art">${esc(ex.artikel)}</span> ${word.map((ch, i) => (i === idx ? `<mark>${esc(ch)}</mark>` : esc(ch))).join('')}`;
  }
  function detailHtml(l) {
    const ex = L.exampleOf(l, store.profil);
    const adult = settings().detail;
    return `<div class="ab-detail" data-ab-detail>
      <div class="ab-detail-letter" aria-hidden="true">${letterHtml(l)}</div>
      <div class="ab-detail-body">
        <p class="ab-detail-name"><span lang="de">${esc(l.ad)}</span> <span class="ab-muted">okunuşu:</span> <strong>“${esc(l.okunus)}”</strong></p>
        <p class="ab-example"><span class="ab-emoji" aria-hidden="true">${esc(ex.emoji)}</span> <span lang="de">${wordHtml(ex, l)}</span> <span class="ab-muted">· ${esc(ex.anlam)}</span>${adult && ex.okunus ? ` <span class="ab-muted">· okunuşu “${esc(ex.okunus)}”</span>` : ''}</p>
        <p class="ab-tip"><span aria-hidden="true">💡</span> ${esc(l.ipucu)}</p>
        ${adult && l.detay ? `<p class="ab-tip ab-tip-more">${esc(l.detay)}</p>` : ''}
        <p><button class="btn ghost ab-listen" type="button" data-ab-again><span aria-hidden="true">🔊</span> Tekrar dinle</button></p>
      </div>
    </div>`;
  }
  function sayLetter(l) {
    const ex = L.exampleOf(l, store.profil);
    speak([letterPart(l), wordPart(ex)], { gap: 250 });
  }
  function renderExplore(first) {
    rerender = () => renderExplore(false);
    view = 'kesfet';
    const prog = progress();
    const tiles = data.harfler.map((l) => {
      const learned = L.isLearned(L.statFor(prog.stats, l.id));
      return `<button class="ab-tile${selected === l.id ? ' is-on' : ''}" type="button" data-ab-letter="${esc(l.id)}" aria-pressed="${selected === l.id}" aria-label="${esc((l.buyuk || '') + ' ' + l.kucuk + ', ' + l.ad + (learned ? ', öğrenildi' : ''))}">${letterHtml(l)}${learned ? '<span class="ab-check" aria-hidden="true">✓</span>' : ''}</button>`;
    }).join('');
    const l = selected ? data.harfler.find((x) => x.id === selected) : null;
    const adult = settings().detail;
    const body = `<h2 class="ab-title">${esc(MODE_INFO.kesfet.title)}</h2>
      <p class="ab-lead">${esc(MODE_INFO.kesfet.say[store.profil])}</p>
      <div class="ab-explore">
        <div class="ab-grid" role="group" aria-label="Alfabe">${tiles}</div>
        <div class="ab-detail-wrap" aria-live="polite">${l ? detailHtml(l) : '<p class="ab-muted ab-detail-empty">Bir harf seç.</p>'}</div>
      </div>
      <p class="ab-info">${esc(data.bilgiNotu)}</p>
      ${adult ? `<section class="ab-bonus" aria-labelledby="abBonus"><h3 id="abBonus">Bonus: harf ikilileri</h3>
        <table><thead><tr><th scope="col">Yazılış</th><th scope="col">Okunuş</th><th scope="col">Örnek</th></tr></thead><tbody>
        ${data.bonus.map((b) => `<tr><td lang="de"><strong>${esc(b.yazilis)}</strong></td><td>“${esc(b.okunus)}”</td><td>${esc(b.ornek)}</td></tr>`).join('')}
        </tbody></table></section>` : ''}`;
    paint(body);
    root.querySelectorAll('[data-ab-letter]').forEach((b) => b.addEventListener('click', () => {
      selected = b.dataset.abLetter;
      const letter = data.harfler.find((x) => x.id === selected);
      renderExplore(false);
      root.querySelector(`[data-ab-letter="${CSS.escape(selected)}"]`)?.focus();
      sayLetter(letter);
    }));
    root.querySelector('[data-ab-again]')?.addEventListener('click', () => sayLetter(l));
    if (first) { focusStage(); speak(instruction('kesfet')); }
  }

  /* ---------- Rounds ---------- */
  function startRound(mode, focus) {
    clearTimer(); stopSound();
    const timed = !settings().combo ? false : store.zaman && settings().timer;
    game = {
      mode, focus: focus || null, timed,
      questions: L.buildRound(mode, { data, profile: store.profil, stats: progress().stats, focus: focus || null }),
      index: 0, score: {}, answered: false
    };
    showQuestion(true);
  }
  const q = () => game.questions[game.index];
  function letter(id) { return data.harfler.find((l) => l.id === id); }

  function promptParts(question, withInstruction) {
    const parts = withInstruction ? instruction(question.mode) : [];
    if (question.mode === 'duy') parts.push(letterPart(letter(question.answer)));
    if (question.mode === 'ilk-harf') parts.push(wordPart(question.word));
    if (question.mode === 'heceleme') {
      if (question.scene) parts.push({ clip: L.audioId.question(question.scene), text: question.scene.soru, lang: 'de', rate: settings().rate });
      question.tokens.forEach((t) => parts.push(tokenPart(t)));
    }
    return parts;
  }
  // Spelling: a natural pause between the letters; elsewhere a short one.
  const promptGap = (question) => ({ gap: question.mode === 'heceleme' ? spellGap() : 250 });
  const spelledText = (question) => question.tokens.map((t) => t.name).join(' – ');

  function headerHtml() {
    const kid = store.profil === 'cocuk';
    const s = game.score;
    const right = s.right || 0;
    return `<div class="ab-qhead">
      <span class="ab-count">Soru ${Number(game.index + 1)} / ${game.questions.length}</span>
      ${kid ? `<span class="ab-qstars" aria-label="${esc(right + ' yıldız')}"><span aria-hidden="true">⭐</span> ${Number(right)}</span>`
        : `<span class="ab-points">${Number(s.points || 0)} puan${(s.streak || 0) >= 2 ? ` · <span class="ab-combo">seri ${Number(s.streak)}${(s.streak || 0) >= 3 ? ' ×' + Number(s.multiplier || 1) : ''}</span>` : ''}</span>`}
      <div class="ab-qbar" aria-hidden="true"><span style="width:${Math.round((game.index / game.questions.length) * 100)}%"></span></div>
      ${game.timed ? '<div class="ab-timer" aria-hidden="true"><span data-ab-timer></span></div><span class="ab-sr" data-ab-timeleft></span>' : ''}
    </div>`;
  }
  function optionsHtml(question) {
    return `<div class="ab-options" role="group" aria-label="Seçenekler">${question.options.map((id) => {
      const l = letter(id);
      return `<button class="ab-option" type="button" data-ab-opt="${esc(id)}" aria-label="${esc((l.buyuk || '') + ' ' + l.kucuk)}">${letterHtml(l)}</button>`;
    }).join('')}</div>`;
  }
  function listenButtonHtml(label) {
    return `<button class="ab-play" type="button" data-ab-play><span aria-hidden="true">🔊</span> ${esc(label)}</button>`;
  }

  function promptHtml(question) {
    const kid = store.profil === 'cocuk';
    const say = MODE_INFO[question.mode].say[store.profil];
    if (question.mode === 'duy') {
      const l = letter(question.answer);
      return `<p class="ab-ask">${esc(say)}</p>
        <div class="ab-prompt">${listenButtonHtml(kid ? 'Dinle' : 'Harfi dinle')}
        <p class="ab-fallback" data-ab-textfallback>Sesi duyamıyorsan: harfin adı <strong>“${esc(l.okunus)}”</strong> diye okunur.</p></div>`;
    }
    if (question.mode === 'ilk-harf') {
      const ex = question.word;
      return `<p class="ab-ask">${esc(say)}</p>
        <div class="ab-prompt"><span class="ab-big-emoji" aria-hidden="true">${esc(ex.emoji)}</span>
        <p class="ab-word" lang="de"><span class="ab-art">${esc(ex.artikel)}</span> ${esc(ex.kelime)}</p>
        <p class="ab-muted">${esc(ex.anlam)}</p>${listenButtonHtml('Dinle')}</div>`;
    }
    if (question.mode === 'heceleme') {
      const scene = question.scene;
      const head = scene
        ? `<div class="ab-scene"><p class="ab-scene-type">${esc(scene.tur)}</p><p>${esc(scene.durum)}</p><p class="ab-quote" lang="de">„${esc(scene.soru)}“ – „Wie schreibt man das?“</p></div>`
        : (kid ? `<span class="ab-big-emoji" aria-hidden="true">${esc(question.example.emoji)}</span>`
          : `<p class="ab-muted">Kelimenin anlamı: ${esc(question.example.anlam)}</p>`);
      return `<p class="ab-ask">${esc(say)}</p>
        <div class="ab-prompt">${head}${listenButtonHtml(kid ? 'Dinle' : 'Harfleri dinle')}
        <p class="ab-fallback" data-ab-textfallback lang="de">${esc(spelledText(question))}</p>
        <p><button class="ab-linkbtn" type="button" data-ab-show>Yazıyla göster</button></p>
        <p class="ab-spelled" data-ab-spelled lang="de" hidden>${esc(spelledText(question))}</p></div>`;
    }
    return `<p class="ab-ask">${esc(say)}</p>`;
  }

  function controlsHtml(question) {
    if (question.mode === 'duy' || question.mode === 'ilk-harf') return optionsHtml(question);
    if (question.mode === 'heceleme') {
      if (settings().spellInput === 'buttons') {
        const built = game.built || [];
        return `<div class="ab-built" aria-live="polite" aria-label="${esc('Kurduğun kelime: ' + (built.join('') || 'boş'))}" lang="de">${built.length ? built.map((ch, i) => `<span class="ab-slot">${esc(i === 0 ? ch.toLocaleUpperCase('de-DE') : ch)}</span>`).join('') : '<span class="ab-slot is-empty">?</span>'}</div>
          <div class="ab-letters" role="group" aria-label="Harfler">${question.tiles.map((ch, i) => `<button class="ab-option ab-letterbtn" type="button" data-ab-tile="${i}"${(game.used || []).includes(i) ? ' disabled' : ''} aria-label="${esc(L.letterForChar(ch, data.harfler).ad)}">${esc(ch.toLocaleUpperCase('de-DE') === 'SS' ? ch : ch.toLocaleUpperCase('de-DE'))}</button>`).join('')}</div>
          <div class="ab-actions"><button class="btn ghost" type="button" data-ab-undo${built.length ? '' : ' disabled'}><span aria-hidden="true">⌫</span> Sil</button>
          <button class="btn primary" type="button" data-ab-check${built.length ? '' : ' disabled'}>Kontrol et</button></div>`;
      }
      return `<form class="ab-type" data-ab-form autocomplete="off">
          <label for="abSpell">Duyduğunu yaz</label>
          <input id="abSpell" class="ab-input" type="text" lang="de" inputmode="email" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" maxlength="60">
          <div class="ab-keys" role="group" aria-label="Özel harfler">${['ä', 'ö', 'ü', 'ß', '@', '.', '-'].map((k) => `<button class="ab-key" type="button" data-ab-key="${esc(k)}">${esc(k)}</button>`).join('')}</div>
          <p class="ab-muted ab-small">Büyük/küçük harf önemli değil; ä, ö, ü, ß yerine ae, oe, ue, ss de yazabilirsin.</p>
          <button class="btn primary" type="submit">Kontrol et</button>
        </form>`;
    }
    // sirala
    const order = game.order;
    return `<p class="ab-muted ab-small">${store.profil === 'cocuk' ? 'İki harfe dokun, yer değiştirsinler. Ya da sürükle.' : 'Sürükle-bırak, iki harfe sırayla dokunarak yer değiştir ya da harfi seçip ← → oklarıyla taşı.'}</p>
      <ol class="ab-order" aria-label="Harf sırası">${order.map((id, i) => {
        const l = letter(id);
        return `<li><button class="ab-option ab-ordertile${game.pick === i ? ' is-picked' : ''}" type="button" data-ab-pos="${i}" aria-pressed="${game.pick === i}" aria-label="${esc((i + 1) + '. sıra: ' + l.buyuk + (game.pick === i ? ', seçili' : ''))}">${esc(l.buyuk)}</button></li>`;
      }).join('')}</ol>
      <div class="ab-actions"><button class="btn primary" type="button" data-ab-check>Kontrol et</button></div>`;
  }

  function showQuestion(withInstruction) {
    clearTimer();
    const question = q();
    game.answered = false; game.built = []; game.used = []; game.pick = null;
    if (question.mode === 'sirala') game.order = question.shuffled.slice();
    rerender = () => drawQuestion(false);
    view = 'oyun';
    drawQuestion(true);
    speak(promptParts(question, withInstruction || settings().speakInstructions), promptGap(question));
    if (game.timed) startTimer();
  }
  function drawQuestion(focus) {
    const question = q();
    const body = `${headerHtml()}<h2 class="ab-title ab-qtitle">${esc(MODE_INFO[question.mode].title)}</h2>
      ${promptHtml(question)}
      <div class="ab-controls" data-ab-controls>${controlsHtml(question)}</div>
      <div class="ab-feedback" data-ab-feedback role="status" aria-live="polite"></div>`;
    paint(body);
    bindQuestion();
    if (focus) {
      if (question.mode === 'heceleme' && settings().spellInput === 'keyboard') root.querySelector('#abSpell')?.focus({ preventScroll: true });
      else focusStage('.ab-qtitle');
    }
  }
  function bindQuestion() {
    const question = q();
    root.querySelector('[data-ab-play]')?.addEventListener('click', () => speak(promptParts(question, false), promptGap(question)));
    root.querySelector('[data-ab-show]')?.addEventListener('click', (e) => { root.querySelector('[data-ab-spelled]').hidden = false; e.currentTarget.hidden = true; });
    root.querySelectorAll('[data-ab-opt]').forEach((b) => b.addEventListener('click', () => answerChoice(b.dataset.abOpt)));
    if (question.mode === 'heceleme') bindSpelling(question);
    if (question.mode === 'sirala') bindOrder();
  }
  function redrawControls(focusSel) {
    const box = root.querySelector('[data-ab-controls]');
    box.innerHTML = controlsHtml(q());
    bindQuestion();
    if (focusSel) root.querySelector(focusSel)?.focus();
  }

  function bindSpelling(question) {
    if (settings().spellInput === 'buttons') {
      root.querySelectorAll('[data-ab-tile]').forEach((b) => b.addEventListener('click', () => {
        if (game.answered) return;
        const i = Number(b.dataset.abTile);
        game.built.push(question.tiles[i]); game.used.push(i);
        speak([letterPart(L.letterForChar(question.tiles[i], data.harfler))]);
        const next = root.querySelector('[data-ab-tile]:not([disabled]):not([data-ab-tile="' + i + '"])');
        redrawControls(next ? `[data-ab-tile="${next.dataset.abTile}"]` : '[data-ab-check]');
        if (game.built.length === Array.from(question.word).length) root.querySelector('[data-ab-check]')?.focus();
      }));
      root.querySelector('[data-ab-undo]')?.addEventListener('click', () => {
        if (game.answered) return;
        game.built.pop(); game.used.pop();
        redrawControls('[data-ab-undo]:not([disabled])');
        if (!game.built.length) root.querySelector('[data-ab-tile]')?.focus();
      });
      root.querySelector('[data-ab-check]')?.addEventListener('click', () => answerSpelling(game.built.join('')));
      return;
    }
    const input = root.querySelector('#abSpell');
    root.querySelectorAll('[data-ab-key]').forEach((b) => b.addEventListener('click', () => {
      const s = input.selectionStart ?? input.value.length, e = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, s) + b.dataset.abKey + input.value.slice(e);
      input.focus(); input.setSelectionRange(s + b.dataset.abKey.length, s + b.dataset.abKey.length);
    }));
    root.querySelector('[data-ab-form]')?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (game.answered) return;
      if (!input.value.trim()) { input.focus(); return; }
      answerSpelling(input.value);
    });
  }

  // Sıraya Diz: drag with mouse/touch/pen (pointer events), tap two tiles to swap, or ← → to move the focused tile.
  function bindOrder() {
    const tiles = [...root.querySelectorAll('[data-ab-pos]')];
    tiles.forEach((b) => {
      const i = Number(b.dataset.abPos);
      b.addEventListener('keydown', (e) => {
        if (game.answered) return;
        const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0;
        if (!dir) return;
        e.preventDefault();
        const to = i + dir;
        if (to < 0 || to >= game.order.length) return;
        game.order = L.moveItem(game.order, i, to); game.pick = null;
        redrawControls(`[data-ab-pos="${to}"]`);
      });
      b.addEventListener('click', (e) => {
        if (game.answered || performance.now() - dragEnd < 400) return;
        e.preventDefault();
        if (game.pick === null) { game.pick = i; speak([letterPart(letter(game.order[i]))]); redrawControls(`[data-ab-pos="${i}"]`); return; }
        if (game.pick !== i) game.order = L.swapItems(game.order, game.pick, i);
        game.pick = null;
        redrawControls(`[data-ab-pos="${i}"]`);
      });
      b.addEventListener('pointerdown', (e) => {
        if (game.answered || (e.pointerType === 'mouse' && e.button !== 0)) return;
        const start = { x: e.clientX, y: e.clientY };
        let moving = false;
        let ghostOver = null;
        const move = (ev) => {
          const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
          if (!moving && Math.hypot(dx, dy) < 8) return;
          moving = true;
          b.classList.add('is-drag');
          b.style.transform = `translate(${dx}px, ${dy}px)`;
          // The dragged tile is under the pointer itself, so find the target from the other tiles' boxes.
          const el = tiles.find((t) => { if (t === b) return false; const r = t.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; });
          tiles.forEach((t) => t.classList.toggle('is-over', t === el && t !== b));
          ghostOver = el && el !== b ? Number(el.dataset.abPos) : null;
        };
        const up = () => {
          b.removeEventListener('pointermove', move);
          b.removeEventListener('pointerup', up);
          b.removeEventListener('pointercancel', up);
          if (!moving) return;
          dragEnd = performance.now();
          if (ghostOver !== null) game.order = L.moveItem(game.order, i, ghostOver);
          game.pick = null;
          redrawControls(ghostOver !== null ? `[data-ab-pos="${ghostOver}"]` : `[data-ab-pos="${i}"]`);
        };
        try { b.setPointerCapture(e.pointerId); } catch (_) {}
        b.addEventListener('pointermove', move);
        b.addEventListener('pointerup', up);
        b.addEventListener('pointercancel', up);
      });
    });
    root.querySelector('[data-ab-check]')?.addEventListener('click', () => answerOrder());
  }

  /* ---------- Timer (adults, "Zamana Karşı") ---------- */
  function startTimer() {
    const total = TIMER[q().mode] * 1000;
    const startAt = performance.now();
    game.secondsLeft = TIMER[q().mode];
    let announced = null;
    timerId = setInterval(() => {
      const left = Math.max(0, total - (performance.now() - startAt));
      game.secondsLeft = left / 1000;
      const bar = root.querySelector('[data-ab-timer]');
      if (bar) bar.style.width = (left / total) * 100 + '%';
      const sec = Math.ceil(left / 1000);
      const sr = root.querySelector('[data-ab-timeleft]');
      if (sr && sec !== announced && (sec === 5 || sec === 0)) { sr.textContent = sec ? sec + ' saniye kaldı' : ''; announced = sec; }
      if (left <= 0) { clearTimer(); timeUp(); }
    }, 100);
  }
  function timeUp() {
    if (game.answered) return;
    const question = q();
    if (question.mode === 'sirala') answerOrder(true);
    else if (question.mode === 'heceleme') answerSpelling(root.querySelector('#abSpell')?.value || (game.built || []).join(''), true);
    else answerChoice(null, true);
  }

  /* ---------- Answers ---------- */
  function finish(correct, wrongLetters, html, timeUp) {
    clearTimer();
    game.answered = true;
    const question = q();
    const prog = progress();
    if (correct) question.letters.forEach((id) => { prog.stats = L.recordAnswer(prog.stats, id, true); });
    else (wrongLetters.length ? wrongLetters : question.letters).forEach((id) => { prog.stats = L.recordAnswer(prog.stats, id, false); });
    const prevStreak = game.score.streak || 0;
    game.score = L.scoreAnswer(game.score, correct, store.profil, game.timed ? game.secondsLeft : 0);
    if (correct && store.profil === 'cocuk') prog.stars += 1;
    save();
    root.querySelectorAll('[data-ab-controls] button, [data-ab-controls] input').forEach((el) => { el.disabled = true; });
    const fb = root.querySelector('[data-ab-feedback]');
    const kid = store.profil === 'cocuk';
    const last = game.index === game.questions.length - 1;
    const gainedTxt = !kid && correct ? ` <span class="ab-gain">+${Number(game.score.gained)}${game.score.multiplier > 1 ? ' (×' + Number(game.score.multiplier) + ')' : ''}</span>` : '';
    fb.className = 'ab-feedback ' + (correct ? 'is-right' : 'is-wrong');
    fb.innerHTML = correct
      ? `<p class="ab-fb-title"><span aria-hidden="true">${kid ? '⭐' : '✓'}</span> <span lang="de">Richtig!</span> / Doğru!${gainedTxt}</p>${html}`
      : `<p class="ab-fb-title">${timeUp ? 'Süre doldu.' : (kid ? 'Neredeyse!' : 'Bu sefer olmadı.')}${!kid && prevStreak >= 3 ? ' Seri sıfırlandı.' : ''}</p>${html}`;
    fb.insertAdjacentHTML('beforeend', `<p><button class="btn primary ab-next" type="button" data-ab-next>${last ? 'Sonucu gör' : 'Devam'} <span aria-hidden="true">→</span></button></p>`);
    if (!reduceMotion()) fb.classList.add('is-anim');
    const nextBtn = fb.querySelector('[data-ab-next]');
    nextBtn.addEventListener('click', next);
    nextBtn.focus({ preventScroll: true });
    try { nextBtn.scrollIntoView({ block: 'nearest', behavior: reduceMotion() ? 'auto' : 'smooth' }); } catch (_) {}
    const head = root.querySelector('.ab-qhead');
    if (head) { const tmp = document.createElement('div'); tmp.innerHTML = headerHtml(); head.replaceWith(tmp.firstElementChild); }
    return fb;
  }
  function wrongTip(l, extraHtml) {
    return `<p>Doğru cevap: <strong class="ab-answer">${letterHtml(l)}</strong> <span class="ab-muted">· adı <span lang="de">${esc(l.ad)}</span>, okunuşu “${esc(l.okunus)}”</span></p>${extraHtml || ''}<p class="ab-tip"><span aria-hidden="true">💡</span> ${esc(l.ipucu)}</p>`;
  }
  function answerChoice(id, timeUp) {
    if (game.answered) return;
    const question = q();
    const correct = id === question.answer;
    const l = letter(question.answer);
    if (id) {
      root.querySelector(`[data-ab-opt="${CSS.escape(id)}"]`)?.classList.add(correct ? 'is-right' : 'is-wrong');
    }
    root.querySelector(`[data-ab-opt="${CSS.escape(question.answer)}"]`)?.classList.add('is-right');
    const wordLine = question.mode === 'ilk-harf' ? `<p lang="de" class="ab-word-small">${wordHtml(question.word, l, 'first')}</p>` : '';
    const html = correct ? `${wordLine}<p class="ab-muted"><strong>${letterHtml(l)}</strong> · <span lang="de">${esc(l.ad)}</span> “${esc(l.okunus)}”</p>` : wrongTip(l, wordLine);
    finish(correct, correct ? [] : [question.answer], html, timeUp);
    afterSound(correct, [letterPart(l)]);
  }
  function answerSpelling(value, timeUp) {
    if (game.answered) return;
    const question = q();
    const correct = !timeUp && L.checkSpelling(value, question.word);
    const wrong = correct ? [] : L.spellingMistakes(value, question.word, data.harfler);
    const firstWrong = wrong.length ? letter(wrong[0]) : null;
    const line = `<p>Doğru yazılış: <strong lang="de" class="ab-answer">${esc(question.word)}</strong></p><p class="ab-muted" lang="de">${esc(spelledText(question))}</p>`;
    const extra = question.example && store.profil === 'cocuk' ? '' : (question.example ? `<p class="ab-muted">${esc(question.example.artikel + ' ' + question.example.kelime + ' · ' + question.example.anlam)}</p>` : '');
    const html = correct ? line + extra : `${line}${value ? `<p class="ab-muted">Senin cevabın: <span lang="de">${esc(value)}</span></p>` : ''}${firstWrong ? `<p class="ab-tip"><span aria-hidden="true">💡</span> <strong>${esc(big(firstWrong))}</strong> (${esc(firstWrong.ad)}): ${esc(firstWrong.ipucu)}</p>` : ''}`;
    finish(correct, wrong, html, timeUp);
    // Names, e-mails and addresses have their own clip; example words are said with their article ("der Vogel").
    afterSound(correct, [question.scene
      ? { clip: L.audioId.answer(question.scene), text: L.spokenAnswer(question.scene.cevap, data.isaretler), lang: 'de', rate: settings().rate }
      : wordPart(question.example)]);
  }
  function answerOrder(timeUp) {
    if (game.answered) return;
    const question = q();
    const correct = !timeUp && L.isInOrder(game.order, data.harfler);
    const wrong = correct ? [] : L.misplaced(game.order, question.answer);
    root.querySelectorAll('[data-ab-pos]').forEach((b) => { const i = Number(b.dataset.abPos); b.classList.add(game.order[i] === question.answer[i] ? 'is-right' : 'is-wrong'); });
    const line = `<p>Doğru sıra: <strong class="ab-answer">${question.answer.map((id) => esc(letter(id).buyuk)).join(' ')}</strong></p>`;
    const html = correct ? line : `${line}<p class="ab-muted">Alfabeyi baştan söylemek yardımcı olur: <span lang="de">${question.answer.map((id) => esc(letter(id).ad)).join(', ')}</span>.</p>`;
    finish(correct, wrong, html, timeUp);
    afterSound(correct, question.answer.map((id) => letterPart(letter(id))), spellGap());
  }
  function afterSound(correct, answerParts, gap) {
    const kid = store.profil === 'cocuk';
    if (correct) speak([phrasePart('richtig', 'de')].concat(kid ? [phrasePart('dogru', 'tr')] : []), { gap: 200 });
    else speak((kid ? [phrasePart('dogru-cevap', 'tr')] : []).concat(answerParts), { gap: gap || 250 });
  }
  function next() {
    if (game.index < game.questions.length - 1) { game.index += 1; showQuestion(false); return; }
    renderResult();
  }

  /* ---------- Result ---------- */
  function renderResult() {
    clearTimer();
    const kid = store.profil === 'cocuk';
    const total = game.questions.length;
    const right = game.score.right || 0;
    const stars = L.starsFor(right, total);
    const prog = progress();
    const key = bestKey(game.mode, game.timed);
    const value = kid ? right : (game.score.points || 0);
    const old = prog.best[key];
    const record = !game.focus && (old == null || value > old);
    if (record) { prog.best[key] = value; save(); }
    const hard = L.hardLetters(prog.stats, data.harfler);
    const mode = game.mode;
    const focusIds = mode === 'sirala' ? hard.filter((l) => /^[A-Z]$/.test(l.id)) : hard;
    rerender = renderResult;
    view = 'sonuc';
    window.dispatchEvent(new CustomEvent('ba:alfabe-round'));
    const starsHtml = [1, 2, 3].map((n) => `<span class="ab-star${n <= stars ? ' is-on' : ''}">${kid ? '⭐' : '★'}</span>`).join('');
    const sticker = kid && Math.floor(prog.stars / 10) > Math.floor((prog.stars - right) / 10) ? STICKERS[Math.min(STICKERS.length, Math.floor(prog.stars / 10)) - 1] : null;
    const body = `<h2 class="ab-title">${stars === 3 ? (kid ? 'Süpersin!' : 'Çok iyi!') : stars === 2 ? 'İyi gidiyorsun!' : 'Devam, her tur daha iyi!'}</h2>
      <div class="ab-result">
        <p class="ab-result-stars" role="img" aria-label="${esc(stars + ' / 3 yıldız')}">${starsHtml}</p>
        <p class="ab-result-score"><strong>${Number(right)} / ${Number(total)}</strong> doğru${kid ? '' : ` · <strong>${Number(game.score.points || 0)}</strong> puan · en uzun seri ${Number(game.score.best || 0)}`}</p>
        <p class="ab-muted">${esc(MODE_INFO[mode].title)}${game.timed ? ' · Zamana Karşı' : ''}${game.focus ? ' · zor harfler' : ''}${record ? ' · yeni rekor!' : old != null ? ' · en iyi: ' + Number(old) : ''}</p>
        ${sticker ? `<p class="ab-newsticker"><span class="ab-sticker" aria-hidden="true">${esc(sticker)}</span> Yeni çıkartma kazandın!</p>` : ''}
        ${focusIds.length ? `<p class="ab-hard">Zor harflerin: ${focusIds.slice(0, 8).map((l) => `<span class="ab-chip">${esc(big(l))}</span>`).join('')}</p>` : '<p class="ab-muted">Şu an zor harfin yok.</p>'}
        <div class="ab-actions ab-center">
          <button class="btn primary" type="button" data-ab-again-round>Tekrar oyna</button>
          ${focusIds.length ? '<button class="btn ghost" type="button" data-ab-hard>Zor harflerimi çalış</button>' : ''}
          <button class="btn ghost" type="button" data-ab-menu>Modlara dön</button>
        </div>
      </div>`;
    paint(body);
    root.querySelector('[data-ab-again-round]').addEventListener('click', () => startRound(mode, game.focus));
    root.querySelector('[data-ab-hard]')?.addEventListener('click', () => startRound(mode, focusIds.map((l) => l.id)));
    root.querySelector('[data-ab-menu]').addEventListener('click', () => go(''));
    focusStage();
    speak(kid ? [phrasePart(stars === 3 ? 'supersin' : 'aferin', 'tr')] : []);
  }

  /* ---------- Routing ---------- */
  function go(mode) {
    const hash = mode ? '#' + mode : '';
    if (location.hash.replace(/^#/, '') === mode) { route(); return; }
    if (hash) location.hash = hash;
    else { history.pushState(null, '', location.pathname + location.search); route(); }
  }
  function route() {
    clearTimer(); stopSound();
    if (!data) return;
    if (!store.profil) { renderProfiles(false); return; }
    const mode = location.hash.replace(/^#/, '');
    if (mode === 'kesfet') { renderExplore(true); return; }
    if (L.QUIZ_MODES.includes(mode)) { startRound(mode, null); return; }
    renderMenu();
    focusStage();
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('popstate', () => { if (!location.hash) route(); });

  /* ---------- Account (js/account/alfabe-sync.js) ---------- */
  let readyResolve;
  const ready = new Promise((resolve) => { readyResolve = resolve; });
  window.baAlfabeSync = {
    ready, // resolves with the letter ids once data/alfabe.json is loaded
    logic: L,
    read: () => ({ uid: store.uid, p: store.p }),
    // Merged progress from the account: saved locally too; the menu and the letter grid are redrawn, a running question is not.
    apply(p, uid) {
      store.p.cocuk = p.cocuk; store.p.yetiskin = p.yetiskin; store.uid = uid; accountSynced = true;
      save();
      if (view === 'menu' || view === 'kesfet') rerender();
    }
  };
  let hint = null;
  try { hint = localStorage.getItem('baAccount'); } catch (_) { hint = null; }

  // The list of recorded files changes without a new page version: always revalidated (cache: 'no-cache'),
  // the files themselves carry ?v=<hash>. Without the list the game uses the device voice.
  const manifest = fetch('/audio/alfabe/manifest.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null)).catch(() => null);
  Promise.all([fetch('/data/alfabe.json?v=3').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }), manifest])
    .then(([d, m]) => {
      data = d;
      // The children's spoken instructions come from the data file, the same text the recordings say.
      L.MODES.forEach((mode) => { const t = d.seslendirme?.tr?.['talimat-' + mode]; if (t) MODE_INFO[mode].say.cocuk = t; });
      if (audio) {
        audio.setManifest(m);
        audio.preload(L.audioClips(d).filter((c) => c.preload).map((c) => c.id));
      }
      updateSoundUi();
      route();
      readyResolve(d.harfler.map((l) => l.id));
      // Visitors never load Firebase; only a device where a student signed in before does.
      if (hint === 'student') import('/js/account/alfabe-sync.js?v=1').catch((error) => console.warn('alfabe sync', error));
    })
    .catch(() => { root.innerHTML = '<p class="ab-note">Oyun yüklenemedi. Sayfayı yenilemeyi dene.</p>'; });
})();
