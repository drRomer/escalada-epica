# Escribe src/sprites2.js: sprites de las etapas nuevas (Gemini convertidos + provisorios a mano) que se suman a SPRITES.
import json, colorsys

R = json.load(open('/home/claude/escalada/tools/gemini_sprites2.json'))

def rle(row):
    out = []; i = 0
    while i < len(row):
        j = i
        while j < len(row) and row[j] == row[i]: j += 1
        n = j - i; out.append(row[i] + (str(n) if n > 1 else '')); i = j
    return ''.join(out)

def rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))
def hx(c): return '#%02x%02x%02x' % tuple(max(0, min(255, int(round(v)))) for v in c)
def lum(h): r, g, b = rgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255

def ramp_map(pal, ramp):
    # recolorea por luminancia sobre una rampa (para variantes: simio del bosque, simio de magma...)
    out = {}
    ls = sorted(lum(h) for k, h in pal.items() if k != 'K')
    lo, hi = ls[0], ls[-1]
    for k, h in pal.items():
        if k == 'K': out[k] = h; continue
        t = (lum(h) - lo) / max(1e-6, hi - lo) * (len(ramp) - 1)
        i = min(len(ramp) - 2, int(t)); f = t - i
        a, b = rgb(ramp[i]), rgb(ramp[i + 1])
        out[k] = hx([a[j] + (b[j] - a[j]) * f for j in range(3)])
    return out

R['pal']['apeF'] = ramp_map(R['pal']['ape'], ['#24120a', '#4a2a14', '#7a4a22', '#a87040', '#d8a870'])
R['pal']['apeV'] = ramp_map(R['pal']['ape'], ['#140808', '#341010', '#5a1a12', '#a8361a', '#f08a2a'])
R['pal']['runeSol'] = ramp_map(R['pal']['runeLuz'], ['#3a2206', '#8a5a10', '#e0a020', '#ffd541', '#fff4c0'])
R['pal']['batT'] = ramp_map(R['pal']['bat'], ['#120e18', '#2a2434', '#4a4058', '#7a6e8a'])

HAND = {}   # los provisorios a mano (fantasma, fuego fatuo, polilla) ya fueron reemplazados por las hojas de Gemini
for fam, (pal, frames) in HAND.items():
    R['pal'][fam] = pal
    for k, rows in frames.items():
        assert len(set(len(r) for r in rows)) == 1, (k, [len(r) for r in rows])
        R['spr'][k] = {'p': fam, 'r': rows}

lines = ['// ===== SPRITES de las etapas 1, 2, 4 y 5 (se suman a SPRITES) =====',
         '// Spriggan (ent), Bestia de las nieves, Fantasma, Carcelero (rediseño con cabeza de candado), murciélagos, ardillas y simio: hojas de Gemini convertidas con tools/gconv2.py.',
         '// Esqueleto arquero, fantasma menor, polilla, fuego fatuo, gemas, poción, anclajes, runas y estandarte: tools/gconv3.py.',
         '(function () {',
         '  Object.assign(SPRITES.meta, ' + json.dumps(R['meta']) + ');',
         '  Object.assign(SPRITES.pal, {']
for k, v in R['pal'].items(): lines.append('    ' + k + ': ' + json.dumps(v) + ',')
lines.append('  });')
lines.append('  Object.assign(SPRITES, {')
for k, v in R['spr'].items():
    lines.append('    ' + k + ': { p: ' + json.dumps(v['p']) + ', r: [')
    for r in v['r']: lines.append('      ' + json.dumps(rle(''.join(r) if isinstance(r, list) else r)) + ',')
    lines.append('    ]},')
lines += ['  });', '})();', '']
open('/home/claude/escalada/src/sprites2.js', 'w').write('\n'.join(lines))
print('KB', round(len('\n'.join(lines)) / 1024, 1), len(R['spr']), 'sprites')
