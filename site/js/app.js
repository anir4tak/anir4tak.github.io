import { createScene, drawPortrait, W, H } from './scene.js';
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
  talk: showTalk,
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

// ---------- character card: Kokak, Keso… ----------
const talk = document.getElementById('talk');
const talkFace = document.getElementById('talk-face');
const talkName = document.getElementById('talk-name');
const talkText = document.getElementById('talk-text');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let talkTimer, typeTimer, faceTimer;
function showTalk({ who, name, text }) {
  bubble.hidden = true;
  clearTimeout(talkTimer); clearInterval(typeTimer); clearInterval(faceTimer);
  talkName.textContent = name;
  talk.hidden = false;
  let n = reducedMotion ? text.length : 0;
  const start = performance.now();
  const paint = () => drawPortrait(who, talkFace, (performance.now() - start) / 1000, n < text.length);
  talkText.textContent = text.slice(0, n);
  typeTimer = setInterval(() => {
    n = Math.min(text.length, n + 1);
    talkText.textContent = text.slice(0, n);
    if (n >= text.length) clearInterval(typeTimer);
  }, 28);
  paint();
  faceTimer = setInterval(paint, 90);
  talkTimer = setTimeout(hideTalk, 4000 + text.length * 55);
}
function hideTalk() {
  clearTimeout(talkTimer); clearInterval(typeTimer); clearInterval(faceTimer);
  talk.hidden = true;
}
talk.addEventListener('click', hideTalk);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !talk.hidden) hideTalk(); });

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
  const p = isJukebox ? { title: 'Music box' } : PANELS[id]?.();
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
const SLEEVES = ['#c0504d', '#d9822b', '#c9a227', '#4f9a5a', '#2a8f8a', '#4a6fb5', '#8a5fbf', '#c0508f', '#6b7183'];
function setupJukebox() {
  if (jukeboxReady) return;
  jukeboxReady = true;
  document.getElementById('spotify-profile').href = SPOTIFY.profile;
  // a crate of records: one sleeve per playlist, the record peeking out
  const crate = jukebox.querySelector('.crate');
  crate.innerHTML = SPOTIFY.playlists.map((p, i) => `
    <div role="listitem">
      <button class="record" data-i="${i}" aria-pressed="${i === 0}" style="--sleeve:${SLEEVES[i % SLEEVES.length]}">
        <span class="disc" aria-hidden="true"><span class="vinyl"><span class="label"></span></span></span>
        <span class="sleeve" aria-hidden="true"><span class="art"></span></span>
        <span class="rname">${esc(p.name)}</span>
      </button>
    </div>`).join('');
  // the playlist covers, straight from Spotify (no key needed)
  SPOTIFY.playlists.forEach(async (p, i) => {
    try {
      const r = await fetch(`https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${p.id}`);
      const { thumbnail_url: img } = await r.json();
      if (!img) return;
      const b = crate.querySelector(`[data-i="${i}"]`);
      b.querySelector('.art').style.backgroundImage = `url("${img}")`;
      b.querySelector('.label').style.backgroundImage = `url("${img}")`;
    } catch { /* offline: plain coloured sleeves are fine */ }
  });
  crate.addEventListener('click', (e) => {
    const b = e.target.closest('.record');
    if (!b) return;
    current = +b.dataset.i;
    crate.querySelectorAll('.record').forEach((r) => r.setAttribute('aria-pressed', r === b));
    const uri = `spotify:playlist:${SPOTIFY.playlists[current].id}`;
    if (controller) { controller.loadUri(uri); controller.play?.(); }
    else fallbackEmbed();
  });
  window.onSpotifyIframeApiReady = (api) => {
    const el = document.getElementById('spotify-embed');
    api.createController(el, { uri: `spotify:playlist:${SPOTIFY.playlists[0].id}`, width: '100%', height: 152 }, (c) => {
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
    width="100%" height="152" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
}

// ---------- status strip: Mark's own time in Iloilo ----------
let si = 0;
let musicOn = false;
const _setMusic = scene.setMusic;
scene.setMusic = (on) => { musicOn = on; _setMusic(on); jukebox.classList.toggle('spinning', on); tick(); };

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
let nowPlaying = null; // { title, artist, url, image, progressMs, durationMs } while something plays
async function loadNowPlaying() {
  if (!NOW_PLAYING_URL) { nowPlaying = null; renderNowPlaying(); return; }
  try {
    const r = await (await fetch(NOW_PLAYING_URL, { cache: 'no-store' })).json();
    nowPlaying = r && r.isPlaying ? { ...r, at: performance.now() } : null;
  } catch { nowPlaying = null; }
  _setMusic(musicOn || !!nowPlaying);
  renderNowPlaying();
  tick();
}
// the same little card in the room's corner and at the top of the music box
const npCard = document.getElementById('np-card');
let npKey = '';
function npInner(n) {
  return `${n.image ? `<img src="${n.image}" alt="">` : '<span class="np-noart"></span>'}
    <span class="np-text">
      <i class="np-eq" aria-hidden="true"><s></s><s></s><s></s><s></s></i>
      <b>${esc(n.title)}</b><em>${esc(n.artist)}</em>
    </span>
    <span class="np-bar" aria-hidden="true"><span></span></span>`;
}
function renderNowPlaying() {
  const n = nowPlaying;
  const key = n ? `${n.url}|${n.title}` : '';
  if (key !== npKey) { // rebuild only when the song changes, so the bar moves smoothly
    npKey = key;
    npCard.hidden = !n;
    if (n) { npCard.href = n.url; npCard.title = `Topz is listening to ${n.title} by ${n.artist}`; npCard.innerHTML = npInner(n); }
    const el = document.getElementById('now-playing');
    if (el) el.innerHTML = n
      ? `<small class="np-label">Topz is listening to</small><a class="np-card in-panel" href="${n.url}" target="_blank" rel="noopener noreferrer">${npInner(n)}</a>`
      : `<p><span class="dot"></span>Topz is not listening to anything right now. Pick a record below.</p>`;
  }
  updateNpBar();
}
// progress fills between checks, from where Spotify said the song was
function updateNpBar() {
  const n = nowPlaying;
  const bars = document.querySelectorAll('.np-bar');
  bars.forEach((b) => { b.hidden = !(n && n.durationMs); });
  if (!n || !n.durationMs) return;
  const ms = Math.min(n.durationMs, (n.progressMs || 0) + (performance.now() - n.at));
  const pct = (ms / n.durationMs * 100).toFixed(2) + '%';
  bars.forEach((b) => { b.firstElementChild.style.width = pct; });
  if (ms >= n.durationMs && performance.now() - n.at > 2000) { n.at = performance.now() + 1e9; loadNowPlaying(); } // song ended: ask again
}
setInterval(updateNpBar, 1000);

function tick() {
  const t = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: PROFILE.timezone }).format(new Date());
  const h = +new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: PROFILE.timezone }).format(new Date());
  // rotate through what's going on in the room
  const lines = [];
  if (nowPlaying) lines.push(`♪ Topz is listening to “${nowPlaying.title}” by ${nowPlaying.artist}`);
  else if (musicOn) lines.push(`♪ The music box is playing “${SPOTIFY.playlists[current].name}”`);
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
