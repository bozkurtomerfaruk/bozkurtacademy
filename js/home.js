(() => {
  'use strict';
  const homeTranslations = {
  "tr": {
    "homeEyebrow": "Ömer Faruk Bozkurt · Online Almanca dersleri",
    "homeTitle": "Birlikte Almanca çalışalım.",
    "homeIntro": "Ben Ömer. Almanya’da yaşıyor, online Almanca dersleri veriyorum. Derslerde konuları birlikte çalışıyor, bol örnekle pratiğe döküyoruz.",
    "homeContact": "İlk ders için yaz",
    "homeExercises": "Alıştırmaları keşfet",
    "homeDuration": "50 dakika · Online",
    "homeFree": "İlk ders ücretsiz",
    "homePortraitCaption": "Almanca eğitmeni",
    "homeScroll": "Dersleri tanı",
    "homeLessonEyebrow": "Derslerde nasıl çalışıyoruz?",
    "homeLessonTitle": "Anlayarak öğren. Konuşarak pekiştir.",
    "homeLessonLink": "Dersler hakkında",
    "homeStep1Title": "Önce seni tanıyorum.",
    "homeStep1Text": "İlk derste seviyeni, hedefini ve zorlandığın konuları konuşuyoruz.",
    "homeStep2Title": "Birlikte uyguluyoruz.",
    "homeStep2Text": "Bir kuralı öğrendikten sonra cümleler kuruyor, kısa diyaloglarla kullanıyoruz.",
    "homeStep3Title": "Ders dışında da çalışıyorsun.",
    "homeStep3Text": "Buradaki konu anlatımları ve alıştırmalarla öğrendiklerini tekrar edebilirsin.",
    "homePracticeEyebrow": "Kısa bir Almanca molası",
    "homePracticeTitle": "Bir cümleyle başla.",
    "homePracticeText": "Konunu seç, soruları çöz ve her cevabın açıklamasını oku. Alıştırmalar herkese açık.",
    "homePracticeLink": "sein & haben ile çalış",
    "homeExampleNote": "“Acıktım” derken haben, “yorgunum” derken sein kullanılır. Küçük bir fark, iki günlük ifade.",
    "homeClosingEyebrow": "Tanışalım",
    "homeClosingTitle": "Almanca öğrenmek için nereden başlayacağını konuşalım.",
    "homeClosingText": "Seviyeni ve ne için Almanca öğrenmek istediğini yaz. İlk ders ücretsiz."
  },
  "de": {
    "homeEyebrow": "Ömer Faruk Bozkurt · Online-Deutschunterricht",
    "homeTitle": "Lass uns gemeinsam Deutsch lernen.",
    "homeIntro": "Ich bin Ömer. Ich lebe in Deutschland und gebe online Deutschunterricht. Wir erarbeiten die Themen gemeinsam und üben sie mit vielen Beispielen.",
    "homeContact": "Erste Stunde anfragen",
    "homeExercises": "Übungen entdecken",
    "homeDuration": "50 Minuten · Online",
    "homeFree": "Erste Stunde kostenlos",
    "homePortraitCaption": "Deutschlehrer",
    "homeScroll": "Unterricht kennenlernen",
    "homeLessonEyebrow": "So arbeiten wir im Unterricht",
    "homeLessonTitle": "Verstehen, üben und sprechen.",
    "homeLessonLink": "Mehr zum Unterricht",
    "homeStep1Title": "Zuerst lerne ich dich kennen.",
    "homeStep1Text": "In der ersten Stunde sprechen wir über dein Niveau, dein Ziel und die Themen, die dir schwerfallen.",
    "homeStep2Title": "Wir wenden das Gelernte an.",
    "homeStep2Text": "Nach einer neuen Regel bilden wir Sätze und verwenden sie in kurzen Dialogen.",
    "homeStep3Title": "Du übst auch zwischen den Stunden.",
    "homeStep3Text": "Mit den Erklärungen und Übungen hier kannst du das Gelernte wiederholen.",
    "homePracticeEyebrow": "Eine kleine Deutschpause",
    "homePracticeTitle": "Beginne mit einem Satz.",
    "homePracticeText": "Wähle ein Thema, löse die Aufgaben und lies die Erklärungen. Die Übungen sind frei zugänglich.",
    "homePracticeLink": "sein & haben üben",
    "homeExampleNote": "Mit Hunger steht haben, mit müde steht sein. Ein kleiner Unterschied, zwei Ausdrücke für den Alltag.",
    "homeClosingEyebrow": "Lernen wir uns kennen",
    "homeClosingTitle": "Lass uns besprechen, wo du anfangen kannst.",
    "homeClosingText": "Schreib mir dein Niveau und wofür du Deutsch lernen möchtest. Die erste Stunde ist kostenlos."
  },
  "en": {
    "homeEyebrow": "Ömer Faruk Bozkurt · Online German lessons",
    "homeTitle": "Let’s learn German together.",
    "homeIntro": "I’m Ömer. I live in Germany and teach German online. We work through topics together and put them into practice with plenty of examples.",
    "homeContact": "Ask about a first lesson",
    "homeExercises": "Explore the exercises",
    "homeDuration": "50 minutes · Online",
    "homeFree": "First lesson free",
    "homePortraitCaption": "German teacher",
    "homeScroll": "Meet the lessons",
    "homeLessonEyebrow": "How we work in a lesson",
    "homeLessonTitle": "Understand it. Practise it. Say it.",
    "homeLessonLink": "About the lessons",
    "homeStep1Title": "First, I get to know you.",
    "homeStep1Text": "In the first lesson, we talk about your level, goals and the topics you find difficult.",
    "homeStep2Title": "We put it into practice.",
    "homeStep2Text": "After learning a rule, we build sentences and use them in short dialogues.",
    "homeStep3Title": "You can practise between lessons.",
    "homeStep3Text": "Use the explanations and exercises here to review what you have learned.",
    "homePracticeEyebrow": "A little German break",
    "homePracticeTitle": "Start with a sentence.",
    "homePracticeText": "Choose a topic, answer the questions and read the explanations. The exercises are open to everyone.",
    "homePracticeLink": "Practise sein & haben",
    "homeExampleNote": "Use haben with Hunger and sein with müde. One small difference, two everyday expressions.",
    "homeClosingEyebrow": "Let’s meet",
    "homeClosingTitle": "Let’s talk about where you can start.",
    "homeClosingText": "Tell me your level and why you want to learn German. The first lesson is free."
  }
};
  // Register before app.js applies the initial language at DOMContentLoaded.
  if (window.BA?.translations) {
    Object.entries(homeTranslations).forEach(([lang, values]) => {
      Object.assign(window.BA.translations[lang], values);
    });
  }
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
