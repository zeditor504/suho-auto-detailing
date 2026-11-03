/* =====================================================================
   SUHO Detailing: site config. EDIT THIS BLOCK.
   Replace each "{{...}}" value below. Everything on the page that uses
   your phone, email, domain, or booking link reads from here.
   (Link previews and the CNAME file also need the domain; see README.)
   ===================================================================== */
const CONFIG = {
  PHONE: "(346) 698-3058",                          // e.g. "(713) 555-0123"
  EMAIL: "uasarwar@icloud.com",                          // e.g. "hello@suhodetailing.com"
  DOMAIN: "zeditor504.github.io/suho-auto-detailing", // site address, no https:// (swap for your own domain later)
  SQUARE_BOOKING_URL: "{{SQUARE_BOOKING_URL}}" // e.g. "https://book.squareup.com/appointments/..."
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

  const VALUES = {
    PHONE: isSet(CONFIG.PHONE) ? CONFIG.PHONE.trim() : "",
    EMAIL: email,
    DOMAIN: domain,
    SQUARE_BOOKING_URL: booking
  };
  const fillTokens = (str) =>
    str.replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => (VALUES[key] ? VALUES[key] : m));

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
    if (url) {
      el.setAttribute("href", url);
      if (kind === "booking") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
      const optional = el.closest("[data-optional]");
      if (optional) optional.hidden = false;
    }
    // If not set: booking buttons keep href="#contact"; call/text/email stay hidden.
  });

  document.querySelectorAll("[data-text]").forEach((el) => {
    const kind = el.getAttribute("data-text");
    if (kind === "phone" && VALUES.PHONE) el.textContent = VALUES.PHONE;
    if (kind === "email" && email) el.textContent = email;
  });

  /* ---- Meta tags and canonical (helps crawlers that run JavaScript) ---- */
  if (domain) {
    document
      .querySelectorAll('meta[content*="{{"], link[href*="{{"]')
      .forEach((el) => {
        const attr = el.tagName === "LINK" ? "href" : "content";
        el.setAttribute(attr, fillTokens(el.getAttribute(attr)));
      });
  }

  /* ---- JSON-LD: fill values, drop any field still holding a placeholder ---- */
  const ld = document.querySelector('script[type="application/ld+json"]');
  if (ld) {
    try {
      const data = JSON.parse(fillTokens(ld.textContent));
      Object.keys(data).forEach((k) => {
        if (typeof data[k] === "string" && data[k].indexOf("{{") !== -1) delete data[k];
      });
      ld.textContent = JSON.stringify(data);
    } catch (e) {
      /* leave the original block untouched */
    }
  }

  /* ---- Gallery ---- */
  const tiles = document.querySelectorAll("#gallery-grid .tile");
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

  /* ---- Share (Web Share API, copy-link fallback) ---- */
  const toastEl = document.querySelector(".toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 2600);
  }

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
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return; // user closed the share sheet
      }
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
    btn.addEventListener("click", sharePage);
  });

  /* ---- Scroll reveal (fade up as sections enter view) ---- */
  const reveals = document.querySelectorAll(".reveal");
  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduceMotion) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => io.observe(el));
  }
})();
