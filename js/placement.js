// Seviye tespit sınavı (#seviye-testi) ve yönetim sayfasının yönlendirmesi (#yonetim/seviye-testleri).
// Sorular data/seviye-testi/sorular.json'da. Bloklar A1 → C1; bir blokta en az passCorrect doğru
// yapan sonraki bloğa geçer. İlerleme localStorage'da (baPlacement) tutulur, sayfa yenilenince devam eder.
// Firebase sadece "Sonucu gönder"e basılınca yüklenir (js/account/placement-submit.js).
(() => {
  const root = document.getElementById('placementApp');
  if(!root) return;

  const KEY = 'baPlacement';
  const SENT_KEY = 'baPlacementSent';
  const COOLDOWN_MS = 10 * 60 * 1000;
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const UNKNOWN = '?';

  const strings = {
    tr: {
      plLinkHome: 'Seviyeni ölç',
      plPromoTitle: 'Ders almadan önce seviyeni ölç',
      plPromoText: '5–25 dakikalık seviye testi: sonuç bana ulaşır, ilk dersi buna göre planlarım.',
      plPromoButton: 'Seviye testine başla',
      plLinkContact: 'Seviyeni bilmiyor musun? Önce seviye testini çöz.',
      plTitle: 'Seviye tespit sınavı',
      plLead: 'İlk dersten önce Almanca seviyeni tahmin etmek için kısa bir test. Sonucu ben görüyorum ve ilk dersi buna göre hazırlıyorum.',
      plInfo1: 'Beş bölüm: A1, A2, B1, B2, C1. Her bölümde 10 soru, bir de kısa okuma metni.',
      plInfo2: 'Bir bölümde en az 6 doğru yaparsan sonraki bölüme geçersin; yapamazsan test orada biter.',
      plInfo3: 'Başlangıç seviyesinde yaklaşık 5 dakika, ileri seviyede en fazla 25 dakika sürer. Süre sınırı yok.',
      plInfo4: 'Bilmediğin soruda tahmin etme, “Bilmiyorum”u seç. Böylece sonuç daha doğru olur.',
      plInfo5: 'Sayfayı kapatırsan veya yenilersen kaldığın yerden devam edersin.',
      plStart: 'Teste başla',
      plSkip: 'Hiç Almanca bilmiyorum',
      plSkipNote: 'Testi atlar ve doğrudan iletişim formuna geçersin.',
      plBlock: 'Bölüm {n} / {total}',
      plBlockHint: 'Her soruda boşluğa veya soruya uyan seçeneği işaretle.',
      plReading: 'Okuma metni',
      plReadingHint: 'Metni oku ve soruları cevapla.',
      plDontKnow: 'Bilmiyorum',
      plFinishBlock: 'Bölümü bitir',
      plUnanswered: '{n} soru cevapsız. Bilmiyorsan “Bilmiyorum”u seç.',
      plRestart: 'Testi baştan başlat',
      plRestartConfirm: 'Cevapların silinecek ve test baştan başlayacak. Emin misin?',
      plQuestion: 'Soru {n}',
      plWritingTitle: 'Kısa bir yazı (isteğe bağlı)',
      plWritingLead: 'Almanca olarak kendini tanıt ve neden Almanca öğrenmek istediğini yaz. Bu bölüm puanlanmıyor; yazını ben okuyacağım.',
      plWritingExpected: 'Senin seviyen için beklenen uzunluk: {range} kelime.',
      plWritingLabel: 'Yazın',
      plWords: '{n} kelime',
      plContinue: 'Devam',
      plSkipWriting: 'Bu bölümü atla',
      plResultTitle: 'Tahmini seviyen',
      plNear: '{level} – {next} seviyesine yakın',
      plA0: 'Başlangıç (A0)',
      plDescA0: 'Almancaya yeni başlıyorsun. İlk derslerde tanışma, sayılar ve günlük ifadelerle temelden başlayacağız.',
      plDescA1: 'Temel cümleleri ve günlük ifadeleri anlıyorsun. Sıradaki adım geçmiş zaman, Dativ ve yan cümleler.',
      plDescA2: 'Günlük konularda kısa metinleri anlıyor, basit yapıları kullanıyorsun. Sıradaki adım daha uzun cümleler ve yeni bağlaçlar.',
      plDescB1: 'Tanıdık konularda rahatça okuyor ve yapıların çoğunu kullanıyorsun. Sıradaki adım daha resmî dil ve ayrıntılı metinler.',
      plDescB2: 'Zor metinleri de büyük ölçüde anlıyorsun. Sıradaki adım akademik ve iş dilinde incelikler.',
      plDescC1: 'Testin en zor bölümünü de geçtin. Derslerde sınav, iş veya akademik hedefine göre ileri konulara odaklanacağız.',
      plWeakTitle: 'Zorlandığın konular',
      plWeakNone: 'Çözdüğün bölümlerde belirgin bir zayıf konu çıkmadı.',
      plWeakCount: '{n} yanlış',
      plDisclaimer: 'Bu tahmini bir sonuçtur; kesin seviyeni ilk derste birlikte belirleyeceğiz.',
      plBlocksTitle: 'Bölümlere göre doğru sayın',
      plFormTitle: 'Sonucunu bana gönder',
      plFormLead: 'Sonucunu ve aşağıdaki bilgileri sadece ben görüyorum. İlk dersi planlamak için kullanıyorum.',
      plName: 'Ad soyad',
      plEmail: 'E-posta',
      plGoal: 'Almanca öğrenme hedefin',
      plChoose: 'Seç…',
      plGoalDaily: 'Günlük hayat',
      plGoalExam: 'Sınav',
      plGoalWork: 'İş',
      plGoalSchool: 'Okul / üniversite',
      plGoalOther: 'Diğer',
      plExamName: 'Sınav adı (varsa)',
      plExamNamePlaceholder: 'ör. Goethe B1, telc B2, TestDaF',
      plExamDate: 'Sınav tarihi (varsa)',
      plExperience: 'Daha önce ne kadar süre Almanca öğrendin?',
      plExpNone: 'Hiç',
      plExpLt6m: '6 aydan az',
      plExp6to12m: '6–12 ay',
      plExp1to2y: '1–2 yıl',
      plExpGt2y: '2 yıldan fazla',
      plNote: 'Not (isteğe bağlı)',
      plNotePlaceholder: 'Zorlandığın beceriler, uygun gün ve saatler …',
      plConsentBefore: 'Bilgilerimin ve test sonucumun ders planlaması için saklanmasını kabul ediyorum (en fazla 6 ay). ',
      plConsentLink: 'Gizlilik politikası',
      plSubmit: 'Sonucu gönder',
      plSending: 'Gönderiliyor…',
      plErrName: 'Adını yaz (en az 2 karakter).',
      plErrEmail: 'Geçerli bir e-posta adresi yaz.',
      plErrGoal: 'Bir hedef seç.',
      plErrExperience: 'Bir süre seç.',
      plErrConsent: 'Göndermek için onay kutusunu işaretle.',
      plErrDate: 'Tarihi YYYY-AA-GG biçiminde yaz ya da boş bırak.',
      plErrForm: 'Lütfen işaretli alanları düzelt.',
      plErrCooldown: 'Kısa süre önce bir sonuç gönderdin. 10 dakika sonra tekrar deneyebilir ya da bana e-postayla yazabilirsin.',
      plErrSend: 'Sonuç gönderilemedi. Biraz sonra tekrar dene ya da bozkurtt.omerfaruk@gmail.com adresine yaz.',
      plDoneTitle: 'Teşekkürler!',
      plDoneText: 'Sonucun bana ulaştı, en kısa sürede dönüş yapacağım.',
      plDoneContact: 'İlk ders için bana e-postayla da ulaşabilirsin:',
      plDoneContactPage: 'İletişim sayfası',
      plDoneAgain: 'Testi yeniden çöz',
      plLoadError: 'Sorular yüklenemedi. Sayfayı yenileyip tekrar dene.',
      plWritingPrompt: 'Stell dich kurz vor und schreib, warum du Deutsch lernen möchtest.',
      plTopicLesen: 'Okuma',
      plTopicWortschatz: 'Kelime bilgisi',
      adminNoAccess: 'Bu sayfaya erişimin yok.',
      adminLoading: 'Yükleniyor…'
    },
    de: {
      plLinkHome: 'Niveau testen',
      plPromoTitle: 'Teste dein Niveau vor der ersten Stunde',
      plPromoText: 'Einstufungstest in 5–25 Minuten: Das Ergebnis kommt bei mir an, und ich plane die erste Stunde danach.',
      plPromoButton: 'Einstufungstest starten',
      plLinkContact: 'Du kennst dein Niveau nicht? Mach zuerst den Einstufungstest.',
      plTitle: 'Einstufungstest',
      plLead: 'Ein kurzer Test, um dein Deutschniveau vor der ersten Stunde einzuschätzen. Ich sehe das Ergebnis und bereite die erste Stunde danach vor.',
      plInfo1: 'Fünf Teile: A1, A2, B1, B2, C1. In jedem Teil 10 Fragen, darunter ein kurzer Lesetext.',
      plInfo2: 'Mit mindestens 6 richtigen Antworten kommst du in den nächsten Teil, sonst endet der Test dort.',
      plInfo3: 'Für Anfänger etwa 5 Minuten, für Fortgeschrittene höchstens 25 Minuten. Es gibt kein Zeitlimit.',
      plInfo4: 'Wenn du eine Antwort nicht weißt, rate nicht, sondern wähle „Weiß ich nicht“. So wird das Ergebnis genauer.',
      plInfo5: 'Wenn du die Seite schließt oder neu lädst, machst du dort weiter, wo du warst.',
      plStart: 'Test starten',
      plSkip: 'Ich kann noch gar kein Deutsch',
      plSkipNote: 'Du überspringst den Test und gehst direkt zum Formular.',
      plBlock: 'Teil {n} / {total}',
      plBlockHint: 'Markiere bei jeder Frage die passende Antwort.',
      plReading: 'Lesetext',
      plReadingHint: 'Lies den Text und beantworte die Fragen.',
      plDontKnow: 'Weiß ich nicht',
      plFinishBlock: 'Teil abschließen',
      plUnanswered: '{n} Fragen sind noch offen. Wenn du es nicht weißt, wähle „Weiß ich nicht“.',
      plRestart: 'Test neu starten',
      plRestartConfirm: 'Deine Antworten werden gelöscht und der Test beginnt von vorn. Bist du sicher?',
      plQuestion: 'Frage {n}',
      plWritingTitle: 'Ein kurzer Text (freiwillig)',
      plWritingLead: 'Stell dich auf Deutsch vor und schreib, warum du Deutsch lernen möchtest. Dieser Teil wird nicht bewertet; ich lese deinen Text selbst.',
      plWritingExpected: 'Erwartete Länge für dein Niveau: {range} Wörter.',
      plWritingLabel: 'Dein Text',
      plWords: '{n} Wörter',
      plContinue: 'Weiter',
      plSkipWriting: 'Diesen Teil überspringen',
      plResultTitle: 'Dein geschätztes Niveau',
      plNear: '{level} – nah an {next}',
      plA0: 'Anfänger (A0)',
      plDescA0: 'Du fängst gerade mit Deutsch an. In den ersten Stunden beginnen wir mit Vorstellung, Zahlen und Alltagsausdrücken.',
      plDescA1: 'Du verstehst einfache Sätze und Alltagsausdrücke. Als Nächstes kommen Vergangenheit, Dativ und Nebensätze.',
      plDescA2: 'Du verstehst kurze Texte zu Alltagsthemen und benutzt einfache Strukturen. Als Nächstes kommen längere Sätze und neue Konnektoren.',
      plDescB1: 'Du liest bei vertrauten Themen sicher und benutzt die meisten Strukturen. Als Nächstes kommen formellere Sprache und ausführliche Texte.',
      plDescB2: 'Du verstehst auch schwierige Texte weitgehend. Als Nächstes kommen Feinheiten der Wissenschafts- und Berufssprache.',
      plDescC1: 'Du hast auch den schwersten Teil bestanden. Im Unterricht konzentrieren wir uns je nach Ziel auf Prüfung, Beruf oder Studium.',
      plWeakTitle: 'Themen, die dir schwerfielen',
      plWeakNone: 'In deinen Teilen gab es kein deutlich schwaches Thema.',
      plWeakCount: '{n} falsch',
      plDisclaimer: 'Das ist ein geschätztes Ergebnis; dein genaues Niveau bestimmen wir gemeinsam in der ersten Stunde.',
      plBlocksTitle: 'Richtige Antworten pro Teil',
      plFormTitle: 'Schick mir dein Ergebnis',
      plFormLead: 'Dein Ergebnis und die folgenden Angaben sehe nur ich. Ich nutze sie, um die erste Stunde zu planen.',
      plName: 'Vor- und Nachname',
      plEmail: 'E-Mail',
      plGoal: 'Dein Ziel',
      plChoose: 'Bitte wählen …',
      plGoalDaily: 'Alltag',
      plGoalExam: 'Prüfung',
      plGoalWork: 'Beruf',
      plGoalSchool: 'Schule / Studium',
      plGoalOther: 'Sonstiges',
      plExamName: 'Name der Prüfung (falls vorhanden)',
      plExamNamePlaceholder: 'z. B. Goethe B1, telc B2, TestDaF',
      plExamDate: 'Prüfungsdatum (falls vorhanden)',
      plExperience: 'Wie lange hast du schon Deutsch gelernt?',
      plExpNone: 'Noch gar nicht',
      plExpLt6m: 'Weniger als 6 Monate',
      plExp6to12m: '6–12 Monate',
      plExp1to2y: '1–2 Jahre',
      plExpGt2y: 'Mehr als 2 Jahre',
      plNote: 'Notiz (freiwillig)',
      plNotePlaceholder: 'Was dir schwerfällt, passende Tage und Uhrzeiten …',
      plConsentBefore: 'Ich bin einverstanden, dass meine Angaben und mein Testergebnis für die Unterrichtsplanung gespeichert werden (höchstens 6 Monate). ',
      plConsentLink: 'Datenschutzerklärung',
      plSubmit: 'Ergebnis senden',
      plSending: 'Wird gesendet …',
      plErrName: 'Schreib deinen Namen (mindestens 2 Zeichen).',
      plErrEmail: 'Schreib eine gültige E-Mail-Adresse.',
      plErrGoal: 'Wähle ein Ziel.',
      plErrExperience: 'Wähle eine Dauer.',
      plErrConsent: 'Bitte bestätige die Einwilligung.',
      plErrDate: 'Schreib das Datum als JJJJ-MM-TT oder lass das Feld leer.',
      plErrForm: 'Bitte korrigiere die markierten Felder.',
      plErrCooldown: 'Du hast gerade erst ein Ergebnis gesendet. Versuch es in 10 Minuten noch einmal oder schreib mir eine E-Mail.',
      plErrSend: 'Das Ergebnis konnte nicht gesendet werden. Versuch es später noch einmal oder schreib an bozkurtt.omerfaruk@gmail.com.',
      plDoneTitle: 'Danke!',
      plDoneText: 'Dein Ergebnis ist bei mir angekommen. Ich melde mich so bald wie möglich.',
      plDoneContact: 'Für die erste Stunde erreichst du mich auch per E-Mail:',
      plDoneContactPage: 'Kontaktseite',
      plDoneAgain: 'Test noch einmal machen',
      plLoadError: 'Die Fragen konnten nicht geladen werden. Lade die Seite neu und versuch es noch einmal.',
      plWritingPrompt: 'Stell dich kurz vor und schreib, warum du Deutsch lernen möchtest.',
      plTopicLesen: 'Leseverstehen',
      plTopicWortschatz: 'Wortschatz',
      adminNoAccess: 'Du hast keinen Zugriff auf diese Seite.',
      adminLoading: 'Wird geladen …'
    },
    en: {
      plLinkHome: 'Check your level',
      plPromoTitle: 'Check your level before your first lesson',
      plPromoText: 'A 5–25 minute placement test: the result comes to me, and I plan your first lesson around it.',
      plPromoButton: 'Start the placement test',
      plLinkContact: 'Not sure about your level? Take the placement test first.',
      plTitle: 'Placement test',
      plLead: 'A short test to estimate your German level before the first lesson. I see the result and prepare the first lesson around it.',
      plInfo1: 'Five parts: A1, A2, B1, B2, C1. Each part has 10 questions, including a short reading text.',
      plInfo2: 'With at least 6 correct answers you move on to the next part; otherwise the test ends there.',
      plInfo3: 'About 5 minutes for beginners and at most 25 minutes for advanced learners. There is no time limit.',
      plInfo4: 'If you don’t know an answer, don’t guess: choose “I don’t know”. This makes the result more accurate.',
      plInfo5: 'If you close or reload the page, you continue where you left off.',
      plStart: 'Start the test',
      plSkip: 'I don’t know any German yet',
      plSkipNote: 'You skip the test and go straight to the form.',
      plBlock: 'Part {n} / {total}',
      plBlockHint: 'For each question, choose the option that fits.',
      plReading: 'Reading text',
      plReadingHint: 'Read the text and answer the questions.',
      plDontKnow: 'I don’t know',
      plFinishBlock: 'Finish this part',
      plUnanswered: '{n} questions are unanswered. If you don’t know, choose “I don’t know”.',
      plRestart: 'Restart the test',
      plRestartConfirm: 'Your answers will be deleted and the test will start again. Are you sure?',
      plQuestion: 'Question {n}',
      plWritingTitle: 'A short text (optional)',
      plWritingLead: 'Introduce yourself in German and write why you want to learn German. This part is not scored; I will read your text myself.',
      plWritingExpected: 'Expected length for your level: {range} words.',
      plWritingLabel: 'Your text',
      plWords: '{n} words',
      plContinue: 'Continue',
      plSkipWriting: 'Skip this part',
      plResultTitle: 'Your estimated level',
      plNear: '{level} – close to {next}',
      plA0: 'Beginner (A0)',
      plDescA0: 'You are just starting with German. In the first lessons we will begin with introductions, numbers and everyday phrases.',
      plDescA1: 'You understand basic sentences and everyday phrases. Next come the past tense, the dative and subordinate clauses.',
      plDescA2: 'You understand short texts on everyday topics and use simple structures. Next come longer sentences and new connectors.',
      plDescB1: 'You read familiar topics confidently and use most structures. Next come more formal language and detailed texts.',
      plDescB2: 'You understand most difficult texts as well. Next come the finer points of academic and professional German.',
      plDescC1: 'You passed even the hardest part. In lessons we will focus on advanced topics for your exam, work or studies.',
      plWeakTitle: 'Topics you found difficult',
      plWeakNone: 'No clearly weak topic showed up in the parts you took.',
      plWeakCount: '{n} wrong',
      plDisclaimer: 'This is an estimated result; we will determine your exact level together in the first lesson.',
      plBlocksTitle: 'Correct answers per part',
      plFormTitle: 'Send me your result',
      plFormLead: 'Only I can see your result and the details below. I use them to plan your first lesson.',
      plName: 'Full name',
      plEmail: 'Email',
      plGoal: 'Your goal',
      plChoose: 'Choose…',
      plGoalDaily: 'Everyday life',
      plGoalExam: 'Exam',
      plGoalWork: 'Work',
      plGoalSchool: 'School / university',
      plGoalOther: 'Other',
      plExamName: 'Exam name (if any)',
      plExamNamePlaceholder: 'e.g. Goethe B1, telc B2, TestDaF',
      plExamDate: 'Exam date (if any)',
      plExperience: 'How long have you learned German so far?',
      plExpNone: 'Not at all',
      plExpLt6m: 'Less than 6 months',
      plExp6to12m: '6–12 months',
      plExp1to2y: '1–2 years',
      plExpGt2y: 'More than 2 years',
      plNote: 'Note (optional)',
      plNotePlaceholder: 'Skills you find hard, days and times that suit you …',
      plConsentBefore: 'I agree that my details and test result are stored to plan lessons (for at most 6 months). ',
      plConsentLink: 'Privacy policy',
      plSubmit: 'Send result',
      plSending: 'Sending…',
      plErrName: 'Enter your name (at least 2 characters).',
      plErrEmail: 'Enter a valid email address.',
      plErrGoal: 'Choose a goal.',
      plErrExperience: 'Choose a duration.',
      plErrConsent: 'Tick the consent box to send.',
      plErrDate: 'Enter the date as YYYY-MM-DD or leave it empty.',
      plErrForm: 'Please correct the marked fields.',
      plErrCooldown: 'You sent a result a moment ago. Try again in 10 minutes or send me an email.',
      plErrSend: 'The result could not be sent. Try again later or write to bozkurtt.omerfaruk@gmail.com.',
      plDoneTitle: 'Thank you!',
      plDoneText: 'Your result has reached me. I will get back to you as soon as possible.',
      plDoneContact: 'For your first lesson you can also reach me by email:',
      plDoneContactPage: 'Contact page',
      plDoneAgain: 'Take the test again',
      plLoadError: 'The questions could not be loaded. Reload the page and try again.',
      plWritingPrompt: 'Stell dich kurz vor und schreib, warum du Deutsch lernen möchtest.',
      plTopicLesen: 'Reading',
      plTopicWortschatz: 'Vocabulary',
      adminNoAccess: 'You don’t have access to this page.',
      adminLoading: 'Loading…'
    }
  };
  const target = window.BA?.translations;
  if(target) for(const lang of Object.keys(strings)) Object.assign(target[lang] = target[lang] || {}, strings[lang]);
  const t = (key, vars = {}) => {
    let text = window.BA?.t(key) || strings.tr[key] || key;
    for(const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
    return text;
  };

  // Konu kimlikleri sitenin gramer konularıyla aynı. link: anlatım sayfası (A1–B1) ya da B2 alıştırması.
  const TOPICS = {
    praesens: ['Präsens', 'A1'], 'sein-haben': ['sein & haben', 'A1'], artikel: ['Artikel: der · die · das', 'A1'],
    akkusativ: ['Akkusativ', 'A1'], negation: ['Negation: nicht · kein', 'A1'], modalverben: ['Modalverben', 'A1'],
    perfekt: ['Perfekt', 'A1'], dativ: ['Dativ', 'A2'], wechselpraepositionen: ['Wechselpräpositionen', 'A2'],
    nebensaetze: ['Nebensätze', 'A2'], 'komparativ-superlativ': ['Komparativ & Superlativ', 'A2'],
    'reflexive-verben': ['Reflexive Verben', 'A2'], relativsaetze: ['Relativsätze', 'B1'], passiv: ['Passiv', 'B1'],
    'konjunktiv-ii-b1': ['Konjunktiv II', 'B1'], konnektoren: ['Konnektoren', 'B1'], 'infinitiv-zu': ['Infinitiv mit zu', 'B1'],
    'indirekte-fragen': ['Indirekte Fragen', 'B1'], 'satzstellung-b1': ['Satzstellung', 'B1'],
    'konjunktiv-i': ['Konjunktiv I', 'B2', 'exercises'], 'passiv-varianten': ['Passiversatz', 'B2', 'exercises'],
    'partizip-i': ['Partizip I', 'B2', 'exercises'], 'partizip-ii': ['Partizipialattribute', 'B2', 'exercises'],
    genitivpraepositionen: ['Präpositionen mit Genitiv', 'B2', 'exercises'], 'je-desto': ['je … desto', 'B2', 'exercises'],
    nominalisierung: ['Nominalisierung', 'B2', 'exercises'], 'modalverben-subjektiv': ['Modalverben (subjektiv)'],
    funktionsverbgefuege: ['Funktionsverbgefüge'], 'konnektoren-b2': ['Konnektoren (zumal, sofern …)']
  };
  function topicName(id){
    if(id === 'lesen') return t('plTopicLesen');
    if(id === 'wortschatz') return t('plTopicWortschatz');
    return TOPICS[id]?.[0] || id;
  }
  function topicHref(id){
    const meta = TOPICS[id];
    if(!meta?.[1]) return '';
    return meta[2] === 'exercises' ? `#exercises/${meta[1]}/${id}` : `#grammar/${meta[1]}/${id}`;
  }

  // Yazma görevi için seviyeye göre beklenen kelime sayısı.
  const WRITING_RANGE = { A0: '20–40', A1: '20–40', A2: '40–70', B1: '80–120', B2: '120–160', C1: '150–200' };

  // ---------- Durum ve localStorage ----------
  const fresh = () => ({ v: 1, step: 'intro', block: 0, answers: {}, order: {}, elapsedMs: 0, skipped: false, writing: '', form: {} });
  function load(){
    try{
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      return saved && saved.v === 1 ? { ...fresh(), ...saved } : null;
    }catch(_){ return null; }
  }
  let state = load() || fresh();
  let bank = null;
  let segmentStart = null;

  function tick(){
    if(segmentStart !== null){
      const now = Date.now();
      state.elapsedMs += now - segmentStart;
      segmentStart = now;
    }
  }
  function save(){
    tick();
    try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(_){}
  }
  function clearSaved(){
    try{ localStorage.removeItem(KEY); }catch(_){}
  }
  // Süre sadece test ekranı açıkken ve görünürken sayılır; sonuç ekranında durur.
  const counting = () => state.step === 'block' || state.step === 'writing';
  function resume(){ if(counting() && segmentStart === null && document.visibilityState !== 'hidden') segmentStart = Date.now(); }
  function pause(){ if(segmentStart !== null){ tick(); segmentStart = null; save(); } }
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' ? pause() : (isOpen() && resume()));
  window.addEventListener('pagehide', pause);

  const isOpen = () => document.getElementById('page-seviye-testi')?.classList.contains('active');

  async function loadBank(){
    if(bank) return bank;
    const response = await fetch('data/seviye-testi/sorular.json?v=1');
    if(!response.ok) throw new Error('bank ' + response.status);
    bank = await response.json();
    return bank;
  }

  const shuffle = (list) => {
    const a = [...list];
    for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const blockQuestions = (block) => [...block.questions, ...block.reading.questions];
  // Seçenek sırası her açılışta karışır; yenilemede aynı soruda cevaplar yerinden oynamasın diye
  // o oturumun sırası saklanır ve test baştan başlayınca silinir.
  function optionsFor(q){
    if(!state.order[q.id] || state.order[q.id].length !== q.options.length || !q.options.every((o) => state.order[q.id].includes(o))){
      state.order[q.id] = shuffle(q.options);
    }
    return state.order[q.id];
  }

  // ---------- Sonuç hesaplama ----------
  function compute(){
    const blocks = {};
    const topicErrors = {};
    const wrong = [];
    let level = 'A0', near = '';
    let passedAll = true;
    for(let i = 0; i < bank.blocks.length; i++){
      const block = bank.blocks[i];
      const qs = blockQuestions(block);
      if(!qs.some((q) => q.id in state.answers)) break;
      let correct = 0;
      for(const q of qs){
        const answer = state.answers[q.id];
        if(answer === q.answer) correct++;
        else {
          topicErrors[q.topic] = (topicErrors[q.topic] || 0) + 1;
          wrong.push({ id: q.id, answer: answer || UNKNOWN });
        }
      }
      blocks[block.level] = { correct, total: qs.length };
      if(correct >= bank.passCorrect && passedAll){
        level = block.level;
      }else{
        if(passedAll && correct >= bank.passCorrect - 2) near = block.level;
        passedAll = false;
      }
    }
    return { level, near, blocks, topicErrors, wrong };
  }
  function levelLabel(level, near){
    const name = level === 'A0' ? t('plA0') : level;
    return near ? t('plNear', { level: level === 'A0' ? 'A0' : level, next: near }) : name;
  }

  // ---------- Ekranlar ----------
  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for(const [k, v] of Object.entries(attrs)){
      if(v === null || v === undefined || v === false) continue;
      if(k === 'class') node.className = v;
      else if(k === 'text') node.textContent = v;
      else if(k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for(const child of children.flat()) if(child !== null && child !== undefined && child !== false) node.append(child.nodeType ? child : document.createTextNode(child));
    return node;
  };

  function focusHeading(){
    const heading = root.querySelector('h1, h2');
    if(heading){ heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function render({ focus = false } = {}){
    if(!bank) return;
    root.replaceChildren();
    root.dataset.step = state.step;
    if(state.step === 'intro') renderIntro();
    else if(state.step === 'block') renderBlock();
    else if(state.step === 'writing') renderWriting();
    else if(state.step === 'result') renderResult();
    else if(state.step === 'done') renderDone();
    if(focus) focusHeading();
  }

  function go(step, extra = {}){
    Object.assign(state, extra, { step });
    if(counting()) resume(); else pause();
    save();
    render({ focus: true });
  }

  function renderIntro(){
    root.append(
      el('header', { class: 'pl-hero' },
        el('h1', { text: t('plTitle') }),
        el('p', { class: 'pl-lead', text: t('plLead') })),
      el('div', { class: 'pl-card ba-card' },
        el('div', { class: 'ba-stripe', 'aria-hidden': 'true' }, Array.from({ length: 60 }, () => el('i'))),
        el('div', { class: 'pl-card-body' },
          el('ul', { class: 'ba-checklist pl-info' }, ['plInfo1', 'plInfo2', 'plInfo3', 'plInfo4', 'plInfo5'].map((k) => el('li', { text: t(k) }))),
          el('div', { class: 'pl-actions' },
            el('button', { class: 'btn primary', type: 'button', 'data-pl-start': true, text: t('plStart'), onclick: () => go('block', { block: 0, startedAt: Date.now() }) }),
            el('div', { class: 'pl-skip' },
              el('button', { class: 'btn ghost', type: 'button', 'data-pl-skip': true, 'aria-describedby': 'plSkipNote', text: t('plSkip'),
                onclick: () => go('result', { skipped: true, answers: {}, result: { level: 'A0', near: '', blocks: {}, topicErrors: {}, wrong: [] } }) }),
              el('p', { id: 'plSkipNote', class: 'pl-muted', text: t('plSkipNote') })))))
    );
  }

  function questionNode(q, number){
    const name = `pl-${q.id}`;
    const chosen = state.answers[q.id];
    const legend = el('legend', { class: 'pl-q-prompt' }, el('span', { class: 'pl-q-number', text: `${number}.` }), ' ');
    const promptBox = el('span', { lang: 'de' });
    if(q.type === 'gap'){
      const [before, after] = q.prompt.split('___');
      promptBox.append(before, el('span', { class: 'pl-gap', 'aria-label': 'Lücke' }, chosen && chosen !== UNKNOWN ? chosen : '…'), after ?? '');
    }else promptBox.textContent = q.prompt;
    legend.append(promptBox);
    const options = [...optionsFor(q), UNKNOWN].map((value) => {
      const input = el('input', { type: 'radio', name, value });
      if(chosen === value) input.checked = true;
      return el('label', { class: 'pl-option' + (value === UNKNOWN ? ' pl-option--unknown' : '') + (chosen === value ? ' is-chosen' : '') },
        input, el('span', { lang: value === UNKNOWN ? null : 'de', text: value === UNKNOWN ? t('plDontKnow') : value }));
    });
    const fieldset = el('fieldset', { class: 'pl-q', 'data-q': q.id }, legend, el('div', { class: 'pl-options' }, options));
    fieldset.addEventListener('change', (event) => {
      state.answers[q.id] = event.target.value;
      fieldset.classList.remove('is-missing');
      fieldset.querySelectorAll('.pl-option').forEach((o) => o.classList.toggle('is-chosen', o.querySelector('input').checked));
      const gap = fieldset.querySelector('.pl-gap');
      if(gap) gap.textContent = event.target.value === UNKNOWN ? '…' : event.target.value;
      save();
    });
    return fieldset;
  }

  function renderBlock(){
    const block = bank.blocks[state.block];
    const qs = blockQuestions(block);
    let n = 0;
    const status = el('p', { class: 'pl-status', role: 'alert' });
    root.append(
      el('header', { class: 'pl-block-head' },
        el('p', { class: 'pl-kicker', text: t('plBlock', { n: state.block + 1, total: bank.blocks.length }) }),
        el('h1', { text: `${t('plTitle')} · ${block.level}` }),
        el('div', { class: 'pl-progress', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(bank.blocks.length), 'aria-valuenow': String(state.block + 1), 'aria-label': t('plBlock', { n: state.block + 1, total: bank.blocks.length }) },
          el('span', { style: `width:${((state.block + 1) / bank.blocks.length) * 100}%` })),
        el('p', { class: 'pl-muted', text: t('plBlockHint') })),
      el('div', { class: 'pl-questions' }, block.questions.map((q) => questionNode(q, ++n))),
      el('section', { class: 'pl-reading', 'aria-labelledby': `pl-reading-${block.level}` },
        el('h2', { id: `pl-reading-${block.level}`, text: t('plReading') }),
        el('p', { class: 'pl-muted', text: t('plReadingHint') }),
        el('article', { class: 'pl-text', lang: 'de' },
          el('h3', { text: block.reading.title }),
          block.reading.text.map((p) => el('p', { text: p }))),
        el('div', { class: 'pl-questions' }, block.reading.questions.map((q) => questionNode(q, ++n)))),
      status,
      el('div', { class: 'pl-actions' },
        el('button', { class: 'btn primary', type: 'button', 'data-pl-finish': true, text: t('plFinishBlock'), onclick: () => finishBlock(qs, status) }),
        el('button', { class: 'btn ghost', type: 'button', 'data-pl-restart': true, text: t('plRestart'), onclick: restart }))
    );
  }

  function finishBlock(qs, status){
    const missing = qs.filter((q) => !(q.id in state.answers));
    root.querySelectorAll('.pl-q').forEach((f) => f.classList.toggle('is-missing', missing.some((q) => q.id === f.dataset.q)));
    if(missing.length){
      status.textContent = t('plUnanswered', { n: missing.length });
      status.classList.add('is-error');
      root.querySelector(`.pl-q[data-q="${missing[0].id}"] input`)?.focus();
      return;
    }
    const correct = qs.filter((q) => state.answers[q.id] === q.answer).length;
    if(correct >= bank.passCorrect && state.block < bank.blocks.length - 1) go('block', { block: state.block + 1 });
    else{
      const result = compute();
      go('writing', { result });
    }
  }

  function restart(){
    if(!window.confirm(t('plRestartConfirm'))) return;
    segmentStart = null;
    state = fresh();
    clearSaved();
    render({ focus: true });
  }

  const wordCount = (text) => (text.trim().match(/\S+/g) || []).length;

  function renderWriting(){
    const level = state.result.level;
    const counter = el('p', { class: 'pl-muted', id: 'plWordCount', 'aria-live': 'polite', text: t('plWords', { n: wordCount(state.writing) }) });
    const area = el('textarea', { id: 'plWriting', lang: 'de', maxlength: '3000', rows: '8', 'aria-describedby': 'plWritingExpected plWordCount' });
    area.value = state.writing;
    area.addEventListener('input', () => { state.writing = area.value; counter.textContent = t('plWords', { n: wordCount(area.value) }); save(); });
    root.append(
      el('header', { class: 'pl-block-head' },
        el('h1', { text: t('plWritingTitle') }),
        el('p', { class: 'pl-lead', text: t('plWritingLead') })),
      el('div', { class: 'pl-card ba-card' }, el('div', { class: 'pl-card-body' },
        el('p', { class: 'pl-writing-prompt', lang: 'de', text: t('plWritingPrompt') }),
        el('p', { id: 'plWritingExpected', text: t('plWritingExpected', { range: WRITING_RANGE[level] }) }),
        el('div', { class: 'field' }, el('label', { for: 'plWriting', text: t('plWritingLabel') }), area),
        counter,
        el('div', { class: 'pl-actions' },
          el('button', { class: 'btn primary', type: 'button', 'data-pl-writing-done': true, text: t('plContinue'), onclick: () => finishTest() }),
          el('button', { class: 'btn ghost', type: 'button', 'data-pl-writing-skip': true, text: t('plSkipWriting'), onclick: () => { state.writing = ''; finishTest(); } }))))
    );
  }

  function finishTest(){
    pause();
    state.durationSec = Math.min(21600, Math.round(state.elapsedMs / 1000));
    go('result');
  }

  function renderResult(){
    const r = state.result;
    const weak = Object.entries(r.topicErrors).sort((a, b) => b[1] - a[1]);
    const resultCard = el('section', { class: 'pl-result ba-card', 'aria-labelledby': 'plResultTitle' },
      el('div', { class: 'ba-stripe ba-stripe--bold', 'aria-hidden': 'true' }, Array.from({ length: 60 }, () => el('i'))),
      el('div', { class: 'pl-card-body' },
        el('h1', { id: 'plResultTitle', class: 'pl-result-title', text: t('plResultTitle') }),
        el('p', { class: 'pl-level', 'data-pl-level': true, text: levelLabel(r.level, r.near) }),
        el('p', { class: 'pl-lead', text: t('plDesc' + r.level) }),
        Object.keys(r.blocks).length ? el('div', {},
          el('h2', { class: 'pl-h3', text: t('plBlocksTitle') }),
          el('dl', { class: 'ba-stub pl-blocks' }, Object.entries(r.blocks).map(([lv, b]) => el('div', {}, el('dt', { text: lv }), el('dd', { text: `${b.correct} / ${b.total}` }))))) : null,
        state.skipped ? null : el('div', {},
          el('h2', { class: 'pl-h3', text: t('plWeakTitle') }),
          weak.length ? el('ul', { class: 'pl-weak' }, weak.map(([id, count]) => {
            const href = topicHref(id);
            return el('li', {}, href ? el('a', { class: 'ba-link', href, text: topicName(id) }) : el('span', { text: topicName(id) }),
              el('span', { class: 'pl-muted', text: ' · ' + t('plWeakCount', { n: count }) }));
          })) : el('p', { text: t('plWeakNone') })),
        el('p', { class: 'notice pl-disclaimer', text: t('plDisclaimer') })));
    root.append(resultCard, renderForm());
  }

  const GOALS = [['daily', 'plGoalDaily'], ['exam', 'plGoalExam'], ['work', 'plGoalWork'], ['school', 'plGoalSchool'], ['other', 'plGoalOther']];
  const EXPERIENCE = [['none', 'plExpNone'], ['lt6m', 'plExpLt6m'], ['6to12m', 'plExp6to12m'], ['1to2y', 'plExp1to2y'], ['gt2y', 'plExpGt2y']];
  const emailOk = (v) => v.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

  function field(id, labelKey, control, { optional = false } = {}){
    control.id = id;
    control.setAttribute('aria-describedby', `${id}Error`);
    if(!optional) control.setAttribute('aria-required', 'true');
    return el('div', { class: 'field pl-field', 'data-field': id },
      el('label', { for: id, text: t(labelKey) }), control,
      el('p', { class: 'pl-error', id: `${id}Error` }));
  }
  function select(name, items){
    const s = el('select', { name }, el('option', { value: '', text: t('plChoose') }), items.map(([v, k]) => el('option', { value: v, text: t(k) })));
    s.value = state.form[name] || '';
    return s;
  }
  function input(name, attrs = {}){
    const i = el('input', { name, ...attrs });
    i.value = state.form[name] || '';
    return i;
  }

  function renderForm(){
    const consent = el('input', { type: 'checkbox', id: 'plConsent', name: 'consent', 'aria-describedby': 'plConsentError', 'aria-required': 'true' });
    consent.checked = Boolean(state.form.consent);
    const note = el('textarea', { name: 'note', rows: '3', maxlength: '1000', placeholder: t('plNotePlaceholder') });
    note.value = state.form.note || '';
    const status = el('p', { class: 'pl-status', id: 'plFormStatus', role: 'status', 'aria-live': 'polite' });
    const submit = el('button', { class: 'btn primary', type: 'submit', 'data-pl-submit': true, text: t('plSubmit') });
    const form = el('form', { class: 'pl-form', id: 'plForm', novalidate: true },
      el('div', { class: 'pl-form-grid' },
        field('plName', 'plName', input('name', { autocomplete: 'name', maxlength: '80' })),
        field('plEmail', 'plEmail', input('email', { type: 'email', autocomplete: 'email', spellcheck: 'false', maxlength: '254' })),
        field('plGoal', 'plGoal', select('goal', GOALS)),
        field('plExperience', 'plExperience', select('experience', EXPERIENCE)),
        field('plExamName', 'plExamName', input('examName', { maxlength: '80', placeholder: t('plExamNamePlaceholder') }), { optional: true }),
        field('plExamDate', 'plExamDate', input('examDate', { type: 'date', min: '2020-01-01', max: '2099-12-31' }), { optional: true })),
      field('plNote', 'plNote', note, { optional: true }),
      el('div', { class: 'pl-field pl-consent', 'data-field': 'plConsent' },
        el('label', { class: 'pl-check', for: 'plConsent' }, consent,
          el('span', {}, t('plConsentBefore'), el('a', { href: 'privacy.html', target: '_blank', rel: 'noopener', class: 'ba-link', text: t('plConsentLink') }))),
        el('p', { class: 'pl-error', id: 'plConsentError' })),
      el('input', { class: 'contact-honey', type: 'text', name: 'website', id: 'plWebsite', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' }),
      submit, status);
    form.addEventListener('input', (event) => {
      const target = event.target;
      if(!target.name || target.name === 'website') return;
      state.form[target.name] = target.type === 'checkbox' ? target.checked : target.value;
      save();
    });
    form.addEventListener('submit', (event) => { event.preventDefault(); send(form, submit, status); });
    return el('section', { class: 'pl-card ba-card pl-form-card', 'aria-labelledby': 'plFormTitle' },
      el('div', { class: 'pl-card-body' },
        el('h2', { id: 'plFormTitle', text: t('plFormTitle') }),
        el('p', { text: t('plFormLead') }),
        form));
  }

  function validate(form){
    const f = state.form;
    const errors = {};
    const name = (f.name || '').trim(), email = (f.email || '').trim();
    if(name.length < 2 || name.length > 80) errors.plName = 'plErrName';
    if(!emailOk(email)) errors.plEmail = 'plErrEmail';
    if(!GOALS.some(([v]) => v === f.goal)) errors.plGoal = 'plErrGoal';
    if(!EXPERIENCE.some(([v]) => v === f.experience)) errors.plExperience = 'plErrExperience';
    if(f.examDate && !/^20[0-9]{2}-[01][0-9]-[0-3][0-9]$/.test(f.examDate)) errors.plExamDate = 'plErrDate';
    if(!f.consent) errors.plConsent = 'plErrConsent';
    form.querySelectorAll('[data-field]').forEach((box) => {
      const id = box.dataset.field;
      const control = form.querySelector('#' + id);
      box.querySelector('.pl-error').textContent = errors[id] ? t(errors[id]) : '';
      box.classList.toggle('is-invalid', Boolean(errors[id]));
      if(errors[id]) control.setAttribute('aria-invalid', 'true'); else control.removeAttribute('aria-invalid');
    });
    return errors;
  }

  const clean = (value, max) => String(value || '').replace(/[\t\n\r]+/g, ' ').trim().slice(0, max);

  function payload(){
    const f = state.form, r = state.result;
    return {
      name: clean(f.name, 80), email: clean(f.email, 254), goal: f.goal,
      examName: clean(f.examName, 80), examDate: f.examDate || '', experience: f.experience,
      note: String(f.note || '').trim().slice(0, 1000),
      level: r.level, near: r.near, skipped: Boolean(state.skipped), blocks: r.blocks,
      topicErrors: Object.entries(r.topicErrors).map(([k, v]) => `${k}:${Math.min(v, 99)}`).join(','),
      wrong: r.wrong.map((w) => `${w.id}\t${clean(w.answer, 200) || UNKNOWN}`).join('\n'),
      writing: String(state.writing || '').trim().slice(0, 3000),
      durationSec: state.skipped ? 0 : (state.durationSec || 0),
      bank: bank.version, lang: window.BA?.lang || 'tr', consent: true, read: false
    };
  }

  async function send(form, submit, status){
    if(form.querySelector('#plWebsite').value) return;
    status.className = 'pl-status';
    const errors = validate(form);
    if(Object.keys(errors).length){
      status.textContent = t('plErrForm');
      status.classList.add('is-error');
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }
    let last = 0;
    try{ last = Number(localStorage.getItem(SENT_KEY)) || 0; }catch(_){}
    if(Date.now() - last < COOLDOWN_MS){
      status.textContent = t('plErrCooldown');
      status.classList.add('is-error');
      return;
    }
    submit.disabled = true;
    submit.textContent = t('plSending');
    status.textContent = '';
    try{
      const { submitPlacement } = await import('./account/placement-submit.js?v=1');
      await submitPlacement(payload());
      try{ localStorage.setItem(SENT_KEY, String(Date.now())); }catch(_){}
      state = { ...fresh(), step: 'done' };
      clearSaved();
      render({ focus: true });
    }catch(error){
      console.error('Seviye testi gönderilemedi:', error);
      const cooldown = error?.code === 'permission-denied' && Date.now() - last < 24 * 60 * 60 * 1000 && last;
      status.textContent = t(cooldown ? 'plErrCooldown' : 'plErrSend');
      status.classList.add('is-error');
      submit.disabled = false;
      submit.textContent = t('plSubmit');
    }
  }

  function renderDone(){
    root.append(el('section', { class: 'pl-card ba-card pl-done', 'aria-labelledby': 'plDoneTitle' },
      el('div', { class: 'ba-stripe ba-stripe--bold', 'aria-hidden': 'true' }, Array.from({ length: 60 }, () => el('i'))),
      el('div', { class: 'pl-card-body' },
        el('h1', { id: 'plDoneTitle', text: t('plDoneTitle') }),
        el('p', { class: 'pl-lead', 'data-pl-done': true, text: t('plDoneText') }),
        el('p', {}, t('plDoneContact'), ' ', el('a', { class: 'ba-link', href: 'mailto:bozkurtt.omerfaruk@gmail.com', text: 'bozkurtt.omerfaruk@gmail.com' })),
        el('div', { class: 'pl-actions' },
          el('a', { class: 'btn primary', href: '#contact', 'data-page': 'contact', text: t('plDoneContactPage'), onclick: (e) => { e.preventDefault(); window.BA?.showPage('contact'); } }),
          el('button', { class: 'btn ghost', type: 'button', text: t('plDoneAgain'), onclick: () => { state = fresh(); render({ focus: true }); } })))));
  }

  // ---------- Sayfa açılınca ----------
  async function open(){
    try{
      await loadBank();
    }catch(error){
      console.error(error);
      root.replaceChildren(el('p', { class: 'notice', role: 'alert', text: t('plLoadError') }));
      return;
    }
    render();
    resume();
  }

  window.addEventListener('ba:pagechange', (event) => {
    if(event.detail?.page === 'seviye-testi') open();
    else pause();
    if(event.detail?.page === 'yonetim') openAdmin();
  });
  window.addEventListener('ba:languagechange', () => {
    if(isOpen() && bank){
      const active = document.activeElement?.closest?.('#placementApp') ? document.activeElement.id : null;
      render();
      if(active) document.getElementById(active)?.focus();
    }
  });

  // ---------- Yönetim sayfası (#yonetim/seviye-testleri) ----------
  // Sitenin hiçbir yerinden bağlantı verilmez. Yetkiyi Firestore kuralları belirler; burada sadece
  // öğretmen olarak giriş yapılmamışsa hiçbir veri istenmeden "erişimin yok" gösterilir.
  // app.js ilk açılışta adresi "#yonetim" olarak yazar; doğrudan açılan detay bağlantısı kaybolmasın.
  let initialHash = location.hash;
  async function openAdmin(){
    const box = document.getElementById('adminApp');
    if(!box) return;
    let hash = location.hash;
    if(initialHash.startsWith('#yonetim/')) hash = initialHash;
    initialHash = '';
    const full = hash.startsWith('#yonetim/') ? hash : '#yonetim/seviye-testleri';
    if(location.hash !== full) history.replaceState({ baPage: 'yonetim' }, '', full);
    box.replaceChildren(el('p', { class: 'pl-muted', role: 'status', text: t('adminLoading') }));
    try{
      const admin = await import('./account/placement-admin.js?v=1');
      await admin.open(box, full.split('/').slice(1));
    }catch(error){
      console.error(error);
      box.replaceChildren(el('p', { class: 'admin-denied', role: 'alert', text: t('adminNoAccess') }));
    }
  }
  window.addEventListener('hashchange', () => {
    if(location.hash.startsWith('#yonetim')){
      if(!document.getElementById('page-yonetim')?.classList.contains('active')) window.BA?.showPage('yonetim', { historyMode: 'none', scroll: false });
      else openAdmin();
    }else if(location.hash.startsWith('#seviye-testi') && !isOpen()) window.BA?.showPage('seviye-testi', { historyMode: 'none', scroll: false });
  });

  window.BA_PLACEMENT = { strings, TOPICS, topicName, levelLabel, t };
})();
