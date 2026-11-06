// Firebase'i resmi modüler SDK ile, sabit sürümle CDN'den yükler.
// Sürümü değiştirirken dört adresi (App Check dahil) birlikte güncelle.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import * as fa from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import * as fs from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import * as config from './config.js';
// Ad alanıyla: önbellekte kalmış eski bir config.js'te APPCHECK_SITE_KEY yoksa içe aktarma hata vermez, App Check atlanır.
const { firebaseConfig } = config;
const APPCHECK_SITE_KEY = config.APPCHECK_SITE_KEY || '';
const APP_CHECK_SDK = 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js';

// Yerel geliştirme: localhost'ta ?emulator=1 ile Firebase Emulator'a bağlanır (?emulator=0 kapatır).
// Canlı sitede hiçbir zaman çalışmaz.
function emulatorMode(){
  if(!['localhost', '127.0.0.1'].includes(location.hostname)) return false;
  const flag = new URLSearchParams(location.search).get('emulator');
  try{
    if(flag === '1') localStorage.setItem('baEmulator', '1');
    if(flag === '0') localStorage.removeItem('baEmulator');
    return localStorage.getItem('baEmulator') === '1';
  }catch(_){
    return flag === '1';
  }
}

const emulator = emulatorMode();
const demoConfig = { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-bozkurtacademy', appId: 'demo' };

export const configured = emulator || Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
export const projectId = emulator ? demoConfig.projectId : firebaseConfig.projectId;

// App Check (docs/app-check.md): istekler bu siteden, gerçek bir tarayıcıdan mı geliyor? reCAPTCHA Enterprise ile
// belirteç alınır, Firebase SDK'sı onu Firestore ve Auth isteklerine kendisi ekler. APPCHECK_SITE_KEY boşken atlanır.
// Yerelde (emülatör dahil) gerçek reCAPTCHA yerine hata ayıklama belirteci kullanılır: tarayıcı konsolu ilk açılışta
// belirteci yazar, Firebase Console → App Check → Uygulamalar → Hata ayıklama belirteçleri'ne eklenir.
// Kendi belirtecini kullanmak için: localStorage.baAppCheckDebugToken = '…'.
let appCheck = null, appCheckSdk = null;
async function startAppCheck(firebaseApp){
  if(!APPCHECK_SITE_KEY) return null;
  try{
    if(['localhost', '127.0.0.1'].includes(location.hostname)){
      let debug = true;
      try{ debug = localStorage.getItem('baAppCheckDebugToken') || true; }catch(_){}
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = debug;
    }
    appCheckSdk = await import(APP_CHECK_SDK);
    return appCheckSdk.initializeAppCheck(firebaseApp, {
      provider: new appCheckSdk.ReCaptchaEnterpriseProvider(APPCHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  }catch(error){
    // App Check yüklenemezse site çalışmaya devam eder; zorunlu kılındıysa istekleri Firebase reddeder.
    console.warn('[App Check] başlatılamadı:', error?.message || error);
    return null;
  }
}

// SDK dışındaki REST istekleri için (js/comments.js): X-Firebase-AppCheck başlığına konacak belirteç ya da null.
export async function appCheckToken(){
  if(!appCheck || !appCheckSdk) return null;
  try{ return (await appCheckSdk.getToken(appCheck, false)).token; }
  catch(error){ console.warn('[App Check] belirteç alınamadı:', error?.message || error); return null; }
}

let app = null, auth = null, db = null;
if(configured){
  app = initializeApp(emulator ? demoConfig : firebaseConfig);
  appCheck = await startAppCheck(app);
  auth = fa.getAuth(app);
  db = fs.getFirestore(app);
  if(emulator){
    fa.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    fs.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
}

export { auth, db, fa, fs, emulator };
