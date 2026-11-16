// Google Calendar, sadece öğretmen hesabı için: tarayıcıda Google Identity Services (token client) ile izin,
// Calendar API v3 REST ile etkinlikler. Sunucu yok, sadece "calendar.events" izni. Öğrencilerden izin istenmez.
// Yerel emülatör modunda gerçek Google yerine js/account/calendar-mock.js kullanılır (canlıda asla).
import { GOOGLE_CLIENT_ID } from './config.js';
import { emulator } from './firebase.js';
import { BERLIN } from './common.js';

export const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
export const SOURCE = 'bozkurtacademy';
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';

export class CalendarError extends Error {
  constructor(message, status = 0){
    super(message);
    this.status = status;
  }
}

export const usingMock = emulator;
export const calendarConfigured = usingMock || Boolean(GOOGLE_CLIENT_ID);

// Erişim belirteci (access token, yaklaşık 1 saat geçerli):
// - Bellekte ve yalnızca öğretmen sayfalarında, süresi dolana kadar sessionStorage'da (sekme kapanınca silinir).
//   Sayfa yenilenince bağlantı korunur. Belirteç hiçbir sunucuya gönderilmez (yalnızca Google Calendar API'ye) ve loglanmaz.
// - localStorage'da yalnızca "daha önce bağlandı" bilgisi tutulur (belirteç değil): durum rozeti "süresi doldu,
//   bir sonraki işlemde otomatik yenilenecek" diyebilsin.
// - Süre dolmuşsa bir takvim işleminde (öğretmenin tıklamasıyla) connect() izni sessizce yeniler: requestAccessToken({ prompt: '' }).
const SESSION_KEY = 'baGcalSession';
const CONNECTED_KEY = 'baGcalConnected';
const TEACHER_PAGE = /^\/ogretmen(-[a-z]+)?\.html$/.test(location.pathname);
const MARGIN_MS = 60e3; // süre dolmadan 1 dk önce dolmuş say

let token = null;
let expiresAt = 0;
let mock = null;

const storage = (kind) => { try{ return window[kind]; }catch(_){ return null; } };

function saveSession(){
  if(!TEACHER_PAGE) return;
  try{ storage('sessionStorage')?.setItem(SESSION_KEY, JSON.stringify({ token, expiresAt })); }catch(_){}
  try{ storage('localStorage')?.setItem(CONNECTED_KEY, '1'); }catch(_){}
}

function clearSession({ forgetConnected = false } = {}){
  token = null;
  expiresAt = 0;
  try{ storage('sessionStorage')?.removeItem(SESSION_KEY); }catch(_){}
  if(forgetConnected){ try{ storage('localStorage')?.removeItem(CONNECTED_KEY); }catch(_){} }
}

// Sayfa açılırken: aynı sekmede daha önce alınmış ve süresi dolmamış belirteç geri yüklenir.
if(TEACHER_PAGE){
  try{
    const saved = JSON.parse(storage('sessionStorage')?.getItem(SESSION_KEY) || 'null');
    if(saved?.token && Number(saved.expiresAt) > Date.now()){ token = saved.token; expiresAt = Number(saved.expiresAt); }
    else storage('sessionStorage')?.removeItem(SESSION_KEY);
  }catch(_){}
}

function accept(accessToken, expiresInSec){
  token = accessToken;
  expiresAt = Date.now() + Math.max(0, Number(expiresInSec || 3600) * 1000 - MARGIN_MS);
  saveSession();
}

function loadGis(){
  if(window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new CalendarError('Google oturum betiği yüklenemedi.'));
    document.head.append(script);
  });
}

// Sayfa açılırken Google betiği önceden yüklenir; izin penceresi tıklamaya yakın açılabilsin (açılır pencere engeli).
export function preload(){
  if(usingMock){
    mock ||= import('./calendar-mock.js');
    return;
  }
  if(GOOGLE_CLIENT_ID) loadGis().catch(() => {});
}

export const isConnected = () => Boolean(token) && Date.now() < expiresAt;

// Durum rozeti için: 'connected' (minutesLeft ile), 'expired' (daha önce bağlandı, belirteç yok ya da dolmuş), 'none'.
export function connectionState(){
  if(isConnected()) return { state: 'connected', minutesLeft: Math.max(1, Math.round((expiresAt - Date.now()) / 60e3)) };
  let before = false;
  try{ before = storage('localStorage')?.getItem(CONNECTED_KEY) === '1'; }catch(_){}
  return { state: before ? 'expired' : 'none', minutesLeft: 0 };
}

// İzin: öğretmenin tıklamasıyla çağrılır (açılır pencere engellenmesin). Süresi dolmuş bağlantı da burada yenilenir;
// daha önce izin verildiyse Google genellikle pencereyi kendiliğinden kapatır (prompt: '').
export async function connect(){
  if(isConnected()) return;
  if(usingMock){
    const result = await (await (mock ||= import('./calendar-mock.js'))).connect();
    accept(result?.access_token || 'mock-token', result?.expires_in || 3600);
    return;
  }
  if(!GOOGLE_CLIENT_ID) throw new CalendarError('Google Calendar henüz ayarlanmadı (istemci kimliği yok).');
  await loadGis();
  await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if(response.error) return reject(new CalendarError(response.error_description || response.error));
        if(!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPE)) return reject(new CalendarError('Takvim izni verilmedi.'));
        accept(response.access_token, response.expires_in);
        resolve();
      },
      error_callback: (error) => reject(new CalendarError(error?.type === 'popup_closed' ? 'Google penceresi kapatıldı.' : (error?.message || 'Google izni alınamadı.')))
    });
    client.requestAccessToken({ prompt: '' });
  });
}

// "Bağlantıyı kes": belirteç Google'dan iptal edilir (revoke) ve tarayıcıdan silinir; "daha önce bağlandı" bilgisi de silinir.
export async function disconnect(){
  const current = token;
  clearSession({ forgetConnected: true });
  if(!current) return;
  if(usingMock){
    await (await (mock ||= import('./calendar-mock.js'))).revoke();
    return;
  }
  // Google'ın iptal adresi (yalnızca Google'a gider). Yanıt okunmaz; no-cors ile CORS'a takılmadan gönderilir.
  try{
    await fetch(REVOKE_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ token: current }) });
  }catch(_){ /* İptal edilemese de belirteç en geç 1 saatte kendiliğinden geçersiz olur. */ }
}

// Çıkış yaparken: belirteç ve "daha önce bağlandı" bilgisi tarayıcıdan silinir.
export function forget(){
  clearSession({ forgetConnected: true });
}

async function api(method, path = '', { query = {}, body } = {}){
  if(!isConnected()) throw new CalendarError('Google Calendar bağlı değil.');
  if(usingMock) return (await mock).request(method, path, { query, body });
  const url = new URL(API + path);
  Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  if(response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if(!response.ok){
    // Geçersiz belirteç: silinir; bir sonraki işlemde connect() izni yeniler.
    if(response.status === 401) clearSession();
    // Zaten silinmiş etkinlik: istenen sonuç zaten gerçekleşmiş.
    if(method === 'DELETE' && response.status === 410) return null;
    throw new CalendarError(data?.error?.message || `Google Calendar hatası (${response.status})`, response.status);
  }
  return data;
}

// Ders etkinliği: Meet linki, davetliler, öğretmen için hatırlatmalar ve "siteden oluşturuldu" işareti.
export function lessonEvent({ start, durationMin, note, student, attendees, lessonId, count = 1 }){
  const end = new Date(start.getTime() + durationMin * 60000);
  return {
    summary: `Almanca dersi – ${student.name}`,
    description: [note, 'bozkurtacademy.com üzerinden oluşturuldu.'].filter(Boolean).join('\n\n'),
    start: { dateTime: start.toISOString(), timeZone: BERLIN },
    end: { dateTime: end.toISOString(), timeZone: BERLIN },
    attendees: attendees.map((email) => ({ email })),
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 1440 }, { method: 'popup', minutes: 30 }] },
    conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    extendedProperties: { private: { source: SOURCE, lessonId, studentEmail: student.email } },
    ...(count > 1 ? { recurrence: [`RRULE:FREQ=WEEKLY;COUNT=${count}`] } : {})
  };
}

const meetUrlOf = (event) => event?.hangoutLink
  || event?.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri || '';

export async function insertEvent(body){
  let event = await api('POST', '', { query: { conferenceDataVersion: 1, sendUpdates: 'all' }, body });
  // Meet linki bazen birkaç saniye sonra hazır olur.
  if(!meetUrlOf(event) && event?.conferenceData?.createRequest?.status?.statusCode === 'pending'){
    await new Promise((r) => setTimeout(r, 2000));
    event = await api('GET', `/${encodeURIComponent(event.id)}`);
  }
  return { id: event.id, meetUrl: meetUrlOf(event) };
}

// Tekrarlayan etkinliğin tek tek dersleri (her birinin kendi kimliği var).
export async function instances(eventId){
  const data = await api('GET', `/${encodeURIComponent(eventId)}/instances`, { query: { maxResults: 100 } });
  return (data?.items || []).map((i) => ({ id: i.id, start: new Date(i.start?.dateTime || i.originalStartTime?.dateTime) }));
}

export function patchEvent(eventId, changes){
  return api('PATCH', `/${encodeURIComponent(eventId)}`, { query: { sendUpdates: 'all', conferenceDataVersion: 1 }, body: changes });
}

export function deleteEvent(eventId, { notify = true } = {}){
  return api('DELETE', `/${encodeURIComponent(eventId)}`, { query: { sendUpdates: notify ? 'all' : 'none' } });
}

export function timeChanges(start, durationMin){
  const end = new Date(start.getTime() + durationMin * 60000);
  return { start: { dateTime: start.toISOString(), timeZone: BERLIN }, end: { dateTime: end.toISOString(), timeZone: BERLIN } };
}

// Tekrarı belli bir dersten önce bitirir ("bu ve sonraki dersleri iptal et").
export function untilBefore(start){
  const until = new Date(start.getTime() - 1000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return { recurrence: [`RRULE:FREQ=WEEKLY;UNTIL=${until}`] };
}
