// Seviye testi sonucunu Firestore'a yazar (placementTests). js/placement.js "Sonucu gönder"de yükler;
// Firebase ziyaretçi için ancak bu anda indirilir.
// Giriş yapılmamışsa anonim giriş kullanılır (Firebase Console → Authentication → Anonim açık olmalı),
// çünkü bekleme süresi kurallarda kullanıcı kimliğine bağlı. Gönderimden sonra anonim oturum kapatılır.
import { auth, configured, db, fa, fs } from './firebase.js';

// Firestore TTL politikası expireAt alanına göre siler: 6 ay = 183 gün (kurallar ±1 gün kabul eder).
const KEEP_DAYS = 183;

function currentUser(){
  return new Promise((resolve) => {
    const stop = auth.onAuthStateChanged((user) => { stop(); resolve(user); });
  });
}

export async function submitPlacement(data){
  if(!configured) throw new Error('Firebase is not configured');
  let user = await currentUser();
  if(!user) user = (await fa.signInAnonymously(auth)).user;
  const ref = fs.doc(fs.collection(db, 'placementTests'));
  const batch = fs.writeBatch(db);
  batch.set(ref, {
    ...data,
    uid: user.uid,
    createdAt: fs.serverTimestamp(),
    expireAt: fs.Timestamp.fromMillis(Date.now() + KEEP_DAYS * 24 * 60 * 60 * 1000)
  });
  // Bekleme süresi: kurallar bu belgenin aynı batch'te bu sonucun kimliğiyle yazılmasını ister.
  batch.set(fs.doc(db, 'placementLimits', user.uid), { lastAt: fs.serverTimestamp(), lastId: ref.id });
  try{
    await batch.commit();
  }finally{
    if(user.isAnonymous) await fa.signOut(auth).catch(() => {});
  }
  return ref.id;
}
