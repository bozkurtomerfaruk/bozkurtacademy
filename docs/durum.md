# Durum

Öğrenci sistemi çalışmasının güncel durumu. Plan: `docs/plan-ogrenci-sistemi.md`.

## 2026-10-26 · Gizlilik politikası tamamen TR/DE/EN; Impressum kontrolü

- **Diller:** `privacy.html`'deki metnin tamamı üç dilde, üç ayrı blokta (`data-privacy-lang`). Dil düğmesine göre yalnızca biri görünüyor. Sayfa başlığı ve açıklaması da dile göre değişiyor. JavaScript kapalıyken Türkçe görünüyor.
- **Metinler:**
  - Türkçe metin değişmedi.
  - Almanca resmî Datenschutzerklärung dilinde, „Sie“ hitabıyla; hukuki dayanaklar „Art. 6 Abs. 1 lit. … DSGVO“ biçiminde.
  - İngilizce „Art. 6(1)(…) GDPR“ biçiminde.
  - „şifrelenmiş özet“ ifadesi DE/EN'de teknik olarak doğru karşılığıyla çevrildi: „Hashwert“ / „hash“.
- **Bağlantılar:** `privacy.html#seviye-testi` gibi bağlantılar hangi dil seçiliyse o dildeki 5a bölümüne gidiyor (`data-anchor`, `js/privacy.js` v2).
- **Testler:** `npm run test:placement` 217 kontrol, hepsi geçti; gizlilik sayfası için 71 kontrol (üç dil, iki tema, 390 px, tek dil görünürlüğü, bağlantılar, JavaScript kapalı).
- **Impressum:** Sitede yok. Gerekli bilgilerin listesi sana iletildi. Bilgiler gelene kadar sayfa oluşturulmayacak.
- **Hukuki kontrol:** „Bu metin hukuki olarak kontrol edilmektedir“ notu üç dilde de duruyor. Almanca ve İngilizce metinler de hukuki kontrolden geçmeli.

## 2026-10-26 · Gizlilik politikası: seviye testi bölümü (TR/DE/EN)

- **Senin onayınla `privacy.html`'e eklenenler:**
  - Yeni bölüm „5a. Seviye testi“: hangi veriler, amaç, Firebase (Google) ve ABD aktarımı, hukuki dayanak, 6 ay saklama, e-postayla silme talebi.
  - Bölüm 2'de yeni localStorage maddesi (`baPlacement`, `baPlacementSent`).
  - Bölüm 3'te GoatCounter sayfa listesine seviye testi.
  - Bölüm 6'da "öğrenci ve seviye testi verileri".
  - Bölüm 11'de silme talebi.
  - Son güncelleme: 26 Ekim 2026.
- **Firebase cümlesi:** "Giriş yapmamış ziyaretçiler için Firebase yüklenmez" yerine, seviye testinde "Sonucu gönder"e basınca yüklendiğini söyleyen cümle geldi.
- **Diller:**
  - Değişen ve yeni kısımlar dil düğmesine göre TR/DE/EN değişiyor. Metinler `js/privacy.js`'de; `data-privacy` işaretli öğelere yazılıyor, çünkü `app.js`'in çevirisi bağlantı ve `<code>` içeren metinleri düz yazıya çevirirdi.
  - Sayfanın geri kalanı eskisi gibi sadece Türkçe. DE/EN seçildiğinde sayfa karışık dilde görünüyor; bütün sayfanın çevirisi ayrı bir iş.
- **Diğer:**
  - Testteki onay kutusunun bağlantısı artık doğrudan `privacy.html#seviye-testi`'ye gidiyor (`placement.js` v2).
  - `privacy.html` artık `app.js` v23'ü yüklüyor.
- **Test:** `npm run test:placement` 203 kontrol, hepsi geçti; bunların 57'si gizlilik sayfası için (üç dil, iki tema, 390 px, tarih, bağlantılar, dil değiştirme).

## 2026-10-26 · Seviye tespit sınavı (#seviye-testi) ve yönetim sayfası

**Canlıda çalışması için senin yapman gerekenler** (ayrıntılar: `docs/seviye-testi.md`):
1. Firebase Console → Authentication → Sign-in method → **Anonim**'i aç.
2. `firestore.rules`'u yayınla.
3. `placementTests` / `expireAt` için **TTL politikası** oluştur.

1 ve 2 yapılmadan sonuç gönderilemez. Öğrenci "gönderilemedi" mesajını ve e-posta adresini görür.

**Adresler:**
- Test: `https://bozkurtacademy.com/#seviye-testi`
- Yönetim: `https://bozkurtacademy.com/#yonetim/seviye-testleri`; önce `giris.html`'den öğretmen hesabıyla giriş.

**Yapılanlar:**
- **Soru bankası** (`data/seviye-testi/sorular.json`): 5 blok (A1, A2, B1, B2, C1). Her blokta 7 dilbilgisi/kelime sorusu (çoğu seçenekli boşluk doldurma, birkaçı çoktan seçmeli) ve bir okuma metniyle 3 soru, toplam 50 soru. Her sorunun `id`, `topic` (sitedeki konu kimlikleri) ve bloğu üzerinden seviyesi var.
- **Akış:**
  - Giriş ekranı → A1 → … Bir blokta ≥ 6/10 doğru yapan sonraki bloğa geçer, yapamayanda test biter.
  - Sonrasında isteğe bağlı yazma görevi; seviyeye göre beklenen uzunluk gösteriliyor.
  - Sonuç ekranı: tahmini seviye, açıklama, bloklara göre doğru sayısı, zorlandığı konular ve bağlantıları, "tahmini sonuç" notu.
  - Ardından form → teşekkür ekranı.
  - "Hiç Almanca bilmiyorum" testi atlayıp A0 ile doğrudan forma geçiyor.
- **Bağlantılar:**
  - Dersler sayfasının altında kart.
  - İletişim sayfasında "Almanca seviyen" maddesinin yanında not. İletişim formunda ayrı bir seviye alanı olmadığı için, seviyenin sorulduğu yer bu madde.
  - Ana sayfada, butonların altında küçük "Seviyeni ölç".
  - Menüde öğe yok.
- **Yönetim sayfası:**
  - Liste: tarih, ad, seviye, hedef; en yeni üstte, okunmamışlar "Yeni" işaretli ve solda yeşil çizgi.
  - Arama (ad/e-posta) ve seviye filtresi.
  - Detay: form bilgileri, bloklar, konu bazında hatalar, yanlış sorular (soru metni, öğrencinin cevabı, doğru cevap), yazma metni, süre, otomatik silinme tarihi.
  - Okundu/okunmadı, kendi notun, onaylı silme.
- **Firestore:** `placementTests` ve `placementLimits` kuralları, 18 yeni kural testi (`npm test` 100/100). TTL için `firestore.indexes.json`'a `fieldOverrides` eklendi.
- **Sayaç:** Test `/#seviye-testi` olarak ayrı sayılıyor, `#yonetim/…` hiç sayılmıyor (`js/analytics.js`).
- **Testler:** `npm run test:placement` (Playwright + emülatör, 146 kontrol, hepsi geçti). Mevcut testler: kural testleri, `check-grammar`, `check-exams`, `tests/exams/*` geçti.
- **Önbellek sürümleri:** `app.js` v23, `analytics.js` v4; yeni dosyalar v1.

**Kör çözüm ve seviye değerlendirmesi** (bağlamsız alt ajan, cevapsız ve karışık kopya):
- 50/50 uyuştu.
- Ajan her soruya ve metne ayrıca kendi tahmini CEFR seviyesini verdi; bloklar A1 → C1 düzgün basamaklanıyor.
- Ajanın işaretleriyle değiştirilenler:
  - A2-perfekt'te Plusquamperfekt olabilen „waren“, B1-passiv'de „ist“ ve C1-satzstellung'da bölgesel varyantlar çıkarıldı.
  - Dünya bilgisiyle çözülen A1/A2 kelime soruları değişti (Glas → Wasser, Ärztin → Rezept).
  - B1 okuma başlığı ilk soruyu ele veriyordu („Ausleihen statt kaufen“ → „Ein Laden der anderen Art“).
  - B2'de B1 düzeyinde kalan Partizip I, je–desto ve Nominalisierung soruları zorlaştırıldı.
  - B1'deki B2 kelimesi „Zweck“ çıkarıldı.
- Değişen 9 soru yeniden kör çözüldü: 9/9.
- Doğru cevabın belirgin biçimde en uzun olduğu okuma seçenekleri dengelendi.

**Kararlar ve gerekçeler:**
- **Sayfa yapısı:** Test ve yönetim `index.html` içinde hash sayfası olarak duruyor (`BA_PAGES`'e eklendi), çünkü istenen adresler bunlardı. Firebase sadece "Sonucu gönder"de (`js/account/placement-submit.js`) ve yönetim sayfasında yükleniyor; ziyaretçi için gizlilik metnindeki "Firebase yüklenmez" durumu teste kadar korunuyor.
- **"Bilmiyorum" seçeneği:** Her soruda var ve yanlış sayılıyor. Tahmini azaltır, sonuç daha doğru olur.
- **Seviye hesabı:** Geçilen en yüksek blok. Geçilemeyen blokta 4–5 doğru varsa "X – Y'ye yakın". Hiçbir blok geçilmezse A0.
- **Yazma görevinde beklenen uzunluk:** A0/A1 20–40, A2 40–70, B1 80–120, B2 120–160, C1 150–200 kelime.
- **Seçenek sırası:** Her yeni denemede karışıyor. Aynı deneme içinde yenilemede sıra korunuyor, yoksa seçilen cevap yer değiştirirdi.
- **Süre:** Sayaç gösterilmiyor. Sadece test ekranı açık ve görünürken sayılıyor (sekme arka plandayken veya ertesi gün devam edilirse bekleme süresi eklenmiyor); en fazla 6 saat.
- **Yanlış cevaplar ve konu hataları neden metin alanı:** Kurallar liste/harita içindeki değerleri tek tek denetleyemiyor. Metin olunca biçim (regex) ve boyut sınırı kesin uygulanıyor. Yönetim sayfası bunları ayrıştırıyor.
- **expireAt:** Tarayıcı sunucu saatini bilemediği için kurallar `createdAt` (= sunucu saati) + 183 gün ± 1 gün kontrol ediyor; testte fark 183,00 gün çıktı.
- **Bekleme süresi:** Sonuç ile `placementLimits/{uid}` aynı batch'te yazılmak zorunda. Bekleme belgesi sonucun kimliğini taşıdığı için tek batch'te iki sonuç yazılamıyor; belge 10 dakikadan önce güncellenemiyor.
- **Yönetim sayfası dili:** Öğretmen paneli gibi sadece Türkçe. "Erişimin yok" mesajı üç dilde.
- **Yetki:** Mevcut `isTeacher()` (UID) kullanıldı; ayrı bir admin rolü (custom claim) eklenmedi, çünkü Admin SDK gerektirir.
- **CI:** Tarayıcı testleri CI'a eklenmedi (Playwright tarayıcısı ve emülatör ister). Kural testleri mevcut iş akışında çalışıyor.

**Bilinen sınırlar:**
- **Anonim hesaplar ve bekleme süresi:** Anonim hesaplar sınırsız açılabildiği için kararlı biri her gönderimde yeni anonim hesap açarak 10 dakikalık bekleme süresini aşabilir. Kurallar alan ve boyut sınırlarını yine uygular. Gerekirse ileride **Firebase App Check** (reCAPTCHA Enterprise) eklenebilir; şimdilik eklenmedi.
- **Soru bankası herkese açık:** `data/seviye-testi/sorular.json` cevaplarla birlikte açık; statik sitede başka yolu yok. Seviye testi için kabul edilebilir.
- **Gizlilik metni:** `privacy.html` değiştirilmedi. Önerilen ekler `docs/seviye-testi.md` sonunda: Firebase'de (Google) işleme, 6 ay saklama, e-postayla silme talebi, localStorage anahtarları, GoatCounter listesi. `docs/privacy-policy.md` (olgu listesi) güncellendi.

## 2026-10-26 · Lesen son tur: TestDaF Aufgabe 7 gerçek formatta, telc C1 cevap biçimi

- **TestDaF dijital Aufgabe 7:** Her set artık tek özet (14 cümle, üç paragraf) ve içinde üç yanlış cümle. Öğrenci üç cümle seçer, en fazla üç seçilebilir; her doğru seçim 1 puan (soru 32 = 32–34). Yanlış cümlelerin yeri setlere göre değişiyor; bazı setlerde ikisi aynı paragrafta. `fehlersatz` tipi yerine çoklu seçimli `fehlerauswahl` geldi (oynatıcı, puanlama, `check-exams` ve testler güncellendi).
- **Tahmin edilebilir yanlış cümleler:** Genel bilgiyle ya da özetin başka bir cümlesiyle anlaşılan yanlışlar kaldırıldı. Yeni yanlışlar tek bir somut ayrıntıyı (miktar, malzeme, kişi, katılımcı grubu, neden) değiştiriyor ve ancak metne bakınca anlaşılıyor.
- **telc C1 Hochschule soru 24:** Doğru cevap 1, 3 ve 5. setlerde kısa ve tek parçalı, 2 ve 4. setlerde iki parçalı. Her sette bir çeldirici daha uzun ve iki parçalı; doğru cevap hiçbir sette en uzun değil, yalnız birinde en kısa. Yalnız çeldiricilerde görülen „daher“ bağlacı azaltıldı.
- **Yeni kural (`docs/sinav-setleri.md`):** Doğru cevap biçim ve uzunluk bakımından öne çıkmaz (tüm seviyeler, tüm seçmeli görevler).
- **Kör çözüm:** Aufgabe 7 15/15, telc C1 soru 24 ve set soruları 60/60. Kör çözücü biçim stratejileriyle (en kısa / en uzun) doğruya ulaşamadı. Değişen set-4 özeti ayrıca yeniden kör çözüldü (3/3).
- **Not:** Aufgabe 7 set-5'teki bir yanlış yıl (1700) metinsiz de uzmanlık bilgisiyle bulunabilir; sıradan öğrenci için metin gerekli.

## 2026-10-26 · Lesen ekleri: TestDaF dijital Aufgabe 2 ve 7, telc C1 ana fikir soruları, telc A2 set değişikliği

- **TestDaF dijital Aufgabe 2 (Textabschnitte ordnen):** 5 set. Giriş paragrafı sabit; A–D paragraflarına sıra numarası (2–5) seçilir. Yeni soru tipi `reihenfolge`: sayı düğmeleri en az 44 px, telefonda tek satır.
- **TestDaF dijital Aufgabe 7 (Fehler in der Zusammenfassung):** 5 set. Özet üç paragrafa bölündü; her paragraftaki cümleler akan metin olarak tıklanır, öğrenci yanlış olanı seçer. Yeni soru tipi `fehlersatz`. Resmî sınavda özetteki üç yanlış cümle tek metinde aranıyor (≈); bizde her paragrafta bir tane.
- **telc C1 Hochschule Teil 3, soru 24:** beş setteki çeldiriciler aşırı genellemeler yerine metinle ilişkili ama ana fikri kaçıran ifadelerle değiştirildi (ikincil ayrıntı, eleştirmenin görüşü, metnin çürüttüğü ilk varsayım, vurguyu kaydıran sonuç).
- **telc A2 Teil 2 set-4:** köy sineması yerine „Vogelhäuser für den Stadtpark“ (bir sınıfın parka kuş evi yapması); anahtar aynı.
- **İnceleme ve kör çözüm:** TestDaF Aufgabe 2 ve 7 için 35/35, değişen telc C1 ve A2 soruları için 66/66 uyuştu. İnceleyiciler Aufgabe 2 set-4'te olası ikinci sıralamayı kapattı, Aufgabe 7'de doğru sayılan ama metinde olmayan çıkarımları düzeltti. Kör çözücü bazı özetlerde yanlış cümlenin başka bir özet cümlesiyle ele verildiğini buldu; bu cümleler değiştirildi (set-2, set-3, set-5) ve yeniden kör çözümde tutarlı çıktı. Seçili cümle koyu temada görünmüyordu; CSS düzeltildi.
- **Düzeltmediğim notlar:** Aufgabe 7'deki bazı yanlış cümleler genel bilgiyle tahmin edilebiliyor (ör. koyun sahiplerinin kurtları „sevinçle karşılaması“, jülyen yılının „çok kısa“ olması). C1 ana fikir sorularında doğru seçenek genellikle iki parçalı ve dengeli; birkaç çeldirici de öyle yazıldı.

## 2026-10-19 · Lesen tamamlama: 8 aşama (Goethe C1 → TestDaF kâğıt → TestDaF dijital → telc B1, A1, A2, B2, C1 Hochschule)

### Kaldığım yer
- Aşama 1, Goethe C1: bitti, main'e birleştirildi (813927f).
- Aşama 2, TestDaF kâğıt: bitti, main'e birleştirildi.
- Aşama 3, TestDaF dijital: bitti, main'e birleştirildi (00feb1c; Aufgabe 2 ve 7 atlandı). Modelltest PDF'leri çalışma alanından silindi.
- Aşama 4, telc B1: bitti, main'e birleştirildi (49db897).
- Aşama 5, telc A1: bitti, main'e birleştirildi (7c9acb2).
- Aşama 6, telc A2: bitti, main'e birleştirildi (cfb9104).
- Aşama 7, telc B2: bitti, main'e birleştirildi (3e625fc).
- Aşama 8, telc C1 Hochschule: bitti, main'e birleştirildi. **8 aşamanın hepsi tamamlandı.**

### telc Deutsch A1 (Start Deutsch 1) Lesen: format tablosu
Start Deutsch 1, Goethe-Institut ile telc'in ortak geliştirdiği sınav; telc A1 ile Goethe A1'in formatı aynı (✔). Bu yüzden tablo Goethe A1 tablomuzla aynı; içerik tamamen yeni (Goethe A1'in hiçbir konusu, durumu, adı veya tabelası tekrar edilmiyor).

| Teil | Metin | Görev | Soru | Süre |
|---|---|---|---|---|
| 1 | İki kısa kişisel metin (e-posta, not, SMS) (✔) | richtig/falsch, örnek 0 (✔) | 1–5 (✔) | ~8 dk (≈) |
| 2 | Her soru için iki kısa ilan/web sayfası a ve b (✔) | Duruma uyan ilan: a veya b, örnek 0 (✔) | 6–10 (✔) | ~8 dk (≈) |
| 3 | Kısa tabela, duyuru, not (✔) | richtig/falsch, örnek 0 (✔) | 11–15 (✔) | ~9 dk (≈) |

Toplam ~25 dk (✔).

**Aşama 5 bitti: 3 Teil × 5 set (15 set, 75 soru).** İçerik Goethe A1'den tamamen bağımsız; konular, durumlar, adlar ve tabelalar tekrar edilmiyor.
- Kör çözüm pilotta 30/30, set 3–5'te 50/50 uyuştu (değişen pilot T3 set-1 de yeniden çözüldü).
- İnceleyiciler A1 üstü kelimeleri sadeleştirdi (Minigolf, Fitnessstudio, PIN, Spielsachen, Kellner …), kelime gibi görünen süslü işletme adlarını basit adlarla değiştirdi, yer belirleyiciyse iki ilanda da yer adı geçirdi, kısmen doğru olabilen yanlış ifadeleri netleştirdi („In den Räumen vom Museum …“).
- İki başlık sitede zaten vardı, değiştirildi: „Ein Kindergeburtstag“, „Sport im Verein“.

**Düzeltmediğim notlar:** Zirkus, Größe, Rezept gibi birkaç kelime A1 sınırında; Türkçe açıklamada çevrildikleri için bırakıldı. Bazı Teil 3 ifadeleri (ör. çocuklar daha az öder) genel bilgiyle tahmin edilebiliyor.

### telc Deutsch A2 (Start Deutsch 2) Leseverstehen: format tablosu
Kaynak: telc Übungstest açıklamaları ve hazırlık sitelerinin özetleri (arama sonuçları; resmî PDF'lere ağdan erişilemedi). ✔ = birden çok kaynakta doğrulandı, ≈ = tahmin veya bizim kararımız. Lesen ve Schreiben birlikte 50 dk (✔).

| Teil | Metin | Görev | Soru | Süre |
|---|---|---|---|---|
| 1 | Kısa gazete metni (✔), ~170–210 kelime (≈) | a/b/c, metin sırasıyla (✔) | 1–5 (✔) | ~10 dk (≈) |
| 2 | Basın metni, ~150 kelime (≈ tek kaynak) | richtig/falsch, metin sırasıyla (≈) | 6–10 (✔) | ~10 dk (≈) |
| 3 | 8 ilan a–h (✔) | Örnek 0 + 5 durum; bir durum için ilan yok: x; üç ilan artar (✔) | 11–15 (✔) | ~10 dk (≈) |

- **Bizim kararlarımız (≈):** Teil 1 ve 2'de örnek yok; Teil 3'te x tuzağı her sette başka bir koşula dayanıyor (yaş, tarih …).
- **Oynatıcı:** yeni eklenti gerekmedi (a/b/c, richtig/falsch, `"none": "x"` ve örnek 0 zaten var).

**Aşama 6 bitti: 3 Teil × 5 set (15 set, 75 soru).**
- Kör çözüm pilotta 30/30, set 3–5'te 45/45 uyuştu.
- İnceleyiciler A2 üstü kelimeleri sadeleştirdi (Chatgruppe, Einzelfahrt, Klinik, Kursgebühr, Konditorei, Umfragen …), yalnızca „metinde yok“ olan çeldiricileri metinle çelişen çeldiricilere çevirdi, bütçeleri sayıyla verdi, gerçek marka adlarını ve paralel dallarla çakışan adları değiştirdi.
- Teil 3'te x tuzakları her sette başka bir koşula dayanıyor: yaş, tarih, kendi ekipmanı, grup büyüklüğü, saat ücreti.

**Düzeltmediğim notlar:**
- Bazı Teil 3 durumları ilanla aynı anahtar kelimeyi paylaşıyor (Gitarre, Grill, Sonntag); çeldirici ilanlar yine de okumayı gerektiriyor.
- Konu yakınlıkları: yetişkin yüzme kursu (Goethe B1'de bir cümle), aşçıyla yemek kursu (telc A2 T2 set-1'e yakın), yeniden açılan köy sineması (Goethe A2 „Kinoabend im Dorf“a yakın; başlık değiştirildi: „Das alte Kino ist wieder offen“).
- T1 set-4 metni ~229 kelime, hedefin biraz üstünde.

### telc Deutsch B2 Leseverstehen + Sprachbausteine: format tablosu
Kaynak: hazırlık sitelerinin ve telc ipucu belgelerinin özetleri (arama sonuçları; resmî PDF'lere ağdan erişilemedi). ✔ = birden çok kaynakta doğrulandı, ≈ = tahmin veya bizim kararımız. Görev türleri telc B1 ile aynı, metinler daha uzun ve dil daha zor. Lesen ve Sprachbausteine birlikte ~90 dk (✔).

| Bölüm | Metin | Görev | Soru | Süre |
|---|---|---|---|---|
| Lesen Teil 1 | 10 başlık a–j, 5 metin (✔), metin başına ~90–140 kelime (≈) | Her metne bir başlık, beş başlık artar (✔) | 1–5 (✔) | ~15 dk (✔) |
| Lesen Teil 2 | Uzun makale, ~550–650 kelime (≈; kaynaklar 500–900 arası veriyor) | a/b/c (✔) | 6–10 (✔) | ~20 dk (✔) |
| Lesen Teil 3 | 12 ilan a–l (≈) | 10 durum; bir durum için ilan yok: x (≈) | 11–20 (✔) | ~30 dk (≈) |
| Sprachbausteine Teil 1 | Resmî mektup, ~200–260 kelime (≈) | Her boşluk için a/b/c, dil bilgisi (✔ bir kaynak; diğeri farklı) | 21–30 (✔) | ~12 dk (≈) |
| Sprachbausteine Teil 2 | Rapor, duyuru, okur mektubu (≈) | 15 kelimelik listeden 10 boşluk (✔) | 31–40 (✔) | ~13 dk (≈) |

**Aşama 7 bitti: Lesen 3 Teil + Sprachbausteine 2 Teil, her biri 5 set (25 set, 200 soru).**
- Kör çözüm pilotta 80/80 (bir yanlış çözücünün kendi dikkatsizliğiydi, sorulunca düzeltti), set 3–5'te 120/120.
- İnceleyiciler birbirine veya gerçek yerlere benzeyen 20'yi aşkın uydurma yer adını değiştirdi, başlıklardaki metin kelimelerini kaldırdı, Sprachbausteine'de ikinci doğru olabilecek seçenekleri değiştirdi („über die“, „allerdings“, „wodurch“, „entweder“), aynı sınavda iki kez geçen Plattdeutsch konusunu satranç dersiyle değiştirdi.
- Teil 3'teki x tuzakları her sette farklı: zorunlu meslek eğitimi, grup büyüklüğü, sözleşme süresi, erişilebilirlik, cihaz şartı.

**Düzeltmediğim notlar:** Vejetaryen kantin ve „ne istersen öde“ tiyatrosu Goethe B2'deki bazı konulara yakın (farklı bakış açısıyla). Sprachbausteine Teil 1 doğası gereği çoğunlukla bağlamdan bağımsız dil bilgisi.

### telc Deutsch C1 Hochschule Leseverstehen + Sprachbausteine: format tablosu
Kaynak: telc'in C1 Hochschule el kitabının özeti (arama sonuçları; resmî PDF'e ağdan erişilemedi). ✔ = kaynaklarda doğrulandı, ≈ = tahmin veya bizim kararımız. Leseverstehen ve Sprachbausteine birlikte 90 dk; bölüm süreleri yalnızca öneri (✔).

| Bölüm | Metin | Görev | Soru | Süre |
|---|---|---|---|---|
| Lesen Teil 1 · Textrekonstruktion | Akademik/popüler bilim metni ~450–550 kelime (≈) | Metinden çıkarılmış 6 cümle yerine konur (✔); 8 cümleden 2'si artar (≈) | 1–6 (✔) | ~20 dk (≈) |
| Lesen Teil 2 · Selektives Lesen | 4 kısa metin a–d (≈) | 6 ifade metinlere eşleşir (✔); bir metin birden çok kez seçilebilir (≈) | 7–12 (✔) | ~15 dk (≈) |
| Lesen Teil 3 · Detail- und Globalverstehen | Uzun akademik metin ~750–900 kelime (≈) | 11 ifade richtig/falsch/nicht im Text + 1 ana fikir sorusu (✔), ana fikir a–d (≈) | 13–24 (✔ sayı) | ~30 dk (≈) |
| Sprachbausteine | Tek metin (✔), ~380–450 kelime (≈) | 22 boşluk, her biri 4 seçenek, dil bilgisi ve sözcük (✔) | 25–46 (≈ numara) | ~25 dk (≈) |

- **Oynatıcı eklentisi:** yeni soru tipi `richtig-falsch-nichts` (Richtig / Falsch / Nicht im Text).

**Aşama 8 bitti: Lesen 3 Teil + Sprachbausteine, her biri 5 set (20 set, 230 soru).**
- Kör çözüm pilotta 91/92 (SB set-2 boşluk 29'daki ikinci okunabilen seçenek değiştirildi, yeniden çözümde doğru), set 3–5'te 157/157 (değişen pilot set de dahil).
- İnceleyiciler Goethe'deki konuları tekrar eden iki pilot metni (erteleme, can sıkıntısı) tamamen yeniden yazdı, ikinci okunabilen Sprachbausteine seçeneklerini değiştirdi („über die“, „allerdings“, „dessen“, „als“, „schauen“ …), uydurma kelimeli çeldiricileri gerçek kelimelerle değiştirdi, tarihsel ve bilimsel ifadeleri yumuşattı (Tambora, Pinatubo, Graunt 1662, Leeuwenhoek, Abbe).
- Başlık değişiklikleri: „Der Wert der Langeweile“ → „Wiesen unter Wasser“, „Prokrastination unter Studierenden“ → „Macht Musizieren klüger?“.

**Düzeltmediğim notlar:**
- Teil 3'teki ana fikir sorusunda (24) çeldiriciler aşırı genellemelerle elenebiliyor.
- Teil 2 set-3 („Sommerschulen im Ausland“) TestDaF'taki yaz okulu ilanlarıyla aynı metin türünde; konular farklı.
- Bazı popüler bilim arka planları gerçek araştırma alanlarını anımsatıyor (yön bulma deneyleri, lagün mercanları); veriler ve adlar uydurma.

### telc Deutsch B1 (Zertifikat Deutsch) Leseverstehen + Sprachbausteine: format tablosu
Kaynak: telc'in yayımladığı sınav yapısı ve örnek sınav açıklamaları (arama sonuçları). ✔ = kaynaklarda doğrulandı, ≈ = tahmin veya bizim kararımız. Lesen ve Sprachbausteine birlikte 90 dk (✔).

| Bölüm | Metin | Görev | Soru | Süre |
|---|---|---|---|---|
| Lesen Teil 1 | 10 başlık a–j, 5 kısa gazete metni (✔), metin başına ~60–90 kelime (≈) | Her metne bir başlık, beş başlık artar (✔) | 1–5 (✔) | 15 dk (≈) |
| Lesen Teil 2 | ~400 kelimelik gazete/dergi makalesi (≈) | a/b/c, metin sırasıyla (✔) | 6–10 (✔) | 20 dk (≈) |
| Lesen Teil 3 | 12 ilan a–l (✔), ~30–50 kelime (≈) | 10 durum ilanlara eşleşir; bir durum için ilan yok: x (✔) | 11–20 (✔) | 30 dk (≈) |
| Sprachbausteine Teil 1 | Yarı resmî/resmî mektup (✔), ~200 kelime (≈) | Her boşluk için a/b/c, dil bilgisi (✔) | 21–30 (✔) | 12 dk (≈) |
| Sprachbausteine Teil 2 | Mektup/rapor/duyuru (✔) | 15 kelimelik listeden 10 boşluk, beş kelime artar (✔) | 31–40 (✔) | 13 dk (≈) |

- **Oynatıcı eklentisi:** kelime listeli boşlukta seçilen kısa kelime boşluğun içinde görünüyor; testler Lesen dışındaki bölümleri (`sprachbausteine`) de dolaşıyor.
- **Bizim kararlarımız (≈):** örnek soru yok; Teil 3'te x tuzağı her sette başka bir nedene dayanıyor (yaş, yer, tarih, üyelik, dil).

**Aşama 4 bitti: Lesen 3 Teil + Sprachbausteine 2 Teil, her biri 5 set (25 set, 200 soru).**
- Kör çözüm pilotta 80/80, set 3–5'te 120/120 uyuştu.
- Çözücü SB2 set-4/39'da „damit“ yanında „darüber“ çeldiricisini de tartıştı; çeldirici „darauf“ ile değiştirildi, yeniden kör çözümde tek cevap çıktı.
- İnceleyiciler gerçek yer/marka adlarını (Ostheide, Kesselbrink, Hornsee, Rossmeier vb.) ve sitede tekrar eden adları değiştirdi, B1 üstü belirleyici kelimeleri açıkladı (vorverlegt, Gabelstapler, Belastungs-EKG), cümle başındaki „Ihr/Sie“yi kaldırdı.

**Düzeltmediğim notlar:**
- SB2 set-3 (su boruları, anahtar bırakma) konu olarak SB2 set-2'ye (su sızıntısı) yakın.
- Lesen T2 set-4 ve set-5 ikisi de meslek değiştirme portresi.
- Sprachbausteine Teil 1 soruları doğası gereği çoğunlukla bağlamdan bağımsız dil bilgisi.

### Ekteki TestDaF modelltestleri
Beş PDF'in hepsi **kâğıt tabanlı** TestDaF:
- Modelltest 01: Leseverstehen, Schriftlicher Ausdruck, Hörverstehen.
- Modelltest 02: Leseverstehen, Schriftlicher Ausdruck.

**Dijital modelltest yok.** Belgeler yalnızca format için kullanılıyor; depoya eklenmiyor, TestDaF aşamalarından sonra silinecek.

### TestDaF kâğıt tabanlı Leseverstehen: format tablosu
Kaynak: ekteki Modelltest 01 ve 02 (Leseverstehen). ✔ = belgelerde doğrulandı, ≈ = tahmin veya bizim kararımız.

| Bölüm | Metin | Görev | Soru | Süre |
|---|---|---|---|---|
| Lesetext 1 | Bir durum açıklaması ve 8 kısa metin A–H (✔). Biz: her biri ~55–85 kelime (≈) | 10 kişi/ihtiyaç metinlere eşleştirilir, her metin en fazla bir kez, uygun metin yoksa I (✔); iki örnek: 01 → A, 02 → I (✔) | 1–10 (✔) | ~10 dk (✔) |
| Lesetext 2 | ~600–700 kelimelik makale (✔ ~85 satır) | 10 çoktan seçmeli soru A/B/C, örnek 0, metin sırasıyla; son soru metnin bütünü hakkında (✔) | 11–20 (✔) | ~20 dk (✔) |
| Lesetext 3 | ~650–750 kelimelik daha akademik metin (✔ ~90 satır) | 10 ifade: Ja / Nein / Text sagt dazu nichts, iki örnek (01, 02), metin sırasıyla (✔) | 21–30 (✔) | ~20 dk (✔) |

Toplam 60 dk, cevap kâğıdına 10 dk aktarma dahil (✔).
- **Bizim kararlarımız (≈):** Lesetext 1'de A örnekte kullanılıyor; B–H birer kez, üç soru I. Lesetext 3'te ~4 ja / 3 nein / 3 nichts.
- **Oynatıcı eklentisi:** `ja-nein-nichts` tipi, iki örnek (`"01"`, `"02"`), `"none": "I"`.

**Aşama 2 bitti: 3 Lesetext × 5 set (15 set, 150 soru).** Pilot ve set 3–5 incelendi; kör çözüm pilotta 60/60, set 3–5'te 90/90 uyuştu. İnceleyiciler şunları düzeltti:
- metinle ortak anahtar kelimeler;
- gerçek araştırma bulgularının uydurma araştırmacılara mal edilmesi (sığırcık sürüleri, fonem tamamlama vb.);
- gerçek yer adları;
- tekrar eden adlar.

Çözücünün şüphe duyduğu 1.3/2'de F ilanının hedef kitlesi „in den ersten beiden Semestern“ olarak netleştirildi.

**Düzeltmediğim notlar:**
- Lesetext 2'nin bazı genel sorularında çeldiriciler kolayca eleniyor.
- 3.4/26 ve 3.4/30 nichts sınırında; çözücü yine de doğru cevabı verdi.
- „Grüne Dächer gegen Hitze“ konusu B2'deki „Stadtbäume in der Hitze“ setine yakın.

### TestDaF dijital Lesen: format ve karar tablosu
Dijital modelltest ekte yoktu. Kaynak: testdaf.de'deki test yapısı ve demo görevlerinin açıklamaları (arama sonuçları). Toplam 7 görev, 34 soru, ~55 dk (✔). Görev ayrıntıları ve süreler kısmen tahmin (≈).

| Aufgabe | Görev (kaynak) | Soru | Bizim çözümümüz |
|---|---|---|---|
| 1 | Lückentext ergänzen: her boşluk için verilen seçeneklerden biri (✔), 4 seçenek (≈) | 5 | Var olan a/b/c/d boşluk soruları (C1 Teil 1 gibi). Yapılabilir |
| 2 | Textabschnitte ordnen: paragrafları sürükleyerek sıralama (✔) | 4 | Sürükle-bırak yerine her paragrafa sıra numarası (2–5) seçilir; telefonda da rahat sayı düğmeleri (`reihenfolge`). Eklendi (2026-10-26) |
| 3 | Multiple Choice, uzun metin (✔) | 7 | a/b/c. Yapılabilir |
| 4 | Sprachhandlungen zuordnen: metindeki bölümlere dil eylemi (eleştirmek, örneklemek …) atama (≈ ayrıntı) | 4 | Metinde numaralı bölümler, seçenekler etiketli kısa metinler (zuordnung). Yapılabilir |
| 5 | Aussagen Kategorien zuordnen (✔ ad), kategori sayısı (≈ 3) | 7 | Kategoriler etiketli metin, her ifade için açılır liste. Yapılabilir |
| 6 | Aussagen einem Begriffspaar zuordnen (✔ ad) | 4 | İki kategorili eşleştirme; A1 Teil 2'deki a/b düğmeleriyle. Yapılabilir |
| 7 | Fehler in Zusammenfassung erkennen: özetteki 3 yanlış cümleye tıklama (✔) | 3 | Özet üç paragrafa bölünür, her paragraftaki cümleler tıklanır ve yanlış olan seçilir (`fehlersatz`). Eklendi (2026-10-26) |

**Aşama 3 bitti: 5 Aufgabe × 5 set (25 set, 135 soru).** Aufgabe 1, 3, 4, 5 ve 6 yapıldı.

**Atlanan görevler (sonradan eklendi):** Aufgabe 2 ve 7 ilk turda atlanmıştı; 2026-10-26'da basit yöntemlerle eklendi (aşağıdaki not).

**Kör çözüm:** pilotta 54/54, set 3–5'te 81/81 uyuştu. Çözücünün işaretlediği üç soru netleştirildi ve yeniden kör çözümde 3/3 uyuştu:
- 1.3/2: „hingegen“ için açık bir karşıtlık eklendi (başka üniversiteler yasakladı).
- 3.4/13: karşılaştırma grubu artık aynı sayılarla daire biçimli tahtada oynuyor; tek fark diziliş.
- 3.3/12a: daha az iddialı yazıldı.

**Düzeltmediğim notlar:**
- Aufgabe 6'da neden/sonuç ve fırsat/risk ifadelerinin bir kısmı dilden tahmin edilebiliyor.
- Aufgabe 4'te artan iki dil eylemi işaretsiz komşu cümlelerde duruyor.

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
