(() => {
  'use strict';
  // Texts live in js/app.js; headings drop a final period in every language.
  document.addEventListener('DOMContentLoaded', () => {
    function cleanHeadingPunctuation() {
      document.querySelectorAll('h1,h2,h3:not(#quizQuestion)').forEach(heading => {
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        let node, lastText = null;
        while ((node = walker.nextNode())) {
          if (node.textContent.trim()) lastText = node;
        }
        if (lastText) {
          const cleaned = lastText.textContent.replace(/[.。]+\s*$/u, '');
          if (cleaned !== lastText.textContent) lastText.textContent = cleaned;
        }
      });
    }
    cleanHeadingPunctuation();
    window.addEventListener('ba:languagechange', cleanHeadingPunctuation);
    window.addEventListener('ba:pagechange', cleanHeadingPunctuation);
    const headingObserver = new MutationObserver(cleanHeadingPunctuation);
    headingObserver.observe(document.querySelector('main'), {childList:true, subtree:true, characterData:true});
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
    // #exercises/A1/sein-haben is opened without a reload by exercise-links.js.
    // One sein/haben question per sentence; the static answers stay visible without script.
    const t = key => window.BA?.t ? window.BA.t(key) : key;
    home.querySelectorAll('[data-home-quiz] .home-quiz-item').forEach(item => {
      const sentence = item.querySelector('.home-example-sentence');
      const blank = sentence.querySelector('.home-blank');
      const answer = item.dataset.answer;
      blank.textContent = '___';
      blank.classList.add('is-open');
      const group = document.createElement('div');
      group.className = 'home-quiz-choices';
      group.setAttribute('role', 'group');
      const feedback = document.createElement('p');
      feedback.className = 'home-quiz-feedback';
      feedback.setAttribute('aria-live', 'polite');
      ['habe', 'bin'].forEach(word => {
        const button = document.createElement('button');
        button.type = 'button';
        button.lang = 'de';
        button.textContent = word;
        button.addEventListener('click', () => {
          const correct = word === answer;
          group.querySelectorAll('button').forEach(b => {
            b.classList.toggle('is-right', b === button && correct);
            b.classList.toggle('is-wrong', b === button && !correct);
            b.setAttribute('aria-pressed', String(b === button));
          });
          blank.textContent = correct ? answer : '___';
          blank.classList.toggle('is-open', !correct);
          item.dataset.state = correct ? 'right' : 'wrong';
          renderFeedback();
        });
        group.append(button);
      });
      function renderFeedback() {
        group.setAttribute('aria-label', t('homeQuizGroup'));
        if (!item.dataset.state) { feedback.textContent = ''; return; }
        feedback.textContent = `${t(item.dataset.state === 'right' ? 'homeQuizCorrect' : 'homeQuizWrong')} ${t(item.dataset.noteKey)}`;
      }
      renderFeedback();
      window.addEventListener('ba:languagechange', renderFeedback);
      item.append(group, feedback);
    });
    home.closest('.home-page')?.classList.add('has-quiz');
    window.addEventListener('ba:pagechange', syncHomeState);
    motionPreference.addEventListener('change', () => {
      revealAll();
      if (!motionPreference.matches && home.classList.contains('active')) setupReveals();
    });
    syncHomeState();
  });
})();
