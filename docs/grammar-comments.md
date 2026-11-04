# Gramer yorumlarının yönetimi

Öğrenci, ders sayfasının altındaki formdan ad, e-posta ve yorum gönderir (`js/a1-lessons.js` → `js/comments.js`).

1. **Kayıt:** Firebase SDK'sı yalnızca gönderimde yüklenir. Anonim, geçici bir oturumla Firestore'daki `comments`
   koleksiyonuna şu alanlar yazılır: `lesson` (ör. `A1/artikel`), `name`, `comment`, `status: "pending"`,
   `createdAt` (sunucu saati). Aynı batch'te `commentLimits/{uid}` yazılır: aynı oturumdan dakikada en fazla bir yorum.
   **E-posta adresi Firestore'a yazılmaz.**
2. **Bildirim:** Kayıttan sonra Web3Forms öğretmene e-posta gönderir. E-postada ad, e-posta (yanıtla adresi), yorum,
   `ders`, `ders_linki`, `onay_paneli` (`https://bozkurtacademy.com/yonetim/yorumlar/`) ve `kayit_no` (Firestore belge kimliği)
   alanları bulunur. E-postada `kayit_no` varsa yorum Firestore'a yazılmıştır.
   Bildirim gönderilemezse yorum yine kayıtlıdır ve panelde görünür.
3. **Onay:** Öğretmen panelinde (`ogretmen.html#yorumlar`) **Yorumlar** sekmesi veya `/yonetim/yorumlar/` sayfası.
   İkisi aynı onay ekranını kullanır (`js/account/comments-moderation.js`). Sekmedeki ve sayfanın üstündeki sayı onay bekleyen
   yorumlardır. Her yorum için: Onayla, Cevap yaz / Cevabı düzenle, Sil. Yayındaki yorumlar için: Yayından kaldır (bekleyene döner).
4. **Gösterim:** Ders sayfası, ziyaretçi yorum bölümüne yaklaşınca (IntersectionObserver, 600 px önce) Firestore REST API ile
   `lesson == anahtar` ve `status == "approved"` olan yorumları okur. SDK yüklenmez. Ad, tarih, yorum ve cevap `textContent`
   ile düz metin olarak yazılır. Onaylı yorum yoksa "Öğrenci yorumları" bölümü hiç görünmez.

## Güvenlik kuralları (`firestore.rules`, "Gramer dersi yorumları")

- Oluşturma: oturum (anonim de olur) gerekir. Yalnızca 5 alan; `status == "pending"`, `createdAt == request.time`,
  ad 1–60, yorum 10–2000 karakter, `lesson` biçimi `^(A1|A2|B1|B2)/[a-z0-9-]{1,40}$`. Bekleme belgesi aynı batch'te.
- Okuma: herkes yalnızca `status == "approved"` olanları; sorgu da bu filtreyle sınırlı olmalı.
- Onay, cevap, düzenleme, silme, bekleyenleri görme: yalnızca öğretmen (`isTeacher()`).
- Testler: `tests/firestore.rules.test.mjs` → "Gramer dersi yorumları (comments)".

**Kurallar değiştiğinde** `firestore.rules` dosyasının tamamını Firebase Console → Firestore Database → Kurallar'a
yapıştırıp **Yayınla** (docs/kurulum.md). Yayınlanmazsa yorum gönderme ve onay sayfası "izin yok" hatası verir.

## Sorun giderme

Tarayıcı konsolunda (F12 → Console) her adım `[yorum]` önekiyle yazılır: Firebase yüklendi, anonim giriş, Firestore kaydı,
bildirim e-postası. Hata olursa adım ve kod görünür, ör. `[yorum] HATA: Firestore yazımı permission-denied` (kurallar
yayınlanmamış veya 60 saniye dolmamış) ya da `timeout` (Firestore'a 20 saniyede ulaşılamadı). Firestore kaydı başarısız
olursa bildirim e-postası gönderilmez ve öğrenci hata mesajı görür. Onay ekranı `[yorum onayı]` önekini kullanır.

## Notlar

- Review / AggregateRating şeması kullanılmaz.
- Tarayıcı kontrolleri gerçek kişilere deneme e-postası göndermez; testler Web3Forms uç noktasını taklit eder ve Firestore
  için emülatör kullanır (`?emulator=1`, docs/kurulum.md).
- Tarayıcıdaki gizli alan, oturum başına bekleme süresi ve "onaysız hiçbir şey yayınlanmaz" kuralı spam'i sınırlar. Çok
  sayıda anonim oturumla bekleyen listesi doldurulabilir; bu yorumlar panelden silinir. App Check (reCAPTCHA) şimdilik yok.
