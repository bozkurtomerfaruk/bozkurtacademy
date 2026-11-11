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
  limit,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  Timestamp,
  updateDoc,
  where,
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

  test('sınav seti sonucu (konu "sinav"): seviye sınavın kimliği; diğer konularda A1–C2 kalır', async () => {
    await seed('users/ayse', seededAdult('active'));
    const results = collection(ayse(), 'users/ayse/results');
    await assertSucceeds(addDoc(results, result({ topic: 'sinav', level: 'a1', exercise: 'goethe-a1-lesen-1-set-2', score: 4, total: 5 })));
    await assertSucceeds(addDoc(results, result({ topic: 'sinav', level: 'a2-b1', exercise: 'dtz-a2-b1-lesen-3-set-1', score: 3, total: 6 })));
    await assertSucceeds(addDoc(results, result({ topic: 'sinav', level: 'papier', exercise: 'testdaf-papier-lesen-2-set-4', score: 7, total: 10 })));
    await assertFails(addDoc(results, result({ topic: 'sinav', level: 'A1', exercise: 'goethe-a1-lesen-1-set-2' })));
    await assertFails(addDoc(results, result({ topic: 'sinav', level: 'a1<b>', exercise: 'goethe-a1-lesen-1-set-2' })));
    await assertFails(addDoc(results, result({ topic: 'sinav', level: 'a1', exercise: 'goethe-a1-lesen-1-set-2', topicErrors: 'lesen:1' })));
    await assertFails(addDoc(results, result({ topic: 'artikel', level: 'a1' })));
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

  test('seviye sonu sınavı: konu bazında hatalar kaydedilebilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    const results = collection(ayse(), 'users/ayse/results');
    const exam = (overrides = {}) => result({ level: 'A1', topic: 'seviye-sonu', exercise: 'a1', score: 22, total: 30, ...overrides });
    await assertSucceeds(addDoc(results, exam({ topicErrors: 'perfekt:2,akkusativ:1,trennbare-verben:1' })));
    await assertSucceeds(addDoc(results, exam({ topicErrors: '', score: 30 })));
    await assertSucceeds(addDoc(results, exam()));
  });

  test('seviye sonu sınavı: konu hataları biçim ve boyut dışına çıkamaz, başka alıştırmada olamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    const results = collection(ayse(), 'users/ayse/results');
    const exam = (topicErrors, overrides = {}) => result({ level: 'A1', topic: 'seviye-sonu', exercise: 'a1', score: 22, total: 30, topicErrors, ...overrides });
    await assertFails(addDoc(results, exam('perfekt=2')));
    await assertFails(addDoc(results, exam('Perfekt:2')));
    await assertFails(addDoc(results, exam('perfekt:200')));
    await assertFails(addDoc(results, exam('<b>:1')));
    await assertFails(addDoc(results, exam(['perfekt:2'])));
    await assertFails(addDoc(results, exam('perfekt:1,'.repeat(70))));
    await assertFails(addDoc(results, result({ topicErrors: 'artikel:1' })));
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

  describe('temizlik hesabı (GitHub Actions)', () => {
    const CLEANUP = rules.match(/function cleanupUid\(\)\s*{\s*return '([^']+)'/)[1];
    const bot = () => as(CLEANUP, passwordToken('temizlik@example.com'));
    const expired = () => query(collection(bot(), 'placementTests'), where('expireAt', '<=', Timestamp.fromMillis(Date.now() - 60 * 1000)), limit(200));

    beforeEach(async () => {
      await seed('placementTests/ResOld000001', { ...placement('anon1'), createdAt: Timestamp.fromMillis(Date.now() - 190 * DAY), expireAt: Timestamp.fromMillis(Date.now() - 7 * DAY) });
      await seed('placementTests/ResNew000001', { ...placement('anon2'), createdAt: Timestamp.now(), expireAt: Timestamp.fromMillis(Date.now() + 183 * DAY) });
    });

    test('süresi dolmuş sonuçları listeleyip silebilir', async () => {
      const snap = await assertSucceeds(getDocs(expired()));
      if (snap.docs.map((d) => d.id).join() !== 'ResOld000001') throw new Error('yanlış sonuçlar: ' + snap.docs.map((d) => d.id));
      await assertSucceeds(deleteDoc(doc(bot(), 'placementTests/ResOld000001')));
    });

    test('süresi dolmamış sonucu silemez, bütün listeyi ve tek belgeyi okuyamaz', async () => {
      await assertFails(deleteDoc(doc(bot(), 'placementTests/ResNew000001')));
      await assertFails(getDocs(collection(bot(), 'placementTests')));
      await assertFails(getDocs(query(collection(bot(), 'placementTests'), where('expireAt', '<=', Timestamp.fromMillis(Date.now() + 3600 * 1000)))));
      await assertFails(getDoc(doc(bot(), 'placementTests/ResOld000001')));
      await assertFails(updateDoc(doc(bot(), 'placementTests/ResOld000001'), { read: true }));
    });

    test('başka hiçbir veriye erişemez, profil ve sonuç oluşturamaz', async () => {
      await seed('users/ayse', adultProfile({ createdAt: Timestamp.now(), status: 'active' }));
      await assertFails(getDocs(collection(bot(), 'users')));
      await assertFails(getDoc(doc(bot(), 'users/ayse')));
      await assertFails(getDocs(collection(bot(), 'placementLimits')));
      await assertFails(setDoc(doc(bot(), `users/${CLEANUP}`), adultProfile({ email: 'temizlik@example.com' })));
      await assertFails(submit(bot(), CLEANUP, placement(CLEANUP)));
    });

    test('başka bir hesap temizlik yetkisini kullanamaz', async () => {
      await assertFails(getDocs(query(collection(anon(), 'placementTests'), where('expireAt', '<=', Timestamp.fromMillis(Date.now() - 60 * 1000)))));
      await assertFails(deleteDoc(doc(anon(), 'placementTests/ResOld000001')));
    });
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

describe('Gramer dersi yorumları (comments)', () => {
  const anonToken = { firebase: { sign_in_provider: 'anonymous' } };
  const anon = (uid = 'anon1') => as(uid, anonToken);
  const comment = (overrides = {}) => ({
    lesson: 'A1/artikel',
    name: 'Ayşe',
    comment: 'Artikel konusunu bu anlatımla anladım.',
    status: 'pending',
    createdAt: serverTimestamp(),
    ...overrides
  });
  // Uygulamanın yaptığı gibi: yorum ve bekleme belgesi aynı batch içinde.
  function submit(db, uid, data, { id = 'Com' + Math.random().toString(36).slice(2, 12), limit } = {}) {
    const batch = writeBatch(db);
    batch.set(doc(db, `comments/${id}`), data);
    batch.set(doc(db, `commentLimits/${uid}`), limit || { lastAt: serverTimestamp(), lastId: id });
    return batch.commit();
  }
  const seeded = (status, extra = {}) => ({ ...comment({ status, createdAt: Timestamp.now() }), ...extra });

  test('anonim ziyaretçi ve öğrenci bekleyen yorum ekleyebilir', async () => {
    await assertSucceeds(submit(anon(), 'anon1', comment()));
    await assertSucceeds(submit(ayse(), 'ayse', comment({ lesson: 'B1/passiv' })));
  });

  test('giriş yapmamış biri yorum ekleyemez', async () => {
    await assertFails(submit(guestDb(), 'x', comment()));
  });

  test('yorum onaylı veya başka bir durumla oluşturulamaz', async () => {
    await assertFails(submit(anon('a'), 'a', comment({ status: 'approved' })));
    await assertFails(submit(anon('b'), 'b', comment({ status: 'hidden' })));
  });

  test('fazladan alan (e-posta, cevap) veya eksik alan kabul edilmez', async () => {
    await assertFails(submit(anon('a'), 'a', comment({ email: 'ayse@example.com' })));
    await assertFails(submit(anon('b'), 'b', comment({ reply: 'Kendi cevabım' })));
    const { name, ...noName } = comment();
    await assertFails(submit(anon('c'), 'c', noName));
  });

  test('isim, yorum, ders anahtarı ve tarih sınırları', async () => {
    const cases = {
      name: ['', '   ', 'x'.repeat(61), 42],
      comment: ['kısa', ' '.repeat(12), 'x'.repeat(2001)],
      lesson: ['artikel', 'C1/artikel', 'A1/Artikel', 'A1/<b>', 'A1/' + 'x'.repeat(41)],
      createdAt: [Timestamp.fromMillis(Date.now() - 60000)]
    };
    let i = 0;
    for (const [field, values] of Object.entries(cases)) for (const value of values) {
      const uid = 'v' + (i++);
      await assertFails(submit(anon(uid), uid, comment({ [field]: value })), `${field}=${String(value).slice(0, 20)}`);
    }
    await assertSucceeds(submit(anon('max'), 'max', comment({ name: 'x'.repeat(60), comment: 'y'.repeat(2000) })));
  });

  test('bekleme belgesi olmadan yorum eklenemez; 60 saniye dolmadan ikinci yorum eklenemez', async () => {
    await assertFails(setDoc(doc(anon(), 'comments/ComAbcdefghij'), comment()));
    await assertSucceeds(submit(anon(), 'anon1', comment()));
    await assertFails(submit(anon(), 'anon1', comment()));
    await seed('commentLimits/anon1', { lastAt: Timestamp.fromMillis(Date.now() - 61 * 1000), lastId: 'ComOld000001' });
    await assertSucceeds(submit(anon(), 'anon1', comment()));
  });

  test('bekleme belgesi tek başına sıfırlanamaz, okunamaz veya silinemez', async () => {
    await assertSucceeds(submit(anon(), 'anon1', comment()));
    await assertFails(setDoc(doc(anon(), 'commentLimits/anon1'), { lastAt: serverTimestamp(), lastId: 'ComNew000001' }));
    await assertFails(getDoc(doc(anon(), 'commentLimits/anon1')));
    await assertFails(deleteDoc(doc(anon(), 'commentLimits/anon1')));
  });

  test('herkes yalnızca onaylı yorumları okuyabilir', async () => {
    await seed('comments/ComOk00000001', seeded('approved', { reply: 'Teşekkürler!' }));
    await seed('comments/ComWait0000001', seeded('pending'));
    for (const db of [guestDb(), anon(), ayse()]) {
      await assertSucceeds(getDoc(doc(db, 'comments/ComOk00000001')));
      await assertFails(getDoc(doc(db, 'comments/ComWait0000001')));
      await assertSucceeds(getDocs(query(collection(db, 'comments'), where('lesson', '==', 'A1/artikel'), where('status', '==', 'approved'))));
      // Durum filtresi olmayan veya bekleyenleri isteyen sorgu reddedilir.
      await assertFails(getDocs(collection(db, 'comments')));
      await assertFails(getDocs(query(collection(db, 'comments'), where('lesson', '==', 'A1/artikel'))));
      await assertFails(getDocs(query(collection(db, 'comments'), where('status', '==', 'pending'))));
    }
  });

  test('öğretmen olmayan biri onaylayamaz, düzenleyemez, cevap yazamaz, silemez', async () => {
    await seed('comments/ComWait0000001', seeded('pending'));
    await seed('comments/ComOk00000001', seeded('approved'));
    for (const db of [guestDb(), anon(), ayse()]) {
      await assertFails(updateDoc(doc(db, 'comments/ComWait0000001'), { status: 'approved' }));
      await assertFails(updateDoc(doc(db, 'comments/ComOk00000001'), { comment: 'Değiştirilmiş yorum metni' }));
      await assertFails(updateDoc(doc(db, 'comments/ComOk00000001'), { reply: 'Sahte cevap' }));
      await assertFails(updateDoc(doc(db, 'comments/ComOk00000001'), { status: 'pending' }));
      await assertFails(deleteDoc(doc(db, 'comments/ComWait0000001')));
      await assertFails(deleteDoc(doc(db, 'comments/ComOk00000001')));
    }
  });

  test('kendi yazdığı bekleyen yorumu da okuyamaz veya onaylayamaz', async () => {
    const db = anon();
    await assertSucceeds(submit(db, 'anon1', comment(), { id: 'ComMine000001' }));
    await assertFails(getDoc(doc(db, 'comments/ComMine000001')));
    await assertFails(updateDoc(doc(db, 'comments/ComMine000001'), { status: 'approved' }));
  });

  test('öğretmen bekleyenleri görür, onaylar, cevap yazar, yayından kaldırır ve siler', async () => {
    await seed('comments/ComWait0000001', seeded('pending'));
    const t = teacherDb();
    await assertSucceeds(getDocs(query(collection(t, 'comments'), where('status', '==', 'pending'))));
    await assertSucceeds(updateDoc(doc(t, 'comments/ComWait0000001'), { status: 'approved', approvedAt: serverTimestamp() }));
    await assertSucceeds(getDoc(doc(guestDb(), 'comments/ComWait0000001')));
    await assertSucceeds(updateDoc(doc(t, 'comments/ComWait0000001'), { reply: 'Teşekkürler Ayşe!' }));
    await assertSucceeds(updateDoc(doc(t, 'comments/ComWait0000001'), { status: 'pending' }));
    await assertFails(getDoc(doc(guestDb(), 'comments/ComWait0000001')));
    await assertSucceeds(deleteDoc(doc(t, 'comments/ComWait0000001')));
  });
});

// Schreiben (js/writing-task.js → js/account/session.js): users/{uid}/writings + users/{uid}/limits/writing.
function writing(overrides = {}) {
  return { exam: 'goethe', level: 'b1', teil: 1, set: 'set-1', text: 'Liebe Lena, wie geht es dir?', words: 6, at: serverTimestamp(), ...overrides };
}
// Uygulamadaki gibi: metin ve sınır belgesi aynı batch'te. window: mevcut pencerenin başlangıcı (yoksa yeni pencere).
function submitWriting(db, uid, { data = {}, count = 1, windowStart, withLimit = true, limitExtra = {} } = {}) {
  const batch = writeBatch(db);
  const ref = doc(collection(db, `users/${uid}/writings`));
  batch.set(ref, writing(data));
  if (withLimit) {
    batch.set(doc(db, `users/${uid}/limits/writing`), {
      windowStart: windowStart || serverTimestamp(), count, lastAt: serverTimestamp(), lastId: ref.id, ...limitExtra
    });
  }
  return batch.commit();
}
const hoursAgo = (h) => Timestamp.fromMillis(Date.now() - h * 3600 * 1000);
const seededWriting = (overrides = {}) => ({ ...writing(), at: Timestamp.now(), ...overrides });

describe('Schreiben metinleri', () => {
  test('onaylı öğrenci ilk metnini gönderir ve kendi metinlerini okur', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertSucceeds(submitWriting(ayse(), 'ayse'));
    await assertSucceeds(getDocs(collection(ayse(), 'users/ayse/writings')));
    await assertSucceeds(getDoc(doc(ayse(), 'users/ayse/limits/writing')));
  });

  test('onaylanmamış öğrenci metin gönderemez', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await assertFails(submitWriting(ayse(), 'ayse'));
  });

  test('16 yaş altı: veli onayı yoksa gönderemez, varsa gönderir', async () => {
    await seed('users/can', seededMinor('active'));
    await assertFails(submitWriting(can(), 'can'));
    await seed('users/can', seededMinor('active', consentGiven));
    await assertSucceeds(submitWriting(can(), 'can'));
  });

  test('sınır belgesi olmadan metin eklenemez', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(submitWriting(ayse(), 'ayse', { withLimit: false }));
  });

  test('metin en fazla 4000 karakter ve boş olamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertSucceeds(submitWriting(ayse(), 'ayse', { data: { text: 'a'.repeat(4000) } }));
    await seed('users/ayse/limits/writing', { windowStart: hoursAgo(30), count: 1, lastAt: hoursAgo(30), lastId: 'eskimetin0000001' });
    await assertFails(submitWriting(ayse(), 'ayse', { data: { text: 'a'.repeat(4001) } }));
    await assertFails(submitWriting(ayse(), 'ayse', { data: { text: '   \n ' } }));
  });

  test('öğrenci geri bildirim ya da başka alan yazamaz, zaman sunucu saati olmalı', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(submitWriting(ayse(), 'ayse', { data: { feedback: 'Çok iyi!' } }));
    await assertFails(submitWriting(ayse(), 'ayse', { data: { at: Timestamp.now() } }));
    await assertFails(submitWriting(ayse(), 'ayse', { data: { teil: 0 } }));
    await assertFails(submitWriting(ayse(), 'ayse', { data: { set: '../x' } }));
    await assertFails(submitWriting(ayse(), 'ayse', { data: { words: 1001 } }));
  });

  test('aynı 24 saatte ikinci metin: sayaç bir artar', async () => {
    await seed('users/ayse', seededAdult('active'));
    const start = hoursAgo(2);
    await seed('users/ayse/limits/writing', { windowStart: start, count: 1, lastAt: start, lastId: 'eskimetin0000001' });
    await assertSucceeds(submitWriting(ayse(), 'ayse', { windowStart: start, count: 2 }));
  });

  test('pencere bitmeden yeni pencere başlatılamaz, sayaç atlanamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    const start = hoursAgo(2);
    await seed('users/ayse/limits/writing', { windowStart: start, count: 3, lastAt: start, lastId: 'eskimetin0000001' });
    await assertFails(submitWriting(ayse(), 'ayse', { count: 1 }));
    await assertFails(submitWriting(ayse(), 'ayse', { windowStart: start, count: 3 }));
    await assertFails(submitWriting(ayse(), 'ayse', { windowStart: start, count: 5 }));
  });

  test('24 saatte en fazla 10 metin', async () => {
    await seed('users/ayse', seededAdult('active'));
    const start = hoursAgo(5);
    await seed('users/ayse/limits/writing', { windowStart: start, count: 9, lastAt: start, lastId: 'eskimetin0000001' });
    await assertSucceeds(submitWriting(ayse(), 'ayse', { windowStart: start, count: 10 }));
    await assertFails(submitWriting(ayse(), 'ayse', { windowStart: start, count: 11 }));
  });

  test('24 saat geçince yeni pencere başlar', async () => {
    await seed('users/ayse', seededAdult('active'));
    const start = hoursAgo(25);
    await seed('users/ayse/limits/writing', { windowStart: start, count: 10, lastAt: start, lastId: 'eskimetin0000001' });
    await assertFails(submitWriting(ayse(), 'ayse', { windowStart: start, count: 11 }));
    await assertSucceeds(submitWriting(ayse(), 'ayse', { count: 1 }));
  });

  test('sınır belgesine metin olmadan sayı yazılamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(setDoc(doc(ayse(), 'users/ayse/limits/writing'),
      { windowStart: serverTimestamp(), count: 1, lastAt: serverTimestamp(), lastId: 'olmayanmetin000001' }));
    await assertFails(setDoc(doc(ayse(), 'users/ayse/limits/baska'),
      { windowStart: serverTimestamp(), count: 1, lastAt: serverTimestamp(), lastId: 'olmayanmetin000001' }));
  });

  test('öğrenci gönderdiği metni değiştiremez ve silemez; sadece "görüldü" işaretler', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/ayse/writings/w1', seededWriting({ feedback: 'İyi', feedbackAt: Timestamp.now() }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/writings/w1'), { text: 'değişti' }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/writings/w1'), { feedback: 'Harika' }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/writings/w1'), { seenAt: Timestamp.now() }));
    await assertFails(deleteDoc(doc(ayse(), 'users/ayse/writings/w1')));
    await assertSucceeds(updateDoc(doc(ayse(), 'users/ayse/writings/w1'), { seenAt: serverTimestamp() }));
  });

  test('başka öğrenci metinleri okuyamaz ve başkası adına gönderemez', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/can', seededMinor('active', consentGiven));
    await seed('users/ayse/writings/w1', seededWriting());
    await assertFails(getDoc(doc(can(), 'users/ayse/writings/w1')));
    await assertFails(getDocs(collection(can(), 'users/ayse/writings')));
    await assertFails(submitWriting(can(), 'ayse'));
    await assertFails(getDocs(collectionGroup(ayse(), 'writings')));
    await assertFails(getDocs(collection(guestDb(), 'users/ayse/writings')));
  });

  test('öğretmen bütün metinleri okur, geri bildirim yazar ve siler', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/ayse/writings/w1', seededWriting());
    await assertSucceeds(getDocs(collectionGroup(teacherDb(), 'writings')));
    await assertSucceeds(updateDoc(doc(teacherDb(), 'users/ayse/writings/w1'), { feedback: 'Üç madde de var.', feedbackAt: serverTimestamp() }));
    await assertSucceeds(deleteDoc(doc(teacherDb(), 'users/ayse/limits/writing')));
    await assertSucceeds(deleteDoc(doc(teacherDb(), 'users/ayse/writings/w1')));
  });
});

// Schreiben Aşama B: yapay zekâ hesabı (aiUid), taslaklar (aiDrafts), sayaçlar (aiLimits), mod (settings/ai).
const AI = rules.match(/function aiUid\(\)\s*{\s*return '([^']+)'/)[1];
const aiDb = () => as(AI, passwordToken('yapay-zeka@example.com'));
const aiResult = (overrides = {}) => ({ errors: [{ original: 'ich wohne', korrektur: 'wohne ich', erklaerung: 'Ana cümlede fiil 2. sırada.' }], correctedText: 'Seit drei Wochen wohne ich hier.', model: '@cf/google/gemma-4-26b-a4b-it', ...overrides });
const draft = (overrides = {}) => ({ uid: 'ayse', writingId: 'w1', ...aiResult(), createdAt: serverTimestamp(), ...overrides });
async function aiSetup(mode = 'draft') {
  await seed('users/ayse', seededAdult('active'));
  await seed('users/ayse/writings/w1', seededWriting());
  await seed('settings/ai', { mode });
}

describe('Schreiben yapay zekâ (Aşama B)', () => {
  test('yapay zekâ hesabı profili, metni ve modu okur', async () => {
    await aiSetup();
    await assertSucceeds(getDoc(doc(aiDb(), 'users/ayse')));
    await assertSucceeds(getDoc(doc(aiDb(), 'users/ayse/writings/w1')));
    await assertSucceeds(getDoc(doc(aiDb(), 'settings/ai')));
    await assertFails(getDocs(collection(aiDb(), 'users/ayse/writings')));
    await assertFails(getDocs(collection(aiDb(), 'users')));
    await assertFails(getDoc(doc(aiDb(), 'users/ayse/results/r1')));
  });

  test('taslak modunda taslak yazar; anında modunda yazamaz', async () => {
    await aiSetup('draft');
    await assertSucceeds(setDoc(doc(aiDb(), 'aiDrafts/ayse_w1'), draft()));
    await aiSetup('instant');
    await env.clearFirestore(); await aiSetup('instant');
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/ayse_w1'), draft()));
  });

  test('taslak kimliği, alanlar ve boyutlar denetlenir; olmayan metne taslak yazılamaz', async () => {
    await aiSetup('draft');
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/baska_w1'), draft()));
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/ayse_w1'), draft({ name: 'Ayşe' })));
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/ayse_w1'), draft({ correctedText: 'a'.repeat(6001) })));
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/ayse_w1'), draft({ errors: Array.from({ length: 31 }, () => ({ original: 'a', korrektur: 'b', erklaerung: 'c' })) })));
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/ayse_w2'), draft({ writingId: 'w2' })));
    await assertFails(setDoc(doc(aiDb(), 'aiDrafts/ayse_w1'), draft({ createdAt: Timestamp.now() })));
  });

  test('öğrenci taslağı hiçbir zaman okuyamaz ve yazamaz; öğretmen okur ve siler', async () => {
    await aiSetup('draft');
    await seed('aiDrafts/ayse_w1', { ...draft(), createdAt: Timestamp.now() });
    await assertFails(getDoc(doc(ayse(), 'aiDrafts/ayse_w1')));
    await assertFails(getDocs(collection(ayse(), 'aiDrafts')));
    await assertFails(setDoc(doc(ayse(), 'aiDrafts/ayse_w1'), draft()));
    await assertSucceeds(getDocs(collection(teacherDb(), 'aiDrafts')));
    await assertSucceeds(deleteDoc(doc(teacherDb(), 'aiDrafts/ayse_w1')));
  });

  test('anında modunda metne bir kez aiFeedback eklenir; taslak modunda eklenemez', async () => {
    await aiSetup('draft');
    await assertFails(updateDoc(doc(aiDb(), 'users/ayse/writings/w1'), { aiFeedback: aiResult(), aiAt: serverTimestamp() }));
    await seed('settings/ai', { mode: 'instant' });
    await assertFails(updateDoc(doc(aiDb(), 'users/ayse/writings/w1'), { aiFeedback: aiResult(), aiAt: serverTimestamp(), text: 'değişti' }));
    await assertFails(updateDoc(doc(aiDb(), 'users/ayse/writings/w1'), { feedback: 'Harika', feedbackAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(aiDb(), 'users/ayse/writings/w1'), { aiFeedback: aiResult(), aiAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(aiDb(), 'users/ayse/writings/w1'), { aiFeedback: aiResult({ correctedText: 'tekrar' }), aiAt: serverTimestamp() }));
  });

  test('öğrenci aiFeedback ya da onaylı geri bildirim alanı yazamaz', async () => {
    await aiSetup('instant');
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/writings/w1'), { aiFeedback: aiResult(), aiAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse/writings/w1'), { feedbackItems: [], feedbackSource: 'ai-approved' }));
  });

  test('günlük sayaçlar: öğrenci başına 3, site geneli 600; sadece yapay zekâ hesabı', async () => {
    await aiSetup();
    const lim = (count) => ({ day: '2026-11-08', count, updatedAt: serverTimestamp() });
    await assertSucceeds(setDoc(doc(aiDb(), 'aiLimits/ayse'), lim(3)));
    await assertFails(setDoc(doc(aiDb(), 'aiLimits/ayse'), lim(4)));
    await assertSucceeds(setDoc(doc(aiDb(), 'aiLimits/_global'), lim(600)));
    await assertFails(setDoc(doc(aiDb(), 'aiLimits/_global'), lim(601)));
    await assertFails(setDoc(doc(aiDb(), 'aiLimits/ayse'), { day: 'bugün', count: 1, updatedAt: serverTimestamp() }));
    await assertFails(setDoc(doc(ayse(), 'aiLimits/ayse'), lim(1)));
    await assertFails(getDoc(doc(ayse(), 'aiLimits/ayse')));
  });

  test('mod ayarını sadece öğretmen yazar; öğrenci okuyamaz', async () => {
    await aiSetup();
    await assertSucceeds(setDoc(doc(teacherDb(), 'settings/ai'), { mode: 'instant' }));
    await assertFails(setDoc(doc(aiDb(), 'settings/ai'), { mode: 'instant' }));
    await assertFails(setDoc(doc(ayse(), 'settings/ai'), { mode: 'instant' }));
    await assertFails(getDoc(doc(ayse(), 'settings/ai')));
  });

  test('yapay zekâ hesabı profil, seviye testi ya da yorum oluşturamaz; yapay zekâ onayını yazamaz', async () => {
    await aiSetup();
    await assertFails(setDoc(doc(aiDb(), `users/${AI}`), adultProfile({ email: 'yapay-zeka@example.com' })));
    await assertFails(updateDoc(doc(aiDb(), 'users/ayse'), { aiConsent: { given: true } }));
    await assertSucceeds(updateDoc(doc(teacherDb(), 'users/ayse'), { aiConsent: { given: true, at: Timestamp.now(), method: 'form', recordedAt: serverTimestamp() } }));
    await assertFails(updateDoc(doc(ayse(), 'users/ayse'), { aiConsent: { given: true } }));
  });
});

// Almanca Alfabe oyunu (js/account/alfabe-sync.js): users/{uid}/progress/alfabe.
describe('Almanca Alfabe ilerlemesi', () => {
  const profile = (o = {}) => ({ stats: { A: { r: 2, w: 1 }, 'ß': { r: 1, w: 0 } }, best: { duy: 8, 'duy:zaman': 120 }, stars: 9, ...o });
  const progress = (o = {}) => ({ cocuk: profile(), yetiskin: { stats: {}, best: {}, stars: 0 }, updatedAt: serverTimestamp(), ...o });
  const ref = (db, uid = 'ayse', name = 'alfabe') => doc(db, `users/${uid}/progress/${name}`);

  test('onaylı öğrenci kendi ilerlemesini yazabilir, güncelleyebilir ve okuyabilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertSucceeds(setDoc(ref(ayse()), progress()));
    await assertSucceeds(setDoc(ref(ayse()), progress({ cocuk: profile({ stars: 20 }) })));
    await assertSucceeds(getDoc(ref(ayse())));
  });

  test('onay bekleyen ya da veli onayı eksik öğrenci yazamaz ve okuyamaz', async () => {
    await seed('users/ayse', seededAdult('pending'));
    await assertFails(setDoc(ref(ayse()), progress()));
    await assertFails(getDoc(ref(ayse())));
    await seed('users/can', seededMinor('active'));
    await assertFails(setDoc(ref(can(), 'can'), progress()));
  });

  test('başka öğrencinin ilerlemesi okunamaz ve yazılamaz; ziyaretçi hiçbir şey yapamaz', async () => {
    await seed('users/ayse', seededAdult('active'));
    await seed('users/can', seededMinor('active', consentGiven));
    await seed('users/ayse/progress/alfabe', { ...progress(), updatedAt: Timestamp.now() });
    await assertFails(getDoc(ref(can())));
    await assertFails(setDoc(ref(can()), progress()));
    await assertFails(getDoc(ref(guestDb())));
  });

  test('sadece "alfabe" belgesi; öğrenci silemez, öğretmen okuyup silebilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    await assertFails(setDoc(ref(ayse(), 'ayse', 'baska'), progress()));
    await seed('users/ayse/progress/alfabe', { ...progress(), updatedAt: Timestamp.now() });
    await assertFails(deleteDoc(ref(ayse())));
    await assertSucceeds(getDoc(ref(teacherDb())));
    await assertSucceeds(deleteDoc(ref(teacherDb())));
  });

  test('biçim dışı ilerleme reddedilir', async () => {
    await seed('users/ayse', seededAdult('active'));
    const bad = [
      progress({ updatedAt: Timestamp.now() }),
      progress({ extra: 1 }),
      (() => { const p = progress(); delete p.yetiskin; return p; })(),
      progress({ cocuk: profile({ stats: { '<x>': { r: 1, w: 0 } } }) }),
      progress({ cocuk: profile({ best: { hile: 99 } }) }),
      progress({ cocuk: profile({ stars: -1 }) }),
      progress({ cocuk: profile({ stars: 1.5 }) }),
      progress({ cocuk: { ...profile(), uid: 'x' } })
    ];
    for (const p of bad) await assertFails(setDoc(ref(ayse()), p));
  });
});
