# Genera src/levels.js (Escalada Épica · Etapa 1: El Volcán)
# Filas de ABAJO hacia ARRIBA (fila 0 = suelo). Reutiliza tramos ya verificados de Cumbre.
import json, subprocess

old = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('/home/claude/cumbre/src/levels.js').map(l=>l.rows)))"]))

def put(rows, b, c, ch):
    r = list(rows[b]); r[c] = ch; rows[b] = ''.join(r)

def fill(rows, b0, b1, c0, c1, ch='Z'):
    for b in range(b0, b1 + 1):
        for c in range(c0, c1 + 1):
            put(rows, b, c, ch)

# ---------- 1. Faldas Humeantes (tutorial) ----------
L1 = old[0][0:24] + ['##==========...Z', 'Z.......F......Z', 'Z..............Z', '................', '................']
put(L1, 17, 2, 'P')

# ---------- 2. Ruinas Enanas ----------
L2 = ['################'] + old[0][25:71]
put(L2, 1, 2, 'S'); put(L2, 1, 3, '.')
fill(L2, 1, 12, 11, 14)
put(L2, 61 - 24, 7, '.')          # deja 3 gemas

# ---------- 3. Riscos Quebradizos ----------
L3 = list(old[1])
for b, c in [(5, 6), (20, 3), (36, 13), (64, 8)]: put(L3, b, c, '.')
put(L3, 18, 12, '#'); put(L3, 18, 13, '#'); put(L3, 18, 14, '#')
put(L3, 19, 13, 'A')
put(L3, 17, 4, 'T')

# ---------- 4. Ríos de Magma ----------
L4 = [
    '################',  # 0
    '#######LLL######',  # 1
    'Z.S.T......H.##Z',  # 2
    'Z.......o....##Z',  # 3
    'Z............##Z',  # 4
    'Z............##Z',  # 5
    'Z............##Z',  # 6
    'Z..##...##...##Z',  # 7
    'Z##LL###LL##=##Z',  # 8
    'Z.....H......TPZ',  # 9
    '#..............Z',  # 10
    '#..............Z',  # 11
    '#..............Z',  # 12
    '#..............Z',  # 13
    '#..............Z',  # 14
    '#..............Z',  # 15
    '#..............Z',  # 16
    '#.....#........Z',  # 17
    '#====..........Z',  # 18
    '..P............Z',  # 19
    '.......####....Z',  # 20
    'Z........H.....Z',  # 21
    'Z............##Z',  # 22
    'Z.............#Z',  # 23
    'Z.....o.......#Z',  # 24
    'Z.............#Z',  # 25
    'Z.............#Z',  # 26
    'Z.............#Z',  # 27
    'Z.....R.......#Z',  # 28
    'Z....ZZZ......#Z',  # 29
    'Z.............#Z',  # 30
    'Z..##..##.....#Z',  # 31
    'Z##LL##LL#====#Z',  # 32
    'Z|...H........PZ',  # 33
    'Z|.............Z',  # 34
    'Z|.............Z',  # 35
    'Z|.............Z',  # 36
    'Z|.............Z',  # 37
    'Z|.o...........Z',  # 38
    'Z|.............Z',  # 39
    'Z|.............Z',  # 40
    'Z|.............Z',  # 41
    'Z|####.........Z',  # 42
    'Z...P..........Z',  # 43
    'Z......####....Z',  # 44
    'Z........H.....Z',  # 45
    'Z............##Z',  # 46
    'Z.............FZ',  # 47
    'Z..............Z',  # 48
    '................',  # 49
    '................',  # 50
]

# ---------- 5. ¡La Lava Sube! ----------
L5 = [
    '################',  # 0
    'Z.S.T..........Z',  # 1
    'Z.....===......Z',  # 2
    'Z..............Z',  # 3
    'Z.......===....Z',  # 4
    'Z..............Z',  # 5
    'Z...........###Z',  # 6
    'Z...........P..Z',  # 7
    'Z..........#...Z',  # 8
    'Z..........#...Z',  # 9
    'Z..........#...Z',  # 10
    'Z..........#...Z',  # 11
    'Z..........#.o.Z',  # 12
    'Z..........#...Z',  # 13
    'Z..........#...Z',  # 14
    'Z..........#...Z',  # 15
    'Z..........#...Z',  # 16
    'Z.....=====#...Z',  # 17
    'Z.....|P.......Z',  # 18
    'Z.....|........Z',  # 19
    'Z.....|........Z',  # 20
    'Z.....|........Z',  # 21
    'Z.....|........Z',  # 22
    'Z.....|.o......Z',  # 23
    'Z.....|........Z',  # 24
    'Z.....|........Z',  # 25
    'Z.....|........Z',  # 26
    'Z.....|####....Z',  # 27
    'Z.........P....Z',  # 28
    'Z...........CC.Z',  # 29
    'Z..............Z',  # 30
    'Z.......CC.....Z',  # 31
    'Z..............Z',  # 32
    'Z..####........Z',  # 33
    'Z...P..........Z',  # 34
    'Z#.............Z',  # 35
    'Z#.............Z',  # 36
    'Z#.............Z',  # 37
    'Z#.............Z',  # 38
    'Z#.............Z',  # 39
    'Z#..o..........Z',  # 40
    'Z#.............Z',  # 41
    'Z#.............Z',  # 42
    'Z#.............Z',  # 43
    'Z#=====........Z',  # 44
    'Z...P..........Z',  # 45
    'Z.......===....Z',  # 46
    'Z..............Z',  # 47
    'Z...........===Z',  # 48
    'Z............F.Z',  # 49
    'Z..............Z',  # 50
    '................',  # 51
    '................',  # 52
]

# ---------- 6. Cueva de Obsidiana ----------
L6 = list(old[2])
for b, c in [(17, 4), (31, 13), (60, 12)]: put(L6, b, c, '.')

# ---------- 7. Nido de Diablillos ----------
L7 = [
    '################',  # 0
    'Z..T.......S...Z',  # 1
    'Z......Z#......Z',  # 2
    'Z......Z#......Z',  # 3
    'Z......Z#......Z',  # 4
    'Z......Z#......Z',  # 5
    'Z......Z#....Y.Z',  # 6
    'Z......Z#......Z',  # 7
    'Z......Z#...o..Z',  # 8
    'Z......Z#......Z',  # 9
    'Z......Z#......Z',  # 10
    'Z......PT......Z',  # 11
    'Z###.......===.Z',  # 12
    'Z.A............Z',  # 13
    'Z.......===....Z',  # 14
    'Z.o............Z',  # 15
    'Z....===.......Z',  # 16
    'Z..............Z',  # 17
    'Z.==...........Z',  # 18
    'Z.......Y......Z',  # 19
    'Z....######....Z',  # 20
    'Z.......P......Z',  # 21
    'Z.............#Z',  # 22
    'Z.............#Z',  # 23
    'Z.............#Z',  # 24
    'Z.............CZ',  # 25
    'Z.............CZ',  # 26
    'Z.............#Z',  # 27
    'Z.......Y.....#Z',  # 28
    'Z.............#Z',  # 29
    'Z.............CZ',  # 30
    'Z.............#Z',  # 31
    'Z.............#Z',  # 32
    'Z.........====#Z',  # 33
    'Z.............PZ',  # 34
    'Z......===.....Z',  # 35
    'Z..............Z',  # 36
    'Z.===..........Z',  # 37
    'Z#A............Z',  # 38
    'Z#.............Z',  # 39
    'Z#...o.........Z',  # 40
    'Z#.............Z',  # 41
    'Z#.............Z',  # 42
    'Z#......Y......Z',  # 43
    'Z#.............Z',  # 44
    'Z#.............Z',  # 45
    'Z#.............Z',  # 46
    'Z#====.........Z',  # 47
    'Z...P..........Z',  # 48
    'Z......===.....Z',  # 49
    'Z.Y............Z',  # 50
    'Z..........===.Z',  # 51
    'Z...........F..Z',  # 52
    'Z..............Z',  # 53
    '................',  # 54
    '................',  # 55
]

# ---------- 8. Chimenea Ígnea ----------
L8 = [
    '################',  # 0
    'Z.S.T.HZZZZZZZZZ',  # 1
    'Z......ZZZZZZZZZ',  # 2
] + ['ZZZZZ..ZZZZZZZZZ'] * 12 + [  # 3..14
    'ZZZZZ==ZZLLZZZZZ',  # 15 (se reemplaza abajo)
]
L8 = L8[:15]  # 0..14
L8[14] = 'ZZZZZ==ZZLLZZZZZ'
put(L8, 8, 5, 'o')
L8 += [
    'Z.....P.....H.#Z',  # 15
] + ['Z.............#Z'] * 11 + [  # 16..26 (se ajusta 26)
]
L8[26] = 'Z......###====#Z'
put(L8, 20, 12, 'o')
L8 += ['Z.......H.....PZ']  # 27
L8 += ['Z.....I........Z']  # 28 (pasillo de 2 filas)
L8 += ['ZZZZZZI..IZZZZZZ'] * 11  # 29..39
L8 += ['ZZLLZZ#==#ZZZZZZ']  # 40
L8 += [
    '#....H..P......Z',  # 41
    '#..............Z',  # 42
    '#..............Z',  # 43
    '#..............Z',  # 44
    '#..............Z',  # 45
    '#..o...........Z',  # 46
    '#..............Z',  # 47
    '#..............Z',  # 48
    '#..............Z',  # 49
    '#====..........Z',  # 50
    '...P...........Z',  # 51
    '.......###.....Z',  # 52
    'Z........H.....Z',  # 53
    'Z............##Z',  # 54
    'Z.............FZ',  # 55
    'Z..............Z',  # 56
    '................',  # 57
    '................',  # 58
]

# ---------- 9. Ventisca de Ceniza ----------
L9 = list(old[3])
for b, c in [(5, 12), (30, 4), (61, 13)]: put(L9, b, c, '.')

# ---------- 10. El Cráter (jefe) ----------
L10 = [
    '################',  # 0
    'Z.S.T..........Z',  # 1
    'Z.....===......Z',  # 2
    'Z..............Z',  # 3
    'Z.......===....Z',  # 4
    'Z..............Z',  # 5
    'Z...........###Z',  # 6
    'Z...........P..Z',  # 7
    'Z.............#Z',  # 8
    'Z.............#Z',  # 9
    'Z.....o.......#Z',  # 10
    'Z.............#Z',  # 11
    'Z.............#Z',  # 12
    'Z.............#Z',  # 13
    'Z.........====#Z',  # 14
    'Z.........U...PZ',  # 15
    'Z..............Z',  # 16
    'Z....===.......Z',  # 17
    'Z..............Z',  # 18
    'Z==............Z',  # 19
    '#..............Z',  # 20
    '#..............Z',  # 21
    '#.....o........Z',  # 22
    '#..............Z',  # 23
    '#..............Z',  # 24
    '#..o...........Z',  # 25
    '#..............Z',  # 26
    '#..............Z',  # 27
    '#===...........Z',  # 28
    '..UP...........Z',  # 29
    '......===......Z',  # 30
    'Z............##Z',  # 31
    'Z........===.##Z',  # 32
    'Z..........P.##Z',  # 33
    'Z####LLLLLL==##Z',  # 34
    'Z...........U.FZ',  # 35
] + ['................'] * 8   # 36..43 cielo para el gólem

LEVELS = [
    dict(name='Faldas Humeantes', sub='El viaje comienza', theme='faldas', rows=L1, hints=[
        'Muévete con {LR} y salta con {JUMP}. Mantén {JUMP} para saltar más alto.',
        'Salta hacia la roca con presas y mantén la dirección (o {GRAB}) para agarrarte. Trepa con {UD}.',
        'Toca los anclajes rúnicos: tu cuerda élfica se ata a ellos y, si caes, te devuelve al último.',
        'Trepar cansa (la barra sobre tu cabeza). Descansa de pie para recuperar el vigor.']),
    dict(name='Ruinas Enanas', sub='Muros de los antiguos', theme='ruinas', rows=L2, hints=[
        'Los muros enanos son lisos: no se agarran. Salta contra el muro para rebotar de un lado a otro.',
        'Cadena enana: {UP} para subir. No cansa, ¡te devuelve el vigor!',
        'La poción de vigor te recarga en plena pared. Tómala al pasar.']),
    dict(name='Riscos Quebradizos', sub='La roca cruje', theme='riscos', rows=L3, hints=[
        'Roca agrietada: se derrumba poco después de pisarla o agarrarla. ¡No te detengas!',
        'Rocas ardientes: el polvo avisa que caerá una. Cruza entre una y otra.',
        'Un goblin arquero vigila la pared: observa su ritmo y trepa entre flecha y flecha. Salta sobre él para derrotarlo.']),
    dict(name='Ríos de Magma', sub='Donde arde la tierra', theme='magma', rows=L4, hints=[
        '¡Lava! Tocarla es fatal. Salta los pozos de magma.',
        'Respiraderos de fuego: echan humo antes de estallar. Pasa cuando se apaguen.']),
    dict(name='¡La Lava Sube!', sub='Huye del magma', theme='magma', rows=L5, rise=dict(delay=2.5, speed=11), hints=[
        '¡El volcán despierta y la lava sube! No te detengas: los anclajes te salvan, pero la lava no espera.']),
    dict(name='Cueva de Obsidiana', sub='Cristal negro', theme='cueva', rows=L6, hints=[
        'Obsidiana: resbala y no se puede agarrar, pero sí puedes rebotar en ella.',
        'Las estalactitas caen cuando pasas debajo. ¡Corre sin detenerte!']),
    dict(name='Nido de Diablillos', sub='Alas de fuego', theme='nido', rows=L7, hints=[
        'Diablillos de fuego patrullan el nido: tocarlos quema, pero puedes caerles encima para derrotarlos.',
        'Goblin arquero: salta sobre su cabeza para sacarlo del camino.']),
    dict(name='Chimenea Ígnea', sub='El corazón del volcán', theme='chimenea', rows=L8, rise=dict(delay=4, speed=8), hints=[
        'Chimenea ígnea: rebota entre los muros, esquiva el fuego... ¡y la lava vuelve a subir!']),
    dict(name='Ventisca de Ceniza', sub='Antes del cráter', theme='ceniza', rows=L9, wind=430, hints=[
        'Ventisca de ceniza: las ráfagas te empujan en el aire. Espera la calma o agárrate a la roca.',
        'Diablillos en la ventisca: calcula tu paso o cáeles encima.']),
    dict(name='El Cráter', sub='El Gólem de Lava', theme='crater', rows=L10, boss='golem', hints=[
        '¡El Gólem de Lava despertó! Trepa hasta las 3 runas de escarcha y tócalas para congelarlo.']),
]

for i, L in enumerate(LEVELS):
    for b, r in enumerate(L['rows']):
        assert len(r) == 16, (i + 1, b, r, len(r))
    nT = sum(r.count('T') for r in L['rows'])
    nO = sum(r.count('o') for r in L['rows'])
    assert nT == len(L['hints']), ('signs', i + 1, nT, len(L['hints']))
    assert nO == 3, ('gems', i + 1, nO)
    assert sum(r.count('S') for r in L['rows']) == 1 and sum(r.count('F') for r in L['rows']) == 1, i + 1

out = ['// ===== NIVELES · Cuentos del Medioevo: Escalada Épica · Etapa 1: El Volcán =====',
       '// Generado por tools/genlevels.py. Filas de ABAJO hacia ARRIBA (fila 0 = suelo).',
       '// .  vacío   #  roca basáltica (se agarra)   Z  muro enano liso   I  obsidiana (resbala, no se agarra)',
       '// C  roca agrietada   =  andamio de madera   |  cadena   ^ v > <  púas   L  lava',
       '// P  anclaje rúnico   o  gema de fuego   m  poción de vigor   R  rocas ardientes   V  estalactita',
       '// Y  diablillo   A  goblin arquero   H  respiradero de fuego   U  runa de escarcha   T  letrero   S  inicio   F  estandarte',
       'const LEVELS = (function () {',
       '  function L(def) { def.map = def.rows.slice().reverse(); return def; }',
       '  return [']
for L in LEVELS:
    meta = {k: v for k, v in L.items() if k != 'rows'}
    js = json.dumps(meta, ensure_ascii=False)[:-1]
    out.append('    L(' + js + ', "rows": [')
    for b, r in enumerate(L['rows']):
        out.append('      ' + json.dumps(r) + ',  // ' + str(b))
    out.append('    ]}),')
out += ['  ];', '})();', "if (typeof module !== 'undefined') module.exports = LEVELS;", '']
open('/home/claude/escalada/src/levels.js', 'w').write('\n'.join(out))
print('ok', [len(L['rows']) for L in LEVELS])
