# Artikel Evleri kelime sesleri: tek başına ("Hund") ve artikelle ("der Hund") MP3 üretir. Sitede çalışmaz; README.md'ye bak.
#   python uret.py OUT_DIR YONTEM KELIME:ARTIKEL [...]      ör. python uret.py out vits Hund:der Katze:die
# YONTEM: vits  → "Hund." (VITS)
#         cumle → "Das ist der Hund." cümlesinden kelime kesilir (VITS süreleriyle; başlangıç en sessiz ana kaydırılır)
#         taco  → "Hund." (Tacotron2-DDC + HiFi-GAN; THORSTEN_TACO ve THORSTEN_HIFIGAN ortam değişkenleri)
# İsteğe bağlı: SEED=0, IPA_FIX='Puppe=pʊpə' (gruut'un yanlış verdiği okunuşu düzeltir).
import os, sys, subprocess, tempfile
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from trim import trim


def slug(s):
    s = s.lower()
    for a, b in [('ä', 'ae'), ('ö', 'oe'), ('ü', 'ue'), ('ß', 'ss'), (' ', '-')]:
        s = s.replace(a, b)
    return s


def mp3(wav, sr, path):
    with tempfile.NamedTemporaryFile(suffix='.wav') as t:
        sf.write(t.name, trim(wav, sr), sr)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', t.name, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                        '-ar', '22050', '-ac', '1', '-codec:a', 'libmp3lame', '-b:a', '40k', path], check=True)


def main():
    out, method, pairs = sys.argv[1], sys.argv[2], [p.split(':') for p in sys.argv[3:]]
    os.makedirs(out, exist_ok=True)
    seed = int(os.environ.get('SEED', '0'))
    fix = dict(x.split('=') for x in os.environ.get('IPA_FIX', '').split(',') if x)
    if method == 'taco':
        from TTS.utils.synthesizer import Synthesizer
        T, V = os.environ['THORSTEN_TACO'], os.environ['THORSTEN_HIFIGAN']
        S = Synthesizer(tts_checkpoint=T + '/model_file.pth', tts_config_path=T + '/config.json',
                        vocoder_checkpoint=V + '/model_file.pth.tar', vocoder_config=V + '/config.json', use_cuda=False)
        for w, a in pairs:
            for text, name in [(w, w), (f'{a.capitalize()} {w}', f'{a} {w}')]:
                mp3(np.array(S.tts(text + '.'), dtype='float32'), S.output_sample_rate, f'{out}/{slug(name)}.mp3')
        return
    import vits

    def ipa(text, w):
        p = vits.ipa(text).rstrip('.')
        return p.replace(vits.ipa(w).rstrip('.'), fix[w]) if w in fix else p

    for w, a in pairs:
        art = ipa(f'{a} {w}', w)
        if method == 'vits':
            mp3(vits.synth(ipa(w, w) + '.', seed=seed), vits.SR, f'{out}/{slug(w)}.mp3')
            mp3(vits.synth(art + '.', seed=seed), vits.SR, f'{out}/{slug(f"{a} {w}")}.mp3')
        elif method == 'cumle':
            s = 'das ɪst ' + art + '.'
            start = len('das ɪst ')
            mp3(vits.synth(s, seed=seed, cut=(start + art.index(' ') + 1, len(s) - 1)), vits.SR, f'{out}/{slug(w)}.mp3')
            mp3(vits.synth(s, seed=seed, cut=(start, len(s) - 1)), vits.SR, f'{out}/{slug(f"{a} {w}")}.mp3')
        else:
            sys.exit('YONTEM: vits, cumle ya da taco')


if __name__ == '__main__':
    main()
