// Content-Security-Policy: scripts/build-pages.mjs bunu bütün sayfaların <head> bölümüne yazar (<!-- ba:security -->).
// Değiştirince: node scripts/build-pages.mjs  · Tarayıcı testi: npm run test:csp (tests/csp.mjs)
//
// GitHub Pages HTTP başlığı gönderemediği için Content-Security-Policy <meta http-equiv> ile verilir.
// Satır içi betik YOK ('unsafe-inline' script-src'de yok): tema başlatıcısı js/theme-init.js, eski hash yönlendirmesi
// js/legacy-hash.js. JSON-LD (<script type="application/ld+json">) çalıştırılmadığı için CSP'den etkilenmez.
// Yeni bir dış servis eklerken alan adını buraya, en dar biçimiyle ekle ve node scripts/build-pages.mjs çalıştır.
// <meta> ile verilemeyenler: frame-ancestors, report-uri/report-to, sandbox (yalnızca HTTP başlığıyla çalışır).
// Schreiben yapay zekâ Worker'ı (js/account/config.js → AI_WORKER_URL ile aynı köken). Boşken eklenmez.
export const AI_WORKER_ORIGIN = 'https://schreiben-kontrol.bozkurtt-omerfaruk.workers.dev';

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'",
    'https://www.gstatic.com/firebasejs/',          // Firebase modüler SDK (js/account/firebase.js)
    'https://apis.google.com',                       // Firebase Auth signInWithPopup: gapi iframe yükleyicisi
    'https://accounts.google.com/gsi/client',        // Google Identity Services, Takvim izni (js/account/calendar.js)
    'https://www.google.com/recaptcha/',             // App Check: reCAPTCHA Enterprise (APPCHECK_SITE_KEY doluyken)
    'https://www.gstatic.com/recaptcha/'],
  'connect-src': ["'self'",
    'https://firestore.googleapis.com',              // Firestore (SDK ve yorumların REST okuması)
    'https://identitytoolkit.googleapis.com',        // Firebase Auth
    'https://securetoken.googleapis.com',            // Firebase Auth belirteç yenileme
    'https://content-firebaseappcheck.googleapis.com', // App Check
    'https://www.googleapis.com',                    // Google Calendar API v3
    'https://accounts.google.com/gsi/',
    'https://www.google.com/recaptcha/',
    'https://api.web3forms.com',                     // iletişim formu ve yorum bildirimi
    'https://bozkurtacademy.goatcounter.com',        // GoatCounter sayacı (sendBeacon)
    ...(AI_WORKER_ORIGIN ? [AI_WORKER_ORIGIN] : []), // Schreiben yapay zekâ kontrolü (Cloudflare Worker)
    'http://127.0.0.1:8080', 'http://127.0.0.1:9099', 'http://127.0.0.1:8787'], // yalnızca yerel Firebase Emulator ve test Worker'ı (canlıda bağlanılmaz)
  'frame-src': ['https://accounts.google.com',
    'https://bozkurtacademy-8ab85.firebaseapp.com',  // Firebase Auth açılır pencere iframe'i (authDomain)
    'https://www.google.com/recaptcha/', 'https://recaptcha.google.com/recaptcha/'],
  'img-src': ["'self'", 'data:', 'https:'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://accounts.google.com/gsi/style'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'", 'https://api.web3forms.com'],
  'upgrade-insecure-requests': []
};
export const CSP = Object.entries(CSP_DIRECTIVES).map(([k, v]) => [k, ...v].join(' ')).join('; ');
