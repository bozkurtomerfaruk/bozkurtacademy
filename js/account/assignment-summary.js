// Ödev kartları (öğretmen paneli "Ödevler" sekmesi, ogretmen-odevler.html): öğrenci adları ve kısa içerik özeti.
// DOM ve Firebase yok; node --test tests/odev-kart.test.mjs ile sınanır.

// "Deniz Kaya" · "Deniz Kaya ve Arda Can" · "Arda Can, Deniz Kaya ve Ece Bekler" · "Arda Can, Deniz Kaya ve 2 kişi daha".
// Üç ada kadar hepsi yazılır; daha fazlasında ilk iki ad ve kalan sayı (tamamı kartın "Ayrıntılar" bölümünde).
export function studentNamesText(names){
  const list = names.filter(Boolean);
  if(list.length <= 1) return list[0] || '';
  if(list.length <= 3) return `${list.slice(0, -1).join(', ')} ve ${list[list.length - 1]}`;
  return `${list.slice(0, 2).join(', ')} ve ${list.length - 2} kişi daha`;
}

const EXAMS = { goethe: 'Goethe', telc: 'telc', dtz: 'DTZ', testdaf: 'TestDaF', oesd: 'ÖSD' };
const SECTIONS = { lesen: 'Lesen', hoeren: 'Hören', sprachbausteine: 'Sprachbausteine', schreiben: 'Schreiben', sprechen: 'Sprechen' };
const SINAV_RE = /^([a-z]+)-([a-z0-9]+(?:-[a-z0-9]+)?)-(hoeren|lesen|sprachbausteine|schreiben|sprechen)-(\d+)-set-(\d+)$/;
const WRITING_RE = /^([a-z]+)-([a-z0-9]+(?:-[a-z0-9]+)?)-(\d+)-set-(\d+)$/;

// "Goethe B1" · "DTZ" (seviye kimliği a2-b1 sınavın kendisi) · "TestDaF digital".
function examLabel(exam, level){
  const name = EXAMS[exam] || exam;
  if(exam === 'dtz') return name;
  return `${name} ${/^[abc][12]$/.test(level) ? level.toUpperCase() : level}`;
}

// "goethe-b1-lesen-2-set-3" → "Goethe B1 Lesen Teil 2 Set 3"; "goethe-b1-1-set-2" (Schreiben) → "Goethe B1 Schreiben Teil 1 Set 2".
export function examItemLabel(topic, exercise){
  if(topic === 'sinav'){
    const m = SINAV_RE.exec(exercise || '');
    return m ? `${examLabel(m[1], m[2])} ${SECTIONS[m[3]]} Teil ${m[4]} Set ${m[5]}` : exercise;
  }
  const m = WRITING_RE.exec(exercise || '');
  return m ? `${examLabel(m[1], m[2])} Schreiben Teil ${m[3]} Set ${m[4]}` : exercise;
}

const LINK_WORDS = { pdf: 'PDF', youtube: 'video', docs: 'doküman', drive: 'Drive dosyası', web: 'bağlantı' };
const MAX_TOPICS = 2;
const MAX_EXAMS = 2;

// Kısa içerik özeti: "lassen + Infinitiv · 3 paket · Goethe B1 Lesen Teil 2 Set 3 · 1 PDF".
// a: normalizeAssignment çıktısı (topics, exercises, links). topicTitle(level, topic): katalogdaki konu adı.
export function assignmentSummary(a, topicTitle = (level, topic) => topic){
  const parts = [];
  // Konular: konunun tamamı verilenler ve tek tek seçilen gramer paketlerinin konuları (sırayla, tekrarsız).
  const grammar = (a.exercises || []).filter((e) => !['sinav', 'schreiben', 'seviye-sonu'].includes(e.topic));
  const topicKeys = [];
  for(const t of [...(a.topics || []), ...grammar]){
    const key = `${t.level}/${t.topic}`;
    if(!topicKeys.includes(key)) topicKeys.push(key);
  }
  const names = topicKeys.map((k) => { const [level, topic] = k.split('/'); return topicTitle(level, topic) || topic; });
  if(names.length) parts.push(names.length > MAX_TOPICS ? `${names.slice(0, MAX_TOPICS).join(', ')} +${names.length - MAX_TOPICS} konu` : names.join(', '));
  const whole = (a.topics || []).length;
  if(whole) parts.push(whole === 1 ? 'konunun tamamı' : `${whole} konunun tamamı`);
  if(grammar.length) parts.push(`${grammar.length} paket`);
  const exams = (a.exercises || []).filter((e) => e.topic === 'sinav' || e.topic === 'schreiben').map((e) => examItemLabel(e.topic, e.exercise));
  if(exams.length) parts.push(exams.length > MAX_EXAMS ? `${exams.slice(0, MAX_EXAMS).join(', ')} +${exams.length - MAX_EXAMS} sınav görevi` : exams.join(', '));
  for(const e of (a.exercises || []).filter((x) => x.topic === 'seviye-sonu')) parts.push(`${e.level} seviye sonu sınavı`);
  const kinds = new Map();
  for(const l of a.links || []){
    const kind = LINK_WORDS[l.kind] ? l.kind : 'web';
    kinds.set(kind, (kinds.get(kind) || 0) + 1);
  }
  for(const [kind, n] of kinds) parts.push(`${n} ${LINK_WORDS[kind]}`);
  if(!parts.length && a.description) parts.push('yalnızca açıklama');
  return parts.join(' · ');
}
