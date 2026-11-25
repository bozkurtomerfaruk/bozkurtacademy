// Ödev asistanı mantığı (js/account/homework-assistant.js), gerçek katalog ve arama diziniyle. Çalıştırma:
// node --test tests/odev-asistani.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
