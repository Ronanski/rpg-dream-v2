# HANDOFF.md

## Current status (2026-10-20)

**Branch:** `ccr-8b30cd0b-uq3moz` (walang `main` pa sa GitHub; ito ang unang branch ng repo).

**Playable prototype:** `index.html` + `src/` + `assets/`. Painted village backdrop (galing sa owner's reference image) na may naglalakad na hero, collision, dialogue, isang quest, touch controls.

### What changed this session

- Unang commit (33a704d) ay procedural/vector art (code-drawn tiles at chibi). Tinanggihan ng owner: malayo sa painted reference. Tinanggal na (`src/art.js`, `src/sprites.js`, `docs/art-preview.png`); nasa git history pa rin kung kailangan.
- Ginamit ang reference image mismo bilang map (`assets/map.png`, 2x upscale). Ang hero ay na-cut mula sa image (`assets/hero.png`) at tinakpan ng cobblestone ang dating puwesto niya sa map.
- Engine (`src/game.js`), world data (`src/world.js`), smoke test (`tools/screenshot.mjs`), docs.

### What was checked

- `npm test` (Playwright, headless Chromium): loads nang walang JS errors, hero moves, hindi makapasok sa fountain, dialogue kay Mira nagbubukas at nagsasara. Screenshots: `docs/shot-title.png`, `docs/shot-play.png`, `docs/shot-dialogue.png`.

### What was NOT checked

- Hindi na-test sa totoong phone/touch device (touch code ay nasa place pero headless lang ang test).
- Hindi na-test sa Firefox/Safari.
- Walang audio.

### Known limitations / remaining issues

- Iisang frame lang ang hero (walang walk animation, walang back view; flip lang sa left/right at bob).
- Lahat ng NPC ay naka-bake sa map image: hindi gumagalaw, hindi pwedeng umalis sa puwesto. Si Mochi ay hindi sumusunod.
- Camera ay hindi ipinapakita ang top 76px (label box ng reference) at ang putol na bottom-right corner.
- Low resolution ang source (527px); may bahagyang blur sa 2x at sa portraits.
- Collision polygon ay hand-tuned; posibleng may maliit na spot na mali.

### Next action

1. Owner: tingnan ang `docs/shot-play.png`; sabihin kung OK ang direction.
2. Gumawa ng mas magandang assets gamit `docs/ASSET_GUIDE.md` (map na walang characters at label, hero sprite sheet na may 4 directions). I-drop sa `assets/`, i-update ang `world.js` coordinates.
3. Owner decision: gumawa ng `main` branch para may base ang PR.
