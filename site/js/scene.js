// Mark's room — every pixel is drawn here, on a 320×180 canvas.
// No image files: sprites are strings, one character per pixel.

export const W = 320;
export const H = 180;
const FLOOR_Y = 140;

const C = {
  wallTop: '#171a2c', wall: '#1d2136', wallDot: '#232842', trim: '#2c3150', base: '#121424',
  floorA: '#3d2a2c', floorB: '#45302f', floorLine: '#2b1d20', floorShine: '#54393a',
  wood: '#8a5a3c', woodLight: '#a8714c', woodDark: '#5e3b28', woodDeep: '#43291c',
  teal: '#2bbecb', tealLight: '#7ff3ff', tealDark: '#17707a',
  hoodie: '#2e3448', hoodieLight: '#3c4460', hoodieDark: '#22273a',
  skin: '#c98a5e', skinShade: '#a96e48', hair: '#15121c', hairLight: '#2c2742',
  chair: '#12141f', chairLight: '#1f2333',
  white: '#e9edf5', grey: '#9aa3b5', greyDark: '#5d6578',
  cork: '#b58552', corkDark: '#93683c', paper: '#f1e9d2', note1: '#f6d365', note2: '#ff8fab', note3: '#9be7a0',
  red: '#e05a5a', leaf: '#4caf6a', leafDark: '#2f7a48', pot: '#c06a43',
  dogO: '#d98a3a', dogC: '#f2dcb8', dogK: '#4a2a16',
};

// ---------- tiny helpers ----------
let ctx;
const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
const rand = (a, b) => a + Math.random() * (b - a);

function sprite(rows, pal, x, y, flip = false) {
  const w = rows[0].length;
  for (let j = 0; j < rows.length; j++) {
    const row = rows[j];
    for (let i = 0; i < row.length; i++) {
      const c = pal[row[i]];
      if (c) R(x + (flip ? w - 1 - i : i), y + j, 1, 1, c);
    }
  }
}

// ---------- sprites ----------
const HEAD = [
  '....PPPPPPPP....',
  '..PPhhhhhhhhPP..',
  '.PhhhhhhhhhhhhP.',
  '.PhhhHhhhHhhhhP.',
  'pphhhhhhhhhhhhpp',
  'pphshhhhhhhhhspp',
  'ppssshhsshhssspp',
  'ppsssssssssssspp',
  'ppsseessssseespp',
  'ppsssssssssssspp',
  '.PsssssSSsssssP.',
  '..ssssmmmmssss..',
  '..SssssssssssS..',
  '...SSssssssSS...',
  '......ssss......',
  '......SSSS......',
];
const headPal = (blink) => ({
  P: C.tealDark, p: C.teal, h: C.hair, H: C.hairLight, s: C.skin, S: C.skinShade,
  e: blink ? C.skinShade : '#1a1420', m: '#7a3e2e',
});

const DOG_WALK = [
  [
    '..........k...k.',
    '.........kok.kok',
    '.........koooook',
    '..k......kooeook',
    '.kok.....kcooccn',
    '.kcok...kocccck.',
    '..kkkkkkkkkoook.',
    '..kooooooooooook',
    '..koooooooocccck',
    '..kccccccccccck.',
    '..k.k......k.k..',
    '..kc.kc....kc.kc',
  ],
  [
    '..........k...k.',
    '.........kok.kok',
    '.........koooook',
    '...k.....kooeook',
    '..kok....kcooccn',
    '..kcok..kocccck.',
    '..kkkkkkkkkoook.',
    '..kooooooooooook',
    '..koooooooocccck',
    '..kccccccccccck.',
    '...k.k....k.k...',
    '...kckc...kckc..',
  ],
];
const DOG_SLEEP = [
  '................',
  '................',
  '................',
  '................',
  '....kkkkkkkk....',
  '..kkoooooooookk.',
  '.koooooooooookok',
  '.kooooooooookcck',
  '.kocccoooookcccn',
  '.koccccooookccck',
  '..kkkkkkkkkkkkk.',
  '................',
];
const dogPal = { k: C.dogK, o: C.dogO, c: C.dogC, e: '#140c08', n: '#140c08' };

// 5×7 letters for the neon sign
const GLYPHS = {
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
};

// stable pseudo-random stars
const STARS = Array.from({ length: 22 }, (_, i) => ({
  x: 21 + ((i * 37) % 58), y: 31 + ((i * 53) % 50), p: (i * 0.7) % 6.28,
}));

// ---------- time of day (the viewer's own clock) ----------
function daylight(d) {
  const h = d.getHours() + d.getMinutes() / 60;
  if (h < 5 || h >= 20) return { phase: 'night', light: 0 };
  if (h < 7) return { phase: 'dawn', light: (h - 5) / 2 };
  if (h < 17) return { phase: 'day', light: 1 };
  return { phase: 'dusk', light: 1 - (h - 17) / 3 };
}
const SKY = {
  night: ['#070a22', '#111843'],
  dawn: ['#6a7fd1', '#f4a27a'],
  day: ['#4fa8ec', '#9ad8ff'],
  dusk: ['#4b3a8c', '#f08a5d'],
};

// ---------- the scene ----------
export function createScene(canvas, hooks = {}) {
  ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const s = {
    t: 0,
    hover: null,
    blinds: 0, blindsTarget: 0,          // 0 open, 1 closed
    blinkUntil: 0, nextBlink: 2,
    stretchUntil: 0, nextStretch: rand(14, 24),
    ringUntil: 0, nextRing: rand(25, 45),
    neonOffUntil: 0, nextFlicker: rand(6, 14),
    hearts: [],
    dog: { x: 70, dir: 1, state: 'sleep', until: rand(8, 15), target: 0, wag: 0 },
  };

  const objects = [
    { id: 'window', label: 'Window · open/close the blind', x: 16, y: 26, w: 68, h: 70 },
    { id: 'projects', label: 'Projects', x: 90, y: 40, w: 56, h: 46 },
    { id: 'about', label: 'About me', x: 194, y: 38, w: 52, h: 38 },
    { id: 'skills', label: 'Skills', x: 260, y: 50, w: 50, h: 98 },
    { id: 'contact', label: 'Contact · the phone', x: 24, y: 100, w: 30, h: 18 },
    { id: 'mark', label: 'Mark', x: 148, y: 54, w: 44, h: 56 },
    { id: 'dog', label: 'Mochi', x: 0, y: 0, w: 18, h: 14 },
  ];
  const dogBox = objects.find((o) => o.id === 'dog');

  // ---------- drawing ----------
  function drawWall() {
    R(0, 0, W, FLOOR_Y, C.wall);
    R(0, 0, W, 8, C.wallTop);
    for (let y = 12; y < FLOOR_Y - 6; y += 8)
      for (let x = (y / 8) % 2 ? 4 : 8; x < W; x += 8) R(x, y, 1, 1, C.wallDot);
    R(0, FLOOR_Y - 4, W, 3, C.trim);
    R(0, FLOOR_Y - 1, W, 1, C.base);
  }

  function drawFloor() {
    for (let y = FLOOR_Y; y < H; y += 6) {
      R(0, y, W, 6, (y / 6) % 2 ? C.floorA : C.floorB);
      R(0, y, W, 1, C.floorLine);
      const off = ((y * 7) % 40);
      for (let x = off; x < W; x += 48) R(x, y, 1, 6, C.floorLine);
    }
    // a soft rug under the desk
    R(108, 158, 124, 14, '#26404a');
    R(110, 160, 120, 10, '#2e5560');
    for (let x = 112; x < 228; x += 6) R(x, 164, 3, 2, C.tealDark);
    R(108, 158, 124, 1, '#1b2e35');
  }

  function drawWindow(d) {
    const { phase } = daylight(d);
    const [top, bottom] = SKY[phase];
    const x0 = 20, y0 = 30, w = 60, h = 54;
    for (let j = 0; j < h; j++) {
      const k = j / h;
      ctx.fillStyle = mix(top, bottom, k);
      ctx.fillRect(x0, y0 + j, w, 1);
    }
    if (phase === 'night' || phase === 'dusk') {
      for (const st of STARS) {
        const tw = Math.sin(s.t * 2 + st.p) > 0.2;
        if (phase === 'night' || st.y < 45) R(st.x, st.y, 1, 1, tw ? '#ffffff' : '#7d86b8');
      }
    }
    if (phase === 'night') {
      R(62, 36, 7, 7, '#f3f0d6'); R(64, 36, 5, 1, '#f3f0d6');
      R(61, 37, 1, 5, '#f3f0d6'); R(65, 38, 4, 4, '#dcd6b0');
      R(63, 37, 6, 5, '#070a22'); // crescent bite
      R(62, 36, 2, 7, '#f3f0d6');
    } else {
      const sunY = phase === 'day' ? 38 : 66;
      R(64, sunY, 8, 8, phase === 'day' ? '#fff3b0' : '#ffd08a');
      R(63, sunY + 1, 10, 6, phase === 'day' ? '#fff3b0' : '#ffd08a');
    }
    // drifting clouds
    if (phase !== 'night') {
      const cc = phase === 'day' ? '#ffffff' : '#f7c4a8';
      for (let i = 0; i < 3; i++) {
        const cx = x0 - 20 + ((s.t * (2 + i) + i * 31) % (w + 30));
        const cy = y0 + 8 + i * 13;
        ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
        R(cx, cy, 14, 3, cc); R(cx + 3, cy - 2, 7, 2, cc); R(cx + 2, cy + 3, 10, 1, cc);
        ctx.restore();
      }
    }
    // far skyline silhouette
    const sil = phase === 'day' ? '#3a6f98' : phase === 'night' ? '#0c1233' : '#3a2d63';
    const blds = [[20, 10], [27, 16], [33, 8], [40, 20], [47, 12], [55, 18], [62, 9], [68, 14], [74, 11]];
    for (const [bx, bh] of blds) R(bx, 84 - bh, 7, bh, sil);
    if (phase !== 'day') for (const [bx, bh] of blds) if (bh > 10) R(bx + 2, 84 - bh + 3, 1, 1, '#ffd36b');

    // roller blind
    const bh = Math.round(s.blinds * h);
    if (bh > 0) {
      R(x0, y0, w, bh, '#cfd6e2');
      for (let y = y0 + 3; y < y0 + bh; y += 4) R(x0, y, w, 1, '#b4bdcc');
      R(x0, y0 + bh - 2, w, 2, '#8d97a8');
      R(x0 + w / 2 - 1, y0 + bh, 2, 3, '#8d97a8');
    }
    // frame
    R(16, 26, 68, 4, C.wood); R(16, 84, 68, 4, C.wood);
    R(16, 26, 4, 62, C.wood); R(80, 26, 4, 62, C.wood);
    R(49, 30, 2, 54, C.wood); R(20, 56, 60, 2, C.wood);
    R(16, 26, 68, 1, C.woodLight);
    R(13, 88, 74, 4, C.woodLight); R(13, 91, 74, 1, C.woodDark);
    R(18, 22, 64, 4, '#3a3f58'); R(18, 22, 64, 1, '#4a5070');
    // a little cactus on the sill
    R(70, 81, 6, 7, C.pot); R(69, 81, 8, 2, '#d27b52');
    R(72, 74, 3, 7, C.leaf); R(70, 76, 2, 3, C.leaf); R(75, 75, 2, 3, C.leaf); R(73, 74, 1, 7, C.leafDark);
  }

  function drawFrames() {
    // three framed website thumbnails = projects
    const frames = [[92, 44, 24, 18, '#4fb3c9'], [120, 44, 24, 18, '#e48a5b'], [100, 66, 36, 18, '#8a7bd8']];
    for (const [x, y, w, h, accent] of frames) {
      R(x - 1, y - 1, w + 2, h + 2, '#0f1120');
      R(x, y, w, h, C.woodDark);
      R(x + 2, y + 2, w - 4, h - 4, '#f4f6fb');
      R(x + 2, y + 2, w - 4, 3, accent);
      R(x + 4, y + 7, (w - 8) * 0.6, 2, '#2b3245');
      R(x + 4, y + 10, (w - 8) * 0.8, 1, '#9aa3b5');
      R(x + 4, y + 12, (w - 8) * 0.5, 1, '#9aa3b5');
      if (h > 16) R(x + w - 10, y + 7, 6, 6, accent);
    }
    R(103, 42, 1, 2, C.grey); R(131, 42, 1, 2, C.grey);
  }

  function drawNeon(d) {
    const off = !reduced && s.t < s.neonOffUntil;
    const letters = 'MARK';
    const x0 = 136, y0 = 12;
    const lit = off ? '#1f5d63' : C.tealLight;
    if (!off) {
      ctx.save();
      ctx.shadowColor = C.teal; ctx.shadowBlur = 8;
      drawWord(letters, x0, y0, C.teal);
      ctx.restore();
    }
    drawWord(letters, x0, y0, off ? '#1d4a50' : C.teal);
    // bright 1px core running through the tube, joined to its neighbours
    for (let n = 0; n < 4; n++) {
      const g = GLYPHS[letters[n]];
      const on = (i, j) => g[j]?.[i] === '1';
      for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++) {
        if (!on(i, j)) continue;
        const x = x0 + n * 13 + i * 2, y = y0 + j * 2;
        R(x, y, 1, 1, lit);
        if (on(i + 1, j)) R(x + 1, y, 1, 1, lit);
        if (on(i, j + 1)) R(x, y + 1, 1, 1, lit);
        if (on(i + 1, j + 1) && !on(i + 1, j) && !on(i, j + 1)) R(x + 1, y + 1, 1, 1, lit);
        if (on(i - 1, j + 1) && !on(i - 1, j) && !on(i, j + 1)) R(x - 1, y + 1, 1, 1, lit);
      }
    }
    // tiny caption under the sign
    R(146, 30, 28, 1, off ? '#1d4a50' : '#1f8f99');
  }
  function drawWord(word, x0, y0, color) {
    for (let n = 0; n < word.length; n++) {
      const g = GLYPHS[word[n]];
      for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++)
        if (g[j][i] === '1') R(x0 + n * 13 + i * 2, y0 + j * 2, 2, 2, color);
    }
  }

  function drawCork() {
    R(194, 38, 52, 38, C.woodDark);
    R(196, 40, 48, 34, C.cork);
    for (let i = 0; i < 30; i++) R(197 + ((i * 17) % 46), 41 + ((i * 11) % 32), 1, 1, C.corkDark);
    // polaroid of Mark
    R(200, 44, 14, 17, C.paper);
    R(201, 45, 12, 11, '#6fa3c7');
    R(205, 47, 4, 4, C.skin); R(205, 46, 4, 1, C.hair); R(204, 51, 6, 5, C.hoodie);
    R(206, 43, 2, 2, C.red);
    // sticky notes
    R(218, 44, 10, 10, C.note1); R(220, 47, 6, 1, '#b8952e'); R(220, 50, 4, 1, '#b8952e');
    R(230, 46, 10, 10, C.note2); R(232, 49, 6, 1, '#b05470'); R(232, 52, 5, 1, '#b05470');
    R(218, 58, 22, 12, C.paper); R(220, 60, 14, 1, '#7c8597'); R(220, 63, 18, 1, '#7c8597'); R(220, 66, 10, 1, '#7c8597');
    R(201, 64, 12, 8, C.note3); R(203, 67, 7, 1, '#4f8a55');
    R(222, 43, 2, 2, C.teal); R(234, 45, 2, 2, '#f6d365'); R(228, 57, 2, 2, C.red);
  }

  function drawClock(d) {
    const cx = 284, cy = 28;
    R(cx - 9, cy - 7, 18, 14, C.woodDark); R(cx - 7, cy - 9, 14, 18, C.woodDark);
    R(cx - 8, cy - 6, 16, 12, C.white); R(cx - 6, cy - 8, 12, 16, C.white);
    R(cx - 1, cy - 7, 2, 1, C.greyDark); R(cx - 1, cy + 6, 2, 1, C.greyDark);
    R(cx - 7, cy - 1, 1, 2, C.greyDark); R(cx + 6, cy - 1, 1, 2, C.greyDark);
    const m = d.getMinutes(), h = (d.getHours() % 12) + m / 60;
    line(cx, cy, cx + Math.sin(h / 12 * 6.283) * 4, cy - Math.cos(h / 12 * 6.283) * 4, '#1a1d2b');
    line(cx, cy, cx + Math.sin(m / 60 * 6.283) * 6, cy - Math.cos(m / 60 * 6.283) * 6, C.tealDark);
    R(cx, cy, 1, 1, C.red);
  }
  function line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) R(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 1, 1, c);
  }

  function drawShelf() {
    const x = 262, y = 52, w = 46, h = 96;
    R(x, y, w, h, C.woodDark); R(x + 2, y + 2, w - 4, h - 4, '#2a1a12');
    R(x, y, w, 2, C.woodLight);
    const shelves = [y + 30, y + 60, y + 90];
    for (const sy of shelves) R(x + 2, sy, w - 4, 3, C.wood);
    const books = [
      ['#e05a5a', 8], ['#f6d365', 7], ['#2bbecb', 9], ['#8a7bd8', 6], ['#e9edf5', 8], ['#4caf6a', 7],
      ['#e48a5b', 9], ['#5b8def', 6], ['#ff8fab', 8],
    ];
    // top shelf: books
    let bx = x + 3;
    for (let i = 0; i < 6; i++) {
      const [c, bw] = [books[i][0], 4 + (i % 3)];
      const bh = 18 + ((i * 5) % 8);
      R(bx, y + 30 - bh, bw, bh, c); R(bx, y + 30 - bh + 3, bw, 1, '#00000033');
      bx += bw + 1;
    }
    // little trophy
    R(bx + 3, y + 20, 6, 4, '#f2c14e'); R(bx + 5, y + 24, 2, 3, '#c9972c'); R(bx + 3, y + 27, 6, 3, '#6b4430');
    // middle shelf: leaning books + game controller
    bx = x + 3;
    for (let i = 6; i < 9; i++) { R(bx, y + 60 - 20, 5, 20, books[i][0]); bx += 6; }
    R(x + 23, y + 54, 16, 6, '#3c4460'); R(x + 25, y + 53, 4, 2, '#3c4460'); R(x + 33, y + 53, 4, 2, '#3c4460');
    R(x + 26, y + 56, 1, 1, C.teal); R(x + 25, y + 57, 3, 1, C.teal); R(x + 26, y + 58, 1, 1, C.teal);
    R(x + 34, y + 56, 1, 1, C.red); R(x + 36, y + 57, 1, 1, '#f6d365');
    // bottom shelf: boxes / tech
    R(x + 4, y + 72, 16, 18, '#3a3f58'); R(x + 6, y + 75, 12, 2, C.teal);
    R(x + 23, y + 78, 18, 12, '#5e3b28'); R(x + 23, y + 78, 18, 2, '#7b4e35');
    R(x + 29, y + 82, 6, 1, '#c9a27a');
  }

  function drawCabinet(d) {
    R(18, 116, 42, 32, C.wood); R(18, 116, 42, 2, C.woodLight);
    R(20, 120, 38, 12, C.woodDark); R(20, 134, 38, 12, C.woodDark);
    R(36, 125, 6, 2, '#d3b38a'); R(36, 139, 6, 2, '#d3b38a');
    R(20, 148, 3, 4, C.woodDeep); R(55, 148, 3, 4, C.woodDeep);
    // rotary phone
    const ring = s.t < s.ringUntil;
    const jx = ring ? (Math.floor(s.t * 30) % 2 ? 1 : -1) : 0;
    const px = 28 + jx, py = 104;
    R(px + 2, py + 6, 18, 6, C.teal); R(px, py + 9, 22, 3, C.tealDark);
    R(px + 4, py + 4, 14, 3, C.teal);
    R(px + 7, py + 6, 8, 5, C.white); R(px + 9, py + 7, 4, 3, C.teal);
    R(px + 1, py + (ring ? -1 : 1), 20, 3, C.tealDark);
    R(px, py + (ring ? 0 : 2), 4, 4, C.tealDark); R(px + 18, py + (ring ? 0 : 2), 4, 4, C.tealDark);
    if (ring) {
      const k = Math.floor(s.t * 6) % 2;
      R(px - 4 - k, py + 2, 2, 1, C.tealLight); R(px - 5 - k, py + 5, 2, 1, C.tealLight);
      R(px + 24 + k, py + 2, 2, 1, C.tealLight); R(px + 25 + k, py + 5, 2, 1, C.tealLight);
    }
    // dog bed (back half; the front lip is drawn after the dog)
    R(64, 150, 34, 4, C.tealDark); R(66, 152, 30, 6, '#3a8e98'); R(70, 154, 22, 3, '#47a6b0');
  }
  function drawBedFront() {
    R(62, 157, 38, 5, C.tealDark); R(62, 157, 38, 1, C.teal); R(64, 162, 34, 1, '#0e2e33');
  }

  function drawChair() {
    R(152, 56, 36, 54, C.chair); R(154, 54, 32, 4, C.chair);
    R(156, 52, 28, 3, C.chairLight);
    R(158, 60, 2, 48, C.tealDark); R(180, 60, 2, 48, C.tealDark);
  }

  function drawMark() {
    const stretching = s.t < s.stretchUntil;
    const typing = !stretching;
    const bob = typing && Math.floor(s.t * 2) % 2 ? 1 : 0;
    const tap = Math.floor(s.t * 8) % 2;

    // torso
    R(155, 82, 30, 30, C.hoodie); R(157, 80, 26, 3, C.hoodie);
    R(163, 80, 14, 4, C.hoodieDark);
    R(166, 85, 1, 8, C.teal); R(173, 85, 1, 8, C.teal);
    R(160, 98, 20, 8, C.hoodieLight); // pocket
    R(155, 82, 1, 30, C.hoodieDark); R(184, 82, 1, 30, C.hoodieDark);

    if (stretching) {
      // arms up behind the head
      R(150, 60, 6, 26, C.hoodie); R(184, 60, 6, 26, C.hoodie);
      R(156, 56, 6, 6, C.hoodie); R(178, 56, 6, 6, C.hoodie);
      R(162, 54, 5, 4, C.skin); R(173, 54, 5, 4, C.skin);
    } else {
      R(148, 86, 8, 22, C.hoodie); R(184, 86, 8, 22, C.hoodie);
      R(148, 86, 1, 22, C.hoodieDark); R(191, 86, 1, 22, C.hoodieDark);
      R(150, 106 + tap, 7, 4, C.skin); R(183, 107 - tap, 7, 4, C.skin);
    }
    // head
    sprite(HEAD, headPal(s.t < s.blinkUntil), 162, 64 + bob);
    if (stretching) R(168, 76 + bob, 4, 1, '#7a3e2e'); // yawn
  }

  function drawDesk(dl) {
    // laptop (lid back faces us)
    R(160, 96, 20, 14, '#aeb6c7'); R(160, 96, 20, 1, '#cfd6e2');
    R(168, 101, 4, 4, dl < 0.5 ? C.tealLight : C.teal);
    R(156, 110, 28, 2, '#7f889b');
    // desk
    R(96, 110, 148, 4, C.woodLight); R(96, 110, 148, 1, '#c48a60');
    R(96, 114, 148, 6, C.wood); R(96, 119, 148, 1, C.woodDark);
    R(100, 120, 6, 34, C.woodDark); R(234, 120, 6, 34, C.woodDark);
    R(106, 120, 2, 30, C.woodDeep); R(232, 120, 2, 30, C.woodDeep);
    // plant
    R(108, 102, 10, 8, C.pot); R(107, 101, 12, 2, '#d27b52');
    R(112, 92, 2, 10, C.leafDark); R(108, 94, 4, 3, C.leaf); R(114, 90, 4, 3, C.leaf); R(106, 98, 4, 2, C.leaf); R(115, 96, 5, 2, C.leaf);
    // mug with steam
    R(132, 102, 8, 8, C.white); R(132, 104, 8, 2, C.teal); R(140, 104, 2, 4, C.white);
    if (!reduced) for (let i = 0; i < 3; i++) {
      const k = (s.t * 6 + i * 3) % 9;
      R(134 + (Math.floor(k) % 2) + i, 100 - k, 1, 1, '#ffffff55');
    }
    // books
    R(196, 104, 16, 3, '#e05a5a'); R(197, 101, 14, 3, '#5b8def'); R(196, 107, 16, 3, '#f6d365');
    // lamp
    R(214, 107, 12, 3, '#3a3f58'); R(219, 92, 2, 15, '#3a3f58');
    R(212, 88, 9, 2, '#3a3f58'); R(206, 84, 10, 5, C.teal); R(207, 89, 8, 1, '#fff6c8');
  }

  function drawLights(dl) {
    // the room darkens with the outside light; the lamp, neon and laptop push back
    const dark = 0.5 * (1 - dl) + (s.blinds > 0.5 ? 0.08 : 0);
    if (dark > 0.01) { ctx.fillStyle = `rgba(6,8,24,${dark})`; ctx.fillRect(0, 0, W, H); }
    if (dl < 0.8) {
      const a = 1 - dl;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(110,80,25,${0.38 * a})`;
      ctx.beginPath(); ctx.moveTo(207, 90); ctx.lineTo(215, 90); ctx.lineTo(234, 110); ctx.lineTo(188, 110); ctx.closePath(); ctx.fill();
      ctx.fillStyle = `rgba(150,110,40,${0.5 * a})`;
      ctx.fillRect(186, 110, 50, 2);
      // laptop glow on Mark's face
      ctx.fillStyle = `rgba(20,80,90,${0.35 * a})`;
      ctx.fillRect(164, 72, 12, 9);
      ctx.fillRect(166, 81, 8, 2);
      ctx.restore();
    }
  }

  function drawDog() {
    const g = s.dog;
    const y = 148;
    let rows;
    if (g.state === 'sleep') rows = DOG_SLEEP;
    else if (g.state === 'walk') rows = DOG_WALK[Math.floor(s.t * 6) % 2];
    else rows = DOG_WALK[0];
    // wagging: swap tail rows quickly
    if (g.state === 'idle' && Math.floor(s.t * 8) % 2) rows = DOG_WALK[1].slice(0, 6).concat(DOG_WALK[0].slice(6));
    sprite(rows, dogPal, g.x, y, g.dir < 0);
    if (g.state === 'sleep') {
      const k = Math.floor(s.t * 1.5) % 3;
      const zx = g.x + 14, zy = y + 2 - k * 3;
      R(zx, zy, 3, 1, '#c7d2ff'); R(zx + 1, zy + 1, 1, 1, '#c7d2ff'); R(zx, zy + 2, 3, 1, '#c7d2ff');
    }
    dogBox.x = g.x - 1; dogBox.y = y + (g.state === 'sleep' ? 3 : 0); dogBox.w = 18; dogBox.h = 13;
  }

  function drawHearts(dt) {
    s.hearts = s.hearts.filter((h) => (h.life -= dt) > 0);
    for (const h of s.hearts) {
      h.y -= dt * 10;
      const x = Math.round(h.x), y = Math.round(h.y);
      R(x, y, 2, 1, '#ff6f91'); R(x + 3, y, 2, 1, '#ff6f91'); R(x, y + 1, 5, 1, '#ff6f91'); R(x + 1, y + 2, 3, 1, '#ff6f91'); R(x + 2, y + 3, 1, 1, '#ff6f91');
    }
  }

  function drawHover() {
    const o = objects.find((ob) => ob.id === s.hover);
    if (!o) return;
    const k = Math.floor(s.t * 3) % 2;
    const c = C.tealLight, x0 = o.x - 2 - k, y0 = o.y - 2 - k, x1 = o.x + o.w + 1 + k, y1 = o.y + o.h + 1 + k;
    for (const [x, y, dx, dy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) {
      R(x, y, 1, 1, c); R(x + dx, y, 1, 1, c); R(x + 2 * dx, y, 1, 1, c);
      R(x, y + dy, 1, 1, c); R(x, y + 2 * dy, 1, 1, c);
    }
  }

  // ---------- behaviour ----------
  function update(dt) {
    s.t += dt;
    s.blinds += (s.blindsTarget - s.blinds) * Math.min(1, dt * 4);

    if (s.t > s.nextBlink) { s.blinkUntil = s.t + 0.14; s.nextBlink = s.t + rand(2.5, 5.5); }
    if (s.t > s.nextStretch) { s.stretchUntil = s.t + 1.8; s.nextStretch = s.t + rand(25, 45); }
    if (s.t > s.nextRing) { s.ringUntil = s.t + 3; s.nextRing = s.t + rand(50, 90); }
    if (s.t > s.nextFlicker) { s.neonOffUntil = s.t + rand(0.08, 0.3); s.nextFlicker = s.t + rand(5, 16); }

    const g = s.dog;
    if (g.state === 'walk') {
      const step = 14 * dt * Math.sign(g.target - g.x);
      g.dir = Math.sign(g.target - g.x) || g.dir;
      if (Math.abs(g.target - g.x) <= Math.abs(step)) {
        g.x = g.target;
        if (g.target === 70) { g.state = 'sleep'; g.dir = 1; g.until = s.t + rand(18, 35); }
        else { g.state = 'idle'; g.until = s.t + rand(4, 9); }
      } else g.x += step;
    } else if (s.t > g.until) {
      g.state = 'walk';
      // from the bed: go somewhere. elsewhere: sometimes wander on, sometimes head home
      g.target = g.x !== 70 && Math.random() < 0.45 ? 70 : Math.round(rand(110, 236));
    }
  }

  function draw() {
    const d = new Date();
    const { light } = daylight(d);
    drawWall();
    drawWindow(d);
    drawFrames();
    drawCork();
    drawClock(d);
    drawFloor();
    drawShelf();
    drawCabinet(d);
    drawChair();
    drawMark();
    drawDesk(light);
    drawDog();
    drawBedFront();
    drawLights(light);
    drawNeon(d);
    drawHearts(1 / 60);
    drawHover();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- input ----------
  function hit(x, y) {
    // dog first: it walks in front of everything
    const order = ['dog', 'contact', 'mark', 'window', 'projects', 'about', 'skills'];
    for (const id of order) {
      const o = objects.find((ob) => ob.id === id);
      if (x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h) return o;
    }
    return null;
  }
  const MARK_LINES = [
    'Fixing one more CSS bug… then sleep.',
    'Hi! Click around — everything in here does something.',
    'Mochi thinks the desk is hers.',
    'Currently shipping WordPress sites with Elementor + ACF.',
    'If the phone rings, that might be you. 📞',
    'Coffee count today: classified.',
  ];
  let lineIdx = 0;

  function click(o) {
    if (!o) return;
    if (o.id === 'window') { s.blindsTarget = s.blindsTarget ? 0 : 1; return; }
    if (o.id === 'dog') {
      const g = s.dog;
      if (g.state === 'sleep') { g.state = 'idle'; g.until = s.t + 5; hooks.say?.('*yawn*', g.x + 9, 140); }
      else { hooks.say?.('Arf!', g.x + 9, 140); g.state = 'idle'; g.until = s.t + 5; }
      for (let i = 0; i < 3; i++) s.hearts.push({ x: g.x + 4 + i * 4, y: 142 - i * 3, life: 1.2 });
      return;
    }
    if (o.id === 'mark') {
      hooks.say?.(MARK_LINES[lineIdx++ % MARK_LINES.length], 170, 58);
      return;
    }
    if (o.id === 'contact') s.ringUntil = 0;
    hooks.open?.(o.id);
  }

  return {
    objects,
    hitAt: hit,
    click,
    setHover(id) { s.hover = id; },
    toggleBlinds() { s.blindsTarget = s.blindsTarget ? 0 : 1; },
  };
}

// colour lerp for the sky gradient
function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}
