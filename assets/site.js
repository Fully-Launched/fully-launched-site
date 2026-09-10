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
