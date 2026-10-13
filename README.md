# Topz's room

**[anir4tak.github.io](https://anir4tak.github.io)** — a pixel-art portfolio. No scroll, no nav bar: just a room. Click things.

| Click | What happens |
|---|---|
| The wide or portrait monitor | Projects — WordPress sites built with Elementor and ACF |
| Shelf doors (About me · Projects · Contact) | The door swings open and the panel opens. The phone lives behind the Contact door and still rings now and then |
| Books on top of the shelf | Says something |
| PC tower | Cycles the RGB lighting |
| Either window | Opens and closes the curtains. Shows Iloilo's time of day and its real weather (rain, storms, clouds, fog). |
| Light bulb | Switches the ceiling light on/off — the room warms up and brightens, most noticeably at night |
| Topz | Says something. His chair rolls about on its own |
| Mochi | Wakes up, or says hi |
| Jukebox | Shows what Topz is listening to right now (see `worker/README.md`), and plays his playlists. While music plays, the jukebox lights up, Topz nods along and taps his foot. |
| Katana rack | Three display swords (original designs) |
| Coffee mug | Topz grabs it, takes two sips with his head tipped back, and puts it back. A coffee line, then a sip line (with specials for coffee #3, #5 and #10). He also has coffee on his own now and then |
| Stress ball alien (beside the mug) | Topz picks it up and squeezes it three times (eyes bulging), then puts it back. He vents about a dev problem and the alien complains. He also grabs it on his own now and then. Milestones at 10, 25, 50 and 100 squeezes |
| Water bottle | Topz takes a sip (he also does on his own) |
| Aircon | On/off |
| Straw hat | Hangs on the chair; says something |
| Treasure chest | Opens with a sparkle and pops out a random find, each with its own line (the golden rubber duck is rare) |
| Cockroach, mouse, frog, spider, green butiki | They roam the room. Click them. |

The buttons under the room (or keys **1–4**) open the same panels, so everything works without hunting.

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
