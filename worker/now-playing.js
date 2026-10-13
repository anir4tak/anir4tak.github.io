// Cloudflare Worker: tells Topz's room what he is listening to on Spotify.
//
// Spotify only shares "currently playing" with an app that holds Topz's own
// login, and that login must never sit in the public website. So it lives here,
// as three secrets on the worker:
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
//
// GET /  →  { isPlaying: true, title, artist, album, url, image }
//        or { isPlaying: false }

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

function withHeaders(res, extra) {
  const out = new Response(res.body, res);
  for (const [k, v] of Object.entries(extra)) out.headers.set(k, v);
  return out;
}
