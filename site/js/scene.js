// Mark's room — every pixel is drawn here, on a 320×180 canvas.
// No image files: sprites are strings, one character per pixel.

export const W = 320;
const RGB_DEFAULT = 0;
export const H = 180;
const FLOOR_Y = 128;

const C = {
  wallTop: '#171a2c', wall: '#1d2136', wallDot: '#232842', trim: '#2c3150', base: '#121424',
  floorA: '#3d2a2c', floorB: '#45302f', floorLine: '#2b1d20', floorShine: '#54393a',
  wood: '#8a5a3c', woodLight: '#a8714c', woodDark: '#5e3b28', woodDeep: '#43291c',
  teal: '#2bbecb', tealLight: '#7ff3ff', tealDark: '#17707a',
  hoodie: '#d9dde6', hoodieLight: '#f4f6fa', hoodieDark: '#9aa1b0', hood: '#8a90a0',
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
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
};

// stable pseudo-random stars, relative to each window's glass
const STARS = Array.from({ length: 16 }, (_, i) => ({
  x: 1 + ((i * 37) % 54), y: 1 + ((i * 53) % 30), p: (i * 0.7) % 6.28,
}));
// the two windows (glass area); the sun and moon live in the left one
const WINDOWS = [
  { id: 'window', x: 20, y: 20, w: 56, h: 44, sky: true, seed: 0 },
  { id: 'window2', x: 246, y: 20, w: 56, h: 44, sky: false, seed: 4 },
];
// the shelf with three doors: each column opens a panel
const SHELF = { x: 222, y: 128 };
const SHELF_COLS = ['about', 'projects', 'contact'];

// ---------- time of day (the viewer's own clock) ----------
// Topz's window shows Topz's sky: Iloilo time (UTC+8, no daylight saving)
function iloiloNow() {
  const d = new Date();
  return new Date(d.getTime() + (480 + d.getTimezoneOffset()) * 60000);
}
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
    blinds: 0, blindsTarget: 0,          // curtains: 0 open, 1 closed
    doors: [0, 0, 0], doorsTarget: [0, 0, 0], doorsCloseAt: [0, 0, 0], // shelf doors
    chair: { x: 0, tx: 0, next: rand(6, 12) }, // the chair rolls about a little
    blinkUntil: 0, nextBlink: 2,
    stretchUntil: 0, nextStretch: rand(14, 24),
    drinkStart: -10, drinkUntil: 0, nextDrink: rand(18, 30),
    ringUntil: 0, nextRing: rand(25, 45),
    neonOffUntil: 0, nextFlicker: rand(6, 14),
    hearts: [],
    weather: 'clear', flashUntil: 0, nextFlash: 8,
    ac: true,
    bulb: false, bulbGlow: 0,
    squeeze: { at: -10, count: 0 }, // the stress-ball alien
    chest: { open: 0, target: 0, item: null, itemAt: 0, closeAt: 0, last: -1, sparks: [] },
    roach: { x: 200, y: 170, tx: 200, ty: 170, state: 'wait', until: rand(3, 8), dir: 1, flee: false },
    mouse: { state: 'home', x: 82, dir: 1, until: rand(10, 20), tx: 82 },
    frog: { x: 176, y: 169, from: null, to: null, hopAt: 0, next: rand(3, 7) },
    spider: { y: 16, ty: 40, state: 'wait', until: rand(4, 10) },
    lizard: { x: 250, y: 46, dir: -1, tx: 240, ty: 70, state: 'freeze', until: rand(2, 6) },
    notes: [],
    music: false,
    rgbMode: RGB_DEFAULT,
    dog: { x: 70, dir: 1, state: 'sleep', until: rand(8, 15), target: 0, wag: 0 },
  };

  const objects = [
    { id: 'window', label: 'Window · open/close the curtains', x: 12, y: 10, w: 72, h: 66 },
    { id: 'window2', label: 'Window · open/close the curtains', x: 238, y: 10, w: 72, h: 66 },
    { id: 'about', label: 'Shelf · About me', x: 223, y: 129, w: 12, h: 31 },
    { id: 'projects', label: 'Shelf · Projects', x: 235, y: 129, w: 12, h: 31 },
    { id: 'contact', label: 'Shelf · Contact (the phone lives in here)', x: 247, y: 129, w: 12, h: 31 },
    { id: 'shelf', label: 'Bookshelf', x: 222, y: 116, w: 38, h: 12 },
    { id: 'jukebox', label: 'Jukebox · my Spotify playlists', x: 272, y: 112, w: 28, h: 50 },
    { id: 'katana', label: 'Katana rack', x: 129, y: 39, w: 66, h: 30 },
    { id: 'mark', label: 'Topz', x: 116, y: 78, w: 48, h: 88 },
    { id: 'monitors', label: 'Projects · on screen', x: 86, y: 64, w: 128, h: 46 },
    { id: 'pc', label: 'PC · change the RGB', x: 218, y: 70, w: 24, h: 42 },
    { id: 'bottle', label: 'Water bottle · take a sip', x: 175, y: 96, w: 8, h: 15 },
    { id: 'mug', label: 'Mug · "This MEETING should have been an EMAIL"', x: 62, y: 98, w: 13, h: 13 },
    { id: 'alien', label: 'Stress ball alien · squeeze it', x: 75, y: 96, w: 13, h: 15 },
    { id: 'dog', label: 'Mochi', x: 0, y: 0, w: 18, h: 14 },
    { id: 'aircon', label: 'Aircon · on/off', x: 132, y: 2, w: 60, h: 18 },
    { id: 'bulb', label: 'Light bulb · on/off', x: 87, y: 0, w: 14, h: 24 },
    { id: 'chest', label: 'Treasure chest · open me', x: 14, y: 138, w: 30, h: 30 },
    { id: 'hat', label: 'Straw hat', x: 127, y: 118, w: 26, h: 12 },
    { id: 'roach', label: '?', x: -99, y: 0, w: 14, h: 11 },
    { id: 'mouse', label: '?', x: -99, y: 0, w: 12, h: 9 },
    { id: 'frog', label: 'Frog', x: -99, y: 0, w: 11, h: 9 },
    { id: 'spider', label: 'Spider', x: -99, y: 0, w: 11, h: 9 },
    { id: 'lizard', label: 'Butiki', x: -99, y: 0, w: 14, h: 8 },
  ];
  const dogBox = objects.find((o) => o.id === 'dog');
  const box = (id) => objects.find((o) => o.id === id);

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
    R(84, 158, 112, 15, '#9aa1b0');
    R(86, 160, 108, 11, '#d4d8e0');
    for (let x = 88; x < 192; x += 6) R(x, 165, 3, 2, '#b2b8c4');
    R(84, 158, 112, 1, '#6b7183');
  }

  function drawWindow(d, win) {
    const { phase } = daylight(d);
    const wx = s.weather;
    const wet = wx === 'rain' || wx === 'storm';
    const gloomy = wet || wx === 'cloudy' || wx === 'fog';
    let [top, bottom] = SKY[phase];
    if (gloomy) { const g = phase === 'night' ? '#151a2c' : '#6d7484'; top = mix(top, g, 0.6); bottom = mix(bottom, g, 0.6); }
    const flash = s.t < s.flashUntil;
    if (flash) { top = '#e9eefc'; bottom = '#c9d3f0'; }
    const { x: x0, y: y0, w, h } = win;
    for (let j = 0; j < h; j++) {
      ctx.fillStyle = mix(top, bottom, j / h);
      ctx.fillRect(x0, y0 + j, w, 1);
    }
    if (!gloomy && (phase === 'night' || phase === 'dusk')) {
      for (const st of STARS) {
        const tw = Math.sin(s.t * 2 + st.p + win.seed) > 0.2;
        const sx = x0 + ((st.x + win.seed * 13) % w);
        if (phase === 'night' || st.y < 14) R(sx, y0 + st.y, 1, 1, tw ? '#ffffff' : '#7d86b8');
      }
    }
    if (!win.sky || gloomy) { /* one sun or moon for the room, hidden by clouds */ } else if (phase === 'night') {
      const mx = x0 + 40, my = y0 + 5;
      R(mx, my, 7, 7, '#f3f0d6'); R(mx + 2, my, 5, 1, '#f3f0d6');
      R(mx - 1, my + 1, 1, 5, '#f3f0d6'); R(mx + 3, my + 2, 4, 4, '#dcd6b0');
      R(mx + 1, my + 1, 6, 5, top); // crescent bite
      R(mx, my, 2, 7, '#f3f0d6');
    } else {
      const sunY = y0 + (phase === 'day' ? 7 : 28);
      R(x0 + 42, sunY, 8, 8, phase === 'day' ? '#fff3b0' : '#ffd08a');
      R(x0 + 41, sunY + 1, 10, 6, phase === 'day' ? '#fff3b0' : '#ffd08a');
    }
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    // drifting clouds
    if (phase !== 'night' || gloomy) {
      const cc = gloomy ? (phase === 'night' ? '#262b40' : '#a7adba') : phase === 'day' ? '#ffffff' : '#f7c4a8';
      for (let i = 0; i < (gloomy ? 5 : 3); i++) {
        const cx = x0 - 20 + ((s.t * (2 + i) + i * 31 + win.seed * 17) % (w + 30));
        const cy = y0 + (gloomy ? 4 + i * 6 : 6 + i * 10);
        R(cx, cy, 14, 3, cc); R(cx + 3, cy - 2, 7, 2, cc); R(cx + 2, cy + 3, 10, 1, cc);
      }
    }
    // far skyline silhouette
    const sil = phase === 'day' ? '#3a6f98' : phase === 'night' ? '#0c1233' : '#3a2d63';
    const hs = [10, 16, 8, 20, 12, 18, 9, 14, 11];
    for (let i = 0; i < hs.length; i++) {
      const bh = hs[(i + win.seed) % hs.length], bx = x0 + i * 7 - 2;
      R(bx, y0 + h - bh, 7, bh, sil);
      if (phase !== 'day' && bh > 10) R(bx + 2, y0 + h - bh + 3, 1, 1, '#ffd36b');
    }
    // weather on the glass
    if (wet) {
      const n = wx === 'storm' ? 28 : 18;
      for (let i = 0; i < n; i++) {
        const rx = x0 - 6 + ((i * 23 + s.t * 18) % (w + 12));
        const ry = y0 + ((i * 41 + s.t * (wx === 'storm' ? 110 : 80)) % h);
        R(rx, ry, 1, 2, '#c9d8efaa'); R(rx - 1, ry + 2, 1, 2, '#c9d8ef66');
      }
      for (let i = 0; i < 6; i++) { // drops sliding down the pane
        const dx = x0 + 3 + ((i * 17 + win.seed * 5) % (w - 6)), dy = y0 + ((i * 29 + s.t * (3 + i % 3)) % h);
        R(dx, dy, 1, 2, '#e4eefc'); R(dx, dy - 3, 1, 3, '#e4eefc44');
      }
    }
    if (wx === 'fog') { ctx.fillStyle = '#c9ced866'; ctx.fillRect(x0, y0, w, h); }
    ctx.restore();

    // frame, cross bars and sill
    R(x0 - 4, y0 - 4, w + 8, 4, C.wood); R(x0 - 4, y0 + h, w + 8, 4, C.wood);
    R(x0 - 4, y0 - 4, 4, h + 8, C.wood); R(x0 + w, y0 - 4, 4, h + 8, C.wood);
    R(x0 + w / 2 - 1, y0, 2, h, C.wood); R(x0, y0 + h / 2 - 1, w, 2, C.wood);
    R(x0 - 4, y0 - 4, w + 8, 1, C.woodLight);
    R(x0 - 7, y0 + h + 4, w + 14, 4, C.woodLight); R(x0 - 7, y0 + h + 7, w + 14, 1, C.woodDark);

    // curtains: two panels that slide together when closed
    R(x0 - 10, y0 - 9, w + 20, 2, '#3a3f58'); R(x0 - 11, y0 - 10, 3, 4, '#4a5070'); R(x0 + w + 8, y0 - 10, 3, 4, '#4a5070');
    const pw = Math.round(6 + (w / 2 + 2) * s.blinds);
    const fab = '#2a8f8a', fabD = '#1d6b67', fabL = '#43b3a9';
    const panel = (px, flipFold) => {
      R(px, y0 - 7, pw, h + 17, fab);
      for (let fx = px + (flipFold ? 1 : 2); fx < px + pw; fx += 3) R(fx, y0 - 6, 1, h + 15, fabD);
      R(px, y0 - 7, pw, 1, fabL);
      R(px, y0 + h + 9, pw, 1, fabD);
      for (let r = 0; r < pw; r += 4) R(px + r, y0 - 8, 1, 2, '#9aa1b0'); // rings
    };
    panel(x0 - 8, false);
    panel(x0 + w + 8 - pw, true);
    if (s.blinds < 0.3) { // tie-backs while open
      R(x0 - 9, y0 + h / 2 + 4, pw + 2, 2, '#f6d365'); R(x0 + w + 7 - pw, y0 + h / 2 + 4, pw + 2, 2, '#f6d365');
    }
    // something on each sill
    const sy = y0 + h + 4;
    if (win.sky) { // a little cactus
      const cx = x0 + 44;
      R(cx, sy - 7, 6, 7, C.pot); R(cx - 1, sy - 7, 8, 2, '#d27b52');
      R(cx + 2, sy - 14, 3, 7, C.leaf); R(cx, sy - 12, 2, 3, C.leaf); R(cx + 5, sy - 13, 2, 3, C.leaf); R(cx + 3, sy - 14, 1, 7, C.leafDark);
    } else { // a succulent
      const cx = x0 + 8;
      R(cx, sy - 5, 7, 5, '#e9edf5'); R(cx, sy - 5, 7, 1, '#ffffff');
      R(cx + 1, sy - 8, 2, 3, C.leaf); R(cx + 4, sy - 8, 2, 3, C.leaf); R(cx + 2, sy - 10, 3, 3, '#6cc98a'); R(cx + 3, sy - 9, 1, 2, C.leafDark);
    }
  }

  function drawNeon(d) {
    const off = !reduced && s.t < s.neonOffUntil;
    const letters = 'TOPZ';
    const x0 = 138, y0 = 21;
    const lit = off ? '#4a5068' : '#ffffff';
    if (!off) {
      ctx.save();
      ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 8;
      drawWord(letters, x0, y0, '#d9dde6');
      ctx.restore();
    }
    drawWord(letters, x0, y0, off ? '#3a3f58' : '#c9ced8');
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
    R(148, 39, 28, 1, off ? '#3a3f58' : '#a9afbd');
  }
  function drawWord(word, x0, y0, color) {
    for (let n = 0; n < word.length; n++) {
      const g = GLYPHS[word[n]];
      for (let j = 0; j < 7; j++) for (let i = 0; i < 5; i++)
        if (g[j][i] === '1') R(x0 + n * 13 + i * 2, y0 + j * 2, 2, 2, color);
    }
  }

  function drawClock(d) {
    const cx = 287, cy = 90;
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

  // low shelf with three doors: About me, Projects, Contact
  function drawShelf() {
    const { x, y } = SHELF;
    // on top: a few books, a trophy, the game controller
    const books = [['#e05a5a', 8], ['#f6d365', 7], ['#2bbecb', 9], ['#8a7bd8', 6], ['#e9edf5', 8]];
    let bx = x + 2;
    for (const [c, bh] of books) { R(bx, y - bh, 3, bh, c); R(bx, y - bh + 2, 3, 1, '#00000033'); bx += 4; }
    R(x + 23, y - 7, 6, 4, '#f2c14e'); R(x + 25, y - 3, 2, 2, '#c9972c'); R(x + 23, y - 1, 6, 1, '#6b4430');
    R(x + 30, y - 4, 7, 4, '#3c4460'); R(x + 31, y - 3, 1, 1, C.teal); R(x + 35, y - 3, 1, 1, C.red);
    // carcass
    R(x, y, 38, 32, C.woodDark); R(x, y, 38, 1, C.woodLight);
    R(x + 1, y + 32, 3, 2, C.woodDeep); R(x + 34, y + 32, 3, 2, C.woodDeep);
    const ring = s.t < s.ringUntil;
    for (let col = 0; col < 3; col++) {
      const cx = x + 2 + col * 12;
      R(cx, y + 2, 10, 13, '#2a1a12'); R(cx, y + 17, 10, 13, '#2a1a12'); R(cx, y + 15, 10, 2, C.wood);
      if (col === 0) { // about: a polaroid of Topz, and a stack of books
        R(cx + 2, y + 4, 7, 9, C.paper); R(cx + 3, y + 5, 5, 5, '#6fa3c7');
        R(cx + 4, y + 6, 3, 2, C.skin); R(cx + 4, y + 5, 3, 1, C.hair); R(cx + 3, y + 8, 5, 2, C.hoodie);
        R(cx + 1, y + 20, 2, 10, '#e05a5a'); R(cx + 3, y + 22, 2, 8, '#2bbecb'); R(cx + 5, y + 19, 2, 11, '#f6d365'); R(cx + 7, y + 23, 2, 7, '#4caf6a');
      } else if (col === 1) { // projects: binders and folders
        R(cx + 1, y + 5, 2, 10, '#2bbecb'); R(cx + 4, y + 4, 2, 11, '#8a7bd8'); R(cx + 7, y + 6, 2, 9, '#e48a5b');
        R(cx + 2, y + 8, 1, 2, '#ffffff'); R(cx + 5, y + 7, 1, 2, '#ffffff'); R(cx + 8, y + 9, 1, 2, '#ffffff');
        R(cx + 1, y + 28, 8, 2, '#f6d365'); R(cx + 1, y + 26, 8, 2, '#4caf6a'); R(cx + 2, y + 24, 7, 2, '#f6d365'); R(cx + 1, y + 23, 3, 1, '#c9a227');
      } else { // contact: the rotary phone, and a pile of letters
        const jx = ring ? (Math.floor(s.t * 30) % 2 ? 1 : 0) : 0;
        R(cx + 1 + jx, y + 10, 8, 5, '#eef1f6'); R(cx + 1 + jx, y + 14, 8, 1, '#8d93a3');
        R(cx + 3 + jx, y + 11, 3, 3, '#ffffff'); R(cx + 4 + jx, y + 12, 1, 1, '#b7bdc9');
        R(cx + jx, y + (ring ? 7 : 8), 10, 2, '#8d93a3');
        R(cx + 1, y + 24, 8, 5, '#f4f6fb'); R(cx + 1, y + 24, 8, 1, '#c9ced8'); R(cx + 2, y + 25, 2, 1, '#9aa3b5'); R(cx + 4, y + 26, 2, 1, '#9aa3b5'); R(cx + 7, y + 25, 1, 2, C.red);
        R(cx + 2, y + 22, 7, 2, '#efe3c2');
      }
      // the door swings open towards its hinge on the left
      const dw = Math.round(10 * (1 - s.doors[col]));
      const rattle = col === 2 && ring && dw > 8 ? (Math.floor(s.t * 24) % 2) : 0;
      if (dw > 1) {
        const dx = cx + rattle;
        R(dx, y + 2, dw, 28, C.wood); R(dx, y + 2, dw, 1, C.woodLight);
        R(dx + 1, y + 4, dw - 2, 11, C.woodLight); R(dx + 2, y + 5, Math.max(0, dw - 4), 9, C.wood);
        R(dx + 1, y + 17, dw - 2, 11, C.woodLight); R(dx + 2, y + 18, Math.max(0, dw - 4), 9, C.wood);
        R(dx + dw - 2, y + 15, 1, 2, '#f2c14e'); // knob
        if (dw >= 9) { // a little picture on each door says what's behind it
          const ix = dx + 2, iy = y + 7;
          if (col === 0) { R(ix + 2, iy, 2, 2, '#f4f6fb'); R(ix + 1, iy + 2, 4, 3, '#f4f6fb'); }
          else if (col === 1) { R(ix, iy + 1, 6, 4, '#f6d365'); R(ix, iy, 3, 1, '#f6d365'); }
          else { R(ix, iy, 6, 4, '#f4f6fb'); R(ix + 1, iy + 1, 1, 1, '#9aa3b5'); R(ix + 2, iy + 2, 2, 1, '#9aa3b5'); R(ix + 4, iy + 1, 1, 1, '#9aa3b5'); }
        }
      } else R(cx, y + 2, 1, 28, C.woodLight);
    }
    if (ring) { // ring ring
      const k = Math.floor(s.t * 6) % 2;
      R(x + 39 + k, y + 6, 2, 1, '#ffffff'); R(x + 40 + k, y + 9, 2, 1, '#ffffff');
    }
  }
  function openShelf(col) {
    s.doorsTarget[col] = 1;
    s.doorsCloseAt[col] = s.t + 2.6;
    if (col === 2) s.ringUntil = 0;
    setTimeout(() => hooks.open?.(SHELF_COLS[col]), 380);
  }

  // Mochi's bed (back half; the front lip is drawn after the dog)
  function drawBedBack() {
    R(64, 150, 34, 4, '#8d93a3'); R(66, 152, 30, 6, '#b7bdc9'); R(70, 154, 22, 3, '#dfe3ea');
  }
  function drawBedFront() {
    R(62, 157, 38, 5, '#8d93a3'); R(62, 157, 38, 1, '#eef1f6'); R(64, 162, 34, 1, '#4a5068');
  }

  function drawMonitors(dl) {
    const scroll = Math.floor(s.t * 3);
    // wide monitor: code editor with a terminal on the side
    let x = 88, y = 76, w = 88, h = 28;
    R(x, y, w, h, '#0b0d18'); R(x + 2, y + 2, w - 4, h - 5, '#13172a');
    R(x + 2, y + 2, w - 4, 2, '#1b2038'); R(x + 9, y + 2, 14, 2, '#2a3150'); R(x + 24, y + 2, 12, 2, '#20253e');
    R(x + 2, y + 4, 6, h - 7, '#0f1222');
    const cols = ['#7ff3ff', '#f6d365', '#ff8fab', '#9be7a0', '#c3a6ff', '#9aa3b5'];
    for (let i = 0; i < 6; i++) {
      const n = i + scroll;
      const ind = (n * 7) % 4 * 2;
      const len = 8 + ((n * 13) % 24);
      R(x + 3, y + 6 + i * 3, 3, 1, '#3a4160');
      R(x + 10 + ind, y + 6 + i * 3, Math.min(len, 44 - ind), 1, cols[(n * 5) % cols.length]);
    }
    if (Math.floor(s.t * 2) % 2) R(x + 10, y + 21, 1, 2, '#ffffff');
    // terminal pane
    const tx = x + w - 30;
    R(tx, y + 4, 28, h - 7, '#090b14'); R(tx, y + 4, 28, 1, '#20253e');
    for (let i = 0; i < 5; i++) {
      const n = i + Math.floor(s.t * 1.2);
      R(tx + 2, y + 7 + i * 3, 2, 1, '#5fe08a');
      R(tx + 5, y + 7 + i * 3, 6 + ((n * 11) % 15), 1, i === 4 ? '#5fe08a' : '#7c8597');
    }
    R(x + w / 2 - 2, y + h, 4, 6, '#0b0d18'); R(x + w / 2 - 9, y + h + 4, 18, 2, '#1a1d2b');
    // portrait monitor: a website, scrolling
    x = 182; y = 66; w = 30; h = 38;
    R(x, y, w, h, '#0b0d18'); R(x + 2, y + 2, w - 4, h - 5, '#f4f6fb');
    ctx.save(); ctx.beginPath(); ctx.rect(x + 2, y + 5, w - 4, h - 8); ctx.clip();
    const off = reduced ? 0 : Math.floor((s.t * 4) % 46);
    const py = y + 6 - off;
    for (const k of [0, 46]) {
      const by = py + k;
      R(x + 4, by + 1, 14, 2, '#2b3245'); R(x + 4, by + 4, 20, 1, '#9aa3b5'); R(x + 4, by + 6, 16, 1, '#9aa3b5');
      R(x + 4, by + 9, 9, 3, C.teal);
      R(x + 4, by + 14, 22, 10, '#8a7bd8'); R(x + 6, by + 19, 10, 5, '#c3a6ff');
      R(x + 4, by + 27, 10, 8, '#e9edf5'); R(x + 16, by + 27, 10, 8, '#e9edf5');
      R(x + 5, by + 28, 8, 3, '#f6d365'); R(x + 17, by + 28, 8, 3, '#ff8fab');
      R(x + 4, by + 38, 22, 5, '#2b3245');
    }
    ctx.restore();
    R(x + 2, y + 2, w - 4, 3, C.teal); // sticky nav bar
    const cx = x + 6 + Math.round((Math.sin(s.t * 0.7) + 1) * 8), cy = y + 10 + Math.round((Math.sin(s.t * 1.1) + 1) * 10);
    R(cx, cy, 1, 3, '#15121c'); R(cx + 1, cy + 1, 1, 1, '#15121c');
    R(x + w / 2 - 2, y + h, 4, 6, '#0b0d18'); R(x + w / 2 - 7, y + h + 4, 14, 2, '#1a1d2b');
  }

  const RGB = ['#2bbecb', '#ff6f91', '#9be7a0', '#c3a6ff', '#f6d365'];
  function drawPC() {
    const x = 220, y = 72;
    R(x, y, 20, 38, '#0b0d18'); R(x + 1, y + 1, 18, 36, '#14172a');
    R(x + 3, y + 3, 12, 32, '#0d1020');
    const col = s.rgbMode === RGB.length ? RGB[Math.floor(s.t * 2) % RGB.length] : RGB[s.rgbMode];
    const spin = Math.floor(s.t * 10) % 4;
    for (const fy of [y + 7, y + 20]) {
      R(x + 5, fy, 8, 1, col); R(x + 5, fy + 7, 8, 1, col); R(x + 4, fy + 1, 1, 6, col); R(x + 13, fy + 1, 1, 6, col);
      const blade = [[0, 0], [1, 0], [1, 1], [0, 1]][spin];
      R(x + 7 + blade[0] * 2, fy + 2 + blade[1] * 2, 2, 2, '#3a4160');
      R(x + 8, fy + 3, 2, 2, col);
    }
    R(x + 16, y + 4, 1, 30, col);
    R(x + 16, y + 34, 2, 1, '#7ff3ff');
    R(x + 2, y + 38, 3, 2, '#0b0d18'); R(x + 15, y + 38, 3, 2, '#0b0d18');
    return col;
  }

  // ---------- stress ball alien, beside the mug ----------
  const ALIEN_CX = 81, ALIEN_FLOOR = 110;
  function squish() {
    // fast squash, a hold, then a wobbly bounce back
    const k = s.t - s.squeeze.at;
    if (k < 0 || k > 1.1) return { press: 0, wob: 0 };
    if (k < 0.08) return { press: k / 0.08, wob: 0 };
    if (k < 0.45) return { press: 1, wob: 0 };
    const r = (k - 0.45) / 0.65;
    return { press: Math.max(0, (1 - r) * Math.cos(r * 9)), wob: (1 - r) };
  }
  function drawAlien() {
    const { press, wob } = squish();
    const p = Math.max(-0.4, Math.min(1, press));
    const bw = 9 + Math.round(4 * p), bh = 8 - Math.round(3.5 * p);
    const cx = ALIEN_CX, bx = cx - Math.floor(bw / 2), by = ALIEN_FLOOR - bh;
    const g = '#86e07f', gL = '#c4f5b8', gD = '#4fae55';
    // antennae, wobbling after a squeeze
    const sway = reduced ? 0 : Math.round(Math.sin(s.t * 26) * 1.5 * wob);
    if (p < 0.8) {
      R(cx - 3 + sway, by - 3, 1, 3, gD); R(cx + 2 - sway, by - 3, 1, 3, gD);
      R(cx - 4 + sway, by - 5, 2, 2, '#ff8fab'); R(cx + 2 - sway, by - 5, 2, 2, '#ff8fab');
    } else { // squashed flat, antennae splay out sideways
      R(cx - 6, by - 1, 2, 1, gD); R(cx + 5, by - 1, 2, 1, gD);
      R(cx - 8, by - 2, 2, 2, '#ff8fab'); R(cx + 7, by - 2, 2, 2, '#ff8fab');
    }
    // squishy body
    R(bx + 1, by, bw - 2, bh, g); R(bx, by + 1, bw, Math.max(1, bh - 2), g);
    R(bx + 2, by + 1, 2, 1, gL); R(bx + 1, by + bh - 1, bw - 2, 1, gD);
    if (p > 0.6) { // bulging eyes, open mouth, stress lines
      R(cx - 4, by - 1, 3, 3, '#f4f6fb'); R(cx + 1, by - 1, 3, 3, '#f4f6fb');
      R(cx - 3, by, 1, 1, '#15121c'); R(cx + 2, by, 1, 1, '#15121c');
      R(cx - 1, by + bh - 3, 2, 2, '#3a1e2a');
      R(bx - 3, by + 1, 2, 1, '#f4f6fb'); R(bx - 3, by + 3, 2, 1, '#f4f6fb');
      R(bx + bw + 1, by + 1, 2, 1, '#f4f6fb'); R(bx + bw + 1, by + 3, 2, 1, '#f4f6fb');
    } else { // calm: big glossy eyes, little smile
      const blink = Math.floor(s.t * 10) % 47 === 0;
      if (blink) { R(cx - 3, by + 3, 2, 1, '#15121c'); R(cx + 1, by + 3, 2, 1, '#15121c'); }
      else {
        R(cx - 3, by + 2, 2, 2, '#15121c'); R(cx + 1, by + 2, 2, 2, '#15121c');
        R(cx - 3, by + 2, 1, 1, '#ffffff'); R(cx + 1, by + 2, 1, 1, '#ffffff');
      }
      R(cx - 1, by + bh - 2, 2, 1, gD);
      R(bx + 1, by + 4, 1, 1, '#ff8fab'); R(bx + bw - 2, by + 4, 1, 1, '#ff8fab'); // blush
    }
  }
  const SQUEEZE_TOPZ = [
    'Client says "make it pop". *squeeze*',
    'Merge conflict. *squeeeeze*',
    'It works on my machine… *squeeze*',
    'Elementor update broke the layout. *SQUEEZE*',
    'One more revision, they said. *squeeze*',
    'Deep breath… *squeeze*',
    '"Quick change" at 5 PM on a Friday. *squeeze*',
  ];
  const SQUEEZE_ALIEN = [
    'Bleep! Too tight!', 'Blorp…', 'I come in peace! PEACE!', 'Squeeeak!',
    'Take me to your… stress.', 'My antennae!!', 'Zorp! Okay, okay, breathe!', 'I felt that in my UFO.',
  ];
  const SQUEEZE_MILESTONES = {
    10: "10 squeezes. That deadline must be close.",
    25: '25 squeezes?! The alien wants hazard pay.',
    50: '50 squeezes. Okay, go drink some water. 💧',
    100: '100 squeezes. Achievement unlocked: Stress Master. 👽',
  };
  let squeezeIdx = 0, alienReply;
  function squeezeAlien() {
    const q = s.squeeze;
    q.at = s.t; q.count++;
    clearTimeout(alienReply);
    hooks.say?.(SQUEEZE_MILESTONES[q.count] || SQUEEZE_TOPZ[squeezeIdx++ % SQUEEZE_TOPZ.length], ALIEN_CX, 92);
    alienReply = setTimeout(() => hooks.say?.(SQUEEZE_ALIEN[Math.floor(Math.random() * SQUEEZE_ALIEN.length)], ALIEN_CX, 92), 1300);
  }

  function drawDesk(dl) {
    // one long desk across the room
    R(30, 110, 260, 4, C.woodLight); R(30, 110, 260, 1, '#c48a60');
    R(30, 114, 260, 6, C.wood); R(30, 119, 260, 1, C.woodDark);
    R(34, 120, 6, 18, C.woodDark); R(280, 120, 6, 18, C.woodDark);
    R(40, 120, 2, 15, C.woodDeep); R(278, 120, 2, 15, C.woodDeep);
    drawMonitors(dl);
    s.pcColor = drawPC();
    // keyboard
    R(116, 107, 34, 3, '#2b2f40'); for (let k = 118; k < 148; k += 3) R(k, 108, 2, 1, '#4a5070');
    // water bottle, between the monitors (unless Topz is drinking from it)
    if (s.t >= s.drinkUntil) {
      R(177, 100, 4, 10, '#cfe4ea'); R(178, 103, 2, 6, '#9fc9d3'); R(177, 98, 4, 2, '#8a90a0'); R(177, 100, 1, 10, '#eef7fa');
    }
    // desk lamp on the left, head tipped over the mug
    R(46, 107, 12, 3, '#3a3f58'); R(51, 86, 2, 21, '#3a3f58');
    R(51, 84, 10, 2, '#3a3f58'); R(58, 80, 12, 5, C.teal); R(59, 85, 10, 1, '#fff6c8');
    drawAlien();
    // mug with steam
    R(64, 102, 8, 8, C.white); R(72, 104, 2, 4, C.white);
    R(65, 104, 6, 1, '#2b3245'); R(65, 106, 4, 1, C.teal); R(65, 108, 6, 1, '#2b3245');
    if (!reduced) for (let i = 0; i < 3; i++) {
      const k = (s.t * 6 + i * 3) % 9;
      R(66 + (Math.floor(k) % 2) + i, 100 - k, 1, 1, '#ffffff55');
    }
  }

  // Mark, seen from behind, in his chair
  const HEAD_BACK = [
    '....hhhhhhhh....',
    '..hhhhhhhhhhhh..',
    '.hhhhHhhhhhHhhh.',
    '.hhhhhhhHhhhhhh.',
    '.hhhhhhhhhhhhhh.',
    '.hhhHhhhhhhhhhh.',
    '.hhhhhhhhhhHhhh.',
    '.shhhhhhhhhhhhs.',
    '.Shhhhhhhhhhhhs.',
    '..hhhhhhhhhhhh..',
    '..hhhhhhhhhhhh..',
    '...hhhhhhhhhh...',
    '....hhhhhhhh....',
    '.....ssssss.....',
    '.....SSSSSS.....',
    '.....SSSSSS.....',
  ];
  const headBackPal = { P: C.teal, p: C.tealDark, h: C.hair, H: C.hairLight, s: C.skin, S: C.skinShade };

  // the chair swivels gently; Mark and the chair back ride along, the wheels stay put
  function swivel() {
    if (reduced) return 0;
    return Math.round(Math.sin(s.t * 0.9) * 1.6 + Math.sin(s.t * 0.37) * 0.8);
  }

  function drawMark() {
    const drinking = s.t < s.drinkUntil;
    const stretching = !drinking && s.t < s.stretchUntil;
    const tap = !stretching && !drinking && Math.floor(s.t * 6) % 2;
    const look = drinking ? 0 : s.t % 14 > 9 ? 1 : 0; // glances at the right monitor now and then
    const sw = swivel();
    // Topz is drawn in his old spot and shifted: in front of the desk, on his rolling chair
    const roll = Math.round(s.chair.x);
    ctx.save();
    ctx.translate(-30 + roll, 16);

    // legs and sneakers, under the seat
    const tapFoot = s.music && Math.floor(s.t * 4) % 2 ? 1 : 0;
    R(157, 132, 6, 8, '#2c3a5a'); R(157, 132, 1, 8, '#1f2a44');
    R(177, 132, 6, 8, '#2c3a5a'); R(182, 132, 1, 8, '#1f2a44');
    R(156, 139, 8, 3, '#e9edf5'); R(156, 141, 8, 1, '#9aa1b0'); R(157, 139, 3, 1, '#ffffff');
    R(176, 139 - tapFoot, 8, 3, '#e9edf5'); R(176, 141 - tapFoot, 8, 1, '#9aa1b0'); R(177, 139 - tapFoot, 3, 1, '#ffffff');
    // star base and gas lift don't turn; the wheels spin while the chair rolls
    R(168, 132, 4, 12, '#2b2f40');
    R(154, 144, 32, 2, '#2b2f40');
    const spin = Math.abs(s.chair.tx - s.chair.x) > 0.3 ? Math.floor(s.t * 12) % 2 : 0;
    for (const wx of [152, 168, 185]) { R(wx, 146, 3, 3, '#0b0c14'); R(wx + spin, 147, 1, 1, '#3a3f58'); }

    ctx.save();
    ctx.translate(sw, 0);
    // back and shoulders: sloped, with arms reaching forward to the keyboard
    const by = tap ? 1 : 0;
    R(160, 85 + by, 20, 2, C.hoodie); R(155, 87 + by, 30, 2, C.hoodie); R(151, 89 + by, 38, 22, C.hoodie);
    R(160, 85 + by, 20, 1, C.hoodieLight); R(155, 87 + by, 5, 1, C.hoodieLight); R(180, 87 + by, 5, 1, C.hoodieLight);
    R(151, 89 + by, 2, 22, C.hoodieDark); R(187, 89 + by, 2, 22, C.hoodieDark);
    R(169, 92 + by, 2, 16, C.hoodieDark); // back seam
    if (stretching) {
      R(149, 58, 6, 33, C.hoodie); R(185, 58, 6, 33, C.hoodie);
      R(149, 58, 1, 33, C.hoodieDark); R(190, 58, 1, 33, C.hoodieDark);
      R(150, 53, 5, 5, C.skin); R(185, 53, 5, 5, C.skin);
    } else {
      R(146, 94 - tap, 6, 14, C.hoodie); R(146, 94 - tap, 1, 14, C.hoodieDark); R(147, 107 - tap, 5, 2, C.hoodieDark);
      if (!drinking) { R(188, 94 + tap, 6, 14, C.hoodie); R(193, 94 + tap, 1, 14, C.hoodieDark); R(188, 107 + tap, 5, 2, C.hoodieDark); }
    }
    // hood bunched at the neck
    R(161, 80, 18, 7, C.hood); R(163, 79, 14, 2, C.hoodieDark); R(164, 86, 12, 2, C.hood);
    const nod = s.music && !drinking && Math.floor(s.t * 4) % 2 ? 1 : 0;
    const tilt = drinking ? -1 : 0; // head tips back to drink
    // a soft outline so the dark hair reads against the dark monitor behind it
    const hx = 162 + look, hy = 64 + nod + tilt;
    const rim = { h: '#2c3552', H: '#2c3552', s: '#2c3552', S: '#2c3552' };
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1]]) sprite(HEAD_BACK.slice(0, 13), rim, hx + ox, hy + oy);
    sprite(HEAD_BACK, headBackPal, hx, hy);
    R(166 + look, 64 + nod + tilt, 8, 1, '#3a3456');
    if (drinking) drawSip();

    // chair back (low enough to see Mark's shoulders over it)
    R(156, 96, 28, 32, C.chair); R(158, 94, 24, 3, C.chair);
    R(159, 98, 2, 26, '#2b2f40'); R(179, 98, 2, 26, '#2b2f40');
    R(166, 104, 8, 6, C.chairLight);
    R(156, 126, 28, 4, '#0b0c14');
    R(150, 128, 40, 4, C.chair);
    drawHat();
    ctx.restore();
    ctx.restore();
    Object.assign(box('mark'), { x: 116 + roll, y: 78 });
    Object.assign(box('hat'), { x: 127 + roll, y: 118 });
  }

  // right arm up, bottle tipped to his mouth
  function drawSip() {
    const k = (s.t - s.drinkStart) / (s.drinkUntil - s.drinkStart);
    const up = k < 0.15 ? k / 0.15 : k > 0.85 ? (1 - k) / 0.15 : 1; // raise, hold, lower
    const ay = Math.round(94 - up * 26);
    R(186, ay, 6, 108 - ay, C.hoodie); R(191, ay, 1, 108 - ay, C.hoodieDark);
    R(185, ay - 3, 5, 4, C.skin);
    // the bottle, tilting further as he drinks
    const tip = up > 0.9 ? 2 : 1;
    const bx = 181 - tip, by2 = ay - 9;
    R(bx, by2, 4, 9, '#cfe4ea'); R(bx + 1, by2 + 3, 2, 5, '#9fc9d3');
    R(bx - tip, by2 - 2, 4, 2, '#8a90a0');
    if (up > 0.9 && Math.floor(s.t * 6) % 2) R(bx - tip - 1, by2 + 1, 1, 1, '#ffffff');
  }

  const DRINK_LINES = [
    'Water break. Recharging… 💧',
    '+10 HP.',
    'Hydrate, then debug.',
    'Ahh. Back to the bugs.',
    'Reminder: drink some water too!',
  ];
  let drinkIdx = 0;
  function startDrink() {
    if (s.t < s.drinkUntil) return;
    s.drinkStart = s.t;
    s.drinkUntil = s.t + 3.2;
    s.nextDrink = s.t + rand(40, 70);
    hooks.say?.(DRINK_LINES[drinkIdx++ % DRINK_LINES.length], 140 + s.chair.x, 70);
  }


  // ---------- ceiling light bulb ----------
  const BULB_X = 94, BULB_Y = 15; // centre of the glass
  function drawBulb() {
    const g = s.bulbGlow;
    // cord from the ceiling, a little ceiling rose, and the socket
    R(BULB_X - 3, 0, 7, 2, '#c9ced8'); R(BULB_X - 3, 2, 7, 1, '#9aa1b0');
    R(BULB_X, 3, 1, 7, '#2b3245');
    R(BULB_X - 2, 10, 5, 3, '#6b7183'); R(BULB_X - 2, 10, 5, 1, '#9aa1b0');
    // glass: dull grey when off, warm white when on
    const glass = g > 0.5 ? '#fff3c4' : '#c9ced8';
    const edge = g > 0.5 ? '#f6d365' : '#8d93a3';
    R(BULB_X - 2, 13, 5, 1, edge);
    R(BULB_X - 3, 14, 7, 5, edge); R(BULB_X - 2, 14, 5, 5, glass);
    R(BULB_X - 2, 19, 5, 1, edge); R(BULB_X - 1, 20, 3, 1, edge);
    R(BULB_X - 1, 15, 1, 2, g > 0.5 ? '#ffffff' : '#e6e9f0'); // shine
    if (g < 0.5) R(BULB_X, 16, 1, 2, '#9aa1b0'); // filament, visible when off
  }
  function drawBulbGlow() {
    const g = s.bulbGlow;
    if (g < 0.01) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // stepped, pixel-style rings of warm light around the bulb
    // (the canvas is tiny and scaled up, so these circles come out pixelated)
    for (let i = 7; i >= 1; i--) {
      ctx.fillStyle = `rgba(120,95,40,${0.06 * g})`;
      ctx.beginPath(); ctx.arc(BULB_X + 0.5, BULB_Y + 2, i * 11, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    // a hot halo hugging the glass, drawn on top so it pops
    ctx.save();
    ctx.shadowColor = '#ffe9a0'; ctx.shadowBlur = 10 * g;
    R(BULB_X - 2, 14, 5, 5, `rgba(255,243,196,${g})`);
    ctx.restore();
  }

  function drawLights(dl) {
    // the room darkens with the outside light; the lamp, neon, screens and PC push back
    // the ceiling bulb, when on, lifts most of that darkness
    const lit = 1 - 0.7 * s.bulbGlow;
    const dark = (0.5 * (1 - dl) + (s.blinds > 0.5 ? 0.08 : 0)) * lit;
    const gloom = (s.weather === 'rain' || s.weather === 'storm' ? 0.1 : s.weather === 'cloudy' || s.weather === 'fog' ? 0.05 : 0) * lit;
    if (dark + gloom > 0.01) { ctx.fillStyle = `rgba(6,8,24,${dark + gloom})`; ctx.fillRect(0, 0, W, H); }
    // whole room picks up a faint warm tint from the bulb
    if (s.bulbGlow > 0.01) { ctx.fillStyle = `rgba(255,214,140,${0.06 * s.bulbGlow})`; ctx.fillRect(0, 0, W, H); }
    if (s.t < s.flashUntil) { ctx.fillStyle = 'rgba(220,230,255,0.18)'; ctx.fillRect(0, 0, W, H); }
    if (dl < 0.8) {
      const a = 1 - dl;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      // desk lamp pool
      ctx.fillStyle = `rgba(110,80,25,${0.38 * a})`;
      ctx.beginPath(); ctx.moveTo(59, 86); ctx.lineTo(69, 86); ctx.lineTo(82, 110); ctx.lineTo(48, 110); ctx.closePath(); ctx.fill();
      // soft, stepped glow around each screen and the PC
      const glow = (x, y, w, h, rgb, k) => {
        for (let i = 3; i >= 1; i--) {
          ctx.fillStyle = `rgba(${rgb},${k * a / i})`;
          ctx.fillRect(x - i * 2, y - i * 2, w + i * 4, h + i * 4);
        }
      };
      glow(88, 76, 88, 26, '30,90,110', 0.12);
      glow(182, 66, 30, 36, '60,90,110', 0.12);
      const pc = s.pcColor || C.teal;
      const n = parseInt(pc.slice(1), 16);
      glow(220, 72, 20, 38, `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`, 0.07);
      ctx.fillStyle = `rgba(60,150,160,${0.4 * a})`;
      ctx.fillRect(136 + Math.round(s.chair.x), 80, 8, 1);
      ctx.restore();
    }
  }

  // three original display katanas on a wall rack
  const KATANAS = [
    { wrap: '#2bbecb', dark: '#17707a', saya: '#1d2340', guard: '#c9a227' },
    { wrap: '#e48a5b', dark: '#9c5232', saya: '#3a2418', guard: '#9aa3b5' },
    { wrap: '#4caf6a', dark: '#2f7a48', saya: '#14161f', guard: '#8a6a3a' },
  ];
  const KX = 132, KY = 40; // rack under the neon sign
  function drawKatanas() {
    for (const bx of [KX + 6, KX + 48]) { R(bx, KY, 5, 28, C.woodDark); R(bx, KY, 5, 1, C.woodLight); }
    KATANAS.forEach((k, i) => {
      const y = KY + 4 + i * 8;
      // handle with a criss-cross wrap
      R(KX, y, 14, 3, k.dark);
      for (let x = KX; x < KX + 14; x += 3) R(x, y + 1, 2, 1, k.wrap);
      R(KX - 1, y, 1, 3, k.guard);
      // guard, collar, scabbard, end cap
      R(KX + 14, y - 1, 2, 5, k.guard);
      R(KX + 16, y, 2, 3, k.guard);
      R(KX + 18, y, 40, 3, k.saya); R(KX + 18, y, 40, 1, '#ffffff22');
      R(KX + 58, y, 2, 3, k.guard);
      // rack pegs in front
      R(KX + 7, y + 3, 3, 1, C.woodLight); R(KX + 49, y + 3, 3, 1, C.woodLight);
    });
  }

  // an original jukebox: arch top, spinning record, equaliser grille
  function drawJukebox() {
    const x = 274, y = 122, playing = s.music;
    const hue = playing ? RGB[Math.floor(s.t * 3) % RGB.length] : C.tealDark;
    R(x + 5, y, 14, 1, C.woodDark); R(x + 3, y + 1, 18, 2, C.woodDark); R(x + 1, y + 3, 22, 2, C.woodDark);
    R(x, y + 5, 24, 33, C.woodDark);
    R(x + 6, y + 1, 12, 1, C.wood); R(x + 4, y + 2, 16, 2, C.wood); R(x + 2, y + 4, 20, 2, C.wood); R(x + 1, y + 6, 22, 31, C.wood);
    // glowing arch tube
    R(x + 7, y + 3, 10, 1, hue); R(x + 5, y + 4, 2, 1, hue); R(x + 17, y + 4, 2, 1, hue);
    R(x + 4, y + 5, 1, 24, hue); R(x + 19, y + 5, 1, 24, hue);
    // record window
    R(x + 6, y + 6, 12, 10, '#14101c');
    R(x + 8, y + 7, 8, 8, '#0b0b10'); R(x + 7, y + 8, 10, 6, '#0b0b10');
    R(x + 11, y + 10, 2, 2, hue);
    const ang = playing ? Math.floor(s.t * 8) % 4 : 0;
    const shine = [[9, 8], [14, 9], [14, 13], [9, 13]][ang];
    R(x + shine[0], y + shine[1], 1, 1, '#4a4a5a');
    // selection buttons
    for (let i = 0; i < 4; i++) R(x + 6 + i * 3, y + 18, 2, 2, i === Math.floor(s.t) % 4 && playing ? '#fff3b0' : '#d3b38a');
    // equaliser grille
    R(x + 6, y + 22, 12, 12, '#2a1a12');
    for (let i = 0; i < 4; i++) {
      const lvl = playing ? 3 + Math.floor((Math.sin(s.t * (5 + i * 1.7) + i) + 1) * 4) : 2;
      R(x + 7 + i * 3, y + 33 - lvl, 2, lvl, playing ? hue : '#4a3226');
    }
    R(x + 2, y + 37, 4, 2, C.woodDeep); R(x + 18, y + 37, 4, 2, C.woodDeep);
    // a tiny plant living on top
    R(x + 9, y - 5, 6, 5, C.pot); R(x + 11, y - 9, 2, 4, C.leafDark); R(x + 9, y - 8, 2, 2, C.leaf); R(x + 13, y - 9, 2, 2, C.leaf);
  }

  function drawNotes(dt) {
    if (s.music && !reduced && Math.random() < dt * 1.6)
      s.notes.push({ x: 281 + rand(0, 10), y: 124, life: 2.4, c: RGB[Math.floor(rand(0, RGB.length))] });
    s.notes = s.notes.filter((n) => (n.life -= dt) > 0);
    for (const n of s.notes) {
      n.y -= dt * 9; n.x += Math.sin(n.life * 4) * dt * 6;
      const x = Math.round(n.x), y = Math.round(n.y);
      R(x, y + 3, 2, 2, n.c); R(x + 1, y, 1, 3, n.c); R(x + 2, y, 1, 1, n.c);
    }
  }

  // a straw hat hanging off the back of the chair by its chin cord
  function drawHat() {
    const sway = reduced ? 0 : Math.round(Math.sin(s.t * 1.7) * 0.6);
    const x = 159 + sway, y = 104;
    R(169, 98, 1, 6, '#c9a456'); R(171, 98, 1, 6, '#c9a456');
    R(x + 7, y, 8, 1, '#efd28a');
    R(x + 6, y + 1, 10, 4, '#e2bf6e');
    R(x + 6, y + 4, 10, 2, '#3a5a8c'); // navy band
    R(x, y + 6, 22, 2, '#e8c77a'); R(x + 1, y + 8, 20, 1, '#c9a456');
    for (let i = 0; i < 5; i++) R(x + 2 + i * 4, y + 6, 2, 1, '#d4b062');
    R(x + 8, y + 1, 2, 1, '#f6e2a8');
  }

  // ---------- aircon ----------
  function drawAircon() {
    const x = 134, y = 4, w = 56;
    R(x, y, w, 14, '#eef1f6'); R(x, y, w, 1, '#ffffff'); R(x, y + 13, w, 1, '#9aa1b0');
    R(x + 2, y + 10, w - 4, 2, '#c9ced8');
    const flap = s.ac && !reduced ? (Math.floor(s.t * 0.8) % 2) : 0;
    R(x + 3, y + 11 + flap, w - 6, 1, '#8d93a3');
    R(x + w - 6, y + 3, 2, 2, s.ac ? '#5fe08a' : '#6b7183');
    R(x + 4, y + 3, 12, 1, '#d4d8e0'); R(x + 4, y + 5, 8, 1, '#d4d8e0');
    if (s.ac && !reduced) {
      for (let i = 0; i < 7; i++) {
        const k = (s.t * 6 + i * 4) % 14;
        const ax = x + 5 + i * 7 + Math.round(Math.sin(s.t * 2 + i) * 1);
        R(ax, y + 15 + k, 3, 1, `rgba(220,235,255,${0.35 * (1 - k / 14)})`);
      }
    }
  }

  // ---------- critters ----------
  const SAY = {
    roach: ['Oh, you got me!', "Okay okay, I'm leaving!", 'I pay rent here too, you know.', "Don't tell Mochi!", 'Just passing through!'],
    mouse: ['Squeak! I was never here.', 'I only came for the crumbs.', "Mochi can't catch me!", '*squeak squeak*'],
    frog: ['Ribbit.', 'Ribbit! (that means hire Topz)', "I'm not a prince, sorry.", 'Is it raining yet?', '*blinks slowly*'],
    frogRain: ['Rain! Best. Day. Ever.', 'Ribbit ribbit! It\'s raining!', 'Perfect frog weather.'],
    spider: ['Just hanging out.', 'I fix bugs too. The flying kind.', 'Web developer, literally.', "Don't mind me, I'm debugging the ceiling."],
    lizard: ['Tik-tik-tik!', 'Not a tuko. Butiki, thank you.', "I eat the mosquitoes. You're welcome.", 'Wall-crawling: the original responsive layout.'],
  };
  const sayIdx = {};
  const sayLine = (k) => { sayIdx[k] = (sayIdx[k] || 0) + 1; return SAY[k][sayIdx[k] % SAY[k].length]; };

  function updateCritters(dt) {
    // cockroach: dashes across the floor, stops, dashes again
    const r = s.roach;
    if (r.state === 'gone') {
      if (s.t > r.until) { r.x = Math.random() < 0.5 ? -6 : W + 6; r.y = rand(132, 176); r.state = 'run'; r.flee = false; r.tx = rand(30, 290); r.ty = rand(132, 176); }
    } else if (r.state === 'wait') {
      if (s.t > r.until) { r.state = 'run'; r.tx = rand(10, 310); r.ty = rand(132, 176); }
    } else {
      const sp = r.flee ? 110 : 38;
      const dx = r.tx - r.x, dy = r.ty - r.y, dist = Math.hypot(dx, dy);
      if (dist < sp * dt) {
        r.x = r.tx; r.y = r.ty;
        if (r.flee) { r.state = 'gone'; r.until = s.t + rand(20, 45); }
        else { r.state = 'wait'; r.until = s.t + rand(0.4, 3.5); }
      } else { r.x += dx / dist * sp * dt; r.y += dy / dist * sp * dt; r.dir = dx > 0 ? 1 : -1; }
    }
    // mouse: lives in the hole by the cabinet
    const m = s.mouse;
    const msp = m.fast ? 70 : 40;
    if (m.state === 'home' && s.t > m.until) { m.state = 'peek'; m.until = s.t + 1.6; m.x = 82; }
    else if (m.state === 'peek' && s.t > m.until) {
      if (Math.random() < 0.65) { m.state = 'run'; m.tx = rand(90, 118); m.dir = 1; m.fast = false; }
      else { m.state = 'home'; m.until = s.t + rand(8, 18); }
    } else if (m.state === 'run' || m.state === 'back') {
      const d = m.tx - m.x;
      if (Math.abs(d) < msp * dt) {
        m.x = m.tx;
        if (m.state === 'back') { m.state = 'home'; m.until = s.t + rand(10, 25); m.fast = false; }
        else { m.state = 'sniff'; m.until = s.t + rand(1, 2.5); }
      } else { m.x += Math.sign(d) * msp * dt; m.dir = Math.sign(d); }
    } else if (m.state === 'sniff' && s.t > m.until) { m.state = 'back'; m.tx = 80; }
    // frog: hops around the rug, more when it rains
    const f = s.frog;
    if (f.from) {
      const k = (s.t - f.hopAt) / 0.5;
      if (k >= 1) { f.x = f.to.x; f.y = f.to.y; f.from = null; }
    } else if (s.t > f.next) {
      const wet = s.weather === 'rain' || s.weather === 'storm';
      f.from = { x: f.x, y: f.y };
      f.to = { x: Math.max(88, Math.min(188, f.x + rand(-28, 28))), y: rand(166, 172) };
      f.hopAt = s.t;
      f.next = s.t + (wet ? rand(1.5, 4) : rand(4, 9));
    }
    // spider: drops down on its thread, climbs back up
    const sp = s.spider;
    if (sp.state === 'wait' && s.t > sp.until) { sp.state = 'move'; sp.ty = sp.y < 24 ? rand(34, 66) : rand(12, 22); sp.fast = false; }
    else if (sp.state === 'move') {
      const v = (sp.fast ? 60 : 9) * dt, d = sp.ty - sp.y;
      if (Math.abs(d) <= v) { sp.y = sp.ty; sp.state = 'wait'; sp.until = s.t + (sp.fast ? rand(8, 14) : rand(3, 9)); }
      else sp.y += Math.sign(d) * v;
    }
    // butiki: darts along the wall, freezes, darts again
    const z = s.lizard;
    if (z.state === 'freeze' && s.t > z.until) {
      z.state = 'crawl'; z.until = s.t + rand(0.5, 1.4);
      z.tx = Math.max(4, Math.min(310, z.x + rand(-60, 60))); z.ty = Math.max(20, Math.min(116, z.y + rand(-14, 14)));
    } else if (z.state === 'crawl') {
      const dx = z.tx - z.x, dy = z.ty - z.y, dist = Math.hypot(dx, dy), v = (z.fast ? 60 : 22) * dt;
      if (dist < v || s.t > z.until + 2) { z.state = 'freeze'; z.until = s.t + rand(1, 5); z.fast = false; }
      else { z.x += dx / dist * v; z.y += dy / dist * v; if (Math.abs(dx) > 1) z.dir = dx > 0 ? 1 : -1; }
    }
    if (s.weather === 'storm' && s.t > s.nextFlash) { s.flashUntil = s.t + 0.12; s.nextFlash = s.t + rand(5, 14); }
  }

  function drawMouseHole() {
    R(77, 120, 4, 1, '#07070c'); R(76, 121, 6, 3, '#07070c'); R(76, 124, 6, 4, '#07070c');
  }

  function drawLizard() {
    const z = s.lizard, x = Math.round(z.x), y = Math.round(z.y), d = z.dir;
    const step = z.state === 'crawl' && Math.floor(s.t * 10) % 2;
    const c = '#5fbf6a', dk = '#3f8f4a';
    R(x, y, 6, 2, c);
    R(d > 0 ? x + 6 : x - 2, y, 2, 2, '#8be08f');
    R(d > 0 ? x + 7 : x - 2, y, 1, 1, '#2a2533');
    R(d > 0 ? x - 4 : x + 6, y + (step ? 0 : 1), 4, 1, dk);
    R(d > 0 ? x - 6 : x + 10, y + 1, 2, 1, dk);
    R(x + 1, step ? y - 1 : y + 2, 1, 1, dk); R(x + 4, step ? y + 2 : y - 1, 1, 1, dk);
    Object.assign(box('lizard'), { x: x - 5, y: y - 3, w: 18, h: 8 });
  }

  function drawSpider() {
    const sp = s.spider, x = 114, y = Math.round(sp.y);
    R(x + 1, 8, 1, y - 8, '#8d93a388');
    const k = Math.floor(s.t * 3) % 2;
    R(x, y, 3, 3, '#2a2533'); R(x + 1, y + 3, 1, 1, '#2a2533');
    R(x - 2, y + k, 2, 1, '#2a2533'); R(x - 2, y + 2, 2, 1, '#2a2533');
    R(x + 3, y + k, 2, 1, '#2a2533'); R(x + 3, y + 2, 2, 1, '#2a2533');
    R(x, y + 1, 1, 1, '#ffffff'); R(x + 2, y + 1, 1, 1, '#ffffff');
    Object.assign(box('spider'), { x: x - 4, y: y - 3, w: 11, h: 9 });
  }

  // back layer: things further from us than Topz's chair; front layer: closer
  function drawFloorCritters(front) {
    // cockroach
    const r = s.roach;
    if (r.state !== 'gone' && (r.y >= 158) === front) {
      const x = Math.round(r.x), y = Math.round(r.y), d = r.dir;
      const k = r.state === 'run' && Math.floor(s.t * 16) % 2;
      R(x, y, 5, 2, '#6b3a1e'); R(x + 1, y, 2, 1, '#8a4f2c');
      R(d > 0 ? x + 5 : x - 1, y, 1, 2, '#3a1e10');
      R(d > 0 ? x + 6 : x - 2, y - 1, 1, 1, '#3a1e10'); R(d > 0 ? x + 7 : x - 3, y - 2, 1, 1, '#3a1e10');
      for (let i = 0; i < 3; i++) R(x + i * 2, (i + k) % 2 ? y + 2 : y - 1, 1, 1, '#3a1e10');
      Object.assign(box('roach'), { x: x - 4, y: y - 5, w: 14, h: 11, label: 'Cockroach' });
    } else if (r.state === 'gone') box('roach').x = -99;
    if (front) { drawFrog(); return; }
    // mouse (stays by the wall, so always behind the chair)
    const m = s.mouse;
    if (m.state === 'home') box('mouse').x = -99;
    else {
      const y = 125, d = m.state === 'peek' ? 1 : m.dir;
      const x = Math.round(m.state === 'peek' ? 81 : m.x);
      const body = '#9aa1b0';
      if (m.state !== 'peek') {
        R(x, y, 5, 3, body); R(x + 1, y, 3, 1, '#b7bdc9');
        R(d > 0 ? x - 3 : x + 5, y + 2, 3, 1, '#d8a0a8');
        if (Math.floor(s.t * 14) % 2) R(x + 1, y + 3, 1, 1, '#6b7183'); else R(x + 3, y + 3, 1, 1, '#6b7183');
      }
      const hx = d > 0 ? x + 5 : x - 2;
      R(hx, y + 1, 2, 2, body); R(d > 0 ? hx + 2 : hx - 1, y + 2, 1, 1, '#d8a0a8');
      R(d > 0 ? hx : hx + 1, y, 1, 1, '#e8b4bc'); R(d > 0 ? hx + 1 : hx, y + 1, 1, 1, '#0d0f1c');
      Object.assign(box('mouse'), { x: x - 4, y: y - 3, w: 14, h: 9, label: 'Mouse' });
    }
  }
  function drawFrog() {
    const f = s.frog;
    let fx = f.x, fy = f.y, air = false;
    if (f.from) {
      const k = Math.min(1, (s.t - f.hopAt) / 0.5);
      fx = f.from.x + (f.to.x - f.from.x) * k; fy = f.from.y + (f.to.y - f.from.y) * k - Math.sin(k * Math.PI) * 7; air = true;
    }
    const x = Math.round(fx), y = Math.round(fy), g = '#5fbf6a';
    R(x, y + 1, 7, 3, g); R(x + 1, y - 1, 2, 2, '#8be08f'); R(x + 4, y - 1, 2, 2, '#8be08f');
    R(x + 2, y - 1, 1, 1, '#0d0f1c'); R(x + 4, y - 1, 1, 1, '#0d0f1c');
    R(x + 2, y + 2, 3, 1, '#c9f5cb');
    if (air) { R(x - 1, y + 4, 2, 2, '#3f8f4a'); R(x + 6, y + 4, 2, 2, '#3f8f4a'); }
    else { R(x - 1, y + 3, 2, 1, '#3f8f4a'); R(x + 6, y + 3, 2, 1, '#3f8f4a'); }
    Object.assign(box('frog'), { x: x - 2, y: y - 3, w: 11, h: 10 });
  }

  function critterClick(id) {
    if (id === 'roach') {
      const r = s.roach; hooks.say?.(sayLine('roach'), r.x + 2, r.y - 4);
      r.flee = true; r.state = 'run'; r.tx = r.x < W / 2 ? -8 : W + 8; r.ty = r.y; return true;
    }
    if (id === 'mouse') {
      const m = s.mouse; hooks.say?.(sayLine('mouse'), (m.state === 'peek' ? 82 : m.x) + 2, 132);
      m.state = 'back'; m.tx = 80; m.fast = true; return true;
    }
    if (id === 'frog') {
      const f = s.frog, wet = s.weather === 'rain' || s.weather === 'storm';
      hooks.say?.(wet ? sayLine('frogRain') : sayLine('frog'), f.x + 3, f.y - 4);
      f.next = s.t + 0.3; return true;
    }
    if (id === 'spider') {
      const sp = s.spider; hooks.say?.(sayLine('spider'), 116, sp.y - 3);
      sp.state = 'move'; sp.ty = 12; sp.fast = true; return true;
    }
    if (id === 'lizard') {
      const z = s.lizard; hooks.say?.(sayLine('lizard'), z.x + 3, z.y - 4);
      z.state = 'crawl'; z.fast = true; z.until = s.t + 1.2;
      z.tx = Math.max(4, Math.min(310, z.x + (Math.random() < 0.5 ? -70 : 70))); z.ty = z.y; return true;
    }
    if (id === 'aircon') {
      s.ac = !s.ac;
      hooks.say?.(s.ac ? 'Aircon on. The Iloilo heat stands no chance. ❄' : 'Aircon off. Saving on the electric bill.', 162, 22);
      return true;
    }
    if (id === 'bulb') {
      s.bulb = !s.bulb;
      hooks.say?.(s.bulb ? ['Let there be light. 💡', 'Ahh, now I can see the bugs. Both kinds.', 'Lights on. Productivity +10.'][Math.floor(Math.random() * 3)]
                         : ['Lights off. Monitor glow only.', 'Dark mode: room edition.', 'Saving electricity. And my eyes.'][Math.floor(Math.random() * 3)], BULB_X, 26);
      return true;
    }
    if (id === 'hat') {
      hooks.say?.(['My lucky straw hat.', 'Every adventure needs a hat.', 'Sun protection for the walk to 7-Eleven.'][Math.floor(Math.random() * 3)], 140 + s.chair.x, 112);
      return true;
    }
    return false;
  }
  // ---------- treasure chest ----------
  // each find: how to draw it (10×10 at x,y) and what Topz says about it
  const LOOT = [
    { name: 'gold', say: "A pile of gold! …it's chocolate. Still counts.", draw: (x, y) => {
      R(x + 1, y + 6, 8, 3, '#c9972c'); R(x + 2, y + 4, 6, 2, '#f2c14e'); R(x + 3, y + 2, 4, 2, '#f6d365');
      R(x + 4, y + 3, 1, 1, '#fff3b0'); R(x + 2, y + 7, 1, 1, '#fff3b0'); R(x + 6, y + 6, 1, 1, '#fff3b0'); } },
    { name: 'ruby', say: "A ruby! Perfect for the next client who says 'make it pop'.", draw: (x, y) => {
      R(x + 3, y + 1, 4, 1, '#ff8fab'); R(x + 2, y + 2, 6, 2, '#e05a5a'); R(x + 3, y + 4, 4, 2, '#b8334a'); R(x + 4, y + 6, 2, 2, '#8a2238');
      R(x + 3, y + 2, 1, 1, '#ffd0dc'); } },
    { name: 'map', say: 'A treasure map. The X marks… this exact chest. Hmm.', draw: (x, y) => {
      R(x, y + 1, 10, 8, '#e8d6a8'); R(x, y + 1, 10, 1, '#c9b07a'); R(x, y + 8, 10, 1, '#c9b07a');
      R(x + 2, y + 3, 1, 1, '#8a6a3a'); R(x + 3, y + 4, 2, 1, '#8a6a3a'); R(x + 5, y + 5, 1, 1, '#8a6a3a');
      R(x + 6, y + 5, 1, 1, '#e05a5a'); R(x + 8, y + 5, 1, 1, '#e05a5a'); R(x + 7, y + 6, 1, 1, '#e05a5a'); R(x + 6, y + 7, 1, 1, '#e05a5a'); R(x + 8, y + 7, 1, 1, '#e05a5a'); } },
    { name: 'compass', say: 'A brass compass. It always points to the coffee.', draw: (x, y) => {
      R(x + 2, y + 1, 6, 8, '#c9972c'); R(x + 1, y + 2, 8, 6, '#c9972c'); R(x + 2, y + 2, 6, 6, '#f4f6fb');
      R(x + 5, y + 3, 1, 2, '#e05a5a'); R(x + 4, y + 5, 1, 2, '#2b3245'); R(x + 4, y, 2, 1, '#f2c14e'); } },
    { name: 'bottle', say: "A message in a bottle: 'Hire Topz.' Wise words.", draw: (x, y) => {
      R(x + 4, y, 2, 2, '#8a5a3c'); R(x + 4, y + 2, 2, 2, '#9fd8c8'); R(x + 2, y + 4, 6, 6, '#9fd8c8');
      R(x + 3, y + 5, 4, 3, '#efe3c2'); R(x + 3, y + 4, 1, 5, '#d8f3ea'); } },
    { name: 'spyglass', say: 'A spyglass. Now I can spot bugs from three files away.', draw: (x, y) => {
      R(x, y + 6, 4, 3, '#c9972c'); R(x + 3, y + 4, 4, 3, '#8a5a3c'); R(x + 6, y + 2, 4, 3, '#c9972c');
      R(x + 9, y + 2, 1, 3, '#9fd8f0'); R(x + 1, y + 6, 2, 1, '#f6d365'); } },
    { name: 'duck', rare: true, say: 'THE LEGENDARY GOLDEN RUBBER DUCK. Debugging +100!', draw: (x, y) => {
      R(x + 5, y + 1, 3, 3, '#f6d365'); R(x + 8, y + 2, 2, 1, '#e48a5b'); R(x + 6, y + 2, 1, 1, '#2b3245');
      R(x + 1, y + 4, 8, 4, '#f2c14e'); R(x + 2, y + 8, 6, 1, '#c9972c'); R(x + 2, y + 5, 3, 1, '#fff3b0'); } },
    { name: 'scroll', say: 'The legendary scroll of bug-free code! …it is blank.', draw: (x, y) => {
      R(x + 1, y + 1, 8, 2, '#c9b07a'); R(x + 2, y + 3, 6, 5, '#efe3c2'); R(x + 1, y + 8, 8, 2, '#c9b07a');
      R(x + 3, y + 5, 4, 1, '#d8c99a'); } },
    { name: 'key', say: 'A mystery key. It opens nothing. Yet.', draw: (x, y) => {
      R(x, y + 2, 4, 4, '#f2c14e'); R(x + 1, y + 3, 2, 2, '#0d0f1c00'); R(x + 1, y + 3, 2, 2, '#c9972c');
      R(x + 4, y + 3, 6, 2, '#f2c14e'); R(x + 7, y + 5, 1, 2, '#f2c14e'); R(x + 9, y + 5, 1, 2, '#f2c14e'); } },
    { name: 'flag', say: 'A pirate flag, front-end edition. Crossed pencils, obviously.', draw: (x, y) => {
      R(x, y, 1, 10, '#8a5a3c'); R(x + 1, y, 9, 7, '#15121c');
      R(x + 4, y + 1, 3, 3, '#f4f6fb'); R(x + 4, y + 2, 1, 1, '#15121c'); R(x + 6, y + 2, 1, 1, '#15121c');
      R(x + 2, y + 5, 1, 1, '#f6d365'); R(x + 3, y + 4, 1, 1, '#f6d365'); R(x + 8, y + 5, 1, 1, '#f6d365'); R(x + 7, y + 4, 1, 1, '#f6d365');
      R(x + 5, y + 5, 1, 1, '#f4f6fb'); } },
    { name: 'katana', say: 'A spare katana! The rack is full, so it lives under the bed now.', draw: (x, y) => {
      R(x, y + 8, 3, 2, '#2bbecb'); R(x + 3, y + 6, 2, 3, '#c9a227'); R(x + 4, y + 5, 2, 2, '#c9a227');
      R(x + 5, y + 3, 2, 2, '#1d2340'); R(x + 7, y + 1, 2, 2, '#1d2340'); R(x + 9, y, 1, 1, '#1d2340'); } },
    { name: 'bone', say: "Mochi's toy bone! She's been looking everywhere.", draw: (x, y) => {
      R(x + 2, y + 4, 6, 2, '#f4f6fb'); R(x, y + 3, 2, 2, '#f4f6fb'); R(x, y + 5, 2, 2, '#f4f6fb');
      R(x + 8, y + 3, 2, 2, '#f4f6fb'); R(x + 8, y + 5, 2, 2, '#f4f6fb'); R(x + 2, y + 6, 6, 1, '#c9ced8'); } },
    { name: 'shell', say: 'A seashell. Hold it to your ear: you can hear the deadline approaching.', draw: (x, y) => {
      R(x + 2, y + 2, 6, 6, '#ffb8a8'); R(x + 1, y + 4, 8, 4, '#ffb8a8'); R(x + 4, y + 8, 2, 1, '#e48a8a');
      R(x + 3, y + 3, 1, 5, '#e48a8a'); R(x + 5, y + 2, 1, 6, '#e48a8a'); R(x + 7, y + 3, 1, 5, '#e48a8a'); } },
  ];

  // real photos from Topz's shelf: the find is a little framed photo, a card shows the real thing
  const FRAME_TINTS = ['#e05a5a', '#2bbecb', '#f6d365', '#8a7bd8', '#4caf6a'];
  (hooks.photos || []).forEach((p, n) => LOOT.push({
    name: `photo-${p.file}`, photo: `assets/collection/${p.file}.webp`, title: "From Topz's shelf", caption: p.caption, say: p.say,
    draw: (x, y) => {
      R(x, y, 10, 10, '#f4f6fb'); R(x + 1, y + 1, 8, 6, '#9fb4c8'); R(x + 1, y + 5, 8, 2, '#c9a456');
      R(x + 3, y + 2, 3, 4, FRAME_TINTS[n % FRAME_TINTS.length]); R(x + 4, y - 1, 2, 2, '#e05a5a');
    },
  }));

  function openChest() {
    const c = s.chest;
    if (c.target === 1 && s.t < c.closeAt) return; // still showing the last find
    // the golden duck is rare; never the same find twice in a row
    let i;
    // real photos from the shelf turn up about a third of the time
    const photos = LOOT.map((l, k) => (l.photo ? k : -1)).filter((k) => k >= 0 && k !== c.last);
    if (photos.length && Math.random() < 0.5) i = photos[Math.floor(Math.random() * photos.length)];
    else do {
      i = Math.floor(Math.random() * LOOT.length);
      if (LOOT[i].rare && Math.random() > 0.25) i = c.last;
    } while (i === c.last);
    c.last = i;
    c.item = LOOT[i];
    c.target = 1;
    c.itemAt = s.t + 0.35;
    c.closeAt = s.t + 5;
    for (let k = 0; k < 14; k++) c.sparks.push({ x: 29 + rand(-8, 8), y: 150, vx: rand(-14, 14), vy: rand(-30, -12), life: rand(0.6, 1.2) });
    setTimeout(() => hooks.say?.(c.item.say, 29, 126), 380);
    if (c.item.photo) setTimeout(() => hooks.photo?.(c.item), 1300);
    if (c.item.name === 'bone') { const g = s.dog; g.state = 'walk'; g.target = 46; }
  }

  function drawChest(dt) {
    const c = s.chest;
    if (c.target === 1 && s.t > c.closeAt) c.target = 0;
    c.open += (c.target - c.open) * Math.min(1, dt * 10);
    const x = 16, y = 152;
    const open = c.open > 0.5;
    // rose-painted wood, silver bands with rivets, gold studs, heaped with coins
    const wood = '#a5636a', woodL = '#bb7a7f', woodD = '#7f474d', band = '#a9afbd', bandL = '#d4d8e0', rivet = '#6b7183';
    const grain = (gx, gy, gw, gh) => { for (let j = gy + 2; j < gy + gh; j += 3) R(gx, j, gw, 1, woodD); };
    if (open) { ctx.fillStyle = 'rgba(255,214,107,0.22)'; ctx.fillRect(x - 2, y - 16, 30, 18); }
    if (open) {
      // lid swung back: we see its rounded top edge behind the coins
      R(x + 1, y - 12, 24, 10, wood); R(x + 2, y - 13, 22, 1, woodL); grain(x + 1, y - 12, 24, 10);
      R(x, y - 12, 1, 10, band); R(x + 25, y - 12, 1, 10, band);
      R(x + 6, y - 13, 2, 11, band); R(x + 18, y - 13, 2, 11, band);
      R(x + 1, y - 3, 24, 1, band);
    }
    // body
    R(x, y, 26, 14, wood); R(x, y, 26, 1, woodL); grain(x + 1, y, 24, 14);
    R(x, y, 1, 14, band); R(x + 25, y, 1, 14, band); R(x, y + 13, 26, 1, band); R(x, y, 26, 1, band);
    for (let i = 2; i < 26; i += 3) R(x + i, y + 13, 1, 1, rivet);
    for (let j = 2; j < 13; j += 3) { R(x, y + j, 1, 1, rivet); R(x + 25, y + j, 1, 1, rivet); }
    // silver lock plate
    R(x + 11, y + 3, 4, 5, band); R(x + 11, y + 3, 4, 1, bandL); R(x + 12, y + 5, 2, 2, rivet);
    if (open) {
      // the hoard: gold coins, a blue gem, a pearl
      R(x + 1, y - 2, 24, 3, '#c9972c'); R(x + 2, y - 3, 21, 1, '#f2c14e');
      for (let i = 0; i < 7; i++) { const cx = x + 2 + i * 3 + (i % 2); R(cx, y - 3 + (i % 2), 2, 1, '#f6d365'); R(cx, y - 2 + (i % 2), 1, 1, '#fff3b0'); }
      R(x + 9, y - 3, 2, 2, '#4fb3e8'); R(x + 9, y - 3, 1, 1, '#bfe8ff');
      R(x + 16, y - 3, 2, 2, '#f4f6fb');
    } else {
      // domed lid
      R(x + 1, y - 9, 24, 9, wood); R(x + 2, y - 10, 22, 1, wood); R(x + 3, y - 11, 20, 1, woodL);
      R(x + 2, y - 9, 22, 1, woodL); grain(x + 1, y - 9, 24, 9);
      R(x, y - 9, 1, 9, band); R(x + 25, y - 9, 1, 9, band); R(x + 1, y - 10, 1, 1, band); R(x + 24, y - 10, 1, 1, band);
      R(x + 2, y - 11, 1, 1, band); R(x + 23, y - 11, 1, 1, band); R(x + 3, y - 12, 20, 1, band);
      R(x + 6, y - 12, 2, 12, band); R(x + 18, y - 12, 2, 12, band); R(x + 6, y - 12, 1, 12, bandL); R(x + 18, y - 12, 1, 12, bandL);
      R(x, y - 1, 26, 1, band);
      // three gold studs along the lid front
      for (const sx of [x + 2, x + 11, x + 21]) { R(sx, y - 5, 3, 3, '#c9972c'); R(sx, y - 5, 2, 2, '#f2c14e'); R(sx + 1, y - 4, 1, 1, '#fff3b0'); }
    }
    R(x + 1, y + 14, 24, 1, '#2b1d20');
    // the find floats up and bobs
    if (c.item && open && s.t > c.itemAt) {
      const rise = Math.min(1, (s.t - c.itemAt) / 0.4);
      const iy = Math.round(y - 4 - rise * 14 + Math.sin(s.t * 3) * 1);
      if (c.item.rare) { ctx.fillStyle = `rgba(255,236,150,${0.35 + 0.15 * Math.sin(s.t * 8)})`; ctx.fillRect(x + 6, iy - 3, 14, 16); }
      c.item.draw(x + 8, iy);
    }
    // sparkles
    c.sparks = c.sparks.filter((p) => (p.life -= dt) > 0);
    for (const p of c.sparks) {
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 30 * dt;
      R(p.x, p.y, 1, 1, p.life > 0.4 ? '#fff3b0' : '#f2c14e');
    }
    box('chest').y = open ? 136 : 138;
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
    updateCritters(dt);
    s.blinds += (s.blindsTarget - s.blinds) * Math.min(1, dt * 4);
    // the chair rolls to a new spot now and then
    const ch = s.chair;
    if (!reduced && s.t > ch.next && s.t > s.drinkUntil) { ch.tx = Math.round(rand(-8, 8)); ch.next = s.t + rand(8, 16); }
    ch.x += Math.sign(ch.tx - ch.x) * Math.min(Math.abs(ch.tx - ch.x), dt * 8);
    for (let i = 0; i < 3; i++) {
      if (s.doorsTarget[i] && s.t > s.doorsCloseAt[i]) s.doorsTarget[i] = 0;
      s.doors[i] += (s.doorsTarget[i] - s.doors[i]) * Math.min(1, dt * (reduced ? 60 : 9));
    }
    s.bulbGlow = reduced ? (s.bulb ? 1 : 0) : s.bulbGlow + ((s.bulb ? 1 : 0) - s.bulbGlow) * Math.min(1, dt * 8);

    if (s.t > s.nextBlink) { s.blinkUntil = s.t + 0.14; s.nextBlink = s.t + rand(2.5, 5.5); }
    if (s.t > s.nextStretch && s.t > s.drinkUntil) { s.stretchUntil = s.t + 1.8; s.nextStretch = s.t + rand(25, 45); }
    if (s.t > s.nextDrink && s.t > s.stretchUntil) startDrink();
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
      g.target = g.x !== 70 && Math.random() < 0.45 ? 70 : Math.round(rand(46, 200));
    }
  }

  function draw() {
    const d = iloiloNow();
    const { light } = daylight(d);
    drawWall();
    for (const win of WINDOWS) drawWindow(d, win);
    drawClock(d);
    drawKatanas();
    drawAircon();
    drawBulb();
    drawLizard();
    drawFloor();
    drawMouseHole();
    drawDesk(light);
    drawShelf();
    drawJukebox();
    drawBedBack();
    drawDog();
    drawBedFront();
    drawChest(1 / 60);
    drawFloorCritters(false);
    drawMark();
    drawFloorCritters(true);
    drawSpider();
    drawLights(light);
    drawBulbGlow();
    drawNeon(d);
    drawHearts(1 / 60);
    drawNotes(1 / 60);
    drawHover();
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.max(0, Math.min(0.1, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- input ----------
  function hit(x, y) {
    // critters first: they wander in front of things
    const order = ['roach', 'mouse', 'frog', 'spider', 'lizard', 'chest', 'dog', 'bottle', 'alien', 'mug', 'hat', 'bulb', 'aircon', 'jukebox', 'about', 'projects', 'contact', 'shelf', 'katana', 'mark', 'pc', 'monitors', 'window', 'window2'];
    for (const id of order) {
      const o = objects.find((ob) => ob.id === id);
      if (x >= o.x && x < o.x + o.w && y >= o.y && y < o.y + o.h) return o;
    }
    return null;
  }
  const MARK_LINES = [
    'Hi! Click around — everything in here does something.',
    'Fixing one more CSS bug… then sleep.',
    'Mochi thinks the desk is hers.',
    'Currently shipping WordPress sites with Elementor + ACF.',
    'If the phone rings, that might be you. 📞',
    'Coffee count today: classified.',
    'It works on my machine. Ship it?',
    "Pixel-perfect or it didn't happen.",
    'Did something just run under the desk…?',
    'Ctrl+S is my love language.',
    'Clearing the cache… for the third time.',
    "My code doesn't have bugs. My room does.",
    'Open to new projects — click the phone!',
    'Grab a seat. Mochi will judge you, but nicely.',
    'One more commit and I\'m done. (I am not done.)',
    'Try clicking the jukebox. I have taste. Mostly.',
  ];
  function markLine() {
    const h = iloiloNow().getHours();
    const wet = s.weather === 'rain' || s.weather === 'storm';
    if (wet && Math.random() < 0.35) return ['Rain outside, code inside.', 'Perfect weather for coding. And napping.', 'The frog is way too happy about this rain.'][Math.floor(Math.random() * 3)];
    if ((h >= 23 || h < 4) && Math.random() < 0.35) return ['Late-night coding hits different.', 'Who needs sleep when there is a deadline?'][Math.floor(Math.random() * 2)];
    if (h >= 5 && h < 9 && Math.random() < 0.35) return 'Good morning! Coffee first, code second.';
    return MARK_LINES[lineIdx++ % MARK_LINES.length];
  }
  let lineIdx = 0;
  const KATANA_LINES = ['Three swords. Zero sword skills.', 'Decor only — Mochi is the real guard.', 'Display swords. Please do not debug with them.'];
  let katanaIdx = 0;

  function click(o) {
    if (!o) return;
    if (critterClick(o.id)) return;
    if (o.id === 'chest') { openChest(); return; }
    if (o.id === 'window' || o.id === 'window2') { s.blindsTarget = s.blindsTarget ? 0 : 1; return; }
    const col = SHELF_COLS.indexOf(o.id);
    if (col >= 0) { openShelf(col); return; }
    if (o.id === 'dog') {
      const g = s.dog;
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      if (g.state === 'sleep') { g.state = 'idle'; g.until = s.t + 5; hooks.say?.(pick(['*yawn*', 'Five more minutes…', 'Was I snoring?']), g.x + 9, 140); }
      else { hooks.say?.(pick(['Arf!', 'Woof! (pet me)', '*wag wag wag*', 'Did someone say treats?', 'I guard this room. Mostly from naps.']), g.x + 9, 140); g.state = 'idle'; g.until = s.t + 5; }
      for (let i = 0; i < 3; i++) s.hearts.push({ x: g.x + 4 + i * 4, y: 142 - i * 3, life: 1.2 });
      return;
    }
    if (o.id === 'mark') {
      hooks.say?.(markLine(), 140 + s.chair.x, 76);
      return;
    }
    if (o.id === 'shelf') {
      hooks.say?.(['Half of these are manga. The other half are also manga.', 'That trophy? Office chair racing. Long story.', 'The controller is for "testing". Definitely testing.'][Math.floor(Math.random() * 3)], 241, 112);
      return;
    }
    if (o.id === 'katana') { hooks.say?.(KATANA_LINES[katanaIdx++ % KATANA_LINES.length], 162, 40); return; }
    if (o.id === 'bottle') { startDrink(); return; }
    if (o.id === 'alien') { squeezeAlien(); return; }
    if (o.id === 'mug') { hooks.say?.('This MEETING should have been an EMAIL', 68, 96); return; }
    if (o.id === 'pc') { s.rgbMode = (s.rgbMode + 1) % (RGB.length + 1); return; }
    hooks.open?.(o.id === 'monitors' ? 'projects' : o.id);
  }

  return {
    objects,
    hitAt: hit,
    click,
    setHover(id) { s.hover = id; },
    setMusic(on) { s.music = on; },
    setWeather(w) { s.weather = w; },
    get weather() { return s.weather; },
    toggleBlinds() { s.blindsTarget = s.blindsTarget ? 0 : 1; },
  };
}

// colour lerp for the sky gradient
function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = (sh) => Math.round(((pa >> sh) & 255) * (1 - k) + ((pb >> sh) & 255) * k);
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}
