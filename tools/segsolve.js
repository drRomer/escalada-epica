// Ruta completa por tramos: resuelve cada nivel de repisa en repisa desde el estado real donde terminó el tramo anterior.
// Escribe shots/route{li}.json para reproducirla dentro del juego (tools/replay5.py).
// Uso: node tools/segsolve.js [desde] [hasta]
const CORE = require('../src/core.js');
const LEVELS = require('../src/levels.js');
const CHUNKS = require('./chunks.js');
const SPECS = require('./levelspec.js');
const { key, DIRS, FR, DT, Heap } = require('./solve.js');
const { T, PW, PH, K } = CORE;
const fs = require('fs');
const ACTS = []; for (let d = 0; d < DIRS.length; d++) for (let j = 0; j < 3; j++) ACTS.push([d, j]);

function search(L, p0, goal, maxNodes, lam, ceil, hf) {
  hf = hf || (q => q.y);
  const nodes = [{ p: p0, parent: -1, act: null, d: 0 }];
  const seen = new Set([key(p0)]);
  const heap = new Heap(); heap.push(p0.y, 0);
  let expanded = 0, best = 0;
  const env = { wind: 0 };
  while (heap.size && expanded < maxNodes) {
    const [, idx] = heap.pop(); expanded++;
    const base = nodes[idx].p;
    for (const act of ACTS) {
      const [d, j] = act;
      if (j === 1 && base.buf > 0) continue;
      const p = CORE.clonePlayer(base);
      let dead = false, win = false, used = FR;
      for (let i = 0; i < FR; i++) {
        const inp = { left: DIRS[d][0] < 0, right: DIRS[d][0] > 0, up: DIRS[d][1] < 0, down: DIRS[d][1] > 0, jump: j > 0, jumpPressed: j === 1 && i === 0, grab: false };
        CORE.step(L, p, inp, DT, env);
        for (const m of L.e.chalk) if (CORE.overlap(p.x, p.y, PW, PH, m.x, m.y, 8, 8)) p.stamina = K.ST_MAX;
        if (CORE.hazard(L, p) || (p.y - p.apexY) > K.CATCH_FALL) { dead = true; break; }
        if (goal(p)) { win = true; used = i + 1; break; }
        if (ceil !== undefined && p.y + PH < ceil) { dead = true; break; }
      }
      if (dead) continue;
      const k = key(p); if (seen.has(k)) continue; seen.add(k);
      nodes.push({ p, parent: idx, act: win ? [d, j, used] : act, d: nodes[idx].d + 1 });
      const ni = nodes.length - 1;
      if (p.y < nodes[best].p.y) best = ni;
      if (win) { const acts = []; let q = ni; while (q > 0) { acts.push(nodes[q].act); q = nodes[q].parent; } return { ok: true, acts: acts.reverse(), end: p, expanded }; }
      heap.push(hf(p) + nodes[idx].d * lam + ni * 1e-9, ni);
    }
  }
  return { ok: false, expanded, bestY: nodes[best].p.y };
}

function boundaries(li) {
  // filas (de abajo hacia arriba) de las repisas de salida de cada tramo
  const s = SPECS[li];
  if (s.legacy !== undefined) return [];
  const g = JSON.parse(fs.readFileSync(__dirname + '/out/gen_' + li + '.json', 'utf8'));
  const out = []; let b = 0;
  for (const id of g.chunks) { const t = CHUNKS.find(c => c.id === id.replace('~', '')); b += t.rows.length; out.push(b); }
  return out;
}

if (require.main === module) {
  const a = Number(process.argv[2] || 0), z = Number(process.argv[3] || LEVELS.length - 1);
  for (let li = a; li <= z; li++) {
    const def = LEVELS[li], L = CORE.parseLevel(def), H = L.H;
    const t0 = Date.now();
    let p = CORE.newPlayer(L.e.start.x, L.e.start.y);
    const acts = [];
    const bs = boundaries(li);
    let ok = true, msg = '';
    // metas en orden de altura: repisas de salida de cada tramo y, en los jefes, cada runa
    const runeRows = new Set(L.e.runes.map(u => H - 1 - u.r));
    const goals = bs.filter(b => !(def.boss && runeRows.has(b + 1))).map(b => ({ y: (H - 1 - b) * T, k: 'stand', b }));
    if (def.boss) for (const u of L.e.runes) goals.push({ y: u.r * T + T - 0.5, k: 'rune', u });
    else goals.push({ y: -1, k: 'flag' });
    goals.sort((g1, g2) => g2.y - g1.y);
    const f = L.e.flag;
    for (let gi = 0; gi < goals.length; gi++) {
      const g = goals[gi];
      const fn = g.k === 'stand' ? (q => q.onGround && q.state === 'normal' && Math.abs(q.y + PH - g.y) < 0.7)
        : g.k === 'rune' ? (q => (q.onGround || q.state !== 'normal') && CORE.overlap(q.x, q.y, PW, PH, g.u.c * T, g.u.r * T - 6, T, T + 6))
        : (q => CORE.overlap(q.x, q.y, PW, PH, f.x, f.y - 12, T, T + 12));
      let r = null;
      const budget = bs.length ? 150000 : 500000;
      const ceil = g.k === 'flag' ? undefined : g.y - (g.k === 'rune' ? 9 : 4) * T;
      const hf = g.k === 'rune' ? (q => Math.abs(q.x - g.u.c * T) * 0.7 + Math.abs(q.y - g.u.r * T) + (q.y < g.u.r * T - 60 ? 0 : 0)) : undefined;
      for (const lam of [1.2, 0.5, 3]) { r = search(L, CORE.clonePlayer(p), fn, budget, lam, ceil, hf); if (r.ok) break; }
      if (!r.ok) r = search(L, CORE.clonePlayer(p), fn, 900000, 1.2, ceil === undefined ? undefined : ceil - 4 * T);
      if (process.env.DBG) console.log("  meta", g.k, g.b, g.u && [g.u.c, H - 1 - g.u.r], r.ok, r.expanded, 'desde', Math.round(p.x), H - 1 - Math.floor((p.y + PH - 1) / T));
      if (!r.ok && g.k === 'stand' && !g.skip) { msg += ' salta repisa ' + g.b; continue; }   // repisa intermedia imposible: se busca la siguiente
      if (!r.ok) { ok = false; msg = g.k + ' (mejor fila ' + (H - 1 - Math.floor(r.bestY / T)) + ')'; break; }
      acts.push(...r.acts); p = r.end;
    }
    if (ok) fs.writeFileSync(__dirname + '/../shots/route' + li + '.json', JSON.stringify({ fr: FR, dirs: DIRS, acts: acts.map(([d, j, n]) => [d, j, n || FR]) }));
    console.log('Nivel ' + (li + 1) + ' ' + def.name + ': ' + (ok ? 'RUTA OK · ' + (acts.length * FR / 60).toFixed(1) + 's de juego' : 'FALLA ' + msg) + ' · ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
}
