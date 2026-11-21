# Vice Nights Cover Lab

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/c/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/rohanajesika/gta6-cover-art-01-r2/rank.svg)](https://make.fun/c/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/rohanajesika/gta6-cover-art-01-r2/reward.svg)](https://make.fun/c/gta6-cover-art-01)

A GTA 6-style cover art maker for the [make.fun gta6-cover-art-01 bounty](https://make.fun/c/gta6-cover-art-01).
Turn your own photo and a caption into a multi-panel poster cover, and export it as a PNG to share.

## What it does

- **Your photos, your panels** — load a photo into each panel from your machine
  (file picker or drag-and-drop). Fill several panels with one photo or use
  several. Drag a panel to pan it, scroll or use the slider to zoom.
- **Three poster layouts** — Split (2 panels), Triptych (3 panels),
  Hero (one big panel + two small).
- **Editable caption** — a main title and a tagline, drawn in a bold condensed
  display face. The lettering is drawn by the app itself from vector strokes
  (`app/lettering.js`); there are no font files in this repository.
- **Four colour grades** — Vice Sunset, Neon Nights, Teal Heat and Noir,
  each with its own title gradient, wash and title-band colours.
- **Poster sizes** — export a PNG in 1080×1080, 1080×1350 or 1920×1080.
- **Fully offline** — static files under `app/`, no build step, no network
  request. Photos are read on your machine and never uploaded.

## Try it

Serve `app/` with any static server and open `index.html`, for example:

```sh
python3 -m http.server 8080 --directory app
```

then open http://localhost:8080 in desktop Chrome. Click **Load sample photos**
to try it with the two procedural sample photos in `app/samples/`, or upload
your own.

## Layout of this repository

- `app/index.html` — the editor page
- `app/style.css` — the editor chrome
- `app/app.js` — editor state, panel crop/zoom, cover renderer, PNG export
- `app/lettering.js` — the stroke-based vector display face (A–Z, 0–9, punctuation)
- `app/samples/` — two original procedural photos made for this entry
  (`sunset.png`, `neon.png`)
- `screenshots/` — the cover and editor screenshots for the entry
  (`1-cover.jpg` and `3-cover-wide.jpg` are the app's own PNG exports scaled
  down and saved as JPEG, which the rules allow; `2-editor.png` is the
  editor in the browser)
- `main.ts` — the entry program: copies `app/` + `screenshots/` to the output
  directory and writes `dossier.json` with `buildDossier`
- `vendor/makefun-app.ts` — make.fun's app library, copied unchanged from the kit

## Build the output (for the grader)

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE). Fan-made poster style; not affiliated with
Rockstar Games. No Rockstar logo, artwork or font is used anywhere in this entry.
