import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/escalada/dist/index.html'
JS='''([li, path, nh]) => {
  const G = window.__EE; G.start(li); if (G.B) G.skipBoss();
  const D = path.dirs; let st = 'play';
  for (const [d,j,g] of path.acts) {
    const base = {left:D[d][0]<0,right:D[d][0]>0,up:D[d][1]<0,down:D[d][1]>0,jump:j>0,grab:g===1};
    st = G.sim(Object.assign({}, base, {jumpPressed: j===1}), 1, nh);
    st = G.sim(Object.assign({}, base, {jumpPressed:false}), path.fr-1, nh);
    if (st !== 'play' || G.falls > 0) break;
  }
  if (st === 'play' && G.B) { for (let k=0;k<240 && st==='play';k++) st = G.sim({left:false,right:false,up:false,down:false,jump:false,grab:false,jumpPressed:false},1,nh); for (let k=0;k<60 && st==='play';k++) st = G.sim({left:false,right:true,up:false,down:false,jump:false,grab:false,jumpPressed:false},1,nh); }
  return {st, falls: G.falls, row: G.L.H-1-Math.floor((G.player.y+7)/12), col: Math.floor((G.player.x+4)/12), t: G.time.toFixed(1), gems: G.got,
          runes: G.E.runes.filter(u=>u.used).length, boss: G.B ? G.B.st : '-'};
}'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(viewport={'width':800,'height':700}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        for li in range(10):
            path=json.load(open(f'/home/claude/escalada/shots/path{li}.json'))
            for nh in (True, False):
                r = await pg.evaluate(JS, [li, path, nh])
                print(f"nivel {li+1:2d} {'sin peligros' if nh else 'CON peligros'}: {r}")
        print('errors', errs[:5])
        await b.close()
asyncio.run(main())
