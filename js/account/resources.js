// Yardımcı kaynaklar: users/{uid}/resources/{id}. Öğretmen ekler ve siler; onaylı öğrenci kendi kaynaklarını okur.
// Biçim:
//   title, url (https), note, createdAt                  (eski kayıtlar yalnızca bunlardan oluşur → bağlantı)
//   kind: 'link' | 'pdf'                                 (yeni kayıtlar)
//   fileId, fileName                                     (PDF: öğretmenin Google Drive'ındaki dosya, js/account/drive.js)
//   groupId                                              (aynı kaynağın öğrenci başına kopyaları aynı groupId'yi taşır)
// Eski kayıtlar hiç yeniden yazılmaz; okurken bağlantı sayılır. Kaynak silinince PDF Drive'da kalır.
import { db, fs } from './firebase.js';
import { h } from './common.js';

export const MAX_TITLE = 120;
export const MAX_NOTE = 500;

export function normalizeResource(r){
  const url = typeof r.url === 'string' ? r.url : '';
  const kind = r.kind === 'pdf' ? 'pdf' : 'link';
  return { ...r, kind, url, title: String(r.title || url || '').slice(0, 200), note: String(r.note || '') };
}

const time = (r) => r.createdAt?.toMillis?.() || 0;

export async function loadResourceList(uid){
  const snap = await fs.getDocs(fs.collection(db, 'users', uid, 'resources'));
  return snap.docs.map((d) => normalizeResource({ id: d.id, ...d.data() })).sort((a, b) => time(b) - time(a));
}

// Öğretmen: aynı kaynağın kaç öğrenciye verildiği (groupId → sayı). Filtresiz collectionGroup (ek indeks gerekmez).
export async function groupCounts(){
  const snap = await fs.getDocs(fs.collectionGroup(db, 'resources'));
  const counts = new Map();
  for(const d of snap.docs){
    const g = d.data().groupId;
    if(g) counts.set(g, (counts.get(g) || 0) + 1);
  }
  return counts;
}

// Seçilen her öğrenciye ayrı kopya, tek toplu yazmayla (hepsi ya da hiçbiri). PDF önceden bir kez yüklenmiş olur.
export async function addResourceCopies(studentIds, { title, url, note, kind, fileId = null, fileName = null }){
  const groupId = crypto.randomUUID();
  const batch = fs.writeBatch(db);
  for(const uid of studentIds){
    const data = { title, url, note, kind, groupId, createdAt: fs.serverTimestamp() };
    if(kind === 'pdf'){ data.fileId = fileId; data.fileName = fileName; }
    batch.set(fs.doc(fs.collection(db, 'users', uid, 'resources')), data);
  }
  await batch.commit();
  return groupId;
}

export const deleteResourceCopy = (uid, id) => fs.deleteDoc(fs.doc(db, 'users', uid, 'resources', id));

const SVG = 'http://www.w3.org/2000/svg';
function icon(kind){
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', `acc-res-icon acc-res-icon-${kind}`);
  const path = document.createElementNS(SVG, 'path');
  if(kind === 'pdf'){
    path.setAttribute('d', 'M6 2h8l6 6v14H6z M14 2v6h6');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.8');
    path.setAttribute('stroke-linejoin', 'round');
    const text = document.createElementNS(SVG, 'text');
    text.setAttribute('x', '13');
    text.setAttribute('y', '18.5');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-size', '6.2');
    text.setAttribute('font-weight', '700');
    text.setAttribute('fill', 'currentColor');
    text.setAttribute('font-family', 'sans-serif');
    text.textContent = 'PDF';
    svg.append(path, text);
  }else{
    path.setAttribute('d', 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-linecap', 'round');
    svg.append(path);
  }
  return svg;
}

// Listede bir kaynak: simge + başlık (yeni sekmede, noopener noreferrer) + not. Yalnızca https bağlantı olur.
export function resourceItem(r, { pdfLabel = 'PDF', extra = [] } = {}){
  const ok = /^https:\/\//i.test(r.url);
  const label = h('span', { class: 'acc-res-title' }, r.title);
  const main = ok
    ? h('a', { class: 'acc-res-link', href: r.url, target: '_blank', rel: 'noopener noreferrer' }, icon(r.kind), label,
      r.kind === 'pdf' ? h('span', { class: 'visually-hidden' }, ` (${pdfLabel})`) : null)
    : h('span', { class: 'acc-res-link' }, icon(r.kind), label);
  return h('div', { class: 'acc-res-main' }, main,
    r.note ? h('span', { class: 'acc-sub' }, r.note) : null,
    ...extra);
}
