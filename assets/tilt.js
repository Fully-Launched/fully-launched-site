/* Mouse-tracked 3D tilt effect, ported from a React TiltCard component
   (Grad Gig) into vanilla JS. Scans for .tilt-target on load and wires
   each one up — callers just add the class, no manual per-element JS. */
(function(){
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  var MAX_TILT = 16;

  function attach(target){
    // .tilt-target is applied directly to <img> elements, which can't
    // have children, so the sheen overlay is injected into the parent
    // instead — see the CSS comment (styles.css) for why that lines up.
    var mount = target.tagName === 'IMG' ? target.parentElement : target;
    if (!mount) return;

    var sheen = document.createElement('div');
    sheen.className = 'tilt-sheen';
    sheen.setAttribute('aria-hidden', 'true');
    mount.appendChild(sheen);

    var pendingFrame = null;

    function apply(px, py){
      var rotateY = (px - 0.5) * MAX_TILT;
      var rotateX = (0.5 - py) * MAX_TILT;
      target.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      sheen.style.setProperty('--sheen-x', (px * 100) + '%');
      sheen.style.setProperty('--sheen-y', (py * 100) + '%');
      sheen.style.setProperty('--sheen-opacity', '0.6');
    }

    target.addEventListener('mousemove', function(e){
      var rect = target.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width;
      var py = (e.clientY - rect.top) / rect.height;
      if (pendingFrame !== null) return;
      pendingFrame = requestAnimationFrame(function(){
        pendingFrame = null;
        apply(px, py);
      });
    });

    target.addEventListener('mouseleave', function(){
      if (pendingFrame !== null){
        cancelAnimationFrame(pendingFrame);
        pendingFrame = null;
      }
      target.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)';
      sheen.style.setProperty('--sheen-opacity', '0');
    });
  }

  function init(){
    var targets = document.querySelectorAll('.tilt-target');
    for (var i = 0; i < targets.length; i++) attach(targets[i]);
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
