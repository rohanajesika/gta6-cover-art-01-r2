/* Vice Nights Cover Lab — editor + cover renderer.
   Static, offline, no network: photos are read on the user's machine,
   lettering is drawn from lettering.js (vector strokes, no font files). */
(function () {
  'use strict';

  var GRADES = {
    sunset: {
      name: 'Vice Sunset',
      swatch: 'linear-gradient(135deg,#ffd319,#ff2975 60%,#8c1eff)',
      title: ['#ffe45c', '#ff2975'],
      outline: '#1c0616',
      band: ['#1d0a24', '#2b0f1e'],
      washTop: [255, 41, 117, 0.16],
      washBottom: [255, 211, 25, 0.14],
      accent: '#ffd319',
      chip: '#ff2975',
    },
    neon: {
      name: 'Neon Nights',
      swatch: 'linear-gradient(135deg,#00e5ff,#ff2e88 60%,#7b2fff)',
      title: ['#8ff7ff', '#ff2e88'],
      outline: '#04101c',
      band: ['#071a26', '#160a2e'],
      washTop: [0, 229, 255, 0.15],
      washBottom: [255, 46, 136, 0.15],
      accent: '#00e5ff',
      chip: '#00e5ff',
    },
    teal: {
      name: 'Teal Heat',
      swatch: 'linear-gradient(135deg,#7dffcb,#ff9a3d 60%,#ff2975)',
      title: ['#c8ffe9', '#ff9a3d'],
      outline: '#06231a',
      band: ['#06231f', '#2b1a08'],
      washTop: [125, 255, 203, 0.13],
      washBottom: [255, 154, 61, 0.16],
      accent: '#7dffcb',
      chip: '#7dffcb',
    },
    noir: {
      name: 'Noir',
      swatch: 'linear-gradient(135deg,#f5f5f5,#8a8a8a 60%,#222)',
      title: ['#ffffff', '#b9b9c9'],
      outline: '#050505',
      band: ['#0a0a0a', '#1c1c22'],
      washTop: [120, 140, 255, 0.10],
      washBottom: [0, 0, 0, 0.20],
      accent: '#e8e8e8',
      chip: '#e8e8e8',
    },
  };

  var SIZES = {
    square: { w: 1080, h: 1080, label: '1080 × 1080' },
    portrait: { w: 1080, h: 1350, label: '1080 × 1350' },
    wide: { w: 1920, h: 1080, label: '1920 × 1080' },
  };

  var LAYOUTS = {
    split: { panels: 2, label: 'Split' },
    triptych: { panels: 3, label: 'Triptych' },
    hero: { panels: 3, label: 'Hero' },
  };

  var SAMPLES = ['samples/sunset.png', 'samples/neon.png'];

  var state = {
    layout: 'split',
    grade: 'sunset',
    size: 'square',
    title: 'VICE NIGHTS',
    tagline: 'ONE CITY. EVERY NIGHT. YOURS.',
    panels: [makePanel(), makePanel()],
    selected: 0,
  };

  function makePanel() {
    return { img: null, name: '', zoom: 1, ox: 0, oy: 0 };
  }

  // ---- geometry -----------------------------------------------------------
  function bandHeight(h) { return Math.round(h * 0.22); }

  // Panel rectangles inside the photo area (above the title band).
  function layoutPanels(layout, w, h) {
    var band = bandHeight(h);
    var area = { x: 0, y: 0, w: w, h: h - band };
    var gap = Math.max(4, Math.round(w * 0.008));
    var rects = [];
    if (layout === 'split') {
      var pw = (area.w - gap) / 2;
      rects.push({ x: area.x, y: area.y, w: pw, h: area.h });
      rects.push({ x: area.x + pw + gap, y: area.y, w: pw, h: area.h });
    } else if (layout === 'triptych') {
      var tw = (area.w - gap * 2) / 3;
      for (var i = 0; i < 3; i++) {
        rects.push({ x: area.x + i * (tw + gap), y: area.y, w: tw, h: area.h });
      }
    } else { // hero: one big panel left, two stacked right
      var big = Math.round(area.w * 0.62);
      rects.push({ x: area.x, y: area.y, w: big, h: area.h });
      var rx = area.x + big + gap;
      var rw = area.w - big - gap;
      var rh = (area.h - gap) / 2;
      rects.push({ x: rx, y: area.y, w: rw, h: rh });
      rects.push({ x: rx, y: area.y + rh + gap, w: rw, h: rh });
    }
    return rects;
  }

  function panelAt(x, y, w, h) {
    var rects = layoutPanels(state.layout, w, h);
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return i;
    }
    return -1;
  }

  // ---- cover drawing ------------------------------------------------------
  function drawPanelImage(ctx, panel, rect) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.clip();
    if (panel.img) {
      var iw = panel.img.naturalWidth || panel.img.width;
      var ih = panel.img.naturalHeight || panel.img.height;
      var base = Math.max(rect.w / iw, rect.h / ih);
      var s = base * panel.zoom;
      var dw = iw * s, dh = ih * s;
      var dx = rect.x + (rect.w - dw) / 2 + panel.ox;
      var dy = rect.y + (rect.h - dh) / 2 + panel.oy;
      ctx.drawImage(panel.img, dx, dy, dw, dh);
    } else {
      var g = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
      g.addColorStop(0, '#241a3d');
      g.addColorStop(1, '#120a24');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      // dashed frame + plus mark + "ADD PHOTO" in vector lettering
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = Math.max(2, rect.w * 0.006);
      ctx.setLineDash([14, 10]);
      ctx.strokeRect(rect.x + 14, rect.y + 14, rect.w - 28, rect.h - 28);
      ctx.setLineDash([]);
      var cx = rect.x + rect.w / 2, cy = rect.y + rect.h / 2 - rect.h * 0.06;
      var r = Math.min(rect.w, rect.h) * 0.07;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = Math.max(3, r * 0.16);
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
      ctx.stroke();
      var fs = Math.max(14, Math.min(rect.w * 0.09, 34));
      ViceLettering.drawText(ctx, 'ADD PHOTO', cx, cy + r + fs * 0.9,
        { size: fs, fill: '#e8e2f5', outline: '#14060f', outlineWidth: 1.4, weight: 0.95, align: 'center', slant: 0.06 });
    }
    ctx.restore();
    // thin frame around the panel
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = Math.max(2, rect.w * 0.005);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  }

  function drawCover(ctx, w, h, st) {
    var grade = GRADES[st.grade];
    var band = bandHeight(h);
    ctx.fillStyle = '#0d0a1a';
    ctx.fillRect(0, 0, w, h);

    var rects = layoutPanels(st.layout, w, h);
    for (var i = 0; i < rects.length; i++) drawPanelImage(ctx, st.panels[i], rects[i]);

    // colour-grade wash over the photo area
    var photoH = h - band;
    var wash = ctx.createLinearGradient(0, 0, 0, photoH);
    wash.addColorStop(0, rgba(grade.washTop));
    wash.addColorStop(1, rgba(grade.washBottom));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, photoH);
    // vignette: stepped dark frames at the photo area's edge. Flat alpha
    // bands (not a radial gradient) — a radial gradient's per-pixel values
    // compress very poorly in PNG, while these bands read as retro print
    // shading and keep the exported PNG small.
    var vSteps = 8;
    var vDepth = Math.min(w, photoH) * 0.12;
    var vThick = vDepth / vSteps;
    ctx.lineWidth = vThick;
    for (var vi = 0; vi < vSteps; vi++) {
      var va = 0.26 * Math.pow(1 - vi / vSteps, 2);
      ctx.strokeStyle = 'rgba(5,2,12,' + va.toFixed(3) + ')';
      var inset = vThick * (vi + 0.5);
      ctx.strokeRect(inset, inset, w - inset * 2, photoH - inset * 2);
    }

    // title band
    var by = h - band;
    var bg = ctx.createLinearGradient(0, by, 0, h);
    bg.addColorStop(0, grade.band[0]);
    bg.addColorStop(1, grade.band[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(0, by, w, band);
    ctx.fillStyle = grade.accent;
    ctx.fillRect(0, by, w, Math.max(3, h * 0.004));
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.fillRect(0, by + Math.max(3, h * 0.004), w, 1);

    // title, fitted to the band width
    var title = (st.title || 'VICE NIGHTS').toUpperCase();
    var tSize = band * 0.46;
    while (tSize > 18 && ViceLettering.measure(title, tSize) > w * 0.88) tSize *= 0.94;
    ViceLettering.drawText(ctx, title, w / 2, by + band * 0.16,
      { size: tSize, fill: grade.title, outline: grade.outline, outlineWidth: 1.8, weight: 1.05, align: 'center' });

    // tagline
    var tag = (st.tagline || '').toUpperCase();
    if (tag) {
      var gSize = Math.max(13, band * 0.115);
      while (gSize > 12 && ViceLettering.measure(tag, gSize, 0.4) > w * 0.86) gSize *= 0.94;
      ViceLettering.drawText(ctx, tag, w / 2, by + band * 0.66,
        { size: gSize, fill: '#f2ecff', outline: grade.outline, outlineWidth: 1.2, weight: 0.9, align: 'center', letterSpacing: 0.4, slant: 0.04 });
    }

    // top-left chip: small sun mark + "VICE NIGHTS · COVER LAB"
    var chipPad = Math.max(10, w * 0.012);
    var chipH = Math.max(26, h * 0.032);
    var chipText = 'VICE NIGHTS';
    var chipFs = chipH * 0.42;
    var chipW = ViceLettering.measure(chipText, chipFs, 0.3) + chipH * 1.6 + chipPad * 2;
    var chipX = chipPad, chipY = chipPad;
    ctx.fillStyle = 'rgba(10,4,18,0.72)';
    roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
    ctx.fill();
    // sun mark: half-disc with rays
    var sunCx = chipX + chipPad + chipH * 0.28, sunCy = chipY + chipH * 0.55;
    var sunR = chipH * 0.22;
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.arc(sunCx, sunCy, sunR, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(sunCx - sunR, sunCy, sunR * 2, Math.max(2, chipH * 0.05));
    ViceLettering.drawText(ctx, chipText, chipX + chipPad + chipH * 0.75, chipY + chipH * 0.28,
      { size: chipFs, fill: '#ffffff', outline: '#14060f', outlineWidth: 1.1, weight: 0.9, letterSpacing: 0.3, slant: 0.04, shadow: false });
  }

  function rgba(c) {
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')';
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- preview + controls -------------------------------------------------
  var preview = document.getElementById('preview');
  var pctx = preview.getContext('2d');

  function render() {
    var size = SIZES[state.size];
    if (preview.width !== size.w || preview.height !== size.h) {
      preview.width = size.w;
      preview.height = size.h;
    }
    drawCover(pctx, size.w, size.h, state);
    syncPanelCards();
  }

  function setLayout(layout) {
    var want = LAYOUTS[layout].panels;
    while (state.panels.length < want) state.panels.push(makePanel());
    state.panels.length = want;
    if (state.selected >= want) state.selected = 0;
    state.layout = layout;
    document.querySelectorAll('#layout-seg .seg-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.layout === layout);
    });
    buildPanelCards();
    render();
  }

  function setGrade(grade) {
    state.grade = grade;
    document.querySelectorAll('#grade-list .grade-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.grade === grade);
    });
    render();
  }

  function setSize(size) {
    state.size = size;
    document.querySelectorAll('#size-seg .seg-btn').forEach(function (b) {
      b.classList.toggle('is-active', b.dataset.size === size);
    });
    render();
  }

  // panel cards
  var cardsEl = document.getElementById('panel-cards');

  function buildPanelCards() {
    cardsEl.innerHTML = '';
    state.panels.forEach(function (panel, i) {
      var card = document.createElement('div');
      card.className = 'panel-card' + (i === state.selected ? ' is-selected' : '');
      card.dataset.index = i;
      var title = document.createElement('h3');
      title.textContent = 'Panel ' + (i + 1) + (i === state.selected ? ' · selected' : '');
      var name = document.createElement('p');
      name.className = 'photo-name';
      name.textContent = panel.name || 'No photo yet';
      var row = document.createElement('div');
      row.className = 'row';
      var up = document.createElement('button');
      up.type = 'button';
      up.className = 'btn btn-small';
      up.textContent = 'Upload photo';
      up.addEventListener('click', function () { pickFile(i); });
      var smp = document.createElement('button');
      smp.type = 'button';
      smp.className = 'btn btn-small btn-ghost';
      smp.textContent = 'Use sample';
      smp.addEventListener('click', function () { loadSample(i); });
      row.appendChild(up);
      row.appendChild(smp);
      var zlabel = document.createElement('label');
      zlabel.textContent = 'Zoom';
      var zoom = document.createElement('input');
      zoom.type = 'range';
      zoom.min = '0.5'; zoom.max = '3'; zoom.step = '0.05';
      zoom.value = String(panel.zoom);
      zoom.setAttribute('aria-label', 'Zoom panel ' + (i + 1));
      zoom.addEventListener('input', function () {
        panel.zoom = parseFloat(zoom.value);
        render();
      });
      var zrow = document.createElement('div');
      zrow.className = 'row';
      var zval = document.createElement('span');
      zval.className = 'zoom-val';
      zval.textContent = panel.zoom.toFixed(2) + '×';
      var center = document.createElement('button');
      center.type = 'button';
      center.className = 'btn btn-small btn-ghost';
      center.textContent = 'Centre';
      center.addEventListener('click', function () {
        panel.ox = 0; panel.oy = 0; panel.zoom = 1;
        render();
      });
      var fillAll = document.createElement('button');
      fillAll.type = 'button';
      fillAll.className = 'btn btn-small btn-ghost';
      fillAll.textContent = 'Use in all panels';
      fillAll.addEventListener('click', function () {
        if (!panel.img) return;
        state.panels.forEach(function (p, j) {
          if (j !== i) { p.img = panel.img; p.name = panel.name; p.zoom = 1; p.ox = 0; p.oy = 0; }
        });
        render();
      });
      zrow.appendChild(zval);
      zrow.appendChild(center);
      zrow.appendChild(fillAll);
      card.appendChild(title);
      card.appendChild(name);
      card.appendChild(row);
      card.appendChild(zlabel);
      card.appendChild(zoom);
      card.appendChild(zrow);
      card.addEventListener('click', function () { selectPanel(i); });
      cardsEl.appendChild(card);
    });
  }

  function syncPanelCards() {
    var cards = cardsEl.children;
    for (var i = 0; i < cards.length && i < state.panels.length; i++) {
      var panel = state.panels[i];
      cards[i].classList.toggle('is-selected', i === state.selected);
      cards[i].querySelector('h3').textContent = 'Panel ' + (i + 1) + (i === state.selected ? ' · selected' : '');
      cards[i].querySelector('.photo-name').textContent = panel.name || 'No photo yet';
      var z = cards[i].querySelector('input[type="range"]');
      if (document.activeElement !== z) z.value = String(panel.zoom);
      cards[i].querySelector('.zoom-val').textContent = panel.zoom.toFixed(2) + '×';
    }
  }

  function selectPanel(i) {
    state.selected = i;
    render();
  }

  // ---- photo loading ------------------------------------------------------
  var fileInput = document.getElementById('file-input');
  var fileTarget = 0;

  function pickFile(i) {
    fileTarget = i;
    fileInput.click();
  }

  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (f) loadFileInto(fileTarget, f);
    fileInput.value = '';
  });

  function loadFileInto(i, file) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      state.panels[i].img = img;
      state.panels[i].name = file.name;
      state.panels[i].zoom = 1;
      state.panels[i].ox = 0;
      state.panels[i].oy = 0;
      URL.revokeObjectURL(url);
      render();
    };
    img.onerror = function () { URL.revokeObjectURL(url); };
    img.src = url;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function loadSample(i) {
    var src = SAMPLES[i % SAMPLES.length];
    loadImage(src).then(function (img) {
      state.panels[i].img = img;
      state.panels[i].name = src.split('/').pop();
      state.panels[i].zoom = 1;
      state.panels[i].ox = 0;
      state.panels[i].oy = 0;
      render();
    });
  }

  function loadAllSamples() {
    state.panels.forEach(function (panel, i) { loadSample(i); });
  }

  // ---- preview interaction: drag to pan, wheel to zoom, drop to load ------
  function toCoverCoords(ev) {
    var r = preview.getBoundingClientRect();
    return {
      x: (ev.clientX - r.left) * (preview.width / r.width),
      y: (ev.clientY - r.top) * (preview.height / r.height),
    };
  }

  var drag = null;
  preview.addEventListener('pointerdown', function (ev) {
    var p = toCoverCoords(ev);
    var idx = panelAt(p.x, p.y, preview.width, preview.height);
    if (idx < 0) return;
    selectPanel(idx);
    drag = { x: p.x, y: p.y, ox: state.panels[idx].ox, oy: state.panels[idx].oy };
    preview.setPointerCapture(ev.pointerId);
    preview.classList.add('dragging');
  });
  preview.addEventListener('pointermove', function (ev) {
    if (!drag) return;
    var p = toCoverCoords(ev);
    var panel = state.panels[state.selected];
    panel.ox = drag.ox + (p.x - drag.x);
    panel.oy = drag.oy + (p.y - drag.y);
    render();
  });
  function endDrag() {
    drag = null;
    preview.classList.remove('dragging');
  }
  preview.addEventListener('pointerup', endDrag);
  preview.addEventListener('pointercancel', endDrag);
  preview.addEventListener('wheel', function (ev) {
    ev.preventDefault();
    var panel = state.panels[state.selected];
    panel.zoom = Math.min(3, Math.max(0.5, panel.zoom * Math.exp(-ev.deltaY * 0.0012)));
    render();
  }, { passive: false });

  preview.addEventListener('dragover', function (ev) { ev.preventDefault(); });
  preview.addEventListener('drop', function (ev) {
    ev.preventDefault();
    var f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
    if (!f || !f.type || f.type.indexOf('image/') !== 0) return;
    var p = toCoverCoords(ev);
    var idx = panelAt(p.x, p.y, preview.width, preview.height);
    if (idx < 0) idx = state.selected;
    loadFileInto(idx, f);
  });

  // ---- toolbar wiring -----------------------------------------------------
  document.querySelectorAll('#layout-seg .seg-btn').forEach(function (b) {
    b.addEventListener('click', function () { setLayout(b.dataset.layout); });
  });

  var gradeList = document.getElementById('grade-list');
  Object.keys(GRADES).forEach(function (key) {
    var g = GRADES[key];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'grade-btn' + (key === state.grade ? ' is-active' : '');
    b.dataset.grade = key;
    var sw = document.createElement('span');
    sw.className = 'grade-swatch';
    sw.style.background = g.swatch;
    var label = document.createElement('span');
    label.textContent = g.name;
    b.appendChild(sw);
    b.appendChild(label);
    b.addEventListener('click', function () { setGrade(key); });
    gradeList.appendChild(b);
  });

  document.querySelectorAll('#size-seg .seg-btn').forEach(function (b) {
    b.addEventListener('click', function () { setSize(b.dataset.size); });
  });

  document.getElementById('input-title').addEventListener('input', function (ev) {
    state.title = ev.target.value;
    render();
  });
  document.getElementById('input-tagline').addEventListener('input', function (ev) {
    state.tagline = ev.target.value;
    render();
  });
  document.getElementById('btn-samples').addEventListener('click', loadAllSamples);

  // ---- export -------------------------------------------------------------
  function exportBlob() {
    var size = SIZES[state.size];
    var canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    var ctx = canvas.getContext('2d');
    drawCover(ctx, size.w, size.h, state);
    return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/png'); });
  }

  function doExport() {
    var status = document.getElementById('export-status');
    var fname = (document.getElementById('input-filename').value || 'vice-nights-cover')
      .replace(/[^a-z0-9-_]+/gi, '-').replace(/^-+|-+$/g, '') || 'vice-nights-cover';
    exportBlob().then(function (blob) {
      if (!blob) { status.textContent = 'Export failed — try again.'; return; }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fname + '-' + state.size + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      var size = SIZES[state.size];
      status.textContent = 'Exported ' + size.label + ' PNG (' + Math.round(blob.size / 1024) + ' KiB).';
    });
  }

  document.getElementById('btn-export').addEventListener('click', doExport);
  document.getElementById('btn-export-2').addEventListener('click', doExport);

  // ---- boot + test hooks --------------------------------------------------
  buildPanelCards();
  render();

  window.__viceNights = {
    state: state,
    grades: GRADES,
    sizes: SIZES,
    render: render,
    setLayout: setLayout,
    setGrade: setGrade,
    setSize: setSize,
    loadAllSamples: loadAllSamples,
    loadSample: loadSample,
    exportBlob: exportBlob,
    drawCover: drawCover,
  };
})();
