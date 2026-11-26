// Ödev asistanı (ogretmen-odev.html): yapay zekâ yok, her şey tarayıcıda hesaplanır. Bu dosyada DOM ve Firebase yok;
// node --test tests/odev-asistani.test.mjs ile sınanır. Veriler: data/catalog.json (konu adları, açıklamalar),
// data/search-index.json (paketler, dosyadaki sırayla), öğrencinin sonuçları (results) ve önceki ödevleri (assignments).
// Asistan hiçbir şeyi kendiliğinden forma eklemez; yalnızca öneri listesi verir.

// "Relativsätze" → "relativsaetze", "Präteritum" → "praeteritum", "Şimdiki" → "simdiki".
export function normalize(value){
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export const words = (value) => normalize(value).split(' ').filter(Boolean);

// Bir arama kelimesi bir metin kelimesine uyuyor mu? 0: hayır, 1: içinde geçiyor, 2: ortak kök, 3: kelime başı / aynı.
// Ortak kök: "relativsatz" ↔ "relativsaetze" (Almanca çoğul ve umlaut farkları), en az 5 harf.
function wordMatch(q, w){
  if(w === q || w.startsWith(q)) return 3;
  let common = 0;
  while(common < q.length && common < w.length && q[common] === w[common]) common++;
  if(common >= 5 && common >= Math.min(q.length, w.length) - 3) return 2;
  if(q.length >= 4 && w.includes(q)) return 1;
  return 0;
}

// Arama kelimelerinin hepsi metinde geçmeli; dönüş 0 (yok) ya da 1..3 (en zayıf eşleşme).
function textMatch(queryWords, textWords){
  let worst = 3;
  for(const q of queryWords){
    let best = 0;
    for(const w of textWords){
      best = Math.max(best, wordMatch(q, w));
      if(best === 3) break;
    }
    if(!best) return 0;
    worst = Math.min(worst, best);
  }
  return worst;
}

const loc = (value) => (value == null ? [] : typeof value === 'string' ? [value] : Object.values(value));

// Konular: [{ level, topic, title, haystack: { title, id, description }, exercises: [{ id, title, words }] }].
// levels: data/catalog.json → levels; searchIndex: data/search-index.json (paketler dosyadaki sırayla).
export function buildTopicIndex(levels, searchIndex){
  const byTopic = new Map();
  for(const e of searchIndex?.exercises || []){
    const k = `${e.level}/${e.topic}`;
    if(!byTopic.has(k)) byTopic.set(k, []);
    byTopic.get(k).push({ id: e.id, title: e.title, words: words(e.title) });
  }
  const list = [];
  for(const level of levels || []) for(const t of level.topics || []){
    if(!t.path) continue;
    list.push({
      level: level.id,
      topic: t.id,
      title: typeof t.title === 'string' ? t.title : (t.title?.tr || t.title?.de || t.id),
      haystack: {
        title: words(loc(t.title).join(' ')),
        id: words(t.id.replace(/-/g, ' ')),
        description: words(loc(t.description).join(' '))
      },
      exercises: byTopic.get(`${level.id}/${t.id}`) || []
    });
  }
  return list;
}

// Konu araması: konu adı > konu kimliği > paket adı > açıklama. Paket adlarında geçenler "matches" olarak döner.
// Dönüş: [{ ...konu, score, matches: [paket id] }], en iyi eşleşme önce; aynı puanda seviye sırası korunur.
export function searchTopics(index, query, { limit = 6, level = '' } = {}){
  const q = words(query);
  if(!q.length || q.join('').length < 2) return [];
  const out = [];
  index.forEach((t, order) => {
    const title = textMatch(q, t.haystack.title);
    const id = textMatch(q, t.haystack.id);
    const description = textMatch(q, t.haystack.description);
    const matches = t.exercises.filter((e) => textMatch(q, e.words)).map((e) => e.id);
    const score = Math.max(title * 10, id * 8, matches.length ? 6 + Math.min(matches.length, 6) / 10 : 0, description * 2);
    if(!score) return;
    out.push({ ...t, score: score + (level && t.level === level ? 0.5 : 0), matches, order });
  });
  out.sort((a, b) => b.score - a.score || a.order - b.order);
  return out.slice(0, limit).map(({ order, ...t }) => t);
}

const exKey = (level, topic, exercise) => `${level}/${topic}/${exercise}`;

// Öğrencinin geçmişi: çözdüğü (results) ve kendisine verilmiş (assignments: tek paketler ve konunun tamamı) paketler.
export function studentHistory(results = [], assignments = []){
  const solved = new Set();
  for(const r of results){
    if(!r?.level || !r?.topic || !r?.exercise) continue;
    solved.add(exKey(r.level, r.topic, r.exercise));
    // Sınav setlerinde sonucun seviyesi sınavın kimliği (a1, a2-b1), ödevdeki seviye katalog seviyesi (A1): kimlik yeterli.
    if(r.topic === 'sinav') solved.add(exKey('*', r.topic, r.exercise));
  }
  const assigned = new Set();
  const assignedTopics = new Set();
  for(const a of assignments){
    for(const e of a?.exercises || []) if(e?.level && e?.topic && e?.exercise) assigned.add(exKey(e.level, e.topic, e.exercise));
    for(const t of a?.topics || []) if(t?.level && t?.topic) assignedTopics.add(`${t.level}/${t.topic}`);
  }
  return { solved, assigned, assignedTopics };
}

// Bir paketin bir öğrenci için durumu: 'solved' | 'assigned' | null.
export function exerciseState(history, level, topic, exercise){
  if(history.solved.has(exKey(level, topic, exercise)) || (topic === 'sinav' && history.solved.has(exKey('*', topic, exercise)))) return 'solved';
  if(history.assigned.has(exKey(level, topic, exercise)) || history.assignedTopics.has(`${level}/${topic}`)) return 'assigned';
  return null;
}

// Sıradaki paketler: konunun sırasıyla, seçili öğrencilerin hiçbirinin çözmediği ve hiçbirine verilmemiş, formda da
// olmayan ilk "count" paket. histories: öğrenci başına studentHistory; skip: formdaki paketlerin anahtarları.
export function nextExercises(topic, histories, { count = 3, skip = new Set() } = {}){
  const out = [];
  for(const e of topic.exercises){
    if(out.length >= count) break;
    if(skip.has(exKey(topic.level, topic.topic, e.id))) continue;
    if(histories.some((hst) => exerciseState(hst, topic.level, topic.topic, e.id))) continue;
    out.push(e);
  }
  return out;
}

// Bir konuda seçili öğrencilerin kaçının kaç paketi çözdüğü ("12/30 paket çözüldü"): tek öğrenci için anlamlı.
export function topicProgress(topic, history){
  const solved = topic.exercises.filter((e) => history.solved.has(exKey(topic.level, topic.topic, e.id))).length;
  return { solved, total: topic.exercises.length };
}

// Hedef sınav (users/{uid}.targetExam = { exam, level }): sıradaki Lesen seti ve Schreiben görevi -------------------

// Set numarası: "set-3" → 3.
const setNumber = (set) => Number(/(\d+)$/.exec(set || '')?.[1]) || 0;

// Sıra (a): önce bütün Teil'ler aynı setten (T1S1 → T2S1 → … → T1S2 …).
export function examOrder(items){
  return [...items].sort((a, b) => setNumber(a.set) - setNumber(b.set) || a.teil - b.teil);
}

// Hedef sınavın Lesen setleri (examSets çıktısından) ve Schreiben görevleri (writingTasks çıktısından), sırayla.
export function examTrack(target, { sets = [], tasks = [] } = {}){
  if(!target?.exam || !target?.level) return { lesen: [], schreiben: [] };
  const same = (x) => x.exam === target.exam && x.level === target.level;
  return {
    lesen: examOrder(sets.filter((s) => same(s) && s.section === 'lesen')),
    schreiben: examOrder(tasks.filter(same))
  };
}

// Sınav ödevlerinin geçmişi: verilen (ödevdeki "sinav"/"schreiben" paketleri, verildiği tarihle), çözülen Lesen setleri
// (results, konu "sinav") ve yazılan Schreiben görevleri (writings).
export function examHistory(results = [], assignments = [], writings = [], toDate = (d) => d){
  const given = new Map(); // id → en son verildiği tarih
  for(const a of assignments){
    const at = toDate(a?.createdAt) || null;
    for(const e of a?.exercises || []){
      if(e?.topic !== 'sinav' && e?.topic !== 'schreiben') continue;
      const prev = given.get(e.exercise);
      if(!prev || (at && at > prev)) given.set(e.exercise, at);
    }
  }
  const solved = new Set(results.filter((r) => r?.topic === 'sinav' && r.exercise).map((r) => r.exercise));
  const written = new Set(writings.filter((w) => w?.exam && w?.level && w?.teil && w?.set).map((w) => `${w.exam}-${w.level}-${w.teil}-${w.set}`));
  return { given, solved, written };
}

export function examItemState(history, id){
  if(history.solved.has(id) || history.written.has(id)) return 'solved';
  if(history.given.has(id)) return 'assigned';
  return null;
}

// Sıradaki öğe (verilmemiş, çözülmemiş, formda olmayan ilk öğe) ve "son verilen" (en yeni tarihli verilen öğe).
export function nextExamItem(items, history, skip = new Set()){
  const next = items.find((x) => !skip.has(x.id) && !examItemState(history, x.id)) || null;
  let last = null;
  for(const x of items){
    if(!history.given.has(x.id)) continue;
    const at = history.given.get(x.id);
    if(!last || (at && (!last.at || at > last.at))) last = { item: x, at };
  }
  return { next, last };
}

// Hedef sınav seçenekleri: yakında olmayan sınavların, Lesen seti ya da Schreiben görevi olan seviyeleri.
// data: window.BA_EXAMS. Dönüş: [{ exam, level, label }] ("Goethe B1", "telc B2", "DTZ", "TestDaF digital").
export function examTargets(data, { sets = [], tasks = [] } = {}){
  const out = [];
  for(const exam of data?.exams || []){
    if(exam.comingSoon) continue;
    for(const level of exam.levels || []){
      const has = (x) => x.exam === exam.id && x.level === level.id;
      if(!sets.some((s) => has(s) && s.section === 'lesen') && !tasks.some(has)) continue;
      const name = exam.shortName || String(exam.name || exam.id).replace(/-Zertifikat$/, '').replace(/ Deutsch$/, '');
      const code = level.code || data.levels?.[level.id]?.code || level.id.toUpperCase();
      const codeText = typeof code === 'string' ? code : (code.tr || code.de || level.id.toUpperCase());
      out.push({ exam: exam.id, level: level.id, label: exam.skipLevel ? name : `${name} ${codeText}` });
    }
  }
  return out;
}

// Kaynak kütüphanesi: dosya adından seviye ve konu önerisi --------------------------------------------------------
// "B1_Relativsatz_Übung-3.pdf" → { level: 'B1', topics: [{ level: 'B1', topic: 'relativsaetze' }] }. Öğretmen değiştirebilir.
const FILE_STOP = new Set(['pdf', 'uebung', 'uebungen', 'ubung', 'arbeitsblatt', 'arbeitsblaetter', 'aufgabe', 'aufgaben', 'loesung', 'loesungen',
  'test', 'teil', 'seite', 'kopie', 'copy', 'final', 'neu', 'scan', 'worksheet', 'exercise', 'exercises', 'alistirma', 'alistirmalar', 'calisma',
  'kagidi', 'tekrar', 'ders', 'deutsch', 'almanca', 'grammatik', 'gramer', 'grammar', 'mit', 'und', 'der', 'die', 'das', 'ile', 've', 'zum', 'zur']);
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

export function suggestTags(fileName, index){
  const base = String(fileName || '').replace(/\.pdf$/i, '');
  // Seviye: "B1", "b1-", "_A2_" (harf ve rakam bitişik, çevresinde harf/rakam yok).
  const levelMatch = /(?:^|[^a-z0-9])([abc][12])(?=[^a-z0-9]|$)/i.exec(base.replace(/_/g, ' '));
  const level = levelMatch && LEVELS.includes(levelMatch[1].toUpperCase()) ? levelMatch[1].toUpperCase() : '';
  // CamelCase ayrılır: "RelativsatzUebung" → "Relativsatz Uebung".
  const tokens = words(base.replace(/([a-zäöüß])([A-ZÄÖÜ])/g, '$1 $2')).filter((w) => w.length >= 4 && !FILE_STOP.has(w) && !/^\d+$/.test(w) && !/^[abc][12]$/.test(w));
  const scored = new Map();
  for(const w of tokens){
    for(const t of searchTopics(index, w, { limit: 4, level })){
      if(t.score < 10) continue; // yalnızca konu adı ya da kimliği (paket adları gürültülü)
      const key = `${t.level}/${t.topic}`;
      const score = t.score + (level && t.level === level ? 5 : 0);
      if(!scored.has(key) || scored.get(key).score < score) scored.set(key, { level: t.level, topic: t.topic, title: t.title, score });
    }
  }
  const topics = [...scored.values()].sort((a, b) => b.score - a.score).slice(0, 2).map(({ level: l, topic, title }) => ({ level: l, topic, title }));
  return { level: level || topics[0]?.level || '', topics };
}

// Kütüphanedeki PDF'lerden bir konuya etiketlenmiş olanlar.
export const libraryFor = (library, level, topic) => library.filter((item) => (item.topics || []).some((t) => t.level === level && t.topic === topic));

// Ders defteri → ödev: not başlığı ve metninden konular ---------------------------------------------------------------
// Her anlamlı kelime (en az 4 harf, sık geçen genel kelimeler hariç) konu adı ya da kimliğinde aranır; bir konunun puanı
// eşleşmelerin toplamı (başlıktaki kelimeler iki kat sayılır). Dönüş: en çok "limit" konu, en güçlüsü önce.
const NOTE_STOP = new Set([...FILE_STOP, 'heute', 'morgen', 'hausaufgabe', 'hausaufgaben', 'odev', 'ders', 'dersi', 'bugun', 'tekrar', 'konu',
  'notlar', 'notu', 'beispiel', 'beispiele', 'ornek', 'ornekler', 'satz', 'saetze', 'wort', 'woerter', 'kelime', 'kelimeler', 'sein', 'haben',
  'werden', 'nicht', 'eine', 'einen', 'einem', 'einer', 'ist', 'sind', 'hat', 'auch', 'aber', 'oder', 'wenn', 'dass', 'weil', 'sehr', 'bitte',
  'danke', 'hier', 'dort', 'jetzt', 'immer', 'noch', 'schon', 'bir', 'icin', 'gibi', 'daha', 'cok', 'olan', 'olarak', 'sonra', 'once']);
const MAX_NOTE_WORDS = 600;

export function topicsFromText(title, text, index, { limit = 3 } = {}){
  const counts = new Map();
  const add = (value, weight) => {
    for(const w of words(String(value || '').replace(/([a-zäöüß])([A-ZÄÖÜ])/g, '$1 $2'))){
      if(w.length < 4 || NOTE_STOP.has(w) || /^\d+$/.test(w)) continue;
      if(!counts.has(w) && counts.size >= MAX_NOTE_WORDS) continue;
      counts.set(w, (counts.get(w) || 0) + weight);
    }
  };
  add(title, 2);
  add(text, 1);
  const scored = new Map();
  for(const [w, n] of counts){
    for(const t of searchTopics(index, w, { limit: 3 })){
      if(t.score < 20) continue; // yalnızca konu adında ya da kimliğinde tam/kök eşleşme
      const key = `${t.level}/${t.topic}`;
      const prev = scored.get(key) || { level: t.level, topic: t.topic, title: t.title, score: 0 };
      prev.score += Math.min(n, 5) * (t.score / 10);
      scored.set(key, prev);
    }
  }
  return [...scored.values()].sort((a, b) => b.score - a.score).slice(0, limit).map(({ level, topic, title: tt }) => ({ level, topic, title: tt }));
}
