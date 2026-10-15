// ogretmen.html: öğrenci listesi, onay bekleyenler, veli onayı bekleyenler, silinmesi gereken kayıtlar.
import { $, h } from './common.js';
import {
  approve, categorize, fmtDate, lastLessonByStudent, listStudents, openDeleteDialog, requireTeacher, statusBadges
} from './teacher-common.js';

const TABS = ['ogrenciler', 'onay', 'veli', 'silinecek'];
let lists = null;

const detailLink = (s) => h('a', { class: 'btn ghost acc-row-action', href: `ogretmen-ogrenci.html?id=${encodeURIComponent(s.id)}` }, 'Detay');

function studentHead(s){
  return h('div', { class: 'acc-row-main' },
    h('a', { class: 'acc-row-name', href: `ogretmen-ogrenci.html?id=${encodeURIComponent(s.id)}` }, s.name),
    h('span', { class: 'acc-sub' }, s.email),
    statusBadges(s)
  );
}

function row(s, meta, actions){
  return h('article', { class: 'acc-row' },
    studentHead(s),
    h('dl', { class: 'acc-row-meta' }, meta.map(([dt, dd]) => h('div', {}, h('dt', {}, dt), h('dd', {}, dd)))),
    h('div', { class: 'acc-row-actions' }, actions)
  );
}

function empty(text){
  return h('p', { class: 'acc-empty' }, text);
}

function renderStudents(){
  const query = $('studentFilter').value.trim().toLocaleLowerCase('tr');
  const items = lists.ogrenciler.filter((s) =>
    !query || s.name?.toLocaleLowerCase('tr').includes(query) || s.email?.toLocaleLowerCase('tr').includes(query));
  $('list-ogrenciler').replaceChildren(...(items.length
    ? items.map((s) => row(s, [['Kayıt', fmtDate(s.createdAt)], ['Onay', fmtDate(s.approvedAt)]], [detailLink(s)]))
    : [empty(query ? 'Aramaya uyan öğrenci yok.' : 'Henüz onaylanmış öğrenci yok.')]));
}

function renderPending(){
  $('list-onay').replaceChildren(...(lists.onay.length
    ? lists.onay.map((s) => {
      const approveBtn = h('button', { class: 'btn primary acc-row-action', type: 'button' }, 'Onayla');
      approveBtn.addEventListener('click', async () => {
        approveBtn.disabled = true;
        try{
          await approve(s.id);
          await load();
        }catch(error){
          console.error(error);
          approveBtn.disabled = false;
          showError('Onaylanamadı. Tekrar dene.');
        }
      });
      return row(s, [['Kayıt', fmtDate(s.createdAt)], ['Doğum yılı', String(s.birthYear)]], [approveBtn, detailLink(s)]);
    })
    : [empty('Onay bekleyen kayıt yok.')]));
}

function renderParent(){
  $('list-veli').replaceChildren(...(lists.veli.length
    ? lists.veli.map((s) => row(s, [
      ['Veli', s.parent?.name || '—'],
      ['Veli e-postası', s.parent?.email || '—'],
      ['Kayıt', fmtDate(s.createdAt)]
    ], [detailLink(s)]))
    : [empty('Veli onayı bekleyen kayıt yok.')]));
}

function renderStale(){
  $('list-silinecek').replaceChildren(...(lists.silinecek.length
    ? lists.silinecek.map(({ student, reason }) => {
      const deleteBtn = h('button', { class: 'btn danger acc-row-action', type: 'button' }, 'Sil');
      deleteBtn.addEventListener('click', () => openDeleteDialog($('deleteDialog'), student, {
        reason: `Neden: ${reason.text}.`,
        onDone: load
      }));
      return row(student, [['Neden', reason.text], [reason.label, fmtDate(reason.since)]], [deleteBtn, detailLink(student)]);
    })
    : [empty('Silinmesi gereken kayıt yok.')]));
}

function renderCounts(){
  for(const tab of TABS){
    const el = document.querySelector(`[data-count="${tab}"]`);
    el.textContent = String(lists[tab].length);
  }
  const stale = lists.silinecek.length;
  const warning = $('staleWarning');
  warning.hidden = stale === 0;
  if(stale){
    warning.replaceChildren(
      `Silinmesi gereken ${stale} kayıt var. `,
      h('a', { class: 'ba-link', href: '#silinecek' }, 'Listeyi aç')
    );
  }
}

function showTab(name, { focus = false } = {}){
  const tab = TABS.includes(name) ? name : 'ogrenciler';
  for(const t of TABS){
    const button = $(`tab-${t}`);
    const selected = t === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
    $(`panel-${t}`).hidden = !selected;
  }
  if(focus) $(`tab-${tab}`).focus();
  if(location.hash.slice(1) !== tab) history.replaceState(null, '', `#${tab}`);
}

function showError(message){
  $('teacherError').hidden = !message;
  $('teacherError').textContent = message || '';
}

async function load(){
  try{
    const [students, lastLessons] = await Promise.all([listStudents(), lastLessonByStudent()]);
    lists = categorize(students, lastLessons);
    renderCounts();
    renderStudents();
    renderPending();
    renderParent();
    renderStale();
    $('teacherLoading').hidden = true;
    $('teacherApp').hidden = false;
    showError('');
  }catch(error){
    console.error(error);
    $('teacherLoading').hidden = true;
    showError('Öğrenciler yüklenemedi. Firestore kurallarında öğretmen UID’inin doğru olduğundan emin ol (docs/kurulum.md).');
  }
}

for(const t of TABS){
  $(`tab-${t}`).addEventListener('click', () => showTab(t));
}
// Sekmeler arasında ok tuşlarıyla gezinme.
document.querySelector('.acc-tabs').addEventListener('keydown', (event) => {
  if(!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  const current = TABS.indexOf(document.activeElement?.dataset.tab);
  if(current < 0) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1
    : (current + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
  showTab(TABS[next], { focus: true });
});
window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
$('studentFilter').addEventListener('input', renderStudents);

const user = await requireTeacher({ loadingId: 'teacherLoading', errorId: 'teacherError' });
if(user){
  showTab(location.hash.slice(1));
  await load();
}
