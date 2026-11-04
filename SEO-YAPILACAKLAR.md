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
