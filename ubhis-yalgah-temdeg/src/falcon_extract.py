"""Cut the falcon out of the university logo (gold on maroon) into a transparent PNG."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
box = (122, 52, 428, 152)                      # falcon region in the 553x553 logo
c = im.crop(box)
S = 6                                           # upscale for a smooth edge
c = c.resize((c.width * S, c.height * S), Image.LANCZOS)
a = np.asarray(c).astype(float)
R, G, B = a[..., 0], a[..., 1], a[..., 2]
# gold: green channel high relative to the maroon background
score = (G - 0.55 * R)                          # maroon ~ 40-0.55*110 < 0 ; gold > 0
mask = score > 8
mask = ndimage.binary_opening(mask, iterations=2)
mask = ndimage.binary_closing(mask, iterations=3)
mask = ndimage.binary_fill_holes(mask)
# keep only the component holding the falcon body (centre of the crop)
lab, n = ndimage.label(ndimage.binary_erosion(mask, iterations=4))
cy, cx = int(0.55 * mask.shape[0]), int(0.47 * mask.shape[1])
keep = lab == lab[cy, cx]
keep = ndimage.binary_dilation(keep, iterations=4) & mask
keep = ndimage.binary_fill_holes(keep)
alpha = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
rgba = c.convert('RGBA'); rgba.putalpha(alpha)
bb = alpha.getbbox(); rgba = rgba.crop(bb)
rgba.save(out)
print(n, rgba.size)

# remove the laurel leaf tip left under the right wing, and the shield rim under the feet
f = Image.open(out); A = np.asarray(f).copy()
h, w = A.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
# leaf sits below a line running under the right wing's lower feather tips
leaf = (xx > 0.70 * w) & (xx < 0.87 * w) & (yy > 0.785 * h)
A[leaf, 3] = 0
A[int(0.955 * h):, :, 3] = 0
f = Image.fromarray(A); f = f.crop(f.getchannel('A').getbbox()); f.save(out)
print('cleaned', f.size)

# patch the right wing's lower feather tips (cut together with the leaf) with the mirrored left wing
f = Image.open(out).convert('RGBA'); A = np.asarray(f).copy(); h, w = A.shape[:2]
alpha_cols = np.where(A[int(0.5 * h), :, 3] > 128)[0]
body = A[int(0.55 * h), :, 3] > 128
xs = np.where(body)[0]
# body axis = centre of the widest opaque run around the middle
mid = w // 2
lo = mid; hi = mid
while lo > 0 and body[lo - 1]: lo -= 1
while hi < w - 1 and body[hi + 1]: hi += 1
axis = (lo + hi) / 2 if hi > lo else w * 0.485
M = A[:, ::-1].copy()
shift = int(round(2 * axis - (w - 1)))
M = np.roll(M, shift, axis=1)
y0 = int(0.70 * h)
x1, x2 = int(0.70 * w), int(0.90 * w)
region = A[y0:, x1:x2]
mreg = M[y0:, x1:x2]
fill = (mreg[..., 3] > region[..., 3])
region[fill] = mreg[fill]
A[y0:, x1:x2] = region
Image.fromarray(A).save(out)
print('mirrored patch, axis', axis)

# open the gap between the legs (the logo fills it with the gold tail, so the legs merge)
f = Image.open(out).convert('RGBA'); A = np.asarray(f).copy(); h, w = A.shape[:2]
yy, xx = np.mgrid[0:h, 0:w]
gx1, gx2 = 0.484 * w, 0.536 * w          # inner edges of the two legs
gtop = 0.80 * h                           # top of the gap (arched)
cxg = (gx1 + gx2) / 2; rx = (gx2 - gx1) / 2
arch = gtop + 0.05 * h * (1 - np.clip(((xx - cxg) / rx) ** 2, 0, 1)) * -1 + 0.05 * h
gap = (xx > gx1) & (xx < gx2) & (yy > arch)
A[gap, 3] = 0
Image.fromarray(A).save(out)
print('legs gap opened')
