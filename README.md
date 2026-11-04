# SUHO Detailing website

One-page site for **Sleeves-Up Hands-On Auto Detailing** (SUHO Detailing): mobile car and motorcycle detailing in Houston, TX.

It's plain HTML, CSS, and vanilla JavaScript. There's no framework, no build step, no backend, and nothing to install. To preview it, open `index.html` in a browser. (Opened straight from disk, the light sweep across the hero logo doesn't run because browsers block it on `file://` pages. Everything else works, and the live site shows it all.)

```
index.html        the page
styles.css        all styles; light and dark theme colors are CSS variables at the top
script.js         config block at the top + behaviors (links, share, gallery, theme button, animations)
theme.js          picks light or dark mode from Houston's sunrise and sunset (loads first, before the page paints)
CHANGELOG.md      what changed in each release
.github/workflows/release.yml  builds a GitHub Release (with a zip of the site) when a version tag is pushed
.gitignore        keeps OS junk, editor folders, secrets, and build output out of git
.nojekyll         tells GitHub Pages to serve files as-is
assets/logo.png   original square logo (used as the social preview image)
assets/logo-wordmark-white.png  logo artwork on a transparent background, white (dark mode)
assets/logo-wordmark-ink.png    the same in near-black (light mode)
assets/favicon-48.png, assets/apple-touch-icon.png  icons cut from the logo
assets/pricing.pdf  official price sheet, linked as "Download price sheet (PDF)"
price-sheet/       HTML source for the price sheet PDF, with rebuild steps
assets/gallery/   drop gallery photos here
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

Open `script.js` and edit the `CONFIG` block at the top. That alone sets up every Book button, the tap-to-call, tap-to-text, and email links, and the structured data (JSON-LD).

Until a value is filled in, the site handles it safely:
- **Book buttons** jump to the Contact section.
- **Call, text, and email** stay hidden.

Once you have the Square link, paste it as `SQUARE_BOOKING_URL` in `script.js`. That's the only place it's used.

To confirm nothing was missed, run this. If it prints nothing, every placeholder is filled:

```bash
grep -n "{{" index.html script.js
```

### Design approach

The look follows apple.com and Apple's Human Interface Guidelines: content first, full-width black and soft-gray tiles, centered headlines (weight 600), 17px body text, pill buttons (filled red for the main action, outlined for the second), small gray footer text, and no decorative effects. The only motion is a short fade as content scrolls into view, and it's turned off for visitors who choose "reduce motion" on their device.

### Service area place names

The faint names drifting behind "Houston, TX" are the 92 Census places within 35 miles of downtown Houston: 23 Census Designated Places plus 69 incorporated cities, towns and villages (Houston itself is left out). Source: the 2024 U.S. Census Gazetteer place file for Texas, with distance measured from Houston City Hall (29.7604 N, 95.3698 W) to each place's official internal point. The names are written directly into `index.html` (search for `area-names`), spread across 9 rows. Screen readers get the same list as one sentence, and the rows hold still for visitors who choose "reduce motion".

### Light and dark mode

The site is light from sunrise to sunset in Houston and dark after sunset. `theme.js` works out the sun times in the browser from Houston's coordinates, with no outside service. It switches by itself at sunrise and sunset if the page is open.

Visitors can override it with the appearance button in the header, which cycles **Automatic → Light → Dark**. The icon shows the current setting (half-filled circle = automatic, sun = light, moon = dark), and the footer says when the next switch happens. The choice is remembered on their device.

To follow a different city's sun, change `LAT` and `LNG` at the top of `theme.js`.

### Brand red

The accent color is `--red` at the top of `styles.css`: `#ff0005`, sampled from the logo. Each theme block (`[data-theme="light"]` and `[data-theme="dark"]`) also has `--red-text` (a red tuned for links and small text) and `--red-button` (a slightly deeper button red so white text stays readable).

The site uses one font, **Inter Tight** (Google Fonts), set by `--font` in the same place.

---

## 2. Add gallery photos

1. Put photos in `assets/gallery/`. Use JPG or WebP, about 1200px wide and under 300 KB each so the page stays fast. Landscape (4:3) fits the tiles best.
2. List them in the `GALLERY` array in `script.js`, in the order you want them shown:

   ```js
   const GALLERY = [
     { file: "01-truck-interior.jpg", alt: "Pickup truck interior after vacuum and wipe-down" },
     { file: "02-motorcycle.jpg",     alt: "Motorcycle after a wash and detail" },
   ];
   ```

3. Photos fill the six tiles in order. Any tile without a photo keeps "Photo coming soon". Write a short, real description for each `alt`, since screen readers and search engines use it.

To show more than six photos, copy one more `<figure class="tile">...</figure>` line inside `#gallery-grid` in `index.html` for each extra photo.

---

## 3. Booking (Square)

The site links to your Square Appointments page instead of embedding it. Square's booking page isn't reliably embeddable in an iframe, and a link is faster and works on every phone. Every "Book" button opens it in a new tab.

If you'd rather embed it, go to Square Dashboard → Appointments → Online Booking → *Add booking to your website* and copy the embed code. Then paste it inside the `<div class="book-panel">` in `index.html`, just below the Book button.

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

**Before each release, bump the version in `index.html`.** The stylesheet and scripts are linked as `styles.css?v=0.3.2`, `script.js?v=0.3.2` and `theme.js?v=0.3.2`. GitHub Pages lets browsers keep files for 10 minutes, so without a new number a visitor can get the new page with the old styles. Change all three to the new version, e.g. `?v=0.4.0`.

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
