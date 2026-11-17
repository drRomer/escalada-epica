const CORE=require('../src/core.js'); const LEVELS=require('../src/levels.js'); const {solve,trace}=require('./solve.js');
const li=+process.argv[2], b=+process.argv[3], c=+process.argv[4];
const def=JSON.parse(JSON.stringify(LEVELS[li]));
// move S to (bottom-up row b, col c)
def.rows=def.rows.map(r=>r.replace('S','.'));
const r=def.rows[b].split(''); r[c]='S'; def.rows[b]=r.join(''); def.map=def.rows.slice().reverse();
const res=solve(def, +(process.argv[5]||200000)); const tr=trace(res);
console.log(res.ok?'OK':'FAIL', res.expanded, 'best row(top-down)', Math.floor(res.nodes[res.end].p.y/12));
const lines=tr.map.split('\n'); const from=+(process.argv[6]||0), to=+(process.argv[7]||lines.length); console.log(lines.slice(from,to).join('\n'));
