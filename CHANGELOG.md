# Changelog

## [v0.4.0] - 2026-11-04

### Added
- How it works: one looping 8-second scene above the steps. A clock's hands turn, the clock becomes a red check mark, a location pin drops in, then a car drives in and pulls away. Step numbers 1, 2 and 3 light up red in sync. It starts when scrolled into view and pauses when off screen. With "reduce motion" it shows a still check mark.
- Square booking wiring: optional per-service Square links (`SQUARE_SERVICE_URLS` in `script.js`) for the Book Auto Refresh and Book Motorcycle Refresh buttons. They fall back to the main booking link, then to the Contact section. README has step-by-step Square Appointments setup.

## [v0.3.2] - 2026-11-04

### Fixed
- Stale styles after an update. GitHub Pages lets browsers keep files for 10 minutes, so a visitor could get the new page with the old stylesheet. The service-area names then showed as plain text. `styles.css`, `script.js` and `theme.js` are now linked with a version number (`?v=0.3.2`) that changes with each release, so browsers fetch the matching files.

## [v0.3.1] - 2026-11-04

### Added
- Service Area tile: the 92 Census places within 35 miles of downtown Houston (23 Census Designated Places and 69 incorporated cities, towns and villages, from the 2024 U.S. Census Gazetteer) drift slowly right to left in faint rows behind the headline. They fade at the edges and behind the text, are listed once for screen readers, and hold still with "reduce motion".

## [v0.3.0] - 2026-11-04

A simpler, cleaner design modeled on apple.com and Apple's Human Interface Guidelines.

### Changed
- Full-width black and soft-gray tiles with centered headlines, Apple's type scale (hero 56, headline 48, subhead 28, body 17, small 12), semantic light/dark colors, and pill buttons (filled + outlined). Thin translucent global nav, and a small gray Apple-style footer.
- Pricing cards: flat gray cards with hairline-separated features. The red left edge and large red right-aligned prices stay.
- Light by day / dark after sunset stays. The appearance button now shows Automatic, Light or Dark with a single icon, and theme changes use a plain crossfade.
- Motion reduced to a short fade-in as content scrolls into view (none with "reduce motion"). The fade-in now actually runs: in v0.2.0 a missing class meant it never did.

### Removed
- Floating tags, moving outlines, glows, cursor spotlights, card tilt, magnetic buttons, marquee, radar animation, rotating border, grain and ambient background, scroll progress bar, and the floating phone action bar.

## [v0.2.0] - 2026-11-03

A full visual redesign, plus automatic light and dark mode.

### Added
- **Light by day, dark after sunset.** The theme follows Houston's sunrise and sunset, worked out in the browser, and switches live while the page is open. A header button cycles Auto, Light and Dark, and remembers the visitor's choice. Theme changes play a circular reveal where supported.
- **Why SUHO section** in a grid layout: we come to you, motorcycles too, prices up front, text/call/DM, and "Sleeves up. Hands on." Copy is based on Houston market research and limited to claims that are true today.
- **Sticky action bar on phones** (Book, Call, Text) that appears after the hero.
- Scrolling marquee band; floating service tags in the hero (desktop); scroll progress bar; nav highlight for the current section.
- Animated service-area radar around Houston, TX.
- Transparent white and near-black logo versions so the logo works on both themes.
- Offer data for both services in the search data (JSON-LD).

### Changed
- New look throughout: drifting background light, fine grain, frosted glass surfaces, cursor-following spotlights on cards, slight 3D tilt on pricing cards, magnetic buttons with a light sweep, word-by-word headline entrance, scroll reveals, rotating red edge on the booking panel, and a large gradient wordmark in the footer.
- Motion follows one easing curve. Hover feedback is under 250ms, and looping motion is slow. With "reduce motion" turned on, everything holds still.
- On phones, cards use a near-solid surface instead of glass blur so scrolling stays smooth.

## [v0.1.2] - 2026-11-03

### Changed
- Price sheet PDF (`assets/pricing.pdf`) re-set in Inter Tight to match the site. Layout, colors, logo, prices, and wording are unchanged.

### Added
- `price-sheet/` folder with the price sheet's HTML source and steps to rebuild the PDF.

## [v0.1.1] - 2026-11-03

### Changed
- Site address set to the free GitHub Pages address, `zeditor504.github.io/suho-auto-detailing`, so link previews, the canonical link, and search data work as soon as Pages is on.
- Removed the placeholder `CNAME` file (it would break the Pages build until a real domain exists). The README explains how to add one later.

### Still to fill in
- `{{SQUARE_BOOKING_URL}}`. Until set, Book buttons jump to the Contact section.

## [v0.1.0] - 2026-11-03

First preview release of the SUHO Detailing one-page site.

### Added
- One-page site: hero, services and pricing, how it works, service area, gallery (6 placeholder tiles), booking, contact, footer.
- Pricing cards for Auto Refresh ($65) and Motorcycle Refresh ($50), copied exactly from the official price sheet, plus a link to the price sheet PDF.
- Logo, cropped wordmark, favicon, and apple-touch icon cut from the logo.
- Design in the style of theapexcrm.com (big sentence-case headings, rounded cards, pill buttons, frosted header, scroll reveal), using the brand's black background, the logo red (#ff0005), and Inter Tight.
- Tap to call, tap to text, and email for (346) 698-3058 and uasarwar@icloud.com, plus Instagram.
- Open Graph and Twitter card tags, AutoWash (LocalBusiness) JSON-LD, Share button (Web Share API with copy-link fallback).
- README with placeholder, gallery, and GitHub Pages custom-domain instructions.
- Release workflow that packages the site as a zip when a version tag is pushed.

### Still to fill in
- `{{DOMAIN}}` (CNAME, link-preview tags) and `{{SQUARE_BOOKING_URL}}` (Book buttons). Until set, Book buttons jump to the Contact section.
