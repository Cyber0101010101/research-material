"""Cut the existing 'Шилдэг төгсөгч' falcon medal out of the photo (blue table background)."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB').crop((400, 540, 830, 1200))
a = np.asarray(im).astype(float); R, G, B = a[..., 0], a[..., 1], a[..., 2]
# metal / red enamel are warm (R > B); the table and its glare are cool (B >= R)
mask = (R > B * 1.06) | ((R > 120) & (R > G * 1.35))
mask = ndimage.binary_opening(mask, iterations=1)
lab, n = ndimage.label(mask)
sizes = ndimage.sum(mask, lab, range(1, n + 1))
keep = np.isin(lab, 1 + np.argsort(sizes)[-2:])          # falcon + medal body (joined by the ring)
keep = ndimage.binary_closing(keep, iterations=2)
# fill only small holes (engraving shadows), keep the open gaps where the table shows through
holes = ndimage.binary_fill_holes(keep) & ~keep
hl, hn = ndimage.label(holes)
hs = ndimage.sum(holes, hl, range(1, hn + 1))
small = np.isin(hl, 1 + np.where(hs < 220)[0])
keep = keep | small
alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
rgba = im.convert('RGBA'); rgba.putalpha(alpha)
rgba = rgba.crop(alpha.getbbox()); rgba.save(out); print(n, rgba.size)
