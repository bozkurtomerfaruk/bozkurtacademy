// Otomatik yayın korumaları: scripts/worker-deploy-guard.mjs ve scripts/deploy-rules.mjs (ağ yok, sahte yanıtlar).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  readConfig, checkConfig, stripJsonComments, makeSnapshot, compareBefore, compareAfter, suggestion, health, normalize,
} from '../scripts/worker-deploy-guard.mjs';
import { client, deployRules, currentRules } from '../scripts/deploy-rules.mjs';

const config = readConfig();

const liveSettings = (over = {}) => ({
  compatibility_date: config.compatibility_date,
  compatibility_flags: [],
  observability: config.observability,
  bindings: [
    { type: 'ai', name: 'AI' },
    ...['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID', 'SITE_URL', 'ALLOWED_ORIGINS', 'AI_EMAIL', 'TEACHER_UID', 'MAIL_DAILY_LIMIT'].map((name) => ({ type: 'plain_text', name, text: 'gizli-olmayan' })),
    { type: 'secret_text', name: 'AI_PASSWORD' },
    { type: 'secret_text', name: 'BREVO_API_KEY' },
  ],
  ...over,
});
const sub = { enabled: true, previews_enabled: config.preview_urls };

test('wrangler.jsonc: koruma kuralları', () => {
  assert.deepEqual(checkConfig(config), []);
  assert.equal(config.keep_vars, true);
  assert.equal(config.ai.binding, 'AI');
  assert.equal(config.vars, undefined);
  assert.match(checkConfig({ ...config, keep_vars: false }).join(), /keep_vars/);
  assert.match(checkConfig({ ...config, vars: { A: '1' } }).join(), /vars/);
  assert.match(checkConfig({ ...config, ai: undefined }).join(), /AI/);
  assert.match(checkConfig({ ...config, observability: undefined }).join(), /observability/);
});

test('JSONC yorumları ve sondaki virgüller atılır, metindeki // korunur', () => {
  assert.deepEqual(JSON.parse(stripJsonComments('{ // a\n "u": "https://x", /* b */ "l": [1,],\n}')), { u: 'https://x', l: [1] });
});

test('fotoğraf değer içermez, sadece tür ve ad', () => {
  const snap = makeSnapshot(liveSettings(), sub);
  assert.ok(!JSON.stringify(snap).includes('gizli-olmayan'));
  assert.equal(snap.bindings.length, 10);
  assert.throws(() => makeSnapshot({}, sub), /bağlantı listesi/);
});

test('yayın öncesi: aynı ayarlar → geçer', () => {
  const { problems, warnings } = compareBefore(config, makeSnapshot(liveSettings(), sub));
  assert.deepEqual(problems, []);
  assert.deepEqual(warnings, []);
});

test('yayın öncesi: farklı tarih, log ayarı, bağlantı ya da önizleme → durur ve doğru değeri önerir', () => {
  const snap = makeSnapshot(liveSettings({ compatibility_date: '2025-04-01', observability: { enabled: true, head_sampling_rate: 1, logs: { enabled: true, invocation_logs: true, persist: true, head_sampling_rate: 0.5 } } }), sub);
  const { problems } = compareBefore(config, snap);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /2025-04-01/);
  const s = suggestion(snap);
  assert.match(s, /"compatibility_date": "2025-04-01"/);
  assert.match(s, /"head_sampling_rate": 0.5/);
  const withKv = makeSnapshot(liveSettings({ bindings: [...liveSettings().bindings, { type: 'kv_namespace', name: 'CACHE' }] }), sub);
  assert.match(compareBefore(config, withKv).problems.join(), /kv_namespace:CACHE/);
  assert.match(compareBefore(config, makeSnapshot(liveSettings(), { enabled: true, previews_enabled: !config.preview_urls })).problems.join(), /preview_urls/);
  assert.match(compareBefore(config, makeSnapshot(liveSettings({ observability: null }), sub)).problems.join(), /observability/);
});

test('yayın öncesi: beklenen ad yoksa sadece uyarı', () => {
  const settings = liveSettings();
  settings.bindings = settings.bindings.filter((b) => b.name !== 'MAIL_DAILY_LIMIT');
  const { problems, warnings } = compareBefore(config, makeSnapshot(settings, sub));
  assert.deepEqual(problems, []);
  assert.match(warnings.join(), /MAIL_DAILY_LIMIT/);
});

test('yayın sonrası: eksik secret/değişken ya da log değişikliği → kırmızı', () => {
  const before = makeSnapshot(liveSettings(), sub);
  assert.deepEqual(compareAfter(before, makeSnapshot(liveSettings(), sub)), []);
  const lost = liveSettings();
  lost.bindings = lost.bindings.filter((b) => b.name !== 'BREVO_API_KEY' && b.name !== 'SITE_URL');
  assert.equal(compareAfter(before, makeSnapshot(lost, sub)).length, 2);
  assert.match(compareAfter(before, makeSnapshot(liveSettings({ observability: { enabled: false } }), sub)).join(), /observability/);
  assert.match(compareAfter(before, makeSnapshot(liveSettings(), { enabled: false, previews_enabled: false })).join(), /workers_dev/);
});

test('normalize: boş dizi ve null "yazılmamış" sayılır', () => {
  assert.deepEqual(normalize({ b: [], a: { c: null, d: 1 } }), { a: { d: 1 } });
});

const res = (status, body, headers = {}) => ({ status, ok: status < 400, headers: new Headers(headers), json: async () => body });

test('canlı kontrol: 204 + 401 → geçer; yanlış yanıt → başarısız', async () => {
  const origin = 'https://bozkurtacademy.com';
  const good = async (url, init) => (init.method === 'OPTIONS' ? res(204, null, { 'Access-Control-Allow-Origin': origin }) : res(401, { status: 'unauthorized' }));
  assert.equal((await health({ url: 'https://w', origin, fetchImpl: good, tries: 1 })).ok, true);
  const noOrigin = async () => res(403, null);
  const r = await health({ url: 'https://w', origin, fetchImpl: noOrigin, tries: 2, waitMs: 1 });
  assert.equal(r.ok, false);
  assert.match(r.message, /ALLOWED_ORIGINS/);
  const broken = async (url, init) => (init.method === 'OPTIONS' ? res(204, null, { 'Access-Control-Allow-Origin': origin }) : res(500, { status: 'error' }));
  assert.equal((await health({ url: 'https://w', origin, fetchImpl: broken, tries: 1 })).ok, false);
});

function fakeRules(initialSource) {
  const rulesets = { old: initialSource };
  const state = { release: 'projects/p/rulesets/old', calls: [] };
  const fetchImpl = async (url, init) => {
    const path = url.replace('https://firebaserules.googleapis.com/v1/projects/p', '');
    state.calls.push(`${init.method} ${path}`);
    assert.equal(init.headers.Authorization, 'Bearer t');
    if (init.method === 'GET' && path === '/releases/cloud.firestore') return res(200, { rulesetName: state.release });
    if (init.method === 'GET' && path.startsWith('/rulesets/')) return res(200, { source: { files: [{ content: rulesets[path.split('/').pop()] }] } });
    if (init.method === 'POST' && path === '/rulesets') {
      const body = JSON.parse(init.body);
      if (body.source.files[0].content.includes('HATA')) return res(400, { error: { message: 'Compilation error' } });
      rulesets.new1 = body.source.files[0].content;
      return res(200, { name: 'projects/p/rulesets/new1' });
    }
    if (init.method === 'PATCH' && path === '/releases/cloud.firestore') {
      const body = JSON.parse(init.body);
      assert.equal(body.release.name, 'projects/p/releases/cloud.firestore');
      state.release = body.release.rulesetName;
      return res(200, {});
    }
    return res(404, {});
  };
  return { call: client({ token: 't', project: 'p', fetchImpl }), state };
}

test('kurallar: yeni metin → ruleset + sürüm + doğrulama', async () => {
  const { call, state } = fakeRules('eski');
  const r = await deployRules(call, 'yeni');
  assert.deepEqual(r, { changed: true, previous: 'projects/p/rulesets/old', current: 'projects/p/rulesets/new1' });
  assert.equal((await currentRules(call)).source, 'yeni');
  assert.ok(state.calls.includes('PATCH /releases/cloud.firestore'));
});

test('kurallar: aynı metin → yeni sürüm yok', async () => {
  const { call, state } = fakeRules('ayni');
  assert.equal((await deployRules(call, 'ayni')).changed, false);
  assert.ok(!state.calls.some((c) => c.startsWith('POST') || c.startsWith('PATCH')));
});

test('kurallar: derleme hatası → canlı sürüm değişmez', async () => {
  const { call, state } = fakeRules('eski');
  await assert.rejects(deployRules(call, 'HATA'), /Compilation error/);
  assert.equal(state.release, 'projects/p/rulesets/old');
  assert.ok(!state.calls.some((c) => c.startsWith('PATCH')));
});

test('kurallar: belirteç yoksa hiçbir istek gitmez', () => {
  assert.throws(() => client({ token: '', project: 'p' }), /GOOGLE_ACCESS_TOKEN/);
});
