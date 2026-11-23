// Ders defteri verisi: users/{uid}/lessonNotes/{noteId}. Yalnızca öğretmen yazar; öğrenci kendi notlarını okur
// (firestore.rules). Alanlar:
//   title     başlık (en çok 120 karakter), varsayılan "23.11.2026 – Ders"
//   day       Berlin günü "YYYY-MM-DD" (sıralama ve takvim bağlantısı için)
//   lessonId  takvimdeki ders (users/{uid}/lessons/{id}) ya da null
//   content   Quill Delta, JSON metni (js/account/note-format.js; en çok ~1.000.000 bayt)
//   bytes     yaklaşık boyut, rev her kayıtta +1, createdAt, updatedAt
// Belge ilk yazıda oluşur (boş sayfalar birikmesin). Öğrenci silinince notlar da silinir (teacher-common.js).
import { db, fs } from './firebase.js';
import { toDate } from './common.js';

export const notesOf = (uid) => fs.collection(db, 'users', uid, 'lessonNotes');
export const noteRef = (uid, id) => fs.doc(db, 'users', uid, 'lessonNotes', id);
export const newNoteId = (uid) => fs.doc(notesOf(uid)).id;

const shape = (d) => {
  const data = d.data() || {};
  return { id: d.id, ...data, createdAt: toDate(data.createdAt), updatedAt: toDate(data.updatedAt) };
};

// En yeni gün önce; aynı gündekiler son güncellemeye göre. Tek alanlı sıralama: ek indeks gerekmez.
export async function loadNotes(uid){
  const snap = await fs.getDocs(fs.query(notesOf(uid), fs.orderBy('day', 'desc')));
  return snap.docs.map(shape).sort((a, b) => (b.day || '').localeCompare(a.day || '') || (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
}

export async function loadNote(uid, id){
  const snap = await fs.getDoc(noteRef(uid, id));
  return snap.exists() ? shape(snap) : null;
}

export async function findNoteForLesson(uid, lessonId){
  const snap = await fs.getDocs(fs.query(notesOf(uid), fs.where('lessonId', '==', lessonId), fs.limit(1)));
  return snap.empty ? null : shape(snap.docs[0]);
}

export const deleteNote = (uid, id) => fs.deleteDoc(noteRef(uid, id));

// Öğrencinin ekranında "Canlı" rozeti: son 3 dakikada güncellendiyse.
export const LIVE_MS = 3 * 60 * 1000;
export const isLive = (note, now = Date.now()) => Boolean(note?.updatedAt && now - note.updatedAt.getTime() < LIVE_MS);

// Öğretmenin tarayıcısındaki yedek: kaydedilmemiş değişiklikler sunucu onaylayana kadar burada durur.
const BACKUP_PREFIX = 'baDersDefteri:';
export const backupKey = (uid, id) => `${BACKUP_PREFIX}${uid}:${id}`;

export function readBackup(uid, id){
  try{
    const raw = localStorage.getItem(backupKey(uid, id));
    const data = raw ? JSON.parse(raw) : null;
    return data && data.v === 1 && Array.isArray(data.ops) ? data : null;
  }catch(_){
    return null;
  }
}

export function writeBackup(uid, id, data){
  try{
    localStorage.setItem(backupKey(uid, id), JSON.stringify({ v: 1, ...data, at: Date.now() }));
    return true;
  }catch(error){
    console.warn('Yerel yedek yazılamadı', error);
    return false;
  }
}

export function removeBackup(uid, id){
  try{ localStorage.removeItem(backupKey(uid, id)); }catch(_){}
}

// Öğrencinin bütün yedekleri (öğrenci sayfasında "kaydedilmemiş not" uyarısı için).
export function backupsFor(uid){
  const out = [];
  try{
    const prefix = `${BACKUP_PREFIX}${uid}:`;
    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      if(!key?.startsWith(prefix)) continue;
      const id = key.slice(prefix.length);
      const data = readBackup(uid, id);
      if(data) out.push({ id, ...data });
    }
  }catch(_){}
  return out;
}

export function noteUrl(uid, id, extra = {}){
  const params = new URLSearchParams({ ogrenci: uid, ...(id ? { not: id } : {}), ...extra });
  return `ogretmen-ders.html?${params}`;
}
