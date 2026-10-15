// panel.html: öğrenci paneli. Onay durumuna göre bilgi ekranı ya da alıştırma geçmişi.
import { auth, configured, db, fa, fs } from './firebase.js';
import { TEACHER_EMAIL, TEACHER_UID } from './config.js';
import { registerStrings, t, lang } from './i18n.js';
import {
  $, accountState, bestResultSince, clearHint, currentUser, exerciseNames, exerciseUrl, formatDateTime, h,
  loadAssignments, loadProfile, loadResources, loadResults, safeLink, scoreText, sendVerification, setHint, setStatus,
  summarizeResults, syncEmailVerified, toDate, validStudentDocUrl
} from './common.js';

registerStrings();

let profile = null;
let results = [];
let assignments = [];
let resources = [];
let currentAuthUser = null;

const STATES = {
  pending: ['panelPendingTitle', 'panelPendingText'],
  parent: ['panelParentTitle', 'panelParentText'],
  inactive: ['panelInactiveTitle', 'panelInactiveText']
};

function renderState(){
  const state = accountState(profile);
  const texts = STATES[state];
  $('stateCard').hidden = !texts;
  $('historySection').hidden = state !== 'active';
  if(texts){
    $('stateTitle').textContent = t(texts[0]);
    $('stateText').textContent = t(texts[1]);
  }
}

// Masaüstünde tablo, telefonda her satır bir kart (css/account.css, data-label).
async function renderHistory(){
  const box = $('historyList');
  if(!results.length){
    box.replaceChildren(
      h('div', { class: 'acc-empty' },
        h('p', {}, t('panelHistoryEmpty')),
        h('a', { class: 'btn primary', href: 'index.html#exercises' }, t('panelHistoryLink')))
    );
    return;
  }
  const names = await exerciseNames(results, lang());
  const cols = ['panelColExercise', 'panelColLevel', 'panelColLast', 'panelColBest', 'panelColAttempts', 'panelColDate'].map(t);
  const rows = summarizeResults(results).map((g) => {
    const name = names[g.key];
    return h('tr', {},
      h('td', { 'data-label': cols[0] }, h('strong', {}, name.exercise), h('span', { class: 'acc-sub' }, name.topic)),
      h('td', { 'data-label': cols[1] }, g.level),
      h('td', { 'data-label': cols[2], class: 'acc-num' }, scoreText(g.last)),
      h('td', { 'data-label': cols[3], class: 'acc-num' }, scoreText(g.best)),
      h('td', { 'data-label': cols[4], class: 'acc-num' }, String(g.attempts.length)),
      h('td', { 'data-label': cols[5] }, formatDateTime(g.last.at, { lang: lang() }))
    );
  });
  box.replaceChildren(
    h('div', { class: 'acc-table-wrap' },
      h('table', { class: 'acc-table' },
        h('thead', {}, h('tr', {}, cols.map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, rows)))
  );
}

const fmt = (value) => formatDateTime(value, { lang: lang() });

// Öğrenci sadece "tamamladım", tamamlama zamanı ve kendi doküman linkini değiştirebilir (kurallar).
async function saveAssignment(a, changes, statusEl){
  try{
    await fs.updateDoc(fs.doc(db, 'users', currentAuthUser.uid, 'assignments', a.id), changes);
    assignments = await loadAssignments(currentAuthUser.uid);
    await renderAssignments();
  }catch(error){
    console.error(error);
    setStatus(statusEl, 'error', t('assignSaveFailed'));
  }
}

function docBlock(a){
  if(!a.docUrl) return null;
  return h('div', { class: 'acc-assign-doc' },
    h('a', { class: 'btn ghost', href: a.docUrl, target: '_blank', rel: 'noopener noreferrer' }, t(a.copyPerStudent ? 'assignCopyDoc' : 'assignOpenDoc')),
    a.copyPerStudent ? h('p', { class: 'acc-hint' }, t('assignCopyHint')) : null);
}

function exerciseList(a, names){
  if(!(a.exercises || []).length) return null;
  return h('div', { class: 'acc-assign-exercises' },
    h('h4', {}, t('assignExercises')),
    h('ul', { class: 'acc-status-list' }, a.exercises.map((e) => {
      const n = names[`${e.level}/${e.topic}/${e.exercise}`];
      const best = bestResultSince(results, e, a.createdAt);
      return h('li', {},
        h('a', { class: 'ba-link', href: exerciseUrl(e) }, `${e.level} · ${n?.exercise || e.exercise}`),
        h('span', { class: `acc-badge ${best ? 'success' : ''}` }, best ? `${t('assignSolved')} · ${scoreText(best)}` : t('assignNotSolved')));
    })));
}

function activeCard(a, names, index){
  const due = toDate(a.dueAt);
  const overdue = due && due < new Date();
  const inputId = `myDoc-${index}`;
  const input = h('input', { id: inputId, type: 'url', inputmode: 'url', value: a.studentDocUrl || '', placeholder: 'https://docs.google.com/…', autocomplete: 'off', 'aria-describedby': `${inputId}-hint` });
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const readLink = () => {
    const url = input.value.trim();
    if(!validStudentDocUrl(url)){
      setStatus(status, 'error', t('assignBadLink'));
      input.focus();
      return null;
    }
    return url;
  };
  const saveLink = h('button', { class: 'btn ghost', type: 'button' }, t('assignSaveLink'));
  saveLink.addEventListener('click', () => {
    const url = readLink();
    if(url === null) return;
    saveAssignment(a, { studentDocUrl: url }, status);
  });
  const done = h('button', { class: 'btn primary', type: 'button' }, t('assignMarkDone'));
  done.addEventListener('click', () => {
    const url = readLink();
    if(url === null) return;
    done.disabled = true;
    saveAssignment(a, { done: true, doneAt: fs.serverTimestamp(), studentDocUrl: url }, status).finally(() => { done.disabled = false; });
  });
  return h('article', { class: 'ba-card acc-card acc-assign' },
    h('div', { class: 'ba-card-body' },
      h('header', { class: 'acc-assign-head' },
        h('h3', {}, a.title),
        h('p', { class: 'acc-assign-due' }, `${t('assignDue')}: ${fmt(due)}`, overdue ? h('span', { class: 'acc-badge warning' }, t('assignOverdue')) : null)),
      a.description ? h('p', { class: 'acc-assign-text' }, a.description) : null,
      exerciseList(a, names),
      docBlock(a),
      h('div', { class: 'field acc-assign-link' },
        h('label', { for: inputId }, t('assignMyDoc')),
        input,
        h('small', { class: 'acc-hint', id: `${inputId}-hint` }, t('assignMyDocHint'))),
      h('div', { class: 'acc-actions' }, done, saveLink),
      status));
}

function doneRow(a){
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const undo = h('button', { class: 'acc-text-button', type: 'button' }, t('assignUndo'));
  undo.addEventListener('click', () => saveAssignment(a, { done: false, doneAt: null }, status));
  return h('article', { class: 'acc-row acc-assign-row' },
    h('div', { class: 'acc-row-main' },
      h('span', { class: 'acc-row-name' }, a.title),
      h('span', { class: 'acc-badges' }, h('span', { class: 'acc-badge success' }, `${t('assignDoneOn')} · ${fmt(a.doneAt)}`))),
    h('dl', { class: 'acc-row-meta' },
      h('div', {}, h('dt', {}, t('assignDue')), h('dd', {}, fmt(a.dueAt))),
      a.studentDocUrl ? h('div', {}, h('dt', {}, t('assignMyDocLink')), h('dd', {}, safeLink(a.studentDocUrl, t('assignOpenDoc')))) : null),
    h('div', { class: 'acc-row-actions' }, undo),
    status);
}

// Aktif ödevler teslim tarihine göre (en yakın önce), tamamlananlar tamamlanma tarihine göre (en yeni önce).
async function renderAssignments(){
  const names = await exerciseNames(assignments.flatMap((a) => a.exercises || []), lang());
  const active = assignments.filter((a) => !a.done).sort((a, b) => (toDate(a.dueAt) || 0) - (toDate(b.dueAt) || 0));
  const done = assignments.filter((a) => a.done).sort((a, b) => (toDate(b.doneAt) || 0) - (toDate(a.doneAt) || 0));
  $('assignList').replaceChildren(...(active.length
    ? [h('div', { class: 'acc-stack' }, active.map((a, i) => activeCard(a, names, i)))]
    : [h('p', { class: 'acc-empty' }, t('panelAssignEmpty'))]));
  $('doneList').replaceChildren(...(done.length
    ? [h('div', { class: 'acc-list' }, done.map(doneRow))]
    : [h('p', { class: 'acc-hint' }, t('panelDoneEmpty'))]));
}

function renderResources(){
  $('resourceList').replaceChildren(...(resources.length
    ? [h('ul', { class: 'acc-resource-list' }, resources.map((r) =>
      h('li', {}, h('div', {}, safeLink(r.url, r.title), r.note ? h('span', { class: 'acc-sub' }, r.note) : null))))]
    : [h('p', { class: 'acc-hint' }, t('panelResourcesEmpty'))]));
}

function renderAccount(){
  $('panelName').textContent = profile.name ? `, ${profile.name}` : '';
  $('accName').textContent = profile.name;
  $('accEmail').textContent = profile.email;
  const subject = encodeURIComponent(t('panelDeleteSubject'));
  const body = encodeURIComponent(`${profile.name}\n${profile.email}`);
  $('deleteRequest').href = `mailto:${TEACHER_EMAIL}?subject=${subject}&body=${body}`;
}

async function render(){
  renderAccount();
  renderState();
  const active = accountState(profile) === 'active';
  for(const id of ['assignSection', 'doneSection', 'resourceSection']) $(id).hidden = !active;
  if(active){
    await renderAssignments();
    renderResources();
    await renderHistory();
  }
}

async function start(){
  const user = await currentUser();
  if(!user){
    clearHint();
    location.replace('giris.html');
    return;
  }
  if(user.uid === TEACHER_UID){
    location.replace('ogretmen.html');
    return;
  }
  try{
    profile = await loadProfile(user.uid);
    if(!profile){
      location.replace('kayit.html');
      return;
    }
    setHint('student');
    currentAuthUser = user;
    const verified = await syncEmailVerified(user, profile).catch((error) => { console.warn(error); return false; });
    $('verifyCard').hidden = verified;
    if(accountState(profile) === 'active'){
      [results, assignments, resources] = await Promise.all([loadResults(user.uid), loadAssignments(user.uid), loadResources(user.uid)]);
    }
    $('panelLoading').hidden = true;
    $('panelLayout').hidden = false;
    await render();
  }catch(error){
    console.error(error);
    $('panelLoading').hidden = true;
    $('panelError').hidden = false;
  }
}

$('logoutBtn').addEventListener('click', async () => {
  await fa.signOut(auth);
  clearHint();
  location.replace('index.html');
});

$('verifyResend').addEventListener('click', async () => {
  const button = $('verifyResend');
  button.disabled = true;
  try{
    await sendVerification(currentAuthUser, lang());
    setStatus($('verifyStatus'), 'success', t('panelVerifySent'));
  }catch(error){
    console.error(error);
    setStatus($('verifyStatus'), 'error', t('panelVerifyFailed'));
    button.disabled = false;
  }
});

window.addEventListener('ba:languagechange', () => { if(profile) render(); });

if(!configured){
  $('notConfigured').hidden = false;
  $('panelLoading').hidden = true;
}else{
  start();
}
