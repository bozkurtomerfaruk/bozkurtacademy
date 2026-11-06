# Çocuk oyunlarının ses dosyaları: lisans ve atıf

Bu klasördeki MP3 dosyaları (Artikel Evleri'nde kelimelerin okunuşu) bilgisayarda, internete bağlanmadan,
yapay zekâ ile seslendirme (TTS) yöntemiyle üretildi. Kimseye ait gerçek bir kayıt kesiti değildir.

- **Ses:** Thorsten-Voice, Thorsten Müller'in kendi sesiyle kaydettiği Almanca veri seti.
  Lisans: **CC0 1.0** (kamu malı). <https://github.com/thorstenMueller/Thorsten-Voice>
- **Modeller (Coqui TTS):**
  - `tts_models/de/thorsten/vits`: Thorsten-Voice ile eğitilmiş VITS modeli.
  - `tts_models/de/thorsten/tacotron2-DDC` ve `vocoder_models/de/thorsten/hifigan_v1`: Thorsten-Voice ile eğitilmiş
    Tacotron2 modeli ve HiFi-GAN ses üreticisi; yalnızca bazı kelimelerin seçilen sürümlerinde kullanıldı.

  Hepsinin lisansı: **Apache License 2.0** (Coqui'nin resmî model listesi, `TTS/.models.json`).
  Lisans metni: [LICENSE-Apache-2.0.txt](LICENSE-Apache-2.0.txt).
  <https://github.com/coqui-ai/TTS>
- **Program:** Coqui TTS (`coqui-tts` paketi, MPL-2.0); telaffuz için gruut (MIT), Tacotron2'de espeak-ng.
  Bu programlar yalnızca dosyaları üretmek için kullanıldı; sitede çalışmazlar.

Hiçbir lisans ticari kullanımı yasaklamaz; Apache 2.0, bu atıf ile lisans metninin korunmasını ister.
Ticari kullanımı yasaklayan sesler (Piper'ın Ryan'dan türetilmiş Almanca sesleri, pavoque, XTTS, YourTTS) kullanılmadı.

Üretim yöntemi ve betikler: `scripts/cocuk-ses/README.md`.
