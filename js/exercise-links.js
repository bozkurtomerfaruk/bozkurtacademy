(() => {
  'use strict';

  // Capture the original URL before app.js reduces it to "#exercises".
  const originalHash = location.hash || '';
  const deepTarget = parseExerciseHash(originalHash);

  const LABELS = {
    tr: {
      copy: '🔗 Linki Kopyala',
      copied: '✓ Kopyalandı',
      copyError: 'Link kopyalanamadı',
      invalid: 'Alıştırma bağlantısı bulunamadı'
    },
    de: {
      copy: '🔗 Link kopieren',
      copied: '✓ Kopiert',
      copyError: 'Link konnte nicht kopiert werden',
      invalid: 'Übungslink nicht gefunden'
    },
    en: {
      copy: '🔗 Copy Link',
      copied: '✓ Copied',
      copyError: 'Could not copy link',
      invalid: 'Exercise link not found'
    }
  };

  function lang() {
    return window.BA?.lang || localStorage.getItem('baLang') || 'tr';
  }

  function tx(key) {
    return LABELS[lang()]?.[key] || LABELS.tr[key] || key;
  }

  function decodePart(value) {
    try { return decodeURIComponent(value); }
    catch { return value; }
  }

  function encodePart(value) {
    return encodeURIComponent(String(value || '').trim());
  }

  function parseExerciseHash(hash) {
    const raw = String(hash || '').replace(/^#/, '');
    const parts = raw.split('/').filter(Boolean).map(decodePart);

    if (parts[0] !== 'exercises') return null;

    return {
      level: parts[1] || null,
      topic: parts[2] || null,
      exercise: parts[3] || null
    };
  }

  function exerciseHash(level, topic, exercise) {
    if (!level) return '#exercises';
    if (!topic) return `#exercises/${encodePart(level)}`;
    if (!exercise) return `#exercises/${encodePart(level)}/${encodePart(topic)}`;
    return `#exercises/${encodePart(level)}/${encodePart(topic)}/${encodePart(exercise)}`;
  }

  function absoluteExerciseUrl(level, topic, exercise) {
    return `${location.origin}${location.pathname}${exerciseHash(level, topic, exercise)}`;
  }

  function currentIds(exerciseOverride = null) {
    const hs = history.state || {};
    return {
      level: hs.level || null,
      topic: hs.topic || null,
      exercise: exerciseOverride || hs.exercise || null
    };
  }

  function replaceCurrentExerciseUrl(view, ids = {}) {
    const hs = history.state || {};
    const level = ids.level ?? hs.level ?? null;
    const topic = ids.topic ?? hs.topic ?? null;
    const exercise = ids.exercise ?? hs.exercise ?? null;

    let hash = '#exercises';
    if (view === 'topics' && level) hash = exerciseHash(level);
    if (view === 'sets' && level && topic) hash = exerciseHash(level, topic);
    if (view === 'quiz' && level && topic && exercise) hash = exerciseHash(level, topic, exercise);

    history.replaceState(
      {
        ...hs,
        baPage: 'exercises',
        baExerciseView: view,
        level: level || null,
        topic: topic || null,
        exercise: view === 'quiz' ? (exercise || null) : null
      },
      '',
      hash
    );
  }

  function waitFor(getter, timeout = 10000, interval = 80) {
    return new Promise((resolve, reject) => {
      const started = Date.now();

      const check = () => {
        let value = null;
        try { value = getter(); } catch (_) {}

        if (value) {
          resolve(value);
          return;
        }

        if (Date.now() - started >= timeout) {
          reject(new Error('Timed out waiting for exercise navigation.'));
          return;
        }

        setTimeout(check, interval);
      };

      check();
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();

    const ok = document.execCommand('copy');
    textarea.remove();

    if (!ok) throw new Error('copy failed');
  }

  function toast(message, type = 'ok') {
    let el = document.getElementById('exerciseLinkToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'exerciseLinkToast';
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.className = `exercise-link-toast show ${type}`;

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      el.classList.remove('show');
    }, 1800);
  }

  async function copyExercise(level, topic, exercise, button = null) {
    if (!level || !topic || !exercise) {
      toast(tx('invalid'), 'bad');
      return;
    }

    const url = absoluteExerciseUrl(level, topic, exercise);

    try {
      await copyText(url);

      if (button) {
        const old = button.textContent;
        button.textContent = tx('copied');
        button.disabled = true;

        setTimeout(() => {
          button.textContent = old;
          button.disabled = false;
        }, 1400);
      }

      toast(tx('copied'));
    } catch (error) {
      console.error(error);
      toast(tx('copyError'), 'bad');
    }
  }

  function enhanceExerciseCards() {
    const grid = document.getElementById('exerciseSetGrid');
    if (!grid) return;

    const hs = history.state || {};
    if (!hs.level || !hs.topic) return;

    grid.querySelectorAll('.exercise-set-card').forEach(card => {
      if (card.querySelector('.exercise-copy-link')) return;

      const openButton = card.querySelector('[data-exercise]');
      const exerciseId = openButton?.dataset.exercise;
      if (!openButton || !exerciseId) return;

      const actions = document.createElement('div');
      actions.className = 'exercise-share-actions';

      openButton.parentNode.insertBefore(actions, openButton);
      actions.appendChild(openButton);

      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'btn ghost block exercise-copy-link';
      copy.textContent = tx('copy');
      copy.dataset.copyLevel = hs.level;
      copy.dataset.copyTopic = hs.topic;
      copy.dataset.copyExercise = exerciseId;

      copy.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        copyExercise(
          copy.dataset.copyLevel,
          copy.dataset.copyTopic,
          copy.dataset.copyExercise,
          copy
        );
      });

      actions.appendChild(copy);
    });
  }

  function enhanceQuizShareButton() {
    const quizView = document.getElementById('quizView');
    if (!quizView) return;

    const actions = quizView.querySelector('.quiz-actions');
    if (!actions || actions.querySelector('#copyCurrentExerciseLinkBtn')) return;

    const hs = history.state || {};
    if (hs.baExerciseView !== 'quiz' || !hs.level || !hs.topic || !hs.exercise) return;

    const button = document.createElement('button');
    button.id = 'copyCurrentExerciseLinkBtn';
    button.type = 'button';
    button.className = 'btn ghost';
    button.textContent = tx('copy');

    button.addEventListener('click', event => {
      event.preventDefault();
      copyExercise(
        history.state?.level,
        history.state?.topic,
        history.state?.exercise,
        button
      );
    });

    actions.appendChild(button);
  }

  function injectStyles() {
    if (document.getElementById('exerciseLinkStyles')) return;

    const style = document.createElement('style');
    style.id = 'exerciseLinkStyles';
    style.textContent = `
      .exercise-share-actions{
        display:grid;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr);
        gap:9px;
        margin-top:auto;
      }

      .exercise-share-actions .btn{
        width:100%;
        min-width:0;
      }

      .exercise-copy-link{
        white-space:nowrap;
      }

      .exercise-link-toast{
        position:fixed;
        left:50%;
        bottom:28px;
        transform:translate(-50%,18px);
        z-index:9999;
        opacity:0;
        pointer-events:none;
        background:#18140f;
        color:#fff;
        border:1px solid rgba(255,255,255,.12);
        border-radius:999px;
        padding:11px 17px;
        font-size:13px;
        font-weight:850;
        box-shadow:0 16px 38px rgba(0,0,0,.18);
        transition:opacity .18s ease, transform .18s ease;
      }

      .exercise-link-toast.show{
        opacity:1;
        transform:translate(-50%,0);
      }

      .exercise-link-toast.bad{
        background:#7a302b;
      }

      @media(max-width:650px){
        .exercise-share-actions{
          grid-template-columns:1fr;
        }

        #copyCurrentExerciseLinkBtn{
          width:100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function scheduleUrlSync() {
    // quiz.js changes history synchronously for exercises, but topic loading is async.
    [0, 80, 250, 700].forEach(delay => {
      setTimeout(() => {
        const hs = history.state || {};

        if (hs.baExerciseView === 'sets' && hs.level && hs.topic) {
          replaceCurrentExerciseUrl('sets', hs);
          enhanceExerciseCards();
        }

        if (hs.baExerciseView === 'quiz' && hs.level && hs.topic && hs.exercise) {
          replaceCurrentExerciseUrl('quiz', hs);
          enhanceQuizShareButton();
        }
      }, delay);
    });
  }

  function setupDelegatedSync() {
    document.addEventListener('click', event => {
      const exercise = event.target.closest?.('[data-exercise]');
      const topic = event.target.closest?.('.exercise-discovery-topic.ready');
      const level = event.target.closest?.('[data-hub-level]');

      if (exercise || topic || level) {
        scheduleUrlSync();
      }
    }, true);

    const observer = new MutationObserver(() => {
      scheduleUrlSync();
      enhanceExerciseCards();
      enhanceQuizShareButton();
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true
    });
  }

  async function openDeepLink(target) {
    if (!target?.level) return;

    // app.js may have simplified the hash during DOMContentLoaded.
    // Restore it while we navigate through the existing UI.
    history.replaceState(
      { ...(history.state || {}), baPage: 'exercises' },
      '',
      originalHash
    );

    if (window.BA?.showPage) {
      window.BA.showPage('exercises', { historyMode: 'none', scroll: false });
    }

    try {
      const levelButton = await waitFor(
        () => document.querySelector(`[data-hub-level="${CSS.escape(target.level)}"]`)
      );
      levelButton.click();

      if (!target.topic) {
        replaceCurrentExerciseUrl('topics', { level: target.level });
        return;
      }

      const topicButton = await waitFor(
        () => document.querySelector(
          `.exercise-discovery-topic.ready[data-hub-topic-level="${CSS.escape(target.level)}"][data-hub-topic="${CSS.escape(target.topic)}"]`
        )
      );
      topicButton.click();

      if (!target.exercise) {
        await waitFor(() => history.state?.baExerciseView === 'sets' && history.state?.topic === target.topic);
        replaceCurrentExerciseUrl('sets', {
          level: target.level,
          topic: target.topic
        });
        enhanceExerciseCards();
        return;
      }

      const exerciseButton = await waitFor(
        () => document.querySelector(`[data-exercise="${CSS.escape(target.exercise)}"]`)
      );
      exerciseButton.click();

      await waitFor(
        () => history.state?.baExerciseView === 'quiz' &&
              history.state?.exercise === target.exercise
      );

      replaceCurrentExerciseUrl('quiz', {
        level: target.level,
        topic: target.topic,
        exercise: target.exercise
      });

      enhanceQuizShareButton();
    } catch (error) {
      console.error('Deep-link could not be opened:', error);

      // If a link is outdated, safely leave the learner on the Exercises page.
      history.replaceState(
        { ...(history.state || {}), baPage: 'exercises' },
        '',
        '#exercises'
      );
    }
  }

  injectStyles();
  setupDelegatedSync();

  document.addEventListener('DOMContentLoaded', () => {
    if (deepTarget?.level) {
      // Run after app.js and quiz.js DOMContentLoaded handlers have started.
      setTimeout(() => openDeepLink(deepTarget), 0);
    } else {
      scheduleUrlSync();
    }
  });

  window.addEventListener('ba:languagechange', () => {
    document.querySelectorAll('.exercise-copy-link').forEach(button => {
      button.textContent = tx('copy');
    });

    const current = document.getElementById('copyCurrentExerciseLinkBtn');
    if (current) current.textContent = tx('copy');
  });
})();
