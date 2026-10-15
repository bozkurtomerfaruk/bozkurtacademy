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
