// Form doldurma (Goethe A1 Schreiben Teil 1): durum metnindeki bilgileri forma yazmak. Yapay zekâ yok; otomatik kontrol.
// Veri: data/exams/<sınav>/<seviye>/schreiben/teil-<n>/<set>.json, "kind": "form" (biçim: docs/sinav-setleri.md).
// js/writing-task.js bir Schreiben setini yükleyip kind "form" görünce buraya devreder (BAFormTask.draw).
// Kontrol: büyük-küçük harf, fazla boşluk, sondaki noktalama ve ß/ss, ä/ae farkı önemsiz; kabul edilen cevaplardan birine
// tek harf uzaklıktaki cevap (en az 5 harf, sayıları aynı) "doğru, ama yazımı: …" sayılır. Cevabın dayandığı yer metinde
// boşluğun numarasıyla işaretlenir. Ziyaretçide hiçbir şey gönderilmez; giriş yapmış öğrencide sadece puan kaydedilir (session.js).
(() => {
  'use strict';

  const t = key => window.BA?.t ? window.BA.t(key) : key;
  const fill = (key, values) => t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const lang = () => window.BA?.lang || 'tr';
  const esc = value => window.baHtml.escapeHtml(value);
  // html-safe-names: rows marks situation result status solution show navActions() inputHtml(row) resultHtml(row) summary lock cls label actions id html situationHtml(set) formHtml(set)

  const states = {}; // path -> { answers: {number: value}, checked: bool }
  const navs = {};

  // Karşılaştırma için sadeleştirme.
  const fold = value => String(value ?? '').normalize('NFC').toLowerCase()
    .replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[„“"']/g, '').replace(/\s+/g, ' ').trim().replace(/[.,;:!?]+$/, '').replace(/\s*([.,])\s*/g, '$1');

  // Damerau-Levenshtein uzaklığı (komşu iki harfin yer değiştirmesi de tek hata).
  function distance(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
    return d[a.length][b.length];
  }

  // 'right' | 'almost' (yazım hatası) | 'wrong' | 'empty'
  function judge(row, given) {
    const value = String(given ?? '').trim();
    if (!value) return { status: 'empty' };
    if (row.choices) return { status: value === row.answer ? 'right' : 'wrong' };
    const g = fold(value);
    if (row.accept.some(a => fold(a) === g)) return { status: 'right' };
    // Tek harflik yazım hatası: harfler en az 5, sayılar aynı (Goethestrase 7 → Goethestraße 7; 7 yerine 8 yanlış).
    const digits = value => (value.match(/\d+/g) || []).join(' ');
    const letters = value => value.replace(/[^a-z]/g, '');
    const near = row.accept.find(a => letters(fold(a)).length >= 5 && digits(fold(a)) === digits(g) && distance(fold(a), g) === 1);
    if (near) return { status: 'almost', spelling: near };
    return { status: 'wrong' };
  }
  const counts = status => status === 'right' || status === 'almost';
  const blanks = set => set.form.rows.filter(row => row.number);

  function situationHtml(set, checked) {
    // Her boşluğun dayanağı metinde numarasıyla işaretlenir (task-evidence; işaret "Kontrol et"ten sonra görünür).
    const marks = blanks(set).flatMap(row => (row.evidence || []).map(quote => ({ quote, number: row.number, at: set.situation.indexOf(quote) })))
      .filter(mark => mark.at >= 0).sort((a, b) => a.at - b.at);
    let html = '';
    let from = 0;
    for (const mark of marks) {
      if (mark.at < from) continue;
      html += esc(set.situation.slice(from, mark.at));
      html += `<span class="task-evidence" data-q="${esc(mark.number)}" tabindex="-1">${esc(mark.quote)}</span>`;
      from = mark.at + mark.quote.length;
    }
    html += esc(set.situation.slice(from));
    return `<div class="wt-task ft-situation${checked ? ' is-checked' : ''}" lang="de"><p>${html}</p><p><strong>${esc(set.task)}</strong></p></div>`;
  }

  function inputHtml(row, state) {
    const id = esc(`ft-${row.number}`);
    const given = state.answers[row.number] ?? '';
    const lock = state.checked ? ' disabled' : '';
    if (row.choices) {
      return `<div class="ft-choices" role="radiogroup" aria-labelledby="${id}-label">${row.choices.map((choice, i) => `
        <label class="ft-choice"><input type="radio" name="${id}" value="${esc(choice)}" data-ft="${esc(row.number)}"${given === choice ? ' checked' : ''}${lock}>
        <span>${esc(choice)}</span></label>`).join('')}</div>`;
    }
    return `<input class="ft-input" type="text" id="${id}" data-ft="${esc(row.number)}" value="${esc(given)}" autocomplete="off"
      autocapitalize="off" spellcheck="false" lang="de" maxlength="80"${lock}>`;
  }

  function resultHtml(row, state) {
    const r = judge(row, state.answers[row.number]);
    const status = `<p class="task-result-status">${esc(t(r.status === 'empty' ? 'taskUnanswered' : r.status === 'wrong' ? 'taskWrong' : 'taskRight'))}</p>`;
    const solution = r.status === 'almost' ? `<p class="task-solution">${esc(fill('ftSpelling', { answer: r.spelling }))}</p>`
      : r.status === 'right' ? '' : `<p class="task-solution">${esc(fill('taskCorrectAnswer', { answer: row.choices ? row.answer : row.accept[0] }))}</p>`;
    const show = row.evidence?.length ? `<button class="task-show" type="button" data-task-show="${esc(row.number)}">${esc(t('taskShowInText'))}</button>` : '';
    return `<div class="task-result">${status}${solution}<p class="task-explanation" lang="tr">${esc(row.explanation)}</p>${show}</div>`;
  }

  function formHtml(set, state) {
    const rows = set.form.rows.map(row => {
      if (!row.number) {
        return `<div class="ft-row${row.example ? ' is-example' : ''}"><span class="ft-label" lang="de">${esc(row.label)}</span>
          <span class="ft-value" lang="de">${esc(row.value)}</span>${row.example ? `<span class="ft-no is-example" title="${esc(t('taskExample'))}">0</span>` : '<span></span>'}</div>`;
      }
      const r = state.checked ? judge(row, state.answers[row.number]) : null;
      const cls = r ? ` is-${counts(r.status) ? 'right' : r.status === 'empty' ? 'empty' : 'wrong'}${r.status === 'almost' ? ' is-almost' : ''}` : '';
      const label = row.choices ? `<span class="ft-label" id="ft-${esc(row.number)}-label" lang="de">${esc(row.label)}</span>`
        : `<label class="ft-label" for="ft-${esc(row.number)}" lang="de">${esc(row.label)}</label>`;
      return `<div class="ft-row ft-blank${cls}" data-ft-row="${esc(row.number)}">${label}
        <span class="ft-field">${inputHtml(row, state)}</span><span class="ft-no" aria-hidden="true">${esc(row.number)}</span>
        ${state.checked ? `<div class="ft-feedback">${resultHtml(row, state)}</div>` : ''}</div>`;
    }).join('');
    return `<section class="ft-form" aria-labelledby="ftTitle">
      <header class="ft-head">${set.form.subtitle ? `<p class="ft-subtitle" lang="de">${esc(set.form.subtitle)}</p>` : ''}
        <h3 id="ftTitle" lang="de">${esc(set.form.title)}</h3></header>
      <div class="ft-rows">${rows}</div>
    </section>`;
  }

  function navActions(path) {
    const nav = navs[path];
    if (nav?.next) {
      return `<a class="btn primary task-next" href="${esc(nav.next.href)}" aria-label="${esc(fill('taskNextLabel', { name: nav.next.label }))}">
        <span class="task-next-text"><span>${esc(t('taskNext'))}</span><small>${esc(nav.next.label)}</small></span> <span aria-hidden="true">→</span></a>`;
    }
    if (nav?.finished) {
      return `<a class="btn primary" href="${esc(nav.finished.sections)}">${esc(t('taskBackToSections'))}</a>
        <a class="btn ghost" href="${esc(nav.finished.teile)}">${esc(t(nav.finished.teileLabel || 'taskBackToTeile'))}</a>`;
    }
    return '';
  }

  function draw(container, set, path) {
    const state = states[path];
    const meta = [fill('taskMinutes', { n: set.minutes }), t('ftMeta')];
    if (lang() !== 'tr') meta.push(t('taskExplanationsTr'));
    const total = blanks(set).length;
    const score = blanks(set).filter(row => counts(judge(row, state.answers[row.number]).status)).length;
    const summary = state.checked ? `<div class="task-summary" role="status" tabindex="-1" data-ft-summary>
      <p class="task-score">${esc(fill('taskScore', { correct: score, total }))}</p><p>${esc(t('ftResultHint'))}</p></div>` : '';
    const actions = state.checked
      ? `${navActions(path)}<button class="btn ${navs[path] ? 'ghost' : 'primary'}" type="button" data-ft-retry>${esc(t('taskRetry'))}</button>`
      : `<button class="btn primary" type="button" data-ft-check>${esc(t('taskCheck'))}</button>`;
    container.innerHTML = `<div class="task wt ft${state.checked ? ' is-checked' : ''}">
      <div class="task-head"><p class="task-meta">${meta.map(item => `<span>${esc(item)}</span>`).join('')}</p></div>
      ${situationHtml(set, state.checked)}
      ${summary}
      ${formHtml(set, state)}
      <p class="wt-muted">${esc(t('ftNote'))}</p>
      <div class="task-actions">${actions}</div>
    </div>`;
    bind(container, set, path);
  }

  function bind(container, set, path) {
    const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    const state = states[path];
    container.querySelectorAll('[data-ft]').forEach(input => {
      const save = () => { if (input.type !== 'radio' || input.checked) state.answers[input.dataset.ft] = input.value; };
      input.addEventListener('input', save);
      input.addEventListener('change', save);
      // Enter: bir sonraki alana geç; son alanda kontrol et.
      if (input.type === 'text') input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const fields = [...container.querySelectorAll('.ft-input:not(:disabled)')];
        const next = fields[fields.indexOf(input) + 1];
        if (next) next.focus(); else container.querySelector('[data-ft-check]')?.click();
      });
    });
    container.querySelector('[data-ft-check]')?.addEventListener('click', () => {
      state.checked = true;
      draw(container, set, path);
      // Giriş yapmış öğrencide sonuç kaydedilir (js/account/session.js, konu "sinav"); sadece puan, cevaplar değil.
      const rows = blanks(set);
      window.dispatchEvent(new CustomEvent('ba:exercise-finished', { detail: {
        level: set.level, topic: 'sinav', exercise: `${set.exam}-${set.level}-${set.section}-${set.teil}-${set.set}`,
        score: rows.filter(row => counts(judge(row, state.answers[row.number]).status)).length, total: rows.length,
        noteIn: '#examTask [data-ft-summary]'
      } }));
      const summary = container.querySelector('[data-ft-summary]');
      summary?.focus({ preventScroll: true });
      summary?.scrollIntoView({ behavior: smooth(), block: 'start' });
    });
    container.querySelector('[data-ft-retry]')?.addEventListener('click', () => {
      states[path] = { answers: {}, checked: false };
      draw(container, set, path);
      container.querySelector('.ft-input, .ft-choice input')?.focus();
    });
    container.querySelectorAll('[data-task-show]').forEach(button => button.addEventListener('click', () => {
      const marks = [...container.querySelectorAll(`.task-evidence[data-q="${CSS.escape(button.dataset.taskShow)}"]`)];
      if (!marks.length) return;
      marks[0].scrollIntoView({ behavior: smooth(), block: 'center' });
      marks.forEach(mark => { mark.classList.remove('is-flash'); void mark.offsetWidth; mark.classList.add('is-flash'); });
      marks[0].focus({ preventScroll: true });
    }));
  }

  // preserve: cevaplar dil değişince korunur.
  function render(container, set, { path, preserve = false, nav = null } = {}) {
    if (nav) navs[path] = nav; else delete navs[path];
    if (!preserve || !states[path]) states[path] = { answers: {}, checked: false };
    draw(container, set, path);
  }

  window.BAFormTask = { render, judge, fold };
})();
