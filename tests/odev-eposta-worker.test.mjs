// worker/schreiben-kontrol.js → POST /odev-bildirim birim testleri (Firebase ve Brevo taklit edilir).
// Çalıştırma: node --test tests/odev-eposta-worker.test.mjs
import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { berlinDay, encode, formatDue, homeworkMail, mailRecipients, MAIL_MAX_ITEMS } from '../worker/schreiben-kontrol.js';

const DAY = berlinDay();
const TEACHER = 'ogretmen1234';
let docs, commits, mails, brevoFail, fetchLog, limitUpdateTime;
const env = { FIREBASE_API_KEY: 'key', FIREBASE_PROJECT_ID: 'demo', ALLOWED_ORIGINS: 'https://bozkurtacademy.com', SITE_URL: 'https://bozkurtacademy.com',
  TEACHER_UID: TEACHER, BREVO_API_KEY: 'brevo-anahtar', MAIL_DAILY_LIMIT: '100' };
const fields = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, encode(v)]));
const DUE = '2026-11-30T17:00:00Z'; // 18:00 Berlin

beforeEach(() => {
  commits = []; mails = []; brevoFail = new Set(); fetchLog = []; limitUpdateTime = '2026-11-23T08:00:00Z';
  docs = {
    'users/ayse1234567': { status: 'active', minor: false, name: 'Ayşe Yılmaz', email: 'ayse@example.com', lang: 'de' },
    'users/ayse1234567/assignments/odev1': { title: 'Perfekt <b>& Plural</b>', description: 'GİZLİ NOT', dueAt: DUE, links: [{ url: 'https://gizli.example/x' }], groupId: 'g1' },
    'users/can12345678': { status: 'active', minor: true, name: 'Can', email: 'can@example.com', parent: { name: 'Veli', email: 'veli@example.com' } },
    'users/can12345678/assignments/odev2': { title: '23.11.2026', dueAt: null, groupId: 'g1' },
    'users/kapali12345': { status: 'active', minor: false, email: 'kapali@example.com', homeworkMail: false },
    'users/kapali12345/assignments/odev3': { title: 'x', groupId: 'g1' },
    'users/bekleyen123': { status: 'pending', minor: false, email: 'bekleyen@example.com' },
    'users/bekleyen123/assignments/odev4': { title: 'x', groupId: 'g1' }
  };
  globalThis.fetch = async (url, init = {}) => {
    url = String(url); fetchLog.push({ url, init });
    if (url.includes('accounts:lookup')) {
      const token = JSON.parse(init.body).idToken;
      const uid = { 'ogretmen-token': TEACHER, 'ogrenci-token': 'ayse1234567' }[token];
      return uid ? Response.json({ users: [{ localId: uid }] }) : Response.json({}, { status: 400 });
    }
    if (url.endsWith('/v3/smtp/email')) {
      const body = JSON.parse(init.body);
      if (brevoFail.has(body.to[0].email)) return Response.json({ code: 'unauthorized' }, { status: 401 });
      mails.push({ headers: init.headers, ...body });
      return Response.json({ messageId: `<m${mails.length}@brevo>` }, { status: 201 });
    }
    if (url.endsWith(':commit')) {
      const body = JSON.parse(init.body);
      commits.push(body);
      for (const w of body.writes) {
        if (w.update?.name.endsWith('mailLimits/_global')) {
          const pre = w.currentDocument;
          if (pre.updateTime && pre.updateTime !== limitUpdateTime) return Response.json({}, { status: 400 });
          if (pre.exists === false && docs['mailLimits/_global']) return Response.json({}, { status: 409 });
          docs['mailLimits/_global'] = { day: w.update.fields.day.stringValue, count: Number(w.update.fields.count.integerValue) };
          limitUpdateTime = new Date().toISOString();
        }
        if (w.transform) {
          const path = w.transform.document.split('/documents/')[1];
          docs[path][w.transform.fieldTransforms[0].fieldPath] = new Date().toISOString();
        }
      }
      return Response.json({});
    }
    const m = url.match(/documents\/(.+)$/);
    if (m) {
      const d = docs[m[1]];
      if (!init.headers?.Authorization?.endsWith('ogretmen-token')) return new Response('', { status: 403 });
      return d ? Response.json({ fields: fields(d), updateTime: m[1] === 'mailLimits/_global' ? limitUpdateTime : '2026-11-08T10:00:00Z' }) : new Response('', { status: 404 });
    }
    return new Response('', { status: 500 });
  };
});

const call = (body, { token = 'ogretmen-token', origin = 'https://bozkurtacademy.com', e = env } = {}) =>
  worker.fetch(new Request('https://ai.example.workers.dev/odev-bildirim', { method: 'POST', headers: { Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), e);
const items = (...pairs) => pairs.map(([uid, id]) => ({ uid, id }));

describe('Ödev e-postası (/odev-bildirim)', () => {
  test('öğretmen olmayan belirteç, belirteçsiz istek ve izinsiz köken reddedilir', async () => {
    assert.equal((await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) }, { token: 'ogrenci-token' })).status, 401);
    assert.equal((await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) }, { token: '' })).status, 401);
    assert.equal((await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) }, { origin: 'https://evil.example' })).status, 403);
    assert.equal(mails.length, 0);
  });

  test('hatalı istek: tür, boş liste, fazla öğe, geçersiz kimlik', async () => {
    for (const body of [{ kind: 'spam', items: items(['ayse1234567', 'odev1']) }, { kind: 'new', items: [] },
      { kind: 'new', items: Array.from({ length: MAIL_MAX_ITEMS + 1 }, (_, i) => ({ uid: 'ayse1234567', id: `o${i}` })) },
      { kind: 'new', items: [{ uid: '../users', id: 'odev1' }] }]) {
      assert.equal((await call(body)).status, 400, JSON.stringify(body).slice(0, 60));
    }
  });

  test('Brevo anahtarı ya da TEACHER_UID yoksa gönderilmez (not-configured)', async () => {
    const r = await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) }, { e: { ...env, BREVO_API_KEY: '' } });
    assert.equal(r.status, 503);
    assert.equal(mails.length, 0);
  });

  test('yeni ödev: öğrencinin dilinde (DE), sadece başlık + teslim + bağlantı; içerik, not ve ad yok; adres Firestore\'dan', async () => {
    const r = await call({ kind: 'new', items: items(['ayse1234567', 'odev1']), to: 'saldirgan@example.com', subject: 'x' });
    const body = await r.json();
    assert.equal(r.status, 200);
    assert.deepEqual(body.results.map((x) => x.status), ['sent']);
    assert.equal(mails.length, 1);
    const m = mails[0];
    assert.deepEqual(m.to, [{ email: 'ayse@example.com', contactPixelTrackingConsent: false }], 'alıcıda takip izni yok');
    assert.equal(m.sender.email, 'info@bozkurtacademy.com');
    assert.equal(m.replyTo.email, 'info@bozkurtacademy.com');
    assert.equal(m.headers['api-key'], 'brevo-anahtar');
    assert.equal(m.subject, 'Neue Hausaufgabe: Perfekt <b>& Plural</b>');
    assert.ok(m.textContent.includes('Abgabe: 30.11.2026, 18:00 (Berliner Zeit)'));
    assert.ok(m.textContent.includes('https://bozkurtacademy.com/odevlerim.html#odev-odev1'));
    assert.ok(m.htmlContent.includes('Perfekt &lt;b&gt;&amp; Plural&lt;/b&gt;') && !m.htmlContent.includes('<b>&'), 'HTML kaçışlandı');
    for (const secret of ['GİZLİ NOT', 'gizli.example', 'Ayşe', 'Yılmaz', 'ayse1234567']) {
      assert.ok(!JSON.stringify({ s: m.subject, t: m.textContent, h: m.htmlContent }).includes(secret), `e-postada yok: ${secret}`);
    }
    // İşaret ve günlük sayaç
    assert.ok(docs['users/ayse1234567/assignments/odev1'].mailNewAt);
    assert.deepEqual(docs['mailLimits/_global'], { day: DAY, count: 1 });
    // Firestore okumaları öğretmenin kendi belirteciyle
    assert.ok(fetchLog.filter((f) => f.url.includes('/documents/')).every((f) => f.init.headers?.Authorization === 'Bearer ogretmen-token'));
  });

  test('aynı ödeve ikinci "yeni ödev" isteği gönderilmez', async () => {
    await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) });
    const second = await (await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) })).json();
    assert.equal(second.results[0].status, 'already');
    assert.equal(mails.length, 1);
  });

  test('"güncellendi" Berlin gününde bir kez; ertesi gün yeniden', async () => {
    const first = await (await call({ kind: 'update', items: items(['ayse1234567', 'odev1']) })).json();
    assert.equal(first.results[0].status, 'sent');
    assert.equal(mails[0].subject, 'Hausaufgabe geändert: Perfekt <b>& Plural</b>');
    const again = await (await call({ kind: 'update', items: items(['ayse1234567', 'odev1']) })).json();
    assert.equal(again.results[0].status, 'already');
    docs['users/ayse1234567/assignments/odev1'].mailUpdateAt = '2020-01-01T10:00:00Z';
    const nextDay = await (await call({ kind: 'update', items: items(['ayse1234567', 'odev1']) })).json();
    assert.equal(nextDay.results[0].status, 'sent');
  });

  test('aynı gün "yeni ödev" giden kopyaya "güncellendi" gitmez (ödev başına günde bir e-posta)', async () => {
    await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) });
    const update = await (await call({ kind: 'update', items: items(['ayse1234567', 'odev1']) })).json();
    assert.equal(update.results[0].status, 'already');
    assert.equal(mails.length, 1);
  });

  test('16 yaş altı: öğrenci + veli (anahtar açık), dil yoksa Türkçe; veliye ayrı metin', async () => {
    const body = await (await call({ kind: 'new', items: items(['can12345678', 'odev2']) })).json();
    assert.equal(body.results[0].status, 'sent');
    assert.equal(body.results[0].recipients, 2);
    assert.deepEqual(mails.map((m) => m.to[0].email), ['can@example.com', 'veli@example.com']);
    assert.ok(mails.every((m) => m.to.length === 1 && m.to[0].contactPixelTrackingConsent === false), 'öğrenci ve velide açılma/tıklama takibi kapalı');
    assert.equal(mails[0].subject, 'Yeni ödev: 23.11.2026');
    assert.ok(mails[0].textContent.includes('sana yeni bir ödev verildi') && !mails[0].textContent.includes('Teslim'), 'teslim tarihi yoksa satır yok');
    assert.ok(mails[1].textContent.includes('öğrencinize yeni bir ödev verildi'));
    assert.deepEqual(docs['mailLimits/_global'], { day: DAY, count: 2 });
  });

  test('"veliyi de ekle" kapalıysa sadece öğrenci', async () => {
    docs['users/can12345678'].inviteParent = false;
    await call({ kind: 'new', items: items(['can12345678', 'odev2']) });
    assert.deepEqual(mails.map((m) => m.to[0].email), ['can@example.com']);
  });

  test('bildirimi kapalı, onaysız ve bulunamayan öğrenci', async () => {
    const body = await (await call({ kind: 'new', items: items(['kapali12345', 'odev3'], ['bekleyen123', 'odev4'], ['yok123', 'odev9']) })).json();
    assert.deepEqual(body.results.map((x) => x.status), ['off', 'inactive', 'not-found']);
    assert.equal(mails.length, 0);
    assert.equal(docs['mailLimits/_global'], undefined);
  });

  test('günlük sınır: sınıra ulaşınca kalanlar "limit"; sayaç Berlin gününe göre', async () => {
    docs['mailLimits/_global'] = { day: DAY, count: 99 };
    const body = await (await call({ kind: 'new', items: items(['ayse1234567', 'odev1'], ['can12345678', 'odev2']) })).json();
    assert.deepEqual(body.results.map((x) => x.status), ['sent', 'limit']);
    assert.equal(body.count, 100);
    assert.deepEqual(docs['mailLimits/_global'], { day: DAY, count: 100 });
    // Dünkü sayaç bugün sayılmaz.
    docs['mailLimits/_global'] = { day: '2020-01-01', count: 100 };
    const next = await (await call({ kind: 'new', items: items(['can12345678', 'odev2']) })).json();
    assert.equal(next.results[0].status, 'sent');
    assert.deepEqual(docs['mailLimits/_global'], { day: DAY, count: 2 });
  });

  test('Brevo hatası: öğrenciye gidemezse "error" ve işaret yok; veliye gidemezse parentError', async () => {
    brevoFail.add('ayse@example.com');
    const failed = await (await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) })).json();
    assert.equal(failed.results[0].status, 'error');
    assert.equal(docs['users/ayse1234567/assignments/odev1'].mailNewAt, undefined);
    brevoFail.clear(); brevoFail.add('veli@example.com');
    const partial = await (await call({ kind: 'new', items: items(['can12345678', 'odev2']) })).json();
    assert.equal(partial.results[0].status, 'sent');
    assert.equal(partial.results[0].parentError, true);
  });

  test('sayaç başka bir istekle değiştiyse yeniden okunup üstüne eklenir', async () => {
    docs['mailLimits/_global'] = { day: DAY, count: 5 };
    const realFetch = globalThis.fetch;
    let bumped = false;
    globalThis.fetch = async (url, init) => {
      if (String(url).endsWith(':commit') && !bumped && init.body.includes('mailLimits')) {
        bumped = true;
        docs['mailLimits/_global'] = { day: DAY, count: 7 };
        limitUpdateTime = 'baska-zaman';
      }
      return realFetch(url, init);
    };
    await call({ kind: 'new', items: items(['ayse1234567', 'odev1']) });
    assert.deepEqual(docs['mailLimits/_global'], { day: DAY, count: 8 });
  });

  test('/check adresi değişmedi (öğretmen belirteci yapay zekâ kontrolüne gidemez)', async () => {
    const r = await worker.fetch(new Request('https://ai.example.workers.dev/check', { method: 'POST', headers: { Origin: 'https://bozkurtacademy.com', 'Content-Type': 'application/json' }, body: '{}' }), env);
    assert.equal(r.status, 400);
  });
});

describe('Ödev e-postası metinleri', () => {
  test('TR/DE/EN, öğrenci ve veli, yeni ve güncellendi', () => {
    const url = 'https://bozkurtacademy.com/odevlerim.html#odev-x';
    const cases = [
      ['tr', 'student', 'new', 'Yeni ödev: T', 'sana yeni bir ödev verildi'],
      ['tr', 'parent', 'update', 'Ödev güncellendi: T', 'öğrencinizin ödevi güncellendi'],
      ['de', 'student', 'new', 'Neue Hausaufgabe: T', 'Hallo,'],
      ['de', 'parent', 'new', 'Neue Hausaufgabe: T', 'Guten Tag,'],
      ['en', 'student', 'update', 'Homework updated: T', 'has been updated'],
      ['en', 'parent', 'new', 'New homework: T', 'Your child has a new homework']
    ];
    for (const [lang, role, kind, subject, phrase] of cases) {
      const m = homeworkMail({ lang, role, kind, title: 'T', due: '', url });
      assert.equal(m.subject, subject);
      assert.ok(m.text.includes(phrase) && m.text.includes(url) && m.html.includes(url), `${lang} ${role} ${kind}`);
    }
    assert.equal(homeworkMail({ lang: 'xx', role: 'student', kind: 'new', title: 'T', due: '', url }).subject, 'Yeni ödev: T');
  });

  test('başlıktaki satır sonları ve kontrol karakterleri temizlenir, 120 karakterle sınırlı', () => {
    const m = homeworkMail({ lang: 'tr', role: 'student', kind: 'new', title: 'A\r\nBcc: x@y.z\u0007' + 'x'.repeat(200), due: '', url: 'https://bozkurtacademy.com/odevlerim.html' });
    assert.ok(!/[\r\n]/.test(m.subject) && m.subject.length <= 'Yeni ödev: '.length + 120);
  });

  test('teslim tarihi Berlin saatiyle ve dile göre', () => {
    assert.equal(formatDue(DUE, 'tr'), '30.11.2026 18:00');
    assert.equal(formatDue(DUE, 'de'), '30.11.2026, 18:00');
    assert.equal(formatDue(DUE, 'en'), '30/11/2026, 18:00');
    assert.equal(formatDue(null, 'tr'), '');
  });

  test('alıcılar: geçersiz adres atlanır, veli aynı adresse tekrar edilmez', () => {
    assert.deepEqual(mailRecipients({ email: 'kotu adres' }), []);
    assert.deepEqual(mailRecipients({ email: 'a@b.de', minor: true, parent: { email: 'A@b.de' } }).map((r) => r.role), ['student']);
    assert.deepEqual(mailRecipients({ email: 'a@b.de', minor: false, parent: { email: 'v@b.de' } }).map((r) => r.role), ['student']);
  });
});
