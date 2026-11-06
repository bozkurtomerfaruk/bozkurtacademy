// scripts/placement-cleanup.mjs uçtan uca: Auth + Firestore emülatöründe temizlik hesabıyla giriş, süresi dolan
// sonuçların silinmesi, diğerlerinin kalması, yanlış şifrede hata kodu. Çalıştırma: npm run test:cleanup
import { readFileSync } from 'node:fs';
import { execFile, execFileSync } from 'node:child_process';
import http from 'node:http';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, setLogLevel, Timestamp } from 'firebase/firestore';

setLogLevel('silent');
const PROJECT = 'demo-bozkurtacademy';
const AUTH = '127.0.0.1:9099';
const FS = '127.0.0.1:8080';
const DAY = 24 * 60 * 60 * 1000;
const fails = [];
const ok = (cond, label) => { console.log((cond ? 'ok   ' : 'FAIL ') + label); if (!cond) fails.push(label); };

// Temizlik hesabını Auth emülatöründe aç; kurallardaki cleanupUid() yerine onun UID'i.
const email = 'temizlik@example.com';
const password = 'test-sifre-123456';
const res = await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true })
});
const uid = (await res.json()).localId;
const rules = readFileSync('firestore.rules', 'utf8').replace(/(function cleanupUid\(\)\s*{\s*return ')[^']+'/, `$1${uid}'`);
const env = await initializeTestEnvironment({ projectId: PROJECT, firestore: { rules, host: '127.0.0.1', port: 8080 } });

const seed = async (id, expireAt) => env.withSecurityRulesDisabled(async (c) =>
  setDoc(doc(c.firestore(), 'placementTests', id), { name: 'Deniz Kaya', email: 'deniz@example.com', createdAt: Timestamp.now(), expireAt: Timestamp.fromMillis(expireAt) }));
const exists = async (id) => {
  let found;
  await env.withSecurityRulesDisabled(async (c) => { found = (await getDoc(doc(c.firestore(), 'placementTests', id))).exists(); });
  return found;
};

for (let i = 0; i < 205; i++) await seed('ResOld' + String(i).padStart(6, '0'), Date.now() - (1 + i % 5) * DAY);
await seed('ResNew000001', Date.now() + 183 * DAY);
await seed('ResSoon00001', Date.now() + 60 * 60 * 1000);

const run = (extra) => {
  try {
    return { code: 0, out: execFileSync('node', ['scripts/placement-cleanup.mjs'], { env: { ...process.env, FIREBASE_AUTH_EMULATOR_HOST: AUTH, FIRESTORE_EMULATOR_HOST: FS, GCLOUD_PROJECT: PROJECT, ...extra }, encoding: 'utf8', stdio: 'pipe' }) };
  } catch (e) { return { code: e.status, out: String(e.stdout) + String(e.stderr) }; }
};

let r = run({ CLEANUP_EMAIL: email, CLEANUP_PASSWORD: password });
ok(r.code === 0 && r.out.includes('205 seviye testi sonucu silindi'), `205 eski sonuç silindi (200'lük gruplar): ${r.out.trim()}`);
ok(!(await exists('ResOld000000')) && !(await exists('ResOld000204')), 'eski sonuçlar yok');
ok(await exists('ResNew000001') && await exists('ResSoon00001'), 'süresi dolmamış sonuçlar duruyor (1 saat sonra dolacak olan dahil)');
ok(!/deniz/i.test(r.out), 'günlükte kişisel veri yok');

r = run({ CLEANUP_EMAIL: email, CLEANUP_PASSWORD: password });
ok(r.code === 0 && r.out.includes(' 0 seviye testi'), 'ikinci çalışma: silinecek sonuç yok');

// Sorgunun cevabında sadece belge kimliği olmalı (ad, e-posta GitHub'a gelmez).
await seed('ResOldProbe1', Date.now() - DAY);
const login = await (await fetch(`http://${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true })
})).json();
const probe = await (await fetch(`http://${FS}/v1/projects/${PROJECT}/databases/(default)/documents:runQuery`, {
  method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${login.idToken}` },
  body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'placementTests' }], select: { fields: [{ fieldPath: '__name__' }] },
    where: { fieldFilter: { field: { fieldPath: 'expireAt' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: new Date(Date.now() - 60000).toISOString() } } } } })
})).json();
ok(probe.length === 1 && probe[0].document?.name.endsWith('/ResOldProbe1') && !JSON.stringify(probe).includes('deniz'), 'sorgu cevabında sadece belge kimliği var, ad/e-posta yok');

r = run({ CLEANUP_EMAIL: email, CLEANUP_PASSWORD: 'yanlis-sifre' });
ok(r.code === 1 && r.out.includes('Silme başarısız (giriş: 400'), `yanlış şifre: çıkış kodu 1 (${r.out.trim()})`);

// Referer: API anahtarının web sitesi kısıtlaması için her REST isteği https://bozkurtacademy.com/ yönlendirenini taşır.
// Emülatörün önüne başlıkları kaydeden küçük bir aracı konur (betik ayrı süreçte, eşzamansız çalışır).
{
  const seen = [];
  const relay = (target) => http.createServer(async (req, res) => {
    seen.push({ url: req.url, referer: req.headers.referer });
    const chunks = []; for await (const c of req) chunks.push(c);
    const upstream = await fetch(`http://${target}${req.url}`, { method: req.method, headers: { 'content-type': req.headers['content-type'] || 'application/json', ...(req.headers.authorization ? { authorization: req.headers.authorization } : {}) }, body: chunks.length ? Buffer.concat(chunks) : undefined });
    res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'application/json' });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  });
  const [authRelay, fsRelay] = [relay(AUTH), relay(FS)];
  await Promise.all([authRelay, fsRelay].map((s) => new Promise((resolve) => s.listen(0, '127.0.0.1', resolve))));
  await seed('ResOldRef001', Date.now() - DAY);
  const out = await new Promise((resolve) => execFile('node', ['scripts/placement-cleanup.mjs'], {
    env: { ...process.env, FIREBASE_AUTH_EMULATOR_HOST: `127.0.0.1:${authRelay.address().port}`, FIRESTORE_EMULATOR_HOST: `127.0.0.1:${fsRelay.address().port}`, GCLOUD_PROJECT: PROJECT, CLEANUP_EMAIL: email, CLEANUP_PASSWORD: password }
  }, (error, stdout, stderr) => resolve({ code: error ? error.code : 0, out: stdout + stderr })));
  authRelay.close(); fsRelay.close();
  ok(out.code === 0 && !(await exists('ResOldRef001')), `aracı üzerinden emülatörde silme çalıştı (${out.out.trim()})`);
  ok(seen.length >= 3 && seen.every((x) => x.referer === 'https://bozkurtacademy.com/'), `bütün REST istekleri Referer: https://bozkurtacademy.com/ taşıyor (${seen.length} istek)`);
}

r = run({ CLEANUP_EMAIL: '', CLEANUP_PASSWORD: '' });
ok(r.code === 0 && r.out.includes('kurulum tamamlanmamış'), 'secrets boşken iş başarısız sayılmıyor');

await env.cleanup();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nALL PASSED');
process.exit(fails.length ? 1 : 0);
