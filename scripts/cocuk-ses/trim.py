import numpy as np
def trim(x, sr=22050, rel=-50, pre=.06, post=.15):
    w = int(sr * .01); e = np.array([20 * np.log10(np.sqrt(np.mean(x[i:i + w] ** 2)) + 1e-9) for i in range(0, len(x) - w, w)])
    act = np.where(e > e.max() + rel)[0]
    a = max(0, act[0] * w - int(pre * sr)); b = min(len(x), (act[-1] + 1) * w + int(post * sr))
    y = x[a:b].copy(); f = int(.01 * sr); y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f); return y
