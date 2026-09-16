(function(){
  "use strict";

  // Shrinks the hero title (text on 4 branches, the wordmark image on Home)
  // to fit its box instead of overflowing on narrow viewports.
  var titleEl = document.querySelector('h1.title');
  var titleLine = document.querySelector('h1.title .ent-line');

  function fitTitle(){
    if(!titleEl || !titleLine) return;
    titleEl.style.setProperty('--title-scale', '1');
    var containerWidth = titleEl.clientWidth;
    var textWidth = titleLine.offsetWidth;
    var scale = (textWidth > containerWidth && textWidth > 0) ? Math.max(0.3, (containerWidth / textWidth) * 0.97) : 1;
    titleEl.style.setProperty('--title-scale', String(scale));
  }
  window.addEventListener('resize', fitTitle);
  // On Home, the title is a logo <img> whose intrinsic size isn't known
  // until it loads — if fitTitle runs first, offsetWidth reads 0 and the
  // shrink math never engages. Re-measure once it's actually in. A no-op
  // on the other 4 pages, which have no #hero-logo element at all.
  var heroLogo = document.getElementById('hero-logo');
  if(heroLogo){ heroLogo.addEventListener('load', fitTitle); }
  fitTitle();

  // Below the orbit-nav's panel-switch breakpoint (max-width:1250px, see
  // styles.css) it's a horizontal band above .copy instead of a
  // right-docked side panel, so .col stays simply centered with no side
  // clearance to dodge. The band's wrapped height varies with label
  // text/width, so measure it instead of guessing a fixed offset for
  // .copy to clear.
  var heroWrap = document.querySelector('.hero-wrap');
  var orbitPanel = document.querySelector('.orbit-panel');
  function syncOrbitClearance(){
    if(!heroWrap || !orbitPanel) return;
    if(window.innerWidth > 1250){
      document.documentElement.style.removeProperty('--orbit-clear');
      return;
    }
    var wrapTop = heroWrap.getBoundingClientRect().top;
    var panelBottom = orbitPanel.getBoundingClientRect().bottom;
    var clearance = Math.ceil(panelBottom - wrapTop) + 20;
    document.documentElement.style.setProperty('--orbit-clear', clearance + 'px');
  }
  window.addEventListener('resize', syncOrbitClearance);
  syncOrbitClearance();

  // Desktop-only label contrast. mix-blend-mode:difference was tried
  // first (see styles.css) and reverted — tested directly and confirmed
  // it can't cross the stacking context position:fixed unconditionally
  // creates, so the label never actually blended against the real page
  // content behind it; it only looked right over navy by coincidence
  // (white blended against nothing still renders as plain white). This
  // does the same job by checking what's behind each label's own
  // position independently (not one check for the whole panel) — so as a
  // navy/white section boundary scrolls through the middle of the stack,
  // labels above and below it can show different colors at the same
  // time, matching what's actually behind each one. Desktop side panel
  // only — the mobile band already has its own solid/blurred backdrop
  // (see the max-width:1250px .orbit-panel rule in styles.css), so its
  // labels don't need this.
  var LIGHT_SECTION_SELECTOR = '.grid-section, .grid-intro';
  var orbitLabels = document.querySelectorAll('.orbit-label');
  var orbitContrastRaf = null;
  function syncOrbitContrast(){
    if(!orbitLabels.length) return;
    if(window.innerWidth <= 1250){
      for(var i = 0; i < orbitLabels.length; i++){ orbitLabels[i].classList.remove('on-light'); }
      return;
    }
    // Light-section rects are read once per frame here, then reused for
    // every label's check below — not re-queried per label.
    var lightSections = document.querySelectorAll(LIGHT_SECTION_SELECTOR);
    var lightRects = [];
    for(var i = 0; i < lightSections.length; i++){ lightRects.push(lightSections[i].getBoundingClientRect()); }
    for(var i = 0; i < orbitLabels.length; i++){
      var label = orbitLabels[i];
      var r = label.getBoundingClientRect();
      var probeY = r.top + r.height / 2;
      var onLight = false;
      for(var j = 0; j < lightRects.length; j++){
        if(lightRects[j].top <= probeY && lightRects[j].bottom >= probeY){ onLight = true; break; }
      }
      label.classList.toggle('on-light', onLight);
    }
  }
  function scheduleOrbitContrast(){
    if(orbitContrastRaf) return;
    orbitContrastRaf = requestAnimationFrame(function(){
      orbitContrastRaf = null;
      syncOrbitContrast();
    });
  }
  window.addEventListener('scroll', scheduleOrbitContrast, { passive: true });
  window.addEventListener('resize', scheduleOrbitContrast);
  syncOrbitContrast();

  // Smooth hero video loop: the native `loop` attribute (removed from the
  // markup) hard-cuts back to frame 1, which reads as a jump. Instead,
  // fade the video out, seek to 0 while it's invisible, then fade back in
  // — a brief cross-dissolve instead of a hard cut. Runs on whichever
  // hero video the current page has (one .sky video per page); doesn't
  // touch autoplay/muted, and doesn't touch transform at all, so it
  // composes cleanly with the scale/scaleY hero-framing rules already
  // applied to Earth/Mars/Saturn/Cortex's video in styles.css — opacity
  // and transform are independent properties, set by different code, on
  // different rules (this is inline style, framing is a CSS class rule).
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduceMotion){
    var FADE_MS = 400;   // within the requested 300-600ms range
    var LOOP_LEAD = 0.6; // start the fade this many seconds before the end

    document.querySelectorAll('.sky video').forEach(function(video){
      // True from the instant a fade-out starts until its fade-in (or, on
      // the no-fade fallback path, its immediate restart) finishes. Every
      // timeupdate firing inside that window is a no-op — this is what
      // stops one loop cycle from being restarted more than once.
      var isLooping = false;
      video.style.transition = 'opacity ' + FADE_MS + 'ms linear';

      function restart(withFade){
        if(isLooping) return;
        isLooping = true;
        var finish = function(){
          video.currentTime = 0;
          // Always call play() here, unconditionally — don't try to guess
          // whether the video still needs it. It's a harmless no-op per
          // spec if playback never actually stopped; it's required if the
          // fade's 400ms delay let the clip reach its real end and
          // auto-pause itself in the meantime (timeupdate's lead-in is a
          // deadline, not a guarantee — it can still cross the actual end
          // before this timer fires). Guessing via `video.paused` instead
          // of just always calling play() was what left it stuck two
          // rounds ago: whatever paused/stalled state it landed in near
          // that overlap, nothing was left to nudge it back to life.
          var p = video.play();
          if(p && p.catch){ p.catch(function(){}); }
          if(withFade){ video.style.opacity = '1'; }
          // Clear the guard synchronously — nothing here depends on an
          // event that isn't guaranteed to fire, so there's no way for
          // this to get stuck (a round-ago bug: gating the reset on
          // 'seeked', which can be dropped, left the guard stuck true
          // forever and disabled every future loop attempt, including the
          // 'ended' fallback below).
          isLooping = false;
        };
        if(withFade){
          video.style.opacity = '0';
          setTimeout(finish, FADE_MS);
        } else {
          finish();
        }
      }

      video.addEventListener('timeupdate', function(){
        if(isLooping || !isFinite(video.duration)) return;
        if(video.currentTime >= video.duration - LOOP_LEAD){
          restart(true);
        }
      });
      // Fallback: if timeupdate's granularity ever misses the lead window
      // (short clip, throttled background tab, etc.) and the video
      // actually reaches its end, `loop` being removed means it would
      // otherwise just stop on the last frame. Snap it back immediately
      // rather than leaving the hero frozen — worse than a hard cut is no
      // loop at all.
      //
      // The extra `video.ended` re-check (on top of `!isLooping`) guards
      // a narrower race than the flag alone can: this callback can end up
      // queued and not actually run until slightly after it fires — e.g.
      // right as the main thread is busy running the timeupdate-triggered
      // restart()'s own `finish` timer. If that happens, `isLooping` has
      // already been reset to false by the time this handler executes, so
      // the flag alone would wrongly treat this as a fresh, legitimate
      // end-of-clip and call restart(false) — yanking currentTime back to
      // 0 a second time in the middle of the fade-in that's already
      // playing out, which is the second glitch. Reading `video.ended`
      // fresh (rather than trusting that the event fired at all means
      // it's still true "now") reflects reality at the moment this code
      // actually runs: once the other restart() has already seeked back
      // to 0, `video.ended` is false again, so this correctly no-ops
      // instead of firing a redundant restart.
      video.addEventListener('ended', function(){
        if(!isLooping && video.ended){ restart(false); }
      });
    });
  }

  // Mobile autoplay fallback: the markup already sets muted, playsinline,
  // and autoplay directly (iOS Safari requires all three together), which
  // normally starts playback with no JS involved at all. Some mobile
  // browsers still land on a paused first frame with a play button
  // instead, in particular when the video hasn't buffered enough yet at
  // the moment autoplay is first attempted. This explicitly (re)requests
  // playback at a few points that reliably fire on mobile, on top of (not
  // instead of) the native attributes, without touching the crossfade
  // loop above.
  if(!reduceMotion){
    document.querySelectorAll('.sky video').forEach(function(video){
      video.muted = true;
      var tryPlay = function(){
        if(!video.paused) return;
        var p = video.play();
        if(p && p.catch){ p.catch(function(){}); }
      };
      tryPlay();
      video.addEventListener('loadedmetadata', tryPlay);
      video.addEventListener('canplay', tryPlay);
      document.addEventListener('visibilitychange', function(){
        if(!document.hidden){ tryPlay(); }
      });
    });
  }

  // Entrance animation: play once fonts are ready (or after a timeout
  // guard), then drop the animation classes so nothing keeps will-change
  // layers around after it's done.
  var html = document.documentElement;
  if(html.classList.contains('anim')){
    var settled = false;
    function playEntrance(){
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          html.classList.add('play');
          setTimeout(function(){
            html.classList.remove('anim', 'play');
          }, 2150);
        });
      });
    }
    if(document.fonts && document.fonts.ready){
      var guard = setTimeout(function(){
        if(!settled){ settled = true; playEntrance(); }
      }, 500);
      document.fonts.ready.then(function(){
        if(!settled){ settled = true; clearTimeout(guard); playEntrance(); }
      });
    } else {
      playEntrance();
    }
  }
})();
