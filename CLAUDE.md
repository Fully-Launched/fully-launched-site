# Fully Launched Marketing Site — Rebuild Notes

Handoff context for continuing this in Claude Code. This `index.html` was
edited in a chat session starting from the previous single-page site.

## What changed in this pass

- **Header removed.** Nav bar/hamburger deleted. The FL logo is now a single
  `<button id="site-logo">`, repositioned via `body[data-home]`:
  large + centered at the top of the Home hero, small + top-right corner on
  every other branch.
- **Side "orbit" nav added.** `#orbit-nav` is a vertical list (not fixed —
  it's `position:absolute` inside `.hero-wrap`, so it scrolls normally and
  visually hangs past the hero fold into the first detail section). Shows
  thumbnails for the 4 non-active branches; click = switch + scroll.
- **5 branches wired in JS (`PLANETS` object):**
  - `earth` → Home/About, video, `detailId: detail-earth`
  - `mars` → Websites, video, `detailId: detail-mars`
  - `venus` → E-Commerce/Marketplace, video, `detailId: detail-venus`
  - `saturn` → Social, **placeholder** (no video asset), `detailId: detail-saturn`
  - `cortex` → AI Integration, **placeholder** (no video asset), `detailId: detail-cortex`
- **Video reuse caveat:** there were only 3 real video/still assets in the
  original file. I reused them across earth/mars/venus by remapping labels —
  the actual video *content* doesn't necessarily match its new branch theme.
  **Needs real Earth/Mars/Venus-themed clips before launch.**
- **Saturn & Cortex have no visual asset at all** — orbit-nav renders an emoji
  in a gradient circle (`.orbit-btn .ph`) and the hero background falls back
  to a plain gradient (no video/still). Needs real media.
- **About Us folded into Home** (`detail-earth`) instead of being a separate
  tab/panel — team bios kept, just living under the Home branch now.
- **Pricing stripped** from Websites and Social detail sections. Copy
  rewritten to be feature-based, no `$` figures, no tier price cards.
- **Footer CTA** → "Chat with us →" linking to `cal.com/luke-bothun`
  (`target="_blank" rel="noopener"`), replacing the old `mailto:` link.
- **Tab title** → "Fully Launched". Favicon untouched.

## NOT done yet (explicitly deferred per Luke)

1. **Split into separate pages** — home / social / websites / e-commerce.
   Currently everything is still one long-scroll single page with all detail
   sections stacked. This needs real routing/build-out.
2. **Reformat the bottom/footer text** — the `.foot-meta` row (email,
   response-time, copyright) hasn't been touched beyond the CTA link swap.

## Known risk / needs verification

- This was edited via text-based find/replace across a 950-line file with
  several huge inline base64 images (favicon, logo, 3 team headshots). Tag
  balance was checked programmatically and passes, but **actual rendering in
  a browser has not been verified**. Check:
  - Orbit-nav positioning/overlap at various viewport sizes (only the
    desktop/tablet/phone breakpoints inherited from the old hero CSS were
    reused — no new responsive rules were added for `.orbit-nav` beyond one
    `@media (max-width:820px)` block).
  - `body[data-home]` logo transition on first load (default HTML doesn't
    set the attribute — JS sets it on `show('earth')` at load, so there
    should be no flash, but worth a visual check).
  - The dead/unused nav CSS (`.site-nav`, `.nav-links`, `.nav-burger`,
    `.planet`, `.planet-l/-r`, `.label`, `.pricing-grid`, `.price-card`) is
    still in the `<style>` block, just unused. Safe to delete once confirmed
    nothing references it, but left in place to minimize risk during this
    edit.

## Suggested next steps in Claude Code

1. Drop this file into `~/Desktop/Files/Dev/FL/fully-launched-site`
   (`launch` alias), diff against the last committed version.
2. Open in a browser / dev server, visually verify hero, orbit-nav scroll
   behavior, and the Home page logo size transition.
3. Source or generate real Saturn/Cortex assets (video or image) and swap
   in the `PLANETS.saturn` / `PLANETS.cortex` entries + orbit-nav thumbnails.
4. Confirm Earth/Mars/Venus video assets are actually correct thematically,
   or get new ones and reassign in the `PLANETS` object + the three
   `<video data-planet="...">` elements in the hero markup.
5. Tackle page-split and footer reformat as separate follow-up work.
6. Once satisfied, commit and push.
