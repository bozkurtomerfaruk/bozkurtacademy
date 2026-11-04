# Gramer yorumlarının yönetimi

Öğrenci, konu altındaki isim/e-posta formundan yorum gönderir. Web3Forms (genel erişim anahtarıyla) yorumu `bozkurtt.omerfaruk@gmail.com` adresine iletir. E-postanın konusu hangi anlatımla ilgili olduğunu gösterir. E-postada ders adı (`ders`), ders bağlantısı (`ders_linki`), JSON anahtarı (`yorum_anahtari`, ör. `A1/artikel`) ve yayın onayı da bulunur.

Yorumlar otomatik olarak herkese açık yayımlanmaz. Spam veya kişisel bilgi içeren yorumları yayımlamadan önce inceleyin. Onaylanan yorumu `data/grammar-comments.json` dosyasında `SEVİYE/ders-kimliği` anahtarının (ör. `A1/artikel`) altına ekleyip GitHub Pages ile yayımlayın. Adım adım anlatım: `SEO-YAPILACAKLAR.md`, bölüm 1. Bu dosyaya e-posta adresi, özel iletişim bilgisi veya henüz onaylanmamış yorum eklemeyin.

Örnek şema (örnek kişiyi gerçek yorum olarak yayımlamayın):

```json
{
  "A1/praesens": [
    {
      "name": "Öğrencinin yayımlamayı onayladığı adı",
      "date": "2026-10-07",
      "comment": "İncelenmiş yorum metni",
      "reply": "İsteğe bağlı eğitmen yanıtı"
    }
  ]
}
```

`reply` alanı isteğe bağlıdır. Ders kimlikleri `data/<seviye>-grammar.json` içindeki `id` alanlarıyla aynıdır. `node scripts/check-comments.mjs` (CI: Grammar coverage) anahtarları, tarihleri ve alanları denetler; e-posta adresi veya telefon numarası içeren kaydı reddeder. Yorumu kaldırmak için ilgili kaydı bu dosyadan silip yeniden yayımlayın. Sayfa metinleri HTML olarak çalıştırmaz; isim, yorum ve yanıtlar `textContent` ile düz metin olarak gösterilir. Onaylı yorum yoksa "Öğrenci yorumları" bölümü hiç görünmez.

Web3Forms, sitenin iletişim formuyla aynı erişim anahtarını ve alıcıyı kullanır. Erişim anahtarı Web3Forms panelinde bu alıcı adresi için oluşturulmuştur. Sitenin tarayıcı kontrolleri gerçek kişilere deneme e-postası göndermez; testler gönderim uç noktasını taklit eder. Canlı ortamda e-posta teslimi sağlayıcının çalışmasına ve alıcı aktivasyonuna bağlıdır.

Bu sürüm manuel moderasyon kullanır; tarayıcıda herkese açık bir yönetim paneli veya otomatik yayımlama özelliği yoktur. Özel bir yorum veritabanına geçilirse gönderim ve moderasyonun sunucuda uygulanması gerekir. Tarayıcıdaki gizli alan ve kısa bekleme yalnızca basit tekrar gönderimleri azaltır.

