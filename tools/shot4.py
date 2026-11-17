import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/escalada/dist/index.html'
REPLAY='''([li, path, upto]) => { const G = window.__EE; G.start(li); if (G.B) G.skipBoss();
  const D = path.dirs; const n = Math.floor(path.acts.length*upto);
  for (let k=0;k<n;k++){ const [d,j,g]=path.acts[k]; const base={left:D[d][0]<0,right:D[d][0]>0,up:D[d][1]<0,down:D[d][1]>0,jump:j>0,grab:g===1};
    G.sim(Object.assign({},base,{jumpPressed:j===1}),1,true); G.sim(Object.assign({},base,{jumpPressed:false}),path.fr-1,true); }
  return G.player.state; }'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await pg.screenshot(path='shots/f_title.png')
        await pg.evaluate("window.__EE.unlockAll()"); await pg.evaluate("window.__EE.setState('select')"); await pg.wait_for_timeout(300); await pg.screenshot(path='shots/f_map.png')
        await pg.evaluate("window.__EE.start(9)"); await pg.wait_for_timeout(2600); await pg.screenshot(path='shots/f_boss_intro.png')
        for li,upto,name in [(1,0.55,'l2'),(5,0.5,'l6'),(6,0.3,'l7'),(7,0.45,'l8'),(8,0.3,'l9'),(9,0.8,'boss_top')]:
            path=json.load(open(f'shots/path{li}.json'))
            await pg.evaluate(REPLAY,[li,path,upto])
            if name=='boss_top': await pg.evaluate("window.__EE.sim({},40,true)")
            await pg.wait_for_timeout(350); await pg.screenshot(path=f'shots/f_{name}.png')
        await pg.evaluate("window.__EE.setState('cloaks')"); await pg.wait_for_timeout(300); await pg.screenshot(path='shots/f_cloaks.png')
        await pg.evaluate("window.__EE.setState('ending')"); await pg.wait_for_timeout(2600); await pg.screenshot(path='shots/f_ending.png')
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
