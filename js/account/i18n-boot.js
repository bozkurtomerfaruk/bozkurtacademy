// Giriş, kayıt ve öğrenci paneli metinlerini Firebase'den bağımsız yükler.
// Sayfanın ana modülü (login.js, register.js, student.js) Firebase'i içe aktarır; Firebase yüklenemezse
// (reklam engelleyici, kötü bağlantı) o modül hiç çalışmaz ve sayfa seçilen dil yerine Türkçe kalırdı.
// Bu modül sadece i18n.js'i yükler. Modüller DOMContentLoaded'dan önce çalışır; js/app.js metinleri
// DOMContentLoaded'da uygular. Geç kalırsa (sayfa hazırsa) dili burada yeniden uygular.
import { registerStrings } from './i18n.js';

registerStrings();
if (document.readyState !== 'loading') {
  const BA = window.BA;
  BA?.applyLanguage?.(BA.uiLang ?? BA.lang);
}
