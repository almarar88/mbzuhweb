/* MBZUH redesign demo — UI + client-side search + retrieval assistant (no external APIs) */
(function(){
  const SRC=(document.currentScript&&document.currentScript.src)||'';
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=document.documentElement; const BASE=root.dataset.base||''; const AR=(root.lang||'ar').startsWith('ar');
  const T=AR?{noRes:'لا توجد نتائج مطابقة. جرّب كلمات أخرى.',typing:'اكتب سؤالك…',sources:'المصادر',
     hello:'مرحباً! أنا المساعد التجريبي للموقع. أجيب فقط من المحتوى المنشور على موقع الجامعة، مع روابط للمصدر. كيف أساعدك؟',
     dunno:'لم أجد إجابة واضحة في محتوى الموقع. يمكنك التواصل مع الجامعة مباشرة:',
     found:'هذا ما وجدته في محتوى الموقع:'}:
    {noRes:'No matching results. Try different words.',typing:'Type your question…',sources:'Sources',
     hello:'Hi! I am the demo site assistant. I only answer from content published on the university website, with links to the source. How can I help?',
     dunno:'I could not find a clear answer in the site content. You can contact the university directly:',
     found:'Here is what I found in the site content:'};
  /* theme */
  const saved=localStorage.getItem('mbz-theme');
  const setTheme=t=>{root.dataset.theme=t;localStorage.setItem('mbz-theme',t);$$('[data-theme-toggle]').forEach(b=>b.setAttribute('aria-pressed',t==='dark'))};
  setTheme(saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  $$('[data-theme-toggle]').forEach(b=>b.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark')));
  /* header */
  const hdr=$('.hdr'); const onS=()=>hdr&&hdr.classList.toggle('scrolled',scrollY>8); addEventListener('scroll',onS,{passive:true}); onS();
  const nav=$('#nav'), mb=$('.menu-btn'), bd=$('.backdrop');
  const small=()=>matchMedia('(max-width:1279.98px)').matches;
  const lock=on=>root.classList.toggle('lock',!!on);
  const navOpen=()=>nav&&nav.classList.contains('open');
  const focusables=el=>$$('a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex="-1"])',el).filter(x=>x.offsetParent!==null);
  function openNav(){nav.classList.add('open');bd.classList.add('open');mb.setAttribute('aria-expanded','true');lock(true);setTimeout(()=>{const c=$('.nav-close',nav);c&&c.focus()},60)}
  function closeNav(ret){if(!navOpen())return;nav.classList.remove('open');bd.classList.remove('open');mb.setAttribute('aria-expanded','false');lock(false);if(ret!==false)mb&&mb.focus()}
  mb&&mb.addEventListener('click',()=>navOpen()?closeNav():openNav());
  bd&&bd.addEventListener('click',()=>closeNav());
  $('.nav-close')&&$('.nav-close').addEventListener('click',()=>closeNav());
  nav&&nav.addEventListener('keydown',e=>{if(e.key!=='Tab'||!navOpen())return;const f=focusables(nav);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}});
  nav&&nav.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(a&&navOpen()&&a.getAttribute('href').indexOf('#')!==0)closeNav(false);if(e.target.closest('[data-open-search]'))closeNav(false)});
  /* submenus: click/tap toggles (accordion in drawer, dropdown on desktop) */
  $$('.has-sub>button').forEach(b=>b.addEventListener('click',()=>{const o=b.getAttribute('aria-expanded')!=='true';if(!small())$$('.has-sub>button').forEach(x=>x!==b&&x.setAttribute('aria-expanded','false'));b.setAttribute('aria-expanded',o)}));
  document.addEventListener('click',e=>{if(!small()&&!e.target.closest('.has-sub'))$$('.has-sub>button').forEach(x=>x.setAttribute('aria-expanded','false'))});
  matchMedia('(max-width:1279.98px)').addEventListener('change',()=>{closeNav(false);$$('.has-sub>button').forEach(x=>x.setAttribute('aria-expanded','false'))});
  /* reveal */
  {const showAll=()=>$$('.reveal:not(.in)').forEach(el=>el.classList.add('in'));
   if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting||e.boundingClientRect.top<innerHeight){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -5% 0px',threshold:0});$$('.reveal').forEach(el=>io.observe(el));
     /* safety net: never leave content faded (slow devices, missed callbacks, print, find-in-page) */
     setTimeout(()=>$$('.reveal:not(.in)').forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*1.5)el.classList.add('in')}),1200);
     addEventListener('load',()=>setTimeout(showAll,3500),{once:true});addEventListener('beforeprint',showAll);addEventListener('hashchange',showAll)}
   else showAll()}
  /* toc active */
  const tocLinks=$$('.toc a'); if(tocLinks.length&&'IntersectionObserver' in window){const map=new Map(tocLinks.map(a=>[decodeURIComponent(a.hash.slice(1)),a]));const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){tocLinks.forEach(a=>a.classList.remove('active'));const a=map.get(e.target.id);if(a){a.classList.add('active');const t=a.parentElement;if(t&&t.scrollWidth>t.clientWidth){const x=a.offsetLeft-(t.clientWidth-a.offsetWidth)/2;t.scrollTo({left:x,behavior:'smooth'})}}}}),{rootMargin:'-20% 0px -70% 0px'});$$('.prose h2[id]').forEach(h=>io2.observe(h))}
  /* text utils */
  const norm=s=>(s||'').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[إأآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[^\p{L}\p{N}\s@.+]/gu,' ').replace(/\s+/g,' ').trim();
  const esc=s=>(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* perf (v6): normalise the 950-entry index and build Fuse lazily, on the first search or when an input gets focus */
  let IDX=null,fuse=null;
  /* perf (v6): the 480 KB index + Fuse are fetched only when search, the assistant or the palette is used */
  let LP=null;const asset=n=>SRC?SRC.replace(/site\.js(\?[^#]*)?$/,(m,q)=>n+(q||'')):BASE+'assets/js/'+n;
  window.mbzLoadIndex=()=>LP||(LP=window.MBZ_INDEX?Promise.resolve():new Promise(res=>{let left=2;const done=()=>{if(--left===0)res()};['fuse.min.js','search-index.js'].forEach(n=>{const sc=document.createElement('script');sc.src=asset(n);sc.async=false;sc.onload=sc.onerror=done;document.head.appendChild(sc)})}));
  const prep=()=>{if(IDX)return true;if(!window.MBZ_INDEX){window.mbzLoadIndex();return false}IDX=(window.MBZ_INDEX||[]).map(d=>({...d,n:norm(d.t+' '+d.x),nt:norm(d.t)}));fuse=window.Fuse?new Fuse(IDX,{keys:[{name:'nt',weight:.45},{name:'n',weight:.55}],includeScore:true,ignoreLocation:true,threshold:.38,minMatchCharLength:2}):null;return true};
  document.addEventListener('focusin',e=>{if(e.target.matches&&e.target.matches('input'))setTimeout(prep,0)},{passive:true});
  const STOP=new Set(AR?['ما','ماذا','هل','كيف','في','من','عن','الى','الي','على','علي','هي','هو','ان','او','و','ال','لل','متى','اين','كم','لماذا','اريد','اعرف','عندكم','لديكم','الجامعه','جامعه','يوجد','ممكن','لو','سمحت','ابي','ابغى','شنو','وش','ايش']:['what','is','the','a','an','of','in','on','how','do','i','to','for','are','you','your','can','me','about','and','or','tell','which','where','when','university']);
  function search(q,limit=12){
    if(!prep())return [];const nq=norm(q); if(!nq) return [];
    const toks=nq.split(' ').filter(w=>w.length>1&&!STOP.has(w)).map(w=>w.replace(/^(وال|بال|كال|فال|لل|ال)/,'')).filter(w=>w.length>1);
    const scores=new Map();
    IDX.forEach((d,i)=>{let s=0;toks.forEach(w=>{if(d.nt.includes(w))s+=3;const m=d.n.split(w).length-1;if(m)s+=1+Math.min(m,4)*.5});if(toks.length&&toks.every(w=>d.n.includes(w)))s+=4;if(d.n.includes(nq))s+=6;if(s)scores.set(i,s)});
    if(fuse){fuse.search(nq).slice(0,40).forEach(r=>{scores.set(r.refIndex,(scores.get(r.refIndex)||0)+(1-r.score)*4)})}
    return [...scores.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([i,s])=>({...IDX[i],score:s}));
  }
  window.MBZ_search=search;
  const hl=(text,q)=>{let out=esc(text);norm(q).split(' ').filter(w=>w.length>2&&!STOP.has(w)).forEach(w=>{try{out=out.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>')}catch(e){}});return out};
  const snip=(x,q,n=160)=>{const nx=norm(x);const w=norm(q).split(' ').find(w=>w.length>2&&nx.includes(w));let i=w?Math.max(0,x.indexOf(w)-50):0;if(i<0)i=0;return (i>0?'… ':'')+x.slice(i,i+n)+(x.length>i+n?' …':'')};
  const href=u=>BASE+u;
  /* search palette */
  const modal=$('#search-modal'), sin=$('#search-input'), res=$('#search-results');
  function openSearch(q){if(!modal)return;modal.classList.add('open');sin.value=q||'';render(sin.value);window.mbzLoadIndex().then(()=>{if(modal.classList.contains('open'))render(sin.value)});setTimeout(()=>sin.focus(),20)}
  function closeSearch(){modal&&modal.classList.remove('open')}
  let sel=-1;
  function render(q){
    sel=-1; if(!q.trim()){res.innerHTML=(window.MBZ_POPULAR||[]).map(p=>`<li><a href="${href(p.u)}"><span class="sect">${esc(p.s||'')}</span><b>${esc(p.t)}</b></a></li>`).join('');return}
    if(!window.MBZ_INDEX){res.innerHTML=`<li class="empty">${AR?'جارٍ تحميل فهرس البحث…':'Loading the search index…'}</li>`;window.mbzLoadIndex().then(()=>render(sin.value));return}
    const seen=new Set(); const r=search(q,30).filter(d=>{const k=d.u.split('#')[0]+'|'+d.t;if(seen.has(k))return false;seen.add(k);return true}).slice(0,12);
    res.innerHTML=r.length?r.map(d=>`<li><a href="${href(d.u)}"><span class="sect">${esc(d.s||'')}</span><b>${hl(d.t,q)}</b><small>${hl(snip(d.x,q),q)}</small></a></li>`).join(''):`<li class="empty">${T.noRes}</li>`;
  }
  $$('[data-open-search]').forEach(b=>b.addEventListener('click',()=>openSearch()));
  sin&&sin.addEventListener('input',()=>render(sin.value));
  modal&&modal.addEventListener('click',e=>{if(e.target===modal)closeSearch()});
  addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}
    if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();openSearch()}
    if(e.key==='Escape'){closeSearch();closeChat();nav&&closeNav();if(!small())$$('.has-sub>button').forEach(x=>x.setAttribute('aria-expanded','false'))}
    if(modal&&modal.classList.contains('open')&&(e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();const as=$$('a',res);if(!as.length)return;sel=(sel+(e.key==='ArrowDown'?1:-1)+as.length)%as.length;as.forEach((a,i)=>a.setAttribute('aria-selected',i===sel));as[sel].focus({preventScroll:false});}
  });
  $$('#hero-search,#cx-ask-form,.js-ask').forEach(hs=>hs.addEventListener('submit',e=>{e.preventDefault();const i=$('input',hs);const q=i.value.trim();i.value='';openChat(q)}));
  document.addEventListener('click',e=>{const c=e.target.closest('[data-ask]');if(c){e.preventDefault();openChat(c.dataset.ask)}});
  /* assistant */
  const chat=$('#chat'), fab=$('#fab'), msgs=$('#msgs'), cf=$('#chat-form'), ci=$('#chat-input');
  const F={get intents(){return (window.MBZ_FACTS||{}).intents},get contact(){return (window.MBZ_FACTS||{}).contact}};
  function add(html,who){const d=document.createElement('div');d.className='msg '+who;d.innerHTML=html;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;return d}
  let greeted=false;
  const sheet=()=>matchMedia('(max-width:600px),(max-height:560px)').matches;
  let lastFocus=null;
  function openChat(q){if(!chat)return;window.mbzLoadIndex();const was=chat.classList.contains('open');if(!was)lastFocus=document.activeElement;chat.classList.add('open');chat.style.transform='';document.body.classList.add('chat-open');fab.setAttribute('aria-expanded','true');if(sheet()){lock(true);chat.setAttribute('aria-modal','true')}if(!greeted){add(esc(T.hello),'bot');greeted=true}setTimeout(()=>{if(q&&sheet()){$('#chat-close').focus()}else ci.focus()},40);if(q)ask(q)}
  function closeChat(){if(chat&&chat.classList.contains('open')){chat.classList.remove('open');document.body.classList.remove('chat-open');chat.setAttribute('aria-modal','false');fab&&fab.setAttribute('aria-expanded','false');if(!navOpen())lock(false);if(lastFocus&&lastFocus.focus)try{lastFocus.focus({preventScroll:true})}catch(e){}}}
  $('.chat-scrim')&&$('.chat-scrim').addEventListener('click',()=>closeChat());
  /* swipe down to dismiss the bottom sheet */
  (function(){if(!chat)return;let y0=null,dy=0;const h=$('.chat-h',chat);const start=e=>{if(!sheet()||e.target.closest('button'))return;y0=e.touches[0].clientY;dy=0;chat.style.transition='none'};const move=e=>{if(y0===null)return;dy=Math.max(0,e.touches[0].clientY-y0);chat.style.transform=`translateY(${dy}px)`};const end=()=>{if(y0===null)return;chat.style.transition='transform .2s';if(dy>90){chat.style.transform='translateY(100%)';setTimeout(()=>{closeChat();chat.style.transform='';chat.style.transition=''},180)}else{chat.style.transform=''}y0=null};[h,$('.chat-grab',chat)].forEach(el=>{if(!el)return;el.addEventListener('touchstart',start,{passive:true});el.addEventListener('touchmove',move,{passive:true});el.addEventListener('touchend',end)})})();
  /* keep the floating button off the inline ask boxes (hero / continuing-education) */
  (function(){const t=$$('.hero-card .ask,#cx-ask-form,.js-ask');if(!t.length||!('IntersectionObserver' in window))return;const vis=new Set();const io=new IntersectionObserver(es=>{es.forEach(e=>e.isIntersecting?vis.add(e.target):vis.delete(e.target));document.body.classList.toggle('fab-hide',vis.size>0)},{rootMargin:'40px 0px 40px 0px'});t.forEach(x=>io.observe(x))})();
  fab&&fab.addEventListener('click',()=>chat.classList.contains('open')?closeChat():openChat());
  $('#chat-close')&&$('#chat-close').addEventListener('click',closeChat);
  cf&&cf.addEventListener('submit',e=>{e.preventDefault();const q=ci.value.trim();if(!q)return;ci.value='';ask(q)});
  const srcLinks=list=>{const seen=new Set();const l=list.filter(s=>{if(seen.has(s.u))return false;seen.add(s.u);return true}).slice(0,4);return l.length?`<div class="src" aria-label="${T.sources}">${l.map(s=>`<a href="${href(s.u)}">${esc(s.t)}</a>`).join('')}</div>`:''};
  function intent(q){
    const n=norm(q); const has=(...ws)=>ws.some(w=>n.includes(norm(w)));
    const pad=' '+n+' ';
    const m=(window.MBZ_MODE_INTENTS||[]).concat(F.intents||[]);
    for(const it of m){ if(it.k.some(k=>{const nk=norm(k);return /^[a-z0-9 ]+$/.test(nk)?pad.includes(' '+nk+' ')||pad.includes(' '+nk+'s '):n.includes(nk)})) return it; }
    return null;
  }
  function ask(q){if(!window.MBZ_INDEX){window.mbzLoadIndex().then(()=>ask0(q));return}ask0(q)}
  function ask0(q){
    add(esc(q),'me'); const t=add('<span class="typing" aria-label="…"><span></span><span></span><span></span></span>','bot');
    setTimeout(()=>{
      const it=intent(q); let html='';
      if(/لخص|تلخيص|ملخص|summar/i.test(q)&&/صفح|page|هذ/i.test(q)){const pts=summarize(4);html=pts.length?`<p style="margin:0 0 .4rem"><b>${esc(T.sumh)}</b></p><ol style="margin:0;padding-inline-start:1.2rem">${pts.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p style="margin:.4rem 0 0;font-size:.75rem;opacity:.75">${esc(T.sumn)}</p>`:esc(T.dunno)}
      else if(it){ html=it.a.split('{B}').join(BASE) + srcLinks(it.src||[]); }
      else{
        const r=search(q,8).filter(d=>d.x&&d.x.length>30);
        if(r.length&&r[0].score>2.5){
          const top=[];const seen=new Set();for(const d of r){const k=d.x.slice(0,80);if(seen.has(k))continue;seen.add(k);top.push(d);if(top.length>=2)break}
          html=`<p style="margin:0 0 .4rem">${T.found}</p>`+top.map(d=>`<p style="margin:0 0 .5rem"><b>${esc(d.t)}:</b> ${hl(snip(d.x,q,260),q)}</p>`).join('')+srcLinks(r);
        } else html=esc(T.dunno)+'<br>'+(F.contactHtml||'');
      }
      t.innerHTML=html; msgs.scrollTop=msgs.scrollHeight;
    },450);
  }
  window.MBZ_ask=q=>openChat(q);
  /* program finder */
  const fd=$('#finder');
  if(fd){const items=$$('[data-prog]',fd);const q=$('#f-q'),lv=$('#f-level'),co=$('#f-college'),cnt=$('#f-count'),emp=$('#f-empty');
    const apply=()=>{const nq=norm(q.value);let c=0;items.forEach(el=>{const ok=(!nq||norm(el.dataset.text).includes(nq))&&(!lv.value||el.dataset.level===lv.value)&&(!co.value||el.dataset.college===co.value);el.hidden=!ok;if(ok)c++});cnt.textContent=c;emp.hidden=c>0};
    [q,lv,co].forEach(e=>e&&e.addEventListener('input',apply));
    const pr=new URLSearchParams(location.search);if(pr.get('level')){lv.value=pr.get('level')}apply();
    $$('[data-level-chip]').forEach(ch=>ch.addEventListener('click',()=>{lv.value=ch.dataset.levelChip;$$('[data-level-chip]').forEach(x=>x.setAttribute('aria-pressed',x===ch));apply()}));
  }
  /* news filter */
  const nf=$('#news-filter'); if(nf){const cards=$$('[data-news]');nf.addEventListener('input',()=>{const v=norm(nf.value);cards.forEach(c=>c.hidden=v&&!norm(c.dataset.news).includes(v))})}
  const bf=$('#book-filter'); if(bf){const cards=$$('[data-book]');bf.addEventListener('input',()=>{const v=norm(bf.value);cards.forEach(c=>c.hidden=v&&!norm(c.dataset.book).includes(v))})}

  /* ---------- v3 page tools ---------- */
  T.sumh=root.lang==='en'?'Summary of this page:':'ملخص هذه الصفحة:';
  T.sumn=root.lang==='en'?'Extractive demo summary — sentences taken from this page only.':'ملخص استخراجي تجريبي — جمل مأخوذة من نص الصفحة فقط.';
  function summarize(n){
    const main=$('main')||document.body;const blocks=$$('p,li,dd,blockquote',main).filter(el=>!el.closest('.chat,.sample-badge,.demo-dash-note,.dash,nav,footer,.chips,form,.cx-tabs,.ptools,.crumbs,dialog,.lt,.fac,.quiz,.planh,script'));
    const sents=[];const seen=new Set();
    blocks.forEach((el,bi)=>{(el.innerText||'').replace(/\s+/g,' ').split(/(?<=[.!؟?։۔])\s+/).forEach(x=>{x=x.trim();if(x.length<45||x.length>320)return;const k=norm(x).slice(0,60);if(seen.has(k))return;seen.add(k);sents.push({x,bi,i:sents.length})})});
    if(!sents.length)return [];
    const tf={};const stop=new Set(['في','من','على','الى','عن','مع','هذا','هذه','التي','الذي','ان','او','ما','لا','كما','the','and','of','to','in','a','for','is','with']);
    const toks=x=>norm(x).split(' ').filter(w=>w.length>2&&!stop.has(w));
    sents.forEach(s=>{s.t=toks(s.x);new Set(s.t).forEach(w=>tf[w]=(tf[w]||0)+1)});
    const h1=toks(($('h1')||{}).innerText||'');
    sents.forEach(s=>{const u=[...new Set(s.t)];s.sc=u.reduce((a,w)=>a+Math.log(1+tf[w]),0)/Math.sqrt(u.length+1)+(u.filter(w=>h1.includes(w)).length*1.5)+(s.i<3?1:0)});
    return sents.slice().sort((a,b)=>b.sc-a.sc).slice(0,n).sort((a,b)=>a.i-b.i).map(s=>s.x);
  }
  const toast=msg=>{const t=$('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  const sd=$('#sum-dlg');
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-summarize]')){const pts=summarize(5);$('#sum-list').innerHTML=pts.length?pts.map(x=>`<li>${esc(x)}</li>`).join(''):`<li>${esc(T.dunno)}</li>`;sd&&sd.showModal?sd.showModal():0}
    const sh=e.target.closest('[data-share]');if(sh){const d={title:document.title,url:location.href};if(navigator.share){navigator.share(d).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(()=>toast(root.lang==='en'?'Link copied':'تم نسخ الرابط'),()=>toast(location.href))}else toast(location.href)}
  });
  if(sd){sd.addEventListener('click',e=>{if(e.target===sd||e.target.closest('[data-close]'))sd.close()})}
  /* reading progress + back to top */
  const pg=$('.progress span'), tt=$('.totop');
  let tick=false;const onScroll=()=>{if(tick)return;tick=true;requestAnimationFrame(()=>{const h=document.documentElement;const max=h.scrollHeight-innerHeight;const p=max>0?Math.min(1,scrollY/max):0;if(pg)pg.style.transform=`scaleX(${p})`;if(tt)tt.classList.toggle('show',scrollY>innerHeight*1.2);tick=false})};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  tt&&tt.addEventListener('click',()=>{scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});const h=$('h1');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}});
  /* count-up for exact stats */
  (function(){const els=$$('[data-countup]');if(!els.length)return;const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;const fmt=new Intl.NumberFormat('en-US');
    const run=el=>{const to=parseFloat(el.dataset.countup);if(rm||!isFinite(to)){return}const d=900,t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/d);const v=Math.round(to*(1-Math.pow(1-k,3)));el.textContent=fmt.format(v);if(k<1)requestAnimationFrame(step);else el.textContent=fmt.format(to)};el.textContent='0';requestAnimationFrame(step)};
    if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target)}}),{threshold:.6});els.forEach(el=>io.observe(el))}})();
  /* journey tabs (home, admission, student portal) */
  $$('[data-tabs]').forEach(w=>{const bs=$$('[role=tab]',w);const sel=b=>{bs.forEach(x=>{const on=x===b;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;const p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on})};
    bs.forEach((b,i)=>{b.addEventListener('click',()=>sel(b));b.addEventListener('keydown',e=>{const rtl=root.dir==='rtl';let j=null;if(e.key==='ArrowRight')j=rtl?i-1:i+1;if(e.key==='ArrowLeft')j=rtl?i+1:i-1;if(j!==null){j=(j+bs.length)%bs.length;sel(bs[j]);bs[j].focus();e.preventDefault()}})})});
  /* faculty directory */
  const fl=$('#fd-list');
  if(fl){const items=$$('.fac',fl),q=$('#fd-q'),r=$('#fd-r'),n=$('#fd-n'),emp=$('#fd-empty');let c='';
    const apply=()=>{const nq=norm(q.value);let k=0;items.forEach(el=>{const ok=(!c||el.dataset.c===c)&&(!r.value||el.dataset.r===r.value)&&(!nq||nq.split(' ').every(w=>norm(el.dataset.text).includes(w)));el.hidden=!ok;if(ok)k++});n.textContent=k;emp.hidden=k>0};
    $$('[data-fc]').forEach(b=>b.addEventListener('click',()=>{c=b.dataset.fc;$$('[data-fc]').forEach(x=>x.setAttribute('aria-pressed',x===b));apply()}));
    q.addEventListener('input',apply);r.addEventListener('change',apply);const pq=new URLSearchParams(location.search).get('q');if(pq)q.value=pq;apply()}
  /* voice input (Web Speech API, browser-provided; hidden when unsupported) */
  (function(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const mb=$('#chat-mic');if(!SR||!mb)return;mb.hidden=false;let rec=null;
    mb.addEventListener('click',()=>{if(rec){rec.stop();return}rec=new SR();rec.lang=root.lang==='en'?'en-US':'ar-AE';rec.interimResults=true;rec.maxAlternatives=1;mb.setAttribute('aria-pressed','true');document.body.classList.add('listening');
      rec.onresult=e=>{let t='';for(const r of e.results)t+=r[0].transcript;ci.value=t;if(e.results[e.results.length-1].isFinal){const q=t.trim();if(q){ci.value='';ask(q)}}};
      rec.onerror=ev=>{toast(root.lang==='en'?'Voice input unavailable':'تعذّر الإدخال الصوتي')};rec.onend=()=>{mb.setAttribute('aria-pressed','false');document.body.classList.remove('listening');rec=null};try{rec.start()}catch(e){rec=null;mb.setAttribute('aria-pressed','false')}})})();
  /* PWA offline cache (works on https or localhost) */
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){addEventListener('load',()=>navigator.serviceWorker.register(BASE+'sw.js').catch(()=>{}))}

  /* ---------- v4 motion & delight ---------- */
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches, FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  /* staggered reveals */
  $$('.reveal').forEach(el=>{const p=el.parentElement;if(!p)return;const sib=[...p.children].filter(c=>c.classList.contains('reveal'));const i=sib.indexOf(el);if(i>0)el.style.setProperty('--i',Math.min(i,8))});
  /* hero parallax */
  (function(){const im=$('.hero-media img');if(!im||RM)return;let t=false;addEventListener('scroll',()=>{if(t)return;t=true;requestAnimationFrame(()=>{const y=Math.min(scrollY,900);im.style.setProperty('--py',(y*0.22).toFixed(1)+'px');t=false})},{passive:true})})();
  /* cursor spotlight + gentle tilt (desktop only) */
  if(FINE&&!RM){
    const SPOT='.card,.num,.svc,.lt-a,.portal-card,.cx-card,.tl-i,.dean,.res,.sp-card,.club-card,.widget,.ad-row,.pg-in,.lv-in,.qa a';
    const TILT='.portal-card,.num,.book,.club-card,.sp-card,.cec-band';
    $$(SPOT).forEach(el=>el.classList.add('spot'));$$(TILT).forEach(el=>el.classList.add('tilt'));
    document.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest('.spot,.tilt');if(!el)return;const r=el.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;
      if(el.classList.contains('spot')){el.style.setProperty('--mx',x+'px');el.style.setProperty('--my',y+'px');el.style.setProperty('--so','.13')}
      if(el.classList.contains('tilt')){const rx=((y/r.height)-.5)*-5,ry=((x/r.width)-.5)*6;el.classList.add('tilting');el.style.transform=`perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-3px)`}},{passive:true});
    document.addEventListener('pointerout',e=>{const el=e.target.closest&&e.target.closest('.spot,.tilt');if(!el||el.contains(e.relatedTarget))return;el.style.setProperty('--so','0');if(el.classList.contains('tilt')){el.classList.remove('tilting');el.style.transform=''}},{passive:true});
  }
  /* image skeletons */
  $$('main img').forEach(im=>{if(im.complete&&im.naturalWidth)return;im.classList.add('sk');const done=()=>im.classList.remove('sk');im.addEventListener('load',done,{once:true});im.addEventListener('error',done,{once:true})});
  /* orb reacts to typing */
  (function(){let h;document.addEventListener('input',e=>{if(!e.target.matches('.ask input,#chat-input,.cx-search input'))return;document.body.classList.add('typing');$$('.orb-xl').forEach(o=>o.classList.add('typing'));clearTimeout(h);h=setTimeout(()=>{document.body.classList.remove('typing');$$('.orb-xl').forEach(o=>o.classList.remove('typing'))},800)})})();
  new MutationObserver(()=>{$$('.orb-xl').forEach(o=>o.classList.toggle('listening',document.body.classList.contains('listening')))}).observe(document.body,{attributes:true,attributeFilter:['class']});
  /* campus map */
  $$('[data-cmap]').forEach(m=>{const sel=i=>{$$('.pin',m).forEach(p=>p.classList.toggle('on',p.dataset.i==i));$$('.cm-card',m).forEach(c=>{const on=c.dataset.i==i;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on)})};
    m.addEventListener('click',e=>{const t=e.target.closest('.pin,.cm-card');if(t)sel(t.dataset.i)});
    m.addEventListener('pointerover',e=>{const t=e.target.closest('.pin');if(t)sel(t.dataset.i)})});
  /* academic timeline: past / next / today marker */
  $$('.tl').forEach(tl=>{const today=new Date().toISOString().slice(0,10);const items=$$('.tl-i',tl);let next=null;items.forEach(li=>{if(li.dataset.iso<today)li.classList.add('past');else if(!next){next=li;li.classList.add('next')}});
    if(next){const now=document.createElement('li');now.className='tl-now';now.setAttribute('aria-label','اليوم');now.innerHTML='<span>اليوم</span>';tl.insertBefore(now,next);requestAnimationFrame(()=>{const rtl=root.dir==='rtl';const off=next.offsetLeft-(rtl?tl.clientWidth-next.offsetWidth-40:40);tl.scrollLeft=rtl?off-tl.scrollWidth+tl.clientWidth+(tl.scrollWidth-tl.clientWidth):off;next.scrollIntoView({block:'nearest',inline:'center'});scrollTo(0,0)})}
    tl.style.setProperty('--tlw',tl.scrollWidth+'px');
    const w=tl.closest('.tl-wrap');$$('[data-tl]',w).forEach(b=>b.addEventListener('click',()=>{const rtl=root.dir==='rtl';tl.scrollBy({left:(+b.dataset.tl)*(rtl?-1:1)*280,behavior:RM?'auto':'smooth'})}))});
  /* admission calendar: dim past rows */
  (function(){const today=new Date().toISOString().slice(0,10);$$('.cal-list li[data-iso]').forEach(li=>{if(li.dataset.iso&&li.dataset.iso<today)li.classList.add('past')})})();
  /* celebration (used by the apply wizard, store checkout, club join) */
  window.MBZ_confetti=function(){if(RM)return;const c=document.createElement('canvas');c.setAttribute('aria-hidden','true');c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:600';document.body.appendChild(c);const x=c.getContext('2d');const dpr=Math.min(2,devicePixelRatio||1);c.width=innerWidth*dpr;c.height=innerHeight*dpr;x.scale(dpr,dpr);
    const cols=['#b8863b','#f0c886','#4e6a5f','#9cc1b2','#ffffff','#c0392b'];const P=Array.from({length:140},()=>({x:innerWidth/2+(Math.random()-.5)*120,y:innerHeight*.35,vx:(Math.random()-.5)*12,vy:-Math.random()*12-4,s:Math.random()*7+4,r:Math.random()*6,vr:(Math.random()-.5)*.3,c:cols[Math.random()*cols.length|0],sh:Math.random()<.4}));
    const t0=performance.now();(function f(t){const k=(t-t0)/1000;x.clearRect(0,0,innerWidth,innerHeight);P.forEach(p=>{p.vy+=.35;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.globalAlpha=Math.max(0,1-k/2.4);x.fillStyle=p.c;if(p.sh){x.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?p.s*.45:p.s;x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}x.fill()}else x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()});if(k<2.4)requestAnimationFrame(f);else c.remove()})(t0)};
})();

/* v6 guard: the page must never be scrolled sideways (programmatic scrollIntoView on clipped overflow) */
(function(){let t;const fix=()=>{if(Math.abs(window.scrollX)>0.5)window.scrollTo(0,window.scrollY)};addEventListener('scroll',()=>{if(window.scrollX){cancelAnimationFrame(t);t=requestAnimationFrame(fix)}},{passive:true});addEventListener('load',fix);addEventListener('resize',fix)})();
