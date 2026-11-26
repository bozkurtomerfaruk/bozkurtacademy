// Ödev kartlarındaki öğrenci adları ve içerik özeti (js/account/assignment-summary.js). node --test tests/odev-kart.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { assignmentSummary, examItemLabel, studentNamesText } from '../js/account/assignment-summary.js';

test('öğrenci adları: tek, iki, üç, çok', () => {
  assert.equal(studentNamesText(['Deniz Kaya']), 'Deniz Kaya');
  assert.equal(studentNamesText(['Arda Can', 'Deniz Kaya']), 'Arda Can ve Deniz Kaya');
  assert.equal(studentNamesText(['Arda Can', 'Deniz Kaya', 'Ece Bekler']), 'Arda Can, Deniz Kaya ve Ece Bekler');
  assert.equal(studentNamesText(['A', 'B', 'C', 'D', 'E']), 'A, B ve 3 kişi daha');
  assert.equal(studentNamesText([]), '');
});

test('sınav görevi adları', () => {
  assert.equal(examItemLabel('sinav', 'goethe-b1-lesen-2-set-3'), 'Goethe B1 Lesen Teil 2 Set 3');
  assert.equal(examItemLabel('sinav', 'dtz-a2-b1-lesen-4-set-1'), 'DTZ Lesen Teil 4 Set 1');
  assert.equal(examItemLabel('sinav', 'testdaf-digital-lesen-1-set-2'), 'TestDaF digital Lesen Teil 1 Set 2');
  assert.equal(examItemLabel('schreiben', 'goethe-b1-1-set-2'), 'Goethe B1 Schreiben Teil 1 Set 2');
  assert.equal(examItemLabel('schreiben', 'dtz-a2-b1-1-set-1'), 'DTZ Schreiben Teil 1 Set 1');
});

test('içerik özeti: örnekteki gibi', () => {
  const title = (level, topic) => ({ 'B1/lassen-infinitiv': 'lassen + Infinitiv', 'A1/perfekt': "Perfekt'e giriş" })[`${level}/${topic}`];
  const a = {
    topics: [],
    exercises: [
      { level: 'B1', topic: 'lassen-infinitiv', exercise: 'a-1' }, { level: 'B1', topic: 'lassen-infinitiv', exercise: 'b-2' },
      { level: 'B1', topic: 'lassen-infinitiv', exercise: 'c-3' }, { level: 'B1', topic: 'sinav', exercise: 'goethe-b1-lesen-2-set-3' }
    ],
    links: [{ url: 'https://drive.google.com/file/d/x/view', kind: 'pdf' }]
  };
  assert.equal(assignmentSummary(a, title), 'lassen + Infinitiv · 3 paket · Goethe B1 Lesen Teil 2 Set 3 · 1 PDF');
  assert.equal(assignmentSummary({ topics: [{ level: 'A1', topic: 'perfekt' }], exercises: [], links: [] }, title), "Perfekt'e giriş · konunun tamamı");
  assert.equal(assignmentSummary({ topics: [], exercises: [{ level: 'A1', topic: 'seviye-sonu', exercise: 'a1' }], links: [{ kind: 'youtube' }, { kind: 'youtube' }, { kind: 'web' }] }),
    'A1 seviye sonu sınavı · 2 video · 1 bağlantı');
  assert.equal(assignmentSummary({ topics: [], exercises: [], links: [], description: 'Kitap s. 12' }), 'yalnızca açıklama');
  const many = { topics: [], links: [], exercises: ['a', 'b', 'c'].map((t, i) => ({ level: 'A1', topic: t, exercise: `x-${i}` }))
    .concat(['goethe-b1-lesen-1-set-1', 'goethe-b1-lesen-2-set-1', 'goethe-b1-lesen-3-set-1'].map((x) => ({ level: 'B1', topic: 'sinav', exercise: x }))) };
  assert.equal(assignmentSummary(many), 'a, b +1 konu · 3 paket · Goethe B1 Lesen Teil 1 Set 1, Goethe B1 Lesen Teil 2 Set 1 +1 sınav görevi');
});
