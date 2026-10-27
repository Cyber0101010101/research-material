"""Clip rendered badges to the medal silhouette and remove the jump ring left above the body."""
import sys, glob, os
import numpy as np
from PIL import Image
d, medal = sys.argv[1], sys.argv[2]
SC, TOP = 3, 240
m = Image.open(medal).convert('RGBA')
alpha_full = m.getchannel('A').resize((m.width * SC, m.height * SC), Image.LANCZOS)
for f in sorted(glob.glob(os.path.join(d, 'raw_*.png'))):
    im = Image.open(f).convert('RGBA')
    top = 0 if 'shildeg' in f else TOP
    a = alpha_full.crop((0, top * SC, alpha_full.width, top * SC + im.height))
    A = np.asarray(im).copy()
    A[..., 3] = np.minimum(A[..., 3], np.asarray(a))
    if top:
        # drop the bit of jump ring that sits above the scroll ornament
        A[: 4 * SC, :, 3] = 0
    out = Image.fromarray(A)
    out = out.crop(out.getchannel('A').getbbox())
    out.save(f.replace('raw_', ''))
    print(os.path.basename(f), out.size)
