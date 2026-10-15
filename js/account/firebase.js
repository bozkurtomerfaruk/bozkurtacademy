// Firebase'i resmi modüler SDK ile, sabit sürümle CDN'den yükler.
// Sürümü değiştirirken üç adresi birlikte güncelle.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import * as fa from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import * as fs from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { firebaseConfig } from './config.js';

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

let app = null, auth = null, db = null;
if(configured){
  app = initializeApp(emulator ? demoConfig : firebaseConfig);
  auth = fa.getAuth(app);
  db = fs.getFirestore(app);
  if(emulator){
    fa.connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    fs.connectFirestoreEmulator(db, '127.0.0.1', 8080);
  }
}

export { auth, db, fa, fs, emulator };
