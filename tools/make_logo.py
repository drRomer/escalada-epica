# Renderiza tools/logo.js con los módulos del juego y guarda el logo (1x y 4x, fondo transparente).
import asyncio, base64, io, os
from playwright.async_api import async_playwright
from PIL import Image
D = '/home/claude/escalada/'
mods = ['core.js', 'font.js', 'sprites.js', 'sprites2.js', 'spr.js', 'art.js']
js = '\n'.join(open(D + 'src/' + m).read().replace("if (typeof module !== 'undefined') module.exports", "//") for m in mods) + '\n' + open(D + 'tools/logo.js').read()
html = '<!doctype html><canvas id=c width=192 height=240></canvas><script>' + js + '\nconst c=document.getElementById("c");drawLogo(c.getContext("2d"));window.done=1;</script>'
open('/tmp/logo.html', 'w').write(html)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        pg = await b.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file:///tmp/logo.html'); await pg.wait_for_timeout(300)
        if errs: print('errores', errs)
        data = await pg.evaluate("document.getElementById('c').toDataURL('image/png')")
        await b.close()
    im = Image.open(io.BytesIO(base64.b64decode(data.split(',')[1]))).convert('RGBA')
    im.save('/tmp/logo_full.png')
    bb = im.getbbox(); im = im.crop((max(0, bb[0] - 2), max(0, bb[1] - 2), min(im.width, bb[2] + 2), min(im.height, bb[3] + 2)))
    os.makedirs(D + 'assets', exist_ok=True)
    im.save(D + 'assets/logo_1x.png')
    big = im.resize((im.width * 4, im.height * 4), Image.NEAREST); big.save(D + 'assets/logo.png')
    prev = Image.new('RGBA', big.size, (31, 44, 52, 255)); prev.alpha_composite(big); prev.convert('RGB').save('/tmp/logo_prev.png')
    print('logo', im.size, '->', big.size)
asyncio.run(main())
