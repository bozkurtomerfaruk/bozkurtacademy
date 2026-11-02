// Seviye testi: saklama süresi (6 ay) dolan sonuçları siler. GitHub Actions'ta her gün çalışır
// (.github/workflows/placement-cleanup.yml); elle: CLEANUP_EMAIL=… CLEANUP_PASSWORD=… node scripts/placement-cleanup.mjs
//
// Servis hesabı anahtarı kullanılmaz. Script, Firebase Authentication'daki ayrı bir e-posta/şifre hesabıyla
// giriş yapar ve firestore.rules'tan geçer. Kurallar bu hesaba sadece expireAt ≤ şimdi olan sonuçları
// listeleme ve silme izni verir (cleanupUid()). Şifre sızarsa en kötü ihtimalle süresi zaten dolmuş sonuçlar silinir.
//
// Kişisel veri GitHub'a gelmez: sorgu sadece belge kimliklerini ister (select __name__), ad ve e-posta indirilmez.
// Günlüğe sadece silinen sayı yazılır. Hata olursa çıkış kodu 1 olur; GitHub başarısız zamanlanmış iş için
// e-posta gönderir. Yönetim sayfasındaki silme yedek olarak duruyor.
// Emülatörde (tests/placement-cleanup.mjs): FIRESTORE_EMULATOR_HOST, FIREBASE_AUTH_EMULATOR_HOST, GCLOUD_PROJECT.
import { firebaseConfig } from '../js/account/config.js';

const email = process.env.CLEANUP_EMAIL;
const password = process.env.CLEANUP_PASSWORD;
if (!email || !password) {
  // Kurulum tamamlanmadan (GitHub Secrets boşken) iş başarısız sayılmasın.
  console.log('CLEANUP_EMAIL / CLEANUP_PASSWORD tanımlı değil; kurulum tamamlanmamış, silme yapılmadı.');
  process.exit(0);
}

const fsEmulator = process.env.FIRESTORE_EMULATOR_HOST;
const authEmulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const project = fsEmulator && process.env.GCLOUD_PROJECT ? process.env.GCLOUD_PROJECT : firebaseConfig.projectId;
const authBase = authEmulator ? `http://${authEmulator}/identitytoolkit.googleapis.com/v1` : 'https://identitytoolkit.googleapis.com/v1';
const fsRoot = `projects/${project}/databases/(default)/documents`;
const fsBase = `${fsEmulator ? `http://${fsEmulator}` : 'https://firestore.googleapis.com'}/v1/${fsRoot}`;
const BATCH = 200;

class StepError extends Error {
  constructor(step, status, code) { super(`${step}: ${status} ${code}`); this.step = step; this.status = status; this.code = code; }
}

async function post(step, url, body, token) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  // Hata mesajları kişisel veri içermez; yine de sadece durum kodu ve hata kodu yazılır.
  if (!response.ok) throw new StepError(step, response.status, data?.error?.message || data?.error?.status || 'error');
  return data;
}

let deleted = 0;
try {
  const login = await post('giriş', `${authBase}/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
    { email, password, returnSecureToken: true });
  const token = login.idToken;
  for (;;) {
    // Bir dakika geride: GitHub'ın saati sunucudan biraz ilerideyse sorgu kuralı yine sağlasın.
    const cutoff = new Date(Date.now() - 60 * 1000).toISOString();
    const rows = await post('sorgu', `${fsBase}:runQuery`, {
      structuredQuery: {
        from: [{ collectionId: 'placementTests' }],
        select: { fields: [{ fieldPath: '__name__' }] },
        where: { fieldFilter: { field: { fieldPath: 'expireAt' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: cutoff } } },
        limit: BATCH
      }
    }, token);
    const names = rows.map((row) => row.document?.name).filter(Boolean);
    if (!names.length) break;
    await post('silme', `${fsBase}:commit`, { writes: names.map((name) => ({ delete: name })) }, token);
    deleted += names.length;
    if (names.length < BATCH) break;
  }
  console.log(`Saklama süresi dolan ${deleted} seviye testi sonucu silindi.`);
} catch (error) {
  console.error(`Silme başarısız (${error.step || 'bağlantı'}: ${error.status || ''} ${error.code || error.name}). Bu çalışmada silinen: ${deleted}.`);
  process.exitCode = 1;
}
