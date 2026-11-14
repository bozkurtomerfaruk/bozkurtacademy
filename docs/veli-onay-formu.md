> **Bu bir taslaktır, kullanmadan önce hukuki olarak kontrol ettirin.**
> **Dies ist ein Entwurf. Vor der Verwendung rechtlich prüfen lassen.**

---

# Veli onay formu: Bozkurt Academy öğrenci hesabı

**Sorumlu:** Ömer Faruk Bozkurt, bozkurtt.omerfaruk@gmail.com

Çocuğunuz Bozkurt Academy'nin online Almanca derslerine katılmak için bozkurtacademy.com sitesinde bir öğrenci hesabı açmak istiyor. 16 yaşından küçük öğrencilerin hesabı sizin onayınız olmadan açılmaz. Bu form, hangi verilerin neden işlendiğini açıklar.

## 1. Toplanan veriler

- Öğrencinin adı soyadı, e-posta adresi ve doğum yılı (tam doğum tarihi değil)
- Sitedeki alıştırmaların ve sınav hazırlığı setlerinin sonuçları: konu, seviye, skor ve zaman (tek tek cevaplar kaydedilmez)
- Ödevlerin durumu ve öğrencinin ödeve eklediği Google Docs linki
- Sınav hazırlığındaki yazma görevlerinde (Schreiben) öğrencinin gönderdiği metinler ve öğretmenin geri bildirimi
- Ders bilgileri: tarih, saat, süre, ders notu ve Google Meet linki
- Velinin adı soyadı ve e-posta adresi
- Bu onayın tarihi ve yöntemi (imzalı form ya da e-posta)

Başka kişisel veri istenmez.

## 2. Verilerin kullanım amacı

- Derslerin planlanması ve yürütülmesi
- Öğrencinin ilerlemesinin takibi (alıştırma sonuçları, ödevler)
- Ders davetlerinin ve hatırlatma e-postalarının gönderilmesi
- İsterseniz ders davetleri ve hatırlatmalar size de gönderilir (aşağıdaki 3. maddeye bakın)

Veriler reklam için kullanılmaz ve satılmaz.

## 3. Verilerin saklandığı yerler

- **Google Firebase:** Giriş ve öğrenci verileri burada tutulur. Veritabanı (Cloud Firestore) Frankfurt'taki sunucularda bulunur. Giriş hesabı (e-posta adresi, şifrenin şifrelenmiş özeti) Google tarafından AB dışında, özellikle ABD'de de işlenebilir; bu aktarım AB-ABD Veri Gizliliği Çerçevesi ve standart sözleşme maddeleri dayanağıyla yapılır.
- **Google Calendar ve Google Meet:** Her ders öğretmenin Google Calendar'ında bir etkinlik olarak oluşturulur. Öğrencinin adı ve e-posta adresi, ders zamanı ve Meet linki bu etkinlikte yer alır. Davet e-postalarını Google gönderir.
- **Gmail:** Dersten bir gün önce öğretmenin Gmail hesabından hatırlatma e-postası gönderilir (Google Apps Script ile).

## 3a. Yapay zekâ ile metin kontrolü (isteğe bağlı, ayrı onay)

Öğrenci yazma görevinde metnini gönderdiğinde, geri bildirimi beklemeden hemen alabilmesi için metin bir yapay zekâ ile kontrol edilir (form sürümü 2, 12 Kasım 2026). Bu sadece aşağıdaki ayrı kutuyu işaretlerseniz yapılır. İşaretlemezseniz öğrenci yine bütün yazma görevlerini kullanır ve geri bildirimi sadece öğretmenden alır.

- **Hizmet:** Cloudflare Workers AI (Cloudflare, Inc., ABD). Model: Google Gemma 4 (açık lisanslı bir model).
- **Gönderilen:** Sadece metnin kendisi, görevin adı (ör. "Goethe B1 · Teil 1 · Neue Wohnung") ve metin türü (ör. gayriresmî e-posta). Öğrencinin adı, e-posta adresi, kullanıcı kimliği ya da başka bir bilgisi gönderilmez. Öğrencinin metne kendi yazdığı bilgiler (ör. metindeki bir isim) metnin parçası olarak gider; bu yüzden öğrenciye metinlerde gerçek bilgilerini yazmamasını öneriyoruz.
- **Eğitim ve saklama:** Cloudflare, Workers AI'a gönderilen metinleri yapay zekâ modellerini eğitmek için kullanmaz ve işlemden sonra saklamaz.
- **Yer:** İşlem AB dışında, özellikle ABD'de de yapılabilir; dayanak AB-ABD Veri Gizliliği Çerçevesi ve standart sözleşme maddeleridir.
- **Sonuç:** Geri bildirim (hatalı yer, doğrusu, kısa Türkçe açıklama, düzeltilmiş metin) **öğretmen önceden kontrol etmeden**, gönderdikten birkaç saniye sonra doğrudan öğrenciye gösterilir; üzerinde "Yapay zekâ geri bildirimi – nadiren hata yapabilir" yazar. Yapay zekâ yanılabilir: öğrenci yanlış bulduğu açıklamayı tek düğmeyle öğretmene bildirebilir; öğretmen bakar, düzeltir ve not yazar. Öğretmen bütün metinleri ve geri bildirimleri görebilir. Yapay zekâ not vermez ve öğrenci hakkında karar vermez.
- **Sınır:** Öğrenci başına günde en fazla 3 kontrol yapılır. Sınır dolarsa ya da hizmet çalışmazsa metin sadece öğretmene iletilir ve geri bildirimi öğretmen yazar.
- Bu onayı ayrıca ve istediğiniz zaman geri alabilirsiniz; hesap açık kalır, sadece yapay zekâ kontrolü durur.

## 4. Saklama süresi

- Veriler son dersten 12 ay sonra silinir.
- Onaylanmayan kayıtlar 30 gün içinde silinir.
- Bu imzalı form onay geri alınana veya öğrenci silinene kadar saklanır, sonra imha edilir: kâğıt olarak verilirse kilitli bir dolapta, dijital olarak (taranmış ya da e-postayla) verilirse şifreli bir klasörde.

## 5. Haklarınız

- Verilere erişmeyi, düzeltilmesini ve **silinmesini isteme hakkınız** var. Bunun için bozkurtt.omerfaruk@gmail.com adresine yazmanız yeterli.
- **Bu onayı istediğiniz zaman geri alabilirsiniz.** Onay geri alınırsa öğrencinin bütün verileri (alıştırma sonuçları, ödevler, dersler ve veli bilgileri) silinir. Geri alma, o zamana kadar yapılan işlemleri geçersiz kılmaz.
- Bir veri koruma denetim makamına şikâyette bulunabilirsiniz. Yetkili makam: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), www.ldi.nrw.de.

## 6. Onay

Öğrencinin adı soyadı: ______________________________

Öğrencinin e-posta adresi: ______________________________

Velinin adı soyadı: ______________________________

Velinin e-posta adresi: ______________________________

- [ ] Yukarıdaki bilgileri okudum. Çocuğumun Bozkurt Academy öğrenci hesabının açılmasına ve verilerinin bu formda açıklandığı şekilde işlenmesine onay veriyorum.
- [ ] Ders davetlerinin ve hatırlatma e-postalarının bana da gönderilmesini istiyorum. (İsteğe bağlı)
- [ ] Çocuğumun yazma görevlerindeki metinlerin 3a maddesinde açıklandığı şekilde yapay zekâ ile kontrol edilmesine ve geri bildirimin öğretmen önceden kontrol etmeden doğrudan çocuğuma gösterilmesine onay veriyorum. (İsteğe bağlı)

Yer, tarih: ______________________________

Velinin imzası: ______________________________

---

# Einwilligungserklärung der Eltern: Schülerkonto bei Bozkurt Academy

**Verantwortlicher:** Ömer Faruk Bozkurt, bozkurtt.omerfaruk@gmail.com

Ihr Kind möchte für den Online-Deutschunterricht bei Bozkurt Academy ein Schülerkonto auf bozkurtacademy.com anlegen. Konten von Schülerinnen und Schülern unter 16 Jahren werden nur mit Ihrer Einwilligung freigeschaltet. Dieses Formular erklärt, welche Daten zu welchem Zweck verarbeitet werden.

## 1. Erhobene Daten

- Vor- und Nachname, E-Mail-Adresse und Geburtsjahr des Kindes (nicht das genaue Geburtsdatum)
- Ergebnisse der Übungen und der Sätze zur Prüfungsvorbereitung auf der Website: Thema, Niveau, Punktzahl und Zeitpunkt (einzelne Antworten werden nicht gespeichert)
- Stand der Hausaufgaben und der Google-Docs-Link, den das Kind zu einer Hausaufgabe hinzufügt
- Bei den Schreibaufgaben der Prüfungsvorbereitung: die Texte, die das Kind abschickt, und die Rückmeldung des Lehrers
- Unterrichtsdaten: Datum, Uhrzeit, Dauer, Notiz zur Stunde und Google-Meet-Link
- Vor- und Nachname sowie E-Mail-Adresse eines Elternteils
- Datum und Form dieser Einwilligung (unterschriebenes Formular oder E-Mail)

Weitere personenbezogene Daten werden nicht erhoben.

## 2. Zweck der Verarbeitung

- Planung und Durchführung des Unterrichts
- Verfolgung des Lernfortschritts (Übungsergebnisse, Hausaufgaben)
- Versand von Einladungen zu den Stunden und von Erinnerungs-E-Mails
- Auf Wunsch erhalten auch Sie die Einladungen und Erinnerungen (siehe Punkt 3)

Die Daten werden nicht für Werbung verwendet und nicht verkauft.

## 3. Speicherorte

- **Google Firebase:** Anmelde- und Schülerdaten werden hier gespeichert. Die Datenbank (Cloud Firestore) liegt auf Servern in Frankfurt. Das Anmeldekonto (E-Mail-Adresse, verschlüsselter Passwort-Hash) kann von Google auch außerhalb der EU, insbesondere in den USA, verarbeitet werden; Grundlage dafür sind das EU-US Data Privacy Framework und die Standardvertragsklauseln der EU-Kommission.
- **Google Calendar und Google Meet:** Jede Stunde wird als Termin im Google Calendar des Lehrers angelegt. Name und E-Mail-Adresse des Kindes, die Uhrzeit und der Meet-Link stehen in diesem Termin. Die Einladungs-E-Mails versendet Google.
- **Gmail:** Einen Tag vor der Stunde wird vom Gmail-Konto des Lehrers eine Erinnerungs-E-Mail versendet (mit Google Apps Script).

## 3a. Textprüfung mit künstlicher Intelligenz (freiwillig, gesonderte Einwilligung)

Wenn das Kind bei einer Schreibaufgabe seinen Text abschickt, wird der Text mit einer KI geprüft, damit es sofort eine Rückmeldung erhält, ohne zu warten (Formularversion 2, 12. November 2026). Das geschieht nur, wenn Sie das gesonderte Kästchen unten ankreuzen. Ohne dieses Kreuz nutzt das Kind alle Schreibaufgaben weiterhin und erhält die Rückmeldung nur vom Lehrer.

- **Dienst:** Cloudflare Workers AI (Cloudflare, Inc., USA). Modell: Google Gemma 4 (ein offen lizenziertes Modell).
- **Übermittelt:** Nur der Text selbst, der Name der Aufgabe (z. B. „Goethe B1 · Teil 1 · Neue Wohnung“) und die Textsorte (z. B. informelle E-Mail). Name, E-Mail-Adresse, Benutzerkennung oder andere Angaben des Kindes werden nicht übermittelt. Was das Kind selbst in den Text schreibt (z. B. einen Namen), geht als Teil des Textes mit; wir empfehlen dem Kind deshalb, keine echten persönlichen Angaben in die Texte zu schreiben.
- **Training und Speicherung:** Cloudflare verwendet die an Workers AI gesendeten Texte nicht zum Training von KI-Modellen und speichert sie nach der Verarbeitung nicht.
- **Ort:** Die Verarbeitung kann auch außerhalb der EU, insbesondere in den USA, stattfinden; Grundlage sind das EU-US Data Privacy Framework und die Standardvertragsklauseln.
- **Ergebnis:** Die Rückmeldung (fehlerhafte Stelle, Korrektur, kurze Erklärung auf Türkisch, korrigierter Text) wird dem Kind **ohne vorherige Prüfung durch den Lehrer** wenige Sekunden nach dem Abschicken direkt angezeigt, mit dem Hinweis „KI-Rückmeldung – kann selten Fehler enthalten“. Die KI kann sich irren: Das Kind kann eine Erklärung, die ihm falsch vorkommt, mit einem Klick dem Lehrer melden; der Lehrer prüft, korrigiert und schreibt eine Notiz. Der Lehrer kann alle Texte und Rückmeldungen sehen. Die KI vergibt keine Noten und trifft keine Entscheidungen über das Kind.
- **Begrenzung:** Höchstens 3 Prüfungen pro Kind und Tag. Ist das Limit erreicht oder der Dienst nicht erreichbar, geht der Text nur an den Lehrer, der dann die Rückmeldung schreibt.
- Sie können diese Einwilligung gesondert und jederzeit widerrufen; das Konto bleibt bestehen, nur die KI-Prüfung endet.

## 4. Speicherdauer

- Die Daten werden 12 Monate nach der letzten Stunde gelöscht.
- Nicht freigeschaltete Registrierungen werden innerhalb von 30 Tagen gelöscht.
- Dieses unterschriebene Formular wird aufbewahrt, bis die Einwilligung widerrufen oder das Schülerkonto gelöscht wird, und danach vernichtet: in Papierform in einem abschließbaren Schrank, in digitaler Form (eingescannt oder per E-Mail) in einem verschlüsselten Ordner.

## 5. Ihre Rechte

- Sie haben das Recht auf Auskunft, Berichtigung und **Löschung der Daten**. Schreiben Sie dazu einfach an bozkurtt.omerfaruk@gmail.com.
- **Sie können diese Einwilligung jederzeit widerrufen.** Nach einem Widerruf werden alle Daten des Kindes (Übungsergebnisse, Hausaufgaben, Stunden und Elterndaten) gelöscht. Der Widerruf berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.
- Sie können sich bei einer Datenschutz-Aufsichtsbehörde beschweren. Zuständig: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), www.ldi.nrw.de.

## 6. Einwilligung

Vor- und Nachname des Kindes: ______________________________

E-Mail-Adresse des Kindes: ______________________________

Vor- und Nachname des Elternteils: ______________________________

E-Mail-Adresse des Elternteils: ______________________________

- [ ] Ich habe die obigen Informationen gelesen. Ich willige ein, dass für mein Kind ein Schülerkonto bei Bozkurt Academy angelegt wird und seine Daten wie in diesem Formular beschrieben verarbeitet werden.
- [ ] Ich möchte die Einladungen und Erinnerungs-E-Mails ebenfalls erhalten. (Freiwillig)
- [ ] Ich willige ein, dass die Texte meines Kindes aus den Schreibaufgaben wie unter Punkt 3a beschrieben mit KI geprüft werden und die Rückmeldung meinem Kind ohne vorherige Prüfung durch den Lehrer direkt angezeigt wird. (Freiwillig)

Ort, Datum: ______________________________

Unterschrift eines Elternteils: ______________________________
