# Now playing on the jukebox

The room can show what Topz is listening to on Spotify right now. Spotify only shares that with an app logged in as you, and that login can't go in the public site, so a tiny free Cloudflare Worker holds it. Until it's set up, the room simply says *"Topz is not listening to anything right now."*

Setup takes about 10 minutes.

## 1. Create a Spotify app

1. Go to <https://developer.spotify.com/dashboard> and log in.
2. **Create app**. Any name and description. Set the **Redirect URI** to `http://127.0.0.1:8888/callback`. Tick **Web API**. Save.
3. Open the app's **Settings** and copy the **Client ID** and **Client secret**.

## 2. Get your refresh token

On your computer (Node 18 or newer), from this repo:

```
SPOTIFY_CLIENT_ID=your_id SPOTIFY_CLIENT_SECRET=your_secret node worker/get-refresh-token.mjs
```

Open the link it prints, approve, and copy the refresh token from the terminal.

## 3. Deploy the worker

1. Sign up at <https://dash.cloudflare.com> (free plan is fine).
2. **Workers & Pages → Create → Create Worker**, name it `topz-now-playing`, **Deploy**.
3. **Edit code**, replace everything with the contents of `worker/now-playing.js`, **Deploy**.
4. **Settings → Variables and Secrets**, add three **Secrets**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`.
5. Open the worker's URL (like `https://topz-now-playing.yourname.workers.dev`). With music playing it shows `{"isPlaying":true,...}`.

## 4. Point the site at it

In `site/js/content.js` set:

```js
export const NOW_PLAYING_URL = 'https://topz-now-playing.yourname.workers.dev';
```

Commit and push. The jukebox now shows your track, the room dances while you listen, and the status strip says what's playing.
