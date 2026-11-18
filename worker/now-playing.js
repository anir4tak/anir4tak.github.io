// Cloudflare Worker: tells Topz's room what he is listening to on Spotify.
//
// Spotify only shares "currently playing" with an app that holds Topz's own
// login, and that login must never sit in the public website. So it lives here,
// as three secrets on the worker:
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
//
// GET /  →  { isPlaying: true, title, artist, album, url, image }
//        or { isPlaying: false }
//
// One-time setup, no terminal needed: after adding SPOTIFY_CLIENT_ID and
// SPOTIFY_CLIENT_SECRET, open <worker url>/setup, approve on Spotify, and the
// page shows your refresh token. Add it as SPOTIFY_REFRESH_TOKEN. Once that
// secret exists, /setup and /callback switch themselves off.

const ALLOWED_ORIGINS = ['https://anir4tak.github.io', 'http://localhost:8765'];

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      Vary: 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname === '/setup' || url.pathname === '/callback') return setup(url, env);

    // serve from a 20-second cache so visitors don't hammer Spotify
    const cache = caches.default;
    const key = new Request(new URL('/now-playing', request.url).toString());
    const hit = await cache.match(key);
    if (hit) return withHeaders(hit, cors);

    let body;
    try {
      body = await nowPlaying(env);
    } catch (err) {
      body = { isPlaying: false, error: 'spotify_unavailable' };
    }
    const res = new Response(JSON.stringify(body), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=20' },
    });
    ctx.waitUntil(cache.put(key, res.clone()));
    return withHeaders(res, cors);
  },
};

async function nowPlaying(env) {
  const token = await accessToken(env);
  const r = await fetch('https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status === 204 || r.status > 400) return { isPlaying: false };
  const data = await r.json();
  const item = data.item;
  if (!data.is_playing || !item) return { isPlaying: false };
  const isEpisode = item.type === 'episode';
  return {
    isPlaying: true,
    title: item.name,
    artist: isEpisode ? item.show?.name : item.artists.map((a) => a.name).join(', '),
    album: isEpisode ? item.show?.name : item.album?.name,
    url: item.external_urls?.spotify,
    image: (isEpisode ? item.images : item.album?.images)?.at(-2)?.url ?? null,
    progressMs: data.progress_ms ?? null,
    durationMs: item.duration_ms ?? null,
  };
}

async function accessToken(env) {
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: env.SPOTIFY_REFRESH_TOKEN }),
  });
  if (!r.ok) throw new Error(`token ${r.status}`);
  return (await r.json()).access_token;
}

// ---------- one-time setup: get the refresh token in the browser ----------
const SCOPE = 'user-read-currently-playing user-read-playback-state';
async function setup(url, env) {
  const page = (msg) => new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
    `<body style="font:16px/1.5 system-ui;max-width:640px;margin:40px auto;padding:0 16px">${msg}</body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  if (env.SPOTIFY_REFRESH_TOKEN) return page('<h2>Already set up ✅</h2><p>This worker is connected to Spotify. Setup is switched off.</p>');
  if (!env.SPOTIFY_CLIENT_ID || !env.SPOTIFY_CLIENT_SECRET)
    return page('<h2>Almost there</h2><p>Add the secrets <b>SPOTIFY_CLIENT_ID</b> and <b>SPOTIFY_CLIENT_SECRET</b> to this worker first, then reload this page.</p>');
  const redirect = `${url.origin}/callback`;
  if (url.pathname === '/setup') {
    return Response.redirect('https://accounts.spotify.com/authorize?' + new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID, response_type: 'code', redirect_uri: redirect, scope: SCOPE,
    }), 302);
  }
  const code = url.searchParams.get('code');
  if (!code) return page(`<h2>Spotify didn't connect</h2><p>${escapeHtml(url.searchParams.get('error') || 'No code came back.')}</p>`);
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect }),
  });
  const data = await r.json();
  if (!data.refresh_token) return page(`<h2>Spotify said no</h2><pre>${escapeHtml(JSON.stringify(data))}</pre>`);
  return page(`<h2>Connected 🎵</h2>
    <p>Copy this token and add it to the worker as a <b>Secret</b> named <b>SPOTIFY_REFRESH_TOKEN</b>. Don't share it with anyone.</p>
    <textarea readonly rows="5" style="width:100%;font:14px monospace" onclick="this.select()">${escapeHtml(data.refresh_token)}</textarea>
    <p>After you add it, this page switches itself off.</p>`);
}
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function withHeaders(res, extra) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(extra)) out.headers.set(k, v);
  return out;
}
