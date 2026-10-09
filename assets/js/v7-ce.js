/* v7 — Continuing Education page: announcements board + lightbox, poster tilt/parallax, 40% badge,
   find-your-language, glyph morph, scroll-driven registration timeline. No external requests. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement; root.classList.add('ce-js');
  const calm=()=>root.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const A=(window.CE_ANNOUNCEMENTS||[]).filter(a=>a&&a.id&&a.title);
  const srcset=p=>p.widths.map(w=>`${p.base}-${w}.webp ${w}w`).join(', ');
  const big=p=>`${p.base}-${Math.max(...p.widths)}.webp`;
  const ICON={book:'<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>'};
  /* ---------- board (re-rendered from the one array, so adding an object is enough) ---------- */
  const board=$('#ce-board');
  if(board&&A.length){
    board.innerHTML=A.map(a=>{
      const media=a.poster?`<button type="button" class="ce-card-media" data-lightbox="${esc(a.id)}" aria-label="عرض الإعلان كاملاً: ${esc(a.title)}"><picture><source type="image/webp" srcset="${srcset(a.poster)}" sizes="(max-width: 700px) 80vw, 320px"><img src="${a.poster.base}-800.jpg" width="${a.poster.w}" height="${a.poster.h}" alt="${esc(a.alt)}" loading="lazy" decoding="async"></picture></button>`
        :`<div class="ce-card-media ce-card-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">${ICON[a.icon]||ICON.book}</svg></div>`;
      const c=a.cta||{};const ext=c.ext?' ext" target="_blank" rel="noopener':'';
      return `<li class="ce-card" id="ann-${esc(a.id)}">${media}<div class="ce-card-b"><ul class="ce-card-tags">${(a.tags||[]).map(t=>`<li>${esc(t)}</li>`).join('')}</ul><h3>${esc(a.title)}</h3><p>${esc(a.summary)}</p><div class="ce-card-a">${c.href?`<a class="btn btn-primary${ext}" href="${esc(c.href)}">${esc(c.label)}</a>`:''}${a.more?`<a class="ce-card-more" href="${esc(a.more.href)}">${esc(a.more.label)}</a>`:''}</div><small>${esc(a.source)}</small></div></li>`;
    }).join('');
    const n=$('#ce-ann-n');n&&(n.textContent=A.length);
    const prev=$('.ce-nav-btn[data-dir=prev]'),next=$('.ce-nav-btn[data-dir=next]');
    const rtl=getComputedStyle(board).direction==='rtl';
    const upd=()=>{const max=board.scrollWidth-board.clientWidth;const x=Math.abs(board.scrollLeft);prev.disabled=x<4;next.disabled=x>max-4;$('.ce-board-nav').hidden=max<4};
    const step=d=>{const card=board.querySelector('.ce-card');const w=card?card.getBoundingClientRect().width+16:300;board.scrollBy({left:(rtl?-1:1)*d*w,behavior:calm()?'auto':'smooth'})};
    prev.addEventListener('click',()=>step(-1));next.addEventListener('click',()=>step(1));
    board.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd,{passive:true});upd();
    board.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();step((e.key==='ArrowLeft')===rtl?1:-1)}});
  }
  /* ---------- lightbox ---------- */
  const lb=$('#ce-lb'),img=$('#ce-lb-img'),ttl=$('#ce-lb-t'),cnt=$('#ce-lb-c'),openA=$('#ce-lb-open');
  const posters=A.filter(a=>a.poster);let cur=0,lastFocus=null;
  const show=i=>{cur=(i+posters.length)%posters.length;const a=posters[cur];img.src=big(a.poster);img.alt=a.alt||a.title;img.width=a.poster.w;img.height=a.poster.h;ttl.textContent=a.title;openA.href=big(a.poster);cnt.textContent=posters.length>1?`${cur+1} / ${posters.length}`:'';$$('.ce-lb-foot [data-lb]').forEach(b=>b.hidden=posters.length<2);lb.classList.remove('zoomed');$('[data-lb=zoom]').setAttribute('aria-pressed','false')};
  const open=id=>{if(!lb||!posters.length)return;lastFocus=document.activeElement;show(Math.max(0,posters.findIndex(a=>a.id===id)));if(lb.showModal)lb.showModal();else lb.setAttribute('open','');document.body.style.overflow='hidden'};
  const close=()=>{lb.close?lb.close():lb.removeAttribute('open')};
  if(lb){
    lb.addEventListener('close',()=>{document.body.style.overflow='';lastFocus&&lastFocus.focus&&lastFocus.focus()});
    lb.addEventListener('click',e=>{const b=e.target.closest('[data-lb]');if(b){const k=b.dataset.lb;if(k==='close')close();else if(k==='prev')show(cur-1);else if(k==='next')show(cur+1);else if(k==='zoom'){const z=lb.classList.toggle('zoomed');b.setAttribute('aria-pressed',z)}return}
      if(e.target===img){const z=lb.classList.toggle('zoomed');$('[data-lb=zoom]').setAttribute('aria-pressed',z);return}
      if(e.target===lb||e.target.id==='ce-lb-stage')close()});
    lb.addEventListener('keydown',e=>{if(posters.length>1&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();show(cur+(e.key==='ArrowLeft'?1:-1))}});
  }
  document.addEventListener('click',e=>{const t=e.target.closest('[data-lightbox]');if(t){e.preventDefault();open(t.dataset.lightbox)}});
  /* ---------- poster tilt + parallax ---------- */
  const poster=$('.ce-poster'),media=$('.ce-feat-media');
  if(poster&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    poster.addEventListener('pointermove',e=>{if(calm())return;const r=poster.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;poster.classList.add('tilting');poster.style.setProperty('--ry',(x*10).toFixed(2)+'deg');poster.style.setProperty('--rx',(-y*8).toFixed(2)+'deg')});
    poster.addEventListener('pointerleave',()=>{poster.classList.remove('tilting');poster.style.setProperty('--ry','0deg');poster.style.setProperty('--rx','0deg')});
  }
  /* ---------- scroll effects (one rAF loop): parallax + timeline progress ---------- */
  const tl=$('.ce-tl'),steps=$$('.ce-tl-steps .cx-step');let tick=false;
  const onScroll=()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{tick=false;const H=innerHeight;
    if(media&&!calm()&&innerWidth>860){const r=media.getBoundingClientRect();if(r.bottom>0&&r.top<H){const p=(r.top+r.height/2-H/2)/H;media.style.setProperty('--py',(p*-36).toFixed(1)+'px')}}
    if(tl){const r=tl.getBoundingClientRect();const p=Math.min(1,Math.max(0,(H*.8-r.top)/(r.height+H*.2)));tl.style.setProperty('--p',calm()?1:p.toFixed(3));steps.forEach((s,i)=>s.classList.toggle('on',calm()||p>=(i/steps.length)+.02))}
  })};
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});onScroll();
  /* ---------- 40% badge ---------- */
  const deal=$('.ce-feat-deal');
  if(deal){const num=$('.ce-40 .numx',deal);const run=()=>{deal.classList.add('in');if(calm()||!num)return;const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/1200);num.textContent=Math.round(40*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
    if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();run()}},{threshold:.5});io.observe(deal)}else run()}
  /* ---------- find your language ---------- */
  const q=$('#ce-find-q'),list=$('.lgcs'),st=$('#ce-find-s');
  if(q&&list){const N=s=>(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f\u064B-\u065F\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim();
    const cards=$$('.lgc[data-find]',list).map(a=>({a,k:N(a.dataset.find+' '+a.textContent),name:($('.lgc-ar',a)||{}).textContent||''}));
    q.addEventListener('input',()=>{const v=N(q.value);if(!v){list.classList.remove('filtering');cards.forEach(c=>c.a.classList.remove('hit'));st.textContent='';return}
      const hits=cards.filter(c=>c.k.split(/\s+/).some(w=>w.startsWith(v))||c.k.includes(v));list.classList.add('filtering');cards.forEach(c=>c.a.classList.toggle('hit',hits.includes(c)));
      st.textContent=hits.length?(hits.length===1?(hits[0].a.classList.contains('lgc-soon')?`${hits[0].name}: قريباً — لا تتوفر تفاصيل بعد`:`وجدنا: ${hits[0].name} — اضغط Enter لفتح صفحتها`):`${hits.length} لغات مطابقة`):'لا تتوفر هذه اللغة حالياً. اللغات المتاحة الآن: الإنجليزية، الفرنسية، الروسية، الصينية.'});
    q.addEventListener('keydown',e=>{if(e.key==='Enter'){const h=cards.filter(c=>c.a.classList.contains('hit'));if(h.length===1){e.preventDefault();if(h[0].a.href)location.href=h[0].a.href}}});
  }
  /* ---------- glyph morph on hover/focus ---------- */
  $$('.lgc[data-glyphs]').forEach(a=>{const g=a.dataset.glyphs.split('|'),el=$('.lgc-glyph',a);if(!el||g.length<2)return;let i=0,t=null;
    const go=()=>{if(calm())return;stop();t=setInterval(()=>{el.classList.add('swap');setTimeout(()=>{i=(i+1)%g.length;el.textContent=g[i];el.classList.remove('swap')},260)},900)};
    const stop=()=>{clearInterval(t);t=null};
    a.addEventListener('pointerenter',go);a.addEventListener('focus',go);a.addEventListener('pointerleave',stop);a.addEventListener('blur',stop)});
})();
