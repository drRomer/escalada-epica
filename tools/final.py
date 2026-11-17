import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/escalada/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(700); await pg.screenshot(path='shots/g_title.png')
        await pg.evaluate("window.__EE.unlockAll()"); await pg.evaluate("window.__EE.setState('select')"); await pg.wait_for_timeout(300); await pg.screenshot(path='shots/g_map.png')
        d = await b.new_page(viewport={'width':1200,'height':800}); d.on('pageerror', lambda e: errs.append(str(e)))
        await d.goto(URL); await d.wait_for_timeout(400); await d.evaluate("window.__EE.start(9)"); await d.wait_for_timeout(2800); await d.screenshot(path='shots/g_desk_boss.png')
        print('errors', errs); await b.close()
asyncio.run(main())
