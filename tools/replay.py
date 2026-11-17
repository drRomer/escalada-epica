import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/cumbre/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width':800,'height':700})
        errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        for li in range(4):
            path=json.load(open(f'/home/claude/cumbre/shots/path{li}.json'))
            for nh in (True, False):
                res = await pg.evaluate('''([li, path, nh]) => {
                  const G = window.__CUMBRE; G.start(li);
                  const D = path.dirs; let st = 'play';
                  for (const [d,j,g] of path.acts) {
                    const base = {left:D[d][0]<0,right:D[d][0]>0,up:D[d][1]<0,down:D[d][1]>0,jump:j>0,grab:g===1};
                    st = G.sim(Object.assign({}, base, {jumpPressed: j===1}), 1, nh);
                    st = G.sim(Object.assign({}, base, {jumpPressed:false}), path.fr-1, nh);
                    if (st !== 'play' || G.falls > 0) break;
                  }
                  return {st, falls: G.falls, px: Math.round(G.player.x), py: Math.round(G.player.y), row: Math.round(G.player.y/12), botrow: G.L.H-1-Math.floor((G.player.y+7)/12), y: Math.round(G.player.y/12), time: G.time.toFixed(1), got: G.got};
                }''', [li, path, nh])
                print('nivel', li+1, 'sin peligros dinámicos' if nh else 'con peligros', res)
        print('errors', errs)
        await b.close()
asyncio.run(main())
