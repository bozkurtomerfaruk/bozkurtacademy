// ogretmen-ogrenci.html?id=UID: öğrenci detayı, onay işlemleri, veli onayı, alıştırma sonuçları.
import {
  $, bestResultSince, consentGiven, currentYear, exerciseNames, formatDateTime, h, BERLIN, loadAssignments, loadProfile,
  loadResources, loadResults, loadWritings, safeLink, scoreText, summarizeResults, toDate, validEmail, validHttpsUrl, LEVEL_EXAM, topicErrorsText,
  setStatus, writingTitle, writingUrl
} from './common.js';
import {
  addResource, approve, deleteAssignment, deleteResource, emailVerified, fmtDate, isEnabled, openDeleteDialog,
  aiAllowed, approveAiDraft, deleteAiDraft, loadAiDrafts, recordAiConsent,
  recordConsent, requireTeacher, saveWritingFeedback, setActive, setInactive, statusBadges, UNVERIFIED_WARNING, updateParent
} from './teacher-common.js';
import * as cal from './calendar.js';
import { db, fs } from './firebase.js';
import { applyAttendees, loadStudentLessons } from './lessons.js';

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
  $('lessonsList').replaceChildren(
    upcoming.length
      ? h('ul', { class: 'acc-status-list acc-lesson-list' }, upcoming.map(row))
      : h('p', { class: 'acc-empty' }, 'Planlanmış ders yok.'),
    past.length ? h('details', { class: 'acc-details' }, h('summary', {}, `Geçmiş dersler (${past.length})`), h('ul', { class: 'acc-status-list' }, past.map(row))) : null,
    h('p', { class: 'acc-hint' }, h('a', { class: 'ba-link', href: 'ogretmen-takvim.html' }, 'Takvimde aç'), ' (taşıma ve iptal için).'));
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
    h('label', { class: 'acc-check' }, input, h('span', {}, 'Ders davetlerine ve hatırlatma e-postalarına veliyi de ekle')),
    save);
}

// Öğrencinin ödevleri: yaklaşanlar önce, tamamlananlar sonda.
async function renderAssignments(results){
  const assignments = await loadAssignments(uid);
  const box = $('assignmentsList');
  if(!assignments.length){
    box.replaceChildren(h('p', { class: 'acc-empty' }, 'Bu öğrenciye henüz ödev verilmedi.'));
    return;
  }
  const names = await exerciseNames(assignments.flatMap((a) => a.exercises || []), 'tr');
  assignments.sort((a, b) => (a.done - b.done) || ((toDate(a.dueAt) || 0) - (toDate(b.dueAt) || 0)));
  const now = new Date();
  box.replaceChildren(h('div', { class: 'acc-list' }, assignments.map((a) => {
    const overdue = !a.done && toDate(a.dueAt) < now;
    const remove = h('button', { class: 'acc-text-button', type: 'button' }, 'Bu öğrenciden kaldır');
    remove.addEventListener('click', async () => {
      if(!confirm(`"${a.title}" ödevi bu öğrenciden kaldırılsın mı?`)) return;
      remove.disabled = true;
      try{
        await deleteAssignment(uid, a.id);
        await reload();
      }catch(error){
        console.error(error);
        setActionStatus('error', 'Ödev kaldırılamadı. Tekrar dene.');
        remove.disabled = false;
      }
    });
    return h('article', { class: 'acc-row acc-assign-row' },
      h('div', { class: 'acc-row-main' },
        h('span', { class: 'acc-row-name' }, a.title),
        h('span', { class: 'acc-badges' },
          h('span', { class: `acc-badge ${a.done ? 'success' : ''}` }, a.done ? `Tamamladı · ${fmtDateTime(a.doneAt)}` : 'Bekliyor'),
          overdue ? h('span', { class: 'acc-badge warning' }, 'Süresi geçti') : null)),
      h('dl', { class: 'acc-row-meta' },
        h('div', {}, h('dt', {}, 'Teslim'), h('dd', {}, fmtDateTime(a.dueAt))),
        a.docUrl ? h('div', {}, h('dt', {}, 'Doküman'), h('dd', {}, safeLink(a.docUrl, 'Aç'))) : null,
        a.studentDocUrl ? h('div', {}, h('dt', {}, 'Öğrencinin dokümanı'), h('dd', {}, safeLink(a.studentDocUrl, 'Aç'))) : null),
      h('div', { class: 'acc-row-actions' }, remove),
      (a.exercises || []).length ? h('ul', { class: 'acc-status-list acc-row-full' }, a.exercises.map((e) => {
        const n = names[`${e.level}/${e.topic}/${e.exercise}`];
        const best = bestResultSince(results, e, a.createdAt);
        return h('li', {},
          h('span', {}, `${e.level} · ${n?.topic || e.topic} · ${n?.exercise || e.exercise}`),
          h('span', { class: `acc-badge ${best ? 'success' : ''}` }, best ? `Çözüldü · ${scoreText(best)}` : 'Henüz çözülmedi'));
      })) : null
    );
  })));
}

async function renderResources(){
  const resources = await loadResources(uid);
  const box = $('resourcesList');
  box.replaceChildren(...(resources.length
    ? [h('ul', { class: 'acc-resource-list' }, resources.map((r) => {
      const remove = h('button', { class: 'acc-text-button', type: 'button' }, 'Sil');
      remove.addEventListener('click', async () => {
        if(!confirm(`"${r.title}" kaynağı silinsin mi?`)) return;
        remove.disabled = true;
        try{
          await deleteResource(uid, r.id);
          await reload();
        }catch(error){
          console.error(error);
          setActionStatus('error', 'Kaynak silinemedi. Tekrar dene.');
          remove.disabled = false;
        }
      });
      return h('li', {},
        h('div', {}, safeLink(r.url, r.title), r.note ? h('span', { class: 'acc-sub' }, r.note) : null),
        remove);
    }))]
    : [h('p', { class: 'acc-hint' }, 'Henüz kaynak eklenmedi.')]));
}

// Schreiben metinleri: en yeni üstte; geri bildirim bekleyenler işaretli. Öğretmen geri bildirim yazar ya da düzeltir
// (en fazla 2000 karakter, firestore.rules); öğrenci kendi panelinde görür. Yapay zekâ taslağı varsa (aiDrafts) metnin
// altında düzenlenebilir hâlde durur: öğretmen düzeltip onaylar ya da siler. Öğrenci taslağı hiçbir zaman görmez.
const FEEDBACK_MAX = 2000;
const SOURCE_LABELS = { teacher: 'Senin geri bildirimin', 'ai-approved': 'Yapay zekâ önerisi, aynen onaylandı', 'ai-edited': 'Yapay zekâ önerisi, düzenlenerek onaylandı' };

function draftItemRow(item, index, wid){
  const row = h('li', { class: 'acc-ai-item', 'data-ai-item': String(index) },
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

function draftPanel(w, draft){
  const list = h('ol', { class: 'acc-ai-items' }, ...draft.errors.map((item, i) => draftItemRow(item, i, w.id)));
  const corrected = h('textarea', { id: `ai-c-${w.id}`, rows: '6', maxlength: '6000', lang: 'de', 'data-ai-corrected': '' }, draft.correctedText || '');
  const note = h('textarea', { id: `ai-n-${w.id}`, rows: '3', maxlength: String(FEEDBACK_MAX), 'data-ai-note': '' });
  const status = h('p', { class: 'acc-status', role: 'status', hidden: true });
  const send = h('button', { class: 'btn primary', type: 'button', 'data-ai-approve': '' }, 'Onayla ve öğrenciye gönder');
  const drop = h('button', { class: 'btn ghost', type: 'button', 'data-ai-delete': '' }, 'Taslağı sil');
  send.addEventListener('click', async () => {
    const items = [...list.querySelectorAll('[data-ai-item]')].map((row) => ({
      original: row.dataset.original,
      korrektur: row.querySelector('[data-ai-korrektur]').value.trim(),
      erklaerung: row.querySelector('[data-ai-erklaerung]').value.trim()
    })).filter((item) => item.korrektur && item.korrektur !== item.original);
    const text = note.value.trim().slice(0, FEEDBACK_MAX);
    const correctedText = corrected.value.trim();
    if(!items.length && !text){ setStatus(status, 'error', 'Öneri kalmadı: kısa bir not yaz ya da taslağı sil.'); note.focus(); return; }
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
  return h('section', { class: 'acc-ai-draft', 'data-ai-draft': w.id, 'aria-label': 'Yapay zekâ taslağı' },
    h('h3', {}, 'Yapay zekâ taslağı'),
    h('p', { class: 'acc-hint' }, `Öğrenci bu taslağı görmez. Önerileri kontrol et: yanlış olanı düzelt ya da çıkar, sonra onayla. Model: ${draft.model || '—'} · ${fmtDateTime(draft.createdAt)}`),
    draft.errors.length ? list : h('p', { class: 'acc-hint' }, 'Yapay zekâ bu metinde hata bulmadı.'),
    h('label', { for: `ai-c-${w.id}` }, h('strong', {}, 'Düzeltilmiş metin')), corrected,
    h('label', { for: `ai-n-${w.id}` }, h('strong', {}, 'Kendi notun'), h('span', { class: 'acc-sub' }, ' isteğe bağlı; öğrenci önerilerin üstünde görür')), note,
    h('div', { class: 'acc-actions' }, send, drop), status);
}

function instantNote(w){
  const n = w.aiFeedback?.errors?.length || 0;
  return h('p', { class: 'acc-hint', 'data-ai-instant': '' }, `"Anında göster" modunda yapay zekâ önerisi öğrenciye gösterildi (${n} öneri). Kendi geri bildirimini yazarsan öğrenci ikisini de görür.`);
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
      const off = h('button', { class: 'btn ghost', type: 'button', 'data-ai-consent-withdraw': '' }, 'Veli yapay zekâ onayını geri çekti');
      off.addEventListener('click', () => run(off, () => recordAiConsent(uid, { given: false }), 'Yapay zekâ kontrolü bu öğrencide kapatıldı. Var olan taslaklar sende kalır; istersen sil.'));
      items.push(off);
    }else{
      items.push(h('p', { class: 'acc-hint' }, '16 yaş altı: veli onay formundaki ayrı "yapay zekâ ile kontrol" kutusu işaretlenmişse burada kaydet. Onay yoksa öğrenci sadece senin geri bildirimini alır.'));
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
        run(submit, () => recordAiConsent(uid, { given: true, date: new Date(`${date.value}T12:00:00`), method }), 'Velinin yapay zekâ onayı kaydedildi.');
      });
      items.push(h('details', { class: 'acc-details' }, h('summary', {}, 'Velinin yapay zekâ onayını kaydet'), form));
    }
  }else{
    const button = allowed
      ? h('button', { class: 'btn ghost', type: 'button', 'data-ai-consent-withdraw': '' }, 'Bu öğrencide kapat (öğrenci istemiyor)')
      : h('button', { class: 'btn ghost', type: 'button', 'data-ai-consent-record': '' }, 'Yeniden aç');
    button.addEventListener('click', () => run(button, () => recordAiConsent(uid, { given: !allowed, method: 'student' }), allowed ? 'Yapay zekâ kontrolü bu öğrencide kapatıldı.' : 'Yapay zekâ kontrolü yeniden açıldı.'));
    items.push(h('p', { class: 'acc-hint' }, 'Yetişkin öğrenci: metni gönderilince yapay zekâ kontrolü otomatik çalışır (gizlilik politikası). Öğrenci istemezse kapat.'), button);
  }
  box.replaceChildren(...items);
}

async function renderWritings(){
  renderAiConsent();
  const box = $('writingsList');
  const [writings, drafts] = await Promise.all([loadWritings(uid), loadAiDrafts(uid)]);
  const draftById = new Map(drafts.map((d) => [d.writingId, d]));
  const pending = writings.filter((w) => !w.feedbackAt).length;
  $('writingsCount').textContent = pending ? `${pending} geri bildirim bekliyor` : '';
  $('writingsCount').hidden = !pending;
  if(!writings.length){
    box.replaceChildren(h('p', { class: 'acc-empty' }, 'Henüz gönderilmiş yazı yok.'));
    return;
  }
  const titles = await Promise.all(writings.map(writingTitle));
  box.replaceChildren(...writings.map((w, i) => {
    const draft = !w.feedbackAt ? draftById.get(w.id) : null;
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
      : h('span', { class: 'acc-badge warning' }, 'Geri bildirim bekliyor');
    const seen = w.feedbackAt && w.seenAt ? h('span', { class: 'acc-badge' }, 'Öğrenci okudu') : null;
    const aiBadge = draft ? h('span', { class: 'acc-badge info' }, 'Yapay zekâ taslağı hazır') : null;
    const items = w.feedbackItems?.length
      ? h('ol', { class: 'acc-feedback-items' }, ...w.feedbackItems.map((item) => h('li', {},
        h('span', { lang: 'de' }, h('del', {}, item.original), ' → ', h('ins', {}, item.korrektur)), item.erklaerung ? h('span', { class: 'acc-sub' }, ` ${item.erklaerung}`) : null)))
      : null;
    const sent = w.feedbackAt && w.feedbackSource && w.feedbackSource !== 'teacher'
      ? h('div', { class: 'acc-ai-sent' }, h('p', { class: 'acc-hint' }, `Gönderilen: ${SOURCE_LABELS[w.feedbackSource] || w.feedbackSource}`), items)
      : null;
    return h('details', { class: 'ba-card acc-card acc-writing', open: !w.feedbackAt, 'data-writing': w.id },
      h('summary', {},
        h('span', { class: 'acc-writing-title' }, `${fmtDateTime(w.at)} · ${titles[i]}`),
        h('span', { class: 'acc-badges' }, h('span', { class: 'acc-badge' }, `${w.words} kelime`), badge, aiBadge, seen)),
      h('div', { class: 'acc-card-body' },
        h('div', { class: 'acc-writing-text', lang: 'de' }, w.text),
        h('p', { class: 'acc-sub' }, h('a', { class: 'ba-link', href: writingUrl(w), target: '_blank', rel: 'noopener noreferrer' }, 'Görevi ve örnek cevabı aç')),
        w.aiFeedback ? instantNote(w) : null,
        draft ? draftPanel(w, draft) : null,
        sent,
        h('label', { for: `fb-${w.id}` }, h('strong', {}, draft ? 'Ya da kendin yaz' : 'Geri bildirimin'), h('span', { class: 'acc-sub' }, ` en fazla ${FEEDBACK_MAX} karakter; öğrenci kendi panelinde görür`)),
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
      h('td', { 'data-label': cols[1] }, g.level),
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
  const [results, studentLessons] = await Promise.all([loadResults(uid), loadStudentLessons(uid)]);
  lessons = studentLessons;
  renderLessons();
  await Promise.all([renderAssignments(results), renderResources(), renderResults(results), renderWritings()]);
  $('studentLoading').hidden = true;
  $('studentApp').hidden = false;
  // Öğretmen panelindeki "geri bildirim bekliyor" işareti #yazilar ile buraya gelir.
  if(location.hash === '#yazilar') $('yazilar').scrollIntoView({ block: 'start' });
}

$('resourceForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = $('rTitle').value.trim();
  const url = $('rUrl').value.trim();
  const note = $('rNote').value.trim();
  if(title.length < 2){
    setActionStatus('error', 'Kaynak için bir başlık yaz.');
    $('rTitle').focus();
    return;
  }
  if(!validHttpsUrl(url)){
    setActionStatus('error', 'Link https:// ile başlamalı.');
    $('rUrl').focus();
    return;
  }
  const button = $('rSubmit');
  button.disabled = true;
  try{
    await addResource(uid, { title, url, note });
    $('resourceForm').reset();
    setActionStatus('success', 'Kaynak eklendi. Öğrenci panelinde görünür.');
    await reload();
  }catch(error){
    console.error(error);
    setActionStatus('error', 'Kaynak eklenemedi. Tekrar dene.');
  }finally{
    button.disabled = false;
  }
});

const user = await requireTeacher({ loadingId: 'studentLoading', errorId: 'studentError' });
if(user){
  if(!uid){
    location.replace('ogretmen.html');
  }else{
    reload().catch((error) => {
      console.error(error);
      $('studentLoading').hidden = true;
      $('studentError').hidden = false;
      $('studentError').textContent = 'Öğrenci yüklenemedi. Tekrar dene.';
    });
  }
}
