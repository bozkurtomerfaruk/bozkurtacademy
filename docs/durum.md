# Durum

Öğrenci sistemi çalışmasının güncel durumu. Plan: `docs/plan-ogrenci-sistemi.md`.

## 2026-11-11 · Almanca Alfabe: G'nin çocuk örneği "die Gabel"

- "die Giraffe" (G /ʒ/ okunuyor, öğretici değil) yerine "die Gabel 🍴 çatal" (/ɡaːbəl/, okunuş "gaabel"). Ses üretildi; Giraffe klibi ve üç alternatifi kaldırıldı.

## 2026-11-11 · Almanca Alfabe: öğretmenin ses kontrolü uygulandı

- Kontrol sonucu (sürüm da13b1d9136a): 15 harfin `sesMetni` değişti (B, C, F, G, I, K, M, N, Q, R, U, Z, Ö, Ü, ß); bunlarla birlikte S, V, W, Ä'da da seçilen alternatif çekimin kendisi oyuna alındı (`--alternatif`, 19 klip).
- Giraffe yeniden üretildi ve üç alternatif eklendi (sonra G örneği Gabel ile değiştirildi; kelime alternatifleri desteği duruyor).
- Sırada: değişen harflerin ve Gabel'in yeniden dinlenmesi (`tools/audio-check-offline.html`).

## 2026-11-10 · Almanca Alfabe: sesler ücretsiz ve yerel (Piper + Chatterbox)

- Google yerine varsayılan `yerel`: Almanca Piper `de_DE-thorsten-medium` (CC0), Türkçe Chatterbox Multilingual (MIT); Whisper birkaç adaydan en iyi anlaşılanı seçiyor. Kurulum `scripts/alfabe-ses/kur.sh` / `kur.ps1`, modeller `.tts-modeller/` (git'e girmez).
- 125 klibin hepsi üretildi ve commit edildi. Lisans kontrolü: `audio/alfabe/LISANS.md` (Piper'ın Türkçe sesi ve lessac/ryan'dan türetilenler ticari olmadığı için kullanılmadı).
- Harf adları `data/alfabe.json` → `sesMetni` (ör. V "Fau.", Y `[[ ˈʏpsilɔn ]]`), alternatifleri `tools/audio-check.html`'de yan yana.
- **Öğretmenin kulak onayı bekleniyor** (özellikle harf adları, Ä/Ö/Ü/ß, Türkçe talimatlar).

## 2026-11-09 · Almanca Alfabe: önceden üretilmiş ses dosyaları

- Seslendirilen 125 klip (30 harf, 60 kelime, 3 işaret, 11 soru, 11 cevap, 10 sabit cümle) `js/alfabe-logic.js` → `audioClips` ile tek listede; dosyalar `audio/alfabe/<dil>/<ad>.mp3`.
- `scripts/generate-alfabe-audio.mjs`: Google (varsayılan), Azure ya da ElevenLabs ile üretim; anahtar sadece `.env`'de; eksik/metni değişen klipler; ffmpeg ile 48 kbit/sn mono; kendi kayıtların korunur. Henüz ses üretilmedi (anahtar yok): oyun şimdilik cihaz sesiyle çalışıyor.
- `js/alfabe-audio.js`: HTMLAudioElement, tek ses, ilk dokunuştan önce sessiz, yavaş 0,75, dosya yoksa cihaz sesi (en iyi yerel ses).
- Kontrol sayfası `tools/audio-check.html` (yayına girmez). Gizlilik metni (TR/DE/EN) ses dosyaları için güncellendi.

## 2026-11-08 · Almanca Alfabe: alıştırma kartı, sade okunuşlar, hesapta ilerleme

- Alıştırmalar (A1) "Çocuklar için" bölümünde Artikel Evleri'nin yanında "Almanca Alfabe" kartı (TR/DE/EN). `quiz.js` v31, `app.js` v37, `artikel-evleri.css` v2.
- `data/alfabe.json`: okunuşlar fonetik işaretsiz (uzun ünlü çift harf: "foogel", "tsebra"); `alfabe.json?v=2`.
- Giriş yapmış onaylı öğrencinin ilerlemesi `users/{uid}/progress/alfabe` belgesinde (`js/account/alfabe-sync.js`); girişte yerel ilerleme en iyi değerlerle birleşir. Kurallar + 5 kural testi, öğrenci silinince belge de siliniyor. Gizlilik metni (TR/DE/EN) madde 5 ve localStorage maddesi güncellendi.
- Testler: `npm run test:alfabe-account` (emülatör, 16 kontrol), `tests/alfabe.mjs` kart kontrolleri.
- **Yayından önce:** `firestore.rules` Firebase Console'da yayınlanmalı; yoksa canlıda hesaba yazma reddedilir (oyun yerelde çalışmaya devam eder).

## 2026-11-08 · Almanca Alfabe oyunu (`/almanca-alfabe/`)

- Yeni statik sayfa: profil seçimi (Çocuk / Yetişkin, ilerleme ayrı), beş mod (Harfleri Keşfet, Duy ve Seç, İlk Harf, Buchstabieren, Sıraya Diz), 10 soruluk tur, 1–3 yıldız, "Zor harflerimi çalış", yetişkinde Zamana Karşı ve seri puanı.
- Veri `data/alfabe.json`, mantık `js/alfabe-logic.js`, arayüz `js/alfabe.js`, stil `css/alfabe.css`. Ayrıntı ve yeni kelime ekleme: `docs/alfabe-oyunu.md`.
- Bağlantılar: footer "Ücretsiz çalış" grubu ve A1 kurs sayfası (Temeller).
- Gizlilik metni (TR/DE/EN): localStorage `baAlfabe` ve cihazdaki sesle okuma eklendi.
- Testler: `tests/alfabe-logic.test.mjs` (CI) ve `tests/alfabe.mjs` (tarayıcı; 320/390/1280 px, açık/koyu, ses yok, depolama kapalı).

## 2026-11-09 · Madde 7 Aşama B canlıda; yeni öncelik sırası

- **Canlı deneme başarılı (senin denemen):**
  - Firestore kuralları yayınlandı.
  - Deneme öğrencisinin metni için taslak öğretmen paneline geldi.
  - Taslak onaylandı; öğrenci panelinde işaretli hatalar göründü.
- **Güvenlik:** Araştırmada kullanılan Cloudflare deneme API token'ı silindi. Worker bu token'ı kullanmıyor.
- **Yeni öncelik sırası (2026-11-09):**
  1. Schreiben'i genişletmek:
     - önce Goethe B1 Teil 2 ve 3;
     - sonra telc B1, DTZ, Goethe A2 ve Goethe B2;
     - her sınav/seviye ayrı PR;
     - yapay zekâ talimatı görev türüne uygun (resmî / yarı resmî / gayriresmî e-posta, forum yazısı).
     - Önce plan onaya sunuluyor.
  2. Madde 9: info@bozkurtacademy.com için Cloudflare Email Routing → Gmail ve Gmail'den bu adresle gönderme rehberi.
  3. Sonra madde 8 (Sprechen) ve Kayıp Harf Treni.

## 2026-11-08 · Madde 7 Aşama B: Worker bağlandı

- Kurulumu sen yaptın: Worker (`schreiben-kontrol.bozkurtt-omerfaruk.workers.dev`), Workers AI bağlantısı, yapay zekâ hesabı, değişkenler.
- `firestore.rules`: `aiUid` = yapay zekâ hesabının UID'si. `js/account/config.js` → `AI_WORKER_URL`, `scripts/csp.mjs` → `AI_WORKER_ORIGIN` (sayfalar yeniden üretildi).
- Dışarıdan kontrol: izinli kökenler (bozkurtacademy.com, www) 204; yabancı köken 403; belirteçsiz ve sahte belirteçli istek 401. Worker ayakta ve CORS ayarı doğru. Firebase anahtarı, yapay zekâ hesabının şifresi ve AI bağlantısı ancak gerçek bir öğrenci gönderimiyle (rehberin 8. adımı) denenebilir.
- **Sıradaki:** Kuralları yayınla → rehberin 8. adımındaki deneme → deneme API token'ını sil.

## 2026-11-07 · Madde 7 Aşama B: Schreiben yapay zekâ kontrolü (Gemma 4, Cloudflare Workers AI, Free plan)

- **Nasıl çalışıyor:** Onaylı öğrenci metni gönderince (Aşama A) tarayıcı Cloudflare Worker'a (`worker/schreiben-kontrol.js`) sadece metnin kimliğini bildiriyor. Worker:
  1. öğrencinin Firebase oturumunu doğruluyor;
  2. ayrı bir "yapay zekâ hesabı" ile Firestore'dan modu, öğrencinin iznini ve metni okuyor;
  3. Gemma 4 26B'ye (düşünme kapalı) **sadece metni ve görev adını** gönderiyor; ad, e-posta, uid gitmiyor;
  4. sonucu denetliyor (yanlış kısım metinde geçmek zorunda; uydurma öneriler eleniyor) ve kaydediyor.
- **Mod (öğretmen paneli, `settings/ai`):** Kapalı / **Taslak (varsayılan)** / Anında göster.
  - Taslak: öneriler `aiDrafts/<uid>_<metin>` belgesine gidiyor. Öğrenci bunu hiçbir zaman göremiyor (kural + test). Öğretmen öğrenci sayfasında her öneriyi düzeltip ya da çıkarıp **Onayla ve öğrenciye gönder** diyor ya da **Taslağı sil**iyor. Kendisi de yazabiliyor.
  - Anında göster: öğrenci öneriyi hemen "Otomatik öneri (öğretmenin henüz bakmadı)" etiketiyle görüyor; öğretmenin geri bildirimi yine bekleniyor.
- **Öğrenci paneli:** Onaylanan geri bildirimde hatalı yerler metinde numarayla işaretli; altında "yanlış → doğru + Türkçe açıklama" listesi, öğretmenin notu, "öğretmenin kontrol edip onayladı/düzeltti" etiketi ve açılır düzeltilmiş metin var (TR/DE/EN).
- **16 yaş altı (kararın):** Velinin ayrı ve isteğe bağlı yapay zekâ onayı olmadan kontrol yapılmıyor. Öğretmen öğrenci sayfasında **Velinin yapay zekâ onayı alındı** (tarih, yöntem) ya da **geri çekti** diyebiliyor. Yetişkinlerde açık; öğrenci istemezse öğretmen kapatabiliyor.
- **Sınırlar (kararın):** Öğrenci başına günde 3, site genelinde günde 600 kontrol (Berlin günü, `aiLimits`). Workers AI'ın ücretsiz kotası (günde 10.000 Neuron, yaklaşık 800 metin) dolarsa Free planda istek duruyor, ücret çıkmıyor.
- **Talimat:** Hâl adları sözlüğü (Akkusativ = -i hâli …), fiil sırası kuralları, gösterme zamiri der/die/das kuralı, çok anlamlı kelimelerde bağlam kuralı.
- **Veli onay formu (TR/DE):** Yazma görevi metinleri veri listesine eklendi; yeni 3a maddesi (Cloudflare, sadece metin ve görev adı, eğitim yok, saklama yok, AB dışı DPF/SCC) ve ayrı onay kutusu.
- **Gizlilik metni (TR/DE/EN):** Yeni 6a bölümü (`privacy.html#yapay-zeka`): hizmet, gönderilenler, eğitim/saklama, taslak, sınırlar, 16 yaş altı, hukuki dayanak.
- **Silme:** Öğrenci silinince taslakları ve günlük sayacı da siliniyor.
- **Kurulum:** `docs/yapay-zeka-kurulum.md` — kart istemeyen 9 adım. Kurulana kadar (`AI_WORKER_URL` boş) site Aşama A gibi çalışıyor.
- **Kurallar:** `aiUid` (şimdilik yer tutucu `YAPAY-ZEKA-HESABI-UID`), `aiDrafts`, `aiLimits`, `settings`, metne `aiFeedback` (sadece Anında modunda, bir kez).
- **Testler:**
  - `npm test`: 159/159 (kural testleri + Worker testleri 12 + diğerleri).
  - `npm run test:schreiben-ai` (emülatör, Worker Node'da, sahte yapay zekâ): bütün akış; 390/1440 açık/koyu taşma yok.
  - `npm run test:schreiben`, `tests/schreiben.mjs`, `test:csp`, `test:placement` tekrar geçti.
- **Senin yapacakların (birleştirmeden sonra):** Kurulum rehberindeki adımlar; bana yapay zekâ hesabının UID'sini ve Worker adresini gönder; kuralları yayınla; deneme başarılı olunca deneme API token'ını sil.

## 2026-11-07 · Madde 7 Aşama A: Schreiben (yapay zekâsız), pilot Goethe B1 Teil 1

- **Görevler:** `#exams/goethe/b1/schreiben/1/set-1` … `set-5`; sınav hazırlığında Goethe B1 › Schreiben › Teil 1. Beş özgün görev:
  - Neue Wohnung
  - Geburtstag verpasst
  - Neue Arbeit
  - Zurück vom Urlaub
  - Abendkurs
- **Her görevde:**
  - Almanca durum ve 3 madde; "circa 80 Wörter" talimatı.
  - Canlı kelime sayacı: 70–100 arası iyi; altında ve üstünde uyarı verir ama göndermeyi engellemez.
  - Sınav kriterlerine göre Türkçe kontrol listesi (görevi yerine getirme, metnin düzeni, kelime ve dil bilgisi); kaydedilmez.
  - Konuya özel Redemittel (Almanca ve Türkçe).
  - Gönderince açılan örnek cevap (73–80 kelime) ve kısa Türkçe notlar.
  - Yazım denetimi kapalı (sınavdaki gibi). Taslak, sayfa kapanırsa kaybolmasın diye bu cihazda (`baWriting:…`) duruyor.
- **Ziyaretçi:** Görevi çözüp örnek cevabı görebiliyor; Firebase hiç yüklenmiyor, metin hiçbir yere gitmiyor; "kaydedilmedi, giriş yap" notu çıkıyor.
- **Giriş yapmış ve onaylı öğrenci:** Metni `users/{uid}/writings`'e kaydediliyor.
  - Kayıtta görev, metin, kelime sayısı ve sunucu zamanı var. Metin en fazla 4.000 karakter.
  - Gönderilen metin değiştirilemez ve silinemez; öğrenci sadece "geri bildirimi gördüm" zamanını işaretleyebilir.
  - Her gönderim ayrı bir deneme olarak kaydediliyor.
  - Günde en fazla 10 gönderim: ilk gönderimden başlayan 24 saatlik pencerede 10 metin (`users/{uid}/limits/writing`). Kurallar sunucunun takvim gününü bilemediği için sınır 24 saatlik pencere olarak uygulanıyor; öğrenci "bugünlük sınır doldu" mesajını görüyor.
  - Onaylanmamış hesapta metin kaydedilmiyor; bilgi notu çıkıyor.
- **Öğretmen:**
  - Panelin üstünde "Geri bildirim bekleyen N yazı (M öğrenci)" yazıyor.
  - Öğrenci satırında "N geri bildirim bekliyor" işareti var; işaret detaydaki **Yazma görevleri** bölümüne gidiyor.
  - Detayda metin olduğu gibi görünüyor. Geri bildirim yazılıp kaydedilebiliyor ya da sonradan güncellenebiliyor (en fazla 2.000 karakter). Öğrenci okuyunca "Öğrenci okudu" çıkıyor.
- **Öğrenci paneli:** Yeni geri bildirim gelince panelin üstünde "Öğretmeninden N yeni geri bildirim var" yazıyor; bölüm başlığında sayaç, metnin yanında kırmızı nokta görünüyor. Öğrenci açınca işaret kalkıyor.
- **Ödev:** Ödev ekranında B1 için "Schreiben (sınav hazırlığı)" konusu çıkıyor ve 5 görev seçilebiliyor. Öğrencinin ödevindeki bağlantı doğrudan göreve gidiyor.
- **Saklama (kararın):** Metinler ve geri bildirimler, öğrencinin diğer verileriyle birlikte son dersten 12 ay sonra siliniyor. Öğretmen panelindeki "Silinmesi gereken kayıtlar" ile öğrenci silindiğinde `writings` ve `limits` de siliniyor.
- **Gizlilik metni (TR/DE/EN):** Yazma görevleri öğrenci hesabı verilerine, saklama süresine ve tarayıcıda tutulanlara (`baWriting:…`) eklendi. Tarih 7 Kasım 2026.
- **Kurallar:** `firestore.rules`'a `writings` ve `limits` eklendi. Kural testleri 138/138 geçti; bunların 14'ü yeni.
- **Testler:**
  - `tests/schreiben.mjs` (ziyaretçi): 39/39.
  - `npm run test:schreiben` (emülatörde hesap akışı): 29/29.
  - Önceki testler de geçti: seviye sonu sınavı hesabı ve seviye testi.
- **Denetim:** `check-exams` Schreiben setlerini de denetliyor:
  - görev ve kelime hedefi;
  - kontrol listesi kriterleri;
  - Redemittel'in Almanca ve Türkçe karşılıkları;
  - örnek cevabın 70–100 kelime aralığında olması.
- **Önbellek:**
  - `app.js` v36, `account.css` v5, `session.js` v3 (bütün sayfalarda);
  - `examsData.js` v16, `exams.js` v8;
  - yeni dosyalar `writing-task.js` v1 ve `writing-task.css` v1.
- **Durum:** PR açık. Birleştirildikten sonra **Firestore kurallarının Firebase Console'da yayınlanması** gerekiyor; o zamana kadar canlıda kayıt reddedilir, öğrenci "kaydedilemedi" notunu görür.

## 2026-11-06 · Yeni öncelik sırası ve madde 6 (yapay zekâ araştırması, Schreiben)

**Öncelik sırası (öğretmenin kararı, 2026-11-06).** Her iş yine ayrı dal ve ayrı PR olarak yapılıyor; öğretmen onaylamadan birleştirilmiyor.

1. Yarım kalan iş varsa önce o bitirilecek. Bu, madde 6 denemesiydi; bu PR'la tamamlandı.
2. Madde 6 şimdilik sadece Schreiben'e bakıyor; Sprechen (ses tanıma) sonraya kaldı.
3. Madde 7, sınav hazırlığında Schreiben, iki aşamada yapılacak:
   - **Aşama A (yapay zekâsız):** Önce Goethe B1 Teil 1 pilotu.
     - Görev metni, kelime sayacı, kendi kendini kontrol listesi, gönderince açılan örnek cevap ve kalıp ifadeler olacak.
     - Giriş yapmış öğrencinin metni Firestore'a kaydedilecek. Öğretmen öğrenci detayında okuyup geri bildirim yazacak; öğrenci bunu kendi panelinde görecek. Görev ödev olarak da verilebilecek.
     - Giriş yapmamış ziyaretçi görevi çözüp örnek cevabı görebilecek; metni kaydedilmeyecek.
     - Spark planında kalınacak; kurallar ve testleri güncellenecek; metin boyutuna sınır konacak.
     - Kodlamadan önce görev formatı, ekran taslağı ve veri yapısı onaya sunulacak.
   - **Aşama B (yapay zekâ kontrolü):** Madde 6'da kurallara uyan ve kalitesi yeterli bir çözüm çıkarsa Aşama A'nın üstüne eklenecek: hatalar metin içinde işaretli, Türkçe açıklama, düzeltilmiş metin. Çıkmazsa Aşama A öğretmenin elle verdiği geri bildirimle devam edecek.
4. Bunlardan sonra Sprechen (madde 8) ve Kayıp Harf Treni gelecek. E-posta (madde 9) bağımsız; araya girebilir.

**Madde 6 sonucu (ayrıntı: `docs/yapay-zeka-arastirma.md`):**

- **Kurallara uyan servisler:**
  - Cloudflare Workers AI: günde 10.000 Neuron ücretsiz; kota dolunca hata verip duruyor; veriyi eğitimde kullanmıyor ve saklamıyor.
  - Groq (yedek): ücretsiz katman kart istemiyor; veriyi kullanmıyor; veri ABD'de; şartlarda 18 yaş maddesi var.
- **Elenenler:**
  - Gemini: ücretsiz katmanda veriyi eğitimde kullanıyor ve 18 yaş altına yönelik sitelerde kullanılamıyor.
  - Mistral: ücretsiz modda veriyi varsayılan olarak eğitimde kullanıyor.
- **Kalite:** Bu ortamda denenebilen ücretsiz modeller (gpt-oss-20b, Gemma 3 12B) ve LanguageTool **yetersiz**. Hataları büyük ölçüde buluyorlar, ama Türkçe açıklamalar yanlış ya da tutarsız; hatasız metinde hata uydurabiliyorlar.
- **Asıl karar için:** Cloudflare'in ücretsiz katmanındaki büyük modeller (gpt-oss-120b, Llama 3.3 70B, Mistral Small 3.1, Gemma 4 26B) bu makineye sığmadı. Öğretmenin açacağı ücretsiz bir Cloudflare hesabıyla aynı beş metinde denenmeli.
- **Sprechen için not:** Whisper bazı ek hatalarını yazıya geçirirken kendiliğinden düzeltiyor ("mein Freund" → "meinen Freund").
- **Ağ:** Bu oturum "bozkurtacademy" ortamına taşındı. Ortamın izinli adreslerine resmî belge siteleri ve Hugging Face eklendi (öğretmen onayıyla).
- **Durum:** Belge PR'ı açık, onay bekliyor. Madde 7 Aşama A tasarımı onaya sunuldu.

## 2026-11-06 · Artikel Evleri: kayıtlı ses dosyaları

- **Ne değişti:** Kelimeler önce sitenin kendi MP3 dosyalarıyla okunuyor. Dosya yoksa ya da çalınamazsa cihazın Almanca sesine, o da yoksa sessiz moda geçiliyor. İnternet üzerinden çalışan sesler (Google Deutsch vb.) kararın gereği kapalı.
- **Ses ve lisans:**
  - Ses Thorsten-Voice'tan (Thorsten Müller); kayıtların lisansı CC0, yani kamu malı.
  - Model Coqui TTS'nin Thorsten modelleri (VITS; bazı kelimelerde Tacotron2 + HiFi-GAN); lisansları Apache 2.0, kaynak Coqui'nin resmî model listesi.
  - Ticari kullanım serbest; atıf ve lisans metni `data/cocuk/ses/LISANS.md` ve `LICENSE-Apache-2.0.txt` dosyalarında. Oyunun altında kısa bir atıf satırı var (TR/DE/EN).
  - Kullanılmayanlar: Piper'ın Almanca sesleri (ticari kullanımı yasak Ryan sesinden türetilmiş ya da lisansı doğrulanamadı), pavoque, XTTS ve YourTTS (ticari kullanım yasak).
- **Dosyalar:**
  - `data/cocuk/ses/` klasöründe her kelime için iki dosya var: "hund.mp3" (Dinle düğmesi) ve "der-hund.mp3" (doğru cevaptan sonra).
  - 96 dosya, yaklaşık 427 KB; seslerin hepsi en fazla 6 KB. Dosyalar kelime ekrana gelince yükleniyor.
  - Hangi kelimenin dosyası olduğu `data/cocuk/sesler.json` listesinde; bu listeyi `node scripts/kids-audio.mjs` üretiyor ve `check-kids-games` CI'da denetliyor.
- **Sorunlu 7 kelime (Wasser, Tisch, Stuhl, Uhr, Ball, Puppe, Tasche):**
  - İlk sürümleri beğenmedin. 238 aday ürettim: noktalama, "Das ist der Tisch." cümlesinden kesme, yavaş konuşma, Tacotron2 ve Puppe için doğru okunuş ("pʊpə").
  - Her biri için en iyi iki adayı dinledin ve seçtin. Tisch'te taşıyıcı cümleden kesilen sürümü, diğerlerinde B'yi aldın: çoğu Tacotron2, Uhr/Ball/Tasche artikelli hâli yavaş VITS, Tasche tek başına cümleden kesilmiş. Ayrıntı `scripts/cocuk-ses/README.md`'de.
  - Böylece 48 kelimenin 96 sesinin hepsi dosyadan çalıyor (toplam 427 KB); cihaz sesi sadece yedek.
- **Üretim betikleri:** `scripts/cocuk-ses/` (README'de kurulum, modellerin adresleri ve yöntem). Seslerin hiçbiri sitede üretilmiyor.
- **Gizlilik:** Oyunun dosyaları bu siteden (GitHub Pages) yüklendiği ve cihaz sesinin sadece yedek olduğu yazıldı (TR/DE/EN); tarih 6 Kasım 2026. Yeni bir veri ya da üçüncü taraf yok.
- **Test:**
  - `tests/artikel-evleri.mjs` 107 kontrolün hepsini geçti. Yeni kontroller:
    - dosya çalıyor ve Dinle artikeli söylemiyor;
    - dosyası olmayan ya da bozuk dosyada cihaz sesine geçiliyor;
    - cihaz sesi yokken dosya yine çalıyor;
    - dosyalar sadece bu siteden yükleniyor;
    - atıf satırı görünüyor.
  - `test:placement` geçti. Gizlilik sayfasındaki bağlantı kontrolü artık kaydırmanın bitmesini bekliyor; Almanca metin uzayınca telefonda 600 ms yetmiyordu.
- **Önbellek:** `app.js` v35, `artikel-evleri.js` v2.
- **Durum:** Seçtiğin 14 ses eklendi; PR #61 birleştirildi (2026-11-06). **Madde 5'in ilk oyunu tamamlandı.**

## 2026-11-05 · Çocuklar için: Artikel Evleri (madde 5, ilk oyun)

- **Sayfa:** `#artikel-evleri`. Alıştırmalar sayfasında A1 konu listesinin sonunda "Çocuklar için" kartı var. Bir konu seçilince `#artikel-evleri/<konu>` açılıyor; bu bağlantı doğrudan paylaşılabiliyor.
- **Oyun:** Resim, kelime (artikelsiz) ve Türkçe anlamı ekranda. Çocuk der, die ya da das evine dokunuyor.
  - Doğru cevapta o evin bir penceresi yanıyor ve "Evet! der Hund – köpek" yazıyor.
  - Yanlış cevapta ev sallanıyor, "der değil. Başka bir ev dene." yazıyor ve o ev kapanıyor.
- **Skor (kararın):** Sadece ilk denemede doğru bilinen kelimeler sayılıyor. Bitiş ekranında "12 kelimeden 9'unu ilk denemede bildin." yazıyor. Konu başına en iyi skor bu sayıya göre tutuluyor; daha iyi bir oyunda "Yeni rekor!" çıkıyor.
- **Dinle (kararın):** Düğme sadece kelimeyi okuyor. Artikel ancak doğru cevaptan sonra okunuyor ("der Hund").
- **Ses:**
  - Sesi tarayıcının cihazdaki Almanca sesi üretiyor; ses açma/kapama düğmesi var ve ayar saklanıyor.
  - Sadece cihazda çalışan sesler kullanılıyor. İnternet üzerinden çalışan sesler (ör. bilgisayardaki Chrome'un "Google Deutsch" sesi) okunacak kelimeyi Google'a gönderdiği için kullanılmıyor.
  - Almanca ses yoksa küçük bir not çıkıyor, "Dinle" düğmesi gizleniyor ve oyun sessiz, hatasız devam ediyor.
- **Kelimeler (kararın):** 4 konu, her biri 12 kelime ve 4 der / 4 die / 4 das.
  - Yiyecekler: Apfel, Kuchen, Käse, Salat · Banane, Erdbeere, Tomate, Pizza · Brot, Ei, Eis, Wasser
  - Evde: Tisch, Stuhl, Schrank, Fernseher · Lampe, Tür, Uhr, Kerze · Haus, Bett, Fenster, Sofa
  - Okul ve oyun: Ball, Bleistift, Rucksack, Computer · Puppe, Gitarre, Schule, Tasche · Buch, Heft, Bild, Geschenk
  - Dışarıda: Hund, Vogel, Baum, Bus · Katze, Blume, Sonne, Brücke · Auto, Flugzeug, Schiff, Fahrrad
  - Hepsi kontrol ettiğin sözlükten geliyor. Artikel ve anlam `data/sozluk.json`'dan okunuyor; birden çok anlamı olan kelimede ilk anlam gösteriliyor (Eis → dondurma).
  - Sözlükte die ile biten hayvan sadece Katze olduğu için "Hayvanlar" yerine "Dışarıda" konusu yapıldı. Sözlüğe yeni kelime eklenmedi. Schwein, aileler için hassas olabileceği için alınmadı.
- **Resimler:** 48 kelimenin hepsi elle çizilmiş sade SVG; emoji yok. Resimler `data/cocuk/resimler.json`'da, Kayıp Harf Treni için Fisch de hazır.
- **Kontrol:** `node scripts/check-kids-games.mjs` (CI'da da çalışıyor) şunları denetliyor:
  - her kelime sözlükte var, kontrol edilmiş, "emin değilim" değil ve tek artikelli;
  - her konuda der/die/das sayısı eşit;
  - her kelimenin resmi var ve resimlerde sadece çizim var.
- **Veri:**
  - Hesap yok, form yok, sunucuya gönderim yok.
  - Tarayıcıda sadece `baKelimeOyunlari` (ses ayarı ve konu başına en iyi skor) duruyor.
  - "Hesap yok, form yok…" notu oyunun altında duruyor.
- **Gizlilik metni:** localStorage listesine `baKelimeOyunlari` ve cihazdaki sesle okuma eklendi (TR/DE/EN). Madde 4'te eksik kalan `baLevelExam:…` (yarım kalan sınav denemesi) da eklendi. Tarih 5 Kasım 2026 oldu.
- **Telefon:** Evler en az 88×88 px. Sitenin alttaki "Ücretsiz bilgi al" çubuğu oyunda ve seviye sonu sınavında artık gizli, çünkü "Sonraki kelime" düğmesinin üstüne biniyordu.
- **Renkler:** der/die/das renkleri `css/base.css`'e token olarak eklendi (`--ba-der`, `--ba-die`, `--ba-das`, açık ve koyu tema).
- **Önbellek:**
  - `app.js` v32, `base.css` v10 ve `analytics.js` v7 (bütün sayfalarda);
  - `quiz.js` v28;
  - yeni dosyalar `artikel-evleri.js` v1 ve `artikel-evleri.css` v1.
- **Test:** `tests/artikel-evleri.mjs`, 75 kontrol, hepsi geçti. Kapsadıkları:
  - kart, konular, ilk deneme skoru ("11'ini", "12'sini", "3'ünü"), en iyi skor ve rekor;
  - Dinle, ses kapalı, ses yok;
  - derin bağlantı, kayıt yazılamazken oyun, dışarıya gönderim yok;
  - TR/DE/EN, 390/1440 açık/koyu, taşma.
- **Seviye testi testi:** `npm run test:placement` gramer yorumları değişikliğinden (`3fc5be1`) beri gizlilik bölümünde 18 kontrolde kalıyordu ("İki istisna" cümlesi, yorum silme için eklenen 5. e-posta bağlantısı). Beklentiler metnin bugünkü hâline göre düzeltildi; 233 kontrol geçti.
- **Durum:** PR #54 birleştirildi (2026-11-06). Kayıp Harf Treni sonra ikinci oyun olarak eklenecek.

## 2026-11-04 · Seviye sonu sınavı: B1 (madde 4'ün son adımı)

- **Sayfa:** `#seviye-sonu/B1`, B1 konu listesinin sonundaki karttan açılıyor. Kod ve kural değişikliği yok; ekran, kayıt, öğretmen detayı ve ödev A1/A2 gibi çalışıyor.
- **Dağılım (onayladığın):** Relativsätze, Passiv, Konjunktiv II, Konnektoren 3'er; Kausalsätze, Infinitiv mit zu, Genitiv, N-Deklination, Präteritum vertieft, Plusquamperfekt, Indirekte Fragen, Pronominaladverbien, Satzstellung 2'şer.
- **Havuz:** `data/seviye-sonu/b1.json`, 60 soru (dağılımın iki katı), her birinde kendi Türkçe açıklaması var.
- **İkinci doğru cevap kontrolü:**
  - **Konjunktiv II:** Hiçbir soruda hem "würde + Infinitiv" hem "hätte/wäre" doğru değil (würde sadece "an deiner Stelle … schlafen" tavsiyesinde; "Würden Sie …?" kibar soruda şık değil). "als ob + Indikativ" konuşma dilinde kabul edildiği için o tür soru konmadı.
  - **Konnektoren:** Aynı soruda eş anlamlı bağlaç (deshalb/deswegen/darum) yok. Her soruda fiilin yeri ya da çift bağlacın ikinci parçası tek seçeneğe indiriyor.
  - **Kausalsätze:** denn / weil / da fiilin yeriyle ayrılıyor; aynı soruda weil ile da birlikte doğru olamıyor.
  - **Relativsätze:** Hâli yan cümledeki fiil ya da edat belirliyor (helfen → der, mit → denen, in + Wo → der); "wo" ve "welche" şık değil.
  - **Passiv:** Zustandspassiv'in de savunulabileceği şıklar (ist … geliefert, muss … übersetzt sein) çıkarıldı.
  - **Indirekte Fragen:** ob/wann karışmasın diye her soruda asıl soru ya da cevap veriliyor.
  - **Pronominaladverbien:** "Wovon sprecht ihr?" de doğru olduğu için o şık çıkarıldı.
  - **Präteritum / Plusquamperfekt:** Şimdiki zamanın ya da Perfekt'in de kabul edilebileceği cümlelere zaman belirteci eklendi; konuşma dilinde kabul edilen "weil sie schlecht geschlafen hat" şıkkı çıkarıldı.
- **Önbellek:** `level-exam.js` v3 (katalog v9).
- **Test:** `tests/level-exam.mjs` B1'i de kapsıyor (kart, 30 soru ve dağılım, 18/30 geçer; toplam 46 kontrol, hepsi geçti). `check-level-exams` (3 sınav, 180 soru), `check-grammar`, `build-pages --check`, `sozluk --check` geçti.
- **Madde 4:** Bu PR birleşince A1, A2 ve B1 sınavları tamam. B2 sınavını, kararın gereği B2 gramer dersleri tamamlanınca yapacağız.
- **Durum:** Soruları kontrol ettin, hepsi uygun. PR #51 birleştirildi (2026-11-04); **madde 4 tamamlandı.**

## 2026-11-04 · Seviye sonu sınavı: A2

- **Sayfa:** `#seviye-sonu/A2`, A2 konu listesinin sonundaki karttan açılıyor. Ekran, kayıt, öğretmen detayı ve ödev A1'deki gibi çalışıyor; kod ve kural değişikliği yok.
- **Dağılım (onayladığın):** Dativ, Adjektivdeklination, Nebensätze, Präteritum, Wechselpräpositionen, Verben mit Präpositionen, Reflexive Verben, Komparativ & Superlativ 3'er; Konjunktiv II, Verben mit Dativ und Akkusativ, Futur I 2'şer.
- **Havuz:** `data/seviye-sonu/a2.json`, 60 soru (dağılımın iki katı), her birinde kendi Türkçe açıklaması var.
- **İkinci doğru cevap kontrolü (senin işaret ettiklerin ve fazlası):**
  - **Wechselpräpositionen:** Her soruda fiil Wo/Wohin'i belirliyor (legen/liegen, stellen, gehen, schlafen, hängt). "Hängst du das Bild an …" sorusu çıkarıldı, çünkü "an der Wand aufhängen" da kullanılıyor; yerine stellen geldi.
  - **Nebensätze:** Ana fiil bağlacı tek seçeneğe indiriyor: fragen → ob, hoffen → dass, koşul → wenn. "Weil das Wetter morgen schön ist" de olabileceği için o soruda weil yerine obwohl seçeneği var.
  - **Adjektivdeklination:** Bütün isimler tekil ve artikel açık (einen, ein, die …, fiil ist). Tek çoğul soru (mit guten Freunden) çoğulluğu isimle belli ediyor.
  - **Ek olarak bulunan:** Dönüşlü fiillerde "Wir treffen euch", "Du putzt mir die Zähne", "Er erinnert ihn …" da doğru cümleler kuruyordu. Bu şıklar kesin yanlış olanlarla değiştirildi (wir, unser, deine, er, sein …).
  - **Präteritum:** Şimdiki zamanın da doğru olabileceği iki cümleye zaman belirteci eklendi (früher, gestern Abend). Konjunktiv II'de "Können Sie …?" da doğru olduğu için o şık çıkarıldı.
- **Önbellek:** `level-exam.js` v2 (katalog v8).
- **Test:** `tests/level-exam.mjs` genişletildi (A2: kart, 30 soru ve dağılım, 18/30 geçer; toplam 43 kontrol, hepsi geçti). `check-level-exams` (2 sınav, 120 soru), `check-grammar`, `build-search-index --check`, `sozluk --check`, `build-pages --check`, `tests/vocab.mjs` geçti.
- **Düzeltme (senin kontrolünden sonra):** a2-futur-i-1'de („Morgen ___ es bestimmt regnen.“) "würde" koşul bağlamında savunulabildiği için yerine "wurde" geldi.
- **Durum:** PR #49 birleştirildi (2026-11-04).

## 2026-11-04 · Seviye testi tarayıcı testi yeni sayfa yapısına uyarlandı

- **Neden:** "Dersler" ve "İletişim" ayrı sayfalara taşındı (`/online-almanca-dersi/`, `/iletisim/`); `npm run test:placement` hâlâ eski `#lessons` ve `#contact` bölümlerine bakıp duruyordu. Gizlilik sayfasının tarihi de (Web3Forms değişikliği) 4 Kasım oldu.
- **Değişen:** Sadece `tests/seviye-testi/placement.mjs`.
  - Ders ve iletişim sayfalarındaki `/#seviye-testi` bağlantıları deneniyor; eski `#contact` adresinin `/iletisim/`'e yönlendiği de kontrol ediliyor.
  - Testin küçük sunucusu klasör adreslerinde `index.html`'i açıyor.
  - Sayaç kontrolü ana sayfadan açılışın hemen ardına alındı.
  - Gizlilik tarihleri güncellendi.
- **Test:** `npm run test:placement` tamamen geçti.

## 2026-11-04 · Seviye sonu sınavı: A1 (madde 4)

- **Sayfa:** `#seviye-sonu/A1`. Alıştırmalar sayfasında A1 konu listesinin sonunda bir kart var ("A1 seviyesini bitirdin mi?").
  - Giriş ekranı: 30 soru, geçme sınırı %60 (18 doğru), süre yok.
  - 30 soru tek sayfada; her soruda 4 seçenek, "Bilmiyorum" yok. Cevapsız soru kalırsa sınav bitmiyor, cevapsızlar işaretleniyor.
  - Yarım kalan deneme tarayıcıda saklanıyor (`baLevelExam:A1`); sayfa kapanırsa kaldığı yerden devam ediliyor.
- **Soru havuzu:** `data/seviye-sonu/a1.json`, 60 soru. Her konu için dağılımdaki sayının iki katı soru var ve her sorunun kendi Türkçe açıklaması var.
  - Her denemede aynı dağılımla rastgele 30 soru seçiliyor, seçeneklerin sırası da karışıyor. Böylece ikinci denemede öğrenci cevapları ezberden bilemez.
  - Dağılım (onayladığın): Präsens 3; sein & haben, Artikel, Plural, Akkusativ, Negation, W-Fragen, Modalverben, Trennbare Verben, Perfekt, Zahlen/Uhrzeit/Datum, Temporale Präpositionen 2'şer; Personalpronomen (Akk./Dat.), Possessivartikel, Imperativ, Lokale Präpositionen 1'er.
  - `node scripts/check-level-exams.mjs` havuzu denetliyor (GitHub'da da çalışıyor): dağılım toplamı 30, her konuda en az iki kat soru, 4 farklı seçenek, doğru cevap seçeneklerde, açıklama var.
- **Sonuç ekranı (onayladığın taslak):** puan, yüzde ve sınır, "Geçtin / Henüz geçemedin" etiketi.
  - 17 konunun tablosu; hatalı konular üstte. Yanlarında "Konu anlatımı" ve "Alıştırmalar" bağlantıları var; telefonda bunlar konu adının altına geliyor.
  - Yanlış cevaplar: öğrencinin cevabı, doğru cevap ve açıklama.
  - Alt kısımda "alıştırma sınavı" notu ve şu düğmeler: Tekrar çöz (yeni sorularla), Zayıf konulara git, Alıştırmalara dön.
  - Giriş yapmamış ziyaretçiye "sonucun kaydedilmedi" notu çıkıyor.
- **Kayıt:** Giriş yapmış ve onaylı öğrencide `users/{uid}/results`'a şu bilgiler yazılıyor: `level: A1`, `topic: seviye-sonu`, `exercise: a1`, puan, 30 ve `topicErrors` (ör. `perfekt:2,akkusativ:1`). Hangi soruların çıktığı yazılmıyor. Dil değiştirmek ya da sayfayı yenilemek sonucu ikinci kez yazmıyor.
- **Öğretmen detayı:** Sonuç tablosuna "İlk skor" sütunu eklendi (bütün alıştırmalar için). Sınav satırında deneme sayısı, ilk, son ve en iyi puan ile "Son denemedeki hatalar: Perfekt 2, …" görünüyor.
- **Ödev:** Ödev ekranında A1'in konuları arasında "Seviye sonu sınavı" var. Öğrenci panelindeki ödev bağlantısı sınavı açıyor. `#exercises/A1/seviye-sonu` gibi eski biçimli bağlantılar da sınava yönleniyor.
- **Kurallar:** `firestore.rules` → `validResult()` isteğe bağlı `topicErrors` alanını kabul ediyor; bu alan sadece `topic == 'seviye-sonu'` ise geçerli, en fazla 600 karakter ve "konu:sayı" biçiminde olmak zorunda. Kural testleri: `npm test` 106/106 (2 yeni).
- **Diller:** Yeni metinler TR/DE/EN. Sorular Almanca, açıklamalar Türkçe (DE/EN arayüzde "Açıklamalar Türkçedir" notu var).
- **Önbellek sürümleri:** `app.js` v31 (bütün sayfalar), `quiz.js` v27, `exercise-links.js` v6, `grammar.js` v18, `analytics.js` v6, `session.js` v2; yeni `level-exam.js` v1, `level-exam.css` v1. Sayaç sınavı `/#seviye-sonu/A1` olarak ayrı sayıyor.
- **Test:**
  - Yeni `tests/level-exam.mjs` (40 kontrol, hepsi geçti): dağılım, rastgelelik, devam etme, puan ve sınır (17 → geçemedi, 18 → geçti), konu hataları, yanlışlar, diller, eski bağlantı, 390/1440 px açık/koyu.
  - Yeni `npm run test:level-exam` (emülatörde uçtan uca, 11 kontrol, hepsi geçti): öğrenci iki kez çözüyor → kayıtlar doğru → öğretmen detayında ilk 15/30, son 25/30, 2 deneme → ödev veriliyor → panel bağlantısı sınavı açıyor.
  - `tests/vocab.mjs`, `tests/search.mjs`, `tests/result-message.mjs`, `tests/exams/next.mjs`, `check-grammar`, `check-exams`, `build-search-index --check`, `sozluk --check` geçti.
- **Bilinen sınırlar:** Seviye testinde olduğu gibi, sorular ve cevaplar herkese açık bir dosyada ve puan tarayıcıda hesaplanıyor.
- **Benden önce bozulmuş bir test:** `npm run test:placement` ilk bölümünde duruyor. Başka bir oturumun değişikliğiyle (#39/#43) "Dersler" ve "İletişim" ayrı sayfalara taşındı; testin bu bölümü hâlâ eski yerlerine bakıyor. Testin geri kalanını geçici bir kopyayla çalıştırdım, hepsi geçti. Ayrı küçük bir işte düzeltilmeli.
- **Düzeltme (senin kontrolünden sonra):** a1-possessivartikel-2'de („Frau Demir sucht ___ Schlüssel.“) "ihre" seçeneği çoğul okumayla (ihre Schlüssel) doğru olabiliyordu; yerine "ihrem" geldi. Diğer 59 soru aynı belirsizlik için tarandı: tekil/çoğul aynı yazılan isim geçen 4 soruda (Fenster ×2, Löffel, Mädchen) fiil ya da artikel tekili belli ediyor.
- **Durum:** PR #46 birleştirildi (2026-11-04).
- **Senin yapman gerekenler:**
  1. ✔ PR birleştirildi.
  2. ✔ Kuralları yayınladın (2026-11-04). Yayınlamadan önce kaydedilen sınav sonuçları kurallarca reddedilir; öğrenci "Sonuç paneline kaydedilemedi" notunu görür.
  3. Sonra A2 ve B1 için onayın.

## 2026-11-04 · Kelime listesi: B2 (7 konu)

- **Kapsam:** B2'nin alıştırması olan 7 konusu (Konjunktiv I, Passiv-Varianten, Nominalisierung, Partizip I, Partizip II, Genitivpräpositionen, je … desto). B2'deki 1400 sorunun 1160'ında artık kelime listesi var. Hazırlanmakta olan 3 B2 konusunda henüz alıştırma olmadığı için liste de yok. Böylece kelime listesi alıştırması olan bütün konularda (A1–B2) var.
- **Sözlük:** 286 yeni kelime, toplam 1249. Önceden kontrol edilen 963 kelimeye dokunulmadı.
- **Kontrol tablosu bu PR için:** `docs/sozluk-bekleyen.csv` (sadece bu 286 kelime; emin olmadığım en üstte).
  - **Emin olmadığım 1 kelime (öğrenciye gizli):** Bedenken (çoğu zaman çoğul die Bedenken; tekili das Bedenken da var).
  - **İki artikelli girişler (der/die, sıfattan türemiş isimler):** Alte, Ältere, Jüngere, Angestellte, Arbeitslose, Bekannte, Beteiligte, Betroffene, Deutsche, Fremde, Kranke, Mitarbeitende, Obdachlose, Studierende, Teilnehmende, Unbekannte, Unzufriedene, Verantwortliche, Verdächtige; ayrıca "der/die Junge – genç (kişi)" (die Jungen und die Alten). der Junge = erkek çocuk ayrı giriş olarak kalıyor.
  - **Renkler ve fiilden isimler:** das Blau, das Grün …; das Betreten, das Verlassen, das Warten … (sadece önlerinde artikel/edat varsa).
- **Ayıklama:** Önceki kurallar aynen. Ek olarak "etwas Neues / alles Gute / das Wesentliche" gibi soyut sıfat-isimleri, cümle başındaki sıfat-fiiller (Lachende Kinder …) ve dil bilgisi terimleri (Konjunktiv, Partizip, Modalverb …) alınmıyor.
- **Değişmeyenler:** Sorularda sadece `vocab` eklendi (7 dosya otomatik karşılaştırıldı). Sınav setlerinde liste yok.
- **Test:** `tests/vocab.mjs` (kelime listesi olan 48 konunun ilk sorusu tarayıcıda), `check-grammar`, `check-exams`, `build-search-index --check`, `sozluk --check` geçti; herkese açık sayfalarda konsol hatası yok.
- **Durum:** Tabloyu kontrol ettin (2026-11-04), hepsi uygun. Bedenken "die Bedenken (sadece çoğul) – endişeler, kaygılar" olarak görünüyor; Datenbasis'in anlamı "veri temeli, dayanak alınan veriler" oldu. 1249 kelimenin hepsi `checked: true`. PR #42 birleştirildi; **madde 3 tamamlandı.**

## 2026-11-04 · Kelime listesi: B1'in kalan 12 konusu

- **Kapsam:** B1'in Relativsätze dışındaki 12 konusu. B1'deki 2274 sorunun 1847'sinde artık kelime listesi var.
- **Sözlük:** 290 yeni kelime, toplam 963. Önceden kontrol edilen 673 kelimeye dokunulmadı.
- **Kontrol tablosu bu PR için:** `docs/sozluk-bekleyen.csv` (sadece bu 290 kelime; emin olmadıklarım en üstte).
  - **Emin olmadığım 2 kelime (öğrenciye gizli):** Bube (cümlede iskambildeki vale; güneyde "oğlan"), Marathon (der; das da kullanılıyor).
  - **İki artikelli girişler (der/die):** Reisende, Verletzte (sıfattan türemiş isim; Jugendliche ile aynı not biçimi).
  - **Not düştüğüm:** der Pole = Polonyalı erkek (die Polin = kadın).
  - N-Deklination konusundaki tamlayan ve çoğul biçimler sözlük biçimine çevrildi (des Präsidenten → der Präsident, des Herzens → das Herz, des Willens → der Wille).
- **Ayıklama:** Önceki kurallar aynen. Ek olarak "Tipp: …" ipuçları, "Aktiv:/Passiv:/Direkt:" etiketleri, "→ Passiv/von-Form", "Ausgangssatz:", "Behalte/Verschiebe/Nenne/Forme …" yönergeleri ve "Berichte. Beginne: …" alınmıyor; "Wissen Sie …" ve "Zahlen Sie …" gibi kullanımlar isim sayılmıyor.
- **Değişmeyenler:** Sorularda sadece `vocab` eklendi (12 dosya otomatik karşılaştırıldı). Sınav setlerinde liste yok.
- **Test:** `tests/vocab.mjs` (kelime listesi olan 41 konunun ilk sorusu tarayıcıda), `check-grammar`, `check-exams`, `build-search-index --check`, `sozluk --check` geçti; herkese açık sayfalarda konsol hatası yok.
- **Durum:** Tabloyu kontrol ettin (2026-11-04), hepsi uygun. Bube "der Bube – vale (iskambil)", Marathon der olarak görünüyor; Akku'nun anlamı "şarjlı pil, batarya" oldu. 963 kelimenin hepsi `checked: true`. PR #41 birleştirildi.

## 2026-11-04 · Kelime listesi: A2'nin kalan 10 konusu

- **Kapsam:** A2'nin Dativ dışındaki 10 konusu. A2'deki 1710 sorunun 1469'unda artık kelime listesi var.
- **Sözlük:** 164 yeni kelime, toplam 673. Önceden kontrol edilen 509 kelimeye dokunulmadı.
- **Kontrol tablosu bu PR için:** `docs/sozluk-bekleyen.csv` (sadece bu 164 kelime; emin olmadıklarım en üstte).
  - **Emin olmadığım 4 kelime (öğrenciye gizli):** Golf (cümlede VW Golf araba; spor olarak das Golf), Jugendliche (der/die, sıfattan isim; cümlede çoğul), Sandwich (das/der), Service (der/das; das Service = yemek takımı).
  - **Not düştüklerim (görünüyor):** Rückenschmerz (çoğu zaman çoğul), Gericht (yemek; mahkeme), Pension (pansiyon; emekli maaşı), Strom (elektrik; akıntı), Decke (battaniye; tavan).
- **Ayıklama:** A1'deki kurallar aynen. Ek olarak "Ja/Nein-Frage:", "W-Frage:", "Gib einen Rat:" yönergeleri ve dil bilgisi terimleri (Subjekt, Akkusativ, Kasus, Hauptsatz, Futur I, Gegenwart/Vergangenheit/Zukunft …) alınmıyor.
- **Değişmeyenler:** Sorularda sadece `vocab` eklendi (10 dosya otomatik karşılaştırıldı). Sınav setlerinde liste yok.
- **Test:** `tests/vocab.mjs` (kelime listesi olan 29 konunun ilk sorusu tarayıcıda), `check-grammar`, `check-exams`, `build-search-index --check`, `sozluk --check` geçti; herkese açık sayfalarda konsol hatası yok.
- **Durum:** Tabloyu kontrol ettin (2026-11-04), hepsi uygun. Golf, Sandwich, Service önerilen artikellerle görünüyor. Jugendliche "der/die Jugendliche – genç" olarak gösteriliyor (sözlükte artık iki artikelli giriş yazılabiliyor: `"article": "der/die"`); notu düzeltildi. 673 kelimenin hepsi `checked: true`. PR #40 birleştirildi.

## 2026-11-04 · Kelime listesi: A1'in kalan 16 konusu

- **Kapsam:** A1'in Artikel dışındaki 16 konusu (3098 soru). 2429 A1 sorusunda artık kelime listesi var; kalan sorularda isim yok (ör. sadece zamir, sayı ya da fiil soruları).
- **Sözlük:** 236 yeni kelime, toplam 509. Pilottaki 273 kelimeye dokunulmadı.
- **Kontrol tablosu bu PR için:** `docs/sozluk-bekleyen.csv`. Sadece henüz kontrol edilmemiş, yani bu PR'da gelen 236 kelime var; emin olmadıklarım en üstte. Bütün sözlük yine `docs/sozluk-kontrol.csv`'de.
  - **Emin olmadığım 2 kelime:** Bonbon ve Poster (das/der); kontrolden sonra das olarak görünüyor.
  - **Not düştüklerim (görünüyor):** die Leiter = merdiven (der Leiter = yönetici), Kopfschmerz ve Nudel (çoğu zaman çoğul), Viertel (çeyrek; semt), Schloss (şato; kilit).
- **Ayıklama kuralları (pilottan farklı olarak eklenenler):**
  - Türkçe durum ve çeviri cümleleri ("Durum: …", "Telefonun yeni. Onu her gün kullanıyorsun.") listeye girmiyor; içlerindeki Almanca alıntılar („…“) giriyor.
  - "Korrigiere"/"Hatalı" sorularında sadece doğru cümleye bakılıyor, yanlış biçimler alınmıyor.
  - "Herr/Frau + soyadı" (Frau Keller, Herr Koch) listeye girmiyor; soyadı da unvan da alınmıyor.
  - Essen, Lesen, Morgen gibi kelimeler sadece önlerinde artikel veya edat varsa isim sayılıyor ("beim Kochen", "jeden Morgen"); "Lesen Sie …" ve "Morgen habt ihr Zeit" alınmıyor.
  - Emir kipleri, kişi ve şehir adları, artikelsiz ülkeler, dil adları (Englisch, Spanisch) alınmıyor.
- **Değişmeyenler:** Sorularda sadece `vocab` eklendi; başka hiçbir alan değişmedi (16 dosya otomatik karşılaştırıldı). Sınav setlerinde liste yok.
- **Test:** `tests/vocab.mjs` genişletildi: kelime listesi olan her konunun ilk sorusu tarayıcıda kontrol ediliyor (19 konu); hepsi geçti. `tests/search.mjs`, `check-grammar`, `check-exams`, `build-search-index --check`, `sozluk --check` de geçti.
- **Durum:** Tabloyu kontrol ettin (2026-11-04), hepsi uygun. Bonbon ve Poster das olarak gösteriliyor; Bonbon'un notu düzeltildi ("Duden: der oder das; ikisi de doğru. Avusturya'da das kullanılır."). 509 kelimenin hepsi `checked: true`. PR #38 birleştirildi.

## 2026-11-04 · Alıştırma sonuç ekranı: konuya uyan övgü metni

- **Hata:** Sonuç ekranı her konuda "Harika! Artikel konusunda çok iyi gidiyorsun." diyordu; düşük puanda da artık olmayan "soldaki kısa özet"e yönlendiriyordu.
- **Yeni metinler (TR/DE/EN):**
  - %90 ve üstü: „{konu adı}“ konusunda çok iyi gidiyorsun.
  - %70–89: Yanlış yaptığın soruların açıklamalarını aşağıda bir kez daha oku.
  - %70'in altı: Aşağıdaki açıklamaları oku, sonra alıştırmayı yeniden çöz.
  - DE/EN'deki "Diese Wörter solltest du wiederholen" / "Review these words" başlığı da konudan bağımsız oldu: "Das solltest du wiederholen" / "Worth reviewing".
- **Önbellek sürümleri:** `app.js` v27, `quiz.js` v26.
- **Test:** Yeni `tests/result-message.mjs` (14 kontrol, hepsi geçti): üç puan aralığı, üç dil, metinlerde "Artikel"/"soldaki özet" kalmaması, 390/1440 px açık/koyu. `tests/vocab.mjs`, `tests/search.mjs`, `check-grammar` de geçti.
- **Durum:** PR #37 birleştirildi (2026-11-04).

## 2026-11-02 · Alıştırmalarda kelime listesi: pilot (madde 3)

- **Ne değişti:** Pilot konularda (A1 Artikel, A2 Dativ, B1 Relativsätze; 54 paket, 540 soru) her soru kontrol edilince, doğru da olsa yanlış da olsa, altında "Bu sorudaki kelimeler" çıkıyor: ör. **der** Bahnhof – tren istasyonu. Sonuç ekranında "Bu alıştırmadaki kelimeler" paketin bütün kelimelerini gösteriyor (tekrarsız, cümlelerdeki sırayla).
  - Sadece alıştırmalarda; sınav setlerinde yok.
  - DE/EN arayüzde de anlam Türkçe; başlık o dilde ve altında "Anlamlar Türkçe" notu.
  - Sadece çoğul kullanılan isimler işaretli: die Eltern (sadece çoğul) – anne baba.
  - Sözlük (`data/sozluk.json`, ~30 KB) sadece kelime listesi olan bir alıştırma açılınca yükleniyor. Yüklenemezse alıştırma listesiz çalışıyor.
- **Veri formatı (onayladığın):** Merkezi sözlük + sorularda anahtar.
  - `data/sozluk.json`: `"Bahnhof": { "article": "der", "tr": "tren istasyonu", "checked": false }`. İsteğe bağlı alanlar: `pluralOnly`, `unsure`, `note`. Aynı yazılışlı iki isim için `"See|die"` gibi bir anahtar ve `"word": "See"`.
  - Sorularda: `"vocab": ["Bahnhof", "Hotel"]`. Cümledeki çekimli ve çoğul biçimler sözlük biçimine çevrildi (den Kindern → das Kind, die Bücher → das Buch).
  - Alınmayanlar: Almanca yönergelerdeki kelimeler (Satz, Variante, Frage passt …), kişi ve şehir adları, artikelsiz ülkeler (Spanien, Österreich), "nach Hause" gibi kalıplar. Artikelli ülkeler (die Schweiz, die Türkei) listede.
  - Sorulardaki başka hiçbir alan değişmedi (otomatik karşılaştırmayla doğrulandı).
- **Sözlük:** 273 kelime, artikel ve anlamları ben yazdım; hepsi `checked: false`.
  - **Emin olmadığım 3 kelime (öğrenciye gizli, kontrolünü bekliyor):** Bank (banka mı bank mı), Karte (bilet / kart / harita), Laptop (der ve das ikisi de doğru). Kontrol edince görünür olurlar.
  - Not düştüğüm diğerleri (görünüyor): See (der See = göl, die See = deniz), Fräulein (eskimiş).
- **Kontrol tablosu:** `docs/sozluk-kontrol.csv` (Excel'de açılır; noktalı virgülle ayrılmış, Türkçe harfler doğru). Emin olmadıklarım en üstte. Sütunlar: Kelime, Artikel, Türkçe anlam, Sadece çoğul, Emin değilim, Not, Kontrol edildi, Soru sayısı, Konular, Örnek cümle.
  - **Düzeltme yolu:** Tabloda Artikel, Türkçe anlam, Not ve evet/hayır sütunlarını değiştirip bana geri gönder. `node scripts/sozluk.mjs --import tablo.csv` sözlüğe işler.
  - `node scripts/sozluk.mjs --check` GitHub'da çalışıyor: sözlükte olmayan anahtar, yanlış artikel veya eski tablo hata veriyor.
- **Diller:** Yeni metinler TR/DE/EN. **Önbellek sürümleri:** `app.js` v26, `quiz.js` v25, `exercises-hub.css` v7.
- **Test:** Yeni `tests/vocab.mjs` (24 kontrol, hepsi geçti): doğru ve yanlış cevap, Enter ile yazmalı yanlış cevap, dil değişimi, sonuç listesi, gizli kelimeler, sadece çoğul, sınav setinde liste olmaması, sözlük yüklenemezse çalışma, 390/1440 px açık/koyu. `tests/search.mjs`, `tests/exams/next.mjs`, `check-grammar`, `check-exams`, `build-search-index --check`, `sozluk --check`, `npm run test:placement` de geçti.
- **Durum:** Tabloyu kontrol ettin (2026-11-04): Bank, Karte, Laptop doğru; 273 kelimenin hepsi `checked: true`, emin olunmayanlar artık görünüyor. PR #36 birleştirildi.
- **Fark ettiğim ama dokunmadığım:** Sonuç ekranındaki övgü metinleri (`resultPerfect` vb.) her konuda "Artikel konusunda çok iyi gidiyorsun" diyor ve kapalı olan "soldaki özet"ten bahsediyor. Ayrı küçük bir iş.

## 2026-11-02 · Alt başlıklarda arama (madde 2)

- **Alıştırmalar:** Arama artık konuların yanında alıştırma paketlerinin başlıklarında da arıyor. Eşleşen paketler konu kartlarının altında "Alıştırma paketleri" başlığıyla listeleniyor (seviye, paket adı, hangi konuda olduğu). Tıklayınca alıştırma ilk sorusuyla doğrudan açılıyor; geri tuşu listeye döndürüyor.
  - Paket başlıkları küçük bir dizinde: `data/search-index.json` (856 paket, ~100 KB). Sadece arama kutusuna yazmaya başlayınca yükleniyor. Dizin yüklenemezse konular yine aranıyor, kısa bir not çıkıyor.
  - **Yeni paket eklenince:** `node scripts/build-search-index.mjs` çalıştırılmalı. GitHub'daki "Grammar coverage" kontrolü dizin eskiyse hata veriyor (`--check`). AGENTS.md'ye de yazıldı.
- **Gramer:** Arama ders bölümlerinin başlıklarında da arıyor ("Ders bölümleri"). Tıklayınca ders o bölümden açılıyor ve bölüm başlığı odaklanıyor. Yeni adres biçimi: `#grammar/A1/artikel/3` (3. bölüm). Eski `#grammar/A1/artikel` adresleri aynen çalışıyor. B2'de henüz yazılı ders olmadığı için B2 bölümü yok.
- **Kararlar:**
  - Konusu zaten eşleşen paketler/bölümler ayrıca listelenmiyor (ör. "artikel" araması Artikel konusunun 12 paketini tekrar göstermiyor); o konuya kartından gidiliyor. Liste en fazla 40 sonuç gösteriyor, kalanı için "aramayı daralt" notu var.
  - Büyük/küçük harf, Almanca ve Türkçe özel harfler fark etmiyor ("baglam" = "bağlam", "ubung" = "Übung", "İsim" = "isim"). Alt başlık sonuçlarında eşleşme kelime başında aranıyor; yoksa "isim" araması "değişim"i de buluyordu.
  - Arama kutularının metni: "Konu veya alıştırma ara…" ve "Konu veya ders bölümü ara…". Yeni metinler TR/DE/EN.
- **Önbellek sürümleri:** `base.css` v8 (bütün sayfalar), `app.js` v25, `quiz.js` v24, `grammar.js` v17.
- **Test:** Yeni `tests/search.mjs` (36 kontrol, hepsi geçti). `check-grammar`, `check-exams`, `build-search-index --check`, `tests/exams/next.mjs` ve `npm run test:placement` de çalıştırıldı.
- **Durum:** PR #35 birleştirildi (2026-11-02).

## 2026-11-02 · Seviye testi: her gün otomatik silme (GitHub Actions, madde 7)

- **Durum:** PR #34 birleştirildi (2026-11-02). Kuralları yayınladın, elle çalıştırılan ilk deneme başarılı (yeşil ✓). 3 Kasım'daki zamanlanmış çalışma, kurallar o sırada henüz yayınlanmadığı için hata vermişti; bundan sonra her gün çalışacak.
- **Neden:** Silme şu ana kadar sadece yönetim sayfası açılınca oluyordu. Senin isteğinle artık senden bağımsız.
- **Nasıl:** `.github/workflows/placement-cleanup.yml` her gün 03:23 UTC'de `scripts/placement-cleanup.mjs`'i çalıştırır; `expireAt` tarihi geçmiş sonuçları siler.
  - **Servis hesabı anahtarı yok.** Servis hesabı kurallardan geçmediği ve Firestore'da tek bir koleksiyonla sınırlanamadığı için, sızarsa bütün öğrenci verisi açılırdı. Onun yerine Firebase Authentication'da ayrı bir "temizlik hesabı" var; script bu hesapla giriş yapıyor ve kurallardan geçiyor.
  - **Kurallar (`cleanupUid()`):** Bu hesap sadece `expireAt <= şimdi` ile sınırlı sorgu yapıp süresi dolmuş sonucu silebilir. Tek belge okuma, değiştirme, süresi dolmamış sonucu silme, öğrenci verisi okuma, profil ya da seviye testi sonucu oluşturma yok.
  - **Kişisel veri GitHub'a gelmiyor:** Sorgu sadece belge kimliklerini istiyor; ad ve e-posta indirilmiyor. Günlükte sadece silinen sayı var.
  - **Yedek:** Yönetim sayfasındaki silme duruyor.
- **Gizlilik metni:** Değişmedi ("6 ay sonra otomatik olarak silinir"). Kurulum bitince bu ifade doğru olacak; kurulum bitene kadar silme yine sadece yönetim sayfasında oluyor.
- **Test:** `npm test` 104/104 (4 yeni kural testi), yeni `npm run test:cleanup` 8/8 (emülatörde uçtan uca: 205 sonuç 200'lük gruplarla siliniyor, süresi dolmamışlar kalıyor, sorgu cevabında kişisel veri yok, yanlış şifrede hata kodu, secrets boşken hata yok), `npm run test:placement` geçti. GitHub'daki kural testleri iş akışına `test:cleanup` eklendi.
- **Senin yapman gerekenler** (ayrıntı: `docs/seviye-testi.md` → "6 ay sonra silme"):
  1. ✔ Temizlik hesabı açıldı; UID `EUQMPh6R4SM8SKDuxZyZodvCBp43` `firestore.rules` → `cleanupUid()`'e yazıldı.
  2. ✔ GitHub Secrets: `CLEANUP_EMAIL` ve `CLEANUP_PASSWORD` eklendi.
  3. Kuralları Firebase Console → Firestore → Kurallar'da **yayınla** (PR #34 birleştikten sonra).
  4. GitHub → Actions → "Seviye testi otomatik silme" → **Run workflow** ile ilk deneme.

## 2026-11-02 · Sınav setlerinde "Sonraki alıştırma" (madde 1)

- **Ne değişti:** Bir set kontrol edilince sonuç kutusunda ve sayfa sonunda "Sonraki alıştırma" çıkıyor; altında sıradaki setin adı yazıyor (ör. "Teil 1 · Ferien im Tierheim").
  - Sıra: aynı Teil içinde set sırasıyla, son setten sonra bir sonraki Teil'in ilk seti (Teil 1 set 1 → … → set 5 → Teil 2 set 1). Sadece sitede çözülen setler sayılıyor; dışarıya giden bağlantılar atlanıyor.
  - Bölümün son setinde: "Bu bölümün son setine geldin…" notu, "Bölüm listesine dön" ve "Teil listesine dön" (TestDaF'ta "Aufgabe listesine dön").
  - "Tekrar çöz" duruyor, ikincil düğme oldu. Kontrol etmeden önce sonraki bağlantısı görünmüyor.
  - Bütün sınavlarda ve bölümlerde çalışıyor: Lesen, telc Sprachbausteine, DTZ (seviye adımı yok), TestDaF.
- **Diller:** Yeni metinler TR/DE/EN (`task…` anahtarları, `js/app.js`).
- **Önbellek sürümleri:** `app.js` v24 (index.html ve privacy.html), `exam-task.js` v11, `exams.js` v6, `exam-task.css` v9.
- **Test:** Yeni `tests/exams/next.mjs` (32 kontrol, hepsi geçti): sıra, Teil geçişi, bölüm sonu, Sprachbausteine, DTZ, TestDaF, dil değişimi, odak, sayfa yenilenmemesi, geri tuşu, 390/1440 px açık/koyu taşma. Mevcut sınav testleri, `check-grammar` ve `check-exams` de çalıştırıldı (sonuçlar PR'da).
- **Durum:** PR #33 birleştirildi (2026-11-02).

## 2026-10-27 · Seviye testi: TTL yerine yönetim sayfasında silme

- **Neden:** Firestore TTL faturalandırma istiyor; proje Spark planında. Yukarıdaki "TTL politikası oluştur" adımı geçersiz.
- **Yeni yöntem:**
  - Yönetim sayfası her açıldığında `expireAt ≤ şimdi` olan sonuçları siliyor (sorgu 200'erli gruplar hâlinde, batch ile).
  - Sayfanın üstünde kısa bir bilgi çıkıyor: kaç sonuç silindi, silinecek sonuç yoksa "yok", hata olursa uyarı.
  - Silmeye kurallar zaten sadece öğretmene izin veriyor; kural değişikliği yok.
- **`expireAt`:** Kayıtlarda kalıyor; faturalandırma açılırsa TTL politikası doğrudan çalışır (`docs/seviye-testi.md`).
  - `firestore.indexes.json`'daki TTL ayarı çıkarıldı. O ayar `expireAt` indeksini kapatıyordu, bu da silme sorgusunu canlıda bozardı. Ayrıca Spark planında yayınlanamazdı.
- **Hata düzeltmesi:** Testi atlayan ("Hiç Almanca bilmiyorum") öğrencinin yönetim detayında, boş bölümler yüzünden ekrana "null" yazısı çıkıyordu; düzeltildi.
- **Önbellek sürümleri:** `placement.js` v3, `placement.css` v2, `placement-admin.js` v2.
- **Test:** `npm run test:placement` 232 kontrol, hepsi geçti. Yeni kontroller:
  - süresi dolmuş 2 kaydın silinmesi ve bilgi notunun sayfanın en üstünde görünmesi,
  - süresi 1 saat sonra dolacak kaydın kalması,
  - kalan kayıtlarda `expireAt`'in durması,
  - "yok" bilgisi,
  - "null" hatası.
- **Bekliyor:** Gizlilik metnindeki saklama süresi ifadesi ve testteki onay kutusu ("en fazla 6 ay"). Önerim sana iletildi; onayını bekliyor.

## 2026-10-27 · Gizlilik politikasından adres kaldırıldı

- **Senin isteğinle:** `privacy.html`'in "Sorumlu" bölümünden posta adresi üç dilde de kaldırıldı. Kalan iletişim bilgisi: ad ve e-posta.
- **Son güncelleme:** 27 Ekim 2026.
- **Test:** `npm run test:placement` 223 kontrol, hepsi geçti; sayfada adres olmadığı da kontrol ediliyor.
- **Kalıcı karar (senin isteğin):** Ev adresin hiçbir yerde yayınlanmayacak.
  - `docs/veli-onay-formu.md`'den de (TR ve DE) kaldırıldı; orada da sadece ad ve e-posta kaldı.
  - Depodaki dosyalarda (PDF ve görseller dahil) adres artık geçmiyor.
  - İleride bir Impressum yapılırsa ev adresi değil, tebligat alınabilen bir hizmet adresi (Impressum-Service / c/o) kullanılacak.
- **Git geçmişi temizlendi (onayınla, 27.10.2026):**
  - `git filter-repo --replace-text` ile adres bütün geçmişten silindi; main ve 33 `claude/…` dalı `--force-with-lease` ile gönderildi. Dal silinmedi.
  - Bugünkü dosyalar birebir aynı; main'in dosya ağacı değişmedi.
  - Bütün commit kimlikleri değişti. Bu belgede ve eski raporlarda geçen kısa commit kimlikleri (ör. 444f4eb, 5e80ce3) artık eski geçmişe ait.
- **Hâlâ kalan:** GitHub'ın PR'lar için sakladığı eski kopyalar. Şu PR'larda adres var: #16, #18–25, #27–31. Eski commit'ler kimlikleriyle (ör. `9e363ad`) GitHub'da açılabiliyor. Bunları ancak GitHub Destek silebilir; talep adımları sana iletildi.

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

**Bilmen gerekenler:** Bayrak renkleri (#000000, #dd0000, #ffce00) sadece ayraçta, senin onayınla; paletin geri kalanı `--ba-*`. Kullanılmayan eski PNG'ler (`images/Logo.png`, `images/logo-transparent.png`, kökteki `logo-transparent.png`) ve `mailfoto.jpg` 4 Kasım 2026'da silindi.

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
