# Ödev e-postası: kurulum

Öğretmen ödev verince (ve isteğe bağlı olarak ödevi düzenleyince) öğrenciye, 16 yaş altında "veliyi de ekle" açıksa veliye de, kısa bir "Yeni ödev" e-postası gider. Gönderimi mevcut Cloudflare Worker (`schreiben-kontrol`) yeni bir adreste (`/odev-bildirim`) yapar; e-posta Brevo'nun transactional API'siyle info@bozkurtacademy.com adına gider.

- **Ücret:** Yok. Brevo ücretsiz planı (günde 300 e-posta; site günde en fazla 100 gönderir), Cloudflare Workers ücretsiz planı, Firebase Spark. Kart gerekmez.
- **E-postada ne var:** Ödevin başlığı, varsa teslim tarihi (Berlin saati) ve "Ödevlerim" sayfasının bağlantısı. Ödevin içeriği, notlar, bağlantılar ya da öğrencinin adı yok. Öğrencinin panelde seçtiği dilde (TR/DE/EN; bilinmiyorsa TR). Yanıt adresi info@.
- **Güvenlik:** Tarayıcı Worker'a sadece ödev kopyalarının kimliklerini gönderir. Worker öğretmenin oturum belirtecini Firebase'e sordurur (`TEACHER_UID` değilse reddeder), e-posta adresini, dili ve başlığı Firestore'dan **öğretmenin kendi belirteciyle** okur. Yeni bir hesap ya da yetki yok.
- **Tekrar yok:** "Yeni ödev" her ödev kopyası için bir kez gider (`mailNewAt`). "Ödev güncellendi" ödev başına günde en fazla bir kez gider ve aynı gün "yeni ödev" gittiyse gitmez (`mailUpdateAt`).

Kod: `worker/schreiben-kontrol.js` ("Ödev e-postası" bölümü), `js/account/homework-mail.js`. Testler: `npm run test:worker`, `npm run test:odev-eposta`.

## Senin yapacakların (PR birleştikten sonra, sırayla)

### 1. Brevo: API anahtarı

1. https://app.brevo.com adresinde oturum aç.
2. Sağ üstte hesap adın → **SMTP & API** → **API Keys** sekmesi → **Generate a new API key**.
3. Ad: `Worker ödev e-postası` → **Generate**. Anahtar **sadece bir kez** gösterilir; kopyala ve bir yere yapıştırmadan doğrudan 3. adımdaki Cloudflare ekranına gir (bana gönderme, depoya koyma).
4. **Authorised IPs (Yetkili IP'ler):** Hesap adın → **Security** → **Authorised IPs**. Bu özellik açıksa (IP kısıtlaması etkinse) Cloudflare'in değişen IP adreslerinden gelen istekler reddedilir. Kısıtlamayı kapat ("Deactivate blocking" ya da benzeri). Ekranda bu bölüm yoksa ya da kısıtlama zaten kapalıysa bir şey yapma. Kapatmak istemezsen e-posta gönderimi çalışmaz; bunu 5. adımdaki denemede görürsün.

### 2. Brevo: gönderen adresi ve takip

1. **Senders, Domains & Dedicated IPs** → **Senders**: `info@bozkurtacademy.com` listede ve doğrulanmış (yeşil) olmalı. Gmail yanıtları için Brevo SMTP kurulurken eklendiyse zaten vardır. Yoksa **Add a sender** → ad "Bozkurt Academy", e-posta info@ → gelen doğrulama e-postasındaki bağlantıya tıkla (e-posta Gmail'ine yönlendirilir).
2. **Domains** sekmesinde `bozkurtacademy.com` "Authenticated" görünmüyorsa Brevo'nun gösterdiği DNS kayıtlarını (DKIM, gerekirse Brevo kodu) Cloudflare DNS'e ekle; e-postaların spam'e düşmemesi için önerilir.
3. **Açılma ve tıklama takibi:** Brevo transactional e-postalarda açılma (görünmez piksel) ve tıklama (bağlantı yönlendirme) takibi yapabilir. Kapatmak için **Transactional** (ya da **Campaigns → Transactional**) → **Settings** bölümünde "Tracking" / "Open tracking" / "Click tracking" seçeneğini ara ve kapat.
   - **Bunu buradan doğrulayamadım:** Geliştirme ortamından Brevo'nun yardım sayfalarına erişilemedi. Ücretsiz planda bu ayarın olup olmadığından emin değilim; API'de mesaj başına takibi kapatan bir seçenek de kodda kullanılmıyor.
   - **Ayarı bulamazsan ya da ücretsiz planda kapatılamıyorsa:** Takip açık kalır. Yani Brevo, e-postanın açıldığını ve "Ödevlerim" bağlantısına tıklandığını kaydedebilir; bağlantı Brevo üzerinden yönlendirilebilir. Bu durumu bana yaz; gizlilik metnine bunu açıkça ekleriz (şu anki metin takipten söz etmiyor).

### 3. Cloudflare: Worker kodu ve değişkenleri

1. https://dash.cloudflare.com → **Workers & Pages** → `schreiben-kontrol`.
2. **Edit code** → soldaki `worker.js`'in içini tamamen sil → depodaki `worker/schreiben-kontrol.js`'in **tamamını** yapıştır → **Deploy**. (Schreiben kontrolünün kodu değişmedi; aynı dosyaya yeni bir bölüm eklendi.)
3. **Settings** → **Variables and Secrets** → **Add**. Mevcut değişkenler kalır, şunları ekle:

| Ad | Tür | Değer |
|---|---|---|
| `TEACHER_UID` | Text | `IoTwBV5HjRUaoLoj0SCI0VVGkfk2` (öğretmen hesabının UID'i; `firestore.rules` → `teacherUid()` ile aynı) |
| `BREVO_API_KEY` | **Secret** | 1. adımdaki Brevo API anahtarı |
| `MAIL_DAILY_LIMIT` | Text | `100` |

`MAIL_FROM` eklemezsen gönderen `info@bozkurtacademy.com` olur. `ALLOWED_ORIGINS` ve `SITE_URL` zaten var (Schreiben kurulumu); değiştirme.

4. **Deploy** (değişkenler kaydedildikten sonra).

### 4. Firestore kurallarını yayınla

Kurallar değişti: öğrenci kendi profiline sadece arayüz dilini (`lang`: tr/de/en) yazabiliyor; kayıtta da dil kaydediliyor.

1. https://console.firebase.google.com → proje `bozkurtacademy-8ab85` → **Firestore Database** → **Rules**.
2. Ekrandaki metni tamamen sil, depodaki `firestore.rules`'un **tamamını** yapıştır → **Publish**.
3. Kuralları yayınlamazsan öğrencinin dili kaydedilemez (panel yine çalışır, e-posta Türkçe gider).

### 5. Canlı deneme

1. Kendine ait bir test öğrenci hesabına (ya da onayınla gerçek bir öğrenciye) `ogretmen-odev.html`'den kısa bir ödev ver; "Öğrencilere e-posta ile bildir" işaretli kalsın.
2. Ödev listesinde "E-posta: 1 öğrenciye gönderildi" yazmalı ve e-posta birkaç dakika içinde gelmeli.
3. "E-posta gönderilemedi: Worker'da Brevo anahtarı ya da TEACHER_UID ayarlı değil" görürsen 3. adımdaki değişkenleri, "gönderilemedi" görürsen 1.4 (Authorised IPs) ve 2.1 (gönderen) adımlarını kontrol et. Cloudflare → Worker → **Logs** sekmesinde `brevo 401` (anahtar/IP) ya da `brevo 400` (gönderen doğrulanmamış) görünür.
4. Sonucu bana yaz; `docs/durum.md`'ye eklerim.

## İşleyiş ayrıntıları

- **Formda:** Yeni ödevde "Öğrencilere e-posta ile bildir" varsayılan işaretli. Düzenlemede "Değişikliği mevcut öğrencilere e-postayla bildir" varsayılan işaretsiz; "Yeni eklediğin öğrencilere e-posta gönder" işaretli.
- **Ödev listesinde:** Sonuç bildirimi (kime gitti, kime neden gitmedi, bugünkü sayaç). Öğrenci başına "E-posta gönderildi · tarih" ya da "E-posta gönder" (tekrar dene); "Tüm öğrenciler" görünümünde "N öğrenciye e-posta gitmedi · Gönder".
- **Öğrenci detayında:** "Yeni ödevlerde e-posta gönder" (kapatınca `homeworkMail: false`). 16 yaş altında veliye gitmesi için veli kartındaki "Ders davetlerine, hatırlatma ve ödev e-postalarına veliyi de ekle" açık olmalı.
- **Gönderilmeyen durumlar:** bildirim kapalı, hesap açık değil, e-posta adresi yok, günlük sınır (site genelinde 100, veliye giden de sayılır), Brevo hatası. E-posta gitmese de ödev kayıtlıdır.
