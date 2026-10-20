/* Smoke test: binubuksan ang game sa headless Chromium, nag-start, naglalakad,
   nakikipag-usap sa NPC, at kumukuha ng screenshots. Fails kung may JS error.
   Usage: node tools/screenshot.mjs [outDir]   (needs: npm i -D playwright) */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = process.argv[2] || path.join(root, 'docs');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 600 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('file://' + path.join(root, 'index.html'));
await page.waitForFunction(() => window.RPG && window.RPG.state && window.RPG.state.ready, null, { timeout: 15000 });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(outDir, 'shot-title.png') });
await page.keyboard.press('Enter');
await page.waitForTimeout(200);
await page.screenshot({ path: path.join(outDir, 'shot-play.png') });
// lumakad: kaliwa tapos pataas; dapat gumalaw ang hero
const before = await page.evaluate(() => ({ ...RPG.state.hero }));
await page.keyboard.down('ArrowUp'); await page.waitForTimeout(900); await page.keyboard.up('ArrowUp');
const after = await page.evaluate(() => ({ ...RPG.state.hero }));
if (after.y >= before.y - 20) errors.push(`hero did not move up: ${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
// collision: subukang pumasok sa fountain (solid) mula sa kaliwa; hindi dapat makapasok
await page.evaluate(() => { RPG.state.hero.x = 290; RPG.state.hero.y = 396; });
await page.keyboard.down('ArrowRight'); await page.waitForTimeout(1200); await page.keyboard.up('ArrowRight');
const hx = await page.evaluate(() => RPG.state.hero.x);
if (hx > 300) errors.push('hero walked into the fountain: x=' + hx);
// dialogue: ilagay sa tabi ni Mira (innkeeper) at pindutin ang E
await page.evaluate(() => { RPG.state.hero.x = 312; RPG.state.hero.y = 272; RPG.state.hero.dir = 'up'; });
await page.waitForTimeout(100);
await page.keyboard.press('KeyE');
await page.waitForTimeout(1500);
const phase = await page.evaluate(() => RPG.state.phase);
await page.screenshot({ path: path.join(outDir, 'shot-dialogue.png') });
if (phase !== 'dialogue') errors.push('expected dialogue phase near Mira, got ' + phase);
// tapusin ang dialogue; dapat bumalik sa play
for (let i = 0; i < 8; i++) { await page.keyboard.press('KeyE'); await page.waitForTimeout(80); }
const phase2 = await page.evaluate(() => RPG.state.phase);
if (phase2 !== 'play') errors.push('expected play phase after dialogue, got ' + phase2);
await browser.close();
if (errors.length) { console.error('FAILED:\n' + errors.join('\n')); process.exit(1); }
console.log('OK: screenshots in', outDir);
