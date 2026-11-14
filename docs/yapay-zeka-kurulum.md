# Schreiben yapay zekâ kontrolü: kurulum (Aşama B)

Bu rehber, öğrenci metinlerini Gemma 4 ile kontrol eden Cloudflare Worker'ı kurar. **Hiçbir adım kart, ücret ya da
Workers Paid planı istemez.** Bir ekranda kart bilgisi, "Upgrade", "Workers Paid" ya da "Purchase" gibi bir şey görürsen
**dur, devam etme ve bana yaz.**

Neden ücret çıkmaz:

- Workers Free planında günde 100.000 istek ve Workers AI için günde 10.000 "Neuron" ücretsizdir. Bir metin yaklaşık
  9–12 Neuron harcar (günde yaklaşık 800 metin). Sitedeki sınır günde 600 kontrol, öğrenci başına 3.
- Free planda kota dolunca Cloudflare para kesmez, istek hata verir. O gün taslak oluşmaz; öğrenci yine senin geri
  bildirimini alır.

Kurulum sırasında hiçbir şeyi sohbete yapıştırma. Şifreler sadece Cloudflare'in "Secret" alanına girer.

## Neler gerekiyor

- Cloudflare hesabın (Workers Free; kontrol ettin).
- Firebase Console (bozkurtacademy-8ab85).
- Yaklaşık 20 dakika.

## Adım 1: Worker'ı oluştur

1. https://dash.cloudflare.com adresine gir.
2. Sol menüde **Compute (Workers)** → **Workers & Pages**'e tıkla. (Menü adı biraz farklı olabilir: "Workers & Pages".)
3. **Create** → **Workers** sekmesi → **Start with Hello World!** → **Get started**.
4. Ad olarak `schreiben-kontrol` yaz → **Deploy**.
   - İlk Worker'ında Cloudflare bir **workers.dev alt alanı** (subdomain) seçmeni isteyebilir. Ücretsizdir; ör. `bozkurtacademy`.
5. **Edit code**'a tıkla. Soldaki `worker.js` dosyasının içindekileri tamamen sil.
6. GitHub'da depodaki `worker/schreiben-kontrol.js` dosyasını aç → **Raw** → hepsini kopyala → Cloudflare editörüne yapıştır.
7. Sağ üstte **Deploy** → onayla.
8. Worker'ın adresini not al. Şuna benzer: `https://schreiben-kontrol.bozkurtacademy.workers.dev`.

## Adım 2: Yapay zekâ bağlantısını ekle (Workers AI)

1. Worker sayfasında **Settings** (Ayarlar) → **Bindings** → **Add binding**.
2. **Workers AI**'ı seç.
3. **Variable name**: `AI` (büyük harfle, tam olarak böyle) → **Add binding** / **Deploy**.

API token gerekmez; bağlantı Worker'ın içinden çalışır.

## Adım 3: Firebase'de "yapay zekâ" hesabını aç

Worker, Firestore'a bu ayrı hesapla girer. Kurallar bu hesaba sadece metni okumayı, taslak ve sayaç yazmayı izin verir.

1. https://console.firebase.google.com → **bozkurtacademy-8ab85** → **Authentication** → **Users** → **Add user**.
2. E-posta: `bozkurtt.omerfaruk+yapayzeka@gmail.com` (Gmail'in `+` adresi; e-postalar yine sana gelir).
3. Şifre: uzun ve rastgele bir şifre üret (en az 24 karakter). Bir yere güvenle not et; Adım 4'te gerekecek.
4. **Add user**. Listede yeni hesabın **User UID** sütunundaki değeri kopyala.
5. **Bana sadece bu UID'yi gönder** (şifreyi değil). Ben `firestore.rules` içindeki `YAPAY-ZEKA-HESABI-UID` yerine koyarım.
   UID gizli bir bilgi değildir; şifre gizlidir.

## Adım 4: Worker değişkenleri

Worker sayfasında **Settings** → **Variables and Secrets** → **Add**. Her satır için:

| Ad | Tür | Değer |
|---|---|---|
| `FIREBASE_API_KEY` | Text | `js/account/config.js` içindeki `apiKey` (herkese açık bir değer) |
| `FIREBASE_PROJECT_ID` | Text | `bozkurtacademy-8ab85` |
| `SITE_URL` | Text | `https://bozkurtacademy.com` |
| `ALLOWED_ORIGINS` | Text | `https://bozkurtacademy.com,https://www.bozkurtacademy.com` |
| `AI_EMAIL` | Text | Adım 3'teki e-posta |
| `AI_PASSWORD` | **Secret** | Adım 3'teki şifre |

Sonra **Deploy**.

> Firebase API anahtarı Google Cloud'da "HTTP referrers" ile kısıtlıysa sorun olmaz: Worker istekleri `SITE_URL` adresiyle gönderir.

## Adım 5: Worker adresini bana gönder

Adım 1'deki adresi (ör. `https://schreiben-kontrol.bozkurtacademy.workers.dev`) bana yaz. Ben iki yere koyarım:

- `js/account/config.js` → `AI_WORKER_URL` (tarayıcı metin gönderilince bu adrese haber verir),
- `scripts/csp.mjs` → `AI_WORKER_ORIGIN` (sitenin güvenlik kuralı bu adrese bağlanmaya izin verir).

Bu değişiklik ayrı, küçük bir PR olur. Birleştirmeden önce sana sorarım.

## Adım 6: Firestore kurallarını yayınla

UID'li kurallar birleştirildikten sonra: Firebase Console → **Firestore Database** → **Rules** → depodaki
`firestore.rules` dosyasının tamamını yapıştır → **Publish**.

## Adım 7: Öğretmen panelinde modu kontrol et

1. `ogretmen.html`'e öğretmen hesabınla gir.
2. Üstte **Schreiben yapay zekâ kontrolü** seçimini gör. Ayar hiç yoksa ilk açılışta **Anında göster** olarak kaydedilir. Daha önce **Taslak** kayıtlıysa öyle kalır; istediğinde buradan değiştirirsin.
   - **Anında göster** (varsayılan): öğrenci geri bildirimi gönderdikten birkaç saniye sonra görev sayfasında görür ("Yapay zekâ geri bildirimi – nadiren hata yapabilir"). Sen sadece öğrencinin "Bu açıklama yanlış görünüyor" dediği maddelere ve yapay zekânın kontrol edemediği yazılara bakarsın.
   - **Taslak:** geri bildirim sadece sana gelir; öğrenci görmez. Sen düzeltip onaylarsın ya da silersin.
   - **Kapalı:** hiç kontrol yapılmaz; geri bildirimi sen yazarsın.
3. 16 yaş altı öğrencilerde kontrol, öğrenci sayfasında **Velinin yapay zekâ onayı alındı** işaretlenene kadar kapalıdır. Onay eski formla (12.11.2026'dan önce) alınmışsa sonuç, mod ne olursa olsun taslak olarak sana gelir; veli yeni formu (`docs/veli-onay-formu.md`, madde 3a) onaylayınca öğrenci sayfasında **Veli yeni formu onayladı: kaydet** ile kaydet.

## Adım 8: Deneme

1. Bir yetişkin deneme öğrenci hesabıyla bir Schreiben metni gönder (ör. `#exams/goethe/b1/schreiben/1/set-1`).
2. **Anında göster** modunda: birkaç saniye içinde aynı sayfada işaretli hatalar, açıklamalar, düzeltilmiş metin ve ardından örnek cevap görünmeli.
3. Bir maddede **Bu açıklama yanlış görünüyor**a bas. Öğretmen panelinde o öğrencide **"1 işaretli madde"** görünmeli; öğrenci sayfasında maddeyi düzelt ve **Düzeltmeyi öğrenciye gönder**.
4. **Taslak** modunda: öğretmen panelinde **"1 taslak hazır"** görünür; taslağı aç, düzelt, **Onayla ve öğrenciye gönder**.

Geri bildirim gelmezse: Cloudflare → Worker → **Logs** (ya da **Observability**) ekranındaki son hatayı bana yaz (metin içermez).

## Adım 9: Deneme token'ını sil

Worker kurulup deneme başarılı olunca, araştırmada kullandığımız **Cloudflare API token'ını sil**:
Cloudflare → sağ üstte profil → **My Profile** → **API Tokens** → deneme token'ı → **Delete**.
Worker bu token'ı kullanmaz; silmek hiçbir şeyi bozmaz.

## Notlar

- **Ne gönderilir:** sadece metin, görev adı (ör. "Goethe B1 · Teil 1 · Neue Wohnung") ve metin türü. Ad, e-posta, uid gitmez.
- **Güncelleme sırası (kurallar da değiştiyse):** önce Firestore kurallarını yayınla, sonra Worker'ı güncelle, en son öğretmen panelinde modu değiştir. Eski Worker yeni siteyle de çalışır; sadece geri bildirim görev sayfasında değil, öğrenci panelinde görünür.
- **Kapatmak için:** öğretmen panelinde **Kapalı** seç. Worker'ı silmek de yeterli; site Worker olmadan da çalışır.
- **App Check:** İleride Firebase App Check'i "zorunlu" yaparsan Worker'ın Firestore istekleri reddedilir. O zaman bana sor.
- **Kod değişirse:** `worker/schreiben-kontrol.js` güncellendiğinde Adım 1'deki 5–7'yi tekrarla (Edit code → yapıştır → Deploy).
- Testler: `npm run test:worker` (sahte Firebase ve sahte yapay zekâ ile), `npm run test:schreiben-ai` (emülatörle uçtan uca).
