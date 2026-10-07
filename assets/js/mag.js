/* University magazine: filters, contributions (localStorage), writing assistant, read-aloud */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();
  const STOP=new Set('في من على الى عن مع هذا هذه التي الذي ان او ما لا كما بين حول ثم قد كان كانت هو هي ذلك تلك عبر ضمن كل بعض غير وقد وهو وهي الا اذا حيث منذ خلال لها له لهم عند كيف لماذا'.split(' '));
  const toks=s=>norm(s).split(' ').filter(w=>w.length>2&&!STOP.has(w));
  const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(e){return d}};
  const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  const md=s=>esc(s).split(/\n{2,}/).map(p=>{p=p.trim();if(!p)return'';if(p.startsWith('## '))return`<h2>${p.slice(3)}</h2>`;if(p.startsWith('&gt; '))return`<blockquote>${p.slice(5)}</blockquote>`;if(/^- /m.test(p))return`<ul>${p.split('\n').map(l=>`<li>${l.replace(/^- /,'')}</li>`).join('')}</ul>`;return`<p>${p.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>')}</p>`}).join('');
  const sents=t=>t.replace(/[#>*-]/g,' ').split(/(?<=[.!؟?])\s+|\n+/).map(s=>s.trim()).filter(s=>s.split(/\s+/).length>=5);
  function extract(t,k){const S=sents(t);if(S.length<=k)return S;const tf={};S.forEach(s=>new Set(toks(s)).forEach(w=>tf[w]=(tf[w]||0)+1));return S.map((s,i)=>{const u=[...new Set(toks(s))];return{s,i,sc:u.reduce((a,w)=>a+Math.log(1+tf[w]),0)/Math.sqrt(u.length+1)+(i===0?.8:0)}}).sort((a,b)=>b.sc-a.sc).slice(0,k).sort((a,b)=>a.i-b.i).map(x=>x.s)}
  /* ---------- article page: read aloud ---------- */
  const lb=$('#ar-listen');
  if(lb){const ss=window.speechSynthesis;if(!ss){lb.disabled=true;lb.title='المتصفح لا يدعم القراءة الصوتية';}
    else lb.addEventListener('click',()=>{if(ss.speaking){ss.cancel();lb.setAttribute('aria-pressed','false');lb.querySelector('span').textContent='استمع للمقال';return}
      const txt=($('h1').textContent+'. '+$('#ar-body').innerText).slice(0,6000);const chunks=txt.match(/[^.!؟?\n]{1,220}[.!؟?\n]?/g)||[txt];const v=ss.getVoices().find(v=>/^ar/i.test(v.lang));
      chunks.forEach((c,i)=>{const u=new SpeechSynthesisUtterance(c);u.lang='ar-AE';if(v)u.voice=v;u.rate=.95;if(i===chunks.length-1)u.onend=()=>{lb.setAttribute('aria-pressed','false');lb.querySelector('span').textContent='استمع للمقال'};ss.speak(u)});
      lb.setAttribute('aria-pressed','true');lb.querySelector('span').textContent='إيقاف القراءة';if(!v)toast('لا يتوفر صوت عربي في هذا المتصفح؛ قد تُقرأ بصوت افتراضي')});
    window.addEventListener('pagehide',()=>ss&&ss.cancel());return}
  if(!$('#mg-feed'))return;
  /* ---------- magazine home ---------- */
  const samples=JSON.parse($('#mg-samples').textContent);
  const local=()=>ld('mbz-contrib',[]);
  const over=()=>ld('mbz-contrib-state',{});
  const allContrib=()=>{const o=over();return [...local(),...samples].map(c=>Object.assign({},c,o[c.id]||{}))};
  const words=t=>(t.trim().match(/\S+/g)||[]).length;
  function contribs(){const L=allContrib().filter(c=>c.status==='approved');const box=$('#mg-contrib');
    box.innerHTML=L.length?L.map(c=>`<article class="mg-card ct-card" data-sec="contrib" data-desk="contrib" data-text="${esc(c.title+' '+c.body.slice(0,200))}"><button type="button" class="ct-open" data-cid="${esc(c.id)}"><div class="mg-img">${c.img?`<img src="${c.img}" alt="">`:'<span class="ct-ph" aria-hidden="true"></span>'}</div><div class="mg-b"><span class="mg-sec">مساهمات المجتمع الجامعي</span>${c.sample?'<span class="sample-badge">بيانات توضيحية</span>':''}<h3>${esc(c.title)}</h3><span class="mg-meta">${esc(c.author)} · ${esc(c.role||'')} · <span class="numx">${Math.max(1,Math.round(words(c.body)/200))}</span> د قراءة</span></div></button></article>`).join(''):'<p class="muted-note">لا توجد مساهمات معتمدة بعد. أرسل مقالك ليظهر هنا بعد اعتماد المحرر.</p>'}
  contribs();
  const prevDlg=$('#ct-dlg');
  const showPrev=c=>{$('#ct-prev').innerHTML=`<article class="ar-mini">${c.sample?'<span class="sample-badge">بيانات توضيحية</span>':''}<span class="mg-sec">مساهمات المجتمع الجامعي</span><h2>${esc(c.title||'(بدون عنوان)')}</h2><p class="mg-meta">${esc(c.author||'')}${c.role?' · '+esc(c.role):''}</p>${c.img?`<img class="ar-mini-img" src="${c.img}" alt="">`:''}<div class="ar-body">${md(c.body||'')}</div></article>`;if(!prevDlg.open)prevDlg.showModal()};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-cid]');if(b){const c=allContrib().find(x=>x.id===b.dataset.cid);c&&showPrev(c)}});
  prevDlg.addEventListener('click',e=>{if(e.target===prevDlg||e.target.closest('[data-close]'))prevDlg.close()});
  /* filters */
  let sec=new URLSearchParams(location.search).get('sec')||'', desk=new URLSearchParams(location.search).get('desk')||'';
  const DK={media:['المركز الإعلامي','الأخبار كما نُشرت في الموقع الرسمي — لا يذكر الموقع اسم كاتب للأخبار.'],pubs:['إصدارات الجامعة','أوصاف الإصدارات كما نُشرت في الموقع الرسمي.'],contrib:['المساهمون','مساهمات الطلاب والموظفين المعتمدة من المحررين.']};
  function filt(){const q=norm($('#mg-q').value);const fil=!!(sec||desk||q);$$('.mg-feat,.mg-books').forEach(x=>{x.hidden=fil;x.previousElementSibling.hidden=fil});
    let n=0;$$('#mg-all .mg-card').forEach(c=>{const ok=(!sec||c.dataset.sec===sec)&&(!desk||c.dataset.desk===desk)&&(!q||norm(c.dataset.text).includes(q));c.hidden=!ok;if(ok)n++});
    const cb=$('#mg-contrib');const showC=(!sec||sec==='contrib')&&(!desk||desk==='contrib');cb.hidden=!showC;cb.previousElementSibling.hidden=!showC;$$('.ct-card',cb).forEach(c=>{c.hidden=!!q&&!norm(c.dataset.text).includes(q)});
    $('#mg-empty').hidden=n>0||showC;const dh=$('#mg-desk-head');if(desk&&DK[desk]){dh.hidden=false;dh.innerHTML=`<div class="desk-h"><span class="ar-av">✒︎</span><div><b>${DK[desk][0]}</b><small>${DK[desk][1]}</small></div><a class="linkbtn" href="magazine.html">عرض الكل</a></div>`}else dh.hidden=true;
    $$('[data-ms]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ms===sec))}
  $$('[data-ms]').forEach(b=>b.addEventListener('click',()=>{sec=b.dataset.ms;desk='';history.replaceState(null,'',sec?'?sec='+sec:location.pathname);filt();$('#mg-feed').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}));
  $('#mg-q').addEventListener('input',filt);filt();
  /* ---------- editor ---------- */
  const ta=$('#ct-body'), K='mbz-contrib-draft';let img='';
  const dr=ld(K,null);if(dr){$('#ct-title').value=dr.title||'';$('#ct-name').value=dr.name||'';ta.value=dr.body||'';img=dr.img||'';if(img)$('#ct-img-p').innerHTML=`<img src="${img}" alt="معاينة الصورة">`}
  const saveDr=()=>{try{localStorage.setItem(K,JSON.stringify({title:$('#ct-title').value,name:$('#ct-name').value,body:ta.value,img}))}catch(e){}};
  function stats(){const w=words(ta.value);const p=ta.value.split(/\n{2,}/).filter(x=>x.trim()).length;$('#ct-stats').innerHTML=`<span><b class="numx">${w}</b> كلمة</span><span><b class="numx">${p}</b> فقرة</span><span><b class="numx">${Math.max(1,Math.round(w/200))}</b> د قراءة</span>${w<80?'<span class="warn">الحد الأدنى 80 كلمة</span>':''}`}
  ['input','change'].forEach(ev=>$('#ct-form').addEventListener(ev,()=>{stats();saveDr()}));stats();
  $$('[data-md]').forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.md,s=ta.selectionStart,e=ta.selectionEnd,v=ta.value;let ins;if(m==='**')ins='**'+(v.slice(s,e)||'نص غامق')+'**';else{const ls=v.lastIndexOf('\n',s-1)+1;ta.value=v.slice(0,ls)+m+v.slice(ls);ta.focus();ta.selectionStart=ta.selectionEnd=e+m.length;stats();saveDr();return}ta.value=v.slice(0,s)+ins+v.slice(e);ta.focus();ta.selectionStart=s;ta.selectionEnd=s+ins.length;stats();saveDr()}));
  $('#ct-img').addEventListener('change',e=>{const f=e.target.files[0];if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const sc=Math.min(1,900/im.width);const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);img=c.toDataURL('image/jpeg',.72);$('#ct-img-p').innerHTML=`<img src="${img}" alt="معاينة الصورة">`;saveDr()};im.src=r.result};r.readAsDataURL(f)});
  const cur=()=>({title:$('#ct-title').value.trim(),author:$('#ct-name').value.trim(),role:$('#ct-role').value,body:ta.value,img});
  $('#ct-preview').addEventListener('click',()=>showPrev(cur()));
  /* writing assistant (local heuristics, no external AI) */
  $$('[data-ai]').forEach(b=>b.addEventListener('click',()=>{const out=$('#ct-ai-out');const t=ta.value.trim();const k=b.dataset.ai;
    if(words(t)<25){out.innerHTML='<p class="muted-note">اكتب 25 كلمة على الأقل ليتمكن المساعد من التحليل.</p>';return}
    if(k==='titles'){const tf={};toks(t).forEach(w=>tf[w]=(tf[w]||0)+1);const top=Object.entries(tf).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);const orig=t.match(/\S+/g);const pick=w=>orig.find(o=>norm(o).includes(w))||w;const a=pick(top[0]||'الفكرة'),c=pick(top[1]||'التجربة'),d=pick(top[2]||'الجامعة');const fs=sents(t);
      const T=[`${a} و${c}: قراءة في ${d}`,`كيف يغيّر ${a} نظرتنا إلى ${c}؟`,`${a}… ${fs[0]?fs[0].split(/\s+/).slice(0,5).join(' '):c}`,`خمس أفكار عن ${a}`];
      out.innerHTML=`<b>عناوين مقترحة</b><ul class="ai-l">${T.map(x=>`<li><button type="button" class="linkbtn" data-use-title="${esc(x)}">${esc(x)}</button></li>`).join('')}</ul><small class="muted-note">مبنية على الكلمات الأكثر تكراراً في نصك — اضغط لاستخدامها.</small>`}
    else if(k==='structure'){const P=t.split(/\n{2,}/).filter(x=>x.trim());const S=sents(t);const long=S.filter(s=>s.split(/\s+/).length>40).length;const heads=(t.match(/^## /gm)||[]).length;const w=words(t);const tips=[];
      tips.push([P.length>=3,`عدد الفقرات: ${P.length} ${P.length>=3?'— جيد':'— قسّم النص إلى 3 فقرات على الأقل (مقدمة، عرض، خاتمة)'}`]);
      tips.push([w>=300,`الطول: ${w} كلمة ${w>=300?'— مناسب للمقال':'— المقالات الجيدة غالباً 300–1200 كلمة'}`]);
      tips.push([!long,long?`${long} جمل طويلة جداً (أكثر من 40 كلمة) — جرّب تقسيمها`:'أطوال الجمل مريحة للقراءة']);
      tips.push([heads>0||P.length<5,heads?`${heads} عناوين فرعية`:(P.length>=5?'أضف عناوين فرعية لتسهيل القراءة':'العناوين الفرعية اختيارية لنص بهذا الطول')]);
      tips.push([$('#ct-title').value.trim().length>=6,$('#ct-title').value.trim()?'العنوان موجود':'أضف عنواناً للمقال']);
      tips.push([/[؟?]|\bلماذا\b|\bكيف\b/.test(P[0]||''),'المقدمة: '+(/[؟?]/.test(P[0]||'')?'تبدأ بسؤال يشدّ القارئ':'جرّب افتتاحية بسؤال أو مشهد')]);
      out.innerHTML=`<b>فحص البنية</b><ul class="ai-l chk">${tips.map(([ok,m])=>`<li class="${ok?'ok':'no'}">${ok?'✓':'!'} ${esc(m)}</li>`).join('')}</ul>`}
    else{const S=extract(t,3);out.innerHTML=`<b>ملخص استخراجي</b><ol class="ai-l">${S.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><small class="muted-note">جمل مأخوذة من نصك نفسه.</small>`}}));
  $('#ct-ai-out').addEventListener('click',e=>{const b=e.target.closest('[data-use-title]');if(b){$('#ct-title').value=b.dataset.useTitle;saveDr();toast('تم استخدام العنوان')}});
  $('#ct-form').addEventListener('submit',e=>{e.preventDefault();const c=cur();const ok=c.title.length>=6&&c.author.length>=3&&words(c.body)>=80;$('#ct-err').hidden=ok;if(!ok)return;
    const L=local();const id='c-'+Date.now();L.unshift({id,title:c.title,sec:'contrib',author:c.author,role:c.role,body:c.body,img:c.img,status:'pending',date:new Date().toISOString().slice(0,10)});
    try{localStorage.setItem('mbz-contrib',JSON.stringify(L))}catch(err){L[0].img='';localStorage.setItem('mbz-contrib',JSON.stringify(L))}
    localStorage.removeItem(K);$('#ct-form').reset();ta.value='';img='';$('#ct-img-p').innerHTML='<span>اختر صورة — تُعرض معاينتها هنا ولا تُرفع</span>';stats();
    const d=$('#ct-done');d.hidden=false;d.innerHTML=`<div class="ct-ok"><b>أُضيف مقالك إلى قائمة المراجعة</b><span>لم يُرسل إلى أي جهة — يظهر في <a href="staff.html#mag-review">قائمة مراجعة المحررين</a> على هذا الجهاز.</span></div>`;window.MBZ_confetti&&window.MBZ_confetti()});
})();
