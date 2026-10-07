/* v4: cinema hero video, time-of-day theme, calm mode, magnetic buttons, tilt cards, scroll progress */
(function(){
  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const RM=matchMedia('(prefers-reduced-motion: reduce)');
  const html=document.documentElement;
  /* calm mode (persisted) */
  const calmBtns=$$('[data-calm-toggle]');
  const setCalm=on=>{html.classList.toggle('calm',on);calmBtns.forEach(b=>b.setAttribute('aria-pressed',on));try{localStorage.setItem('mbz-calm',on?'1':'0')}catch(e){}document.dispatchEvent(new CustomEvent('mbz-calm',{detail:on}))};
  let calm=false;try{calm=localStorage.getItem('mbz-calm')==='1'}catch(e){}
  setCalm(calm);
  calmBtns.forEach(b=>b.addEventListener('click',()=>{calm=!calm;setCalm(calm)}));
  const still=()=>RM.matches||html.classList.contains('calm');
  /* time of day in Abu Dhabi */
  const hr=+new Intl.DateTimeFormat('en-GB',{hour:'numeric',hour12:false,timeZone:'Asia/Dubai'}).format(new Date());
  const tod=hr>=5&&hr<8?'dawn':hr>=8&&hr<16?'noon':hr>=16&&hr<19?'sunset':'night';
  html.dataset.tod=tod;
  const TODL={dawn:'فجر أبوظبي',noon:'نهار أبوظبي',sunset:'غروب أبوظبي',night:'ليل أبوظبي'};
  const eb=$('.hero--photo .eyebrow');
  if(eb&&html.lang!=='en'){const c=document.createElement('span');c.className='tod-chip';c.title='ألوان الواجهة تتبدّل حسب الوقت في أبوظبي';c.innerHTML='<i></i>'+TODL[tod];eb.after(c)}
  /* hero video */
  const v=$('.hero-video'),tg=$('[data-hv-toggle]');
  if(v){
    const saveData=navigator.connection&&navigator.connection.saveData;
    const small=matchMedia('(max-width: 700px)').matches;
    const load=()=>{if(v.dataset.loaded)return;v.dataset.loaded=1;
      const canWebm=v.canPlayType('video/webm; codecs="vp9"');
      v.src=small?v.dataset.mp4s:(v.canPlayType('video/mp4')?v.dataset.mp4:(canWebm&&v.dataset.webm?v.dataset.webm:v.dataset.mp4));
      v.addEventListener('playing',()=>v.classList.add('on'),{once:true});
      v.addEventListener('error',()=>{const c=v.currentSrc||v.src;if(/\.webm$/.test(c)){v.src=v.dataset.mp4;v.play().catch(()=>{})}else if(canWebm&&v.dataset.webm&&!v.dataset.triedW){v.dataset.triedW=1;v.src=v.dataset.webm;v.play().catch(()=>{})}});
      v.play().catch(()=>{})};
    const lbl=t=>{tg.querySelector('.hv-lbl').textContent=t};
    if(!saveData){
      tg.hidden=false;
      let paused=still();
      const apply=()=>{tg.setAttribute('aria-pressed',paused);lbl(paused?'تشغيل الفيديو':'إيقاف الفيديو');if(paused){v.pause();v.classList.remove('on')}else{load();v.play().catch(()=>{});v.classList.add('on')}};
      tg.addEventListener('click',()=>{started=true;paused=!paused;try{localStorage.setItem('mbz-hv',paused?'0':'1')}catch(e){}apply()});
      try{if(localStorage.getItem('mbz-hv')==='0')paused=true}catch(e){}
      /* perf: the poster is the first paint; the video loads after the page is idle (desktop) or on the first interaction (phones) */
      tg.setAttribute('aria-pressed',paused);lbl(paused?'تشغيل الفيديو':'إيقاف الفيديو');
      let started=false;const start=()=>{if(started)return;started=true;['pointerdown','touchstart','scroll','keydown'].forEach(e=>removeEventListener(e,start));apply()};
      if(paused)started=true,apply();
      else if(small)['pointerdown','touchstart','scroll','keydown'].forEach(e=>addEventListener(e,start,{once:true,passive:true}));
      else{const idle=()=>('requestIdleCallback' in window)?requestIdleCallback(start,{timeout:2500}):setTimeout(start,1200);document.readyState==='complete'?idle():addEventListener('load',idle,{once:true})}
      document.addEventListener('mbz-calm',e=>{if(e.detail){paused=true;apply()}});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)v.pause();else if(!paused)v.play().catch(()=>{})});
      new IntersectionObserver(es=>es.forEach(en=>{if(paused)return;en.isIntersecting?v.play().catch(()=>{}):v.pause()})).observe(v);
    }
  }
  /* scroll progress */
  const sp=document.createElement('div');sp.className='scroll-progress';sp.setAttribute('aria-hidden','true');document.body.appendChild(sp);
  let tk=false;addEventListener('scroll',()=>{if(tk)return;tk=true;requestAnimationFrame(()=>{const h=document.documentElement.scrollHeight-innerHeight;sp.style.setProperty('--sp',h>0?(scrollY/h).toFixed(4):0);tk=false})},{passive:true});
  /* magnetic primary buttons + tilt cards (pointer: fine only) */
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.hero-actions .btn,.btn-primary.big,.xp-cta').forEach(b=>{b.classList.add('magnetic');
      b.addEventListener('pointermove',e=>{if(still())return;const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.28}px)`});
      b.addEventListener('pointerleave',()=>{b.style.transform=''})});
    $$('[data-tilt],.qa>a,.lgc,.xp-card,.co-card,.clg-card').forEach(c=>{c.setAttribute('data-tilt','');
      c.addEventListener('pointermove',e=>{if(still())return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateZ(0)`});
      c.addEventListener('pointerleave',()=>{c.style.transform=''})});
  }
})();
/* ===== apply wizard: voice assistant + digital applicant card (demo) ===== */
(function(){
  const $=(s,r=document)=>r.querySelector(s);
  const form=$('#wz-form');if(!form)return;
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  /* voice assistant panel */
  const box=document.createElement('div');box.className='va';box.innerHTML=`<button type="button" class="btn btn-ghost va-btn" aria-expanded="false"><span class="va-dot" aria-hidden="true"></span>المساعد الصوتي للتقديم <span class="xp-badge">تجريبي</span></button>
   <div class="va-panel" hidden><p class="va-msg" aria-live="polite">سأسألك عن بياناتك الشخصية خطوة بخطوة، وأملأ الحقول بما تقوله. لا يُرسل أي شيء؛ التعرّف على الكلام يتم عبر متصفحك.</p>
   <div class="va-acts"><button type="button" class="btn btn-primary va-start">ابدأ</button><button type="button" class="btn btn-ghost va-stop" hidden>إيقاف</button></div></div>`;
  form.parentElement.insertBefore(box,form);
  const btn=box.querySelector('.va-btn'),panel=box.querySelector('.va-panel'),msg=box.querySelector('.va-msg'),start=box.querySelector('.va-start'),stop=box.querySelector('.va-stop');
  btn.addEventListener('click',()=>{const o=panel.hidden;panel.hidden=!o;btn.setAttribute('aria-expanded',o)});
  const say=t=>new Promise(r=>{msg.textContent=t;if(!('speechSynthesis' in window))return r();const u=new SpeechSynthesisUtterance(t);u.lang='ar-AE';u.rate=1;u.onend=r;u.onerror=r;speechSynthesis.cancel();speechSynthesis.speak(u);setTimeout(r,6000)});
  const AD='٠١٢٣٤٥٦٧٨٩';const digits=s=>s.replace(/[٠-٩]/g,d=>AD.indexOf(d)).replace(/[^\d+]/g,'');
  const listen=()=>new Promise((res,rej)=>{const r=new SR();r.lang='ar-AE';r.interimResults=false;r.maxAlternatives=1;let got=false;r.onresult=e=>{got=true;res(e.results[0][0].transcript)};r.onerror=e=>rej(e.error);r.onend=()=>{if(!got)rej('no-speech')};r.start();cur=r});
  let cur=null,running=false;
  const fill=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));el.classList.add('va-filled');setTimeout(()=>el.classList.remove('va-filled'),1500)};
  const pickSel=(sel,t)=>{const n=s=>s.replace(/[إأآ]/g,'ا').replace(/ة/g,'ه');const o=[...sel.options].find(o=>o.value&&(n(o.text).includes(n(t))||n(t).includes(n(o.text))));if(o){fill(sel,o.value);return o.text}return null};
  const FIELDS=[['f-name','ما اسمك الكامل كما في الهوية؟',v=>v],['f-phone','ما رقم هاتفك المتحرك؟ قل الأرقام واحداً تلو الآخر.',v=>digits(v)],['f-nat','ما فئة جنسيتك؟',null],['f-campus','أي فرع تفضّل؟ أبوظبي أم عجمان أم الظفرة؟',null],['f-cert','ما نوع شهادتك الثانوية؟',null]];
  start.addEventListener('click',async()=>{
    if(!SR){await say('عذراً، متصفحك لا يدعم التعرّف على الكلام. جرّب Chrome أو Edge، أو املأ الحقول يدوياً.');return}
    running=true;start.hidden=true;stop.hidden=false;
    const goStep=document.querySelector('[data-goto="2"]');if(goStep&&!goStep.disabled)goStep.click();
    for(const [id,q,f] of FIELDS){if(!running)break;const el=document.getElementById(id);if(!el||el.offsetParent===null)continue;
      await say(q);try{const t=await listen();if(el.tagName==='SELECT'){const p=pickSel(el,t);await say(p?('تم اختيار: '+p):('لم أجد خياراً يطابق «'+t+'». يمكنك اختياره يدوياً.'))}else{fill(el,f(t));await say('سجّلت: '+el.value)}}catch(e){await say(e==='not-allowed'?'يلزم السماح باستخدام الميكروفون.':'لم ألتقط إجابة، سننتقل للسؤال التالي.');if(e==='not-allowed')break}}
    running=false;start.hidden=false;stop.hidden=true;await say('انتهينا. راجع الحقول ثم تابع إلى الخطوة التالية. البريد الإلكتروني وتاريخ الميلاد يُملآن يدوياً.')});
  stop.addEventListener('click',()=>{running=false;try{cur&&cur.abort()}catch(e){}speechSynthesis&&speechSynthesis.cancel();start.hidden=false;stop.hidden=true;msg.textContent='تم الإيقاف.'});
  /* digital applicant card after the demo submission */
  const done=$('#wz-done');if(!done)return;
  new MutationObserver(()=>{if(done.hidden||done.querySelector('.ac-wrap'))return;let a=null;try{a=JSON.parse(localStorage.getItem('mbz-apps')||'[]')[0]}catch(e){}if(!a)return;
    const w=document.createElement('div');w.className='ac-wrap';w.innerHTML=`<h3>بطاقة المتقدّم الرقمية</h3><canvas class="ac-canvas" width="1200" height="720" aria-label="بطاقة المتقدّم: ${esc(a.name)}"></canvas><div class="hero-actions" style="justify-content:center"><button type="button" class="btn btn-primary ac-dl">نزّل البطاقة PNG</button><button type="button" class="btn btn-ghost ac-home">أضِف الموقع إلى الشاشة الرئيسية</button></div><p class="muted-note">بطاقة تجريبية للعرض فقط — ليست وثيقة رسمية.</p>`;
    done.appendChild(w);const c=w.querySelector('canvas'),x=c.getContext('2d');
    const draw=()=>{const g=x.createLinearGradient(0,0,1200,720);g.addColorStop(0,'#1f2d27');g.addColorStop(1,'#0c1210');x.fillStyle=g;x.fillRect(0,0,1200,720);
      x.globalAlpha=.08;x.strokeStyle='#f0c886';for(let i=0;i<12;i++){x.beginPath();x.arc(1080,120,40+i*48,0,7);x.stroke()}x.globalAlpha=1;
      x.fillStyle='#f0c886';x.fillRect(0,0,1200,10);x.direction='rtl';x.textAlign='right';x.fillStyle='#f0c886';x.font='700 30px "IBM Plex Sans Arabic",sans-serif';x.fillText('بطاقة متقدّم — نسخة تجريبية',1130,110);
      x.fillStyle='#fff';x.font='700 64px "IBM Plex Sans Arabic",sans-serif';x.fillText(a.name||'—',1130,230);
      x.fillStyle='#d9d1c2';x.font='500 32px "IBM Plex Sans Arabic",sans-serif';x.fillText(a.prog||'',1130,300);x.fillText(a.college||'',1130,350);
      x.fillStyle='#f0c886';x.font='700 30px "IBM Plex Sans Arabic",sans-serif';x.fillText('رقم الطلب',1130,460);x.fillText('التاريخ',700,460);
      x.fillStyle='#fff';x.font='700 44px monospace';x.textAlign='right';x.fillText(a.ref,1130,520);x.fillText(a.date,700,520);
      x.textAlign='left';x.fillStyle='#cfc6b4';x.font='500 24px "IBM Plex Sans Arabic",sans-serif';x.fillText('جامعة محمد بن زايد للعلوم الإنسانية',70,650);
      for(let i=0;i<22;i++){x.fillStyle=i%3?'#f0c886':'#4e6a5f';x.fillRect(70+i*14,560,8,40+((a.ref.charCodeAt(i%a.ref.length)*7)%20))}
      const lg=new Image();lg.onload=()=>{x.save();x.filter='brightness(0) invert(1)';x.drawImage(lg,70,60,220,220*lg.naturalHeight/lg.naturalWidth);x.restore()};lg.src='assets/img/o/footer-logo-e3c6e2.webp'};
    document.fonts.ready.then(draw);
    w.querySelector('.ac-dl').addEventListener('click',()=>c.toBlob(b=>{const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='mbzuh-applicant-'+a.ref+'.png';l.click()},'image/png'));
    const hb=w.querySelector('.ac-home');hb.addEventListener('click',async()=>{if(window.__mbzInstall){window.__mbzInstall.prompt();}else{alert('لإضافة الموقع إلى الشاشة الرئيسية: افتح قائمة المتصفح واختر «إضافة إلى الشاشة الرئيسية» أو «تثبيت التطبيق».')}});
  }).observe(done,{attributes:true,childList:true});
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.__mbzInstall=e});
})();
/* ===== voice search in the site search dialog ===== */
(function(){
  const inp=document.getElementById('search-input');const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!inp||!SR||inp.parentElement.querySelector('.vs-mic'))return;
  const b=document.createElement('button');b.type='button';b.className='icon-btn vs-mic';b.setAttribute('aria-label','بحث صوتي');b.title='بحث صوتي (بالعربية)';
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  inp.insertAdjacentElement('afterend',b);
  b.addEventListener('click',()=>{const r=new SR();r.lang='ar-AE';b.classList.add('rec');r.onresult=e=>{inp.value=e.results[0][0].transcript;inp.dispatchEvent(new Event('input',{bubbles:true}));inp.focus()};r.onend=()=>b.classList.remove('rec');r.onerror=()=>b.classList.remove('rec');r.start()});
})();
