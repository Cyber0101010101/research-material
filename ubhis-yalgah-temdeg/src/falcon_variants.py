"""Make the gold (service) and tan (camouflage) falcon PNGs used by badges.js."""
import sys
from PIL import Image, ImageOps
src, outdir = sys.argv[1], sys.argv[2]
f = Image.open(src).convert('RGBA')
a = f.getchannel('A')
g = ImageOps.autocontrast(f.convert('L'), cutoff=2)
camo = ImageOps.colorize(g, black='#2f2c18', white='#d8c38c', mid='#a8925a').convert('RGBA'); camo.putalpha(a)
for im, name in [(f, 'falcon_gold.png'), (camo, 'falcon_camo.png')]:
    im.resize((880, round(880 * im.height / im.width)), Image.LANCZOS).save(f'{outdir}/{name}')
