# Madde 6: Ücretsiz yapay zekâ araştırması (Schreiben)

Tarih: 2026-11-06. Bu belge yalnızca araştırma ve deneme sonucudur; sitede yapay zekâ kodu yoktur.
Sprechen (ses tanıma) öncelik değişikliğiyle sonraya bırakıldı; şimdiye kadarki tek bulgu en sonda not edildi.

## Kurallar (öğretmenin)

- Ücretli hiçbir şey yok, kredi kartı isteyen servis yok, Firebase Blaze yok. Kota dolunca para kesen değil, duran çözüm.
- Verileri model eğitiminde kullanan servisler kabul edilemez (öğrencilerin bir kısmı reşit değil).
- Kalite Almanca hata bulma ve Türkçe açıklama ile denenecek; yetersizse açıkça söylenecek.

## Servisler (resmî kaynaklardan, 2026-11-06'da okundu)

| Servis | Ücretsiz kota | Kota dolunca | Eğitimde kullanım | Verinin yeri | Kart | Karar |
| --- | --- | --- | --- | --- | --- | --- |
| **Cloudflare Workers AI** (Workers Free) | Günde 10.000 Neuron, 00:00 UTC'de sıfırlanır | "further operations will fail with an error" (durur, ücret yok); fazlası için ücretli plana geçmek gerekir | "Cloudflare does not use Customer Content processed by Workers AI to train AI models." Girdi/çıktı yanıttan sonra saklanmaz (zero data retention) | Cloudflare'in küresel ağı; AB'de işleme taahhüdü yok | Free plan varsayılan | **Uygun aday** |
| **Groq** (Free tier) | Model başına günlük istek/token sınırı (ör. gpt-oss-120b); kesin değer hesap panelinde | 429 hatası (durur); ücretli plana geçiş için kart gerekir | "Groq does not access, use, store, or retain Inputs or Outputs except as necessary to provide the Cloud Services"; varsayılan saklama yok, kötüye kullanım incelemesi için en fazla 30 gün (Zero Data Retention ile kapatılabilir) | ABD (Google Cloud) | Gerekmez | **Yedek aday**; şartlarda "18 yaşından büyük olmalısınız" maddesi var (hesap sahibi öğretmen; öğrencilerin durumu belirsiz) |
| Google Gemini API (ücretsiz kota) | — | — | "Google uses the content you submit … to provide, improve, and develop Google products … and machine learning technologies"; "human reviewers may read" | — | — | **Elendi**: eğitimde kullanım + "18 yaş altına yönelik sitelerde kullanılamaz" |
| Mistral (Studio, ücretsiz mod) | — | — | "we may use your data (input and output) to train our artificial intelligence models" (varsayılan; opt-out var) | — | — | **Elendi**: varsayılan eğitim |
| LanguageTool (ücretsiz API) | Dakikada 20 istek | — | LanguageTool kullanıcılarının girdileri eğitimde kullanılmaz (Individual/Team plan için yazılı; hesapsız API kullanıcıları açıkça anılmıyor) | Almanya | Gerekmez | Yapay zekâ değil, kural tabanlı; **tek başına yetersiz** (aşağıda) |
| Tarayıcıda çalışan modeller (WebLLM vb.) | Sınırsız, cihazda | — | Veri cihazdan çıkmaz | Cihaz | — | Telefona sığan 1–3 milyarlık modeller, aşağıda yetersiz çıkan 12–20 milyarlık modellerden de zayıf; ilk açılışta 1–2 GB indirme. **Uygun değil** |

## Deneme

Beş metin, Türk öğrencilerin tipik hatalarıyla (toplam 16 hata) ve bir hatasız metin:

- T1 A2 e-posta: virgül (weil), fiil ikinci sırada, bei + Dativ, Akkusativ (ein Salat)
- T2 B1 görüş: während + Genitiv, sich konzentrieren, Außerdem + fiil, weil + fiil sonda
- T3 A2 tanıtım: seit + Dativ çoğul, als ich, fiil ikinci sırada ×2
- T4 B1 tatil: **hatasız** (yanlış alarm denemesi)
- T5 A2 konuşma dökümü: fiil ikinci sırada ×2, Akkusativ, Perfekt + haben

Bütün modellere aynı talimat (Türkçe ve Almanca sürümleri denendi): yalnızca gerçek hataları bul, düzelt,
basit Türkçeyle kuralı açıkla, düzeltilmiş metni ver, JSON döndür.

| Model (Cloudflare'deki adı) | Bulunan hata | Hatasız metinde yanlış alarm | Türkçe açıklama | Sonuç |
| --- | --- | --- | --- | --- |
| LanguageTool | 4 / 16 | yok (ama "Elif" adını yazım hatası saydı) | Yok (sadece Almanca) | Yetersiz |
| gpt-oss-20b (`@cf/openai/gpt-oss-20b`) | 15 / 16 | **var**: doğru cümle için uydurma kural | Tutarsız: Türkçe talimata rağmen yarısı Almanca; terim hataları (Dativ'e "belirtme hâli") | Yetersiz |
| Gemma 3 12B (`@cf/google/gemma-3-12b-it`) | 14 / 16 (2'si yanlış düzeltilmiş) | **var**: üç doğru cümleyi listeledi | Türkçe ama sık sık **yanlış kural**: "In meiner Freizeit ich spiele" için "ich gereksizdir" deyip "In meiner Freizeit spiele" önerdi | Yetersiz, yanıltıcı |

Örnek (Gemma 3 12B, T3):
> "Am Wochenende ich gehe" → "Am Wochenende gehe" — "'Am Wochenende' ifadesi zaten özneyi (ben) içerir. Bu yüzden 'ich' gereksizdir."

Doğrusu: "Am Wochenende **gehe ich**"; fiil ikinci sıraya geçer, özne fiilden sonra gelir.

## Sonuç

- Bu ortamda denenebilen ücretsiz modeller (20 milyar parametreye kadar) öğrenciye **doğrudan gösterilecek kalitede değil**.
  Hataları büyük ölçüde buluyorlar, ama Türkçe açıklamaları yanlış ya da tutarsız; hatasız metinde hata uydurabiliyorlar.
- Cloudflare'in ücretsiz katmanındaki büyük modeller bu makineye sığmadığı için **denenmedi**:
  gpt-oss-120b, Llama 3.3 70B, Mistral Small 3.1 24B, Gemma 4 26B. Asıl karar bunlarla verilmeli.
- Karar için kalan deneme: Öğretmen ücretsiz bir Cloudflare hesabı açar (kart istenmez) ve bir API anahtarı verir;
  anahtar oturuma güvenli formla girilir, sohbete yazılmaz. Aynı beş metin bu dört modelle denenir.
  Kalite yeterliyse madde 7 Aşama B; değilse Aşama A öğretmen geri bildirimiyle devam eder.

### Kota tahmini (Cloudflare, günde 10.000 Neuron)

Bir düzeltme yaklaşık 600 girdi + 600 çıktı token (gpt-oss modelleri düşünme adımlarıyla 2.000'e kadar çıktı):

| Model | Neuron / düzeltme | Günde düzeltme | Günde 3 metinle öğrenci |
| --- | --- | --- | --- |
| gemma-4-26b-a4b-it | ~22 | ~450 | ~150 |
| mistral-small-3.1-24b-instruct | ~50 | ~200 | ~65 |
| llama-3.3-70b-instruct-fp8-fast | ~140 | ~70 | ~23 |
| gpt-oss-120b | ~155 | ~65 | ~21 |

Kota bütün site için ortaktır; günlük öğrenci sınırı (3 metin) ayrıca uygulanır. Kota dolunca servis durur, ücret çıkmaz.

## Sprechen için not (sonraya)

Whisper large-v3-turbo (Cloudflare ve Groq'ta ücretsiz) hatalı cümleleri yazıya geçirirken **bazı hataları kendiliğinden düzeltti**:
"mein Freund" → "meinen Freund", "seit zwei Jahre" → "seit zwei Jahren" (7 cümleden 2'si). Kelime sırası ve "sind … getrunken"
hataları olduğu gibi kaldı. Sprechen'e geçildiğinde bu, ek hatalarının gözden kaçabileceği anlamına gelir; ayrıca denenmeli.
