/* Admissions officer dashboard (demo). Sample applications are labelled; wizard submissions come from localStorage on this device. */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const root=$('#adm'); if(!root) return;
  const sec=$('#admissions'), C=JSON.parse($('#adm-config',sec).textContent), SAMP=JSON.parse($('#adm-samples',sec).textContent);
  const ST={new:'جديد',review:'قيد المراجعة',missing:'مستندات ناقصة',accepted:'مقبول',rejected:'مرفوض'};
  const LV=Object.fromEntries(C.levels.map(l=>[l.k,l.t]));
  const OV='mbz-adm-state';
  const norm=s=>(s||'').toLowerCase().replace(/[إأآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
  const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  let ov={};try{ov=JSON.parse(localStorage.getItem(OV)||'{}')}catch(e){}
  const all=()=>{let mine=[];try{mine=JSON.parse(localStorage.getItem('mbz-apps')||'[]')}catch(e){}return [...mine,...SAMP].map(a=>({...a,...(ov[a.ref]||{})}))};
  const certOf=k=>C.req.bachelor.certs.find(c=>c[0]===k);
  const reqDocs=a=>(C.docs[a.level]||[]).filter(d=>d.kind==='d'&&(!d.cond||(d.cond==='other'&&certOf(a.cert)&&certOf(a.cert)[4]==='other')));
  const missing=a=>reqDocs(a).filter(d=>!(a.docs||{})[d.id]);
  let fst='';
  function checks(a){const o=[];
    if(a.level==='bachelor'){const c=certOf(a.cert);if(c&&c[3]!=null&&a.avg)o.push(+a.avg>=c[3]?['ok',`المعدل ${a.avg}% ≥ ${c[3]}% (${c[1]})`]:['no',`المعدل ${a.avg}% < ${c[3]}% (${c[1]}) — راجع المؤهلات الخاصة للكلية`])}
    if(a.level==='master'||a.level==='phd'){const G=C.req[a.level];if(a.gpa)o.push(+a.gpa>=G.gpa?['ok',`المعدل التراكمي ${a.gpa} ≥ ${G.gpa}`]:['no',`المعدل التراكمي ${a.gpa} < ${G.gpa}`]);o.push(a.ielts?(+a.ielts>=G.ielts?['ok',`IELTS ${a.ielts} ≥ ${G.ielts}`]:['no',`IELTS ${a.ielts} < ${G.ielts}`]):['info',`لا توجد درجة IELTS مسجلة (المطلوب ${G.ielts})`]);o.push(['info','يتطلب اجتياز اختبار اللغة العربية والاختبار التحريري والمقابلة'])}
    if(a.level==='bachelor')o.push(['info','يتطلب اجتياز المقابلة الشخصية']);
    if(a.level==='diploma')o.push(['info','لم تُنشر شروط مستقلة للدبلوم — يُرجع إلى سياسة القبول']);
    return o}
  function aiSummary(a){const m=missing(a),ch=checks(a);const ok=ch.filter(x=>x[0]==='ok').length,no=ch.filter(x=>x[0]==='no').length;const nat={citizen:'مواطن',mother:'من أبناء المواطنات',non:'غير مواطن'}[a.nat]||'';
    return `${a.name} يتقدّم إلى «${a.prog}» (${LV[a.level]||''})، ${a.college}${a.campus?'، فرع '+a.campus:''}${nat?'، '+nat:''}. الفحص الآلي: ${ok} بنود مستوفاة${no?' و'+no+' دون الحد المنشور':''}. المستندات المطلوبة المستنتجة: ${reqDocs(a).length-m.length}/${reqDocs(a).length}${m.length?' (ناقص: '+m.map(d=>d.t).join('، ')+')':''}. ${no?'يُقترح التحقق من المؤهلات الخاصة قبل القرار.':m.length?'يُقترح طلب المستندات الناقصة.':'الطلب جاهز للمراجعة الأكاديمية والمقابلة.'}`}
  function reply(a){const m=missing(a);const first=(a.name||'').replace(/\s*\(.*\)/,'').split(' ')[0]||'';
    const hi=`عزيزي/عزيزتي ${first}،\n\nشكراً لتقديمك على برنامج «${a.prog}» في جامعة محمد بن زايد للعلوم الإنسانية (رقم الطلب ${a.ref}).\n\n`;
    const end='\n\nمع خالص التحية،\nمكتب القبول والتسجيل';
    if(a.status==='missing'||m.length&&a.status==='new')return hi+'بعد مراجعة طلبك، نرجو تزويدنا بالمستندات التالية لاستكمال الإجراءات:\n'+(m.length?m.map(d=>'• '+d.t).join('\n'):'• (حدّد المستندات)')+end;
    if(a.status==='accepted')return hi+'يسرّنا إبلاغك بقبولك المبدئي في البرنامج. ستصلك تفاصيل الخطوات التالية وتأكيد المقعد قريباً.'+end;
    if(a.status==='rejected')return hi+'نشكر اهتمامك، ونأسف لإبلاغك بأنه تعذّر قبول طلبك في هذه الدورة. يسعدنا تقديمك مجدداً مستقبلاً.'+end;
    return hi+'تم استلام طلبك وهو الآن قيد المراجعة. سنتواصل معك بخصوص موعد الاختبار/المقابلة عند تحديده.'+end}
  function list(){const A=all();const q=norm($('#ad-q').value),lv=$('#ad-lv').value,src=$('#ad-src').value;
    $$('[data-n]',root).forEach(b=>b.textContent=A.filter(a=>a.status===b.dataset.n).length);
    const L=A.filter(a=>(!fst||a.status===fst)&&(!lv||a.level===lv)&&(!src||(src==='mine'?a.mine:a.sample))&&(!q||norm([a.name,a.ref,a.prog,a.college].join(' ')).includes(q)));
    $('#ad-n').textContent=L.length;$('#ad-empty').hidden=L.length>0;
    $('#ad-list').innerHTML=L.map(a=>{const r=reqDocs(a),m=missing(a);const ini=(a.name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('');return `<li><button type="button" class="ad-row" data-ref="${esc(a.ref)}"><span class="ad-av" aria-hidden="true">${esc(ini)}</span><span class="ad-main"><b>${esc(a.name)}</b><small>${esc(a.prog)} · ${esc(LV[a.level]||'')}</small></span><span class="ad-meta"><span class="ad-ref" dir="ltr">${esc(a.ref)}</span><time>${esc(a.date)}</time></span><span class="ad-docs" title="المستندات المطلوبة"><i style="--p:${r.length?Math.round((r.length-m.length)/r.length*100):100}"></i>${r.length-m.length}/${r.length}</span><span class="pill st-${a.status}">${ST[a.status]}</span>${a.mine?'<span class="src-tag mine">من جهازي</span>':'<span class="sample-badge">عيّنة</span>'}</button></li>`}).join('')}
  $$('.pipe-s',root).forEach(b=>b.addEventListener('click',()=>{fst=fst===b.dataset.st?'':b.dataset.st;$$('.pipe-s',root).forEach(x=>x.setAttribute('aria-pressed',x.dataset.st===fst));list()}));
  ['ad-q','ad-lv','ad-src'].forEach(id=>$('#'+id).addEventListener('input',list));
  $('#ad-reset').addEventListener('click',()=>{if(!confirm('إعادة ضبط اللوحة؟ سيُحذف ما أرسلته من نموذج التقديم على هذا الجهاز وتُستعاد حالات العيّنات.'))return;localStorage.removeItem(OV);localStorage.removeItem('mbz-apps');ov={};list();toast('أُعيد ضبط اللوحة')});
  const dlg=$('#ad-dlg');
  function open(ref){const a=all().find(x=>x.ref===ref);if(!a)return;const r=reqDocs(a),m=missing(a),ch=checks(a);
    const row=(k,v)=>v?`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`:'';
    const nat={citizen:'مواطن',mother:'من أبناء المواطنات',non:'غير مواطن'}[a.nat];
    $('#ad-detail').innerHTML=`<header class="ad-dh"><span class="ad-av lg">${esc((a.name||'?').trim()[0])}</span><div><h3 id="ad-dlg-h">${esc(a.name)}</h3><p><span dir="ltr">${esc(a.ref)}</span> · ${esc(a.date)} · <span class="pill st-${a.status}">${ST[a.status]}</span> ${a.mine?'<span class="src-tag mine">من نموذج التقديم</span>':'<span class="sample-badge">بيانات توضيحية</span>'}</p></div></header>
    <div class="ad-ai"><div class="ai-h"><span class="av orb sm"></span><b>ملخص ذكي</b><small>يُولَّد محلياً من بيانات الطلب والشروط المنشورة</small></div><p>${esc(aiSummary(a))}</p></div>
    <div class="ad-cols"><section><h4>بيانات الطلب</h4><dl class="ad-dl">${row('البرنامج',a.prog)}${row('المستوى',LV[a.level])}${row('الكلية',a.college)}${row('الفرع',a.campus)}${row('فئة الجنسية',nat)}${row('البريد',a.email)}${row('الهاتف',a.phone)}${row('الشهادة',(certOf(a.cert)||[])[1])}${row('المعدل',a.avg&&a.avg+'%')}${row('المعدل التراكمي',a.gpa)}${row('IELTS',a.ielts)}</dl></section>
    <section><h4>فحص الأهلية الآلي</h4><ul class="ad-chk">${ch.map(c=>`<li class="c-${c[0]}">${esc(c[1])}</li>`).join('')}</ul><h4>فحص المستندات</h4><ul class="ad-chk">${r.map(d=>`<li class="c-${(a.docs||{})[d.id]?'ok':'no'}">${esc(d.t)}${a.docNames&&a.docNames[d.id]?' — <small>'+esc(a.docNames[d.id].n)+'</small>':''}</li>`).join('')||'<li class="c-info">لا توجد مستندات مستنتجة لهذا المستوى</li>'}</ul>${m.length?`<p class="ad-warn">ناقص ${m.length} من ${r.length}</p>`:'<p class="ad-okm">كل المستندات المستنتجة مرفقة</p>'}</section></div>
    <section class="ad-reply"><h4>رد مقترح <small>(نموذج — لا يُرسل)</small></h4><textarea id="ad-txt" rows="8" dir="rtl">${esc(reply(a))}</textarea><div class="ad-act"><button type="button" class="btn btn-ghost" id="ad-copy">نسخ الرد</button></div></section>
    <section><h4>تغيير الحالة <small>(محلياً)</small></h4><div class="ad-sts">${Object.entries(ST).map(([k,t])=>`<button type="button" class="pill st-${k}${a.status===k?' on':''}" data-set="${k}" aria-pressed="${a.status===k}">${t}</button>`).join('')}</div></section>`;
    $('#ad-copy').onclick=()=>{const t=$('#ad-txt').value;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('نُسخ الرد'),()=>{$('#ad-txt').select();toast('حدّد النص وانسخه')})};
    $$('[data-set]',dlg).forEach(b=>b.onclick=()=>{const s=b.dataset.set;if(a.mine){let apps=JSON.parse(localStorage.getItem('mbz-apps')||'[]');apps=apps.map(x=>x.ref===a.ref?{...x,status:s}:x);localStorage.setItem('mbz-apps',JSON.stringify(apps))}else{ov[a.ref]={...(ov[a.ref]||{}),status:s};localStorage.setItem(OV,JSON.stringify(ov))}list();open(a.ref);toast('الحالة: '+ST[s])});
    if(!dlg.open)dlg.showModal()}
  $('#ad-list').addEventListener('click',e=>{const b=e.target.closest('.ad-row');if(b)open(b.dataset.ref)});
  dlg.addEventListener('click',e=>{if(e.target===dlg||e.target.closest('[data-close]'))dlg.close()});
  addEventListener('storage',e=>{if(e.key==='mbz-apps')list()});
  list();
  const h=new URLSearchParams(location.search).get('app');if(h)open(h);
})();
