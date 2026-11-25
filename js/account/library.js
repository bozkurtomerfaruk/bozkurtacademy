// Kaynak kütüphanesi (ogretmen-kutuphane.html): öğretmenin ek alıştırma PDF'leri. library/{id}, yalnızca öğretmen okur
// ve yazar (firestore.rules: genel öğretmen kuralı; öğrenciye kural yok). PDF'ler Drive'da "Bozkurt Academy Kütüphane"
// klasörüne gizli yüklenir; "bağlantıya sahip olan görüntüleyebilir" izni ancak PDF bir ödeve (onaylanınca) ya da
// yardımcı kaynaklara eklenince verilir ve shared: true yazılır. Ödevden çıkarılınca izin geri alınmaz (başka
// öğrencide kullanılıyor olabilir). Kayıt silinince dosya Drive'da kalır.
//
// library/{id}: fileId, fileName, title, level ('A1' … 'C1' | ''), topics: [{ level, topic }] (en çok 3),
//               bytes, shared (bool), sharedAt, createdAt, updatedAt
import { db, fs } from './firebase.js';
import { toDate } from './common.js';
import * as drive from './drive.js?v=3';

const COLLECTION = 'library';
export const MAX_TOPICS = 3;
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export const libraryUrl = (item) => drive.fileUrl(item.fileId);

export function normalizeItem(d){
  return {
    ...d,
    title: d.title || (d.fileName || '').replace(/\.pdf$/i, ''),
    level: LEVELS.includes(d.level) ? d.level : '',
    topics: Array.isArray(d.topics) ? d.topics.filter((t) => t?.level && t?.topic).slice(0, MAX_TOPICS) : [],
    shared: d.shared === true,
    created: toDate(d.createdAt)
  };
}

export async function loadLibrary(){
  const snap = await fs.getDocs(fs.collection(db, COLLECTION));
  return snap.docs.map((d) => normalizeItem({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.level || 'Z').localeCompare(b.level || 'Z') || a.title.localeCompare(b.title, 'tr'));
}

export async function addLibraryItem({ fileId, fileName, title, level, topics, bytes }){
  const ref = fs.doc(fs.collection(db, COLLECTION));
  const data = {
    fileId, fileName, title: String(title || fileName).slice(0, 120), level: LEVELS.includes(level) ? level : '',
    topics: (topics || []).slice(0, MAX_TOPICS).map(({ level: l, topic }) => ({ level: l, topic })),
    bytes: Number(bytes) || 0, shared: false, createdAt: fs.serverTimestamp(), updatedAt: fs.serverTimestamp()
  };
  await fs.setDoc(ref, data);
  return normalizeItem({ id: ref.id, ...data, createdAt: new Date() });
}

export const updateLibraryItem = (id, fields) => fs.updateDoc(fs.doc(db, COLLECTION, id), { ...fields, updatedAt: fs.serverTimestamp() });
export const deleteLibraryItem = (id) => fs.deleteDoc(fs.doc(db, COLLECTION, id));

// Bağlantılar arasında kütüphaneden gelen ve henüz paylaşılmamış PDF'ler (Drive bağlantısından fileId ile).
export function unsharedIn(links, library){
  const urls = new Set(links.map((l) => l.url));
  return library.filter((item) => !item.shared && urls.has(libraryUrl(item)));
}

// Paylaşma: önce Drive izni, sonra shared: true. Öğretmenin tıklamasıyla çağrılmalı (Google izin penceresi).
// Bir dosya paylaşılamazsa hata fırlatır; ödev/kaynak kaydedilmeden durulur (öğrenci açamayacağı bağlantı almasın).
export async function shareItems(items){
  if(!items.length) return;
  if(!drive.isConnected()) await drive.connect();
  for(const item of items){
    await drive.sharePdf(item.fileId);
    await updateLibraryItem(item.id, { shared: true, sharedAt: fs.serverTimestamp() });
    item.shared = true;
  }
}
