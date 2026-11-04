/* SUHO Detailing: service-area globe.
   The 92 Census places within 35 miles of downtown Houston ride around a
   slowly turning globe behind "Houston, TX". Every few seconds one name
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
  ["Atascocita", "g"], ["Barrett", "p"], ["Shoreacres", "w"], ["Seabrook", "w"], ["Katy", "p"],
  ["Woodbranch", "g"], ["Patton Village", "g"], ["Splendora", "g"], ["Southside Place", "c"],
  ["Bunker Hill Village", "g"], ["Jersey Village", "c"], ["Mission Bend", "c"], ["Sienna", "p"],
  ["El Lago", "w"], ["Sandy Point", "p"], ["Dickinson", "c"], ["Dayton", "p"], ["Pleak", "p"],
  ["Brookshire", "p"], ["Bellaire", "c"], ["Aldine", "c"], ["Channelview", "w"],
  ["Four Corners", "c"], ["Spring", "g"], ["Cinco Ranch", "p"], ["Kemah", "w"], ["Bacliff", "w"],
  ["Fulshear", "p"], ["Stagecoach", "g"], ["Hilshire Village", "g"], ["South Houston", "c"],
  ["Fifth Street", "p"], ["Arcola", "p"], ["Crosby", "p"], ["Pecan Grove", "p"], ["Richmond", "w"],
  ["Rosharon", "p"], ["Beach City", "w"], ["Fairchilds", "p"], ["Jacinto City", "c"],
  ["Cloverleaf", "c"], ["Sheldon", "c"], ["Manvel", "p"], ["Webster", "c"], ["Baytown", "w"],
  ["Hillcrest Village", "p"], ["The Woodlands", "g"], ["Woodloch", "g"],
  ["Old River-Winfree", "p"], ["Hunters Creek Village", "g"], ["Brookside Village", "c"],
  ["Deer Park", "c"], ["Highlands", "w"], ["Iowa Colony", "p"], ["League City", "c"],
  ["Porter Heights", "g"], ["Shenandoah", "g"], ["San Leon", "w"], ["Cove", "p"],
  ["Galena Park", "c"], ["Pearland", "c"], ["Fresno", "p"], ["Sugar Land", "c"],
  ["Nassau Bay", "w"], ["Alvin", "p"], ["Tomball", "g"], ["Mont Belvieu", "p"],
  ["Roman Forest", "g"], ["Grangerland", "g"], ["Spring Valley Village", "g"], ["Stafford", "c"],
  ["Missouri City", "c"], ["Friendswood", "c"], ["Taylor Lake Village", "w"], ["Thompsons", "w"],
  ["Oak Ridge North", "g"], ["Santa Fe", "p"], ["Bonney", "p"], ["Weston Lakes", "p"],
  ["Piney Point Village", "g"], ["Pasadena", "c"], ["Humble", "g"], ["La Porte", "w"],
  ["Morgan's Point", "w"], ["Clear Lake Shores", "w"], ["Cumings", "p"], ["Rosenberg", "p"],
  ["Liverpool", "p"], ["Plum Grove", "g"]
  ];
  var TERRAIN = { w: "water", g: "woods", c: "city", p: "prairie" };

  var SPEED = 16;          // px per second at the front of the equator (same turn rate for every row)
  var TILT = 0.14;         // radians: the globe leans toward you a little, so rows curve like latitudes
  var LAT_MAX = 1.08;      // radians: top and bottom rows (about 62 degrees)
  var PULSE_EVERY = 3200;  // ms between pulses; each pulse is 0.5s in, 1s hold, 0.5s out (see styles.css)

  var area = document.getElementById("area");
  var layer = area && area.querySelector(".area-globe");
  if (!layer) return;
  var heading = area.querySelector(".tile-inner");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var items = [];          // { el, w, h, lat, lon, sl, cl, terrain }
  var W = 0, H = 0, RX = 0, RY = 0;
  var omega = 0;           // radians per ms
  var spin = 0;            // current rotation
  var last = 0, raf = 0, running = false, visible = false;
  var pulseTimer = 0, pulseIndex = 0, lastPulse = null;
  var cosT = Math.cos(TILT), sinT = Math.sin(TILT);

  function build() {
    layer.textContent = "";
    items = [];
    W = area.clientWidth;
    H = area.clientHeight;
    if (!W || !H) return;
    RX = W * 0.49;
    RY = H * 0.42;
    omega = SPEED / RX / 1000;

    // Measure each name once at its natural size.
    var probe = document.createElement("span");
    probe.className = "area-place";
    probe.textContent = "Mg";
    layer.appendChild(probe);
    var lineH = probe.offsetHeight;
    var gap = parseFloat(getComputedStyle(probe).fontSize) * 2;
    layer.removeChild(probe);

    // Rows evenly spaced in latitude. Text shrinks vertically toward the poles,
    // so the rows never touch.
    var rows = Math.max(3, Math.floor((2 * LAT_MAX * RY) / (lineH * 1.55)) + 1);
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
        el.textContent = it.place[0];
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
    draw();
  }

  var measurer;
  function measure(text) {
    if (!measurer) {
      measurer = document.createElement("span");
      measurer.className = "area-place";
      measurer.style.visibility = "hidden";
    }
    measurer.textContent = text;
    layer.appendChild(measurer);
    var w = measurer.offsetWidth;
    layer.removeChild(measurer);
    return w;
  }

  // Orthographic view of a sphere tilted toward the viewer. Each name is
  // placed on its latitude and turned to follow the surface.
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
        continue;
      }
      // east and south directions on the surface, after the tilt
      var ex = ct, ey = st * sinT;                 // east (cos th, 0, -sin th), tilted
      var nx = -it.sl * st;
      var ny = it.cl * cosT + it.sl * ct * sinT;   // north, tilted
      // text's x axis follows east, its y axis follows south (slant softened so it doesn't read as italics)
      var a = ex, b = -ey * k, c = -nx * 0.3, d = Math.max(ny, 0.05);
      var X = cx + RX * x, Y = cy - RY * y;
      var o = Math.min(1, z / 0.45);
      o = o * o * (3 - 2 * o);
      it.el.style.transform =
        "translate(" + (X - it.w / 2).toFixed(1) + "px," + (Y - it.h / 2).toFixed(1) + "px) " +
        "matrix(" + a.toFixed(4) + "," + b.toFixed(4) + "," + c.toFixed(4) + "," + d.toFixed(4) + ",0,0)";
      it.el.style.opacity = o.toFixed(3);
      if (!it.shown) { it.el.style.visibility = "visible"; it.shown = true; }
      it.X = X; it.Y = Y; it.ct = ct;
    }
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
  // away from the headline.
  var ORDER = ["woods", "water", "city", "prairie"];
  function pulse() {
    // Keep clear of the headline's actual lines of text.
    var base = area.getBoundingClientRect(), pad = 16, blocks = [];
    heading.querySelectorAll("p, h2").forEach(function (el) {
      if (el.classList.contains("visually-hidden")) return;
      var range = document.createRange();
      range.selectNodeContents(el);
      [].forEach.call(range.getClientRects(), function (r) {
        blocks.push([r.left - base.left - pad, r.right - base.left + pad, r.top - base.top - pad, r.bottom - base.top + pad]);
      });
    });
    var want = ORDER[pulseIndex++ % ORDER.length];
    var pool = [], fallback = [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      // facing you (fully faded in) and not squeezed at the globe's edge
      if (it.z < 0.45 || it.ct < 0.6 || it === lastPulse) continue;
      var halfW = it.w / 2, halfH = it.h / 2, behind = false;
      for (var j = 0; j < blocks.length && !behind; j++) {
        var q = blocks[j];
        behind = it.X + halfW > q[0] && it.X - halfW < q[1] && it.Y + halfH > q[2] && it.Y - halfH < q[3];
      }
      if (behind) continue;
      if (it.X - halfW < 8 || it.X + halfW > W - 8) continue;
      (it.el.getAttribute("data-terrain") === want ? pool : fallback).push(it);
    }
    var list = pool.length ? pool : fallback;
    if (!list.length) return;
    var pick = list[Math.floor(Math.random() * list.length)];
    lastPulse = pick;
    pick.el.classList.remove("is-pulsing");
    void pick.el.offsetWidth; // restart the animation if it ran before
    pick.el.classList.add("is-pulsing");
  }
  layer.addEventListener("animationend", function (e) {
    e.target.classList.remove("is-pulsing");
  });

  function start() {
    if (running || reduceMotion || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
    pulseTimer = setInterval(pulse, PULSE_EVERY);
    setTimeout(pulse, 600);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    clearInterval(pulseTimer);
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
