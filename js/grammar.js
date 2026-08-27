(() => {
  'use strict';

  const TOPICS = {
    A1: [
      ['artikel', 'Artikel – der, die, das', 'Almanca isimlerin artikellerini ve temel kullanımını öğren.'],
      ['personalpronomen', 'Personalpronomen', 'ich, du, er, sie, es, wir, ihr ve sie/Sie zamirlerini tanı.'],
      ['sein-haben', 'sein & haben', 'Almancanın iki temel fiilinin Präsens çekimini öğren.'],
      ['praesens', 'Präsens', 'Düzenli ve temel düzensiz fiillerle şimdiki/geniş zamanı kur.'],
      ['w-fragen', 'W-Fragen', 'wer, was, wo, wann, warum ve wie ile soru cümleleri kur.'],
      ['akkusativ', 'Akkusativ', 'Doğrudan nesneyi, den/einen değişimini ve temel Akkusativ kullanımını öğren.'],
      ['modalverben', 'Modalverben', 'können, müssen, wollen ve diğer temel modal fiilleri kullan.'],
      ['trennbare-verben', 'Trennbare Verben', 'aufstehen, einkaufen, anrufen gibi ayrılabilen fiilleri öğren.'],
      ['possessivartikel', 'Possessivartikel', 'mein, dein, sein, ihr, unser ve euer ile sahiplik bildir.'],
      ['perfekt', 'Perfekt', 'haben/sein + Partizip II ile temel geçmiş zaman cümleleri kur.']
    ],
    A2: [
      ['dativ', 'Dativ', 'Dolaylı nesneyi, dem/der/den biçimlerini ve temel Dativ kullanımını öğren.'],
      ['wechselpraepositionen', 'Wechselpräpositionen', 'in, auf, an gibi edatları Wo?/Wohin? ayrımıyla kullan.'],
      ['reflexive-verben', 'Reflexive Verben', 'sich freuen, sich treffen ve benzeri dönüşlü fiilleri öğren.'],
      ['konjunktiv-ii-basic', 'Konjunktiv II', 'würde, könnte, müsste ve hätte/wäre ile istek ve öneri kur.'],
      ['dass-saetze', 'Nebensätze mit dass', 'dass ile yan cümlelerde fiilin sona gidişini öğren.'],
      ['weil-wenn-obwohl', 'weil / wenn / obwohl', 'Sebep, koşul ve karşıtlık bildiren yan cümleleri kur.'],
      ['komparativ-superlativ', 'Komparativ & Superlativ', 'daha büyük, en hızlı gibi karşılaştırma yapılarını öğren.'],
      ['praepositionen-a2', 'Präpositionen', 'Sık kullanılan Akkusativ ve Dativ edatlarını bağlam içinde öğren.'],
      ['adjektivdeklination-a2', 'Adjektivdeklination – Einstieg', 'Sıfat son eklerinin temel mantığına giriş yap.']
    ],
    B1: [
      ['relativsaetze', 'Relativsätze', 'der, die, das ve ilgili biçimlerle açıklayıcı yan cümleler kur.'],
      ['passiv', 'Passiv', 'werden + Partizip II ile eyleme odaklanan cümleleri öğren.'],
      ['infinitiv-mit-zu', 'Infinitiv mit zu', 'zu + Infinitiv yapısıyla daha doğal ve bağlantılı cümleler kur.'],
      ['verben-mit-praepositionen', 'Verben mit Präpositionen', 'warten auf, denken an gibi sabit fiil-edat yapılarını öğren.'],
      ['praeteritum', 'Präteritum', 'Özellikle sein, haben ve modal fiillerin geçmiş zamanını kullan.'],
      ['temporalsaetze', 'Temporalsätze', 'als, wenn, bevor, nachdem ve während ile zamanı bağla.'],
      ['zweiteilige-konnektoren', 'Zweiteilige Konnektoren', 'sowohl … als auch, weder … noch gibi bağlaç çiftlerini kullan.'],
      ['konjunktiv-ii-b1', 'Konjunktiv II – Vertiefung', 'Varsayım, tavsiye ve kibar ifadeleri daha ayrıntılı kur.']
    ],
    B2: [
      ['konjunktiv-i', 'Konjunktiv I', 'Dolaylı anlatımda başkasının sözünü tarafsız biçimde aktar.'],
      ['nominalisierung', 'Nominalisierung', 'Fiil ve sıfatları isimleştirerek daha akademik bir dil kur.'],
      ['passiv-modalverben', 'Passiv mit Modalverben', 'Modal fiilleri edilgen yapıyla birlikte doğru sırada kullan.'],
      ['partizipialkonstruktionen', 'Partizipialkonstruktionen', 'Partizip I ve II ile daha yoğun ve yazılı anlatım oluştur.'],
      ['n-deklination', 'N-Deklination', 'Student, Mensch, Kunde gibi isimlerin özel çekimini öğren.'],
      ['komplexe-nebensaetze', 'Komplexe Nebensätze', 'İleri düzey bağlaçlarla çok katmanlı yan cümleler kur.'],
      ['konnektoren-b2', 'Konnektoren B2', 'dennoch, hingegen, somit, folglich gibi bağlayıcıları doğru kullan.'],
      ['indirekte-rede', 'Indirekte Rede', 'Dolaylı anlatımı Konjunktiv I/II ile bağlam içinde kullan.']
    ]
  };

  const I18N = {
    tr: {
      tag: 'Gramer Konuları',
      heroTitle: 'Almanca gramerini seviyene göre öğren.',
      heroSub: 'Seviyeni seç, konunu bul ve Almanca gramerini adım adım öğren.',
      toolbarTitle: 'Gramer konunu bul',
      toolbarSub: 'Bir seviye seç veya arama kutusundan doğrudan konuya ulaş.',
      search: 'Gramer konusu ara...',
      result: 'konu',
      allResults: 'Arama tüm seviyelerde yapılıyor.',
      levelNames: {A1:'Başlangıç', A2:'Temel', B1:'Orta', B2:'Orta-İleri'},
      levelTopics: 'konu',
      sectionTitle: level => `${level} Gramer Konuları`,
      sectionSub: level => `${level} seviyesinde öğrenmen gereken temel gramer başlıkları.`,
      openTopic: 'Konuya Git',
      noResultTitle: 'Eşleşen konu bulunamadı',
      noResultSub: 'Farklı bir kelime dene veya seviyeler arasında geçiş yap.',
      breadcrumbGrammar: 'Gramer',
      comingLabel: 'Konu anlatımı',
      comingTitle: 'Bu içerik hazırlanıyor.',
      comingText: 'Bu kart ileride açıklama, kurallar, örnek cümleler ve ilgili alıştırmalara bağlantı içerecek.',
      back: 'Konulara Dön',
      exercises: 'Alıştırmalara Git'
    },
    de: {
      tag: 'Grammatik',
      heroTitle: 'Lerne deutsche Grammatik passend zu deinem Niveau.',
      heroSub: 'Wähle dein Niveau, finde ein Thema und lerne Grammatik Schritt für Schritt.',
      toolbarTitle: 'Finde dein Grammatikthema',
      toolbarSub: 'Wähle ein Niveau oder suche direkt nach einem Thema.',
      search: 'Grammatikthema suchen...',
      result: 'Themen',
      allResults: 'Die Suche läuft über alle Niveaus.',
      levelNames: {A1:'Anfang', A2:'Grundlagen', B1:'Mittelstufe', B2:'Fortgeschritten'},
      levelTopics: 'Themen',
      sectionTitle: level => `${level} Grammatik`,
      sectionSub: level => `Wichtige Grammatikthemen auf dem Niveau ${level}.`,
      openTopic: 'Thema öffnen',
      noResultTitle: 'Kein passendes Thema gefunden',
      noResultSub: 'Versuche einen anderen Suchbegriff oder wechsle das Niveau.',
      breadcrumbGrammar: 'Grammatik',
      comingLabel: 'Grammatikerklärung',
      comingTitle: 'Dieser Inhalt wird vorbereitet.',
      comingText: 'Hier findest du später Erklärung, Regeln, Beispielsätze und passende Übungen.',
      back: 'Zurück zu Themen',
      exercises: 'Zu den Übungen'
    },
    en: {
      tag: 'Grammar',
      heroTitle: 'Learn German grammar at your level.',
      heroSub: 'Choose your level, find a topic and learn German grammar step by step.',
      toolbarTitle: 'Find a grammar topic',
      toolbarSub: 'Choose a level or search directly for a topic.',
      search: 'Search grammar topics...',
      result: 'topics',
      allResults: 'Search is running across all levels.',
      levelNames: {A1:'Beginner', A2:'Elementary', B1:'Intermediate', B2:'Upper intermediate'},
      levelTopics: 'topics',
      sectionTitle: level => `${level} Grammar Topics`,
      sectionSub: level => `Key grammar topics for German level ${level}.`,
      openTopic: 'Open Topic',
      noResultTitle: 'No matching topic found',
      noResultSub: 'Try another search term or switch levels.',
      breadcrumbGrammar: 'Grammar',
      comingLabel: 'Grammar lesson',
      comingTitle: 'This lesson is being prepared.',
      comingText: 'This page will later include explanations, rules, example sentences and links to relevant exercises.',
      back: 'Back to Topics',
      exercises: 'Go to Exercises'
    }
  };

  let currentLevel = 'A1';
  let searchTerm = '';

  function lang() {
    return window.baI18n?.lang?.() || localStorage.getItem('baLang') || 'tr';
  }

  function tx(key) {
    const l = lang();
    return I18N[l]?.[key] ?? I18N.tr[key] ?? key;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    })[ch]);
  }

  function injectCss() {
    if (document.getElementById('grammarHubCss')) return;
    const link = document.createElement('link');
    link.id = 'grammarHubCss';
    link.rel = 'stylesheet';
    link.href = 'css/grammar.css?v=1';
    document.head.appendChild(link);
  }

  function localizeTopic(topic) {
    // Topic names are intentionally kept in standard German terminology.
    return { id: topic[0], title: topic[1], description: topic[2] };
  }

  function root() {
    return document.getElementById('page-grammar');
  }

  function renderShell() {
    const el = root();
    if (!el) return;

    el.classList.add('grammar-hub');
    el.innerHTML = `
      <div class="page-hero">
        <div class="page-hero-inner grammar-hero-copy">
          <span class="tag" id="grammarHeroTag">${escapeHtml(tx('tag'))}</span>
          <h1 id="grammarHeroTitle">${escapeHtml(tx('heroTitle'))}</h1>
          <p id="grammarHeroSub">${escapeHtml(tx('heroSub'))}</p>
        </div>
      </div>

      <section class="grammar-browser">
        <div class="grammar-browser-inner">
          <div class="grammar-list-view" id="grammarListView">
            <div class="grammar-toolbar">
              <div class="grammar-toolbar-copy">
                <h2 id="grammarToolbarTitle">${escapeHtml(tx('toolbarTitle'))}</h2>
                <p id="grammarToolbarSub">${escapeHtml(tx('toolbarSub'))}</p>
              </div>

              <div class="grammar-search-wrap">
                <div class="grammar-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="7"></circle>
                    <path d="m20 20-3.5-3.5"></path>
                  </svg>
                  <input id="grammarSearchInput" type="search" autocomplete="off" placeholder="${escapeHtml(tx('search'))}" aria-label="${escapeHtml(tx('search'))}">
                  <button class="grammar-search-clear" id="grammarSearchClear" type="button" aria-label="Clear">×</button>
                </div>
              </div>
            </div>

            <div class="grammar-level-tabs" id="grammarLevelTabs"></div>
            <div class="grammar-search-note" id="grammarSearchNote">${escapeHtml(tx('allResults'))}</div>

            <div class="grammar-section-heading">
              <div>
                <h3 id="grammarSectionTitle"></h3>
                <p id="grammarSectionSub"></p>
              </div>
              <div class="grammar-result-count" id="grammarResultCount"></div>
            </div>

            <div class="grammar-topic-grid" id="grammarTopicGrid"></div>
          </div>

          <div class="grammar-detail" id="grammarDetailView"></div>
        </div>
      </section>
    `;

    bindShell();
    renderLevels();
    renderTopics();
  }

  function bindShell() {
    const input = document.getElementById('grammarSearchInput');
    const clear = document.getElementById('grammarSearchClear');

    input?.addEventListener('input', e => {
      searchTerm = e.target.value.trim();
      clear?.classList.toggle('visible', Boolean(searchTerm));
      document.getElementById('grammarSearchNote')?.classList.toggle('visible', Boolean(searchTerm));
      renderTopics();
    });

    clear?.addEventListener('click', () => {
      searchTerm = '';
      if (input) {
        input.value = '';
        input.focus();
      }
      clear.classList.remove('visible');
      document.getElementById('grammarSearchNote')?.classList.remove('visible');
      renderTopics();
    });
  }

  function renderLevels() {
    const el = document.getElementById('grammarLevelTabs');
    if (!el) return;
    const names = tx('levelNames');

    el.innerHTML = Object.keys(TOPICS).map(level => `
      <button class="grammar-level-tab ${level === currentLevel ? 'active' : ''}" type="button" data-grammar-level="${level}">
        <span class="grammar-level-code">${level}</span>
        <span class="grammar-level-name">${escapeHtml(names[level])}</span>
        <span class="grammar-level-count">${TOPICS[level].length} ${escapeHtml(tx('levelTopics'))}</span>
      </button>
    `).join('');

    el.querySelectorAll('[data-grammar-level]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentLevel = btn.dataset.grammarLevel;
        searchTerm = '';
        const input = document.getElementById('grammarSearchInput');
        if (input) input.value = '';
        document.getElementById('grammarSearchClear')?.classList.remove('visible');
        document.getElementById('grammarSearchNote')?.classList.remove('visible');
        renderLevels();
        renderTopics();
      });
    });
  }

  function matchedTopics() {
    const query = searchTerm.toLocaleLowerCase('de-DE');

    if (!query) {
      return TOPICS[currentLevel].map(topic => ({
        ...localizeTopic(topic),
        level: currentLevel
      }));
    }

    const rows = [];
    Object.entries(TOPICS).forEach(([level, topics]) => {
      topics.forEach(topic => {
        const item = localizeTopic(topic);
        const haystack = `${item.title} ${item.description} ${level}`.toLocaleLowerCase('de-DE');
        if (haystack.includes(query)) rows.push({...item, level});
      });
    });
    return rows;
  }

  function renderTopics() {
    const grid = document.getElementById('grammarTopicGrid');
    if (!grid) return;

    const rows = matchedTopics();
    const sectionTitle = document.getElementById('grammarSectionTitle');
    const sectionSub = document.getElementById('grammarSectionSub');
    const count = document.getElementById('grammarResultCount');

    if (searchTerm) {
      if (sectionTitle) sectionTitle.textContent = tx('toolbarTitle');
      if (sectionSub) sectionSub.textContent = tx('allResults');
    } else {
      if (sectionTitle) sectionTitle.textContent = tx('sectionTitle')(currentLevel);
      if (sectionSub) sectionSub.textContent = tx('sectionSub')(currentLevel);
    }
    if (count) count.textContent = `${rows.length} ${tx('result')}`;

    if (!rows.length) {
      grid.innerHTML = `
        <div class="grammar-empty">
          <strong>${escapeHtml(tx('noResultTitle'))}</strong>
          <p>${escapeHtml(tx('noResultSub'))}</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = rows.map(item => `
      <button class="grammar-topic-card" type="button"
        data-topic-id="${escapeHtml(item.id)}"
        data-topic-level="${escapeHtml(item.level)}">
        <div class="grammar-card-top">
          <span class="grammar-topic-level">${escapeHtml(item.level)}</span>
          <span class="grammar-topic-arrow">→</span>
        </div>
        <h4>${escapeHtml(item.title)}</h4>
        <p>${escapeHtml(item.description)}</p>
        <div class="grammar-topic-footer">${escapeHtml(tx('openTopic'))} →</div>
      </button>
    `).join('');

    grid.querySelectorAll('.grammar-topic-card').forEach(card => {
      card.addEventListener('click', () => openTopic(card.dataset.topicLevel, card.dataset.topicId));
    });
  }

  function findTopic(level, id) {
    const row = TOPICS[level]?.find(topic => topic[0] === id);
    return row ? localizeTopic(row) : null;
  }

  function openTopic(level, id) {
    const topic = findTopic(level, id);
    if (!topic) return;

    const list = document.getElementById('grammarListView');
    const detail = document.getElementById('grammarDetailView');
    if (!list || !detail) return;

    detail.innerHTML = `
      <article class="grammar-detail-card">
        <div class="grammar-detail-breadcrumb">
          <button type="button" id="grammarBreadcrumbBack">${escapeHtml(tx('breadcrumbGrammar'))}</button>
          <span>›</span>
          <span>${escapeHtml(level)}</span>
          <span>›</span>
          <span>${escapeHtml(topic.title)}</span>
        </div>

        <span class="grammar-topic-level">${escapeHtml(level)}</span>
        <h2 class="grammar-detail-title">${escapeHtml(topic.title)}</h2>
        <p class="grammar-detail-intro">${escapeHtml(topic.description)}</p>

        <div class="grammar-coming-soon">
          <small>${escapeHtml(tx('comingLabel'))}</small>
          <h4>${escapeHtml(tx('comingTitle'))}</h4>
          <p>${escapeHtml(tx('comingText'))}</p>
        </div>

        <div class="grammar-detail-actions">
          <button class="grammar-back-btn" type="button" id="grammarBackBtn">← ${escapeHtml(tx('back'))}</button>
          <button class="grammar-exercises-btn" type="button" id="grammarExercisesBtn">${escapeHtml(tx('exercises'))} →</button>
        </div>
      </article>
    `;

    list.classList.add('hidden');
    detail.classList.add('active');

    const close = () => {
      detail.classList.remove('active');
      list.classList.remove('hidden');
      window.scrollTo({top: root()?.offsetTop || 0, behavior: 'smooth'});
    };

    detail.querySelector('#grammarBackBtn')?.addEventListener('click', close);
    detail.querySelector('#grammarBreadcrumbBack')?.addEventListener('click', close);
    detail.querySelector('#grammarExercisesBtn')?.addEventListener('click', () => {
      if (window.baShowPage) window.baShowPage('exercises');
      else document.querySelector('[data-page="exercises"]')?.click();
    });

    window.scrollTo({top: root()?.offsetTop || 0, behavior: 'smooth'});
  }

  function rerenderLanguage() {
    const listHidden = document.getElementById('grammarListView')?.classList.contains('hidden');
    if (listHidden) {
      // Detail text will be refreshed by returning to list. Keep interaction predictable.
      document.getElementById('grammarDetailView')?.classList.remove('active');
      document.getElementById('grammarListView')?.classList.remove('hidden');
    }
    renderShell();
  }

  function init() {
    injectCss();
    if (!root()) return;
    renderShell();
  }

  window.addEventListener('ba:languagechange', rerenderLanguage);
  document.addEventListener('DOMContentLoaded', init);
})();
