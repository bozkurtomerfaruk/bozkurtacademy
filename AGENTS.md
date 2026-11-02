# Exercise and grammar authoring

Every question needs feedback explaining its own grammatical trigger: the actual subject and verb form, required preposition/case, meaning clue or word-order constituents. Do not reuse a topic-level paragraph with only the correct answer substituted. Preserve useful existing reasoning and avoid stock instructions that bury it. Check incorrect multiple-choice and written submissions in the browser, including Enter submission, when changing feedback.

When adding an exercise topic at any level, also add its complete grammar lesson in the same task without asking the user separately. This is a standing user preference.

Use the exercise topic ID in data/<level>-grammar.json. Register a new level in data/grammar-index.json. The grammar list derives from data/catalog.json; do not maintain a separate topic list.

Write simple Turkish for a first-time learner, German examples with Turkish translations, progressing from simple to harder examples. Include useful accessible visual diagrams, at least five teaching sections, a summary and self-check, three FAQs, three relevant related topics, an exercise link, the existing author introduction and moderated name/email comment form. Large headings do not need final periods. Reuse the professional theme and dark-mode styles.

After adding or renaming exercise packages, run node scripts/build-search-index.mjs so the exercise search finds them (CI runs it with --check).

Word lists: questions may list their nouns in "vocab" (keys of data/sozluk.json: article + Turkish meaning, also shown in the German and English interface). Mark entries you are not sure about with "unsure": true; they stay hidden until the teacher sets "checked". After changing vocab or the dictionary, run node scripts/sozluk.mjs to refresh docs/sozluk-kontrol.csv (CI runs it with --check). Exam sets never show word lists.

Run node scripts/check-grammar.mjs and browser checks for the lesson, correct exercise destination, mobile overflow, dark mode and deep links. New exercise topics require actual authored explanations; a card or placeholder is insufficient. data/grammar-legacy.json only records existing B1/B2 gaps and must not be expanded to bypass coverage.

Publish through the existing GitHub Pages workflow when the user has authorized publishing. Do not claim the coverage check writes educational content automatically or verifies email delivery.

Shared design tokens and components (colours, fonts, buttons, focus, header, footer, ba-* pieces) live in css/base.css; page stylesheets only add layout and must use the --ba-* tokens. Design skills live in .claude/skills (web-design-guidelines for UI audits, taste-skill for visual direction, redesign-existing-projects for upgrading existing pages). docs/design/claude-DESIGN.md is a reference design system from getdesign.md; use it for inspiration only and keep the site's existing theme, dark mode and Turkish learner focus unless the user asks for a redesign.
