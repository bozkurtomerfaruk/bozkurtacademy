// Yapay zekâ denemelerinin kota koruması (scripts/ai-deneme.mjs kullanır; test: tests/ai-deneme-kota.test.mjs).
// Denemeler öğrencilerle aynı Workers AI Free kotasını kullanır: günde 10.000 Neuron, gün UTC 00:00'da başlar.
// Öğretmenin kuralı (2026-11-16, 19 Kasım'da güncellendi): denemeler günde en fazla 4.000 Neuron ve 2 tam tur. Saat sınırı yok:
// deneme gerektiğinde öğretmene sorulur, onay verirse gündüz ana oturumda çalıştırılır (gece görevleri bırakıldı).
export const DAILY_TRIAL_LIMIT = 4000;   // Neuron; denemeler için günlük üst sınır (öğrenciler için 6.000 kalır)
export const FULL_ROUNDS_PER_DAY = 2;
export const NEURONS_PER_TEXT = 35;      // gözlenen 16–34; tahmin bunun ve kayıtlı ortalamanın büyüğüyle yapılır

// log: { 'YYYY-MM-DD' (UTC): { neurons, calls, fullRounds } }; texts: bu çalıştırmadaki metin sayısı; full: tam tur mu;
// Dönüş: { ok, reason } ya da { ok, today, planned }.
export function guard({ log, day, texts, full }) {
  const today = log[day] || { neurons: 0, calls: 0, fullRounds: 0 };
  const perText = Math.max(NEURONS_PER_TEXT, today.calls ? today.neurons / today.calls : 0);
  const planned = Math.ceil(texts * perText);
  if (full && today.fullRounds >= FULL_ROUNDS_PER_DAY) return { ok: false, reason: `Bugün (UTC ${day}) zaten ${today.fullRounds} tam tur çalıştı; günde en fazla ${FULL_ROUNDS_PER_DAY}.` };
  if (today.neurons + planned > DAILY_TRIAL_LIMIT) return { ok: false, reason: `Bugünkü kullanım ${Math.round(today.neurons)} + tahmin ${planned} = ${Math.round(today.neurons + planned)} Neuron; denemeler için günlük sınır ${DAILY_TRIAL_LIMIT}.` };
  return { ok: true, today, planned };
}
