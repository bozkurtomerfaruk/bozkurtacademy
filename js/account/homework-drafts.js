// Ödev taslakları (ödev asistanı): homeworkDrafts/{id}. Yalnızca öğretmen okur ve yazar (firestore.rules: genel öğretmen
// kuralı; öğrenciye hiçbir kural yok). Taslak öğrencinin assignments koleksiyonuna yazılmaz, e-posta gitmez.
// "Onayla ve gönder": tek yazmada her öğrenciye ödev kopyası (createAssignments) + taslağın silinmesi; e-posta sonra.
//
// homeworkDrafts/{id}:
//   uids: [öğrenci uid]           (en az bir)
//   title, description, dueAt, links, topics, exercises   (ödevle aynı biçim, js/account/assignments.js)
//   source: 'form' | 'ders-defteri'
//   createdAt, updatedAt
import { db, fs } from './firebase.js';
import { toDate } from './common.js';
import { createAssignments } from './teacher-common.js';

const COLLECTION = 'homeworkDrafts';
const draftRef = (id) => fs.doc(db, COLLECTION, id);

export function normalizeDraft(d){
  return {
    ...d,
    uids: Array.isArray(d.uids) ? d.uids.filter((u) => typeof u === 'string' && u) : [],
    title: d.title || '',
    description: d.description || '',
    links: Array.isArray(d.links) ? d.links : [],
    topics: Array.isArray(d.topics) ? d.topics.filter((t) => t?.level && t?.topic) : [],
    exercises: Array.isArray(d.exercises) ? d.exercises.filter((e) => e?.level && e?.topic && e?.exercise) : [],
    due: toDate(d.dueAt),
    created: toDate(d.createdAt),
    updated: toDate(d.updatedAt) || toDate(d.createdAt)
  };
}

export async function loadDrafts(){
  const snap = await fs.getDocs(fs.collection(db, COLLECTION));
  return snap.docs.map((d) => normalizeDraft({ id: d.id, ...d.data() })).sort((a, b) => (b.updated || 0) - (a.updated || 0));
}

export async function getDraft(id){
  const snap = await fs.getDoc(draftRef(id));
  return snap.exists() ? normalizeDraft({ id: snap.id, ...snap.data() }) : null;
}

// data: ödev alanları (title, description, dueAt, links, topics, exercises). Dönüş: taslak kimliği.
export async function saveDraft(id, uids, data, { source = 'form' } = {}){
  if(id){
    await fs.updateDoc(draftRef(id), { ...data, uids, updatedAt: fs.serverTimestamp() });
    return id;
  }
  const ref = fs.doc(fs.collection(db, COLLECTION));
  await fs.setDoc(ref, { ...data, uids, source, createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp() });
  return ref.id;
}

export const updateDraft = (id, fields) => fs.updateDoc(draftRef(id), { ...fields, updatedAt: fs.serverTimestamp() });
export const deleteDraft = (id) => fs.deleteDoc(draftRef(id));

// Taslaktaki ödev alanları (öğrencinin göreceği içerik).
export const draftData = (d) => ({
  title: d.title, description: d.description, dueAt: d.dueAt ?? null,
  links: d.links, topics: d.topics.map(({ level, topic }) => ({ level, topic })),
  exercises: d.exercises.map(({ level, topic, exercise }) => ({ level, topic, exercise }))
});

// Onay: ödev kopyaları ve taslağın silinmesi aynı yazmada (yarım kalmaz). Dönüş: [{ uid, id }] e-posta için.
export async function approveDraft(id, uids, data){
  const { copies } = await createAssignments(uids, data, undefined, { onBatch: (batch) => batch.delete(draftRef(id)) });
  return copies;
}

// Taslak boş mu (gönderilecek bir şey yok)?
export const draftEmpty = (d) => !d.exercises.length && !d.topics.length && !d.links.length && !d.description;
