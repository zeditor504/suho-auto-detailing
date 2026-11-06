/* =====================================================================
   SUHO Detailing: site config. EDIT THIS BLOCK.
   index.html already carries the phone number and email as plain links, so
   the page works with scripts off. This block is the source of truth:
   script.js rewrites those links from it. Values still written as "{{...}}"
   are treated as not set yet.
   ===================================================================== */
const CONFIG = {
  PHONE: "(346) 698-3058",
  EMAIL: "uasarwar@icloud.com",
  DOMAIN: "zeditor504.github.io/suho-auto-detailing", // site address, no https:// (swap for your own domain later)

  // Your Square Appointments booking page (see README, "Booking with Square").
  // Until it is set, every booking button says "Text to book" and opens a text
  // message with a short note already written, so keep PHONE filled in until then.
  SQUARE_BOOKING_URL: "https://book.squareup.com/appointments/wh7iodku2zdf8t/location/LB0XJ4A4B422F/services",

  // Optional: a Square link that opens straight to one service. Leave "" to use SQUARE_BOOKING_URL.
  SQUARE_SERVICE_URLS: {
    autoRefresh: "https://book.squareup.com/appointments/wh7iodku2zdf8t/location/LB0XJ4A4B422F/services/KRA2DQTMTGKXFLLWKCQ7CIME",       // AUTO REFRESH ($65)
    motorcycleRefresh: "https://book.squareup.com/appointments/wh7iodku2zdf8t/location/LB0XJ4A4B422F/services/IKKDIGKH36AIPJO5TBCATKIC"  // MOTORCYCLE REFRESH ($50)
  }
};

/* Recent work: put photo files in assets/gallery/ and list them here.
   The "Recent work" section appears once at least one photo is listed.
   Captions: plain facts written by Umair (vehicle and service).
   Add "before" (a photo of the same spot, same angle, before the job) to
   show the pair as a before/after slider that visitors can drag.
   Examples:
     { file: "01-sedan-exterior.jpg", alt: "Black sedan after an exterior wash", caption: "Sedan, Auto Refresh" },
     { file: "02-seats-after.jpg", before: "02-seats-before.jpg", alt: "Front seats of an SUV", caption: "SUV, Auto Refresh" },
*/
const GALLERY = [
];

/* Reviews: real reviews only, copied word for word with the customer's OK.
   The "What customers say" section appears once one is listed.
   "stars" is optional (1 to 5). "source" is where it was posted, if anywhere.
   Example:
     { name: "Maria G.", text: "Showed up on time and the car looks new inside.", stars: 5, source: "Google" },
*/
const REVIEWS = [
];
/* ======================== END OF CONFIG ============================= */

(function () {
  "use strict";

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches; // kept current below if the setting changes mid-visit

  // A value counts as "set" once it is no longer a {{PLACEHOLDER}}.
  const isSet = (v) =>
    typeof v === "string" && v.trim() !== "" && !/^\{\{[A-Z_]+\}\}$/.test(v.trim());

  const domain = isSet(CONFIG.DOMAIN)
    ? CONFIG.DOMAIN.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "")
    : "";

  // Phone digits for tel:/sms: links. A 10-digit US number gets +1.
  let tel = "";
  if (isSet(CONFIG.PHONE)) {
    tel = CONFIG.PHONE.replace(/[^\d+]/g, "");
    if (/^\d{10}$/.test(tel)) tel = "+1" + tel;
  }
  const email = isSet(CONFIG.EMAIL) ? CONFIG.EMAIL.trim() : "";
  const booking = isSet(CONFIG.SQUARE_BOOKING_URL) ? CONFIG.SQUARE_BOOKING_URL.trim() : "";
  const phoneText = isSet(CONFIG.PHONE) ? CONFIG.PHONE.trim() : "";

  /* ---- Links: booking, call, text, email ---- */
  const serviceUrl = (key) => {
    const v = CONFIG.SQUARE_SERVICE_URLS && CONFIG.SQUARE_SERVICE_URLS[key];
    return isSet(v) ? v.trim() : booking;
  };
  const LINKS = {
    booking: booking,
    "booking-auto": serviceUrl("autoRefresh"),
    "booking-motorcycle": serviceUrl("motorcycleRefresh"),
    call: tel ? "tel:" + tel : "",
    sms: tel ? "sms:" + tel : "",
    email: email ? "mailto:" + email : ""
  };
  // "?&body=" is the form both iPhone and Android Messages accept.
  const smsWithBody = (body) => (LINKS.sms ? LINKS.sms + "?&body=" + encodeURIComponent(body) : "");

  document.querySelectorAll("[data-link]").forEach((el) => {
    const kind = el.getAttribute("data-link");
    const isBooking = kind.indexOf("booking") === 0;
    if (isBooking && booking) {
      el.setAttribute("href", LINKS[kind]);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      if (el.dataset.bookLabel) el.textContent = el.dataset.bookLabel;
      return;
    }
    const url = el.dataset.smsBody ? smsWithBody(el.dataset.smsBody) : LINKS[kind];
    if (url) {
      el.setAttribute("href", url);
      return;
    }
    // Not set: drop the line it sits in, or send booking buttons to the contact list.
    const optional = el.closest("[data-optional]");
    if (optional) optional.hidden = true;
    else if (isBooking) {
      el.setAttribute("href", "#contact");
      if (el.dataset.contactLabel) el.textContent = el.dataset.contactLabel;
    }
  });

  document.querySelectorAll("[data-text]").forEach((el) => {
    const kind = el.getAttribute("data-text");
    if (kind === "phone" && phoneText) el.textContent = phoneText;
    if (kind === "email" && email) el.textContent = email;
  });

  // Copy that only makes sense with (or without) online booking.
  document.querySelectorAll("[data-when-booking]").forEach((el) => { el.hidden = !booking; });
  document.querySelectorAll("[data-when-no-booking]").forEach((el) => { el.hidden = !!booking; });

  /* ---- Recent work ---- */
  const gallerySection = document.getElementById("gallery");
  const grid = document.getElementById("gallery-grid");
  let photos = 0;
  const photoImg = (file, alt) => {
    const img = document.createElement("img");
    img.src = "assets/gallery/" + file;
    img.alt = alt;
    img.loading = "lazy";
    img.decoding = "async";
    return img;
  };
  // Before/after: the "before" photo sits on top, cut off at the handle.
  // A transparent range input on top does the dragging, so touch, mouse
  // and the arrow keys all work, and screen readers announce the value.
  function beforeAfter(photo, alt) {
    const box = document.createElement("div");
    box.className = "ba";
    const after = photoImg(photo.file, alt + ", after");
    const before = photoImg(photo.before, alt + ", before");
    before.className = "ba-before";
    const line = document.createElement("span");
    line.className = "ba-line";
    line.setAttribute("aria-hidden", "true");
    const tagB = document.createElement("span");
    tagB.className = "ba-tag ba-tag-before";
    tagB.textContent = "Before";
    tagB.setAttribute("aria-hidden", "true");
    const tagA = document.createElement("span");
    tagA.className = "ba-tag ba-tag-after";
    tagA.textContent = "After";
    tagA.setAttribute("aria-hidden", "true");
    const range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.value = "50";
    range.setAttribute("aria-label", "Before and after: slide to compare");
    range.addEventListener("input", () => { box.style.setProperty("--pos", range.value + "%"); });
    box.append(after, before, line, tagB, tagA, range);
    return box;
  }
  if (grid) {
    GALLERY.forEach((photo) => {
      if (!photo || !photo.file) return;
      const fig = document.createElement("figure");
      fig.className = "photo";
      const alt = photo.alt || "SUHO Detailing work in Houston, TX";
      if (photo.before) {
        fig.classList.add("photo-ba");
        fig.appendChild(beforeAfter(photo, alt));
      } else {
        fig.appendChild(photoImg(photo.file, alt));
      }
      if (photo.caption) {
        const cap = document.createElement("figcaption");
        cap.textContent = photo.caption;
        fig.appendChild(cap);
      }
      grid.appendChild(fig);
      photos++;
    });
  }
  if (photos && gallerySection) {
    gallerySection.hidden = false;
    const empty = gallerySection.querySelector("[data-gallery-empty]");
    if (empty) empty.remove(); // so the photos sit the usual 24px below the heading
  }

  /* ---- Reviews ---- */
  const reviewsSection = document.getElementById("reviews");
  const reviewsList = document.getElementById("reviews-list");
  let reviewCount = 0;
  if (reviewsList) {
    REVIEWS.forEach((r) => {
      if (!r || !r.text || !r.name) return;
      const fig = document.createElement("figure");
      fig.className = "review";
      const stars = Math.round(Number(r.stars));
      if (stars >= 1 && stars <= 5) {
        const s = document.createElement("p");
        s.className = "review-stars";
        s.textContent = "\u2605".repeat(stars);
        s.setAttribute("aria-label", stars + " out of 5 stars");
        s.setAttribute("role", "img");
        fig.appendChild(s);
      }
      const q = document.createElement("blockquote");
      q.textContent = r.text;
      fig.appendChild(q);
      const cap = document.createElement("figcaption");
      const who = document.createElement("strong");
      who.textContent = r.name;
      cap.appendChild(who);
      if (r.source) cap.appendChild(document.createTextNode(", " + r.source));
      fig.appendChild(cap);
      reviewsList.appendChild(fig);
      reviewCount++;
    });
  }
  if (reviewCount && reviewsSection) reviewsSection.hidden = false;

  /* ---- Header line, section highlight, phone dock ---- */
  const top = document.querySelector(".site-top");
  const hero = document.querySelector(".hero");
  const dock = document.querySelector("[data-dock]");
  const contact = document.getElementById("contact");
  if ("IntersectionObserver" in window && hero) {
    let heroOut = false, contactIn = false;
    const syncDock = () => {
      if (!dock) return;
      const show = heroOut && !contactIn; // the contact band has the same buttons
      dock.classList.toggle("is-shown", show);
      dock.inert = !show;
    };
    if (dock && Array.prototype.some.call(dock.querySelectorAll("a"), (a) => !a.hidden)) {
      dock.hidden = false;
      document.body.classList.add("has-dock");
      dock.inert = true;
    }
    new IntersectionObserver((entries) => {
      heroOut = !entries[0].isIntersecting;
      if (top) top.classList.toggle("is-scrolled", entries[0].intersectionRatio < 1 || heroOut);
      hero.classList.toggle("is-offscreen", heroOut);
      syncDock();
    }, { threshold: [0, 1] }).observe(hero);
    if (contact) {
      new IntersectionObserver((entries) => {
        contactIn = entries[0].isIntersecting;
        syncDock();
      }, { threshold: 0.15 }).observe(contact);
    }

    // Highlight the header link of the section in the middle of the screen.
    const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
    const bySection = new Map();
    navLinks.forEach((a) => {
      const sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec) bySection.set(sec, a);
    });
    if (bySection.size) {
      const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          const a = bySection.get(e.target);
          if (e.isIntersecting) {
            navLinks.forEach((l) => l.removeAttribute("aria-current"));
            a.setAttribute("aria-current", "true");
          } else if (a.getAttribute("aria-current")) {
            a.removeAttribute("aria-current");
          }
        });
      }, { rootMargin: "-45% 0px -54% 0px" }); // a thin line across the middle of the screen
      bySection.forEach((a, sec) => navObserver.observe(sec));
    }
  }

  /* =================================================================
     Address check: do we come to you?
     Suggestions come from Photon (photon.komoot.io, free, no key), which
     searches OpenStreetMap data. Results lean toward Cypress, but a city
     or town named exactly what the visitor typed always comes first, found
     anywhere in the US if need be ("Austin, TX" is the city of Austin, 135
     miles away, never a street or school nearby). An optional state
     ("Richmond, VA") picks which one. Counties and states are never
     matched: they are too big to measure to. The distance is a straight line from
     Cypress, TX, where Umair is based (the same point as the JSON-LD
     service area), checked against the 30-mile radius. Places in EXCLUDE
     are always outside, whatever the distance. "Use my current location" asks the device
     (GPS or Wi-Fi) instead, and names the place with Photon's reverse lookup.
     ================================================================= */
  const AREA = { lat: 29.9691, lng: -95.6972, miles: 30, from: "Cypress" };
  const EXCLUDE = ["Spring", "Galveston"]; // never served, even inside the radius
  const PHOTON = "https://photon.komoot.io";
  // Everything but county, state and country results (a county's middle can
  // be 30 miles from anywhere in it, so it can't answer "do you come to me?").
  const LAYERS = "&layer=house&layer=street&layer=locality&layer=district&layer=city&layer=other";
  // Streets and addresses are looked for within roughly 100 miles of Houston,
  // so "123 Oak Ln" never lands in another state. Only a city or town with the
  // exact typed name is looked up beyond that (see search()).
  const BBOX = "-97.2,28.3,-93.5,31.3";
  const checkForm = document.querySelector("[data-check]");
  if (checkForm && window.fetch && window.Promise) {
    const input = checkForm.querySelector(".check-input");
    const list = checkForm.querySelector(".check-list");
    const result = checkForm.querySelector(".check-result");
    const clearBtn = checkForm.querySelector(".check-clear");
    const locateBtn = checkForm.querySelector(".check-locate");
    const fallback = document.querySelector("[data-check-fallback]");
    checkForm.hidden = false;
    if (fallback) fallback.hidden = true;
    document.querySelectorAll("[data-check-link]").forEach((a) => { a.hidden = false; });
    if (navigator.geolocation && window.isSecureContext !== false) locateBtn.hidden = false;

    const cache = new Map();
    let options = [], active = -1, timer = 0, ctrl = null, seq = 0, chosen = null;

    const toRad = (d) => (d * Math.PI) / 180;
    function milesFromBase(lat, lng) {
      const dLat = toRad(lat - AREA.lat), dLng = toRad(lng - AREA.lng);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(AREA.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
      return 3958.8 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
    }
    // Whole miles, but one decimal near the edge so 30.4 never reads as "30".
    const fmtMiles = (d) => {
      const v = d < 10 || Math.abs(d - AREA.miles) < 1.5 ? Math.round(d * 10) / 10 : Math.round(d);
      return v + (v === 1 ? " mile" : " miles");
    };

    const STATES = {
      Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO",
      Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC", Florida: "FL", Georgia: "GA",
      Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY",
      Louisiana: "LA", Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
      Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV", "New Hampshire": "NH",
      "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND",
      Ohio: "OH", Oklahoma: "OK", Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI",
      "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
      Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY"
    };
    const PLACE_TYPES = /^(city|town|village|hamlet|locality|district|suburb)$/;
    function describe(f) {
      const p = f.properties || {};
      const street = [p.housenumber, p.street].filter(Boolean).join(" ");
      const isPlace = PLACE_TYPES.test(p.type || "");
      const town = (isPlace && p.name) || p.city || p.town || p.village || p.district ||
        (p.county ? p.county + " County" : "");
      // a whole town has no one ZIP code (and OpenStreetMap's can be wrong), so towns get none
      const region = [STATES[p.state] || p.state, isPlace ? "" : p.postcode].filter(Boolean).join(" ");
      let main, sub;
      if (p.name && p.type !== "street" && p.name !== street && street) {
        main = p.name;
        sub = [street, town, region];
      } else {
        main = street || p.name || town;
        sub = [main === town ? "" : town, region];
      }
      sub = sub.filter(Boolean).join(", ");
      const c = f.geometry && f.geometry.coordinates;
      const abbr = STATES[p.state] || p.state || "";
      return {
        main: main,
        sub: sub,
        // a city or town carries its state, so "Austin, TX is 135 miles from Cypress" says which Austin
        short: isPlace && main === town ? (abbr ? main + ", " + abbr : main)
          : main === town || !town ? main : main + ", " + town,
        full: sub ? main + ", " + sub : main,
        town: town,
        isPlace: isPlace,
        name: (p.name || "").toLowerCase(),
        state: p.state || "",
        lat: c ? c[1] : NaN,
        lng: c ? c[0] : NaN
      };
    }
    function parse(json) {
      const out = [];
      ((json && json.features) || []).forEach((f) => {
        const p = f.properties || {};
        if (p.countrycode && p.countrycode !== "US") return;
        if (/^(county|state|country)$/.test(p.type || "")) return; // too big to measure to
        const d = describe(f);
        if (!d.main || isNaN(d.lat)) return;
        out.push(d);
      });
      return out;
    }
    // What the visitor typed, read as a place name with an optional state:
    // "Austin, TX", "austin texas", "Richmond, VA 23219" -> { name: "austin", state: "Texas" }.
    // Longest names first, so "West Virginia" isn't read as "Virginia".
    const STATE_NAMES = Object.keys(STATES).sort((a, b) => b.length - a.length);
    function readPlace(q) {
      let s = q.toLowerCase().replace(/[.]/g, "").replace(/\s+/g, " ").trim();
      s = s.replace(/[\s,]+(usa|us|united states)$/, "").replace(/[\s,]+\d{5}(-\d{4})?$/, "");
      let state = "";
      for (const full of STATE_NAMES) {
        // A full state name may follow a space or a comma. A two-letter code needs
        // a comma ("Richmond, VA"), except TX, so "Spring Ct" isn't read as Connecticut.
        const ab = STATES[full].toLowerCase();
        const re = new RegExp("(?:[\\s,]+" + full.toLowerCase() + "|\\s*,\\s*" + ab +
          (ab === "tx" ? "|\\s+tx" : "") + ")$");
        if (re.test(s)) { state = full; s = s.replace(re, ""); break; }
      }
      return { name: s.replace(/,$/, "").trim(), state: state };
    }
    // A city, town or neighborhood with exactly the typed name (and state, if one was typed).
    function exactPlaces(list, want) {
      return list.filter((d) => d.isPlace && d.name === want.name && (!want.state || d.state === want.state));
    }
    function photon(params) {
      return fetch(PHOTON + "/api/?" + params + "&lang=en" + LAYERS, ctrl ? { signal: ctrl.signal } : undefined)
        .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(parse);
    }
    function search(q) {
      const key = q.toLowerCase();
      if (cache.has(key)) return Promise.resolve(cache.get(key));
      if (ctrl) ctrl.abort();
      ctrl = "AbortController" in window ? new AbortController() : null;
      const want = readPlace(q);
      const near = photon("q=" + encodeURIComponent(q) + "&limit=10&lat=" + AREA.lat + "&lon=" + AREA.lng + "&bbox=" + BBOX);
      return near.then((local) => {
        // Nothing nearby has the exact name typed: look it up without the lean
        // toward Cypress, so "Austin, TX" finds the city of Austin, not Austin High School.
        if (!want.name || exactPlaces(local, want).length) return [local, []];
        return photon("q=" + encodeURIComponent(q) + "&limit=10").then((wide) => [local, wide]);
      }).then((lists) => {
        const all = lists[0].concat(lists[1]);
        // Exact-name places first: in the state typed, else Texas first, then the nearest.
        // From the wide lookup only those are kept; everything else comes from near Houston.
        const exact = exactPlaces(all, want).sort((a, b) =>
          (b.state === "Texas") - (a.state === "Texas") ||
          milesFromBase(a.lat, a.lng) - milesFromBase(b.lat, b.lng));
        const seen = new Set(), out = [];
        exact.concat(lists[0]).forEach((d) => {
          if (seen.has(d.full)) return;
          seen.add(d.full);
          out.push(d);
        });
        const top = out.slice(0, 5);
        cache.set(key, top);
        return top;
      });
    }

    function setBusy(on) { checkForm.classList.toggle("is-busy", on); }
    function closeList() {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      active = -1;
    }
    function highlight(i) {
      active = i;
      [].forEach.call(list.children, (li, n) => li.setAttribute("aria-selected", n === i ? "true" : "false"));
      if (i >= 0 && list.children[i]) {
        input.setAttribute("aria-activedescendant", list.children[i].id);
        list.children[i].scrollIntoView({ block: "nearest" });
      } else input.removeAttribute("aria-activedescendant");
    }
    function render(items, q) {
      options = items;
      list.textContent = "";
      if (!items.length) {
        if (q.length >= 3) {
          const li = document.createElement("li");
          li.className = "check-empty";
          li.setAttribute("role", "presentation");
          li.textContent = "No matches yet. Keep typing, or add the city.";
          list.appendChild(li);
          list.hidden = false;
          input.setAttribute("aria-expanded", "false");
        } else closeList();
        return;
      }
      items.forEach((it, i) => {
        const li = document.createElement("li");
        li.id = "check-opt-" + i;
        li.className = "check-opt";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        const m = document.createElement("span");
        m.className = "check-opt-main";
        m.textContent = it.main;
        li.appendChild(m);
        if (it.sub) {
          const sub = document.createElement("span");
          sub.className = "check-opt-sub";
          sub.textContent = it.sub;
          li.appendChild(sub);
        }
        // pointerdown, not click: picks before the input loses focus
        li.addEventListener("pointerdown", (e) => { e.preventDefault(); choose(it); });
        list.appendChild(li);
      });
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      highlight(-1);
    }

    function show(kind, html) {
      result.className = "check-result is-" + kind;
      result.innerHTML = html;
      document.dispatchEvent(new CustomEvent("suho:area-layout")); // area.js re-measures the text
    }
    const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const ICON_YES = '<svg class="ic" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16.5 9.5"/></svg>';
    const ICON_NO = '<svg class="ic" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';
    function bookLink(address) {
      if (booking) return '<a class="link-inline" href="' + esc(booking) + '" target="_blank" rel="noopener">Book now</a>';
      const url = smsWithBody("Hi, I'd like to book a detail at " + address + ".");
      return url ? '<a class="link-inline" href="' + esc(url) + '">Text to book at this address</a>' : "";
    }
    // Google Maps driving directions from Cypress; "leave now" shows the time in current traffic.
    function trafficLink(place) {
      const url = "https://www.google.com/maps/dir/?api=1&origin=" + AREA.lat + "," + AREA.lng +
        "&destination=" + place.lat + "," + place.lng + "&travelmode=driving";
      return '<a class="link-inline" href="' + esc(url) + '" target="_blank" rel="noopener">Drive time with live traffic (Google Maps)</a>';
    }
    function verdict(place) {
      chosen = place;
      const d = milesFromBase(place.lat, place.lng);
      const name = esc(place.short);
      const excluded = EXCLUDE.some((t) => [place.town, place.main].some((v) => v && v.toLowerCase() === t.toLowerCase()));
      if (excluded) {
        show("no", ICON_NO + "<span><strong>Sorry, that's outside our area.</strong> We don't travel to " +
          esc(EXCLUDE.find((t) => [place.town, place.main].some((v) => v && v.toLowerCase() === t.toLowerCase()))) + ".</span>");
      } else if (d <= AREA.miles) {
        const book = bookLink(place.full);
        show("yes", ICON_YES + '<span><strong>Yes, we come to you.</strong> ' + name + " is " + fmtMiles(d) +
          " from " + AREA.from + "." + (book ? " " + book : "") + " " + trafficLink(place) + "</span>");
      } else {
        show("no", ICON_NO + "<span><strong>Sorry, that's outside our area.</strong> " + name + " is " + fmtMiles(d) +
          " from " + AREA.from + ". We travel up to " + AREA.miles + " miles.</span>");
      }
    }
    function choose(place) {
      input.value = place.full;
      clearBtn.hidden = false;
      closeList();
      verdict(place);
    }
    function failed() {
      setBusy(false);
      show("error", ICON_NO + "<span>We couldn't look that up right now. Check your connection and try again.</span>");
    }

    input.addEventListener("input", () => {
      const q = input.value.trim();
      clearBtn.hidden = !input.value;
      chosen = null;
      clearTimeout(timer);
      if (q.length < 3) { closeList(); setBusy(false); return; }
      const my = ++seq;
      timer = setTimeout(() => {
        setBusy(true);
        search(q).then((items) => {
          if (my !== seq) return;
          setBusy(false);
          if (document.activeElement === input) render(items, q);
        }).catch((err) => { if (my === seq && !(err && err.name === "AbortError")) { setBusy(false); closeList(); } });
      }, 220);
    });
    input.addEventListener("keydown", (e) => {
      const open = !list.hidden && options.length;
      if (e.key === "ArrowDown" && open) { e.preventDefault(); highlight((active + 1) % options.length); }
      else if (e.key === "ArrowUp" && open) { e.preventDefault(); highlight(active <= 0 ? options.length - 1 : active - 1); }
      else if (e.key === "Escape") { if (!list.hidden) { e.preventDefault(); closeList(); } }
      else if (e.key === "Enter" && open && active >= 0) { e.preventDefault(); choose(options[active]); }
    });
    input.addEventListener("focus", () => { if (options.length && !chosen && input.value.trim().length >= 3) render(options, input.value.trim()); });
    input.addEventListener("blur", () => { setTimeout(closeList, 120); });

    // Enter or the arrow button: use the top suggestion (searching first if needed).
    checkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (chosen && chosen.full === input.value) { verdict(chosen); return; }
      if (q.length < 3) {
        show("hint", "<span>Type a street address, a neighborhood or a ZIP code.</span>");
        input.focus();
        return;
      }
      clearTimeout(timer);
      const my = ++seq;
      setBusy(true);
      search(q).then((items) => {
        if (my !== seq) return;
        setBusy(false);
        if (items.length) choose(items[0]);
        else { closeList(); show("no", ICON_NO + "<span>We couldn't find that address. Try adding the city or ZIP code.</span>"); }
      }).catch((err) => { if (!(err && err.name === "AbortError")) failed(); });
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearBtn.hidden = true;
      chosen = null;
      options = [];
      closeList();
      result.className = "check-result";
      result.textContent = "";
      document.dispatchEvent(new CustomEvent("suho:area-layout"));
      input.focus();
    });

    locateBtn.addEventListener("click", () => {
      setBusy(true);
      show("hint", "<span>Finding your location…</span>");
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        const here = { main: "Your location", sub: "", short: "Your location", full: "my current location", lat: lat, lng: lng };
        fetch(PHOTON + "/reverse?lat=" + lat + "&lon=" + lng + "&lang=en")
          .then((r) => (r.ok ? r.json() : null))
          .then((json) => {
            const found = json && json.features && json.features[0] ? describe(json.features[0]) : null;
            setBusy(false);
            if (found && found.main) {
              found.lat = lat; found.lng = lng; // measure from where the device is, not the street's midpoint
              input.value = found.full;
              clearBtn.hidden = false;
              verdict(found);
            } else verdict(here);
          })
          .catch(() => { setBusy(false); verdict(here); });
      }, (err) => {
        setBusy(false);
        show("error", ICON_NO + "<span>" + (err && err.code === 1
          ? "Location is turned off for this site. Type your address instead."
          : "We couldn't get your location. Type your address instead.") + "</span>");
        input.focus();
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 });
    });
  }

  /* ---- Footer year ---- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---- Toast ---- */
  const toastEl = document.querySelector(".toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2400);
  }

  /* =================================================================
     Appearance: light from sunrise to sunset in Houston, dark after
     (theme.js). There is no manual switch. While the page is open it
     changes over at sunrise and sunset with a short crossfade.
     ================================================================= */
  const Theme = window.SUHOTheme;
  function refreshTheme() {
    if (!Theme || Theme.wanted() === Theme.theme()) return;
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => Theme.refresh());
    else Theme.refresh();
  }
  let sunTimer;
  function scheduleSun() {
    if (!Theme) return;
    clearTimeout(sunTimer);
    const wait = Math.min(Math.max(Theme.nextChange(new Date()) - new Date() + 1000, 1000), 6 * 3600 * 1000);
    sunTimer = setTimeout(() => { refreshTheme(); scheduleSun(); }, wait);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") { refreshTheme(); scheduleSun(); }
  });
  scheduleSun();

  /* ---- Share (Web Share API, copy-link fallback) ---- */
  function legacyCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  async function sharePage() {
    const url = domain ? "https://" + domain + "/" : location.href.split("#")[0];
    const data = {
      title: "SUHO Detailing",
      text: "Mobile car and motorcycle detailing in Houston, TX. We come to you.",
      url: url
    };
    if (navigator.share) {
      try { await navigator.share(data); return; }
      catch (err) { if (err && err.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch (e) {
      if (legacyCopy(url)) toast("Link copied");
      else window.prompt("Copy this link:", url);
    }
  }
  document.querySelectorAll(".js-share").forEach((btn) => {
    btn.hidden = false;
    btn.addEventListener("click", sharePage);
  });

  /* =================================================================
     Motion: the how-it-works loop and the service-area globe.
     Both stop off screen, with "reduce motion", and with the
     play/pause button in the service-area band (remembered on this device).
     ================================================================= */
  const root = document.documentElement;
  const MOTION_KEY = "suho-motion";
  let motion = "on";
  try { if (localStorage.getItem(MOTION_KEY) === "paused") motion = "paused"; } catch (e) { /* storage blocked */ }
  root.dataset.motion = motion;

  const how = document.getElementById("how");
  let howVisible = false;
  function syncHow() {
    if (!how) return;
    if (reduceMotion || root.dataset.motion === "paused") how.classList.remove("how-playing"); // still check-mark frame
    else if (howVisible) how.classList.add("how-playing"); // all parts start together
    how.classList.toggle("how-paused", !howVisible);
  }
  if (how && "IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      howVisible = entries[0].isIntersecting;
      syncHow();
    }, { threshold: 0.2 }).observe(how);
  }

  // The play/pause button at the bottom of the service-area band. It shows a
  // pause or play icon (styles.css) and says what it does in its label.
  const motionBtn = document.querySelector(".js-motion");
  const motionLabel = () => (root.dataset.motion === "paused" ? "Play animations" : "Pause animations");
  function labelMotion() {
    motionBtn.setAttribute("aria-label", motionLabel());
    motionBtn.title = motionLabel();
  }
  if (motionBtn) {
    labelMotion();
    motionBtn.hidden = reduceMotion; // nothing moves with "reduce motion", so there is nothing to pause
    motionBtn.addEventListener("click", () => {
      root.dataset.motion = root.dataset.motion === "paused" ? "on" : "paused";
      try {
        if (root.dataset.motion === "paused") localStorage.setItem(MOTION_KEY, "paused");
        else localStorage.removeItem(MOTION_KEY);
      } catch (e) { /* storage blocked: the choice lasts for this visit only */ }
      labelMotion();
      syncHow();
      document.dispatchEvent(new CustomEvent("suho:motion"));
    });
  }

  // "Reduce motion" switched on or off during the visit (area.js listens too).
  function onMotionPref() {
    reduceMotion = motionQuery.matches;
    if (motionBtn) motionBtn.hidden = reduceMotion;
    syncHow();
  }
  if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionPref);
  else if (motionQuery.addListener) motionQuery.addListener(onMotionPref);
})();
