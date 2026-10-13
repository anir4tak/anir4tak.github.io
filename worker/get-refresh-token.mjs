// One-time helper: run on your own computer to get the Spotify refresh token
// the worker needs.
//
//   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node worker/get-refresh-token.mjs
//
// It opens a tiny local server on http://127.0.0.1:8888, prints a link to log in
// with Spotify, and prints your refresh token after you approve. Keep that token
// secret: it lets the worker read what you're listening to.

import http from 'node:http';

const id = process.env.SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}
const redirect = 'http://127.0.0.1:8888/callback';
const scope = 'user-read-currently-playing user-read-playback-state';

const login = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
  client_id: id, response_type: 'code', redirect_uri: redirect, scope,
});

http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') { res.writeHead(302, { Location: login }); return res.end(); }
  const code = url.searchParams.get('code');
  if (!code) { res.end('No code from Spotify: ' + (url.searchParams.get('error') || 'unknown error')); return; }
  const r = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect }),
  });
  const data = await r.json();
  if (!data.refresh_token) { res.end('Spotify said: ' + JSON.stringify(data)); return; }
  res.end('Done! Go back to your terminal.');
  console.log('\nYour SPOTIFY_REFRESH_TOKEN:\n\n' + data.refresh_token + '\n');
  process.exit(0);
}).listen(8888, '127.0.0.1', () => {
  console.log('Open this link and log in with Spotify:\n\n  http://127.0.0.1:8888\n');
});
