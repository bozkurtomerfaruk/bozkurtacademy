(() => {
 'use strict';
 document.addEventListener('DOMContentLoaded', () => {
   const themeButton = document.getElementById('themeToggle');
   function updateThemeButton() {
     const dark = document.documentElement.dataset.theme === 'dark';
     const language = document.documentElement.lang?.slice(0,2) || 'tr';
     const labels = {tr:['Koyu temaya geç','Açık temaya geç'],de:['Dunkles Design aktivieren','Helles Design aktivieren'],en:['Switch to dark theme','Switch to light theme']};
     const label = (labels[language] || labels.tr)[dark ? 1 : 0];
     document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#171d19' : '#f8f7f3');
     if (themeButton) {
       themeButton.setAttribute('aria-label',label);
       themeButton.setAttribute('title',label);
       themeButton.setAttribute('aria-pressed',String(dark));
       themeButton.classList.toggle('is-dark', dark);
     }
   }
   themeButton?.addEventListener('click', () => {
     const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
     document.documentElement.dataset.theme = theme;
     try {localStorage.setItem('ba-theme',theme);} catch (_) {}
     updateThemeButton();
   });
   window.addEventListener('ba:languagechange',updateThemeButton);
   window.addEventListener('storage',event => {
     if (event.key === 'ba-theme') {
       document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
       updateThemeButton();
     }
   });
   updateThemeButton();
   const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
   const atomic = '.a1-section, .a1-practice, .a1-author, .a1-article-header, .a1-contents, .about-text, .level-card, .contact-mail-row, .contact-heading, .contact-guide, .field, .contact-submit, .page-hero, .lesson-hero-pro, .lesson-feature-card, .lesson-offer, .lesson-section-head, .lesson-check-list > *, .lesson-why-cards > *, .lesson-final-cta, .about-photo, .founder-info, .timeline-item, .method-card, .card, .contact-info, .exercise-discovery-toolbar, .exercise-discovery-levels, .exercise-discovery-heading, .exercise-discovery-topic, .exercise-set-card, .topic-overview, .grammar-toolbar, .grammar-level-tabs, .grammar-topic-card, .grammar-detail-view, .lesson-panel, .quiz-panel, .section-head';
   const tracked = new Set();
   let observer, scheduled = false;
   function showAll() {
     observer?.disconnect(); observer = null;
     document.querySelectorAll('.site-motion').forEach(page => page.classList.remove('site-motion'));
     tracked.forEach(element => element.classList.add('is-visible'));
   }
   function setup() {
     scheduled = false;
     if (motion.matches || !('IntersectionObserver' in window)) { showAll(); return; }
     if (!observer) {
       try {
         observer = new IntersectionObserver(entries => entries.forEach(entry => {
           if (entry.isIntersecting) entry.target.classList.add('is-visible');
           else if (entry.boundingClientRect.top >= window.innerHeight && !entry.target.contains(document.activeElement)) entry.target.classList.remove('is-visible');
         }), {threshold:0.08, rootMargin:'0px 0px -8% 0px'});
       } catch (_) {showAll();return;}
     }
     tracked.forEach(element => {
       if (!element.isConnected) {observer.unobserve(element);tracked.delete(element);}
     });
     document.querySelectorAll('.page:not(#page-home)').forEach(page => {
       page.classList.add('site-motion');
       const candidates = [...page.querySelectorAll(atomic)];
       page.querySelectorAll(':scope > section.block').forEach(block => {
         if (!block.querySelector(atomic) && !block.classList.contains('exercise-hub')) candidates.push(block);
       });
       candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element))).forEach(element => {
         if (tracked.has(element)) return;
         element.setAttribute('data-site-reveal','');
         tracked.add(element);
         observer.observe(element);
       });
     });
   }
   function schedule() {
     if (!scheduled) {scheduled = true; requestAnimationFrame(setup);}
   }
   new MutationObserver(schedule).observe(document.querySelector('main') || document.body, {childList:true,subtree:true});
   document.addEventListener('focusin',event => event.target.closest('[data-site-reveal]')?.classList.add('is-visible'));
   window.addEventListener('ba:pagechange', schedule);
   motion.addEventListener('change', () => {showAll();tracked.clear();setup();});
   setup();
 });
})();

