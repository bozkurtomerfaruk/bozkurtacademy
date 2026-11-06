# Çocuk oyunlarının sesleri nasıl üretildi

Sitede ses programı çalışmaz; aşağıdaki adımlar bilgisayarda bir kez çalıştırılır ve çıkan MP3'ler `data/cocuk/ses/`
klasörüne konur. Sonra `node scripts/kids-audio.mjs` listeyi (`data/cocuk/sesler.json`) yeniler.
Lisanslar ve atıf: `data/cocuk/ses/LISANS.md`.

## Kurulum (bir kez)

```bash
python3 -m venv venv
venv/bin/pip install coqui-tts "gruut[de]" torch torchaudio torchcodec soundfile
# Tacotron2 için ayrıca: sudo apt-get install espeak-ng
```

Modeller (Coqui'nin GitHub sürümlerinden; lisans Apache 2.0, ses kayıtları Thorsten-Voice CC0):

- VITS: `https://github.com/coqui-ai/TTS/releases/download/v0.7.0_models/tts_models--de--thorsten--vits.zip`
- Tacotron2: `https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--de--thorsten--tacotron2-DDC.zip`
- HiFi-GAN: `https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/vocoder_models--de--thorsten--hifigan_v1.zip`

## Üretim

```bash
export THORSTEN_VITS=/yol/tts_models--de--thorsten--vits
venv/bin/python scripts/cocuk-ses/uret.py cikti vits Hund:der Katze:die Haus:das
venv/bin/python scripts/cocuk-ses/uret.py cikti cumle Tisch:der      # "Das ist der Tisch." cümlesinden kesilir
THORSTEN_TACO=/yol/tacotron2-DDC THORSTEN_HIFIGAN=/yol/hifigan_v1 venv/bin/python scripts/cocuk-ses/uret.py cikti taco Tasche:die
```

- Her kelime için iki dosya çıkar: `hund.mp3` (artikelsiz, "Dinle" düğmesi) ve `der-hund.mp3` (doğru cevaptan sonra).
- Sessizlik, sesin en yüksek yerinden 50 dB aşağısına göre kırpılır; başa 0,06 sn, sona 0,15 sn pay kalır
  (son ünsüz kesilmesin diye). Ses seviyesi eşitlenir (−16 LUFS), MP3 40 kbit/sn mono.
- gruut bazı kelimeleri yanlış okur (ör. Puppe → "pʊppə"); `IPA_FIX='Puppe=pʊpə'` ile düzeltilir.
- Kısa kelimelerde (Uhr, Ball, Tisch …) tek başına üretim kötü olabilir; `cumle` ya da `taco` yöntemini dene.
  Her yeni ses öğretmen dinleyip onaylamadan siteye konmaz.

## İlk 96 ses (2026-11)

- 41 kelime: `vits` yöntemi (iki biçimde de).
- Wasser, Tisch, Stuhl, Uhr, Ball, Puppe, Tasche: ilk sürümler beğenilmedi; `cumle`, `taco` ve yavaş VITS ile
  238 aday üretildi, her biri için en iyi iki aday öğretmene dinletildi (seçilenler `docs/durum.md`'de).
