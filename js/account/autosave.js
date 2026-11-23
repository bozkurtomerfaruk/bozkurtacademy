// Otomatik kayıt zamanlayıcısı (DOM ve Firebase kullanmaz; tests/autosave.test.mjs).
//  - Yazmayı bırakınca debounceMs (1,5 sn) sonra kaydeder.
//  - Durmadan yazılsa da ilk kaydedilmemiş değişiklikten en geç maxWaitMs (10 sn) sonra kaydeder.
//  - İki kaydın başlangıcı arasında en az minGapMs (2 sn) olur: bir saatte en çok 1.800 yazma.
//  - Aynı anda tek kayıt: kayıt sürerken gelen değişiklikler kayıt bitince kaydedilir.
//  - Hata olursa artan aralıklarla yeniden dener; error.retry === false ise (ör. not çok büyük) bir sonraki
//    değişikliği bekler.
//  - flush(): bekleme süresi olmadan hemen kaydeder (sayfadan çıkarken, başlık değişince).
// save() kendi anlık görüntüsünü alır; değişiklik kaydın ortasında olursa "kirli" kalır ve tekrar kaydedilir.
export function createAutosave({
  save, onState = () => {}, debounceMs = 1500, maxWaitMs = 10000, minGapMs = 2000,
  retryMs = [3000, 6000, 15000, 30000], now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout
}){
  let dirty = false, saving = false, stopped = false, forced = false;
  let firstDirtyAt = 0, lastChangeAt = 0, lastStartAt = -Infinity, lastFailAt = 0, failures = 0, waitForChange = false;
  let timer = null, state = 'saved', current = null;

  const set = (next, info) => { state = next; onState(next, info); };
  const clear = () => { if(timer !== null){ clearTimer(timer); timer = null; } };

  function plan(){
    clear();
    if(!dirty || saving || stopped || waitForChange) return;
    let at;
    if(forced) at = now();
    else{
      at = Math.min(lastChangeAt + debounceMs, firstDirtyAt + maxWaitMs);
      at = Math.max(at, lastStartAt + minGapMs);
    }
    if(failures) at = Math.max(at, lastFailAt + retryMs[Math.min(failures, retryMs.length) - 1]);
    timer = setTimer(run, Math.max(0, at - now()));
  }

  async function run(){
    timer = null;
    if(!dirty || saving || stopped) return;
    saving = true;
    dirty = false;
    forced = false;
    firstDirtyAt = 0;
    lastStartAt = now();
    set('saving');
    current = (async () => save())();
    try{
      await current;
      failures = 0;
      saving = false;
      if(dirty){ set('dirty'); plan(); }
      else set('saved');
    }catch(error){
      saving = false;
      dirty = true;
      if(!firstDirtyAt) firstDirtyAt = now();
      if(error && error.retry === false){
        waitForChange = true;
      }else{
        failures++;
        lastFailAt = now();
      }
      set('error', error);
      plan();
    }finally{
      current = null;
    }
  }

  return {
    change(){
      if(stopped) return;
      const t = now();
      if(!dirty){ dirty = true; firstDirtyAt = t; }
      lastChangeAt = t;
      waitForChange = false;
      if(!saving) set('dirty');
      plan();
    },
    // Bekleyen değişikliği hemen kaydeder (minGapMs'yi de beklemez). Kayıt sürüyorsa bittiğinde hemen kaydeder.
    flush(){
      if(stopped || !dirty) return current || Promise.resolve();
      forced = true;
      failures = 0;
      waitForChange = false;
      if(!saving) { clear(); run(); }
      return current || Promise.resolve();
    },
    // Bağlantı geri gelince: hata beklemesini sıfırla, hemen dene.
    retryNow(){
      if(stopped || !dirty || saving) return;
      failures = 0;
      forced = true;
      waitForChange = false;
      plan();
    },
    stop(){ stopped = true; clear(); },
    resume(){ stopped = false; plan(); },
    get pending(){ return dirty || saving; },
    get dirty(){ return dirty; },
    get saving(){ return saving; },
    get state(){ return state; }
  };
}
