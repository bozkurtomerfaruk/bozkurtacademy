// Schreiben (sınav hazırlığı): bir yazma görevi (data/exams/<sınav>/<seviye>/schreiben/teil-<n>/<set>.json).
// js/exams.js bir Schreiben seti açılınca render() çağırır (#exams/goethe/b1/schreiben/1/set-1). Biçim: docs/sinav-setleri.md.
// Görev, canlı kelime sayacı, kendi kendini kontrol listesi, Redemittel; gönderince örnek cevap (Musterlösung) açılır.
// Taslak sadece bu cihazda durur (localStorage baWriting:<sınav>-<seviye>-<teil>-<set>).
// Gönderim 'ba:writing-submitted' olayıyla js/account/session.js'e gider: giriş yapmış ve onaylı öğrencinin metni
// users/{uid}/writings'e kaydedilir, öğretmen geri bildirim yazar. Ziyaretçide Firebase hiç yüklenmez, metin gönderilmez.
// Arayüz metinleri js/app.js'te (wt…); kontrol listesi, kalıpların açıklaması ve notlar Türkçe.
(() => {
  'use strict';

  const t = key => window.BA?.t ? window.BA.t(key) : key;
  const fill = (key, values) => t(key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  const lang = () => window.BA?.lang || 'tr';
  const esc = value => window.baHtml.escapeHtml(value);
  // html-safe-names: status navActions() points groups notes head postHtml(set.post)
  const MAX_CHARS = 4000; // firestore.rules ile aynı sınır

  // Harf ve rakam dizileri; "-" ya da "'" ile birleşenler tek kelime (B1-Prüfung). scripts/check-exams.mjs aynı kuralı kullanır.
  const countWords = value => (String(value).match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []).length;
  const CRITERIA = ['aufgabe', 'aufbau', 'sprache'];

  const files = {};   // path -> Promise of the set
  const states = {};  // path -> { text, submitted, checks: {index: bool} }
  const navs = {};

  function load(path) {
    files[path] ||= fetch(path, { cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error(response.status); return response.json(); })
      .catch(error => { delete files[path]; throw error; });
    return files[path];
  }

  const draftKey = set => `baWriting:${set.exam}-${set.level}-${set.teil}-${set.set}`;
  function readDraft(set) {
    try { const value = JSON.parse(localStorage.getItem(draftKey(set)) || 'null'); return typeof value?.text === 'string' ? value.text : ''; }
    catch (_) { return ''; }
  }
  function writeDraft(set, text) {
    try {
      if (text.trim()) localStorage.setItem(draftKey(set), JSON.stringify({ text }));
      else localStorage.removeItem(draftKey(set));
    } catch (_) {}
  }
  const account = () => { try { return localStorage.getItem('baAccount'); } catch (_) { return null; } };

  // Kelime sayacının durumu: kısa / iyi / uzun (göndermeyi engellemez).
  function counterState(set, n) {
    const { min, max } = set.words;
    if (n < min) return { cls: 'is-short', key: n === 0 ? 'wtCountTarget' : 'wtCountShort' };
    if (n <= max) return { cls: 'is-ok', key: 'wtCountOk' };
    return { cls: 'is-long', key: 'wtCountLong' };
  }

  // Görev: durum, (forum görevlerinde) Gästebuch'taki görüş, görev cümlesi, varsa içerik maddeleri ve yönerge.
  function postHtml(post) {
    if (!post) return '';
    const head = [post.author, post.time].filter(Boolean).map(esc).join(' · ');
    return `<figure class="wt-post">
      ${post.site ? `<p class="wt-post-site">${esc(post.site)} · Gästebuch</p>` : ''}
      <blockquote><p>${esc(post.text)}</p></blockquote>
      <figcaption>${head}</figcaption>
    </figure>`;
  }

  function taskHtml(set) {
    const points = set.points?.length ? `<ul class="wt-points">${set.points.map(point => `<li>${esc(point)}</li>`).join('')}</ul>` : '';
    return `<div class="wt-task" lang="de">
      <p>${esc(set.situation)}</p>
      ${postHtml(set.post)}
      <p><strong>${esc(set.task)}</strong></p>
      ${points}
      ${set.instructions ? `<p class="wt-instructions">${esc(set.instructions)}</p>` : ''}
    </div>`;
  }

  // Metin alanındaki ipucu, metin türüne göre (data: textType).
  const PLACEHOLDERS = {
    'email-informal': 'Liebe …, / Lieber …,', sms: 'Hallo …,',
    'email-semiformal': 'Liebe Frau …, / Sehr geehrter Herr …,', 'email-formal': 'Sehr geehrte Damen und Herren,',
    forum: 'Ich finde, …'
  };

  function checklistHtml(set, state) {
    const groups = CRITERIA.map(criterion => {
      const items = set.checklist.map((item, index) => ({ item, index })).filter(({ item }) => item.criterion === criterion);
      if (!items.length) return '';
      return `<li class="wt-crit">${esc(t(`wtCrit_${criterion}`))}</li>` + items.map(({ item, index }) => `<li>
        <input type="checkbox" id="wt-c-${index}" data-wt-check="${index}"${state.checks[index] ? ' checked' : ''}>
        <label for="wt-c-${index}" lang="tr">${esc(item.tr)}</label></li>`).join('');
    }).join('');
    return `<section class="wt-card wt-checklist" aria-labelledby="wtCheckTitle">
      <h3 id="wtCheckTitle">${esc(t('wtCheckTitle'))}</h3>
      <ul class="wt-checks">${groups}</ul>
      <p class="wt-muted">${esc(t('wtCheckNote'))}</p>
    </section>`;
  }

  function redemittelHtml(set) {
    const groups = set.redemittel.map(group => `<dl><dt lang="de">${esc(group.group)}</dt>${group.items.map(item =>
      `<dd><span lang="de">${esc(item.de)}</span> <span class="wt-tr" lang="tr">· ${esc(item.tr)}</span></dd>`).join('')}</dl>`).join('');
    return `<details class="wt-redemittel"><summary>${esc(t('wtRedemittel'))}</summary><div class="wt-rm">${groups}</div></details>`;
  }

  function editorHtml(set, state) {
    const n = countWords(state.text);
    const c = counterState(set, n);
    const who = account();
    const note = who === 'student' ? t('wtNoteStudent') : who === 'teacher' ? t('wtNoteTeacher') : t('wtNoteVisitor');
    return `<div class="wt-grid">
      <section class="wt-card wt-editor" aria-labelledby="wtTextLabel">
        <h3 id="wtTextLabel"><label for="wtText">${esc(t('wtYourText'))}</label></h3>
        <textarea id="wtText" lang="de" spellcheck="false" autocomplete="off" autocapitalize="sentences" maxlength="${MAX_CHARS}"
          aria-describedby="wtCount wtCountState" placeholder="${esc(PLACEHOLDERS[set.textType] || (set.register === 'du' ? 'Liebe …, / Lieber …,' : 'Sehr geehrte …,'))}">${esc(state.text)}</textarea>
        <p class="wt-counter"><span id="wtCount" data-wt-count>${esc(fill('wtWords', { n }))}</span>
          <span class="wt-pill ${esc(c.cls)}" id="wtCountState" aria-live="polite" data-wt-state>${esc(fill(c.key, { min: set.words.min, max: set.words.max, target: set.words.target }))}</span></p>
        <p class="wt-error" role="alert" data-wt-error hidden></p>
        <p class="wt-muted">${esc(t('wtDraftNote'))}</p>
        <div class="wt-actions"><button class="btn primary" type="button" data-wt-submit>${esc(t('wtSubmit'))}</button></div>
        <p class="wt-muted" data-wt-who>${esc(note)}</p>
      </section>
      ${checklistHtml(set, state)}
    </div>
    ${redemittelHtml(set)}`;
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

  function resultHtml(set, state, path) {
    const who = account();
    // Ziyaretçi ve öğretmen: hemen bilgi notu. Öğrenci: js/account/session.js kaydedip notu buraya yazar.
    const status = who === 'student' ? `<p class="notice wt-status" role="status" data-wt-status>${esc(t('wtSaving'))}</p>`
      : who === 'teacher' ? `<p class="notice wt-status" role="status" data-wt-status>${esc(t('wtTeacherNotSaved'))}</p>`
      : `<p class="notice wt-status" role="status" data-wt-status>${esc(t('wtVisitorNotSaved'))} <a class="ba-link" href="giris.html">${esc(t('wtLoginLink'))}</a></p>`;
    const notes = set.model.notes.map(note => `<li lang="tr">${esc(note)}</li>`).join('');
    return `<div class="wt-result" tabindex="-1" data-wt-result>
      <div class="wt-saved" id="wtSaved">${status}</div>
      <div class="wt-cols">
        <section class="wt-card" aria-labelledby="wtMineTitle">
          <h3 id="wtMineTitle">${esc(fill('wtMine', { n: countWords(state.text) }))}</h3>
          <div class="wt-text" lang="de">${esc(state.text)}</div>
        </section>
        <section class="wt-card" aria-labelledby="wtModelTitle">
          <h3 id="wtModelTitle">${esc(fill('wtModel', { n: countWords(set.model.text) }))}</h3>
          <div class="wt-text" lang="de">${esc(set.model.text)}</div>
          <ul class="wt-notes">${notes}</ul>
          <p class="wt-muted">${esc(t('wtModelNote'))}</p>
        </section>
      </div>
      <div class="task-actions">
        ${navActions(path)}
        <button class="btn ${navs[path] ? 'ghost' : 'primary'}" type="button" data-wt-again>${esc(t('wtAgain'))}</button>
      </div>
    </div>`;
  }

  function draw(container, set, path) {
    const state = states[path];
    const meta = [fill('taskMinutes', { n: set.minutes }), fill('wtTargetMeta', { n: set.words.target })];
    if (lang() !== 'tr') meta.push(t('wtTurkishNote'));
    container.innerHTML = `<div class="task wt${state.submitted ? ' is-submitted' : ''}">
      <div class="task-head"><p class="task-meta">${meta.map(item => `<span>${esc(item)}</span>`).join('')}</p></div>
      ${taskHtml(set)}
      ${state.submitted ? resultHtml(set, state, path) : editorHtml(set, state)}
    </div>`;
  }

  function updateCounter(container, set, text) {
    const n = countWords(text);
    const c = counterState(set, n);
    const count = container.querySelector('[data-wt-count]');
    const pill = container.querySelector('[data-wt-state]');
    if (count) count.textContent = fill('wtWords', { n });
    if (pill) {
      const label = fill(c.key, { min: set.words.min, max: set.words.max, target: set.words.target });
      pill.className = `wt-pill ${c.cls}`;
      if (pill.textContent !== label) pill.textContent = label; // aria-live: only when the state changes
    }
  }

  function bind(container) {
    if (container.dataset.wtBound) return;
    container.dataset.wtBound = '1';
    const smooth = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    container.addEventListener('input', event => {
      if (event.target.id !== 'wtText') return;
      const path = container.dataset.taskPath;
      const state = states[path];
      if (!state) return;
      state.text = event.target.value.slice(0, MAX_CHARS);
      load(path).then(set => { writeDraft(set, state.text); updateCounter(container, set, state.text); });
      const error = container.querySelector('[data-wt-error]');
      if (error && !error.hidden && countWords(state.text)) error.hidden = true;
    });
    container.addEventListener('change', event => {
      const box = event.target.closest('[data-wt-check]');
      const state = states[container.dataset.taskPath];
      if (box && state) state.checks[box.dataset.wtCheck] = box.checked;
    });
    container.addEventListener('click', event => {
      const path = container.dataset.taskPath;
      const state = states[path];
      if (!state) return;
      if (event.target.closest('[data-wt-submit]')) {
        if (!countWords(state.text)) {
          const error = container.querySelector('[data-wt-error]');
          error.textContent = t('wtEmpty');
          error.hidden = false;
          container.querySelector('#wtText')?.focus();
          return;
        }
        load(path).then(set => {
          state.submitted = true;
          draw(container, set, path);
          const result = container.querySelector('[data-wt-result]');
          result?.focus({ preventScroll: true });
          result?.scrollIntoView({ behavior: smooth(), block: 'start' });
          window.dispatchEvent(new CustomEvent('ba:writing-submitted', { detail: {
            exam: set.exam, level: set.level, teil: set.teil, set: set.set,
            text: state.text.slice(0, MAX_CHARS), words: Math.min(countWords(state.text), 1000), noteIn: '#wtSaved'
          } }));
        });
      }
      if (event.target.closest('[data-wt-again]')) {
        state.submitted = false;
        load(path).then(set => {
          draw(container, set, path);
          const area = container.querySelector('#wtText');
          area?.focus({ preventScroll: true });
          area?.scrollIntoView({ behavior: smooth(), block: 'center' });
        });
      }
    });
  }

  // preserve: keep the text and the checks (used when only the interface language changed).
  function render(container, { path, preserve = false, nav = null } = {}) {
    container.dataset.taskPath = path;
    if (nav) navs[path] = nav; else delete navs[path];
    container.innerHTML = `<p class="task-status" role="status">${esc(t('taskLoading'))}</p>`;
    return load(path).then(set => {
      if (!container.isConnected || container.dataset.taskPath !== path) return;
      if (!preserve || !states[path]) states[path] = { text: readDraft(set), submitted: false, checks: {} };
      draw(container, set, path);
      bind(container);
    }).catch(() => {
      if (!container.isConnected || container.dataset.taskPath !== path) return;
      container.innerHTML = `<p class="task-status" role="alert">${esc(t('taskLoadError'))}</p>
        <button class="btn primary" type="button" data-task-reload>${esc(t('taskReload'))}</button>`;
      container.querySelector('[data-task-reload]').addEventListener('click', () => render(container, { path, preserve: true }));
    });
  }

  window.BAWritingTask = { render, load, countWords };
})();
