/* ════════════════════════════════════════════════════════════
   THE CLOTH — a woven kirivöö rendered per pixel.

   An Estonian patterned belt is a grid of binary decisions made
   physical: every crossing is warp-over-weft or weft-over-warp,
   and the pattern is the data. That is the whole site's idea, so
   the cloth is not a background image, it is geometry: threads
   with a real height profile, analytic normals, a light, a sheen,
   and the aurora clip burning through the gaps between them.

   It weaves itself in on load, scroll loosens it, the pointer pulls
   it. Nothing here is a texture lookup pretending to be a material.

   Two instances run: the page's own dyed cloth, backlit by the
   aurora, and a second in `reverse` mode for the FAQ, which is the
   undyed side of the same belt, same geometry, no backlight.
   ════════════════════════════════════════════════════════════ */

const VERT = `#version 300 es
in vec2 p; out vec2 vUv;
void main(){ vUv = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform vec2  uRes;
uniform float uT;
uniform vec2  uPtr;
uniform float uPtrOn;
uniform float uWeave;   /* 0..1 how much of the cloth exists yet   */
uniform float uOpen;    /* 0..1 how loose the weave is             */
uniform float uLight;   /* 0..1 how much light is behind the cloth */
uniform sampler2D uTex; /* the aurora, seen through the gaps       */
uniform float uTexOn;
uniform float uRev;    /* 1 = the undyed reverse of the cloth */

const vec3 WARP  = vec3(0.043,0.062,0.129);  /* dark wool warp        */
const vec3 WEFT  = vec3(0.086,0.121,0.219);  /* slightly bluer weft   */
const vec3 PATT  = vec3(0.647,0.925,0.957);  /* the bright thread     */
const vec3 AMBER = vec3(0.949,0.698,0.290);  /* the one warm thread   */

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
}

/* One repeat of the belt: an eight-point diamond with a centre pip and
   two guard stripes, which is the commonest kirivöö family. Written as
   arithmetic on the thread index so it survives any zoom. */
float motif(vec2 gi){
  vec2 m = mod(gi, vec2(18.0,18.0)) - 8.5;
  float a = abs(m.x) + abs(m.y);
  float ring   = step(a,7.2) * step(5.2,a);
  float pip    = step(a,1.6);
  float spur   = step(abs(abs(m.x)-abs(m.y)),0.55) * step(a,8.6) * step(7.2,a);
  return clamp(ring + pip + spur, 0.0, 1.0);
}
/* guard stripes: two solid weft rows per repeat, the belt's selvedge */
float stripe(float row){
  return step(mod(row,18.0), 0.6);
}

void main(){
  float ar = uRes.x/max(uRes.y,1.0);
  vec2 uv  = vUv;
  vec2 cuv = vec2(uv.x*ar, uv.y);

  /* a hand pressed into the fabric: the weave is dragged toward it and
     opens up around the dent, exactly as cloth does */
  vec2  dv   = cuv - uPtr;
  float r    = length(dv);
  float dent = uPtrOn * exp(-r*r*6.0);
  cuv -= normalize(dv + 1e-5) * dent * 0.05;

  /* the cloth is hanging, so it breathes */
  cuv.y += sin(cuv.x*2.1 + uT*0.21)*0.0055;
  cuv.x += sin(cuv.y*1.6 - uT*0.16)*0.0040;

  float N  = mix(58.0, 46.0, uOpen);
  vec2  g  = cuv * N;
  vec2  gi = floor(g);
  vec2  gf = fract(g);

  /* the weaving front travels down the cloth */
  float woven = smoothstep(uWeave + 0.03, uWeave - 0.14, 1.0 - uv.y);

  /* thread half-widths. 0.5 means the threads touch. */
  float tw = mix(0.452, 0.315, clamp(uOpen + dent*0.9, 0.0, 1.0));
  float ex = abs(gf.x - 0.5) / tw;
  float ey = abs(gf.y - 0.5) / tw;

  float onW = 1.0 - smoothstep(0.90, 1.0, ex);              /* warp, vertical  */
  float onF = (1.0 - smoothstep(0.90, 1.0, ey)) * woven;    /* weft, horizontal*/

  float hW = onW * sqrt(max(0.0, 1.0 - ex*ex));
  float hF = onF * sqrt(max(0.0, 1.0 - ey*ey));

  /* plain weave: alternate which thread is on top at every crossing */
  float over = mod(gi.x + gi.y, 2.0);
  hW *= mix(0.52, 1.0, over);
  hF *= mix(1.0, 0.52, over);

  float warpTop = step(hF, hW);
  float cov     = max(hW, hF);

  /* ── the light behind the cloth ─────────────────────────── */
  float gap = 1.0 - smoothstep(0.0, 0.26, cov);
  vec2  par = (uv - 0.5) * 0.05 * gap;                       /* parallax */
  vec3  back = vec3(0.020,0.031,0.070);
  if(uTexOn > 0.5){
    vec3 t = texture(uTex, clamp(uv + par, 0.001, 0.999)).rgb;
    back = mix(back, t*1.55, 0.94);
  }
  back *= mix(0.35, 1.0, uLight);

  /* ── the threads ────────────────────────────────────────── */
  float pat = motif(gi);
  float str = stripe(gi.y);
  vec3 weftCol = mix(WEFT, PATT, pat);
  weftCol = mix(weftCol, AMBER, str * 0.8);
  vec3 warpCol = mix(WARP, PATT, pat * 0.18);
  vec3 base    = mix(weftCol, warpCol, warpTop);
  /* the reverse: undyed wool, the pattern showing only as the shadow it
     casts through the cloth, which is what the back of a belt looks like */
  vec3 rWeft = mix(vec3(0.918,0.930,0.952), vec3(0.836,0.856,0.892), pat);
  rWeft = mix(rWeft, vec3(0.902,0.860,0.792), str*0.7);
  vec3 rWarp = mix(vec3(0.878,0.892,0.918), vec3(0.828,0.846,0.880), pat*0.35);
  base = mix(base, mix(rWeft, rWarp, warpTop), uRev);

  /* analytic normals: a thread is a cylinder, so its normal leans along
     its own cross axis and ripples slightly along its length */
  vec3 nW = normalize(vec3((gf.x-0.5)/tw*1.5, 0.16*sin(gf.y*6.2832), 1.0));
  vec3 nF = normalize(vec3(0.16*sin(gf.x*6.2832), (gf.y-0.5)/tw*1.5, 1.0));
  vec3 n  = normalize(mix(nF, nW, warpTop));

  vec3  L    = normalize(vec3(-0.42, 0.58, 0.70));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0,0.0,1.0)), 0.0), 26.0);

  /* wool is fibrous, not plastic */
  float fib = 0.86 + 0.30*vnoise(cuv*vec2(420.0,90.0)) + 0.10*vnoise(cuv*vec2(90.0,420.0));

  vec3 thread = base * mix(0.20, 0.74, uRev) * 1.0
              + base * mix(0.95, 0.34, uRev) * diff * 1.0;
  thread *= fib;
  thread += spec * mix(mix(0.28,0.72,pat), 0.10, uRev) * mix(vec3(1.0), PATT, 0.5*(1.0-uRev));

  /* light leaking around every thread it passes: this is what makes the
     cloth read as lit from behind rather than printed */
  float rim = pow(1.0 - cov, 2.2) * step(0.02, cov);
  thread += back * rim * 1.05 * (1.0 - uRev);

  vec3 col = mix(mix(back, vec3(0.836,0.849,0.878), uRev), thread, smoothstep(0.0, 0.16, cov));
  col *= mix(mix(1.0, 0.74, uOpen), 1.0, uRev);   /* the weave calms as the page fills with text */

  /* the un-woven region is open warp: dimmer, so the front line reads */
  col = mix(col * 0.82, col, woven*0.6 + 0.4);

  col *= 1.0 - mix(0.42, 0.10, uRev)*pow(length((uv-0.5)*vec2(1.25,1.10)), 2.2);
  col += (hash(uv*uRes + fract(uT)) - 0.5) * 0.014;

  o = vec4(max(col, mix(vec3(0.020,0.031,0.070)*0.85, vec3(0.80,0.81,0.84), uRev)), 1.0);
}`;

export function startCloth(canvas, opts = {}){
  const gl = canvas.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'high-performance'});
  if(!gl) return null;

  const sh = (t,src)=>{ const s=gl.createShader(t); gl.shaderSource(s,src); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(s)); return null; } return s; };
  const vs = sh(gl.VERTEX_SHADER,VERT), fs = sh(gl.FRAGMENT_SHADER,FRAG);
  if(!vs || !fs) return null;
  const pr = gl.createProgram(); gl.attachShader(pr,vs); gl.attachShader(pr,fs); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return null;
  gl.useProgram(pr);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr,'p');
  gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

  const U = n => gl.getUniformLocation(pr,n);
  const u = {res:U('uRes'),t:U('uT'),ptr:U('uPtr'),ptrOn:U('uPtrOn'),
             weave:U('uWeave'),open:U('uOpen'),light:U('uLight'),tex:U('uTex'),texOn:U('uTexOn'),rev:U('uRev')};
  gl.uniform1i(u.tex,0);
  gl.uniform1f(u.texOn,0);
  gl.uniform1f(u.rev, opts.reverse ? 1 : 0);

  /* the aurora clip becomes the light source behind the cloth */
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,1,1,0,gl.RGB,gl.UNSIGNED_BYTE,new Uint8Array([5,8,18]));

  let video = null, videoReady = false;
  function attachVideo(sources){
    const v = document.createElement('video');
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    v.crossOrigin = 'anonymous'; v.preload = 'auto';
    sources.forEach(([src,type])=>{ const s=document.createElement('source'); s.src=src; s.type=type; v.appendChild(s); });
    v.addEventListener('playing',()=>{ videoReady = true; gl.uniform1f(u.texOn,1); },{once:true});
    /* a detached video element decodes unreliably; park it in the document,
       one pixel, inert, so the browser always keeps a fresh frame for us */
    v.style.cssText='position:fixed;left:-10px;top:-10px;width:2px;height:2px;opacity:0;pointer-events:none';
    v.setAttribute('aria-hidden','true'); v.tabIndex=-1;
    document.body.appendChild(v);
    const p = v.play(); if(p && p.catch) p.catch(()=>{});
    video = v;
  }

  let W=0,H=0;
  const cap = opts.dprCap || 1.5;
  function size(){
    const d = Math.min(devicePixelRatio||1, cap);
    const box = opts.fitParent ? canvas.parentElement.getBoundingClientRect() : null;
    const w = box ? box.width : innerWidth, h = box ? box.height : innerHeight;
    W = Math.max(1,Math.round(w*d)); H = Math.max(1,Math.round(h*d));
    canvas.width=W; canvas.height=H;
    if(!opts.fitParent){ canvas.style.width=w+'px'; canvas.style.height=h+'px'; }
    gl.viewport(0,0,W,H); gl.uniform2f(u.res,W,H);
  }
  size();
  addEventListener('resize',size,{passive:true});

  const s = { weave:0, weaveT:0, open:0, openT:0, light:0, lightT:1,
              px:0, py:0, pxT:0, pyT:0, on:0, onT:0 };

  let raf=0, running=false, t0=performance.now();
  function frame(now){
    if(!running) return;
    const dt = Math.min((now-t0)/1000, 0.05); t0 = now;
    const k = (a,b,sp)=> a + (b-a)*Math.min(dt*sp,1);
    s.weave = k(s.weave,s.weaveT,2.6);
    s.open  = k(s.open, s.openT, 3.0);
    s.light = k(s.light,s.lightT,2.4);
    s.px    = k(s.px,   s.pxT,   6.0);
    s.py    = k(s.py,   s.pyT,   6.0);
    s.on    = k(s.on,   s.onT,   4.5);

    if(video && videoReady && video.readyState >= 2){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,video);
    }
    gl.uniform1f(u.t,now/1000);
    gl.uniform1f(u.weave,s.weave);
    gl.uniform1f(u.open,s.open);
    gl.uniform1f(u.light,s.light);
    gl.uniform2f(u.ptr,s.px,s.py);
    gl.uniform1f(u.ptrOn,s.on);
    gl.drawArrays(gl.TRIANGLES,0,3);
    raf = requestAnimationFrame(frame);
  }
  function play(){ if(running) return; running=true; t0=performance.now(); raf=requestAnimationFrame(frame); if(video) { const p=video.play(); if(p&&p.catch)p.catch(()=>{}); } }
  function stop(){ running=false; cancelAnimationFrame(raf); if(video) video.pause(); }
  function still(){
    s.weave=s.weaveT; s.open=s.openT; s.light=s.lightT; s.on=0;
    gl.uniform1f(u.t,7.0); gl.uniform1f(u.weave,s.weave); gl.uniform1f(u.open,s.open);
    gl.uniform1f(u.light,s.light); gl.uniform2f(u.ptr,0,0); gl.uniform1f(u.ptrOn,0);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }

  return {
    play, stop, still, attachVideo,
    set weave(v){ s.weaveT = v; },
    set open(v){ s.openT = v; },
    set light(v){ s.lightT = v; },
    pointer(x,y,on){ s.pxT=x; s.pyT=y; s.onT = on?1:0; },
  };
}
