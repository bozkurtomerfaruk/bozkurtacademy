# Coqui VITS (Thorsten): ses birimleri (IPA) doğrudan verilir; süre tahmininden kelime kesilir. uret.py kullanır.
# VITS (Thorsten) with direct IPA input, timing from the duration predictor, and optional cut of one phrase.
import torch, numpy as np, logging
logging.disable(logging.WARNING)
from TTS.utils.synthesizer import Synthesizer
from TTS.tts.utils.text.phonemizers import get_phonemizer_by_name
import os
M = os.environ['THORSTEN_VITS']  # klasör: model_file.pth + config.json
S = Synthesizer(tts_checkpoint=M + '/model_file.pth', tts_config_path=M + '/config.json', use_cuda=False)
model, tok = S.tts_model, S.tts_model.tokenizer
SR, HOP = 22050, 256
G2P = get_phonemizer_by_name('gruut', language='de-de')
def ipa(text): return G2P.phonemize(text, separator='')
def synth(ipa_text, length_scale=1.0, noise=0.667, noise_dp=0.8, seed=0, cut=None):
    """cut: (start_char, end_char) in ipa_text (end exclusive). Returns float32 wave."""
    torch.manual_seed(seed)
    ids = tok.encode(ipa_text)
    assert len(ids) == len(ipa_text), ('unknown char', ipa_text)
    if tok.add_blank: ids = tok.intersperse_blank_char(ids)
    off = 1 if tok.use_eos_bos else 0
    if tok.use_eos_bos: ids = tok.pad_with_bos_eos(ids)
    model.length_scale, model.inference_noise_scale, model.inference_noise_scale_dp = length_scale, noise, noise_dp
    with torch.no_grad():
        o = model.inference(torch.LongTensor(ids).unsqueeze(0))
    wav = o['model_outputs'].squeeze().numpy().astype('float32')
    if cut is None: return wav
    d = o['durations'].squeeze().numpy().astype(int)
    starts = np.concatenate([[0], np.cumsum(d)[:-1]])
    tidx = lambda c: off + (2 * c + 1 if tok.add_blank else c)
    a_tok = tidx(cut[0]) - (1 if tok.add_blank else 0)      # include the blank before the first sound
    b_tok = tidx(cut[1] - 1) + (1 if tok.add_blank else 0)  # and the blank after the last one
    a = starts[a_tok] * HOP; b = (starts[b_tok] + d[b_tok]) * HOP
    if cut[1] >= len(ipa_text) - 1: b = len(wav)  # last word: keep its release; trim() removes the silence
    # a little room for a released consonant at the end (t, l, ʃ) and a soft onset
    # start at the quietest 5 ms within 40 ms of the boundary, so nothing of the word before is heard
    f = int(.005 * SR); lo = max(0, a - int(.04 * SR)); hi = min(len(wav) - f, a + int(.04 * SR))
    if hi > lo:
        en = [np.sum(wav[i:i + f] ** 2) for i in range(lo, hi, f // 2)]
        a = lo + int(np.argmin(en)) * (f // 2)
    return wav[a: min(len(wav), b + int(.06 * SR))]
