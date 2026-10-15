// ogretmen-takvim.html: haftalık ve aylık ders takvimi (Berlin saati), yeni ders, taşıma, iptal,
// Google Calendar bağlantısı ve başarısız işlemler için "Tekrar dene".
import {
  $, addDaysToKey, BERLIN, berlinAt, berlinParts, h, setStatus, todayKey, weekStartKey
} from './common.js';
import * as cal from './calendar.js';
import {
  attendeesFor, cancelFollowing, cancelLesson, createLessons, DEFAULT_DURATION, loadAllLessons, MAX_WEEKS, moveLesson,
  parentInvited, retryFailed
} from './lessons.js';
import { isEnabled, listStudents, requireTeacher } from './teacher-common.js';

let lessons = [];
let students = new Map();
let view = 'week';
let anchor = todayKey();
let selectedDay = todayKey();

const fmt = (options) => new Intl.DateTimeFormat('tr-TR', { timeZone: BERLIN, ...options });
const fmtDayShort = fmt({ weekday: 'short', day: 'numeric' });
const fmtDayLong = fmt({ weekday: 'long', day: 'numeric', month: 'long' });
const fmtDateTime = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtMonth = fmt({ month: 'long', year: 'numeric' });
const fmtShortDate = fmt({ day: 'numeric', month: 'long' });
const noon = (key) => berlinAt(key, '12:00');
const endOf = (l) => new Date(l.startAt.getTime() + (l.durationMin || DEFAULT_DURATION) * 60000);

function notice(type, message){
  setStatus($('calNotice'), type, message);
  if(message) $('calNotice').scrollIntoView({ block: 'nearest' });
}

// ---- Google Calendar bağlantısı ----

function renderConnection(){
  const status = $('gcalStatus');
  const button = $('gcalConnect');
  if(!cal.calendarConfigured){
    status.className = 'acc-badge warning';
    status.textContent = 'Google Calendar ayarlanmadı';
    button.hidden = true;
  }else if(cal.isConnected()){
    status.className = 'acc-badge success';
    status.textContent = cal.usingMock ? 'Google Calendar bağlı (sahte, yerel test)' : 'Google Calendar bağlı';
    button.hidden = true;
  }else{
    status.className = 'acc-badge muted';
    status.textContent = 'Google Calendar bağlı değil';
    button.hidden = false;
  }
}

// Takvim izni düğmeye basıldığı anda istenir (açılır pencere engellenmesin). Hata dönerse ders yine kaydedilir.
async function ensureCalendar(){
  try{
    await cal.connect();
    return null;
  }catch(error){
    console.warn(error);
    return error;
  }finally{
    renderConnection();
  }
}

// ---- Senkron durumu ----

function failedLessons(){
  const stale = Date.now() - 5 * 60000;
  return lessons.filter((l) => l.calendarSync === 'failed'
    || (l.calendarSync === 'pending' && (l.updatedAt?.toDate?.() || new Date(0)).getTime() < stale));
}

function renderSyncBanner(){
  const failed = failedLessons();
  const banner = $('syncBanner');
  banner.hidden = !failed.length;
  if(!failed.length) return;
  const retry = h('button', { class: 'btn primary acc-row-action', type: 'button' }, 'Tekrar dene');
  retry.addEventListener('click', async () => {
    retry.disabled = true;
    const error = await ensureCalendar();
    const results = await retryFailed(failed, students, error);
    await reload();
    const bad = results.filter((r) => !r.ok).length;
    notice(bad ? 'error' : 'success', bad ? 'Google Calendar\'a eklenemedi, tekrar dene.' : 'Bütün dersler Google Calendar ile eşitlendi.');
  });
  banner.replaceChildren(
    h('span', {}, `Google Calendar'a eklenemedi, tekrar dene: ${failed.length} ders. Dersler sitede kayıtlı.`),
    retry
  );
}

// ---- Görünümler ----

const lessonsOn = (key) => lessons
  .filter((l) => berlinParts(l.startAt).key === key)
  .sort((a, b) => a.startAt - b.startAt);

function eventButton(l, { compact = false } = {}){
  const p = berlinParts(l.startAt);
  const classes = ['acc-cal-event'];
  if(l.status === 'cancelled') classes.push('is-cancelled');
  if(l.calendarSync === 'failed') classes.push('is-failed');
  const label = `${p.time} ${l.studentName || ''}${l.status === 'cancelled' ? ' (iptal)' : ''}${l.calendarSync === 'failed' ? ' (Takvim hatası)' : ''}`;
  const button = h('button', { class: classes.join(' '), type: 'button', 'aria-label': label },
    h('span', { class: 'acc-cal-time' }, p.time),
    compact ? null : h('span', { class: 'acc-cal-name' }, l.studentName || ''),
    l.calendarSync === 'failed' ? h('span', { class: 'acc-cal-flag', 'aria-hidden': 'true' }, '!') : null);
  button.addEventListener('click', () => openLesson(l));
  return button;
}

function agendaItem(l){
  const p = berlinParts(l.startAt);
  const end = berlinParts(endOf(l)).time;
  const item = h('li', { class: `acc-agenda-item${l.status === 'cancelled' ? ' is-cancelled' : ''}` },
    h('button', { class: 'acc-agenda-open', type: 'button' },
      h('span', { class: 'acc-cal-time' }, `${p.time}–${end}`),
      h('span', { class: 'acc-cal-name' }, l.studentName || ''),
      l.status === 'cancelled' ? h('span', { class: 'acc-badge muted' }, 'İptal') : null,
      l.calendarSync === 'failed' ? h('span', { class: 'acc-badge warning' }, 'Takvim hatası') : null),
    l.status === 'scheduled' && l.meetUrl
      ? h('a', { class: 'btn ghost acc-row-action', href: l.meetUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Görüşmeye katıl')
      : null);
  item.querySelector('.acc-agenda-open').addEventListener('click', () => openLesson(l));
  return item;
}

function renderWeek(){
  const start = weekStartKey(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDaysToKey(start, i));
  $('calLabel').textContent = `${fmtShortDate.format(noon(days[0]))} – ${fmtShortDate.format(noon(days[6]))} ${berlinParts(noon(days[6])).y}`;
  const weekLessons = days.flatMap(lessonsOn);
  const hours = weekLessons.flatMap((l) => [berlinParts(l.startAt).hh, Math.ceil(berlinParts(endOf(l)).hh + berlinParts(endOf(l)).mm / 60)]);
  const fromH = Math.min(8, ...hours);
  const toH = Math.max(21, ...hours);
  const hourPx = 48;
  const today = todayKey();

  const grid = h('div', { class: 'acc-week', style: `--hours:${toH - fromH};--hour:${hourPx}px` },
    h('div', { class: 'acc-week-head' }, h('span'), days.map((d) => h('span', { class: d === today ? 'is-today' : '' }, fmtDayShort.format(noon(d))))),
    h('div', { class: 'acc-week-body' },
      h('div', { class: 'acc-week-hours' }, Array.from({ length: toH - fromH }, (_, i) => h('span', {}, `${String(fromH + i).padStart(2, '0')}:00`))),
      days.map((d) => h('div', { class: `acc-week-day${d === today ? ' is-today' : ''}` },
        lessonsOn(d).map((l) => {
          const p = berlinParts(l.startAt);
          const button = eventButton(l);
          button.style.top = `${((p.hh - fromH) * 60 + p.mm) / 60 * hourPx}px`;
          button.style.height = `${Math.max(24, (l.durationMin || DEFAULT_DURATION) / 60 * hourPx - 2)}px`;
          return button;
        })))));

  const agenda = h('ol', { class: 'acc-agenda' }, days.map((d) => {
    const items = lessonsOn(d);
    return h('li', { class: `acc-agenda-day${d === today ? ' is-today' : ''}` },
      h('h3', {}, fmtDayLong.format(noon(d))),
      items.length ? h('ul', {}, items.map(agendaItem)) : h('p', { class: 'acc-hint' }, 'Ders yok'));
  }));
  $('calView').replaceChildren(grid, agenda);
}

function renderMonth(){
  const [y, m] = anchor.split('-').map(Number);
  const first = `${y}-${String(m).padStart(2, '0')}-01`;
  const start = weekStartKey(first);
  const today = todayKey();
  $('calLabel').textContent = fmtMonth.format(noon(first));
  const cells = [];
  for(let i = 0; i < 42; i++){
    const key = addDaysToKey(start, i);
    if(i >= 35 && key.slice(0, 7) !== first.slice(0, 7)) break;
    const items = lessonsOn(key);
    const cell = h('button', {
      type: 'button',
      class: ['acc-month-day', key.slice(0, 7) !== first.slice(0, 7) ? 'is-other' : '', key === today ? 'is-today' : '', key === selectedDay ? 'is-selected' : ''].join(' '),
      'aria-pressed': String(key === selectedDay),
      'aria-label': `${fmtDayLong.format(noon(key))}: ${items.filter((l) => l.status === 'scheduled').length} ders`
    },
    h('span', { class: 'acc-month-num' }, String(Number(key.slice(8)))),
    h('span', { class: 'acc-month-chips', 'aria-hidden': 'true' },
      items.slice(0, 3).map((l) => h('span', { class: `acc-month-chip${l.status === 'cancelled' ? ' is-cancelled' : ''}${l.calendarSync === 'failed' ? ' is-failed' : ''}` },
        h('span', { class: 'acc-chip-text' }, `${berlinParts(l.startAt).time} ${l.studentName || ''}`))),
      items.length > 3 ? h('span', { class: 'acc-month-more' }, `+${items.length - 3}`) : null));
    cell.addEventListener('click', () => {
      selectedDay = key;
      render();
    });
    cells.push(cell);
  }
  const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const dayItems = lessonsOn(selectedDay);
  $('calView').replaceChildren(
    h('div', { class: 'acc-month' }, weekdays.map((d) => h('span', { class: 'acc-month-wd' }, d)), cells),
    h('section', { class: 'acc-month-list', 'aria-live': 'polite' },
      h('h3', {}, fmtDayLong.format(noon(selectedDay))),
      dayItems.length ? h('ul', { class: 'acc-agenda-list' }, dayItems.map(agendaItem)) : h('p', { class: 'acc-hint' }, 'Bu gün ders yok.'))
  );
}

function render(){
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
  if(view === 'week') renderWeek(); else renderMonth();
  renderSyncBanner();
}

// ---- Ders ayrıntısı: taşı, iptal et, tekrar dene ----

function resultNotice(result, success){
  if(result.ok) notice('success', success);
  else notice('error', `Google Calendar'a eklenemedi, tekrar dene. Değişiklik sitede kayıtlı. (${result.error?.message || 'bilinmeyen hata'})`);
}

function openLesson(l){
  const dialog = $('lessonDialog');
  const student = students.get(l.uid);
  const scheduled = l.status === 'scheduled';
  const series = l.seriesId ? lessons.filter((x) => x.uid === l.uid && x.seriesId === l.seriesId) : [];
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const close = h('button', { class: 'btn ghost', type: 'button' }, 'Kapat');
  close.addEventListener('click', () => dialog.close());

  const run = (button, action, success) => async () => {
    button.disabled = true;
    setStatus(status, '', 'Kaydediliyor…');
    const error = await ensureCalendar();
    try{
      const result = await action(error);
      dialog.close();
      await reload();
      resultNotice(result, success);
    }catch(e){
      console.error(e);
      setStatus(status, 'error', 'Kaydedilemedi. Tekrar dene.');
      button.disabled = false;
    }
  };

  const parts = [];
  if(scheduled){
    const p = berlinParts(l.startAt);
    const date = h('input', { id: 'mvDate', type: 'date', value: p.key, required: true });
    const time = h('input', { id: 'mvTime', type: 'time', step: '300', value: p.time, required: true });
    const duration = h('input', { id: 'mvDuration', type: 'number', min: '15', max: '240', step: '5', value: String(l.durationMin || DEFAULT_DURATION) });
    const move = h('button', { class: 'btn primary', type: 'button' }, 'Dersi taşı');
    move.addEventListener('click', () => {
      const startAt = berlinAt(date.value, time.value);
      const minutes = Number(duration.value);
      if(!startAt || !(minutes >= 15 && minutes <= 240)){
        setStatus(status, 'error', 'Geçerli bir tarih, saat ve süre (15–240 dakika) gir.');
        return;
      }
      run(move, (error) => moveLesson(l, student, startAt, minutes, error), 'Ders taşındı. Öğrenciye Google Calendar güncellemesi gönderildi.')();
    });
    parts.push(h('details', { class: 'acc-details' }, h('summary', {}, 'Dersi taşı'),
      h('div', { class: 'acc-form acc-subform' },
        h('div', { class: 'acc-pick' },
          h('div', { class: 'field' }, h('label', { for: 'mvDate' }, 'Tarih'), date),
          h('div', { class: 'field' }, h('label', { for: 'mvTime' }, 'Saat (Berlin)'), time)),
        h('div', { class: 'field' }, h('label', { for: 'mvDuration' }, 'Süre (dakika)'), duration),
        move)));

    const cancelOne = h('button', { class: 'btn danger', type: 'button' }, 'Bu dersi iptal et');
    cancelOne.addEventListener('click', () => {
      if(!confirm('Bu ders iptal edilsin mi? Öğrenciye (ve davetliyse veliye) Google Calendar iptal bildirimi gider.')) return;
      run(cancelOne, (error) => cancelLesson(l, error), 'Ders iptal edildi.')();
    });
    const actions = [cancelOne];
    if(series.length > 1){
      const cancelRest = h('button', { class: 'btn danger', type: 'button' }, 'Bu ve sonraki dersleri iptal et');
      cancelRest.addEventListener('click', () => {
        const count = series.filter((x) => x.status !== 'cancelled' && x.startAt >= l.startAt).length;
        if(!confirm(`Bu dahil ${count} ders iptal edilsin mi?`)) return;
        run(cancelRest, (error) => cancelFollowing(l, series, error), `${count} ders iptal edildi.`)();
      });
      actions.push(cancelRest);
    }
    parts.push(h('div', { class: 'acc-actions' }, actions));
  }
  if(l.calendarSync === 'failed'){
    const retry = h('button', { class: 'btn primary', type: 'button' }, 'Tekrar dene');
    retry.addEventListener('click', run(retry, async (error) => {
      const related = l.pendingAction === 'create' && l.seriesId
        ? failedLessons().filter((x) => x.uid === l.uid && x.seriesId === l.seriesId)
        : [l];
      const results = await retryFailed(related, students, error);
      return results.find((r) => !r.ok) || { ok: true };
    }, 'Ders Google Calendar ile eşitlendi.'));
    parts.unshift(h('div', { class: 'acc-status error' },
      h('p', {}, 'Google Calendar\'a eklenemedi, tekrar dene.'),
      l.calendarError ? h('p', { class: 'acc-hint' }, l.calendarError) : null,
      retry));
  }

  const syncText = { ok: 'Google Calendar ile eşit', failed: 'Google Calendar hatası', pending: 'Eşitleniyor' }[l.calendarSync] || '';
  dialog.replaceChildren(h('div', { class: 'acc-dialog-body' },
    h('h2', { id: 'lessonDialogTitle' }, student
      ? h('a', { class: 'ba-link', href: `ogretmen-ogrenci.html?id=${encodeURIComponent(l.uid)}` }, l.studentName)
      : (l.studentName || 'Ders')),
    h('dl', { class: 'acc-dl' },
      h('div', {}, h('dt', {}, 'Zaman (Berlin)'), h('dd', {}, `${fmtDateTime.format(l.startAt)} – ${berlinParts(endOf(l)).time}`)),
      h('div', {}, h('dt', {}, 'Süre'), h('dd', {}, `${l.durationMin || DEFAULT_DURATION} dakika`)),
      l.note ? h('div', {}, h('dt', {}, 'Not'), h('dd', { class: 'acc-assign-text' }, l.note)) : null,
      h('div', {}, h('dt', {}, 'Durum'), h('dd', {}, scheduled ? 'Planlandı' : 'İptal edildi', ' · ', syncText)),
      l.seriesId ? h('div', {}, h('dt', {}, 'Tekrar'), h('dd', {}, `Haftalık, ${(l.seriesIndex || 0) + 1}. ders / ${series.length}`)) : null),
    scheduled && l.meetUrl
      ? h('a', { class: 'btn primary acc-join', href: l.meetUrl, target: '_blank', rel: 'noopener noreferrer' }, 'Görüşmeye katıl')
      : null,
    ...parts,
    status,
    h('div', { class: 'acc-actions' }, close)));
  dialog.showModal();
}

// ---- Yeni ders ----

function fillStudents(preselect){
  const enabled = [...students.values()].filter(isEnabled).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  $('nlStudent').replaceChildren(
    h('option', { value: '' }, enabled.length ? 'Öğrenci seç' : 'Hesabı açık öğrenci yok'),
    ...enabled.map((s) => h('option', { value: s.id, selected: s.id === preselect }, s.name)));
  renderInvitees();
}

function renderInvitees(){
  const student = students.get($('nlStudent').value);
  $('nlInvitees').textContent = student
    ? `Davet gidecek: ${attendeesFor(student).join(', ')}${parentInvited(student) ? ' (öğrenci ve veli)' : ''}`
    : '';
}

function openNewLesson(preselect){
  $('newLessonForm').reset();
  setStatus($('nlStatus'), '', '');
  fillStudents(preselect);
  $('nlDate').value = view === 'month' ? selectedDay : (anchor < todayKey() ? todayKey() : anchor);
  $('nlTime').value = '18:00';
  $('nlDuration').value = String(DEFAULT_DURATION);
  $('nlWeeks').value = '10';
  $('nlWeeks').disabled = true;
  $('nlSubmit').disabled = false;
  $('newLessonDialog').showModal();
}

async function submitNewLesson(event){
  event.preventDefault();
  const status = $('nlStatus');
  const student = students.get($('nlStudent').value);
  const dayKey = $('nlDate').value;
  const time = $('nlTime').value;
  const durationMin = Number($('nlDuration').value);
  const weeks = $('nlRepeat').checked ? Number($('nlWeeks').value) : 1;
  const note = $('nlNote').value.trim();
  if(!student) return setStatus(status, 'error', 'Öğrenci seç.');
  if(!/^\d{4}-\d\d-\d\d$/.test(dayKey) || !/^\d\d:\d\d$/.test(time)) return setStatus(status, 'error', 'Tarih ve saat seç.');
  if(!(durationMin >= 15 && durationMin <= 240)) return setStatus(status, 'error', 'Süre 15 ile 240 dakika arasında olmalı.');
  if($('nlRepeat').checked && !(Number.isInteger(weeks) && weeks >= 2 && weeks <= MAX_WEEKS)) return setStatus(status, 'error', `Hafta sayısı 2 ile ${MAX_WEEKS} arasında olmalı.`);
  if(berlinAt(dayKey, time) < new Date()) return setStatus(status, 'error', 'Geçmiş bir zaman seçtin.');
  $('nlSubmit').disabled = true;
  setStatus(status, '', 'Kaydediliyor…');
  const calendarError = await ensureCalendar();
  try{
    const result = await createLessons({ student, dayKey, time, durationMin, note, weeks }, calendarError);
    $('newLessonDialog').close();
    anchor = dayKey;
    selectedDay = dayKey;
    await reload();
    resultNotice(result, weeks > 1
      ? `${weeks} haftalık ders planlandı. Google Calendar daveti gönderildi.`
      : 'Ders planlandı. Google Calendar daveti gönderildi.');
  }catch(error){
    console.error(error);
    setStatus(status, 'error', 'Ders kaydedilemedi. Tekrar dene.');
    $('nlSubmit').disabled = false;
  }
}

// ---- Başlangıç ----

async function reload(){
  const [list, all] = await Promise.all([listStudents(), loadAllLessons()]);
  students = new Map(list.map((s) => [s.id, s]));
  lessons = all;
  render();
}

function shift(direction){
  if(view === 'week'){
    anchor = addDaysToKey(anchor, 7 * direction);
  }else{
    const [y, m] = anchor.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1 + direction, 1));
    anchor = t.toISOString().slice(0, 10);
    selectedDay = anchor;
  }
  render();
}

$('calPrev').addEventListener('click', () => shift(-1));
$('calNext').addEventListener('click', () => shift(1));
$('calToday').addEventListener('click', () => { anchor = todayKey(); selectedDay = anchor; render(); });
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { view = b.dataset.view; render(); }));
$('newLessonBtn').addEventListener('click', () => openNewLesson());
$('newLessonForm').addEventListener('submit', submitNewLesson);
$('nlCancel').addEventListener('click', () => $('newLessonDialog').close());
$('nlStudent').addEventListener('change', renderInvitees);
$('nlRepeat').addEventListener('change', () => { $('nlWeeks').disabled = !$('nlRepeat').checked; });
$('gcalConnect').addEventListener('click', async () => {
  const error = await ensureCalendar();
  if(error) notice('error', `Google Calendar'a bağlanılamadı: ${error.message}`);
});

const user = await requireTeacher({ loadingId: 'calLoading', errorId: 'calError' });
if(user){
  cal.preload();
  renderConnection();
  try{
    await reload();
    $('calLoading').hidden = true;
    $('calApp').hidden = false;
    const params = new URLSearchParams(location.search);
    if(params.get('yeni') === '1') openNewLesson(params.get('ogrenci'));
  }catch(error){
    console.error(error);
    $('calLoading').hidden = true;
    $('calError').hidden = false;
    $('calError').textContent = 'Dersler yüklenemedi. Tekrar dene.';
  }
}
