// tools/audio-check-offline.html: Almanca Alfabe ses kontrolünün tek dosyalık, sunucusuz sürümü. Bütün MP3'ler sayfanın
// içinde (base64). İndirip çift tıklayınca tarayıcıda açılır; internet ve sunucu gerekmez. Yayına girmez (_config.yml →
// exclude: tools). Her klip için "İyi / Kötü" ve not, harf adlarında hangi yazımın seçildiği; "Sonuçları kopyala"
// hepsini düz metin olarak panoya koyar.
//   node scripts/build-audio-check-offline.mjs          sayfayı üretir
//   node scripts/build-audio-check-offline.mjs --check  sayfa seslerle güncel mi (CI)
// Sesleri ürettikten sonra scripts/generate-alfabe-audio.mjs bunu kendisi çağırır.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REPO, AUDIO_DIR, ALT_DIR, loadClips, readManifest } from './generate-alfabe-audio.mjs';

export const OFFLINE_FILE = 'tools/audio-check-offline.html';

// The clips of the review, in groups. Every item: id, group, file (as in the repository), text (shown), say (what the
// voice reads), audio (base64), letter / options for the letter names.
export function collect(root = REPO) {
  const clips = loadClips(root);
  const manifest = readManifest(path.join(root, AUDIO_DIR));
  const b64 = (file) => (fs.existsSync(file) ? fs.readFileSync(file).toString('base64') : null);
  let alts = { harfler: [] };
  try { alts = JSON.parse(fs.readFileSync(path.join(root, ALT_DIR, 'liste.json'), 'utf8')); } catch (_) {}
  const altBy = Object.fromEntries((alts.harfler || []).map((h) => [h.clip, h]));
  const item = (c) => {
    const e = manifest.clips[c.id];
    return { id: c.id, file: `${AUDIO_DIR}/${c.file}`, text: c.text, say: c.say || c.text, heard: e?.heard ?? null, score: e?.score ?? null,
      audio: e && !e.stale ? b64(path.join(root, AUDIO_DIR, c.file)) : null };
  };
  const groups = [
    { id: 'harf', title: 'Harf adları', note: 'Oyundaki klip ve denenen yazımlar yan yana. "Seçtiğim" ile hangisinin oyunda kalmasını istediğini işaretle.' },
    { id: 'cocuk', title: 'Çocuk kelimeleri', note: 'Çocuk modundaki örnek kelimeler, artikeliyle.' },
    { id: 'yetiskin', title: 'Yetişkin kelimeleri', note: 'Yetişkin modundaki örnek kelimeler, artikeliyle.' },
    { id: 'heceleme', title: 'Heceleme', note: 'İşaretler, senaryo soruları ve cevapları. "Diziyi çal" oyundaki gibi harf harf, aralarında duraklamayla çalar.' },
    { id: 'tr', title: 'Türkçe talimat ve geri bildirimler', note: 'Çocuk modunda okunan Türkçe cümleler ve "Richtig!".' }
  ];
  const items = { harf: [], cocuk: [], yetiskin: [], heceleme: [], tr: [] };
  for (const c of clips) {
    if (c.kind === 'harf') {
      const h = altBy[c.id];
      items.harf.push({ ...item(c), ipa: c.ipa, options: (h?.secenekler || []).map((o) => ({
        id: `${c.id}--alt--${o.file}`, file: `${ALT_DIR}/${o.file}`, say: o.text, phonemes: o.phonemes || '', chosen: o.text === c.say,
        audio: b64(path.join(root, ALT_DIR, o.file)) })) });
    } else if (c.kind === 'kelime') items[c.profile === 'yetiskin' ? 'yetiskin' : 'cocuk'].push(item(c));
    else if (['isaret', 'soru', 'cevap'].includes(c.kind)) items.heceleme.push({ ...item(c), kind: c.kind });
    else items.tr.push(item(c));
  }
  // Spelling sequences as in the game: the scenario answer letter by letter (letter-name and sign clips).
  const data = JSON.parse(fs.readFileSync(path.join(root, 'data/alfabe.json'), 'utf8'));
  const letterClip = (ch) => {
    const l = data.harfler.find((x) => x.kucuk === ch.toLocaleLowerCase('de-DE'));
    if (l) return clips.find((c) => c.kind === 'harf' && c.text === (l.soyle || l.ad))?.id;
    const s = data.isaretler[ch];
    return s ? clips.find((c) => c.kind === 'isaret' && c.text === s.ad)?.id : null;
  };
  const sequences = (data.heceleme?.yetiskin || []).map((sc) => ({ answer: sc.cevap, question: sc.soru, clips: Array.from(sc.cevap).map(letterClip).filter(Boolean) }));
  return { groups: groups.map((g) => ({ ...g, items: items[g.id] })), sequences };
}

const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

export function pageText(root = REPO) {
  const review = collect(root);
  const hash = crypto.createHash('sha256').update(json(review)).digest('hex').slice(0, 12);
  return `<!DOCTYPE html>
<!-- Bu dosya scripts/build-audio-check-offline.mjs ile üretilir; elle düzenleme. Yayına girmez (_config.yml → exclude: tools).
     Sunucusuz: indirip çift tıkla. Bütün sesler bu dosyanın içinde. Sürüm: ${hash} -->
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<!-- Sadece bu dosyanın kendi içeriği: dışarıya hiçbir istek yok. -->
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src data:; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<title>Ses kontrolü (çevrimdışı): Almanca Alfabe</title>
<style>
:root{--bg:#ddd6c6;--paper:#f3f0e8;--paper2:#e6e1d5;--ink:#2a2a26;--muted:#55534a;--line:#d3cbb9;--strong:#857d6b;--accent:#45572f;--accent-ink:#fff;--good:#2f5d34;--good-bg:#e2ecd9;--bad:#9a3328;--bad-bg:#f6e2dc;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#161a14;--paper:#22271f;--paper2:#2d3329;--ink:#ece6d6;--muted:#bdb6a3;--line:#3a4135;--strong:#858d79;--accent:#b9cb9c;--accent-ink:#18200f;--good:#b9dfb0;--good-bg:#24361f;--bad:#f0a89c;--bad-bg:#3d2622;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;padding:20px 14px 120px;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1100px;margin:0 auto}
h1{font:400 clamp(1.6rem,1.2rem + 1.6vw,2.4rem)/1.15 Georgia,"Times New Roman",serif;margin:0 0 8px}
h2{font:400 1.5rem/1.2 Georgia,"Times New Roman",serif;margin:32px 0 6px}
.note{color:var(--muted);font-size:.92rem;margin:0 0 12px}
.bar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:10px 12px;margin:12px 0;background:var(--paper);border-radius:8px;box-shadow:0 1px 0 var(--line)}
.bar label{display:inline-flex;gap:6px;align-items:center}
.count{color:var(--muted);font-size:.9rem}
.list{display:grid;gap:8px}
.item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:6px 12px;align-items:center;padding:10px 12px;background:var(--paper);border-radius:8px;border-left:4px solid transparent}
.item.is-good{border-left-color:var(--good)}.item.is-bad{border-left-color:var(--bad);background:var(--bad-bg)}
.item.is-playing{outline:2px solid var(--accent);outline-offset:1px}
.txt b{font-size:1.08rem}.txt small{display:block;color:var(--muted);font-size:.8rem;overflow-wrap:anywhere}
.play{display:flex;gap:6px}
button{min-height:40px;min-width:40px;padding:0 12px;border:0;border-radius:6px;background:var(--paper2);color:var(--ink);font:inherit;cursor:pointer;box-shadow:inset 0 0 0 1px var(--strong)}
button:hover{background:var(--line)}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
button.primary{background:var(--accent);color:var(--accent-ink);box-shadow:none}
.judge{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.judge button[aria-pressed="true"].g{background:var(--good-bg);box-shadow:inset 0 0 0 2px var(--good)}
.judge button[aria-pressed="true"].b{background:var(--bad-bg);box-shadow:inset 0 0 0 2px var(--bad)}
.item textarea{grid-column:1/-1;width:100%;min-height:38px;padding:6px 8px;border:1px solid var(--strong);border-radius:6px;background:var(--bg);color:var(--ink);font:inherit;font-size:.92rem;resize:vertical}
.letter{padding:12px;background:var(--paper2);border-radius:10px}
.letter h3{margin:0 0 8px;font:600 1.25rem/1.2 Georgia,serif}.letter h3 span{font:400 .9rem system-ui,sans-serif;color:var(--muted)}
.letter .list{gap:6px}.letter .item{background:var(--paper)}
.pick{display:inline-flex;gap:4px;align-items:center;font-size:.9rem}
.tag{display:inline-block;margin-left:6px;padding:0 6px;border-radius:4px;background:var(--good-bg);color:var(--good);font-size:.75rem;vertical-align:middle}
.missing{color:var(--bad);font-size:.85rem}
footer.out{margin-top:36px;padding:14px;background:var(--paper);border-radius:10px}
footer.out textarea{width:100%;min-height:200px;margin-top:10px;padding:8px;border:1px solid var(--strong);border-radius:6px;background:var(--bg);color:var(--ink);font:13px/1.45 ui-monospace,Menlo,Consolas,monospace}
@media (max-width:640px){.item{grid-template-columns:minmax(0,1fr)}.play,.judge{justify-content:flex-start}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<main>
  <h1>Almanca Alfabe: ses kontrolü</h1>
  <p class="note">Bu sayfa çevrimdışı çalışır: bütün sesler dosyanın içinde. Her klibi dinle, <b>İyi</b> ya da <b>Kötü</b> işaretle, gerekirse not yaz. Harf adlarında oyunda kalmasını istediğin yazımı <b>Seçtiğim</b> ile işaretle. En altta <b>Sonuçları kopyala</b>. İşaretlerin bu tarayıcıda saklanır (sayfayı kapatıp açınca durur).</p>
  <div class="bar" role="toolbar" aria-label="Oynatma">
    <label><input type="checkbox" id="slow"> Yavaş (0,75)</label>
    <button type="button" id="stop">Durdur</button>
    <span class="count" id="count" role="status"></span>
    <a href="#sonuc">Sonuçlara git ↓</a>
  </div>
  <div id="groups"></div>
  <footer class="out" id="sonuc">
    <h2 style="margin-top:0">Sonuçlar</h2>
    <p class="note">Düğmeye bas, sonra metni sohbete yapıştır. Kopyalama çalışmazsa kutudaki metni seçip elle kopyala.</p>
    <button type="button" class="primary" id="copy">Sonuçları kopyala</button>
    <button type="button" id="reset">Bütün işaretleri sil</button>
    <span class="count" id="copied" role="status"></span>
    <textarea id="out" readonly aria-label="Sonuç metni"></textarea>
  </footer>
</main>
<script type="application/json" id="data">${json({ version: hash, ...review })}</script>
<script>
(() => {
  'use strict';
  const D = JSON.parse(document.getElementById('data').textContent);
  const KEY = 'baAlfabeSesKontrol:' + D.version;
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { state = {}; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  const st = (id) => (state[id] = state[id] || {});
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'text') n.textContent = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else if (v !== false && v != null) n.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  };

  // One sound at a time.
  let audio = null, playingRow = null, seq = 0;
  const slow = () => document.getElementById('slow').checked;
  function stop() { seq++; if (audio) { audio.pause(); audio = null; } if (playingRow) playingRow.classList.remove('is-playing'); playingRow = null; }
  // Plays one clip without touching seq (a running sequence goes on); play() starts something new.
  function playOne(b64, row) {
    if (audio) { audio.pause(); audio = null; }
    return new Promise((resolve) => {
      if (!b64) return resolve();
      audio = new Audio('data:audio/mpeg;base64,' + b64);
      audio.playbackRate = slow() ? 0.75 : 1; audio.preservesPitch = true;
      if (row) { playingRow = row; row.classList.add('is-playing'); }
      audio.onended = () => { if (row) row.classList.remove('is-playing'); resolve(); };
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
  }
  function play(b64, row) { stop(); return playOne(b64, row); }
  // Spelling as in the game: letter clips one after another, 380 ms apart (600 ms when slow). "Durdur" ends it.
  async function playSeq(ids, row) {
    stop(); const my = seq;
    for (const id of ids) {
      if (my !== seq) return;
      const it = byId[id];
      await playOne(it && it.audio, row);
      if (my !== seq) return;
      await new Promise((r) => setTimeout(r, slow() ? 600 : 380));
    }
    if (row) row.classList.remove('is-playing');
  }
  document.getElementById('stop').addEventListener('click', stop);

  const byId = {};
  const all = [];
  function judgeRow(it, extra) {
    all.push(it);
    byId[it.id] = it;
    const s = st(it.id);
    const row = el('div', { class: 'item' });
    const mark = () => { row.classList.toggle('is-good', s.v === 'iyi'); row.classList.toggle('is-bad', s.v === 'kotu'); good.setAttribute('aria-pressed', String(s.v === 'iyi')); bad.setAttribute('aria-pressed', String(s.v === 'kotu')); counts(); };
    const set = (v) => { s.v = s.v === v ? undefined : v; save(); mark(); };
    const good = el('button', { type: 'button', class: 'g', 'aria-pressed': 'false', text: '👍 İyi', onclick: () => set('iyi') });
    const bad = el('button', { type: 'button', class: 'b', 'aria-pressed': 'false', text: '👎 Kötü', onclick: () => set('kotu') });
    const txt = el('div', { class: 'txt' },
      el('b', { lang: it.lang || 'de', text: it.label || it.text }),
      it.say && it.say.replace(/[.]$/, '') !== (it.label || it.text) ? el('small', { text: 'okunan metin: ' + it.say + (it.phonemes ? '  /' + it.phonemes + '/' : '') }) : (it.phonemes ? el('small', { text: '/' + it.phonemes + '/' }) : null),
      el('small', { text: it.file }),
      it.heard != null ? el('small', { text: 'makine kulağı: “' + it.heard + '” (' + it.score + ')' }) : null,
      it.audio || it.onplay ? null : el('span', { class: 'missing', text: 'Ses dosyası yok' }));
    const playBox = el('div', { class: 'play' },
      el('button', { type: 'button', 'aria-label': 'Dinle: ' + (it.label || it.text), text: '▶', onclick: () => (it.onplay ? it.onplay(row) : play(it.audio, row)), disabled: !it.audio && !it.onplay }),
      extra || null);
    const note = el('textarea', { 'aria-label': 'Not: ' + (it.label || it.text), placeholder: 'Not (isteğe bağlı): ne yanlış, nasıl olmalı?' });
    note.value = s.n || '';
    note.addEventListener('input', () => { s.n = note.value; save(); counts(); });
    row.append(playBox, txt, el('div', { class: 'judge' }, good, bad), note);
    mark();
    return row;
  }

  const groupsBox = document.getElementById('groups');
  for (const g of D.groups) {
    const sec = el('section', { 'aria-labelledby': 'g-' + g.id }, el('h2', { id: 'g-' + g.id, text: g.title + ' (' + (g.items.length + g.items.reduce((n, i) => n + (i.options ? i.options.length : 0), 0)) + ')' }), el('p', { class: 'note', text: g.note }));
    const list = el('div', { class: 'list' });
    if (g.id === 'harf') {
      for (const it of g.items) {
        const box = el('div', { class: 'letter' }, el('h3', { text: it.text + ' ' }, el('span', { text: 'hedef okunuş /' + (it.ipa || '') + '/' })));
        const inner = el('div', { class: 'list' });
        const name = 'pick-' + it.id;
        const pick = (id, label) => {
          const r = el('input', { type: 'radio', name, value: id, onchange: () => { st(it.id).pick = id; save(); counts(); } });
          if (st(it.id).pick === id) r.checked = true;
          return el('label', { class: 'pick' }, r, label);
        };
        inner.append(judgeRow({ ...it, label: 'Oyundaki: ' + it.say }, pick('oyun', 'Seçtiğim')));
        it.options.forEach((o, k) => inner.append(judgeRow({ ...o, text: it.text, label: 'Alternatif ' + (k + 1) + ': ' + o.say + (o.chosen ? ' (oyundakiyle aynı yazım)' : ''), letter: it.text }, pick(o.id, 'Seçtiğim'))));
        box.append(inner);
        list.append(box);
      }
    } else {
      for (const it of g.items) list.append(judgeRow({ ...it, lang: g.id === 'tr' && it.id !== 'richtig' ? 'tr' : 'de' }));
      if (g.id === 'heceleme') {
        for (const sq of D.sequences) {
          list.append(judgeRow({ id: 'dizi-' + sq.answer, file: 'harf klipleri sırayla: ' + sq.clips.join(', '), text: 'Heceleme dizisi: ' + sq.answer,
            label: 'Heceleme dizisi: ' + sq.answer, say: '', audio: null, onplay: (row) => playSeq(sq.clips, row) }));
        }
      }
    }
    sec.append(list);
    groupsBox.append(sec);
  }

  function counts() {
    const marked = all.filter((it) => state[it.id] && state[it.id].v).length;
    const bad = all.filter((it) => state[it.id] && state[it.id].v === 'kotu').length;
    document.getElementById('count').textContent = marked + ' / ' + all.length + ' işaretli · kötü: ' + bad;
    document.getElementById('out').value = report();
  }
  function report() {
    const lines = ['Almanca Alfabe ses kontrolü (tools/audio-check-offline.html, sürüm ' + D.version + ')', ''];
    const line = (it, s) => '- ' + it.file + ' · “' + (it.label || it.text) + '”' + (s && s.n ? ' · not: ' + s.n.trim() : '');
    const bad = all.filter((it) => state[it.id] && state[it.id].v === 'kotu');
    lines.push('KÖTÜ (' + bad.length + '):', ...(bad.length ? bad.map((it) => line(it, state[it.id])) : ['- yok']), '');
    const letters = D.groups.find((g) => g.id === 'harf').items;
    const picks = letters.filter((it) => state[it.id] && state[it.id].pick);
    lines.push('HARF SEÇİMLERİ (' + picks.length + '):');
    for (const it of picks) {
      const p = state[it.id].pick;
      if (p === 'oyun') lines.push('- ' + it.text + ': oyundaki kalsın (' + it.say + ')');
      else { const o = it.options.find((x) => x.id === p); lines.push('- ' + it.text + ': ' + (o ? o.say + ' (' + o.file + ')' + (o.chosen ? ' = oyundakiyle aynı yazım' : ' ← DEĞİŞTİR') : p)); }
    }
    if (!picks.length) lines.push('- yok');
    lines.push('');
    const notes = all.filter((it) => state[it.id] && state[it.id].n && state[it.id].n.trim() && state[it.id].v !== 'kotu');
    lines.push('NOTLAR (kötü dışındakiler, ' + notes.length + '):', ...(notes.length ? notes.map((it) => line(it, state[it.id]) + (state[it.id].v === 'iyi' ? ' [iyi]' : '')) : ['- yok']), '');
    const good = all.filter((it) => state[it.id] && state[it.id].v === 'iyi').length;
    lines.push('Özet: ' + all.length + ' klip · iyi ' + good + ' · kötü ' + bad.length + ' · işaretlenmemiş ' + (all.length - good - bad.length));
    return lines.join('\\n');
  }
  document.getElementById('copy').addEventListener('click', async () => {
    const text = report(), box = document.getElementById('out'), msg = document.getElementById('copied');
    box.value = text;
    // Some browsers keep the clipboard request waiting for a page opened from disk: give up after 1.5 s and use the
    // older way (select the text and copy), which also works offline.
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await Promise.race([navigator.clipboard.writeText(text), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 1500))]);
      msg.textContent = 'Kopyalandı.';
    } catch (_) {
      box.focus(); box.select();
      try { msg.textContent = document.execCommand('copy') ? 'Kopyalandı.' : 'Metni seçip elle kopyala (Ctrl+C).'; } catch (e) { msg.textContent = 'Metni seçip elle kopyala (Ctrl+C).'; }
    }
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (!confirm('Bütün İyi/Kötü işaretleri, seçimler ve notlar silinsin mi?')) return;
    state = {}; save(); location.reload();
  });
  counts();
})();
</script>
</body>
</html>
`;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const file = path.join(REPO, OFFLINE_FILE);
  const html = pageText();
  if (process.argv.includes('--check')) {
    const ok = fs.existsSync(file) && fs.readFileSync(file, 'utf8') === html;
    console.log(ok ? `PASS: ${OFFLINE_FILE} güncel.` : `Güncel değil: ${OFFLINE_FILE}\nnode scripts/build-audio-check-offline.mjs çalıştır ve sonucu commit et.`);
    process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(file, html);
  console.log(`Yazıldı: ${OFFLINE_FILE} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`);
}
