import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await b.new_page(viewport={'width':1200,'height':900}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/escalada/tools/preview2.html'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='shots/preview.png'); print(errs); await b.close()
asyncio.run(main())
