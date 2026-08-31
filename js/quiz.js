
(() => {
  const $ = (id) => document.getElementById(id);
  const state = {
    catalog:null,
    level:null,
    topicMeta:null,
    topicData:null,
    exercise:null,
    pool:[],
    index:0,
    selected:'',
    checked:false,
    score:0,
    wrong:[],
    hubSearch:'',
    responses:{}
  };

  const lang = () => window.BA?.lang || 'tr';
  const t = (key) => window.BA?.t(key) || key;
  const localize = (value) => {
    if(value == null) return '';
    if(typeof value === 'string') return value;
    return value[lang()] || value.tr || value.de || value.en || '';
  };


  const HUB_I18N = {
    tr:{
      heroSub:'Seviyeni seç, gramer konunu bul ve öğrendiklerini interaktif alıştırmalarla hemen pekiştir.',
      title:'Alıştırma konunu bul',
      subtitle:'Bir seviye seç veya arama kutusundan çalışmak istediğin gramer konusuna ulaş.',
      search:'Gramer konusu ara...',
      allLevels:'Arama tüm seviyelerde yapılıyor.',
      result:'konu',
      ready:'hazır',
      total:'konu',
      open:'Alıştırmaları Aç',
      soon:'Hazırlanıyor',
      emptyTitle:'Eşleşen konu bulunamadı',
      emptySub:'Farklı bir kelime dene veya seviyeler arasında geçiş yap.',
      levelHeading:(level)=>`${level} Alıştırmaları`,
      levelSub:(level)=>`${level} seviyesindeki gramer konularını seç ve hemen pratik yapmaya başla.`
    },
    de:{
      heroSub:'Wähle dein Niveau, finde ein Grammatikthema und festige dein Wissen direkt mit interaktiven Übungen.',
      title:'Finde deine Übung',
      subtitle:'Wähle ein Niveau oder suche direkt nach einem Grammatikthema.',
      search:'Grammatikthema suchen...',
      allLevels:'Die Suche läuft über alle Niveaus.',
      result:'Themen',
      ready:'bereit',
      total:'Themen',
      open:'Übungen öffnen',
      soon:'In Vorbereitung',
      emptyTitle:'Kein passendes Thema gefunden',
      emptySub:'Versuche einen anderen Suchbegriff oder wechsle das Niveau.',
      levelHeading:(level)=>`${level} Übungen`,
      levelSub:(level)=>`Wähle ein Grammatikthema auf Niveau ${level} und starte direkt mit dem Üben.`
    },
    en:{
      heroSub:'Choose your level, find a grammar topic and reinforce what you know with interactive exercises.',
      title:'Find an exercise topic',
      subtitle:'Choose a level or search directly for the grammar topic you want to practise.',
      search:'Search grammar topics...',
      allLevels:'Search is running across all levels.',
      result:'topics',
      ready:'ready',
      total:'topics',
      open:'Open Exercises',
      soon:'Coming soon',
      emptyTitle:'No matching topic found',
      emptySub:'Try another search term or switch levels.',
      levelHeading:(level)=>`${level} Exercises`,
      levelSub:(level)=>`Choose a grammar topic at ${level} level and start practising right away.`
    }
  };

  const ht = (key) => HUB_I18N[lang()]?.[key] ?? HUB_I18N.tr[key] ?? key;


  const QUIZ_I18N = {
    tr:{
      previous:'← Önceki Soru',
      writtenPlaceholder:'Cevabını Almanca yaz...',
      writtenHint:'Cevabını yaz ve kontrol et.',
      correctAnswer:'Doğru cevap',
      writtenChip:'Yazmalı',
      noHelpChip:'Yardım kapalı'
    },
    de:{
      previous:'← Vorherige Frage',
      writtenPlaceholder:'Schreibe deine Antwort auf Deutsch...',
      writtenHint:'Schreibe deine Antwort und prüfe sie.',
      correctAnswer:'Richtige Antwort',
      writtenChip:'Schreiben',
      noHelpChip:'Ohne Hilfe'
    },
    en:{
      previous:'← Previous Question',
      writtenPlaceholder:'Type your answer in German...',
      writtenHint:'Write your answer and check it.',
      correctAnswer:'Correct answer',
      writtenChip:'Written',
      noHelpChip:'No help'
    }
  };

  const qt = (key) => QUIZ_I18N[lang()]?.[key] ?? QUIZ_I18N.tr[key] ?? key;

  function normalizeWritten(value){
    return String(value ?? '')
      .normalize('NFC')
      .trim()
      .toLocaleLowerCase('de-DE')
      .replace(/[.!?,;:]+$/g,'')
      .replace(/\s+/g,' ');
  }

  function acceptedAnswers(q){
    const list=Array.isArray(q.answers) && q.answers.length ? q.answers : [q.correct];
    return list.map(normalizeWritten);
  }

  function isWritten(q){
    return q?.type==='text' || (!q?.options && (q?.answers || q?.correct));
  }

  function responseFor(q){
    if(!q) return {selected:'',checked:false,correct:false};
    return state.responses[q._index] || {selected:'',checked:false,correct:false};
  }

  function syncScoreAndWrong(){
    state.score=0;
    state.wrong=[];
    state.pool.forEach(q=>{
      const response=responseFor(q);
      if(!response.checked) return;
      if(response.correct) state.score++;
      else state.wrong.push(q);
    });
  }

  function ensurePreviousButton(){
    if($('prevQuestionBtn')) return;
    const actions=document.querySelector('#exerciseQuizView .quiz-actions');
    const check=$('checkAnswerBtn');
    if(!actions || !check) return;
    const btn=document.createElement('button');
    btn.className='btn ghost';
    btn.type='button';
    btn.id='prevQuestionBtn';
    btn.textContent=qt('previous');
    actions.insertBefore(btn, check);
    btn.addEventListener('click', previousQuestion);
  }

  function injectHubCss(){
    if(document.getElementById('exerciseHubCss')) return;
    const link=document.createElement('link');
    link.id='exerciseHubCss';
    link.rel='stylesheet';
    link.href='css/exercises-hub.css?v=2';
    document.head.appendChild(link);
  }

  function updateExerciseHero(){
    const sub=document.querySelector('#page-exercises [data-i18n="exerciseHubSub"]');
    if(sub) sub.textContent=ht('heroSub');
  }

  async function loadJSON(path){
    const response = await fetch(path, {cache:'no-store'});
    if(!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }

  function showOnly(id){
    ['exerciseLevelView','exerciseTopicView','exerciseSetView','exerciseQuizView'].forEach(view=>{
      const el = $(view);
      if(el) el.style.display = view === id ? 'block' : 'none';
    });
    const err = $('exerciseLoadError');
    if(err) err.style.display='none';
  }

  function showError(error){
    console.error(error);
    const err = $('exerciseLoadError');
    if(!err) return;
    err.textContent = t('loadError');
    err.style.display='block';
  }

  function updateBreadcrumb(){
    const el = $('exerciseBreadcrumb');
    if(!el) return;

    if(!state.topicMeta && !state.exercise){
      el.innerHTML='';
      return;
    }

    const parts = [];
    parts.push(`<button type="button" data-crumb="levels">${t('navExercises')}</button>`);
    if(state.level){
      parts.push(`<span class="sep">›</span><button type="button" data-crumb="topics">${state.level.id}</button>`);
    }
    if(state.topicMeta){
      parts.push(`<span class="sep">›</span><button type="button" data-crumb="sets">${escapeHtml(localize(state.topicMeta.title))}</button>`);
    }
    if(state.exercise){
      parts.push(`<span class="sep">›</span><span>${escapeHtml(localize(state.exercise.title))}</span>`);
    }
    el.innerHTML = parts.join('');
    el.querySelectorAll('[data-crumb]').forEach(btn=>btn.addEventListener('click',()=>{
      const target=btn.dataset.crumb;
      if(target==='levels') goLevels(false);
      if(target==='topics') goTopics(false);
      if(target==='sets') goSets(false);
    }));
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    })[ch]);
  }

  function exerciseHistoryState(view){
    return {
      baPage:'exercises',
      baExerciseView:view,
      level:state.level?.id || null,
      topic:state.topicMeta?.id || state.topicData?.id || null,
      exercise:state.exercise?.id || null
    };
  }

  function pushExerciseHistory(view){
    if(!history.pushState) return;
    history.pushState(exerciseHistoryState(view), '', '#exercises');
  }

  function currentDepth(){
    if(state.exercise) return 3;
    if(state.topicMeta || state.topicData) return 2;
    if(state.level) return 1;
    return 0;
  }

  function goBackToDepth(targetDepth, fallback){
    const delta=targetDepth-currentDepth();
    if(delta<0 && history.length>1){
      history.go(delta);
    }else{
      fallback();
    }
  }

  function renderLevels(){
    if(!state.catalog) return;

    const view=$('exerciseLevelView');
    if(!view) return;

    if(!state.level){
      state.level=state.catalog.levels[0] || null;
    }

    const query=(state.hubSearch || '').trim().toLocaleLowerCase('de-DE');
    const rows=[];

    if(query){
      state.catalog.levels.forEach(level=>{
        level.topics.forEach(topic=>{
          const haystack=[
            level.id,
            localize(topic.title),
            localize(topic.description)
          ].join(' ').toLocaleLowerCase('de-DE');
          if(haystack.includes(query)) rows.push({level,topic});
        });
      });
    }else if(state.level){
      state.level.topics.forEach(topic=>rows.push({level:state.level,topic}));
    }

    const levelTabs=state.catalog.levels.map(level=>{
      const ready=level.topics.filter(topic=>topic.status==='ready').length;
      return `<button class="exercise-discovery-level ${state.level?.id===level.id && !query?'active':''}" type="button" data-hub-level="${level.id}">
        <span class="exercise-discovery-level-code">${level.id}</span>
        <span class="exercise-discovery-level-name">${escapeHtml(localize(level.title))}</span>
        <span class="exercise-discovery-level-meta">${ready} ${escapeHtml(ht('ready'))} · ${level.topics.length} ${escapeHtml(ht('total'))}</span>
      </button>`;
    }).join('');

    const cards=rows.length ? rows.map(({level,topic})=>{
      const ready=topic.status==='ready';
      return `<button class="exercise-discovery-topic ${ready?'ready':'soon'}" type="button"
        data-hub-topic="${topic.id}" data-hub-topic-level="${level.id}" ${ready?'':'disabled'}>
        <div class="exercise-discovery-topic-top">
          <span class="exercise-discovery-topic-level">${level.id}</span>
          <span class="exercise-discovery-status ${ready?'ready':'soon'}">${ready?escapeHtml(ht('ready')):escapeHtml(ht('soon'))}</span>
        </div>
        <h3>${escapeHtml(localize(topic.title))}</h3>
        <p>${escapeHtml(localize(topic.description))}</p>
        <div class="exercise-discovery-topic-action">${ready?escapeHtml(ht('open'))+' →':escapeHtml(ht('soon'))}</div>
      </button>`;
    }).join('') : `<div class="exercise-discovery-empty">
      <strong>${escapeHtml(ht('emptyTitle'))}</strong>
      <p>${escapeHtml(ht('emptySub'))}</p>
    </div>`;

    const levelForHeading=state.level?.id || 'A1';
    view.innerHTML=`
      <div class="exercise-discovery-toolbar">
        <div>
          <h2>${escapeHtml(ht('title'))}</h2>
          <p>${escapeHtml(ht('subtitle'))}</p>
        </div>
        <div class="exercise-discovery-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>
          <input id="exerciseHubSearch" type="search" autocomplete="off"
            placeholder="${escapeHtml(ht('search'))}" value="${escapeHtml(state.hubSearch || '')}">
          <button id="exerciseHubSearchClear" class="${state.hubSearch?'visible':''}" type="button" aria-label="Clear">×</button>
        </div>
      </div>

      <div class="exercise-discovery-levels">${levelTabs}</div>
      ${query?`<div class="exercise-discovery-search-note">${escapeHtml(ht('allLevels'))}</div>`:''}

      <div class="exercise-discovery-heading">
        <div>
          <h3>${escapeHtml(query ? ht('title') : ht('levelHeading')(levelForHeading))}</h3>
          <p>${escapeHtml(query ? ht('allLevels') : ht('levelSub')(levelForHeading))}</p>
        </div>
        <span>${rows.length} ${escapeHtml(ht('result'))}</span>
      </div>

      <div class="exercise-discovery-grid">${cards}</div>
    `;

    view.querySelectorAll('[data-hub-level]').forEach(btn=>btn.addEventListener('click',()=>{
      const level=state.catalog.levels.find(item=>item.id===btn.dataset.hubLevel);
      if(!level) return;
      state.level=level;
      state.hubSearch='';
      renderLevels();
      updateBreadcrumb();
    }));

    const search=view.querySelector('#exerciseHubSearch');
    const clear=view.querySelector('#exerciseHubSearchClear');

    search?.addEventListener('input',()=>{
      state.hubSearch=search.value;
      renderLevels();
      const next=$('exerciseHubSearch');
      if(next){
        next.focus();
        next.setSelectionRange(next.value.length,next.value.length);
      }
    });

    clear?.addEventListener('click',()=>{
      state.hubSearch='';
      renderLevels();
      $('exerciseHubSearch')?.focus();
    });

    view.querySelectorAll('.exercise-discovery-topic.ready').forEach(btn=>btn.addEventListener('click',()=>{
      const level=state.catalog.levels.find(item=>item.id===btn.dataset.hubTopicLevel);
      if(!level) return;
      state.level=level;
      state.hubSearch='';
      openTopic(btn.dataset.hubTopic);
    }));
  }

  function openLevel(levelId, writeHistory=true){
    state.level = state.catalog.levels.find(l=>l.id===levelId) || state.catalog.levels[0] || null;
    state.topicMeta=null; state.topicData=null; state.exercise=null; state.hubSearch='';
    renderLevels();
    showOnly('exerciseLevelView');
    updateBreadcrumb();
    if(writeHistory && history.replaceState){
      history.replaceState({
        ...(history.state || {}),
        baPage:'exercises',
        baExerciseView:'topics',
        level:state.level?.id || null,
        topic:null,
        exercise:null
      }, '', '#exercises');
    }
    window.scrollTo({top:document.getElementById('page-exercises')?.offsetTop || 0, behavior:'smooth'});
  }

  function renderTopics(){
    renderLevels();
  }

  async function openTopic(topicId, writeHistory=true){
    try{
      const meta=state.level.topics.find(topic=>topic.id===topicId);
      if(!meta?.path) return;
      state.topicMeta=meta;
      state.topicData=await loadJSON(meta.path);
      state.exercise=null;
      renderSets();
      showOnly('exerciseSetView');
      updateBreadcrumb();
      if(writeHistory){
        if(history.replaceState){
          history.replaceState({
            ...(history.state || {}),
            baPage:'exercises',
            baExerciseView:'topics',
            level:state.level?.id || null,
            topic:null,
            exercise:null
          }, '', '#exercises');
        }
        pushExerciseHistory('sets');
      }
      window.scrollTo({top:document.getElementById('page-exercises')?.offsetTop || 0, behavior:'smooth'});
    }catch(error){ showError(error); }
  }

  function renderSets(){
    if(!state.topicData) return;
    const overview=$('topicOverview');
    if(overview){
      overview.innerHTML=`<span class="tag">${state.topicData.level} · ${t('topicLabel')}</span>
        <h2>${escapeHtml(localize(state.topicData.title))}</h2>
        <p>${escapeHtml(localize(state.topicData.description))}</p>`;
    }
    const grid=$('exerciseSetGrid');
    if(!grid) return;
    const exercises=state.topicData.exercises || [];
    if(!exercises.length){
      grid.innerHTML=`<div class="empty">${t('noExercises')}</div>`;
      return;
    }
    grid.innerHTML=exercises.map(ex=>{
      const hasWritten=(ex.questions || []).some(q=>isWritten(q));
      return `<article class="exercise-set-card">
      <div class="set-meta">
        <span class="set-chip">${escapeHtml(localize(ex.difficulty))}</span>
        <span class="set-chip">${ex.questions?.length || 0} ${t('questions')}</span>
        ${hasWritten?`<span class="set-chip">${escapeHtml(qt('writtenChip'))}</span>`:''}
        ${ex.hideLesson?`<span class="set-chip set-chip-dark">${escapeHtml(qt('noHelpChip'))}</span>`:''}
      </div>
      <h3>${escapeHtml(localize(ex.title))}</h3>
      <p>${escapeHtml(localize(ex.description))}</p>
      <button class="btn primary block" type="button" data-exercise="${ex.id}">${t('openExercise')} →</button>
    </article>`}).join('');
    grid.querySelectorAll('[data-exercise]').forEach(btn=>btn.addEventListener('click',()=>startExercise(btn.dataset.exercise)));
  }

  function renderLesson(){
    const panel=$('dynamicLessonPanel');
    if(!panel || !state.topicData) return;

    const layout=panel.closest('.learn-layout');
    const hide=state.exercise?.hideLesson===true;
    panel.style.display=hide?'none':'block';
    layout?.classList.toggle('solo-quiz', hide);

    if(hide){
      panel.innerHTML='';
      return;
    }

    const lesson=state.topicData.lesson || {};
    const rules=(lesson.rules || []).map(rule=>`<div><strong>${escapeHtml(rule.label)}</strong><span>${escapeHtml(localize(rule.text))}</span></div>`).join('');
    const examples=(lesson.examples || []).map(item=>`<div class="example-line">${escapeHtml(item)}</div>`).join('');
    panel.innerHTML=`
      <div class="topic-status">✓ ${state.topicData.level} · ${escapeHtml(localize(state.topicData.title))}</div>
      <h3 style="margin-top:14px">${escapeHtml(localize(lesson.title))}</h3>
      <p class="sub">${escapeHtml(localize(lesson.intro))}</p>
      ${rules?`<div class="lesson-rule dynamic-rules">${rules}</div>`:''}
      ${examples?`<div class="lesson-content-block"><h4>${t('lessonExamples')}</h4><div class="example-list">${examples}</div></div>`:''}
      ${lesson.tip?`<p class="module-note"><strong>${t('lessonTip')}:</strong> ${escapeHtml(localize(lesson.tip))}</p>`:''}
    `;
  }

  function startExercise(exerciseId, writeHistory=true){
    state.exercise=state.topicData.exercises.find(ex=>ex.id===exerciseId);
    if(!state.exercise) return;
    resetQuiz(state.exercise.questions || []);
    renderLesson();
    showOnly('exerciseQuizView');
    updateBreadcrumb();
    if(writeHistory) pushExerciseHistory('quiz');
    window.scrollTo({top:document.getElementById('page-exercises')?.offsetTop || 0, behavior:'smooth'});
  }

  function bestScoreKey(){
    const level=state.topicData?.level || state.level?.id || 'level';
    const topic=state.topicData?.id || state.topicMeta?.id || 'topic';
    const ex=state.exercise?.id || 'exercise';
    return `baBestScore:${level}:${topic}:${ex}`;
  }

  function updateBestScore(){
    const el=$('bestScore');
    if(!el) return;
    const best=Number(localStorage.getItem(bestScoreKey()) || 0);
    el.textContent=`${t('bestLabel')}: ${best ? best+'/'+state.pool.length : '—'}`;
  }

  function resetQuiz(pool){
    state.pool=pool.map((q,i)=>({...q,_index:i}));
    state.index=0;
    state.selected='';
    state.checked=false;
    state.score=0;
    state.wrong=[];
    state.responses={};
    renderQuiz();
  }

  function renderQuiz(){
    const q=state.pool[state.index];
    if(!q) return;
    const result=$('quizResult'), view=$('quizView');
    if(!result || !view) return;

    ensurePreviousButton();

    result.style.display='none';
    view.style.display='block';
    $('quizCounter').textContent=`${t('questionLabelQuiz')} ${state.index+1} / ${state.pool.length}`;
    $('progressBar').style.width=`${(state.index/state.pool.length)*100}%`;
    $('quizQuestion').textContent=q.sentence;
    $('quizWord').textContent=`${state.topicData.level} · ${localize(state.topicData.title)} · ${q.word || ''}`;

    const response=responseFor(q);
    state.selected=response.selected || '';
    state.checked=Boolean(response.checked);

    const options=$('quizOptions');
    if(isWritten(q)){
      options.innerHTML=`
        <div class="written-answer-wrap">
          <label for="writtenAnswerInput">${escapeHtml(qt('writtenHint'))}</label>
          ${q.multiline
            ? `<textarea id="writtenAnswerInput" class="written-answer-input" rows="3" placeholder="${escapeHtml(qt('writtenPlaceholder'))}">${escapeHtml(state.selected)}</textarea>`
            : `<input id="writtenAnswerInput" class="written-answer-input" type="text" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(qt('writtenPlaceholder'))}" value="${escapeHtml(state.selected)}">`
          }
        </div>`;
      const input=$('writtenAnswerInput');
      if(input){
        input.disabled=state.checked;
        input.addEventListener('input',()=>{
          state.selected=input.value;
          state.responses[q._index]={...responseFor(q),selected:input.value};
        });
      }
    }else{
      options.innerHTML=(q.options || []).map((opt,i)=>`<button class="quiz-option" type="button" data-answer="${escapeHtml(opt)}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(opt)}</span></button>`).join('');
      options.querySelectorAll('.quiz-option').forEach(btn=>{
        btn.addEventListener('click',()=>selectAnswer(btn.dataset.answer));
        if(btn.dataset.answer===state.selected) btn.classList.add('selected');
        if(state.checked) btn.disabled=true;
      });
    }

    const feedback=$('quizFeedback');
    feedback.className='quiz-feedback';
    feedback.innerHTML='';

    const prev=$('prevQuestionBtn');
    if(prev){
      prev.style.display=state.index>0?'inline-flex':'none';
      prev.textContent=qt('previous');
    }

    $('nextQuestionBtn').textContent=state.index===state.pool.length-1?t('finishQuiz'):t('nextQuestion');

    if(state.checked){
      renderCheckedQuestion(q, response);
    }else{
      $('checkAnswerBtn').style.display='inline-flex';
      $('checkAnswerBtn').disabled=false;
      $('nextQuestionBtn').style.display='none';
    }

    updateBestScore();
  }

  function selectAnswer(answer){
    if(state.checked) return;
    const q=state.pool[state.index];
    state.selected=answer;
    state.responses[q._index]={...responseFor(q),selected:answer};
    document.querySelectorAll('#quizOptions .quiz-option').forEach(btn=>btn.classList.toggle('selected',btn.dataset.answer===answer));
  }

  function renderCheckedQuestion(q, response){
    const feedback=$('quizFeedback');
    const explanation=escapeHtml(localize(q.explanations));
    const correctDisplay=escapeHtml(q.correct || (q.answers?.[0] || ''));

    if(response.correct){
      feedback.className='quiz-feedback show good';
      feedback.innerHTML=`<strong>${t('correctTitle')}</strong>${explanation}`;
    }else{
      feedback.className='quiz-feedback show bad';
      feedback.innerHTML=`<strong>${t('wrongTitle')}</strong>${isWritten(q) && correctDisplay ? `<div class="correct-answer-line">${escapeHtml(qt('correctAnswer'))}: <b>${correctDisplay}</b></div>` : ''}${explanation}`;
    }

    if(isWritten(q)){
      const input=$('writtenAnswerInput');
      if(input) input.disabled=true;
    }else{
      document.querySelectorAll('#quizOptions .quiz-option').forEach(btn=>{
        btn.disabled=true;
        btn.classList.remove('selected');
        if(btn.dataset.answer===q.correct) btn.classList.add('correct');
        else if(btn.dataset.answer===response.selected) btn.classList.add('wrong');
      });
    }

    $('checkAnswerBtn').style.display='none';
    $('nextQuestionBtn').style.display='inline-flex';
    $('progressBar').style.width=`${((state.index+1)/state.pool.length)*100}%`;
  }

  function checkAnswer(){
    if(state.checked) return;
    const q=state.pool[state.index];
    const feedback=$('quizFeedback');

    if(isWritten(q)){
      const input=$('writtenAnswerInput');
      state.selected=(input?.value || '').trim();
    }

    if(!state.selected){
      feedback.className='quiz-feedback show bad';
      feedback.innerHTML=`<strong>${t('selectAnswer')}</strong>`;
      return;
    }

    const correct=isWritten(q)
      ? acceptedAnswers(q).includes(normalizeWritten(state.selected))
      : state.selected===q.correct;

    state.responses[q._index]={
      selected:state.selected,
      checked:true,
      correct
    };
    state.checked=true;

    syncScoreAndWrong();
    renderCheckedQuestion(q, state.responses[q._index]);
  }

  function previousQuestion(){
    if(state.index<=0) return;
    state.index--;
    renderQuiz();
  }

  function nextQuestion(){
    const q=state.pool[state.index];
    if(!responseFor(q).checked) return;
    if(state.index<state.pool.length-1){
      state.index++;
      renderQuiz();
    }else{
      syncScoreAndWrong();
      showResult();
    }
  }

  function showResult(){
    syncScoreAndWrong();
    const view=$('quizView'), result=$('quizResult');
    if(!view || !result) return;
    view.style.display='none'; result.style.display='block';
    const total=state.pool.length;
    const percent=Math.round((state.score/total)*100);
    const currentBest=Number(localStorage.getItem(bestScoreKey()) || 0);
    if(state.score>currentBest) localStorage.setItem(bestScoreKey(), String(state.score));
    const message=percent>=90?t('resultPerfect'):percent>=70?t('resultGood'):t('resultPractice');
    const wrongHtml=state.wrong.length
      ? `<div class="wrong-summary"><strong>${t('wrongAnswersTitle')}</strong>${state.wrong.map(q=>`<div><strong>${escapeHtml(q.correct || q.answers?.[0] || '')} ${escapeHtml(q.word || '')}</strong><br><small>${escapeHtml(localize(q.explanations))}</small></div>`).join('')}</div>`
      : `<div class="notice" style="margin-top:22px">${t('noWrongAnswers')}</div>`;
    result.innerHTML=`<div class="result-box">
      <span class="quiz-word">${state.topicData.level} · ${escapeHtml(localize(state.topicData.title))}</span>
      <h3>${escapeHtml(localize(state.exercise.title))}</h3>
      <div class="result-score"><div><strong>${state.score}/${total}</strong><span>${percent}% ${t('scoreLabel')}</span></div></div>
      <p class="result-message">${message}</p>
      ${wrongHtml}
      <div class="quiz-actions" style="justify-content:center">
        <button class="btn primary" type="button" id="restartQuizBtn">${t('restartQuiz')}</button>
        ${state.wrong.length?`<button class="btn gold" type="button" id="retryWrongBtn">${t('retryWrong')}</button>`:''}
        <button class="btn ghost" type="button" id="resultBackBtn">${t('backToExercises')}</button>
      </div>
    </div>`;
    $('restartQuizBtn')?.addEventListener('click',()=>resetQuiz(state.exercise.questions || []));
    $('retryWrongBtn')?.addEventListener('click',()=>resetQuiz(state.wrong.map(q=>({...q}))));
    $('resultBackBtn')?.addEventListener('click',()=>goBackToDepth(2, ()=>goSets(false)));
  }

  function goLevels(writeHistory=false){
    state.level=state.catalog?.levels?.[0] || null;
    state.topicMeta=null; state.topicData=null; state.exercise=null; state.hubSearch='';
    showOnly('exerciseLevelView');
    renderLevels();
    updateBreadcrumb();
    if(writeHistory) pushExerciseHistory('levels');
  }
  function goTopics(writeHistory=false){
    if(!state.level) state.level=state.catalog?.levels?.[0] || null;
    state.topicMeta=null; state.topicData=null; state.exercise=null; state.hubSearch='';
    renderLevels();
    showOnly('exerciseLevelView');
    updateBreadcrumb();
    if(writeHistory) pushExerciseHistory('topics');
  }
  function goSets(writeHistory=false){
    if(!state.topicData){ goTopics(); return; }
    state.exercise=null;
    renderSets();
    showOnly('exerciseSetView');
    updateBreadcrumb();
    if(writeHistory) pushExerciseHistory('sets');
  }

  async function restoreHistoryState(histState){
    if(!state.catalog) return;
    const page=histState?.baPage || (location.hash || '#home').slice(1).split('/')[0];
    if(page!=='exercises') return;

    const view=histState?.baExerciseView || 'levels';
    if(view==='levels'){
      const requested=state.catalog.levels.find(l=>l.id===histState?.level);
      state.level=requested || state.catalog.levels[0] || null;
      goTopics(false);
      return;
    }

    const level=state.catalog.levels.find(l=>l.id===histState.level);
    if(!level){
      goLevels(false);
      return;
    }
    state.level=level;

    if(view==='topics'){
      state.topicMeta=null; state.topicData=null; state.exercise=null; state.hubSearch='';
      renderLevels();
      showOnly('exerciseLevelView');
      updateBreadcrumb();
      return;
    }

    const meta=level.topics.find(topic=>topic.id===histState.topic);
    if(!meta?.path){
      goTopics(false);
      return;
    }

    try{
      state.topicMeta=meta;
      state.topicData=await loadJSON(meta.path);
      state.exercise=null;

      if(view==='sets'){
        renderSets();
        showOnly('exerciseSetView');
        updateBreadcrumb();
        return;
      }

      if(view==='quiz'){
        const exercise=state.topicData.exercises?.find(ex=>ex.id===histState.exercise);
        if(!exercise){
          renderSets();
          showOnly('exerciseSetView');
          updateBreadcrumb();
          return;
        }
        startExercise(exercise.id, false);
        return;
      }

      goLevels(false);
    }catch(error){
      showError(error);
    }
  }

  function rerenderForLanguage(){
    if(!state.catalog) return;
    updateExerciseHero();
    if($('exerciseLevelView')?.style.display!=='none') renderLevels();
    if($('exerciseTopicView')?.style.display!=='none') renderLevels();
    if($('exerciseSetView')?.style.display!=='none') renderSets();
    if($('exerciseQuizView')?.style.display!=='none'){
      renderLesson();
      if($('quizResult')?.style.display==='none') renderQuiz();
      else showResult();
    }
    updateBreadcrumb();
  }

  async function init(){
    try{
      injectHubCss();
      updateExerciseHero();
      state.catalog=await loadJSON('data/catalog.json');
      state.level=state.catalog.levels[0] || null;
      renderLevels();
      updateBreadcrumb();
      $('backToLevelsBtn')?.addEventListener('click',()=>goBackToDepth(0, ()=>goLevels(false)));
      $('backToTopicsBtn')?.addEventListener('click',()=>goBackToDepth(1, ()=>goTopics(false)));
      $('backToSetsBtn')?.addEventListener('click',()=>goBackToDepth(2, ()=>goSets(false)));
      ensurePreviousButton();
      $('checkAnswerBtn')?.addEventListener('click',checkAnswer);
      $('nextQuestionBtn')?.addEventListener('click',nextQuestion);
      await restoreHistoryState(history.state);
    }catch(error){ showError(error); }
  }

  window.addEventListener('popstate', event=>restoreHistoryState(event.state));
  window.addEventListener('ba:pagechange', event=>{
    if(event.detail?.page==='exercises' && !history.state?.baExerciseView && state.catalog){
      goLevels(false);
    }
  });
  window.addEventListener('ba:languagechange',rerenderForLanguage);
  document.addEventListener('DOMContentLoaded',init);
})();
