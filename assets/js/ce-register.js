/* CE language registration — demo only: nothing is sent anywhere */
(function(){
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const D=JSON.parse(($('#rg-data')||{}).textContent||'null');if(!D)return;
const KEY='mbz-cereg-'+D.lang, esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=n=>new Intl.NumberFormat('en-US').format(Math.round(n*100)/100);
const rowById=id=>D.rows.find(r=>r.id===id), catById=id=>D.cats.find(c=>c.id===id);
/* ---- level tabs (roving) ---- */
$$('.rg-lv[data-tabs]').forEach(w=>{const tabs=$$('[role=tab]',w);const sel=(t,f)=>{tabs.forEach(x=>{const on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;$('#'+x.getAttribute('aria-controls')).hidden=!on});if(f)t.focus()};
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>sel(t));t.addEventListener('keydown',e=>{const rtl=document.dir!=='ltr';let k=null;if(e.key===(rtl?'ArrowLeft':'ArrowRight'))k=(i+1)%tabs.length;if(e.key===(rtl?'ArrowRight':'ArrowLeft'))k=(i-1+tabs.length)%tabs.length;if(k!==null){e.preventDefault();sel(tabs[k],1)}})})});
/* ---- fee calculator ---- */
const calc=$('#rg-calc'),fee0=D.rows[0]?D.rows[0].fees:0;
const price=(fee,cat)=>{const p=cat?cat.pct:0;const d=fee*p/100;return{p,d,f:fee-d}};
if(calc)calc.addEventListener('change',()=>{const c=catById(calc.value);const r=price(fee0,c);const o=$('#rg-calc-out');$('[data-o=disc]',o).innerHTML=c&&c.pct?`${r.p}% · <span class="numx">${fmt(r.d)}</span> د.إ`:'—';$('[data-o=final]',o).innerHTML=`<span class="numx">${fmt(r.f)}</span> د.إ`;$$('.rg-table tr[data-cat]').forEach(tr=>tr.classList.toggle('on',tr.dataset.cat===calc.value))});
/* ---- form ---- */
const form=$('#rg-form');if(!form)return;
const F=n=>form.elements[n];let step=0;
const steps=$$('.rg-step',form),pills=$$('.rg-steps li');
const save=()=>{const v={step};['OfferingID','Fullname','Email','Mobile','CategoryID','EmiratesID','RegionID'].forEach(k=>v[k]=F(k).value);v.Gender=(form.querySelector('[name=Gender]:checked')||{}).value||'';v.ConsentAccepted=F('ConsentAccepted').checked;v.extra={};$$('[data-cf]',form).forEach(i=>{if(i.type!=='file')v.extra[i.dataset.cf]=i.value});try{localStorage.setItem(KEY,JSON.stringify(v));const s=$('#rg-saved');s.textContent='✓ تم الحفظ تلقائياً '+new Date().toLocaleTimeString('ar-AE',{hour:'2-digit',minute:'2-digit'})}catch(e){}};
const catFields=()=>{const c=catById(F('CategoryID').value),box=$('#rg-catf');box.innerHTML='';if(!c)return;
 box.insertAdjacentHTML('beforeend',`<div class="rg-note">${c.pct?`خصم هذه الفئة: <b>${c.pct}%</b>`:'لا يوجد خصم لهذه الفئة'} · المطلوب: ${c.fields.length?c.fields.map(f=>esc(f.ar)).join('، '):'لا شيء'}</div>`);
 c.fields.forEach(f=>{const id='cf-'+f.id.slice(0,8);box.insertAdjacentHTML('beforeend',f.type==='file'?`<div class="rg-f"><span class="rg-lab">${esc(f.ar)} <span class="req" aria-hidden="true">*</span></span><label class="rg-file" for="${id}"><input type="file" id="${id}" data-cf="${f.id}" data-req="1" accept=".pdf,.jpg,.jpeg,.png"><b>📎 إرفاق ملف</b><span>لا يُرفع أي ملف في النسخة التجريبية</span></label><small class="rg-err"></small></div>`:`<div class="rg-f"><label for="${id}">${esc(f.ar)} <span class="req" aria-hidden="true">*</span></label><input id="${id}" data-cf="${f.id}" data-req="1"><small class="rg-err"></small></div>`)});
 $$('input[type=file]',box).forEach(i=>i.addEventListener('change',()=>{const s=i.parentNode.querySelector('span');s.textContent=i.files[0]?i.files[0].name+' (محلي فقط)':'لا يُرفع أي ملف في النسخة التجريبية'}))};
const region=()=>{const o=F('EmiratesID').selectedOptions[0];const ad=o&&o.dataset.code==='EM001';$('#rg-regw').hidden=!ad;F('RegionID').required=ad;if(!ad)F('RegionID').value=''};
const side=()=>{const r=rowById(F('OfferingID').value),c=catById(F('CategoryID').value);const sel=$('#rg-sel');
 if(r){sel.innerHTML=`<b>المستوى: ${esc(r.levelAr)}</b><span>${esc(r.trackAr)}</span><span>${esc(r.days)} · <bdi>${esc(r.start)}</bdi> – <bdi>${esc(r.end)}</bdi></span><span>يبدأ ${esc(r.dateDay)}، ${esc(r.dateAr)} · ${esc(r.durAr)}</span><span>${esc(r.branch)}</span>`;$$('.rg-slot').forEach(s=>s.classList.toggle('on',s.id==='s-'+r.id.slice(0,8)));const off=$('#rg-official');if(off)off.href=r.url}
 const fee=r?r.fees:null,p=price(fee||0,c);$('[data-o=fee]').innerHTML=fee!=null?`<span class="numx">${fmt(fee)}</span> د.إ`:'—';$('[data-o=d2]').innerHTML=c&&c.pct&&fee!=null?`${c.pct}% · <span class="numx">${fmt(p.d)}</span> د.إ`:'—';$('[data-o=f2]').innerHTML=fee!=null?`<span class="numx">${fmt(p.f)}</span> د.إ`:'—'};
const errOf=el=>{const w=el.closest('.rg-f');return w&&w.querySelector('.rg-err')};
const setErr=(el,m)=>{const w=el.closest('.rg-f');if(w){w.classList.toggle('bad',!!m);w.classList.toggle('ok',!m&&!!(el.value||'').trim())}const e=errOf(el)||(el.name==='ConsentAccepted'?$('#e-consent'):null);if(e)e.textContent=m||'';el.setAttribute('aria-invalid',m?'true':'false');return !m};
const check=el=>{const v=(el.value||'').trim();const n=el.name;
 if(n==='Gender'){const ok=!!form.querySelector('[name=Gender]:checked');return setErr(el,ok?'':'مطلوب الجنس')}
 if(n==='ConsentAccepted')return setErr(el,el.checked?'':'يجب قبول الشروط وسياسة الخصوصية للمتابعة');
 if(el.dataset.req&&el.type==='file')return setErr(el,el.files&&el.files.length?'':'يرجى إرفاق المستندات المطلوبة.');
 if((el.required||el.dataset.req)&&!v)return setErr(el,{OfferingID:'اختر الموعد',Fullname:'مطلوب الاسم الكامل',Email:'مطلوب البريد الإلكتروني',Mobile:'مطلوب رقم الموبايل',CategoryID:'الفئة مطلوبة',RegionID:'اختر المنطقة'}[n]||'هذا الحقل مطلوب');
 if(n==='Email'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return setErr(el,'البريد الإلكتروني غير صالح');
 if(n==='Mobile'&&v&&!/^0?5\d{8}$/.test(v.replace(/[\s-]/g,'')))return setErr(el,'رقم الموبايل غير صالح (مثال: 50 123 4567)');
 if(n==='Fullname'&&v&&v.split(/\s+/).length<2)return setErr(el,'الرجاء إدخال الاسم الكامل (اسمان على الأقل)');
 return setErr(el,'')};
const stepFields=s=>s===0?[F('OfferingID'),F('Fullname'),F('Email'),F('Mobile'),form.querySelector('[name=Gender]'),F('CategoryID'),...$$('[data-cf]',form),...(F('RegionID').required?[F('RegionID')]:[])]:s===1?[F('ConsentAccepted')]:[];
const review=()=>{const r=rowById(F('OfferingID').value),c=catById(F('CategoryID').value),em=F('EmiratesID').selectedOptions[0],rg=F('RegionID').selectedOptions[0],p=price(r?r.fees:0,c);
 const items=[['الدورة',r?r.nameAr:''],['الموعد',r?`${r.trackAr} · ${r.days} · ${r.start} – ${r.end}`:''],['تاريخ البدء',r?r.dateAr:''],['الاسم',F('Fullname').value],['البريد',F('Email').value],['الموبايل','+971 '+F('Mobile').value],['الجنس',(form.querySelector('[name=Gender]:checked')||{}).value==='female'?'أنثى':'ذكر'],['الفئة',c?c.ar:''],['الإمارة',em&&em.value?em.textContent:'—'],...(rg&&rg.value?[['المنطقة',rg.textContent]]:[]),['السعر النهائي',r?`${fmt(p.f)} د.إ (باستثناء ضريبة القيمة المضافة والرسوم البنكية)`:'']];
 $('#rg-review').innerHTML=items.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')};
const go=s=>{step=s;steps.forEach((f,i)=>f.hidden=i!==s);pills.forEach((p,i)=>{p.classList.toggle('on',i===s);p.classList.toggle('done',i<s);if(i===s)p.setAttribute('aria-current','step');else p.removeAttribute('aria-current')});$('#rg-back').hidden=s===0;$('#rg-next').hidden=s===2;$('#rg-submit').hidden=s!==2;if(s===2)review();save();const m=$('.rg-main');if(m&&m.getBoundingClientRect().top<0)m.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})};
$('#rg-next').addEventListener('click',()=>{const bad=stepFields(step).map(check).some(ok=>!ok);if(bad){const f=form.querySelector('[aria-invalid=true]');f&&f.focus();return}go(step+1)});
$('#rg-back').addEventListener('click',()=>go(step-1));
form.addEventListener('input',e=>{if(e.target.closest('.rg-f.bad')||e.target.name==='ConsentAccepted')check(e.target);save()});
form.addEventListener('change',e=>{const n=e.target.name;if(n==='CategoryID'){catFields();}if(n==='EmiratesID')region();if(n==='OfferingID'||n==='CategoryID')side();if(e.target.matches('select,[type=radio],[type=file]'))check(e.target);save()});
form.addEventListener('focusout',e=>{if(e.target.matches('input:not([type=radio]):not([type=checkbox]):not([type=file])'))check(e.target)});
form.addEventListener('submit',e=>{e.preventDefault();const ref='DEMO-'+Math.random().toString(36).slice(2,8).toUpperCase();const r=rowById(F('OfferingID').value);
 try{const all=JSON.parse(localStorage.getItem('mbz-cereg-done')||'[]');all.push({ref,lang:D.lang,offering:r&&r.nameAr,at:new Date().toISOString()});localStorage.setItem('mbz-cereg-done',JSON.stringify(all));localStorage.removeItem(KEY)}catch(x){}
 form.hidden=true;$('.rg-steps').hidden=true;const d=$('#rg-done');d.hidden=false;$('#rg-ref').textContent=ref;$('#rg-done-txt').textContent=r?`${r.nameAr} — ${r.trackAr}، يبدأ ${r.dateDay} ${r.dateAr}.`:'';d.focus();window.MBZ_confetti&&window.MBZ_confetti()});
$('#rg-again').addEventListener('click',()=>{try{localStorage.removeItem(KEY)}catch(x){}location.hash='register';location.reload()});
/* pick a slot from the schedule cards */
document.addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(!b)return;F('OfferingID').value=b.dataset.pick;check(F('OfferingID'));side();save();go(0);$('#register').scrollIntoView({behavior:'smooth'});setTimeout(()=>F('Fullname').focus({preventScroll:true}),500)});
/* restore autosave */
try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v){['OfferingID','Fullname','Email','Mobile','CategoryID','EmiratesID'].forEach(k=>{if(v[k])F(k).value=v[k]});if(v.Gender){const g=form.querySelector(`[name=Gender][value=${v.Gender}]`);g&&(g.checked=true)}catFields();region();if(v.RegionID)F('RegionID').value=v.RegionID;F('ConsentAccepted').checked=!!v.ConsentAccepted;$$('[data-cf]',form).forEach(i=>{if(i.type!=='file'&&v.extra&&v.extra[i.dataset.cf])i.value=v.extra[i.dataset.cf]});side();go(Math.min(v.step||0,1));$('#rg-saved').textContent='✓ استُعيد تقدّمك المحفوظ'}}catch(x){}
const qs=new URLSearchParams(location.search).get('o');if(qs&&rowById(qs)){F('OfferingID').value=qs;side()}
/* ---- course helper (retrieval over this page's real data) ---- */
const log=$('#rg-ai-log'),aiF=$('#rg-ai-f'),aiQ=$('#rg-ai-q');
const N=s=>(s||'').replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').toLowerCase();
const T=D.terms.map(b=>b.t);
const lv=q=>/مبتد/.test(q)?'Beginner':/متوسط/.test(q)?'Intermediate':/متقدم/.test(q)?'Advanced':'';
const tr=q=>/صباح/.test(q)?'wkm':/مساء/.test(q)?'wke':/(نهايه|عطله|ويكند|السبت|الاحد)/.test(q)?'wk':/(خلال الاسبوع|ايام الاسبوع|الاثنين|الثلاثاء)/.test(q)?'wd':'';
const li=r=>`<li><b>${esc(r.levelAr)}</b> · ${esc(r.trackAr)}: ${esc(r.days)}، <bdi>${esc(r.start)}</bdi> – <bdi>${esc(r.end)}</bdi>، يبدأ ${esc(r.dateAr)}</li>`;
const answer=raw=>{const q=N(raw),L=lv(q),K=tr(q);let rows=D.rows.filter(r=>(!L||r.level===L)&&(!K||(K==='wk'?r.track!=='wd':r.track===K)));const src='<small>المصدر: بوابة مركز التعليم المستمر (بيانات منسوخة 6 أكتوبر 2026)</small>';
 const catHit=D.cats.filter(c=>N(c.ar).split(/\s+/).filter(w=>w.length>3&&!['جامعه','محمد','زايد','للعلوم','الانسانيه','الانسانية'].includes(w)).some(w=>q.includes(w)));
 if(/(نصاب|الحد الادني|الحد الأدنى|عدد المتدربين|كم متدرب|تنعقد|تعقد|اكتمال|quorum)/.test(q)){const h=T.filter(t=>/النصاب/.test(t));if(h.length)return `<b>${esc(h[0])}</b>${src}`}
 if(/(استرداد|استرجاع|الغاء|انسحاب|refund)/.test(q)){const h=T.filter(t=>/(استرداد|يسترد|يُسترد|الانسحاب|إلغاء)/.test(t));return `<b>سياسة الإلغاء والاسترداد:</b><ul>${h.slice(0,6).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${src}`}
 if(/(شهاده|حضور|غياب)/.test(q)){const h=T.filter(t=>/(حضور|الغياب|شهادة)/.test(t));return `<ul>${h.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${src}`}
 if(/(مستند|متطلب|اوراق|وثائق|ارفاق|شروط التسجيل)/.test(q)){const cs=catHit.length?catHit:D.cats;return `<b>المطلوب عند التسجيل حسب الفئة:</b><ul>${cs.map(c=>`<li>${esc(c.ar)}: ${c.fields.length?c.fields.map(f=>(f.type==='file'?'📎 ':'')+esc(f.ar)).join('، '):'—'}</li>`).join('')}</ul>إضافة إلى: الاسم الكامل، البريد الإلكتروني، الموبايل، الجنس، والإمارة (اختياري).${src}`}
 if(/(خصم|تخفيض|طلاب|موظف|قران|شهداء|اشقاء|اخوه)/.test(q)||catHit.length){const cs=catHit.length?catHit:D.cats.filter(c=>c.pct>0);const fee=D.rows[0].fees;return `<b>الخصومات (رسوم المستوى ${fmt(fee)} د.إ):</b><ul>${cs.map(c=>`<li>${esc(c.ar)}: ${c.pct}% ← السعر النهائي <b class="numx">${fmt(fee-fee*c.pct/100)}</b> د.إ</li>`).join('')}</ul>الأسعار باستثناء ضريبة القيمة المضافة والرسوم البنكية.${src}`}
 if(/(رسوم|سعر|تكلفه|كم|مبلغ|ضريبه|دفع)/.test(q)){const fees=[...new Set(D.rows.map(r=>r.fees))];return `رسوم كل مستوى: <b class="numx">${fees.map(fmt).join(' / ')}</b> د.إ — باستثناء ضريبة القيمة المضافة والرسوم البنكية. يمكن تطبيق خصم حسب الفئة (حتى ${Math.max(...D.cats.map(c=>c.pct))}%). اسأل: «كم الرسوم بعد خصم طلاب الجامعة؟»${src}`}
 if(/(فرع|مكان|اين|موقع)/.test(q))return `تُقدَّم الدورات في: <b>${esc([...new Set(D.rows.map(r=>r.branch))].join('، '))}</b>.${src}`;
 if(/(مده|كم اسبوع|اسابيع|طول)/.test(q))return `مدة كل مستوى: <b>${esc([...new Set(D.rows.map(r=>r.durAr))].join('، '))}</b>.${src}`;
 if(/(مستوي|مستويات|ابدا من|اي مستوي)/.test(q)&&!L)return `المستويات المتاحة: ${[...new Set(D.rows.map(r=>r.levelAr))].map(esc).join('، ')}. ابدأ بالمبتدئ إن لم تدرس اللغة من قبل؛ ولكل مستوى ثلاثة مواعيد.${src}`;
 if(/(متي|يبدا|بدايه|تاريخ|موعد|مواعيد|وقت|ساعه|جدول|ايام|نهايه|صباح|مساء)/.test(q)||L||K){if(!rows.length)rows=D.rows;return `<ul>${rows.map(li).join('')}</ul>الأوقات بتوقيت الإمارات.${src}`}
 return `أستطيع الإجابة عن: المواعيد والأيام، تواريخ البدء، الرسوم والخصومات، المستندات المطلوبة، الاسترداد، وشروط الشهادة لدورات اللغة ${esc(D.ar)}. للتفاصيل الرسمية: <a class="ext" href="${D.hub}" target="_blank" rel="noopener">بوابة المركز</a>.`};
const ask=q=>{if(!q.trim())return;log.insertAdjacentHTML('beforeend',`<div class="rg-q">${esc(q)}</div><div class="rg-a">${answer(q)}</div>`);log.scrollTop=log.scrollHeight};
if(aiF)aiF.addEventListener('submit',e=>{e.preventDefault();ask(aiQ.value);aiQ.value=''});
$$('[data-rgq]').forEach(b=>b.addEventListener('click',()=>ask(b.dataset.rgq)));
})();
