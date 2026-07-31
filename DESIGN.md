# Design

Recorded from the built world, not from intention. Every value here was read
back out of `styles.css`, `src/cloth.js` or a measurement against rendered
pixels.

## The world

An Estonian **kirivöö**, a patterned woven belt, is a grid of binary decisions
made physical: every crossing is warp-over-weft or weft-over-warp, and the
pattern is the data. The page is that belt. The cloth is not an image or a CSS
pattern; it is geometry computed per pixel, and the client's aurora clip is the
light behind it, seen through the gaps between threads.

Seed key `b76edde2`, candidate 7 of 7, degraded roll (no challenger cards, no
quality-bar boards were reachable from the sandbox).

## Colour

| Token | Value | Role |
|---|---|---|
| `--night` | `#090F23` | The ground. **Fixed** — the mascot clip's black point was encoded to match it. Changing it breaks the mask. |
| `--deep` | `#05091A` | Behind the cloth, and the ticker. |
| `--cyan` | `#A5ECF4` | The bright thread. Brand commitment. 14.4:1 on night. |
| `--amber` | `#F2B24A` | The one warm thread. **Every action wears it and nothing else does.** 10.2:1 on night. |
| `--wool` | `#EEF3FA` | Display and emphasis. 17:1. |
| `--dim` | `#8794B4` | Body copy on dark. 6.3:1 on the panel ground. |
| `--dim-2` | `#5F6C8C` | Decorative only. Never text. |
| `--lite` / `--lite-ink` / `--lite-txt` | `#EDF1F7` / `#0A1024` / `#454F68` | The cloth's undyed reverse, used only by the FAQ. |

The belt's traditional madder red is deliberately absent: cyan is a confirmed
brand commitment and every photograph the client supplied is cold-lit.

**The amber rule.** Amber is reserved for actions, index numerals and notation
marks. Two ornaments took it during the build (a footer rule, a pull-quote bar)
and both were returned to cyan. If a new amber mass appears that is not
clickable, it is a defect.

## Type

Two families, both self-hosted in `fonts/` as variable woff2 with latin and
latin-ext subsets. Google Fonts is not requested: one fewer round trip, and no
third-party font call from an EU company's site.

- **Archivo**, `wght 100–900`, `wdth 62–125`. Display and body. The width axis
  is the point: it is thread tension made typographic, and the hero headline
  animates from `wdth 74` to `115` on entry.
- **Martian Mono**, `wght 100–800`, `wdth 75–112.5`. Notation only: plates,
  captions, addresses, index numbers, the ticker.

Display is set in wide caps at `wdth 106–118` and `wght 690–740`. Long-form
statements invert this: `wght 270–340` at `wdth 94–98`.

## Structure

Two section kinds, and the difference is whether the cloth shows.

- **`.open`** — the cloth is the ground. Hero, statement, photo bands, contact,
  footer. Each carries a `::before` scrim, near opaque under the text column
  and clearing on the side where the pattern is meant to be read.
- **`.pnl`** — a woven panel for reading. `rgba(9,15,35,.855–.915)`. This
  number is **bounded upward by measured contrast**, not by taste: at `.80` the
  body copy in Who We Are measured 4.42:1.
- **`.selv`** — the belt's own edge. One continuous 27px repeating gradient,
  cyan-cyan-amber at `.5`, with a dark-on-light variant after the FAQ.

## The cloth (`src/cloth.js`)

One WebGL2 fragment shader, instantiated twice.

- Warp and weft are cylinders: height `sqrt(1 - e²)` across the thread, with
  **analytic normals** leaning along each thread's own cross axis, a diffuse
  term, a 26th-power specular, and two anisotropic noise octaves for fibre.
- `mod(gi.x + gi.y, 2.0)` decides which thread is on top at every crossing.
- `motif()` is an eight-point diamond (ring, centre pip, spurs) on an 18×18
  thread repeat; `stripe()` puts one amber guard thread every 18 rows.
- Uniforms: `uWeave` (the cloth weaves itself in on load), `uOpen` (scroll
  loosens it: thread count 58→46, half-width `.452→.315`), `uLight`, `uPtr` +
  `uPtrOn` (the pointer drags the weave toward it and opens it around the
  dent), `uRev` (the undyed reverse), `uTex` (the aurora).
- The aurora is uploaded as a video texture each frame and read through the
  gaps with a parallax offset of `(uv-0.5)*0.05*gap`, plus a `rim` term that
  leaks light around every thread. This is what makes the cloth read as backlit
  rather than printed.
- The second instance runs `reverse:true` behind the FAQ: same geometry,
  undyed wool colours, no backlight, and it pauses when off screen.

Fallback: `html.nogl` swaps in two radial gradients. Every section stays
readable.

## Motion

Anime.js v4, bundled with the app (`app.js`, ~39 KB gzipped including
everything). It earns its place on the hero timeline, `splitText` plus the
width axis, `createAnimatable` for the magnetic actions and the horizontal
belt, and `onScroll` for the footer wordmark.

**Reveals never touch the animation engine.** `requestAnimationFrame` does not
fire in a background tab, so anything gated on it can leave the page blank.
Reveals are an IntersectionObserver adding a class to a CSS transition, plus a
sweep on scroll for elements a fast jump carried past the viewport between two
observer computations.

Solutions run as a pinned horizontal track on desktop and a scroll-snap swipe
track on a phone. Reduced motion collapses every position change and drops the
mascot clip back to its poster.

## Rules that are not obvious

1. **`--night` is load-bearing.** The mascot clip's black point matches it. Do
   not retune it without re-encoding the clip.
2. **`setLang` writes `textContent`.** Any link inside a translated string is
   destroyed. Links live in their own element. And `splitText` must be
   reverted *before* new text is written, or `revert()` restores the previous
   language.
3. **A `<video>` used as a GL texture must be in the document.** A detached
   element decodes unreliably; park it at 2×2px, `opacity:0`, `aria-hidden`.
4. **No fixed `mix-blend-mode` layer over the canvas.** It composites
   unpredictably. Grain lives inside the shader and inside the panels.
5. **No imitation material.** A CSS gradient standing in for weave was removed
   during review. If the page needs cloth somewhere, render the cloth.
6. **Contrast is measured, not assumed.** The panel opacities and three text
   colours in this file were set by hiding the text layer, screenshotting the
   background, and compositing the text colour over the sampled extremes.

## Known open

- The cloth is effectively absent through the mid-band of the five `.pnl`
  sections (measured texture amplitude σ 1.3–2.7 against σ 15.6 on `.open`).
  A section-wide scrim is the wrong instrument; local per-block scrims or
  luminance-modulated panel opacity would let the panels sit near `.80`.
- A hard vertical seam at the right edge of `.ct-form`, ΔL ≈ 8 with a 3×
  texture step and no transition.
- The contact section's cloth was dimmed to `.46` to soften that seam, which
  leaves it poorer in the page's own material than it was.
