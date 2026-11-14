// Yapay zekâ denemesi: tests/ai-deneme/<ad>.json içindeki örnek metinleri Worker'daki talimatla (PROMPT) gerçek modele
// gönderir ve Worker'ın denetiminden (cleanResult) geçirir. Sonuç: bulunan / kaçan hatalar ve beklenmeyen maddeler.
//   CF_ACCOUNT_ID=<hesap kimliği> CF_API_TOKEN=<Workers AI token> node scripts/ai-deneme.mjs [ad …] [--json dosya]
// Ad verilmezse BÜTÜN sınavların metinleri çalışır. Talimat (worker/schreiben-kontrol.js PROMPT ya da cleanResult) her
// değiştiğinde böyle, hepsi birlikte çalıştırılır: bir sınav için eklenen kural öbür sınavları bozmasın.
// Ağ vekili arkasında (bulut oturumu): NODE_USE_ENV_PROXY=1 ekle.
// Token depoya yazılmaz. Günde 10.000 Neuron ücretsiz; bütün metinlerin bir turu bunun küçük bir kısmını kullanır, ücret çıkmaz.
import fs from 'node:fs';
import { cleanResult, MODEL, PROMPT, TEXT_TYPES, userMessage } from '../worker/schreiben-kontrol.js';

const DIR = 'tests/ai-deneme';
const args = process.argv.slice(2);
const jsonAt = args.indexOf('--json');
const out = jsonAt >= 0 ? args[jsonAt + 1] : null;
const picked = args.filter((a, i) => a !== '--json' && i !== jsonAt + 1);
const names = picked.length ? picked : fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort();
const { CF_ACCOUNT_ID: account, CF_API_TOKEN: token = 'proxy' } = process.env;
if (!account) { console.error('Kullanım: CF_ACCOUNT_ID=… CF_API_TOKEN=… node scripts/ai-deneme.mjs [ad …]'); process.exit(2); }
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
  return typeof r.response === 'string' ? r.response : r.choices?.[0]?.message?.content || JSON.stringify(r.response || '');
}

const overlaps = (a, b) => a.includes(b) || b.includes(a);
// Bulundu: madde hatalı yerle örtüşüyor VE düzeltmesinde beklenen parça (fix; liste ise biri) geçiyor. Sadece örtüşmek
// yetmez (ör. "stört Dich nicht" içindeki "Dich → dich" fiil yeri hatasını bulmuş sayılmaz).
const matches = (x, e) => overlaps(x.original, e.wrong) && [e.fix].flat().some((fix) => x.korrektur.includes(fix));

const report = [];
const total = { found: 0, expected: 0, extra: 0, texts: 0 };
for (const name of names) {
  const trial = JSON.parse(fs.readFileSync(`${DIR}/${name}.json`, 'utf8'));
  const sum = { name, found: 0, expected: 0, extra: 0, texts: trial.texts.length, results: [] };
  console.log(`\n=== ${name} ===`);
  for (const t of trial.texts) {
    const set = JSON.parse(fs.readFileSync(`data/exams/${trial.exam}/${trial.level}/schreiben/teil-${trial.teil}/${t.set}.json`, 'utf8'));
    const task = { name: `${EXAMS[trial.exam]} ${trial.level.toUpperCase()} · Teil ${trial.teil} · ${set.title}`, type: TEXT_TYPES[set.textType] };
    const clean = cleanResult(await ask(task, t.text), t.text) || { errors: [] };
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
for (const s of report) console.log(`${s.name.padEnd(18)} ${String(s.texts).padStart(2)} metin · ${s.found}/${s.expected} hata · beklenmeyen ${s.extra}`);
console.log(`${'TOPLAM'.padEnd(18)} ${String(total.texts).padStart(2)} metin · ${total.found}/${total.expected} hata · beklenmeyen ${total.extra}`);
if (out) fs.writeFileSync(out, JSON.stringify({ model: MODEL, total, report }, null, 2));
