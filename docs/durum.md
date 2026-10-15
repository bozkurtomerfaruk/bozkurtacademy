# Durum

Öğrenci sistemi çalışmasının güncel durumu. Plan: `docs/plan-ogrenci-sistemi.md`.

## 2026-10-15 · Aşama 2 bitti, PR açıldı, onay bekleniyor

**PR:** [PR #20](https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/20) (dal: `claude/asama-2-odevler`). Birleştirilmedi.

**Önce birleşenler:**
- [PR #18](https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/18): öğretmen UID'i. Kuralları Firebase Console'da yayınladın.
- [PR #19](https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/19): imzalı veli formlarının saklandığı yer. Kâğıt olanlar kilitli dolapta, dijital olanlar (taranmış ya da e-postayla gelen) şifreli klasörde; ikisi birden yazıldı.

**Aşama 2'de yapılan:**
- Yeni ödev sayfası (`ogretmen-odev.html`): başlık, açıklama, Berlin saatiyle teslim tarihi, sitedeki alıştırmalar, isteğe bağlı Google Docs linki ("her öğrenciye kopya" → `/copy`), bir ya da birden fazla öğrenci.
- Öğretmen panelinde "Ödevler" sekmesi: kaç öğrencinin tamamladığı, öğrenci bazında durum, ödevi silme.
- Öğrenci detayı: ödevler (alıştırma sonuçlarıyla), kaynak ekleme ve silme.
- Öğrenci paneli (TR/DE/EN): aktif ödevler (teslim tarihine göre), tamamlananlar, kaynaklar, "Tamamladım", geri alma ve kendi Google Docs linki.

**Testler:** 61/61 kural testi, Aşama 2 ve Aşama 1 uçtan uca akışları, `check-grammar` PASS, 390/1440px açık/koyu ekran görüntüleri.

**Bilmen gerekenler:**
- `firestore.rules` değişti: **birleştirdikten sonra kuralları Firebase Console'da yeniden yayınlaman gerekiyor**, yoksa öğrenci ödevi işaretleyemez.
- Verilmiş ödevi düzenleme yok (silip yeniden verilebiliyor).

**Senden beklenenler:**
1. Canlı testte sorun çıktıysa haber vermen.
2. PR #20 için "birleştir" demen; ardından kuralları yeniden yayınlaman.
3. Aşama 3 (ders takvimi, Google Calendar ve Meet) için onayın. Aşama 3'ten önce planın 9.B adımları gerekiyor: Calendar API, OAuth izin ekranı, istemci kimliği.
4. Gizlilik metni kesinleşince "Giriş linkini aç" demen.

## 2026-10-15 · Öğretmen UID'i yazıldı, kurallar yayına hazır

**Birleştirilen:** [PR #18](https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/18). UID `IoTwBV5HjRUaoLoj0SCI0VVGkfk2`, `firestore.rules` ve `js/account/config.js` dosyalarına yazıldı. 50/50 kural testi (yerelde ve GitHub Actions'ta) ve emülatörde uçtan uca akış geçti.

**Senden beklenenler:**
1. `firestore.rules` dosyasını Firebase Console → Firestore → Kurallar'a yapıştırıp **Yayınla**.
2. İmzalı veli formlarını nerede saklayacağını tek seçenek olarak söylemen: kâğıt olarak kilitli bir dolapta **mı**, dijital olarak şifreli bir klasörde **mi**? (Son mesajda yine iki seçenek birlikte geçiyordu; `privacy.html` ve veli formunda şimdilik ikisi de yazıyor.)
3. Gizlilik metninin hukuki kontrolü bitince "Giriş linkini aç" demen.
4. Aşama 2 için onayın.

## 2026-10-15 · PR #17 ve PR #16 birleştirildi, sessiz yayında

**Birleştirilen:** önce [PR #17](https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/17) (GoatCounter), sonra [PR #16](https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/16) (Aşama 1). İkisi `index.html` ve `docs/privacy-policy.md`'de çakıştı; çakışma çözüldü, iki betik de yerinde.

**Birleştirmeden önce yapılanlar:**
- **Sessiz yayın:** `index.html`'deki "Giriş" linki `hidden`. Giriş, kayıt ve panel sayfaları adresle açılıyor.
- **privacy.html dolduruldu:**
  - adres;
  - hukuki dayanaklar (DSGVO md. 6/1-b; 6/1-a ve 8; 6/1-f);
  - ABD aktarımı (AB-ABD Veri Gizliliği Çerçevesi ve standart sözleşme maddeleri);
  - imzalı formların saklanması, GoatCounter bölümü, denetim makamı (LDI NRW, www.ldi.nrw.de), tarih;
  - en üstte "Bu metin hukuki olarak kontrol edilmektedir" notu.
  
  Aynı bilgiler veli onay formuna da işlendi. Sitede köşeli parantezli boşluk kalmadı.
- **E-posta doğrulama:**
  - e-posta ile kayıtta doğrulama e-postası gidiyor;
  - öğrenci panelinde doğrulama durumu ve "yeniden gönder" düğmesi var;
  - öğretmen panelinde her öğrencide "E-posta doğrulandı / doğrulanmadı" rozeti, doğrulanmamış öğrencide onay düğmesinin yanında uyarı (onay engellenmiyor).

**Kurallarda küçük değişiklik (gerekliydi):** Öğretmen tarayıcıdan başka kullanıcıların doğrulama bilgisini okuyamıyor. Bu yüzden öğrenci, e-postası gerçekten doğrulanmışsa (giriş bilgisindeki `email_verified`) kendi profiline sadece `emailVerified: true` yazabiliyor. Başka alana dokunamıyor. 5 yeni test eklendi; toplam 50/50, GitHub Actions'ta da geçti.

**Yayın:** GitHub Pages yayını (`pages build and deployment`, commit `546884b`) başarıyla tamamlandı. Canlı site geliştirme ortamından açılamadığı için sayfaları ben açıp göremedim.

**Testler:** emülatörde uçtan uca akış (doğrulama e-postası, bağlantı, rozet dahil), GoatCounter sayımı, `check-grammar` PASS, ana sayfada "Giriş" linkinin gizli olduğu (390 ve 1280px).

**Bilmen gerekenler:**
- `privacy.html` ve veli formu, imzalı formlar için "kâğıt olarak kilitli bir dolapta ya da dijital olarak şifreli bir klasörde" diyor. Hangisini kullanıyorsan sadece onu bırakmalıyız.
- `privacy.html` hâlâ `noindex`; hukuki kontrol bitince not ve `noindex` kaldırılıp "Giriş" linki açılacak.

**Senden beklenenler:**
1. `https://bozkurtacademy.com/giris.html` → **Google ile giriş yap** → ekranda görünen **UID**'i bana gönder. (Kurallar henüz yayınlanmadığı için "kayıt bulunamadı" mesajı normal; kayıt formunu doldurma.)
2. UID'i kurallara yazdıktan sonra `firestore.rules` dosyasını Firebase Console → Firestore → Kurallar'a yapıştırıp **Yayınla** (`docs/kurulum.md`).
3. Gizlilik metninin hukuki kontrolü bitince "Giriş linkini aç" demen.
4. Aşama 2'ye (ödevler ve kaynaklar) geçmek için onayın.

## 2026-10-15 · Ayrı iş: GoatCounter PR açıldı

**PR:** https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/17 (dal: `claude/goatcounter`, main'den). Birleştirilmedi.

- count.js (GoatCounter v2.7.0, ISC) `js/vendor/count.js` olarak sitenin kendisinden yükleniyor. Tek değişiklik: localStorage kullanan `#toggle-goatcounter` özelliği çıkarıldı. Kendi ziyaretlerini saymamak için GoatCounter → Settings → "Ignore IPs" kullanabilirsin.
- Sadece `index.html`'de. Her hash sayfası ayrı sayılıyor, soru numaraları atılıyor. localhost'ta sayım yok. Çerez ve localStorage yok.
- Test: konsol hatası yok, dersler ve alıştırmalar çalışıyor, `check-grammar` PASS.
- Not: `gc.zgo.at` geliştirme ortamında engelli olduğu için dosya GoatCounter'ın GitHub'daki v2.7.0 etiketinden alındı.
- İki PR de birleşince taslak `privacy.html`'ye GoatCounter bölümü eklenmeli.

## 2026-10-15 · Aşama 1 bitti, PR açıldı, onay bekleniyor

**PR:** https://github.com/bozkurtomerfaruk/bozkurtacademy/pull/16 (dal: `claude/asama-1-ogrenci-girisi`). Birleştirilmedi.

**Yapılan:** Giriş ve kayıt (16 yaş altı için veli bilgileri, Google sadece 16+), öğretmen onayı ve veli onayı, alıştırma sonuçlarının kaydı, öğrenci paneli, öğretmen paneli (öğrenciler, onay bekleyenler, veli onayı bekleyenler, silinmesi gereken kayıtlar + uyarı), öğrenci detayı, silme akışı, taslak `privacy.html`, taslak veli onay formu (TR/DE), kurulum belgesi. Kararlarının hepsi uygulandı.

**Testler:** 45/45 Firestore kural testi, `check-grammar` PASS, emülatörde uçtan uca akışlar geçti, herkese açık sayfalar giriş yapmadan çalışıyor, 390 ve 1440px açık/koyu ekran görüntüleri paylaşıldı.

**Bilmen gerekenler:**
- Google ile giriş penceresi geliştirme ortamında test edilemedi (`apis.google.com` engelli). Canlıda denenmeli.
- Dersler Aşama 3'te geleceği için "son dersten 12 ay" kuralı şimdilik onay tarihine bakıyor. Aşama 3'te dersler otomatik hesaba katılacak.
- `privacy.html` sadece Türkçe ve köşeli parantezli yerler (adres, hukuki dayanak, denetim makamı, formların saklandığı yer) doldurulmalı.
- Öğretmen sayfalarında dil düğmesi yok (öğretmen paneli sadece Türkçe).

**Senden beklenenler:**
1. `privacy.html` hukuki kontrolü, sonra PR'ı birleştirmek için "birleştir" demen.
2. Birleştirdikten sonra: `giris.html`'de Google ile giriş yapıp ekranda görünen **UID'ini** göndermen. Ardından `firestore.rules` dosyasını Firebase Console'da yayınlaman (`docs/kurulum.md`).
3. Aşama 2'ye (ödevler ve kaynaklar) geçmek için onayın.


## 2026-10-15 · Plan kaydedildi, onay bekleniyor

**Yapılan:** Plan `docs/plan-ogrenci-sistemi.md` dosyasına yazıldı. Henüz kod yazılmadı.

**Senden beklenen kararlar** (ayrıntılar planın 0. bölümünde):

1. **Yaş hesabı:** `bu yıl − doğum yılı ≤ 16` ise veli onayı istensin mi? (Önerim: evet.)
2. **Haftalık tekrar:** Google'da tek tekrarlayan etkinlik mi, yoksa her ders ayrı etkinlik mi? (Önerim: tek tekrarlayan etkinlik.)
3. **Dil:** Öğrenci sayfalarına Almanca ve İngilizce çeviri de eklensin mi? (Önerim: öğrenci sayfalarına evet; öğretmen paneli ve e-postalar sadece Türkçe.)
4. **privacy.html:** Aşama 1'de taslak gizlilik sayfası hazırlansın mı? (Önerim: evet, hukuki kontrolden sonra yayına alınsın.)
5. **Saklama süresi:** Son dersten 12 ay sonra silme, onaylanmayan kayıtlar için 30 gün uygun mu?

**Sonraki adım:** Planı onaylayıp bu kararları verince Aşama 1'e başlanacak. PR açmadan önce Firebase `firebaseConfig` bilgisi gerekiyor (planın 9.A bölümü).
