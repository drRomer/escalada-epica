import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/escalada/dist/index.html'
JS='''(li) => { const G = window.__EE; const out = [];
  G.start(li); if (G.B) G.skipBoss();
  const n = G.E.anchors.length;
  for (let k = 0; k < n; k++) {
    G.start(li); if (G.B) G.skipBoss();
    const a = G.E.anchors[k]; G.teleport(a.x, a.y);
    G.sim({left:false,right:false,up:false,down:false,jump:false,grab:false,jumpPressed:false}, 120, true);
    out.push({k, c: a.c, r: G.L.H - 1 - a.r, falls: G.falls});
  }
  return out.filter(o => o.falls > 0); }'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(); await pg.goto(URL); await pg.wait_for_timeout(500)
        for li in range(10):
            bad = await pg.evaluate(JS, li)
            print('nivel', li + 1, 'anclajes que matan al reaparecer:', bad)
        await b.close()
asyncio.run(main())
