import asyncio, sys, json
from playwright.async_api import async_playwright
URL='file:///home/claude/cumbre/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        errs=[]
        # desktop
        pg = await b.new_page(viewport={'width':1100,'height':760})
        pg.on('console', lambda m: errs.append(('console',m.type,m.text)) if m.type in ('error','warning') else None)
        pg.on('pageerror', lambda e: errs.append(('pageerror',str(e))))
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.screenshot(path='shots/d_title.png')
        await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(400)
        await pg.screenshot(path='shots/d_select.png')
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(300)
        await pg.screenshot(path='shots/d_help.png')
        for i in range(4):
            await pg.evaluate(f'window.__CUMBRE.start({i})'); await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'shots/d_lvl{i}_start.png')
        print('errors', json.dumps(errs, ensure_ascii=False)[:3000])
        await b.close()
asyncio.run(main())
