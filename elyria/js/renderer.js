/* Rendu des plans : WebGL (ondulations de l'eau, transition présent / écho, étalonnage)
   avec repli Canvas 2D (fichier ouvert en local, WebGL indisponible). */
(function () {
  const VS = 'attribute vec2 p;varying vec2 vUv;void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  const FS = [
    'precision highp float;varying vec2 vUv;',
    'uniform sampler2D uA,uB;uniform vec4 uRA,uRB;uniform vec2 uRes;',
    'uniform float uMix,uHasB,uTime,uBlur,uFlash,uWarm,uCold,uExpo,uGrain,uVig,uRipple,uEdge;uniform vec2 uWaterA,uWaterB;uniform vec3 uFlashCol;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}',
    'vec2 rip(sampler2D t,vec2 uv,vec2 wb){if(uv.y<wb.x||uv.y>wb.y)return uv;',
    ' float k=smoothstep(wb.x,wb.x+.03,uv.y)*(1.-smoothstep(wb.y-.05,wb.y,uv.y))*uRipple;',
    ' vec3 c=texture2D(t,uv).rgb;float l=dot(c,vec3(.299,.587,.114));',
    ' k*=smoothstep(.16,.4,l)*smoothstep(-.06,.06,c.b-c.r*.85);',
    ' float w=sin(uv.y*240.-uTime*1.3+sin(uv.x*22.+uTime*.5)*1.2)+.5*sin(uv.y*130.+uTime*.9+uv.x*7.);',
    ' return uv+vec2(w*.00045,w*.00018)*k;}',
    'vec3 tx(sampler2D t,vec2 uv){return texture2D(t,clamp(uv,vec2(.0005),vec2(.9995))).rgb;}',
    'vec3 sb(sampler2D t,vec2 uv){if(uBlur<.0004)return tx(t,uv);vec3 c=tx(t,uv)*.2;',
    ' for(int i=0;i<8;i++){float a=float(i)*.785398;c+=tx(t,uv+vec2(cos(a),sin(a))*uBlur)*.1;}return c;}',
    'void main(){vec2 s=vec2(vUv.x,1.-vUv.y);',
    ' vec2 ua=rip(uA,uRA.xy+s*uRA.zw,uWaterA);vec3 col=sb(uA,ua);',
    ' if(uHasB>.5){vec2 ub=rip(uB,uRB.xy+s*uRB.zw,uWaterB);vec3 cb=sb(uB,ub);',
    '  float f=fbm(s*vec2(uRes.x/uRes.y,1.)*2.6+vec2(uTime*.03,-uTime*.02));',
    '  float th=uMix*1.3-.15;float r=smoothstep(f-.09,f+.09,th);',
    '  vec3 sup=mix(col,cb,.5);col=mix(col,cb,r);',
    '  float e=(1.-smoothstep(0.,.07,abs(th-f)))*step(.001,uMix)*step(uMix,.999);',
    '  col+=vec3(1.,.78,.42)*e*uEdge*(.6+.4*sin(uTime*3.+f*20.));',
    '  col=mix(col,sup,.25*sin(3.14159*clamp(uMix,0.,1.)));}',
    ' col+=max(col-.62,0.)*.45;',
    ' float l=dot(col,vec3(.299,.587,.114));',
    ' col=mix(col,col*vec3(1.14,.98,.74)+vec3(.05,.025,0.),uWarm);',
    ' col=mix(col,vec3(l)*vec3(.82,.86,1.08),uCold);',
    ' col*=uExpo;',
    ' vec2 q=(vUv-.5)*vec2(uRes.x/uRes.y,1.)/max(uRes.x/uRes.y,1.);',
    ' col*=mix(1.,smoothstep(.98,.28,length(q)*1.18),uVig);',
    ' col=mix(col,uFlashCol,uFlash);',
    ' col+=(h(vUv*uRes+fract(uTime*7.)*91.)-.5)*uGrain;',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');

  const R = {
    mode: 'gl', W: 1, H: 1, dpr: 1, images: {}, tex: {},
    shot: null, a: null, b: null,
    cam: { cx: .5, cy: .5, zoom: 1, tcx: .5, tcy: .5, tzoom: 1, ease: 2.2, drift: 1 },
    p: { mix: 0, blur: 0, flash: 0, warm: 0, cold: 0, expo: 1, grain: .045, vig: .85, ripple: 1, edge: 1, flashCol: [1, .95, .84] },
    rectA: [0, 0, 1, 1], rectB: [0, 0, 1, 1], t: 0
  };

  R.init = function (canvas) {
    R.canvas = canvas;
    let gl = null;
    try { gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    if (gl && R.setupGL(gl)) { R.gl = gl; } else { R.to2D(); }
    R.resize();
    window.addEventListener('resize', R.resize);
  };

  R.setupGL = function (gl) {
    function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; } return s; }
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return false;
    const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return false;
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    R.u = {};
    ['uA', 'uB', 'uRA', 'uRB', 'uRes', 'uMix', 'uHasB', 'uTime', 'uBlur', 'uFlash', 'uWarm', 'uCold', 'uExpo', 'uGrain', 'uVig', 'uWaterA', 'uWaterB', 'uRipple', 'uEdge', 'uFlashCol']
      .forEach((k) => (R.u[k] = gl.getUniformLocation(pr, k)));
    gl.uniform1i(R.u.uA, 0); gl.uniform1i(R.u.uB, 1);
    return true;
  };

  R.to2D = function () {
    if (R.mode === '2d' && R.ctx) return;
    R.mode = '2d'; R.gl = null;
    // Un canvas qui a déjà un contexte WebGL ne peut pas passer en 2D : on le remplace.
    const c = document.createElement('canvas'); c.id = 'scene'; c.setAttribute('aria-hidden', 'true');
    R.canvas.replaceWith(c); R.canvas = c; R.ctx = c.getContext('2d');
    R.resize();
  };

  R.resize = function () {
    R.dpr = Math.min(window.devicePixelRatio || 1, 2);
    R.W = window.innerWidth; R.H = window.innerHeight;
    R.canvas.width = Math.round(R.W * R.dpr); R.canvas.height = Math.round(R.H * R.dpr);
    if (R.gl) R.gl.viewport(0, 0, R.canvas.width, R.canvas.height);
  };

  R.load = function (key) {
    const src = ELY.IMG[key] || key;
    if (R.images[src]) return R.images[src].ready;
    const img = new Image();
    const rec = { img, ready: null };
    rec.ready = new Promise((res) => { img.onload = () => res(img); img.onerror = () => { console.warn('Image manquante', src); res(img); }; });
    img.src = src; R.images[src] = rec;
    return rec.ready;
  };
  R.img = (key) => { const r = R.images[ELY.IMG[key] || key]; return r && r.img.naturalWidth ? r.img : null; };

  R.texture = function (key) {
    const src = ELY.IMG[key] || key;
    if (R.tex[src]) return R.tex[src];
    const img = R.img(key); if (!img || !R.gl) return null;
    const gl = R.gl, t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img); }
    catch (e) { console.warn('WebGL refuse l\'image (fichier local ?) : repli 2D'); R.to2D(); return null; }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    R.tex[src] = t; return t;
  };

  /* Change de plan. Les images doivent être chargées. */
  R.setShot = function (id, opts) {
    const def = Object.assign({}, ELY.SHOTS[id], opts || {});
    R.shot = def; R.shotId = id;
    R.a = def.img; R.b = def.imgB || null;
    const c = R.cam;
    c.cx = c.tcx = def.cx; c.cy = c.tcy = def.cy; c.zoom = c.tzoom = def.zoom || 1;
    R.p.mix = 0;
  };

  R.lookAt = function (cx, cy, zoom, ease) {
    const c = R.cam; if (cx !== undefined && cx !== null) c.tcx = cx; if (cy !== undefined && cy !== null) c.tcy = cy;
    if (zoom) c.tzoom = zoom; c.ease = ease || 2.2;
  };

  /* Fenêtre visible dans l'image (cadrage « cover » + zoom + caméra). */
  function rect(img, cx, cy, zoom) {
    if (!img) return [0, 0, 1, 1];
    const ia = img.naturalWidth / img.naturalHeight, sa = R.W / R.H;
    let fw = 1, fh = 1;
    if (ia > sa) fw = sa / ia; else fh = ia / sa;
    fw /= zoom; fh /= zoom;
    const u0 = Math.min(Math.max(cx - fw / 2, 0), 1 - fw), v0 = Math.min(Math.max(cy - fh / 2, 0), 1 - fh);
    return [u0, v0, fw, fh];
  }
  R.viewRect = () => rect(R.img(R.a), R.cam.cx, R.cam.cy, R.cam.zoom);

  /* Limites de la caméra : centre accessible pour qu'aucun bord ne soit visible. */
  R.camBounds = function () {
    const r = R.viewRect();
    return { x0: r[2] / 2, x1: 1 - r[2] / 2, y0: r[3] / 2, y1: 1 - r[3] / 2, fw: r[2], fh: r[3] };
  };

  R.toScreen = function (nx, ny) {
    const r = R.rectA; return { x: (nx - r[0]) / r[2] * R.W, y: (ny - r[1]) / r[3] * R.H };
  };
  R.toImage = function (sx, sy) {
    const r = R.rectA; return { x: r[0] + sx / R.W * r[2], y: r[1] + sy / R.H * r[3] };
  };

  R.render = function (dt) {
    R.t += dt;
    const c = R.cam, k = 1 - Math.exp(-dt * c.ease);
    const b = R.camBounds();
    c.tcx = Math.min(Math.max(c.tcx, b.x0), b.x1); c.tcy = Math.min(Math.max(c.tcy, b.y0), b.y1);
    c.cx += (c.tcx - c.cx) * k; c.cy += (c.tcy - c.cy) * k; c.zoom += (c.tzoom - c.zoom) * k;
    // Dérive lente : la caméra respire
    const dx = Math.sin(R.t * 0.13) * 0.004 * c.drift, dy = Math.sin(R.t * 0.09 + 1) * 0.003 * c.drift;
    const imgA = R.img(R.a), imgB = R.b ? R.img(R.b) : null;
    const z = c.zoom * (1 + 0.012 * c.drift);
    R.rectA = rect(imgA, c.cx + dx, c.cy + dy, z);
    R.rectB = rect(imgB, c.cx + dx, c.cy + dy, z);
    if (R.mode === 'gl') R.drawGL(imgA, imgB); else R.draw2D(imgA, imgB);
  };

  R.drawGL = function (imgA, imgB) {
    const gl = R.gl, u = R.u, p = R.p;
    const ta = imgA && R.texture(R.a);
    if (R.mode !== 'gl') return;
    const tb = imgB && R.texture(R.b);
    if (R.mode !== 'gl') return;
    gl.clearColor(0.043, 0.043, 0.07, 1); gl.clear(gl.COLOR_BUFFER_BIT);
    if (!ta) return;
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ta);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tb || ta);
    gl.uniform4fv(u.uRA, R.rectA); gl.uniform4fv(u.uRB, R.rectB);
    gl.uniform2f(u.uRes, R.canvas.width, R.canvas.height);
    gl.uniform1f(u.uMix, p.mix); gl.uniform1f(u.uHasB, tb ? 1 : 0);
    gl.uniform1f(u.uTime, R.t); gl.uniform1f(u.uBlur, p.blur);
    gl.uniform1f(u.uFlash, p.flash); gl.uniform3fv(u.uFlashCol, p.flashCol);
    gl.uniform1f(u.uWarm, p.warm); gl.uniform1f(u.uCold, p.cold); gl.uniform1f(u.uExpo, p.expo);
    gl.uniform1f(u.uGrain, p.grain); gl.uniform1f(u.uVig, p.vig);
    const w = (R.shot && R.shot.water) || [2, 3];
    gl.uniform2fv(u.uWaterA, w); gl.uniform2fv(u.uWaterB, (R.shot && R.shot.waterB) || w);
    gl.uniform1f(u.uRipple, p.ripple); gl.uniform1f(u.uEdge, p.edge);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  R.draw2D = function (imgA, imgB) {
    const ctx = R.ctx, p = R.p, W = R.canvas.width, H = R.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#0b0b12'; ctx.fillRect(0, 0, W, H);
    const draw = (img, r, alpha) => {
      if (!img || alpha <= 0) return;
      const iw = img.naturalWidth, ih = img.naturalHeight;
      ctx.globalAlpha = alpha;
      ctx.filter = p.blur > 0.0005 ? 'blur(' + Math.round(p.blur * 600) + 'px)' : 'none';
      ctx.drawImage(img, r[0] * iw, r[1] * ih, r[2] * iw, r[3] * ih, 0, 0, W, H);
    };
    draw(imgA, R.rectA, 1);
    if (imgB) draw(imgB, R.rectB, Math.min(1, Math.max(0, p.mix)));
    ctx.filter = 'none'; ctx.globalAlpha = 1;
    if (p.warm > 0) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = p.warm * 0.6; ctx.fillStyle = '#ffb25a'; ctx.fillRect(0, 0, W, H); }
    if (p.cold > 0) { ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = p.cold; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'source-over';
    if (p.expo < 1) { ctx.globalAlpha = 1 - p.expo; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
    const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + 0.75 * p.vig + ')');
    ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (p.flash > 0) { ctx.globalAlpha = p.flash; ctx.fillStyle = 'rgb(' + p.flashCol.map((v) => Math.round(v * 255)).join(',') + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.globalAlpha = 1;
  };

  ELY.R = R;
})();
