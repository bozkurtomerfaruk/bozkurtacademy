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

function course(path, name, description, level) {
  return {
    '@type': 'Course',
    '@id': `${SITE}${path}#course`,
    name,
    description,
    url: `${SITE}${path}`,
    inLanguage: 'tr',
    educationalLevel: level,
    provider,
    about: { '@type': 'Thing', name: 'Almanca' },
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
    schema: [service('/en/online-german-lessons/', 'Online German Lessons', 'Online German lessons from A1 to B2 via Zoom or Google Meet.', 'Online German lessons')]
  },
  {
    path: '/de/online-deutschunterricht/',
    lang: 'de',
    of: '/online-almanca-dersi/',
    nav: 'lessons',
    crumb: 'Online-Deutschunterricht',
    title: 'Online-Deutschunterricht A1–B2 | Bozkurt Academy',
    description: 'Online-Deutschunterricht mit einem Lehrer, der in Deutschland lebt: Einzel- oder Gruppenunterricht von A1 bis B2, 50-minütige Stunden und eine kostenlose erste Stunde.',
    schema: [service('/de/online-deutschunterricht/', 'Online-Deutschunterricht', 'Online-Deutschunterricht von A1 bis B2 über Zoom oder Google Meet.', 'Online-Deutschunterricht')]
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
  }
];

PAGES.push(...TRANSLATIONS);
