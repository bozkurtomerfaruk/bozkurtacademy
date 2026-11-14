// panel.html: öğrenci paneli. Onay durumuna göre bilgi ekranı ya da alıştırma geçmişi.
import { auth, configured, db, fa, fs } from './firebase.js';
import { TEACHER_EMAIL, TEACHER_UID } from './config.js';
import { registerStrings, t, lang } from './i18n.js';
import { feedbackView } from './writing-feedback.js?v=1';
import {
  $, accountState, bestResultSince, clearHint, currentUser, exerciseNames, exerciseUrl, formatDateTime, h,
  loadAssignments, loadProfile, loadResources, loadResults, loadWritings, safeLink, scoreText, sendVerification, setHint, setStatus,
  summarizeResults, syncEmailVerified, toDate, unseenFeedback, validStudentDocUrl, writingTitle, writingUrl
} from './common.js';

registerStrings();

let profile = null;
let results = [];
let assignments = [];
let lessons = [];
let resources = [];
let writings = [];
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
      h('td', { 'data-label': cols[1] }, name.level || g.level),
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

// Schreiben: gönderdiğin metinler ve öğretmenin geri bildirimi. Yeni geri bildirim, açılana kadar işaretli kalır;
// açınca "görüldü" zamanı yazılır (firestore.rules: öğrenci sadece seenAt'i değiştirebilir).
async function markSeen(w){
  if(!unseenFeedback(w)) return;
  try{
    await fs.updateDoc(fs.doc(db, 'users', currentAuthUser.uid, 'writings', w.id), { seenAt: fs.serverTimestamp() });
    w.seenAt = new Date();
    renderWritingBadges();
  }catch(error){ console.warn(error); }
}

function renderWritingBadges(){
  const fresh = writings.filter(unseenFeedback).length;
  $('writingNew').hidden = !fresh;
  $('writingNew').textContent = fresh ? t('panelWritingNewCount').replace('{n}', String(fresh)) : '';
  $('writingAlert').hidden = !fresh;
  $('writingAlertText').textContent = fresh ? t('panelWritingAlert').replace('{n}', String(fresh)) : '';
  document.querySelectorAll('[data-writing-new]').forEach((el) => {
    const w = writings.find((x) => x.id === el.dataset.writingNew);
    el.hidden = !w || !unseenFeedback(w);
  });
}

// Hatalı yerler metinde numaralı işaretlenir; numara aşağıdaki listedeki düzeltmeyle aynıdır. Her öneri metinde
// ilk (önceki işaretlerle çakışmayan) geçtiği yerde işaretlenir.
function markedText(text, items){
  if(!items?.length) return text;
  const spans = [];
  items.forEach((item, n) => {
    let from = 0;
    while(item.original){
      const at = text.indexOf(item.original, from);
      if(at < 0) break;
      const end = at + item.original.length;
      if(!spans.some((s) => at < s.end && end > s.at)){ spans.push({ at, end, n: n + 1 }); break; }
      from = at + 1;
    }
  });
  spans.sort((a, b) => a.at - b.at);
  const out = [];
  let pos = 0;
  for(const s of spans){
    out.push(text.slice(pos, s.at), h('mark', {}, text.slice(s.at, s.end), h('sup', { class: 'acc-mark-no' }, String(s.n))));
    pos = s.end;
  }
  out.push(text.slice(pos));
  return out;
}

// by: 'teacher' → öğretmen bu maddeyi düzeltti ya da kendisi ekledi; diğerleri yapay zekâdan, öğretmen aynen bıraktı.
function correctionList(items, labels = false){
  return h('ol', { class: 'acc-feedback-items', lang: 'tr' }, ...items.map((item) => h('li', {},
    h('span', { lang: 'de' }, h('del', {}, item.original), ' → ', h('ins', {}, item.korrektur)),
    item.erklaerung ? h('span', {}, ' ', item.erklaerung) : null,
    labels ? h('span', { class: `acc-badge ${item.by === 'teacher' ? 'success' : 'muted'} acc-item-by`, 'data-item-by': item.by === 'teacher' ? 'teacher' : 'ai' },
      t(item.by === 'teacher' ? 'panelWritingByTeacher' : 'panelWritingByAi')) : null)));
}

function correctedBlock(text){
  return text ? h('details', { class: 'acc-details' }, h('summary', {}, t('panelWritingCorrected')), h('div', { class: 'acc-writing-text', lang: 'de' }, text)) : null;
}

function teacherFeedback(w){
  const source = w.feedbackSource === 'ai-approved' ? 'panelWritingAiApproved' : w.feedbackSource === 'ai-edited' ? 'panelWritingAiEdited' : null;
  return h('div', { class: 'acc-feedback-block', 'data-writing-feedback': w.id },
    h('p', { class: 'acc-sub' }, t('panelWritingFeedbackFrom').replace('{date}', fmt(w.feedbackAt))),
    w.feedback ? h('p', { class: 'acc-feedback', lang: 'tr' }, w.feedback) : null,
    source ? h('p', { class: 'acc-sub' }, t(source)) : null,
    w.feedbackItems?.length ? h('p', { class: 'acc-sub' }, h('strong', {}, t('panelWritingCorrections'))) : null,
    w.feedbackItems?.length ? correctionList(w.feedbackItems, Boolean(w.aiFeedback)) : null,
    removedNote(w),
    correctedBlock(w.correctedText));
}

// Öğretmen yapay zekânın bazı maddelerini çıkardıysa öğrenci bunu bilsin (daha önce o maddeleri görmüştü).
function removedNote(w){
  if(!w.aiFeedback?.errors?.length || !w.feedbackSource || w.feedbackSource === 'teacher') return null;
  const kept = new Set((w.feedbackItems || []).map((item) => item.original));
  const removed = w.aiFeedback.errors.filter((item) => !kept.has(item.original));
  if(!removed.length) return null;
  return h('p', { class: 'acc-sub', 'data-writing-removed': String(removed.length) },
    t('panelWritingRemoved').replace('{items}', removed.map((item) => `„${item.original}“`).join(', ')));
}

// Yapay zekâ geri bildirimi (js/account/writing-feedback.js): metin içinde işaretli hatalar, açıklamalar, düzeltilmiş metin.
// Öğretmen henüz yazmadıysa her maddede "Bu açıklama yanlış görünüyor" düğmesi vardır (aiFlags; öğretmen paneline düşer).
function flagWriting(w, index){
  return fs.updateDoc(fs.doc(db, 'users', currentAuthUser.uid, 'writings', w.id), {
    aiFlags: fs.arrayUnion(index), aiFlaggedAt: fs.serverTimestamp()
  }).then(() => { w.aiFlags = [...(w.aiFlags || []), index]; });
}
function autoFeedback(w){
  return h('div', { class: 'acc-feedback-block acc-ai-auto', 'data-writing-auto': w.id },
    feedbackView({ text: w.text, feedback: w.aiFeedback, flags: w.aiFlags || [], t, onFlag: w.feedbackAt ? null : (index) => flagWriting(w, index) }),
    !w.feedbackAt && w.aiFlags?.length ? h('p', { class: 'acc-sub' }, t('panelWritingFlagSent')) : null);
}

// Düzeltilmiş hâller (revisionOf) ilk metnin altında, eskiden yeniye; gruplar en yeni denemeye göre sıralanır.
function groupWritings(list){
  const byId = new Map(list.map((w) => [w.id, w]));
  const rootOf = (w) => { let cur = w, n = 0; while(cur.revisionOf && byId.has(cur.revisionOf) && n++ < 50) cur = byId.get(cur.revisionOf); return cur.id; };
  const groups = new Map();
  for(const w of list){ const root = rootOf(w); if(!groups.has(root)) groups.set(root, []); groups.get(root).push(w); }
  const time = (w) => toDate(w.at)?.getTime() || 0;
  return [...groups.values()]
    .map((g) => g.sort((a, b) => time(a) - time(b)))
    .sort((a, b) => time(b.at(-1)) - time(a.at(-1)))
    .flatMap((g) => g.map((w, i) => ({ w, attempt: i + 1, of: g.length })));
}

async function renderWritings(){
  const box = $('writingList');
  if(!writings.length){
    box.replaceChildren(h('div', { class: 'acc-empty' },
      h('p', {}, t('panelWritingEmpty')),
      h('a', { class: 'btn primary', href: 'index.html#exams/goethe/b1/schreiben' }, t('panelWritingLink'))));
    renderWritingBadges();
    return;
  }
  const rows = groupWritings(writings);
  const titles = await Promise.all(rows.map(({ w }) => writingTitle(w)));
  box.replaceChildren(...rows.map(({ w, attempt, of }, i) => {
    const has = Boolean(w.feedbackAt || w.aiAt);
    // Öğretmen maddeleri düzelttiyse (feedbackItems) onun listesi; sadece not yazdıysa not + yapay zekâ geri bildirimi.
    const teacherItems = Boolean(w.feedbackAt && (w.feedbackItems?.length || (w.feedbackSource && w.feedbackSource !== 'teacher')));
    const auto = w.aiFeedback && !teacherItems ? autoFeedback(w) : null;
    const feedback = w.feedbackAt ? teacherFeedback(w)
      : auto ? null
      : h('p', { class: 'acc-sub' }, t(w.aiSkip === 'limit' ? 'panelWritingWaitingLimit' : 'panelWritingWaiting'));
    const item = h('details', { class: `ba-card acc-card acc-writing${attempt > 1 ? ' acc-writing-revision' : ''}`, 'data-writing': w.id, 'data-attempt': String(attempt) },
      h('summary', {},
        h('span', { class: 'acc-writing-title' }, h('span', { class: 'acc-new-dot', 'data-writing-new': w.id, 'aria-hidden': 'true', hidden: !unseenFeedback(w) }),
          `${fmt(w.at)} · ${titles[i]}`),
        h('span', { class: 'acc-badges' },
          of > 1 ? h('span', { class: 'acc-badge', 'data-writing-attempt': String(attempt) }, t('panelWritingAttempt').replace('{n}', String(attempt))) : null,
          h('span', { class: 'acc-badge' }, t('panelWritingWords').replace('{n}', String(w.words))),
          has
            ? h('span', { class: `acc-badge ${unseenFeedback(w) ? 'warning' : 'success'}`, 'data-writing-state': w.id }, t(unseenFeedback(w) ? 'panelWritingNew' : 'panelWritingDone'))
            : h('span', { class: 'acc-badge' }, t('panelWritingPending')))),
      h('div', { class: 'acc-card-body' },
        feedback,
        auto,
        auto ? null : h('p', { class: 'acc-sub' }, t('panelWritingMine')),
        auto ? null : h('div', { class: 'acc-writing-text', lang: 'de', 'data-writing-text': w.id }, markedText(w.text, w.feedbackAt ? w.feedbackItems : null)),
        h('a', { class: 'ba-link', href: writingUrl(w) }, t('panelWritingOpenTask'))));
    item.addEventListener('toggle', () => {
      if(!item.open || !unseenFeedback(w)) return;
      markSeen(w).then(() => {
        const state = item.querySelector(`[data-writing-state="${CSS.escape(w.id)}"]`);
        if(state){ state.className = 'acc-badge success'; state.textContent = t('panelWritingDone'); }
      });
    });
    return item;
  }));
  renderWritingBadges();
}

async function loadLessons(uid){
  const snap = await fs.getDocs(fs.collection(db, 'users', uid, 'lessons'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data(), startAt: toDate(d.data().startAt) }));
}

// Yaklaşan dersler öğrencinin kendi saat diliminde; farklıysa Berlin saati de yazılır.
// "Görüşmeye katıl" dersten 10 dakika önce belirginleşir ve ders bitene kadar öyle kalır.
function renderLessons(){
  const now = Date.now();
  const end = (l) => l.startAt.getTime() + (l.durationMin || 50) * 60000;
  const upcoming = lessons.filter((l) => l.status === 'scheduled' && end(l) > now).sort((a, b) => a.startAt - b.startAt).slice(0, 10);
  const locale = { tr: 'tr-TR', de: 'de-DE', en: 'en-GB' }[lang()] || 'tr-TR';
  const day = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' });
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  const berlin = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' });
  $('lessonList').replaceChildren(...(upcoming.length
    ? [h('ul', { class: 'acc-lesson-cards' }, upcoming.map((l) => {
      const start = l.startAt.getTime();
      const live = now >= start && now < end(l);
      const soon = !live && start - now <= 10 * 60000;
      const local = `${time.format(l.startAt)}–${time.format(new Date(end(l)))}`;
      const inBerlin = `${berlin.format(l.startAt)}–${berlin.format(new Date(end(l)))}`;
      return h('li', { class: `ba-card acc-card acc-lesson${live || soon ? ' is-now' : ''}` },
        h('div', { class: 'ba-card-body' },
          h('p', { class: 'acc-lesson-day' }, day.format(l.startAt)),
          h('p', { class: 'acc-lesson-time' }, local,
            local !== inBerlin ? h('span', { class: 'acc-sub' }, `${inBerlin} ${t('lessonBerlin')}`) : null),
          h('p', { class: 'acc-sub' }, `${l.durationMin || 50} ${t('lessonMinutes')}`),
          live || soon ? h('p', { class: 'acc-lesson-alert' }, t(live ? 'lessonLive' : 'lessonStartsSoon')) : null,
          l.note ? h('p', { class: 'acc-assign-text' }, h('strong', {}, `${t('lessonNote')}: `), l.note) : null,
          l.meetUrl
            ? h('a', { class: `btn ${live || soon ? 'primary' : 'ghost'} acc-join-btn`, href: l.meetUrl, target: '_blank', rel: 'noopener noreferrer' }, t('lessonJoin'))
            : h('p', { class: 'acc-hint' }, t('lessonNoLink'))));
    }))]
    : [h('p', { class: 'acc-empty' }, t('panelLessonsEmpty'))]));
}

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
  for(const id of ['lessonSection', 'assignSection', 'doneSection', 'resourceSection', 'writingSection']) $(id).hidden = !active;
  if(active){
    renderLessons();
    await renderAssignments();
    renderResources();
    await renderWritings();
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
      [results, assignments, resources, lessons, writings] = await Promise.all([
        loadResults(user.uid), loadAssignments(user.uid), loadResources(user.uid), loadLessons(user.uid),
        loadWritings(user.uid).catch((error) => { console.warn(error); return []; })
      ]);
      // "Görüşmeye katıl" düğmesinin durumu zamanla değişir.
      setInterval(() => { if(!document.hidden) renderLessons(); }, 30000);
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
