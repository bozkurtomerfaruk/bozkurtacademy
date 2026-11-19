// Yapay zekâ denemesi: tests/ai-deneme/<ad>.json içindeki örnek metinleri Worker'daki talimatla (PROMPT) gerçek modele
// gönderir ve Worker'ın denetiminden (cleanResult) geçirir. Sonuç: bulunan / kaçan hatalar ve beklenmeyen maddeler.
//   CF_ACCOUNT_ID=<hesap kimliği> CF_API_TOKEN=<Workers AI token> node scripts/ai-deneme.mjs [ad …] [--ids id,id] [--json dosya]
// Ad verilmezse BÜTÜN sınavların metinleri çalışır (tam tur). Talimat (worker/schreiben-kontrol.js PROMPT ya da cleanResult)
// her değiştiğinde böyle, hepsi birlikte çalıştırılır: bir sınav için eklenen kural öbür sınavları bozmasın.
// --ids: sadece bu metinler (ör. --ids b1t1-5,telc-3). Ağ vekili arkasında (bulut oturumu): NODE_USE_ENV_PROXY=1 ekle.
// Token depoya yazılmaz.
//
// KOTA KORUMASI (öğretmenin kuralı, 2026-11-16): Denemeler öğrencilerle AYNI ücretsiz kotayı kullanır (Workers AI Free:
// günde 10.000 Neuron, gün UTC 00:00'da başlar). Bu yüzden:
//   - Denemeler bir günde en fazla 4.000 Neuron kullanır: çalışmadan önce o günün kayıtlı kullanımı + bu çalıştırmanın
//     tahmini hesaplanır, 4.000'i aşacaksa betik hiçbir istek göndermeden durur.
//   - Bir günde en fazla 2 tam tur.
//   - Saat sınırı yok; deneme sadece öğretmen onay verince çalıştırılır (19 Kasım kararı; gece görevleri bırakıldı).
// Kullanım, depoya girmeyen .ai-deneme-kullanim.json dosyasına yazılır (Cloudflare'in bildirdiği Neuron). Bu dosya
// sadece bu bilgisayardaki denemeleri bilir; öğrencilerin kullanımı Cloudflare panelindedir (AI → Workers AI).
import fs from 'node:fs';
import { cleanResult, MODEL, PROMPT, TEXT_TYPES, userMessage } from '../worker/schreiben-kontrol.js';
import { DAILY_TRIAL_LIMIT, guard, NEURONS_PER_TEXT } from './ai-deneme-kota.mjs';

const DIR = 'tests/ai-deneme';
const args = process.argv.slice(2);
const valueOf = (flag) => { const at = args.indexOf(flag); return at >= 0 ? args[at + 1] : null; };
const out = valueOf('--json');
const ids = valueOf('--ids') ? new Set(valueOf('--ids').split(',').map((x) => x.trim()).filter(Boolean)) : null;
const picked = args.filter((a, i) => !a.startsWith('--') && !['--json', '--ids'].includes(args[i - 1]));
const names = picked.length ? picked : fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const fullRound = !picked.length && !ids;

const USAGE_FILE = '.ai-deneme-kullanim.json';
const utcDay = () => new Date().toISOString().slice(0, 10);
function readUsage() { try { return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8')); } catch (_) { return {}; } }
function saveUsage(log) { fs.writeFileSync(USAGE_FILE, JSON.stringify(log, null, 2)); }
const { CF_ACCOUNT_ID: account, CF_API_TOKEN: token = 'proxy' } = process.env;
if (!account) { console.error('Kullanım: CF_ACCOUNT_ID=… CF_API_TOKEN=… node scripts/ai-deneme.mjs [ad …]'); process.exit(2); }
const trials = names.map((name) => { const trial = JSON.parse(fs.readFileSync(`${DIR}/${name}.json`, 'utf8')); return { name, trial, texts: trial.texts.filter((t) => !ids || ids.has(t.id)) }; });
const textCount = trials.reduce((n, x) => n + x.texts.length, 0);
if (ids && textCount !== ids.size) { console.error('Bulunamayan metin kimliği var: ' + [...ids].filter((id) => !trials.some((x) => x.texts.some((t) => t.id === id))).join(', ')); process.exit(2); }
const usageLog = readUsage();
const day = utcDay();
const check = guard({ log: usageLog, day, texts: textCount, full: fullRound });
if (!check.ok) { console.error(`DURDU (kota koruması): ${check.reason}`); process.exit(3); }
console.log(`Kota: bugün (UTC ${day}) kayıtlı ${Math.round(check.today.neurons)} Neuron; bu çalıştırma ${textCount} metin, tahmini ${check.planned} Neuron (sınır ${DAILY_TRIAL_LIMIT}).`);
usageLog[day] = { ...check.today };
if (fullRound) usageLog[day].fullRounds += 1;
const record = (neurons) => { usageLog[day].neurons += neurons; usageLog[day].calls += 1; saveUsage(usageLog); };
const EXAMS = { goethe: 'Goethe', telc: 'telc', dtz: 'DTZ' };

async function ask(task, text) {
  // Geçici hatalarda (401, 429, 5xx) birkaç saniye bekleyip en fazla 3 kez daha denenir.
  let response, data;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'system', content: PROMPT }, { role: 'user', content: userMessage(task, text) }], max_tokens: 1500, temperature: 0.2, chat_template_kwargs: { enable_thinking: false } })
      });
      data = await response.json().catch(() => ({}));
    } catch (error) { response = { ok: false, status: 503 }; data = { error: String(error) }; } // bağlantı koptu
    if (response.ok || ![401, 429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
  }
  if (!response.ok) { console.error(response.status, JSON.stringify(data).slice(0, 300)); process.exit(1); }
  const r = data.result || {};
  record(Number(r.usage?.neurons) || NEURONS_PER_TEXT);
  return typeof r.response === 'string' ? r.response : r.choices?.[0]?.message?.content || JSON.stringify(r.response || '');
}

const overlaps = (a, b) => a.includes(b) || b.includes(a);
// Bulundu: madde hatalı yerle örtüşüyor VE düzeltmesinde beklenen parça (fix; liste ise biri) geçiyor. Sadece örtüşmek
// yetmez (ör. "stört Dich nicht" içindeki "Dich → dich" fiil yeri hatasını bulmuş sayılmaz).
const matches = (x, e) => overlaps(x.original, e.wrong) && [e.fix].flat().some((fix) => x.korrektur.includes(fix));

const report = [];
const total = { found: 0, expected: 0, extra: 0, texts: 0 };
for (const { name, trial, texts } of trials) {
  if (!texts.length) continue;
  const sum = { name, found: 0, expected: 0, extra: 0, texts: texts.length, results: [] };
  console.log(`\n=== ${name} ===`);
  for (const t of texts) {
    const set = JSON.parse(fs.readFileSync(`data/exams/${trial.exam}/${trial.level}/schreiben/teil-${trial.teil}/${t.set}.json`, 'utf8'));
    const task = { name: `${EXAMS[trial.exam]} ${trial.level.toUpperCase()} · Teil ${trial.teil} · ${set.title}`, type: TEXT_TYPES[set.textType] };
    const parsed = cleanResult(await ask(task, t.text), t.text);
    // Okunamayan cevap (JSON yok): Worker bunu bir kez daha sorar; burada ayrıca sayılır ki model hatası ile kaçan hata karışmasın.
    if (!parsed) { sum.unreadable = (sum.unreadable || 0) + 1; console.log(`\n${t.id} · OKUNAMAYAN CEVAP (Worker yeniden sorar)`); }
    const clean = parsed || { errors: [] };
    const hit = t.errors.filter((e) => clean.errors.some((x) => matches(x, e)));
    const missed = t.errors.filter((e) => !hit.includes(e)).map((e) => e.wrong);
    // Beklenmeyen madde: beklenen hiçbir hatayı düzeltmeyen madde (yanlış alarm ya da metindeki fark edilmemiş başka bir hata).
    const extra = clean.errors.filter((x) => !t.errors.some((e) => matches(x, e)));
    sum.found += hit.length; sum.expected += t.errors.length; sum.extra += extra.length;
    sum.results.push({ id: t.id, note: t.note, hit: hit.map((e) => e.wrong), missed, extra, items: clean.errors });
    console.log(`\n${t.id} · ${t.note}\n  bulunan ${hit.length}/${t.errors.length}${missed.length ? ` · kaçan: ${missed.join(' | ')}` : ''}`);
    for (const x of clean.errors) console.log(`  ${extra.includes(x) ? '?' : '✓'} ${x.original} → ${x.korrektur}\n      ${x.erklaerung}`);
  }
  report.push(sum);
  for (const k of ['found', 'expected', 'extra', 'texts']) total[k] += sum[k];
}
console.log('\n=== Özet ===');
for (const s of report) console.log(`${s.name.padEnd(18)} ${String(s.texts).padStart(2)} metin · ${s.found}/${s.expected} hata · beklenmeyen ${s.extra}${s.unreadable ? ` · okunamayan ${s.unreadable}` : ''}`);
console.log(`${'TOPLAM'.padEnd(18)} ${String(total.texts).padStart(2)} metin · ${total.found}/${total.expected} hata · beklenmeyen ${total.extra}`);
if (out) fs.writeFileSync(out, JSON.stringify({ model: MODEL, total, report }, null, 2));
console.log(`Kota: bugün (UTC ${day}) toplam ${Math.round(usageLog[day].neurons)} Neuron (${usageLog[day].calls} çağrı, ${usageLog[day].fullRounds} tam tur).`);
