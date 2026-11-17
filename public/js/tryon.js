/* NMH live try-on (beta).
   Everything runs on the visitor's own phone: the camera picture is never uploaded, stored or sent anywhere.
   Pose tracking: MediaPipe Pose (Apache-2.0), loaded from the jsDelivr CDN only when someone taps "Try it on". */
(function(){
  var MP = window.NMH_MP_BASE || 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/';
  var loading = null;
  function loadPose(){
    if(window.Pose) return Promise.resolve();
    if(loading) return loading;
    loading = new Promise(function(res, rej){ var s = document.createElement('script'); s.src = MP + 'pose.js'; s.crossOrigin = 'anonymous'; s.onload = res; s.onerror = function(){ loading = null; rej(new Error('pose-load')); }; document.head.appendChild(s); });
    return loading;
  }
  function makePose(complexity, seg){
    var p = new window.Pose({locateFile:function(f){ return MP + f; }});
    p.setOptions({modelComplexity:complexity, smoothLandmarks:true, enableSegmentation:!!seg, smoothSegmentation:false, minDetectionConfidence:.5, minTrackingConfidence:.5, selfieMode:false});
    return p;
  }
  function loadImg(src){ return new Promise(function(res, rej){ var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function(){ res(i); }; i.onerror = rej; i.src = src; }); }

  /* ---------- geometry: pin the garment to the body in two bands (shoulders→hips, hips→hem) ---------- */
  function mid(a, b){ return {x:(a.x + b.x) / 2, y:(a.y + b.y) / 2}; }
  function len(v){ return Math.sqrt(v.x * v.x + v.y * v.y) || 1; }
  function vis(p){ return p && (p.visibility == null || p.visibility > .5) && p.x > -.05 && p.x < 1.05 && p.y > -.05 && p.y < 1.05; }
  function body(lm, W, H){
    if(!lm) return null;
    var P = function(i){ return {x:lm[i].x * W, y:lm[i].y * H, ok:vis(lm[i])}; };
    var l = P(11), r = P(12);
    if(!l.ok || !r.ok) return null;
    var lh = P(23), rh = P(24), la = P(27), ra = P(28);
    return {s:mid(l, r), sw:Math.abs(l.x - r.x) + Math.abs(l.y - r.y) * .3, sv:{x:l.x - r.x, y:l.y - r.y}, h:lh.ok && rh.ok ? mid(lh, rh) : null, k:la.ok && ra.ok ? mid(la, ra) : null};
  }
  function drawGarment(ctx, img, a, b){
    var gw = img.naturalWidth, gh = img.naturalHeight;
    var G = function(p){ return {x:p[0] * gw, y:p[1] * gh}; };
    var gs = G(a.s), gH = G(a.h), gk = G(a.k), gsw = a.sw * gw;
    var k = b.sw / gsw;
    // body axis: perpendicular to the shoulder line, pointing down
    var sl = len(b.sv), n = {x:b.sv.x / sl, y:b.sv.y / sl}; if(n.x < 0){ n.x = -n.x; n.y = -n.y; }
    var u = {x:-n.y, y:n.x}; if(u.y < 0){ u.x = -u.x; u.y = -u.y; }
    var hip = b.h, v1 = hip ? len({x:hip.x - b.s.x, y:hip.y - b.s.y}) / (gH.y - gs.y) : k;
    if(!hip || v1 < k * .55 || v1 > k * 1.9){ v1 = k; hip = {x:b.s.x + u.x * (gH.y - gs.y) * v1, y:b.s.y + u.y * (gH.y - gs.y) * v1}; }
    var u1 = {x:(hip.x - b.s.x), y:(hip.y - b.s.y)}, l1 = len(u1); u1 = {x:u1.x / l1, y:u1.y / l1};
    var band = function(P0, gc, gy0, uu, vv, y0, y1){
      var nn = {x:uu.y, y:-uu.x}; if(nn.x < 0){ nn.x = -nn.x; nn.y = -nn.y; }
      ctx.setTransform(k * nn.x, k * nn.y, vv * uu.x, vv * uu.y, P0.x - gc * k * nn.x - gy0 * vv * uu.x, P0.y - gc * k * nn.y - gy0 * vv * uu.y);
      ctx.drawImage(img, 0, y0, gw, y1 - y0, 0, y0, gw, y1 - y0);
    };
    // join the two bands a little below the hips (under the sleeve cuffs), and start the lower band exactly where the upper band ends
    var cutY = Math.min(gh - 1, gH.y + .09 * gh);
    var n1 = {x:u1.y, y:-u1.x}; if(n1.x < 0){ n1.x = -n1.x; n1.y = -n1.y; }
    var seam = {x:b.s.x + (gH.x - gs.x) * k * n1.x + (cutY - gs.y) * v1 * u1.x, y:b.s.y + (gH.x - gs.x) * k * n1.y + (cutY - gs.y) * v1 * u1.y};
    var v2 = v1, u2 = u1;
    if(b.k && gk.y > cutY + 10){ var d2 = {x:b.k.x - seam.x, y:b.k.y - seam.y}, l2 = len(d2), cand = l2 / (gk.y - cutY); if(cand > v1 * .6 && cand < v1 * 1.8 && d2.y > 0){ v2 = cand; u2 = {x:d2.x / l2, y:d2.y / l2}; } }
    ctx.save();
    band(b.s, gs.x, gs.y, u1, v1, 0, Math.min(gh, Math.round(cutY) + 2));
    band(seam, gH.x, cutY, u2, v2, Math.round(cutY), gh);
    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /* ---------- the live overlay ---------- */
  var T = {
    en:{title:'Try it on, live', priv:'Your camera runs only on your phone. No photo or video is uploaded, saved or seen by anyone.', start:'Start the camera', how:'Lean your phone against something, step back about two steps and stand facing it, so your shoulders and hips are in view.', load:'Getting ready…', step:'Step back a little so your shoulders and hips are in view.', save:'Save photo', flip:'Switch camera', close:'Close', beta:'Preview. The real piece is cut to your size, so fit and fall will look better than this preview.', nocam:'We could not open the camera. Allow camera access for this site in your browser settings, then try again.', fail:'This preview could not start on this device. Please try another browser.'},
    ar:{title:'جرّبيها لايف', priv:'الكاميرا تعمل على هاتفكِ فقط. لا تُرفع أي صورة أو فيديو ولا تُحفظ، ولا يراها أحد.', start:'تشغيل الكاميرا', how:'أسندي هاتفكِ على شيء ثابت، وابتعدي خطوتين وقفي مقابله حتى يظهر كتفاكِ وخصركِ.', load:'جارٍ التجهيز…', step:'ابتعدي قليلًا حتى يظهر كتفاكِ وخصركِ.', save:'حفظ الصورة', flip:'تبديل الكاميرا', close:'إغلاق', beta:'معاينة تقريبية. القطعة الحقيقية تُفصَّل على مقاسكِ، فيكون شكلها وانسدالها أجمل من هذه المعاينة.', nocam:'تعذّر فتح الكاميرا. اسمحي للموقع باستخدام الكاميرا من إعدادات المتصفح ثم حاولي مجددًا.', fail:'تعذّر تشغيل المعاينة على هذا الجهاز. جرّبي متصفحًا آخر.'}
  };
  var css = '.nmhT{position:fixed;inset:0;z-index:400;background:#0d0d0d;color:#fff;display:flex;flex-direction:column;font-family:inherit}' +
    '.nmhT-top{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;gap:10px}.nmhT-top b{font-weight:500;letter-spacing:.14em;text-transform:uppercase;font-size:12px}[dir=rtl] .nmhT-top b{letter-spacing:0;font-size:14px}' +
    '.nmhT button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}.nmhT-x{width:40px;height:40px;display:grid;place-items:center}.nmhT-x svg{width:18px;height:18px}' +
    '.nmhT-stage{position:relative;flex:1;min-height:0;display:grid;place-items:center;overflow:hidden}.nmhT-stage canvas{max-width:100%;max-height:100%;display:block}' +
    '.nmhT-intro{max-width:420px;padding:24px;text-align:center;display:grid;gap:16px;justify-items:center}.nmhT-intro p{margin:0;line-height:1.6;color:#ddd;font-size:15px}.nmhT-lock{display:flex;gap:10px;align-items:flex-start;text-align:start;background:#1b1b1b;border:1px solid #333;padding:14px;border-radius:4px;font-size:14px}.nmhT-lock svg{flex:none;width:20px;height:20px;margin-top:2px}' +
    '.nmhT-go{background:#fff!important;color:#111!important;padding:14px 28px;letter-spacing:.14em;text-transform:uppercase;font-size:12px!important;font-weight:500}[dir=rtl] .nmhT-go{letter-spacing:0;font-size:15px!important}' +
    '.nmhT-hint{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:rgba(0,0,0,.65);padding:10px 14px;border-radius:4px;font-size:14px;max-width:90%;text-align:center}' +
    '.nmhT-bar{display:flex;justify-content:center;gap:12px;padding:12px 16px 18px;flex-wrap:wrap}.nmhT-bar button{border:1px solid #555;padding:11px 18px;font-size:13px;border-radius:2px}.nmhT-note{margin:0;padding:0 16px 14px;text-align:center;color:#999;font-size:12px;line-height:1.5}' +
    '.nmhT-garm{display:flex;gap:8px;justify-content:center;padding:0 16px 10px}.nmhT-garm button{width:46px;height:62px;border:1px solid #444;border-radius:3px;background:#1b1b1b center/contain no-repeat}.nmhT-garm button[aria-pressed=true]{border-color:#fff}';
  var cur = null;
  function close(){
    if(!cur) return;
    cur.stop = true; if(cur.stream) cur.stream.getTracks().forEach(function(t){ t.stop(); });
    if(cur.pose){ try{ cur.pose.close(); }catch(e){} }
    cur.el.remove(); document.documentElement.style.overflow = cur.ov; cur = null;
  }
  function open(o){
    close();
    var L = o.L === 'ar' ? 'ar' : 'en', t = T[L];
    if(!document.getElementById('nmhTcss')){ var st = document.createElement('style'); st.id = 'nmhTcss'; st.textContent = css; document.head.appendChild(st); }
    var el = document.createElement('div'); el.className = 'nmhT'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', t.title); el.dir = L === 'ar' ? 'rtl' : 'ltr';
    el.innerHTML = '<div class="nmhT-top"><b>' + t.title + (o.name ? ' · ' + o.name : '') + '</b><button class="nmhT-x" type="button" aria-label="' + t.close + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M1 1l14 14M15 1L1 15"/></svg></button></div>' +
      '<div class="nmhT-stage"><div class="nmhT-intro"><div class="nmhT-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg><span>' + t.priv + '</span></div><p>' + t.how + '</p><button class="nmhT-go" type="button">' + t.start + '</button></div></div>' +
      '<div class="nmhT-foot" hidden></div>';
    document.body.appendChild(el);
    cur = {el:el, ov:document.documentElement.style.overflow, facing:'user', stop:false, items:o.items || [o], idx:0};
    document.documentElement.style.overflow = 'hidden';
    el.querySelector('.nmhT-x').onclick = close;
    el.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
    el.querySelector('.nmhT-go').onclick = function(){ start(t); };
    el.querySelector('.nmhT-go').focus();
  }
  function start(t){
    var c = cur, stage = c.el.querySelector('.nmhT-stage');
    stage.innerHTML = '<p class="nmhT-hint" style="position:static;transform:none">' + t.load + '</p>';
    Promise.all([loadPose(), Promise.all(c.items.map(function(it){ return loadImg(it.img); }))]).then(function(r){
      if(c.stop) return;
      c.imgs = r[1];
      return camera(c).then(function(){ run(c, t); });
    }).catch(function(e){
      if(c.stop) return;
      stage.innerHTML = '<div class="nmhT-intro"><p>' + (e && (e.name === 'NotAllowedError' || e.name === 'NotFoundError' || e.name === 'SecurityError') ? t.nocam : t.fail) + '</p></div>';
      console.warn('NMH try-on:', e);
    });
  }
  function camera(c){
    if(c.stream) c.stream.getTracks().forEach(function(tr){ tr.stop(); });
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject({name:'NotFoundError'});
    return navigator.mediaDevices.getUserMedia({audio:false, video:{facingMode:c.facing, width:{ideal:720}, height:{ideal:1280}}}).then(function(s){
      c.stream = s;
      if(!c.video){ c.video = document.createElement('video'); c.video.setAttribute('playsinline', ''); c.video.muted = true; }
      c.video.srcObject = s;
      return c.video.play();
    });
  }
  function run(c, t){
    var stage = c.el.querySelector('.nmhT-stage');
    var cv = document.createElement('canvas'), ctx = cv.getContext('2d'), hint = document.createElement('p');
    hint.className = 'nmhT-hint'; hint.textContent = t.step; hint.hidden = true;
    stage.innerHTML = ''; stage.appendChild(cv); stage.appendChild(hint);
    var foot = c.el.querySelector('.nmhT-foot'); foot.hidden = false;
    foot.innerHTML = (c.items.length > 1 ? '<div class="nmhT-garm">' + c.items.map(function(it, i){ return '<button type="button" data-g="' + i + '" aria-pressed="' + (i === c.idx) + '" aria-label="' + (it.name || '') + '" style="background-image:url(' + it.img + ')"></button>'; }).join('') + '</div>' : '') +
      '<div class="nmhT-bar"><button type="button" data-a="save">' + t.save + '</button><button type="button" data-a="flip">' + t.flip + '</button></div><p class="nmhT-note">' + t.beta + '</p>';
    foot.onclick = function(e){
      var b = e.target.closest('button'); if(!b) return;
      if(b.hasAttribute('data-g')){ c.idx = +b.getAttribute('data-g'); foot.querySelectorAll('[data-g]').forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); return; }
      if(b.getAttribute('data-a') === 'flip'){ c.facing = c.facing === 'user' ? 'environment' : 'user'; camera(c).catch(function(){}); return; }
      if(b.getAttribute('data-a') === 'save'){ cv.toBlob(function(bl){ var a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = 'NMH-try-on.jpg'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000); }, 'image/jpeg', .92); }
    };
    c.pose = makePose(0, false);
    c.pose.onResults(function(res){
      if(c.stop) return;
      var v = c.video, W = v.videoWidth, H = v.videoHeight; if(!W) return;
      if(cv.width !== W){ cv.width = W; cv.height = H; }
      var mirror = c.facing === 'user';
      ctx.save(); if(mirror){ ctx.translate(W, 0); ctx.scale(-1, 1); } ctx.drawImage(v, 0, 0, W, H); ctx.restore();
      var lm = res.poseLandmarks;
      if(lm && mirror) lm = lm.map(function(p){ return {x:1 - p.x, y:p.y, visibility:p.visibility}; });
      var b = body(lm, W, H);
      hint.hidden = !!(b && b.h);
      if(b){ var it = c.items[c.idx]; drawGarment(ctx, c.imgs[c.idx], it.a, b); }
    });
    var busy = false;
    var loop = function(){
      if(c.stop) return;
      if(!busy && c.video.readyState >= 2){ busy = true; c.pose.send({image:c.video}).then(function(){ busy = false; }, function(){ busy = false; }); }
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- control room helper: anchors (and an automatic cut-out) from a product photo ---------- */
  function fromPhoto(src){
    return Promise.all([loadPose(), loadImg(src)]).then(function(r){
      var img = r[1], pose = makePose(1, true);
      return pose.initialize().then(function(){ return new Promise(function(res, rej){
        pose.onResults(function(out){
          var lm = out.poseLandmarks; if(!lm){ pose.close(); return rej(new Error('No person found in this photo. Choose a front photo where the whole piece is visible.')); }
          var W = img.naturalWidth, H = img.naturalHeight, b = body(lm, 1, 1);
          if(!b || !b.h) { pose.close(); return rej(new Error('The shoulders and hips must be visible. Choose a straight front photo.')); }
          var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var x = cv.getContext('2d');
          x.drawImage(out.segmentationMask, 0, 0, W, H);
          var m = x.getImageData(0, 0, W, H); x.clearRect(0, 0, W, H); x.drawImage(img, 0, 0);
          var px = x.getImageData(0, 0, W, H), top = Math.round((b.s.y - .015) * H), bot = b.k ? Math.round((b.k.y + .03) * H) : H;
          for(var y = 0; y < H; y++) for(var xx = 0; xx < W; xx++){ var i = (y * W + xx) * 4; var a = m.data[i]; if(y < top || y > bot) a = 0; px.data[i + 3] = a > 170 ? 255 : 0; }
          x.putImageData(px, 0, 0);
          // crop to the garment
          var minX = W, minY = H, maxX = 0, maxY = 0;
          for(y = 0; y < H; y += 2) for(xx = 0; xx < W; xx += 2){ if(px.data[(y * W + xx) * 4 + 3]){ if(xx < minX) minX = xx; if(xx > maxX) maxX = xx; if(y < minY) minY = y; if(y > maxY) maxY = y; } }
          var cw = maxX - minX + 1, ch = maxY - minY + 1, out2 = document.createElement('canvas'); out2.width = cw; out2.height = ch; out2.getContext('2d').drawImage(cv, minX, minY, cw, ch, 0, 0, cw, ch);
          var P = function(p){ return [+((p.x * W - minX) / cw).toFixed(4), +((p.y * H - minY) / ch).toFixed(4)]; };
          var lmS = lm; var ls = lmS[11], rs = lmS[12];
          var a = {s:P(b.s), h:P(b.h), k:b.k ? P(b.k) : [P(b.h)[0], 1], sw:+(Math.abs(ls.x - rs.x) * W / cw).toFixed(4)};
          // anchors relative to the original photo too, for a cut-out made elsewhere with the same framing
          var aPhoto = {s:[b.s.x, b.s.y], h:[b.h.x, b.h.y], k:b.k ? [b.k.x, b.k.y] : [b.h.x, 1], sw:Math.abs(ls.x - rs.x)};
          pose.close(); res({canvas:out2, a:a, aPhoto:aPhoto, crop:{x:minX / W, y:minY / H, w:cw / W, h:ch / H}});
        });
        pose.send({image:img}).catch(rej);
      }); });
    });
  }
  window.NMHTry = {open:open, close:close, fromPhoto:fromPhoto};
})();
