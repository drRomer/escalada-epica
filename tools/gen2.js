// Generador de niveles por tramos verificados con la MISMA física del juego (CORE).
// Uso:  node tools/gen2.js test            → verifica cada tramo de la biblioteca por separado
//       node tools/gen2.js build [desde] [hasta]  → genera los niveles nuevos y escribe tools/out/gen_*.json
const CORE = require('../src/core.js');
const CHUNKS = require('./chunks.js');
const { key, DIRS, FR, DT, Heap } = require('./solve.js');
const { T, PW, PH, K } = CORE;
const fs = require('fs');

const LAM = Number(process.env.LAM || 1.2);
const ACTS = []; for (let d = 0; d < DIRS.length; d++) for (let j = 0; j < 3; j++) ACTS.push([d, j]);

function rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function mkL(gridTopDown) { return { W: 16, H: gridTopDown.length, grid: gridTopDown.map(r => r.split('')), crumble: {}, e: { chalk: [] }, def: {} }; }

// ¿Desde qué posiciones se puede estar de pie sobre la fila rf?
function entries(L, rf) {
  const ok = [];
  for (let c = 1; c < 15; c++) {
    if (!(CORE.solid(L, c, rf) || CORE.oneWay(L, c, rf))) continue;
    const x = c * T + T / 2 - PW / 2, y = rf * T - PH;
    if (CORE.rectAny(L, x, y, PW, PH, CORE.solid)) continue;
    const p = CORE.newPlayer(x, y);
    if (CORE.hazard(L, p)) continue;
    ok.push(c);
  }
  const segs = []; let cur = null;
  for (const c of ok) { if (cur && c === cur[cur.length - 1] + 1) cur.push(c); else { cur = [c]; segs.push(cur); } }
  const pick = new Set();
  for (const s of segs) { pick.add(s[0]); pick.add(s[s.length - 1]); pick.add(s[Math.floor(s.length / 2)]); }
  return [...pick];
}

// búsqueda best-first desde (c, fila rf) hasta quedar de pie sobre la fila rt
function reach(L, c, rf, rt, maxNodes) {
  const p0 = CORE.newPlayer(c * T + T / 2 - PW / 2, rf * T - PH);
  p0.onGround = true;
  const env = { wind: 0 };
  const nodes = [{ p: p0, parent: -1, act: null, d: 0 }];
  const seen = new Set([key(p0)]);
  const heap = new Heap(); heap.push(p0.y, 0);
  const goalY = rt * T;
  let expanded = 0, best = 0;
  while (heap.size && expanded < maxNodes) {
    const [, idx] = heap.pop(); expanded++;
    const base = nodes[idx].p;
    for (const act of ACTS) {
      const [d, j] = act;
      if (j === 1 && base.buf > 0) continue;
      const p = CORE.clonePlayer(base);
      let dead = false, win = false;
      for (let i = 0; i < FR; i++) {
        const inp = { left: DIRS[d][0] < 0, right: DIRS[d][0] > 0, up: DIRS[d][1] < 0, down: DIRS[d][1] > 0, jump: j > 0, jumpPressed: j === 1 && i === 0, grab: false };
        CORE.step(L, p, inp, DT, env);
        if (CORE.hazard(L, p) || (p.y - p.apexY) > K.CATCH_FALL) { dead = true; break; }
        if (p.onGround && p.state === 'normal' && Math.abs(p.y + PH - goalY) < 0.7) { win = true; break; }
      }
      if (dead) continue;
      const k = key(p); if (seen.has(k)) continue; seen.add(k);
      nodes.push({ p, parent: idx, act, d: nodes[idx].d + 1 });
      if (win) return { ok: true, expanded };
      if (p.y < nodes[best].p.y) best = nodes.length - 1;
      heap.push(p.y + nodes[idx].d * LAM + nodes.length * 1e-9, nodes.length - 1);
    }
  }
  if (process.env.DBG) {
    const map = L.grid.map(r => r.slice());
    let i = best; while (i >= 0) { const q = nodes[i].p; const cc = Math.floor((q.x + PW / 2) / T), rr = Math.floor((q.y + PH / 2) / T); if (map[rr] && map[rr][cc] === '.') map[rr][cc] = '*'; i = nodes[i].parent; }
    console.log(map.map(r => r.join('')).join('\n'));
  }
  return { ok: false, expanded };
}

// tramo resuelto para el solver: comodines → tiles estáticos
const SOLID = ch => ch === '#' || ch === 'Z' || ch === 'I' || ch === 'C';
function staticRows(rows) {
  return rows.map(r => r.replace(/[gkeaprhx]/g, '.').replace(/b/g, '=').replace(/c/g, 'C').replace(/w/g, '#').replace(/[st]/g, '.'));
}
function validate(floorRow, rows, above, maxNodes) {
  const grid = [...above, ...rows, floorRow];
  const L = mkL(grid);
  const rf = grid.length - 1, rt = above.length;
  const ent = entries(L, rf);
  if (!ent.length) return { ok: false, why: 'sin entrada' };
  let total = 0;
  for (const c of ent) {
    const r = reach(L, c, rf, rt, maxNodes || 60000);
    total += r.expanded;
    if (!r.ok) return { ok: false, why: 'desde col ' + c, total };
  }
  return { ok: true, total, ent };
}
function mirror(rows) { return rows.map(r => r.split('').reverse().map(ch => ch === '<' ? '>' : ch === '>' ? '<' : ch).join('')); }

if (require.main === module && process.argv[2] === 'test') {
  const only = process.argv[3];
  const floor = '################';
  const above = ['Z..............Z', '................', '................'];
  for (const ch of CHUNKS) {
    if (only && ch.id !== only) continue;
    for (const m of [false, true]) {
      const rows = staticRows(m ? mirror(ch.rows) : ch.rows);
      const bad = rows.find(r => r.length !== 16);
      if (bad) { console.log(ch.id, 'FILA MAL', bad); continue; }
      const t0 = Date.now();
      const v = validate(floor, rows, above);
      console.log((v.ok ? 'OK   ' : 'FALLA') + ' ' + ch.id + (m ? ' (espejo)' : '') + '  ' + (v.why || '') + '  nodos ' + v.total + '  ' + (Date.now() - t0) + 'ms');
    }
  }
}
module.exports = { validate, staticRows, mirror, rng, entries, reach, mkL };

// ======================= COMPOSICIÓN DE NIVELES =======================
const ENT = /[YWGOAMRVHXPomTSFU]/g;
function solverRows(rows) { return rows.map(r => r.replace(ENT, '.')); }
const isSol = ch => ch === '#' || ch === 'Z' || ch === 'I' || ch === 'C';
const isStand = ch => isSol(ch) || ch === '=' || ch === 'B';

function pickW(R, arr, wf) { const w = arr.map(wf); const s = w.reduce((a, b) => a + b, 0); let x = R() * s; for (let i = 0; i < arr.length; i++) { x -= w[i]; if (x <= 0) return arr[i]; } return arr[arr.length - 1]; }

// resuelve comodines de un tramo (filas arriba→abajo). Las decisiones que dependen de vecinos se toman con la fila de abajo (floor) conocida.
function resolve(tpl, stage, diff, R, mir) {
  let rows = (mir ? mirror(tpl.rows) : tpl.rows).map(r => r.split(''));
  const H = rows.length;
  const at = (r, c) => (r < 0 || r >= H || c < 0 || c > 15) ? (c < 0 || c > 15 ? 'Z' : '.') : rows[r][c];
  const p = (base, k) => R() < Math.min(0.92, base + k * diff);
  const slots = { g: [], k: [], e: [], a: [] };
  // primero los tiles estructurales
  for (let r = 0; r < H; r++) for (let c = 0; c < 16; c++) {
    const ch = rows[r][c];
    if (ch === 'c') rows[r][c] = p(0.25, 0.06) ? 'C' : '#';
    else if (ch === 'w') rows[r][c] = (stage === 'N' && p(0.35, 0.06)) || (stage === 'V' && p(0.25, 0.05)) ? 'I' : '#';
    else if (ch === 'b') rows[r][c] = stage === 'E' && p(0.25, 0.06) ? 'B' : '=';
  }
  // una plataforma B se decide por grupo contiguo (que no quede mitad = y mitad B)
  for (let r = 0; r < H; r++) for (let c = 1; c < 16; c++) if (rows[r][c] === '=' && rows[r][c - 1] === 'B') rows[r][c] = 'B';
  for (let r = 0; r < H; r++) for (let c = 14; c >= 0; c--) if (rows[r][c] === '=' && rows[r][c + 1] === 'B') rows[r][c] = 'B';
  for (let r = 0; r < H; r++) for (let c = 0; c < 16; c++) {
    const ch = rows[r][c];
    if (ch === 's' || ch === 't') {
      const on = ch === 's' ? p(0.15, 0.07) : p(0.1, 0.08);
      let sp = '.';
      if (on) {
        const below = isSol(at(r + 1, c)), above = isSol(at(r - 1, c)), left = isSol(at(r, c - 1)), right = isSol(at(r, c + 1));
        if (ch === 's') sp = below ? '^' : above ? 'v' : left ? '>' : right ? '<' : '.';
        else sp = left && !right ? '>' : right && !left ? '<' : below ? '^' : '.';
      }
      rows[r][c] = on ? sp : (ch === 't' ? '#' : '.');
    } else if (ch === 'r') {
      rows[r][c] = '.';
      if (p(0.3, 0.05)) rows[r][c] = (isSol(at(r - 1, c)) && (stage === 'N' || stage === 'T')) ? 'V' : 'R';
    } else if (ch === 'h') {
      rows[r][c] = '.';
      const on = stage === 'V' ? p(0.5, 0.05) : (stage === 'T' || stage === 'E') ? p(0.3, 0.05) : false;
      if (on && isStand(at(r + 1, c))) rows[r][c] = 'H';
    } else if (ch === 'x') {
      rows[r][c] = (stage === 'T' || stage === 'E') && p(0.4, 0.06) ? 'X' : '.';
    } else if (ch === 'p') rows[r][c] = 'm';
    else if ('gkea'.includes(ch)) { slots[ch].push([r, c]); rows[r][c] = '.'; }
  }
  return { rows: rows.map(r => r.join('')), slots, id: tpl.id + (mir ? '~' : '') };
}

const FLYERS = { F: d => d >= 3 && Math.random() < 0.4 ? 'W' : 'Y', N: d => d >= 3 && Math.random() < 0.45 ? 'W' : 'Y', V: d => d >= 3 && Math.random() < 0.45 ? 'W' : 'Y',
  T: d => { const x = Math.random(); return d >= 5 && x < 0.3 ? 'O' : d >= 2 && x < 0.65 ? 'G' : 'Y'; },
  E: d => { const x = Math.random(); return d >= 5 && x < 0.25 ? 'O' : x < 0.55 ? 'G' : d >= 3 && x < 0.8 ? 'W' : 'Y'; } };
const SHOOTERS = { F: d => d >= 5 && Math.random() < 0.5 ? 'M' : 'A', N: () => 'M', V: d => Math.random() < 0.5 ? 'M' : 'A', T: () => 'A', E: () => null };

// valida el tramo i del nivel con su piso real y las 2 filas de abajo del tramo siguiente
const vcache = new Map();
function checkChunk(floorRow, rows, aboveRows) {
  const k = floorRow + '|' + rows.join('') + '|' + aboveRows.join('');
  if (vcache.has(k)) return vcache.get(k);
  let v = validate(floorRow, solverRows(rows), solverRows(aboveRows), 70000);
  if (!v.ok) v = validate(floorRow, solverRows(rows), solverRows(aboveRows), 220000);
  vcache.set(k, v.ok);
  return v.ok;
}

function buildLevel(spec, log) {
  const R = rng(spec.seed * 7919 + 13);
  Math.random = R;                       // FLYERS/SHOOTERS usan Math.random → determinista por nivel
  const stage = spec.gen, diff = spec.diff;
  const pool = CHUNKS.filter(t => t.st.includes(stage) && t.d <= diff + 1);
  const used = new Map();
  const pickChunk = () => {
    const t = pickW(R, pool, t => (1 + (t.d >= diff - 2 ? 2 : 0)) / (1 + 3 * (used.get(t.id) || 0)));
    used.set(t.id, (used.get(t.id) || 0) + 1);
    return resolve(t, stage, diff, R, R() < 0.5);
  };
  const n = spec.chunks;
  const ch = []; for (let i = 0; i < n; i++) ch.push(pickChunk());
  // corona: arena de jefe (fila de peligro con hueco de tablones + runa y estandarte) o meta normal
  const crownMir = R() < 0.5;
  const fix = r => crownMir ? r.split('').reverse().join('') : r;
  const crown = spec.arena
    ? [fix('Z...........U.FZ'), fix('Z####LLLLLL==##Z'), fix('Z..............Z')]          // arriba→abajo
    : null;
  let tries = 0;
  for (;;) {
    let allOk = true;
    for (let i = 0; i < n; i++) {
      const floor = i === 0 ? '################' : ch[i - 1].rows[0];
      let above;
      if (i < n - 1) { const nr = ch[i + 1].rows; above = [nr[nr.length - 2], nr[nr.length - 1]]; }
      else above = crown ? crown.slice(1).map(r => r.replace(/L/g, '#')) : ['Z..............Z', 'Z..............Z'];
      const lastRows = (i === n - 1 && crown) ? [...ch[i].rows] : ch[i].rows;
      if (!checkChunk(floor, lastRows, above)) {
        allOk = false; tries++;
        log && log('  tramo ' + i + ' (' + ch[i].id + ') falla → reemplazo');
        ch[i] = pickChunk();
        break;
      }
    }
    if (allOk) break;
    if (tries > 60) throw new Error('no converge ' + spec.name);
  }
  // ---- armado (abajo→arriba) ----
  const out = ['################'];
  const slotAbs = { g: [], k: [], e: [], a: [] };
  const chunkBase = [];
  for (let i = 0; i < n; i++) {
    const rs = ch[i].rows, H = rs.length;
    chunkBase.push(out.length);
    for (let j = H - 1; j >= 0; j--) out.push(rs[j]);
    for (const s in ch[i].slots) for (const [r, c] of ch[i].slots[s]) slotAbs[s].push([out.length - 1 - r, c, i]);
  }
  const topSep = out.length - 1;
  if (crown) { out.push(crown[2], crown[1], crown[0]); for (let k = 0; k < 8; k++) out.push('................'); }
  else {
    const top = out[topSep];
    const cand = []; for (let c = 2; c < 14; c++) if (isStand(top[c])) cand.push(c);
    const fc = cand[Math.floor(cand.length / 2)];
    out.push('Z' + '.'.repeat(fc - 1) + 'F' + '.'.repeat(14 - fc) + 'Z', 'Z..............Z', '................', '................');
  }
  const grid = out.map(r => r.split(''));
  const set = (b, c, chr) => { grid[b][c] = chr; };
  const free = (b, c) => grid[b] && grid[b][c] === '.';
  const standOn = (b, c) => b > 0 && isStand(grid[b - 1][c]) && free(b, c) && (b + 1 >= grid.length || !isSol(grid[b + 1][c]));
  // inicio
  { const b = 1; const cs = [2, 13, 3, 12, 4, 11, 7]; const c = cs.find(c => standOn(b, c)) || cs.find(c => free(b, c)); set(b, c, 'S'); }
  // anclajes: uno por tramo (salvo en dificultad alta, donde se saltan algunos)
  for (let i = 1; i < n; i++) {
    if (diff >= 7 && i % 3 === 2) continue;
    const ks = slotAbs.k.filter(s => s[2] === i && standOn(s[0], s[1]));
    let k = ks[0];
    if (!k) { const b = chunkBase[i]; for (let c = 1; c < 15 && !k; c++) if (standOn(b, c)) k = [b, c]; }
    if (k) set(k[0], k[1], 'P');
  }
  if (crown) { for (let c = 1; c < 15; c++) if (standOn(topSep + 1, c) && grid[topSep + 2][c] !== 'L') { set(topSep + 1, c, 'P'); break; } }
  // enemigos
  const pe = Math.min(0.85, 0.2 + 0.07 * diff);
  for (const [b, c] of slotAbs.e) if (free(b, c) && R() < pe) { const t = FLYERS[stage](diff); set(b, c, t); }
  const pa = Math.min(0.8, 0.25 + 0.06 * diff);
  for (const [b, c] of slotAbs.a) if (standOn(b, c) && R() < pa) { const t = SHOOTERS[stage](diff); if (t) set(b, c, t); }
  // gemas: 3 repartidas en tercios
  const gs = slotAbs.g.filter(s => free(s[0], s[1])).sort((a, b) => a[0] - b[0]);
  const gems = [];
  if (gs.length >= 3) { for (let k = 0; k < 3; k++) gems.push(gs[Math.floor((k + 0.5) * gs.length / 3)]); }
  else { gems.push(...gs); for (let b = 3; gems.length < 3 && b < out.length; b += 7) for (let c = 3; c < 13; c++) if (free(b, c) && !gems.some(g => g[0] === b)) { gems.push([b, c]); break; } }
  for (const g of gems) set(g[0], g[1], 'o');
  // poción en tramos largos (dificultad media/alta)
  if (diff >= 4) { const left = gs.filter(s => free(s[0], s[1])); if (left.length) { const s = left[Math.floor(R() * left.length)]; set(s[0], s[1], 'm'); } }
  // runas de la arena: sobre la repisa de salida de los tramos 1 y 2 (+ la de la corona)
  if (crown) {
    const targets = [chunkBase[Math.min(1, n - 1)] , chunkBase[Math.min(2, n - 1)]].map((b, k) => k === 0 ? chunkBase[1] + 0 : chunkBase[n - 1]);
    for (const tb of [chunkBase[1], chunkBase[n - 1]]) {
      const b = tb; let done = false;
      for (const c of [12, 3, 11, 4, 10, 5, 9, 6, 8, 7]) if (standOn(b, c)) { set(b, c, 'U'); done = true; break; }
      if (!done) for (let bb = b + 1; bb < b + 4 && !done; bb++) for (let c = 2; c < 14; c++) if (standOn(bb, c)) { set(bb, c, 'U'); done = true; break; }
    }
    void targets;
  }
  // letreros de tutorial
  if (spec.hints) {
    spec.hints.forEach((h, k) => {
      const i = Math.min(k, n - 1), b = chunkBase[i];
      for (const c of [4, 11, 5, 10, 6, 9, 3, 12]) if (standOn(b, c) && grid[b][c] === '.') { set(b, c, 'T'); return; }
      for (let bb = b + 1; bb < b + 5; bb++) for (let c = 2; c < 14; c++) if (standOn(bb, c) && grid[bb][c] === '.') { set(bb, c, 'T'); return; }
      throw new Error('sin lugar para letrero ' + k + ' en ' + spec.name);
    });
  }
  return { rows: grid.map(r => r.join('')), chunks: ch.map(c => c.id) };
}

if (require.main === module && process.argv[2] === 'build') {
  const SPECS = require('./levelspec.js');
  const a = Number(process.argv[3] || 0), z = Number(process.argv[4] || SPECS.length - 1);
  fs.mkdirSync(__dirname + '/out', { recursive: true });
  for (let i = a; i <= z; i++) {
    const s = SPECS[i];
    if (!s.gen) continue;
    const t0 = Date.now();
    const res = buildLevel(s, m => console.log(m));
    fs.writeFileSync(__dirname + '/out/gen_' + i + '.json', JSON.stringify(res));
    console.log('NIVEL ' + (i + 1) + ' ' + s.name + ': ' + res.rows.length + ' filas · ' + res.chunks.join(', ') + ' · ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
}
