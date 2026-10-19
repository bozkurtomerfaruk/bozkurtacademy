# Sınav setleri: dosya formatı

Sınav Hazırlığı bölümündeki görevler (ör. Goethe B1 Lesen) birer JSON dosyasıdır. `js/exam-task.js` bu dosyaları oynatır, `scripts/check-exams.mjs` kontrol eder.

## 1. Dosyanın yeri ve examsData.js kaydı

```
data/exams/<sınav>/<seviye>/<bölüm>/teil-<n>/<set>.json
data/exams/goethe/b1/lesen/teil-1/set-1.json
```

`js/examsData.js` içinde ilgili Teil'in `exercises` dizisine ekleyin:

```js
{
  title: { tr: 'Blog yazısı veya e-posta · richtig/falsch', de: '…', en: '…' },  // isteğe bağlı
  exercises: [
    { set: 'set-1', title: 'Neu im Dorf' },
    { set: 'set-2', title: 'Ferien im Tierheim' }
  ]
}, // Teil 1
```

Set şu adresten açılır: `#exams/goethe/b1/lesen/1/set-1`. DTZ gibi seviye adımı olmayan sınavlarda seviye klasörü yine yazılır (`data/exams/dtz/a2-b1/lesen/teil-1/set-1.json`), adreste görünmez (`#exams/dtz/lesen/1/set-1`).

## 2. Dosyanın içi

```json
{
  "format": 1,
  "exam": "goethe", "level": "b1", "section": "lesen", "teil": 1, "set": "set-1",
  "title": "Neu im Dorf",
  "minutes": 10,
  "context": "İsteğe bağlı giriş cümlesi (Almanca).",
  "instructions": "Lesen Sie den Text und die Aufgaben 1 bis 6. …",
  "groups": [ { … }, { … } ]
}
```

- `exam`, `level`, `section`, `teil`, `set`: dosyanın klasörüyle aynı olmalı.
- `minutes`: tahmini süre (dakika), ekranda gösterilir.
- `groups`: Bir grup, yan yana gösterilen metin(ler) ve sorulardır. Teil 2'de her haberin kendi sorularıyla iki grup vardır; diğer Teil'lerde tek grup.

### Grup

```json
{
  "layout": "article",
  "question": "Ist die Person für …?",
  "texts": [ … ],
  "questions": [ … ]
}
```

- `layout`: `article` (normal metin), `ads` (ilanlar, iki sütun), `comments` (okur yorumları), `gaps` (önce boşluklu metin, altında yerleştirilecek kısa cümleler/başlıklar listesi).
- `question`: yalnızca Teil 4 gibi bütün soruların aynı olduğu durumlarda, soruların üstünde gösterilir.
- `none`: eşleştirmede „uygun ilan yok“ seçeneğinin adı. Yazılmazsa `0` (Goethe B1); Goethe A2 Teil 4'te `"x"` (ekranda X); böyle bir seçenek yoksa `false` (Goethe B2). Cevap anahtarında da aynı değer kullanılır (`"answer": "x"`).
- Eşleştirmede seçenekler yalnızca `label`'ı olan metinlerdir; `label`'sız metinler (ör. boşluklu makale, başlığı aranan bölümler) okunacak metindir.

### Metin

```json
{
  "id": "blog",
  "label": "a",
  "title": "Mein erstes halbes Jahr auf dem Land",
  "byline": "Lenas Blog",
  "paragraphs": [
    "Birinci paragraf …",
    { "heading": "Ruhezeiten" },
    "Bir sonraki paragraf …"
  ]
}
```

- `id`: grup içinde benzersiz; açıklamalardaki alıntılar buna işaret eder.
- `label`: ilan harfi (a–j) veya yorum numarası (0, 20…). Eşleştirme sorularında zorunludur.
- Boşluklar (Goethe B2 Teil 2, DTZ Teil 5): düz metnin içinde `{{10}}` numaralı bir boşluktur; DTZ Teil 5'te her boşluk bir `abc` sorusudur ve boşlukta seçilen kelime görünür; her boşluk grubun bir sorusuna karşılık gelir (soru numarası = boşluk numarası, `zuordnung`, seçenekler a–h cümleleri). Örnek boşluk `{{0=Örnek cümle.}}` olarak metne yazılır ve dolu gösterilir. Alıntılar boşluk işareti içeremez; boşluğun önündeki veya arkasındaki cümle alıntılanır.
- `paragraphs`: düz metin; `{ "heading": "…" }` ara başlıktır (kurallar, duyurular); `{ "rows": [["3. Stock", "Spielwaren, Bücher"], …] }` bir tablodur (kat rehberi, bilgi panosu, program). Her satırda en az iki hücre olur, ilk hücre satır başlığı olarak gösterilir. Alıntılar (`evidence`) tablo hücrelerinde de aranır; bir alıntı tek bir hücrenin içinde kalmalıdır.

### Soru

```json
{
  "number": 2,
  "type": "richtig-falsch",
  "prompt": "Lena fährt meistens mit dem Bus zur Arbeit.",
  "answer": "falsch",
  "evidence": [{ "text": "blog", "quote": "deshalb fahre ich fast immer mit dem Auto" }],
  "explanation": "Türkçe açıklama: doğru cevabın metnin neresine dayandığı ve çeldiricinin neden yanlış olduğu."
}
```

| `type` | Cevap seçenekleri | `answer` |
|---|---|---|
| `richtig-falsch` | Richtig / Falsch | `richtig` veya `falsch` |
| `ja-nein` | Ja / Nein | `ja` veya `nein` |
| `abc` | `"options": { "a": "…", "b": "…", "c": "…" }` | `a`, `b` veya `c` |
| `zuordnung` | grubun metinlerinin `label`'ları + `0` (veya grubun `none` değeri) | ör. `e`, `0` veya `x` |

- `number`: sınavdaki numara (Teil 1: 1–6, Teil 2: 7–12, Teil 3: 13–19, Teil 4: 20–26, Teil 5: 27–30; Goethe A2: Teil 1: 1–5, Teil 2: 6–10, Teil 3: 11–15, Teil 4: 16–20; Goethe B2: Teil 1: 1–9, Teil 2: 10–15, Teil 3: 16–21, Teil 4: 22–27, Teil 5: 28–30; DTZ Lesen: Teil 1: 21–25, Teil 2: 26–30, Teil 3: 31–36, Teil 4: 37–39, Teil 5: 40–45, çünkü 1–20 Hören'e ait). Numaralar ardışık olmalı.
- `"example": true` ve `"number": 0`: örnek soru. Cevabı işaretli gösterilir, puana dahil değildir. Bir sette en fazla bir örnek olabilir.
- `evidence`: cevabın dayandığı yerler. `quote`, `text` ile belirtilen metinde **harfi harfine ve yalnızca bir kez** geçmeli. Aynı metindeki alıntılar birbiriyle çakışmamalı. "Kontrol et"ten sonra bu yerler metinde soru numarasıyla vurgulanır. Cevabı `0` olan eşleştirme sorusunda boş bırakılabilir; tuzak ilanı göstermek için kullanılabilir.
- `explanation`: Türkçe, en az 40 karakter.

## 3. Kontrol

```
node scripts/check-exams.mjs
```

Betik bütün setleri açar (yalnızca bazılarını kontrol etmek için: `node scripts/check-exams.mjs teil-3/set-4`); dosya yolu, soru türleri, cevaplar, alıntılar ve numaralar için hata verir; her setin cevap dağılımını ve kelime sayılarını yazar. GitHub'da `data/exams/**` veya `js/examsData.js` değişince otomatik çalışır.

## 4. İçerik kuralları

- Metinler, isimler ve kurgu tamamen orijinal olur; resmi Modellsatz'lardan, kitaplardan veya sitelerden yalnızca format (metin türü, uzunluk, soru sayısı ve türü) alınır. Kişi, şirket ve yer adları kurgusaldır.
- Her sorunun tek ve metinden kanıtlanabilen bir doğru cevabı vardır. Çeldiriciler metindeki kelimeleri kullanabilir, ama yanlış oldukları metinden gösterilebilmelidir.
- Doğru cevaplar dengeli dağılır.
- Türkçe açıklamalar metinde açıkça yazmayan bilgi eklemez (kişilerin rolü, bir şeyin sebebi, metinde geçmeyen bir yer veya kural vb.). Bir bilgi açıklamada gerekiyorsa önce metne yazılır.
- Seçenekler ile metin arasında zorunluluk ve olasılık derecesi (müssen, sollen, dürfen, können; „bitte …“ ricası) tutarlıdır. Metin „bitte eintragen“ diyorsa seçenek „muss man“ demez. Fark bilinçli bir çeldiriciyse açıklamada belirtilir.
- Büyük harfle başlayan zamirler (Ihr/ihr, Sie/sie, Ihnen/ihnen) hitap biçimiyle karışmayacak şekilde kullanılır. Cümle başında „ihre“ (onların/onun) gerekiyorsa cümle yeniden kurulur (ör. „Die Abholung …“).
- Çeldiriciler metni okumadan elenebilecek kadar uç olmaz: „nur“, „alle“, „nie“, „immer“, „ganz“, „jeder“ gibi aşırı ifadelerle değil, metinde gerçekten geçen ama yanlış kişiye, zamana, yere veya sebebe bağlanmış bilgilerle kurulur. Doğru cevap da her zaman en ılımlı seçenek olmamalı.
- Teil 4'te (okur yorumları) her sette en az 2–3 yorum hükmünü baştaki ilk cümlede değil, ortada veya sonda verir ya da önce karşı görüşü kabul edip sonra kendi tarafını belirtir. „Natürlich … Aber …“, „Ich bin dafür, aber nur, wenn …“ gibi kalıplar bir sette en fazla bir kez kullanılır ve setler arasında çeşitlendirilir. Her yorumun cevabı yine tek ve tartışmasızdır.
- Aynı kalıp setler arasında tekrarlanmaz: aynı soru tipi (ör. „Fikir kimden çıktı?“), aynı metin sonu (ör. „daha büyük yer / daha fazla gönüllü aranıyor“), bir sette aynı yer adının birçok ilanda geçmesi gibi.
- Seçenekler ve doğru cevap yalnızca çıkarımla elde edilen bilgilere dayanmaz (ör. metin „yaklaşık yarısı engelli“ diyorsa seçenek „engelli ve engelsiz çalışanlar şu bölümlerde“ demez); metindeki göndermeler dilbilgisi olarak tutarlıdır (ör. tek bir sorudan sonra „solche Fragen“ yazılmaz).
- Seçenekli sorularda (özellikle Goethe A2 Teil 1 ve Teil 3) doğru şık metindeki cümleyi kelimesi kelimesine tekrar etmez; aynı bilgi seviyeye uygun eş anlamlı kelimelerle veya farklı bir yapıyla ifade edilir. Çeldiriciler metinde geçen kelimeleri yanlış bağlamda kullanabilir.
- Eşleştirmede „uygun ilan yok“ (0 / X) tuzakları setler arasında çeşitlenir: her sette farklı bir sebebe dayanır (yer, gün/saat, hedef kitle, hizmet türü, sayı/fiyat/süre vb.); aynı Teil'de iki set aynı tür sebebi kullanmaz.
- Soru köklerinde, seçeneklerde ve metinlerde zamir (er/sie/ihm/ihn …) iki kişiden hangisine gönderme yaptığı belirsiz kalacaksa zamir yerine isim yazılır (ör. „Marco fragt Hakan, ob Hakan …“). Rollerin yer değiştirmesine dayanan çeldiriciler (davet eden/davet edilen, yazan/okuyan) bir sette en fazla bir kez kullanılır.
- Çeldiriciler dünya bilgisiyle veya mantıkla, metni okumadan elenemez (ör. 22 yaşındaki birinin „40 yıl“ çalışmış olması, bir dans öğretmeninin „öğrencilerden kötü dans etmesi“). Çeldirici, metinde gerçekten geçen ama yanlış kişiye, zamana veya duruma bağlanmış bir bilgiye dayanır.
- Goethe B2 Teil 1'de kişilerin görüşleri birbirine yakın olur (hepsi aynı konuda, kısmen benzer argümanlarla), ama her ifade metinden kanıtlanabilir biçimde yalnızca tek bir kişiye aittir; diğer kişilerin metinleri o ifadeyi açıkça desteklemez veya ona karşıdır.
- Goethe B2 Teil 2'de artan cümleler konuya uygun olur, ama boşluğun öncesi ve sonrasıyla bağlantısı (bağlaç, zamir, zaman, mantık sırası) tutmaz. Hiçbir boşluk yalnızca bir dilbilgisi ipucuyla (ör. tekil/çoğul zamir, „dennoch/deshalb“) çözülemez; doğru cümle içerik olarak da bağlanmalıdır.
- Goethe B2 Teil 3'te sorular ve doğru şıklar metindeki cümleyi tekrar etmez; doğru cevap birden fazla cümleyi birleştirmeyi veya yazarın tutumunu çıkarmayı gerektirir. Çeldiriciler metinde geçen bilgileri yanlış ilişkilendirir.
- Goethe B2 Teil 2'de artan cümleler de doğru cümleler gibi gönderme sözcükleri ve bağlaçlarla başlar (ör. „Dort …“, „Er …“, „Den Rest …“, „Deshalb …“, „Trotzdem …“); böylece bir gönderme sözcüğü birden fazla cümleye uyar ve boşluk ancak içerikle çözülür.
- Eşleştirmeli bölümlerde (Goethe B2 Teil 1 ve 4) ifadeler metinle eş anlamlı ifadelerle eşleşir; aynı içerik sözcüğü (isim, fiil, sıfat; kök olarak da, ör. „Fehltage“/„fehlen“) hem ifadede hem de ait olduğu metinde geçmez.
- Başlık eşleştirmede (Goethe B2 Teil 5) artan başlıklar bölümlerle konu olarak ilişkilidir (aynı belgenin bir bölümüne ait olabilecek bir konu, en az bir bölümle ortak bir alan), ama hiçbir bölümün ana içeriğine tam uymaz; artan başlığın neden uymadığı bölümün metninden gösterilebilir.
- Yeni bir set, cevap anahtarına bakmadan baştan çözülüp anahtarla karşılaştırılır.
- Her yeni set grubu yazıldıktan sonra, setleri yazmamış ve konuşmanın bağlamını görmeyen bir alt ajanla bağımsız doğrulama yapılır: Ajana yalnızca cevapsız kopyalar (metinler, sorular, seçenekler; örnek soruların basılı çözümü hariç cevap ve açıklama yok) verilir. Ajan sınava giren bir öğrenci gibi çözer; her soru için cevabını, dayandığı cümleyi ve emin olup olmadığını yazar. Sonuç anahtarla karşılaştırılır; uyuşmayan, emin olunamayan ve ajanın fark ettiği sorunlar raporda listelenir ve düzeltmeden önce onaya sunulur.
