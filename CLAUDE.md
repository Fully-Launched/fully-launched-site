# Fully Launched Marketing Site

Static multi-page site, structured for Vercel's clean-URL folder convention
(no build step, no framework).

## Structure

```
/index.html              → / (Home)
/social/index.html       → /social
/websites/index.html     → /websites
/ecommerce/index.html    → /ecommerce
/ai/index.html            → /ai
/assets/styles.css        shared stylesheet, linked from all 5 pages
/assets/site.js           shared JS, linked from all 5 pages
/assets/*.{png,jpg}       logo, team photos
```

Each page is a real, self-contained page: its own hardcoded hero (video/still,
lede, title or logo), its own single detail section below it, and an
identical footer. There is no client-side routing or state-swapping — the
old single-page version (`PLANETS` object, `show()`, JS-built orbit-nav)
was fully removed when the site was split into 5 pages.

All local asset references (`/assets/...`) and internal links (`/social`,
etc.) are root-relative so they resolve correctly regardless of the current
page's folder depth.

## Orbit-nav

The 5-item circular nav (`.orbit-panel` / `.orbit-nav`) is now plain
navigation: each item is a real `<a href="/...">`, not a JS click handler.
It's hardcoded per page in each page's own `<ul class="orbit-nav">` — the
current page's item carries `is-active` + `aria-current="page"`, set
directly in the HTML, no JS derivation.

- Above 1250px wide: vertical, right-docked column (`.orbit-panel` absolute,
  `right:0`), full label text ("E-Commerce", "AI Integration").
- At or below 1250px: horizontal band pinned above `.copy`, circle above a
  shortened label ("E-Comm", "AI") — `--band-scale` in styles.css scales
  circle size and label font-size continuously from a 390px-tuned floor up
  to ~1.65x at the 1250px edge, so it isn't cramped on a genuinely
  desktop-width browser window. `.copy`'s top offset in this range
  (`--orbit-clear`) is measured at runtime in site.js from the band's actual
  rendered height, not guessed.

Venus's still/poster and its orbit-nav icon are mirrored via
`body[data-planet="venus"]` / `.orbit-planet[data-planet="venus"]` — its
source render has the shadow on the wrong side.

## Known items

- The favicon (inline base64 PNG, ~60KB decoded, duplicated in each page's
  `<head>`) is oversized for a favicon and is the majority of each page's
  raw byte count (pages are otherwise ~5-6KB of actual HTML). Flagged, not
  changed — left inline per explicit instruction. Worth revisiting: a
  properly-sized (32-256px) favicon as a real `/assets/favicon.png` file
  would cut this substantially and let browsers cache it once across pages
  instead of re-downloading it inline on every navigation.
- Dead CSS from earlier site iterations (`.site-nav`/`.nav-links`/
  `.nav-burger`, the old two-slot `.planet`/`.planet-l/-r`/`.label` system,
  `.pricing-grid`/`.price-card`, `.compare`/`.table-wrap`) was removed
  during the split after confirming zero references anywhere in the HTML.
- Team headshots (Luke, Elias) were still base64-inlined as of the split;
  extracted to `/assets/luke.jpg` and `/assets/elias.jpg` at that point —
  all 4 team photos are now real files (Matteo/Tait already were).
