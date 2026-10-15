// kayit.html: e-posta/şifre ile kayıt, 16 yaş ve üstü için Google ile kayıt, yarım kalan kaydı tamamlama.
import { auth, configured, db, fa, fs } from './firebase.js';
import { TEACHER_UID } from './config.js';
import { registerStrings, t } from './i18n.js';
import {
  $, authErrorKey, currentUser, isMinorBirthYear, loadProfile, setHint, setStatus, validBirthYear, validEmail
} from './common.js';

registerStrings();

const status = $('regStatus');
let completing = null; // giriş yapmış ama profili olmayan kullanıcı
let busy = false;

const birthYear = () => {
  const raw = $('regBirthYear').value.trim();
  return /^\d{4}$/.test(raw) ? Number(raw) : NaN;
};

// Doğum yılına göre form değişir: 16 yaş altı → veli alanları, 16 yaş ve üstü → Google seçeneği.
function updateAgeSections(){
  const year = birthYear();
  const known = validBirthYear(year);
  const minor = known && isMinorBirthYear(year);
  $('minorBox').hidden = !minor;
  $('regParentName').required = minor;
  $('regParentEmail').required = minor;
  $('googleArea').hidden = !known || minor || Boolean(completing);
}

function fail(key, focusId){
  setStatus(status, 'error', t(key));
  if(focusId) $(focusId).focus();
  return null;
}

// Form alanlarını doğrular; e-posta ve şifre sadece e-posta/şifre kaydında istenir.
function readForm({ needCredentials, studentEmail }){
  const name = $('regName').value.trim();
  const email = needCredentials ? $('regEmail').value.trim() : studentEmail;
  const password = $('regPassword').value;
  const year = birthYear();
  if(name.length < 2 || name.length > 80) return fail('regErrName', 'regName');
  if(needCredentials && !validEmail(email)) return fail('regErrEmail', 'regEmail');
  if(needCredentials && password.length < 8) return fail('regErrPassword', 'regPassword');
  if(!validBirthYear(year)) return fail('regErrBirthYear', 'regBirthYear');
  const minor = isMinorBirthYear(year);
  let parent = null;
  if(minor){
    parent = { name: $('regParentName').value.trim(), email: $('regParentEmail').value.trim() };
    if(parent.name.length < 2 || parent.name.length > 80 || !validEmail(parent.email)) return fail('regErrParent', 'regParentName');
    if(email && parent.email.toLowerCase() === email.toLowerCase()) return fail('regErrParentSame', 'regParentEmail');
  }
  if(!$('regPrivacy').checked) return fail('regErrPrivacy', 'regPrivacy');
  return { name, email, password, birthYear: year, minor, parent };
}

// Profil "onay bekliyor" olarak oluşturulur; kurallar her alanı tekrar kontrol eder.
async function createProfile(user, form){
  const { signInProvider } = await user.getIdTokenResult();
  const data = {
    name: form.name,
    email: user.email,
    birthYear: form.birthYear,
    minor: form.minor,
    provider: signInProvider,
    status: 'pending',
    createdAt: fs.serverTimestamp()
  };
  if(form.minor) data.parent = form.parent;
  await fs.setDoc(fs.doc(db, 'users', user.uid), data);
  setHint('student');
  location.replace('panel.html');
}

function setBusy(value){
  busy = value;
  $('regSubmit').disabled = value;
  $('googleBtn').disabled = value;
}

async function submitWithPassword(event){
  event.preventDefault();
  if(busy) return;
  const form = readForm({ needCredentials: !completing, studentEmail: completing?.email });
  if(!form) return;
  setBusy(true);
  setStatus(status, '', t('accLoading'));
  try{
    let user = completing;
    if(!user){
      ({ user } = await fa.createUserWithEmailAndPassword(auth, form.email, form.password));
    }else if(form.minor && (await user.getIdTokenResult()).signInProvider === 'google.com'){
      fail('regErrMinorGoogle');
      return;
    }
    // Hesap oluştu ama profil kaydı başarısız olursa kullanıcı giriş yapmış kalır ve sayfa "tamamla" moduna geçer.
    completing = user;
    await createProfile(user, form);
  }catch(error){
    console.error(error);
    setStatus(status, 'error', t(authErrorKey(error)));
    if(completing) enterCompleteMode(completing);
  }finally{
    setBusy(false);
  }
}

async function registerWithGoogle(){
  if(busy) return;
  // E-posta Google'dan gelecek; ad, doğum yılı ve gizlilik onayı formdan.
  const form = readForm({ needCredentials: false, studentEmail: '' });
  if(!form) return;
  if(form.minor) return fail('regErrMinorGoogle', 'regBirthYear');
  setBusy(true);
  try{
    const { user } = await fa.signInWithPopup(auth, new fa.GoogleAuthProvider());
    if(user.uid === TEACHER_UID){
      setHint('teacher');
      location.replace('ogretmen.html');
      return;
    }
    if(await loadProfile(user.uid)){
      setHint('student');
      location.replace('panel.html');
      return;
    }
    completing = user;
    await createProfile(user, form);
  }catch(error){
    console.error(error);
    setStatus(status, 'error', t(authErrorKey(error)));
  }finally{
    setBusy(false);
  }
}

function enterCompleteMode(user){
  completing = user;
  $('regTitle').dataset.i18n = 'regCompleteTitle';
  $('regLead').dataset.i18n = 'regCompleteLead';
  $('regSubmit').dataset.i18n = 'regCompleteSubmit';
  $('emailField').hidden = true;
  $('passwordField').hidden = true;
  $('regEmail').required = false;
  $('regPassword').required = false;
  $('regSwitch').hidden = true;
  window.BA?.applyLanguage(window.BA.lang);
  updateAgeSections();
}

if(!configured){
  $('notConfigured').hidden = false;
  $('regForm').hidden = true;
}else{
  $('regBirthYear').addEventListener('input', updateAgeSections);
  $('regForm').addEventListener('submit', submitWithPassword);
  $('googleBtn').addEventListener('click', registerWithGoogle);
  currentUser().then(async (user) => {
    if(!user) return;
    if(user.uid === TEACHER_UID){
      location.replace('ogretmen.html');
      return;
    }
    try{
      if(await loadProfile(user.uid)){
        location.replace('panel.html');
        return;
      }
    }catch(error){
      console.error(error);
    }
    enterCompleteMode(user);
  });
}
