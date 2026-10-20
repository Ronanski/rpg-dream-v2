/* RPG Dream - world data (Seren Village).
   Lahat ng coordinates dito ay nasa "map units" = pixels ng original reference
   image (527 x 518). Ang assets/map.png ay 2x ng image na iyon; ang game ang
   nag-a-apply ng SCALE. Dito mo i-e-edit ang walkable area, NPCs, at dialogue. */
(function () {
  const RPG = (window.RPG = window.RPG || {});

  RPG.world = {
    mapSize: { w: 527, h: 518 },
    // Hindi ipinapakita ng camera ang label box (top) at ang putol na corner (bottom-right).
    cameraBounds: { minX: 0, minY: 76, maxX: 505, maxY: 500 },
    heroStart: { x: 300, y: 335, dir: 'down' },

    // Walkable area = cobblestone plaza + path papuntang top-right (clockwise polygon).
    walkable: [
      [270, 250], [300, 228], [335, 232], [360, 236], [390, 215], [425, 160],
      [465, 118], [500, 130], [475, 205], [452, 250], [452, 420], [440, 470],
      [400, 482], [335, 452], [290, 470], [255, 445], [238, 400], [240, 360],
      [262, 300],
    ],

    // Solid na bagay sa loob ng plaza. ellipse = {cx, cy, rx, ry}; rect = {x, y, w, h}
    solids: [
      { kind: 'ellipse', cx: 362, cy: 396, rx: 64, ry: 50, name: 'fountain' },
    ],

    // NPCs: naka-bake sa map image. rect = puwesto nila (map units) para sa
    // collision + depth; talk = dialogue. portrait = crop ng rect bilang mukha.
    npcs: [
      {
        id: 'mira', name: 'Mira (Innkeeper)', rect: { x: 297, y: 204, w: 30, h: 54 },
        talk: (s) => {
          if (!s.quest.catFound && !s.quest.started) {
            s.quest.started = true;
            return [
              'Welcome to Seren Village, traveler!',
              'Oh no... my cat Mochi ran off again. I think she went near the fountain.',
              'Could you find her for me? I will reward you.',
            ];
          }
          if (s.quest.started && !s.quest.catFound) return ['Mochi is somewhere near the fountain. Please look for her!'];
          if (s.quest.catFound && !s.quest.done) {
            s.quest.done = true;
            s.gold += 20;
            return ['You found Mochi! Thank you so much.', 'Here, take 20 gold for your trouble.'];
          }
          return ['Thanks again for finding Mochi. Come by the inn anytime!'];
        },
      },
      {
        id: 'rolf', name: 'Captain Rolf', rect: { x: 372, y: 221, w: 44, h: 62 },
        talk: () => ['Stay sharp, young one. The forest road has been restless lately.', 'A sword on your back means nothing if you cannot swing it.'],
      },
      {
        id: 'ana', name: 'Ana', rect: { x: 233, y: 290, w: 33, h: 62 },
        talk: () => ['The apples at the yellow stall are the sweetest in the village.'],
      },
      {
        id: 'pip', name: 'Pip', rect: { x: 208, y: 318, w: 28, h: 58 },
        talk: () => ['When I grow up I want a sword like yours!'],
      },
      {
        id: 'bram', name: 'Bram the Hunter', rect: { x: 205, y: 380, w: 35, h: 72 },
        talk: () => ['Headed out of town? Take the south road. The north one floods this season.'],
      },
      {
        id: 'couple', name: 'Tomas & Lina', rect: { x: 405, y: 420, w: 65, h: 80 },
        talk: () => ['Tomas: Fifty years we have sat by this fountain.', 'Lina: And he still forgets our anniversary.'],
      },
      {
        id: 'mochi', name: 'Mochi', rect: { x: 398, y: 418, w: 24, h: 28 }, portraitPad: 8,
        talk: (s) => {
          if (s.quest.started && !s.quest.catFound) {
            s.quest.catFound = true;
            return ['Meow~', '(Mochi rubs against your leg. Go tell Mira!)'];
          }
          return ['Meow.'];
        },
      },
      {
        id: 'gorrin', name: 'Gorrin (Blacksmith)', rect: { x: 455, y: 258, w: 38, h: 84 }, reach: 22,
        talk: (s) => (s.gold >= 50
          ? ['Fifty gold, eh? Come back later and I will sharpen that blade of yours.']
          : ['Bring me 50 gold and I will sharpen that blade. For now... keep it on your back.']),
      },
      {
        id: 'bread', name: 'Bread Stall', rect: { x: 300, y: 150, w: 82, h: 80 }, reach: 10, noDepth: true,
        talk: () => ['Fresh bread, baked this morning! ...Sorry, we are sold out until tomorrow.'],
      },
      {
        id: 'fruit', name: 'Fruit Stall', rect: { x: 140, y: 300, w: 95, h: 85 }, reach: 12, noDepth: true,
        talk: () => ['Apples, oranges, and grapes! Fresh from the orchard.'],
      },
    ],
  };
})();
