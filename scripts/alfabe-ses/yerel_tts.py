"""Almanca Alfabe: yerel (ücretsiz, kartsız) ses üretimi. scripts/generate-alfabe-audio.mjs çağırır; elle çalıştırmaya gerek yok.

Girdi (stdin, JSON): {"models": {...}, "asr": {"model": "medium"} | null,
                     "jobs": [{"id", "lang", "text", "out", "length_scale", "expect", "candidates"}]}
Çıktı: her iş için bir satır JSON {"id", "ok", "phonemes", "heard", "score"} (stdout). WAV dosyaları "out" yoluna yazılır.

"En iyi N" (makine kulağı): faster-whisper kuruluysa ve işte candidates > 1 ise aynı metin N kez üretilir (VITS her
seferinde biraz farklı okur), her aday Whisper ile yazıya dökülür ve beklenen metne ("expect") en çok benzeyen saklanır;
birebir tutan ilk adayda durulur. Whisper tek heceli harf adlarını güvenilir tanımadığı için harflerde kullanılmaz.

- Almanca (de): Piper (piper-tts), model de_DE-thorsten-medium (Thorsten-Voice CC0, temel model nl_BE-rdh CC0).
  Metindeki [[ ... ]] doğrudan fonem olarak okunur (Piper'ın SSML <phoneme> karşılığı): "[[ ˈʏpsilɔn ]]".
- Türkçe (tr): Chatterbox Multilingual (chatterbox-tts, Resemble AI, MIT), modelin kendi sesiyle. Piper'ın tek resmî
  Türkçe sesi (tr_TR-dfki) ticari olmayan lisanslı (CC BY-NC-SA) olduğu için kullanılmaz. Coqui'nin Türkçe modeli
  (MIT) denendi ama kısa ifadeleri anlaşılmaz okudu ("Aferin!" → "Sevin").
- Her klibin başına ve sonuna 80 ms sessizlik eklenir; ffmpeg sonradan kırpar, böylece ilk/son ses kesilmez.
- Chatterbox cümleden sonra bazen nefes, mırıltı ya da tekrar ekler: önce ilk uzun sessizlikte, sonra Whisper'ın kelime
  zamanlarına göre beklenen son kelimeden 150 ms sonra kesilir ve kesilmiş hâl yeniden değerlendirilir.
"""
import difflib
import json
import re
import sys
import wave

import numpy as np

PAD_S = 0.08


def write_wav(path, samples, rate):
    pad = np.zeros(int(rate * PAD_S), dtype=np.float32)
    audio = np.concatenate([pad, np.asarray(samples, dtype=np.float32), pad])
    peak = float(np.max(np.abs(audio))) or 1.0
    audio = audio / peak * 0.9
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes((audio * 32767).astype(np.int16).tobytes())


class German:
    def __init__(self, model):
        from piper import PiperVoice
        self.voice = PiperVoice.load(model)
        self.rate = self.voice.config.sample_rate

    def phonemes(self, text):
        return ' '.join(''.join(p) for p in self.voice.phonemize(text))

    def synth(self, text, length_scale, tone='notr'):
        from piper import SynthesisConfig
        cfg = SynthesisConfig(length_scale=length_scale, normalize_audio=True)
        chunks = [c.audio_float_array for c in self.voice.synthesize(text, syn_config=cfg)]
        return np.concatenate(chunks) if chunks else np.zeros(1, dtype=np.float32), self.rate


def cut_tail(samples, rate, gap_s=0.2, floor_db=-40.0):
    """Chatterbox sometimes goes on after the sentence: a pause, then breath, mumbling or a repetition. Our Turkish clips
    are single short sentences without long pauses inside, so keep the audio up to the first silence of gap_s seconds
    after speech has started."""
    a = np.abs(np.asarray(samples, dtype=np.float32))
    peak = float(a.max()) or 1.0
    win = int(rate * 0.02)
    loud = [20 * np.log10(max(float(a[i:i + win].max()), 1e-9) / peak) > floor_db for i in range(0, len(a) - win, win)]
    need = int(gap_s / 0.02)
    started, quiet = False, 0
    for k, on in enumerate(loud):
        if on:
            started, quiet = True, 0
        elif started:
            quiet += 1
            if quiet >= need:
                end = (k - quiet + 1) * win + int(rate * 0.1)  # keep 100 ms after the last sound
                return np.asarray(samples[:end], dtype=np.float32)
    return np.asarray(samples, dtype=np.float32)


class Turkish:
    """Chatterbox Multilingual (Resemble AI, MIT): Turkish with the model's built-in voice. Each output carries Resemble's
    inaudible Perth watermark (marks the audio as generated)."""
    def __init__(self, models):
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
        self.model = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
        self.rate = self.model.sr

    def phonemes(self, text):
        return ''

    def synth(self, text, length_scale, tone='notr'):
        # Children's mode: warmer (more expressive) and calmer; cfg_weight below 0.5 slows the pace a little.
        warm = tone == 'cocuk'
        wav = self.model.generate(text, language_id='tr', exaggeration=0.65 if warm else 0.5,
                                  cfg_weight=0.4 if warm else 0.5, temperature=0.8)
        return cut_tail(wav.squeeze().cpu().numpy().astype(np.float32), self.rate), self.rate


def norm(text):
    return re.sub(r'\s+', ' ', re.sub(r'[.,!?:;„“"\-]', ' ', text.lower())).strip()


class Ear:
    """Whisper (faster-whisper, MIT) as a judge: how well is a candidate understood?"""
    def __init__(self, model):
        from faster_whisper import WhisperModel
        self.model = WhisperModel(model, device='cpu', compute_type='int8')

    def hear(self, samples, rate, lang, words=False):
        """The text Whisper hears; with words=True also the end of each word (seconds in the given samples)."""
        a = np.asarray(samples, dtype=np.float32)
        a = np.interp(np.arange(0, len(a), rate / 16000), np.arange(len(a)), a).astype(np.float32)
        a = np.concatenate([np.zeros(8000, np.float32), a / (float(np.max(np.abs(a))) or 1.0) * 0.9, np.zeros(8000, np.float32)])
        segments, _ = self.model.transcribe(a, language=lang, beam_size=5, condition_on_previous_text=False, word_timestamps=words)
        segments = list(segments)
        text = ' '.join(x.text.strip() for x in segments)
        if not words:
            return text
        ends = [w.end - 0.5 for x in segments for w in (x.words or [])]  # 0.5 s of padding was added in front
        return text, ends


def cut_after_words(samples, rate, ends, count):
    """Keep the audio up to the end of word number `count` (+150 ms): drops a stray tail after the sentence."""
    if count < 1 or len(ends) < count:
        return samples
    return samples[:min(len(samples), int((ends[count - 1] + 0.15) * rate))]


def make_ear(req):
    if not req.get('asr'):
        return None
    try:
        return Ear(req['asr'].get('model', 'medium'))
    except Exception as error:  # faster-whisper not installed: one candidate per clip
        emit({'warning': f'Whisper yok, en iyi N kapalı: {error}'})
        return None


OUT = sys.stdout


def emit(obj):
    print(json.dumps(obj, ensure_ascii=False), file=OUT, flush=True)


def main():
    sys.stdout = sys.stderr  # libraries print progress; only our result lines go to the real stdout
    req = json.load(sys.stdin)
    models = req['models']
    engines = {}
    ear = make_ear(req)
    for job in req['jobs']:
        lang = job['lang']
        try:
            if lang not in engines:
                engines[lang] = German(models['de']) if lang == 'de' else Turkish(models)
            eng = engines[lang]
            n = job.get('candidates', 1) if ear and job.get('expect') else 1
            best = None
            for _ in range(max(1, n)):
                samples, rate = eng.synth(job['text'], job.get('length_scale', 1.0), job.get('tone', 'notr'))
                if n > 1 and lang == 'tr':
                    # Chatterbox may go on after the sentence (breath, mumbling, a repetition): cut after the last
                    # expected word, then judge the cut take again.
                    _, ends = ear.hear(samples, rate, lang, words=True)
                    samples = cut_after_words(samples, rate, ends, len(norm(job['expect']).split()))
                heard = ear.hear(samples, rate, lang) if n > 1 else None
                score = round(difflib.SequenceMatcher(None, norm(heard), norm(job['expect'])).ratio(), 2) if heard is not None else None
                # A take much longer than the text needs has a stray tail (mumbling, breath): worse.
                if score is not None and len(samples) / rate > 0.12 * len(job['expect']) + 1.8:
                    score = round(score * 0.8, 2)
                if best is None or (score or 0) > (best[3] or 0):
                    best = (samples, rate, heard, score)
                if score == 1.0:
                    break
            samples, rate, heard, score = best
            write_wav(job['out'], samples, rate)
            emit({'id': job['id'], 'ok': True, 'phonemes': eng.phonemes(job['text']), 'heard': heard, 'score': score})
        except Exception as error:  # report and go on with the next clip
            emit({'id': job['id'], 'ok': False, 'error': str(error)})


def prefetch(asr_model):
    """--indir: download the Turkish voice (Chatterbox) and the Whisper model once (into HF_HOME)."""
    Turkish({})
    if asr_model:
        Ear(asr_model)


if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--indir':
        prefetch(sys.argv[2] if len(sys.argv) > 2 else '')
    else:
        main()
