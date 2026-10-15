// index.html: menüdeki "Giriş / Panelim" bağlantısı ve giriş yapmış öğrencinin alıştırma sonuçlarının kaydı.
// Firebase sadece daha önce giriş yapılmışsa yüklenir; ziyaretçiler için hiçbir şey indirilmez.
const HINT = 'baAccount';
const hint = (() => { try{ return localStorage.getItem(HINT); }catch(_){ return null; } })();

function setNav(role){
  const link = document.getElementById('navAccount');
  if(!link) return;
  const [href, key] = role === 'teacher' ? ['ogretmen.html', 'navTeacher']
    : role === 'student' ? ['panel.html', 'navPanel']
    : ['giris.html', 'navLogin'];
  link.href = href;
  link.dataset.i18n = key;
  link.textContent = window.BA?.t(key) || link.textContent;
}

setNav(hint);

// Sonuçlar Firebase hazır olmadan gelirse sıraya alınır.
const queue = [];
let save = null;
window.addEventListener('ba:exercise-finished', (event) => {
  if(save) save(event.detail);
  else if(hint === 'student') queue.push(event.detail);
});

function showNote(key, type){
  const box = document.querySelector('#quizResult .result-box');
  if(!box) return;
  box.querySelector('.result-saved-note')?.remove();
  const note = document.createElement('p');
  note.className = `notice result-saved-note ${type}`;
  note.setAttribute('role', 'status');
  note.dataset.i18n = key;
  note.textContent = window.BA?.t(key) || '';
  box.append(note);
}

async function connect(){
  const [{ auth, configured, db, fs }, { TEACHER_UID }, { registerStrings }] = await Promise.all([
    import('./firebase.js'), import('./config.js'), import('./i18n.js')
  ]);
  if(!configured) return;
  registerStrings();
  const user = await new Promise((resolve) => {
    const stop = auth.onAuthStateChanged((u) => { stop(); resolve(u); });
  });
  if(!user){
    try{ localStorage.removeItem(HINT); }catch(_){}
    setNav(null);
    return;
  }
  if(user.uid === TEACHER_UID){
    setNav('teacher');
    return;
  }
  setNav('student');
  const profile = await fs.getDoc(fs.doc(db, 'users', user.uid)).then((s) => s.data()).catch(() => null);
  const active = profile?.status === 'active' && (!profile.minor || profile.parentConsent?.given === true);
  if(!active) return;
  save = async (detail) => {
    try{
      await fs.addDoc(fs.collection(db, 'users', user.uid, 'results'), {
        level: detail.level,
        topic: detail.topic,
        exercise: detail.exercise,
        score: detail.score,
        total: detail.total,
        at: fs.serverTimestamp()
      });
      showNote('resultSaved', 'success');
    }catch(error){
      console.error(error);
      showNote('resultSaveFailed', 'error');
    }
  };
  queue.splice(0).forEach(save);
}

if(hint) connect().catch((error) => console.error(error));
