/* SUHO Detailing: service-area globe.
   The 52 Census places within 25 miles of downtown Houston (the service
   radius) ride around a slowly turning globe behind "Houston, TX and
   surrounding areas". Every few seconds one name
   lights up in the color of its terrain.

   Terrain is a general read of each place's geography:
     w  water    on Galveston Bay, Clear Lake, Trinity Bay, the San Jacinto or Brazos River,
                 or at least 6% water by Census area                                   -> blue
     g  woods    Piney Woods north of Houston, and the wooded Memorial Villages          -> green
     c  city     built-up Houston core, suburbs and the industrial east side            -> silver
     p  prairie  coastal prairie, ranch and farm land to the west, south and east       -> sand
   Change a letter below to recolor a place. */
(function () {
  "use strict";

  var PLACES = [
  ["West University Place", "c"], ["Hedwig Village", "g"], ["Meadows Place", "c"],
  ["Atascocita", "g"], ["Barrett", "p"], ["Shoreacres", "w"], ["Southside Place", "c"],
  ["Bunker Hill Village", "g"], ["Jersey Village", "c"], ["Mission Bend", "c"], ["Sienna", "p"],
  ["El Lago", "w"], ["Bellaire", "c"], ["Aldine", "c"], ["Channelview", "w"],
  ["Four Corners", "c"], ["Spring", "g"], ["Cinco Ranch", "p"], ["Hilshire Village", "g"],
  ["South Houston", "c"], ["Fifth Street", "p"], ["Arcola", "p"], ["Crosby", "p"],
  ["Pecan Grove", "p"], ["Jacinto City", "c"], ["Cloverleaf", "c"], ["Sheldon", "c"],
  ["Manvel", "p"], ["Webster", "c"], ["Baytown", "w"], ["Hunters Creek Village", "g"],
  ["Brookside Village", "c"], ["Deer Park", "c"], ["Highlands", "w"], ["Iowa Colony", "p"],
  ["League City", "c"], ["Galena Park", "c"], ["Pearland", "c"], ["Fresno", "p"],
  ["Sugar Land", "c"], ["Nassau Bay", "w"], ["Alvin", "p"], ["Spring Valley Village", "g"],
  ["Stafford", "c"], ["Missouri City", "c"], ["Friendswood", "c"], ["Taylor Lake Village", "w"],
  ["Piney Point Village", "g"], ["Pasadena", "c"], ["Humble", "g"], ["La Porte", "w"],
  ["Morgan's Point", "w"]
  ];
  var TERRAIN = { w: "water", g: "woods", c: "city", p: "prairie" };

  var SPEED = 16;          // px per second at the front of the equator (same turn rate for every row)
  var TILT = 0.14;         // radians: the globe leans toward you a little, so rows curve like latitudes
  var LAT_MAX = 1.08;      // radians: top and bottom rows (about 62 degrees)
  var PULSE_EVERY = 3200;  // ms between pulses; each pulse is 0.5s in, 1s hold, 0.5s out (see styles.css)
  var COPIES = 2.5;        // at most about this many copies of each name around the whole globe
  var TEXT_PAD = 12;       // px of clear space kept around each line of the service-area text
  var TEXT_FADE = 32;      // px beyond that over which a name fades back in
                           // (both smaller on phones, where the text fills more of the band)

  var area = document.getElementById("area");
  var layer = area && area.querySelector(".area-globe");
  if (!layer) return;
  var heading = area.querySelector(".area-inner");
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;

  var items = [];          // { el, w, h, lat, lon, sl, cl, terrain }
  var W = 0, H = 0, RX = 0, RY = 0;
  var omega = 0;           // radians per ms
  var spin = 0;            // current rotation
  var last = 0, raf = 0, running = false, visible = false;
  var pulseTimer = 0, pulseKick = 0, pulseIndex = 0;
  var litOrder = {};       // name -> number of the pulse it last lit up on
  var pulseCount = 0;
  var SPARE = 8;           // names kept free to choose from (see memory())
  var textBoxes = [];      // the text's line boxes, relative to the band, padded by TEXT_PAD
  var cosT = Math.cos(TILT), sinT = Math.sin(TILT);

  function build() {
    layer.textContent = "";
    items = [];
    widths = {};             // fonts may have changed since the last build
    W = area.clientWidth;
    H = area.clientHeight;
    if (!W || !H) return;
    RX = W * 0.49;
    RY = H * (W < 834 ? 0.47 : 0.42); // phones and tablets: reach nearer the top and bottom, where the names show
    omega = SPEED / RX / 1000;
    TEXT_PAD = W < 600 ? 4 : 12;
    TEXT_FADE = W < 600 ? 16 : 32;
    textBoxes = measureText();

    // Measure each name once at its natural size.
    var probe = document.createElement("span");
    probe.className = "area-place";
    probe.setAttribute("data-name", "Mg");
    layer.appendChild(probe);
    var lineH = probe.offsetHeight;
    // Space between names: two letter-heights, a little tighter on phones and tablets,
    // where the band is narrow and the names would otherwise look sparse.
    var gap = parseFloat(getComputedStyle(probe).fontSize) * (W < 834 ? 1.4 : 2);
    layer.removeChild(probe);

    // Rows evenly spaced in latitude. Text shrinks vertically toward the poles,
    // so the rows never touch.
    var rows = Math.max(3, Math.floor((2 * LAT_MAX * RY) / (lineH * (W < 834 ? 1.2 : 1.55))) + 1);

    // With a short list, spread the names out instead of repeating them:
    // widen the gap so the rings hold about COPIES copies of each name.
    var totalRing = 0, sumW = 0;
    for (var q = 0; q < rows; q++) totalRing += 2 * Math.PI * RX * Math.cos(-LAT_MAX + (2 * LAT_MAX * q) / (rows - 1));
    PLACES.forEach(function (p) { sumW += measure(p[0]); });
    gap = Math.max(gap, totalRing / (COPIES * PLACES.length) - sumW / PLACES.length);

    var frag = document.createDocumentFragment();
    var spans = [], next = 0;

    for (var r = 0; r < rows; r++) {
      var lat = -LAT_MAX + (2 * LAT_MAX * r) / (rows - 1);
      var ring = 2 * Math.PI * RX * Math.cos(lat); // length of this latitude, in px
      var row = [], used = 0;
      while (true) {
        var place = PLACES[next % PLACES.length];
        var w = measure(place[0]);
        if (used + w + gap > ring) break;
        row.push({ place: place, w: w });
        used += w + gap;
        next++;
      }
      if (row.length < 2) continue;
      // Spread leftover space evenly so the ring closes without a seam.
      var spare = (ring - used) / row.length;
      var at = (r * 0.83) % (2 * Math.PI) * RX * Math.cos(lat); // stagger rows
      row.forEach(function (it) {
        var el = document.createElement("span");
        el.className = "area-place";
        // The name is drawn by CSS (::before) from this attribute, so the globe's
        // 100+ names don't read as a block of page text to search engines.
        el.setAttribute("data-name", it.place[0]);
        el.setAttribute("data-terrain", TERRAIN[it.place[1]]);
        var center = at + (it.w + gap + spare) / 2;
        at += it.w + gap + spare;
        spans.push(el);
        items.push({
          el: el, w: it.w, h: lineH,
          lat: lat, sl: Math.sin(lat), cl: Math.cos(lat),
          lon: center / (RX * Math.cos(lat)),
          z: 0
        });
        frag.appendChild(el);
      });
    }
    layer.appendChild(frag);
    findReachable();
    draw();
  }

  var measurer, widths = {};
  function measure(text) {
    if (!measurer) {
      measurer = document.createElement("span");
      measurer.className = "area-place";
      measurer.style.visibility = "hidden";
    }
    if (widths[text]) return widths[text];
    measurer.setAttribute("data-name", text);
    layer.appendChild(measurer);
    var w = measurer.offsetWidth;
    layer.removeChild(measurer);
    return (widths[text] = w);
  }

  // Line boxes of the heading and paragraphs (links included) and the
  // play/pause button, relative to the band. Names fade out near them.
  function measureText() {
    var base = area.getBoundingClientRect(), boxes = [];
    function add(r) {
      if (!r.width || !r.height) return;
      boxes.push([r.left - base.left - TEXT_PAD, r.right - base.left + TEXT_PAD,
                  r.top - base.top - TEXT_PAD, r.bottom - base.top + TEXT_PAD]);
    }
    heading.querySelectorAll("p:not(.check-result):not(.check-credit), h2").forEach(function (el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      [].forEach.call(range.getClientRects(), add);
    });
    // The address check: its box, the location button and the answer line.
    [].forEach.call(heading.querySelectorAll(".check-label, .check-box, .check-locate, .check-result, .check-credit"), function (el) {
      if (el.offsetParent === null) return; // hidden
      if (!el.classList.contains("check-box") && !el.classList.contains("check-locate")) {
        var range = document.createRange();
        range.selectNodeContents(el);
        [].forEach.call(range.getClientRects(), add);
      } else add(el.getBoundingClientRect());
    });
    var btn = area.querySelector(".area-motion");
    if (btn && !btn.hidden) add(btn.getBoundingClientRect());
    return boxes;
  }
  // Distance from a name's box to the nearest line of text (0 if they overlap).
  function textGap(X, Y, hw, hh) {
    var best = Infinity;
    for (var j = 0; j < textBoxes.length; j++) {
      var q = textBoxes[j];
      var dx = Math.max(q[0] - (X + hw), (X - hw) - q[1], 0);
      var dy = Math.max(q[2] - (Y + hh), (Y - hh) - q[3], 0);
      var dd = Math.sqrt(dx * dx + dy * dy);
      if (dd < best) best = dd;
      if (!best) break;
    }
    return best;
  }
  function smooth(t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); }

  // Orthographic view of a sphere tilted toward the viewer. Each name is
  // placed on its latitude and turned to follow the surface. Names fade out
  // near the text instead of passing behind it.
  function draw() {
    var cx = W / 2, cy = H / 2, k = RY / RX;
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var th = it.lon - spin;
      var st = Math.sin(th), ct = Math.cos(th);
      // point on the unit sphere (x right, y up, z toward you), then tilt about x
      var x = it.cl * st, y0 = it.sl, z0 = it.cl * ct;
      var y = y0 * cosT - z0 * sinT;
      var z = y0 * sinT + z0 * cosT;
      it.z = z;
      if (z <= 0.02 || ct <= 0) {
        if (it.shown) { it.el.style.visibility = "hidden"; it.shown = false; }
        it.o = 0;
        continue;
      }
      // east and south directions on the surface, after the tilt
      var ex = ct, ey = st * sinT;                 // east (cos th, 0, -sin th), tilted
      var nx = -it.sl * st;
      var ny = it.cl * cosT + it.sl * ct * sinT;   // north, tilted
      // text's x axis follows east, its y axis follows south (slant softened so it doesn't read as italics)
      var a = ex, b = -ey * k, c = -nx * 0.3, d = Math.max(ny, 0.05);
      var X = cx + RX * x, Y = cy - RY * y;
      var o = smooth(z / 0.45) * smooth(textGap(X, Y, it.w * Math.abs(a) / 2, it.h * d / 2) / TEXT_FADE);
      it.el.style.transform =
        "translate(" + (X - it.w / 2).toFixed(1) + "px," + (Y - it.h / 2).toFixed(1) + "px) " +
        "matrix(" + a.toFixed(4) + "," + b.toFixed(4) + "," + c.toFixed(4) + "," + d.toFixed(4) + ",0,0)";
      it.el.style.opacity = o.toFixed(3);
      if (!it.shown) { it.el.style.visibility = "visible"; it.shown = true; }
      it.X = X; it.Y = Y; it.ct = ct; it.o = o;
    }
  }

  // Can this copy of a name light up when the globe has turned to `turn`?
  // Same rules as the loosest pulse: facing you, inside the band, and
  // mostly faded in (clear of the text).
  function litAt(it, turn) {
    var th = it.lon - turn;
    var st = Math.sin(th), ct = Math.cos(th);
    if (ct < 0.25) return false;
    var y0 = it.sl, z0 = it.cl * ct;
    var z = y0 * sinT + z0 * cosT;
    if (z <= 0.02) return false;
    var X = W / 2 + RX * it.cl * st, Y = H / 2 - RY * (y0 * cosT - z0 * sinT);
    var halfW = it.w * ct / 2;
    if (X - halfW < 8 || X + halfW > W - 8) return false;
    var ny = it.cl * cosT + it.sl * ct * sinT;
    return smooth(z / 0.45) * smooth(textGap(X, Y, halfW, it.h * Math.max(ny, 0.05) / 2) / TEXT_FADE) >= 0.4;
  }

  // Which names can ever light up at this size? A name whose every copy
  // rides a row that stays behind the text (common on phones) never shows,
  // so it sits out the rounds instead of holding them up.
  var reachable = {}, reachableCount = 0, copies = {};
  function findReachable() {
    reachable = {};
    reachableCount = 0;
    copies = {};
    for (var i = 0; i < items.length; i++) {
      var name = items[i].el.getAttribute("data-name");
      (copies[name] = copies[name] || []).push(items[i]);
    }
    Object.keys(copies).forEach(function (name) {
      for (var s = 0; s < 72 && !reachable[name]; s++) {
        var turn = (s / 72) * 2 * Math.PI;
        for (var c = 0; c < copies[name].length; c++) {
          if (litAt(copies[name][c], turn)) { reachable[name] = true; reachableCount++; break; }
        }
      }
    });
  }

  // How long until this name has to light up or miss its chance for a
  // while: the rest of its time in view, unless another copy of it comes
  // into view soon after. Looks ahead in 0.4 s steps, up to one turn.
  var STEP = 400;
  function urgency(name) {
    var list = copies[name] || [], horizon = (2 * Math.PI) / omega, t = 0, end = -1;
    function lit(t) {
      for (var c = 0; c < list.length; c++) if (litAt(list[c], spin + omega * t)) return true;
      return false;
    }
    for (t = STEP; t < horizon; t += STEP) {
      if (end < 0) { if (!lit(t)) end = t; }
      else if (lit(t)) return t - end < 2 * PULSE_EVERY ? t + horizon : end; // back soon: not urgent
    }
    return end < 0 ? horizon * 2 : end;
  }

  function frame(now) {
    if (!running) return;
    if (last) spin += Math.min(now - last, 100) * omega;
    last = now;
    draw();
    raf = requestAnimationFrame(frame);
  }

  // One name at a time lights up in its terrain color. Colors take turns
  // so all four show up; the name is picked from the front of the globe,
  // clear of the text. On small phones the text covers more of the band, so
  // if no name is fully clear, a slightly faded one near the edge will do.
  var ORDER = ["woods", "water", "city", "prairie"];
  function candidates(minO, minCt, want) {
    var pool = [], other = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var name = it.el.getAttribute("data-name");
      if (!it.shown || recent(name) || it.o < minO || it.ct < minCt) continue;
      var halfW = it.w * it.ct / 2;
      if (it.X - halfW < 8 || it.X + halfW > W - 8) continue;
      (it.el.getAttribute("data-terrain") === want ? pool : other).push(it);
    }
    return [pool, other];
  }
  // No place lights up again until most of the others have had a turn:
  // a name that lit up within the last memory() pulses is skipped, so any
  // run of that many highlights in a row is all different places (44 of
  // the 52 on a wide screen; on phones, all but 8 of the names that can
  // show there). The 8 left free mean there is nearly always a fresh name
  // in view, so the highlights keep coming instead of stalling while the
  // last unused names are around the back of the globe.
  function memory() {
    return Math.max(1, (reachableCount || PLACES.length) - SPARE);
  }
  function recent(name) {
    return name in litOrder && pulseCount - litOrder[name] <= memory();
  }

  // Pick the next name: one that is about to turn out of view for a long
  // while goes first, so the last names of a round aren't all at the back
  // of the globe when their turn comes. Otherwise the terrain colors take
  // turns, and among those the name leaving soonest goes first.
  function pick() {
    var want = ORDER[pulseIndex % ORDER.length];
    var all = candidates(0.4, 0.25, want);
    var pool = all[0].concat(all[1]);
    if (!pool.length) return null;
    var score = {};
    pool.forEach(function (it) {
      var n = it.el.getAttribute("data-name");
      if (!(n in score)) score[n] = urgency(n);
    });
    var by = function (a, b) { return score[a.el.getAttribute("data-name")] - score[b.el.getAttribute("data-name")]; };
    var age = function (it) { var n = it.el.getAttribute("data-name"); return n in litOrder ? litOrder[n] : -1; };
    pool.sort(by);
    if (score[pool[0].el.getAttribute("data-name")] <= 2 * PULSE_EVERY) return pool[0];
    var strict = candidates(0.95, 0.6, want);   // fully faded in, facing you
    var loose = candidates(0.6, 0.35, want);
    var lists = [strict[0], loose[0], strict[1], loose[1], pool];
    for (var k = 0; k < lists.length; k++) {
      if (lists[k].length) {
        lists[k].forEach(function (it) {
          var n = it.el.getAttribute("data-name");
          if (!(n in score)) score[n] = urgency(n);
        });
        // never lit, or lit longest ago, first; then the one leaving soonest
        lists[k].sort(function (a, b) { return age(a) - age(b) || by(a, b); });
        return lists[k][0];
      }
    }
    return null;
  }
  function pulse() {
    if (!running) return;
    var it = pick();
    if (!it) return; // nothing fresh in view: wait for the globe to turn one in
    pulseIndex++;
    pulseCount++;
    litOrder[it.el.getAttribute("data-name")] = pulseCount;
    it.el.classList.remove("is-pulsing");
    void it.el.offsetWidth; // restart the animation if it ran before
    it.el.classList.add("is-pulsing");
  }
  layer.addEventListener("animationend", function (e) {
    e.target.classList.remove("is-pulsing");
  });

  // script.js sets data-motion ("on" or "paused", from the play/pause
  // button) before this file runs. If it is missing, script.js failed and
  // there is no play/pause button, so the globe holds still.
  function motionAllowed() { return document.documentElement.dataset.motion === "on"; }
  function start() {
    if (running || reduceMotion || !motionAllowed() || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
    pulseTimer = setInterval(pulse, PULSE_EVERY);
    pulseKick = setTimeout(pulse, 600);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    clearInterval(pulseTimer);
    clearTimeout(pulseKick);
    [].forEach.call(layer.querySelectorAll(".is-pulsing"), function (el) { el.classList.remove("is-pulsing"); });
  }

  var resizeTimer, lastW = 0;
  function rebuild() {
    if (area.clientWidth === lastW && items.length) return; // ignore mobile toolbar height changes
    lastW = area.clientWidth;
    build();
  }
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuild, 150);
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });
  // The address check's answer line changed the text's shape (script.js).
  document.addEventListener("suho:area-layout", function () {
    textBoxes = measureText();
    findReachable();
    if (!running) draw();
  });
  document.addEventListener("suho:motion", function () {
    if (motionAllowed()) start(); else stop(); // names stay where they are while stopped
  });
  // "Reduce motion" switched on or off during the visit.
  function onMotionPref() {
    reduceMotion = motionQuery.matches;
    textBoxes = measureText(); // the play/pause button shows or hides with this setting
    findReachable();
    if (reduceMotion) stop(); else start();
  }
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionPref);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionPref);

  rebuild();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { lastW = 0; rebuild(); });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }).observe(area);
  } else {
    visible = true;
    start();
  }
})();
