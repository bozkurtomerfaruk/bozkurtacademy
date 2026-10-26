// Firestore güvenlik kuralı testleri. Çalıştırma: npm test (Firebase Emulator gerekir, Java ile).
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  writeBatch
} from 'firebase/firestore';

const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
// Öğretmen UID'i kurallardaki sabit değerden okunur; kurallar değişince testler de onu kullanır.
const TEACHER = rules.match(/function teacherUid\(\)\s*{\s*return '([^']+)'/)[1];
const YEAR = new Date().getUTCFullYear();

let env;
// Beklenen reddetmeler konsolu doldurmasın.
setLogLevel('silent');

const passwordToken = (email) => ({ email, firebase: { sign_in_provider: 'password' } });
const googleToken = (email) => ({ email, firebase: { sign_in_provider: 'google.com' } });

function as(uid, token) {
  return env.authenticatedContext(uid, token).firestore();
}
const teacherDb = () => as(TEACHER, googleToken('ogretmen@example.com'));
const guestDb = () => env.unauthenticatedContext().firestore();

function adultProfile(overrides = {}) {
  return {
    name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    birthYear: YEAR - 20,
    minor: false,
    provider: 'password',
    status: 'pending',
    createdAt: serverTimestamp(),
    ...overrides
  };
}

function minorProfile(overrides = {}) {
  return {
    name: 'Can Demir',
    email: 'can@example.com',
    birthYear: YEAR - 14,
    minor: true,
    provider: 'password',
    status: 'pending',
    parent: { name: 'Elif Demir', email: 'elif@example.com' },
    createdAt: serverTimestamp(),
    ...overrides
  };
}

function result(overrides = {}) {
  return {
    level: 'A1',
    topic: 'artikel',
    exercise: 'kontext-1',
    score: 8,
    total: 10,
    at: serverTimestamp(),
    ...overrides
  };
}

// Kuralları atlayarak hazır veri yazar.
async function seed(path, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

const seededAdult = (status = 'active') => ({
  name: 'Ayşe Yılmaz', email: 'ayse@example.com', birthYear: YEAR - 20, minor: false,
  provider: 'password', status, createdAt: Timestamp.now()
});
const seededMinor = (status, consent) => ({
  name: 'Can Demir', email: 'can@example.com', birthYear: YEAR - 14, minor: true,
  provider: 'password', status, createdAt: Timestamp.now(),
  parent: { name: 'Elif Demir', email: 'elif@example.com' },
  ...(consent === undefined ? {} : { parentConsent: consent })
});
const consentGiven = { given: true, at: Timestamp.now(), method: 'form', recordedAt: Timestamp.now() };

const ayse = () => as('ayse', passwordToken('ayse@example.com'));
const can = () => as('can', passwordToken('can@example.com'));

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bozkurtacademy',
    firestore: { rules }
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

describe('Kayıt (users/{uid} oluşturma)', () => {
  test('16 yaş ve üstü öğrenci e-posta ile kayıt olabilir', async () => {
    await assertSucceeds(setDoc(doc(ayse(), 'users/ayse'), adultProfile()));
  });

  test('16 yaş ve üstü öğrenci Google ile kayıt olabilir', async () => {
    const db = as('ayse', googleToken('ayse@example.com'));
    await assertSucceeds(setDoc(doc(db, 'users/ayse'), adultProfile({ provider: 'google.com' })));
  });

  test('başka birinin UID’siyle profil oluşturulamaz', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/baskasi'), adultProfile()));
  });

  test('giriş yapmamış kullanıcı profil oluşturamaz', async () => {
    await assertFails(setDoc(doc(guestDb(), 'users/ayse'), adultProfile()));
  });

  test('öğrenci kendini aktif olarak kaydedemez', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ status: 'active' })));
  });

  test('öğrenci kayıtta veli onayı alanı yazamaz', async () => {
    await assertFails(setDoc(doc(can(), 'users/can'), minorProfile({ parentConsent: { given: true } })));
  });

  test('öğrenci izin verilmeyen alan ekleyemez (ör. rol)', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ role: 'teacher' })));
  });

  test('e-posta giriş hesabındakinden farklı olamaz', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ email: 'baska@example.com' })));
  });

  test('kayıt zamanı sunucu saati olmak zorunda', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ createdAt: Timestamp.fromDate(new Date(2020, 0, 1)) })));
  });

  test('geçersiz doğum yılı reddedilir', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ birthYear: YEAR - 2 })));
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ birthYear: YEAR - 120 })));
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ birthYear: '2000' })));
  });

  test('silinmiş hesap yeniden profil oluşturamaz', async () => {
    await seed('deleted/ayse', { at: Timestamp.now() });
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile()));
  });
});

describe('16 yaş altı kayıt', () => {
  test('16 yaş altı öğrenci veli bilgisiyle e-posta/şifre ile kayıt olabilir', async () => {
    await assertSucceeds(setDoc(doc(can(), 'users/can'), minorProfile()));
  });

  test('bu yıl 16 yaşına giren öğrenci de veli onayı ister', async () => {
    await assertFails(setDoc(doc(can(), 'users/can'), adultProfile({ email: 'can@example.com', birthYear: YEAR - 16 })));
    await assertSucceeds(setDoc(doc(can(), 'users/can'), minorProfile({ birthYear: YEAR - 16 })));
  });

  test('bu yıl 17 yaşına giren öğrenci 16 yaş altı sayılmaz', async () => {
    await assertFails(setDoc(doc(can(), 'users/can'), minorProfile({ birthYear: YEAR - 17 })));
    await assertSucceeds(setDoc(doc(can(), 'users/can'), adultProfile({ email: 'can@example.com', birthYear: YEAR - 17 })));
  });

  test('16 yaş altı öğrenci kendini 16 yaş üstü diye kaydedemez', async () => {
    await assertFails(setDoc(doc(can(), 'users/can'), adultProfile({ email: 'can@example.com', birthYear: YEAR - 14, minor: false })));
  });

  test('16 yaş altında veli bilgisi zorunlu', async () => {
    const withoutParent = minorProfile();
    delete withoutParent.parent;
    await assertFails(setDoc(doc(can(), 'users/can'), withoutParent));
    await assertFails(setDoc(doc(can(), 'users/can'), minorProfile({ parent: { name: 'Elif Demir' } })));
    await assertFails(setDoc(doc(can(), 'users/can'), minorProfile({ parent: { name: 'Elif Demir', email: 'gecersiz' } })));
  });

  test('veli e-postası öğrencinin e-postasıyla aynı olamaz', async () => {
    await assertFails(setDoc(doc(can(), 'users/can'), minorProfile({ parent: { name: 'Elif Demir', email: 'CAN@example.com' } })));
  });

  test('16 yaş altı öğrenci Google ile kayıt olamaz', async () => {
    const db = as('can', googleToken('can@example.com'));
    await assertFails(setDoc(doc(db, 'users/can'), minorProfile({ provider: 'google.com' })));
    await assertFails(setDoc(doc(db, 'users/can'), minorProfile()));
  });

  test('16 yaş ve üstü öğrenci veli bilgisi gönderemez', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ parent: { name: 'X Y', email: 'x@example.com' } })));
  });
});

describe('Profil okuma ve değiştirme', () => {
  test('öğrenci onay beklerken kendi profilini okuyabilir', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await assertSucceeds(getDoc(doc(ayse(), 'users/ayse')));
  });

  test('öğrenci başka öğrencinin profilini okuyamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/can', seededMinor('active', consentGiven));
    await assertFails(getDoc(doc(ayse(), 'users/can')));
  });

  test('öğrenci öğrenci listesini okuyamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(getDocs(collection(ayse(), 'users')));
  });

  test('giriş yapmamış kullanıcı hiçbir profili okuyamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(getDoc(doc(guestDb(), 'users/ayse')));
  });

  test('öğrenci kendi durumunu, doğum yılını veya adını değiştiremez', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse'), { status: 'active' }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse'), { birthYear: YEAR - 30 }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse'), { name: 'Yeni Ad' }));
  });

  test('16 yaş altı öğrenci veli onayını kendisi işaretleyemez', async () => {
    await seed('users/can', seededMinor('active'));
    await assertFails(updateDoc(doc(can(), 'users/can'), { parentConsent: consentGiven }));
    await assertFails(updateDoc(doc(can(), 'users/can'), { minor: false }));
  });

  test('öğrenci kendi profilini silemez', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(deleteDoc(doc(ayse(), 'users/ayse')));
  });
});

describe('E-posta doğrulama bilgisi', () => {
  const verified = (uid, email) => as(uid, { email, email_verified: true, firebase: { sign_in_provider: 'password' } });

  test('e-postası doğrulanmış öğrenci kendi profiline emailVerified: true yazabilir', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await assertSucceeds(updateDoc(doc(verified('ayse', 'ayse@example.com'), 'users/ayse'), { emailVerified: true }));
  });

  test('e-postası doğrulanmamış öğrenci emailVerified yazamaz', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse'), { emailVerified: true }));
  });

  test('emailVerified ile birlikte başka alan değiştirilemez', async () => {
    await seed('users/ayse', seededAdult('pending'));
    const db = verified('ayse', 'ayse@example.com');
    await assertFails(updateDoc(doc(db, 'users/ayse'), { emailVerified: true, status: 'active' }));
    await assertFails(updateDoc(doc(db, 'users/ayse'), { emailVerified: false }));
    await assertFails(updateDoc(doc(db, 'users/ayse'), { emailVerified: 'evet' }));
  });

  test('başka öğrencinin emailVerified alanı yazılamaz', async () => {
    await seed('users/can', seededMinor('pending'));
    await assertFails(updateDoc(doc(verified('ayse', 'ayse@example.com'), 'users/can'), { emailVerified: true }));
  });

  test('kayıtta emailVerified sadece doğrulanmış giriş bilgisiyle yazılabilir', async () => {
    await assertFails(setDoc(doc(ayse(), 'users/ayse'), adultProfile({ emailVerified: true })));
    const google = as('mert', { email: 'mert@example.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } });
    await assertSucceeds(setDoc(doc(google, 'users/mert'), adultProfile({ email: 'mert@example.com', provider: 'google.com', emailVerified: true })));
  });
});

describe('Alıştırma sonuçları', () => {
  test('onaylı öğrenci sonuç ekleyebilir ve kendi sonuçlarını okuyabilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertSucceeds(addDoc(collection(ayse(), 'users/ayse/results'), result()));
    await assertSucceeds(getDocs(collection(ayse(), 'users/ayse/results')));
  });

  test('onay bekleyen öğrenci sonuç ekleyemez ve okuyamaz', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await seed('users/ayse/results/r1', { ...result(), at: Timestamp.now() });
    await assertFails(addDoc(collection(ayse(), 'users/ayse/results'), result()));
    await assertFails(getDocs(collection(ayse(), 'users/ayse/results')));
  });

  test('pasif öğrenci sonuç ekleyemez ve okuyamaz', async () => {
    await seed('users/ayse', seededAdult('inactive'));
    await seed('users/ayse/results/r1', { ...result(), at: Timestamp.now() });
    await assertFails(addDoc(collection(ayse(), 'users/ayse/results'), result()));
    await assertFails(getDocs(collection(ayse(), 'users/ayse/results')));
  });

  test('profili olmayan kullanıcı sonuç ekleyemez', async () => {
    await assertFails(addDoc(collection(ayse(), 'users/ayse/results'), result()));
  });

  test('sonuç düzenlenemez ve silinemez', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/ayse/results/r1', { ...result(), at: Timestamp.now() });
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/results/r1'), { score: 10 }));
    await assertFails(setDoc(doc(ayse(), 'users/ayse/results/r1'), result({ score: 10 })));
    await assertFails(deleteDoc(doc(ayse(), 'users/ayse/results/r1')));
  });

  test('geçersiz skor reddedilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    const results = collection(ayse(), 'users/ayse/results');
    await assertFails(addDoc(results, result({ score: 11, total: 10 })));
    await assertFails(addDoc(results, result({ score: -1 })));
    await assertFails(addDoc(results, result({ score: 7.5 })));
    await assertFails(addDoc(results, result({ total: 0, score: 0 })));
    await assertFails(addDoc(results, result({ level: 'Z9' })));
    await assertFails(addDoc(results, result({ topic: '<script>' })));
    await assertFails(addDoc(results, result({ at: Timestamp.fromDate(new Date(2020, 0, 1)) })));
    await assertFails(addDoc(results, result({ extra: true })));
  });

  test('öğrenci başka öğrenciye sonuç ekleyemez ve sonuçlarını okuyamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/can', seededMinor('active', consentGiven));
    await seed('users/can/results/r1', { ...result(), at: Timestamp.now() });
    await assertFails(addDoc(collection(ayse(), 'users/can/results'), result()));
    await assertFails(getDocs(collection(ayse(), 'users/can/results')));
    await assertFails(getDoc(doc(ayse(), 'users/can/results/r1')));
  });
});

describe('16 yaş altı: öğretmen onayı VE veli onayı', () => {
  async function canReadAndWrite() {
    await seed('users/can/results/r1', { ...result(), at: Timestamp.now() });
    await seed('users/can/resources/k1', { title: 'Kaynak', url: 'https://example.com', note: '' });
    return {
      add: () => addDoc(collection(can(), 'users/can/results'), result()),
      readResults: () => getDocs(collection(can(), 'users/can/results')),
      readResources: () => getDocs(collection(can(), 'users/can/resources')),
      readAssignments: () => getDocs(collection(can(), 'users/can/assignments')),
      readLessons: () => getDocs(collection(can(), 'users/can/lessons'))
    };
  }

  test('öğretmen onayladı ama veli onayı yok: hiçbir şey okunamaz, sonuç eklenemez', async () => {
    await seed('users/can', seededMinor('active'));
    const ops = await canReadAndWrite();
    await assertFails(ops.add());
    await assertFails(ops.readResults());
    await assertFails(ops.readResources());
    await assertFails(ops.readAssignments());
    await assertFails(ops.readLessons());
  });

  test('veli onayı işaretlenmiş ama "given" false ise hesap kapalı', async () => {
    await seed('users/can', seededMinor('active', { given: false }));
    const ops = await canReadAndWrite();
    await assertFails(ops.add());
    await assertFails(ops.readResults());
  });

  test('veli onayı var ama öğretmen onayı yok: hiçbir şey okunamaz', async () => {
    await seed('users/can', seededMinor('pending', consentGiven));
    const ops = await canReadAndWrite();
    await assertFails(ops.add());
    await assertFails(ops.readResults());
    await assertFails(ops.readResources());
  });

  test('iki onay da varsa öğrenci okuyabilir ve sonuç ekleyebilir', async () => {
    await seed('users/can', seededMinor('active', consentGiven));
    const ops = await canReadAndWrite();
    await assertSucceeds(ops.add());
    await assertSucceeds(ops.readResults());
    await assertSucceeds(ops.readResources());
    await assertSucceeds(ops.readAssignments());
    await assertSucceeds(ops.readLessons());
  });

  test('onay bekleyen 16 yaş altı öğrenci kendi profilini okuyabilir (durum ekranı için)', async () => {
    await seed('users/can', seededMinor('pending'));
    await assertSucceeds(getDoc(doc(can(), 'users/can')));
  });
});

describe('Ödevler ve kaynaklar', () => {
  const assignment = () => ({
    title: 'Artikel tekrarı', description: 'Alıştırmaları çöz.', dueAt: Timestamp.now(),
    exercises: [{ level: 'A1', topic: 'artikel', exercise: 'kontext-1' }],
    docUrl: 'https://docs.google.com/document/d/abc/copy', copyPerStudent: true, groupId: 'g1',
    createdAt: Timestamp.now(), done: false, doneAt: null, studentDocUrl: ''
  });
  const ref = (db, uid = 'ayse') => doc(db, `users/${uid}/assignments/a1`);

  async function setup(status = 'active'){
    await seed('users/ayse', seededAdult(status));
    await seed('users/ayse/assignments/a1', assignment());
  }

  test('öğrenci ödevi tamamladı olarak işaretleyebilir ve geri alabilir', async () => {
    await setup();
    await assertSucceeds(updateDoc(ref(ayse()), { done: true, doneAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref(ayse()), { done: false, doneAt: null }));
  });

  test('öğrenci kendi Google Docs linkini ekleyebilir ve silebilir', async () => {
    await setup();
    await assertSucceeds(updateDoc(ref(ayse()), { studentDocUrl: 'https://docs.google.com/document/d/xyz/edit' }));
    await assertSucceeds(updateDoc(ref(ayse()), { studentDocUrl: 'https://drive.google.com/file/d/xyz/view' }));
    await assertSucceeds(updateDoc(ref(ayse()), { studentDocUrl: '' }));
  });

  test('Google dışı ya da https olmayan link reddedilir', async () => {
    await setup();
    await assertFails(updateDoc(ref(ayse()), { studentDocUrl: 'https://example.com/doc' }));
    await assertFails(updateDoc(ref(ayse()), { studentDocUrl: 'http://docs.google.com/document/d/x' }));
    await assertFails(updateDoc(ref(ayse()), { studentDocUrl: 'javascript:alert(1)' }));
    await assertFails(updateDoc(ref(ayse()), { studentDocUrl: 'https://docs.google.com.evil.com/x' }));
  });

  test('tamamlama zamanı uydurulamaz', async () => {
    await setup();
    await assertFails(updateDoc(ref(ayse()), { done: true, doneAt: Timestamp.fromDate(new Date(2020, 0, 1)) }));
    await assertFails(updateDoc(ref(ayse()), { done: true }));
    await assertFails(updateDoc(ref(ayse()), { done: false, doneAt: serverTimestamp() }));
    await assertFails(updateDoc(ref(ayse()), { done: 'evet', doneAt: serverTimestamp() }));
  });

  test('öğrenci ödevin başlığını, tarihini veya alıştırmalarını değiştiremez', async () => {
    await setup();
    await assertFails(updateDoc(ref(ayse()), { title: 'Kolay ödev' }));
    await assertFails(updateDoc(ref(ayse()), { dueAt: Timestamp.fromDate(new Date(2030, 0, 1)) }));
    await assertFails(updateDoc(ref(ayse()), { exercises: [] }));
    await assertFails(updateDoc(ref(ayse()), { done: true, doneAt: serverTimestamp(), title: 'x' }));
  });

  test('öğrenci ödev oluşturamaz ve silemez', async () => {
    await setup();
    await assertFails(setDoc(doc(ayse(), 'users/ayse/assignments/a2'), assignment()));
    await assertFails(deleteDoc(ref(ayse())));
  });

  test('onaysız ya da pasif öğrenci ödevini okuyamaz ve işaretleyemez', async () => {
    for(const status of ['pending', 'inactive']){
      await env.clearFirestore();
      await setup(status);
      await assertFails(getDoc(ref(ayse())));
      await assertFails(updateDoc(ref(ayse()), { done: true, doneAt: serverTimestamp() }));
    }
  });

  test('veli onayı eksik 16 yaş altı öğrenci ödevini işaretleyemez', async () => {
    await seed('users/can', seededMinor('active'));
    await seed('users/can/assignments/a1', assignment());
    await assertFails(updateDoc(ref(can(), 'can'), { done: true, doneAt: serverTimestamp() }));
  });

  test('öğrenci başka öğrencinin ödevini okuyamaz ve işaretleyemez', async () => {
    await setup();
    await seed('users/can', seededMinor('active', consentGiven));
    await seed('users/can/assignments/a1', assignment());
    await assertFails(getDoc(ref(ayse(), 'can')));
    await assertFails(updateDoc(ref(ayse(), 'can'), { done: true, doneAt: serverTimestamp() }));
  });

  test('öğrenci kaynakları okuyabilir ama yazamaz', async () => {
    await setup();
    await seed('users/ayse/resources/k1', { title: 'Video', url: 'https://youtube.com/x', note: '', createdAt: Timestamp.now() });
    await assertSucceeds(getDocs(collection(ayse(), 'users/ayse/resources')));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/resources/k1'), { title: 'x' }));
    await assertFails(deleteDoc(doc(ayse(), 'users/ayse/resources/k1')));
  });

  test('öğretmen ödev ve kaynak oluşturup silebilir, bütün ödevleri tek sorguyla okuyabilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    const db = teacherDb();
    await assertSucceeds(setDoc(doc(db, 'users/ayse/assignments/a1'), assignment()));
    await assertSucceeds(setDoc(doc(db, 'users/ayse/resources/k1'), { title: 'PDF', url: 'https://example.com/a.pdf', note: '', createdAt: serverTimestamp() }));
    await assertSucceeds(getDocs(collectionGroup(db, 'assignments')));
    await assertFails(getDocs(collectionGroup(ayse(), 'assignments')));
    await assertSucceeds(deleteDoc(doc(db, 'users/ayse/assignments/a1')));
  });
});

describe('Dersler', () => {
  const lesson = () => ({ startAt: Timestamp.now(), durationMin: 50, note: '', status: 'scheduled', meetUrl: 'https://meet.google.com/x', calendarSync: 'ok', studentName: 'Ayşe Yılmaz' });

  test('onaylı öğrenci kendi derslerini okuyabilir ama değiştiremez ve silemez', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/ayse/lessons/l1', lesson());
    await assertSucceeds(getDocs(collection(ayse(), 'users/ayse/lessons')));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/lessons/l1'), { status: 'cancelled' }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/lessons/l1'), { meetUrl: 'https://evil.example' }));
    await assertFails(deleteDoc(doc(ayse(), 'users/ayse/lessons/l1')));
  });

  test('öğrenci başka öğrencinin derslerini okuyamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/can', seededMinor('active', consentGiven));
    await seed('users/can/lessons/l1', lesson());
    await assertFails(getDocs(collection(ayse(), 'users/can/lessons')));
    await assertFails(getDoc(doc(ayse(), 'users/can/lessons/l1')));
  });

  test('öğrenci veli davet ayarını değiştiremez, öğretmen değiştirebilir', async () => {
    await seed('users/can', seededMinor('active', consentGiven));
    await assertFails(updateDoc(doc(can(), 'users/can'), { inviteParent: false }));
    await assertSucceeds(updateDoc(doc(teacherDb(), 'users/can'), { inviteParent: false }));
  });

  test('öğretmen ders oluşturabilir, güncelleyebilir ve silebilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    const db = teacherDb();
    await assertSucceeds(setDoc(doc(db, 'users/ayse/lessons/l1'), lesson()));
    await assertSucceeds(updateDoc(doc(db, 'users/ayse/lessons/l1'), { status: 'cancelled' }));
    await assertSucceeds(deleteDoc(doc(db, 'users/ayse/lessons/l1')));
  });
});

describe('Öğretmen', () => {
  test('öğretmen bütün öğrencileri listeleyebilir ve sonuçları okuyabilir', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await seed('users/ayse/results/r1', { ...result(), at: Timestamp.now() });
    await assertSucceeds(getDocs(collection(teacherDb(), 'users')));
    await assertSucceeds(getDocs(collection(teacherDb(), 'users/ayse/results')));
  });

  test('öğretmen onaylayabilir, veli onayını işaretleyebilir, pasif yapabilir', async () => {
    await seed('users/can', seededMinor('pending'));
    const ref = doc(teacherDb(), 'users/can');
    await assertSucceeds(updateDoc(ref, { status: 'active', approvedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(ref, { parentConsent: { ...consentGiven, recordedAt: serverTimestamp() } }));
    await assertSucceeds(updateDoc(ref, { status: 'inactive' }));
  });

  test('öğretmen bütün verileri silebilir ve silme işareti yazabilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/ayse/results/r1', { ...result(), at: Timestamp.now() });
    const db = teacherDb();
    await assertSucceeds(setDoc(doc(db, 'deleted/ayse'), { at: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(db, 'users/ayse/results/r1')));
    await assertSucceeds(deleteDoc(doc(db, 'users/ayse')));
  });

  test('öğrenci silme işaretlerini okuyamaz ve yazamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(getDoc(doc(ayse(), 'deleted/ayse')));
    await assertFails(setDoc(doc(ayse(), 'deleted/can'), { at: serverTimestamp() }));
  });

  test('öğrenci ödev, kaynak ve ders yazamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(setDoc(doc(ayse(), 'users/ayse/assignments/a1'), { title: 'x' }));
    await assertFails(setDoc(doc(ayse(), 'users/ayse/resources/k1'), { title: 'x' }));
    await assertFails(setDoc(doc(ayse(), 'users/ayse/lessons/l1'), { note: 'x' }));
  });

  test('öğretmen bütün öğrencilerin derslerini tek sorguyla okuyabilir, öğrenci okuyamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/ayse/lessons/l1', { startAt: Timestamp.now(), status: 'scheduled' });
    await seed('users/can/lessons/l2', { startAt: Timestamp.now(), status: 'scheduled' });
    await assertSucceeds(getDocs(collectionGroup(teacherDb(), 'lessons')));
    await assertFails(getDocs(collectionGroup(ayse(), 'lessons')));
  });

  test('öğretmen UID’ine benzeyen başka bir kullanıcı öğretmen sayılmaz', async () => {
    await seed('users/ayse', seededAdult('pending'));
    const fake = as(TEACHER + 'x', googleToken('ogretmen@example.com'));
    await assertFails(getDocs(collection(fake, 'users')));
    await assertFails(updateDoc(doc(fake, 'users/ayse'), { status: 'active' }));
  });
});

// Seviye testi: herkes (anonim giriş dahil) sadece ekleyebilir; okuma/güncelleme/silme sadece öğretmen.
describe('Seviye testi (placementTests)', () => {
  const DAY = 24 * 60 * 60 * 1000;
  const anonToken = { firebase: { sign_in_provider: 'anonymous' } };
  const anon = (uid = 'anon1') => as(uid, anonToken);

  function placement(uid, overrides = {}) {
    return {
      uid,
      name: 'Deniz Kaya',
      email: 'deniz@example.com',
      goal: 'exam',
      examName: 'Goethe B1',
      examDate: '2027-03-15',
      experience: '6to12m',
      note: '',
      level: 'A2',
      near: 'B1',
      skipped: false,
      blocks: { A1: { correct: 9, total: 10 }, A2: { correct: 7, total: 10 }, B1: { correct: 5, total: 10 } },
      topicErrors: 'perfekt:1,relativsaetze:1,lesen:2',
      wrong: 'a2-perfekt\thaben\nb1-relativ\tdie',
      writing: 'Ich heiße Deniz und lerne Deutsch.',
      durationSec: 840,
      bank: 1,
      lang: 'tr',
      consent: true,
      read: false,
      createdAt: serverTimestamp(),
      expireAt: Timestamp.fromMillis(Date.now() + 183 * DAY),
      ...overrides
    };
  }

  // Uygulamanın yaptığı gibi: sonuç ve bekleme belgesi aynı batch içinde.
  function submit(db, uid, data, { id = 'Res' + Math.random().toString(36).slice(2, 12), limit } = {}) {
    const batch = writeBatch(db);
    batch.set(doc(db, `placementTests/${id}`), data);
    batch.set(doc(db, `placementLimits/${uid}`), limit || { lastAt: serverTimestamp(), lastId: id });
    return batch.commit();
  }

  test('anonim ziyaretçi sonuç ekleyebilir', async () => {
    await assertSucceeds(submit(anon(), 'anon1', placement('anon1')));
  });

  test('giriş yapmış öğrenci de kendi kimliğiyle sonuç ekleyebilir', async () => {
    await assertSucceeds(submit(ayse(), 'ayse', placement('ayse')));
  });

  test('giriş yapmamış biri sonuç ekleyemez', async () => {
    await assertFails(submit(guestDb(), 'x', placement('x')));
  });

  test('bekleme belgesi olmadan sonuç eklenemez', async () => {
    await assertFails(setDoc(doc(anon(), 'placementTests/ResAbcdefghij'), placement('anon1')));
  });

  test('bekleme belgesi başka bir sonucu gösteriyorsa eklenemez (aynı batch ile iki sonuç yok)', async () => {
    const db = anon();
    const batch = writeBatch(db);
    batch.set(doc(db, 'placementTests/ResFirst00001'), placement('anon1'));
    batch.set(doc(db, 'placementTests/ResSecond0001'), placement('anon1'));
    batch.set(doc(db, 'placementLimits/anon1'), { lastAt: serverTimestamp(), lastId: 'ResFirst00001' });
    await assertFails(batch.commit());
  });

  test('10 dakika dolmadan ikinci sonuç eklenemez, sonra eklenebilir', async () => {
    await assertSucceeds(submit(anon(), 'anon1', placement('anon1')));
    await assertFails(submit(anon(), 'anon1', placement('anon1')));
    await seed('placementLimits/anon1', { lastAt: Timestamp.fromMillis(Date.now() - 11 * 60 * 1000), lastId: 'ResOld000001' });
    await assertSucceeds(submit(anon(), 'anon1', placement('anon1')));
  });

  test('bekleme belgesi tek başına sıfırlanamaz veya silinemez', async () => {
    await assertSucceeds(submit(anon(), 'anon1', placement('anon1')));
    await assertFails(setDoc(doc(anon(), 'placementLimits/anon1'), { lastAt: serverTimestamp(), lastId: 'ResNew000001' }));
    await assertFails(deleteDoc(doc(anon(), 'placementLimits/anon1')));
    await assertFails(getDoc(doc(anon(), 'placementLimits/anon1')));
  });

  test('başkasının kimliğiyle (uid alanı) sonuç eklenemez', async () => {
    await assertFails(submit(anon(), 'anon1', placement('anon2')));
    await assertFails(submit(anon(), 'anon2', placement('anon1')));
  });

  test('ziyaretçi sonuçları okuyamaz, listeleyemez, değiştiremez, silemez', async () => {
    await seed('placementTests/ResSeed00001', { ...placement('anon1'), createdAt: Timestamp.now() });
    await assertFails(getDoc(doc(anon(), 'placementTests/ResSeed00001')));
    await assertFails(getDocs(collection(anon(), 'placementTests')));
    await assertFails(getDocs(collection(guestDb(), 'placementTests')));
    await assertFails(getDocs(collection(ayse(), 'placementTests')));
    await assertFails(updateDoc(doc(anon(), 'placementTests/ResSeed00001'), { read: true }));
    await assertFails(deleteDoc(doc(anon(), 'placementTests/ResSeed00001')));
  });

  test('öğretmen okuyabilir, okundu/not ekleyebilir ve silebilir', async () => {
    await seed('placementTests/ResSeed00001', { ...placement('anon1'), createdAt: Timestamp.now() });
    const db = teacherDb();
    await assertSucceeds(getDocs(collection(db, 'placementTests')));
    await assertSucceeds(updateDoc(doc(db, 'placementTests/ResSeed00001'), { read: true, adminNote: 'Perfekt tekrar.' }));
    await assertSucceeds(deleteDoc(doc(db, 'placementTests/ResSeed00001')));
  });

  test('öğretmene benzeyen UID ile okunamaz', async () => {
    await seed('placementTests/ResSeed00001', { ...placement('anon1'), createdAt: Timestamp.now() });
    await assertFails(getDocs(collection(as(TEACHER + 'x', anonToken), 'placementTests')));
  });

  test('yeni kayıt okunmuş veya yönetici notuyla eklenemez', async () => {
    await assertFails(submit(anon(), 'anon1', placement('anon1', { read: true })));
    await assertFails(submit(anon(), 'anon1', placement('anon1', { adminNote: 'x' })));
  });

  test('onay kutusu işaretlenmeden eklenemez', async () => {
    await assertFails(submit(anon(), 'anon1', placement('anon1', { consent: false })));
  });

  test('sunucu saati dışında bir tarih yazılamaz', async () => {
    await assertFails(submit(anon(), 'anon1', placement('anon1', { createdAt: Timestamp.fromMillis(Date.now() - DAY) })));
  });

  test('expireAt yaklaşık 6 ay (183 gün ± 1 gün) olmalı', async () => {
    await assertFails(submit(anon(), 'anon1', placement('anon1', { expireAt: Timestamp.fromMillis(Date.now() + 365 * DAY) })));
    await assertFails(submit(anon(), 'anon2', placement('anon2', { expireAt: Timestamp.fromMillis(Date.now() + 30 * DAY) })));
    await assertFails(submit(anon(), 'anon3', placement('anon3', { expireAt: '2027-05-01' })));
    const noExpire = placement('anon4'); delete noExpire.expireAt;
    await assertFails(submit(anon('anon4'), 'anon4', noExpire));
    await assertSucceeds(submit(anon('anon5'), 'anon5', placement('anon5', { expireAt: Timestamp.fromMillis(Date.now() + 182.5 * DAY) })));
  });

  test('fazladan veya eksik alan kabul edilmez', async () => {
    await assertFails(submit(anon(), 'anon1', placement('anon1', { phone: '0170' })));
    const missing = placement('anon1'); delete missing.writing;
    await assertFails(submit(anon(), 'anon1', missing));
  });

  test('boyut ve biçim sınırları', async () => {
    const cases = {
      name: 'x'.repeat(81), email: 'kein-email', goal: 'tourism', examName: 'x'.repeat(81), examDate: '15.03.2027',
      experience: '10y', note: 'x'.repeat(1001), level: 'C2', near: 'X1', skipped: 'no', writing: 'x'.repeat(3001),
      durationSec: 99999, bank: 0, lang: 'fr', topicErrors: 'Artikel=2', wrong: 'a1-artikel ' + 'x'.repeat(10),
      blocks: { A1: { correct: 11, total: 10 } }
    };
    let i = 0;
    for (const [field, value] of Object.entries(cases)) {
      const uid = 'anon' + (i++);
      await assertFails(submit(anon(uid), uid, placement(uid, { [field]: value })), field);
    }
    await assertFails(submit(anon('big'), 'big', placement('big', { wrong: ('a1-artikel\t' + 'x'.repeat(190) + '\n').repeat(45) })));
    await assertFails(submit(anon('blk'), 'blk', placement('blk', { blocks: { C2: { correct: 1, total: 2 } } })));
  });

  test('sınav bilgisi ve not boş olabilir, "Hiç Almanca bilmiyorum" kaydı geçerli', async () => {
    await assertSucceeds(submit(anon(), 'anon1', placement('anon1', {
      goal: 'daily', examName: '', examDate: '', experience: 'none', level: 'A0', near: '', skipped: true,
      blocks: {}, topicErrors: '', wrong: '', writing: ''
    })));
  });
});
