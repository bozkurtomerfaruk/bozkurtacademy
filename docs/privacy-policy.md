# Privacy policy: what the site does with personal data

The footer has a "Gizlilik politikası" link that stays hidden until a policy exists
(`index.html`, `<nav class="footer-links" ... hidden>`). This file lists what the site
actually does today, so you can answer a privacy-policy generator correctly. It is a
checklist of facts, not the policy text itself.

Last checked: after GoatCounter visitor statistics were added to the public pages.

## Third-party services that receive visitors' personal data

| Service | When | What it receives | Where to look in the code |
| --- | --- | --- | --- |
| **GitHub Pages** (GitHub Inc., hosting of bozkurtacademy.com) | Every page view | IP address, browser and device details, time and page requested (server logs) | Whole site; `CNAME` points the domain at GitHub Pages |
| **FormSubmit** (formsubmit.co) | Only when someone sends the contact form | Name, email address, message text, plus IP address and browser details of the request | `js/app.js`, `fetch('https://formsubmit.co/ajax/…')` |
| **FormSubmit** (formsubmit.co) | Only when someone sends a comment on a grammar lesson | Name, email address, comment text, the lesson and level, publication consent, plus IP address and browser details | `js/a1-lessons.js`, comment form |
| **Gmail / Google** (Google Ireland Ltd.) | After FormSubmit forwards a form | Everything FormSubmit received, stored in the bozkurtt.omerfaruk@gmail.com mailbox | FormSubmit delivers to that address |
| **GoatCounter** (bozkurtacademy.goatcounter.com) | Every page change on the public pages in `index.html` (home, lessons, grammar, exercises, exam prep, about, contact). Not on login, registration or panel pages, and never on localhost | Page address (path and hash, e.g. `/#grammar/A1/artikel`; exercise question numbers are dropped), referrer (first page of a visit only), page title, browser details (user agent) and screen width, country derived from the IP address. GoatCounter does not store the IP address. No cookies, no localStorage | `js/analytics.js`, `js/vendor/count.js` (served from this site, not from gc.zgo.at) |

Nothing else is loaded from another host while browsing. In particular:

- **No Google Fonts.** STIX Two Text and Albert Sans are served from `fonts/` on the site itself.
- No advertising, tracking pixels, social media widgets, embedded videos or maps. The only
  statistics are GoatCounter (above): no cookies, no localStorage, no banner needed.
- No cookies are set.

## Other things a generator usually asks about

- **Local storage in the browser (not cookies, nothing is sent anywhere):**
  - `ba-theme`: light or dark theme.
  - `baLang`: chosen language (TR/DE/EN).
  - `baBestScore:<level>:<topic>:<exercise>`: best score per exercise.

  All three are only read by the page on the visitor's own device.
- **Published comments:** when you approve a comment, you add it to `data/grammar-comments.json`,
  which is public. The page shows the commenter's name, the date, the comment and your reply.
  Email addresses are never published. The form asks for consent to this before sending. The file
  is empty today.
- **Email links:** the `mailto:` links open the visitor's own email program. Nothing is sent
  through the site.
- **Links to other websites:** some grammar lessons link to deutsch-mit-anna.de and
  grammis.ids-mannheim.de. Those sites only receive data if the visitor clicks the link.
- **Lessons themselves:** the site says lessons take place on Zoom or Google Meet. If your
  policy should also cover students you teach (not just website visitors), add those services
  and how you keep lesson-related data such as email conversations.
- **Google Search Console:** `google4cc3144aaa693325.html` only proves site ownership to Google.
  It does not collect visitor data.

## What to select in a generator (e.g. eRecht24, Datenschutz-Generator.de)

- Hosting: GitHub Pages (provider outside the EU/EEA, USA).
- Contact form: yes, sent through a third-party form service (FormSubmit), delivered by email (Gmail).
- Comment function: yes, moderated, name and email required, name and comment published with consent.
- Cookies: none. Local storage: yes, for settings only (theme, language, scores), no tracking.
- Web fonts: locally hosted (no external font service).
- Analytics: GoatCounter, cookieless, without storing IP addresses (see the table above).
- Advertising, social plugins, embedded videos/maps: none.
- External links: yes.

## To finish

1. Generate or have written a policy with the answers above. It must name you as the person
   responsible and give a contact address. Have it checked if you run the lessons as a business.
2. Save it as `privacy.html` in the site root (Turkish, and German/English if the language
   switch should cover it).
3. Remove `hidden` from the footer `<nav class="footer-links">` in `index.html`.

If you teach from Germany as a business, also check whether you need an Impressum; the same
footer nav can hold that link.
