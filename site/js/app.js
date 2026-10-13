import { createScene, W, H } from './scene.js';
import { PROFILE, ABOUT, SKILLS, PROJECTS, CONTACT, STATUS, SPOTIFY } from './content.js';

const stage = document.getElementById('stage');
const canvas = document.getElementById('room');
const tip = document.getElementById('tip');
const bubble = document.getElementById('bubble');
const dialog = document.getElementById('panel');
const panelTitle = document.getElementById('panel-title');
const panelBody = document.getElementById('panel-body');
const status = document.getElementById('status');

// ---------- layout: biggest whole-number zoom that fits ----------
let scale = 1;
const viewport = document.getElementById('viewport');
const panHint = document.getElementById('pan-hint');
function fit() {
  const hud = document.querySelector('.hud').offsetHeight + 40;
  const maxW = window.innerWidth - 16, maxH = window.innerHeight - hud;
  const raw = Math.min(maxW / W, maxH / H);
  // narrow screens: keep the room big enough to tap, and let it pan sideways
  const pan = maxW / W < 1.6;
  scale = pan ? Math.max(2, Math.floor(Math.min(maxH / H, 3))) : raw >= 2 ? Math.floor(raw) : raw;
  stage.style.width = `${W * scale}px`;
  stage.style.height = `${H * scale}px`;
  const wasPan = viewport.classList.contains('pan');
  viewport.classList.toggle('pan', pan);
  panHint.hidden = !pan;
  if (pan && (!wasPan || !fit.done)) viewport.scrollLeft = 170 * scale - viewport.clientWidth / 2; // start on Mark
  fit.done = true;
}
addEventListener('resize', () => { fit(); checkRotate(); });

// ---------- phones held upright: ask for landscape, with a way out ----------
const rotate = document.getElementById('rotate');
const portraitPhone = matchMedia('(orientation: portrait) and (pointer: coarse) and (max-width: 820px)');
let skipRotate = false;
try { skipRotate = sessionStorage.getItem('skip-rotate') === '1'; } catch { /* storage blocked: just ask again next visit */ }
function checkRotate() {
  const show = portraitPhone.matches && !skipRotate;
  if (show === !rotate.hidden) return;
  rotate.hidden = !show;
  if (show) document.getElementById('rotate-skip').focus();
}
portraitPhone.addEventListener?.('change', () => { checkRotate(); fit(); });
document.getElementById('rotate-skip').addEventListener('click', () => {
  skipRotate = true;
  try { sessionStorage.setItem('skip-rotate', '1'); } catch { /* fine */ }
  checkRotate();
  fit();
});

// ---------- scene ----------
let bubbleTimer;
const scene = createScene(canvas, {
  open: openPanel,
  say(text, x, y) {
    bubble.textContent = text;
    bubble.style.left = `${x * scale}px`;
    bubble.style.top = `${y * scale}px`;
    bubble.hidden = false;
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => (bubble.hidden = true), 3200);
  },
});

const toLogical = (e) => {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
};
canvas.addEventListener('pointermove', (e) => {
  const o = scene.hitAt(...toLogical(e));
  scene.setHover(o?.id ?? null);
  canvas.style.cursor = o ? 'pointer' : 'default';
  if (o && e.pointerType === 'mouse') {
    tip.textContent = o.label;
    tip.style.left = `${e.clientX - stage.getBoundingClientRect().left}px`;
    tip.style.top = `${e.clientY - stage.getBoundingClientRect().top}px`;
    tip.hidden = false;
  } else tip.hidden = true;
});
canvas.addEventListener('pointerleave', () => { scene.setHover(null); tip.hidden = true; });
canvas.addEventListener('click', (e) => scene.click(scene.hitAt(...toLogical(e))));

// ---------- panels ----------
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const PANELS = {
  about: () => ({
    title: 'About me',
    html: `
      <div class="about">
        <div class="id-card">
          <div class="id-name">${esc(PROFILE.name)}</div>
          <div class="id-role">${esc(PROFILE.role)}</div>
          <div class="id-city">📍 ${esc(PROFILE.city)}</div>
        </div>
        ${ABOUT.map((p) => `<p>${esc(p)}</p>`).join('')}
      </div>`,
  }),
  skills: () => ({
    title: 'Skills',
    html: SKILLS.map((g) => `
      <h3>${esc(g.group)}</h3>
      <ul class="skills">${g.items.map(([n, f]) => `
        <li><img src="assets/skills/${f}.svg" alt="" loading="lazy"><span>${esc(n)}</span></li>`).join('')}
      </ul>`).join(''),
  }),
  projects: () => ({
    title: 'Projects',
    html: PROJECTS.map((g) => `
      <h3>${esc(g.group)}</h3>
      <ul class="projects">${g.items.map(([n, url, img]) => `
        <li><a href="${url}" target="_blank" rel="noopener noreferrer">
          <img src="assets/projects/${img}.webp" alt="Screenshot of ${esc(n)}" loading="lazy">
          <span>${esc(n)} ↗</span></a></li>`).join('')}
      </ul>`).join(''),
  }),
  contact: () => ({
    title: 'Contact',
    html: `
      <p class="lead">The phone's always on. Pick a line:</p>
      <ul class="contact">${CONTACT.map(([k, v, href]) => `
        <li><a href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          <b>${esc(k)}</b><span>${esc(v)}</span></a></li>`).join('')}
      </ul>`,
  }),
};

let lastFocus = null;
const jukebox = document.getElementById('jukebox');
function openPanel(id) {
  const isJukebox = id === 'jukebox';
  const p = isJukebox ? { title: 'Jukebox' } : PANELS[id]?.();
  if (!p) return;
  lastFocus = document.activeElement;
  panelTitle.textContent = p.title;
  // the jukebox keeps its player alive (music keeps going after you close it);
  // the other panels share one body that is rebuilt each time
  jukebox.hidden = !isJukebox;
  panelBody.hidden = isJukebox;
  if (isJukebox) setupJukebox();
  else { panelBody.innerHTML = p.html; panelBody.scrollTop = 0; }
  document.querySelectorAll('.slot').forEach((b) => b.classList.toggle('active', b.dataset.open === id));
  if (!dialog.open) dialog.showModal();
}
function closePanel() {
  dialog.close();
}
dialog.addEventListener('close', () => {
  document.querySelectorAll('.slot').forEach((b) => b.classList.remove('active'));
  lastFocus?.focus?.();
});
document.getElementById('panel-close').addEventListener('click', closePanel);
dialog.addEventListener('click', (e) => { if (e.target === dialog) closePanel(); });

// hotbar + number keys
document.querySelectorAll('.slot').forEach((b) => b.addEventListener('click', () => openPanel(b.dataset.open)));
addEventListener('keydown', (e) => {
  if (e.target.closest?.('input,textarea')) return;
  const map = { 1: 'about', 2: 'skills', 3: 'projects', 4: 'contact', 5: 'jukebox' };
  if (map[e.key]) openPanel(map[e.key]);
  if (e.key.toLowerCase() === 'b' && !dialog.open) scene.toggleBlinds();
});

// ---------- jukebox: Spotify's iFrame API, so the room can dance along ----------
let controller = null, jukeboxReady = false, current = 0;
function setupJukebox() {
  if (jukeboxReady) return;
  jukeboxReady = true;
  document.getElementById('spotify-profile').href = SPOTIFY.profile;
  const tabs = jukebox.querySelector('.tabs');
  tabs.innerHTML = SPOTIFY.playlists.map((p, i) =>
    `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${esc(p.name)}</button>`).join('');
  tabs.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    current = +b.dataset.i;
    tabs.querySelectorAll('button').forEach((t) => t.setAttribute('aria-selected', t === b));
    const uri = `spotify:playlist:${SPOTIFY.playlists[current].id}`;
    if (controller) controller.loadUri(uri);
    else fallbackEmbed();
  });
  window.onSpotifyIframeApiReady = (api) => {
    const el = document.getElementById('spotify-embed');
    api.createController(el, { uri: `spotify:playlist:${SPOTIFY.playlists[0].id}`, width: '100%', height: 352 }, (c) => {
      controller = c;
      c.addListener('playback_update', (e) => scene.setMusic(!e.data.isPaused));
    });
  };
  const sc = document.createElement('script');
  sc.src = 'https://open.spotify.com/embed/iframe-api/v1';
  sc.async = true;
  sc.onerror = fallbackEmbed;
  document.head.appendChild(sc);
}
// if Spotify's API script is blocked, a plain embed still plays (the room just won't dance)
function fallbackEmbed() {
  controller = null;
  const host = jukebox.querySelector('.player');
  host.innerHTML = `<iframe title="Spotify playlist" src="https://open.spotify.com/embed/playlist/${SPOTIFY.playlists[current].id}?theme=0"
    width="100%" height="352" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
}

// ---------- status strip: Mark's own time in Iloilo ----------
let si = 0;
let musicOn = false;
const _setMusic = scene.setMusic;
scene.setMusic = (on) => { musicOn = on; _setMusic(on); tick(); };
function tick() {
  const t = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: PROFILE.timezone }).format(new Date());
  const h = +new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: PROFILE.timezone }).format(new Date());
  const line = musicOn ? `♪ Jukebox is playing “${SPOTIFY.playlists[current].name}”`
    : h >= 2 && h < 8 ? 'Topz is probably asleep (the dog is not)' : STATUS[si % STATUS.length];
  status.textContent = `${line} · ${t} in Iloilo`;
}
tick();
setInterval(tick, 30_000);
setInterval(() => { si++; tick(); }, 9_000);

fit();
checkRotate();
if (location.hash === '#party') scene.setMusic(true); // easter egg: the room dances without music
