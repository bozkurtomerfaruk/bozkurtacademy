# Privacy policy: what the site does with personal data

The footer links to `privacy.html`. Its details are filled in (controller name and email — the owner's home address is deliberately not published anywhere, legal bases,
supervisory authority LDI NRW, US transfers, consent form storage, GoatCounter); the text is being
legally checked. This file lists what the site
actually does today, so you can answer a privacy-policy generator correctly. It is a
checklist of facts, not the policy text itself.

Last checked: student accounts stage 1 (Firebase login, registration, teacher panel, email
verification) and GoatCounter visitor statistics on the public pages, and the placement test (`#seviye-testi`, section 5a of `privacy.html`, 26 October 2026).

## Third-party services that receive visitors' personal data

| Service | When | What it receives | Where to look in the code |
| --- | --- | --- | --- |
| **GitHub Pages** (GitHub Inc., hosting of bozkurtacademy.com) | Every page view | IP address, browser and device details, time and page requested (server logs) | Whole site; `CNAME` points the domain at GitHub Pages |
| **FormSubmit** (formsubmit.co) | Only when someone sends the contact form | Name, email address, message text, plus IP address and browser details of the request | `js/app.js`, `fetch('https://formsubmit.co/ajax/…')` |
| **FormSubmit** (formsubmit.co) | Only when someone sends a comment on a grammar lesson | Name, email address, comment text, the lesson and level, publication consent, plus IP address and browser details | `js/a1-lessons.js`, comment form |
| **Gmail / Google** (Google Ireland Ltd.) | After FormSubmit forwards a form | Everything FormSubmit received, stored in the bozkurtt.omerfaruk@gmail.com mailbox | FormSubmit delivers to that address |
| **GoatCounter** (bozkurtacademy.goatcounter.com) | Every page change on the public pages in `index.html` (home, lessons, grammar, exercises, exam prep, about, contact). Not on login, registration or panel pages, and never on localhost | Page address (path and hash, e.g. `/#grammar/A1/artikel`; exercise question numbers are dropped), referrer (first page of a visit only), page title, browser details (user agent) and screen width, country derived from the IP address. GoatCounter does not store the IP address. No cookies, no localStorage | `js/analytics.js`, `js/vendor/count.js` (served from this site, not from gc.zgo.at) |
| **Firebase Authentication** (Google Ireland Ltd. / Google LLC) | When a student registers or signs in, and on every later visit of a signed-in student | Email address, password hash; with Google sign-in (16+ only) also the Google name, email and photo URL. Not region-bound: may be processed in the USA | `js/account/firebase.js`, `login.js`, `register.js` |
| **Cloud Firestore** (Google, europe-west3 Frankfurt) | Student accounts only | Name, email, birth year, account status, exercise results (level, topic, exercise, score, time); for under-16s also parent name and email, consent date and method | `firestore.rules`, `js/account/*.js` |
| **gstatic.com** (Google, Firebase SDK files) | Only on login/registration/panel pages, and on `index.html` only if the browser was signed in before (`baAccount`), when a placement-test result is sent, or when the admin page `#yonetim/…` is opened | IP address and browser details of the request | `js/account/firebase.js` |
| **Firebase (Auth + Firestore), placement test** (`#seviye-testi`) | Only when a visitor presses "Sonucu gönder" after the test (consent checkbox required) | Name, email, goal, exam name/date, learning duration, note, estimated level, correct answers per block, errors per topic, wrong answers (question id + chosen option), writing text, duration, date, interface language, an anonymous Firebase user id (temporary anonymous sign-in, signed out right after sending). Deleted automatically after 6 months (Firestore TTL on `expireAt`). Only the teacher can read it | `js/placement.js`, `js/account/placement-submit.js`, `firestore.rules`, `docs/seviye-testi.md` |
| **Google Calendar / Meet** (Google, teacher's calendar) | When the teacher schedules, moves or cancels a lesson (from `ogretmen-takvim.html`) | Event with "Almanca dersi – student name", time, note, the student's email and, for under-16s when enabled, the parent's email as attendees; Google sends the invitations and updates and creates the Meet link. Only the teacher's browser talks to the Calendar API (scope `calendar.events`) | `js/account/calendar.js`, `js/account/lessons.js` |
| **accounts.google.com** (Google Identity Services script) | Teacher pages only, to get the Calendar permission | Request details of the teacher's browser | `js/account/calendar.js` |
| **Gmail via Google Apps Script** (teacher's Google account) | Daily 18:00–19:00 Berlin, once the teacher has installed the script | Reminder email for the next day's lesson to each invited student and parent (date, time, duration, Meet link, lesson note). The script reads only events marked `source=bozkurtacademy` and stores a SHA-256 hash of event + time + recipient address for 14 days to avoid duplicates | `apps-script/Code.gs` |

Guests who never sign in load nothing from Google, unless they send a placement-test result (row above). Apart from that, nothing else is loaded from another host while browsing. In particular:

- **No Google Fonts.** STIX Two Text and Albert Sans are served from `fonts/` on the site itself.
- No advertising, tracking pixels, social media widgets, embedded videos or maps. The only
  statistics are GoatCounter (above): no cookies, no localStorage, no banner needed.
- No cookies are set.

## Student accounts (stage 1)

- Registration asks for name, email, password and birth year only; under-16s (current year − birth
  year ≤ 16) also give a parent's name and email and cannot use Google sign-in.
- Accounts open only after teacher approval; for under-16s also after the teacher records the parent's
  consent (date and method: signed form or email). Enforced in `firestore.rules`.
- Registration with email/password sends a Firebase verification email; the profile stores
  `emailVerified` once the student has confirmed it (shown to the teacher).
- Retention shown in `privacy.html`: 12 months after the last lesson (or approval if there was no
  lesson), unapproved registrations 30 days. Deletion is manual from the teacher panel
  ("Silinmesi gereken kayıtlar"); the Firebase Authentication account must then be deleted in the
  Firebase Console.
- Parent consent form draft: `docs/veli-onay-formu.md`.

## Lessons (stage 3)

- Lessons are stored per student (`users/{uid}/lessons`): start time, duration, note, status, the
  Google Calendar event id and the Meet link. Students can only read their own.
- For under-16s the teacher can switch off adding the parent to invitations (`inviteParent`).
- Deleting a student also deletes their Calendar events (future ones with a cancellation notice).

## Homework and resources (stage 2)

- Homework is stored per student (`users/{uid}/assignments`): title, description, due date, chosen
  site exercises, an optional Google Docs link from the teacher, and the student's own fields
  (done, done time, an optional Google Docs/Drive link). Students can change only their own fields.
- Resources (`users/{uid}/resources`): title, link and short note added by the teacher.
- Links to Google Docs open Google's site in a new tab; Google only receives data if the student
  opens them. No Google Drive API is used.

## Other things a generator usually asks about

- **Local storage in the browser (not cookies, nothing is sent anywhere):**
  - `ba-theme`: light or dark theme.
  - `baLang`: chosen language (TR/DE/EN).
  - `baBestScore:<level>:<topic>:<exercise>`: best score per exercise.

  - `baAccount`: `student` or `teacher` after signing in; decides whether `index.html` loads Firebase
    and what the menu link says. No personal data.
  - `baEmulator`: only on localhost during development.
  - Firebase keeps the sign-in session in the browser's IndexedDB (technically necessary for login).

  These are only read by the page on the visitor's own device.
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

1. Finish the legal check of `privacy.html` (Turkish only so far). It says signed consent forms are
   kept on paper in a locked cupboard and, when they arrive digitally, in an encrypted folder.
2. Then remove the "Bu metin hukuki olarak kontrol edilmektedir" note and the `noindex` meta tag, and
   show the "Giriş" menu link in `index.html` again (it is `hidden` for the quiet launch).

`privacy.html` is available in Turkish, German and English (one block per language, `js/privacy.js`).

If you teach from Germany as a business, also check whether you need an Impressum; the same
footer nav can hold that link. (Checked 26 October 2026: the site has no Impressum yet; waiting for the owner's details.)
