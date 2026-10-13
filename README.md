# Topz's room

**[anir4tak.github.io](https://anir4tak.github.io)** — a pixel-art portfolio. No scroll, no nav bar: just a room. Click things.

| Click | What happens |
|---|---|
| Framed pictures or the two monitors | Projects — WordPress sites built with Elementor and ACF |
| PC tower | Cycles the RGB lighting |
| Cork board | About me |
| Bookshelf | Skills |
| Teal phone | Contact (it rings now and then) |
| Window | Opens and closes the blind. The sky follows *your* local time. |
| Topz | Says something |
| Mochi | Wakes up, or says hi |
| Jukebox | Plays my Spotify playlists. While music plays, the jukebox lights up and Topz nods along. |
| Katana rack | Three display swords (original designs) |
| Mug | This MEETING should have been an EMAIL |

The buttons under the room (or keys **1–5**) open the same panels, so everything works without hunting.

## How it's built

Plain HTML, CSS and JavaScript — no framework, no build step. The whole room is drawn on a 320×180 canvas from code in `site/js/scene.js` (sprites are strings, one character per pixel) and scaled up with nearest-neighbour so the pixels stay crisp.

```
site/
  index.html
  style.css
  js/scene.js     the room: drawing, animation, click targets
  js/content.js   all the text, skills, projects and links — edit this to update the portfolio
  js/app.js       layout, panels, hotbar, status strip
  assets/         project screenshots and skill logos
```

Run it locally with any static server:

```
cd site && python3 -m http.server
```

## Deploying

Pushing to `master` runs `.github/workflows/deploy.yml`, which publishes `site/` to the `gh-pages` branch that GitHub Pages serves.
