// panel.html: öğrenci paneli. Onay durumuna göre bilgi ekranı ya da alıştırma geçmişi.
import { auth, configured, fa } from './firebase.js';
import { TEACHER_EMAIL, TEACHER_UID } from './config.js';
import { registerStrings, t, lang } from './i18n.js';
import {
  $, accountState, clearHint, currentUser, exerciseNames, formatDateTime, h, loadProfile, loadResults,
  scoreText, setHint, summarizeResults
} from './common.js';

registerStrings();

let profile = null;
let results = [];

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
  if(accountState(profile) === 'active') await renderHistory();
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
    if(accountState(profile) === 'active') results = await loadResults(user.uid);
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

window.addEventListener('ba:languagechange', () => { if(profile) render(); });

if(!configured){
  $('notConfigured').hidden = false;
  $('panelLoading').hidden = true;
}else{
  start();
}
