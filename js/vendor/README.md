# Vendored scripts

## count.js (GoatCounter)

Visitor statistics for the public pages (`index.html`), loaded from this site instead of
`gc.zgo.at`, so the only external request is the count itself to
`https://bozkurtacademy.goatcounter.com/count`. Set up in `js/analytics.js`.

- **Source:** `public/count.js` from GoatCounter **v2.7.0**,
  https://github.com/arp242/goatcounter/blob/v2.7.0/public/count.js
  (commit 7e91d8a9bdbb0dd48496e498c5680f8f3477a1b4). This is the file served as `//gc.zgo.at/count.js`.
- **Original SHA-256:** `030ad75a7c80a04107a9b91f79e4b1572da0a583a80a9b67e111b310da11cbe9`
- **This copy SHA-256:** `038a0caae4012e99f95d374dcfb09baa6e31276aa6272464480bd9a89cbc2aad`
- **Licence:** ISC (stated in the file header; the rest of GoatCounter is EUPL-1.2). Full text in
  `js/vendor/count.js.LICENSE.txt`.

### Changes to the original

The site must not use cookies or localStorage. count.js only touches localStorage for its
`#toggle-goatcounter` switch (a flag that stops counting your own visits), so that part was removed:

1. In `goatcounter.filter()`: the check `localStorage.getItem('skipgc')` was removed.
2. The `#toggle-goatcounter` block that writes `skipgc` to localStorage was removed.
3. A comment header pointing to this file was added.

To leave out your own visits, add your IP address under GoatCounter → Settings → "Ignore IPs".

### Updating

Download the new `public/count.js` from a GoatCounter release tag, apply the same two removals,
update the version, commit and checksums above, and check that `grep -n localStorage js/vendor/count.js`
only finds comments.

## quill/ (Quill 2, ders defteri editörü)

Rich-text editor for the lesson notebook (`ogretmen-ders.html`, `ders-notlarim.html`), loaded from this site as a
classic script (`window.Quill`); no CDN, no network requests, no tracking. Set up in `js/account/note-editor.js`.

- **Source:** npm package `quill@2.0.3`, files `dist/quill.js` and `dist/quill.core.css`, unchanged
  (https://github.com/slab/quill, tag v2.0.3). The `sourceMappingURL` comments are left in; the map files are not
  copied, so browser developer tools show a 404 for them only when they are open.
- **SHA-256:** `quill.js` `f6157c72ac9b3f51cdead426335688a027b12405d9d6a4daadd38a676b2d7ff2`,
  `quill.core.css` `1ad491e90881eaae64cdbbc87e82613c98350907e89c00e77faa4316d92098e5`
- **Licence:** BSD-3-Clause, full text in `js/vendor/quill/LICENSE.txt`.
- **CSP:** works with `script-src 'self'`. The bundle contains one `new Function("return this")` as a webpack fallback
  that only runs when `globalThis` is missing (never in supported browsers). Colours are stored as classes
  (`ba-c-*`, `ba-bg-*`), not inline styles.
- **Limits (Quill 2 tables):** a table cell holds one line, there are no merged cells. When pasting from Google Docs,
  several paragraphs in one cell are joined with " / ", and merged cells are split (text in the first cell, empty
  cells next to it). Simple tables, bold/italic, lists, headings and links paste correctly; colours are mapped to the
  nearest palette colour.

### Updating

Download the new package (`npm pack quill@<version>`), copy `dist/quill.js` and `dist/quill.core.css`, update the
version and checksums above, bump `?v=` on both pages and run `npm run test:ders-defteri` and `npm run test:csp`.
