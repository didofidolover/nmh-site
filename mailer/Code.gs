/**
 * NMH Dubai, order emails.
 * The website sends only the order number. This script reads the order from Firestore (so nobody can
 * use it to send arbitrary mail), emails the customer a confirmation, emails the brand a new-order alert,
 * and remembers which orders were already emailed so nothing is sent twice.
 * Runs free on the Google account that owns it (consumer Gmail: about 100 emails a day).
 */
var CFG = {
  project: 'nmh-dubai',
  site: 'https://nmh-dubai.web.app',
  brandTo: 'wedoogfx@gmail.com',          // who gets the new-order alert
  replyTo: 'wedoogfx@gmail.com',          // where customers' replies go
  fromName: 'NMH Dubai',
  instagram: 'https://www.instagram.com/_bynmh/'
};

function doPost(e){
  var id = '';
  try{ id = String(JSON.parse(e.postData.contents || '{}').id || ''); }catch(err){}
  if(!/^NMH-[A-Z0-9]{5,12}$/.test(id)) return out({ok:false, error:'bad id'});
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    var props = PropertiesService.getScriptProperties();
    if(props.getProperty('sent_' + id)) return out({ok:true, already:true});
    var o = null;
    for(var i = 0; i < 4 && !o; i++){ o = readOrder(id); if(!o) Utilities.sleep(2500); }
    if(!o) return out({ok:false, error:'not found'});
    if(Date.now() - (o.created || 0) > 1000 * 60 * 60 * 24 * 2) return out({ok:false, error:'too old'});
    sendOrderEmails(o);
    props.setProperty('sent_' + id, String(Date.now()));
    return out({ok:true});
  } finally { lock.releaseLock(); }
}
function doGet(){ return out({ok:true, service:'NMH order emails'}); }
function out(obj){ return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

function sendOrderEmails(o){
  var ar = o.lang === 'ar';
  MailApp.sendEmail({
    to: o.contact.email,
    subject: ar ? 'استلمنا طلبك' + o.id + ' | NMH Dubai' : 'We received your order ' + o.id + ' | NMH Dubai',
    htmlBody: customerHtml(o),
    name: CFG.fromName,
    replyTo: CFG.replyTo
  });
  MailApp.sendEmail({
    to: CFG.brandTo,
    subject: 'New order ' + o.id + ' · ' + o.contact.name + ' · ' + o.total + ' AED',
    htmlBody: brandHtml(o),
    name: 'NMH website',
    replyTo: o.contact.email
  });
}

/* ---------- Firestore ---------- */
function readOrder(id){
  var url = 'https://firestore.googleapis.com/v1/projects/' + CFG.project + '/databases/(default)/documents/orders/' + encodeURIComponent(id);
  var r = UrlFetchApp.fetch(url, {headers:{Authorization:'Bearer ' + ScriptApp.getOAuthToken(), 'x-goog-user-project':CFG.project}, muteHttpExceptions:true});
  if(r.getResponseCode() !== 200) return null;
  return fsVal({mapValue:{fields:JSON.parse(r.getContentText()).fields || {}}});
}
function fsVal(v){
  if(v == null) return null;
  if('stringValue' in v) return v.stringValue;
  if('integerValue' in v) return Number(v.integerValue);
  if('doubleValue' in v) return v.doubleValue;
  if('booleanValue' in v) return v.booleanValue;
  if('nullValue' in v) return null;
  if('timestampValue' in v) return v.timestampValue;
  if('arrayValue' in v) return (v.arrayValue.values || []).map(fsVal);
  if('mapValue' in v){ var o = {}, f = v.mapValue.fields || {}; for(var k in f) o[k] = fsVal(f[k]); return o; }
  return null;
}

/* ---------- helpers ---------- */
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function money(n, ar){ n = Math.round(Number(n) * 100) / 100; var s = n.toLocaleString ? Number(n).toFixed(n % 1 ? 2 : 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : n; return ar ? s + ' د.إ' : s + ' AED'; }
var COUNTRY = {AE:['United Arab Emirates','الإمارات'], SA:['Saudi Arabia','السعودية'], KW:['Kuwait','الكويت'], QA:['Qatar','قطر'], BH:['Bahrain','البحرين'], OM:['Oman','عُمان'], EG:['Egypt','مصر'], GB:['United Kingdom','المملكة المتحدة'], US:['United States','الولايات المتحدة'], XX:['Other country','دولة أخرى']};
function imgUrl(src){ return /^https?:/.test(src || '') ? src : CFG.site + '/' + String(src || 'img/og.jpg').replace(/^\//, ''); }

/* ---------- customer email ---------- */
function customerHtml(o){
  var ar = o.lang === 'ar', dir = ar ? 'rtl' : 'ltr', al = ar ? 'right' : 'left', ar2 = ar ? 'left' : 'right';
  var T = function(en, a){ return ar ? a : en; };
  var font = ar ? "Tahoma,'IBM Plex Sans Arabic',Arial,sans-serif" : "'Montserrat',Helvetica,Arial,sans-serif";
  var body = ar ? "Tahoma,Arial,sans-serif" : "'Nunito Sans',Helvetica,Arial,sans-serif";
  var cap = 'font-family:' + font + ';font-size:11px;letter-spacing:' + (ar ? '0' : '2.2px') + ';text-transform:uppercase;color:#6A6A6A;';
  var c = COUNTRY[o.address.country] || COUNTRY.XX;
  var first = o.contact.first || String(o.contact.name || '').split(' ')[0];
  var items = (o.items || []).map(function(it){
    return '<tr>' +
      '<td width="76" style="padding:16px 0;border-bottom:1px solid #E7E2DB;vertical-align:top"><img src="' + esc(imgUrl(it.img)) + '" width="64" height="96" alt="" style="display:block;width:64px;height:96px;object-fit:' + (/\.webp$/.test(it.img || '') ? 'contain' : 'cover') + ';background:' + esc(it.tone || '#F5F0EA') + '"></td>' +
      '<td style="padding:16px 12px;border-bottom:1px solid #E7E2DB;vertical-align:top;text-align:' + al + '">' +
        (it.no ? '<div style="' + cap + 'color:#1C1B1B;margin-bottom:4px">N° ' + esc(it.no) + ' · ' + T('One of one', 'قطعة واحدة') + '</div>' : '') +
        '<div style="font-family:' + font + ';font-size:12px;letter-spacing:' + (ar ? '0' : '2px') + ';text-transform:uppercase;color:#1C1B1B;font-weight:600">' + esc(ar ? (it.name_ar || it.name) : it.name) + '</div>' +
        '<div style="font-family:' + body + ';font-size:13px;color:#6A6A6A;margin-top:6px">' + (it.hex ? '<span style="display:inline-block;width:9px;height:9px;border-radius:9px;background:' + esc(it.hex) + ';margin-' + (ar ? 'left' : 'right') + ':6px"></span>' : '') + esc(it.variant || '') + '</div>' +
        '<div style="font-family:' + body + ';font-size:13px;color:#6A6A6A;margin-top:2px">' + T('Qty ', 'الكمية ') + esc(it.qty) + '</div></td>' +
      '<td style="padding:16px 0;border-bottom:1px solid #E7E2DB;vertical-align:top;text-align:' + ar2 + ';font-family:' + body + ';font-size:14px;color:#1C1B1B;white-space:nowrap">' + money(it.price * it.qty, ar) + '</td></tr>';
  }).join('');
  var row = function(k, v, strong){ return '<tr><td style="padding:5px 0;font-family:' + body + ';font-size:' + (strong ? '16px' : '14px') + ';color:#1C1B1B;' + (strong ? 'font-weight:700;' : '') + 'text-align:' + al + '">' + k + '</td><td style="padding:5px 0;font-family:' + body + ';font-size:' + (strong ? '16px' : '14px') + ';color:#1C1B1B;' + (strong ? 'font-weight:700;' : '') + 'text-align:' + ar2 + '">' + v + '</td></tr>'; };
  var step = function(n, h, p){ return '<tr><td width="34" style="vertical-align:top;padding:0 0 16px"><div style="width:24px;height:24px;line-height:24px;border:1px solid #1C1B1B;border-radius:24px;text-align:center;font-family:' + font + ';font-size:11px;color:#1C1B1B">' + n + '</div></td><td style="vertical-align:top;padding:2px 0 16px;text-align:' + al + '"><div style="font-family:' + font + ';font-size:11px;letter-spacing:' + (ar ? '0' : '2px') + ';text-transform:uppercase;color:#1C1B1B;font-weight:600">' + h + '</div><div style="font-family:' + body + ';font-size:14px;line-height:1.6;color:#6A6A6A;margin-top:4px">' + p + '</div></td></tr>'; };
  return '<!doctype html><html lang="' + (ar ? 'ar' : 'en') + '" dir="' + dir + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>NMH Dubai</title></head>' +
  '<body style="margin:0;padding:0;background:#F5F0EA">' +
  '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' + esc(T('We have your order request. We will message you on WhatsApp to confirm the details.', 'استلمنا طلبك. سنتواصل معك عبر واتساب لتأكيد التفاصيل.')) + '</div>' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EA"><tr><td align="center" style="padding:32px 12px">' +
  '<table role="presentation" width="600" cellpadding="0" cellspacing="0" dir="' + dir + '" style="width:100%;max-width:600px;background:#FDF9F4">' +
    '<tr><td style="background:#1C1B1B;padding:10px;text-align:center;font-family:' + font + ';font-size:10px;letter-spacing:' + (ar ? '0' : '2.5px') + ';text-transform:uppercase;color:#FDF9F4">' + T('Made to order in Dubai', 'يُفصَّل حسب الطلب في دبي') + '</td></tr>' +
    '<tr><td align="center" style="padding:36px 32px 8px"><a href="' + CFG.site + '"><img src="' + CFG.site + '/img/logo-dark.png" width="84" alt="NMH Dubai" style="display:block;width:84px;height:auto;border:0"></a></td></tr>' +
    '<tr><td style="padding:28px 40px 8px;text-align:center"><div style="' + cap + '">' + T('Order ', 'طلب ') + '<span dir="ltr">' + esc(o.id) + '</span></div>' +
      '<h1 style="margin:14px 0 0;font-family:' + font + ';font-weight:500;font-size:22px;line-height:1.4;letter-spacing:' + (ar ? '0' : '4px') + ';text-transform:' + (ar ? 'none' : 'uppercase') + ';color:#1C1B1B">' + esc(T('Thank you, ', 'شكرًا لكِ،') + first) + '</h1>' +
      '<p style="margin:16px auto 0;max-width:440px;font-family:' + body + ';font-size:15px;line-height:1.7;color:#4A4848">' + T('We have received your order request. Nothing has been charged yet.', 'استلمنا طلبك. لم يُخصم أي مبلغ حتى الآن.') + '</p></td></tr>' +
    '<tr><td style="padding:28px 40px 4px"><div style="border-top:1px solid #E7E2DB;padding-top:26px;' + cap + 'color:#1C1B1B;text-align:' + al + '">' + T('What happens next', 'الخطوات التالية') + '</div></td></tr>' +
    '<tr><td style="padding:16px 40px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
      step(1, T('We confirm with you', 'نؤكد معك'), T('Within one working day we message you on WhatsApp at ', 'خلال يوم عمل نتواصل معك عبر واتساب على الرقم') + '<span dir="ltr">' + esc(o.contact.phone) + '</span>' + T(' to confirm the fabric and fit.', ' لتأكيد القماش والمقاس.')) +
      step(2, T('You see the real fabric', 'تشاهدين القماش الفعلي'), T('We send a photo of the fabric before anything is cut.', 'نرسل لكِ صورة القماش قبل أي تفصيل.')) +
      step(3, T('Cut in Dubai, then delivered', 'التفصيل في دبي والتوصيل'), o.pay === 'cod' ? T('You pay in cash or by card when your piece arrives.', 'تدفعين نقدًا أو بالبطاقة عند استلام القطعة.') : T('Once you approve, we send a secure card payment link, then start cutting.', 'بعد موافقتك نرسل لكِ رابط دفع آمنًا، ثم نبدأ التفصيل.')) +
    '</table></td></tr>' +
    '<tr><td style="padding:12px 40px 0"><div style="border-top:1px solid #E7E2DB;padding-top:26px;' + cap + 'color:#1C1B1B;text-align:' + al + '">' + T('Your order', 'طلبك') + '</div></td></tr>' +
    '<tr><td style="padding:4px 40px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' + items + '</table></td></tr>' +
    '<tr><td style="padding:16px 40px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
      row(T('Subtotal', 'المجموع الفرعي'), money(o.sub, ar)) +
      row(T('Shipping', 'الشحن') + ' · ' + (o.method === 'express' ? T('Express', 'سريع') : T('Standard', 'قياسي')), o.ship ? money(o.ship, ar) : T('Free', 'مجاني')) +
      row(T('Total', 'الإجمالي'), money(o.total, ar), true) +
    '</table><div style="font-family:' + body + ';font-size:12px;color:#6A6A6A;text-align:' + ar2 + ';margin-top:2px">' + T('Prices include VAT', 'الأسعار شاملة الضريبة') + '</div></td></tr>' +
    '<tr><td style="padding:22px 40px 8px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E7E2DB"><tr>' +
      '<td width="50%" style="vertical-align:top;padding:22px ' + (ar ? '0 0 12px' : '12px 0 0') + ';text-align:' + al + '"><div style="' + cap + 'color:#1C1B1B;margin-bottom:8px">' + T('Delivery to', 'الشحن إلى') + '</div><div style="font-family:' + body + ';font-size:14px;line-height:1.6;color:#4A4848">' + esc(o.contact.name) + '<br>' + esc(o.address.line) + (o.address.apt ? ', ' + esc(o.address.apt) : '') + '<br>' + esc(o.address.city) + (o.address.region ? ', ' + esc(o.address.region) : '') + '<br>' + esc(ar ? c[1] : c[0]) + '</div></td>' +
      '<td width="50%" style="vertical-align:top;padding:22px 0 0;text-align:' + al + '"><div style="' + cap + 'color:#1C1B1B;margin-bottom:8px">' + T('Payment', 'الدفع') + '</div><div style="font-family:' + body + ';font-size:14px;line-height:1.6;color:#4A4848">' + (o.pay === 'cod' ? T('Cash on delivery', 'الدفع عند الاستلام') : T('Card payment link, sent after we confirm', 'رابط دفع بالبطاقة بعد التأكيد')) + '</div></td>' +
    '</tr></table></td></tr>' +
    '<tr><td align="center" style="padding:30px 40px 40px"><a href="' + CFG.instagram + '" style="display:inline-block;background:#1C1B1B;color:#FFFFFF;text-decoration:none;font-family:' + font + ';font-size:12px;letter-spacing:' + (ar ? '0' : '2.4px') + ';text-transform:uppercase;padding:15px 30px">' + T('Message us on Instagram', 'تواصلي معنا عبر إنستغرام') + '</a>' +
      '<p style="margin:18px 0 0;font-family:' + body + ';font-size:13px;color:#6A6A6A">' + T('Questions? Just reply to this email.', 'لديكِ سؤال؟ ردّي على هذه الرسالة.') + '</p></td></tr>' +
    '<tr><td style="background:#FFFFFF;border-top:1px solid #E7E2DB;padding:24px 40px;text-align:center;font-family:' + body + ';font-size:12px;line-height:1.7;color:#6A6A6A">' +
      '<a href="' + CFG.site + '" style="color:#1C1B1B;text-decoration:none;' + cap + 'color:#1C1B1B">nmh-dubai.web.app</a><br>' + T('Modest dresses, made to order in Dubai.', 'فساتين وعبايات محتشمة، تُفصَّل حسب الطلب في دبي.') + '<br>' +
      '<a href="' + CFG.site + '/#page-refund" style="color:#6A6A6A">' + T('Refund policy', 'سياسة الاسترجاع') + '</a> · <a href="' + CFG.site + '/#page-privacy" style="color:#6A6A6A">' + T('Privacy policy', 'سياسة الخصوصية') + '</a></td></tr>' +
  '</table></td></tr></table></body></html>';
}

/* ---------- brand alert ---------- */
function brandHtml(o){
  var c = COUNTRY[o.address.country] || COUNTRY.XX;
  var td = 'style="padding:6px 10px;border-bottom:1px solid #eee;font:14px Arial,sans-serif;vertical-align:top"';
  var m = o.measure ? Object.keys(o.measure).filter(function(k){ return o.measure[k]; }).map(function(k){ return k + ': ' + o.measure[k] + ' cm'; }).join(', ') : '';
  var link = 'https://console.firebase.google.com/project/' + CFG.project + '/firestore/databases/-default-/data/~2Forders~2F' + encodeURIComponent(o.id);
  return '<div style="font:14px Arial,sans-serif;color:#1C1B1B;max-width:640px">' +
    '<h2 style="font:600 18px Arial,sans-serif;margin:0 0 4px">New order ' + esc(o.id) + '</h2>' +
    '<p style="margin:0 0 16px;color:#666">' + new Date(o.created).toString() + ' · site language: ' + (o.lang === 'ar' ? 'Arabic' : 'English') + '</p>' +
    '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">' +
      (o.items || []).map(function(it){ return '<tr><td ' + td + '><b>' + esc(it.code) + '</b> ' + esc(it.name) + (it.no ? ' (1 of 1, N° ' + esc(it.no) + ')' : '') + '<br><span style="color:#666">' + esc(it.variant) + (it.hex ? ' · ' + esc(it.hex) : '') + '</span></td><td ' + td + '>× ' + esc(it.qty) + '</td><td ' + td + ' align="right">' + money(it.price * it.qty) + '</td></tr>'; }).join('') +
      '<tr><td ' + td + ' colspan="2">Shipping (' + esc(o.method) + ')</td><td ' + td + ' align="right">' + money(o.ship) + '</td></tr>' +
      '<tr><td ' + td + ' colspan="2"><b>Total</b></td><td ' + td + ' align="right"><b>' + money(o.total) + '</b></td></tr>' +
    '</table>' +
    '<h3 style="font:600 15px Arial,sans-serif;margin:20px 0 6px">Customer</h3><p style="margin:0;line-height:1.6">' + esc(o.contact.name) + '<br>' + esc(o.contact.phone) + ' · <a href="https://wa.me/' + esc(String(o.contact.phone).replace(/\D/g, '')) + '">WhatsApp</a><br>' + esc(o.contact.email) + '</p>' +
    '<h3 style="font:600 15px Arial,sans-serif;margin:20px 0 6px">Delivery</h3><p style="margin:0;line-height:1.6">' + esc(o.address.line) + (o.address.apt ? ', ' + esc(o.address.apt) : '') + '<br>' + esc(o.address.city) + (o.address.region ? ', ' + esc(o.address.region) : '') + (o.address.zip ? ' ' + esc(o.address.zip) : '') + '<br>' + esc(c[0]) + '</p>' +
    '<h3 style="font:600 15px Arial,sans-serif;margin:20px 0 6px">Payment</h3><p style="margin:0">' + (o.pay === 'cod' ? 'Cash on delivery' : 'Send a card payment link after confirming') + '</p>' +
    (m ? '<h3 style="font:600 15px Arial,sans-serif;margin:20px 0 6px">Measurements</h3><p style="margin:0">' + esc(m) + '</p>' : '') +
    (o.note ? '<h3 style="font:600 15px Arial,sans-serif;margin:20px 0 6px">Note</h3><p style="margin:0">' + esc(o.note) + '</p>' : '') +
    '<p style="margin:24px 0 0"><a href="' + link + '">Open this order in Firebase</a></p></div>';
}

/* ---------- run this once from the editor to preview both emails in the brand inbox ---------- */
function sendTestToBrand(){
  var o = {id:'NMH-TEST01', created:Date.now(), lang:'en', method:'standard', pay:'link', sub:1110, ship:0, total:1110,
    contact:{name:'Sara Ali', first:'Sara', email:CFG.brandTo, phone:'+971 50 123 4567'},
    address:{country:'AE', region:'Dubai', city:'Jumeirah', line:'Building 4, Al Wasl Road', apt:'Apt 12'},
    items:[{code:'S02', name:'Olive Drape Gown', name_ar:'فستان أوليف درايب', img:'img/front-olive.webp', tone:'#E2E0D4', hex:'#24304F', variant:'Midnight / Medium / 58″', qty:1, price:590},
           {code:'B01', name:'Layla Pleated Maxi', name_ar:'فستان ليلى المكسّر', img:'img/bloom-1.jpg', variant:'As shown / Small / 56″', qty:1, price:520}]};
  MailApp.sendEmail({to:CFG.brandTo, subject:'[Test] Customer email preview', htmlBody:customerHtml(o), name:CFG.fromName});
  o.lang = 'ar';
  MailApp.sendEmail({to:CFG.brandTo, subject:'[Test] Customer email preview (Arabic)', htmlBody:customerHtml(o), name:CFG.fromName});
  MailApp.sendEmail({to:CFG.brandTo, subject:'[Test] New order alert preview', htmlBody:brandHtml(o), name:'NMH website'});
}
