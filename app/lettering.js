/* Vice Nights lettering — a stroke-based condensed display face drawn from code.
   No font files: every glyph is a set of polylines on a 5-wide by 7-tall grid
   (x: 0..4, y: 0..6, y grows down). Drawn as thick strokes with a dark outline
   pass underneath and a gradient fill pass on top, GTA-poster style. */
(function (global) {
  'use strict';

  // Each glyph: array of polylines; a polyline is a flat [x0,y0,x1,y1,...] list.
  var GLYPHS = {
    'A': [[0, 6, 0, 2, 2, 0, 4, 2, 4, 6], [0, 4, 4, 4]],
    'B': [[0, 6, 0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 0, 3], [3, 3, 4, 4, 4, 5, 3, 6, 0, 6]],
    'C': [[4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5]],
    'D': [[0, 6, 0, 0, 3, 0, 4, 1, 4, 5, 3, 6, 0, 6]],
    'E': [[4, 0, 0, 0, 0, 6, 4, 6], [0, 3, 3, 3]],
    'F': [[0, 6, 0, 0, 4, 0], [0, 3, 3, 3]],
    'G': [[4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 4, 3, 2, 3]],
    'H': [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]],
    'I': [[2, 0, 2, 6], [0, 0, 4, 0], [0, 6, 4, 6]],
    'J': [[0, 0, 4, 0], [4, 0, 4, 5, 3, 6, 1, 6, 0, 5]],
    'K': [[0, 0, 0, 6], [4, 0, 0, 3, 4, 6]],
    'L': [[0, 0, 0, 6, 4, 6]],
    'M': [[0, 6, 0, 0, 2, 3, 4, 0, 4, 6]],
    'N': [[0, 6, 0, 0, 4, 6, 4, 0]],
    'O': [[1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5, 0, 1, 1, 0]],
    'P': [[0, 6, 0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 0, 3]],
    'Q': [[1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5, 0, 1, 1, 0], [2, 4, 4, 6]],
    'R': [[0, 6, 0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 0, 3], [2, 3, 4, 6]],
    'S': [[4, 1, 3, 0, 1, 0, 0, 1, 0, 2, 4, 4, 4, 5, 3, 6, 1, 6, 0, 5]],
    'T': [[0, 0, 4, 0], [2, 0, 2, 6]],
    'U': [[0, 0, 0, 5, 1, 6, 3, 6, 4, 5, 4, 0]],
    'V': [[0, 0, 2, 6, 4, 0]],
    'W': [[0, 0, 0, 6, 2, 3, 4, 6, 4, 0]],
    'X': [[0, 0, 4, 6], [4, 0, 0, 6]],
    'Y': [[0, 0, 2, 3, 4, 0], [2, 3, 2, 6]],
    'Z': [[0, 0, 4, 0, 0, 6, 4, 6]],
    '0': [[1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5, 0, 1, 1, 0], [3, 1, 1, 5]],
    '1': [[1, 1, 2, 0, 2, 6], [0, 6, 4, 6]],
    '2': [[0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 0, 6, 4, 6]],
    '3': [[1, 0, 3, 0, 4, 1, 4, 2, 3, 3], [2, 3, 4, 3, 4, 5, 3, 6, 1, 6]],
    '4': [[0, 0, 0, 3, 4, 3], [3, 0, 3, 6]],
    '5': [[4, 0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 5, 3, 6, 1, 6, 0, 5]],
    '6': [[4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 3, 3, 0, 3]],
    '7': [[0, 0, 4, 0, 2, 6]],
    '8': [[1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 1, 3, 0, 2, 0, 1, 1, 0],
          [1, 3, 3, 3, 4, 4, 4, 5, 3, 6, 1, 6, 0, 5, 0, 4, 1, 3]],
    '9': [[0, 4, 0, 2, 1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5], [1, 3, 4, 3]],
    ' ': [],
    '.': [[1.8, 5.8, 2.2, 5.8]],
    ',': [[2, 5, 2, 6, 1.3, 6.9]],
    '!': [[2, 0, 2, 4], [1.8, 5.8, 2.2, 5.8]],
    '?': [[1, 1, 1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 2, 3], [1.8, 5.8, 2.2, 5.8]],
    "'": [[2, 0, 2, 2]],
    '-': [[0, 3, 4, 3]],
    '&': [[4, 0, 3, 0, 2, 1, 2, 2, 3, 3, 4, 4, 4, 5, 3, 6, 1, 6, 0, 5, 1, 3, 3, 3]],
    ':': [[1.8, 1, 2.2, 1], [1.8, 5, 2.2, 5]],
    ';': [[1.8, 1, 2.2, 1], [2, 4, 2, 5, 1.3, 6.9]],
    '/': [[4, 0, 0, 6]],
    '(': [[3, 0, 2, 1, 2, 5, 3, 6]],
    ')': [[1, 0, 2, 1, 2, 5, 1, 6]],
    '%': [[0.8, 0.8, 1.8, 0.8, 1.8, 1.8, 0.8, 1.8, 0.8, 0.8],
          [3.2, 4.2, 4.2, 4.2, 4.2, 5.2, 3.2, 5.2, 3.2, 4.2], [4, 0, 0, 6]],
    '+': [[2, 1, 2, 5], [0, 3, 4, 3]],
    '=': [[0, 2, 4, 2], [0, 4, 4, 4]],
    '#': [[1.5, 0, 1.5, 6], [3, 0, 3, 6], [0, 2, 4, 2], [0, 4, 4, 4]],
    '@': [[3, 1, 4, 2, 4, 5, 3, 6, 1, 6, 0, 5, 0, 2, 1, 1, 3, 1],
          [2, 3, 2, 5, 3, 5, 3, 3]],
    '*': [[2, 0, 2, 6], [0, 1, 4, 5], [4, 1, 0, 5]],
  };

  var ADVANCE = 6; // grid units per character, including 1 unit of tracking
  var GLYPH_H = 7;

  function glyphOf(ch) {
    return GLYPHS[ch] || GLYPHS[' '];
  }

  // Width of a string in grid units (no trailing tracking after the last glyph).
  function measureUnits(text) {
    var n = 0;
    for (var i = 0; i < text.length; i++) n += ADVANCE;
    return n > 0 ? n - 1 : 0;
  }

  // Trace one glyph's strokes at an offset, in the current transform.
  function traceGlyph(ctx, glyph, ox, oy, s) {
    for (var p = 0; p < glyph.length; p++) {
      var pts = glyph[p];
      ctx.beginPath();
      ctx.moveTo(ox + pts[0] * s, oy + pts[1] * s);
      for (var i = 2; i < pts.length; i += 2) {
        ctx.lineTo(ox + pts[i] * s, oy + pts[i + 1] * s);
      }
      ctx.stroke();
    }
  }

  // Draw one line of vector text.
  // opts: { size (cap height px), fill (CSS color or [top,bottom] gradient pair),
  //         outline (CSS color), outlineWidth (grid units), weight (grid units),
  //         align ('left'|'center'|'right'), slant (shear, 0..0.2), letterSpacing (grid units) }
  function drawText(ctx, text, x, y, opts) {
    opts = opts || {};
    var size = opts.size || 64;
    var s = size / GLYPH_H; // px per grid unit
    var adv = (ADVANCE + (opts.letterSpacing || 0)) * s;
    var up = String(text == null ? '' : text).toUpperCase();
    var totalW = up.length ? up.length * adv - (opts.letterSpacing || 0) * s - s : 0;
    var startX = x;
    if (opts.align === 'center') startX = x - totalW / 2;
    else if (opts.align === 'right') startX = x - totalW;

    var slant = opts.slant == null ? 0.10 : opts.slant;
    var weight = (opts.weight == null ? 1.05 : opts.weight) * s;
    var outlineW = (opts.outlineWidth == null ? 1.75 : opts.outlineWidth) * s;

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    // slight forward lean, GTA-poster style. The shear is applied in absolute
    // canvas coordinates, so it would also shove the whole line left by
    // slant * y — cancel that with a counter-translation so the text stays
    // centred on its own mid-height.
    ctx.translate(slant * (y + size / 2), 0);
    ctx.transform(1, 0, -slant, 1, 0, 0);

    // drop shadow, drawn as the outline shape offset down-right
    if (opts.shadow !== false) {
      ctx.save();
      ctx.translate(size * 0.07, size * 0.11);
      ctx.strokeStyle = 'rgba(10, 4, 18, 0.55)';
      ctx.lineWidth = outlineW;
      traceLine(ctx, up, startX, y, s, adv);
      ctx.restore();
    }

    // dark outline pass
    ctx.strokeStyle = opts.outline || '#14060f';
    ctx.lineWidth = outlineW;
    traceLine(ctx, up, startX, y, s, adv);

    // gradient fill pass
    var fill = opts.fill || '#ffffff';
    if (Array.isArray(fill)) {
      var g = ctx.createLinearGradient(0, y, 0, y + size);
      g.addColorStop(0, fill[0]);
      g.addColorStop(1, fill[1]);
      ctx.strokeStyle = g;
    } else {
      ctx.strokeStyle = fill;
    }
    ctx.lineWidth = weight;
    traceLine(ctx, up, startX, y, s, adv);
    ctx.restore();
    return totalW;
  }

  function traceLine(ctx, up, startX, y, s, adv) {
    for (var i = 0; i < up.length; i++) {
      var glyph = glyphOf(up[i]);
      if (glyph.length) traceGlyph(ctx, glyph, startX + i * adv, y, s);
    }
  }

  // Pixel width of a line at a given cap-height size.
  function measure(text, size, letterSpacing) {
    var s = (size || 64) / GLYPH_H;
    var adv = (ADVANCE + (letterSpacing || 0)) * s;
    var up = String(text == null ? '' : text).toUpperCase();
    if (!up.length) return 0;
    return up.length * adv - (letterSpacing || 0) * s - s;
  }

  global.ViceLettering = {
    drawText: drawText,
    measure: measure,
    measureUnits: measureUnits,
    glyphs: GLYPHS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
