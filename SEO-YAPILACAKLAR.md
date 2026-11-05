# SEO yapılacaklar

Bu dosya, sitenin kodu dışında senin yapman gereken işleri adım adım anlatır.
Search Console, backlink ve aylık kontrol listesi bölümleri SEO planının 5. adımında eklenecek.

---

## 1. Gramer derslerine gelen yorumları onaylama

Bir öğrenci bir gramer dersinin altındaki formdan yorum gönderdiğinde yorum **otomatik yayınlanmaz**.
Yorum Firebase'e "onay bekliyor" (`pending`) olarak kaydedilir ve sana bir bildirim e-postası gelir.
Sen onaylayınca yorum o dersin sayfasında **"Öğrenci yorumları"** başlığı altında, formun üstünde görünür.
Bir derste onaylı yorum yoksa bu bölüm hiç görünmez.

### Gelen e-postada neler var?

- **Konu:** `Bozkurt Academy – A1 yorum incelemesi: Artikel – der, die, das`
- **name**, **message:** öğrencinin adı ve yorumu
- **email:** öğrencinin e-postası. Sadece senin için; "Yanıtla"ya basınca öğrenciye yazarsın. Siteye ve Firebase'e yazılmaz.
- **ders**, **ders_linki:** seviye, ders adı ve dersin sayfası
- **onay_paneli:** onay sayfasının linki
- **kayit_no:** yorumun Firebase'deki kayıt numarası. Bu alan e-postada varsa yorum kaydedilmiştir ve panelde görünür.

### Yöntem A: Onay paneli (önerilen)

1. Öğretmen panelinde **Yorumlar** sekmesini aç (sekmedeki sayı onay bekleyen yorumlardır) ya da e-postadaki
   **onay_paneli** linkini aç: `https://bozkurtacademy.com/yonetim/yorumlar/`. İkisi aynı onay ekranıdır.
   Bu sayfa menüde yok ve arama motorlarına kapalı; üstündeki **← Öğretmen paneli** ile panele dönersin.
2. Giriş yapmadıysan **Giriş yap**'a bas ve öğretmen hesabınla gir. Giriş sonrası panele geri dönersin.
3. En üstte **bekleyen yorum sayısı** görünür. Her yorumun üstünde ders adı (tıklayınca ders açılır), tarih ve isim var.
   - **Onayla:** Yorum yayınlanır. Ders sayfasında birkaç saniye içinde görünür (sayfayı yenile).
   - **Cevap yaz:** Yorumun altında "Ömer Faruk Bozkurt" adıyla görünecek cevabını yaz ve **Cevabı kaydet**'e bas.
     Cevabı silmek için metni boşaltıp kaydet.
   - **Sil:** Yorum kalıcı olarak silinir (onay sorulur). Spam ve kişisel bilgi içeren yorumlar için kullan.
4. **Yayındaki yorumlar** bölümünde **Yayından kaldır** yorumu tekrar "onay bekliyor" durumuna alır; sayfada görünmez olur.

Öğretmen hesabıyla giriş yapmamış biri bu sayfayı açarsa hiçbir yorum göremez; Firestore kuralları buna izin vermez.

### Yöntem B: Firebase Console'dan onaylama

1. [Firebase Console](https://console.firebase.google.com) → **bozkurtacademy-8ab85** → **Firestore Database** → **Veriler**.
2. **comments** koleksiyonunu aç. Her belge bir yorumdur: `lesson` (ör. `A1/artikel`), `name`, `comment`, `createdAt`, `status`.
3. Onaylamak için `status` alanının değerini `pending` yerine `approved` yap (kalem simgesi → değer → **Güncelle**).
4. Cevap eklemek için **Alan ekle** → alan adı `reply`, tür `string`, değer cevabın.
5. Yayından kaldırmak için `status` değerini tekrar `pending` yap. Silmek için belgenin menüsünden **Belgeyi sil**.

Yorumlara asla e-posta adresi, telefon veya başka kişisel bilgi ekleme. Yıldız veya puan şeması (Review, AggregateRating)
kullanılmaz.

### Kurallar değiştiğinde

`firestore.rules` dosyası değişen her birleştirmeden sonra dosyanın tamamını Firebase Console → **Firestore Database** →
**Kurallar** sekmesine yapıştırıp **Yayınla**'ya basman gerekir. Yayınlanmazsa yorum gönderme ve onay paneli "izin yok" hatası verir.

---

## 2. Ana sayfadaki "Öğrenciler ne diyor?" alanı

Ana sayfada (`index.html`) öğrenci yorumları için bir alan hazır, ama şu an **gizli** ve içi boş.
Öğrencilerinden yayın izni aldığında:

1. `index.html` dosyasında `id="ogrenci-yorumlari"` geçen satırı bul.
2. O `<section …>` etiketinin sonundaki `hidden` kelimesini sil.
3. Hemen üstteki açıklamada şablon var. Her yorum için `<ul class="ba-reviews-list">` içine şunu ekle:

```html
<li><figure class="ba-review"><blockquote><p>Yorum metni</p></blockquote><figcaption><strong>Ad veya baş harfler</strong> · Seviye / hedef</figcaption></figure></li>
```

- Yalnızca izin aldığın gerçek yorumları ekle. Örnek veya uydurma yorum ekleme.
- Yorumdaki `<`, `>` ve `&` işaretlerini sırasıyla `&lt;`, `&gt;` ve `&amp;` olarak yaz.
- Yıldız veya puan şeması (Review, AggregateRating) eklenmez.

### Öğrencilerden yayın izni istemek için mesaj şablonu

> Merhaba [Ad],
>
> Derslerimiz hakkında bana yazdığın güzel sözler için çok teşekkür ederim. İzin verirsen bu yorumu
> bozkurtacademy.com sitesinde, Almanca öğrenmek isteyen diğer kişilerin görebileceği şekilde paylaşmak isterim.
>
> Yorumun yanında adının nasıl görünmesini istersin? (Örneğin "Ayşe", "Ayşe K." ya da sadece baş harfler "A. K.")
> İstersen seviyeni veya hedefini de (ör. "A1 · aile birleşimi") ekleyebilirim.
>
> İzin vermek istemezsen hiç sorun değil, yorumun sitede yer almaz. İzin verdikten sonra fikrini değiştirirsen
> bana yazman yeterli, yorumu hemen kaldırırım.
>
> Sevgiler,
> Ömer Faruk

## 3. Blog

Blog sayfaları `scripts/build-pages.mjs` ile üretilir. Kaynaklar `_blog/` klasöründedir (alt çizgili klasör GitHub Pages'te yayınlanmaz, sadece kaynak olarak durur):

- `_blog/posts.json`: yazı listesi (adres, başlık, açıklama, giriş cümlesi, tarih, durum, ilgili sayfalar).
- `_blog/<adres>.html`: yazının metni (H2 başlıklarla başlar; H1 şablondan gelir).

### Taslak ve yayın

- `"status": "draft"`: sayfa `noindex`, sitemap'te yok, üstte "Taslak" notu var. Adresi bilen görebilir ama Google'a kapalıdır.
- `"status": "published"`: sayfa indekslenir, sitemap'e girer, BlogPosting şeması eklenir.
- Blog ana sayfası (`/blog/`) yayınlanmış yazı olmadıkça `noindex` kalır ve sitemap'e girmez. İlk yazı yayınlanınca otomatik olarak açılır.
- Blog menüde yoktur. İlk yazılar yayınlandıktan sonra menüye eklemek ayrı bir değişiklik olarak yapılacak.
- Yayından önce metindeki `<!-- KONTROL ET -->` notlarının bulunduğu yerleri resmî kaynaklardan kontrol et. Bu notlar sayfada görünmez ama kaynak kodda durur.
- Değişiklikten sonra: `node scripts/build-pages.mjs`. Yayın tarihi (`date`) yayın gününe göre güncellenmeli; sonradan güncelleme yapılırsa `"updated": "YYYY-AA-GG"` eklenebilir.

### 12 haftalık blog takvimi (haftada 1 yazı)

Arama hacimleri Search Console verisi geldikçe gözden geçirilmeli. Resmî şartlar, ücretler ve sınav kuralları kesin rakamla yazılmaz; resmî kaynağa yönlendirilir ve `<!-- KONTROL ET -->` ile işaretlenir.

| Hafta | Hedef arama | Başlık önerisi | Link verilecek sayfalar | Durum |
|---|---|---|---|---|
| 1 (12 Kasım 2026) | almanca nasıl öğrenilir | Almanca Nasıl Öğrenilir? Sıfırdan Başlayanlar İçin Yol Haritası | /a1-almanca-kursu/, /almanca-gramer/a1/ (artikel, praesens, w-fragen), /almanca-ozel-ders/ | Taslak yazıldı |
| 2 (19 Kasım 2026) | almanca günlük kalıplar | Almanca Günlük Kalıplar: Her Gün İşine Yarayacak 40 İfade | /almanca-gramer/a1/w-fragen/, /almanca-gramer/a1/modalverben/, /almanca-gramer/a2/konjunktiv-ii/, /online-almanca-dersi/ | Taslak yazıldı |
| 3 (26 Kasım 2026) | a1 almanca sınavı nasıl geçilir | A1 Almanca Sınavı Nasıl Geçilir? Bölüm Bölüm Hazırlık Rehberi | /a1-almanca-kursu/, /almanca-sinav-hazirlik/, /#exams, /almanca-gramer/a1/ | Taslak yazıldı |
| 4 (3 Aralık 2026) | goethe telc farkı | Goethe mi telc mi? Almanca Sınavları Arasındaki Farklar | /almanca-sinav-hazirlik/, /b1-almanca-kursu/ | Planlandı |
| 5 (10 Aralık 2026) | aile birleşimi için almanca | Aile Birleşimi İçin Almanca: Nereden Başlamalı? | /a1-almanca-kursu/, /almanca-gramer/a1/, /iletisim/ (resmî şartlar için yalnızca yönlendirme) | Planlandı |
| 6 (17 Aralık 2026) | almanya'da çalışmak için hangi seviye almanca | Almanya'da Çalışmak İçin Hangi Seviye Almanca Gerekir? | /b1-almanca-kursu/, /b2-almanca-kursu/ (seviye şartları için resmî kaynağa yönlendirme) | Planlandı |
| 7 (24 Aralık 2026) | almanca artikel nasıl öğrenilir | der, die, das: Almanca Artikeller Nasıl Akılda Kalır? | /almanca-gramer/a1/artikel/, /almanca-gramer/a1/plural/ | Planlandı |
| 8 (31 Aralık 2026) | almanca konuşma pratiği | Almanca Konuşma Pratiği: Evde ve Derste Neler Yapılabilir? | /almanca-grup-dersi/, /almanca-ozel-ders/ | Planlandı |
| 9 (7 Ocak 2027) | a2 almanca sınavı / dtz | A2 Seviyesinde Neler Öğrenilir? A2 Sınavına Hazırlık | /a2-almanca-kursu/, /almanca-gramer/a2/ (perfekt, dativ, nebensaetze) | Planlandı |
| 10 (14 Ocak 2027) | almanca perfekt | Almancada Geçmiş Zaman: Perfekt ve Präteritum Ne Zaman Kullanılır? | /almanca-gramer/a1/perfekt/, /almanca-gramer/a2/praeteritum/ | Planlandı |
| 11 (21 Ocak 2027) | almanca e-posta yazma / resmi mektup | Almanca E-posta ve Resmî Mektup Nasıl Yazılır? Örneklerle | /b1-almanca-kursu/, /almanca-sinav-hazirlik/ | Planlandı |
| 12 (28 Ocak 2027) | b1 almanca sınavı | B1 Almanca Sınavına Nasıl Hazırlanılır? | /b1-almanca-kursu/, /almanca-sinav-hazirlik/, /almanca-gramer/b1/ | Planlandı |

Her yazı en az bir kurs sayfasına, ilgili gramer derslerine ve sonunda iletişim sayfasına link verir. Kişisel deneyim veya başarı iddiası (öğrenci sayısı, geçme oranı vb.) yazılmaz.
