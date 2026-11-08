# Almanca Alfabe oyunu (`/almanca-alfabe/`)

Türkçe konuşanlara Almanca alfabeyi öğreten oyun. Hesap, form ve sunucu isteği yok.

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

- `artikel`: der, die ya da das. `anlam`: Türkçe. `emoji`: tek bir emoji (çocuk modunda resim yerine). `okunus` isteğe bağlı (yetişkin modunda gösterilir).
- Kelime harfi içermek zorunda; harfle başlamıyorsa oyun harfi kelimenin içinde kendisi vurgular (der Bär, der Fuß).
- Çocuk kelimeleri somut ve resmedilebilir olsun (hayvan, yiyecek, oyuncak); 5 harfe kadar olanlar heceleme modunda da sorulur (`heceleme.cocuk.enFazlaHarf`).
- Yetişkin heceleme senaryosu eklemek için `heceleme.yetiskin` listesine `{ "tur", "durum", "soru", "cevap" }` ekle. Cevapta harfler ve `isaretler` içindeki @ . - kullanılabilir.
- Karıştırılan harfler `karistirilanlar` listesinde; seçeneklerde yan yana gelirler.
- Değiştirince `npm run test:alfabe` çalıştır (her harfin iki örneği ve harfi içerdiği denetlenir) ve `js/alfabe.js` içindeki `alfabe.json?v=` sürümünü artır.

## Ses

Sadece cihazda çalışan sesler (`localService`) kullanılır; okunan metin sunucuya gitmez. Almanca ses yoksa uyarı çıkar ve okunuşlar yazıyla gösterilir. Harf adları veri dosyasındaki `ad` alanından okunur (V → „Vau“, J → „Jot“).
