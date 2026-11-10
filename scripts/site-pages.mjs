// Statik sayfaların listesi: adres, başlık, açıklama, sayfa yolu (breadcrumb) ve sayfaya özel şema.
// Başlığı veya açıklamayı değiştirdikten sonra: node scripts/build-pages.mjs
// İçerik metinleri sayfaların kendi dosyalarında (ör. online-almanca-dersi/index.html) durur.
//
// Kurallar: fiyat, telefon, adres yok; şemalarda offers/price/priceRange/telephone yok.
// Şemalara yalnızca sayfada görünür biçimde yazan bilgiler girer.
//
// Çeviriler (İngilizce /en/…, Almanca /de/…): sayfanın sonundaki TRANSLATIONS listesinde, "lang" ve
// Türkçe karşılığı "of" ile. Bu liste slug eşleme tablosudur; dil düğmeleri, menü bağlantıları, hreflang
// ve sitemap buradan üretilir (scripts/site-i18n.mjs). Almanca slug'larda ü/ö/ä/ß yerine ue/oe/ae/ss.

export const SITE = 'https://bozkurtacademy.com';

const provider = { '@id': `${SITE}/#organization` };
const instructor = { '@id': `${SITE}/#person` };

function course(path, name, description, level, lang = 'tr') {
  return {
    '@type': 'Course',
    '@id': `${SITE}${path}#course`,
    name,
    description,
    url: `${SITE}${path}`,
    inLanguage: lang,
    educationalLevel: level,
    provider,
    about: { '@type': 'Thing', name: { tr: 'Almanca', en: 'German', de: 'Deutsch' }[lang] },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor
    }
  };
}

function service(path, name, description, serviceType, contact = '/iletisim/') {
  return {
    '@type': 'Service',
    '@id': `${SITE}${path}#service`,
    name,
    description,
    serviceType,
    url: `${SITE}${path}`,
    provider,
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: `${SITE}${contact}` }
  };
}

export const PAGES = [
  {
    path: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Online Almanca Dersi',
    title: 'Online Almanca Dersi A1–B2 | Bozkurt Academy',
    description: 'Online Almanca dersi: Almanya’da yaşayan eğitmenle A1’den B2’ye birebir veya grup dersleri, 50 dakikalık oturumlar ve ücretsiz ilk ders.',
    schema: [service('/online-almanca-dersi/', 'Online Almanca Dersi', 'A1–B2 seviyelerinde Zoom veya Google Meet üzerinden online Almanca dersleri.', 'Online Almanca dersi')]
  },
  {
    path: '/almanca-ozel-ders/',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Almanca Özel Ders',
    title: 'Almanca Özel Ders (Birebir, Online) | Bozkurt Academy',
    description: 'Birebir Almanca özel ders: seviyene, hedefine ve zamanına göre planlanan online dersler. A1–B2, sınav hazırlığı ve konuşma pratiği. İlk ders ücretsiz.',
    schema: [service('/almanca-ozel-ders/', 'Almanca Özel Ders (Birebir)', 'Seviye ve hedefe göre planlanan birebir online Almanca dersleri.', 'Birebir Almanca özel ders')]
  },
  {
    path: '/almanca-grup-dersi/',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Almanca Grup Dersi',
    title: 'Almanca Grup Dersi: Online, En Fazla 6 Kişi | Bozkurt Academy',
    description: 'Online Almanca grup dersi: en fazla 6 kişilik gruplarda aynı seviyedeki öğrencilerle konuşma pratiği ve düzenli program. A1–B2 grupları hakkında bilgi al.',
    schema: [service('/almanca-grup-dersi/', 'Almanca Grup Dersi (Online)', 'Aynı seviyedeki en fazla 6 öğrenciden oluşan online Almanca grup dersleri.', 'Online Almanca grup dersi')]
  },
  {
    path: '/a1-almanca-kursu/',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'A1 Almanca Kursu',
    title: 'A1 Almanca Kursu: Vize ve Aile Birleşimi | Bozkurt Academy',
    description: 'A1 Almanca kursu: sıfırdan başlayanlar ve aile birleşimi veya vize başvurusu öncesi A1 sınavına hazırlık. Online birebir veya grup dersleri, ücretsiz ilk ders.',
    schema: [course('/a1-almanca-kursu/', 'A1 Almanca Kursu', 'Sıfırdan başlayanlar için A1 Almanca: temel dil bilgisi, günlük iletişim ve A1 sınavına (Goethe, telc, ÖSD) hazırlık.', 'A1 (Başlangıç)')]
  },
  {
    path: '/a2-almanca-kursu/',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'A2 Almanca Kursu',
    title: 'A2 Almanca Kursu (Online) | Bozkurt Academy',
    description: 'A2 Almanca kursu: geçmiş zaman, yan cümleler ve günlük yaşam iletişimi. A1’i bitirenler için online birebir veya grup dersleri ve A2 sınav hazırlığı.',
    schema: [course('/a2-almanca-kursu/', 'A2 Almanca Kursu', 'A1’i tamamlayanlar için A2 Almanca: Perfekt, Dativ, yan cümleler, günlük yaşam iletişimi ve A2 sınavına hazırlık.', 'A2 (Temel)')]
  },
  {
    path: '/b1-almanca-kursu/',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'B1 Almanca Kursu',
    title: 'B1 Almanca Kursu ve Sınav Hazırlığı | Bozkurt Academy',
    description: 'B1 Almanca kursu: Almanya’da iş, Ausbildung ve günlük yaşam için B1 seviyesi. Online birebir veya grup dersleri, Goethe, telc ve DTZ B1 hazırlığı.',
    schema: [course('/b1-almanca-kursu/', 'B1 Almanca Kursu', 'Bağımsız kullanıcı seviyesi B1: yan cümleler, Passiv, Konjunktiv II girişi, iş ve günlük yaşam iletişimi, B1 sınav hazırlığı.', 'B1 (Orta)')]
  },
  {
    path: '/b2-almanca-kursu/',
    parent: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'B2 Almanca Kursu',
    title: 'B2 Almanca Kursu: İş, Üniversite, Meslek | Bozkurt Academy',
    description: 'B2 Almanca kursu: iş hayatı, üniversite ve meslek için akıcı Almanca. Tartışma, resmi yazışma, karmaşık dil bilgisi ve B2 sınav hazırlığı, online.',
    schema: [course('/b2-almanca-kursu/', 'B2 Almanca Kursu', 'B2 seviyesi: karmaşık cümle yapıları, Passiv ve Konjunktiv, iş ve akademik iletişim, Goethe ve telc B2 hazırlığı.', 'B2 (Orta üstü)')]
  },
  {
    path: '/almanca-sinav-hazirlik/',
    nav: 'exams',
    crumb: 'Almanca Sınav Hazırlık',
    title: 'Goethe ve telc Almanca Sınav Hazırlık | Bozkurt Academy',
    description: 'Goethe, telc, ÖSD, DTZ ve TestDaF sınav hazırlık: görev türleri, okuma, dinleme, yazma ve konuşma çalışması. Online birebir ders ve ücretsiz deneme setleri.',
    schema: [service('/almanca-sinav-hazirlik/', 'Almanca Sınav Hazırlık', 'Goethe, telc, ÖSD, DTZ ve TestDaF sınavlarına yönelik online hazırlık dersleri.', 'Almanca sınav hazırlık')]
  },
  {
    path: '/hakkimda/',
    nav: 'about',
    crumb: 'Hakkımda',
    title: 'Hakkımda: Almanca Eğitmeni Ömer Faruk Bozkurt',
    description: 'Almanya’da yaşayan Almanca eğitmeni Ömer Faruk Bozkurt: eğitim geçmişi, Almanya deneyimi ve derslerde açıklama, uygulama ve tekrar yöntemi.',
    type: 'ProfilePage',
    ogType: 'profile'
  },
  {
    path: '/iletisim/',
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
    css: ['/css/alfabe.css?v=1'],
    js: ['/js/html.js?v=1', '/js/alfabe-logic.js?v=1', '/js/alfabe.js?v=1'],
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
  }
];

// İngilizce ve Almanca sayfalar. İçerik metinleri kendi dosyalarında (ör. en/about/index.html).
const TRANSLATIONS = [
  {
    path: '/en/online-german-lessons/',
    lang: 'en',
    of: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Online German Lessons',
    title: 'Online German Lessons A1–B2 | Bozkurt Academy',
    description: 'Online German lessons with a teacher who lives in Germany: one-to-one or group classes from A1 to B2, 50-minute sessions and a free first lesson.',
    schema: [service('/en/online-german-lessons/', 'Online German Lessons', 'Online German lessons from A1 to B2 via Zoom or Google Meet.', 'Online German lessons', '/en/contact/')]
  },
  {
    path: '/de/online-deutschunterricht/',
    lang: 'de',
    of: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Online-Deutschunterricht',
    title: 'Online-Deutschunterricht A1–B2 | Bozkurt Academy',
    description: 'Online-Deutschunterricht mit einem Lehrer, der in Deutschland lebt: Einzel- oder Gruppenunterricht von A1 bis B2, 50-minütige Stunden und eine kostenlose erste Stunde.',
    schema: [service('/de/online-deutschunterricht/', 'Online-Deutschunterricht', 'Online-Deutschunterricht von A1 bis B2 über Zoom oder Google Meet.', 'Online-Deutschunterricht', '/de/kontakt/')]
  },
  {
    path: '/en/about/',
    lang: 'en',
    of: '/hakkimda/',
    nav: 'about',
    crumb: 'About Me',
    title: 'About Me: German Teacher Ömer Faruk Bozkurt',
    description: 'Ömer Faruk Bozkurt, a German teacher living in Germany: education, experience in Germany and a teaching method built on explanation, practice and review.',
    type: 'ProfilePage',
    ogType: 'profile'
  },
  {
    path: '/de/ueber-mich/',
    lang: 'de',
    of: '/hakkimda/',
    nav: 'about',
    crumb: 'Über mich',
    title: 'Über mich: Deutschlehrer Ömer Faruk Bozkurt',
    description: 'Ömer Faruk Bozkurt, Deutschlehrer mit Wohnsitz in Deutschland: Ausbildung, Erfahrung in Deutschland und eine Unterrichtsmethode aus Erklärung, Anwendung und Wiederholung.',
    type: 'ProfilePage',
    ogType: 'profile'
  },
  {
    path: '/en/private-german-lessons/', lang: 'en', of: '/almanca-ozel-ders/', parent: '/en/online-german-lessons/', nav: 'lessons',
    crumb: 'Private German Lessons',
    title: 'Private German Lessons (One-to-One, Online) | Bozkurt Academy',
    description: 'One-to-one German lessons planned around your level, goal and schedule. A1–B2, exam preparation and speaking practice, online. The first lesson is free.',
    schema: [service('/en/private-german-lessons/', 'Private German Lessons (One-to-One)', 'One-to-one online German lessons planned around your level and goal.', 'Private German lessons', '/en/contact/')]
  },
  {
    path: '/de/deutsch-einzelunterricht/', lang: 'de', of: '/almanca-ozel-ders/', parent: '/de/online-deutschunterricht/', nav: 'lessons',
    crumb: 'Deutsch-Einzelunterricht',
    title: 'Deutsch-Einzelunterricht (online) | Bozkurt Academy',
    description: 'Deutsch-Einzelunterricht nach Ihrem Niveau, Ziel und Zeitplan: A1–B2, Prüfungsvorbereitung und Sprechpraxis, online. Die erste Stunde ist kostenlos.',
    schema: [service('/de/deutsch-einzelunterricht/', 'Deutsch-Einzelunterricht', 'Online-Einzelunterricht in Deutsch, geplant nach Niveau und Ziel.', 'Deutsch-Einzelunterricht', '/de/kontakt/')]
  },
  {
    path: '/en/german-group-classes/', lang: 'en', of: '/almanca-grup-dersi/', parent: '/en/online-german-lessons/', nav: 'lessons',
    crumb: 'German Group Classes',
    title: 'German Group Classes: Online, Up to 6 People | Bozkurt Academy',
    description: 'Online German group classes with up to 6 learners at the same level: speaking practice and a regular schedule. Ask about A1–B2 groups.',
    schema: [service('/en/german-group-classes/', 'German Group Classes (Online)', 'Online German group classes with up to 6 learners at the same level.', 'Online German group classes', '/en/contact/')]
  },
  {
    path: '/de/deutsch-gruppenkurs/', lang: 'de', of: '/almanca-grup-dersi/', parent: '/de/online-deutschunterricht/', nav: 'lessons',
    crumb: 'Deutsch-Gruppenkurs',
    title: 'Deutsch-Gruppenkurs: online, höchstens 6 Personen | Bozkurt Academy',
    description: 'Online-Gruppenkurs Deutsch mit höchstens 6 Lernenden auf demselben Niveau: Sprechpraxis und ein festes Programm. Informieren Sie sich über die Gruppen A1–B2.',
    schema: [service('/de/deutsch-gruppenkurs/', 'Deutsch-Gruppenkurs (online)', 'Online-Gruppenkurse Deutsch mit höchstens 6 Lernenden auf demselben Niveau.', 'Online-Gruppenkurs Deutsch', '/de/kontakt/')]
  },
  {
    path: '/en/a1-german-course/', lang: 'en', of: '/a1-almanca-kursu/', parent: '/en/online-german-lessons/', nav: 'lessons',
    crumb: 'A1 German Course',
    title: 'A1 German Course: Visa and Family Reunification | Bozkurt Academy',
    description: 'A1 German course for complete beginners and for A1 exam preparation before a family reunification or visa application. Online one-to-one or group lessons, free first lesson.',
    schema: [course('/en/a1-german-course/', 'A1 German Course', 'A1 German for beginners: basic grammar, everyday communication and preparation for the A1 exam (Goethe, telc, ÖSD).', 'A1 (Beginner)', 'en')]
  },
  {
    path: '/de/deutschkurs-a1/', lang: 'de', of: '/a1-almanca-kursu/', parent: '/de/online-deutschunterricht/', nav: 'lessons',
    crumb: 'Deutschkurs A1',
    title: 'Deutschkurs A1: Visum und Familiennachzug | Bozkurt Academy',
    description: 'Deutschkurs A1 für Lernende ohne Vorkenntnisse und zur Vorbereitung auf die A1-Prüfung vor Familiennachzug oder Visumantrag. Online einzeln oder in der Gruppe, erste Stunde kostenlos.',
    schema: [course('/de/deutschkurs-a1/', 'Deutschkurs A1', 'Deutsch A1 für Anfänger: Grundgrammatik, Alltagskommunikation und Vorbereitung auf die A1-Prüfung (Goethe, telc, ÖSD).', 'A1 (Anfänger)', 'de')]
  },
  {
    path: '/en/a2-german-course/', lang: 'en', of: '/a2-almanca-kursu/', parent: '/en/online-german-lessons/', nav: 'lessons',
    crumb: 'A2 German Course',
    title: 'A2 German Course (Online) | Bozkurt Academy',
    description: 'A2 German course: the past tense, subordinate clauses and everyday communication. Online one-to-one or group lessons and A2 exam preparation for learners who have finished A1.',
    schema: [course('/en/a2-german-course/', 'A2 German Course', 'A2 German after A1: Perfekt, Dativ, subordinate clauses, everyday communication and A2 exam preparation.', 'A2 (Elementary)', 'en')]
  },
  {
    path: '/de/deutschkurs-a2/', lang: 'de', of: '/a2-almanca-kursu/', parent: '/de/online-deutschunterricht/', nav: 'lessons',
    crumb: 'Deutschkurs A2',
    title: 'Deutschkurs A2 (online) | Bozkurt Academy',
    description: 'Deutschkurs A2: Vergangenheit, Nebensätze und Kommunikation im Alltag. Online einzeln oder in der Gruppe und Vorbereitung auf die A2-Prüfung für alle, die A1 abgeschlossen haben.',
    schema: [course('/de/deutschkurs-a2/', 'Deutschkurs A2', 'Deutsch A2 nach A1: Perfekt, Dativ, Nebensätze, Alltagskommunikation und Vorbereitung auf die A2-Prüfung.', 'A2 (Grundstufe)', 'de')]
  },
  {
    path: '/en/b1-german-course/', lang: 'en', of: '/b1-almanca-kursu/', parent: '/en/online-german-lessons/', nav: 'lessons',
    crumb: 'B1 German Course',
    title: 'B1 German Course and Exam Preparation | Bozkurt Academy',
    description: 'B1 German course for work, vocational training (Ausbildung) and everyday life in Germany. Online one-to-one or group lessons, Goethe, telc and DTZ B1 preparation.',
    schema: [course('/en/b1-german-course/', 'B1 German Course', 'Independent user level B1: subordinate clauses, passive, Konjunktiv II, communication at work and in everyday life, B1 exam preparation.', 'B1 (Intermediate)', 'en')]
  },
  {
    path: '/de/deutschkurs-b1/', lang: 'de', of: '/b1-almanca-kursu/', parent: '/de/online-deutschunterricht/', nav: 'lessons',
    crumb: 'Deutschkurs B1',
    title: 'Deutschkurs B1 und Prüfungsvorbereitung | Bozkurt Academy',
    description: 'Deutschkurs B1 für Beruf, Ausbildung und Alltag in Deutschland. Online einzeln oder in der Gruppe, Vorbereitung auf Goethe, telc und DTZ B1.',
    schema: [course('/de/deutschkurs-b1/', 'Deutschkurs B1', 'Selbstständige Sprachverwendung B1: Nebensätze, Passiv, Konjunktiv II, Kommunikation in Beruf und Alltag, B1-Prüfungsvorbereitung.', 'B1 (Mittelstufe)', 'de')]
  },
  {
    path: '/en/b2-german-course/', lang: 'en', of: '/b2-almanca-kursu/', parent: '/en/online-german-lessons/', nav: 'lessons',
    crumb: 'B2 German Course',
    title: 'B2 German Course: Work, University, Profession | Bozkurt Academy',
    description: 'B2 German course: fluent German for work, university and your profession. Discussion, formal correspondence, complex grammar and B2 exam preparation, online.',
    schema: [course('/en/b2-german-course/', 'B2 German Course', 'Level B2: complex sentence structures, passive and Konjunktiv, communication at work and university, Goethe and telc B2 preparation.', 'B2 (Upper intermediate)', 'en')]
  },
  {
    path: '/de/deutschkurs-b2/', lang: 'de', of: '/b2-almanca-kursu/', parent: '/de/online-deutschunterricht/', nav: 'lessons',
    crumb: 'Deutschkurs B2',
    title: 'Deutschkurs B2: Beruf, Studium, Arbeitsleben | Bozkurt Academy',
    description: 'Deutschkurs B2: flüssiges Deutsch für Beruf, Studium und Arbeitsleben. Diskussion, formelle Korrespondenz, komplexe Grammatik und B2-Prüfungsvorbereitung, online.',
    schema: [course('/de/deutschkurs-b2/', 'Deutschkurs B2', 'Niveau B2: komplexe Satzstrukturen, Passiv und Konjunktiv, Kommunikation in Beruf und Studium, Vorbereitung auf Goethe und telc B2.', 'B2 (Obere Mittelstufe)', 'de')]
  },
  {
    path: '/en/german-exam-preparation/', lang: 'en', of: '/almanca-sinav-hazirlik/', nav: 'exams',
    crumb: 'German Exam Preparation',
    title: 'Goethe and telc German Exam Preparation | Bozkurt Academy',
    description: 'Preparation for the Goethe, telc, ÖSD, DTZ and TestDaF exams: task types, reading, listening, writing and speaking. Online one-to-one lessons and free practice sets.',
    schema: [service('/en/german-exam-preparation/', 'German Exam Preparation', 'Online preparation lessons for the Goethe, telc, ÖSD, DTZ and TestDaF exams.', 'German exam preparation', '/en/contact/')]
  },
  {
    path: '/de/pruefungsvorbereitung-deutsch/', lang: 'de', of: '/almanca-sinav-hazirlik/', nav: 'exams',
    crumb: 'Prüfungsvorbereitung Deutsch',
    title: 'Prüfungsvorbereitung Goethe und telc | Bozkurt Academy',
    description: 'Vorbereitung auf Goethe, telc, ÖSD, DTZ und TestDaF: Aufgabentypen, Lesen, Hören, Schreiben und Sprechen. Online-Einzelunterricht und kostenlose Übungssätze.',
    schema: [service('/de/pruefungsvorbereitung-deutsch/', 'Prüfungsvorbereitung Deutsch', 'Online-Vorbereitung auf die Prüfungen Goethe, telc, ÖSD, DTZ und TestDaF.', 'Prüfungsvorbereitung Deutsch', '/de/kontakt/')]
  },
  {
    path: '/en/contact/', lang: 'en', of: '/iletisim/', nav: 'contact',
    crumb: 'Contact',
    title: 'Contact: Free First German Lesson | Bozkurt Academy',
    description: 'Contact Bozkurt Academy: fill in the form about online German lessons and a free first lesson. Tell me your level, your goal and the times that suit you.',
    type: 'ContactPage',
    noStickyCta: true
  },
  {
    path: '/de/kontakt/', lang: 'de', of: '/iletisim/', nav: 'contact',
    crumb: 'Kontakt',
    title: 'Kontakt: kostenlose erste Deutschstunde | Bozkurt Academy',
    description: 'Kontakt zu Bozkurt Academy: Füllen Sie das Formular zum Online-Deutschunterricht und zur kostenlosen ersten Stunde aus. Nennen Sie Ihr Niveau, Ihr Ziel und passende Zeiten.',
    type: 'ContactPage',
    noStickyCta: true
  },
  {
    path: '/en/faq/', lang: 'en', of: '/sss/',
    crumb: 'FAQ',
    title: 'German Lessons: Frequently Asked Questions | Bozkurt Academy',
    description: 'Frequently asked questions about online German lessons: the first lesson, lesson length, one-to-one and group lessons, how fees are set, exams and the placement test.'
  },
  {
    path: '/de/haeufige-fragen/', lang: 'de', of: '/sss/',
    crumb: 'Häufige Fragen',
    title: 'Deutschunterricht: häufige Fragen | Bozkurt Academy',
    description: 'Häufige Fragen zum Online-Deutschunterricht: erste Stunde, Unterrichtsdauer, Einzel- und Gruppenunterricht, Preisgestaltung, Prüfungen und Einstufungstest.'
  }
];

PAGES.push(...TRANSLATIONS);
