// Eski adresler artık ayrı sayfalar: #lessons, #about, #contact ve #grammar/A1/artikel/3 → /almanca-gramer/a1/artikel/#a1-step-2
// (js/app.js: baGrammarUrl); yalın #grammar (arama) burada kalır. Sayfa çizilmeden yönlendirsin diye <head> içinde, defer'siz yüklenir.
// Eskiden index.html içinde satır içi betikti; Content-Security-Policy için dosyaya taşındı.
(function(){var m={lessons:'/online-almanca-dersi/',about:'/hakkimda/',contact:'/iletisim/'},p=(location.hash||'').slice(1).split('/'),u=m[p[0]];if(p[0]==='grammar'&&p.length>1){u='/almanca-gramer/';var l=(p[1]||'').toLowerCase();if(/^(a1|a2|b1)$/.test(l)){u+=l+'/';if(p[2]){u+=encodeURIComponent(decodeURIComponent(p[2]))+'/';if(/^[0-9]{1,2}$/.test(p[3]||'')&&p[3]>0)u+='#a1-step-'+(p[3]-1);}}}if(u)location.replace(u);})();
