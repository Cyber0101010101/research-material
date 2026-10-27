"""Erase the old 'ШИЛДЭГ ТӨГСӨГЧ' lettering from the red enamel band of the (gold-toned) medal."""
import sys
import numpy as np
from PIL import Image, ImageFilter
src, out, orig = sys.argv[1], sys.argv[2], sys.argv[3]   # orig: un-toned photo, for finding the red enamel
CX, CY = 197.5, 420
im = Image.open(src).convert('RGBA'); A = np.asarray(im).astype(float)
h, w = A.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
# the ribbon is its own arc (fitted to its outer edge on the photo), not concentric with the disc
BX, BY, BR = 189.4, 479.4, 151.3
r = np.hypot(xx - BX, yy - BY); ang = np.degrees(np.arctan2(yy - BY, xx - BX))
# upper edge of the red band per column, taken from the photo (so the band ends keep their shape)
O = np.asarray(Image.open(orig).convert('RGBA')).astype(float)
red = (O[..., 0] > O[..., 1] * 1.45) & (O[..., 0] > 60) & (O[..., 3] > 200)
top = np.full(w, h, float)
for x in range(w):
    ys = np.where(red[:, x])[0]
    if len(ys): top[x] = ys.min()
from scipy.ndimage import minimum_filter1d
top = minimum_filter1d(top, 9)
band = (r > BR - 31) & (r < BR - 3) & (yy >= top[None, :]) & (A[..., 3] > 0)
plaque = (xx > 124) & (xx < 270) & (yy < 597)
m = band & ~plaque
t = np.clip((r - (BR - 31)) / 28, 0, 1)
Rr = 190 - 55 * t; Gg = 36 - 12 * t; Bb = 32 - 10 * t
for c, v in enumerate((Rr, Gg, Bb)):
    A[..., c] = np.where(m, v, A[..., c])
# thin metal rim along the outer edge of the band (as on the medal)
rim = (r >= BR - 3) & (r < BR + 1) & (yy >= top[None, :]) & (A[..., 3] > 0)
for c, v in enumerate((168, 120, 40)):
    A[..., c] = np.where(rim, v, A[..., c])
Image.fromarray(A.astype(np.uint8)).save(out)
print('ok')
