// Statik sayfaların listesi: adres, başlık, açıklama, sayfa yolu (breadcrumb) ve sayfaya özel şema.
// Başlığı veya açıklamayı değiştirdikten sonra: node scripts/build-pages.mjs
// İçerik metinleri sayfaların kendi dosyalarında (ör. online-almanca-dersi/index.html) durur.
//
// Kurallar: fiyat, telefon, adres yok; şemalarda offers/price/priceRange/telephone yok.
// Şemalara yalnızca sayfada görünür biçimde yazan bilgiler girer.

export const SITE = 'https://bozkurtacademy.com';

const provider = { '@id': `${SITE}/#organization` };
const instructor = { '@id': `${SITE}/#person` };

// lang: sayfanın (ve dersin anlatım) dili; Almanca/İngilizce sürümlerde 'de' / 'en'.
function course(path, name, description, level, { lang = 'tr' } = {}) {
  return {
    '@type': 'Course',
    '@id': `${SITE}${path}#course`,
    name,
    description,
    url: `${SITE}${path}`,
    inLanguage: lang,
    educationalLevel: level,
    provider,
    about: { '@type': 'Thing', name: { tr: 'Almanca', de: 'Deutsch', en: 'German' }[lang] },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor
    }
  };
}

// contact: iletişim sayfası (Almanca/İngilizce sürümlerde o dilin sayfası). inLanguage: sayfanın dili.
function service(path, name, description, serviceType, { contact = '/iletisim/', lang } = {}) {
  return {
    '@type': 'Service',
    '@id': `${SITE}${path}#service`,
    name,
    description,
    serviceType,
    url: `${SITE}${path}`,
    ...(lang ? { inLanguage: lang } : {}),
    provider,
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: `${SITE}${contact}` }
  };
}

// Dil sürümleri: aynı "group" adını taşıyan sayfalar birbirinin çevirisidir (tr, de, en hepsi olmalı).
// lang: sayfanın dili (yoksa tr). Almanca/İngilizce sayfalar /de/… ve /en/… altında, adresleri o dilde.
export const PAGES = [
  {
    path: '/online-almanca-dersi/',
    group: 'lessons',
    nav: 'lessons',
    crumb: 'Online Almanca Dersi',
    title: 'Online Almanca Dersi A1–B2 | Bozkurt Academy',
    description: 'Online Almanca dersi: Almanya’da yaşayan eğitmenle A1’den B2’ye birebir veya grup dersleri, 50 dakikalık oturumlar ve ücretsiz ilk ders.',
    schema: [service('/online-almanca-dersi/', 'Online Almanca Dersi', 'A1–B2 seviyelerinde Zoom veya Google Meet üzerinden online Almanca dersleri.', 'Online Almanca dersi')]
  },
  {
    path: '/almanca-ozel-ders/',
    group: 'private',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Almanca Özel Ders',
    title: 'Almanca Özel Ders (Birebir, Online) | Bozkurt Academy',
    description: 'Birebir Almanca özel ders: seviyene, hedefine ve zamanına göre planlanan online dersler. A1–B2, sınav hazırlığı ve konuşma pratiği. İlk ders ücretsiz.',
    schema: [service('/almanca-ozel-ders/', 'Almanca Özel Ders (Birebir)', 'Seviye ve hedefe göre planlanan birebir online Almanca dersleri.', 'Birebir Almanca özel ders')]
  },
  {
    path: '/almanca-grup-dersi/',
    group: 'group',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Almanca Grup Dersi',
    title: 'Almanca Grup Dersi: Online, En Fazla 6 Kişi | Bozkurt Academy',
    description: 'Online Almanca grup dersi: en fazla 6 kişilik gruplarda aynı seviyedeki öğrencilerle konuşma pratiği ve düzenli program. A1–B2 grupları hakkında bilgi al.',
    schema: [service('/almanca-grup-dersi/', 'Almanca Grup Dersi (Online)', 'Aynı seviyedeki en fazla 6 öğrenciden oluşan online Almanca grup dersleri.', 'Online Almanca grup dersi')]
  },
  {
    path: '/a1-almanca-kursu/',
    group: 'a1',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'A1 Almanca Kursu',
    title: 'A1 Almanca Kursu: Vize ve Aile Birleşimi | Bozkurt Academy',
    description: 'A1 Almanca kursu: sıfırdan başlayanlar ve aile birleşimi veya vize başvurusu öncesi A1 sınavına hazırlık. Online birebir veya grup dersleri, ücretsiz ilk ders.',
    schema: [course('/a1-almanca-kursu/', 'A1 Almanca Kursu', 'Sıfırdan başlayanlar için A1 Almanca: temel dil bilgisi, günlük iletişim ve A1 sınavına (Goethe, telc, ÖSD) hazırlık.', 'A1 (Başlangıç)')]
  },
  {
    path: '/a2-almanca-kursu/',
    group: 'a2',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'A2 Almanca Kursu',
    title: 'A2 Almanca Kursu (Online) | Bozkurt Academy',
    description: 'A2 Almanca kursu: geçmiş zaman, yan cümleler ve günlük yaşam iletişimi. A1’i bitirenler için online birebir veya grup dersleri ve A2 sınav hazırlığı.',
    schema: [course('/a2-almanca-kursu/', 'A2 Almanca Kursu', 'A1’i tamamlayanlar için A2 Almanca: Perfekt, Dativ, yan cümleler, günlük yaşam iletişimi ve A2 sınavına hazırlık.', 'A2 (Temel)')]
  },
  {
    path: '/b1-almanca-kursu/',
    group: 'b1',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'B1 Almanca Kursu',
    title: 'B1 Almanca Kursu ve Sınav Hazırlığı | Bozkurt Academy',
    description: 'B1 Almanca kursu: Almanya’da iş, Ausbildung ve günlük yaşam için B1 seviyesi. Online birebir veya grup dersleri, Goethe, telc ve DTZ B1 hazırlığı.',
    schema: [course('/b1-almanca-kursu/', 'B1 Almanca Kursu', 'Bağımsız kullanıcı seviyesi B1: yan cümleler, Passiv, Konjunktiv II girişi, iş ve günlük yaşam iletişimi, B1 sınav hazırlığı.', 'B1 (Orta)')]
  },
  {
    path: '/b2-almanca-kursu/',
    group: 'b2',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'B2 Almanca Kursu',
    title: 'B2 Almanca Kursu: İş, Üniversite, Meslek | Bozkurt Academy',
    description: 'B2 Almanca kursu: iş hayatı, üniversite ve meslek için akıcı Almanca. Tartışma, resmi yazışma, karmaşık dil bilgisi ve B2 sınav hazırlığı, online.',
    schema: [course('/b2-almanca-kursu/', 'B2 Almanca Kursu', 'B2 seviyesi: karmaşık cümle yapıları, Passiv ve Konjunktiv, iş ve akademik iletişim, Goethe ve telc B2 hazırlığı.', 'B2 (Orta üstü)')]
  },
  {
    path: '/almanca-sinav-hazirlik/',
    group: 'exams',
    nav: 'exams',
    crumb: 'Almanca Sınav Hazırlık',
    title: 'Goethe ve telc Almanca Sınav Hazırlık | Bozkurt Academy',
    description: 'Goethe, telc, ÖSD, DTZ ve TestDaF sınav hazırlık: görev türleri, okuma, dinleme, yazma ve konuşma çalışması. Online birebir ders ve ücretsiz deneme setleri.',
    schema: [service('/almanca-sinav-hazirlik/', 'Almanca Sınav Hazırlık', 'Goethe, telc, ÖSD, DTZ ve TestDaF sınavlarına yönelik online hazırlık dersleri.', 'Almanca sınav hazırlık')]
  },
  {
    path: '/hakkimda/',
    group: 'about',
    updated: '2026-11-10',
    nav: 'about',
    crumb: 'Hakkımda',
    title: 'Hakkımda: Almanca Eğitmeni Ömer Faruk Bozkurt',
    description: 'Almanya’da yaşayan Almanca eğitmeni Ömer Faruk Bozkurt: eğitim geçmişi, Almanya deneyimi ve derslerde açıklama, uygulama ve tekrar yöntemi.',
    type: 'ProfilePage',
    ogType: 'profile'
  },
  {
    path: '/iletisim/',
    group: 'contact',
    nav: 'contact',
    crumb: 'İletişim',
    title: 'İletişim: Ücretsiz İlk Almanca Dersi | Bozkurt Academy',
    description: 'Bozkurt Academy iletişim: online Almanca dersleri ve ücretsiz ilk ders için formu doldur. Seviyeni, hedefini ve uygun zamanlarını yaz.',
    type: 'ContactPage',
    noStickyCta: true
  },
  {
    path: '/almanca-alfabe/',
    crumb: 'Almanca Alfabe Oyunu',
    title: 'Almanca Alfabe Oyunu: Harfler ve Okunuşları | Bozkurt Academy',
    description: 'Almanca alfabeyi oyunla öğren: 26 harf ile Ä, Ö, Ü ve ß, Almanca harf adları, Türkçe okunuşlar ve heceleme. Çocuklar ve yetişkinler için ücretsiz, hesap gerekmez.',
    // Sayfaya özel dosyalar (scripts/build-pages.mjs head ve betik bölümüne yazar). Değiştirince ?v= artır.
    css: ['/css/alfabe.css?v=2'],
    js: ['/js/html.js?v=1', '/js/alfabe-logic.js?v=3', '/js/alfabe-audio.js?v=1', '/js/alfabe.js?v=3'],
    schema: [{
      '@type': 'LearningResource',
      '@id': `${SITE}/almanca-alfabe/#game`,
      name: 'Almanca Alfabe Oyunu',
      description: 'Türkçe konuşanlar için Almanca alfabe oyunu: harf adları, okunuşlar, ilk harf, heceleme ve alfabe sırası.',
      url: `${SITE}/almanca-alfabe/`,
      inLanguage: 'tr',
      learningResourceType: 'Oyun',
      educationalLevel: 'A1 (Başlangıç)',
      isAccessibleForFree: true,
      about: { '@type': 'Thing', name: 'Almanca alfabe' },
      provider
    }]
  },
  {
    path: '/sss/',
    crumb: 'Sıkça Sorulan Sorular',
    title: 'Almanca Dersi Sıkça Sorulan Sorular | Bozkurt Academy',
    description: 'Online Almanca dersleri hakkında sık sorulanlar: ilk ders, ders süresi, birebir ve grup dersi, ücretin nasıl belirlendiği, sınavlar ve seviye testi.',
  },
  {
    // Yasal künye (Almanca metin geçerli, Türkçe çeviri). Arama motorlarında listelenmez, sitemap'e girmez.
    path: '/impressum/',
    crumb: 'Künye (Impressum)',
    title: 'Impressum | Bozkurt Academy',
    description: 'Impressum der Bozkurt Academy: Anbieterkennzeichnung nach § 5 DDG, Kontakt und verantwortliche Person. Bozkurt Academy künyesi.',
    noindex: true,
    // Köşeli parantezli yer tutucu kalmışsa build-pages --check hata verir (yarım künye yayına çıkmasın).
    noPlaceholders: true,
    // İki dilli sayfa (Almanca + Türkçe): sabit dil işareti yok, dil kontrolü uygulanmaz.
    mixedLang: true
  },
  // ---- Almanca sürümler (hedef kitle: Almanya'da büyüyen Türk kökenli öğrenciler ve veliler, Almanya'ya sonradan gelenler; "Sie") ----
  {
    path: '/de/ueber-mich/',
    lang: 'de',
    group: 'about',
    updated: '2026-11-16',
    nav: 'about',
    crumb: 'Über mich',
    title: 'Über mich: Deutschlehrer Ömer Faruk Bozkurt | Bozkurt Academy',
    description: 'Ömer Faruk Bozkurt unterrichtet online Deutsch auf Türkisch und Deutsch: Schulunterstützung, Prüfungsvorbereitung und Deutsch für den Alltag in Deutschland.',
    type: 'ProfilePage',
    ogType: 'profile'
  },
  {
    path: '/de/kontakt/',
    lang: 'de',
    group: 'contact',
    nav: 'contact',
    crumb: 'Kontakt',
    title: 'Kontakt und kostenlose Probestunde | Bozkurt Academy',
    description: 'Schreiben Sie mir für Online-Deutschunterricht auf Türkisch und Deutsch, Schulunterstützung oder Prüfungsvorbereitung. Die erste Stunde ist kostenlos.',
    type: 'ContactPage',
    noStickyCta: true
  },

  // ---- İngilizce sürümler (İngilizce konuşan öğrenciler) ----
  {
    path: '/en/about/',
    lang: 'en',
    group: 'about',
    updated: '2026-11-16',
    nav: 'about',
    crumb: 'About me',
    title: 'About Me: German Teacher Ömer Faruk Bozkurt | Bozkurt Academy',
    description: 'Ömer Faruk Bozkurt teaches German online from A1 to B2, with explanations in English, Turkish or German. Lives and studies in Germany.',
    type: 'ProfilePage',
    ogType: 'profile'
  },
  {
    path: '/en/contact/',
    lang: 'en',
    group: 'contact',
    nav: 'contact',
    crumb: 'Contact',
    title: 'Contact and Free First Lesson | Bozkurt Academy',
    description: 'Get in touch for online German lessons from A1 to B2, one-to-one or in a group, and exam preparation. The first lesson is free.',
    type: 'ContactPage',
    noStickyCta: true
  },

  // ---- Aşama 2 / PR 2: ders sayfaları (Almanca) ----
  {
    path: '/de/online-deutschunterricht/',
    lang: 'de',
    group: 'lessons',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Online-Deutschunterricht',
    title: 'Online-Deutschunterricht A1–B2 auf Türkisch und Deutsch | Bozkurt Academy',
    description: 'Online-Deutschunterricht von A1 bis B2 mit Erklärungen auf Türkisch und Deutsch: Schulunterstützung, Deutsch für Alltag und Beruf, Prüfungsvorbereitung. Erste Stunde kostenlos.',
    schema: [service('/de/online-deutschunterricht/', 'Online-Deutschunterricht', 'Online-Deutschunterricht A1–B2 über Zoom oder Google Meet, mit Erklärungen auf Türkisch und Deutsch.', 'Online-Deutschunterricht', { contact: '/de/kontakt/', lang: 'de' })]
  },
  {
    path: '/de/deutsch-einzelunterricht/',
    lang: 'de',
    group: 'private',
    parent: '/de/online-deutschunterricht/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Einzelunterricht',
    title: 'Deutsch-Einzelunterricht online: Nachhilfe und Prüfungen | Bozkurt Academy',
    description: 'Deutsch-Einzelunterricht online: Nachhilfe für Schülerinnen und Schüler, Deutsch für Beruf und Alltag, Prüfungsvorbereitung. Erklärungen auf Türkisch und Deutsch, erste Stunde kostenlos.',
    schema: [service('/de/deutsch-einzelunterricht/', 'Deutsch-Einzelunterricht (online)', 'Online-Einzelunterricht in Deutsch nach Niveau, Ziel und Zeitplan.', 'Deutsch-Einzelunterricht', { contact: '/de/kontakt/', lang: 'de' })]
  },
  {
    path: '/de/deutsch-gruppenkurs/',
    lang: 'de',
    group: 'group',
    parent: '/de/online-deutschunterricht/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Gruppenkurs',
    title: 'Deutsch-Gruppenkurs online: höchstens 6 Personen | Bozkurt Academy',
    description: 'Online-Gruppenkurs Deutsch in kleinen Gruppen mit höchstens 6 Personen auf demselben Niveau: feste Termine, viel Sprechpraxis, A1 bis B2.',
    schema: [service('/de/deutsch-gruppenkurs/', 'Deutsch-Gruppenkurs (online)', 'Online-Deutschkurse in Gruppen mit höchstens 6 Lernenden auf demselben Niveau.', 'Deutsch-Gruppenkurs', { contact: '/de/kontakt/', lang: 'de' })]
  },
  {
    path: '/de/pruefungsvorbereitung-deutsch/',
    lang: 'de',
    group: 'exams',
    updated: '2026-11-16',
    nav: 'exams',
    crumb: 'Prüfungsvorbereitung',
    title: 'Prüfungsvorbereitung Deutsch: Goethe, telc, DTZ | Bozkurt Academy',
    description: 'Vorbereitung auf Goethe, telc, ÖSD, DTZ und TestDaF sowie auf Klassenarbeiten: Aufgabentypen, Lesen, Hören, Schreiben und Sprechen. Online-Einzelunterricht und kostenlose Übungssätze.',
    schema: [service('/de/pruefungsvorbereitung-deutsch/', 'Prüfungsvorbereitung Deutsch', 'Online-Vorbereitung auf Goethe, telc, ÖSD, DTZ und TestDaF.', 'Prüfungsvorbereitung Deutsch', { contact: '/de/kontakt/', lang: 'de' })]
  },

  // ---- Aşama 2 / PR 2: ders sayfaları (İngilizce) ----
  {
    path: '/en/online-german-lessons/',
    lang: 'en',
    group: 'lessons',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Online German lessons',
    title: 'Online German Lessons A1–B2 | Bozkurt Academy',
    description: 'Online German lessons from A1 to B2 with a teacher who lives in Germany. One-to-one or small groups, 50-minute lessons, explanations in English. First lesson free.',
    schema: [service('/en/online-german-lessons/', 'Online German Lessons', 'Online German lessons A1–B2 via Zoom or Google Meet, with explanations in English.', 'Online German lessons', { contact: '/en/contact/', lang: 'en' })]
  },
  {
    path: '/en/private-german-lessons/',
    lang: 'en',
    group: 'private',
    parent: '/en/online-german-lessons/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Private lessons',
    title: 'Private German Lessons Online (One-to-One) | Bozkurt Academy',
    description: 'One-to-one German lessons online, planned around your level, goal and schedule: exams, work, everyday life in Germany and speaking practice. First lesson free.',
    schema: [service('/en/private-german-lessons/', 'Private German Lessons (one-to-one)', 'One-to-one online German lessons planned around your level and goal.', 'Private German lessons', { contact: '/en/contact/', lang: 'en' })]
  },
  {
    path: '/en/german-group-lessons/',
    lang: 'en',
    group: 'group',
    parent: '/en/online-german-lessons/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Group lessons',
    title: 'German Group Lessons Online: Max. 6 People | Bozkurt Academy',
    description: 'Online German group lessons with at most 6 learners at the same level: a fixed schedule, lots of speaking practice, A1 to B2.',
    schema: [service('/en/german-group-lessons/', 'German Group Lessons (online)', 'Online German lessons in groups of at most 6 learners at the same level.', 'German group lessons', { contact: '/en/contact/', lang: 'en' })]
  },
  {
    path: '/en/german-exam-preparation/',
    lang: 'en',
    group: 'exams',
    updated: '2026-11-16',
    nav: 'exams',
    crumb: 'Exam preparation',
    title: 'German Exam Preparation: Goethe, telc, TestDaF | Bozkurt Academy',
    description: 'Prepare for Goethe, telc, ÖSD, DTZ and TestDaF with real task types: reading, listening, writing and speaking. One-to-one online lessons and free practice sets.',
    schema: [service('/en/german-exam-preparation/', 'German Exam Preparation', 'Online preparation for Goethe, telc, ÖSD, DTZ and TestDaF German exams.', 'German exam preparation', { contact: '/en/contact/', lang: 'en' })]
  },

  // ---- Aşama 2 / PR 3: A1–B2 kurs sayfaları (Almanca, sonra İngilizce) ----
  {
    path: '/de/deutschkurs-a1/',
    lang: 'de',
    group: 'a1',
    parent: '/de/online-deutschunterricht/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Deutschkurs A1',
    title: 'Deutschkurs A1 online: Einstieg und Familiennachzug | Bozkurt Academy',
    description: 'Deutschkurs A1 online für den Einstieg ohne Vorkenntnisse und die A1-Prüfung, etwa für den Familiennachzug. Erklärungen auf Türkisch und Deutsch, erste Stunde kostenlos.',
    schema: [course('/de/deutschkurs-a1/', 'Deutschkurs A1', 'Deutsch für Anfänger ohne Vorkenntnisse: Grundgrammatik, Alltagskommunikation und Vorbereitung auf die A1-Prüfung (Goethe, telc, ÖSD).', 'A1 (Anfang)', { lang: 'de' })]
  },
  {
    path: '/de/deutschkurs-a2/',
    lang: 'de',
    group: 'a2',
    parent: '/de/online-deutschunterricht/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Deutschkurs A2',
    title: 'Deutschkurs A2 online | Bozkurt Academy',
    description: 'Deutschkurs A2 online: Vergangenheit, Nebensätze und Deutsch für den Alltag in Deutschland. Einzel- oder Gruppenunterricht und A2-Prüfungsvorbereitung.',
    schema: [course('/de/deutschkurs-a2/', 'Deutschkurs A2', 'A2 nach A1: Perfekt, Dativ, Nebensätze, Alltagskommunikation und Vorbereitung auf die A2-Prüfung.', 'A2 (Grundlagen)', { lang: 'de' })]
  },
  {
    path: '/de/deutschkurs-b1/',
    lang: 'de',
    group: 'b1',
    parent: '/de/online-deutschunterricht/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Deutschkurs B1',
    title: 'Deutschkurs B1 und Prüfungsvorbereitung (Goethe, telc, DTZ) | Bozkurt Academy',
    description: 'Deutschkurs B1 online: selbstständiges Deutsch für Arbeit, Ausbildung, Schule und Alltag. Vorbereitung auf Goethe B1, telc B1 und DTZ.',
    schema: [course('/de/deutschkurs-b1/', 'Deutschkurs B1', 'Selbstständige Sprachverwendung B1: Nebensätze, Passiv, Konjunktiv II, Kommunikation in Beruf und Alltag, Vorbereitung auf die B1-Prüfung.', 'B1 (Mittelstufe)', { lang: 'de' })]
  },
  {
    path: '/de/deutschkurs-b2/',
    lang: 'de',
    group: 'b2',
    parent: '/de/online-deutschunterricht/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'Deutschkurs B2',
    title: 'Deutschkurs B2 online: Beruf, Studium, Prüfung | Bozkurt Academy',
    description: 'Deutschkurs B2 online: flüssiges und genaues Deutsch für Beruf, Studium und Oberstufe. Diskussion, formelle Texte, komplexe Grammatik und B2-Prüfungsvorbereitung.',
    schema: [course('/de/deutschkurs-b2/', 'Deutschkurs B2', 'B2: komplexe Satzstrukturen, Passiv und Konjunktiv, berufliche und akademische Kommunikation, Vorbereitung auf Goethe und telc B2.', 'B2 (Fortgeschritten)', { lang: 'de' })]
  },
  {
    path: '/en/german-course-a1/',
    lang: 'en',
    group: 'a1',
    parent: '/en/online-german-lessons/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'German course A1',
    title: 'German Course A1 Online: Beginners and Visas | Bozkurt Academy',
    description: 'German course A1 online for complete beginners and the A1 exam, for example for a family reunification visa. Explanations in English, first lesson free.',
    schema: [course('/en/german-course-a1/', 'German course A1', 'German for complete beginners: basic grammar, everyday communication and preparation for the A1 exam (Goethe, telc, ÖSD).', 'A1 (Beginner)', { lang: 'en' })]
  },
  {
    path: '/en/german-course-a2/',
    lang: 'en',
    group: 'a2',
    parent: '/en/online-german-lessons/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'German course A2',
    title: 'German Course A2 Online | Bozkurt Academy',
    description: 'German course A2 online: past tense, subordinate clauses and everyday German for life in Germany. One-to-one or group lessons and A2 exam preparation.',
    schema: [course('/en/german-course-a2/', 'German course A2', 'A2 after A1: Perfekt, dative, subordinate clauses, everyday communication and preparation for the A2 exam.', 'A2 (Elementary)', { lang: 'en' })]
  },
  {
    path: '/en/german-course-b1/',
    lang: 'en',
    group: 'b1',
    parent: '/en/online-german-lessons/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'German course B1',
    title: 'German Course B1 and Exam Preparation | Bozkurt Academy',
    description: 'German course B1 online: independent German for work, vocational training and daily life in Germany. Preparation for Goethe B1, telc B1 and DTZ.',
    schema: [course('/en/german-course-b1/', 'German course B1', 'Independent user level B1: subordinate clauses, passive, Konjunktiv II, communication at work and in daily life, B1 exam preparation.', 'B1 (Intermediate)', { lang: 'en' })]
  },
  {
    path: '/en/german-course-b2/',
    lang: 'en',
    group: 'b2',
    parent: '/en/online-german-lessons/',
    updated: '2026-11-16',
    nav: 'lessons',
    crumb: 'German course B2',
    title: 'German Course B2 Online: Work, University, Exams | Bozkurt Academy',
    description: 'German course B2 online: fluent, accurate German for work, your profession and university. Discussion, formal writing, complex grammar and B2 exam preparation.',
    schema: [course('/en/german-course-b2/', 'German course B2', 'B2: complex sentence structures, passive and Konjunktiv, professional and academic communication, Goethe and telc B2 preparation.', 'B2 (Upper intermediate)', { lang: 'en' })]
  }
];
