import { createScene, W, H } from './scene.js';
import { PROFILE, ABOUT, PROJECTS, CONTACT, STATUS, SPOTIFY, NOW_PLAYING_URL, WEATHER_AT } from './content.js';

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
  if (pan && (!wasPan || !fit.done)) viewport.scrollLeft = 140 * scale - viewport.clientWidth / 2; // start on Mark
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
  photo(item) { showPhoto(item); },
  say(text, x, y) {
    bubble.textContent = text;
    bubble.style.left = `${Math.max(70, Math.min(250, x)) * scale}px`; // keep it inside the room
    bubble.style.top = `${y * scale}px`;
    bubble.classList.toggle('below', y < 34); // near the ceiling: show it underneath
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

// a real photo found in the chest, shown in the panel
function showPhoto(item) {
  lastFocus = document.activeElement;
  panelTitle.textContent = item.title;
  jukebox.hidden = true;
  panelBody.hidden = false;
  panelBody.innerHTML = `
    <figure class="photo">
      <img src="${item.photo}" alt="${esc(item.caption)}">
      <figcaption>${esc(item.caption)}</figcaption>
    </figure>`;
  panelBody.scrollTop = 0;
  if (!dialog.open) dialog.showModal();
}

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
  if (isJukebox) { setupJukebox(); renderNowPlaying(); }
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
  const map = { 1: 'about', 2: 'projects', 3: 'contact', 4: 'jukebox' };
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

// ---------- real weather in the window ----------
let weather = 'clear';
const WEATHER_TEXT = { rain: "It's raining in Iloilo 🌧", storm: 'Thunderstorm over Iloilo ⛈', cloudy: 'Cloudy skies over Iloilo ☁', fog: 'Foggy in Iloilo 🌫', clear: '' };
async function loadWeather() {
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_AT.lat}&longitude=${WEATHER_AT.lon}&current=weather_code,cloud_cover,precipitation`;
    const { current: c } = await (await fetch(u)).json();
    const code = c.weather_code;
    weather = code >= 95 ? 'storm'
      : (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || c.precipitation > 0.1 ? 'rain'
      : code === 45 || code === 48 ? 'fog'
      : code === 3 || c.cloud_cover > 75 ? 'cloudy' : 'clear';
  } catch { /* offline or blocked: keep the last known sky */ }
  if (location.hash.startsWith('#weather=')) weather = location.hash.slice(9); // for testing: #weather=rain
  scene.setWeather(weather);
  tick();
}

// ---------- what Topz is listening to right now ----------
let nowPlaying = null; // { title, artist, url, image } while something plays
async function loadNowPlaying() {
  if (!NOW_PLAYING_URL) { nowPlaying = null; renderNowPlaying(); return; }
  try {
    const r = await (await fetch(NOW_PLAYING_URL, { cache: 'no-store' })).json();
    nowPlaying = r && r.isPlaying ? r : null;
  } catch { nowPlaying = null; }
  _setMusic(musicOn || !!nowPlaying);
  renderNowPlaying();
  tick();
}
function renderNowPlaying() {
  const el = document.getElementById('now-playing');
  if (!el) return;
  el.innerHTML = nowPlaying
    ? `<a href="${nowPlaying.url}" target="_blank" rel="noopener noreferrer">
         ${nowPlaying.image ? `<img src="${nowPlaying.image}" alt="">` : ''}
         <span><small>Topz is listening to</small><b>${esc(nowPlaying.title)}</b><em>${esc(nowPlaying.artist)}</em></span>
         <i class="eq" aria-hidden="true"><s></s><s></s><s></s></i></a>`
    : `<p><span class="dot"></span>Topz is not listening to anything right now. Pick a playlist below.</p>`;
}

function tick() {
  const t = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: PROFILE.timezone }).format(new Date());
  const h = +new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: PROFILE.timezone }).format(new Date());
  // rotate through what's going on in the room
  const lines = [];
  if (nowPlaying) lines.push(`♪ Topz is listening to “${nowPlaying.title}” by ${nowPlaying.artist}`);
  else if (musicOn) lines.push(`♪ Jukebox is playing “${SPOTIFY.playlists[current].name}”`);
  else lines.push('Topz is not listening to anything right now');
  if (WEATHER_TEXT[weather]) lines.push(WEATHER_TEXT[weather]);
  lines.push(h >= 2 && h < 8 ? 'Topz is probably asleep (the dog is not)' : STATUS[si % STATUS.length]);
  status.textContent = `${lines[si % lines.length]} · ${t} in Iloilo`;
}
tick();
loadWeather();
loadNowPlaying();
setInterval(tick, 30_000);
setInterval(() => { si++; tick(); }, 7_000);
setInterval(loadWeather, 10 * 60_000);
setInterval(loadNowPlaying, 30_000);

fit();
checkRotate();
if (location.hash === '#party') scene.setMusic(true); // easter egg: the room dances without music
