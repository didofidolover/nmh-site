(function(){
'use strict';
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var L = 'en', DARK = false;
var THEMES = {custom:'#FDF9F4', classic:'#FDF9F4', mono:'#FFFFFF', sand:'#F5EDE2', blush:'#FBF4F2', sage:'#F4F5F0', midnight:'#141312'}, TH = 'classic', THEME_PREF = null;
try{ L = localStorage.getItem('nmh-lang') || 'en'; THEME_PREF = localStorage.getItem('nmh-theme'); TH = localStorage.getItem('nmh-site-theme') || 'classic'; }catch(e){}
DARK = THEME_PREF ? THEME_PREF === 'dark' : TH === 'midnight';
function applySiteTheme(th){
  TH = THEMES[th] ? th : 'classic'; try{ localStorage.setItem('nmh-site-theme', TH); }catch(e){}
  var h = document.documentElement; if(TH === 'classic' || TH === 'midnight') h.removeAttribute('data-th'); else h.setAttribute('data-th', TH);
  var cs = document.getElementById('thCustom'), col = (typeof SITE === 'object' && SITE && SITE.colors) || DB_COLORS();
  if(TH === 'custom' && col){ if(!cs){ cs = document.createElement('style'); cs.id = 'thCustom'; document.head.appendChild(cs); }
    var vars = {bg:'--bg', panel:'--panel', ink:'--ink', muted:'--muted', line:'--line', line2:'--line-2', btn:'--btn', btnInk:'--btn-ink', soft:'--soft', ann:'--ann-bg', annInk:'--ann-ink', newL:'--new', outL:'--out'};
    cs.textContent = 'html[data-th="custom"]{' + Object.keys(vars).filter(function(k){ return /^#[0-9a-fA-F]{3,8}$/.test(col[k] || ''); }).map(function(k){ return vars[k] + ':' + col[k]; }).join(';') + '}';
    THEMES.custom = col.bg || '#FDF9F4';
  } else if(cs) cs.textContent = '';
  if(!THEME_PREF){ DARK = TH === 'midnight'; h.classList.toggle('dark', DARK); }
  var m = document.querySelector('meta[name=theme-color]'); if(m) m.content = DARK ? '#141312' : THEMES[TH];
}
var STYLE_FONTS = {modern:'family=Manrope:wght@400;600;700', editorial:'family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Amiri:wght@400;700'};
function applySiteStyle(st){
  st = ['modern', 'glass', 'editorial', 'minimal'].indexOf(st) > -1 ? st : 'classic';
  var h = document.documentElement; if(st === 'classic') h.removeAttribute('data-style'); else h.setAttribute('data-style', st);
  if(STYLE_FONTS[st] && !document.getElementById('font-' + st)){ var l = document.createElement('link'); l.id = 'font-' + st; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + STYLE_FONTS[st] + '&display=swap'; document.head.appendChild(l); }
}
try{ applySiteStyle((JSON.parse(localStorage.getItem('nmh-site') || '{}')).style); }catch(e){}
function DB_COLORS(){ try{ var s = JSON.parse(localStorage.getItem('nmh-site') || '{}'); return s.colors; }catch(e){ return null; } }
applySiteTheme(TH);
function t(o){ return o && typeof o === 'object' ? (o[L] || o.en) : o; }
var TX = {}, PAGEX = {};
function tr(en, ar){ var o = TX[en]; if(o){ var v = L === 'ar' ? o.ar : o.en; if(v) return esc(v); } return L === 'ar' ? ar : en; }
function applyTexts(doc){
  TX = {}; PAGEX = {};
  ((doc && doc.list) || []).forEach(function(x){ if(x && x.k) TX[x.k] = {en:x.en || '', ar:x.ar || ''}; });
  PAGEX = (doc && doc.pages) || {};
}
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function $(id){ return document.getElementById(id); }
function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
var X = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M1 1l14 14M15 1L1 15"/></svg>';
var CHEV = '<svg viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M1 1l5 5-5 5"/></svg>';

/* ================= data ================= */
/*@@DATA@@*/

PRODUCTS = PRODUCTS.concat(ONE);
STYLES.splice(1, 0, {id:'new', en:'New in', ar:'وصل حديثًا'});
STYLE_INFO['new'] = {title:{en:'New in',ar:'وصل حديثًا'}, intro:{en:'The latest pieces from the atelier.',ar:'أحدث القطع من دار NMH.'}};
/* ---- catalogue: built-in pieces, overridden and extended from the control room (Firestore "products") ---- */
var BASE = PRODUCTS.slice(), ALLP = BASE.slice(), CATALOG = {}, SITE = {};
function visible(p){ return !!(p && !p.hidden && !p.removed); }
function isOut(p){ return !!(p && (p.soldOut || !visible(p))); }
var SOLD = {};
function isSold(p){ return !!(p && ((p.one && SOLD[p.code]) || isOut(p))); }
function claimed(p){ return !!(p && p.one && SOLD[p.code] && !p.soldOut); }
function soldText(p, long){ return claimed(p) ? (long ? tr('Sold, never to be made again', 'بيعت، ولن تُصنع مرة أخرى') : tr('Sold', 'بيعت')) : tr('Sold out', 'نفدت الكمية'); }
function applyCatalog(over){
  CATALOG = over || {};
  var seen = {}, list = BASE.map(function(p, i){ seen[p.code] = 1; var q = Object.assign({}, p, CATALOG[p.code] || {}); if(q.sort == null) q.sort = i; return q; });
  Object.keys(CATALOG).forEach(function(c){
    var o = CATALOG[c];
    if(!seen[c] && RETIRED.indexOf(c) < 0 && o && o.name && o.imgs && o.imgs.length) list.push(Object.assign({sort:1000, tone:'#F5F0EA', style:'everyday', col:'essentials', desc:{en:'', ar:''}, story:{en:'', ar:''}}, o, {code:c}));
  });
  /* like Kamin: product names stay in English in both languages */
  list.forEach(function(q){ if(q.name){ var en = q.name.en || q.name.ar; q.name = {en:en, ar:en}; } });
  list.sort(function(a, b){ return (a.sort || 0) - (b.sort || 0); });
  ALLP = list; PRODUCTS = list.filter(visible); ONE = PRODUCTS.filter(function(p){ return p.one; });
}
var BASESTYLES = JSON.parse(JSON.stringify(STYLES)), BASEINFO = JSON.parse(JSON.stringify(STYLE_INFO));
/* categories (abayas, kaftans...) can be renamed, hidden, reordered and added from the control room */
function applyCats(doc){
  var over = (doc && doc.over) || {}, added = (doc && doc.added) || [], order = (doc && doc.order) || [];
  var list = JSON.parse(JSON.stringify(BASESTYLES.concat(added.map(function(x){ return {id:x.id, en:x.en, ar:x.ar}; }))));
  Object.keys(STYLE_INFO).forEach(function(k){ delete STYLE_INFO[k]; }); Object.assign(STYLE_INFO, JSON.parse(JSON.stringify(BASEINFO)));
  added.forEach(function(x){ STYLE_INFO[x.id] = {title:{en:x.en, ar:x.ar}, intro:x.intro || {en:'', ar:''}, imgs:[]}; });
  list = list.map(function(s){ var o = over[s.id] || {}; if(o.en) s.en = o.en; if(o.ar) s.ar = o.ar; s.hidden = !!o.hidden && s.id !== 'all';
    var inf = STYLE_INFO[s.id] = STYLE_INFO[s.id] || {title:{en:s.en, ar:s.ar}, intro:{en:'', ar:''}, imgs:[]};
    if(o.en || o.ar) inf.title = {en:s.en, ar:s.ar}; if(o.intro && (o.intro.en || o.intro.ar)) inf.intro = {en:o.intro.en || inf.intro.en, ar:o.intro.ar || inf.intro.ar}; return s; });
  list = list.filter(function(s){ return !s.hidden; });
  list.sort(function(x, y){ if(x.id === 'all') return -1; if(y.id === 'all') return 1; var i = order.indexOf(x.id), j = order.indexOf(y.id); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); });
  STYLES.splice.apply(STYLES, [0, STYLES.length].concat(list));
}
var BASECOLS = JSON.parse(JSON.stringify(COLLECTIONS));
function applyCols(doc){
  var over = (doc && doc.over) || {}, added = (doc && doc.added) || [], order = (doc && doc.order) || [];
  var list = JSON.parse(JSON.stringify(BASECOLS.concat(added))).map(function(c){ var o = over[c.id]; if(o) Object.keys(o).forEach(function(k){ if(o[k] !== '' && o[k] != null) c[k] = o[k]; }); return c; });
  list = list.filter(function(c){ return !c.hidden && c.name; });
  list.sort(function(x, y){ var i = order.indexOf(x.id), j = order.indexOf(y.id); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); });
  list.forEach(function(c){ var n = c.name.en || c.name.ar; c.name = {en:n, ar:n}; c.season = c.season || {en:'', ar:''}; c.story = c.story || {en:'', ar:''}; if(!c.small) c.small = c.cover; });
  COLLECTIONS.splice.apply(COLLECTIONS, [0, COLLECTIONS.length].concat(list));
}
applyCols(null);
function annH(){ var a = document.getElementById('ann'); document.documentElement.style.setProperty('--ann', (a && !a.hidden ? a.offsetHeight : 0) + 'px'); }
window.addEventListener('resize', annH);
function applySite(site){
  SITE = site || {};
  applySiteTheme(SITE.theme || (Object.keys(SITE).length ? 'classic' : TH)); applySiteStyle(SITE.style); if(typeof applyThemeLabel === 'function' && document.getElementById('ftTheme')) applyThemeLabel();
  var a = document.getElementById('ann'); if(!a) return;
  if(SITE.ann && (SITE.ann.en || SITE.ann.ar)){ a.setAttribute('data-en', esc(SITE.ann.en || SITE.ann.ar)); a.setAttribute('data-ar', esc(SITE.ann.ar || SITE.ann.en)); a.innerHTML = a.getAttribute(L === 'ar' ? 'data-ar' : 'data-en'); }
  a.hidden = SITE.annOff === true;
  annH();
}
function inCart(code){ return CART.some(function(it){ return it.code === code; }); }
var SIZES = [
  {id:'XS', en:'X-Small', ar:'إكس سمول'}, {id:'S', en:'Small', ar:'سمول'}, {id:'M', en:'Medium', ar:'ميديم'},
  {id:'L', en:'Large', ar:'لارج'}, {id:'XL', en:'X-Large', ar:'إكس لارج'}, {id:'XXL', en:'XX-Large', ar:'دبل إكس لارج'},
  {id:'custom', en:'Custom, my measurements', ar:'تفصيل حسب مقاساتي'}
];
var LENGTHS = ['52','54','56','57','58','59','60','61','62'];
var CHART = [['XS',80,62,88],['S',84,66,92],['M',88,70,96],['L',94,76,102],['XL',100,82,108],['XXL',106,88,114]];
var COUNTRIES = [
  {id:'AE', en:'United Arab Emirates', ar:'الإمارات', zone:'ae'}, {id:'SA', en:'Saudi Arabia', ar:'السعودية', zone:'gcc'},
  {id:'KW', en:'Kuwait', ar:'الكويت', zone:'gcc'}, {id:'QA', en:'Qatar', ar:'قطر', zone:'gcc'}, {id:'BH', en:'Bahrain', ar:'البحرين', zone:'gcc'},
  {id:'OM', en:'Oman', ar:'عُمان', zone:'gcc'}, {id:'EG', en:'Egypt', ar:'مصر', zone:'intl'}, {id:'GB', en:'United Kingdom', ar:'المملكة المتحدة', zone:'intl'},
  {id:'US', en:'United States', ar:'الولايات المتحدة', zone:'intl'}, {id:'XX', en:'Other country', ar:'دولة أخرى', zone:'intl'}
];
var EMIRATES = [
  {id:'DU', en:'Dubai', ar:'دبي'}, {id:'AZ', en:'Abu Dhabi', ar:'أبوظبي'}, {id:'SH', en:'Sharjah', ar:'الشارقة'}, {id:'AJ', en:'Ajman', ar:'عجمان'},
  {id:'UQ', en:'Umm Al Quwain', ar:'أم القيوين'}, {id:'RK', en:'Ras Al Khaimah', ar:'رأس الخيمة'}, {id:'FU', en:'Fujairah', ar:'الفجيرة'}
];

function prod(c){ for(var i = 0; i < ALLP.length; i++) if(ALLP[i].code === c) return ALLP[i]; }
function col(id){ for(var i = 0; i < COLLECTIONS.length; i++) if(COLLECTIONS[i].id === id) return COLLECTIONS[i]; }
function find(list, id){ for(var i = 0; i < list.length; i++) if(list[i].id === id) return list[i]; }
function money(n){ n = Math.round(n * 100) / 100; var s = n.toLocaleString('en', {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits:2}); return L === 'ar' ? s + ' د.إ' : s + ' AED'; }
function count(n){ return L === 'ar' ? (n === 1 ? 'قطعة واحدة' : n === 2 ? 'قطعتين' : n + ' قطع') : n + (n === 1 ? ' product' : ' products'); }
function isCut(src){ return /\.webp$/.test(src); }
function cover(c){ return c.cover || (c.album && c.album[0]); }
function toast(msg){ var el = $('toast'); el.querySelector('p').textContent = msg; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function(){ el.classList.remove('on'); }, 4000); }

/* ================= storage ================= */
var DB = {
  get:function(k, d){ try{ var v = localStorage.getItem('nmh-' + k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set:function(k, v){ try{ localStorage.setItem('nmh-' + k, JSON.stringify(v)); }catch(e){} }
};
var CART = DB.get('cart', []), ORDERS = DB.get('orders', []), SAVED = DB.get('details', null);
if(!Array.isArray(CART)) CART = [];
applyCatalog(DB.get('catalog', {}));
function saveCart(){ DB.set('cart', CART); updateCount(); }
ORDERS.forEach(function(o){ (o.items || []).forEach(function(it){ if(/^O\d/.test(it.code)) SOLD[it.code] = 1; }); });
function pruneSold(){
  var gone = CART.filter(function(it){ return isSold(prod(it.code)); });
  if(!gone.length) return false;
  CART = CART.filter(function(it){ return !isSold(prod(it.code)); }); saveCart();
  toast(tr('Sorry, ', 'للأسف، ') + gone.map(function(it){ return t(prod(it.code).name); }).join(', ') + tr(' is no longer available and was removed from your cart.', ' لم تعد متوفرة وتمت إزالتها من حقيبتك.'));
  return true;
}

/* ================= Firebase: orders and newsletter only (no accounts) ================= */
var FBCFG = (window.NMH_FIREBASE && window.NMH_FIREBASE.apiKey) ? window.NMH_FIREBASE : null, FB = null, fbQueue = [];
function fbInit(){
  if(!FBCFG) return;
  var base = 'https://www.gstatic.com/firebasejs/12.19.0/';
  Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-firestore.js')]).then(function(m){
    var app = m[0].initializeApp(FBCFG);
    FB = {F:m[1], db:m[1].getFirestore(app)};
    fbQueue.splice(0).forEach(function(fn){ fn(); });
    fbWatch();
  }).catch(function(err){ console.warn('NMH: Firebase did not load; orders stay in this browser.', err); });
}
function fbDo(fn){ if(FB) fn(); else if(FBCFG) fbQueue.push(fn); }
function fbReady(){ return new Promise(function(res, rej){ if(FB) return res(); if(!FBCFG) return rej(new Error('offline')); fbQueue.push(res); setTimeout(function(){ rej(new Error('timeout')); }, 15000); }); }
/* live: every open page listens to the control room, so edits show everywhere without a reload */
function refreshViews(){
  var removed = pruneSold();
  if(curKey === 'checkout'){ if(removed) rerender(); } else if(!/^order-/.test(curKey || '')) rerender();
  if(drwOpen()) renderDrawer();
}
function fbWatch(){
  if(!FB) return;
  var F = FB.F, over = null, site = null;
  var apply = function(){
    if(over === null || site === null) return;
    var changed = JSON.stringify(over) !== JSON.stringify(CATALOG) || JSON.stringify(site) !== JSON.stringify(SITE);
    DB.set('catalog', over); DB.set('site', site);
    if(!changed) return;
    applyCatalog(over); applySite(site); refreshViews();
  };
  F.onSnapshot(F.collection(FB.db, 'products'), function(qs){ over = {}; qs.forEach(function(d){ over[d.id] = d.data(); }); apply(); }, fbWarn);
  F.onSnapshot(F.doc(FB.db, 'settings', 'site'), function(d){ site = d.exists() ? d.data() : {}; apply(); }, fbWarn);
  F.onSnapshot(F.doc(FB.db, 'settings', 'texts'), function(d){ var v = d.exists() ? d.data() : {}; if(JSON.stringify(v) === JSON.stringify(DB.get('texts', {}))) return; DB.set('texts', v); applyTexts(v); applyLang(); refreshViews(); }, fbWarn);
  F.onSnapshot(F.doc(FB.db, 'settings', 'categories'), function(d){ var v = d.exists() ? d.data() : {}; if(JSON.stringify(v) === JSON.stringify(DB.get('cats', {}))) return; DB.set('cats', v); applyCats(v); renderMenus(); refreshViews(); }, fbWarn);
  F.onSnapshot(F.doc(FB.db, 'settings', 'collections'), function(d){ var v = d.exists() ? d.data() : {}; if(JSON.stringify(v) === JSON.stringify(DB.get('cols', {}))) return; DB.set('cols', v); applyCols(v); renderMenus(); refreshViews(); }, fbWarn);
  F.onSnapshot(F.collection(FB.db, 'oneofone'), function(qs){
    var next = {}; qs.forEach(function(d){ next[d.id] = 1; });
    if(JSON.stringify(next) === JSON.stringify(SOLD)) return;
    SOLD = next; refreshViews();
  }, fbWarn);
}
function fbLoadSold(){
  if(!FB) return;
  FB.F.getDocs(FB.F.collection(FB.db, 'oneofone')).then(function(qs){
    var changed = false;
    qs.forEach(function(d){ if(!SOLD[d.id]){ SOLD[d.id] = 1; changed = true; } });
    if(!changed) return;
    var removed = pruneSold();
    if(/^(the-one|p-O\d+)?$/.test(curKey || '') || (removed && curKey === 'checkout')) rerender();
    if(drwOpen()) renderDrawer();
  }).catch(fbWarn);
}
/* an order with a one-of-one piece claims it in the same write; if someone else got there first, the whole write is refused */
function commitOrder(o){
  var ones = o.items.filter(function(it){ var p = prod(it.code); return p && p.one; });
  if(!FBCFG) return Promise.resolve();
  if(!ones.length){ saveOrderRemote(o).then(function(){ mailOrder(o.id); }, fbWarn); return Promise.resolve(); }
  return fbReady().then(function(){
    var F = FB.F, b = F.writeBatch(FB.db), rec = JSON.parse(JSON.stringify(o)); rec.uid = null;
    b.set(F.doc(FB.db, 'orders', o.id), rec);
    ones.forEach(function(it){ b.set(F.doc(FB.db, 'oneofone', it.code), {order:o.id, created:Date.now()}); });
    return b.commit().then(function(){ mailOrder(o.id); });
  });
}
function fbWarn(e){ console.warn('NMH: Firebase write failed', e); }
function saveOrderRemote(o){ return fbReady().then(function(){ var rec = JSON.parse(JSON.stringify(o)); rec.uid = null; return FB.F.setDoc(FB.F.doc(FB.db, 'orders', o.id), rec); }); }
/* ask the mailer (a Google Apps Script) to email the confirmation; it reads the order from Firestore itself */
function mailOrder(id){
  var url = window.NMH_MAIL_URL; if(!url) return;
  try{ fetch(url, {method:'POST', mode:'no-cors', keepalive:true, headers:{'Content-Type':'text/plain;charset=utf-8'}, body:JSON.stringify({id:id})}).catch(function(e){ console.warn('NMH: mail request failed', e); }); }catch(e){}
}
function subscribe(email, src){ fbDo(function(){ FB.F.addDoc(FB.F.collection(FB.db, 'subscribers'), {email:email, created:Date.now(), lang:L, source:src}).catch(fbWarn); }); }

/* ================= dye engine ================= */
function hexRgb(h){ var n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
function rgbHex(r){ return '#' + r.map(function(v){ return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
var tweens = {};
function dyeTo(id, hex, instant){
  var fl = $(id); if(!fl || !hex) return;
  var from = hexRgb(fl.getAttribute('flood-color')), to = hexRgb(hex);
  cancelAnimationFrame(tweens[id]);
  if(instant || reduce){ fl.setAttribute('flood-color', hex); return; }
  var t0 = performance.now(), D = 650;
  (function step(now){
    var k = Math.min(1, (now - t0) / D); k = 1 - Math.pow(1 - k, 3);
    fl.setAttribute('flood-color', rgbHex(from.map(function(v, i){ return v + (to[i] - v) * k; })));
    if(k < 1) tweens[id] = requestAnimationFrame(step);
  })(t0);
}
function dressHTML(key, view, filter){
  var v = view === 1 ? 'side' : 'front';
  return '<div class="dress"><img src="img/shade-' + v + '-' + key + '.webp" alt="" style="filter:url(#' + filter + ')"><img src="img/dye-' + v + '-' + key + '-hanger.webp" alt=""></div>';
}
var thumbN = 0;
function lineImg(it){
  var p = prod(it.code); if(!p) return '';
  if(p.dye && it.hex){
    var id = 'tf' + (++thumbN);
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="' + id + '" color-interpolation-filters="sRGB"><feFlood flood-color="' + it.hex + '" result="f"/><feComposite in="f" in2="SourceAlpha" operator="in" result="c"/><feBlend in="SourceGraphic" in2="c" mode="multiply"/></filter></svg>' + dressHTML(p.dye, 0, id);
  }
  return '<img' + (isCut(p.imgs[0]) ? ' class="cut"' : '') + ' src="' + p.imgs[0] + '" alt="" loading="lazy">';
}
function shadeName(it){ return it.hex == null ? tr('As shown', 'كما في الصورة') : it.shade === -1 ? tr('Custom colour ', 'لون خاص ') + it.hex.toUpperCase() : t(SHADES[it.shade]); }
function sizeName(z){ var s = find(SIZES, z); return s ? (z === 'custom' ? tr('Custom fit', 'تفصيل حسب المقاس') : t(s)) : z; }
function variant(it){ return [it.hex ? shadeName(it) : '', sizeName(it.size), it.len ? (it.len === 'unsure' ? tr('Length to confirm', 'سيتم تأكيد الطول معك') : it.len + '″') : ''].filter(Boolean).join(' / '); }

/* ================= cards and grids ================= */
function card(p, i){
  var a = p.imgs[0], b = p.imgs[1], sold = isSold(p);
  var lcls = sold ? ' out' : (p.labels && p.labels.length) ? '' : p.isNew ? ' new' : p.one ? ' one' : '';
  var lbl = sold ? soldText(p) : (p.labels && p.labels.length) ? t(p.labels[0]) : p.isNew ? tr('New', 'جديد') : p.one ? tr('1 of 1', 'قطعة واحدة') : '';
  return '<a class="card' + (sold ? ' sold' : '') + '" href="#p-' + p.code + '" data-rv style="--d:' + (i % 4) + '">' +
    '<div class="ph" style="--tone:' + (p.tone || '') + '">' + (lbl ? '<span class="lbl' + lcls + '">' + lbl + '</span>' : '') +
    '<img class="a' + (b ? ' has-b' : '') + (isCut(a) ? ' cut' : '') + '" src="' + a + '" alt="' + esc(t(p.name)) + '" loading="lazy">' +
    (b ? '<img class="b' + (isCut(b) ? ' cut' : '') + '" src="' + b + '" alt="" loading="lazy">' : '') + '</div>' +
    '<span class="ttl">' + (p.one ? 'N° ' + p.no + ' · ' : '') + esc(t(p.name)) + '</span><span class="pr num">' + (sold ? soldText(p, true) : money(p.price)) + '</span></a>';
}
function oneTile(p, i){
  var sold = isSold(p);
  return '<a class="ot' + (sold ? ' sold' : '') + '" href="#p-' + p.code + '" data-rv style="--d:' + i + '"><div class="ph" style="--tone:' + p.tone + '"><img src="' + p.imgs[0] + '" alt="' + esc(t(p.name)) + '" loading="lazy">' + (sold ? '<span class="sold-tag">' + soldText(p) + '</span>' : '') + '</div>' +
    '<span class="ot-m"><span class="no num">N° ' + p.no + '</span><span>' + (sold ? soldText(p) : money(p.price)) + '</span></span><span class="ot-n">' + esc(t(p.name)) + '</span></a>';
}
function grid(list, cls){ return '<div class="grid' + (cls ? ' ' + cls : '') + '">' + list.map(card).join('') + '</div>'; }
function sortList(list, how){
  var l = list.slice();
  if(how === 'low') l.sort(function(a, b){ return a.price - b.price; });
  if(how === 'high') l.sort(function(a, b){ return b.price - a.price; });
  if(how === 'az') l.sort(function(a, b){ return t(a.name).localeCompare(t(b.name)); });
  return l;
}
function sortSel(id, val){
  return '<label class="sr" for="' + id + '">' + tr('Sort by', 'ترتيب حسب') + '</label><select id="' + id + '" data-sort>' +
    [['featured', tr('Featured', 'مميز')], ['low', tr('Price, low to high', 'السعر، من الأقل إلى الأعلى')], ['high', tr('Price, high to low', 'السعر، من الأعلى إلى الأقل')], ['az', tr('Alphabetically, A-Z', 'أبجديًا، من أ إلى ي')]]
    .map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>';
}

/* ================= views ================= */
var app = $('app'), curKey = null, SORT = 'featured';


/* ================= home page sections (order, visibility and media come from the control room) ================= */
var HOME_ORDER = ['one', 'arrivals', 'styles', 'edit', 'featured', 'brand'];
function homeCfg(){ return SITE.home || {}; }
function homeSections(fresh, feat){
  var cfg = homeCfg(), hid = cfg.hidden || {}, order = (cfg.order || []).filter(function(id){ return HOME_ORDER.indexOf(id) > -1; });
  HOME_ORDER.forEach(function(id){ if(order.indexOf(id) < 0) order.push(id); });
  var make = {
    one:function(){ return ONE.length ? '<section class="one-band" aria-labelledby="oneT"><div class="wrap one-in">' +
      '<div class="one-copy" data-rv><p class="u-h7">' + tr('Signature', 'توقيع الدار') + '</p><h2 class="one-title" id="oneT">' + tr('The One', 'القطعة الواحدة') + '</h2>' +
        '<p class="one-line">' + tr('One piece. Made once. Never again.', 'قطعة واحدة. تُصنع مرة واحدة. ولا تتكرر.') + '</p>' +
        '<div class="rte"><p>' + tr('Each dress in this line exists as a single piece. When it finds its owner, it is gone for good.', 'كل فستان في هذا الخط قطعة فريدة. وحين يجد صاحبته، يختفي إلى الأبد.') + '</p></div>' +
        '<a class="btn light" href="#the-one">' + tr('Discover The One', 'اكتشفي القطعة الواحدة') + '</a></div>' +
      '<div class="one-grid">' + ONE.slice(0, 4).map(oneTile).join('') + '</div>' +
    '</div></section>' : ''; },
    arrivals:function(){ return '<section class="sec"><div class="wrap">' +
      '<header class="sec-h" data-rv><p class="u-h7">' + (fresh.length ? tr('Just arrived', 'وصل حديثًا') : tr('Featured collection', 'مجموعة مميزة')) + '</p><h2 class="u-h2">' + (fresh.length ? tr('New arrivals', 'وصل حديثًا') : tr('The new season', 'الموسم الجديد')) + '</h2><span class="dash"></span></header>' +
      grid(feat) +
      '<div class="center mt" data-rv><a class="btn" href="#s-' + (fresh.length ? 'new' : 'all') + '">' + tr('View all products', 'عرض جميع المنتجات') + '</a></div>' +
    '</div></section>'; },
    styles:function(){ var tiles = (cfg.tiles && cfg.tiles.length ? cfg.tiles : [{s:'abayas', img:'img/e/e1_01.jpg'}, {s:'evening', img:'img/e/e7_01.jpg'}, {s:'everyday', img:'img/e/e5_01.jpg'}]).filter(function(x){ return find(STYLES, x.s); });
      return '<section class="sec line"><div class="wrap">' +
      '<header class="sec-h" data-rv><p class="u-h7">' + tr('Shop by style', 'تسوّقي حسب الفئة') + '</p><h2 class="u-h2">' + tr('Find your piece', 'اكتشفي قطعتك') + '</h2><span class="dash"></span></header>' +
      '<div class="tiles n' + tiles.length + '">' + tiles.map(function(x, i){
        return '<a class="tile" href="#s-' + esc(x.s) + '" data-rv style="--d:' + i + '"><img src="' + esc(x.img) + '" alt="" loading="lazy"><span><span class="link">' + esc(t(find(STYLES, x.s))) + '</span></span></a>';
      }).join('') + '</div>' +
    '</div></section>'; },
    edit:function(){ var m = cfg.edit || {}, vid = m.type ? m.type === 'video' : true, v = m.v || 'video/abaya-edit.mp4', d = m.d || (vid ? 'video/abaya-edit.jpg' : 'img/c/c13-w.jpg');
      return '<section class="banner ed-banner" id="edBanner">' + (vid ? '<video muted playsinline loop autoplay preload="metadata" poster="' + esc(d) + '" aria-hidden="true"><source src="' + esc(v) + '" type="video/mp4"></video>' : '<img src="' + esc(d) + '" alt="" loading="lazy" style="object-position:' + esc(m.pos || '50% 30%') + '">') +
      '<div><p class="u-h7">' + tr('The abaya edit', 'مختارات العبايات') + '</p><h2 class="u-h1" style="margin-top:8px">' + tr('Details you find up close', 'تفاصيل تُرى عن قرب') + '</h2>' +
      '<div class="rte"><p>' + tr('Black-on-black embroidery, satin lapels and fine copper piping. Abayas that stay quiet from across the room and reward a closer look.', 'تطريز أسود على أسود، وياقات من الساتان، وحواف نحاسية رفيعة. عبايات هادئة من بعيد، تكشف جمالها عن قرب.') + '</p></div>' +
      '<a class="btn light" href="' + esc(m.href || '#s-abayas') + '" style="margin-top:24px">' + tr('Shop abayas', 'تسوّقي العبايات') + '</a></div></section>'; },
    featured:function(){ var c = col(cfg.featured) || col('editorial') || COLLECTIONS[0]; if(!c) return ''; var ess = PRODUCTS.filter(function(p){ return p.col === c.id; }).slice(0, 4); if(!ess.length) return '';
      return '<section class="sec line"><div class="wrap">' +
      '<header class="sec-h" data-rv><p class="u-h7">' + tr('Featured collection', 'مجموعة مميزة') + '</p><h2 class="u-h2">' + esc(t(c.name)) + '</h2><span class="dash"></span></header>' +
      grid(ess, ess.length === 3 ? 'c3' : '') +
      '<div class="center mt" data-rv><a class="btn" href="#' + c.id + '">' + tr('View the collection', 'عرض المجموعة') + '</a></div>' +
    '</div></section>'; },
    brand:function(){ return '<section class="sec line"><div class="wrap brand" data-rv>' +
      '<p class="u-h7 muted">NMH · ' + tr('Dubai', 'دبي') + '</p><h2 class="u-h2" style="margin-top:10px">' + tr('Made for you alone', 'صُنعت لكِ وحدك') + '</h2>' +
      '<div class="rte"><p>' + tr('NMH designs modest dresses and abayas in Dubai, and cuts each piece only after you order it, in your size and your length. Before anything is cut, we confirm every detail with you.', 'تصمّم NMH الفساتين والعبايات المحتشمة في دبي، ولا تُفصَّل أي قطعة إلا بعد طلبها، وفق مقاسك وطولك. وقبل التفصيل، نؤكد معك جميع التفاصيل.') + '</p></div>' +
      '<div class="social"><a class="link" href="https://www.instagram.com/_bynmh/" target="_blank" rel="noopener">Instagram</a><a class="link" href="#page-how">' + tr('How ordering works', 'طريقة الطلب') + '</a></div>' +
    '</div></section>'; }
  };
  return order.filter(function(id){ return !hid[id]; }).map(function(id){ return make[id](); }).join('');
}

function viewHome(){
  var fresh = PRODUCTS.filter(function(p){ return p.isNew; });
  var feat = fresh.length ? fresh.slice(0, 8) : PRODUCTS.filter(function(p){ return !p.one; }).slice(0, 8);
  app.innerHTML =
    '<section class="hero" id="hero" aria-roledescription="carousel" aria-label="' + tr('New season', 'الموسم الجديد') + '">' +
      heroSlides().map(function(s, i, all){
        var media = s.type === 'video' && s.v
          ? '<div class="vbg" style="background-image:url(' + esc(s.d || '') + ')" aria-hidden="true"></div><video muted playsinline loop preload="' + (i ? 'none' : 'auto') + '" poster="' + esc(s.d || '') + '" style="object-position:' + esc(s.pos || '50% 50%') + '"' + (i || reduce ? '' : ' autoplay') + ' aria-hidden="true"><source src="' + esc(s.v) + '" type="video/mp4"></video>'
          : '<picture><source media="(max-width:700px)" srcset="' + esc(s.m || s.d) + '"><img src="' + esc(s.d) + '" alt="" style="object-position:' + esc(s.pos || '50% 30%') + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></picture>';
        return '<div class="slide' + (i ? '' : ' on') + (s.type === 'video' ? ' is-video' : '') + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' / ' + all.length + '"' + (i ? ' aria-hidden="true"' : '') + '>' + media +
          '<div class="slide-t">' + (t(s.sub) ? '<p class="u-h7">' + esc(t(s.sub)) + '</p>' : '') + (t(s.big) ? '<' + (i ? 'p' : 'h1') + ' class="big">' + esc(t(s.big)) + '</' + (i ? 'p' : 'h1') + '>' : '') + (t(s.cta) && s.href ? '<a class="btn light" href="' + esc(s.href) + '"' + (i ? ' tabindex="-1"' : '') + '>' + esc(t(s.cta)) + '</a>' : '') + '</div></div>';
      }).join('') +
      (heroSlides().length > 1 ? '<button type="button" class="sl-arr prev" data-slidestep="-1" aria-label="' + tr('Previous slide', 'الشريحة السابقة') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M15 4l-8 8 8 8"/></svg></button><button type="button" class="sl-arr next" data-slidestep="1" aria-label="' + tr('Next slide', 'الشريحة التالية') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg></button>' : '') +
      (heroSlides().length > 1 ? '<div class="dots" role="group" aria-label="' + tr('Choose slide', 'اختيار الصورة') + '">' + heroSlides().map(function(s, i){ return '<button type="button" data-slide="' + i + '" aria-label="' + tr('Slide ', 'صورة ') + (i + 1) + '"' + (i ? '' : ' aria-current="true"') + '></button>'; }).join('') + '</div>' : '') +
    '</section>' +

    homeSections(fresh, feat);
  startSlides();
  var eb = $('edBanner'); if(eb && io && !reduce) io.observe(eb); else if(eb) eb.classList.add('in');
}
var ST = 0;
function studioDress(){ return dressHTML('olive', 0, 'dyeS'); }

/* hero slideshow */
function heroSlides(){ return (SITE.slides && SITE.slides.length) ? SITE.slides : SLIDES; }
/* slideshow: photos stay 6.5s; a video slide plays through once (up to 30s) before moving on */
var SL = {i:0, timer:null};
function slideDelay(el){ var v = el && el.querySelector('video'); if(!v) return 6500; var d = v.duration; return isFinite(d) && d > 0 ? Math.min(30000, Math.max(6500, d * 1000)) : 15000; }
function scheduleSlide(){
  clearTimeout(SL.timer);
  var h = $('hero'); if(!h || reduce) return;
  var cur = h.querySelectorAll('.slide')[SL.i];
  SL.timer = setTimeout(function(){ if(!$('hero')) return; if(document.hidden){ scheduleSlide(); return; } goSlide(SL.i + 1); }, slideDelay(cur));
}
function startSlides(){
  SL.i = 0; var h = $('hero'); if(!h) return;
  var v = h.querySelector('.slide.on video');
  if(v && !reduce){ v.play().catch(function(){}); if(!isFinite(v.duration)) v.addEventListener('loadedmetadata', scheduleSlide, {once:true}); }
  if(h.querySelectorAll('.slide').length > 1) scheduleSlide();
}
/* swipe on phones, arrow keys on computers */
(function(){
  var x0 = null, y0 = 0;
  document.addEventListener('touchstart', function(e){ if(!e.target.closest('#hero')) return; x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive:true});
  document.addEventListener('touchend', function(e){ if(x0 === null) return; var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
    if(Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3){ var fwd = dx < 0; if(document.documentElement.dir === 'rtl') fwd = !fwd; goSlide(SL.i + (fwd ? 1 : -1)); } }, {passive:true});
  document.addEventListener('keydown', function(e){ var h = $('hero'); if(!h || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || document.documentElement.style.overflow === 'hidden') return;
    var r = h.getBoundingClientRect(); if(r.bottom < 80) return; var fwd = e.key === 'ArrowRight'; if(document.documentElement.dir === 'rtl') fwd = !fwd; goSlide(SL.i + (fwd ? 1 : -1)); });
})();
function goSlide(n){
  var h = $('hero'); if(!h) return clearTimeout(SL.timer);
  var s = h.querySelectorAll('.slide'), d = h.querySelectorAll('[data-slide]');
  SL.i = (n + s.length) % s.length;
  s.forEach(function(el, i){
    var on = i === SL.i, v = el.querySelector('video');
    el.classList.toggle('on', on); el.setAttribute('aria-hidden', on ? 'false' : 'true'); var a = el.querySelector('a'); if(a) a.tabIndex = on ? 0 : -1;
    if(v){ if(on && !reduce){ v.preload = 'auto'; try{ v.currentTime = 0; }catch(e){} v.play().catch(function(){}); } else v.pause(); }
  });
  d.forEach(function(b, i){ if(i === SL.i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  scheduleSlide();
}

function viewCollection(id){
  var c = col(id), list = sortList(PRODUCTS.filter(function(p){ return p.col === id; }), SORT), img = c.cover;
  app.innerHTML =
    (img ? '<section class="banner" id="banner"><img src="' + img + '" alt=""><div><p class="u-h7">' + esc(t(c.season)) + '</p><h1 class="u-h1" style="margin-top:8px">' + esc(t(c.name)) + '</h1><div class="rte"><p>' + esc(t(c.story)) + '</p></div></div></section>'
         : '<header class="ph-head wrap"><p class="u-h7 muted">' + esc(t(c.season)) + '</p><h1 class="u-h1" style="margin-top:8px">' + esc(t(c.name)) + '</h1><div class="rte"><p>' + esc(t(c.story)) + '</p></div></header>') +
    '<div class="bar' + (img ? '' : '') + '"><div class="chips u-h7">' + colsShown().map(function(x){ return '<a href="#' + x.id + '"' + (x.id === id ? ' aria-current="page"' : '') + '>' + esc(t(x.name)) + '</a>'; }).join('') + '</div><div>' + sortSel('sortC', SORT) + '</div></div>' +
    '<div class="wrap" style="padding-bottom:90px"><p class="u-h7 muted" style="margin:-16px 0 28px">' + count(list.length) + '</p>' + grid(list) + '</div>';
  var b = $('banner'); if(b) requestAnimationFrame(function(){ b.classList.add('in'); });
}
function viewOne(){
  var c = col('the-one'), avail = ONE.filter(function(p){ return !isSold(p); }), gone = ONE.filter(isSold);
  app.innerHTML =
    '<section class="one-band one-head"><div class="wrap"><p class="u-h7">' + esc(t(c.season)) + '</p><h1 class="one-title">' + esc(t(c.name)) + '</h1><p class="one-line">' + tr('One piece. Made once. Never again.', 'قطعة واحدة. تُصنع مرة واحدة. ولا تتكرر.') + '</p>' +
      '<div class="one-rules">' +
        '<div><b class="num">1/1</b><span>' + tr('Each design is made a single time, from a single length of fabric.', 'يُصنع كل تصميم مرة واحدة، من قطعة قماش واحدة.') + '</span></div>' +
        '<div><b>' + tr('Yours', 'لكِ') + '</b><span>' + tr('Cut to your size and length once you claim it.', 'تُفصَّل وفق مقاسك وطولك فور حجزها.') + '</span></div>' +
        '<div><b>' + tr('Never again', 'لن تتكرر') + '</b><span>' + tr('When it finds its owner, the design goes into our archive.', 'حين تجد القطعة صاحبتها، ينتقل التصميم إلى الأرشيف.') + '</span></div>' +
      '</div></div></section>' +
    '<section class="sec"><div class="wrap"><header class="sec-h" data-rv><p class="u-h7">' + (avail.length ? count(avail.length) : '') + '</p><h2 class="u-h2">' + tr('Available now', 'متوفرة الآن') + '</h2><span class="dash"></span></header>' +
      (avail.length ? grid(avail) : '<p class="center muted">' + tr('Every piece has found its owner. The next pieces are announced on Instagram first.', 'وجدت جميع القطع صاحباتها. نعلن عن القطع القادمة عبر إنستغرام أولًا.') + '</p>') + '</div></section>' +
    '<section class="sec line"><div class="wrap"><header class="sec-h" data-rv><p class="u-h7">' + tr('The archive', 'الأرشيف') + '</p><h2 class="u-h2">' + tr('Found their owners', 'وجدت صاحباتها') + '</h2><span class="dash"></span></header>' +
      (gone.length ? grid(gone) : '<p class="center muted" data-rv>' + tr('Nothing has left the atelier yet. When a piece is claimed, it rests here, never to be made again.', 'لم تغادر أي قطعة الأتيليه بعد. حين تُحجز قطعة، تبقى هنا ولا تُصنع مرة أخرى.') + '</p>') + '</div></section>';
  fbLoadSold();
}
function viewStyle(id){
  var info = STYLE_INFO[id] || STYLE_INFO.all, list = sortList(PRODUCTS.filter(function(p){ return id === 'new' ? p.isNew : !p.one && (id === 'all' || p.style === id); }), SORT);
  app.innerHTML =
    '<header class="ph-head wrap"><h1 class="u-h1">' + esc(t(info.title)) + '</h1><div class="rte"><p>' + esc(t(info.intro)) + '</p></div></header>' +
    '<div class="bar"><div class="chips u-h7">' + STYLES.map(function(s){ return '<a href="#s-' + s.id + '"' + (s.id === id ? ' aria-current="page"' : '') + '>' + esc(t(s)) + '</a>'; }).join('') + '</div><div>' + sortSel('sortS', SORT) + '</div></div>' +
    '<div class="wrap" style="padding-bottom:90px"><p class="u-h7 muted" style="margin:-16px 0 28px">' + count(list.length) + '</p>' + (list.length ? grid(list) : '<p class="center muted" style="padding:40px 0">' + tr('Nothing here yet. New pieces are announced on Instagram first.', 'لا توجد قطع هنا حاليًا. نعلن عن القطع الجديدة عبر إنستغرام أولًا.') + '</p>') + '</div>';
}

/* ---------- product page ---------- */
var PP = null;
function viewProduct(code){
  var p = prod(code); if(!p || !visible(p)){ location.hash = 's-all'; return; }
  if(!PP || PP.code !== code) PP = {code:code, shade:null, custom:null, size:'', len:'', qty:1, img:0};
  var c = col(p.col), sold = isSold(p), one = !!p.one;
  var related = one ? ONE.filter(function(x){ return x.code !== code && !isSold(x); }).slice(0, 4) : PRODUCTS.filter(function(x){ return !x.one && x.code !== code && (x.col === p.col || x.style === p.style); }).slice(0, 4);
  if(one) fbLoadSold();
  app.innerHTML =
    '<div class="wrap"><div class="pp">' +
      '<div class="pp-th" id="ppTh" aria-label="' + tr('Photos', 'الصور') + '"></div>' +
      '<div><div class="pp-media" id="ppMedia"></div><div class="pp-dots" id="ppDots"></div></div>' +
      '<div class="pp-info">' +
        '<nav class="crumb u-h7" style="justify-content:flex-start" aria-label="' + tr('Breadcrumb', 'المسار') + '"><a href="#" data-home>' + tr('Home', 'الصفحة الرئيسية') + '</a><span>/</span><a href="#' + c.id + '">' + esc(t(c.name)) + '</a></nav>' +
        (one ? '<p class="one-badge"><span class="num">N° ' + p.no + '</span>' + (sold ? soldText(p, true) : tr('One of one', 'قطعة واحدة فقط')) + '</p>' : '') +
        ((p.labels && p.labels.length) || p.isNew ? '<p class="pp-lbls">' + (p.isNew ? '<span class="new">' + tr('New', 'جديد') + '</span>' : '') + (p.labels || []).map(function(l){ return '<span>' + esc(t(l)) + '</span>'; }).join('') + '</p>' : '') +
        '<h1 class="u-h1">' + esc(t(p.name)) + '</h1><p class="pp-pr num">' + (sold ? soldText(p) : money(p.price)) + '</p><hr>' +
        '<div class="rte"><p>' + esc(t(p.desc)) + '</p>' + (one ? '<p>' + tr('This dress exists as a single piece. Once claimed, it is cut to your size and the design is never made again.', 'هذا الفستان قطعة فريدة. فور حجزه يُفصَّل وفق مقاسك، ولا يتكرر التصميم بعدها.') + '</p>' : '<p>' + tr('Collection: ', 'المجموعة:') + esc(t(c.name)) + '</p>') + '<p>' + (one ? tr('Made once in Dubai. Code ', 'يُصنع مرة واحدة في دبي. الرمز') : tr('Made to order in Dubai. Code ', 'يُفصَّل حسب الطلب في دبي. الرمز')) + p.code + '</p></div>' +
        '<button class="size-link" type="button" id="sizeChart"><svg viewBox="0 0 18 12" fill="none" stroke="currentColor"><rect x=".5" y=".5" width="17" height="11"/><path d="M4 1v4M7 1v6M10 1v4M13 1v6"/></svg>' + tr('Size chart', 'جدول المقاسات') + '</button>' +
        (sold ? '<div class="buy"><button class="btn full" type="button" disabled><span>' + soldText(p, true) + '</span></button><a class="link" href="#' + (one ? 'the-one' : p.col) + '" style="justify-self:center;margin-top:8px">' + tr('See the pieces still available', 'عرض القطع المتوفرة') + '</a></div>' : '<form id="buy" novalidate>' +
          (true ? '' : '<div class="opt"><div class="opt-l"><span class="u-h7">' + tr('Colour', 'اللون') + '</span><span class="muted" id="ppShadeN"></span></div>' +
            '<ul class="sw" id="ppSw" aria-label="' + tr('Colour', 'اللون') + '"><li><button type="button" class="orig" data-sh="o" aria-label="' + tr('As shown', 'كما في الصورة') + '"></button></li>' +
            SHADES.map(function(s, i){ return '<li><button type="button" data-sh="' + i + '" style="--c:' + s.c + '" aria-label="' + esc(t(s)) + '"></button></li>'; }).join('') +
            '<li><label class="pick" id="ppPickL" title="' + tr('Any colour', 'أي لون') + '"><span class="sr">' + tr('Pick any colour', 'اختاري أي لون') + '</span><input type="color" id="ppPick" value="#8a4a47"></label></li></ul>' +
            '<p class="dye-note">' + (p.dye ? tr('The photo changes to preview your colour. Before cutting we send you a photo of the real fabric.', 'تتغيّر الصورة لتعرض اللون. وقبل التفصيل نرسل لكِ صورة القماش الفعلي.') : tr('Made in the colour you choose. Before cutting we send you a photo of the real fabric.', 'يُفصَّل باللون الذي تختارينه. وقبل التفصيل نرسل لكِ صورة القماش الفعلي.')) + '</p></div>') +
          '<div class="opt"><label class="sr" for="ppSize">' + tr('Size', 'المقاس') + '</label><div class="sel"><select id="ppSize"><option value="">' + tr('Size', 'المقاس') + '</option>' + SIZES.map(function(s){ return '<option value="' + s.id + '">' + tr('Size: ', 'المقاس: ') + esc(t(s)) + '</option>'; }).join('') + '</select></div><p class="dye-note" id="ppSizeE" style="color:var(--err)" hidden>' + tr('Choose a size.', 'يرجى اختيار المقاس.') + '</p></div>' +
          '<div class="opt"><p class="help">' + tr('Length of the piece, from shoulder to where you want it to end. Not your height.', 'طول القطعة من الكتف إلى حيث ترغبين أن تنتهي، وليس طولك.') + '</p><label class="sr" for="ppLen">' + tr('Length', 'الطول') + '</label><div class="sel"><select id="ppLen"><option value="">' + tr('Length', 'الطول') + '</option>' + LENGTHS.map(function(l){ return '<option value="' + l + '">' + tr('Length: ', 'الطول: ') + l + '″</option>'; }).join('') + '<option value="unsure">' + tr('Not sure? We will help', 'غير متأكدة؟ سنساعدك') + '</option></select></div><p class="dye-note" id="ppLenE" style="color:var(--err)" hidden>' + tr('Choose a length.', 'يرجى اختيار الطول.') + '</p></div>' +
          '<div class="buy"><div class="qty"' + (one ? ' hidden' : '') + ' role="group" aria-label="' + tr('Quantity', 'الكمية') + '"><button type="button" data-q="-1" aria-label="' + tr('Less', 'أقل') + '">−</button><output id="ppQty" class="num">1</output><button type="button" data-q="1" aria-label="' + tr('More', 'أكثر') + '">+</button></div>' +
            '<button class="btn full" type="submit" id="ppAdd"><span>' + (one && inCart(code) ? tr('In your cart', 'في الحقيبة') : one ? tr('Claim this piece', 'احجزي هذه القطعة') : tr('Add to cart', 'أضيفي إلى الحقيبة')) + '</span></button></div>' +
        '</form>') +
        '<div class="acc">' +
          (p.story && t(p.story) ? acc(tr('The story', 'القصة'), '<p>' + esc(t(p.story)) + '</p>', true) : '') +
          (one ? acc(tr('Why only one', 'لماذا قطعة واحدة'), '<p>' + tr('Some fabrics come in a single length and some designs deserve a single owner. Pieces in The One are made once; after that the pattern is retired and the dress is shown in our archive.', 'بعض الأقمشة تصلنا بقطعة واحدة فقط، وبعض التصاميم تستحق صاحبة واحدة. تُصنع قطع هذا الخط مرة واحدة، ثم يُغلق الباترون ويُعرض الفستان في الأرشيف.') + '</p>') : '') +
          acc(tr('Fabric and care', 'القماش والعناية'), '<p>' + (p.fabric && t(p.fabric) ? esc(t(p.fabric)) : tr('[Fabric to confirm]. Dry clean or hand wash cold. Steam on low; do not tumble dry.', '[سيتم تأكيد نوع القماش]. تنظيف جاف أو غسيل يدوي بماء بارد. كيّ بالبخار على حرارة منخفضة، دون استخدام المجفف.')) + '</p>') +
          acc(tr('Delivery and returns', 'التوصيل والاسترجاع'), '<p>' + tr('Each piece is cut after you order. We deliver across the UAE, the GCC and worldwide. Because pieces are made for you, see our refund policy before ordering.', 'تُفصَّل كل قطعة بعد طلبها. نوصّل إلى جميع أنحاء الإمارات ودول الخليج والعالم. ولأن القطعة تُصنع لكِ خصيصًا، يرجى مراجعة سياسة الاسترجاع قبل الطلب.') + ' <a href="#page-refund" style="text-decoration:underline">' + tr('Refund policy', 'سياسة الاسترجاع') + '</a></p>') +
        '</div>' +
      '</div>' +
    '</div></div>' +
    (related.length ? '<section class="sec line"><div class="wrap"><header class="sec-h" data-rv><h2 class="u-h2">' + (one ? tr('More from The One', 'المزيد من القطعة الواحدة') : tr('You may also like', 'قد يعجبك أيضًا')) + '</h2><span class="dash"></span></header>' + grid(related) + '</div></section>' : '');
  paintPP(true);
  var m = $('ppMedia');
  m.addEventListener('scroll', function(){ var i = Math.round(Math.abs(m.scrollLeft) / m.clientWidth); $('ppDots').querySelectorAll('i').forEach(function(d, k){ d.classList.toggle('on', k === i); }); }, {passive:true});
}
function acc(label, body, open){ return '<details' + (open ? ' open' : '') + '><summary class="u-h7">' + label + CHEV + '</summary><div class="rte">' + body + '</div></details>'; }
function ppHex(){ return PP.shade === null ? null : PP.shade === -1 ? PP.custom : SHADES[PP.shade].c; }
function ppDyed(p, i){ return !!(p.dye && ppHex() && i < 2); }
function paintPP(first){
  var p = prod(PP.code), hex = ppHex(), media = '', th = '', dots = '';
  p.imgs.forEach(function(src, i){
    var inner = ppDyed(p, i) ? dressHTML(p.dye, i, 'dyeP') : '<img' + (isCut(src) ? ' class="cut"' : '') + ' src="' + src + '" alt="' + (i ? '' : esc(t(p.name))) + '"' + (i ? ' loading="lazy"' : '') + '>';
    media += '<figure style="--tone:' + (p.tone || '') + '" data-zoom="' + i + '">' + inner + '</figure>';
    th += '<button type="button" data-th="' + i + '" style="--tone:' + (p.tone || '') + '" aria-label="' + tr('Photo ', 'صورة ') + (i + 1) + '"' + (i === PP.img ? ' aria-current="true"' : '') + '>' + (ppDyed(p, i) ? dressHTML(p.dye, i, 'dyeP') : '<img' + (isCut(src) ? ' class="cut"' : '') + ' src="' + src + '" alt="" loading="lazy">') + '</button>';
    dots += '<i' + (i ? '' : ' class="on"') + '></i>';
  });
  var dyedNow = !!(p.dye && hex), m = $('ppMedia');
  if(first || m.dataset.dyed !== String(dyedNow)){ m.innerHTML = media; $('ppTh').innerHTML = th; $('ppDots').innerHTML = p.imgs.length > 1 ? dots : ''; m.dataset.dyed = String(dyedNow); }
  if(hex) dyeTo('dyePFlood', hex, first);
  if(!$('ppSw')){ if($('ppSize')){ $('ppSize').value = PP.size; $('ppLen').value = PP.len; } return; }
  $('ppSw').querySelectorAll('[data-sh]').forEach(function(b){ var v = b.getAttribute('data-sh'); b.setAttribute('aria-pressed', String(v === 'o' ? PP.shade === null : +v === PP.shade)); });
  $('ppPickL').classList.toggle('on', PP.shade === -1);
  $('ppShadeN').textContent = PP.shade === null ? tr('As shown', 'كما في الصورة') : PP.shade === -1 ? PP.custom.toUpperCase() : t(SHADES[PP.shade]);
  $('ppSize').value = PP.size; $('ppLen').value = PP.len; $('ppQty').textContent = PP.qty;
}
function addToCart(){
  var bad = false;
  $('ppSizeE').hidden = !!PP.size; $('ppLenE').hidden = !!PP.len;
  if(!PP.size){ bad = true; } if(!PP.len){ bad = true; }
  if(bad){ ($('ppSize').value ? $('ppLen') : $('ppSize')).focus(); return; }
  var pr = prod(PP.code);
  if(isOut(pr)) return;
  if(pr.one){
    if(isSold(pr)) return;
    if(inCart(pr.code)){ openDrawer(); return; }
    CART.push({key:pr.code, code:pr.code, shade:null, hex:null, size:PP.size, len:PP.len, qty:1}); saveCart();
    $('ppAdd').querySelector('span').textContent = tr('In your cart', 'في الحقيبة');
    setTimeout(openDrawer, 250); return;
  }
  var hex = ppHex(), key = PP.code + '|' + (hex || 'orig') + '|' + PP.size + '|' + PP.len;
  var ex = CART.filter(function(it){ return it.key === key; })[0];
  if(ex) ex.qty += PP.qty; else CART.push({key:key, code:PP.code, shade:PP.shade, hex:hex, size:PP.size, len:PP.len, qty:PP.qty});
  saveCart();
  var b = $('ppAdd').querySelector('span'); b.textContent = tr('Added', 'تمت الإضافة');
  setTimeout(function(){ if($('ppAdd')) $('ppAdd').querySelector('span').textContent = tr('Add to cart', 'أضيفي إلى الحقيبة'); }, 1800);
  setTimeout(openDrawer, 250);
}

/* ---------- cart drawer ---------- */
function cartCount(){ return CART.reduce(function(n, it){ return n + it.qty; }, 0); }
function cartSub(){ return CART.reduce(function(n, it){ var p = prod(it.code); return n + (p ? p.price * it.qty : 0); }, 0); }
function updateCount(){ var n = cartCount(); $('cartN').textContent = n; $('cartDot').textContent = n || ''; $('cartIco').setAttribute('aria-label', tr('Cart', 'الحقيبة') + (n ? ', ' + n : '')); }
function renderDrawer(){
  thumbN = 0;
  var s = cartSub(), left = DLV().min - s, P = $('drw').querySelector('.drw-p');
  P.innerHTML = '<div class="drw-h"><h2 class="u-h6" id="drwT">' + tr('Cart', 'الحقيبة') + '</h2><button type="button" data-close-drw aria-label="' + tr('Close cart', 'إغلاق الحقيبة') + '">' + X + '</button></div>' +
    (CART.length ?
      (DLV().offer ? '<div class="ship-bar">' + (left > 0 ? tr('Spend ', 'أضيفي') + money(left) + tr(' more for free delivery', ' للحصول على توصيل مجاني') : tr('Free delivery offer applied', 'تم تطبيق عرض التوصيل المجاني')) + '<i style="--p:' + (DLV().min ? clamp(s / DLV().min, 0, 1) : 1) + '"></i></div>' : '') +
      '<div class="drw-b">' + CART.map(function(it, i){
        var p = prod(it.code); if(!p) return '';
        return '<div class="li"><a class="im" href="#p-' + p.code + '" data-close-drw style="--tone:' + (p.tone || '') + '">' + lineImg(it) + '</a><div><a class="ttl" href="#p-' + p.code + '" data-close-drw>' + esc(t(p.name)) + '</a>' +
          '<span class="meta">' + (it.hex ? '<i class="dot" style="background:' + it.hex + '"></i>' : '') + esc(variant(it)) + '</span><span class="pr num">' + money(p.price * it.qty) + '</span>' +
          '<div class="acts">' + (p.one ? '<span class="one-badge sm">N° ' + p.no + ' · ' + tr('1 of 1', 'قطعة واحدة') + '</span>' : '<div class="qty sm" role="group" aria-label="' + tr('Quantity', 'الكمية') + '"><button type="button" data-cq="' + i + '" data-d="-1" aria-label="' + tr('Less', 'أقل') + '">−</button><output class="num">' + it.qty + '</output><button type="button" data-cq="' + i + '" data-d="1" aria-label="' + tr('More', 'أكثر') + '">+</button></div>') + '<button class="rm" type="button" data-rm="' + i + '">' + tr('Remove', 'إزالة') + '</button></div></div></div>';
      }).join('') + '</div>' +
      '<div class="drw-f"><p class="note">' + tr('Delivery is calculated at checkout. Prices include VAT.', 'تُحتسب رسوم التوصيل عند الدفع. الأسعار شاملة الضريبة.') + '</p><a class="btn full" href="#checkout" data-close-drw><span>' + tr('Checkout', 'إتمام الطلب') + ' · <span class="num">' + money(s) + '</span></span></a></div>'
    : '<div class="drw-empty"><p class="u-h6">' + tr('Your cart is empty', 'حقيبتك فارغة') + '</p><a class="btn" href="#s-all" data-close-drw>' + tr('Shop the collection', 'تسوّقي المجموعة') + '</a></div>');
}

/* ---------- panels: drawer, side menu, search, modal, lightbox ---------- */
var locks = 0, lastFocus = null;
function lock(on){ locks = Math.max(0, locks + (on ? 1 : -1)); document.documentElement.style.overflow = locks ? 'hidden' : ''; }
function openPanel(el, focusSel){ if(el.classList.contains('open')) return; lastFocus = document.activeElement; el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); lock(true); setTimeout(function(){ var f = el.querySelector(focusSel); if(f) f.focus(); }, 80); }
function closePanel(el){ if(!el.classList.contains('open')) return; el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); lock(false); if(lastFocus && document.contains(lastFocus)) lastFocus.focus({preventScroll:true}); }
function openDrawer(){ renderDrawer(); openPanel($('drw'), '[data-close-drw]'); }
function closeDrawer(){ closePanel($('drw')); }
function openSide(){ renderSide(); openPanel($('side'), '[data-close-side]'); $('burger').setAttribute('aria-expanded', 'true'); }
function closeSide(){ closePanel($('side')); $('burger').setAttribute('aria-expanded', 'false'); }
function openSearch(){ openPanel($('srch'), '#srchIn'); }
function closeSearch(){ closePanel($('srch')); }
function openModal(html){ $('mdlBody').innerHTML = html; openPanel($('mdl'), '.mdl-x'); }
function closeModal(){ closePanel($('mdl')); }
var LB = {list:[], i:0};
function openLB(list, i){ LB.list = list; LB.i = i; $('lbImg').src = list[i]; openPanel($('lb'), '[data-lb="x"]'); }
function trap(e, box){
  var f = box.querySelectorAll('a[href],button:not([disabled]),input,select,textarea'); if(!f.length) return;
  var vis = [].filter.call(f, function(x){ return x.offsetParent !== null; }), a = vis[0], z = vis[vis.length - 1];
  if(e.shiftKey && document.activeElement === a){ e.preventDefault(); z.focus(); } else if(!e.shiftKey && document.activeElement === z){ e.preventDefault(); a.focus(); }
}
function sizeChartHTML(){
  return '<h2 class="u-h6" id="mdlT">' + tr('Size chart', 'جدول المقاسات') + '</h2><p class="muted" style="margin:10px 0 0">' + tr('Body measurements in centimetres. Between two sizes? Choose the larger one, or choose “Custom” and send us your measurements at checkout.', 'مقاسات الجسم بالسنتيمتر. إذا كنتِ بين مقاسين فاختاري الأكبر، أو اختاري «تفصيل حسب مقاساتي» وأرسلي مقاساتك عند الدفع.') + '</p>' +
    '<table class="tbl num"><thead><tr><th>' + tr('Size', 'المقاس') + '</th><th>' + tr('Bust', 'الصدر') + '</th><th>' + tr('Waist', 'الوسط') + '</th><th>' + tr('Hips', 'الأرداف') + '</th></tr></thead><tbody>' +
    CHART.map(function(r){ return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td></tr>'; }).join('') + '</tbody></table>' +
    '<p class="muted" style="margin:18px 0 0;font-size:13px">' + tr('Length: measure from the top of your shoulder down to where you want the piece to end, in inches.', 'الطول: قيسي من أعلى الكتف إلى حيث ترغبين أن تنتهي القطعة، بالإنش.') + '</p>';
}

/* side menu + mega menu */
function renderSide(){
  $('sideNav').innerHTML =
    '<details open><summary>' + tr('Collections', 'المجموعات') + '<i></i></summary><ul>' + colsShown().map(function(c){ return '<li><a href="#' + c.id + '" data-close-side>' + esc(t(c.name)) + '</a></li>'; }).join('') + '</ul></details>' +
    '<details><summary>' + tr('Shop', 'تسوّقي') + '<i></i></summary><ul>' + STYLES.map(function(s){ return '<li><a href="#s-' + s.id + '" data-close-side>' + esc(t(s.id === 'all' ? {en:'All products', ar:'جميع المنتجات'} : s)) + '</a></li>'; }).join('') + '</ul></details>' +
    (ONE.length ? '<a class="s-l" href="#the-one" data-close-side>' + tr('The One', 'القطعة الواحدة') + '</a>' : '') +
    '<a class="s-l" href="#page-how" data-close-side>' + tr('How ordering works', 'طريقة الطلب') + '</a>';
}
function colsShown(){ return COLLECTIONS.filter(function(c){ return c.id !== 'the-one' || ONE.length; }); }
function renderMenus(){
  document.querySelectorAll('.nav a[href="#the-one"]').forEach(function(x){ x.parentNode.hidden = !ONE.length; });
  $('megaCols').innerHTML = colsShown().map(function(c){ return '<li><a href="#' + c.id + '">' + esc(t(c.name)) + '</a></li>'; }).join('');
  $('megaStyles').innerHTML = STYLES.map(function(s){ return '<li><a href="#s-' + s.id + '">' + esc(t(s.id === 'all' ? {en:'All products', ar:'جميع المنتجات'} : s)) + '</a></li>'; }).join('');
  $('megaPics').innerHTML = colsShown().filter(function(c){ return c.id !== 'the-one' && (c.small || c.cover); }).slice(0, 2).map(function(c){ var id = c.id; return '<a href="#' + id + '"><div class="ph" style="aspect-ratio:3/4"><img src="' + esc(c.small || c.cover) + '" alt="" loading="lazy"></div><span class="u-h7">' + esc(t(c.name)) + '</span></a>'; }).join('');
  $('ftShop').innerHTML = STYLES.map(function(s){ return '<li><a href="#s-' + s.id + '">' + esc(t(s.id === 'all' ? {en:'All products', ar:'جميع المنتجات'} : s)) + '</a></li>'; }).join('');
  $('ftCols').innerHTML = colsShown().map(function(c){ return '<li><a href="#' + c.id + '">' + esc(t(c.name)) + '</a></li>'; }).join('');
}
function setMega(on){ var m = $('mega'); m.classList.toggle('open', on); $('hd').classList.toggle('menu-on', on); $('megaBtn').setAttribute('aria-expanded', String(on)); }

/* search */
function runSearch(q){
  q = q.trim().toLowerCase(); var box = $('srchRes');
  if(!q){ box.innerHTML = ''; return; }
  var hits = PRODUCTS.filter(function(p){ var c = col(p.col); return [p.name.en, p.name.ar, (p.desc || {}).en, (p.desc || {}).ar, c ? c.name.en : '', c ? c.name.ar : '', p.code].join(' ').toLowerCase().indexOf(q) > -1; });
  box.innerHTML = hits.length ? '<p class="u-h7 muted" style="margin-bottom:24px">' + count(hits.length) + '</p>' + grid(hits.slice(0, 8)) : '<p class="muted">' + tr('No results for “', 'لا توجد نتائج لـ «') + esc(q) + tr('”. Try a collection, a dress or an abaya name.', '». جرّبي اسم مجموعة أو فستان أو عباية.') + '</p>';
  box.querySelectorAll('[data-rv]').forEach(function(el){ el.classList.add('in'); });
}

/* ================= checkout (guest, Shopify-style) ================= */
function DLV(){ var d = SITE.delivery || {}; return {ae:num(d.ae, 25), gcc:num(d.gcc, 60), intl:num(d.intl, 95), express:num(d.express, 40), offer:!!d.offer, min:num(d.min, 0), zones:d.zones || 'ae'}; }
function num(v, d){ v = parseFloat(v); return isFinite(v) && v >= 0 ? v : d; }
/* free delivery only while an offer is switched on in the control room */
function freeShip(z, sub){ var d = DLV(); return d.offer && sub >= d.min && (d.zones === 'all' || (d.zones === 'gcc' ? z !== 'intl' : z === 'ae')); }
function shipFor(country, method, sub){
  var z = (find(COUNTRIES, country) || COUNTRIES[0]).zone, d = DLV();
  var base = freeShip(z, sub) ? 0 : z === 'ae' ? d.ae : z === 'gcc' ? d.gcc : d.intl;
  return base + (method === 'express' ? d.express : 0);
}
var CO = {country:'AE', method:'standard', pay:'link', bill:'same', sumOpen:false};
function fl(name, label, type, val, extra, opt){
  return '<div class="fl' + (val ? ' up' : '') + '" data-f="' + name + '"><input id="f-' + name + '" name="' + name + '" type="' + type + '" value="' + esc(val || '') + '" placeholder=" " ' + (extra || '') + (opt ? '' : ' aria-required="true"') + ' aria-describedby="e-' + name + '"><label for="f-' + name + '">' + label + '</label><p class="err" id="e-' + name + '"></p></div>';
}
function flSel(name, label, options, val){
  return '<div class="fl s" data-f="' + name + '"><select id="f-' + name + '" name="' + name + '" aria-describedby="e-' + name + '">' + options.map(function(o){ return '<option value="' + o[0] + '"' + (o[0] === val ? ' selected' : '') + (o[2] ? ' disabled' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select><label for="f-' + name + '">' + label + '</label><p class="err" id="e-' + name + '"></p></div>';
}
function regionField(country, val){
  if(country === 'AE') return flSel('region', tr('Emirate', 'الإمارة'), [['', tr('Select', 'اختيار'), true]].concat(EMIRATES.map(function(e){ return [e.id, t(e)]; })), val || '');
  return fl('region', tr('State / province (optional)', 'المنطقة أو الولاية (اختياري)'), 'text', val, 'autocomplete="address-level1"', true);
}
function summaryHTML(items, sub, ship, total, editable){
  thumbN = 0;
  var tax = total * 5 / 105;
  return items.map(function(it){
      var p = prod(it.code); if(!p) return '';
      return '<div class="sline"><span class="im" style="--tone:' + (p.tone || '') + '"><span class="clip">' + lineImg(it) + '</span><em class="num">' + it.qty + '</em></span><span><b>' + esc(t(p.name)) + '</b><small>' + esc(variant(it)) + '</small></span><span class="p num">' + money(p.price * it.qty) + '</span></div>';
    }).join('') +
    (editable ? '<form class="disc" id="discForm" novalidate>' + fl('disc', tr('Discount code', 'كود الخصم'), 'text', '', 'autocomplete="off"', true) + '<button type="submit" id="discBtn">' + tr('Apply', 'تطبيق') + '</button></form>' : '') +
    '<div class="tot"><div class="sum-row"><span>' + tr('Subtotal', 'المجموع الفرعي') + ' · ' + cartQty(items) + '</span><span class="num">' + money(sub) + '</span></div>' +
    '<div class="sum-row"><span>' + tr('Shipping', 'الشحن') + '</span><span class="num" id="coShip">' + (ship ? money(ship) : tr('Free', 'مجاني')) + '</span></div>' +
    '<div class="sum-row grand"><span>' + tr('Total', 'الإجمالي') + '</span><span><span class="num" id="coTot">' + money(total) + '</span></span></div>' +
    '<p class="tax" id="coTax">' + tr('Including ', 'تشمل') + '<span class="num">' + money(tax) + '</span>' + tr(' in taxes', ' ضريبة') + '</p></div>';
}
function cartQty(items){ var n = items.reduce(function(a, it){ return a + it.qty; }, 0); return L === 'ar' ? count(n) : n + (n === 1 ? ' item' : ' items'); }
function coShell(left, items, sub, ship, total, editable){
  var logo = '<a class="co-logo" href="#" data-home aria-label="NMH Dubai"><img class="l-d" src="img/logo-dark.png" alt="NMH Dubai" width="84" height="40"><img class="l-w" src="img/logo.png" alt="" width="84" height="40"></a>';
  return '<div class="co-mtop">' + logo + '</div><div class="co-wrap">' +
    '<div class="co-l"><div>' + logo + left + '</div></div>' +
    '<aside class="co-r" aria-label="' + tr('Order summary', 'ملخص الطلب') + '"><div>' +
      '<button class="co-toggle" type="button" id="coToggle" aria-expanded="' + CO.sumOpen + '" aria-controls="coSum"><span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 6h14l-1 13H4L3 6z"/><path d="M7 6V4.5a3 3 0 0 1 6 0V6"/></svg>' + tr('Order summary', 'ملخص الطلب') + '<svg class="chev" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 1l4 4 4-4"/></svg></span><b class="num" id="coTotM">' + money(total) + '</b></button>' +
      '<div class="co-sum' + (CO.sumOpen ? ' open' : '') + '" id="coSum"><div>' + summaryHTML(items, sub, ship, total, editable) + '</div></div>' +
    '</div></aside></div>';
}
function viewCheckout(){
  if(!CART.length){
    app.innerHTML = '<header class="ph-head wrap"><h1 class="u-h1">' + tr('Checkout', 'إتمام الطلب') + '</h1></header><div class="empty"><p>' + tr('Your cart is empty.', 'حقيبتك فارغة.') + '</p><a class="btn" href="#s-all">' + tr('Shop the collection', 'تسوّقي المجموعة') + '</a></div>';
    document.body.classList.remove('is-co');
    return;
  }
  var d = SAVED || {}; if(d.country) CO.country = d.country;
  var custom = CART.some(function(it){ return it.size === 'custom'; });
  var sub = cartSub(), ship = shipFor(CO.country, CO.method, sub);
  var left =
    '<form id="coForm" novalidate>' +
      '<section class="co-sec"><h2>' + tr('Contact', 'معلومات الاتصال') + '</h2>' +
        fl('email', tr('Email', 'البريد الإلكتروني'), 'email', d.email, 'autocomplete="email" dir="ltr" inputmode="email"') +
        '<label class="chk"><input type="checkbox" name="news"' + (d.news ? ' checked' : '') + '>' + tr('Email me with news and offers', 'أرسلوا لي آخر المجموعات والعروض') + '</label></section>' +
      '<section class="co-sec"><h2>' + tr('Delivery', 'التوصيل') + '</h2>' +
        flSel('country', tr('Country / region', 'الدولة'), COUNTRIES.map(function(c){ return [c.id, t(c)]; }), CO.country) +
        '<div class="g2">' + fl('first', tr('First name', 'الاسم الأول'), 'text', d.first, 'autocomplete="given-name"') + fl('last', tr('Last name', 'اسم العائلة'), 'text', d.last, 'autocomplete="family-name"') + '</div>' +
        fl('addr', tr('Address', 'العنوان'), 'text', d.addr, 'autocomplete="address-line1"') +
        fl('apt', tr('Apartment, villa, building (optional)', 'الشقة، الفيلا، المبنى (اختياري)'), 'text', d.apt, 'autocomplete="address-line2"', true) +
        '<div class="g3">' + fl('city', tr('City / area', 'المدينة أو المنطقة'), 'text', d.city, 'autocomplete="address-level2"') + '<div id="regionBox">' + regionField(CO.country, d.region) + '</div>' + fl('zip', tr('Postal code (optional)', 'الرمز البريدي (اختياري)'), 'text', d.zip, 'autocomplete="postal-code" dir="ltr"', true) + '</div>' +
        fl('phone', tr('Phone, for delivery and WhatsApp', 'رقم الهاتف، للتوصيل وواتساب'), 'tel', d.phone, 'autocomplete="tel" dir="ltr" inputmode="tel"') +
        '<label class="chk"><input type="checkbox" name="save"' + (SAVED ? ' checked' : '') + '>' + tr('Save this information for next time', 'حفظ هذه المعلومات للمرة القادمة') + '</label></section>' +
      (custom ? '<section class="co-sec"><h2>' + tr('Your measurements', 'مقاساتك') + ' <small>cm</small></h2><p class="sub">' + tr('At least one piece is cut to your measurements.', 'سيتم تفصيل قطعة واحدة على الأقل وفق مقاساتك.') + '</p><div class="g3">' +
        [['height', tr('Height', 'الطول')], ['bust', tr('Bust', 'الصدر')], ['waist', tr('Waist', 'الوسط')], ['hips', tr('Hips', 'الأرداف')], ['sleeve', tr('Sleeve (optional)', 'الكم (اختياري)')], ['shoulder', tr('Shoulder (optional)', 'الكتف (اختياري)')]].map(function(f, i){
          return fl('m_' + f[0], f[1], 'number', (d.measure || {})[f[0]], 'inputmode="decimal" min="0" max="250" dir="ltr"', i > 3);
        }).join('') + '</div></section>' : '') +
      '<section class="co-sec"><h2>' + tr('Shipping method', 'طريقة الشحن') + '</h2><div class="opts" id="shipOpts">' +
        '<label' + (CO.method === 'standard' ? ' class="on"' : '') + '><input type="radio" name="method" value="standard"' + (CO.method === 'standard' ? ' checked' : '') + '><span><b>' + tr('Standard', 'قياسي') + '</b><small>' + tr('Shipped when your piece is ready', 'يُشحن فور اكتمال القطعة') + '</small></span><em class="num" id="shipStd"></em></label>' +
        '<label' + (CO.method === 'express' ? ' class="on"' : '') + '><input type="radio" name="method" value="express"' + (CO.method === 'express' ? ' checked' : '') + '><span><b>' + tr('Express', 'سريع') + '</b><small>' + tr('Priority cutting and courier', 'أولوية في التفصيل وشحن سريع') + '</small></span><em class="num" id="shipExp"></em></label></div></section>' +
      '<section class="co-sec"><h2>' + tr('Payment', 'الدفع') + '</h2><p class="sub">' + tr('All transactions are secure. Nothing is charged until we confirm your order.', 'جميع المعاملات آمنة. لن يُخصم أي مبلغ قبل تأكيد طلبك.') + '</p><div class="opts" id="payOpts">' +
        '<label' + (CO.pay === 'link' ? ' class="on"' : '') + '><input type="radio" name="pay" value="link"' + (CO.pay === 'link' ? ' checked' : '') + '><span><b>' + tr('Card payment link', 'رابط دفع بالبطاقة') + '</b><small>Visa · Mastercard · Apple Pay</small></span><span></span><p class="more">' + tr('After you complete your order, we confirm the fabric and fit with you, then send a secure card payment link by WhatsApp and email.', 'بعد إتمام الطلب، نؤكد معك القماش والمقاس، ثم نرسل لكِ رابط دفع آمنًا عبر واتساب والبريد الإلكتروني.') + '</p></label>' +
        '<label id="codOpt"' + (CO.pay === 'cod' ? ' class="on"' : '') + '><input type="radio" name="pay" value="cod"' + (CO.pay === 'cod' ? ' checked' : '') + '><span><b>' + tr('Cash on delivery', 'الدفع عند الاستلام') + '</b><small>' + tr('UAE only', 'داخل الإمارات فقط') + '</small></span><span></span><p class="more">' + tr('Pay in cash or by card when your piece arrives.', 'ادفعي نقدًا أو بالبطاقة عند استلام القطعة.') + '</p></label></div></section>' +
      '<section class="co-sec"><h2>' + tr('Billing address', 'عنوان الفاتورة') + '</h2><div class="opts" id="billOpts">' +
        '<label' + (CO.bill === 'same' ? ' class="on"' : '') + '><input type="radio" name="bill" value="same"' + (CO.bill === 'same' ? ' checked' : '') + '><span><b style="font-weight:400">' + tr('Same as shipping address', 'نفس عنوان التوصيل') + '</b></span></label>' +
        '<label' + (CO.bill === 'diff' ? ' class="on"' : '') + '><input type="radio" name="bill" value="diff"' + (CO.bill === 'diff' ? ' checked' : '') + '><span><b style="font-weight:400">' + tr('Use a different billing address', 'عنوان فاتورة مختلف') + '</b></span></label></div>' +
        '<div id="billBox" style="margin-top:14px"' + (CO.bill === 'diff' ? '' : ' hidden') + '>' + fl('b_name', tr('Full name', 'الاسم الكامل'), 'text', '', 'autocomplete="billing name"') + fl('b_addr', tr('Address', 'العنوان'), 'text', '', 'autocomplete="billing street-address"') + fl('b_city', tr('City and country', 'المدينة والدولة'), 'text', '', 'autocomplete="billing address-level2"') + '</div></section>' +
      '<div class="fl" data-f="note" style="margin-bottom:24px"><textarea id="f-note" name="note" rows="3" placeholder=" "></textarea><label for="f-note">' + tr('Notes for the atelier (optional)', 'ملاحظات للأتيليه (اختياري)') + '</label></div>' +
      '<p class="co-err" id="coErr" role="alert"></p>' +
      '<div class="co-btn"><button class="btn" type="submit" id="coSubmit"><span>' + tr('Complete order', 'إتمام الطلب') + '</span></button><a href="#s-all">' + tr('Return to shop', 'العودة إلى المتجر') + '</a></div>' +
    '</form>' +
    '<nav class="co-pol" aria-label="' + tr('Policies', 'السياسات') + '"><a href="#page-refund">' + tr('Refund policy', 'سياسة الاسترجاع') + '</a><a href="#page-shipping">' + tr('Shipping policy', 'سياسة الشحن') + '</a><a href="#page-privacy">' + tr('Privacy policy', 'سياسة الخصوصية') + '</a><a href="#page-terms">' + tr('Terms of service', 'الشروط والأحكام') + '</a></nav>';
  app.innerHTML = coShell(left, CART, sub, ship, sub + ship, true);
  coTotals();
}
function coTotals(){
  var f = $('coForm'); if(!f) return;
  CO.country = f.country.value; CO.method = f.querySelector('[name=method]:checked').value;
  var ae = CO.country === 'AE', cod = $('codOpt');
  cod.classList.toggle('off', !ae); cod.querySelector('input').disabled = !ae;
  if(!ae && CO.pay === 'cod'){ CO.pay = 'link'; f.querySelector('[name=pay][value=link]').checked = true; }
  ['shipOpts', 'payOpts', 'billOpts'].forEach(function(id){ $(id).querySelectorAll('label').forEach(function(l){ l.classList.toggle('on', l.querySelector('input').checked); }); });
  var sub = cartSub(), sh = shipFor(CO.country, CO.method, sub), tot = sub + sh;
  $('coShip').textContent = sh ? money(sh) : tr('Free', 'مجاني');
  $('coTot').textContent = money(tot); $('coTotM').textContent = money(tot);
  $('coTax').innerHTML = tr('Including ', 'تشمل') + '<span class="num">' + money(tot * 5 / 105) + '</span>' + tr(' in taxes', ' ضريبة');
  var s1 = shipFor(CO.country, 'standard', sub), s2 = shipFor(CO.country, 'express', sub);
  $('shipStd').textContent = s1 ? money(s1) : tr('Free', 'مجاني'); $('shipExp').textContent = money(s2);
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function checkField(inp){
  var f = inp.closest('.fl'); if(!f) return true;
  var n = inp.name, v = String(inp.value || '').trim(), msg = '';
  var custom = CART.some(function(it){ return it.size === 'custom'; });
  if(n === 'email') msg = !v ? tr('Enter an email', 'يرجى إدخال البريد الإلكتروني') : !EMAIL_RE.test(v) ? tr('Enter a valid email, like name@example.com', 'يرجى إدخال بريد إلكتروني صحيح، مثل name@example.com') : '';
  else if(n === 'first') msg = !v ? tr('Enter a first name', 'يرجى إدخال الاسم الأول') : '';
  else if(n === 'last') msg = !v ? tr('Enter a last name', 'يرجى إدخال اسم العائلة') : '';
  else if(n === 'addr') msg = v.length < 4 ? tr('Enter an address', 'يرجى إدخال العنوان') : '';
  else if(n === 'city') msg = !v ? tr('Enter a city', 'يرجى إدخال المدينة') : '';
  else if(n === 'region' && inp.tagName === 'SELECT') msg = !v ? tr('Select an emirate', 'يرجى اختيار الإمارة') : '';
  else if(n === 'phone') msg = v.replace(/\D/g, '').length < 7 ? tr('Enter a phone number we can reach you on', 'يرجى إدخال رقم هاتف يمكننا التواصل معك عليه') : '';
  else if(/^m_(height|bust|waist|hips)$/.test(n) && custom) msg = !(+v > 0) ? tr('Needed for your custom fit', 'مطلوب للتفصيل حسب مقاسك') : '';
  else if(/^b_/.test(n) && CO.bill === 'diff') msg = !v ? tr('Enter your billing details', 'يرجى إدخال بيانات الفاتورة') : '';
  f.classList.toggle('bad', !!msg); var e = f.querySelector('.err'); if(e) e.textContent = msg;
  inp.setAttribute('aria-invalid', msg ? 'true' : 'false');
  return !msg;
}
function placeOrder(f){
  var ok = true, first = null;
  f.querySelectorAll('.fl input,.fl select').forEach(function(inp){ if(inp.closest('[hidden]')) return; if(!checkField(inp)){ ok = false; if(!first) first = inp; } });
  if(!ok){ $('coErr').textContent = tr('Some details are missing. Check the highlighted fields.', 'بعض البيانات ناقصة. يرجى مراجعة الحقول المحددة.'); first.focus(); first.scrollIntoView({block:'center', behavior:reduce ? 'auto' : 'smooth'}); return; }
  $('coErr').textContent = '';
  var g = function(n){ var el = f.elements[n]; return el ? String(el.value || '').trim() : ''; };
  var custom = CART.some(function(it){ return it.size === 'custom'; }), meas = null;
  if(custom){ meas = {}; ['height', 'bust', 'waist', 'hips', 'sleeve', 'shoulder'].forEach(function(k){ meas[k] = g('m_' + k); }); }
  var sub = cartSub(), sh = shipFor(CO.country, CO.method, sub);
  var id = 'NMH-' + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  var regionEl = f.elements.region, regionTxt = regionEl.tagName === 'SELECT' ? (find(EMIRATES, regionEl.value) || {}).en || '' : regionEl.value.trim();
  var o = {id:id, created:Date.now(), status:0, lang:L,
    items:CART.map(function(it){ var p = prod(it.code); return {code:it.code, name:p.name.en, name_ar:p.name.ar, img:p.imgs[0], tone:p.tone || '', no:p.no || '', variant:variant(it), shade:it.shade, hex:it.hex, size:it.size, len:it.len || '', qty:it.qty, price:p.price}; }),
    sub:sub, ship:sh, total:sub + sh, method:CO.method, pay:CO.pay,
    contact:{name:(g('first') + ' ' + g('last')).trim(), first:g('first'), last:g('last'), phone:g('phone'), email:g('email'), news:f.elements.news.checked},
    address:{country:CO.country, region:regionTxt, city:g('city'), line:g('addr'), apt:g('apt'), zip:g('zip')},
    billing:CO.bill === 'diff' ? {name:g('b_name'), line:g('b_addr'), city:g('b_city')} : 'same',
    note:g('note'), measure:meas};
  var btn = $('coSubmit'), lab = btn.querySelector('span'), was = lab.textContent;
  if(pruneSold()){ viewCheckout(); return; }
  btn.disabled = true; lab.textContent = tr('Placing your order…', 'جارٍ تسجيل طلبك…');
  commitOrder(o).then(function(){ finishOrder(f, o, regionEl, meas); }, function(err){
    btn.disabled = false; lab.textContent = was;
    if(err && /permission|denied/i.test(err.code || err.message || '')){
      o.items.forEach(function(it){ var p = prod(it.code); if(p && p.one) SOLD[p.code] = 1; });
      fbLoadSold(); pruneSold(); viewCheckout();
      if($('coErr')) $('coErr').textContent = tr('Someone claimed that piece a moment before you, so it was removed from your cart. Nothing was charged.', 'حُجزت هذه القطعة قبلك بلحظات، لذا أُزيلت من حقيبتك. لم يُخصم أي مبلغ.');
    } else {
      $('coErr').textContent = tr('We could not reach our server. Check your connection and try again.', 'تعذّر الاتصال بالخادم. تحققي من الإنترنت وحاولي مرة أخرى.');
    }
  });
}
function finishOrder(f, o, regionEl, meas){
  ORDERS.unshift(o); DB.set('orders', ORDERS.slice(0, 30));
  o.items.forEach(function(it){ if(/^O\d/.test(it.code)) SOLD[it.code] = 1; });
  if(o.contact.news) subscribe(o.contact.email, 'checkout');
  if(f.elements.save.checked){ SAVED = {email:o.contact.email, news:o.contact.news, country:CO.country, first:o.contact.first, last:o.contact.last, addr:o.address.line, apt:o.address.apt, city:o.address.city, region:regionEl.value, zip:o.address.zip, phone:o.contact.phone, measure:meas || (SAVED && SAVED.measure) || null}; DB.set('details', SAVED); }
  else { SAVED = null; DB.set('details', null); }
  CART = []; saveCart();
  location.hash = 'order-' + o.id;
}
function viewOrder(id){
  var o = ORDERS.filter(function(x){ return x.id === id; })[0];
  if(!o){ document.body.classList.remove('is-co'); app.innerHTML = '<header class="ph-head wrap"><h1 class="u-h1">' + tr('Order not found', 'الطلب غير موجود') + '</h1><div class="rte"><p>' + tr('This order was placed on another device or browser. Message us on Instagram with the order number and we will help.', 'تم هذا الطلب من جهاز أو متصفح آخر. أرسلي لنا رقم الطلب عبر إنستغرام وسنساعدك.') + '</p></div></header><div class="empty"><a class="btn" href="#s-all">' + tr('Continue shopping', 'متابعة التسوّق') + '</a></div>'; return; }
  var c = find(COUNTRIES, o.address.country) || COUNTRIES[0];
  var left =
    '<div class="ty-h"><svg viewBox="0 0 50 50" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="25" cy="25" r="22"/><path d="M15 25.5l7 7 13-14"/></svg><div><small>' + tr('Order ', 'طلب ') + '<span dir="ltr">' + o.id + '</span></small><b>' + tr('Thank you, ', 'شكرًا لكِ،') + esc(o.contact.first || o.contact.name) + '!</b></div></div>' +
    '<div class="box"><h3>' + tr('We have your order', 'استلمنا طلبك') + '</h3><p>' + tr('We will message you on WhatsApp within one working day to confirm the fabric and fit. Nothing is cut or charged until you agree.', 'سنتواصل معك عبر واتساب خلال يوم عمل لتأكيد القماش والمقاس. لا تفصيل ولا دفع قبل موافقتك.') + '</p></div>' +
    '<div class="box"><h3 style="margin-bottom:16px">' + tr('Order details', 'تفاصيل الطلب') + '</h3><div class="cols">' +
      '<div><h4>' + tr('Contact information', 'معلومات الاتصال') + '</h4><p dir="ltr" style="text-align:start">' + esc(o.contact.email) + '<br>' + esc(o.contact.phone) + '</p></div>' +
      '<div><h4>' + tr('Payment method', 'طريقة الدفع') + '</h4><p>' + (o.pay === 'cod' ? tr('Cash on delivery', 'الدفع عند الاستلام') : tr('Card payment link, sent after confirmation', 'رابط دفع بالبطاقة بعد التأكيد')) + ' · <span class="num">' + money(o.total) + '</span></p></div>' +
      '<div><h4>' + tr('Shipping address', 'عنوان الشحن') + '</h4><p>' + esc(o.contact.name) + '<br>' + esc(o.address.line) + (o.address.apt ? ', ' + esc(o.address.apt) : '') + '<br>' + esc(o.address.city) + (o.address.region ? ', ' + esc(o.address.region) : '') + '<br>' + esc(t(c)) + '</p></div>' +
      '<div><h4>' + tr('Billing address', 'عنوان الفاتورة') + '</h4><p>' + (o.billing === 'same' ? tr('Same as shipping address', 'نفس عنوان التوصيل') : esc(o.billing.name) + '<br>' + esc(o.billing.line) + '<br>' + esc(o.billing.city)) + '</p></div>' +
      '<div><h4>' + tr('Shipping method', 'طريقة الشحن') + '</h4><p>' + (o.method === 'express' ? tr('Express', 'سريع') : tr('Standard', 'قياسي')) + '</p></div>' +
    '</div></div>' +
    '<div class="co-btn" style="margin-top:20px"><p style="margin:0;font-size:14px">' + tr('Need help? ', 'هل تحتاجين مساعدة؟') + '<a href="https://www.instagram.com/_bynmh/" target="_blank" rel="noopener">' + tr('Contact us', 'تواصلي معنا') + '</a></p><a class="btn" href="#s-all" style="text-decoration:none"><span>' + tr('Continue shopping', 'متابعة التسوّق') + '</span></a></div>';
  app.innerHTML = coShell(left, o.items, o.sub, o.ship, o.total, false);
}

/* ================= text pages ================= */
var PAGES = {
  how:{t:{en:'How ordering works',ar:'طريقة الطلب'}, b:{
    en:'<h2>1. Choose your piece</h2><p>Choose a dress or an abaya, then your size and length.</p><h2>2. Complete your order</h2><p>Check out with your contact and delivery details. Nothing is charged at this step.</p><h2>3. We confirm with you</h2><p>Within one working day we message you on WhatsApp to confirm the fabric and fit, and send a photo of the real fabric.</p><h2>4. Cut and delivered</h2><p>We cut your piece in Dubai and deliver it to your door. Pay by card link or, in the UAE, cash on delivery.</p>',
    ar:'<h2>١. اختاري القطعة</h2><p>اختاري الفستان أو العباية، والمقاس والطول المناسبين لكِ.</p><h2>٢. أتمّي الطلب</h2><p>أدخلي بيانات الاتصال والتوصيل. لا يوجد أي دفع في هذه الخطوة.</p><h2>٣. نؤكد معك</h2><p>خلال يوم عمل نتواصل معك عبر واتساب لتأكيد القماش والمقاس، ونرسل لكِ صورة القماش الفعلي.</p><h2>٤. التفصيل والتوصيل</h2><p>نفصّل القطعة في دبي ونوصلها إلى باب بيتك. الدفع عبر رابط بطاقة، أو نقدًا عند الاستلام داخل الإمارات.</p>'}},
  size:{t:{en:'Size guide',ar:'دليل المقاسات'}, b:null},
  shipping:{t:{en:'Shipping policy',ar:'سياسة الشحن'}, b:{
    en:'<p>Every piece is made to order in Dubai. Production time starts once we confirm your fabric and fit: [X] working days.</p><h2>United Arab Emirates</h2><p>Standard delivery 25 AED. Express adds 40 AED. Free delivery applies only during announced offers.</p><h2>GCC</h2><p>60 AED. Express adds 40 AED.</p><h2>Rest of the world</h2><p>95 AED. Express adds 40 AED. Import duties, if any, are paid on arrival.</p>',
    ar:'<p>تُفصَّل كل قطعة حسب الطلب في دبي. تبدأ مدة التفصيل بعد تأكيد القماش والمقاس: [X] يوم عمل.</p><h2>الإمارات</h2><p>التوصيل القياسي ٢٥ د.إ. يضاف ٤٠ د.إ للتوصيل السريع. التوصيل المجاني متاح فقط خلال العروض المعلنة.</p><h2>دول الخليج</h2><p>٦٠ د.إ. يضاف ٤٠ د.إ للتوصيل السريع.</p><h2>باقي الدول</h2><p>٩٥ د.إ. يضاف ٤٠ د.إ للتوصيل السريع. تُدفع الرسوم الجمركية، إن وُجدت، عند الاستلام.</p>'}},
  refund:{t:{en:'Refund policy',ar:'سياسة الاسترجاع'}, b:{
    en:'<p>[Draft for NMH to confirm.]</p><p>Because each piece is cut for you in the size and length you choose, we cannot accept returns for a change of mind.</p><h2>Fit</h2><p>If a piece made in a standard size does not fit, message us within 3 days of delivery and we will alter it.</p><h2>Faults</h2><p>If your piece arrives damaged or not as ordered, message us within 3 days with photos and we will repair, remake or refund it.</p>',
    ar:'<p>[مسودة بانتظار تأكيد NMH.]</p><p>لأن كل قطعة تُفصَّل لكِ وفق المقاس والطول الذي اخترتِه، لا نقبل الاسترجاع في حال تغيير الرأي.</p><h2>المقاس</h2><p>إذا كانت القطعة بمقاس قياسي ولم تناسبك، تواصلي معنا خلال ٣ أيام من الاستلام وسنعدّلها لكِ.</p><h2>العيوب</h2><p>إذا وصلتك القطعة بعيب أو بخلاف ما طلبتِ، أرسلي لنا صورًا خلال ٣ أيام وسنصلحها أو نعيد تفصيلها أو نعيد لكِ المبلغ.</p>'}},
  privacy:{t:{en:'Privacy policy',ar:'سياسة الخصوصية'}, b:{
    en:'<p>[Draft for NMH to confirm.]</p><h2>What we collect</h2><p>When you order: your name, email, phone number, delivery address and, for custom pieces, your measurements. When you subscribe: your email.</p><h2>Why</h2><p>To make and deliver your order, contact you about it, and, if you agree, send news about new collections.</p><h2>Where it is kept</h2><p>Orders are stored securely with Google Firebase. We never sell your details. Card payments are handled by our payment provider; we never see your card number.</p><h2>Your choices</h2><p>To see, change or delete your details, or to unsubscribe, message us on Instagram @_bynmh.</p>',
    ar:'<p>[مسودة بانتظار تأكيد NMH.]</p><h2>ما الذي نجمعه</h2><p>عند الطلب: اسمك وبريدك الإلكتروني ورقم هاتفك وعنوان التوصيل، ومقاساتك إن كانت القطعة تفصيلًا. وعند الاشتراك: بريدك الإلكتروني.</p><h2>لماذا</h2><p>لتفصيل طلبك وتوصيله والتواصل معك بشأنه، وإن وافقتِ، لنرسل لكِ آخر المجموعات.</p><h2>أين تُحفظ</h2><p>تُحفظ الطلبات بأمان في Google Firebase. لا نبيع بياناتك أبدًا. يتم الدفع بالبطاقة عبر شركة الدفع، ولا نطّلع على رقم بطاقتك.</p><h2>خياراتك</h2><p>لعرض بياناتك أو تعديلها أو حذفها، أو لإلغاء الاشتراك، تواصلي معنا عبر إنستغرام ‎@_bynmh.</p>'}},
  terms:{t:{en:'Terms of service',ar:'الشروط والأحكام'}, b:{
    en:'<p>[Draft for NMH to confirm.]</p><p>Prices are in UAE dirhams and include VAT. An order is accepted once we confirm the fabric and fit with you. Colours on screen can differ slightly from the real fabric; the fabric photo we send before cutting is the reference.</p>',
    ar:'<p>[مسودة بانتظار تأكيد NMH.]</p><p>الأسعار بالدرهم الإماراتي وشاملة الضريبة. يُعتمد الطلب بعد الاتفاق معك على القماش والمقاس. قد تختلف الألوان على الشاشة قليلًا عن القماش الفعلي، وصورة القماش التي نرسلها قبل التفصيل هي المرجع.</p>'}}
};
function pageTitle(id){ var x = PAGEX[id], v = x && x.t && (L === 'ar' ? x.t.ar : x.t.en); return v || t(PAGES[id].t); }
/* simple text from the control room: blank line = new paragraph, "## " = heading, "- " = bullet */
function richText(s){
  return String(s).replace(/\r/g, '').split(/\n{2,}/).map(function(block){
    block = block.trim(); if(!block) return '';
    if(/^## /.test(block)) return '<h2>' + esc(block.slice(3)) + '</h2>';
    var lines = block.split('\n');
    if(lines.every(function(l){ return /^- /.test(l); })) return '<ul>' + lines.map(function(l){ return '<li>' + esc(l.slice(2)) + '</li>'; }).join('') + '</ul>';
    return '<p>' + lines.map(esc).join('<br>') + '</p>';
  }).join('');
}
function viewPage(id){
  var pg = PAGES[id]; if(!pg){ location.hash = ''; return; }
  var x = PAGEX[id] || {}, xb = x.b && (L === 'ar' ? x.b.ar : x.b.en);
  var body = xb ? richText(xb) + (id === 'size' ? sizeChartHTML().replace('<h2 class="u-h6" id="mdlT">' + tr('Size chart', 'جدول المقاسات') + '</h2>', '') : '') : id === 'size' ? sizeChartHTML().replace('<h2 class="u-h6" id="mdlT">' + tr('Size chart', 'جدول المقاسات') + '</h2>', '') : t(pg.b);
  app.innerHTML = '<header class="ph-head wrap"><h1 class="u-h1">' + esc(pageTitle(id)) + '</h1></header><div class="page">' + body + '</div>';
}

/* ================= router ================= */
function resolve(h){
  if(!h || h === 'top') return viewHome;
  if(h === 'the-one') return viewOne;
  if(col(h)) return function(){ viewCollection(h); };
  var m;
  if((m = /^s-(\w+)$/.exec(h)) && STYLE_INFO[m[1]]) return function(){ viewStyle(m[1]); };
  if((m = /^p-(\w+)$/.exec(h))) return function(){ viewProduct(m[1]); };
  if(h === 'checkout') return viewCheckout;
  if((m = /^order-([\w-]+)$/.exec(h))) return function(){ viewOrder(m[1]); };
  if((m = /^page-(\w+)$/.exec(h))) return function(){ viewPage(m[1]); };
  if(h === 'cart') return function(){ viewHome(); setTimeout(openDrawer, 50); };
  return null;
}
var READY = false;
function route(){
  var h = decodeURIComponent(location.hash.slice(1));
  if(/^account/.test(h)){ history.replaceState(null, '', location.pathname); h = ''; }
  var fn = resolve(h);
  if(!fn){ history.replaceState(null, '', location.pathname); h = ''; fn = viewHome; }
  var same = h === curKey && h !== 'colour';
  curKey = h;
  setMega(false); closeSide(); closeSearch(); closeModal(); closeDrawer(); closePanel($('lb'));
  if(!/^p-/.test(h)) PP = null;
  document.body.classList.toggle('is-co', h === 'checkout' && CART.length > 0 || /^order-/.test(h) && ORDERS.some(function(o){ return 'order-' + o.id === h; }));
  if(!/^s-|^bloom$|^desert$|^drape$|^essentials$/.test(h)) SORT = 'featured';
  var go = function(){ fn(); afterRender(); };
  if(READY && !same && document.startViewTransition && !reduce) document.startViewTransition(go); else go();
  if(!same && h !== 'colour') window.scrollTo(0, 0);
  headerState();
  document.title = titleFor(h);
}
function titleFor(h){
  var base = 'NMH Dubai';
  if(!h) return base + ' | ' + tr('Modest dresses and abayas, made in Dubai', 'فساتين وعبايات محتشمة من دبي');
  if(col(h)) return t(col(h).name) + ' – ' + base;
  var m = /^p-(\w+)$/.exec(h); if(m && prod(m[1])) return t(prod(m[1]).name) + ' – ' + base;
  m = /^s-(\w+)$/.exec(h); if(m && STYLE_INFO[m[1]]) return t(STYLE_INFO[m[1]].title) + ' – ' + base;
  if(h === 'checkout') return tr('Checkout', 'إتمام الطلب') + ' – ' + base;
  m = /^page-(\w+)$/.exec(h); if(m && PAGES[m[1]]) return pageTitle(m[1]) + ' – ' + base;
  return base;
}
var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:.08}) : null;
function afterRender(){
  document.querySelectorAll('#app [data-rv]:not(.in)').forEach(function(el){ if(io && !reduce) io.observe(el); else el.classList.add('in'); });
}
function headerState(){ document.body.classList.toggle('home-top', !curKey && window.scrollY < 40); }

/* ================= language and theme ================= */
var staticNodes = document.querySelectorAll('[data-ar]');
staticNodes.forEach(function(n){ n.setAttribute('data-en', n.innerHTML); n.setAttribute('data-k', n.textContent.trim()); });
function applyLang(){
  var h = document.documentElement; h.lang = L; h.dir = L === 'ar' ? 'rtl' : 'ltr';
  staticNodes.forEach(function(n){ var o = n.id !== 'ann' && TX[n.getAttribute('data-k')], v = o && (L === 'ar' ? o.ar : o.en); n.innerHTML = v ? esc(v) : n.getAttribute(L === 'ar' ? 'data-ar' : 'data-en'); });
  document.querySelectorAll('[data-ph-ar]').forEach(function(n){ if(!n.dataset.phEn) n.dataset.phEn = n.placeholder; var o = TX[n.dataset.phEn], v = o && (L === 'ar' ? o.ar : o.en); n.placeholder = v || (L === 'ar' ? n.dataset.phAr : n.dataset.phEn); });
  ['lang', 'sideLang', 'ftLang'].forEach(function(id){ var b = $(id); b.textContent = L === 'ar' ? 'English' : 'عربي'; b.lang = L === 'ar' ? 'en' : 'ar'; });
  $('burger').setAttribute('aria-label', tr('Open menu', 'فتح القائمة'));
  $('searchIco').setAttribute('aria-label', tr('Search', 'بحث'));
  applyThemeLabel(); renderMenus(); updateCount();
}
function applyTheme(){ document.documentElement.classList.toggle('dark', DARK); var m = document.querySelector('meta[name=theme-color]'); if(m) m.content = DARK ? '#141312' : THEMES[TH]; applyThemeLabel(); }
function applyThemeLabel(){ ['sideTheme', 'ftTheme'].forEach(function(id){ $(id).textContent = DARK ? tr('Light mode', 'الوضع الفاتح') : tr('Dark mode', 'الوضع الداكن'); }); }
function rerender(){ var y = window.scrollY, fn = resolve(curKey || ''); if(!fn) return; fn(); afterRender(); headerState(); document.title = titleFor(curKey || ''); window.scrollTo(0, y); }
function toggleLang(){ L = L === 'ar' ? 'en' : 'ar'; try{ localStorage.setItem('nmh-lang', L); }catch(e){} applyLang(); rerender(); if(drwOpen()) renderDrawer(); }
function toggleTheme(){ DARK = !DARK; THEME_PREF = DARK ? 'dark' : 'light'; try{ localStorage.setItem('nmh-theme', THEME_PREF); }catch(e){} if(document.startViewTransition && !reduce) document.startViewTransition(applyTheme); else applyTheme(); }
function drwOpen(){ return $('drw').classList.contains('open'); }

/* ================= events ================= */
document.addEventListener('click', function(e){
  var a = e.target.closest('a,button,[data-close-drw],[data-close-side],[data-close-srch],[data-close-mdl]');
  if(!a) return;
  if(a.matches('[data-home]')){ e.preventDefault(); if(location.hash) location.hash = ''; else { route(); } history.replaceState(null, '', location.pathname); }
  if(a.matches('[data-close-drw]')) closeDrawer();
  if(a.matches('[data-close-side]')) closeSide();
  if(a.matches('[data-close-srch]')) closeSearch();
  if(a.matches('[data-close-mdl]')) closeModal();
  if(a.tagName === 'A' && a.getAttribute('href') === '#' + curKey && /^#/.test(a.getAttribute('href'))){ setMega(false); closeSearch(); }
  if(a.tagName === 'A' && a.getAttribute('href') === '#colour' && curKey === 'colour'){ e.preventDefault(); var c = $('colour'); if(c) c.scrollIntoView({behavior:reduce ? 'auto' : 'smooth'}); }
  var id = a.id;
  if(id === 'cartBtn' || id === 'cartIco'){ openDrawer(); return; }
  if(id === 'searchBtn' || id === 'searchIco'){ openSearch(); return; }
  if(id === 'sideSearch'){ closeSide(); setTimeout(openSearch, 300); return; }
  if(id === 'burger'){ openSide(); return; }
  if(id === 'megaBtn'){ setMega(!$('mega').classList.contains('open')); return; }
  if(id === 'lang' || id === 'sideLang' || id === 'ftLang'){ toggleLang(); return; }
  if(id === 'sideTheme' || id === 'ftTheme'){ toggleTheme(); return; }
  if(id === 'sizeChart'){ openModal(sizeChartHTML()); return; }
  if(id === 'coToggle'){ CO.sumOpen = !CO.sumOpen; a.setAttribute('aria-expanded', String(CO.sumOpen)); $('coSum').classList.toggle('open', CO.sumOpen); return; }
  var v;
  if((v = a.getAttribute('data-slide')) != null){ goSlide(+v); return; }
  if((v = a.getAttribute('data-slidestep')) != null){ goSlide(SL.i + (+v)); return; }
  if((v = a.getAttribute('data-st')) != null){ ST = +v; dyeTo('dyeSFlood', SHADES[ST].c); $('stSw').querySelectorAll('[data-st]').forEach(function(b){ b.setAttribute('aria-pressed', String(+b.getAttribute('data-st') === ST)); }); $('stName').textContent = t(SHADES[ST]); return; }
  if((v = a.getAttribute('data-sh')) != null && PP){ PP.shade = v === 'o' ? null : +v; paintPP(); return; }
  if((v = a.getAttribute('data-th')) != null && PP){ PP.img = +v; var fig = $('ppMedia').querySelectorAll('figure')[+v]; $('ppTh').querySelectorAll('button').forEach(function(b, i){ if(i === +v) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); if(fig) fig.scrollIntoView({behavior:reduce ? 'auto' : 'smooth', block:'start'}); return; }
  if((v = a.getAttribute('data-q')) != null && PP){ PP.qty = clamp(PP.qty + (+v), 1, 9); $('ppQty').textContent = PP.qty; return; }
  if((v = a.getAttribute('data-cq')) != null){ var it = CART[+v]; it.qty = clamp(it.qty + (+a.getAttribute('data-d')), 1, prod(it.code).one ? 1 : 9); saveCart(); renderDrawer(); var q = $('drw').querySelector('[data-cq="' + v + '"][data-d="' + a.getAttribute('data-d') + '"]'); if(q) q.focus(); return; }
  if((v = a.getAttribute('data-rm')) != null){ CART.splice(+v, 1); saveCart(); renderDrawer(); var f2 = $('drw').querySelector('[data-close-drw]'); if(f2) f2.focus(); return; }
  if((v = a.getAttribute('data-lb')) != null){ if(v === 'x'){ closePanel($('lb')); return; } LB.i = (LB.i + (+v) + LB.list.length) % LB.list.length; $('lbImg').src = LB.list[LB.i]; return; }
});
document.addEventListener('click', function(e){
  var fig = e.target.closest('[data-zoom]'); if(!fig || !PP || innerWidth < 1024) return;
  var p = prod(PP.code); if(ppDyed(p, +fig.getAttribute('data-zoom'))) return;
  openLB(p.imgs, +fig.getAttribute('data-zoom'));
});
document.addEventListener('submit', function(e){
  var f = e.target;
  if(f.id === 'buy'){ e.preventDefault(); addToCart(); }
  if(f.id === 'coForm'){ e.preventDefault(); placeOrder(f); }
  if(f.id === 'srchForm'){ e.preventDefault(); runSearch($('srchIn').value); }
  if(f.id === 'discForm'){ e.preventDefault(); var inp = $('f-disc'), fl2 = inp.closest('.fl'); if(!inp.value.trim()) return; fl2.classList.add('bad'); fl2.querySelector('.err').textContent = tr('Enter a valid discount code', 'يرجى إدخال رمز خصم صحيح'); }
  if(f.id === 'newsForm'){ e.preventDefault(); var em = $('newsIn').value.trim(); if(!EMAIL_RE.test(em)){ $('newsOk').style.color = 'var(--err)'; $('newsOk').textContent = tr('Enter a valid email.', 'يرجى إدخال بريد إلكتروني صحيح.'); $('newsIn').focus(); return; } subscribe(em, 'footer'); $('newsOk').style.color = ''; $('newsOk').textContent = tr('Thanks for subscribing.', 'شكرًا لاشتراكك.'); $('newsIn').value = ''; }
});
document.addEventListener('change', function(e){
  var el = e.target;
  if(el.matches('[data-sort]')){ SORT = el.value; rerender(); var sel = document.querySelector('[data-sort]'); if(sel) sel.focus(); return; }
  if(el.id === 'ppSize' && PP){ PP.size = el.value; $('ppSizeE').hidden = true; return; }
  if(el.id === 'ppLen' && PP){ PP.len = el.value; $('ppLenE').hidden = true; return; }
  if(el.id === 'stPick'){ ST = 0; dyeTo('dyeSFlood', el.value); $('stSw').querySelectorAll('[data-st]').forEach(function(b){ b.setAttribute('aria-pressed', 'false'); }); $('stName').textContent = el.value.toUpperCase(); return; }
  if(el.id === 'ppPick' && PP){ PP.shade = -1; PP.custom = el.value; paintPP(); return; }
  var f = el.form;
  if(f && f.id === 'coForm'){
    if(el.name === 'country'){ CO.country = el.value; $('regionBox').innerHTML = regionField(el.value, ''); }
    if(el.name === 'pay') CO.pay = el.value;
    if(el.name === 'bill'){ CO.bill = el.value; $('billBox').hidden = CO.bill !== 'diff'; }
    if(el.closest('.fl')){ el.closest('.fl').classList.add('up'); if(el.tagName === 'SELECT') checkField(el); }
    coTotals();
  }
});
document.addEventListener('input', function(e){
  var el = e.target;
  if(el.id === 'stPick'){ dyeTo('dyeSFlood', el.value, true); $('stName').textContent = el.value.toUpperCase(); return; }
  if(el.id === 'ppPick' && PP){ PP.shade = -1; PP.custom = el.value; paintPP(); return; }
  if(el.id === 'srchIn'){ clearTimeout(runSearch.t); runSearch.t = setTimeout(function(){ runSearch(el.value); }, 160); return; }
  if(el.id === 'f-disc'){ $('discBtn').classList.toggle('ready', !!el.value.trim()); el.closest('.fl').classList.remove('bad'); return; }
  var fl2 = el.closest('.fl'); if(fl2){ fl2.classList.toggle('up', !!el.value); if(fl2.classList.contains('bad')) checkField(el); }
});
document.addEventListener('focusout', function(e){ var el = e.target; if(el.closest && el.closest('#coForm .fl') && el.value !== '') checkField(el); });
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape'){ if($('lb').classList.contains('open')) closePanel($('lb')); else if($('mdl').classList.contains('open')) closeModal(); else if(drwOpen()) closeDrawer(); else if($('srch').classList.contains('open')) closeSearch(); else if($('side').classList.contains('open')) closeSide(); else setMega(false); }
  if(e.key === 'Tab'){ ['lb', 'mdl', 'drw', 'srch', 'side'].some(function(id){ var el = $(id); if(el.classList.contains('open')){ trap(e, el); return true; } }); }
  if($('lb').classList.contains('open') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')){ var d = (e.key === 'ArrowRight') === (L !== 'ar') ? 1 : -1; LB.i = (LB.i + d + LB.list.length) % LB.list.length; $('lbImg').src = LB.list[LB.i]; }
});
var hd = $('hd'), megaT = null;
if(matchMedia('(hover:hover)').matches){
  $('megaBtn').addEventListener('mouseenter', function(){ clearTimeout(megaT); setMega(true); });
  $('mega').addEventListener('mouseenter', function(){ clearTimeout(megaT); });
  hd.addEventListener('mouseleave', function(){ megaT = setTimeout(function(){ setMega(false); }, 180); });
  hd.querySelectorAll('.nav a').forEach(function(a){ a.addEventListener('mouseenter', function(){ setMega(false); }); });
}
$('mega').addEventListener('click', function(e){ if(e.target.closest('a')) setMega(false); });
window.addEventListener('scroll', function(){ headerState(); }, {passive:true});
window.addEventListener('hashchange', route);
window.addEventListener('storage', function(e){ if(e.key === 'nmh-cart'){ CART = DB.get('cart', []); updateCount(); } });

/* boot */
applyTexts(DB.get('texts', {})); applyCats(DB.get('cats', {})); applyCols(DB.get('cols', {})); applyTheme(); applyLang(); applySite(DB.get('site', {})); route(); READY = true; fbInit();
})();
