# Privacy policy: what is prepared and what is still needed

The footer has a "Gizlilik politikası" link that is hidden until a policy exists
(`index.html`, `<nav class="footer-links" ... hidden>`).

The site collects personal data in two places, so a policy is needed before launch in the EU:

- the contact form (name, email, message), and
- the moderated comment form on grammar lessons (name, email, comment).

It also loads fonts from Google Fonts, which sends visitors' IP addresses to Google.

To finish:

1. Have a privacy policy written or generated for your situation (for example with a
   German/EU privacy generator such as those from eRecht24 or Datenschutz-Generator.de,
   or with advice from a lawyer). It should name you as the controller, list the data
   above, the services that receive it (FormSubmit, which forwards both forms by email; GitHub Pages hosting;
   Google Fonts), the legal basis, how long data is kept and visitors' rights.
2. Save it as `privacy.html` in the site root (in Turkish, and German/English if you
   want the language switch to cover it).
3. Remove `hidden` from the footer `<nav class="footer-links">`.

If you live in Germany and run the lessons as a business, check whether you also need
an Impressum; the same footer nav can hold that link.
