# Firebase App Check (reCAPTCHA Enterprise)

App Check, Firestore ve Authentication isteklerinin **bu siteden, gerçek bir tarayıcıdan** geldiğini doğrular.
Kod hazır: `js/account/firebase.js` App Check'i başlatır, `js/comments.js` onaylı yorumları okuyan REST isteğine
`X-Firebase-AppCheck` başlığını ekler, `scripts/placement-cleanup.mjs` (GitHub Actions) hata ayıklama belirteciyle çalışır.
`js/account/config.js` içindeki `APPCHECK_SITE_KEY` **boşken App Check hiç başlatılmaz**; site bugünkü gibi çalışır.

## Neden gerekli? (anonim oturum ve hız sınırı)

Yorum (`comments` + `commentLimits/{uid}`) ve seviye testi (`placementTests` + `placementLimits/{uid}`) gönderimindeki
bekleme süresi **UID başına** uygulanır. Ziyaretçi anonim oturum açtığı için bir bot her gönderimde yeni bir anonim
hesap açarak (yeni UID) bu sınırı aşabilir. Kurallar bunu tek başına engelleyemez. App Check bu istekleri gerçek
tarayıcı + reCAPTCHA puanıyla sınırlar; yorum formundaki gizli alan (honeypot) ve 3 saniyelik süre tuzağı basit
botlara karşı ek önlemdir. Bunlar birlikte bile kesin bir sınır değildir: Authentication → Ayarlar → **Kullanıcı
hesabı oluşturma kotası** (IP başına saatlik yeni hesap) da düşük tutulmalı.

## Kurulum adımları (sırayla)

1. **Google Cloud Console → Security → reCAPTCHA** (proje: `bozkurtacademy-8ab85`): *Anahtar oluştur*.
   - Platform: **Web sitesi**, alan adları: `bozkurtacademy.com` (yerel geliştirme için `localhost` ekleme; yerelde
     hata ayıklama belirteci kullanılır).
   - "Onay kutusu kullan" (checkbox) **kapalı** kalsın: puan tabanlı (score-based) anahtar.
   - reCAPTCHA Enterprise API'si etkin değilse konsol etkinleştirmeyi önerir; kabul et.
2. **Firebase Console → App Check → Uygulamalar** → web uygulaması → **reCAPTCHA Enterprise** sağlayıcısı:
   1. adımdaki site anahtarını gir, belirteç ömrünü varsayılan (1 saat) bırak, kaydet.
3. `js/account/config.js` → `APPCHECK_SITE_KEY = '<site anahtarı>'` yaz, commit et ve yayımla.
   (Site anahtarı gizli değildir.)
4. **İzleme dönemi (en az 1–2 gün):** Firebase Console → App Check → **API'ler** sekmesinde Cloud Firestore ve
   Authentication için "Doğrulanmış istekler" oranına bak. Henüz **Zorunlu kıl**'a basma. Doğrulanmamış isteklerin
   büyük kısmı eski sekmelerden / önbellekten geliyorsa birkaç gün bekle.
5. **Hata ayıklama belirteçleri** (Firebase Console → App Check → Uygulamalar → ⋮ → *Hata ayıklama belirteçlerini yönet*):
   - **Temizlik işi için:** bir belirteç oluştur (ad: `github-placement-cleanup`), değerini GitHub → Settings →
     Secrets and variables → Actions → **`APPCHECK_DEBUG_TOKEN`** olarak kaydet. Bu yapılmazsa Firestore zorunlu
     kılındığında günlük silme işi 401/403 ile başarısız olur.
   - **Yerel geliştirme için (isteğe bağlı):** `localhost`'ta site ilk açıldığında tarayıcı konsolu
     "App Check debug token: …" yazar; o değeri buraya ekle. Ya da kendi belirtecini
     `localStorage.baAppCheckDebugToken = '…'` ile ver. Emülatör (`?emulator=1`) App Check'i zorunlu kılmaz.
6. **Zorunlu kıl:** App Check → API'ler → **Cloud Firestore → Zorunlu kıl**, ardından **Authentication → Zorunlu kıl**.
   Etki birkaç dakika içinde başlar. Sonra şunları elle dene:
   - bir gramer dersinde onaylı yorumlar görünüyor ve yeni yorum gönderilebiliyor,
   - seviye testi gönderilebiliyor,
   - giriş (e-posta ve Google), öğrenci paneli, öğretmen sayfaları ve /yonetim/yorumlar/ çalışıyor,
   - GitHub → Actions → "Seviye testi otomatik silme" → *Run workflow* başarılı.
7. Bir sorun olursa aynı ekrandan **Zorunluluğu kaldır**: site hemen eski hâline döner (kod değişikliği gerekmez).

## Notlar

- CSP (`scripts/csp.mjs`) App Check için gereken adresleri zaten içerir: `www.google.com/recaptcha/`,
  `www.gstatic.com/recaptcha/`, `recaptcha.google.com/recaptcha/` (iframe) ve `content-firebaseappcheck.googleapis.com`.
- App Check, Web3Forms (iletişim formu ve yorum bildirimi) ve Google Calendar API isteklerini kapsamaz.
- Firebase SDK sürümünü değiştirirken `firebase-app-check.js` adresini de güncelle (`js/account/firebase.js`).
- Tarayıcı testi: `npm run test:csp` (sahte bir site anahtarıyla App Check'in CSP altında yüklendiğini ve REST
  okumasına başlık eklendiğini, anahtar boşken hiç yüklenmediğini doğrular).
