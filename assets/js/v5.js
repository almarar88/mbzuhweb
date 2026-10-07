/* v5: command palette, personalisation, badges, share cards, offline saving, install prompt,
   micro-interactions, language curtain, lab: schedule fit / discounts / grounded FAQ. Demo only, no network calls. */
(()=>{
'use strict';
const SC=document.currentScript;const ROOT=(SC&&SC.dataset.root)||'';
const rootURL=new URL(ROOT||'./',location.href);
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('calm');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي');
const EN=document.documentElement.lang==='en';
const rel=p=>new URL(p,rootURL).href;
const here=decodeURI(location.pathname).replace(decodeURI(rootURL.pathname),'')||'index.html';
const vt=fn=>{if(document.startViewTransition&&!still())document.startViewTransition(fn);else fn()};

/* ---------- toast ---------- */
let toastBox;
function toast(html,opt={}){
  if(!toastBox){toastBox=document.createElement('div');toastBox.className='v5-toasts';toastBox.setAttribute('role','status');toastBox.setAttribute('aria-live','polite');document.body.appendChild(toastBox)}
  const t=document.createElement('div');t.className='v5-toast'+(opt.cls?' '+opt.cls:'');t.innerHTML=html;toastBox.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('in'));
  const kill=()=>{t.classList.remove('in');setTimeout(()=>t.remove(),400)};setTimeout(kill,opt.ms||4200);t.addEventListener('click',e=>{if(e.target.closest('[data-x]'))kill()});return t;
}
/* ---------- generic dialog ---------- */
function dlg(cls,title,inner){
  const d=document.createElement('dialog');d.className='v5-dlg '+cls;d.setAttribute('aria-label',title);
  d.innerHTML=`<div class="v5-dlg-in"><header><h2>${esc(title)}</h2><button class="icon-btn" type="button" data-close aria-label="${EN?'Close':'إغلاق'}">✕</button></header><div class="v5-dlg-b">${inner}</div></div>`;
  document.body.appendChild(d);d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))d.close()});d.addEventListener('close',()=>setTimeout(()=>d.remove(),250));d.showModal();return d;
}

/* =============== BADGES =============== */
const visits=new Set(LS.get('mbz-visits',[]));visits.add(here);LS.set('mbz-visits',[...visits]);
const flags=LS.get('mbz-flags',{});
const cnt=re=>[...visits].filter(p=>re.test(p)).length;
const BADGES=[
 ['first','الخطوة الأولى','زرتَ الموقع التجريبي لأول مرة.','👣',()=>[1,1]],
 ['news','قارئ الأخبار','اقرأ ثلاثة أخبار أو مقالات.','📰',()=>[cnt(/^(news\/|magazine\/n-)/),3]],
 ['books','صديق الكتب','زُر ثلاث صفحات للإصدارات أو الكتب.','📚',()=>[cnt(/^(store\.html|publications\.html|lab\/bookshelf\.html|magazine\/b-)/),3]],
 ['colleges','رحّالة الكليات','زُر صفحات الكليات الأربع.','🏛️',()=>[cnt(/^colleges\//),4]],
 ['clubs','روح الفريق','استكشف ثلاثة أندية طلابية.','⚽',()=>[cnt(/^clubs\//),3]],
 ['lab','مستكشف المختبر','جرّب خمس تجارب من مختبر الجامعة.','🧪',()=>[cnt(/^lab\//),5]],
 ['apply','جاهز للانطلاق','زُر البرامج والقبول ونموذج التقديم.','🎓',()=>[['programs.html','admission.html','apply.html'].filter(p=>visits.has(p)).length,3]],
 ['ce','متعلّم مدى الحياة','زُر مركز التعليم المستمر وإحدى صفحات تسجيل اللغات.','🌍',()=>[(visits.has('continuous-education.html')?1:0)+(cnt(/^ce\/register\//)?1:0),2]],
 ['night','بومة الليل','تصفّحتَ الموقع ليلاً بتوقيت الإمارات.','🦉',()=>[flags.night?1:0,1]],
 ['keys','سيد الاختصارات','استخدمت لوحة الأوامر (Ctrl+K).','⌨️',()=>[flags.palette?1:0,1]],
 ['calm','قارئ هادئ','فعّلت وضع القراءة الهادئة.','🍃',()=>[flags.calm?1:0,1]],
 ['explorer','رحّالة الموقع','زُر 25 صفحة مختلفة.','🧭',()=>[visits.size,25]],
];
function setFlag(k){if(!flags[k]){flags[k]=1;LS.set('mbz-flags',flags);checkBadges()}}
function checkBadges(quiet){
  const got=new Set(LS.get('mbz-badges',[]));const fresh=[];
  for(const b of BADGES){const [n,m]=b[4]();if(n>=m&&!got.has(b[0])){got.add(b[0]);fresh.push(b)}}
  if(fresh.length){LS.set('mbz-badges',[...got]);if(!quiet&&!EN)fresh.filter(b=>b[0]!=='first').slice(0,2).forEach((b,i)=>setTimeout(()=>toast(`<span class="v5-bdg-pop" aria-hidden="true">${b[3]}</span><span><small>شارة جديدة!</small><b>${esc(b[1])}</b></span><button type="button" class="v5-tlink" data-badges>شاراتي (${got.size}/${BADGES.length})</button>`,{cls:'v5-toast-badge',ms:5200}),600+i*1400))}
}
function openBadges(){
  const got=new Set(LS.get('mbz-badges',[]));
  dlg('v5-badges',`شاراتي — ${got.size} من ${BADGES.length}`,`<p class="v5-muted">شارات للمتعة تُفتح كلما استكشفت الموقع، وتُحفظ في متصفحك فقط.</p><ul class="v5-bgrid">${BADGES.map(b=>{const [n,m]=b[4]();const on=got.has(b[0]);return `<li class="v5-b${on?' on':''}"><span class="v5-b-ic" aria-hidden="true">${b[3]}</span><b>${esc(b[1])}</b><small>${esc(b[2])}</small><span class="v5-b-bar" style="--p:${Math.min(1,n/m)}"><i></i></span><span class="v5-b-n">${on?'✓ مفتوحة':Math.min(n,m)+' / '+m}</span></li>`}).join('')}</ul><div class="v5-dlg-acts"><button class="btn btn-ghost" type="button" data-reset-badges>إعادة الضبط</button></div>`);
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-badges]')){e.preventDefault();openBadges()}
  if(e.target.closest('[data-reset-badges]')){LS.set('mbz-badges',[]);LS.set('mbz-visits',[here]);LS.set('mbz-flags',{});e.target.closest('dialog').close()}
  if(e.target.closest('[data-saved]')){e.preventDefault();openSaved()}
});
if(document.documentElement.dataset.tod==='night'||(()=>{const h=+new Intl.DateTimeFormat('en-GB',{hour:'numeric',hourCycle:'h23',timeZone:'Asia/Dubai'}).format(new Date());return h>=20||h<5})())flags.night=1,LS.set('mbz-flags',flags);
addEventListener('mbz-calm',()=>{if(document.documentElement.classList.contains('calm'))setFlag('calm')});
document.addEventListener('click',e=>{if(e.target.closest('[data-calm-toggle]'))setTimeout(()=>{if(document.documentElement.classList.contains('calm'))setFlag('calm')},50)});
setTimeout(()=>checkBadges(),900);

/* =============== COMMAND PALETTE =============== */
const ICON={go:'↗',act:'⚡',doc:'📄',lab:'✦',lang:'🌐',moon:'🌙',sun:'☀️',leaf:'🍃',badge:'🏅',save:'📥',link:'🔗',voice:'🔊',print:'🖨️',home:'🏠',up:'⬆️',user:'👤'};
function actions(){
  const dark=document.documentElement.dataset.theme==='dark',calm=document.documentElement.classList.contains('calm');
  const A=[
   ['قدّم طلب الالتحاق','apply تقديم طلب التحاق قبول','act',{href:'apply.html'}],
   ['سجّل في دورة اللغة الإنجليزية','register english انجليزي انجليزيه دوره لغه تسجيل','lang',{href:'ce/register/english.html'}],
   ['سجّل في دورة اللغة الفرنسية','register french فرنسي فرنسيه دوره تسجيل','lang',{href:'ce/register/french.html'}],
   ['سجّل في دورة اللغة الروسية','register russian روسي روسيه دوره تسجيل','lang',{href:'ce/register/russian.html'}],
   ['سجّل في دورة اللغة الصينية','register chinese صيني صينيه دوره تسجيل','lang',{href:'ce/register/chinese.html'}],
   [dark?'الوضع الفاتح':'الوضع الداكن','dark mode light theme داكن فاتح ليلي سمه',dark?'sun':'moon',{run:()=>$('[data-theme-toggle]')?.click()}],
   [calm?'إيقاف وضع القراءة الهادئة':'وضع القراءة الهادئة','calm mode reader هادئ قراءه خط كبير','leaf',{run:()=>$('[data-calm-toggle]')?.click()}],
   [EN?'النسخة العربية':'English version','english arabic language لغه انجليزي عربي','lang',{href:EN?'index.html':'en/index.html',lang:1}],
   ['شاراتي','badges achievements شارات انجازات','badge',{run:openBadges}],
   ['المقالات المحفوظة للقراءة دون اتصال','saved offline محفوظ بدون انترنت','save',{run:openSaved}],
   ['خصّص الصفحة الرئيسية (من أنت؟)','personalize home تخصيص زائر طالب موظف باحث ولي امر','user',{run:()=>{LS.set('mbz-persona','');location.href=rel('index.html#persona')}}],
   ['انسخ رابط الصفحة','copy link رابط نسخ','link',{run:()=>{navigator.clipboard?.writeText(location.href.split('#')[0]).then(()=>toast('✓ نُسخ الرابط'))}}],
   [speechSynthesis&&speechSynthesis.speaking?'أوقف القراءة الصوتية':'اقرأ الصفحة بصوت عالٍ','read aloud speak صوت قراءه استماع','voice',{run:readAloud}],
   ['اطبع الصفحة','print طباعه','print',{run:()=>print()}],
   ['إلى أعلى الصفحة','top اعلى','up',{run:()=>scrollTo({top:0,behavior:still()?'auto':'smooth'})}],
  ];
  const P=[['الرئيسية','index.html','home'],['مستكشف البرامج','programs.html'],['القبول والتسجيل','admission.html'],['التعليم المستمر','continuous-education.html'],['الأخبار','news.html'],['المجلة','magazine.html'],['متجر الإصدارات','store.html'],['الأندية الطلابية','clubs.html'],['الحياة الجامعية','university-life.html'],['البحث العلمي','research.html'],['الإصدارات','publications.html'],['أعضاء هيئة التدريس','faculty.html'],['بوابة الطالب','student.html'],['بوابة الموظف','staff.html'],['دليل الطالب','student-manual.html'],['عن الجامعة','about.html'],['اتصل بنا','contact.html'],['مختبر الجامعة','lab.html','lab'],
   ['قارن البرامج','lab/compare.html','lab'],['اختبار الشخصية الأكاديمية','lab/quiz.html','lab'],['هل يناسبني موعد الدورة؟','lab/schedule.html','lab'],['مدقّق الخصومات','lab/discounts.html','lab'],['الأسئلة الشائعة الذكية','lab/faq.html','lab'],['التقويم والفعاليات','lab/calendar.html','lab'],['اسمك بالخط العربي','lab/calligraphy.html','lab'],['رفّ الإصدارات ثلاثي الأبعاد','lab/bookshelf.html','lab'],['جولة افتراضية','lab/tour.html','lab']];
  return [...A.map(a=>({t:a[0],k:norm(a[0]+' '+a[1]),ic:ICON[a[2]],g:'أوامر',...a[3]})),...P.map(p=>({t:p[0],k:norm(p[0]+' '+p[1]),ic:ICON[p[2]||'go'],g:'صفحات',href:p[1]}))];
}
let pal=null;
function openPalette(q=''){
  if(pal&&pal.open)return;setFlag('palette');
  const d=document.createElement('dialog');d.className='v5-pal';d.setAttribute('aria-label','لوحة الأوامر');
  const sr=('webkitSpeechRecognition' in window)||('SpeechRecognition' in window);
  d.innerHTML=`<div class="v5-pal-in"><div class="v5-pal-top"><span class="v5-pal-k" aria-hidden="true">⌘K</span><input type="text" role="combobox" aria-expanded="true" aria-controls="v5-pal-l" aria-autocomplete="list" placeholder="اكتب أمراً أو ابحث… (قدّم، الإنجليزية، الوضع الداكن، الشارات)" autocomplete="off" spellcheck="false">${sr?'<button type="button" class="icon-btn v5-pal-mic" aria-label="بحث صوتي">🎙️</button>':''}</div><ul class="v5-pal-l" id="v5-pal-l" role="listbox" aria-label="النتائج"></ul><footer><span><kbd>↑</kbd><kbd>↓</kbd> للتنقل</span><span><kbd>Enter</kbd> للتنفيذ</span><span><kbd>Esc</kbd> للإغلاق</span><span class="v5-pal-demo">نسخة تجريبية</span></footer></div>`;
  document.body.appendChild(d);pal=d;d.showModal();
  const inp=$('input',d),list=$('ul',d);let items=[],sel=0;const ACT=actions();
  const render=()=>{
    const q=norm(inp.value.trim());const terms=q.split(/\s+/).filter(Boolean);
    let res=ACT.filter(a=>terms.every(t=>a.k.includes(t)));if(!q)res=ACT.filter(a=>a.g==='أوامر').slice(0,9).concat(ACT.filter(a=>a.g==='صفحات').slice(0,6));
    if(q.length>1&&window.MBZ_INDEX){const seen=new Set(res.map(r=>r.href));const hits=[];for(const d0 of MBZ_INDEX){const n=norm(d0.t+' '+d0.x);if(terms.every(t=>n.includes(t))){const base=d0.u.split('#')[0];if(seen.has(base))continue;seen.add(base);hits.push({t:d0.t,sub:d0.s,ic:ICON.doc,g:'من محتوى الموقع',href:d0.u,score:(norm(d0.t).includes(q)?2:0)});if(hits.length>40)break}}hits.sort((a,b)=>b.score-a.score);res=res.concat(hits.slice(0,8))}
    items=res.slice(0,22);sel=Math.min(sel,Math.max(0,items.length-1));let g='';
    list.innerHTML=items.length?items.map((it,i)=>{const h=it.g!==g?`<li class="v5-pal-g" role="presentation">${esc(g=it.g)}</li>`:'';return h+`<li role="option" id="v5o-${i}" class="v5-pal-i${i===sel?' sel':''}" aria-selected="${i===sel}" data-i="${i}"><span class="v5-pal-ic" aria-hidden="true">${it.ic}</span><span class="v5-pal-t">${esc(it.t)}${it.sub?`<small>${esc(it.sub)}</small>`:''}</span><span class="v5-pal-go" aria-hidden="true">↵</span></li>`}).join(''):`<li class="v5-pal-empty">لا نتائج لـ «${esc(inp.value)}» — جرّب كلمة أخرى.</li>`;
    inp.setAttribute('aria-activedescendant',items.length?'v5o-'+sel:'');
  };
  const run=i=>{const it=items[i];if(!it)return;d.close();if(it.run)return it.run();if(it.lang)return langGo(rel(it.href));location.href=rel(it.href)};
  inp.addEventListener('input',()=>{sel=0;render()});
  inp.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();sel=(sel+1)%Math.max(1,items.length);render();$('.sel',list)?.scrollIntoView({block:'nearest'})}else if(e.key==='ArrowUp'){e.preventDefault();sel=(sel-1+items.length)%Math.max(1,items.length);render();$('.sel',list)?.scrollIntoView({block:'nearest'})}else if(e.key==='Enter'){e.preventDefault();run(sel)}});
  list.addEventListener('click',e=>{const li=e.target.closest('[data-i]');if(li)run(+li.dataset.i)});
  list.addEventListener('mousemove',e=>{const li=e.target.closest('[data-i]');if(li&&+li.dataset.i!==sel){sel=+li.dataset.i;$$('.v5-pal-i',list).forEach(x=>{const on=+x.dataset.i===sel;x.classList.toggle('sel',on);x.setAttribute('aria-selected',on)})}});
  d.addEventListener('click',e=>{if(e.target===d)d.close()});d.addEventListener('close',()=>setTimeout(()=>{d.remove();if(pal===d)pal=null},200));
  const mic=$('.v5-pal-mic',d);if(mic)mic.addEventListener('click',()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new R();r.lang='ar-AE';mic.classList.add('rec');r.onresult=ev=>{inp.value=ev.results[0][0].transcript;render()};r.onend=()=>mic.classList.remove('rec');try{r.start()}catch(e){mic.classList.remove('rec')}});
  inp.value=q;render();setTimeout(()=>inp.focus(),10);
}
window.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();pal&&pal.open?pal.close():openPalette()}},true);
document.addEventListener('click',e=>{const t=e.target.closest('.search-trigger');if(t&&!EN){e.preventDefault();e.stopImmediatePropagation();openPalette()}},true);
function readAloud(){if(!window.speechSynthesis)return;if(speechSynthesis.speaking){speechSynthesis.cancel();return}const m=$('main')||document.body;const txt=[...m.querySelectorAll('h1,h2,p,li')].filter(x=>x.offsetParent&&!x.closest('nav,footer,.xp-mini')).map(x=>x.textContent.trim()).filter(Boolean).join('. ').slice(0,3800);const u=new SpeechSynthesisUtterance(txt);u.lang=EN?'en-GB':'ar-AE';u.rate=1;speechSynthesis.speak(u);toast('🔊 بدأت القراءة الصوتية — افتح لوحة الأوامر لإيقافها')}

/* =============== LANGUAGE CURTAIN =============== */
function langGo(href){
  if(still()){location.href=href;return}
  const c=document.createElement('div');c.className='v5-curtain';c.innerHTML=`<span>${EN?'العربية':'English'}</span>`;document.body.appendChild(c);
  try{sessionStorage.setItem('mbz-curtain',EN?'ar':'en')}catch(e){}
  requestAnimationFrame(()=>c.classList.add('in'));setTimeout(()=>location.href=href,520);
}
document.addEventListener('click',e=>{const a=e.target.closest('a[lang][href]');if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.button)return;const h=a.getAttribute('href');if(!/(^|\/)(en\/)?index\.html$/.test(h))return;if((a.lang==='en')===EN)return;e.preventDefault();langGo(a.href)});
try{const k=sessionStorage.getItem('mbz-curtain');if(k){sessionStorage.removeItem('mbz-curtain');if(!still()){const c=document.createElement('div');c.className='v5-curtain in out';c.innerHTML=`<span>${k==='en'?'English':'العربية'}</span>`;document.body.appendChild(c);requestAnimationFrame(()=>requestAnimationFrame(()=>c.classList.remove('in')));setTimeout(()=>c.remove(),900)}}}catch(e){}

/* =============== PERSONALISATION (home) =============== */
const qaSec=$('section[aria-labelledby="qa-h"]');
if(qaSec&&$('#lab-home')&&!EN){
  const sis=$('a[href^="https://sis.mbzuh.ac.ae"]')?.href,d2l=$('a[href^="https://d2l.mbzuh.ac.ae"]')?.href;
  const P={
   pro:['طالب مستقبلي','🎓',[['مستكشف البرامج','programs.html','ابحث وفلتر'],['اختبار الشخصية الأكاديمية','lab/quiz.html','أي كلية تناسبك؟'],['القبول والتسجيل','admission.html','الشروط والخطوات'],['قارن البرامج','lab/compare.html','جنباً إلى جنب']],['lab-home','colleges','journey','why','numbers']],
   cur:['طالب حالي','📘',[['بوابة الطالب','student.html','خدماتك'],sis&&['نظام معلومات الطلاب',sis,'SIS',1],d2l&&['منصة التعلم D2L',d2l,'المقررات',1],['دليل الطالب','student-manual.html','اللوائح والأدلة'],['التقويم والفعاليات','lab/calendar.html','أضف المواعيد'],['الأندية الطلابية','clubs.html','انضم']].filter(Boolean).slice(0,4),['services','news','timeline','lab-home']],
   stf:['موظف','💼',[['بوابة الموظف','staff.html','خدماتك'],d2l&&['منصة التعلم D2L',d2l,'المقررات',1],['البحث العلمي','research.html','المراكز والمنشورات'],['التقويم والفعاليات','lab/calendar.html','المواعيد']].filter(Boolean),['services','news','publications','welcome']],
   par:['ولي أمر','👪',[['عن الجامعة','about.html','الرؤية والقيم'],['القبول والتسجيل','admission.html','الشروط'],['جولة افتراضية','lab/tour.html','المرافق'],['اتصل بنا','contact.html','الفروع والهواتف']],['why','about','numbers','campuses','colleges']],
   res:['باحث','🔬',[['البحث العلمي','research.html','المراكز'],['الإصدارات','publications.html','كتب الجامعة'],['المجلة','magazine.html','مقالات وأخبار'],['أعضاء هيئة التدريس','faculty.html','الخبرات']],['publications','accreditations','news','about']],
  };
  const band=document.createElement('section');band.className='sec v5-persona';band.id='persona';band.setAttribute('aria-labelledby','ps-h');
  band.innerHTML=`<div class="container"><div class="ps-card"><div class="ps-head"><span class="kicker">تجربة مخصّصة</span><h2 id="ps-h">أنا…</h2><p>اختر ما يصفك وسنعيد ترتيب الصفحة الرئيسية ونقترح لك أهم الروابط. يُحفظ اختيارك في متصفحك فقط.</p></div><div class="ps-opts" role="group" aria-label="نوع الزائر">${Object.entries(P).map(([k,v])=>`<button type="button" class="ps-opt" data-ps="${k}" aria-pressed="false"><span aria-hidden="true">${v[1]}</span>${v[0]}</button>`).join('')}</div><div class="ps-out" id="ps-out" hidden></div></div></div>`;
  qaSec.after(band);
  const orig=[...band.parentNode.children];
  const apply=(k,anim)=>{
    const go=()=>{
      $$('.ps-opt',band).forEach(b=>b.setAttribute('aria-pressed',b.dataset.ps===k));
      const out=$('#ps-out',band);const par=band.parentNode;
      orig.forEach(n=>par.appendChild(n));
      if(!k||!P[k]){out.hidden=true;return}
      const v=P[k];let ref=band;
      v[3].forEach(id=>{const s=document.getElementById(id);if(s&&s.parentNode===par){ref.after(s);ref=s}});
      out.hidden=false;out.innerHTML=`<p class="ps-for">مختارات لـ<b>«${v[0]}»</b>، وقد رتّبنا الأقسام التالية لتناسبك.</p><div class="ps-links">${v[2].map(l=>`<a class="ps-link" href="${l[3]?esc(l[1]):esc(rel(l[1]))}"${l[3]?' target="_blank" rel="noopener"':''}><b>${esc(l[0])}</b><small>${esc(l[2])}${l[3]?' ↗':''}</small></a>`).join('')}</div><button type="button" class="ps-reset">↺ الترتيب الافتراضي</button>`;
      $$('.reveal',par).forEach(x=>x.classList.add('in','is-in','visible'));
    };anim?vt(go):go();
  };
  band.addEventListener('click',e=>{const b=e.target.closest('[data-ps]');if(b){const k=b.getAttribute('aria-pressed')==='true'?'':b.dataset.ps;LS.set('mbz-persona',k);apply(k,true);if(k)toast(`${P[k][1]} رتّبنا الصفحة لـ<b>«${P[k][0]}»</b>`)}if(e.target.closest('.ps-reset')){LS.set('mbz-persona','');apply('',true)}});
  const saved=LS.get('mbz-persona','');if(saved)apply(saved,false);
}

/* =============== ARTICLE TOOLS: share card + save offline =============== */
const art=/^(news\/|magazine\/)/.test(here)&&$('main h1');
if(art&&!EN){
  const h1=$('main h1');const title=h1.textContent.trim();
  const img=$('main .ar-head img, main .ar img, main #na-text img, main img[width="1200"], main article img')||$('main img');
  const date=(()=>{const t=$('main time');if(t&&t.textContent.trim())return t.textContent.trim();const m=($('main .ar-meta, main .nw-meta')?.textContent||'').match(/\d{1,2}\s+[\u0600-\u06FF]+\s+\d{4}/);return m?m[0]:''})();
  const bar=document.createElement('div');bar.className='v5-art';
  const isSaved=()=>LS.get('mbz-saved-list',[]).some(x=>x.u===here);
  bar.innerHTML=`<button type="button" class="btn btn-ghost v5-sc-btn">🖼️ بطاقة مشاركة</button>${'caches' in window?`<button type="button" class="btn btn-ghost v5-sv-btn" aria-pressed="${isSaved()}">${isSaved()?'✓ محفوظ للقراءة دون اتصال':'📥 احفظ للقراءة دون اتصال'}</button><button type="button" class="v5-tlink" data-saved>المحفوظات</button>`:''}`;
  (h1.closest('header')||h1).after(bar);
  $('.v5-sc-btn',bar).addEventListener('click',()=>shareCard(title,img,date));
  const sv=$('.v5-sv-btn',bar);if(sv)sv.addEventListener('click',async()=>{
    let L=LS.get('mbz-saved-list',[]);
    if(isSaved()){L=L.filter(x=>x.u!==here);LS.set('mbz-saved-list',L);try{const c=await caches.open('mbz-saved');await c.delete(location.href.split('#')[0])}catch(e){}sv.setAttribute('aria-pressed','false');sv.textContent='📥 احفظ للقراءة دون اتصال';toast('أُزيل من المحفوظات');return}
    sv.disabled=true;sv.textContent='… جارٍ الحفظ';
    try{const c=await caches.open('mbz-saved');const urls=new Set([location.href.split('#')[0]]);$$('link[rel=stylesheet],script[src]').forEach(x=>{const u=x.href||x.src;if(u&&u.startsWith(location.origin))urls.add(u)});$$('main img').forEach(i=>{const u=i.currentSrc||i.src;if(u&&u.startsWith(location.origin))urls.add(u)});
      await Promise.all([...urls].map(u=>c.add(u).catch(()=>{})));
      L.unshift({u:here,t:title,img:img?(img.currentSrc||img.src).replace(rootURL.href,''):'',d:date,at:Date.now()});LS.set('mbz-saved-list',L.slice(0,40));
      sv.setAttribute('aria-pressed','true');sv.textContent='✓ محفوظ للقراءة دون اتصال';toast(`📥 حُفظ المقال (${urls.size} ملفاً) — يمكنك قراءته دون اتصال.`)}
    catch(e){sv.textContent='تعذّر الحفظ';}sv.disabled=false;
  });
}
function openSaved(){
  const L=LS.get('mbz-saved-list',[]);
  dlg('v5-saved',`المحفوظات (${L.length})`,L.length?`<p class="v5-muted">مقالات حفظتها للقراءة دون اتصال على هذا الجهاز.</p><ul class="v5-sl">${L.map(x=>`<li><a href="${esc(rel(x.u))}">${x.img?`<img src="${esc(rel(x.img))}" alt="" loading="lazy">`:''}<span><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></a></li>`).join('')}</ul>`:`<p class="v5-muted">لا توجد مقالات محفوظة بعد. افتح أي خبر أو مقال في المجلة واضغط «احفظ للقراءة دون اتصال».</p><a class="btn btn-primary" href="${rel('magazine.html')}">تصفّح المجلة</a>`);
}
if(/^offline\.html$/.test(here)){const L=LS.get('mbz-saved-list',[]);if(L.length){const m=$('main .container')||$('main');const s=document.createElement('div');s.className='v5-off';s.innerHTML=`<h2>محفوظاتك المتاحة دون اتصال</h2><ul class="v5-sl">${L.map(x=>`<li><a href="${esc(rel(x.u))}"><span><b>${esc(x.t)}</b><small>${esc(x.d)}</small></span></a></li>`).join('')}</ul>`;m.appendChild(s)}}

/* share card canvas */
window.mbzShareCard=(t,i,d)=>shareCard(t,i,d);
function shareCard(title,imgEl,date){
  const d=dlg('v5-share','بطاقة مشاركة',`<div class="v5-sh"><canvas width="1080" height="1350" aria-label="معاينة البطاقة"></canvas><div class="v5-sh-c"><fieldset><legend>النمط</legend><div class="v5-sh-th">${[['sand','رملي'],['night','ليلي'],['sage','زيتوني']].map((t,i)=>`<label class="chip"><input type="radio" name="v5th" value="${t[0]}"${i?'':' checked'}> ${t[1]}</label>`).join('')}</div></fieldset><fieldset><legend>المقاس</legend><div class="v5-sh-th"><label class="chip"><input type="radio" name="v5sz" value="p" checked> عمودي 4:5</label><label class="chip"><input type="radio" name="v5sz" value="s"> مربع</label><label class="chip"><input type="radio" name="v5sz" value="st"> قصة 9:16</label></div></fieldset><button class="btn btn-primary" type="button" data-dl>⬇ تنزيل PNG</button>${navigator.canShare?'<button class="btn btn-ghost" type="button" data-sh>↗ مشاركة</button>':''}<p class="v5-muted">البطاقة تحمل عنوان الخبر وصورته كما في الموقع، مع علامة «نسخة تجريبية».</p></div></div>`);
  const cv=$('canvas',d),x=cv.getContext('2d');const font=getComputedStyle(document.body).fontFamily;
  const logo=new Image();logo.src=$('.logo img, header img')?.src||'';const im=new Image();if(imgEl)im.src=imgEl.currentSrc||imgEl.src;
  const TH={sand:['#f4ecdd','#e7d6b6','#1c2a24','#9a6f2c'],night:['#0f1714','#1d2b25','#f6efe2','#e2b96a'],sage:['#1d6152','#0f3a32','#f6efe2','#f0c886']};
  const wrap=(t,maxW)=>{const w=t.split(/\s+/),L=[];let cur='';for(const s of w){const tst=cur?cur+' '+s:s;if(x.measureText(tst).width>maxW&&cur){L.push(cur);cur=s}else cur=tst}if(cur)L.push(cur);return L};
  const draw=()=>{
    const th=TH[$('input[name=v5th]:checked',d).value],sz=$('input[name=v5sz]:checked',d).value;
    cv.height=sz==='s'?1080:sz==='st'?1920:1350;const W=cv.width,H=cv.height;
    const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,th[0]);g.addColorStop(1,th[1]);x.fillStyle=g;x.fillRect(0,0,W,H);
    const ih=Math.round(H*(sz==='st'?.42:.46));
    if(im.complete&&im.naturalWidth){const r=Math.max(W/im.naturalWidth,ih/im.naturalHeight),iw=im.naturalWidth*r,ihh=im.naturalHeight*r;x.save();x.beginPath();x.roundRect?x.roundRect(48,48,W-96,ih-48,36):x.rect(48,48,W-96,ih-48);x.clip();x.drawImage(im,(W-iw)/2,48+(ih-48-ihh)/2,iw,ihh);x.restore()}
    x.direction='rtl';x.textAlign='right';x.fillStyle=th[3];x.font=`700 34px ${font}`;x.fillText(date||(/^magazine\/b-/.test(here)?'من إصدارات الجامعة':'من أخبار الجامعة'),W-72,ih+90);
    x.fillStyle=th[2];let fs=sz==='s'?58:66;x.font=`800 ${fs}px ${font}`;let L=wrap(title,W-144);while(L.length>5&&fs>40){fs-=4;x.font=`800 ${fs}px ${font}`;L=wrap(title,W-144)}
    L.slice(0,6).forEach((l,i)=>x.fillText(l,W-72,ih+170+i*fs*1.32));
    x.fillStyle=th[3];x.fillRect(W-72-120,H-190,120,6);
    x.fillStyle=th[2];x.font=`700 32px ${font}`;x.fillText('جامعة محمد بن زايد للعلوم الإنسانية',W-72,H-120);
    x.globalAlpha=.7;x.font=`500 26px ${font}`;x.fillText('نسخة تجريبية - Demo',W-72,H-74);x.globalAlpha=1;
    if(logo.complete&&logo.naturalWidth){const lh=110,lw=logo.naturalWidth*lh/logo.naturalHeight;if(th[0]!=='#f4ecdd'){x.save();x.filter='brightness(0) invert(1)';}x.drawImage(logo,72,H-80-lh,Math.min(lw,300),lh*Math.min(lw,300)/lw);x.restore()}
  };
  [im,logo].forEach(i=>i.addEventListener('load',draw));$$('input',d).forEach(i=>i.addEventListener('change',draw));(document.fonts?.ready||Promise.resolve()).then(draw);draw();
  const blob=()=>new Promise(r=>cv.toBlob(r,'image/png'));
  $('[data-dl]',d).addEventListener('click',async()=>{const b=await blob();const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='mbzuh-share.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)});
  $('[data-sh]',d)?.addEventListener('click',async()=>{const b=await blob();const f=new File([b],'mbzuh-share.png',{type:'image/png'});if(navigator.canShare({files:[f]}))navigator.share({files:[f],title}).catch(()=>{})});
}

/* =============== INSTALL PROMPT =============== */
let bip=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();bip=e;window.__mbzBIP=e;
  if(visits.size>=3&&!LS.get('mbz-inst-x',0)&&!EN){const t=toast(`<span class="v5-bdg-pop" aria-hidden="true">📲</span><span><b>ثبّت تطبيق الجامعة</b><small>وصول أسرع وقراءة المحفوظات دون اتصال</small></span><button type="button" class="btn btn-primary" data-inst>تثبيت</button><button type="button" class="icon-btn" data-x aria-label="إغلاق">✕</button>`,{ms:12000});
   t.addEventListener('click',ev=>{if(ev.target.closest('[data-inst]')&&bip){bip.prompt();bip=null}if(ev.target.closest('[data-x]'))LS.set('mbz-inst-x',1)})}});

/* =============== MICRO-INTERACTIONS =============== */
const fine=matchMedia('(pointer:fine)').matches;
if(fine&&!still()){
  const glow=document.createElement('div');glow.className='v5-glow';glow.setAttribute('aria-hidden','true');document.body.appendChild(glow);
  let gx=0,gy=0,raf=0;addEventListener('pointermove',e=>{gx=e.clientX;gy=e.clientY;if(!raf)raf=requestAnimationFrame(()=>{glow.style.transform=`translate(${gx}px,${gy}px)`;glow.classList.add('on');raf=0})},{passive:true});
  document.addEventListener('pointerleave',()=>glow.classList.remove('on'));
  document.addEventListener('pointermove',e=>{const c=e.target.closest('.xp-card,.ps-link,.lgc,.qa>a');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
}
document.addEventListener('pointerdown',e=>{
  if(still())return;const el=e.target.closest('.btn,.chip,.icon-btn,.ps-opt,.qa>a,.xp-card');if(!el)return;
  const r=el.getBoundingClientRect(),cs=getComputedStyle(el);const w=document.createElement('span');w.className='v5-rip-wrap';w.setAttribute('aria-hidden','true');
  Object.assign(w.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',borderRadius:cs.borderRadius});
  const s=Math.max(r.width,r.height)*2.2;const dot=document.createElement('i');Object.assign(dot.style,{width:s+'px',height:s+'px',left:(e.clientX-r.left-s/2)+'px',top:(e.clientY-r.top-s/2)+'px'});
  w.appendChild(dot);document.body.appendChild(w);setTimeout(()=>w.remove(),650);
},{passive:true});
/* skeleton shimmer while lazy images load */
$$('main img[loading="lazy"]').forEach(i=>{if(i.complete||i.closest('.logo,#accreditations,.acc,.v5-sl'))return;i.classList.add('v5-sk');const done=()=>i.classList.remove('v5-sk');i.addEventListener('load',done,{once:true});i.addEventListener('error',done,{once:true})});

/* =============== LAB: schedule / discounts / faq =============== */
const LD=(()=>{try{return JSON.parse($('#lab-data')?.textContent||'{}')}catch(e){return{}}})();
const lab=$('[data-lab]')?.dataset.lab;
const PER=[['صباحاً','8–12',480,720],['ظهراً','12–4',720,960],['مساءً','4–8',960,1200],['ليلاً','8–11',1200,1380]];
if(lab==='schedule'){
  const S=LD.slots,D=LD.days;let busy=new Set(LS.get('mbz-busy',[]));
  const grid=$('#sf-grid');const order=[6,0,1,2,3,4,5];
  grid.innerHTML=`<div class="sf-c sf-h" role="columnheader"></div>${order.map(i=>`<div class="sf-c sf-h" role="columnheader">${D[i]}</div>`).join('')}`+PER.map((p,pi)=>`<div class="sf-c sf-ph" role="rowheader"><b>${p[0]}</b><small>${p[1]}</small></div>`+order.map(di=>`<button type="button" class="sf-c sf-cell" data-k="${di}-${pi}" aria-pressed="false" aria-label="${D[di]} ${p[0]} (${p[1]})"></button>`).join('')).join('');
  const langs=()=>$$('.sf-lang input:checked').map(i=>i.value);
  const render=()=>{
    $$('.sf-cell',grid).forEach(b=>{const on=busy.has(b.dataset.k);b.setAttribute('aria-pressed',on);b.classList.toggle('on',on)});LS.set('mbz-busy',[...busy]);
    const L=langs();const res=S.filter(s=>L.includes(s.lang)).map(s=>{const cf=[];s.d.forEach(di=>PER.forEach((p,pi)=>{if(busy.has(di+'-'+pi)&&s.sm<p[3]&&s.em>p[2])cf.push(D[di]+' '+p[0])}));return{...s,cf}}).sort((a,b)=>(a.cf.length-b.cf.length)||a.iso.localeCompare(b.iso));
    const ok=res.filter(r=>!r.cf.length).length;
    $('#sf-sum').innerHTML=res.length?`<b class="sf-big">${ok}</b> من ${res.length} موعداً يناسب جدولك${busy.size?'':' — حدّد أوقات انشغالك لنفرز المواعيد'}`:'اختر لغة واحدة على الأقل.';
    $('#sf-list').innerHTML=res.map(r=>`<li class="sf-it${r.cf.length?' bad':' ok'}"><span class="sf-st">${r.cf.length?'✕ يتعارض':'✓ يناسبك'}</span><div class="sf-m"><b>${esc(r.langAr)} · ${esc(r.level)}</b><span>${esc(r.track)} — ${esc(r.days)} · ${esc(r.start)}–${esc(r.end)}</span><small>يبدأ ${esc(r.date)} · ${esc(r.dur)} · ${Number(r.fees).toLocaleString('en')} د.إ · ${esc(r.branch)}</small>${r.cf.length?`<small class="sf-cf">يتعارض مع: ${esc([...new Set(r.cf)].join('، '))}</small>`:''}</div><a class="btn btn-ghost sf-go" href="${esc(r.reg)}#s-${esc(r.id.slice(0,8))}">التفاصيل</a></li>`).join('');
  };
  let painting=null;
  grid.addEventListener('pointerdown',e=>{const b=e.target.closest('.sf-cell');if(!b)return;painting=!busy.has(b.dataset.k);painting?busy.add(b.dataset.k):busy.delete(b.dataset.k);render()});
  grid.addEventListener('pointerover',e=>{if(painting===null)return;const b=e.target.closest('.sf-cell');if(!b)return;painting?busy.add(b.dataset.k):busy.delete(b.dataset.k);render()});
  addEventListener('pointerup',()=>painting=null);
  grid.addEventListener('keydown',e=>{const b=e.target.closest('.sf-cell');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();busy.has(b.dataset.k)?busy.delete(b.dataset.k):busy.add(b.dataset.k);render()}});
  grid.addEventListener('click',e=>{if(e.detail===0){const b=e.target.closest('.sf-cell');if(b){busy.has(b.dataset.k)?busy.delete(b.dataset.k):busy.add(b.dataset.k);render()}}});
  $('.sf-presets').addEventListener('click',e=>{const p=e.target.closest('[data-pre]')?.dataset.pre;if(!p)return;if(p==='clear')busy.clear();if(p==='work')[1,2,3,4,5].forEach(d=>[0,1].forEach(i=>busy.add(d+'-'+i)));if(p==='eve')[0,1,2,3,4,5,6].forEach(d=>busy.add(d+'-2'));if(p==='wkd')[6,0].forEach(d=>[0,1,2,3].forEach(i=>busy.add(d+'-'+i)));vt(render)});
  $$('.sf-lang input').forEach(i=>i.addEventListener('change',()=>vt(render)));render();
}
if(lab==='discounts'){
  const C=LD.cats,S=LD.slots;const sel=$('#dc-course');
  const anim=(el,to)=>{if(still()){el.textContent=to.toLocaleString('en');return}const from=+el.dataset.v||0;const t0=performance.now();const st=t=>{const k=Math.min(1,(t-t0)/600),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3)));el.textContent=v.toLocaleString('en');if(k<1)requestAnimationFrame(st)};requestAnimationFrame(st);el.dataset.v=to};
  $('#dc-res').innerHTML=`<div class="dc-ring" aria-hidden="true"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" pathLength="100"/></svg><span><b data-o="pct">0</b>%</span></div><dl class="dc-sum"><div><dt>رسوم الدورة</dt><dd><b data-o="fee">0</b> د.إ</dd></div><div><dt>قيمة الخصم</dt><dd><b data-o="off">0</b> د.إ</dd></div><div class="dc-tot"><dt>الرسوم بعد الخصم</dt><dd><b data-o="tot">0</b> د.إ</dd></div></dl><div class="dc-why" data-o="why"></div><div class="dc-acts"><a class="btn btn-primary" data-o="reg" href="#">سجّل في هذه الدورة (تجريبي)</a><a class="v5-tlink" data-o="hub" target="_blank" rel="noopener" href="#">صفحتها في المنصة الرسمية ↗</a></div>`;
  const R=$('#dc-res');const o=k=>$(`[data-o="${k}"]`,R);
  const calc=()=>{
    const s=S[+sel.value]||S[0];const ch=$$('#dc-cats input:checked').map(i=>C.find(c=>c.id===i.value)).filter(Boolean);
    const best=ch.sort((a,b)=>b.pct-a.pct)[0];const pct=best?best.pct:0;const off=Math.round(s.fees*pct/100);
    anim(o('pct'),pct);anim(o('fee'),s.fees);anim(o('off'),off);anim(o('tot'),s.fees-off);$('.fg',R).style.strokeDasharray=`${pct} 100`;
    o('why').innerHTML=best?`<p>تُطبَّق فئة <b>«${esc(best.ar)}»</b> (${best.pct}%)${ch.length>1?` وهي الأعلى من بين ${ch.length} فئات اخترتها`:''}.</p><p class="dc-req-h">ما تطلبه المنصة لهذه الفئة:</p><ul class="dc-req">${best.fields.map(f=>`<li>${f.type==='file'||/بطاقة|شهادة|اثبات/.test(f.ar)?'📎':'✎'} ${esc(f.ar)}</li>`).join('')}</ul>`:'<p>لم تختر أي فئة، فتُحتسب الرسوم كاملة.</p>';
    o('reg').href=s.reg+'#s-'+s.id.slice(0,8);o('hub').href=s.url;
    $$('#dc-cats .dc-cat').forEach(l=>l.classList.toggle('best',!!best&&l.querySelector('input').value===best.id));
  };
  $$('#dc-cats input').forEach(i=>i.addEventListener('change',calc));sel.addEventListener('change',calc);calc();
}
if(lab==='faq'){
  const G=new Map();for(const d of (window.MBZ_INDEX||[])){let g=G.get(d.u);if(!g){g={t:d.t,s:d.s,u:d.u,ch:[]};G.set(d.u,g)}g.ch.push(d.x)}
  const IDX=[...G.values()].map(g=>({...g,nt:norm(g.t),nc:g.ch.map(norm)}));
  const STOP=new Set('ما ماذا هي هو هل في من على الي الى عن كيف متى اين لماذا كم التي الذي او و مع هذه هذا ذلك تلك عند لدى بين كل اي ان'.split(' '));
  const stem=w=>{w=w.replace(/^(وال|بال|كال|فال|لل)/,'ال');if(w.startsWith('ال')&&w.length>4)w=w.slice(2);if(w.length>4&&/(ات|ون|ين|ها|هم)$/.test(w))w=w.slice(0,-2);if(w.length>3&&/ه$/.test(w))w=w.slice(0,-1);return w};
  const toks=q=>[...new Set(norm(q).replace(/[؟?.,،!:"«»()]/g,' ').split(/\s+/).filter(w=>w.length>1&&!STOP.has(w)).map(stem).filter(w=>w.length>1))];
  const answer=q=>{const T=toks(q);if(!T.length)return[];
    const sc=IDX.map(g=>{let s=0;for(const t of T){if(g.nt.includes(t))s+=3;if(g.nc.some(c=>c.includes(t)))s+=1}return{g,s}}).filter(r=>r.s>=Math.max(2,T.length)).sort((a,b)=>b.s-a.s);
    const out=[],seen=new Set();for(const r of sc){const base=r.g.u.split('#')[0]+'|'+r.g.t;if(seen.has(base))continue;seen.add(base);
      const hits=r.g.ch.map((c,i)=>({c,i,v:T.filter(t=>r.g.nc[i].includes(t)).length})).filter(h=>h.c.length>15);
      let pts;if(out.length===0){pts=r.g.ch.filter(c=>c.length>15).slice(0,7)}else{const b=hits.sort((a,b)=>b.v-a.v||b.c.length-a.c.length)[0];pts=b?[b.c]:[r.g.ch[0]]}
      out.push({t:r.g.t,s:r.g.s,u:r.g.u,pts:pts.map(p=>p.length>340?p.slice(0,330)+'…':p),more:r.g.ch.length>pts.length});if(out.length>=3)break}return out};
  const html=(q,R)=>R.length?`<p class="fq-from">من نصوص الموقع:</p>${R.map((r,i)=>`<blockquote class="fq-q${i?'':' top'}">${r.pts.length>1?`<ul>${r.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>`:`<p>${esc(r.pts[0])}</p>`}<a href="${esc(rel(r.u))}">المصدر: ${esc(r.t)} <small>· ${esc(r.s)}</small>${r.more?' — التفاصيل الكاملة':''} ←</a></blockquote>`).join('')}`:`<p class="fq-none">لم أجد نصاً في الموقع يجيب عن «${esc(q)}». جرّب صياغة أخرى، أو <a href="${rel('contact.html')}">تواصل مع الجامعة</a>.</p>`;
  const type=(el,h)=>{el.innerHTML=h;el.classList.remove('fq-in');void el.offsetWidth;el.classList.add('fq-in')};
  $$('.fq-item').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){const a=$('.fq-a',d);if(!a.dataset.done){a.innerHTML='<div class="fq-sk"><i></i><i></i><i></i></div>';setTimeout(()=>{type(a,html(a.dataset.q,answer(a.dataset.q)));a.dataset.done=1},still()?0:380)}}}));
  $('#fq-form').addEventListener('submit',e=>{e.preventDefault();const q=$('#fq-q').value.trim();if(!q)return;const L=$('#fq-live');L.innerHTML='<div class="fq-sk"><i></i><i></i><i></i></div>';setTimeout(()=>type(L,`<h3 class="fq-yq">${esc(q)}</h3>`+html(q,answer(q))),still()?0:380)});
}
/* lab showcase: badges entry */
if(here==='lab.html'&&!EN){const h=$('main .phero, main .ph2')||$('main section');if(h){const b=document.createElement('div');b.className='container v5-labbar';const got=LS.get('mbz-badges',[]).length;b.innerHTML=`<button type="button" class="btn btn-ghost" data-badges>🏅 شاراتي (${got}/${BADGES.length})</button><button type="button" class="btn btn-ghost" onclick="return false" data-pal>⌘ لوحة الأوامر (Ctrl+K)</button>`;h.after(b);$('[data-pal]',b).addEventListener('click',()=>openPalette())}}
})();
