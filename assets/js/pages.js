/* v7 page interactions (progressive enhancement) */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
/* tabs with roving focus */
$$('[data-tabs]').forEach(w=>{const tabs=$$('[role=tab]',w);const sel=(t,f)=>{tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;const p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on});if(f)t.focus();t.scrollIntoView({block:'nearest',inline:'nearest'})};
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>sel(t));t.addEventListener('keydown',e=>{const rtl=document.dir!=='ltr';let k=null;if(e.key==='ArrowDown'||e.key===(rtl?'ArrowLeft':'ArrowRight'))k=(i+1)%tabs.length;if(e.key==='ArrowUp'||e.key===(rtl?'ArrowRight':'ArrowLeft'))k=(i-1+tabs.length)%tabs.length;if(e.key==='Home')k=0;if(e.key==='End')k=tabs.length-1;if(k!==null){e.preventDefault();sel(tabs[k],1)}})})});
/* copy buttons */
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(!b)return;const v=b.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('تم النسخ'),()=>toast(v))});
/* read aloud */
const synth=window.speechSynthesis;
$$('[data-readaloud]').forEach(b=>{if(!synth){b.hidden=true;return}const lbl=b.querySelector('span');const t0=lbl?lbl.textContent:'';
 b.addEventListener('click',()=>{if(b.getAttribute('aria-pressed')==='true'){synth.cancel();return}const box=$(b.dataset.readaloud);if(!box)return;const ps=$$('p,blockquote p',box).filter(p=>!p.closest('.up-note,.na-pn')&&p.textContent.trim());if(!ps.length)return;synth.cancel();let i=0;b.setAttribute('aria-pressed','true');if(lbl)lbl.textContent='إيقاف';
  const end=()=>{b.setAttribute('aria-pressed','false');if(lbl)lbl.textContent=t0;ps.forEach(p=>p.classList.remove('reading'))};
  const next=()=>{ps.forEach(p=>p.classList.remove('reading'));if(i>=ps.length||b.getAttribute('aria-pressed')!=='true')return end();const p=ps[i++];p.classList.add('reading');const u=new SpeechSynthesisUtterance(p.textContent);u.lang='ar-AE';const v=synth.getVoices().find(v=>/^ar/i.test(v.lang));if(v)u.voice=v;u.rate=.95;u.onend=next;u.onerror=end;synth.speak(u)};
  const old=synth.cancel.bind(synth);next();
 });});
addEventListener('pagehide',()=>synth&&synth.cancel());
/* news: search + category chips */
(function(){const q=$('#nw-q');if(!q)return;const cards=$$('[data-news]');let cat='';const em=$('#nw-empty');
 const run=()=>{const v=norm(q.value);let n=0;cards.forEach(c=>{const ok=(!v||norm(c.dataset.news).includes(v))&&(!cat||c.dataset.cat===cat);c.hidden=!ok;if(ok)n++});if(em)em.hidden=n>0};
 q.addEventListener('input',run);$$('[data-ncat]').forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.ncat;$$('[data-ncat]').forEach(x=>x.setAttribute('aria-pressed',x===b));run()}))})();
/* publications: search, sort, view */
(function(){const q=$('#pb-q'),g=$('#pb-grid');if(!q||!g)return;const items=$$('.pb',g);const orig=items.slice();const cnt=$('#pb-count'),em=$('#pb-empty');
 const run=()=>{const v=norm(q.value);let n=0;items.forEach(c=>{const ok=!v||norm(c.dataset.book).includes(v);c.hidden=!ok;if(ok)n++});if(cnt)cnt.textContent=n;if(em)em.hidden=n>0};
 q.addEventListener('input',run);
 const s=$('#pb-sort');if(s)s.addEventListener('change',()=>{const arr=s.value==='az'?orig.slice().sort((a,b)=>a.dataset.t.localeCompare(b.dataset.t,'ar')):orig;arr.forEach(x=>g.appendChild(x))});
 $$('[data-view]').forEach(b=>b.addEventListener('click',()=>{$$('[data-view]').forEach(x=>x.setAttribute('aria-pressed',x===b));g.classList.toggle('list',b.dataset.view==='list');try{localStorage.setItem('mbz-pbview',b.dataset.view)}catch(e){}}));
 try{if(localStorage.getItem('mbz-pbview')==='list'){const b=$('[data-view=list]');b&&b.click()}}catch(e){}})();
/* people filter (college pages) */
$$('[data-people-filter]').forEach(inp=>{const box=$('[data-people]');if(!box)return;const cards=$$('.pcard',box);inp.addEventListener('input',()=>{const v=norm(inp.value);cards.forEach(c=>c.hidden=v&&!norm(c.textContent).includes(v))})});
/* facilities lightbox */
(function(){const gal=$('[data-gallery]'),dlg=$('#lb');if(!gal||!dlg||!dlg.showModal)return;const figs=$$('.ul-fac',gal);let cur=0;
 const show=i=>{cur=(i+figs.length)%figs.length;const f=figs[cur];const img=$('img',f);$('.lb-img',dlg).innerHTML=img?`<img src="${img.currentSrc||img.src}" alt="${img.alt.replace(/"/g,'&quot;')}">`:'';$('.lb-txt',dlg).innerHTML=$('template',f).innerHTML};
 gal.addEventListener('click',e=>{const b=e.target.closest('[data-lightbox]');if(!b)return;show(+b.dataset.lightbox);dlg.showModal()});
 dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('.lb-x'))dlg.close();const n=e.target.closest('[data-lb]');if(n)show(cur+ +n.dataset.lb)});
 dlg.addEventListener('keydown',e=>{const rtl=document.dir!=='ltr';if(e.key==='ArrowLeft')show(cur+(rtl?1:-1));if(e.key==='ArrowRight')show(cur+(rtl?-1:1))})})();
/* scrollspy for side tables of contents */
(function(){const links=$$('.pv-toc a[href^="#"],.toc a[href^="#"]');if(!links.length||!('IntersectionObserver' in window))return;const map=new Map();links.forEach(a=>{const t=document.getElementById(decodeURIComponent(a.hash.slice(1)));if(t)map.set(t,a)});
 const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){links.forEach(l=>l.classList.remove('on'));const a=map.get(e.target);if(a)a.classList.add('on')}})},{rootMargin:'-20% 0px -70% 0px'});map.forEach((a,t)=>io.observe(t))})();
})();
/* programs: level tiles drive the existing level chips */
document.querySelectorAll('[data-level-tile]').forEach(t=>t.addEventListener('click',()=>{const c=document.querySelector(`[data-level-chip="${t.dataset.levelTile}"]`);const on=t.classList.contains('on');document.querySelectorAll('[data-level-tile]').forEach(x=>{x.classList.remove('on');x.setAttribute('aria-pressed','false')});if(on){const all=document.querySelector('[data-level-chip=""]');all&&all.click()}else{t.classList.add('on');t.setAttribute('aria-pressed','true');c&&c.click()}}));
