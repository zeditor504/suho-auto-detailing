# SUHO Detailing website

One-page site for **Sleeves-Up Hands-On Auto Detailing** (SUHO Detailing): mobile car and motorcycle detailing in Houston, TX.

It's plain HTML, CSS, and vanilla JavaScript. There's no framework, no build step, no backend, and nothing to install. To preview it, open `index.html` in a browser.

```
index.html        the page
styles.css        all styles; light and dark theme colors are CSS variables at the top
script.js         config block at the top + behaviors (links, address check, recent work and before/after, reviews, header and phone dock, share, sunrise/sunset theme switch, play/pause button)
theme.js          picks light or dark mode from Houston's sunrise and sunset (loads first, before the page paints)
area.js           service-area globe: the place names, their terrain colors, and the turning globe
CHANGELOG.md      what changed in each release
.github/workflows/release.yml  builds a GitHub Release (with a zip of the site) when a version tag is pushed
.gitignore        keeps OS junk, editor folders, secrets, and build output out of git
.nojekyll         tells GitHub Pages to serve files as-is
assets/logo.png   original square logo (used as the social preview image)
assets/logo-wordmark-white.png  logo artwork on a transparent background, white (dark mode)
assets/logo-wordmark-ink.png    the same in black (light mode)
assets/favicon-48.png, assets/apple-touch-icon.png  icons cut from the logo
assets/pricing.pdf  official price sheet, linked as "Download price sheet (PDF)"
price-sheet/       HTML source for the price sheet PDF, with rebuild steps
assets/gallery/   drop photos of real jobs here (see section 2)
assets/fonts/     Archivo, the site's one font (self-hosted), and its license OFL.txt
```

---

## 1. Fill in the placeholders

Already set:
- Phone `(346) 698-3058` and email `uasarwar@icloud.com`.
- Site address `zeditor504.github.io/suho-auto-detailing` (the free GitHub Pages address). To switch to your own domain later, see [Moving to a custom domain](#moving-to-a-custom-domain).

One placeholder remains:

| Placeholder | What to put | Example |
|---|---|---|
| `{{SQUARE_BOOKING_URL}}` | Your Square Appointments booking page link | `https://book.squareup.com/appointments/...` |

### The main place: `script.js`

Open `script.js` and edit the `CONFIG` block at the top. That sets every booking button and the call, text, and email links. `index.html` also carries the phone number and email as plain links, so the page works even with scripts off; `script.js` rewrites them from `CONFIG` when the page loads. If you change the phone number, change it in `CONFIG` and in `index.html` (and the `telephone` line of the JSON-LD in `<head>`).

Until a value is filled in, the site handles it safely:
- **Booking buttons** say "Text to book" and open a text message to the business number with a short note already written ("Hi, I'd like to book an Auto Refresh."). Step 1 of How it works reads "Text or call with your vehicle, your location and a time that works." Nothing on the page mentions Square or online booking.
- **Call, text, and email** rows are dropped if their value is removed. Keep `PHONE` filled in until Square is set up, because booking by text depends on it. Without a phone number, the Call buttons (hero, header, phone dock), the per-service booking buttons and the "text" links are dropped, and the main buttons read "Contact" and jump to the contact list.

Once you have the Square link, paste it as `SQUARE_BOOKING_URL` in `script.js`. That's the only place it's used.

To confirm nothing was missed, run this. If it prints nothing, every placeholder is filled:

```bash
grep -nE '"\{\{[A-Z_]+\}\}"' index.html script.js
```

### Design approach

v0.8.0 follows what the best-run detailing sites have in common: the offer readable in the first few seconds, a booking button always in reach, prices in full, a quick way to check the service area, and answers to the usual questions. The rules are at the top of `styles.css`; in short:

- **Showroom framing.** The header, hero, the closing "Book your detail" band and the footer are always black with white text, like the logo. The sections between them follow Houston's sun: white by day, black after sunset.
- **Order a customer needs.** Hero (what, where, the two prices, Text to book and Call) → four quick facts → prices → Recent work and reviews (hidden until real ones exist) → how it works → service area with the **address check** → questions → book your detail → footer.
- **Booking always in reach.** The header stays at the top with the phone number and the booking button. On phones, a dock with **Call** and **Text to book** slides up once the hero is scrolled past, and hides again over the "Book your detail" band, which has the same buttons.
- **The logo's colors.** Black, white, untinted gray and the logo red `#ff0005` (buttons, check marks, the car's tail light, short accent rules). White on red is 18.66px+ bold on `#ff0005`, or on the deeper `#d70015` when smaller, so it passes WCAG AA.
- **One font.** Archivo, 400 to 700. Headings are bold, upper case (by CSS, so the page text stays in sentence case) and 112.5% wide.
- **Cards** for the prices and reviews: 16px radius, hairline border, soft shadow by day.
- **Motion.** The hero car (the logo's line drawing, drawn large) draws itself in once and a band of light passes over it every few seconds; the how-it-works loop; the globe; the sunset crossfade. The **play/pause button** at the bottom of the service-area band stops all of it (remembered on the device). Nothing moves for visitors who choose "reduce motion".

Copy rules: sentence case, no rhetorical questions in the copy (the FAQ headings are the customer's questions), and every line states something a customer can check (price, what's included, where, how to book, how to reach).

### Address check ("Do you come to me?")

In the service-area band, visitors type their address and get an answer right under the field: **green** "Yes, we come to you. Pearland is 14 miles from downtown Houston." with a **Text to book at this address** link (the text message already includes the address; it becomes **Book now** once Square is set up), or **red** "Sorry, that's outside our area. Katy is 27 miles from downtown Houston."

- **Suggestions while typing** come from [Photon](https://photon.komoot.io) by komoot: free, no account or API key, built on OpenStreetMap data. Results lean toward Houston and stay within about 100 miles of it. Arrow keys, Enter and tapping all work; pressing Enter without picking uses the top match, and ZIP codes and neighborhood names work too.
- **Use my current location** asks the phone or computer for its location (GPS or Wi-Fi) instead, then names the street with Photon. The browser asks the visitor first.
- **The rule** is a straight line from downtown Houston (Houston City Hall, 29.7604 N, 95.3698 W), 25 miles or less: the same circle as the JSON-LD. Change `AREA` in `script.js` to move the center or the radius (and update the page text and JSON-LD to match).
- **Privacy:** what a visitor types is sent to Photon to find matches; nothing goes to SUHO until they choose to text. The attribution line under the field is required by the OpenStreetMap license; keep it.
- **If Photon is down** the answer line says it couldn't look the address up. Without JavaScript, the old "To check your address, text us or send a DM on Instagram" line shows instead.
- Photon's public server is shared and meant for fair use. A one-business site is well within it. If the site ever gets heavy traffic, the same code can point at a paid Photon-compatible host by changing `PHOTON` in `script.js`. (Google's address autocomplete is the other common choice, but it needs a Google Cloud billing account and an API key.)

### Questions (FAQ)

The five answers use only facts already on the page (prices, what's included, the radius, how to book). The same answers are in the `FAQPage` JSON-LD in `<head>`, which lets search engines show them. **If you change an answer, change it in both places.** Add a question only for a fact Umair has confirmed (hours, payment, water and power needs, and so on).

### Service area place names

The service radius is **25 miles from downtown Houston**, stated on the page as "We travel up to 25 miles from downtown Houston." and in the JSON-LD as a 25-mile circle (`areaServed`, 40,234 m).

The faint names behind "Houston, TX and surrounding areas" are the 52 Census places within that radius (each shows up about two or three times around the whole globe, so few names repeat on the visible side): Census Designated Places and incorporated cities, towns and villages (Houston itself is left out). Source: the 2024 U.S. Census Gazetteer place file for Texas, with distance measured from Houston City Hall (29.7604 N, 95.3698 W) to each place's official internal point. If the radius changes, update the sentence in `index.html`, the `geoRadius` in the JSON-LD, and the `PLACES` list in `area.js`.

They ride around a slowly turning globe, right to left, all at the same turn rate (rows near the top and bottom travel a shorter circle, as on a real globe). Every 3.2 seconds one name on the front of the globe lights up in its terrain color: 0.5 s ease in, 1 s hold, 0.5 s ease out. Colors take turns so all four show up. No place lights up again until 44 others have had a turn (on phones, where some rows stay behind the text the whole way round, all but 8 of the names that can show there), so any run of highlights that long is all different places, and the same name never lights up twice in a row. Places that have never lit up, or lit up longest ago, go first, and a name about to turn out of view for a while jumps the queue. Keeping 8 names free means a fresh one is nearly always in view, so the highlights keep coming. (Strict rounds of all 52 stalled for up to half a minute while the last few were around the back of the globe.) The numbers are `SPARE` and `memory()` in `area.js`.

Names are 21px on phones, 24px from 600px wide and 28px from 834px. Below 834px the globe also spaces them closer and reaches nearer the top and bottom of the band, where the text leaves room for them.

| Color | Terrain | Rule used |
|---|---|---|
| Blue | Water | On Galveston Bay, Clear Lake, Trinity Bay, the San Jacinto or Brazos River, or at least 6% water by Census area |
| Green | Woods | Piney Woods north of Houston, and the wooded Memorial Villages |
| Silver | City | Built-up Houston core, suburbs and the industrial east side |
| Sand | Prairie | Coastal prairie, ranch and farm land to the west, south and east |

Terrain is a general read of each place's geography, not a land-cover survey. The list lives in `area.js` (`PLACES`); change a place's letter (`w`, `g`, `c`, `p`) to recolor it. The colors themselves are `--t-woods`, `--t-water`, `--t-city` and `--t-prairie` in `styles.css`, with separate values for light and dark mode. The globe is decoration: screen readers skip it, and the names are drawn by CSS from a `data-name` attribute, so they don't count as page text for search engines. Names near the heading and paragraphs fade out in `area.js` so they never pass behind the words. The visible sentence below the heading names nine well-known places, all 14 to 23 miles out (Spring, Humble, Kingwood, Pasadena, Clear Lake, Pearland, Missouri City, Sugar Land and Jersey Village). Katy (28 miles) and The Woodlands (30 miles) are outside the radius, so they're not listed. The globe holds still with no pulses for visitors who choose "reduce motion" or press the pause button.

### Light and dark mode

The site is light from sunrise to sunset in Houston and dark after sunset. `theme.js` works out the sun times in the browser from Houston's coordinates, with no outside service. It switches by itself at sunrise and sunset if the page is open.

There is no light/dark switch: every visitor sees light mode before sunset and dark mode after, by Houston's sun. (An earlier version had a switch; `theme.js` clears any choice a visitor saved with it.)

To follow a different city's sun, change `LAT` and `LNG` at the top of `theme.js`.

### Colors and font

The colors are CSS variables at the top of `styles.css`, one block per theme (`[data-theme="light"]` and `[data-theme="dark"]`): `--bg`, `--bg-2` (the tinted How it works and Questions bands), `--card`, `--label` (text), `--label-2` (secondary text and the dimmed how-it-works steps), `--separator` (thin lines). The always-dark parts (header, hero, Book your detail, footer, phone dock) use `--ink` and white text in both themes. `--red`/`--red-hover` color the large buttons, `--red-deep`/`--red-deep-hover` the smaller ones. The address check's green and red answers are `--ok` and `--no` in the `.check` block.

The site uses one font, **Archivo** (SIL Open Font License 1.1), self-hosted from `assets/fonts/archivo-latin-var.woff2`, so there's no request to Google Fonts. The license, `assets/fonts/OFL.txt`, has to stay next to the font file. If you ever swap the file, give the new one a new name, because browsers keep fonts for a long time.

---

## 2. Add photos of real jobs (Recent work)

The **Recent work** section stays hidden until it has a photo, so the page never shows empty "coming soon" boxes.

1. Put photos in `assets/gallery/`. Use JPG or WebP, about 1200px wide and under 300 KB each so the page stays fast. Landscape (4:3) fits best.
2. List them in the `GALLERY` array in `script.js`, in the order you want them shown:

   ```js
   const GALLERY = [
     { file: "01-truck-interior.jpg", alt: "Pickup truck interior after vacuum and wipe-down", caption: "Pickup, Auto Refresh" },
     { file: "02-motorcycle.jpg",     alt: "Motorcycle after a wash and detail",               caption: "Motorcycle Refresh" },
   ];
   ```

3. The section appears with the first photo listed. Write a short, real description for each `alt` (screen readers and search engines use it). `caption` is optional: plain facts only, the vehicle and the service.

**Before/after sliders.** Before/after shots are what sell detailing. Take the "before" and "after" from the same spot and angle, then add `before` to the entry:

```js
{ file: "03-seats-after.jpg", before: "03-seats-before.jpg", alt: "Front seats of an SUV", caption: "SUV, Auto Refresh" },
```

That photo then shows as a slider: visitors drag (or use the arrow keys) to wipe between before and after.

To show the section before there are photos, with a line pointing to Instagram, delete the word `hidden` from `<section id="gallery" ... hidden>` in `index.html`. Only do that once the Instagram account shows real jobs.

### Reviews

The **What customers say** section stays hidden until a review is listed. Add only real reviews, copied word for word with the customer's OK (for example from Google, once there's a Google Business Profile), to `REVIEWS` in `script.js`:

```js
const REVIEWS = [
  { name: "Maria G.", text: "Showed up on time and the car looks new inside.", stars: 5, source: "Google" },
];
```

`stars` (1 to 5) and `source` are optional.

---

## 3. Booking with Square

Bookings go through **Square Appointments**. The site is static (no server), so it can't hold a live calendar itself. Square handles the parts a form can't: real-time open slots, confirmations and reminders by text or email, rescheduling, an optional card on file or cancellation policy, and payment when the job is done.

### Set it up in Square (once)

1. Sign up for or open [Square Appointments](https://squareup.com/appointments). Online booking works on the Free, Plus and Premium plans ([Square help](https://squareup.com/help/us/en/article/5355-booking-tools-for-square-appointments)).
2. Add the two services **exactly** as on the site:
   - **Auto Refresh**, $65. Description: "Basic interior + exterior. Interior vacuum and surface wipe-down; interior glass and basic exterior wash."
   - **Motorcycle Refresh**, $50. Description: "Basic wash + detail. Bodywork and accessible surfaces cleaned; wheels, seat and finishing wipe-down."
3. Tell Square you travel to customers: **Appointments → Settings → Calendar & Booking → "Where do you accept appointments?" → At the customer's location** ([Square Community](https://community.squareup.com/t5/Questions-How-To/How-can-I-set-it-up-to-take-appointments-at-the-customers/m-p/355746)). Set your business hours.
   - Square doesn't add driving time on its own. On each service, turn on **Block extra time** to leave a gap *after* each job for the drive to the next one ([Square Community](https://community.squareup.com/t5/Questions-How-to/Appointment-apply-a-quot-travel-time-quot-buffer-between/m-p/207920)).
   - Square has no automatic travel fee for at-location bookings ([Square Community](https://community.squareup.com/t5/Square-Appointments/How-do-I-add-a-travel-fee-for-appointments-when-customer-selects/m-p/723760)). If far-away jobs need one, say so in the service description.
4. Turn on **text and email confirmations and reminders**. Once they're on, you can add a line saying so inside the Square-only block in the Contact section of `index.html` (`<div class="contact-book" data-when-booking hidden>`).
5. Optional but recommended: a cancellation policy, and a note about the extra charge for heavily soiled vehicles in each service description.
6. Turn on **Online Booking** and copy your booking page link (Square: Online Booking → booking site / "Share" or *Add booking to your website*).

### Connect it to the site

Open `script.js` and paste the link into the config block:

```js
SQUARE_BOOKING_URL: "https://book.squareup.com/appointments/....",
```

Every booking button then opens Square in a new tab: "Text to book" becomes **Book now**, and the per-service links become **Book Auto Refresh** and **Book Motorcycle Refresh**. Step 1 of How it works switches to "Pick a service and time online.", and a **Book now** button with one line about the Square booking page appears in the Contact section. Until it's set, booking works by text message.

**Optional: one link per service.** If Square gives you a link that opens straight to one service, paste it under `SQUARE_SERVICE_URLS` (`autoRefresh` and `motorcycleRefresh`). The **Book Auto Refresh** and **Book Motorcycle Refresh** links then skip the service picker. Leave them `""` to use the main booking link.

**Optional: embed instead of link.** Square's *Add booking to your website* page also gives embed code for a button or widget ([Square help](https://squareup.com/help/us/en/article/6458)). If you'd rather show Square's own widget, paste that code inside the Square-only block in the Contact section of `index.html`. The plain link is lighter: one clear button that opens the booking flow.

---

## 4. Deploy on GitHub Pages

### a. Publish the site

1. Make `main` the default branch: **Settings → General → Default branch**, click the switch icon, pick `main`, then **Update**.
2. On GitHub, open the repo → **Settings** → **Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*. Set **Branch** to `main` and the folder to `/ (root)`, then click **Save**.
4. Wait a minute or two. The site appears at `https://zeditor504.github.io/suho-auto-detailing/`.

### Moving to a custom domain

When you buy a domain (e.g. `suhodetailing.com`):

1. Replace `zeditor504.github.io/suho-auto-detailing` with your domain in `index.html` and `script.js` (Find in Files in your editor works).
2. Create a file named `CNAME` in the repo root containing only your domain, e.g. `suhodetailing.com`.
3. Add the DNS records below, then connect the domain in GitHub (step c).

### b. Point your domain at GitHub (at your registrar)

Log in to wherever you bought the domain (GoDaddy, Namecheap, Squarespace Domains, Cloudflare, and so on), open its **DNS** settings, and add these records. Delete any existing `A` or `AAAA` records on `@` first, such as the registrar's "parked" page.

**Apex domain (`suhodetailing.com`):** add 4 `A` records.

| Type | Host / Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

**IPv6 (optional but recommended):** add 4 `AAAA` records.

| Type | Host / Name | Value |
|---|---|---|
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |

**`www` subdomain:**

| Type | Host / Name | Value |
|---|---|---|
| CNAME | `www` | `zeditor504.github.io` |

TTL can stay at the default. If you use Cloudflare, set these records to **DNS only** (gray cloud) until HTTPS is working.

### c. Connect the domain in GitHub

1. Go to **Settings → Pages → Custom domain**, enter your domain (e.g. `suhodetailing.com`), and click **Save**. It should match the `CNAME` file.
2. Wait for the DNS check to pass. This usually takes minutes, but can take up to 24 hours.
3. Tick **Enforce HTTPS** once it's available. GitHub issues the certificate automatically.
4. Recommended: verify the domain under your GitHub account's **Settings → Pages → Verified domains**, so no one else can claim it on GitHub.

To check DNS from a terminal, run this. It should list the four `185.199.x.153` addresses:

```bash
dig +short suhodetailing.com
```

### d. After it's live

- Paste your URL into the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) to refresh the link preview.
- Add the site link to your Instagram bio and your Square profile.
- Optional: add the site in [Google Search Console](https://search.google.com/search-console) and create a Google Business Profile as a service-area business in Houston, TX.

---

## 5. Releases

Each release is a snapshot of the site with a downloadable zip.

**Before each release, bump the version in `index.html`.** The stylesheet and scripts are linked as `styles.css?v=0.8.0`, `script.js?v=0.8.0`, `theme.js?v=0.8.0` and `area.js?v=0.8.0`. GitHub Pages lets browsers keep files for 10 minutes, so without a new number a visitor can get the new page with the old styles. Change all four to the new version, e.g. `?v=0.9.0`. (The font file has no version number: it never changes. A replacement font gets a new file name instead.)

1. Add a section to the top of `CHANGELOG.md`, e.g. `## [v0.2.0] - 2026-11-10`, listing what changed.
2. Commit, then tag and push the tag:

   ```bash
   git tag -a v0.2.0 -m "v0.2.0"
   ```

   ```bash
   git push origin v0.2.0
   ```

   Or skip the terminal: on GitHub go to **Actions → Release → Run workflow**, pick `main`, and enter the version (e.g. `v0.2.0`). The workflow creates the tag for you.

3. The **Release** workflow (Actions tab) creates the GitHub Release, using the changelog section as the notes and attaching `suho-detailing-site-v0.2.0.zip`. Versions starting with `v0.` are marked as pre-releases. Use `v1.0.0` for the first full launch.

---

## Content rules (keep these when editing)

- Prices and services come from the official price sheet. Don't change, round, or add prices or services.
- No reviews, testimonials, ratings, customer counts, years in business, or guarantees until they actually exist.
- The price list keeps the price sheet's wording exactly, including the line "MOBILE DETAILING / HOUSTON, TX", which is the heading of the price list.
- Only add facts Umair has confirmed (hours, payment, vehicle sizes, service radius). Add each as one plain sentence; never as a new price.
