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
  SQUARE_BOOKING_URL: "{{SQUARE_BOOKING_URL}}",

  // Optional: a Square link that opens straight to one service. Leave "" to use SQUARE_BOOKING_URL.
  SQUARE_SERVICE_URLS: {
    autoRefresh: "",        // AUTO REFRESH ($65)
    motorcycleRefresh: ""   // MOTORCYCLE REFRESH ($50)
  }
};

/* Recent work: put photo files in assets/gallery/ and list them here.
   The "Recent work" section appears once at least one photo is listed.
   Captions: plain facts written by Umair (vehicle and service).
   Example:
     { file: "01-sedan-exterior.jpg", alt: "Black sedan after an exterior wash", caption: "Sedan, Auto Refresh" },
*/
const GALLERY = [
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
  if (grid) {
    GALLERY.forEach((photo) => {
      if (!photo || !photo.file) return;
      const fig = document.createElement("figure");
      fig.className = "photo";
      const img = document.createElement("img");
      img.src = "assets/gallery/" + photo.file;
      img.alt = photo.alt || "SUHO Detailing work in Houston, TX";
      img.loading = "lazy";
      img.decoding = "async";
      fig.appendChild(img);
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
     "Pause animations" button (remembered on this device).
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
