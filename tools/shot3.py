import asyncio, json, sys
from playwright.async_api import async_playwright
URL='file:///home/claude/escalada/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(1200)
        await pg.screenshot(path='shots/e_title.png')
        await pg.evaluate("window.__EE.unlockAll()")
        await pg.evaluate("window.__EE.setState('select')"); await pg.wait_for_timeout(400); await pg.screenshot(path='shots/e_map.png')
        await pg.evaluate("window.__EE.setState('cloaks')"); await pg.wait_for_timeout(400); await pg.screenshot(path='shots/e_cloaks.png')
        for i in range(10):
            await pg.evaluate(f"window.__EE.start({i})"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'shots/e_l{i}.png')
        await pg.wait_for_timeout(4500); await pg.screenshot(path='shots/e_boss_fight.png')
        print('errors', errs[:10])
        await b.close()
asyncio.run(main())
