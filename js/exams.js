// Sınav Hazırlığı (#exams): exam → level → section → Teil, built entirely from js/examsData.js.
// Addresses: #exams, #exams/goethe, #exams/goethe/b1, #exams/goethe/b1/lesen (DTZ: #exams/dtz/lesen).
// Cards are ordinary links, so the browser keeps the history; this file only listens for the hash.
(() => {
  'use strict';

  // app.js shortens the address to "#exams" on load; keep the full one to restore it.
  const initialHash = location.hash;
  const data = window.BA_EXAMS;
  let focusNext = false;
  let rendered = '';

  const t = key => window.BA?.t ? window.BA.t(key) : key;
  const fill = (key, values) => t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const lang = () => window.BA?.lang || 'tr';
  const loc = value => (value && typeof value === 'object') ? (value[lang()] ?? value.tr ?? '') : (value ?? '');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    })[ch]);
  }

  function decodePart(value) {
    try { return decodeURIComponent(value).toLowerCase(); }
    catch (_) { return ''; }
  }

  const hashFor = (...parts) => '#' + ['exams', ...parts.filter(Boolean)].map(encodeURIComponent).join('/');

  // Reads the address and keeps only the parts that exist in the data, so an old or mistyped link
  // opens the nearest valid step instead of an empty page.
  function parseRoute(hash) {
    const parts = String(hash || '').replace(/^#/, '').split('/').filter(Boolean).map(decodePart);
    const route = { exam: null, level: null, section: null };
    if (parts[0] !== 'exams' || !data) return route;

    const exam = data.exams.find(item => item.id === parts[1] && !item.comingSoon);
    if (!exam) return route;
    route.exam = exam;

    let rest = parts.slice(2);
    if (exam.skipLevel) {
      route.level = exam.levels[0] || null;
    } else {
      route.level = exam.levels.find(item => item.id === rest[0]) || null;
      rest = rest.slice(1);
    }
    if (!route.level) return route;

    route.section = route.level.sections.find(item => item.id === rest[0]) || null;
    return route;
  }

  function routeHash(route) {
    if (!route.exam) return hashFor();
    const level = route.exam.skipLevel ? null : route.level?.id;
    if (!route.exam.skipLevel && !route.level) return hashFor(route.exam.id);
    return hashFor(route.exam.id, level, route.section?.id);
  }

  function step(route) {
    if (!route.exam) return 1;
    if (!route.level) return 2;
    if (!route.section) return 3;
    return 4;
  }

  const levelMeta = level => data.levels[level.id] || { code: level.id.toUpperCase(), name: '', description: '' };
  const levelBadges = exam => exam.levels.map(level => levelMeta(level).code);

  function teilCount(n) {
    return fill(n === 1 ? 'examTeilCountOne' : 'examTeilCountMany', { n });
  }

  /* Step indicator: Sınav › Seviye › Bölüm › Teil. Finished steps show the choice and link back. */
  function renderSteps(route) {
    const current = step(route);
    const exam = route.exam;
    const items = [
      { label: t('examStepExam'), value: exam?.name, href: hashFor() },
      {
        label: t('examStepLevel'),
        value: route.level ? levelMeta(route.level).code : '',
        // DTZ has a single level: shown, but there is nothing to choose.
        href: exam?.skipLevel ? null : (exam ? hashFor(exam.id) : null)
      },
      {
        label: t('examStepSection'),
        value: route.section ? (data.sections[route.section.id]?.name || route.section.id) : '',
        href: route.level ? routeHash({ ...route, section: null }) : null
      },
      { label: t('examStepTeil'), value: '', href: null }
    ];

    return `<ol class="exam-steps">${items.map((item, index) => {
      const number = index + 1;
      const state = number < current ? 'done' : number === current ? 'current' : 'todo';
      const inner = `<span class="exam-step-no" aria-hidden="true">${number}</span><span class="exam-step-text"><span class="exam-step-label">${escapeHtml(item.label)}</span>${item.value ? `<strong>${escapeHtml(item.value)}</strong>` : ''}</span>`;
      const body = state === 'done' && item.href
        ? `<a href="${item.href}" aria-label="${escapeHtml(fill('examStepBack', { step: item.label, value: item.value || '' }))}">${inner}</a>`
        : `<span class="exam-step-static">${inner}</span>`;
      return `<li class="exam-step is-${state}"${state === 'current' ? ' aria-current="step"' : ''}>${body}</li>`;
    }).join('')}</ol>`;
  }

  function heading(title, sub, backHref) {
    return `
      <div class="exam-flow-head">
        ${backHref ? `<a class="btn ghost exam-back" href="${backHref}">← <span>${escapeHtml(t('examBack'))}</span></a>` : ''}
        <h2 id="examFlowTitle" tabindex="-1">${escapeHtml(title)}</h2>
        <p class="sub">${escapeHtml(sub)}</p>
      </div>`;
  }

  function stars(difficulty) {
    if (!difficulty) return '';
    const text = fill('examDifficulty', { n: difficulty });
    return `<span class="exam-stars" role="img" aria-label="${escapeHtml(text)}" title="${escapeHtml(text)}">${'★'.repeat(difficulty)}<span class="exam-stars-off">${'★'.repeat(5 - difficulty)}</span></span>`;
  }

  /* Step 1 */
  function renderExams() {
    const cards = data.exams.map(exam => {
      const badges = exam.comingSoon ? '' : `
        <div class="exam-card-meta">
          <span class="exam-card-meta-label">${escapeHtml(t(exam.skipLevel ? 'examLevelSingle' : 'examLevelsLabel'))}</span>
          <span class="exam-chips">${levelBadges(exam).map(code => `<span class="exam-chip">${escapeHtml(code)}</span>`).join('')}</span>
        </div>`;
      const top = exam.fullName || exam.comingSoon ? `
        <span class="exam-card-top">
          <span class="exam-card-kicker">${escapeHtml(exam.fullName || '')}</span>
          ${exam.comingSoon ? `<span class="exam-badge">${escapeHtml(t('examSoon'))}</span>` : ''}
        </span>` : '';
      const content = `${top}
        <h3>${escapeHtml(exam.name)}</h3>
        <p>${escapeHtml(loc(exam.description))}</p>
        ${badges}
        <span class="exam-card-action">${escapeHtml(t(exam.comingSoon ? 'examSoon' : (exam.skipLevel ? 'examViewSections' : 'examViewLevels')))}${exam.comingSoon ? '' : ' <span aria-hidden="true">→</span>'}</span>`;
      if (exam.comingSoon) {
        return `<li><div class="exam-card is-soon" aria-disabled="true" aria-label="${escapeHtml(fill('examSoonLabel', { name: exam.name }))}">${content}</div></li>`;
      }
      return `<li><a class="exam-card" href="${hashFor(exam.id)}" aria-label="${escapeHtml(fill('examChooseLabel', { name: exam.fullName ? `${exam.name} (${exam.fullName})` : exam.name }))}">${content}</a></li>`;
    }).join('');
    return heading(t('examChooseExam'), t('examChooseExamSub'), null) + `<ul class="exam-grid" role="list">${cards}</ul>`;
  }

  /* Step 2 */
  function renderLevels(exam) {
    const cards = exam.levels.map(level => {
      const meta = levelMeta(level);
      return `<li><a class="exam-card exam-level-card" href="${hashFor(exam.id, level.id)}" aria-label="${escapeHtml(fill('examChooseLabel', { name: `${meta.code} – ${loc(meta.name)}` }))}">
        <span class="exam-level-badge">${escapeHtml(meta.code)}</span>
        <div class="exam-level-body">
          <h3>${escapeHtml(loc(meta.name))}</h3>
          ${level.officialName ? `<span class="exam-card-kicker">${escapeHtml(level.officialName)}</span>` : ''}
          <p>${escapeHtml(loc(meta.description))}</p>
          <span class="exam-card-foot">${stars(meta.difficulty)}<span class="exam-card-action">${escapeHtml(t('examViewSections'))} <span aria-hidden="true">→</span></span></span>
        </div>
      </a></li>`;
    }).join('');
    return heading(t('examChooseLevel'), fill('examChooseLevelSub', { exam: exam.name }), hashFor())
      + `<ul class="exam-grid" role="list">${cards}</ul>`;
  }

  /* Step 3 */
  function renderSections(route) {
    const { exam, level } = route;
    const meta = levelMeta(level);
    const cards = level.sections.map(section => {
      const info = data.sections[section.id] || { name: section.id, translation: '', description: '' };
      const translation = loc(info.translation);
      const showTranslation = translation && translation !== info.name;
      return `<li><a class="exam-card" href="${routeHash({ ...route, section })}" aria-label="${escapeHtml(fill('examChooseLabel', { name: showTranslation ? `${info.name} (${translation})` : info.name }) + ', ' + teilCount(section.teile.length))}">
        <span class="exam-card-top"><span class="exam-card-kicker">${escapeHtml(teilCount(section.teile.length))}</span></span>
        <h3><span lang="de">${escapeHtml(info.name)}</span>${showTranslation ? ` <span class="exam-translation">${escapeHtml(translation)}</span>` : ''}</h3>
        <p>${escapeHtml(loc(info.description))}</p>
        <span class="exam-card-action">${escapeHtml(t('examViewTeile'))} <span aria-hidden="true">→</span></span>
      </a></li>`;
    }).join('');
    const title = exam.skipLevel ? exam.name : `${exam.name} ${meta.code}`;
    return heading(t('examChooseSection'), fill('examChooseSectionSub', { exam: title }), exam.skipLevel ? hashFor() : hashFor(exam.id))
      + `<ul class="exam-grid" role="list">${cards}</ul>`;
  }

  function exerciseLink(exercise, teilLabel, index) {
    const title = loc(exercise.title) || fill('examSetFallback', { n: index + 1 });
    const href = String(exercise.href || '');
    const external = /^https?:\/\//i.test(href) && !href.startsWith(location.origin);
    return `<li class="exam-set">
      <span class="exam-set-title">${escapeHtml(title)}</span>
      <a class="btn primary exam-start" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ''} data-exam-exercise
        aria-label="${escapeHtml(fill('examStartLabel', { name: `${teilLabel} – ${title}` }) + (external ? ` (${t('examNewTab')})` : ''))}">${escapeHtml(t('examStart'))}</a>
    </li>`;
  }

  /* Step 4 */
  function renderTeile(route) {
    const { exam, level, section } = route;
    const info = data.sections[section.id] || { name: section.id, translation: '' };
    const translation = loc(info.translation);
    const name = translation && translation !== info.name ? `${info.name} (${translation})` : info.name;
    const cards = section.teile.map((teil, index) => {
      const label = `Teil ${index + 1}`;
      const title = loc(teil.title);
      const exercises = (teil.exercises || []).filter(item => item && item.href);
      const body = exercises.length
        ? `<ul class="exam-sets" role="list">${exercises.map((item, i) => exerciseLink(item, label, i)).join('')}</ul>`
        : `<p class="exam-teil-empty">${escapeHtml(t('examNoExercises'))}</p>
           <button class="btn exam-start" type="button" disabled aria-label="${escapeHtml(fill('examStartSoonLabel', { name: label }))}">${escapeHtml(t('examStart'))}</button>`;
      return `<li><article class="exam-card exam-teil${exercises.length ? '' : ' is-soon'}" aria-labelledby="exam-teil-${index + 1}">
        <div class="exam-card-top">
          <h3 id="exam-teil-${index + 1}" lang="de">${label}</h3>
          ${exercises.length ? '' : `<span class="exam-badge">${escapeHtml(t('examSoon'))}</span>`}
        </div>
        ${title ? `<p class="exam-teil-title">${escapeHtml(title)}</p>` : ''}
        ${body}
      </article></li>`;
    }).join('');
    const examTitle = exam.skipLevel ? exam.name : `${exam.name} ${levelMeta(level).code}`;
    return heading(fill('examChooseTeil', { section: info.name }), fill('examChooseTeilSub', { exam: examTitle, section: name }), routeHash({ ...route, section: null }))
      + `<ul class="exam-grid exam-teil-grid" role="list">${cards}</ul>`;
  }

  function render() {
    const root = document.getElementById('examFlow');
    if (!root || !data) return;
    const route = parseRoute(location.hash);

    // Keep the address tidy when it pointed to something that does not exist (or to ÖSD).
    if (location.hash.startsWith('#exams/') && routeHash(route) !== location.hash) {
      history.replaceState({ ...(history.state || {}), baPage: 'exams' }, '', routeHash(route));
    }

    // A hash link fires both hashchange and popstate (and app.js answers popstate with ba:pagechange);
    // drawing the same step twice would drop the focus moved to its heading.
    const key = routeHash(route) + '|' + lang();
    if (key === rendered) return;
    rendered = key;

    const current = step(route);
    const views = [null, renderExams, () => renderLevels(route.exam), () => renderSections(route), () => renderTeile(route)];
    root.querySelector('#examSteps').innerHTML = renderSteps(route);
    root.querySelector('#examView').innerHTML = views[current]();
    root.dataset.step = String(current);

    if (focusNext) {
      focusNext = false;
      const title = root.querySelector('#examFlowTitle');
      title?.focus({ preventScroll: true });
      const top = root.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * .6) {
        root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    }
  }

  function setup() {
    const root = document.getElementById('examFlow');
    if (!root || !data) return;

    // Clicks on step links and cards change the hash; move focus to the new heading afterwards.
    root.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const href = link.getAttribute('href');
      if (href.startsWith('#exams')) { focusNext = true; return; }
      // Other pages of this site open their deep links only on load (see home.js for the same case).
      if (link.hasAttribute('data-exam-exercise') && href.startsWith('#') && !href.startsWith('#grammar')) {
        event.preventDefault();
        location.assign(href);
        location.reload();
      }
    });

    if (initialHash.startsWith('#exams/')) {
      history.replaceState({ ...(history.state || {}), baPage: 'exams' }, '', initialHash);
    }
    render();
  }

  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#exams')) return;
    if (!document.getElementById('page-exams')?.classList.contains('active')) {
      window.BA?.showPage('exams', { historyMode: 'none', scroll: false });
    }
    render();
  });
  window.addEventListener('ba:pagechange', event => { if (event.detail?.page === 'exams') render(); });
  window.addEventListener('ba:languagechange', render);
  document.addEventListener('DOMContentLoaded', setup);
})();
