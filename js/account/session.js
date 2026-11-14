// index.html: menüdeki "Giriş / Panelim" bağlantısı, giriş yapmış öğrencinin alıştırma sonuçlarının ve
// Schreiben metinlerinin (js/writing-task.js → users/{uid}/writings) kaydı.
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

// Schreiben metinleri: Firebase hazır olmadan gelirse sıraya alınır; öğrenci değilse ya da hesap açık değilse not yazılır.
const writingQueue = [];
let saveWriting = null;
let writingBlocked = null; // açık olmayan hesapta gösterilecek notun anahtarı
window.addEventListener('ba:writing-submitted', (event) => {
  if(saveWriting) saveWriting(event.detail);
  else if(writingBlocked) writingStatus(event.detail, writingBlocked, 'error');
  else if(hint === 'student') writingQueue.push(event.detail);
});

// Yazma görevi (js/writing-task.js) durumu kendisi çizer: detail.path varsa olay gönderilir (not, bekliyor mu, metnin
// kimliği, yapay zekâ geri bildirimi). Form doldurma gibi eski görünümlerde not doğrudan sayfaya yazılır.
function writingStatus(detail, key, type, extra = {}){
  if(!detail.path){ writingNote(key, type, detail.noteIn); return; }
  window.dispatchEvent(new CustomEvent('ba:writing-status', { detail: { path: detail.path, key, type, pending: false, ...extra } }));
}

function writingNote(key, type, where){
  const box = document.querySelector(where || '#wtSaved');
  if(!box) return;
  const note = document.createElement('p');
  note.className = `notice wt-status ${type}`;
  note.setAttribute('role', 'status');
  note.dataset.wtStatus = '';
  note.textContent = window.BA?.t(key) || key;
  box.replaceChildren(note);
}

// The note goes under the result: the exercise result box, or the end-of-level test result (detail.noteIn).
function showNote(key, type, where){
  const box = document.querySelector(where || '#quizResult .result-box');
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
  const [{ auth, configured, db, fs, emulator }, { TEACHER_UID, AI_WORKER_URL }, { registerStrings }] = await Promise.all([
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
    writingBlocked = 'wtVisitorNotSaved';
    writingQueue.splice(0).forEach((d) => writingStatus(d, 'wtVisitorNotSaved', 'error'));
    return;
  }
  if(user.uid === TEACHER_UID){
    setNav('teacher');
    return;
  }
  setNav('student');
  const profile = await fs.getDoc(fs.doc(db, 'users', user.uid)).then((s) => s.data()).catch(() => null);
  const active = profile?.status === 'active' && (!profile.minor || profile.parentConsent?.given === true);
  if(!active){
    writingBlocked = 'wtNotActive';
    writingQueue.splice(0).forEach((d) => writingStatus(d, 'wtNotActive', 'error'));
    return;
  }
  // Yapay zekâ kontrolü: kayıttan sonra Worker'a sadece metnin kimliği gider; Worker metni kendisi okur ve sonucu döndürür.
  // "Anında göster" modunda geri bildirim aynı sayfada görünür. Kontrol yapılamazsa (kapalı, taslak, 16 yaş altı onaysız,
  // günlük sınır, hata) metin öğretmende kalır. Adres boşsa Worker hiç çağrılmaz.
  const workerUrl = emulator ? 'http://127.0.0.1:8787' : AI_WORKER_URL;
  const AI_TIMEOUT_MS = 75000;
  const askAi = async (writingId) => {
    if(!workerUrl) return { status: 'off' };
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(), AI_TIMEOUT_MS);
    try{
      const response = await fetch(`${workerUrl}/check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ writingId }),
        signal: stop.signal
      });
      return await response.json();
    }catch(error){ console.warn('ai check', error); return { status: 'error' }; }
    finally{ clearTimeout(timer); }
  };
  // "Bu açıklama yanlış görünüyor": maddenin sırası metne eklenir (aiFlags); öğretmen panelinde görünür.
  const flag = (writingId, index) => fs.updateDoc(fs.doc(db, 'users', user.uid, 'writings', writingId), {
    aiFlags: fs.arrayUnion(index), aiFlaggedAt: fs.serverTimestamp()
  });
  const AI_NOTES = { limit: ['wtAiLimit', 'error'], unavailable: ['wtAiFailed', 'error'], 'no-result': ['wtAiFailed', 'error'], error: ['wtAiFailed', 'error'], busy: ['wtAiFailed', 'error'] };
  saveWriting = async (detail) => {
    let outcome;
    try{ outcome = await submitWriting({ db, fs, uid: user.uid, detail }); }
    catch(error){ console.error(error); writingStatus(detail, 'wtSaveFailed', 'error'); return; }
    if(outcome.status === 'limit'){ writingStatus(detail, 'wtLimit', 'error'); return; }
    if(!workerUrl || !detail.path){ writingStatus(detail, 'wtSaved', 'success', { id: outcome.id }); return; }
    writingStatus(detail, 'wtAiChecking', '', { id: outcome.id, pending: true });
    const [result, view] = await Promise.all([askAi(outcome.id), import('./writing-feedback.js?v=1').catch((error) => { console.error(error); return null; })]);
    if(result?.status === 'instant' && result.feedback && view){
      window.BAWritingFeedback = { view: view.feedbackView, flag };
      // Öğrenci geri bildirimi bu sayfada gördü: panelde "yeni" diye işaretlenmesin.
      fs.updateDoc(fs.doc(db, 'users', user.uid, 'writings', outcome.id), { seenAt: fs.serverTimestamp() }).catch((error) => console.warn(error));
      writingStatus(detail, result.feedback.errors?.length ? 'wtAiDone' : 'wtAiDoneNone', 'success', { id: outcome.id, feedback: result.feedback });
      return;
    }
    const [key, type] = result?.status === 'limit' && result.scope === 'site' ? ['wtAiLimitSite', 'error'] : AI_NOTES[result?.status] || ['wtSaved', 'success'];
    writingStatus(detail, key, type, { id: outcome.id });
  };
  save = async (detail) => {
    try{
      await fs.addDoc(fs.collection(db, 'users', user.uid, 'results'), {
        level: detail.level,
        topic: detail.topic,
        exercise: detail.exercise,
        score: detail.score,
        total: detail.total,
        // End-of-level test: wrong answers per topic ("perfekt:2,akkusativ:1"); which questions came up is not saved.
        ...(typeof detail.topicErrors === 'string' ? { topicErrors: detail.topicErrors } : {}),
        at: fs.serverTimestamp()
      });
      showNote('resultSaved', 'success', detail.noteIn);
    }catch(error){
      console.error(error);
      showNote('resultSaveFailed', 'error', detail.noteIn);
    }
  };
  queue.splice(0).forEach(save);
  writingQueue.splice(0).forEach(saveWriting);
}

// Metin ve günlük sınır belgesi tek batch'te (firestore.rules: 24 saatlik pencerede en fazla 10 metin).
// Pencere sunucu saatine göre değerlendirilir; cihaz saati kaymışsa bir kez öbür durumla tekrar denenir.
const WRITING_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
async function submitWriting({ db, fs, uid, detail }){
  const limitRef = fs.doc(db, 'users', uid, 'limits', 'writing');
  const limit = (await fs.getDoc(limitRef)).data();
  const startMs = limit?.windowStart?.toMillis?.();
  let fresh = !limit || !startMs || Date.now() - startMs >= DAY_MS;
  if(!fresh && limit.count >= WRITING_LIMIT) return { status: 'limit' };
  const attempt = async () => {
    const ref = fs.doc(fs.collection(db, 'users', uid, 'writings'));
    const batch = fs.writeBatch(db);
    batch.set(ref, {
      exam: detail.exam, level: detail.level, teil: detail.teil, set: detail.set,
      text: detail.text, words: detail.words, at: fs.serverTimestamp(),
      ...(typeof detail.revisionOf === 'string' ? { revisionOf: detail.revisionOf } : {})
    });
    batch.set(limitRef, {
      windowStart: fresh ? fs.serverTimestamp() : limit.windowStart,
      count: fresh ? 1 : limit.count + 1,
      lastAt: fs.serverTimestamp(),
      lastId: ref.id
    });
    await batch.commit();
    return { status: 'saved', id: ref.id };
  };
  try{ return await attempt(); }
  catch(error){
    if(error?.code !== 'permission-denied' || !limit) throw error;
    fresh = !fresh;
    if(!fresh && limit.count >= WRITING_LIMIT) return { status: 'limit' };
    return attempt();
  }
}

if(hint) connect().catch((error) => console.error(error));
