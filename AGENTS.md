# Exercise and grammar authoring

Every question needs feedback explaining its own grammatical trigger: the actual subject and verb form, required preposition/case, meaning clue or word-order constituents. Do not reuse a topic-level paragraph with only the correct answer substituted. Preserve useful existing reasoning and avoid stock instructions that bury it. Check incorrect multiple-choice and written submissions in the browser, including Enter submission, when changing feedback.

When adding an exercise topic at any level, also add its complete grammar lesson in the same task without asking the user separately. This is a standing user preference.

Use the exercise topic ID in data/<level>-grammar.json. Register a new level in data/grammar-index.json. The grammar list derives from data/catalog.json; do not maintain a separate topic list.

Write simple Turkish for a first-time learner, German examples with Turkish translations, progressing from simple to harder examples. Include useful accessible visual diagrams, at least five teaching sections, a summary and self-check, three FAQs, three relevant related topics, an exercise link, the existing author introduction and moderated name/email comment form. Large headings do not need final periods. Reuse the professional theme and dark-mode styles.

After adding or renaming exercise packages, run node scripts/build-search-index.mjs so the exercise search finds them (CI runs it with --check).

Word lists: questions may list their nouns in "vocab" (keys of data/sozluk.json: article + Turkish meaning, also shown in the German and English interface). Mark entries you are not sure about with "unsure": true; they stay hidden until the teacher sets "checked". After changing vocab or the dictionary, run node scripts/sozluk.mjs to refresh docs/sozluk-kontrol.csv and docs/sozluk-bekleyen.csv, the table of words not yet checked that the teacher reviews for each pull request (CI runs it with --check). Skip Turkish hints, German instructions, grammar terms (Subjekt, Kasus, Hauptsatz …), names and imperatives; a word like Essen or Morgen counts as a noun only after an article or preposition. Exam sets never show word lists.

End-of-level tests: data/seviye-sonu/<level>.json, linked from data/catalog.json with "levelExam". 30 questions per attempt with a fixed topic distribution; the pool needs at least twice as many questions per topic, each with four options and its own Turkish explanation (node scripts/check-level-exams.mjs). Results go to results with topic "seviye-sonu" and topicErrors; never store which questions were shown.

Children's game Artikel Evleri (#artikel-evleri, js/artikel-evleri.js): topics in data/cocuk/artikel-evleri.json list keys of data/sozluk.json (checked, not unsure, one article) with equal der/die/das counts per topic; every word needs a hand-drawn SVG in data/cocuk/resimler.json (no emoji). Run node scripts/check-kids-games.mjs (CI runs it). No account, form or server request; only the sound setting and best scores in localStorage (baKelimeOyunlari); speech uses on-device German voices only and the game must stay silent without errors when there is none.

Run node scripts/check-grammar.mjs and browser checks for the lesson, correct exercise destination, mobile overflow, dark mode and deep links. New exercise topics require actual authored explanations; a card or placeholder is insufficient. data/grammar-legacy.json only records existing B1/B2 gaps and must not be expanded to bypass coverage.

Publish through the existing GitHub Pages workflow when the user has authorized publishing. Do not claim the coverage check writes educational content automatically or verifies email delivery.

Shared design tokens and components (colours, fonts, buttons, focus, header, footer, ba-* pieces) live in css/base.css; page stylesheets only add layout and must use the --ba-* tokens. Design skills live in .claude/skills (web-design-guidelines for UI audits, taste-skill for visual direction, redesign-existing-projects for upgrading existing pages). docs/design/claude-DESIGN.md is a reference design system from getdesign.md; use it for inspiration only and keep the site's existing theme, dark mode and Turkish learner focus unless the user asks for a redesign.
