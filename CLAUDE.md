# Fully Launched Website Rebuild — Build Spec

## Repo
`fully-launched-site` (existing). This replaces the current single `index.html`.

## Architecture decision
**Static multi-page HTML/CSS/JS. No framework.**
Reasoning: this is a marketing site with heavy custom animation (video crossfades, planet zoom). A React/Next.js runtime adds bundle weight that works against the "still load fast" goal. Vercel serves clean URLs automatically from a folder structure, no config needed.

To avoid hand-editing the header/nav in 5 separate files every time it changes, use a tiny build step (11ty, or a ~30-line Node script) that injects shared `header.html` / `footer.html` partials at build time. Output is still 100% static HTML shipped to the browser, zero runtime cost. Do not use this for anything beyond header/footer/shared partials, keep it minimal.

## URL structure
```
/                    → home (Earth)
/websites/           → Mars
/media/              → Saturn (placeholder still image, no video yet)
/marketplace/        → Mercury
/ai-integration/     → 4th branch, planet TBD (use a placeholder/dim planet icon for now)
```
Each is a folder with its own `index.html` so Vercel resolves the clean URL.

## Header (all pages)
- Left: new white FullyLaunched logo (asset needed, see Open Items)
- Right nav: Home, Websites, Media, Marketplace, About Us, Book a Call
- Reuse existing `.site-nav` CSS pattern from current file as the base.

## Home page (`/`)
- Full-bleed Earth video as hero background (reuse existing `.sky video` autoplay/loop/muted/playsinline pattern).
- **Planet panel change:** currently only 2 side slots (left/right) alternate between planets. New spec: all non-home planets (Media/Saturn, Websites/Mars, Marketplace/Mercury, AI Integration/placeholder) sit stacked on the **right side only** as a panel of selectable thumbnails.
- Clicking a planet thumbnail: zooms that planet in (scale/opacity transition, reuse `.planet:hover{transform:scale()}` pattern as the base, extend to a full "zoom to fill" transition), then navigates to that branch's URL (`/websites/`, `/media/`, etc.).
- **Confirmed:** Earth is a 5th clickable thumbnail in the right-side panel alongside Media/Websites/Marketplace/AI Integration. On the home page, Earth's thumbnail is the "current/active" state (already zoomed in, since it's the hero). Clicking it elsewhere on a branch page should route back to `/`.

## Branch pages (`/websites/`, `/media/`, `/marketplace/`)
- Each page's hero = that branch's planet video, full-bleed, same autoplay/loop treatment as current homepage Earth.
- Port existing copy from current `index.html` sections:
  - `#detail-websites` → `/websites/`
  - `#detail-marketplace` → `/marketplace/`
  - `#detail-social` → `/media/` (this was "social" in the old file, now Media/Saturn)
- `/media/` ships with a static still image instead of video until the Saturn clip is delivered. Build the video slot so dropping in the real file later is a one-line asset swap, no code change.
- `/ai-integration/` has no existing content section to port. Needs new copy from Luke before launch, scaffold the page structure and placeholder content now.

## Video loop fix ("skip back to start")
Native `loop` attribute hard-cuts if frame 1 and the last frame don't match. Two-part fix:
1. **Code:** implement a crossfade buffer, two `<video>` elements of the same clip, when the first nears its end, fade in the second (already reset to frame 0 and playing) over ~0.3–0.5s, then swap which one is "active." Masks an imperfect loop point.
2. **Footage:** flag to Luke that the real fix is authoring/trimming clips so the last frame visually matches the first. Shorter clips (per his note) make this easier to nail. Code crossfade is a mitigation, not a substitute.

## Performance budget
Current single-page file is 767KB, largely from an embedded base64 favicon/logo. Fixes for the rebuild:
- No embedded base64 images. Real files, browser-cached, served from `/assets/img/`.
- Videos stay externally hosted (CloudFront, as they already are), never inline.
- Only the active page's hero video loads with `preload="auto"`. Other planet thumbnails on that page use `preload="none"` and prefetch on hover/focus (reuse existing `warm()` function pattern).
- Poster image (compressed still frame) shown before video paints, so first paint isn't blocked on video download.
- Compress every clip; target under ~2–3MB per hero video at delivered resolution. Revisit if Saturn/AI clips come in heavier.
- Target Lighthouse Performance score 90+ on each page (mobile throttled).

## Open items (need from Luke before/parallel to build)
- Logo asset: white version for header
- AI Integration branch copy (services, pricing tiers if any)
- AI Integration planet choice (placeholder until decided)
- Saturn video clip (Media page ships with static image until delivered)
- Confirm Earth's role in the home planet panel (see ambiguity flagged above)

## Explicitly out of scope for this build
- Any framework migration (Next.js, etc.)
- CMS or dynamic content
- Multi-channel/marketplace sub-pages beyond the single `/marketplace/` page
