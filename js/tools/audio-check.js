// tools/audio-check.html: Almanca Alfabe ses kliplerini tek sayfada dinletir (yayına girmez).
(() => {
  'use strict';
  const L = window.baAlfabeLogic;
  const esc = (v) => window.baHtml.escapeHtml(v);
  // html-safe-names: rows
  let clips = [], manifest = { clips: {} };
  const player = window.baAlfabeAudio.create({ base: '/audio/alfabe/', slowRate: L.SLOW_PLAYBACK, slowTts: L.SLOW_RATE, onVoices: () => summary() });
  const KIND = { harf: 'Harf adı', kelime: 'Kelime', isaret: 'İşaret', soru: 'Senaryo sorusu', cevap: 'Senaryo cevabı', geri: 'Geri bildirim', talimat: 'Talimat' };
  const STATUS = { gen: 'Üretildi', own: 'Kendi kaydın', miss: 'Eksik (cihaz sesi)', stale: 'Metin değişti (oynatılmaz)' };
  const tbody = document.getElementById('acRows');
  const statusOf = (c) => { const e = manifest.clips[c.id]; return !e ? 'miss' : e.stale ? 'stale' : e.source === 'kendi' ? 'own' : 'gen'; };
  const visible = () => {
    const kind = document.getElementById('acKind').value, st = document.getElementById('acStatus').value;
    return clips.filter((c) => (!kind || c.kind === kind) && (!st || statusOf(c) === st));
  };
  const part = (c) => ({ clip: c.id, text: c.text, lang: c.lang });
  const slow = () => document.getElementById('acSlow').checked;
  function summary() {
    const box = document.getElementById('acSummary');
    if (!box) return;
    const total = Object.values(manifest.clips).reduce((n, e) => n + (e.bytes || 0), 0);
    const de = player.voice('de'), tr = player.voice('tr');
    box.textContent = `${clips.length} klip · dosyası olan ${clips.filter((c) => ['gen', 'own'].includes(statusOf(c))).length} · ${(total / 1024).toFixed(1)} KB · cihaz sesi: de ${de ? de.name : 'yok'}, tr ${tr ? tr.name : 'yok'}`;
  }
  function render() {
    const rows = visible().map((c, i) => {
      const st = statusOf(c), e = manifest.clips[c.id];
      return `<tr data-id="${esc(c.id)}"><td>${i + 1}</td><td><code>${esc(c.file)}</code></td><td>${esc(c.lang)}</td><td>${esc(KIND[c.kind] || c.kind)}</td>
        <td lang="${esc(c.lang)}">${esc(c.text)}</td><td>${c.ipa ? esc('/' + c.ipa + '/') : ''}</td><td class="st-${esc(st)}">${esc(STATUS[st])}</td>
        <td>${e ? esc((e.bytes / 1024).toFixed(1) + ' KB') : ''}</td>
        <td><button type="button" data-play="${esc(c.id)}" aria-label="${esc('Dinle: ' + c.text)}">▶</button> <button type="button" data-tts="${esc(c.id)}">Cihaz sesi</button></td></tr>`;
    }).join('');
    tbody.innerHTML = rows || '<tr><td colspan="9">Bu filtrede klip yok.</td></tr>';
    summary();
  }
  const mark = (id) => tbody.querySelectorAll('tr').forEach((tr) => tr.classList.toggle('is-playing', tr.dataset.id === id));
  tbody.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const c = clips.find((x) => x.id === (b.dataset.play || b.dataset.tts));
    if (!c) return;
    mark(c.id);
    player.play([b.dataset.tts ? { text: c.text, lang: c.lang } : part(c)], { slow: slow() }).then(() => mark(null));
  });
  document.getElementById('acAll').addEventListener('click', async () => {
    const list = visible();
    player.stop();
    for (const c of list) {
      mark(c.id);
      const finished = await player.play([part(c)], { slow: slow() });
      if (!finished) break; // Durdur ya da başka bir düğme
      await new Promise((r) => setTimeout(r, 300));
    }
    mark(null);
  });
  document.getElementById('acStop').addEventListener('click', () => { player.stop(); stopAlt(); mark(null); });

  // Letter-name alternatives (tools/audio-alternatifler/liste.json from --alternatifler): played straight from the file.
  let altAudio = null;
  function stopAlt() { if (altAudio) { altAudio.pause(); altAudio = null; } }
  function playAlt(file) {
    player.stop(); stopAlt();
    altAudio = new Audio('/tools/audio-alternatifler/' + file);
    altAudio.playbackRate = slow() ? L.SLOW_PLAYBACK : 1;
    altAudio.preservesPitch = true;
    altAudio.play().catch(() => {});
  }
  function renderAlts(list) {
    const rows = [...(list.harfler || []), ...(list.kelimeler || [])].map((h) => `<tr><th scope="row">${esc(h.text)}</th><td>${h.ipa ? esc('/' + h.ipa + '/') : ''}</td>
      <td><div class="ac-alts">${h.secenekler.map((o) => `<button type="button" class="ac-alt${o.secili ? ' is-chosen' : ''}" data-alt="${esc(o.file)}" aria-label="${esc('Dinle: ' + o.text + (o.secili ? ', seçili' : ''))}">
        <span>▶ ${esc(o.text)}${o.secili ? ' ✓ seçili' : ''}</span><small>${o.phonemes ? esc('/' + o.phonemes + '/') : ''}</small></button>`).join('')}</div></td></tr>`).join('');
    const box = document.getElementById('acAltRows');
    box.innerHTML = rows;
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-alt]'); if (b) playAlt(b.dataset.alt); });
    document.getElementById('acAltSection').hidden = !rows;
  }
  fetch('/tools/audio-alternatifler/liste.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((l) => { if (l) renderAlts(l); }).catch(() => {});
  ['acKind', 'acStatus'].forEach((id) => document.getElementById(id).addEventListener('change', render));

  Promise.all([
    fetch('/data/alfabe.json', { cache: 'no-cache' }).then((r) => r.json()),
    fetch('/audio/alfabe/manifest.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : { clips: {} })).catch(() => ({ clips: {} }))
  ]).then(([data, m]) => {
    clips = L.audioClips(data);
    manifest = m && m.clips ? m : { clips: {} };
    player.setManifest(manifest);
    const kinds = [...new Set(clips.map((c) => c.kind))];
    document.getElementById('acKind').insertAdjacentHTML('beforeend', kinds.map((k) => `<option value="${esc(k)}">${esc(KIND[k] || k)}</option>`).join(''));
    render();
  }).catch((error) => { tbody.innerHTML = `<tr><td colspan="9">${esc('Yüklenemedi: ' + error.message)}</td></tr>`; });
})();
