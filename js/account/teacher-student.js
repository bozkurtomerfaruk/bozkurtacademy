// ogretmen-ogrenci.html?id=UID: öğrenci detayı, onay işlemleri, veli onayı, alıştırma sonuçları.
import {
  $, consentGiven, currentYear, exerciseNames, formatDateTime, h, BERLIN, loadAssignments, loadProfile,
  loadResults, loadWritings, safeLink, scoreText, summarizeResults, validEmail, validHttpsUrl, LEVEL_EXAM, topicErrorsText,
  setStatus, writingTitle, writingUrl
} from './common.js';
import {
  approve, emailVerified, fmtDate, isEnabled, listStudents, openDeleteDialog,
  AI_CONSENT_VERSION, AI_SKIP_LABELS, aiAllowed, aiDirect, approveAiDraft, deleteAiDraft, flaggedCount, loadAiDrafts, needsTeacher, recordAiConsent,
  recordConsent, requireTeacher, saveWritingFeedback, setActive, setInactive, statusBadges, UNVERIFIED_WARNING, updateParent
} from './teacher-common.js';
import * as cal from './calendar.js';
import { db, fs } from './firebase.js';
import { applyAttendees, loadStudentLessons } from './lessons.js';
import { normalizeAssignment } from './assignments.js?v=1';
import * as drive from './drive.js?v=2';
import { addResourceCopies, deleteResourceCopy, groupCounts, loadResourceList, MAX_TITLE, resourceItem } from './resources.js?v=1';
import { backupsFor, deleteNote, loadNotes, noteUrl, removeBackup } from './lesson-notes.js?v=1';
import { defaultTitle } from './note-format.js?v=1';
import { berlinParts, todayKey } from './common.js';

const uid = new URLSearchParams(location.search).get('id');
let student = null;

const fmtDateTime = (value) => formatDateTime(value, { lang: 'tr', timeZone: BERLIN });
const METHODS = { form: 'İmzalı form', email: 'Velinin e-postası' };

function setActionStatus(type, message){
  const el = $('actionStatus');
  el.hidden = !message;
  el.className = `acc-status${type ? ' ' + type : ''}`;
  el.textContent = message || '';
}

// Bir işlemi çalıştırır, sonra öğrenciyi yeniden yükler.
async function run(button, action, success){
  button.disabled = true;
  try{
    await action();
    setActionStatus('success', success);
    await reload();
  }catch(error){
    console.error(error);
    setActionStatus('error', 'İşlem kaydedilemedi. Tekrar dene.');
    button.disabled = false;
  }
}

function actionButton(label, cls, action, success){
  const button = h('button', { class: `btn ${cls}`, type: 'button' }, label);
  button.addEventListener('click', () => run(button, action, success));
  return button;
}

function startDelete(reason){
  openDeleteDialog($('deleteDialog'), student, {
    reason,
    onDone: () => {
      $('studentApp').hidden = true;
      $('deletedBox').hidden = false;
      $('deletedBox').replaceChildren(h('p', { class: 'acc-status success' }, `${student.name} silindi. `, h('a', { class: 'ba-link', href: 'ogretmen.html' }, 'Öğrenci listesine dön')));
    }
  });
}

function renderProfile(){
  document.title = `${student.name} | Bozkurt Academy`;
  $('studentTitle').textContent = student.name;
  $('studentBadges').replaceChildren(statusBadges(student));
  const age = currentYear() - student.birthYear;
  const rows = [
    ['E-posta', `${student.email} (${emailVerified(student) ? 'doğrulandı' : 'doğrulanmadı'})`],
    ['Doğum yılı', `${student.birthYear} (bu yıl ${age} yaşına giriyor)`],
    ['Kayıt yöntemi', student.provider === 'google.com' ? 'Google' : 'E-posta ve şifre'],
    ['Kayıt', fmtDateTime(student.createdAt)],
    ['Onay', fmtDateTime(student.approvedAt)]
  ];
  $('profileList').replaceChildren(...rows.map(([dt, dd]) => h('div', {}, h('dt', {}, dt), h('dd', {}, dd))));

  const actions = [];
  if(student.status === 'pending'){
    if(!emailVerified(student)) actions.push(h('p', { class: 'acc-row-warning' }, UNVERIFIED_WARNING));
    actions.push(actionButton('Onayla', 'primary', () => approve(uid), 'Öğrenci onaylandı.'));
  }
  if(student.status === 'active') actions.push(actionButton('Pasif yap', 'ghost', () => setInactive(uid), 'Öğrenci pasif yapıldı. Hiçbir veriyi göremez.'));
  if(student.status === 'inactive') actions.push(actionButton('Yeniden aktif yap', 'primary', () => setActive(uid), 'Öğrenci yeniden aktif.'));
  const deleteBtn = h('button', { class: 'btn danger', type: 'button' }, 'Öğrenciyi ve bütün verilerini sil');
  deleteBtn.addEventListener('click', () => startDelete(''));
  actions.push(deleteBtn);
  if(student.minor && student.status === 'active' && !consentGiven(student)){
    actions.unshift(h('p', { class: 'acc-hint' }, 'Onayladın; hesap veli onayı işaretlenince açılır.'));
  }
  $('statusActions').replaceChildren(...actions);
}

function parentEditForm(){
  const name = h('input', { id: 'parentNameInput', value: student.parent?.name || '', maxlength: '80', autocomplete: 'off' });
  const email = h('input', { id: 'parentEmailInput', type: 'email', value: student.parent?.email || '', autocomplete: 'off' });
  const save = h('button', { class: 'btn ghost', type: 'submit' }, 'Veli bilgilerini kaydet');
  const form = h('form', { class: 'acc-form acc-subform', novalidate: true },
    h('div', { class: 'field' }, h('label', { for: 'parentNameInput' }, 'Veli adı soyadı'), name),
    h('div', { class: 'field' }, h('label', { for: 'parentEmailInput' }, 'Veli e-postası'), email),
    save);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const parent = { name: name.value.trim(), email: email.value.trim() };
    if(parent.name.length < 2 || !validEmail(parent.email)){
      setActionStatus('error', 'Veli adı ve geçerli bir e-posta gerekli.');
      return;
    }
    run(save, () => updateParent(uid, parent), 'Veli bilgileri kaydedildi.');
  });
  return h('details', { class: 'acc-details' }, h('summary', {}, 'Veli bilgilerini düzenle'), form);
}

function consentForm(){
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: BERLIN }).format(new Date());
  const date = h('input', { id: 'consentDate', type: 'date', value: today, max: today, required: true });
  const methods = Object.entries(METHODS).map(([value, label], i) =>
    h('label', { class: 'acc-radio' }, h('input', { type: 'radio', name: 'consentMethod', value, checked: i === 0 }), h('span', {}, label)));
  const submit = h('button', { class: 'btn primary', type: 'submit' }, 'Veli onayı alındı olarak işaretle');
  const form = h('form', { class: 'acc-form acc-subform', novalidate: true },
    h('div', { class: 'field' }, h('label', { for: 'consentDate' }, 'Onayın alındığı tarih'), date),
    h('fieldset', { class: 'acc-radios' }, h('legend', {}, 'Yöntem'), methods),
    submit);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if(!date.value || date.value > today){
      setActionStatus('error', 'Geçerli bir tarih seç (bugün ya da önce).');
      return;
    }
    const method = form.querySelector('input[name="consentMethod"]:checked')?.value || 'form';
    // Tarih Berlin saatiyle öğlen olarak kaydedilir; saat dilimi farkı günü değiştirmesin.
    const at = new Date(`${date.value}T12:00:00`);
    run(submit, () => recordConsent(uid, { date: at, method }), 'Veli onayı kaydedildi.' + (student.status === 'active' ? ' Hesap açıldı.' : ' Hesabın açılması için öğrenciyi de onayla.'));
  });
  return form;
}

function renderParent(){
  $('parentCard').hidden = !student.minor;
  if(!student.minor) return;
  const consent = student.parentConsent;
  const items = [
    h('dl', { class: 'acc-dl' },
      h('div', {}, h('dt', {}, 'Veli'), h('dd', {}, student.parent?.name || '—')),
      h('div', {}, h('dt', {}, 'Veli e-postası'), h('dd', {}, student.parent?.email || '—')),
      h('div', {}, h('dt', {}, 'Veli onayı'), h('dd', {}, consentGiven(student)
        ? `Alındı: ${fmtDate(consent.at)} · ${METHODS[consent.method] || consent.method}`
        : 'Henüz alınmadı')))
  ];
  if(consentGiven(student)){
    const withdraw = h('button', { class: 'btn danger', type: 'button' }, 'Veli onayı geri alındı: bütün verileri sil');
    withdraw.addEventListener('click', () => startDelete('Veli onayı geri alındığı için öğrencinin bütün verileri silinir.'));
    items.push(h('p', { class: 'acc-hint' }, `Kayıt tarihi: ${fmtDateTime(consent.recordedAt)}`), withdraw);
  }else{
    items.push(h('p', { class: 'acc-hint' }, 'Veli onayını imzalı form (docs/veli-onay-formu.md) ya da velinin e-postasıyla site dışında al, sonra burada işaretle.'), consentForm());
  }
  items.push(inviteParentControl());
  items.push(parentEditForm());
  $('parentContent').replaceChildren(...items);
}

let lessons = [];

// Dersler: yaklaşanlar (en yakın önce) ve son 10 geçmiş ders. Taşıma ve iptal takvim sayfasında.
function renderLessons(){
  const now = new Date();
  const end = (l) => new Date(l.startAt.getTime() + (l.durationMin || 50) * 60000);
  const upcoming = lessons.filter((l) => l.status === 'scheduled' && end(l) > now).sort((a, b) => a.startAt - b.startAt);
  const past = lessons.filter((l) => !(l.status === 'scheduled' && end(l) > now)).sort((a, b) => b.startAt - a.startAt).slice(0, 10);
  const row = (l) => h('li', {},
    h('span', {}, `${fmtDateTime(l.startAt)} · ${l.durationMin || 50} dk`),
    l.status === 'cancelled' ? h('span', { class: 'acc-badge muted' }, 'İptal') : null,
    l.calendarSync === 'failed' ? h('span', { class: 'acc-badge warning' }, 'Takvim hatası') : null,
    l.status === 'scheduled' && end(l) > now && l.meetUrl ? safeLink(l.meetUrl, 'Görüşmeye katıl') : null);
  $('lessonsList').replaceChildren(...[
    upcoming.length
      ? h('ul', { class: 'acc-status-list acc-lesson-list' }, upcoming.map(row))
      : h('p', { class: 'acc-empty' }, 'Planlanmış ders yok.'),
    past.length ? h('details', { class: 'acc-details' }, h('summary', {}, `Geçmiş dersler (${past.length})`), h('ul', { class: 'acc-status-list' }, past.map(row))) : null,
    h('p', { class: 'acc-hint' }, h('a', { class: 'ba-link', href: 'ogretmen-takvim.html' }, 'Takvimde aç'), ' (taşıma ve iptal için).')
  ].filter(Boolean)); // geçmiş ders yoksa ekrana "null" yazılmasın
}

// Ders defteri: "Derse başla" yeni sayfa açar. Takvimde bugün bu öğrencinin dersi varsa sayfa o derse bağlanır;
// o derse bağlı not zaten varsa düğme "Bugünün notunu aç" olur, yanında "Yeni sayfa". Eski notlar: aç, sil.
// Bu tarayıcıda kalmış, sunucuya hiç ulaşmamış yedekler (ör. bağlantı yokken kapanan yeni sayfa) de listelenir.
let notes = [];
function todaysLesson(){
  const today = todayKey();
  return lessons.filter((l) => l.status === 'scheduled' && l.startAt && berlinParts(l.startAt).key === today)
    .sort((a, b) => a.startAt - b.startAt)[0] || null;
}

function renderNoteStart(){
  const lesson = todaysLesson();
  const linked = lesson ? notes.find((n) => n.lessonId === lesson.id) : null;
  const actions = [];
  if(linked){
    actions.push(h('a', { class: 'btn primary acc-row-action', id: 'startLessonLink', href: noteUrl(uid, linked.id) }, 'Bugünün notunu aç'));
    actions.push(h('a', { class: 'btn ghost acc-row-action', id: 'newNoteLink', href: noteUrl(uid, null) }, 'Yeni sayfa'));
  }else{
    actions.push(h('a', { class: 'btn primary acc-row-action', id: 'startLessonLink', href: noteUrl(uid, null, lesson ? { ders: lesson.id } : {}) }, 'Derse başla'));
  }
  $('noteStartActions').replaceChildren(...actions);
  $('noteStartActions').hidden = !isEnabled(student) && !notes.length;
}

function renderNotes(){
  renderNoteStart();
  const known = new Set(notes.map((n) => n.id));
  const orphans = backupsFor(uid).filter((b) => !known.has(b.id));
  const row = (n) => {
    const del = h('button', { class: 'btn ghost note-danger', type: 'button' }, 'Sil');
    del.addEventListener('click', async () => {
      if(!confirm(`"${n.title || defaultTitle(n.day)}" silinsin mi? Öğrenci de artık göremez. Bu geri alınamaz.`)) return;
      del.disabled = true;
      try{
        await deleteNote(uid, n.id);
        removeBackup(uid, n.id);
        notes = notes.filter((x) => x.id !== n.id);
        renderNotes();
        setActionStatus('success', 'Not silindi.');
      }catch(error){
        console.error(error);
        del.disabled = false;
        setActionStatus('error', 'Not silinemedi. Tekrar dene.');
      }
    });
    return h('li', { 'data-note': n.id },
      h('div', {}, h('a', { class: 'ba-link', href: noteUrl(uid, n.id) }, n.title || defaultTitle(n.day)),
        h('span', { class: 'acc-sub' }, [fmtDate(n.updatedAt || n.createdAt), n.lessonId ? 'takvimdeki derse bağlı' : '', n.bytes ? `${Math.max(1, Math.round(n.bytes / 1024))} KB` : ''].filter(Boolean).join(' · '))),
      h('div', { class: 'acc-row-actions' }, h('a', { class: 'btn ghost', href: noteUrl(uid, n.id) }, 'Aç'), del));
  };
  $('notesList').replaceChildren(...[
    orphans.length ? h('div', { class: 'acc-status warning' },
      h('p', {}, 'Bu tarayıcıda sunucuya kaydedilmemiş ders notu var:'),
      h('ul', { class: 'acc-status-list' }, orphans.map((b) => h('li', {}, h('a', { class: 'ba-link', href: noteUrl(uid, b.id) }, `${b.title || 'Ders'} – açıp kaydet`))))) : null,
    notes.length
      ? h('ul', { class: 'note-teacher-list' }, notes.map(row))
      : h('p', { class: 'acc-empty' }, 'Henüz ders notu yok. "Derse başla" ile ilk sayfayı aç; öğrenci notu kendi panelinde canlı görür.')
  ].filter(Boolean));
}

// 16 yaş altı: ders davetlerine ve hatırlatmalara veli de eklensin mi (varsayılan açık).
function inviteParentControl(){
  const input = h('input', { type: 'checkbox', id: 'inviteParent', checked: student.inviteParent !== false });
  const save = h('button', { class: 'btn ghost', type: 'button' }, 'Kaydet');
  save.addEventListener('click', async () => {
    save.disabled = true;
    const value = input.checked;
    let calendarError = null;
    const future = lessons.filter((l) => l.status === 'scheduled' && l.startAt > new Date() && l.calendarEventId);
    const applyToFuture = future.length > 0 && confirm(`Bu ayar gelecekteki ${future.length} derse de uygulansın mı? Değişiklik Google Calendar davetlerine yansır ve davetlilere bildirim gider.`);
    if(applyToFuture){
      try{ await cal.connect(); }catch(error){ calendarError = error; }
    }
    try{
      await fs.updateDoc(fs.doc(db, 'users', uid), { inviteParent: value });
      student.inviteParent = value;
    }catch(error){
      console.error(error);
      setActionStatus('error', 'Kaydedilemedi. Tekrar dene.');
      save.disabled = false;
      return;
    }
    if(!applyToFuture){
      setActionStatus('success', 'Kaydedildi. Yeni derslere uygulanacak.');
    }else{
      try{
        const count = await applyAttendees(student, lessons, calendarError);
        setActionStatus('success', `Kaydedildi. ${count} Google Calendar etkinliğinin davetlileri güncellendi.`);
      }catch(error){
        console.error(error);
        setActionStatus('error', `Ayar kaydedildi ama Google Calendar güncellenemedi: ${error.message}. Daha sonra tekrar kaydet.`);
      }
    }
    await reload();
  });
  return h('div', { class: 'acc-invite' },
    h('label', { class: 'acc-check' }, input, h('span', {}, 'Ders davetlerine, hatırlatma ve ödev e-postalarına veliyi de ekle')),
    save);
}

// Öğrencinin ödevleri ayrı sayfada (ogretmen-odevler.html?ogrenci=…). Burada kısa özet ve açık ödevler.
// Ödev e-postaları açık/kapalı (users/{uid}.homeworkMail; yoksa açık). Worker kapalıysa göndermez.
function homeworkMailControl(){
  const input = h('input', { type: 'checkbox', id: 'homeworkMailInput', checked: student.homeworkMail !== false });
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  input.addEventListener('change', async () => {
    input.disabled = true;
    try{
      await fs.updateDoc(fs.doc(db, 'users', uid), { homeworkMail: input.checked });
      student.homeworkMail = input.checked;
      setStatus(status, 'success', input.checked ? 'Ödev e-postaları açık.' : 'Ödev e-postaları kapalı; bu öğrenciye ödev e-postası gitmez.');
    }catch(error){
      console.error(error);
      input.checked = !input.checked;
      setStatus(status, 'error', 'Kaydedilemedi. Tekrar dene.');
    }finally{
      input.disabled = false;
    }
  });
  return h('div', { class: 'acc-homework-mail' },
    h('label', { class: 'acc-check' }, input, h('span', {}, 'Yeni ödevlerde e-posta gönder',
      h('span', { class: 'acc-sub' }, student.minor ? 'Veliye de gitmesi için "veliyi de ekle" anahtarı (veli kartında) açık olmalı.' : 'Sadece ödevin başlığı, teslim tarihi ve "Ödevlerim" bağlantısı.'))),
    status);
}

async function renderAssignments(){
  const assignments = (await loadAssignments(uid)).map(normalizeAssignment);
  const box = $('assignmentsList');
  $('homeworkMailBox').replaceChildren(homeworkMailControl());
  const pageLink = h('a', { class: 'ba-link', href: `ogretmen-odevler.html?ogrenci=${encodeURIComponent(uid)}` }, 'Ödevlerini aç');
  if(!assignments.length){
    box.replaceChildren(h('p', { class: 'acc-empty' }, 'Bu öğrenciye henüz ödev verilmedi.'));
    return;
  }
  const open = assignments.filter((a) => !a.done).sort((a, b) => (a.due || Infinity) - (b.due || Infinity));
  const now = new Date();
  box.replaceChildren(
    h('p', { class: 'acc-hint' }, `${assignments.length} ödev, ${open.length} açık. `, pageLink),
    open.length ? h('ul', { class: 'acc-status-list' }, open.slice(0, 5).map((a) => h('li', {},
      h('span', {}, a.title),
      h('span', { class: 'acc-badge' }, a.due ? `Teslim ${fmtDateTime(a.due)}` : 'Teslim tarihi yok'),
      a.due && a.due < now ? h('span', { class: 'acc-badge warning' }, 'Süresi geçti') : null))) : null);
}

// Yardımcı kaynaklar (js/account/resources.js). Aynı kaynak birden çok öğrenciye verildiyse "X öğrenciye verildi".
// Silme yalnızca bu öğrencinin kopyasını siler; PDF Drive'da kalır.
async function renderResources(){
  const [resources, counts] = await Promise.all([loadResourceList(uid), groupCounts().catch((error) => { console.warn(error); return new Map(); })]);
  const box = $('resourcesList');
  box.replaceChildren(...(resources.length
    ? [h('ul', { class: 'acc-resource-list' }, resources.map((r) => {
      const remove = h('button', { class: 'acc-text-button', type: 'button' }, 'Sil');
      remove.addEventListener('click', async () => {
        const pdfNote = r.kind === 'pdf' ? ' PDF Google Drive\'ında kalır.' : '';
        if(!confirm(`"${r.title}" bu öğrenciden kaldırılsın mı? Diğer öğrencilerdeki kopyalar kalır.${pdfNote}`)) return;
        remove.disabled = true;
        try{
          await deleteResourceCopy(uid, r.id);
          await reload();
        }catch(error){
          console.error(error);
          setActionStatus('error', 'Kaynak silinemedi. Tekrar dene.');
          remove.disabled = false;
        }
      });
      const n = r.groupId ? counts.get(r.groupId) || 1 : 1;
      const info = [r.kind === 'pdf' ? 'PDF' : 'Bağlantı', r.createdAt ? fmtDate(r.createdAt.toDate?.() || r.createdAt) : '', n > 1 ? `${n} öğrenciye verildi` : ''].filter(Boolean).join(' · ');
      return h('li', { 'data-resource': r.id }, resourceItem(r, { extra: [h('span', { class: 'acc-sub acc-res-info' }, info)] }), remove);
    }))]
    : [h('p', { class: 'acc-hint' }, 'Henüz yardımcı kaynak eklenmedi.')]));
}

// Schreiben metinleri: en yeni üstte; geri bildirim bekleyenler işaretli. Öğretmen geri bildirim yazar ya da düzeltir
// (en fazla 2000 karakter, firestore.rules); öğrenci kendi panelinde görür. Yapay zekâ taslağı varsa (aiDrafts) metnin
// altında düzenlenebilir hâlde durur: öğretmen düzeltip onaylar ya da siler. Öğrenci taslağı hiçbir zaman görmez.
const FEEDBACK_MAX = 2000;
const SOURCE_LABELS = { teacher: 'Senin geri bildirimin', 'ai-approved': 'Yapay zekâ önerisi, aynen onaylandı', 'ai-edited': 'Yapay zekâ önerisi, düzenlenerek onaylandı' };

function draftItemRow(item, index, wid, flagged = false){
  const row = h('li', { class: `acc-ai-item${flagged ? ' is-flagged' : ''}`, 'data-ai-item': String(index), 'data-ai-flagged': flagged ? '' : null },
    flagged ? h('p', {}, h('span', { class: 'acc-badge warning' }, 'Öğrenci: bu açıklama yanlış görünüyor')) : null,
    h('p', { class: 'acc-ai-original', lang: 'de' }, h('span', { class: 'acc-sub' }, 'Metinde: '), h('mark', {}, item.original)),
    h('div', { class: 'field' }, h('label', { for: `ai-k-${wid}-${index}` }, 'Doğrusu'),
      h('input', { id: `ai-k-${wid}-${index}`, value: item.korrektur, maxlength: '300', lang: 'de', 'data-ai-korrektur': '' })),
    h('div', { class: 'field' }, h('label', { for: `ai-e-${wid}-${index}` }, 'Açıklama'),
      h('textarea', { id: `ai-e-${wid}-${index}`, rows: '2', maxlength: '600', 'data-ai-erklaerung': '' }, item.erklaerung)));
  row.dataset.original = item.original;
  const remove = h('button', { class: 'btn ghost', type: 'button', 'data-ai-remove': '' }, 'Bu öneriyi çıkar');
  remove.addEventListener('click', () => row.remove());
  row.append(remove);
  return row;
}

// live: öğrenci bu geri bildirimi zaten gördü ("Anında göster"; draft = w.aiFeedback). Öğretmen işaretlenen maddeyi
// düzeltir ya da çıkarır, not yazar; kaydedince öğrenci düzeltilen maddede "Öğretmenin düzeltti" etiketini görür.
function draftPanel(w, draft, live = false){
  const flags = new Set(live ? w.aiFlags || [] : []);
  const list = h('ol', { class: 'acc-ai-items' }, ...draft.errors.map((item, i) => draftItemRow(item, i, w.id, flags.has(i))));
  const corrected = h('textarea', { id: `ai-c-${w.id}`, rows: '6', maxlength: '6000', lang: 'de', 'data-ai-corrected': '' }, draft.correctedText || '');
  const note = h('textarea', { id: `ai-n-${w.id}`, rows: '3', maxlength: String(FEEDBACK_MAX), 'data-ai-note': '' });
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const send = h('button', { class: 'btn primary', type: 'button', 'data-ai-approve': '' }, live ? 'Düzeltmeyi öğrenciye gönder' : 'Onayla ve öğrenciye gönder');
  const drop = h('button', { class: 'btn ghost', type: 'button', 'data-ai-delete': '', hidden: live }, 'Taslağı sil');
  send.addEventListener('click', async () => {
    // by: 'teacher' → öğretmen maddeyi değiştirdi (öğrenci panelinde etiketlenir).
    const items = [...list.querySelectorAll('[data-ai-item]')].map((row) => {
      const source = draft.errors[Number(row.dataset.aiItem)];
      const item = {
        original: row.dataset.original,
        korrektur: row.querySelector('[data-ai-korrektur]').value.trim(),
        erklaerung: row.querySelector('[data-ai-erklaerung]').value.trim()
      };
      return item.korrektur === source.korrektur && item.erklaerung === source.erklaerung ? item : { ...item, by: 'teacher' };
    }).filter((item) => item.korrektur && item.korrektur !== item.original);
    const text = note.value.trim().slice(0, FEEDBACK_MAX);
    const correctedText = corrected.value.trim();
    if(!items.length && !text){ setStatus(status, 'error', live ? 'Madde kalmadı: öğrenciye kısa bir not yaz.' : 'Öneri kalmadı: kısa bir not yaz ya da taslağı sil.'); note.focus(); return; }
    const same = items.length === draft.errors.length && !text && correctedText === (draft.correctedText || '').trim()
      && items.every((item, i) => item.original === draft.errors[i].original && item.korrektur === draft.errors[i].korrektur && item.erklaerung === draft.errors[i].erklaerung);
    send.disabled = drop.disabled = true;
    try{
      await approveAiDraft(uid, w.id, { note: text, items, correctedText, source: same ? 'ai-approved' : 'ai-edited' });
      await renderWritings();
      setActionStatus('success', 'Geri bildirim gönderildi; öğrenci panelinde görecek.');
    }catch(error){
      console.error(error);
      setStatus(status, 'error', 'Gönderilemedi. Tekrar dene.');
      send.disabled = drop.disabled = false;
    }
  });
  drop.addEventListener('click', async () => {
    send.disabled = drop.disabled = true;
    try{
      await deleteAiDraft(uid, w.id);
      await renderWritings();
      setActionStatus('success', 'Taslak silindi. Geri bildirimi kendin yazabilirsin.');
    }catch(error){
      console.error(error);
      setStatus(status, 'error', 'Taslak silinemedi. Tekrar dene.');
      send.disabled = drop.disabled = false;
    }
  });
  return h('section', { class: 'acc-ai-draft', [live ? 'data-ai-live' : 'data-ai-draft']: w.id, 'aria-label': live ? 'Yapay zekâ geri bildirimi' : 'Yapay zekâ taslağı' },
    h('h3', {}, live ? 'Yapay zekâ geri bildirimi (öğrenci gördü)' : 'Yapay zekâ taslağı'),
    h('p', { class: 'acc-hint' }, live
      ? `Öğrenci bu maddeleri gördü${flags.size ? `; ${flags.size} maddeyi "yanlış görünüyor" diye işaretledi` : ''}. Yanlış olanı düzelt ya da çıkar, istersen not yaz ve gönder: öğrenci düzelttiğin maddede "Öğretmenin düzeltti" etiketini görür. Değiştirmeden gönderirsen yapay zekâyı onaylamış olursun. Model: ${draft.model || '—'} · ${fmtDateTime(w.aiAt)}`
      : `Öğrenci bu taslağı görmez. Önerileri kontrol et: yanlış olanı düzelt ya da çıkar, sonra onayla. Model: ${draft.model || '—'} · ${fmtDateTime(draft.createdAt)}`),
    draft.errors.length ? list : h('p', { class: 'acc-hint' }, 'Yapay zekâ bu metinde hata bulmadı.'),
    h('label', { for: `ai-c-${w.id}` }, h('strong', {}, 'Düzeltilmiş metin')), corrected,
    h('label', { for: `ai-n-${w.id}` }, h('strong', {}, 'Kendi notun'), h('span', { class: 'acc-sub' }, ' isteğe bağlı; öğrenci önerilerin üstünde görür')), note,
    h('div', { class: 'acc-actions' }, send, drop), status);
}

function instantNote(w){
  const n = w.aiFeedback?.errors?.length || 0;
  return h('p', { class: 'acc-hint', 'data-ai-instant': '' }, `Yapay zekâ bu yazıyı kontrol etti ve öğrenci geri bildirimi gördü (${n} madde). Aşağıya sadece not yazarsan öğrenci notunu ve yapay zekâ geri bildirimini birlikte görür.`);
}

// Yapay zekâ ile kontrol izni. 16 yaş altı: velinin ayrı ve isteğe bağlı onayı (docs/veli-onay-formu.md) işaretlenene
// kadar kapalı. Yetişkin: açık; öğrenci itiraz ederse burada kapatılır. Karar worker/schreiben-kontrol.js aiAllowed ile aynı.
function renderAiConsent(){
  const box = $('aiConsentBox');
  const c = student.aiConsent;
  const allowed = aiAllowed(student);
  const head = h('p', {}, h('strong', {}, 'Yapay zekâ ile kontrol: '),
    h('span', { class: `acc-badge ${allowed ? 'success' : 'muted'}`, 'data-ai-allowed': String(allowed) }, allowed ? 'Açık' : 'Kapalı'));
  const items = [head];
  if(student.minor !== false){
    if(c?.given === true){
      items.push(h('p', { class: 'acc-hint' }, `Velinin yapay zekâ onayı: ${fmtDate(c.at)} · ${METHODS[c.method] || c.method}` + (consentGiven(student) ? '' : ' (genel veli onayı da gerekli)')));
      // Eski form: "öneriler önce öğretmene gider". Yeni formla (doğrudan gösterim) onay alınana kadar sonuç taslak olarak gelir.
      if(!aiDirect(student)){
        items.push(h('p', { class: 'acc-hint', 'data-ai-consent-old': '' }, 'Bu onay eski formla alındı (öneriler önce sana gelir). Yeni form geri bildirimin doğrudan öğrenciye gösterildiğini söylüyor; veli yeni formu onaylayana kadar bu öğrencinin sonuçları taslak olarak sana gelir.'));
        items.push(h('details', { class: 'acc-details' }, h('summary', {}, 'Veli yeni formu onayladı: kaydet'), aiConsentForm()));
      }
      const off = h('button', { class: 'btn ghost', type: 'button', 'data-ai-consent-withdraw': '' }, 'Veli yapay zekâ onayını geri çekti');
      off.addEventListener('click', () => run(off, () => recordAiConsent(uid, { given: false }), 'Yapay zekâ kontrolü bu öğrencide kapatıldı. Var olan taslaklar sende kalır; istersen sil.'));
      items.push(off);
    }else{
      items.push(h('p', { class: 'acc-hint' }, '16 yaş altı: veli onay formundaki ayrı "yapay zekâ ile kontrol" kutusu işaretlenmişse burada kaydet. Onay yoksa öğrenci sadece senin geri bildirimini alır.'));
      items.push(h('details', { class: 'acc-details' }, h('summary', {}, 'Velinin yapay zekâ onayını kaydet'), aiConsentForm()));
    }
  }else{
    const button = allowed
      ? h('button', { class: 'btn ghost', type: 'button', 'data-ai-consent-withdraw': '' }, 'Bu öğrencide kapat (öğrenci istemiyor)')
      : h('button', { class: 'btn ghost', type: 'button', 'data-ai-consent-record': '' }, 'Yeniden aç');
    button.addEventListener('click', () => run(button, () => recordAiConsent(uid, { given: !allowed, method: 'student' }), allowed ? 'Yapay zekâ kontrolü bu öğrencide kapatıldı.' : 'Yapay zekâ kontrolü yeniden açıldı.'));
    items.push(h('p', { class: 'acc-hint' }, 'Yetişkin öğrenci: metni gönderilince yapay zekâ kontrolü otomatik çalışır ve geri bildirimi hemen görür (gizlilik politikası). Öğrenci istemezse kapat.'), button);
  }
  box.replaceChildren(...items);
}

// Velinin yapay zekâ onayını kaydetme formu: güncel form sürümüyle (AI_CONSENT_VERSION) kaydedilir.
function aiConsentForm(){
      const today = new Intl.DateTimeFormat('en-CA', { timeZone: BERLIN }).format(new Date());
      const date = h('input', { id: 'aiConsentDate', type: 'date', value: today, max: today, required: true });
      const methods = Object.entries(METHODS).map(([value, label], i) =>
        h('label', { class: 'acc-radio' }, h('input', { type: 'radio', name: 'aiConsentMethod', value, checked: i === 0 }), h('span', {}, label)));
      const submit = h('button', { class: 'btn primary', type: 'submit', 'data-ai-consent-record': '' }, 'Velinin yapay zekâ onayı alındı');
      const form = h('form', { class: 'acc-form acc-subform', novalidate: true },
        h('div', { class: 'field' }, h('label', { for: 'aiConsentDate' }, 'Onayın alındığı tarih'), date),
        h('fieldset', { class: 'acc-radios' }, h('legend', {}, 'Yöntem'), methods), submit);
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if(!date.value || date.value > today){ setActionStatus('error', 'Geçerli bir tarih seç (bugün ya da önce).'); return; }
        const method = form.querySelector('input[name="aiConsentMethod"]:checked')?.value || 'form';
        run(submit, () => recordAiConsent(uid, { given: true, date: new Date(`${date.value}T12:00:00`), method, version: AI_CONSENT_VERSION }), 'Velinin yapay zekâ onayı kaydedildi.');
      });
      return form;
}

async function renderWritings(){
  renderAiConsent();
  const box = $('writingsList');
  const [writings, drafts] = await Promise.all([loadWritings(uid), loadAiDrafts(uid)]);
  const draftById = new Map(drafts.map((d) => [d.writingId, d]));
  const pending = writings.filter(needsTeacher).length;
  $('writingsCount').textContent = pending ? `${pending} yazı sana bakıyor` : '';
  $('writingsCount').hidden = !pending;
  if(!writings.length){
    box.replaceChildren(h('p', { class: 'acc-empty' }, 'Henüz gönderilmiş yazı yok.'));
    return;
  }
  const titles = await Promise.all(writings.map(writingTitle));
  const byId = new Map(writings.map((w) => [w.id, w]));
  box.replaceChildren(...writings.map((w, i) => {
    const draft = !w.feedbackAt ? draftById.get(w.id) : null;
    const live = !w.feedbackAt && w.aiFeedback ? w.aiFeedback : null;
    const flags = flaggedCount(w);
    const area = h('textarea', { id: `fb-${w.id}`, maxlength: String(FEEDBACK_MAX), rows: '4' });
    area.value = w.feedback || '';
    const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
    const save = h('button', { class: 'btn primary', type: 'button' }, w.feedbackAt ? 'Geri bildirimi güncelle' : 'Geri bildirimi kaydet');
    save.addEventListener('click', async () => {
      const text = area.value.trim();
      if(!text){ setStatus(status, 'error', 'Önce bir geri bildirim yaz.'); area.focus(); return; }
      save.disabled = true;
      try{
        await saveWritingFeedback(uid, w.id, text.slice(0, FEEDBACK_MAX));
        if(draft) await deleteAiDraft(uid, w.id).catch((error) => console.warn(error));
        // İşaretli madde varken sadece not yazıldı: yapay zekâ maddeleri öğrencide aynen kalır.
        await renderWritings();
        setActionStatus('success', 'Geri bildirim kaydedildi; öğrenci panelinde görecek.');
      }catch(error){
        console.error(error);
        setStatus(status, 'error', 'Geri bildirim kaydedilemedi. Tekrar dene.');
        save.disabled = false;
      }
    });
    const badge = w.feedbackAt
      ? h('span', { class: 'acc-badge success' }, `Geri bildirim verildi · ${fmtDateTime(w.feedbackAt)}`)
      : flags ? h('span', { class: 'acc-badge warning', 'data-writing-flagged': String(flags) }, `Öğrenci ${flags} maddeyi işaretledi`)
      : live ? h('span', { class: 'acc-badge info', 'data-writing-ai': '' }, 'Yapay zekâ kontrol etti')
      : h('span', { class: 'acc-badge warning', 'data-writing-waiting': w.aiSkip || '' }, 'Geri bildirim bekliyor' + (AI_SKIP_LABELS[w.aiSkip] ? ` · yapay zekâ kontrol etmedi: ${AI_SKIP_LABELS[w.aiSkip]}` : ''));
    const revision = w.revisionOf && byId.has(w.revisionOf)
      ? h('span', { class: 'acc-badge', 'data-writing-revision': w.revisionOf }, `Düzeltilmiş hâl (ilk yazı: ${fmtDateTime(byId.get(w.revisionOf).at)})`) : null;
    const seen = w.feedbackAt && w.seenAt ? h('span', { class: 'acc-badge' }, 'Öğrenci okudu') : null;
    const aiBadge = draft ? h('span', { class: 'acc-badge info' }, 'Yapay zekâ taslağı hazır') : null;
    const items = w.feedbackItems?.length
      ? h('ol', { class: 'acc-feedback-items' }, ...w.feedbackItems.map((item) => h('li', {},
        h('span', { lang: 'de' }, h('del', {}, item.original), ' → ', h('ins', {}, item.korrektur)), item.erklaerung ? h('span', { class: 'acc-sub' }, ` ${item.erklaerung}`) : null)))
      : null;
    const sent = w.feedbackAt && w.feedbackSource && w.feedbackSource !== 'teacher'
      ? h('div', { class: 'acc-ai-sent' }, h('p', { class: 'acc-hint' }, `Gönderilen: ${SOURCE_LABELS[w.feedbackSource] || w.feedbackSource}`), items)
      : null;
    return h('details', { class: 'ba-card acc-card acc-writing', open: needsTeacher(w), 'data-writing': w.id },
      h('summary', {},
        h('span', { class: 'acc-writing-title' }, `${fmtDateTime(w.at)} · ${titles[i]}`),
        h('span', { class: 'acc-badges' }, h('span', { class: 'acc-badge' }, `${w.words} kelime`), revision, badge, aiBadge, seen)),
      h('div', { class: 'acc-card-body' },
        h('div', { class: 'acc-writing-text', lang: 'de' }, w.text),
        h('p', { class: 'acc-sub' }, h('a', { class: 'ba-link', href: writingUrl(w), target: '_blank', rel: 'noopener noreferrer' }, 'Görevi ve örnek cevabı aç')),
        w.aiFeedback ? instantNote(w) : null,
        live ? draftPanel(w, live, true) : null,
        draft ? draftPanel(w, draft) : null,
        sent,
        h('label', { for: `fb-${w.id}` }, h('strong', {}, draft ? 'Ya da kendin yaz' : live ? 'Ya da sadece not yaz' : 'Geri bildirimin'), h('span', { class: 'acc-sub' }, ` en fazla ${FEEDBACK_MAX} karakter; öğrenci kendi panelinde görür`)),
        area, h('div', { class: 'acc-actions' }, save), status));
  }));
}

async function renderResults(results){
  const box = $('resultsList');
  if(!results.length){
    box.replaceChildren(h('p', { class: 'acc-empty' }, isEnabled(student)
      ? 'Henüz kayıtlı alıştırma sonucu yok.'
      : 'Henüz kayıtlı alıştırma sonucu yok. Sonuçlar hesap açıldıktan sonra kaydedilir.'));
    return;
  }
  const names = await exerciseNames(results, 'tr');
  const cols = ['Alıştırma', 'Seviye', 'İlk skor', 'Son skor', 'En iyi', 'Deneme', 'Son deneme'];
  const groups = summarizeResults(results);
  // End-of-level test: wrong answers per topic in the last attempt.
  const errors = await Promise.all(groups.map((g) => g.topic === LEVEL_EXAM ? topicErrorsText(g.level, g.last?.topicErrors, 'tr') : ''));
  const rows = groups.map((g, i) => {
    const name = names[g.key];
    const examNote = g.topic === LEVEL_EXAM
      ? h('span', { class: 'acc-sub', 'data-level-exam-errors': '' }, g.last?.topicErrors === undefined ? '' : (errors[i] ? `Son denemedeki hatalar: ${errors[i]}` : 'Son denemede hata yok.'))
      : null;
    const attempts = h('details', { class: 'acc-details acc-attempts' },
      h('summary', {}, `${g.attempts.length} deneme`),
      h('ul', {}, g.attempts.map((a) => h('li', {}, h('span', {}, fmtDateTime(a.at)), h('strong', {}, scoreText(a))))));
    return h('tr', {},
      h('td', { 'data-label': cols[0] }, h('strong', {}, name.exercise), h('span', { class: 'acc-sub' }, name.topic), examNote),
      h('td', { 'data-label': cols[1] }, name.level || g.level),
      h('td', { 'data-label': cols[2], class: 'acc-num' }, scoreText(g.first)),
      h('td', { 'data-label': cols[3], class: 'acc-num' }, scoreText(g.last)),
      h('td', { 'data-label': cols[4], class: 'acc-num' }, scoreText(g.best)),
      h('td', { 'data-label': cols[5] }, attempts),
      h('td', { 'data-label': cols[6] }, fmtDateTime(g.last.at))
    );
  });
  box.replaceChildren(
    h('p', { class: 'acc-hint' }, `${results.length} deneme, ${rows.length} farklı alıştırma. Saatler Berlin saatiyle.`),
    h('div', { class: 'acc-table-wrap' },
      h('table', { class: 'acc-table' },
        h('thead', {}, h('tr', {}, cols.map((c) => h('th', { scope: 'col' }, c)))),
        h('tbody', {}, rows)))
  );
}

async function reload(){
  student = await loadProfile(uid);
  if(!student){
    $('studentLoading').hidden = true;
    $('studentApp').hidden = true;
    $('studentError').hidden = false;
    $('studentError').textContent = 'Öğrenci bulunamadı. Silinmiş olabilir.';
    return;
  }
  renderProfile();
  renderParent();
  $('newAssignmentLink').href = `ogretmen-odev.html?ogrenci=${encodeURIComponent(uid)}`;
  $('newAssignmentLink').hidden = !isEnabled(student);
  $('newLessonLink').href = `ogretmen-takvim.html?yeni=1&ogrenci=${encodeURIComponent(uid)}`;
  $('newLessonLink').hidden = !isEnabled(student);
  const [results, studentLessons, studentNotes] = await Promise.all([loadResults(uid), loadStudentLessons(uid),
    loadNotes(uid).catch((error) => { console.warn(error); return []; })]);
  lessons = studentLessons;
  notes = studentNotes;
  renderLessons();
  renderNotes();
  await Promise.all([renderAssignments(), renderResources(), renderResults(results), renderWritings()]);
  $('studentLoading').hidden = true;
  $('studentApp').hidden = false;
  // Öğretmen panelindeki "geri bildirim bekliyor" işareti #yazilar ile buraya gelir.
  if(location.hash === '#yazilar') $('yazilar').scrollIntoView({ block: 'start' });
  if(location.hash === '#ders-notlari') $('ders-notlari').scrollIntoView({ block: 'start' });
}

// ---- Yardımcı kaynak ekleme: bağlantı ya da PDF (Drive, "Bozkurt Academy Kaynaklar"), birden çok öğrenciye ----
let pdf = null;          // yüklenmiş PDF: { id, name, url }
let uploading = false;
let allStudents = [];

const resourceKind = () => (document.querySelector('input[name="rKind"]:checked')?.value === 'pdf' ? 'pdf' : 'link');
const pdfStatus = (type, message) => setStatus($('rPdfStatus'), type, message);

function showKind(){
  const isPdf = resourceKind() === 'pdf';
  $('rLinkBox').hidden = isPdf;
  $('rPdfBox').hidden = !isPdf;
}

function renderResourceStudents(){
  const enabled = allStudents.filter(isEnabled).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));
  const box = $('rStudents');
  const legend = box.querySelector('legend');
  box.replaceChildren(legend, ...(enabled.length
    ? enabled.map((s) => h('label', { class: 'acc-check' },
      h('input', { type: 'checkbox', name: 'rStudent', value: s.id, checked: s.id === uid }),
      h('span', {}, s.name, h('span', { class: 'acc-sub' }, s.email))))
    : [h('p', { class: 'acc-hint' }, 'Hesabı açık öğrenci yok.')]));
  $('rAll').disabled = !enabled.length;
  syncAll();
}

const studentBoxes = () => [...document.querySelectorAll('input[name="rStudent"]')];
function syncAll(){
  const boxes = studentBoxes();
  $('rAll').checked = boxes.length > 0 && boxes.every((b) => b.checked);
  const n = boxes.filter((b) => b.checked).length;
  $('rSubmit').textContent = n > 1 ? `Kaynağı ${n} öğrenciye ekle` : 'Kaynağı ekle';
}

async function pickResourcePdf(){
  if(!drive.isConnected()){
    $('rPdfAdd').disabled = true;
    pdfStatus('', 'Google Drive izni isteniyor…');
    try{
      await drive.connect();
    }catch(error){
      console.warn(error);
      pdfStatus('error', `Google Drive'a bağlanılamadı: ${error.message}`);
      return;
    }finally{
      $('rPdfAdd').disabled = false;
    }
    pdfStatus('success', 'Google Drive bağlandı. PDF dosyasını seç.');
  }
  $('rPdfFile').click();
}

async function uploadResourcePdf(){
  const file = $('rPdfFile').files?.[0];
  $('rPdfFile').value = '';
  if(!file) return;
  const problem = await drive.checkPdf(file);
  if(problem){ pdfStatus('error', problem); return; }
  uploading = true;
  $('rPdfAdd').disabled = true;
  $('rSubmit').disabled = true;
  const progress = $('rPdfProgress');
  progress.hidden = false;
  progress.value = 0;
  pdfStatus('', `"${file.name}" yükleniyor…`);
  try{
    pdf = await drive.uploadPdf(file, { folderName: drive.RESOURCE_FOLDER, onProgress: (p) => { progress.value = p; } });
    $('rPdfName').hidden = false;
    $('rPdfName').textContent = pdf.name;
    $('rPdfAdd').textContent = 'Başka PDF seç';
    if(!$('rTitle').value.trim()) $('rTitle').value = pdf.name.replace(/\.pdf$/i, '').slice(0, MAX_TITLE);
    pdfStatus('success', `"${pdf.name}" Drive'a yüklendi ve paylaşıldı. Öğrencileri seçip "Kaynağı ekle"ye bas.`);
  }catch(error){
    console.warn(error);
    pdfStatus('error', `PDF yüklenemedi: ${error.message} Tekrar dene.`);
  }finally{
    uploading = false;
    progress.hidden = true;
    $('rPdfAdd').disabled = false;
    $('rSubmit').disabled = false;
  }
}

function resetResourceForm(){
  $('resourceForm').reset();
  pdf = null;
  $('rPdfName').hidden = true;
  $('rPdfName').textContent = '';
  $('rPdfAdd').textContent = 'PDF seç';
  $('rPdfStatus').hidden = true;
  showKind();
  renderResourceStudents();
}

$('resourceForm').addEventListener('change', (e) => {
  if(e.target.name === 'rKind') showKind();
  if(e.target.name === 'rStudent') syncAll();
});
$('rAll').addEventListener('change', () => { studentBoxes().forEach((b) => { b.checked = $('rAll').checked; }); syncAll(); });
$('rPdfAdd').addEventListener('click', pickResourcePdf);
$('rPdfFile').addEventListener('change', uploadResourcePdf);

$('resourceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if(uploading) return;
  const kind = resourceKind();
  let title = $('rTitle').value.trim();
  const note = $('rNote').value.trim();
  let url = '';
  if(kind === 'pdf'){
    if(!pdf){ setActionStatus('error', 'Önce bir PDF seçip yükle.'); $('rPdfAdd').focus(); return; }
    url = pdf.url;
    if(!title) title = pdf.name.replace(/\.pdf$/i, '').slice(0, MAX_TITLE);
  }else{
    url = $('rUrl').value.trim();
    if(!validHttpsUrl(url)){ setActionStatus('error', 'Bağlantı https:// ile başlamalı.'); $('rUrl').focus(); return; }
  }
  if(title.length < 2){ setActionStatus('error', 'Kaynak için bir başlık yaz.'); $('rTitle').focus(); return; }
  const ids = studentBoxes().filter((b) => b.checked).map((b) => b.value);
  if(!ids.length){ setActionStatus('error', 'En az bir öğrenci seç.'); return; }
  const button = $('rSubmit');
  button.disabled = true;
  try{
    await addResourceCopies(ids, kind === 'pdf'
      ? { title, url, note, kind, fileId: pdf.id, fileName: pdf.name }
      : { title, url, note, kind });
    resetResourceForm();
    setActionStatus('success', ids.length > 1 ? `Kaynak ${ids.length} öğrenciye eklendi. Öğrenci panellerinde görünür.` : 'Kaynak eklendi. Öğrenci panelinde görünür.');
    await reload();
  }catch(error){
    console.error(error);
    setActionStatus('error', 'Kaynak eklenemedi. Tekrar dene.');
  }finally{
    button.disabled = false;
    syncAll();
  }
});

const user = await requireTeacher({ loadingId: 'studentLoading', errorId: 'studentError' });
if(user){
  if(!uid){
    location.replace('ogretmen.html');
  }else{
    if(drive.driveConfigured) drive.preload();
    else{ $('rKindPdf').disabled = true; $('rPdfHint').textContent = 'PDF yükleme için Google Drive bağlantısı kurulu değil (docs/kurulum.md).'; }
    listStudents().then((list) => { allStudents = list; renderResourceStudents(); }).catch((error) => console.warn(error));
    reload().catch((error) => {
      console.error(error);
      $('studentLoading').hidden = true;
      $('studentError').hidden = false;
      $('studentError').textContent = 'Öğrenci yüklenemedi. Tekrar dene.';
    });
  }
}
