/* RPG Dream - chibi character drawing (procedural, anime style). */
(function () {
  const RPG = (window.RPG = window.RPG || {});
  const { rr, fs, ell, circ, OUT } = RPG.art;

  // cfg: {skin, hair, hairStyle, shirt, pants, cloak, hat, sword, apron, beard}
  function drawChar(ctx, cx, by, cfg, dir, frame) {
    dir = dir || 'down';
    frame = frame | 0;
    const flip = dir === 'left';
    ctx.save();
    if (flip) {
      ctx.translate(cx * 2, 0);
      ctx.scale(-1, 1);
    }
    const side = dir === 'left' || dir === 'right';
    const back = dir === 'up';
    const bob = frame ? -1 : 0;
    const skin = cfg.skin || '#ffd9b3';
    const hair = cfg.hair || '#4a2d14';
    const shirt = cfg.shirt || '#3f78d6';
    const pants = cfg.pants || '#3b3b58';

    // shadow
    ell(ctx, cx, by, 15, 5);
    fs(ctx, 'rgba(0,0,0,0.25)', null);

    // legs
    const lOff = frame === 1 ? -3 : 0, rOff = frame === 2 ? -3 : 0;
    rr(ctx, cx - 9, by - 13 + lOff, 8, 13, 3);
    fs(ctx, pants, OUT, 2);
    rr(ctx, cx + 1, by - 13 + rOff, 8, 13, 3);
    fs(ctx, pants, OUT, 2);
    ctx.fillStyle = '#5a3416';
    rr(ctx, cx - 9, by - 4 + lOff, 8, 4, 2);
    ctx.fill();
    rr(ctx, cx + 1, by - 4 + rOff, 8, 4, 2);
    ctx.fill();

    const bodyY = by - 30 + bob;
    // cloak behind
    if (cfg.cloak) {
      ctx.beginPath();
      ctx.moveTo(cx - 11, bodyY + 2);
      ctx.lineTo(cx + 11, bodyY + 2);
      ctx.lineTo(cx + 15, bodyY + 24);
      ctx.lineTo(cx - 15, bodyY + 24);
      ctx.closePath();
      fs(ctx, cfg.cloak, OUT, 2);
    }
    // sword hilt above shoulder (front views)
    if (cfg.sword && !back) {
      ctx.strokeStyle = '#d7dde6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx + 8, bodyY + 2);
      ctx.lineTo(cx + 14, bodyY - 10);
      ctx.stroke();
      ctx.strokeStyle = '#ffcc3d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 8, bodyY - 7);
      ctx.lineTo(cx + 15, bodyY - 3);
      ctx.stroke();
    }
    // body
    rr(ctx, cx - 11, bodyY, 22, 20, 6);
    fs(ctx, shirt, OUT, 2.2);
    if (cfg.apron) {
      rr(ctx, cx - 7, bodyY + 6, 14, 14, 3);
      fs(ctx, cfg.apron, OUT, 1.8);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    rr(ctx, cx - 11, bodyY + 15, 22, 4, 1);
    ctx.fill();
    // arms
    const armSwing = frame === 1 ? 2 : frame === 2 ? -2 : 0;
    if (!side) {
      rr(ctx, cx - 16, bodyY + 3 + armSwing, 6, 13, 3);
      fs(ctx, shirt, OUT, 2);
      rr(ctx, cx + 10, bodyY + 3 - armSwing, 6, 13, 3);
      fs(ctx, shirt, OUT, 2);
      circ(ctx, cx - 13, bodyY + 17 + armSwing, 3.2);
      fs(ctx, skin, OUT, 1.5);
      circ(ctx, cx + 13, bodyY + 17 - armSwing, 3.2);
      fs(ctx, skin, OUT, 1.5);
    } else {
      rr(ctx, cx - 3, bodyY + 3 + armSwing, 7, 13, 3);
      fs(ctx, shirt, OUT, 2);
      circ(ctx, cx + 0.5, bodyY + 17 + armSwing, 3.2);
      fs(ctx, skin, OUT, 1.5);
    }
    // sword on back (back view)
    if (cfg.sword && back) {
      ctx.strokeStyle = '#d7dde6';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 9, bodyY + 18);
      ctx.lineTo(cx + 12, bodyY - 8);
      ctx.stroke();
      ctx.strokeStyle = '#ffcc3d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 6, bodyY - 8);
      ctx.lineTo(cx + 14, bodyY - 1);
      ctx.stroke();
    }

    // head
    const hy = by - 57 + bob;
    rr(ctx, cx - 13, hy, 26, 27, 11);
    fs(ctx, skin, OUT, 2.2);
    // beard
    if (cfg.beard && !back) {
      ctx.beginPath();
      ctx.moveTo(cx - 10, hy + 16);
      ctx.quadraticCurveTo(cx, hy + 36, cx + 10, hy + 16);
      ctx.closePath();
      fs(ctx, cfg.beard, OUT, 2);
    }
    // hair
    const style = cfg.hairStyle || 'short';
    if (style !== 'bald') {
      if (back) {
        rr(ctx, cx - 14, hy - 3, 28, 26, 11);
        fs(ctx, hair, OUT, 2.2);
      } else {
        rr(ctx, cx - 14, hy - 3, 28, 15, 10);
        fs(ctx, hair, OUT, 2.2);
        // bangs
        ctx.beginPath();
        const bx0 = side ? cx - 4 : cx - 14;
        ctx.moveTo(bx0, hy + 8);
        for (let i = 0; i < 4; i++) {
          ctx.lineTo(bx0 + i * 7 + 3.5, hy + 14 + (i % 2) * 2);
          ctx.lineTo(bx0 + i * 7 + 7, hy + 8);
        }
        ctx.lineTo(cx + 14, hy + 8);
        ctx.lineTo(cx + 14, hy + 2);
        ctx.lineTo(bx0, hy + 2);
        ctx.closePath();
        fs(ctx, hair, OUT, 2);
      }
      if (style === 'spiky') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const x = cx - 12 + i * 6;
          ctx.moveTo(x, hy);
          ctx.lineTo(x + 3, hy - 9 - (i % 2) * 3);
          ctx.lineTo(x + 6, hy);
        }
        fs(ctx, hair, OUT, 2);
      }
      if (style === 'long') {
        rr(ctx, cx - 16, hy + 4, 7, 30, 3);
        fs(ctx, hair, OUT, 2);
        rr(ctx, cx + 9, hy + 4, 7, 30, 3);
        fs(ctx, hair, OUT, 2);
      }
      if (style === 'bob') {
        rr(ctx, cx - 16, hy + 2, 6, 20, 3);
        fs(ctx, hair, OUT, 2);
        rr(ctx, cx + 10, hy + 2, 6, 20, 3);
        fs(ctx, hair, OUT, 2);
      }
      if (style === 'bun') {
        circ(ctx, cx + (back ? 0 : 6), hy - 4, 6);
        fs(ctx, hair, OUT, 2);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      rr(ctx, cx - 9, hy - 1, 10, 4, 2);
      ctx.fill();
    }
    // face
    if (!back) {
      const eyeY = hy + 17;
      const eyes = side ? [cx + 6] : [cx - 5, cx + 5];
      for (const ex of eyes) {
        ell(ctx, ex, eyeY, 2.8, 4);
        fs(ctx, cfg.eyes || '#2b2b3a', null);
        circ(ctx, ex - 1, eyeY - 1.5, 1.1);
        fs(ctx, '#ffffff', null);
      }
      ctx.fillStyle = 'rgba(255,120,120,0.35)';
      if (!side) {
        ell(ctx, cx - 9, eyeY + 4, 3, 1.8);
        ctx.fill();
        ell(ctx, cx + 9, eyeY + 4, 3, 1.8);
        ctx.fill();
      }
      ctx.strokeStyle = '#8a4a3a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + (side ? 7 : -2), eyeY + 7);
      ctx.lineTo(cx + (side ? 10 : 2), eyeY + 7);
      ctx.stroke();
    }
    // hats
    if (cfg.hat === 'wide') {
      ell(ctx, cx, hy + 2, 22, 7);
      fs(ctx, cfg.hatColor || '#6b4a2a', OUT, 2.2);
      rr(ctx, cx - 11, hy - 14, 22, 17, 6);
      fs(ctx, cfg.hatColor || '#6b4a2a', OUT, 2.2);
      ctx.fillStyle = '#c8402e';
      ctx.fillRect(cx - 11, hy - 3, 22, 4);
    } else if (cfg.hat === 'wizard') {
      ell(ctx, cx, hy + 2, 20, 6);
      fs(ctx, cfg.hatColor || '#5a3d9a', OUT, 2.2);
      ctx.beginPath();
      ctx.moveTo(cx - 13, hy + 1);
      ctx.lineTo(cx + 13, hy + 1);
      ctx.quadraticCurveTo(cx + 6, hy - 14, cx + 9, hy - 28);
      ctx.quadraticCurveTo(cx - 4, hy - 16, cx - 13, hy + 1);
      ctx.closePath();
      fs(ctx, cfg.hatColor || '#5a3d9a', OUT, 2.2);
      circ(ctx, cx + 2, hy - 8, 2.5);
      fs(ctx, '#ffd23d', null);
    } else if (cfg.hat === 'helmet') {
      rr(ctx, cx - 15, hy - 5, 30, 18, 12);
      fs(ctx, '#9aa3b2', OUT, 2.2);
      ctx.fillStyle = '#c8402e';
      rr(ctx, cx - 2, hy - 12, 4, 10, 2);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (cfg.hat === 'bandana') {
      rr(ctx, cx - 14, hy - 3, 28, 12, 8);
      fs(ctx, cfg.hatColor || '#c8402e', OUT, 2.2);
    }
    ctx.restore();
  }

  function drawCat(ctx, cx, by, dir, frame) {
    const flip = dir === 'left';
    ctx.save();
    if (flip) {
      ctx.translate(cx * 2, 0);
      ctx.scale(-1, 1);
    }
    ell(ctx, cx, by, 12, 4);
    fs(ctx, 'rgba(0,0,0,0.22)', null);
    const bob = frame ? -1 : 0;
    // tail
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, by - 8);
    ctx.quadraticCurveTo(cx - 20, by - 10 - (frame ? 4 : 0), cx - 16, by - 20);
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = '#fff6ea';
    ctx.lineWidth = 3;
    ctx.stroke();
    // body
    ell(ctx, cx, by - 9 + bob, 12, 8);
    fs(ctx, '#fff6ea', OUT, 2);
    // head
    circ(ctx, cx + 6, by - 18 + bob, 8);
    fs(ctx, '#fff6ea', OUT, 2);
    ctx.beginPath();
    ctx.moveTo(cx + 0, by - 23 + bob);
    ctx.lineTo(cx + 1, by - 31 + bob);
    ctx.lineTo(cx + 6, by - 25 + bob);
    ctx.moveTo(cx + 8, by - 25 + bob);
    ctx.lineTo(cx + 12, by - 31 + bob);
    ctx.lineTo(cx + 13, by - 23 + bob);
    fs(ctx, '#fff6ea', OUT, 2);
    ctx.fillStyle = '#ffb3c6';
    circ(ctx, cx + 2.5, by - 27 + bob, 1.5);
    ctx.fill();
    circ(ctx, cx + 10.5, by - 27 + bob, 1.5);
    ctx.fill();
    ctx.fillStyle = '#2b2b3a';
    ell(ctx, cx + 3.5, by - 18 + bob, 1.4, 2.2);
    ctx.fill();
    ell(ctx, cx + 9, by - 18 + bob, 1.4, 2.2);
    ctx.fill();
    ctx.fillStyle = '#ffb3c6';
    circ(ctx, cx + 6.5, by - 15 + bob, 1.2);
    ctx.fill();
    ctx.restore();
  }

  RPG.sprites = { drawChar, drawCat };
})();
