// ogretmen.html: öğrenci listesi, onay bekleyenler, veli onayı bekleyenler, silinmesi gereken kayıtlar.
import { $, exerciseNames, formatDateTime, BERLIN, h, safeLink } from './common.js';
import {
  approve, categorize, deleteAssignmentCopies, emailVerified, fmtDate, lastLessonByStudent, listStudents,
  AI_MODES, getAiMode, loadAiDrafts, loadAssignmentGroups, openDeleteDialog, pendingWritingsByStudent, setAiMode, requireTeacher, statusBadges, UNVERIFIED_WARNING
} from './teacher-common.js';
import { createModeration, permissionMessage } from './comments-moderation.js?v=2';
import { AI_WORKER_URL } from './config.js';

const TABS = ['ogrenciler', 'onay', 'veli', 'odevler', 'silinecek', 'yorumlar'];
let lists = null;
let groups = [];
let studentsById = new Map();
let pendingWritings = new Map(); // uid → { total, flagged }: bakılması gereken Schreiben metni (yapay zekâ kontrol etmedi ya da öğrenci madde işaretledi)
let aiDrafts = new Map(); // uid → yapay zekâ taslağı hazır metin sayısı (öğrenci görmez)
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
    ? items.map((s) => row(s, [['Kayıt', fmtDate(s.createdAt)], ['Onay', fmtDate(s.approvedAt)], ['Yazılar', writingBadge(s)]], [detailLink(s)]))
    : [empty(query ? 'Aramaya uyan öğrenci yok.' : 'Henüz onaylanmış öğrenci yok.')]));
}

// Schreiben: geri bildirim bekleyen metin varsa öğrencinin detayındaki "Yazma görevleri" bölümüne giden işaret.
function writingBadge(s){
  const { total: n = 0, flagged: f = 0 } = pendingWritings.get(s.id) || {};
  if(!n) return '—';
  const d = aiDrafts.get(s.id) || 0;
  return h('a', { class: 'acc-badge warning', href: `ogretmen-ogrenci.html?id=${encodeURIComponent(s.id)}#yazilar`, 'data-pending-writings': String(n), 'data-flagged-writings': String(f), 'data-ai-drafts': String(d) },
    `${n} yazı sana bakıyor` + (f ? ` · ${f} işaretli madde` : '') + (d ? ` · ${d} taslak hazır` : ''));
}

// Yapay zekâ modu (settings/ai): Anında göster (varsayılan; öğrenci hemen görür) / Taslak (öğrenci görmez) / Kapalı.
const MODE_LABELS = { off: 'Kapalı: sadece ben geri bildirim yazarım', draft: 'Taslak: önce ben bakarım (öğrenci görmez)', instant: 'Anında göster: öğrenci geri bildirimi hemen görür (varsayılan)' };
async function renderAiMode(){
  const box = $('aiMode');
  let mode;
  try{ mode = await getAiMode(); }catch(error){ console.warn(error); box.hidden = true; return; }
  const select = h('select', { id: 'aiModeSelect' }, ...AI_MODES.map((m) => h('option', { value: m, selected: m === mode }, MODE_LABELS[m])));
  const status = h('span', { class: 'acc-sub', role: 'status' });
  select.addEventListener('change', async () => {
    select.disabled = true;
    try{ await setAiMode(select.value); status.textContent = 'Kaydedildi.'; }
    catch(error){ console.error(error); status.textContent = 'Kaydedilemedi. Tekrar dene.'; }
    finally{ select.disabled = false; }
  });
  // replaceChildren null'ı "null" yazısına çevirir; boş öğeler ayıklanır.
  box.replaceChildren(...[h('label', { for: 'aiModeSelect' }, h('strong', {}, 'Schreiben yapay zekâ kontrolü')), select, status,
    h('span', { class: 'acc-sub', 'data-ai-mode-hint': '' }, 'Anında göster: öğrenci geri bildirimi görev sayfasında hemen görür; sen sadece işaretlenen maddelere ve yapay zekânın kontrol edemediği yazılara bakarsın. 16 yaş altında veli onayı eski formla alınmışsa sonuç yine taslak olarak sana gelir.'),
    AI_WORKER_URL ? null : h('span', { class: 'acc-sub' }, 'Worker henüz kurulmadı (docs/yapay-zeka-kurulum.md); kurulana kadar kontrol yapılmaz.')].filter(Boolean));
  box.hidden = false;
}

function renderWritingNotice(){
  const total = [...pendingWritings.values()].reduce((a, b) => a + b.total, 0);
  const flagged = [...pendingWritings.values()].reduce((a, b) => a + b.flagged, 0);
  const notice = $('writingNotice');
  notice.hidden = total === 0;
  if(total){
    const drafts = [...aiDrafts.values()].reduce((a, b) => a + b, 0);
    notice.dataset.flagged = String(flagged);
    notice.replaceChildren(`Sana bakan ${total} yazı var (${pendingWritings.size} öğrenci): ${flagged} yazıda öğrenci bir açıklamayı "yanlış görünüyor" diye işaretledi, ${total - flagged} yazıyı yapay zekâ kontrol etmedi`
      + (drafts ? `; ${drafts} yazı için yapay zekâ taslağı hazır` : '') + '. ',
      h('a', { class: 'ba-link', href: '#ogrenciler' }, 'Öğrenci listesinde işaretli'));
  }
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
    if(tab === 'yorumlar') continue; // yorum sayısını loadComments yazar
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
    const [students, lastLessons, assignmentGroups, writings, drafts] = await Promise.all([
      listStudents(),
      lastLessonByStudent(),
      loadAssignmentGroups().catch((error) => { console.warn(error); return []; }),
      pendingWritingsByStudent(),
      loadAiDrafts()
    ]);
    pendingWritings = writings;
    aiDrafts = new Map();
    for(const d of drafts) aiDrafts.set(d.uid, (aiDrafts.get(d.uid) || 0) + 1);
    lists = categorize(students, lastLessons);
    groups = assignmentGroups;
    studentsById = new Map(students.map((st) => [st.id, st]));
    renderCounts();
    renderWritingNotice();
    renderAiMode();
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
  loadComments();
  await load();
}

// "Yorumlar" sekmesi: /yonetim/yorumlar/ ile aynı onay ekranı (js/account/comments-moderation.js).
// Öğrenci listesi yüklenemese bile yorumlar ayrı yüklenir; sekmedeki sayı onay bekleyenlerdir.
function loadComments(){
  const status = $('commentsStatus');
  const setStatus = (type, message) => {
    status.hidden = !message;
    status.className = 'acc-status' + (type ? ' ' + type : '');
    status.textContent = message || '';
  };
  const moderation = createModeration({
    pendingList: $('commentsPending'),
    approvedList: $('commentsApproved'),
    onStatus: setStatus,
    onCounts: ({ pending }) => { document.querySelector('[data-count="yorumlar"]').textContent = String(pending); }
  });
  moderation.load().catch((error) => {
    console.error('[yorum onayı] Yorumlar okunamadı:', error?.code || '', error);
    setStatus('error', 'Yorumlar okunamadı: ' + permissionMessage(error));
  });
}
