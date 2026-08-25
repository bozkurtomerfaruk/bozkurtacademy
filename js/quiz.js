
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
    wrong:[]
  };

  const lang = () => window.BA?.lang || 'tr';
  const t = (key) => window.BA?.t(key) || key;
  const localize = (value) => {
    if(value == null) return '';
    if(typeof value === 'string') return value;
    return value[lang()] || value.tr || value.de || value.en || '';
  };

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
      if(target==='levels') goLevels();
      if(target==='topics') goTopics();
      if(target==='sets') goSets();
    }));
  }

  function escapeHtml(value){
    return String(value ?? '').replace(/[&<>"']/g, ch=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    })[ch]);
  }

  function renderLevels(){
    if(!state.catalog) return;
    const grid = $('levelChoiceGrid');
    if(!grid) return;
    grid.innerHTML = state.catalog.levels.map(level=>{
      const ready = level.topics.filter(topic=>topic.status==='ready').length;
      return `<button class="level-choice-card" type="button" data-level="${level.id}">
        <span class="level">${level.id}</span>
        <h3>${escapeHtml(localize(level.title))}</h3>
        <p>${escapeHtml(localize(level.description))}</p>
        <div class="level-choice-meta">
          <span class="ready-count">${ready} ${t('readyTopics')}</span>
          <span class="total-count">${level.topics.length} ${t('topics')}</span>
        </div>
      </button>`;
    }).join('');
    grid.querySelectorAll('[data-level]').forEach(btn=>btn.addEventListener('click',()=>openLevel(btn.dataset.level)));
  }

  function openLevel(levelId){
    state.level = state.catalog.levels.find(l=>l.id===levelId);
    state.topicMeta=null; state.topicData=null; state.exercise=null;
    renderTopics();
    showOnly('exerciseTopicView');
    updateBreadcrumb();
    window.scrollTo({top:document.getElementById('page-exercises')?.offsetTop || 0, behavior:'smooth'});
  }

  function renderTopics(){
    if(!state.level) return;
    const title=$('topicViewTitle');
    if(title) title.textContent=`${state.level.id} · ${localize(state.level.title)}`;
    const grid=$('topicChoiceGrid');
    if(!grid) return;
    grid.innerHTML=state.level.topics.map(topic=>{
      const ready=topic.status==='ready';
      return `<button class="topic-choice-card ${ready?'ready':'soon'}" type="button" data-topic="${topic.id}" ${ready?'':'disabled'}>
        <div class="topic-card-top">
          <span class="${ready?'status-ready':'status-soon'}">${ready?t('ready'):t('soon')}</span>
          ${ready?'<span class="topic-arrow">→</span>':''}
        </div>
        <h3>${escapeHtml(localize(topic.title))}</h3>
        <p>${escapeHtml(localize(topic.description))}</p>
      </button>`;
    }).join('');
    grid.querySelectorAll('.topic-choice-card.ready').forEach(btn=>btn.addEventListener('click',()=>openTopic(btn.dataset.topic)));
  }

  async function openTopic(topicId){
    try{
      const meta=state.level.topics.find(topic=>topic.id===topicId);
      if(!meta?.path) return;
      state.topicMeta=meta;
      state.topicData=await loadJSON(meta.path);
      state.exercise=null;
      renderSets();
      showOnly('exerciseSetView');
      updateBreadcrumb();
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
    grid.innerHTML=exercises.map(ex=>`<article class="exercise-set-card">
      <div class="set-meta">
        <span class="set-chip">${escapeHtml(localize(ex.difficulty))}</span>
        <span class="set-chip">${ex.questions?.length || 0} ${t('questions')}</span>
      </div>
      <h3>${escapeHtml(localize(ex.title))}</h3>
      <p>${escapeHtml(localize(ex.description))}</p>
      <button class="btn primary block" type="button" data-exercise="${ex.id}">${t('openExercise')} →</button>
    </article>`).join('');
    grid.querySelectorAll('[data-exercise]').forEach(btn=>btn.addEventListener('click',()=>startExercise(btn.dataset.exercise)));
  }

  function renderLesson(){
    const panel=$('dynamicLessonPanel');
    if(!panel || !state.topicData) return;
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

  function startExercise(exerciseId){
    state.exercise=state.topicData.exercises.find(ex=>ex.id===exerciseId);
    if(!state.exercise) return;
    resetQuiz(state.exercise.questions || []);
    renderLesson();
    showOnly('exerciseQuizView');
    updateBreadcrumb();
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
    renderQuiz();
  }

  function renderQuiz(){
    const q=state.pool[state.index];
    if(!q) return;
    const result=$('quizResult'), view=$('quizView');
    if(!result || !view) return;
    result.style.display='none';
    view.style.display='block';
    $('quizCounter').textContent=`${t('questionLabelQuiz')} ${state.index+1} / ${state.pool.length}`;
    $('progressBar').style.width=`${(state.index/state.pool.length)*100}%`;
    $('quizQuestion').textContent=q.sentence;
    $('quizWord').textContent=`${state.topicData.level} · ${localize(state.topicData.title)} · ${q.word || ''}`;
    const options=$('quizOptions');
    options.innerHTML=(q.options || []).map((opt,i)=>`<button class="quiz-option" type="button" data-answer="${escapeHtml(opt)}"><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${escapeHtml(opt)}</span></button>`).join('');
    state.selected=''; state.checked=false;
    const feedback=$('quizFeedback');
    feedback.className='quiz-feedback'; feedback.innerHTML='';
    $('checkAnswerBtn').style.display='inline-flex'; $('checkAnswerBtn').disabled=false;
    $('nextQuestionBtn').style.display='none';
    $('nextQuestionBtn').textContent=state.index===state.pool.length-1?t('finishQuiz'):t('nextQuestion');
    options.querySelectorAll('.quiz-option').forEach(btn=>btn.addEventListener('click',()=>selectAnswer(btn.dataset.answer)));
    updateBestScore();
  }

  function selectAnswer(answer){
    if(state.checked) return;
    state.selected=answer;
    document.querySelectorAll('#quizOptions .quiz-option').forEach(btn=>btn.classList.toggle('selected',btn.dataset.answer===answer));
  }

  function checkAnswer(){
    if(state.checked) return;
    const feedback=$('quizFeedback');
    if(!state.selected){
      feedback.className='quiz-feedback show bad';
      feedback.innerHTML=`<strong>${t('selectAnswer')}</strong>`;
      return;
    }
    state.checked=true;
    const q=state.pool[state.index];
    const correct=state.selected===q.correct;
    if(correct){
      state.score++;
      feedback.className='quiz-feedback show good';
      feedback.innerHTML=`<strong>${t('correctTitle')}</strong>${escapeHtml(localize(q.explanations))}`;
    }else{
      state.wrong.push(q);
      feedback.className='quiz-feedback show bad';
      feedback.innerHTML=`<strong>${t('wrongTitle')}</strong>${escapeHtml(localize(q.explanations))}`;
    }
    document.querySelectorAll('#quizOptions .quiz-option').forEach(btn=>{
      btn.classList.remove('selected');
      if(btn.dataset.answer===q.correct) btn.classList.add('correct');
      else if(btn.dataset.answer===state.selected) btn.classList.add('wrong');
    });
    $('checkAnswerBtn').style.display='none';
    $('nextQuestionBtn').style.display='inline-flex';
    $('progressBar').style.width=`${((state.index+1)/state.pool.length)*100}%`;
  }

  function nextQuestion(){
    if(!state.checked) return;
    if(state.index<state.pool.length-1){
      state.index++;
      renderQuiz();
    }else showResult();
  }

  function showResult(){
    const view=$('quizView'), result=$('quizResult');
    if(!view || !result) return;
    view.style.display='none'; result.style.display='block';
    const total=state.pool.length;
    const percent=Math.round((state.score/total)*100);
    const currentBest=Number(localStorage.getItem(bestScoreKey()) || 0);
    if(state.score>currentBest) localStorage.setItem(bestScoreKey(), String(state.score));
    const message=percent>=90?t('resultPerfect'):percent>=70?t('resultGood'):t('resultPractice');
    const wrongHtml=state.wrong.length
      ? `<div class="wrong-summary"><strong>${t('wrongAnswersTitle')}</strong>${state.wrong.map(q=>`<div><strong>${escapeHtml(q.correct)} ${escapeHtml(q.word || '')}</strong><br><small>${escapeHtml(localize(q.explanations))}</small></div>`).join('')}</div>`
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
    $('resultBackBtn')?.addEventListener('click',goSets);
  }

  function goLevels(){
    state.level=null; state.topicMeta=null; state.topicData=null; state.exercise=null;
    showOnly('exerciseLevelView');
    renderLevels();
    updateBreadcrumb();
  }
  function goTopics(){
    if(!state.level){ goLevels(); return; }
    state.topicMeta=null; state.topicData=null; state.exercise=null;
    renderTopics();
    showOnly('exerciseTopicView');
    updateBreadcrumb();
  }
  function goSets(){
    if(!state.topicData){ goTopics(); return; }
    state.exercise=null;
    renderSets();
    showOnly('exerciseSetView');
    updateBreadcrumb();
  }

  function rerenderForLanguage(){
    if(!state.catalog) return;
    if($('exerciseLevelView')?.style.display!=='none') renderLevels();
    if($('exerciseTopicView')?.style.display!=='none') renderTopics();
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
      state.catalog=await loadJSON('data/catalog.json');
      renderLevels();
      updateBreadcrumb();
      $('backToLevelsBtn')?.addEventListener('click',goLevels);
      $('backToTopicsBtn')?.addEventListener('click',goTopics);
      $('backToSetsBtn')?.addEventListener('click',goSets);
      $('checkAnswerBtn')?.addEventListener('click',checkAnswer);
      $('nextQuestionBtn')?.addEventListener('click',nextQuestion);
    }catch(error){ showError(error); }
  }

  window.addEventListener('ba:languagechange',rerenderForLanguage);
  document.addEventListener('DOMContentLoaded',init);
})();
