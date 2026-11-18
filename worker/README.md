# Now playing on the music box

The room can show what Topz is listening to on Spotify right now. Spotify only shares that with an app logged in as you, and that login can't go in the public site, so a tiny free Cloudflare Worker holds it. Until it's set up, the room says *"Topz is not listening to anything right now."*

No terminal needed. About 10 minutes, all in the browser.

## 1. Deploy the worker (Cloudflare)

1. <https://dash.cloudflare.com> → **Compute → Workers & Pages → Create → Start with Hello World** (or **Create Worker**). Name it `topz-now-playing`, **Deploy**.
2. **Edit code**, replace everything with the contents of [`now-playing.js`](https://raw.githubusercontent.com/anir4tak/anir4tak.github.io/master/worker/now-playing.js), **Deploy**.
3. Note the worker's URL, like `https://topz-now-playing.yourname.workers.dev`.

## 2. Create a Spotify app

1. <https://developer.spotify.com/dashboard> → **Create app**. Any name and description.
2. **Redirect URI**: your worker URL plus `/callback`, e.g. `https://topz-now-playing.yourname.workers.dev/callback`. Click **Add**.
3. Tick **Web API**, agree to the terms, **Save**.
4. Open **Settings**, copy the **Client ID**, click **View client secret** and copy it.

## 3. Add the secrets and connect

1. In the worker: **Settings → Variables and Secrets → Add**. Type **Secret**. Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`. **Deploy**.
2. Open `https://<your worker>/setup`, approve on Spotify. The page shows a token.
3. Add it as a third **Secret**, `SPOTIFY_REFRESH_TOKEN`, and **Deploy**. Setup switches itself off.
4. Open the worker URL. With music playing it shows `{"isPlaying":true,...}`.

## 4. Point the site at it

In `site/js/content.js` set:

```js
export const NOW_PLAYING_URL = 'https://topz-now-playing.yourname.workers.dev';
```

Commit and push. The music box now shows your track, the room dances while you listen, and the status strip says what's playing.

(`get-refresh-token.mjs` is the older terminal way to get the token; you don't need it.)
