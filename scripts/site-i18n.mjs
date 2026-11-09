// Statik sayfaların dil bilgileri (TR / EN / DE).
//
// Dil adreste durur: Türkçe kök adreslerde (/hakkimda/), İngilizce /en/… ve Almanca /de/… altında,
// çevrilmiş slug'larla (/en/about/, /de/ueber-mich/). Almanca slug'larda ü/ö/ä/ß yerine ue/oe/ae/ss.
// Çeviri sayfaları scripts/site-pages.mjs'de "lang" ve "of" (Türkçe karşılığı) ile tanımlanır;
// slug eşleme tablosu (ROUTES) oradan çıkarılır ve js/app.js ile js/legacy-hash.js'e yazılır.
//
// Çevirisi olmayan Türkçe sayfalar (gramer dersleri, blog …) içerik olarak Türkçe kalır; menü ve footer
// seçilen dilde görünür ve sayfanın üstünde kapatılabilir bir "yalnızca Türkçe" notu çıkar (js/app.js).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const LANGS = ['tr', 'de', 'en']; // dil düğmelerinin sırası
export const LOCALE = { tr: 'tr_TR', en: 'en_US', de: 'de_DE' };
export const IN_LANGUAGE = { tr: 'tr-TR', en: 'en', de: 'de-DE' };

// Yalnızca üretim betiğinin kullandığı metinler (menü etiketleri js/app.js sözlüğünden gelir).
export const UI = {
  tr: {
    skip: 'Ana içeriğe geç', siteMenu: 'Site menüsü', homeAria: 'Bozkurt Academy ana sayfa', langGroup: 'Dil seçimi',
    themeAria: 'Koyu temaya geç', crumbNav: 'Sayfa yolu', crumbHome: 'Ana sayfa', sitePages: 'Site sayfaları',
    ogAlt: 'Bozkurt Academy: A1’den B2’ye online Almanca dersi'
  },
  en: {
    skip: 'Skip to main content', siteMenu: 'Site menu', homeAria: 'Bozkurt Academy home page', langGroup: 'Language',
    themeAria: 'Switch to dark theme', crumbNav: 'Breadcrumb', crumbHome: 'Home', sitePages: 'Site pages',
    ogAlt: 'Bozkurt Academy: online German lessons from A1 to B2'
  },
  de: {
    skip: 'Zum Hauptinhalt springen', siteMenu: 'Seitenmenü', homeAria: 'Bozkurt Academy Startseite', langGroup: 'Sprache',
    themeAria: 'Dunkles Design aktivieren', crumbNav: 'Brotkrümelnavigation', crumbHome: 'Startseite', sitePages: 'Seiten der Website',
    ogAlt: 'Bozkurt Academy: Online-Deutschunterricht von A1 bis B2'
  }
};

// Footer: grup başlığı ve bağlantı etiketleri js/app.js sözlüğünde (ft… anahtarları); adresler Türkçe yazılır,
// sayfanın dilindeki karşılığı üretimde bulunur.
export const FOOTER = [['ftLessons', [['/online-almanca-dersi/', 'ftOnline'], ['/almanca-ozel-ders/', 'ftPrivate'], ['/almanca-grup-dersi/', 'ftGroup'], ['/almanca-sinav-hazirlik/', 'ftExamPrep']]], ['ftLevels', [['/a1-almanca-kursu/', 'ftA1'], ['/a2-almanca-kursu/', 'ftA2'], ['/b1-almanca-kursu/', 'ftB1'], ['/b2-almanca-kursu/', 'ftB2']]], ['ftFree', [['/almanca-gramer/', 'ftGrammar'], ['/#exercises', 'ftExercises'], ['/#exams', 'ftExamSets'], ['/#seviye-testi', 'ftPlacement'], ['/almanca-alfabe/', 'ftAlphabet']]], ['ftBrand', [['/hakkimda/', 'ftAbout'], ['/blog/', 'ftBlog'], ['/sss/', 'ftFaq'], ['/iletisim/', 'ftContact']]]];

// js/app.js'teki sözlük (menü, düğmeler): statik HTML, JavaScript'in yazacağı metinle aynı olsun.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let appDict;
export function appText(lang, key) {
  if (!appDict) {
    const src = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
    const start = src.indexOf('{', src.indexOf('const translations'));
    let depth = 0, end = start, quote = null;
    for (; end < src.length; end++) {
      const c = src[end];
      if (quote) { if (c === '\\') end++; else if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'" || c === '`') quote = c;
      else if (c === '{') depth++;
      else if (c === '}' && !--depth) break;
    }
    appDict = vm.runInNewContext('(' + src.slice(start, end + 1) + ')');
  }
  const value = appDict[lang]?.[key] ?? appDict.tr[key];
  if (value === undefined) throw new Error(`js/app.js sözlüğünde "${key}" yok`);
  return value;
}

// Türkçe adres → { en, de } eşlemesi. Çevirisi olmayan dil eşlemede yer almaz.
export function routes(pages) {
  const map = {};
  for (const p of pages) {
    if (!p.of) continue;
    if (!/^\/(en|de)\/[a-z0-9-]+(\/[a-z0-9-]+)*\/$/.test(p.path) || !p.path.startsWith(`/${p.lang}/`)) throw new Error(`${p.path}: çeviri adresi /${p.lang}/küçük-harf-slug/ biçiminde olmalı (ü/ö/ä/ß yerine ue/oe/ae/ss)`);
    (map[p.of] ||= {})[p.lang] = p.path;
  }
  return map;
}

// Sayfanın dil grubu: { tr, en?, de? }. Çevirisi olmayan sayfada yalnızca kendisi.
export function alternates(page, map) {
  const tr = page.of || page.path;
  return { tr, ...(map[tr] || {}) };
}

// Bir Türkçe bağlantıyı (ör. /iletisim/#form) verilen dildeki karşılığına çevirir; yoksa Türkçesi kalır.
export function localHref(href, lang, map) {
  const m = /^(\/[^?#]*)(.*)$/.exec(href);
  if (!m || lang === 'tr') return href;
  return (map[m[1]]?.[lang] || m[1]) + m[2];
}
