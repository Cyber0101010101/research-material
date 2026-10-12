import sys
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance

src, out_dir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")

# 1) remove magenta tint: use luminance, but weight green channel (ink darkest there on pink paper)
r, g, b = [np.asarray(c, dtype=np.float32) for c in im.split()]
gray = 0.25 * r + 0.55 * g + 0.20 * b
gray = Image.fromarray(np.clip(gray, 0, 255).astype(np.uint8))

# 2) denoise before upscaling (kills JPEG blocking) - non-local means
import cv2
g = np.asarray(gray)
g = cv2.fastNlMeansDenoising(g, None, h=9, templateWindowSize=7, searchWindowSize=21)
gray = Image.fromarray(g)

# 3) upscale 4x
W, H = gray.size
big = Image.fromarray(cv2.resize(np.asarray(gray), (W * 4, H * 4), interpolation=cv2.INTER_LANCZOS4))
big = Image.fromarray(cv2.bilateralFilter(np.asarray(big), 7, 40, 7))

# 4) levels: background -> white, ink -> black
arr = np.asarray(big, dtype=np.float32)
lo, hi = np.percentile(arr, 1.5), np.percentile(arr, 90)
arr = np.clip((arr - lo) / (hi - lo), 0, 1)
arr = arr ** 1.15  # slight gamma to deepen lines
clean = Image.fromarray((arr * 255).astype(np.uint8))

# 5) smooth then sharpen edges
clean = clean.filter(ImageFilter.GaussianBlur(0.8))
clean = clean.filter(ImageFilter.UnsharpMask(radius=2.5, percent=160, threshold=2))
clean.save(f"{out_dir}/portrait_clean_gray.png")

# 6) line-art variant: soft threshold
a = np.asarray(clean, dtype=np.float32) / 255.0
line = 1 / (1 + np.exp(-(a - 0.62) * 14))  # sigmoid around 0.62
line_im = Image.fromarray((line * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.5))
line_im.save(f"{out_dir}/portrait_lineart_bw.png")

# 7) sepia duotone for the deck
sep = ImageOps.colorize(clean, black=(40, 30, 20), white=(246, 240, 228))
sep.save(f"{out_dir}/portrait_sepia.png")

print("sizes:", clean.size)
