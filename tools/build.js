// Une todo en un solo index.html autocontenido
const fs = require('fs'), path = require('path');
const src = f => fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8');
const order = ['core.js', 'levels.js', 'font.js', 'audio.js', 'sprites.js', 'sprites2.js', 'spr.js', 'art.js', 'game.js'];
const js = order.map(f => '// ---- ' + f + ' ----\n' + src(f).replace(/\nif \(typeof module !== 'undefined'\)[^\n]*\n?/g, '\n')).join('\n');
const html = src('shell.html').replace('/*__SCRIPT__*/', () => '"use strict";\n' + js);
fs.mkdirSync(path.join(__dirname, '..', 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index.html'), html);
console.log('dist/index.html', (html.length / 1024).toFixed(1) + ' KB');
