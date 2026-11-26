// Ödev PDF'leri öğretmenin Google Drive'ına (Firebase Storage Spark planında kullanılamadığı için).
// Sadece öğretmen sayfalarında, öğretmenin tıklamasıyla: Google Identity Services (token client) ile yalnızca
// "drive.file" izni istenir. Bu izinle uygulama sadece kendi oluşturduğu dosya ve klasörleri görür; Drive'ın geri
// kalanına erişemez. Sunucu yok; istekler doğrudan tarayıcıdan Drive API v3'e (www.googleapis.com) gider.
//
// Akış: "Bozkurt Academy Ödevler" klasörü bulunur (yoksa oluşturulur) → PDF resumable upload ile yüklenir (ilerleme
// çubuğu) → "bağlantıya sahip olan herkes görüntüleyebilir" izni verilir → https://drive.google.com/file/d/<id>/view.
// Ödev silinse de PDF Drive'da kalır (öğretmenin kararı).
//
// Belirteç (yaklaşık 1 saat): bellekte ve aynı sekmede sessionStorage'da (baGdriveSession), sadece öğretmen
// sayfalarında; hiçbir sunucuya gönderilmez ve loglanmaz. Çıkışta silinir (forget). Yerel emülatör modunda gerçek
// Google yerine js/account/drive-mock.js kullanılır (canlıda asla).
import { GOOGLE_CLIENT_ID } from './config.js';
import { emulator } from './firebase.js';
import { loadGis } from './calendar.js';

export const SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const FOLDER_NAME = 'Bozkurt Academy Ödevler';
// Yardımcı kaynakların PDF'leri ayrı klasörde (js/account/teacher-student.js).
export const RESOURCE_FOLDER = 'Bozkurt Academy Kaynaklar';
// Kaynak kütüphanesi (ogretmen-kutuphane.html): PDF'ler gizli yüklenir (share: false); bağlantıyla paylaşma ancak
// ödeve ya da yardımcı kaynaklara eklenince verilir (sharePdf). Ödevden çıkarılınca izin geri alınmaz.
export const LIBRARY_FOLDER = 'Bozkurt Academy Kütüphane';
export const MAX_BYTES = 20 * 1024 * 1024;
const API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD = 'https://www.googleapis.com/upload/drive/v3/files';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SESSION_KEY = 'baGdriveSession';
const FOLDER_KEY = 'baGdriveFolder'; // sadece klasörün kimliği (belirteç değil)
const TEACHER_PAGE = /^\/ogretmen(-[a-z]+)?\.html$/.test(location.pathname);
const MARGIN_MS = 60e3;

export class DriveError extends Error {
  constructor(message, status = 0){
    super(message);
    this.status = status;
  }
}

export const usingMock = emulator;
export const driveConfigured = usingMock || Boolean(GOOGLE_CLIENT_ID);

let token = null;
let expiresAt = 0;
let mock = null;

const storage = (kind) => { try{ return window[kind]; }catch(_){ return null; } };
const mockModule = () => (mock ||= import('./drive-mock.js'));

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
  if(TEACHER_PAGE){ try{ storage('sessionStorage')?.setItem(SESSION_KEY, JSON.stringify({ token, expiresAt })); }catch(_){} }
}

function clearSession(){
  token = null;
  expiresAt = 0;
  try{ storage('sessionStorage')?.removeItem(SESSION_KEY); }catch(_){}
}

export const isConnected = () => Boolean(token) && Date.now() < expiresAt;

// Sayfa açılırken Google betiği önceden yüklenir (izin penceresi tıklamaya yakın açılsın).
export function preload(){
  if(usingMock){ mockModule(); return; }
  if(GOOGLE_CLIENT_ID) loadGis().catch(() => {});
}

// İzin: öğretmenin tıklamasıyla çağrılır. Daha önce izin verildiyse Google pencereyi genellikle kendiliğinden kapatır.
export async function connect(){
  if(isConnected()) return;
  if(usingMock){
    const result = await (await mockModule()).connect();
    accept(result.access_token, result.expires_in);
    return;
  }
  if(!GOOGLE_CLIENT_ID) throw new DriveError('Google Drive henüz ayarlanmadı (istemci kimliği yok).');
  try{
    await loadGis();
  }catch(_){
    throw new DriveError('Google oturum betiği yüklenemedi.');
  }
  await new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if(response.error) return reject(new DriveError(response.error_description || response.error));
        if(!window.google.accounts.oauth2.hasGrantedAllScopes(response, SCOPE)) return reject(new DriveError('Google Drive izni verilmedi.'));
        accept(response.access_token, response.expires_in);
        resolve();
      },
      error_callback: (error) => reject(new DriveError(error?.type === 'popup_closed' ? 'Google penceresi kapatıldı.' : (error?.message || 'Google izni alınamadı.')))
    });
    client.requestAccessToken({ prompt: '' });
  });
}

// Çıkış yaparken belirteç tarayıcıdan silinir.
export function forget(){
  clearSession();
}

// Dosya denetimi (yüklemeden önce): PDF uzantısı/türü, boyut ve dosyanın "%PDF-" ile başlaması.
export async function checkPdf(file){
  if(!file) return 'Dosya seçilmedi.';
  if(!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) return 'Sadece PDF dosyası yüklenebilir.';
  if(file.size === 0) return 'Dosya boş.';
  if(file.size > MAX_BYTES) return `Dosya çok büyük (${(Math.ceil(file.size / 104857.6) / 10).toLocaleString('tr-TR')} MB). En çok 20 MB.`;
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if(String.fromCharCode(...head) !== '%PDF-') return 'Bu dosya geçerli bir PDF değil.';
  return '';
}

async function api(method, url, { body, headers = {} } = {}){
  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  if(response.status === 401) clearSession();
  if(!response.ok){
    const data = await response.json().catch(() => null);
    throw new DriveError(data?.error?.message || `Google Drive hatası (${response.status})`, response.status);
  }
  return response;
}

// Uygulamanın oluşturduğu klasör (drive.file ile sadece onu görür); yoksa oluşturulur. Varsayılan "Bozkurt Academy
// Ödevler" (kimliği eskisi gibi baGdriveFolder'da), diğerleri baGdriveFolder:<ad> anahtarında.
async function folderId(name = FOLDER_NAME){
  const key = name === FOLDER_NAME ? FOLDER_KEY : `${FOLDER_KEY}:${name}`;
  let saved = '';
  try{ saved = storage('localStorage')?.getItem(key) || ''; }catch(_){}
  if(saved){
    const check = await fetch(`${API}/${encodeURIComponent(saved)}?fields=id,trashed`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null)).catch(() => null);
    if(check?.id && !check.trashed) return saved;
  }
  const q = `name = '${name.replace(/['\\]/g, '\\$&')}' and mimeType = '${FOLDER_MIME}' and trashed = false`;
  const found = await (await api('GET', `${API}?${new URLSearchParams({ q, fields: 'files(id)', spaces: 'drive', pageSize: '1' })}`)).json();
  let id = found?.files?.[0]?.id;
  if(!id){
    id = (await (await api('POST', `${API}?fields=id`, { body: { name, mimeType: FOLDER_MIME } })).json()).id;
  }
  try{ storage('localStorage')?.setItem(key, id); }catch(_){}
  return id;
}

function putWithProgress(url, file, onProgress){
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.setRequestHeader('Content-Type', 'application/pdf');
    xhr.upload.onprogress = (e) => { if(e.lengthComputable) onProgress?.(e.loaded / e.total); };
    xhr.onload = () => {
      if(xhr.status >= 200 && xhr.status < 300){
        onProgress?.(1);
        try{ resolve(JSON.parse(xhr.responseText)); }catch(_){ reject(new DriveError('Google Drive yanıtı okunamadı.')); }
      }else{
        if(xhr.status === 401) clearSession();
        reject(new DriveError(`Google Drive yükleme hatası (${xhr.status})`, xhr.status));
      }
    };
    xhr.onerror = () => reject(new DriveError('Bağlantı kesildi; dosya yüklenemedi.'));
    xhr.send(file);
  });
}

// PDF'i yükler ve (share false değilse) paylaşır. Döner: { id, name, url }. folderName: hedef klasör (varsayılan ödevler).
export async function uploadPdf(file, { onProgress, folderName = FOLDER_NAME, share = true } = {}){
  const problem = await checkPdf(file);
  if(problem) throw new DriveError(problem);
  if(!isConnected()) throw new DriveError('Google Drive bağlı değil.');
  if(usingMock) return (await mockModule()).uploadPdf(file, { onProgress, folderName, share });
  const parent = await folderId(folderName);
  const start = await api('POST', `${UPLOAD}?uploadType=resumable&fields=id,name`, {
    body: { name: file.name, mimeType: 'application/pdf', parents: [parent] },
    headers: { 'X-Upload-Content-Type': 'application/pdf', 'X-Upload-Content-Length': String(file.size) }
  });
  const session = start.headers.get('Location');
  if(!session || !session.startsWith(UPLOAD)) throw new DriveError('Google Drive yükleme oturumu açılamadı.');
  const uploaded = await putWithProgress(session, file, onProgress);
  if(share) await sharePdf(uploaded.id);
  return { id: uploaded.id, name: uploaded.name || file.name, url: fileUrl(uploaded.id) };
}

export const fileUrl = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;

// "Bağlantıya sahip olan herkes görüntüleyebilir" (öğrencilerin Google hesabı gerekmez). Tekrar çağrılabilir.
export async function sharePdf(id){
  if(!isConnected()) throw new DriveError('Google Drive bağlı değil.');
  if(usingMock) return (await mockModule()).sharePdf(id);
  await api('POST', `${API}/${encodeURIComponent(id)}/permissions?fields=id`, { body: { role: 'reader', type: 'anyone' } });
}
