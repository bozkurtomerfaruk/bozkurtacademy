// privacy.html: seviye testiyle eklenen ve değişen bölümlerin TR/DE/EN metinleri.
// app.js'teki data-i18n metni düz yazı olarak koyar; bu bölümlerde bağlantı ve <code> olduğu için
// buradaki sabit HTML (kullanıcı girdisi değil) data-privacy işaretli öğelere yazılır.
(() => {
  const MAIL = '<a class="ba-link" href="mailto:bozkurtt.omerfaruk@gmail.com">bozkurtt.omerfaruk@gmail.com</a>';
  const texts = {
    tr: {
      updated: 'Son güncelleme: 26 Ekim 2026',
      firebaseLoad: 'Giriş yapmamış ziyaretçiler için Firebase yüklenmez. Tek istisna: Seviye testinin sonucunu göndermek için “Sonucu gönder”e bastığında Firebase yüklenir (bkz. 5a).',
      storagePlacement: '<strong>Seviye testi (localStorage):</strong> testteki ilerlemen (<code>baPlacement</code>: cevaplar, seçeneklerin sırası, form taslağı) ve son gönderim zamanı (<code>baPlacementSent</code>). Bunlar sen gönderene kadar cihazından çıkmaz; gönderimden sonra ilerleme silinir.',
      goatcounter: 'Herkese açık sayfalarda (ana sayfa, dersler, gramer, alıştırmalar, sınav hazırlığı, seviye testi, hakkımda, iletişim) hangi sayfaların ne sıklıkla açıldığını görmek için GoatCounter kullanılır. Giriş, kayıt, öğrenci paneli ve öğretmen paneli sayfalarında GoatCounter yoktur.',
      placementTitle: '5a. Seviye testi',
      placementData: 'Seviye testini çözüp sonucunu gönderdiğinde şu bilgiler kaydedilir: adın, e-posta adresin, hedefin, varsa sınavının adı ve tarihi, daha önce ne kadar süre Almanca öğrendiğin, notun, test sonucun (tahmini seviye, bölümlere göre doğru sayısı, konu bazında hatalar, yanlış cevapladığın sorular ve cevapların), yazma görevine yazdığın metin, testin süresi ve gönderim tarihi.',
      placementPurpose: 'Bu bilgileri sadece ders planlaması ve seninle ilk ders için iletişim kurmak amacıyla kullanırım; yalnızca ben görebilirim.',
      placementFirebase: 'Veriler Google Firebase’de (Google Ireland Ltd. / Google LLC) işlenir: Cloud Firestore’da Frankfurt’taki (europe-west3) sunucularda saklanır. Gönderim için Firebase Authentication üzerinden anonim, geçici bir oturum açılır ve gönderimden hemen sonra kapatılır; bu sırada Google cihazının IP adresini ve tarayıcı bilgilerini işler ve bu işleme ABD’de de olabilir (AB-ABD Veri Gizliliği Çerçevesi ve standart sözleşme maddeleri). Firebase’in program dosyaları gstatic.com’dan yüklenir.',
      placementBasis: 'Hukuki dayanak: senin talebin üzerine sözleşme öncesi adımlar (DSGVO md. 6/1-b) ve gönderirken verdiğin onay (DSGVO md. 6/1-a).',
      placementRetention: 'Saklama süresi: Sonuç gönderimden 6 ay sonra otomatik olarak silinir. Derslere başlarsak ilgili bilgiler öğrenci kaydına aktarılabilir; o zaman 10. bölüm geçerlidir.',
      placementDelete: `Kaydının daha önce silinmesini istediğinde ${MAIL} adresine yazman yeterli; onayını istediğin zaman geri alabilirsin.`,
      firebaseIntro: 'Giriş, öğrenci ve seviye testi verileri Google Firebase ile işlenir (Google Ireland Ltd. / Google LLC).',
      firestore: '<strong>Cloud Firestore:</strong> Öğrenci ve seviye testi verileri Frankfurt’taki (europe-west3) sunucularda saklanır.',
      rightsPlacement: `Seviye testi sonucunun silinmesini ${MAIL} adresine e-postayla isteyebilirsin.`
    },
    de: {
      updated: 'Zuletzt aktualisiert: 26. Oktober 2026',
      firebaseLoad: 'Für nicht angemeldete Besucher wird Firebase nicht geladen. Einzige Ausnahme: Wenn du beim Einstufungstest auf „Ergebnis senden“ klickst, wird Firebase geladen, um das Ergebnis zu senden (siehe 5a).',
      storagePlacement: '<strong>Einstufungstest (localStorage):</strong> dein Fortschritt im Test (<code>baPlacement</code>: Antworten, Reihenfolge der Optionen, Formularentwurf) und der Zeitpunkt der letzten Sendung (<code>baPlacementSent</code>). Diese Daten verlassen dein Gerät erst, wenn du sie sendest; nach dem Senden wird der Fortschritt gelöscht.',
      goatcounter: 'Auf den öffentlichen Seiten (Startseite, Unterricht, Grammatik, Übungen, Prüfungsvorbereitung, Einstufungstest, Über mich, Kontakt) wird GoatCounter genutzt, um zu sehen, welche Seiten wie oft aufgerufen werden. Auf den Seiten für Anmeldung, Registrierung, Schülerbereich und Lehrerbereich gibt es kein GoatCounter.',
      placementTitle: '5a. Einstufungstest',
      placementData: 'Wenn du den Einstufungstest machst und das Ergebnis sendest, werden folgende Angaben gespeichert: dein Name, deine E-Mail-Adresse, dein Ziel, gegebenenfalls Name und Datum deiner Prüfung, wie lange du schon Deutsch lernst, deine Notiz, dein Testergebnis (geschätztes Niveau, richtige Antworten pro Teil, Fehler nach Themen, falsch beantwortete Fragen und deine Antworten), dein Text aus der Schreibaufgabe, die Dauer des Tests und das Sendedatum.',
      placementPurpose: 'Ich nutze diese Angaben nur, um den Unterricht zu planen und dich für die erste Stunde zu kontaktieren; nur ich kann sie sehen.',
      placementFirebase: 'Die Daten werden mit Google Firebase (Google Ireland Ltd. / Google LLC) verarbeitet und in Cloud Firestore auf Servern in Frankfurt (europe-west3) gespeichert. Zum Senden wird über Firebase Authentication eine anonyme, vorübergehende Sitzung geöffnet und direkt danach wieder geschlossen; dabei verarbeitet Google die IP-Adresse und Browserdaten deines Geräts, auch in den USA (EU-U.S. Data Privacy Framework und Standardvertragsklauseln). Die Programmdateien von Firebase werden von gstatic.com geladen.',
      placementBasis: 'Rechtsgrundlage: vorvertragliche Maßnahmen auf deine Anfrage (Art. 6 Abs. 1 lit. b DSGVO) und deine Einwilligung beim Senden (Art. 6 Abs. 1 lit. a DSGVO).',
      placementRetention: 'Speicherdauer: Das Ergebnis wird 6 Monate nach dem Senden automatisch gelöscht. Wenn wir mit dem Unterricht beginnen, können die relevanten Angaben in dein Schülerkonto übernommen werden; dann gilt Abschnitt 10.',
      placementDelete: `Wenn dein Eintrag früher gelöscht werden soll, schreib einfach an ${MAIL}; deine Einwilligung kannst du jederzeit widerrufen.`,
      firebaseIntro: 'Anmelde-, Schüler- und Einstufungstestdaten werden mit Google Firebase verarbeitet (Google Ireland Ltd. / Google LLC).',
      firestore: '<strong>Cloud Firestore:</strong> Schüler- und Einstufungstestdaten werden auf Servern in Frankfurt (europe-west3) gespeichert.',
      rightsPlacement: `Die Löschung deines Einstufungstest-Ergebnisses kannst du per E-Mail an ${MAIL} verlangen.`
    },
    en: {
      updated: 'Last updated: 26 October 2026',
      firebaseLoad: 'Firebase is not loaded for visitors who are not signed in. The only exception: when you press “Send result” after the placement test, Firebase is loaded to send the result (see 5a).',
      storagePlacement: '<strong>Placement test (localStorage):</strong> your progress in the test (<code>baPlacement</code>: answers, order of the options, form draft) and the time of your last submission (<code>baPlacementSent</code>). This stays on your device until you send it; your progress is deleted after sending.',
      goatcounter: 'On the public pages (home, lessons, grammar, exercises, exam preparation, placement test, about, contact) GoatCounter is used to see which pages are opened and how often. There is no GoatCounter on the login, registration, student panel and teacher panel pages.',
      placementTitle: '5a. Placement test',
      placementData: 'When you take the placement test and send your result, the following is stored: your name, email address, goal, the name and date of your exam if any, how long you have learned German, your note, your test result (estimated level, correct answers per part, errors by topic, the questions you answered wrongly and your answers), the text you wrote in the writing task, the duration of the test and the date you sent it.',
      placementPurpose: 'I use this information only to plan lessons and to contact you about your first lesson; only I can see it.',
      placementFirebase: 'The data is processed with Google Firebase (Google Ireland Ltd. / Google LLC) and stored in Cloud Firestore on servers in Frankfurt (europe-west3). To send it, a temporary anonymous session is opened via Firebase Authentication and closed right after sending; during this, Google processes your device’s IP address and browser details, also in the USA (EU-U.S. Data Privacy Framework and standard contractual clauses). Firebase’s program files are loaded from gstatic.com.',
      placementBasis: 'Legal basis: steps prior to a contract at your request (Art. 6(1)(b) GDPR) and the consent you give when sending (Art. 6(1)(a) GDPR).',
      placementRetention: 'Retention: the result is deleted automatically 6 months after it was sent. If we start lessons, the relevant details may be moved to your student account; section 10 then applies.',
      placementDelete: `If you want your entry deleted earlier, just write to ${MAIL}; you can withdraw your consent at any time.`,
      firebaseIntro: 'Login, student and placement test data are processed with Google Firebase (Google Ireland Ltd. / Google LLC).',
      firestore: '<strong>Cloud Firestore:</strong> student and placement test data are stored on servers in Frankfurt (europe-west3).',
      rightsPlacement: `You can ask for your placement test result to be deleted by emailing ${MAIL}.`
    }
  };

  function apply(lang){
    const set = texts[lang] || texts.tr;
    document.querySelectorAll('[data-privacy]').forEach((el) => {
      const html = set[el.dataset.privacy];
      if(!html) return;
      el.innerHTML = html;
      el.lang = lang in texts ? lang : 'tr';
    });
  }
  window.addEventListener('ba:languagechange', (event) => apply(event.detail?.lang));
  document.addEventListener('DOMContentLoaded', () => apply(window.BA?.lang || 'tr'));
})();
