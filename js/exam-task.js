// Sınav görevleri: plays one exam set (data/exams/<exam>/<level>/<section>/teil-<n>/<set>.json) inside the
// exams page. js/exams.js decides when a set is open (#exams/goethe/b1/lesen/1/set-1) and calls render().
// The file format is described in docs/sinav-setleri.md. Interface texts live in js/app.js (task…).
(() => {
  'use strict';

  const t = key => window.BA?.t ? window.BA.t(key) : key;
  const fill = (key, values) => t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const lang = () => window.BA?.lang || 'tr';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  })[ch]);

  // Answer words stay German in every interface language, as on the exam paper.
  const FIXED_OPTIONS = {
    'richtig-falsch': [['richtig', 'Richtig'], ['falsch', 'Falsch']],
    'ja-nein': [['ja', 'Ja'], ['nein', 'Nein']]
  };

  const files = {};   // path -> Promise of the set
  const states = {};  // path -> { answers: {number: value}, checked }

  function load(path) {
    files[path] ||= fetch(path, { cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error(response.status); return response.json(); })
      .catch(error => { delete files[path]; throw error; });
    return files[path];
  }

  const questionsOf = set => set.groups.flatMap(group => group.questions.map(question => ({ question, group })));
  const scored = set => questionsOf(set).filter(({ question }) => !question.example);

  function optionsFor(question, group) {
    if (FIXED_OPTIONS[question.type]) return FIXED_OPTIONS[question.type].map(([value, label]) => ({ value, label }));
    if (question.type === 'abc') return Object.entries(question.options).map(([value, label]) => ({ value, label }));
    // zuordnung: every text of the group (ads a–j) plus the "no text fits" option (group.none, 0 by default; X at A2)
    return [...group.texts.map(text => ({ value: text.label, label: text.label })), { value: noneOf(group), label: noneOf(group) }];
  }

  const noneOf = group => group.none || '0';

  function answerText(question, group, value) {
    if (question.type === 'abc') return `${value}) ${question.options[value]}`;
    if (question.type === 'zuordnung') {
      if (value === noneOf(group)) return `${value.toUpperCase()} (${t('taskNoMatch')})`;
      const text = group.texts.find(item => item.label === value);
      return text?.title ? `${value} – ${text.title}` : value;
    }
    return FIXED_OPTIONS[question.type].find(([key]) => key === value)?.[1] || value;
  }

  /* Texts, with the sentences that answers rely on wrapped so they can be highlighted after checking. */
  function textHtml(text, group) {
    const marks = group.questions.flatMap(question => (question.evidence || [])
      .filter(item => item.text === text.id)
      .map((item, index) => ({ quote: item.quote, number: question.number, id: `task-ev-${question.number}-${index}` })));
    const mark = paragraph => {
      const found = marks
        .map(mark => ({ ...mark, at: paragraph.indexOf(mark.quote) }))
        .filter(mark => mark.at >= 0)
        .sort((a, b) => a.at - b.at);
      let html = '', from = 0;
      for (const mark of found) {
        if (mark.at < from) continue;
        html += esc(paragraph.slice(from, mark.at));
        html += `<span class="task-evidence" id="${mark.id}" data-q="${esc(mark.number)}" tabindex="-1">${esc(mark.quote)}</span>`;
        from = mark.at + mark.quote.length;
      }
      return html + esc(paragraph.slice(from));
    };
    const paragraphs = text.paragraphs.map(paragraph => {
      // { "heading": "Ruhezeiten" } is a subheading inside the text (rules, notices).
      if (paragraph.heading) return `<h4 class="task-subhead">${esc(paragraph.heading)}</h4>`;
      // { "rows": [["3. Stock", "Spielwaren, Bücher"], …] } is a board or directory, e.g. the floors of a department store.
      if (paragraph.rows) return `<table class="task-table"><tbody>${paragraph.rows.map(row =>
        `<tr>${row.map((cell, index) => index ? `<td>${mark(cell)}</td>` : `<th scope="row">${mark(cell)}</th>`).join('')}</tr>`).join('')}</tbody></table>`;
      return `<p>${mark(paragraph)}</p>`;
    }).join('');
    return `<article class="task-text" id="task-text-${esc(text.id)}">
      ${text.label ? `<span class="task-text-label" aria-hidden="true">${esc(text.label)}</span>` : ''}
      ${text.title ? `<h3>${text.label ? `<span class="visually-hidden">${esc(text.label)}: </span>` : ''}${esc(text.title)}</h3>` : ''}
      ${text.byline ? `<p class="task-byline">${esc(text.byline)}</p>` : ''}
      ${paragraphs}
    </article>`;
  }

  function resultHtml(question, group, given) {
    const right = given === question.answer;
    const status = question.example ? '' : `<p class="task-result-status">${esc(t(given == null ? 'taskUnanswered' : right ? 'taskRight' : 'taskWrong'))}</p>`;
    const solution = right && !question.example ? '' : `<p class="task-solution">${esc(fill('taskCorrectAnswer', { answer: answerText(question, group, question.answer) }))}</p>`;
    const evidence = (question.evidence || []).length
      ? `<button class="task-show" type="button" data-task-show="${esc(question.number)}">${esc(t('taskShowInText'))}</button>` : '';
    return `<div class="task-result">${status}${solution}<p class="task-explanation" lang="tr">${esc(question.explanation)}</p>${evidence}</div>`;
  }

  function questionHtml(question, group, state) {
    const number = String(question.number);
    const given = question.example ? question.answer : state.answers[number];
    const done = state.checked;
    const outcome = !done || question.example ? '' : given == null ? ' is-empty' : given === question.answer ? ' is-right' : ' is-wrong';
    const locked = question.example || done ? ' disabled' : '';
    const badge = question.example
      ? `<span class="task-q-no is-example">${esc(t('taskExample'))}</span>`
      : `<span class="task-q-no">${esc(number)}</span>`;
    const prompt = question.prompt ? `<span class="task-q-prompt" lang="de">${esc(question.prompt)}</span>` : '';
    const note = question.example ? `<p class="task-example-note">${esc(t('taskExampleNote'))}</p>` : '';
    const result = done || question.example ? resultHtml(question, group, given) : '';
    const name = `task-q-${number}`;

    if (question.type === 'zuordnung') {
      const options = optionsFor(question, group).map(option =>
        `<option value="${esc(option.value)}"${given === option.value ? ' selected' : ''}>${esc(option.value === noneOf(group) ? `${option.value.toUpperCase()} – ${t('taskNoMatch')}` : option.label)}</option>`).join('');
      return `<div class="task-q task-q--select${question.example ? ' is-example' : ''}${outcome}" data-q="${esc(number)}">
        <label class="task-q-head" for="${name}">${badge}${prompt}</label>
        ${note}
        <select id="${name}" data-task-answer="${esc(number)}"${locked}>
          <option value=""${given == null ? ' selected' : ''}>${esc(t('taskChoose'))}</option>${options}
        </select>
        ${result}
      </div>`;
    }

    const options = optionsFor(question, group).map(option => `
      <label class="task-option${given === option.value ? ' is-chosen' : ''}${done && option.value === question.answer ? ' is-answer' : ''}">
        <input type="radio" name="${name}" value="${esc(option.value)}" data-task-answer="${esc(number)}"${given === option.value ? ' checked' : ''}${locked}>
        <span class="task-option-key">${esc(question.type === 'abc' ? option.value : option.label)}</span>
        ${question.type === 'abc' ? `<span class="task-option-text" lang="de">${esc(option.label)}</span>` : ''}
      </label>`).join('');
    return `<fieldset class="task-q task-q--${question.type}${question.example ? ' is-example' : ''}${outcome}" data-q="${esc(number)}">
      <legend class="task-q-head">${badge}${prompt}</legend>
      ${note}
      <div class="task-options">${options}</div>
      ${result}
    </fieldset>`;
  }

  function groupHtml(group, state) {
    return `<section class="task-group task-group--${esc(group.layout || 'article')}">
      <div class="task-texts" lang="de" aria-label="${esc(t('taskTextsLabel'))}">${group.texts.map(text => textHtml(text, group)).join('')}</div>
      <div class="task-questions" aria-label="${esc(t('taskQuestionsLabel'))}">
        ${group.question ? `<p class="task-stem" lang="de">${esc(group.question)}</p>` : ''}
        ${group.questions.map(question => questionHtml(question, group, state)).join('')}
      </div>
    </section>`;
  }

  function summaryHtml(set, state) {
    if (!state.checked) return '';
    const items = scored(set);
    const correct = items.filter(({ question }) => state.answers[String(question.number)] === question.answer).length;
    return `<div class="task-summary" tabindex="-1">
      <p class="task-score">${esc(fill('taskScore', { correct, total: items.length }))}</p>
      <p>${esc(t('taskResultHint'))}</p>
    </div>`;
  }

  function draw(container, set, path) {
    const state = states[path];
    const meta = [fill('taskMinutes', { n: set.minutes }), fill('taskQuestionCount', { n: scored(set).length })];
    if (lang() !== 'tr') meta.push(t('taskExplanationsTr'));
    container.innerHTML = `<div class="task${state.checked ? ' is-checked' : ''}">
      <div class="task-head">
        <p class="task-meta">${meta.map(item => `<span>${esc(item)}</span>`).join('')}</p>
        ${set.context ? `<p class="task-context" lang="de">${esc(set.context)}</p>` : ''}
        <p class="task-instructions" lang="de">${esc(set.instructions)}</p>
        <div aria-live="polite">${summaryHtml(set, state)}</div>
      </div>
      ${set.groups.map(group => groupHtml(group, state)).join('')}
      <div class="task-actions">
        ${state.checked
          ? `<button class="btn primary" type="button" data-task-retry>${esc(t('taskRetry'))}</button>`
          : `<button class="btn primary" type="button" data-task-check>${esc(t('taskCheck'))}</button>`}
      </div>
    </div>`;
  }

  function bind(container, set, path) {
    if (container.dataset.taskBound) return;
    container.dataset.taskBound = '1';
    const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    container.addEventListener('change', event => {
      const input = event.target.closest('[data-task-answer]');
      const state = states[container.dataset.taskPath];
      if (!input || !state || state.checked) return;
      if (input.value === '') delete state.answers[input.dataset.taskAnswer];
      else state.answers[input.dataset.taskAnswer] = input.value;
      if (input.type === 'radio') {
        input.closest('.task-options')?.querySelectorAll('.task-option').forEach(option =>
          option.classList.toggle('is-chosen', option.contains(input)));
      }
    });
    container.addEventListener('click', event => {
      const current = container.dataset.taskPath;
      const state = states[current];
      if (!state) return;
      if (event.target.closest('[data-task-check]')) {
        state.checked = true;
        load(current).then(data => {
          draw(container, data, current);
          const summary = container.querySelector('.task-summary');
          summary?.focus({ preventScroll: true });
          container.querySelector('.task-head')?.scrollIntoView({ behavior: smooth(), block: 'start' });
        });
      }
      if (event.target.closest('[data-task-retry]')) {
        states[current] = { answers: {}, checked: false };
        load(current).then(data => {
          draw(container, data, current);
          container.querySelector('.task-head')?.scrollIntoView({ behavior: smooth(), block: 'start' });
          container.querySelector('[data-task-answer]:not([disabled])')?.focus({ preventScroll: true });
        });
      }
      const show = event.target.closest('[data-task-show]');
      if (show) {
        const marks = [...container.querySelectorAll(`.task-evidence[data-q="${CSS.escape(show.dataset.taskShow)}"]`)];
        if (!marks.length) return;
        marks[0].scrollIntoView({ behavior: smooth(), block: 'center' });
        marks.forEach(mark => { mark.classList.remove('is-flash'); void mark.offsetWidth; mark.classList.add('is-flash'); });
        marks[0].focus({ preventScroll: true });
      }
    });
  }

  // preserve: keep the answers (used when only the interface language changed).
  function render(container, { path, preserve = false } = {}) {
    container.dataset.taskPath = path;
    if (!preserve || !states[path]) states[path] = { answers: {}, checked: false };
    container.innerHTML = `<p class="task-status" role="status">${esc(t('taskLoading'))}</p>`;
    return load(path).then(set => {
      if (!container.isConnected || container.dataset.taskPath !== path) return;
      draw(container, set, path);
      bind(container, set, path);
    }).catch(() => {
      if (!container.isConnected || container.dataset.taskPath !== path) return;
      container.innerHTML = `<p class="task-status" role="alert">${esc(t('taskLoadError'))}</p>
        <button class="btn primary" type="button" data-task-reload>${esc(t('taskReload'))}</button>`;
      container.querySelector('[data-task-reload]').addEventListener('click', () => render(container, { path, preserve: true }));
    });
  }

  window.BAExamTask = { render, load };
})();
