/* ════════════════════════════════════════════════════════════
   BARSION — behaviour.
   One WebGL field lives behind the whole page; the concrete walls
   are opaque layers with holes cut in them. Everything else is
   orchestration: nothing here is decoration for its own sake.
   ════════════════════════════════════════════════════════════ */
import { animate, createTimeline, createAnimatable, stagger, splitText, utils, onScroll } from 'animejs';
import { T } from './i18n.js';

const calm  = matchMedia('(prefers-reduced-motion:reduce)').matches;
const fine  = matchMedia('(hover:hover) and (pointer:fine)').matches;
const conn  = navigator.connection || {};
const thrifty = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');

/* ══ 1. THE CLOTH ═══════════════════════════════════════════
   The belt is woven live. Scroll drives the weave and how far it
   opens; the aurora clip is the light behind it.
   ═════════════════════════════════════════════════════════ */
import { startCloth } from './cloth.js';

const cv = document.getElementById('cloth');
const cloth = cv ? startCloth(cv,{dprCap: calm ? 1 : 1.5}) : null;
if(!cloth) document.documentElement.classList.add('nogl');

if(cloth){
  if(calm || thrifty){
    cloth.weave = 1; cloth.open = 0.4; cloth.light = 1; cloth.still();
  } else {
    cloth.attachVideo([['aurora.mp4','video/mp4'],['aurora.webm','video/webm']]);
    cloth.play();
    /* the cloth weaves itself in as the page lands */
    cloth.weave = 1;
    document.addEventListener('visibilitychange',()=> document.hidden ? cloth.stop() : cloth.play());
    if(fine){
      addEventListener('pointermove',e=>{
        const ar = innerWidth/innerHeight;
        cloth.pointer((e.clientX/innerWidth)*ar, 1-e.clientY/innerHeight, true);
      },{passive:true});
      addEventListener('pointerleave',()=>cloth.pointer(0,0,false),{passive:true});
    }
  }
}

/* the FAQ is the reverse of the same belt: same geometry, undyed, no
   backlight. A CSS pattern here would be imitation material; this is the
   cloth itself, turned over. */
const faqCv = document.getElementById('clothRev');
let faqCloth = null;
if(faqCv){
  faqCloth = startCloth(faqCv,{reverse:true, fitParent:true, dprCap: calm ? 1 : 1.25});
  if(faqCloth){
    faqCloth.weave = 1; faqCloth.open = 0.5; faqCloth.light = 1;
    if(calm || thrifty){ faqCloth.still(); }
    else {
      /* it costs nothing while nobody is looking at it */
      new IntersectionObserver(es=>{
        es.forEach(e=> e.isIntersecting ? faqCloth.play() : faqCloth.stop());
      },{rootMargin:'200px 0px'}).observe(faqCv.parentElement);
      faqCloth.still();
    }
  } else { faqCv.parentElement.classList.add('nocloth'); }
}

/* ══ 2. SCROLL opens the weave ═════════════════════════════ */
let scrollRaf = 0;
let wideOpen = 0;
function onScrollTick(){
  scrollRaf = 0;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const pr = Math.min(1, scrollY/max);
  if(cloth){
    cloth.open  = Math.max(0.24 + pr*0.76, wideOpen);
    cloth.light = Math.max(0.62 + pr*0.38, wideOpen);
    if(calm||thrifty) cloth.still();
  }
}
/* Sections marked data-wide pull the weave apart so the clip behind it reads
   as what it is. Elsewhere the aurora is light; here it is the sky. */
const wideSections = document.querySelectorAll('[data-wide]');
if(wideSections.length){
  const hit = new Set();
  new IntersectionObserver(es=>{
    es.forEach(e=>{ e.isIntersecting ? hit.add(e.target) : hit.delete(e.target); });
    wideOpen = hit.size ? 1 : 0;
    onScrollTick();
  },{threshold:0.22}).observe ? wideSections.forEach(el=>{
    new IntersectionObserver(es=>{
      es.forEach(e=>{ e.isIntersecting ? hit.add(e.target) : hit.delete(e.target); });
      wideOpen = hit.size ? 1 : 0;
      onScrollTick();
    },{threshold:0.22}).observe(el);
  }) : null;
}
addEventListener('scroll',()=>{ if(!scrollRaf) scrollRaf = requestAnimationFrame(onScrollTick); },{passive:true});
onScrollTick();

/* ══ 3. HEADER inverts over night sections ═════════════════ */
const hdr = document.getElementById('hdr');
const lightSections = [...document.querySelectorAll('[data-light]')];
if(hdr && lightSections.length){
  /* An IntersectionObserver band this thin is fragile: on a phone the header
     is 64px and the boundary lands exactly on the band's edge, so the header
     never inverted. Measuring the rect against the header line cannot miss. */
  const line = ()=> (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hh')) || 78) * 0.62;
  let want = false;
  const sync = ()=>{
    const y = line();
    const on = lightSections.some(el=>{ const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    if(on !== want){ want = on; hdr.classList.toggle('light', on); }
  };
  addEventListener('scroll', sync, {passive:true});
  addEventListener('resize', sync, {passive:true});
  sync();
}

/* ══ 4. HERO: the wall opens, the headline is cut in ═══════ */
const h1 = document.getElementById('heroH1');
const l1 = h1 && h1.querySelector('.l1');
let splitInstance = null;

function buildHero(){
  if(!l1) return;
  if(splitInstance){ splitInstance.revert(); splitInstance = null; }
  if(calm){ utils.set('.hero .sub, .hero .cta, .plaque, .l2', {opacity:1}); return; }

  splitInstance = splitText(l1,{words:{wrap:'clip'},chars:false,lines:false});

  const tl = createTimeline({defaults:{ease:'out(3)'}});
  tl.add(l1,{'--wd':[74,116],duration:1500,ease:'out(4)'},120)
    .add(splitInstance.words,{y:['110%','0%'],opacity:[0,1],duration:950,delay:stagger(46)},160)
    .add('.l2',{opacity:[0,1],scaleX:[.86,1],duration:700},'<+=260')
    .add('.hero .sub',{opacity:[0,1],y:[16,0],duration:640},'<+=60')
    .add('.hero .cta > *',{opacity:[0,1],y:[16,0],duration:600,delay:stagger(70)},'<+=40')
    .add('.plaque',{opacity:[0,1],duration:700},'<-=300')
    .add('.plaque b',{scaleY:[0,1],duration:520,delay:stagger(90)},'<');

  /* rAF never fires in a background tab, so the headline gets a hard
     guarantee written straight to the DOM rather than a seek the engine
     would have to run. */
  setTimeout(()=>{
    if(tl.currentTime > 40) return;
    l1.style.fontVariationSettings = "'wdth' 115";
    splitInstance.words.forEach(w=>{ w.style.transform='none'; w.style.opacity='1'; });
    document.querySelectorAll('.hero .sub, .hero .cta > *, .plaque, .l2').forEach(el=>{
      el.style.opacity='1'; el.style.transform='none';
    });
  }, 2600);
}
buildHero();

/* ══ 5. TICKER: a painted band along the base of the wall ══ */
const tickRun = document.getElementById('tickRun');
if(tickRun){
  const items = ['Managed IT','Consulting','Security','Web','Mobile','Cloud','Continuity','Custom software'];
  const mk = ()=> items.map(t=>`<span>${t}</span>`).join('');
  tickRun.innerHTML = mk()+mk()+mk();
  if(!calm){
    const half = ()=> tickRun.scrollWidth/3;
    animate(tickRun,{x:()=>-half(),duration:26000,ease:'linear',loop:true});
  }
}

/* ══ 6. (the solutions grid needs no script) ══════════════ */

/* ══ 7. REVEALS ═══════════════════════════════════════════
   Deliberately NOT run through the animation engine. A reveal
   controls whether content is visible, and requestAnimationFrame
   never fires in a background tab, so anything gated on the engine
   can leave a page permanently blank. IntersectionObserver plus a
   CSS class needs no frame, and the fallback timer below is the
   belt to that pair of braces.
   ═════════════════════════════════════════════════════════ */
const rv = document.querySelectorAll('.rv');
if(rv.length){
  rv.forEach(el=>{ if(el.dataset.rvD) el.style.transitionDelay = el.dataset.rvD + 'ms'; });
  const left = new Set(rv);
  const show = el => { el.classList.add('on'); left.delete(el); };
  if(calm || !('IntersectionObserver' in window)){
    rv.forEach(show);
  } else {
    /* IntersectionObserver only reports the state it sees when it runs, so a
       fast jump (End key, a hash link, a slow frame) can carry an element past
       the viewport between two computations and it would never be revealed.
       The observer handles the common case; this sweep guarantees the rest. */
    const sweep = ()=>{
      if(!left.size) return;
      left.forEach(el=>{ if(el.getBoundingClientRect().top < innerHeight*0.94) show(el); });
    };
    const io = new IntersectionObserver(es=>{
      es.forEach(e=>{ if(e.isIntersecting) show(e.target); });
      sweep();
    },{rootMargin:'0px 0px -6% 0px'});
    rv.forEach(el=>io.observe(el));
    addEventListener('scroll', sweep, {passive:true});
    addEventListener('resize', sweep, {passive:true});
    sweep();
    setTimeout(sweep, 1200);
  }
}

/* ══ 8. MAGNETIC PLATES: the action leans toward your hand ══ */
if(fine && !calm){
  document.querySelectorAll('.mag').forEach(el=>{
    const a = createAnimatable(el,{x:{duration:340,ease:'out(3)'},y:{duration:340,ease:'out(3)'}});
    el.addEventListener('pointermove',e=>{
      const r = el.getBoundingClientRect();
      a.x((e.clientX-(r.left+r.width/2))*0.22);
      a.y((e.clientY-(r.top+r.height/2))*0.34);
    });
    el.addEventListener('pointerleave',()=>{ a.x(0); a.y(0); });
  });
}

/* ══ 9. THE MASCOT: the one lit window that moves ══════════
   Ported unchanged in substance: the still ships in the markup and
   the clip is layered over it only when the visitor has not opted
   out. The clip carries all of its own motion; nothing here moves
   the element.
   ═════════════════════════════════════════════════════════ */
const mwrap = document.getElementById('mwrap');
const mstage = mwrap && mwrap.querySelector('.win-in');
if(mstage && !calm && !thrifty){
  new IntersectionObserver((es,obs)=>{
    if(!es.some(e=>e.isIntersecting)) return;
    obs.disconnect();
    const v = document.createElement('video');
    v.className='mascot'; v.muted=true; v.defaultMuted=true; v.loop=true; v.autoplay=true; v.playsInline=true;
    v.setAttribute('muted',''); v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    v.setAttribute('aria-hidden','true'); v.tabIndex=-1;
    v.preload='auto'; v.poster='mascot.jpg'; v.width=1152; v.height=648;
    [['mascot.mp4','video/mp4'],['mascot.webm','video/webm']].forEach(([src,type])=>{
      const so=document.createElement('source'); so.src=src; so.type=type; v.appendChild(so);
    });
    v.addEventListener('playing',()=>{ v.classList.add('on'); mstage.classList.add('playing'); },{once:true});
    mstage.appendChild(v);
    const tryPlay = ()=>{ const p=v.play(); if(p&&p.catch) p.catch(()=>{}); };
    tryPlay();
    new IntersectionObserver(vs=>{ vs.forEach(e=> e.isIntersecting ? tryPlay() : v.pause()); },{threshold:0}).observe(mwrap);
  },{rootMargin:'600px 0px'}).observe(mwrap);
}

/* ══ 10. MENU ══════════════════════════════════════════════ */
const burger = document.getElementById('burger'), navLinks = document.getElementById('navLinks');
if(burger && navLinks){
  burger.addEventListener('click',()=>{
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click',e=>{
    if(e.target.closest('a')){ navLinks.classList.remove('open'); burger.setAttribute('aria-expanded','false'); }
  });
}

export {};

/* ══ 11. LANGUAGE ══════════════════════════════════════════
   setLang writes textContent, so any link that lives inside a
   translated string would be destroyed. Every such link is its own
   element (.f-note, the footer). Do not nest one inside a
   [data-i18n] node.
   ═════════════════════════════════════════════════════════ */

let lang = 'en';
const btnEN = document.getElementById('btnEN'), btnET = document.getElementById('btnET');

function setLang(l){
  if(!T[l]) return;
  /* splitText rewrote the headline's DOM. revert() restores the text that was
     there when it split, so it has to run BEFORE the new language is written,
     or it puts the previous language straight back. */
  if(splitInstance){ splitInstance.revert(); splitInstance = null; }
  lang = l;
  document.documentElement.lang = l;
  const d = T[l];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(d[k] != null) el.textContent = d[k];
  });
  if(btnEN) btnEN.classList.toggle('active', l==='en');
  if(btnET) btnET.classList.toggle('active', l==='et');
  try{ localStorage.setItem('bs-lang', l); }catch(e){}
  buildHero();          /* the split heading has to be rebuilt from new text */
}
if(btnEN) btnEN.addEventListener('click',()=>setLang('en'));
if(btnET) btnET.addEventListener('click',()=>setLang('et'));
try{
  const saved = localStorage.getItem('bs-lang');
  if(saved && saved !== 'en') setLang(saved);
  else if(!saved && (navigator.language||'').toLowerCase().startsWith('et')) setLang('et');
}catch(e){}

/* ══ 12. CONTACT FORM ══════════════════════════════════════
   Front end only, wired for Web3Forms. With no key configured it
   says so plainly rather than pretending the message was sent.
   ═════════════════════════════════════════════════════════ */
const CONTACT = {
  key: '',                                   /* <- Web3Forms public key goes here */
  email: '',                                 /* <- fallback address shown on failure */
  endpoint: 'https://api.web3forms.com/submit'
};
const form = document.getElementById('contactForm');
const failBox = document.getElementById('fFail');
const submitBtn = document.getElementById('fSubmit');
const sentBox = document.getElementById('sentBox');
const loadedAt = Date.now();

function fieldError(input){
  const v = input.value.trim();
  if(input.hasAttribute('required') && !v) return true;
  if(input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return true;
  return false;
}
function markField(input){
  const bad = fieldError(input);
  input.classList.toggle('invalid', bad);
  const id = input.getAttribute('aria-describedby');
  const err = id && document.getElementById(id);
  if(err) err.classList.toggle('show', bad);
  input.setAttribute('aria-invalid', bad ? 'true' : 'false');
  return !bad;
}
function showFail(msg){
  if(!failBox) return;
  failBox.textContent = msg;
  failBox.classList.add('show');
}
if(form){
  form.querySelectorAll('input,textarea').forEach(el=>{
    el.addEventListener('blur',()=>{ if(el.classList.contains('invalid') || el.value.trim()) markField(el); });
    el.addEventListener('input',()=>{ if(el.classList.contains('invalid')) markField(el); });
  });
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    if(failBox) failBox.classList.remove('show');
    const required = [...form.querySelectorAll('[required]')];
    const ok = required.map(markField).every(Boolean);
    if(!ok){
      const first = form.querySelector('.invalid');
      if(first) first.focus();
      return;
    }
    if(form.website.value || Date.now() - loadedAt < 2500) return;   /* bots */

    const d = T[lang];
    if(!CONTACT.key){
      showFail(CONTACT.email ? d.f_fail_email.replace('{email}', CONTACT.email) : d.f_fail);
      return;
    }
    const label = submitBtn.querySelector('[data-i18n="f_send"]');
    const original = label ? label.textContent : '';
    submitBtn.setAttribute('aria-busy','true');
    if(label) label.textContent = d.f_sending + '...';
    try{
      const body = {
        access_key: CONTACT.key,
        subject: 'Barsion website enquiry',
        from_name: 'Barsion website',
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        company: form.company.value.trim(),
        topic: form.topic.value,
        message: form.message.value.trim(),
        language: lang
      };
      const res = await fetch(CONTACT.endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json',Accept:'application/json'},
        body: JSON.stringify(body)
      });
      const json = await res.json().catch(()=>({}));
      if(res.ok && json.success !== false){
        form.style.display = 'none';
        if(sentBox) sentBox.classList.add('show');
      } else {
        throw new Error('rejected');
      }
    } catch(err){
      showFail(CONTACT.email ? d.f_fail_email.replace('{email}', CONTACT.email) : d.f_fail);
    } finally {
      submitBtn.removeAttribute('aria-busy');
      if(label) label.textContent = original;
    }
  });
}

/* ══ 13. THE FOOTER WORDMARK breathes on its width axis ════ */
const ftMark = document.getElementById('ftMark');
if(ftMark && !calm){
  animate(ftMark,{
    '--fw':[86,124],
    duration:1400, ease:'out(3)',
    autoplay: onScroll({sync:0.25, target: ftMark, enter:'top bottom', leave:'bottom top'})
  });
}
