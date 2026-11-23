// Sadece yerel emülatör modu: Google Drive API'nin sahte hâli (js/account/drive.js bunu canlıda hiç yüklemez).
// Yüklenen dosyalar localStorage'da (baDriveMock: ad, boyut, klasör, paylaşım) tutulur; testler buradan okur.
// localStorage.baDriveMockDenied = '1' → izin penceresi kapatıldı; baDriveMockFail = '1' → yükleme hatası.
import { DriveError } from './drive.js?v=1';

if(!['localhost', '127.0.0.1'].includes(location.hostname)) throw new Error('drive-mock.js yalnızca yerel emülatörde çalışır');

const STORE = 'baDriveMock';
const read = () => { try{ return JSON.parse(localStorage.getItem(STORE)) || []; }catch(_){ return []; } };

export async function connect(){
  if(localStorage.getItem('baDriveMockDenied') === '1') throw new DriveError('Google penceresi kapatıldı.');
  localStorage.setItem('baDriveMockConnects', String(Number(localStorage.getItem('baDriveMockConnects') || 0) + 1));
  return { access_token: `mock-drive-${Date.now()}`, expires_in: 3600 };
}

export async function uploadPdf(file, { onProgress, folderName }){
  if(localStorage.getItem('baDriveMockFail') === '1') throw new DriveError('Google Drive yükleme hatası (500)', 500);
  for(const p of [0.25, 0.5, 0.75, 1]){
    onProgress?.(p);
    await new Promise((r) => setTimeout(r, 40));
  }
  const id = `mock${Date.now().toString(36)}`;
  const files = read();
  files.push({ id, name: file.name, size: file.size, folder: folderName, shared: 'anyone:reader' });
  localStorage.setItem(STORE, JSON.stringify(files));
  return { id, name: file.name, url: `https://drive.google.com/file/d/${id}/view` };
}
