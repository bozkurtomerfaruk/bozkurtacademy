# Ders hatırlatma e-postaları (Google Apps Script)

Google Calendar etkinlik hatırlatmaları sadece etkinliği düzenleyene (öğretmene) çalışır. Öğrencilere ve velilere hatırlatmayı bu betik gönderir. Betik senin Google hesabında çalışır; sunucu gerekmez.

## Ne yapar

- Her gün **Berlin saatiyle 18:00–19:00 arasında** bir kez çalışır. Google günlük tetikleyicilerde tam dakikayı garanti etmez.
- Takviminde **ertesi gün** olan ve **siteden oluşturulmuş** dersleri bulur. Bu dersler `extendedProperties.private.source = bozkurtacademy` işaretini taşır; kişisel etkinliklerin aramaya hiç girmez.
- Her davetliye (öğrenci ve davet edilmişse veli) Türkçe bir hatırlatma gönderir:
  - Konu: **"Yarınki Almanca dersin – 18:00"**
  - İçerik: tarih, saat ("Almanya saati"), süre, Meet linki ve varsa ders notu. Veliye giden metin "Öğrenciniz … için" diye başlar.
- Gönderilmeyenler:
  - **İptal edilmiş** dersler;
  - daveti **reddetmiş** kişiler;
  - sen (düzenleyen).
- **Aynı ders için aynı kişiye iki kez göndermez.** Her gönderim, e-posta adresinin SHA-256 özetiyle betiğin ayarlarında 14 gün saklanır; e-posta adresi düz metin olarak tutulmaz. Ders başka bir saate taşınırsa yeni saat için yeniden gönderir.
- E-postalar senin Gmail hesabından **MailApp** ile gider. Gönderen adı "Bozkurt Academy" olur. Kişisel Gmail'de günde 100 alıcı sınırı var.

## Kurulum (bir kez)

1. **Proje oluştur:** [script.google.com](https://script.google.com) → **Yeni proje**. Sol üstteki "Adsız proje" yazısına tıklayıp adını **"Ders hatırlatmaları"** yap.
2. **Proje ayarları** (soldaki dişli simgesi):
   - **"appsscript.json manifest dosyasını düzenleyicide göster"** kutusunu işaretle.
   - **Saat dilimi:** "(GMT+01:00) Berlin" seç.
3. **Kodu yapıştır:** Soldaki **Düzenleyici**'ye (`< >`) dön.
   - `Code.gs` dosyasının içindekileri tamamen sil, repodaki [`apps-script/Code.gs`](Code.gs) dosyasının tamamını yapıştır.
   - `appsscript.json` dosyasının içindekileri tamamen sil, repodaki [`apps-script/appsscript.json`](appsscript.json) dosyasını yapıştır.
   - **Kaydet**'e bas (disk simgesi ya da Ctrl+S).
4. **Calendar hizmetini ekle:** Soldaki **Hizmetler** yanındaki **+** → **Google Calendar API** → tanımlayıcı **Calendar** kalsın → **Ekle**. (Manifest bunu zaten içeriyor; listede görünüyorsa bu adımı atla.)
5. **Deneme çalıştırması:**
   - Üstteki fonksiyon listesinden **`dryRun`**'ı seç → **Çalıştır**.
   - İlk seferde izin istenir: **İzinleri incele** → hesabını seç. "Google bu uygulamayı doğrulamadı" uyarısında **Gelişmiş** → **Ders hatırlatmaları (güvenli değil) sayfasına git**. Bu senin kendi betiğin.
   - İstenen izinler: takvimi görme (sadece okuma), senin adına e-posta gönderme, zamanlayıcıları yönetme → **İzin ver**.
   - Alttaki **Yürütme günlüğü**'nde yarın kime hangi e-postanın gideceğini görürsün. Bu adımda e-posta **gönderilmez**.
6. **Zamanlayıcıyı kur:** Fonksiyon listesinden **`installTrigger`**'ı seç → **Çalıştır** (sadece bir kez). Soldaki **Tetikleyiciler** (saat simgesi) sayfasında `sendReminders` için "Günlük zamanlayıcı, 18:00–19:00" görünmeli.

## Deneme

1. Sitede, ikinci e-posta adresinle kayıtlı bir test öğrencisine **yarın** için bir ders planla.
2. Apps Script'te **`dryRun`** çalıştır: günlükte bu ders ve alıcısı görünmeli.
3. **`sendReminders`**'ı elle çalıştır: test adresine "Yarınki Almanca dersin – …" e-postası gelmeli.
4. **`sendReminders`**'ı bir kez daha çalıştır: günlükte "Zaten gönderildi, atlandı" yazmalı, ikinci e-posta gitmemeli.
5. Test dersini sitede iptal et.

## Güncelleme

Repodaki `Code.gs` değişirse aynı yere yeniden yapıştırıp kaydet. Zamanlayıcıyı yeniden kurmak gerekmez.

## Sorun giderme

- **Günlükte "Ders: 0":** Yarın için siteden planlanmış ders yok ya da ders Google Calendar'a eklenememiş. Öğretmen takviminde "Google Calendar'a eklenemedi" uyarısına bak.
- **"Calendar is not defined":** 4. adım (Google Calendar API hizmeti) eksik.
- **"Service invoked too many times" / kota hatası:** Günlük e-posta sınırı dolmuş, ertesi gün devam eder.
- Hataları **Yürütmeler** sayfasında görebilirsin. Google, başarısız olan zamanlayıcıları sana e-postayla da bildirir.

## İzinler ve veriler

- Betik sadece senin takvimini **okur** (`calendar.readonly`) ve senin hesabından e-posta gönderir (`script.send_mail`). Takvimde hiçbir şeyi değiştirmez.
- Gönderim kayıtları: Proje ayarları → **Komut dosyası özellikleri**. Anahtarlar `sent:` + e-posta adresinin özeti. 14 günden eskileri betik kendisi siler.
