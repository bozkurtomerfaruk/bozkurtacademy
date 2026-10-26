// Checks every exam set listed in js/examsData.js (exercises: [{ set: 'set-1', … }]).
// Format: docs/sinav-setleri.md. Run: node scripts/check-exams.mjs [path filter, e.g. teil-3/set-4]
import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('js/examsData.js', 'utf8'), context);
const data = context.window.BA_EXAMS;
const only = process.argv[2] || '';

const TYPES = {
  'richtig-falsch': () => ['richtig', 'falsch'],
  'ja-nein': () => ['ja', 'nein'],
  // TestDaF: Ja / Nein / Text sagt dazu nichts
  'ja-nein-nichts': () => ['ja', 'nein', 'nichts'],
  // telc C1 Hochschule: Richtig / Falsch / Nicht im Text
  'richtig-falsch-nichts': () => ['richtig', 'falsch', 'nichts'],
  abc: question => Object.keys(question.options || {}),
  // TestDaF digital Aufgabe 7: one wrong sentence in a summary paragraph; Aufgabe 2: position of a paragraph.
  fehlersatz: question => Object.keys(question.options || {}),
  reihenfolge: question => (Array.isArray(question.options) ? question.options : []).map(String),
  zuordnung: (question, group) => [...group.texts.filter(text => text.label).map(text => text.label), ...(group.none === false ? [] : [group.none || '0'])]
};
const errors = [];
const words = value => String(value).replace(/\{\{\d+\}\}/g, ' ').replace(/\{\{0=|\}\}/g, ' ').split(/\s+/).filter(Boolean).length;
// Searchable pieces of a text: plain paragraphs and the cells of { rows } tables, keyed by position.
const pieces = text => (text.paragraphs || []).flatMap((p, i) => typeof p === 'string' ? [{ key: `${i}`, value: p }]
  : Array.isArray(p?.rows) ? p.rows.flatMap((row, r) => row.map((cell, c) => ({ key: `${i}:${r}:${c}`, value: cell }))) : []);
let sets = 0, questions = 0;

for (const exam of data.exams) for (const level of exam.levels || []) for (const section of level.sections) {
  section.teile.forEach((teil, index) => {
    for (const entry of teil.exercises || []) {
      if (!entry?.set) continue;
      const teilNo = index + 1;
      const path = `data/exams/${exam.id}/${level.id}/${section.id}/teil-${teilNo}/${entry.set}.json`;
      if (!path.includes(only)) continue;
      const fail = message => errors.push(`${path}: ${message}`);
      if (!fs.existsSync(path)) { fail('file missing'); continue; }
      let set;
      try { set = JSON.parse(fs.readFileSync(path, 'utf8')); } catch (error) { fail(`invalid JSON (${error.message})`); continue; }
      sets++;

      const expect = { exam: exam.id, level: level.id, section: section.id, teil: teilNo, set: entry.set };
      for (const [key, value] of Object.entries(expect)) if (set[key] !== value) fail(`"${key}" is ${JSON.stringify(set[key])}, expected ${JSON.stringify(value)}`);
      if (!(set.minutes > 0)) fail('"minutes" must be a positive number');
      if (!set.instructions) fail('"instructions" missing');
      if (!Array.isArray(set.groups) || !set.groups.length) { fail('"groups" missing'); continue; }

      const numbers = [];
      const answers = {};
      const report = [];
      set.groups.forEach((group, g) => {
        const where = `group ${g + 1}`;
        if (!Array.isArray(group.texts) || !group.texts.length) fail(`${where}: no texts`);
        if (!Array.isArray(group.questions) || !group.questions.length) fail(`${where}: no questions`);
        const ids = new Set();
        for (const text of group.texts || []) {
          if (!text.id || ids.has(text.id)) fail(`${where}: text id missing or repeated (${text.id})`);
          ids.add(text.id);
          const cells = rows => Array.isArray(rows) && rows.length && rows.every(row => Array.isArray(row) && row.length >= 2 && row.every(cell => typeof cell === 'string' && cell.trim()));
          const valid = p => (typeof p === 'string' && p.trim()) || (p && typeof p === 'object' && ((typeof p.heading === 'string' && p.heading.trim()) || cells(p.rows)));
          if (!Array.isArray(text.paragraphs) || !text.paragraphs.some(p => typeof p === 'string' || p?.rows) || !text.paragraphs.every(valid)) fail(`${where}: text ${text.id} needs paragraphs (text, { heading } or { rows: [[…, …]] })`);
        }
        if (group.none !== undefined && group.none !== false && (typeof group.none !== 'string' || !group.none.trim() || group.texts.some(text => text.label === group.none))) fail(`${where}: "none" must be false or a short label that is not an ad label`);
        // Gaps {{10}} (Goethe B2 Teil 2): every gap belongs to exactly one question of the group and vice versa.
        const gaps = group.texts.flatMap(text => pieces(text).flatMap(piece => [...piece.value.matchAll(/\{\{(\d+)\}\}/g)].map(m => Number(m[1]))));
        if (gaps.length) {
          const asked = (group.questions || []).filter(q => !q.example).map(q => q.number);
          if (gaps.length !== new Set(gaps).size) fail(`${where}: a gap number appears twice`);
          if (gaps.slice().sort((a, b) => a - b).join() !== asked.slice().sort((a, b) => a - b).join()) fail(`${where}: gaps ${gaps.join(',')} do not match questions ${asked.join(',')}`);
        }
        report.push(group.texts.map(text => `${text.label || text.id}:${words([text.title, ...pieces(text).map(piece => piece.value), ...(text.paragraphs || []).map(p => p?.heading || '')].join(' '))}`).join(' '));

        const spans = {};
        for (const question of group.questions || []) {
          const label = `question ${question.number}`;
          if (!question.example) numbers.push(question.number);
          questions += question.example ? 0 : 1;
          if (!TYPES[question.type]) { fail(`${label}: unknown type ${question.type}`); continue; }
          if (question.type === 'zuordnung' && group.texts.filter(text => text.label).length < 2) fail(`${where}: zuordnung needs labelled texts to choose from`);
          // a/b/c, or a/b/c/d for four-option gaps (Goethe C1 Teil 1)
          if (question.type === 'abc' && !['a,b,c', 'a,b,c,d'].includes(Object.keys(question.options || {}).join())) fail(`${label}: options must be a, b, c (or a, b, c, d)`);
          if (question.type === 'fehlersatz' && !['a,b,c', 'a,b,c,d', 'a,b,c,d,e', 'a,b,c,d,e,f'].includes(Object.keys(question.options || {}).join())) fail(`${label}: summary sentences must be a, b, c … (3–6)`);
          if (question.type === 'reihenfolge' && !(Array.isArray(question.options) && question.options.length >= 3)) fail(`${label}: positions must be a list of at least three numbers`);
          if (!TYPES[question.type](question, group).includes(question.answer)) fail(`${label}: answer ${JSON.stringify(question.answer)} is not an option`);
          if (!question.explanation || question.explanation.length < 40) fail(`${label}: explanation missing or too short`);
          if (!question.example) answers[question.answer] = (answers[question.answer] || 0) + 1;
          const evidence = question.evidence || [];
          if (!evidence.length && !(question.type === 'zuordnung' && question.answer === (group.none || '0'))) fail(`${label}: evidence missing`);
          for (const item of evidence) {
            const text = group.texts.find(entry => entry.id === item.text);
            if (!text) { fail(`${label}: evidence points to unknown text ${item.text}`); continue; }
            if (item.quote.includes('{{') || item.quote.includes('}}')) { fail(`${label}: a quote must not contain a gap marker`); continue; }
            const hits = pieces(text).flatMap(({ key: p, value }) => {
              const found = [];
              for (let at = value.indexOf(item.quote); at >= 0; at = value.indexOf(item.quote, at + 1)) found.push({ p, at });
              return found;
            });
            if (hits.length !== 1) { fail(`${label}: quote found ${hits.length}× in ${item.text}: "${item.quote}"`); continue; }
            const span = { ...hits[0], end: hits[0].at + item.quote.length, label };
            const list = spans[item.text] ||= [];
            const overlap = list.find(other => other.p === span.p && other.at < span.end && span.at < other.end);
            if (overlap) fail(`${label}: quote overlaps the quote of ${overlap.label}`);
            list.push(span);
          }
        }
      });
      // Text ids become element ids on the page, so they must be unique in the whole set (Goethe A1 Teil 2 has two texts per group).
      const textIds = set.groups.flatMap(group => (group.texts || []).map(text => text.id));
      if (textIds.length !== new Set(textIds).size) fail('a text id appears in more than one group');
      const examples = set.groups.flatMap(group => group.questions).filter(question => question.example);
      // One example numbered 0, or two numbered "01" and "02" (TestDaF).
      const exampleNumbers = examples.map(question => String(question.number)).join();
      if (examples.length && !['0', '01', '01,02'].includes(exampleNumbers)) fail(`examples must be 0, or "01" and "02" (found ${exampleNumbers})`);
      const real = numbers;
      if (real.some((n, i) => i && n !== real[i - 1] + 1)) fail(`numbers are not consecutive: ${real.join(',')}`);
      console.log(`${path.padEnd(48)} ${String(real.length).padStart(2)} Aufgaben | Lösungen ${Object.entries(answers).sort().map(([k, v]) => `${k}×${v}`).join(' ')} | Wörter ${report.join(' / ')}`);
    }
  });
}

if (errors.length) {
  console.error(`\nFAIL: ${errors.length} problem(s)\n` + errors.map(error => ' - ' + error).join('\n'));
  process.exit(1);
}
console.log(`\nPASS: ${sets} sets, ${questions} questions`);
