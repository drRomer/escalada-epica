#!/usr/bin/env python3
"""Genera la versión web publicable (PWA + nube) de Escalada Épica, lista para GitHub Pages.

Uso:
    node tools/build.js                   # src/ → dist/index.html (vista previa)
    python3 tools/build_web.py --out DIR  # → DIR (normalmente <repo>/docs)

Requiere: cd web && npm install   (Firebase y esbuild)
En la web publicada no hay modo revisión: web.js define EE_WEB y los niveles se abren en orden.
"""
import os, re, sys, json, hashlib, base64, shutil, subprocess, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEB = os.path.join(ROOT, 'web'); STATIC = os.path.join(WEB, 'static')
SITE = os.environ.get('EE_SITE_URL', 'https://drromer.github.io/escalada-epica/')
REPO = os.environ.get('EE_REPO_URL', 'https://github.com/drRomer/escalada-epica')
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, 'docs')
NAME = 'Escalada Épica · Cuentos del Medioevo'
DESC = 'Plataformas de escalada en pixel art: trepa el Monte Sagrado por el bosque, la nieve, el volcán, la torre fantasma y el plano espiritual. 50 niveles y 5 jefes. Sin anuncios.'


def sha(b): return hashlib.sha256(b).hexdigest()
def b64sha(s): return base64.b64encode(hashlib.sha256(s.encode('utf-8')).digest()).decode()
def must(c, m):
    if not c: sys.exit('build_web: ' + m)


def main():
    must(os.path.isdir(os.path.join(WEB, 'node_modules')), 'falta web/node_modules (cd web && npm install)')
    subprocess.run(['node', os.path.join(ROOT, 'tools', 'build.js')], check=True, capture_output=True)
    html = open(os.path.join(ROOT, 'dist', 'index.html'), encoding='utf-8').read()
    subprocess.run(['npx', '--no-install', 'esbuild', 'src/cloud.js', '--bundle', '--format=esm', '--target=es2019',
                    '--legal-comments=none', '--minify', '--outfile=dist/cloud.js'], cwd=WEB, check=True, capture_output=True)
    cloud = open(os.path.join(WEB, 'dist', 'cloud.js'), 'rb').read()
    today = datetime.date.today()
    build = today.strftime('%Y%m%d') + '-' + sha(html.encode() + cloud + open(os.path.join(STATIC, 'sw.js'), 'rb').read())[:6]

    # 1) Metadatos de app, íconos y vista previa al compartir.
    meta = '\n'.join([
        '<meta http-equiv="Content-Security-Policy" content="__CSP__">',
        '<meta name="referrer" content="strict-origin-when-cross-origin">',
        f'<meta name="description" content="{DESC}">',
        '<link rel="manifest" href="manifest.webmanifest">',
        '<link rel="icon" type="image/png" href="icons/favicon-64.png">',
        '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">',
        '<meta name="mobile-web-app-capable" content="yes">',
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">',
        '<meta name="apple-mobile-web-app-title" content="Escalada Épica">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:title" content="{NAME}">',
        f'<meta property="og:description" content="{DESC}">',
        f'<meta property="og:url" content="{SITE}">',
        f'<meta property="og:image" content="{SITE}og.jpg">',
        '<meta name="twitter:card" content="summary_large_image">',
    ])
    anchor = '<meta name="theme-color" content="#120a10">'
    must(html.count(anchor) == 1, 'falta theme-color en shell.html')
    html = html.replace(anchor, anchor + '\n' + meta, 1)

    # 2) Scripts externos: configuración + arranque web antes del juego; módulo de nube al final.
    first = html.index('<script>')
    html = html[:first] + '<script src="config.js"></script>\n<script src="web.js?v=' + build + '"></script>\n' + html[first:]
    end = html.rindex('</body>')
    html = html[:end] + '<script type="module" src="cloud.js?v=' + build + '"></script>\n' + html[end:]

    # 3) CSP con el hash del script en línea: solo corre lo de este sitio y el inicio de sesión de Google.
    inline = re.findall(r'<script>(.*?)</script>', html, flags=re.S)
    must(len(inline) == 1, f'se esperaba 1 script en línea, hay {len(inline)}')
    csp = '; '.join([
        "default-src 'self'",
        "script-src 'self' " + ' '.join(f"'sha256-{b64sha(s)}'" for s in inline) + ' https://apis.google.com',
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://*.googleusercontent.com",
        "font-src 'self'",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com",
        "frame-src https://*.firebaseapp.com https://*.web.app https://accounts.google.com https://apis.google.com",
        "worker-src 'self'", "manifest-src 'self'", "media-src 'self' data: blob:",
        "object-src 'none'", "base-uri 'self'", "form-action 'none'",
    ])
    html = html.replace('__CSP__', csp, 1)

    # 4) Escribir el sitio.
    if os.path.isdir(OUT):
        for n in os.listdir(OUT):
            p = os.path.join(OUT, n)
            shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(html)
    open(os.path.join(OUT, 'cloud.js'), 'wb').write(cloud)
    for n in ['config.js', 'web.js', 'og.jpg']:
        shutil.copy(os.path.join(STATIC, n), os.path.join(OUT, n))
    open(os.path.join(OUT, 'web.js'), 'a', encoding='utf-8').write("window.EE_BUILD = '" + build + "';\n")
    shutil.copytree(os.path.join(STATIC, 'icons'), os.path.join(OUT, 'icons'))
    priv = open(os.path.join(STATIC, 'privacidad.html'), encoding='utf-8').read()
    open(os.path.join(OUT, 'privacidad.html'), 'w', encoding='utf-8').write(priv.replace('__UPDATED__', today.strftime('%d-%m-%Y')).replace('__REPO__', REPO))
    manifest = {
        'id': './', 'name': NAME, 'short_name': 'Escalada Épica', 'description': DESC, 'lang': 'es-CL', 'dir': 'ltr', 'categories': ['games'],
        'start_url': './?src=app', 'scope': './', 'display': 'fullscreen', 'display_override': ['fullscreen', 'standalone'], 'orientation': 'portrait',
        'background_color': '#120a10', 'theme_color': '#120a10',
        'icons': [
            {'src': 'icons/icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icons/icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
            {'src': 'icons/maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
        ],
    }
    open(os.path.join(OUT, 'manifest.webmanifest'), 'w', encoding='utf-8').write(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    pre = ['./', 'index.html', 'config.js', 'web.js?v=' + build, 'cloud.js?v=' + build, 'manifest.webmanifest',
           'icons/icon-192.png', 'icons/icon-512.png', 'icons/favicon-64.png', 'privacidad.html']
    sw = open(os.path.join(STATIC, 'sw.js'), encoding='utf-8').read().replace('__BUILD__', build).replace('__PRECACHE__', json.dumps(pre))
    open(os.path.join(OUT, 'sw.js'), 'w', encoding='utf-8').write(sw)
    open(os.path.join(OUT, '.nojekyll'), 'w').write('')
    size = sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(OUT) for f in fs)
    print(f'{OUT}  build {build}  {size / 1024:.0f} KB')


if __name__ == '__main__':
    main()
