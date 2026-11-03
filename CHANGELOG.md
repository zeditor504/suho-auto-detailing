# Changelog

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
