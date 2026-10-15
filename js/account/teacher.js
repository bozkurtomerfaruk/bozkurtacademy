// ogretmen.html: öğrenci listesi, onay bekleyenler, veli onayı bekleyenler, silinmesi gereken kayıtlar.
import { $, exerciseNames, formatDateTime, BERLIN, h, safeLink } from './common.js';
import {
  approve, categorize, deleteAssignmentCopies, emailVerified, fmtDate, lastLessonByStudent, listStudents,
  loadAssignmentGroups, openDeleteDialog, requireTeacher, statusBadges, UNVERIFIED_WARNING
} from './teacher-common.js';

const TABS = ['ogrenciler', 'onay', 'veli', 'odevler', 'silinecek'];
let lists = null;
let groups = [];
let studentsById = new Map();
const fmtDateTime = (value) => formatDateTime(value, { lang: 'tr', timeZone: BERLIN });

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
      const warning = emailVerified(s) ? null : h('p', { class: 'acc-row-warning' }, UNVERIFIED_WARNING);
      return row(s, [['Kayıt', fmtDate(s.createdAt)], ['Doğum yılı', String(s.birthYear)]], [warning, approveBtn, detailLink(s)]);
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

async function renderAssignments(){
  const box = $('list-odevler');
  if(!groups.length){
    box.replaceChildren(empty('Henüz ödev verilmedi.'));
    return;
  }
  const names = await exerciseNames(groups.flatMap((g) => g.exercises), 'tr');
  box.replaceChildren(...groups.map((g) => {
    const done = g.copies.filter((c) => c.done).length;
    const overdue = g.dueAt && g.dueAt < new Date();
    const students = g.copies
      .map((c) => ({ ...c, student: studentsById.get(c.uid) }))
      .sort((a, b) => (a.student?.name || '').localeCompare(b.student?.name || '', 'tr'));
    const deleteBtn = h('button', { class: 'btn danger acc-row-action', type: 'button' }, 'Sil');
    deleteBtn.addEventListener('click', async () => {
      if(!confirm(`"${g.title}" ödevi ${g.copies.length} öğrenciden silinsin mi? Öğrencilerin işaretleri de silinir.`)) return;
      deleteBtn.disabled = true;
      try{
        await deleteAssignmentCopies(g.copies.map((c) => c.ref));
        await load();
      }catch(error){
        console.error(error);
        deleteBtn.disabled = false;
        showError('Ödev silinemedi. Tekrar dene.');
      }
    });
    return h('article', { class: 'acc-row acc-assign-row' },
      h('div', { class: 'acc-row-main' },
        h('span', { class: 'acc-row-name' }, g.title),
        h('span', { class: 'acc-badges' },
          h('span', { class: `acc-badge ${done === g.copies.length ? 'success' : ''}` }, `${done}/${g.copies.length} tamamladı`),
          overdue && done < g.copies.length ? h('span', { class: 'acc-badge warning' }, 'Süresi geçti') : null)),
      h('dl', { class: 'acc-row-meta' },
        h('div', {}, h('dt', {}, 'Teslim'), h('dd', {}, fmtDateTime(g.dueAt))),
        h('div', {}, h('dt', {}, 'Alıştırma'), h('dd', {}, String(g.exercises.length))),
        g.docUrl ? h('div', {}, h('dt', {}, 'Doküman'), h('dd', {}, safeLink(g.docUrl, 'Aç'))) : null),
      h('div', { class: 'acc-row-actions' }, deleteBtn),
      h('details', { class: 'acc-details acc-row-full' },
        h('summary', {}, 'Öğrenciler ve alıştırmalar'),
        g.exercises.length ? h('ul', { class: 'acc-plain-list' }, g.exercises.map((e) => {
          const n = names[`${e.level}/${e.topic}/${e.exercise}`];
          return h('li', {}, `${e.level} · ${n?.topic || e.topic} · ${n?.exercise || e.exercise}`);
        })) : null,
        h('ul', { class: 'acc-status-list' }, students.map((c) => h('li', {},
          c.student
            ? h('a', { class: 'ba-link', href: `ogretmen-ogrenci.html?id=${encodeURIComponent(c.uid)}` }, c.student.name)
            : h('span', {}, 'Silinmiş öğrenci'),
          h('span', { class: `acc-badge ${c.done ? 'success' : ''}` }, c.done ? `Tamamladı · ${fmtDateTime(c.doneAt)}` : 'Bekliyor'),
          c.studentDocUrl ? safeLink(c.studentDocUrl, 'Öğrencinin dokümanı') : null))))
    );
  }));
}

function renderCounts(){
  for(const tab of TABS){
    const el = document.querySelector(`[data-count="${tab}"]`);
    el.textContent = String(tab === 'odevler' ? groups.length : lists[tab].length);
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
    // Ödevler okunamasa bile öğrenci listesi açılsın.
    const [students, lastLessons, assignmentGroups] = await Promise.all([
      listStudents(),
      lastLessonByStudent(),
      loadAssignmentGroups().catch((error) => { console.warn(error); return []; })
    ]);
    lists = categorize(students, lastLessons);
    groups = assignmentGroups;
    studentsById = new Map(students.map((st) => [st.id, st]));
    renderCounts();
    renderStudents();
    renderPending();
    renderParent();
    renderStale();
    await renderAssignments();
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
  if(new URLSearchParams(location.search).get('odev') === 'verildi'){
    $('assignNotice').hidden = false;
    $('assignNotice').className = 'acc-status success';
    $('assignNotice').textContent = 'Ödev verildi.';
    history.replaceState(null, '', `ogretmen.html${location.hash}`);
  }
  showTab(location.hash.slice(1));
  await load();
}
