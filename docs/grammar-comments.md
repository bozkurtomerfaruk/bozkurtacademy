# A1 gramer yorumlarının yönetimi

Öğrenci, konu altındaki isim/e-posta formundan yorum gönderir. Mevcut FormSubmit altyapısı yorumu `bozkurtt.omerfaruk@gmail.com` adresine iletir. E-postanın konusu hangi A1 anlatımıyla ilgili olduğunu gösterir. Yayın onayı, konu kimliği ve sayfa bağlantısı da iletilir.

Yorumlar otomatik olarak herkese açık yayımlanmaz. Spam veya kişisel bilgi içeren yorumları yayımlamadan önce inceleyin. Onaylanan yorumu `data/grammar-comments.json` dosyasında ilgili konu kimliğinin altına ekleyip GitHub Pages ile yayımlayın. Bu dosyaya e-posta adresi, özel iletişim bilgisi veya henüz onaylanmamış yorum eklemeyin.

Örnek şema (örnek kişiyi gerçek yorum olarak yayımlamayın):

```json
{
  "praesens": [
    {
      "name": "Öğrencinin yayımlamayı onayladığı adı",
      "date": "2026-10-07",
      "comment": "İncelenmiş yorum metni",
      "reply": "İsteğe bağlı eğitmen yanıtı"
    }
  ]
}
```

`reply` alanı isteğe bağlıdır. Konu kimlikleri `data/a1-grammar.json` içindeki `id` alanlarıyla aynıdır. Yorumu kaldırmak için ilgili kaydı bu dosyadan silip yeniden yayımlayın. Sayfa metinleri HTML olarak çalıştırmaz; isim, yorum ve yanıtlar metin olarak gösterilir.

FormSubmit, sitenin iletişim formuyla aynı alıcıyı kullanır. Alıcı ilk kez kullanılıyorsa FormSubmit aktivasyon e-postasını alıcı hesabında onaylamak gerekir. Sitenin tarayıcı kontrolleri gerçek kişilere deneme e-postası göndermez; testler gönderim uç noktasını taklit eder. Canlı ortamda e-posta teslimi sağlayıcının çalışmasına ve alıcı aktivasyonuna bağlıdır.

Bu sürüm manuel moderasyon kullanır; tarayıcıda herkese açık bir yönetim paneli veya otomatik yayımlama özelliği yoktur. Özel bir yorum veritabanına geçilirse gönderim ve moderasyonun sunucuda uygulanması gerekir. Tarayıcıdaki gizli alan ve kısa bekleme yalnızca basit tekrar gönderimleri azaltır.

