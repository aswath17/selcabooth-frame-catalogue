# SelcaBooth — The Frame Edit

A mobile-first, single-page catalogue of the 71 supplied SelcaBooth layouts. The approved design uses warm cream, wine-plum and lavender, a prominent logo, large category buttons and one large frame per row.

## Included

- All 71 layouts with their original names, positions, borders, image layers and rotations.
- Solid black photo spaces with no placeholder words or numbers.
- 28 customisable backgrounds marked with large colour wheels; 43 fixed backgrounds.
- Category filtering, name search, saved frames on the customer's device and full-size previews.
- Colour swatches and a colour picker only for customisable layouts.
- Keyboard-accessible dialogs, reduced-motion support and lazy frame rendering.
- No backend, login, analytics, CDN, API keys, paid services, or npm installation required.

The public website files are in `docs/`. The source artwork is supplied by SelcaBooth. The logo is the SVG from https://www.selkicx.com/brand/selcabooth-product-logo.svg . Software-inserted print brand marks were not present in the layout export, so these marks are omitted from previews. Existing text embedded in frame artwork is preserved. Black photo openings are display placeholders, not changes to the original booth layouts. A colour preview is not a booking or an instruction sent to the booth.

## Publish with GitHub Pages

1. Make this repository public when ready (or use a GitHub plan that supports Pages for private repositories).
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/docs**, then save.
5. Wait for GitHub to show the published website URL and open it on your phone.
6. Create the customer QR code using that exact website URL, not the repository URL. Test a printed QR code before placing it outside the booth.

Nothing in this repository automatically changes its visibility or publishes the site. Once enabled, Pages updates when `main` changes. Keep the repository/site address unchanged to keep the printed QR working.

## Preview locally

Open `docs/index.html` in a browser, or run `python3 -m http.server 8000 --directory docs` and visit http://localhost:8000 . Serving over HTTP is recommended for consistent browser behaviour. Copying frame names requires a secure context or localhost; when clipboard access is blocked, the name remains visible for manual copying.

## Update the layouts

Export a new ZIP from SelcaBooth, then run:

```sh
python3 tools/import-layouts.py /path/to/layouts.zip
node tools/validate.cjs
```

Review the result and commit `docs/catalogue.js` plus new assets. Existing assets remain in place. Customisation is determined by `background.mode === "transparent"`. The initial catalogue includes optimised WebP assets; later imports retain the original asset formats and require no imaging library.

## Structure

- `docs/index.html` — page structure and accessible controls
- `docs/styles.css` — responsive design and single-column gallery
- `docs/app.js` — SVG layout rendering, filters, saved frames and colour previews
- `docs/catalogue.js` — exported layout data
- `docs/assets/` — logo and frame artwork
- `tools/` — importer and integrity validation

Browser preferences use only local storage (`selcabooth.saved.v1`). Photos are not collected or uploaded. Colour choices last for the current page visit. Layout/asset rights remain with their respective owners; no third-party artwork licence is granted by this repository.
