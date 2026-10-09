(() => {
  'use strict';

  const TOPICS = {
    A1: [
  [
    "artikel",
    "Artikel – der, die, das",
    {
      "tr": "İsimleri artikel ve çoğullarıyla öğren.",
      "de": "Artikel: der · die · das – Grundlagen und Beispiele auf Türkisch.",
      "en": "Articles: der · die · das – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "plural",
    "Plural – isimlerin çoğulu",
    {
      "tr": "Çoğul belirli artikel die olur.",
      "de": "Plural – Grundlagen und Beispiele auf Türkisch.",
      "en": "Plural – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "personalpronomen-akkusativ",
    "Personalpronomen im Akkusativ",
    {
      "tr": "Zamir, tekrar edilen ismin yerini alır.",
      "de": "Personalpronomen im Akkusativ – Grundlagen und Beispiele auf Türkisch.",
      "en": "Personal pronouns: accusative – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "personalpronomen-dativ",
    "Personalpronomen im Dativ",
    {
      "tr": "Dativ zamirlerini fiil veya edatla birlikte öğren.",
      "de": "Personalpronomen im Dativ – Grundlagen und Beispiele auf Türkisch.",
      "en": "Personal pronouns: dative – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "sein-haben",
    "sein & haben – olmak ve sahip olmak",
    {
      "tr": "sein: kimlik, durum, yaş ve yer.",
      "de": "sein & haben – Grundlagen und Beispiele auf Türkisch.",
      "en": "sein & haben – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "praesens",
    "Präsens – şimdiki ve geniş zaman",
    {
      "tr": "Düzenli fiilde kök + kişi eki kullanılır.",
      "de": "Präsens – Grundlagen und Beispiele auf Türkisch.",
      "en": "Present tense – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "negation",
    "Negation – nicht ve kein",
    {
      "tr": "Belirsiz veya artikelsiz isimleri çoğunlukla kein ile olumsuzla.",
      "de": "Negation – Grundlagen und Beispiele auf Türkisch.",
      "en": "Negation – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "w-fragen",
    "W-Fragen – soru cümleleri",
    {
      "tr": "Önce aradığın bilgiye uygun soru kelimesini seç.",
      "de": "W-Fragen – Grundlagen und Beispiele auf Türkisch.",
      "en": "W-questions – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "zahlen-uhrzeit-datum",
    "Sayılar, saatler ve tarihler",
    {
      "tr": "21–99: birler + und + onluklar.",
      "de": "Zahlen · Uhrzeit · Datum – Grundlagen und Beispiele auf Türkisch.",
      "en": "Numbers · Time · Dates – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "temporale-praepositionen",
    "Temporale Präpositionen – zaman edatları",
    {
      "tr": "am: gün/tarih; im: ay/mevsim; um: saat.",
      "de": "Temporale Präpositionen – Grundlagen und Beispiele auf Türkisch.",
      "en": "Temporal prepositions – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "akkusativ",
    "Akkusativ – doğrudan nesne",
    {
      "tr": "Akkusativ nesneyi fiille birlikte belirle.",
      "de": "Akkusativ – Grundlagen und Beispiele auf Türkisch.",
      "en": "Accusative – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "modalverben",
    "Modalverben – yapabilmek, zorunda olmak, istemek",
    {
      "tr": "Modal çekimli, ana fiil mastar olarak sonda.",
      "de": "Modalverben – Grundlagen und Beispiele auf Türkisch.",
      "en": "Modal verbs – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "trennbare-verben",
    "Trennbare Verben – ayrılabilen fiiller",
    {
      "tr": "Çekimli ana cümlede ön ek sona gider.",
      "de": "Trennbare Verben – Grundlagen und Beispiele auf Türkisch.",
      "en": "Separable verbs – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "imperativ",
    "Imperativ – rica ve yönerge cümleleri",
    {
      "tr": "Önce du/ihr/Sie hitabını belirle.",
      "de": "Imperativ – Grundlagen und Beispiele auf Türkisch.",
      "en": "Imperative – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "possessivartikel",
    "Possessivartikel – mein, dein, sein, ihr",
    {
      "tr": "Sahip kökü, sahip olunan isim eki belirler.",
      "de": "Possessivartikel – Grundlagen und Beispiele auf Türkisch.",
      "en": "Possessive articles – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "perfekt",
    "Perfekt – geçmişte olanları anlatma",
    {
      "tr": "haben/sein çekilir; Partizip II sona gelir.",
      "de": "Einführung ins Perfekt – Grundlagen und Beispiele auf Türkisch.",
      "en": "Introduction to Perfekt – fundamentals and examples explained in Turkish."
    }
  ],
  [
    "lokale-praepositionen",
    "Lokale Präpositionen – yer ve yön edatları",
    {
      "tr": "Önce Wo/Wohin/Woher ayrımını yap.",
      "de": "Lokale Präpositionen – Grundlagen und Beispiele auf Türkisch.",
      "en": "Local prepositions – fundamentals and examples explained in Turkish."
    }
  ]
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
      heroTitle: 'Almanca gramer konuları',
      heroSub: 'A1–B2 seviyelerine göre gramer başlıkları ve ilgili alıştırmalara erişim.',
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
      comingTitle: 'Konu anlatımı hazırlanıyor',
      comingText: 'Bu konu için ayrıntılı anlatım henüz yayımlanmadı. Çalışmalarına alıştırmalar bölümünden devam edebilirsin.',
      back: 'Konulara Dön',
      exercises: 'Alıştırmalara Git'
    },
    de: {
      tag: 'Grammatik',
      heroTitle: 'Deutsche Grammatik nach Niveau',
      heroSub: 'Grammatikthemen von A1 bis B2 und Zugang zu passenden Übungen.',
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
      comingTitle: 'Grammatikerklärung in Vorbereitung',
      comingText: 'Eine ausführliche Erklärung ist noch nicht veröffentlicht. Du kannst im Übungsbereich weiterarbeiten.',
      back: 'Zurück zu Themen',
      exercises: 'Zu den Übungen'
    },
    en: {
      tag: 'Grammar',
      heroTitle: 'German grammar by level',
      heroSub: 'Grammar topics from A1 to B2 and access to related exercises.',
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
      comingTitle: 'Grammar explanation in preparation',
      comingText: 'A detailed explanation has not yet been published. You can continue in the exercises section.',
      back: 'Back to Topics',
      exercises: 'Go to Exercises'
    }
  };

  const initialGrammarHash = location.hash;
  let activeTopic = null;
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
    link.href = 'css/grammar.css?v=2';
    document.head.appendChild(link);
  }

  const topicDescriptions = {
  "artikel": [
    "İsimlerin artikelleri ve temel kullanım kuralları",
    "Artikel der Nomen und grundlegende Verwendung",
    "Noun articles and their basic use"
  ],
  "personalpronomen": [
    "Kişi zamirleri ve cümlede özne kullanımı",
    "Personalpronomen und Subjekte im Satz",
    "Personal pronouns and sentence subjects"
  ],
  "sein-haben": [
    "sein ve haben fiillerinin Präsens çekimi",
    "Präsensformen von sein und haben",
    "Present-tense forms of sein and haben"
  ],
  "praesens": [
    "Düzenli ve temel düzensiz fiillerin Präsens çekimi",
    "Präsensformen regelmäßiger und wichtiger unregelmäßiger Verben",
    "Present-tense forms of regular and common irregular verbs"
  ],
  "w-fragen": [
    "Soru sözcükleri ve soru cümlesinin yapısı",
    "Fragewörter und Aufbau von W-Fragen",
    "Question words and wh-question structure"
  ],
  "akkusativ": [
    "Doğrudan nesne ve Akkusativ artikel biçimleri",
    "Direktes Objekt und Artikelformen im Akkusativ",
    "Direct objects and accusative article forms"
  ],
  "modalverben": [
    "Temel modal fiiller ve cümlede kullanımı",
    "Grundlegende Modalverben und ihre Satzstellung",
    "Basic modal verbs and word order"
  ],
  "trennbare-verben": [
    "Ayrılabilen fiillerin çekimi ve ön ekin yeri",
    "Trennbare Verben und Stellung der Vorsilbe",
    "Separable verbs and prefix placement"
  ],
  "possessivartikel": [
    "Sahiplik bildiren artikel biçimleri",
    "Possessivartikel und ihre Formen",
    "Possessive articles and their forms"
  ],
  "perfekt": [
    "haben/sein ve Partizip II ile geçmiş zaman",
    "Vergangenheit mit haben/sein und Partizip II",
    "Past tense with haben/sein and the past participle"
  ],
  "dativ": [
    "Dolaylı nesne ve Dativ artikel biçimleri",
    "Indirektes Objekt und Artikelformen im Dativ",
    "Indirect objects and dative article forms"
  ],
  "wechselpraepositionen": [
    "Wo ve Wohin ayrımına göre edat kullanımı",
    "Wechselpräpositionen mit Wo und Wohin",
    "Two-way prepositions with location and direction"
  ],
  "reflexive-verben": [
    "Dönüşlü fiiller ve dönüşlülük zamirleri",
    "Reflexive Verben und Reflexivpronomen",
    "Reflexive verbs and pronouns"
  ],
  "konjunktiv-ii-basic": [
    "İstek, öneri ve kibar ifadeler için temel yapılar",
    "Grundformen für Wünsche, Vorschläge und höfliche Aussagen",
    "Basic forms for wishes, suggestions and polite expressions"
  ],
  "dass-saetze": [
    "dass ile yan cümleler ve fiilin konumu",
    "Nebensätze mit dass und Verbstellung",
    "dass clauses and verb position"
  ],
  "weil-wenn-obwohl": [
    "Sebep, koşul ve karşıtlık bildiren yan cümleler",
    "Nebensätze für Grund, Bedingung und Gegensatz",
    "Clauses expressing reason, condition and contrast"
  ],
  "komparativ-superlativ": [
    "Sıfatların karşılaştırma biçimleri",
    "Steigerungsformen der Adjektive",
    "Comparative and superlative adjective forms"
  ],
  "praepositionen-a2": [
    "Sık kullanılan Akkusativ ve Dativ edatları",
    "Häufige Präpositionen mit Akkusativ und Dativ",
    "Common accusative and dative prepositions"
  ],
  "adjektivdeklination-a2": [
    "Sıfat çekimine giriş ve temel ekler",
    "Einstieg in die Adjektivdeklination",
    "Introduction to adjective endings"
  ],
  "relativsaetze": [
    "İsimleri açıklayan yan cümleler ve ilgi zamirleri",
    "Relativsätze und Relativpronomen",
    "Relative clauses and pronouns"
  ],
  "passiv": [
    "werden ve Partizip II ile edilgen yapı",
    "Passiv mit werden und Partizip II",
    "Passive voice with werden and the past participle"
  ],
  "infinitiv-mit-zu": [
    "zu ile mastar yapıları ve cümle bağlantıları",
    "Infinitivgruppen mit zu",
    "Infinitive constructions with zu"
  ],
  "verben-mit-praepositionen": [
    "Sabit fiil-edat birleşimleri",
    "Feste Verb-Präposition-Verbindungen",
    "Fixed verb-preposition combinations"
  ],
  "praeteritum": [
    "sein, haben ve modal fiillerde geçmiş zaman",
    "Präteritum von sein, haben und Modalverben",
    "Simple past of sein, haben and modal verbs"
  ],
  "temporalsaetze": [
    "Zaman bildiren yan cümleler",
    "Temporale Nebensätze",
    "Time clauses"
  ],
  "zweiteilige-konnektoren": [
    "İkili bağlaçlar ve cümle bağlantıları",
    "Zweiteilige Konnektoren und Satzverbindungen",
    "Paired connectors and clause combinations"
  ],
  "konjunktiv-ii-b1": [
    "Varsayım, tavsiye ve kibar ifade yapıları",
    "Hypothesen, Ratschläge und höfliche Aussagen",
    "Hypotheses, advice and polite expressions"
  ],
  "konjunktiv-i": [
    "Dolaylı anlatımda Konjunktiv I kullanımı",
    "Konjunktiv I in der indirekten Rede",
    "Konjunktiv I in reported speech"
  ],
  "nominalisierung": [
    "Fiil ve sıfatların isimleşmesi",
    "Nominalisierung von Verben und Adjektiven",
    "Nominalisation of verbs and adjectives"
  ],
  "passiv-modalverben": [
    "Modal fiillerle edilgen yapılar",
    "Passiv mit Modalverben",
    "Passive constructions with modal verbs"
  ],
  "partizipialkonstruktionen": [
    "Partizip I ve II ile sıfat ve cümle yapıları",
    "Konstruktionen mit Partizip I und II",
    "Constructions with present and past participles"
  ],
  "n-deklination": [
    "Özel çekime sahip maskulin isimler",
    "Maskuline Nomen mit N-Deklination",
    "Masculine nouns with weak declension"
  ],
  "komplexe-nebensaetze": [
    "İleri düzey yan cümle yapıları",
    "Komplexe Nebensatzstrukturen",
    "Complex subordinate clause structures"
  ],
  "konnektoren-b2": [
    "İleri düzey bağlayıcılar ve anlam ilişkileri",
    "Konnektoren und Bedeutungsbeziehungen auf B2",
    "Advanced connectors and meaning relationships"
  ],
  "indirekte-rede": [
    "Konjunktiv I ve II ile dolaylı anlatım",
    "Indirekte Rede mit Konjunktiv I und II",
    "Reported speech with Konjunktiv I and II"
  ]
};
  function localizeTopic(topic) {
    // Topic names are intentionally kept in standard German terminology.
    const index = {tr:0, de:1, en:2}[lang()] ?? 0;
    return { id: topic[0], title: topic[1], description: typeof topic[2] === 'object' ? (topic[2][lang()] || topic[2].tr) : (topicDescriptions[topic[0]]?.[index] || topic[2]) };
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

  async function openTopic(level, id, options = {}) {
    const topic = findTopic(level, id);
    if (!topic) return;

    const list = document.getElementById('grammarListView');
    const detail = document.getElementById('grammarDetailView');
    if (!list || !detail) return;

    if (authored[level]?.has(id) && window.BAA1Lessons) {
      activeTopic = {level,id};
      currentLevel = level;
      detail.dataset.lesson = level+'/'+id;
      detail.innerHTML = '<p role="status">Konu anlatımı yükleniyor…</p>';
      list.classList.add('hidden');
      detail.classList.add('active');
      if (!options.restore) history.pushState({baPage:'grammar',grammarLevel:level,grammarTopic:id},'', '#grammar/'+level+'/'+encodeURIComponent(id));
      try {
        await window.BAA1Lessons.render(detail,id,key=>openTopic(level,key),level);
        if (activeTopic?.id !== id || activeTopic?.level !== level) return;
        detail.querySelectorAll('[data-a1-back]').forEach(button=>button.addEventListener('click',()=>closeA1()));
        detail.querySelector('.a1-article-header h2')?.focus({preventScroll:true});
      } catch (_) {
        if (activeTopic?.id !== id || activeTopic?.level !== level) return;
        detail.innerHTML='<p role="alert">Konu anlatımı yüklenemedi. Lütfen tekrar dene.</p><button type="button" class="btn primary" id="a1Retry">Tekrar dene</button><button type="button" class="btn ghost" id="a1Return">'+escapeHtml(level)+' konularına dön</button>';
        detail.querySelector('#a1Retry').addEventListener('click',()=>openTopic(level,id,{restore:true}));
        detail.querySelector('#a1Return').addEventListener('click',()=>closeA1());
      }
      if (!options.keepScroll) window.scrollTo({top: detail.getBoundingClientRect().top+window.scrollY-140,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      return;
    }
    activeTopic = null;

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

  function closeA1(writeHistory=true) {
    currentLevel=activeTopic?.level || currentLevel;
    activeTopic=null;
    const detail=document.getElementById('grammarDetailView');
    if(detail) {detail.dataset.lesson='';detail.classList.remove('active');}
    document.getElementById('grammarListView')?.classList.remove('hidden');
    renderLevels();renderTopics();
    if(writeHistory) history.pushState({baPage:'grammar'},'','#grammar');
    window.scrollTo({top:root()?.offsetTop || 0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  function rerenderLanguage() {
    const previous=activeTopic;
    const position=window.scrollY;
    renderShell();
    if(previous) openTopic(previous.level,previous.id,{restore:true,keepScroll:true}).then(()=>window.scrollTo({top:position,behavior:'instant'}));
  }
  const authored={};
  let ready=false;
  function restoreRoute(hash=location.hash) {
    if(!ready)return;
    const match=String(hash).match(/^#grammar\/(A1|A2|B1|B2)(?:\/([^/]+))?$/);
    if(match){
      currentLevel=match[1];
      if(!match[2]){if(activeTopic)closeA1(false);renderLevels();renderTopics();return;}
      let id;try{id=decodeURIComponent(match[2]);}catch(_){return;}
      if(findTopic(currentLevel,id) && (activeTopic?.id!==id || activeTopic?.level!==currentLevel))openTopic(currentLevel,id,{restore:true});
      return;
    }
    if(hash==='#grammar' && activeTopic)closeA1(false);
  }
  async function init() {
    injectCss();if(!root())return;
    renderShell();
    try {
      const response=await fetch('data/catalog.json?v=5');if(!response.ok)throw Error('Catalog');
      const catalog=await response.json();
      const registryResponse=await fetch('data/grammar-index.json?v=2');if(!registryResponse.ok)throw Error('Grammar index');
      const registry=await registryResponse.json();
      const datasets=await Promise.all(Object.keys(registry.levels).map(async level=>[level,await window.BAA1Lessons.load(level)]));
      for(const [level,data] of datasets)authored[level]=new Set(data.lessons.map(l=>l.id));
      for(const level of catalog.levels){
        const lessons=datasets.find(([key])=>key===level.id)?.[1].lessons || [];
        TOPICS[level.id]=level.topics.map(t=>{const lesson=lessons.find(l=>l.id===t.id);return [t.id,lesson?.title || t.title.tr,lesson?.description || t.description];});
      }
    }catch(error){console.warn('Gramer kataloğu yüklenemedi',error);}
    ready=true;renderLevels();renderTopics();
    if(initialGrammarHash.startsWith('#grammar/')){history.replaceState({baPage:'grammar'},'',initialGrammarHash);restoreRoute(initialGrammarHash);}else restoreRoute();
  }
  window.addEventListener('ba:languagechange', rerenderLanguage);
  window.addEventListener('popstate',()=>{if(location.hash.startsWith('#grammar'))restoreRoute();});
  window.addEventListener('ba:pagechange',e=>{if(e.detail?.page==='grammar')restoreRoute();});
  window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#grammar')){window.BA?.showPage('grammar',{historyMode:'none',scroll:false});restoreRoute();}});
  document.addEventListener('DOMContentLoaded', init);
})();
