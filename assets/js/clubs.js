/* Student clubs hub + club pages (demo community features in localStorage; sample data labelled) */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(e){return d}};
  const sv=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  const SB='<span class="sample-badge">بيانات توضيحية</span>';
  const joined=ld('mbz-clubs-joined',[]);
  /* ---------- hub ---------- */
  const hub=$('#cl-data');
  if(hub){const C=JSON.parse(hub.textContent);let cat='';const q=$('#cl-q');
    const apply=()=>{const nq=norm(q.value);let n=0;$$('.club-card').forEach(li=>{const ok=(!cat||li.dataset.cat===cat||li.dataset.kind===cat)&&(!nq||norm(li.dataset.text).includes(nq));li.hidden=!ok;if(ok)n++});$('#cl-empty').hidden=n>0;
      ['cl-real','cl-prop'].forEach(id=>{const ul=$('#'+id);const vis=$$('.club-card:not([hidden])',ul).length;ul.hidden=!vis;ul.previousElementSibling&&(ul.previousElementSibling.hidden=!vis)})};
    $$('[data-cc]').forEach(b=>b.addEventListener('click',()=>{cat=b.dataset.cc;$$('[data-cc]').forEach(x=>x.setAttribute('aria-pressed',x===b));apply()}));q.addEventListener('input',apply);
    $$('.club-card').forEach(li=>{const id=li.querySelector('a').getAttribute('href').split('/').pop().replace('.html','');if(joined.includes(id)){li.classList.add('joined');const j=li.querySelector('.club-join');j.textContent='عضو ✓'}});
    const KW={culture:['culture'],sport:['sport'],community:['community'],innov:['innov'],heritage:['تراث','شعبي','هويه'],debate:['مناظره','حوار','ادبي']};
    $('#cl-quiz').addEventListener('change',()=>{const sel=$$('#cl-quiz input:checked').map(i=>i.value);const out=$('#cl-quiz-out');if(!sel.length){out.innerHTML='';return}
      const R=C.map(c=>{let s=0;const why=[];sel.forEach(k=>{if(KW[k].includes(c.cat)){s+=2;why.push(k)}KW[k].forEach(w=>{if(w.length>3&&norm(c.n+' '+c.d).includes(w)){s+=3;why.push(k)}})});return {c,s}}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s||(b.c.real-a.c.real)).slice(0,3);
      out.innerHTML=R.length?`<ul class="cl-recs">${R.map(r=>`<li><a href="clubs/${r.c.id}.html"><b>${esc(r.c.n)}</b><small>${r.c.real?'نادٍ قائم':'نادٍ مقترح'}</small></a></li>`).join('')}</ul>`:'<p class="muted-note">لا توجد مطابقة — جرّب اهتماماً آخر.</p>'});
    apply();return}
  /* ---------- club page ---------- */
  const cd=$('#club-data');if(!cd)return;const C=JSON.parse(cd.textContent);const K='mbz-club-'+C.id;
  const S=Object.assign({members:0,posts:null,events:null,poll:null,chat:null,rsvp:{},voted:null},ld(K,{}));
  const now=Date.now(),day=864e5;
  if(!S.posts)S.posts=[{id:'s1',a:'عضو (عيّنة)',t:`مرحباً بالجميع في ${C.n}! ما الأنشطة التي تودّون رؤيتها هذا الفصل؟`,ts:now-3*day,r:{'👍':4,'❤️':2},c:[{a:'عضو (عيّنة)',t:'أقترح ورشة عمل مشتركة مع نادٍ آخر.',ts:now-2*day}],s:1},{id:'s2',a:'منسّق (عيّنة)',t:`تذكير: ${C.acts[0]||'لقاء النادي'} — التفاصيل في قسم الفعاليات.`,ts:now-1*day,r:{'👍':6},c:[],s:1}];
  if(!S.events)S.events=(C.acts.length?C.acts:['لقاء تعريفي']).slice(0,3).map((a,i)=>({id:'e'+i,t:a,d:new Date(now+(7+i*9)*day).toISOString().slice(0,10),place:i%2?'فرع عجمان':'المقر الرئيسي - أبوظبي',going:5+i*3,s:1}));
  if(!S.poll)S.poll={q:'ما الموعد المفضّل للقاء النادي؟',o:[['بعد المحاضرات (الثالثة عصراً)',7],['مساء الثلاثاء',4],['نهاية الأسبوع',3]],s:1};
  if(!S.chat)S.chat=[{a:'منسّق (عيّنة)',t:'إعلان: مرحباً بالأعضاء الجدد — عرّفوا بأنفسكم هنا.',ann:1,ts:now-2*day,s:1}];
  const save=()=>sv(K,S);
  const isMember=()=>joined.includes(C.id);
  const fmt=ts=>new Date(ts).toLocaleDateString('ar-AE',{day:'numeric',month:'long'});
  function join(){const b=$('#club-join');const on=isMember();b.querySelector('span').textContent=on?'عضو في النادي ✓':'انضم إلى النادي';b.classList.toggle('btn-ghost',on);b.classList.toggle('btn-primary',!on);$('#club-mcount').textContent=S.members}
  $('#club-join').addEventListener('click',()=>{const i=joined.indexOf(C.id);if(i>=0){joined.splice(i,1);S.members=Math.max(0,S.members-1);toast('غادرت النادي')}else{joined.push(C.id);S.members++;toast('مرحباً بك عضواً في '+C.n);window.MBZ_confetti&&window.MBZ_confetti()}sv('mbz-clubs-joined',joined);save();join()});
  /* feed */
  function feed(){$('#feed-list').innerHTML=S.posts.slice().sort((a,b)=>b.ts-a.ts).map(p=>`<li class="post" data-p="${p.id}"><div class="post-h"><span class="post-av">${esc(p.a[0])}</span><span><b>${esc(p.a)}</b><small>${fmt(p.ts)}</small></span>${p.s?SB:''}</div><p>${esc(p.t)}</p><div class="post-r">${['👍','❤️','💡','👏'].map(e=>`<button type="button" class="react${(p.mine||{})[e]?' on':''}" data-r="${e}" aria-label="تفاعل ${e}">${e} <span class="numx">${(p.r||{})[e]||0}</span></button>`).join('')}<button type="button" class="linkbtn" data-c>تعليق (${p.c.length})</button></div><ul class="post-c">${p.c.map(c=>`<li><b>${esc(c.a)}</b> ${esc(c.t)}</li>`).join('')}</ul><form class="post-cf" hidden><input placeholder="اكتب تعليقاً…" aria-label="تعليق" maxlength="300"><button class="btn btn-ghost">إرسال</button></form></li>`).join('')}
  $('#post-f').addEventListener('submit',e=>{e.preventDefault();const t=$('#post-t').value.trim();if(t.length<3)return;S.posts.push({id:'u'+Date.now(),a:'أنت',t,ts:Date.now(),r:{},c:[]});$('#post-t').value='';save();feed();toast('نُشر منشورك (على هذا الجهاز)')});
  $('#feed-list').addEventListener('click',e=>{const li=e.target.closest('.post');if(!li)return;const p=S.posts.find(x=>x.id===li.dataset.p);const r=e.target.closest('[data-r]');if(r){const k=r.dataset.r;p.mine=p.mine||{};p.r=p.r||{};if(p.mine[k]){p.mine[k]=0;p.r[k]=Math.max(0,(p.r[k]||1)-1)}else{p.mine[k]=1;p.r[k]=(p.r[k]||0)+1}save();feed();return}
    if(e.target.closest('[data-c]')){const f=li.querySelector('.post-cf');f.hidden=!f.hidden;if(!f.hidden)f.querySelector('input').focus()}});
  $('#feed-list').addEventListener('submit',e=>{e.preventDefault();const li=e.target.closest('.post');const p=S.posts.find(x=>x.id===li.dataset.p);const v=e.target.querySelector('input').value.trim();if(!v)return;p.c.push({a:'أنت',t:v,ts:Date.now()});save();feed()});
  /* events */
  function events(){$('#ev-list').innerHTML=S.events.map(ev=>{const d=new Date(ev.d);const on=S.rsvp[ev.id];return `<li class="ev"><span class="ev-date"><b class="numx">${d.getDate()}</b><small>${d.toLocaleDateString('ar-AE',{month:'short'})}</small></span><span class="ev-b"><b>${esc(ev.t)}</b><small>${esc(ev.place)} · <span class="numx">${ev.going+(on?1:0)}</span> سيحضرون</small></span><button type="button" class="btn ${on?'btn-ghost':'btn-primary'}" data-rsvp="${ev.id}" aria-pressed="${!!on}">${on?'سأحضر ✓':'سأحضر'}</button></li>`}).join('')}
  $('#ev-list').addEventListener('click',e=>{const b=e.target.closest('[data-rsvp]');if(!b)return;S.rsvp[b.dataset.rsvp]=!S.rsvp[b.dataset.rsvp];save();events();toast(S.rsvp[b.dataset.rsvp]?'تم تسجيل حضورك':'أُلغي التسجيل')});
  /* poll */
  function poll(){const P=S.poll;const tot=P.o.reduce((a,o)=>a+o[1],0)||1;$('#poll-box').innerHTML=`<b class="poll-q">${esc(P.q)}</b><ul class="poll-o">${P.o.map((o,i)=>{const pc=Math.round(o[1]/tot*100);return `<li><button type="button" data-v="${i}" class="${S.voted===i?'on':''}" ${S.voted!=null?'aria-disabled="true"':''}><span class="pb" style="--w:${S.voted!=null?pc:0}%"></span><span class="pt">${esc(o[0])}</span>${S.voted!=null?`<span class="pp numx">${pc}%</span>`:''}</button></li>`}).join('')}</ul><small class="muted-note">${S.voted!=null?'شكراً لتصويتك · ':''}<span class="numx">${tot}</span> صوتاً (بيانات توضيحية + صوتك)</small>`}
  $('#poll-box').addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b||S.voted!=null)return;S.voted=+b.dataset.v;S.poll.o[S.voted][1]++;save();poll()});
  /* chat */
  function chat(){$('#cb-list').innerHTML=S.chat.map(m=>`<li class="${m.ann?'ann':''}${m.a==='أنت'?' me':''}"><b>${esc(m.a)}${m.ann?' · إعلان':''}</b><p>${esc(m.t)}</p><small>${fmt(m.ts)}${m.s?' · بيانات توضيحية':''}</small></li>`).join('');const l=$('#cb-list');l.scrollTop=l.scrollHeight}
  $('#cb-f').addEventListener('submit',e=>{e.preventDefault();const t=$('#cb-t').value.trim();if(!t)return;S.chat.push({a:'أنت',t,ann:$('#cb-ann').checked?1:0,ts:Date.now()});$('#cb-t').value='';$('#cb-ann').checked=false;save();chat()});
  /* AI: weekly digest (extractive from the feed) */
  $('#digest-b').addEventListener('click',()=>{const wk=S.posts.filter(p=>Date.now()-p.ts<7*day);const top=wk.slice().sort((a,b)=>Object.values(b.r||{}).reduce((x,y)=>x+y,0)-Object.values(a.r||{}).reduce((x,y)=>x+y,0))[0];const com=wk.reduce((a,p)=>a+p.c.length,0);const reacts=wk.reduce((a,p)=>a+Object.values(p.r||{}).reduce((x,y)=>x+y,0),0);const up=S.events.filter(e=>new Date(e.d)>=new Date()).slice(0,1)[0];
    $('#digest').innerHTML=`<ul class="dg"><li><b class="numx">${wk.length}</b> منشورات · <b class="numx">${com}</b> تعليقات · <b class="numx">${reacts}</b> تفاعلات هذا الأسبوع</li>${top?`<li>الأكثر تفاعلاً: «${esc(top.t.slice(0,90))}${top.t.length>90?'…':''}» — ${esc(top.a)}</li>`:''}${up?`<li>الفعالية القادمة: ${esc(up.t)} (${new Date(up.d).toLocaleDateString('ar-AE',{day:'numeric',month:'long'})})</li>`:''}</ul><small class="muted-note">مولَّد على جهازك من منشورات النادي (تشمل بيانات توضيحية).</small>`});
  /* AI: event suggestion helper (avoids exam periods from the real academic calendar) */
  $('#sugg-b').addEventListener('click',()=>{const today=new Date().toISOString().slice(0,10);const ex=(C.exams||[]).filter(x=>x.from>=today).slice(0,2);const idea=(C.acts.length?C.acts:['لقاء تعريفي'])[Math.floor(Math.random()*Math.max(1,C.acts.length))];const fmts=['ورشة تفاعلية','لقاء مفتوح','مسابقة قصيرة','جلسة نقاش'];
    $('#sugg').innerHTML=`<div class="sg"><b>${esc(fmts[Math.floor(Math.random()*fmts.length)])}: ${esc(idea)}</b><ul>${ex.length?ex.map(x=>`<li>تجنّب: ${esc(x.label.slice(0,40))} (${esc(x.date)})</li>`).join(''):''}<li>اقتراح: أسبوع لا يتعارض مع الامتحانات، بعد المحاضرات.</li><li>شارك استطلاعاً للأعضاء لاختيار الموعد.</li></ul><small class="muted-note">نوافذ الامتحانات من التقويم الأكاديمي الرسمي.</small></div>`});
  /* tabs highlight */
  const tl=$$('[data-ctab]');if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)tl.forEach(a=>a.classList.toggle('active',a.dataset.ctab===e.target.id))}),{rootMargin:'-30% 0px -60% 0px'});$$('.club-sec').forEach(s=>io.observe(s))}
  join();feed();events();poll();chat();
})();
