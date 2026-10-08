# Blog cover images

Every article in `blog/<source>/articles.json` has a 1200×630 cover image under `public/images/blog/`.
Covers are abstract generative art produced by `scripts/generate-blog-covers.mjs`: the script writes
an SVG, renders it with headless Chrome (so blur and glow filters look right), then crops and encodes
it with ImageMagick.

## Requirements

- Node.js
- Chrome or Chromium. The script tries `$CHROME_BIN` first, then `google-chrome`, `google-chrome-stable`,
  `chromium` and `chromium-browser` on `PATH`.
- ImageMagick (`convert` and `identify`)

## Adding a cover for a new article

1. Add the article to `blog/<source>/articles.json` with an `image` path:

   ```json
   {
     "id": "my-new-article",
     "title": "…",
     "subtitle": "…",
     "date": "20261008",
     "image": "/images/blog/my-new-article.jpg"
   }
   ```

   Use `.jpg` (about 5× smaller than PNG) unless you need `.png`. The script picks the format from the
   extension. If `image` is missing, it defaults to `/images/blog/<id>.png`. Only paths matching
   `/images/blog/*.png|jpg` are handled.

2. Run the script:

   ```sh
   node scripts/generate-blog-covers.mjs
   ```

   With no arguments, it generates covers only for articles whose image file doesn't exist yet. Each
   generated file is reported with its look:

   ```
   ✓ public/images/blog/my-new-article.jpg  [maze · palette 9 · light]
   ```

3. Open the image and check it. If you don't like it, pin a different look (see below) and regenerate.

## Command reference

```sh
node scripts/generate-blog-covers.mjs              # generate only the missing covers
node scripts/generate-blog-covers.mjs --force      # also regenerate every cover the script made before
node scripts/generate-blog-covers.mjs <id> [<id>…] # (re)generate these articles only
```

## Hand-made images are safe

Generated files carry the marker `frugaast-generated-cover` in their image comment metadata. The script
only writes a file if it is missing or carries that marker, so a hand-made image is never overwritten,
even with `--force`. If you name a hand-made image's id explicitly, the script prints a
`↷ skipping … hand-made image` warning. To replace a hand-made image with a generated one, delete the
file first.

To check whether an image was generated:

```sh
identify -format '%c\n' public/images/blog/my-new-article.jpg
```

## How a look is chosen

A cover's look has three parts:

- **motif**: one of `flow`, `ridges`, `rings`, `network`, `blocks`, `waves`, `truchet`, `bauhaus`,
  `circles`, `tunnel`, `halftone`, `contours`, `synthwave`, `spirograph`, `maze`, `bars`, `hexgrid`,
  `lowpoly`
- **palette**: an index from 0 to 15 into `PALETTES` (neon, sunset, mint, indigo, amber, lagoon, rose,
  lime, bauhaus, retro, cobalt, earth, memphis, phosphor, fire & ice, orchid)
- **theme**: `dark` (~45% of covers), `light` (~30%) or `color` (~25%, a dark tint of the palette's
  deep colour)

The script walks `articles.json` in order and assigns looks so that the covers vary:

- A motif isn't reused within the 8 previous articles, and the least-used motif wins.
- Keywords in the article id make some motifs preferred. For example `token|quota|cost` favours
  `ridges`, and `plan|spec|verification` favours `maze`. The `MOTIFS` table in the script lists them all.
- A palette isn't reused within the 6 previous articles, and the script avoids motif/palette pairs it
  has already used.
- The same theme never appears three times in a row, and the theme shares converge on the targets
  above.

All randomness is seeded from the article id, so the same id always gives the same picture.

Appending articles never changes existing covers. Inserting or reordering entries in `articles.json`
can change the looks assigned to the articles after the change. The files on disk only change if you
regenerate them (`--force` or explicit ids).

## Pinning a look

To fix a cover's look, add a `cover` field to the article. Any part you leave out is still chosen
automatically:

```json
{
  "id": "my-new-article",
  "image": "/images/blog/my-new-article.jpg",
  "cover": { "motif": "truchet", "palette": 9, "theme": "light" }
}
```

Then regenerate it:

```sh
node scripts/generate-blog-covers.mjs my-new-article
```

A pinned look still counts toward the variety rules, so it can change the looks chosen for the
articles after it.

## Anatomy of a cover

Each cover is built from these layers, from bottom to top:

1. a solid background colour, which depends on the theme
2. three large blurred colour blobs
3. a faint dot grid
4. the motif, drawn in the palette's colours. One element is usually picked out in the highlight
   colour, and it glows on the dark and color themes.
5. a light film-grain overlay
6. a vignette

Rendering opens the page in headless Chrome at `--window-size=1200,930` and crops it to 1200×630,
because headless Chrome reserves part of the window height. ImageMagick then encodes the result as JPEG
(quality 82, 4:4:4, progressive) or PNG (no timestamp or colour-profile chunks).

## Adding a motif

1. Write a function that takes the context
   `{ rand, noise, theme, c0, c1, hi, colors, ink, bg, glow }` and returns SVG markup for a 1200×630
   canvas (`W` × `H`). Always use `rand()` and `noise()`, never `Math.random()`, so the output stays
   deterministic. `url(#grad)` is a gradient from `c0` to `c1`, and `glow` is a filter attribute that is
   empty on the light theme.
2. Register it in `MOTIFS` with a keyword regex.
3. Adding a motif reshuffles the assignment, so check which covers you want to regenerate before running
   `--force`.
