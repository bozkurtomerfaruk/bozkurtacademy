# Exercise and grammar authoring

When adding an exercise topic at any level, also add its complete grammar lesson in the same task without asking the user separately. This is a standing user preference.

Use the exercise topic ID in data/<level>-grammar.json. Register a new level in data/grammar-index.json. The grammar list derives from data/catalog.json; do not maintain a separate topic list.

Write simple Turkish for a first-time learner, German examples with Turkish translations, progressing from simple to harder examples. Include useful accessible visual diagrams, at least five teaching sections, a summary and self-check, three FAQs, three relevant related topics, an exercise link, the existing author introduction and moderated name/email comment form. Large headings do not need final periods. Reuse the professional theme and dark-mode styles.

Run node scripts/check-grammar.mjs and browser checks for the lesson, correct exercise destination, mobile overflow, dark mode and deep links. New exercise topics require actual authored explanations; a card or placeholder is insufficient. data/grammar-legacy.json only records existing B1/B2 gaps and must not be expanded to bypass coverage.

Publish through the existing GitHub Pages workflow when the user has authorized publishing. Do not claim the coverage check writes educational content automatically or verifies email delivery.
