// HTML yardımcıları: innerHTML ile yazılan şablonlarda veriden gelen HER değer bunlardan geçer.
//   escapeHtml(v)  metin ve nitelik değeri (& < > " ' kaçışlanır)
//   safeUrl(v)     href/src: yalnızca https: ve göreli yollar (/…, #…, ?…, ./…); diğerleri (javascript:, data:, http:) → ''
//   sanitizeSvg(v) data/cocuk/resimler.json çizimleri: izinli küçük bir SVG etiket/nitelik listesi dışındaki her şey atılır
// Klasik betik: index.html ve gramer ders sayfaları bunu kullanan betiklerden önce yükler; scripts/grammar-pages.mjs
// statik sayfaları üretirken aynı dosyayı node:vm içinde çalıştırır. Denetim: node scripts/check-html-escape.mjs (CI).
(function (g) {
  'use strict';
  var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return MAP[c]; });
  }

  function safeUrl(value) {
    // Tarayıcı adresteki sekme/satır sonu ve baştaki boşlukları yok sayar ("java\nscript:"); önce onları temizle.
    var url = String(value == null ? '' : value).replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, '').replace(/[\t\n\r]/g, '');
    if (!url) return '';
    if (/^\/\//.test(url)) return '';                 // //alan.adı: başka siteye giden şemasız adres
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return /^https:/i.test(url) ? url : '';
    if (/^[/#?.]/.test(url) || /^[\w%~-][^:]*$/.test(url)) return url; // göreli yol (iki nokta üst üste yoksa şema olamaz)
    return '';
  }

  var SVG_TAGS = { g: 1, path: 1, rect: 1, circle: 1, ellipse: 1, line: 1, polyline: 1, polygon: 1 };
  var SVG_ATTRS = { d: 1, x: 1, y: 1, x1: 1, y1: 1, x2: 1, y2: 1, cx: 1, cy: 1, r: 1, rx: 1, ry: 1, width: 1, height: 1, points: 1,
    fill: 1, stroke: 1, 'stroke-width': 1, 'stroke-linecap': 1, 'stroke-linejoin': 1, opacity: 1, 'fill-opacity': 1, 'stroke-opacity': 1, transform: 1 };
  // Nitelik değerinde url(…), javascript: ya da & kaçışı olmasın (fill="url(javascript:…)" gibi hileler).
  var BAD_VALUE = /url\s*\(|javascript:|[<>"&]/i;
  function sanitizeSvg(markup) {
    var out = '';
    var re = /<\s*(\/?)\s*([a-zA-Z][\w-]*)([^<>]*?)(\/?)\s*>|([^<]+)|(<)/g;
    var m, stack = [];
    while ((m = re.exec(String(markup == null ? '' : markup)))) {
      if (m[5] != null) { if (/\S/.test(m[5])) continue; out += m[5]; continue; } // çizimlerde metin yok
      if (m[6]) continue;
      var tag = m[2].toLowerCase();
      if (!SVG_TAGS[tag]) continue;
      if (m[1]) { if (stack[stack.length - 1] === tag) { stack.pop(); out += '</' + tag + '>'; } continue; }
      var attrs = '', am, are = /([a-zA-Z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      while ((am = are.exec(m[3]))) {
        var name = am[1].toLowerCase(), val = am[2] != null ? am[2] : am[3];
        if (SVG_ATTRS[name] && !BAD_VALUE.test(val)) attrs += ' ' + name + '="' + val + '"';
      }
      if (m[4] || /\/\s*$/.test(m[3])) out += '<' + tag + attrs + '/>';
      else { out += '<' + tag + attrs + '>'; stack.push(tag); }
    }
    while (stack.length) out += '</' + stack.pop() + '>';
    return out;
  }

  g.baHtml = { escapeHtml: escapeHtml, safeUrl: safeUrl, sanitizeSvg: sanitizeSvg };
})(typeof window !== 'undefined' ? window : globalThis);
