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
export const TEACHER_UID = 'OGRETMEN_UID_BURAYA';

// Öğrencilerin veri silme talebi gönderebileceği adres (iletişim sayfasındakiyle aynı).
export const TEACHER_EMAIL = 'bozkurtt.omerfaruk@gmail.com';
