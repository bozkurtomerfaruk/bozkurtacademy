(() => {
 'use strict';
 const h = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const dataPromises={};
 function load(level='A1') {
   if (!/^[AB][12]$/.test(level)) return Promise.reject(Error('Geçersiz seviye'));
   if (!dataPromises[level]) dataPromises[level] = fetch('data/'+level.toLowerCase()+'-grammar.json?v=1').then(r=>{if(!r.ok)throw Error('Dersler yüklenemedi');return r.json();}).catch(e=>{delete dataPromises[level];throw e;});
   return dataPromises[level];
 }
 const tiles = (items,cls='') => `<div class="lesson-diagram-tiles ${cls}">${items.map(([main,sub])=>`<div><strong lang="de">${h(main)}</strong><span>${h(sub)}</span></div>`).join('')}</div>`;
 function figure(f) {
   let body='',caption='';
   if(f.type==='sentence') {body=tiles(f.parts.map((p,i)=>[p,f.labels[i]]),'sentence-tiles');caption='Cümleyi parçalara ayır: her kutu bir görevi gösterir.';}
   if(f.type==='articles') {body=tiles([['der Tisch','maskulin'],['die Tasche','feminin'],['das Buch','neutral']]);caption='İsmi ve artikelini tek bir öğrenme birimi olarak düşün.';}
   if(f.type==='plural') {body=tiles([['das Buch','bir kitap'],['→','tekilden çoğula'],['die Bücher','birden fazla kitap']]);caption='Hem artikel hem ismin biçimi değişebilir.';}
   if(f.type==='ownership') {body=tiles([['Paul → sein-','Sahip kökü seçtirir'],['die Tasche → -e','İsim eki seçtirir'],['seine Tasche','İki bilgiyi birleştir']]);caption='Kök ve ek iki farklı sorunun cevabıdır.';}
   if(f.type==='timeline') {body=tiles([['vor einem Jahr','Şimdiden bir yıl önce'],['seit einem Jahr → jetzt','O zaman başladı, şimdi sürüyor'],['in einem Jahr','Şimdiden bir yıl sonra']],'timeline-tiles');caption='vor / seit / in: aynı süre, üç farklı zaman anlamı.';}
   if(f.type==='clock') {body=`<svg viewBox="0 0 240 240" role="img" aria-label="Saat dokuz buçuk: Almancada halb zehn"><circle cx="120" cy="120" r="98"/><text x="120" y="43">12</text><text x="203" y="126">3</text><text x="120" y="211">6</text><text x="37" y="126">9</text><path d="M120 120 L120 188 M120 120 L66 104"/><circle cx="120" cy="120" r="5"/></svg><p lang="de"><strong>09:30 = halb zehn</strong></p>`;caption='Yarım saatten sonraki saati söyle: 09.30 için zehn.';}
   if(f.type==='space') {body=`<svg viewBox="0 0 560 190" role="img" aria-label="Kutu içindeki top konumu, kutuya doğru ok hedefi, kutudan çıkan ok kökeni gösterir"><g><rect x="34" y="20" width="110" height="110"/><circle cx="89" cy="75" r="18"/><text x="89" y="164">Wo? · in dem</text></g><g><rect x="225" y="20" width="110" height="110"/><path d="M178 75 H272 m-12 -12 12 12 -12 12"/><text x="280" y="164">Wohin? · in das</text></g><g><rect x="416" y="20" width="110" height="110"/><path d="M465 75 H550 m-12 -12 12 12 -12 12"/><text x="470" y="164">Woher? · aus dem</text></g></svg>`;caption='Konum, hedef ve köken: önce hangi soruyu cevapladığını belirle.';}
   if(f.type==='tiles') {body=tiles(f.items);caption=f.caption;}
   if(f.type==='reflexive') {body='<svg viewBox="0 0 420 150" role="img" aria-label="Eylem özneye geri döner: ich wasche mich"><circle cx="65" cy="55" r="25"/><path d="M45 90 Q65 70 85 90 L100 128 H30 Z M120 55 H330 Q370 55 370 90 Q370 125 330 125 H130 m15 -10 -15 10 15 10"/><text x="240" y="35">wasche</text><text x="240" y="105">mich → aynı kişi</text></svg>';caption='Özne ve dönüşlü zamir aynı kişiyi gösterir: Ich wasche mich.';}
   if(f.type==='comparison') {body='<svg viewBox="0 0 480 230" role="img" aria-label="Üç sütun: klein, kleiner, am kleinsten"><rect x="40" y="35" width="90" height="125"/><rect x="195" y="75" width="90" height="85"/><rect x="350" y="115" width="90" height="45"/><text x="85" y="195">klein</text><text x="240" y="195">kleiner</text><text x="395" y="195">am kleinsten</text></svg>';caption='Soldan sağa boy küçülür: küçük → daha küçük → en küçük.';}
   return body?`<figure class="a1-figure ${h(f.type)}">${body}<figcaption>${h(caption)}</figcaption></figure>`:'';
 }
 function section(s,i) {
   return `<section class="a1-section" id="a1-step-${i}"><h3>${h(s.title)}</h3>${s.paragraphs.map(p=>`<p>${h(p)}</p>`).join('')}${s.table?`<div class="a1-table-wrap" tabindex="0" role="region" aria-label="${h(s.title)} tablosu"><table><thead><tr>${s.table.headers.map(x=>`<th scope="col">${h(x)}</th>`).join('')}</tr></thead><tbody>${s.table.rows.map(row=>`<tr>${row.map((x,j)=>j===0?`<th scope="row">${h(x)}</th>`:`<td>${h(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}${s.figure?figure(s.figure):''}${s.examples?`<div class="a1-examples">${s.examples.map(e=>`<div class="a1-example"><p lang="de">${h(e.de)}</p><p>${h(e.tr)}</p>${e.note?`<small>${h(e.note)}</small>`:''}</div>`).join('')}</div>`:''}</section>`;
 }
 async function render(container,id,openRelated,level='A1') {
   const data=await load(level);const lesson=data.lessons.find(l=>l.id===id);
   if(container.dataset.lesson!==level+'/'+id)return null;
   if(!lesson)throw Error('Konu bulunamadı');
   container.innerHTML=`<article class="a1-article" lang="tr">
     <div class="a1-breadcrumb"><button type="button" data-a1-back>Gramer</button><span>› ${h(level)} › ${h(lesson.title)}</span></div>
     <header class="a1-article-header"><span class="tag">${h(level)} · Türkçe anlatım, Almanca örnekler</span><h2 tabindex="-1">${h(lesson.title)}</h2><p class="a1-lead">${h(lesson.lead)}</p></header>
     <nav class="a1-contents" aria-label="Bu anlatımda"><strong>Bu anlatımda</strong>${lesson.sections.map((s,i)=>`<a href="#a1-step-${i}" data-a1-scroll="a1-step-${i}">${h(s.title)}</a>`).join('')}<a href="#a1-faq" data-a1-scroll="a1-faq">Sık sorulan sorular</a></nav>
     ${lesson.sections.map(section).join('')}
     <section class="a1-section a1-summary"><h3>Kısa tekrar</h3><ul>${lesson.summary.map(x=>`<li>${h(x)}</li>`).join('')}</ul><details class="a1-check"><summary>Kendini kontrol et: ${h(lesson.check.question)}</summary><p><strong lang="de">${h(lesson.check.answer)}</strong></p><p>${h(lesson.check.why)}</p></details></section>
     <section class="a1-practice"><span class="tag">Şimdi uygulama zamanı</span><h3>Konuyu alıştırmalarla pekiştir</h3><p>Örnekleri anladıysan kısa sorularla devam et. Yanlış yaptığında cevap açıklamasını okuyup bu anlatıma dönebilirsin.</p><a class="btn primary" data-a1-practice href="#exercises/${h(level)}/${h(id)}">${h(lesson.title)} alıştırmaları →</a><p class="a1-practice-status" role="status"></p></section>
     <section class="a1-section" id="a1-faq"><h3>Sık sorulan sorular</h3>${lesson.faq.map(f=>`<details class="a1-faq"><summary>${h(f.question)}</summary><p>${h(f.answer)}</p></details>`).join('')}</section>
     <section class="a1-section"><h3>Benzer ve bağlantılı konular</h3><div class="a1-related">${lesson.related.map(key=>{const item=data.lessons.find(l=>l.id===key);return `<a href="#grammar/${h(level)}/${h(key)}" data-a1-related="${h(key)}">${h(item.title)} <span aria-hidden="true">→</span></a>`}).join('')}</div></section>
     <aside class="a1-author"><img src="images/omer-faruk.jpg" width="84" height="84" loading="lazy" alt="Ömer Faruk Bozkurt"><div><span class="tag">Almanca eğitmeni</span><h3>Ömer Faruk Bozkurt</h3><p>Almanya’da yaşıyor, online Almanca dersleri veriyorum. Derslerimde konuları açık örnekler, düzenli tekrar ve günlük kullanım üzerinden ele alıyorum.</p><a href="#about" data-a1-about>Hakkımda daha fazla bilgi →</a></div></aside>
     ${lesson.reading?`<p class="a1-reading">Ek okuma: <a href="${h(lesson.reading)}" target="_blank" rel="noopener noreferrer">${h(lesson.readingTitle || 'Deutsch mit Anna · '+lesson.title)}</a> (Almanca). Bu sayfadaki Türkçe anlatım ve örnekler Bozkurt Academy için hazırlanmıştır.</p>`:''}
     <section class="a1-section a1-comments"><h3>Soru ve yorumlar</h3><p>Konuda takıldığın yeri veya öğrenme deneyimini paylaşabilirsin. Yorumlar incelemeden sonra yayımlanır; e-posta adresin gösterilmez.</p><div class="a1-comment-list" aria-live="polite"><p>Yorumlar yükleniyor…</p></div>
       <form class="a1-comment-form" novalidate><div class="a1-comment-fields"><label>Adın<input name="name" autocomplete="name" maxlength="60" required></label><label>E-posta adresin<input name="email" type="email" autocomplete="email" maxlength="254" required></label></div><label>Yorumun<textarea name="comment" rows="5" minlength="10" maxlength="2000" required></textarea></label><div class="a1-honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><label class="a1-consent"><input name="consent" type="checkbox" required><span>Yorumumun incelenip adımla bu konuda yayımlanmasını kabul ediyorum. E-posta adresim yalnızca yorumum hakkında iletişim için kullanılabilir.</span></label><button class="btn primary" type="submit">Yorumu gönder</button><p class="a1-comment-status" role="status" aria-live="polite"></p></form>
     </section><button class="btn ghost" type="button" data-a1-back>← ${h(level)} gramer konularına dön</button>
   </article>`;
   container.querySelectorAll('[data-a1-related]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();openRelated(link.dataset.a1Related);}));
   container.querySelectorAll('[data-a1-scroll]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();container.querySelector('#'+link.dataset.a1Scroll)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}));
   container.querySelector('[data-a1-about]').addEventListener('click',e=>{e.preventDefault();window.BA.showPage('about');});
   container.querySelector('[data-a1-practice]').addEventListener('click',async e=>{
     e.preventDefault();const status=container.querySelector('.a1-practice-status');
     try {await window.BAQuiz.openTopic(level,id);}catch(_){status.textContent='Alıştırma açılamadı. Bağlantıyı yeni sekmede açabilir veya biraz sonra tekrar deneyebilirsin.';}
   });
   setupComments(container,lesson,level);
   return lesson;
 }
 async function setupComments(container,lesson,level) {
   const list=container.querySelector('.a1-comment-list');
   (async () => {try {
     const response=await fetch('data/grammar-comments.json',{cache:'no-store'});if(!response.ok)throw Error('comments');
     const data=await response.json();const rows=Array.isArray(data[level+'/'+lesson.id] || data[lesson.id])?(data[level+'/'+lesson.id] || data[lesson.id]):[];
     list.innerHTML=rows.length?rows.map(row=>`<article class="a1-comment"><header><strong>${h(row.name)}</strong> <time>${h(row.date)}</time></header><p>${h(row.comment)}</p>${row.reply?`<div class="a1-comment-reply"><strong>Ömer Faruk Bozkurt</strong><p>${h(row.reply)}</p></div>`:''}</article>`).join(''):'<p>Bu konudaki ilk yorumu sen yazabilirsin.</p>';
   } catch(_) {list.innerHTML='<p>Yayımlanan yorumlar şu anda yüklenemiyor. Yine de yorumunu gönderebilirsin.</p>';}})();
   const form=container.querySelector('.a1-comment-form');const status=container.querySelector('.a1-comment-status');
   let submitting=false,lastSent=0;
   form.addEventListener('submit',async event=>{
     event.preventDefault();if(submitting)return;
     const values=new FormData(form);const name=String(values.get('name')||'').trim(),email=String(values.get('email')||'').trim(),comment=String(values.get('comment')||'').trim();
     status.className='a1-comment-status';
     if(values.get('website'))return;
     if(!name || name.length>60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || comment.length<10 || comment.length>2000 || !values.get('consent')){status.textContent='Adını, geçerli e-posta adresini ve en az 10 karakterlik yorumunu yazıp yayımlama onayını işaretle.';status.classList.add('error');return;}
     if(Date.now()-lastSent<30000){status.textContent='Yeni bir yorum göndermeden önce kısa bir süre bekle.';return;}
     submitting=true;const button=form.querySelector('[type="submit"]');button.disabled=true;status.textContent='Yorumun gönderiliyor…';
     try {
       const response=await fetch('https://formsubmit.co/ajax/bozkurtt.omerfaruk@gmail.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name,email,message:comment,topic:lesson.title,topic_id:lesson.id,level,publication_consent:'Öğrenci yorumunun adıyla yayımlanmasına onay verdi.',_subject:'Bozkurt Academy - '+level+' yorum incelemesi: '+lesson.title,_replyto:email,_url:'https://bozkurtacademy.com/#grammar/'+level+'/'+lesson.id,_template:'table'})});
       const result=await response.json();if(!response.ok || result.success===false || result.success==='false')throw Error('send');
       form.reset();lastSent=Date.now();status.textContent='Yorumun inceleme için gönderildi. Onaylandıktan sonra bu konuda yayımlanabilir.';status.classList.add('success');
     }catch(_){status.textContent='Yorumun gönderilemedi. Yazdıkların korundu; biraz sonra tekrar deneyebilirsin.';status.classList.add('error');}
     finally{submitting=false;button.disabled=false;}
   });
 }
 window.BAA1Lessons={load,render};
})();
