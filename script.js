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

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

  /* =================================================================
     Theme: light by day, dark after sunset (Houston), with an override
     ================================================================= */
  const Theme = window.SUHOTheme;
  const toggle = document.querySelector(".theme-toggle");
  const themeNote = document.querySelector("[data-theme-note]");
  const MODES = ["auto", "light", "dark"];
  const timeFmt = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

  function describe() {
    if (!Theme) return;
    const mode = Theme.mode();
    const theme = Theme.theme();
    const next = Theme.nextChange(new Date());
    let label;
    if (mode === "auto") {
      label = theme === "light"
        ? "Theme: automatic. Light until sunset in Houston (" + timeFmt(next) + ")."
        : "Theme: automatic. Dark until sunrise in Houston (" + timeFmt(next) + ").";
    } else {
      label = "Theme: " + mode + ".";
    }
    const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    if (toggle) {
      toggle.setAttribute("aria-label", label + " Switch to " + nextMode + ".");
      toggle.title = label;
    }
    if (themeNote) themeNote.textContent = mode === "auto" ? label.replace("Theme: automatic. ", "") : "";
  }

  // Animate a theme change as a circle growing from (x, y).
  function withTransition(change, x, y) {
    if (!document.startViewTransition || reduceMotion) { change(); return; }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.style.setProperty("--vt-x", x + "px");
    root.style.setProperty("--vt-y", y + "px");
    root.style.setProperty("--vt-r", r + "px");
    document.startViewTransition(change);
  }

  function setTheme(next, origin) {
    const before = Theme.theme();
    const apply = () => { Theme.set(next); describe(); };
    const after = (() => { // which theme `next` resolves to
      if (next !== "auto") return next;
      const t = Theme.sunTimes(new Date()); const now = new Date();
      return now >= t.sunrise && now < t.sunset ? "light" : "dark";
    })();
    if (after === before) { apply(); return; }
    const pt = origin || { x: innerWidth / 2, y: 0 };
    withTransition(apply, pt.x, pt.y);
  }

  if (Theme && toggle) {
    toggle.addEventListener("click", () => {
      const next = MODES[(MODES.indexOf(Theme.mode()) + 1) % MODES.length];
      const b = toggle.getBoundingClientRect();
      setTheme(next, { x: b.left + b.width / 2, y: b.top + b.height / 2 });
      toast(next === "auto" ? "Theme: automatic (follows Houston sunset)" : "Theme: " + next);
    });
  }

  // Switch automatically at sunrise / sunset while the page is open.
  let sunTimer;
  function scheduleSun() {
    if (!Theme) return;
    clearTimeout(sunTimer);
    const next = Theme.nextChange(new Date());
    const wait = Math.min(Math.max(next - new Date() + 1000, 1000), 6 * 3600 * 1000);
    sunTimer = setTimeout(() => {
      if (Theme.mode() === "auto") setTheme("auto", { x: innerWidth / 2, y: 0 });
      scheduleSun();
    }, wait);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Theme && Theme.mode() === "auto") {
      setTheme("auto");
      scheduleSun();
    }
  });
  describe();
  scheduleSun();

  /* =================================================================
     Share (Web Share API, copy-link fallback)
     ================================================================= */
  const toastEl = document.querySelector(".toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.hidden = true;
    void toastEl.offsetWidth; // restart the entrance animation
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

  /* =================================================================
     Scroll: reveal on enter, progress bar, header state, action bar,
     active nav link
     ================================================================= */
  // Stagger children of [data-stagger] groups.
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      const target = child.classList.contains("reveal") ? child : child.querySelector(".reveal");
      if (target) target.style.setProperty("--i", i);
    });
  });

  const revealables = document.querySelectorAll(".reveal, .reveal-line, .steps");
  const markDone = (el) => {
    // after the entrance finishes, drop the stagger delay so hover feels instant
    setTimeout(() => el.classList.add("done"), 1400);
  };
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealables.forEach((el) => { el.classList.add("in", "done"); });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        markDone(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealables.forEach((el) => io.observe(el));
  }

  const header = document.querySelector(".site-header");
  const bar = document.querySelector(".progress span");
  const actionBar = document.querySelector(".action-bar");
  const hero = document.querySelector(".hero");
  const footer = document.querySelector(".site-footer");
  let ticking = false;

  function onScroll() {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    if (header) header.classList.toggle("scrolled", y > 24);
    if (actionBar && hero && footer) {
      const pastHero = y > hero.offsetHeight * 0.7;
      const nearFooter = footer.getBoundingClientRect().top < innerHeight - 40;
      actionBar.classList.toggle("show", pastHero && !nearFooter);
    }
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view.
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  if ("IntersectionObserver" in window && navLinks.length) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.remove("active"));
        const link = byId.get(entry.target.id);
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionIO.observe(s); });
    // back at the hero: no section is "current"
    if (hero) new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) navLinks.forEach((a) => a.classList.remove("active"));
    }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
  }

  /* =================================================================
     Pointer effects (mouse/trackpad only, and not with reduced motion):
     spotlight, card tilt, magnetic buttons, floating hero tags
     ================================================================= */
  if (finePointer && !reduceMotion) {
    // Spotlight: tell each card where the cursor is.
    document.querySelectorAll(".spot").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", e.clientX - r.left + "px");
        card.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });

    // Tilt: a few degrees toward the cursor.
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        if (!card.classList.contains("done")) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });

    // Magnetic buttons: drift toward the cursor.
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (dx * 0.18).toFixed(1) + "px," + (dy * 0.28).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });

    // Floating hero tags drift slightly against the cursor (parallax).
    const floaters = document.querySelectorAll(".floater");
    if (hero && floaters.length) {
      hero.addEventListener("pointermove", (e) => {
        const cx = e.clientX / innerWidth - 0.5;
        const cy = e.clientY / innerHeight - 0.5;
        floaters.forEach((f, i) => {
          const depth = (i % 2 ? 18 : 30);
          f.style.setProperty("--px", (-cx * depth).toFixed(1) + "px");
          f.style.setProperty("--py", (-cy * depth).toFixed(1) + "px");
        });
      });
    }
  }
})();
