import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/escalada/tools/extract.html'); await pg.wait_for_timeout(2500)
        out=await pg.evaluate('window.OUT'); rp=await pg.evaluate('window.RPX')
        json.dump({'spr':out,'rp':rp}, open('/home/claude/escalada/tools/pxr_dump.json','w'))
        print(errs)
        for k,v in out.items():
            cols=set(c for c in v['px'] if c)
            print(k, v['w'],'x',v['h'], 'colores', len(cols))
        await b.close()
asyncio.run(main())
