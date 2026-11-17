# Reproduce dentro del juego real (física + entidades, sin daño) la ruta por tramos de cada nivel y comprueba que llega al estandarte.
import asyncio, json, os, sys
from playwright.async_api import async_playwright
URL = 'file:///home/claude/escalada/dist/index.html'
RUN = '''([li, path]) => { const G = window.__EE; G.start(li); if (G.B) G.skipBoss();
  const D = path.dirs;
  for (const [d, j, n] of path.acts) { const base = {left: D[d][0] < 0, right: D[d][0] > 0, up: D[d][1] < 0, down: D[d][1] > 0, jump: j > 0, grab: false};
    if (G.sim(Object.assign({}, base, {jumpPressed: j === 1}), 1, true) !== 'play') break;
    if ((n || path.fr) > 1 && G.sim(Object.assign({}, base, {jumpPressed: false}), (n || path.fr) - 1, true) !== 'play') break; }
  if (G.state === 'play' && G.B) {
    G.sim({}, 320, true);
    const f = G.E.flag, dir = (f.x + 6) > (G.player.x + 4) ? 1 : -1;
    for (let k = 0; k < 160 && G.state === 'play'; k++) { G.sim({left: dir < 0, right: dir > 0, jump: k % 40 < 10, jumpPressed: k % 40 === 0}, 1, true); }
  }
  return {state: G.state, falls: G.falls, y: Math.round(G.player.y), boss: G.B ? G.B.st : null}; }'''
async def main():
    a = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    z = int(sys.argv[2]) if len(sys.argv) > 2 else 49
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(400)
        bad = []
        for li in range(a, z + 1):
            f = f'/home/claude/escalada/shots/route{li}.json'
            if not os.path.exists(f): print(li + 1, 'sin ruta'); bad.append(li); continue
            r = await pg.evaluate(RUN, [li, json.load(open(f))])
            ok = r['state'] == 'clear' and r['falls'] == 0
            print(li + 1, 'OK' if ok else 'FALLA', r)
            if not ok: bad.append(li)
        print('errores JS', errs[:5]); print('fallan', [x + 1 for x in bad])
        await b.close()
asyncio.run(main())
