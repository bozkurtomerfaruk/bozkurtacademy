// Firebase web yapılandırması. Bu bilgiler gizli değildir; bütün koruma firestore.rules içindedir.
// Kurulum: Firebase Console → Proje ayarları → Genel → Web uygulaması (docs/kurulum.md).
export const firebaseConfig = {
  apiKey: 'AIzaSyBN6oFrR0SLTxQptw6iUHJNaqi47QxJYG8',
  authDomain: 'bozkurtacademy-8ab85.firebaseapp.com',
  projectId: 'bozkurtacademy-8ab85',
  storageBucket: 'bozkurtacademy-8ab85.firebasestorage.app',
  messagingSenderId: '8848854838',
  appId: '1:8848854838:web:cabdb6a1d62eae38e76d97'
};

// Öğretmenin Firebase UID'i. firestore.rules içindeki teacherUid() ile aynı olmalı.
// Buradaki değer sadece yönlendirme içindir; yetkiyi kurallar belirler.
export const TEACHER_UID = 'IoTwBV5HjRUaoLoj0SCI0VVGkfk2';

// Öğrencilerin veri silme talebi gönderebileceği adres (iletişim sayfasındakiyle aynı).
export const TEACHER_EMAIL = 'bozkurtt.omerfaruk@gmail.com';

// Firebase App Check (reCAPTCHA Enterprise): Google Cloud → Security → reCAPTCHA → Anahtar (web, puan tabanlı).
// Gizli değildir. Boşken App Check hiç başlatılmaz (bugünkü davranış). Kurulum ve zorunlu kılma: docs/app-check.md.
export const APPCHECK_SITE_KEY = '';

// Google Calendar (sadece öğretmen): Google Cloud → Google Auth Platform → İstemciler → Web uygulaması.
// Gizli anahtar (secret) gerekmez. Boşken canlı sitede Takvim bağlantısı kurulmaz, dersler yine Firestore'a kaydedilir.
// Schreiben yapay zekâ kontrolü (madde 7 Aşama B): Cloudflare Worker'ın adresi (https://….workers.dev, sonunda / yok).
// Boşken yapay zekâ kontrolü hiç çağrılmaz (Aşama A gibi sadece öğretmen geri bildirimi). Kurulum: docs/yapay-zeka-kurulum.md.
// Değiştirince scripts/csp.mjs'teki AI_WORKER_ORIGIN da aynı adres olmalı (node scripts/build-pages.mjs).
export const AI_WORKER_URL = '';

export const GOOGLE_CLIENT_ID = '8848854838-71mdsvir8jgidnqfnsl67ff357mgbdip.apps.googleusercontent.com';
