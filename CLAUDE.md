# CLAUDE.md - RPG Dream

Basahin din: `PROJECT_RULES.md` (rules) at `HANDOFF.md` (current status). Ang mga file na ito ang source of truth.

## Project

Top-down anime JRPG village prototype. HTML5 canvas, vanilla JS, classic `<script>` tags (walang ES modules, walang bundler) para gumana kahit i-double-click lang ang `index.html`.

## Key files

- `src/world.js` - lahat ng map data: walkable polygon, solids, NPC rects, dialogue, quest flags. **Map units = pixels ng original 527x518 reference image.** `assets/map.png` ay 2x nito; `SCALE = 2` sa `game.js`.
- `src/game.js` - engine. Order ng render: map -> hero -> overlays (fountain/NPC occlusion) -> HUD -> dialogue -> touch controls.
- `assets/` - images. Tingnan `assets/README.md` para sa sizes.
- `tools/screenshot.mjs` - Playwright smoke test. Patakbuhin bago mag-commit ng engine changes: `npm test`.

## Conventions

- Walang external dependencies sa runtime. Playwright ay dev-only.
- Dialogue text ay English (in-game). Comments ay pwedeng Taglish.
- Collision = point tests sa hero feet (`heroFits`). Baguhin ang `walkable` polygon at `npcs[].rect` sa `world.js`, hindi ang engine, kapag inaayos ang map.
- Huwag mag-commit ng `node_modules/` o scratch files. Screenshots na galing sa test ay pumupunta sa `docs/`.

## Workflow

1. Edit -> `npm test` -> tingnan ang `docs/shot-*.png`.
2. Commit sa feature branch. Hindi nagme-merge sa `main` nang walang explicit na "GO" ng owner.
3. I-update ang `HANDOFF.md` sa bawat session.
