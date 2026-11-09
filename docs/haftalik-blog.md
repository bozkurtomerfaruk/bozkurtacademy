# Haftalık blog yazısı: çalışma talimatı

Bu dosya her hafta (zamanlanmış görevle veya "Haftalık blog yazısını yaz" mesajıyla) çalışan Claude oturumu içindir.
Oturum önce bu dosyanın tamamını okur, sonra **A** bölümünü uygular. Site sahibi "yayınla" derse **B** bölümü uygulanır.
**C** bölümündeki kurallar her çalışmada geçerlidir ve diğer her şeyden önce gelir.

Teknik ayrıntılar (dosyalar, komutlar, testler) en sondaki **D** bölümündedir.

---

## A) Her hafta yapılacaklar

0. **Önce bekleyen taslak var mı bak.** `_blog/posts.json` içinde `"status": "draft"` olan bir yazı varsa **yeni yazı yazma**.
   Site sahibine yalnızca şunu yaz: hangi yazının (başlık ve taslak linki) onay beklediği ve "yayınla" demesi gerektiği. Sonra dur.
   Taslakların birikmesi istenmiyor.

1. **Konuyu seç.** `SEO-YAPILACAKLAR.md` › "12 haftalık blog takvimi" tablosunda durumu **"Yayınlandı"** veya **"Taslak yazıldı"** olmayan ilk satırı seç.

2. **Takvim bittiyse** (bütün satırlar "Yayınlandı" veya "Taslak yazıldı"): önce yeni bir 12 haftalık takvim hazırla ve `SEO-YAPILACAKLAR.md`'ye, mevcut takvimin altına "12 haftalık blog takvimi (2. dönem)" gibi yeni bir başlıkla ekle. Sonra ilk satırıyla devam et.
   - Konular: Türkiye'de Almanca öğrenenlerin aradığı konular: gramer, sınavlar, Almanya'da iş, okul ve aile birleşimi, günlük dil, kelime öğrenme.
   - Sütunlar mevcut tabloyla aynı olsun: Hafta, Hedef arama, Başlık önerisi, Link verilecek sayfalar, Durum.
   - Mevcut yazılarla **aynı arama için yarışan** konu seçme (`_blog/posts.json` içindeki başlık ve açıklamalara bak).
   - Link verilecek sayfalar gerçekten var olan adresler olsun (`almanca-gramer/`, kurs sayfaları, `/blog/...`).

3. **Yazıyı yaz** (mevcut blog sistemiyle; ayrıntılar D bölümünde):
   - 800–1200 kelime, doğal ve sade Türkçe. İlk kez Almanca öğrenen birinin anlayacağı dil.
   - `title` ve `description` hedef aramayı içersin. `description` en fazla ~155 karakter, `seoTitle` en fazla ~60 karakter.
   - Almanca örneklerin doğruluğunu **iki kez** kontrol et: artikel, çekim, hâl (Kasus), kelime sırası, büyük harf, Türkçe çevirinin doğruluğu.
   - İlgili gramer ders sayfalarına, kurs sayfalarına ve diğer blog yazılarına link ver. Linklerin hepsi var olan sayfalara gitsin.
   - Geri dönüş linkleri: ilgili kurs sayfalarına işaret sistemiyle bir cümle ekle (D bölümü). Bu cümle yazı yayınlanınca görünür. Gramer derslerindeki "Blogda bu konu" notu otomatiktir.
   - Konuya uygunsa kısa bir tablo (mobilde taşmayan, `bl-table-scroll` içinde) veya örnek diyalog ekle.
   - Değişebilen resmî bilgileri (ücretler, sınav kuralları, vize ve aile birleşimi şartları, tarihler, süreler, puanlar) **kesin rakamla yazma**:
     - resmî kaynağa link ver; linkin açıldığını kontrol et (D bölümü), açamıyorsan kurumun ana sayfasına link ver;
     - o yeri kaynakta `<!-- KONTROL ET: … -->` ile işaretle.
   - Kişisel deneyim, öğrenci hikâyesi, başarı oranı, öğrenci sayısı, sertifika veya site sahibinin vermediği herhangi bir iddia **uydurma**.
   - **Görseller (zorunlu):** Her yeni yazı en az **1 kapak görseli** ve konuya uygun **1–3 içerik görseliyle** hazırlanır. Görselsiz yazı taslak olarak bile yayınlanmaz (`build-pages`, kapak dosyaları yoksa hata verir). Kurallar ve dosya düzeni D › "Görseller" bölümünde.

4. **Yazıyı TASLAK olarak yayına al:** `"status": "draft"`. Sayfa noindex olur, sitemap'e ve listelere girmez, üstte "Taslak" notu çıkar.
   `date` alanına planlanan yayın gününü (çalışma günü) yaz.
   [Tamamen otomatik yayın istenirse bu maddenin yerine şu yazılır: "Yazıyı doğrudan yayınla: status published, tarih bugün, sitemap'e ekle."]

5. **Takvimi güncelle:** `SEO-YAPILACAKLAR.md`'de o satırın tarihini çalışma gününe, durumunu **"Taslak yazıldı"** olarak değiştir.

6. **Kontroller** (D bölümündeki komutlarla):
   - `node scripts/build-pages.mjs --check` ve `node scripts/check-versions.mjs` PASS;
   - tek H1;
   - yazıdaki iç linklerin hepsi var olan sayfalara gidiyor;
   - 375 px ve 1280 px, açık ve koyu temada yatay taşma yok; görseller açık ve koyu temada okunuyor, kırık görsel yok;
   - görsel dosyalarının her biri 150 KB'ın altında; `images/blog/KAYNAKLAR.md` güncel;
   - sayfa noindex ve sitemap'te yok;
   - CI yeşil.

7. **PR:** Yeni bir dalda commit et (oturuma bir dal adı verildiyse onu kullan; yoksa `blog/<adres>`), PR aç.
   CI yeşilse ve çakışma yoksa **normal merge** ile birleştir, GitHub Pages yayınının ("pages build and deployment") başarılı bittiğini kontrol et.
   Çakışmayı veya kırmızı CI'ı çözemezsen **birleştirme**, site sahibine durumu yaz.

8. **Kısa özet gönder:**
   - yazının başlığı;
   - taslak linki (`https://bozkurtacademy.com/blog/<adres>/`);
   - `KONTROL ET` yerlerinin sayısı ve her birinin kısaca ne olduğu;
   - okunması gereken noktalar (emin olunamayan Almanca örnek, açılamayan resmî link vb.);
   - eklenen görseller ve kaynakları (kapak + içerik görselleri; özgün illüstrasyon mu, stok fotoğraf mı; fotoğrafsa fotoğrafçı ve sayfa linki);
   - "Onaylıyorsan 'yayınla' yaz."

## B) Site sahibi "yayınla" dediğinde

1. `_blog/posts.json`'da yazının `status` değerini `"published"`, `date` değerini o günün tarihi yap.
2. `node scripts/build-pages.mjs` çalıştır. Bununla birlikte:
   - taslak notu ve noindex kalkar;
   - sayfa sitemap'e girer;
   - BlogPosting şeması eklenir;
   - blog listesi ve ana sayfadaki "Blogdan son yazılar" bölümü güncellenir;
   - kurs sayfalarındaki geri dönüş cümleleri ve gramer derslerindeki "Blogda bu konu" notu görünür.
3. `SEO-YAPILACAKLAR.md`'de o satırın durumunu **"Yayınlandı"**, tarihini yayın günü yap.
4. Kontroller (A6), PR, CI yeşil ve çakışma yoksa normal merge, Pages yayınını kontrol et.
5. Site sahibine Search Console'da **"Dizine eklenmesini iste"** yapması gereken adresi yaz: `https://bozkurtacademy.com/blog/<adres>/`.

## C) Kurallar (her çalışmada geçerli)

- WhatsApp, telefon, adres, şehir ve fiyat sitede hiçbir yerde olmasın.
- Doğrulanmamış hiçbir bilgi yazma; şemalara yalnızca sayfada görünen bilgiler girsin.
- JS veya CSS değişirse `?v=` sürüm numarasını tüm sayfalarda artır (`scripts/build-pages.mjs` içindeki `V` nesnesi ve elle yazılmış sayfalar; `node scripts/check-versions.mjs` denetler).
- `firestore.rules` değişmesin. Değişmesi gerekiyorsa yapma, site sahibine sor.
- Force push yok, geçmişi yeniden yazma yok (rebase, amend, reset sonrası push yok). Çakışmada `git merge origin/main` kullan.
- Önceki haftanın taslağı hâlâ yayınlanmadıysa yeni yazı yazma; site sahibine önceki taslağın onay beklediğini hatırlat (A0).
- Yazar olarak yalnızca "Ömer Faruk Bozkurt" adı kullanılır; başka bilgi (unvan, yıl, sertifika) eklenmez.
- Aile birleşimi, vize veya resmî başvuru konulu yazılarda Türkiye için hangi sınav belgelerinin kabul edildiğini mutlaka `tuerkei.diplo.de`'deki güncel sayfadan kontrol et (aile birleşimi: https://tuerkei.diplo.de/tr-tr/service/05-visaeinreise/2728618-2728618). Kontrol edemiyorsan yazıyı taslakta bırak ve site sahibine söyle.
- Alan adı her yerde `https://bozkurtacademy.com` (www yok).

## D) Teknik ayrıntılar

### Dosyalar

- `_blog/posts.json`: yazı listesi. Alt çizgili klasör GitHub Pages'te yayınlanmaz, sadece kaynaktır.
- `_blog/<adres>.html`: yazının gövdesi. `<h2>` ile başlar, **H1 yazılmaz** (şablondan gelir).
- `scripts/blog-pages.mjs`: blog şablonu ve şema. `scripts/build-pages.mjs`: bütün sayfaları ve `sitemap.xml`'i üretir.
- `blog/…/index.html` dosyaları üretilir; elle düzenlenmez.

### posts.json kaydı

```json
{
  "slug": "almanca-artikel-nasil-ogrenilir",
  "title": "Sayfadaki başlık (H1)",
  "seoTitle": "Arama sonucundaki başlık | Bozkurt Academy",
  "crumb": "Kısa breadcrumb adı",
  "description": "Arama sonuçlarında görünecek özet (≤ ~155 karakter).",
  "lead": "Başlığın altındaki 1–2 cümlelik giriş.",
  "teaser": "Ana sayfadaki kısa tanıtım cümlesi.",
  "date": "YYYY-AA-GG",
  "status": "draft",
  "related": [["/a1-almanca-kursu/", "A1 Almanca Kursu"], ["/almanca-gramer/a1/artikel/", "Artikel"]],
  "backlinks": {
    "/a1-almanca-kursu/": "Artikelleri akılda tutmanın yolları için {link} yazısına bakabilirsin."
  }
}
```

- `slug`: yalnızca küçük harf, rakam ve tire.
- Yeni kayıt listenin **sonuna** eklenir. Aynı tarihli yazılarda sonra eklenen önce gösterilir.

### Görseller

**Kaynak (lisans çok önemli).** Yalnızca şu iki yoldan biri kullanılır:

- **B) Özgün illüstrasyon (tercih edilen):** kavram şemaları, tablolar, örnek cümle kartları, zaman çizelgeleri, çalışma planları. Sitenin renkleri ve fontlarıyla; açık ve koyu temada okunur. Lisans riski yoktur.
- **A) Ücretsiz ve ticari kullanıma açık stok fotoğraf:** yalnızca Unsplash veya Pexels. Her fotoğrafın sayfası, fotoğrafçısı ve lisansı `images/blog/KAYNAKLAR.md`'ye yazılır; fotoğrafın altına linkli kaynak satırı eklenir (ör. "Fotoğraf: Ad Soyad / Unsplash"). İllüstrasyonlarda kaynak satırı gerekmez.
  Bu sitelere erişim yoksa (ağ izni: `unsplash.com`, `images.unsplash.com`, `www.pexels.com`, `images.pexels.com`) yalnızca özgün illüstrasyon kullanılır ve özette belirtilir.

**Yasaklar:**

- Google Görseller, haber siteleri, başka kurs siteleri veya lisansı belirsiz hiçbir kaynaktan görsel alınmaz.
- Goethe-Institut, telc, ÖSD veya başka kurumların logoları ve marka görselleri kullanılmaz (kurum adı düz yazı olarak geçebilir).
- Tanınmış veya gerçek kişilerin fotoğrafları kullanılmaz. Stok fotoğrafta insan varsa "öğrencim", "sınıfım" gibi sunulmaz; yorum veya başarı hikâyesi ima eden görsel kullanılmaz.
- Gerçek bir pasaport, vize, sertifika veya resmî belgeye benzeyen görsel kullanılmaz.
- Yapay zekâ ile gerçekçi insan fotoğrafı üretilmez.

**Her yazı için:** 1 kapak (başlığın altında) + 1–3 içerik görseli (ilgili bölümün yanında). Her görsel bir şey anlatsın; sayıyı abartma. Alt metin Türkçe ve açıklayıcı olur (görselde ne olduğunu anlatır, anahtar kelime doldurulmaz).

**Dosya düzeni:** `images/blog/<adres>/`

- `kapak.svg` (1200×630, sabit renkler; sitenin `--ba-*` açık tema renkleri, fontlar "Albert Sans" ve "STIX Two Text") → `node scripts/blog-kapak.mjs <adres>` ile `kapak-{480,800,1200}.{webp,jpg}` üretilir. Kapak, yazının OG paylaşım görseli ve BlogPosting şemasındaki `image` olur; blog listesinde ve ana sayfadaki "son yazılar" kartlarında küçük hâli görünür.
- İçerik görselleri: `<ad>.svg`, `viewBox="0 0 560 …"`. Renkler sınıflarla verilir (koyu temaya uyması için): `f-bg`, `f-bg2`, `f-ink`, `f-mut`, `f-acc`, `f-on`, `f-der`/`f-die`/`f-das` (+ `-bg`), `f-ln`, `f-ln-acc`; yazı biçimleri `f-b` (kalın), `f-serif`. Dosyadaki `<style>` yalnızca dosya tek başına açıldığında kullanılır; sayfaya eklenirken çıkarılır ve renkler `css/blog.css`'ten gelir. Mobilde 375 px'te okunması için yazı boyutu en az 17 olsun.
- Stok fotoğraf kullanılırsa: WebP + JPEG yedeği, 480/800/1200 genişlik, `srcset`, `width`/`height`, kapak dışındakiler `loading="lazy"`; her dosya mümkünse 150 KB'ın altında. **AVIF kullanılmaz.**
- `images/blog/KAYNAKLAR.md`: her dosya için kaynak, fotoğrafçı ve lisans (özgün illüstrasyonlar için "Bozkurt Academy için hazırlanan özgün illüstrasyon").

**posts.json alanları:**

```json
"cover": { "alt": "Kapakta ne olduğunu anlatan Türkçe alt metin" },
"figures": [
  { "file": "artikel-renkleri.svg", "after": "2. Adım: Artikelleri kelimeyle birlikte öğren", "alt": "Görseli anlatan Türkçe alt metin" }
]
```

`after`: yazıdaki bir `<h2>`/`<h3>` başlığının metni (birebir). Görsel, o başlıktan sonraki ilk paragrafın (paragraf ":" ile bitiyorsa arkasındaki listenin) arkasına eklenir. Yazı metnine dokunmak gerekmez. Var olan bir yazıya görsel eklenirse `"updated"` o günün tarihi yapılır (şemadaki `dateModified` ve sitemap).

### Geri dönüş linki (kurs ve diğer elle yazılmış sayfalar)

1. Sayfada (ör. `a1-almanca-kursu/index.html`) uygun bir paragrafın sonuna, `</p>`'den hemen önce şu işareti ekle:
   `<!-- ba:blog:<adres> --><!-- /ba:blog:<adres> -->`
2. `posts.json` kaydına `"backlinks": {"/<sayfa>/": "… {link} …"}` ekle. `{link}` yazının başlığıyla linke dönüşür.
3. Taslakken işaretin içi boş kalır; yayınlanınca cümle görünür.
4. İşaretleri SSS (FAQ) cevaplarının içine koyma (şemaya karışır).

Gramer derslerinde ek işaret gerekmez: yayınlanmış yazının link verdiği her gramer dersinde "Blogda bu konu" notu otomatik çıkar.

### Komutlar

```bash
node scripts/build-pages.mjs            # sayfaları ve sitemap'i üret
node scripts/build-pages.mjs --check    # CI ile aynı kontrol
node scripts/check-versions.mjs         # ?v= sürümleri tutarlı mı
```

Kelime sayısı:

```bash
sed -e 's/<[^>]*>//g' _blog/<adres>.html | wc -w
```

İç linklerin varlığı (depo kökünden):

```bash
grep -o 'href="/[^"#?]*' blog/<adres>/index.html | sed 's/href="//' | sort -u | while read p; do [ -e ".${p}index.html" ] || [ -e ".$p" ] || echo "YOK: $p"; done
```

### Tarayıcı kontrolü

Depo kökünden basit bir statik sunucu aç (`python3 -m http.server 8765`) ve Playwright ile `/blog/<adres>/` sayfasını 375 ve 1280 px'te aç.
Koyu tema için `document.documentElement.dataset.theme = 'dark'`. Şunları kontrol et:

- `document.querySelectorAll('h1').length === 1`;
- `document.documentElement.scrollWidth - innerWidth === 0`;
- taslakta `meta[name=robots]` = `noindex`.

`https://www.gstatic.com/**` istekleri bu ortamda engelli olabilir; testte bu istekleri durdurmak sorun değildir.
Ekran görüntülerini depo klasörüne değil, geçici bir klasöre kaydet.

### Resmî linkleri kontrol etmek

- `curl -s -L -o /dev/null -w '%{http_code}' <adres>` → 200 olmalı.
- Bulut ortamında yalnızca izin verilen sitelere erişilir ("bozkurtacademy" ortamında `www.goethe.de` ve `www.telc.net`).
- `www.goethe.de` otomatik isteklere 403 (bot koruması) dönebilir. Bu korumayı atlatmaya çalışma (tarayıcı kimliği taklidi vb. yok). Adres arama sonuçlarında kurumun sayfası olarak görünüyorsa kullanılabilir; görünmüyorsa kurumun ana sayfasına link ver ve özette belirt.
- Daha önce kullanılan ve doğrulanan adresler:
  - Goethe-Institut Türkiye – Sınavlar: `https://www.goethe.de/ins/tr/tr/spr/prf.html`
  - telc – Deutsch-Prüfungen: `https://www.telc.net/sprachpruefungen/zertifikatspruefung/deutsch/`
- Dış linkler yeni sekmede açılır: `target="_blank" rel="noopener"`.

### Mevcut sayfalar (link verirken)

- Kurslar: `/online-almanca-dersi/`, `/almanca-ozel-ders/`, `/almanca-grup-dersi/`, `/a1-almanca-kursu/`, `/a2-almanca-kursu/`, `/b1-almanca-kursu/`, `/b2-almanca-kursu/`, `/almanca-sinav-hazirlik/`, `/iletisim/`.
- Gramer: `/almanca-gramer/`, `/almanca-gramer/a1/…`, `/almanca-gramer/a2/…`, `/almanca-gramer/b1/…` (klasör listesine bak).
- Uygulama: `/#exercises`, `/#exams` (sınav deneme setleri), `/#seviye-testi`.
- Blog: `/blog/` ve `_blog/posts.json`'daki yayınlanmış yazılar. Taslak yazılara link verme.
