# Changelog

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
