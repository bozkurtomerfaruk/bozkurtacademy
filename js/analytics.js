// GoatCounter visitor statistics for the public pages (index.html only; never on the login,
// registration or panel pages). No cookies, no localStorage. js/vendor/count.js does the sending
// and skips localhost by itself; see js/vendor/README.md and docs/privacy-policy.md.
//
// The site navigates with hash URLs, so each page change is counted as its own path, e.g.
// "/#lessons", "/#grammar/A1/artikel", "/#exercises/A1/artikel/kontext-1". Question numbers are
// dropped so that one exercise is one page.
(() => {
  const gc = window.goatcounter;
  if(!gc?.count || gc.filter()) return;

  // How many hash segments identify a page: exercises/level/topic/exercise, grammar/level/topic,
  // exams/exam/level/section.
  const DEPTH = { exercises: 4, grammar: 3, exams: 4 };

  function currentPath(){
    const parts = location.hash.replace(/^#/, '').split(/[/?]/).filter(Boolean);
    if(!parts.length || parts[0] === 'home') return '/';
    return '/#' + parts.slice(0, DEPTH[parts[0]] || 1).join('/');
  }

  let last = null;
  let first = true;
  let timer = null;

  function countIfChanged(){
    const path = currentPath();
    if(path === last) return;
    last = path;
    // The external referrer belongs to the first page only; later pages are internal navigation.
    gc.count({ path, referrer: first ? document.referrer : '' });
    first = false;
  }

  // Pages change the address with pushState/replaceState (often twice in a row), so wait briefly.
  function schedule(){
    clearTimeout(timer);
    timer = setTimeout(countIfChanged, 400);
  }

  for(const name of ['pushState', 'replaceState']){
    const original = history[name];
    history[name] = function(...args){
      const result = original.apply(this, args);
      schedule();
      return result;
    };
  }
  window.addEventListener('popstate', schedule);
  window.addEventListener('hashchange', schedule);
  schedule();
})();
