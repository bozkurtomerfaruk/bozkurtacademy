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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
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
                ]
              }, // Teil 1
              {
                title: { tr: 'İki gazete haberi · a/b/c', de: 'Zwei Zeitungsartikel · a/b/c', en: 'Two newspaper articles · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Bibliothek und Gemüsekiste' },
                  { set: 'set-2', title: 'Schulgarten und Nachtbus' },
                ]
              }, // Teil 2
              {
                title: { tr: 'İlanlar · eşleştirme', de: 'Anzeigen · Zuordnung', en: 'Adverts · matching' },
                exercises: [
                  { set: 'set-1', title: 'Freizeit und Kurse' },
                  { set: 'set-2', title: 'Wohnen, Arbeit und Hilfe' },
                ]
              }, // Teil 3
              {
                title: { tr: 'Okur yorumları · ja/nein', de: 'Leserkommentare · ja/nein', en: 'Reader comments · yes/no' },
                exercises: [
                  { set: 'set-1', title: 'Einkaufen am Sonntag?' },
                  { set: 'set-2', title: 'Handys in der Schule?' },
                ]
              }, // Teil 4
              {
                title: { tr: 'Kurallar ve bilgiler · a/b/c', de: 'Regeln und Informationen · a/b/c', en: 'Rules and information · a/b/c' },
                exercises: [
                  { set: 'set-1', title: 'Die Hausordnung' },
                  { set: 'set-2', title: 'Kurse im Sportzentrum' },
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
              { title: null, exercises: [] }, // Teil 5
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'sprachbausteine', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'sprachbausteine', teile: [
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
            ] },
            { id: 'sprachbausteine', teile: [
              { title: null, exercises: [] }, // Teil 1
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
              { title: null, exercises: [] }, // Teil 1
              { title: null, exercises: [] }, // Teil 2
              { title: null, exercises: [] }, // Teil 3
              { title: null, exercises: [] }, // Teil 4
              { title: null, exercises: [] }, // Teil 5
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
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
              { title: null, exercises: [] }, // Aufgabe 3
              { title: null, exercises: [] }, // Aufgabe 4
              { title: null, exercises: [] }, // Aufgabe 5
              { title: null, exercises: [] }, // Aufgabe 6
              { title: null, exercises: [] }, // Aufgabe 7
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
              { title: null, exercises: [] }, // Aufgabe 1
              { title: null, exercises: [] }, // Aufgabe 2
              { title: null, exercises: [] }, // Aufgabe 3
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
