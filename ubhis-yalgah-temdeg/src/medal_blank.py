"""Make a blank template of the medal: remove the Soyombo fire that sits on the studded ring
(cloned from a clean stretch of the same ring)."""
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
CX, CY = 197.5, 420
im = Image.open(src).convert('RGBA')
A = np.asarray(im).astype(float)
rot = np.asarray(im.rotate(-21, resample=Image.BICUBIC, center=(CX, CY))).astype(float)  # brings angle -111° to -90°
h, w = A.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
r = np.hypot(xx - CX, yy - CY); ang = np.degrees(np.arctan2(yy - CY, xx - CX))
zone = (r > 86) & (r < 121) & (ang > -106) & (ang < -74)
# feather the seam
wgt = np.clip(np.minimum(ang + 106, -74 - ang) / 5, 0, 1) * zone
for c in range(4):
    A[..., c] = A[..., c] * (1 - wgt) + rot[..., c] * wgt
Image.fromarray(A.astype(np.uint8)).save(out)
print('ok')
