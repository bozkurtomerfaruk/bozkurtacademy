// privacy.html: metnin tamamı Türkçe, Almanca ve İngilizce olarak üç blokta (data-privacy-lang).
// Dil düğmeleri (app.js, ba:languagechange) yalnızca bir bloğu gösterir; JavaScript yoksa Türkçe görünür.
(() => {
  const TITLES = {
    tr: ['Gizlilik politikası | Bozkurt Academy', 'Bozkurt Academy gizlilik politikası.'],
    de: ['Datenschutzerklärung | Bozkurt Academy', 'Datenschutzerklärung von Bozkurt Academy.'],
    en: ['Privacy policy | Bozkurt Academy', 'Bozkurt Academy privacy policy.']
  };

  function apply(lang){
    const current = lang in TITLES ? lang : 'tr';
    document.querySelectorAll('[data-privacy-lang]').forEach((block) => { block.hidden = block.dataset.privacyLang !== current; });
    document.title = TITLES[current][0];
    document.querySelector('meta[name="description"]')?.setAttribute('content', TITLES[current][1]);
    return current;
  }

  // privacy.html#seviye-testi gibi bağlantılar Türkçe bölümün kimliğini gösterir; görünen dildeki aynı
  // bölüme (data-anchor) gidilir.
  function scrollToAnchor(){
    const name = decodeURIComponent(location.hash.slice(1));
    if(!name) return;
    const target = [...document.querySelectorAll(`[data-anchor="${CSS.escape(name)}"]`)].find((el) => !el.closest('[hidden]'));
    if(target) target.scrollIntoView();
  }

  window.addEventListener('ba:languagechange', (event) => apply(event.detail?.lang));
  document.addEventListener('DOMContentLoaded', () => {
    apply(window.BA?.lang || 'tr');
    scrollToAnchor();
  });
  window.addEventListener('hashchange', scrollToAnchor);
})();
