// Google Calendar, sadece öğretmen hesabı için: tarayıcıda Google Identity Services (token client) ile izin,
// Calendar API v3 REST ile etkinlikler. Sunucu yok, sadece "calendar.events" izni. Öğrencilerden izin istenmez.
// Yerel emülatör modunda gerçek Google yerine js/account/calendar-mock.js kullanılır (canlıda asla).
import { GOOGLE_CLIENT_ID } from './config.js';
import { emulator } from './firebase.js';
import { BERLIN } from './common.js';

export const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
export const SOURCE = 'bozkurtacademy';
const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export class CalendarError extends Error {
  constructor(message, status = 0){
    super(message);
    this.status = status;
  }
}

export const usingMock = emulator;
export const calendarConfigured = usingMock || Boolean(GOOGLE_CLIENT_ID);

let token = null;
let expiresAt = 0;
let mock = null;

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

// İzin: belirteç sadece bellekte tutulur (yaklaşık 1 saat), tarayıcıya kaydedilmez.
export async function connect(){
  if(isConnected()) return;
  if(usingMock){
    await (await (mock ||= import('./calendar-mock.js'))).connect();
    token = 'mock-token';
    expiresAt = Date.now() + 3600e3;
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
        token = response.access_token;
        expiresAt = Date.now() + (Number(response.expires_in || 3600) - 60) * 1000;
        resolve();
      },
      error_callback: (error) => reject(new CalendarError(error?.type === 'popup_closed' ? 'Google penceresi kapatıldı.' : (error?.message || 'Google izni alınamadı.')))
    });
    client.requestAccessToken({ prompt: '' });
  });
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
    if(response.status === 401) token = null;
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
