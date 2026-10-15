// apps-script/Code.gs birim testleri. Google servisleri (Calendar, MailApp, PropertiesService, Utilities,
// ScriptApp, Logger) sahte nesnelerle verilir; saat sabitlenir. Çalıştırma: npm test (ya da node --test bu dosya).
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

const source = readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8');

// Java SimpleDateFormat kalıplarının sadece betikte kullanılanları.
function formatDate(date, timeZone, pattern){
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', weekday: 'short'
  }).formatToParts(date).map((x) => [x.type, x.value]));
  const pad = (v) => String(v).padStart(2, '0');
  const dow = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[p.weekday];
  return pattern
    .replace('yyyy', p.year).replace('MM', pad(p.month)).replace('dd', pad(p.day))
    .replace('HH', pad(p.hour)).replace('mm', pad(p.minute))
    .replace(/\bd\b/, String(Number(p.day))).replace(/\bM\b/, String(Number(p.month))).replace(/\bu\b/, String(dow));
}

function load({ now, events = [], props = {} }){
  const NOW = new Date(now).getTime();
  class FixedDate extends Date {
    constructor(...args){ args.length ? super(...args) : super(NOW); }
    static now(){ return NOW; }
  }
  const sent = [];
  const logs = [];
  const queries = [];
  const store = { ...props };
  const triggers = { list: [{ getHandlerFunction: () => 'sendReminders', id: 'old' }, { getHandlerFunction: () => 'other', id: 'keep' }], deleted: [], created: [] };
  const context = {
    Date: FixedDate,
    Math, JSON, String, Number, Object, Array, RegExp, Boolean,
    Logger: { log: (m) => logs.push(String(m)) },
    MailApp: { sendEmail: (m) => sent.push(m) },
    Calendar: { Events: { list: (cal, q) => { queries.push({ cal, q }); return { items: events }; } } },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperties: () => ({ ...store }),
        setProperty: (k, v) => { store[k] = v; },
        deleteProperty: (k) => { delete store[k]; }
      })
    },
    Utilities: {
      formatDate,
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      // Apps Script işaretli bayt (-128..127) dizisi döndürür.
      computeDigest: (alg, value) => [...createHash('sha256').update(value, 'utf8').digest()].map((b) => (b > 127 ? b - 256 : b))
    },
    ScriptApp: {
      getProjectTriggers: () => triggers.list,
      deleteTrigger: (t) => triggers.deleted.push(t.id),
      newTrigger: (fn) => {
        const spec = { fn };
        const chain = {
          timeBased: () => chain,
          everyDays: (n) => { spec.everyDays = n; return chain; },
          atHour: (hour) => { spec.atHour = hour; return chain; },
          inTimezone: (tz) => { spec.tz = tz; return chain; },
          create: () => { triggers.created.push(spec); return spec; }
        };
        return chain;
      }
    }
  };
  vm.createContext(context);
  vm.runInContext(source, context);
  return { ctx: context, sent, logs, queries, store, triggers };
}

// Siteden oluşturulmuş bir ders etkinliği (js/account/calendar.js lessonEvent ile aynı biçim).
function lessonEvent(overrides = {}){
  return {
    id: 'ev1_20261016T160000Z',
    status: 'confirmed',
    summary: 'Almanca dersi – Can Demir',
    description: 'Perfekt tekrarı\n\nbozkurtacademy.com üzerinden oluşturuldu.',
    start: { dateTime: '2026-10-16T18:00:00+02:00', timeZone: 'Europe/Berlin' },
    end: { dateTime: '2026-10-16T18:50:00+02:00', timeZone: 'Europe/Berlin' },
    hangoutLink: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { email: 'ogretmen@gmail.com', organizer: true, self: true, responseStatus: 'accepted' },
      { email: 'can@example.com', responseStatus: 'needsAction' },
      { email: 'elif@example.com', responseStatus: 'accepted' }
    ],
    extendedProperties: { private: { source: 'bozkurtacademy', lessonId: 'l1', studentEmail: 'can@example.com' } },
    ...overrides
  };
}

const NOW = '2026-10-15T16:30:00Z'; // 18:30 Berlin

describe('Yarının zaman aralığı (Berlin)', () => {
  test('normal gün', () => {
    const { ctx } = load({ now: NOW });
    const w = ctx.tomorrowWindow_(new ctx.Date());
    assert.equal(w.key, '2026-10-16');
    assert.equal(w.timeMin.toISOString(), '2026-10-15T22:00:00.000Z');
    assert.equal(w.timeMax.toISOString(), '2026-10-16T22:00:00.000Z');
  });

  test('yaz saatinden kış saatine geçilen gün (25 saat)', () => {
    const { ctx } = load({ now: '2026-10-24T16:30:00Z' });
    const w = ctx.tomorrowWindow_(new ctx.Date());
    assert.equal(w.timeMin.toISOString(), '2026-10-24T22:00:00.000Z');
    assert.equal(w.timeMax.toISOString(), '2026-10-25T23:00:00.000Z');
  });

  test('kış saatinden yaz saatine geçilen gün (23 saat)', () => {
    const { ctx } = load({ now: '2026-03-28T17:30:00Z' });
    const w = ctx.tomorrowWindow_(new ctx.Date());
    assert.equal(w.timeMin.toISOString(), '2026-03-28T23:00:00.000Z');
    assert.equal(w.timeMax.toISOString(), '2026-03-29T22:00:00.000Z');
  });
});

describe('Hatırlatma gönderimi', () => {
  test('sadece siteden oluşturulmuş dersler istenir, yarının aralığında', () => {
    const { ctx, queries } = load({ now: NOW });
    ctx.sendReminders();
    assert.equal(queries.length, 1);
    const q = queries[0].q;
    assert.equal(queries[0].cal, 'primary');
    assert.equal(q.privateExtendedProperty, 'source=bozkurtacademy');
    assert.equal(q.singleEvents, true);
    assert.equal(q.showDeleted, false);
    assert.equal(q.timeMin, '2026-10-15T22:00:00.000Z');
    assert.equal(q.timeMax, '2026-10-16T22:00:00.000Z');
  });

  test('öğrenciye ve veliye Türkçe e-posta gider, öğretmene gitmez', () => {
    const { ctx, sent } = load({ now: NOW, events: [lessonEvent()] });
    const summary = ctx.sendReminders();
    assert.equal(summary.sent, 2);
    assert.deepEqual(sent.map((m) => m.to), ['can@example.com', 'elif@example.com']);
    for(const m of sent){
      assert.equal(m.subject, 'Yarınki Almanca dersin – 18:00');
      assert.equal(m.name, 'Bozkurt Academy');
      assert.match(m.body, /Tarih: 16 Ekim 2026, Cuma/);
      assert.match(m.body, /Saat: 18:00–18:50 \(Almanya saati\)/);
      assert.match(m.body, /Süre: 50 dakika/);
      assert.match(m.body, /Görüşmeye katıl: https:\/\/meet\.google\.com\/abc-defg-hij/);
      assert.match(m.body, /Ders notu: Perfekt tekrarı/);
      assert.doesNotMatch(m.body, /üzerinden oluşturuldu/);
      assert.match(m.htmlBody, /href="https:\/\/meet\.google\.com\/abc-defg-hij"/);
    }
    assert.match(sent[0].body, /^Merhaba Can Demir,/);
    assert.match(sent[0].body, /Yarın Almanca dersin var\./);
    assert.match(sent[1].body, /^Merhaba,/);
    assert.match(sent[1].body, /Öğrenciniz Can Demir için yarın bir Almanca dersi var\./);
  });

  test('ders notu yoksa not satırı olmaz', () => {
    const { ctx, sent } = load({ now: NOW, events: [lessonEvent({ description: 'bozkurtacademy.com üzerinden oluşturuldu.' })] });
    ctx.sendReminders();
    assert.doesNotMatch(sent[0].body, /Ders notu/);
  });

  test('iptal edilmiş derse gönderilmez', () => {
    const { ctx, sent } = load({ now: NOW, events: [lessonEvent({ status: 'cancelled' })] });
    ctx.sendReminders();
    assert.equal(sent.length, 0);
  });

  test('daveti reddeden kişiye gönderilmez', () => {
    const event = lessonEvent();
    event.attendees[2].responseStatus = 'declined';
    const { ctx, sent } = load({ now: NOW, events: [event] });
    ctx.sendReminders();
    assert.deepEqual(sent.map((m) => m.to), ['can@example.com']);
  });

  test('siteden oluşturulmamış (kişisel) etkinliğe dokunulmaz', () => {
    const personal = lessonEvent({ id: 'personal', extendedProperties: undefined, summary: 'Diş hekimi' });
    const other = lessonEvent({ id: 'other', extendedProperties: { private: { source: 'baska' } } });
    const { ctx, sent } = load({ now: NOW, events: [personal, other] });
    ctx.sendReminders();
    assert.equal(sent.length, 0);
  });

  test('aynı ders için aynı kişiye ikinci kez gönderilmez', () => {
    const first = load({ now: NOW, events: [lessonEvent()] });
    first.ctx.sendReminders();
    assert.equal(first.sent.length, 2);
    const second = load({ now: NOW, events: [lessonEvent()], props: first.store });
    const summary = second.ctx.sendReminders();
    assert.equal(second.sent.length, 0);
    assert.equal(summary.skipped, 2);
  });

  test('gönderim kayıtlarında e-posta adresi düz metin olarak tutulmaz', () => {
    const { ctx, store } = load({ now: NOW, events: [lessonEvent()] });
    ctx.sendReminders();
    const keys = Object.keys(store);
    assert.equal(keys.length, 2);
    for(const key of keys){
      assert.match(key, /^sent:[0-9a-f]{64}$/);
      assert.doesNotMatch(key, /@|example/);
    }
  });

  test('ders başka bir saate taşınırsa yeni saat için yeniden gönderilir', () => {
    const first = load({ now: NOW, events: [lessonEvent()] });
    first.ctx.sendReminders();
    const moved = lessonEvent({ start: { dateTime: '2026-10-16T19:00:00+02:00' }, end: { dateTime: '2026-10-16T19:50:00+02:00' } });
    const second = load({ now: NOW, events: [moved], props: first.store });
    second.ctx.sendReminders();
    assert.equal(second.sent.length, 2);
    assert.equal(second.sent[0].subject, 'Yarınki Almanca dersin – 19:00');
  });

  test('deneme çalıştırması e-posta göndermez ve kayıt bırakmaz', () => {
    const { ctx, sent, store, logs } = load({ now: NOW, events: [lessonEvent()] });
    const summary = ctx.dryRun();
    assert.equal(sent.length, 0);
    assert.deepEqual(store, {});
    assert.equal(summary.sent, 2);
    assert.ok(logs.some((l) => l.includes('[deneme] veli <elif@example.com>')));
  });

  test('14 günden eski gönderim kayıtları silinir, yenileri kalır', () => {
    const old = String(new Date(NOW).getTime() - 15 * 864e5);
    const recent = String(new Date(NOW).getTime() - 2 * 864e5);
    const { ctx, store } = load({ now: NOW, props: { 'sent:old': old, 'sent:recent': recent, 'baska': old } });
    ctx.sendReminders();
    assert.equal(store['sent:old'], undefined);
    assert.equal(store['sent:recent'], recent);
    assert.equal(store['baska'], old);
  });

  test('ad ve notlardaki HTML etkisizleştirilir', () => {
    const event = lessonEvent({ summary: 'Almanca dersi – <b>Can</b>', description: 'Not <script>alert(1)</script>\n\nbozkurtacademy.com üzerinden oluşturuldu.' });
    const { ctx, sent } = load({ now: NOW, events: [event] });
    ctx.sendReminders();
    assert.doesNotMatch(sent[0].htmlBody, /<script>|<b>Can/);
    assert.match(sent[0].htmlBody, /&lt;b&gt;Can&lt;\/b&gt;/);
  });

  test('Meet linki conferenceData içindeyse de bulunur', () => {
    const event = lessonEvent({ hangoutLink: undefined, conferenceData: { entryPoints: [{ entryPointType: 'phone', uri: 'tel:+49' }, { entryPointType: 'video', uri: 'https://meet.google.com/xyz' }] } });
    const { ctx, sent } = load({ now: NOW, events: [event] });
    ctx.sendReminders();
    assert.match(sent[0].body, /https:\/\/meet\.google\.com\/xyz/);
  });
});

describe('Zamanlayıcı', () => {
  test('her gün 18:00 Berlin için kurulur, eski hatırlatma zamanlayıcısı silinir', () => {
    const { ctx, triggers } = load({ now: NOW });
    ctx.installTrigger();
    assert.deepEqual(triggers.deleted, ['old']);
    assert.deepEqual(triggers.created, [{ fn: 'sendReminders', everyDays: 1, atHour: 18, tz: 'Europe/Berlin' }]);
  });
});
