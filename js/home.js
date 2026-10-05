(() => {
  'use strict';
  const homeTranslations = {
  "tr": {
    "homeEyebrow": "Ömer Faruk Bozkurt · Online Almanca dersleri",
    "homeTitle": "Hedeflerine uygun Almanca eğitimi",
    "homeIntro": "A1’den B2’ye online Almanca dersleri, sınav hazırlığı ve günlük kullanım için dil desteği. Ömer Faruk Bozkurt ile seviyene ve öğrenme hedeflerine uygun bir ders planı.",
    "homeContact": "İlk ders için iletişim",
    "homeExercises": "Alıştırmaları keşfet",
    "homeDuration": "50 dakika · Online",
    "homeFree": "İlk ders ücretsiz",
    "homePortraitCaption": "Almanca eğitmeni",
    "homeScroll": "Dersleri tanı",
    "homeLessonEyebrow": "Ders yaklaşımı",
    "homeLessonTitle": "Konu anlatımından uygulamaya",
    "homeLessonLink": "Dersler hakkında",
    "homeStep1Title": "Seviye ve hedef belirleme",
    "homeStep1Text": "İlk derste seviyeni, hedefini ve zorlandığın konuları konuşuyoruz.",
    "homeStep2Title": "Konu anlatımı ve uygulama",
    "homeStep2Text": "Bir kuralı öğrendikten sonra cümleler kuruyor, kısa diyaloglarla kullanıyoruz.",
    "homeStep3Title": "Ders sonrası tekrar",
    "homeStep3Text": "Buradaki konu anlatımları ve alıştırmalarla öğrendiklerini tekrar edebilirsin.",
    "homePracticeEyebrow": "Alıştırmalar",
    "homePracticeTitle": "Seviyene uygun Almanca alıştırmaları",
    "homePracticeText": "Konunu seç, soruları çöz ve her cevabın açıklamasını oku. Alıştırmalar herkese açık.",
    "homePracticeLink": "sein & haben ile çalış",
    "homeExampleNote": "“Acıktım” derken haben, “yorgunum” derken sein kullanılır. Küçük bir fark, iki günlük ifade.",
    "homeClosingEyebrow": "İlk görüşme",
    "homeClosingTitle": "Almanca eğitimini birlikte planlayalım",
    "homeClosingText": "Seviyeni ve ne için Almanca öğrenmek istediğini yaz. İlk ders ücretsiz."
  },
  "de": {
    "homeEyebrow": "Ömer Faruk Bozkurt · Online-Deutschunterricht",
    "homeTitle": "Deutschunterricht für deine Ziele",
    "homeIntro": "Online-Deutschunterricht von A1 bis B2, Prüfungsvorbereitung und Deutsch für den Alltag. Mit Ömer Faruk Bozkurt lernst du nach einem Plan, der zu deinem Niveau und deinen Zielen passt.",
    "homeContact": "Erste Stunde anfragen",
    "homeExercises": "Übungen entdecken",
    "homeDuration": "50 Minuten · Online",
    "homeFree": "Erste Stunde kostenlos",
    "homePortraitCaption": "Deutschlehrer",
    "homeScroll": "Unterricht kennenlernen",
    "homeLessonEyebrow": "Unterrichtsablauf",
    "homeLessonTitle": "Von der Erklärung zur Anwendung",
    "homeLessonLink": "Mehr zum Unterricht",
    "homeStep1Title": "Niveau und Ziele bestimmen",
    "homeStep1Text": "In der ersten Stunde sprechen wir über dein Niveau, dein Ziel und die Themen, die dir schwerfallen.",
    "homeStep2Title": "Themen erklären und anwenden",
    "homeStep2Text": "Nach einer neuen Regel bilden wir Sätze und verwenden sie in kurzen Dialogen.",
    "homeStep3Title": "Wiederholung nach dem Unterricht",
    "homeStep3Text": "Mit den Erklärungen und Übungen hier kannst du das Gelernte wiederholen.",
    "homePracticeEyebrow": "Übungen",
    "homePracticeTitle": "Deutschübungen für dein Niveau",
    "homePracticeText": "Wähle ein Thema, löse die Aufgaben und lies die Erklärungen. Die Übungen sind frei zugänglich.",
    "homePracticeLink": "sein & haben üben",
    "homeExampleNote": "Mit Hunger steht haben, mit müde steht sein. Ein kleiner Unterschied, zwei Ausdrücke für den Alltag.",
    "homeClosingEyebrow": "Erstgespräch",
    "homeClosingTitle": "Deinen Deutschunterricht gemeinsam planen",
    "homeClosingText": "Schreib mir dein Niveau und wofür du Deutsch lernen möchtest. Die erste Stunde ist kostenlos."
  },
  "en": {
    "homeEyebrow": "Ömer Faruk Bozkurt · Online German lessons",
    "homeTitle": "German lessons for your goals",
    "homeIntro": "Online German lessons from A1 to B2, exam preparation and language support for everyday life. Learn with Ömer Faruk Bozkurt through a lesson plan suited to your level and goals.",
    "homeContact": "Ask about a first lesson",
    "homeExercises": "Explore the exercises",
    "homeDuration": "50 minutes · Online",
    "homeFree": "First lesson free",
    "homePortraitCaption": "German teacher",
    "homeScroll": "Meet the lessons",
    "homeLessonEyebrow": "Teaching approach",
    "homeLessonTitle": "From explanation to practice",
    "homeLessonLink": "About the lessons",
    "homeStep1Title": "Establish your level and goals",
    "homeStep1Text": "In the first lesson, we talk about your level, goals and the topics you find difficult.",
    "homeStep2Title": "Explanation and application",
    "homeStep2Text": "After learning a rule, we build sentences and use them in short dialogues.",
    "homeStep3Title": "Review between lessons",
    "homeStep3Text": "Use the explanations and exercises here to review what you have learned.",
    "homePracticeEyebrow": "Exercises",
    "homePracticeTitle": "German exercises for your level",
    "homePracticeText": "Choose a topic, answer the questions and read the explanations. The exercises are open to everyone.",
    "homePracticeLink": "Practise sein & haben",
    "homeExampleNote": "Use haben with Hunger and sein with müde. One small difference, two everyday expressions.",
    "homeClosingEyebrow": "First consultation",
    "homeClosingTitle": "Plan your German lessons",
    "homeClosingText": "Tell me your level and why you want to learn German. The first lesson is free."
  }
};
  // Register before app.js applies the initial language at DOMContentLoaded.
  if (window.BA?.translations) {
    Object.entries(homeTranslations).forEach(([lang, values]) => {
      Object.assign(window.BA.translations[lang], values);
    });
  }
  // Apply the same punctuation style to headings in every language.
  const headingKeys = [...document.querySelectorAll('h1[data-i18n], h2[data-i18n], h3[data-i18n]')]
    .map(element => element.dataset.i18n);
  Object.values(window.BA?.translations || {}).forEach(values => {
    headingKeys.forEach(key => {
      if (typeof values[key] === 'string') values[key] = values[key].replace(/[.。]+\s*$/u, '');
    });
  });
  document.addEventListener('DOMContentLoaded', () => {
    const home = document.getElementById('page-home');
    if (!home) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const revealElements = [...home.querySelectorAll('[data-home-reveal]')];
    let observer = null;

    function revealAll() {
      observer?.disconnect();
      observer = null;
      home.classList.remove('home-motion');
      revealElements.forEach(el => el.classList.add('is-visible'));
    }

    function setupReveals() {
      if (motionPreference.matches || !('IntersectionObserver' in window)) {
        revealAll();
        return;
      }
      if (observer) return;
      try {
        observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08 });
        home.classList.add('home-motion');
        revealElements.forEach(el => {
          if (!el.classList.contains('is-visible')) observer.observe(el);
        });
      } catch (_) {
        revealAll();
      }
    }

    function syncHomeState() {
      const active = home.classList.contains('active');
      document.body.classList.toggle('home-view', active);
      if (active) setupReveals();
    }

    home.querySelectorAll('[data-home-scroll]').forEach(button => {
      button.addEventListener('click', () => {
        document.getElementById(button.dataset.homeScroll)?.scrollIntoView({
          behavior: motionPreference.matches ? 'instant' : 'smooth',
          block: 'start'
        });
      });
    });
    // app.js handles hash routes on initial load; preserve the exercise deep link.
    home.querySelector('a[href="#exercises/A1/sein-haben"]')?.addEventListener('click', event => {
      event.preventDefault();
      window.location.assign('#exercises/A1/sein-haben');
      window.location.reload();
    });
    window.addEventListener('ba:pagechange', syncHomeState);
    motionPreference.addEventListener('change', () => {
      revealAll();
      if (!motionPreference.matches && home.classList.contains('active')) setupReveals();
    });
    syncHomeState();
  });
})();
