# Cuentos del Medioevo: Escalada Épica

Plataformas de escalada en pixel art 16-bit, de la saga **Cuentos del Medioevo** (después de *Sendero del Orbe*).
Trepa el Monte Sagrado en 5 etapas de 10 niveles, cada una con un jefe en la cima:

| Etapa | Mundo | Jefe |
|---|---|---|
| 1 | Bosque de la montaña (tutorial) | Spriggan corrupto |
| 2 | Cumbres nevadas | Bestia de las nieves |
| 3 | Volcán y cráter | Gólem de lava |
| 4 | Torre fantasma | Fantasma de la torre |
| 5 | Ascenso espiritual | Carcelero de almas |

**Jugar:** https://drromer.github.io/escalada-epica/ — en el celular se puede instalar como app y funciona sin conexión.
Guardado en el dispositivo y, si quieres, en la nube con tu cuenta Google (la misma de Sendero del Orbe). Sin anuncios.

## Controles
- **Celular:** cruz para moverte y trepar; botones de salto ↖ ↑ ↗ (los diagonales rebotan entre paredes). Te agarras sola a la roca.
- **Teclado:** flechas/WASD, Espacio o Z para saltar, Q/E salto diagonal, Esc pausa, M sonido.

## Estructura
- `src/` — el juego (JavaScript sin dependencias): física (`core.js`), niveles (`levels.js`), sprites de texto (técnica Cumbre), arte procedural, audio sintetizado y `game.js`.
- `tools/` — generador de niveles por tramos verificados con la misma física (`gen2.js`, `chunks.js`, `build_levels.js`), verificador (`solve.js`, `segsolve.js`), conversión de hojas de Gemini (`gconv*.py`), logo y builds.
- `web/` — versión publicada: nube (Firebase Auth + Firestore Lite), service worker, íconos, privacidad y reglas de Firestore.
- `docs/` — sitio generado que sirve GitHub Pages (no editar a mano).

## Compilar
```bash
node tools/build_levels.js            # niveles → src/levels.js
node tools/build.js                   # vista previa → dist/index.html (modo revisión: todo abierto)
cd web && npm install && cd ..
python3 tools/build_web.py --out docs # sitio publicado (niveles en orden, nube, PWA)
```
Reglas de Firestore: `web/firebase/firestore.rules` (incluye las de Sendero del Orbe).

Privacidad: [docs/privacidad.html](https://drromer.github.io/escalada-epica/privacidad.html)
