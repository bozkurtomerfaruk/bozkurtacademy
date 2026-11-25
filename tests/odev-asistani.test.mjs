// Ödev asistanı mantığı (js/account/homework-assistant.js), gerçek katalog ve arama diziniyle. Çalıştırma:
// node --test tests/odev-asistani.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { examHistory, examItemState, examOrder, examTargets, examTrack, nextExamItem } from '../js/account/homework-assistant.js';
import { buildTopicIndex, nextExercises, normalize, searchTopics, studentHistory, topicProgress } from '../js/account/homework-assistant.js';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const index = buildTopicIndex(read('data/catalog.json').levels, read('data/search-index.json'));
const top = (q, opts) => searchTopics(index, q, opts).map((t) => `${t.level}/${t.topic}`);

test('normalize: umlaut, ß ve Türkçe harfler', () => {
  assert.equal(normalize('Relativsätze'), 'relativsaetze');
  assert.equal(normalize('Straße – Şimdiki Zaman'), 'strasse simdiki zaman');
});

test('konu araması: lassen, Perfekt, Relativsatz', () => {
  assert.equal(top('lassen')[0], 'B1/lassen-infinitiv');
  assert.ok(top('Perfekt').slice(0, 2).includes('A1/perfekt'), top('Perfekt').join());
  assert.equal(top('Relativsatz')[0], 'B1/relativsaetze');
  assert.equal(top('relativsätze')[0], 'B1/relativsaetze');
  assert.deepEqual(top('x'), []);
  assert.deepEqual(top('qqqqzzzz'), []);
});

test('konu araması: paket adında geçen kelimeler "matches" olarak döner', () => {
  const r = searchTopics(index, 'Dativ').find((t) => t.topic === 'relativsaetze');
  assert.ok(r && r.matches.includes('dativ-4'));
});

test('sıradaki paketler: çözülen, verilen ve formdakiler atlanır', () => {
  const perfekt = index.find((t) => t.level === 'A1' && t.topic === 'perfekt');
  const ids = perfekt.exercises.map((e) => e.id);
  const history = studentHistory(
    [{ level: 'A1', topic: 'perfekt', exercise: ids[0], score: 8, total: 10 }],
    [{ exercises: [{ level: 'A1', topic: 'perfekt', exercise: ids[1] }] }]
  );
  const next = nextExercises(perfekt, [history], { count: 3, skip: new Set([`A1/perfekt/${ids[2]}`]) }).map((e) => e.id);
  assert.deepEqual(next, [ids[3], ids[4], ids[5]]);
  assert.deepEqual(topicProgress(perfekt, history), { solved: 1, total: ids.length });
});

test('sıradaki paketler: konunun tamamı verildiyse öneri yok; birden çok öğrencide hiçbirinin yapmadığı', () => {
  const perfekt = index.find((t) => t.level === 'A1' && t.topic === 'perfekt');
  const ids = perfekt.exercises.map((e) => e.id);
  assert.deepEqual(nextExercises(perfekt, [studentHistory([], [{ topics: [{ level: 'A1', topic: 'perfekt' }] }])]), []);
  const a = studentHistory([{ level: 'A1', topic: 'perfekt', exercise: ids[0] }]);
  const b = studentHistory([{ level: 'A1', topic: 'perfekt', exercise: ids[1] }]);
  assert.deepEqual(nextExercises(perfekt, [a, b], { count: 2 }).map((e) => e.id), [ids[2], ids[3]]);
  assert.deepEqual(nextExercises(perfekt, [], { count: 2 }).map((e) => e.id), [ids[0], ids[1]]);
});

// Hedef sınav: sıradaki Lesen seti ve Schreiben görevi (sıra: önce bütün Teil'ler aynı setten).

const lesen = (teil, set) => ({ id: `goethe-b1-lesen-${teil}-set-${set}`, exam: 'goethe', level: 'b1', section: 'lesen', teil, set: `set-${set}` });
const task = (teil, set) => ({ id: `goethe-b1-${teil}-set-${set}`, exam: 'goethe', level: 'b1', teil, set: `set-${set}` });
const SETS = [lesen(2, 1), lesen(1, 2), lesen(1, 1), lesen(3, 1), lesen(2, 2), lesen(3, 2), lesen(1, 10), { ...lesen(1, 1), id: 'telc-b1-lesen-1-set-1', exam: 'telc' }];
const TASKS = [task(1, 1), task(2, 1), task(1, 2), task(2, 2)];

test('sınav sırası: önce bütün Teil\'ler aynı setten; set-10 set-2\'den sonra', () => {
  assert.deepEqual(examOrder(SETS.slice(0, 7)).map((s) => `${s.teil}/${s.set}`), ['1/set-1', '2/set-1', '3/set-1', '1/set-2', '2/set-2', '3/set-2', '1/set-10']);
  const track = examTrack({ exam: 'goethe', level: 'b1' }, { sets: SETS, tasks: TASKS });
  assert.equal(track.lesen.length, 7);
  assert.deepEqual(track.schreiben.map((t) => t.id), ['goethe-b1-1-set-1', 'goethe-b1-2-set-1', 'goethe-b1-1-set-2', 'goethe-b1-2-set-2']);
  assert.deepEqual(examTrack(null, { sets: SETS }), { lesen: [], schreiben: [] });
});

test('sıradaki: verilen, çözülen ve yazılan atlanır; "son verilen" en yeni tarihli', () => {
  const d = (s) => new Date(s);
  const history = examHistory(
    [{ level: 'b1', topic: 'sinav', exercise: 'goethe-b1-lesen-2-set-1', score: 5, total: 6 }],
    [
      { createdAt: d('2026-11-01'), exercises: [{ level: 'B1', topic: 'sinav', exercise: 'goethe-b1-lesen-1-set-1' }] },
      { createdAt: d('2026-11-12'), exercises: [{ level: 'B1', topic: 'schreiben', exercise: 'goethe-b1-1-set-1' }, { level: 'B1', topic: 'sinav', exercise: 'goethe-b1-lesen-3-set-1' }] }
    ],
    [{ exam: 'goethe', level: 'b1', teil: 2, set: 'set-1' }]
  );
  const track = examTrack({ exam: 'goethe', level: 'b1' }, { sets: SETS, tasks: TASKS });
  const l = nextExamItem(track.lesen, history);
  assert.equal(l.next.id, 'goethe-b1-lesen-1-set-2');
  assert.equal(l.last.item.id, 'goethe-b1-lesen-3-set-1');
  assert.equal(l.last.at.toISOString().slice(0, 10), '2026-11-12');
  const s = nextExamItem(track.schreiben, history);
  assert.equal(s.next.id, 'goethe-b1-1-set-2');
  assert.equal(examItemState(history, 'goethe-b1-2-set-1'), 'solved');
  assert.equal(nextExamItem(track.lesen, history, new Set(['goethe-b1-lesen-1-set-2'])).next.id, 'goethe-b1-lesen-2-set-2');
  assert.equal(nextExamItem(track.lesen, examHistory()).last, null);
});

test('hedef sınav seçenekleri gerçek sınav verisinden: Goethe B1, telc B2, DTZ', async () => {
  globalThis.window = {};
  await import('../js/examsData.js');
  const data = globalThis.window.BA_EXAMS;
  const sets = [];
  const tasks = [];
  for (const exam of data.exams) for (const level of exam.levels || []) for (const section of level.sections || []) {
    section.teile.forEach((teil, i) => (teil.exercises || []).filter((e) => e?.set).forEach((e) => {
      if (section.id === 'schreiben' && teil.kind !== 'form') tasks.push({ exam: exam.id, level: level.id, teil: i + 1, set: e.set });
      else sets.push({ exam: exam.id, level: level.id, section: section.id, teil: i + 1, set: e.set });
    }));
  }
  const labels = examTargets(data, { sets, tasks }).map((t) => t.label);
  for (const l of ['Goethe B1', 'telc B2', 'DTZ']) assert.ok(labels.includes(l), `${l} yok: ${labels.join(', ')}`);
  assert.ok(!labels.some((l) => /ÖSD/.test(l)));
});
