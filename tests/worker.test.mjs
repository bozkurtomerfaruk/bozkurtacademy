// worker/schreiben-kontrol.js birim testleri (Firebase ve Workers AI taklit edilir). Çalıştırma: node --test tests/worker.test.mjs
import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { aiAllowed, berlinDay, cleanResult, decode, encode, PROMPT, resetBotToken } from '../worker/schreiben-kontrol.js';

const TEXT = 'Liebe Lena,\nseit drei Wochen ich wohne in Hamburg. Ich bin umgezogen, weil ich habe eine Stelle gefunden.\nLiebe Grüße\nAyşe';
const DAY = berlinDay();
let docs, commits, aiCalls, aiAnswer, fetchLog;
const env = { FIREBASE_API_KEY: 'key', FIREBASE_PROJECT_ID: 'demo', ALLOWED_ORIGINS: 'https://bozkurtacademy.com', SITE_URL: 'https://bozkurtacademy.com',
  AI_EMAIL: 'yapay-zeka@example.com', AI_PASSWORD: 'sifre',
  AI: { run: async (model, input) => { aiCalls.push({ model, input }); if (aiAnswer instanceof Error) throw aiAnswer; return { response: aiAnswer }; } } };
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, encode(v)]));

beforeEach(() => {
  resetBotToken();
  commits = []; aiCalls = []; fetchLog = [];
  aiAnswer = JSON.stringify({ fehler: [
    { original: 'seit drei Wochen ich wohne', korrektur: 'seit drei Wochen wohne ich', erklaerung: 'Ana cümlede çekimli fiil 2. sıradadır.' },
    { original: 'weil ich habe eine Stelle gefunden', korrektur: 'weil ich eine Stelle gefunden habe', erklaerung: 'Yan cümlede çekimli fiil sondadır.' },
    { original: 'metinde olmayan kısım', korrektur: 'x', erklaerung: 'uydurma' }
  ], korrigierter_text: 'Liebe Lena, …' });
  docs = {
    'settings/ai': { mode: 'draft' },
    'users/ayse1234567': { status: 'active', minor: false, name: 'Ayşe Yılmaz', email: 'ayse@example.com' },
    'users/ayse1234567/writings/w123456789012': { exam: 'goethe', level: 'b1', teil: 1, set: 'set-1', text: TEXT, words: 20 }
  };
  globalThis.fetch = async (url, init = {}) => {
    url = String(url); fetchLog.push({ url, body: init.body });
    if (url.includes('accounts:lookup')) return Response.json(JSON.parse(init.body).idToken === 'ogrenci-token' ? { users: [{ localId: 'ayse1234567' }] } : {}, { status: JSON.parse(init.body).idToken === 'ogrenci-token' ? 200 : 400 });
    if (url.includes('accounts:signInWithPassword')) return Response.json({ idToken: 'bot-token', expiresIn: '3600' });
    if (url.includes('/data/exams/')) return Response.json({ title: 'Neue Wohnung' });
    if (url.endsWith(':commit')) { commits.push(JSON.parse(init.body)); return Response.json({}); }
    const m = url.match(/documents\/(.+)$/);
    if (m) { const d = docs[m[1]]; return d ? Response.json({ fields: fields(d), updateTime: '2026-11-08T10:00:00Z' }) : new Response('', { status: 404 }); }
    return new Response('', { status: 500 });
  };
});
const call = (body = { writingId: 'w123456789012' }, { token = 'ogrenci-token', origin = 'https://bozkurtacademy.com', method = 'POST' } = {}) =>
  worker.fetch(new Request('https://ai.example.workers.dev/check', { method, headers: { Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: method === 'POST' ? JSON.stringify(body) : undefined }), env);

describe('Schreiben Worker', () => {
  test('taslak modunda taslak yazar; metinde olmayan madde atılır', async () => {
    const r = await call();
    assert.equal(r.status, 200);
    assert.equal((await r.json()).status, 'draft');
    assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://bozkurtacademy.com');
    const writes = commits[0].writes;
    const draft = writes.find((w) => w.update.name.endsWith('aiDrafts/ayse1234567_w123456789012'));
    assert.ok(draft && draft.currentDocument.exists === false);
    const errors = decode(draft.update.fields.errors);
    assert.equal(errors.length, 2);
    assert.ok(errors.every((e) => TEXT.includes(e.original)));
    assert.equal(decode(writes[0].update.fields.count), 1);
    assert.equal(decode(writes[0].update.fields.day), DAY);
  });

  test('modele sadece talimat, görev adı ve metin gider; ad, e-posta, uid gitmez', async () => {
    await call();
    assert.equal(aiCalls.length, 1);
    const sent = JSON.stringify(aiCalls[0].input);
    assert.ok(sent.includes('Goethe B1 · Teil 1 · Neue Wohnung') && sent.includes('seit drei Wochen ich wohne'));
    for (const secret of ['Ayşe Yılmaz', 'ayse@example.com', 'ayse1234567', 'w123456789012']) assert.ok(!sent.includes(secret), secret);
    assert.equal(aiCalls[0].input.chat_template_kwargs.enable_thinking, false);
    assert.equal(aiCalls[0].input.messages[0].content, PROMPT);
  });

  test('anında göster modunda metne aiFeedback yazar', async () => {
    docs['settings/ai'] = { mode: 'instant' };
    assert.equal((await (await call()).json()).status, 'instant');
    const w = commits[0].writes.find((x) => x.update.name.endsWith('writings/w123456789012'));
    assert.deepEqual(w.updateMask.fieldPaths, ['aiFeedback']);
    assert.equal(w.updateTransforms[0].fieldPath, 'aiAt');
  });

  test('mod kapalıysa ya da ayar yoksa model çağrılmaz', async () => {
    docs['settings/ai'] = { mode: 'off' };
    assert.equal((await (await call()).json()).status, 'off');
    delete docs['settings/ai'];
    assert.equal((await (await call()).json()).status, 'off');
    assert.equal(aiCalls.length, 0);
  });

  test('16 yaş altı: veli onayı ve yapay zekâ onayı olmadan model çağrılmaz', async () => {
    docs['users/ayse1234567'] = { status: 'active', minor: true, parentConsent: { given: true } };
    assert.equal((await (await call()).json()).status, 'not-allowed');
    docs['users/ayse1234567'].aiConsent = { given: true };
    assert.equal((await (await call()).json()).status, 'draft');
    assert.equal(aiCalls.length, 1);
  });

  test('onaysız hesap ve geçersiz belirteç reddedilir', async () => {
    docs['users/ayse1234567'] = { status: 'pending', minor: false };
    assert.equal((await (await call()).json()).status, 'not-allowed');
    assert.equal((await call(undefined, { token: 'sahte' })).status, 401);
    assert.equal(aiCalls.length, 0);
  });

  test('günlük sınırlar: öğrenci 3, site 600; dünkü sayaç sayılmaz', async () => {
    docs['aiLimits/ayse1234567'] = { day: DAY, count: 3 };
    assert.equal((await (await call()).json()).status, 'limit');
    docs['aiLimits/ayse1234567'] = { day: '2000-01-01', count: 3 };
    docs['aiLimits/_global'] = { day: DAY, count: 600 };
    assert.equal((await (await call()).json()).status, 'limit');
    docs['aiLimits/_global'] = { day: DAY, count: 12 };
    assert.equal((await (await call()).json()).status, 'draft');
    const [mine, all] = commits[0].writes;
    assert.equal(decode(mine.update.fields.count), 1);
    assert.equal(decode(all.update.fields.count), 13);
    assert.equal(mine.currentDocument.updateTime, '2026-11-08T10:00:00Z');
    assert.equal(aiCalls.length, 1);
  });

  test('izinsiz kaynak, yanlış kimlik ve GET reddedilir; OPTIONS izinli kaynağa açık', async () => {
    assert.equal((await call(undefined, { origin: 'https://kotu.example' })).status, 403);
    assert.equal((await call({ writingId: '../users' })).status, 400);
    assert.equal((await call(undefined, { method: 'GET' })).status, 404);
    const pre = await worker.fetch(new Request('https://ai.example.workers.dev/check', { method: 'OPTIONS', headers: { Origin: 'https://bozkurtacademy.com' } }), env);
    assert.equal(pre.status, 204);
    assert.equal(aiCalls.length, 0);
  });

  test('model hatası (ör. ücretsiz kota doldu): taslak yok, 503', async () => {
    aiAnswer = new Error('Capacity exceeded');
    const r = await call();
    assert.equal(r.status, 503);
    assert.equal(commits.length, 0);
  });

  test('daha önce kontrol edilmiş metin tekrar gönderilmez', async () => {
    docs['users/ayse1234567/writings/w123456789012'].aiAt = '2026-11-08T09:00:00Z';
    assert.equal((await (await call()).json()).status, 'exists');
    assert.equal(aiCalls.length, 0);
  });

  test('cleanResult: bozuk JSON, tekrar eden ve aynı kalan maddeler', () => {
    assert.equal(cleanResult('JSON yok', TEXT), null);
    const r = cleanResult('```json\n' + JSON.stringify({ fehler: [
      { original: 'ich wohne', korrektur: 'ich wohne', erklaerung: 'aynı' },
      { original: 'ich wohne', korrektur: 'wohne ich', erklaerung: 'Ana cümle.' },
      { original: 'ich wohne', korrektur: 'wohne ich', erklaerung: 'tekrar' }
    ], korrigierter_text: 'x' }) + '\n```', TEXT);
    assert.equal(r.errors.length, 1);
  });

  test('aiAllowed', () => {
    assert.equal(aiAllowed({ status: 'active', minor: false }), true);
    assert.equal(aiAllowed({ status: 'active', minor: false, aiConsent: { given: false } }), false);
    assert.equal(aiAllowed({ status: 'active', minor: true, parentConsent: { given: true } }), false);
    assert.equal(aiAllowed({ status: 'active', minor: true, parentConsent: { given: true }, aiConsent: { given: true } }), true);
    assert.equal(aiAllowed({ status: 'inactive', minor: false }), false);
  });
});
