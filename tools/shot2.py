import asyncio, json
from playwright.async_api import async_playwright
URL='file:///home/claude/cumbre/dist/index.html'
REPLAY='''([li, path, upto]) => {
  const G = window.__CUMBRE; G.start(li);
  const D = path.dirs; const n = Math.floor(path.acts.length*upto);
  for (let k=0;k<n;k++){ const [d,j,g]=path.acts[k];
    const base={left:D[d][0]<0,right:D[d][0]>0,up:D[d][1]<0,down:D[d][1]>0,jump:j>0,grab:g===1};
    G.sim(Object.assign({},base,{jumpPressed:j===1}),1,true); G.sim(Object.assign({},base,{jumpPressed:false}),path.fr-1,true); }
  return G.player.state;
}'''
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        await pg.screenshot(path='shots/m_title.png')
        for li,upto in [(0,0.35),(1,0.5),(2,0.62),(3,0.55)]:
            path=json.load(open(f'shots/path{li}.json'))
            st = await pg.evaluate(REPLAY,[li,path,upto]); await pg.wait_for_timeout(250)
            await pg.screenshot(path=f'shots/m_l{li}.png'); print(li, st)
        await pg.evaluate("window.__CUMBRE.clear()"); await pg.wait_for_timeout(1600)
        await pg.screenshot(path='shots/m_clear.png')
        await pg.evaluate("window.__CUMBRE.setState('ending')"); await pg.wait_for_timeout(2500)
        await pg.screenshot(path='shots/m_ending.png')
        # landscape
        ctx2 = await b.new_context(viewport={'width':844,'height':390}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg2 = await ctx2.new_page(); pg2.on('pageerror', lambda e: errs.append(str(e)))
        await pg2.goto(URL); await pg2.wait_for_timeout(400)
        await pg2.evaluate("window.__CUMBRE.start(1)"); await pg2.wait_for_timeout(300)
        await pg2.screenshot(path='shots/m_land.png')
        print('errors', errs)
        await b.close()
asyncio.run(main())
