# Almanca Alfabe ses klipleri

Bu dosya `node scripts/generate-alfabe-audio.mjs` ile üretilir; elle düzenleme. Dinlemek için:
`python3 -m http.server 8765` açıkken `http://localhost:8765/tools/audio-check.html` (sayfa yayına girmez).
Kendi kaydını aynı dosya adıyla `audio/alfabe/` altına koy, sonra `node scripts/generate-alfabe-audio.mjs --index`.

- Klip: 125 (dosyası olan: 125)
- Toplam boyut: 647.5 KB

Okutulan metin: yerel ses üreticisine verilen metin, metinden farklıysa (`data/alfabe.json` → `sesMetni`; `[[ … ]]` fonemdir).
Hedef IPA: harf adının doğru okunuşu. Üretilen fonemler: Piper'ın gerçekten okuduğu (Türkçe motor fonem vermez).
Makine kulağı: konuşma tanımanın (Whisper) en iyi adaydan duyduğu ve benzerlik puanı (1 = birebir). Kulakla kontrol
yerine geçmez; puanı düşük klipleri önce dinle.

| # | Dosya | Dil | Tür | Metin | Okutulan metin | Hedef IPA | Üretilen fonemler | Makine kulağı | Durum | Boyut |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `de/harf-a.mp3` | de | Harf adı | A |  | /aː/ | /ˈɑː./ |  | üretildi (yerel) | 2.9 KB |
| 2 | `de/harf-b.mp3` | de | Harf adı | Be | [[ bˈeː ]] | /beː/ | /bˈeː/ |  | üretildi (yerel) | 3.2 KB |
| 3 | `de/harf-c.mp3` | de | Harf adı | Zeh | [[ tsˈeː ]] | /tseː/ | /tsˈeː/ |  | üretildi (yerel) | 3.7 KB |
| 4 | `de/harf-d.mp3` | de | Harf adı | De |  | /deː/ | /dˈeː./ |  | üretildi (yerel) | 3.0 KB |
| 5 | `de/harf-e.mp3` | de | Harf adı | E |  | /eː/ | /ˈeː./ |  | üretildi (yerel) | 3.0 KB |
| 6 | `de/harf-f.mp3` | de | Harf adı | Ef | [[ ˈɛf ]] | /ɛf/ | /ˈɛf/ |  | üretildi (yerel) | 2.8 KB |
| 7 | `de/harf-g.mp3` | de | Harf adı | Ge | Geh. | /ɡeː/ | /ɡˈeː./ |  | üretildi (yerel) | 2.9 KB |
| 8 | `de/harf-h.mp3` | de | Harf adı | Ha |  | /haː/ | /hˈɑː./ |  | üretildi (yerel) | 3.2 KB |
| 9 | `de/harf-i.mp3` | de | Harf adı | I | Ih. | /iː/ | /ˈiː./ |  | üretildi (yerel) | 3.3 KB |
| 10 | `de/harf-j.mp3` | de | Harf adı | Jot | Jott. | /jɔt/ | /jˈɔt./ |  | üretildi (yerel) | 3.5 KB |
| 11 | `de/harf-k.mp3` | de | Harf adı | Ka | Kah. | /kaː/ | /kˈɑː./ |  | üretildi (yerel) | 3.2 KB |
| 12 | `de/harf-l.mp3` | de | Harf adı | El | Ell. | /ɛl/ | /ˈɛl./ |  | üretildi (yerel) | 3.3 KB |
| 13 | `de/harf-m.mp3` | de | Harf adı | Em | [[ ˈɛm ]] | /ɛm/ | /ˈɛm/ |  | üretildi (yerel) | 3.5 KB |
| 14 | `de/harf-n.mp3` | de | Harf adı | En | [[ ˈɛn ]] | /ɛn/ | /ˈɛn/ |  | üretildi (yerel) | 3.7 KB |
| 15 | `de/harf-o.mp3` | de | Harf adı | O |  | /oː/ | /ˈoː./ |  | üretildi (yerel) | 3.2 KB |
| 16 | `de/harf-p.mp3` | de | Harf adı | Pe |  | /peː/ | /pˈeː./ |  | üretildi (yerel) | 3.5 KB |
| 17 | `de/harf-q.mp3` | de | Harf adı | Kuh | Ku. | /kuː/ | /kˈuː./ |  | üretildi (yerel) | 3.6 KB |
| 18 | `de/harf-r.mp3` | de | Harf adı | Er | [[ ˈɛɾ ]] | /ɛʁ/ | /ˈɛɾ/ |  | üretildi (yerel) | 3.2 KB |
| 19 | `de/harf-s.mp3` | de | Harf adı | Es | Ess. | /ɛs/ | /ˈɛs./ |  | üretildi (yerel) | 3.5 KB |
| 20 | `de/harf-t.mp3` | de | Harf adı | Te |  | /teː/ | /tˈeː./ |  | üretildi (yerel) | 3.5 KB |
| 21 | `de/harf-u.mp3` | de | Harf adı | U | Uh. | /uː/ | /ˈuː./ |  | üretildi (yerel) | 3.3 KB |
| 22 | `de/harf-v.mp3` | de | Harf adı | Vau | Fau. | /faʊ/ | /fˈaʊ./ |  | üretildi (yerel) | 3.5 KB |
| 23 | `de/harf-w.mp3` | de | Harf adı | We |  | /veː/ | /vˈeː./ |  | üretildi (yerel) | 3.2 KB |
| 24 | `de/harf-x.mp3` | de | Harf adı | Ix |  | /ɪks/ | /ˈɪks./ |  | üretildi (yerel) | 3.5 KB |
| 25 | `de/harf-y.mp3` | de | Harf adı | Ypsilon | [[ ˈʏpsilɔn ]] | /ˈʏpsilɔn/ | /ˈʏpsilɔn/ |  | üretildi (yerel) | 5.0 KB |
| 26 | `de/harf-z.mp3` | de | Harf adı | Zett | [[ tsˈɛt ]] | /tsɛt/ | /tsˈɛt/ |  | üretildi (yerel) | 3.5 KB |
| 27 | `de/harf-ae.mp3` | de | Harf adı | Ä |  | /ɛː/ | /ˈɛː./ |  | üretildi (yerel) | 3.0 KB |
| 28 | `de/harf-oe.mp3` | de | Harf adı | Ö | [[ ˈøː ]] | /øː/ | /ˈøː/ |  | üretildi (yerel) | 3.0 KB |
| 29 | `de/harf-ue.mp3` | de | Harf adı | Ü | Üh. | /yː/ | /ˈyː./ |  | üretildi (yerel) | 3.5 KB |
| 30 | `de/harf-eszett.mp3` | de | Harf adı | Eszett | Es-zett. | /ɛsˈtsɛt/ | /ɛstsˈɛt./ |  | üretildi (yerel) | 4.5 KB |
| 31 | `de/kelime-der-apfel.mp3` | de | Kelime | der Apfel |  |  | /dɛɾ ˈapfəl./ | der Apfel (1) | üretildi (yerel) | 4.6 KB |
| 32 | `de/kelime-die-banane.mp3` | de | Kelime | die Banane |  |  | /diː banˈɑːnə./ | die Banane (1) | üretildi (yerel) | 5.3 KB |
| 33 | `de/kelime-der-computer.mp3` | de | Kelime | der Computer |  |  | /dɛɾ kɔmpjˈuːtɜ./ | der Computer (1) | üretildi (yerel) | 5.4 KB |
| 34 | `de/kelime-der-delfin.mp3` | de | Kelime | der Delfin | der [[ dɛlfˈiːn ]]. |  | /dɛɾ dɛlfˈiːn/ | Der Delfin (1) | üretildi (yerel) | 5.7 KB |
| 35 | `de/kelime-die-ente.mp3` | de | Kelime | die Ente |  |  | /diː ˈɛntə./ | Die Ente. (1) | üretildi (yerel) | 4.3 KB |
| 36 | `de/kelime-der-fisch.mp3` | de | Kelime | der Fisch |  |  | /dɛɾ fˈɪʃ./ | der Fisch (1) | üretildi (yerel) | 4.6 KB |
| 37 | `de/kelime-die-giraffe.mp3` | de | Kelime | die Giraffe | die [[ ʒirˈafə ]]. |  | /diː ʒirˈafə/ | die Giraffe. (1) | üretildi (yerel) | 5.3 KB |
| 38 | `de/kelime-der-hund.mp3` | de | Kelime | der Hund |  |  | /dɛɾ hˈʊnt./ | Der Hund (1) | üretildi (yerel) | 4.3 KB |
| 39 | `de/kelime-der-igel.mp3` | de | Kelime | der Igel |  |  | /dɛɾ ˈiːɡəl./ | der Igel (1) | üretildi (yerel) | 4.5 KB |
| 40 | `de/kelime-die-jacke.mp3` | de | Kelime | die Jacke |  |  | /diː jˈakə./ | Die Jacke (1) | üretildi (yerel) | 4.5 KB |
| 41 | `de/kelime-die-katze.mp3` | de | Kelime | die Katze |  |  | /diː kˈatsə./ | Die Katze (1) | üretildi (yerel) | 4.7 KB |
| 42 | `de/kelime-der-loewe.mp3` | de | Kelime | der Löwe |  |  | /dɛɾ lˈøːvə./ | Der Löwe (1) | üretildi (yerel) | 4.5 KB |
| 43 | `de/kelime-die-maus.mp3` | de | Kelime | die Maus |  |  | /diː mˈaʊs./ | Die Maus (1) | üretildi (yerel) | 4.5 KB |
| 44 | `de/kelime-die-nase.mp3` | de | Kelime | die Nase |  |  | /diː nˈɑːzə./ | Die Nase (1) | üretildi (yerel) | 4.7 KB |
| 45 | `de/kelime-die-orange.mp3` | de | Kelime | die Orange | die [[ oːrˈaŋʒə ]]. |  | /diː oːrˈaŋʒə/ | Die Orange. (1) | üretildi (yerel) | 5.6 KB |
| 46 | `de/kelime-der-pinguin.mp3` | de | Kelime | der Pinguin | der [[ pˈɪŋɡuiːn ]]. |  | /dɛɾ pˈɪŋɡuiːn/ | der Pinguin (1) | üretildi (yerel) | 5.3 KB |
| 47 | `de/kelime-das-quadrat.mp3` | de | Kelime | das Quadrat |  |  | /das kvadrˈɑːt./ | das Quadrat. (1) | üretildi (yerel) | 5.4 KB |
| 48 | `de/kelime-die-rakete.mp3` | de | Kelime | die Rakete | die [[ rakˈeːtə ]]. |  | /diː rakˈeːtə/ | die Rakete. (1) | üretildi (yerel) | 5.3 KB |
| 49 | `de/kelime-die-sonne.mp3` | de | Kelime | die Sonne |  |  | /diː zˈɔnə./ | Die Sonne (1) | üretildi (yerel) | 4.6 KB |
| 50 | `de/kelime-die-tomate.mp3` | de | Kelime | die Tomate |  |  | /diː toːmˈɑːtə./ | die Tomate (1) | üretildi (yerel) | 4.7 KB |
| 51 | `de/kelime-die-uhr.mp3` | de | Kelime | die Uhr |  |  | /diː ˈuːɾ./ | die Uhr (1) | üretildi (yerel) | 4.3 KB |
| 52 | `de/kelime-der-vogel.mp3` | de | Kelime | der Vogel |  |  | /dɛɾ fˈoːɡəl./ | der Vogel (1) | üretildi (yerel) | 4.6 KB |
| 53 | `de/kelime-der-wal.mp3` | de | Kelime | der Wal |  |  | /dɛɾ vˈɑːl./ | der Wahl (0.93) | üretildi (yerel) | 4.3 KB |
| 54 | `de/kelime-das-taxi.mp3` | de | Kelime | das Taxi |  |  | /das tˈaksiː./ | Das Taxi (1) | üretildi (yerel) | 5.3 KB |
| 55 | `de/kelime-das-yo-yo.mp3` | de | Kelime | das Yo-Yo |  |  | /das jˈoːjˈoː./ | Das Yo-Yo. (1) | üretildi (yerel) | 5.6 KB |
| 56 | `de/kelime-das-zebra.mp3` | de | Kelime | das Zebra | das [[ tsˈeːbrɑː ]]. |  | /das tsˈeːbrɑː/ | Das Zebra. (1) | üretildi (yerel) | 5.6 KB |
| 57 | `de/kelime-der-baer.mp3` | de | Kelime | der Bär |  |  | /dɛɾ bˈɛːɾ./ | Der Bär (1) | üretildi (yerel) | 4.5 KB |
| 58 | `de/kelime-die-moehre.mp3` | de | Kelime | die Möhre |  |  | /diː mˈøːrə./ | Die Möhre. (1) | üretildi (yerel) | 4.3 KB |
| 59 | `de/kelime-der-wuerfel.mp3` | de | Kelime | der Würfel |  |  | /dɛɾ vˈʏɾfəl./ | der Würfel (1) | üretildi (yerel) | 4.7 KB |
| 60 | `de/kelime-der-fuss.mp3` | de | Kelime | der Fuß |  |  | /dɛɾ fˈuːs./ | der Fuß (1) | üretildi (yerel) | 4.6 KB |
| 61 | `de/kelime-die-adresse.mp3` | de | Kelime | die Adresse |  |  | /diː adrˈɛsə./ | Die Adresse (1) | üretildi (yerel) | 5.3 KB |
| 62 | `de/kelime-der-bahnhof.mp3` | de | Kelime | der Bahnhof |  |  | /dɛɾ bˈɑːnhoːf./ | der Bahnhof (1) | üretildi (yerel) | 5.4 KB |
| 63 | `de/kelime-das-cafe.mp3` | de | Kelime | das Café |  |  | /das kafˈeː./ | das Kaffee (0.67) | üretildi (yerel) | 5.3 KB |
| 64 | `de/kelime-die-dusche.mp3` | de | Kelime | die Dusche |  |  | /diː dˈuːʃə./ | die Dusche (1) | üretildi (yerel) | 4.7 KB |
| 65 | `de/kelime-die-e-mail.mp3` | de | Kelime | die E-Mail |  |  | /diː ˈeːmˈeɪl./ | Die E-Mail (1) | üretildi (yerel) | 4.7 KB |
| 66 | `de/kelime-das-formular.mp3` | de | Kelime | das Formular |  |  | /das fˌɔɾmuːlˈɑːɾ./ | das Formular. (1) | üretildi (yerel) | 5.6 KB |
| 67 | `de/kelime-das-geld.mp3` | de | Kelime | das Geld |  |  | /das ɡˈɛlt./ | Das Geld. (1) | üretildi (yerel) | 4.6 KB |
| 68 | `de/kelime-das-handy.mp3` | de | Kelime | das Handy |  |  | /das hˈɛndiː./ | Das Handy (1) | üretildi (yerel) | 4.9 KB |
| 69 | `de/kelime-die-information.mp3` | de | Kelime | die Information |  |  | /diː ˌɪnfɔɾmatsjˈoːn./ | Die Information (1) | üretildi (yerel) | 6.8 KB |
| 70 | `de/kelime-der-job.mp3` | de | Kelime | der Job |  |  | /dɛɾ dʒˈɒb./ | der Job. (1) | üretildi (yerel) | 4.3 KB |
| 71 | `de/kelime-die-krankenkasse.mp3` | de | Kelime | die Krankenkasse |  |  | /diː krˈankənkˌasə./ | die Krankenkasse (1) | üretildi (yerel) | 7.3 KB |
| 72 | `de/kelime-der-lebenslauf.mp3` | de | Kelime | der Lebenslauf |  |  | /dɛɾ lˈeːbənslˌaʊf./ | Der Lebenslauf (1) | üretildi (yerel) | 5.7 KB |
| 73 | `de/kelime-die-miete.mp3` | de | Kelime | die Miete |  |  | /diː mˈiːtə./ | Die Miete (1) | üretildi (yerel) | 4.3 KB |
| 74 | `de/kelime-der-nachname.mp3` | de | Kelime | der Nachname |  |  | /dɛɾ nˈaxnɑːmə./ | der Nachname (1) | üretildi (yerel) | 6.0 KB |
| 75 | `de/kelime-der-ort.mp3` | de | Kelime | der Ort |  |  | /dɛɾ ˈɔɾt./ | der Ort (1) | üretildi (yerel) | 4.0 KB |
| 76 | `de/kelime-die-postleitzahl.mp3` | de | Kelime | die Postleitzahl |  |  | /diː pˈɔstlaɪtsˌɑːl./ | Die Postleitzahl (1) | üretildi (yerel) | 7.1 KB |
| 77 | `de/kelime-die-quittung.mp3` | de | Kelime | die Quittung |  |  | /diː kvˈɪtʊŋ./ | Die Quittung (1) | üretildi (yerel) | 4.6 KB |
| 78 | `de/kelime-das-rathaus.mp3` | de | Kelime | das Rathaus | das [[ rˈɑːthaʊs ]]. |  | /das rˈɑːthaʊs/ | das Rathaus (1) | üretildi (yerel) | 6.3 KB |
| 79 | `de/kelime-der-supermarkt.mp3` | de | Kelime | der Supermarkt |  |  | /dɛɾ zˈuːpɜmˌaɾkt./ | der Supermarkt (1) | üretildi (yerel) | 5.9 KB |
| 80 | `de/kelime-der-termin.mp3` | de | Kelime | der Termin |  |  | /dɛɾ tɛɾmˈiːn./ | der Termin. (1) | üretildi (yerel) | 5.0 KB |
| 81 | `de/kelime-die-unterschrift.mp3` | de | Kelime | die Unterschrift |  |  | /diː ˈʊntɜʃrˌɪft./ | Die Unterschrift (1) | üretildi (yerel) | 6.1 KB |
| 82 | `de/kelime-der-vertrag.mp3` | de | Kelime | der Vertrag |  |  | /dɛɾ fɛɾtrˈɑːk./ | der Vertrag (1) | üretildi (yerel) | 5.3 KB |
| 83 | `de/kelime-die-wohnung.mp3` | de | Kelime | die Wohnung |  |  | /diː vˈoːnʊŋ./ | die Wohnung (1) | üretildi (yerel) | 4.5 KB |
| 84 | `de/kelime-die-praxis.mp3` | de | Kelime | die Praxis |  |  | /diː prˈaksɪs./ | die Praxis. (1) | üretildi (yerel) | 5.4 KB |
| 85 | `de/kelime-das-gymnasium.mp3` | de | Kelime | das Gymnasium |  |  | /das ɡʏmnˈɑziːˌʊm./ | Das Gymnasium (1) | üretildi (yerel) | 6.7 KB |
| 86 | `de/kelime-der-zug.mp3` | de | Kelime | der Zug |  |  | /dɛɾ tsˈuːk./ | der Zug (1) | üretildi (yerel) | 4.5 KB |
| 87 | `de/kelime-die-aenderung.mp3` | de | Kelime | die Änderung |  |  | /diː ˈɛndərˌʊŋ./ | Die Änderung (1) | üretildi (yerel) | 5.0 KB |
| 88 | `de/kelime-die-oeffnungszeiten.mp3` | de | Kelime | die Öffnungszeiten |  |  | /diː ˈœfnʊŋstsˌaɪtən./ | Die Öffnungszeiten (1) | üretildi (yerel) | 7.8 KB |
| 89 | `de/kelime-die-ueberweisung.mp3` | de | Kelime | die Überweisung |  |  | /diː ˌyːbɜvˈaɪzʊŋ./ | Die Überweisung (1) | üretildi (yerel) | 6.0 KB |
| 90 | `de/kelime-die-strasse.mp3` | de | Kelime | die Straße |  |  | /diː ʃtrˈɑːsə./ | die Straße (1) | üretildi (yerel) | 5.0 KB |
| 91 | `de/isaret-at.mp3` | de | İşaret | ät | Ät. |  | /ˈɛːt./ | It (0.5) | üretildi (yerel) | 3.0 KB |
| 92 | `de/isaret-punkt.mp3` | de | İşaret | Punkt |  |  | /pˈʊŋkt./ | Punkt. (1) | üretildi (yerel) | 3.9 KB |
| 93 | `de/isaret-bindestrich.mp3` | de | İşaret | Bindestrich |  |  | /bˈɪndəʃtrˌɪç./ | Bindestrick (0.91) | üretildi (yerel) | 4.6 KB |
| 94 | `de/soru-wie-ist-ihr-nachname.mp3` | de | Senaryo sorusu | Wie ist Ihr Nachname? |  |  | /viː ɪst iːɾ nˈaxnɑːmə?/ | Wie ist Ihr Nachname? (1) | üretildi (yerel) | 7.5 KB |
| 95 | `de/cevap-oeztuerk.mp3` | de | Senaryo cevabı | Öztürk | Ös-türk. |  | /ˈøːstˈʏɾk./ | ÖSTÜRK (0.83) | üretildi (yerel) | 4.9 KB |
| 96 | `de/soru-wie-schreibt-man-das.mp3` | de | Senaryo sorusu | Wie schreibt man das? |  |  | /viː ʃrˈaɪpt man das?/ | Wie schreibt man das? (1) | üretildi (yerel) | 6.8 KB |
| 97 | `de/cevap-demir.mp3` | de | Senaryo cevabı | Demir | [[ dˈeːmiːɾ ]]. |  | /dˈeːmiːɾ/ | DENIER (0.73) | üretildi (yerel) | 4.0 KB |
| 98 | `de/soru-wie-schreibt-man-ihren-namen.mp3` | de | Senaryo sorusu | Wie schreibt man Ihren Namen? |  |  | /viː ʃrˈaɪpt man ˌiːrən nˈɑːmən?/ | Wie schreibt man ihren Namen? (1) | üretildi (yerel) | 8.7 KB |
| 99 | `de/cevap-schulze.mp3` | de | Senaryo cevabı | Schulze |  |  | /ʃˈʊltsə./ | Schulze (1) | üretildi (yerel) | 4.9 KB |
| 100 | `de/soru-und-ihr-vorname.mp3` | de | Senaryo sorusu | Und Ihr Vorname? |  |  | /ʊnt iːɾ fˈɔɾnɑːmə?/ | Und Ihr Vorname? (1) | üretildi (yerel) | 6.4 KB |
| 101 | `de/cevap-yusuf.mp3` | de | Senaryo cevabı | Yusuf |  |  | /jˈuːzuːf./ | Yousuf (0.91) | üretildi (yerel) | 4.3 KB |
| 102 | `de/soru-wie-heisst-sie.mp3` | de | Senaryo sorusu | Wie heißt sie? |  |  | /viː hˈaɪst ziː?/ | Wie heißt sie? (1) | üretildi (yerel) | 5.2 KB |
| 103 | `de/cevap-jana.mp3` | de | Senaryo cevabı | Jana |  |  | /jˈɑnɑː./ | Jana (1) | üretildi (yerel) | 4.0 KB |
| 104 | `de/soru-wie-ist-ihr-vorname.mp3` | de | Senaryo sorusu | Wie ist Ihr Vorname? |  |  | /viː ɪst iːɾ fˈɔɾnɑːmə?/ | Wie ist Ihr Vorname? (1) | üretildi (yerel) | 7.0 KB |
| 105 | `de/cevap-volker.mp3` | de | Senaryo cevabı | Volker |  |  | /fˈɔlkɜ./ | Volker (1) | üretildi (yerel) | 4.6 KB |
| 106 | `de/soru-wie-ist-ihre-e-mail-adresse.mp3` | de | Senaryo sorusu | Wie ist Ihre E-Mail-Adresse? |  |  | /viː ɪst ˌiːrə ˈeːmˈeɪladrˈɛsə?/ | Wie ist Ihre E-Mail-Adresse? (1) | üretildi (yerel) | 9.2 KB |
| 107 | `de/cevap-mia-wolf-web-de.mp3` | de | Senaryo cevabı | mia Punkt wolf ät web Punkt de | mia Punkt wolf Ät web Punkt de. |  | /mˈiːɑː pˈʊŋkt vˈɔlf ˈɛːt wˈɛp pˈʊŋkt dˈeː./ | Mia.Wolfitweb.de (0.9) | üretildi (yerel) | 11.9 KB |
| 108 | `de/soru-koennen-sie-das-buchstabieren.mp3` | de | Senaryo sorusu | Können Sie das buchstabieren? |  |  | /kˌœnən ziː das bˌuːxʃtɑːbˈiːrən?/ | Können Sie das Buchstabieren? (1) | üretildi (yerel) | 8.2 KB |
| 109 | `de/cevap-info-zug-de.mp3` | de | Senaryo cevabı | info ät zug Punkt de | info Ät zug Punkt de. |  | /ˈɪnfoː ˈɛːt tsˈuːk pˈʊŋkt dˈeː./ | Info-Rzug.de (0.87) | üretildi (yerel) | 8.7 KB |
| 110 | `de/soru-in-welcher-strasse-wohnen-sie.mp3` | de | Senaryo sorusu | In welcher Straße wohnen Sie? |  |  | /ɪn vˈɛlçɜ ʃtrˈɑːsə vˈoːnən ziː?/ | In welcher Straße wohnen Sie? (1) | üretildi (yerel) | 9.7 KB |
| 111 | `de/cevap-gartenstrasse.mp3` | de | Senaryo cevabı | Gartenstraße |  |  | /ɡˈaɾtənstrˌɑːsə./ | Gartenstraße (1) | üretildi (yerel) | 6.6 KB |
| 112 | `de/soru-wo-wohnen-sie.mp3` | de | Senaryo sorusu | Wo wohnen Sie? |  |  | /vˌoː vˈoːnən ziː?/ | Wo wohnen Sie? (1) | üretildi (yerel) | 5.4 KB |
| 113 | `de/cevap-wuerzburg.mp3` | de | Senaryo cevabı | Würzburg |  |  | /vˈʏɾtsbʊɐk./ | Würzburg (1) | üretildi (yerel) | 5.0 KB |
| 114 | `de/soru-wie-heisst-die-strasse.mp3` | de | Senaryo sorusu | Wie heißt die Straße? |  |  | /viː hˈaɪst diː ʃtrˈɑːsə?/ | Wie heißt die Straße? (1) | üretildi (yerel) | 7.3 KB |
| 115 | `de/cevap-lindenweg.mp3` | de | Senaryo cevabı | Lindenweg |  |  | /lˈɪndənvˌeːk./ | Lindenweg (1) | üretildi (yerel) | 5.6 KB |
| 116 | `de/richtig.mp3` | de | Geri bildirim | Richtig! |  |  | /rˈɪçtɪç!/ | Richtig! (1) | üretildi (yerel) | 3.9 KB |
| 117 | `tr/talimat-kesfet.mp3` | tr | Talimat | Bir harfe dokun ve dinle. | Bir harfe dokun ve dinle. |  |  | Bir harfe dokun ve dinle. (1) | üretildi (yerel) | 8.8 KB |
| 118 | `tr/talimat-duy.mp3` | tr | Talimat | Dinle ve doğru harfe dokun. | Dinle ve doğru harfe dokun. |  |  | Dinle ve doğru harfe dokun. (1) | üretildi (yerel) | 13.6 KB |
| 119 | `tr/talimat-ilk-harf.mp3` | tr | Talimat | Bu kelime hangi harfle başlıyor? |  |  |  | Bu kelime hangi harfle başlıyor? (1) | üretildi (yerel) | 12.3 KB |
| 120 | `tr/talimat-heceleme.mp3` | tr | Talimat | Harfleri dinle ve kelimeyi kur. | Harfleri dinle ve kelimeyi kur. |  |  | Harfleri dinle ve kelimeyi kur. (1) | üretildi (yerel) | 10.6 KB |
| 121 | `tr/talimat-sirala.mp3` | tr | Talimat | Harfleri sıraya diz. | Harfleri sıraya diz. |  |  | Harfleri sıraya diz. (1) | üretildi (yerel) | 8.7 KB |
| 122 | `tr/dogru.mp3` | tr | Geri bildirim | Doğru! |  |  |  | Doğru. (1) | üretildi (yerel) | 4.0 KB |
| 123 | `tr/dogru-cevap.mp3` | tr | Geri bildirim | Doğru cevap: |  |  |  | Doğru cevap? (1) | üretildi (yerel) | 6.6 KB |
| 124 | `tr/supersin.mp3` | tr | Geri bildirim | Süpersin! |  |  |  | süpersin (1) | üretildi (yerel) | 5.4 KB |
| 125 | `tr/aferin.mp3` | tr | Geri bildirim | Aferin! |  |  |  | Aferin. (1) | üretildi (yerel) | 5.0 KB |
