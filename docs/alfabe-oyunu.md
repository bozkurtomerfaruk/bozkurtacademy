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

## Ses

Sadece cihazda çalışan sesler (`localService`) kullanılır; okunan metin sunucuya gitmez. Almanca ses yoksa uyarı çıkar ve okunuşlar yazıyla gösterilir. Harf adları veri dosyasındaki `ad` alanından okunur (V → „Vau“, J → „Jot“).

## Hesap (giriş yapmış öğrenci)

- Ziyaretçide Firebase hiç yüklenmez; ilerleme sadece localStorage `baAlfabe`'de.
- Cihazda öğrenci ipucu (`baAccount = student`) varsa `js/alfabe.js`, `js/account/alfabe-sync.js`'i yükler. Hesap onaylı ve aktifse (alıştırma sonuçlarıyla aynı kural) yerel ilerleme ile hesaptaki birleştirilir ve iki tarafa yazılır; her tur sonunda ve sayfa gizlenince yeniden birleştirilip yazılır.
- Birleştirme (`mergeProgress`): her alanın en iyisi (harf başına doğru ve yanlış sayısının büyüğü, mod başına en iyi skor, yıldız). Aynı veriyi iki kez birleştirmek bir şey değiştirmez; başka cihazdaki ilerleme kaybolmaz.
- Yerel kayıt başka hesapla eşitlenmişse (`baAlfabe.uid`) yeni hesaba karıştırılmaz; o cihazda hesaptaki ilerleme gösterilir.
- Onay bekleyen hesap ve öğretmen hesabı hesaba yazmaz, ama sahipsiz yerel ilerlemeyi kendi uid'leriyle işaretler (`baAlfabeSync.claim`). Böylece aynı tarayıcıda sonra giren onaylı öğrencinin hesabına karışmaz.
- Çıkışta (`js/account/common.js` → `signedOut`, panel, giriş ve öğretmen sayfaları; oturum bitmişse panel de) yerel ilerleme silinir ve `uid` `cikis-yapildi` olur. Öğrencinin ilerlemesi hesapta durur, sonraki girişte geri gelir. Çıkıştan sonra giriş yapmadan oynanan oyun cihazda kalır ama hiçbir hesaba eklenmez (aynı öğrencinin hesabına da). Profil ve ses ayarları korunur. Yalnızca hiç giriş yapılmamış cihazdaki ziyaretçi ilerlemesi ilk girişte hesaba eklenir.
- Profil seçimi ve ses ayarları sadece cihazda kalır. Belge, öğrenci silinince diğer verilerle birlikte silinir (`js/account/teacher-common.js` → `SUBCOLLECTIONS`).
- Kurallar: `firestore.rules` → `validAlfabeProgress` (yalnızca bilinen harf ve modlar, tam sayılar, sunucu saati); testleri `tests/firestore.rules.test.mjs`.
