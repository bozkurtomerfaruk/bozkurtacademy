// ogretmen-ogrenci.html?id=UID: öğrenci detayı, onay işlemleri, veli onayı, alıştırma sonuçları.
import { $, consentGiven, currentYear, exerciseNames, formatDateTime, h, BERLIN, loadProfile, loadResults, scoreText, summarizeResults, validEmail } from './common.js';
import {
  approve, emailVerified, fmtDate, isEnabled, openDeleteDialog, recordConsent, requireTeacher, setActive, setInactive,
  statusBadges, UNVERIFIED_WARNING, updateParent
} from './teacher-common.js';

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
  items.push(parentEditForm());
  $('parentContent').replaceChildren(...items);
}

async function renderResults(){
  const results = await loadResults(uid);
  const box = $('resultsList');
  if(!results.length){
    box.replaceChildren(h('p', { class: 'acc-empty' }, isEnabled(student)
      ? 'Henüz kayıtlı alıştırma sonucu yok.'
      : 'Henüz kayıtlı alıştırma sonucu yok. Sonuçlar hesap açıldıktan sonra kaydedilir.'));
    return;
  }
  const names = await exerciseNames(results, 'tr');
  const cols = ['Alıştırma', 'Seviye', 'Son skor', 'En iyi', 'Deneme', 'Son deneme'];
  const rows = summarizeResults(results).map((g) => {
    const name = names[g.key];
    const attempts = h('details', { class: 'acc-details acc-attempts' },
      h('summary', {}, `${g.attempts.length} deneme`),
      h('ul', {}, g.attempts.map((a) => h('li', {}, h('span', {}, fmtDateTime(a.at)), h('strong', {}, scoreText(a))))));
    return h('tr', {},
      h('td', { 'data-label': cols[0] }, h('strong', {}, name.exercise), h('span', { class: 'acc-sub' }, name.topic)),
      h('td', { 'data-label': cols[1] }, g.level),
      h('td', { 'data-label': cols[2], class: 'acc-num' }, scoreText(g.last)),
      h('td', { 'data-label': cols[3], class: 'acc-num' }, scoreText(g.best)),
      h('td', { 'data-label': cols[4] }, attempts),
      h('td', { 'data-label': cols[5] }, fmtDateTime(g.last.at))
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
  await renderResults();
  $('studentLoading').hidden = true;
  $('studentApp').hidden = false;
}

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
