/* =====================================================================
   SUHO Detailing: site config. EDIT THIS BLOCK.
   Everything on the page that uses the phone, email, site address, or
   booking link reads from here. Values still written as "{{...}}" are
   treated as not set yet.
   ===================================================================== */
const CONFIG = {
  PHONE: "(346) 698-3058",
  EMAIL: "uasarwar@icloud.com",
  DOMAIN: "zeditor504.github.io/suho-auto-detailing", // site address, no https:// (swap for your own domain later)
  SQUARE_BOOKING_URL: "{{SQUARE_BOOKING_URL}}"          // e.g. "https://book.squareup.com/appointments/..."
};

/* Gallery photos: put image files in assets/gallery/ and list them here.
   They fill the 6 tiles in order; empty tiles keep "Photo coming soon".
   Example:
     { file: "01-sedan-exterior.jpg", alt: "Black sedan after an exterior wash" },
*/
const GALLERY = [
];
/* ======================== END OF CONFIG ============================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  const LINKS = {
    booking: booking,
    call: tel ? "tel:" + tel : "",
    sms: tel ? "sms:" + tel : "",
    email: email ? "mailto:" + email : ""
  };

  document.querySelectorAll("[data-link]").forEach((el) => {
    const kind = el.getAttribute("data-link");
    const url = LINKS[kind];
    if (!url) return; // booking keeps href="#contact"; call/text/email stay hidden
    el.setAttribute("href", url);
    if (kind === "booking") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }
    const optional = el.closest("[data-optional]");
    if (optional) optional.hidden = false;
  });

  document.querySelectorAll("[data-text]").forEach((el) => {
    const kind = el.getAttribute("data-text");
    if (kind === "phone" && phoneText) el.textContent = phoneText;
    if (kind === "email" && email) el.textContent = email;
  });

  /* ---- Gallery ---- */
  const tiles = document.querySelectorAll("#gallery-grid .photo");
  GALLERY.slice(0, tiles.length).forEach((photo, i) => {
    if (!photo || !photo.file) return;
    const img = document.createElement("img");
    img.src = "assets/gallery/" + photo.file;
    img.alt = photo.alt || "SUHO Detailing work in Houston, TX";
    img.loading = "lazy";
    img.decoding = "async";
    tiles[i].replaceChildren(img);
  });

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
     Appearance: light by day, dark after sunset (Houston), with an
     override button that cycles Automatic -> Light -> Dark.
     ================================================================= */
  const Theme = window.SUHOTheme;
  const toggle = document.querySelector(".theme-toggle");
  const themeNote = document.querySelector("[data-theme-note]");
  const MODES = ["auto", "light", "dark"];
  const NAMES = { auto: "Automatic", light: "Light", dark: "Dark" };
  const timeFmt = (d) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

  function describe() {
    if (!Theme) return;
    const mode = Theme.mode();
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    let detail = "";
    if (mode === "auto") {
      const at = timeFmt(Theme.nextChange(new Date()));
      detail = Theme.theme() === "light"
        ? "Light until sunset in Houston (" + at + ")."
        : "Dark until sunrise in Houston (" + at + ").";
    }
    if (toggle) {
      toggle.setAttribute("aria-label", ["Appearance: " + NAMES[mode] + ".", detail, "Switch to " + NAMES[next] + "."].filter(Boolean).join(" "));
      toggle.title = "Appearance: " + NAMES[mode];
    }
    if (themeNote) themeNote.textContent = "Appearance: " + NAMES[mode] + (detail ? ". " + detail : "");
  }

  function setMode(mode) {
    const apply = () => { Theme.set(mode); describe(); };
    if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
    else apply();
  }

  if (Theme && toggle) {
    toggle.addEventListener("click", () => {
      const next = MODES[(MODES.indexOf(Theme.mode()) + 1) % MODES.length];
      setMode(next);
      toast("Appearance: " + NAMES[next]);
    });
  }

  // Switch at sunrise / sunset while the page is open.
  let sunTimer;
  function scheduleSun() {
    if (!Theme) return;
    clearTimeout(sunTimer);
    const wait = Math.min(Math.max(Theme.nextChange(new Date()) - new Date() + 1000, 1000), 6 * 3600 * 1000);
    sunTimer = setTimeout(() => {
      if (Theme.mode() === "auto") setMode("auto");
      scheduleSun();
    }, wait);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Theme && Theme.mode() === "auto") {
      Theme.refresh();
      describe();
      scheduleSun();
    }
  });
  describe();
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
  document.querySelectorAll(".js-share").forEach((btn) => btn.addEventListener("click", sharePage));

  /* ---- Gentle fade-in as content comes into view ---- */
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    reveals.forEach((el) => io.observe(el));
  }
})();
