// Seviye sonu sınavı (#seviye-sonu/A1): seviyenin bütün konularından 30 soru, geçme sınırı %60, süre sınırı yok.
// Sorular data/seviye-sonu/<seviye>.json'da (data/catalog.json → levelExam). Her konu için havuzda dağılımdaki
// sayının en az iki katı soru var; her denemede aynı dağılımla rastgele sorular seçilir (scripts/check-level-exams.mjs).
// Yarım kalan deneme localStorage'da (baLevelExam:<seviye>) durur. Bitince sonuç 'ba:exercise-finished' olayıyla
// js/account/session.js'e gider: giriş yapmış ve onaylı öğrencide results'a puan ve konu bazında hatalar yazılır.
// Hangi soruların çıktığı kaydedilmez. Metinler js/app.js'te (le…).
(() => {
  'use strict';
  const root = document.getElementById('levelExamApp');
  if (!root) return;

  const initialHash = location.hash;
  const TOPIC = 'seviye-sonu';
  const t = (key) => window.BA?.t ? window.BA.t(key) : key;
  const fill = (key, values) => t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const lang = () => window.BA?.lang || 'tr';
  const loc = (v) => (v && typeof v === 'object') ? (v[lang()] || v.tr || '') : (v || '');
  const storeKey = (level) => `baLevelExam:${level}`;

  let catalog = null;
  const exams = {};      // level -> exam data
  let level = null;      // current level id
  let attempt = null;    // { ids, options: {id: [...]}, answers: {id: value}, result }
  let view = 'intro';    // intro | questions | result

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'onclick') node.addEventListener('click', v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) node.append(c);
    return node;
  }

  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // Same distribution every time, different questions: `count` random questions of each topic, topics in catalog order.
  function newAttempt(exam) {
    const ids = [];
    const options = {};
    for (const d of exam.distribution) {
      for (const q of shuffle(exam.questions.filter((x) => x.topic === d.topic)).slice(0, d.count)) {
        ids.push(q.id);
        options[q.id] = shuffle(q.options);
      }
    }
    return { ids, options, answers: {}, result: null };
  }

  const levelInfo = () => catalog?.levels.find((l) => l.id === level);
  const topicTitle = (id) => loc(levelInfo()?.topics.find((tp) => tp.id === id)?.title) || id;
  const questionsOf = () => attempt.ids.map((id) => exams[level].questions.find((q) => q.id === id)).filter(Boolean);

  async function load(levelId) {
    catalog ||= await fetch('data/catalog.json?v=7').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
    const info = catalog.levels.find((l) => l.id === levelId);
    if (!info?.levelExam) return null;
    exams[levelId] ||= await fetch(info.levelExam + '?v=1').then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
    return exams[levelId];
  }

  function valid(saved, exam) {
    return saved && Array.isArray(saved.ids) && saved.ids.length === 30
      && saved.ids.every((id) => exam.questions.some((q) => q.id === id) && Array.isArray(saved.options?.[id]));
  }

  let loading = false;
  async function open(levelId, { focus = false } = {}) {
    level = levelId;
    loading = true;
    root.replaceChildren(el('p', { class: 'le-status', role: 'status', text: t('leLoading') }));
    let exam;
    try { exam = await load(levelId); }
    catch (_) {
      loading = false;
      root.replaceChildren(el('p', { class: 'le-status', role: 'alert', text: t('leLoadError') }),
        el('button', { class: 'btn primary', type: 'button', text: t('leRetry'), onclick: () => open(levelId) }));
      return;
    }
    loading = false;
    if (level !== levelId) return;
    if (!exam) {
      root.replaceChildren(el('p', { class: 'le-status', text: t('leNoExam') }),
        el('a', { class: 'btn primary', href: '#exercises', text: t('leBackExercises') }));
      return;
    }
    const saved = read(storeKey(levelId));
    attempt = valid(saved, exam) ? saved : null;
    view = attempt?.result ? 'result' : 'intro';
    render({ focus });
  }

  function render({ focus = false } = {}) {
    if (!exams[level]) return;
    root.replaceChildren();
    if (view === 'questions') renderQuestions();
    else if (view === 'result') renderResult();
    else renderIntro();
    if (focus) {
      root.querySelector('h1')?.focus({ preventScroll: true });
      root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
  }

  const exam = () => exams[level];
  const passCount = () => Math.ceil(30 * exam().passPercent / 100);

  function renderIntro() {
    const started = attempt && !attempt.result && Object.keys(attempt.answers).length;
    root.append(
      el('header', { class: 'le-head' },
        el('p', { class: 'le-kicker', text: fill('leKicker', { level }) }),
        el('h1', { tabindex: '-1', text: fill('leTitle', { level }) }),
        el('p', { class: 'le-lead', text: fill('leLead', { level }) })),
      el('ul', { class: 'le-info' },
        [fill('leInfo1', { n: exam().distribution.length }), fill('leInfo2', { pass: passCount() }), t('leInfo3'), t('leInfo4'),
          lang() !== 'tr' ? t('leExplanationsTr') : null].filter(Boolean).map((text) => el('li', { text }))),
      el('div', { class: 'le-actions' },
        el('button', { class: 'btn primary', type: 'button', 'data-le-start': true, text: t(started ? 'leContinue' : 'leStart'), onclick: () => {
          if (!attempt || attempt.result) attempt = newAttempt(exam());
          write(storeKey(level), attempt);
          view = 'questions';
          render({ focus: true });
        } }),
        started ? el('button', { class: 'btn ghost', type: 'button', 'data-le-new': true, text: t('leNewAttempt'), onclick: () => {
          attempt = newAttempt(exam());
          write(storeKey(level), attempt);
          view = 'questions';
          render({ focus: true });
        } }) : null,
        el('a', { class: 'btn ghost', href: `#exercises/${level}`, 'data-le-back': true, text: fill('leBackLevel', { level }) }))
    );
  }

  function renderQuestions() {
    const qs = questionsOf();
    const status = el('p', { class: 'le-status', role: 'alert' });
    const answered = () => Object.keys(attempt.answers).length;
    const progress = el('p', { class: 'le-progress', 'aria-live': 'polite', text: fill('leAnswered', { n: answered(), total: qs.length }) });
    root.append(
      el('header', { class: 'le-head' },
        el('p', { class: 'le-kicker', text: fill('leKicker', { level }) }),
        el('h1', { tabindex: '-1', text: fill('leTitle', { level }) }),
        el('p', { class: 'le-lead', text: fill('leQuestionsLead', { pass: passCount() }) }),
        progress),
      el('ol', { class: 'le-questions' }, qs.map((q, i) => {
        const name = `le-${q.id}`;
        return el('li', { class: 'le-q', 'data-q': q.id },
          el('fieldset', {},
            el('legend', {}, el('span', { class: 'le-q-no', text: `${i + 1}.` }), ' ', el('span', { lang: 'de', class: 'le-q-prompt', text: q.prompt })),
            el('div', { class: 'le-options' }, attempt.options[q.id].map((option) => {
              const input = el('input', { type: 'radio', name, value: option });
              if (attempt.answers[q.id] === option) input.checked = true;
              input.addEventListener('change', () => {
                attempt.answers[q.id] = option;
                write(storeKey(level), attempt);
                input.closest('.le-q').classList.remove('is-missing');
                progress.textContent = fill('leAnswered', { n: answered(), total: qs.length });
              });
              return el('label', { class: 'le-option' }, input, el('span', { lang: 'de', text: option }));
            }))));
      })),
      status,
      el('div', { class: 'le-actions' },
        el('button', { class: 'btn primary', type: 'button', 'data-le-finish': true, text: t('leFinish'), onclick: () => finish(qs, status) }),
        el('button', { class: 'btn ghost', type: 'button', text: t('leLater'), onclick: () => { view = 'intro'; render({ focus: true }); } }))
    );
  }

  function finish(qs, status) {
    const missing = qs.filter((q) => !(q.id in attempt.answers));
    root.querySelectorAll('.le-q').forEach((node) => node.classList.toggle('is-missing', missing.some((q) => q.id === node.dataset.q)));
    if (missing.length) {
      status.textContent = fill('leMissing', { n: missing.length });
      root.querySelector('.le-q.is-missing input')?.focus();
      return;
    }
    const byTopic = {};
    const wrong = [];
    for (const [i, q] of qs.entries()) {
      byTopic[q.topic] ||= { correct: 0, total: 0 };
      byTopic[q.topic].total++;
      if (attempt.answers[q.id] === q.answer) byTopic[q.topic].correct++;
      else wrong.push({ n: i + 1, id: q.id, given: attempt.answers[q.id] });
    }
    const score = qs.length - wrong.length;
    attempt.result = { score, total: qs.length, byTopic, wrong };
    write(storeKey(level), attempt);
    view = 'result';
    render({ focus: true });
    // Saved once, when the attempt is finished (not when the result is drawn again, e.g. after a language change).
    const topicErrors = Object.entries(byTopic).filter(([, v]) => v.correct < v.total).map(([id, v]) => `${id}:${v.total - v.correct}`).join(',');
    window.dispatchEvent(new CustomEvent('ba:exercise-finished', { detail: {
      level, topic: TOPIC, exercise: level.toLowerCase(), score, total: qs.length, topicErrors, noteIn: '#levelExamResult'
    } }));
  }

  function renderResult() {
    const r = attempt.result;
    const passed = r.score >= passCount();
    const percent = Math.round(r.score / r.total * 100);
    const rows = Object.entries(r.byTopic)
      .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total));
    const weak = rows.filter(([, v]) => v.correct < v.total);
    const loggedIn = (() => { try { return localStorage.getItem('baAccount') === 'student'; } catch (_) { return false; } })();
    root.append(el('section', { class: 'le-result', id: 'levelExamResult', 'aria-labelledby': 'leResultTitle' },
      el('p', { class: 'le-kicker', text: fill('leKicker', { level }) }),
      el('h1', { id: 'leResultTitle', tabindex: '-1', text: fill('leResultTitle', { level }) }),
      el('div', { class: 'le-score' },
        el('div', { class: 'le-score-box' }, el('strong', { 'data-le-score': true, text: `${r.score} / ${r.total}` }),
          el('span', { text: fill('leScoreLine', { percent, pass: passCount() }) })),
        el('span', { class: `le-badge ${passed ? 'is-pass' : 'is-fail'}`, 'data-le-passed': String(passed), text: t(passed ? 'lePassed' : 'leNotPassed') })),
      loggedIn ? null : el('p', { class: 'le-note', 'data-le-visitor': true, text: t('leVisitorNote') }),
      el('h2', { text: t('leTopicsTitle') }),
      el('ul', { class: 'le-topics' }, rows.map(([id, v]) => el('li', { class: v.correct < v.total ? 'is-weak' : '' },
        el('span', { class: 'le-topic-name', text: topicTitle(id) }),
        el('span', { class: 'le-topic-score', text: `${v.correct} / ${v.total}` }),
        v.correct < v.total ? el('span', { class: 'le-topic-links' },
          el('a', { class: 'ba-link', href: `#grammar/${level}/${encodeURIComponent(id)}`, text: t('leLesson') }),
          el('a', { class: 'ba-link', href: `#exercises/${level}/${encodeURIComponent(id)}`, text: t('leExercises') })) : null))),
      el('h2', { text: r.wrong.length ? fill('leWrongTitle', { n: r.wrong.length }) : t('leNoWrong') }),
      r.wrong.length ? el('div', { class: 'le-wrong' }, r.wrong.map((w) => {
        const q = exam().questions.find((x) => x.id === w.id);
        if (!q) return null;
        return el('div', { class: 'le-wrong-item' },
          el('p', { lang: 'de' }, el('strong', { text: `${w.n}. ` }), q.prompt),
          el('p', {}, `${t('leYourAnswer')}: `, el('strong', { lang: 'de', text: w.given }), ` · ${t('leCorrectAnswer')}: `, el('strong', { lang: 'de', text: q.answer })),
          el('p', { class: 'le-expl', lang: 'tr', text: q.explanation }));
      })) : null,
      el('p', { class: 'notice le-disclaimer', text: t('leDisclaimer') }),
      el('div', { class: 'le-actions' },
        el('button', { class: 'btn primary', type: 'button', 'data-le-retry': true, text: t('leRetryExam'), onclick: () => {
          attempt = newAttempt(exam());
          write(storeKey(level), attempt);
          view = 'questions';
          render({ focus: true });
        } }),
        weak.length ? el('a', { class: 'btn ghost', href: `#exercises/${level}/${encodeURIComponent(weak[0][0])}`, text: t('leWeakFirst') }) : null,
        el('a', { class: 'btn ghost', href: `#exercises/${level}`, 'data-le-back': true, text: fill('leBackLevel', { level }) }))));
  }

  function route(hash = location.hash) {
    const m = /^#seviye-sonu\/(A1|A2|B1|B2)$/i.exec(hash);
    return m ? m[1].toUpperCase() : null;
  }

  function show(hash, { focus = true } = {}) {
    const lv = route(hash);
    if (!lv) return;
    if (!document.getElementById('page-seviye-sonu')?.classList.contains('active')) {
      window.BA?.showPage('seviye-sonu', { historyMode: 'none', scroll: false });
    }
    if (location.hash !== `#seviye-sonu/${lv}`) history.replaceState({ ...(history.state || {}), baPage: 'seviye-sonu' }, '', `#seviye-sonu/${lv}`);
    // A link fires both hashchange and popstate: draw only once the exam file is there.
    if (lv !== level || !exams[lv]) { if (lv !== level || !loading) open(lv, { focus }); }
    else render({ focus });
  }

  window.addEventListener('hashchange', () => { if (location.hash.startsWith('#seviye-sonu')) show(location.hash); });
  window.addEventListener('popstate', () => { if (location.hash.startsWith('#seviye-sonu/')) show(location.hash, { focus: false }); });
  window.addEventListener('ba:languagechange', () => { if (level && document.getElementById('page-seviye-sonu')?.classList.contains('active')) render(); });
  document.addEventListener('DOMContentLoaded', () => {
    // app.js shortens the address to "#seviye-sonu" on load; open the level from the full one.
    if (initialHash.startsWith('#seviye-sonu/')) show(initialHash, { focus: false });
    else if (initialHash === '#seviye-sonu') show('#seviye-sonu/A1', { focus: false });
  });
})();
