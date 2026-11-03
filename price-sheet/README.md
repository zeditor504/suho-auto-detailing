# Price sheet source

`price-sheet.html` is the source for `assets/pricing.pdf` (the "Download price sheet (PDF)" link on the site). It's set in **Inter Tight**, the same font as the site.

## Edit it

Open `price-sheet.html` in any text editor. Prices, services, and wording live in the `<body>`; colors are at the top of the `<style>` block. Keep prices and services identical to the website's pricing section.

## Rebuild the PDF (Chrome or Edge)

1. Open `price-sheet.html` in Chrome (double-click it, or drag it into a browser window). Make sure you're online so the font loads.
2. Press **Ctrl+P** (Windows) or **Cmd+P** (Mac).
3. Set **Destination** to *Save as PDF*, **Paper size** to *Letter*, **Margins** to *None*, and under **More settings** tick **Background graphics**.
4. Save it as `pricing.pdf`, replacing `assets/pricing.pdf`.
5. Commit and push. The site picks up the new PDF automatically.

`sheet-logo.png` is the logo image used at the top of the sheet.
