// Seviye sonu sınavları (data/seviye-sonu/<seviye>.json): soru havuzunun denetimi. GitHub'da da çalışır.
//   node scripts/check-level-exams.mjs
// Kurallar: data/catalog.json'da "levelExam" ile bağlı her sınav için
// - dağılımdaki konular o seviyenin konuları; toplam soru 30; geçme yüzdesi 1–100,
// - her konu için havuzda dağılımdaki sayının en az iki katı soru (her denemede farklı sorular gelsin),
// - her soruda tekil kimlik, boşluklu ya da soru biçiminde metin, birbirinden farklı 4 seçenek, seçeneklerden biri olan
//   doğru cevap ve kendi Türkçe açıklaması.
import { readFileSync } from 'node:fs';

const catalog = JSON.parse(readFileSync('data/catalog.json', 'utf8'));
const errors = [];
let exams = 0;
let questions = 0;
for (const level of catalog.levels) {
  if (!level.levelExam) continue;
  exams++;
  const exam = JSON.parse(readFileSync(level.levelExam, 'utf8'));
  const where = level.levelExam;
  if (exam.level !== level.id) errors.push(`${where}: level ${exam.level}, katalogda ${level.id}`);
  if (!(exam.passPercent >= 1 && exam.passPercent <= 100)) errors.push(`${where}: passPercent 1–100 olmalı`);
  const topicIds = new Set(level.topics.map((t) => t.id));
  const total = exam.distribution.reduce((sum, d) => sum + d.count, 0);
  if (total !== 30) errors.push(`${where}: dağılımın toplamı 30 olmalı (${total})`);
  const ids = new Set();
  for (const q of exam.questions) {
    questions++;
    const at = `${where} ${q.id}`;
    if (!/^[a-z0-9-]{3,60}$/.test(q.id || '') || ids.has(q.id)) errors.push(`${at}: kimlik geçersiz ya da tekrar ediyor`);
    ids.add(q.id);
    if (!exam.distribution.some((d) => d.topic === q.topic)) errors.push(`${at}: konu dağılımda yok (${q.topic})`);
    if (typeof q.prompt !== 'string' || q.prompt.trim().length < 5) errors.push(`${at}: soru metni boş`);
    if (!Array.isArray(q.options) || q.options.length !== 4 || new Set(q.options).size !== 4 || q.options.some((o) => typeof o !== 'string' || !o.trim())) errors.push(`${at}: birbirinden farklı 4 seçenek olmalı`);
    if (!q.options?.includes(q.answer)) errors.push(`${at}: doğru cevap seçeneklerde yok`);
    if (typeof q.explanation !== 'string' || q.explanation.trim().length < 20) errors.push(`${at}: açıklama yok ya da çok kısa`);
  }
  for (const d of exam.distribution) {
    if (!topicIds.has(d.topic)) errors.push(`${where}: ${d.topic} ${level.id} konularında yok`);
    if (!(Number.isInteger(d.count) && d.count >= 1)) errors.push(`${where}: ${d.topic} sayısı geçersiz`);
    const pool = exam.questions.filter((q) => q.topic === d.topic).length;
    if (pool < d.count * 2) errors.push(`${where}: ${d.topic} için havuzda ${pool} soru var, en az ${d.count * 2} gerekli`);
  }
}
if (errors.length) {
  console.error(errors.map((e) => 'FAIL: ' + e).join('\n'));
  process.exit(1);
}
console.log(`PASS: ${exams} seviye sonu sınavı, ${questions} soru`);
