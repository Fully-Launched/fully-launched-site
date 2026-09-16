# Fully Launched Marketing Site — Project Notes

## Architecture

5 static pages, Vercel clean-URL folder convention:
- /index.html (Home)
- /social/index.html
- /websites/index.html
- /ecommerce/index.html
- /ai/index.html

Shared assets:
- /assets/styles.css — original dark-theme system (hero, orbit-nav, footer)
- /assets/light-theme.css — newer light-grid system (see below), self-contained by design, doesn't reference styles.css variables
- /assets/site.js — hero video crossfade loop, entrance animations, orbit-nav logic (now includes scroll-based per-label contrast detection, see Orbit-nav below)
- /assets/tilt.js — mouse-tilt effect for photos. **CONFIRMED NOT DONE**: this file does not exist, and nothing references it in any page. Ported-from-React description below is the plan, not a completed state — see Not Yet Done.
- /assets/videos/ — hero background videos + poster stills (Earth/Mars/Venus via external CDN URLs baked into markup; Saturn/Planet are local files in this folder, served via Vercel's own CDN)
- Team photos, rocket logo, orbit-nav icons are real files under /assets/, not base64

## Two visual systems, mid-migration

The site has TWO content-section systems running side by side:
1. **Original dark-theme** (styles.css): navy background only, used by whatever content hasn't been migrated yet.
2. **New light-grid system** (light-theme.css): alternating navy-block / white-grid-section pattern, .lp-headline typography (plain line + tan italic second line), .why-card cards, Jost + Libre Baskerville fonts, canvas-based grid background animation.

**Current migration status:**
- Home: fully migrated (What we do → About Us/Meet the Team → Testimonials → Closing CTA → footer)
- E-Commerce: fully migrated (grid-intro → navy problem → grid "why us" → navy "how it works" → grid closing CTA → footer)
- Websites, Social, AI Integration: still hero-only, no built-out content sections. Full content prompts are written and ready to run (ask the user, they have them saved from the previous chat) — this is the single biggest remaining piece of work.

**Rule for all content sections:** starts NAVY (directly after the hero), strictly alternates navy/white-grid, ends WHITE, so the transition into the navy footer is white-into-navy, never navy-into-navy. This means an EVEN total section count. (Earlier version of this doc said "odd count, ends navy," that was wrong, corrected here. Home and Websites both correctly follow this; E-Commerce does not yet and is a known pending fix, not urgent.) No pricing/$ anywhere. Reuse the Liftoff/Orbit/Stratosphere & Beyond tier-card format (numbered 01/02/03, no pricing) wherever tiers are needed.

## Orbit-nav (planetary panel)

5 branches: Home (Earth), Websites (Mars), E-Commerce (Venus), Social (Saturn), AI Integration (Cortex/Planet). Real page links, not JS state-swapping.

- Desktop (>1250px): vertical right-docked panel, circles + labels, active item gets tan border/glow
- Mobile/narrow (<=1250px): horizontal top band, circle above label, E-Commerce/AI use short labels ("E-Comm", "AI") in this tier only
- Saturn's icon is intentionally NOT a circle — wider ellipse so rings extend left toward the label without shrinking the planet body. Do not "simplify" this without understanding why.
- Brand tan: #C4AB82, via --cyan CSS variable (legacy name, tan value)
- **CONFIRMED WORKING**: orbit-nav is now position:fixed on both tiers, persists across full page scroll (not just the hero), confirmed via screenshot on Home.
- **CONFIRMED WORKING**: mobile top band has backdrop-filter blur so scrolling content doesn't visually cut through it (built alongside the sticky-scroll fix).
- **CONFIRMED WORKING, desktop only**: label contrast against navy vs. white sections. mix-blend-mode was tried and PROVEN IMPOSSIBLE (position:fixed creates a new stacking context, blend-mode can't cross it — verified via isolated test, don't retry this approach). Fixed instead via JS: site.js checks each .orbit-label's own position against underlying section boundaries on scroll (rAF-throttled), toggling .on-light per-label independently — each label resolves its own color as section boundaries scroll past, they don't all switch together. min-width:1251px guard, mobile band unaffected (relies on its own blur/tint background instead).
- **CONFIRMED WORKING**: Saturn's active-state ring is a clean circle matching the other 4 planets, not stretched to its wider elliptical container — verified directly against assets/styles.css: no `.orbit-planet[data-planet="saturn"].is-active` or `:focus-visible` override exists, so it correctly falls through to the generic `.orbit-planet.is-active` circular rule.

## Hero videos

All 5 branches have real video: Earth/Mars/Venus via external CDN, Saturn/Planet as local files. All loop via JS crossfade (NOT native `loop` attribute — this was a multi-round bug, see Known Issues #1). Earth/Mars/Saturn have CSS transform reframing (scaleY or translateY) to push the horizon down from raw footage framing; Cortex/AI's reframing state has changed hands multiple times this session — verify current state in the code, don't assume either way.

## Tilt effect (not yet built)

Planned: port a mouse-tracked 3D tilt effect (perspective + rotateX/rotateY, max 16deg) plus a radial-gradient sheen following the cursor, from a React component (Grad Gig project) into vanilla JS at /assets/tilt.js. Skip touch/coarse-pointer devices. Scope: team photos (.team-card2) and future "who you'll work with" staff photos ONLY — never hero videos/images or other figures, and never add it anywhere preemptively; the user flags specific photos.

**Confirmed as of this note: /assets/tilt.js does not exist, and no page references it. This has not been started, despite earlier phrasing in project history that described it in the past tense.**

## Footer

Identical across all 5 pages (verify by diff if touched). Cin7-style layout: logo + "© FullyLaunched" + "Made in Chicagoland" tagline + Legal/Privacy links (placeholder # hrefs) on the left, divider, Instagram (instagram.com/fully.launched) + LinkedIn (linkedin.com/company/fully.launched) icon buttons on the right. Dark navy (#04101f, the original dark navy, not --lp-navy). NO CTA content belongs in the footer — explicitly removed, moved to page-level closing CTAs instead.

## Known issues / lessons learned (read before assuming something needs fixing)

1. **Verification claims in this project have repeatedly been wrong**, most notably the video loop (4+ rounds to actually fix) and an early mix-blend-mode attempt that was reported without testing and turned out technically impossible. The pattern that works: form a hypothesis, test it in isolation, report findings with evidence, then act — not "implemented, verified working" without actually checking.
2. **Do not use headless Chrome / CDP browser automation for verification** unless the user explicitly asks for it in that specific prompt. Standing instruction, violated multiple times earlier. Default to reasoning through CSS/DOM/timing by hand; ask the user to check visually when analytical verification isn't possible. **Also: when the user explicitly says "don't render or check anything yourself, I'll check it" — follow that literally, don't verify at all, not even via non-headless means.**
3. **Stale dev servers have caused real confusion** — multiple stray `python -m http.server` processes on old ports (8123, 4173, 8934) served stale content mid-session. Current server: localhost:8765. If something "already fixed" looks wrong, check for stray servers/cache before assuming the fix failed.
4. **"Already fixed" content has genuinely reverted or never landed more than once** (team bios, About Us intro block). Verify actual current file content when told something was already done.
5. Cache: bump `?v=N` query strings when changes don't seem to take effect, tell the user to hard-refresh.

## Explicit content rules

- No em-dashes anywhere in site copy, ever
- No invented testimonials, client names, or traction/results numbers — always clearly-marked placeholders like "[Client testimonial coming soon]"
- Team bios: Fully Launched only, never mention Grad Gig, Elevate Innovations, or Peak Essentials Inc.
- No pricing/dollar figures anywhere on the site

## Not yet done

- Content build-out for Websites, Social, AI Integration (prompts written and ready, user has them)
- Build /assets/tilt.js and wire it to team photos (confirmed not started, see Tilt effect above)
- Real Legal/Privacy Policy pages (footer links currently placeholder #)
- Dead CSS cleanup (old .team-card2/.about-hero dark-theme rules unused on Home, low priority)
