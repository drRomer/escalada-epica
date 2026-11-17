# Convierte las hojas nuevas de Gemini (jefes y enemigos de las etapas 1, 2, 4 y 5) a sprites de texto (técnica Cumbre):
# fondo por color de borde → cuadros por componentes → grilla real (voto por mayoría) → paleta corta (k-means) → contorno único.
# Escribe src/sprites2.js (se suma a SPRITES) con los sprites convertidos + los provisorios hechos a mano.
from PIL import Image
import numpy as np, json
from scipy import ndimage as nd
from scipy.cluster.vq import kmeans2

G = '/home/claude/escalada/gemini/'
OUT = '#140c14'
LET = 'abcdefghijlmnpqrstuwxyz'  # letras de paleta (sin K, o, v, k)

def load(n, thr=70):
    im = np.asarray(Image.open(G + n + '.jpg').convert('RGB')).astype(float)
    border = np.concatenate([im[0], im[-1], im[:, 0], im[:, -1]])
    bg = np.median(border, 0)
    d = np.sqrt(((im - bg) ** 2).sum(2))
    return im, d > thr

def comps(fg, box, dil=3, minpx=60):
    x0, y0, x1, y1 = box
    sub = fg[y0:y1, x0:x1]
    lab, k = nd.label(nd.binary_dilation(sub, iterations=dil))
    res = []
    for i, sl in enumerate(nd.find_objects(lab)):
        m = (lab[sl] == i + 1) & sub[sl]
        if m.sum() < minpx: continue
        res.append([sl[1].start + x0, sl[0].start + y0, sl[1].stop + x0, sl[0].stop + y0, int(m.sum())])
    return sorted(res, key=lambda t: t[0])

def group(cs, big, merge=True):
    bigs = [c[:] for c in cs if c[4] >= big]; smalls = [c for c in cs if c[4] < big]
    if merge:
        for s in smalls:
            cx = (s[0] + s[2]) / 2
            t = min(bigs, key=lambda b: abs((b[0] + b[2]) / 2 - cx))
            if abs((t[0] + t[2]) / 2 - cx) < (t[2] - t[0]) * 0.9:
                t[0], t[1], t[2], t[3] = min(t[0], s[0]), min(t[1], s[1]), max(t[2], s[2]), max(t[3], s[3])
    return bigs

def palette(im, fg, boxes, n, dark):
    px = []
    for b in boxes:
        x0, y0, x1, y1 = b[:4]
        p = im[y0:y1, x0:x1][fg[y0:y1, x0:x1]]
        lum = (0.299 * p[:, 0] + 0.587 * p[:, 1] + 0.114 * p[:, 2]) / 255
        px.append(p[lum >= dark])
    px = np.concatenate(px)
    if len(px) > 60000: px = px[np.random.RandomState(1).choice(len(px), 60000, replace=False)]
    cen, lab = kmeans2(px, n, minit='++', seed=3)
    cen = cen[np.bincount(lab, minlength=n) > 0]
    cen = cen[np.argsort((0.299 * cen[:, 0] + 0.587 * cen[:, 1] + 0.114 * cen[:, 2]))]
    return [(LET[i], '#%02x%02x%02x' % tuple(int(round(v)) for v in np.clip(c, 0, 255))) for i, c in enumerate(cen)]

def rgbh(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
def nearest(pix, pal):
    P = np.array([rgbh(h) for _, h in pal])
    rm = (pix[:, None, 0] + P[None, :, 0]) / 2
    d = (2 + rm / 256) * (pix[:, None, 0] - P[None, :, 0]) ** 2 + 4 * (pix[:, None, 1] - P[None, :, 1]) ** 2 + (2 + (255 - rm) / 256) * (pix[:, None, 2] - P[None, :, 2]) ** 2
    return d.argmin(1)

def downsample(im, fg, box, s, pal, dark, fgmin=0.45):
    x0, y0, x1, y1 = box[:4]
    w = max(1, int(round((x1 - x0) / s))); h = max(1, int(round((y1 - y0) / s)))
    gx0 = (x0 + x1) / 2 - w * s / 2; gy0 = y1 - h * s
    grid = []
    for j in range(h):
        row = []
        for i in range(w):
            a = int(round(gx0 + i * s)); b = int(round(gx0 + (i + 1) * s)); c = int(round(gy0 + j * s)); d = int(round(gy0 + (j + 1) * s))
            a, c = max(a, 0), max(c, 0)
            m = fg[c:d, a:b]
            if m.size == 0 or m.mean() < fgmin: row.append('.'); continue
            px = im[c:d, a:b][m]
            lum = (0.299 * px[:, 0] + 0.587 * px[:, 1] + 0.114 * px[:, 2]) / 255
            if (lum < dark).mean() > 0.5: row.append('K'); continue
            idx = nearest(px[lum >= dark], pal)
            row.append(pal[np.bincount(idx, minlength=len(pal)).argmax()][0])
        grid.append(row)
    return grid

def outline(grid, protect=''):
    h, w = len(grid), len(grid[0]); out = [r[:] for r in grid]
    for y in range(h):
        for x in range(w):
            if grid[y][x] == '.' or grid[y][x] in protect: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or grid[ny][nx] == '.': out[y][x] = 'K'; break
    return out

def clean(grid, minsize=6, frac=0.02, keep_largest=False):
    occ = np.array([[c != '.' for c in r] for r in grid])
    lab, k = nd.label(occ)
    if k <= 1: return grid
    sizes = nd.sum(occ, lab, range(1, k + 1)); big = sizes.max()
    out = [r[:] for r in grid]
    for i, sz in enumerate(sizes):
        if (keep_largest and sz < big) or sz < minsize or sz < big * frac:
            for y, x in zip(*np.where(lab == i + 1)): out[y][x] = '.'
    return out

def trim(grid):
    rows = [i for i, r in enumerate(grid) if any(c != '.' for c in r)]
    cols = [i for i in range(len(grid[0])) if any(r[i] != '.' for r in grid)]
    return [r[cols[0]:cols[-1] + 1] for r in grid[rows[0]:rows[-1] + 1]]

def anchor_x(grid, r0, r1):
    h = len(grid); xs = []
    for y in range(int(h * r0), max(int(h * r0) + 1, int(h * r1))): xs += [x for x, c in enumerate(grid[y]) if c != '.']
    return int(round(np.median(xs))) if xs else len(grid[0]) // 2

def pack(frames, anchors, align='bottom'):
    half = max(max(a, len(f[0]) - 1 - a) for f, a in zip(frames, anchors))
    W = 2 * half + 1; H = max(len(f) for f in frames)
    out = []
    for f, a in zip(frames, anchors):
        pad_l = half - a
        body = [('.' * pad_l + ''.join(r)).ljust(W, '.') for r in f]
        pad = ['.' * W] * (H - len(f))
        out.append(pad + body if align == 'bottom' else (pad[:len(pad) // 2] + body + pad[len(pad) // 2:]))
    return out, W, H

RES = {'pal': {}, 'spr': {}, 'meta': {}}

def colsplit(fg, y0, y1, upto=0.8, gap=6, minw=25):
    # separa cuadros por columnas vacías mirando solo la parte alta de la banda (el suelo une los cuadros)
    prof = fg[y0:y0 + int((y1 - y0) * upto)].sum(0) > 1
    runs = []; on = False
    for x, v in enumerate(prof):
        if v and not on: on = True; a = x
        if not v and on: on = False; runs.append([a, x])
    if on: runs.append([a, len(prof)])
    merged = []
    for r in runs:
        if merged and r[0] - merged[-1][1] < gap: merged[-1][1] = r[1]
        else: merged.append(r)
    out = []
    for a, b in merged:
        if b - a < minw: continue
        m = fg[y0:y1, a:b]; ys, xs = np.where(m)
        out.append([a + xs.min(), y0 + ys.min(), a + xs.max() + 1, y0 + ys.max() + 1, int(m.sum())])
    return out

def family(sheet, bands, names, s, ncol, fam, big, merge=True, fringe_to=OUT, dark=0.07, anchor=(0.0, 0.35), protect='', keep_largest=None, align='bottom', thr=70, cut=None, xr=None, split=False):
    im, fg = load(sheet, thr)
    boxes = []
    for (y0, y1) in bands:
        if split: cs = colsplit(fg, y0, y1)
        else: cs = group(comps(fg, (xr[0] if xr else 0, y0, xr[1] if xr else im.shape[1], y1), dil=3), big, merge)
        boxes += cs
    if cut: boxes = [b for i, b in enumerate(boxes) if i not in cut]
    assert len(boxes) >= len([n for n in names if n]), (sheet, len(boxes), [b[:4] for b in boxes])
    pal = palette(im, fg, [b for b, n in zip(boxes, names) if n], ncol, dark)
    # colores contaminados por el fondo magenta (borde del JPEG): al contorno, o al púrpura de la corrupción (ent)
    def fringe(h):
        r, g, b = rgbh(h)
        return min(r, b) - g > 55 and abs(r - b) < 90 and r > 90
    pal = [(c, (fringe_to if fringe(h) else h)) for c, h in pal]
    pal = [('K', OUT)] + pal
    frames, anchors, keys = [], [], []
    for b, n in zip(boxes, names):
        if not n: continue
        g = downsample(im, fg, b, s, pal, dark)
        kl = keep_largest is not None and n in keep_largest
        g = outline(trim(clean(g, 6, 0.03, kl)), protect)
        frames.append(g); anchors.append(anchor_x(g, *anchor)); keys.append(n)
    packed, W, H = pack(frames, anchors, align)
    RES['pal'][fam] = dict(pal)
    for k, f in zip(keys, packed): RES['spr'][k] = {'p': fam, 'r': f}
    RES['meta'][fam] = [W, H]
    print(fam, 'lienzo', W, 'x', H, '·', len(pal), 'colores ·', ' '.join(keys))

# ---------- JEFES ----------
family('ent', [(5, 216), (219, 434)], ['ent_idle0', 'ent_throw', 'ent_slamUp', 'ent_slamDown', 'ent_stone', 'ent_idle1', None, 'ent_roar', 'ent_beam', None],
       2.35, 13, 'ent', 4000, fringe_to='#6a3a86', split=True, anchor=(0.1, 0.45))
family('yeti', [(6, 216), (224, 434)], ['yeti_idle0', 'yeti_throw', 'yeti_slamUp', 'yeti_slamDown', 'yeti_idle1', 'yeti_roar', 'yeti_beam', 'yeti_stone'],
       2.3, 13, 'yeti', 4000, split=True, anchor=(0.1, 0.45))
family('espectro', [(20, 272), (305, 530)], ['espectro_idle0', 'espectro_throw', 'espectro_slamUp', 'espectro_slamDown', 'espectro_idle1', 'espectro_beam', 'espectro_stone'],
       2.6, 11, 'espectro', 3000, split=True, anchor=(0.0, 0.3), dark=0.05)
family('carcelero', [(17, 205), (215, 434)], ['carcelero_idle0', 'carcelero_throw', 'carcelero_slamUp', 'carcelero_slamDown', 'carcelero_idle1', 'carcelero_beam', 'carcelero_roar', 'carcelero_stone'],
       2.2, 13, 'carcelero', 4000, split=True, anchor=(0.0, 0.5))
# ---------- ENEMIGOS ----------
family('murcielago_ardilla', [(66, 212)], ['bat0', 'bat1', 'bat2', 'bat3', 'batDead'], 7.6, 7, 'bat', 1500, merge=False, anchor=(0.2, 0.7), protect='', keep_largest=['batDead'], align='center')
family('murcielago_ardilla', [(342, 492)], ['sq0', 'sq1', 'sq2', 'sq3', 'sqDead'], 8.0, 7, 'squirrel', 1500, merge=False, anchor=(0.2, 0.7), keep_largest=['sqDead'], align='center')
family('hielo_fuego', [(66, 212)], ['ibat0', 'ibat1', 'ibat2', 'ibat3', 'ibatDead'], 7.6, 7, 'icebat', 1500, merge=False, anchor=(0.2, 0.7), keep_largest=['ibatDead'], align='center')
family('hielo_fuego', [(342, 492)], ['fsq0', 'fsq1', 'fsq2', 'fsq3', 'fsqDead'], 8.0, 8, 'firesq', 1500, merge=False, anchor=(0.2, 0.7), keep_largest=['fsqDead'], align='center')
family('simio', [(124, 373)], ['ape0', 'ape1', 'apeAim', 'apeShot', 'apeDead'], 10.0, 8, 'ape', 2500, merge=False, anchor=(0.6, 1.0), keep_largest=['apeDead'])

json.dump(RES, open('/home/claude/escalada/tools/gemini_sprites2.json', 'w'))
