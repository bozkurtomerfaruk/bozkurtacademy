// Almanca Alfabe oyunu (/almanca-alfabe/, js/alfabe.js): giriş yapmış onaylı öğrencinin ilerlemesini hesaba yazar.
// js/alfabe.js bunu sadece cihazda öğrenci ipucu (localStorage baAccount = 'student') varsa yükler; ziyaretçiler için
// Firebase hiç indirilmez. Belge: users/{uid}/progress/alfabe = { cocuk, yetiskin, updatedAt } (firestore.rules →
// validAlfabeProgress). Profil seçimi ve ses ayarları yerelde kalır.
//
// Birleştirme (js/alfabe-logic.js → mergeProgress): her alanın iyi olanı kalır (harf başına doğru ve yanlış sayısı,
// mod başına en iyi skor, yıldızlar). Girişte yerel ve hesaptaki ilerleme birleşip iki tarafa da yazılır; sonra her tur
// sonunda ve sayfa gizlenince hesaptaki belge yeniden okunup birleştirilerek yazılır (başka cihazdaki ilerleme kaybolmaz).
// Yerel ilerleme başka bir hesapla eşitlenmişse ya da başka bir hesaba aitse (baAlfabe.uid farklı) bu hesaba karıştırılmaz;
// hesaptaki alınır. Onay bekleyen hesap ve öğretmen hesabı yazmaz ama sahipsiz yerel ilerlemeyi kendi uid'leriyle işaretler.
// Çıkışta (js/account/common.js → signedOut) yerel ilerleme silinir ve uid 'cikis-yapildi' olur: çıkıştan sonra giriş
// yapmadan oynanan oyun hiçbir hesaba eklenmez, onay bekleyen hesap da onu sahiplenmez.
import { auth, configured, db, fs } from './firebase.js';
import { TEACHER_UID } from './config.js';

const bridge = window.baAlfabeSync;

async function start(){
  if(!bridge || !configured) return;
  const ids = await bridge.ready;
  const L = bridge.logic;
  const user = await new Promise((resolve) => {
    const stop = auth.onAuthStateChanged((u) => { stop(); resolve(u); });
  });
  if(!user) return;
  // Accounts that do not sync still mark unowned local progress as theirs (bridge.claim), so it is never merged into
  // another account that signs in later on the same browser.
  if(user.uid === TEACHER_UID){ bridge.claim(user.uid); return; }
  // Only an approved account may write (same rule as the exercise results); otherwise the game stays local.
  const profile = await fs.getDoc(fs.doc(db, 'users', user.uid)).then((s) => s.data()).catch(() => null);
  const active = profile?.status === 'active' && (!profile.minor || profile.parentConsent?.given === true);
  if(!active){ bridge.claim(user.uid); return; }

  const ref = fs.doc(db, 'users', user.uid, 'progress', 'alfabe');
  let written = null; // progressKey of what the account holds
  const localPart = () => {
    const { uid, p } = bridge.read();
    return uid && uid !== user.uid ? null : p;
  };
  // Stop for good when the account signs out (in this tab or another one) or another account signs in: nothing is
  // written to the old account any more, and the device keeps the signed-out record (js/account/common.js → signedOut).
  let stopped = false;
  auth.onAuthStateChanged((u) => { if(!u || u.uid !== user.uid) stopped = true; });
  const closed = () => stopped || bridge.closed;
  let busy = Promise.resolve();
  const sync = () => (busy = busy.then(async () => {
    if(closed()) return;
    const remote = (await fs.getDoc(ref)).data() || null;
    if(closed()) return; // signed out while the account was being read
    const merged = L.mergeProgress(localPart(), remote, ids);
    const key = L.progressKey(merged, ids);
    bridge.apply(merged, user.uid);
    if(remote && L.progressKey(remote, ids) === key){ written = key; return; }
    await fs.setDoc(ref, { ...L.cleanProgress(merged, ids), updatedAt: fs.serverTimestamp() });
    written = key;
  }).catch((error) => console.warn('alfabe sync', error)));

  await sync();
  window.addEventListener('ba:alfabe-round', () => sync());
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState !== 'hidden' || closed()) return;
    const p = localPart();
    if(p && L.progressKey(p, ids) !== written) sync();
  });
}

start().catch((error) => console.warn('alfabe sync', error));
