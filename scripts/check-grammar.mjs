import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const catalog=read('data/catalog.json'), registry=read('data/grammar-index.json').levels, legacy=read('data/grammar-legacy.json');
let count=0;
for(const level of catalog.levels){
 const lessons=registry[level.id]?read(registry[level.id]).lessons:[];
 const ids=new Set(lessons.map(l=>l.id));
 if(ids.size!==lessons.length)throw Error('Duplicate lesson '+level.id);
 for(const topic of level.topics)if(!ids.has(topic.id) && !(legacy[level.id]||[]).includes(topic.id))throw Error('Missing grammar: '+level.id+'/'+topic.id);
 for(const l of lessons){
  if(!level.topics.some(t=>t.id===l.id))throw Error('Orphan lesson '+l.id);
  if(!l.title || !l.lead || l.sections.length<5 || l.faq.length<3 || l.related.length<3 || !l.summary || !l.check)throw Error('Incomplete lesson '+l.id);
  for(const id of l.related)if(!ids.has(id))throw Error('Missing related lesson '+id);
  count++;
 }
}
console.log('PASS: '+count+' grammar lessons; every new exercise topic has an explanation');
