# Almanca Alfabe oyunu (`/almanca-alfabe/`)

Türkçe konuşanlara Almanca alfabeyi öğreten oyun. Hesap gerekmez; alıştırmalar sayfasında (A1) "Çocuklar için" bölümünde kartı var.

## Dosyalar

| Dosya | Ne var |
| --- | --- |
| `almanca-alfabe/index.html` | Sayfa içeriği (başlık, kurallar, SSS). Ortak parçaları `node scripts/build-pages.mjs` yazar. |
| `scripts/site-pages.mjs` | Başlık, açıklama, şema ve sayfaya özel `css` / `js` listesi. |
| `data/alfabe.json` | Harfler, kelimeler, ipuçları, karıştırılan ikililer, heceleme senaryoları. **İçerik burada düzenlenir.** |
| `js/alfabe-logic.js` | Oyun mantığı (DOM yok): soru üretme, seçenekler, normalizasyon, ağırlıklandırma, puan, profil ayarları (`PROFILES`). |
| `js/alfabe.js` | Arayüz, ses (speechSynthesis), kayıt (localStorage `baAlfabe`), adresler `#kesfet`, `#duy`, `#ilk-harf`, `#heceleme`, `#sirala`. |
| `css/alfabe.css` | Yerleşim; renkler `--ba-*` tokenları. Çocuk/yetişkin farkı `[data-profil]` altındaki `--ab-*` değişkenleri. |
| `tests/alfabe-logic.test.mjs` | Birim testleri (`npm run test:alfabe`, CI'da da çalışır). |
| `tests/alfabe.mjs` | Tarayıcı testi (Playwright). |
| `js/alfabe-audio.js` | Ses oynatıcı (dosya, yoksa cihaz sesi). |
| `scripts/generate-alfabe-audio.mjs` | Ses dosyalarını üretir; liste `audio/alfabe/manifest.json`, tablo `docs/alfabe-ses-listesi.md`. Testleri `tests/alfabe-ses.test.mjs`. |
| `tools/audio-check.html` | Bütün klipleri dinleme sayfası (yayına girmez). |
| `js/account/alfabe-sync.js` | Giriş yapmış onaylı öğrencinin ilerlemesini hesaba yazar (`users/{uid}/progress/alfabe`). |
| `tests/alfabe-account.mjs` | Hesap tarafı testi (`npm run test:alfabe-account`, Firebase Emulator). |

## Yerelde çalıştırma

```bash
python3 -m http.server 8765
```

Sonra tarayıcıda `http://localhost:8765/almanca-alfabe/` aç. Testler:

```bash
npm run test:alfabe
```

```bash
node tests/alfabe.mjs
```

(Tarayıcı testi için sunucu açık olmalı.)

## Yeni kelime ekleme veya değiştirme

`data/alfabe.json` içinde ilgili harfin `cocuk` ya da `yetiskin` örneğini değiştir:

```json
"cocuk": { "artikel": "der", "kelime": "Vogel", "anlam": "kuş", "emoji": "🐦", "okunus": "fo:gel" }
```

- `okunus`: Türkçe harflerle, fonetik işaret olmadan; uzun ünlü çift harfle (Vogel → "foogel", Wasser → "vasır", Zebra → "tsebra"). Birim testi `:` gibi işaretleri reddeder.
- `artikel`: der, die ya da das. `anlam`: Türkçe. `emoji`: tek bir emoji (çocuk modunda resim yerine). `okunus` isteğe bağlı (yetişkin modunda gösterilir).
- Kelime harfi içermek zorunda; harfle başlamıyorsa oyun harfi kelimenin içinde kendisi vurgular (der Bär, der Fuß).
- Çocuk kelimeleri somut ve resmedilebilir olsun (hayvan, yiyecek, oyuncak); 5 harfe kadar olanlar heceleme modunda da sorulur (`heceleme.cocuk.enFazlaHarf`).
- Yetişkin heceleme senaryosu eklemek için `heceleme.yetiskin` listesine `{ "tur", "durum", "soru", "cevap" }` ekle. Cevapta harfler ve `isaretler` içindeki @ . - kullanılabilir.
- Karıştırılan harfler `karistirilanlar` listesinde; seçeneklerde yan yana gelirler.
- Değiştirince `npm run test:alfabe` çalıştır (her harfin iki örneği ve harfi içerdiği denetlenir) ve `js/alfabe.js` içindeki `alfabe.json?v=` sürümünü artır.

## Sesler

Oyun önce sitenin kendi ses dosyalarını çalar (`audio/alfabe/<dil>/<ad>.mp3`, liste `audio/alfabe/manifest.json`),
dosya yoksa ya da yüklenemezse cihazdaki sesi (speechSynthesis) kullanır. Oynanırken hiçbir ses servisine istek gitmez;
TTS servisi sadece senin bilgisayarında çalıştırdığın üretim scriptinde kullanılır.

- **Klipler (125):** 30 harf adı, 60 örnek kelime (artikelle), 3 işaret (ät, Punkt, Bindestrich), 11 senaryo sorusu,
  11 senaryo cevabı, "Richtig!", 5 Türkçe talimat ve 4 Türkçe geri bildirim (çocuk modu). Hecelemede harf klipleri
  sırayla, aralarında duraklamayla çalınır. Tam liste, metinler ve durum: `docs/alfabe-ses-listesi.md`.
- **Dosya adları:** `de/harf-a.mp3` … `de/harf-z.mp3`, `de/harf-ae.mp3` (Ä), `harf-oe` (Ö), `harf-ue` (Ü),
  `harf-eszett` (ß); `de/kelime-der-vogel.mp3` (artikel + kelime; ä → ae, ß → ss); `de/isaret-at.mp3`,
  `isaret-punkt`, `isaret-bindestrich`; `de/soru-wie-ist-ihr-nachname.mp3`; `de/cevap-oeztuerk.mp3`;
  `de/richtig.mp3`; `tr/talimat-duy.mp3` …; `tr/dogru.mp3`, `tr/dogru-cevap.mp3`, `tr/supersin.mp3`, `tr/aferin.mp3`.
- **Okunuş:** harf adları `data/alfabe.json` → `soyle` (ses dosyası yoksa cihaz sesi bunu okur: Q → „Kuh“) ve `ipa`
  (dosya üretilirken SSML `<phoneme>` ile: V /faʊ/, Ä /ɛː/, ß /ɛsˈtsɛt/). Çocuk modundaki Türkçe klipler biraz daha
  yavaş ve sıcak tonla (`<prosody rate="95%" pitch="+2st">`) üretilir.
- **Oynatma (`js/alfabe-audio.js`):** aynı anda tek ses (yenisi öncekini durdurur); ilk dokunuştan önce hiçbir şey
  çalmaz; harf adları ve geri bildirimler önceden yüklenir, gerisi gerektiğinde; "Yavaş oku" dosyada
  `playbackRate` 0,75 (ses perdesi korunur), cihaz sesinde 0,7.
- **Cihaz sesi:** sadece cihazda çalışan sesler (`localService`); bunların içinde adında Natural, Neural, Premium,
  Enhanced, Google, Anna, Katja … geçenler öne alınır. Çevrim içi sesler (ör. Chrome'daki "Google Deutsch", Edge'deki
  "… Online (Natural)") okunan metni tarayıcı üreticisinin sunucusuna gönderdiği için kullanılmaz.
- **Önbellek:** GitHub Pages önbellek süresini kendisi belirler (10 dakika); dosyalar `?v=<ses özeti>` ile istenir,
  değişen dosyanın adresi de değişir. Liste (`manifest.json`) her açılışta yeniden doğrulanır (`cache: 'no-cache'`).

### Sesleri üretme

1. Servis hesabını aç ve bir API anahtarı al (Google Cloud: Text-to-Speech API'yi etkinleştir, "API anahtarı"
   oluştur ve anahtarı sadece Text-to-Speech API ile sınırla).
2. Depo kökünde `.env` dosyası oluştur (`.gitignore`'da, asla commit edilmez):

   ```
   ALFABE_TTS_PROVIDER=google
   GOOGLE_TTS_API_KEY=buraya-anahtar
   # isteğe bağlı: ALFABE_VOICE_DE=de-DE-Neural2-C  ALFABE_VOICE_TR=tr-TR-Wavenet-C
   ```

   Azure için `AZURE_SPEECH_KEY` ve `AZURE_SPEECH_REGION`; ElevenLabs için `ELEVENLABS_API_KEY`,
   `ELEVENLABS_VOICE_DE`, `ELEVENLABS_VOICE_TR`.
3. `node scripts/generate-alfabe-audio.mjs --dry-run` (ne üretileceği, karakter sayısı, maliyet; istek göndermez).
4. Önce birkaç klip dene: `node scripts/generate-alfabe-audio.mjs --only harf-v,harf-q,kelime-der-vogel,aferin`.
   Sesleri listelemek için `--voices`; beğenmezsen `.env`'de sesi değiştirip `--force --only …` ile yeniden üret.
5. Hepsi: `node scripts/generate-alfabe-audio.mjs`. Sadece eksik ve metni değişmiş klipler üretilir
   (`manifest.json` metnin özetini tutar). Script ffmpeg ile sessizliği kırpar, ses seviyesini −16 LUFS'ye eşitler ve
   48 kbit/sn mono MP3 yapar; sonunda toplam boyutu yazar.
6. `python3 -m http.server 8765` açıkken `http://localhost:8765/tools/audio-check.html` sayfasında hepsini dinle
   (bu sayfa yayına girmez: `_config.yml` → `exclude: tools`). Sonra `audio/alfabe/`, `manifest.json` ve
   `docs/alfabe-ses-listesi.md` dosyalarını commit et.

### Kendi kaydınla değiştirme

Aynı dosya adıyla bir MP3 koy (ör. `audio/alfabe/de/harf-v.mp3`), sonra `node scripts/generate-alfabe-audio.mjs --index`.
Dosya "kendi kaydın" olarak listeye girer, oyunda o çalar ve script onun üzerine bir daha yazmaz (`--force` da yazmaz;
sadece `--force-own`). Metni değişen klipler "metin değişti" olarak işaretlenir ve yeniden üretilene ya da (kendi
kaydında) `--accept-own` denene kadar oynatılmaz; oyun o sırada cihaz sesini kullanır. CI `--check` ile listenin
güncel olduğunu ve listede olmayan (yanlış adlı) dosya bulunmadığını denetler.

## Hesap (giriş yapmış öğrenci)

- Ziyaretçide Firebase hiç yüklenmez; ilerleme sadece localStorage `baAlfabe`'de.
- Cihazda öğrenci ipucu (`baAccount = student`) varsa `js/alfabe.js`, `js/account/alfabe-sync.js`'i yükler. Hesap onaylı ve aktifse (alıştırma sonuçlarıyla aynı kural) yerel ilerleme ile hesaptaki birleştirilir ve iki tarafa yazılır; her tur sonunda ve sayfa gizlenince yeniden birleştirilip yazılır.
- Birleştirme (`mergeProgress`): her alanın en iyisi (harf başına doğru ve yanlış sayısının büyüğü, mod başına en iyi skor, yıldız). Aynı veriyi iki kez birleştirmek bir şey değiştirmez; başka cihazdaki ilerleme kaybolmaz.
- Yerel kayıt başka hesapla eşitlenmişse (`baAlfabe.uid`) yeni hesaba karıştırılmaz; o cihazda hesaptaki ilerleme gösterilir.
- Profil seçimi ve ses ayarları sadece cihazda kalır. Belge, öğrenci silinince diğer verilerle birlikte silinir (`js/account/teacher-common.js` → `SUBCOLLECTIONS`).
- Kurallar: `firestore.rules` → `validAlfabeProgress` (yalnızca bilinen harf ve modlar, tam sayılar, sunucu saati); testleri `tests/firestore.rules.test.mjs`.
