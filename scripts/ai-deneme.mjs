// Yapay zekâ denemesi: tests/ai-deneme/<ad>.json içindeki örnek metinleri Worker'daki talimatla (PROMPT) gerçek modele
// gönderir ve Worker'ın denetiminden (cleanResult) geçirir. Sonuç: bulunan / kaçan hatalar ve yanlış alarmlar.
//   CF_ACCOUNT_ID=<hesap kimliği> CF_API_TOKEN=<Workers AI token> node scripts/ai-deneme.mjs dtz [--json dosya]
// Ağ vekili arkasında (bulut oturumu): NODE_USE_ENV_PROXY=1 ekle.
// Token depoya yazılmaz. Günde 10.000 Neuron ücretsiz; bir deneme (8 metin) bunun küçük bir kısmını kullanır, ücret çıkmaz.
import fs from 'node:fs';
import { cleanResult, MODEL, PROMPT, TEXT_TYPES, userMessage } from '../worker/schreiben-kontrol.js';

const name = process.argv[2];
const out = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const { CF_ACCOUNT_ID: account, CF_API_TOKEN: token = 'proxy' } = process.env;
if (!name || !account) { console.error('Kullanım: CF_ACCOUNT_ID=… CF_API_TOKEN=… node scripts/ai-deneme.mjs <ad>'); process.exit(2); }
const trial = JSON.parse(fs.readFileSync(`tests/ai-deneme/${name}.json`, 'utf8'));
const EXAMS = { goethe: 'Goethe', telc: 'telc', dtz: 'DTZ' };

const results = [];
let found = 0, expected = 0, alarms = 0;
for (const t of trial.texts) {
  const set = JSON.parse(fs.readFileSync(`data/exams/${trial.exam}/${trial.level}/schreiben/teil-${trial.teil}/${t.set}.json`, 'utf8'));
  const task = { name: `${EXAMS[trial.exam]} ${trial.level.toUpperCase()} · Teil ${trial.teil} · ${set.title}`, type: TEXT_TYPES[set.textType] };
  // Geçici hatalarda (401, 429, 5xx) birkaç saniye bekleyip en fazla 3 kez daha denenir.
  let response, data;
  for (let attempt = 0; attempt < 4; attempt++) {
    response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'system', content: PROMPT }, { role: 'user', content: userMessage(task, t.text) }], max_tokens: 1500, temperature: 0.2, chat_template_kwargs: { enable_thinking: false } })
    });
    data = await response.json().catch(() => ({}));
    if (response.ok || ![401, 429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
  }
  if (!response.ok) { console.error(t.id, response.status, JSON.stringify(data).slice(0, 300)); process.exit(1); }
  const r = data.result || {};
  const raw = typeof r.response === 'string' ? r.response : r.choices?.[0]?.message?.content || JSON.stringify(r.response || '');
  const clean = cleanResult(raw, t.text) || { errors: [] };
  const overlaps = (a, b) => a.includes(b) || b.includes(a);
  // Bulundu: madde hatalı yerle örtüşüyor VE düzeltmesinde beklenen parça (fix) geçiyor. Sadece örtüşmek yetmez
  // (ör. "stört Dich nicht" içindeki "Dich → dich" fiil yeri hatasını bulmuş sayılmaz).
  const matches = (x, e) => overlaps(x.original, e.wrong) && x.korrektur.includes(e.fix);
  const hit = t.errors.filter((e) => clean.errors.some((x) => matches(x, e)));
  const missed = t.errors.filter((e) => !hit.includes(e)).map((e) => e.wrong);
  // Beklenmeyen madde: beklenen hiçbir hatayı düzeltmeyen madde (yanlış alarm ya da metindeki fark edilmemiş başka bir hata).
  const extra = clean.errors.filter((x) => !t.errors.some((e) => matches(x, e)));
  found += hit.length; expected += t.errors.length; alarms += extra.length;
  results.push({ id: t.id, note: t.note, hit: hit.map((e) => e.wrong), missed, extra, items: clean.errors });
  console.log(`\n${t.id} · ${t.note}\n  bulunan ${hit.length}/${t.errors.length}${missed.length ? ` · kaçan: ${missed.join(' | ')}` : ''}`);
  for (const x of clean.errors) console.log(`  ${extra.includes(x) ? '?' : '✓'} ${x.original} → ${x.korrektur}\n      ${x.erklaerung}`);
}
console.log(`\nToplam: ${found}/${expected} hata bulundu; beklenmeyen madde: ${alarms}`);
if (out) fs.writeFileSync(out, JSON.stringify({ model: MODEL, found, expected, alarms, results }, null, 2));
