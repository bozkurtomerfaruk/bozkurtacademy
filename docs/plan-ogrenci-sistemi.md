# Plan: Öğrenci girişi, öğretmen paneli, ödevler, ders takvimi

Durum: **Onay bekliyor.** Bu dosya sadece plandır; henüz kod yazılmadı. Güncel durum ve bekleyen kararlar için `docs/durum.md` dosyasına bak.

Plan, repodaki mevcut koda göre hazırlandı:

- Site tek sayfa (`index.html`, hash yönlendirme).
- En iyi skor `localStorage`'da `baBestScore:…` anahtarıyla tutuluyor (`js/quiz.js:566`, `js/quiz.js:863`).
- `privacy.html` henüz yok, footer'daki gizlilik linki gizli. `docs/privacy-policy.md` bir kontrol listesi.

---

## 0. Senin karar vermen gereken 5 nokta

1. **Yaş hesabı:** Sadece doğum yılı sorulduğu için kesin yaş bilinemiyor. 2010 doğumlu biri 2026'da 15 ya da 16 yaşında olabilir. **Önerim:** güvenli tarafta kalalım; `bu yıl − doğum yılı ≤ 16` ise veli onayı isteyelim. Yani bu yıl 16'ya giren öğrenci de veli onayı ister.
2. **Haftalık tekrar:** **Önerim:** Google'da tek bir tekrarlayan etkinlik (en fazla 26 hafta ya da bir bitiş tarihine kadar), Firestore'da her ders ayrı bir belge. Böylece öğrenciye tek davet e-postası gider ve tek bir dersi ayrıca taşıyıp iptal edebilirsin. Diğer seçenek her dersi ayrı etkinlik yapmak; o zaman 12 haftalık plan öğrenciye 12 ayrı davet e-postası gönderir.
3. **Dil:** Yeni metinler mevcut i18n sistemine anahtar olarak eklenecek ve Türkçeleri eksiksiz olacak. **Önerim:** dil düğmesi çalışsın diye öğrenci sayfalarına (giriş, kayıt, öğrenci paneli) Almanca ve İngilizce çeviri de ekleyelim. Öğretmen paneli ve e-postalar yalnızca Türkçe olsun.
4. **privacy.html:** Öğrencilerden veri toplamaya başlamadan önce sitede bir gizlilik politikası yayında olmalı. **Önerim:** Aşama 1'de başında "hukuki kontrol ettirin" notu olan bir taslak `privacy.html` hazırlayıp footer linkini açalım; siteye koymadan önce kontrol ettir.
5. **Saklama süresi:** **Önerim:** veriler öğrenci derse son katıldıktan 12 ay sonra silinsin. Onaylanmayan kayıtlar 30 gün içinde silinsin. Gizlilik metni ve veli formu bu süreyi yazacak.

## 1. Baştan bilmen gereken teknik sınırlar

- **Skorlar tamamen doğrulanamaz.** Sunucu olmadığı için alıştırmalar tarayıcıda puanlanıyor. Kurallar şunları sağlar:
  - Sonuç sadece eklenebilir; düzenlenemez, silinemez.
  - Skor 0 ile toplam soru sayısı arasında olmalı.
  - Kayıt zamanını tarayıcı değil sunucu yazar.

  Yine de teknik bilgisi olan bir öğrenci tarayıcı konsolundan uydurma bir sonuç *ekleyebilir*. Bunu tamamen engellemek Cloud Functions, yani ücretli Blaze planı gerektirir. Her deneme ayrı kayıt olduğu için şüpheli kayıtlar panelde görünür.
- **Öğrencinin giriş hesabı panelden silinemez.** Admin SDK olmadan tarayıcıdan başka birinin Firebase giriş hesabı silinemez. Silme akışı şunu yapar:
  1. Öğrencinin bütün Firestore verisini ve Takvim etkinliklerini siler.
  2. Firebase Console → Authentication'da hesabı tek tıkla silebilmen için öğrencinin e-postasını ve UID'sini gösterir.

  Ayrıca `deleted/{uid}` adında, içinde kişisel veri olmayan bir işaret kalır. Böylece aynı hesap yeniden profil açamaz. İstemezsen bu işaret kaldırılabilir.
- **Bölge:** Firestore Frankfurt'ta (europe-west3) olur. Ama Firebase Authentication'da bölge seçilemez; e-posta ve şifre özeti AB dışında da işlenebilir. Google Calendar ve Gmail için de durum aynı. Bu yüzden öğrencinin adı giriş sistemine değil sadece Firestore'a yazılacak. Bu bilgi gizlilik metnine girecek.
- **Hatırlatma saati:** Apps Script'in günlük zamanlayıcısı tam 18:00'de değil, **18:00–19:00 arasında** bir anda çalışır. Bu Google'ın davranışı, değiştirilemez.
- **Silmeden sonra kalan kopyalar:** Gmail'in "Gönderilenler" klasöründeki e-postalar ve Takvim çöp kutusundaki etkinlikler (30 gün) yerinde kalır. Silme ekranı bunları elle temizlemen için hatırlatma gösterecek.
- **Google uyarısı:** Takvim izni verirken "Google bu uygulamayı doğrulamadı" uyarısı çıkacak. Uygulamayı sadece sen kullandığın için bu normal. İzin yaklaşık 1 saat geçerli, sonra tek tıkla yenilenir. Sadece bellekte tutulur, tarayıcıya kaydedilmez.
- **Geliştirme ortamında test edilemeyen kısımlar:** Gerçek Google Calendar, Meet ve Gmail bağlantısı geliştirme ortamından denenemez, çünkü öğretmen hesabı gerekir. Ekran görüntülerinde Takvim API'si yerine sahte bir modül kullanılacak. Kurulumdan sonra kendin deneyebilmen için bir kontrol listesi verilecek.

## 2. Firestore veri modeli

Öğrenciye ait her şey kendi belgesinin altında duracak. Böylece hem öğrencileri birbirinden ayırmak hem de silmek kolaylaşır.

**`users/{uid}`**

| Alan | Açıklama | Kim yazar |
|---|---|---|
| `name` (≤80), `email` | e-posta giriş hesabındakiyle aynı olmak zorunda | öğrenci kayıtta; sonra sadece öğretmen |
| `birthYear` | sonradan değiştirilemez | öğrenci, sadece kayıtta |
| `minor` | 16 yaş altı mı; kurallar doğum yılından yeniden hesaplar, tutmazsa kaydı reddeder | kayıtta |
| `provider` | `password` / `google.com`, giriş bilgisinden doğrulanır | kayıtta |
| `status` | `pending` / `active` / `inactive` | kayıtta `pending`; sonra sadece öğretmen |
| `parent {name, email}` | sadece 16 yaş altında, zorunlu | öğrenci kayıtta; sonra sadece öğretmen |
| `parentConsent {given, at, method: form/email, recordedAt}` | veli onayı bilgisi | **sadece öğretmen** |
| `inviteParent` | veli derse davet edilsin mi; 16 yaş altında varsayılan açık | sadece öğretmen |
| `createdAt`, `approvedAt` | kayıt ve onay tarihi | |

**Alt koleksiyonlar:**

- **`results/{auto}`** (Aşama 1): her deneme ayrı bir belge, sadece eklenebilir. İçinde seviye, konu, alıştırma, skor, toplam ve sunucunun yazdığı zaman olur. Deneme sayısı, en iyi skor ve son tarih panelde bu kayıtlardan hesaplanır.
- **`assignments/{id}`** (Aşama 2):
  - Öğretmenin yazdıkları: başlık, açıklama, teslim tarihi, seçilen alıştırmalar, Docs linki, "her öğrenciye kopya" ayarı, toplu ödev numarası.
  - Öğrencinin değiştirebildikleri: sadece "tamamladım", tamamlama tarihi ve kendi Docs linki. Bu link yalnızca `https://docs.google.com/…` adresi olabilir.
  - Ödev birden fazla öğrenciye verilince her öğrenciye ayrı bir kopya yazılır. Böylece öğrenci, aynı ödevi başka kimin aldığını bile göremez.
- **`resources/{id}`** (Aşama 2): başlık, `https://` ile başlayan link, not.
- **`lessons/{id}`** (Aşama 3): başlangıç zamanı, süre (varsayılan 50 dk), not, durum (planlandı / iptal), tekrar grubu, Takvim etkinlik kimliği, Meet linki, Takvim senkron durumu (`ok` / `failed`) ve öğrenci adının bir kopyası. Öğretmen takvimi bütün dersleri tek sorguyla okur.
- **`deleted/{uid}`:** sadece silinme tarihi.

## 3. Sayfalar

**`index.html`'de değişen sadece üç şey:**

- Menüye bir "Giriş / Panelim" bağlantısı.
- Küçük bir modül (`js/account/session.js`).
- `quiz.js`'de tek satırlık bir olay.

Ziyaretçiler için Firebase **hiç yüklenmez**. Sadece daha önce giriş yapılmışsa (`baAccount` ipucu) ya da giriş sayfalarında yüklenir. Böylece herkese açık sayfalar eskisi kadar hızlı kalır ve gizlilik açısından değişmez.

**Yeni sayfalar.** Hepsinde aynı header ve footer, `--ba-*` tasarım değerleri, koyu tema, dil düğmesi ve arama motorlarına kapalı (`noindex`) ayarı olacak.

| Sayfa | Ne yapar |
|---|---|
| `giris.html` | E-posta/şifre ya da Google ile giriş, şifremi unuttum. Girişten sonra öğretmen veya öğrenci paneline yönlendirir. |
| `kayit.html` | Ad, e-posta, şifre, doğum yılı. Doğum yılı girilince form değişir: 16 yaş ve üstüne "Google ile kayıt" seçeneği görünür. 16 yaş altında veli adı ve e-postası zorunlu olur, Google seçeneği gizlenir ve şu açıklama çıkar: "Hesabının açılması için velinin onayı gerekiyor. Öğretmenin velinle iletişime geçecek." Ayrıca "gizlilik politikasını okudum" kutusu var. |
| `panel.html` | Öğrenci paneli. Hesaba göre "onay bekleniyor", "veli onayı bekleniyor" ya da "hesap pasif" ekranı gösterir. Hesap aktifse: alıştırma geçmişi (A1), aktif ve tamamlanmış ödevler ile kaynaklar (A2), yaklaşan dersler (A3). |
| `ogretmen.html` | Sekmeler: Öğrenciler / Onay bekleyenler / Veli onayı bekleyenler (A1), Ödevler (A2), Takvim (A3). Mobilde sekmeler yana kayar, tablolar karta dönüşür. |
| `ogretmen-ogrenci.html?id=…` | Öğrenci detayı: onayla / pasif yap / sil, veli bilgileri ve "veli onayı alındı" işareti (tarih ve yöntem: form / e-posta), alıştırma tablosu (A1). Sonra ödevler ve kaynak ekleme (A2), dersler ve "veliyi davet et" ayarı (A3). |
| `privacy.html` | 0.4'teki karara bağlı. |

**Listeler nasıl ayrılır:**

- "Onay bekleyenler": durumu `pending` olan, ya 16 yaş ve üstü ya da veli onayı zaten alınmış öğrenciler.
- "Veli onayı bekleyenler": 16 yaş altında olup veli onayı henüz alınmamış öğrenciler.

**Kod düzeni:**

- JavaScript (`js/account/`, build yok): Firebase ayarı ve SDK, giriş, oturum, sonuç kaydı, öğretmen ve öğrenci ekranları; sonraki aşamalarda ödevler ve takvim.
- Firebase SDK, sabit bir sürümle gstatic'ten ES modül olarak yüklenir.
- Stil: `css/account.css`, sadece yerleşim içerir ve `--ba-*` değerlerini kullanır.

**Güvenlik notları:**

- Öğrencinin girdiği metinler her zaman düz metin olarak basılır, böylece sayfaya kod sokulamaz.
- Linkler sadece `https://` olabilir ve yeni sekmede güvenli şekilde açılır (`noopener noreferrer`).
- Sayfalardaki rol kontrolü sadece kullanım kolaylığı içindir. **Asıl koruma Firestore kurallarındadır.**

## 4. Güvenlik kuralları özeti

- Varsayılan olarak her şey kapalı.
- `isTeacher()`: giriş yapan kişinin UID'si kurallara sabit yazılmış öğretmen UID'siyse.
- `isActive()`: öğrencinin durumu `active` **ve** (16 yaş ve üstü **veya** veli onayı alınmış).

| Yol | Öğrenci | Öğretmen |
|---|---|---|
| `users/{uid}` | Sadece kendi UID'siyle oluşturabilir. Kurallar şunları kontrol eder: izin verilen alanlar, durum `pending`, veli onayı alanı yok, yaş bilgisi doğum yılıyla tutarlı, 16 yaş altıysa veli bilgisi zorunlu ve giriş yöntemi şifre, Google ile girdiyse 16 yaş ve üstü. Okuma: sadece kendi belgesi. Güncelleme ve silme: **yok**. | hepsi |
| `results` | Ekleme: kendi belgesine, sadece aktifken, alanlar doğrulanır, zaman sunucu saati. Okuma: kendi + aktif. Düzenleme ve silme: **yok**. | okuma, silme |
| `assignments` | Okuma: kendi + aktif. Güncelleme: sadece "tamamladım", tamamlama tarihi ve kendi Docs linki. | hepsi |
| `resources`, `lessons` | Okuma: kendi + aktif | hepsi |
| `deleted` | erişim yok | oluşturma, okuma |

Doğum yılı aralığı ve metin uzunlukları da kurallarda kontrol edilir.

**Bir istisna:** Onaysız kullanıcı sadece **kendi profil belgesini** okuyabilir, çünkü "onay bekleniyor" ekranını gösterebilmek için durumunu bilmek gerekiyor. Bu belgede sadece kendi girdiği bilgiler ve hesap durumu var.

**Testler:**

- Dosya `tests/firestore.rules.test.mjs`; `@firebase/rules-unit-testing` ve Node'un yerleşik test aracı kullanılır, `npm test` ile Firebase Emulator'da çalışır.
- `package.json` sadece test içindir, sitenin kendisine build adımı eklemez. `node_modules` git'e girmez.
- Ayrıca her PR'da kuralları otomatik test eden bir GitHub Actions iş akışı önerilir.

**Test senaryoları:**

- Başka öğrencinin verisini okuyamamak.
- Kendini aktif yapamamak, veli onayını kendisi yazamamak, doğum yılını değiştirememek.
- 16 yaş altıyken kendini 16 yaş üstü diye kaydedememek; 16 yaş altının Google ile kayıt olamaması; veli bilgisinin zorunlu olması.
- **Öğretmenin onayladığı ama veli onayı eksik 16 yaş altı öğrenci hiçbir şey okuyamaz ve sonuç yazamaz;** iki koşul birden sağlanınca okuyabilir.
- Sonucu düzenleyememek ve silememek; ödevin başlığını veya teslim tarihini değiştirememek.
- Pasif öğrencinin hiçbir şey okuyamaması; silinmiş UID'nin yeniden profil açamaması; öğretmenin her şeyi yapabilmesi.

## 5. Önemli akışlar

- **Sonuç kaydı:** `js/quiz.js:1007` dil değişince `showResult()`'u yeniden çağırıyor. Kayıt oraya bağlanırsa dil değiştirmek aynı sonucu iki kez kaydeder. Bu yüzden olay sadece son soru gerçekten bitince (`nextQuestion`, `js/quiz.js:828`) tetiklenecek.
  - Giriş yapmış ve aktif öğrencide sonuç Firestore'a eklenir ve ekranda "Sonucun kaydedildi" notu görünür.
  - Giriş yapmamış ziyaretçide hiçbir şey değişmez; localStorage'daki en iyi skor eskisi gibi çalışır.
- **Google Docs kopya linki:** `docs.google.com/(document|spreadsheets|presentation)/d/ID/...` biçimindeki link `/d/ID/copy` biçimine çevrilir. Tanınmayan bir linkte uyarı çıkar. Google Drive API kullanılmaz.
- **Silme ve veli onayını geri alma** aynı akışı kullanır:
  1. Gelecek dersler Takvim'de iptal edilir; öğrenci ve veli iptal bildirimi alır.
  2. Geçmiş etkinlikler bildirim göndermeden silinir.
  3. Bütün alt koleksiyonlar ve profil belgesi silinir.
  4. `deleted/{uid}` işareti yazılır.
  5. Giriş hesabını Firebase Console'dan silmen için talimat gösterilir.
- **Pasif yapma:** öğrenci hiçbir şey göremez; veriler durur ve öğrenci tekrar aktif edilebilir.

## 6. Aşama 3 ayrıntıları (Takvim ve Meet)

**Bağlantı:** Google Identity Services (token client) ile izin alınır; sadece `calendar.events` izni istenir. Takvim API'sine doğrudan tarayıcıdan, öğretmenin ana takvimine bağlanılır. Öğrencilerden Takvim izni istenmez.

**Ders oluşturulunca Takvim'deki etkinlik:**

- Başlık "Almanca dersi – Ad", saat dilimi Europe/Berlin.
- Davetliler: öğrenci, 16 yaş altıysa ve ayar açıksa veli de. Davet ve güncellemeleri Google gönderir (`sendUpdates=all`).
- Otomatik Meet linki (`conferenceData`).
- Öğretmenin hatırlatmaları: 1 gün önce e-posta, 30 dakika önce bildirim.
- Siteden oluşturulduğunu gösteren gizli işaret (`extendedProperties.private.source=bozkurtacademy`), ders numarası ve öğrencinin e-postası. Öğrenci e-postası, Apps Script'in öğrenciyi veliden ayırabilmesi için gerekli.

**Takvim'e bağlanılamazsa:**

1. Ders önce Firestore'a "bekliyor" durumuyla kaydedilir, sonra Takvim'e gönderilir.
2. Hata olursa ders yine kayıtlı kalır, "Google Calendar'a eklenemedi, tekrar dene" uyarısı çıkar ve ders kartında "Tekrar dene" düğmesi görünür.
3. Taşıma ve iptal de aynı şekilde çalışır.

**Takvim görünümü:** Kütüphane kullanmadan yazılmış hafif bir bileşen.

- Bilgisayarda: saat çizelgeli haftalık görünüm ve aylık görünüm.
- 390px telefonda: haftalık görünüm gün gün liste olur; aylık görünüm küçük bir ızgara ve altında seçili günün listesi olur.
- Her ders kartında öğrenci adı, saat, süre, Takvim durum rozeti ve "Görüşmeye katıl" düğmesi (Meet linkini yeni sekmede açar).

**Saat dilimi:** Dersler tek bir zaman anı olarak kaydedilir.

- Öğretmen Berlin saatiyle girer.
- Öğrenci dersi kendi saatiyle görür; saat dilimi farklıysa yanında "(Berlin 18:00)" da yazar.

**Öğrenci tarafı:** "Görüşmeye katıl" düğmesi ders başlamadan 10 dakika önce vurgulu hale gelir ve ders bitene kadar öyle kalır. Daha önce soluk görünür ama tıklanabilir.

**Veli davet ayarı:** Ayar değiştirildiğinde gelecek derslere de uygulama seçeneği çıkar.

## 7. Aşama 4 ayrıntıları (Apps Script)

**Dosyalar:** `apps-script/Code.gs`, `apps-script/appsscript.json` (saat dilimi Europe/Berlin, gelişmiş Calendar hizmeti, en dar izinler) ve kurulum için README.

**Çalışma şekli:**

- `installTrigger()` her gün Berlin saatiyle 18:00'de çalışan zamanlayıcıyı kurar.
- Arama sadece gizli işareti `source=bozkurtacademy` olan etkinlikleri getirir. Kişisel etkinlikler aramaya hiç girmez.
- Ertesi günün etkinliklerine bakar. İptal edilmiş dersler, daveti reddeden davetliler ve düzenleyen (öğretmen) atlanır.

**Aynı kişiye iki kez göndermeme:**

- Gönderilen her e-posta, etkinlik kimliği + ders saati + e-posta adresinin şifreli özeti (SHA-256) olarak kaydedilir. E-posta adresi düz metin olarak tutulmaz.
- 14 günden eski kayıtlar temizlenir.
- Ders taşınırsa yeni saat için yeni hatırlatma gider.

**E-posta içeriği:**

- Konu: "Yarınki Almanca dersin – 18:00".
- Gövde: tarih, saat, süre, Meet linki, varsa ders notu. Script öğrencinin saat dilimini bilemediği için saat "Almanya saati" olarak yazılır.
- Veliye aynı konuyla, "Öğrenciniz X'in yarınki dersi…" diye başlayan bir metin gider.
- E-postalar MailApp ile gönderilir. Kişisel Gmail'de günde 100 alıcı sınırı var, öğrenci sayısı için yeterli.

**Test:** Seçme, tekrar önleme ve e-posta metni kısımları Node ile birim testinden geçer. `dryRun()` fonksiyonu e-posta göndermeden kime ne gideceğini günlüğe yazar.

## 8. Aşamalar (her biri ayrı PR)

| Aşama | İçerik |
|---|---|
| **1** | Firebase ayarı; `firestore.rules`, `firestore.indexes.json`, `firebase.json`; testler ve `package.json`; giriş, kayıt ve 16 yaş altı mantığı; onay ve veli onayı; `docs/veli-onay-formu.md` (Türkçe + Almanca, başında taslak notu); sonuç kaydı; öğretmen öğrenci listesi ve öğrenci detayı; öğrenci panelinde onay ekranları ve alıştırma geçmişi; `docs/kurulum.md`; gizlilik kontrol listesi güncellemesi |
| **2** | Ödev oluşturma (`catalog.json`'dan seviye → konu → alıştırma seçimi, birden fazla öğrenci seçimi, Docs kopya linki); öğrencinin "tamamladım" işareti ve kendi linki; kaynaklar |
| **3** | Takvim (haftalık/aylık), ders oluşturma, taşıma, iptal, haftalık tekrar; Takvim etkinliği ve Meet linki; senkron hatası ve "Tekrar dene"; veli davet ayarı; öğrencinin yaklaşan dersleri |
| **4** | Apps Script, zamanlayıcı kurulumu, birim testleri, README |

**Her aşamanın sonunda:**

- Kural testleri emülatörde geçer.
- Ekran görüntüleri: öğrenci ve öğretmen akışları, 390px ve 1440px, açık ve koyu tema. Playwright, Firebase emülatörü ve örnek verilerle çekilir. Emülatöre bağlanma sadece localhost'ta çalışır.
- `node scripts/check-grammar.mjs` geçer.
- Giriş yapmadan dersler ve alıştırmalar eskisi gibi açılıyor mu, kontrol edilir.
- PR açılır, **"birleştir" denmeden birleştirilmez**; bir sonraki aşamaya geçmeden önce durulur ve onay beklenir.
- Kısa bir özet `docs/durum.md` dosyasına yazılır.

## 9. Senin yapacakların

### A. Firebase (Aşama 1 PR'ından önce; kod emülatörde ayarlar olmadan geliştirilebilir)

1. console.firebase.google.com → **Proje ekle** → ad: `bozkurtacademy` → Google Analytics'i **kapat**. Plan **Spark (ücretsiz)** kalsın.
2. **Build → Authentication → Başlayın → Sign-in method:**
   - **E-posta/Şifre**'yi aç ("E-posta bağlantısı" kapalı kalsın).
   - **Google**'ı aç ve destek e-postanı seç.
3. **Authentication → Ayarlar:**
   - **Yetkili alan adları**'na `bozkurtacademy.com` ekle (www kullanıyorsan `www.bozkurtacademy.com` da).
   - **Kullanıcı işlemleri**'nde "E-posta numaralandırma koruması" açık kalsın.
   - **Templates** dilini Türkçe yap.
4. **Build → Firestore Database → Veritabanı oluştur:**
   - Konum: **europe-west3 (Frankfurt)**. ⚠️ Bu sonradan değiştirilemez.
   - **Üretim modunda başlat** seç.
5. **Proje ayarları (dişli) → Genel → Uygulamalarınız → Web (`</>`):**
   - Takma ad: `site`. Hosting kutusunu **işaretleme**.
   - Çıkan `firebaseConfig` nesnesini gönder. Bu bilgiler gizli değil.
6. **UID'ini bulma:** Aşama 1 yayına girince `bozkurtacademy.com/giris.html`'de Google ile bir kez giriş yap. Sonra **Authentication → Users**'ta kendi satırındaki **Kullanıcı UID'si** değerini kopyalayıp gönder. UID gizli bilgi değil; güvenlik onun gizli kalmasına dayanmıyor. Kurallar dosyası repoda herkese açık zaten.
7. **Kuralları yayınlama:**
   - **Firestore → Kurallar** sekmesine repodaki `firestore.rules` dosyasının içeriğini yapıştır → **Yayınla**.
   - Takvim sorgusu ilk kez çalıştığında hata mesajında bir "dizin oluştur" bağlantısı çıkar; ona tıklaman yeterli.

### B. Google Cloud (Aşama 3'ten önce)

1. console.cloud.google.com → üstten Firebase'in oluşturduğu **aynı projeyi** seç.
2. **API'ler ve Hizmetler → Kitaplık** → "Google Calendar API" → **Etkinleştir**.
3. **Google Auth Platform → Başlayın:**
   - Uygulama adı: "Bozkurt Academy Panel".
   - Destek e-postası.
   - Kitle: **Harici**.
   - İletişim e-postası.
4. **Veri erişimi → Kapsam ekle:** `https://www.googleapis.com/auth/calendar.events`.
5. **Kitle → Test kullanıcıları:** kendi Google hesabını ekle. Yayın durumu **Test** kalsın.
6. **İstemciler → İstemci oluştur → Web uygulaması:**
   - **Yetkili JavaScript kaynakları:** `https://bozkurtacademy.com` (www kullanıyorsan onu da ekle).
   - Oluştur → **İstemci kimliğini** (`…apps.googleusercontent.com`) gönder.
   - İstemci gizli anahtarı (secret) **gerekmez, gönderme.**

### C. Apps Script (Aşama 4 birleştikten sonra)

1. script.google.com → **Yeni proje** → ad: "Ders hatırlatmaları".
2. **Proje ayarları:**
   - "appsscript.json dosyasını göster" kutusunu işaretle.
   - Saat dilimi: **Berlin**.
3. `Code.gs` ve `appsscript.json` içeriklerini repodakilerle değiştir.
4. **Hizmetler (+)** → **Google Calendar API** ekle.
5. Üstten `dryRun` seç → **Çalıştır** → izinleri onayla ("Gelişmiş → … sayfasına git"; kendi betiğin olduğu için güvenli) → günlükte kime e-posta gideceğine bak.
6. `installTrigger`'ı **bir kez** çalıştır → **Tetikleyiciler** sayfasında günlük zamanlayıcının oluştuğunu kontrol et.
7. **Deneme:** yarın için ikinci e-posta adresinle bir test dersi oluştur, `sendReminders`'ı elle çalıştır ve e-postanın geldiğini kontrol et.

## 10. Gizlilik metninde güncellenecek noktalar

- **Firebase Authentication ve Firestore:**
  - Sağlayıcı Google.
  - Firestore verisi Frankfurt'ta saklanır.
  - Giriş hesapları AB dışında da işlenebilir; dayanak olarak standart sözleşme maddeleri ve AB-ABD Veri Gizliliği Çerçevesi yazılır.
  - Firebase oturum bilgisini tarayıcıda tutar (IndexedDB); bu teknik olarak gerekli.
- **Google ile giriş:**
  - Sadece 16 yaş ve üstü öğrenciler için.
  - Google'dan ad, e-posta ve profil fotoğrafı adresi gelir; bunlar Firebase giriş sisteminde kalır.
  - Site Firestore'a sadece adı ve e-postayı yazar.
- **Saklanan veriler:**
  - Ad, e-posta, doğum yılı, alıştırma sonuçları, ödev durumu ve ödeve eklenen linkler, ders bilgileri.
  - 16 yaş altı için ayrıca veli adı ve e-postası, veli onayının tarihi ve yöntemi.
  - Yeni localStorage anahtarı: `baAccount`.
- **Saklama süresi:** 0.5'teki karara göre.
- **Silme hakkı:**
  - Silme e-posta ile istenir; neyin silindiği yazılır.
  - Gmail ve Takvim'de kalan kopyalar ve bunların silinme süresi de belirtilir.
- **Google Calendar ve Meet:**
  - Ders daveti için ad, e-posta ve ders zamanı Google'a iletilir.
  - Görüşmede Meet'in kendi koşulları geçerlidir.
- **Davetler:** Öğrencinin, 16 yaş altıysa velinin de e-postası davet için Google'a iletilir; davet ve güncelleme e-postalarını Google gönderir.
- **Hatırlatma e-postaları:**
  - Öğretmenin Google hesabında çalışan Apps Script üzerinden Gmail ile gönderilir.
  - Tekrar gönderimi önlemek için e-posta adresinin şifreli özeti 14 gün saklanır.
- **16 yaş altı öğrenciler:**
  - DSGVO Madde 8'e göre Almanya'da sınır 16 yaştır.
  - Veli onayı site dışında, imzalı form ya da e-posta ile alınır; imzalı formun nerede saklandığı belirtilmeli.
  - Veli bilgileri saklanır.
  - Onay geri alınabilir; geri alınırsa bütün veriler silinir.
