// ogretmen-odev.html: yeni ödev ve ödevi düzenleme (?duzenle=<groupId>).
// Başlık (varsayılan: bugünün tarihi), açıklama/not, isteğe bağlı teslim tarihi (Berlin), her türlü http/https bağlantı
// (Google Docs için "her öğrenciye kopya" → /copy), sitedeki alıştırmalar (tek tek ya da konunun tamamı; sınav setleri,
// Schreiben görevleri, seviye sonu sınavı) ve bir ya da birden fazla öğrenci. Veri biçimi: js/account/assignments.js.
// Ödev asistanı (js/account/homework-assistant.js): konu araması ve seçili öğrencinin sıradaki paketleri; öneriler
// yalnızca öğretmen "Ekle"ye basınca forma girer. "Taslak kaydet" → homeworkDrafts (öğrenci görmez, e-posta gitmez);
// ?taslak=<id> taslağı açar, "Onayla ve gönder" ödevi verir ve taslağı siler (js/account/homework-drafts.js).
import {
  $, berlinInputToDate, dateToBerlinInput, docsCopyUrl, exerciseNames, h, LEVEL_EXAM, levelExamTopic, loadAssignments, loadCatalogLevels, loadResults,
  loadExamsData, loadTopicExercises, loadWritings, localize, setStatus, toDate, WRITING, writingTasks, SINAV, examSets
} from './common.js';
import { fs } from './firebase.js';
import { defaultTitle, KIND_LABELS, linkKind, linkLabel, MAX_LINKS, topicTitles, validLinkUrl, wholeTopicAllowed } from './assignments.js?v=1';
import * as drive from './drive.js?v=3';
import { mailConfigured, notifyHomework, rememberResult } from './homework-mail.js?v=1';
import { createAssignments, fmtDate, isEnabled, listStudents, loadAssignmentGroups, requireTeacher, updateAssignmentGroup } from './teacher-common.js';
import {
  buildTopicIndex, examHistory, libraryFor, examItemState, examTargets, examTrack, exerciseState, nextExamItem, nextExercises, searchTopics, studentHistory, topicProgress
} from './homework-assistant.js?v=3';
import { approveDraft, getDraft, saveDraft } from './homework-drafts.js?v=1';
import { libraryUrl, loadLibrary, shareItems, unsharedIn } from './library.js?v=1';

const chosen = []; // [{ level, topic, exercise, label }]
const topics = []; // [{ level, topic, label }] konunun tamamı
const links = []; // [{ url, title, kind, copy }]
let levels = [];
let writingLevels = new Set(); // catalog levels that have Schreiben tasks (js/examsData.js)
let examLevels = new Set(); // catalog levels that have exam sets (Lesen, Hören, Sprachbausteine, form)
let editing = null; // düzenlenen ödev grubu (loadAssignmentGroups)
let draft = null; // açılan taslak (?taslak=<id>)
let studentList = []; // listStudents
let topicIndex = []; // buildTopicIndex (katalog + arama dizini)
const histories = new Map(); // uid → studentHistory (sonuçlar ve önceki ödevler; sayfa açıkken bir kez okunur)
const historyLoads = new Map(); // uid → Promise
let examSetList = []; // examSets (Lesen, Hören, Sprachbausteine, form)
let writingList = []; // writingTasks (Schreiben)
let examLabels = new Map(); // "goethe|b1" → "Goethe B1"
let library = []; // kaynak kütüphanesi (library, js/account/library.js): yalnızca öğretmen görür

const key = (e) => `${e.level}/${e.topic}/${e.exercise}`;
const topicKey = (t) => `${t.level}/${t.topic}`;
const hasTopic = (level, topic) => topics.some((t) => t.level === level && t.topic === topic);

function fillSelect(select, items){
  select.replaceChildren(...items.map(({ value, label }) => h('option', { value }, label)));
}

function renderChosen(){
  $('aChosenCount').textContent = String(chosen.length + topics.length);
  const removeButton = (label, onRemove) => {
    const b = h('button', { class: 'acc-text-button', type: 'button', 'aria-label': `${label} kaldır` }, 'Kaldır');
    b.addEventListener('click', () => { onRemove(); renderChosen(); renderExercises(); renderSuggest(); });
    return b;
  };
  const items = [
    ...topics.map((t, i) => h('li', {}, h('span', {}, h('strong', {}, t.label), ' · konunun tamamı'),
      removeButton(t.label, () => topics.splice(i, 1)))),
    ...chosen.map((e, i) => h('li', {}, h('span', {}, e.label), removeButton(e.label, () => chosen.splice(i, 1))))
  ];
  $('aChosen').replaceChildren(...(items.length ? items : [h('li', { class: 'acc-hint' }, 'Henüz alıştırma seçilmedi.')]));
}

let exercisesToken = 0;
async function renderExercises(){
  const level = $('aLevel').value;
  const topic = $('aTopic').value;
  const box = $('aExerciseList');
  const legend = box.querySelector('legend');
  const token = ++exercisesToken;
  const exercises = topic ? await loadTopicExercises(level, topic) : [];
  if(token !== exercisesToken) return;
  const topicTitle = $('aTopic').selectedOptions[0]?.textContent || topic;
  const whole = wholeTopicAllowed(topic) && hasTopic(level, topic);
  $('aWholeRow').hidden = !wholeTopicAllowed(topic) || !exercises.length;
  $('aWhole').checked = whole;
  $('aWholeCount').textContent = `(${exercises.length} paket)`;
  box.disabled = whole;
  box.replaceChildren(legend, ...(exercises.length
    ? exercises.map((ex) => {
      const item = { level, topic, exercise: ex.id, label: `${level} · ${topicTitle} · ${localize(ex.title, 'tr')}` };
      const input = h('input', { type: 'checkbox', checked: whole || chosen.some((c) => key(c) === key(item)) });
      input.addEventListener('change', () => {
        const at = chosen.findIndex((c) => key(c) === key(item));
        if(input.checked && at < 0) chosen.push(item);
        if(!input.checked && at >= 0) chosen.splice(at, 1);
        renderChosen();
        renderSuggest();
      });
      return h('label', { class: 'acc-check' }, input, h('span', {}, localize(ex.title, 'tr'), stateBadge(level, topic, ex.id)));
    })
    : [h('p', { class: 'acc-hint' }, 'Bu konuda alıştırma yok.')]));
  renderTopicLibrary();
}

function toggleWholeTopic(){
  const level = $('aLevel').value;
  const topic = $('aTopic').value;
  const at = topics.findIndex((t) => t.level === level && t.topic === topic);
  if($('aWhole').checked && at < 0){
    topics.push({ level, topic, label: `${level} · ${$('aTopic').selectedOptions[0]?.textContent || topic}` });
    // Tek tek seçilmiş paketler artık konunun içinde: listeden çıkar.
    for(let i = chosen.length - 1; i >= 0; i--) if(chosen[i].level === level && chosen[i].topic === topic) chosen.splice(i, 1);
  }
  if(!$('aWhole').checked && at >= 0) topics.splice(at, 1);
  renderChosen();
  renderExercises();
  renderSuggest();
}

function renderTopics(){
  const level = levels.find((l) => l.id === $('aLevel').value) || { id: $('aLevel').value, topics: [] };
  const list = (level?.topics || []).filter((t) => t.path);
  // The level's end-of-level test (data/catalog.json → levelExam) is chosen like a topic.
  fillSelect($('aTopic'), [
    ...list.map((t) => ({ value: t.id, label: localize(t.title, 'tr') })),
    ...(level?.levelExam ? [{ value: LEVEL_EXAM, label: levelExamTopic('tr') }] : []),
    // Sınav hazırlığındaki yazma görevleri (Schreiben): öğrenci metnini yazar, öğretmen geri bildirim verir.
    ...(writingLevels.has(level?.id) ? [{ value: WRITING, label: 'Schreiben (sınav hazırlığı)' }] : []),
    // Sınav setleri: öğrenci "Kontrol et"e basınca puanı kaydedilir; ödev bu sonuçla "çözüldü" olur.
    ...(examLevels.has(level?.id) ? [{ value: SINAV, label: 'Sınav setleri (Lesen, Hören, form doldurma …)' }] : [])
  ]);
  renderExercises();
}

// Ödev asistanı ---------------------------------------------------------------------------------------------------------

const exKey = (level, topic, exercise) => `${level}/${topic}/${exercise}`;
const checkedStudents = () => [...document.querySelectorAll('input[name="student"]:checked')].map((i) => i.value);
const studentName = (uid) => studentList.find((s) => s.id === uid)?.name || 'Öğrenci';

// Seçili öğrencilerin geçmişi (sonuçlar + önceki ödevler). Her öğrenci sayfa açıkken bir kez okunur (Spark kotası).
function loadHistory(uid){
  if(!historyLoads.has(uid)){
    historyLoads.set(uid, Promise.all([loadResults(uid), loadAssignments(uid), loadWritings(uid).catch(() => [])])
      .then(([results, assignments, writings]) => {
        histories.set(uid, { ...studentHistory(results, assignments), exam: examHistory(results, assignments, writings, toDate) });
      })
      .catch((error) => { console.warn(error); historyLoads.delete(uid); throw error; }));
  }
  return historyLoads.get(uid);
}

let historyToken = 0;
async function refreshHistories(){
  const uids = checkedStudents();
  const missing = uids.filter((u) => !histories.has(u));
  if(missing.length){
    const token = ++historyToken;
    setStatus($('aSuggestStatus'), '', 'Öğrencinin sonuçları ve önceki ödevleri okunuyor…');
    try{
      await Promise.all(missing.map(loadHistory));
      if(token !== historyToken) return;
      setStatus($('aSuggestStatus'), '', '');
    }catch(_){
      if(token !== historyToken) return;
      setStatus($('aSuggestStatus'), 'error', 'Öğrencinin sonuçları okunamadı; öneriler çözülen paketleri atlamıyor.');
    }
  }
  renderSuggest();
  renderExercises();
}

// Seçili öğrencilerin (okunmuş) geçmişleri.
const selectedHistories = () => checkedStudents().map((u) => histories.get(u)).filter(Boolean);

// Alıştırma listesinde paketin durumu: tek öğrencide "çözdü"/"verildi", birden çokta "2/3 çözdü".
function stateBadge(level, topic, exercise){
  const list = selectedHistories();
  if(!list.length) return null;
  const states = list.map((hst) => exerciseState(hst, level, topic, exercise));
  const solved = states.filter((x) => x === 'solved').length;
  const assigned = states.filter((x) => x === 'assigned').length;
  if(list.length === 1){
    if(solved) return h('span', { class: 'acc-badge success odev-state' }, 'çözdü');
    if(assigned) return h('span', { class: 'acc-badge muted odev-state' }, 'verildi');
    return null;
  }
  if(!solved && !assigned) return null;
  return h('span', { class: `acc-badge ${solved ? 'success' : 'muted'} odev-state` }, [solved ? `${solved}/${list.length} çözdü` : '', assigned ? `${assigned}/${list.length} verildi` : ''].filter(Boolean).join(' · '));
}

const inForm = (level, topic, exercise) => hasTopic(level, topic) || chosen.some((c) => key(c) === exKey(level, topic, exercise));

function addSuggested(t, e){
  if(inForm(t.level, t.topic, e.id)) return;
  chosen.push({ level: t.level, topic: t.topic, exercise: e.id, label: `${t.level} · ${t.title} · ${e.title}` });
}

async function openTopic(t){
  $('aLevel').value = t.level;
  renderTopics();
  $('aTopic').value = t.topic;
  await renderExercises();
  $('aTopic').focus();
}

// Bir konunun önerilecek paketleri: arama paket adlarında bulduysa onlar, yoksa konunun sıradaki paketleri.
// Önerilen paket sayısı (3 / 5 / 10): son seçim bu tarayıcıda hatırlanır (localStorage, sadece bir sayı).
const COUNT_KEY = 'baOdevOneriSayisi';
const COUNTS = [3, 5, 10];
function readCount(){
  try{ const n = Number(localStorage.getItem(COUNT_KEY)); return COUNTS.includes(n) ? n : 3; }catch(_){ return 3; }
}
function saveCount(n){
  try{ localStorage.setItem(COUNT_KEY, String(n)); }catch(_){}
}
const suggestCount = () => (COUNTS.includes(Number($('aSuggestCount').value)) ? Number($('aSuggestCount').value) : 3);

const formSkip = (t) => new Set([...chosen.map(key), ...(hasTopic(t.level, t.topic) ? t.exercises.map((e) => exKey(t.level, t.topic, e.id)) : [])]);

function suggestionsFor(t, list){
  const skip = formSkip(t);
  const count = suggestCount();
  const byName = t.score < 10 && t.matches.length;
  if(byName){
    const matched = { ...t, exercises: t.exercises.filter((e) => t.matches.includes(e.id)) };
    return { label: 'Adında geçen paketler', items: nextExercises(matched, list, { count, skip }) };
  }
  return { label: 'Sıradaki paketler', items: nextExercises(t, list, { count, skip }) };
}

// Seçili öğrencilerin hiçbirinin çözmediği, hiçbirine verilmemiş ve formda olmayan bütün paketler.
const unsolvedFor = (t, list) => nextExercises(t, list, { count: Infinity, skip: formSkip(t) });

// "Konunun tamamını ekle": formdaki "Bu konunun tamamını ekle" ile aynı (sonradan eklenen paketler de görünür);
// bu konudan tek tek seçilmiş paketler konunun içinde kalır, listeden çıkar.
function addWholeTopic(t){
  if(hasTopic(t.level, t.topic)) return;
  topics.push({ level: t.level, topic: t.topic, label: `${t.level} · ${t.title}` });
  for(let i = chosen.length - 1; i >= 0; i--) if(chosen[i].level === t.level && chosen[i].topic === t.topic) chosen.splice(i, 1);
}

let suggestTimer = 0;
function scheduleSuggest(){
  clearTimeout(suggestTimer);
  suggestTimer = setTimeout(renderSuggest, 120);
}

// Hedef sınav: seçili her öğrenci için sıradaki Lesen seti ve Schreiben görevi (öneri değiştirilebilir: liste).
const EXAM_PARTS = [
  { key: 'lesen', label: 'Lesen', topic: SINAV, empty: 'Bu sınavda sitede Lesen seti yok.' },
  { key: 'schreiben', label: 'Schreiben', topic: WRITING, empty: 'Bu sınavda sitede Schreiben görevi yok.' }
];
const STATE_TEXT = { solved: 'çözüldü', assigned: 'verildi' };

// "Teil 2 · Set 1 · Neue Wohnung"
const examItemName = (x) => `Teil ${x.teil} · ${x.set.replace('set-', 'Set ')} · ${x.title.split(' · ').pop()}`;

function addExamItem(part, item){
  if(chosen.some((c) => c.topic === part.topic && c.exercise === item.id)) return;
  const level = item.catalogLevels.includes($('aLevel').value) ? $('aLevel').value : item.catalogLevels[0];
  chosen.push({ level, topic: part.topic, exercise: item.id, label: item.title });
}

function examPartRow(student, track, history, part){
  const items = track[part.key];
  if(!items.length) return h('div', { class: 'odev-exam-part' }, h('p', { class: 'odev-suggest-label' }, part.label), h('p', { class: 'acc-hint' }, part.empty));
  const inForm = new Set(chosen.filter((c) => c.topic === part.topic).map((c) => c.exercise));
  const { next, last } = nextExamItem(items, history, inForm);
  const id = `aExam-${student.id}-${part.key}`;
  const select = h('select', { id, class: 'odev-exam-select' }, items.map((x) => {
    const state = inForm.has(x.id) ? 'ödevde' : STATE_TEXT[examItemState(history, x.id)];
    return h('option', { value: x.id, selected: x.id === next?.id }, `${examItemName(x)}${state ? ` (${state})` : ''}`);
  }));
  const add = h('button', { class: 'btn ghost odev-suggest-add', type: 'button', 'aria-label': `${part.label}: seçileni ekle (${student.name})` }, 'Ekle');
  add.addEventListener('click', () => {
    const item = items.find((x) => x.id === select.value);
    if(item) addExamItem(part, item);
    renderChosen();
    renderExercises();
    renderSuggest();
  });
  return h('div', { class: 'odev-exam-part' },
    h('label', { class: 'odev-suggest-label', for: id }, next ? `${part.label}: sıradaki ${examItemName(next)}` : `${part.label}: hepsi verildi ya da çözüldü; listeden seç`),
    h('div', { class: 'odev-exam-pick' }, select, add),
    h('p', { class: 'acc-sub odev-exam-last' }, last
      ? `Son verilen: ${last.item.title}${last.at ? ` (${fmtDate(last.at)})` : ''}`
      : 'Son verilen: henüz yok'));
}

function renderExamSuggest(){
  const box = $('aExamSuggest');
  const selected = checkedStudents().map((u) => studentList.find((s) => s.id === u)).filter(Boolean);
  if(!selected.length){
    box.replaceChildren();
    return;
  }
  box.replaceChildren(...selected.slice(0, 6).map((student) => {
    const target = student.targetExam;
    const label = target ? (examLabels.get(`${target.exam}|${target.level}`) || `${target.exam} ${target.level}`) : '';
    if(!target?.exam){
      return h('li', { class: 'odev-suggest-item odev-exam-item' }, h('p', { class: 'acc-hint' }, `${student.name} için hedef sınav seçilmemiş. `,
        h('a', { class: 'ba-link', href: `ogretmen-ogrenci.html?id=${encodeURIComponent(student.id)}` }, 'Öğrenci sayfasında seç')));
    }
    const history = histories.get(student.id)?.exam;
    const head = h('div', { class: 'odev-suggest-head' }, h('span', {}, h('strong', {}, `${student.name} · ${label}`), h('span', { class: 'acc-sub' }, 'Hedef sınav')));
    if(!history) return h('li', { class: 'odev-suggest-item odev-exam-item' }, head, h('p', { class: 'acc-hint' }, 'Önceki ödevleri okunuyor…'));
    const track = examTrack(target, { sets: examSetList, tasks: writingList });
    return h('li', { class: 'odev-suggest-item odev-exam-item' }, head, ...EXAM_PARTS.map((part) => examPartRow(student, track, history, part)));
  }));
}

function renderSuggest(){
  renderExamSuggest();
  const box = $('aSuggest');
  const query = $('aSearch').value.trim();
  if(!query){
    box.replaceChildren();
    return;
  }
  const found = searchTopics(topicIndex, query, { limit: 5, level: $('aLevel').value });
  if(!found.length){
    box.replaceChildren(h('li', { class: 'acc-hint' }, `"${query}" için konu bulunamadı. Başka bir kelime dene (Almanca ya da Türkçe konu adı).`));
    return;
  }
  const uids = checkedStudents();
  const list = selectedHistories();
  box.replaceChildren(...found.map((t) => {
    const { label, items } = suggestionsFor(t, list);
    const whole = hasTopic(t.level, t.topic);
    const progress = uids.length === 1 && histories.has(uids[0]) ? topicProgress(t, histories.get(uids[0])) : null;
    const open = h('button', { class: 'acc-text-button', type: 'button' }, 'Konuyu aç');
    open.addEventListener('click', () => openTopic(t));
    const rows = items.map((e) => {
      const add = h('button', { class: 'btn ghost odev-suggest-add', type: 'button', 'aria-label': `${e.title} ekle` }, 'Ekle');
      add.addEventListener('click', () => { addSuggested(t, e); renderChosen(); renderExercises(); renderSuggest(); });
      return h('li', {}, h('span', {}, e.title), add);
    });
    const refresh = () => { renderChosen(); renderExercises(); renderSuggest(); };
    const actions = [];
    if(items.length > 1){
      const addAll = h('button', { class: 'acc-text-button', type: 'button' }, `Önerilen ${items.length} paketi ekle`);
      addAll.addEventListener('click', () => { items.forEach((e) => addSuggested(t, e)); refresh(); });
      actions.push(addAll);
    }
    const unsolved = uids.length && !whole ? unsolvedFor(t, list) : [];
    if(unsolved.length){
      const addUnsolved = h('button', { class: 'acc-text-button', type: 'button', 'data-action': 'unsolved' }, `Çözülmemiş paketlerin hepsini ekle (${unsolved.length})`);
      addUnsolved.addEventListener('click', () => { unsolved.forEach((e) => addSuggested(t, e)); refresh(); });
      actions.push(addUnsolved);
    }
    if(!whole && t.exercises.length){
      const addWhole = h('button', { class: 'acc-text-button', type: 'button', 'data-action': 'whole' }, `Konunun tamamını ekle (${t.exercises.length} paket)`);
      addWhole.addEventListener('click', () => { addWholeTopic(t); refresh(); });
      actions.push(addWhole);
    }
    const actionRow = actions.length ? h('div', { class: 'odev-suggest-actions' }, actions) : null;
    const empty = whole ? 'Konunun tamamı ödevde.' : (uids.length ? 'Önerilecek paket kalmadı: hepsi çözüldü, verildi ya da ödevde.' : 'Önerilecek paket kalmadı.');
    return h('li', { class: 'odev-suggest-item' },
      h('div', { class: 'odev-suggest-head' },
        h('span', {}, h('strong', {}, `${t.level} · ${t.title}`), h('span', { class: 'acc-sub' }, [
          `${t.exercises.length} paket`,
          progress ? `${studentName(uids[0])}: ${progress.solved}/${progress.total} çözdü` : null
        ].filter(Boolean).join(' · '))),
        open),
      items.length
        ? h('div', {}, h('p', { class: 'odev-suggest-label' }, uids.length ? label : `${label} (öğrenci seçince çözdükleri atlanır)`),
          h('ul', { class: 'odev-suggest-list' }, rows))
        : h('p', { class: 'acc-hint' }, empty),
      actionRow,
      libraryRows(t.level, t.topic));
  }));
}

// Kaynak kütüphanesi: konuya etiketli PDF'ler. "Ekle" bağlantıyı ödeve ekler; Drive'da gizli olan PDF ancak
// "Onayla ve gönder"de paylaşılır (taslakta paylaşılmaz).
const linkedUrls = () => new Set(links.map((l) => l.url));

function addLibraryLink(item){
  const url = libraryUrl(item);
  if(linkedUrls().has(url)) return;
  if(links.length >= MAX_LINKS){
    setStatus($('aStatus'), 'error', `Bir ödeve en çok ${MAX_LINKS} bağlantı eklenebilir.`);
    return;
  }
  links.push({ url, title: item.title.slice(0, 120), kind: 'pdf', copy: false });
  renderLinks();
}

function libraryRows(level, topic){
  const items = libraryFor(library, level, topic);
  if(!items.length) return null;
  const urls = linkedUrls();
  return h('div', { class: 'odev-lib' },
    h('p', { class: 'odev-suggest-label' }, 'Kütüphaneden PDF'),
    h('ul', { class: 'odev-suggest-list' }, items.map((item) => {
      const added = urls.has(libraryUrl(item));
      const add = h('button', { class: 'btn ghost odev-suggest-add', type: 'button', disabled: added, 'aria-label': `${item.title} PDF'ini ekle` }, added ? 'Eklendi' : 'Ekle');
      add.addEventListener('click', () => addLibraryLink(item));
      return h('li', {}, h('span', {}, h('span', { class: 'odev-tag odev-tag-pdf' }, 'PDF'), ' ', item.title,
        item.shared ? null : h('span', { class: 'acc-sub' }, 'Drive\'da gizli; onaylayınca paylaşılır')), add);
    })));
}

function renderTopicLibrary(){
  const box = $('aLibrary');
  const rows = $('aTopic').value ? libraryRows($('aLevel').value, $('aTopic').value) : null;
  box.replaceChildren(...(rows ? [rows] : []));
}

// Bağlantılar ---------------------------------------------------------------------------------------------------------

function renderLinks(){
  $('aLinks').replaceChildren(...links.map((l, i) => {
    const remove = h('button', { class: 'acc-text-button', type: 'button', 'aria-label': `${linkLabel(l)} kaldır` }, 'Kaldır');
    remove.addEventListener('click', () => { links.splice(i, 1); renderLinks(); });
    return h('li', { class: 'odev-link-row' },
      h('span', { class: `odev-tag odev-tag-${l.kind}` }, KIND_LABELS[l.kind] + (l.copy ? ' · kopya' : '')),
      h('span', { class: 'odev-link-text' }, h('span', {}, linkLabel(l)), h('small', { class: 'acc-sub' }, l.url)),
      remove);
  }));
  $('aLinkAdd').disabled = links.length >= MAX_LINKS;
  // Kütüphane satırlarındaki "Ekle"/"Eklendi" durumu bağlantılara göre.
  if(topicIndex.length){ renderTopicLibrary(); renderSuggest(); }
}

function updateLinkPreview(){
  const url = $('aLinkUrl').value.trim();
  const preview = $('aLinkPreview');
  const isDocs = Boolean(docsCopyUrl(url));
  $('aLinkCopyRow').hidden = !isDocs;
  if(!isDocs) $('aLinkCopy').checked = false;
  if(!url){
    preview.hidden = true;
    return;
  }
  preview.hidden = false;
  if(!validLinkUrl(url)){
    preview.textContent = 'Bağlantı http:// ya da https:// ile başlamalı.';
    return;
  }
  preview.textContent = $('aLinkCopy').checked
    ? `Öğrenciye verilecek bağlantı: ${docsCopyUrl(url)}`
    : `Tür: ${KIND_LABELS[linkKind(url)]}. Bağlantı olduğu gibi verilir.`;
}

// Kutudaki bağlantıyı listeye ekler. Boşsa true (eklenecek bir şey yok), hatalıysa false döner.
function addLink(){
  const status = $('aStatus');
  const raw = $('aLinkUrl').value.trim();
  if(!raw) return true;
  if(!validLinkUrl(raw)){
    setStatus(status, 'error', 'Bağlantı http:// ya da https:// ile başlamalı.');
    $('aLinkUrl').focus();
    return false;
  }
  if(links.length >= MAX_LINKS){
    setStatus(status, 'error', `Bir ödeve en çok ${MAX_LINKS} bağlantı eklenebilir.`);
    return false;
  }
  const copy = $('aLinkCopy').checked && Boolean(docsCopyUrl(raw));
  const url = copy ? docsCopyUrl(raw) : raw;
  if(links.some((l) => l.url === url)){
    setStatus(status, 'error', 'Bu bağlantı zaten ekli.');
    return false;
  }
  links.push({ url, title: $('aLinkTitle').value.trim().slice(0, 120), kind: linkKind(raw), copy });
  $('aLinkUrl').value = '';
  $('aLinkTitle').value = '';
  $('aLinkCopy').checked = false;
  setStatus(status, '', '');
  updateLinkPreview();
  renderLinks();
  return true;
}

// PDF (Google Drive) ---------------------------------------------------------------------------------------------------
// İlk tıklamada Google izni istenir (açılır pencere tıklamaya bağlı olmalı); izin alınınca dosya seçimi açılır ya da
// tarayıcı engellerse ikinci tıklamada açılır. Yükleme sürerken ödev kaydedilemez.
let uploading = false;

function pdfStatus(type, message){
  setStatus($('aPdfStatus'), type, message);
}

async function pickPdf(){
  if(links.length >= MAX_LINKS){
    pdfStatus('error', `Bir ödeve en çok ${MAX_LINKS} bağlantı eklenebilir.`);
    return;
  }
  if(!drive.isConnected()){
    $('aPdfAdd').disabled = true;
    pdfStatus('', 'Google Drive izni isteniyor…');
    try{
      await drive.connect();
    }catch(error){
      console.warn(error);
      pdfStatus('error', `Google Drive'a bağlanılamadı: ${error.message}`);
      return;
    }finally{
      $('aPdfAdd').disabled = false;
    }
    pdfStatus('success', 'Google Drive bağlandı. PDF dosyasını seç.');
    $('aPdfAdd').textContent = 'PDF seç';
  }
  $('aPdfFile').click();
}

async function uploadSelected(){
  const file = $('aPdfFile').files?.[0];
  $('aPdfFile').value = '';
  if(!file) return;
  const problem = await drive.checkPdf(file);
  if(problem){
    pdfStatus('error', problem);
    return;
  }
  uploading = true;
  $('aPdfAdd').disabled = true;
  $('aSubmit').disabled = true;
  const progress = $('aPdfProgress');
  progress.hidden = false;
  progress.value = 0;
  pdfStatus('', `"${file.name}" yükleniyor…`);
  try{
    const result = await drive.uploadPdf(file, { onProgress: (p) => { progress.value = p; } });
    links.push({ url: result.url, title: result.name.replace(/\.pdf$/i, '').slice(0, 120), kind: 'pdf', copy: false });
    renderLinks();
    pdfStatus('success', `"${result.name}" Drive'a yüklendi, paylaşıldı ve ödeve eklendi.`);
  }catch(error){
    console.warn(error);
    pdfStatus('error', `PDF yüklenemedi: ${error.message} Tekrar dene.`);
    if(!drive.isConnected()) $('aPdfAdd').textContent = 'PDF ekle';
  }finally{
    uploading = false;
    progress.hidden = true;
    $('aPdfAdd').disabled = false;
    $('aSubmit').disabled = false;
  }
}

// Öğrenciler -----------------------------------------------------------------------------------------------------------

function renderStudents(students, preselect = []){
  const already = new Set(editing ? editing.copies.map((c) => c.uid) : []);
  const enabled = students.filter((s) => isEnabled(s) || already.has(s.id)).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  const box = $('aStudents');
  const legend = box.querySelector('legend');
  box.replaceChildren(legend, ...(enabled.length
    ? enabled.map((s) => h('label', { class: 'acc-check' },
      h('input', { type: 'checkbox', name: 'student', value: s.id, checked: already.has(s.id) || preselect.includes(s.id), disabled: already.has(s.id) }),
      h('span', {}, s.name, h('span', { class: 'acc-sub' }, [already.has(s.id) ? 'Bu ödev verildi' : s.email, s.homeworkMail === false ? 'ödev e-postası kapalı' : null].filter(Boolean).join(' · ')))))
    : [h('p', { class: 'acc-hint' }, 'Hesabı açık öğrenci yok.')]));
  $('aAll').disabled = !enabled.length;
  updateStudentCount();
}

function selectedStudents(){
  return [...document.querySelectorAll('input[name="student"]:checked:not(:disabled)')].map((i) => i.value);
}

function updateStudentCount(){
  $('aStudentCount').textContent = String(document.querySelectorAll('input[name="student"]:checked').length);
}

// Form -----------------------------------------------------------------------------------------------------------------

function readForm(){
  const status = $('aStatus');
  const fail = (message, focusId) => {
    setStatus(status, 'error', message);
    if(focusId) $(focusId).focus();
    return null;
  };
  if(!addLink()) return null;
  const title = $('aTitle').value.trim();
  const description = $('aDescription').value.trim();
  const rawDue = $('aDue').value;
  const due = rawDue ? berlinInputToDate(rawDue) : null;
  const students = selectedStudents();
  if(!title) return fail('Başlık yaz.', 'aTitle');
  if(rawDue && !due) return fail('Teslim tarihi geçerli değil.', 'aDue');
  if(links.some((l) => !validLinkUrl(l.url))) return fail('Bağlantılardan biri geçerli değil (sadece http ve https).', 'aLinkUrl');
  if(!chosen.length && !topics.length && !links.length && !description) return fail('Ödeve en az bir alıştırma, bir bağlantı ya da bir açıklama ekle.', 'aLevel');
  if(!editing && !students.length) return fail('En az bir öğrenci seç.', 'aAll');
  return {
    students,
    data: {
      title: title.slice(0, 120),
      description: description.slice(0, 4000),
      dueAt: due ? fs.Timestamp.fromDate(due) : null,
      links: links.map(({ url, title: t, kind, copy }) => ({ url, title: t, kind, copy })),
      topics: topics.map(({ level, topic }) => ({ level, topic })),
      exercises: chosen.map(({ level, topic, exercise }) => ({ level, topic, exercise }))
    }
  };
}

async function submit(event){
  event.preventDefault();
  if(saving) return;
  if(uploading){
    setStatus($('aStatus'), 'error', 'PDF yüklenirken bekle.');
    return;
  }
  const form = readForm();
  if(!form) return;
  setBusy(true);
  // Kütüphaneden eklenen gizli PDF'ler önce paylaşılır (Google izni tıklamaya bağlı olduğu için ilk iş); paylaşılamazsa
  // ödev kaydedilmez: öğrenci açamayacağı bir bağlantı almasın.
  const toShare = unsharedIn(form.data.links, library);
  if(toShare.length){
    setStatus($('aStatus'), '', 'Kütüphane PDF\'leri paylaşılıyor…');
    try{
      await shareItems(toShare);
    }catch(error){
      console.error(error);
      setStatus($('aStatus'), 'error', `PDF paylaşılamadı, ödev verilmedi: ${error.message} Tekrar dene.`);
      setBusy(false);
      return;
    }
  }
  setStatus($('aStatus'), '', 'Kaydediliyor…');
  try{
    let fresh = [];
    if(editing) fresh = await updateAssignmentGroup(editing, form.data, form.students);
    else if(draft) fresh = await approveDraft(draft.id, form.students, form.data);
    else fresh = (await createAssignments(form.students, form.data)).copies;
    // E-posta: ödev kaydedildi; e-posta gitmese de ödev kalır (sonuç ödev listesinde gösterilir).
    if(mailConfigured){
      const wantNew = $('aNotify').checked && fresh.length;
      const wantUpdate = editing && $('aNotifyUpdate').checked;
      if(wantNew || wantUpdate){
        setStatus($('aStatus'), '', 'Kaydedildi. E-postalar gönderiliyor…');
        const result = { ok: true, results: [], sent: 0, count: 0, limit: 0 };
        for(const [kind, items] of [['new', wantNew ? fresh : []], ['update', wantUpdate ? editing.copies.map((c) => ({ uid: c.uid, id: c.id })) : []]]){
          if(!items.length) continue;
          const r = await notifyHomework(kind, items);
          result.ok &&= r.ok;
          result.results.push(...r.results);
          result.sent += r.sent;
          result.count = r.count || result.count;
          result.limit = r.limit || result.limit;
          if(r.error) result.error = r.error;
        }
        rememberResult(result);
      }
    }
    const preselect = new URLSearchParams(location.search).get('ogrenci');
    const target = preselect || (form.students.length === 1 && !editing ? form.students[0] : '');
    location.href = `ogretmen-odevler.html?${target ? `ogrenci=${encodeURIComponent(target)}&` : ''}durum=${editing ? 'guncellendi' : 'verildi'}`;
  }catch(error){
    console.error(error);
    setStatus($('aStatus'), 'error', 'Ödev kaydedilemedi. Tekrar dene.');
    setBusy(false);
  }
}

let saving = false;
function setBusy(value){
  saving = value;
  $('aSubmit').disabled = value;
  $('aDraft').disabled = value;
}

// Taslak kaydet: öğrenci görmez, e-posta gitmez.
async function submitDraft(){
  if(saving) return;
  if(uploading){
    setStatus($('aStatus'), 'error', 'PDF yüklenirken bekle.');
    return;
  }
  const form = readForm();
  if(!form) return;
  setBusy(true);
  setStatus($('aStatus'), '', 'Taslak kaydediliyor…');
  try{
    const id = await saveDraft(draft?.id || null, form.students, form.data, { source: draft?.source || new URLSearchParams(location.search).get('kaynak') || 'form' });
    location.href = `ogretmen-taslaklar.html?durum=kaydedildi#taslak-${encodeURIComponent(id)}`;
  }catch(error){
    console.error(error);
    setStatus($('aStatus'), 'error', 'Taslak kaydedilemedi. Tekrar dene.');
    setBusy(false);
  }
}

// Düzenleme: formu ödevin mevcut içeriğiyle doldurur.
async function fillContent(a){
  $('aTitle').value = a.title;
  $('aDescription').value = a.description;
  $('aDue').value = a.due ? dateToBerlinInput(a.due) : '';
  links.push(...a.links.map((l) => ({ ...l })));
  const names = await topicTitles(a.topics, 'tr');
  topics.push(...a.topics.map((t) => ({ ...t, label: `${t.level} · ${names[topicKey(t)] || t.topic}` })));
  const exNames = await exerciseNames(a.exercises, 'tr');
  chosen.push(...a.exercises.map((e) => {
    const n = exNames[key(e)];
    return { ...e, label: `${n?.level || e.level} · ${n?.topic || e.topic} · ${n?.exercise || e.exercise}` };
  }));
}

async function fillFromGroup(group){
  await fillContent(group.data);
  $('aDraft').hidden = true;
  $('aDraftHint').hidden = true;
  document.title = 'Ödevi düzenle | Bozkurt Academy';
  $('assignTitle').textContent = 'Ödevi düzenle';
  $('aSubmit').textContent = 'Kaydet';
  $('aNotifyLabel').textContent = 'Yeni eklediğin öğrencilere e-posta gönder';
  $('aNotifyUpdateRow').hidden = false;
  $('aStudentsHint').textContent = 'Ödevi almış öğrenciler işaretli ve değiştirilemez; yeni öğrenci ekleyebilirsin. Bir öğrenciden kaldırmak için ödev listesini kullan.';
  $('backLink').href = 'ogretmen-odevler.html';
}

// Taslağı açma: içerik ve öğrenciler taslaktan; "Onayla ve gönder" ödevi verir ve taslağı siler.
async function fillFromDraft(d){
  await fillContent(d);
  document.title = 'Taslak | Bozkurt Academy';
  $('assignTitle').textContent = 'Taslak';
  $('aDraft').textContent = 'Taslağı güncelle';
  $('aStudentsHint').textContent = 'Taslaktaki öğrenciler işaretli. Onaylayınca ödev yalnızca işaretli öğrencilere verilir.';
  $('backLink').href = 'ogretmen-taslaklar.html';
  $('backLink').textContent = '← Taslaklar';
}

const user = await requireTeacher({ loadingId: 'assignLoading', errorId: 'assignError' });
if(user){
  try{
    const params = new URLSearchParams(location.search);
    const editId = params.get('duzenle');
    const draftId = editId ? null : params.get('taslak');
    const [catalogLevels, students, writing, sets, groups, openedDraft, searchIndex] = await Promise.all([
      loadCatalogLevels(), listStudents(), writingTasks().catch(() => []), examSets().catch(() => []),
      editId ? loadAssignmentGroups() : Promise.resolve([]),
      draftId ? getDraft(draftId) : Promise.resolve(null),
      fetch('data/search-index.json').then((r) => r.json()).catch(() => null)
    ]);
    // Kütüphane (tek sorgu); yüklenemezse asistan kütüphanesiz çalışır.
    loadLibrary().then((list) => { library = list; renderTopicLibrary(); renderSuggest(); }).catch((error) => console.warn(error));
    if(editId){
      editing = groups.find((g) => g.groupId === editId) || null;
      if(!editing) throw new Error('Ödev bulunamadı.');
    }
    if(draftId){
      draft = openedDraft;
      if(!draft) throw new Error('Taslak bulunamadı.');
    }
    levels = catalogLevels;
    studentList = students;
    examSetList = sets;
    writingList = writing;
    loadExamsData().then((data) => {
      examLabels = new Map(examTargets(data, { sets, tasks: writing }).map((t) => [`${t.exam}|${t.level}`, t.label]));
      renderExamSuggest();
    }).catch((error) => console.warn(error));
    topicIndex = buildTopicIndex(catalogLevels, searchIndex);
    if(!searchIndex) setStatus($('aSuggestStatus'), 'error', 'Arama dizini yüklenemedi; asistan sadece konu adlarında arar.');
    writingLevels = new Set(writing.flatMap((w) => w.catalogLevels));
    examLevels = new Set(sets.flatMap((s) => s.catalogLevels));
    // Katalogda olmayan sınav seviyeleri (C1, TestDaF) sadece sınav hazırlığıyla seçilebilir: sınav setleri ve Schreiben görevleri.
    const extra = [...new Set([...examLevels, ...writingLevels])].filter((id) => !levels.some((l) => l.id === id)).sort();
    fillSelect($('aLevel'), [...levels.map((l) => ({ value: l.id, label: `${l.id} · ${localize(l.title, 'tr')}` })),
      ...extra.map((id) => ({ value: id, label: `${id} · sadece sınav hazırlığı` }))]);
    if(editing) await fillFromGroup(editing);
    else if(draft) await fillFromDraft(draft);
    else $('aTitle').value = defaultTitle();
    renderTopics();
    renderChosen();
    renderLinks();
    renderStudents(students, draft ? draft.uids : [params.get('ogrenci')].filter(Boolean));
    const preselect = params.get('ogrenci');
    if(preselect) $('backLink').href = `ogretmen-odevler.html?ogrenci=${encodeURIComponent(preselect)}`;
    $('aDueWeek').addEventListener('click', () => {
      $('aDue').value = `${dateToBerlinInput(new Date(Date.now() + 7 * 864e5)).slice(0, 10)}T18:00`;
    });
    $('aDueClear').addEventListener('click', () => { $('aDue').value = ''; });
    $('aLevel').addEventListener('change', renderTopics);
    $('aTopic').addEventListener('change', renderExercises);
    $('aWhole').addEventListener('change', toggleWholeTopic);
    $('aLinkUrl').addEventListener('input', updateLinkPreview);
    $('aLinkCopy').addEventListener('change', updateLinkPreview);
    $('aLinkAdd').addEventListener('click', addLink);
    // PDF: Google Drive ayarlı değilse düğme gizlenir.
    if(drive.driveConfigured){
      drive.preload();
      if(drive.isConnected()) $('aPdfAdd').textContent = 'PDF seç';
      $('aPdfAdd').addEventListener('click', pickPdf);
      $('aPdfFile').addEventListener('change', uploadSelected);
    }else{
      $('aPdfAdd').hidden = true;
      $('aPdfHint').hidden = true;
    }
    // Bağlantı kutusunda Enter formu göndermez, bağlantıyı ekler.
    for(const id of ['aLinkUrl', 'aLinkTitle']){
      $(id).addEventListener('keydown', (event) => {
        if(event.key === 'Enter'){ event.preventDefault(); addLink(); }
      });
    }
    $('aAll').addEventListener('change', () => {
      document.querySelectorAll('input[name="student"]:not(:disabled)').forEach((i) => { i.checked = $('aAll').checked; });
      updateStudentCount();
      refreshHistories();
    });
    $('aStudents').addEventListener('change', () => { updateStudentCount(); refreshHistories(); });
    $('aSearch').addEventListener('input', scheduleSuggest);
    $('aSuggestCount').value = String(readCount());
    $('aSuggestCount').addEventListener('change', () => { saveCount(suggestCount()); renderSuggest(); });
    // Arama kutusunda Enter formu göndermez (ödev yanlışlıkla verilmesin).
    $('aSearch').addEventListener('keydown', (event) => { if(event.key === 'Enter'){ event.preventDefault(); renderSuggest(); } });
    $('aDraft').addEventListener('click', submitDraft);
    if(params.get('konu')) $('aSearch').value = params.get('konu').slice(0, 80);
    refreshHistories();
    if(!mailConfigured) $('aNotifyBox').hidden = true;
    $('assignForm').addEventListener('submit', submit);
    $('assignLoading').hidden = true;
    $('assignForm').hidden = false;
  }catch(error){
    console.error(error);
    $('assignLoading').hidden = true;
    $('assignError').hidden = false;
    const params = new URLSearchParams(location.search);
    $('assignError').textContent = editing === null && params.get('duzenle')
      ? 'Ödev bulunamadı. Silinmiş olabilir.'
      : draft === null && params.get('taslak') ? 'Taslak bulunamadı. Onaylanmış ya da silinmiş olabilir.' : 'Sayfa yüklenemedi. Tekrar dene.';
  }
}
