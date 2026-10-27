"""Tone the medal photo cut-out to gold, keeping the red enamel red."""
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGBA'); A = np.asarray(im).astype(float)
R, G, B, a = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
L = 0.3 * R + 0.59 * G + 0.11 * B
lo, hi = np.percentile(L[a > 128], [2, 99.5])
t = np.clip((L - lo) / (hi - lo), 0, 1) ** 0.85
stops = np.array([[0, 46, 28, 6], [0.35, 140, 96, 26], [0.65, 214, 164, 64], [0.85, 244, 210, 120], [1, 255, 246, 205]])
gold = np.stack([np.interp(t, stops[:, 0], stops[:, k]) for k in (1, 2, 3)], -1)
red = (R > G * 1.45) & (R > 60)
enamel = np.stack([np.clip(R * 1.35, 0, 255), G * 0.55, B * 0.55], -1)
rgb = np.where(red[..., None], enamel, gold)
Image.fromarray(np.dstack([rgb, a]).astype(np.uint8)).save(out)
print('ok')
