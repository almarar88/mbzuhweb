/* Demo application wizard — nothing is sent anywhere; state lives in localStorage on this device only. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const wz=$('#wz'); if(!wz) return;
  const C=JSON.parse($('#adm-config').textContent);
  const KEY='mbz-apply-draft', APPS='mbz-apps';
  const LV=Object.fromEntries(C.levels.map(l=>[l.k,l.t]));
  const form=$('#wz-form'), steps=$$('.wz-step',form), N=steps.length;
  const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2000)};
  let S={step:0,max:0,docs:{}};
  try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d&&typeof d==='object'){S={...S,...d};if(d.level||d.name)setTimeout(()=>toast('تم استرجاع مسودتك المحفوظة على هذا الجهاز'),400)}}catch(e){}
  const qs=new URLSearchParams(location.search);
  if(qs.get('p')){const p=C.progs.find(x=>x.id===qs.get('p')||x.u===qs.get('p'));if(p){S.level=p.l;S.prog=p.id}}
  else if(qs.get('level')&&LV[qs.get('level')]&&!S.level)S.level=qs.get('level');
  const prog=()=>C.progs.find(p=>p.id===S.prog);
  const grad=()=>S.level&&S.level!=='bachelor';
  const certOf=k=>C.req.bachelor.certs.find(c=>c[0]===k);
  /* ---- save ---- */
  let sv;const save=()=>{clearTimeout(sv);sv=setTimeout(()=>{localStorage.setItem(KEY,JSON.stringify(S));const t=new Date();$('#wz-saved').textContent='✓ حُفظ تلقائياً '+t.toLocaleTimeString('ar-AE',{hour:'2-digit',minute:'2-digit'})},250)};
  /* ---- step 1: programs ---- */
  function renderProgs(){
    $$('input[name=level]',form).forEach(r=>r.checked=r.value===S.level);
    const box=$('#wz-progs'), list=C.progs.filter(p=>p.l===S.level);
    $('#wz-prog-hint').hidden=!!S.level;
    box.innerHTML=list.map(p=>`<label class="pg-card"><input type="radio" name="prog" value="${p.id}"${p.id===S.prog?' checked':''}><span class="pg-in"><b>${esc(p.n)}</b><small>${esc(p.c)}${p.h?' · '+esc(p.h):''}</small><a href="${esc(p.u)}" target="_blank" rel="noopener" class="pg-more">تفاصيل البرنامج</a></span></label>`).join('');
  }
  form.addEventListener('change',e=>{
    const t=e.target;
    if(t.name==='level'){S.level=t.value;if(prog()&&prog().l!==S.level)S.prog='';S.docs={};renderProgs();sideFee();err('level',false)}
    else if(t.name==='prog'){S.prog=t.value;sideFee();err('prog',false)}
    else if(t.type==='checkbox'&&t.name){S[t.name]=t.checked;err(t.name,false)}
    else if(t.type==='file'){const f=t.files[0];if(f){S.docs[t.dataset.doc]={n:f.name,s:f.size};t.value='';renderDocs();toast('أُضيف «'+f.name+'» (لم يُرفع إلى أي مكان)')}}
    else if(t.name){S[t.name]=t.value;if(t.name==='cert'||t.name==='nat')renderElig()}
    save();
  });
  form.addEventListener('input',e=>{const t=e.target;if(t.name&&!['radio','checkbox','file'].includes(t.type)){S[t.name]=t.value;t.classList.remove('bad');err(t.name,false);if(['avg','gpa','ielts'].includes(t.name))renderElig();save()}});
  /* recommender results -> pick program */
  wz.addEventListener('click',e=>{const a=e.target.closest('.rec');if(!a)return;e.preventDefault();const href=a.getAttribute('href');const p=C.progs.find(x=>href.endsWith(x.u));if(!p)return;S.level=p.l;S.prog=p.id;renderProgs();sideFee();save();const d=$('.ap-quiz',wz);if(d)d.open=false;const el=$(`input[value="${p.id}"]`,form);if(el){el.closest('.pg-card').scrollIntoView({block:'center',behavior:'smooth'});el.focus({preventScroll:true})}toast('تم اختيار: '+p.n)});
  /* ---- step 2: requirements ---- */
  function renderReq(){
    const p=prog(), R=C.req, box=$('#wz-req'); let h='';
    if(S.level==='bachelor'){const B=R.bachelor;
      const certs=g=>B.certs.filter(c=>c[4]===g).map(c=>`<tr${c[0]===S.cert?' class="hit"':''}><th scope="row">${esc(c[1])}</th><td>${esc(c[2])}</td></tr>`).join('');
      const col=p&&B.colleges[p.c];
      h=`<div class="rq-card"><h3>شروط القبول في البكالوريوس</h3><ul class="rq-list">${B.general.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="rq-card"><h3>الحد الأدنى للمعدل حسب نوع الشهادة</h3><div class="tbl-wrap"><table class="atbl"><tbody><tr class="grp"><th colspan="2">أولاً: شهادة الثانوية العامة في الدولة</th></tr>${certs('uae')}<tr class="grp"><th colspan="2">ثانياً: الأنظمة التعليمية الأخرى</th></tr>${certs('other')}</tbody></table></div></div>
      ${col?`<div class="rq-card"><h3>${esc(B.college_note)} — ${esc(p.c)}</h3><ul class="rq-list">${col.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
      <p class="rq-note"><b>ملاحظة:</b> ${esc(B.note)}</p>`;
    } else if(S.level==='master'||S.level==='phd'){const G=R[S.level];
      h=`<div class="rq-card"><h3>شروط القبول في ${S.level==='master'?'برنامج الماجستير':'برامج الدكتوراه'}</h3><dl class="rq-dl">${G.rows.map(r=>`<div><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('')}</dl></div>`;
    } else if(S.level==='diploma'){
      h=`<div class="rq-card"><h3>دبلوم الدراسات العليا</h3><p>لم تُنشر في صفحة القبول شروط مستقلة لبرامج دبلوم الدراسات العليا. يُرجى التحقق من الشروط عبر <a class="ext" href="${C.apply}" target="_blank" rel="noopener">بوابة القبول الرسمية</a> أو صفحة البرنامج.</p></div>`;
    }
    box.innerHTML=(p?`<p class="rq-for">البرنامج المختار: <b>${esc(p.n)}</b> · ${esc(p.c)}</p>`:'')+h+`<p class="muted-note">نُقلت الشروط حرفياً من تبويب «شروط القبول» في <a href="admission.html">صفحة القبول</a>.</p>`;
  }
  /* ---- step 3: fields & eligibility hint ---- */
  function syncFields(){
    $$('[data-for]',form).forEach(f=>{const on=f.dataset.for==='bachelor'?S.level==='bachelor':grad();f.hidden=!on});
    $('#f-cert').required=S.level==='bachelor';
    ['name','email','phone','dob','nat','campus','cert','avg','gpa','ielts'].forEach(k=>{const el=form.elements[k];if(el&&S[k]!=null)el.value=S[k]});
    ['req_ok','decl'].forEach(k=>{if(form.elements[k])form.elements[k].checked=!!S[k]});
  }
  function elig(){
    const out=[];
    if(S.level==='bachelor'&&S.cert){const c=certOf(S.cert);if(c&&c[3]!=null&&S.avg!==''&&S.avg!=null){const a=parseFloat(S.avg);out.push(a>=c[3]?{ok:1,t:`المعدل ${a}% يستوفي الحد الأدنى المنشور لـ«${c[1]}» (${c[3]}%).`}:{ok:0,t:`المعدل ${a}% أقل من الحد الأدنى المنشور لـ«${c[1]}» (${c[3]}%). قد تنطبق «المؤهلات الخاصة» للكلية.`})}else if(c&&c[3]==null)out.push({ok:2,t:`شرط «${c[1]}»: ${c[2]}`})}
    if(grad()&&S.level!=='diploma'){const G=C.req[S.level];if(S.gpa){const g=parseFloat(S.gpa);out.push(g>=G.gpa?{ok:1,t:`المعدل التراكمي ${g} يستوفي الحد الأدنى (${G.gpa} من 4.0).`}:{ok:0,t:`المعدل التراكمي ${g} أقل من الحد الأدنى المنشور (${G.gpa} من 4.0).`})}
      if(S.ielts){const v=parseFloat(S.ielts);out.push(v>=G.ielts?{ok:1,t:`IELTS ${v} يستوفي المطلوب (${G.ielts}).`}:{ok:0,t:`IELTS ${v} أقل من المطلوب (${G.ielts} أو ما يعادلها).`})}}
    const sch=C.sch||[];if(S.nat){const m=S.nat==='non'?sch.find(s=>s.t.includes('غير المواطن')):sch.find(s=>s.t.includes('المواطن وأبناء'));if(m)out.push({ok:3,t:`منحة قد تناسبك: «${m.t}» — ${m.b[0]||''}`})}
    return out;
  }
  function renderElig(){const e=elig();$('#wz-elig').innerHTML=e.length?`<div class="el-h">${'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 5.8L20 10l-5 3.6L16.5 20 12 16.4 7.5 20 9 13.6 4 10l6.1-1.2z"/></svg>'}فحص استرشادي فوري</div><ul>${e.map(x=>`<li class="el-${['no','ok','info','sch'][x.ok]}">${esc(x.t)}</li>`).join('')}</ul><small>مقارنة آلية مع الشروط المنشورة — القرار النهائي للجنة القبول.</small>`:''}
  /* ---- step 4: docs ---- */
  const docsFor=()=>(C.docs[S.level]||C.docs.diploma||[]);
  const isOther=()=>{const c=certOf(S.cert);return c&&c[4]==='other'};
  const required=()=>docsFor().filter(d=>d.kind==='d'&&(!d.cond||(d.cond==='other'&&isOther())));
  function renderDocs(){
    $('#wz-docs').innerHTML=docsFor().map(d=>{const f=S.docs[d.id];const req=d.kind==='d'&&(!d.cond||(d.cond==='other'&&isOther()));return `<li class="doc${f?' has':''}"><span class="doc-ic">${f?'✓':''}</span><div class="doc-b"><b>${esc(d.t)}${req?' <i class="req">مطلوب</i>':d.cond?' <i class="opt">إن انطبق</i>':''}</b><span class="dk ${d.kind}">${d.kind==='d'?'مستنتج من الشروط':'عنصر عام'}</span><small>${esc(d.src)}</small>${f?`<span class="doc-f">${esc(f.n)} · ${(f.s/1024).toFixed(0)} KB <button type="button" class="linkbtn" data-rm="${d.id}">إزالة</button></span>`:''}</div><label class="btn btn-ghost doc-up"><input type="file" data-doc="${d.id}" accept=".pdf,.jpg,.jpeg,.png" class="sr-only">${f?'استبدال':'اختيار ملف'}</label></li>`}).join('');
  }
  wz.addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(b){delete S.docs[b.dataset.rm];renderDocs();save()}});
  /* ---- step 5: review & AI summary ---- */
  function missing(){return required().filter(d=>!S.docs[d.id])}
  function summary(){const p=prog();const e=elig();const m=missing();const ok=e.filter(x=>x.ok===1).length, no=e.filter(x=>x.ok===0).length;
    return `طلب ${p?'لبرنامج «'+p.n+'» ('+LV[S.level]+') في '+p.c:'—'}${S.campus?'، الفرع المفضّل: '+S.campus:''}. المتقدم: ${S.name||'—'}. الفحص الاسترشادي: ${e.length?ok+' بنود مستوفاة'+(no?' و'+no+' دون الحد المنشور':''):'لم تُدخل معدلات بعد'}. المستندات المطلوبة: ${required().length-m.length} من ${required().length} مرفقة${m.length?' — الناقص: '+m.map(d=>d.t).join('، '):''}.`}
  function renderReview(){const p=prog();const m=missing();
    $('#wz-ai').innerHTML=`<div class="ai-h"><span class="av orb sm"></span><b>ملخص ذكي للطلب</b><span class="sample-badge" style="background:var(--sage-soft);color:var(--sage);border-color:var(--sage)">يُولَّد على جهازك</span></div><p>${esc(summary())}</p>${m.length?`<p class="ai-warn">يمكنك الإرسال الآن، وسيظهر الطلب في لوحة القبول بحالة «مستندات ناقصة».</p>`:''}`;
    const row=(k,v)=>`<div><dt>${k}</dt><dd>${v?esc(v):'<span class="muted">—</span>'}</dd></div>`;
    const sec=(t,i,body)=>`<section class="rv"><header><h3>${t}</h3><button type="button" class="linkbtn" data-goto="${i}">تعديل</button></header><dl>${body}</dl></section>`;
    const nat={citizen:'مواطن',mother:'من أبناء المواطنات',non:'غير مواطن'}[S.nat];
    $('#wz-review').innerHTML=sec('البرنامج',0,row('المستوى',LV[S.level])+row('البرنامج',p&&p.n)+row('الكلية',p&&p.c))+sec('البيانات الشخصية',2,row('الاسم',S.name)+row('البريد',S.email)+row('الهاتف',S.phone)+row('تاريخ الميلاد',S.dob)+row('فئة الجنسية',nat)+row('الفرع',S.campus)+(S.level==='bachelor'?row('الشهادة',(certOf(S.cert)||[])[1])+row('المعدل',S.avg&&S.avg+'%'):row('المعدل التراكمي',S.gpa)+row('IELTS',S.ielts)))+sec('المستندات',3,docsFor().map(d=>row(d.t,S.docs[d.id]?'✓ '+S.docs[d.id].n:'')).join(''));
  }
  /* ---- navigation & validation ---- */
  function err(k,on){const el=$(`[data-err="${k}"]`,form);if(el)el.hidden=!on}
  function validate(i){let ok=true;const bad=(k,el)=>{ok=false;err(k,true);if(el){el.classList.add('bad');el.setAttribute('aria-invalid','true')}};
    if(i===0){if(!S.level)bad('level');else if(!S.prog)bad('prog')}
    if(i===1&&!S.req_ok)bad('req_ok');
    if(i===2){const f=form.elements;[['name',v=>v&&v.trim().length>=6],['email',v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v||'')],['phone',v=>/^(\+?971|0)?5\d{8}$/.test((v||'').replace(/[\s-]/g,''))],['dob',v=>!!v],['nat',v=>!!v]].forEach(([k,fn])=>{if(!fn(S[k]))bad(k,f[k]);else{f[k].classList.remove('bad');f[k].removeAttribute('aria-invalid')}});if(S.level==='bachelor'&&!S.cert)bad('cert',f.cert)}
    if(i===4&&!S.decl)bad('decl');
    if(!ok){const first=$('.wz-err:not([hidden])',steps[i]);const el=$('.bad',steps[i])||first;el&&el.scrollIntoView({block:'center',behavior:'smooth'});if($('.bad',steps[i]))$('.bad',steps[i]).focus({preventScroll:true});toast('يرجى استكمال الحقول المطلوبة')}
    return ok}
  function go(i,focus=true){i=Math.max(0,Math.min(N-1,i));S.step=i;S.max=Math.max(S.max||0,i);
    steps.forEach((s,j)=>s.hidden=j!==i);
    if(i===1)renderReq(); if(i===2){syncFields();renderElig()} if(i===3)renderDocs(); if(i===4){syncFields();renderReview()}
    $$('#wz-steps li').forEach((li,j)=>{li.classList.toggle('cur',j===i);li.classList.toggle('done',j<i||j<=S.max&&j!==i);const b=$('button',li);b.disabled=j>S.max;b.setAttribute('aria-current',j===i?'step':'false')});
    const pct=Math.round(i/(N-1)*100);$('#wz-fill').style.width=pct+'%';$('.wz-bar').setAttribute('aria-valuenow',pct);
    $('#wz-count').textContent=`الخطوة ${i+1} من ${N} · ${steps[i].querySelector('legend').lastChild.textContent}`;
    $('#wz-prev').hidden=i===0;$('#wz-next').hidden=i===N-1;$('#wz-submit').hidden=i!==N-1;
    if(focus){const top=$('.wz-top');const y=top.getBoundingClientRect().top+scrollY-(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h'))||70)-10;if(Math.abs(scrollY-y)>40)scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});steps[i].querySelector('legend').setAttribute('tabindex','-1');steps[i].querySelector('legend').focus({preventScroll:true})}
    save()}
  $('#wz-next').addEventListener('click',()=>{if(validate(S.step))go(S.step+1)});
  $('#wz-prev').addEventListener('click',()=>go(S.step-1));
  wz.addEventListener('click',e=>{const b=e.target.closest('[data-goto]');if(b&&!b.disabled){const t=+b.dataset.goto;if(t<=S.max)go(t)}});
  $('#wz-clear').addEventListener('click',()=>{if(!confirm('مسح كل البيانات المحفوظة لهذا الطلب على هذا الجهاز؟'))return;localStorage.removeItem(KEY);S={step:0,max:0,docs:{}};form.reset();renderProgs();sideFee();go(0);toast('تم مسح المسودة')});
  form.addEventListener('submit',e=>{e.preventDefault();if(!validate(4))return;
    const p=prog();const m=missing();const ref='D-'+String(Date.now()).slice(-5);
    const app={ref,name:S.name,level:S.level,prog:p?p.n:'',college:p?p.c:'',date:new Date().toISOString().slice(0,10),status:m.length?'missing':'new',docs:Object.fromEntries(Object.keys(S.docs).map(k=>[k,1])),docNames:S.docs,email:S.email,phone:S.phone,nat:S.nat,campus:S.campus,cert:S.cert,avg:S.avg,gpa:S.gpa,ielts:S.ielts,dob:S.dob,mine:true};
    let apps=[];try{apps=JSON.parse(localStorage.getItem(APPS)||'[]')}catch(x){}apps.unshift(app);localStorage.setItem(APPS,JSON.stringify(apps));localStorage.removeItem(KEY);
    steps.forEach(s=>s.hidden=true);$('#wz-nav').hidden=true;$('#wz-fill').style.width='100%';$$('#wz-steps li').forEach(li=>{li.classList.add('done');li.classList.remove('cur')});$('#wz-count').textContent='اكتمل الطلب';
    const d=$('#wz-done');d.hidden=false;d.innerHTML=`<div class="done-ic" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M15 27l7 7 15-16"/></svg></div><h3>تم حفظ طلبك التجريبي</h3><p>رقم الطلب: <b dir="ltr">${ref}</b> · الحالة: <b>${m.length?'مستندات ناقصة':'جديد'}</b></p><p class="muted-note">لم يُرسل أي شيء إلى الجامعة. حُفظ الطلب على هذا الجهاز فقط لتجربة المسار كاملاً.</p><div class="hero-actions" style="justify-content:center"><a class="btn btn-primary" href="staff.html#admissions">شاهده في لوحة القبول (بوابة الموظف)</a><a class="btn btn-ghost ext" href="${C.apply}" target="_blank" rel="noopener">التقديم الفعلي عبر البوابة الرسمية</a><button type="button" class="btn btn-ghost" id="wz-new">طلب جديد</button></div>`;
    d.focus();window.MBZ_confetti&&window.MBZ_confetti();$('#wz-new').addEventListener('click',()=>{S={step:0,max:0,docs:{}};form.reset();d.hidden=true;$('#wz-nav').hidden=false;renderProgs();go(0)});
  });
  /* ---- side: fees & dates ---- */
  function sideFee(){const b=$('#ap-fee');if(!b)return;if(!S.level){b.hidden=true;return}const p=prog();b.hidden=false;
    b.innerHTML=`<h3>الرسوم المنشورة — ${esc(LV[S.level])}</h3><dl class="fee-dl">${C.fee[S.level]?`<div><dt>تكلفة الساعة</dt><dd>${esc(C.fee[S.level])}</dd></div>`:'<div><dt>تكلفة الساعة</dt><dd>غير منشورة لهذا المستوى</dd></div>'}${p&&p.h?`<div><dt>ساعات البرنامج</dt><dd>${esc(p.h)}</dd></div>`:''}<div><dt>رسوم التسجيل</dt><dd>${esc(C.reg[S.level]||'—')}</dd></div></dl><a class="more" href="admission.html#fees">جدول الرسوم والمنح</a>`}
  (function(){const ul=$('#ap-dates');if(!ul)return;const today=new Date().toISOString().slice(0,10);const up=C.dates.filter(d=>d.iso>=today).slice(0,4);ul.innerHTML=up.length?up.map(d=>`<li><time>${esc(d.date)}</time><span>${esc(d.ev.length>90?d.ev.slice(0,88)+'…':d.ev)}</span></li>`).join(''):'<li>لا توجد مواعيد قادمة في التقويم المنشور.</li>'})();
  renderProgs();sideFee();go(Math.min(S.step||0,N-1),false);
})();
