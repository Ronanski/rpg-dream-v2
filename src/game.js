/* RPG Dream - game engine (top-down, painted-backdrop prototype).
   - Map: assets/map.png (2x ng reference art). Hero: assets/hero.png.
   - Movement sa "map units" (original px); SCALE=2 sa render.
   - Collision: walkable polygon + solid shapes + NPC rects (see src/world.js). */
(function () {
  const RPG = (window.RPG = window.RPG || {});
  const W = RPG.world;
  const SCALE = 2;
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const VW = canvas.width / SCALE, VH = canvas.height / SCALE; // view in map units
  const HERO_SPEED = 80; // map units per second
  const IS_TOUCH = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  const assets = { map: null, hero: null };
  const state = {
    phase: 'title', // title | play | dialogue
    gold: 0,
    quest: { started: false, catFound: false, done: false },
    hero: { x: W.heroStart.x, y: W.heroStart.y, dir: W.heroStart.dir, moving: false, t: 0 },
    cam: { x: 0, y: 0 },
    dlg: null, // {name, lines, i, shown, portrait}
    keys: {},
    touch: { up: false, down: false, left: false, right: false, a: false },
    time: 0,
    ready: false,
    errors: [],
  };
  RPG.state = state;

  /* ---------- assets ---------- */
  function load(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => rej(new Error('failed to load ' + src));
      im.src = src;
    });
  }

  /* ---------- geometry ---------- */
  function pointInPoly(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      const hit = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (hit) inside = !inside;
    }
    return inside;
  }
  function blockedAt(px, py) {
    if (!pointInPoly(px, py, W.walkable)) return true;
    for (const s of W.solids) {
      if (s.kind === 'ellipse') {
        const dx = (px - s.cx) / s.rx, dy = (py - s.cy) / s.ry;
        if (dx * dx + dy * dy < 1) return true;
      } else if (px >= s.x && px <= s.x + s.w && py >= s.y && py <= s.y + s.h) return true;
    }
    for (const n of W.npcs) {
      const r = n.rect;
      if (px >= r.x && px <= r.x + r.w && py >= r.y + r.h * 0.55 && py <= r.y + r.h + 4) return true;
    }
    return false;
  }
  // Hero feet collider: 3 sample points along the feet line.
  function heroFits(x, y) {
    return !blockedAt(x - 9, y) && !blockedAt(x + 9, y) && !blockedAt(x, y) && !blockedAt(x, y - 8);
  }

  /* ---------- input ---------- */
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'a', Enter: 'a', KeyE: 'a', KeyZ: 'a',
  };
  window.addEventListener('keydown', (e) => {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (!state.keys[k]) { state.keys[k] = true; if (k === 'a') onAction(); }
  });
  window.addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (k) state.keys[k] = false;
  });
  function held(k) { return !!state.keys[k] || !!state.touch[k]; }

  // Touch controls (D-pad left, A button right) sa canvas coordinates.
  const PAD = { cx: 120, cy: 480, r: 34, gap: 44 };
  const BTN = { cx: 860, cy: 500, r: 42 };
  function canvasPos(t) {
    const r = canvas.getBoundingClientRect();
    return { x: ((t.clientX - r.left) / r.width) * canvas.width, y: ((t.clientY - r.top) / r.height) * canvas.height };
  }
  function updateTouches(touches) {
    const tt = { up: false, down: false, left: false, right: false, a: false };
    for (const t of touches) {
      const p = canvasPos(t);
      const dx = p.x - PAD.cx, dy = p.y - PAD.cy;
      if (Math.hypot(dx, dy) < PAD.gap * 2.2) {
        if (Math.abs(dx) > Math.abs(dy)) tt[dx < 0 ? 'left' : 'right'] = true;
        else tt[dy < 0 ? 'up' : 'down'] = true;
      }
      if (Math.hypot(p.x - BTN.cx, p.y - BTN.cy) < BTN.r + 14) tt.a = true;
    }
    const wasA = state.touch.a;
    state.touch = tt;
    if (tt.a && !wasA) onAction();
  }
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); if (state.phase === 'title') { onAction(); return; } updateTouches(e.touches); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updateTouches(e.touches); }, { passive: false });
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); updateTouches(e.touches); }, { passive: false });
  canvas.addEventListener('mousedown', () => { if (state.phase === 'title') onAction(); });

  /* ---------- actions / dialogue ---------- */
  function onAction() {
    if (!state.ready) return;
    if (state.phase === 'title') { state.phase = 'play'; return; }
    if (state.phase === 'dialogue') { advanceDialogue(); return; }
    const n = nearestNpc();
    if (n) startDialogue(n);
  }
  function nearestNpc() {
    const h = state.hero;
    let best = null, bestD = 1e9;
    for (const n of W.npcs) {
      const r = n.rect, reach = n.reach || 16;
      const cx = Math.max(r.x, Math.min(h.x, r.x + r.w));
      const cy = Math.max(r.y + r.h * 0.4, Math.min(h.y, r.y + r.h));
      const d = Math.hypot(h.x - cx, h.y - cy);
      if (d < reach + 6 && d < bestD) { best = n; bestD = d; }
    }
    return best;
  }
  function startDialogue(n) {
    const lines = n.talk(state);
    const pad = n.portraitPad || 0;
    state.dlg = { name: n.name, lines, i: 0, shown: 0, portrait: n.rect, pad };
    state.phase = 'dialogue';
  }
  function advanceDialogue() {
    const d = state.dlg;
    if (d.shown < d.lines[d.i].length) { d.shown = d.lines[d.i].length; return; }
    d.i++;
    d.shown = 0;
    if (d.i >= d.lines.length) { state.dlg = null; state.phase = 'play'; }
  }

  /* ---------- update ---------- */
  function update(dt) {
    state.time += dt;
    const h = state.hero;
    if (state.phase === 'play') {
      let dx = 0, dy = 0;
      if (held('left')) dx -= 1;
      if (held('right')) dx += 1;
      if (held('up')) dy -= 1;
      if (held('down')) dy += 1;
      h.moving = dx !== 0 || dy !== 0;
      if (h.moving) {
        if (Math.abs(dx) >= Math.abs(dy)) h.dir = dx < 0 ? 'left' : 'right';
        else h.dir = dy < 0 ? 'up' : 'down';
        const len = Math.hypot(dx, dy);
        const sx = (dx / len) * HERO_SPEED * dt, sy = (dy / len) * HERO_SPEED * dt;
        if (heroFits(h.x + sx, h.y)) h.x += sx;
        if (heroFits(h.x, h.y + sy)) h.y += sy;
        h.t += dt;
      } else h.t = 0;
    } else if (state.phase === 'dialogue') {
      h.moving = false;
      const d = state.dlg;
      if (d.shown < d.lines[d.i].length) d.shown += dt * 40;
    }
    // camera
    const b = W.cameraBounds;
    state.cam.x = Math.max(b.minX, Math.min(b.maxX - VW, h.x - VW / 2));
    state.cam.y = Math.max(b.minY, Math.min(b.maxY - VH, h.y - VH / 2 - 10));
  }

  /* ---------- render ---------- */
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function drawMapRegion(sx, sy, sw, sh) {
    // sx..: map units -> source px (2x) -> screen (SCALE)
    const cam = state.cam;
    ctx.drawImage(assets.map, sx * 2, sy * 2, sw * 2, sh * 2, (sx - cam.x) * SCALE, (sy - cam.y) * SCALE, sw * SCALE, sh * SCALE);
  }
  function drawHero() {
    const h = state.hero, cam = state.cam;
    const im = assets.hero;
    const w = im.width / 2, hh = im.height / 2; // map units
    const bob = h.moving ? Math.abs(Math.sin(h.t * 9)) * 2.5 : 0;
    const sx = (h.x - cam.x) * SCALE, sy = (h.y - cam.y) * SCALE;
    ctx.save();
    ctx.translate(sx, sy);
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 16 * (SCALE / 2) * 1.3, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (h.dir === 'left') ctx.scale(-1, 1);
    const lean = h.moving ? Math.sin(h.t * 9) * 0.03 : 0;
    ctx.rotate(lean);
    ctx.drawImage(im, (-w / 2) * SCALE, (-hh - bob + 3) * SCALE, w * SCALE, hh * SCALE);
    ctx.restore();
  }
  function drawOverlays() {
    // Bagay na dapat nasa HARAP ng hero kapag nasa likod niya ang hero (depth).
    const h = state.hero, cam = state.cam;
    for (const s of W.solids) {
      if (s.kind !== 'ellipse') continue;
      if (h.y < s.cy + s.ry - 4 && Math.abs(h.x - s.cx) < s.rx + 30) {
        const X = (v) => (v - cam.x) * SCALE, Y = (v) => (v - cam.y) * SCALE;
        ctx.save();
        ctx.beginPath();
        // silhouette ng fountain: basin + tier + column + top ball
        ctx.ellipse(X(s.cx), Y(s.cy), (s.rx + 4) * SCALE, (s.ry + 6) * SCALE, 0, 0, Math.PI * 2);
        ctx.moveTo(X(s.cx + 30), Y(s.cy - 50));
        ctx.ellipse(X(s.cx), Y(s.cy - 50), 30 * SCALE, 11 * SCALE, 0, 0, Math.PI * 2);
        ctx.rect(X(s.cx - 13), Y(s.cy - 70), 26 * SCALE, 60 * SCALE);
        ctx.moveTo(X(s.cx + 15), Y(s.cy - 74));
        ctx.arc(X(s.cx), Y(s.cy - 74), 15 * SCALE, 0, Math.PI * 2);
        ctx.clip();
        drawMapRegion(s.cx - s.rx - 10, s.cy - 95, s.rx * 2 + 20, s.ry + 105);
        ctx.restore();
      }
    }
    for (const n of W.npcs) {
      if (n.noDepth) continue;
      const r = n.rect;
      if (h.y < r.y + r.h - 6 && h.x > r.x - 26 && h.x < r.x + r.w + 26) {
        ctx.save();
        ctx.beginPath();
        rr((r.x - cam.x) * SCALE, (r.y - cam.y) * SCALE, r.w * SCALE, r.h * SCALE, 14 * SCALE);
        ctx.clip();
        drawMapRegion(r.x, r.y, r.w, r.h);
        ctx.restore();
      }
    }
  }
  function text(str, x, y, size, color, align, weight, stroke) {
    ctx.font = `${weight || 'bold'} ${size}px "Trebuchet MS", "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'top';
    if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = 'rgba(20,16,10,0.9)'; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }
  function wrap(str, maxW, size) {
    ctx.font = `600 ${size}px "Trebuchet MS", "Segoe UI", Arial, sans-serif`;
    const words = str.split(' '), lines = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  function drawHUD() {
    const h = state.hero;
    rr(14, 14, 250, 62, 10);
    ctx.fillStyle = 'rgba(24,20,34,0.78)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#e7c57a';
    ctx.stroke();
    // coin
    ctx.beginPath();
    ctx.arc(38, 36, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#f4c542';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#8a5a10';
    ctx.stroke();
    text(String(state.gold), 56, 25, 20, '#fff2c8');
    const q = state.quest;
    const qt = !q.started ? 'Explore Seren Village. Talk to people (E).' : !q.catFound ? 'Quest: Find Mochi near the fountain.' : !q.done ? 'Quest: Return to Mira at the inn.' : 'Quest complete! Explore freely.';
    text(qt, 28, 52, 13, '#d7d3e6', 'left', '600');
    // interaction hint
    const n = state.phase === 'play' ? nearestNpc() : null;
    if (n) {
      const label = `Talk: ${n.name}`;
      ctx.font = '600 14px "Trebuchet MS", "Segoe UI", Arial, sans-serif';
      const tw = ctx.measureText(label).width + 44;
      const sx = (h.x - state.cam.x) * SCALE, sy = (h.y - state.cam.y) * SCALE - 170;
      rr(sx - tw / 2, sy, tw, 26, 8);
      ctx.fillStyle = 'rgba(24,20,34,0.85)';
      ctx.fill();
      ctx.strokeStyle = '#e7c57a';
      ctx.lineWidth = 2;
      ctx.stroke();
      rr(sx - tw / 2 + 6, sy + 4, 20, 18, 4);
      ctx.fillStyle = '#e7c57a';
      ctx.fill();
      text(IS_TOUCH ? 'A' : 'E', sx - tw / 2 + 16, sy + 6, 12, '#2a2010', 'center');
      text(n.name, sx - tw / 2 + 32, sy + 6, 14, '#fff2c8', 'left', '600');
    }
  }
  function drawDialogue() {
    const d = state.dlg;
    if (!d) return;
    const bx = 40, by = canvas.height - 170, bw = canvas.width - 80, bh = 140;
    rr(bx, by, bw, bh, 14);
    ctx.fillStyle = 'rgba(22,18,32,0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e7c57a';
    ctx.stroke();
    // portrait (crop mula sa map)
    const p = d.portrait, pad = d.pad || 0;
    const ps = 104;
    rr(bx + 18, by + 18, ps, ps, 10);
    ctx.fillStyle = '#2d2740';
    ctx.fill();
    ctx.save();
    rr(bx + 18, by + 18, ps, ps, 10);
    ctx.clip();
    const cw = p.w + pad * 2, ch = p.h + pad * 2;
    const k = Math.max(ps / cw, ps / ch) * 0.98;
    const dw = cw * k, dh = ch * k;
    ctx.drawImage(assets.map, (p.x - pad) * 2, (p.y - pad) * 2, cw * 2, ch * 2, bx + 18 + (ps - dw) / 2, by + 18 + (ps - dh) / 2, dw, dh);
    ctx.restore();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#e7c57a';
    rr(bx + 18, by + 18, ps, ps, 10);
    ctx.stroke();
    // name tag
    ctx.font = 'bold 16px "Trebuchet MS", "Segoe UI", Arial, sans-serif';
    const nw = ctx.measureText(d.name).width + 28;
    rr(bx + 140, by - 16, nw, 32, 8);
    ctx.fillStyle = '#e7c57a';
    ctx.fill();
    text(d.name, bx + 154, by - 8, 16, '#2a2010');
    // text (typewriter)
    const full = d.lines[d.i];
    const shown = full.slice(0, Math.floor(d.shown));
    const lines = wrap(shown, bw - 190, 20);
    lines.forEach((ln, i) => text(ln, bx + 142, by + 30 + i * 28, 20, '#fdf6e3', 'left', '600'));
    if (d.shown >= full.length && Math.floor(state.time * 2) % 2 === 0) text('▼', bx + bw - 34, by + bh - 30, 16, '#e7c57a');
  }
  function drawTouchControls() {
    if (!IS_TOUCH || state.phase === 'title') return;
    ctx.save();
    ctx.globalAlpha = 0.55;
    const dirs = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
    for (const [k, dx, dy] of dirs) {
      const x = PAD.cx + dx * PAD.gap, y = PAD.cy + dy * PAD.gap;
      ctx.beginPath();
      ctx.arc(x, y, PAD.r, 0, Math.PI * 2);
      ctx.fillStyle = state.touch[k] ? '#e7c57a' : 'rgba(30,26,44,0.9)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e7c57a';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + dx * 12 - dy * 10, y + dy * 12 - dx * 10);
      ctx.lineTo(x + dx * 12 + dy * 10, y + dy * 12 + dx * 10);
      ctx.lineTo(x + dx * 12 + dx * 12 * 0 + dx * 2 + (dx === 0 ? 0 : 0), y + dy * 12 + dy * 2);
      ctx.closePath();
      ctx.fillStyle = state.touch[k] ? '#2a2010' : '#e7c57a';
      // simple triangle arrows
      ctx.beginPath();
      ctx.moveTo(x + dx * 14, y + dy * 14);
      ctx.lineTo(x - dx * 6 + dy * 10, y - dy * 6 + dx * 10);
      ctx.lineTo(x - dx * 6 - dy * 10, y - dy * 6 - dx * 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(BTN.cx, BTN.cy, BTN.r, 0, Math.PI * 2);
    ctx.fillStyle = state.touch.a ? '#e7c57a' : 'rgba(30,26,44,0.9)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e7c57a';
    ctx.stroke();
    text('A', BTN.cx, BTN.cy - 14, 26, state.touch.a ? '#2a2010' : '#e7c57a', 'center');
    ctx.restore();
  }
  function drawTitle() {
    ctx.fillStyle = 'rgba(10,8,18,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    text('RPG DREAM', canvas.width / 2, 170, 72, '#ffd97a', 'center', 'bold', 10);
    text('Seren Village', canvas.width / 2, 258, 28, '#fdf6e3', 'center', '600', 6);
    const blink = Math.floor(state.time * 1.5) % 2 === 0;
    if (blink) text(IS_TOUCH ? 'Tap to start' : 'Press ENTER to start', canvas.width / 2, 420, 22, '#fdf6e3', 'center', '600', 5);
    text('Move: Arrow keys / WASD    Talk: E / Space', canvas.width / 2, 540, 15, '#cfc8dd', 'center', '600', 4);
  }
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state.ready) {
      ctx.fillStyle = '#14161f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      text(state.errors.length ? state.errors.join('\n') : 'Loading...', 30, 30, 18, '#fdf6e3');
      return;
    }
    const cam = state.cam;
    drawMapRegion(cam.x, cam.y, VW, VH);
    drawHero();
    drawOverlays();
    if (state.phase === 'title') { drawTitle(); return; }
    drawHUD();
    drawDialogue();
    drawTouchControls();
  }

  /* ---------- resize ---------- */
  function fit() {
    const ar = canvas.width / canvas.height;
    let w = window.innerWidth, h = window.innerHeight;
    if (w / h > ar) w = h * ar; else h = w / ar;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- main loop ---------- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.ready) update(dt);
    render();
    requestAnimationFrame(frame);
  }
  Promise.all([load('assets/map.png'), load('assets/hero.png')])
    .then(([m, h]) => { assets.map = m; assets.hero = h; state.ready = true; update(0); })
    .catch((e) => { state.errors.push(e.message); console.error(e); });
  requestAnimationFrame(frame);
})();
