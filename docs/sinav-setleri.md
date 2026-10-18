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

- `layout`: `article` (normal metin), `ads` (ilanlar, iki sütun), `comments` (okur yorumları).
- `question`: yalnızca Teil 4 gibi bütün soruların aynı olduğu durumlarda, soruların üstünde gösterilir.
- `none`: eşleştirmede „uygun ilan yok“ seçeneğinin adı. Yazılmazsa `0` (Goethe B1); Goethe A2 Teil 4'te `"x"` (ekranda X). Cevap anahtarında da aynı değer kullanılır (`"answer": "x"`).

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

- `number`: sınavdaki numara (Teil 1: 1–6, Teil 2: 7–12, Teil 3: 13–19, Teil 4: 20–26, Teil 5: 27–30; Goethe A2: Teil 1: 1–5, Teil 2: 6–10, Teil 3: 11–15, Teil 4: 16–20). Numaralar ardışık olmalı.
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
- Yeni bir set, cevap anahtarına bakmadan baştan çözülüp anahtarla karşılaştırılır.
- Her yeni set grubu yazıldıktan sonra, setleri yazmamış ve konuşmanın bağlamını görmeyen bir alt ajanla bağımsız doğrulama yapılır: Ajana yalnızca cevapsız kopyalar (metinler, sorular, seçenekler; örnek soruların basılı çözümü hariç cevap ve açıklama yok) verilir. Ajan sınava giren bir öğrenci gibi çözer; her soru için cevabını, dayandığı cümleyi ve emin olup olmadığını yazar. Sonuç anahtarla karşılaştırılır; uyuşmayan, emin olunamayan ve ajanın fark ettiği sorunlar raporda listelenir ve düzeltmeden önce onaya sunulur.
