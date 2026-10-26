/* Sınav Hazırlığı (#exams): every exam, level, section and Teil shown on the page comes from this file.
   js/exams.js builds the cards and the #exams/... addresses from it; nothing about the exams is written in index.html.

   Texts in three languages are written as { tr, de, en }. A plain string is used for all languages.

   Adding exercises to a Teil (the only change needed, the "Başla" button appears by itself):

     { title: null, exercises: [] }, // Teil 1
   becomes
     {
       title: { tr: 'Kısa mesajlar', de: 'Kurze Nachrichten', en: 'Short messages' },   // optional, shown under "Teil 1"
       exercises: [
         { title: { tr: 'Set 1', de: 'Set 1', en: 'Set 1' }, href: '#exercises/B1/konnektoren' },
         { title: 'Modelltest', href: 'https://example.com/modelltest.pdf' }
       ]
     }, // Teil 1

   href is either an address on this site starting with # or a full https:// address.
   A set played on this site is written as { set: 'set-1', title: 'Neu im Dorf' }: its file is
   data/exams/<exam>/<level>/<section>/teil-<n>/set-1.json (format: docs/sinav-setleri.md) and its address
   #exams/<exam>/<level>/<section>/<n>/set-1.
   An empty exercises list shows the Teil as "Yakında" (coming soon) with a disabled button.
   Teil numbers come from the order in the list; do not write them yourself.

   A new exam: add an entry to `exams`. `comingSoon: true` shows a disabled card without levels.
   `skipLevel: true` (DTZ) skips the level step, so its address is #exams/dtz/lesen.
   `levelStep: 'format'` (TestDaF) turns the level step into a format step; such a level entry carries its
   own code, name, description and optional tag instead of using `levels` below.
   `levelRange: 'B2–C1'` is shown on the exam card instead of the list of levels.
   `partLabel: 'aufgabe'` names the parts "Aufgabe 1, 2 …"; without it they are "Teil 1, 2 …". */
window.BA_EXAMS = {
  // Level badges shared by all exams. difficulty is 1–5 stars.
  levels: {
    a1: {
      code: 'A1', difficulty: 1,
      name: { tr: 'Başlangıç', de: 'Anfänger', en: 'Beginner' },
      description: {
        tr: 'Tanıdık günlük ifadeleri ve çok basit cümleleri anlama ve kullanma.',
        de: 'Vertraute Alltagsausdrücke und ganz einfache Sätze verstehen und verwenden.',
        en: 'Understand and use familiar everyday expressions and very simple sentences.'
      }
    },
    a2: {
      code: 'A2', difficulty: 2,
      name: { tr: 'Temel', de: 'Grundlegende Kenntnisse', en: 'Elementary' },
      description: {
        tr: 'Alışveriş, aile, iş gibi sık karşılaşılan konularda basit iletişim kurma.',
        de: 'Sich in häufigen Situationen wie Einkauf, Familie oder Arbeit einfach verständigen.',
        en: 'Communicate simply about frequent topics such as shopping, family and work.'
      }
    },
    b1: {
      code: 'B1', difficulty: 3,
      name: { tr: 'Orta', de: 'Fortgeschrittene Sprachverwendung', en: 'Intermediate' },
      description: {
        tr: 'İş, okul ve boş zamanla ilgili metinlerde ana fikri anlama, deneyimlerini anlatma.',
        de: 'Hauptpunkte zu Arbeit, Schule und Freizeit verstehen und über Erfahrungen berichten.',
        en: 'Understand the main points about work, school and leisure, and describe experiences.'
      }
    },
    b2: {
      code: 'B2', difficulty: 4,
      name: { tr: 'Orta-üstü', de: 'Selbstständige Sprachverwendung', en: 'Upper intermediate' },
      description: {
        tr: 'Karmaşık metinlerin ana fikrini anlama, ayrıntılı ve akıcı biçimde görüş bildirme.',
        de: 'Komplexe Texte verstehen und sich detailliert und fließend äußern.',
        en: 'Understand complex texts and express opinions in detail and fluently.'
      }
    },
    c1: {
      code: 'C1', difficulty: 5,
      name: { tr: 'İleri', de: 'Fachkundige Sprachkenntnisse', en: 'Advanced' },
      description: {
        tr: 'Uzun ve zor metinleri anlama, eğitimde ve işte dili esnek biçimde kullanma.',
        de: 'Lange, anspruchsvolle Texte verstehen und die Sprache in Studium und Beruf flexibel nutzen.',
        en: 'Understand long, demanding texts and use the language flexibly in study and work.'
      }
    },
    'a2-b1': {
      code: 'A2–B1', difficulty: null,
      name: { tr: 'Temel – Orta', de: 'A2 bis B1', en: 'Elementary – Intermediate' },
      description: {
        tr: 'Tek sınav; sonuca göre A2 veya B1 belgesi verilir.',
        de: 'Eine Prüfung; je nach Ergebnis wird A2 oder B1 bescheinigt.',
        en: 'One exam; the result certifies A2 or B1.'
      }
    }
  },

  // Sections (Prüfungsteile). name is German; translation is shown next to it.
  sections: {
    hoeren: {
      name: 'Hören',
      translation: { tr: 'Dinleme', de: 'Hören', en: 'Listening' },
      description: {
        tr: 'Duyuru, konuşma ve röportajlarda ana bilgiyi ve ayrıntıları anlama.',
        de: 'Hauptinformationen und Details in Durchsagen, Gesprächen und Interviews verstehen.',
        en: 'Understand key information and details in announcements, conversations and interviews.'
      }
    },
    lesen: {
      name: 'Lesen',
      translation: { tr: 'Okuma', de: 'Lesen', en: 'Reading' },
      description: {
        tr: 'Kısa notlardan uzun metinlere kadar farklı metin türlerini anlama.',
        de: 'Verschiedene Textsorten von kurzen Notizen bis zu längeren Texten verstehen.',
        en: 'Understand different kinds of text, from short notes to longer articles.'
      }
    },
    sprachbausteine: {
      name: 'Sprachbausteine',
      translation: { tr: 'Dil Yapıları', de: 'Sprachbausteine', en: 'Language elements' },
      description: {
        tr: 'Metindeki boşluklara uygun kelimeyi ve dil bilgisi yapısını seçme.',
        de: 'Passende Wörter und grammatische Strukturen für Lücken in einem Text wählen.',
        en: 'Choose the right word and grammatical structure for gaps in a text.'
      }
    },
    schreiben: {
      name: 'Schreiben',
      translation: { tr: 'Yazma', de: 'Schreiben', en: 'Writing' },
      description: {
        tr: 'Görev yönergesine uygun form, mesaj, e-posta veya metin yazma.',
        de: 'Formulare, Nachrichten, E-Mails oder Texte passend zur Aufgabenstellung schreiben.',
        en: 'Write forms, messages, emails or texts that follow the task instructions.'
      }
    },
    sprechen: {
      name: 'Sprechen',
      translation: { tr: 'Konuşma', de: 'Sprechen', en: 'Speaking' },
      description: {
        tr: 'Kendini tanıtma, bir konuyu anlatma ve karşılıklı konuşma görevleri.',
        de: 'Sich vorstellen, über ein Thema sprechen und gemeinsam etwas aushandeln.',
        en: 'Introduce yourself, talk about a topic and take part in a conversation.'
      }
    }
  },

  // Exams in the order they are shown. Each level lists its sections in exam order.
  exams: [
    {
      id: 'goethe',
      name: 'Goethe-Zertifikat',
      description: {
        tr: 'Goethe-Institut’un dünya genelinde tanınan Almanca sınavları.',
        de: 'Die weltweit anerkannten Deutschprüfungen des Goethe-Instituts.',
        en: 'The internationally recognised German exams of the Goethe-Institut.'
      },
      levels: [
        {
          id: 'a1',
          officialName: 'Goethe-Zertifikat A1: Start Deutsch 1',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Kısa mesajlar · richtig/falsch', de: 'Kurze Nachrichten · richtig/falsch', en: 'Short messages · true/false' },
                exercises: [
                  { set: 'set-1', title: 'Grüße aus dem Urlaub' },
                  { set: 'set-2', title: 'Einladung zum Essen' },
                  { set: 'set-3', title: 'Die neue Wohnung' },
                  { set: 'set-4', title: 'Meine Familie' },
                  { set: 'set-5', title: 'Treffen in der Stadt' },
                ]
              }, // Teil 1
              {
                title: { tr: 'İki ilan · a/b', de: 'Zwei Anzeigen · a/b', en: 'Two adverts · a/b' },
                exercises: [
                  { set: 'set-1', title: 'Einkaufen in der Stadt' },
                  { set: 'set-2', title: 'Freizeit und Termine' },
                  { set: 'set-3', title: 'Essen und Trinken' },
                  { set: 'set-4', title: 'Wohnen und Möbel' },
                  { set: 'set-5', title: 'Reisen und Urlaub' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Tabelalar ve notlar · richtig/falsch', de: 'Schilder und Aushänge · richtig/falsch', en: 'Signs and notices · true/false' },
                exercises: [
                  { set: 'set-1', title: 'In der Stadt' },
                  { set: 'set-2', title: 'Schule und Arztpraxis' },
                  { set: 'set-3', title: 'Supermarkt und Restaurant' },
                  { set: 'set-4', title: 'Im Wohnhaus' },
                  { set: 'set-5', title: 'Unterwegs' },
                ]
              }, // Teil 3
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'a2',
          officialName: 'Goethe-Zertifikat A2',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Gazete haberi · a/b/c', de: 'Zeitungsartikel · a/b/c', en: 'Newspaper article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Die jüngste Bäckerin der Stadt' },
                  { set: 'set-2', title: 'Flohmarkt im Hinterhof' },
                  { set: 'set-3', title: 'Der älteste Läufer im Park' },
                  { set: 'set-4', title: 'Kinoabend im Dorf' },
                  { set: 'set-5', title: 'Die Taxifahrerin mit drei Sprachen' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Bilgi panosu · a/b/c', de: 'Informationstafel · a/b/c', en: 'Information board · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Im Kaufhaus' },
                  { set: 'set-2', title: 'Im Klinikum' },
                  { set: 'set-3', title: 'Am Bahnhof' },
                  { set: 'set-4', title: 'Im Einkaufszentrum' },
                  { set: 'set-5', title: 'In der Volkshochschule' },
                ]
              }, // Teil 2
              {
                title: { tr: 'E-posta · a/b/c', de: 'E-Mail · a/b/c', en: 'Email · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Grüße aus dem Sprachkurs' },
                  { set: 'set-2', title: 'Die neue Wohnung' },
                  { set: 'set-3', title: 'Geburtstag im Park' },
                  { set: 'set-4', title: 'Krank im Bett' },
                  { set: 'set-5', title: 'Ein neues Hobby' },
                ]
              }, // Teil 3
              {
                title: { tr: 'İlanlar · eşleştirme', de: 'Anzeigen · Zuordnung', en: 'Adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Essen gehen' },
                  { set: 'set-2', title: 'Hilfe im Alltag' },
                  { set: 'set-3', title: 'Sport und Bewegung' },
                  { set: 'set-4', title: 'Wohnen auf Zeit' },
                  { set: 'set-5', title: 'Gebraucht kaufen' },
                ]
              }, // Teil 4
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'b1',
          officialName: 'Goethe-Zertifikat B1',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Blog yazısı veya e-posta · richtig/falsch', de: 'Blogbeitrag oder E-Mail · richtig/falsch', en: 'Blog post or email · true/false' },
                exercises: [
                  { set: 'set-1', title: 'Neu im Dorf' },
                  { set: 'set-2', title: 'Ferien im Tierheim' },
                  { set: 'set-3', title: 'Radtour am Fluss' },
                  { set: 'set-4', title: 'Neue Stelle am Meer' },
                  { set: 'set-5', title: 'Schwimmen mit 40' },
                ]
              }, // Teil 1
              {
                title: { tr: 'İki gazete haberi · a/b/c', de: 'Zwei Zeitungsartikel · a/b/c', en: 'Two newspaper articles · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Bibliothek und Gemüsekiste' },
                  { set: 'set-2', title: 'Schulgarten und Nachtbus' },
                  { set: 'set-3', title: 'Reparatur-Café und Handykurs' },
                  { set: 'set-4', title: 'Dorfladen und Müllsammler' },
                  { set: 'set-5', title: 'Schulzirkus und Inklusionshotel' },
                ]
              }, // Teil 2
              {
                title: { tr: 'İlanlar · eşleştirme', de: 'Anzeigen · Zuordnung', en: 'Adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Freizeit und Kurse' },
                  { set: 'set-2', title: 'Wohnen, Arbeit und Hilfe' },
                  { set: 'set-3', title: 'Reisen und Ausflüge' },
                  { set: 'set-4', title: 'Gesundheit und Wohlbefinden' },
                  { set: 'set-5', title: 'Feste und Veranstaltungen' },
                ]
              }, // Teil 3
              {
                title: { tr: 'Okur yorumları · ja/nein', de: 'Leserkommentare · ja/nein', en: 'Reader comments · yes/no' },
                exercises: [
                  { set: 'set-1', title: 'Einkaufen am Sonntag?' },
                  { set: 'set-2', title: 'Handys in der Schule?' },
                  { set: 'set-3', title: 'Autofreie Innenstadt?' },
                  { set: 'set-4', title: 'Homeoffice für alle?' },
                  { set: 'set-5', title: 'Ein Pflichtjahr für alle?' },
                ]
              }, // Teil 4
              {
                title: { tr: 'Kurallar ve bilgiler · a/b/c', de: 'Regeln und Informationen · a/b/c', en: 'Rules and information · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Die Hausordnung' },
                  { set: 'set-2', title: 'Kurse im Sportzentrum' },
                  { set: 'set-3', title: 'Auf dem Campingplatz' },
                  { set: 'set-4', title: 'Mit dem Fernbus unterwegs' },
                  { set: 'set-5', title: 'Termin im Bürgeramt' },
                ]
              }, // Teil 5
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'b2',
          officialName: 'Goethe-Zertifikat B2',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Forum görüşleri · eşleştirme', de: 'Meinungen im Forum · Zuordnung', en: 'Forum opinions · matching' },
                exercises: [
                  { set: 'set-1', title: 'Digitale Auszeit' },
                  { set: 'set-2', title: 'Lernen im Alter' },
                  { set: 'set-3', title: 'Sprachen lernen mit Apps' },
                  { set: 'set-4', title: 'Mehrgenerationenhäuser' },
                  { set: 'set-5', title: 'Weniger Fleisch essen?' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Boşluklu metin · cümle yerleştirme', de: 'Lückentext · Sätze einsetzen', en: 'Gapped text · inserting sentences' },
                exercises: [
                  { set: 'set-1', title: 'Ein Dorf macht seinen Strom selbst' },
                  { set: 'set-2', title: 'Roboter in der Pflege' },
                  { set: 'set-3', title: 'Die Rückkehr der Nachtzüge' },
                  { set: 'set-4', title: 'Ein Museum ohne Eintritt' },
                  { set: 'set-5', title: 'Unverpackt-Läden in der Krise' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Gazete makalesi · a/b/c', de: 'Zeitungsartikel · a/b/c', en: 'Newspaper article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Warum wir Dinge aufschieben' },
                  { set: 'set-2', title: 'Stadtbäume in der Hitze' },
                  { set: 'set-3', title: 'Die Kunst des Zuhörens' },
                  { set: 'set-4', title: 'Wie Städte leiser werden' },
                  { set: 'set-5', title: 'Das Comeback der Handschrift' },
                ]
              }, // Teil 3
              {
                title: { tr: 'Okur görüşleri · eşleştirme', de: 'Leserbriefe · Zuordnung', en: 'Reader comments · matching' },
                exercises: [
                  { set: 'set-1', title: 'Die Vier-Tage-Woche' },
                  { set: 'set-2', title: 'Kostenloser Nahverkehr' },
                  { set: 'set-3', title: 'Programmieren als Pflichtfach?' },
                  { set: 'set-4', title: 'Haustiere im Büro?' },
                  { set: 'set-5', title: 'Schulnoten abschaffen?' },
                ]
              }, // Teil 4
              {
                title: { tr: 'Kurallar · başlık eşleştirme', de: 'Regeln · Überschriften zuordnen', en: 'Rules · matching headings' },
                exercises: [
                  { set: 'set-1', title: 'Regeln im Gemeinschaftsbüro' },
                  { set: 'set-2', title: 'Das Pflichtpraktikum' },
                  { set: 'set-3', title: 'Hinweise für die Ferienwohnung' },
                  { set: 'set-4', title: 'Teilnahme am Stadtlauf' },
                  { set: 'set-5', title: 'Regeln in der offenen Werkstatt' },
                ]
              }, // Teil 5
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
          ]
        },
        {
          id: 'c1',
          officialName: 'Goethe-Zertifikat C1',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Boşluklu metin · a/b/c/d', de: 'Lückentext · a/b/c/d', en: 'Gapped text · a/b/c/d' },
                exercises: [
                  { set: 'set-1', title: 'Schlaf und Gedächtnis' },
                  { set: 'set-2', title: 'Die Sprache der Wale' },
                  { set: 'set-3', title: 'Mikroben im Darm' },
                  { set: 'set-4', title: 'Wie Bäume sich verständigen' },
                  { set: 'set-5', title: 'Die Psychologie des Aufschiebens' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Dergi makalesi · a/b/c', de: 'Zeitschriftenartikel · a/b/c', en: 'Magazine article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Die neue Lust am Reparieren' },
                  { set: 'set-2', title: 'Wenn Algorithmen Bewerbungen lesen' },
                  { set: 'set-3', title: 'Das stille Comeback der Nachtzüge' },
                  { set: 'set-4', title: 'Vom Wert der Langeweile' },
                  { set: 'set-5', title: 'Wer bezahlt den Lokaljournalismus?' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Yorum yazısı · cümle yerleştirme', de: 'Kommentar · Sätze einfügen', en: 'Commentary · inserting sentences' },
                exercises: [
                  { set: 'set-1', title: 'Weniger Parkplätze, mehr Stadt' },
                  { set: 'set-2', title: 'Das Ende der Hausaufgaben?' },
                  { set: 'set-3', title: 'Warum das Bargeld bleiben sollte' },
                  { set: 'set-4', title: 'Volkshochschule ohne Gebühren' },
                  { set: 'set-5', title: 'Die Stadt gehört nicht den Touristen' },
                ]
              }, // Teil 3
              {
                title: { tr: 'Uzman görüşleri · eşleştirme', de: 'Fachbeiträge · Zuordnung', en: 'Expert contributions · matching' },
                exercises: [
                  { set: 'set-1', title: 'Arbeiten im Homeoffice' },
                  { set: 'set-2', title: 'Noten an Hochschulen' },
                  { set: 'set-3', title: 'Künstliche Intelligenz im Unterricht' },
                  { set: 'set-4', title: 'Mehrsprachigkeit in der Kita' },
                  { set: 'set-5', title: 'Wissenschaft und Öffentlichkeit' },
                ]
              }, // Teil 4
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
          ]
        },
      ]
    },
    {
      id: 'telc',
      name: 'telc Deutsch',
      description: {
        tr: 'telc gGmbH’nin Almanca sınavları. B1 ve üzeri seviyelerde ayrıca Sprachbausteine bölümü vardır.',
        de: 'Die Deutschprüfungen der telc gGmbH. Ab B1 gibt es zusätzlich den Teil Sprachbausteine.',
        en: 'The German exams of telc gGmbH. From B1 upwards they also include Sprachbausteine.'
      },
      levels: [
        {
          id: 'a1',
          officialName: 'telc Deutsch A1 · Start Deutsch 1',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Kısa mesajlar · richtig/falsch', de: 'Kurze Nachrichten · richtig/falsch', en: 'Short messages · true/false' },
                exercises: [
                  { set: 'set-1', title: 'Ein neuer Kollege' },
                  { set: 'set-2', title: 'Ein Kindergeburtstag' },
                  { set: 'set-3', title: 'Der Sprachkurs' },
                  { set: 'set-4', title: 'Besuch am Wochenende' },
                  { set: 'set-5', title: 'Ein Tag am See' },
                ]
              }, // Teil 1
              {
                title: { tr: 'İki ilan · a/b', de: 'Zwei Anzeigen · a/b', en: 'Two adverts · a/b' },
                exercises: [
                  { set: 'set-1', title: 'Sport im Verein' },
                  { set: 'set-2', title: 'Kinder und Familie' },
                  { set: 'set-3', title: 'Arbeit und Jobs' },
                  { set: 'set-4', title: 'Kleidung und Geschäfte' },
                  { set: 'set-5', title: 'Bus und Bahn' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Tabelalar ve notlar · richtig/falsch', de: 'Schilder und Aushänge · richtig/falsch', en: 'Signs and notices · true/false' },
                exercises: [
                  { set: 'set-1', title: 'Bibliothek und Museum' },
                  { set: 'set-2', title: 'Bank und Post' },
                  { set: 'set-3', title: 'Im Hotel' },
                  { set: 'set-4', title: 'Apotheke und Friseur' },
                  { set: 'set-5', title: 'Im Büro' },
                ]
              }, // Teil 3
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'a2',
          officialName: 'telc Deutsch A2 · Start Deutsch 2',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Gazete haberi · a/b/c', de: 'Zeitungsmeldung · a/b/c', en: 'News report · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Ein Fest für alle Nachbarn' },
                  { set: 'set-2', title: 'Neue Busse in der Stadt' },
                  { set: 'set-3', title: 'Schwimmkurse für Erwachsene' },
                  { set: 'set-4', title: 'Eine Leihoma für die Familie' },
                  { set: 'set-5', title: 'Mit dem Zug in den Urlaub' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Basın metni · richtig/falsch', de: 'Pressetext · richtig/falsch', en: 'Press text · true/false' },
                exercises: [
                  { set: 'set-1', title: 'Kochen in der Schule' },
                  { set: 'set-2', title: 'Ein Sommer auf dem Bauernhof' },
                  { set: 'set-3', title: 'Ein Kochkurs für Männer' },
                  { set: 'set-4', title: 'Das alte Kino ist wieder offen' },
                  { set: 'set-5', title: 'Jugendliche reparieren Fahrräder' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Durumlar ve ilanlar · eşleştirme', de: 'Situationen und Anzeigen · Zuordnung', en: 'Situations and adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Freizeit am Wochenende' },
                  { set: 'set-2', title: 'Wohnung und Umzug' },
                  { set: 'set-3', title: 'Kurse und Lernen' },
                  { set: 'set-4', title: 'Essen und Feiern' },
                  { set: 'set-5', title: 'Arbeit und Nebenjobs' },
                ]
              }, // Teil 3
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'b1',
          officialName: 'telc Deutsch B1 · Zertifikat Deutsch',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Kısa metinler ve başlıklar · eşleştirme', de: 'Kurztexte und Überschriften · Zuordnung', en: 'Short texts and headlines · matching' },
                exercises: [
                  { set: 'set-1', title: 'Kurznachrichten aus der Region' },
                  { set: 'set-2', title: 'Meldungen aus Alltag und Freizeit' },
                  { set: 'set-3', title: 'Neues aus der Stadt' },
                  { set: 'set-4', title: 'Kurz gemeldet' },
                  { set: 'set-5', title: 'Aus Verein und Nachbarschaft' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Gazete makalesi · a/b/c', de: 'Zeitungsartikel · a/b/c', en: 'Newspaper article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Ein Dorf rettet seinen Laden' },
                  { set: 'set-2', title: 'Großeltern im Internet' },
                  { set: 'set-3', title: 'Ein Jahr ohne Auto' },
                  { set: 'set-4', title: 'Ausbildung mit 40' },
                  { set: 'set-5', title: 'Ein Hobby wird zum Beruf' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Durumlar ve ilanlar · eşleştirme', de: 'Situationen und Anzeigen · Zuordnung', en: 'Situations and adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Kurse und Freizeit' },
                  { set: 'set-2', title: 'Wohnen und Dienstleistungen' },
                  { set: 'set-3', title: 'Reisen und Ausflüge' },
                  { set: 'set-4', title: 'Gesundheit und Sport' },
                  { set: 'set-5', title: 'Arbeit und Weiterbildung' },
                ]
              }, // Teil 3
            ] },
            { id: 'sprachbausteine', teile: [
              {
                title: { tr: 'Mektupta boşluk · a/b/c', de: 'Lückentext im Brief · a/b/c', en: 'Gapped letter · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Eine Bewerbung' },
                  { set: 'set-2', title: 'Ein Brief an die Gastfamilie' },
                  { set: 'set-3', title: 'Eine Beschwerde an den Reiseveranstalter' },
                  { set: 'set-4', title: 'Kündigung im Fitnessstudio' },
                  { set: 'set-5', title: 'Eine Anfrage an die Stadtbibliothek' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Kelime listesiyle boşluk doldurma', de: 'Lückentext mit Wortliste', en: 'Gapped text with word list' },
                exercises: [
                  { set: 'set-1', title: 'Bericht über ein Firmenfest' },
                  { set: 'set-2', title: 'Nachricht an die Vermieterin' },
                  { set: 'set-3', title: 'Aushang im Treppenhaus' },
                  { set: 'set-4', title: 'E-Mail an eine Kollegin' },
                  { set: 'set-5', title: 'Bericht über einen Ausflug' },
                ]
              }, // Teil 2
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'b2',
          officialName: 'telc Deutsch B2',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Kısa metinler ve başlıklar · eşleştirme', de: 'Kurztexte und Überschriften · Zuordnung', en: 'Short texts and headlines · matching' },
                exercises: [
                  { set: 'set-1', title: 'Meldungen aus Wissenschaft und Gesellschaft' },
                  { set: 'set-2', title: 'Nachrichten aus der Arbeitswelt' },
                  { set: 'set-3', title: 'Neues aus Umwelt und Technik' },
                  { set: 'set-4', title: 'Meldungen aus Bildung und Kultur' },
                  { set: 'set-5', title: 'Kurzberichte aus Medizin und Ernährung' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Gazete makalesi · a/b/c', de: 'Zeitungsartikel · a/b/c', en: 'Newspaper article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Eine Auszeit vom Beruf' },
                  { set: 'set-2', title: 'Das Leben als Fernpendler' },
                  { set: 'set-3', title: 'Ein Jahr Freiwilligendienst' },
                  { set: 'set-4', title: 'Die Rückkehr der Mundart' },
                  { set: 'set-5', title: 'Leere Läden, neue Ideen' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Durumlar ve ilanlar · eşleştirme', de: 'Situationen und Anzeigen · Zuordnung', en: 'Situations and adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Weiterbildung und Beruf' },
                  { set: 'set-2', title: 'Kultur und Reisen' },
                  { set: 'set-3', title: 'Haushalt und Finanzen' },
                  { set: 'set-4', title: 'Freizeit und Ehrenamt' },
                  { set: 'set-5', title: 'Medien und Technik' },
                ]
              }, // Teil 3
            ] },
            { id: 'sprachbausteine', teile: [
              {
                title: { tr: 'Mektupta boşluk · a/b/c', de: 'Lückentext im Brief · a/b/c', en: 'Gapped letter · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Eine Reklamation' },
                  { set: 'set-2', title: 'Anfrage an eine Hochschule' },
                  { set: 'set-3', title: 'Bewerbung um ein Praktikum' },
                  { set: 'set-4', title: 'Beschwerde bei der Hausverwaltung' },
                  { set: 'set-5', title: 'Antrag auf Bildungsurlaub' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Kelime listesiyle boşluk doldurma', de: 'Lückentext mit Wortliste', en: 'Gapped text with word list' },
                exercises: [
                  { set: 'set-1', title: 'Rundschreiben an die Belegschaft' },
                  { set: 'set-2', title: 'Leserbrief zur Stadtplanung' },
                  { set: 'set-3', title: 'Bericht über eine Fachtagung' },
                  { set: 'set-4', title: 'Mitteilung des Elternbeirats' },
                  { set: 'set-5', title: 'Offener Brief eines Vereins' },
                ]
              }, // Teil 2
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
        {
          id: 'c1',
          officialName: 'telc Deutsch C1 Hochschule',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'Metni yeniden kurma · cümle yerleştirme', de: 'Textrekonstruktion · Sätze einsetzen', en: 'Text reconstruction · inserting sentences' },
                exercises: [
                  { set: 'set-1', title: 'Wie Zugvögel ihren Weg finden' },
                  { set: 'set-2', title: 'Die Geschichte der Kartografie' },
                  { set: 'set-3', title: 'Wie Vulkane das Klima beeinflussen' },
                  { set: 'set-4', title: 'Die Wissenschaft des Humors' },
                  { set: 'set-5', title: 'Korallenriffe im Wandel' },
                ]
              }, // Teil 1
              {
                title: { tr: 'Seçici okuma · eşleştirme', de: 'Selektives Lesen · Zuordnung', en: 'Selective reading · matching' },
                exercises: [
                  { set: 'set-1', title: 'Forschungsprojekte im Überblick' },
                  { set: 'set-2', title: 'Neue Studiengänge vorgestellt' },
                  { set: 'set-3', title: 'Sommerschulen im Ausland' },
                  { set: 'set-4', title: 'Neue Promotionsprogramme' },
                  { set: 'set-5', title: 'Angebote für Studienanfänger' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Akademik metin · richtig/falsch/nicht im Text', de: 'Wissenschaftlicher Text · richtig/falsch/nicht im Text', en: 'Academic text · true/false/not in text' },
                exercises: [
                  { set: 'set-1', title: 'Macht Musizieren klüger?' },
                  { set: 'set-2', title: 'Wiesen unter Wasser' },
                  { set: 'set-3', title: 'Lassen sich Erdbeben vorhersagen?' },
                  { set: 'set-4', title: 'Kooperation im Tierreich' },
                  { set: 'set-5', title: 'Die Psychologie des Wartens' },
                ]
              }, // Teil 3
            ] },
            { id: 'sprachbausteine', teile: [
              {
                title: { tr: 'Boşluklu akademik metin · a/b/c/d', de: 'Wissenschaftlicher Lückentext · a/b/c/d', en: 'Academic gap text · a/b/c/d' },
                exercises: [
                  { set: 'set-1', title: 'Die Entstehung der Universitäten' },
                  { set: 'set-2', title: 'Plagiate in der Wissenschaft' },
                  { set: 'set-3', title: 'Die Geschichte der Statistik' },
                  { set: 'set-4', title: 'Peer-Review in der Kritik' },
                  { set: 'set-5', title: 'Die Entwicklung des Mikroskops' },
                ]
              }, // Teil 1
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
            ] },
          ]
        },
      ]
    },
    {
      id: 'dtz',
      name: 'DTZ',
      fullName: 'Deutsch-Test für Zuwanderer',
      skipLevel: true,
      description: {
        tr: 'Uyum kursunun sonunda yapılan sınav. Tek sınavda sonuç A2 veya B1 olarak belirlenir.',
        de: 'Die Abschlussprüfung des Integrationskurses. Eine Prüfung, Ergebnis A2 oder B1.',
        en: 'The final exam of the integration course. One exam with an A2 or B1 result.'
      },
      levels: [
        {
          id: 'a2-b1',
          officialName: 'Deutsch-Test für Zuwanderer (DTZ)',
          sections: [
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
            ] },
            { id: 'lesen', teile: [
              {
                title: { tr: 'İçindekiler · a/b/c', de: 'Inhaltsverzeichnis · a/b/c', en: 'Table of contents · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Ratgeber für Neuangekommene' },
                  { set: 'set-2', title: 'Infomappe der Kita' },
                  { set: 'set-3', title: 'Wegweiser im Rathaus' },
                  { set: 'set-4', title: 'Mappe für neue Patienten' },
                  { set: 'set-5', title: 'Handbuch für neue Mitarbeiter' },
                ]
              }, // Teil 1
              {
                title: { tr: 'İlanlar · eşleştirme', de: 'Anzeigen · Zuordnung', en: 'Adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Eine Wohnung finden' },
                  { set: 'set-2', title: 'Arbeit finden' },
                  { set: 'set-3', title: 'Familie und Kinderbetreuung' },
                  { set: 'set-4', title: 'Kurse und Beratung' },
                  { set: 'set-5', title: 'Hilfe im Alltag' },
                ]
              }, // Teil 2
              {
                title: { tr: 'Kısa bilgi metinleri · richtig/falsch ve a/b/c', de: 'Kurze Informationstexte · richtig/falsch und a/b/c', en: 'Short information texts · true/false and a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Neues aus dem Stadtteil' },
                  { set: 'set-2', title: 'Schule und Gesundheit' },
                  { set: 'set-3', title: 'Aus dem Rathaus' },
                  { set: 'set-4', title: 'Arbeit und Ausbildung' },
                  { set: 'set-5', title: 'Rund ums Wohnen' },
                ]
              }, // Teil 3
              {
                title: { tr: 'Bilgi broşürü · a/b/c', de: 'Informationsbroschüre · a/b/c', en: 'Information leaflet · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Ihr Mietvertrag' },
                  { set: 'set-2', title: 'Anmeldung in der Grundschule' },
                  { set: 'set-3', title: 'Der Integrationskurs' },
                  { set: 'set-4', title: 'Krank im Job' },
                  { set: 'set-5', title: 'Hausordnung der Wohnanlage' },
                ]
              }, // Teil 4
              {
                title: { tr: 'Mektupta boşluk doldurma · a/b/c', de: 'Lückentext im Brief · a/b/c', en: 'Gapped letter · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Ein Brief an die Hausverwaltung' },
                  { set: 'set-2', title: 'Eine Nachricht an die Lehrerin' },
                  { set: 'set-3', title: 'Eine E-Mail an das Jobcenter' },
                  { set: 'set-4', title: 'Eine Nachricht an die Nachbarin' },
                  { set: 'set-5', title: 'Eine E-Mail an die Arztpraxis' },
                ]
              }, // Teil 5
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Teil 1
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
          ]
        },
      ]
    },
    {
      id: 'testdaf',
      name: 'TestDaF',
      fullName: 'Test Deutsch als Fremdsprache',
      // One exam from B2 to C1: the card shows this instead of a list of levels.
      levelRange: 'B2–C1',
      // The second step chooses a format instead of a level.
      levelStep: 'format',
      // Parts are called "Aufgabe 1, 2 …" instead of "Teil 1, 2 …".
      partLabel: 'aufgabe',
      description: {
        tr: 'Almanya’da üniversitede okumak isteyenler için akademik Almanca sınavı. Her bölümün sonucu TDN 3, 4 veya 5 olarak verilir.',
        de: 'Die Prüfung für akademisches Deutsch, vor allem für ein Studium in Deutschland. Jeder Prüfungsteil wird mit TDN 3, 4 oder 5 bewertet.',
        en: 'The academic German exam, mainly for studying in Germany. Each section is rated TDN 3, 4 or 5.'
      },
      levels: [
        {
          id: 'digital',
          code: { tr: 'Dijital', de: 'Digital', en: 'Digital' },
          name: { tr: 'Dijital TestDaF', de: 'Digitaler TestDaF', en: 'Digital TestDaF' },
          tag: { tr: 'Yaygın format', de: 'Gängiges Format', en: 'Most common format' },
          description: {
            tr: 'Sınav bir test merkezinde bilgisayarda yapılır.',
            de: 'Die Prüfung wird in einem Testzentrum am Computer abgelegt.',
            en: 'The exam is taken on a computer at a test centre.'
          },
          sections: [
            { id: 'lesen', teile: [
              {
                title: { tr: 'Boşluklu metin · a/b/c/d', de: 'Lückentext · a/b/c/d', en: 'Gapped text · a/b/c/d' },
                exercises: [
                  { set: 'set-1', title: 'Ein Preis für junge Forschende' },
                  { set: 'set-2', title: 'Studieren mit Kind' },
                  { set: 'set-3', title: 'Neue Regeln für Abschlussarbeiten' },
                  { set: 'set-4', title: 'Ein Lernzentrum für alle' },
                  { set: 'set-5', title: 'Ein Forschungsschiff kehrt zurück' },
                ]
              }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2 (Textabschnitte ordnen: sürükle-bırak, şimdilik yok)
              {
                title: { tr: 'Makale · a/b/c', de: 'Artikel · a/b/c', en: 'Article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Die Ökonomie des Teilens' },
                  { set: 'set-2', title: 'Wie Ameisen Wege planen' },
                  { set: 'set-3', title: 'Die Wiederentdeckung des Lehms' },
                  { set: 'set-4', title: 'Wie Kinder Zahlen begreifen' },
                  { set: 'set-5', title: 'Arzneimittel im Wasser' },
                ]
              }, // Aufgabe 3
              {
                title: { tr: 'Dil eylemleri · eşleştirme', de: 'Sprachhandlungen · Zuordnung', en: 'Speech acts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Brauchen wir mehr Präsenzlehre?' },
                  { set: 'set-2', title: 'Offene Daten in der Forschung' },
                  { set: 'set-3', title: 'Pflichtpraktika für alle?' },
                  { set: 'set-4', title: 'Englisch als Wissenschaftssprache' },
                  { set: 'set-5', title: 'Gebühren für Langzeitstudierende' },
                ]
              }, // Aufgabe 4
              {
                title: { tr: 'Kategoriler · eşleştirme', de: 'Kategorien · Zuordnung', en: 'Categories · matching' },
                exercises: [
                  { set: 'set-1', title: 'Drei Wege, Wasserstoff zu speichern' },
                  { set: 'set-2', title: 'Modelle der Studienfinanzierung' },
                  { set: 'set-3', title: 'Drei Methoden der Altersbestimmung' },
                  { set: 'set-4', title: 'Drei Strategien gegen Plastik im Meer' },
                  { set: 'set-5', title: 'Drei Modelle der Hochschulzulassung' },
                ]
              }, // Aufgabe 5
              {
                title: { tr: 'Kavram çifti · a/b', de: 'Begriffspaar · a/b', en: 'Pair of terms · a/b' },
                exercises: [
                  { set: 'set-1', title: 'Gelenke aus dem Drucker' },
                  { set: 'set-2', title: 'Mikroalgen als Nahrungsquelle' },
                  { set: 'set-3', title: 'Versalzene Böden' },
                  { set: 'set-4', title: 'Rätselhafte Kugelblitze' },
                  { set: 'set-5', title: 'Wärme aus Rechenzentren' },
                ]
              }, // Aufgabe 6
              { title: null, exercises: [] }, // Aufgabe 7 (Fehler in der Zusammenfassung: tıklama, şimdilik yok)
            ] },
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
              { title: null, exercises: [] }, // Aufgabe 3
              { title: null, exercises: [] }, // Aufgabe 4
              { title: null, exercises: [] }, // Aufgabe 5
              { title: null, exercises: [] }, // Aufgabe 6
              { title: null, exercises: [] }, // Aufgabe 7
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
              { title: null, exercises: [] }, // Aufgabe 3
              { title: null, exercises: [] }, // Aufgabe 4
              { title: null, exercises: [] }, // Aufgabe 5
              { title: null, exercises: [] }, // Aufgabe 6
              { title: null, exercises: [] }, // Aufgabe 7
            ] },
          ]
        },
        {
          id: 'papier',
          code: { tr: 'Kâğıt', de: 'Papier', en: 'Paper' },
          name: { tr: 'Kâğıt tabanlı TestDaF', de: 'Papierbasierter TestDaF', en: 'Paper-based TestDaF' },
          description: {
            tr: 'Okuma, dinleme ve yazma görevleri kâğıt üzerinde cevaplanır.',
            de: 'Lesen, Hören und Schreiben werden auf Papier bearbeitet.',
            en: 'Reading, listening and writing are answered on paper.'
          },
          sections: [
            { id: 'lesen', teile: [
              {
                title: { tr: 'Kısa metinler · eşleştirme', de: 'Kurztexte · Zuordnung', en: 'Short texts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Sommerschulen für Studierende' },
                  { set: 'set-2', title: 'Beratung an der Hochschule' },
                  { set: 'set-3', title: 'Stipendien und Förderprogramme' },
                  { set: 'set-4', title: 'Angebote der Universitätsbibliothek' },
                  { set: 'set-5', title: 'Praktika in der Forschung' },
                ]
              }, // Aufgabe 1
              {
                title: { tr: 'Makale · a/b/c', de: 'Artikel · a/b/c', en: 'Article · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Grüne Dächer gegen Hitze' },
                  { set: 'set-2', title: 'Wie wir Gesichter erkennen' },
                  { set: 'set-3', title: 'Wenn Gletscher Wasser speichern' },
                  { set: 'set-4', title: 'Die Mathematik des Vogelschwarms' },
                  { set: 'set-5', title: 'Warum wir uns verhören' },
                ]
              }, // Aufgabe 2
              {
                title: { tr: 'Bilimsel metin · Ja/Nein/Text sagt dazu nichts', de: 'Fachtext · Ja/Nein/Text sagt dazu nichts', en: 'Academic text · yes/no/not given' },
                exercises: [
                  { set: 'set-1', title: 'Bakterien als Baustoff' },
                  { set: 'set-2', title: 'Wenn Sprachen verstummen' },
                  { set: 'set-3', title: 'Das Gedächtnis der Böden' },
                  { set: 'set-4', title: 'Placebo ohne Täuschung' },
                  { set: 'set-5', title: 'Wie Städte nachts leuchten' },
                ]
              }, // Aufgabe 3
            ] },
            { id: 'hoeren', teile: [
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
              { title: null, exercises: [] }, // Aufgabe 3
            ] },
            { id: 'schreiben', teile: [
              { title: null, exercises: [] }, // Aufgabe 1
            ] },
            { id: 'sprechen', teile: [
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
              { title: null, exercises: [] }, // Aufgabe 3
              { title: null, exercises: [] }, // Aufgabe 4
              { title: null, exercises: [] }, // Aufgabe 5
              { title: null, exercises: [] }, // Aufgabe 6
              { title: null, exercises: [] }, // Aufgabe 7
            ] },
          ]
        }
      ]
    },
    {
      id: 'oesd',
      name: 'ÖSD',
      fullName: 'Österreichisches Sprachdiplom Deutsch',
      comingSoon: true,
      description: {
        tr: 'Avusturya Dil Diploması sınavları. Hazırlık içeriği yakında eklenecek.',
        de: 'Die Prüfungen des Österreichischen Sprachdiploms. Vorbereitung folgt in Kürze.',
        en: 'The Austrian German Language Diploma exams. Preparation material is coming soon.'
      },
      levels: []
    }
  ]
};
