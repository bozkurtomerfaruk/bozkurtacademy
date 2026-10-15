// Bozkurt Academy: öğrenci ve veli ders hatırlatmaları.
// Öğretmenin Google hesabında çalışır (script.google.com). Kurulum: apps-script/README.md.
//
// Her gün Berlin saatiyle 18:00–19:00 arasında çalışır (Google günlük tetikleyicisi tam dakika garanti etmez).
// Takvimde ertesi gün olan ve siteden oluşturulmuş dersleri (extendedProperties.private.source=bozkurtacademy)
// bulur; kişisel etkinliklere hiç dokunmaz. Her davetliye (öğrenci ve varsa veli) Türkçe hatırlatma gönderir.
// İptal edilmiş derslere ve daveti reddetmiş kişilere göndermez. Aynı ders için aynı kişiye iki kez göndermez.

var CONFIG = {
  SOURCE: 'bozkurtacademy',
  TIME_ZONE: 'Europe/Berlin',
  SENDER_NAME: 'Bozkurt Academy',
  TEACHER_NAME: 'Ömer Faruk Bozkurt',
  PANEL_URL: 'https://bozkurtacademy.com/panel.html',
  // Gönderim kayıtları bu kadar gün saklanır (e-posta adresi değil, SHA-256 özeti).
  KEEP_DAYS: 14,
  SENT_PREFIX: 'sent:'
};

var MARKER_LINE = 'bozkurtacademy.com üzerinden oluşturuldu.';
var MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
var DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// ---- Çalıştırılacak fonksiyonlar ----

// Zamanlayıcının çalıştırdığı fonksiyon.
function sendReminders() {
  return run_({ dryRun: false });
}

// E-posta göndermeden kime ne gideceğini günlüğe yazar (kurulumda ilk çalıştırılacak fonksiyon).
function dryRun() {
  return run_({ dryRun: true });
}

// Günlük zamanlayıcıyı kurar. Bir kez çalıştırmak yeterli; tekrar çalıştırılırsa eskisini siler.
function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'sendReminders') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('sendReminders')
    .timeBased()
    .everyDays(1)
    .atHour(18)
    .inTimezone(CONFIG.TIME_ZONE)
    .create();
  Logger.log('Zamanlayıcı kuruldu: her gün 18:00–19:00 arası (Berlin).');
}

// ---- Ana akış ----

function run_(options) {
  var now = new Date();
  var range = tomorrowWindow_(now);
  var response = Calendar.Events.list('primary', {
    timeMin: range.timeMin.toISOString(),
    timeMax: range.timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    showDeleted: false,
    maxResults: 250,
    privateExtendedProperty: 'source=' + CONFIG.SOURCE
  });
  var events = (response && response.items) || [];
  var props = PropertiesService.getScriptProperties();
  var sentKeys = props.getProperties();
  var summary = { events: events.length, sent: 0, skipped: 0, dryRun: Boolean(options.dryRun) };

  events.forEach(function (event) {
    reminderPlan_(event).forEach(function (item) {
      var key = CONFIG.SENT_PREFIX + sha256Hex_(event.id + '|' + item.start.toISOString() + '|' + item.to.toLowerCase());
      if (sentKeys[key]) {
        summary.skipped++;
        Logger.log('Zaten gönderildi, atlandı: ' + item.subject + ' (' + item.role + ')');
        return;
      }
      if (options.dryRun) {
        Logger.log('[deneme] ' + item.role + ' <' + item.to + '>: ' + item.subject + '\n' + item.text);
        summary.sent++;
        return;
      }
      MailApp.sendEmail({
        to: item.to,
        subject: item.subject,
        body: item.text,
        htmlBody: item.html,
        name: CONFIG.SENDER_NAME
      });
      props.setProperty(key, String(now.getTime()));
      sentKeys[key] = String(now.getTime());
      summary.sent++;
    });
  });

  if (!options.dryRun) cleanupSent_(props, now);
  Logger.log('Ders: ' + summary.events + ', gönderilen: ' + summary.sent + ', atlanan: ' + summary.skipped + (summary.dryRun ? ' (deneme, e-posta gönderilmedi)' : ''));
  return summary;
}

// ---- Yardımcılar (testler bunları doğrudan çağırır) ----

// Berlin saatiyle yarının başlangıcı ve sonu (yaz/kış saati değişen günler dahil).
function tomorrowWindow_(now) {
  var todayKey = Utilities.formatDate(now, CONFIG.TIME_ZONE, 'yyyy-MM-dd');
  var tomorrowKey = addDaysToKey_(todayKey, 1);
  var dayAfterKey = addDaysToKey_(todayKey, 2);
  return { key: tomorrowKey, timeMin: zonedMidnight_(tomorrowKey), timeMax: zonedMidnight_(dayAfterKey) };
}

function addDaysToKey_(key, days) {
  var p = key.split('-').map(Number);
  return new Date(Date.UTC(p[0], p[1] - 1, p[2] + days)).toISOString().slice(0, 10);
}

// "YYYY-MM-DD" gününün Berlin'deki gece yarısı.
function zonedMidnight_(key) {
  var p = key.split('-').map(Number);
  var guess = Date.UTC(p[0], p[1] - 1, p[2]);
  var date = new Date(guess - offsetMs_(new Date(guess)));
  return new Date(guess - offsetMs_(date));
}

// Berlin'in UTC'den farkı (milisaniye), verilen anda.
function offsetMs_(date) {
  var parts = Utilities.formatDate(date, CONFIG.TIME_ZONE, 'yyyy-MM-dd-HH-mm').split('-').map(Number);
  var asUtc = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
  return asUtc - Math.floor(date.getTime() / 60000) * 60000;
}

// Bir ders için gönderilecek e-postalar: davet listesindeki öğrenci ve veli (öğretmen ve reddedenler hariç).
function reminderPlan_(event) {
  if (!event || event.status === 'cancelled') return [];
  var marker = event.extendedProperties && event.extendedProperties.private;
  if (!marker || marker.source !== CONFIG.SOURCE) return [];
  if (!event.start || !event.start.dateTime) return [];

  var start = new Date(event.start.dateTime);
  var end = new Date(event.end && event.end.dateTime ? event.end.dateTime : start.getTime() + 50 * 60000);
  var studentEmail = String(marker.studentEmail || '').toLowerCase();
  var lesson = {
    studentName: studentNameOf_(event.summary),
    start: start,
    end: end,
    minutes: Math.round((end - start) / 60000),
    meetUrl: meetUrlOf_(event),
    note: noteOf_(event.description)
  };

  return (event.attendees || [])
    .filter(function (a) { return a.email && !a.organizer && !a.self && a.responseStatus !== 'declined'; })
    .map(function (a) {
      var role = a.email.toLowerCase() === studentEmail ? 'öğrenci' : 'veli';
      var mail = composeEmail_(lesson, role);
      return { to: a.email, role: role, start: start, subject: mail.subject, text: mail.text, html: mail.html };
    });
}

function studentNameOf_(summary) {
  var match = /–\s*(.+)$/.exec(summary || '');
  return match ? match[1].trim() : '';
}

function meetUrlOf_(event) {
  if (event.hangoutLink) return event.hangoutLink;
  var points = (event.conferenceData && event.conferenceData.entryPoints) || [];
  for (var i = 0; i < points.length; i++) if (points[i].entryPointType === 'video') return points[i].uri;
  return '';
}

// Ders notu: açıklamadan sitenin eklediği "oluşturuldu" satırı çıkarılır.
function noteOf_(description) {
  return String(description || '')
    .replace(/<[^>]*>/g, ' ')
    .split(MARKER_LINE).join('')
    .trim();
}

function formatTr_(date) {
  var p = Utilities.formatDate(date, CONFIG.TIME_ZONE, 'd-M-yyyy-u-HH:mm').split('-');
  return {
    date: p[0] + ' ' + MONTHS_TR[Number(p[1]) - 1] + ' ' + p[2] + ', ' + DAYS_TR[Number(p[3]) - 1],
    time: p[4]
  };
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Türkçe hatırlatma e-postası. Konu: "Yarınki Almanca dersin – [saat]".
function composeEmail_(lesson, role) {
  var start = formatTr_(lesson.start);
  var end = formatTr_(lesson.end);
  var subject = 'Yarınki Almanca dersin – ' + start.time;
  var greeting = role === 'veli' ? 'Merhaba,' : 'Merhaba' + (lesson.studentName ? ' ' + lesson.studentName : '') + ',';
  var intro = role === 'veli'
    ? 'Öğrenciniz ' + (lesson.studentName || '') + ' için yarın bir Almanca dersi var.'
    : 'Yarın Almanca dersin var.';
  var rows = [
    ['Tarih', start.date],
    ['Saat', start.time + '–' + end.time + ' (Almanya saati)'],
    ['Süre', lesson.minutes + ' dakika']
  ];
  if (lesson.note) rows.push(['Ders notu', lesson.note]);

  var text = [greeting, '', intro, '']
    .concat(rows.map(function (r) { return r[0] + ': ' + r[1]; }))
    .concat(lesson.meetUrl ? ['', 'Görüşmeye katıl: ' + lesson.meetUrl] : ['', 'Görüşme bağlantısı takvim davetinde.'])
    .concat(role === 'öğrenci' ? ['', 'Derslerini ve ödevlerini panelinde de görebilirsin: ' + CONFIG.PANEL_URL] : [])
    .concat(['', 'Görüşmek üzere,', CONFIG.TEACHER_NAME, CONFIG.SENDER_NAME])
    .join('\n');

  var html = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#2a2a26">'
    + '<p>' + escapeHtml_(greeting) + '</p>'
    + '<p>' + escapeHtml_(intro) + '</p>'
    + '<table style="border-collapse:collapse">'
    + rows.map(function (r) {
      return '<tr><td style="padding:4px 16px 4px 0;color:#55534a">' + escapeHtml_(r[0]) + '</td>'
        + '<td style="padding:4px 0;font-weight:bold;white-space:pre-line">' + escapeHtml_(r[1]) + '</td></tr>';
    }).join('')
    + '</table>'
    + (lesson.meetUrl
      ? '<p style="margin:24px 0"><a href="' + escapeHtml_(lesson.meetUrl) + '" style="background:#45572f;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:bold">Görüşmeye katıl</a></p>'
      : '<p>Görüşme bağlantısı takvim davetinde.</p>')
    + (role === 'öğrenci' ? '<p>Derslerini ve ödevlerini <a href="' + CONFIG.PANEL_URL + '">panelinde</a> de görebilirsin.</p>' : '')
    + '<p>Görüşmek üzere,<br>' + escapeHtml_(CONFIG.TEACHER_NAME) + '<br>' + escapeHtml_(CONFIG.SENDER_NAME) + '</p>'
    + '</div>';

  return { subject: subject, text: text, html: html };
}

function sha256Hex_(value) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ((b + 256) % 256).toString(16).padStart(2, '0'); }).join('');
}

// KEEP_DAYS günden eski gönderim kayıtlarını siler.
function cleanupSent_(props, now) {
  var limit = now.getTime() - CONFIG.KEEP_DAYS * 24 * 60 * 60 * 1000;
  var all = props.getProperties();
  Object.keys(all).forEach(function (key) {
    if (key.indexOf(CONFIG.SENT_PREFIX) === 0 && Number(all[key]) < limit) props.deleteProperty(key);
  });
}
