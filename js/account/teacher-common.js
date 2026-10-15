// Öğretmen paneli ve öğrenci detay sayfasının ortak işlemleri (sadece Türkçe).
import { auth, configured, db, fa, fs, projectId } from './firebase.js';
import { TEACHER_UID } from './config.js';
import { $, BERLIN, clearHint, consentGiven, currentUser, formatDate, h, setHint, toDate } from './common.js';

export const fmtDate = (value) => formatDate(value, { lang: 'tr', timeZone: BERLIN });

// Sayfayı sadece öğretmen için başlatır. Asıl koruma Firestore kurallarındadır.
export async function requireTeacher({ loadingId, errorId }){
  if(!configured){
    $('notConfigured').hidden = false;
    $(loadingId).hidden = true;
    return null;
  }
  const user = await currentUser();
  if(!user){
    location.replace('giris.html');
    return null;
  }
  if(user.uid !== TEACHER_UID){
    $(loadingId).hidden = true;
    $(errorId).hidden = false;
    $(errorId).textContent = 'Bu sayfa sadece öğretmen içindir.';
    return null;
  }
  setHint('teacher');
  $('logoutBtn')?.addEventListener('click', async () => {
    await fa.signOut(auth);
    clearHint();
    location.replace('index.html');
  });
  return user;
}

export async function listStudents(){
  const snap = await fs.getDocs(fs.collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Her öğrencinin en son (iptal edilmemiş) dersinin tarihi. Dersler Aşama 3'te eklenir; o zamana kadar boş.
export async function lastLessonByStudent(){
  const map = new Map();
  const snap = await fs.getDocs(fs.collectionGroup(db, 'lessons'));
  for(const d of snap.docs){
    const lesson = d.data();
    if(lesson.status === 'cancelled') continue;
    const uid = d.ref.parent.parent?.id;
    const at = toDate(lesson.startAt);
    if(uid && at && (!map.has(uid) || at > map.get(uid))) map.set(uid, at);
  }
  return map;
}

// Hesap açık mı: öğretmen onayı VE (16 yaş ve üstü VEYA veli onayı). Kurallardaki isActive() ile aynı.
export const isEnabled = (s) => s.status === 'active' && (!s.minor || consentGiven(s));
const needsApproval = (s) => s.status === 'pending' || (s.minor && !consentGiven(s) && s.status !== 'inactive');

function addMonths(date, months){
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// Saklama süreleri (gizlilik politikası): onaylanmamış kayıt 30 gün, son dersten 12 ay
// (hiç ders yoksa onay tarihinden, o da yoksa kayıt tarihinden).
export function staleReason(student, lastLesson, now = new Date()){
  const created = toDate(student.createdAt);
  if(needsApproval(student)){
    if(created && now - created > 30 * 24 * 60 * 60 * 1000){
      return { text: 'Onaylanmamış kayıt, 30 günden eski', since: created, label: 'Kayıt' };
    }
    return null;
  }
  const lesson = lastLesson || null;
  const reference = lesson || toDate(student.approvedAt) || created;
  if(reference && addMonths(reference, 12) < now){
    return lesson
      ? { text: 'Son dersten bu yana 12 ay geçti', since: lesson, label: 'Son ders' }
      : { text: 'Hiç ders yok, onaydan bu yana 12 ay geçti', since: reference, label: 'Onay' };
  }
  return null;
}

export function categorize(students, lastLessons){
  const byName = (a, b) => (a.name || '').localeCompare(b.name || '', 'tr');
  const sorted = [...students].sort(byName);
  return {
    ogrenciler: sorted.filter((s) => s.status !== 'pending'),
    onay: sorted.filter((s) => s.status === 'pending' && (!s.minor || consentGiven(s))),
    veli: sorted.filter((s) => s.minor && !consentGiven(s) && s.status !== 'inactive'),
    silinecek: sorted
      .map((s) => ({ student: s, reason: staleReason(s, lastLessons.get(s.id)) }))
      .filter((x) => x.reason)
  };
}

// Google hesapları zaten doğrulanmış sayılır; e-posta/şifre kayıtlarında öğrenci bağlantıya tıklayınca
// profiline "emailVerified: true" yazılır.
export const emailVerified = (s) => s.emailVerified === true || s.provider === 'google.com';

export const UNVERIFIED_WARNING = 'E-posta doğrulanmadı. Yine de onaylayabilirsin.';

export function statusBadges(s){
  const badges = [];
  if(s.status === 'inactive') badges.push(['Pasif', 'muted']);
  else if(s.status === 'pending') badges.push(['Onay bekliyor', 'warning']);
  else if(isEnabled(s)) badges.push(['Aktif', 'success']);
  if(s.minor) badges.push(['16 yaş altı', '']);
  if(s.minor && !consentGiven(s)) badges.push(['Veli onayı bekleniyor', 'warning']);
  badges.push(emailVerified(s) ? ['E-posta doğrulandı', 'success'] : ['E-posta doğrulanmadı', 'warning']);
  return h('span', { class: 'acc-badges' }, badges.map(([text, type]) => h('span', { class: `acc-badge ${type}` }, text)));
}

const userRef = (uid) => fs.doc(db, 'users', uid);

export const approve = (uid) => fs.updateDoc(userRef(uid), { status: 'active', approvedAt: fs.serverTimestamp() });
export const setActive = (uid) => fs.updateDoc(userRef(uid), { status: 'active' });
export const setInactive = (uid) => fs.updateDoc(userRef(uid), { status: 'inactive' });
export const updateParent = (uid, parent) => fs.updateDoc(userRef(uid), { parent });

// Veli onayı: onayın alındığı tarih ve yöntem (imzalı form / velinin e-postası) kaydedilir.
export function recordConsent(uid, { date, method }){
  return fs.updateDoc(userRef(uid), {
    parentConsent: { given: true, at: fs.Timestamp.fromDate(date), method, recordedAt: fs.serverTimestamp() }
  });
}

const SUBCOLLECTIONS = ['results', 'assignments', 'resources', 'lessons'];

// Öğrencinin Firestore'daki bütün verilerini siler. Önce silme işareti yazılır ki
// silme yarıda kalsa bile aynı hesap yeniden profil açamasın.
export async function deleteStudentData(uid){
  await fs.setDoc(fs.doc(db, 'deleted', uid), { at: fs.serverTimestamp() });
  for(const name of SUBCOLLECTIONS){
    const snap = await fs.getDocs(fs.collection(db, 'users', uid, name));
    for(let i = 0; i < snap.docs.length; i += 400){
      const batch = fs.writeBatch(db);
      snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }
  await fs.deleteDoc(userRef(uid));
}

function copyButton(value){
  const button = h('button', { class: 'btn ghost acc-copy', type: 'button' }, 'Kopyala');
  button.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(value);
      button.textContent = 'Kopyalandı';
    }catch(_){
      button.textContent = 'Kopyalanamadı';
    }
  });
  return button;
}

// Silme onayı ve silme sonrası "giriş hesabını Firebase Console'dan sil" talimatı.
// onDone(student) silme bitince çağrılır.
export function openDeleteDialog(dialog, student, { reason = '', onDone } = {}){
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const confirmBtn = h('button', { class: 'btn danger', type: 'button' }, 'Evet, kalıcı olarak sil');
  const cancelBtn = h('button', { class: 'btn ghost', type: 'button' }, 'Vazgeç');
  cancelBtn.addEventListener('click', () => dialog.close());

  dialog.replaceChildren(h('div', { class: 'acc-dialog-body' },
    h('h2', { id: 'deleteDialogTitle' }, `${student.name} silinsin mi?`),
    reason ? h('p', {}, reason) : null,
    h('p', {}, 'Şunlar kalıcı olarak silinir: profil, ' + (student.minor ? 'veli bilgileri ve veli onayı, ' : '') + 'alıştırma sonuçları, ödevler, kaynaklar ve dersler. Bu işlem geri alınamaz.'),
    status,
    h('div', { class: 'acc-actions' }, confirmBtn, cancelBtn)
  ));

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;
    status.hidden = false;
    status.className = 'acc-status';
    status.textContent = 'Siliniyor…';
    try{
      await deleteStudentData(student.id);
      showDeleted(dialog, student);
      onDone?.(student);
    }catch(error){
      console.error(error);
      status.className = 'acc-status error';
      status.textContent = 'Silme tamamlanamadı. Tekrar dene; aynı veriler yeniden silinmeye çalışılır.';
      confirmBtn.disabled = false;
      cancelBtn.disabled = false;
    }
  });
  dialog.showModal();
}

function showDeleted(dialog, student){
  const consoleUrl = `https://console.firebase.google.com/project/${encodeURIComponent(projectId)}/authentication/users`;
  const closeBtn = h('button', { class: 'btn primary', type: 'button' }, 'Tamam');
  closeBtn.addEventListener('click', () => dialog.close());
  dialog.replaceChildren(h('div', { class: 'acc-dialog-body' },
    h('h2', { id: 'deleteDialogTitle' }, `${student.name} silindi`),
    h('p', {}, 'Firestore’daki bütün verileri silindi.'),
    h('p', {}, h('strong', {}, 'Son adım: '), 'Giriş hesabını Firebase Console’dan sil. Authentication → Users → e-postayı bul → ⋮ → “Hesabı sil”.'),
    h('dl', { class: 'acc-dl' },
      h('div', {}, h('dt', {}, 'E-posta'), h('dd', { class: 'acc-copy-row' }, h('code', {}, student.email), copyButton(student.email))),
      h('div', {}, h('dt', {}, 'UID'), h('dd', { class: 'acc-copy-row' }, h('code', {}, student.id), copyButton(student.id)))
    ),
    h('p', { class: 'acc-hint' }, 'Gmail’in “Gönderilenler” klasöründe bu öğrenciye ya da velisine giden e-postalar varsa onları da elle sil.'),
    h('div', { class: 'acc-actions' },
      h('a', { class: 'btn ghost', href: consoleUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Firebase Console’u aç'),
      closeBtn)
  ));
}
