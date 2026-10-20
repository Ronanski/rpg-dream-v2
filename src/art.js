/* RPG Dream - procedural "clean anime JRPG" art.
   Lahat ng tiles, buildings, at props ay dino-drawing dito gamit ang canvas
   (flat vibrant colors + dark outlines). Walang external image files. */
(function () {
  const RPG = (window.RPG = window.RPG || {});
  const T = (RPG.TILE = 48);
  const OUT = '#3a2718';

  function mk(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w);
    c.height = Math.ceil(h);
    return c;
  }
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
  function fs(ctx, fill, stroke, lw) {
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.lineWidth = lw || 2;
      ctx.strokeStyle = stroke;
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }
  function ell(ctx, cx, cy, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  }
  function circ(ctx, cx, cy, r) {
    ell(ctx, cx, cy, r, r);
  }

  /* ---------------- GROUND TILES ---------------- */
  const tileCache = {};
  function tile(kind, variant) {
    const key = kind + ':' + (variant | 0);
    if (tileCache[key]) return tileCache[key];
    const c = mk(T, T);
    const ctx = c.getContext('2d');
    const r = rng(variant * 977 + kind.length * 31 + 7);
    if (kind === 'grass' || kind === 'flowers') {
      ctx.fillStyle = '#6dbf47';
      ctx.fillRect(0, 0, T, T);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) {
        const x = 3 + r() * (T - 8), y = 4 + r() * (T - 8);
        ctx.strokeStyle = '#56a637';
        ctx.beginPath();
        ctx.moveTo(x - 3, y + 3);
        ctx.lineTo(x, y - 2);
        ctx.lineTo(x + 3, y + 3);
        ctx.stroke();
      }
      for (let i = 0; i < 5; i++) {
        const x = 3 + r() * (T - 8), y = 4 + r() * (T - 8);
        ctx.strokeStyle = '#8fdb62';
        ctx.beginPath();
        ctx.moveTo(x - 2, y + 2);
        ctx.lineTo(x, y - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.stroke();
      }
      if (kind === 'flowers') {
        const cols = ['#f04e4e', '#ffd83d', '#c66bf0', '#ff8ad0', '#ffffff'];
        for (let i = 0; i < 3; i++) {
          const x = 8 + r() * (T - 16), y = 8 + r() * (T - 16);
          const col = cols[Math.floor(r() * cols.length)];
          for (let p = 0; p < 5; p++) {
            const a = (p / 5) * Math.PI * 2;
            circ(ctx, x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2, 2.4);
            fs(ctx, col, null);
          }
          circ(ctx, x, y, 2);
          fs(ctx, '#ffe066', null);
        }
      }
    } else if (kind === 'cobble') {
      ctx.fillStyle = '#a18d6a';
      ctx.fillRect(0, 0, T, T);
      const cols = ['#d9c9a8', '#cdbc9b', '#c2b08e', '#e0d2b4', '#c8b494'];
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 3; col++) {
          const x = col * 16 + 1.5 + (r() - 0.5), y = row * 16 + 1.5 + (r() - 0.5);
          const w = 13 + r() * 1.5, h = 13 + r() * 1.5;
          rr(ctx, x, y, w, h, 4 + r() * 3);
          fs(ctx, cols[Math.floor(r() * cols.length)], '#8c7a5a', 1.5);
          ctx.strokeStyle = 'rgba(255,255,255,0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 3, y + 5);
          ctx.quadraticCurveTo(x + 3, y + 2.5, x + 6, y + 2.5);
          ctx.stroke();
        }
    } else if (kind === 'dirt') {
      ctx.fillStyle = '#d2a86b';
      ctx.fillRect(0, 0, T, T);
      for (let i = 0; i < 14; i++) {
        circ(ctx, r() * T, r() * T, 1 + r() * 1.5);
        fs(ctx, i % 3 ? '#c0945a' : '#e2bd84', null);
      }
      for (let i = 0; i < 2; i++) {
        ell(ctx, 6 + r() * (T - 12), 6 + r() * (T - 12), 4, 3);
        fs(ctx, '#b89a74', '#8c7a5a', 1.2);
      }
    } else if (kind === 'water') {
      ctx.fillStyle = '#45b0ff';
      ctx.fillRect(0, 0, T, T);
      ctx.strokeStyle = '#a4e3ff';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const x = 4 + r() * 24, y = 6 + r() * 36;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + 5, y - 3, x + 10, y);
        ctx.quadraticCurveTo(x + 15, y + 3, x + 20, y);
        ctx.stroke();
      }
    }
    tileCache[key] = c;
    return c;
  }

  /* ---------------- OBJECTS / PROPS ----------------
     Bawat object: { canvas, ox, oy, foot:{x,y,w,h} } in px, relative sa
     anchor tile top-left. */
  const ROOFS = {
    orange: { main: '#ea6a2e', dark: '#bf4a1d', ridge: '#8e3414', line: '#c9531f' },
    blue: { main: '#3f78d6', dark: '#2b56a8', ridge: '#1d3f82', line: '#2f5fb8' },
    red: { main: '#d9463b', dark: '#a9302a', ridge: '#7d1f1c', line: '#b8362e' },
    thatch: { main: '#e0b24e', dark: '#b58a2a', ridge: '#8a6619', line: '#c99b38' },
    green: { main: '#4fa75a', dark: '#357a3f', ridge: '#24582b', line: '#3f8d49' },
  };

  function house(o) {
    const w = o.w, h = o.h, roof = ROOFS[o.roof || 'orange'];
    const roofH = Math.round(T * (h >= 3 ? 1.5 : 1.25));
    const over = 10, top = 16;
    const W = w * T + over * 2, H = top + roofH + h * T;
    const c = mk(W, H), ctx = c.getContext('2d');
    const wx = over, wy = top + roofH;
    // wall
    rr(ctx, wx, wy - 6, w * T, h * T + 6, 3);
    fs(ctx, o.wall || '#f4e7c9', OUT, 2.5);
    // foundation
    ctx.fillStyle = '#b7aa92';
    ctx.fillRect(wx + 1, wy + h * T - 11, w * T - 2, 10);
    ctx.strokeStyle = '#8e8269';
    ctx.lineWidth = 1.5;
    for (let x = wx + 8; x < wx + w * T; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, wy + h * T - 11);
      ctx.lineTo(x, wy + h * T - 1);
      ctx.stroke();
    }
    // timber beams
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(wx, wy - 6, w * T, 7); // top beam
    for (let i = 0; i <= w; i++) {
      const x = wx + i * T - (i === w ? 6 : 0);
      ctx.fillRect(x, wy - 6, 6, h * T - 10);
    }
    if (h >= 2) ctx.fillRect(wx, wy + T - 2, w * T, 5);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 4;
    const doorBay = Math.floor(w / 2);
    for (let i = 0; i < w; i++) {
      const bx = wx + i * T;
      if (h >= 3) {
        // diagonal braces sa middle row
        ctx.beginPath();
        if (i % 2 === 0) {
          ctx.moveTo(bx + 6, wy + T + 4);
          ctx.lineTo(bx + T - 6, wy + 2 * T - 4);
        } else {
          ctx.moveTo(bx + T - 6, wy + T + 4);
          ctx.lineTo(bx + 6, wy + 2 * T - 4);
        }
        ctx.stroke();
      }
    }
    // windows (top row)
    for (let i = 0; i < w; i++) {
      if (h === 1 && i === doorBay) continue;
      const bx = wx + i * T + 12, by = wy + 8;
      rr(ctx, bx, by, 24, 24, 3);
      fs(ctx, '#74baff', '#8a5a2b', 3);
      ctx.strokeStyle = '#8a5a2b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 12, by);
      ctx.lineTo(bx + 12, by + 24);
      ctx.moveTo(bx, by + 12);
      ctx.lineTo(bx + 24, by + 12);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(bx + 3, by + 3, 6, 6);
      // sill + flower box
      ctx.fillStyle = '#c9b48e';
      ctx.fillRect(bx - 3, by + 24, 30, 4);
      if (o.flowers !== false) {
        rr(ctx, bx - 1, by + 28, 26, 7, 2);
        fs(ctx, '#8a5a2b', OUT, 1.5);
        const fc = ['#ff5a5a', '#ffd23d', '#ff8ad0'];
        for (let k = 0; k < 3; k++) {
          circ(ctx, bx + 5 + k * 8, by + 27, 3.2);
          fs(ctx, fc[(k + i) % 3], null);
        }
      }
    }
    // door sa bottom row ng doorBay
    const dx = wx + doorBay * T + 11, dw = 26, dh = 38, dy = wy + h * T - 11 - dh;
    ctx.beginPath();
    ctx.moveTo(dx, dy + dh);
    ctx.lineTo(dx, dy + 12);
    ctx.arc(dx + dw / 2, dy + 12, dw / 2, Math.PI, 0);
    ctx.lineTo(dx + dw, dy + dh);
    ctx.closePath();
    fs(ctx, '#7a4a22', OUT, 2);
    ctx.strokeStyle = '#5a3416';
    ctx.lineWidth = 1.5;
    for (let k = 1; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(dx + (dw / 3) * k, dy + 4);
      ctx.lineTo(dx + (dw / 3) * k, dy + dh);
      ctx.stroke();
    }
    circ(ctx, dx + dw - 6, dy + 22, 2.2);
    fs(ctx, '#ffd23d', null);
    // lantern beside door
    const lx = dx + dw + 10, ly = dy + 6;
    const g = ctx.createRadialGradient(lx, ly, 2, lx, ly, 18);
    g.addColorStop(0, 'rgba(255,220,120,0.55)');
    g.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(lx - 18, ly - 18, 36, 36);
    rr(ctx, lx - 4, ly - 5, 8, 10, 2);
    fs(ctx, '#ffd95a', OUT, 1.5);
    // bottom-row windows kung h>=2 (sa ibang bay)
    if (h >= 2) {
      for (let i = 0; i < w; i++) {
        if (i === doorBay) continue;
        if ((i + doorBay) % 2 === 0) continue;
        const bx = wx + i * T + 12, by = wy + (h - 1) * T + 6;
        rr(ctx, bx, by, 24, 20, 3);
        fs(ctx, '#74baff', '#8a5a2b', 3);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(bx + 3, by + 3, 6, 5);
      }
    }
    // hanging sign
    if (o.sign) {
      const sx = wx + (doorBay + 1) * T + 2, sy = wy + 6;
      ctx.strokeStyle = '#4a4a55';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx - 6, sy);
      ctx.lineTo(sx + 26, sy);
      ctx.stroke();
      rr(ctx, sx, sy + 4, 26, 24, 4);
      fs(ctx, '#8a5a2b', OUT, 2);
      if (o.sign === 'mug') {
        rr(ctx, sx + 7, sy + 11, 11, 13, 2);
        fs(ctx, '#ffcc3d', OUT, 1.5);
        rr(ctx, sx + 6, sy + 8, 13, 5, 2);
        fs(ctx, '#ffffff', OUT, 1.5);
        rr(ctx, sx + 18, sy + 13, 4, 7, 2);
        fs(ctx, '#ffcc3d', OUT, 1.5);
      } else if (o.sign === 'sword') {
        ctx.strokeStyle = '#d7dde6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx + 6, sy + 22);
        ctx.lineTo(sx + 20, sy + 8);
        ctx.stroke();
        ctx.strokeStyle = '#ffcc3d';
        ctx.beginPath();
        ctx.moveTo(sx + 7, sy + 15);
        ctx.lineTo(sx + 13, sy + 21);
        ctx.stroke();
      } else if (o.sign === 'bread') {
        ell(ctx, sx + 13, sy + 17, 9, 5.5);
        fs(ctx, '#e8a850', OUT, 1.5);
      }
    }
    // roof
    const rx = 0, ry = top, rw = W, rh = roofH + 6;
    rr(ctx, rx, ry, rw, rh, 5);
    fs(ctx, roof.main, OUT, 2.5);
    ctx.strokeStyle = roof.line;
    ctx.lineWidth = 2;
    const rowH = 14;
    for (let y = ry + 14; y < ry + rh - 4; y += rowH) {
      ctx.beginPath();
      ctx.moveTo(rx + 2, y);
      ctx.lineTo(rx + rw - 2, y);
      ctx.stroke();
      // tile seams (staggered)
      const off = ((y - ry) / rowH) % 2 ? 11 : 0;
      for (let x = rx + 8 + off; x < rx + rw - 4; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + rowH - 2);
        ctx.stroke();
      }
    }
    // shade sa lower half
    const sg = ctx.createLinearGradient(0, ry, 0, ry + rh);
    sg.addColorStop(0, 'rgba(255,255,255,0.18)');
    sg.addColorStop(0.5, 'rgba(0,0,0,0)');
    sg.addColorStop(1, 'rgba(0,0,0,0.22)');
    rr(ctx, rx, ry, rw, rh, 5);
    ctx.fillStyle = sg;
    ctx.fill();
    // ridge cap
    rr(ctx, rx + 3, ry - 2, rw - 6, 11, 5);
    fs(ctx, roof.ridge, OUT, 2.2);
    // scalloped eave
    ctx.fillStyle = roof.dark;
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 2;
    for (let x = rx + 6; x < rx + rw - 4; x += 12) {
      ctx.beginPath();
      ctx.arc(x + 6, ry + rh - 1, 6, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    // chimney
    if (o.chimney !== false) {
      const cx = rx + rw - 30;
      rr(ctx, cx, 0, 16, 26, 2);
      fs(ctx, '#8f8a84', OUT, 2);
      ctx.fillStyle = '#6f6a64';
      ctx.fillRect(cx - 2, 0, 20, 6);
      ctx.strokeStyle = OUT;
      ctx.strokeRect(cx - 2, 0, 20, 6);
    }
    return {
      canvas: c,
      ox: -over,
      oy: -(top + roofH),
      foot: { x: 0, y: 0, w: w * T, h: h * T },
      chimney: o.chimney !== false ? { x: W - over - 22, y: -(top + roofH) + 2 } : null,
    };
  }

  function stall(o) {
    const aw = o.awning || 'red';
    const colA = aw === 'red' ? '#e24a3c' : aw === 'yellow' ? '#f2bd2f' : '#4f8be0';
    const W = 2 * T + 16, top = 72, H = top + 36;
    const c = mk(W, H), ctx = c.getContext('2d');
    // posts
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(12, 30);
    ctx.lineTo(12, top + 6);
    ctx.moveTo(W - 12, 30);
    ctx.lineTo(W - 12, top + 6);
    ctx.stroke();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1;
    // table
    rr(ctx, 8, top, 2 * T, 30, 3);
    fs(ctx, '#b07a44', OUT, 2.2);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 1.5;
    for (let y = top + 8; y < top + 30; y += 7) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(2 * T + 6, y);
      ctx.stroke();
    }
    // cloth skirt (front)
    rr(ctx, 8, top + 10, 2 * T, 20, 2);
    fs(ctx, '#f1e3c3', OUT, 1.8);
    // goods crates
    const goods = o.goods || 'fruit';
    const sets = goods === 'fruit'
      ? [['#e8392e', '#ff6a5e'], ['#f59a2b', '#ffc36a'], ['#7bc043', '#a6e06b']]
      : [['#e8a850', '#f5c983'], ['#d68b3a', '#f0b676'], ['#f2d9a5', '#fff0cf']];
    for (let k = 0; k < 3; k++) {
      const bx = 10 + k * 32, by = top - 12;
      rr(ctx, bx, by, 30, 16, 2);
      fs(ctx, '#9a6a3a', OUT, 1.8);
      const [col, hi] = sets[k];
      for (let i = 0; i < 4; i++) {
        const gx = bx + 6 + (i % 2) * 11 + (i > 1 ? 5 : 0), gy = by + 4 + (i > 1 ? -5 : 0);
        if (goods === 'fruit') {
          circ(ctx, gx, gy, 5);
          fs(ctx, col, OUT, 1.5);
          circ(ctx, gx - 1.5, gy - 1.5, 1.5);
          fs(ctx, hi, null);
        } else {
          ell(ctx, gx, gy, 6, 4);
          fs(ctx, col, OUT, 1.5);
        }
      }
    }
    // awning
    ctx.beginPath();
    ctx.moveTo(10, 4);
    ctx.lineTo(W - 10, 4);
    ctx.lineTo(W, 36);
    ctx.lineTo(0, 36);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, 40);
    ctx.fillStyle = colA;
    for (let x = -8; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 12, 0);
      ctx.lineTo(x + 16, 40);
      ctx.lineTo(x + 4, 40);
      ctx.closePath();
      ctx.fill();
    }
    const ag = ctx.createLinearGradient(0, 4, 0, 36);
    ag.addColorStop(0, 'rgba(255,255,255,0.25)');
    ag.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = ag;
    ctx.fillRect(0, 0, W, 40);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(10, 4);
    ctx.lineTo(W - 10, 4);
    ctx.lineTo(W, 36);
    ctx.lineTo(0, 36);
    ctx.closePath();
    fs(ctx, null, OUT, 2.5);
    // scallops
    for (let x = 0; x < W; x += 16) {
      ctx.beginPath();
      ctx.arc(x + 8, 36, 8, 0, Math.PI);
      const i = Math.floor((x + 8) / 24);
      fs(ctx, i % 2 ? colA : '#ffffff', OUT, 2);
    }
    return { canvas: c, ox: -8, oy: -top, foot: { x: 0, y: 4, w: 2 * T, h: 30 } };
  }

  function fountain(frame) {
    const W = 3 * T, H = 3 * T + 10;
    const c = mk(W, H), ctx = c.getContext('2d');
    const cx = W / 2, cy = 1.55 * T;
    // ground shadow
    ell(ctx, cx, cy + 8, 1.42 * T, 1.0 * T);
    fs(ctx, 'rgba(0,0,0,0.18)', null);
    // outer rim
    ell(ctx, cx, cy, 1.4 * T, 0.98 * T);
    fs(ctx, '#9ea4ad', OUT, 2.5);
    ell(ctx, cx, cy - 6, 1.4 * T, 0.98 * T);
    fs(ctx, '#b6bcc5', OUT, 2.5);
    // rim segments
    ctx.strokeStyle = '#7f8691';
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 1.4 * T, cy - 6 + Math.sin(a) * 0.98 * T);
      ctx.lineTo(cx + Math.cos(a) * 1.15 * T, cy - 6 + Math.sin(a) * 0.76 * T);
      ctx.stroke();
    }
    // water
    ell(ctx, cx, cy - 6, 1.12 * T, 0.74 * T);
    fs(ctx, '#3fb0ff', OUT, 2);
    ctx.strokeStyle = '#a8e6ff';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + frame * 0.6;
      const x = cx + Math.cos(a) * 0.7 * T, y = cy - 6 + Math.sin(a) * 0.45 * T;
      ctx.beginPath();
      ctx.moveTo(x - 7, y);
      ctx.quadraticCurveTo(x - 3, y - 3, x, y);
      ctx.quadraticCurveTo(x + 3, y + 3, x + 7, y);
      ctx.stroke();
    }
    // pedestal
    ell(ctx, cx, cy - 2, 20, 9);
    fs(ctx, '#8d939c', OUT, 2);
    rr(ctx, cx - 9, cy - 46, 18, 44, 4);
    fs(ctx, '#aeb4bd', OUT, 2);
    ell(ctx, cx, cy - 46, 26, 10);
    fs(ctx, '#c3c9d1', OUT, 2);
    ell(ctx, cx, cy - 48, 20, 6);
    fs(ctx, '#7fd0ff', OUT, 1.5);
    rr(ctx, cx - 5, cy - 72, 10, 26, 3);
    fs(ctx, '#aeb4bd', OUT, 2);
    circ(ctx, cx, cy - 76, 7);
    fs(ctx, '#c3c9d1', OUT, 2);
    // spray
    ctx.strokeStyle = '#bfefff';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80);
      ctx.quadraticCurveTo(cx + i * 22, cy - 100 - frame * 3, cx + i * 32, cy - 56 + Math.abs(i) * 6);
      ctx.stroke();
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + frame;
      circ(ctx, cx + Math.cos(a) * (24 + frame * 4), cy - 60 + Math.sin(a) * 8, 2.2);
      fs(ctx, '#e8f9ff', null);
    }
    return { canvas: c, ox: 0, oy: -10, foot: { x: 6, y: 18, w: 3 * T - 12, h: 2.1 * T } };
  }

  function tree(variant) {
    const W = 2 * T, H = 2.4 * T;
    const c = mk(W, H), ctx = c.getContext('2d');
    const r = rng(variant * 13 + 5);
    const cx = W / 2, base = H - 6;
    ell(ctx, cx, base, 26, 9);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    rr(ctx, cx - 8, base - 34, 16, 34, 4);
    fs(ctx, '#7a4a22', OUT, 2.2);
    ctx.strokeStyle = '#5a3416';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 2, base - 30);
    ctx.lineTo(cx - 2, base - 6);
    ctx.stroke();
    const blobs = [
      [cx, base - 74, 34],
      [cx - 26, base - 56, 26],
      [cx + 26, base - 56, 26],
      [cx - 12, base - 40, 22],
      [cx + 12, base - 40, 22],
    ];
    ctx.beginPath();
    for (const [x, y, rad] of blobs) {
      ctx.moveTo(x + rad, y);
      ctx.arc(x, y, rad + r() * 3, 0, Math.PI * 2);
    }
    fs(ctx, '#3d9a3a', OUT, 2.5);
    ctx.beginPath();
    for (const [x, y, rad] of blobs) {
      ctx.moveTo(x - 4 + rad * 0.7, y - 4);
      ctx.arc(x - 4, y - 5, rad * 0.7, 0, Math.PI * 2);
    }
    fs(ctx, '#5cc04b', null);
    ctx.beginPath();
    for (const [x, y, rad] of blobs.slice(0, 3)) {
      ctx.moveTo(x - 8 + rad * 0.35, y - 10);
      ctx.arc(x - 8, y - 10, rad * 0.35, 0, Math.PI * 2);
    }
    fs(ctx, '#95e06f', null);
    return { canvas: c, ox: -T / 2, oy: -(H - T), foot: { x: 10, y: 24, w: T - 20, h: 20 } };
  }

  function bush(variant) {
    const c = mk(T + 8, T), ctx = c.getContext('2d');
    const r = rng(variant * 17 + 3);
    ell(ctx, T / 2 + 4, T - 6, 22, 7);
    fs(ctx, 'rgba(0,0,0,0.2)', null);
    const blobs = [[16, 30, 13], [36, 30, 13], [26, 20, 15], [26, 34, 12]];
    ctx.beginPath();
    for (const [x, y, rad] of blobs) {
      ctx.moveTo(x + 4 + rad, y);
      ctx.arc(x + 4, y, rad + r() * 2, 0, Math.PI * 2);
    }
    fs(ctx, '#3d9a3a', OUT, 2.2);
    ctx.beginPath();
    for (const [x, y, rad] of blobs) {
      ctx.moveTo(x + 1 + rad * 0.65, y - 3);
      ctx.arc(x + 1, y - 3, rad * 0.65, 0, Math.PI * 2);
    }
    fs(ctx, '#5cc04b', null);
    if (variant % 2) {
      const cols = ['#ff5a5a', '#ffd23d', '#ff8ad0'];
      for (let i = 0; i < 4; i++) {
        circ(ctx, 12 + r() * 32, 14 + r() * 24, 2.5);
        fs(ctx, cols[i % 3], null);
      }
    }
    return { canvas: c, ox: -4, oy: 0, foot: { x: 6, y: 16, w: T - 12, h: 26 } };
  }

  function barrel() {
    const c = mk(T, T + 10), ctx = c.getContext('2d');
    ell(ctx, T / 2, T + 4, 18, 6);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    rr(ctx, 9, 12, 30, 40, 9);
    fs(ctx, '#a06f3c', OUT, 2.2);
    ctx.strokeStyle = '#7a4a22';
    ctx.lineWidth = 1.5;
    for (let x = 17; x < 38; x += 7) {
      ctx.beginPath();
      ctx.moveTo(x, 14);
      ctx.lineTo(x, 50);
      ctx.stroke();
    }
    ctx.fillStyle = '#5d6170';
    ctx.fillRect(9, 20, 30, 5);
    ctx.fillRect(9, 40, 30, 5);
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(9, 20, 30, 5);
    ctx.strokeRect(9, 40, 30, 5);
    ell(ctx, 24, 13, 15, 6);
    fs(ctx, '#c08a4a', OUT, 2);
    return { canvas: c, ox: 0, oy: -10, foot: { x: 8, y: 14, w: 32, h: 30 } };
  }

  function crate() {
    const c = mk(T, T), ctx = c.getContext('2d');
    ell(ctx, T / 2, T - 4, 18, 6);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    rr(ctx, 8, 10, 32, 32, 3);
    fs(ctx, '#c08a4a', OUT, 2.2);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 14, 24, 24);
    ctx.beginPath();
    ctx.moveTo(12, 14);
    ctx.lineTo(36, 38);
    ctx.moveTo(36, 14);
    ctx.lineTo(12, 38);
    ctx.stroke();
    return { canvas: c, ox: 0, oy: 0, foot: { x: 8, y: 14, w: 32, h: 28 } };
  }

  function lamp() {
    const c = mk(T, 2 * T), ctx = c.getContext('2d');
    const cx = T / 2;
    ell(ctx, cx, 2 * T - 4, 12, 4);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    const g = ctx.createRadialGradient(cx, 26, 4, cx, 26, 30);
    g.addColorStop(0, 'rgba(255,225,130,0.55)');
    g.addColorStop(1, 'rgba(255,225,130,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, T, 60);
    rr(ctx, cx - 8, 2 * T - 10, 16, 8, 2);
    fs(ctx, '#3b3b48', OUT, 2);
    rr(ctx, cx - 3, 36, 6, 2 * T - 44, 2);
    fs(ctx, '#4a4a58', OUT, 2);
    rr(ctx, cx - 9, 12, 18, 26, 4);
    fs(ctx, '#ffd95a', OUT, 2.2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(cx - 6, 15, 5, 8);
    rr(ctx, cx - 11, 6, 22, 8, 3);
    fs(ctx, '#3b3b48', OUT, 2);
    circ(ctx, cx, 4, 3);
    fs(ctx, '#3b3b48', OUT, 1.5);
    return { canvas: c, ox: 0, oy: -T, foot: { x: 16, y: 34, w: 16, h: 12 } };
  }

  function cart() {
    const W = 2 * T + 8, H = 1.6 * T;
    const c = mk(W, H), ctx = c.getContext('2d');
    ell(ctx, W / 2, H - 6, 50, 9);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    // wheels (back)
    for (const wx of [24, W - 24]) {
      circ(ctx, wx, H - 18, 15);
      fs(ctx, '#7a4a22', OUT, 2.2);
      ctx.strokeStyle = '#c08a4a';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(wx - Math.cos(a) * 12, H - 18 - Math.sin(a) * 12);
        ctx.lineTo(wx + Math.cos(a) * 12, H - 18 + Math.sin(a) * 12);
        ctx.stroke();
      }
      circ(ctx, wx, H - 18, 3);
      fs(ctx, '#5d6170', OUT, 1.5);
    }
    // bed
    rr(ctx, 8, 22, W - 16, 30, 4);
    fs(ctx, '#b07a44', OUT, 2.2);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 2;
    for (let x = 20; x < W - 10; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, 50);
      ctx.stroke();
    }
    // veggies
    const cols = ['#e8392e', '#7bc043', '#f59a2b', '#e8392e', '#8e4fd0', '#7bc043', '#f59a2b', '#ffd23d'];
    for (let i = 0; i < 8; i++) {
      const gx = 20 + (i % 4) * 20 + (i > 3 ? 10 : 0), gy = 20 + (i > 3 ? -6 : 0);
      circ(ctx, gx, gy, 7);
      fs(ctx, cols[i], OUT, 1.5);
      circ(ctx, gx - 2, gy - 2, 2);
      fs(ctx, 'rgba(255,255,255,0.6)', null);
    }
    // handles
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(W - 8, 30);
    ctx.lineTo(W + 2, 26);
    ctx.stroke();
    return { canvas: c, ox: -4, oy: -(H - T), foot: { x: 4, y: 10, w: 2 * T - 8, h: 34 } };
  }

  function forge() {
    const W = 2 * T, H = 2.2 * T;
    const c = mk(W, H), ctx = c.getContext('2d');
    ell(ctx, W / 2, H - 6, 40, 8);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    rr(ctx, 10, 8, W - 20, H - 16, 6);
    fs(ctx, '#848a95', OUT, 2.5);
    ctx.strokeStyle = '#6b717c';
    ctx.lineWidth = 1.5;
    for (let y = 18; y < H - 12; y += 12) {
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(W - 12, y);
      ctx.stroke();
      const off = (y / 12) % 2 ? 10 : 0;
      for (let x = 22 + off; x < W - 12; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 12);
        ctx.stroke();
      }
    }
    rr(ctx, 6, 4, W - 12, 10, 3);
    fs(ctx, '#6f7580', OUT, 2);
    // fire opening
    const fx = W / 2, fy = H - 40;
    const g = ctx.createRadialGradient(fx, fy, 6, fx, fy, 46);
    g.addColorStop(0, 'rgba(255,170,60,0.75)');
    g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, fy - 46, W, 70);
    ctx.beginPath();
    ctx.moveTo(fx - 22, fy + 22);
    ctx.lineTo(fx - 22, fy);
    ctx.arc(fx, fy, 22, Math.PI, 0);
    ctx.lineTo(fx + 22, fy + 22);
    ctx.closePath();
    fs(ctx, '#2b1d14', OUT, 2.2);
    ctx.beginPath();
    ctx.moveTo(fx - 14, fy + 20);
    ctx.quadraticCurveTo(fx - 16, fy - 2, fx - 6, fy + 2);
    ctx.quadraticCurveTo(fx - 2, fy - 16, fx + 4, fy + 2);
    ctx.quadraticCurveTo(fx + 14, fy - 4, fx + 14, fy + 20);
    ctx.closePath();
    fs(ctx, '#ff7a1a', null);
    ctx.beginPath();
    ctx.moveTo(fx - 7, fy + 20);
    ctx.quadraticCurveTo(fx - 6, fy + 6, fx, fy + 8);
    ctx.quadraticCurveTo(fx + 6, fy + 4, fx + 7, fy + 20);
    ctx.closePath();
    fs(ctx, '#ffd23d', null);
    return { canvas: c, ox: 0, oy: -(H - T), foot: { x: 10, y: 4, w: 2 * T - 20, h: 40 } };
  }

  function anvil() {
    const c = mk(T, T + 6), ctx = c.getContext('2d');
    ell(ctx, T / 2, T + 2, 18, 5);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    rr(ctx, 12, 34, 24, 16, 3);
    fs(ctx, '#7a4a22', OUT, 2);
    rr(ctx, 17, 24, 14, 12, 2);
    fs(ctx, '#4f5566', OUT, 2);
    ctx.beginPath();
    ctx.moveTo(4, 18);
    ctx.lineTo(40, 14);
    ctx.lineTo(44, 20);
    ctx.lineTo(40, 26);
    ctx.lineTo(10, 26);
    ctx.closePath();
    fs(ctx, '#5f6577', OUT, 2.2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(14, 16, 18, 3);
    return { canvas: c, ox: 0, oy: -6, foot: { x: 6, y: 18, w: 36, h: 26 } };
  }

  function fence() {
    const c = mk(T, T), ctx = c.getContext('2d');
    ctx.fillStyle = '#b38148';
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 2;
    for (const y of [18, 30]) {
      rr(ctx, -2, y, T + 4, 6, 2);
      fs(ctx, '#c08a4a', OUT, 1.8);
    }
    for (const x of [6, 30]) {
      rr(ctx, x, 10, 10, 32, 2);
      fs(ctx, '#b38148', OUT, 1.8);
      ctx.beginPath();
      ctx.moveTo(x, 10);
      ctx.lineTo(x + 5, 4);
      ctx.lineTo(x + 10, 10);
      fs(ctx, '#b38148', OUT, 1.8);
    }
    return { canvas: c, ox: 0, oy: 0, foot: { x: 0, y: 16, w: T, h: 22 } };
  }

  function bench() {
    const c = mk(2 * T, T), ctx = c.getContext('2d');
    ell(ctx, T, T - 4, 40, 6);
    fs(ctx, 'rgba(0,0,0,0.2)', null);
    for (const x of [10, 2 * T - 18]) {
      rr(ctx, x, 22, 8, 20, 2);
      fs(ctx, '#5d6170', OUT, 1.8);
    }
    rr(ctx, 4, 16, 2 * T - 8, 12, 3);
    fs(ctx, '#b07a44', OUT, 2);
    rr(ctx, 4, 4, 2 * T - 8, 9, 3);
    fs(ctx, '#b07a44', OUT, 2);
    return { canvas: c, ox: 0, oy: 0, foot: { x: 2, y: 8, w: 2 * T - 4, h: 30 } };
  }

  function signpost() {
    const c = mk(T + 10, 1.6 * T), ctx = c.getContext('2d');
    const H = c.height;
    ell(ctx, T / 2 + 5, H - 4, 12, 4);
    fs(ctx, 'rgba(0,0,0,0.2)', null);
    rr(ctx, T / 2 + 1, 20, 8, H - 26, 2);
    fs(ctx, '#8a5a2b', OUT, 2);
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(T, 10);
    ctx.lineTo(T + 8, 20);
    ctx.lineTo(T, 30);
    ctx.lineTo(6, 30);
    ctx.closePath();
    fs(ctx, '#c08a4a', OUT, 2);
    ctx.strokeStyle = '#6b4320';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, 17);
    ctx.lineTo(T - 6, 17);
    ctx.moveTo(12, 23);
    ctx.lineTo(T - 14, 23);
    ctx.stroke();
    return { canvas: c, ox: -5, oy: -(H - T), foot: { x: 16, y: 30, w: 16, h: 14 } };
  }

  function flowerpot() {
    const c = mk(T, T), ctx = c.getContext('2d');
    ell(ctx, T / 2, T - 4, 12, 4);
    fs(ctx, 'rgba(0,0,0,0.2)', null);
    ctx.beginPath();
    ctx.moveTo(14, 26);
    ctx.lineTo(34, 26);
    ctx.lineTo(31, 44);
    ctx.lineTo(17, 44);
    ctx.closePath();
    fs(ctx, '#d2764a', OUT, 2);
    rr(ctx, 12, 22, 24, 6, 2);
    fs(ctx, '#e08a5c', OUT, 2);
    circ(ctx, 24, 16, 9);
    fs(ctx, '#3d9a3a', OUT, 2);
    const cols = ['#ff5a5a', '#ffd23d', '#ff8ad0', '#ffffff'];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      circ(ctx, 24 + Math.cos(a) * 5, 15 + Math.sin(a) * 5, 3);
      fs(ctx, cols[i], null);
    }
    return { canvas: c, ox: 0, oy: 0, foot: { x: 12, y: 24, w: 24, h: 20 } };
  }

  const objCache = {};
  function object(spec) {
    const key = JSON.stringify(spec);
    if (objCache[key]) return objCache[key];
    let o;
    switch (spec.type) {
      case 'house': o = house(spec); break;
      case 'stall': o = stall(spec); break;
      case 'fountain': o = fountain(spec.frame || 0); break;
      case 'tree': o = tree(spec.v || 0); break;
      case 'bush': o = bush(spec.v || 0); break;
      case 'barrel': o = barrel(); break;
      case 'crate': o = crate(); break;
      case 'lamp': o = lamp(); break;
      case 'cart': o = cart(); break;
      case 'forge': o = forge(); break;
      case 'anvil': o = anvil(); break;
      case 'fence': o = fence(); break;
      case 'bench': o = bench(); break;
      case 'signpost': o = signpost(); break;
      case 'flowerpot': o = flowerpot(); break;
      default: throw new Error('unknown object ' + spec.type);
    }
    objCache[key] = o;
    return o;
  }

  RPG.art = { tile, object, rr, fs, ell, circ, OUT, mk };
})();
