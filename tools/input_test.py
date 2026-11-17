import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/cumbre/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        errs=[]
        pg = await b.new_page(viewport={'width':1000,'height':760})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)   # JUGAR
        st = await pg.evaluate('window.__CUMBRE.state'); print('tras ENTER:', st)
        x0 = await pg.evaluate('window.__CUMBRE.player.x')
        await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(500)
        await pg.keyboard.press('Space'); await pg.wait_for_timeout(120)
        y1 = await pg.evaluate('window.__CUMBRE.player.y')
        await pg.wait_for_timeout(600); await pg.keyboard.up('ArrowRight')
        x1 = await pg.evaluate('window.__CUMBRE.player.x')
        print('x', round(x0), '->', round(x1), '| y en salto', round(y1))
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        print('Esc ->', await pg.evaluate('window.__CUMBRE.state'))
        await pg.screenshot(path='shots/d_pause.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
        # crumble/chalk visual in level 2
        await pg.evaluate('window.__CUMBRE.start(1)'); await pg.evaluate('window.__CUMBRE.teleport(30, 17*12)'); await pg.wait_for_timeout(400)
        await pg.screenshot(path='shots/d_l2_mid.png')
        # mobile touch
        ctx = await b.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
        m = await ctx.new_page(); m.on('pageerror', lambda e: errs.append(str(e)))
        await m.goto(URL); await m.wait_for_timeout(400)
        await m.tap('#bA'); await m.wait_for_timeout(300)
        print('móvil tras tocar A:', await m.evaluate('window.__CUMBRE.state'))
        await m.wait_for_timeout(2600)
        # tocar A para saltar
        y0 = await m.evaluate('window.__CUMBRE.player.y')
        box = await m.locator('#bA').bounding_box()
        await m.touchscreen.tap(box['x']+box['width']/2, box['y']+box['height']/2); await m.wait_for_timeout(150)
        y2 = await m.evaluate('window.__CUMBRE.player.y')
        print('salto táctil y', round(y0), '->', round(y2))
        await m.tap('#mPause'); await m.wait_for_timeout(150)
        print('pausa táctil ->', await m.evaluate('window.__CUMBRE.state'))
        print('errors', errs)
        await b.close()
asyncio.run(main())
