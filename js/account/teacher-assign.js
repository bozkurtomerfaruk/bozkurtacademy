// ogretmen-odev.html: yeni ödev ve ödevi düzenleme (?duzenle=<groupId>).
// Başlık (varsayılan: bugünün tarihi), açıklama/not, isteğe bağlı teslim tarihi (Berlin), her türlü http/https bağlantı
// (Google Docs için "her öğrenciye kopya" → /copy), sitedeki alıştırmalar (tek tek ya da konunun tamamı; sınav setleri,
// Schreiben görevleri, seviye sonu sınavı) ve bir ya da birden fazla öğrenci. Veri biçimi: js/account/assignments.js.
import {
  $, berlinInputToDate, dateToBerlinInput, docsCopyUrl, exerciseNames, h, LEVEL_EXAM, levelExamTopic, loadCatalogLevels, loadTopicExercises, localize, setStatus,
  WRITING, writingTasks, SINAV, examSets
} from './common.js';
import { fs } from './firebase.js';
import { defaultTitle, KIND_LABELS, linkKind, linkLabel, MAX_LINKS, topicTitles, validLinkUrl, wholeTopicAllowed } from './assignments.js?v=1';
import { createAssignments, isEnabled, listStudents, loadAssignmentGroups, requireTeacher, updateAssignmentGroup } from './teacher-common.js';

const chosen = []; // [{ level, topic, exercise, label }]
const topics = []; // [{ level, topic, label }] konunun tamamı
const links = []; // [{ url, title, kind, copy }]
let levels = [];
let writingLevels = new Set(); // catalog levels that have Schreiben tasks (js/examsData.js)
let examLevels = new Set(); // catalog levels that have exam sets (Lesen, Hören, Sprachbausteine, form)
let editing = null; // düzenlenen ödev grubu (loadAssignmentGroups)

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
    b.addEventListener('click', () => { onRemove(); renderChosen(); renderExercises(); });
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
      });
      return h('label', { class: 'acc-check' }, input, h('span', {}, localize(ex.title, 'tr')));
    })
    : [h('p', { class: 'acc-hint' }, 'Bu konuda alıştırma yok.')]));
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

// Öğrenciler -----------------------------------------------------------------------------------------------------------

function renderStudents(students, preselect){
  const already = new Set(editing ? editing.copies.map((c) => c.uid) : []);
  const enabled = students.filter((s) => isEnabled(s) || already.has(s.id)).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  const box = $('aStudents');
  const legend = box.querySelector('legend');
  box.replaceChildren(legend, ...(enabled.length
    ? enabled.map((s) => h('label', { class: 'acc-check' },
      h('input', { type: 'checkbox', name: 'student', value: s.id, checked: already.has(s.id) || s.id === preselect, disabled: already.has(s.id) }),
      h('span', {}, s.name, h('span', { class: 'acc-sub' }, already.has(s.id) ? 'Bu ödev verildi' : s.email))))
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
  const form = readForm();
  if(!form) return;
  const button = $('aSubmit');
  button.disabled = true;
  setStatus($('aStatus'), '', 'Kaydediliyor…');
  try{
    if(editing) await updateAssignmentGroup(editing, form.data, form.students);
    else await createAssignments(form.students, form.data);
    const preselect = new URLSearchParams(location.search).get('ogrenci');
    const target = preselect || (form.students.length === 1 && !editing ? form.students[0] : '');
    location.href = `ogretmen-odevler.html?${target ? `ogrenci=${encodeURIComponent(target)}&` : ''}durum=${editing ? 'guncellendi' : 'verildi'}`;
  }catch(error){
    console.error(error);
    setStatus($('aStatus'), 'error', 'Ödev kaydedilemedi. Tekrar dene.');
    button.disabled = false;
  }
}

// Düzenleme: formu ödevin mevcut içeriğiyle doldurur.
async function fillFromGroup(group){
  const a = group.data;
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
  document.title = 'Ödevi düzenle | Bozkurt Academy';
  $('assignTitle').textContent = 'Ödevi düzenle';
  $('aSubmit').textContent = 'Kaydet';
  $('aStudentsHint').textContent = 'Ödevi almış öğrenciler işaretli ve değiştirilemez; yeni öğrenci ekleyebilirsin. Bir öğrenciden kaldırmak için ödev listesini kullan.';
  $('backLink').href = 'ogretmen-odevler.html';
}

const user = await requireTeacher({ loadingId: 'assignLoading', errorId: 'assignError' });
if(user){
  try{
    const params = new URLSearchParams(location.search);
    const editId = params.get('duzenle');
    const [catalogLevels, students, writing, sets, groups] = await Promise.all([
      loadCatalogLevels(), listStudents(), writingTasks().catch(() => []), examSets().catch(() => []),
      editId ? loadAssignmentGroups() : Promise.resolve([])
    ]);
    if(editId){
      editing = groups.find((g) => g.groupId === editId) || null;
      if(!editing) throw new Error('Ödev bulunamadı.');
    }
    levels = catalogLevels;
    writingLevels = new Set(writing.flatMap((w) => w.catalogLevels));
    examLevels = new Set(sets.flatMap((s) => s.catalogLevels));
    // Katalogda olmayan sınav seviyeleri (C1, TestDaF) sadece sınav setleriyle seçilebilir.
    const extra = [...examLevels].filter((id) => !levels.some((l) => l.id === id)).sort();
    fillSelect($('aLevel'), [...levels.map((l) => ({ value: l.id, label: `${l.id} · ${localize(l.title, 'tr')}` })),
      ...extra.map((id) => ({ value: id, label: `${id} · sadece sınav setleri` }))]);
    if(editing) await fillFromGroup(editing);
    else $('aTitle').value = defaultTitle();
    renderTopics();
    renderChosen();
    renderLinks();
    renderStudents(students, params.get('ogrenci'));
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
    // Bağlantı kutusunda Enter formu göndermez, bağlantıyı ekler.
    for(const id of ['aLinkUrl', 'aLinkTitle']){
      $(id).addEventListener('keydown', (event) => {
        if(event.key === 'Enter'){ event.preventDefault(); addLink(); }
      });
    }
    $('aAll').addEventListener('change', () => {
      document.querySelectorAll('input[name="student"]:not(:disabled)').forEach((i) => { i.checked = $('aAll').checked; });
      updateStudentCount();
    });
    $('aStudents').addEventListener('change', updateStudentCount);
    $('assignForm').addEventListener('submit', submit);
    $('assignLoading').hidden = true;
    $('assignForm').hidden = false;
  }catch(error){
    console.error(error);
    $('assignLoading').hidden = true;
    $('assignError').hidden = false;
    $('assignError').textContent = editing === null && new URLSearchParams(location.search).get('duzenle')
      ? 'Ödev bulunamadı. Silinmiş olabilir.'
      : 'Sayfa yüklenemedi. Tekrar dene.';
  }
}
