// odevlerim.html: öğrencinin ödevleri, öğretmenin ödev sayfasıyla aynı düzende: verildiği günün tarih başlıkları
// altında, en yenisi üstte. Açık ödevler açık, tamamlananlar kapalı gelir. Öğrenci sadece "tamamladım", tamamlama
// zamanı ve kendi doküman linkini değiştirebilir (firestore.rules). Veri biçimi: js/account/assignments.js.
import { configured, db, fs } from './firebase.js';
import { TEACHER_UID } from './config.js';
import { registerStrings, t, lang } from './i18n.js';
import {
  $, accountState, clearHint, currentUser, exerciseUrl, formatDateTime, h, loadAssignments, loadProfile, loadResults,
  scoreText, setStatus, syncLang, validStudentDocUrl
} from './common.js';
import { assignmentBody, expandExercises, groupByDay, normalizeAssignment, solvedCount, withResults } from './assignments.js?v=1';

registerStrings();

let uid = null;
let profile = null;
let assignments = [];
let results = [];
const opened = new Set(); // kullanıcının açıp kapattığı ödevler yeniden çizimde korunur

const fmt = (value) => formatDateTime(value, { lang: lang() });

async function save(a, changes, statusEl){
  try{
    await fs.updateDoc(fs.doc(db, 'users', uid, 'assignments', a.id), changes);
    assignments = (await loadAssignments(uid)).map(normalizeAssignment);
    await render();
  }catch(error){
    console.error(error);
    setStatus(statusEl, 'error', t('assignSaveFailed'));
  }
}

function docField(a, status){
  const inputId = `myDoc-${a.id}`;
  const input = h('input', { id: inputId, type: 'url', inputmode: 'url', value: a.studentDocUrl || '', placeholder: 'https://docs.google.com/…', autocomplete: 'off', 'aria-describedby': `${inputId}-hint` });
  const read = () => {
    const url = input.value.trim();
    if(!validStudentDocUrl(url)){
      setStatus(status, 'error', t('assignBadLink'));
      input.focus();
      return null;
    }
    return url;
  };
  return { input, read, field: h('div', { class: 'field acc-assign-link' },
    h('label', { for: inputId }, t('assignMyDoc')),
    input,
    h('small', { class: 'acc-hint', id: `${inputId}-hint` }, t('assignMyDocHint'))) };
}

async function card(a){
  const exercises = withResults(await expandExercises(a, lang()), results, a.createdAt);
  const count = solvedCount(exercises);
  const overdue = !a.done && a.due && a.due < new Date();
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const actions = [];
  let field = null;
  if(a.done){
    const undo = h('button', { class: 'acc-text-button', type: 'button' }, t('assignUndo'));
    undo.addEventListener('click', () => save(a, { done: false, doneAt: null }, status));
    actions.push(undo);
  }else{
    const doc = docField(a, status);
    field = doc.field;
    const saveLink = h('button', { class: 'btn ghost', type: 'button' }, t('assignSaveLink'));
    saveLink.addEventListener('click', () => {
      const url = doc.read();
      if(url !== null) save(a, { studentDocUrl: url }, status);
    });
    const done = h('button', { class: 'btn primary', type: 'button' }, t('assignMarkDone'));
    done.addEventListener('click', () => {
      const url = doc.read();
      if(url === null) return;
      done.disabled = true;
      save(a, { done: true, doneAt: fs.serverTimestamp(), studentDocUrl: url }, status).finally(() => { done.disabled = false; });
    });
    actions.push(done, saveLink);
  }
  const details = h('details', { class: 'odev-details', open: opened.has(a.id) ? true : (!a.done || location.hash === `#odev-${a.id}`) },
    h('summary', {}, t('odevDetails')),
    h('div', { class: 'odev-body' },
      assignmentBody(a, exercises, { tx: t, scoreText, exerciseUrl }),
      field,
      a.done && a.studentDocUrl ? h('p', { class: 'odev-text' }, `${t('assignMyDocLink')}: `,
        h('a', { class: 'ba-link', href: a.studentDocUrl, target: '_blank', rel: 'noopener noreferrer' }, t('assignOpenDoc'))) : null),
    h('div', { class: 'acc-actions odev-actions' }, actions),
    status);
  details.addEventListener('toggle', () => { if(details.open) opened.add(a.id); else opened.delete(a.id); });
  return h('article', { class: 'odev-item', id: `odev-${a.id}` },
    h('span', { class: `odev-icon${a.done ? ' done' : ''}`, 'aria-hidden': 'true' }, a.done ? '✓' : '✎'),
    h('div', { class: 'odev-main' },
      h('div', { class: 'odev-head' },
        h('h3', {}, a.title),
        h('span', { class: 'acc-badges' },
          count ? h('span', { class: `acc-badge ${count.solved === count.total ? 'success' : ''}` }, `${count.solved}/${count.total} ${t('odevSolvedCount')}`) : null,
          a.done ? h('span', { class: 'acc-badge success' }, `${t('assignDoneOn')} · ${fmt(a.doneAt)}`) : null,
          overdue ? h('span', { class: 'acc-badge warning' }, t('assignOverdue')) : null)),
      h('p', { class: 'odev-meta' }, a.due ? `${t('assignDue')}: ${fmt(a.due)}` : t('odevNoDue')),
      details));
}

async function render(){
  const open = assignments.filter((a) => !a.done).length;
  $('odevCounts').replaceChildren(
    h('span', { class: 'odev-count' }, `${t('odevOpenCount')}: ${open}`),
    h('span', { class: 'odev-count' }, `${t('odevDoneCount')}: ${assignments.length - open}`));
  const nodes = await Promise.all(assignments.map(async (a) => ({ created: a.created, node: await card(a) })));
  const days = groupByDay(nodes);
  $('odevDays').replaceChildren(...(days.length
    ? days.map((d) => h('section', { class: 'odev-day', 'aria-label': d.label },
      h('h2', { class: 'odev-day-title' }, d.label),
      h('div', { class: 'odev-day-list' }, d.items.map((x) => x.node))))
    : [h('p', { class: 'acc-empty' }, t('odevEmpty'))]));
}

async function start(){
  const user = await currentUser();
  if(!user){
    clearHint();
    location.replace('giris.html');
    return;
  }
  if(user.uid === TEACHER_UID){
    location.replace('ogretmen-odevler.html');
    return;
  }
  try{
    profile = await loadProfile(user.uid);
    if(!profile){
      location.replace('kayit.html');
      return;
    }
    $('odevLoading').hidden = true;
    if(accountState(profile) !== 'active'){
      $('odevInactive').hidden = false;
      return;
    }
    uid = user.uid;
    syncLang(uid, profile, lang());
    const [list, res] = await Promise.all([loadAssignments(uid), loadResults(uid)]);
    assignments = list.map(normalizeAssignment);
    results = res;
    await render();
    $('odevApp').hidden = false;
    if(location.hash.startsWith('#odev-')) document.getElementById(location.hash.slice(1))?.scrollIntoView();
  }catch(error){
    console.error(error);
    $('odevLoading').hidden = true;
    $('odevError').hidden = false;
  }
}

window.addEventListener('ba:languagechange', () => {
  if(!uid) return;
  syncLang(uid, profile, lang());
  render();
});

if(!configured){
  $('notConfigured').hidden = false;
  $('odevLoading').hidden = true;
}else{
  start();
}
