/* Portals: program recommender, study-plan helper, staff services launcher (all client-side, no external APIs) */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  const BASE=document.documentElement.dataset.base||'';
  const LV={bachelor:'بكالوريوس',master:'ماجستير',phd:'دكتوراه',diploma:'دبلوم دراسات عليا'};
  /* ---------- program recommender ---------- */
  $$('.quiz').forEach(q=>{
    const d=JSON.parse($('#quiz-data',q).textContent), f=$('#quiz-form',q), out=$('#quiz-out',q);
    if(!f||!out)return;
    if(f.tagName!=='FORM'){const go=f.querySelector('.quiz-go');go&&go.addEventListener('click',()=>f.dispatchEvent(new Event('submit',{cancelable:true})));f.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[type=text],input:not([type])')){e.preventDefault();f.dispatchEvent(new Event('submit',{cancelable:true}))}})}
    const progs=d.p.map(p=>({...p,nn:norm(p.n),no:norm(p.o)}));
    f.addEventListener('submit',e=>{e.preventDefault();
      const lv=(f.querySelector('input[name=lv]:checked')||{}).value||'';
      const tps=[...f.querySelectorAll('input[name=tp]:checked')].map(x=>d.t.find(t=>t.k===x.value));
      const free=norm($('#quiz-free',q).value).split(' ').filter(w=>w.length>2).map(w=>w.replace(/^(وال|بال|ال)/,''));
      let res=progs.filter(p=>!lv||p.l===lv).map(p=>{let s=0;const why=[];
        tps.forEach(t=>{let hit=0;t.w.forEach(w=>{if(p.nn.includes(w))hit+=3;else if(p.no.includes(w))hit+=1});if(hit){s+=hit;why.push(t.l)}});
        free.forEach(w=>{if(p.nn.includes(w)){s+=3;why.push('«'+w+'»')}else if(p.no.includes(w)){s+=1;why.push('«'+w+'»')}});
        return {...p,s,why:[...new Set(why)]}});
      const any=tps.length||free.length; res=res.filter(p=>!any||p.s>0).sort((a,b)=>b.s-a.s).slice(0,any?3:4);
      const mx=Math.max(1,...res.map(r=>r.s));
      out.innerHTML=res.length?`<p style="margin:0;font-size:.85rem;color:var(--muted)">${any?'أفضل البرامج المطابقة لإجاباتك:':'بعض البرامج المتاحة في هذا المستوى:'}</p>`+res.map(r=>`<a class="rec" href="${BASE+esc(r.u)}"><div class="meta"><span class="tag">${LV[r.l]||''}</span><span>${esc(r.c)}</span></div><b>${esc(r.n)}</b>${r.why.length?`<div class="why">لماذا؟ يطابق: ${r.why.map(esc).join('، ')}</div>`:''}${any?`<div class="score" aria-hidden="true"><i style="width:${Math.round(r.s/mx*100)}%"></i></div>`:''}</a>`).join('')+`<p style="margin:0;font-size:.75rem;color:var(--muted)">اقتراح تجريبي بالمطابقة النصية مع أوصاف البرامج المنشورة — ليس توصية رسمية. راجع صفحة البرنامج وشروط القبول.</p>`
        :`<p class="empty" style="margin:0">لم أجد برنامجاً مطابقاً في هذا المستوى. جرّب «أي مستوى» أو مجالاً آخر.</p>`;
      out.scrollIntoView({block:'nearest',behavior:'smooth'});
    });
  });
  /* ---------- study-plan helper ---------- */
  const ph=$('#plan');
  if(ph){const plans=JSON.parse($('#plan-data',ph).textContent), sel=$('#ph-sel',ph), q=$('#ph-q',ph), out=$('#ph-out',ph), ans=$('#ph-ans',ph);
    const render=()=>{const p=plans.find(x=>x.id===sel.value)||plans[0];const nq=norm(q.value);const code=(q.value.match(/[A-Za-z]{2,4}\s?\d{3}/)||[''])[0].replace(/\s/g,'').toUpperCase();
      let total=0,count=0;p.sems.forEach(s=>s.c.forEach(c=>{count++;total+=parseFloat(c.cr)||0}));
      let hits=[];
      out.innerHTML=`<div class="ph-sum"><span>${esc(p.college)}</span><span>${count} مساقاً</span><span>${total} ساعة معتمدة في الجدول المنشور</span><a href="${BASE+esc(p.url)}">الجدول في صفحة الكلية</a></div>`+p.sems.map(s=>{const cr=s.c.reduce((a,c)=>a+(parseFloat(c.cr)||0),0);return `<div class="ph-sem"><h4><span>${esc(s.l||'—')}</span><span>${cr} س.م</span></h4><ul>${s.c.map(c=>{const hit=(code&&c.code.toUpperCase()===code)||(nq.length>2&&!code&&norm(c.n).includes(nq.replace(/^(ما|متطلبات|متطلب)\s*/,'')));if(hit)hits.push({c,s});return `<li class="${hit?'hit':''}"><code>${esc(c.code)}</code><span>${esc(c.n)}</span><span class="cr">${esc(c.cr)} س.م</span>${c.pre&&c.pre!=='لا يوجد'?`<span class="pre">المتطلب السابق: ${esc(c.pre)}</span>`:''}</li>`}).join('')}</ul></div>`}).join('');
      if(q.value.trim()){ans.innerHTML=hits.length?hits.slice(0,3).map(h=>`<b>${esc(h.c.n)}</b> (<span dir="ltr">${esc(h.c.code)}</span>) — ${esc(h.s.l)} · ${esc(h.c.cr)} ساعات معتمدة · المتطلب السابق: ${esc(h.c.pre||'—')} · نظام الدراسة: ${esc(h.c.m||'—')}`).join('<br>'):'لم أجد هذا المساق في الجدول المختار. جرّب خطة أخرى أو رمزاً مختلفاً.'}else ans.innerHTML='';
      const h=$('.hit',out);if(h&&q.value.trim())h.scrollIntoView({block:'nearest'});};
    sel.addEventListener('change',render);q.addEventListener('input',render);render();
  }
  /* ---------- staff services launcher ---------- */
  const L=$('.launcher');
  if(L){const KEY='mbz-favs';let favs=[];try{favs=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){}
    const tiles=$$('.lg:not(.favs) .lt',L), q=$('#lt-q',L), favSec=$('#favs',L), favList=$('#fav-list',L), emp=$('#lt-empty',L);let cat='';
    const sync=()=>{tiles.forEach(t=>{const on=favs.includes(t.dataset.id);$('.fav',t).setAttribute('aria-pressed',on)});favList.innerHTML='';favs.forEach(id=>{const t=tiles.find(x=>x.dataset.id===id);if(t){const c=t.cloneNode(true);c.removeAttribute('hidden');favList.appendChild(c)}});favSec.hidden=!favList.children.length;localStorage.setItem(KEY,JSON.stringify(favs))};
    L.addEventListener('click',e=>{const b=e.target.closest('.fav');if(!b)return;e.preventDefault();const id=b.closest('.lt').dataset.id;favs=favs.includes(id)?favs.filter(x=>x!==id):[...favs,id];sync();const t=document.querySelector('.toast');if(t){t.textContent=favs.includes(id)?'أُضيفت إلى المفضلة':'أُزيلت من المفضلة';t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1600)}});
    const apply=()=>{const nq=norm(q.value);let n=0;tiles.forEach(t=>{const ok=(!cat||t.dataset.cat===cat)&&(!nq||nq.split(' ').every(w=>norm(t.dataset.text).includes(w)));t.hidden=!ok;if(ok)n++});$$('.lg:not(.favs)',L).forEach(g=>g.hidden=!$$('.lt:not([hidden])',g).length);emp.hidden=n>0};
    $$('[data-lc]',L).forEach(c=>c.addEventListener('click',()=>{cat=c.dataset.lc;$$('[data-lc]',L).forEach(x=>x.setAttribute('aria-pressed',x===c));apply()}));
    q.addEventListener('input',apply);sync();apply();
  }
})();
