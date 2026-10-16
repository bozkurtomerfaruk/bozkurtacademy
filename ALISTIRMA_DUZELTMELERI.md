# Alıştırma Düzeltmeleri

Bu dosya Almanca alıştırmaların dil bilgisi denetiminin raporudur. Veriler `data/<seviye>/<konu>.json` dosyalarında durur (her dosyada `exercises[].questions[]`: `sentence`, `options` ya da `answers`, `correct`, `explanations.tr/de/en`). Kodda ve veri yapısında değişiklik yapılmadı; soru sırası ve Übung ID'leri korundu. Sorular aşağıda `dosya › Übung-ID › soru no` (0'dan başlar) ile gösterilir.

Notlar:

- Sitenin varsayılan dili Türkçe olduğu için açıklama düzeltmeleri `explanations.tr` alanında yapıldı. Cevap, cümle veya seçenek değiştiğinde `de` ve `en` açıklamaları da yeniden yazıldı (aksi halde eski cevabı söyleyeceklerdi).
- Kök dizindeki `w-fragen.json` sitede kullanılmıyor (katalogda yok); incelenmedi. Kullanılan sürüm `data/a1/w-fragen.json`.

## Toplam

- İncelenen konu: 39 / 48
- İncelenen soru: 6728
- Düzeltilen soru: 861
- Onay bekleyen: 37

| Konu | İncelenen | Düzeltilen | Onay bekleyen |
|---|---:|---:|---:|
| `a2/reflexive-verben` | 100 | 13 | 2 |
| `a1/artikel` | 120 | 6 | 0 |
| `a1/akkusativ` | 240 | 23 | 0 |
| `a1/imperativ` | 200 | 74 | 0 |
| `a1/lokale-praepositionen` | 100 | 5 | 1 |
| `a1/modalverben` | 240 | 10 | 0 |
| `a1/negation` | 200 | 36 | 0 |
| `a1/perfekt` | 300 | 48 | 0 |
| `a1/personalpronomen-akkusativ` | 240 | 23 | 0 |
| `a1/personalpronomen-dativ` | 240 | 29 | 1 |
| `a1/plural` | 200 | 4 | 0 |
| `a1/possessivartikel` | 70 | 1 | 0 |
| `a1/praesens` | 144 | 1 | 0 |
| `a1/sein-haben` | 144 | 43 | 0 |
| `a1/temporale-praepositionen` | 100 | 40 | 0 |
| `a1/trennbare-verben` | 240 | 34 | 0 |
| `a1/w-fragen` | 240 | 18 | 0 |
| `a1/zahlen-uhrzeit-datum` | 200 | 18 | 0 |
| `a2/adjektivdeklination` | 180 | 30 | 0 |
| `a2/dativ` | 240 | 23 | 0 |
| `a2/futur-i` | 100 | 4 | 0 |
| `a2/komparativ-superlativ` | 180 | 20 | 1 |
| `a2/konjunktiv-ii` | 150 | 8 | 0 |
| `a2/nebensaetze` | 200 | 10 | 2 |
| `a2/praeteritum` | 180 | 13 | 1 |
| `a2/verben-dativ-akkusativ` | 100 | 4 | 0 |
| `a2/verben-praepositionen` | 180 | 44 | 3 |
| `a2/wechselpraepositionen` | 100 | 37 | 1 |
| `b1/pronominaladverbien` | 100 | 27 | 1 |
| `b1/relativsaetze` | 180 | 10 | 3 |
| `b1/satzstellung-b1` | 100 | 2 | 0 |
| `b2/nominalisierung` | 200 | 60 | 4 |
| `b2/partizip-i` | 200 | 14 | 1 |
| `b2/partizip-ii` | 200 | 16 | 0 |
| `b2/passiv-varianten` | 200 | 36 | 0 |
| `b1/genitiv` | 200 | 26 | 6 |
| `b1/indirekte-fragen` | 120 | 8 | 0 |
| `b1/infinitiv-zu` | 200 | 43 | 10 |
| `b1/kausalsaetze` | 100 | 0 | 0 |

## Onay bekleyenler

Bu sorular şüpheli ama değiştirilmedi. Karar senin.

- **`a2/reflexive-verben` › `praepositionen-1-5` › 9** — Sie bewirbt sich ___ eine Stelle im Hotel. (um / für / an → um)  
  Standart kalıp 'sich bewerben um'. Ancak 'sich für eine Stelle bewerben' günlük dilde çok yaygın ve birçok kaynakta kabul ediliyor. 'für' çeldiricisi yanlış sayılmalı mı, yoksa başka bir çeldiriciyle (ör. 'an') değiştirilsin mi?
- **`a2/reflexive-verben` › `praepositionen-1-5` › 7** — Der Student bereitet sich ___ die Prüfung vor. (auf / über / für → auf)  
  Standart 'sich vorbereiten auf'. 'sich für die Prüfung vorbereiten' da konuşma dilinde sık geçiyor. 'für' çeldiricisi değiştirilsin mi?
- **`a1/lokale-praepositionen` › `aus-von-4` › 7** — Dieser Zug kommt ___ München. (yazılı; kabul: aus)  
  'Der Zug kommt von München' de (özellikle tren güzergâhı için) kullanılır. Yalnızca 'aus' kabul ediliyor. 'von' da kabul edilsin mi, yoksa cümle 'Meine Freundin kommt ___ München.' gibi kökeni net gösteren bir cümleye mi çevrilsin?
- **`a1/personalpronomen-dativ` › `mir-dir-uns-euch-ihnen-6` › 3** — Ich zeige ___ die Fotos. [ipucu: ihr] (ihr / sie / euch → euch). Aynı durum: q8 'Gehören die Taschen ___?' ve dat-zwei-objekte-2 q5 'Ich gebe ___ die Schlüssel morgen zurück.'  
  Çeldirici 'ihr' tek başına okunduğunda da doğru bir cümle verir ('ona (kadına) gösteriyorum'). Doğru cevabı yalnızca başlıktaki ipucu (ihr = siz) belirliyor. Çeldirici 'ihr' başka bir biçimle (ör. 'ihnen') değiştirilsin mi?
- **`a2/komparativ-superlativ` › `gern-viel-gut-13` › 9** — Im Sommer haben wir am ___ Gäste. (viel) → meisten. Benzerleri: aynı Übung q4 'Für die Miete geben wir am ___ Geld aus.' ve unregelmaessiger-superlativ-12 q5 'Wer hat am ___ Erfahrung?'  
  Standart dil bilgisinde isimden önce 'die meisten Gäste / das meiste Geld / die meiste Erfahrung' kullanılır; 'am meisten + isim' konuşma dilidir. Cümleler 'am meisten' fiille kullanılacak şekilde mi değiştirilsin (ör. 'Im Sommer arbeiten wir am ___.'), yoksa olduğu gibi mi kalsın?
- **`a2/nebensaetze` › `nachdem-10` › 5** — Ich rufe dich an, ___ ich mit dem Termin fertig bin. (nachdem) — ayrıca q6 'Nachdem der Film zu Ende ist, fahren wir nach Hause.'  
  Zaman uyumu kuralına göre nachdem-cümlesi ana cümleden bir önceki zamanda olmalı (Ana cümle Präsens → nachdem + Perfekt). 'fertig sein / zu Ende sein' durum bildirdiği için konuşmada kullanılıyor ama öğretici olarak 'sobald/wenn' ya da Perfekt ('nachdem der Film zu Ende gegangen ist') daha doğru. Cümleler değiştirilsin mi?
- **`a2/nebensaetze` › `wenn-4` › 5** — Ich nehme meine Jacke mit, ___ es später kalt wird. (wenn / weil / dass → wenn)  
  Konuşan hava tahminini biliyorsa 'weil es später kalt wird' de doğal ve doğrudur. Cümleye belirsizlik ifadesi eklensin mi (ör. '… falls/wenn es später vielleicht kalt wird') ya da 'weil' çeldiricisi değiştirilsin mi?
- **`a2/praeteritum` › `geschichte-14` › 8** — Nach einigen Monaten ___ sie sich, gemeinsam umzuziehen. (yazılı → entschieden)  
  Hikâyede bir önceki cümlenin öznesi Mia (tekil sie). 'gemeinsam' çoğul okumayı (Jonas ve Mia) destekliyor, ama 'entschied sie sich' (Mia karar verdi) de dilbilgisel olarak doğru. 'entschied' de kabul edilsin mi?
- **`a2/verben-praepositionen` › `mit-7` › 2** — Wir fangen heute ___ Kapitel fünf an. (zu / mit / bei → mit)  
  'Wir fangen bei Kapitel fünf an' (5. bölümden başlıyoruz) günlük dilde de çok doğal. 'bei' çeldiricisi başka bir prepozisyonla (ör. 'auf') değiştirilsin mi?
- **`a2/verben-praepositionen` › `fuer-4` › 5** — Du musst dich nicht ___ deinen Akzent schämen. (vor / für / über → für)  
  Bazı sözlükler 'sich über etwas schämen' kullanımını da kaydediyor (daha az yaygın). 'über' çeldiricisi değiştirilsin mi (ör. 'an')?
- **`a2/verben-praepositionen` › `wor-wo-12` › 9** — „Das Programm eignet sich für Anfänger.“ → Wofür eignet sich das Programm?  
  Anfänger kişidir; kişiler için normalde 'Für wen eignet sich das Programm?' sorulur. 'für wen …' cevabı kabul edilmiyordu (şimdi değiştirmedim). Cümle bir şeyle değiştirilsin mi (ör. 'für den Unterricht') ya da 'Für wen' kabul edilsin mi? Benzer durum: dar-14 q9 ('Sie eignet sich gut dafür' – für Anfänger).
- **`a2/wechselpraepositionen` › `verschmelzungen-5` › 9** — Der Hund springt ___ Sofa. (aufs / auf dem / am → aufs)  
  'Der Hund springt auf dem Sofa' (köpek kanepenin üstünde zıplıyor, konum) de dilbilgisel olarak doğru. 'auf dem' çeldiricisi değiştirilsin mi (ör. 'im') ya da cümleye yön belirten bir ifade eklensin mi?
- **`b1/pronominaladverbien` › `zu-gruppen-8` › 8** — Ich danke dir ___, mir geholfen zu haben. → dafür  
  dafür doğru. Ancak zu-Infinitiv'in örtük öznesi burada nesne (dir); 'Ich danke dir dafür, mir geholfen zu haben' bazı dilbilgisi/üslup kaynaklarında kusurlu sayılır, doğal olan 'Ich danke dir dafür, dass du mir geholfen hast.' Emin değilim; cümleyi dass ile kurmak veya örneği öznesi ana cümleyle aynı olan bir zu-cümlesiyle değiştirmek (ör. 'Ich bin stolz darauf, die Prüfung bestanden zu haben') düşünülebilir.
- **`b1/relativsaetze` › `satzmitte-kommas-15` › 8** — Setze die Kommas: „Der Student der neben mir sitzt kommt aus Prag.“ → Der Student, der neben mir sitzt, kommt aus Prag.  
  answers listesinde virgülsüz 'der student der neben mir sitzt kommt aus prag' var; görev virgül koymak olduğu hâlde verilen hatalı cümleyi aynen yazan kullanıcı doğru sayılıyor. Virgülsüz cevabın answers'tan çıkarılması önerilir (edit formatında answers silme alanı olmadığı için pending).
- **`b1/relativsaetze` › `satzmitte-kommas-15` › 9** — Setze die Kommas: „Das Auto das wir gestern gekauft haben steht in der Garage.“ → Das Auto, das wir gestern gekauft haben, steht in der Garage.  
  Aynı sorun: virgülsüz 'das auto das wir gestern gekauft haben steht in der garage' kabul ediliyor; virgül görevinde bu cevap çıkarılmalı.
- **`b1/relativsaetze` › `grundlagen-wortstellung-1` › 8** — Verbinde: „Der Zug fährt nach Hamburg. Der Zug steht auf Gleis 4.“ → Der Zug, der nach Hamburg fährt, steht auf Gleis 4.  
  Virgülsüz varyantlar (ve q9, master-18 q8/q9'daki virgülsüz varyantlar) kabul ediliyor; Almancada Relativsatz virgülle ayrılmak zorunda. Diğer Verbinde sorularında (Übung 16) yalnız virgüllü sürüm kabul ediliyor; tutarlılık için virgülsüz cevapların kaldırılması düşünülebilir. Bilinçli tolerans olabileceği için değiştirmedim.
- **`b2/nominalisierung` › `verb-nomen-wechsel-5` › 5** — Formuliere nominal: „Beim Fahren muss ich mich konzentrieren.“ → Das Fahren erfordert meine Konzentration.  
  Girdi cümlesi (Beim Fahren ...) zaten isimleşmiş; 'Formuliere nominal' görevi anlamsız ve beklenen cevap (Das Fahren erfordert meine Konzentration) öğrencinin tahmin edemeyeceği yeni bir fiil (erfordern) içeriyor. Öneri: girdiyi fiilli yap ('Wenn ich fahre, muss ich mich konzentrieren.' → 'Beim Fahren muss ich mich konzentrieren.') veya cevabı ipucu olarak ver.
- **`b2/nominalisierung` › `verb-nomen-wechsel-5` › 9** — Formuliere nominal: „Er sitzt zu viel.“ → Vom vielen Sitzen bekommt er Beschwerden.  
  'Er sitzt zu viel.' girdisinden 'Vom vielen Sitzen bekommt er Beschwerden.' cevabı tahmin edilemez (bekommt ... Beschwerden yeni bilgi). Öneri: cümleye ikinci yarıyı ekle ('Er sitzt zu viel und bekommt davon Beschwerden.').
- **`b2/nominalisierung` › `verb-transformation-16` › 2** — Formuliere nominal: „Wir essen zusammen.“ → Einladung → Er lädt uns zum Essen ein.  
  'Wir essen zusammen.' → Einladung girdisinden özne 'Er' ve fiil 'einladen' tahmin edilemez; beklenen tek cevap 'Er lädt uns zum Essen ein.' Öneri: yönergeyi 'Er lädt uns ein, zusammen zu essen.' gibi somutlaştır.
- **`b2/nominalisierung` › `personen-nominativ-10` › 9** — Ergänze: „Die ___ kommt aus Spanien.“ (jung) → Junge  
  'Die Junge kommt aus Spanien.' dilbilgisel olarak mümkün (genç kadın) ama doğal değil; 'der Junge' (erkek çocuk) ayrı bir isim olduğundan öğrenciyi karıştırabilir. Öneri: başka bir sıfat kullan (ör. 'Die Fremde kommt aus Spanien.' fremd → Fremde) veya 'Die Jugendliche'.
- **`b2/partizip-i` › `praepositionen-11` › 6** — Ergänze: „Die Polizei steht gegen laut ___ Demonstranten.“ (protestieren) → protestierende  
  'Die Polizei steht gegen laut protestierende Demonstranten.' dilbilgisel olarak kabul edilebilir ama 'stehen gegen' burada deyimsel değil. Öneri: 'Die Polizei geht gegen laut protestierende Demonstranten vor.' (gegen + Akkusativ, cevap aynı kalır).
- **`b1/genitiv` › `von-zu-genitiv-7` › 7** — „die Uhr von Utes Schwester“ → Genitiv (die Uhr von Utes Schwester)  
  Görev 'Genitiv'e dönüştür' diyor ama doğru cevap orijinal ifadenin aynısı; dönüşüm yok. Açıklama savunulabilir (iki önde Genitiv zincirlenemez), ama öğrenciye kafa karıştırıcı. Öneri: soruyu değiştirmek, ör. doğru cevap 'die Uhr der Schwester von Ute' veya başka bir isim grubu.
- **`b1/genitiv` › `master-20` › 5** — „die Telefonnummer von Frau Müller“ (die Telefonnummer der Frau Müller / Frau Müllers Telefonnummer / Frau Müller Telefonnummer → Frau Müllers Telefonnummer)  
  'die Telefonnummer der Frau Müller' (artikelli unvan + değişmeyen isim) resmî ama dilbilgisi olarak doğru kabul edilir; çeldirici de doğru olabilir. Emin değilim; öneri: çeldiriciyi 'die Telefonnummer des Frau Müllers' gibi kesin yanlış biçimle değiştirmek.
- **`b1/genitiv` › `kontext-17` › 2** — ___ wurden keine Fotos gemacht. (Während die Besprechung / Während der Besprechung / Wegen der Besprechung → Während der Besprechung)  
  'Wegen der Besprechung wurden keine Fotos gemacht' da dilbilgisi olarak doğru ve anlamlı olabilir; cümlede zaman ipucu yok. Öneri: bağlam ekle (ör. 'Während der Besprechung ... – im Raum war Fotografieren verboten') ya da çeldiriciyi 'Wegen die Besprechung' yap.
- **`b1/genitiv` › `kontext-17` › 1** — ___ wurde die Veranstaltung abgesagt. (Während des starken Regens / Wegen dem starken Regen / Wegen des starken Regens → Wegen des starken Regens)  
  'Während des starken Regens wurde die Veranstaltung abgesagt' de dilbilgisi olarak doğru; anlamca daha zayıf ama mümkün. Öneri: çeldiriciyi 'Wegen der starken Regens' gibi kesin yanlışla değiştirmek.
- **`b1/genitiv` › `master-20` › 2** — ___ wurde nicht telefoniert. (das wichtige Meeting) (Wegen des wichtigen Meetings / Während des wichtigen Meetings / Während dem wichtigen Meeting → Während des wichtigen Meetings)  
  'Wegen des wichtigen Meetings wurde nicht telefoniert' da dilbilgisi olarak doğru ve mantıklı olabilir. Öneri: çeldiriciyi 'Während der wichtigen Meetings' gibi kesin yanlış yapmak.
- **`b1/genitiv` › `wegen-9` › 0** — ___ starken Regens fiel das Konzert aus. (Wegen des / Wegen dem / Während des → Wegen des)  
  'Während des starken Regens fiel das Konzert aus' dilbilgisi olarak doğru; anlam olarak zayıf. Açıklamayı düzelttim; çeldiricinin değiştirilmesi (ör. 'Wegen der') düşünülebilir.
- **`b1/infinitiv-zu` › `verben-2` › 1** — Wir ___, das Problem ohne externe Hilfe zu lösen. (bitten / sind froh / versuchen → versuchen)  
  'Wir sind froh, das Problem ohne externe Hilfe zu lösen' dilbilgisi olarak doğru; 'Wir bitten, ... zu lösen' (nesnesiz bitten) de mümkün. Anlamca versuchen en doğal ama birden fazla doğru şık olabilir. Öneri: çeldiricileri 'möchten' / 'müssen' gibi zu almayan modallarla değiştirmek.
- **`b1/infinitiv-zu` › `ausdruecke-3` › 1** — Es ist hier ___, private Dateien auf dem Firmencomputer zu speichern. (überzeugt / geplant / verboten → verboten)  
  'Es ist hier geplant, ... zu speichern' dilbilgisi olarak doğru; anlamca tuhaf. Öneri: 'geplant' yerine 'gebeten' gibi kesin yanlış bir çeldirici.
- **`b1/infinitiv-zu` › `ausdruecke-3` › 6** — Ich habe keine ___, heute Abend noch einkaufen zu gehen. (Zeit / Angst davor / Überzeugung → Zeit)  
  'Ich habe keine Angst davor, heute Abend noch einkaufen zu gehen' dilbilgisi ve anlamca doğru bir cümle; iki doğru şık. Öneri: 'Angst davor' yerine kesin yanlış bir seçenek.
- **`b1/infinitiv-zu` › `ausdruecke-3` › 7** — Es gibt keinen ___, sich wegen eines kleinen Fehlers so zu ärgern. (Plan / Zwang / Grund → Grund)  
  'keinen Zwang' / 'keinen Plan' dilbilgisi olarak mümkün, anlamca zayıf. Düşük öncelik; istenirse çeldiricileri değiştir.
- **`b1/infinitiv-zu` › `dass-umformen-7` › 6** — Forme um: „Mara bereut, dass sie so spät reagiert.“ → Mara bereut, so spät zu reagieren.  
  bereuen genellikle geçmişteki bir eylem için kullanılır; doğal cümle 'dass sie so spät reagiert hat' → 'so spät reagiert zu haben'. Şimdiki zaman tuhaf. Öneri: kaynak cümleyi Perfekt yap ve cevabı 'Mara bereut, so spät reagiert zu haben.' olarak güncelle (bu alıştırma Präsens dönüşümü olduğu için başka bir fiil de seçilebilir).
- **`b1/infinitiv-zu` › `perfekt-mix-14` › 5** — Sie ist froh, nach langer Pause wieder Skateboard ___ . (zu gefahren sein / gefahren zu sein / gefahren zu haben → gefahren zu sein)  
  'Skateboard/Auto fahren' Perfekt'te standart olarak sein alır; ancak bazı bölgelerde/sözlüklerde 'hat ... gefahren' de geçer. Açıklamayı kuralla yazdım; haben şıkkının kesin yanlış olup olmadığını kontrol et.
- **`b1/infinitiv-zu` › `b1-kontext-19` › 1** — „Ich bin froh, ___.“ (die Entscheidung nicht allein zu treffen / ... getroffen zu sein / ... getroffen zu haben → getroffen zu haben)  
  Gövdede zaman ipucu yok; 'Ich bin froh, die Entscheidung nicht allein zu treffen' de doğru ve anlamlı (karar henüz verilecek). Öneri: 'gestern' veya 'schon' gibi bir ipucu ekle.
- **`b1/infinitiv-zu` › `master-20` › 0** — Ich bin froh, die Unterlagen rechtzeitig abgeschickt zu haben / abzuschicken / abgeschickt zu sein → abgeschickt zu haben  
  Zaman ipucu yok; 'Ich bin froh, die Unterlagen rechtzeitig abzuschicken' de dilbilgisi olarak doğru. Öneri: 'schon/gestern' ekle veya çeldiriciyi kesin yanlış yap.
- **`b1/infinitiv-zu` › `master-20` › 7** — Sie ist überzeugt, die richtige Entscheidung zu treffen / getroffen zu sein / getroffen zu haben → getroffen zu haben  
  Zaman ipucu yok; 'Sie ist überzeugt, die richtige Entscheidung zu treffen' de doğru. Öneri: 'gestern' gibi bir ipucu ekle.
- **`b1/infinitiv-zu` › `praesens-perfekt-15` › 3** — Sie ist erleichtert, pünktlich ___. (gekommen zu sein / zu kommen / gekommen zu haben → gekommen zu sein)  
  Diğer soruların aksine (schon/morgen) zaman ipucu yok; 'Sie ist erleichtert, pünktlich zu kommen' de mümkün. Öneri: 'heute Morgen' veya 'endlich' gibi ipucu ekle.

## Değiştirilen sorular

### `data/a2/reflexive-verben.json`

#### `akkusativ-dativ-3` › 3
Cümle: Zieh ___ bitte eine Jacke an.

Gerekçe: Açıklama 'Akkusativ nesne → dir' diyerek dir'i Akkusativ gibi gösteriyordu. Kural: cümlede ayrı bir Akkusativ nesne varsa dönüşlü zamir Dativ olur.

- Açıklama (TR)
  - Eski: Doğru cevap: dir. eine Jacke Akkusativ nesne → dir.
  - Yeni: Doğru cevap: dir. Cümlede zaten bir Akkusativ nesne (eine Jacke) olduğu için dönüşlü zamir Dativ olur: du → dir. Karşılaştır: Zieh dich an! (başka nesne yok → Akkusativ: dich).

#### `akkusativ-dativ-3` › 2
Cümle: Du putzt ___ die Zähne.

Gerekçe: Açıklama kuralı (ayrı Akkusativ nesne → dönüşlü zamir Dativ) söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: dir. die Zähne = Akkusativ; du → dir.
  - Yeni: Doğru cevap: dir. Cümlede zaten bir Akkusativ nesne (die Zähne) var; bu yüzden dönüşlü zamir Dativ olur: du → dir. Karşılaştır: Du wäschst dich. (başka nesne yok → Akkusativ: dich).

#### `akkusativ-dativ-3` › 5
Cümle: Sie kämmt ___ die Haare.

Gerekçe: 'ihr' de dil bilgisel olarak mümkün (başka birinin saçı); açıklama neden dönüşlü 'sich' gerektiğini göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sich. 3. tekil Dativ ve Akkusativ reflexiv biçimi aynı: sich.
  - Yeni: Doğru cevap: sich. Özne sie (3. tekil); 3. şahısta dönüşlü zamir hem Akkusativ hem Dativ'de sich'tir. die Haare Akkusativ nesne olsa da biçim değişmez. ihr seçilirse cümle 'başka bir kadının saçını tarar' anlamına gelir; dönüşlü değildir.

#### `akkusativ-dativ-3` › 6
Cümle: Er rasiert ___ jeden Morgen.

Gerekçe: 'ihn' de dil bilgisel olarak mümkün (başka biri); açıklamaya dönüşlü/dönüşsüz farkı eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: sich. Ek nesne yok → sich.
  - Yeni: Doğru cevap: sich. Özne er ve ayrı bir nesne yok; kişi kendini tıraş ediyor → dönüşlü zamir sich. ihn seçilirse 'başka bir erkeği tıraş eder' anlamına gelir; dönüşlü değildir.

#### `alltag-4` › 1
Cümle: Danach ___ ich ___ die Zähne.

Gerekçe: Açıklama 'die Zähne Akkusativ → mir' diyerek mir'i Akkusativ gibi gösteriyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: putze / mir. die Zähne ek Akkusativ nesne → mir.
  - Yeni: Doğru cevap: putze / mir. Cümlede ayrı bir Akkusativ nesne (die Zähne) var; bu yüzden dönüşlü zamir Dativ olur: ich → mir. Karşılaştır: Ich wasche mich. (başka nesne yok → mich).

#### `alltag-4` › 6
Cümle: Vor dem Spiegel ___ du ___ die Haare.

Gerekçe: Açıklama 'die Haare Akkusativ → dir' diyerek kuralı ters gösteriyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: kämmst / dir. die Haare Akkusativ → dir.
  - Yeni: Doğru cevap: kämmst / dir. Cümlede ayrı bir Akkusativ nesne (die Haare) var; bu yüzden dönüşlü zamir Dativ olur: du → dir. Fiil du'ya göre çekimlenir: du kämmst. Karşılaştır: Du kämmst dich. (başka nesne yok → dich).

#### `alltag-4` › 7
Cümle: Es ist kalt. ___ dir eine warme Jacke ___.

Gerekçe: Seçeneklerde boş parça vardı ('Zieh / / an'); cümlede iki boşluk var. Açıklama kuralı içermiyordu.

- Seçenekler
  - Eski: `Zieh / / an` / `Wasch / / ab` / `Setz / / hin`
  - Yeni: `Zieh / an` / `Wasch / ab` / `Setz / hin`
- Cevap
  - Eski: Zieh / / an
  - Yeni: Zieh / an
- Açıklama (TR)
  - Eski: Doğru cevap: Zieh / / an. Zieh dir eine Jacke an.
  - Yeni: Doğru cevap: Zieh / an. du'ya emir: Zieh … an! (ayrılabilen fiilde ön ek an sona gider). Cümlede ayrı Akkusativ nesne (eine warme Jacke) olduğu için dönüşlü zamir Dativ: dir. Karşılaştır: Zieh dich an! (başka nesne yok → dich).
- DE/EN açıklamaları da güncellendi.

#### `challenge-10` › 0
Cümle: Vor dem Essen wasche ich ___ die Hände.

Gerekçe: Açıklama 'die Hände = Akkusativ nesne → mir' diyerek mir'i Akkusativ gibi gösteriyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: mir. die Hände = Akkusativ nesne → mir.
  - Yeni: Doğru cevap: mir. Cümlede ayrı bir Akkusativ nesne (die Hände) var; bu yüzden dönüşlü zamir Dativ olur: ich → mir. Karşılaştır: Vor dem Essen wasche ich mich. (başka nesne yok → mich).

#### `saetze-bilden-9` › 4
Cümle: Bilde den Satz: ich / die Hände / sich waschen

Gerekçe: Açıklama 'die Hände Akkusativ nesne → mir' diyerek kuralı yanlış gösteriyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich wasche mir die Hände.. die Hände Akkusativ nesne → mir.  Reflexivpronomen özneye göre seçilir. Bazı fiiller sabit prepozisyon ister; ayrıca ayrı bir Akkusativ nesne varsa mir/dir gibi Dativ reflexiv biçimleri görülebilir. Bu üretim sorusunda çekim kadar kelime sırası ve yazım da önemlidir.
  - Yeni: Doğru cevap: Ich wasche mir die Hände. Cümlede ayrı bir Akkusativ nesne (die Hände) olduğu için dönüşlü zamir Dativ olur: ich → mir. Karşılaştır: Ich wasche mich. (başka nesne yok → mich).

#### `praepositionen-1-5` › 4
Cümle: Anna hat gestern ein Geschenk bekommen. Sie freut sich ___ das Geschenk.

Gerekçe: Bağlamsız 'Sie freut sich ___ das Geschenk.' cümlesinde 'auf' da doğruydu (henüz alınmamış hediyeyi beklemek). Bağlam eklenerek tek doğru cevap sağlandı.

- Cümle
  - Eski: Sie freut sich ___ das Geschenk.
  - Yeni: Anna hat gestern ein Geschenk bekommen. Sie freut sich ___ das Geschenk.
- Açıklama (TR)
  - Eski: Doğru cevap: über. Alınan/gerçekleşen şey → sich freuen über.
  - Yeni: Doğru cevap: über. Hediye zaten alındı (gestern bekommen) → olmuş bir şeye sevinmek: sich freuen über. Karşılaştır: Sie freut sich auf ihren Geburtstag. (gelecekteki bir şeyi dört gözle beklemek → auf).
- DE/EN açıklamaları da güncellendi.

#### `praepositionen-2-6` › 9
Cümle: Wir treffen uns morgen ___ unseren Kollegen.

Gerekçe: Çeldirici 'bei' de doğruydu: 'Wir treffen uns morgen bei unseren Kollegen' (meslektaşlarımızın evinde buluşuyoruz). bei → an olarak değiştirildi.

- Seçenekler
  - Eski: `mit` / `bei` / `nach`
  - Yeni: `mit` / `an` / `um`
- Açıklama (TR)
  - Eski: Doğru cevap: mit. sich treffen mit.
  - Yeni: Doğru cevap: mit. Kiminle buluşulduğu sich treffen mit + Dativ ile söylenir: mit unseren Kollegen. an ve um bu fiille kişi için kullanılmaz.
- DE/EN açıklamaları da güncellendi.

#### `dialoge-8` › 7
Cümle: A: Kennst du noch unser erstes Klassenzimmer? B: Ja, ich ___ mich gut ___.

Gerekçe: Cümlede üç boşluk vardı ama seçenekler iki parçalıydı; fazla boşluk silindi.

- Cümle
  - Eski: A: Kennst du noch unser erstes Klassenzimmer? B: Ja, ich ___ mich gut ___ ___.
  - Yeni: A: Kennst du noch unser erstes Klassenzimmer? B: Ja, ich ___ mich gut ___.
- Açıklama (TR)
  - Eski: Doğru cevap: erinnere / daran. sich an etwas erinnern → daran.
  - Yeni: Doğru cevap: erinnere / daran. sich erinnern an + şey; şeyin yerine geçen zamir da- + an → daran (daran = ona/onu). Karşılaştır: Ich freue mich darüber. (sich freuen über)
- DE/EN açıklamaları da güncellendi.

#### `challenge-10` › 9
Cümle: Bilde den Satz: Petra / vor dem Spiegel / die Haare / sich kämmen

Gerekçe: 'Petra kämmt sich die Haare vor dem Spiegel.' sıralaması da doğru, ama kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `petra kämmt sich vor dem spiegel die haare` / `petra kaemmt sich vor dem spiegel die haare`
  - Yeni: `petra kämmt sich vor dem spiegel die haare` / `petra kaemmt sich vor dem spiegel die haare` / `petra kämmt sich die haare vor dem spiegel` / `petra kaemmt sich die haare vor dem spiegel`

### `data/a1/artikel.json`

#### `muster-2` › 8
Cümle: ___ Häuschen ist alt.

Gerekçe: İpucu '-lein' yazıyordu ve açıklama 'Häuschen'i -lein örneği sayıyordu; Häuschen -chen ile biter.

- word
  - Eski: -lein
  - Yeni: -chen
- Açıklama (TR)
  - Eski: Doğru cevap: das. -lein her zaman nötrdür: das Häuschen.
  - Yeni: Doğru cevap: das. Häuschen (küçük ev) -chen ile biter; -chen ve -lein ile biten küçültme isimleri her zaman nötrdür: das Häuschen. Karşılaştır: das Büchlein (-lein).

#### `master-12` › 5
Cümle: Schreibe Artikel + Nomen: ___ schmeckt gut. (Brötchen)

Gerekçe: Yönergede Almanca-Türkçe karışık yazım vardı ('Schreibe doğru Artikel').

- Cümle
  - Eski: Schreibe doğru Artikel + Nomen: ___ schmeckt gut. (Brötchen)
  - Yeni: Schreibe Artikel + Nomen: ___ schmeckt gut. (Brötchen)

#### `master-12` › 6
Cümle: Schreibe Artikel + Nomen: ___ ist wichtig. (Freundschaft)

Gerekçe: Yönergede Almanca-Türkçe karışık yazım vardı ('Schreibe doğru Artikel').

- Cümle
  - Eski: Schreibe doğru Artikel + Nomen: ___ ist wichtig. (Freundschaft)
  - Yeni: Schreibe Artikel + Nomen: ___ ist wichtig. (Freundschaft)

#### `master-12` › 7
Cümle: Schreibe Artikel + Nomen: ___ ist warm. (Sommer)

Gerekçe: Yönergede Almanca-Türkçe karışık yazım vardı ('Schreibe doğru Artikel').

- Cümle
  - Eski: Schreibe doğru Artikel + Nomen: ___ ist warm. (Sommer)
  - Yeni: Schreibe Artikel + Nomen: ___ ist warm. (Sommer)

#### `master-12` › 8
Cümle: Schreibe Artikel + Nomen: ___ ist sehr nützlich. (Wörterbuch)

Gerekçe: Yönergede Almanca-Türkçe karışık yazım vardı ('Schreibe doğru Artikel').

- Cümle
  - Eski: Schreibe doğru Artikel + Nomen: ___ ist sehr nützlich. (Wörterbuch)
  - Yeni: Schreibe Artikel + Nomen: ___ ist sehr nützlich. (Wörterbuch)

#### `master-12` › 9
Cümle: Schreibe Artikel + Nomen: ___ liegen auf dem Tisch. (Bücher)

Gerekçe: Yönergede Almanca-Türkçe karışık yazım vardı ('Schreibe doğru Artikel').

- Cümle
  - Eski: Schreibe doğru Artikel + Nomen: ___ liegen auf dem Tisch. (Bücher)
  - Yeni: Schreibe Artikel + Nomen: ___ liegen auf dem Tisch. (Bücher)

### `data/a1/akkusativ.json`

#### `artikel-1` › 6
Cümle: Wir besuchen ___ Nachbarn am Sonntag.

Gerekçe: İki seçenek doğruydu: 'die Nachbarn' (çoğul) ve 'den Nachbarn' (tekil, n-Deklination). 'den' çeldiricisi 'dem' ile değiştirildi.

- Seçenekler
  - Eski: `die` / `den` / `der`
  - Yeni: `die` / `dem` / `der`
- Açıklama (TR)
  - Eski: Doğru cevap: die. Çoğul belirli artikel Akkusativ'te die olarak kalır.
  - Yeni: Doğru cevap: die. İpucu çoğul: die Nachbarn. Çoğulda belirli artikel Akkusativ'te de die kalır. (Not: tekil olsaydı der Nachbar → Akkusativ den Nachbarn olurdu; bu yüzden 'den' seçeneği kaldırıldı.)
- DE/EN açıklamaları da güncellendi.

#### `dialoge-5` › 9
Cümle: A: Was habt ihr? B: Wir haben ___.

Gerekçe: Açıklama çeldiricilerin (Ticketen/Ticketsen) neden yanlış olduğunu ve çoğul ekini söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: zwei Tickets. Sayıdan sonra plural isim doğrudan Akkusativ'te aynı çoğul biçimde kalır.
  - Yeni: Doğru cevap: zwei Tickets. Ticket'in çoğulu -s ile yapılır: das Ticket → die Tickets. Çoğul isim Akkusativ'te de aynı biçimde kalır; 'Ticketen' ve 'Ticketsen' diye bir biçim yoktur.

#### `wen-was-12` › 7
Cümle: Stelle die Frage: Ich brauche einen Termin.

Gerekçe: Cümleyi söyleyen kişiye doğal soru 'Was brauchst du?' olur; bu cevap kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Was brauche ich. Termin şey/soyut nesne: Was?
  - Yeni: Doğru cevap: Was brauche ich / Was brauchst du? Termin bir şeydir (kişi değil), bu yüzden Was? ile sorulur. Kişi olsaydı Wen? kullanılırdı.
- Kabul edilen cevaplar
  - Eski: `was brauche ich`
  - Yeni: `was brauche ich` / `was brauchst du`

#### `fragen-antworten-20` › 2
Cümle: Antworte: Wen trefft ihr? (euer Lehrer)

Gerekçe: Açıklama ('Soru ihr grubuna sorulmuş olabilir') kafa karıştırıcıydı; euer → unser değişiminin nedeni anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir treffen unseren Lehrer. Soru ihr grubuna sorulmuş olabilir; cevap 'Wir ...'. Lehrer maskulin: unseren.
  - Yeni: Doğru cevap: Wir treffen unseren Lehrer. Soru ihr ile sorulduğu için cevap wir ile verilir; bu yüzden euer → unser olur. Lehrer maskulin ve Akkusativ: unseren Lehrer.

#### `haben-brauchen-kaufen-13` › 0
Cümle: Ergänze vollständig: Ich habe ___ . (ein Termin)

Gerekçe: İpucu '(der Termin)' belirli artikel veriyordu ama cevap belirsiz 'einen Termin' idi. İpucu '(ein Termin)' yapıldı.

- Cümle
  - Eski: Ergänze vollständig: Ich habe ___ . (der Termin)
  - Yeni: Ergänze vollständig: Ich habe ___ . (ein Termin)
- Açıklama (TR)
  - Eski: Doğru cevap: einen Termin. haben doğrudan nesne alır; Termin maskulin.
  - Yeni: Doğru cevap: einen Termin. haben Akkusativ nesne alır; Termin maskulin olduğu için ein → einen olur.

#### `kein-kontrast-17` › 3
Cümle: Ergänze negativ: Sie kauft ___ Tasche.

Gerekçe: Türkçe açıklamada İngilizce ifade vardı ('negative article').

- Açıklama (TR)
  - Eski: Doğru cevap: keine. Feminin negative article keine.
  - Yeni: Doğru cevap: keine. Tasche feminin; feminin olumsuz artikel Akkusativ'te değişmez: keine Tasche.

#### `kein-kontrast-17` › 6
Cümle: Ergänze negativ: Er hat ___ Freunde hier.

Gerekçe: Türkçe açıklamada İngilizce ifade vardı ('negative article').

- Açıklama (TR)
  - Eski: Doğru cevap: keine. Plural negative article keine.
  - Yeni: Doğru cevap: keine. Freunde çoğul; çoğulda olumsuz artikel Akkusativ'te keine olur.

#### `alltag-21` › 7
Cümle: Durum: Yeni telefonu beğeniyorsun. (das neue Handy)

Gerekçe: 'beğenmek' için 'Ich mag das neue Handy.' da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich finde das neue handy gut`
  - Yeni: `ich finde das neue handy gut` / `ich mag das neue handy`

#### `alltag-21` › 9
Cümle: Durum: Kardeşin için bir hediye alıyorsun.

Gerekçe: Türkçe 'kardeş' cinsiyet belirtmez (Bruder/Schwester), ve 'für meinen Bruder' nesneden önce de gelebilir; bu doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich kaufe ein geschenk fuer meinen bruder` / `ich kaufe ein geschenk für meinen bruder`
  - Yeni: `ich kaufe ein geschenk fuer meinen bruder` / `ich kaufe ein geschenk für meinen bruder` / `ich kaufe für meinen bruder ein geschenk` / `ich kaufe fuer meinen bruder ein geschenk` / `ich kaufe ein geschenk für meine schwester` / `ich kaufe ein geschenk fuer meine schwester` / `ich kaufe für meine schwester ein geschenk` / `ich kaufe fuer meine schwester ein geschenk`

#### `kontexte-22` › 1
Cümle: Bilde: Sekreter bir randevu ayarlıyor. (ein Termin)

Gerekçe: Türkçe 'sekreter' cinsiyet belirtmez; 'Der Sekretär macht einen Termin.' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `die sekretaerin macht einen termin` / `die sekretärin macht einen termin`
  - Yeni: `die sekretaerin macht einen termin` / `die sekretärin macht einen termin` / `der sekretär macht einen termin` / `der sekretaer macht einen termin`

#### `kontexte-22` › 8
Cümle: Bilde: Biz yazıcıyı bulamıyoruz. (der Drucker / nicht finden)

Gerekçe: İpucu 'kein finden' diyordu ama cevap 'nicht' kullanıyordu; açıklama anlaşılmıyordu. Kural: belirli artikelli isim nicht ile olumsuzlanır.

- Cümle
  - Eski: Bilde: Biz yazıcıyı bulamıyoruz. (der Drucker / kein finden)
  - Yeni: Bilde: Biz yazıcıyı bulamıyoruz. (der Drucker / nicht finden)
- Açıklama (TR)
  - Eski: Doğru cevap: Wir finden den Drucker nicht. Drucker maskulin: den; nicht fiil/nesne ilişkisindeki bulunamama anlamını olumsuzlar.
  - Yeni: Doğru cevap: Wir finden den Drucker nicht. Belirli artikelli nesne (den Drucker) kein ile değil nicht ile olumsuzlanır; nicht cümlenin sonuna gelir. Karşılaştır: Wir finden keinen Drucker. (belirsiz: hiç yazıcı bulamıyoruz)
- Kabul edilen cevaplar
  - Eski: `wir finden den drucker nicht`
  - Yeni: `wir finden den drucker nicht` / `wir können den drucker nicht finden`

#### `fehlerkorrektur-23` › 9
Cümle: Korrigiere: Wen kaufst du? – Ein Buch.

Gerekçe: Normal tire (-) ile yazılan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `was kaufst du? – ein buch`
  - Yeni: `was kaufst du? – ein buch` / `was kaufst du? - ein buch` / `was kaufst du - ein buch` / `was kaufst du? ein buch`

#### `master-24` › 9
Cümle: Durum: Sen hiç kahve içmiyorsun ama her gün çay içiyorsun.

Gerekçe: Virgülsüz yazım ve kısaltılmış 'aber jeden Tag Tee' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich trinke keinen kaffee, aber ich trinke jeden tag tee`
  - Yeni: `ich trinke keinen kaffee, aber ich trinke jeden tag tee` / `ich trinke keinen kaffee aber ich trinke jeden tag tee` / `ich trinke keinen kaffee, aber jeden tag tee` / `ich trinke keinen kaffee aber jeden tag tee`

#### `akkusativ-praepositionen-18` › 0
Cümle: Ergänze: Das Geschenk ist ___ meinen Bruder.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fuer meinen bruder` / `für meinen bruder`
  - Yeni: `fuer meinen bruder` / `für meinen bruder` / `für` / `fuer`

#### `akkusativ-praepositionen-18` › 1
Cümle: Ergänze: Ich gehe nicht ___ meinen Regenschirm raus.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ohne meinen regenschirm`
  - Yeni: `ohne meinen regenschirm` / `ohne`

#### `akkusativ-praepositionen-18` › 2
Cümle: Ergänze: Das Auto fährt ___ einen Baum.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `gegen einen baum`
  - Yeni: `gegen einen baum` / `gegen`

#### `akkusativ-praepositionen-18` › 3
Cümle: Ergänze: Wir gehen ___ den See.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `um den see`
  - Yeni: `um den see` / `um`

#### `akkusativ-praepositionen-18` › 4
Cümle: Ergänze: Ich kaufe Blumen ___ meine Mutter.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fuer meine mutter` / `für meine mutter`
  - Yeni: `fuer meine mutter` / `für meine mutter` / `für` / `fuer`

#### `akkusativ-praepositionen-18` › 5
Cümle: Ergänze: Er trinkt Kaffee ___ Zucker.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ohne zucker`
  - Yeni: `ohne zucker` / `ohne`

#### `akkusativ-praepositionen-18` › 6
Cümle: Ergänze: Sie spielt ___ ihre Freundin.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `gegen ihre freundin`
  - Yeni: `gegen ihre freundin` / `gegen`

#### `akkusativ-praepositionen-18` › 7
Cümle: Ergänze: Die Kinder laufen ___ das Haus.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `um das haus`
  - Yeni: `um das haus` / `um`

#### `akkusativ-praepositionen-18` › 8
Cümle: Ergänze: Wir brauchen Tickets ___ die Kinder.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fuer die kinder` / `für die kinder`
  - Yeni: `fuer die kinder` / `für die kinder` / `für` / `fuer`

#### `akkusativ-praepositionen-18` › 9
Cümle: Ergänze: Du kannst nicht ___ deinen Pass reisen.

Gerekçe: Boşluğa yalnızca prepozisyon gelir (artikel ve isim cümlede zaten var), ama yalnızca prepozisyonu yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ohne deinen pass`
  - Yeni: `ohne deinen pass` / `ohne`

### `data/a1/imperativ.json`

#### `du-regelmaessig-1` › 0
Cümle: Bilde den Imperativ (du): „Du wartest hier.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Warte hier. Bei warten wird im Imperativ du die Form „warte“ verwendet.
  - Yeni: Doğru cevap: Warte hier. du-Imperativ: du wartest → -st düşer → wart-; kök -t ile bittiği için -e eklenmesi zorunludur: warte. Karşılaştır: komm (kök -t/-d ile bitmiyor, -e gerekmez).

#### `du-regelmaessig-1` › 1
Cümle: Bilde: „Du arbeitest heute zu Hause.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Arbeite heute zu Hause. arbeiten → arbeite; -e ist hier nötig/natürlich.
  - Yeni: Doğru cevap: Arbeite heute zu Hause. Kök -t ile bitiyor (arbeit-); bu yüzden du-Imperativ'de -e zorunludur: arbeite. Karşılaştır: frag (-e isteğe bağlı).

#### `du-regelmaessig-1` › 8
Cümle: Bilde: „Du badest heute.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Bade heute. baden → bade; bei -d/-t ist -e üblich.
  - Yeni: Doğru cevap: Bade heute. Kök -d ile bittiği için (bad-) du-Imperativ'de -e eklenir: bade.

#### `negation-9` › 5
Cümle: Bilde negativ (Sie): „Sie machen das Licht an.“

Gerekçe: Açıklama ('nicht, anlam odağına göre önce gelir') kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Machen Sie das Licht nicht an. anmachen ayrılır; nicht, anlam odağına göre önce gelir.
  - Yeni: Doğru cevap: Machen Sie das Licht nicht an. Ayrılabilen fiilde ön ek (an) en sona gider; nicht onun hemen önüne gelir: … nicht an.

#### `sie-4` › 0
Cümle: Bilde den formellen Imperativ: „Sie warten hier.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Warten Sie hier. Formeller Imperativ: Infinitiv/Präsensform + Sie.
  - Yeni: Doğru cevap: Warten Sie hier. Formel emir: fiil (Sie biçimi) başa gelir, ardından Sie: Warten Sie … Düz cümlede ise: Sie warten hier.

#### `du-regelmaessig-1` › 3
Cümle: Bilde: „Du lernst die Wörter.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. Ayrıca -e'li doğru biçim ('Lerne') kabul edilmiyordu. du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Lern die Wörter. Bei vielen regelmäßigen Verben wird die du-Endung -st entfernt.
  - Yeni: Doğru cevap: Lern die Wörter. du-Imperativ: du lernst → -st ve du düşer: lern. Düzenli fiillerde -e eklemek isteğe bağlıdır: Lerne die Wörter! de doğrudur.
- Kabul edilen cevaplar
  - Eski: `lern die woerter` / `lern die wörter`
  - Yeni: `lern die woerter` / `lern die wörter` / `lerne die woerter` / `lerne die wörter`

#### `du-regelmaessig-1` › 4
Cümle: Bilde: „Du machst die Tür zu.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Mach die Tür zu. machen → mach; trennbarer Zusatz „zu“ bleibt am Satzende.
  - Yeni: Doğru cevap: Mach die Tür zu. du machst → mach (Mache da olur). zumachen ayrılabilen fiildir; ön ek zu cümlenin sonuna gider.
- Kabul edilen cevaplar
  - Eski: `mach die tuer zu` / `mach die tür zu`
  - Yeni: `mach die tuer zu` / `mach die tür zu` / `mache die tuer zu` / `mache die tür zu`

#### `du-regelmaessig-1` › 5
Cümle: Bilde: „Du suchst deinen Schlüssel.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `such deinen schluessel` / `such deinen schlüssel`
  - Yeni: `such deinen schluessel` / `such deinen schlüssel` / `suche deinen schluessel` / `suche deinen schlüssel`

#### `du-regelmaessig-1` › 6
Cümle: Bilde: „Du fragst den Lehrer.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `frag den lehrer`
  - Yeni: `frag den lehrer` / `frage den lehrer`

#### `du-regelmaessig-1` › 7
Cümle: Bilde: „Du kaufst Brot.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `kauf brot`
  - Yeni: `kauf brot` / `kaufe brot`

#### `du-unregelmaessig-2` › 7
Cümle: Bilde: „Du fährst vorsichtig.“

Gerekçe: Açıklama a → ä değişiminin kalktığını ama e → i değişiminin kaldığını ayırt etmiyordu; -e'li biçim kabul edilmiyordu. du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Fahr vorsichtig. fahren'ın du-Imperativinde Umlaut kaldırılır: fahr.
  - Yeni: Doğru cevap: Fahr vorsichtig. du fährst'teki Umlaut (a → ä) Imperativ'de kalkar: fahr (ya da fahre). Karşılaştır: e → i değişimi kalır: nehmen → nimm.
- Kabul edilen cevaplar
  - Eski: `fahr vorsichtig`
  - Yeni: `fahr vorsichtig` / `fahre vorsichtig`

#### `du-unregelmaessig-2` › 8
Cümle: Bilde: „Du läufst nicht so schnell.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `lauf nicht so schnell`
  - Yeni: `lauf nicht so schnell` / `laufe nicht so schnell`

#### `du-unregelmaessig-2` › 9
Cümle: Bilde: „Du schläfst länger.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `schlaf laenger` / `schlaf länger`
  - Yeni: `schlaf laenger` / `schlaf länger` / `schlafe laenger` / `schlafe länger`

#### `akkusativpronomen-du-6` › 0
Cümle: Ersetze das Objekt durch ein Pronomen: „Kauf das Buch!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `kauf es`
  - Yeni: `kauf es` / `kaufe es`

#### `akkusativpronomen-du-6` › 2
Cümle: Ersetze: „Such den Schlüssel!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `such ihn`
  - Yeni: `such ihn` / `suche ihn`

#### `akkusativpronomen-du-6` › 3
Cümle: Ersetze: „Wasch das Hemd!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wasch es`
  - Yeni: `wasch es` / `wasche es`

#### `akkusativpronomen-du-6` › 4
Cümle: Ersetze: „Bestell eine Pizza!“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Bestell eine. eine Pizza kann in diesem Muster mit „eine“ ersetzt werden.
  - Yeni: Doğru cevap: Bestell eine. Belirsiz artikelli nesne (eine Pizza) sie ile değil, belirsiz zamirle değiştirilir: eine (= bir tane). Karşılaştır: Bestell die Pizza! → Bestell sie!
- Kabul edilen cevaplar
  - Eski: `bestell eine`
  - Yeni: `bestell eine` / `bestelle eine`

#### `akkusativpronomen-du-6` › 8
Cümle: Ersetze: „Bau das Haus!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `bau es`
  - Yeni: `bau es` / `baue es`

#### `negation-9` › 0
Cümle: Bilde negativ (du): „Du rauchst hier.“

Gerekçe: Açıklama belirsizdi ('ilgili unsurdan sonra/son bölüme yakın'). du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Rauch hier nicht. Negation genellikle ilgili unsurdan sonra/son bölüme yakın „nicht“ ile yapılır.
  - Yeni: Doğru cevap: Rauch hier nicht. Bütün eylem olumsuzlanınca nicht cümlenin sonuna gelir: Rauch hier nicht! (Rauche da doğrudur.)
- Kabul edilen cevaplar
  - Eski: `rauch hier nicht`
  - Yeni: `rauch hier nicht` / `rauche hier nicht`

#### `negation-9` › 6
Cümle: Bilde negativ (du): „Du fährst so schnell.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Fahr nicht so schnell. fahren → fahr; nicht vor der Art und Weise.
  - Yeni: Doğru cevap: Fahr nicht so schnell. fahren → fahr (Umlaut kalkar). nicht, nasıl yapıldığını söyleyen ifadeden (so schnell) önce gelir.
- Kabul edilen cevaplar
  - Eski: `fahr nicht so schnell`
  - Yeni: `fahr nicht so schnell` / `fahre nicht so schnell`

#### `negation-9` › 9
Cümle: Bilde negativ (du): „Du machst die Tür auf.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mach die tuer nicht auf` / `mach die tür nicht auf`
  - Yeni: `mach die tuer nicht auf` / `mach die tür nicht auf` / `mache die tuer nicht auf` / `mache die tür nicht auf`

#### `trennbar-du-10` › 0
Cümle: Bilde den Imperativ (du): „Du machst das Fenster auf.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mach das fenster auf`
  - Yeni: `mach das fenster auf` / `mache das fenster auf`

#### `trennbar-du-10` › 1
Cümle: Bilde: „Du ziehst den Mantel an.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `zieh den mantel an`
  - Yeni: `zieh den mantel an` / `ziehe den mantel an`

#### `trennbar-du-10` › 2
Cümle: Bilde: „Du räumst dein Zimmer auf.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `raeum dein zimmer auf` / `räum dein zimmer auf`
  - Yeni: `raeum dein zimmer auf` / `räum dein zimmer auf` / `raeume dein zimmer auf` / `räume dein zimmer auf`

#### `trennbar-du-10` › 3
Cümle: Bilde: „Du steigst aus.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `steig aus`
  - Yeni: `steig aus` / `steige aus`

#### `trennbar-du-10` › 4
Cümle: Bilde: „Du fährst das Auto weg.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fahr das auto weg`
  - Yeni: `fahr das auto weg` / `fahre das auto weg`

#### `trennbar-du-10` › 5
Cümle: Bilde: „Du bringst den Patienten her.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `bring den patienten her`
  - Yeni: `bring den patienten her` / `bringe den patienten her`

#### `trennbar-du-10` › 6
Cümle: Bilde: „Du kommst herein.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `komm herein`
  - Yeni: `komm herein` / `komme herein`

#### `trennbar-du-10` › 7
Cümle: Bilde: „Du schreibst das Diktat mit.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `schreib das diktat mit`
  - Yeni: `schreib das diktat mit` / `schreibe das diktat mit`

#### `trennbar-du-10` › 8
Cümle: Bilde: „Du rufst mich an.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ruf mich an`
  - Yeni: `ruf mich an` / `rufe mich an`

#### `trennbar-du-10` › 9
Cümle: Bilde: „Du fängst an.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fang an`
  - Yeni: `fang an` / `fange an`

#### `frage-antwort-13` › 1
Cümle: Antworte (du): „Soll ich den Schlüssel suchen?“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu. Virgülsüz yazım da kabul edildi.

- Kabul edilen cevaplar
  - Eski: `ja, such ihn`
  - Yeni: `ja, such ihn` / `ja, suche ihn` / `ja such ihn` / `ja suche ihn`

#### `frage-antwort-13` › 6
Cümle: Antworte (du): „Soll ich wirklich gehen?“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu. Virgülsüz yazım da kabul edildi.

- Kabul edilen cevaplar
  - Eski: `ja, geh`
  - Yeni: `ja, geh` / `ja, gehe` / `ja geh` / `ja gehe`

#### `trennbar-pronomen-14` › 0
Cümle: Ersetze das Objekt durch ein Pronomen: „Mach das Fenster auf!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mach es auf`
  - Yeni: `mach es auf` / `mache es auf`

#### `trennbar-pronomen-14` › 1
Cümle: Ersetze: „Zieh den Mantel an!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `zieh ihn an`
  - Yeni: `zieh ihn an` / `ziehe ihn an`

#### `trennbar-pronomen-14` › 2
Cümle: Ersetze: „Räum das Zimmer auf!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `raeum es auf` / `räum es auf`
  - Yeni: `raeum es auf` / `räum es auf` / `raeume es auf` / `räume es auf`

#### `trennbar-pronomen-14` › 3
Cümle: Ersetze: „Bring den Patienten her!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `bring ihn her`
  - Yeni: `bring ihn her` / `bringe ihn her`

#### `trennbar-pronomen-14` › 4
Cümle: Ersetze: „Schreib das Diktat mit!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `schreib es mit`
  - Yeni: `schreib es mit` / `schreibe es mit`

#### `trennbar-pronomen-14` › 5
Cümle: Ersetze: „Schließ die Katze nicht ein!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `schliess sie nicht ein` / `schließ sie nicht ein`
  - Yeni: `schliess sie nicht ein` / `schließ sie nicht ein` / `schliesse sie nicht ein` / `schließe sie nicht ein`

#### `trennbar-pronomen-14` › 6
Cümle: Ersetze: „Streich den Fehler durch!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `streich ihn durch`
  - Yeni: `streich ihn durch` / `streiche ihn durch`

#### `trennbar-pronomen-14` › 7
Cümle: Ersetze: „Steck das Geld ein!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `steck es ein`
  - Yeni: `steck es ein` / `stecke es ein`

#### `alltag-15` › 0
Cümle: Bilde einen passenden Imperativ (du): „Das Zimmer ist unordentlich.“ (aufräumen)

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `raeum das zimmer auf` / `räum das zimmer auf`
  - Yeni: `raeum das zimmer auf` / `räum das zimmer auf` / `raeume das zimmer auf` / `räume das zimmer auf`

#### `alltag-15` › 1
Cümle: Bilde (du): „Es ist dunkel.“ (Licht anmachen)

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mach das licht an`
  - Yeni: `mach das licht an` / `mache das licht an`

#### `alltag-15` › 4
Cümle: Bilde (du): „Du bist müde.“ (schlafen)

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `schlaf`
  - Yeni: `schlaf` / `schlafe`

#### `alltag-15` › 7
Cümle: Bilde (du): „Deine Hände sind schmutzig.“ (waschen)

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wasch deine haende` / `wasch deine hände`
  - Yeni: `wasch deine haende` / `wasch deine hände` / `wasche deine haende` / `wasche deine hände`

#### `reise-weg-16` › 2
Cümle: Bilde (du): „Du steigst an der nächsten Haltestelle aus.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `steig an der naechsten haltestelle aus` / `steig an der nächsten haltestelle aus`
  - Yeni: `steig an der naechsten haltestelle aus` / `steig an der nächsten haltestelle aus` / `steige an der naechsten haltestelle aus` / `steige an der nächsten haltestelle aus`

#### `reise-weg-16` › 5
Cümle: Bilde (du): „Du fährst langsam.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fahr langsam`
  - Yeni: `fahr langsam` / `fahre langsam`

#### `reise-weg-16` › 8
Cümle: Bilde (du): „Du gehst über die Brücke.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `geh ueber die bruecke` / `geh über die brücke`
  - Yeni: `geh ueber die bruecke` / `geh über die brücke` / `gehe ueber die bruecke` / `gehe über die brücke`

#### `schule-arbeit-17` › 3
Cümle: Bilde (du): „Du hörst gut zu.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `hoer gut zu` / `hör gut zu`
  - Yeni: `hoer gut zu` / `hör gut zu` / `hoere gut zu` / `höre gut zu`

#### `schule-arbeit-17` › 6
Cümle: Bilde (du): „Du rufst den Kunden an.“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ruf den kunden an`
  - Yeni: `ruf den kunden an` / `rufe den kunden an`

#### `fehlerkorrektur-18` › 0
Cümle: Korrigiere: „Du mach die Tür zu!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mach die tuer zu` / `mach die tür zu`
  - Yeni: `mach die tuer zu` / `mach die tür zu` / `mache die tuer zu` / `mache die tür zu`

#### `fehlerkorrektur-18` › 5
Cümle: Korrigiere: „Ruf an mich!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ruf mich an`
  - Yeni: `ruf mich an` / `rufe mich an`

#### `fehlerkorrektur-18` › 7
Cümle: Korrigiere: „Fähr nicht so schnell!“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fahr nicht so schnell`
  - Yeni: `fahr nicht so schnell` / `fahre nicht so schnell`

#### `master-20` › 0
Cümle: Antworte (du) und ersetze das Objekt: „Soll ich das Fenster aufmachen?“

Gerekçe: Açıklama dil bilgisi kuralı değil, kaynakla ilgili bir not veriyordu. du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu. Virgülsüz yazım da kabul edildi.

- Açıklama (TR)
  - Eski: Doğru cevap: Ja, mach es auf. Kaynağın iki ana hedefi birleşir: du-Imperativ + Akkusativpronomen + trennbare Verb.
  - Yeni: Doğru cevap: Ja, mach es auf. du-Imperativ: mach; das Fenster → es; aufmachen ayrılabilir, auf sona gider: Mach es auf.
- Kabul edilen cevaplar
  - Eski: `ja, mach es auf`
  - Yeni: `ja, mach es auf` / `ja, mache es auf` / `ja mach es auf` / `ja mache es auf`

#### `master-20` › 3
Cümle: Antworte negativ (du): „Soll ich die Katze einschließen?“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu. Virgülsüz yazım da kabul edildi.

- Kabul edilen cevaplar
  - Eski: `nein, schliess sie nicht ein` / `nein, schließ sie nicht ein`
  - Yeni: `nein, schliess sie nicht ein` / `nein, schließ sie nicht ein` / `nein, schliesse sie nicht ein` / `nein, schließe sie nicht ein` / `nein schliess sie nicht ein` / `nein schließ sie nicht ein` / `nein schliesse sie nicht ein` / `nein schließe sie nicht ein`

#### `master-20` › 6
Cümle: Antworte (du): „Soll ich Thomas anrufen?“

Gerekçe: du-Imperativ'de düzenli fiillere -e eklemek isteğe bağlıdır (mach/mache); -e'li doğru biçim kabul edilmiyordu. Virgülsüz yazım da kabul edildi.

- Kabul edilen cevaplar
  - Eski: `ja, ruf ihn an`
  - Yeni: `ja, ruf ihn an` / `ja, rufe ihn an` / `ja ruf ihn an` / `ja rufe ihn an`

#### `du-regelmaessig-1` › 9
Cümle: Bilde: „Du wechselst das Hemd.“

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. 'wechsel' biçimi de kullanılır; kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wechsle das Hemd. wechseln → wechsle; unbetontes e kann im Stamm entfallen.
  - Yeni: Doğru cevap: Wechsle das Hemd. -eln ile biten fiillerde du-Imperativ -le ile yapılır: wechseln → wechsle (konuşmada 'wechsel' de duyulur).
- Kabul edilen cevaplar
  - Eski: `wechsle das hemd`
  - Yeni: `wechsle das hemd` / `wechsel das hemd`

#### `alltag-15` › 9
Cümle: Bilde (Sie): „Sie haben einen Termin.“ (warten)

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. Ayrıca 'Bitte warten Sie' / 'Warten Sie' kabul edilmiyordu. Eşdeğer doğru cevaplar kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Warten Sie bitte. Formell höflicher Imperativ mit bitte.
  - Yeni: Doğru cevap: Warten Sie bitte. Formel emir: fiil + Sie; bitte cümleyi kibar yapar ve Sie'den sonra ya da başta durabilir.
- Kabul edilen cevaplar
  - Eski: `warten sie bitte`
  - Yeni: `warten sie bitte` / `warten sie` / `bitte warten sie`

#### `alltag-15` › 5
Cümle: Bilde (ihr): „Das Essen ist fertig.“ (kommen)

Gerekçe: Eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `kommt`
  - Yeni: `kommt` / `kommt essen` / `kommt bitte`

#### `frage-antwort-13` › 0
Cümle: Antworte mit Imperativ (du): „Soll ich das Fenster öffnen?“

Gerekçe: Açıklama dil bilgisi kuralı değil, kaynakla ilgili bir not veriyordu. Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ja, öffne es. Kaynak, soru cümlesini Imperativ cevabına çevirip nesneyi zamirle değiştiriyor.
  - Yeni: Doğru cevap: Ja, öffne es. Soll ich …? sorusuna du-Imperativ ile cevap verilir: öffne. das Fenster nötr olduğu için Akkusativ zamiri es olur.
- Kabul edilen cevaplar
  - Eski: `ja, oeffne es` / `ja, öffne es`
  - Yeni: `ja, oeffne es` / `ja, öffne es` / `ja oeffne es` / `ja öffne es`

#### `frage-antwort-13` › 2
Cümle: Antworte (ihr): „Sollen wir die Bücher kaufen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, kauft sie`
  - Yeni: `ja, kauft sie` / `ja kauft sie`

#### `frage-antwort-13` › 3
Cümle: Antworte (ihr): „Sollen wir ein Taxi nehmen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, nehmt eins`
  - Yeni: `ja, nehmt eins` / `ja nehmt eins`

#### `frage-antwort-13` › 4
Cümle: Antworte (Sie): „Soll ich die Rechnung bezahlen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, bezahlen sie sie`
  - Yeni: `ja, bezahlen sie sie` / `ja bezahlen sie sie`

#### `frage-antwort-13` › 5
Cümle: Antworte (Sie): „Darf ich den Tee trinken?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, trinken sie ihn`
  - Yeni: `ja, trinken sie ihn` / `ja trinken sie ihn`

#### `frage-antwort-13` › 7
Cümle: Antworte (ihr): „Sollen wir nach Bonn fahren?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, fahrt nach bonn`
  - Yeni: `ja, fahrt nach bonn` / `ja fahrt nach bonn`

#### `frage-antwort-13` › 8
Cümle: Antworte (Sie): „Soll ich heute hier bleiben?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, bleiben sie heute hier`
  - Yeni: `ja, bleiben sie heute hier` / `ja bleiben sie heute hier`

#### `frage-antwort-13` › 9
Cümle: Antworte negativ (Sie): „Darf ich hier rauchen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `nein, rauchen sie hier nicht`
  - Yeni: `nein, rauchen sie hier nicht` / `nein rauchen sie hier nicht`

#### `master-20` › 1
Cümle: Antworte (ihr): „Sollen wir die Schuhe ausziehen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, zieht sie aus`
  - Yeni: `ja, zieht sie aus` / `ja zieht sie aus`

#### `master-20` › 2
Cümle: Antworte formell: „Darf ich den Wagen wegfahren?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, fahren sie ihn weg`
  - Yeni: `ja, fahren sie ihn weg` / `ja fahren sie ihn weg`

#### `master-20` › 4
Cümle: Antworte (ihr): „Sollen wir das Licht anmachen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, macht es an`
  - Yeni: `ja, macht es an` / `ja macht es an`

#### `master-20` › 5
Cümle: Antworte formell: „Soll ich das Formular ausfüllen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, fuellen sie es aus` / `ja, füllen sie es aus`
  - Yeni: `ja, fuellen sie es aus` / `ja, füllen sie es aus` / `ja fuellen sie es aus` / `ja füllen sie es aus`

#### `master-20` › 7
Cümle: Antworte negativ (Sie): „Darf ich die Datei löschen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `nein, loeschen sie sie nicht` / `nein, löschen sie sie nicht`
  - Yeni: `nein, loeschen sie sie nicht` / `nein, löschen sie sie nicht` / `nein loeschen sie sie nicht` / `nein löschen sie sie nicht`

#### `master-20` › 8
Cümle: Antworte (ihr): „Sollen wir die Pakete mitbringen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, bringt sie mit`
  - Yeni: `ja, bringt sie mit` / `ja bringt sie mit`

#### `master-20` › 9
Cümle: Antworte formell: „Soll ich den Termin absagen?“

Gerekçe: Virgülsüz yazılan doğru cevap ('Ja öffne es') kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ja, sagen sie ihn ab`
  - Yeni: `ja, sagen sie ihn ab` / `ja sagen sie ihn ab`

### `data/a1/lokale-praepositionen.json`

#### `artikel-8` › 7
Cümle: Wir fahren ___ Tunnel. (durch + der)

Gerekçe: Açıklamanın sonu 'sabit Dativ edatı … hâli belirler' diyordu; durch ise daima Akkusativ alır, açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Burada güzergâh bildiren durch edatı nedeniyle Akkusativ gerekir. Tunnel için doğru grup/biçim durch den olur. Hareket olsa bile sabit Dativ edatı veya mevcut konum bilgisi hâli belirler. Doğru cevap: durch den
  - Yeni: Doğru cevap: durch den. durch her zaman Akkusativ ister (hareket olsun olmasın): der Tunnel → durch den Tunnel. Karşılaştır: in dem Tunnel (konum, Dativ).

#### `artikel-8` › 8
Cümle: Sie laufen ___ See herum. (um + der)

Gerekçe: Açıklamanın sonu 'sabit Dativ edatı' diyordu; um daima Akkusativ alır.

- Açıklama (TR)
  - Eski: Burada güzergâh bildiren um edatı nedeniyle Akkusativ gerekir. See herum için doğru grup/biçim um den olur. Hareket olsa bile sabit Dativ edatı veya mevcut konum bilgisi hâli belirler. Doğru cevap: um den
  - Yeni: Doğru cevap: um den. um (etrafında) her zaman Akkusativ ister: der See → um den See herum.

#### `fehlerkorrektur-9` › 8
Cümle: Hatalı / Falsch / Incorrect: Wir gehen durch dem Park. → ___

Gerekçe: Açıklamanın sonu 'sabit Dativ edatı' diyordu; durch daima Akkusativ alır.

- Açıklama (TR)
  - Eski: Burada güzergâh bildiren durch edatı nedeniyle Akkusativ gerekir. durch den Park için doğru grup/biçim durch den Park olur. Hareket olsa bile sabit Dativ edatı veya mevcut konum bilgisi hâli belirler. Doğru cevap: durch den Park
  - Yeni: Doğru cevap: durch den Park. durch her zaman Akkusativ ister; dem (Dativ) yanlıştır: der Park → durch den Park.

#### `nach-zu-3` › 7
Cümle: Fahrt ihr am Samstag ___ Polen?

Gerekçe: Şablon hatası: açıklamada 'Polen? gidilen hedef' yazıyordu (soru işareti isme yapışmış).

- Açıklama (TR)
  - Eski: Polen? gidilen hedef. Şehir veya artikelsiz ülke adına yönelirken nach kullanılır; in bu temel karşılaştırmada bulunulan yeri anlatır. Doğru cevap: nach
  - Yeni: Doğru cevap: nach. Polen artikelsiz bir ülke adıdır; şehir ve artikelsiz ülkelere giderken nach kullanılır. Karşılaştır: in die Türkei (artikelli ülke), zu meiner Oma (kişi).

#### `aus-von-4` › 8
Cümle: Wir kommen ___ zu Hause.

Gerekçe: Açıklama 'zu Hause'u kişi/etkinlik gibi gösteriyordu; sabit kalıp 'von zu Hause' anlatılmıyordu.

- Açıklama (TR)
  - Eski: zu Hause dönüşün/gelmenin başlangıç noktasıdır: kişi, ziyaret veya etkinlik. Bu yüzden von + Dativ seçilir; aus ise bir yerin içinden çıkışı ya da şehir/ülke kökenini öne çıkarır. Doğru cevap: von
  - Yeni: Doğru cevap: von. 'Evden gelmek' kalıbı von zu Hause'dir: von + zu Hause. Karşılaştır: Ich bin zu Hause. (evdeyim) / Ich gehe nach Hause. (eve gidiyorum)

### `data/a1/modalverben.json`

#### `dialoge-4` › 9
Cümle: A: Der Drucker funktioniert nicht. B: Kein Problem, ich ___ später danach sehen.

Gerekçe: Çeldirici 'muss' da bağlama uyuyordu ('Ich muss später danach sehen' = sonra bakmam gerek). Bağlama 'Kein Problem' eklendi, 'muss' yerine 'darf' kondu.

- Cümle
  - Eski: A: Der Drucker funktioniert nicht. B: Ich ___ später danach sehen.
  - Yeni: A: Der Drucker funktioniert nicht. B: Kein Problem, ich ___ später danach sehen.
- Seçenekler
  - Eski: `kann` / `muss` / `soll`
  - Yeni: `kann` / `darf` / `soll`
- Açıklama (TR)
  - Eski: Doğru cevap: kann. Yapabilme/teklif: können.
  - Yeni: Doğru cevap: kann. B yardım teklif ediyor ('Kein Problem'): yapabilme/imkân → können: ich kann. Karşılaştır: Ich muss später danach sehen. (zorunluluk)
- DE/EN açıklamaları da güncellendi.

#### `challenge-7` › 4
Cümle: Wir lieben Sonne und Meer. Wir ___ im Sommer nach Spanien reisen.

Gerekçe: Bağlamsız cümlede üç seçenek de doğruydu (wollen/dürfen/müssen). İstek bildiren bağlam eklendi.

- Cümle
  - Eski: Wir ___ im Sommer nach Spanien reisen.
  - Yeni: Wir lieben Sonne und Meer. Wir ___ im Sommer nach Spanien reisen.
- Açıklama (TR)
  - Eski: Doğru cevap: wollen. Kendi istek/planı: wollen.
  - Yeni: Doğru cevap: wollen. Kişiler kendi isteğini/planını anlatıyor (Sonne und Meer lieben) → wollen. dürfen izin, müssen zorunluluk anlatırdı.
- DE/EN açıklamaları da güncellendi.

#### `schule-arbeit-arzt-22` › 6
Cümle: Bilde: ben / bugün spor yapmamalıyım / sollen + kein

Gerekçe: İpucu 'sollen + nicht' diyordu ama cevap 'keinen Sport' idi. Kural: artikelsiz isim kein ile olumsuzlanır.

- Cümle
  - Eski: Bilde: ben / bugün spor yapmamalıyım / sollen + nicht
  - Yeni: Bilde: ben / bugün spor yapmamalıyım / sollen + kein
- Açıklama (TR)
  - Eski: Doğru cevap: Ich soll heute keinen Sport machen. doktorun tavsiyesi; keinen Sport.
  - Yeni: Doğru cevap: Ich soll heute keinen Sport machen. Doktorun tavsiyesi → sollen. Sport artikelsiz bir isim olduğu için nicht ile değil kein ile olumsuzlanır: keinen Sport (Sport maskulin, Akkusativ).

#### `fehlerkorrektur-23` › 8
Cümle: Korrigiere: Wir dürfen nicht hier parken.

Gerekçe: Açıklama ('A1 doğal söz diziminde…') kuralı açık söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir dürfen hier nicht parken. A1 doğal söz diziminde yer ifadesi ardından nicht + infinitiv.
  - Yeni: Doğru cevap: Wir dürfen hier nicht parken. Bütün cümle olumsuzlanınca nicht yer ifadesinden (hier) sonra, infinitivin (parken) önüne gelir. 'nicht hier' yalnızca karşıtlık için kullanılır: Wir dürfen nicht hier, sondern dort parken.

#### `alltag-21` › 7
Cümle: Durum: Arkadaşına bugün yardım edebilirsin. (können)

Gerekçe: 'Arkadaşına yardım edebilirsin' için 'Ich kann meinem Freund / meiner Freundin heute helfen.' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich kann dir heute helfen`
  - Yeni: `ich kann dir heute helfen` / `ich kann meinem freund heute helfen` / `ich kann meiner freundin heute helfen`

#### `schule-arbeit-arzt-22` › 7
Cümle: Bilde: müdür / toplantıya gelmek istiyor / wollen

Gerekçe: Türkçe 'müdür' cinsiyet belirtmez; 'Die Chefin …' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `der chef will zur besprechung kommen`
  - Yeni: `der chef will zur besprechung kommen` / `die chefin will zur besprechung kommen`

#### `schule-arbeit-arzt-22` › 1
Cümle: Bilde: öğretmen diyor ki / biz metni okumalıyız / sollen

Gerekçe: İpuçtaki 'öğretmen diyor ki' kısmını da yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wir sollen den text lesen`
  - Yeni: `wir sollen den text lesen` / `der lehrer sagt, wir sollen den text lesen` / `die lehrerin sagt, wir sollen den text lesen` / `der lehrer sagt wir sollen den text lesen` / `die lehrerin sagt wir sollen den text lesen`

#### `schule-arbeit-arzt-22` › 5
Cümle: Bilde: doktor diyor ki / ben ilaçları almalıyım / sollen

Gerekçe: İpuçtaki 'doktor diyor ki' kısmını da yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich soll die medikamente nehmen`
  - Yeni: `ich soll die medikamente nehmen` / `der arzt sagt, ich soll die medikamente nehmen` / `die ärztin sagt, ich soll die medikamente nehmen` / `der arzt sagt ich soll die medikamente nehmen` / `die ärztin sagt ich soll die medikamente nehmen`

#### `master-24` › 3
Cümle: Bilde: der Arzt sagt / du / mehr / schlafen / sollen

Gerekçe: Verilen 'der Arzt sagt' öğesini de kullanan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `du sollst mehr schlafen`
  - Yeni: `du sollst mehr schlafen` / `der arzt sagt, du sollst mehr schlafen` / `der arzt sagt du sollst mehr schlafen`

#### `master-24` › 9
Cümle: Durum: Öğretmen, yarın kitabı getirmenizi söylüyor. (sollen)

Gerekçe: 'Wir sollen das Buch morgen mitbringen.' sıralaması da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wir sollen morgen das buch mitbringen`
  - Yeni: `wir sollen morgen das buch mitbringen` / `wir sollen das buch morgen mitbringen`

### `data/a1/negation.json`

#### `nicht-wortstellung-1` › 0
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama 'Ich arbeite nicht heute' seçeneğinin neden yanlış olduğunu söylemiyordu (fiil zaten 2. pozisyonda).

- Açıklama (TR)
  - Eski: Doğru cevap: Ich arbeite heute nicht.. Basit ana cümlede çekimli fiil ikinci pozisyonda kalır; “nicht” fiilden önce gelmez.
  - Yeni: Doğru cevap: Ich arbeite heute nicht. Çekimli fiil 2. pozisyonda kalır. Bütün cümle olumsuzlanınca nicht en sona gelir. 'Ich arbeite nicht heute' yalnızca karşıtlık için kullanılır (nicht heute, sondern morgen).

#### `nicht-schreiben-2` › 8
Cümle: Verneine: „Ich gehe gern joggen.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich gehe nicht gern joggen.. Kaynakta “nicht gern” kullanımına benzer şekilde tercih olumsuzlanır.
  - Yeni: Doğru cevap: Ich gehe nicht gern joggen. gern (severek) olumsuzlanınca nicht onun önüne gelir: nicht gern = sevmeyerek, hoşlanmadan.

#### `nicht-modalverben-4` › 1
Cümle: Verneine: „Wir wollen euch stören.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir wollen euch nicht stören.. Kaynakta doğrudan bu kelime sırası modeli vardır.
  - Yeni: Doğru cevap: Wir wollen euch nicht stören. Modal fiil 2. pozisyonda, infinitiv sonda kalır; nicht infinitivin hemen önüne gelir. Zamir nesne (euch) nicht'ten önce durur.

#### `nicht-modalverben-4` › 5
Cümle: Verneine: „Du musst heute arbeiten.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Du musst heute nicht arbeiten.. Kaynak kapsamındaki temel nicht yerleşimi modal fiille uygulanır.
  - Yeni: Doğru cevap: Du musst heute nicht arbeiten. nicht infinitivin (arbeiten) önüne gelir. Dikkat: nicht müssen = zorunda olmamak (yasak değil!).

#### `nicht-modalverben-4` › 7
Cümle: Verneine: „Ich möchte Kaffee trinken.“

Gerekçe: Cevap anahtarı yanlıştı: 'Ich möchte nicht Kaffee trinken.' standart olumsuz cümle değildir. Artikelsiz isim kein ile olumsuzlanır: 'keinen Kaffee'.

- Cevap
  - Eski: Ich möchte nicht Kaffee trinken.
  - Yeni: Ich möchte keinen Kaffee trinken.
- Kabul edilen cevaplar
  - Eski: `ich moechte nicht kaffee trinken` / `ich möchte nicht kaffee trinken`
  - Yeni: `ich möchte keinen kaffee trinken` / `ich moechte keinen kaffee trinken`
- Açıklama (TR)
  - Eski: Doğru cevap: Ich möchte nicht Kaffee trinken.. Bu alıştırmada eylem/ifade “nicht” ile olumsuzlanır; isim için kein ayrı setlerde çalışılır.
  - Yeni: Doğru cevap: Ich möchte keinen Kaffee trinken. Artikelsiz isim (Kaffee) nicht ile değil kein ile olumsuzlanır: Kaffee maskulin, Akkusativ → keinen Kaffee. 'nicht Kaffee' yalnızca karşıtlıkta kullanılır: Ich möchte nicht Kaffee, sondern Tee trinken.
- DE/EN açıklamaları da güncellendi.

#### `noch-nicht-nicht-mehr-5` › 7
Cümle: Ergänze: „Ich rauche ___.“ (artık)

Gerekçe: 'Ich trinke nicht mehr Kaffee' standart değildir; isimle 'keinen Kaffee mehr' denir (aynı alıştırmanın 9. sorusu da bunu öğretiyor). Cümle fiil olumsuzluğuna çevrildi.

- Cümle
  - Eski: Ergänze: „Ich trinke ___ Kaffee.“ (artık)
  - Yeni: Ergänze: „Ich rauche ___.“ (artık)
- Açıklama (TR)
  - Eski: Doğru cevap: nicht mehr. Artık kahve içmiyorum: nicht mehr.
  - Yeni: Doğru cevap: nicht mehr. Eskiden sigara içiyordu, artık içmiyor: nicht mehr = artık değil. Karşılaştır: isimle kein … mehr kullanılır: Ich trinke keinen Kaffee mehr.
- DE/EN açıklamaları da güncellendi.

#### `noch-nicht-nicht-mehr-5` › 9
Cümle: Ergänze: „Wir haben ___.“ (artık değil)

Gerekçe: Seçenekte 'Kontakt' kelimesi vardı ve cümlede boşluktan sonra yine 'Kontakt' geçiyordu ('Wir haben keinen Kontakt mehr Kontakt'). Fazla kelime silindi.

- Cümle
  - Eski: Ergänze: „Wir haben ___ Kontakt.“ (artık değil)
  - Yeni: Ergänze: „Wir haben ___.“ (artık değil)
- Açıklama (TR)
  - Eski: Doğru cevap: keinen Kontakt mehr. Kaynakta isimle “keinen Kontakt mehr” kullanımı gösterilir.
  - Yeni: Doğru cevap: keinen Kontakt mehr. İsim (Kontakt) nicht ile değil kein ile olumsuzlanır; 'artık' anlamı için mehr eklenir: kein … mehr. Kontakt maskulin, Akkusativ → keinen.
- DE/EN açıklamaları da güncellendi.

#### `kein-grundformen-6` › 3
Cümle: Verneine: „Paul hat Hunger.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Paul hat keinen Hunger.. Kaynakta “Hunger” için keinen kullanılır.
  - Yeni: Doğru cevap: Paul hat keinen Hunger. Artikelsiz isim (Hunger) kein ile olumsuzlanır. Hunger maskulin ve Akkusativ nesne → keinen.

#### `kein-grundformen-6` › 4
Cümle: Verneine: „Anna hat Urlaub.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Anna hat keinen Urlaub.. Kaynakta “Urlaub” için keinen kullanılır.
  - Yeni: Doğru cevap: Anna hat keinen Urlaub. Artikelsiz isim (Urlaub) kein ile olumsuzlanır. Urlaub maskulin ve Akkusativ nesne → keinen.

#### `kein-nomen-7` › 6
Cümle: Verneine: „Ich habe eine Taschenlampe.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich habe keine Taschenlampe.. Kaynakta “keine Taschenlampe” biçimi vardır.
  - Yeni: Doğru cevap: Ich habe keine Taschenlampe. Belirsiz artikelli isim kein ile olumsuzlanır: eine → keine (Taschenlampe feminin).

#### `kein-nomen-7` › 7
Cümle: Verneine: „Tim hat eine Ahnung.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Tim hat keine Ahnung.. Kaynakta “keine Ahnung” doğrudan kullanılır.
  - Yeni: Doğru cevap: Tim hat keine Ahnung. Belirsiz artikelli isim kein ile olumsuzlanır: eine → keine (Ahnung feminin). 'Keine Ahnung!' = Hiç bilmiyorum.

#### `kein-nomen-7` › 8
Cümle: Verneine: „Lisa hat einen Kuchen.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Lisa hat keinen Kuchen.. Kaynakta maskulin Akkusativ “keinen Kuchen” modeli vardır.
  - Yeni: Doğru cevap: Lisa hat keinen Kuchen. einen → keinen: Kuchen maskulin ve Akkusativ nesne.

#### `kein-nomen-7` › 9
Cümle: Verneine: „Peter hat einen Hund.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Peter hat keinen Hund.. Kaynakta “keinen Hund” karşıt cümlesi bulunur.
  - Yeni: Doğru cevap: Peter hat keinen Hund. einen → keinen: Hund maskulin ve Akkusativ nesne.

#### `nichts-9` › 1
Cümle: Verneine mit „nichts“: „Lena sagt etwas.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Lena sagt nichts.. Kaynakta “nichts gesagt” modeli vardır.
  - Yeni: Doğru cevap: Lena sagt nichts. etwas (bir şey) olumsuzlanınca nichts (hiçbir şey) olur. nicht değil: Lena sagt nicht etwas.

#### `nichts-9` › 2
Cümle: Antworte negativ: „Hörst du etwas?“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Nein, ich höre nichts.. Kaynakta bu anlam doğrudan çalışılır.
  - Yeni: Doğru cevap: Nein, ich höre nichts. Soru etwas ile soruluyor; olumsuz cevapta etwas → nichts. Fiil ich'e göre: ich höre.

#### `nichts-9` › 7
Cümle: Verneine: „Mara möchte etwas trinken.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Mara möchte nichts trinken.. Kaynak kapsamındaki modal fiil + nichts + infinitiv düzeni.
  - Yeni: Doğru cevap: Mara möchte nichts trinken. etwas → nichts; modal fiil (möchte) 2. pozisyonda, infinitiv (trinken) sonda kalır.

#### `niemand-10` › 8
Cümle: Verneine: „Jemand hat aufgeräumt.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Niemand hat aufgeräumt.. Kaynakta niemand özne olarak Perfekt cümlesinde geçer.
  - Yeni: Doğru cevap: Niemand hat aufgeräumt. jemand (biri) → niemand (hiç kimse). Özne olduğu için Nominativ: niemand; Perfekt'te fiil düzeni değişmez.

#### `niemand-formen-11` › 0
Cümle: Ergänze: „Peter kennt ___.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: niemanden. Kaynakta kennen fiilinin nesnesi için niemanden kullanılır.
  - Yeni: Doğru cevap: niemanden. kennen Akkusativ nesne alır; niemand'ın Akkusativ biçimi niemanden'dir.

#### `niemand-formen-11` › 4
Cümle: Ergänze: „Wem gehört das Fahrrad? – ___.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Niemandem. Kaynakta “Wem ...? – Niemandem.” biçimi doğrudan verilir.
  - Yeni: Doğru cevap: Niemandem. gehören Dativ ister; soru da Dativ (Wem?). niemand'ın Dativ biçimi niemandem'dir.

#### `nirgendwo-12` › 0
Cümle: Verneine mit „nirgendwo“: „Ich finde den Schlüssel überall.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich finde den Schlüssel nirgendwo.. Kaynakta überall karşıtı olarak nirgendwo kullanılır.
  - Yeni: Doğru cevap: Ich finde den Schlüssel nirgendwo. überall (her yerde) karşıtı nirgendwo (hiçbir yerde) olur.

#### `nirgendwo-12` › 1
Cümle: Verneine mit „nirgendwo“: „Wir haben überall gesucht.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir haben nirgendwo gesucht.. Kaynakta bu karşıtlık doğrudan gösterilir.
  - Yeni: Doğru cevap: Wir haben nirgendwo gesucht. überall → nirgendwo (hiçbir yerde). Perfekt'te nirgendwo Partizip II'den (gesucht) önce durur.

#### `noch-nichts-niemals-13` › 9
Cümle: Gegenteil: „Er ist schon einmal geflogen.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Er ist noch niemals geflogen.. Kaynakta bu anlam için niemals/noch niemals kullanımı desteklenir.
  - Yeni: Doğru cevap: Er ist noch niemals geflogen. schon einmal (daha önce bir kez) karşıtı noch nie / noch niemals (henüz hiç) olur.

#### `negationswort-waehlen-15` › 2
Cümle: Mara hat den ganzen Abend ___ gesagt.

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: nichts. Kaynakta “nichts gesagt” modeli vardır.
  - Yeni: Doğru cevap: nichts. Söylenen 'şey' olumsuzlanıyor: hiçbir şey = nichts. nicht ve keine burada nesne yerine geçemez.

#### `negationswort-waehlen-15` › 7
Cümle: Das verrate ich dir ___.

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: nicht. Kaynakta “Das verrate ich dir nicht.” modeli vardır.
  - Yeni: Doğru cevap: nicht. Cümlede zaten nesne var (das, dir); eylemin kendisi olumsuzlanıyor → nicht, sona gelir.

#### `negationswort-waehlen-15` › 8
Cümle: Sie hat ___ Ahnung.

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: keine. Kaynakta “keine Ahnung” kullanılır.
  - Yeni: Doğru cevap: keine. Ahnung bir isimdir (feminin); isim kein ile olumsuzlanır: keine Ahnung.

#### `satzbau-16` › 6
Cümle: Ordne und schreibe: „Peter / keine / haben / Ahnung“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Peter hat keine Ahnung.. Kaynakta geçen “keine Ahnung” kalıbı.
  - Yeni: Doğru cevap: Peter hat keine Ahnung. Fiil 2. pozisyonda (hat); isim (Ahnung, feminin) keine ile olumsuzlanır.

#### `satzbau-16` › 8
Cümle: Ordne und schreibe: „der Kaffee / nicht mehr / heiß / sein“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Kaffee ist nicht mehr heiß.. Kaynakta “nicht mehr heiß” yapısı bulunur.
  - Yeni: Doğru cevap: Der Kaffee ist nicht mehr heiß. sein 2. pozisyonda; nicht mehr (artık değil) sıfattan (heiß) önce gelir.

#### `satzbau-16` › 9
Cümle: Ordne und schreibe: „die Kinder / noch nicht / schlafen / wollen“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Kinder wollen noch nicht schlafen.. Kaynakta modal fiille “noch nicht schlafen” yapısı bulunur.
  - Yeni: Doğru cevap: Die Kinder wollen noch nicht schlafen. Modal fiil 2. pozisyonda, infinitiv sonda; noch nicht (henüz değil) infinitivden önce gelir.

#### `fehlerkorrektur-17` › 9
Cümle: Korrigiere: „Wir haben überall nicht gesucht.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir haben nirgendwo gesucht.. Yer olumsuzluğunda kaynakta überall ↔ nirgendwo karşıtlığı kullanılır.
  - Yeni: Doğru cevap: Wir haben nirgendwo gesucht. 'überall nicht' denmez; 'hiçbir yerde' tek kelimeyle nirgendwo'dur.

#### `b1-nein-a1-mix-19` › 3
Cümle: Verneine: „Eine Freundin kommt mit.“

Gerekçe: Açıklama 'keine ihrer Freundinnen' gibi soruda olmayan bir yapıdan söz ediyordu; kafa karıştırıcıydı.

- Açıklama (TR)
  - Eski: Doğru cevap: Keine Freundin kommt mit.. Kaynakta “keine ihrer Freundinnen” kişi grubunu olumsuzlar; burada temel keine kullanılır.
  - Yeni: Doğru cevap: Keine Freundin kommt mit. Özne belirsiz artikelli bir isim (eine Freundin); isim kein ile olumsuzlanır: eine → keine.

#### `b1-nein-a1-mix-19` › 9
Cümle: Verneine: „Ich habe eine Taschenlampe.“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich habe keine Taschenlampe.. Kaynakta “keine Taschenlampe” kullanımı vardır.
  - Yeni: Doğru cevap: Ich habe keine Taschenlampe. eine → keine: belirsiz artikelli isim kein ile olumsuzlanır.

#### `master-20` › 8
Cümle: Antworte negativ: „Was und wen konntet ihr im Dunkeln sehen?“

Gerekçe: Açıklama yalnızca kaynağa atıf yapıyordu ('Kaynakta…'), kuralı anlatmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir konnten nichts und niemanden sehen.. Kaynağın son sorusundaki nichts + niemanden kombinasyonu temel alınır.
  - Yeni: Doğru cevap: Wir konnten nichts und niemanden sehen. Was? (şey) → nichts; Wen? (kişi, Akkusativ) → niemanden.

#### `nirgendwo-12` › 3
Cümle: Antworte negativ: „Wo ist mein Handy?“

Gerekçe: 'Ich finde es nirgendwo.' gibi doğal doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mein handy ist nirgendwo`
  - Yeni: `mein handy ist nirgendwo` / `ich finde es nirgendwo` / `es ist nirgendwo` / `ich finde mein handy nirgendwo`

#### `nirgendwo-12` › 9
Cümle: Antworte negativ: „Wo kann ich das kaufen?“

Gerekçe: Eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `du kannst das nirgendwo kaufen`
  - Yeni: `du kannst das nirgendwo kaufen` / `das kannst du nirgendwo kaufen` / `man kann das nirgendwo kaufen`

#### `satzbau-16` › 7
Cümle: Ordne und schreibe: „ich / niemanden / kennen / hier“

Gerekçe: 'Ich kenne niemanden hier.' sıralaması da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich kenne hier niemanden`
  - Yeni: `ich kenne hier niemanden` / `ich kenne niemanden hier`

#### `fehlerkorrektur-17` › 5
Cümle: Korrigiere: „Wem gehört das? – Niemanden.“

Gerekçe: Normal tire (-) ile yazılan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wem gehoert das? – niemandem` / `wem gehört das? – niemandem`
  - Yeni: `wem gehoert das? – niemandem` / `wem gehört das? – niemandem` / `wem gehört das? - niemandem` / `wem gehoert das? - niemandem`

### `data/a1/perfekt.json`

#### `haben-sein-1` › 0
Cümle: Ich ___ gestern eine Pizza gegessen.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: habe. essen bildet das Perfekt mit haben; ich → habe.
  - Yeni: Doğru cevap: habe. essen nesne alan (Akkusativ) bir fiildir ve yer/durum değişimi anlatmaz → Perfekt haben ile: ich habe … gegessen.

#### `haben-sein-1` › 1
Cümle: Wir ___ am Wochenende nach Hamburg gefahren.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: sind. fahren mit Ortswechsel bildet hier das Perfekt mit sein; wir → sind.
  - Yeni: Doğru cevap: sind. fahren bir yerden bir yere hareket anlattığı için Perfekt'i sein ile kurar. (Nesne alırsa haben: Ich habe das Auto gefahren.) wir → sind.

#### `haben-sein-1` › 2
Cümle: Paul ___ gestern lange gearbeitet.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: hat. arbeiten bildet das Perfekt mit haben; Paul = er → hat.
  - Yeni: Doğru cevap: hat. arbeiten yer/durum değişimi anlatmaz → haben. Paul = er → hat.

#### `haben-sein-1` › 3
Cümle: ___ ihr gestern ins Kino gegangen?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Seid. gehen nimmt sein; ihr → seid.
  - Yeni: Doğru cevap: Seid. gehen bir yere gitmeyi (yer değişimi) anlatır → sein. ihr → seid.

#### `haben-sein-1` › 4
Cümle: Meine Eltern ___ die Zeitung gelesen.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: haben. lesen nimmt haben; meine Eltern = sie Plural → haben.
  - Yeni: Doğru cevap: haben. lesen nesne alır, yer değişimi yok → haben. meine Eltern = sie (çoğul) → haben.

#### `haben-sein-1` › 5
Cümle: Mia ___ spät nach Hause gekommen.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: ist. kommen nimmt sein; Mia = sie → ist.
  - Yeni: Doğru cevap: ist. kommen yer değişimi anlatır → sein. Mia = sie (tekil) → ist.

#### `haben-sein-1` › 6
Cümle: Ich ___ heute noch nicht gefrühstückt.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: habe. frühstücken nimmt haben; ich → habe.
  - Yeni: Doğru cevap: habe. frühstücken yer/durum değişimi anlatmaz → haben. ich → habe.

#### `haben-sein-1` › 7
Cümle: Wann ___ du heute aufgestanden?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: bist. aufstehen beschreibt einen Zustandswechsel und nimmt sein; du → bist.
  - Yeni: Doğru cevap: bist. aufstehen durum değişimi anlatır (yatarken kalkmak) → sein. du → bist.

#### `haben-sein-1` › 8
Cümle: Was ___ ihr am Samstag gemacht?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: habt. machen nimmt haben; ihr → habt.
  - Yeni: Doğru cevap: habt. machen yer/durum değişimi anlatmaz → haben. ihr → habt.

#### `haben-sein-1` › 9
Cümle: Wir ___ gestern zu Hause geblieben.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: sind. bleiben ist eine wichtige sein-Ausnahme; wir → sind.
  - Yeni: Doğru cevap: sind. bleiben hareket anlatmasa da Perfekt'i sein ile kurar (önemli istisna). wir → sind.

#### `sein-verben-4` › 2
Cümle: Wir ___ mit dem Zug nach Köln gefahren.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: sind. Ortswechsel mit fahren → sein.
  - Yeni: Doğru cevap: sind. fahren bir yerden bir yere hareket anlattığı için Perfekt'i sein ile kurar. (Nesne alırsa haben: Ich habe das Auto gefahren.)

#### `sein-verben-4` › 3
Cümle: Mein Bruder ___ nach Wien geflogen.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: ist. fliegen als Ortswechsel → sein.
  - Yeni: Doğru cevap: ist. fliegen burada bir yere uçmayı (yer değişimi) anlatır → sein. Mein Bruder = er → ist.

#### `sein-verben-4` › 7
Cümle: Er ___ schnell müde geworden.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: ist. werden → geworden und nimmt sein.
  - Yeni: Doğru cevap: ist. werden (olmak, dönüşmek) durum değişimi anlatır → sein; Partizip II: geworden.

#### `sein-verben-4` › 8
Cümle: Das Kind ___ sofort eingeschlafen.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: ist. einschlafen = Zustandswechsel → sein.
  - Yeni: Doğru cevap: ist. einschlafen (uykuya dalmak) durum değişimi anlatır → sein.

#### `sein-verben-4` › 9
Cümle: Wir ___ sehr früh aufgewacht.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: sind. aufwachen = Zustandswechsel → sein.
  - Yeni: Doğru cevap: sind. aufwachen (uyanmak) durum değişimi anlatır → sein. wir → sind.

#### `haben-konjugation-11` › 8
Cümle: Ergänze formell: ___ Sie die E-Mail gelesen?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Haben. formelles Sie + haben → haben.
  - Yeni: Doğru cevap: Haben. Resmî Sie, fiil çekiminde çoğul gibi davranır: Sie haben.

#### `haben-konjugation-11` › 9
Cümle: Ergänze: Wer ___ das Fenster geöffnet?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: hat. wer wird grammatisch wie 3. Person Singular behandelt → hat.
  - Yeni: Doğru cevap: hat. Soru kelimesi wer özne olduğunda fiil 3. tekil şahıs gibi çekilir: wer hat.

#### `sein-konjugation-12` › 8
Cümle: Ergänze formell: ___ Sie mit dem Zug gefahren?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Sind. formelles Sie + sein → sind.
  - Yeni: Doğru cevap: Sind. Resmî Sie, fiil çekiminde çoğul gibi davranır: Sie sind.

#### `sein-konjugation-12` › 9
Cümle: Ergänze: Wer ___ gestern gekommen?

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: ist. wer → 3. Person Singular → ist.
  - Yeni: Doğru cevap: ist. Soru kelimesi wer özne olduğunda fiil 3. tekil şahıs gibi çekilir: wer ist.

#### `tagesablauf-9` › 3
Cümle: Ergänze komplett: Dann ___ ich zur Schule ___. (fahren)

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: bin / gefahren. fahren mit Ortswechsel → sein + gefahren.
  - Yeni: Doğru cevap: bin / gefahren. fahren bir yerden bir yere hareket anlattığı için Perfekt'i sein ile kurar. (Nesne alırsa haben: Ich habe das Auto gefahren.)

#### `challenge-10` › 0
Cümle: Bilde den Satz: wir / gestern / nach München / fahren

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir sind gestern nach München gefahren. fahren mit Ziel → sein + gefahren.
  - Yeni: Doğru cevap: Wir sind gestern nach München gefahren. fahren bir yerden bir yere hareket anlattığı için Perfekt'i sein ile kurar. (Nesne alırsa haben: Ich habe das Auto gefahren.)

#### `fehlerkorrektur-26` › 1
Cümle: Korrigiere: Wir haben nach Köln gefahren.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir sind nach Köln gefahren. fahren mit Ortswechsel → sein.
  - Yeni: Doğru cevap: Wir sind nach Köln gefahren. fahren bir yerden bir yere hareket anlattığı için Perfekt'i sein ile kurar. (Nesne alırsa haben: Ich habe das Auto gefahren.)

#### `w-fragen-18` › 2
Cümle: Bilde Frage: wohin / Anna / fahren

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wohin ist Anna gefahren. fahren mit Ziel → sein.
  - Yeni: Doğru cevap: Wohin ist Anna gefahren? fahren bir yerden bir yere hareket anlattığı için Perfekt'i sein ile kurar. (Nesne alırsa haben: Ich habe das Auto gefahren.)

#### `regelmaessig-2` › 7
Cümle: Was hat Anna ___?

Gerekçe: Soru cümlesi nokta ile bitiyordu; soru işareti olmalı.

- Cümle
  - Eski: Was hat Anna ___.
  - Yeni: Was hat Anna ___?

#### `regelmaessig-2` › 9
Cümle: Wo hast du dein Auto ___?

Gerekçe: Soru cümlesi nokta ile bitiyordu; soru işareti olmalı.

- Cümle
  - Eski: Wo hast du dein Auto ___.
  - Yeni: Wo hast du dein Auto ___?

#### `unregelmaessig-3` › 4
Cümle: Habt ihr den Film ___?

Gerekçe: Soru cümlesi nokta ile bitiyordu; soru işareti olmalı.

- Cümle
  - Eski: Habt ihr den Film ___.
  - Yeni: Habt ihr den Film ___?

#### `unregelmaessig-3` › 6
Cümle: Wer hat dir diese Nummer ___?

Gerekçe: Soru cümlesi nokta ile bitiyordu; soru işareti olmalı.

- Cümle
  - Eski: Wer hat dir diese Nummer ___.
  - Yeni: Wer hat dir diese Nummer ___?

#### `trennbar-5` › 2
Cümle: Wann bist du heute ___?

Gerekçe: Soru cümlesi nokta ile bitiyordu; soru işareti olmalı.

- Cümle
  - Eski: Wann bist du heute ___.
  - Yeni: Wann bist du heute ___?

#### `sein-verben-4` › 4
Cümle: Meine Tante ___ letztes Jahr viel gereist.

Gerekçe: 'Sie' hem 'o (kadın)' hem 'onlar' olabildiği için 'sind' de doğruydu. Özne tekil bir isimle değiştirildi.

- Cümle
  - Eski: Sie ___ letztes Jahr viel gereist.
  - Yeni: Meine Tante ___ letztes Jahr viel gereist.
- Açıklama (TR)
  - Eski: Doğru cevap: ist. reisen → sein; sie Singular → ist.
  - Yeni: Doğru cevap: ist. reisen yer değişimi anlatır → sein. Meine Tante = sie (tekil) → ist.
- DE/EN açıklamaları da güncellendi.

#### `negation-19` › 6
Cümle: Bilde: ich / Hausaufgaben / noch nicht / machen

Gerekçe: Verilen öğelerle kurulabilen eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich habe die hausaufgaben noch nicht gemacht`
  - Yeni: `ich habe die hausaufgaben noch nicht gemacht` / `ich habe meine hausaufgaben noch nicht gemacht` / `ich habe noch keine hausaufgaben gemacht`

#### `master-30` › 2
Cümle: Bilde negativ: wir / noch nicht / Hausaufgaben / machen

Gerekçe: Verilen öğelerle kurulabilen eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wir haben die hausaufgaben noch nicht gemacht`
  - Yeni: `wir haben die hausaufgaben noch nicht gemacht` / `wir haben unsere hausaufgaben noch nicht gemacht` / `wir haben noch keine hausaufgaben gemacht`

#### `negation-19` › 7
Cümle: Bilde: sie / in Berlin / sein

Gerekçe: 'noch nie' ile kurulan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `sie ist nie in berlin gewesen`
  - Yeni: `sie ist nie in berlin gewesen` / `sie ist noch nie in berlin gewesen`

#### `negation-19` › 8
Cümle: Bilde: wir / weiter / warten

Gerekçe: Verilen 'weiter' kelimesini kullanan doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wir haben nicht mehr gewartet`
  - Yeni: `wir haben nicht mehr gewartet` / `wir haben nicht weiter gewartet` / `wir haben nicht mehr weiter gewartet`

#### `zeitangaben-20` › 7
Cümle: Bilde: letzten Monat / er / Auto / verkaufen

Gerekçe: İpucunda artikel verilmediği için 'ein/das Auto' da doğru; yalnızca 'sein Auto' kabul ediliyordu.

- Kabul edilen cevaplar
  - Eski: `letzten monat hat er sein auto verkauft`
  - Yeni: `letzten monat hat er sein auto verkauft` / `letzten monat hat er ein auto verkauft` / `letzten monat hat er das auto verkauft`

#### `essen-einkaufen-24` › 0
Cümle: Bilde: ich / Suppe / kochen

Gerekçe: İpucunda artikel yok; 'eine Suppe' de doğru.

- Kabul edilen cevaplar
  - Eski: `ich habe suppe gekocht`
  - Yeni: `ich habe suppe gekocht` / `ich habe eine suppe gekocht`

#### `essen-einkaufen-24` › 1
Cümle: Bilde: meine Mutter / Kuchen / backen

Gerekçe: İpucunda artikel yok; 'Kuchen' (artikelsiz) de doğru.

- Kabul edilen cevaplar
  - Eski: `meine mutter hat einen kuchen gebacken`
  - Yeni: `meine mutter hat einen kuchen gebacken` / `meine mutter hat kuchen gebacken`

#### `wochenende-21` › 0
Cümle: Durum: Cumartesi futbol oynadın.

Gerekçe: Zaman ifadesi başa alındığında (V2) kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich habe am samstag fussball gespielt` / `ich habe am samstag fußball gespielt`
  - Yeni: `ich habe am samstag fussball gespielt` / `ich habe am samstag fußball gespielt` / `am samstag habe ich fußball gespielt` / `am samstag habe ich fussball gespielt`

#### `wochenende-21` › 2
Cümle: Durum: Akşam bir film izledin.

Gerekçe: Zaman ifadesi başa alındığında (V2) kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich habe am abend einen film gesehen`
  - Yeni: `ich habe am abend einen film gesehen` / `am abend habe ich einen film gesehen`

#### `wochenende-21` › 3
Cümle: Durum: Pazar geç kalktın.

Gerekçe: Zaman ifadesi başa alındığında (V2) kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich bin am sonntag spaet aufgestanden` / `ich bin am sonntag spät aufgestanden`
  - Yeni: `ich bin am sonntag spaet aufgestanden` / `ich bin am sonntag spät aufgestanden` / `am sonntag bin ich spät aufgestanden` / `am sonntag bin ich spaet aufgestanden`

#### `wochenende-21` › 5
Cümle: Durum: Öğleden sonra bisikletle parka gittin.

Gerekçe: Zaman ifadesi başa alındığında (V2) kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich bin am nachmittag mit dem fahrrad in den park gefahren`
  - Yeni: `ich bin am nachmittag mit dem fahrrad in den park gefahren` / `am nachmittag bin ich mit dem fahrrad in den park gefahren`

#### `wochenende-21` › 6
Cümle: Durum: Arkadaşını aradın.

Gerekçe: Türkçe 'arkadaş' cinsiyet belirtmez; 'meine Freundin' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich habe meinen freund angerufen`
  - Yeni: `ich habe meinen freund angerufen` / `ich habe meine freundin angerufen`

#### `wochenende-21` › 7
Cümle: Durum: Akşam evde kaldın.

Gerekçe: Zaman ifadesi başa alındığında (V2) kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich bin am abend zu hause geblieben`
  - Yeni: `ich bin am abend zu hause geblieben` / `am abend bin ich zu hause geblieben`

#### `wochenende-21` › 9
Cümle: Durum: Gece geç uykuya daldın.

Gerekçe: Zaman ifadesi başa alındığında (V2) kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich bin nachts spaet eingeschlafen` / `ich bin nachts spät eingeschlafen`
  - Yeni: `ich bin nachts spaet eingeschlafen` / `ich bin nachts spät eingeschlafen` / `nachts bin ich spät eingeschlafen` / `nachts bin ich spaet eingeschlafen`

#### `dialoge-25` › 2
Cümle: A: Was hat Anna gegessen? B: ___ (Pizza)

Gerekçe: Eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `sie hat pizza gegessen`
  - Yeni: `sie hat pizza gegessen` / `anna hat pizza gegessen` / `sie hat eine pizza gegessen`

#### `dialoge-25` › 6
Cümle: A: Ist der Zug pünktlich angekommen? B: Nein, ___.

Gerekçe: Soruya doğrudan olumsuz cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `er ist zu spaet angekommen` / `er ist zu spät angekommen`
  - Yeni: `er ist zu spaet angekommen` / `er ist zu spät angekommen` / `er ist nicht pünktlich angekommen` / `er ist nicht puenktlich angekommen`

#### `dialoge-25` › 9
Cümle: A: Warum ist Mia zu Hause geblieben? B: ___ (krank)

Gerekçe: 'sein' fiilinde geçmiş için Präteritum 'war' en doğal biçimdir; 'Sie war krank.' ve 'weil'li cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `sie ist krank gewesen`
  - Yeni: `sie ist krank gewesen` / `sie war krank` / `weil sie krank war` / `weil sie krank gewesen ist`

#### `master-30` › 8
Cümle: Bilde: wir / Hotel / reservieren / und / Tickets / kaufen

Gerekçe: İpucunda artikel yok; 'das Hotel' de doğru.

- Kabul edilen cevaplar
  - Eski: `wir haben ein hotel reserviert und tickets gekauft`
  - Yeni: `wir haben ein hotel reserviert und tickets gekauft` / `wir haben das hotel reserviert und tickets gekauft`

#### `master-30` › 9
Cümle: Schreibe einen vollständigen Satz: gestern / ich / nicht / zu Hause / bleiben / sondern / ins Kino / gehen

Gerekçe: Virgülsüz yazım kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `gestern bin ich nicht zu hause geblieben, sondern ins kino gegangen`
  - Yeni: `gestern bin ich nicht zu hause geblieben, sondern ins kino gegangen` / `gestern bin ich nicht zu hause geblieben sondern ins kino gegangen`

### `data/a1/personalpronomen-akkusativ.json`

#### `genus-numerus-5` › 0
Cümle: Ich habe den Laptop. Ich brauche ___ jetzt.

Gerekçe: Cümlede dil bilgisi hatası vardı: 'Ich habe der Laptop.' haben Akkusativ ister → 'den Laptop'.

- Cümle
  - Eski: Ich habe der Laptop. Ich brauche ___ jetzt.
  - Yeni: Ich habe den Laptop. Ich brauche ___ jetzt.
- Açıklama (TR)
  - Eski: Doğru cevap: ihn. der Laptop → ihn.
  - Yeni: Doğru cevap: ihn. der Laptop maskulindir; zamiri er, Akkusativ'te ihn olur (brauchen Akkusativ nesne alır). Karşılaştır: das Problem → es, die Zeitung → sie.

#### `genus-numerus-5` › 4
Cümle: Ich habe den Kaffee. Ich brauche ___ jetzt.

Gerekçe: Cümlede dil bilgisi hatası vardı: 'Ich habe der Kaffee.' haben Akkusativ ister → 'den Kaffee'.

- Cümle
  - Eski: Ich habe der Kaffee. Ich brauche ___ jetzt.
  - Yeni: Ich habe den Kaffee. Ich brauche ___ jetzt.
- Açıklama (TR)
  - Eski: Doğru cevap: ihn. der Kaffee → ihn.
  - Yeni: Doğru cevap: ihn. der Kaffee maskulindir; zamiri er, Akkusativ'te ihn olur (brauchen Akkusativ nesne alır). Karşılaştır: das Problem → es, die Zeitung → sie.

#### `genus-numerus-5` › 8
Cümle: Ich habe den Termin. Ich brauche ___ jetzt.

Gerekçe: Cümlede dil bilgisi hatası vardı: 'Ich habe der Termin.' haben Akkusativ ister → 'den Termin'.

- Cümle
  - Eski: Ich habe der Termin. Ich brauche ___ jetzt.
  - Yeni: Ich habe den Termin. Ich brauche ___ jetzt.
- Açıklama (TR)
  - Eski: Doğru cevap: ihn. der Termin → ihn.
  - Yeni: Doğru cevap: ihn. der Termin maskulindir; zamiri er, Akkusativ'te ihn olur (brauchen Akkusativ nesne alır). Karşılaştır: das Problem → es, die Zeitung → sie.

#### `akk-dialog-2` › 9
Cümle: A: Seht ihr Herrn und Frau Koch? B: Ja, wir sehen ___ dort.

Gerekçe: Cümlede hata vardı: Herr n-Deklination'a girer, Akkusativ'te 'Herrn' olur.

- Cümle
  - Eski: A: Seht ihr Herr und Frau Koch? B: Ja, wir sehen ___ dort.
  - Yeni: A: Seht ihr Herrn und Frau Koch? B: Ja, wir sehen ___ dort.

#### `akkusativverben-10` › 0
Cümle: Ich sehe Paul jeden Tag. Ich sehe ___ jeden Tag.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: ihn. sehen + Akkusativ.
  - Yeni: Doğru cevap: ihn. sehen Akkusativ nesne alır. Paul → er → Akkusativ: ihn.

#### `akkusativverben-10` › 1
Cümle: Kennst du Anna? – Ja, ich kenne ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sie. kennen + Akkusativ.
  - Yeni: Doğru cevap: sie. kennen Akkusativ nesne alır. Anna → sie → Akkusativ: sie.

#### `akkusativverben-10` › 2
Cümle: Wir besuchen unsere Freunde. Wir besuchen ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sie. besuchen + Akkusativ.
  - Yeni: Doğru cevap: sie. besuchen Akkusativ nesne alır. unsere Freunde → sie (çoğul) → Akkusativ: sie.

#### `akkusativverben-10` › 3
Cümle: Ich treffe meinen Chef. Ich treffe ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: ihn. treffen + Akkusativ.
  - Yeni: Doğru cevap: ihn. treffen Akkusativ nesne alır. meinen Chef → er → Akkusativ: ihn.

#### `akkusativverben-10` › 4
Cümle: Kannst du mich hören? – Ja, ich höre ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: dich. hören + Akkusativ.
  - Yeni: Doğru cevap: dich. hören Akkusativ nesne alır. du → du → Akkusativ: dich.

#### `akkusativverben-10` › 5
Cümle: Ich verstehe euch gut. Versteht ihr ___ auch?

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: mich. verstehen + Akkusativ.
  - Yeni: Doğru cevap: mich. verstehen Akkusativ nesne alır. ich → ich → Akkusativ: mich.

#### `akkusativverben-10` › 6
Cümle: Der Lehrer fragt uns. Wir fragen ___ später.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: ihn. fragen + Akkusativ.
  - Yeni: Doğru cevap: ihn. fragen Akkusativ nesne alır. der Lehrer → er → Akkusativ: ihn.

#### `akkusativverben-10` › 7
Cümle: Wir sehen Frau Lang. Wir grüßen ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sie. grüßen + Akkusativ.
  - Yeni: Doğru cevap: sie. grüßen Akkusativ nesne alır. Frau Lang → sie → Akkusativ: sie.

#### `akkusativverben-10` › 8
Cümle: Das Kind liebt seine Eltern. Es liebt ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sie. lieben + Akkusativ.
  - Yeni: Doğru cevap: sie. lieben Akkusativ nesne alır. seine Eltern → sie (çoğul) → Akkusativ: sie.

#### `akkusativverben-10` › 9
Cümle: Ich mag den Film. Ich mag ___.

Gerekçe: Açıklama yalnızca 'fiil + Akkusativ' diyordu; ismin hangi zamire dönüştüğünü göstermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: ihn. mögen + Akkusativ.
  - Yeni: Doğru cevap: ihn. mögen Akkusativ nesne alır. den Film → er → Akkusativ: ihn.

#### `alltag-21` › 0
Cümle: Anahtarını arıyorsun. Sonra onu buluyorsun.

Gerekçe: İsmi ilk kez söyleyip sonra zamir kullanan doğal doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich suche ihn und finde ihn spaeter` / `ich suche ihn und finde ihn später`
  - Yeni: `ich suche ihn und finde ihn spaeter` / `ich suche ihn und finde ihn später` / `ich suche meinen schlüssel und finde ihn später` / `ich suche meinen schluessel und finde ihn spaeter`

#### `alltag-21` › 1
Cümle: Telefonun yeni. Onu her gün kullanıyorsun.

Gerekçe: Virgül veya 'und' ile yazılan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mein handy ist neu. ich benutze es jeden tag`
  - Yeni: `mein handy ist neu. ich benutze es jeden tag` / `mein handy ist neu, ich benutze es jeden tag` / `mein handy ist neu und ich benutze es jeden tag`

#### `alltag-21` › 2
Cümle: Kız kardeşini sık ziyaret ediyorsun.

Gerekçe: Önceden adı geçmeyen kişi için isimle kurulan doğal cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich besuche sie oft`
  - Yeni: `ich besuche sie oft` / `ich besuche meine schwester oft`

#### `alltag-21` › 3
Cümle: Arkadaşların geliyor. Onları istasyondan alıyorsun.

Gerekçe: Görevdeki iki cümleyi de yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich hole sie vom bahnhof ab`
  - Yeni: `ich hole sie vom bahnhof ab` / `meine freunde kommen. ich hole sie vom bahnhof ab` / `meine freunde kommen, ich hole sie vom bahnhof ab`

#### `alltag-21` › 5
Cümle: Öğretmen sizi görüyor. (ihr)

Gerekçe: Türkçe 'öğretmen' cinsiyet belirtmez; 'Die Lehrerin sieht euch.' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `der lehrer sieht euch`
  - Yeni: `der lehrer sieht euch` / `die lehrerin sieht euch`

#### `alltag-21` › 7
Cümle: Anne-babanı hafta sonu ziyaret ediyorsun.

Gerekçe: Önceden adı geçmeyen kişi için isimle kurulan doğal cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich besuche sie am wochenende`
  - Yeni: `ich besuche sie am wochenende` / `ich besuche meine eltern am wochenende`

#### `alltag-21` › 9
Cümle: Müdürünüz sizi yarın görmek istiyor. (ihr)

Gerekçe: 'Müdürünüz' için 'euer Chef' / 'die Chefin' da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `der chef will euch morgen sehen`
  - Yeni: `der chef will euch morgen sehen` / `euer chef will euch morgen sehen` / `die chefin will euch morgen sehen` / `eure chefin will euch morgen sehen`

#### `master-24` › 3
Cümle: Bilde: wen / du / morgen / abholen? – meine Eltern

Gerekçe: Normal tire (-) ile ya da 'morgen' tekrarıyla yazılan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wen holst du morgen ab? – ich hole sie ab`
  - Yeni: `wen holst du morgen ab? – ich hole sie ab` / `wen holst du morgen ab? - ich hole sie ab` / `wen holst du morgen ab? – ich hole sie morgen ab` / `wen holst du morgen ab? - ich hole sie morgen ab`

#### `master-24` › 9
Cümle: Bilde formell: Frau Meier / ich / morgen / besuchen → Pronomen

Gerekçe: Virgülsüz yazım kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `frau meier, ich besuche sie morgen`
  - Yeni: `frau meier, ich besuche sie morgen` / `frau meier ich besuche sie morgen`

### `data/a1/personalpronomen-dativ.json`

#### `dat-kontext-1` › 2
Cümle: Ich erkläre ___ die Aufgabe noch einmal.

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: dir. Die Person, der etwas erklärt wird, steht im Dativ: du → dir.
  - Yeni: Doğru cevap: dir. erklären'de açıklanan şey Akkusativ (die Aufgabe), açıklamanın yapıldığı kişi Dativ olur: du → dir.

#### `dativverben-7` › 4
Cümle: Bilde: die Jacke / sie / gut stehen

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. Ayrıca 'sie' çoğul da olabildiği için 'ihnen' kabul edildi.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Jacke steht ihr gut. stehen im Sinn von 'gut aussehen' + Dativ.
  - Yeni: Doğru cevap: Die Jacke steht ihr gut. stehen 'yakışmak' anlamında Dativ alır: sie (tekil) → ihr. (sie çoğul ise: Die Jacke steht ihnen gut.)
- Kabul edilen cevaplar
  - Eski: `die jacke steht ihr gut`
  - Yeni: `die jacke steht ihr gut` / `die jacke steht ihnen gut`

#### `wie-geht-es-9` › 7
Cümle: Bilde: mir / heute / besser gehen

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; kural Türkçe açıklandı. Ayrıca 'Es geht mir heute besser.' kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Mir geht es heute besser. feste Wendung: jemandem geht es ...
  - Yeni: Doğru cevap: Mir geht es heute besser. 'jemandem geht es …' kalıbında kişi her zaman Dativ'dir: ich → mir. Es geht mir heute besser. de doğrudur.
- Kabul edilen cevaplar
  - Eski: `mir geht es heute besser`
  - Yeni: `mir geht es heute besser` / `es geht mir heute besser`

#### `wie-geht-es-9` › 9
Cümle: Bilde: uns / sehr gut / gehen

Gerekçe: 'Es geht uns sehr gut.' sıralaması da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `uns geht es sehr gut`
  - Yeni: `uns geht es sehr gut` / `es geht uns sehr gut`

#### `wie-geht-es-9` › 3
Cümle: Ergänze: Wie geht es ___ nach der Operation? (sie)

Gerekçe: İpucu '(sie)' çoğul da olabilir; o zaman 'ihnen' doğrudur ama kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ihr`
  - Yeni: `ihr` / `ihnen`

#### `pronomen-zu-nomen-11` › 3
Cümle: Ergänze: Der Film gefällt ihm. (das Kind)

Gerekçe: Türkçe açıklama alanında yazım hatalı Almanca metin vardı ('representieren').

- Açıklama (TR)
  - Eski: Doğru cevap: Der Film gefällt dem Kind. ihm kann auch neutrum es representieren.
  - Yeni: Doğru cevap: Der Film gefällt dem Kind. ihm hem maskulin (er) hem nötr (es) için Dativ zamiridir; burada das Kind → dem Kind.

#### `praepositionen-16` › 8
Cümle: Bilde: du / morgen / zu / ich / kommen

Gerekçe: Açıklama 'Wem?' sorusundan söz ediyordu; burada kural zu + Dativ.

- Açıklama (TR)
  - Eski: Doğru cevap: “Du kommst morgen zu mir”. zu mir. “Bilde: du / morgen / zu / ich / kommen” cümlesinde önce Wem? sorusuna cevap veren kişi/varlığı bul; sonra Nominativ biçimini uygun Dativ zamirine dönüştür.
  - Yeni: Doğru cevap: Du kommst morgen zu mir. zu her zaman Dativ ister: ich → mir.

#### `negation-18` › 5
Cümle: Bilde: ich / Sie / noch nicht antworten

Gerekçe: Açıklama karışıktı; ayrıca Präsens cevap kabul edilmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich habe Ihnen noch nicht geantwortet. formelles Sie → Ihnen; Perfekt burada sadece zamir bağlamı için kullanılır.
  - Yeni: Doğru cevap: Ich habe Ihnen noch nicht geantwortet. antworten Dativ ister; resmî Sie → Ihnen. Präsens'te de doğru: Ich antworte Ihnen noch nicht.
- Kabul edilen cevaplar
  - Eski: `ich habe ihnen noch nicht geantwortet`
  - Yeni: `ich habe ihnen noch nicht geantwortet` / `ich antworte ihnen noch nicht`

#### `referenzketten-20` › 4
Cümle: A: Wir verstehen das nicht. B: Ich erkläre ___ alles.

Gerekçe: Açıklama anlaşılmıyordu ('Konuşan wir'e hitap eden kişi…').

- Açıklama (TR)
  - Eski: Doğru cevap: euch. Konuşan 'wir'e hitap eden kişi çoğul ihr → euch.
  - Yeni: Doğru cevap: euch. A 'wir' diye konuşuyor; B bu gruba 'ihr' diye hitap eder. erklären'de kişi Dativ: ihr → euch.

#### `referenzketten-20` › 9
Cümle: A: Wir haben kein Auto. B: Ich leihe ___ meins.

Gerekçe: Açıklama anlaşılmıyordu ('Karşıdaki wir grubu').

- Açıklama (TR)
  - Eski: Doğru cevap: euch. Karşıdaki wir grubu → euch.
  - Yeni: Doğru cevap: euch. A 'wir' diye konuşuyor; B bu gruba 'ihr' diye hitap eder. leihen'de kişi Dativ: ihr → euch.

#### `alltag-21` › 7
Cümle: Durum: Arkadaşların seni dinliyor. Sen de onları dinliyorsun.

Gerekçe: Türkçe yönergede dil bilgisi hatası vardı ('onlara dinliyorsun' → 'onları dinliyorsun'). 'auch'suz doğru cevap da kabul edildi.

- Cümle
  - Eski: Durum: Arkadaşların seni dinliyor. Sen de onlara dinliyorsun.
  - Yeni: Durum: Arkadaşların seni dinliyor. Sen de onları dinliyorsun.
- Kabul edilen cevaplar
  - Eski: `ich hoere ihnen auch zu` / `ich höre ihnen auch zu`
  - Yeni: `ich hoere ihnen auch zu` / `ich höre ihnen auch zu` / `ich höre ihnen zu` / `ich hoere ihnen zu`

#### `fehlerkorrektur-23` › 3
Cümle: Korrigiere: Ich danke dich. (du)

Gerekçe: Düzeltilecek cümle ('Ich danke euch nicht?') beklenen cevapla uyuşmuyordu (cevapta 'nicht' ve soru yoktu).

- Cümle
  - Eski: Korrigiere: Ich danke euch nicht? (du)
  - Yeni: Korrigiere: Ich danke dich. (du)
- Açıklama (TR)
  - Eski: Doğru cevap: Ich danke dir. du → dir.
  - Yeni: Doğru cevap: Ich danke dir. danken Dativ ister; du → dir (dich Akkusativ'tir).
- DE/EN açıklamaları da güncellendi.

#### `master-24` › 7
Cümle: Korrigiere: Hören die Kinder der Lehrerin zu? – Ja, sie hören sie zu.

Gerekçe: Soru cümlesinin kendisi de hatalıydı ('Die Kinder hören der Lehrerin?' – zu eksik) ve beklenen cevap düzeltilecek cümleyle uyuşmuyordu.

- Cümle
  - Eski: Korrigiere: Die Kinder hören der Lehrerin? – Ja, sie hören sie zu.
  - Yeni: Korrigiere: Hören die Kinder der Lehrerin zu? – Ja, sie hören sie zu.
- Cevap
  - Eski: Die Kinder hören ihr zu
  - Yeni: Ja, sie hören ihr zu
- Kabul edilen cevaplar
  - Eski: `die kinder hoeren ihr zu` / `die kinder hören ihr zu`
  - Yeni: `ja, sie hören ihr zu` / `ja, sie hoeren ihr zu` / `ja sie hören ihr zu` / `sie hören ihr zu` / `sie hoeren ihr zu` / `die kinder hören ihr zu` / `die kinder hoeren ihr zu`
- Açıklama (TR)
  - Eski: Doğru cevap: Die Kinder hören ihr zu. zuhören + Dativ; Lehrerin → ihr.
  - Yeni: Doğru cevap: Ja, sie hören ihr zu. zuhören Dativ ister: die Lehrerin → ihr (sie Akkusativ'tir).
- DE/EN açıklamaları da güncellendi.

#### `trennbare-verben-14` › 2
Cümle: Bilde: ich / sie / Blumen / mitbringen

Gerekçe: İpucu 'sie' çoğul da olabilir; 'ihnen' de doğru.

- Kabul edilen cevaplar
  - Eski: `ich bringe ihr blumen mit`
  - Yeni: `ich bringe ihr blumen mit` / `ich bringe ihnen blumen mit`

#### `modalverben-15` › 7
Cümle: Bilde: er / sie / Blumen bringen / sollen

Gerekçe: İpucu 'sie' çoğul da olabilir; 'ihnen' de doğru.

- Kabul edilen cevaplar
  - Eski: `er soll ihr blumen bringen`
  - Yeni: `er soll ihr blumen bringen` / `er soll ihnen blumen bringen`

#### `negation-18` › 7
Cümle: Bilde: das Fahrrad / sie / nicht gehören

Gerekçe: İpucu 'sie' çoğul da olabilir; 'ihnen' de doğru.

- Kabul edilen cevaplar
  - Eski: `das fahrrad gehoert ihr nicht` / `das fahrrad gehört ihr nicht`
  - Yeni: `das fahrrad gehoert ihr nicht` / `das fahrrad gehört ihr nicht` / `das fahrrad gehört ihnen nicht` / `das fahrrad gehoert ihnen nicht`

#### `wem-fragen-17` › 1
Cümle: Bilde Frage: Ich helfe meiner Mutter.

Gerekçe: Cümleyi söyleyen 'ich' olduğu için 'Wem helfe ich?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wem hilfst du`
  - Yeni: `wem hilfst du` / `wem helfe ich`

#### `wem-fragen-17` › 4
Cümle: Bilde Frage: Ich danke dem Lehrer.

Gerekçe: 'Wem danke ich?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wem dankst du`
  - Yeni: `wem dankst du` / `wem danke ich`

#### `wem-fragen-17` › 6
Cümle: Bilde Frage: Wir zeigen den Gästen das Zimmer.

Gerekçe: 'Wem zeigen wir das Zimmer?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wem zeigt ihr das zimmer`
  - Yeni: `wem zeigt ihr das zimmer` / `wem zeigen wir das zimmer`

#### `wem-fragen-17` › 7
Cümle: Bilde Frage: Ich schicke Paul die E-Mail.

Gerekçe: 'Wem schicke ich die E-Mail?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wem schickst du die e-mail`
  - Yeni: `wem schickst du die e-mail` / `wem schicke ich die e-mail`

#### `wem-fragen-17` › 9
Cümle: Bilde Frage: Ich bringe meinem Vater einen Kaffee.

Gerekçe: 'Wem bringe ich einen Kaffee?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wem bringst du einen kaffee`
  - Yeni: `wem bringst du einen kaffee` / `wem bringe ich einen kaffee`

#### `alltag-21` › 0
Cümle: Durum: Annen alışverişte yardım istiyor. Ona yardım ediyorsun.

Gerekçe: Eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich helfe ihr beim einkauf`
  - Yeni: `ich helfe ihr beim einkauf` / `ich helfe ihr beim einkaufen` / `ich helfe meiner mutter beim einkauf` / `ich helfe meiner mutter beim einkaufen`

#### `alltag-21` › 1
Cümle: Durum: Arkadaşın sana bir kitap veriyor.

Gerekçe: Türkçe 'arkadaş' cinsiyet belirtmez; 'Meine Freundin …' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mein freund gibt mir ein buch`
  - Yeni: `mein freund gibt mir ein buch` / `meine freundin gibt mir ein buch`

#### `alltag-21` › 4
Cümle: Durum: Çocuklar çorbayı seviyor; tadı onlara güzel geliyor.

Gerekçe: İsimle kurulan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `die suppe schmeckt ihnen gut`
  - Yeni: `die suppe schmeckt ihnen gut` / `die suppe schmeckt den kindern gut`

#### `alltag-21` › 5
Cümle: Durum: Kız kardeşine doğum günü hediyesi veriyorsun.

Gerekçe: Eşdeğer doğru cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich schenke ihr ein geburtstagsgeschenk`
  - Yeni: `ich schenke ihr ein geburtstagsgeschenk` / `ich gebe ihr ein geburtstagsgeschenk` / `ich schenke meiner schwester ein geburtstagsgeschenk`

#### `alltag-21` › 6
Cümle: Durum: Komşuna teşekkür ediyorsun.

Gerekçe: Türkçe 'komşu' cinsiyet belirtmez; 'Ich danke ihr.' ve isimli cevaplar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich danke ihm`
  - Yeni: `ich danke ihm` / `ich danke ihr` / `ich danke meinem nachbarn` / `ich danke meiner nachbarin`

#### `alltag-21` › 8
Cümle: Durum: Doktor size resmî olarak bir şey açıklıyor.

Gerekçe: Türkçe 'doktor' cinsiyet belirtmez; 'Die Ärztin …' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `der arzt erklaert ihnen etwas` / `der arzt erklärt ihnen etwas`
  - Yeni: `der arzt erklaert ihnen etwas` / `der arzt erklärt ihnen etwas` / `die ärztin erklärt ihnen etwas` / `die aerztin erklaert ihnen etwas`

#### `fehlerkorrektur-23` › 5
Cümle: Korrigiere: Herr Meier, kann ich Sie helfen?

Gerekçe: Virgülsüz yazım kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `herr meier, kann ich ihnen helfen`
  - Yeni: `herr meier, kann ich ihnen helfen` / `herr meier kann ich ihnen helfen`

#### `master-24` › 9
Cümle: Durum: Arkadaşların sana hediyeler getiriyor ve sen onlara teşekkür ediyorsun.

Gerekçe: Virgüllü yazım kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `meine freunde bringen mir geschenke und ich danke ihnen`
  - Yeni: `meine freunde bringen mir geschenke und ich danke ihnen` / `meine freunde bringen mir geschenke, und ich danke ihnen`

### `data/a1/plural.json`

#### `plural-waehlen-10` › 3
Cümle: Welche Pluralform ist richtig? das Fenster

Gerekçe: Türkçe açıklama alanında Almanca metin vardı; 'Fenstern' çeldiricisinin nerede doğru olduğu da açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Fenster. Fenster verändert sich im Plural nicht.
  - Yeni: Doğru cevap: Fenster. -er ile biten nötr ve maskulin isimlerin çoğu çoğulda değişmez: das Fenster → die Fenster. (Fenstern yalnızca Dativ çoğulda kullanılır: mit den Fenstern.)

#### `reise-schule-arbeit-17` › 7
Cümle: Ergänze: „Wir arbeiten an zwei ___.“ (Projekt)

Gerekçe: Açıklamada Almanca-Türkçe karışık ifade vardı ('Dativ Pluralda zusätzlich -n'); neden Dativ olduğu söylenmiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Projekten. Projekt → Projekte; Dativ Pluralda zusätzlich -n: Projekten.
  - Yeni: Doğru cevap: Projekten. Çoğul: das Projekt → die Projekte. an zwei Projekten arbeiten'de an + Dativ var; Dativ çoğulda isme -n eklenir: Projekten.

#### `s-7` › 3
Cümle: Schreibe den Plural: das Café

Gerekçe: Aksan işareti olmadan yazılan 'Cafes' (Almanca klavyesi olmayanlar için yaygın, umlaut gibi kabul edilmeli) kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `cafés`
  - Yeni: `cafés` / `cafes`

#### `zwei-plurale-13` › 3
Cümle: Ergänze: „In der Stadt gibt es viele ___ und ___.“ (Hotel / Café)

Gerekçe: Aksan işareti olmadan yazılan 'Cafes' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `hotels und cafés`
  - Yeni: `hotels und cafés` / `hotels und cafes`

### `data/a1/possessivartikel.json`

#### `schreiben-6` › 8
Cümle: Die Familie verkauft ___ altes Auto. (sie)

Gerekçe: İpucu ve açıklama 'die Familie'yi çoğul (sie plural) sayıyordu; Familie tekil bir isimdir.

- word
  - Eski: sie plural
  - Yeni: sie
- Açıklama (TR)
  - Eski: Doğru cevap: ihr. sie çoğul → ihr; Auto nötr Akkusativ.
  - Yeni: Doğru cevap: ihr. die Familie tekil ve feminindir (= sie) → sahiplik kökü ihr-. Auto nötr ve Akkusativ nesne olduğu için ek almaz: ihr altes Auto.

### `data/a1/praesens.json`

#### `schreiben-5` › 3
Cümle: Ich ___ einen Kaffee.

Gerekçe: Açıklama ich öznesi için 'wir, ihr ve sie (çoğul) ile kök ünlüsü değişmez' kuralını veriyordu; doğru kural: değişim yalnızca du ve er/sie/es'te.

- Açıklama (TR)
  - Eski: Özne: ich. nehmen → nehme. wir, ihr ve sie (çoğul) ile kök ünlüsü değişmez; kişi eki yine özneye uyar. Doğru cümle: Ich nehme einen Kaffee.
  - Yeni: Doğru cevap: nehme. nehmen'de e → i değişimi yalnızca du ve er/sie/es biçimlerinde olur (du nimmst, er nimmt). ich biçiminde kök değişmez: ich nehme.

### `data/a1/sein-haben.json`

#### `haben-kontext-2` › 0
Cümle: ___ du morgen nach dem Kurs noch Zeit?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: Hast. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Hast du morgen nach dem Kurs noch Zeit?
  - Yeni: Özne: du. Doğru cevap: Hast. Zeit haben (zamanı olmak) kalıbında haben kullanılır. Doğru cümle: Hast du morgen nach dem Kurs noch Zeit?

#### `haben-kontext-2` › 1
Cümle: Meine Schwester ___ seit gestern Kopfschmerzen.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: meine Schwester = sie. Doğru cevap: hat. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Meine Schwester hat seit gestern Kopfschmerzen.
  - Yeni: Özne: meine Schwester = sie. Doğru cevap: hat. Kopfschmerzen haben (başı ağrımak) kalıbında haben kullanılır. Doğru cümle: Meine Schwester hat seit gestern Kopfschmerzen.

#### `haben-kontext-2` › 2
Cümle: Wir ___ heute leider keine Pause.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: wir. Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Wir haben heute leider keine Pause.
  - Yeni: Özne: wir. Doğru cevap: haben. eine Pause haben (molası olmak): bir şeye sahip olma → haben. Doğru cümle: Wir haben heute leider keine Pause.

#### `haben-kontext-2` › 3
Cümle: Warum ___ ihr so viele Taschen dabei?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ihr. Doğru cevap: habt. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Warum habt ihr so viele Taschen dabei?
  - Yeni: Özne: ihr. Doğru cevap: habt. etwas dabei haben (yanında bir şey olmak) → haben. Doğru cümle: Warum habt ihr so viele Taschen dabei?

#### `haben-kontext-2` › 4
Cümle: Das Hotel ___ einen kleinen Fitnessraum.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: das Hotel = es. Doğru cevap: hat. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Das Hotel hat einen kleinen Fitnessraum.
  - Yeni: Özne: das Hotel = es. Doğru cevap: hat. Sahiplik anlatılıyor (otelin bir spor salonu var) → haben. Doğru cümle: Das Hotel hat einen kleinen Fitnessraum.

#### `haben-kontext-2` › 5
Cümle: Ich ___ gerade keine Ahnung.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ich. Doğru cevap: habe. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Ich habe gerade keine Ahnung.
  - Yeni: Özne: ich. Doğru cevap: habe. keine Ahnung haben (hiç fikri olmamak) kalıbında haben kullanılır. Doğru cümle: Ich habe gerade keine Ahnung.

#### `haben-kontext-2` › 6
Cümle: ___ Sie schon einen Termin bei Frau Klein?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: Sie (höflich). Doğru cevap: Haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Haben Sie schon einen Termin bei Frau Klein?
  - Yeni: Özne: Sie (höflich). Doğru cevap: Haben. einen Termin haben (randevusu olmak) → haben. Doğru cümle: Haben Sie schon einen Termin bei Frau Klein?

#### `haben-kontext-2` › 7
Cümle: Die Teilnehmer ___ noch einige Fragen.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: die Teilnehmer = sie (Plural). Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Die Teilnehmer haben noch einige Fragen.
  - Yeni: Özne: die Teilnehmer = sie (Plural). Doğru cevap: haben. Fragen haben (soruları olmak) → haben. Doğru cümle: Die Teilnehmer haben noch einige Fragen.

#### `haben-kontext-2` › 8
Cümle: Er ___ heute sehr viel Arbeit.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: er. Doğru cevap: hat. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Er hat heute sehr viel Arbeit.
  - Yeni: Özne: er. Doğru cevap: hat. Arbeit haben (işi olmak) → haben. Doğru cümle: Er hat heute sehr viel Arbeit.

#### `haben-kontext-2` › 9
Cümle: ___ du Angst vor der Prüfung?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: Hast. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Hast du Angst vor der Prüfung?
  - Yeni: Özne: du. Doğru cevap: Hast. Angst haben (korkmak) kalıbında haben kullanılır; Türkçedeki 'korkuyor musun' sein ile kurulmaz. Doğru cümle: Hast du Angst vor der Prüfung?

#### `sein-oder-haben-3` › 0
Cümle: Nach dem Sport ___ ich großen Hunger.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ich. Doğru cevap: habe. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Nach dem Sport habe ich großen Hunger.
  - Yeni: Özne: ich. Doğru cevap: habe. Türkçede 'acıkmak' denir ama Almancada Hunger haben (açlığı olmak) kalıbı kullanılır → haben. Doğru cümle: Nach dem Sport habe ich großen Hunger.

#### `sein-oder-haben-3` › 1
Cümle: Meine Eltern ___ heute Abend nicht zu Hause.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: meine Eltern = sie (Plural). Doğru cevap: sind. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Meine Eltern sind heute Abend nicht zu Hause.
  - Yeni: Özne: meine Eltern = sie (Plural). Doğru cevap: sind. zu Hause bir yer bildirir; yer için sein kullanılır. Doğru cümle: Meine Eltern sind heute Abend nicht zu Hause.

#### `sein-oder-haben-3` › 2
Cümle: Du ___ recht; der Termin ist wirklich morgen.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: hast. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Du hast recht; der Termin ist wirklich morgen.
  - Yeni: Özne: du. Doğru cevap: hast. recht haben (haklı olmak) kalıbında haben kullanılır; 'haklısın' Almancada sein ile kurulmaz. Doğru cümle: Du hast recht; der Termin ist wirklich morgen.

#### `sein-oder-haben-3` › 3
Cümle: Frau Berger ___ seit Montag krank.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: Frau Berger = sie. Doğru cevap: ist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Frau Berger ist seit Montag krank.
  - Yeni: Özne: Frau Berger = sie. Doğru cevap: ist. krank bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: Frau Berger ist seit Montag krank.

#### `sein-oder-haben-3` › 4
Cümle: Wir ___ Glück: Der Zug wartet noch.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: wir. Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Wir haben Glück: Der Zug wartet noch.
  - Yeni: Özne: wir. Doğru cevap: haben. Glück haben (şanslı olmak) kalıbında haben kullanılır. Doğru cümle: Wir haben Glück: Der Zug wartet noch.

#### `sein-oder-haben-3` › 5
Cümle: ___ ihr mit der Aufgabe schon fertig?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ihr. Doğru cevap: Seid. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Seid ihr mit der Aufgabe schon fertig?
  - Yeni: Özne: ihr. Doğru cevap: Seid. fertig bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: Seid ihr mit der Aufgabe schon fertig?

#### `sein-oder-haben-3` › 6
Cümle: Warum ___ du keinen Durst?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: hast. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Warum hast du keinen Durst?
  - Yeni: Özne: du. Doğru cevap: hast. Durst haben (susamak) kalıbında haben kullanılır. Doğru cümle: Warum hast du keinen Durst?

#### `sein-oder-haben-3` › 7
Cümle: Die neue Kollegin ___ erst seit einer Woche in Berlin.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: die Kollegin = sie. Doğru cevap: ist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Die neue Kollegin ist erst seit einer Woche in Berlin.
  - Yeni: Özne: die Kollegin = sie. Doğru cevap: ist. in Berlin bir yer bildirir; yer için sein kullanılır. Doğru cümle: Die neue Kollegin ist erst seit einer Woche in Berlin.

#### `sein-oder-haben-3` › 8
Cümle: Heute ___ wir genug Zeit für eine Wiederholung.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: wir. Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Heute haben wir genug Zeit für eine Wiederholung.
  - Yeni: Özne: wir. Doğru cevap: haben. Zeit haben (zamanı olmak) kalıbında haben kullanılır. Doğru cümle: Heute haben wir genug Zeit für eine Wiederholung.

#### `sein-oder-haben-3` › 9
Cümle: Vor Prüfungen ___ ich immer ein bisschen nervös.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ich. Doğru cevap: bin. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Vor Prüfungen bin ich immer ein bisschen nervös.
  - Yeni: Özne: ich. Doğru cevap: bin. nervös bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: Vor Prüfungen bin ich immer ein bisschen nervös.

#### `challenge-6` › 0
Cümle: Heute ___ ich keine Lust, lange zu kochen.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ich. Doğru cevap: habe. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Heute habe ich keine Lust, lange zu kochen.
  - Yeni: Özne: ich. Doğru cevap: habe. Lust haben (canı istemek) kalıbında haben kullanılır. Doğru cümle: Heute habe ich keine Lust, lange zu kochen.

#### `challenge-6` › 1
Cümle: Ergänze mit Subjekt und Verb (wir / sein): Entschuldigung, ___ heute etwas spät.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu. 'Doğru cümle' kısmında yönerge metni de yer alıyordu.

- Açıklama (TR)
  - Eski: Özne: wir. Doğru cevap: wir sind. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Ergänze mit Subjekt und Verb (wir / sein): Entschuldigung, wir sind heute etwas spät.
  - Yeni: Özne: wir. Doğru cevap: wir sind. spät bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: Entschuldigung, wir sind heute etwas spät.

#### `challenge-6` › 2
Cümle: ___ Sie noch eine Frage zu diesem Punkt?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: Sie (höflich). Doğru cevap: Haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Haben Sie noch eine Frage zu diesem Punkt?
  - Yeni: Özne: Sie (höflich). Doğru cevap: Haben. eine Frage haben (sorusu olmak) → haben. Doğru cümle: Haben Sie noch eine Frage zu diesem Punkt?

#### `challenge-6` › 3
Cümle: Ergänze mit Verb und Subjekt (du / sein): Warum ___ vor dem Gespräch so nervös?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu. 'Doğru cümle' kısmında yönerge metni de yer alıyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: bist du. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Ergänze mit Verb und Subjekt (du / sein): Warum bist du vor dem Gespräch so nervös?
  - Yeni: Özne: du. Doğru cevap: bist du. nervös bir sıfattır; sıfatla durum bildirirken sein kullanılır. W-Frage'de fiil özneden önce gelir: Warum bist du …? Doğru cümle: Warum bist du vor dem Gespräch so nervös?

#### `challenge-6` › 4
Cümle: Die beiden Räume ___ ungefähr gleich groß.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: die Räume = sie (Plural). Doğru cevap: sind. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Die beiden Räume sind ungefähr gleich groß.
  - Yeni: Özne: die Räume = sie (Plural). Doğru cevap: sind. gleich groß bir özellik bildirir; sıfatla sein kullanılır. Doğru cümle: Die beiden Räume sind ungefähr gleich groß.

#### `challenge-6` › 6
Cümle: Ihr ___ wirklich Pech mit dem Wetter.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ihr. Doğru cevap: habt. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Ihr habt wirklich Pech mit dem Wetter.
  - Yeni: Özne: ihr. Doğru cevap: habt. Pech haben (şanssız olmak) kalıbında haben kullanılır. Doğru cümle: Ihr habt wirklich Pech mit dem Wetter.

#### `challenge-6` › 8
Cümle: Wo ___ eigentlich der Ersatzschlüssel?

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: der Schlüssel = er. Doğru cevap: ist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Wo ist eigentlich der Ersatzschlüssel?
  - Yeni: Özne: der Schlüssel = er. Doğru cevap: ist. Wo? ile yer soruluyor; yer için sein kullanılır. Doğru cümle: Wo ist eigentlich der Ersatzschlüssel?

#### `negation-11` › 5
Cümle: Die Kinder ___ keine Angst.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: die Kinder = sie (Plural). Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Die Kinder haben keine Angst.
  - Yeni: Özne: die Kinder = sie (Plural). Doğru cevap: haben. Angst haben (korkmak) kalıbında haben kullanılır; isim kein ile olumsuzlanır: keine Angst. Doğru cümle: Die Kinder haben keine Angst.

#### `negation-11` › 8
Cümle: Ich ___ keine Ahnung.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ich. Doğru cevap: habe. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Ich habe keine Ahnung.
  - Yeni: Özne: ich. Doğru cevap: habe. keine Ahnung haben (hiç fikri olmamak) kalıbında haben kullanılır. Doğru cümle: Ich habe keine Ahnung.

#### `negation-11` › 11
Cümle: Ihr ___ keine Fragen.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ihr. Doğru cevap: habt. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Ihr habt keine Fragen.
  - Yeni: Özne: ihr. Doğru cevap: habt. Fragen haben (soruları olmak) → haben; isim kein ile olumsuzlanır: keine Fragen. Doğru cümle: Ihr habt keine Fragen.

#### `alltag-12` › 4
Cümle: Meine Mutter ___ heute viel Arbeit.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: meine Mutter = sie. Doğru cevap: hat. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Meine Mutter hat heute viel Arbeit.
  - Yeni: Özne: meine Mutter = sie. Doğru cevap: hat. viel Arbeit haben (çok işi olmak) → haben. Doğru cümle: Meine Mutter hat heute viel Arbeit.

#### `alltag-12` › 11
Cümle: Die Gäste ___ heute Glück mit dem Wetter.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: die Gäste = sie (Plural). Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Die Gäste haben heute Glück mit dem Wetter.
  - Yeni: Özne: die Gäste = sie (Plural). Doğru cevap: haben. Glück haben (şanslı olmak) kalıbında haben kullanılır. Doğru cümle: Die Gäste haben heute Glück mit dem Wetter.

#### `fehler-10` › 11
Cümle: Korrigiere nur die Verbform: Lena und Tom, ihr haben Glück.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ihr. Doğru cevap: Lena und Tom, ihr habt Glück.. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: Lena und Tom, ihr habt Glück.
  - Yeni: Özne: ihr. Doğru cevap: Lena und Tom, ihr habt Glück.. Glück haben (şanslı olmak) kalıbında haben kullanılır; ihr → habt. Doğru cümle: Lena und Tom, ihr habt Glück.

#### `dialog-4` › 0
Cümle: A: Wo ___ du gerade? B: Ich bin noch im Büro.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: bist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Wo bist du gerade? B: Ich bin noch im Büro.
  - Yeni: Özne: du. Doğru cevap: bist. Wo? ile yer soruluyor; yer için sein kullanılır. Doğru cümle: A: Wo bist du gerade? B: Ich bin noch im Büro.

#### `dialog-4` › 1
Cümle: A: ___ Sie morgen Vormittag Zeit? B: Ja, um zehn Uhr.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: Sie (höflich). Doğru cevap: Haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Haben Sie morgen Vormittag Zeit? B: Ja, um zehn Uhr.
  - Yeni: Özne: Sie (höflich). Doğru cevap: Haben. Zeit haben (zamanı olmak) kalıbında haben kullanılır. Doğru cümle: A: Haben Sie morgen Vormittag Zeit? B: Ja, um zehn Uhr.

#### `dialog-4` › 2
Cümle: A: Warum seid ihr noch hier? B: Wir ___ noch Unterricht.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: wir. Doğru cevap: haben. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Warum seid ihr noch hier? B: Wir haben noch Unterricht.
  - Yeni: Özne: wir. Doğru cevap: haben. Unterricht haben (dersi olmak) → haben. Doğru cümle: A: Warum seid ihr noch hier? B: Wir haben noch Unterricht.

#### `dialog-4` › 3
Cümle: A: ___ deine Mutter wieder gesund? B: Ja, es geht ihr gut.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: deine Mutter = sie. Doğru cevap: Ist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Ist deine Mutter wieder gesund? B: Ja, es geht ihr gut.
  - Yeni: Özne: deine Mutter = sie. Doğru cevap: Ist. gesund bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: A: Ist deine Mutter wieder gesund? B: Ja, es geht ihr gut.

#### `dialog-4` › 4
Cümle: A: ___ du ein Problem mit der Aufgabe? B: Ja, Nummer vier verstehe ich nicht.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: Hast. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Hast du ein Problem mit der Aufgabe? B: Ja, Nummer vier verstehe ich nicht.
  - Yeni: Özne: du. Doğru cevap: Hast. ein Problem haben (sorunu olmak) → haben. Doğru cümle: A: Hast du ein Problem mit der Aufgabe? B: Ja, Nummer vier verstehe ich nicht.

#### `dialog-4` › 5
Cümle: A: ___ ihr bereit? B: Ja, wir können anfangen.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: ihr. Doğru cevap: Seid. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Seid ihr bereit? B: Ja, wir können anfangen.
  - Yeni: Özne: ihr. Doğru cevap: Seid. bereit bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: A: Seid ihr bereit? B: Ja, wir können anfangen.

#### `dialog-4` › 6
Cümle: A: ___ Tom ein Auto? B: Nein, er fährt immer mit dem Bus.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: Tom = er. Doğru cevap: Hat. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Hat Tom ein Auto? B: Nein, er fährt immer mit dem Bus.
  - Yeni: Özne: Tom = er. Doğru cevap: Hat. Sahiplik anlatılıyor (ein Auto) → haben. Doğru cümle: A: Hat Tom ein Auto? B: Nein, er fährt immer mit dem Bus.

#### `dialog-4` › 7
Cümle: A: Warum ___ du so müde? B: Ich habe viel Arbeit.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: du. Doğru cevap: bist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Warum bist du so müde? B: Ich habe viel Arbeit.
  - Yeni: Özne: du. Doğru cevap: bist. müde bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: A: Warum bist du so müde? B: Ich habe viel Arbeit.

#### `dialog-4` › 8
Cümle: A: ___ noch jemand eine Frage? B: Ja, ich.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: jemand (Singular). Doğru cevap: Hat. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Hat noch jemand eine Frage? B: Ja, ich.
  - Yeni: Özne: jemand (Singular). Doğru cevap: Hat. eine Frage haben (sorusu olmak) → haben; jemand tekil sayılır. Doğru cümle: A: Hat noch jemand eine Frage? B: Ja, ich.

#### `dialog-4` › 9
Cümle: A: ___ die Apotheke noch offen? B: Ja, bis 20 Uhr.

Gerekçe: Açıklama tüm sorulara aynı kalıp listesini veriyordu ('… ve sorular için haben'); 'sorular için haben' ifadesi soru cümlelerinde haben kullanılır diye anlaşılabiliyordu ve bu soruya özgü sebebi söylemiyordu.

- Açıklama (TR)
  - Eski: Özne: die Apotheke = sie. Doğru cevap: Ist. Bu ifade bir kalıptır: Hunger, Durst, Angst, Glück, Pech, Lust, Recht ve sorular için haben; müde, krank, bereit ve yer için sein kullanılır. Doğru cümle: A: Ist die Apotheke noch offen? B: Ja, bis 20 Uhr.
  - Yeni: Özne: die Apotheke = sie. Doğru cevap: Ist. offen bir sıfattır; sıfatla durum bildirirken sein kullanılır. Doğru cümle: A: Ist die Apotheke noch offen? B: Ja, bis 20 Uhr.

### `data/a1/temporale-praepositionen.json`

#### `am-im-um-1` › 0
Cümle: Wir treffen uns ___ Mittwoch.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Mittwoch bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Mittwoch bir gün → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-1` › 1
Cümle: Der Film beginnt ___ 19:30 Uhr.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: 19:30 Uhr kesin bir saat gösteriyor. Bu yüzden um kullanılır; gegen yaklaşık saat, im ise ay/mevsim anlatır. Doğru cevap: um
  - Yeni: Doğru cevap: um. 19:30 Uhr kesin bir saat → um. Yaklaşık saat için gegen kullanılır (gegen 8 Uhr).

#### `am-im-um-1` › 2
Cümle: Lena hat ___ September Geburtstag.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: September Geburtstag ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. September bir ay → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `am-im-um-1` › 3
Cümle: ___ Winter ist es hier kalt.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Winter ist es hier kalt ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. Winter bir mevsim → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `am-im-um-1` › 4
Cümle: ___ Morgen trinke ich Tee.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Morgen trinke ich Tee bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Morgen günün bir bölümü → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-1` › 5
Cümle: Der Bus fährt ___ 6:45 Uhr.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: 6:45 Uhr kesin bir saat gösteriyor. Bu yüzden um kullanılır; gegen yaklaşık saat, im ise ay/mevsim anlatır. Doğru cevap: um
  - Yeni: Doğru cevap: um. 6:45 Uhr kesin bir saat → um. Yaklaşık saat için gegen kullanılır (gegen 8 Uhr).

#### `am-im-um-1` › 6
Cümle: Ich habe ___ Freitag frei.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Freitag frei bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Freitag bir gün → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-1` › 7
Cümle: ___ Mai besuchen wir Berlin.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Mai besuchen wir Berlin ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. Mai bir ay → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `am-im-um-1` › 8
Cümle: Wir essen ___ Mittag zusammen.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Mittag zusammen bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Mittag günün bir bölümü → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-1` › 9
Cümle: ___ Sommer schwimme ich oft.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Sommer schwimme ich oft ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. Sommer bir mevsim → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 1
Cümle: ___ Sonntag schlafen wir lange.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Sonntag schlafen wir lange bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Sonntag bir gün → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 3
Cümle: ___ Abend lese ich ein Buch.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Abend lese ich ein Buch bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Abend günün bir bölümü → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 4
Cümle: ___ Frühling sind die Parks grün.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Frühling sind die Parks grün ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. Frühling bir mevsim → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 6
Cümle: ___ Wochenende besuche ich meine Eltern.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Wochenende besuche ich meine Eltern bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Wochenende hafta sonu → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 7
Cümle: Wir fahren ___ August ans Meer.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: August ans Meer ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. August bir ay → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 8
Cümle: ___ 12. März habe ich einen Termin.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: 12. März habe ich einen Termin bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. 12. März bir tarih → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `am-im-um-schreiben-2` › 9
Cümle: ___ Nachmittag lerne ich Deutsch.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Nachmittag lerne ich Deutsch bir gün/tarih veya gündüz bölümüdür; bu zaman ifadesi am (= an dem) alır. im ay/mevsim, um ise saat için kullanılır. Doğru cevap: am
  - Yeni: Doğru cevap: am. Nachmittag günün bir bölümü → an + dem = am. Karşılaştır: im Mai (ay), um 8 Uhr (saat).

#### `gemischt-10` › 1
Cümle: Wir fahren ___ Dezember nach Wien. (am / im / um)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Dezember nach Wien ay veya mevsim bildiriyor; bu yüzden im (= in dem) gerekir. am gün/tarih, um kesin saat belirtirdi. Doğru cevap: im
  - Yeni: Doğru cevap: im. Dezember bir ay → in + dem = im. Karşılaştır: am Montag (gün), um 8 Uhr (saat).

#### `zeitraeume-6` › 9
Cümle: Der Zug fährt pünktlich ___ 16:05 Uhr ab.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: 16:05 Uhr ab kesin bir saat gösteriyor. Bu yüzden um kullanılır; gegen yaklaşık saat, im ise ay/mevsim anlatır. Doğru cevap: um
  - Yeni: Doğru cevap: um. 16:05 Uhr kesin bir saat → um. Yaklaşık saat için gegen kullanılır (gegen 8 Uhr).

#### `zeitraeume-6` › 1
Cümle: Der Laden ist von Montag ___ Samstag offen.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Soruda Samstag offen bir bitiş sınırı olarak veriliyor. Bu yüzden bis seçilir; ab başlangıcı, bis bitişi, für ne kadar süre planlandığını belirtir. Doğru cevap: bis
  - Yeni: Doğru cevap: bis. Aralık kalıbı von … bis …: von Montag bis Samstag. Başlangıç von ile, bitiş bis ile verilir.

#### `vor-nach-beim-3` › 1
Cümle: Zuerst esse ich, dann gehe ich spazieren. Ich gehe ___ dem Essen spazieren.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Zuerst esse ich, dann gehe ich spazieren” olay sırasını veriyor. Boşluğun bulunduğu eylem dem Essen spazieren olayından sonra gerçekleşiyor; bu nedenle nach + Dativ gerekir. beim eşzamanlılık anlatırdı. Doğru cevap: nach
  - Yeni: Doğru cevap: nach. İlk cümleye göre önce yemek, sonra yürüyüş var → yürüyüş yemekten sonra: nach + Dativ (nach dem Essen).

#### `vor-nach-beim-3` › 2
Cümle: Ich koche und höre gleichzeitig Radio. Ich höre ___ Kochen Radio.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Ich koche und höre gleichzeitig Radio” iki eylemin aynı anda olduğunu söylüyor. Kochen Radio yapılırken diğer eylem gerçekleştiği için beim (= bei dem) kullanılır; vor/nach bu eşzamanlılığı değiştirir. Doğru cevap: beim
  - Yeni: Doğru cevap: beim. İki eylem aynı anda oluyor (gleichzeitig) → beim (= bei dem) + isimleşmiş fiil: beim Kochen (yemek yaparken).

#### `vor-nach-beim-3` › 3
Cümle: Zuerst endet der Kurs, dann kaufe ich ein. Ich kaufe ___ dem Kurs ein.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Zuerst endet der Kurs, dann kaufe ich ein” olay sırasını veriyor. Boşluğun bulunduğu eylem dem Kurs ein olayından sonra gerçekleşiyor; bu nedenle nach + Dativ gerekir. beim eşzamanlılık anlatırdı. Doğru cevap: nach
  - Yeni: Doğru cevap: nach. Önce kurs bitiyor, sonra alışveriş → alışveriş kurstan sonra: nach + Dativ (nach dem Kurs).

#### `vor-nach-beim-3` › 5
Cümle: Wir essen und sprechen gleichzeitig. Wir sprechen ___ Essen.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Wir essen und sprechen gleichzeitig” iki eylemin aynı anda olduğunu söylüyor. Essen yapılırken diğer eylem gerçekleştiği için beim (= bei dem) kullanılır; vor/nach bu eşzamanlılığı değiştirir. Doğru cevap: beim
  - Yeni: Doğru cevap: beim. İki eylem aynı anda oluyor (gleichzeitig) → beim (= bei dem) + isimleşmiş fiil: beim Essen (yemek yerken).

#### `vor-nach-beim-3` › 7
Cümle: Zuerst arbeite ich, dann fahre ich nach Hause. Ich fahre ___ der Arbeit nach Hause.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Zuerst arbeite ich, dann fahre ich nach Hause” olay sırasını veriyor. Boşluğun bulunduğu eylem der Arbeit nach Hause olayından sonra gerçekleşiyor; bu nedenle nach + Dativ gerekir. beim eşzamanlılık anlatırdı. Doğru cevap: nach
  - Yeni: Doğru cevap: nach. Önce çalışıyor, sonra eve gidiyor → işten sonra: nach + Dativ (nach der Arbeit).

#### `vor-nach-beim-3` › 8
Cümle: Ich frühstücke und lese gleichzeitig. Ich lese ___ Frühstücken.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Ich frühstücke und lese gleichzeitig” iki eylemin aynı anda olduğunu söylüyor. Frühstücken yapılırken diğer eylem gerçekleştiği için beim (= bei dem) kullanılır; vor/nach bu eşzamanlılığı değiştirir. Doğru cevap: beim
  - Yeni: Doğru cevap: beim. İki eylem aynı anda oluyor (gleichzeitig) → beim (= bei dem) + isimleşmiş fiil: beim Frühstücken (kahvaltı ederken).

#### `gemischt-10` › 4
Cümle: Zuerst essen wir, dann trinken wir Tee. Wir trinken ___ dem Essen Tee. (vor / nach / beim)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “Zuerst essen wir, dann trinken wir Tee” olay sırasını veriyor. Boşluğun bulunduğu eylem dem Essen Tee olayından sonra gerçekleşiyor; bu nedenle nach + Dativ gerekir. beim eşzamanlılık anlatırdı. Doğru cevap: nach
  - Yeni: Doğru cevap: nach. Önce yemek, sonra çay → çay yemekten sonra: nach + Dativ (nach dem Essen).

#### `seit-vor-in-4` › 1
Cümle: Heute ist Montag. ___ zwei Tagen ist Mittwoch.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede zwei Tagen ist Mittwoch ifadesi şimdiden sonraki zaman noktası ile ilişkilidir. Sorudaki bugün/şimdi hesabı ileriyi gösterdiği için in kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: in
  - Yeni: Doğru cevap: in. Bugünden ileriye doğru sayılıyor (Montag → Mittwoch) → in + Dativ = … sonra: in zwei Tagen (iki gün sonra).

#### `seit-vor-in-4` › 2
Cümle: Ich habe Anna ___ einer Woche besucht.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede einer Woche besucht ifadesi geçmişteki bitmiş olay ile ilişkilidir. habe … besucht/gefrühstückt veya ist … gekommen geçmişi gösterdiği için vor kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: vor
  - Yeni: Doğru cevap: vor. Ziyaret geçmişte bitti (Perfekt: habe … besucht) → vor + Dativ = … önce: vor einer Woche (bir hafta önce).

#### `seit-vor-in-4` › 4
Cümle: Jetzt ist es 10 Uhr. Der Bus kommt ___ zehn Minuten, also um 10:10 Uhr.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede zehn Minuten, also um 10:10 Uhr ifadesi şimdiden sonraki zaman noktası ile ilişkilidir. Sorudaki bugün/şimdi hesabı ileriyi gösterdiği için in kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: in
  - Yeni: Doğru cevap: in. Şimdiden ileriye doğru (10 Uhr → 10:10 Uhr) → in + Dativ = … sonra: in zehn Minuten (on dakika sonra).

#### `seit-vor-in-4` › 5
Cümle: Ali ist ___ einem Jahr nach Hamburg gekommen.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede einem Jahr nach Hamburg gekommen ifadesi geçmişteki bitmiş olay ile ilişkilidir. habe … besucht/gefrühstückt veya ist … gekommen geçmişi gösterdiği için vor kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: vor
  - Yeni: Doğru cevap: vor. Geliş geçmişte bitti (Perfekt: ist … gekommen) → vor + Dativ = … önce: vor einem Jahr (bir yıl önce).

#### `seit-vor-in-4` › 7
Cümle: Heute ist der 1. Mai. ___ einer Woche, am 8. Mai, beginnt mein Urlaub.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede einer Woche, am 8. Mai, beginnt mein Urlaub ifadesi şimdiden sonraki zaman noktası ile ilişkilidir. Sorudaki bugün/şimdi hesabı ileriyi gösterdiği için in kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: in
  - Yeni: Doğru cevap: in. 1. Mayıs'tan ileriye doğru (8. Mayıs) → in + Dativ = … sonra: in einer Woche (bir hafta sonra).

#### `seit-vor-in-4` › 8
Cümle: Ich habe ___ zwei Stunden gefrühstückt.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede zwei Stunden gefrühstückt ifadesi geçmişteki bitmiş olay ile ilişkilidir. habe … besucht/gefrühstückt veya ist … gekommen geçmişi gösterdiği için vor kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: vor
  - Yeni: Doğru cevap: vor. Kahvaltı geçmişte bitti (Perfekt: habe … gefrühstückt) → vor + Dativ = … önce: vor zwei Stunden (iki saat önce).

#### `seit-vor-in-4` › 9
Cümle: Wir warten ___ zwanzig Minuten und der Bus ist noch nicht da.

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: “zwanzig Minuten und der Bus ist noch nicht da” başlangıç noktasından beri durum hâlâ sürüyor; cümledeki Präsens biçimi bunu destekliyor. Bu nedenle seit gerekir. vor bitmiş geçmişi, in gelecekteki zamanı anlatır. Doğru cevap: seit
  - Yeni: Doğru cevap: seit. Bekleme başladı ve hâlâ sürüyor (Präsens + 'noch nicht da') → seit + Dativ = …dir: seit zwanzig Minuten (yirmi dakikadır).

#### `gemischt-10` › 3
Cümle: Jetzt ist es 12 Uhr. ___ einer Stunde, um 13 Uhr, beginnt der Kurs. (seit / vor / in)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: Bu cümlede einer Stunde, um 13 Uhr, beginnt der Kurs ifadesi şimdiden sonraki zaman noktası ile ilişkilidir. Sorudaki bugün/şimdi hesabı ileriyi gösterdiği için in kullanılır. seit ise hâlâ süren bir duruma başlangıç verirdi. Doğru cevap: in
  - Yeni: Doğru cevap: in. Şimdiden ileriye doğru (12 Uhr → 13 Uhr) → in + Dativ = … sonra: in einer Stunde (bir saat sonra).

#### `artikel-schreiben-8` › 1
Cümle: Ich lerne ___ Monat Deutsch. (seit + ein)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: seit burada Dativ ister. Monat Deutsch  olduğu için artikel einem olur: seit einem Monat Deutsch. Edatı doğru seçmek tek başına yetmez; artikelin hâli de değişir. Doğru cevap: seit einem
  - Yeni: Doğru cevap: seit einem. seit Dativ ister. Monat maskulin olduğu için ein → einem: seit einem Monat.

#### `artikel-schreiben-8` › 3
Cümle: Ich habe ihn ___ Jahr besucht. (vor + ein)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: vor burada Dativ ister. Jahr besucht  olduğu için artikel einem olur: vor einem Jahr besucht. Edatı doğru seçmek tek başına yetmez; artikelin hâli de değişir. Doğru cevap: vor einem
  - Yeni: Doğru cevap: vor einem. vor (zaman, '… önce') Dativ ister. Jahr nötr olduğu için ein → einem: vor einem Jahr.

#### `artikel-schreiben-8` › 5
Cümle: Ich wasche die Hände ___ Essen. (vor + das)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: vor burada Dativ ister. Essen neutral olduğu için artikel dem olur: vor dem Essen. Edatı doğru seçmek tek başına yetmez; artikelin hâli de değişir. Doğru cevap: vor dem
  - Yeni: Doğru cevap: vor dem. vor Dativ ister. Essen nötr olduğu için das → dem: vor dem Essen.

#### `artikel-schreiben-8` › 8
Cümle: Wir wohnen ___ Woche hier. (seit + ein)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: seit burada Dativ ister. Woche hier  olduğu için artikel einer olur: seit einer Woche hier. Edatı doğru seçmek tek başına yetmez; artikelin hâli de değişir. Doğru cevap: seit einer
  - Yeni: Doğru cevap: seit einer. seit Dativ ister. Woche feminin olduğu için eine → einer: seit einer Woche.

#### `artikel-schreiben-8` › 9
Cümle: Wir treffen uns ___ Samstag im April. (an + ein)

Gerekçe: Şablon açıklama cümleden yanlış parçayı alıntılıyordu (ör. 'September Geburtstag ay bildiriyor', 'Monat Deutsch olduğu için', 'Kochen Radio yapılırken'); bazılarında ismin cinsiyeti eksikti. Açıklama doğru zaman ifadesiyle yeniden yazıldı.

- Açıklama (TR)
  - Eski: an burada Dativ ister. Samstag im April maskulin olduğu için artikel einem olur: an einem Samstag im April. Edatı doğru seçmek tek başına yetmez; artikelin hâli de değişir. Doğru cevap: an einem
  - Yeni: Doğru cevap: an einem. Günlerle an kullanılır ve Dativ ister. Samstag maskulin olduğu için ein → einem: an einem Samstag.

### `data/a1/trennbare-verben.json`

#### `konjugation-2` › 8
Cümle: Wir ___ nächsten Monat in die neue Wohnung ___.

Gerekçe: Çeldirici 'ziehen / um' de doğru bir cümle veriyordu ('Wir ziehen nächsten Monat in die neue Wohnung um.'). 'ziehen / aus' ile değiştirildi.

- Seçenekler
  - Eski: `ziehen / ein` / `zieht / ein` / `ziehen / um`
  - Yeni: `ziehen / ein` / `zieht / ein` / `ziehen / aus`
- Açıklama (TR)
  - Eski: Doğru cevap: ziehen / ein. wir + einziehen → ziehen ... ein.
  - Yeni: Doğru cevap: ziehen / ein. wir + einziehen (taşınıp yerleşmek) → ziehen … ein. 'zieht' ihr/er biçimidir; 'ausziehen' ise bir yerden taşınıp çıkmaktır (aus der Wohnung).
- DE/EN açıklamaları da güncellendi.

#### `alltag-5` › 4
Cümle: A: Was macht ihr Samstag? B: Der Kühlschrank ist leer. Wir ___ zuerst ___.

Gerekçe: Bağlam alışverişi göstermiyordu; 'Wir stehen zuerst auf' da mümkündü. Bağlama 'Der Kühlschrank ist leer.' eklendi.

- Cümle
  - Eski: A: Was macht ihr Samstag? B: Wir ___ zuerst ___.
  - Yeni: A: Was macht ihr Samstag? B: Der Kühlschrank ist leer. Wir ___ zuerst ___.
- Açıklama (TR)
  - Eski: Doğru cevap: kaufen / ein. Alışveriş yapmak: einkaufen.
  - Yeni: Doğru cevap: kaufen / ein. Buzdolabı boş → alışveriş yapmak gerekiyor: einkaufen. wir → kaufen … ein (ön ek sona).
- DE/EN açıklamaları da güncellendi.

#### `ja-nein-fragen-15` › 8
Cümle: Bilde Frage: ihr / der Lehrer / zuhören

Gerekçe: İpucu Akkusativ 'den Lehrer' veriyordu ama doğru cevap Dativ 'dem Lehrer'; açıklama da zuhören + Dativ kuralını söylemiyordu.

- Cümle
  - Eski: Bilde Frage: ihr / den Lehrer / zuhören
  - Yeni: Bilde Frage: ihr / der Lehrer / zuhören
- Açıklama (TR)
  - Eski: Doğru cevap: Hört ihr dem Lehrer zu. hört başta; zu sonda.
  - Yeni: Doğru cevap: Hört ihr dem Lehrer zu? Evet/hayır sorusunda çekimli kısım (hört) başa, ön ek (zu) sona gelir. zuhören Dativ ister: der Lehrer → dem Lehrer.

#### `zu-hause-21` › 0
Cümle: Bilde: ich / werktags / um 6:30 Uhr / aufstehen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich stehe werktags um 6:30 Uhr auf. aufstehen.
  - Yeni: Doğru cevap: Ich stehe werktags um 6:30 Uhr auf. aufstehen ayrılabilen bir fiildir: çekimli kısım (stehe) 2. pozisyonda, ön ek (auf) cümlenin sonunda.

#### `zu-hause-21` › 1
Cümle: Bilde: mein Bruder / oft / früh / aufwachen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Mein Bruder wacht oft früh auf. aufwachen.
  - Yeni: Doğru cevap: Mein Bruder wacht oft früh auf. aufwachen ayrılabilen bir fiildir: çekimli kısım (wacht) 2. pozisyonda, ön ek (auf) cümlenin sonunda.

#### `zu-hause-21` › 2
Cümle: Bilde: du / morgens / das Radio / anmachen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Du machst morgens das Radio an. anmachen.
  - Yeni: Doğru cevap: Du machst morgens das Radio an. anmachen ayrılabilen bir fiildir: çekimli kısım (machst) 2. pozisyonda, ön ek (an) cümlenin sonunda.

#### `zu-hause-21` › 3
Cümle: Bilde: wir / nachts / das Licht / ausmachen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir machen nachts das Licht aus. ausmachen.
  - Yeni: Doğru cevap: Wir machen nachts das Licht aus. ausmachen ayrılabilen bir fiildir: çekimli kısım (machen) 2. pozisyonda, ön ek (aus) cümlenin sonunda.

#### `zu-hause-21` › 4
Cümle: Bilde: ich / am Samstag / die Wohnung / aufräumen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich räume am Samstag die Wohnung auf. aufräumen.
  - Yeni: Doğru cevap: Ich räume am Samstag die Wohnung auf. aufräumen ayrılabilen bir fiildir: çekimli kısım (räume) 2. pozisyonda, ön ek (auf) cümlenin sonunda.

#### `zu-hause-21` › 5
Cümle: Bilde: ihr / am Abend / die Fenster / zumachen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ihr macht am Abend die Fenster zu. zumachen.
  - Yeni: Doğru cevap: Ihr macht am Abend die Fenster zu. zumachen ayrılabilen bir fiildir: çekimli kısım (macht) 2. pozisyonda, ön ek (zu) cümlenin sonunda.

#### `zu-hause-21` › 6
Cümle: Bilde: das Kind / morgens / seine Schuhe / anziehen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Das Kind zieht morgens seine Schuhe an. anziehen.
  - Yeni: Doğru cevap: Das Kind zieht morgens seine Schuhe an. anziehen ayrılabilen bir fiildir: çekimli kısım (zieht) 2. pozisyonda, ön ek (an) cümlenin sonunda.

#### `zu-hause-21` › 7
Cümle: Bilde: er / zu Hause / die Jacke / ausziehen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Er zieht zu Hause die Jacke aus. ausziehen.
  - Yeni: Doğru cevap: Er zieht zu Hause die Jacke aus. ausziehen ayrılabilen bir fiildir: çekimli kısım (zieht) 2. pozisyonda, ön ek (aus) cümlenin sonunda.

#### `zu-hause-21` › 8
Cümle: Bilde: wir / nach dem Abendessen / fernsehen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir sehen nach dem Abendessen fern. fernsehen.
  - Yeni: Doğru cevap: Wir sehen nach dem Abendessen fern. fernsehen ayrılabilen bir fiildir: çekimli kısım (sehen) 2. pozisyonda, ön ek (fern) cümlenin sonunda.

#### `kommunikation-22` › 0
Cümle: Bilde: ich / meine Freundin / heute / anrufen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich rufe meine Freundin heute an. anrufen.
  - Yeni: Doğru cevap: Ich rufe meine Freundin heute an. anrufen ayrılabilen bir fiildir: çekimli kısım (rufe) 2. pozisyonda, ön ek (an) cümlenin sonunda.

#### `kommunikation-22` › 1
Cümle: Bilde: der Kunde / später / zurückrufen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Kunde ruft später zurück. zurückrufen.
  - Yeni: Doğru cevap: Der Kunde ruft später zurück. zurückrufen ayrılabilen bir fiildir: çekimli kısım (ruft) 2. pozisyonda, ön ek (zurück) cümlenin sonunda.

#### `kommunikation-22` › 2
Cümle: Bilde: wir / unsere Freunde / zum Essen / einladen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir laden unsere Freunde zum Essen ein. einladen.
  - Yeni: Doğru cevap: Wir laden unsere Freunde zum Essen ein. einladen ayrılabilen bir fiildir: çekimli kısım (laden) 2. pozisyonda, ön ek (ein) cümlenin sonunda.

#### `kommunikation-22` › 3
Cümle: Bilde: du / am Freitag / mitkommen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Du kommst am Freitag mit. mitkommen.
  - Yeni: Doğru cevap: Du kommst am Freitag mit. mitkommen ayrılabilen bir fiildir: çekimli kısım (kommst) 2. pozisyonda, ön ek (mit) cümlenin sonunda.

#### `kommunikation-22` › 4
Cümle: Bilde: ihr / am Abend / kurz / vorbeikommen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ihr kommt am Abend kurz vorbei. vorbeikommen.
  - Yeni: Doğru cevap: Ihr kommt am Abend kurz vorbei. vorbeikommen ayrılabilen bir fiildir: çekimli kısım (kommt) 2. pozisyonda, ön ek (vorbei) cümlenin sonunda.

#### `kommunikation-22` › 6
Cümle: Bilde: Anna / Getränke / mitbringen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Anna bringt Getränke mit. mitbringen.
  - Yeni: Doğru cevap: Anna bringt Getränke mit. mitbringen ayrılabilen bir fiildir: çekimli kısım (bringt) 2. pozisyonda, ön ek (mit) cümlenin sonunda.

#### `kommunikation-22` › 8
Cümle: Bilde: der Vater / dem Kind / ein Buch / vorlesen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Vater liest dem Kind ein Buch vor. vorlesen.
  - Yeni: Doğru cevap: Der Vater liest dem Kind ein Buch vor. vorlesen ayrılabilen bir fiildir: çekimli kısım (liest) 2. pozisyonda, ön ek (vor) cümlenin sonunda. Dinleyen kişi Dativ (dem Kind), okunan şey Akkusativ (ein Buch).

#### `master-24` › 3
Cümle: Bilde: der Zug / zehn Minuten später / ankommen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Zug kommt zehn Minuten später an. ankommen.
  - Yeni: Doğru cevap: Der Zug kommt zehn Minuten später an. ankommen ayrılabilen bir fiildir: çekimli kısım (kommt) 2. pozisyonda, ön ek (an) cümlenin sonunda.

#### `master-24` › 8
Cümle: Bilde: ich / meine Freunde / am Samstag / einladen

Gerekçe: Açıklama yalnızca fiilin mastarını yazıyordu (ör. 'aufstehen.'); çekim ve ön ekin yeri anlatılmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich lade meine Freunde am Samstag ein. einladen.
  - Yeni: Doğru cevap: Ich lade meine Freunde am Samstag ein. einladen ayrılabilen bir fiildir: çekimli kısım (lade) 2. pozisyonda, ön ek (ein) cümlenin sonunda.

#### `schreiben-6` › 8
Cümle: Bilde: Anna / den Computer / morgens / einschalten

Gerekçe: Verilen sırayla kurulan 'Anna schaltet den Computer morgens ein.' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `anna schaltet morgens den computer ein`
  - Yeni: `anna schaltet morgens den computer ein` / `anna schaltet den computer morgens ein`

#### `zeitangaben-14` › 3
Cümle: Bilde: Anna / morgen Abend / ihre Freundin / anrufen

Gerekçe: Orta alanda nesne ve zaman ifadesinin yer değiştirdiği doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `anna ruft morgen abend ihre freundin an`
  - Yeni: `anna ruft morgen abend ihre freundin an` / `anna ruft ihre freundin morgen abend an`

#### `zeitangaben-14` › 4
Cümle: Bilde: ihr / nach der Arbeit / die Jacken / ausziehen

Gerekçe: Orta alanda öğelerin yer değiştirdiği doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ihr zieht nach der arbeit die jacken aus`
  - Yeni: `ihr zieht nach der arbeit die jacken aus` / `ihr zieht die jacken nach der arbeit aus`

#### `zeitangaben-14` › 5
Cümle: Bilde: ich / später / den Kunden / zurückrufen

Gerekçe: Verilen sırayla kurulan 'Ich rufe später den Kunden zurück.' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich rufe den kunden spaeter zurueck` / `ich rufe den kunden später zurück`
  - Yeni: `ich rufe den kunden spaeter zurueck` / `ich rufe den kunden später zurück` / `ich rufe später den kunden zurück` / `ich rufe spaeter den kunden zurueck`

#### `zeitangaben-14` › 6
Cümle: Bilde: die Kinder / jeden Freitag / ihr Zimmer / aufräumen

Gerekçe: Orta alanda öğelerin yer değiştirdiği doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `die kinder raeumen jeden freitag ihr zimmer auf` / `die kinder räumen jeden freitag ihr zimmer auf`
  - Yeni: `die kinder raeumen jeden freitag ihr zimmer auf` / `die kinder räumen jeden freitag ihr zimmer auf` / `die kinder räumen ihr zimmer jeden freitag auf` / `die kinder raeumen ihr zimmer jeden freitag auf`

#### `satzbau-19` › 0
Cümle: Ordne: morgen / ich / um 6 Uhr / auf / stehe

Gerekçe: Zaman ifadesiyle başlayan (fiil yine 2. pozisyonda) doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich stehe morgen um 6 uhr auf`
  - Yeni: `ich stehe morgen um 6 uhr auf` / `morgen stehe ich um 6 uhr auf`

#### `satzbau-19` › 1
Cümle: Ordne: seine Mutter / Paul / an / ruft / heute

Gerekçe: Öğelerin başka doğru sıralamaları kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `paul ruft seine mutter heute an`
  - Yeni: `paul ruft seine mutter heute an` / `heute ruft paul seine mutter an` / `paul ruft heute seine mutter an`

#### `satzbau-19` › 2
Cümle: Ordne: am Bahnhof / wir / aus / steigen

Gerekçe: Yer ifadesiyle başlayan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wir steigen am bahnhof aus`
  - Yeni: `wir steigen am bahnhof aus` / `am bahnhof steigen wir aus`

#### `satzbau-19` › 4
Cümle: Ordne: am Samstag / die Kinder / ihr Zimmer / auf / räumen

Gerekçe: Zaman ifadesiyle başlayan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `die kinder raeumen am samstag ihr zimmer auf` / `die kinder räumen am samstag ihr zimmer auf`
  - Yeni: `die kinder raeumen am samstag ihr zimmer auf` / `die kinder räumen am samstag ihr zimmer auf` / `am samstag räumen die kinder ihr zimmer auf` / `am samstag raeumen die kinder ihr zimmer auf`

#### `satzbau-19` › 5
Cümle: Ordne: um acht Uhr / der Zug / ab / fährt

Gerekçe: Zaman ifadesiyle başlayan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `der zug faehrt um acht uhr ab` / `der zug fährt um acht uhr ab`
  - Yeni: `der zug faehrt um acht uhr ab` / `der zug fährt um acht uhr ab` / `um acht uhr fährt der zug ab` / `um acht uhr faehrt der zug ab`

#### `satzbau-19` › 6
Cümle: Ordne: meine Freunde / heute / vorbei / kommen

Gerekçe: Zaman ifadesiyle başlayan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `meine freunde kommen heute vorbei`
  - Yeni: `meine freunde kommen heute vorbei` / `heute kommen meine freunde vorbei`

#### `satzbau-19` › 8
Cümle: Ordne: später / ich / dich / zurück / rufe

Gerekçe: Zaman ifadesiyle başlayan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich rufe dich spaeter zurueck` / `ich rufe dich später zurück`
  - Yeni: `ich rufe dich spaeter zurueck` / `ich rufe dich später zurück` / `später rufe ich dich zurück` / `spaeter rufe ich dich zurueck`

#### `satzbau-19` › 9
Cümle: Ordne: jeden Abend / meine Eltern / fern / sehen

Gerekçe: Zaman ifadesiyle başlayan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `meine eltern sehen jeden abend fern`
  - Yeni: `meine eltern sehen jeden abend fern` / `jeden abend sehen meine eltern fern`

### `data/a1/w-fragen.json`

#### `zeit-6` › 1
Cümle: ___ fährt der Zug ab? – Um 8:15 Uhr.

Gerekçe: Cümlede anlam hatası vardı: Almancada tren 'beginnt' değil 'fährt ab'.

- Cümle
  - Eski: ___ beginnt der Zug? – Um 8:15 Uhr.
  - Yeni: ___ fährt der Zug ab? – Um 8:15 Uhr.
- Açıklama (TR)
  - Eski: Doğru cevap: Um wie viel Uhr. Kesin saat sorusu için Um wie viel Uhr.
  - Yeni: Doğru cevap: Um wie viel Uhr. Cevap kesin bir saat (Um 8:15 Uhr) olduğu için Um wie viel Uhr …? sorulur. Trenler için 'beginnen' değil abfahren (kalkmak) kullanılır.

#### `trennbare-verben-15` › 3
Cümle: Antwort: Der Zug kommt an Gleis 5 an. – Frage nach dem Ort.

Gerekçe: Verilen cevap cümlesi ('Der Zug kommt aus Berlin an.') ve beklenen soru ('Woher kommt der Zug an?') doğal Almanca değildi; açıklama da 'sorulabilir' diye kaçamak veriyordu. Yer soran net bir soruya çevrildi.

- Cümle
  - Eski: Antwort: Der Zug kommt aus Berlin an. – Frage nach der Herkunft.
  - Yeni: Antwort: Der Zug kommt an Gleis 5 an. – Frage nach dem Ort.
- Cevap
  - Eski: Woher kommt der Zug an?
  - Yeni: Wo kommt der Zug an?
- Kabul edilen cevaplar
  - Eski: `woher kommt der zug an`
  - Yeni: `wo kommt der zug an`
- Açıklama (TR)
  - Eski: Doğru cevap: Woher kommt der Zug an?. ankommen bağlamında geldiği kaynak Woher ile sorulabilir.
  - Yeni: Doğru cevap: Wo kommt der Zug an? Yer soruluyor → Wo. ankommen ayrılabilir: çekimli kısım (kommt) soru kelimesinden sonra, ön ek (an) sonda.
- DE/EN açıklamaları da güncellendi.

#### `modalverben-16` › 0
Cümle: Antwort: Ich kann gut kochen. – Frage nach der Fähigkeit.

Gerekçe: 'Was kannst du gut machen?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `was kannst du gut`
  - Yeni: `was kannst du gut` / `was kannst du gut machen`

#### `modalverben-16` › 8
Cümle: Antwort: Ich darf bis 22 Uhr draußen bleiben. – Frage nach der Dauer.

Gerekçe: Cevap 'bis 22 Uhr' olduğu için 'Bis wann …?' sorusu da doğru (hatta daha kesin); kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie lange darfst du draussen bleiben` / `wie lange darfst du draußen bleiben`
  - Yeni: `wie lange darfst du draussen bleiben` / `wie lange darfst du draußen bleiben` / `bis wann darfst du draußen bleiben` / `bis wann darfst du draussen bleiben`

#### `sein-haben-17` › 3
Cümle: Antwort: Das Ticket ist teuer, es kostet 40 Euro.

Gerekçe: Fiyat için 'Wie viel/Was kostet das Ticket?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie teuer ist das ticket`
  - Yeni: `wie teuer ist das ticket` / `wie viel kostet das ticket` / `was kostet das ticket`

#### `sein-haben-17` › 8
Cümle: Antwort: Mein Name ist Jonas.

Gerekçe: 'Wie ist dein Name?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie heisst du` / `wie heißt du`
  - Yeni: `wie heisst du` / `wie heißt du` / `wie ist dein name`

#### `antwort-zu-frage-18` › 7
Cümle: Antwort: Für die Schule. – Verb: lernen / du / Deutsch

Gerekçe: Amaç sorusu 'Wofür lernst du Deutsch?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `warum lernst du deutsch`
  - Yeni: `warum lernst du deutsch` / `wofür lernst du deutsch` / `wofuer lernst du deutsch`

#### `alltag-22` › 2
Cümle: Durum: Arkadaşının hafta sonu nereye gittiğini sor.

Gerekçe: 'gitmek' için 'fahren' da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wohin gehst du am wochenende`
  - Yeni: `wohin gehst du am wochenende` / `wohin fährst du am wochenende` / `wohin faehrst du am wochenende`

#### `alltag-22` › 5
Cümle: Durum: Birinin işe nasıl gittiğini sor.

Gerekçe: 'Wie fährst du zur Arbeit?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie kommst du zur arbeit`
  - Yeni: `wie kommst du zur arbeit` / `wie fährst du zur arbeit` / `wie faehrst du zur arbeit`

#### `alltag-22` › 6
Cümle: Durum: Birinin haftada kaç kez spor yaptığını sor.

Gerekçe: 'haftada' bilgisini de içeren doğru soru kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie oft machst du sport`
  - Yeni: `wie oft machst du sport` / `wie oft machst du pro woche sport` / `wie oft pro woche machst du sport`

#### `alltag-22` › 8
Cümle: Durum: Masada ne olduğunu sor.

Gerekçe: 'Was liegt/steht auf dem Tisch?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `was ist auf dem tisch`
  - Yeni: `was ist auf dem tisch` / `was liegt auf dem tisch` / `was steht auf dem tisch`

#### `mix-23` › 3
Cümle: Antwort: Das kostet 12 Euro. – Frage nach dem Preis.

Gerekçe: Fiyat için çok yaygın olan 'Was kostet das?' kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie viel kostet das`
  - Yeni: `wie viel kostet das` / `was kostet das`

#### `mix-23` › 9
Cümle: Korrigiere: Woher fährst du morgen? – Nach Berlin.

Gerekçe: Normal tire ile ya da yalnızca soru kısmı yazılan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wohin faehrst du morgen? – nach berlin` / `wohin fährst du morgen? – nach berlin`
  - Yeni: `wohin faehrst du morgen? – nach berlin` / `wohin fährst du morgen? – nach berlin` / `wohin fährst du morgen? - nach berlin` / `wohin faehrst du morgen? - nach berlin` / `wohin fährst du morgen` / `wohin faehrst du morgen`

#### `master-24` › 0
Cümle: Bilde Frage: Antwort: Meine Schwester fährt morgen um 7 Uhr mit dem Zug nach Hamburg. – Frage nach dem Ziel.

Gerekçe: Kısa ama doğru sorular kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wohin faehrt deine schwester morgen um 7 uhr mit dem zug` / `wohin fährt deine schwester morgen um 7 uhr mit dem zug`
  - Yeni: `wohin faehrt deine schwester morgen um 7 uhr mit dem zug` / `wohin fährt deine schwester morgen um 7 uhr mit dem zug` / `wohin fährt deine schwester morgen` / `wohin faehrt deine schwester morgen` / `wohin fährt deine schwester` / `wohin faehrt deine schwester`

#### `master-24` › 1
Cümle: Bilde Frage: aynı cevap – Frage nach der Uhrzeit.

Gerekçe: Kısa ama doğru sorular kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `um wie viel uhr faehrt deine schwester morgen mit dem zug nach hamburg` / `um wie viel uhr fährt deine schwester morgen mit dem zug nach hamburg`
  - Yeni: `um wie viel uhr faehrt deine schwester morgen mit dem zug nach hamburg` / `um wie viel uhr fährt deine schwester morgen mit dem zug nach hamburg` / `um wie viel uhr fährt deine schwester morgen nach hamburg` / `um wie viel uhr faehrt deine schwester morgen nach hamburg` / `um wie viel uhr fährt deine schwester morgen` / `um wie viel uhr faehrt deine schwester morgen`

#### `master-24` › 2
Cümle: Bilde Frage: aynı cevap – Frage nach der Art und Weise.

Gerekçe: Kısa ama doğru sorular kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie faehrt deine schwester morgen um 7 uhr nach hamburg` / `wie fährt deine schwester morgen um 7 uhr nach hamburg`
  - Yeni: `wie faehrt deine schwester morgen um 7 uhr nach hamburg` / `wie fährt deine schwester morgen um 7 uhr nach hamburg` / `wie fährt deine schwester nach hamburg` / `wie faehrt deine schwester nach hamburg` / `wie fährt deine schwester morgen nach hamburg` / `wie faehrt deine schwester morgen nach hamburg`

#### `master-24` › 3
Cümle: Bilde Frage: Antwort: Paul lernt seit einem Jahr dreimal pro Woche Deutsch. – Frage nach der Dauer.

Gerekçe: Süre için 'Seit wann lernt Paul Deutsch?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie lange lernt paul schon deutsch`
  - Yeni: `wie lange lernt paul schon deutsch` / `seit wann lernt paul deutsch` / `wie lange lernt paul deutsch`

#### `master-24` › 9
Cümle: Durum: Yeni tanıştığın birine adını, yaşını ve nereli olduğunu üç ayrı W-Frage ile sor.

Gerekçe: Virgülle ayrılmış üç soru kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wie heisst du? wie alt bist du? woher kommst du` / `wie heißt du? wie alt bist du? woher kommst du`
  - Yeni: `wie heisst du? wie alt bist du? woher kommst du` / `wie heißt du? wie alt bist du? woher kommst du` / `wie heißt du, wie alt bist du, woher kommst du` / `wie heisst du, wie alt bist du, woher kommst du`

### `data/a1/zahlen-uhrzeit-datum.json`

#### `preise-6` › 7
Cümle: Schreibe den Preis mit Worten: 0,80 €

Gerekçe: Açıklama 'yalnızca achtzig Cent olarak söylenebilir' diyerek aşırı kesin bir kural veriyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: achtzig Cent. 0,80 € yalnızca “achtzig Cent” olarak söylenebilir.
  - Yeni: Doğru cevap: achtzig Cent. 1 Euro'dan küçük tutarlar günlük dilde yalnızca Cent ile söylenir: 0,80 € → achtzig Cent ('null Euro achtzig' pek kullanılmaz).

#### `grosse-zahlen-4` › 0
Cümle: Schreibe als Wort: 100

Gerekçe: 100 için 'hundert' de doğru ve çok yaygın; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `einhundert`
  - Yeni: `einhundert` / `hundert`

#### `grosse-zahlen-4` › 1
Cümle: Schreibe als Wort: 105

Gerekçe: 'hundertfünf' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `einhundertfuenf` / `einhundertfünf`
  - Yeni: `einhundertfuenf` / `einhundertfünf` / `hundertfünf` / `hundertfuenf`

#### `grosse-zahlen-4` › 6
Cümle: Schreibe als Wort: 1000

Gerekçe: 1000 için 'tausend' de doğru ve çok yaygın; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `eintausend`
  - Yeni: `eintausend` / `tausend`

#### `zahlen-im-alltag-7` › 2
Cümle: Antworte vollständig: „Wie viele Personen kommen?“ – 5

Gerekçe: 'Es kommen fünf Personen.' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `fuenf personen kommen` / `fünf personen kommen`
  - Yeni: `fuenf personen kommen` / `fünf personen kommen` / `es kommen fünf personen` / `es kommen fuenf personen`

#### `zahlen-im-alltag-7` › 6
Cümle: Antworte vollständig: „Wie viele Studenten sind im Kurs?“ – 31

Gerekçe: Eşdeğer doğru cümleler kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `einunddreissig studenten sind im kurs` / `einunddreißig studenten sind im kurs`
  - Yeni: `einunddreissig studenten sind im kurs` / `einunddreißig studenten sind im kurs` / `im kurs sind einunddreißig studenten` / `im kurs sind einunddreissig studenten` / `es sind einunddreißig studenten im kurs` / `es sind einunddreissig studenten im kurs`

#### `volle-uhrzeiten-8` › 3
Cümle: Schreibe als Satz: 14:00

Gerekçe: Günlük dilde 14:00 için 'zwei Uhr' da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `es ist vierzehn uhr`
  - Yeni: `es ist vierzehn uhr` / `es ist zwei uhr`

#### `volle-uhrzeiten-8` › 4
Cümle: Schreibe als Satz: 18:00

Gerekçe: Günlük dilde 18:00 için 'sechs Uhr' da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `es ist achtzehn uhr`
  - Yeni: `es ist achtzehn uhr` / `es ist sechs uhr`

#### `volle-uhrzeiten-8` › 8
Cümle: Antworte vollständig: „Wie spät ist es?“ – 20:00

Gerekçe: Günlük dilde 20:00 için 'acht Uhr' da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `es ist zwanzig uhr`
  - Yeni: `es ist zwanzig uhr` / `es ist acht uhr`

#### `vor-nach-10` › 2
Cümle: Schreibe umgangssprachlich: 13:20

Gerekçe: 13:20 için 'zehn vor halb zwei' de doğru günlük biçimdir; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `es ist zwanzig nach eins`
  - Yeni: `es ist zwanzig nach eins` / `es ist zehn vor halb zwei`

#### `vor-nach-10` › 5
Cümle: Schreibe umgangssprachlich: 10:40

Gerekçe: 10:40 için 'zehn nach halb elf' de doğru günlük biçimdir; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `es ist zwanzig vor elf`
  - Yeni: `es ist zwanzig vor elf` / `es ist zehn nach halb elf`

#### `termine-fahrplan-12` › 1
Cümle: Schreibe vollständig: „Der Termin / 14:30 / sein“

Gerekçe: 14:30 için günlük 'halb drei' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `der termin ist um vierzehn uhr dreissig` / `der termin ist um vierzehn uhr dreißig`
  - Yeni: `der termin ist um vierzehn uhr dreissig` / `der termin ist um vierzehn uhr dreißig` / `der termin ist um halb drei`

#### `termine-fahrplan-12` › 5
Cümle: Schreibe vollständig: „Ich / 07:30 / aufstehen“

Gerekçe: 07:30 için resmî 'sieben Uhr dreißig' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich stehe um halb acht auf`
  - Yeni: `ich stehe um halb acht auf` / `ich stehe um sieben uhr dreißig auf` / `ich stehe um sieben uhr dreissig auf`

#### `datum-saetze-16` › 0
Cümle: Schreibe vollständig: „Geburtstag / 14.02.“

Gerekçe: 'Ich habe am vierzehnten Februar Geburtstag.' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `mein geburtstag ist am vierzehnten februar`
  - Yeni: `mein geburtstag ist am vierzehnten februar` / `ich habe am vierzehnten februar geburtstag`

#### `datum-fragen-17` › 4
Cümle: Bilde die Frage zu: „Wir treffen uns am fünften Oktober.“

Gerekçe: 'Wann treffen wir uns?' de doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `wann trefft ihr euch`
  - Yeni: `wann trefft ihr euch` / `wann treffen wir uns`

#### `fehlerkorrektur-19` › 7
Cümle: Korrigiere: „32 = dreißigundzwei“

Gerekçe: Yalnızca düzeltilmiş sayıyı yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `32 = zweiunddreissig` / `32 = zweiunddreißig`
  - Yeni: `32 = zweiunddreissig` / `32 = zweiunddreißig` / `zweiunddreißig` / `zweiunddreissig`

#### `fehlerkorrektur-19` › 8
Cümle: Korrigiere: „16 = sechszehn“

Gerekçe: Yalnızca düzeltilmiş sayıyı yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `16 = sechzehn`
  - Yeni: `16 = sechzehn` / `sechzehn`

#### `fehlerkorrektur-19` › 9
Cümle: Korrigiere: „17 = siebenzehn“

Gerekçe: Yalnızca düzeltilmiş sayıyı yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `17 = siebzehn`
  - Yeni: `17 = siebzehn` / `siebzehn`

### `data/a2/adjektivdeklination.json`

#### `grundlagen-1` › 5
Cümle: Er liest ein ___ Buch.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: spannendes. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “spannend” sıfatı “-es” sonunu alır; bu yüzden doğru grup “spannendes” olur. Nötr Akkusativ “ein” artikelinde nötr işaret görünmediği için sıfat “-es” taşır.
  - Yeni: Doğru cevap: spannendes. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “spannend” sıfatı “-es” sonunu alır; bu yüzden doğru grup “spannendes” olur. Nötr Akkusativ “ein” artikelinde nötr işaret görünmediği için sıfat “-es” taşır.

#### `grundlagen-1` › 8
Cümle: Er hat kein ___ Hemd mehr.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sauberes. Burada Akkusativ + nötr yapı var. “kein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Negativartikel (kein-) sonrasında “sauber” sıfatı “-es” sonunu alır; bu yüzden doğru grup “sauberes” olur. Nötr Akkusativ kein- grubunda sıfat “-es” ile nötr bilgiyi tamamlar.
  - Yeni: Doğru cevap: sauberes. Burada Akkusativ + nötr yapı var. “kein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Negativartikel (kein-) sonrasında “sauber” sıfatı “-es” sonunu alır; bu yüzden doğru grup “sauberes” olur. Nötr Akkusativ kein- grubunda sıfat “-es” ile nötr bilgiyi tamamlar.

#### `unbestimmter-nominativ-6` › 0
Cümle: Ein ___ Mann wartet draußen.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: alter. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “alt” sıfatı “-er” sonunu alır; bu yüzden doğru grup “alter” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.
  - Yeni: Doğru cevap: alter. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “alt” sıfatı “-er” sonunu alır; bu yüzden doğru grup “alter” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.

#### `unbestimmter-nominativ-6` › 2
Cümle: Ein ___ Kind lacht im Garten.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: kleines. Burada Nominativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “klein” sıfatı “-es” sonunu alır; bu yüzden doğru grup “kleines” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.
  - Yeni: Doğru cevap: kleines. Burada Nominativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “klein” sıfatı “-es” sonunu alır; bu yüzden doğru grup “kleines” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.

#### `unbestimmter-nominativ-6` › 3
Cümle: Ein ___ Vogel sitzt am Fenster.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: bunter. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “bunt” sıfatı “-er” sonunu alır; bu yüzden doğru grup “bunter” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.
  - Yeni: Doğru cevap: bunter. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “bunt” sıfatı “-er” sonunu alır; bu yüzden doğru grup “bunter” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.

#### `unbestimmter-nominativ-6` › 5
Cümle: Ein ___ Auto steht vor der Garage.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: schnelles. Burada Nominativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “schnell” sıfatı “-es” sonunu alır; bu yüzden doğru grup “schnelles” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.
  - Yeni: Doğru cevap: schnelles. Burada Nominativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “schnell” sıfatı “-es” sonunu alır; bu yüzden doğru grup “schnelles” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.

#### `unbestimmter-nominativ-6` › 6
Cümle: Ein ___ Kollege hilft mir oft.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: netter. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “nett” sıfatı “-er” sonunu alır; bu yüzden doğru grup “netter” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.
  - Yeni: Doğru cevap: netter. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “nett” sıfatı “-er” sonunu alır; bu yüzden doğru grup “netter” olur. Belirsiz artikel ein her zaman tüm cinsiyet bilgisini göstermediği için sıfat Nominativ işaretini tamamlar.

#### `unbestimmter-nominativ-6` › 8
Cümle: Ein interessant___ Buch liegt auf dem Tisch.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: interessantes. Burada Nominativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “interessant” sıfatı “-es” sonunu alır; bu yüzden doğru grup “interessantes” olur. Nötr Nominativ ein + -es.
  - Yeni: Doğru cevap: interessantes. Burada Nominativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “interessant” sıfatı “-es” sonunu alır; bu yüzden doğru grup “interessantes” olur. Nötr Nominativ ein + -es.

#### `unbestimmter-nominativ-6` › 9
Cümle: Ein jung___ Arzt untersucht den Patienten.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: junger. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “jung” sıfatı “-er” sonunu alır; bu yüzden doğru grup “junger” olur. Maskulin Nominativ ein + -er.
  - Yeni: Doğru cevap: junger. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “jung” sıfatı “-er” sonunu alır; bu yüzden doğru grup “junger” olur. Maskulin Nominativ ein + -er.

#### `unbestimmter-akkusativ-7` › 2
Cümle: Wir brauchen ein ___ Regal.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: stabiles. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “stabil” sıfatı “-es” sonunu alır; bu yüzden doğru grup “stabiles” olur. Doğrudan nesne Akkusativ'te; özellikle maskulin 'einen' ile sıfat -en, nötr 'ein' ile -es alır.
  - Yeni: Doğru cevap: stabiles. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “stabil” sıfatı “-es” sonunu alır; bu yüzden doğru grup “stabiles” olur. Doğrudan nesne Akkusativ'te; özellikle maskulin 'einen' ile sıfat -en, nötr 'ein' ile -es alır.

#### `unbestimmter-akkusativ-7` › 5
Cümle: Sie liest ein ___ Magazin.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: interessantes. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “interessant” sıfatı “-es” sonunu alır; bu yüzden doğru grup “interessantes” olur. Doğrudan nesne Akkusativ'te; özellikle maskulin 'einen' ile sıfat -en, nötr 'ein' ile -es alır.
  - Yeni: Doğru cevap: interessantes. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “interessant” sıfatı “-es” sonunu alır; bu yüzden doğru grup “interessantes” olur. Doğrudan nesne Akkusativ'te; özellikle maskulin 'einen' ile sıfat -en, nötr 'ein' ile -es alır.

#### `unbestimmter-akkusativ-7` › 8
Cümle: Ich brauche ein neu___ Handy.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: neues. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “neu” sıfatı “-es” sonunu alır; bu yüzden doğru grup “neues” olur. Nötr Akkusativ ein + -es.
  - Yeni: Doğru cevap: neues. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “neu” sıfatı “-es” sonunu alır; bu yüzden doğru grup “neues” olur. Nötr Akkusativ ein + -es.

#### `possessivartikel-9` › 0
Cümle: Mein ___ Bruder studiert Informatik.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: kleiner. Burada Nominativ + maskulin yapı var. “mein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Possessivartikel (mein/dein/sein...) sonrasında “klein” sıfatı “-er” sonunu alır; bu yüzden doğru grup “kleiner” olur. Possessivartikel ein-word gibi davranır; sonu Kasus ve cinsiyete göre belirlenir.
  - Yeni: Doğru cevap: kleiner. Burada Nominativ + maskulin yapı var. “mein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Possessivartikel (mein/dein/sein...) sonrasında “klein” sıfatı “-er” sonunu alır; bu yüzden doğru grup “kleiner” olur. Possessivartikel ein-word gibi davranır; sonu Kasus ve cinsiyete göre belirlenir.

#### `kein-10` › 0
Cümle: Das ist kein ___ Problem.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: großes. Burada Nominativ + nötr yapı var. “kein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Negativartikel (kein-) sonrasında “groß” sıfatı “-es” sonunu alır; bu yüzden doğru grup “großes” olur. kein- çekimi ein-word ile aynıdır; sıfat sonu Kasus ve cinsiyete göre tamamlanır.
  - Yeni: Doğru cevap: großes. Burada Nominativ + nötr yapı var. “kein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Negativartikel (kein-) sonrasında “groß” sıfatı “-es” sonunu alır; bu yüzden doğru grup “großes” olur. kein- çekimi ein-word ile aynıdır; sıfat sonu Kasus ve cinsiyete göre tamamlanır.

#### `kein-10` › 1
Cümle: Hier arbeitet kein ___ Arzt.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: neuer. Burada Nominativ + maskulin yapı var. “kein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Negativartikel (kein-) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “neuer” olur. kein- çekimi ein-word ile aynıdır; sıfat sonu Kasus ve cinsiyete göre tamamlanır.
  - Yeni: Doğru cevap: neuer. Burada Nominativ + maskulin yapı var. “kein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Negativartikel (kein-) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “neuer” olur. kein- çekimi ein-word ile aynıdır; sıfat sonu Kasus ve cinsiyete göre tamamlanır.

#### `kein-10` › 4
Cümle: Sie trägt kein ___ Kleid.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: rotes. Burada Akkusativ + nötr yapı var. “kein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Negativartikel (kein-) sonrasında “rot” sıfatı “-es” sonunu alır; bu yüzden doğru grup “rotes” olur. kein- çekimi ein-word ile aynıdır; sıfat sonu Kasus ve cinsiyete göre tamamlanır.
  - Yeni: Doğru cevap: rotes. Burada Akkusativ + nötr yapı var. “kein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Negativartikel (kein-) sonrasında “rot” sıfatı “-es” sonunu alır; bu yüzden doğru grup “rotes” olur. kein- çekimi ein-word ile aynıdır; sıfat sonu Kasus ve cinsiyete göre tamamlanır.

#### `nominativ-akkusativ-12` › 2
Cümle: Ein ___ Mann wartet draußen.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: freundlicher. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “freundlich” sıfatı “-er” sonunu alır; bu yüzden doğru grup “freundlicher” olur. Cümlenin öznesi.
  - Yeni: Doğru cevap: freundlicher. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “freundlich” sıfatı “-er” sonunu alır; bu yüzden doğru grup “freundlicher” olur. Cümlenin öznesi.

#### `nominativ-akkusativ-12` › 6
Cümle: Ein ___ Kind spielt draußen.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: kleines. Burada Nominativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “klein” sıfatı “-es” sonunu alır; bu yüzden doğru grup “kleines” olur. Nötr Nominativ ein + -es.
  - Yeni: Doğru cevap: kleines. Burada Nominativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “klein” sıfatı “-es” sonunu alır; bu yüzden doğru grup “kleines” olur. Nötr Nominativ ein + -es.

#### `nominativ-akkusativ-12` › 7
Cümle: Ich höre ein ___ Kind.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: kleines. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “klein” sıfatı “-es” sonunu alır; bu yüzden doğru grup “kleines” olur. Nötr Akkusativ de ein + -es.
  - Yeni: Doğru cevap: kleines. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “klein” sıfatı “-es” sonunu alır; bu yüzden doğru grup “kleines” olur. Nötr Akkusativ de ein + -es.

#### `akkusativ-dativ-13` › 5
Cümle: Wir kaufen ein ___ Auto.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: neues. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “neu” sıfatı “-es” sonunu alır; bu yüzden doğru grup “neues” olur. kaufen doğrudan nesne.
  - Yeni: Doğru cevap: neues. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “neu” sıfatı “-es” sonunu alır; bu yüzden doğru grup “neues” olur. kaufen doğrudan nesne.

#### `akkusativ-dativ-13` › 9
Cümle: Ich schenke einem kleinen Kind ein spannend___ Buch.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: spannendes. Burada Akkusativ + nötr yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “spannend” sıfatı “-es” sonunu alır; bu yüzden doğru grup “spannendes” olur. Verilen şey doğrudan nesne Akkusativ: ein spannendes Buch.
  - Yeni: Doğru cevap: spannendes. Burada Akkusativ + nötr yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “spannend” sıfatı “-es” sonunu alır; bu yüzden doğru grup “spannendes” olur. Verilen şey doğrudan nesne Akkusativ: ein spannendes Buch.

#### `artikeltypen-mix-15` › 1
Cümle: Ein ___ Laptop steht im Schaufenster.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: neuer. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “neuer” olur.
  - Yeni: Doğru cevap: neuer. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “neuer” olur.

#### `artikeltypen-mix-15` › 2
Cümle: Mein ___ Laptop ist kaputt.

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: neuer. Burada Nominativ + maskulin yapı var. “mein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Possessivartikel (mein/dein/sein...) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “neuer” olur.
  - Yeni: Doğru cevap: neuer. Burada Nominativ + maskulin yapı var. “mein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Possessivartikel (mein/dein/sein...) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “neuer” olur.

#### `fehler-korrigieren-16` › 5
Cümle: Korrigiere: „Ich habe kein sauberen Hemd.“

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich habe kein sauberes Hemd.. Burada Akkusativ + nötr yapı var. “kein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Negativartikel (kein-) sonrasında “sauber” sıfatı “-es” sonunu alır; bu yüzden doğru grup “Ich habe kein sauberes Hemd.” olur. Hatalı cümlede sıfat sonu bu isim grubunun Akkusativ + nötr yapısıyla uyuşmuyordu. Düzeltilmiş tam cümle: “Ich habe kein sauberes Hemd.”
  - Yeni: Doğru cevap: Ich habe kein sauberes Hemd.. Burada Akkusativ + nötr yapı var. “kein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Negativartikel (kein-) sonrasında “sauber” sıfatı “-es” sonunu alır; bu yüzden doğru grup “Ich habe kein sauberes Hemd.” olur. Hatalı cümlede sıfat sonu bu isim grubunun Akkusativ + nötr yapısıyla uyuşmuyordu. Düzeltilmiş tam cümle: “Ich habe kein sauberes Hemd.”

#### `fehler-korrigieren-16` › 9
Cümle: Korrigiere: „Ein schwarzen Hund sitzt dort.“

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ein schwarzer Hund sitzt dort.. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “schwarz” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Ein schwarzer Hund sitzt dort.” olur. Hatalı cümlede sıfat sonu bu isim grubunun Nominativ + maskulin yapısıyla uyuşmuyordu. Düzeltilmiş tam cümle: “Ein schwarzer Hund sitzt dort.”
  - Yeni: Doğru cevap: Ein schwarzer Hund sitzt dort.. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “schwarz” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Ein schwarzer Hund sitzt dort.” olur. Hatalı cümlede sıfat sonu bu isim grubunun Nominativ + maskulin yapısıyla uyuşmuyordu. Düzeltilmiş tam cümle: “Ein schwarzer Hund sitzt dort.”

#### `saetze-bauen-17` › 1
Cümle: Bilde einen Satz: ein / jung / Arzt / hilft / einer / krank / Frau

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Ein junger Arzt hilft einer kranken Frau.. Burada Nominativ + maskulin yapı var. “ein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Belirsiz artikel (ein/eine...) sonrasında “jung” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Ein junger Arzt hilft einer kranken Frau.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “einer kranken Frau” biçimindedir: Dativ + feminin, belirsiz artikel (ein/eine...).
  - Yeni: Doğru cevap: Ein junger Arzt hilft einer kranken Frau.. Burada Nominativ + maskulin yapı var. “ein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Belirsiz artikel (ein/eine...) sonrasında “jung” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Ein junger Arzt hilft einer kranken Frau.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “einer kranken Frau” biçimindedir: Dativ + feminin, belirsiz artikel (ein/eine...).

#### `saetze-bauen-17` › 2
Cümle: Bilde einen Satz: mein / klein / Bruder / sucht / seinen / blau / Ball

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Mein kleiner Bruder sucht seinen blauen Ball.. Burada Nominativ + maskulin yapı var. “mein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Possessivartikel (mein/dein/sein...) sonrasında “klein” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Mein kleiner Bruder sucht seinen blauen Ball.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “seinen blauen Ball” biçimindedir: Akkusativ + maskulin, Possessivartikel (mein/dein/sein...).
  - Yeni: Doğru cevap: Mein kleiner Bruder sucht seinen blauen Ball.. Burada Nominativ + maskulin yapı var. “mein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Possessivartikel (mein/dein/sein...) sonrasında “klein” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Mein kleiner Bruder sucht seinen blauen Ball.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “seinen blauen Ball” biçimindedir: Akkusativ + maskulin, Possessivartikel (mein/dein/sein...).

#### `saetze-bauen-17` › 6
Cümle: Bilde einen Satz: unser / neu / Lehrer / spricht / mit / den / fleißig / Studenten

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Unser neuer Lehrer spricht mit den fleißigen Studenten.. Burada Nominativ + maskulin yapı var. “unser” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Possessivartikel (mein/dein/sein...) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Unser neuer Lehrer spricht mit den fleißigen Studenten.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “den fleißigen Studenten” biçimindedir: Dativ + çoğul, belirli artikel (der/die/das...).
  - Yeni: Doğru cevap: Unser neuer Lehrer spricht mit den fleißigen Studenten.. Burada Nominativ + maskulin yapı var. “unser” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Possessivartikel (mein/dein/sein...) sonrasında “neu” sıfatı “-er” sonunu alır; bu yüzden doğru grup “Unser neuer Lehrer spricht mit den fleißigen Studenten.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “den fleißigen Studenten” biçimindedir: Dativ + çoğul, belirli artikel (der/die/das...).

#### `saetze-bauen-17` › 7
Cümle: Bilde einen Satz: kein / alt / Auto / steht / vor / dem / modern / Haus

Gerekçe: Açıklama, sonsuz 'ein/kein/mein…' için 'bu biçim hâl/cinsiyet bilgisini gösteriyor' diyordu; oysa güçlü sıfat sonu (-er/-es) tam da bu artikeller cinsiyeti göstermediği için gerekir. Açıklama kendisiyle çelişiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Kein altes Auto steht vor dem modernen Haus.. Burada Nominativ + nötr yapı var. “kein” biçimi bu hâl/cinsiyet bilgisini gösteriyor. Negativartikel (kein-) sonrasında “alt” sıfatı “-es” sonunu alır; bu yüzden doğru grup “Kein altes Auto steht vor dem modernen Haus.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “dem modernen Haus” biçimindedir: Dativ + nötr, belirli artikel (der/die/das...).
  - Yeni: Doğru cevap: Kein altes Auto steht vor dem modernen Haus.. Burada Nominativ + nötr yapı var. “kein” biçimi tek başına cinsiyeti göstermez (maskulin Nominativ ve nötr Nominativ/Akkusativ'te aynıdır); bu bilgiyi sıfat sonu taşır. Negativartikel (kein-) sonrasında “alt” sıfatı “-es” sonunu alır; bu yüzden doğru grup “Kein altes Auto steht vor dem modernen Haus.” olur. Bu yazmalı soruda birden fazla isim grubu var; her grubun artikel türü ve Kasus'u ayrı ayrı kontrol edilmelidir. Ayrıca ikinci grup “dem modernen Haus” biçimindedir: Dativ + nötr, belirli artikel (der/die/das...).

#### `nominativ-akkusativ-12` › 8
Cümle: Der neu___ Kollege begrüßt den alten Chef.

Gerekçe: Cümlede iki boşluk vardı ama tek cevap isteniyordu; ikinci boşluk bir sonraki soruda soruluyor. İkinci boşluk doldurularak gösterildi.

- Cümle
  - Eski: Der neu___ Kollege begrüßt den alt___ Chef.
  - Yeni: Der neu___ Kollege begrüßt den alten Chef.

### `data/a2/dativ.json`

#### `dativartikel-bestimmt-1` › 1
Cümle: Wir danken ___ Frau für ihre Hilfe.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede helfen Dativ gerektirir. Boşluğa der gelir; tamamlanan ifade “Wir danken der Frau für ihre Hilfe”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: der
  - Yeni: danken (teşekkür etmek) kişi için Dativ ister. Boşluğa der gelir; tamamlanan ifade “Wir danken der Frau für ihre Hilfe”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: der

#### `personalpronomen-3` › 1
Cümle: Ich danke ___ für deine Hilfe.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede helfen Dativ gerektirir. Boşluğa dir gelir; tamamlanan ifade “Ich danke dir für deine Hilfe”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: dir
  - Yeni: danken (teşekkür etmek) kişi için Dativ ister. Boşluğa dir gelir; tamamlanan ifade “Ich danke dir für deine Hilfe”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: dir

#### `dativartikel-bestimmt-1` › 2
Cümle: Die Lehrerin erklärt ___ Kind die Aufgabe.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede das Kind Dativ gerektirir. Boşluğa dem gelir; tamamlanan ifade “Die Lehrerin erklärt dem Kind die Aufgabe”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: dem
  - Yeni: erklären'de açıklanan şey Akkusativ (die Aufgabe), açıklanan kişi Dativ olur: das Kind → dem Kind. Boşluğa dem gelir; tamamlanan ifade “Die Lehrerin erklärt dem Kind die Aufgabe”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: dem

#### `dativartikel-bestimmt-1` › 6
Cümle: Wir stehen vor ___ Hotel.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede das Hotel Dativ gerektirir. Boşluğa dem gelir; tamamlanan ifade “Wir stehen vor dem Hotel”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: dem
  - Yeni: vor burada bir konum bildiriyor (Wo? – otelin önünde); konum bildiren vor Dativ ister: das Hotel → dem Hotel. Boşluğa dem gelir; tamamlanan ifade “Wir stehen vor dem Hotel”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: dem

#### `dativartikel-bestimmt-1` › 7
Cümle: Die Oma erzählt ___ Kindern eine Geschichte.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede die Kinder Dativ gerektirir. Boşluğa den gelir; tamamlanan ifade “Die Oma erzählt den Kindern eine Geschichte”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: den
  - Yeni: erzählen'de anlatılan şey Akkusativ (eine Geschichte), dinleyen kişiler Dativ olur: die Kinder → den Kindern (çoğul Dativ'de isme -n eklenir). Boşluğa den gelir; tamamlanan ifade “Die Oma erzählt den Kindern eine Geschichte”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: den

#### `dativartikel-unbestimmt-2` › 4
Cümle: Er liest ___ Kind eine Geschichte vor.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede sein Kind Dativ gerektirir. Boşluğa seinem gelir; tamamlanan ifade “Er liest seinem Kind eine Geschichte vor”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: seinem
  - Yeni: vorlesen'de okunan şey Akkusativ (eine Geschichte), dinleyen kişi Dativ olur: sein Kind → seinem Kind. Boşluğa seinem gelir; tamamlanan ifade “Er liest seinem Kind eine Geschichte vor”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: seinem

#### `personalpronomen-3` › 4
Cümle: Der Lehrer erklärt ___ die Grammatik.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede wir Dativ gerektirir. Boşluğa uns gelir; tamamlanan ifade “Der Lehrer erklärt uns die Grammatik”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: uns
  - Yeni: erklären'de açıklanan şey Akkusativ (die Grammatik), açıklanan kişi Dativ olur: wir → uns. Boşluğa uns gelir; tamamlanan ifade “Der Lehrer erklärt uns die Grammatik”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: uns

#### `personalpronomen-3` › 5
Cümle: Ich zeige ___ gleich die Fotos.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede ihr Dativ gerektirir. Boşluğa euch gelir; tamamlanan ifade “Ich zeige euch gleich die Fotos”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: euch
  - Yeni: zeigen'de gösterilen şey Akkusativ (die Fotos), gösterilen kişi Dativ olur: ihr → euch. Boşluğa euch gelir; tamamlanan ifade “Ich zeige euch gleich die Fotos”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: euch

#### `personalpronomen-3` › 6
Cümle: Wir schreiben ___ morgen eine E-Mail.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede sie Plural Dativ gerektirir. Boşluğa ihnen gelir; tamamlanan ifade “Wir schreiben ihnen morgen eine E-Mail”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: ihnen
  - Yeni: schreiben'de yazılan şey Akkusativ (eine E-Mail), yazılan kişi Dativ olur: sie (çoğul) → ihnen. Boşluğa ihnen gelir; tamamlanan ifade “Wir schreiben ihnen morgen eine E-Mail”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: ihnen

#### `personalpronomen-3` › 7
Cümle: Kann ich ___ etwas erklären?

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede Sie Dativ gerektirir. Boşluğa Ihnen gelir; tamamlanan ifade “Kann ich Ihnen etwas erklären”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: Ihnen
  - Yeni: erklären'de açıklanan şey Akkusativ (etwas), açıklanan kişi Dativ olur: resmî Sie → Ihnen. Boşluğa Ihnen gelir; tamamlanan ifade “Kann ich Ihnen etwas erklären”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: Ihnen

#### `personalpronomen-dialog-4` › 3
Cümle: A: Schreibst du deinem Bruder? B: Ja, ich schreibe ___ heute.

Gerekçe: Şablon açıklama Dativ'i yanlış öğeye bağlıyordu (ör. 'danken' cümlesinde 'helfen Dativ gerektirir', ya da 'das Kind/wir Dativ gerektirir'); Dativ'i gerektiren asıl fiil/prepozisyon yazılmıyordu.

- Açıklama (TR)
  - Eski: Bu cümlede deinem Bruder Dativ gerektirir. Boşluğa ihm gelir; tamamlanan ifade “A: Schreibst du deinem Bruder? B: Ja, ich schreibe ihm heute”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: ihm
  - Yeni: jemandem schreiben (birine yazmak): yazılan kişi Dativ'dir: deinem Bruder → ihm. Boşluğa ihm gelir; tamamlanan ifade “A: Schreibst du deinem Bruder? B: Ja, ich schreibe ihm heute”. Nominativ veya Akkusativ biçimi, bu fiil/edatın istediği hâli karşılamaz. Doğru cevap: ihm

#### `verben-mit-dativ-5` › 0
Cümle: Wir ziehen am Samstag um. Kannst du ___?

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: uns helfen. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: uns helfen. Taşınmak için yardım istiyor → helfen (Dativ: uns). lieben ve besuchen Akkusativ alır ve anlama uymaz.

#### `verben-mit-dativ-5` › 1
Cümle: Das neue Büro ___ mir sehr.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: gefällt. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: gefällt. 'Bir şey birinin hoşuna gitmek' = gefallen; beğenen kişi Dativ'dir: mir. Büro ne yardım eder (hilft) ne de birine aittir (gehört) anlamı burada uymaz.

#### `verben-mit-dativ-5` › 2
Cümle: Wem ___ dieses Fahrrad?

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: gehört. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: gehört. Wem? ile sahibi soruluyor → gehören (ait olmak); sahip Dativ'dir.

#### `verben-mit-dativ-5` › 3
Cümle: Ich ___ Ihnen für Ihre Unterstützung.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: danke. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: danke. Destek için teşekkür ediliyor → danken; teşekkür edilen kişi Dativ'dir: Ihnen.

#### `verben-mit-dativ-5` › 4
Cümle: Der Lehrer fragt, aber der Schüler ___ ihm nicht.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: antwortet. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: antwortet. Soruya cevap verme → antworten; cevap verilen kişi Dativ'dir: ihm.

#### `verben-mit-dativ-5` › 5
Cümle: Die Suppe ___ meiner Mutter sehr gut.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: schmeckt. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: schmeckt. Yemeğin tadı → schmecken; tadını beğenen kişi Dativ'dir: meiner Mutter.

#### `verben-mit-dativ-5` › 6
Cümle: Meine Familie ___ mir sehr.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: fehlt. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: fehlt. 'Birini özlemek' Almancada fehlen ile kurulur: Meine Familie fehlt mir (ailem bana eksik geliyor). Özlenen özne, özleyen Dativ'dir.

#### `verben-mit-dativ-5` › 7
Cümle: Er erzählt oft Unsinn. Ich ___ ihm nicht.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: glaube. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: glaube. Saçma şeyler anlatıyor → ona inanmıyorum: glauben; inanılan kişi Dativ'dir: ihm.

#### `verben-mit-dativ-5` › 8
Cümle: Heute hat Lara Geburtstag. Wir ___ ihr.

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: gratulieren. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: gratulieren. Doğum günü → kutlamak: gratulieren; kutlanan kişi Dativ'dir: ihr.

#### `verben-mit-dativ-5` › 9
Cümle: Warum ___ du mir das erst jetzt?

Gerekçe: Açıklama 10 soruda da aynı genel cümleydi (Dativ fiilleri listesi); soru anlam seçimini ölçtüğü halde doğru fiilin neden seçildiğini ve diğerlerinin neden uymadığını söylemiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: sagst. helfen, danken, gefallen, gehören, antworten, schmecken ve benzeri fiiller Dativ nesne ister.
  - Yeni: Doğru cevap: sagst. Bir şeyi birine söylemek: sagen; söylenen şey Akkusativ (das), söylenen kişi Dativ (mir). gefallen/gehören burada anlam vermez.

#### `possessivartikel-dativ-19` › 9
Cümle: Formell: Ich helfe Ihnen bei ___ Terminplanung. (Ihr)

Gerekçe: İpucu 'Ihr Termin' yazıyordu ama cümledeki isim 'Terminplanung' (feminin); doğru cevap da 'Ihrer Terminplanung'.

- word
  - Eski: Ihr Termin
  - Yeni: Ihre Terminplanung

#### `dativverben-schreiben-14` › 2
Cümle: Schreibe richtig: Bitte / der Kunde / antworten.

Gerekçe: Eşdeğer doğru emir cümleleri kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `bitte antworte dem kunden`
  - Yeni: `bitte antworte dem kunden` / `antworte bitte dem kunden` / `bitte antworten sie dem kunden` / `antworten sie bitte dem kunden`

### `data/a2/futur-i.json`

#### `infinitiv-2` › 5
Cümle: Die Kinder werden im Park ___.

Gerekçe: Şablon hatası: çekimli fiil olarak 'Kinder' (isim) yazıyordu; çekimli fiil 'werden'.

- Açıklama (TR)
  - Eski: Parkta oynama eylemini spielen anlatır. Cümlede zaten Kinder çekilmiş olduğu için spielen yeniden kişi eki almaz. Partizip II de gerekmez: Futur I, werden + mastar yapısıdır.
  - Yeni: Parkta oynama eylemini spielen anlatır. Cümlede zaten werden çekilmiş olduğu için spielen yeniden kişi eki almaz. Partizip II de gerekmez: Futur I, werden + mastar yapısıdır.

#### `sein-haben-8` › 6
Cümle: Die Kinder werden später hungrig ___.

Gerekçe: Şablon hatası: 'Kinder' çekimli fiil olarak gösteriliyordu; çekimli fiil 'werden'.

- Açıklama (TR)
  - Eski: Bu cümle aç olma durumu anlatıyor; bu yüzden sein seçilir. Kinder gelecek yapısının çekimli fiilidir; sein burada mastar olmalı. haben kullanmak hedef anlamı değiştirir, bin ise yanlış bir ikinci çekimli fiil olur.
  - Yeni: Bu cümle aç olma durumu anlatıyor; bu yüzden sein seçilir. werden gelecek yapısının çekimli fiilidir; sein burada mastar olmalı. haben kullanmak hedef anlamı değiştirir, bin ise yanlış bir ikinci çekimli fiil olur.

#### `verneinung-5` › 5
Cümle: Beginne mit „Paul“. Ordne: Paul | lesen | das Buch | nicht | wird (nicht direkt vor den Infinitiv)

Gerekçe: Açıklama 'das Buch'u zaman bilgisi sayıyordu; das Buch bir nesnedir.

- Açıklama (TR)
  - Eski: Paul ile wird çekimi eşleşir. das Buch zaman bilgisi korunur; nicht, lesen ile anlatılan eylemi olumsuz yapar. Mastar lesen sonda kalır; olumsuzluk werden çekimini değiştirmez.
  - Yeni: Paul ile wird çekimi eşleşir. das Buch nesnesi korunur ve nicht'ten önce gelir; nicht, lesen ile anlatılan eylemi olumsuz yapar. Mastar lesen sonda kalır; olumsuzluk werden çekimini değiştirmez.

#### `verneinung-5` › 8
Cümle: Beginne mit „Die Kinder“. Ordne: Die Kinder | spielen | im Park | nicht | werden (nicht direkt vor den Infinitiv)

Gerekçe: Açıklama 'im Park'ı zaman bilgisi sayıyordu; bu bir yer bilgisidir.

- Açıklama (TR)
  - Eski: Die Kinder ile werden çekimi eşleşir. im Park zaman bilgisi korunur; nicht, spielen ile anlatılan eylemi olumsuz yapar. Mastar spielen sonda kalır; olumsuzluk werden çekimini değiştirmez.
  - Yeni: Die Kinder ile werden çekimi eşleşir. im Park yer bilgisi korunur; nicht, spielen ile anlatılan eylemi olumsuz yapar. Mastar spielen sonda kalır; olumsuzluk werden çekimini değiştirmez.

### `data/a2/komparativ-superlativ.json`

#### `wie-7` › 4
Cümle: Die Wohnung ist doppelt so groß ___ meine.

Gerekçe: İpucu etiketi İngilizce 'degree' idi; konuyla uyumlu Almanca/örnek etiketle değiştirildi.

- word
  - Eski: degree
  - Yeni: so … wie

#### `wie-7` › 5
Cümle: Mein Balkon ist nur halb so groß ___ deiner.

Gerekçe: İpucu etiketi İngilizce 'degree' idi; konuyla uyumlu Almanca/örnek etiketle değiştirildi.

- word
  - Eski: degree
  - Yeni: so … wie

#### `wie-7` › 6
Cümle: Tom ist fast so schnell ___ Paul.

Gerekçe: İpucu etiketi İngilizce 'degree' idi; konuyla uyumlu Almanca/örnek etiketle değiştirildi.

- word
  - Eski: degree
  - Yeni: so … wie

#### `vergleich-verstaerken-14` › 0
Cümle: Dieses Auto ist ___ schneller als meins.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: viel. Komparativi güçlendiren 'viel schneller'. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: viel. Komparativi güçlendiren 'viel schneller'. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 1
Cümle: Heute ist es ___ kälter als gestern.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: noch. 'noch kälter' = daha da soğuk. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: noch. 'noch kälter' = daha da soğuk. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 2
Cümle: Die neue Wohnung ist doppelt so groß ___ die alte.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: wie. doppelt so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: wie. doppelt so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 3
Cümle: Mein Zimmer ist nur halb so groß ___ deins.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: wie. halb so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: wie. halb so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 4
Cümle: Tom ist fast so alt ___ sein Bruder.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: wie. fast so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: wie. fast so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 5
Cümle: Der neue Tarif ist deutlich ___ als der alte.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: billiger. deutlich bir Komparativi güçlendiriyor. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: billiger. deutlich bir Komparativi güçlendiriyor. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 6
Cümle: Mira ist viel ___ als ich.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: jünger. viel + Komparativ. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: jünger. viel + Komparativ. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 7
Cümle: Der Bus ist nicht so schnell ___ der Zug.

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: wie. nicht so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: wie. nicht so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 8
Cümle: Bilde einen Satz: Der neue Tisch / doppelt so lang / der alte

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: Der neue Tisch ist doppelt so lang wie der alte.. doppelt so + Positiv + wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: Der neue Tisch ist doppelt so lang wie der alte.. doppelt so + Positiv + wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `vergleich-verstaerken-14` › 9
Cümle: Bilde einen Satz: mein Laptop / viel leicht / dein Laptop

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: Mein Laptop ist viel leichter als dein Laptop.. viel + leichter + als. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: Mein Laptop ist viel leichter als dein Laptop.. viel + leichter + als. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `saetze-schreiben-17` › 5
Cümle: Bilde: Wohnung A / doppelt so groß / Wohnung B

Gerekçe: Türkçe açıklamada Almanca kelimeye Türkçe ek eklenmiş anlaşılmaz bir ifade vardı ('Gleichheitte').

- Açıklama (TR)
  - Eski: Doğru cevap: Wohnung A ist doppelt so groß wie Wohnung B.. doppelt so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; Gleichheitte doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.
  - Yeni: Doğru cevap: Wohnung A ist doppelt so groß wie Wohnung B.. doppelt so ... wie. Karşılaştırmayı güçlendirmek için viel/deutlich/noch gibi sözcükler Komparativle; eşitlik karşılaştırmasında ise doppelt so, halb so, fast so gibi yapılar Positiv + wie ile kullanılır.

#### `formen-mix-15` › 8
Cümle: Schreibe die drei Formen: lang

Gerekçe: Ekranda gösterilen doğru cevap ('lang – länger – am längsten', uzun tire ile) kabul listesinde yoktu; aynen yazan öğrenci yanlış sayılıyordu.

- Kabul edilen cevaplar
  - Eski: `lang länger am längsten` / `lang - länger - am längsten` / `lang laenger am laengsten`
  - Yeni: `lang länger am längsten` / `lang - länger - am längsten` / `lang laenger am laengsten` / `lang – länger – am längsten` / `lang, länger, am längsten`

#### `formen-mix-15` › 9
Cümle: Schreibe die drei Formen: nah

Gerekçe: Ekranda gösterilen doğru cevap ('nah – näher – am nächsten', uzun tire ile) kabul listesinde yoktu.

- Kabul edilen cevaplar
  - Eski: `nah näher am nächsten` / `nah - näher - am nächsten` / `nah naeher am naechsten`
  - Yeni: `nah näher am nächsten` / `nah - näher - am nächsten` / `nah naeher am naechsten` / `nah – näher – am nächsten` / `nah, näher, am nächsten`

#### `saetze-schreiben-17` › 2
Cümle: Bilde: Paul / schnell / von allen

Gerekçe: 'Paul ist am schnellsten von allen.' sıralaması da doğru; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `paul ist von allen am schnellsten`
  - Yeni: `paul ist von allen am schnellsten` / `paul ist am schnellsten von allen`

#### `saetze-schreiben-17` › 4
Cümle: Bilde: Anna / gut Deutsch sprechen / Klasse

Gerekçe: Eşdeğer doğru sıralamalar kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `anna spricht in der klasse am besten deutsch`
  - Yeni: `anna spricht in der klasse am besten deutsch` / `in der klasse spricht anna am besten deutsch` / `anna spricht am besten deutsch in der klasse`

#### `saetze-schreiben-17` › 8
Cümle: Ergänze vollständig: Das ist ___ (gut) Restaurant der Stadt.

Gerekçe: 'Ergänze' yönergesinde yalnızca boşluğa gelen 'das beste' yazılabilir; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `das ist das beste restaurant der stadt`
  - Yeni: `das ist das beste restaurant der stadt` / `das beste`

#### `saetze-schreiben-17` › 9
Cümle: Ergänze vollständig: Sie ist ___ (jung) Teilnehmerin im Kurs.

Gerekçe: 'Ergänze' yönergesinde yalnızca boşluğa gelen 'die jüngste' yazılabilir; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `sie ist die jüngste teilnehmerin im kurs` / `sie ist die juengste teilnehmerin im kurs`
  - Yeni: `sie ist die jüngste teilnehmerin im kurs` / `sie ist die juengste teilnehmerin im kurs` / `die jüngste` / `die juengste`

### `data/a2/konjunktiv-ii.json`

#### `umformung-13` › 3
Cümle: Mach höflicher: Kannst du mir helfen?

Gerekçe: 'bitte' olmadan da Konjunktiv II ile kibar rica doğrudur; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `könntest du mir bitte helfen` / `koenntest du mir bitte helfen`
  - Yeni: `könntest du mir bitte helfen` / `koenntest du mir bitte helfen` / `könntest du mir helfen` / `koenntest du mir helfen`

#### `umformung-13` › 9
Cümle: Mach höflicher: Geben Sie mir bitte die Rechnung.

Gerekçe: Eşdeğer kibar rica biçimleri kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `würden sie mir bitte die rechnung geben` / `wuerden sie mir bitte die rechnung geben`
  - Yeni: `würden sie mir bitte die rechnung geben` / `wuerden sie mir bitte die rechnung geben` / `könnten sie mir bitte die rechnung geben` / `koennten sie mir bitte die rechnung geben` / `würden sie mir die rechnung geben`

#### `saetze-bilden-14` › 0
Cümle: Bilde den Satz: ich / gern / jetzt / zu Hause / sein

Gerekçe: Verilen sırayla kurulan doğru cümle kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `ich wäre jetzt gern zu hause` / `ich waere jetzt gern zu hause`
  - Yeni: `ich wäre jetzt gern zu hause` / `ich waere jetzt gern zu hause` / `ich wäre gern jetzt zu hause` / `ich waere gern jetzt zu hause`

#### `saetze-bilden-14` › 9
Cümle: Bilde die höfliche Bitte: Sie / mir / die Tür / öffnen

Gerekçe: Öğelerde 'bitte' verilmediği halde yalnızca 'bitte'li cevap kabul ediliyordu; 'Würden Sie …' de doğru.

- Kabul edilen cevaplar
  - Eski: `könnten sie mir bitte die tür öffnen` / `koennten sie mir bitte die tuer oeffnen`
  - Yeni: `könnten sie mir bitte die tür öffnen` / `koennten sie mir bitte die tuer oeffnen` / `könnten sie mir die tür öffnen` / `koennten sie mir die tuer oeffnen` / `würden sie mir bitte die tür öffnen` / `würden sie mir die tür öffnen` / `wuerden sie mir bitte die tuer oeffnen`

#### `umformung-13` › 7
Cümle: Bilde einen Bedingungssatz: Ich habe keine Zeit. Ich lerne nicht mehr Deutsch.

Gerekçe: 'Ich habe keine Zeit' cümlesinden 'Wenn ich Zeit hätte, …' de doğru biçimde kurulur; kabul edilmiyordu. Ekranda doğru cevap olarak gösterilen virgüllü yazım ('…, würde …') kabul listesinde yoktu; yalnızca virgülsüz yazım kabul ediliyordu. Almancada wenn-yan cümlesinden sonra virgül zorunludur; doğru yazım kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `wenn ich mehr zeit hätte würde ich mehr deutsch lernen` / `wenn ich mehr zeit haette wuerde ich mehr deutsch lernen`
  - Yeni: `wenn ich mehr zeit hätte würde ich mehr deutsch lernen` / `wenn ich mehr zeit haette wuerde ich mehr deutsch lernen` / `wenn ich zeit hätte, würde ich mehr deutsch lernen` / `wenn ich zeit hätte würde ich mehr deutsch lernen` / `wenn ich zeit haette wuerde ich mehr deutsch lernen` / `wenn ich mehr zeit hätte, würde ich mehr deutsch lernen`

#### `saetze-bilden-14` › 7
Cümle: Bilde den Satz: wenn / ich / ein Auto / haben / ich / dich / abholen

Gerekçe: Ekranda doğru cevap olarak gösterilen virgüllü yazım ('…, würde …') kabul listesinde yoktu; yalnızca virgülsüz yazım kabul ediliyordu. Almancada wenn-yan cümlesinden sonra virgül zorunludur; doğru yazım kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `wenn ich ein auto hätte würde ich dich abholen` / `wenn ich ein auto haette wuerde ich dich abholen`
  - Yeni: `wenn ich ein auto hätte würde ich dich abholen` / `wenn ich ein auto haette wuerde ich dich abholen` / `wenn ich ein auto hätte, würde ich dich abholen`

#### `challenge-15` › 6
Cümle: Bilde einen Rat: Wenn ich du / mehr Deutsch sprechen

Gerekçe: Ekranda doğru cevap olarak gösterilen virgüllü yazım ('…, würde …') kabul listesinde yoktu; yalnızca virgülsüz yazım kabul ediliyordu. Almancada wenn-yan cümlesinden sonra virgül zorunludur; doğru yazım kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `wenn ich du wäre würde ich mehr deutsch sprechen` / `wenn ich du waere wuerde ich mehr deutsch sprechen`
  - Yeni: `wenn ich du wäre würde ich mehr deutsch sprechen` / `wenn ich du waere wuerde ich mehr deutsch sprechen` / `wenn ich du wäre, würde ich mehr deutsch sprechen`

#### `challenge-15` › 8
Cümle: Bilde den Satz: wenn / ich / morgen frei / sein / ich / mitkommen

Gerekçe: Ekranda doğru cevap olarak gösterilen virgüllü yazım ('…, würde …') kabul listesinde yoktu; yalnızca virgülsüz yazım kabul ediliyordu. Almancada wenn-yan cümlesinden sonra virgül zorunludur; doğru yazım kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `wenn ich morgen frei wäre würde ich mitkommen` / `wenn ich morgen frei waere wuerde ich mitkommen`
  - Yeni: `wenn ich morgen frei wäre würde ich mitkommen` / `wenn ich morgen frei waere wuerde ich mitkommen` / `wenn ich morgen frei wäre, würde ich mitkommen`

### `data/a2/nebensaetze.json`

#### `weil-2` › 3
Cümle: Ich lerne heute Abend, weil ich morgen früh eine Prüfung ___.

Gerekçe: İpucu etiketi '[Modalverb]' yazıyordu ama cümlede modal fiil yok ('eine Prüfung habe').

- word
  - Eski: Modalverb
  - Yeni: haben

#### `weil-2` › 5
Cümle: Jonas ruft den Hausmeister an, weil die Heizung nicht ___.

Gerekçe: İpucu etiketi '[Trennbar]' yazıyordu ama 'funktionieren' ayrılabilen bir fiil değildir.

- word
  - Eski: Trennbar
  - Yeni: Verbende

#### `wenn-4` › 4
Cümle: Wenn ich früher Feierabend ___, komme ich mit.

Gerekçe: İpucu etiketi '[Modalverb]' yazıyordu ama cümlede modal fiil yok ('Feierabend habe').

- word
  - Eski: Modalverb
  - Yeni: Feierabend haben

#### `bevor-9` › 8
Cümle: Verbinde mit bevor: „Ich gehe ins Bett. Ich stelle den Wecker.“

Gerekçe: Türkçe açıklamada Almanca 'deshalb' kelimesi kalmıştı.

- Açıklama (TR)
  - Eski: Doğru cevap: Bevor ich ins Bett gehe, stelle ich den Wecker.. Alarm kurma, yatağa gitmeden önce gerçekleşir; deshalb 'bevor ich ins Bett gehe'. bevor iki eylem arasında 'önce' ilişkisi kurar: Hauptsatz'taki eylem, bevor-cümlesindeki eylemden önce gerçekleşir.
  - Yeni: Doğru cevap: Bevor ich ins Bett gehe, stelle ich den Wecker.. Alarm kurma, yatağa gitmeden önce gerçekleşir; bu yüzden 'bevor ich ins Bett gehe'. bevor iki eylem arasında 'önce' ilişkisi kurar: Hauptsatz'taki eylem, bevor-cümlesindeki eylemden önce gerçekleşir.

#### `weil-denn-da-15` › 7
Cümle: Welche Variante mit denn ist richtig?

Gerekçe: Türkçe açıklamada İngilizce terim ('subordinating') vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich esse jetzt, denn ich habe Hunger.. denn subordinating bağlaç değildir; ikinci cümle normal Hauptsatz sırasını 'ich habe Hunger' olarak korur. Nebensatz bir bağlaçla başlar ve çekimli fiil sona gider. Hauptsatz tek başına durabilir; çekimli fiil normalde 2. pozisyondadır. Nebensatz başta gelirse, onu izleyen Hauptsatz'ta çekimli fiil hemen gelir. Diğer seçenekler bu cümlede ya farklı bir anlam ilişkisi kurar ya da yanlış cümle yapısı gerektirir: “Ich esse jetzt, denn ich Hunger habe.”, “Denn ich Hunger habe, esse ich jetzt.”.
  - Yeni: Doğru cevap: Ich esse jetzt, denn ich habe Hunger.. denn yan cümle kuran bir bağlaç değildir; ikinci cümle normal Hauptsatz sırasını 'ich habe Hunger' olarak korur. Nebensatz bir bağlaçla başlar ve çekimli fiil sona gider. Hauptsatz tek başına durabilir; çekimli fiil normalde 2. pozisyondadır. Nebensatz başta gelirse, onu izleyen Hauptsatz'ta çekimli fiil hemen gelir. Diğer seçenekler bu cümlede ya farklı bir anlam ilişkisi kurar ya da yanlış cümle yapısı gerektirir: “Ich esse jetzt, denn ich Hunger habe.”, “Denn ich Hunger habe, esse ich jetzt.”.

#### `weil-denn-da-15` › 5
Cümle: ___ alle Plätze schon reserviert sind, suchen wir ein anderes Restaurant.

Gerekçe: Çeldirici 'Weil' de dil bilgisel olarak doğruydu ('Weil alle Plätze schon reserviert sind, suchen wir …'). 'Weil' yerine 'Deshalb' kondu.

- Seçenekler
  - Eski: `Da` / `Denn` / `Weil`
  - Yeni: `Da` / `Denn` / `Deshalb`
- Açıklama (TR)
  - Eski: Doğru cevap: Da. Sebep başta arka plan bilgisi olarak veriliyor; 'sind' yan cümlenin sonunda ve ardından 'suchen wir' geliyor. da sebep bildirir ve weil gibi Nebensatz kurar. da çoğu zaman sebebin zaten bilinen veya arka plan bilgisi olduğu durumlarda kullanılır. Diğer seçenekler bu cümlede ya farklı bir anlam ilişkisi kurar ya da yanlış cümle yapısı gerektirir: “Denn”, “Weil”.
  - Yeni: Doğru cevap: Da. Sebep cümlenin başında yan cümle olarak veriliyor ('sind' sonda) ve ardından 'suchen wir' geliyor. Denn ve deshalb başta yan cümle kuramaz. (Weil de burada doğru olurdu; da ise genellikle bilinen/arka plan sebep için tercih edilir.)
- DE/EN açıklamaları da güncellendi.

#### `seitdem-12` › 7
Cümle: Nora schläft besser, ___ sie abends ihr Handy ausschaltet.

Gerekçe: Çeldirici 'weil' de doğru bir cümle veriyordu ('Nora schläft besser, weil sie abends ihr Handy ausschaltet.'). 'weil' yerine 'obwohl' kondu.

- Seçenekler
  - Eski: `seitdem` / `weil` / `als`
  - Yeni: `seitdem` / `obwohl` / `als`
- Açıklama (TR)
  - Eski: Doğru cevap: seitdem. Akşam telefonu kapatma alışkanlığının başladığı dönemden beri daha iyi uyuyor. seitdem geçmişte başlayan ve etkisi şimdiye kadar süren bir zaman ilişkisini anlatır; yan cümlenin fiili sona gider. Diğer seçenekler bu cümlede ya farklı bir anlam ilişkisi kurar ya da yanlış cümle yapısı gerektirir: “weil”, “als”.
  - Yeni: Doğru cevap: seitdem. Akşam telefonu kapatma alışkanlığı başladığından beri daha iyi uyuyor: geçmişte başlayıp hâlâ süren durum → seitdem. obwohl karşıtlık, als geçmişte tek olay anlatır.
- DE/EN açıklamaları da güncellendi.

#### `bevor-nachdem-waehrend-19` › 1
Cümle: ___ ich den Brief abgeschickt habe, gehe ich nach Hause.

Gerekçe: Ana cümlede söz dizimi hatası vardı ('gehe ich zur Post nicht mehr' → nicht yanlış yerde) ve anlam belirsizdi. Cümle sadeleştirildi.

- Cümle
  - Eski: ___ ich den Brief abgeschickt habe, gehe ich zur Post nicht mehr.
  - Yeni: ___ ich den Brief abgeschickt habe, gehe ich nach Hause.
- Açıklama (TR)
  - Eski: Doğru cevap: Nachdem. Mektup gönderme tamamlanmış; ardından başka durum başlıyor. nachdem '... yaptıktan sonra' anlamındadır; nachdem-cümlesindeki eylem önce tamamlanır, diğer eylem daha sonra gerçekleşir. Diğer seçenekler bu cümlede ya farklı bir anlam ilişkisi kurar ya da yanlış cümle yapısı gerektirir: “Bevor”, “Während”.
  - Yeni: Doğru cevap: Nachdem. Önce mektup gönderiliyor (Perfekt: abgeschickt habe), sonra eve gidiliyor → nachdem (…dıktan sonra). bevor 'önce', während 'aynı anda' anlamı verirdi.
- DE/EN açıklamaları da güncellendi.

#### `nebensaetze-master-20` › 8
Cümle: Verbinde passend: „Zuerst rufe ich an. Danach komme ich vorbei.“

Gerekçe: 'Nachdem ich angerufen habe, komme ich vorbei.' de aynı sıralamayı doğru anlatır; kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `bevor ich vorbeikomme rufe ich an` / `bevor ich vorbeikomme, rufe ich an`
  - Yeni: `bevor ich vorbeikomme rufe ich an` / `bevor ich vorbeikomme, rufe ich an` / `nachdem ich angerufen habe, komme ich vorbei` / `nachdem ich angerufen habe komme ich vorbei`

#### `nebensaetze-master-20` › 9
Cümle: Ergänze logisch und korrekt: „___ ich gestern krank war, bin ich zu Hause geblieben.“

Gerekçe: Boşluğa yalnızca bağlacı yazan doğru cevap kabul edilmiyordu.

- Kabul edilen cevaplar
  - Eski: `weil ich gestern krank war bin ich zu hause geblieben` / `weil ich gestern krank war, bin ich zu hause geblieben` / `da ich gestern krank war bin ich zu hause geblieben` / `da ich gestern krank war, bin ich zu hause geblieben`
  - Yeni: `weil ich gestern krank war bin ich zu hause geblieben` / `weil ich gestern krank war, bin ich zu hause geblieben` / `da ich gestern krank war bin ich zu hause geblieben` / `da ich gestern krank war, bin ich zu hause geblieben` / `weil` / `da`

### `data/a2/praeteritum.json`

#### `starke-gemischte-verben-8` › 0
Cümle: Frau Keller ___ die Kinder zur Schule.

Gerekçe: Açıklama özneyi 'sie(pl)' olarak gösteriyordu; özne 'Frau Keller', yani tekil sie.

- Açıklama (TR)
  - Eski: Doğru cevap: brachte. bringen karışık fiildir: brachte. “bringen” güçlü/düzensiz bir fiildir; Präteritum biçimi düzenli “-te” ile tahmin edilemez. Temel geçmiş kökü “brachte-”dir ve “sie(pl)” için “brachte” kullanılır.
  - Yeni: Doğru cevap: brachte. bringen karışık fiildir: kök değişir (brach-) ama -te eki alır → brachte. Özne “Frau Keller” = sie (tekil), bu yüzden ek almaz: sie brachte. “bringte” düzenli fiil gibi kurulmuş yanlış biçimdir; “gebracht” Partizip II'dir ve tek başına yüklem olamaz.

#### `starke-gemischte-verben-8` › 7
Cümle: Als Kinder ___ wir jeden Tag zum See.

Gerekçe: Açıklama özneyi 'sie(pl)' olarak gösteriyordu; cümlenin öznesi 'wir'.

- Açıklama (TR)
  - Eski: Doğru cevap: liefen. laufen → lief; wir → liefen. “laufen” güçlü/düzensiz bir fiildir; Präteritum biçimi düzenli “-te” ile tahmin edilemez. Temel geçmiş kökü “lief-”dir ve “sie(pl)” için “liefen” kullanılır.
  - Yeni: Doğru cevap: liefen. laufen güçlü fiildir: Präteritum kökü lief-. Özne “wir” olduğu için -en eki gelir: wir liefen. Karşılaştır: ich/er lief. “lauften” düzenli fiil gibi kurulmuş yanlış biçimdir; “gelaufen” Partizip II'dir.

#### `frueher-heute-12` › 0
Cümle: Als Kind ___ Sandra wenig. Heute liest sie jede Woche ein Buch.

Gerekçe: Açıklama özneyi 'er' olarak gösteriyordu; özne 'Sandra' (sie).

- Açıklama (TR)
  - Eski: Doğru cevap: las. Geçmiş bölüm 'Als Kind' ile işaretlenmiş; lesen → las. “lesen” güçlü/düzensiz bir fiildir; Präteritum biçimi düzenli “-te” ile tahmin edilemez. Temel geçmiş kökü “las-”dir ve “er” için “las” kullanılır.
  - Yeni: Doğru cevap: las. 'Als Kind' geçmişi gösterir; bu yüzden Präteritum gerekir. lesen güçlü fiildir: lesen → las. Özne “Sandra” = sie (tekil), ek almaz: sie las. “liest” şimdiki zamandır (ikinci cümledeki 'Heute' için); “leste” diye bir biçim yoktur.

#### `zeitformen-13` › 0
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: lernen – lernte – gelernt. Düzenli lernen serisi Infinitiv–Präteritum–Partizip II olarak öğrenilmelidir. “lernen” düzenli bir fiildir. Präteritum kökü “lernte-” üzerinden kurulur; özne “er” olduğu için doğru çekim “lernen – lernte – gelernt” olur.
  - Yeni: Doğru cevap: lernen – lernte – gelernt. lernen düzenli fiildir: Präteritumda kök + -te (lernte), Partizip II'de ge- + kök + -t (gelernt). “gelernen” ve “lern” yanlış biçimlerdir.

#### `zeitformen-13` › 1
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: arbeiten – arbeitete – gearbeitet. arbeiten Präteritumda -ete, Partizip II'de gearbeitet olur. “arbeiten” düzenli bir fiildir. Präteritum kökü “arbeitete-” üzerinden kurulur; özne “er” olduğu için doğru çekim “arbeiten – arbeitete – gearbeitet” olur.
  - Yeni: Doğru cevap: arbeiten – arbeitete – gearbeitet. Kökü -t ile biten düzenli fiillerde telaffuz için araya -e- girer: arbeit-e-te, ge-arbeit-e-t. Bu yüzden “arbeitte” yanlıştır; “gearbeiten” ise güçlü fiil eki (-en) aldığı için yanlıştır.

#### `zeitformen-13` › 2
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: studieren – studierte – studiert. -ieren fiillerinde Partizip II ge- almaz. “studieren” düzenli bir fiildir. Präteritum kökü “studierte-” üzerinden kurulur; özne “er” olduğu için doğru çekim “studieren – studierte – studiert” olur.
  - Yeni: Doğru cevap: studieren – studierte – studiert. -ieren ile biten fiiller düzenlidir (studierte) ve Partizip II'de ge- almaz: studiert. Bu yüzden “gestudiert” yanlıştır; “studiert” Präteritum değil, Präsens/Partizip II biçimidir.

#### `zeitformen-13` › 3
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: können – konnte – gekonnt. können Präteritum konnte, Partizip II gekonnt. “können” fiilinin Präteritum çekimi sık kullanılan özel bir seridir. “er” öznesiyle doğru biçim “können – konnte – gekonnt”tir.
  - Yeni: Doğru cevap: können – konnte – gekonnt. Modal fiil können Präteritumda umlautu kaybeder: konnte. “könnte” Konjunktiv II'dir (yapabilirdi), Präteritum değildir; Partizip II de umlautsuzdur: gekonnt.

#### `zeitformen-13` › 4
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: aufhören – hörte auf – aufgehört. Ayrılabilir fiilde Präteritum hörte ... auf, Partizip II aufgehört. Bu cümlede doğru Präteritum biçimi “aufhören – hörte auf – aufgehört”tir.
  - Yeni: Doğru cevap: aufhören – hörte auf – aufgehört. Ayrılabilen fiilde Präteritumda ön ek ayrılır ve sona gider: hörte … auf. Partizip II'de ge- ön ek ile kök arasına girer: auf-ge-hört. “geaufhört” ve sadece “gehört” yanlıştır.

#### `zeitformen-13` › 5
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: einschalten – schaltete ein – eingeschaltet. einschalten düzenli ayrılabilir: schaltete ein / eingeschaltet. “einschalten” ayrılabilen bir fiildir. Präteritumda çekimli fiil bölümü “schaltete”, ayrılan ön ek ise “ein” olarak cümlenin sonunda kalır.
  - Yeni: Doğru cevap: einschalten – schaltete ein – eingeschaltet. Ayrılabilen fiilde Präteritumda ön ek ayrılır: schaltete … ein; kök -t ile bittiği için -ete. Partizip II'de ge- ön ekten sonra gelir: ein-ge-schaltet. “einschaltete” ve “geschaltet” yanlıştır.

#### `zeitformen-13` › 6
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: fahren – fuhr – gefahren. fahren güçlü: fuhr / gefahren. “fahren” güçlü/düzensiz bir fiildir; Präteritum biçimi düzenli “-te” ile tahmin edilemez. Temel geçmiş kökü “fuhr-”dir ve “er” için “fahren – fuhr – gefahren” kullanılır.
  - Yeni: Doğru cevap: fahren – fuhr – gefahren. fahren güçlü fiildir: Präteritumda kök ünlüsü değişir (a → u: fuhr), Partizip II -en ile biter ve ünlü yine a olur: gefahren. “fahrte/gefahrt” düzenli fiil gibi kurulmuştur; “gefuhrt” yanlıştır.

#### `zeitformen-13` › 7
Cümle: Welche Reihe ist richtig?

Gerekçe: Açıklamanın sonu 'özne “er” olduğu için' diyordu; bu soruda cümle/özne yok, sadece fiilin üç temel biçimi soruluyor. Gerekçe fiil kuralına göre yeniden yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: sprechen – sprach – gesprochen. sprechen güçlü: sprach / gesprochen. “sprechen” güçlü/düzensiz bir fiildir; Präteritum biçimi düzenli “-te” ile tahmin edilemez. Temel geçmiş kökü “sprach-”dir ve “er” için “sprechen – sprach – gesprochen” kullanılır.
  - Yeni: Doğru cevap: sprechen – sprach – gesprochen. sprechen güçlü fiildir: e → a → o (sprach, gesprochen). Partizip II -en ile biter. “sprechte/gesprecht” düzenli fiil gibi kurulmuştur; “gespracht” yanlıştır.

#### `zeitformen-13` › 8
Cümle: Schreibe die drei Formen: trinken

Gerekçe: Ekranda gösterilen doğru cevap (uzun tire '–' ile) kabul listesinde yoktu; sadece kısa tire '-' ve tiresiz yazım kabul ediliyordu. Gösterilen biçim de kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `trinken trank getrunken` / `trinken - trank - getrunken`
  - Yeni: `trinken trank getrunken` / `trinken - trank - getrunken` / `trinken – trank – getrunken`

#### `zeitformen-13` › 9
Cümle: Schreibe die drei Formen: machen

Gerekçe: Ekranda gösterilen doğru cevap (uzun tire '–' ile) kabul listesinde yoktu; sadece kısa tire '-' ve tiresiz yazım kabul ediliyordu. Gösterilen biçim de kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `machen machte gemacht` / `machen - machte - gemacht`
  - Yeni: `machen machte gemacht` / `machen - machte - gemacht` / `machen – machte – gemacht`

### `data/a2/verben-dativ-akkusativ.json`

#### `akkusativ-artikel-4` › 1
Cümle: Anna schenkt ihrer Mutter ___. (ein Schal)

Gerekçe: Açıklamanın sonu 'her Akkusativde artikel değişmek zorunda değildir' diyordu; oysa bu soruda isim maskulin ve artikel gerçekten değişiyor (ein/der → einen/den). Kural maskulin/diğer cinsler ayrımıyla netleştirildi.

- Açıklama (TR)
  - Eski: schenken ile ihrer Mutter alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Schal nesnesidir ve Akkusativ gerekir: ein → einen; Schal maskulin. Doğru grup einen Schal; her Akkusativde artikel değişmek zorunda değildir.
  - Yeni: schenken ile ihrer Mutter alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Schal nesnesidir ve Akkusativ gerekir: ein → einen; Schal maskulin. Doğru grup einen Schal. Maskulin isimlerde Akkusativde artikel değişir (der/ein → den/einen); feminin, nötr ve çoğulda değişmez.

#### `akkusativ-artikel-4` › 2
Cümle: Wir zeigen dem Gast ___. (der Weg)

Gerekçe: Açıklamanın sonu 'her Akkusativde artikel değişmek zorunda değildir' diyordu; oysa bu soruda isim maskulin ve artikel gerçekten değişiyor (ein/der → einen/den). Kural maskulin/diğer cinsler ayrımıyla netleştirildi.

- Açıklama (TR)
  - Eski: zeigen ile dem Gast alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Weg nesnesidir ve Akkusativ gerekir: der → den; Weg maskulin. Doğru grup den Weg; her Akkusativde artikel değişmek zorunda değildir.
  - Yeni: zeigen ile dem Gast alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Weg nesnesidir ve Akkusativ gerekir: der → den; Weg maskulin. Doğru grup den Weg. Maskulin isimlerde Akkusativde artikel değişir (der/ein → den/einen); feminin, nötr ve çoğulda değişmez.

#### `akkusativ-artikel-4` › 5
Cümle: Ich bringe der Nachbarin ___. (ein Kuchen)

Gerekçe: Açıklamanın sonu 'her Akkusativde artikel değişmek zorunda değildir' diyordu; oysa bu soruda isim maskulin ve artikel gerçekten değişiyor (ein/der → einen/den). Kural maskulin/diğer cinsler ayrımıyla netleştirildi.

- Açıklama (TR)
  - Eski: bringen ile der Nachbarin alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Kuchen nesnesidir ve Akkusativ gerekir: ein → einen; Kuchen maskulin. Doğru grup einen Kuchen; her Akkusativde artikel değişmek zorunda değildir.
  - Yeni: bringen ile der Nachbarin alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Kuchen nesnesidir ve Akkusativ gerekir: ein → einen; Kuchen maskulin. Doğru grup einen Kuchen. Maskulin isimlerde Akkusativde artikel değişir (der/ein → den/einen); feminin, nötr ve çoğulda değişmez.

#### `akkusativ-artikel-4` › 8
Cümle: Der Kellner empfiehlt der Frau ___. (der Salat)

Gerekçe: Açıklamanın sonu 'her Akkusativde artikel değişmek zorunda değildir' diyordu; oysa bu soruda isim maskulin ve artikel gerçekten değişiyor (ein/der → einen/den). Kural maskulin/diğer cinsler ayrımıyla netleştirildi.

- Açıklama (TR)
  - Eski: empfehlen ile der Frau alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Salat nesnesidir ve Akkusativ gerekir: der → den; Salat maskulin. Doğru grup den Salat; her Akkusativde artikel değişmek zorunda değildir.
  - Yeni: empfehlen ile der Frau alıcı olarak zaten Dativdir. Boşluk, Was? ile sorulan Salat nesnesidir ve Akkusativ gerekir: der → den; Salat maskulin. Doğru grup den Salat. Maskulin isimlerde Akkusativde artikel değişir (der/ein → den/einen); feminin, nötr ve çoğulda değişmez.

### `data/a2/verben-praepositionen.json`

#### `an-2` › 5
Cümle: Ich denke an ___ Termin morgen.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: den. “denken an” burada Akkusativ ister; Termin maskulin olduğu için “an den Termin” olur. Bu fiil kalıp olarak “denken an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “der”, “dem” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: den. “denken an” burada Akkusativ ister; Termin maskulin olduğu için “an den Termin” olur. Bu fiil kalıp olarak “denken an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“der”, “dem”) burada gereken Akkusativ biçimi değildir.

#### `an-2` › 6
Cümle: Wir nehmen an ___ Workshop teil.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: dem. “teilnehmen an” Dativ ister; Workshop maskulin olduğu için “an dem Workshop” olur. Bu fiil kalıp olarak “teilnehmen an” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “den”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dem. “teilnehmen an” Dativ ister; Workshop maskulin olduğu için “an dem Workshop” olur. Bu fiil kalıp olarak “teilnehmen an” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“den”, “der”) burada gereken Dativ biçimi değildir.

#### `an-2` › 7
Cümle: Erinnerst du dich an ___ neue Kollegin?

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: die. “sich erinnern an” Akkusativ ister; Kollegin feminin Akkusativ “die”dir. Bu fiil kalıp olarak “sich erinnern an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “der”, “den” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: die. “sich erinnern an” Akkusativ ister; Kollegin feminin Akkusativ “die”dir. Bu fiil kalıp olarak “sich erinnern an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“der”, “den”) burada gereken Akkusativ biçimi değildir.

#### `auf-3` › 5
Cümle: Ich warte auf ___ nächsten Zug.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: den. “warten auf” Akkusativ; Zug maskulin → den. Bu fiil kalıp olarak “warten auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “der”, “dem” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: den. “warten auf” Akkusativ; Zug maskulin → den. Bu fiil kalıp olarak “warten auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“der”, “dem”) burada gereken Akkusativ biçimi değildir.

#### `auf-3` › 6
Cümle: Sie bereitet sich auf ___ Prüfung vor.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: die. Prüfung feminin Akkusativ → die. Bu fiil kalıp olarak “sich vorbereiten auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “der”, “dem” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: die. Prüfung feminin Akkusativ → die. Bu fiil kalıp olarak “sich vorbereiten auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“der”, “dem”) burada gereken Akkusativ biçimi değildir.

#### `auf-3` › 7
Cümle: Kann ich mich auf ___ verlassen? (du)

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: dich. “sich verlassen auf” Akkusativ ister; du → dich. Bu fiil kalıp olarak “sich verlassen auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dir”, “du” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dich. “sich verlassen auf” Akkusativ ister; du → dich. Bu fiil kalıp olarak “sich verlassen auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dir”, “du”) burada gereken Akkusativ biçimi değildir.

#### `fuer-4` › 6
Cümle: Er interessiert sich für ___ neuen Kurs.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: den. für her zaman Akkusativ; Kurs maskulin → den. Bu fiil kalıp olarak “sich interessieren für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dem”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: den. für her zaman Akkusativ; Kurs maskulin → den. Bu fiil kalıp olarak “sich interessieren für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dem”, “der”) burada gereken Akkusativ biçimi değildir.

#### `fuer-4` › 7
Cümle: Ich danke dir für ___ Unterstützung.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: die. für + Akkusativ; Unterstützung feminin → die. Bu fiil kalıp olarak “danken für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “der”, “dem” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: die. für + Akkusativ; Unterstützung feminin → die. Bu fiil kalıp olarak “danken für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“der”, “dem”) burada gereken Akkusativ biçimi değildir.

#### `ueber-5` › 6
Cümle: Er ärgert sich über ___ langen Stau.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: den. über bu kalıpta Akkusativ; Stau maskulin → den. Bu fiil kalıp olarak “sich ärgern über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dem”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: den. über bu kalıpta Akkusativ; Stau maskulin → den. Bu fiil kalıp olarak “sich ärgern über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dem”, “der”) burada gereken Akkusativ biçimi değildir.

#### `ueber-5` › 7
Cümle: Wir freuen uns über ___ Geschenke.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: die. über + Akkusativ çoğul → die Geschenke. Bu fiil kalıp olarak “sich freuen über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “den”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: die. über + Akkusativ çoğul → die Geschenke. Bu fiil kalıp olarak “sich freuen über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“den”, “der”) burada gereken Akkusativ biçimi değildir.

#### `um-6` › 4
Cümle: Ich bitte dich um ___ kurze Antwort.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: eine. um her zaman Akkusativ; Antwort feminin → eine. Bu fiil kalıp olarak “bitten um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “einer”, “einem” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: eine. um her zaman Akkusativ; Antwort feminin → eine. Bu fiil kalıp olarak “bitten um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“einer”, “einem”) burada gereken Akkusativ biçimi değildir.

#### `um-6` › 5
Cümle: Er bemüht sich um ___ neuen Arbeitsplatz.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: einen. um + Akkusativ; Arbeitsplatz maskulin → einen. Bu fiil kalıp olarak “sich bemühen um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “einer”, “einem” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: einen. um + Akkusativ; Arbeitsplatz maskulin → einen. Bu fiil kalıp olarak “sich bemühen um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“einer”, “einem”) burada gereken Akkusativ biçimi değildir.

#### `um-6` › 6
Cümle: Kannst du dich um ___ kümmern? (er)

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: ihn. um + Akkusativ; er → ihn. Bu fiil kalıp olarak “sich kümmern um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “ihm”, “er” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: ihn. um + Akkusativ; er → ihn. Bu fiil kalıp olarak “sich kümmern um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“ihm”, “er”) burada gereken Akkusativ biçimi değildir.

#### `mit-7` › 6
Cümle: Wir rechnen mit ___ Antwort morgen.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: einer. mit her zaman Dativ; Antwort feminin → einer. Bu fiil kalıp olarak “rechnen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “eine”, “einen” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: einer. mit her zaman Dativ; Antwort feminin → einer. Bu fiil kalıp olarak “rechnen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“eine”, “einen”) burada gereken Dativ biçimi değildir.

#### `mit-7` › 7
Cümle: Sie trifft sich mit ___ neuen Kollegen.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: dem. mit + Dativ; Kollege maskulin → dem. Bu fiil kalıp olarak “sich treffen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “den”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dem. mit + Dativ; Kollege maskulin → dem. Bu fiil kalıp olarak “sich treffen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“den”, “der”) burada gereken Dativ biçimi değildir.

#### `kasus-11` › 0
Cümle: Wir warten auf ___ neuen Kollegen.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: den. “warten auf” Akkusativ ister; Kollege maskulin → den. Bu fiil kalıp olarak “warten auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dem”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: den. “warten auf” Akkusativ ister; Kollege maskulin → den. Bu fiil kalıp olarak “warten auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dem”, “der”) burada gereken Akkusativ biçimi değildir.

#### `kasus-11` › 1
Cümle: Sie nimmt an ___ neuen Kurs teil.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: dem. “teilnehmen an” Dativ ister; Kurs maskulin → dem. Bu fiil kalıp olarak “teilnehmen an” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “den”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dem. “teilnehmen an” Dativ ister; Kurs maskulin → dem. Bu fiil kalıp olarak “teilnehmen an” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“den”, “der”) burada gereken Dativ biçimi değildir.

#### `kasus-11` › 2
Cümle: Ich denke an ___ Prüfung.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: die. “denken an” Akkusativ; Prüfung feminin → die. Bu fiil kalıp olarak “denken an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dem”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: die. “denken an” Akkusativ; Prüfung feminin → die. Bu fiil kalıp olarak “denken an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dem”, “der”) burada gereken Akkusativ biçimi değildir.

#### `kasus-11` › 3
Cümle: Wir rechnen mit ___ Verspätung.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: einer. “rechnen mit” Dativ; Verspätung feminin → einer. Bu fiil kalıp olarak “rechnen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “eine”, “einen” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: einer. “rechnen mit” Dativ; Verspätung feminin → einer. Bu fiil kalıp olarak “rechnen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“eine”, “einen”) burada gereken Dativ biçimi değildir.

#### `kasus-11` › 4
Cümle: Er interessiert sich für ___ Thema.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: das. für + Akkusativ; Thema nötr → das. Bu fiil kalıp olarak “sich interessieren für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dem”, “den” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: das. für + Akkusativ; Thema nötr → das. Bu fiil kalıp olarak “sich interessieren für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dem”, “den”) burada gereken Akkusativ biçimi değildir.

#### `kasus-11` › 5
Cümle: Sie träumt von ___ Haus am See.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: einem. von + Dativ; Haus nötr → einem. Bu fiil kalıp olarak “träumen von” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “einen”, “ein” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: einem. von + Dativ; Haus nötr → einem. Bu fiil kalıp olarak “träumen von” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“einen”, “ein”) burada gereken Dativ biçimi değildir.

#### `kasus-11` › 6
Cümle: Ich kümmere mich um ___ Hund meiner Schwester.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Akkusativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: den. um + Akkusativ; Hund maskulin → den. Bu fiil kalıp olarak “sich kümmern um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dem”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: den. um + Akkusativ; Hund maskulin → den. Bu fiil kalıp olarak “sich kümmern um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler (“dem”, “der”) burada gereken Akkusativ biçimi değildir.

#### `kasus-11` › 7
Cümle: Der Tourist fragt nach ___ Bahnhof.

Gerekçe: Yanlış şıklar artikel/zamir biçimleri; açıklama bunların 'fiilin sabit kalıbına uymadığını' söylüyordu. Gerçek neden hâl (Kasus): prepozisyondan sonra Dativ gerekir ve bu şıklar o biçim değil.

- Açıklama (TR)
  - Eski: Doğru cevap: dem. nach + Dativ; Bahnhof maskulin → dem. Bu fiil kalıp olarak “fragen nach” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “den”, “der” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dem. nach + Dativ; Bahnhof maskulin → dem. Bu fiil kalıp olarak “fragen nach” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler (“den”, “der”) burada gereken Dativ biçimi değildir.

#### `reflexiv-10` › 0
Cümle: Wir interessieren ___ für nachhaltige Technik.

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["uns"]); ekranda köşeli parantezle görünüyordu. Düz metin 'uns' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `['uns']` / `sich` / `euch`
  - Yeni: `uns` / `sich` / `euch`
- Cevap
  - Eski: `uns`
  - Yeni: uns
- Açıklama (TR)
  - Eski: Doğru cevap: uns. Özne wir olduğu için Reflexivpronomen “uns”; fiil kalıbı “sich interessieren für”dır. Bu fiil kalıp olarak “sich interessieren für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “sich”, “euch” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: uns. Özne wir olduğu için Reflexivpronomen “uns”; fiil kalıbı “sich interessieren für”dır. Bu fiil kalıp olarak “sich interessieren für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“sich”, “euch”) bu özneye uymuyor.

#### `reflexiv-10` › 1
Cümle: Erinnerst du ___ noch an unseren ersten Kurs?

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["dich"]); ekranda köşeli parantezle görünüyordu. Düz metin 'dich' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `dir` / `sich` / `['dich']`
  - Yeni: `dir` / `sich` / `dich`
- Cevap
  - Eski: `dich`
  - Yeni: dich
- Açıklama (TR)
  - Eski: Doğru cevap: dich. Özne du → Reflexivpronomen dich; ardından “an + Akk.” gelir. Bu fiil kalıp olarak “sich erinnern an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “dir”, “sich” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dich. Özne du → Reflexivpronomen dich; ardından “an + Akk.” gelir. Bu fiil kalıp olarak “sich erinnern an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“dir”, “sich”) bu özneye uymuyor.

#### `reflexiv-10` › 2
Cümle: Die Schüler müssen ___ besser auf die Aufgabe konzentrieren.

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["sich"]); ekranda köşeli parantezle görünüyordu. Düz metin 'sich' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `euch` / `['sich']` / `uns`
  - Yeni: `euch` / `sich` / `uns`
- Cevap
  - Eski: `sich`
  - Yeni: sich
- Açıklama (TR)
  - Eski: Doğru cevap: sich. Özne die Schüler = sie (çoğul), Reflexivpronomen sich. Bu fiil kalıp olarak “sich konzentrieren auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “euch”, “uns” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: sich. Özne die Schüler = sie (çoğul), Reflexivpronomen sich. Bu fiil kalıp olarak “sich konzentrieren auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“euch”, “uns”) bu özneye uymuyor.

#### `reflexiv-10` › 3
Cümle: Ich freue ___ schon auf das Wochenende.

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["mich"]); ekranda köşeli parantezle görünüyordu. Düz metin 'mich' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `['mich']` / `mir` / `sich`
  - Yeni: `mich` / `mir` / `sich`
- Cevap
  - Eski: `mich`
  - Yeni: mich
- Açıklama (TR)
  - Eski: Doğru cevap: mich. Özne ich → mich; gelecekteki hafta sonu için “freuen auf”. Bu fiil kalıp olarak “sich freuen auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “mir”, “sich” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: mich. Özne ich → mich; gelecekteki hafta sonu için “freuen auf”. Bu fiil kalıp olarak “sich freuen auf” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“mir”, “sich”) bu özneye uymuyor.

#### `reflexiv-10` › 4
Cümle: Kümmert ihr ___ heute um das Abendessen?

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["euch"]); ekranda köşeli parantezle görünüyordu. Düz metin 'euch' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `uns` / `sich` / `['euch']`
  - Yeni: `uns` / `sich` / `euch`
- Cevap
  - Eski: `euch`
  - Yeni: euch
- Açıklama (TR)
  - Eski: Doğru cevap: euch. Özne ihr → euch; kalıp “sich kümmern um”. Bu fiil kalıp olarak “sich kümmern um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “uns”, “sich” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: euch. Özne ihr → euch; kalıp “sich kümmern um”. Bu fiil kalıp olarak “sich kümmern um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“uns”, “sich”) bu özneye uymuyor.

#### `reflexiv-10` › 5
Cümle: Warum wunderst du ___ über diese Nachricht?

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["dich"]); ekranda köşeli parantezle görünüyordu. Düz metin 'dich' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `mich` / `['dich']` / `dir`
  - Yeni: `mich` / `dich` / `dir`
- Cevap
  - Eski: `dich`
  - Yeni: dich
- Açıklama (TR)
  - Eski: Doğru cevap: dich. Özne du → dich; kalıp “sich wundern über”. Bu fiil kalıp olarak “sich wundern über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “mich”, “dir” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: dich. Özne du → dich; kalıp “sich wundern über”. Bu fiil kalıp olarak “sich wundern über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“mich”, “dir”) bu özneye uymuyor.

#### `reflexiv-10` › 6
Cümle: Am Samstag treffen wir ___ mit alten Freunden.

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["uns"]); ekranda köşeli parantezle görünüyordu. Düz metin 'uns' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `['uns']` / `sich` / `euch`
  - Yeni: `uns` / `sich` / `euch`
- Cevap
  - Eski: `uns`
  - Yeni: uns
- Açıklama (TR)
  - Eski: Doğru cevap: uns. Özne wir → uns; “sich treffen mit”. Bu fiil kalıp olarak “sich treffen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer seçenekler “sich”, “euch” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: uns. Özne wir → uns; “sich treffen mit”. Bu fiil kalıp olarak “sich treffen mit” şeklinde öğrenilmelidir ve prepozisyondan sonra Dativ gelir. Diğer zamirler (“sich”, “euch”) bu özneye uymuyor.

#### `reflexiv-10` › 7
Cümle: Frau Kaya bemüht ___ um eine schnelle Lösung.

Gerekçe: Veri hatası: doğru şık ve cevap liste olarak kaydedilmişti (["sich"]); ekranda köşeli parantezle görünüyordu. Düz metin 'sich' yapıldı. Ayrıca yanlış şıkların nedeni 'sabit kalıp' değil, zamirin özneye uymamasıdır.

- Seçenekler
  - Eski: `ihr` / `uns` / `['sich']`
  - Yeni: `ihr` / `uns` / `sich`
- Cevap
  - Eski: `sich`
  - Yeni: sich
- Açıklama (TR)
  - Eski: Doğru cevap: sich. Özne Frau Kaya = sie → sich. Bu fiil kalıp olarak “sich bemühen um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “ihr”, “uns” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: sich. Özne Frau Kaya = sie → sich. Bu fiil kalıp olarak “sich bemühen um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer zamirler (“ihr”, “uns”) bu özneye uymuyor.

#### `um-6` › 7
Cümle: Welche Verbindung bedeutet „birinden bir şey rica etmek“?

Gerekçe: Veri hatası: şıklar 'b', 'i' ve bir liste olarak kaydedilmişti; doğru cevap üç kalıbın listesi olduğu için soru çözülemiyordu. Şıklar 'bitten um / fragen nach / danken für', doğru cevap 'bitten um' yapıldı (açıklama zaten bitten um'u anlatıyordu).

- Seçenekler
  - Eski: `b` / `i` / `['bitten um', 'fragen nach', 'danken für']`
  - Yeni: `bitten um` / `fragen nach` / `danken für`
- Cevap
  - Eski: `bitten um` / `fragen nach` / `danken für`
  - Yeni: bitten um
- Açıklama (TR)
  - Eski: Doğru cevap: bitten um / fragen nach / danken für. Birinden bir şey talep/rica etmek “bitten um”dur. Bu fiil kalıp olarak “bitten um” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “b”, “i” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: bitten um. Birinden bir şey rica etmek/istemek “jemanden um etwas bitten” kalıbıdır: Ich bitte dich um Hilfe. “fragen nach” bir bilgiyi sormaktır (Ich frage nach dem Weg); “danken für” bir şey için teşekkür etmektir (Ich danke dir für die Hilfe).
- DE/EN açıklamaları da güncellendi.

#### `zwei-praepositionen-9` › 8
Cümle: Ergänze beide Präpositionen: Ich bedanke mich ___ dir ___ das Geschenk.

Gerekçe: Soru iki boşluk (bei ve für) istiyor ama açıklama yalnızca 'sich bedanken für + Akkusativ' diyordu; bei + Dativ kısmı eklendi. Virgüllü/tireli yazımlar da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: bei / für. Kişi “bei dir”, teşekkür nedeni “für das Geschenk” ile kurulur. Bu fiil kalıp olarak “sich bedanken für” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir.
  - Yeni: Doğru cevap: bei / für. sich bedanken iki prepozisyon alabilir: teşekkür edilen kişi “bei + Dativ” (bei dir), teşekkür nedeni “für + Akkusativ” (für das Geschenk). Kişi → bei, şey → für.
- Kabul edilen cevaplar
  - Eski: `bei für` / `bei / für`
  - Yeni: `bei für` / `bei / für` / `bei, für` / `bei - für` / `bei – für`

#### `zwei-praepositionen-9` › 9
Cümle: Ergänze beide Präpositionen: Wir beschweren uns ___ dem Chef ___ die Arbeitszeiten.

Gerekçe: Soru iki boşluk (bei ve über) istiyor ama açıklama yalnızca 'sich beschweren über + Akkusativ' diyordu; bei + Dativ kısmı eklendi. Virgüllü/tireli yazımlar da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: bei / über. Şikâyetin iletildiği kişi “bei dem Chef”, konusu “über die Arbeitszeiten”dır. Bu fiil kalıp olarak “sich beschweren über” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir.
  - Yeni: Doğru cevap: bei / über. sich beschweren iki prepozisyon alabilir: şikâyetin iletildiği kişi “bei + Dativ” (bei dem Chef), şikâyetin konusu “über + Akkusativ” (über die Arbeitszeiten). Kişi → bei, konu → über.
- Kabul edilen cevaplar
  - Eski: `bei über` / `bei / über`
  - Yeni: `bei über` / `bei / über` / `bei, über` / `bei - über` / `bei – über`

#### `an-2` › 2
Cümle: Dieses Lied erinnert mich ___ meine Schulzeit.

Gerekçe: Açıklama 'sich erinnern an' diyordu; oysa cümlede dönüşlü zamir yok ('mich' nesnedir): 'jemanden an etwas erinnern' = birine bir şeyi hatırlatmak.

- Açıklama (TR)
  - Eski: Doğru cevap: an. Bir şeyi hatırlatma/hatırlama bağlantısı “sich erinnern an” ile kurulur. Bu fiil kalıp olarak “sich erinnern an” şeklinde öğrenilmelidir ve prepozisyondan sonra Akkusativ gelir. Diğer seçenekler “mit”, “auf” bu fiilin sabit kalıbına uymuyor.
  - Yeni: Doğru cevap: an. Bu cümlede fiil dönüşlü değildir: “jemanden an etwas erinnern” = birine bir şeyi hatırlatmak. Şarkı (özne) bana (mich) okul yıllarımı hatırlatıyor; hatırlatılan şey “an + Akkusativ” ile gelir: an meine Schulzeit. Karşılaştır: Ich erinnere mich an meine Schulzeit (dönüşlü: hatırlamak). “mit” ve “auf” bu fiille kullanılmaz.

#### `personenfragen-13` › 8
Cümle: Formuliere die Frage nach der Person: „Ich lade meine Kollegin zur Feier ein.“

Gerekçe: Açıklamanın sonu 'kişi sorulurken prepozisyon korunur ve wem kullanılır' diyordu; oysa doğru cevap prepozisyonsuz 'Wen' (einladen kişiyi Akkusativ nesne olarak alır).

- Açıklama (TR)
  - Eski: Doğru cevap: Wen lädst du zur Feier ein?. Burada kişiyi doğrudan “wen” ile soruyoruz; “zu” ise davet edilen etkinliğe aittir. “einladen zu” kalıbında prepozisyon “zu”dir. Kişi sorulurken prepozisyon korunur ve wem kullanılır.
  - Yeni: Doğru cevap: Wen lädst du zur Feier ein?. einladen kişiyi doğrudan Akkusativ nesne olarak alır (meine Kollegin); kişinin önünde prepozisyon yoktur. Bu yüzden soru prepozisyonsuz “Wen?” ile kurulur. “zur Feier” (zu + Dativ) davetin hedefi olan etkinliktir ve cümlede aynen kalır.
- Kabul edilen cevaplar
  - Eski: `wen lädst du zur feier ein` / `wen laedst du zur feier ein`
  - Yeni: `wen lädst du zur feier ein` / `wen laedst du zur feier ein` / `wen lädst du zur feier ein?`

#### `schreiben-17` › 0
Cümle: Bilde einen Satz: ich / auf / der Bus / warten

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `ich warte auf den bus`
  - Yeni: `ich warte auf den bus` / `auf den bus warte ich`

#### `schreiben-17` › 1
Cümle: Bilde einen Satz: wir / an / ein Workshop / teilnehmen

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `wir nehmen an einem workshop teil`
  - Yeni: `wir nehmen an einem workshop teil` / `an einem workshop nehmen wir teil`

#### `schreiben-17` › 2
Cümle: Bilde einen Satz: meine Schwester / sich / für / Kunst / interessieren

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `meine schwester interessiert sich für kunst`
  - Yeni: `meine schwester interessiert sich für kunst` / `für kunst interessiert sich meine schwester`

#### `schreiben-17` › 3
Cümle: Bilde einen Satz: er / von / ein Haus am Meer / träumen

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `er träumt von einem haus am meer` / `er traeumt von einem haus am meer`
  - Yeni: `er träumt von einem haus am meer` / `er traeumt von einem haus am meer` / `von einem haus am meer träumt er`

#### `schreiben-17` › 4
Cümle: Bilde einen Satz: ich / mich / auf / die Präsentation / vorbereiten

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `ich bereite mich auf die präsentation vor` / `ich bereite mich auf die praesentation vor`
  - Yeni: `ich bereite mich auf die präsentation vor` / `ich bereite mich auf die praesentation vor` / `auf die präsentation bereite ich mich vor`

#### `schreiben-17` › 5
Cümle: Bilde einen Satz: die Kundin / sich / nach / der Preis / erkundigen

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `die kundin erkundigt sich nach dem preis`
  - Yeni: `die kundin erkundigt sich nach dem preis` / `nach dem preis erkundigt sich die kundin`

#### `schreiben-17` › 6
Cümle: Bilde einen Satz: wir / uns / bei Frau Klein / für die Hilfe / bedanken

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `wir bedanken uns bei frau klein für die hilfe`
  - Yeni: `wir bedanken uns bei frau klein für die hilfe` / `wir bedanken uns für die hilfe bei frau klein`

#### `schreiben-17` › 7
Cümle: Bilde einen Satz: ich / mich / mit meinem Freund / über den Kurs / unterhalten

Gerekçe: Kelimeler verilmiş ama sıra zorunlu tutulmamış; Almancada prepozisyonlu nesne başa alınabilir (çekimli fiil yine 2. sırada) ya da iki prepozisyonlu grubun yeri değişebilir. Bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `ich unterhalte mich mit meinem freund über den kurs`
  - Yeni: `ich unterhalte mich mit meinem freund über den kurs` / `ich unterhalte mich über den kurs mit meinem freund`

### `data/a2/wechselpraepositionen.json`

#### `alltag-6` › 0
Cümle: A: Wo ist dein Handy? B: Es liegt ___ Tasche.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: in der. Wo? → Dativ.
  - Yeni: Doğru cevap: in der. “liegen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. die Tasche feminin → in der Tasche. Karşılaştır: Ich lege es in die Tasche (Wohin?).

#### `alltag-6` › 1
Cümle: A: Wohin legst du dein Handy? B: ___ Tasche.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: In die. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: In die. Soru “Wohin legst du …?” ve “legen” yerleştirme fiilidir → Akkusativ. die Tasche feminin → in die Tasche. Karşılaştır: Es liegt in der Tasche (Wo?).

#### `alltag-6` › 2
Cümle: Die Kinder spielen ___ Boden.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: auf dem. Wo? → Dativ.
  - Yeni: Doğru cevap: auf dem. “spielen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Boden maskulin → auf dem Boden. Çocuklar bir yere gitmiyor, yerde oynuyor.

#### `alltag-6` › 3
Cümle: Bitte stell die Tasche ___ Boden.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: auf den. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: auf den. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. der Boden maskulin → auf den Boden. Karşılaştır: Die Tasche steht auf dem Boden (Wo?).

#### `alltag-6` › 4
Cümle: Wir warten ___ Kino.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: vor dem. Wo? → Dativ.
  - Yeni: Doğru cevap: vor dem. “warten” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. Bir yerde bekliyoruz, oraya hareket etmiyoruz. das Kino nötr → vor dem Kino.

#### `alltag-6` › 5
Cümle: Ich stelle mich ___ Eingang.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: vor den. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: vor den. “sich stellen” bir yere geçip durmaktır (hareket) → Wohin? → Akkusativ. der Eingang maskulin → vor den Eingang. Karşılaştır: Ich stehe vor dem Eingang (Wo?).

#### `alltag-6` › 6
Cümle: Der Drucker steht ___ Computer.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: neben dem. Wo? → Dativ.
  - Yeni: Doğru cevap: neben dem. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Computer maskulin → neben dem Computer.

#### `alltag-6` › 7
Cümle: Stell den Drucker ___ Computer.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: neben den. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: neben den. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. der Computer maskulin → neben den Computer. Karşılaştır: Der Drucker steht neben dem Computer (Wo?).

#### `alltag-6` › 8
Cümle: Die Apotheke liegt ___ Bank und dem Café.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: zwischen der. İlk isim die Bank → Dativ der Bank.
  - Yeni: Doğru cevap: zwischen der. “liegen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. İki isim de Dativ olur: die Bank → der Bank, das Café → dem Café (cümlede zaten 'dem Café' var).

#### `alltag-6` › 9
Cümle: Die Katze schläft ___ Bett.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: unter dem. Wo? → Dativ.
  - Yeni: Doğru cevap: unter dem. “schlafen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. das Bett nötr → unter dem Bett.

#### `zimmer-7` › 0
Cümle: Das Sofa steht ___ Fenster.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: vor dem. Wo? → Dativ.
  - Yeni: Doğru cevap: vor dem. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. das Fenster nötr → vor dem Fenster.

#### `zimmer-7` › 1
Cümle: Wir stellen das Sofa ___ Fenster.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: vor das. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: vor das. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. das Fenster nötr → vor das Fenster. Karşılaştır: Das Sofa steht vor dem Fenster (Wo?).

#### `zimmer-7` › 2
Cümle: Die Teller stehen ___ Schrank.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: im. Wo? → im Schrank.
  - Yeni: Doğru cevap: im. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Schrank maskulin → in dem Schrank = im Schrank.

#### `zimmer-7` › 3
Cümle: Ich stelle die Teller ___ Schrank.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: in den. Wohin? → in den Schrank.
  - Yeni: Doğru cevap: in den. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. der Schrank maskulin → in den Schrank. “im” = in dem (Dativ) olduğu için burada yanlıştır.

#### `zimmer-7` › 4
Cümle: Das Bild hängt ___ Bett.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: über dem. Wo? → Dativ.
  - Yeni: Doğru cevap: über dem. Burada “hängen” (hängt) asılı durmayı anlatır (konum) → Wo? → Dativ. das Bett nötr → über dem Bett.

#### `zimmer-7` › 5
Cümle: Ich hänge das Bild ___ Bett.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: über das. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: über das. Burada “hängen” (ich hänge das Bild) bir şeyi bir yere asmaktır (yerleştirme) → Wohin? → Akkusativ. das Bett nötr → über das Bett.

#### `zimmer-7` › 6
Cümle: Der Papierkorb steht ___ Schreibtisch.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: unter dem. Wo? → Dativ.
  - Yeni: Doğru cevap: unter dem. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Schreibtisch maskulin → unter dem Schreibtisch.

#### `zimmer-7` › 7
Cümle: Stell den Papierkorb ___ Schreibtisch.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: unter den. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: unter den. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. der Schreibtisch maskulin → unter den Schreibtisch. Karşılaştır: Der Papierkorb steht unter dem Schreibtisch (Wo?).

#### `zimmer-7` › 8
Cümle: Die Schuhe stehen ___ Tür.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: neben der. Wo? → Dativ.
  - Yeni: Doğru cevap: neben der. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. die Tür feminin → neben der Tür.

#### `zimmer-7` › 9
Cümle: Leg die Tasche ___ Schuhe.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: zwischen die. Wohin? → Akkusativ Plural.
  - Yeni: Doğru cevap: zwischen die. “legen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. die Schuhe çoğul → Akkusativ çoğul: zwischen die Schuhe. (Dativ çoğul olsaydı: zwischen den Schuhen.)

#### `verschmelzungen-5` › 4
Cümle: Er legt das Buch ___ Bett.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: aufs. auf das → aufs.
  - Yeni: Doğru cevap: aufs. “legen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. das Bett nötr → auf das Bett = aufs Bett. “auf dem” Dativ (konum) olurdu.

#### `verschmelzungen-5` › 5
Cümle: Die Tassen stehen ___ Schrank.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: im. in dem → im.
  - Yeni: Doğru cevap: im. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Schrank maskulin → in dem Schrank = im Schrank. “ins” = in das (Akkusativ) olurdu.

#### `verschmelzungen-5` › 6
Cümle: Die Lampe hängt ___ Decke.

Gerekçe: İpucu etiketi '[an dem]' yazıyordu; oysa Decke feminin ve doğru cevap 'an der'. Etiket düzeltildi, açıklamaya fiil (konum) ve birleşme kuralı eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: an der. die Decke → an der Decke.
  - Yeni: Doğru cevap: an der. “hängen (hängt)” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. die Decke feminin → an der Decke. Feminin Dativ artikeli “der” ile birleşme yapılmaz; “am” sadece an dem, “ans” sadece an das demektir.
- word
  - Eski: an dem
  - Yeni: an der

#### `verschmelzungen-5` › 7
Cümle: Die Zeitung liegt ___ Tisch.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: auf dem. Wo? → Dativ.
  - Yeni: Doğru cevap: auf dem. “liegen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Tisch maskulin → auf dem Tisch. “auf den” ve “aufs” (= auf das) Akkusativ biçimleridir.

#### `verschmelzungen-5` › 8
Cümle: Hans bringt den Computer ___ Zimmer.

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: ins. in das Zimmer → ins Zimmer.
  - Yeni: Doğru cevap: ins. “bringen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. das Zimmer nötr → in das Zimmer = ins Zimmer. “im” (= in dem) konum bildirirdi.

#### `saetze-bilden-9` › 2
Cümle: Bilde den Satz: die Zeitung / auf dem Tisch / liegen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Zeitung liegt auf dem Tisch.. Wo? → Dativ.
  - Yeni: Doğru cevap: Die Zeitung liegt auf dem Tisch.. “liegen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Tisch → auf dem Tisch. Çekimli fiil 2. sırada: Die Zeitung | liegt | auf dem Tisch.
- Kabul edilen cevaplar
  - Eski: `die zeitung liegt auf dem tisch`
  - Yeni: `die zeitung liegt auf dem tisch` / `auf dem tisch liegt die zeitung`

#### `saetze-bilden-9` › 3
Cümle: Bilde den Satz: ich / die Zeitung / auf den Tisch / legen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich lege die Zeitung auf den Tisch.. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: Ich lege die Zeitung auf den Tisch.. “legen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. der Tisch → auf den Tisch.
- Kabul edilen cevaplar
  - Eski: `ich lege die zeitung auf den tisch`
  - Yeni: `ich lege die zeitung auf den tisch` / `auf den tisch lege ich die zeitung`

#### `saetze-bilden-9` › 5
Cümle: Bilde den Satz: wir / die Flaschen / in den Keller / stellen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir stellen die Flaschen in den Keller.. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: Wir stellen die Flaschen in den Keller.. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. der Keller → in den Keller.
- Kabul edilen cevaplar
  - Eski: `wir stellen die flaschen in den keller`
  - Yeni: `wir stellen die flaschen in den keller` / `in den keller stellen wir die flaschen`

#### `saetze-bilden-9` › 6
Cümle: Bilde den Satz: der Stuhl / neben der Tür / stehen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Stuhl steht neben der Tür.. Wo? → Dativ.
  - Yeni: Doğru cevap: Der Stuhl steht neben der Tür.. “stehen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. die Tür → neben der Tür.
- Kabul edilen cevaplar
  - Eski: `der stuhl steht neben der tür` / `der stuhl steht neben der tuer`
  - Yeni: `der stuhl steht neben der tür` / `der stuhl steht neben der tuer` / `neben der tür steht der stuhl`

#### `saetze-bilden-9` › 7
Cümle: Bilde den Satz: ich / den Stuhl / neben die Tür / stellen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich stelle den Stuhl neben die Tür.. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: Ich stelle den Stuhl neben die Tür.. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. die Tür → neben die Tür.
- Kabul edilen cevaplar
  - Eski: `ich stelle den stuhl neben die tür` / `ich stelle den stuhl neben die tuer`
  - Yeni: `ich stelle den stuhl neben die tür` / `ich stelle den stuhl neben die tuer` / `neben die tür stelle ich den stuhl`

#### `saetze-bilden-9` › 8
Cümle: Bilde den Satz: die Katze / unter dem Tisch / schlafen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Katze schläft unter dem Tisch.. Wo? → Dativ.
  - Yeni: Doğru cevap: Die Katze schläft unter dem Tisch.. “schlafen” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. der Tisch → unter dem Tisch. schlafen düzensizdir: sie schläft.
- Kabul edilen cevaplar
  - Eski: `die katze schläft unter dem tisch` / `die katze schlaeft unter dem tisch`
  - Yeni: `die katze schläft unter dem tisch` / `die katze schlaeft unter dem tisch` / `unter dem tisch schläft die katze`

#### `saetze-bilden-9` › 9
Cümle: Bilde den Satz: die Katze / sich / unter den Tisch / setzen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Katze setzt sich unter den Tisch.. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: Die Katze setzt sich unter den Tisch.. “sich setzen” bir yere oturmaya geçmektir (hareket) → Wohin? → Akkusativ: unter den Tisch. Dönüşlü zamir sich çekimli fiilden hemen sonra gelir.
- Kabul edilen cevaplar
  - Eski: `die katze setzt sich unter den tisch`
  - Yeni: `die katze setzt sich unter den tisch` / `unter den tisch setzt sich die katze`

#### `challenge-10` › 8
Cümle: Bilde den Satz: die Lampe / an der Decke / hängen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Lampe hängt an der Decke.. Wo? → Dativ.
  - Yeni: Doğru cevap: Die Lampe hängt an der Decke.. “hängen (hängt)” bir yerde bulunmayı (konum) anlatır → Wo? → Dativ. die Decke feminin → an der Decke.
- Kabul edilen cevaplar
  - Eski: `die lampe hängt an der decke` / `die lampe haengt an der decke`
  - Yeni: `die lampe hängt an der decke` / `die lampe haengt an der decke` / `an der decke hängt die lampe`

#### `challenge-10` › 9
Cümle: Bilde den Satz: Georg / die Lampe / in die Ecke / stellen

Gerekçe: Açıklama yalnızca 'Wo? → Dativ' / 'Wohin? → Akkusativ' diyordu; soruyu belirleyen fiil (konum mu, yerleştirme/yön mü) ve ismin cinsiyeti açıklanmamıştı. Cümleye özgü gerekçe eklendi. Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Açıklama (TR)
  - Eski: Doğru cevap: Georg stellt die Lampe in die Ecke.. Wohin? → Akkusativ.
  - Yeni: Doğru cevap: Georg stellt die Lampe in die Ecke.. “stellen” bir şeyi/kişiyi bir yere yöneltir (yerleştirme/hareket) → Wohin? → Akkusativ. die Ecke feminin → in die Ecke.
- Kabul edilen cevaplar
  - Eski: `georg stellt die lampe in die ecke`
  - Yeni: `georg stellt die lampe in die ecke` / `in die ecke stellt georg die lampe`

#### `saetze-bilden-9` › 0
Cümle: Bilde den Satz: das Bild / an der Wand / hängen

Gerekçe: Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `das bild hängt an der wand` / `das bild haengt an der wand`
  - Yeni: `das bild hängt an der wand` / `das bild haengt an der wand` / `an der wand hängt das bild`

#### `saetze-bilden-9` › 1
Cümle: Bilde den Satz: ich / das Bild / an die Wand / hängen

Gerekçe: Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `ich hänge das bild an die wand` / `ich haenge das bild an die wand`
  - Yeni: `ich hänge das bild an die wand` / `ich haenge das bild an die wand` / `an die wand hänge ich das bild`

#### `saetze-bilden-9` › 4
Cümle: Bilde den Satz: die Flaschen / im Keller / stehen

Gerekçe: Yer bildiren grup başa alınabilir (çekimli fiil yine 2. sırada); bu doğru sıralama da kabul listesine eklendi.

- Kabul edilen cevaplar
  - Eski: `die flaschen stehen im keller`
  - Yeni: `die flaschen stehen im keller` / `im keller stehen die flaschen`

### `data/b1/pronominaladverbien.json`

#### `da-formen-1` › 5
Cümle: Das hängt von der Zeit ab. Das hängt ___ ab.

Gerekçe: Açıklama 'der Zeit ab' diye bozuk alıntı yapıyordu (ab ayrılan ön ek, ismin parçası değil).

- Açıklama (TR)
  - Eski: abhängen von kalıbında von korunur. der Zeit ab bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + von → davon kullanılır. Doğru cevap: davon
  - Yeni: abhängen von kalıbında von korunur. von der Zeit bir kişi değil, bir şeydir; aynı edat grubunu tekrar etmek yerine da- + von → davon kullanılır. Ayrılan ön ek ab yine sonda kalır: Das hängt davon ab. Doğru cevap: davon

#### `wo-fragen-2` › 3
Cümle: ___ schreibst du? – Mit einem Bleistift.

Gerekçe: Açıklama 'mit ünlüyle başladığında araya r girer' diyordu; mit ünsüzle başlar, araya r girmez.

- Açıklama (TR)
  - Eski: schreiben mit kalıbının edatı mit. Burada bir kişi değil, einem Bleistift soruluyor; bu yüzden wo- + mit → womit. mit ünlüyle başladığında araya r girer. Doğru cevap: Womit
  - Yeni: schreiben mit kalıbının edatı mit. Burada bir kişi değil, bir şey soruluyor: einem Bleistift (mit einem Bleistift); bu yüzden wo- + mit → womit. mit ünsüzle başladığı için araya r girmez (karşılaştır: wo + auf → worauf). Doğru cevap: Womit

#### `wo-fragen-2` › 4
Cümle: ___ interessierst du dich? – Für Geschichte.

Gerekçe: Açıklama 'für ünlüyle başladığında araya r girer' diyordu; für ünsüzle başlar, araya r girmez.

- Açıklama (TR)
  - Eski: sich interessieren für kalıbının edatı für. Burada bir kişi değil, Geschichte soruluyor; bu yüzden wo- + für → wofür. für ünlüyle başladığında araya r girer. Doğru cevap: Wofür
  - Yeni: sich interessieren für kalıbının edatı für. Burada bir kişi değil, bir şey soruluyor: Geschichte; bu yüzden wo- + für → wofür. für ünsüzle başladığı için araya r girmez (karşılaştır: wo + auf → worauf). Doğru cevap: Wofür

#### `wo-fragen-2` › 5
Cümle: ___ hängt das ab? – Vom Wetter.

Gerekçe: Açıklama 'von ünlüyle başladığında araya r girer' diyordu; von ünsüzle başlar, araya r girmez. Ayrıca 'Vom Wetter soruluyor' alıntısı düzeltildi.

- Açıklama (TR)
  - Eski: abhängen von kalıbının edatı von. Burada bir kişi değil, Vom Wetter soruluyor; bu yüzden wo- + von → wovon. von ünlüyle başladığında araya r girer. Doğru cevap: Wovon
  - Yeni: abhängen von kalıbının edatı von. Burada bir kişi değil, bir şey soruluyor: das Wetter (vom Wetter); bu yüzden wo- + von → wovon. von ünsüzle başladığı için araya r girmez (karşılaştır: wo + auf → worauf). Doğru cevap: Wovon

#### `wo-fragen-2` › 6
Cümle: ___ beginnst du? – Mit der ersten Aufgabe.

Gerekçe: Açıklama 'mit ünlüyle başladığında araya r girer' diyordu; mit ünsüzle başlar, araya r girmez.

- Açıklama (TR)
  - Eski: beginnen mit kalıbının edatı mit. Burada bir kişi değil, der ersten Aufgabe soruluyor; bu yüzden wo- + mit → womit. mit ünlüyle başladığında araya r girer. Doğru cevap: Womit
  - Yeni: beginnen mit kalıbının edatı mit. Burada bir kişi değil, bir şey soruluyor: der ersten Aufgabe (mit der ersten Aufgabe); bu yüzden wo- + mit → womit. mit ünsüzle başladığı için araya r girmez (karşılaştır: wo + auf → worauf). Doğru cevap: Womit

#### `wo-fragen-2` › 7
Cümle: ___ träumst du? – Von einem Urlaub.

Gerekçe: Açıklama 'von ünlüyle başladığında araya r girer' diyordu; von ünsüzle başlar, araya r girmez.

- Açıklama (TR)
  - Eski: träumen von kalıbının edatı von. Burada bir kişi değil, einem Urlaub soruluyor; bu yüzden wo- + von → wovon. von ünlüyle başladığında araya r girer. Doğru cevap: Wovon
  - Yeni: träumen von kalıbının edatı von. Burada bir kişi değil, bir şey soruluyor: einem Urlaub (von einem Urlaub); bu yüzden wo- + von → wovon. von ünsüzle başladığı için araya r girmez (karşılaştır: wo + auf → worauf). Doğru cevap: Wovon

#### `personen-sachen-4` › 7
Cümle: Sie erzählt ___. (von der Reise)

Gerekçe: Açıklamada fiil kalıbı eksikti ('… von kalıbında').

- Açıklama (TR)
  - Eski: … von kalıbında von korunur. der Reise bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + von → davon kullanılır. Doğru cevap: davon
  - Yeni: erzählen von kalıbında von korunur. die Reise bir kişi değil, bir şeydir; aynı edat grubunu tekrar etmek yerine da- + von → davon kullanılır. Karşılaştır: von ihrer Schwester (kişi) → von ihr. Doğru cevap: davon

#### `feste-praepositionen-5` › 4
Cümle: Der Vorschlag ist gut. Ich bin ___. (für einen Vorschlag sein)

Gerekçe: Açıklama 'einen Vorschlag sein) bir kişi değildir' diye bozuk alıntı içeriyordu.

- Açıklama (TR)
  - Eski: für/gegen etwas sein kalıbında für korunur. einen Vorschlag sein) bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + für → dafür kullanılır. Doğru cevap: dafür
  - Yeni: für/gegen etwas sein kalıbında für korunur (Der Vorschlag ist gut → onu destekliyoruz: für). der Vorschlag bir kişi değil, bir şeydir; aynı edat grubunu tekrar etmek yerine da- + für → dafür kullanılır. Doğru cevap: dafür

#### `feste-praepositionen-5` › 5
Cümle: Der Vorschlag gefällt mir nicht. Ich bin ___. (gegen einen Vorschlag sein)

Gerekçe: Açıklama 'einen Vorschlag sein) bir kişi değildir' diye bozuk alıntı içeriyordu.

- Açıklama (TR)
  - Eski: für/gegen etwas sein kalıbında gegen korunur. einen Vorschlag sein) bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + gegen → dagegen kullanılır. Doğru cevap: dagegen
  - Yeni: für/gegen etwas sein kalıbında gegen korunur (Der Vorschlag gefällt mir nicht → karşıyız: gegen). der Vorschlag bir kişi değil, bir şeydir; aynı edat grubunu tekrar etmek yerine da- + gegen → dagegen kullanılır. Doğru cevap: dagegen

#### `feste-praepositionen-5` › 7
Cümle: Der Erfolg freut mich. Ich bin ___ stolz. (stolz auf)

Gerekçe: Açıklama yanlış kalıptan (sich freuen auf) bahsediyordu; cümledeki kalıp stolz sein auf.

- Açıklama (TR)
  - Eski: sich freuen auf kalıbında auf korunur. Sorudaki şey/durum bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + auf → darauf kullanılır. Doğru cevap: darauf
  - Yeni: stolz sein auf kalıbında auf korunur. der Erfolg bir kişi değil, bir şeydir; aynı edat grubunu tekrar etmek yerine da- + auf → darauf kullanılır. auf ünlüyle başladığı için araya r girer. Doğru cevap: darauf

#### `frage-antwort-6` › 0
Cümle: Worauf wartest du? – Ich warte ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: warten auf kalıbında auf korunur. Ich warte ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + auf → darauf kullanılır. Doğru cevap: darauf
  - Yeni: Soru Worauf ile bir şey hakkında soruluyor (kişi değil). warten auf kalıbında auf korunur; cevapta aynı şeyi da- + auf → darauf ile anlatırız: Ich warte darauf. auf ünlüyle başladığı için araya r girer. Doğru cevap: darauf
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 1
Cümle: Worüber sprecht ihr? – Wir sprechen ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: sprechen über kalıbında über korunur. Wir sprechen ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + über → darüber kullanılır. Doğru cevap: darüber
  - Yeni: Soru Worüber ile bir şey hakkında soruluyor (kişi değil). sprechen über kalıbında über korunur; cevapta aynı şeyi da- + über → darüber ile anlatırız: Wir sprechen darüber. über ünlüyle başladığı için araya r girer. Doğru cevap: darüber
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 2
Cümle: Woran denkst du? – Ich denke ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: denken an kalıbında an korunur. Ich denke ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + an → daran kullanılır. Doğru cevap: daran
  - Yeni: Soru Woran ile bir şey hakkında soruluyor (kişi değil). denken an kalıbında an korunur; cevapta aynı şeyi da- + an → daran ile anlatırız: Ich denke daran. an ünlüyle başladığı için araya r girer. Doğru cevap: daran
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 3
Cümle: Womit arbeitest du? – Ich arbeite ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: arbeiten mit kalıbında mit korunur. Ich arbeite ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + mit → damit kullanılır. Doğru cevap: damit
  - Yeni: Soru Womit ile bir şey hakkında soruluyor (kişi değil). arbeiten mit kalıbında mit korunur; cevapta aynı şeyi da- + mit → damit ile anlatırız: Ich arbeite damit. mit ünsüzle başladığı için araya r girmez. Doğru cevap: damit
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 4
Cümle: Wofür interessierst du dich? – Ich interessiere mich ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: sich interessieren für kalıbında für korunur. Ich interessiere mich ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + für → dafür kullanılır. Doğru cevap: dafür
  - Yeni: Soru Wofür ile bir şey hakkında soruluyor (kişi değil). sich interessieren für kalıbında für korunur; cevapta aynı şeyi da- + für → dafür ile anlatırız: Ich interessiere mich dafür. für ünsüzle başladığı için araya r girmez. Doğru cevap: dafür
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 5
Cümle: Wovon träumst du? – Ich träume ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: träumen von kalıbında von korunur. Ich träume ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + von → davon kullanılır. Doğru cevap: davon
  - Yeni: Soru Wovon ile bir şey hakkında soruluyor (kişi değil). träumen von kalıbında von korunur; cevapta aynı şeyi da- + von → davon ile anlatırız: Ich träume davon. von ünsüzle başladığı için araya r girmez. Doğru cevap: davon
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 6
Cümle: Wogegen protestiert ihr? – Wir protestieren ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: protestieren gegen kalıbında gegen korunur. Wir protestieren ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + gegen → dagegen kullanılır. Doğru cevap: dagegen
  - Yeni: Soru Wogegen ile bir şey hakkında soruluyor (kişi değil). protestieren gegen kalıbında gegen korunur; cevapta aynı şeyi da- + gegen → dagegen ile anlatırız: Wir protestieren dagegen. gegen ünsüzle başladığı için araya r girmez. Doğru cevap: dagegen
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 7
Cümle: Woran nimmst du teil? – Ich nehme ___ teil.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: teilnehmen an kalıbında an korunur. Ich nehme ___ teil bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + an → daran kullanılır. Doğru cevap: daran
  - Yeni: Soru Woran ile bir şey hakkında soruluyor (kişi değil). teilnehmen an kalıbında an korunur; cevapta aynı şeyi da- + an → daran ile anlatırız: Ich nehme daran teil. an ünlüyle başladığı için araya r girer. Doğru cevap: daran
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 8
Cümle: Worüber freust du dich? – Ich freue mich ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: sich freuen über kalıbında über korunur. Ich freue mich ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + über → darüber kullanılır. Doğru cevap: darüber
  - Yeni: Soru Worüber ile bir şey hakkında soruluyor (kişi değil). sich freuen über kalıbında über korunur; cevapta aynı şeyi da- + über → darüber ile anlatırız: Ich freue mich darüber. über ünlüyle başladığı için araya r girer. Doğru cevap: darüber
- DE/EN açıklamaları da güncellendi.

#### `frage-antwort-6` › 9
Cümle: Woraus besteht es? – Es besteht ___.

Gerekçe: TR/DE/EN açıklama boşluklu cümleyi ('… ___') temsil edilen şey gibi alıntılıyordu; anlamsızdı.

- Açıklama (TR)
  - Eski: bestehen aus kalıbında aus korunur. Es besteht ___ bir kişi değildir; aynı edat grubunu tekrar etmek yerine da- + aus → daraus kullanılır. Doğru cevap: daraus
  - Yeni: Soru Woraus ile bir şey hakkında soruluyor (kişi değil). bestehen aus kalıbında aus korunur; cevapta aynı şeyi da- + aus → daraus ile anlatırız: Es besteht daraus. aus ünlüyle başladığı için araya r girer. Doğru cevap: daraus
- DE/EN açıklamaları da güncellendi.

#### `dass-saetze-7` › 4
Cümle: Die Idee ist gut. Ich bin ___, dass wir früher anfangen.

Gerekçe: Bağlam yoktu: 'Ich bin dagegen, dass wir früher anfangen' da tamamen doğru; iki şık doğruydu. Anlamı belirleyen bağlam cümlesi eklendi.

- Açıklama (TR)
  - Eski: für/gegen etwas sein kalıbındaki edat für olduğu için dafür gerekir. Burada dafür, ardından gelen “dass wir früher anfangen” grubundaki olaya işaret eder; dass grubunu da- ifadesinden virgülle ayırırız. Doğru cevap: dafür
  - Yeni: für/gegen etwas sein kalıbında fikri destekliyorsak für kullanılır. İlk cümle “Die Idee ist gut” olduğu için destek var: dafür. Burada dafür, ardından gelen “dass wir früher anfangen” grubundaki olaya işaret eder; dass grubunu da- ifadesinden virgülle ayırırız. Karşılaştır: Die Idee ist schlecht. Ich bin dagegen, … Doğru cevap: dafür
- Cümle
  - Eski: Ich bin ___, dass wir früher anfangen.
  - Yeni: Die Idee ist gut. Ich bin ___, dass wir früher anfangen.

#### `dass-saetze-7` › 9
Cümle: Der Kurs ist uns wichtig. Wir sind ___, dass der Kurs gestrichen wird.

Gerekçe: Bağlam yoktu: 'Wir sind dafür, dass der Kurs gestrichen wird' da doğru; iki şık doğruydu. Anlamı belirleyen bağlam cümlesi eklendi.

- Açıklama (TR)
  - Eski: für/gegen etwas sein kalıbındaki edat gegen olduğu için dagegen gerekir. Burada dagegen, ardından gelen “dass der Kurs gestrichen wird” grubundaki olaya işaret eder; dass grubunu da- ifadesinden virgülle ayırırız. Doğru cevap: dagegen
  - Yeni: Kurs bizim için önemli (Der Kurs ist uns wichtig), bu yüzden kaldırılmasına karşıyız: gegen etwas sein → dagegen. Burada dagegen, ardından gelen “dass der Kurs gestrichen wird” grubundaki olaya işaret eder; dass grubunu da- ifadesinden virgülle ayırırız. Karşılaştır: Wir sind dafür, … (destekliyoruz). Doğru cevap: dagegen
- Cümle
  - Eski: Wir sind ___, dass der Kurs gestrichen wird.
  - Yeni: Der Kurs ist uns wichtig. Wir sind ___, dass der Kurs gestrichen wird.

#### `zu-gruppen-8` › 0
Cümle: Du kommst nächste Woche. Ich freue mich ___, dich zu sehen.

Gerekçe: Bağlam yoktu: 'Ich freue mich darüber, dich zu sehen' (şu an görüşürken) de doğru; darauf/darüber ikisi de mümkündü. Geleceği gösteren bağlam eklendi.

- Açıklama (TR)
  - Eski: sich freuen auf kalıbındaki edat auf olduğu için darauf gerekir. Burada darauf, ardından gelen “dich zu sehen” grubundaki olaya işaret eder; zu grubunu da- ifadesinden virgülle ayırırız. Doğru cevap: darauf
  - Yeni: Görüşme gelecekte (Du kommst nächste Woche); gelecekteki bir şeye sevinmek sich freuen auf ile anlatılır → darauf. Burada darauf, ardından gelen “dich zu sehen” grubuna işaret eder; zu grubunu virgülle ayırırız. Karşılaştır: olmuş/şu anki bir şeye sevinmek sich freuen über → darüber. Doğru cevap: darauf
- Cümle
  - Eski: Ich freue mich ___, dich zu sehen.
  - Yeni: Du kommst nächste Woche. Ich freue mich ___, dich zu sehen.

#### `zu-gruppen-8` › 9
Cümle: Wir rechnen ___, länger warten zu müssen.

Gerekçe: Açıklama yanlış kalıp (warten auf … edat mit) diyordu; cümledeki kalıp rechnen mit.

- Açıklama (TR)
  - Eski: warten auf kalıbındaki edat mit olduğu için damit gerekir. Burada damit, ardından gelen “länger warten zu müssen” grubundaki olaya işaret eder; zu grubunu da- ifadesinden virgülle ayırırız. Doğru cevap: damit
  - Yeni: rechnen mit kalıbındaki edat mit olduğu için damit gerekir. Burada damit, ardından gelen “länger warten zu müssen” grubundaki olaya işaret eder; zu grubunu da- ifadesinden virgülle ayırırız. mit ünsüzle başladığı için araya r girmez. Doğru cevap: damit

#### `fehler-korrigieren-9` › 7
Cümle: Worauf wartest du? (Bir kişi soruluyor.) → Worauf yerine: ___

Gerekçe: TR açıklamada Almanca 'die Person' alıntısı vardı ('Burada die Person bir kişidir'); anlaşılır Türkçe yapıldı.

- Açıklama (TR)
  - Eski: Burada die Person bir kişidir; da-/wo- ile bir şey sorulmuyor veya temsil edilmiyor. auf bu kullanımda Akkusativ ister: kişi/soru zamirinin doğru biçimi wen, tam ifade Auf wen. Doğru cevap: Auf wen
  - Yeni: Parantezde bir kişinin sorulduğu söyleniyor. wo- biçimleri (Worauf) yalnız şeyler için kullanılır; kişi sorulurken edat + soru zamiri gelir. auf burada Akkusativ ister: wen → Auf wen. Doğru cevap: Auf wen

#### `fehler-korrigieren-9` › 8
Cümle: Womit sprichst du? (Bir kişi soruluyor.) → Womit yerine: ___

Gerekçe: TR açıklamada Almanca 'die Person' alıntısı vardı ('Burada die Person bir kişidir'); anlaşılır Türkçe yapıldı.

- Açıklama (TR)
  - Eski: Burada die Person bir kişidir; da-/wo- ile bir şey sorulmuyor veya temsil edilmiyor. mit bu kullanımda Dativ ister: kişi/soru zamirinin doğru biçimi wem, tam ifade Mit wem. Doğru cevap: Mit wem
  - Yeni: Parantezde bir kişinin sorulduğu söyleniyor. wo- biçimleri (Womit) yalnız şeyler için kullanılır; kişi sorulurken edat + soru zamiri gelir. mit burada Dativ ister: wem → Mit wem. Doğru cevap: Mit wem

#### `schreiben-mix-10` › 9
Cümle: [Mit welchem Gegenstand] schreibst du?

Gerekçe: Açıklama 'mit ünlüyle başladığında araya r girer' diyordu; mit ünsüzle başlar.

- Açıklama (TR)
  - Eski: schreiben mit kalıbının edatı mit. Burada bir kişi değil, Mit welchem Gegenstand soruluyor; bu yüzden wo- + mit → womit. mit ünlüyle başladığında araya r girer. Doğru cevap: Womit schreibst du?
  - Yeni: schreiben mit kalıbının edatı mit. Burada bir kişi değil, bir şey (Mit welchem Gegenstand) soruluyor; bu yüzden wo- + mit → womit. mit ünsüzle başladığı için araya r girmez. Doğru cevap: Womit schreibst du?

### `data/b1/relativsaetze.json`

#### `grundlagen-wortstellung-1` › 8
Cümle: Verbinde: „Der Zug fährt nach Hamburg. Der Zug steht auf Gleis 4.“

Gerekçe: İki cümlede de özne tam isim (der Zug); hangisi Relativsatz yapılırsa yapılsın geçerli. 'Der Zug, der auf Gleis 4 steht, fährt nach Hamburg.' doğru olduğu hâlde reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `der zug der nach hamburg fährt steht auf gleis 4` / `der zug, der nach hamburg fährt, steht auf gleis 4` / `der zug der nach hamburg faehrt steht auf gleis 4`
  - Yeni: `der zug der nach hamburg fährt steht auf gleis 4` / `der zug, der nach hamburg fährt, steht auf gleis 4` / `der zug der nach hamburg faehrt steht auf gleis 4` / `der zug, der auf gleis 4 steht, fährt nach hamburg`

#### `grundlagen-wortstellung-1` › 9
Cümle: Verbinde: „Das Buch ist ausverkauft. Ich wollte das Buch bestellen.“

Gerekçe: İkinci cümlede de tam isim (das Buch) var; ilk cümleyi Relativsatz yapan varyantlar (Nominativ 'das', fiil sonda) dilbilgisel olarak doğru ama reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `das buch das ich bestellen wollte ist ausverkauft` / `das buch, das ich bestellen wollte, ist ausverkauft`
  - Yeni: `das buch das ich bestellen wollte ist ausverkauft` / `das buch, das ich bestellen wollte, ist ausverkauft` / `das buch, das ausverkauft ist, wollte ich bestellen` / `ich wollte das buch bestellen, das ausverkauft ist`

#### `kasus-mix-6` › 6
Cümle: Die Teilnehmer, ___ die Prüfung bestanden haben, bekommen ein Zertifikat.

Gerekçe: Açıklama fiil grubunu 'haben bestanden' diye yanlış sırayla alıntılıyordu; Relativsatz'ta fiil grubu 'bestanden haben' sırasıyla sondadır.

- Açıklama (TR)
  - Eski: Doğru cevap: die. Bezugswort “die Teilnehmer” olduğu için Relativpronomen çoğul biçimden gelir; fakat Kasus ana cümleden değil, Relativsatz içindeki görevden belirlenir. Burada Teilnehmer 'haben bestanden' fiil grubunun öznesidir. Bu nedenle Nominativ gerekir ve doğru biçim “die” olur. Diğer seçenekler (“denen”, “deren”) ya yanlış Kasus'u ya da yanlış cinsiyet/çoğul biçimini gösterir.
  - Yeni: Doğru cevap: die. Bezugswort “die Teilnehmer” olduğu için Relativpronomen çoğul biçimden gelir; fakat Kasus ana cümleden değil, Relativsatz içindeki görevden belirlenir. Burada Teilnehmer 'bestanden haben' fiil grubunun öznesidir (sınavı onlar geçti; die Prüfung nesnedir). Bu nedenle Nominativ gerekir ve doğru biçim “die” olur. Diğer seçenekler (“denen”, “deren”) ya yanlış Kasus'u ya da yanlış cinsiyet/çoğul biçimini gösterir.

#### `wo-12` › 8
Cümle: Ergänze: Das ist die Bibliothek, ___ ich normalerweise lerne.

Gerekçe: Boşluğa 'in der' (die Bibliothek, Wo? → in + Dativ) da tamamen doğru; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `wo`
  - Yeni: `wo` / `in der`

#### `wo-12` › 9
Cümle: Ergänze: Der Laden, ___ ich immer einkaufe, hat heute geschlossen.

Gerekçe: Boşluğa 'in dem' (der Laden, Wo? → in + Dativ) da tamamen doğru; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `wo`
  - Yeni: `wo` / `in dem`

#### `wohin-woher-13` › 8
Cümle: Ergänze: Das ist der Markt, ___ wir die alten Bücher bringen.

Gerekçe: 'etwas auf den Markt bringen' (Wohin? → auf + Akkusativ, der Markt) da doğru; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `wohin`
  - Yeni: `wohin` / `auf den`

#### `wohin-woher-13` › 9
Cümle: Ergänze: Leipzig ist die Stadt, ___ unser Lehrer kommt.

Gerekçe: 'aus der Stadt kommen' (aus + Dativ, die Stadt) da doğru; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `woher`
  - Yeni: `woher` / `aus der`

#### `saetze-verbinden-16` › 7
Cümle: Verbinde: „Das Café ist geschlossen. Wir treffen uns dort immer.“

Gerekçe: 'in dem' (Wo? → in + Dativ, das Café) wo'nun standart eşdeğeri; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `das café, wo wir uns immer treffen, ist geschlossen`
  - Yeni: `das café, wo wir uns immer treffen, ist geschlossen` / `das café, in dem wir uns immer treffen, ist geschlossen`

#### `saetze-verbinden-16` › 9
Cümle: Verbinde: „Das ist die Stadt. Meine Mutter kommt aus dieser Stadt.“

Gerekçe: Verilen cümle 'aus dieser Stadt' içeriyor; 'aus der' (aus + Dativ, feminin) en doğrudan ve standart birleştirme, ama reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `das ist die stadt, woher meine mutter kommt`
  - Yeni: `das ist die stadt, woher meine mutter kommt` / `das ist die stadt, aus der meine mutter kommt`

#### `master-18` › 9
Cümle: Verbinde: „Das ist das Museum. Wir gehen morgen in das Museum.“

Gerekçe: Yön bildiren yerlerde 'wohin' de Relativwort olarak doğru (Übung 13'te öğretiliyor); reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `das ist das museum in das wir morgen gehen` / `das ist das museum, in das wir morgen gehen`
  - Yeni: `das ist das museum in das wir morgen gehen` / `das ist das museum, in das wir morgen gehen` / `das ist das museum, wohin wir morgen gehen`

### `data/b1/satzstellung-b1.json`

#### `schreiben-mix-10` › 7
Cümle: Das Formular | muss | heute | ausgefüllt | werden.

Gerekçe: Açıklama sağ parantezi yalnız 'werden' olarak gösteriyordu; sonda kalan grup 'ausgefüllt werden' (Partizip + mastar).

- Açıklama (TR)
  - Eski: “Das Formular” ilk öğedir; çekimli muss ikinci öğeye gelir. werden ise sağ parantezi kapatan fiil parçasıdır ve sonda kalır. Doğru cevap: Das Formular muss heute ausgefüllt werden.
  - Yeni: “Das Formular” ilk öğedir; çekimli muss ikinci öğeye gelir. Sağ parantezi edilgen fiil grubu ausgefüllt werden kapatır: önce Partizip ausgefüllt, en sonda mastar werden. Doğru cevap: Das Formular muss heute ausgefüllt werden.

#### `schreiben-mix-10` › 9
Cümle: Ich gebe | es | ihr.

Gerekçe: Açıklamadaki 'Özne ilk öğe değilse…' şablon kuyruğu bu soruyla ilgisizdi (özne zaten ilk öğe); sorunun asıl kuralı olan es + ihr zamir sırası açıklanmıyordu.

- Açıklama (TR)
  - Eski: “Ich” ilk öğedir; çekimli gebe ikinci öğeye gelir. Özne ilk öğe değilse fiilden sonraki alana yerleşir. Doğru cevap: Ich gebe es ihr.
  - Yeni: “Ich” ilk öğedir; çekimli gebe ikinci öğeye gelir. Ardından iki vurgusuz kişi zamiri gelir: önce Akkusativ es (verilen şey), sonra Dativ ihr (alıcı). Karşılaştır: Ich gebe ihr das Buch (isim nesne → Dativ önce). Doğru cevap: Ich gebe es ihr.

### `data/b2/nominalisierung.json`

#### `gross-klein-verben-1` › 1
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Schwimmen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Schwimmen im See macht mir Spaß.
  - Yeni: Doğru cevap: Das Schwimmen im See macht mir Spaß. Artikel das, fiili nötr bir isme çevirir: das Schwimmen (yüzme). İsim olduğu için büyük harfle yazılır; zu schwimmen ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Ich möchte im See schwimmen (fiil → küçük harf).

#### `gross-klein-verben-1` › 2
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Fotografieren bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Fotografieren ist hier verboten.
  - Yeni: Doğru cevap: Das Fotografieren ist hier verboten. Artikel das, fiili nötr bir isme çevirir: das Fotografieren (fotoğraf çekme). İsim olduğu için büyük harfle yazılır; zu fotografieren ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Hier darf man nicht fotografieren (fiil → küçük harf).

#### `gross-klein-verben-1` › 6
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Warten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Warten dauert heute sehr lange.
  - Yeni: Doğru cevap: Das Warten dauert heute sehr lange. Artikel das, fiili nötr bir isme çevirir: das Warten (bekleme). İsim olduğu için büyük harfle yazılır; zu warten ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Wir müssen lange warten (fiil → küçük harf).

#### `das-infinitiv-3` › 0
Cümle: Welche Form passt? „Das ___ am Morgen hilft mir.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Laufen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Laufen
  - Yeni: Doğru cevap: Laufen. Artikel das, fiili nötr bir isme çevirir: das Laufen (koşma). İsim olduğu için büyük harfle yazılır; zu laufen ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Ich gehe morgens gern laufen (fiil → küçük harf).

#### `das-infinitiv-3` › 2
Cümle: Welche Form passt? „Das ___ fremder Gebäude ist verboten.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Betreten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Betreten
  - Yeni: Doğru cevap: Betreten. Artikel das, fiili nötr bir isme çevirir: das Betreten (girme). İsim olduğu için büyük harfle yazılır; zu betreten ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: fremde Gebäude betreten → das Betreten fremder Gebäude. Karşılaştır: Man darf das Gebäude nicht betreten (fiil → küçük harf).

#### `das-infinitiv-3` › 4
Cümle: Welche Form passt? „Das ___ neuer Wörter braucht Zeit.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Lernen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Lernen
  - Yeni: Doğru cevap: Lernen. Artikel das, fiili nötr bir isme çevirir: das Lernen (öğrenme). İsim olduğu için büyük harfle yazılır; zu lernen ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: neue Wörter lernen → das Lernen neuer Wörter. Karşılaştır: Ich muss neue Wörter lernen (fiil → küçük harf).

#### `das-infinitiv-3` › 6
Cümle: Welche Form passt? „Das ___ macht ihn nervös.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Warten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Warten
  - Yeni: Doğru cevap: Warten. Artikel das, fiili nötr bir isme çevirir: das Warten (bekleme). İsim olduğu için büyük harfle yazılır; zu warten ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Wir müssen lange warten (fiil → küçük harf).

#### `das-infinitiv-3` › 8
Cümle: Welche Form passt? „Das ___ vor Publikum fällt ihr schwer.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Sprechen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Sprechen
  - Yeni: Doğru cevap: Sprechen. Artikel das, fiili nötr bir isme çevirir: das Sprechen (konuşma). İsim olduğu için büyük harfle yazılır; zu sprechen ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Sie muss vor Publikum sprechen (fiil → küçük harf).

#### `nominalisierte-infinitive-schreiben-4` › 3
Cümle: Ergänze: „das ___ im Chor“ (singen)

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: das burada das biçimidir ve ardından gelen Singen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: das Singen im Chor
  - Yeni: Doğru cevap: das Singen im Chor. Artikel das, fiili nötr bir isme çevirir: das Singen (şarkı söyleme). İsim olduğu için büyük harfle yazılır; zu singen ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Sie singt gern (fiil → küçük harf).

#### `nominalisierte-infinitive-schreiben-4` › 4
Cümle: Ergänze: „das ___ der Brücke“ (betreten)

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: das burada das biçimidir ve ardından gelen Betreten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: das Betreten der Brücke
  - Yeni: Doğru cevap: das Betreten der Brücke. Artikel das, fiili nötr bir isme çevirir: das Betreten (girme). İsim olduğu için büyük harfle yazılır; zu betreten ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: die Brücke betreten → das Betreten der Brücke. Karşılaştır: Man darf das Gebäude nicht betreten (fiil → küçük harf).

#### `verb-nomen-wechsel-5` › 5
Cümle: Formuliere nominal: „Beim Fahren muss ich mich konzentrieren.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Fahren bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Fahren erfordert meine Konzentration.
  - Yeni: Doğru cevap: Das Fahren erfordert meine Konzentration. Artikel das, fiili nötr bir isme çevirir: das Fahren (araba sürme). İsim olduğu için büyük harfle yazılır; zu fahren ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Ich muss vorsichtig fahren (fiil → küçük harf).

#### `verb-nomen-wechsel-5` › 7
Cümle: Formuliere nominal: „Man darf die Brücke nicht betreten.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Betreten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Betreten der Brücke ist verboten.
  - Yeni: Doğru cevap: Das Betreten der Brücke ist verboten. Artikel das, fiili nötr bir isme çevirir: das Betreten (girme). İsim olduğu için büyük harfle yazılır; zu betreten ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: die Brücke betreten → das Betreten der Brücke. Karşılaştır: Man darf das Gebäude nicht betreten (fiil → küçük harf).

#### `verb-transformation-16` › 4
Cümle: Formuliere nominal: „Man darf die Brücke nicht betreten.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Betreten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Betreten der Brücke ist verboten.
  - Yeni: Doğru cevap: Das Betreten der Brücke ist verboten. Artikel das, fiili nötr bir isme çevirir: das Betreten (girme). İsim olduğu için büyük harfle yazılır; zu betreten ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: die Brücke betreten → das Betreten der Brücke. Karşılaştır: Man darf das Gebäude nicht betreten (fiil → küçük harf).

#### `verb-transformation-16` › 9
Cümle: Formuliere nominal: „Wir sprechen vor Publikum; das fällt uns schwer.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Sprechen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Sprechen vor Publikum fällt uns schwer.
  - Yeni: Doğru cevap: Das Sprechen vor Publikum fällt uns schwer. Artikel das, fiili nötr bir isme çevirir: das Sprechen (konuşma). İsim olduğu için büyük harfle yazılır; zu sprechen ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Sie muss vor Publikum sprechen (fiil → küçük harf).

#### `fehlerkorrektur-17` › 1
Cümle: Korrigiere: „Das singen macht ihr Spaß.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Singen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Singen macht ihr Spaß.
  - Yeni: Doğru cevap: Das Singen macht ihr Spaß. Artikel das, fiili nötr bir isme çevirir: das Singen (şarkı söyleme). İsim olduğu için büyük harfle yazılır; zu singen ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Sie singt gern (fiil → küçük harf).

#### `b2-kontext-18` › 1
Cümle: Ergänze: „Das ___ neuer Methoden kostet Zeit.“ (erlernen)

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Erlernen bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Erlernen neuer Methoden kostet Zeit.
  - Yeni: Doğru cevap: Das Erlernen neuer Methoden kostet Zeit. Artikel das, fiili nötr bir isme çevirir: das Erlernen (öğrenme). İsim olduğu için büyük harfle yazılır; zu erlernen ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: neue Methoden erlernen → das Erlernen neuer Methoden. Karşılaştır: Wir müssen neue Methoden erlernen (fiil → küçük harf).

#### `b2-mix-19` › 4
Cümle: Welche Form ist korrekt?

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Fotografieren bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Fotografieren ist hier verboten.
  - Yeni: Doğru cevap: Das Fotografieren ist hier verboten. Artikel das, fiili nötr bir isme çevirir: das Fotografieren (fotoğraf çekme). İsim olduğu için büyük harfle yazılır; zu fotografieren ise fiil biçimidir ve artikelle kullanılmaz. Karşılaştır: Hier darf man nicht fotografieren (fiil → küçük harf).

#### `master-20` › 4
Cümle: Formuliere nominal: „Man darf diesen Bereich nicht betreten.“

Gerekçe: Açıklama 'Das burada das biçimidir' diye anlamsız bir şablonla başlıyordu; tetikleyici (das artikeli fiili isme çevirir) ve karşılaştırma yazıldı. Geçerli ve eşdeğer bir varyant (kelime sırası / gern-gerne / -es Genitiv) reddediliyordu.

- Açıklama (TR)
  - Eski: Das burada das biçimidir ve ardından gelen Betreten bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Das Betreten dieses Bereichs ist verboten.
  - Yeni: Doğru cevap: Das Betreten dieses Bereichs ist verboten. Artikel das, fiili nötr bir isme çevirir: das Betreten (girme). İsim olduğu için büyük harfle yazılır; zu betreten ise fiil biçimidir ve artikelle kullanılmaz. Fiilin nesnesi isimleşmede Genitiv olur: diesen Bereich betreten → das Betreten dieses Bereichs. Karşılaştır: Man darf das Gebäude nicht betreten (fiil → küçük harf).
- Kabul edilen cevaplar
  - Eski: `das betreten dieses bereichs ist verboten`
  - Yeni: `das betreten dieses bereichs ist verboten` / `das betreten dieses bereiches ist verboten`

#### `adjektiv-gross-klein-6` › 5
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama renk adı Grün'ü 'eylem adı / isimleşmiş mastar' olarak tanımlıyordu (de/en'de de 'substantivierter Infinitiv'); Grün bir renk adıdır.

- Açıklama (TR)
  - Eski: das burada das biçimidir ve ardından gelen Grün bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Ich mag das Grün der Bäume.
  - Yeni: Doğru cevap: Ich mag das Grün der Bäume. Burada Grün bir renk adıdır (isim): das Grün, ardından Genitiv der Bäume gelir. Renk isimleri büyük yazılır ve ek almaz. Karşılaştır: Die Bäume sind grün (yüklem sıfatı → küçük harf).
- DE/EN açıklamaları da güncellendi.

#### `farben-9` › 7
Cümle: Ergänze: „Ich liebe das ___ des Frühlings.“ (grün)

Gerekçe: Açıklama renk adı Grün'ü 'eylem adı / isimleşmiş mastar' olarak tanımlıyordu (de/en'de de 'substantivierter Infinitiv'); Grün bir renk adıdır.

- Açıklama (TR)
  - Eski: das burada das biçimidir ve ardından gelen Grün bir eylem adı olarak kullanılır. Fiilin mastarı isimleştiğinden büyük harfle yazılır. Cümlede çekimli fiil olarak kullanılan biçimle karıştırma. Doğru cevap: Grün
  - Yeni: Doğru cevap: Grün. Artikel das ve ardından gelen Genitiv des Frühlings, Grün'ün burada bir renk adı (isim) olduğunu gösterir: das Grün. Renk isimleri büyük yazılır ve ek almaz. Karşılaştır: Die Blätter sind grün (yüklem sıfatı → küçük harf).
- DE/EN açıklamaları da güncellendi.

#### `praeposition-nominalisiert-2` › 1
Cümle: Welche Form passt? „Vom vielen ___ bekomme ich Rückenschmerzen.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: “Vom vielen Sitzen” yapısı vardır. Doğru cevap: Sitzen
  - Yeni: Doğru cevap: Sitzen. vom = von dem; dem artikeli ve vielen sıfatı bir isim ister. Bu yüzden sitzen isimleşir ve büyük yazılır: vom vielen Sitzen (çok oturmaktan). Sıfat vielen küçük kalır. Karşılaştır: Ich sitze viel (fiil → küçük).

#### `das-infinitiv-3` › 1
Cümle: Welche Form passt? „Ich gehe morgens gern ___.“

Gerekçe: İki şık doğruydu: 'Ich gehe morgens gern zum Laufen' de dilbilgisel olarak doğru bir cümle (gehen + zum + isimleşmiş fiil). Çeldirici yanlış 'zu laufen' ile değiştirildi ve açıklama somutlaştırıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: laufen. Burada fiil kullanımı vardır; isimleşme yoktur.
  - Yeni: Doğru cevap: laufen. gehen + Infinitiv yapısında (laufen gehen = koşmaya gitmek) ikinci fiil yalın Infinitiv olarak kalır, zu almaz ve küçük yazılır. Karşılaştır: Das Laufen am Morgen hilft mir (das → isim, büyük harf).
- Seçenekler
  - Eski: `Laufen` / `zum Laufen` / `laufen`
  - Yeni: `Laufen` / `zu laufen` / `laufen`

#### `das-infinitiv-3` › 5
Cümle: Welche Form passt? „Ich muss heute noch ___.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: “ich muss ... lernen” küçük harfle verilir. Doğru cevap: lernen
  - Yeni: Doğru cevap: lernen. Modal fiil muss, ikinci fiili yalın Infinitiv olarak cümle sonuna gönderir: Ich muss heute noch lernen. Bu bir fiildir, isim değildir; küçük yazılır. Karşılaştır: Das Lernen braucht Zeit (das → isim).

#### `nominalisierte-infinitive-schreiben-4` › 2
Cümle: Ergänze: „vom vielen ___“ (sitzen)

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: aynı kalıp bulunur. Doğru cevap: vom vielen Sitzen
  - Yeni: Doğru cevap: vom vielen Sitzen. vom = von dem; dem artikeli ve vielen sıfatı bir isim gerektirir. Bu yüzden sitzen isimleşir ve büyük yazılır: vom vielen Sitzen (çok oturmaktan). Sıfat vielen küçük kalır.

#### `verb-nomen-wechsel-5` › 9
Cümle: Formuliere nominal: „Er sitzt zu viel.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: “Vom vielen Sitzen ...” modeli vardır. Doğru cevap: Vom vielen Sitzen bekommt er Beschwerden.
  - Yeni: Doğru cevap: Vom vielen Sitzen bekommt er Beschwerden. er sitzt viel → vom vielen Sitzen: vom = von dem, viel sıfat olarak -en alır ve küçük kalır, Sitzen isimleşmiş fiil olarak büyük yazılır. von burada sebep bildirir: çok oturmaktan şikâyetleri oluyor.

#### `adjektiv-gross-klein-6` › 7
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: “Das Neue” biçimi bulunur. Doğru cevap: Das Neue macht vielen Angst.
  - Yeni: Doğru cevap: Das Neue macht vielen Angst. das'tan sonra neu bir isim gibi kullanılıyor (yeni olan şey); arkasından nitelediği bir isim gelmiyor. Bu yüzden büyük yazılır ve belirli artikelden sonra -e alır: das Neue. Das Neu eksiz, das neue küçük harfli olduğu için yanlıştır.

#### `das-adjektiv-8` › 7
Cümle: Ergänze: „Das ___ daran war seine Reaktion.“ (überraschend)

Gerekçe: Açıklama sadece cevabı tekrarlıyordu veya TR alanında İngilizce kelime vardı ("adjective"); kural yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Überraschende. das + nominalisierte adjective.
  - Yeni: Doğru cevap: Überraschende. das'tan sonra überraschend bir isim gibi kullanılıyor (şaşırtıcı olan şey); arkasından nitelediği bir isim gelmiyor. Bu yüzden büyük yazılır ve belirli artikel das'tan sonra -e alır: das Überraschende.

#### `das-adjektiv-8` › 8
Cümle: Ergänze: „Das ___ bleibt oft unbemerkt.“ (positiv)

Gerekçe: Açıklama sadece cevabı tekrarlıyordu veya TR alanında İngilizce kelime vardı ("adjective"); kural yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Positive. das Positive.
  - Yeni: Doğru cevap: Positive. das'tan sonra positiv bir isim gibi kullanılıyor (olumlu olan şey); arkasından nitelediği bir isim gelmiyor. Bu yüzden büyük yazılır ve belirli artikel das'tan sonra -e alır: das Positive.

#### `das-adjektiv-8` › 9
Cümle: Ergänze: „Das ___ ist manchmal schwer zu akzeptieren.“ (unbekannt)

Gerekçe: Açıklama sadece cevabı tekrarlıyordu veya TR alanında İngilizce kelime vardı ("adjective"); kural yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Unbekannte. das Unbekannte.
  - Yeni: Doğru cevap: Unbekannte. das'tan sonra unbekannt bir isim gibi kullanılıyor (bilinmeyen şey); arkasından nitelediği bir isim gelmiyor. Bu yüzden büyük yazılır ve belirli artikel das'tan sonra -e alır: das Unbekannte.

#### `master-20` › 5
Cümle: Ergänze: „Das ___ an der Lösung ist ihre Einfachheit.“ (überzeugend)

Gerekçe: Açıklama sadece cevabı tekrarlıyordu veya TR alanında İngilizce kelime vardı ("adjective"); kural yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Das Überzeugende an der Lösung ist ihre Einfachheit.. das + nominalisierte adjective -e.
  - Yeni: Doğru cevap: Das Überzeugende an der Lösung ist ihre Einfachheit. das'tan sonra überzeugend bir isim gibi kullanılıyor (ikna edici olan şey); arkasından nitelediği bir isim gelmiyor. Bu yüzden büyük yazılır ve belirli artikel das'tan sonra -e alır: das Überzeugende.

#### `b2-mix-19` › 7
Cümle: Welche Form ist korrekt?

Gerekçe: TR açıklamada İngilizce "adjective" kelimesi vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Nichts Wichtiges wurde vergessen.. nichts + nominalisierte adjective -es.
  - Yeni: Doğru cevap: Nichts Wichtiges wurde vergessen. nichts'ten sonra sıfat isim gibi kullanılır: büyük yazılır ve nötr güçlü çekimle -es alır: nichts Wichtiges. Wichtige (son eksik) ve wichtiges (küçük harf) yanlıştır. Karşılaştır: alles Wichtige (alles'ten sonra -e).

#### `farben-9` › 5
Cümle: Ergänze: „Das ___ des Himmels erinnert mich ans Meer.“ (blau)

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: “das Blau” bulunur. Doğru cevap: Blau
  - Yeni: Doğru cevap: Blau. Artikel das ve ardından gelen Genitiv des Himmels, Blau'nun burada bir renk adı (isim) olduğunu gösterir: das Blau. Renk isimleri büyük yazılır ve ek almaz. Karşılaştır: Der Himmel ist blau (yüklem sıfatı → küçük).

#### `personen-nominativ-10` › 2
Cümle: Ergänze: „Meine ___ arbeitet jetzt in Köln.“ (bekannt)

Gerekçe: Açıklamada artikel boş kalmıştı ("Sorudaki  ve Nominativ"); tetikleyici Meine yazıldı.

- Açıklama (TR)
  - Eski: Bekannte burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki  ve Nominativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Bekannte
  - Yeni: Doğru cevap: Bekannte. Bekannte burada bir kişiyi (kadın tanıdık) adlandırıyor; bu yüzden büyük harfle yazılır. Cümlenin öznesi olduğu için Nominativ'tir; feminin meine'den sonra son -e olur: meine Bekannte. Karşılaştır: mein Bekannter (erkek tanıdık).

#### `personen-nominativ-10` › 5
Cümle: Ergänze: „Der ___ fragt nach dem Weg.“ (reisend)

Gerekçe: Açıklama hâli yanlış veriyordu (özne Nominativ iken "Dativ" yazıyordu).

- Açıklama (TR)
  - Eski: Reisende burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki Der ve Dativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Reisende
  - Yeni: Doğru cevap: Reisende. Reisende (yolcu) bir kişiyi adlandırıyor; bu yüzden büyük harfle yazılır. Der Reisende fiil fragt'ın öznesidir (Nominativ); maskulin der'den sonra son -e olur. Karşılaştır: ein Reisender.

#### `personen-nominativ-10` › 6
Cümle: Ergänze: „Eine ___ spricht mit dem Arzt.“ (angestellt)

Gerekçe: Açıklama hâli yanlış veriyordu (özne Nominativ iken "Dativ" yazıyordu).

- Açıklama (TR)
  - Eski: Angestellte burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki Eine ve Dativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Angestellte
  - Yeni: Doğru cevap: Angestellte. Angestellte (çalışan) bir kişiyi adlandırıyor; bu yüzden büyük harfle yazılır. Eine Angestellte fiil spricht'in öznesidir (Nominativ); feminin eine'den sonra son -e olur. mit dem Arzt'taki Dativ bu kelimeyi etkilemez. Karşılaştır: ein Angestellter (erkek).

#### `personen-nominativ-10` › 8
Cümle: Ergänze: „Ein ___ hilft uns.“ (deutsch)

Gerekçe: Açıklama hâli yanlış veriyordu (özne Nominativ iken "Dativ" yazıyordu).

- Açıklama (TR)
  - Eski: Deutscher burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki Ein ve Dativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Deutscher
  - Yeni: Doğru cevap: Deutscher. Deutscher bir kişiyi adlandırıyor; bu yüzden büyük harfle yazılır. Ein Deutscher fiil hilft'in öznesidir (Nominativ); maskulin ein sonu göstermediği için sıfat -er alır. uns ise nesnedir. Karşılaştır: der Deutsche.

#### `gruppen-plural-12` › 4
Cümle: Ergänze: „Viele ___ warten vor dem Gebäude.“ (reisend)

Gerekçe: Açıklama tetikleyiciyi "dem ve Dativ" olarak veriyordu; boşluktaki kelime viele ile kullanılan Nominativ özne.

- Açıklama (TR)
  - Eski: Reisende burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki dem ve Dativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Reisende
  - Yeni: Doğru cevap: Reisende. Reisende bir insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Viele Reisende cümlenin öznesidir (Nominativ çoğul). Belirli artikel olmadığı için (viele) sıfat güçlü çekimle -e alır. vor dem Gebäude'deki Dativ bu kelimeyi etkilemez. Karşılaştır: die Reisenden.

#### `gruppen-plural-12` › 7
Cümle: Ergänze: „Einige ___ protestieren.“ (unzufrieden)

Gerekçe: Açıklamada tetikleyici boş kalmıştı ("Sorudaki  ve"); einige yazıldı.

- Açıklama (TR)
  - Eski: Unzufriedene burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki  ve Nominativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Unzufriedene
  - Yeni: Doğru cevap: Unzufriedene. Unzufriedene (memnun olmayanlar) bir insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Einige Unzufriedene özne (Nominativ çoğul); einige'den sonra sıfat güçlü çekimle -e alır. Karşılaştır: die Unzufriedenen.

#### `gruppen-plural-12` › 8
Cümle: Ergänze: „Wir befragen mehrere ___.“ (fremd)

Gerekçe: Açıklamada tetikleyici boş kalmıştı ("Sorudaki  ve"); mehrere ve befragen + Akkusativ yazıldı.

- Açıklama (TR)
  - Eski: Fremde burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki  ve Akkusativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Fremde
  - Yeni: Doğru cevap: Fremde. Fremde (yabancılar) bir insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. befragen Akkusativ nesne ister; mehrere'den sonra çoğulda sıfat güçlü çekimle -e alır: mehrere Fremde. Karşılaştır: die Fremden.

#### `gruppen-plural-12` › 9
Cümle: Ergänze: „Die ___ besuchen heute die ___.“ (jung/krank)

Gerekçe: Açıklama iki boşluğu da Nominativ sayıyordu; ikinci boşluk besuchen fiilinin Akkusativ nesnesi.

- Açıklama (TR)
  - Eski: Jungen und Kranken burada bir kişiyi veya insan grubunu adlandırıyor; bu yüzden büyük harfle yazılır. Sorudaki Die ve Nominativ görevi sıfat çekimindeki sonu belirler. İsimleşme, sıfatın çekim ekini kaldırmaz. Doğru cevap: Jungen und Kranken
  - Yeni: Doğru cevap: Jungen und Kranken. İkisi de insan gruplarını adlandırıyor; bu yüzden büyük harfle yazılır. Die Jungen özne (Nominativ çoğul), die Kranken besuchen'in nesnesi (Akkusativ çoğul). Çoğul belirli artikel die'den sonra her iki hâlde de son -en olur.

#### `adjektiv-transformation-15` › 3
Cümle: Formuliere nominal: „Das ist neu.“ → „... fasziniert mich.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Das Neue fasziniert mich.. Kaynağın “Das Neue” örneği.
  - Yeni: Doğru cevap: Das Neue fasziniert mich. Das ist neu cümlesindeki sıfat, das ile isim olur: das Neue (yeni olan şey). Arkasından isim gelmediği için büyük yazılır ve belirli artikelden sonra -e alır.

#### `adjektiv-transformation-15` › 5
Cümle: Formuliere nominal: „Er ist arbeitslos.“ → „... sucht Arbeit.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: der Arbeitslose. Doğru cevap: Der Arbeitslose sucht Arbeit.
  - Yeni: Doğru cevap: Der Arbeitslose sucht Arbeit. Er ist arbeitslos → der Arbeitslose (işsiz kişi). Kişi adı olduğu için büyük yazılır; maskulin Nominativ der'den sonra sıfat sonu -e olur. Karşılaştır: ein Arbeitsloser.

#### `adjektiv-transformation-15` › 6
Cümle: Formuliere nominal: „Sie ist bekannt.“ → „Meine ... hat geheiratet.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: Meine Bekannte. Doğru cevap: Meine Bekannte hat geheiratet.
  - Yeni: Doğru cevap: Meine Bekannte hat geheiratet. Sie ist bekannt → meine Bekannte (kadın tanıdık). Kişi adı olduğu için büyük yazılır; feminin Nominativ meine'den sonra son -e olur. Karşılaştır: mein Bekannter (erkek).

#### `adjektiv-transformation-15` › 7
Cümle: Formuliere nominal: „Er ist fremd.“ → „Ein ... hat geklopft.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: Ein Fremder. Doğru cevap: Ein Fremder hat geklopft.
  - Yeni: Doğru cevap: Ein Fremder hat geklopft. Er ist fremd → ein Fremder (yabancı biri). Kişi adı olduğu için büyük yazılır; maskulin Nominativ ein sonu göstermediği için sıfat -er alır. Karşılaştır: der Fremde.

#### `adjektiv-transformation-15` › 8
Cümle: Formuliere nominal: „Sie sind deutsch.“ → „Die ... sind pünktlich.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: Die Deutschen. Doğru cevap: Die Deutschen sind pünktlich.
  - Yeni: Doğru cevap: Die Deutschen sind pünktlich. Sie sind deutsch → die Deutschen (Almanlar). Grup adı olduğu için büyük yazılır; çoğul belirli artikel die'den sonra son -en olur. Karşılaştır: Deutsche (artikelsiz çoğul).

#### `verb-transformation-16` › 1
Cümle: Formuliere nominal: „Er sitzt sehr viel und wird davon müde.“

Gerekçe: Açıklama gerekçesizdi ("... yapısı vardır / bulunur"); kural ve tetikleyici yazıldı.

- Açıklama (TR)
  - Eski: “Vom vielen Sitzen ...” modeli vardır. Doğru cevap: Vom vielen Sitzen wird er müde.
  - Yeni: Doğru cevap: Vom vielen Sitzen wird er müde. er sitzt viel → vom vielen Sitzen: vom = von dem, viel sıfat olarak -en alır ve küçük kalır, Sitzen isimleşmiş fiil olarak büyük yazılır. von burada sebep bildirir (çok oturmaktan).
- Kabul edilen cevaplar
  - Eski: `vom vielen sitzen wird er muede` / `vom vielen sitzen wird er müde`
  - Yeni: `vom vielen sitzen wird er muede` / `vom vielen sitzen wird er müde` / `er wird vom vielen sitzen müde`

#### `verb-transformation-16` › 3
Cümle: Formuliere nominal: „Sie singt im Chor und hat viel Spaß.“

Gerekçe: Açıklama 'viel sonrasında sıfat isimleşiyor, bu yüzden Spaß büyük yazılır' diyordu; Spaß zaten normal bir isimdir. Asıl tetikleyici das Singen.

- Açıklama (TR)
  - Eski: Burada viel sonrasında sıfat bir ismin önünde durmuyor, ismin görevini üstleniyor. Bu yüzden Spaß büyük harfle yazılır. Küçük harfli sıfat biçimi bu isimleşmeyi göstermez. Doğru cevap: Das Singen im Chor macht ihr viel Spaß.
  - Yeni: Doğru cevap: Das Singen im Chor macht ihr viel Spaß. sie singt → das Singen: artikel das fiili nötr isme çevirir, bu yüzden Singen büyük yazılır ve cümlenin öznesi olur (macht). Spaß zaten bir isimdir; viel onu niteler.

#### `verb-transformation-16` › 0
Cümle: Formuliere nominal: „Ich fahre und muss mich konzentrieren.“

Gerekçe: Geçerli ve eşdeğer bir varyant (kelime sırası / gern-gerne / -es Genitiv) reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `beim fahren muss ich mich konzentrieren`
  - Yeni: `beim fahren muss ich mich konzentrieren` / `ich muss mich beim fahren konzentrieren`

#### `verb-transformation-16` › 5
Cümle: Formuliere nominal: „Ich lerne und höre dabei Musik.“

Gerekçe: Geçerli ve eşdeğer bir varyant (kelime sırası / gern-gerne / -es Genitiv) reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `beim lernen hoere ich musik` / `beim lernen höre ich musik`
  - Yeni: `beim lernen hoere ich musik` / `beim lernen höre ich musik` / `ich höre beim lernen musik`

#### `verb-transformation-16` › 7
Cümle: Formuliere nominal: „Er liest viel und entspannt sich dabei.“

Gerekçe: Geçerli ve eşdeğer bir varyant (kelime sırası / gern-gerne / -es Genitiv) reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `beim lesen entspannt er sich`
  - Yeni: `beim lesen entspannt er sich` / `er entspannt sich beim lesen`

#### `verb-nomen-wechsel-5` › 6
Cümle: Formuliere mit Verb: „Das Rauchen ist hier nicht erlaubt.“

Gerekçe: Geçerli ve eşdeğer bir varyant (kelime sırası / gern-gerne / -es Genitiv) reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `man darf hier nicht rauchen`
  - Yeni: `man darf hier nicht rauchen` / `hier darf man nicht rauchen`

#### `verb-nomen-wechsel-5` › 8
Cümle: Formuliere mit Verb: „Das Singen macht ihr Spaß.“

Gerekçe: Geçerli ve eşdeğer bir varyant (kelime sırası / gern-gerne / -es Genitiv) reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `sie singt gern`
  - Yeni: `sie singt gern` / `sie singt gerne`

#### `verb-nomen-wechsel-5` › 2
Cümle: Formuliere mit Infinitiv: „Hör mit dem Weinen auf.“

Gerekçe: Bare zu-Infinitiv (aufhören + zu weinen, ek öğe yok) virgülsüz de yazılabilir; virgülsüz cevap reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `hoer auf, zu weinen` / `hör auf, zu weinen`
  - Yeni: `hoer auf, zu weinen` / `hör auf, zu weinen` / `hör auf zu weinen`

#### `verb-nomen-wechsel-5` › 4
Cümle: Formuliere mit Infinitiv: „Zum Spielen kommt sie später vorbei.“

Gerekçe: Infinitiv grubu cümle başına da alınabilir; eşdeğer kelime sırası reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `sie kommt spaeter vorbei, um zu spielen` / `sie kommt später vorbei, um zu spielen`
  - Yeni: `sie kommt spaeter vorbei, um zu spielen` / `sie kommt später vorbei, um zu spielen` / `um zu spielen, kommt sie später vorbei`

#### `b2-kontext-18` › 6
Cümle: Ergänze: „Sie sucht nach etwas ___.“ (passend)

Gerekçe: Açıklama Dativ sonunu (-em) açıklamıyordu; tetikleyici nach + Dativ yazıldı.

- Açıklama (TR)
  - Eski: Burada etwas sonrasında sıfat bir ismin önünde durmuyor, ismin görevini üstleniyor. Bu yüzden Passendem büyük harfle yazılır. Küçük harfli sıfat biçimi bu isimleşmeyi göstermez. Doğru cevap: Sie sucht nach etwas Passendem.
  - Yeni: Doğru cevap: Sie sucht nach etwas Passendem. etwas'tan sonra sıfat isim gibi kullanılır ve büyük yazılır. nach edatı Dativ ister; artikel olmadığı için sıfat nötr Dativ güçlü sonunu alır: -em → etwas Passendem. Karşılaştır: Ich suche etwas Passendes (Akkusativ → -es).

#### `b2-kontext-18` › 7
Cümle: Ergänze: „Wir danken den ___.“ (beteiligt)

Gerekçe: İpucunda İngilizce metin vardı ve cevabın kendisi (beteiligten) veriliyordu; ipucu sıfat kökü (beteiligt) olarak düzeltildi.

- Cümle
  - Eski: Ergänze: „Wir danken den ___.“ (beteiligten, adjective stem beteiligt)
  - Yeni: Ergänze: „Wir danken den ___.“ (beteiligt)
- Açıklama (TR)
  - Eski: Doğru cevap: Wir danken den Beteiligten.. den + Dativ çoğul nominalisierte sıfat -en.
  - Yeni: Doğru cevap: Wir danken den Beteiligten. danken Dativ ister; çoğul Dativ belirli artikel den'den sonra isimleşmiş sıfat -en alır ve kişi adı olduğu için büyük yazılır: den Beteiligten (katılanlar/ilgililer).

#### `master-20` › 1
Cümle: Ergänze: „Wir haben etwas ___ und nichts ___ erfahren.“ (positiv/neu)

Gerekçe: Açıklama yalnızca ilk boşluğu (etwas Positives) açıklıyordu; nichts Neues eklendi.

- Açıklama (TR)
  - Eski: Burada etwas sonrasında sıfat bir ismin önünde durmuyor, ismin görevini üstleniyor. Bu yüzden Positives büyük harfle yazılır ve bu yapıdaki nötr çekim -es ile görünür. Küçük harfli sıfat biçimi bu isimleşmeyi göstermez. Doğru cevap: etwas Positives und nichts Neues
  - Yeni: Doğru cevap: etwas Positives und nichts Neues. etwas ve nichts'ten sonra sıfat isim gibi kullanılır; arkasından isim gelmediği için büyük yazılır ve nötr güçlü çekimle -es alır: etwas Positives, nichts Neues.

#### `master-20` › 3
Cümle: Ergänze: „Mit einem ___ und zwei ___ wurde gesprochen.“ (verantwortlich/beteiligt)

Gerekçe: Açıklama ikinci boşluk için belirsizdi ("uygun sonla"); Dativ çoğul -en kuralı yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: mit einem Verantwortlichen und zwei Beteiligten. Dativ tekil maskulin -en; sayı sonrası çoğul kişi adı uygun sonla kullanılır.
  - Yeni: Doğru cevap: mit einem Verantwortlichen und zwei Beteiligten. mit Dativ ister. einem'den sonra tekil maskulin Dativ son -en: einem Verantwortlichen. zwei çekim göstermez; Dativ çoğulda sıfat sonu yine -en olur: zwei Beteiligten. Kişi adları olduğu için ikisi de büyük yazılır.

#### `master-20` › 6
Cümle: Korrigiere: „Beim analysieren haben die Verantwortliche nichts neues entdeckt.“

Gerekçe: Açıklama üç hatadan yalnızca birini (nichts Neues) açıklıyordu.

- Açıklama (TR)
  - Eski: Burada nichts sonrasında sıfat bir ismin önünde durmuyor, ismin görevini üstleniyor. Bu yüzden Neues büyük harfle yazılır ve bu yapıdaki nötr çekim -es ile görünür. Küçük harfli sıfat biçimi bu isimleşmeyi göstermez. Doğru cevap: Beim Analysieren haben die Verantwortlichen nichts Neues entdeckt.
  - Yeni: Doğru cevap: Beim Analysieren haben die Verantwortlichen nichts Neues entdeckt. Üç düzeltme var: beim = bei dem, ardından gelen fiil isimleşir → Analysieren büyük; die Verantwortlichen özne (Nominativ çoğul), belirli artikel die'den sonra -en; nichts'ten sonra isimleşen sıfat büyük yazılır ve -es alır → nichts Neues.

#### `master-20` › 7
Cümle: Ergänze: „Ich wünsche allen ___ alles ___.“ (beteiligt/gut)

Gerekçe: Açıklama yalnızca alles Gute kısmını açıklıyordu; allen Beteiligten eklendi.

- Açıklama (TR)
  - Eski: Burada alles sonrasında sıfat bir ismin önünde durmuyor, ismin görevini üstleniyor. Bu yüzden Gute büyük harfle yazılır ve bu yapıdaki nötr çekim -e ile görünür. Küçük harfli sıfat biçimi bu isimleşmeyi göstermez. Doğru cevap: allen Beteiligten alles Gute
  - Yeni: Doğru cevap: allen Beteiligten alles Gute. wünschen kime sorusunda Dativ ister: allen Beteiligten (Dativ çoğul, allen'den sonra -en, kişi adı → büyük). alles'ten sonra isimleşen sıfat büyük yazılır ve -e alır: alles Gute.

### `data/b2/partizip-i.json`

#### `bildung-erkennen-1` › 0
Cümle: Welche Form ist das richtige Partizip I von „schwimmen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: schwimmend. Partizip I wird aus dem Infinitiv + d gebildet: schwimmen + d → schwimmend.
  - Yeni: Doğru cevap: schwimmend. Partizip I, Infinitiv'e -d eklenerek yapılır: schwimmen + d → schwimmend. geschwommen Partizip II'dir; schwimmernd diye bir biçim yoktur.

#### `bildung-erkennen-1` › 1
Cümle: Welche Form ist das richtige Partizip I von „spielen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: spielend. spielen + d ergibt spielend; gespielt ist Partizip II.
  - Yeni: Doğru cevap: spielend. Partizip I = Infinitiv + d: spielen + d → spielend. gespielt Partizip II'dir; spielernd diye bir biçim yoktur.

#### `bildung-erkennen-1` › 2
Cümle: Welche Form ist das richtige Partizip I von „lernen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: lernend. Der Infinitiv lernen erhält ein -d: lernend.
  - Yeni: Doğru cevap: lernend. Infinitiv lernen'e -d eklenir: lernen + d → lernend. gelernt Partizip II'dir; lernernd diye bir biçim yoktur.

#### `bildung-erkennen-1` › 3
Cümle: Welche Form ist das richtige Partizip I von „fliegen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: fliegend. fliegen + d → fliegend; geflogen gehört zum Partizip II.
  - Yeni: Doğru cevap: fliegend. Partizip I = Infinitiv + d: fliegen + d → fliegend. geflogen Partizip II'dir; fliegernd diye bir biçim yoktur.

#### `erweiterte-gruppen-4` › 3
Cümle: Forme um: „Menschen, die Sport treiben“

Gerekçe: Açıklama "Kaynakta ... modeli bulunur" diye boş gerekçe veriyordu; ayrıca Duden'e göre bitişik yazım sporttreibend de doğrudur ve reddediliyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Sport treibende Menschen. Kaynakta 'Sport treibende Menschen' modeli bulunur; treiben → treibend.
  - Yeni: Doğru cevap: Sport treibende Menschen. Relativsatz'daki nesne (Sport) Partizip I'in önüne geçer: treiben → treibend. Artikelsiz çoğul Nominativ'de sıfat sonu -e olur: Sport treibende Menschen (bitişik sporttreibende de yazılabilir).
- Kabul edilen cevaplar
  - Eski: `sport treibende menschen`
  - Yeni: `sport treibende menschen` / `sporttreibende menschen`

#### `erweiterte-attribute-12` › 3
Cümle: Schreibe als Partizip-I-Gruppe: „Menschen, die regelmäßig Sport treiben“

Gerekçe: Duden'e göre bitişik yazım (sporttreibend) da doğrudur; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `regelmaessig sport treibende menschen` / `regelmäßig sport treibende menschen`
  - Yeni: `regelmaessig sport treibende menschen` / `regelmäßig sport treibende menschen` / `regelmäßig sporttreibende menschen`

#### `erweiterte-attribute-12` › 6
Cümle: Schreibe als Partizip-I-Gruppe: „Menschen, die allein in Großstädten leben“

Gerekçe: TR açıklamada İngilizce kelime ("alone") vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: allein in Großstädten lebende Menschen. alone/yer bilgisi Partizip-I grubuna dahil olur.
  - Yeni: Doğru cevap: allein in Großstädten lebende Menschen. Relativsatz'daki tüm tamamlayıcılar (allein, in Großstädten) Partizip I'in önüne aynı sırayla geçer: leben → lebend. Artikelsiz çoğulda sıfat sonu -e olur.

#### `akkusativ-7` › 5
Cümle: Ergänze: „Wir besuchen eine ___ Frau.“ (allein leben)

Gerekçe: Duden'e göre "allein lebend" ayrı da "alleinlebend" bitişik de yazılabilir; ayrı yazılmış doğru cevap reddediliyordu. Açıklamadaki uydurma Infinitiv "alleinleben" düzeltildi.

- Açıklama (TR)
  - Eski: Doğru cevap: alleinlebende. eine + feminin Akkusativ → -e; alleinleben → alleinlebend.
  - Yeni: Doğru cevap: alleinlebende. allein leben → alleinlebend (ayrı da yazılabilir: allein lebend). Wir besuchen + Akkusativ; feminin eine'den sonra son -e olur: eine alleinlebende Frau.
- Kabul edilen cevaplar
  - Eski: `alleinlebende`
  - Yeni: `alleinlebende` / `allein lebende`

#### `genitiv-9` › 8
Cümle: Ergänze: „Die Bedürfnisse ___ Personen unterscheiden sich.“ (allein leben)

Gerekçe: Duden'e göre "allein lebend" ayrı da "alleinlebend" bitişik de yazılabilir; ayrı yazılmış doğru cevap reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `alleinlebender`
  - Yeni: `alleinlebender` / `allein lebender`

#### `deklinationsfehler-17` › 4
Cümle: Korrigiere: „Die Zahl alleinlebenden Menschen steigt.“

Gerekçe: Duden'e göre "allein lebend" ayrı da "alleinlebend" bitişik de yazılabilir; ayrı yazılmış doğru cevap reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `die zahl alleinlebender menschen steigt`
  - Yeni: `die zahl alleinlebender menschen steigt` / `die zahl allein lebender menschen steigt`

#### `master-20` › 8
Cümle: Forme als Partizip-I-Gruppe: „Personen, die allein leben und regelmäßig von zu Hause arbeiten“

Gerekçe: Duden'e göre "allein lebend" ayrı da "alleinlebend" bitişik de yazılabilir; ayrı yazılmış doğru cevap reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `allein lebende und regelmaessig von zu hause arbeitende personen` / `allein lebende und regelmäßig von zu hause arbeitende personen`
  - Yeni: `allein lebende und regelmaessig von zu hause arbeitende personen` / `allein lebende und regelmäßig von zu hause arbeitende personen` / `alleinlebende und regelmäßig von zu hause arbeitende personen`

#### `saetze-verbinden-15` › 4
Cümle: Verbinde: „Viele Menschen arbeiten nachts. Sie brauchen am Tag Ruhe.“

Gerekçe: Girdideki "viele" korunduğunda da cevap doğrudur (Viele nachts arbeitende Menschen ...); reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `nachts arbeitende menschen brauchen am tag ruhe`
  - Yeni: `nachts arbeitende menschen brauchen am tag ruhe` / `viele nachts arbeitende menschen brauchen am tag ruhe`

#### `mix-19` › 1
Cümle: Welche Form ist korrekt?

Gerekçe: İki şık doğruydu: "Ein schnell gewachsenes Unternehmen" (sein ile çekimlenen wachsen'in Partizip II'si sıfat olarak) de dilbilgisel olarak doğru. Çeldirici yanlış sonlu bir biçimle değiştirildi.

- Seçenekler
  - Eski: `Ein schnell gewachsenes Unternehmen braucht Kapital.` / `Ein schnell wachsendes Unternehmen braucht Kapital.` / `Ein schnell wachsender Unternehmen braucht Kapital.`
  - Yeni: `Ein schnell wachsende Unternehmen braucht Kapital.` / `Ein schnell wachsendes Unternehmen braucht Kapital.` / `Ein schnell wachsender Unternehmen braucht Kapital.`
- Açıklama (TR)
  - Eski: Doğru cevap: Ein schnell wachsendes Unternehmen braucht Kapital.. ein + neutrum Nominativ → -es; devam eden büyüme → wachsend.
  - Yeni: Doğru cevap: Ein schnell wachsendes Unternehmen braucht Kapital. Unternehmen nötrdür ve öznedir (Nominativ). ein sonu göstermediği için sıfat nötr işareti -es alır: ein wachsendes Unternehmen. Partizip I (wachsend) büyümenin hâlâ sürdüğünü anlatır.

#### `mix-19` › 8
Cümle: Welche Form ist korrekt?

Gerekçe: İki şık doğruydu: "Die ständig gestiegenen Preise" (sein ile çekimlenen steigen'in Partizip II'si) de dilbilgisel olarak doğru. Çeldirici yanlış sonlu bir biçimle değiştirildi; TR'deki İngilizce "article" düzeltildi.

- Seçenekler
  - Eski: `Die ständig steigenden Preise sorgen für Kritik.` / `Die ständig steigende Preise sorgen für Kritik.` / `Die ständig gestiegenen Preise sorgen für Kritik.`
  - Yeni: `Die ständig steigenden Preise sorgen für Kritik.` / `Die ständig steigende Preise sorgen für Kritik.` / `Die ständig steigender Preise sorgen für Kritik.`
- Açıklama (TR)
  - Eski: Doğru cevap: Die ständig steigenden Preise sorgen für Kritik.. Belirli article plural → -en; devam eden süreç Partizip I ile anlatılır.
  - Yeni: Doğru cevap: Die ständig steigenden Preise sorgen für Kritik. Preise çoğuldur ve öznedir; çoğul belirli artikel die'den sonra sıfat sonu -en olur. Partizip I (steigend) sürecin devam ettiğini anlatır.

### `data/b2/partizip-ii.json`

#### `erkennen-1` › 0
Cümle: Welches Wort ist das Partizip II von „schreiben“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: geschrieben. schreiben ist unregelmäßig: geschrieben.
  - Yeni: Doğru cevap: geschrieben. schreiben güçlü (düzensiz) bir fiildir: ge- + değişen kök + -en → geschrieben. schreibend Partizip I'dir; geschreibt diye bir biçim yoktur.

#### `erkennen-1` › 1
Cümle: Welches Wort ist das Partizip II von „öffnen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: geöffnet. Regelmäßiges Verb: ge- + Stamm + -t.
  - Yeni: Doğru cevap: geöffnet. öffnen düzenli bir fiildir: ge- + kök + -t. Kök öffn- ünsüz + n ile bittiği için telaffuz kolaylığı için araya -e- girer: geöffnet. öffnend Partizip I'dir.

#### `erkennen-1` › 2
Cümle: Welches Wort ist das Partizip II von „verlieren“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: verloren. Unregelmäßiges Verb: verlieren → verloren.
  - Yeni: Doğru cevap: verloren. verlieren güçlü bir fiildir ve ver- ayrılmaz ön ek olduğu için ge- almaz: verloren. geverliert iki kuralı da çiğner; verlierend Partizip I'dir.

#### `erkennen-1` › 3
Cümle: Welches Wort ist das Partizip II von „renovieren“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: renoviert. Verben auf -ieren bilden das Partizip II ohne ge-.
  - Yeni: Doğru cevap: renoviert. -ieren ile biten fiiller Partizip II'de ge- almaz: renovieren → renoviert. renovierend Partizip I'dir.

#### `erkennen-1` › 4
Cümle: Welches Wort ist das Partizip II von „mitnehmen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: mitgenommen. Trennbares Verb: Vorsilbe + ge + Stamm → mitgenommen.
  - Yeni: Doğru cevap: mitgenommen. mitnehmen ayrılabilen bir fiildir: ge- ön ek ile kök arasına girer: mit + ge + nommen → mitgenommen. mitnehmend Partizip I'dir.

#### `erkennen-1` › 5
Cümle: Welches Wort ist das Partizip II von „besuchen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: besucht. Untrennbare Vorsilbe be-: kein ge-.
  - Yeni: Doğru cevap: besucht. be- ayrılmaz bir ön ektir; bu yüzden ge- eklenmez: besuchen → besucht. besuchend Partizip I'dir.

#### `erkennen-1` › 7
Cümle: Welches Wort ist das Partizip II von „durchführen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: durchgeführt. Trennbares Verb: durchgeführt.
  - Yeni: Doğru cevap: durchgeführt. durchführen burada ayrılabilen bir fiildir (Ich führe das Projekt durch); ge- ön ek ile kök arasına girer: durch + ge + führt.

#### `erkennen-1` › 9
Cümle: Welches Wort ist das Partizip II von „zerbrechen“?

Gerekçe: TR açıklama alanında Almanca cümle vardı; kural Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: zerbrochen. zer- ist untrennbar; starkes Verb: zerbrochen.
  - Yeni: Doğru cevap: zerbrochen. zer- ayrılmaz bir ön ektir, bu yüzden ge- almaz; brechen güçlü fiil olduğu için -en ile biter: zerbrochen.

#### `nominativ-bestimmt-8` › 8
Cümle: Ergänze: „Der ___ Termin findet morgen statt.“ (verschieben)

Gerekçe: TR açıklamada İngilizce kelime vardı ("adjectival ending", "article", "carefully"); Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: verschobene. verschoben + adjectival ending -e.
  - Yeni: Doğru cevap: verschobene. verschieben → verschoben (ver- → ge- yok). der Termin maskulin ve özne (Nominativ); belirli artikel der'den sonra sıfat sonu -e olur: der verschobene Termin.

#### `relativsatz-einfach-13` › 2
Cümle: Forme um: „die Daten, die gespeichert wurden“

Gerekçe: TR açıklamada İngilizce kelime vardı ("adjectival ending", "article", "carefully"); Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: die gespeicherten Daten. Belirli article plural → -en.
  - Yeni: Doğru cevap: die gespeicherten Daten. die Daten, die gespeichert wurden → Partizip II gespeichert sıfat olur. Çoğul belirli artikel die'den sonra sıfat sonu -en olur.

#### `relativsatz-einfach-13` › 7
Cümle: Forme um: „der Schlüssel, der verloren wurde“

Gerekçe: TR açıklamada İngilizce kelime vardı ("adjectival ending", "article", "carefully"); Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: der verlorene Schlüssel. verlieren → verloren; adjectival ending -e.
  - Yeni: Doğru cevap: der verlorene Schlüssel. verlieren → verloren (ver- → ge- yok). Maskulin Nominativ'de belirli artikel der'den sonra sıfat sonu -e olur.

#### `erweiterte-attribute-14` › 2
Cümle: Forme um: „die Ergebnisse, die sorgfältig geprüft wurden“

Gerekçe: TR açıklamada İngilizce kelime vardı ("adjectival ending", "article", "carefully"); Türkçe yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: die sorgfältig geprüften Ergebnisse. Zarf carefully Partizip II'den önce; plural → -en.
  - Yeni: Doğru cevap: die sorgfältig geprüften Ergebnisse. Relativsatz'daki zarf (sorgfältig) Partizip II'nin önüne geçer. Çoğul belirli artikel die'den sonra sıfat sonu -en olur.

#### `erweiterte-attribute-14` › 6
Cümle: Forme um: „die Ware, die frisch geerntet wurde“

Gerekçe: TR açıklamada İngilizce kelime ("adjectival") vardı ve sıfat sonu açıklanmıyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: die frisch geerntete Ware. frisch + geerntet adjectival yapı oluşturur.
  - Yeni: Doğru cevap: die frisch geerntete Ware. Zarf frisch Partizip II'nin (geerntet) önünde kalır. die Ware feminin; belirli artikel die'den sonra Nominativ'de sıfat sonu -e olur.

#### `bedeutung-16` › 0
Cümle: Welche Aussage passt zu „die geschlossene Tür“?

Gerekçe: TR açıklamada İngilizce "adjectival" vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Die Tür ist bereits geschlossen worden.. Partizip II adjectival kullanım sonuçlanmış/pasif durumu anlatır.
  - Yeni: Doğru cevap: Die Tür ist bereits geschlossen worden. Sıfat olarak kullanılan Partizip II (geschlossen) kapıya yapılmış ve tamamlanmış bir eylemi, yani pasif sonucu anlatır. Kapı eylemi yapan değildir.

#### `bedeutung-16` › 8
Cümle: Welche Aussage passt zu „das zerbrochene Glas“?

Gerekçe: Açıklama belirsizdi ("bazı yapılar"); neden pasif değil de aktif sonuç olduğu açıklandı.

- Açıklama (TR)
  - Eski: Doğru cevap: Das Glas ist zerbrochen.. Bazı Partizip II yapıları sonuç/durum anlamını doğrudan verir.
  - Yeni: Doğru cevap: Das Glas ist zerbrochen. zerbrechen burada nesnesiz (geçişsiz) kullanılır ve Perfekt'i sein ile yapar: Das Glas ist zerbrochen. Bu tür fiillerde Partizip II pasif değil, tamamlanmış bir değişimin sonucunu anlatır: kırılmış bardak.

#### `master-20` › 1
Cümle: Verbinde: „Ein Motor wurde neu entwickelt. Das Unternehmen testet ihn.“

Gerekçe: İkinci cümledeki ihn belirli bir motoru gösterdiği için belirli artikelli varyant (den neu entwickelten Motor) de doğrudur; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `das unternehmen testet einen neu entwickelten motor`
  - Yeni: `das unternehmen testet einen neu entwickelten motor` / `das unternehmen testet den neu entwickelten motor`

### `data/b2/passiv-varianten.json`

#### `duerfen-praesens-4` › 7
Cümle: Bilde Passiv: „Man darf hier Fußball spielen.“

Gerekçe: Açıklama yapıyı "impersonal Passiv" diye yanlış tanımlıyordu: Fußball Akkusativ nesnedir ve pasifte Nominativ özne olur (öznesiz pasif değil). Ayrıca eşdeğer kelime sırası reddediliyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Hier darf Fußball gespielt werden.. Kaynakta benzer şekilde yer ögesiyle impersonal Passiv çalıştırılıyor.
  - Yeni: Doğru cevap: Hier darf Fußball gespielt werden. Aktif cümledeki Akkusativ nesne (Fußball) pasifte Nominativ özne olur; bu yüzden bu öznesiz (unpersönlich) bir pasif değildir. Yapı: darf + Partizip II (gespielt) + werden. Karşılaştır: Hier darf nicht geparkt werden (nesne yok → öznesiz pasif).
- Kabul edilen cevaplar
  - Eski: `hier darf fussball gespielt werden` / `hier darf fußball gespielt werden`
  - Yeni: `hier darf fussball gespielt werden` / `hier darf fußball gespielt werden` / `fußball darf hier gespielt werden`

#### `unpersoenlich-10` › 9
Cümle: Forme ins Passiv um: „Man darf hier musizieren.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu. Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Hier darf musiziert werden.. Kaynakta musizieren gibi nesnesiz fiiller de Präsens Passiv'e dönüştürülüyor.
  - Yeni: Doğru cevap: Hier darf musiziert werden. musizieren nesnesiz bir fiildir; Akkusativ nesne olmadığı için pasifte özne de olmaz (öznesiz pasif). Modal fiil tekil darf olur, sonda Partizip II + werden gelir: musiziert werden.
- Kabul edilen cevaplar
  - Eski: `hier darf musiziert werden`
  - Yeni: `hier darf musiziert werden` / `es darf hier musiziert werden`

#### `dativ-passiv-7` › 4
Cümle: Bilde Passiv: „Man muss dem Kollegen gratulieren.“

Gerekçe: Açıklamada yazım hatası vardı ("gratuliern/gratulieren").

- Açıklama (TR)
  - Eski: Doğru cevap: Dem Kollegen muss gratuliert werden.. gratuliern/gratulieren Dativ nesnesi korunur.
  - Yeni: Doğru cevap: Dem Kollegen muss gratuliert werden. gratulieren Dativ ister; Dativ nesne (dem Kollegen) pasifte Nominativ özneye dönüşmez, Dativ olarak kalır. Özne olmadığı için modal fiil tekil muss olur.

#### `praeteritum-aktiv-passiv-12` › 1
Cümle: Forme ins Passiv um: „Er durfte den Baum nicht fällen.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu. Ayrıca nicht'in von-grubundan önce geldiği eşdeğer sıra reddediliyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Baum durfte von ihm nicht gefällt werden.. Kaynakta aynı zaman yapısı doğrudan çalıştırılıyor.
  - Yeni: Doğru cevap: Der Baum durfte von ihm nicht gefällt werden. Aktif cümle Präteritum (durfte) olduğu için pasifte de durfte kalır. Akkusativ nesne den Baum → özne der Baum; aktif özne er → von ihm (von + Dativ). Sonda Partizip II + werden: gefällt werden.
- Kabul edilen cevaplar
  - Eski: `der baum durfte von ihm nicht gefaellt werden` / `der baum durfte von ihm nicht gefällt werden`
  - Yeni: `der baum durfte von ihm nicht gefaellt werden` / `der baum durfte von ihm nicht gefällt werden` / `der baum durfte nicht von ihm gefällt werden`

#### `perfekt-13` › 6
Cümle: Forme ins Passiv um: „Sie hat ihn benachrichtigen können.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Er hat von ihr benachrichtigt werden können.. İlk PDF'de bu tip Perfekt Passiv doğrudan yer alıyor.
  - Yeni: Doğru cevap: Er hat von ihr benachrichtigt werden können. Akkusativ ihn pasifte Nominativ özne er olur; aktif özne sie → von ihr. Modal fiilin Perfekt'i haben ile kurulur ve modal fiil Infinitiv biçiminde (Ersatzinfinitiv) en sona gelir: hat + benachrichtigt werden + können.

#### `plusquamperfekt-15` › 0
Cümle: Forme ins Passiv um: „Die Polizei hatte den Mann festnehmen können.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Mann hatte von der Polizei festgenommen werden können.. İlk PDF'de Plusquamperfekt mit Modalverb bu zincirle çalıştırılıyor.
  - Yeni: Doğru cevap: Der Mann hatte von der Polizei festgenommen werden können. Plusquamperfekt'te yardımcı fiil hatte olur; zincir: hatte + Partizip II (festgenommen) + werden + können (Ersatzinfinitiv). Akkusativ den Mann → özne der Mann; die Polizei → von der Polizei.

#### `plusquamperfekt-15` › 1
Cümle: Forme ins Passiv um: „Sie hatte den Hund suchen müssen.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Der Hund hatte von ihr gesucht werden müssen.. Kaynakta aynı yapı örneklenir.
  - Yeni: Doğru cevap: Der Hund hatte von ihr gesucht werden müssen. Akkusativ den Hund pasifte özne der Hund olur; aktif özne sie → von ihr (Dativ). Zincir: hatte + gesucht + werden + müssen; modal fiil Ersatzinfinitiv olarak en sonda durur.

#### `konjunktiv-ii-vergangenheit-16` › 0
Cümle: Forme ins Passiv um: „Du hättest ihn fragen sollen.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Er hätte von dir gefragt werden sollen.. İlk PDF'de Konjunktiv II Vergangenheit mit Modalverb açıkça çalıştırılıyor.
  - Yeni: Doğru cevap: Er hätte von dir gefragt werden sollen. Akkusativ ihn pasifte Nominativ özne er olur; aktif özne du → von dir (Dativ). Konjunktiv II Vergangenheit zinciri: hätte + Partizip II (gefragt) + werden + sollen.

#### `futur-i-17` › 0
Cümle: Forme ins Passiv um: „Man wird das Haus renovieren müssen.“

Gerekçe: Açıklama "İlk PDF'de" diye öğrenci için anlamsız bir kaynağa atıf yapıyordu; kural sade biçimde yazıldı.

- Açıklama (TR)
  - Eski: Doğru cevap: Das Haus wird renoviert werden müssen.. İlk PDF'de Futur I mit Modalverb: wird + Partizip II + werden + müssen.
  - Yeni: Doğru cevap: Das Haus wird renoviert werden müssen. Futur I'de çekimli fiil wird'dir; Akkusativ das Haus pasifte özne olur. Zincir: wird + Partizip II (renoviert) + werden + müssen.

#### `futur-i-17` › 2
Cümle: Forme ins Passiv um: „Wir werden Deutsch lernen müssen.“

Gerekçe: Açıklama yalnızca "Kaynakta / İlk PDF'de ... çalıştırılıyor" diyordu; öğrenciye kural vermiyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Deutsch wird von uns gelernt werden müssen.. Kaynakta bu tip Futur dönüşümü çalıştırılıyor.
  - Yeni: Doğru cevap: Deutsch wird von uns gelernt werden müssen. Akkusativ nesne Deutsch pasifte özne olur ve tekil olduğu için çekimli fiil wird'dir; aktif özne wir → von uns. Zincir: wird + gelernt + werden + müssen.

#### `konjunktiv-ii-vergangenheit-16` › 3
Cümle: Forme ins Passiv um: „Die Bank hätte ihm einen Kredit geben können.“

Gerekçe: Dativ öğenin başa alındığı daha doğal ve eşdeğer kelime sırası reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `ein kredit haette ihm von der bank gegeben werden koennen` / `ein kredit hätte ihm von der bank gegeben werden können`
  - Yeni: `ein kredit haette ihm von der bank gegeben werden koennen` / `ein kredit hätte ihm von der bank gegeben werden können` / `ihm hätte von der bank ein kredit gegeben werden können`

#### `master-20` › 4
Cümle: Forme ins Passiv um: „Die Bank hätte dem Kunden einen Kredit geben können.“

Gerekçe: Dativ öğenin başa alındığı daha doğal ve eşdeğer kelime sırası reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `ein kredit haette dem kunden von der bank gegeben werden koennen` / `ein kredit hätte dem kunden von der bank gegeben werden können`
  - Yeni: `ein kredit haette dem kunden von der bank gegeben werden koennen` / `ein kredit hätte dem kunden von der bank gegeben werden können` / `dem kunden hätte von der bank ein kredit gegeben werden können`

#### `aktiv-passiv-praesens-8` › 9
Cümle: Forme ins Passiv um: „Der Lieferant kann die Ware morgen bringen.“

Gerekçe: Zaman zarfının von-grubundan önce geldiği doğal ve eşdeğer kelime sırası reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `die ware kann vom lieferanten morgen gebracht werden`
  - Yeni: `die ware kann vom lieferanten morgen gebracht werden` / `die ware kann morgen vom lieferanten gebracht werden`

#### `master-20` › 0
Cümle: Forme ins Passiv um und erhalte das Tempus: „Die Techniker müssen die Anlage heute prüfen.“

Gerekçe: Zaman zarfının von-grubundan sonra geldiği eşdeğer kelime sırası reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `die anlage muss heute von den technikern geprueft werden` / `die anlage muss heute von den technikern geprüft werden`
  - Yeni: `die anlage muss heute von den technikern geprueft werden` / `die anlage muss heute von den technikern geprüft werden` / `die anlage muss von den technikern heute geprüft werden`

#### `duerfen-praesens-4` › 0
Cümle: Bilde Passiv: „Man darf hier nicht parken.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `hier darf nicht geparkt werden`
  - Yeni: `hier darf nicht geparkt werden` / `es darf hier nicht geparkt werden`

#### `duerfen-praesens-4` › 3
Cümle: Bilde Passiv: „Man darf im Museum nicht fotografieren.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `im museum darf nicht fotografiert werden`
  - Yeni: `im museum darf nicht fotografiert werden` / `es darf im museum nicht fotografiert werden`

#### `unpersoenlich-10` › 0
Cümle: Forme ins Passiv um: „Man muss hier leise arbeiten.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `hier muss leise gearbeitet werden`
  - Yeni: `hier muss leise gearbeitet werden` / `es muss hier leise gearbeitet werden`

#### `unpersoenlich-10` › 1
Cümle: Forme ins Passiv um: „Man darf im Gebäude nicht rauchen.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `im gebaeude darf nicht geraucht werden` / `im gebäude darf nicht geraucht werden`
  - Yeni: `im gebaeude darf nicht geraucht werden` / `im gebäude darf nicht geraucht werden` / `es darf im gebäude nicht geraucht werden`

#### `unpersoenlich-10` › 2
Cümle: Forme ins Passiv um: „Man kann hier gut übernachten.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `hier kann gut uebernachtet werden` / `hier kann gut übernachtet werden`
  - Yeni: `hier kann gut uebernachtet werden` / `hier kann gut übernachtet werden` / `es kann hier gut übernachtet werden`

#### `unpersoenlich-10` › 3
Cümle: Forme ins Passiv um: „Man soll nicht über andere spotten.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `ueber andere soll nicht gespottet werden` / `über andere soll nicht gespottet werden`
  - Yeni: `ueber andere soll nicht gespottet werden` / `über andere soll nicht gespottet werden` / `es soll nicht über andere gespottet werden`

#### `unpersoenlich-10` › 4
Cümle: Forme ins Passiv um: „Man muss für Gerechtigkeit kämpfen.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `fuer gerechtigkeit muss gekaempft werden` / `für gerechtigkeit muss gekämpft werden`
  - Yeni: `fuer gerechtigkeit muss gekaempft werden` / `für gerechtigkeit muss gekämpft werden` / `es muss für gerechtigkeit gekämpft werden`

#### `unpersoenlich-10` › 5
Cümle: Forme ins Passiv um: „Man darf auf dem See segeln.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `auf dem see darf gesegelt werden`
  - Yeni: `auf dem see darf gesegelt werden` / `es darf auf dem see gesegelt werden`

#### `unpersoenlich-10` › 6
Cümle: Forme ins Passiv um: „Man kann über das Problem diskutieren.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `ueber das problem kann diskutiert werden` / `über das problem kann diskutiert werden`
  - Yeni: `ueber das problem kann diskutiert werden` / `über das problem kann diskutiert werden` / `es kann über das problem diskutiert werden`

#### `unpersoenlich-10` › 7
Cümle: Forme ins Passiv um: „Man muss auf den Bus warten.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `auf den bus muss gewartet werden`
  - Yeni: `auf den bus muss gewartet werden` / `es muss auf den bus gewartet werden`

#### `unpersoenlich-10` › 8
Cümle: Forme ins Passiv um: „Man soll über die Katastrophe berichten.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `ueber die katastrophe soll berichtet werden` / `über die katastrophe soll berichtet werden`
  - Yeni: `ueber die katastrophe soll berichtet werden` / `über die katastrophe soll berichtet werden` / `es soll über die katastrophe berichtet werden`

#### `master-20` › 5
Cümle: Forme ins Passiv um: „Man wird in Zukunft mehr über das Problem diskutieren müssen.“

Gerekçe: Öznesiz pasifte birinci konum es ile de doldurulabilir; bu eşdeğer ve doğru varyant reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `in zukunft wird mehr ueber das problem diskutiert werden muessen` / `in zukunft wird mehr über das problem diskutiert werden müssen`
  - Yeni: `in zukunft wird mehr ueber das problem diskutiert werden muessen` / `in zukunft wird mehr über das problem diskutiert werden müssen` / `es wird in zukunft mehr über das problem diskutiert werden müssen`

#### `praeteritum-erkennen-11` › 0
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 1
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 2
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 3
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 4
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 5
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 6
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 7
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 8
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

#### `praeteritum-erkennen-11` › 9
Cümle: Welche Form ist im Präteritum korrekt?

Gerekçe: Şıklardan biri Präsens biçimdi ve dilbilgisel olarak doğruydu; "Welche Form ist korrekt?" sorusunda iki doğru cevap oluşuyordu. Soruya zaman bilgisi eklendi.

- Cümle
  - Eski: Welche Form ist korrekt?
  - Yeni: Welche Form ist im Präteritum korrekt?

### `data/b1/genitiv.json`

#### `eigennamen-1` › 5
Cümle: Wir warten auf ___ Zug. (Martina)

Gerekçe: Gerekçe sadece 'kaynaklardaki yapı' diyordu; kural açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Martinas. Kaynaklardaki Martinas Zug yapısında özel isim -s alır.
  - Yeni: Doğru cevap: Martinas. Artikelsiz özel isim sahibi gösterirken -s alır ve ismin önüne gelir: Martina → Martinas Zug (Martina'nın treni). Apostrof yalnızca isim s, ß, x veya z sesiyle bitiyorsa kullanılır: Thomas’ Zug.

#### `nomen-s-es-4` › 1
Cümle: die Farbe des ___ (Kleid)

Gerekçe: 'des Kleids' de Duden'e göre doğru bir Genitiv biçimi (des Kleid[e]s); çeldirici de doğruydu. Kleids yerine yanlış çoğul biçim Kleider kondu; gerekçedeki 'kaynak' ifadesi kural ile değiştirildi.

- Seçenekler
  - Eski: `Kleids` / `Kleide` / `Kleides`
  - Yeni: `Kleider` / `Kleide` / `Kleides`
- Açıklama (TR)
  - Eski: Doğru cevap: Kleides. Tek heceli “Kleid” için -es biçimi kaynaktaki örneğe uygundur.
  - Yeni: Doğru cevap: Kleides. das Kleid nötr ve tek hecelidir; Genitivde des + isim sonu -es: des Kleides. Kleider çoğul biçimdir; Kleide ise Genitiv biçimi değildir.

#### `nomen-s-es-4` › 2
Cümle: am Ende des ___ (Monat)

Gerekçe: 'des Monates' da Duden'e göre doğru (des Monat[e]s, nadir); çeldirici de doğruydu. Yanlış çoğul biçim Monate ile değiştirildi.

- Seçenekler
  - Eski: `Monates` / `Monats` / `Monat`
  - Yeni: `Monate` / `Monats` / `Monat`
- Açıklama (TR)
  - Eski: Doğru cevap: Monats. “Monat” için yaygın Genitiv “Monats”.
  - Yeni: Doğru cevap: Monats. der Monat maskulindir; Genitivde des + isim sonu -s: am Ende des Monats. Monate çoğul biçimdir, Monat ise ek almamış hâlidir.

#### `nomen-s-es-4` › 5
Cümle: der Name des ___ (Mann)

Gerekçe: 'des Manns' da sözlükte geçerli bir biçim (des Mann[e]s); gerekçe '-es gerekir' diyordu ve çeldirici de doğruydu. Manns yerine yanlış çoğul Männer kondu.

- Seçenekler
  - Eski: `Mann` / `Mannes` / `Manns`
  - Yeni: `Mann` / `Mannes` / `Männer`
- Açıklama (TR)
  - Eski: Doğru cevap: Mannes. Kaynakta “des Mannes” biçimi verilir; -es gerekir.
  - Yeni: Doğru cevap: Mannes. der Mann maskulin ve tek hecelidir; Genitivde des + isim sonu -es: der Name des Mannes. Männer çoğul biçimdir, Mann ise ek almamış hâlidir.

#### `nomen-s-es-4` › 6
Cümle: das Lachen des ___ (Kind)

Gerekçe: 'des Kinds' da sözlükte geçerli (des Kind[e]s); çeldirici de doğruydu. Kinds yerine yanlış çoğul Kinder kondu.

- Seçenekler
  - Eski: `Kindes` / `Kinds` / `Kind`
  - Yeni: `Kindes` / `Kinder` / `Kind`
- Açıklama (TR)
  - Eski: Doğru cevap: Kindes. “Kind” → Kindes.
  - Yeni: Doğru cevap: Kindes. das Kind nötr ve tek hecelidir; Genitivde des + isim sonu -es: das Lachen des Kindes. Kinder çoğul biçimdir, Kind ise ek almamış hâlidir.

#### `nomen-s-es-4` › 7
Cümle: in der Nähe des ___ (Park)

Gerekçe: Gerekçe 'kaynak kabul ediyor' diyordu; kural açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Parks. Kaynak “Parks/Parkes” kabul ediyor; burada modern kısa biçim “Parks”.
  - Yeni: Doğru cevap: Parks. der Park maskulindir; Genitivde des + isim sonu -s: in der Nähe des Parks. Parken bir Genitiv tekil biçimi değildir; ek almayan Park da yanlıştır.

#### `wegen-9` › 0
Cümle: ___ starken Regens fiel das Konzert aus.

Gerekçe: Gerekçe 'kaynakta örnek var' diyordu; wegen/während ayrımı ve Genitiv kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wegen des. Kaynakta “wegen des Regens” Genitiv örneği bulunur; maskulin/nötr artikel des.
  - Yeni: Doğru cevap: Wegen des. Konser yağmur yüzünden iptal oldu; neden bildiren edat wegen'dir ve Genitiv ister: der Regen (maskulin) → des starken Regens. Während zaman bildirir; wegen dem günlük konuşmada duyulur ama standart değildir.

#### `waehrend-10` › 0
Cümle: ___ Ferien müssen wir viel lernen. (die, Pl.)

Gerekçe: Gerekçe sadece 'kaynakta örneklenir' diyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Während der. Kaynakta “während der Ferien” doğrudan örneklenir.
  - Yeni: Doğru cevap: Während der. während (… süresince) Genitiv ister. die Ferien yalnız çoğul kullanılır; çoğul Genitiv artikeli der: während der Ferien. den Dativ, die ise Nominativ/Akkusativ biçimidir.

#### `feste-wendungen-11` › 0
Cümle: ___ Monats hat er kaum noch Geld. (der)

Gerekçe: Gerekçe sadece 'kaynakta yer alır' diyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Am Ende des. Kaynakta “Am Ende des Monats” Genitiv tamlaması yer alır.
  - Yeni: Doğru cevap: Am Ende des. „am Ende“ (sonunda) Genitiv ister; der Monat maskulin → des Monats. Am Ende dem Dativ'dir; Zum Ende der ise feminin/çoğul artikel taşır, Monat maskulindir.

#### `feste-wendungen-11` › 1
Cümle: ___ Kurses werden alle Teilnehmer begrüßt. (der)

Gerekçe: Gerekçe sadece 'kaynakta örneklenir' diyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Zu Beginn des. “zu Beginn des Kurses” kaynakta doğrudan örneklenir.
  - Yeni: Doğru cevap: Zu Beginn des. Sabit ifade „zu Beginn“ (başında) Genitiv ister; der Kurs maskulin → des Kurses. „Am Beginn“ denmez; dem ise Dativ'dir.

#### `feste-wendungen-11` › 2
Cümle: ___ Parks gibt es einen Supermarkt. (der)

Gerekçe: Gerekçe sadece 'kaynakta bulunur' diyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: In der Nähe des. “in der Nähe des Parks” Genitiv yapısı kaynakta bulunur.
  - Yeni: Doğru cevap: In der Nähe des. „in der Nähe“ (yakınında) Genitiv ister; der Park maskulin → des Parks. Burada yer (wo?) söylendiği için in der Nähe; „in die Nähe“ yön bildirir.

#### `feste-wendungen-11` › 8
Cümle: Ergänze: „___ gibt es eine kurze Pause. (in der Mitte / die Veranstaltung)“

Gerekçe: Görevde yalnız '(die Veranstaltung)' ipucu vardı; 'In der Mitte' tahmin edilemezdi (Während/Am Ende/Zu Beginn der Veranstaltung da doğru olurdu ama reddediliyordu). İpucuna 'in der Mitte' eklendi.

- Cümle
  - Eski: Ergänze: „___ gibt es eine kurze Pause. (die Veranstaltung)“
  - Yeni: Ergänze: „___ gibt es eine kurze Pause. (in der Mitte / die Veranstaltung)“
- Açıklama (TR)
  - Eski: Doğru cevap: In der Mitte der Veranstaltung. Bu genişletilmiş sahiplik/zaman tamlamasında feminin Genitiv “der Veranstaltung” gerekir.
  - Yeni: Doğru cevap: In der Mitte der Veranstaltung. „in der Mitte“ (ortasında) Genitiv ister; die Veranstaltung feminin → der Veranstaltung. Feminin isim Genitivde ek almaz.

#### `feste-wendungen-11` › 9
Cümle: Ergänze: „___ wurden die wichtigsten Punkte wiederholt. (am Ende / das Gespräch)“

Gerekçe: İpucu yalnız '(das Gespräch)' idi; 'Am Ende' tahmin edilemezdi (Während des Gesprächs da doğru ama reddediliyordu). İpucuna 'am Ende' eklendi; geçerli -es biçimi Gespräches da kabul edildi.

- Cümle
  - Eski: Ergänze: „___ wurden die wichtigsten Punkte wiederholt. (das Gespräch)“
  - Yeni: Ergänze: „___ wurden die wichtigsten Punkte wiederholt. (am Ende / das Gespräch)“
- Kabul edilen cevaplar
  - Eski: `am ende des gesprächs` / `am ende des gespraechs`
  - Yeni: `am ende des gesprächs` / `am ende des gespraechs` / `am ende des gespräches` / `am ende des gespraeches`

#### `waehrend-10` › 8
Cümle: Ergänze: „___ bleibt die Tür geschlossen. (der Unterricht)“

Gerekçe: des Unterrichtes da geçerli Genitiv biçimi (des Unterricht[e]s); reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `während des unterrichts` / `waehrend des unterrichts`
  - Yeni: `während des unterrichts` / `waehrend des unterrichts` / `während des unterrichtes` / `waehrend des unterrichtes`

#### `adjektivdeklination-12` › 8
Cümle: Ergänze vollständig: „Das ist das Büro ___ . (ein / erfahren / Anwalt)“

Gerekçe: eines erfahrenen Anwaltes da geçerli Genitiv biçimi (des Anwalt[e]s); reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `eines erfahrenen anwalts`
  - Yeni: `eines erfahrenen anwalts` / `eines erfahrenen anwaltes`

#### `satzbau-15` › 1
Cümle: Bilde den Satz: „Jens / finden / nicht / die Schraube / der Motor“

Gerekçe: Gerekçe 'kaynak yapısındaki gibi' diyordu; Genitiv ve kelime sırası açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Jens findet die Schraube des Motors nicht.. Kaynak yapısındaki gibi “die Schraube des Motors” Genitiv tamlaması kurulur.
  - Yeni: Doğru cevap: Jens findet die Schraube des Motors nicht. Vida motora aittir: der Motor (maskulin) → des Motors; Genitiv tamlaması sahip olunan ismin arkasına gelir. Çekimli findet ikinci sırada, nicht cümlenin sonunda durur.

#### `satzbau-15` › 9
Cümle: Bilde den Satz: „die Farbe / das Kleid / gefallen / mir“

Gerekçe: des Kleids da geçerli Genitiv biçimi (des Kleid[e]s); reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `die farbe des kleides gefällt mir` / `die farbe des kleides gefaellt mir`
  - Yeni: `die farbe des kleides gefällt mir` / `die farbe des kleides gefaellt mir` / `die farbe des kleids gefällt mir` / `die farbe des kleids gefaellt mir`

#### `fehlerkorrektur-16` › 0
Cümle: Korrigiere: „Das ist der Name der Mannes.“

Gerekçe: des Manns da sözlükte geçerli (des Mann[e]s); reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `das ist der name des mannes`
  - Yeni: `das ist der name des mannes` / `das ist der name des manns`

#### `fehlerkorrektur-16` › 5
Cümle: Korrigiere: „Wegen dem Regen fiel das Konzert aus.“

Gerekçe: Gerekçe 'kaynakta kullanılır' diyordu ve çift nokta vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wegen des Regens fiel das Konzert aus.. Kaynakta wegen + Genitiv “des Regens” olarak kullanılır.
  - Yeni: Doğru cevap: Wegen des Regens fiel das Konzert aus. Standart yazı dilinde wegen Genitiv ister: der Regen (maskulin) → des Regens; isim de -s alır. „wegen dem Regen“ günlük konuşmada duyulur ama standart değildir.

#### `kontext-17` › 8
Cümle: Ergänze passend: „___ konnte das Meeting nicht stattfinden. (der Stromausfall)“

Gerekçe: des Stromausfalles da geçerli Genitiv biçimi; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `wegen des stromausfalls`
  - Yeni: `wegen des stromausfalls` / `wegen des stromausfalles`

#### `umformungen-18` › 6
Cümle: Forme mit „wegen“: „Es regnete stark. Deshalb fiel das Spiel aus.“

Gerekçe: 'Wegen starken Regens' (artikelsiz, sıfat -s ile Genitiv) da doğru ve aynı anlamda; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `wegen des starken regens fiel das spiel aus`
  - Yeni: `wegen des starken regens fiel das spiel aus` / `wegen starken regens fiel das spiel aus`

#### `umformungen-18` › 8
Cümle: Forme nominal um: „Während wir zu Mittag aßen, wurde nicht gesprochen.“

Gerekçe: Gerekçe 'kaynak örneğindeki gibi' diyordu ve çift nokta vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Während des Essens wurde nicht gesprochen.. Kaynak örneğindeki gibi eylem isimleştirilip “während des Essens” yapılır.
  - Yeni: Doğru cevap: Während des Essens wurde nicht gesprochen. Yan cümle „während wir zu Mittag aßen“ isimleştirilir: essen → das Essen; während + Genitiv → des Essens. Böylece özne wir ve çekimli aßen kalkar.

#### `umformungen-18` › 9
Cümle: Forme in den Genitiv um: „In der Nähe von dem Park gibt es einen Supermarkt.“

Gerekçe: des Parkes da (nadir) geçerli Genitiv biçimi; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `in der nähe des parks gibt es einen supermarkt` / `in der naehe des parks gibt es einen supermarkt`
  - Yeni: `in der nähe des parks gibt es einen supermarkt` / `in der naehe des parks gibt es einen supermarkt` / `in der nähe des parkes gibt es einen supermarkt` / `in der naehe des parkes gibt es einen supermarkt`

#### `master-20` › 1
Cümle: ___ wurde die Straße gesperrt. (die schweren Bauarbeiten)

Gerekçe: 'Während der schweren Bauarbeiten wurde die Straße gesperrt' de dilbilgisi ve anlam olarak doğruydu (yol inşaat sırasında kapatıldı); cümlede neden ipucu yok. Çeldirici yanlış artikelli 'Wegen des schweren Bauarbeiten' ile değiştirildi.

- Seçenekler
  - Eski: `Wegen den schweren Bauarbeiten` / `Während der schweren Bauarbeiten` / `Wegen der schweren Bauarbeiten`
  - Yeni: `Wegen den schweren Bauarbeiten` / `Wegen des schweren Bauarbeiten` / `Wegen der schweren Bauarbeiten`
- Açıklama (TR)
  - Eski: Doğru cevap: Wegen der schweren Bauarbeiten. Neden bildirildiği için wegen; çoğul Genitiv der.
  - Yeni: Doğru cevap: Wegen der schweren Bauarbeiten. die Bauarbeiten çoğuldur; wegen + çoğul Genitiv artikeli der, sıfat -en alır: der schweren Bauarbeiten. den Dativ çoğuldur; des yalnız maskulin/nötr tekilde kullanılır.

#### `master-20` › 5
Cümle: Forme um: „die Telefonnummer von Frau Müller“

Gerekçe: Gerekçe sadece 'kaynakta verilir' diyordu.

- Açıklama (TR)
  - Eski: Doğru cevap: Frau Müllers Telefonnummer. Kaynakta özel isimli sahiplik “Frau Müllers Telefonnummer” biçiminde verilir.
  - Yeni: Doğru cevap: Frau Müllers Telefonnummer. Unvan + soyadı artikelsiz kullanıldığında soyadı -s alır ve tamlama ismin önüne geçer: Frau Müllers Telefonnummer. -s olmadan (Frau Müller Telefonnummer) sahiplik gösterilmez.

#### `master-20` › 8
Cümle: Bilde einen vollständigen Satz: „wegen / unser / neu / Projekt / müssen / wir / länger arbeiten“

Gerekçe: unseres neuen Projektes da geçerli Genitiv biçimi; reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `wegen unseres neuen projekts müssen wir länger arbeiten` / `wegen unseres neuen projekts muessen wir laenger arbeiten`
  - Yeni: `wegen unseres neuen projekts müssen wir länger arbeiten` / `wegen unseres neuen projekts muessen wir laenger arbeiten` / `wegen unseres neuen projektes müssen wir länger arbeiten` / `wegen unseres neuen projektes muessen wir laenger arbeiten`

### `data/b1/indirekte-fragen.json`

#### `wortstellung-5` › 3
Cümle: Welcher Satz ist richtig?

Gerekçe: Açıklama soru kelimesini eksik veriyordu: dolaylı soruyu tek başına 'wie' değil, 'wie viel' bağlar.

- Açıklama (TR)
  - Eski: Dolaylı bölüm “wie viel das kostet” olarak kuruluyor. Başındaki wie soruyu bağlar; çekimli kostet fiili sonda olmalıdır. “Wissen Sie” girişinin fiil sırası değiştirilmez. Doğru cevap: Wissen Sie, wie viel das kostet?
  - Yeni: Dolaylı bölüm “wie viel das kostet” olarak kuruluyor. Başındaki wie viel soruyu bağlar; çekimli kostet fiili sonda olmalıdır. “Wissen Sie” girişinin fiil sırası değiştirilmez. Doğru cevap: Wissen Sie, wie viel das kostet?

#### `hoeflich-fragen-9` › 2
Cümle: Im Geschäft: Wie viel kostet die Jacke?

Gerekçe: Açıklama soru kelimesini eksik veriyordu: dolaylı soruyu tek başına 'wie' değil, 'wie viel' bağlar.

- Açıklama (TR)
  - Eski: Dolaylı bölüm “wie viel die Jacke kostet” olarak kuruluyor. Başındaki wie soruyu bağlar; çekimli kostet fiili sonda olmalıdır. “Könnten Sie mir sagen” girişinin fiil sırası değiştirilmez. Doğru cevap: Könnten Sie mir sagen, wie viel die Jacke kostet?
  - Yeni: Dolaylı bölüm “wie viel die Jacke kostet” olarak kuruluyor. Başındaki wie viel soruyu bağlar; çekimli kostet fiili sonda olmalıdır. “Könnten Sie mir sagen” girişinin fiil sırası değiştirilmez. Doğru cevap: Könnten Sie mir sagen, wie viel die Jacke kostet?

#### `fehler-korrigieren-10` › 7
Cümle: Sie möchte wissen, wie viel kostet das Ticket.

Gerekçe: Açıklama soru kelimesini eksik veriyordu: dolaylı soruyu tek başına 'wie' değil, 'wie viel' bağlar.

- Açıklama (TR)
  - Eski: Dolaylı bölüm “wie viel das Ticket kostet” olarak kuruluyor. Başındaki wie soruyu bağlar; çekimli kostet fiili sonda olmalıdır. “Sie möchte wissen” girişinin fiil sırası değiştirilmez. Doğru cevap: Sie möchte wissen, wie viel das Ticket kostet.
  - Yeni: Dolaylı bölüm “wie viel das Ticket kostet” olarak kuruluyor. Başındaki wie viel soruyu bağlar; çekimli kostet fiili sonda olmalıdır. “Sie möchte wissen” girişinin fiil sırası değiştirilmez. Doğru cevap: Sie möchte wissen, wie viel das Ticket kostet.

#### `hoeflich-fragen-9` › 8
Cümle: Im Kursbüro: Wie lange dauert der Kurs?

Gerekçe: Açıklama soru kelimesini eksik veriyordu: dolaylı soruyu tek başına 'wie' değil, 'wie lange' bağlar.

- Açıklama (TR)
  - Eski: Dolaylı bölüm “wie lange der Kurs dauert” olarak kuruluyor. Başındaki wie soruyu bağlar; çekimli dauert fiili sonda olmalıdır. “Könnten Sie mir sagen” girişinin fiil sırası değiştirilmez. Doğru cevap: Könnten Sie mir sagen, wie lange der Kurs dauert?
  - Yeni: Dolaylı bölüm “wie lange der Kurs dauert” olarak kuruluyor. Başındaki wie lange soruyu bağlar; çekimli dauert fiili sonda olmalıdır. “Könnten Sie mir sagen” girişinin fiil sırası değiştirilmez. Doğru cevap: Könnten Sie mir sagen, wie lange der Kurs dauert?

#### `schreibtraining-12` › 7
Cümle: Wie lange dauert die Fahrt? → Beginne: „Wissen Sie, …“

Gerekçe: Açıklama soru kelimesini eksik veriyordu: dolaylı soruyu tek başına 'wie' değil, 'wie lange' bağlar.

- Açıklama (TR)
  - Eski: Dolaylı bölüm “wie lange die Fahrt dauert” olarak kuruluyor. Başındaki wie soruyu bağlar; çekimli dauert fiili sonda olmalıdır. “Wissen Sie” girişinin fiil sırası değiştirilmez. Doğru cevap: Wissen Sie, wie lange die Fahrt dauert?
  - Yeni: Dolaylı bölüm “wie lange die Fahrt dauert” olarak kuruluyor. Başındaki wie lange soruyu bağlar; çekimli dauert fiili sonda olmalıdır. “Wissen Sie” girişinin fiil sırası değiştirilmez. Doğru cevap: Wissen Sie, wie lange die Fahrt dauert?

#### `schreibtraining-12` › 5
Cümle: Mit wem hat Anna gesprochen? → Beginne: „Ich weiß nicht, …“

Gerekçe: Açıklama soru kelimesini eksik veriyordu: dolaylı soruyu tek başına 'mit' değil, 'mit wem' bağlar.

- Açıklama (TR)
  - Eski: Dolaylı bölüm “mit wem Anna gesprochen hat” olarak kuruluyor. Başındaki mit soruyu bağlar; çekimli hat fiili sonda olmalıdır. “Ich weiß nicht” girişinin fiil sırası değiştirilmez. Doğru cevap: Ich weiß nicht, mit wem Anna gesprochen hat.
  - Yeni: Dolaylı bölüm “mit wem Anna gesprochen hat” olarak kuruluyor. Başındaki mit wem soruyu bağlar; çekimli hat fiili sonda olmalıdır. “Ich weiß nicht” girişinin fiil sırası değiştirilmez. Doğru cevap: Ich weiß nicht, mit wem Anna gesprochen hat.

#### `ob-dass-wenn-4` › 2
Cümle: ___ er heute kommt, essen wir zusammen. (Bedingung)

Gerekçe: Alıntılanan cümle küçük harfle başlıyordu; cümle başındaki Wenn büyük yazılır.

- Açıklama (TR)
  - Eski: “wenn er heute kommt, essen wir zusammen.” ifadesinde koşul ya da gerçekleşme zamanı belirtiliyor; bu yüzden wenn seçilir. ob bilgiye soru yöneltir, dass içeriği aktarır, wenn ise koşul/zaman ilişkisi kurar. Doğru cevap: wenn
  - Yeni: “Wenn er heute kommt, essen wir zusammen.” ifadesinde koşul ya da gerçekleşme zamanı belirtiliyor; bu yüzden wenn seçilir. ob bilgiye soru yöneltir, dass içeriği aktarır, wenn ise koşul/zaman ilişkisi kurar. Doğru cevap: wenn

#### `ob-dass-wenn-4` › 5
Cümle: ___ der Laden offen ist, kaufe ich Brot. (Bedingung)

Gerekçe: Alıntılanan cümle küçük harfle başlıyordu; cümle başındaki Wenn büyük yazılır.

- Açıklama (TR)
  - Eski: “wenn der Laden offen ist, kaufe ich Brot.” ifadesinde koşul ya da gerçekleşme zamanı belirtiliyor; bu yüzden wenn seçilir. ob bilgiye soru yöneltir, dass içeriği aktarır, wenn ise koşul/zaman ilişkisi kurar. Doğru cevap: wenn
  - Yeni: “Wenn der Laden offen ist, kaufe ich Brot.” ifadesinde koşul ya da gerçekleşme zamanı belirtiliyor; bu yüzden wenn seçilir. ob bilgiye soru yöneltir, dass içeriği aktarır, wenn ise koşul/zaman ilişkisi kurar. Doğru cevap: wenn

### `data/b1/infinitiv-zu.json`

#### `verben-2` › 1
Cümle: Wir ___, das Problem ohne externe Hilfe zu lösen.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: versuchen. “versuchen, ... zu ...” kaynaklarda temel Infinitivsatz kalıplarındandır.
  - Yeni: Doğru cevap: versuchen. „versuchen, ... zu + Infinitiv“: deneyen ve problemi çözecek olan aynı kişiler (wir); bu yüzden Infinitivsatz'ta özne tekrar yazılmaz: das Problem ohne externe Hilfe zu lösen.

#### `verben-2` › 4
Cümle: Sie ___, im Sommer nach Kanada zu ziehen.

Gerekçe: 'Sie zwingt uns, im Sommer nach Kanada zu ziehen' de doğru bir cümleydi (iki doğru şık). Çeldirici, zu almayan modal 'möchte' ile değiştirildi; gerekçe kuralla yazıldı.

- Seçenekler
  - Eski: `ist verboten` / `zwingt uns` / `hat vor`
  - Yeni: `ist verboten` / `möchte` / `hat vor`
- Açıklama (TR)
  - Eski: Doğru cevap: hat vor. “vorhaben, ... zu ...” kaynakta doğrudan işlenen yapılardandır.
  - Yeni: Doğru cevap: hat vor. vorhaben ayrılabilen fiildir: Sie hat ... vor; planlanan eylem Infinitivsatz olur: im Sommer nach Kanada zu ziehen. möchte gibi modal fiiller zu'lu Infinitivsatz almaz (Sie möchte nach Kanada ziehen).

#### `verben-2` › 5
Cümle: Wir ___, die Sitzung um eine Stunde zu verschieben.

Gerekçe: 'Wir bitten ihn, die Sitzung um eine Stunde zu verschieben' de doğru bir cümleydi (iki doğru şık). Çeldirici, zu almayan modal 'wollen' ile değiştirildi.

- Seçenekler
  - Eski: `sind verboten` / `überlegen` / `bitten ihn`
  - Yeni: `sind verboten` / `überlegen` / `wollen`
- Açıklama (TR)
  - Eski: Doğru cevap: überlegen. “überlegen, ... zu ...” düşünme/planlama eylemini Infinitivsatzla bağlar.
  - Yeni: Doğru cevap: überlegen. „überlegen, ... zu ...“: düşünen ve toplantıyı erteleyecek olan aynı kişiler (wir). wollen modal fiildir ve zu'suz Infinitiv alır (Wir wollen die Sitzung verschieben); sind verboten ise wir öznesiyle kurulamaz.

#### `verben-2` › 6
Cümle: Der Anbieter ___ mir an, die Lieferung kostenlos zu ersetzen.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: bietet. “jemandem anbieten, ... zu ...” kaynakta Infinitivsatz dönüşümüyle kullanılır.
  - Yeni: Doğru cevap: bietet. anbieten ayrılabilen fiildir: Der Anbieter bietet mir ... an. Teklif edilen eylem Infinitivsatz ile gelir: die Lieferung kostenlos zu ersetzen. hoffen ve zwingen 'an' ön ekiyle kullanılmaz.

#### `verben-2` › 7
Cümle: Sie ___ vor zwei Monaten aufgehört, nachts zu arbeiten.

Gerekçe: Boşluk yardımcı fiili soruyordu ama gerekçe yalnız 'kaynakta tetikleyici' diyordu; haben/sein seçimi açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: hat. “aufhören, ... zu ...” kaynakta temel tetikleyici yapılardandır.
  - Yeni: Doğru cevap: hat. aufhören Perfekt'i haben ile kurar: Sie hat aufgehört. Bırakılan eylem Infinitivsatz olur: nachts zu arbeiten. ist (sein) ve wird (werden) burada Perfekt yardımcı fiili olamaz.

#### `verben-2` › 9
Cümle: Verbinde: „Wir wollen das Problem lösen. Wir versuchen es.“

Gerekçe: Gerekçe 'kaynak mantığında' diyordu ve çift nokta vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir versuchen, das Problem zu lösen.. Kaynak mantığında modal ifade ve “es” dönüşüm sırasında düşer; ana fiil Infinitivsatz'a geçer.
  - Yeni: Doğru cevap: Wir versuchen, das Problem zu lösen. İkinci cümledeki es ilk cümlenin içeriğini (das Problem lösen) gösterir. Birleştirince es ve tekrar eden özne wir düşer; wollen'in anlamı versuchen içinde kalır, fiil zu lösen olur.

#### `ausdruecke-3` › 1
Cümle: Es ist hier ___, private Dateien auf dem Firmencomputer zu speichern.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: verboten. “Es ist verboten, ... zu ...” kaynakta doğrudan Infinitivsatz örneği olarak bulunur.
  - Yeni: Doğru cevap: verboten. „Es ist verboten, ... zu ...“: neyin yasak olduğunu Infinitivsatz söyler: private Dateien ... zu speichern. Kimin yaptığı belirtilmez; genel bir kuraldır.

#### `ausdruecke-3` › 2
Cümle: Viele halten es für ___, den ganzen Bericht heute noch zu lesen.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: unmöglich. “etwas für unmöglich halten, ... zu ...” kaynakta Infinitivsatz dönüşüm kalıbıdır.
  - Yeni: Doğru cevap: unmöglich. „etwas für unmöglich halten“ (bir şeyi imkânsız saymak); es sonraki Infinitivsatz'ı gösterir: Viele halten es für unmöglich, den ganzen Bericht heute noch zu lesen.

#### `ausdruecke-3` › 4
Cümle: Es ist mir ___, vor so vielen Leuten sprechen zu müssen.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: peinlich. Kaynakta “jemandem peinlich sein, ...” Infinitivsatzla kullanılır.
  - Yeni: Doğru cevap: peinlich. „jemandem peinlich sein“ (birini utandırmak): Es ist mir peinlich, ... Infinitivsatz'ta modal fiil varsa zu modal fiilin önüne gelir: sprechen zu müssen.

#### `ausdruecke-3` › 6
Cümle: Ich habe keine ___, heute Abend noch einkaufen zu gehen.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Zeit. “keine Zeit haben, ... zu ...” kaynakta işlenen yapılardandır.
  - Yeni: Doğru cevap: Zeit. „keine Zeit haben, ... zu ...“: zamanı olmayan ve alışverişe gidecek kişi aynı (ich); bu yüzden özne yazılmaz: heute Abend noch einkaufen zu gehen.

#### `ausdruecke-3` › 7
Cümle: Es gibt keinen ___, sich wegen eines kleinen Fehlers so zu ärgern.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Grund. “Es gibt keinen Grund, sich zu ...” kaynak çözümünde yer alır.
  - Yeni: Doğru cevap: Grund. „Es gibt keinen Grund, ... zu ...“ (… için bir sebep yok). Dönüşlü sich ärgern Infinitivsatz'ta da sich ile kalır: sich ... so zu ärgern.

#### `ausdruecke-3` › 8
Cümle: Verbinde: „Es ist nicht nötig. Du bleibst heute länger.“

Gerekçe: Gerekçe 'aynı eylem kişisine sahip' diyordu; ana cümlede kişi yok, du düşüyor.

- Açıklama (TR)
  - Eski: Doğru cevap: Es ist nicht nötig, heute länger zu bleiben.. “Es ist nicht nötig, ... zu ...” aynı eylem kişisine sahip Infinitivsatz kurar.
  - Yeni: Doğru cevap: Es ist nicht nötig, heute länger zu bleiben. „Es ist nicht nötig, ... zu ...“ kalıbında yapacak kişi ayrıca yazılmaz; du öznesi ve çekimli bleibst düşer, fiil zu bleiben olur.

#### `ausdruecke-3` › 9
Cümle: Verbinde: „Ich finde es interessant. Ich lerne gerade Koreanisch.“

Gerekçe: Orijinal cümledeki 'gerade' korunarak yazılan doğru cevap reddediliyordu.

- Kabul edilen cevaplar
  - Eski: `ich finde es interessant koreanisch zu lernen` / `ich finde es interessant, koreanisch zu lernen`
  - Yeni: `ich finde es interessant koreanisch zu lernen` / `ich finde es interessant, koreanisch zu lernen` / `ich finde es interessant gerade koreanisch zu lernen` / `ich finde es interessant, gerade koreanisch zu lernen`

#### `trennbare-verben-4` › 7
Cümle: Kannst du mir helfen, den Drucker ___? (anschließen)

Gerekçe: 'Kannst du mir helfen ...' bir soru cümlesi; sonunda nokta değil soru işareti olmalı.

- Cümle
  - Eski: Kannst du mir helfen, den Drucker ___. (anschließen)
  - Yeni: Kannst du mir helfen, den Drucker ___? (anschließen)

#### `personenbezug-6` › 2
Cümle: Kann man direkt in einen Infinitivsatz umformen? „Mia glaubt, dass ihr Bruder morgen kommt.“

Gerekçe: Gerekçede 'kaynak kuralına göre' ifadesi vardı; yanlış şıkkın anlamı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Nein. Eylemi yapan kişi Mia değil, kardeşidir; kaynak kuralına göre aynı kişi ilişkisi yoksa doğrudan Infinitivsatz yapılamaz.
  - Yeni: Doğru cevap: Nein. Gelecek kişi Mia değil, kardeşi (ihr Bruder). Ana cümlenin öznesi (Mia) ile yan cümlenin öznesi farklı olduğu için öznesiz Infinitivsatz kurulamaz. „Mia glaubt, morgen zu kommen“ Mia'nın kendisinin geleceği anlamına gelir.

#### `korrelate-9` › 0
Cümle: Ich freue mich ___, dich bald wiederzusehen.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: darauf. Kaynakta “sich darauf freuen, ... zu ...” kalıbı kullanılır.
  - Yeni: Doğru cevap: darauf. „sich auf etwas freuen“ (ileride olacak bir şeyi sevinçle beklemek): auf + es = darauf. Infinitivsatz bu darauf'u açıklar: dich bald wiederzusehen.

#### `korrelate-9` › 1
Cümle: Sie hat Angst ___, ihren Arbeitsplatz zu verlieren.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: davor. “Angst davor haben, ... zu ...” kaynakta yer alan kalıptır.
  - Yeni: Doğru cevap: davor. „Angst vor etwas haben“: vor + es = davor. Korkulan şeyi Infinitivsatz söyler: ihren Arbeitsplatz zu verlieren.

#### `korrelate-9` › 3
Cümle: Die Firma zwingt uns ___, jeden Schritt zu dokumentieren.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: dazu. “jemanden dazu zwingen, ... zu ...” kaynakta kullanılır.
  - Yeni: Doğru cevap: dazu. „jemanden zu etwas zwingen“: zu + es = dazu. Zorlanan eylemi Infinitivsatz söyler: jeden Schritt zu dokumentieren.

#### `korrelate-9` › 4
Cümle: Er ist ___ überzeugt, die richtige Entscheidung getroffen zu haben.

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: davon. “davon überzeugt sein, ... zu ...” kaynakta işlenir.
  - Yeni: Doğru cevap: davon. „von etwas überzeugt sein“: von + es = davon. Neye inandığını Infinitivsatz söyler: die richtige Entscheidung getroffen zu haben.

#### `umstrukturierung-10` › 0
Cümle: Welche Umformung ist korrekt? „Mira will weniger Zucker essen. Sie versucht es.“

Gerekçe: Gerekçe 'kaynakta benzer dönüşüm' diyordu ve çift nokta vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Mira versucht, weniger Zucker zu essen.. Kaynakta benzer dönüşümde modal fiil ve “es” düşer; asıl eylem zu-Infinitiv olur.
  - Yeni: Doğru cevap: Mira versucht, weniger Zucker zu essen. İkinci cümledeki es ilk cümlenin içeriğini gösterir. Birleştirince tekrar eden özne sie düşer; will'in istek anlamı versuchen içinde kalır, asıl eylem zu essen olur. „essen zu wollen“ gereksizdir.

#### `umstrukturierung-10` › 1
Cümle: Welche Umformung ist korrekt? „Tom möchte im Sommer umziehen. Das hat er vor.“

Gerekçe: Gerekçe 'kaynak çözüm mantığında' diyordu ve çift nokta vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Tom hat vor, im Sommer umzuziehen.. Kaynak çözüm mantığında “Das” düşer, modal istek ana eyleme dönüşür.
  - Yeni: Doğru cevap: Tom hat vor, im Sommer umzuziehen. Das ilk cümlenin içeriğini gösterir ve birleştirince düşer. möchte'nin anlamı vorhaben içinde kalır; umziehen ayrılabilir olduğu için umzuziehen. İkinci özne (er) yazılmaz.

#### `umstrukturierung-10` › 5
Cümle: Welche Variante ist richtig?

Gerekçe: Gerekçe anlamsız bir 'kaynakta yapısal değişim' cümlesiydi; müssen'in neden korunduğu ve yeri açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Wir hoffen, den Termin nicht noch einmal verschieben zu müssen.. Kaynakta modal unsurların dönüşümde yapısal değişimi gösterilir; burada infinitiv grubu anlamı korur.
  - Yeni: Doğru cevap: Wir hoffen, den Termin nicht noch einmal verschieben zu müssen. Burada müssen anlamın parçasıdır (bir daha ertelemek zorunda kalmamak), bu yüzden korunur. Modal fiil Infinitivsatz'ın sonuna gelir, zu onun önünde durur: verschieben zu müssen.

#### `passiv-infinitiv-11` › 0
Cümle: Sie bittet darum, nicht ___ . (versetzen, Passiv)

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: versetzt zu werden. Kaynakta Passiv Infinitiv “nicht versetzt zu werden” biçiminde verilir.
  - Yeni: Doğru cevap: versetzt zu werden. Kişi başka bir yere gönderilmek istemiyor; eylemi o yapmıyor, ona yapılıyor → Passiv. Passiv Infinitiv: Partizip II + zu werden: nicht versetzt zu werden.

#### `passiv-infinitiv-11` › 7
Cümle: Es wäre peinlich, vor allen anderen ___ . (kritisieren, Passiv)

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: kritisiert zu werden. Kaynakta “peinlich” + Passiv Infinitiv örneği vardır.
  - Yeni: Doğru cevap: kritisiert zu werden. Eleştiren başkalarıdır, eleştirilen kişi öznedir → Passiv Infinitiv: Partizip II (kritisiert) + zu werden.

#### `perfekt-haben-12` › 0
Cümle: Ich bin froh, die Prüfung ___ . (bestehen)

Gerekçe: Gerekçede 'Kaynak kuralı' ifadesi vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: bestanden zu haben. Kaynak kuralı: Perfekt Infinitiv = Partizip II + zu + haben/sein; bestehen haben ile kurulur.
  - Yeni: Doğru cevap: bestanden zu haben. Kural: Perfekt Infinitiv = Partizip II + zu + haben/sein. bestehen Perfekt'te haben alır (ich habe bestanden), bu yüzden bestanden zu haben.

#### `perfekt-haben-12` › 8
Cümle: Bilde: „vorbereiten“ → Perfektinfinitiv

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: vorbereitet zu haben. Kaynakta vorbereiten için “vorbereitet zu haben” yapısı kullanılır.
  - Yeni: Doğru cevap: vorbereitet zu haben. vorbereiten Perfekt'te haben alır (ich habe vorbereitet). Kök bereiten be- ön eklidir, bu yüzden Partizip II'de ge- almaz: vorbereitet zu haben.

#### `perfekt-sein-13` › 1
Cümle: Sie bereut nicht, nach Hamburg ___ . (ziehen)

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: gezogen zu sein. Kaynakta ziehen için “gezogen zu sein” kullanılır.
  - Yeni: Doğru cevap: gezogen zu sein. ziehen burada taşınmak (yer değiştirmek) anlamındadır ve Perfekt'te sein alır: Sie ist nach Hamburg gezogen → gezogen zu sein.

#### `perfekt-sein-13` › 4
Cümle: Ich finde es schön, mit dem Zug nach Prag ___ . (fahren)

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: gefahren zu sein. Kaynakta fahren için “gefahren zu sein” örneği bulunur.
  - Yeni: Doğru cevap: gefahren zu sein. fahren burada hareket bildirir (nach Prag) ve Perfekt'te sein alır: Ich bin nach Prag gefahren → gefahren zu sein.

#### `perfekt-mix-14` › 4
Cümle: Ich finde es schön, das Festival ___ .

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: besucht zu haben. besuchen Perfektte haben alır; kaynakta bu yapı bulunur.
  - Yeni: Doğru cevap: besucht zu haben. besuchen Akkusativ nesne (das Festival) alan bir fiildir ve Perfekt'te haben alır: Ich habe das Festival besucht → besucht zu haben.

#### `perfekt-mix-14` › 5
Cümle: Sie ist froh, nach langer Pause wieder Skateboard ___ .

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: gefahren zu sein. Kaynakta “Skateboard gefahren zu sein” örneği vardır.
  - Yeni: Doğru cevap: gefahren zu sein. Skateboard fahren bir hareket bildirir; Perfekt'te sein alır: Sie ist Skateboard gefahren → gefahren zu sein.

#### `perfekt-mix-14` › 7
Cümle: Er ist froh, aus dem Krankenhaus ___ .

Gerekçe: Gerekçe 'kaynakların mantığının birleşimi' diyordu; neden Passiv olduğu ve yanlış şıkların anlamı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: entlassen worden zu sein. Bu pasif tamamlanmış durum “worden zu sein” ile kurulur; yapı kaynakların Passiv ve Perfekt Infinitiv mantığının birleşimidir.
  - Yeni: Doğru cevap: entlassen worden zu sein. Onu hastaneden başkaları taburcu etti; eylemi o yapmadı → Passiv. Tamamlanmış Passiv (Er ist entlassen worden) Infinitivde: Partizip II + worden + zu sein. „entlassen zu haben“ onun başka birini taburcu ettiği anlamına gelir.

#### `komma-16` › 0
Cümle: Welche Schreibweise ist korrekt?

Gerekçe: Virgülsüz 'Ich habe vor morgen früher zu gehen.' de resmî yazım kurallarına göre doğru (gösterici kelime yoksa virgül isteğe bağlı); çeldirici de doğruydu. Kesin yanlış bir virgül yeriyle değiştirildi; gerekçe 'kaynak çalışma kağıdı' diyordu.

- Seçenekler
  - Eski: `Ich habe vor, morgen früher zu gehen.` / `Ich habe vor morgen, früher zu gehen.` / `Ich habe vor morgen früher zu gehen.`
  - Yeni: `Ich habe vor, morgen früher zu gehen.` / `Ich habe vor morgen, früher zu gehen.` / `Ich habe vor morgen früher, zu gehen.`
- Açıklama (TR)
  - Eski: Doğru cevap: Ich habe vor, morgen früher zu gehen.. Kaynak B1 çalışma kağıdı Infinitivsätze'de virgülü özellikle hatırlatır; ana cümle ile Infinitivsatz ayrılır.
  - Yeni: Doğru cevap: Ich habe vor, morgen früher zu gehen. Virgül ana cümle (Ich habe vor) ile Infinitivsatz'ın tamamı (morgen früher zu gehen) arasına gelir; Infinitivsatz'ın içine konmaz. Burada virgül önerilir, yoksa „vor morgen“ birlikte okunabilir.

#### `komma-16` › 1
Cümle: Welche Schreibweise ist korrekt?

Gerekçe: Gerekçe 'bu alıştırma formatında' diyordu; virgülün neden zorunlu olduğu açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Es ist wichtig, die Datei zu speichern.. Bu alıştırma formatında Infinitivsatz virgülle ayrılır.
  - Yeni: Doğru cevap: Es ist wichtig, die Datei zu speichern. Baştaki es sonraki Infinitivsatz'ı gösterir; böyle bir gösterici kelime (es, darauf, davor …) varsa virgül zorunludur. Virgül die Datei'nin önüne gelir, çünkü die Datei Infinitivsatz'ın nesnesidir.

#### `komma-16` › 3
Cümle: Welche Schreibweise ist korrekt?

Gerekçe: Virgülsüz 'Sie bittet mich die Tür zu schließen.' de resmî kurallara göre doğru (virgül isteğe bağlı); çeldirici de doğruydu. Kesin yanlış bir virgül yeriyle değiştirildi.

- Seçenekler
  - Eski: `Sie bittet mich, die Tür zu schließen.` / `Sie bittet mich die Tür, zu schließen.` / `Sie bittet mich die Tür zu schließen.`
  - Yeni: `Sie bittet mich, die Tür zu schließen.` / `Sie bittet mich die Tür, zu schließen.` / `Sie bittet, mich die Tür zu schließen.`
- Açıklama (TR)
  - Eski: Doğru cevap: Sie bittet mich, die Tür zu schließen.. Ana fiil + nesne ardından Infinitivsatz virgülle ayrılır.
  - Yeni: Doğru cevap: Sie bittet mich, die Tür zu schließen. mich ana cümledeki bitten fiilinin nesnesidir; virgül ondan sonra, Infinitivsatz (die Tür zu schließen) başlamadan önce gelir. Virgül bir grubun içine konmaz (die Tür, zu schließen yanlış).

#### `komma-16` › 6
Cümle: Welche Schreibweise ist korrekt?

Gerekçe: Virgülsüz 'Wir versuchen das Problem heute zu lösen.' de resmî kurallara göre doğru (virgül isteğe bağlı); çeldirici de doğruydu. Kesin yanlış bir virgül yeriyle değiştirildi; gerekçe 'bu paket kaynakların modelini izler' diyordu.

- Seçenekler
  - Eski: `Wir versuchen, das Problem heute zu lösen.` / `Wir versuchen das Problem, heute zu lösen.` / `Wir versuchen das Problem heute zu lösen.`
  - Yeni: `Wir versuchen, das Problem heute zu lösen.` / `Wir versuchen das Problem, heute zu lösen.` / `Wir versuchen das Problem heute, zu lösen.`
- Açıklama (TR)
  - Eski: Doğru cevap: Wir versuchen, das Problem heute zu lösen.. Bu paket kaynakların noktalama modelini izler ve virgülü kullanır.
  - Yeni: Doğru cevap: Wir versuchen, das Problem heute zu lösen. Virgül ana cümle (Wir versuchen) ile Infinitivsatz'ın tamamı (das Problem heute zu lösen) arasına gelir; Infinitivsatz'ın içine virgül konmaz.

#### `komma-16` › 7
Cümle: Welche Schreibweise ist korrekt?

Gerekçe: Virgülsüz 'Sie ist froh die Prüfung bestanden zu haben.' de resmî kurallara göre doğru (virgül isteğe bağlı); çeldirici de doğruydu. Kesin yanlış bir virgül yeriyle değiştirildi.

- Seçenekler
  - Eski: `Sie ist froh die Prüfung, bestanden zu haben.` / `Sie ist froh die Prüfung bestanden zu haben.` / `Sie ist froh, die Prüfung bestanden zu haben.`
  - Yeni: `Sie ist froh die Prüfung, bestanden zu haben.` / `Sie ist froh die Prüfung bestanden, zu haben.` / `Sie ist froh, die Prüfung bestanden zu haben.`
- Açıklama (TR)
  - Eski: Doğru cevap: Sie ist froh, die Prüfung bestanden zu haben.. Perfekt Infinitivsatz da aynı şekilde ana cümleden virgülle ayrılır.
  - Yeni: Doğru cevap: Sie ist froh, die Prüfung bestanden zu haben. Perfekt Infinitivsatz tek bir bütündür: die Prüfung bestanden zu haben. Virgül froh'tan sonra, bu bütünün önüne gelir; grubun içine konmaz.

#### `komma-16` › 8
Cümle: Setze das Komma: „Ich habe vor morgen länger zu arbeiten.“

Gerekçe: Gerekçede çift nokta vardı; virgülün yeri ve nedeni netleştirildi.

- Açıklama (TR)
  - Eski: Doğru cevap: Ich habe vor, morgen länger zu arbeiten.. Infinitivsatz “morgen länger zu arbeiten” ana yapıdan virgülle ayrılır.
  - Yeni: Doğru cevap: Ich habe vor, morgen länger zu arbeiten. Virgül ana cümle (Ich habe vor) ile Infinitivsatz (morgen länger zu arbeiten) arasına gelir. Burada virgül özellikle önerilir; yoksa „vor morgen“ birlikte okunabilir.

#### `saetze-verbinden-17` › 1
Cümle: Verbinde: „Mara will weniger arbeiten. Sie versucht es.“

Gerekçe: Gerekçe 'kaynak mantığında' diyordu ve çift nokta vardı.

- Açıklama (TR)
  - Eski: Doğru cevap: Mara versucht, weniger zu arbeiten.. Kaynak mantığında modal ifade ve “es” düşer.
  - Yeni: Doğru cevap: Mara versucht, weniger zu arbeiten. İkinci cümledeki es ilk cümleyi gösterir; birleştirince es ve tekrar eden özne sie düşer, will'in anlamı versuchen içinde kalır: weniger zu arbeiten.

#### `saetze-verbinden-17` › 4
Cümle: Verbinde: „Lea möchte nicht in eine andere Abteilung versetzt werden. Darum bittet sie ihren Chef.“

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Lea bittet ihren Chef darum, nicht in eine andere Abteilung versetzt zu werden.. Kaynakta bulunan Passiv Infinitiv dönüşüm mantığı kullanılır.
  - Yeni: Doğru cevap: Lea bittet ihren Chef darum, nicht in eine andere Abteilung versetzt zu werden. darum ilk cümlenin içeriğini gösterir ve korunur. Lea gönderilecek kişidir → Passiv Infinitiv: versetzt zu werden; möchte düşer, nicht korunur.

#### `saetze-verbinden-17` › 6
Cümle: Verbinde: „Die Wahrheit findet man wahrscheinlich nie heraus. Viele halten das für unmöglich.“

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Viele halten es für unmöglich, die Wahrheit herauszufinden.. Kaynakta “für unmöglich halten” + Infinitivsatz dönüşüm kalıbı bulunur.
  - Yeni: Doğru cevap: Viele halten es für unmöglich, die Wahrheit herauszufinden. das yerine Infinitivsatz'ı gösteren es gelir: etwas für unmöglich halten. man öznesi düşer; herausfinden ayrılabilir → herauszufinden.

#### `saetze-verbinden-17` › 7
Cümle: Verbinde: „Sara könnte ihren Arbeitsplatz verlieren. Davor hat sie Angst.“

Gerekçe: Gerekçe yalnız 'kaynakta var' diyordu; sorunun kendi kuralı açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Sara hat Angst davor, ihren Arbeitsplatz zu verlieren.. Kaynakta Angst davor + Infinitivsatz yapısı kullanılır.
  - Yeni: Doğru cevap: Sara hat Angst davor, ihren Arbeitsplatz zu verlieren. „Angst vor etwas haben“ → davor korunur. Korkan ve işini kaybedebilecek kişi aynı (Sara), bu yüzden özne düşer; könnte'nin olasılık anlamı Angst içinde kalır.

#### `fehlerkorrektur-18` › 6
Cümle: Korrigiere: „Wir freuen uns darauf euch bald zu sehen.“

Gerekçe: Düzeltilmesi istenen hatalı cümle (virgülsüz) doğru cevap olarak kabul ediliyordu; darauf gösterici kelimesi varken virgül zorunludur. Gerekçe 'kaynak çalışma kağıdı' diyordu.

- Kabul edilen cevaplar
  - Eski: `wir freuen uns darauf euch bald zu sehen` / `wir freuen uns darauf, euch bald zu sehen`
  - Yeni: `wir freuen uns darauf, euch bald zu sehen`
- Açıklama (TR)
  - Eski: Doğru cevap: Wir freuen uns darauf, euch bald zu sehen.. Kaynak çalışma kağıdı Infinitivsatz'ta virgülü özellikle ister.
  - Yeni: Doğru cevap: Wir freuen uns darauf, euch bald zu sehen. darauf sonraki Infinitivsatz'ı önceden gösteren bir kelimedir; böyle bir gösterici kelime varsa virgül zorunludur: darauf, euch bald zu sehen.

#### `master-20` › 5
Cümle: Welche Form ist korrekt?

Gerekçe: Gerekçe 'kaynak formatında virgül' diyordu; virgülün neden zorunlu olduğu açıklanmadı.

- Açıklama (TR)
  - Eski: Doğru cevap: Viele halten es für schwierig, die Ursache herauszufinden.. herausfinden → herauszufinden; kaynak formatında virgül de kullanılır.
  - Yeni: Doğru cevap: Viele halten es für schwierig, die Ursache herauszufinden. es sonraki Infinitivsatz'ı gösterdiği için virgül zorunludur. herausfinden ayrılabilir: zu, heraus ile finden arasına girer → herauszufinden.
