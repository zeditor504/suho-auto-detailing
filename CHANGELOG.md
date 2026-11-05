# Changelog

## [v0.8.0] - 2026-11-05

A redesign after the layouts of well-run detailing sites (the offer readable in the first few seconds, a booking button always in reach, prices in full, a quick service-area check, answers to the usual questions), keeping SUHO's own pieces: the logo's line-drawn car, the globe of place names, Houston's sunrise and sunset theme and the how-it-works loop.

### Added
- **Address check** in the service-area band. Visitors type their address and see suggestions as they type (Photon by komoot, free and keyless, built on OpenStreetMap data, leaning toward Houston). The answer shows right under the field: green "Yes, we come to you" with the distance from downtown Houston and a **Text to book at this address** link that puts the address in the message, or red "Sorry, that's outside our area" with the distance. Enter, arrow keys, ZIP codes and neighborhood names all work. **Use my current location** checks from the device's location instead. The check is the same 25-mile circle as the JSON-LD.
- **Header that stays at the top**: logo, section links (wider screens), the phone number and the booking button. The current section's link is underlined in red.
- **Phone dock**: on phones, Call and Text to book slide up at the bottom once the hero is scrolled past, and step aside over the "Book your detail" band.
- **Hero**: the logo's line-drawn car, drawn large on black. It draws itself in once, then a band of light passes over it every few seconds, and the tail light glows red. Both prices sit under the buttons and jump to the price cards.
- **Quick facts** under the hero: We come to you, Cars and motorcycles, Prices up front, Book by text (Book online once Square is set up).
- **Questions**: five answers from facts already on the page, also as `FAQPage` JSON-LD for search engines.
- **Book your detail**: a closing black band with the booking button and the Call, Text, Email and Instagram rows.
- **Before/after sliders** in Recent work: add `before` to a `GALLERY` entry and visitors drag, or use the arrow keys, to compare.
- **Reviews** section, hidden until a real review is added to `REVIEWS` in `script.js`.
- Footer with the logo, the tagline, section links and the price sheet.

### Changed
- Layout widens from one 640px column to a 1160px grid: two price cards side by side, how-it-works copy beside its scene, and questions beside their heading on wider screens.
- Prices are cards with red check marks and a full-width booking button on phones. The text is unchanged word for word.
- Headings are upper case (by CSS) in Archivo's wider 112.5% width. Section padding is 72px on phones and 112px on wider screens.
- How it works: the step numbers sit in rings, and the scene sits on its own card.
- The service-area band is untinted so the globe sits on the page color; the address check replaces "To check your address, text us or send a DM on Instagram" (that line still shows without JavaScript).
- Browser theme color is black in both themes, to match the header.
- The play/pause button also stops the hero's band of light.
- Version bumped to 0.8.0 in the asset links.
- Service-area globe on phones and tablets: bigger names (21px on phones, 24px from 600px; was 16px), set closer together, slightly darker, and reaching nearer the top and bottom of the band, so it no longer looks sparse.
- Globe highlights: each place lights up once per round (no repeats until all 52 have had a turn), and the same name, including its other copies on the globe, never lights up twice in a row. The "Check your address" label is kept clear of names too.

## [v0.7.0] - 2026-11-05

### Changed
- How it works: the whole step line now brightens and dims in turn with the drawing, not just its number.
- Light and dark mode follow Houston's sun only: light before sunset, dark after. The appearance button is gone, and any choice saved with it is cleared.
- The service radius is spelled out: "We travel up to 25 miles from downtown Houston." The nearby-places sentence now names only places inside it (Spring, Humble, Kingwood, Pasadena, Clear Lake, Pearland, Missouri City, Sugar Land and Jersey Village); Katy and The Woodlands are farther out. The globe shows the 52 Census places within 25 miles (was 92 within 35), and the JSON-LD service area is a 25-mile circle around downtown.
- The play/pause button moved from the footer to the bottom center of the service-area band, as a pause/play icon. It still pauses both moving scenes and is remembered on the device. Globe names fade around it like they do around the text.
- With 52 names instead of 92, the globe spaces them out (about two or three copies of each around the whole globe), so the same name rarely shows twice on the visible side and never three times.

## [v0.6.0] - 2026-11-05

A plainer page: one column that reads like a printed rate card, in a new font, with the stock "landing page" parts taken out.

### Changed
- Font: **Archivo** (SIL OFL 1.1), self-hosted from `assets/fonts/` and preloaded, replacing Inter Tight from Google Fonts. Two weights (400 and 700); the headline and the two prices use Archivo's wider 112.5% width. Five type sizes, no letter-spacing anywhere. The price sheet PDF is set in the same file; its wording is unchanged word for word.
- Price sheet PDF restyled to match the site: pure black page (the box behind the logo is gone), white prices, thin lines between the two services instead of rounded dark cards, no letter-spacing, and red only on the short rule at the bottom. Same text, same order.
- Layout: one 640px left-aligned column on a plain white (day) or black (night) page. The service-area globe is the only full-width, tinted, centered block. One 4px radius, one red button with a 20px bold label.
- Colors now come straight from the logo: pure black and white, gray with no tint, and the logo red `#ff0005`. Red marks only the logo, the booking button, the footer rule and the check mark in the how-it-works drawing. The light-mode wordmark is recolored to pure black.
- Top of the page: the logo and the theme button, with no sticky nav bar. The hero is left-aligned with one button and the phone number beside it.
- Prices: "MOBILE DETAILING / HOUSTON, TX" is now the heading of the price list (text unchanged). The two services are stacked rows with thin lines between the features, not cards; the red edge stripe is gone. $65 and $50 are set as large as the headline so they read first. Each has its own booking link.
- Booking before Square is set up: every booking button says "Text to book" and opens a text message with a note already written (for example "Hi, I'd like to book an Auto Refresh."). Step 1 of How it works matches. Once `SQUARE_BOOKING_URL` is set, they switch to "Book now" / "Book Auto Refresh" / "Book Motorcycle Refresh" and open Square, and the Square line and button appear in Contact.
- How it works: one column; the step numbers darken in turn with the scene, and the drawing is black except for the red check mark.
- Service area: one heading, "Houston, TX and surrounding areas", a visible sentence naming nine nearby places, and "To check your address, text us or send a DM on Instagram." The pulse no longer glows. Names near the text now fade out on their own (no gradient patch behind the text), and the band is a little taller on phones, so the globe shows around the text there too, and pulses pick a slightly faded name when no fully clear one is free, so small phones get a pulse every 3.2 s again. The globe's names are drawn from a `data-name` attribute, so they no longer read as a long list of city names in the page text.
- Contact: one plain list (Call, Text, Email, Instagram) that also takes over the old "Book your detail" block.
- Footer: "SLEEVES UP. HANDS ON." with its short red rule, the copyright line, and Share this site.
- JSON-LD telephone is written in international form (`+1-346-698-3058`). Browser theme color is now pure white or black.

### Added
- Pause animations button in the footer. It stops the how-it-works loop and the globe, and the choice is remembered on the device. Hidden for visitors who choose "reduce motion" (nothing moves for them anyway).
- `assets/fonts/OFL.txt`, the font license.

### Fixed
- No sideways scroll in very narrow windows (below 280px, such as heavy zoom or split screen).
- If "reduce motion" is switched on during a visit, the globe and the step numbers now stop too.
- A pulse could still light up just after pressing Pause animations.
- The theme button and Pause button stay hidden if `script.js` fails to load, and the globe then holds still.
- Removing the phone number from `CONFIG` now also drops the "or call" line, the per-service text links and "text us".
- The README's placeholder check could never come back empty.

### Removed
- The "Why SUHO" icon cards, the sticky nav bar and its links, the "See Pricing" button, the black "Book your detail" tile and its confirmation line, the six "Photo coming soon" boxes, the footer link columns and theme note, the small caps "SERVICE AREA" and "SLEEVES UP. HANDS ON." labels above headings, periods on headings, and the fade-in on scroll.
- Recent work (the old gallery) is hidden until the first photo is listed in `script.js`.
- The hidden 92-name sentence for screen readers; the visible sentence replaces it.

## [v0.5.0] - 2026-11-04

### Changed
- Service area: the 92 place names now ride a slowly turning globe instead of flat rows. Every name moves right to left at the same turn rate, curving along its latitude and narrowing toward the edges. Drawn by the new `area.js`; the long repeated name rows are gone from `index.html`.

### Added
- Terrain pulse: every 3.2 seconds one name on the front of the globe lights up in an earthy color for its terrain (blue water, green woods, silver city, sand prairie), with a 0.5 s fade in, 1 s hold and 0.5 s fade out. It never lands behind the headline. No pulses and no motion with "reduce motion".

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
