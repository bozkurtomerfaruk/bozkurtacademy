# Seviye tespit sınavı

- **Öğrenci sayfası:** https://bozkurtacademy.com/#seviye-testi
- **Yönetim sayfası:** https://bozkurtacademy.com/#yonetim/seviye-testleri
  - Sitenin hiçbir yerinden bağlantı verilmez.
  - Önce `giris.html`'de öğretmen hesabınla giriş yap.

## Canlıya alma: yapman gerekenler (sırayla)

Bu üç adımdan ilk ikisi yapılmadan sonuç gönderilemez. Öğrenci "Sonuç gönderilemedi" mesajını ve e-posta adresini görür; test sayfasının kendisi yine çalışır.

### 1. Anonim girişi aç

1. Firebase Console → proje `bozkurtacademy-8ab85` → **Authentication** → **Sign-in method** (Oturum açma yöntemi).
2. **Yeni sağlayıcı ekle** → **Anonim** → **Etkinleştir** → **Kaydet**.

Neden gerekli: Öğrencinin hesap açmasına gerek yok. Bekleme süresi kurallarda kullanıcı kimliğine bağlı olduğu için gönderim anonim bir oturumla yapılır. Gönderimden hemen sonra bu oturum kapatılır.

### 2. Güvenlik kurallarını yayınla

**Konsoldan:**
1. Firebase Console → **Firestore Database** → **Kurallar**.
2. Repodaki `firestore.rules` dosyasının tamamını yapıştır.
3. **Yayınla**.

**Komutla (alternatif):** `npx firebase deploy --only firestore:rules --project bozkurtacademy-8ab85`

**Hesap kimliğin (UID):**
- Kurallarda zaten yazılı: `teacherUid()` = `IoTwBV5HjRUaoLoj0SCI0VVGkfk2`.
- Kontrol etmek için: Firebase Console → **Authentication** → **Users** → kendi Google hesabının satırındaki **Kullanıcı UID'si** sütunu. Ya da `giris.html`'de öğretmen olmayan bir hesapla giriş yaptığında ekranda görünen UID.
- UID değişirse `firestore.rules` → `teacherUid()` ile `js/account/config.js` → `TEACHER_UID` birlikte güncellenmeli.

### 3. 6 ay sonra otomatik silme (TTL politikası)

Her kayıtta `expireAt` alanı var: oluşturulma + 183 gün. Kurallar bu değeri ±1 gün tolerans ile kontrol eder; tolerans, öğrencinin bilgisayar saatindeki küçük farklar için.

**Konsoldan:**
1. Google Cloud Console → proje `bozkurtacademy-8ab85` → **Firestore** → **Time-to-live (TTL)**: https://console.cloud.google.com/firestore/databases/-default-/ttl?project=bozkurtacademy-8ab85
2. **Create policy** (Politika oluştur): Collection group `placementTests`, Timestamp field `expireAt` → **Create**.
3. Durum birkaç dakika içinde "Serving" olur.

**Komutla (alternatif):** `gcloud firestore fields ttls update expireAt --collection-group=placementTests --enable-ttl --project=bozkurtacademy-8ab85`

Bilinmesi gerekenler:
- `firestore.indexes.json` dosyasında aynı politika `fieldOverrides` olarak duruyor. `npx firebase deploy --only firestore` komutu kuralları ve TTL'yi birlikte yayınlar.
  - Dikkat: Bu komut Firestore'daki ama dosyada olmayan bileşik indeksleri silmek isteyebilir. Silmeden önce sorar; "hayır" de.
- Google, süresi dolan belgeleri hemen değil, genellikle süre dolduktan sonraki 24 saat içinde siler.
- Bekleme belgeleri (`placementLimits/{uid}`) yalnızca anonim kimlik ve son gönderim zamanını tutar; kişisel veri içermez ve silinmez.

## Veri

**`placementTests/{otomatik kimlik}`**

| Alan | İçerik |
|---|---|
| `name`, `email` | Ad, e-posta |
| `goal` | Hedef: `daily` / `exam` / `work` / `school` / `other` |
| `examName`, `examDate` | Sınav bilgisi; boş olabilir |
| `experience` | Öğrenme süresi: `none` / `lt6m` / `6to12m` / `1to2y` / `gt2y` |
| `note` | Not |
| `level`, `near` | Tahmini seviye (`A0`–`C1`) ve yaklaşılan seviye (ör. `A2` + `B1` = "A2 – B1'e yakın") |
| `skipped` | "Hiç Almanca bilmiyorum" seçildi mi |
| `blocks` | Her blokta doğru/toplam, ör. `{ A1: { correct: 9, total: 10 } }` |
| `topicErrors` | Konu bazında hatalar, ör. `perfekt:1,lesen:2` |
| `wrong` | Yanlış cevaplar; her satırda `soru-kimliği<TAB>öğrencinin cevabı`, "Bilmiyorum" için `?` |
| `writing` | Yazma görevi metni |
| `durationSec` | Toplam süre (sn); sayfa açık ve görünürken sayılır |
| `bank` | Soru bankası sürümü |
| `lang` | Arayüz dili |
| `consent` | Onay |
| `uid` | Gönderen (anonim) kimlik |
| `createdAt`, `expireAt` | Gönderim tarihi ve silinme tarihi |
| `read`, `adminNote` | Sadece öğretmen değiştirir: okundu ve kendi notun |

Yönetim sayfası soru metnini ve doğru cevabı soru kimliğiyle `data/seviye-testi/sorular.json`'dan bulur. Bu yüzden bir soru değiştirilecekse kimliği aynı kalmamalı: yeni kimlik ver, eskisini silme ya da `version`'ı artır.

`placementLimits/{uid}`: `{ lastAt, lastId }`, yani bekleme süresi için son gönderimin zamanı ve kimliği.

## Güvenlik kuralları (özet)

**Ekleme (`create`):** Giriş yapmış herkes (anonim dahil) sadece ekleyebilir.
- Alan listesi sabit; türler, değerler ve boyutlar sınırlı (ad ≤ 80, not ≤ 1000, yazı ≤ 3000, yanlışlar ≤ 8000 karakter vb.).
- `createdAt` sunucu saati, `read == false`, `consent == true`, `uid` = gönderen.
- `expireAt` = 183 gün ± 1 gün.

**Bekleme süresi:**
- Sonuç, aynı batch içinde `placementLimits/{uid}` belgesiyle birlikte yazılmak zorunda. Bu belge sonucun kimliğini gösterir; böylece tek batch'te iki sonuç yazılamaz.
- Bu belge en erken 10 dakikada bir güncellenebilir.
- Tarayıcı ayrıca aynı cihazdan 10 dakika içinde ikinci gönderimi engeller; gizli tuzak alanı (honeypot) da var.

**Okuma, güncelleme, silme:** Sadece öğretmen UID'i (`isTeacher()`). Gizli adrese güvenilmez; yönetim sayfası öğretmen olarak giriş yapılmamışsa Firestore'a hiç istek göndermez, kurallar da reddeder.

**Bilinen sınır:** Anonim hesap herkes için ücretsiz ve sınırsız açılabildiği için kararlı biri her seferinde yeni anonim hesapla bekleme süresini aşabilir. Gerekirse ileride **Firebase App Check** (reCAPTCHA Enterprise) eklenebilir; şimdilik eklenmedi.

## Testler

- `npm test`: Firestore kural testleri; 18'i seviye testi için, toplam 100 test.
- `npm run test:placement`: Playwright tarayıcı testleri, emülatörde.
  - Gerçek Firestore'a hiçbir şey yazılmaz.
  - Kapsam: blok geçişleri, erken bitiş, "Hiç Almanca bilmiyorum", sonuç hesaplama, form doğrulama, gönderim, bekleme süresi, yenileme sonrası devam, yönetimde yetkili/yetkisiz erişim, okundu/not/sil, üç dil, iki tema, 390 px.

## Gizlilik politikası (onaylandı ve 26.10.2026'da privacy.html'e eklendi)

Aşağıdaki öneri senin onayınla `privacy.html`'e TR/DE/EN olarak eklendi (bölüm 2, 3, 5a, 6, 11 ve son güncelleme tarihi). Çeviriler `js/privacy.js`'de. Önerinin ilk hâli kayıt için aşağıda.

`privacy.html`'de seviye testinden hiç söz edilmiyor. Ayrıca 2. bölümdeki "Giriş yapmamış ziyaretçiler için Firebase yüklenmez" cümlesi artık tam doğru değil. Önerilen değişiklikler:

1. **2. bölüm, son madde:** "Giriş yapmamış ziyaretçiler için Firebase yüklenmez. Tek istisna: Seviye testinin sonucunu göndermek için 'Sonucu gönder'e bastığında Firebase yüklenir (bkz. 5a)."
2. **2. bölüm, localStorage maddesine ekle:** "Seviye testindeki ilerlemen (`baPlacement`: cevaplar, seçenek sırası, form taslağı) ve son gönderim zamanı (`baPlacementSent`). Bunlar gönderene kadar cihazından çıkmaz; gönderimden sonra ilerleme silinir."
3. **Yeni bölüm, "5a. Seviye testi":**

   > Seviye testini çözüp sonucunu gönderdiğinde şu bilgiler kaydedilir: adın, e-posta adresin, hedefin, varsa sınavının adı ve tarihi, daha önce ne kadar süre Almanca öğrendiğin, notun, test sonucun (tahmini seviye, bölümlere göre doğru sayısı, konu bazında hatalar, yanlış cevapladığın sorular ve cevapların), yazma görevine yazdığın metin, testin süresi ve gönderim tarihi.
   >
   > Bu bilgileri sadece ders planlaması ve seninle ilk ders için iletişim kurmak amacıyla kullanırım; yalnızca ben görebilirim.
   >
   > Veriler Google Firebase'de (Google Ireland Ltd. / Google LLC) işlenir: Cloud Firestore'da Frankfurt'taki (europe-west3) sunucularda saklanır. Gönderim için Firebase Authentication üzerinden anonim, geçici bir oturum açılır ve gönderimden hemen sonra kapatılır; bu sırada Google cihazının IP adresini ve tarayıcı bilgilerini işler ve bu işleme ABD'de de olabilir (AB-ABD Veri Gizliliği Çerçevesi ve standart sözleşme maddeleri). Firebase'in program dosyaları gstatic.com'dan yüklenir.
   >
   > Hukuki dayanak: senin talebin üzerine sözleşme öncesi adımlar (DSGVO md. 6/1-b) ve gönderirken verdiğin onay (md. 6/1-a).
   >
   > Saklama süresi: Sonuç gönderimden 6 ay sonra otomatik olarak silinir. Derslere başlarsak ilgili bilgiler öğrenci kaydına aktarılabilir; o zaman 10. bölüm geçerlidir.
   >
   > Kaydının daha önce silinmesini istediğinde bozkurtt.omerfaruk@gmail.com adresine yazman yeterli; onayını istediğin zaman geri alabilirsin.

4. **11. bölüme (Hakların) ekle:** "Seviye testi sonucunun silinmesini e-postayla isteyebilirsin."
5. **3. bölüm (GoatCounter):** Sayılan sayfalar listesine "seviye testi (/#seviye-testi)" eklenmeli. Yönetim sayfası sayılmıyor.
6. **6. bölüm (Firebase):** "Öğrenci verileri" ifadesi "öğrenci ve seviye testi verileri" olmalı.
