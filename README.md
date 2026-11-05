# bozkurtacademy
## PWA / uygulama kurulumu

Site şu an bilerek **web uygulaması (PWA) olarak kurulamaz**: Chrome'un "Uygulamayı yükle / Ana ekrana ekle"
önerisi çıkmasın diye `site.webmanifest` dosyası ve sayfalardaki `<link rel="manifest">` kaldırıldı,
service worker yok. `js/theme.js`, daha önce kaydedilmiş service worker'ları ziyaretçinin tarayıcısından siler.
Favicon'lar, `apple-touch-icon.png`, `android-chrome-*.png` ve `theme-color` meta etiketi yerinde kalır.

Kendi Android uygulaması Play Store'a çıktığında manifest şu alanlarla geri eklenecek; böylece Chrome
siteyi kurmak yerine Play Store uygulamasını önerir:

```json
{
  "name": "Bozkurt Academy",
  "short_name": "Bozkurt Academy",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "prefer_related_applications": true,
  "related_applications": [{ "platform": "play", "id": "<paket-adı>" }]
}
```

Bağlantı satırı (`<link rel="manifest" href="/site.webmanifest">`) `scripts/build-pages.mjs` içindeki ortak
`<head>` bölümüne ve elle yazılmış sayfalara (`index.html`, `giris.html`, `panel.html` …) eklenir.
