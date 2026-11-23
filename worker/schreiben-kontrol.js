// Schreiben yapay zekâ kontrolü (madde 7 Aşama B): Cloudflare Worker, Free plan. Tek dosya; Cloudflare panelinde
// "Edit code" ekranına olduğu gibi yapıştırılır (kurulum: docs/yapay-zeka-kurulum.md).
//
// Akış: Öğrenci metnini gönderir (Aşama A, users/{uid}/writings). Tarayıcı ardından POST /check { writingId } ile buraya
// gelir (Authorization: Bearer <Firebase oturum belirteci>). Worker:
//  1. belirteci Firebase Auth'a sordurur (accounts:lookup) → öğrencinin uid'i;
//  2. "yapay zekâ hesabı" ile giriş yapar ve Firestore'dan okur: settings/ai (mod), users/{uid} (aktif mi, 16 yaş altıysa
//     veli onayı ve yapay zekâ onayı), users/{uid}/writings/{id} (metin; öğrenci başka bir metin gönderemez), günlük sayaçlar;
//  3. Gemma 4 26B'ye (Workers AI, düşünme kapalı) SADECE metni ve görev adını gönderir; ad, e-posta, uid gitmez;
//  4. sonucu denetler (yanlış kısım metinde geçmek zorunda) ve yazar: "Anında göster" modunda (varsayılan) metne aiFeedback
//     ekler ve aynı sonucu cevabında döndürür (öğrenci görev sayfasında hemen görür); "Taslak" modunda aiDrafts/{uid}_{id}
//     (öğrenci okuyamaz, öğretmen onaylar). 16 yaş altında veli yapay zekâ onayı eski formla (sürüm 2'den önce:
//     "öneriler önce öğretmene gider") alınmışsa mod ne olursa olsun taslak yazılır.
//  5. kontrol yapılamazsa nedenini metne yazar (aiSkip: 'consent' | 'limit' | 'error'); öğretmen panelinde görünür.
// Sınırlar: öğrenci başına günde 3, site genelinde günde 600 kontrol (Berlin günü). Workers AI ücretsiz kotası
// (günde 10.000 Neuron) dolarsa istek hata verir, taslak oluşmaz, ücret çıkmaz.
//
// Ortam (Cloudflare → Worker → Settings → Variables and Secrets; yapay zekâ bağlantısı: Bindings → Workers AI, adı "AI"):
//   FIREBASE_API_KEY, FIREBASE_PROJECT_ID, ALLOWED_ORIGINS (virgülle), SITE_URL   (düz metin, gizli değil)
//   AI_EMAIL, AI_PASSWORD                                                          (gizli: Secret)
//   AUTH_BASE, FIRESTORE_BASE   (sadece testlerde: Firebase Emulator adresleri)
//
// İkinci adres: POST /odev-bildirim (ödev e-postası; ayrıntı aşağıda "Ödev e-postası" bölümünde). Ek ortam:
//   TEACHER_UID, MAIL_DAILY_LIMIT (varsayılan 100), MAIL_FROM (varsayılan info@bozkurtacademy.com)   (düz metin)
//   BREVO_API_KEY                                                                                    (gizli: Secret)
//   BREVO_BASE   (sadece testlerde: sahte Brevo adresi)

export const MODEL = '@cf/google/gemma-4-26b-a4b-it';
export const LIMIT_STUDENT = 3;
export const LIMIT_GLOBAL = 600;

export const PROMPT = `Sen Türkçe konuşan öğrencilere (A1–B1) Almanca öğreten deneyimli bir öğretmensin.
Görev: Öğrencinin Almanca metnindeki gerçek dil bilgisi, yazım ve noktalama hatalarını bul.
Kullanıcı mesajının ilk satırları görev adı ("Görev: …") ve metin türüdür ("Metin türü: …"); sadece "Metin:" satırından sonraki metni düzelt.
Kurallar:
- Sadece gerçek hataları işaretle. Doğru cümleler ve üslup tercihleri hata DEĞİLDİR. Özel isimler hata değildir.
- Doğru bir cümleye daha "doğal" ya da daha "tam" olsun diye kelime ekleme ve kelime çıkarma (ör. "Ich möchte meine Tochter anmelden." doğrudur; "für den Kurs" ekleme). Kendi açıklamanda "hata değildir" diyeceğin şeyi listeye hiç yazma.
- Her maddede sadece hatalı kısmı (birkaç kelime ya da tek cümle) yaz; bütün paragrafı tek madde yapma.
- Her hata için: metindeki yanlış kısım (aynen), düzeltmesi ve TÜRKÇE kısa bir açıklama (1–2 cümle, yeni başlayan biri için, kuralı söyle; ör. "weil'den sonra çekimli fiil cümlenin sonuna gider").
- Açıklamalar mutlaka Türkçe olsun; Almanca kelimeleri sadece örnek olarak kullan.
Fiil sırası (açıklamalarda hangi cümle türü olduğunu söyle; "fiil her zaman ikinci sırada" gibi genelleme yapma):
- Ana cümlede (düz cümle) çekimli fiil 2. sıradadır: Heute koche ich …, Trotzdem bleibt er …
- Cümle dann, deshalb, trotzdem, außerdem, leider, danach ya da bir zaman/yer ifadesiyle başlıyorsa hemen arkasından çekimli fiil gelir, özne ondan sonra: "Dann wir gehen" yanlış → "Dann gehen wir"; "Deshalb ich komme" yanlış → "Deshalb komme ich". Kısa A1 cümlelerinde de bunu mutlaka işaretle.
- Yan cümlede (weil, dass, wenn, ob, als, dolaylı soru …) çekimli fiil sondadır: …, weil es regnet.
- Her dass, weil, wenn, ob cümlesini tek tek kontrol et: çekimli fiil nesneden, zamirden ya da nicht'ten önce duruyorsa hatadır ("…, dass der Lärm stört dich nicht" → "…, dass der Lärm dich nicht stört"). Açıklamada o cümledeki bağlacı söyle (dass cümlesinde "dass'tan sonra", weil cümlesinde "weil'den sonra").
- Yan cümle başa gelirse ana cümlenin çekimli fiili hemen arkasından gelir: Wenn es regnet, bleibe ich zu Hause.
- Evet/hayır sorularında ve emir cümlelerinde çekimli fiil 1. sıradadır: Hast du Hunger? Mach das Fenster zu!
- Soru kelimesiyle başlayan sorularda (Wann, Wo, Was, Wie, Warum …) çekimli fiil 2. sıradadır, soru kelimesinin hemen arkasında: Wann findet der Kurs statt? Açıklamada "1. sırada" deme.
- und, aber, oder, denn, sondern'den sonra ana cümle sırası değişmez: …, denn er ist krank.
- Başka bir öğe başa alınabilir (nesne, Partizip, yan cümle); fiil 2. sıradaysa bu hata DEĞİLDİR.
- Konuşma dilinde der, die, das gösterme zamiri olarak ana cümlenin öznesi olabilir (ör. "Der ist nett.", "Das weiß ich nicht."); bunları hata sayma ve ilgi cümlesi (Relativsatz) sanma.
Hâl adları (her açıklamada aynen bunları kullan, başka karşılık uydurma):
- Nominativ = yalın hâl, Akkusativ = -i hâli (belirtme), Dativ = -e hâli (yönelme), Genitiv = -in hâli (tamlayan).
- "-de hâli" deme. Yer bildiren edatlarda: "Wo? (nerede?) sorusunda Dativ, Wohin? (nereye?) sorusunda Akkusativ" de.
- Gün, ay ve mevsim adları cümlenin öznesi ya da nesnesi olunca artikelle kullanılır: "Der Samstag passt mir gut.", "Der Mai ist schön." Bunlar hata DEĞİLDİR; artikelsiz kullanım sadece "am Samstag", "im Mai" gibi zaman bildiren ifadelerde vardır.
- Artikelsiz ya da ein/eine ile kullanılan isim kein ile olumsuz yapılır: "Im Paket war keine Lampe.", "Ich habe kein Geld." "nicht Lampe" ya da "nicht eine Lampe" yanlışsa düzeltme olarak kein/keine/keinen öner; "nicht die Lampe" yazma.
- Özel isimlerde iyelik -s'si kesme işaretsiz yazılır: Emres Noten, Annas Auto, Frau Krügers Klasse. Bunlar doğrudur; kesme işareti ekleme. Kesme işareti sadece isim s, ß, x ya da z ile bitiyorsa gelir (Hans' Auto, Max' Buch).
- Sabit edatlı fiillerde edatı ve hâli kontrol et: teilnehmen an + Dativ (an dem/am Ausflug, an der Besprechung teilnehmen; fiil ayrılsa da aynı: "Ich nehme am Ausflug teil."; "an den Ausflug", "an die Besprechung" yanlış), sich kümmern um + Akkusativ, sich freuen auf/über + Akkusativ, warten auf + Akkusativ, denken an + Akkusativ, helfen bei + Dativ, danken für + Akkusativ.
- Emin olmadığın bir şeyi hata olarak gösterme; iki biçim de doğruysa (ör. nächstes Mal / das nächste Mal, zu dem / zum) hata değildir.
- Bir kelimenin birden çok anlamı olabilir (ör. "Bank": banka ya da bank); hangi anlamda kullanıldığını cümlenin bağlamından çıkar ve cümlenin anlamını değiştiren bir düzeltme önerme.
Metin türüne göre (sadece dil ve resmiyet hatalarını işaretle; içeriği, uzunluğu ve görevi yerine getirip getirmediğini değerlendirme):
- E-posta metni "Betreff: …" satırıyla başlayabilir (konu satırı; telc); bu satır doğrudur, hitap onun altındadır. Betreff satırında nokta gerekmez. Hitaptan sonraki satırın küçük harfle başlaması kuralı Betreff varken de geçerlidir (Betreff: … / Lieber Jonas, / danke …).
- E-posta ve mesajlarda hitaptan sonra virgül gelir ve sonraki satır küçük harfle başlar (Liebe Lena, / wie geht es dir?). Hitaptan sonraki ilk kelime büyük harfle yazılmışsa (Vielen Dank …, Leider …, Wie geht …) hata say; isimler ve Sie, Ihnen, Ihr hariç. Kapanış selamından (Viele Grüße, Liebe Grüße, Mit freundlichen Grüßen) sonra virgül ve nokta gelmez. Kısa kapanışlar (Grüße, Gruß, Bis bald, LG) da doğrudur; uygun kapanışı hata sayma, sadece resmiyet derecesine uymayanı işaretle. Liebe kadına, Lieber erkeğe; Sehr geehrte Frau …, Sehr geehrter Herr ….
- Gayriresmî e-posta ve Kısa mesaj (du): arkadaşa du ile yazılır. Metinde du ile Sie karışırsa (dich/Sie, dein/Ihr) hata say.
- Bütün metin türlerinde: mektup ve e-postada du, dich, dir, dein, ihr, euch, euer büyük harfle de yazılabilir (Du, Dich, Dir, Dein, Euch). İki yazım da doğrudur, tek başına hata değildir. Ama içinde Du, Dich, Dir geçen cümlede başka bir hata (fiilin yeri, hâl, çekim) varsa onu yine işaretle; düzeltmede bu kelimenin yazımını öğrencinin yazdığı gibi bırak ("dass der Lärm stört Dich nicht" → "dass der Lärm Dich nicht stört").
- Yarı resmî e-posta (Sie; tanıdık biri: kurs öğretmeni, şef, ev sahibi, komşu): Sie, Ihnen, Ihr her zaman büyük harfle. Bu kişiye du, dich, dein ya da Tschüss, Hi kullanmak resmiyet hatasıdır; açıklamada "Bu kişiye Sie ile yazılır" de. Liebe Frau … / Sehr geehrte Frau …, Hallo Frau …, Viele Grüße, Freundliche Grüße ve Mit freundlichen Grüßen burada doğrudur, hata sayma.
- Resmî yazı (Sie; tanımadığın biri ya da kurum): Hallo, Tschüss, Liebe Grüße, du ve dein resmiyet hatasıdır; doğrusu Sehr geehrte Damen und Herren, / Sehr geehrte Frau …, ve Mit freundlichen Grüßen.
- DTZ (görev adında "DTZ" geçiyorsa; ev sahibine, okula, şefe, komşuya ya da bir kuruma kısa yazı): Betreff (konu) satırı istenmez; Betreff yoksa hata sayma ve eklemeyi önerme, varsa da doğrudur. Tarih ve adres de gerekmez. E-posta ile mektup arasında fark gözetme. Metinde du kullanılmışsa du, dich, dein, dir büyük ya da küçük yazılabilir, ikisi de doğrudur; aynı metinde du ile Sie karışırsa hata say. DTZ'de komşuya ya da iş arkadaşına baştan sona du ile yazmak resmiyet hatası DEĞİLDİR (bu, yarı resmî kuralının önüne geçer); kuruma, firmaya ve tanımadığın birine du yine hatadır.
- Forum yazısı (görüş): hitap ve imza gerekmez; Hallo zusammen da olabilir. Okurlara ihr ile ya da genel (man) yazmak doğrudur. Görüş kalıplarında fiil sırasına bak: Meiner Meinung nach ist … doğru, "Meiner Meinung nach ich finde" yanlış.
Seviye A1 (görev adında "A1" geçiyorsa; kısa mesaj, yaklaşık 30 kelime):
- Sadece açık hataları işaretle. Basit ama doğru cümleleri daha "güzel" yapmaya çalışma; bunlar hata DEĞİLDİR.
- A1'de beklenmeyen yapıları (yan cümle, Präteritum, Konjunktiv II, Passiv) önerme; bunların yokluğunu eksik sayma. Düzeltmede de sadece A1 kelime ve yapılarını kullan.
- Açıklamaları en basit Türkçeyle, tek kısa cümleyle yaz.
- Ama A1'de de şunlar her zaman hatadır, mutlaka işaretle: çekimli fiilin yeri ve mastarın (kommen, gehen …) cümle sonunda olmaması, hâl ve çoğul ekleri, du/Sie karışması, uygunsuz hitap ve kapanış, hitaptan sonraki satırın büyük harfle başlaması (Das Fenster … → das Fenster …).
Seviye A2 (sadece görev adı "Goethe A2 ·" ile başlıyorsa): A1'deki iki kural burada da geçerli (basit ama doğru cümleyi güzelleştirme; Konjunktiv II, Passiv, Genitiv önerme). weil/dass/wenn, Perfekt ve modal fiil hatalarını mutlaka işaretle. Kısa mesajda "Bis gleich!" kapanışı ve özne düşmesi ("Komme später.") doğrudur.
- Sonra düzeltilmiş metnin tamamını ver.
- SADECE şu biçimde JSON ile cevap ver:
{"fehler":[{"original":"...","korrektur":"...","erklaerung":"..."}],"korrigierter_text":"..."}
- Her maddede üç alan da zorunludur: original, korrektur VE erklaerung (Türkçe açıklama). erklaerung'u asla boş bırakma ya da atlama.
- korrektur'da "..." ya da "…" kullanma; düzeltilmiş ifadeyi tam yaz. Ayrılabilen fiilde original'e fiilden ayrılan ekin geleceği yere kadar olan parçayı al ("Ich ankomme erst am Samstag" → "Ich komme erst am Samstag an").
- Hata yoksa: {"fehler":[],"korrigierter_text":"<metnin aslı>"}`;

const EXAM_NAMES = { goethe: 'Goethe', telc: 'telc', testdaf: 'TestDaF', dtz: 'DTZ', osd: 'ÖSD' };
// Set dosyasındaki textType → yapay zekâya giden "Metin türü" satırı (talimattaki kurallarla aynı adlar).
export const TEXT_TYPES = {
  'email-informal': 'Gayriresmî e-posta (du), arkadaşa',
  sms: 'Kısa mesaj (du), arkadaşa',
  'email-semiformal': 'Yarı resmî e-posta (Sie), tanıdık birine',
  'email-formal': 'Resmî yazı (Sie), tanımadığın birine ya da bir kuruma',
  forum: 'Forum yazısı (görüş)'
};

// ---------- Firestore REST değerleri ----------
export function decode(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  return null;
}
const decodeFields = (fields) => Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, decode(v)]));
export function encode(value) {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, encode(v)])) } };
}

// ---------- Yardımcılar ----------
export function berlinDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

// Model yanıtındaki JSON'u ayıklar ve denetler: yanlış kısım metinde aynen geçmeli, düzeltme farklı olmalı.
// Hitaptan sonra küçük harfle başlaması gereken sık kelimeler (isim olamazlar).
const LOWER_AFTER_GREETING = new Set(['danke', 'vielen', 'herzlichen', 'ich', 'wir', 'du', 'es', 'er', 'man', 'wie', 'was', 'wann', 'wo',
  'leider', 'gern', 'gerne', 'endlich', 'gestern', 'heute', 'hier', 'jetzt', 'bitte', 'entschuldige', 'entschuldigen', 'schön', 'toll', 'super',
  'ach', 'oh', 'na', 'ja', 'nein', 'natürlich', 'zuerst', 'seit', 'am', 'im', 'in', 'mit', 'nach', 'vor', 'zum', 'zur', 'für', 'das', 'die', 'der',
  'ein', 'eine', 'mein', 'meine', 'unser', 'unsere', 'dein', 'deine', 'hast', 'habe', 'bist', 'bin', 'kannst', 'können', 'könnten', 'möchte', 'ist',
  'sind', 'war', 'wollte', 'darf']); // sie, ihr, ihre yok: Sie, Ihr, Ihre (nezaket) büyük yazılır
// Mektupta du, dich, dir, dein … büyük ya da küçük yazılabilir (Du/du): sadece bu harfi değiştiren öneri atılır.
const DU_WORD = /^(du|dich|dir|dein|deine|deinen|deinem|deiner|deines|euch|euer|eure|euren|eurem|eurer)$/i;
const onlyDuCase = (original, korrektur) => original !== korrektur && original.toLowerCase() === korrektur.toLowerCase()
  && original.split(/\s+/).every((word, i) => { const other = korrektur.split(/\s+/)[i]; return word === other || DU_WORD.test(word.replace(/[.,!?;:]+$/, '')); });
const DU_TO_SIE = (original, korrektur) => /\b(du|dich|dir|dein\w*|kannst|hast|bist|willst|möchtest)\b/i.test(original)
  && /\b(Sie|Ihnen|Ihr\w*)\b/.test(korrektur) && !/\b(du|dich|dir|dein\w*)\b/i.test(korrektur);
// Kapanış selamına virgül ekleyen ya da silen öneri (Bis bald → Bis bald,): kapanıştan sonra virgül gelmez; atılır.
const CLOSING = /^(bis bald|bis gleich|bis später|bis morgen|viele grüße|liebe grüße|herzliche grüße|beste grüße|mit freundlichen grüßen|freundliche grüße|gruß|grüße|lg)$/i;
const onlyClosingComma = (original, korrektur) => CLOSING.test(original.replace(/[,.!]+$/, '').trim()) && original.replace(/[,.!\s]+$/, '') === korrektur.replace(/[,.!\s]+$/, '');
// teilnehmen an + Dativ: "an den Ausflug teilnehmen / nehme an den Ausflug teil", "an die Prüfung teilnehmen" yanlış.
// Model bu kuralı sık kaçırıyor; kesin kuralla eklenir. "an den Kursen" (Dativ çoğul, -n) ve n ile biten isimler atlanır.
const TEILNEHMEN = /\ban (den|die|das) ((?:\p{Ll}+ )?\p{Lu}\p{L}*) (?:\p{L}+ ){0,3}?(teilnehmen|teilzunehmen|teilgenommen|teil)\b/gu;
function teilnehmenItems(text) {
  const out = [];
  for (const m of text.matchAll(TEILNEHMEN)) {
    const [, article, phrase] = m;
    const noun = phrase.split(' ').pop();
    if (article === 'den' && /n$/.test(noun)) continue;
    const fixed = { den: 'dem', das: 'dem', die: 'der' }[article];
    const adj = phrase.includes(' ') ? phrase.split(' ')[0].replace(/e$/, 'en') + ' ' + noun : noun;
    out.push({ original: `an ${article} ${phrase}`, korrektur: `an ${fixed} ${adj}`,
      erklaerung: 'teilnehmen an + Dativ (-e hâli): an dem (am) / an der … teilnehmen; Akkusativ (an den / an die) yanlış.' });
  }
  return out;
}
export function cleanResult(raw, text) {
  const s = String(raw || '');
  const from = s.indexOf('{'), to = s.lastIndexOf('}');
  if (from < 0 || to <= from) return null;
  let data;
  // Model ara sıra anahtardan sonra iki noktayı unutuyor ("erklaerung "'danken' …); bu tek yazım hatası onarılır.
  const body = s.slice(from, to + 1);
  try { data = JSON.parse(body); }
  catch (_) {
    try { data = JSON.parse(body.replace(/"(original|korrektur|erklaerung|fehler|korrigierter_text)\s+"(?!\s*:)/g, '"$1":"')); } catch (__) { return null; }
  }
  const list = Array.isArray(data?.fehler) ? data.fehler : null;
  if (!list) return null;
  const seen = new Set();
  const errors = [];
  // Hitap virgülle bitiyorsa sonraki satır küçük harfle başlar (Liebe Lena, / wie geht …). Model bazen bunu "düzeltip"
  // büyük harfe çeviriyor; doğru olanı bozan bu öneri atılır.
  // İlk satır "Betreff: …" ise (telc B1) hitap ikinci satırdadır.
  const lines = text.split('\n');
  const g = /^\s*Betreff\s*:/i.test(lines[0] || '') ? 1 : 0;
  const afterGreeting = /,\s*$/.test(lines[g] || '') ? (lines[g + 1] || '').trimStart() : '';
  const capitalizesAfterGreeting = (original, korrektur) => afterGreeting && /^\p{Ll}/u.test(original) && afterGreeting.startsWith(original)
    && korrektur === original.charAt(0).toUpperCase() + original.slice(1);
  for (const item of list) {
    const original = typeof item?.original === 'string' ? item.original.trim() : '';
    const korrektur = typeof item?.korrektur === 'string' ? item.korrektur.trim() : '';
    let erklaerung = typeof item?.erklaerung === 'string' ? item.erklaerung.trim() : '';
    // Model bazen açıklamayı atlıyor. du → Sie düzeltmesinde (resmiyet) açıklama kesin olarak bilindiği için eklenir;
    // başka açıklamasız maddeler (aşağıda) yine atılır.
    if (!erklaerung && DU_TO_SIE(original, korrektur)) erklaerung = 'Bu kişiye Sie ile yazılır: du yerine Sie, dir/dich yerine Ihnen/Sie, dein yerine Ihr kullanılır.';
    if (!original || !korrektur || !erklaerung || original === korrektur || !text.includes(original) || seen.has(original)) continue;
    if (capitalizesAfterGreeting(original, korrektur)) continue;
    if (onlyDuCase(original, korrektur)) continue;
    if (onlyClosingComma(original, korrektur)) continue;
    // Model bazen bir maddeyi yazıp açıklamasında "bu bir hata değildir / hata sayılmaz" diyor; öyle maddeler gösterilmez.
    if (/hata (değil|sayılmaz)/i.test(erklaerung)) continue;
    seen.add(original);
    errors.push({ original: original.slice(0, 300), korrektur: korrektur.slice(0, 300), erklaerung: erklaerung.slice(0, 600) });
    if (errors.length >= 30) break;
  }
  // Hitaptan sonraki satır büyük harfle başlıyorsa ve ilk kelime isim olamayacak sık bir kelimeyse (danke, ich, leider …)
  // model kaçırsa bile kesin kuralla eklenir. İsim, özel ad ve Sie/Ihnen/Ihr burada yoktur, onlara dokunulmaz.
  const first = (afterGreeting.match(/^\p{L}+/u) || [''])[0];
  if (first && /^\p{Lu}/u.test(first) && LOWER_AFTER_GREETING.has(first.toLowerCase()) && !seen.has(first)) {
    const lower = first.charAt(0).toLowerCase() + first.slice(1);
    const note = 'Hitap virgülle bittiği için sonraki satır küçük harfle başlar (isimler ve Sie hariç).';
    // Model satırın başını başka bir hata için zaten düzeltmiş ama büyük harfi bırakmışsa (Es tut mir leid, aber … →
    // Es tut mir leid, aber …) aynı maddenin düzeltmesi küçük harfle başlatılır; yoksa ayrı madde eklenir.
    const same = errors.find((e) => afterGreeting.startsWith(e.original) && e.original.startsWith(first));
    if (same) {
      if (same.korrektur.startsWith(first)) {
        same.korrektur = lower + same.korrektur.slice(first.length);
        same.erklaerung = `${same.erklaerung} ${note}`.slice(0, 600);
      }
    } else if (errors.length < 30) errors.unshift({ original: first, korrektur: lower, erklaerung: note });
  }
  for (const item of teilnehmenItems(text)) {
    if (errors.length >= 30 || errors.some((e) => e.original.includes(item.original) || item.original.includes(e.original))) continue;
    errors.push(item);
  }
  const corrected = typeof data.korrigierter_text === 'string' ? data.korrigierter_text.slice(0, 6000) : '';
  return { errors, correctedText: corrected, model: MODEL };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } });
}
function cors(origin) {
  return origin ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' } : {};
}

// ---------- Firebase ----------
// API anahtarı Google Cloud'da web sitesi (HTTP referrer) ile kısıtlanmışsa istek sitenin adresinden geliyormuş gibi gönderilir.
const authHeaders = (env) => ({ 'Content-Type': 'application/json', ...(env.SITE_URL ? { Referer: `${env.SITE_URL.replace(/\/$/, '')}/` } : {}) });
let botToken = null; // { token, until }
async function botSignIn(env) {
  if (botToken && botToken.until > Date.now() + 60000) return botToken.token;
  const base = env.AUTH_BASE || 'https://identitytoolkit.googleapis.com';
  const r = await fetch(`${base}/v1/accounts:signInWithPassword?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: 'POST', headers: authHeaders(env),
    body: JSON.stringify({ email: env.AI_EMAIL, password: env.AI_PASSWORD, returnSecureToken: true })
  });
  if (!r.ok) throw new Error(`bot sign-in ${r.status}`);
  const d = await r.json();
  botToken = { token: d.idToken, until: Date.now() + Number(d.expiresIn || 3600) * 1000 };
  return botToken.token;
}
export function resetBotToken() { botToken = null; }

async function studentUid(env, idToken) {
  const base = env.AUTH_BASE || 'https://identitytoolkit.googleapis.com';
  const r = await fetch(`${base}/v1/accounts:lookup?key=${encodeURIComponent(env.FIREBASE_API_KEY)}`, {
    method: 'POST', headers: authHeaders(env), body: JSON.stringify({ idToken })
  });
  if (!r.ok) return null;
  const d = await r.json();
  return d?.users?.[0]?.localId || null;
}

function db(env, token) {
  const root = `${env.FIRESTORE_BASE || 'https://firestore.googleapis.com'}/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  return {
    name: (path) => `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`,
    async get(path) {
      const r = await fetch(`${root}/${path}`, { headers });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`get ${path} ${r.status}`);
      const d = await r.json();
      return { data: decodeFields(d.fields), updateTime: d.updateTime };
    },
    async commit(writes) {
      const r = await fetch(`${root}:commit`, { method: 'POST', headers, body: JSON.stringify({ writes }) });
      if (!r.ok) { const e = new Error(`commit ${r.status}`); e.status = r.status; e.body = await r.text(); throw e; }
      return r.json();
    }
  };
}

// Görev adı ve metin türü sitedeki set dosyasından okunur: "Goethe B1 · Teil 1 · Neue Wohnung", textType.
async function taskInfo(env, w) {
  const ok = [w.exam, w.level, w.set].every((v) => typeof v === 'string' && /^[a-z0-9-]{1,20}$/.test(v)) && Number.isInteger(w.teil);
  const fallback = { name: `${EXAM_NAMES[w.exam] || 'Sınav'} ${String(w.level || '').toUpperCase()} · Teil ${w.teil}`, type: null };
  if (!ok || !env.SITE_URL) return fallback;
  try {
    const r = await fetch(`${env.SITE_URL.replace(/\/$/, '')}/data/exams/${w.exam}/${w.level}/schreiben/teil-${w.teil}/${w.set}.json`);
    if (!r.ok) return fallback;
    const set = await r.json();
    return {
      name: typeof set.title === 'string' ? `${fallback.name} · ${set.title.slice(0, 80)}` : fallback.name,
      type: TEXT_TYPES[set.textType] || null
    };
  } catch (_) { return fallback; }
}

// Yapay zekâya giden kullanıcı mesajı: sadece görev adı, metin türü ve metin (ad, e-posta, uid yok).
// Seviyeye özel notlar genel talimata (PROMPT) değil, sadece o sınavın kullanıcı mesajına eklenir: talimata eklenen her
// seviye satırı öbür sınavların sonuçlarını da değiştirdi (A2 ve B2 satırları DTZ'de bir fiil yeri hatasını kaçırttı, 15 ve 18 Kasım).
export const LEVEL_NOTES = {
  'Goethe B2 ·': 'Seviye notu (B2): Konjunktiv II, Passiv, Relativsatz, Nominalisierung ve bağlaç (einerseits … andererseits, darüber hinaus, trotzdem, je … desto) hatalarını da işaretle. Teil 2\'de amire ya da iş arkadaşına baştan sona Sie.'
};
const levelNote = (name) => Object.entries(LEVEL_NOTES).find(([prefix]) => String(name).startsWith(prefix))?.[1];
export const userMessage = (task, text) => {
  const note = levelNote(task.name);
  return `Görev: ${task.name}\n${task.type ? `Metin türü: ${task.type}\n` : ''}${note ? `${note}\n` : ''}Metin:\n${text}`;
};

// Hesap açık mı ve yapay zekâ kontrolüne izin var mı: 16 yaş altında veli onayı VE ayrı yapay zekâ onayı gerekir.
// Veli yapay zekâ onayının sürümü: 2 = "geri bildirim öğretmen onayı olmadan doğrudan öğrenciye gösterilir" (docs/veli-onay-formu.md).
export const AI_CONSENT_VERSION = 2;
// 16 yaş altında doğrudan gösterim sadece yeni formla alınmış onayla; yoksa taslak öğretmene gider.
export const directAllowed = (profile) => profile?.minor === false || Number(profile?.aiConsent?.version) >= AI_CONSENT_VERSION;

export function aiAllowed(profile) {
  if (!profile || profile.status !== 'active') return false;
  if (profile.minor === false) return profile.aiConsent?.given !== false;
  return profile.parentConsent?.given === true && profile.aiConsent?.given === true;
}

async function runModel(env, task, text) {
  const result = await env.AI.run(MODEL, {
    messages: [{ role: 'system', content: PROMPT }, { role: 'user', content: userMessage(task, text) }],
    max_tokens: 1500, temperature: 0.2, chat_template_kwargs: { enable_thinking: false }
  });
  return typeof result?.response === 'string' ? result.response
    : result?.choices?.[0]?.message?.content || (typeof result === 'string' ? result : JSON.stringify(result?.response || ''));
}

// ---------- Ödev e-postası (POST /odev-bildirim) ----------
// Öğretmen ödev verince (ya da düzenleyip "değişikliği bildir" deyince) tarayıcı sadece ödev kopyalarının kimliklerini
// gönderir: { kind: 'new' | 'update', items: [{ uid, id }] }. Worker e-posta adresine ya da metne tarayıcıdan güvenmez:
//  1. belirteç Firebase Auth'a sorulur (accounts:lookup); TEACHER_UID değilse 401;
//  2. öğretmenin KENDİ belirteciyle Firestore'dan okunur: users/{uid} (aktif mi, homeworkMail, lang, 16 yaş altıysa veli
//     ve "veliyi de ekle" anahtarı inviteParent), users/{uid}/assignments/{id} (sadece başlık ve teslim tarihi), mailLimits/_global;
//  3. Brevo transactional API ile info@bozkurtacademy.com adına gönderilir (yanıt adresi info@): ödevin başlığı, varsa
//     teslim tarihi ve "Ödevlerim" bağlantısı. Ödevin içeriği, notlar, bağlantılar ya da öğrencinin adı e-postaya girmez;
//  4. ödev kopyasına mailNewAt / mailUpdateAt yazılır: "yeni ödev" bir kez gider; "güncellendi" Berlin gününde en fazla bir
//     kez ve aynı gün "yeni ödev" gitmediyse (ödev başına günde en fazla bir e-posta);
//  5. site genelinde günde en fazla MAIL_DAILY_LIMIT (100) e-posta (veliye giden de sayılır; Brevo ücretsiz planı 300);
//  6. açılma/tıklama takibi yapılmaz: her alıcıda contactPixelTrackingConsent: false (docs/odev-eposta-kurulum.md).
export const MAIL_LIMIT_DEFAULT = 100;
export const MAIL_MAX_ITEMS = 50;
const MAIL_LANGS = ['tr', 'de', 'en'];
const LOCALES = { tr: 'tr-TR', de: 'de-DE', en: 'en-GB' };
const MAIL_TEXT = {
  tr: {
    subject: { new: 'Yeni ödev: {title}', update: 'Ödev güncellendi: {title}' },
    hello: 'Merhaba,',
    student: { new: "Bozkurt Academy'de sana yeni bir ödev verildi:", update: "Bozkurt Academy'deki ödevin güncellendi:" },
    parent: { new: "Bozkurt Academy'de öğrencinize yeni bir ödev verildi:", update: "Bozkurt Academy'de öğrencinizin ödevi güncellendi:" },
    due: 'Teslim: {due} (Berlin saati)',
    link: { student: 'Ödevini görmek için:', parent: 'Öğrenci ödevi kendi hesabıyla bu sayfada görür:' },
    button: { student: 'Ödevlerim', parent: 'Ödevler sayfası' },
    why: {
      student: 'Bu e-postayı öğretmenin sana ödev verdiği için aldın. Sorularını bu e-postayı yanıtlayarak sorabilirsin.',
      parent: 'Bu e-postayı, öğrencinin ders bildirimlerinde veli olarak kayıtlı olduğunuz için aldınız. Sorularınızı bu e-postayı yanıtlayarak sorabilirsiniz.'
    }
  },
  de: {
    subject: { new: 'Neue Hausaufgabe: {title}', update: 'Hausaufgabe geändert: {title}' },
    hello: { student: 'Hallo,', parent: 'Guten Tag,' },
    student: { new: 'Du hast bei Bozkurt Academy eine neue Hausaufgabe bekommen:', update: 'Deine Hausaufgabe bei Bozkurt Academy wurde geändert:' },
    parent: { new: 'Ihr Kind hat bei Bozkurt Academy eine neue Hausaufgabe bekommen:', update: 'Die Hausaufgabe Ihres Kindes bei Bozkurt Academy wurde geändert:' },
    due: 'Abgabe: {due} (Berliner Zeit)',
    link: { student: 'Hier siehst du deine Hausaufgaben:', parent: 'Ihr Kind sieht die Aufgabe mit dem eigenen Konto auf dieser Seite:' },
    button: { student: 'Meine Hausaufgaben', parent: 'Hausaufgaben' },
    why: {
      student: 'Du bekommst diese E-Mail, weil dein Lehrer dir eine Hausaufgabe gegeben hat. Bei Fragen antworte einfach auf diese E-Mail.',
      parent: 'Sie erhalten diese E-Mail, weil Sie für die Unterrichtsbenachrichtigungen Ihres Kindes als Elternteil eingetragen sind. Bei Fragen antworten Sie einfach auf diese E-Mail.'
    }
  },
  en: {
    subject: { new: 'New homework: {title}', update: 'Homework updated: {title}' },
    hello: 'Hello,',
    student: { new: 'You have a new homework assignment at Bozkurt Academy:', update: 'Your homework at Bozkurt Academy has been updated:' },
    parent: { new: 'Your child has a new homework assignment at Bozkurt Academy:', update: "Your child's homework at Bozkurt Academy has been updated:" },
    due: 'Due: {due} (Berlin time)',
    link: { student: 'See your homework here:', parent: 'Your child can see the assignment with their own account on this page:' },
    button: { student: 'My homework', parent: 'Homework page' },
    why: {
      student: 'You are receiving this email because your teacher gave you homework. If you have questions, just reply to this email.',
      parent: "You are receiving this email because you are registered as a parent for your child's lesson notifications. If you have questions, just reply to this email."
    }
  }
};

const escapeHtml = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const oneLine = (v) => String(v || '').replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
const validEmail = (v) => typeof v === 'string' && v.length <= 254 && /^[^@\s<>"',;]+@[^@\s<>"',;]+\.[^@\s<>"',;]+$/.test(v);

export function formatDue(value, lang) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALES[lang] || LOCALES.tr, { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
}

// E-postanın konusu, düz metni ve HTML'i. Sadece başlık, teslim tarihi ve bağlantı; değerler HTML'de kaçışlanır.
export function homeworkMail({ lang, role, kind, title, due, url }) {
  const L = MAIL_TEXT[MAIL_LANGS.includes(lang) ? lang : 'tr'];
  const pick = (v) => (typeof v === 'string' ? v : v[role]);
  const t = oneLine(title) || '—';
  const dueText = due ? L.due.replace('{due}', due) : '';
  const subject = L.subject[kind].replace('{title}', t);
  const lines = [pick(L.hello), '', L[role][kind], t, ...(dueText ? [dueText] : []), '', `${L.link[role]} ${url}`, '', L.why[role], '', 'Bozkurt Academy'];
  const html = `<!doctype html><html lang="${escapeHtml(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>`
    + '<body style="margin:0;padding:24px 12px;background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;color:#2a2a26">'
    + '<div style="max-width:520px;margin:0 auto;background:#ffffff;border:2px solid #d3cbb9;border-radius:14px;padding:24px">'
    + `<p style="margin:0 0 12px">${escapeHtml(pick(L.hello))}</p>`
    + `<p style="margin:0 0 6px">${escapeHtml(L[role][kind])}</p>`
    + `<p style="margin:0 0 6px;font-size:20px;font-weight:bold">${escapeHtml(t)}</p>`
    + (dueText ? `<p style="margin:0 0 16px;color:#55534a">${escapeHtml(dueText)}</p>` : '<p style="margin:0 0 16px"></p>')
    + `<p style="margin:0 0 8px">${escapeHtml(L.link[role])}</p>`
    + `<p style="margin:0 0 20px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#45572f;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">${escapeHtml(L.button[role])}</a></p>`
    + `<p style="margin:0 0 4px;font-size:13px;color:#55534a">${escapeHtml(url)}</p>`
    + `<p style="margin:16px 0 0;font-size:13px;color:#55534a">${escapeHtml(L.why[role])}</p>`
    + '<p style="margin:16px 0 0;font-size:13px;color:#55534a">Bozkurt Academy</p>'
    + '</div></body></html>';
  return { subject, text: lines.join('\n'), html };
}

// Alıcılar: öğrenci; 16 yaş altıysa ve "veliyi de ekle" açıksa (ders davetleriyle aynı anahtar) veli de.
export function mailRecipients(profile) {
  const list = [];
  if (validEmail(profile?.email)) list.push({ email: profile.email, role: 'student' });
  const parent = profile?.parent?.email;
  if (profile?.minor === true && profile?.inviteParent !== false && validEmail(parent)
    && !list.some((r) => r.email.toLowerCase() === parent.toLowerCase())) list.push({ email: parent, role: 'parent' });
  return list;
}

async function teacherUid(env, idToken) {
  const uid = await studentUid(env, idToken);
  return uid && env.TEACHER_UID && uid === env.TEACHER_UID ? uid : null;
}

async function sendBrevo(env, { to, subject, text, html }) {
  const from = env.MAIL_FROM || 'info@bozkurtacademy.com';
  const r = await fetch(`${env.BREVO_BASE || 'https://api.brevo.com'}/v3/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Bozkurt Academy', email: from }, replyTo: { email: from, name: 'Bozkurt Academy' },
      // Açılma/tıklama takibi yok: alıcı başına izin "yok" (Brevo → Settings → Contacts → "Per-contact pixel tracking consent").
      to: [{ email: to, contactPixelTrackingConsent: false }], subject, textContent: text, htmlContent: html, tags: ['odev']
    })
  });
  if (!r.ok) throw new Error(`brevo ${r.status}`);
}

async function handleHomeworkMail(request, env, okOrigin) {
  let body;
  try { body = await request.json(); } catch (_) { return json({ status: 'bad-request' }, 400, okOrigin); }
  const kind = body?.kind;
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!['new', 'update'].includes(kind) || !items || !items.length || items.length > MAIL_MAX_ITEMS
    || !items.every((i) => /^[A-Za-z0-9]{1,128}$/.test(i?.uid || '') && /^[A-Za-z0-9]{1,40}$/.test(i?.id || ''))) {
    return json({ status: 'bad-request' }, 400, okOrigin);
  }
  const idToken = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!idToken) return json({ status: 'unauthorized' }, 401, okOrigin);
  if (!env.BREVO_API_KEY || !env.TEACHER_UID) return json({ status: 'not-configured' }, 503, okOrigin);
  try {
    if (!(await teacherUid(env, idToken))) return json({ status: 'unauthorized' }, 401, okOrigin);
    const store = db(env, idToken);
    const day = berlinDay();
    const max = Number(env.MAIL_DAILY_LIMIT) > 0 ? Number(env.MAIL_DAILY_LIMIT) : MAIL_LIMIT_DEFAULT;
    let limitDoc = await store.get('mailLimits/_global');
    const startCount = limitDoc?.data?.day === day ? Number(limitDoc.data.count) || 0 : 0;
    let sentCount = 0;
    const site = (env.SITE_URL || 'https://bozkurtacademy.com').replace(/\/$/, '');
    const field = kind === 'new' ? 'mailNewAt' : 'mailUpdateAt';
    const results = [];
    const seen = new Set();
    for (const { uid, id } of items) {
      const key = `${uid}/${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const result = { uid, id, status: 'error', recipients: 0 };
      results.push(result);
      try {
        const [profileDoc, assignmentDoc] = await Promise.all([store.get(`users/${uid}`), store.get(`users/${uid}/assignments/${id}`)]);
        const profile = profileDoc?.data;
        const a = assignmentDoc?.data;
        if (!profile || !a) { result.status = 'not-found'; continue; }
        if (profile.status !== 'active') { result.status = 'inactive'; continue; }
        if (profile.homeworkMail === false) { result.status = 'off'; continue; }
        // "Yeni ödev" bir kez; "güncellendi" ödev başına günde bir kez (aynı gün "yeni ödev" gittiyse o da sayılır).
        const sameDay = (v) => Boolean(v) && berlinDay(new Date(v)) === day;
        if (kind === 'new' ? Boolean(a.mailNewAt) : (sameDay(a.mailUpdateAt) || sameDay(a.mailNewAt))) { result.status = 'already'; continue; }
        const recipients = mailRecipients(profile);
        if (!recipients.length) { result.status = 'no-email'; continue; }
        if (startCount + sentCount + recipients.length > max) { result.status = 'limit'; continue; }
        const lang = MAIL_LANGS.includes(profile.lang) ? profile.lang : 'tr';
        const url = `${site}/odevlerim.html#odev-${encodeURIComponent(id)}`;
        let studentSent = false;
        for (const r of recipients) {
          const mail = homeworkMail({ lang, role: r.role, kind, title: a.title, due: formatDue(a.dueAt, lang), url });
          try {
            await sendBrevo(env, { to: r.email, ...mail });
            sentCount += 1;
            result.recipients += 1;
            if (r.role === 'student') studentSent = true;
          } catch (error) {
            console.error('mail', String(error));
            if (r.role === 'parent') result.parentError = true;
          }
        }
        if (!studentSent) { result.status = 'error'; continue; }
        await store.commit([{
          transform: { document: store.name(`users/${uid}/assignments/${id}`), fieldTransforms: [{ fieldPath: field, setToServerValue: 'REQUEST_TIME' }] },
          currentDocument: { exists: true }
        }]).catch((error) => console.error('mark', String(error)));
        result.status = 'sent';
      } catch (error) {
        console.error('item', String(error));
      }
    }
    // Günlük sayaç: bu arada başka bir istek yazdıysa yeniden okunup üstüne eklenir.
    for (let attempt = 0; sentCount && attempt < 3; attempt++) {
      const base = limitDoc?.data?.day === day ? Number(limitDoc.data.count) || 0 : 0;
      try {
        await store.commit([{
          update: { name: store.name('mailLimits/_global'), fields: { day: encode(day), count: encode(base + sentCount) } },
          updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: limitDoc ? { updateTime: limitDoc.updateTime } : { exists: false }
        }]);
        break;
      } catch (error) {
        limitDoc = await store.get('mailLimits/_global');
      }
    }
    return json({ status: 'ok', results, sent: sentCount, count: startCount + sentCount, limit: max }, 200, okOrigin);
  } catch (error) {
    console.error(String(error));
    return json({ status: 'error' }, 500, okOrigin);
  }
}

// ---------- İstek ----------
export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');
    const okOrigin = origin && allowed.includes(origin) ? origin : null;
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: okOrigin ? 204 : 403, headers: cors(okOrigin) });
    if ((url.pathname !== '/check' && url.pathname !== '/odev-bildirim') || request.method !== 'POST') return json({ status: 'not-found' }, 404, okOrigin);
    if (!okOrigin) return json({ status: 'forbidden' }, 403, null);
    if (url.pathname === '/odev-bildirim') return handleHomeworkMail(request, env, okOrigin);

    let body;
    try { body = await request.json(); } catch (_) { return json({ status: 'bad-request' }, 400, okOrigin); }
    const writingId = body?.writingId;
    if (typeof writingId !== 'string' || !/^[A-Za-z0-9]{10,40}$/.test(writingId)) return json({ status: 'bad-request' }, 400, okOrigin);
    const idToken = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!idToken) return json({ status: 'unauthorized' }, 401, okOrigin);

    try {
      const uid = await studentUid(env, idToken);
      if (!uid || !/^[A-Za-z0-9]{1,128}$/.test(uid)) return json({ status: 'unauthorized' }, 401, okOrigin);
      const store = db(env, await botSignIn(env));

      const settings = await store.get('settings/ai');
      if (settings?.data?.mode !== 'draft' && settings?.data?.mode !== 'instant') return json({ status: 'off' }, 200, okOrigin);

      const settingsMode = settings.data.mode;
      const profile = await store.get(`users/${uid}`);
      const writing = await store.get(`users/${uid}/writings/${writingId}`);
      if (!writing) return json({ status: 'not-found' }, 404, okOrigin);
      const w = writing.data;
      if (typeof w.text !== 'string' || !w.text.trim()) return json({ status: 'bad-request' }, 400, okOrigin);
      if (w.aiAt) return json({ status: 'exists', ...(w.aiFeedback ? { feedback: w.aiFeedback } : {}) }, 200, okOrigin);
      // Kontrol yapılamadı: nedeni metne bir kez yazılır (öğretmen panelindeki sayaç ve açıklama için). Yazılamazsa akış bozulmaz.
      const skip = async (reason) => {
        if (w.aiSkip) return;
        try {
          await store.commit([{
            update: { name: store.name(`users/${uid}/writings/${writingId}`), fields: { aiSkip: encode(reason) } },
            updateMask: { fieldPaths: ['aiSkip'] }, currentDocument: { updateTime: writing.updateTime }
          }]);
        } catch (error) { console.error('skip', String(error)); }
      };
      if (!aiAllowed(profile?.data)) { await skip('consent'); return json({ status: 'not-allowed' }, 200, okOrigin); }
      const mode = settingsMode === 'instant' && !directAllowed(profile.data) ? 'draft' : settingsMode;

      const day = berlinDay();
      const [mine, all] = await Promise.all([store.get(`aiLimits/${uid}`), store.get('aiLimits/_global')]);
      const count = (doc) => (doc?.data?.day === day ? Number(doc.data.count) || 0 : 0);
      if (count(mine) >= LIMIT_STUDENT || count(all) >= LIMIT_GLOBAL) {
        await skip('limit');
        return json({ status: 'limit', scope: count(mine) >= LIMIT_STUDENT ? 'student' : 'site' }, 200, okOrigin);
      }

      // Model ara sıra okunamayan (JSON olmayan) bir cevap veriyor; o zaman bir kez daha sorulur (ücretsiz kotadan, ücret yok).
      let result = null;
      try {
        const task = await taskInfo(env, w);
        for (let attempt = 0; attempt < 2 && !result; attempt++) result = cleanResult(await runModel(env, task, w.text), w.text);
      } catch (error) { console.error('model', String(error)); await skip('error'); return json({ status: 'unavailable' }, 503, okOrigin); }

      const limitWrite = (path, doc, n) => ({
        update: { name: store.name(path), fields: { day: encode(day), count: encode(n) } },
        updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
        currentDocument: doc ? { updateTime: doc.updateTime } : { exists: false }
      });
      const writes = [limitWrite(`aiLimits/${uid}`, mine, count(mine) + 1), limitWrite('aiLimits/_global', all, count(all) + 1)];
      if (result && mode === 'draft') {
        writes.push({
          update: { name: store.name(`aiDrafts/${uid}_${writingId}`), fields: {
            uid: encode(uid), writingId: encode(writingId), errors: encode(result.errors), correctedText: encode(result.correctedText), model: encode(result.model)
          } },
          updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { exists: false }
        });
      } else if (result && mode === 'instant') {
        writes.push({
          update: { name: store.name(`users/${uid}/writings/${writingId}`), fields: { aiFeedback: encode(result) } },
          updateMask: { fieldPaths: ['aiFeedback'] },
          updateTransforms: [{ fieldPath: 'aiAt', setToServerValue: 'REQUEST_TIME' }],
          currentDocument: { exists: true }
        });
      }
      try { await store.commit(writes); }
      catch (error) {
        // Aynı metin ikinci kez geldi ya da sayaç bu arada değişti.
        if (error.status === 400 || error.status === 409 || error.status === 412 || error.status === 403) return json({ status: 'busy' }, 409, okOrigin);
        throw error;
      }
      if (!result) { await skip('error'); return json({ status: 'no-result' }, 200, okOrigin); }
      return json({ status: mode, ...(mode === 'instant' ? { feedback: result } : {}) }, 200, okOrigin);
    } catch (error) {
      console.error(String(error));
      return json({ status: 'error' }, 500, okOrigin);
    }
  }
};
