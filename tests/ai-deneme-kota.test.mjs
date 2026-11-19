// scripts/ai-deneme-kota.mjs: yapay zekâ denemelerinin kota koruması. Çalıştırma: node --test tests/ai-deneme-kota.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DAILY_TRIAL_LIMIT, FULL_ROUNDS_PER_DAY, guard, NEURONS_PER_TEXT } from '../scripts/ai-deneme-kota.mjs';

const day = '2026-11-16';
const base = { day, texts: 43, full: true };

test('sınırlar: günde 4.000 Neuron, 2 tam tur', () => {
  assert.equal(DAILY_TRIAL_LIMIT, 4000);
  assert.equal(FULL_ROUNDS_PER_DAY, 2);
});

test('boş günde gece tam tur çalışır; tahmin metin sayısı × Neuron', () => {
  const r = guard({ ...base, log: {} });
  assert.equal(r.ok, true);
  assert.equal(r.planned, 43 * NEURONS_PER_TEXT);
});

test('saat sınırı yok (19 Kasım kararı: deneme öğretmenin onayıyla gündüz)', () => {
  assert.equal(guard({ ...base, log: {} }).ok, true);
  assert.equal(guard.length, 1);
});

test('günde 2 tam turdan sonra üçüncü tam tur durur; tek tek metinler çalışabilir', () => {
  const log = { [day]: { neurons: 2000, calls: 80, fullRounds: 2 } };
  assert.match(guard({ ...base, log }).reason, /2 tam tur/);
  assert.equal(guard({ ...base, log, full: false, texts: 5 }).ok, true);
});

test('4.000 Neuron aşılacaksa istek göndermeden durur', () => {
  const log = { [day]: { neurons: 3600, calls: 120, fullRounds: 1 } };
  assert.equal(guard({ ...base, log, full: false, texts: 10 }).ok, true);   // 3600 + 350 = 3950
  const r = guard({ ...base, log, full: false, texts: 12 });                // 3600 + 420 = 4020
  assert.equal(r.ok, false);
  assert.match(r.reason, /4000/);
});

test('kayıtlı ortalama tahminden yüksekse onunla hesaplar; dünkü kullanım sayılmaz', () => {
  const log = { [day]: { neurons: 500, calls: 10, fullRounds: 0 }, '2026-11-15': { neurons: 15000, calls: 500, fullRounds: 9 } };
  const r = guard({ ...base, log, full: false, texts: 10 });
  assert.equal(r.planned, 500);
  assert.equal(r.ok, true);
});
