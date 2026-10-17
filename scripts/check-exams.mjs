// Checks every exam set listed in js/examsData.js (exercises: [{ set: 'set-1', … }]).
// Format: docs/sinav-setleri.md. Run: node scripts/check-exams.mjs
import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('js/examsData.js', 'utf8'), context);
const data = context.window.BA_EXAMS;

const TYPES = {
  'richtig-falsch': () => ['richtig', 'falsch'],
  'ja-nein': () => ['ja', 'nein'],
  abc: question => Object.keys(question.options || {}),
  zuordnung: (question, group) => [...group.texts.map(text => text.label), '0']
};
const errors = [];
const words = value => String(value).split(/\s+/).filter(Boolean).length;
let sets = 0, questions = 0;

for (const exam of data.exams) for (const level of exam.levels || []) for (const section of level.sections) {
  section.teile.forEach((teil, index) => {
    for (const entry of teil.exercises || []) {
      if (!entry?.set) continue;
      const teilNo = index + 1;
      const path = `data/exams/${exam.id}/${level.id}/${section.id}/teil-${teilNo}/${entry.set}.json`;
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
          const valid = p => (typeof p === 'string' && p.trim()) || (p && typeof p === 'object' && typeof p.heading === 'string' && p.heading.trim());
          if (!Array.isArray(text.paragraphs) || !text.paragraphs.some(p => typeof p === 'string') || !text.paragraphs.every(valid)) fail(`${where}: text ${text.id} needs paragraphs`);
        }
        report.push(group.texts.map(text => `${text.label || text.id}:${words([text.title, ...(text.paragraphs || []).map(p => typeof p === 'string' ? p : p.heading)].join(' '))}`).join(' '));

        const spans = {};
        for (const question of group.questions || []) {
          const label = `question ${question.number}`;
          numbers.push(question.number);
          questions += question.example ? 0 : 1;
          if (!TYPES[question.type]) { fail(`${label}: unknown type ${question.type}`); continue; }
          if (question.type === 'zuordnung' && group.texts.some(text => !text.label)) fail(`${where}: zuordnung needs a label on every text`);
          if (question.type === 'abc' && Object.keys(question.options || {}).join() !== 'a,b,c') fail(`${label}: options must be a, b, c`);
          if (!TYPES[question.type](question, group).includes(question.answer)) fail(`${label}: answer ${JSON.stringify(question.answer)} is not an option`);
          if (!question.explanation || question.explanation.length < 40) fail(`${label}: explanation missing or too short`);
          if (!question.example) answers[question.answer] = (answers[question.answer] || 0) + 1;
          const evidence = question.evidence || [];
          if (!evidence.length && !(question.type === 'zuordnung' && question.answer === '0')) fail(`${label}: evidence missing`);
          for (const item of evidence) {
            const text = group.texts.find(entry => entry.id === item.text);
            if (!text) { fail(`${label}: evidence points to unknown text ${item.text}`); continue; }
            const hits = text.paragraphs.flatMap((paragraph, p) => {
              const found = [];
              if (typeof paragraph !== 'string') return found;
              for (let at = paragraph.indexOf(item.quote); at >= 0; at = paragraph.indexOf(item.quote, at + 1)) found.push({ p, at });
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
      const examples = set.groups.flatMap(group => group.questions).filter(question => question.example);
      if (examples.length > 1) fail('more than one example');
      if (examples.length && examples[0].number !== 0) fail('the example must be number 0');
      const real = numbers.filter(n => n !== 0);
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
