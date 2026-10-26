# Öğrenci sistemi: kurulum ve geliştirme

Plan: `docs/plan-ogrenci-sistemi.md`. Güncel durum: `docs/durum.md`.

## Canlıya alma (Aşama 1)

Firebase projesi (`bozkurtacademy-8ab85`) hazır ve `js/account/config.js` içinde yapılandırması var. Geriye iki adım kaldı.

### 1. Öğretmen UID'ini bulma ve yazma

1. PR birleşip site yayına girince `https://bozkurtacademy.com/giris.html` adresine git ve **Google ile giriş yap**. (Menüdeki "Giriş" linki sessiz yayın için gizli; sayfa adresle açılıyor.)
2. Henüz öğretmen olarak tanınmadığın için "Bu hesapla tamamlanmış bir kayıt yok" mesajı ve altında **UID** görünür. Kayıt formunu doldurma.
   - Aynı değer Firebase Console → Authentication → Users → "Kullanıcı UID'si" sütununda da var.
3. UID iki dosyaya yazıldı (öğretmen UID'i: `IoTwBV5HjRUaoLoj0SCI0VVGkfk2`). Değişirse ikisini birlikte güncelle:
   - `firestore.rules` → `teacherUid()`
   - `js/account/config.js` → `TEACHER_UID`

UID gizli bilgi değildir; güvenlik onun gizli kalmasına dayanmaz.

### 2. Güvenlik kurallarını yayınlama

Firestore "üretim modunda" oluşturulduğu için kurallar yayınlanana kadar her şey kapalıdır: kayıt ve giriş sonrası ekranlar çalışmaz.

1. Firebase Console → Firestore Database → **Kurallar** sekmesi.
2. Repodaki `firestore.rules` dosyasının **tamamını** yapıştır (UID yazılmış hâliyle) → **Yayınla**.
3. Kurallar her değiştiğinde bu adımı tekrarla.

İstersen bunun yerine Firebase CLI ile: `npx firebase deploy --only firestore --project bozkurtacademy-8ab85`.

### Google Calendar (Aşama 3)

1. Planın 9.B adımlarını yap (Calendar API, OAuth izin ekranı, test kullanıcısı, Web istemcisi; yetkili JavaScript kaynağı `https://bozkurtacademy.com`).
2. İstemci kimliğini (`…apps.googleusercontent.com`) `js/account/config.js` → `GOOGLE_CLIENT_ID` alanına yaz. Gizli anahtar gerekmez.
3. `ogretmen-takvim.html` → **Google Calendar'a bağlan**. İzin yaklaşık 1 saat geçerli, sadece bellekte tutulur; süresi dolunca bir sonraki işlemde yeniden sorulur. "Google bu uygulamayı doğrulamadı" uyarısı test modunda normaldir.
4. İlk test: kendine (ikinci e-posta adresinle kayıtlı test öğrencisine) yarın için bir ders planla. Kontrol et:
   - Takviminde "Almanca dersi – Ad" etkinliği ve Meet linki var;
   - öğrenci adresine davet geldi;
   - sana 1 gün önce e-posta, 30 dakika önce bildirim hatırlatması kurulu;
   - dersi taşıyınca ve iptal edince öğrenciye güncelleme gidiyor.
5. Yerel geliştirmede (`?emulator=1`) gerçek Google yerine sahte takvim (`js/account/calendar-mock.js`) kullanılır; canlıda asla yüklenmez.

### Öğrenci ve veli hatırlatma e-postaları (Aşama 4)

Google Apps Script ile, senin Google hesabında: adım adım kurulum `apps-script/README.md`'de. Kısaca: script.google.com → yeni proje → `Code.gs` ve `appsscript.json`'ı yapıştır → Google Calendar API hizmetini ekle → `dryRun` → `installTrigger`.

### Seviye testi

Ayrıntılar ve adım adım kurulum: `docs/seviye-testi.md`. Kısaca:
1. Authentication → Sign-in method → **Anonim**'i aç.
2. `firestore.rules`'u yayınla.
3. `placementTests` koleksiyonunda `expireAt` alanı için TTL politikası oluştur.

Yönetim sayfası: `https://bozkurtacademy.com/#yonetim/seviye-testleri`. Önce `giris.html`'den öğretmen hesabıyla giriş yap. Testler: `npm run test:placement` (emülatörde).

### Kurallar her değiştiğinde

`firestore.rules` değişen her birleştirmeden sonra (ör. Aşama 2: öğrencinin ödevi "tamamladım" olarak işaretleyebilmesi) dosyanın güncel hâlini Firebase Console → Firestore → Kurallar'a yapıştırıp **Yayınla**. Yayınlanmazsa yeni özellikler canlıda "izin yok" hatası verir.

### 3. Canlıda kontrol listesi

- [ ] `giris.html`'de Google ile giriş yapınca öğretmen paneline (`ogretmen.html`) gidiyorsun.
- [ ] İkinci bir e-posta adresinle `kayit.html`'den kayıt ol (16 yaş ve üstü): "Onay bekleniyor" ekranı çıkıyor, öğretmen panelinde "Onay bekleyenler"de görünüyor.
- [ ] Onayladıktan sonra öğrenci hesabıyla bir alıştırma çöz: sonuç ekranında "Sonucun paneline kaydedildi" notu çıkıyor, öğrenci panelinde ve öğrenci detayında görünüyor.
- [ ] 16 yaş altı (ör. doğum yılı 2012) bir test kaydı: veli alanları zorunlu, Google seçeneği yok, "Veli onayı bekleyenler"de görünüyor; sadece öğretmen onayıyla hesap açılmıyor, veli onayı işaretlenince açılıyor.
- [ ] Test kayıtlarını öğrenci sayfasındaki "Öğrenciyi ve bütün verilerini sil" ile sil, sonra Firebase Console → Authentication'dan giriş hesaplarını da sil.
- [ ] Şifre sıfırlama e-postası geliyor (Authentication → Templates dilinin Türkçe olduğunu kontrol et).
- [ ] E-posta ile kayıtta doğrulama e-postası geliyor; bağlantıya tıklayıp öğrenci panelini yenileyince doğrulama kartı kayboluyor ve öğretmen panelinde "E-posta doğrulandı" görünüyor.

### Sessiz yayından çıkış

Gizlilik metni kesinleşince: `index.html`'de `id="navAccount"` bağlantısındaki `hidden` özelliğini kaldır, `privacy.html`'deki "kontrol edilmektedir" notunu ve `noindex` etiketini sil.

## Yerel geliştirme

Site build gerektirmez. `package.json` sadece Firestore kural testleri ve yerel emülatör içindir (Java gerekir).

```bash
npm install
npm test                 # Firestore kural testleri (emülatörde)
npm run emulators        # Auth + Firestore emülatörü (127.0.0.1:9099 ve :8080)
python3 -m http.server 5500
```

Tarayıcıda `http://localhost:5500/giris.html?emulator=1` aç. `?emulator=1` ayarı tarayıcıda hatırlanır, `?emulator=0` kapatır. Emülatör bağlantısı sadece `localhost` ve `127.0.0.1`'de çalışır, canlı sitede hiçbir zaman.

Emülatörde öğretmen hesabı (UID'i kurallardaki değerle aynı olmalı):

```bash
curl -X POST -H 'Authorization: Bearer owner' -H 'Content-Type: application/json' \
  http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/demo-bozkurtacademy/accounts \
  -d '{"localId":"IoTwBV5HjRUaoLoj0SCI0VVGkfk2","email":"ogretmen@example.com","password":"ogretmen123"}'
```

## Dosyalar

| Dosya | Görevi |
|---|---|
| `firestore.rules` | Bütün yetki kuralları (öğretmen UID'i burada) |
| `tests/firestore.rules.test.mjs` | Kural testleri |
| `js/account/config.js` | Firebase yapılandırması, öğretmen UID'i |
| `js/account/firebase.js` | SDK'yı CDN'den (gstatic, sabit sürüm) yükler, emülatör bağlantısı |
| `js/account/session.js` | `index.html`: menüdeki Giriş/Panelim bağlantısı, alıştırma sonucu kaydı |
| `js/account/login.js`, `register.js`, `student.js` | Giriş, kayıt, öğrenci paneli |
| `js/account/teacher.js`, `teacher-student.js`, `teacher-common.js` | Öğretmen paneli (öğrenciler, ödevler), öğrenci detayı (ödevler, kaynaklar) |
| `js/account/teacher-assign.js` | `ogretmen-odev.html`: yeni ödev |
| `js/account/teacher-calendar.js` | `ogretmen-takvim.html`: haftalık/aylık takvim, yeni ders, taşıma, iptal, tekrar dene |
| `js/account/lessons.js` | Dersler: önce Firestore, sonra Google Calendar; başarısız işlemler ve yeniden deneme |
| `js/account/calendar.js` | Google Identity Services (token client) ve Calendar API v3 |
| `js/account/calendar-mock.js` | Sadece yerel emülatörde: sahte Google Calendar |
| `apps-script/Code.gs`, `apps-script/appsscript.json` | Öğrenci ve veli hatırlatma e-postaları (Apps Script, öğretmenin hesabında) |
| `tests/apps-script.test.mjs` | Apps Script birim testleri (sahte Google servisleriyle) |
| `js/account/i18n.js` | Öğrenci sayfalarının TR/DE/EN metinleri |
| `css/account.css` | Bu sayfaların yerleşimi |
| `js/placement.js`, `css/placement.css` | Seviye testi (`#seviye-testi`) ve yönetim sayfasının yönlendirmesi |
| `js/account/placement-submit.js`, `js/account/placement-admin.js` | Seviye testi sonucunu gönderme, yönetim sayfası (`#yonetim/seviye-testleri`) |
| `data/seviye-testi/sorular.json` | Seviye testi soru bankası |
| `tests/seviye-testi/placement.mjs` | Seviye testi tarayıcı testleri (`npm run test:placement`) |
