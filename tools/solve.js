// Verificador de niveles: búsqueda best-first (prioriza altura) usando la MISMA física del juego.
// Uso: node tools/solve.js [indiceNivel] [maxNodos]
const CORE = require('../src/core.js');
const LEVELS = require('../src/levels.js');
const { T, PW, PH, K } = CORE;

const DIRS = [[0, 0], [-1, 0], [1, 0], [0, -1], [-1, -1], [1, -1], [0, 1]];
const ACTIONS = [];
const GRABS = process.env.GRAB ? [0, 1] : [0];
for (let d = 0; d < DIRS.length; d++) for (let j = 0; j < 3; j++) for (const g of GRABS) ACTIONS.push([d, j, g]);
const FR = 5, DT = 1 / 60;

class Heap {
  constructor() { this.a = []; }
  push(k, v) { const a = this.a; a.push([k, v]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a; const top = a[0]; const last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m; } } return top; }
  get size() { return this.a.length; }
}

const STC = { n: 0, c: 1, r: 2 };
function key(p) {
  let k = Math.round(p.x / 2) + 128;                       // 9 bits
  k = k * 2048 + (Math.round(p.y / 2) + 64);               // 11 bits
  k = k * 32 + (Math.round(p.vx / 20) + 16);
  k = k * 32 + (Math.round(p.vy / 30) + 16);
  k = k * 4 + STC[p.state[0]];
  k = k * 8 + Math.max(0, Math.round(p.stamina / 18));
  k = k * 64 + (p.wjLock > 0 ? 1 : 0) + (p.regrab ? 2 : 0) + (p.hop > 0 ? 4 : 0) + (p.coyote > 0 ? 8 : 0) + (p.buf > 0 ? 16 : 0) + (p.ropeCd > 0 ? 32 : 0);
  return k;
}

function solve(def, maxNodes) {
  const L = CORE.parseLevel(def);
  const f = L.e.flag;
  const p0 = CORE.newPlayer(L.e.start.x, L.e.start.y);
  const env = { wind: 0 };
  const nodes = [{ p: p0, parent: -1, act: null, d: 0 }];
  const LAMBDA = Number(process.env.LAMBDA || 1.2);
  const seen = new Set([key(p0)]);
  const heap = new Heap();
  heap.push(p0.y, 0);
  let best = 0, expanded = 0;
  while (heap.size && expanded < maxNodes) {
    const [, idx] = heap.pop();
    expanded++;
    const base = nodes[idx].p;
    for (const act of ACTIONS) {
      const [d, j, g] = act;
      if (j === 1 && base.buf > 0) continue;
      const p = CORE.clonePlayer(base);
      let dead = false, win = false;
      for (let i = 0; i < FR; i++) {
        const inp = { left: DIRS[d][0] < 0, right: DIRS[d][0] > 0, up: DIRS[d][1] < 0, down: DIRS[d][1] > 0, jump: j > 0, jumpPressed: j === 1 && i === 0, grab: g === 1 };
        CORE.step(L, p, inp, DT, env);
        for (const m of L.e.chalk) if (CORE.overlap(p.x, p.y, PW, PH, m.x, m.y, 8, 8)) p.stamina = K.ST_MAX;
        if (CORE.hazard(L, p) || (p.y - p.apexY) > K.CATCH_FALL) { dead = true; break; }
        if (CORE.overlap(p.x, p.y, PW, PH, f.x, f.y, T, T)) { win = true; break; }
      }
      if (dead) continue;
      const k = key(p);
      if (seen.has(k)) continue;
      seen.add(k);
      const dep = nodes[idx].d + 1;
      nodes.push({ p, parent: idx, act, d: dep });
      const ni = nodes.length - 1;
      if (p.y < nodes[best].p.y) best = ni;
      if (win) return { ok: true, expanded, nodes, end: ni, L };
      heap.push(p.y + dep * LAMBDA + nodes.length * 1e-9, ni);
    }
  }
  return { ok: false, expanded, nodes, end: best, L };
}

function trace(res) {
  const { L, nodes } = res;
  const map = L.def.map.map(r => r.split(''));
  let i = res.end; let steps = 0;
  while (i >= 0) {
    const p = nodes[i].p;
    const c = Math.floor((p.x + PW / 2) / T), r = Math.floor((p.y + PH / 2) / T);
    if (map[r] && map[r][c] === '.') map[r][c] = '*';
    i = nodes[i].parent; steps++;
  }
  return { map: map.map((r, n) => String(n).padStart(3) + ' ' + r.join('')).join('\n'), steps };
}

if (require.main === module) {
  const which = process.argv[2] !== undefined ? [Number(process.argv[2])] : LEVELS.map((_, i) => i);
  const maxN = Number(process.argv[3] || 400000);
  const show = process.argv.includes('--map');
  for (const li of which) {
    const def = LEVELS[li];
    const t0 = Date.now();
    const res = solve(def, maxN);
    const tr = trace(res);
    const endP = res.nodes[res.end].p;
    console.log(`Nivel ${li + 1} "${def.name}" (${def.map.length} filas): ${res.ok ? 'COMPLETABLE' : 'NO COMPLETADO'} | nodos ${res.expanded} | ${(Date.now() - t0) / 1000}s | ${res.ok ? 'tiempo ruta ~' + (tr.steps * FR / 60).toFixed(1) + 's' : 'fila más alta alcanzada ' + Math.floor(endP.y / T)}`);
    if (show || !res.ok) console.log(tr.map);
    if (process.argv.includes('--out') && res.ok) {
      const acts = []; let i = res.end; while (i > 0) { acts.push(res.nodes[i].act); i = res.nodes[i].parent; }
      acts.reverse();
      require('fs').writeFileSync(__dirname + '/../shots/path' + li + '.json', JSON.stringify({ fr: FR, dirs: DIRS, acts }));
    }
  }
}
module.exports = { solve, trace, key, ACTIONS, DIRS, FR, DT, Heap };
