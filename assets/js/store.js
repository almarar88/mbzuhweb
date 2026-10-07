/* Demo university store — no payments; cart/wishlist/orders in localStorage on this device only. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  const STOP=new Set('في من على الى عن مع هذا هذه التي الذي ان او ما لا كما بين حول ثم قد كان كانت هو هي ذلك تلك عبر ضمن كل بعض غير وقد وهو وهي الا اذا حيث منذ خلال لها له لهم الكتاب كتاب'.split(' '));
  const toks=s=>norm(s).split(' ').filter(w=>w.length>2&&!STOP.has(w));
  const P=JSON.parse($('#st-data').textContent); const byId=Object.fromEntries(P.map(p=>[p.id,p]));
  P.forEach(p=>{p.tk=new Set(toks(p.t+' '+p.d.join(' ')))});
  const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(e){return d}};
  let cart=ld('mbz-cart',{}), wish=ld('mbz-wish',[]);
  const save=()=>{localStorage.setItem('mbz-cart',JSON.stringify(cart));localStorage.setItem('mbz-wish',JSON.stringify(wish));counts()};
  const counts=()=>{const n=Object.values(cart).reduce((a,b)=>a+b,0);$('#st-cart-n').textContent=n;$('#st-wish-n').textContent=wish.length;$('#st-cart-b').classList.toggle('has',n>0)};
  const PRICE='السعر يُحدد لاحقاً';
  const cover=(p,cls='')=>p.kind==='merch'?`<span class="merch ${cls}" style="--mc:${p.color}"><img src="${esc(p.img)}" alt="" loading="lazy"><i></i></span>`:(p.img?`<img src="${esc(p.img)}" alt="غلاف ${esc(p.t)}" loading="lazy" decoding="async">`:'');
  let cat='', q='';
  function grid(){const nq=norm(q);const L=P.filter(p=>(!cat||p.topic===cat)&&(!nq||nq.split(' ').every(w=>norm(p.t+' '+p.d.join(' ')+' '+p.tl).includes(w))));
    $('#st-grid').innerHTML=L.map(p=>`<li class="sp-card${p.kind==='merch'?' is-merch':''}" data-id="${p.id}"><button type="button" class="sp-open" data-open="${p.id}" aria-label="عرض ${esc(p.t)}"><span class="sp-cover">${cover(p)}</span></button><div class="sp-b"><span class="sp-tag">${esc(p.tl)}</span>${p.kind==='merch'?'<span class="prop-badge">منتج مفهومي</span>':''}<h3><button type="button" class="linkish" data-open="${p.id}">${esc(p.t)}</button></h3><span class="sp-price">${PRICE}</span><div class="sp-act"><button type="button" class="btn btn-primary sp-add" data-add="${p.id}"${p.kind==='merch'?' disabled title="منتج مفهومي غير متوفر"':''}>${p.kind==='merch'?'غير متوفر':'أضف للسلة'}</button><button type="button" class="st-heart" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}" aria-label="أضف للمفضلة"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg></button></div></div></li>`).join('');
    $('#st-empty').hidden=L.length>0}
  $$('[data-st]').forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.st;$$('[data-st]').forEach(x=>x.setAttribute('aria-pressed',x===b));grid()}));
  $('#st-q').addEventListener('input',e=>{q=e.target.value;grid()});
  /* similarity & AI */
  const sim=(a,b)=>{let n=0;a.tk.forEach(w=>{if(b.tk.has(w))n++});return n/Math.sqrt(a.tk.size*b.tk.size+1)};
  const similar=p=>P.filter(x=>x.id!==p.id&&x.kind==='book').map(x=>[sim(p,x),x]).sort((a,b)=>b[0]-a[0]).slice(0,4).map(x=>x[1]);
  function summary(p){const txt=p.d.join(' ');const S=txt.split(/(?<=[.!؟?])\s+/).map(s=>s.trim()).filter(s=>s.length>30);if(!S.length)return [];if(S.length<=2)return S;const tf={};S.forEach(s=>new Set(toks(s)).forEach(w=>tf[w]=(tf[w]||0)+1));const t0=new Set(toks(p.t));return S.map((s,i)=>{const u=[...new Set(toks(s))];return {s,i,sc:u.reduce((a,w)=>a+Math.log(1+tf[w])+(t0.has(w)?1.5:0),0)/Math.sqrt(u.length+1)+(i===0?1:0)}}).sort((a,b)=>b.sc-a.sc).slice(0,2).sort((a,b)=>a.i-b.i).map(x=>x.s)}
  $('#st-ai-f').addEventListener('submit',e=>{e.preventDefault();const qq=toks($('#st-ai-q').value).map(w=>w.replace(/^(وال|بال|ال|و)/,''));const out=$('#st-ai-out');if(!qq.length){out.innerHTML='<p class="muted-note">اكتب كلمة أو أكثر عن اهتمامك.</p>';return}
    const R=P.filter(p=>p.kind==='book').map(p=>{const t=norm(p.t),d=norm(p.d.join(' '));let s=0;const hit=[];qq.forEach(w=>{if(w.length<3)return;if(t.includes(w)){s+=3;hit.push(w)}else if(d.includes(w)){s+=1;hit.push(w)}});return {p,s,hit:[...new Set(hit)]}}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,3);
    out.innerHTML=R.length?`<ul class="st-recs">${R.map(r=>`<li><button type="button" data-open="${r.p.id}"><span class="sp-cover sm">${cover(r.p)}</span><span><b>${esc(r.p.t)}</b><small>يطابق: ${r.hit.map(esc).join('، ')}</small></span></button></li>`).join('')}</ul><p class="muted-note">مطابقة نصية مع العناوين والأوصاف المنشورة فقط.</p>`:'<p class="muted-note">لم أجد إصداراً يطابق هذه الكلمات. جرّب: الشعر، الفلسفة، التطرف، الفقه، القيم.</p>'});
  /* product view */
  const dlg=$('#st-dlg');
  function open(id,push=true){const p=byId[id];if(!p)return;const sm=summary(p);const rel=p.kind==='book'?similar(p):[];
    $('#st-view').innerHTML=`<div class="pv"><div class="pv-cover"><button type="button" class="pv-zoom" aria-label="تكبير الغلاف" aria-pressed="false">${cover(p,'lg')}</button><small class="muted-note">${p.kind==='book'?'اضغط على الغلاف للتكبير':''}</small></div><div class="pv-b"><span class="sp-tag">${esc(p.tl)}</span><h2 id="st-dlg-t">${esc(p.t)}</h2><p class="sp-price lg">${PRICE}</p>
      ${p.kind==='merch'?'<p class="prop-note">منتج مفهومي لعرض فكرة متجر المقتنيات — غير متوفر فعلياً.</p>':''}
      ${sm.length?`<div class="pv-ai"><div class="ai-h"><span class="av orb sm"></span><b>ملخص ذكي</b><small>من الوصف الرسمي فقط</small></div><ul>${sm.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></div>`:''}
      <h3>الوصف</h3>${p.d.length?p.d.map(x=>`<p>${esc(x)}</p>`).join(''):'<p class="muted-note">لا يوجد وصف منشور لهذا الإصدار في الموقع الرسمي.</p>'}
      <div class="pv-act"><button type="button" class="btn btn-primary" data-add="${p.id}"${p.kind==='merch'?' disabled':''}>${I_CART}أضف للسلة</button><button type="button" class="btn btn-ghost st-heart-b" data-wish="${p.id}" aria-pressed="${wish.includes(p.id)}">${wish.includes(p.id)?'في المفضلة':'أضف للمفضلة'}</button>${p.u?`<a class="btn btn-ghost ext" href="${esc(p.u)}" target="_blank" rel="noopener">صفحة الإصدار الرسمية</a>`:''}</div>
      ${rel.length?`<h3>كتب مشابهة <small class="muted-note">(اقتراح ذكي حسب تشابه الوصف)</small></h3><ul class="st-recs">${rel.map(r=>`<li><button type="button" data-open="${r.id}"><span class="sp-cover sm">${cover(r)}</span><span><b>${esc(r.t)}</b><small>${esc(r.tl)}</small></span></button></li>`).join('')}</ul>`:''}</div></div>`;
    if(!dlg.open)dlg.showModal();$('.cx-dlg-in',dlg).scrollTop=0;if(push)history.replaceState(null,'','#p-'+id)}
  const I_CART='';
  document.addEventListener('click',e=>{
    const o=e.target.closest('[data-open]');if(o){e.preventDefault();open(o.dataset.open);return}
    const a=e.target.closest('[data-add]');if(a&&!a.disabled){const id=a.dataset.add;cart[id]=(cart[id]||0)+1;save();toast('أُضيف إلى السلة: '+byId[id].t);a.classList.add('bump');setTimeout(()=>a.classList.remove('bump'),400);return}
    const w=e.target.closest('[data-wish]');if(w){const id=w.dataset.wish;wish=wish.includes(id)?wish.filter(x=>x!==id):[...wish,id];save();$$(`[data-wish="${id}"]`).forEach(b=>{b.setAttribute('aria-pressed',wish.includes(id));if(b.classList.contains('st-heart-b'))b.textContent=wish.includes(id)?'في المفضلة':'أضف للمفضلة'});toast(wish.includes(id)?'أُضيف إلى المفضلة':'أُزيل من المفضلة');return}
    const z=e.target.closest('.pv-zoom');if(z){const on=z.getAttribute('aria-pressed')!=='true';z.setAttribute('aria-pressed',on);return}
  });
  dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('[data-close]'))dlg.close()});
  dlg.addEventListener('close',()=>{if(location.hash.startsWith('#p-'))history.replaceState(null,'',location.pathname+location.search)});
  dlg.addEventListener('pointermove',e=>{const z=e.target.closest('.pv-zoom[aria-pressed="true"]');if(!z)return;const r=z.getBoundingClientRect();z.style.setProperty('--zx',((e.clientX-r.left)/r.width*100)+'%');z.style.setProperty('--zy',((e.clientY-r.top)/r.height*100)+'%')});
  /* drawer: cart / wishlist / checkout */
  const dr=$('#st-drawer'), body=$('#st-panel-body');let lastF=null;
  function drawer(view){lastF=document.activeElement;dr.hidden=false;document.documentElement.classList.add('lock');requestAnimationFrame(()=>dr.classList.add('open'));render(view);setTimeout(()=>{const b=$('[data-close-drawer].icon-btn',dr);b&&b.focus()},50)}
  function closeDr(){dr.classList.remove('open');document.documentElement.classList.remove('lock');setTimeout(()=>{dr.hidden=true},250);lastF&&lastF.focus&&lastF.focus()}
  function render(view){const h=$('#st-panel-h');
    if(view==='wish'){h.textContent='المفضلة';body.innerHTML=wish.length?`<ul class="cart-l">${wish.map(id=>byId[id]).filter(Boolean).map(p=>`<li><span class="sp-cover sm">${cover(p)}</span><span class="cl-b"><b>${esc(p.t)}</b><small>${PRICE}</small></span><span class="cl-a">${p.kind==='book'?`<button type="button" class="btn btn-ghost" data-add="${p.id}">للسلة</button>`:''}<button type="button" class="linkbtn" data-wish="${p.id}">إزالة</button></span></li>`).join('')}</ul>`:'<p class="empty">قائمة المفضلة فارغة.</p>';return}
    if(view==='checkout'){h.textContent='إتمام الطلب (تجريبي)';const items=Object.entries(cart);
      body.innerHTML=`<div class="ap-demo" role="note"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/></svg><div><b>لا تتم أي عملية دفع</b><span>هذا نموذج تجريبي؛ يُحفظ الطلب على هذا الجهاز ويظهر في لوحة المتجر ببوابة الموظف.</span></div></div>
      <ol class="co-steps"><li class="on">الطلب</li><li>الاستلام</li><li>التأكيد</li></ol>
      <ul class="cart-l">${items.map(([id,n])=>`<li><span class="cl-b"><b>${esc(byId[id].t)}</b><small>الكمية: ${n}</small></span></li>`).join('')}</ul><p class="co-total">الإجمالي: <b>يُحدد لاحقاً</b> <small>(لا توجد أسعار منشورة)</small></p>
      <form id="co-f" class="co-f" novalidate><div class="fld"><label for="co-n">الاسم <i>*</i></label><input id="co-n" required autocomplete="name"></div><div class="fld"><label for="co-e">البريد الإلكتروني <i>*</i></label><input id="co-e" type="email" required dir="ltr" autocomplete="email"></div><div class="fld"><label for="co-p">طريقة الاستلام</label><select id="co-p"><option>الاستلام من المقر الرئيسي - أبوظبي</option><option>الاستلام من فرع عجمان</option><option>الاستلام من فرع منطقة الظفرة</option></select></div><p class="wz-err" id="co-err" hidden>أدخل الاسم وبريداً صحيحاً.</p><button class="btn btn-primary co-go">تأكيد الطلب (دون دفع)</button></form>`;
      $('#co-f').addEventListener('submit',ev=>{ev.preventDefault();const n=$('#co-n').value.trim(),em=$('#co-e').value.trim();if(n.length<3||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){$('#co-err').hidden=false;return}
        const ref='W-'+String(Date.now()).slice(-5);const orders=ld('mbz-orders',[]);orders.unshift({ref,name:n,email:em,pickup:$('#co-p').value,items:Object.entries(cart),date:new Date().toISOString().slice(0,10),status:'new',mine:true});localStorage.setItem('mbz-orders',JSON.stringify(orders));cart={};save();
        body.innerHTML=`<div class="wz-done"><div class="done-ic" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg></div><h3>تم حفظ طلبك التجريبي</h3><p>رقم الطلب <b dir="ltr">${ref}</b></p><p class="muted-note">لم تتم أي عملية دفع ولم يُرسل الطلب إلى أي جهة.</p><a class="btn btn-primary" href="staff.html#store-admin">شاهده في لوحة المتجر</a></div>`;window.MBZ_confetti&&window.MBZ_confetti()});return}
    h.textContent='السلة';const items=Object.entries(cart);
    body.innerHTML=items.length?`<ul class="cart-l">${items.map(([id,n])=>{const p=byId[id];return `<li><span class="sp-cover sm">${cover(p)}</span><span class="cl-b"><b>${esc(p.t)}</b><small>${PRICE}</small></span><span class="qty"><button type="button" data-q="${id}" data-d="-1" aria-label="إنقاص">−</button><span class="numx">${n}</span><button type="button" data-q="${id}" data-d="1" aria-label="زيادة">+</button></span></li>`}).join('')}</ul><p class="co-total">الإجمالي: <b>يُحدد لاحقاً</b></p><button type="button" class="btn btn-primary co-go" data-checkout>متابعة الطلب</button>`:'<p class="empty">السلة فارغة. أضف إصداراً من المتجر.</p>'}
  $('#st-cart-b').addEventListener('click',()=>drawer('cart'));$('#st-wish-b').addEventListener('click',()=>drawer('wish'));
  dr.addEventListener('click',e=>{if(e.target.closest('[data-close-drawer]'))closeDr();const qb=e.target.closest('[data-q]');if(qb){const id=qb.dataset.q;cart[id]=(cart[id]||0)+(+qb.dataset.d);if(cart[id]<=0)delete cart[id];save();render('cart')}if(e.target.closest('[data-checkout]'))render('checkout');if(e.target.closest('[data-wish]'))setTimeout(()=>render('wish'),0)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dr.hidden)closeDr()});
  grid();counts();
  const h=location.hash.match(/^#p-(.+)$/);if(h)open(decodeURIComponent(h[1]),false);
})();
