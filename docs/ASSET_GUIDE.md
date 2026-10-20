# Asset Guide - paano gumawa ng art para sa RPG Dream

Ang current na map ay ang reference image mismo (527x518, upscaled 2x). Para sa mas malinis at mas malaking laro, mag-generate ng bagong assets (AI image generator o artist) gamit ang mga spec sa ibaba, tapos i-drop sa `assets/`.

## Style prompt (gamitin sa lahat)

> Classic anime JRPG game art, clean lines, vibrant colors, readable, 3/4 top-down view, soft painterly shading, no text, no watermark.

## 1. Map (backdrop)

- Prompt add-on: *"medieval fantasy village plaza, cobblestone, fountain in center, half-timber houses with orange and blue roofs, market stalls with striped awnings, trees. **No people, no animals, no text or labels.** Full square composition, nothing cut off at the edges."*
- Size: 1024x1024 o mas malaki (square). Dapat 1:1 ang ratio para sa `SCALE = 2` setup, o i-adjust ang `mapSize` at `cameraBounds` sa `src/world.js`.
- I-save bilang `assets/map.png`. I-update sa `src/world.js`: `mapSize` (= image width/2, height/2), `cameraBounds`, `walkable` polygon, `solids`, `npcs[].rect`.

## 2. Hero sprite sheet

- Prompt add-on: *"character sprite sheet, young swordsman with green cloak and brown spiky hair, chibi proportions, 4 rows: facing down, left, right, up; 4 walk frames per row; **transparent background**, consistent size per cell."*
- Cell size: 96x96 px (o 88x148 kung iisang pose lang tulad ngayon).
- I-save bilang `assets/hero.png`. Kung sprite sheet na, kailangan i-update ang `drawHero()` sa `src/game.js` para pumili ng frame (row = dir, col = frame). Sabihin lang kay Claude: "hero.png is now a 4x4 sheet, 96px cells".

## 3. NPCs (optional, para gumalaw sila)

- Same prompt pattern sa hero, ibang description per character. Transparent background.
- Kapag may NPC sprites na, pwedeng alisin ang naka-bake na tao sa map at gawing totoong entities ang NPCs (gumagalaw, sumusunod si Mochi, atbp.).

## Checklist bago i-drop

- [ ] Transparent background (PNG with alpha) para sa characters
- [ ] Walang text/label sa map
- [ ] Nakasulat sa `assets/README.md` ang bagong sizes
