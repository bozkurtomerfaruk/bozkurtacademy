# SEO yapılacaklar

Bu dosya, sitenin kodu dışında senin yapman gereken işleri adım adım anlatır.
Hiçbiri ücretli değil. Hepsini aynı anda yapman gerekmiyor; aşağıdaki sırayla ilerleyebilirsin.

**İçindekiler**

1. Gramer derslerine gelen yorumları onaylama
2. Ana sayfadaki "Öğrenciler ne diyor?" alanı
3. Blog (yayın adımları ve 12 haftalık takvim)
4. Google Search Console
5. Yeni blog yazısı yayınlama: adım adım
6. Ücretsiz backlink (dış bağlantı) fırsatları
7. Öğrencilerden yorum toplama
8. Google İşletme Profili (isteğe bağlı)
9. Google Analytics 4 (isteğe bağlı)
10. Aylık kontrol listesi

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
- Blog menüde ve footer'da var. Ana sayfadaki "Blogdan son yazılar" bölümü en yeni 3 yazıyı otomatik gösterir.
- Yazının link verdiği gramer derslerinde "Blogda bu konu" notu otomatik çıkar. Kurs sayfalarındaki blog linkleri elle eklenir.
- Yayından önce metindeki `<!-- KONTROL ET -->` notlarının bulunduğu yerleri resmî kaynaklardan kontrol et. Bu notlar sayfada görünmez ama kaynak kodda durur.
- Değişiklikten sonra: `node scripts/build-pages.mjs`. Yayın tarihi (`date`) yayın gününe göre güncellenmeli; sonradan güncelleme yapılırsa `"updated": "YYYY-AA-GG"` eklenebilir.

### 12 haftalık blog takvimi (haftada 1 yazı)

Arama hacimleri Search Console verisi geldikçe gözden geçirilmeli. Resmî şartlar, ücretler ve sınav kuralları kesin rakamla yazılmaz; resmî kaynağa yönlendirilir ve `<!-- KONTROL ET -->` ile işaretlenir.

| Hafta | Hedef arama | Başlık önerisi | Link verilecek sayfalar | Durum |
|---|---|---|---|---|
| 1 (6 Kasım 2026) | almanca nasıl öğrenilir | Almanca Nasıl Öğrenilir? Sıfırdan Başlayanlar İçin Yol Haritası | /a1-almanca-kursu/, /almanca-gramer/a1/ (artikel, praesens, w-fragen), /almanca-ozel-ders/ | Yayında |
| 2 (6 Kasım 2026) | almanca günlük kalıplar | Almanca Günlük Kalıplar: Her Gün İşine Yarayacak 40 İfade | /almanca-gramer/a1/w-fragen/, /almanca-gramer/a1/modalverben/, /almanca-gramer/a2/konjunktiv-ii/, /online-almanca-dersi/ | Yayında |
| 3 (6 Kasım 2026) | a1 almanca sınavı nasıl geçilir | A1 Almanca Sınavı Nasıl Geçilir? Bölüm Bölüm Hazırlık Rehberi | /a1-almanca-kursu/, /almanca-sinav-hazirlik/, /#exams, /almanca-gramer/a1/ | Yayında |
| 4 (6 Kasım 2026) | goethe telc farkı | Goethe mi telc mi? Almanca Sınavları Arasındaki Farklar | /almanca-sinav-hazirlik/, /b1-almanca-kursu/, /almanca-gramer/b1/ | Yayınlandı |
| 5 (10 Aralık 2026) | aile birleşimi için almanca | Aile Birleşimi İçin Almanca: Nereden Başlamalı? | /a1-almanca-kursu/, /almanca-gramer/a1/, /iletisim/ (resmî şartlar için yalnızca yönlendirme) | Planlandı |
| 6 (17 Aralık 2026) | almanya'da çalışmak için hangi seviye almanca | Almanya'da Çalışmak İçin Hangi Seviye Almanca Gerekir? | /b1-almanca-kursu/, /b2-almanca-kursu/ (seviye şartları için resmî kaynağa yönlendirme) | Planlandı |
| 7 (24 Aralık 2026) | almanca artikel nasıl öğrenilir | der, die, das: Almanca Artikeller Nasıl Akılda Kalır? | /almanca-gramer/a1/artikel/, /almanca-gramer/a1/plural/ | Planlandı |
| 8 (31 Aralık 2026) | almanca konuşma pratiği | Almanca Konuşma Pratiği: Evde ve Derste Neler Yapılabilir? | /almanca-grup-dersi/, /almanca-ozel-ders/ | Planlandı |
| 9 (7 Ocak 2027) | a2 almanca sınavı / dtz | A2 Seviyesinde Neler Öğrenilir? A2 Sınavına Hazırlık | /a2-almanca-kursu/, /almanca-gramer/a2/ (perfekt, dativ, nebensaetze) | Planlandı |
| 10 (14 Ocak 2027) | almanca perfekt | Almancada Geçmiş Zaman: Perfekt ve Präteritum Ne Zaman Kullanılır? | /almanca-gramer/a1/perfekt/, /almanca-gramer/a2/praeteritum/ | Planlandı |
| 11 (21 Ocak 2027) | almanca e-posta yazma / resmi mektup | Almanca E-posta ve Resmî Mektup Nasıl Yazılır? Örneklerle | /b1-almanca-kursu/, /almanca-sinav-hazirlik/ | Planlandı |
| 12 (28 Ocak 2027) | b1 almanca sınavı | B1 Almanca Sınavına Nasıl Hazırlanılır? | /b1-almanca-kursu/, /almanca-sinav-hazirlik/, /almanca-gramer/b1/ | Planlandı |

Her yazı en az bir kurs sayfasına, ilgili gramer derslerine ve sonunda iletişim sayfasına link verir. Kişisel deneyim veya başarı iddiası (öğrenci sayısı, geçme oranı vb.) yazılmaz.

---

## 4. Google Search Console

Search Console, Google'ın sitende neyi gördüğünü gösteren ücretsiz araçtır: hangi aramalarda göründüğün,
kaç kişinin tıkladığı, hangi sayfaların Google'da olduğu ve sorun olup olmadığı.

### İlk kurulum (bir kez)

Sitede doğrulama dosyası (`google4cc3144aaa693325.html`) zaten var. Yani mülk büyük ihtimalle doğrulanmış durumda.

1. https://search.google.com/search-console adresine Google hesabınla gir.
2. Sol üstte `bozkurtacademy.com` mülkünü seç. Yoksa "Mülk ekle" → "URL ön eki" → `https://bozkurtacademy.com/` yaz ve "HTML dosyası" ile doğrula (dosya sitede duruyor, silme).
3. Soldaki menüden **Site haritaları**'na gir, `sitemap.xml` yaz ve **Gönder**'e bas. Durum "Başarılı" olmalı.
4. İsteğe bağlı: "Ayarlar → Kullanıcılar ve izinler" bölümünden e-posta bildirimlerinin açık olduğunu kontrol et.

### Neye, ne sıklıkla bakacaksın?

| Ne zaman | Nereye bak | Ne anlama gelir, ne yapmalı |
|---|---|---|
| Her hafta (5 dk) | **Performans → Arama sonuçları** | "Toplam tıklama" ve "Toplam gösterim" yükseliyor mu? Tarih aralığını "Son 28 gün" seç. |
| Her hafta | Aynı sayfada **Sorgular** sekmesi | İnsanlar seni hangi kelimelerle buluyor? Gösterimi çok ama tıklaması az olan sorgular, başlık ve açıklaması iyileştirilecek sayfaları gösterir. |
| Her ay | **Performans → Sayfalar** sekmesi | En çok gösterilen sayfalar hangileri? Hiç görünmeyen sayfa var mı? |
| Her ay | **Dizine ekleme → Sayfalar** | "Dizine eklenmemiş" listesi. "Yönlendirmeli sayfa", "noindex etiketiyle hariç tutuldu" (ör. giriş/panel sayfaları) normaldir. "Bulunamadı (404)" veya "Sunucu hatası" varsa bana yaz. |
| Her ay | **Deneyim → Önemli Web Verileri** ve **HTTPS** | "Kötü" veya "İyileştirme gerekiyor" görünürse bana yaz. |
| Her ay | **Geliştirmeler** (Breadcrumb, SSS vb.) | Şema hataları burada çıkar. Kırmızı hata varsa bana yaz. |
| E-posta gelince | Bildirimin içindeki bağlantı | Google bir sorun bulursa e-posta atar. Paniğe gerek yok; bağlantıyı aç, ekran görüntüsünü bana gönder. |

### Yeni veya değişen bir sayfayı Google'a bildirmek

1. Search Console'un en üstündeki arama kutusuna sayfanın tam adresini yapıştır (ör. `https://bozkurtacademy.com/blog/almanca-nasil-ogrenilir/`).
2. Sonuç gelince **Dizine eklenmesini iste**'ye bas.
3. Bunu yalnızca yeni yazılar ve önemli değişiklikler için yap. Aynı sayfa için tekrar tekrar basmana gerek yok.

**Sabırlı ol:** Yeni bir sitenin aramalarda yükselmesi genellikle haftalar, bazen aylar sürer. Günlük dalgalanmalar normaldir; ay ay karşılaştır.

---

## 5. Yeni blog yazısı yayınlama: adım adım

1. **Konuyu seç:** Bölüm 3'teki takvimden sıradaki konuyu al ya da Search Console'daki "Sorgular" listesinde sık görünen bir soruyu seç.
2. **Yazıyı yaz:** `_blog/<adres>.html` adında bir dosya oluştur. Adres yalnızca küçük harf, rakam ve tire içerir (ör. `goethe-telc-farki`). Metin H2 başlıklarla başlar; ana başlığı (H1) yazma.
3. **Listeye ekle:** `_blog/posts.json` içine yeni bir kayıt ekle. Önce `"status": "draft"` yaz:
   ```json
   {
     "slug": "goethe-telc-farki",
     "title": "Goethe mi telc mi? Almanca Sınavları Arasındaki Farklar",
     "description": "Arama sonuçlarında görünecek 1–2 cümlelik özet (en fazla ~155 karakter).",
     "lead": "Başlığın altındaki giriş cümlesi.",
     "teaser": "Ana sayfadaki kısa tanıtım cümlesi.",
     "date": "2026-12-03",
     "status": "draft",
     "related": [["/almanca-sinav-hazirlik/", "Almanca sınav hazırlık"]]
   }
   ```
4. **Sayfaları üret:** `node scripts/build-pages.mjs` çalıştır. Taslağı `https://bozkurtacademy.com/blog/<adres>/` adresinde görürsün (Google'a kapalı).
5. **Kontrol et:** Linkler çalışıyor mu? `<!-- KONTROL ET -->` notlu yerleri resmî kaynaktan kontrol ettin mi? Kişisel başarı iddiası veya uydurma bilgi yok mu? Sınav ücreti, şart, süre gibi değişebilen bilgiler kesin rakamla yazılmadı mı?
6. **Yayınla:** `"status": "published"` yap, `date` alanını yayın gününe ayarla ve tekrar `node scripts/build-pages.mjs` çalıştır. Yazı otomatik olarak blog listesine, ana sayfaya, sitemap'e ve link verdiği gramer derslerine eklenir.
7. **Geri dönüş linki:** Kurs sayfasında uygun cümlenin sonuna `<!-- ba:blog:<adres> --><!-- /ba:blog:<adres> -->` işaretini koy ve `posts.json` kaydına cümleyi ekle:
   `"backlinks": {"/b1-almanca-kursu/": "… için {link} yazısına bakabilirsin."}`. Cümle yazı yayınlanınca otomatik görünür; taslakken boş kalır. Gramer derslerindeki "Blogda bu konu" notu zaten otomatiktir.
8. **Google'a bildir:** Bölüm 4'teki "Dizine eklenmesini iste" adımını yap.
9. **Paylaş:** Yazının linkini sosyal medya profillerinde paylaş (Bölüm 6).

Bunu benimle yapıyorsan, "şu konuda yeni yazı" demen yeterli; dosyaları ben hazırlarım, sen okuyup onaylarsın.

**Haftalık otomatik yazı:** Her pazartesi çalışan zamanlanmış görev `docs/haftalik-blog.md` talimatına göre takvimdeki sıradaki yazıyı taslak olarak hazırlar. Okuyup "yayınla" demen yeterli. Görev çalışmazsa Claude'a "Haftalık blog yazısını yaz" yazman da aynı işi yapar.

---

## 6. Ücretsiz backlink (dış bağlantı) fırsatları

Başka sitelerden seninkine verilen linkler, Google'a sitenin güvenilir olduğunu gösterir.
Az ama **gerçek ve ilgili** link, çok sayıda alakasız linkten iyidir.

**Yapma:** Link satın alma, "1000 backlink" paketleri, link değişim çiftlikleri, alakasız forumlara toplu reklam yazma. Bunlar Google'da cezaya yol açabilir.

### a) Kendi profillerin (en kolay, ilk hafta)

Her profilde aynı adı (Bozkurt Academy), aynı kısa açıklamayı ve `https://bozkurtacademy.com/` adresini kullan.
Telefon, adres, şehir ve fiyat yazma.

- **YouTube kanalı:** Kanal açıklamasına ve "Bağlantılar" bölümüne site adresini ekle. Kısa gramer videolarının açıklamasına ilgili dersin linkini koy (ör. Artikel videosu → `/almanca-gramer/a1/artikel/`).
- **Instagram:** Biyografideki bağlantıya site adresini ekle. Gönderilerde "linki biyografide" diyebilirsin.
- **LinkedIn:** Kişisel profilinde "İletişim bilgileri → Web sitesi" bölümüne ekle. İstersen bir şirket sayfası da açabilirsin.
- **Facebook sayfası, X (Twitter), Pinterest, TikTok:** Hangisini kullanıyorsan, profil linkine site adresini ekle. Kullanmadığın platforma açmak zorunda değilsin.
- **GitHub:** Site zaten GitHub'da; depo açıklamasındaki "Website" alanına adresi yaz.

### b) Eğitim ve öğretmen dizinleri

Ücretsiz profil açabildiğin öğretmen ve ders platformlarında profilinde web siteni belirt
(platform izin veriyorsa). Profilde yalnızca gerçek bilgiler olsun; sertifika, yıl veya öğrenci sayısı uydurma.
Ücretli üyelik isteyen dizinlere gerek yok.

### c) Faydalı içerikle doğal link

- **Forumlar ve soru-cevap siteleri** (ör. Ekşi Sözlük, Reddit'in Almanca öğrenme toplulukları, Quora Türkçe): Almanca öğrenme sorularına gerçekten faydalı bir cevap yaz; konu tam uyuyorsa ilgili gramer dersine link ver. Her cevaba link koyma; önce yardım et.
- **Facebook ve Telegram grupları** (Almanya'da yaşayan Türkler, Almanca öğrenenler): Grup kurallarına uy. Reklam yerine "artikeller için ücretsiz anlatım hazırladım" gibi faydalı paylaşım yap.
- **Okulun / üniversiten:** Öğrenci kulüpleri veya mezun sayfaları bazen öğrencilerin projelerine link verir. Sorabilirsin.
- **Tanıdığın öğretmenler ve blog yazarları:** Gramer anlatımların veya ücretsiz alıştırmalar kendi öğrencilerine faydalı olacaksa, linki onlara gönderebilirsin.

Bir ayda 2–3 kaliteli link hedeflemek yeterli.

---

## 7. Öğrencilerden yorum toplama

Gerçek öğrenci yorumları hem ziyaretçilere güven verir hem de ileride ana sayfadaki yorum alanında kullanılabilir.

1. **Ne zaman sor:** Öğrenci bir hedefe ulaştığında (ör. sınavı geçtiğinde, bir seviyeyi bitirdiğinde) veya birkaç ders sonra memnun olduğunu söylediğinde.
2. **Nasıl sor:** Kısa ve baskısız. Örnek mesaj:
   > Merhaba [Ad], derslerimiz hakkında birkaç cümlelik görüşünü yazmak ister misin? Neyin işine yaradığını ve
   > nelerin daha iyi olabileceğini merak ediyorum. Yazmak istemezsen hiç sorun değil.
3. **Yayın izni:** Yorumu sitede kullanmak istiyorsan Bölüm 2'deki izin şablonunu gönder. İzin yoksa yayınlama.
4. **Kaydet:** Gelen yorumları ve izinleri (tarih, izin verilen ad biçimi) kendin için bir dosyada sakla.
5. **Yerleştir:** İzin alınan yorumları Bölüm 2'deki adımlarla ana sayfaya ekle (veya bana gönder).

**Kurallar:** Yorumu değiştirme (yazım hatası düzeltmesi için bile izin iste), uydurma veya karşılığında indirim/hediye verme.
Puan veya yıldız şeması eklenmez.

---

## 8. Google İşletme Profili (isteğe bağlı)

Google İşletme Profili, Google Haritalar ve yerel aramalar için kullanılır. Dersler online olduğu ve sitede
adres/şehir bulunmadığı için **zorunlu değil**.

Açmak istersen:

- Adres göstermeyen "hizmet bölgesi işletmesi" seçeneğini kullan. Adresin profilde herkese açık görünmemeli.
- Google doğrulama için posta, video veya telefonla kod isteyebilir; bu bilgiler herkese gösterilmez.
- Profile site adresini ekle; telefon numarası alanını boş bırakabilirsin.
- Sitedeki kurala uygun olarak profilde fiyat yazma.

Kararsızsan şimdilik açma; Search Console ve blog çok daha önemli.

---

## 9. Google Analytics 4 (isteğe bağlı)

Sitede şu an gizlilik dostu, çerezsiz **GoatCounter** sayacı var: hangi sayfaların kaç kez açıldığını gösterir.
Başlangıç için bu ve Search Console yeterlidir.

GA4 kurmak istersen ayrıca bir çerez onay bandı ve gizlilik metninde güncelleme gerekir. Bu yüzden
şu an önerilmiyor. İleride istersen bana söyle, ayrı bir adım olarak planlarız.

---

## 10. Aylık kontrol listesi

Her ayın ilk haftası yaklaşık 30–45 dakika ayır. Kutucukları bu dosyanın bir kopyasında veya not defterinde işaretleyebilirsin.

**Search Console**
- [ ] Son 28 günün tıklama ve gösterimlerini bir önceki ayla karşılaştır (Performans → "Karşılaştır").
- [ ] En çok gösterim alan 5 sorguyu not et. Bunlardan biri yeni bir blog yazısı konusu olabilir mi?
- [ ] Gösterimi yüksek ama tıklama oranı (TO) düşük sayfaları not et; başlık ve açıklamalarını gözden geçirelim.
- [ ] "Dizine ekleme → Sayfalar"da yeni bir hata var mı?
- [ ] Önemli Web Verileri ve Geliştirmeler bölümünde kırmızı uyarı var mı?

**İçerik**
- [ ] Bu ay planlanan blog yazıları yayınlandı mı? (Bölüm 3'teki takvimde durumu güncelle.)
- [ ] Eski bir yazıyı veya kurs sayfasını gözden geçir: bilgiler hâlâ doğru mu? Kırık link var mı?
- [ ] Yazılardaki `<!-- KONTROL ET -->` notlu resmî bilgiler değişmiş mi? (sınav kuralları, şartlar)

**Yorumlar ve güven**
- [ ] Gramer derslerinde onay bekleyen yorum var mı? (Bölüm 1)
- [ ] Bu ay en az bir öğrenciden yorum istedin mi? (Bölüm 7)

**Görünürlük**
- [ ] Bu ay yayınlanan yazıları sosyal medya profillerinde paylaştın mı?
- [ ] Yeni bir faydalı backlink fırsatı denedin mi? (Bölüm 6)

**Teknik (hızlı bakış)**
- [ ] Ana sayfa, iletişim formu ve bir gramer dersi telefonda düzgün açılıyor mu?
- [ ] İletişim formundan kendine bir test mesajı gönder; e-posta geliyor mu?
- [ ] GoatCounter'da beklenmedik bir düşüş var mı?

Bir sorun görürsen ekran görüntüsünü ve sayfa adresini bana göndermen yeterli.
