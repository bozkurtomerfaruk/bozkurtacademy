// /yonetim/yorumlar/: gramer dersi yorumlarının onay sayfası (yorum e-postalarındaki "onay_paneli" linki).
// Onay ekranının kendisi js/account/comments-moderation.js içindedir; öğretmen panelindeki "Yorumlar" sekmesi de onu kullanır.
// Asıl koruma firestore.rules içindedir. Bu sayfa öğretmen olmayan bir hesapla açılırsa hiçbir sorgu çalıştırmaz.
import { auth, configured, fa } from './firebase.js';
import { TEACHER_UID } from './config.js';
import { createModeration, permissionMessage } from './comments-moderation.js?v=2';

const $ = (id) => document.getElementById(id);

function setStatus(type, message){
  const s = $('caStatus');
  s.hidden = !message;
  s.className = 'acc-status' + (type ? ' ' + type : '');
  s.textContent = message || '';
}

function start(){
  if(!configured){
    setStatus('error', 'Firebase yapılandırılmamış (js/account/config.js).');
    return;
  }
  const stop = auth.onAuthStateChanged(async (user) => {
    stop();
    if(!user || user.isAnonymous){
      setStatus('', '');
      $('caLogin').hidden = false;
      return;
    }
    $('caLogout').hidden = false;
    $('caLogout').addEventListener('click', async () => { await fa.signOut(auth); location.replace('/'); });
    if(user.uid !== TEACHER_UID){
      setStatus('error', 'Bu sayfa sadece öğretmen içindir.');
      return;
    }
    $('caBack').hidden = false;
    const moderation = createModeration({
      pendingList: $('caPendingList'),
      approvedList: $('caApprovedList'),
      onStatus: setStatus,
      onCounts: ({ pending }) => {
        $('caPendingCount').textContent = String(pending);
        $('caSummary').hidden = false;
        $('caApp').hidden = false;
      }
    });
    const reload = () => moderation.load().catch((error) => {
      console.error('[yorum onayı] Yorumlar okunamadı:', error?.code || '', error);
      setStatus('error', 'Yorumlar okunamadı: ' + permissionMessage(error));
    });
    $('caRefresh').hidden = false;
    $('caRefresh').addEventListener('click', reload);
    reload();
  });
}

start();
