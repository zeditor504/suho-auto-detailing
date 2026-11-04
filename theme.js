/* SUHO Detailing: day/night theme.
   Light mode between sunrise and sunset in Houston, TX; dark mode after sunset.
   Loaded in <head> (not deferred) so the right theme is set before first paint.
   Visitors can override with the theme button (Auto -> Light -> Dark). */
(function () {
  "use strict";

  // Houston, TX. The business serves Houston, so the site follows Houston's sun.
  var LAT = 29.7604, LNG = -95.3698;
  var KEY = "suho-theme"; // "auto" | "light" | "dark"

  // --- Sunrise / sunset (standard NOAA-style solar equations) ---
  var rad = Math.PI / 180, dayMs = 864e5, J1970 = 2440588, J2000 = 2451545, J0 = 0.0009;
  var obliquity = rad * 23.4397;
  function toDays(d) { return d.valueOf() / dayMs - 0.5 + J1970 - J2000; }
  function fromJulian(j) { return new Date((j + 0.5 - J1970) * dayMs); }
  function meanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }
  function eclipticLng(M) {
    var C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    return M + C + rad * 102.9372 + Math.PI;
  }
  function transit(ds, M, L) { return J2000 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L); }

  function sunTimes(date) {
    var lw = rad * -LNG, phi = rad * LAT;
    var n = Math.round(toDays(date) - J0 - lw / (2 * Math.PI));
    var ds = J0 + lw / (2 * Math.PI) + n;
    var M = meanAnomaly(ds), L = eclipticLng(M);
    var dec = Math.asin(Math.sin(obliquity) * Math.sin(L));
    var noon = transit(ds, M, L);
    var h0 = rad * -0.833; // sun's upper edge at the horizon, with refraction
    var w = Math.acos((Math.sin(h0) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    var set = transit(J0 + (w + lw) / (2 * Math.PI) + n, M, L);
    return { sunrise: fromJulian(noon - (set - noon)), sunset: fromJulian(set) };
  }

  function isDaytime(now) {
    var t = sunTimes(now);
    return now >= t.sunrise && now < t.sunset;
  }

  // Next sunrise or sunset after `now` (for scheduling the automatic switch).
  function nextChange(now) {
    var candidates = [];
    [-1, 0, 1].forEach(function (offset) {
      var t = sunTimes(new Date(now.valueOf() + offset * dayMs));
      candidates.push(t.sunrise, t.sunset);
    });
    candidates = candidates.filter(function (d) { return d > now; }).sort(function (a, b) { return a - b; });
    return candidates[0];
  }

  function getMode() {
    try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; }
  }
  function saveMode(mode) {
    try {
      if (mode === "auto") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) { /* storage blocked: the choice lasts for this visit only */ }
  }

  var currentMode = getMode();

  function resolve(mode) {
    if (mode === "light" || mode === "dark") return mode;
    return isDaytime(new Date()) ? "light" : "dark";
  }

  function apply(mode) {
    var root = document.documentElement;
    var theme = resolve(mode);
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-theme-mode", mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#161617" : "#fafafc");
    return theme;
  }

  apply(currentMode);
  // Lets the stylesheet know scripts are running (used for the fade-in on scroll).
  document.documentElement.classList.add("js");

  window.SUHOTheme = {
    sunTimes: sunTimes,
    nextChange: nextChange,
    mode: function () { return currentMode; },
    theme: function () { return document.documentElement.getAttribute("data-theme"); },
    set: function (mode) { currentMode = mode; saveMode(mode); return apply(mode); },
    refresh: function () { return apply(currentMode); }
  };
})();
