(() => {
  'use strict';

  // İlk açılıştaki tam hash'i sakla; app.js bunu "#exercises" olarak sadeleştirebilir.
  const originalHash = location.hash || '';
  const deepTarget = parseExerciseHash(originalHash);

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

  function replaceCurrentExerciseUrl(view, ids = {}) {
    const hs = history.state || {};
    const level = ids.level ?? hs.level ?? null;
    const topic = ids.topic ?? hs.topic ?? null;
    const exercise = ids.exercise ?? hs.exercise ?? null;

    let hash = '#exercises';

    if (view === 'topics' && level) {
      hash = exerciseHash(level);
    }

    if (view === 'sets' && level && topic) {
      hash = exerciseHash(level, topic);
    }

    if (view === 'quiz' && level && topic && exercise) {
      hash = exerciseHash(level, topic, exercise);
    }

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

        try {
          value = getter();
        } catch (_) {}

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

  function syncUrlFromHistory() {
    const hs = history.state || {};

    if (hs.baPage !== 'exercises') return;

    if (hs.baExerciseView === 'quiz' && hs.level && hs.topic && hs.exercise) {
      replaceCurrentExerciseUrl('quiz', hs);
      return;
    }

    if (hs.baExerciseView === 'sets' && hs.level && hs.topic) {
      replaceCurrentExerciseUrl('sets', hs);
      return;
    }

    if (hs.baExerciseView === 'topics' && hs.level) {
      replaceCurrentExerciseUrl('topics', hs);
      return;
    }
  }

  function scheduleUrlSync() {
    [0, 80, 250, 700].forEach(delay => {
      setTimeout(syncUrlFromHistory, delay);
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
    });

    observer.observe(document.documentElement, {
      subtree: true,
      childList: true
    });

    window.addEventListener('popstate', () => {
      setTimeout(syncUrlFromHistory, 0);
    });
  }

  async function openDeepLink(target) {
    if (!target?.level) return;

    // app.js hash'i sadeleştirse bile orijinal özel linki geri getir.
    history.replaceState(
      { ...(history.state || {}), baPage: 'exercises' },
      '',
      originalHash
    );

    if (window.BA?.showPage) {
      window.BA.showPage('exercises', {
        historyMode: 'none',
        scroll: false
      });
    }

    try {
      const levelButton = await waitFor(
        () => document.querySelector(
          `[data-hub-level="${CSS.escape(target.level)}"]`
        )
      );

      levelButton.click();

      if (!target.topic) {
        replaceCurrentExerciseUrl('topics', {
          level: target.level
        });
        return;
      }

      const topicButton = await waitFor(
        () => document.querySelector(
          `.exercise-discovery-topic.ready[data-hub-topic-level="${CSS.escape(target.level)}"][data-hub-topic="${CSS.escape(target.topic)}"]`
        )
      );

      topicButton.click();

      if (!target.exercise) {
        await waitFor(
          () => history.state?.baExerciseView === 'sets' &&
                history.state?.topic === target.topic
        );

        replaceCurrentExerciseUrl('sets', {
          level: target.level,
          topic: target.topic
        });

        return;
      }

      const exerciseButton = await waitFor(
        () => document.querySelector(
          `[data-exercise="${CSS.escape(target.exercise)}"]`
        )
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

    } catch (error) {
      console.error('Deep-link could not be opened:', error);

      // Eski/geçersiz linkte öğrenciyi güvenli şekilde Alıştırmalar ana sayfasında bırak.
      history.replaceState(
        { ...(history.state || {}), baPage: 'exercises' },
        '',
        '#exercises'
      );
    }
  }

  setupDelegatedSync();

  document.addEventListener('DOMContentLoaded', () => {
    if (deepTarget?.level) {
      setTimeout(() => openDeepLink(deepTarget), 0);
    } else {
      scheduleUrlSync();
    }
  });
})();
