// giris.html: e-posta/şifre ya da Google ile giriş, şifre sıfırlama.
import { auth, configured, fa } from './firebase.js';
import { TEACHER_UID } from './config.js';
import { registerStrings, t, lang } from './i18n.js';
import { $, authErrorKey, clearHint, loadProfile, setHint, setStatus, validEmail } from './common.js';

registerStrings();

const status = $('loginStatus');
let busy = false;

function setBusy(value){
  busy = value;
  for(const id of ['loginSubmit', 'googleBtn', 'forgotBtn']) $(id).disabled = value;
}

function showError(error){
  console.error(error);
  setStatus(status, 'error', t(authErrorKey(error)));
}

// Girişten sonra: öğretmen → öğretmen paneli, kaydı olan öğrenci → panel, kaydı yoksa → kaydı tamamla.
async function route(user){
  if(user.uid === TEACHER_UID){
    setHint('teacher');
    location.replace('ogretmen.html');
    return;
  }
  // Kurallar henüz yayınlanmamışsa okuma reddedilir; o zaman da kayıt yok sayılır ve UID gösterilir.
  const profile = await loadProfile(user.uid).catch((error) => { console.warn(error); return null; });
  if(profile){
    setHint('student');
    location.replace('panel.html');
    return;
  }
  // Kayıt tamamlanmamış: kayıt sayfası "kaydı tamamla" moduna geçer.
  // UID burada gösterilir; öğretmen kurulumda kendi UID'ini buradan da okuyabilir.
  $('noProfileUid').textContent = user.uid;
  $('noProfileBox').hidden = false;
  setStatus(status, '', '');
}

function showSignedIn(user){
  $('signedInBox').hidden = false;
  $('loginArea').hidden = true;
  $('signedInEmail').textContent = user.email || '';
  $('goPanelLink').href = user.uid === TEACHER_UID ? 'ogretmen.html' : 'panel.html';
}

if(!configured){
  $('notConfigured').hidden = false;
  $('loginArea').hidden = true;
}else{
  const stop = auth.onAuthStateChanged((user) => {
    stop();
    if(user) showSignedIn(user);
  });

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if(busy) return;
    const email = $('loginEmail').value.trim();
    const password = $('loginPassword').value;
    if(!validEmail(email) || !password){
      setStatus(status, 'error', t('loginWrong'));
      return;
    }
    setBusy(true);
    setStatus(status, '', t('accLoading'));
    try{
      const { user } = await fa.signInWithEmailAndPassword(auth, email, password);
      await route(user);
    }catch(error){
      showError(error);
    }finally{
      setBusy(false);
    }
  });

  $('googleBtn').addEventListener('click', async () => {
    if(busy) return;
    setBusy(true);
    try{
      const { user } = await fa.signInWithPopup(auth, new fa.GoogleAuthProvider());
      await route(user);
    }catch(error){
      showError(error);
    }finally{
      setBusy(false);
    }
  });

  $('forgotBtn').addEventListener('click', async () => {
    const email = $('loginEmail').value.trim();
    if(!validEmail(email)){
      setStatus(status, 'error', t('loginResetNeedEmail'));
      $('loginEmail').focus();
      return;
    }
    setBusy(true);
    try{
      auth.languageCode = lang();
      await fa.sendPasswordResetEmail(auth, email);
      setStatus(status, 'success', t('loginResetSent'));
    }catch(error){
      // Hesap olup olmadığını belli etmemek için "kullanıcı yok" hatası da başarı gibi gösterilir.
      if(error?.code === 'auth/user-not-found') setStatus(status, 'success', t('loginResetSent'));
      else showError(error);
    }finally{
      setBusy(false);
    }
  });

  $('logoutBtn').addEventListener('click', async () => {
    await fa.signOut(auth);
    clearHint();
    location.reload();
  });
}
