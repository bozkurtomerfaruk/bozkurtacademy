# Almanca Alfabe ses dosyalarının lisansları

Bu klasördeki MP3 dosyaları `node scripts/generate-alfabe-audio.mjs` ile, sitenin sahibinin bilgisayarında, açık
kaynaklı ve ticari kullanıma izin veren modellerle bir kez üretildi. Oyun oynanırken hiçbir ses servisine istek gitmez.

| Kullanım | Yazılım / model | Lisans | Eğitim verisi |
| --- | --- | --- | --- |
| Almanca (harf adları, kelimeler, cümleler) | Piper (piper-tts), ses `de_DE-thorsten-medium` (rhasspy/piper-voices) | Model deposu MIT; Piper yazılımı GPL-3.0 (sadece üretimde kullanıldı) | Thorsten-Voice, Thorsten Müller, **CC0**; temel model `nl_BE-rdh-medium`, **CC0** |
| Türkçe (çocuk modu talimatları ve geri bildirimler) | Chatterbox Multilingual (chatterbox-tts), Resemble AI | **MIT** | Resemble AI'ın kendi verisi (model MIT ile ticari kullanıma açık) |
| Kalite kontrolü (sadece en iyi adayı seçmek için, ses üretmez) | faster-whisper (SYSTRAN, MIT) ve Whisper modeli (OpenAI, MIT) | MIT | — |

- CC0 ve MIT atıf zorunluluğu getirmez; yine de teşekkür olarak oyun sayfasında belirtilir.
- Chatterbox her çıktıya duyulmayan bir filigran (Resemble AI "Perth") ekler: sesin yapay olarak üretildiğini gösterir.
- Kullanılmayanlar ve nedenleri (lisans kontrolü, 2026-11): `tr_TR-dfki-medium` (CC BY-NC-SA, ticari değil),
  `de_DE-pavoque-low` (CC BY-NC-SA), `de_DE-thorsten-high`, `tr_TR-fahrettin/fettah-medium` (verisi CC0 ama ticari
  olmayan lisanslı `en_US-lessac` modelinden türetilmiş), `de_DE-thorsten-low`, `de_DE-kerstin-low`, `de_DE-karlsson-low`
  (ticari olmayan lisanslı `en_US-ryan` modelinden türetilmiş), `de_DE-eva_k`, `de_DE-ramona`, `de_DE-karlsson`
  (M-AILABS verisi, lisans metni doğrulanamadı), topluluk Türkçe sesleri `ilkiz`, `Cem` (eğitim verisi belirtilmemiş),
  Coqui `tr/common-voice/glow-tts` (MIT, ama kısa ifadeleri anlaşılmaz okudu).
- Kendi kayıtların (manifest'te `source: "kendi"`) senin malındır.
