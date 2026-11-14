// Schreiben: yapay zekâ geri bildiriminin öğrenciye gösterimi. Görev sayfası (js/account/session.js → js/writing-task.js)
// ve öğrenci paneli (js/account/student.js) aynı görünümü kullanır. Firebase içermez; sadece giriş yapmış öğrencide yüklenir.
// Hatalı yerler metinde düğme olarak işaretlidir; tıklanınca altındaki listede Türkçe açıklaması öne çıkar.
// Her maddede "Bu açıklama yanlış görünüyor" düğmesi: onFlag(sıra) çağrılır, öğretmen paneline düşer (aiFlags).
// Stil: css/writing-feedback.css.

function el(tag, attrs = {}, ...children){
  const node = document.createElement(tag);
  for(const [key, value] of Object.entries(attrs)){
    if(value == null || value === false) continue;
    if(key === 'class') node.className = value;
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for(const child of children.flat()){
    if(child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// Her maddenin metindeki ilk çakışmayan yeri: [{ at, end, index }], metin sırasına göre.
export function markSpans(text, items){
  const spans = [];
  (items || []).forEach((item, index) => {
    let from = 0;
    while(item?.original){
      const at = text.indexOf(item.original, from);
      if(at < 0) break;
      const end = at + item.original.length;
      if(!spans.some((s) => at < s.end && end > s.at)){ spans.push({ at, end, index }); break; }
      from = at + 1;
    }
  });
  return spans.sort((a, b) => a.at - b.at);
}

let serial = 0;

// text: öğrencinin metni; feedback: { errors: [{ original, korrektur, erklaerung }], correctedText };
// flags: öğrencinin daha önce işaretlediği madde sıraları; onFlag: (sıra) => Promise (yoksa düğme gösterilmez).
export function feedbackView({ text, feedback, flags = [], onFlag = null, t }){
  const errors = Array.isArray(feedback?.errors) ? feedback.errors : [];
  const prefix = `wf${++serial}`;
  const flagged = new Set(flags);
  const itemEls = [];
  const markEls = [];

  const select = (index, focus) => {
    itemEls.forEach((item, i) => item.classList.toggle('is-active', i === index));
    markEls.forEach((mark) => {
      const on = Number(mark.dataset.wfMark) === index;
      mark.classList.toggle('is-active', on);
      mark.setAttribute('aria-expanded', String(on));
    });
    const item = itemEls[index];
    if(!item || !focus) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    item.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    item.focus({ preventScroll: true });
  };

  const body = [];
  let pos = 0;
  for(const span of markSpans(text, errors)){
    body.push(text.slice(pos, span.at));
    const mark = el('button', { type: 'button', class: 'wf-mark', 'data-wf-mark': span.index, 'aria-controls': `${prefix}-${span.index}`, 'aria-expanded': 'false',
      'aria-label': t('wfMarkLabel').replace('{n}', String(span.index + 1)).replace('{text}', text.slice(span.at, span.end)) },
    text.slice(span.at, span.end), el('sup', { 'aria-hidden': 'true' }, String(span.index + 1)));
    mark.addEventListener('click', () => select(span.index, true));
    markEls.push(mark);
    body.push(mark);
    pos = span.end;
  }
  body.push(text.slice(pos));

  errors.forEach((item, index) => {
    const flagBox = el('p', { class: 'wf-flag-box' });
    const done = () => flagBox.replaceChildren(el('span', { class: 'wf-flagged', 'data-wf-flagged': index }, t('wfFlagged')));
    if(flagged.has(index)) done();
    else if(onFlag){
      const button = el('button', { type: 'button', class: 'wf-flag', 'data-wf-flag': index }, t('wfFlag'));
      const status = el('span', { class: 'wf-flag-error', role: 'alert' });
      button.addEventListener('click', async () => {
        button.disabled = true;
        status.textContent = '';
        try{ await onFlag(index); flagged.add(index); done(); }
        catch(error){ console.error(error); button.disabled = false; status.textContent = t('wfFlagFailed'); }
      });
      flagBox.append(button, status);
    }
    const row = el('li', { id: `${prefix}-${index}`, class: 'wf-item', tabindex: '-1', 'data-wf-item': index },
      el('p', { class: 'wf-fix', lang: 'de' }, el('del', {}, item.original), ' → ', el('ins', {}, item.korrektur)),
      el('p', { class: 'wf-why', lang: 'tr' }, item.erklaerung),
      flagBox.childNodes.length ? flagBox : null);
    itemEls.push(row);
  });

  return el('section', { class: 'wf', 'data-wf': '', 'aria-label': t('wfLabel') },
    el('p', { class: 'wf-head' }, el('span', { class: 'wf-badge' }, t('wfLabel'))),
    el('p', { class: 'wf-hint' }, t(errors.length ? 'wfHint' : 'wfNone')),
    el('div', { class: 'wf-text', lang: 'de', 'data-wf-text': '' }, body),
    errors.length ? el('ol', { class: 'wf-items' }, itemEls) : null,
    feedback?.correctedText ? el('details', { class: 'wf-corrected' }, el('summary', {}, t('wfCorrected')),
      el('div', { class: 'wf-text', lang: 'de', 'data-wf-corrected': '' }, feedback.correctedText)) : null);
}
