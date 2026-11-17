import asyncio, sys
from playwright.async_api import async_playwright
from PIL import Image
URL='file:///home/claude/escalada/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type=='error' and errs.append(m.text))
        await pg.goto(URL); await pg.wait_for_timeout(600)
        shots=[]
        async def snap(name):
            f='shots/s5_'+name+'.png'; await pg.screenshot(path=f); shots.append(f)
        await snap('title')
        await pg.evaluate("window.__EE.unlockAll()")
        for k in range(5):
            await pg.evaluate(f"window.__EE.story({k})"); await pg.wait_for_timeout(5000 if k==0 else 300); await snap(f'story{k}')
        for k in range(5):
            await pg.evaluate(f"window.__EE.setState('select',{k})"); await pg.wait_for_timeout(250); await snap(f'map{k}')
        for li in [int(x) for x in sys.argv[1].split(',')] if len(sys.argv)>1 else [0,3,8,10,14,22,30,33,40,46]:
            await pg.evaluate(f"window.__EE.start({li})"); await pg.evaluate("window.__EE.sim({},30,true)")
            await pg.wait_for_timeout(200); await snap(f'l{li}a')
            await pg.evaluate("(()=>{const G=window.__EE;const L=G.L;G.cam(L.H*12*0.45);})()"); await pg.wait_for_timeout(200); await snap(f'l{li}b')
        for li in [9,19,29,39,49]:
            await pg.evaluate(f"window.__EE.start({li})"); await pg.wait_for_timeout(3100); await snap(f'boss{li}')
            await pg.evaluate("window.__EE.skipBoss()"); await pg.evaluate("window.__EE.sim({},200,true)"); await pg.wait_for_timeout(300); await snap(f'fight{li}')
        for k in [0,4]:
            await pg.evaluate(f"window.__EE.setState('ending',{k})"); await pg.wait_for_timeout(400); await snap(f'end{k}')
        print('errors', errs[:8]); await b.close()
        ims=[Image.open(f).resize((195,422)) for f in shots]
        cols=8; rows=(len(ims)+cols-1)//cols
        sheet=Image.new('RGB',(cols*197, rows*424),(0,0,0))
        for i,im in enumerate(ims): sheet.paste(im,((i%cols)*197,(i//cols)*424))
        sheet.save('shots/s5_sheet.png'); print(len(ims),'capturas')
asyncio.run(main())
