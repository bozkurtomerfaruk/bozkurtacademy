// js/html.js birim testleri (npm test). Tarayıcı gerekmez: dosya node:vm içinde çalıştırılır.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { check } from '../scripts/check-html-escape.mjs';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../js/html.js', import.meta.url), 'utf8'), ctx);
const { escapeHtml, safeUrl, sanitizeSvg } = ctx.window.baHtml;

test('escapeHtml bütün özel karakterleri kaçışlar', () => {
  assert.equal(escapeHtml(`<img src=x onerror="a('b')">&`), '&lt;img src=x onerror=&quot;a(&#039;b&#039;)&quot;&gt;&amp;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(0), '0');
});

test('safeUrl yalnızca https ve göreli yollara izin verir', () => {
  for (const ok of ['https://deutsch-mit-anna.de/a1', '/almanca-gramer/a1/artikel/', '#exams/goethe', '?x=1', './a', 'data/x.json', 'HTTPS://ok.example'])
    assert.equal(safeUrl(ok), ok, ok);
  for (const bad of ['javascript:alert(1)', ' javascript:alert(1)', 'java\nscript:alert(1)', 'JaVaScRiPt:x', 'data:text/html,<b>', 'http://example.com', '//evil.example/x', 'vbscript:x', 'mailto:a@b.c', '', null])
    assert.equal(safeUrl(bad), '', String(bad));
});

test('sanitizeSvg izinli çizim öğelerini korur, gerisini atar', () => {
  const pic = '<g fill="#e8b04a" stroke="#333" stroke-width="2"><circle cx="50" cy="50" r="20"/><path d="M1 1L2 2"/></g>';
  assert.equal(sanitizeSvg(pic), pic);
  assert.equal(sanitizeSvg('<script>alert(1)</script><rect x="1" onload="alert(1)" width="2"/>'), '<rect x="1" width="2"/>');
  assert.equal(sanitizeSvg('<a href="javascript:x"><circle r="1"/></a><foreignObject><img src=x onerror=1></foreignObject>'), '<circle r="1"/>');
  assert.equal(sanitizeSvg('<rect fill="url(javascript:x)" width="1"/>'), '<rect width="1"/>');
  assert.equal(sanitizeSvg('<g><rect width="1"/>'), '<g><rect width="1"/></g>');
});

test('bütün resimler sanitizeSvg sonrası değişmeden kalır', () => {
  const { pictures } = JSON.parse(fs.readFileSync(new URL('../data/cocuk/resimler.json', import.meta.url), 'utf8'));
  for (const [key, svg] of Object.entries(pictures)) assert.equal(sanitizeSvg(svg), svg, key);
});

test('kontrol betiği kaçışsız değeri yakalar', () => {
  assert.equal(check('x.js', 'el.innerHTML = `<p>${q.text}</p>`;').length, 1);
  assert.equal(check('x.js', 'el.innerHTML = `<p>${escapeHtml(q.text)}</p><a href="${safeUrl(q.url)}">${n.length}</a>`;').length, 0);
  assert.equal(check('x.js', 'el.innerHTML = `<p>${a ? escapeHtml(b) : c}</p>`;').length, 1);
  assert.equal(check('x.js', 'el.innerHTML = `<ul>${list.map(x => `<li>${x.name}</li>`).join("")}</ul>`;').length, 1);
});
