from PIL import Image
import numpy as np
from scipy import ndimage as nd
def load(n):
    im = np.asarray(Image.open('/home/claude/escalada/gemini/' + n + '.jpg').convert('RGB')).astype(int)
    r, g, b = im[..., 0], im[..., 1], im[..., 2]
    bg = (r > 165) & (g < 120) & (b > 165) & (r - g > 90) & (b - g > 90)
    return im, ~bg
def comps(n, dil=4, minpx=150):
    im, fg = load(n)
    lab, k = nd.label(nd.binary_dilation(fg, iterations=dil))
    out = []
    for i, sl in enumerate(nd.find_objects(lab)):
        m = (lab[sl] == i + 1) & fg[sl]
        if m.sum() < minpx: continue
        out.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, int(m.sum())))
    return sorted(out, key=lambda t: (round(t[1] / 120), t[0]))
if __name__ == '__main__':
    for n in ['golem', 'heroina', 'goblin', 'diablillo']:
        print(n)
        for c in comps(n): print('  x%4d-%4d y%4d-%4d px%6d  (%dx%d)' % (c[0], c[2], c[1], c[3], c[4], c[2] - c[0], c[3] - c[1]))
