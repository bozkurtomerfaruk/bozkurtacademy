# Durum

Öğrenci sistemi çalışmasının güncel durumu. Plan: `docs/plan-ogrenci-sistemi.md`.

## 2026-10-19 · Lesen tamamlama: 8 aşama (Goethe C1 → TestDaF kâğıt → TestDaF dijital → telc B1, A1, A2, B2, C1 Hochschule)

### Kaldığım yer
- Aşama 1, Goethe C1: bitti, main'e birleştirildi.
- Aşama 2, TestDaF kâğıt: Oynatıcı eklentisi (ja/nein/nichts, iki örnek "01"/"02") ve test hazır; dal `claude/testdaf-papier`, çalışma ağacı /tmp/wt-testdaf. Pilot yazılıyor. C1 birleşince bu dal main'e göre yeniden düzenlenecek; format tablosu da o zaman buraya eklenecek.
- Güvenlik için 17:18 UTC'ye bir devam mesajı zamanlandı.

### Ekteki TestDaF modelltestleri
Beş PDF'in hepsi **kâğıt tabanlı** TestDaF:
- Modelltest 01: Leseverstehen, Schriftlicher Ausdruck, Hörverstehen.
- Modelltest 02: Leseverstehen, Schriftlicher Ausdruck.

**Dijital modelltest yok.** Belgeler yalnızca format için kullanılıyor; depoya eklenmiyor, TestDaF aşamalarından sonra silinecek.

### Goethe-Zertifikat C1 (modüler) Lesen: format tablosu
Kaynak: Goethe-Institut el kitabı ve Modellsatz açıklamaları (arama sonuçları üzerinden). PDF'ler bu ortamdan açılamadı (403).

| Teil | Metin | Görev | Soru | Süre | Durum |
|---|---|---|---|---|---|
| 1 | Popüler bilim metni | 8 boşluk, her birine 4 seçenek (a–d), örnek 0 | 1–8 | ~10 dk | Doğrulandı. Örnek ve süre tahmin |
| 2 | Dergi makalesi | 7 çoktan seçmeli soru (a/b/c), örnek 0 | 9–15 | ~20 dk | Doğrulandı. Örnek tahmin |
| 3 | Yorum / köşe yazısı | 8 boşluğa cümle yerleştirme. Biz: örnek 0 metinde dolu, 10 cümle (a–j), 2 artan | 16–23 | ~20 dk | 8 boşluk doğrulandı. Cümle sayısı tahmin |
| 4 | Beş yazarın akademik görüşü (A–E) | 7 ifade yazara eşleştirilir; ikisi hiçbir yazara uymaz (`0`), örnek 0 | 24–30 | ~15 dk | 5 yazar, 7 ifade, 2 eşleşmesiz doğrulandı. Örnek tahmin |

Toplam 30 soru, 65 dk (cevap kâğıdına aktarma dahil; bazı kaynaklar 70 dk diyor).

**Pilot (2 set × 4 Teil):** İki inceleyici ad tekrarlarını, deyim hâline gelmiş çeldiricileri (ör. „von großem Ausmaß sein“), aynı bağlacın iki boşlukta geçmesini ve B2 ile konu tekrarlarını düzeltti. Kör çözüm 60/60 uyuştu. Çözücünün düzeltmediğim notu: Teil 1 boşluklarının çoğu sabit söz öbekleriyle çözülüyor; set 3–5 brief'ine her sette en az üç içerik boşluğu kuralını ekledim. Teil 3 yorumları (doldurulmuş cümleler hariç) 400–425 kelime.

**Aşama 1 bitti: her Teil için 5 set (20 set, 150 soru).** Set 3–5'te iki inceleyici şunları düzeltti: gerçek ad ve yer adları (Ostheide, Lyon, Rastenfeld, Malmquist vb.), deyimleşmiş çeldiriciler, B2 ile çakışan argümanlar. Teil 3 set 4 B2'deki müze setinin konusunu tekrarlıyordu; „Volkshochschule ohne Gebühren“ olarak aynı anahtarla yeniden yazıldı. Kör çözüm 90/90 uyuştu. Çözücünün şüphelendiği 1.3/2 ve 1.4/2 boşlukları düzeltildi ve yeniden doğrulandı (16/16).

**Düzeltmediğim notlar:**
- „Die Psychologie des Aufschiebens“ (Teil 1 set 5) ve „Das stille Comeback der Nachtzüge“ (Teil 2 set 3) B2'deki birer setle aynı konuda. Argümanlar farklı, başlıkları ben seçmiştim.
- Teil 1'deki bazı boşluklar yalnızca sabit söz öbekleriyle çözülüyor; her sette en az beş içerik boşluğu var.
- „zumal“ ve „während“ iki farklı sette doğru cevap. **Oynatıcı:** a/b/c/d seçenekleri için küçük eklenti. Teil 3, B2 Teil 2'deki boşluk düzeniyle; Teil 4, B2 Teil 1'deki yorum düzeni ve `"none": "0"` ile çalışıyor.

## 2026-10-19 · Goethe A1 Lesen (Start Deutsch 1)

**Format:** Senin verdiğin format kullanıldı (3 Teil, 1–15, her Teil'de örnek 0). Resmi Übungssatz PDF'i bu ortamdan açılamadı (vekil sunucu 403); bildiğim resmi formatla çelişen bir nokta yok.

**Kararlar:**
- Süreler 8/8/9 dakika (toplam 25).
- Teil 1'de iki metin ayrı gruplarda: 0–2 birinci metne, 3–5 ikinci metne ait.
- Teil 2'de her soru kendi grubunda iki ilanla (`a`/`b`, `"none": false`). Oynatıcı bu soruları açılır liste yerine a/b düğmeleriyle ve ilan başlıklarıyla gösteriyor (küçük eklenti). check-exams metin id'lerinin bütün sette tekil olmasını denetliyor.
- Teil 3'te her tabela ve ifade ayrı grupta.
- examsData.js önbellek sürümü v=4'e çıkarıldı; önceki birleştirmelerde artırılmamıştı.

**Pilot:** Her Teil için 2 set; inceleyici A1 üstü kelimeleri ve gerçek yer adlarını değiştirdi, kör çözüm 30/30 uyuştu. Kör çözücünün notlarından 2.2/9 ("Guten Morgen" ipucu), 3.2/11 (metni tekrarlayan ifade) ve 3.2/14 ("buchen") düzeltildi.

**Kör çözücünün düzeltmediğim notları (pilot):** 2.1/9'da doğru ilan durumdaki yer adıyla bulunuyor; yer ayrıntısı bu sorunun çeldirici mantığı. 2.2/8 ve 2.2/10 çok kolay. 1.1/5'te „die Briefe … nehmen“ biraz kaba ama A1'de doğru.

**5 sete tamamlama:** Her Teil'e 3 set daha (toplam 15 set). İnceleyici 9 sette tekrar eden kalıpları, tek kelimeyle bulunan cevapları, A1 üstü kelimeleri ve sitede tekrar eden adları düzeltti. Kör çözüm 45/45 uyuştu. Çözücünün dil notlarından 1.4/3, 1.5 („nach links“, 4. soru) ve 3.3/15 düzeltildi.

**Kör çözücünün düzeltmediğim notları (set 3–5):** 2.4/10'da doğru ilan yer adıyla (Kleetal) bulunuyor; iki ilanda da yer adı var ve yer ayrıntısı bu sorunun çeldirici mantığı. „maximal“, „Mülltonne“, „Feier“ A1/A2 sınırında. 2.5/7'de a ilanı kendi bisikletini istiyor, durum bunu söylemiyor; b saat yüzünden açıkça eleniyor.

## 2026-10-19 · DTZ Lesen 5 sete tamamlandı

**Yapılanlar:** Teil 1 (yakın çeldirici) ve Teil 5 (dilbilgisi + anlam boşlukları karışık) kuralları docs/sinav-setleri.md'ye eklendi. Pilotta 1.1/23, 1.1/25, 1.2/25 yeniden yazıldı; 2.1/28'de ilan çamaşır makinesini açıkça söylüyor. Her Teil'e 3 yeni set (toplam 15) yazıldı, iki inceleyici düzeltti, bağlamsız alt ajan kör çözdü: 51/51 uyuşma. Tarayıcı testleri `tests/exams/` altına taşındı; ekran görüntüleri `$S` yoksa repo dışında geçici bir klasöre kaydediliyor, `.gitignore`'da `undefined/` var.

**Kararlar:** Teil 2'de X sebepleri setler arasında farklı: yer, saat (pilot), hedef kitle/yaş, süre, hizmet türü. Yer adları yalnızca kurgusal Lindbrück, Hagenwald, Wehrheide; kişi ve firma adları sitede tekrarlanmıyor.

**Kör çözücünün düzeltmediğim notları:** Teil 1'de bazı doğru satırlar tek bir anahtar kelimeyle (Führungszeugnis, Geburtsurkunde, Folgerezept, Jobticket) bulunuyor; durum bu kelimeyi kullanmıyor ama kelimeyi bilen kolay çözüyor. 4.3/38, 4.4/37, 4.5/38'in doğru cevabı Almanya'da yaşayan biri için gündelik bilgiyle tahmin edilebilir; çeldiriciler metinle çürütülüyor.

## 2026-10-18 · DTZ Lesen pilotu

**Kararlar:** Teil 2'de X seçeneği var, Teil 4 a/b/c (senin kararın). Resmi Übungssatz bu ortamdan açılamadığı için geri kalanlar kaynak taramasına göre: numaralar 21–45; Teil 1 içindekiler tablosu + a/b/c (örneksiz); Teil 2'de 8 ilan, örnek + 5 durum, bir X; Teil 3'te üç kısa metin, her birine bir richtig/falsch + bir a/b/c; Teil 4 broşür + 3 a/b/c; Teil 5 mektupta 6 boşluk, her boşluğa a/b/c. Süreler 8/10/12/7/8 dakika (toplam 45). Oynatıcıda a/b/c boşluklarında seçilen kelime görünüyor.

## 2026-10-18 · Goethe B2 Lesen: boşluklu metin eklentisi ve pilot

**Kendi verdiğim kararlar (Modellsatz bu ortamdan açılamadığı için):**
- Teil 2: 6 boşluk (10–15), 8 cümle (a–h), örnek cümle (0) zaten metinde ve seçeneklerden biri değil; 2 cümle artıyor.
- Teil 5: 4 bölüm (0, 28, 29, 30), 6 başlık (a–f); örnek bir başlığı kullanıyor; 2 başlık artıyor.
- Teil 1: 4 kişi (a–d), örnek + 9 ifade; kişiler birden çok kez seçilebilir. Teil 4: 8 yorum (a–h), örnek + 6 ifade; bir yorum artıyor. B2'de „uygun ilan yok“ seçeneği yok (`"none": false`).
- Süreler: 18 / 12 / 12 / 12 / 6 dakika.
- Boşluklar metne `{{10}}`, örnek `{{0=…}}` olarak yazılıyor; oynatıcı boşlukta seçilen harfi gösteriyor ve kontrol sonrası doğru/yanlış renklendiriyor.

## 2026-10-18 · Sınav setleri: sen yokken otomatik çalışma

**Sıra:** (1) B1 ikinci tur + iş akışı, (2) A2 eklentileri + A2 Teil 1–4 ikişer set pilot, (3) A2'yi her Teil için 5 sete tamamlama, (4) Goethe B2 Lesen format tablosu (yalnızca tablo, içerik yok). Her aşama ayrı commit olarak main'e; testler geçmeden birleştirme yok.

### Kaldığım yer

- **Dört aşamanın hepsi bitti.** main: `f6d5a7c` (B1 ikinci tur), `5843374` (A2 eklentileri + pilot), `d408569` (A2 5 set), ardından bu B2 tablosu commit'i. Sıradaki iş senin onayın: B2 formatı (aşağıda).
- **Bakman gerekenler:** (1) A2 kör çözücünün notu: A2 Teil 1/3'te doğru şık metindeki cümleyi çoğu zaman neredeyse aynen tekrarlıyor (A2'de olağan, ama istersen ikinci turda zorlaştırılabilir); A2 Teil 4'teki X tuzakları üç sette de tek bir sayıya dayanıyor (yaş, süre, fiyat). (2) B1 Teil 4'te birkaç küçük kalıp tekrarı kaldı (Karl/Bernd ve Cem/Erik „kabul + aber“; „başkaları X düşünüyor“ kalıbı dört sette) – kural sınırları içinde. (3) GitHub'daki sınav setleri kontrolünün sonucunu bu oturum göremiyor (GitHub API erişimi yok); main'de yerelde PASS: 45 set, 250 soru.

- **Ek iş (A2 ikinci tur) bitti:** Teil 1/3'te doğru şıklar metni tekrar etmeden yeniden ifade edildi; Teil 4'te X tuzakları her sette farklı sebebe dayanıyor (gün, hizmet türü, hedef kitle, yer, fiyat). İki kural `docs/sinav-setleri.md`'de. Kör çözüm 75/75, hepsi emin.

### Kendi verdiğim kararlar

- İş akışında `pull_request` tetikleyicisi bırakıldı: PR açılmadığı için yedek dallarda çalışmıyor; ileride PR açılırsa kontrol yine çalışır.
- „Keine Lösung" seçeneği grup düzeyinde `none` alanıyla ayarlanıyor (varsayılan `0`, A2 Teil 4'te `x`, ekranda büyük X); B1 dosyalarında değişiklik gerekmiyor.
- Teil 2 panosu ayrı bir düzen yerine metin içinde `{ "rows": [...] }` tablo paragrafı olarak tasarlandı: her metin türünde kullanılabilir, alıntı vurgusu hücrelerde de çalışıyor.
- A2 Teil 1 ve Teil 3'te örnek soru (0) yok, Teil 2 ve Teil 4'te var: araştırmada Teil 2/4 örnekleri kesin, Teil 1/3 için örnek bulunamadı.
- A2 süreleri (oynatıcıda gösterilen): Teil 1: 8, Teil 2: 6, Teil 3: 8, Teil 4: 8 dakika (toplam 30).
- A2 pilot konuları: T1 „Die jüngste Bäckerin der Stadt", „Flohmarkt im Hinterhof"; T2 „Im Kaufhaus", „Im Klinikum"; T3 „Grüße aus dem Sprachkurs", „Die neue Wohnung"; T4 „Essen gehen", „Hilfe im Alltag".
- Limit için: `send_later` ile güvenlik mesajı zamanlandı (18.10.2026 12:59 UTC, kimlik `trig_019zcyQujcHFGhS1Ew6fhedh`): „docs/durum.md'deki Kaldığım yer bölümünü oku; iş bitmediyse devam et, bittiyse sadece özet ver."
- A2 pilotundaki tarihler 2026 takvimine göre düzeltildi (12. September Samstag, 11. Oktober Sonntag, 7. November Samstag).


### Goethe-Zertifikat B2 Lesen: format tablosu (onayını bekliyor, içerik yazılmadı)

Kaynak: goethe.de bu ortamdan açılamıyor; resmi Modellsatz'tan (2018/2019) alıntı yapan arama sonuçları ve yayınevi/kurs kaynakları. Kaynaklar arasında küçük farklar var; emin olmadıklarım „?“ ile işaretli.

**Toplam:** 65 dakika, 5 Teil, 30 soru; modül 100 puan, geçme 60.

| Teil | Metin türü | Uzunluk (yakl.) | Sorular | Soru tipi | Örnek 0 | Önerilen süre |
|---|---|---|---|---|---|---|
| 1 | Forum/blogda 4 kişinin bir konu hakkındaki görüşleri (a–d) | her biri ~100–150 kelime | 1–9 | Eşleştirme: „Wer …?“ ifadesi hangi kişiye ait; kişiler birden çok kez seçilebilir | evet | 18 dk |
| 2 | Gazete haberi, metinde 6 boşluk | ~400–450 kelime | 10–15 | Boşluğa cümle yerleştirme: 8 cümle (a–h), örnek bir tanesini kullanır, 1–2 cümle artar (?) | evet | 12 dk |
| 3 | Uzun gazete/dergi makalesi | ~500–550 kelime | 16–21 | a/b/c (çıkarım gerektiren ayrıntı soruları) | hayır (?) | 12 dk |
| 4 | Bir dergide okur görüşleri (kısa yorumlar, a–h) | her biri ~50–80 kelime | 22–27 | Eşleştirme: ifade/başlık hangi yoruma uyuyor; bir yorum artar | evet | 12 dk |
| 5 | Kurallar/yönetmelik (ör. işyeri, kurs, bina düzeni), bölümlere ayrılmış | ~250–300 kelime | 28–30 | Eşleştirme: bölüm başlığı (a–h) hangi bölüme uyuyor (?) | evet | 6 dk |

**Oynatıcı için:** Yeni soru tipi gerekmiyor; Teil 1, 4 ve 5 mevcut `zuordnung` ile yapılabilir (Teil 1'de aynı kişi birden çok kez cevap olabilir, check-exams buna izin veriyor). Teil 2 için küçük bir eklenti gerekir: metnin içinde numaralı boşluklar (ör. `{ "gap": 10 }` paragraf parçası) ve cümle seçeneklerini gösteren bir düzen. Teil 5'te başlık seçenekleri de aynı düzenle gösterilebilir.

**Senden beklenen:** Tabloyu onaylaman veya düzeltmen; onaydan sonra B2 pilotuna başlanır.

Kaynaklar: [Goethe B2 Modellsatz Erwachsene](https://www.goethe.de/pro/relaunch/prf/materialien/B2/b2_modellsatz_erwachsene.pdf), [Goethe B2 Online-Modellsatz Lesen](https://bfu.goethe.de/b2_mod_2MX6/lesen.php), [Klett Modellprüfung B2 (Auszug)](https://www.klett-sprachen.de/downloads/19048/Probeauszug_5FGoethe_2DZertifikat_5FB2/pdf), [Faust Academy: Goethe B2 Lesen](https://www.faustacademy.com/goethe-b2-lesen), [swiss exams: B2 Modellsatz](https://res.cloudinary.com/swiss-exams/image/upload/v1702051250/B2_adults_Set_of_model_exercises_PDF_3dcc54de5d.pdf).

## 2026-10-17 · Ayrı iş: Sınav görevi oynatıcısı ve Goethe B1 Lesen pilotu

**Yapılan:** Sınav bölümündeki "Başla" artık setleri sitenin içinde açıyor (`#exams/goethe/b1/lesen/1/set-1`). Oynatıcı `js/exam-task.js`, setler `data/exams/…/teil-N/set-N.json`, format `docs/sinav-setleri.md`, kontrol `node scripts/check-exams.mjs` (GitHub'da da çalışıyor). Pilot: Goethe B1 Lesen Teil 1–5, her biri 2 set (60 soru, 0 numaralı örnekler dahil), tamamen orijinal.

**Senden beklenen:** Setleri kontrol edip diğer bölümler için onay vermen.

## 2026-10-17 · Ayrı iş: Alıştırma dil bilgisi denetimi birleştirildi ve yayında

**PR:** https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/27 (dal: `alistirma-duzeltmeleri`, birleştirildi ve silindi). GitHub Pages yayını başarıyla tamamlandı.

**Yapılan:** 48 konudaki 8528 sorunun tamamı denetlendi, 1442 soru düzeltildi (yalnızca içerik: soru, şık, cevap, kabul edilen yazılı cevaplar, açıklamalar; kod, veri yapısı, ID'ler ve sıralama aynı). Başlıca düzeltmeler: soruya uymayan şablon açıklamalar, "Kaynakta…" gibi gerekçesiz açıklamalar, Türkçe alandaki Almanca/İngilizce metinler, birden fazla doğru şıkkı olan sorular, bozuk veriler (liste olarak kaydedilmiş cevaplar, cümleyi tekrarlayan şıklar) ve reddedilen doğru yazılı cevaplar. Onaya sunulan 80 maddeden 77'si kararına göre uygulandı, 3'ü olduğu gibi bırakıldı. Ayrıntılar ve her değişikliğin eski/yeni hali: `ALISTIRMA_DUZELTMELERI.md`.

**Bilmen gerekenler:** Soru metni tek dilli bir alan olduğu için Konjunktiv II nezaket sorularındaki yönerge soru metnine Almanca, açıklamalara TR/DE/EN olarak eklendi. `b2/genitivpraepositionen` zeit-12 alıştırması "zeit … Lebens" kalıbıyla yeniden yazıldı. `check-grammar` PASS.

**Senden beklenen:** Bir şey yok.

## 2026-10-16 · Ayrı iş: TestDaF eklendi

**Yapılan:** Sınav seçimine TestDaF (B2–C1, tek sınav) eklendi. Seviye yerine format seçiliyor: Dijital (önce, "Yaygın format" etiketli) ve Kâğıt tabanlı; adresler `#exams/testdaf/digital/lesen`, `#exams/testdaf/papier/lesen`. Parçalar "Aufgabe" olarak adlandırılıyor (`partLabel: 'aufgabe'`). Hero metnine TestDaF eklendi.

## 2026-10-16 · Ayrı iş: Sınav Hazırlığı adım adım seçim

**Yapılan:** `#exams` bölümü Sınav › Seviye › Bölüm › Teil akışına dönüştü (Goethe, telc, DTZ; ÖSD "Yakında"). Tüm veriler `js/examsData.js` içinde, arayüz ve adresler `js/exams.js` tarafından üretiliyor. Adresler paylaşılabilir (`#exams/goethe/b1/lesen`, DTZ'de `#exams/dtz/lesen`). Dört beceri şeridi kaldırıldı; çalışma planı ve iletişim kartı yerinde. "Başla" ve diğer `#exercises/...` bağlantıları sayfa yenilenmeden açılıyor; özel linkle açılan alıştırmadan tek geri tuşu geldiğin sayfaya döndürüyor (elle gezinmede adım adım geri gitme aynı).

**Senden beklenen:** Teil'lere alıştırma eklemek için `js/examsData.js` başındaki açıklamaya bak; `exercises` dizisine `{ title, href }` eklemen yeterli.

## 2026-10-16 · Ayrı iş: Yan yardım paneli kapatıldı, "Konuyu çalış" eklendi

**PR:** https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/25 (dal: `claude/konuyu-calis`). Birleştirilmedi.

**Yapılan:** Alıştırmalardaki soldaki konu paneli artık hiçbir alıştırmada görünmüyor; hepsi tam genişlikte. Panel kodu ve JSON'lardaki `lesson` içeriği duruyor: geri açmak için `js/quiz.js`'de `SHOW_LESSON_PANEL` değerini `true` yapman yeterli. "Yardım kapalı / Ohne Hilfe / No help" etiketi kaldırıldı. Soru ekranında ("Alıştırmalara dön"ün yanında) ve sonuç ekranında "Konuyu çalış" butonu var; konunun gramer sayfasını aynı sekmede açıyor. Gramer sayfasının üstünde ve "alıştırmalarla pekiştir" bölümünde "Alıştırmaya dön" butonu çıkıyor ve öğrenciyi kaldığı soruya geri getiriyor; verdiği cevaplar ve sonuç ekranı korunuyor, sonuç ikinci kez kaydedilmiyor. Buton sadece `data/grammar-index.json` ve `data/<seviye>-grammar.json`'da anlatımı olan konularda görünüyor (B2'de görünmüyor).

**Bilmen gerekenler:** Gramer sayfası yenilenirse "Alıştırmaya dön" butonu kayboluyor (ölü bağlantı kalmasın diye). Tarayıcının geri tuşu da alıştırmaya aynı şekilde dönüyor.

**Senden beklenen:** PR'ı inceleyip "birleştir" demen.

## 2026-10-16 · Ayrı iş: Yeni logo PR'ı açıldı

**Yapılan:** Seçilen logo (açık kitap + Almanya bayrağı renklerinde ayraç) uygulandı. `images/logo.svg`, `logo-dark.svg`, `logo-mark.svg`, `logo-mark-dark.svg`, adaptif `favicon.svg`, yeni favicon seti, `images/logo-email.png` eklendi. Header ve footer'da tüm sayfalarda yeni işaret; koyu temada açık renkli varyant. `site.webmanifest` renkleri `--ba-ground` (#ddd6c6) oldu.

**Bilmen gerekenler:** Bayrak renkleri (#000000, #dd0000, #ffce00) sadece ayraçta, senin onayınla; paletin geri kalanı `--ba-*`. Eski PNG'ler (`images/Logo.png`, `images/logo-transparent.png`, kökteki `logo-transparent.png`) silinmedi ve artık hiçbir sayfada kullanılmıyor.

**Senden beklenen:** PR'ı inceleyip "birleştir" demen.

## 2026-10-15 · Ayrı iş: GoatCounter PR açıldı

**PR:** https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/17 (dal: `claude/goatcounter`, main'den). Birleştirilmedi.

- count.js (GoatCounter v2.7.0, ISC) `js/vendor/count.js` olarak sitenin kendisinden yükleniyor. Tek değişiklik: localStorage kullanan `#toggle-goatcounter` özelliği çıkarıldı. Kendi ziyaretlerini saymamak için GoatCounter → Settings → "Ignore IPs" kullanabilirsin.
- Sadece `index.html`'de. Her hash sayfası ayrı sayılıyor, soru numaraları atılıyor. localhost'ta sayım yok. Çerez ve localStorage yok.
- Test: konsol hatası yok, dersler ve alıştırmalar çalışıyor, `check-grammar` PASS.
- Not: `gc.zgo.at` geliştirme ortamında engelli olduğu için dosya GoatCounter'ın GitHub'daki v2.7.0 etiketinden alındı.
- İki PR de birleşince taslak `privacy.html`'ye GoatCounter bölümü eklenmeli.

## 2026-10-15 · Aşama 1 bitti, PR açıldı, onay bekleniyor

**PR:** https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/16 (dal: `claude/asama-1-ogrenci-girisi`). Birleştirilmedi.

**Yapılan:** Giriş ve kayıt (16 yaş altı için veli bilgileri, Google sadece 16+), öğretmen onayı ve veli onayı, alıştırma sonuçlarının kaydı, öğrenci paneli, öğretmen paneli (öğrenciler, onay bekleyenler, veli onayı bekleyenler, silinmesi gereken kayıtlar + uyarı), öğrenci detayı, silme akışı, taslak `privacy.html`, taslak veli onay formu (TR/DE), kurulum belgesi. Kararlarının hepsi uygulandı.

**Testler:** 45/45 Firestore kural testi, `check-grammar` PASS, emülatörde uçtan uca akışlar geçti, herkese açık sayfalar giriş yapmadan çalışıyor, 390 ve 1440px açık/koyu ekran görüntüleri paylaşıldı.

**Bilmen gerekenler:**
- Google ile giriş penceresi geliştirme ortamında test edilemedi (`apis.google.com` engelli). Canlıda denenmeli.
- Dersler Aşama 3'te geleceği için "son dersten 12 ay" kuralı şimdilik onay tarihine bakıyor. Aşama 3'te dersler otomatik hesaba katılacak.
- `privacy.html` sadece Türkçe ve köşeli parantezli yerler (adres, hukuki dayanak, denetim makamı, formların saklandığı yer) doldurulmalı.
- Öğretmen sayfalarında dil düğmesi yok (öğretmen paneli sadece Türkçe).

**Senden beklenenler:**
1. `privacy.html` hukuki kontrolü, sonra PR'ı birleştirmek için "birleştir" demen.
2. Birleştirdikten sonra: `giris.html`'de Google ile giriş yapıp ekranda görünen **UID'ini** göndermen. Ardından `firestore.rules` dosyasını Firebase Console'da yayınlaman (`docs/kurulum.md`).
3. Aşama 2'ye (ödevler ve kaynaklar) geçmek için onayın.


## 2026-10-15 · Plan kaydedildi, onay bekleniyor

**Yapılan:** Plan `docs/plan-ogrenci-sistemi.md` dosyasına yazıldı. Henüz kod yazılmadı.

**Senden beklenen kararlar** (ayrıntılar planın 0. bölümünde):

1. **Yaş hesabı:** `bu yıl − doğum yılı ≤ 16` ise veli onayı istensin mi? (Önerim: evet.)
2. **Haftalık tekrar:** Google'da tek tekrarlayan etkinlik mi, yoksa her ders ayrı etkinlik mi? (Önerim: tek tekrarlayan etkinlik.)
3. **Dil:** Öğrenci sayfalarına Almanca ve İngilizce çeviri de eklensin mi? (Önerim: öğrenci sayfalarına evet; öğretmen paneli ve e-postalar sadece Türkçe.)
4. **privacy.html:** Aşama 1'de taslak gizlilik sayfası hazırlansın mı? (Önerim: evet, hukuki kontrolden sonra yayına alınsın.)
5. **Saklama süresi:** Son dersten 12 ay sonra silme, onaylanmayan kayıtlar için 30 gün uygun mu?

**Sonraki adım:** Planı onaylayıp bu kararları verince Aşama 1'e başlanacak. PR açmadan önce Firebase `firebaseConfig` bilgisi gerekiyor (planın 9.A bölümü).
