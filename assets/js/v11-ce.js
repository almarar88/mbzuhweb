/* v11 — Continuing Education page behaviours (vanilla, no dependencies).
   1) Gauge strip: fills each arc when it scrolls into view (gauge-ui.dev idea).
   2) Learning-path diagram theme chips, remembered in localStorage (pele.run / audiocn.dev idea).
   3) Gooey quick menu: toggle, Esc to close, close on link (easyui.site Gooey Menu idea). */
(()=>{
  'use strict';
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  /* 1. gauges */
  const gs=$$('.v11-gauge');
  if(gs.length){
    const on=g=>g.classList.add('g-on');
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){on(e.target);io.unobserve(e.target)}}),{threshold:.35});
      gs.forEach(g=>io.observe(g));
    }else gs.forEach(on);
  }
  /* 2. diagram themes */
  const pn=$('.pn');
  if(pn){
    const KEY='mbz-pn-theme',btns=$$('.pn-themes button',pn);
    const set=t=>{pn.dataset.pt=t;btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pt===t)))};
    try{const t=localStorage.getItem(KEY);if(t&&btns.some(b=>b.dataset.pt===t))set(t)}catch(e){}
    btns.forEach(b=>b.addEventListener('click',()=>{set(b.dataset.pt);try{localStorage.setItem(KEY,b.dataset.pt)}catch(e){}}));
  }
  /* 3. gooey menu */
  const goo=$('.v11-goo');
  if(goo){
    const b=$('.v11-goo-b',goo);
    const set=o=>{goo.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o))};
    b.addEventListener('click',()=>set(!goo.classList.contains('open')));
    goo.addEventListener('keydown',e=>{if(e.key==='Escape'&&goo.classList.contains('open')){set(false);b.focus()}});
    $$('a',goo).forEach(a=>a.addEventListener('click',()=>set(false)));
    document.addEventListener('click',e=>{if(!goo.contains(e.target))set(false)});
  }
})();
