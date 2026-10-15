// ogretmen-odev.html: yeni ödev. Başlık, açıklama, teslim tarihi (Berlin), sitedeki alıştırmalar,
// isteğe bağlı Google Docs linki ("her öğrenciye kopya" → /copy) ve bir ya da birden fazla öğrenci.
import {
  $, berlinInputToDate, dateToBerlinInput, docsCopyUrl, h, loadCatalogLevels, loadTopicExercises, localize, setStatus,
  validHttpsUrl
} from './common.js';
import { fs } from './firebase.js';
import { createAssignments, isEnabled, listStudents, requireTeacher } from './teacher-common.js';

const chosen = []; // [{ level, topic, exercise, label }]
let levels = [];

const key = (e) => `${e.level}/${e.topic}/${e.exercise}`;

function fillSelect(select, items){
  select.replaceChildren(...items.map(({ value, label }) => h('option', { value }, label)));
}

function renderChosen(){
  $('aChosenCount').textContent = String(chosen.length);
  $('aChosen').replaceChildren(...(chosen.length
    ? chosen.map((e, i) => {
      const remove = h('button', { class: 'acc-text-button', type: 'button', 'aria-label': `${e.label} kaldır` }, 'Kaldır');
      remove.addEventListener('click', () => {
        chosen.splice(i, 1);
        renderChosen();
        renderExercises();
      });
      return h('li', {}, h('span', {}, e.label), remove);
    })
    : [h('li', { class: 'acc-hint' }, 'Henüz alıştırma seçilmedi.')]));
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
  box.replaceChildren(legend, ...(exercises.length
    ? exercises.map((ex) => {
      const item = { level, topic, exercise: ex.id, label: `${level} · ${topicTitle} · ${localize(ex.title, 'tr')}` };
      const input = h('input', { type: 'checkbox', checked: chosen.some((c) => key(c) === key(item)) });
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

function renderTopics(){
  const level = levels.find((l) => l.id === $('aLevel').value);
  const topics = (level?.topics || []).filter((t) => t.path);
  fillSelect($('aTopic'), topics.map((t) => ({ value: t.id, label: localize(t.title, 'tr') })));
  renderExercises();
}

function renderStudents(students, preselect){
  const enabled = students.filter(isEnabled).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  const box = $('aStudents');
  const legend = box.querySelector('legend');
  box.replaceChildren(legend, ...(enabled.length
    ? enabled.map((s) => h('label', { class: 'acc-check' },
      h('input', { type: 'checkbox', name: 'student', value: s.id, checked: s.id === preselect }),
      h('span', {}, s.name, h('span', { class: 'acc-sub' }, s.email))))
    : [h('p', { class: 'acc-hint' }, 'Hesabı açık öğrenci yok.')]));
  $('aAll').disabled = !enabled.length;
}

function selectedStudents(){
  return [...document.querySelectorAll('input[name="student"]:checked')].map((i) => i.value);
}

function updateDocPreview(){
  const url = $('aDoc').value.trim();
  const preview = $('aDocPreview');
  if(!url){
    preview.hidden = true;
    return;
  }
  preview.hidden = false;
  if(!validHttpsUrl(url)){
    preview.textContent = 'Link https:// ile başlamalı.';
    return;
  }
  if($('aCopy').checked){
    const copy = docsCopyUrl(url);
    preview.textContent = copy
      ? `Öğrenciye verilecek link: ${copy}`
      : 'Bu link /copy biçimine çevrilemiyor. Sadece Google Docs, Sheets ve Slides linkleri çevrilebilir.';
  }else{
    preview.textContent = 'Link olduğu gibi verilir; öğrenciler aynı dokümanı açar.';
  }
}

function readForm(){
  const status = $('aStatus');
  const fail = (message, focusId) => {
    setStatus(status, 'error', message);
    if(focusId) $(focusId).focus();
    return null;
  };
  const title = $('aTitle').value.trim();
  const description = $('aDescription').value.trim();
  const due = berlinInputToDate($('aDue').value);
  const rawDoc = $('aDoc').value.trim();
  const copyPerStudent = $('aCopy').checked;
  const students = selectedStudents();
  if(title.length < 2) return fail('Başlık yaz (en az 2 karakter).', 'aTitle');
  if(!due) return fail('Teslim tarihini seç.', 'aDue');
  let docUrl = '';
  if(rawDoc){
    if(!validHttpsUrl(rawDoc)) return fail('Google Docs linki https:// ile başlamalı.', 'aDoc');
    docUrl = copyPerStudent ? docsCopyUrl(rawDoc) : rawDoc;
    if(!docUrl) return fail('Bu link /copy biçimine çevrilemiyor. "Her öğrenciye kopya"yı kapat ya da bir Google Docs, Sheets veya Slides linki kullan.', 'aDoc');
  }else if(copyPerStudent){
    return fail('"Her öğrenciye kopya" için bir Google Docs linki gerekli.', 'aDoc');
  }
  if(!chosen.length && !docUrl && !description) return fail('Ödeve en az bir alıştırma, bir doküman ya da bir açıklama ekle.', 'aLevel');
  if(!students.length) return fail('En az bir öğrenci seç.', 'aAll');
  return {
    students,
    data: {
      title,
      description,
      dueAt: fs.Timestamp.fromDate(due),
      exercises: chosen.map(({ level, topic, exercise }) => ({ level, topic, exercise })),
      docUrl,
      copyPerStudent: Boolean(docUrl) && copyPerStudent
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
    await createAssignments(form.students, form.data);
    location.href = `ogretmen.html?odev=verildi#odevler`;
  }catch(error){
    console.error(error);
    setStatus($('aStatus'), 'error', 'Ödev kaydedilemedi. Tekrar dene.');
    button.disabled = false;
  }
}

const user = await requireTeacher({ loadingId: 'assignLoading', errorId: 'assignError' });
if(user){
  try{
    const [catalogLevels, students] = await Promise.all([loadCatalogLevels(), listStudents()]);
    levels = catalogLevels;
    fillSelect($('aLevel'), levels.map((l) => ({ value: l.id, label: `${l.id} · ${localize(l.title, 'tr')}` })));
    renderTopics();
    renderChosen();
    renderStudents(students, new URLSearchParams(location.search).get('ogrenci'));
    // Varsayılan teslim: bir hafta sonra, Berlin saatiyle 18:00.
    const nextWeek = new Date(Date.now() + 7 * 864e5);
    $('aDue').value = `${dateToBerlinInput(nextWeek).slice(0, 10)}T18:00`;
    $('aLevel').addEventListener('change', renderTopics);
    $('aTopic').addEventListener('change', renderExercises);
    $('aDoc').addEventListener('input', updateDocPreview);
    $('aCopy').addEventListener('change', updateDocPreview);
    $('aAll').addEventListener('change', () => {
      document.querySelectorAll('input[name="student"]').forEach((i) => { i.checked = $('aAll').checked; });
    });
    $('assignForm').addEventListener('submit', submit);
    $('assignLoading').hidden = true;
    $('assignForm').hidden = false;
  }catch(error){
    console.error(error);
    $('assignLoading').hidden = true;
    $('assignError').hidden = false;
    $('assignError').textContent = 'Sayfa yüklenemedi. Tekrar dene.';
  }
}
