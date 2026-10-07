/* Lab experiences — all client-side, no network requests */
(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const sec=$('[data-lab]');if(!sec)return;
  const kind=sec.dataset.lab;
  let D={};try{D=JSON.parse($('#lab-data').textContent||'{}')}catch(e){}
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('calm');
  const norm=s=>(s||'').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  const toast=m=>{let t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)};
  const dl=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
  const MAR=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  /* ---------- calligraphy ---------- */
  if(kind==='calligraphy'){
    const inp=$('#cg-name'),out=$('#cg-out'),card=$('#cg-card');
    const st=()=>$('input[name=cg-style]:checked'),pl=()=>$('input[name=cg-pal]:checked');
    const render=(anim=true)=>{const name=inp.value.trim()||'اسمك';out.textContent=name;out.style.fontFamily=st().dataset.font+',serif';
      out.style.fontWeight=st().value==='naskh'||st().value==='ruqaa'?700:600;
      card.style.setProperty('--cbg',pl().dataset.bg);card.style.setProperty('--cfg',pl().dataset.fg);card.classList.toggle('light',pl().value==='ink');
      if(anim&&!still()){out.classList.remove('draw');void out.offsetWidth;out.classList.add('draw')}
      try{localStorage.setItem('mbz-cg',JSON.stringify({n:inp.value,s:st().value,p:pl().value}))}catch(e){}};
    try{const s=JSON.parse(localStorage.getItem('mbz-cg')||'null');if(s){inp.value=s.n||inp.value;const a=$(`input[name=cg-style][value=${s.s}]`);a&&(a.checked=true);const b=$(`input[name=cg-pal][value=${s.p}]`);b&&(b.checked=true)}}catch(e){}
    let tm;inp.addEventListener('input',()=>{clearTimeout(tm);tm=setTimeout(()=>render(true),350)});
    $$('input[name=cg-style],input[name=cg-pal]').forEach(r=>r.addEventListener('change',()=>render(true)));
    $('#cg-replay').addEventListener('click',()=>render(true));
    const logo=new Image();logo.src=$('.cg-brand img').src;
    const makePng=async()=>{const W=1600,H=900,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
      const bg=pl().dataset.bg,fg=pl().dataset.fg,font=st().dataset.font.replace(/'/g,'');
      await document.fonts.load(`700 120px "${font}"`).catch(()=>{});
      const g=x.createRadialGradient(W/2,H*.4,50,W/2,H/2,W*.7);g.addColorStop(0,bg);g.addColorStop(1,bg);x.fillStyle=g;x.fillRect(0,0,W,H);
      x.globalAlpha=.07;x.strokeStyle=fg;x.lineWidth=2;for(let i=0;i<14;i++){x.beginPath();x.arc(W/2,H/2,60+i*55,0,Math.PI*2);x.stroke()}x.globalAlpha=1;
      x.strokeStyle=fg;x.globalAlpha=.5;x.lineWidth=3;x.strokeRect(40,40,W-80,H-80);x.globalAlpha=1;
      const name=inp.value.trim()||'اسمك';x.fillStyle=fg;x.textAlign='center';x.textBaseline='middle';x.direction='rtl';
      let fs=240;do{x.font=`700 ${fs}px "${font}", serif`;fs-=10}while(x.measureText(name).width>W-260&&fs>60);
      x.shadowColor='rgba(0,0,0,.25)';x.shadowBlur=30;x.fillText(name,W/2,H/2-30);x.shadowBlur=0;
      x.font='600 30px "IBM Plex Sans Arabic", sans-serif';x.globalAlpha=.85;x.fillText('جامعة محمد بن زايد للعلوم الإنسانية',W/2,H-150);
      x.font='500 22px "IBM Plex Sans Arabic", sans-serif';x.globalAlpha=.6;x.fillText('بطاقة من «مختبر الجامعة» · نسخة تجريبية',W/2,H-105);x.globalAlpha=1;
      try{if(logo.complete&&logo.naturalWidth){const lw=260,lh=lw*logo.naturalHeight/logo.naturalWidth;x.save();if(pl().value!=='ink'){x.filter='brightness(0) invert(1)'}x.drawImage(logo,(W-lw)/2,80,lw,lh);x.restore()}}catch(e){}
      return new Promise(r=>c.toBlob(r,'image/png'))};
    $('#cg-dl').addEventListener('click',async()=>{const b=await makePng();dl(b,`mbzuh-name-${Date.now()}.png`);toast('تم تنزيل البطاقة')});
    if(navigator.canShare){const sh=$('#cg-share');sh.hidden=false;sh.addEventListener('click',async()=>{const b=await makePng();const f=new File([b],'mbzuh-name.png',{type:'image/png'});if(navigator.canShare({files:[f]}))navigator.share({files:[f],title:'اسمي بالخط العربي'}).catch(()=>{})})}
    document.fonts.ready.then(()=>render(true));
  }

  /* ---------- quiz ---------- */
  if(kind==='quiz'){
    const Q=D.q,P=D.p.map(p=>({...p,k:norm(p.n+' '+p.o)})),C=D.c;let i=0;const picks=[];
    const stage=$('#qz-stage'),res=$('#qz-res');
    const show=()=>{$('#qz-step').textContent=`السؤال ${i+1} من ${Q.length}`;$('#qz-bar').style.width=(i/Q.length*100)+'%';
      const [q,ans]=Q[i];stage.innerHTML=`<div class="qz-q"><h2>${esc(q)}</h2><div class="qz-ans">${ans.map((a,j)=>`<button type="button" data-j="${j}"><b>${'أبجد'[j]}</b>${esc(a[0])}</button>`).join('')}</div>${i?'<button type="button" class="btn btn-ghost" id="qz-back" style="margin-top:1rem">→ السؤال السابق</button>':''}</div>`;
      $$('.qz-ans button',stage).forEach(b=>b.addEventListener('click',()=>{picks[i]=Q[i][1][+b.dataset.j][1];i++;i<Q.length?show():result()}));
      const bk=$('#qz-back');bk&&bk.addEventListener('click',()=>{i--;show()});const f=$('.qz-ans button',stage);f&&f.focus({preventScroll:true})};
    const result=()=>{$('#qz-bar').style.width='100%';$('#qz-step').textContent='النتيجة';
      const sc=P.map(p=>{let s=0;picks.flat().forEach(k=>{if(k[0]==='@'){if(p.l===k.slice(1))s+=2}else if(p.k.includes(norm(k)))s+=1});return {...p,s}});
      const lvl=(picks[3]||[]).find(k=>k[0]==='@');const pool=sc.filter(p=>!lvl||p.l===lvl.slice(1));
      const byC={};(pool.length?pool:sc).forEach(p=>{byC[p.cs]=(byC[p.cs]||0)+p.s});
      const tot=Object.values(byC).reduce((a,b)=>a+b,0)||1;const ranked=Object.entries(byC).sort((a,b)=>b[1]-a[1]);
      const top=ranked[0][0],col=C.find(c=>c.s===top)||{n:''};const progs=(pool.length?pool:sc).filter(p=>p.cs===top).sort((a,b)=>b.s-a.s).slice(0,3);
      const url=location.origin+location.pathname+'?r='+top;
      stage.innerHTML='';res.hidden=false;res.innerHTML=`<span class="kicker">شخصيتك الأكاديمية</span><h2>${esc(col.n)}</h2><p>بناءً على إجاباتك، تبدو اهتماماتك الأقرب إلى هذه الكلية. هذه البرامج الحقيقية تستحق نظرة:</p>
        <ul class="qz-progs">${progs.map(p=>`<li><a href="../${esc(p.u)}">${esc(p.n)}<small>${esc(p.ll)} · ${esc(p.c)}</small></a></li>`).join('')}</ul>
        <div class="qz-meter" aria-label="مدى التوافق مع كل كلية">${ranked.map(([s,v])=>{const c=C.find(x=>x.s===s);return `<div><span>${esc(c?c.n:s)}</span><i style="--w:${Math.round(v/tot*100)}%"></i><b>${Math.round(v/tot*100)}%</b></div>`}).join('')}</div>
        <div class="cg-acts"><button class="btn btn-primary" type="button" id="qz-share">شارك نتيجتك</button><button class="btn btn-ghost" type="button" id="qz-again">أعد الاختبار</button><a class="btn btn-ghost" href="../apply.html">ابدأ التقديم التجريبي</a></div>`;
      res.focus({preventScroll:false});
      $('#qz-again').addEventListener('click',()=>{i=0;picks.length=0;res.hidden=true;show()});
      $('#qz-share').addEventListener('click',async()=>{const t=`نتيجتي في اختبار الشخصية الأكاديمية: ${col.n} — جامعة محمد بن زايد للعلوم الإنسانية (نسخة تجريبية)`;
        if(navigator.share){navigator.share({title:'شخصيتي الأكاديمية',text:t,url}).catch(()=>{})}else{try{await navigator.clipboard.writeText(t+' '+url);toast('تم نسخ النتيجة والرابط')}catch(e){toast(t)}}})};
    show();
  }

  /* ---------- day at the university ---------- */
  if(kind==='day'){
    const pick=$('#dy-pick'),story=$('#dy-story'),scene=$('#dy-scene'),steps=$('#dy-steps');let S=[],k=0;
    const rnd=(a,n)=>a.slice().sort(()=>Math.random()-.5).slice(0,n);
    const build=cs=>{const col=D.c.find(c=>c.s===cs),pr=D.p.filter(p=>p.cs===cs);const p=pr[Math.floor(Math.random()*pr.length)]||D.p[0];
      const bk=rnd(D.b,3),f=rnd(D.f.filter(x=>!/مكتبة/.test(x.n)),1)[0]||D.f[0],lib=D.f.find(x=>/مكتبة/.test(x.n)),cl=rnd(D.cl,1)[0],nw=D.n[0];
      S=[{s:'الوصول',k:'صباح الخير',h:`أهلاً بك في ${col.n}`,p:'تبدأ يومك في الحرم الجامعي. الكلية التي اخترتها تضم هذه البرامج:',ul:pr.map(x=>x.n+' ('+x.ll+')'),img:col.img},
        {s:'المحاضرة',k:'محاضرة اليوم',h:p.n,p:(p.o||'').slice(0,420)+(p.o&&p.o.length>420?'…':''),a:['../'+p.u,'صفحة البرنامج'],img:col.img},
        {s:'المكتبة',k:lib?lib.n:'المكتبة',h:'استراحة بين الرفوف',p:'من إصدارات الجامعة الحقيقية، تلتقط ثلاثة كتب:',ul:bk.map(b=>b.t),img:lib?lib.img:(bk[0]&&bk[0].img),a:['bookshelf.html','افتح رفّ الإصدارات ثلاثي الأبعاد']},
        {s:'المرافق',k:'في الحرم',h:f?f.n:'مرافق الحرم',p:'من مرافق الحرم الجامعي التسعة كما تعرضها صفحة الحياة الجامعية.',img:f&&f.img,a:['tour.html','ابدأ الجولة الافتراضية']},
        {s:'النادي',k:'نشاط طلابي',h:cl?cl.n:'الأندية الطلابية',p:cl?cl.d+(cl.sup?' — المشرف: '+cl.sup:''):'',a:cl?['../clubs/'+cl.id+'.html','صفحة النادي']:null,ic:true},
        {s:'قبل المغادرة',k:'من أخبار الجامعة',h:nw?nw.t:'',p:nw?('نُشر في '+nw.d):'',img:nw&&nw.img,a:nw?[nw.u,'اقرأ الخبر']:null}];
      steps.innerHTML=S.map((x,j)=>`<li>${esc(x.s)}</li>`).join('');k=0;show()};
    const show=()=>{const x=S[k];$$('li',steps).forEach((l,j)=>l.classList.toggle('on',j<=k));
      scene.style.animation='none';void scene.offsetWidth;scene.style.animation='';
      scene.innerHTML=`${x.img?`<img src="${esc(x.img)}" alt="" loading="lazy">`:`<div class="dy-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 21s-7-4.4-9.3-9A5.3 5.3 0 0 1 12 6a5.3 5.3 0 0 1 9.3 6c-2.3 4.6-9.3 9-9.3 9z"/></svg></div>`}<div><span class="kicker">${esc(x.k)}</span><h3>${esc(x.h)}</h3><p>${esc(x.p)}</p>${x.ul?`<ul>${x.ul.map(u=>`<li>${esc(u)}</li>`).join('')}</ul>`:''}${x.a?`<a class="btn btn-ghost" href="${esc(x.a[0])}">${esc(x.a[1])} ←</a>`:''}</div>`;
      $('#dy-prev').disabled=k===0;$('#dy-next').textContent=k===S.length-1?'ابدأ يوماً جديداً ↺':'التالي ←'};
    $$('.dy-col').forEach(b=>b.addEventListener('click',()=>{pick.hidden=true;story.hidden=false;build(b.dataset.col);story.scrollIntoView({block:'start',behavior:still()?'auto':'smooth'})}));
    $('#dy-next').addEventListener('click',()=>{if(k<S.length-1){k++;show()}else{story.hidden=true;pick.hidden=false}});
    $('#dy-prev').addEventListener('click',()=>{if(k>0){k--;show()}});
  }

  /* ---------- 3D bookshelf ---------- */
  if(kind==='bookshelf'){
    const B=D.b,ring=$('#bs-ring'),scene=$('#bs-scene'),dlg=$('#bs-dlg');const N=B.length;
    const COLORS={extreme:'#5b2a2a',society:'#2c4a3e',heritage:'#7a5520',religion:'#2c3b5a',lang:'#5a2c4f',default:'#3b3b3b'};
    const pal=['#7a3b2e','#2c4a3e','#6b4f1c','#2c3b5a','#5a2c4f','#1d6152','#6e2f5c','#3f4a2c'];
    let R=Math.max(380,N*64/(2*Math.PI)*1.15);
    ring.innerHTML=B.map((b,i)=>`<button class="bs-book" type="button" role="listitem" data-i="${i}" aria-label="${esc(b.t)}" style="--bc:${pal[i%pal.length]};transform:rotateY(${i*360/N}deg) translateZ(${R}px)"><span class="bs-spine">${esc(b.t)}</span></button>`).join('');
    let rot=0;const books=[...ring.children];const apply=()=>{ring.style.transform=`translateZ(${-R}px) rotateY(${rot}deg)`;books.forEach((b,i)=>{const a=(i*360/N+rot)*Math.PI/180;b.classList.toggle('back',Math.cos(a)<.35||Math.abs(Math.sin(a))*R>scene.clientWidth/2-24)})};apply();
    const step=360/N;$('#bs-l').addEventListener('click',()=>{rot+=step*3;apply()});$('#bs-r').addEventListener('click',()=>{rot-=step*3;apply()});
    let dragging=false,sx=0,sr=0,moved=false;
    scene.addEventListener('pointerdown',e=>{dragging=true;moved=false;sx=e.clientX;sr=rot;ring.style.transition='none'});
    addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;rot=sr+dx*.25;apply()});
    addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;ring.style.transition=''});
    scene.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){rot-=step;apply()}if(e.key==='ArrowRight'){rot+=step;apply()}});
    if(!still()){let auto=setInterval(()=>{if(!dragging&&!dlg.open){rot-=.15;ring.style.transition='none';apply()}},40);scene.addEventListener('pointerdown',()=>clearInterval(auto),{once:true});$('#bs-q').addEventListener('focus',()=>clearInterval(auto),{once:true})}
    $('#bs-q').addEventListener('input',e=>{const q=norm(e.target.value.trim());let first=-1;$$('.bs-book',ring).forEach((b,i)=>{const hit=!q||norm(B[i].t+' '+B[i].tl).includes(q);b.classList.toggle('dim',!hit);if(hit&&first<0&&q)first=i});if(first>=0){rot=-first*step;ring.style.transition='';apply()}});
    let cur=null,pg=0,pages=[];
    const open=i=>{cur=B[i];$('#bs-img').src=cur.img;$('#bs-img').alt='غلاف: '+cur.t;$('#bs-t').textContent=cur.t;$('#bs-tl').textContent=cur.tl||'إصدار';$('#bs-d').textContent=(cur.d[0]||'').slice(0,360)+((cur.d[0]||'').length>360?'…':'');const u=$('#bs-u');if(cur.u){u.href=cur.u;u.hidden=false}else u.hidden=true;$('#bs-reader').hidden=true;dlg.showModal()};
    ring.addEventListener('click',e=>{const b=e.target.closest('.bs-book');if(!b||moved)return;const i=+b.dataset.i;rot=-i*step;ring.style.transition='';apply();setTimeout(()=>open(i),still()?0:350)});
    $$('[data-close]',dlg).forEach(b=>b.addEventListener('click',()=>dlg.close()));dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
    const showPg=()=>{$('#bs-pages').innerHTML=`<div class="bs-page">${esc(pages[pg])}</div>`;$('#bs-pn').textContent=`${pg+1} / ${pages.length}`;$('#bs-pp').disabled=pg===0;$('#bs-np').disabled=pg>=pages.length-1};
    $('#bs-read').addEventListener('click',()=>{const txt=(cur.d||[]).join(' ');const w=txt.split(/\s+/);pages=[];for(let j=0;j<w.length;j+=70)pages.push(w.slice(j,j+70).join(' '));if(!pages.length)pages=['لا يتوفر وصف منشور لهذا الإصدار.'];pg=0;$('#bs-reader').hidden=false;showPg();$('#bs-reader').scrollIntoView({block:'nearest'})});
    $('#bs-np').addEventListener('click',()=>{if(pg<pages.length-1){pg++;showPg()}});$('#bs-pp').addEventListener('click',()=>{if(pg>0){pg--;showPg()}});
  }

  /* ---------- virtual tour ---------- */
  if(kind==='tour'){
    const F=D.f||[],img=$('#tr-img'),spots=$('#tr-spots'),cap=$('#tr-cap'),th=$('#tr-thumbs');let cur=0;
    const GEN=[['المبنى','تفاصيل المبنى كما تظهر في الصورة'],['المدخل','نقطة الدخول إلى المرفق'],['المساحة الداخلية','استكشف المساحة'],['الإطلالة','زاوية مختلفة للمكان']];
    const POS=[[22,42],[64,58],[45,28],[78,34]];
    th.innerHTML=F.map((f,i)=>`<button type="button" role="tab" aria-selected="${i===0}" data-i="${i}"><img src="${esc(f.img)}" alt="" loading="lazy"><span>${esc(f.n)}</span></button>`).join('');
    const go=i=>{cur=i;const f=F[i];img.style.animation='none';void img.offsetWidth;img.style.animation='';img.src=f.img;img.alt=f.n;cap.textContent=f.n;
      $$('button',th).forEach((b,j)=>b.setAttribute('aria-selected',j===i));
      spots.innerHTML=POS.slice(0,3).map((p,j)=>`<button type="button" class="tr-spot" style="right:${p[0]}%;top:${p[1]}%" aria-label="${esc(GEN[(i+j)%GEN.length][0])}">${j+1}</button>`).join('');
      $$('.tr-spot',spots).forEach((s,j)=>{const show=()=>{$$('.tr-tip',spots).forEach(t=>t.remove());const t=document.createElement('div');t.className='tr-tip';t.style.right=s.style.right;t.style.top=s.style.top;const g=GEN[(i+j)%GEN.length];t.innerHTML=`<b>${esc(g[0])}</b><br>${esc(g[1])} — ${esc(f.n)}`;spots.appendChild(t)};s.addEventListener('mouseenter',show);s.addEventListener('focus',show);s.addEventListener('click',()=>{const n=(cur+1)%F.length;go(n)})})};
    th.addEventListener('click',e=>{const b=e.target.closest('button');b&&go(+b.dataset.i)});
    addEventListener('keydown',e=>{if(e.target.closest('input,textarea'))return;if(e.key==='ArrowLeft')go((cur+1)%F.length);if(e.key==='ArrowRight')go((cur-1+F.length)%F.length)});
    if(F.length)go(0);
  }

  /* ---------- journey ---------- */
  if(kind==='journey'){
    const st=$$('.jr-st'),fill=$('#jr-fill'),jr=$('.jr');
    if(still()){st.forEach(s=>s.classList.add('on'));fill.style.setProperty('--jp','100%')}
    else{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{rootMargin:'0px 0px -25% 0px'});st.forEach(s=>io.observe(s));
      const upd=()=>{const r=jr.getBoundingClientRect();const p=Math.min(1,Math.max(0,(innerHeight*.7-r.top)/r.height));fill.style.setProperty('--jp',(p*100).toFixed(1)+'%')};addEventListener('scroll',upd,{passive:true});upd()}
  }

  /* ---------- compare ---------- */
  if(kind==='compare'){
    const P=D.p,sel=$$('[data-cp]'),out=$('#cp-table');
    const q=new URLSearchParams(location.search).get('p');if(q)q.split(',').forEach((v,i)=>{if(sel[i])sel[i].value=v});else{sel[0].value='0';sel[1].value=String(Math.min(4,P.length-1))}
    const draw=()=>{const ch=sel.map(s=>s.value).filter(v=>v!=='').map(v=>P[+v]);
      if(ch.length<2){out.innerHTML='<p class="cp-empty">اختر برنامجين على الأقل للمقارنة.</p>';return}
      const same=k=>ch.every(p=>p[k]===ch[0][k]);
      out.innerHTML=`<div class="cp-cols" style="--n:${ch.length}">${ch.map(p=>`<article class="cp-col"><h3>${esc(p.n)}</h3><div class="cp-row"><b>المستوى</b><span class="${same('l')?'cp-same':''}">${esc(p.ll)}</span></div><div class="cp-row"><b>الكلية</b><span class="${same('cs')?'cp-same':''}">${esc(p.c)}</span></div><p>${esc((p.o||'لا يتوفر وصف منشور.').slice(0,600))}${(p.o||'').length>600?'…':''}</p><a class="btn btn-ghost" href="../${esc(p.u)}">صفحة البرنامج ←</a></article>`).join('')}</div>`;
      history.replaceState(null,'','?p='+sel.map(s=>s.value).filter(v=>v!=='').join(','))};
    sel.forEach(s=>s.addEventListener('change',draw));draw();
  }

  /* ---------- calendar + .ics ---------- */
  if(kind==='calendar'){
    const EV=D.e,list=$('#ev-list');let k='';const today=new Date().toISOString().slice(0,10);
    const ics=evs=>{const d=s=>s.replace(/-/g,'');const add=s=>{const t=new Date(s+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+1);return t.toISOString().slice(0,10).replace(/-/g,'')};
      const fold=s=>s.replace(/[,;\\]/g,m=>'\\'+m).replace(/\n/g,' ');
      return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MBZUH Demo//Lab//AR','CALSCALE:GREGORIAN',...evs.flatMap((e,i)=>['BEGIN:VEVENT',`UID:mbzuh-demo-${e.s}-${i}@demo`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').slice(0,15)}Z`,`DTSTART;VALUE=DATE:${d(e.s)}`,`DTEND;VALUE=DATE:${add(e.e)}`,`SUMMARY:${fold(e.t.slice(0,180))}`,`DESCRIPTION:${fold(e.src+' — '+e.d)}`,'END:VEVENT']),'END:VCALENDAR'].join('\r\n')};
    const draw=()=>{const ev=EV.filter(e=>!k||e.k===k);let g='',h='';ev.forEach((e,i)=>{if(e.g!==g){g=e.g;h+=`<h2 class="ev-grp">${esc(g)}</h2>`}const dt=new Date(e.s+'T00:00:00');
      h+=`<div class="ev-item ${e.k}${e.e<today?' past':''}" data-s="${esc(e.s)}" data-t="${esc(e.t)}" style="animation-delay:${Math.min(i,12)*40}ms"><span class="ev-date"><b>${dt.getDate()}</b><small>${MAR[dt.getMonth()]} ${dt.getFullYear()}</small></span><div><h3>${esc(e.t)}</h3><p>${esc(e.d)}${e.s!==e.e?' (حتى '+esc(e.e)+')':''} · <a href="${esc(e.u)}">${esc(e.src.slice(0,140))}</a></p></div><button class="btn btn-ghost" type="button" data-ics="${EV.indexOf(e)}">أضف إلى التقويم</button></div>`});list.innerHTML=h||'<p class="cp-empty">لا مواعيد.</p>'};
    list.addEventListener('click',e=>{const b=e.target.closest('[data-ics]');if(!b)return;const ev=EV[+b.dataset.ics];dl(new Blob([ics([ev])],{type:'text/calendar'}),`mbzuh-${ev.s}.ics`);toast('تم تنزيل ملف التقويم')});
    $('#ev-all').addEventListener('click',()=>{dl(new Blob([ics(EV.filter(e=>!k||e.k===k))],{type:'text/calendar'}),'mbzuh-calendar.ics');toast('تم تنزيل كل المواعيد')});
    $$('[data-evk]').forEach(b=>b.addEventListener('click',()=>{k=b.dataset.evk;$$('[data-evk]').forEach(x=>x.classList.toggle('on',x===b));draw()}));draw();
  }

  /* ---------- community wall ---------- */
  if(kind==='wall'){
    const C=D.c,cols=$('#wl-cols');let k='';
    const card=(c,dup)=>`<a class="wl-card ${c.k}${dup?' dup':''}" href="${esc(c.u)}"${dup?' tabindex="-1" aria-hidden="true"':''}>${c.img&&c.k!=='quote'?`<img src="${esc(c.img)}" alt="" loading="lazy">`:''}${c.k==='quote'&&c.img?`<img src="${esc(c.img)}" alt="" loading="lazy">`:''}<div><span class="wl-k">${esc(c.kl)}</span><b>${esc(c.t)}</b><p>${esc(c.x)}</p><small>${esc(c.s)}</small></div></a>`;
    const draw=()=>{const L=C.filter(c=>!k||c.k===k).sort(()=>Math.random()-.5);const n=innerWidth<560?1:innerWidth<900?2:3;const g=Array.from({length:n},()=>[]);L.forEach((c,i)=>g[i%n].push(c));
      cols.innerHTML=g.map((col,i)=>`<div class="wl-col" style="--dur:${50+i*12}s">${col.map(c=>card(c)).join('')}${col.map(c=>card(c,true)).join('')}</div>`).join('')};
    $$('[data-wk]').forEach(b=>b.addEventListener('click',()=>{k=b.dataset.wk;$$('[data-wk]').forEach(x=>x.classList.toggle('on',x===b));draw()}));
    const pz=$('#wl-pause');pz.addEventListener('click',()=>{const p=cols.classList.toggle('paused');pz.setAttribute('aria-pressed',p);pz.textContent=p?'▶ تشغيل الحركة':'⏸ إيقاف الحركة'});
    draw();let rw;addEventListener('resize',()=>{clearTimeout(rw);rw=setTimeout(draw,300)});
  }
})();
