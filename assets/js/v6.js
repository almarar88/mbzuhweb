/* v6: ask-jump, reading settings, plan, what's new, before/after, contact map, admission checker,
   faculty distribution, news topics, quote cards. Demo only; localStorage; no network. */
(()=>{'use strict';
const SC=document.currentScript;const ROOT=(SC&&SC.dataset.root)||'';const rootURL=new URL(ROOT||'./',location.href);
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
const here=decodeURI(location.pathname).replace(decodeURI(rootURL.pathname),'')||'index.html';
const rel=p=>new URL(p,rootURL).href;
const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('calm')||document.documentElement.classList.contains('a11y-still');
const toast=m=>{let b=$('.v5-toasts');if(!b){b=document.createElement('div');b.className='v5-toasts';b.setAttribute('role','status');document.body.appendChild(b)}const t=document.createElement('div');t.className='v5-toast';t.innerHTML=m;b.appendChild(t);requestAnimationFrame(()=>t.classList.add('in'));setTimeout(()=>{t.classList.remove('in');setTimeout(()=>t.remove(),400)},3200)};

/* ---------- home: ask jump ---------- */
document.addEventListener('click',e=>{const b=e.target.closest('[data-ask-jump]');if(!b)return;const s=$('#ask');if(!s)return;s.scrollIntoView({behavior:still()?'auto':'smooth',block:'center'});setTimeout(()=>{$('#hero-q')?.focus({preventScroll:true});s.classList.add('v6-flash');setTimeout(()=>s.classList.remove('v6-flash'),1200)},still()?0:450)});

/* ---------- reading settings ---------- */
const A=Object.assign({fs:100,hc:0,links:0,ruler:0,space:0,still:0},LS.get('mbz-a11y',{}));
const root=document.documentElement;let ruler=null;
function applyA(){
  root.style.fontSize='';if(A.fs!==100){const base=parseFloat(getComputedStyle(root).fontSize);root.style.fontSize=(base*A.fs/100)+'px'}
  root.classList.toggle('a11y-hc',!!A.hc);root.classList.toggle('a11y-links',!!A.links);root.classList.toggle('a11y-space',!!A.space);root.classList.toggle('a11y-still',!!A.still);
  if(A.still)$$('video').forEach(v=>{try{v.pause()}catch(e){}});
  if(A.ruler&&!ruler){ruler=document.createElement('div');ruler.className='a11y-ruler';ruler.setAttribute('aria-hidden','true');document.body.appendChild(ruler);ruler.style.top=(innerHeight/2-28)+'px'}
  if(!A.ruler&&ruler){ruler.remove();ruler=null}
  const o=$('#a11y-fs');if(o)o.textContent=A.fs+'%';
  $$('[data-a11y]').forEach(b=>b.setAttribute('aria-pressed',!!A[b.dataset.a11y]));
  LS.set('mbz-a11y',A);
}
addEventListener('pointermove',e=>{if(ruler)ruler.style.top=(e.clientY-28)+'px'},{passive:true});
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(A.fs!==100)applyA()},200)});
applyA();
const dlg=$('#a11y-dlg');
document.addEventListener('click',e=>{
  if(e.target.closest('[data-a11y-open]')&&dlg){e.preventDefault();dlg.showModal()}
  if(e.target.closest('[data-a11y-close]')||e.target===dlg)dlg.close();
  const f=e.target.closest('[data-fs]');if(f){A.fs=Math.max(80,Math.min(150,A.fs+10*+f.dataset.fs));applyA()}
  const t=e.target.closest('[data-a11y]');if(t){A[t.dataset.a11y]=A[t.dataset.a11y]?0:1;applyA()}
  if(e.target.closest('[data-a11y-reset]')){Object.assign(A,{fs:100,hc:0,links:0,ruler:0,space:0,still:0});applyA();if(root.classList.contains('calm'))$('[data-calm-toggle]')?.click()}
});
window.addEventListener('keydown',e=>{if(e.altKey&&e.shiftKey&&(e.key==='A'||e.key==='a'||e.code==='KeyA')&&dlg){e.preventDefault();dlg.open?dlg.close():dlg.showModal()}});

/* ---------- what's new ---------- */
const WN=[
 ['v6','واجهات تحريرية لكل صفحة داخلية (صور كبيرة، فسيفساء صور حقيقية، خريطة فروع بالإحداثيات الحقيقية)، ومساعد الواجهة في قسم مستقل، وأداة أهلية القبول، ومركزان للبحوث ودليل الطالب، وصفحة «قبل وبعد»، و«خطتي»، وإعدادات القراءة.'],
 ['v5','لوحة أوامر Ctrl+K، تخصيص الصفحة الرئيسية حسب نوع الزائر، شارات الاستكشاف، بطاقات مشاركة للأخبار، الحفظ للقراءة دون اتصال، مطابقة مواعيد دورات اللغات، مدقّق الخصومات، أسئلة شائعة تُجاب من نصوص الموقع.'],
 ['v4','فيديو الحرم الرسمي في الواجهة، تكبير شامل للخطوط والمساحات، شريط علوي من سطر واحد، نظام حركة يحترم «تقليل الحركة»، ثيم حسب وقت اليوم، وضع القراءة الهادئة، مختبر الجامعة (تجارب تفاعلية).'],
 ['v3','إصلاح قصّ الواجهة على ويندوز بتكبير 125%، جعل شريط التعليم المستمر قابلاً للنقر بالكامل، تدقيق كل الأزرار والروابط.'],
 ['v2','صفحة التعليم المستمر وبطاقات اللغات، إعادة تصميم تسجيل دورات اللغات، بوابات الطالب والموظف، المتجر والأندية والمجلة، معالج التقديم.'],
 ['v1','إعادة بناء الموقع من المحتوى الحقيقي المحفوظ: البرامج والكليات والأخبار وهيئة التدريس، مع بحث فوري ومساعد تجريبي ووضع داكن ودعم للهاتف.'],
];
function whatsNew(){const d=document.createElement('dialog');d.className='v5-dlg v6-wn';d.setAttribute('aria-label','ما الجديد');
  d.innerHTML=`<div class="v5-dlg-in"><header><h2>ما الجديد في النسخة التجريبية</h2><button class="icon-btn" type="button" data-close aria-label="إغلاق">✕</button></header><div class="v5-dlg-b"><ol class="wn">${WN.map(([v,t],i)=>`<li${i?'':' class="now"'}><span class="wn-v">${v}</span><p>${esc(t)}</p></li>`).join('')}</ol><p class="v5-muted">كل الميزات تعمل في المتصفح فقط، ولا تُرسل أي بيانات. المحتوى من الموقع الرسمي ومصادره مذكورة.</p><div class="v5-dlg-acts"><a class="btn btn-primary" href="${rel('before-after.html')}">شاهد المقارنة قبل وبعد</a></div></div></div>`;
  document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close()});d.addEventListener('close',()=>setTimeout(()=>d.remove(),200));d.showModal()}
document.addEventListener('click',e=>{if(e.target.closest('[data-whatsnew]')){e.preventDefault();whatsNew()}});
/* footer entry points */
const fb=$('footer .ftr-bottom')||$('footer');
if(fb&&!document.documentElement.lang.startsWith('en')){const p=document.createElement('p');p.className='v6-foot';p.innerHTML=`<button type="button" class="v5-tlink" data-whatsnew>✦ ما الجديد في النسخة التجريبية</button><a class="v5-tlink" href="${rel('before-after.html')}">قبل وبعد</a><a class="v5-tlink" href="${rel('lab/plan.html')}">خطتي</a><button type="button" class="v5-tlink" data-a11y-open>إعدادات القراءة</button>`;fb.appendChild(p)}

/* ---------- MY PLAN ---------- */
const P=()=>LS.get('mbz-plan',[]);const has=id=>P().some(x=>x.id===id);
function toggle(it,btn){let L=P();if(has(it.id)){L=L.filter(x=>x.id!==it.id);toast('أُزيل من خطتك')}else{L.unshift({...it,at:Date.now()});toast(`✓ أُضيف إلى <a href="${rel('lab/plan.html')}" style="color:#f0c886">خطتي</a> (${L.length})`)}LS.set('mbz-plan',L);if(btn)mark(btn,has(it.id));$$('[data-plan-id="'+CSS.escape(it.id)+'"]').forEach(b=>mark(b,has(it.id)));count()}
function mark(b,on){b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=on?'في خطتي ✓':'أضف إلى خطتي'}
function planBtn(it,cls=''){const b=document.createElement('button');b.type='button';b.className='v6-plan '+cls;b.dataset.planId=it.id;b.innerHTML='<i aria-hidden="true">＋</i><span></span>';mark(b,has(it.id));b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggle(it,b)});return b}
function count(){}
// college program blocks
$$('main .card[id^="p-"]').forEach(c=>{const h=c.querySelector('h3');if(!h)return;const lv=c.querySelector('.tag')?.textContent||'';c.appendChild(planBtn({id:'prog:'+here+'#'+c.id,k:'prog',t:h.textContent.trim(),m:lv+' · '+($('main h1')?.textContent.trim()||''),u:here+'#'+c.id}))});
// CE register slots
$$('.rg-slot').forEach(s=>{const id=(s.id||'').slice(2);if(!id)return;const t=(s.querySelector('.rg-slot-h small')?.textContent||'')+' — '+(s.querySelector('.rg-slot-h b')?.textContent||'');const dd=[...s.querySelectorAll('.rg-dl div')].map(x=>x.querySelector('dd')?.textContent.trim());
  s.querySelector('.rg-slot-a')?.appendChild(planBtn({id:'ce:'+id,k:'ce',t:t.trim(),m:(dd[0]||'')+' · '+(dd[1]||'')+' · يبدأ '+(dd[2]||''),u:here+'#'+s.id}))});
// articles
if(/^(news\/|magazine\/)/.test(here)){const bar=$('.v5-art');const h1=$('main h1');if(bar&&h1){const d=$('main time')?.textContent.trim()||'';bar.appendChild(planBtn({id:'art:'+here,k:'art',t:h1.textContent.trim(),m:d,u:here},'btn-like'))}}
// calendar events (rendered by lab.js) + schedule list
const hookDyn=()=>{$$('.ev-item[data-s]:not([data-pl])').forEach(ev=>{ev.dataset.pl=1;const t=ev.dataset.t;ev.appendChild(planBtn({id:'ev:'+ev.dataset.s+':'+t.slice(0,40),k:'ev',t,m:ev.querySelector('p')?.textContent.split('·')[0].trim()||'',d:ev.dataset.s,u:'lab/calendar.html'},'sm'))});
  $$('.sf-it:not([data-pl])').forEach(it=>{it.dataset.pl=1;const a=it.querySelector('.sf-go');const id=(a?.getAttribute('href')||'').split('#s-')[1];if(!id)return;it.appendChild(planBtn({id:'ce:'+id,k:'ce',t:it.querySelector('.sf-m b')?.textContent||'',m:it.querySelector('.sf-m span')?.textContent||'',u:'ce/register/'+(a.getAttribute('href').split('/').pop().split('#')[0])+'#s-'+id},'sm'))})};
hookDyn();if($('[data-lab]')){let mq=0;new MutationObserver(()=>{if(mq)return;mq=requestAnimationFrame(()=>{mq=0;hookDyn()})}).observe($('main')||document.body,{childList:true,subtree:true})}
// plan page
if(here==='lab/plan.html'){
  const G=[['prog','البرامج','🎓'],['ce','دورات اللغات','🌍'],['art','المقالات والأخبار','📰'],['ev','المواعيد','📅']];
  const render=()=>{const L=P();$('#pl-empty').hidden=!!L.length;$('#pl-top').hidden=!L.length;
    $('#pl-stats').innerHTML=G.map(([k,n,ic])=>`<div><span aria-hidden="true">${ic}</span><b class="numx">${L.filter(x=>x.k===k).length}</b><small>${n}</small></div>`).join('');
    $('#pl-cols').innerHTML=G.map(([k,n,ic])=>{const xs=L.filter(x=>x.k===k);if(!xs.length)return'';if(k==='ev')xs.sort((a,b)=>(a.d||'').localeCompare(b.d||''));return `<section class="pl-col"><h2>${ic} ${n}</h2><ul>${xs.map(x=>`<li><a href="${esc(rel(x.u))}"><b>${esc(x.t)}</b><small>${esc(x.m||'')}</small></a><button type="button" class="icon-btn" data-rm="${esc(x.id)}" aria-label="إزالة ${esc(x.t)}">✕</button></li>`).join('')}</ul></section>`}).join('')};
  render();
  document.addEventListener('click',e=>{const r=e.target.closest('[data-rm]');if(r){LS.set('mbz-plan',P().filter(x=>x.id!==r.dataset.rm));render()}
    if(e.target.closest('[data-pl-clear]')&&confirm('مسح كل عناصر الخطة؟')){LS.set('mbz-plan',[]);render()}
    if(e.target.closest('[data-pl-copy]')){const L=P();const txt=G.map(([k,n])=>{const xs=L.filter(x=>x.k===k);return xs.length?n+':\n'+xs.map(x=>'• '+x.t+(x.m?' ('+x.m+')':'')+'\n  '+rel(x.u)).join('\n'):''}).filter(Boolean).join('\n\n');navigator.clipboard?.writeText(txt).then(()=>toast('✓ نُسخت الخطة'))}
    if(e.target.closest('[data-pl-ics]')){const ev=P().filter(x=>x.k==='ev'&&/^\d{4}-\d{2}-\d{2}$/.test(x.d||''));if(!ev.length){toast('لا توجد مواعيد بتواريخ في خطتك بعد');return}
      const f=d=>d.replace(/-/g,'');const nx=d=>{const t=new Date(d+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+1);return t.toISOString().slice(0,10)};
      const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MBZUH demo//plan//AR',...ev.flatMap((x,i)=>['BEGIN:VEVENT','UID:plan-'+i+'-'+f(x.d)+'@mbzuh-demo','DTSTAMP:20261006T000000Z','DTSTART;VALUE=DATE:'+f(x.d),'DTEND;VALUE=DATE:'+f(nx(x.d)),'SUMMARY:'+x.t.replace(/[,;]/g,' '),'END:VEVENT']),'END:VCALENDAR'].join('\r\n');
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='mbzuh-plan.ics';a.click()}});
}

/* ---------- BEFORE / AFTER ---------- */
$$('[data-ba]').forEach(b=>{const r=b.querySelector('.ba-range');const set=v=>b.style.setProperty('--p',v+'%');r.addEventListener('input',()=>set(r.value));set(r.value)});
const pres=$('[data-ba-present]');if(pres){const items=$$('.ba-item');let i=0;
  const show=k=>{i=(k+items.length)%items.length;items.forEach((x,j)=>x.classList.toggle('cur',j===i))};
  const exit=()=>{root.classList.remove('ba-present');document.fullscreenElement&&document.exitFullscreen().catch(()=>{});$('.ba-pbar')?.remove()};
  pres.addEventListener('click',()=>{root.classList.add('ba-present');show(0);document.documentElement.requestFullscreen?.().catch(()=>{});
    const bar=document.createElement('div');bar.className='ba-pbar';bar.innerHTML='<button type="button" data-k="1" aria-label="السابق">→</button><span></span><button type="button" data-k="-1" aria-label="التالي">←</button><button type="button" data-x aria-label="خروج من وضع العرض">✕</button>';document.body.appendChild(bar);
    const upd=()=>bar.querySelector('span').textContent=(i+1)+' / '+items.length;upd();
    bar.addEventListener('click',e=>{const k=e.target.closest('[data-k]');if(k){show(i-(+k.dataset.k));upd()}if(e.target.closest('[data-x]'))exit()});
    const key=e=>{if(!root.classList.contains('ba-present')){removeEventListener('keydown',key);return}if(e.key==='ArrowLeft'){show(i+1);upd()}if(e.key==='ArrowRight'){show(i-1);upd()}if(e.key==='Escape')exit();
      const r=items[i].querySelector('.ba-range');if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();r.value=Math.max(0,Math.min(100,+r.value+(e.key==='ArrowUp'?10:-10)));r.dispatchEvent(new Event('input'))}};
    addEventListener('keydown',key)});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&root.classList.contains('ba-present'))exit()});
}

/* ---------- CONTACT MAP ---------- */
const mp=$('#mp');if(mp){const brs=$$('.ct-br');const bs=$('#branches');if(bs&&brs.length){bs.hidden=true;bs.id='branches-list';mp.parentElement.id='branches'}const card=$('#mp-card');
  const pick=k=>{$$('.mp-pin',mp).forEach(p=>p.setAttribute('aria-pressed',p.dataset.b==k));const b=brs[k];if(!b){card.innerHTML='';return}
    const c=b.cloneNode(true);c.classList.remove('reveal');c.classList.add('mp-br');card.replaceChildren(c);
    if(!still())card.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'})};
  mp.addEventListener('click',e=>{const p=e.target.closest('.mp-pin');if(p)pick(p.dataset.b)});pick(0);
}

/* ---------- ADMISSION CHECKER ---------- */
const ed=$('#el-data');if(ed){const D=JSON.parse(ed.textContent);const sel=$('#el-t'),rng=$('#el-v'),out=$('#el-o'),res=$('#el-res');
  const pts=d=>{const n=+d.toFixed(1);const s=String(n);return n===1?'نقطة واحدة':n===2?'نقطتين':Number.isInteger(n)&&n>=3&&n<=10?s+' نقاط':s+' نقطة'};
  const run=()=>{const r=D.rows[+sel.value];const v=+rng.value;out.textContent=v+'%';rng.disabled=r.min==null;$('.el-range').classList.toggle('off',r.min==null);
    rng.style.setProperty('--f',((v-50)/50*100)+'%');if(r.min!=null)rng.style.setProperty('--m',((r.min-50)/50*100)+'%');
    if(r.min==null){res.className='el-res info';res.innerHTML=`<b>الشرط لهذا النظام:</b><p>${esc(r.req)}</p>`;return}
    const ok=v>=r.min;res.className='el-res '+(ok?'ok':'no');
    res.innerHTML=ok?`<span class="el-ic">✓</span><div><b>معدلك يستوفي الحد الأدنى (${r.min}%)</b><p>${esc(r.t)}: «${esc(r.req)}». تبقى بقية الشروط: اللغة العربية والمقابلة الشخصية.</p><a class="btn btn-primary" href="apply.html">ابدأ طلبك (تجريبي)</a></div>`
      :`<span class="el-ic">!</span><div><b>أقل من الحد الأدنى بفارق ${pts(r.min-v)}</b><p>الحد الأدنى لـ${esc(r.t)} هو ${r.min}%. ينص الموقع على مؤهلات خاصة لغير المستوفين شرط النسبة:</p><ul>${D.spec.map(s=>`<li><b>${esc(s.c)}:</b> ${esc(s.q)}</li>`).join('')}</ul></div>`};
  sel.addEventListener('change',run);rng.addEventListener('input',run);run()}

/* ---------- FACULTY distribution ---------- */
const chips=$$('#fdir [data-fc]').filter(c=>c.dataset.fc);if(chips.length){
  const data=chips.map(c=>({c,n:+c.querySelector('small')?.textContent||0,t:c.childNodes[0].textContent.trim()}));const tot=data.reduce((a,b)=>a+b.n,0);
  const col=['#9a6f2c','#1d6152','#6e2f5c','#2c5a85'];let acc=0;const R=52,C=2*Math.PI*R;
  const segs=data.map((d,i)=>{const len=d.n/tot*C;const s=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${col[i]}" stroke-width="22" stroke-dasharray="${len.toFixed(1)} ${(C-len).toFixed(1)}" stroke-dashoffset="${(-acc).toFixed(1)}" data-i="${i}"/>`;acc+=len;return s}).join('');
  const box=document.createElement('div');box.className='fd-dist reveal in';
  box.innerHTML=`<svg viewBox="0 0 140 140" aria-hidden="true"><g transform="rotate(-90 70 70)">${segs}</g><text x="70" y="66" text-anchor="middle" class="fd-n">${tot}</text><text x="70" y="86" text-anchor="middle" class="fd-l">عضواً</text></svg><div class="fd-leg"><b>توزيع أعضاء هيئة التدريس على الكليات</b>${data.map((d,i)=>`<button type="button" data-di="${i}" style="--c:${col[i]}"><i></i><span>${esc(d.t)}</span><b class="numx">${d.n}</b><small>${Math.round(d.n/tot*100)}%</small></button>`).join('')}<small class="fd-src">محسوب من صفحات الكليات الأربع على الموقع الرسمي.</small></div>`;
  $('#fdir .fdir-bar')?.after(box);
  box.addEventListener('click',e=>{const b=e.target.closest('[data-di]');if(!b)return;const c=data[+b.dataset.di].c;(c.getAttribute('aria-pressed')==='true'?$('#fdir [data-fc=""]'):c).click();box.querySelectorAll('[data-di]').forEach(x=>x.classList.toggle('on',x===b&&c.getAttribute('aria-pressed')==='true'));$('#fd-list')?.scrollIntoView({behavior:still()?'auto':'smooth',block:'start'})});
  box.addEventListener('mouseover',e=>{const b=e.target.closest('[data-di]');box.querySelectorAll('circle').forEach(c=>c.classList.toggle('dim',!!b&&c.dataset.i!==b.dataset.di))});box.addEventListener('mouseleave',()=>box.querySelectorAll('circle').forEach(c=>c.classList.remove('dim')));
}

/* ---------- NEWS topics (derived from real article texts) ---------- */
const items=$$('#newsroom [data-news]');if(items.length>3){
  const STOP=new Set('جامعه محمد زايد للعلوم الانسانيه في من على الى إلى عن مع التي الذي هذه هذا ذلك وذلك كما او أو بين حول خلال عبر بعد قبل كل وقد قد تم إلى ضمن لدى عند بن ان أن التى والتي حيث ايضا كان كانت يوم اليوم الجامعه وال لل ما'.split(' ').map(norm));
  const strip=w=>w.replace(/^(وال|بال|لل|فال|كال)/,'ال');
  const disp=new Map();
  const toks=t=>{const out=new Set();String(t).replace(/[^\u0621-\u064Aa-zA-Z\s]/g,' ').split(/\s+/).forEach(w=>{if(w.length<4)return;const o=strip(w);const k=norm(o);if(k.length<4||STOP.has(k))return;out.add(k);const m=disp.get(k)||new Map();m.set(o,(m.get(o)||0)+1);disp.set(k,m)});return [...out]};
  const show=k=>{const m=disp.get(k);return m?[...m].sort((a,b)=>b[1]-a[1])[0][0]:k};
  const df=new Map();items.forEach(it=>{it._t=toks(it.dataset.news);it._t.forEach(w=>df.set(w,(df.get(w)||0)+1))});
  const top=[...df].filter(([w,n])=>n>=2&&n<items.length).sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).slice(0,10);
  if(top.length){const box=document.createElement('div');box.className='nw-topics reveal in';box.innerHTML=`<span class="nw-tl">موضوعات من الأخبار:</span>${top.map(([w,n])=>`<button type="button" class="chip" data-topic="${esc(w)}" aria-pressed="false">${esc(show(w))} <span class="numx">${n}</span></button>`).join('')}<small>مستخرجة آلياً من نصوص الأخبار الحقيقية</small>`;
    $('#newsroom .nw-tools')?.after(box);
    box.addEventListener('click',e=>{const b=e.target.closest('[data-topic]');if(!b)return;const on=b.getAttribute('aria-pressed')!=='true';box.querySelectorAll('[data-topic]').forEach(x=>x.setAttribute('aria-pressed',x===b&&on));
      items.forEach(it=>it.classList.toggle('v6-off',on&&!it._t.includes(b.dataset.topic)))})}}

/* ---------- QUOTE cards from selected text (welcome pages + articles) ---------- */
const qzone=$('main .lt-body, main #na-text, main article.ar')||( /^welcome-/.test(here)?$('main'):null);
if(qzone&&window.mbzShareCard){let qb=null;const hide=()=>{qb&&qb.remove();qb=null};
  document.addEventListener('selectionchange',()=>{clearTimeout(qzone._t);qzone._t=setTimeout(()=>{const s=getSelection();const t=s.toString().trim();if(!t||t.length<20||t.length>320||!qzone.contains(s.anchorNode)){hide();return}
    const r=s.getRangeAt(0).getBoundingClientRect();if(!qb){qb=document.createElement('button');qb.type='button';qb.className='v6-qbtn';qb.innerHTML='❝ بطاقة اقتباس';document.body.appendChild(qb);
      qb.addEventListener('mousedown',e=>e.preventDefault());qb.addEventListener('click',()=>{const txt='«'+getSelection().toString().trim()+'»';const img=$('main img[src*="assets/img"]');const who=(/^welcome-/.test(here)?($('main .lt-id b')?.textContent.trim()):'')||$('main h1')?.textContent.trim().slice(0,60)||'';window.mbzShareCard(txt,img,who);hide()})}
    qb.style.top=(r.top+scrollY-48)+'px';qb.style.left=Math.max(8,Math.min(innerWidth-170,r.left+r.width/2-80))+'px'},250)});
  if(/^welcome-/.test(here)){const h=document.createElement('p');h.className='v6-qhint';h.innerHTML='💡 حدّد أي جملة من الكلمة لتصنع منها بطاقة اقتباس قابلة للمشاركة.';(qzone.querySelector('p')||qzone).before(h)}
}
})();
/* v7: header fit safety net — if nav items would touch the tools/brand, tighten; then drop the header CTA */
(()=>{const H=document.documentElement,mq=matchMedia('(min-width:1280px)');let raf=0;
function over(){const ul=document.querySelector('.nav>ul'),t=document.querySelector('.hdr .tools'),b=document.querySelector('.hdr .brand');if(!ul||!t||!b)return false;
const lis=[...ul.children].map(l=>l.getBoundingClientRect()).filter(r=>r.width>0);if(!lis.length)return false;
const L=Math.min(...lis.map(r=>r.left)),R=Math.max(...lis.map(r=>r.right)),tr=t.getBoundingClientRect(),br=b.getBoundingClientRect(),rtl=getComputedStyle(H).direction==='rtl';
return rtl?(L<tr.right+6||R>br.left-6):(R>tr.left-6||L<br.right+6)}
function fit(){raf=0;H.classList.remove('hdr-t1','hdr-t2');if(!mq.matches)return;if(over()){H.classList.add('hdr-t1');if(over())H.classList.add('hdr-t2')}}
const go=()=>{if(!raf)raf=requestAnimationFrame(fit)};
addEventListener('resize',go,{passive:true});mq.addEventListener&&mq.addEventListener('change',go);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();addEventListener('load',go);})();
