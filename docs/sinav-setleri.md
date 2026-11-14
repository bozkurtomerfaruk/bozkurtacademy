# Sınav setleri: dosya formatı

Sınav Hazırlığı bölümündeki görevler (ör. Goethe B1 Lesen) birer JSON dosyasıdır. `js/exam-task.js` bu dosyaları oynatır, `scripts/check-exams.mjs` kontrol eder.

## 1. Dosyanın yeri ve examsData.js kaydı

```
data/exams/<sınav>/<seviye>/<bölüm>/teil-<n>/<set>.json
data/exams/goethe/b1/lesen/teil-1/set-1.json
```

`js/examsData.js` içinde ilgili Teil'in `exercises` dizisine ekleyin:

```js
{
  title: { tr: 'Blog yazısı veya e-posta · richtig/falsch', de: '…', en: '…' },  // isteğe bağlı
  exercises: [
    { set: 'set-1', title: 'Neu im Dorf' },
    { set: 'set-2', title: 'Ferien im Tierheim' }
  ]
}, // Teil 1
```

Set şu adresten açılır: `#exams/goethe/b1/lesen/1/set-1`. DTZ gibi seviye adımı olmayan sınavlarda seviye klasörü yine yazılır (`data/exams/dtz/a2-b1/lesen/teil-1/set-1.json`), adreste görünmez (`#exams/dtz/lesen/1/set-1`).

## 2. Dosyanın içi

```json
{
  "format": 1,
  "exam": "goethe", "level": "b1", "section": "lesen", "teil": 1, "set": "set-1",
  "title": "Neu im Dorf",
  "minutes": 10,
  "context": "İsteğe bağlı giriş cümlesi (Almanca).",
  "instructions": "Lesen Sie den Text und die Aufgaben 1 bis 6. …",
  "groups": [ { … }, { … } ]
}
```

- `exam`, `level`, `section`, `teil`, `set`: dosyanın klasörüyle aynı olmalı.
- `minutes`: tahmini süre (dakika), ekranda gösterilir.
- `groups`: Bir grup, yan yana gösterilen metin(ler) ve sorulardır. Teil 2'de her haberin kendi sorularıyla iki grup vardır; diğer Teil'lerde tek grup.

### Grup

```json
{
  "layout": "article",
  "question": "Ist die Person für …?",
  "texts": [ … ],
  "questions": [ … ]
}
```

- `layout`: `article` (normal metin), `ads` (ilanlar, iki sütun), `comments` (okur yorumları), `gaps` (önce boşluklu metin, altında yerleştirilecek kısa cümleler/başlıklar listesi).
- `question`: yalnızca Teil 4 gibi bütün soruların aynı olduğu durumlarda, soruların üstünde gösterilir.
- `none`: eşleştirmede „uygun ilan yok“ seçeneğinin adı. Yazılmazsa `0` (Goethe B1); Goethe A2 Teil 4'te `"x"` (ekranda X); böyle bir seçenek yoksa `false` (Goethe B2). Cevap anahtarında da aynı değer kullanılır (`"answer": "x"`).
- Eşleştirmede seçenekler yalnızca `label`'ı olan metinlerdir; `label`'sız metinler (ör. boşluklu makale, başlığı aranan bölümler) okunacak metindir.
- Kelime listesiyle boşluk (telc Sprachbausteine Teil 2): Boşluklu metin `label`'sız, listedeki her kelime `label`'lı ayrı bir metindir (başlıksız, tek paragraf: yalnızca kelime). Sorular `zuordnung`, `"none": false`, `layout` `gaps`. Oynatıcı boşlukta seçilen kelimeyi gösterir.
- İki ilandan birini seçme (Goethe A1 Teil 2): Her soru kendi grubundadır; grupta `label`'ı `a` ve `b` olan iki metin, bir `zuordnung` sorusu ve `"none": false` bulunur, `layout` `ads` olur. Oynatıcı bu soruyu açılır liste yerine a/b düğmeleriyle, metin başlıklarıyla birlikte gösterir. Metin `id`'leri bütün sette tekil olmalı (ör. `q6a`, `q6b`).

### Metin

```json
{
  "id": "blog",
  "label": "a",
  "title": "Mein erstes halbes Jahr auf dem Land",
  "byline": "Lenas Blog",
  "paragraphs": [
    "Birinci paragraf …",
    { "heading": "Ruhezeiten" },
    "Bir sonraki paragraf …"
  ]
}
```

- `id`: grup içinde benzersiz; açıklamalardaki alıntılar buna işaret eder.
- `label`: ilan harfi (a–j) veya yorum numarası (0, 20…). Eşleştirme sorularında zorunludur.
- Boşluklar (Goethe B2 Teil 2, DTZ Teil 5): düz metnin içinde `{{10}}` numaralı bir boşluktur; DTZ Teil 5'te her boşluk bir `abc` sorusudur ve boşlukta seçilen kelime görünür; her boşluk grubun bir sorusuna karşılık gelir (soru numarası = boşluk numarası, `zuordnung`, seçenekler a–h cümleleri). Örnek boşluk `{{0=Örnek cümle.}}` olarak metne yazılır ve dolu gösterilir. Alıntılar boşluk işareti içeremez; boşluğun önündeki veya arkasındaki cümle alıntılanır.
- `paragraphs`: düz metin; `{ "heading": "…" }` ara başlıktır (kurallar, duyurular); `{ "rows": [["3. Stock", "Spielwaren, Bücher"], …] }` bir tablodur (kat rehberi, bilgi panosu, program). Her satırda en az iki hücre olur, ilk hücre satır başlığı olarak gösterilir. Alıntılar (`evidence`) tablo hücrelerinde de aranır; bir alıntı tek bir hücrenin içinde kalmalıdır.

### Soru

```json
{
  "number": 2,
  "type": "richtig-falsch",
  "prompt": "Lena fährt meistens mit dem Bus zur Arbeit.",
  "answer": "falsch",
  "evidence": [{ "text": "blog", "quote": "deshalb fahre ich fast immer mit dem Auto" }],
  "explanation": "Türkçe açıklama: doğru cevabın metnin neresine dayandığı ve çeldiricinin neden yanlış olduğu."
}
```

| `type` | Cevap seçenekleri | `answer` |
|---|---|---|
| `richtig-falsch` | Richtig / Falsch | `richtig` veya `falsch` |
| `ja-nein` | Ja / Nein | `ja` veya `nein` |
| `ja-nein-nichts` | sabit: Ja, Nein, Text sagt dazu nichts (TestDaF) | `ja`, `nein` veya `nichts` |
| `richtig-falsch-nichts` | sabit: Richtig, Falsch, Nicht im Text (telc C1 Hochschule) | `richtig`, `falsch` veya `nichts` |
| `reihenfolge` | `options`: konum numaraları listesi, ör. `["2", "3", "4", "5"]`; her paragraf için bir soru, sayı düğmeleri (TestDaF dijital Aufgabe 2) | listedeki bir numara |
| `fehlerauswahl` | `options`: özetin tüm cümleleri `a`, `b`, `c` … (en az 6), `breaks`: yeni paragrafın başladığı cümle harfleri; özet akan metin olarak gösterilir, öğrenci üç cümle seçer (TestDaF dijital Aufgabe 7) | üç yanlış cümlenin harfleri listesi, ör. `["c", "d", "k"]`; her biri bir puan |
| `abc` | `"options": { "a": "…", "b": "…", "c": "…" }`; dört seçenekli boşluklarda (Goethe C1 Teil 1) `"d"` de eklenir | `a`, `b`, `c` (veya `d`) |
| `zuordnung` | grubun metinlerinin `label`'ları + `0` (veya grubun `none` değeri) | ör. `e`, `0` veya `x` |

- `number`: sınavdaki numara (Teil 1: 1–6, Teil 2: 7–12, Teil 3: 13–19, Teil 4: 20–26, Teil 5: 27–30; Goethe A2: Teil 1: 1–5, Teil 2: 6–10, Teil 3: 11–15, Teil 4: 16–20; Goethe B2: Teil 1: 1–9, Teil 2: 10–15, Teil 3: 16–21, Teil 4: 22–27, Teil 5: 28–30; DTZ Lesen: Teil 1: 21–25, Teil 2: 26–30, Teil 3: 31–36, Teil 4: 37–39, Teil 5: 40–45, çünkü 1–20 Hören'e ait; Goethe A1: Teil 1: 1–5, Teil 2: 6–10, Teil 3: 11–15, her Teil'de örnek 0; Goethe C1: Teil 1: 1–8, Teil 2: 9–15, Teil 3: 16–23, Teil 4: 24–30; TestDaF kâğıt: Lesetext 1: 1–10, Lesetext 2: 11–20, Lesetext 3: 21–30; TestDaF dijital: Aufgabe 1: 1–5, 2: 6–9, 3: 10–16, 4: 17–20, 5: 21–27, 6: 28–31, 7: 32 (tek soru, üç puan: 32–34); telc B1: Lesen Teil 1: 1–5, Teil 2: 6–10, Teil 3: 11–20, Sprachbausteine Teil 1: 21–30, Teil 2: 31–40; telc A2: Teil 1: 1–5, Teil 2: 6–10, Teil 3: 11–15, Teil 3'te örnek 0; telc B2: telc B1 ile aynı; telc C1 Hochschule: Lesen Teil 1: 1–6, Teil 2: 7–12, Teil 3: 13–24 (24 = metnin ana fikri), Sprachbausteine: 25–46). Numaralar ardışık olmalı.
- `"example": true` ve `"number": 0`: örnek soru. Cevabı işaretli gösterilir, puana dahil değildir. Bir sette en fazla bir örnek olabilir; TestDaF'ta olduğu gibi iki örnek gerekiyorsa numaraları `"01"` ve `"02"` olur (metin olarak).
- `evidence`: cevabın dayandığı yerler. `quote`, `text` ile belirtilen metinde **harfi harfine ve yalnızca bir kez** geçmeli. Aynı metindeki alıntılar birbiriyle çakışmamalı. "Kontrol et"ten sonra bu yerler metinde soru numarasıyla vurgulanır. Cevabı `0` olan eşleştirme sorusunda boş bırakılabilir; tuzak ilanı göstermek için kullanılabilir.
- `explanation`: Türkçe, en az 40 karakter.

## 2b. Schreiben setleri (yazma görevi)

`section` `"schreiben"` olan setlerde soru yoktur; öğrenci metin yazar (`js/writing-task.js`). Örnek: `data/exams/goethe/b1/schreiben/teil-1/set-1.json`.

```json
{
  "format": 1, "exam": "goethe", "level": "b1", "section": "schreiben", "teil": 1, "set": "set-1",
  "title": "Neue Wohnung", "minutes": 20, "kind": "writing", "register": "du", "textType": "email-informal",
  "situation": "Sie sind vor zwei Wochen …",
  "task": "Schreiben Sie Lena eine E-Mail:",
  "points": ["Beschreiben Sie: …", "Begründen Sie: …", "Machen Sie einen Vorschlag …"],
  "instructions": "Schreiben Sie eine E-Mail (circa 80 Wörter). …",
  "words": { "target": 80, "min": 70, "max": 100 },
  "checklist": [{ "criterion": "aufgabe", "tr": "Üç maddenin hepsine yazdım (…)." }],
  "redemittel": [{ "group": "Begründen", "items": [{ "de": "Ich bin umgezogen, weil …", "tr": "Taşındım, çünkü …" }] }],
  "model": { "text": "Liebe Lena,\n…", "notes": ["Üç madde görevdeki sırayla …"] }
}
```

- `textType` ve `register` (metin türü ve hitap; yapay zekâ kontrolü türe uygun kuralları buna göre kullanır, `worker/schreiben-kontrol.js`):
  - `email-informal` (arkadaşa e-posta) ve `sms` (kısa mesaj): `register` `"du"`.
  - `email-semiformal` (tanıdık birine: kurs öğretmeni, şef, ev sahibi) ve `email-formal` (kuruma ya da tanımadığın birine): `"Sie"`.
  - `forum` (görüş yazısı): `"neutral"`; ayrıca `post` gerekir: Gästebuch'taki görüş `{ "site": "www.diskussion-aktuell.de", "author": "Markus", "time": "14.03. 19:20 Uhr", "text": "…" }`. Örnek: `teil-2/set-1.json` (Goethe B1 Teil 2).
- `mail` (e-postaya cevap görevleri, telc B1): gelen e-posta `{ "from": "Jonas", "subject": "Ich ziehe zu dir!", "text": "Hallo,\n…" }`; görev sayfasında kart olarak gösterilir. Sadece `email-…` metin türlerinde.
- `subjectLine: true`: cevap "Betreff: …" satırıyla başlar (telc B1); metin alanının ipucu Betreff ile başlar, örnek cevap da Betreff ile başlamak zorundadır. Yapay zekâ bu satırı hata saymaz.
- `words.recommended: true`: sınavda resmî kelime sınırı yok (telc B1, DTZ); sayfada "Önerilen uzunluk: yaklaşık … kelime (resmî sınır yok)" yazar, sayaç yine uyarır ama göndermeyi engellemez.
- telc Deutsch B1 (resmî Übungstest 1): Schriftlicher Ausdruck 30 dk, 45 puan; arkadaştan ya da tanıdık birinden gelen e-postaya gayriresmî veya yarı resmî cevap, 4 madde (Leitpunkt), Betreff, hitap, giriş ve kapanış; kelime sınırı yok (önerilen ~120, 100–150).
- `examChoice: true`: gerçek sınavda iki görevden biri seçilir (DTZ: Aufgabe A ya da B); görevin altında bunu söyleyen not çıkar. Sitede her görev ayrı bir settir.
- `words.veryShort`: bu sayının altında sayaç "B1 için çok kısa" diye uyarır (DTZ: 40); göndermeyi engellemez. `words.min`'den küçük olmalıdır.
- DTZ (g.a.s.t. Übungssatz 1 ve 2, Ekim 2026; g.a.s.t. öğretmen SSS'si): Schreiben 30 dk, 20 puan (B1 15–20, A2 7–14); yarı resmî ya da resmî e-posta/mektup (`email-semiformal`, `email-formal`; gayriresmî kişisel mektup sorulmaz), kısa durum + tam 4 madde, hitap ve selam zorunlu, Betreff/tarih/adres istenmez (`subjectLine` yok, örnek cevap hitapla başlar), kelime sınırı yok (önerilen ~80, 60–120; `veryShort` 40). Ölçütler: Inhalt, Kommunikative Gestaltung, Ausdruck, Korrektheit. Kontrol listesinde şu madde zorunlu: "Maddeleri numaralamadım ve her maddeye tek cümle yazıp geçmedim; metnim bağlantılı." (`scripts/check-exams.mjs` bunların hepsini denetler.)
- Yapay zekâ denemesi: `tests/ai-deneme/<ad>.json` (örnek metinler; `errors`: hatalı yer `wrong` ve düzeltmede geçmesi gereken parça `fix`; `clean`: işaretlenmemesi gereken doğru yerler) ve `scripts/ai-deneme.mjs` (Worker'daki talimatla gerçek modele gönderir; token depoya yazılmaz). Ad verilmezse bütün sınavların metinleri çalışır; talimat her değiştiğinde böyle çalıştırılır. Yeni bir sınav eklenince 4–6 metinlik (en az biri hatasız) kendi dosyası yazılır.
- `points`: içerik maddeleri (en az 2) ya da boş liste; görev cümlesi ne yazılacağını zaten söylüyorsa boş (Goethe B1 Teil 2 ve 3).
- `instructions`: isteğe bağlı (Goethe B1 Teil 2'de sadece görev cümlesi var).
- Goethe B1 (resmî Modellsatz): Teil 1 arkadaşa e-posta ~80 kelime, 20 dk; Teil 2 Gästebuch'a görüş ~80 kelime, 25 dk; Teil 3 tanıdık birine yarı resmî e-posta ~40 kelime, 15 dk (`words` 35–50).
- `words`: kelime sayacı `min`–`max` arasını iyi sayar; dışında uyarır ama göndermeyi engellemez. Sayaç harf ve rakam dizilerini sayar; `-` ya da `'` ile birleşenler tek kelimedir (B1-Prüfung).
- `checklist`: sınav kriterlerine göre (`aufgabe`: görevi yerine getirme, `aufbau`: metin düzeni, `sprache`: kelime ve dil bilgisi) öğrencinin kendi kendini kontrol listesi; Türkçe, en az 5 madde, her kriterden en az biri. Kaydedilmez.
- `redemittel`: konuya uygun kalıplar, Almanca ve Türkçe; en az 3 grup.
- `model`: örnek cevap (`min`–`max` kelime) ve kısa Türkçe notlar; gönderdikten sonra açılır. Tek doğru cevap değil, bir örnektir.
- Giriş yapmış öğrencinin metni `users/{uid}/writings`'e kaydedilir, öğretmen geri bildirim yazar (`firestore.rules`); ziyaretçinin metni sadece kendi cihazında taslak olarak durur.

## 2c. Form doldurma setleri (Goethe A1 Schreiben Teil 1)

`"kind": "form"` olan Schreiben setleri `js/form-task.js` ile açılır (yazma görevi değildir, yapay zekâ kullanılmaz, hiçbir şey kaydedilmez). Öğrenci kısa durum metnindeki bilgileri (bir arkadaşın bilgileri; kendi kişisel bilgileri istenmez) forma yazar. Örnek: `data/exams/goethe/a1/schreiben/teil-1/set-1.json`.

```json
{
  "format": 1, "exam": "goethe", "level": "a1", "section": "schreiben", "teil": 1, "set": "set-1",
  "title": "Anmeldung zum Deutschkurs", "minutes": 5, "kind": "form",
  "situation": "Ihr Freund Karim Haddad … ist am 3. Mai 1990 in Casablanca geboren …",
  "task": "Helfen Sie Ihrem Freund und schreiben Sie die fünf fehlenden Informationen in das Formular.",
  "form": { "title": "Anmeldung Deutschkurs", "subtitle": "Volkshochschule Köln", "rows": [
    { "label": "Familienname, Vorname", "value": "Haddad, Karim", "example": true },
    { "label": "Geburtsdatum", "value": "03.05.1990" },
    { "label": "Geburtsort", "number": 1, "accept": ["Casablanca"], "evidence": ["in Casablanca geboren"], "explanation": "Türkçe açıklama …" },
    { "label": "Zahlungsweise", "number": 5, "choices": ["bar", "Überweisung"], "answer": "Überweisung", "evidence": ["mit einer Überweisung"], "explanation": "…" }
  ] }
}
```

- Satırlar: dolu satır (`value`), tek örnek satır (`"example": true`, 0 olarak gösterilir) ve 1–5 numaralı beş boşluk.
- Boşluk: yazılan cevap için `accept` (kabul edilen yazımlar: "4", "vier"; tarih biçimleri …) ya da işaretlenen seçenek için `choices` + `answer`.
- Kontrol: büyük-küçük harf, fazla boşluk, sondaki nokta, ß/ss ve ä/ae farkı önemsizdir. Kabul edilen bir cevaba tek harf uzaklıktaki cevap (harfleri en az 5, sayıları aynı) "doğru sayıldı, ama yazımı: …" olur.
- `evidence`: cevabın dayandığı yer; `situation` içinde harfi harfine ve bir kez geçer, başka bir boşluğun dayanağıyla çakışmaz. "Kontrol et"ten sonra metinde boşluk numarasıyla işaretlenir.
- `explanation`: her boşluğun kendi Türkçe açıklaması (en az 40 karakter): bilginin metnin neresinde olduğu ve nasıl çıkarıldığı.
- Goethe A1 (resmî Modellsatz): Schreiben toplam ~20 dk; Teil 1 form (5 bilgi, bilgi başına 1 puan), Teil 2 kısa mesaj (~30 kelime, 3 madde, hitap ve kapanış; arkadaşa du, tanıdık birine ya da kuruma Sie). Sitede Teil 1 için 5, Teil 2 için 15 dk gösterilir; Teil 2 sayacı 25–40 arasını iyi sayar.

## 3. Kontrol

```
node scripts/check-exams.mjs
```

Betik bütün setleri açar (yalnızca bazılarını kontrol etmek için: `node scripts/check-exams.mjs teil-3/set-4`); dosya yolu, soru türleri, cevaplar, alıntılar ve numaralar için (Schreiben setlerinde görev, kelime hedefi, kontrol listesi, Redemittel ve örnek cevabın uzunluğu için) hata verir; her setin cevap dağılımını ve kelime sayılarını yazar. GitHub'da `data/exams/**` veya `js/examsData.js` değişince otomatik çalışır.

## 4. İçerik kuralları

- Metinler, isimler ve kurgu tamamen orijinal olur; resmi Modellsatz'lardan, kitaplardan veya sitelerden yalnızca format (metin türü, uzunluk, soru sayısı ve türü) alınır. Kişi, şirket ve yer adları kurgusaldır.
- Her sorunun tek ve metinden kanıtlanabilen bir doğru cevabı vardır. Çeldiriciler metindeki kelimeleri kullanabilir, ama yanlış oldukları metinden gösterilebilmelidir.
- Doğru cevaplar dengeli dağılır.
- Doğru cevap biçim ve uzunluk bakımından öne çıkmaz (tüm seviyeler, tüm seçmeli görevler): En uzun, en ayrıntılı, tek „dengeli“ ya da iki parçalı („…, doch …“, „zwar …, aber …“) seçenek sistematik olarak doğru cevap olmaz. Bir sette doğru cevap kısa ve tek parçalı, çeldiricilerden biri uzun ve iki parçalı olabilir; bir başka sette tersi. Ölçüt seçeneklerin biçimi değil, metindeki dayanaktır. Aynısı özetteki yanlış cümleler için de geçerli: Yanlışlık genel bilgiyle ya da özetin başka bir cümlesiyle değil, ancak metne bakarak anlaşılır.
- Türkçe açıklamalar metinde açıkça yazmayan bilgi eklemez (kişilerin rolü, bir şeyin sebebi, metinde geçmeyen bir yer veya kural vb.). Bir bilgi açıklamada gerekiyorsa önce metne yazılır.
- Seçenekler ile metin arasında zorunluluk ve olasılık derecesi (müssen, sollen, dürfen, können; „bitte …“ ricası) tutarlıdır. Metin „bitte eintragen“ diyorsa seçenek „muss man“ demez. Fark bilinçli bir çeldiriciyse açıklamada belirtilir.
- Büyük harfle başlayan zamirler (Ihr/ihr, Sie/sie, Ihnen/ihnen) hitap biçimiyle karışmayacak şekilde kullanılır. Cümle başında „ihre“ (onların/onun) gerekiyorsa cümle yeniden kurulur (ör. „Die Abholung …“).
- Çeldiriciler metni okumadan elenebilecek kadar uç olmaz: „nur“, „alle“, „nie“, „immer“, „ganz“, „jeder“ gibi aşırı ifadelerle değil, metinde gerçekten geçen ama yanlış kişiye, zamana, yere veya sebebe bağlanmış bilgilerle kurulur. Doğru cevap da her zaman en ılımlı seçenek olmamalı.
- Teil 4'te (okur yorumları) her sette en az 2–3 yorum hükmünü baştaki ilk cümlede değil, ortada veya sonda verir ya da önce karşı görüşü kabul edip sonra kendi tarafını belirtir. „Natürlich … Aber …“, „Ich bin dafür, aber nur, wenn …“ gibi kalıplar bir sette en fazla bir kez kullanılır ve setler arasında çeşitlendirilir. Her yorumun cevabı yine tek ve tartışmasızdır.
- Aynı kalıp setler arasında tekrarlanmaz: aynı soru tipi (ör. „Fikir kimden çıktı?“), aynı metin sonu (ör. „daha büyük yer / daha fazla gönüllü aranıyor“), bir sette aynı yer adının birçok ilanda geçmesi gibi.
- Seçenekler ve doğru cevap yalnızca çıkarımla elde edilen bilgilere dayanmaz (ör. metin „yaklaşık yarısı engelli“ diyorsa seçenek „engelli ve engelsiz çalışanlar şu bölümlerde“ demez); metindeki göndermeler dilbilgisi olarak tutarlıdır (ör. tek bir sorudan sonra „solche Fragen“ yazılmaz).
- Seçenekli sorularda (özellikle Goethe A2 Teil 1 ve Teil 3) doğru şık metindeki cümleyi kelimesi kelimesine tekrar etmez; aynı bilgi seviyeye uygun eş anlamlı kelimelerle veya farklı bir yapıyla ifade edilir. Çeldiriciler metinde geçen kelimeleri yanlış bağlamda kullanabilir.
- Eşleştirmede „uygun ilan yok“ (0 / X) tuzakları setler arasında çeşitlenir: her sette farklı bir sebebe dayanır (yer, gün/saat, hedef kitle, hizmet türü, sayı/fiyat/süre vb.); aynı Teil'de iki set aynı tür sebebi kullanmaz.
- Soru köklerinde, seçeneklerde ve metinlerde zamir (er/sie/ihm/ihn …) iki kişiden hangisine gönderme yaptığı belirsiz kalacaksa zamir yerine isim yazılır (ör. „Marco fragt Hakan, ob Hakan …“). Rollerin yer değiştirmesine dayanan çeldiriciler (davet eden/davet edilen, yazan/okuyan) bir sette en fazla bir kez kullanılır.
- Çeldiriciler dünya bilgisiyle veya mantıkla, metni okumadan elenemez (ör. 22 yaşındaki birinin „40 yıl“ çalışmış olması, bir dans öğretmeninin „öğrencilerden kötü dans etmesi“). Çeldirici, metinde gerçekten geçen ama yanlış kişiye, zamana veya duruma bağlanmış bir bilgiye dayanır.
- Goethe B2 Teil 1'de kişilerin görüşleri birbirine yakın olur (hepsi aynı konuda, kısmen benzer argümanlarla), ama her ifade metinden kanıtlanabilir biçimde yalnızca tek bir kişiye aittir; diğer kişilerin metinleri o ifadeyi açıkça desteklemez veya ona karşıdır.
- Goethe B2 Teil 2'de artan cümleler konuya uygun olur, ama boşluğun öncesi ve sonrasıyla bağlantısı (bağlaç, zamir, zaman, mantık sırası) tutmaz. Hiçbir boşluk yalnızca bir dilbilgisi ipucuyla (ör. tekil/çoğul zamir, „dennoch/deshalb“) çözülemez; doğru cümle içerik olarak da bağlanmalıdır.
- Goethe B2 Teil 3'te sorular ve doğru şıklar metindeki cümleyi tekrar etmez; doğru cevap birden fazla cümleyi birleştirmeyi veya yazarın tutumunu çıkarmayı gerektirir. Çeldiriciler metinde geçen bilgileri yanlış ilişkilendirir.
- Goethe B2 Teil 2'de artan cümleler de doğru cümleler gibi gönderme sözcükleri ve bağlaçlarla başlar (ör. „Dort …“, „Er …“, „Den Rest …“, „Deshalb …“, „Trotzdem …“); böylece bir gönderme sözcüğü birden fazla cümleye uyar ve boşluk ancak içerikle çözülür.
- Eşleştirmeli bölümlerde (Goethe B2 Teil 1 ve 4) ifadeler metinle eş anlamlı ifadelerle eşleşir; aynı içerik sözcüğü (isim, fiil, sıfat; kök olarak da, ör. „Fehltage“/„fehlen“) hem ifadede hem de ait olduğu metinde geçmez.
- Başlık eşleştirmede (Goethe B2 Teil 5) artan başlıklar bölümlerle konu olarak ilişkilidir (aynı belgenin bir bölümüne ait olabilecek bir konu, en az bir bölümle ortak bir alan), ama hiçbir bölümün ana içeriğine tam uymaz; artan başlığın neden uymadığı bölümün metninden gösterilebilir.
- DTZ Teil 1'de (içindekiler / bilgi tablosu) doğru bölüm yalnızca bölüm başlığından veya genel bilgiden tahmin edilemez: Durumun anahtar bilgisi başlıkta değil, alt maddelerde eş anlamlı bir ifadeyle bulunur. Her soruda en az bir çeldirici bölüm aynı konu alanındandır veya durumdaki bir ayrıntıyla (ör. „Wohnung“, „Mittagessen“, aylık bir ödeme, sağlık) gerçekten ilişkilidir; ama o bölümün alt maddeleri durumun asıl sorusunu karşılamaz.
- DTZ Teil 5'te her sette dilbilgisi boşlukları (artikel ve iyelik eki, edat ve hâl, fiil biçimi veya yardımcı fiil) ile anlam/bağlaç boşlukları karışık olur: en az iki dilbilgisi boşluğu (en az iki farklı türden) ve en az iki anlam veya bağlaç boşluğu. Bir boşluğun üç şıkkı aynı sözcük türündendir.
- Goethe A1'de metinler çok kısa ve basittir: Goethe A1 kelime listesi, Präsens ve basit Perfekt, kısa ana cümleler (en fazla „und, aber, oder, denn“ ile bağlanır); A1 üstü kelime kullanılmaz. Konular: tanışma, aile, alışveriş, yemek, saat ve randevu, ev, şehirde yön bulma, tatil. Doğru ifade metindeki kelimeyi birebir tekrar etmez; A1 düzeyinde basit eş anlamlılar (ör. „nicht da“ / „weg“, „am Morgen“ / „um 8 Uhr“) veya farklı bir yapı kullanılır. Türkçe açıklamalar özellikle sade olur: kısa cümleler, Almanca kelimenin hemen yanında Türkçesi.
- Goethe A1 Teil 2'de iki ilan da durumun konusuyla ilgilidir; yanlış olan, durumdaki tek bir ayrıntıya (gün, saat, yer, kişi, fiyat) uymaz ve bu ayrıntı ilanda açıkça yazar.
- Goethe C1 ve TestDaF'ta metinler gerçek bir gazete, dergi veya akademik yayın düzeyinde ve doğaldır (yaklaşık uzunluk, terim yoğunluğu, gönderme ve bağlaç zenginliği). Sorular metindeki cümleyi tekrar etmez; doğru cevap birden fazla cümleyi birleştirmeyi, yazarın tutumunu veya örtük bir ilişkiyi (sebep, kısıtlama, karşıtlık) çıkarmayı gerektirir. Çeldiriciler metinde geçen bilgileri yanlış ilişkilendirir (sebep–sonuç, genelleme, zaman, kişi). TestDaF'ta konular üniversite ve bilim bağlamındadır.
- Goethe C1 Teil 1'de dört seçenekli boşluklar (a–d) sözcük bilgisi, kolokasyon, bağlaç ve edat bilgisini karışık ölçer; dört seçenek aynı sözcük türündendir ve yalnızca biri hem dilbilgisi hem anlam olarak uyar.
- telc'te (B1, B2, C1 Hochschule) Sprachbausteine Teil 1'in seçenekleri aynı sözcük türündendir ve dilbilgisini (edat, bağlaç, zamir, fiil biçimi, sıfat çekimi) ölçer; Teil 2'deki kelime listesinde artan kelimeler de en az bir boşluğa dilbilgisi olarak uyar gibi görünür, ama anlam veya yapı onları dışarıda bırakır.
- Yeni bir set, cevap anahtarına bakmadan baştan çözülüp anahtarla karşılaştırılır.
- Her yeni set grubu yazıldıktan sonra, setleri yazmamış ve konuşmanın bağlamını görmeyen bir alt ajanla bağımsız doğrulama yapılır: Ajana yalnızca cevapsız kopyalar (metinler, sorular, seçenekler; örnek soruların basılı çözümü hariç cevap ve açıklama yok) verilir. Ajan sınava giren bir öğrenci gibi çözer; her soru için cevabını, dayandığı cümleyi ve emin olup olmadığını yazar. Sonuç anahtarla karşılaştırılır; uyuşmayan, emin olunamayan ve ajanın fark ettiği sorunlar raporda listelenir ve düzeltmeden önce onaya sunulur.
