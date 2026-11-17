// Arma src/levels.js con los 50 niveles: legacy (hechos a mano, verificados) + generados (tools/out/gen_*.json).
const fs = require('fs');
const SPECS = require('./levelspec.js');
const LEG = require('./legacy_levels.js');
const out = [
  '// ===== NIVELES · Cuentos del Medioevo: Escalada Épica · 5 etapas × 10 niveles =====',
  '// Generado por tools/build_levels.js. Filas de ABAJO hacia ARRIBA (fila 0 = suelo).',
  '// .  vacío   #  roca (se agarra)   Z  muro liso   I  hielo/obsidiana (resbala, no se agarra)   C  roca agrietada',
  '// =  plataforma (se atraviesa desde abajo)   B  plataforma de luz (parpadea)   |  liana/cadena   ^ v > <  púas   X  púas retráctiles',
  '// L  peligro del jefe (lava, espinas...)   P  anclaje   o  gema   m  poción   R  caída de rocas   V  carámbano/estalactita',
  '// Y  volador   W  volador que se lanza en picada   G  fantasma   O  sierra   A  arquero   M  simio que lanza   H  respiradero',
  '// U  runa del jefe   T  letrero   S  inicio   F  estandarte   Q  corazón extra   D  pluma de levitación (poderes permanentes)',
  'const LEVELS = (function () {',
  '  function L(def) { def.map = def.rows.slice().reverse(); return def; }',
  '  return ['];
SPECS.forEach((s, i) => {
  let rows;
  if (s.legacy !== undefined) {
    rows = LEG[s.legacy].rows.slice();
    if (!s.hints) rows = rows.map(r => r.replace(/T/g, '.'));        // sin tutoriales desde el nivel 11
  } else {
    const f = __dirname + '/out/gen_' + i + '.json';
    if (!fs.existsSync(f)) {
      if (!process.argv.includes('--partial')) throw new Error('falta ' + f);
      rows = LEG[s.boss ? 9 : 3].rows.map(r => r.replace(/T/g, '.'));     // provisorio solo para probar
      if (s.hints) rows = rows.slice(); 
    } else rows = JSON.parse(fs.readFileSync(f, 'utf8')).rows;
  }
  // ajustes a mano tras probar las rutas: [fila, columna origen, columna destino]
  const MOVE = { 9: [[14, 12, 4]] };
  for (const [b, c0, c1] of (MOVE[i] || [])) { const r = rows[b].split(''); if (r[c0] !== '.' && r[c1] === '.') { r[c1] = r[c0]; r[c0] = '.'; rows[b] = r.join(''); } }
  // nada importante sobre plataformas de luz (parpadean): anclajes, runas, inicio y estandarte se corren a suelo firme
  {
    const g = rows.map(r => r.split(''));
    const firm = (b, c) => b > 0 && '#ZIC='.includes(g[b - 1][c]) && g[b][c] === '.';
    for (let b = 1; b < g.length; b++) for (let c = 1; c < 15; c++) {
      if (!'PUSFT'.includes(g[b][c]) || g[b - 1][c] !== 'B') continue;
      const ch = g[b][c]; g[b][c] = '.';
      let moved = false;
      for (const d of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) { const cc = c + d; if (cc > 0 && cc < 15 && firm(b, cc)) { g[b][cc] = ch; moved = true; break; } }
      if (!moved && ch !== 'P') throw new Error(s.name + ': ' + ch + ' sobre plataforma de luz sin lugar firme');
    }
    // inicio donde la heroína quepa de pie (sin roca encima)
    for (let c = 1; c < 15; c++) if (g[1][c] === 'S' && '#ZIC'.includes(g[2][c])) {
      g[1][c] = '.';
      let best = -1; for (let cc = 1; cc < 15; cc++) if (g[1][cc] === '.' && !'#ZIC'.includes(g[2][cc]) && '#ZIC='.includes(g[0][cc]) && (best < 0 || Math.abs(cc - c) < Math.abs(best - c))) best = cc;
      if (best < 0) throw new Error(s.name + ': sin lugar para el inicio');
      g[1][best] = 'S';
    }
    rows = g.map(r => r.join(''));
  }
  // púas mirando al lado correcto: '>' va pegada a una pared a su izquierda, '<' a la derecha, '^' sobre suelo; las que flotan se quitan
  {
    const g = rows.map(r => r.split('')), H = g.length;
    const at = (b, c) => (c < 0 || c > 15) ? 'Z' : (b < 0 ? '#' : b >= H ? '.' : g[b][c]);
    const sol = ch => '#ZIC'.includes(ch), sup = ch => '#ZIC=B'.includes(ch);
    for (let b = 0; b < H; b++) for (let c = 0; c < 16; c++) {
      const ch = g[b][c], Lf = at(b, c - 1), Rt = at(b, c + 1), Dn = at(b - 1, c), Up = at(b + 1, c);
      if (ch === '>' && !sol(Lf)) g[b][c] = sol(Rt) ? '<' : '.';
      else if (ch === '<' && !sol(Rt)) g[b][c] = sol(Lf) ? '>' : '.';
      else if (ch === '^' && !sup(Dn)) g[b][c] = sol(Up) ? 'v' : '.';
      else if (ch === 'v' && !sol(Up)) g[b][c] = sup(Dn) ? '^' : '.';
    }
    rows = g.map(r => r.join(''));
  }
  if (s.boss) {
    let top = -1; for (let b = rows.length - 1; b >= 0; b--) if (rows[b].includes('L')) { top = b; break; }
    if (top >= 0) rows[top] = rows[top].replace(/L/g, '#');
    rows = rows.concat(['................', '................', '................', '................']);
  }
  const nT = rows.join('').split('T').length - 1;
  let hints = s.hints || [];
  if (process.argv.includes('--partial') && nT !== hints.length) hints = hints.slice(0, nT);
  if (nT !== hints.length) throw new Error(s.name + ': letreros ' + nT + ' vs pistas ' + hints.length);
  const nO = rows.join('').split('o').length - 1;
  if (nO !== 3) throw new Error(s.name + ': gemas ' + nO);
  const meta = { name: s.name, sub: s.sub, theme: s.theme, stage: Math.floor(i / 10) };
  if (s.boss) meta.boss = s.boss;
  if (s.wind) meta.wind = s.wind;
  const lg = s.legacy !== undefined ? LEG[s.legacy] : null;
  if (lg && lg.rise) meta.rise = lg.rise;
  if (lg && lg.wind && !s.wind) meta.wind = lg.wind;
  meta.hints = hints;
  out.push('    L(' + JSON.stringify(meta).slice(0, -1) + ', "rows": [');
  rows.forEach((r, b) => out.push('      ' + JSON.stringify(r) + ',  // ' + b));
  out.push('    ]}),');
});
out.push('  ];', '})();', "if (typeof module !== 'undefined') module.exports = LEVELS;", '');
fs.writeFileSync(__dirname + '/../src/levels.js', out.join('\n'));
console.log('ok', SPECS.length, 'niveles');
