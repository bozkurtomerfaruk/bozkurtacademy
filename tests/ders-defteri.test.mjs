// Ders defteri: otomatik kayıt zamanlayıcısı ve içerik temizleme (tarayıcısız). node --test tests/ders-defteri.test.mjs
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createAutosave } from '../js/account/autosave.js';
import { cleanTitle, defaultTitle, isEmptyContent, MAX_BYTES, noteBytes, paletteColor, parseContent, safeUrl, sanitizeOps, sizeLevel } from '../js/account/note-format.js';

// Sahte saat: setTimer/clearTimer/now tek bir zaman çizelgesinde.
function clock(){
  let t = 0, seq = 0;
  const timers = new Map();
  return {
    now: () => t,
    setTimer: (fn, ms) => { const id = ++seq; timers.set(id, { at: t + ms, fn }); return id; },
    clearTimer: (id) => timers.delete(id),
    async advance(ms){
      const end = t + ms;
      for(;;){
        const next = [...timers.entries()].filter(([, v]) => v.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if(!next) break;
        timers.delete(next[0]);
        t = next[1].at;
        next[1].fn();
        for(let i = 0; i < 5; i++) await Promise.resolve();
      }
      t = end;
      for(let i = 0; i < 5; i++) await Promise.resolve();
    }
  };
}

function setup(saveImpl){
  const c = clock();
  const saves = [];
  const states = [];
  const a = createAutosave({
    save: async () => { saves.push(c.now()); if(saveImpl) await saveImpl(saves.length); },
    onState: (s) => states.push(s), now: c.now, setTimer: c.setTimer, clearTimer: c.clearTimer
  });
  return { c, a, saves, states };
}

describe('Otomatik kayıt', () => {
  test('yazmayı bırakınca 1,5 sn sonra bir kez kaydeder', async () => {
    const { c, a, saves, states } = setup();
    a.change(); await c.advance(300); a.change(); await c.advance(300); a.change();
    await c.advance(1400);
    assert.equal(saves.length, 0);
    await c.advance(200);
    assert.deepEqual(saves, [2100]);
    assert.equal(a.state, 'saved');
    assert.ok(states.includes('saving'));
    await c.advance(20000);
    assert.equal(saves.length, 1, 'değişiklik yoksa tekrar kaydetmez');
  });

  test('durmadan yazarken en geç 10 sn\'de bir kaydeder', async () => {
    const { c, a, saves } = setup();
    for(let i = 0; i < 300; i++){ a.change(); await c.advance(100); } // 30 sn boyunca her 100 ms'de bir tuş
    assert.deepEqual(saves, [10000, 20000, 30000]);
  });

  test('iki kayıt arasında en az 2 sn: bir saatte en çok 1.800 yazma', async () => {
    const { c, a, saves } = setup();
    // En kötü durum: her 1,6 sn'de bir tuş (her seferinde debounce dolmak üzere).
    for(let t = 0; t < 3600_000; t += 1600){ a.change(); await c.advance(1600); }
    await c.advance(5000);
    for(let i = 1; i < saves.length; i++) assert.ok(saves[i] - saves[i - 1] >= 2000, `aralık ${saves[i] - saves[i - 1]} ms`);
    assert.ok(saves.length <= 1800, `${saves.length} kayıt`);
  });

  test('kayıt sürerken gelen değişiklik kayıt bitince ayrıca kaydedilir', async () => {
    let release;
    const { c, a, saves } = setup((n) => n === 1 ? new Promise((r) => { release = r; }) : null);
    a.change(); await c.advance(1500);
    assert.equal(saves.length, 1);
    a.change(); await c.advance(5000);
    assert.equal(saves.length, 1, 'aynı anda tek kayıt');
    assert.equal(a.state, 'saving');
    release(); await c.advance(0);
    assert.equal(a.state, 'dirty');
    await c.advance(2000);
    assert.equal(saves.length, 2);
    assert.equal(a.state, 'saved');
    assert.equal(a.pending, false);
  });

  test('bağlantı yokken (kayıt bekliyor) değişiklik kaybolmaz; bağlantı gelince son hâl kaydedilir', async () => {
    let release;
    const content = { v: 0 }, saved = [];
    const c = clock();
    const a = createAutosave({
      save: async () => { const v = content.v; if(!release) await new Promise((r) => { release = r; }); saved.push(v); },
      now: c.now, setTimer: c.setTimer, clearTimer: c.clearTimer
    });
    content.v = 1; a.change(); await c.advance(1500);
    for(let i = 2; i <= 50; i++){ content.v = i; a.change(); await c.advance(1000); }
    assert.equal(a.pending, true);
    release(); await c.advance(0);
    await c.advance(3000);
    assert.deepEqual(saved, [1, 50]);
    assert.equal(a.pending, false);
  });

  test('hata olunca artan aralıklarla yeniden dener; retryNow hemen dener', async () => {
    let fail = 3;
    const { c, a, saves } = setup(async () => { if(fail-- > 0) throw Object.assign(new Error('unavailable'), { code: 'unavailable' }); });
    a.change(); await c.advance(1500);
    assert.equal(saves.length, 1);
    assert.equal(a.state, 'error');
    await c.advance(3000); assert.equal(saves.length, 2);
    await c.advance(1000); a.retryNow(); await c.advance(0); assert.equal(saves.length, 3);
    await c.advance(6000); assert.equal(saves.length, 4);
    assert.equal(a.state, 'saved');
  });

  test('retry === false (not çok büyük): yeni değişikliğe kadar denemez', async () => {
    let big = true;
    const { c, a, saves } = setup(async () => { if(big) throw Object.assign(new Error('too-large'), { retry: false }); });
    a.change(); await c.advance(1500);
    await c.advance(60000);
    assert.equal(saves.length, 1);
    big = false; a.change(); await c.advance(1500);
    assert.equal(saves.length, 2);
    assert.equal(a.state, 'saved');
  });

  test('flush beklemeden hemen kaydeder (sayfadan çıkarken)', async () => {
    const { c, a, saves } = setup();
    a.change(); await c.advance(200);
    a.flush(); await c.advance(0);
    assert.deepEqual(saves, [200]);
    a.change(); await c.advance(100); a.flush(); await c.advance(0);
    assert.deepEqual(saves, [200, 300], 'flush 2 sn aralığını da beklemez');
  });

  test('stop sonrası kaydetmez', async () => {
    const { c, a, saves } = setup();
    a.change(); a.stop(); await c.advance(20000);
    assert.equal(saves.length, 0);
  });
});

describe('İçerik temizleme', () => {
  test('izinli biçimler kalır', () => {
    const ops = [
      { insert: 'Kalın', attributes: { bold: true, italic: true, underline: true, strike: true, color: 'kirmizi', background: 'sari' } },
      { insert: '\n', attributes: { header: 2 } },
      { insert: 'Madde' }, { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
      { insert: 'Hücre' }, { insert: '\n', attributes: { table: 'row-ab12' } },
      { insert: 'Link', attributes: { link: 'https://example.com/a?b=1' } }, { insert: '\n' }
    ];
    assert.deepEqual(sanitizeOps(ops), ops);
  });

  test('tehlikeli ve bilinmeyen içerik atılır', () => {
    const out = sanitizeOps([
      { insert: { image: 'javascript:alert(1)' } },
      { insert: { video: 'https://evil.example' } },
      { insert: '<img src=x onerror=alert(1)>', attributes: { link: 'javascript:alert(1)', color: 'red; background:url(x)', background: '#f00', script: 'sub', font: 'x', onerror: 'alert(1)', __proto__: { bold: true } } },
      { insert: 'a', attributes: { link: 'data:text/html,<script>alert(1)</script>' } },
      { insert: 'b', attributes: { link: 'JaVaScRiPt:alert(1)' } },
      { insert: 'c', attributes: { link: ' https://user:pw@example.com' } },
      { insert: 'd', attributes: { link: 'https://ex ample.com' } },
      { insert: 'e', attributes: { link: 'https://example.com/"onmouseover="x' } },
      { insert: '\n', attributes: { header: 1, align: 'center', 'code-block': true, list: 'checked', table: 'row-"><script>' } },
      { retain: 5 }, { delete: 2 }, null, 'metin', 42
    ]);
    assert.deepEqual(out, [{ insert: '<img src=x onerror=alert(1)>abcde' }, { insert: '\n', attributes: { header: 2 } }]);
    for(const op of out) for(const k of Object.keys(op.attributes || {})) assert.ok(['header'].includes(k));
  });

  test('bağlantı: yalnızca http ve https', () => {
    assert.equal(safeUrl('http://example.com'), 'http://example.com');
    assert.equal(safeUrl('https://www.youtube.com/watch?v=x'), 'https://www.youtube.com/watch?v=x');
    for(const bad of ['javascript:alert(1)', 'mailto:a@b.c', 'ftp://x.y', '//example.com', 'example.com', 'https://', 'https://a b', 'vbscript:x', 'data:,x', 'https://x.y/\u0000', 'x'.repeat(10)]) assert.equal(safeUrl(bad), null, bad);
    assert.equal(safeUrl('https://example.com/' + 'a'.repeat(2100)), null);
  });

  test('yapıştırılan tablo satır numaraları ve başlık seviyeleri düzeltilir', () => {
    assert.deepEqual(sanitizeOps([{ insert: 'x' }, { insert: '\n', attributes: { table: 1, header: 2 } }, { insert: 'y' }, { insert: '\n', attributes: { table: '2' } }, { insert: 'z' }, { insert: '\n', attributes: { header: 5 } }]),
      [{ insert: 'x' }, { insert: '\n', attributes: { table: 'row-p1' } }, { insert: 'y' }, { insert: '\n', attributes: { table: 'row-p2' } }, { insert: 'z' }, { insert: '\n', attributes: { header: 3 } }]);
  });

  test('bozuk içerik boş not olarak açılır; sonuç her zaman satır sonuyla biter', () => {
    assert.deepEqual(parseContent('{bozuk'), [{ insert: '\n' }]);
    assert.deepEqual(parseContent(''), [{ insert: '\n' }]);
    assert.deepEqual(parseContent('{"ops":[{"insert":"Hallo"}]}'), [{ insert: 'Hallo\n' }]);
    assert.ok(isEmptyContent([{ insert: '\n\n' }]));
    assert.ok(!isEmptyContent([{ insert: 'a\n' }]));
  });

  test('karışık parça (yapıştırılan tablo satırı) metin ve satır sonu olarak ayrılır', () => {
    assert.deepEqual(sanitizeOps([{ insert: 'Akkusativ\nden\n', attributes: { table: 3, bold: true } }]),
      [{ insert: 'Akkusativ', attributes: { bold: true } }, { insert: '\n', attributes: { table: 'row-p3' } }, { insert: 'den', attributes: { bold: true } }, { insert: '\n', attributes: { table: 'row-p3' } }]);
  });

  test('yapıştırılan renkler paletteki en yakın renge çevrilir', () => {
    const c = (v) => paletteColor(v, 'color'), b = (v) => paletteColor(v, 'background');
    assert.equal(c('#ff0000'), 'kirmizi');
    assert.equal(c('rgb(230, 145, 56)'), 'turuncu');
    assert.equal(c('#38761d'), 'yesil');
    assert.equal(c('#1155cc'), 'mavi');
    assert.equal(c('#9900ff'), 'mor');
    assert.equal(c('#666666'), 'gri');
    assert.equal(c('#000000'), null);
    assert.equal(c('#fff'), null);
    assert.equal(c('kirmizi'), 'kirmizi');
    assert.equal(c('red'), null);
    assert.equal(c('url(javascript:alert(1))'), null);
    assert.equal(b('#ffff00'), 'sari');
    assert.equal(b('#b6d7a8'), 'yesil');
    assert.equal(b('#cfe2f3'), 'mavi');
    assert.equal(b('#ead1dc'), 'pembe');
    assert.equal(b('transparent'), null);
    assert.equal(b('rgba(255, 255, 0, 0.1)'), null);
    assert.equal(b('#cccccc'), null);
  });

  test('başlık ve boyut', () => {
    assert.equal(defaultTitle('2026-11-23'), '23.11.2026 – Ders');
    assert.equal(cleanTitle('  ', '2026-11-23'), '23.11.2026 – Ders');
    assert.equal(cleanTitle('A\nB\u0000C', '2026-11-23'), 'A B C');
    assert.equal(cleanTitle('x'.repeat(300), '2026-11-23').length, 120);
    assert.equal(noteBytes('ü', 'ğ'), 404);
    assert.equal(sizeLevel(100_000), 'ok');
    assert.equal(sizeLevel(700_000), 'warn');
    assert.equal(sizeLevel(900_000), 'danger');
    assert.equal(sizeLevel(MAX_BYTES + 1), 'over');
  });
});
