// Sadece yerel emülatör modu: Google Calendar API'nin sahte hâli (js/account/calendar.js bunu canlıda hiç yüklemez).
// Etkinlikler ve yapılan istekler localStorage'da tutulur, testler buradan okur.
// localStorage.baCalendarMockFail = '1' iken her istek hata verir ("Takvim'e eklenemedi" akışını denemek için).
import { addDaysToKey, berlinAt, berlinParts } from './common.js';
import { CalendarError } from './calendar.js';

const STORE = 'baCalendarMock';
const CALLS = 'baCalendarMockCalls';

const read = (key, fallback) => { try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch(_){ return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const failing = () => localStorage.getItem('baCalendarMockFail') === '1';
const stamp = (date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export async function connect(){
  if(localStorage.getItem('baCalendarMockDenied') === '1') throw new CalendarError('Google penceresi kapatıldı.');
}

// Tekrarlayan etkinliğin haftalık dersleri, Berlin duvar saatine göre (Google'ın yaptığı gibi).
function expand(event){
  const start = new Date(event.start.dateTime);
  const duration = new Date(event.end.dateTime) - start;
  const rule = event.recurrence?.[0] || '';
  const count = Number(/COUNT=(\d+)/.exec(rule)?.[1] || 1);
  const until = /UNTIL=(\d{8}T\d{6}Z)/.exec(rule)?.[1];
  const { key, time } = berlinParts(start);
  const list = [];
  for(let i = 0; i < (until ? 104 : count); i++){
    const at = berlinAt(addDaysToKey(key, 7 * i), time);
    if(until && stamp(at) > until) break;
    const id = event.recurrence ? `${event.id}_${stamp(at)}` : event.id;
    if((event.cancelled || []).includes(id)) continue;
    const override = event.overrides?.[id];
    list.push({ id, start: { dateTime: (override?.start || at.toISOString()) }, end: { dateTime: override?.end || new Date(at.getTime() + duration).toISOString() } });
  }
  return list;
}

export async function request(method, path, { query = {}, body } = {}){
  const calls = read(CALLS, []);
  calls.push({ method, path, query, body });
  write(CALLS, calls);
  if(failing()) throw new CalendarError('Sahte takvim hatası (test)', 503);

  const store = read(STORE, { events: {} });
  const [, rawId, sub] = /^\/?([^/]*)\/?(.*)$/.exec(path);
  const id = decodeURIComponent(rawId || '');
  const parentId = id.includes('_') ? id.split('_')[0] : id;
  const event = store.events[parentId];

  let result = null;
  if(method === 'POST'){
    const newId = `mock${Math.random().toString(36).slice(2, 10)}`;
    store.events[newId] = { ...body, id: newId, hangoutLink: `https://meet.google.com/mock-${newId.slice(4, 8)}-xyz` };
    result = store.events[newId];
  }else if(!event){
    if(method === 'DELETE') return null;
    throw new CalendarError('Etkinlik bulunamadı', 404);
  }else if(method === 'GET' && sub === 'instances'){
    result = { items: expand(event) };
  }else if(method === 'GET'){
    result = event;
  }else if(method === 'PATCH'){
    if(id !== parentId){
      event.overrides = { ...(event.overrides || {}), [id]: { start: body.start?.dateTime, end: body.end?.dateTime } };
    }else{
      Object.assign(event, body);
    }
    result = event;
  }else if(method === 'DELETE'){
    if(id !== parentId) event.cancelled = [...(event.cancelled || []), id];
    else delete store.events[parentId];
  }
  write(STORE, store);
  return result;
}
