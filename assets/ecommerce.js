(function(){
  "use strict";

  // Fixed grid background that bends near the cursor. Adapted from a
  // reference class-based implementation; kept as a plain IIFE since this
  // site has no build step / component framework. Defaults (spacing/
  // radius/strength) are the reference implementation's own starting
  // values — tune visually once running, not guessed here.
  //
  // Scoped to the canvas's own parent element (.grid-intro), not the
  // window/viewport: the canvas is position:absolute inside that section
  // (see light-theme.css), so every measurement here — pixel buffer size,
  // cols/rows, and the mouse position used for the bend math — is taken
  // against the container's own box, converting from viewport-relative
  // mouse coordinates into canvas-local ones.
  function BendingGrid(canvas, opts){
    opts = opts || {};
    this.canvas = canvas;
    this.container = canvas.parentElement;
    this.ctx = canvas.getContext('2d');
    this.spacing = opts.spacing || 40;
    this.color = opts.color || 'rgba(27,43,75,0.08)';
    this.radius = opts.radius || 160;
    this.strength = opts.strength || 24;
    this.mouse = { x: -9999, y: -9999 };
    this.resize = this.resize.bind(this);
    this.onMove = this.onMove.bind(this);
    this.tick = this.tick.bind(this);
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMove);
    this.resize();
  }
  BendingGrid.prototype.start = function(){
    this.raf = requestAnimationFrame(this.tick);
  };
  BendingGrid.prototype.destroy = function(){
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMove);
  };
  BendingGrid.prototype.resize = function(){
    var rect = this.container.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.cols = Math.ceil(rect.width / this.spacing) + 2;
    this.rows = Math.ceil(rect.height / this.spacing) + 2;
    if(this.staticRender){ this.draw(); }
  };
  BendingGrid.prototype.onMove = function(e){
    var rect = this.container.getBoundingClientRect();
    this.mouse.x = e.clientX - rect.left;
    this.mouse.y = e.clientY - rect.top;
  };
  BendingGrid.prototype.displaced = function(x, y){
    var dx = x - this.mouse.x;
    var dy = y - this.mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if(dist > this.radius) return [x, y];
    var falloff = 1 - dist / this.radius;
    var push = falloff * falloff * this.strength;
    var angle = Math.atan2(dy, dx);
    return [x + Math.cos(angle) * push, y + Math.sin(angle) * push];
  };
  BendingGrid.prototype.draw = function(){
    var ctx = this.ctx, spacing = this.spacing, cols = this.cols, rows = this.rows;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    var c, r, pt;
    for(c = 0; c <= cols; c++){
      ctx.beginPath();
      for(r = 0; r <= rows; r++){
        pt = this.displaced(c * spacing, r * spacing);
        if(r === 0){ ctx.moveTo(pt[0], pt[1]); } else { ctx.lineTo(pt[0], pt[1]); }
      }
      ctx.stroke();
    }
    for(r = 0; r <= rows; r++){
      ctx.beginPath();
      for(c = 0; c <= cols; c++){
        pt = this.displaced(c * spacing, r * spacing);
        if(c === 0){ ctx.moveTo(pt[0], pt[1]); } else { ctx.lineTo(pt[0], pt[1]); }
      }
      ctx.stroke();
    }
  };
  BendingGrid.prototype.tick = function(){
    this.draw();
    this.raf = requestAnimationFrame(this.tick);
  };

  // One independent grid per .grid-canvas found (Section 1's intro and
  // Section 3's "why fully launched" both have one) — each instance is
  // scoped to its own parent container, so they never interfere.
  var canvases = document.querySelectorAll('.grid-canvas');
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  canvases.forEach(function(canvas){
    var grid = new BendingGrid(canvas);
    // Fonts loading after first paint can change the section's natural
    // (content-driven) height — re-measure once they're in so the canvas
    // doesn't stay sized to a pre-font-load layout pass.
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(function(){ grid.resize(); });
    }
    if(reduceMotion){
      // Static grid, no cursor-follow animation loop.
      grid.staticRender = true;
      grid.draw();
    } else {
      grid.start();
    }
  });

  // Section 4: overlapping sticky "how it works" cards. Each card's top
  // offset and z-index increase down the list, so each one slides up and
  // stacks over the one before it while scrolling — computed here instead
  // of hardcoded so it scales automatically with however many .step
  // elements exist. Below 900px, CSS overrides these back to a normal
  // in-flow stack (see the max-width:900px rule in light-theme.css).
  document.querySelectorAll('.step').forEach(function(el, i){
    el.style.top = (80 + i * 16) + 'px';
    el.style.zIndex = i + 1;
  });
})();
