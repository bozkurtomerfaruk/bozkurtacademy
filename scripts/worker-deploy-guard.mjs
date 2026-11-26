#!/usr/bin/env node
// Worker "schreiben-kontrol" otomatik yayınının korumaları (.github/workflows/deploy.yml, rehber: docs/otomatik-yayin.md).
//
//   node scripts/worker-deploy-guard.mjs --check-config
//       Ağ yok. worker/wrangler.jsonc kurallarını denetler (keep_vars, "AI" bağlantısı, vars/secret yok …). CI'da çalışır.
//   node scripts/worker-deploy-guard.mjs --before <dosya>
//       Canlı Worker ayarlarının "fotoğrafını" çeker ve <dosya>ya yazar (değerler değil, sadece adlar ve ayarlar).
//       Uyumluluk tarihi, bayraklar, log ayarı, önizleme adresleri ya da bağlantılar wrangler.jsonc ile uyuşmazsa
//       YAYIN YAPILMADAN durur (çıkış kodu 1) ve paneldeki değerleri wrangler.jsonc'a yapıştırılacak hâliyle yazar.
//   node scripts/worker-deploy-guard.mjs --after <dosya>
//       Yayından sonra fotoğrafı yeniden çeker; tek bir değişken/secret/bağlantı adı eksikse ya da ayar değiştiyse kırmızı.
//   node scripts/worker-deploy-guard.mjs --health
//       Canlı adrese iki kısa istek (yapay zekâ ve Firestore kullanılmaz): OPTIONS /check → 204 (ALLOWED_ORIGINS yerinde),
//       belirteçsiz POST /check → 401 "unauthorized" (kod çalışıyor).
//
// Ortam: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID (--before/--after), WORKER_URL, SITE_ORIGIN (--health).
// Secret değerleri hiçbir zaman okunmaz ve yazdırılmaz; Cloudflare API'si de onları döndürmez.

import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const CONFIG_PATH = join(ROOT, 'worker', 'wrangler.jsonc');
export const WORKER_NAME = 'schreiben-kontrol';
// Panelde tanımlı olması beklenen adlar (eksikse uyarı; yayın sonrası kontrol zaten "hiçbir ad kaybolmadı" der).
export const EXPECTED_VARS = ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID', 'SITE_URL', 'ALLOWED_ORIGINS', 'AI_EMAIL', 'TEACHER_UID', 'MAIL_DAILY_LIMIT'];
export const EXPECTED_SECRETS = ['AI_PASSWORD', 'BREVO_API_KEY'];
// keep_vars ile korunan türler ve wrangler'ın her zaman koruduğu secret'lar: bunlar wrangler.jsonc'ta yer almaz.
const KEPT_TYPES = new Set(['plain_text', 'json', 'secret_text']);

// ---------- wrangler.jsonc ----------
export function stripJsonComments(text) {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      out += c;
      if (c === '\\') { out += text[++i] ?? ''; continue; }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') { inString = true; out += c; continue; }
    if (c === '/' && text[i + 1] === '/') { while (i < text.length && text[i] !== '\n') i++; out += '\n'; continue; }
    if (c === '/' && text[i + 1] === '*') { i += 2; while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++; i++; continue; }
    out += c;
  }
  return out.replace(/,(\s*[}\]])/g, '$1');
}

export function readConfig(path = CONFIG_PATH) {
  return JSON.parse(stripJsonComments(readFileSync(path, 'utf8')));
}

// wrangler.jsonc'ta tanımlı (yayında gönderilecek) bağlantılar: { type, name }.
export function configBindings(config) {
  const list = [];
  if (config.ai) list.push({ type: 'ai', name: config.ai.binding });
  const map = { kv_namespaces: 'kv_namespace', r2_buckets: 'r2_bucket', d1_databases: 'd1', services: 'service', durable_objects: 'durable_object_namespace', queues: 'queue' };
  for (const [key, type] of Object.entries(map)) {
    const v = key === 'durable_objects' ? config.durable_objects?.bindings : key === 'queues' ? config.queues?.producers : config[key];
    for (const b of v || []) list.push({ type, name: b.binding || b.name });
  }
  return list;
}

export function checkConfig(config) {
  const errors = [];
  if (config.name !== WORKER_NAME) errors.push(`name "${WORKER_NAME}" olmalı (şu an: ${JSON.stringify(config.name)})`);
  if (config.main !== 'schreiben-kontrol.js') errors.push('main "schreiben-kontrol.js" olmalı');
  if (config.keep_vars !== true) errors.push('keep_vars: true olmalı (yoksa paneldeki değişkenler silinir)');
  if (config.ai?.binding !== 'AI') errors.push('ai.binding "AI" olmalı (yapay zekâ bağlantısı)');
  if (config.vars !== undefined) errors.push('"vars" yazılmamalı: değişkenler panelde kalır (keep_vars)');
  for (const key of ['secrets', 'env', 'routes', 'route']) if (config[key] !== undefined) errors.push(`"${key}" yazılmamalı`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(config.compatibility_date || ''))) errors.push('compatibility_date YYYY-AA-GG olmalı');
  if (config.workers_dev !== true) errors.push('workers_dev: true olmalı (site .workers.dev adresini kullanıyor)');
  if (typeof config.preview_urls !== 'boolean') errors.push('preview_urls açıkça true ya da false yazılmalı');
  if (config.observability?.enabled === undefined) errors.push('observability açıkça yazılmalı (log ayarı korunmalı)');
  return errors;
}

// ---------- Karşılaştırma ----------
// null, boş dizi ve boş nesneleri atar; anahtarları sıralar. Böylece "yazılmamış" ile "boş" aynı sayılır.
export function normalize(value) {
  if (Array.isArray(value)) {
    const arr = value.map(normalize).filter((v) => v !== undefined);
    return arr.length ? arr : undefined;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      const v = normalize(value[key]);
      if (v !== undefined) out[key] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value === null ? undefined : value;
}

const same = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
const bindingKey = (b) => `${b.type}:${b.name}`;

// Cloudflare yanıtlarından fotoğraf: sadece adlar ve ayarlar.
export function makeSnapshot(settings, subdomain) {
  if (!settings || !Array.isArray(settings.bindings)) throw new Error('Cloudflare ayar yanıtında bağlantı listesi yok; güvenli tarafta kalıp duruyorum.');
  return {
    bindings: settings.bindings.map((b) => ({ type: b.type, name: b.name })).sort((a, b) => bindingKey(a).localeCompare(bindingKey(b))),
    compatibility_date: settings.compatibility_date ?? null,
    compatibility_flags: settings.compatibility_flags ?? [],
    observability: settings.observability ?? null,
    logpush: settings.logpush ?? null,
    tail_consumers: settings.tail_consumers ?? null,
    placement: settings.placement ?? null,
    usage_model: settings.usage_model ?? null,
    workers_dev: subdomain?.enabled ?? null,
    preview_urls: subdomain?.previews_enabled ?? null,
  };
}

// Yayından ÖNCE: wrangler.jsonc canlıdakiyle aynı mı? Farklıysa wrangler canlı ayarı değiştirirdi → dur.
export function compareBefore(config, snap) {
  const problems = [];
  const warnings = [];
  if (snap.compatibility_date !== config.compatibility_date) problems.push(`compatibility_date: panelde ${snap.compatibility_date}, wrangler.jsonc'ta ${config.compatibility_date}`);
  if (!same(snap.compatibility_flags, config.compatibility_flags || [])) problems.push(`compatibility_flags: panelde ${JSON.stringify(snap.compatibility_flags)}, wrangler.jsonc'ta ${JSON.stringify(config.compatibility_flags || [])}`);
  if (!same(snap.observability, config.observability)) problems.push(`observability (log ayarı): panelde ${JSON.stringify(normalize(snap.observability) ?? null)}, wrangler.jsonc'ta ${JSON.stringify(normalize(config.observability) ?? null)}`);
  if (snap.workers_dev !== null && snap.workers_dev !== config.workers_dev) problems.push(`workers_dev: panelde ${snap.workers_dev}, wrangler.jsonc'ta ${config.workers_dev}`);
  if (snap.preview_urls !== null && snap.preview_urls !== config.preview_urls) problems.push(`preview_urls: panelde ${snap.preview_urls}, wrangler.jsonc'ta ${config.preview_urls}`);
  const live = snap.bindings.filter((b) => !KEPT_TYPES.has(b.type)).map(bindingKey).sort();
  const wanted = configBindings(config).map(bindingKey).sort();
  if (!same(live, wanted)) problems.push(`bağlantılar (bindings): panelde ${JSON.stringify(live)}, wrangler.jsonc'ta ${JSON.stringify(wanted)} (wrangler listede olmayanı siler)`);
  const names = new Set(snap.bindings.filter((b) => KEPT_TYPES.has(b.type)).map((b) => b.name));
  for (const n of [...EXPECTED_VARS, ...EXPECTED_SECRETS]) if (!names.has(n)) warnings.push(`${n} panelde bulunamadı (yayın bunu değiştirmez; panelde kontrol et)`);
  return { problems, warnings };
}

// Yayından SONRA: hiçbir ad kaybolmadı, hiçbir ayar değişmedi.
export function compareAfter(before, after) {
  const problems = [];
  const beforeKeys = new Set(before.bindings.map(bindingKey));
  const afterKeys = new Set(after.bindings.map(bindingKey));
  for (const k of beforeKeys) if (!afterKeys.has(k)) problems.push(`yayından sonra eksik: ${k}`);
  for (const k of afterKeys) if (!beforeKeys.has(k)) problems.push(`yayından sonra yeni: ${k}`);
  for (const key of ['compatibility_date', 'compatibility_flags', 'observability', 'logpush', 'tail_consumers', 'placement', 'usage_model', 'workers_dev', 'preview_urls']) {
    if (!same(before[key], after[key])) problems.push(`${key} değişti: önce ${JSON.stringify(normalize(before[key]) ?? null)}, sonra ${JSON.stringify(normalize(after[key]) ?? null)}`);
  }
  return problems;
}

// Paneldeki değerler, wrangler.jsonc'a yapıştırılacak hâliyle.
export function suggestion(snap) {
  const obj = {
    compatibility_date: snap.compatibility_date,
    ...(snap.compatibility_flags?.length ? { compatibility_flags: snap.compatibility_flags } : {}),
    ...(snap.preview_urls !== null ? { preview_urls: snap.preview_urls } : {}),
    observability: normalize(snap.observability) ?? { enabled: false },
  };
  return JSON.stringify(obj, null, 2).slice(1, -1).trim().replace(/^ {2}/gm, '  ');
}

// ---------- Ağ ----------
async function cf(path, fetchImpl = fetch) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!token || !account) throw new Error('CLOUDFLARE_API_TOKEN ve CLOUDFLARE_ACCOUNT_ID gerekli (GitHub → Environment "production" secrets).');
  const res = await fetchImpl(`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${WORKER_NAME}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    const msg = (body.errors || []).map((e) => `${e.code ?? ''} ${e.message ?? ''}`.trim()).join('; ');
    throw new Error(`Cloudflare ${path} → HTTP ${res.status}${msg ? ` (${msg})` : ''}. Token izni: Account → Workers Scripts → Edit (docs/otomatik-yayin.md).`);
  }
  return body.result;
}

export async function takeSnapshot(fetchImpl = fetch) {
  const settings = await cf('/settings', fetchImpl);
  const subdomain = await cf('/subdomain', fetchImpl);
  return makeSnapshot(settings, subdomain);
}

export async function health({ url, origin, fetchImpl = fetch, tries = 6, waitMs = 5000 } = {}) {
  let last = '';
  for (let i = 0; i < tries; i++) {
    if (i) await new Promise((r) => setTimeout(r, waitMs));
    try {
      const pre = await fetchImpl(`${url}/check`, { method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' } });
      const allow = pre.headers.get('access-control-allow-origin');
      if (pre.status !== 204 || allow !== origin) { last = `OPTIONS /check → ${pre.status}, Allow-Origin ${allow} (beklenen 204 ve ${origin}; ALLOWED_ORIGINS yerinde mi?)`; continue; }
      const post = await fetchImpl(`${url}/check`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ writingId: 'yayinKontrol0001' }) });
      const body = await post.json().catch(() => ({}));
      if (post.status !== 401 || body.status !== 'unauthorized') { last = `POST /check (belirteçsiz) → ${post.status} ${JSON.stringify(body)} (beklenen 401 unauthorized)`; continue; }
      return { ok: true, message: 'OPTIONS /check 204, POST /check 401 unauthorized' };
    } catch (error) {
      last = `istek başarısız: ${error.message}`;
    }
  }
  return { ok: false, message: last };
}

// ---------- Komut satırı ----------
function summary(text) {
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

async function main(argv) {
  const [mode, file] = argv;
  if (mode === '--check-config') {
    const errors = checkConfig(readConfig());
    if (errors.length) { console.error(`worker/wrangler.jsonc:\n - ${errors.join('\n - ')}`); return 1; }
    console.log('worker/wrangler.jsonc PASS');
    return 0;
  }
  if (mode === '--before') {
    if (!file) throw new Error('--before <dosya>');
    const config = readConfig();
    const errors = checkConfig(config);
    if (errors.length) { console.error(errors.join('\n')); return 1; }
    const snap = await takeSnapshot();
    writeFileSync(file, JSON.stringify(snap, null, 2));
    console.log(`Canlı ayarlar: ${snap.bindings.length} bağlantı/değişken/secret adı, uyumluluk ${snap.compatibility_date}, log ${JSON.stringify(normalize(snap.observability) ?? null)}`);
    console.log(`Adlar: ${snap.bindings.map(bindingKey).join(', ')}`);
    const { problems, warnings } = compareBefore(config, snap);
    for (const w of warnings) console.log(`::warning::${w}`);
    if (problems.length) {
      const text = `### Worker yayını yapılmadı: wrangler.jsonc paneldeki ayarlarla uyuşmuyor\n\n${problems.map((p) => `- ${p}`).join('\n')}\n\n`
        + 'Yayın yapılmadı, canlı Worker değişmedi. Paneldeki değerler, `worker/wrangler.jsonc` içine yapıştırılacak hâliyle:\n\n'
        + `\`\`\`jsonc\n${suggestion(snap)}\n\`\`\`\n`;
      console.error(text);
      summary(text);
      return 1;
    }
    console.log('Yayın öncesi kontrol PASS: wrangler.jsonc paneldeki ayarlarla aynı.');
    summary(`Worker yayın öncesi kontrol: PASS (${snap.bindings.length} ad, uyumluluk ${snap.compatibility_date}).`);
    return 0;
  }
  if (mode === '--after') {
    if (!file) throw new Error('--after <dosya>');
    const before = JSON.parse(readFileSync(file, 'utf8'));
    const after = await takeSnapshot();
    const problems = compareAfter(before, after);
    if (problems.length) {
      const text = `### Worker yayından sonra ayar farkı\n\n${problems.map((p) => `- ${p}`).join('\n')}`;
      console.error(text);
      summary(text);
      return 1;
    }
    console.log(`Yayın sonrası ayar kontrolü PASS: ${after.bindings.length} adın hepsi yerinde, ayarlar aynı.`);
    summary(`Worker yayın sonrası ayar kontrolü: PASS (${after.bindings.length} adın hepsi yerinde).`);
    return 0;
  }
  if (mode === '--health') {
    const url = (process.env.WORKER_URL || '').replace(/\/$/, '');
    const origin = process.env.SITE_ORIGIN || '';
    if (!url || !origin) throw new Error('WORKER_URL ve SITE_ORIGIN gerekli');
    const result = await health({ url, origin });
    console[result.ok ? 'log' : 'error'](`Canlı kontrol ${result.ok ? 'PASS' : 'BAŞARISIZ'}: ${result.message}`);
    summary(`Worker canlı kontrol: ${result.ok ? 'PASS' : 'BAŞARISIZ'} (${result.message}).`);
    return result.ok ? 0 : 1;
  }
  console.error('Kullanım: --check-config | --before <dosya> | --after <dosya> | --health');
  return 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; }, (error) => { console.error(error.message); process.exitCode = 1; });
}
