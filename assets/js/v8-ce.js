/* v8 — slim CE ad card: dismissible on phone/tablet (remembered for this session), focus moves to the languages heading. */
(function(){
  const side=document.getElementById('ce-side');if(!side)return;
  const x=side.querySelector('.ce-side-x'),K='ce-side-x';
  try{if(sessionStorage.getItem(K)==='1')side.classList.add('off')}catch(e){}
  x&&x.addEventListener('click',()=>{side.classList.add('off');try{sessionStorage.setItem(K,'1')}catch(e){}
    const h=document.getElementById('lang-h');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}});
})();
/* v8 — course explorer (real hub sessions), level journey, sub-nav progress, FAQ search. */
(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement,calm=()=>root.classList.contains('calm')||matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* ---------- sub-nav progress ---------- */
  const prog=$('.ce-prog i');
  if(prog){let t=0;const f=()=>{t=0;const h=document.documentElement.scrollHeight-innerHeight;prog.style.transform=`scaleX(${h>0?Math.min(1,scrollY/h).toFixed(4):0})`};addEventListener('scroll',()=>{if(!t)t=requestAnimationFrame(f)},{passive:true});f()}
  /* ---------- explorer ---------- */
  const D=window.CE_SESSIONS,list=$('#ce-x-list');
  if(D&&list){
    const st={lang:'',level:'',track:''};let limit=3;
    const L=D.langs,LV=Object.fromEntries(D.levels),TR=Object.fromEntries(D.tracks);
    const opts={lang:[['','الكل'],...Object.entries(L).map(([k,v])=>[k,v.ar,v])],level:[['','الكل'],...D.levels],track:[['','الكل'],...D.tracks.map(([k,v])=>[k,v.replace('نهاية الأسبوع — ','نهاية الأسبوع ')])]};
    const match=(r,skip)=>Object.keys(st).every(k=>k===skip||!st[k]||r[k]===st[k]);
    const today=new Date();today.setHours(0,0,0,0);
    const when=d=>{const n=Math.round((new Date(d+'T00:00:00')-today)/864e5);if(n<0)return 'بدأت';if(n===0)return 'يبدأ اليوم';if(n===1)return 'يبدأ غداً';if(n===2)return 'يبدأ بعد يومين';if(n<=10)return `يبدأ بعد ${n} أيام`;return `يبدأ بعد ${n} يوماً`};
    const segs=$$('#ce-x-filters .ce-x-f');
    const drawSegs=()=>segs.forEach(f=>{const k=f.dataset.f,box=$('.ce-seg',f);box.innerHTML=opts[k].map(([v,lab,meta])=>{const n=D.rows.filter(r=>match(r,k)&&(!v||r[k]===v)).length;return `<button type="button" class="ce-chip8${meta?' has-endo':''}" data-v="${esc(v)}" aria-pressed="${st[k]===v}"${n||!v?'':' disabled'}${meta?` style="--lc:${meta.c}"`:''}>${meta?`<span class="ce-endo" lang="${meta.code}" dir="auto">${esc(meta.endo)}</span>`:''}<span>${esc(lab)}</span><small class="numx">${n}</small></button>`}).join('')});
    const journey=()=>{const j=$('#ce-journey');if(!st.lang){j.innerHTML='<p class="ce-jr-hint">اختر لغة لترى مسارك عبر المستويات الثلاثة وتاريخ بدء كل مستوى.</p>';return}
      const tr=st.track||'wd',l=L[st.lang];const rows=D.levels.map(([k,a])=>[k,a,D.rows.find(r=>r.lang===st.lang&&r.track===tr&&r.level===k)]);
      j.innerHTML=`<div class="ce-jr" style="--lc:${l.c}"><p class="ce-jr-t">مسارك في <b>${esc(l.ar)}</b> — ${esc(TR[tr])}${st.track?'':' <small>(اختر فترة أخرى لتغيير المواعيد)</small>'}</p><ol class="ce-jr-steps">${rows.map(([k,a,r],i)=>`<li${st.level===k?' class="on"':''} style="--i:${i}"><button type="button" data-lv="${k}" aria-pressed="${st.level===k}"><i aria-hidden="true">${i+1}</i><b>${a}</b><span>${r?esc(r.dateAr):'—'}</span></button></li>`).join('')}</ol></div>`;
      $$('[data-lv]',j).forEach(b=>b.addEventListener('click',()=>{st.level=st.level===b.dataset.lv?'':b.dataset.lv;limit=3;draw()}))};
    const card=(r,i)=>{const l=L[r.lang];return `<li class="ce-xc" style="--lc:${l.c};--d:${Math.min(i,8)}"><div class="ce-xc-top"><span class="ce-xc-lang"><span lang="${l.code}" dir="auto">${esc(l.endo)}</span>${esc(l.ar)}</span><span class="ce-xc-lv">${esc(r.levelAr)}</span></div><p class="ce-xc-date"><b>${esc(r.dateAr)}</b><small>${esc(r.dateDay)} · ${when(r.date)}</small></p><ul class="ce-xc-meta"><li>${esc(r.trackAr)}</li><li>${esc(r.days)}</li><li><bdi>${esc(r.start)} – ${esc(r.end)}</bdi></li><li>${esc(r.durAr)} · <span class="numx">1,200</span> د.إ</li></ul><div class="ce-xc-a"><a class="btn btn-primary" href="ce/register/${r.lang}.html?o=${encodeURIComponent(r.id)}#register">سجّل في هذا الموعد</a><a class="ce-xc-hub ext" href="${esc(r.url)}" target="_blank" rel="noopener">في البوابة<span class="sr-only"> (يفتح في نافذة جديدة)</span></a></div></li>`};
    const draw=()=>{drawSegs();journey();const rows=D.rows.filter(r=>match(r)).sort((a,b)=>a.date.localeCompare(b.date)||a.lang.localeCompare(b.lang)||a.track.localeCompare(b.track));
      const shown=rows.slice(0,limit);list.innerHTML=shown.map(card).join('')+(rows.length>limit?`<li class="ce-xc-more"><button type="button" class="btn ce-btn-out">عرض ${Math.min(6,rows.length-limit)} مواعيد أخرى <small class="numx">(${rows.length-limit} متبقٍ)</small></button></li>`:'');
      $('#ce-x-count').textContent=rows.length?`${rows.length} ${rows.length>10?'موعداً':rows.length>2?'مواعيد':rows.length===2?'موعدان':'موعد'} مطابق`:'لا توجد مواعيد مطابقة — جرّب فترة أو مستوى آخر.';
      $('#ce-x-reset').hidden=!(st.lang||st.level||st.track);list.classList.toggle('anim',!calm());
      const more=$('.ce-xc-more button',list);more&&more.addEventListener('click',()=>{const n=limit;limit+=6;draw();const nx=list.children[n];nx&&$('a',nx).focus()})};
    $('#ce-x-filters').addEventListener('click',e=>{const b=e.target.closest('.ce-chip8');if(!b||b.disabled)return;const k=b.closest('.ce-x-f').dataset.f;st[k]=b.dataset.v;limit=3;draw();const nb=$(`.ce-x-f[data-f="${k}"] .ce-chip8[data-v="${b.dataset.v}"]`);nb&&nb.focus()});
    $('#ce-x-reset').addEventListener('click',()=>{st.lang=st.level=st.track='';limit=3;draw();$('#ce-x-filters .ce-chip8').focus()});
    /* deep links: language cards' secondary action / #explorer-<lang> */
    const fromHash=()=>{const m=location.hash.match(/^#explorer-(english|french|russian|chinese)$/);if(m){st.lang=m[1];limit=3;draw();$('#explorer').scrollIntoView({behavior:calm()?'auto':'smooth'})}};
    addEventListener('hashchange',fromHash);draw();fromHash();
  }
  /* ---------- FAQ ---------- */
  const fq=$('#ce-faq-q'),qa=$$('.ce-qa');
  if(qa.length){
    const N=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي');
    const idx=qa.map(d=>N(d.textContent));
    fq&&fq.addEventListener('input',()=>{const v=N(fq.value.trim());let n=0;qa.forEach((d,i)=>{const hit=!v||v.split(/\s+/).every(w=>idx[i].includes(w));d.hidden=!hit;if(hit)n++;if(v&&hit&&n===1)d.open=true});$('#ce-faq-s').textContent=v?(n?`${n} من ${qa.length}`:'لا نتائج — جرّب كلمة أخرى أو اسأل المساعد'):''});
    const all=$('#ce-faq-all');all&&all.addEventListener('click',()=>{const o=all.getAttribute('aria-pressed')!=='true';qa.forEach(d=>d.open=o);all.setAttribute('aria-pressed',o);all.textContent=o?'أغلق كل الإجابات':'افتح كل الإجابات'});
    const op=()=>{const d=location.hash&&document.getElementById(location.hash.slice(1));if(d&&d.classList.contains('ce-qa'))d.open=true};addEventListener('hashchange',op);op();
  }
})();
/* v8 — hero: nearest upcoming start date (from hub sessions) */
(function(){const D=window.CE_SESSIONS,el=document.getElementById('ce-next');if(!D||!el)return;
  const t=new Date();t.setHours(0,0,0,0);const up=D.rows.filter(r=>new Date(r.date+'T00:00:00')>=t).sort((a,b)=>a.date.localeCompare(b.date));if(!up.length)return;
  const r=up[0],n=Math.round((new Date(r.date+'T00:00:00')-t)/864e5),langs=[...new Set(up.filter(x=>x.date===r.date).map(x=>D.langs[x.lang].ar))].join(' و');
  const rel=n===0?'اليوم':n===1?'غداً':n===2?'بعد يومين':n<=10?`بعد ${n} أيام`:`بعد ${n} يوماً`;
  el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span>أقرب بداية: <b>${r.dateAr}</b> (${rel}) — ${langs}، المستوى المبتدئ</span><a href="#explorer">كل المواعيد</a>`;
  if(r.level!=='Beginner')el.querySelector('span').innerHTML=`أقرب بداية: <b>${r.dateAr}</b> (${rel}) — ${langs}`;el.hidden=false})();
