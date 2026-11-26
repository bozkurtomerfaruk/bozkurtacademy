#!/usr/bin/env node
// firestore.rules → Firebase (Cloud Firestore, (default) veritabanı) otomatik yayını (.github/workflows/deploy.yml,
// rehber: docs/otomatik-yayin.md). firebase-tools yerine doğrudan Firebase Rules API: tek gereken rol
// "Firebase Rules Admin" (roles/firebaserules.admin). Erişim belirteci (GOOGLE_ACCESS_TOKEN) GitHub Actions'ta
// Workload Identity Federation ile kısa süreli alınır; anahtar dosyası yok.
//
//   node scripts/deploy-rules.mjs --check    canlı kural sürümünü okur, depodaki dosyayla aynı mı yazar (değiştirmez)
//   node scripts/deploy-rules.mjs --deploy   ruleset oluşturur (Firebase derler; hata varsa canlı kurallar değişmez),
//                                            cloud.firestore sürümünü ona çevirir ve canlıda doğrular
//
// Ortam: GOOGLE_ACCESS_TOKEN, FIREBASE_PROJECT_ID; isteğe bağlı RULES_FILE (varsayılan firestore.rules).

import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://firebaserules.googleapis.com/v1';
export const RELEASE = 'cloud.firestore';

export function client({ token, project, fetchImpl = fetch }) {
  if (!token || !project) throw new Error('GOOGLE_ACCESS_TOKEN ve FIREBASE_PROJECT_ID gerekli.');
  return async function call(method, path, body) {
    const res = await fetchImpl(`${API}/projects/${project}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || '';
      throw new Error(`Firebase Rules ${method} ${path} → HTTP ${res.status}${msg ? `: ${msg}` : ''}`);
    }
    return data;
  };
}

const sourceOf = (ruleset) => (ruleset?.source?.files || []).map((f) => f.content).join('\n');

export async function currentRules(call) {
  const release = await call('GET', `/releases/${RELEASE}`);
  const ruleset = await call('GET', `/rulesets/${release.rulesetName.split('/').pop()}`);
  return { release, source: sourceOf(ruleset) };
}

export async function deployRules(call, source) {
  const before = await currentRules(call);
  if (before.source === source) return { changed: false, previous: before.release.rulesetName, current: before.release.rulesetName };
  const ruleset = await call('POST', '/rulesets', { source: { files: [{ name: 'firestore.rules', content: source }] } });
  if (!ruleset?.name) throw new Error('Firebase ruleset adı döndürmedi; canlı kurallar değişmedi.');
  const project = ruleset.name.split('/')[1];
  await call('PATCH', `/releases/${RELEASE}`, { release: { name: `projects/${project}/releases/${RELEASE}`, rulesetName: ruleset.name } });
  const after = await currentRules(call);
  if (after.release.rulesetName !== ruleset.name) throw new Error(`Doğrulama: canlı sürüm ${after.release.rulesetName}, beklenen ${ruleset.name}`);
  if (after.source !== source) throw new Error('Doğrulama: canlı kural metni depodaki dosyayla aynı değil');
  return { changed: true, previous: before.release.rulesetName, current: ruleset.name };
}

function summary(text) {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

async function main([mode]) {
  const call = client({ token: process.env.GOOGLE_ACCESS_TOKEN, project: process.env.FIREBASE_PROJECT_ID });
  const source = readFileSync(join(ROOT, process.env.RULES_FILE || 'firestore.rules'), 'utf8');
  if (mode === '--check') {
    const { release, source: live } = await currentRules(call);
    const text = `Firestore kuralları: canlı sürüm ${release.rulesetName} (${release.updateTime || '?'}); depodaki dosyayla ${live === source ? 'AYNI' : 'FARKLI (yayınlanınca güncellenir)'}.`;
    console.log(text);
    summary(text);
    return 0;
  }
  if (mode === '--deploy') {
    const result = await deployRules(call, source);
    const text = result.changed
      ? `Firestore kuralları yayınlandı ve canlıda doğrulandı: ${result.current} (önceki: ${result.previous}).`
      : `Firestore kuralları zaten aynı; yeni sürüm oluşturulmadı (${result.current}).`;
    console.log(text);
    summary(text);
    return 0;
  }
  console.error('Kullanım: --check | --deploy');
  return 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (error) => { console.error(error.message); process.exitCode = 1; });
}
