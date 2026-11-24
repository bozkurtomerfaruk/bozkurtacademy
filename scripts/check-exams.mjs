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
  // TestDaF digital Aufgabe 7: the wrong sentences of a summary (answer is a list); Aufgabe 2: position of a paragraph.
  fehlerauswahl: question => Object.keys(question.options || {}),
  reihenfolge: question => (Array.isArray(question.options) ? question.options : []).map(String),
  zuordnung: (question, group) => [...group.texts.filter(text => text.label).map(text => text.label), ...(group.none === false ? [] : [group.none || '0'])]
};
const errors = [];
const words = value => String(value).replace(/\{\{\d+\}\}/g, ' ').replace(/\{\{0=|\}\}/g, ' ').split(/\s+/).filter(Boolean).length;
// Searchable pieces of a text: plain paragraphs and the cells of { rows } tables, keyed by position.
const pieces = text => (text.paragraphs || []).flatMap((p, i) => typeof p === 'string' ? [{ key: `${i}`, value: p }]
  : Array.isArray(p?.rows) ? p.rows.flatMap((row, r) => row.map((cell, c) => ({ key: `${i}:${r}:${c}`, value: cell }))) : []);
let sets = 0, questions = 0, writings = 0;
// telc C1 model answers reach different conclusions (teacher's decision): at least two for, two against, one conditional.
const telcC1Stances = [];

// Same word count as the counter in js/writing-task.js: letters/digits, joined by - or ' (B1-Prüfung is one word).
const countWords = value => (String(value).match(/[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*/gu) || []).length;
const CRITERIA = ['aufgabe', 'aufbau', 'sprache'];
function checkWriting(set, fail) {
  const text = value => typeof value === 'string' && value.trim();
  if (set.kind !== 'writing') fail('"kind" must be "writing" in a Schreiben set');
  for (const key of ['title', 'situation', 'task']) if (!text(set[key])) fail(`"${key}" missing`);
  // textType: the kind of text (the AI check gets type-specific rules, worker/schreiben-kontrol.js) and the register it needs.
  // essay (telc C1 Hochschule): argumentative text for a seminar paper, no greeting or signature.
  const REGISTER = { 'email-informal': 'du', sms: 'du', 'email-semiformal': 'Sie', 'email-formal': 'Sie', forum: 'neutral', essay: 'neutral' };
  if (!(set.textType in REGISTER)) fail(`"textType" must be one of ${Object.keys(REGISTER).join(', ')}`);
  else if (set.register !== REGISTER[set.textType]) fail(`"register" must be "${REGISTER[set.textType]}" for textType ${set.textType}`);
  // Content points (Goethe B1 Teil 1, A1/A2) or none (Goethe B1 Teil 2 and 3: the task says what to write).
  if (!Array.isArray(set.points) || (set.points.length && (set.points.length < 2 || !set.points.every(text)))) fail('"points" must be empty or have at least two content points');
  // Forum posts answer an opinion from a guest book: { site?, author, time?, text }.
  // Goethe B1 Teil 2 answers a guest-book opinion (post); Goethe B2 and C1 Teil 1 are forum posts on a topic with four points (no post).
  if (set.textType === 'forum' && !(set.exam === 'goethe' && ['b2', 'c1'].includes(set.level)) && !(text(set.post?.author) && text(set.post?.text))) fail('"post" with author and text is needed for a forum task');
  if (set.post !== undefined && set.textType !== 'forum') fail('"post" is only for forum tasks');
  // Reply tasks (telc B1): the received e-mail { from, subject?, text }; "subjectLine": the answer starts with "Betreff: …".
  if (set.mail !== undefined && !(String(set.textType).startsWith('email-') && text(set.mail?.from) && text(set.mail?.text))) fail('"mail" needs from and text and an email textType');
  if (set.subjectLine !== undefined && set.subjectLine !== true) fail('"subjectLine" must be true when present');
  if (set.subjectLine && !/^Betreff: \S/.test(String(set.model?.text))) fail('model answer must start with "Betreff: …" when subjectLine is true');
  // words.recommended: no official word limit in the exam; the page says "suggested length".
  if (set.words?.recommended !== undefined && set.words.recommended !== true) fail('"words.recommended" must be true when present');
  if (set.instructions !== undefined && !text(set.instructions)) fail('"instructions" must be text when present');
  // examChoice: in the real exam the candidate picks one of two tasks (DTZ: Aufgabe A or B); the page says so.
  // "thema" (telc C1 Hochschule): one of two topics (Thema 1 oder Thema 2); the note also says the quotations are optional.
  if (set.examChoice !== undefined && set.examChoice !== true && set.examChoice !== 'thema') fail('"examChoice" must be true or "thema" when present');
  // quotes (telc C1 Hochschule): two quotations for orientation, shown under the task.
  if (set.quotes !== undefined && !(Array.isArray(set.quotes) && set.quotes.length >= 2 && set.quotes.every(q => text(q) && /^„[^„“]+“$/.test(q)))) fail('"quotes" must list at least two quotations in „…“');
  // words.veryShort: below this many words the counter warns that B1 can hardly be reached (DTZ: 40, g.a.s.t. FAQ).
  if (set.words?.veryShort !== undefined && !(Number.isInteger(set.words.veryShort) && set.words.veryShort > 0 && set.words.veryShort < set.words.min)) fail('"words.veryShort" must be a positive integer below "words.min"');
  // words.zeroBelow: below this many words the task scores 0 in the exam (Goethe A2: half of the required minimum); the counter says so.
  if (set.words?.zeroBelow !== undefined && !(Number.isInteger(set.words.zeroBelow) && set.words.zeroBelow > 0 && set.words.zeroBelow < set.words.min)) fail('"words.zeroBelow" must be a positive integer below "words.min"');
  // sharedMinutes: the official time covers several Teile together (Goethe A2: 30 minutes for both); the page says so.
  if (set.sharedMinutes !== undefined && !(Number.isInteger(set.sharedMinutes) && set.sharedMinutes > set.minutes)) fail('"sharedMinutes" must be an integer above "minutes"');
  // Goethe A2 (Modellsatz and Übungssatz 01): Teil 1 SMS to a friend (du), 20–30 words; Teil 2 semi-formal e-mail (Sie), 30–40 words;
  // three content points each, 30 minutes for both parts, under half the minimum = 0 points.
  if (set.exam === 'goethe' && set.level === 'a2') {
    const A2 = { 1: { textType: 'sms', min: 20, max: 30, zero: 10 }, 2: { textType: 'email-semiformal', min: 30, max: 40, zero: 15 } }[set.teil];
    if (!A2) fail('Goethe A2 Schreiben has Teil 1 and Teil 2 only');
    else {
      if (set.textType !== A2.textType) fail(`Goethe A2 Teil ${set.teil} needs textType "${A2.textType}"`);
      if (set.points?.length !== 3) fail('Goethe A2 writing tasks have exactly three content points');
      if (set.words?.min !== A2.min || set.words?.max !== A2.max || set.words?.zeroBelow !== A2.zero) fail(`Goethe A2 Teil ${set.teil} needs words ${A2.min}–${A2.max} and zeroBelow ${A2.zero}`);
      if (set.sharedMinutes !== 30) fail('Goethe A2 writing tasks need "sharedMinutes": 30');
    }
  }
  // choosePoints: the task lists more points than the candidate must cover (telc A2 Teil 2: four keywords, choose three).
  // model.skipped names the point the model answer leaves out; a Turkish note must say so.
  if (set.choosePoints !== undefined && !(Number.isInteger(set.choosePoints) && set.choosePoints >= 2 && set.choosePoints < (set.points?.length || 0))) fail('"choosePoints" must be an integer from 2 to below the number of points');
  // With ownAspect (telc B2) two points may be skipped (two points + an aspect of one's own): skipped is then a list.
  if (set.model?.skipped !== undefined) {
    const skipped = [].concat(set.model.skipped);
    if (!set.choosePoints || !skipped.length || !skipped.every(point => (set.points || []).includes(point))) fail('"model.skipped" must be one of "points" or a list of them (only with choosePoints)');
    else for (const point of skipped) if (!(set.model.notes || []).some(note => String(note).includes(`„${point}“`) && /atla/.test(note))) fail(`a model note must say that „${point}“ was left out (atladı …)`);
  }
  // ownAspect (telc B2): either choosePoints points, or one point fewer plus a relevant aspect of one's own; the page says both ways.
  if (set.ownAspect !== undefined && !(set.ownAspect === true && set.choosePoints)) fail('"ownAspect" must be true and needs "choosePoints"');
  if (set.model?.own !== undefined && !(set.ownAspect && text(set.model.own))) fail('"model.own" (the own aspect of the model answer) needs "ownAspect"');
  // ad (telc B2): the advert the e-mail reacts to { title, text, contact? }; context: the candidate's situation after the advert.
  if (set.ad !== undefined && !(text(set.ad?.title) && text(set.ad?.text) && (set.ad.contact === undefined || text(set.ad.contact)))) fail('"ad" needs title and text (contact optional)');
  if (set.context !== undefined && !text(set.context)) fail('"context" must be text when present');
  // words.atLeast: "Schreiben Sie mindestens {min} Wörter" is the official minimum; the counter warns below it.
  if (set.words?.atLeast !== undefined && set.words.atLeast !== true) fail('"words.atLeast" must be true when present');
  // sharedWith "lesen": the shared time covers Lesen and Schreiben together (telc A2: 50 minutes).
  if (set.sharedWith !== undefined && !(set.sharedWith === 'lesen' && set.sharedMinutes)) fail('"sharedWith" must be "lesen" and needs "sharedMinutes"');
  // telc A2 / Start Deutsch 2 (Übungstest 1, 2024): Teil 2 a letter to an acquaintance, four keywords of which three are covered
  // (one or two sentences each), greeting and closing, about 40 words; Lesen and Schreiben 50 minutes together.
  if (set.exam === 'telc' && set.level === 'a2') {
    if (set.teil !== 2) fail('telc A2 Schreiben Teil 1 is a form (kind "form")');
    if (!['email-informal', 'email-semiformal'].includes(set.textType)) fail('telc A2 Teil 2 is an informal or semi-formal letter (email-informal, email-semiformal)');
    if (set.points?.length !== 4 || set.choosePoints !== 3) fail('telc A2 Teil 2 needs four keyword points and "choosePoints": 3');
    if (set.words?.target !== 40 || set.words?.min !== 35 || set.words?.max !== 55 || set.words?.zeroBelow !== undefined) fail('telc A2 Teil 2 needs words 35–55 (target 40), no zeroBelow');
    if (set.sharedMinutes !== 50 || set.sharedWith !== 'lesen') fail('telc A2 Teil 2 needs "sharedMinutes": 50 and "sharedWith": "lesen"');
    if (!(set.model?.skipped)) fail('telc A2 Teil 2 model answer covers three points; "model.skipped" names the fourth');
    else {
      const covered = (set.model.covers || []);
      if (covered.length !== 3 || covered.includes(set.model.skipped) || !covered.every(point => set.points.includes(point))) fail('"model.covers" must list the three other points');
    }
    if (!(Array.isArray(set.checklist) && set.checklist.some(item => item?.tr === 'Dördüncü maddeyi de yazmak ek puan getirmez; 3 maddeyi iyi yazmak yeterli.'))) fail('telc A2 checklist needs the item "Dördüncü maddeyi de yazmak ek puan getirmez; 3 maddeyi iyi yazmak yeterli."');
  }
  // telc Deutsch B2 (Übungstest 1, überarbeitete Auflage 2019): one Teil, 30 minutes; choose Aufgabe A (Bitte um Informationen) or
  // B (Beschwerde); a semi-formal e-mail to a company reacting to an advert; four Leitpunkte: three, or two plus an aspect of one's own;
  // subject line, greeting, introduction and closing; at least 150 words (site: 150–220). Criteria I–III, A 5 / B 3 / C 1 / D 0, ×3 = 45.
  if (set.exam === 'telc' && set.level === 'b2') {
    if (set.teil !== 1 || set.minutes !== 30) fail('telc B2 Schreiben has one Teil of 30 minutes');
    if (set.textType !== 'email-formal' || set.subjectLine !== true || set.examChoice !== true) fail('telc B2 needs textType "email-formal", "subjectLine" and "examChoice"');
    if (!set.ad) fail('telc B2 tasks react to an advert ("ad")');
    if (set.points?.length !== 4 || set.choosePoints !== 3 || set.ownAspect !== true) fail('telc B2 needs four Leitpunkte, "choosePoints": 3 and "ownAspect": true');
    if (!/a\) drei der folgenden Punkte oder b\) zwei der folgenden Punkte und einen weiteren Aspekt Ihrer Wahl/.test(set.task || '')) fail('telc B2 task must state both ways (a) drei … oder b) zwei … und einen weiteren Aspekt Ihrer Wahl)');
    if (!/mindestens 150 Wörter/.test(set.instructions || '')) fail('telc B2 instructions need "mindestens 150 Wörter"');
    if (set.words?.min !== 150 || set.words?.target !== 180 || set.words?.max !== 220 || set.words?.atLeast !== true || set.words?.zeroBelow !== undefined) fail('telc B2 needs words 150–220 (target 180), "atLeast" and no zeroBelow');
    const covers = set.model?.covers || [], skipped = [].concat(set.model?.skipped || []);
    const ok = covers.every(point => set.points.includes(point)) && !covers.some(point => skipped.includes(point)) && covers.length + skipped.length === 4
      && (covers.length === 3 ? set.model.own === undefined : covers.length === 2 && text(set.model.own));
    if (!ok) fail('telc B2 model: "covers" three points (one skipped) or two points plus "model.own" (two skipped)');
    const list = Array.isArray(set.checklist) ? set.checklist : [];
    if (!list.some(item => item?.criterion === 'aufbau' && String(item.tr).startsWith('Maddeleri ayrı ayrı sıralama; bağlaçlarla birbirine bağla'))) fail('telc B2 checklist needs "Maddeleri ayrı ayrı sıralama; bağlaçlarla birbirine bağla …"');
    if (!list.some(item => item?.criterion === 'aufgabe' && /2 madde \+ duruma uygun kendi/.test(item.tr || ''))) fail('telc B2 checklist needs the item about the two ways (3 madde ya da 2 madde + kendi konu)');
    if (!list.some(item => item?.criterion === 'aufbau' && /Kohärenz/.test(item.tr || '')) || !(set.redemittel || []).some(g => /Kohärenz/.test(g?.group || ''))) fail('telc B2 needs a Kohärenz checklist item and Redemittel group');
  }
  // anyOrder: in the exam the candidate may start with either task (Goethe B2); the page says so.
  if (set.anyOrder !== undefined && set.anyOrder !== true) fail('"anyOrder" must be true when present');
  // Goethe B2 (Modellsatz Erwachsene, 2. Auflage 2025): 75 minutes for both parts, start with either; Teil 1 forum post (~150 words,
  // 50 min, introduction and conclusion), Teil 2 semi-formal message (~100 words, 25 min, greeting and closing); four points each;
  // under half the word count = 0 points. The checklist needs Kohärenz connectors (teacher's decision).
  if (set.exam === 'goethe' && set.level === 'b2') {
    const B2 = { 1: { textType: 'forum', min: 130, max: 180, zero: 75, minutes: 50 }, 2: { textType: 'email-semiformal', min: 85, max: 125, zero: 50, minutes: 25 } }[set.teil];
    if (!B2) fail('Goethe B2 Schreiben has Teil 1 and Teil 2 only');
    else {
      if (set.textType !== B2.textType) fail(`Goethe B2 Teil ${set.teil} needs textType "${B2.textType}"`);
      if (set.points?.length !== 4) fail('Goethe B2 writing tasks have exactly four content points');
      if (set.words?.min !== B2.min || set.words?.max !== B2.max || set.words?.zeroBelow !== B2.zero) fail(`Goethe B2 Teil ${set.teil} needs words ${B2.min}–${B2.max} and zeroBelow ${B2.zero}`);
      if (set.minutes !== B2.minutes || set.sharedMinutes !== 75 || set.anyOrder !== true) fail(`Goethe B2 Teil ${set.teil} needs minutes ${B2.minutes}, sharedMinutes 75 and anyOrder`);
      if (set.post !== undefined) fail('Goethe B2 Teil 1 has no guest-book post');
      if (!(Array.isArray(set.checklist) && set.checklist.some((item) => item?.criterion === 'aufbau' && /Kohärenz/.test(item.tr || '')))) fail('Goethe B2 checklist needs a Kohärenz item with B2 connectors');
      if (!(Array.isArray(set.redemittel) && set.redemittel.some((g) => /Kohärenz/.test(g?.group || '')))) fail('Goethe B2 Redemittel need a Kohärenz group');
    }
  }
  // Goethe-Zertifikat C1 (modular Modellsatz, 2. Auflage Februar 2024): Schreiben 75 minutes, start with either part;
  // Teil 1 Diskussionsbeitrag for an online forum (~230 words, suggested 50 min, four Sprachfunktionen, no post to answer),
  // Teil 2 (semi-)formal message (~120 words, 25 min, four Sprachfunktionen). Criteria Aufgabenerfüllung, Kohärenz, Wortschatz,
  // Strukturen (Teil 1 14/14/16/16, Teil 2 4 × 10 = 100); under 50 % of the words or off topic = 0 points for that part.
  if (set.exam === 'goethe' && set.level === 'c1') {
    const C1 = { 1: { textType: 'forum', min: 200, target: 230, max: 270, zero: 115, minutes: 50, words: 'circa 230 Wörter' },
      2: { textType: 'email-semiformal', min: 100, target: 120, max: 145, zero: 60, minutes: 25, words: 'circa 120 Wörter' } }[set.teil];
    if (!C1) fail('Goethe C1 Schreiben has Teil 1 and Teil 2 only');
    else {
      if (set.textType !== C1.textType) fail(`Goethe C1 Teil ${set.teil} needs textType "${C1.textType}"`);
      if (set.points?.length !== 4) fail('Goethe C1 writing tasks have exactly four content points (Sprachfunktionen)');
      if (set.words?.min !== C1.min || set.words?.target !== C1.target || set.words?.max !== C1.max || set.words?.zeroBelow !== C1.zero) fail(`Goethe C1 Teil ${set.teil} needs words ${C1.min}–${C1.max} (target ${C1.target}) and zeroBelow ${C1.zero}`);
      if (set.minutes !== C1.minutes || set.sharedMinutes !== 75 || set.anyOrder !== true) fail(`Goethe C1 Teil ${set.teil} needs minutes ${C1.minutes}, sharedMinutes 75 and anyOrder`);
      if (!String(set.instructions || '').includes(`Schreiben Sie ${C1.words}.`) || !/wie gut die Sätze und Abschnitte sprachlich miteinander verknüpft sind/.test(set.instructions || '')) fail(`Goethe C1 Teil ${set.teil} instructions need the official assessment sentence and "Schreiben Sie ${C1.words}."`);
      if (set.post !== undefined) fail('Goethe C1 Teil 1 has no post to answer');
      if (set.teil === 1 && !/^Für das Internetforum „[^“]+“ verfassen Sie einen Diskussionsbeitrag zu diesem Thema:$/.test(set.situation || '')) fail('Goethe C1 Teil 1 situation: "Für das Internetforum „…“ verfassen Sie einen Diskussionsbeitrag zu diesem Thema:"');
      const model = String(set.model?.text || '');
      if (set.teil === 2 && !(/^Sehr geehrte[r]? (Frau|Herr) /.test(model) && /\nMit freundlichen Grüßen\n/.test(model))) fail('Goethe C1 Teil 2 model answer needs "Sehr geehrte(r) Frau/Herr …" and "Mit freundlichen Grüßen"');
      const n = countWords(model), [lo, hi] = set.teil === 1 ? [215, 245] : [110, 130];
      if (n < lo || n > hi) fail(`Goethe C1 Teil ${set.teil} model answer should have ${lo}–${hi} words (has ${n})`);
      const list = Array.isArray(set.checklist) ? set.checklist : [];
      if (!list.some((item) => item?.criterion === 'aufbau' && /^Kohärenz:/.test(item.tr || ''))) fail('Goethe C1 checklist needs a "Kohärenz: …" item');
      if (!(set.redemittel || []).some((g) => /^Kohärenz/.test(g?.group || ''))) fail('Goethe C1 Redemittel need a Kohärenz group');
      if (set.teil === 2 && !list.some((item) => item?.criterion === 'aufgabe' && /^Register:/.test(item.tr || ''))) fail('Goethe C1 Teil 2 checklist needs a "Register: …" item (Aufgabenerfüllung includes register)');
      if (!list.some((item) => new RegExp(`${C1.zero}'(ın|in) altı sınavda 0 puan`).test(item?.tr || ''))) fail(`Goethe C1 checklist must say that under ${C1.zero} words the part scores 0`);
    }
  }
  // telc Deutsch C1 Hochschule (Übungstest 1, 3. Auflage 2021): Schriftlicher Ausdruck one text, 70 minutes, 48 points (22.5 %);
  // choose one of two topics; Seminararbeit on a topic "aus unterschiedlichen Perspektiven", two quotations for orientation (other
  // aspects allowed); argue convincingly, give examples, Einleitung/Hauptteil/Schluss; at least 350 words (site: 350–450).
  // Criteria Aufgabengerechtheit, Korrektheit, Repertoire, Kommunikative Gestaltung, A 12 / B 8 / C 4 / D 0; "Thema verfehlt" = D in all four.
  if (set.exam === 'telc' && set.level === 'c1') {
    if (set.teil !== 1 || set.minutes !== 70) fail('telc C1 Hochschule Schreiben has one Teil of 70 minutes');
    if (set.textType !== 'essay' || set.examChoice !== 'thema') fail('telc C1 needs textType "essay" and "examChoice": "thema"');
    if (set.points?.length || set.quotes?.length !== 2) fail('telc C1 tasks have no content points and exactly two quotations');
    if (set.situation !== `In einer Seminararbeit sollen Sie das Thema „${set.title}“ aus unterschiedlichen Perspektiven beleuchten. Sie können die unten stehenden Zitate zur Orientierung verwenden, aber auch andere Aspekte des Themas darlegen.`) fail('telc C1 situation: official Seminararbeit sentence with the title as Thema');
    if (set.task !== 'Argumentieren Sie überzeugend, führen Sie Beispiele an und gliedern Sie Ihren Text in Einleitung, Hauptteil und Schluss.') fail('telc C1 task: official sentence (Argumentieren Sie überzeugend …)');
    if (!/eigenen Standpunkt dazu erarbeiten und argumentativ darlegen\. Ihr Text soll mindestens 350 Wörter umfassen\.$/.test(set.instructions || '')) fail('telc C1 instructions need the official sentence and "mindestens 350 Wörter"');
    if (set.words?.min !== 350 || set.words?.target !== 400 || set.words?.max !== 450 || set.words?.atLeast !== true || set.words?.zeroBelow !== undefined) fail('telc C1 needs words 350–450 (target 400), "atLeast" and no zeroBelow');
    const model = String(set.model?.text || ''), n = countWords(model);
    if (n < 360 || n > 440) fail(`telc C1 model answer should have 360–440 words (has ${n})`);
    if (model.split('\n').filter(Boolean).length < 4) fail('telc C1 model answer needs paragraphs (Einleitung, Hauptteil, Schluss)');
    if (!['dafür', 'dagegen', 'bedingt'].includes(set.model?.stance)) fail('telc C1 "model.stance" must be dafür, dagegen or bedingt');
    else telcC1Stances.push(set.model.stance);
    const list = Array.isArray(set.checklist) ? set.checklist : [];
    for (const [criterion, start] of [['aufgabe', 'Aufgabengerechtheit: '], ['aufgabe', 'Karşı görüşü de ciddiye al ve çürüt'], ['aufbau', 'Kommunikative Gestaltung: '], ['aufbau', 'Kohärenz: '], ['sprache', 'Korrektheit: '], ['sprache', 'Repertoire: ']]) {
      if (!list.some(item => item?.criterion === criterion && String(item.tr || '').startsWith(start))) fail(`telc C1 checklist needs a ${criterion} item "${start}…"`);
    }
    if (!list.some(item => /„Thema verfehlt“/.test(item?.tr || '') && /en az 350 kelime/i.test(item.tr))) fail('telc C1 checklist needs the item with "en az 350 kelime" and „Thema verfehlt“');
    if (!(set.redemittel || []).some(g => /^Kohärenz/.test(g?.group || ''))) fail('telc C1 Redemittel need a Kohärenz group');
  }
  // DTZ (g.a.s.t. practice sets): one semi-formal or formal message, four content points, no subject line, no word limit.
  if (set.exam === 'dtz') {
    if (!['email-semiformal', 'email-formal'].includes(set.textType)) fail('DTZ writing tasks are semi-formal or formal (email-semiformal, email-formal)');
    if (set.points?.length !== 4) fail('DTZ writing tasks have exactly four content points');
    if (set.subjectLine) fail('DTZ writing tasks have no subject line');
    if (set.examChoice !== true || set.words?.recommended !== true) fail('DTZ writing tasks need "examChoice": true and "words.recommended": true');
    if (/^Betreff/i.test(String(set.model?.text))) fail('DTZ model answers start with the greeting, not with "Betreff"');
    if (!(Array.isArray(set.checklist) && set.checklist.some(item => /numaralamadım/.test(item?.tr || '')))) fail('DTZ checklist needs the item about not numbering the points (connected text)');
  }
  const w = set.words || {};
  if (!(Number.isInteger(w.min) && Number.isInteger(w.target) && Number.isInteger(w.max) && w.min > 0 && w.min <= w.target && w.target <= w.max)) fail('"words" needs min <= target <= max');
  const list = Array.isArray(set.checklist) ? set.checklist : [];
  if (list.length < 5 || !list.every(item => CRITERIA.includes(item?.criterion) && text(item.tr))) fail(`"checklist" needs at least 5 items with criterion (${CRITERIA.join(', ')}) and tr`);
  for (const c of CRITERIA) if (!list.some(item => item?.criterion === c)) fail(`"checklist" has no item for ${c}`);
  const groups = Array.isArray(set.redemittel) ? set.redemittel : [];
  if (groups.length < 3 || !groups.every(g => text(g?.group) && Array.isArray(g.items) && g.items.length && g.items.every(i => text(i?.de) && text(i?.tr)))) fail('"redemittel" needs at least 3 groups of { de, tr } items');
  if (!text(set.model?.text)) fail('"model.text" missing');
  else {
    const n = countWords(set.model.text);
    if (n < w.min || n > w.max) fail(`model answer has ${n} words, expected ${w.min}–${w.max}`);
  }
  if (!Array.isArray(set.model?.notes) || !set.model.notes.length || !set.model.notes.every(text)) fail('"model.notes" needs at least one note (Turkish)');
}

// Form doldurma (kind "form", Goethe A1 Schreiben Teil 1; js/form-task.js): durum metni, görev, form satırları.
// Boşluklar 1'den başlayıp sırayla numaralı; her biri ya kabul edilen cevaplar (accept) ya da seçenekler + cevap içerir,
// dayanağı (evidence) durum metninde bir kez geçer ve çakışmaz, Türkçe açıklaması en az 40 karakter.
function checkForm(set, fail) {
  const text = value => typeof value === 'string' && value.trim();
  for (const key of ['title', 'situation', 'task']) if (!text(set[key])) fail(`"${key}" missing`);
  // cards (telc A2): documents beside the text, { title, rows: [[label, value], …] }; evidence may be in a card value.
  const cards = set.cards === undefined ? [] : set.cards;
  if (!Array.isArray(cards) || !cards.every(card => text(card?.title) && Array.isArray(card.rows) && card.rows.length >= 2
    && card.rows.every(row => Array.isArray(row) && row.length === 2 && row.every(text)))) fail('"cards" must be a list of { title, rows: [[label, value], …] }');
  if (set.sharedMinutes !== undefined && !(Number.isInteger(set.sharedMinutes) && set.sharedMinutes > set.minutes)) fail('"sharedMinutes" must be an integer above "minutes"');
  if (set.sharedWith !== undefined && !(set.sharedWith === 'lesen' && set.sharedMinutes)) fail('"sharedWith" must be "lesen" and needs "sharedMinutes"');
  // telc A2 (Übungstest 1): the details come from a short text and a document (ID card, bank card); Lesen + Schreiben 50 minutes.
  if (set.exam === 'telc' && set.level === 'a2' && (!cards.length || set.sharedMinutes !== 50 || set.sharedWith !== 'lesen')) fail('telc A2 Teil 1 needs "cards", "sharedMinutes": 50 and "sharedWith": "lesen"');
  const sources = [String(set.situation), ...(Array.isArray(cards) ? cards.flatMap(card => (card.rows || []).map(row => String(row?.[1] ?? ''))) : [])];
  const rows = Array.isArray(set.form?.rows) ? set.form.rows : [];
  if (!text(set.form?.title) || rows.length < 5) { fail('"form" needs a title and rows'); return; }
  const blanks = rows.filter(row => row.number !== undefined);
  blanks.forEach((row, i) => { if (row.number !== i + 1) fail(`blank numbers must be 1, 2, 3 …; found ${row.number}`); });
  if (blanks.length !== 5) fail(`form needs 5 blanks, found ${blanks.length}`);
  if (rows.filter(row => row.example).length !== 1) fail('form needs exactly one example row (0)');
  const spans = [];
  for (const row of rows) {
    if (!text(row.label)) fail('every row needs a label');
    if (row.number === undefined) { if (!text(row.value)) fail(`row "${row.label}" needs a value or a number`); continue; }
    const label = `blank ${row.number}`;
    if (row.choices) {
      if (!Array.isArray(row.choices) || row.choices.length < 2 || !row.choices.every(text) || !row.choices.includes(row.answer)) fail(`${label}: "choices" (2+) must include "answer"`);
    } else if (!Array.isArray(row.accept) || !row.accept.length || !row.accept.every(text)) fail(`${label}: "accept" needs at least one answer`);
    if (!Array.isArray(row.evidence) || !row.evidence.length) fail(`${label}: "evidence" missing`);
    for (const quote of row.evidence || []) {
      const hits = sources.flatMap((source, src) => { const found = []; for (let at = source.indexOf(quote); at >= 0; at = source.indexOf(quote, at + 1)) found.push({ src, at }); return found; });
      if (hits.length !== 1) { fail(`${label}: evidence "${quote}" must occur exactly once in "situation" and the cards`); continue; }
      const { src, at } = hits[0];
      if (spans.some(s => s.src === src && at < s.end && at + quote.length > s.at)) fail(`${label}: evidence "${quote}" overlaps another blank`);
      spans.push({ src, at, end: at + quote.length });
    }
    if (!text(row.explanation) || row.explanation.length < 40) fail(`${label}: Turkish "explanation" needs at least 40 characters`);
  }
}

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
      // Schreiben (kind "writing"): a task, a word target, a checklist, Redemittel and a model answer; no questions.
      // "instructions" is optional there (Goethe B1 Teil 2 has only the task line).
      if (section.id === 'schreiben') { if (set.kind === 'form') checkForm(set, fail); else checkWriting(set, fail); writings++; continue; }
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
          if (question.type === 'fehlerauswahl') {
            const keys = Object.keys(question.options || {});
            if (keys.join() !== 'abcdefghijklmnopqrstuvwxyz'.slice(0, keys.length).split('').join() || keys.length < 6) fail(`${label}: summary sentences must be a, b, c … (at least 6)`);
            if (!Array.isArray(question.answer) || question.answer.length !== 3 || new Set(question.answer).size !== 3) fail(`${label}: answer must list three different wrong sentences`);
            if ((question.breaks || []).some(key => !keys.includes(key))) fail(`${label}: breaks must be sentence letters`);
          }
          if (question.type === 'reihenfolge' && !(Array.isArray(question.options) && question.options.length >= 3)) fail(`${label}: positions must be a list of at least three numbers`);
          if (![].concat(question.answer).every(value => TYPES[question.type](question, group).includes(value))) fail(`${label}: answer ${JSON.stringify(question.answer)} is not an option`);
          if (!question.explanation || question.explanation.length < 40) fail(`${label}: explanation missing or too short`);
          if (!question.example) [].concat(question.answer).forEach(value => { answers[value] = (answers[value] || 0) + 1; });
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

if (telcC1Stances.length) {
  const count = stance => telcC1Stances.filter(s => s === stance).length;
  if (count('dafür') < 2 || count('dagegen') < 2 || count('bedingt') < 1) errors.push(`telc C1 model answers: need at least 2 dafür, 2 dagegen and 1 bedingt (found ${telcC1Stances.join(', ')})`);
}

if (errors.length) {
  console.error(`\nFAIL: ${errors.length} problem(s)\n` + errors.map(error => ' - ' + error).join('\n'));
  process.exit(1);
}
console.log(`\nPASS: ${sets} sets, ${questions} questions, ${writings} writing tasks`);
