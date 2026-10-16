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

   const rawQuestion = parts[4] || '';
const match = rawQuestion.match(/^q?(\d+)$/i);

return {
  level: parts[1] || null,
  topic: parts[2] || null,
  exercise: parts[3] || null,
  question: match ? Math.max(1, Number(match[1])) : null
};
  }

  function exerciseHash(level, topic, exercise, question) {
  if (!level) return '#exercises';

  if (!topic) {
    return `#exercises/${encodePart(level)}`;
  }

  if (!exercise) {
    return `#exercises/${encodePart(level)}/${encodePart(topic)}`;
  }

  const base =
    `#exercises/${encodePart(level)}/${encodePart(topic)}/${encodePart(exercise)}`;

  if (!question) return base;

  return `${base}/q${Math.max(1, Number(question) || 1)}`;
}
  function replaceCurrentExerciseUrl(view, ids = {}) {
    const hs = history.state || {};
    const level = ids.level ?? hs.level ?? null;
    const topic = ids.topic ?? hs.topic ?? null;
    const exercise = ids.exercise ?? hs.exercise ?? null;
    const question = ids.question ?? hs.question ?? null;

    let hash = '#exercises';

    if (view === 'topics' && level) {
      hash = exerciseHash(level);
    }

    if (view === 'sets' && level && topic) {
      hash = exerciseHash(level, topic);
    }

    if (view === 'quiz' && level && topic && exercise) {
     hash = exerciseHash(level, topic, exercise, question);
}

    history.replaceState(
      {
        ...hs,
        baPage: 'exercises',
        baExerciseView: view,
        level: level || null,
        topic: topic || null,
        exercise: view === 'quiz' ? (exercise || null) : null,
        question: view === 'quiz' ? (Number(question) || 1) : null
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
    window.addEventListener('ba:exercise-question-change', () => {
      scheduleUrlSync();
});
  }

  // Özel link (doğrudan URL veya sayfa içindeki bir bağlantı): seviye › konu › alıştırma adımları
  // geçmişe ayrı kayıt olarak yazılmaz; mevcut kayıt değiştirilir. Böylece tek geri tuşu öğrenciyi
  // geldiği yere (ör. #exams/goethe/b1/lesen) götürür. Elle gezinme quiz.js'te olduğu gibi kalır.
  async function openDeepLink(target, hash) {
    if (!target?.level) return;

    const view = target.exercise ? 'quiz' : (target.topic ? 'sets' : 'topics');

    // app.js hash'i sadeleştirse bile orijinal özel linki geri getir.
    history.replaceState(
      {
        baPage: 'exercises',
        baExerciseView: view,
        level: target.level,
        topic: target.topic,
        exercise: target.exercise,
        question: view === 'quiz' ? (target.question || 1) : null
      },
      '',
      hash
    );

    if (window.BA?.showPage) {
      window.BA.showPage('exercises', {
        historyMode: 'none',
        scroll: false
      });
    }

    try {
      const quiz = await waitFor(() => window.BAQuiz?.isReady?.() && window.BAQuiz);
      const shown = await quiz.openDeepLink(target);

      // Bulunamayan konu/alıştırmada quiz.js en yakın geçerli görünümü açar; adres onu göstersin.
      replaceCurrentExerciseUrl(shown.view, shown);
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

  // Sayfa açıkken gelen özel linkler (ör. Sınav Hazırlığı'ndaki "Başla"): sayfa yenilenmeden aç.
  // Geri/ileri ile dönülen alıştırma kayıtlarında history.state zaten dolu; onları quiz.js açar.
  window.addEventListener('hashchange', () => {
    if (history.state?.baExerciseView) return;
    const hash = location.hash;
    const target = parseExerciseHash(hash);
    if (target?.level) openDeepLink(target, hash);
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (deepTarget?.level) {
      setTimeout(() => openDeepLink(deepTarget, originalHash), 0);
    } else {
      scheduleUrlSync();
    }
  });
})();
