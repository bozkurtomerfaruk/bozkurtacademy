# SEO yapılacaklar

Bu dosya, sitenin kodu dışında senin yapman gereken işleri adım adım anlatır.
Search Console, backlink ve aylık kontrol listesi bölümleri SEO planının 5. adımında eklenecek.

---

## 1. Gramer derslerine gelen yorumları yayınlama

Bir öğrenci bir gramer dersinin altındaki formdan yorum gönderdiğinde yorum **otomatik yayınlanmaz**.
Önce sana e-postayla gelir. Sen onaylarsan yorum o dersin sayfasında **"Öğrenci yorumları"** başlığı altında,
formun üstünde görünür. Bir derste onaylı yorum yoksa bu bölüm hiç görünmez.

### Gelen e-postada neler var?

- **Konu:** `Bozkurt Academy – A1 yorum incelemesi: Artikel – der, die, das`
- **name:** öğrencinin yazdığı ad
- **email:** öğrencinin e-postası (**sadece senin için**, siteye asla yazılmaz)
- **message:** yorum metni
- **ders:** seviye ve ders adı (ör. `A1 · Artikel – der, die, das`)
- **ders_linki:** dersin sayfası
- **yorum_anahtari:** yorumun JSON dosyasında yazılacağı anahtar (ör. `A1/artikel`)
- **yayin_onayi:** öğrencinin, yorumunun adıyla yayınlanmasını kabul ettiği bilgisi

### Yorumu yayınlamak için

1. Yorumu oku. Spam, hakaret veya kişisel bilgi (telefon, e-posta, adres) varsa yayınlama.
2. GitHub'da `data/grammar-comments.json` dosyasını aç ve kalem simgesiyle (Edit) düzenle.
3. E-postadaki `yorum_anahtari` değerini anahtar olarak kullan. Yorumu şu biçimde ekle:

```json
{
  "A1/artikel": [
    {
      "name": "Öğrencinin formda yazdığı ad",
      "date": "2026-11-04",
      "comment": "Yorum metni, öğrencinin yazdığı gibi"
    }
  ]
}
```

- `name`: Öğrencinin yazdığı adı aynen kullan.
- `date`: Yorumun geldiği tarih, `YYYY-AA-GG` biçiminde. Sayfada "4 Kasım 2026" olarak görünür.
- `comment`: Yorum metni. Satır sonları korunur. HTML yazılsa bile düz metin olarak görünür.
- İstersen `"reply": "Senin cevabın"` ekleyebilirsin. Yorumun altında "Ömer Faruk Bozkurt" adıyla görünür.
- **E-posta adresini bu dosyaya asla ekleme.** Denetim scripti e-posta veya telefon numarası görürse hata verir.

4. Aynı derse ikinci bir yorum eklerken listeye virgülle yeni bir kayıt ekle:
   `"A1/artikel": [ { …ilk yorum… }, { …ikinci yorum… } ]`.
   Farklı bir ders için yeni bir anahtar aç: `"A2/dativ": [ … ]`.
5. Değişikliği commit et. GitHub'daki "Grammar coverage" kontrolü (`node scripts/check-comments.mjs`) dosyayı denetler:
   ders anahtarı gerçekten var mı, tarih doğru mu, izin verilmeyen alan veya e-posta adresi var mı.
6. Kontrol yeşil olunca `main`'e birleştir. Yorum birkaç dakika içinde ders sayfasında görünür.

**Yorumu kaldırmak için:** İlgili kaydı dosyadan sil. Dersin son yorumunu silersen anahtarı tamamen kaldırabilir
ya da boş liste (`[]`) bırakabilirsin.

**Claude'a vermek için:** "Şu yorumu şu derse ekle" dediğinde e-postadaki **ad, tarih, yorum metni ve
yorum_anahtari** bilgilerini gönder. E-posta adresini göndermene gerek yok. Claude yorumu
`data/grammar-comments.json` dosyasına ekler, `node scripts/check-comments.mjs` ile denetler ve
tarayıcıda dersin sayfasında görünüp görünmediğini kontrol eder.

Bu yorumlar için Review veya AggregateRating şeması (yıldız) kullanılmaz.

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
