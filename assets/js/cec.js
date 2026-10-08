/* Continuing Education Center page: filters, course detail sheet, count-up, scrollspy */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const dataEl=$('#cx-data'); if(!dataEl) return;
  const D=JSON.parse(dataEl.textContent); const META=JSON.parse(($('#cx-catmeta')||{}).textContent||'{}');
  const byId=Object.fromEntries(D.items.map(x=>[x.id,x]));
  const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phone=()=>matchMedia('(max-width:600px)').matches;
  const ICONS={}; $$('.cx-card').forEach(b=>{const it=byId[b.dataset.course];if(it&&!ICONS[it.icon])ICONS[it.icon]=$('.cx-ic',b).innerHTML});
  /* ---------- filters ---------- */
  const grid=$('#cx-grid'), cards=$$('.cx-course',grid), q=$('#cx-filter'), cnt=$('#cx-count'), emp=$('#cx-empty'), ct=$('#cx-cat-t'), cd=$('#cx-cat-d');
  let cat='', limit=0, moreBtn=null;
  const pageSize=()=>phone()?6:8;
  function apply(resetLimit){
    if(resetLimit) limit=pageSize();
    const nq=norm(q.value); let n=0, shown=0;
    cards.forEach(li=>{const ok=(!cat||li.dataset.cat===cat)&&(!nq||nq.split(' ').every(w=>norm(li.dataset.text).includes(w)));if(ok){n++;li.hidden=shown>=limit;if(!li.hidden)shown++}else li.hidden=true});
    cnt.textContent=n; emp.hidden=n>0;
    ct.textContent=cat?(META[cat]&&META[cat].t)||'':'جميع البرامج'; cd.textContent=cat&&META[cat]?META[cat].d:'';
    if(!moreBtn){moreBtn=document.createElement('div');moreBtn.className='cx-moreb';moreBtn.innerHTML='<button type="button" class="btn btn-ghost"></button>';grid.after(moreBtn);$('button',moreBtn).addEventListener('click',()=>{limit+=pageSize();apply(false)})}
    const rest=n-shown; moreBtn.hidden=rest<=0; if(rest>0) $('button',moreBtn).textContent=`عرض المزيد (${rest})`;
  }
  $$('.cx-chip').forEach(ch=>ch.addEventListener('click',()=>{cat=ch.dataset.cat;$$('.cx-chip').forEach(x=>x.setAttribute('aria-pressed',x===ch));apply(true);const u=new URL(location.href);cat?u.searchParams.set('cat',cat):u.searchParams.delete('cat');history.replaceState(null,'',u)}));
  q&&q.addEventListener('input',()=>apply(true));
  const pc=new URLSearchParams(location.search).get('cat'); if(pc&&$(`.cx-chip[data-cat="${pc}"]`)){cat=pc;$$('.cx-chip').forEach(x=>x.setAttribute('aria-pressed',x.dataset.cat===pc))}
  apply(true);
  /* ---------- course detail (dialog / bottom sheet) ---------- */
  const dlg=$('#cx-dlg'), body=$('#cx-dlg-body');
  function fact(l,v,cls){return v?`<div class="${cls||''}"><dt>${esc(l)}</dt><dd>${v}</dd></div>`:''}
  function render(it){
    const isLang=it.cat==='languages';
    const rel=D.items.filter(x=>x.cat===it.cat&&x.id!==it.id).slice(0,8);
    let facts=fact('المجال',esc(it.catTitle))+fact(isLang?'عدد الساعات':'المدة',esc(it.dur));
    if(isLang) facts+=fact('الموعد المقترح',`<bdi dir="ltr">${esc(it.dates)}</bdi>`)+fact('الأيام',esc(it.days))+fact('السعر قبل الخصم وبدون الضريبة',`<bdi dir="ltr">${esc(it.price)}</bdi>`)+fact('قيمة الضريبة',`<bdi dir="ltr">${esc(it.vat)}</bdi>`)+fact('الإجمالي مع الضريبة',`<bdi dir="ltr">${esc(it.total)}</bdi>`,'tot');
    const note=isLang?esc(D.note):'لا تتضمن صفحة المركز تفاصيل إضافية لهذا البرنامج (المحاور، المواعيد، الرسوم). للاستفسار أو لطلب تنفيذه لجهتك، تواصل مع المركز أو راجع دليل البرامج التدريبية.';
    const mail=`mailto:${D.email}?subject=${encodeURIComponent('استفسار عن برنامج: '+it.name)}`;
    body.innerHTML=`<div class="cx-d-top"><span class="cx-ic">${ICONS[it.icon]||''}</span><div><small>${esc(it.catLabel)}</small><span>مركز التعليم المستمر</span></div></div>
<h2 id="cx-dlg-t">${esc(it.name)}</h2><p class="cx-d-en" dir="ltr" lang="en">${esc(it.en)}</p>
<dl class="cx-facts">${facts}</dl><p class="cx-d-note">${note}</p>
${rel.length?`<div class="cx-d-rel"><h3>برامج أخرى في المجال نفسه</h3><div class="chips">${rel.map(r=>`<button type="button" class="chip" data-rel="${r.id}">${esc(r.name)}</button>`).join('')}</div></div>`:''}
<div class="cx-d-act" style="margin-top:1.2rem">${D.portal?`<a class="btn btn-primary ext" href="${esc(D.portal)}" target="_blank" rel="noopener">التسجيل عبر بوابة المركز</a>`:''}<a class="btn btn-ghost" href="${mail}">استفسر بالبريد</a><button type="button" class="btn btn-ghost" data-ask="${esc('حدثني عن '+it.name)}">اسأل المساعد</button></div>`;
    $$('[data-rel]',body).forEach(b=>b.addEventListener('click',()=>{open(b.dataset.rel,true)}));
  }
  let opener=null;
  function open(id,swap){
    const it=byId[id]; if(!it||!dlg) return;
    render(it); if(!swap) opener=document.activeElement;
    if(!dlg.open){ if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','') }
    $('.cx-dlg-in',dlg).scrollTop=0;
    history.replaceState(null,'','#course-'+id);
    setTimeout(()=>{const x=$('.cx-dlg-x',dlg);x&&x.focus({preventScroll:true})},30);
  }
  function close(){ if(dlg&&dlg.open) dlg.close() }
  dlg&&dlg.addEventListener('close',()=>{ if(location.hash.startsWith('#course-')) history.replaceState(null,'',location.pathname+location.search); if(opener&&opener.focus) try{opener.focus({preventScroll:true})}catch(e){} });
  dlg&&dlg.addEventListener('click',e=>{ if(e.target===dlg) close(); if(e.target.closest('[data-close]')) close(); });
  dlg&&dlg.addEventListener('click',e=>{ if(e.target.closest('[data-ask]')) close(); },true);
  document.addEventListener('click',e=>{const b=e.target.closest('[data-course]'); if(b){e.preventDefault();open(b.dataset.course)}});
  const fromHash=()=>{const m=location.hash.match(/^#course-(.+)$/); if(m&&byId[decodeURIComponent(m[1])]) open(decodeURIComponent(m[1]))};
  addEventListener('hashchange',fromHash); fromHash();
  /* swipe down to close the sheet */
  (function(){if(!dlg)return;const inner=$('.cx-dlg-in',dlg);let y0=null,dy=0;inner.addEventListener('touchstart',e=>{if(!phone()||inner.scrollTop>0)return;y0=e.touches[0].clientY;dy=0},{passive:true});inner.addEventListener('touchmove',e=>{if(y0===null)return;dy=e.touches[0].clientY-y0;if(dy>0){inner.style.transform=`translateY(${dy}px)`}},{passive:true});inner.addEventListener('touchend',()=>{if(y0===null)return;inner.style.transition='transform .2s';if(dy>110){close()}inner.style.transform='';setTimeout(()=>inner.style.transition='',220);y0=null})})();
  /* ---------- count-up stats ---------- */
  const nums=$$('[data-count]');
  if(nums.length&&!reduce&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const el=e.target,raw=el.dataset.count,to=parseFloat(raw.replace(/,/g,''));if(!isFinite(to))return;const t0=performance.now(),dur=1200;const fmt=v=>raw.includes(',')?Math.round(v).toLocaleString('en-US'):String(Math.round(v));const step=t=>{const p=Math.min(1,(t-t0)/dur);el.textContent=fmt(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);else el.textContent=raw};el.textContent='0';requestAnimationFrame(step)}),{threshold:.6});
    nums.forEach(n=>io.observe(n));
  }
  /* ---------- section tabs scrollspy ---------- */
  const tabs=$$('.cx-tabs a'); const rail=$('.cx-tabs ul');
  if(tabs.length&&'IntersectionObserver' in window){
    const map=new Map(tabs.map(a=>[a.hash.slice(1),a]));
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const a=map.get(e.target.id);if(!a)return;tabs.forEach(x=>{x.classList.toggle('active',x===a);x.toggleAttribute('aria-current',x===a)});if(rail.scrollWidth>rail.clientWidth){rail.scrollTo({left:a.offsetLeft-(rail.clientWidth-a.offsetWidth)/2,behavior:reduce?'auto':'smooth'})}}),{rootMargin:'-35% 0px -60% 0px'});
    map.forEach((a,id)=>{const s=document.getElementById(id);s&&io.observe(s)});
  }
})();
