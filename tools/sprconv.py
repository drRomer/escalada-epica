# Convierte los diseños de Sendero del Orbe (render PXR) a sprites de texto estilo Cumbre:
# una letra por pixel, paleta corta, contorno único y colores planos. Genera src/sprites.js
import json, math, collections

D = json.load(open('/home/claude/escalada/tools/pxr_dump.json'))
SPR, RP = D['spr'], D['rp']
OUTLINE = '#140c14'

def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def lum(h): r, g, b = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255
def dist(a, b):
    A, B = rgb(a), rgb(b)
    rm = (A[0] + B[0]) / 2
    return math.sqrt((2 + rm / 256) * (A[0] - B[0]) ** 2 + 4 * (A[1] - B[1]) ** 2 + (2 + (255 - rm) / 256) * (A[2] - B[2]) ** 2)

# ---------- heroína: paleta curada (las letras C c d son la capa y se cambian por paleta) ----------
HERO = [('K', OUTLINE),
        ('d', RP['cloakG'][2]), ('c', RP['cloakG'][3]), ('C', RP['cloakG'][4]),
        ('k', RP['leather'][2]), ('l', RP['leather'][3]), ('L', RP['leather'][4]),
        ('p', RP['pants'][2]), ('P', RP['pants'][3]),
        ('s', RP['skin'][2]), ('S', RP['skin'][4]),
        ('h', RP['hair'][2]), ('R', '#d8333f'), ('F', '#f6f3ea'), ('Y', '#e0b040')]

def quant(px, pal, dark=0.085):
    out = []
    for c in px:
        if c is None: out.append('.'); continue
        if lum(c) < dark: out.append('K'); continue
        best = min(pal, key=lambda e: dist(c, e[1]) if e[0] != 'K' else 1e9)
        out.append(best[0])
    return out

def auto_palette(names, maxc, dark=0.085, keep=()):
    # paleta compartida por una familia de sprites: oscuros -> contorno, luego fusiona los colores más cercanos
    cnt = collections.Counter()
    for n in names:
        for c in SPR[n]['px']:
            if c and lum(c) >= dark: cnt[c] += 1
    cols = dict(cnt)
    while len(cols) > maxc:
        items = list(cols.items())
        best = None
        for i in range(len(items)):
            for j in range(i + 1, len(items)):
                a, b = items[i], items[j]
                if a[0] in keep and b[0] in keep: continue
                d = dist(a[0], b[0]) * (1 + 0.15 * math.log(1 + min(a[1], b[1])))
                if best is None or d < best[0]: best = (d, a, b)
        _, a, b = best
        win, lose = (a, b) if (a[1] >= b[1] or a[0] in keep) and b[0] not in keep else (b, a)
        cols[win[0]] += cols.pop(lose[0])
    letters = 'abcdefghijmnoqrstuvwxyzABDEGHIJMNOQTUVWX'
    pal = [('K', OUTLINE)] + [(letters[i], c) for i, (c, _) in enumerate(sorted(cols.items(), key=lambda kv: lum(kv[0])))]
    return pal

def rows(px, w, chars, protect='FRYe'):
    h = len(chars) // w
    g = [list(chars[r * w:(r + 1) * w]) for r in range(h)]
    out = [row[:] for row in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] == '.' or g[y][x] in protect: continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= w or ny >= h or g[ny][nx] == '.':
                    out[y][x] = 'K'; break
    return [''.join(r) for r in out]

def crop_rows(rs):
    # recorta filas y columnas totalmente vacías en los bordes (guarda el desplazamiento)
    top = 0
    while top < len(rs) and set(rs[top]) == {'.'}: top += 1
    bot = len(rs)
    while bot > top and set(rs[bot - 1]) == {'.'}: bot -= 1
    return rs, 0

OUT = {'pal': {}, 'spr': {}}
OUT['pal']['hero'] = {k: v for k, v in HERO}
import sys; sys.path.insert(0, '/home/claude/escalada/tools')
from hero_design import FRAMES
for n, r in FRAMES.items(): OUT['spr'][n] = {'p': 'hero', 'r': r}

FAM = {
    'imp': ([f'imp{i}' for i in range(4)], 9, ('#ffe25a',)),
    'goblin': ([f'goblin{i}' for i in range(4)] + ['goblinAim'], 11, ('#ffe25a', '#d8d0b8')),
    'gem': ([f'gem{i}' for i in range(3)], 7, ('#ffffff',)),
    'potion': (['potion'], 9, ('#ffffff',)),
    'anchor': (['anchor0', 'anchor1'], 10, ('#7ef3ff', '#2ea6e6', '#ffffff')),
    'rune': (['rune0', 'rune1'], 9, ('#6ad0ff', '#bff4ff')),
    'golem': ([k for k in SPR if k.startswith('golem_') and k != 'golem_stone'], 10, ('#ffd541', '#fa6a09')),
    'stone': (['golem_stone'], 7, ()),
}
for fam, (names, maxc, keep) in FAM.items():
    pal = auto_palette(names, maxc, keep=keep)
    OUT['pal'][fam] = {k: v for k, v in pal}
    for n in names:
        s = SPR[n]; OUT['spr'][n] = {'p': fam, 'r': rows(s['px'], s['w'], quant(s['px'], pal))}

lines = ['// ===== SPRITES · Cuentos del Medioevo: Escalada Épica =====',
         '// Diseños de Sendero del Orbe redibujados con la técnica de Cumbre: una letra por pixel, paleta corta.',
         '// "." = transparente, "K" = contorno. Edita las letras para retocar un sprite.',
         'const SPRITES = {', '  pal: {']
for k, v in OUT['pal'].items():
    lines.append('    ' + k + ': ' + json.dumps(v) + ',')
lines.append('  },')
for k, v in OUT['spr'].items():
    lines.append('  ' + k + ': { p: ' + json.dumps(v['p']) + ', r: [')
    for r in v['r']: lines.append('    ' + json.dumps(r) + ',')
    lines.append('  ]},')
lines += ['};', '']
open('/home/claude/escalada/src/sprites.js', 'w').write('\n'.join(lines))
for k, v in OUT['pal'].items(): print(k, len(v), 'colores')
print('KB', round(len('\n'.join(lines)) / 1024, 1))
