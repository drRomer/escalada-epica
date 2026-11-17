import asyncio
from playwright.async_api import async_playwright
URL='file:///home/claude/escalada/dist/index.html'
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--autoplay-policy=no-user-gesture-required'])
        pg = await b.new_page(viewport={'width':1000,'height':760}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(500)
        idle = "{left:false,right:false,up:false,down:false,jump:false,grab:false,jumpPressed:false}"
        # lava que sube: quedarse quieto hasta morir y reaparecer
        r = await pg.evaluate(f"(()=>{{const G=window.__EE;G.start(4);G.sim({idle},60*40,false);return {{st:G.state,falls:G.falls,y:Math.round(G.player.y)}};}})()")
        print('lava sube, quieta 40s:', r)
        # jefe: quieta 25 s con peligros
        r = await pg.evaluate(f"(()=>{{const G=window.__EE;G.start(9);G.sim({idle},60*25,false);return {{st:G.state,falls:G.falls,boss:G.B.st,hp:G.B.hp}};}})()")
        print('jefe, quieta 25s:', r)
        # pisotón: caer sobre un goblin en el nivel 7
        r = await pg.evaluate(f"""(()=>{{const G=window.__EE;G.start(6);const g=G.E.goblins[0];G.teleport(g.x+2,g.y-30);G.sim({idle},50,false);return {{alive:g.alive,falls:G.falls,vy:Math.round(G.player.vy)}};}})()""")
        print('pisotón goblin:', r)
        # teclado real
        await pg.evaluate("window.__EE.setState('title')"); await pg.wait_for_timeout(200)
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(400)
        x0 = await pg.evaluate('window.__EE.player.x')
        await pg.keyboard.down('ArrowRight'); await pg.wait_for_timeout(600); await pg.keyboard.up('ArrowRight')
        x1 = await pg.evaluate('window.__EE.player.x')
        print('teclado: estado', await pg.evaluate('window.__EE.state'), 'x', round(x0), '->', round(x1))
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
