// Sayfa çizilmeden önce çalışan küçük başlatıcı (<head> içinde, defer/async OLMADAN yüklenir).
// Eskiden her sayfada satır içi <script> ve <img onerror="…"> idi; Content-Security-Policy satır içi betiğe
// izin vermediği için buraya taşındı (scripts/build-pages.mjs → SECURITY).
(function () {
  // 1) Kayıtlı tema: koyu tema seçildiyse ilk çizimde beyaz parlama olmasın.
  try { document.documentElement.dataset.theme = localStorage.getItem('ba-theme') === 'dark' ? 'dark' : 'light'; }
  catch (_) { document.documentElement.dataset.theme = 'light'; }

  // 2) <picture> yedeği: WebP kaynağı yüklenemezse <source> öğeleri kaldırılır ve <img> içindeki JPEG gösterilir.
  //    'error' olayı kabarcıklanmaz; capture: true ile belge düzeyinde bütün resimler (sonradan eklenenler dahil) yakalanır.
  document.addEventListener('error', function (event) {
    var img = event.target;
    if (!img || img.tagName !== 'IMG' || !img.hasAttribute('data-picture-fallback')) return;
    img.removeAttribute('data-picture-fallback'); // bir kez (eski this.onerror=null)
    var parent = img.parentNode;
    if (parent) parent.querySelectorAll('source').forEach(function (s) { s.remove(); });
  }, true);
})();
