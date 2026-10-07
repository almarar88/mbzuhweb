/* Staff portal: store dashboard + magazine review queue (local demo) */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(e){return d}};
  const sv=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=m=>{const t=$('.toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)};
  const SB='<span class="sample-badge">بيانات توضيحية</span>';
  /* ---------- store admin ---------- */
  const sd=$('#sa-data');
  if(sd){const D=JSON.parse(sd.textContent);const byId=Object.fromEntries(D.p.map(p=>[p.id,p]));const ST={new:'جديد',ready:'جاهز للاستلام',done:'تم التسليم',cancel:'ملغى'};
    const stOver=()=>ld('mbz-orders-state',{});
    const orders=()=>{const o=stOver();return [...ld('mbz-orders',[]),...D.o].map(x=>Object.assign({},x,o[x.ref]?{status:o[x.ref]}:{}))};
    function render(){const O=orders();const books=D.p.filter(p=>p.kind==='book');const low=books.filter(p=>p.stock<10).length;const units=O.reduce((a,o)=>a+o.items.reduce((x,i)=>x+i[1],0),0);
      $('#sa-kpis').innerHTML=[['الطلبات',O.length],['بانتظار التجهيز',O.filter(o=>o.status==='new').length],['الكتب المطلوبة (نسخ)',units],['منتجات منخفضة المخزون',low]].map(([l,v])=>`<div class="sa-k"><b class="numx">${v}</b><span>${l}</span></div>`).join('');
      $('#sa-orders').innerHTML=O.map(o=>`<li class="sa-o"><div class="sa-o-h"><b dir="ltr">${esc(o.ref)}</b>${o.sample?SB:'<span class="mine-badge">من هذا الجهاز</span>'}<span class="pill st-${o.status}">${ST[o.status]||o.status}</span></div><small>${esc(o.name)} · ${esc(o.date)} · ${esc(o.pickup||'')}</small><ul>${o.items.map(([id,n])=>`<li>${esc((byId[id]||{t:id}).t)} × <span class="numx">${n}</span></li>`).join('')}</ul><label class="sa-sel"><span class="sr-only">حالة الطلب ${esc(o.ref)}</span><select data-ref="${esc(o.ref)}">${Object.entries(ST).map(([k,v])=>`<option value="${k}"${k===o.status?' selected':''}>${v}</option>`).join('')}</select></label></li>`).join('')||'<li class="empty">لا توجد طلبات.</li>';
      prods()}
    function prods(){const q=($('#sa-q').value||'').trim();$('#sa-prods').innerHTML=D.p.filter(p=>!q||p.t.includes(q)).map(p=>`<li><span class="sa-c">${p.img?`<img src="${esc(p.img)}" alt="" loading="lazy">`:''}</span><span class="sa-pb"><b>${esc(p.t)}</b><small>${esc(p.tl)}</small></span>${p.kind==='book'?`<span class="sa-stock${p.stock<10?' low':''}"><span class="numx">${p.stock}</span> <small>نسخة</small></span>`:'<span class="prop-badge">مفهوم</span>'}</li>`).join('')}
    $('#sa-orders').addEventListener('change',e=>{const s=e.target.closest('select[data-ref]');if(!s)return;const o=stOver();o[s.dataset.ref]=s.value;sv('mbz-orders-state',o);toast('تم تحديث حالة الطلب (محلياً)');render()});
    $('#sa-q').addEventListener('input',prods);render()}
  /* ---------- magazine review ---------- */
  const ms=$('#mr-samples');
  if(ms){const samples=JSON.parse(ms.textContent);let tab='pending';
    const over=()=>ld('mbz-contrib-state',{});
    const all=()=>{const o=over();return [...ld('mbz-contrib',[]),...samples].map(c=>Object.assign({},c,o[c.id]||{}))};
    const words=t=>(String(t).match(/\S+/g)||[]).length;
    const check=c=>{const w=words(c.body);const P=String(c.body).split(/\n{2,}/).filter(x=>x.trim()).length;return [[w>=80,`${w} كلمة`],[P>=2,`${P} فقرات`],[c.title&&c.title.length>=6,'العنوان'],[!/https?:\/\//.test(c.body),'بلا روابط خارجية']]};
    function setSt(id,patch){const o=over();o[id]=Object.assign({},o[id]||{},patch);sv('mbz-contrib-state',o)}
    function render(){const L=all().filter(c=>c.status===tab);const counts={};all().forEach(c=>counts[c.status]=(counts[c.status]||0)+1);
      $$('[data-mr]').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.mr===tab);b.dataset.n=counts[b.dataset.mr]||0});
      $('#mr-list').innerHTML=L.map(c=>`<li class="mr-i" data-id="${esc(c.id)}"><div class="mr-h"><b>${esc(c.title)}</b>${c.sample?SB:'<span class="mine-badge">من هذا الجهاز</span>'}</div><small>${esc(c.author)} · ${esc(c.role||'')} · ${esc(c.date||'')}</small><p class="mr-ex">${esc(String(c.body).slice(0,220))}${String(c.body).length>220?'…':''}</p><ul class="mr-chk">${check(c).map(([ok,l])=>`<li class="${ok?'ok':'no'}">${ok?'✓':'!'} ${esc(l)}</li>`).join('')}</ul>
        <div class="mr-act">${tab!=='approved'?'<button type="button" class="btn btn-primary" data-a="approved">اعتماد</button>':''}${tab!=='rejected'?'<button type="button" class="btn btn-ghost" data-a="rejected">رفض</button>':''}<button type="button" class="btn btn-ghost" data-a="edit">تحرير</button>${tab!=='pending'?'<button type="button" class="linkbtn" data-a="pending">إعادة للمراجعة</button>':''}</div>
        <form class="mr-ed" hidden><label>العنوان<input name="t" value="${esc(c.title)}"></label><label>النص<textarea name="b" rows="8">${esc(c.body)}</textarea></label><div class="mr-act"><button class="btn btn-primary">حفظ التعديل</button><button type="button" class="btn btn-ghost" data-a="cancel">إلغاء</button></div></form></li>`).join('');
      $('#mr-empty').hidden=L.length>0}
    $$('[data-mr]').forEach(b=>b.addEventListener('click',()=>{tab=b.dataset.mr;render()}));
    $('#mr-list').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const li=b.closest('.mr-i');const id=li.dataset.id;const a=b.dataset.a;
      if(a==='edit'){li.querySelector('.mr-ed').hidden=false;li.querySelector('.mr-ed input').focus();return}
      if(a==='cancel'){li.querySelector('.mr-ed').hidden=true;return}
      setSt(id,{status:a});toast(a==='approved'?'اعتُمدت المساهمة — تظهر الآن في المجلة على هذا الجهاز':a==='rejected'?'رُفضت المساهمة':'أُعيدت للمراجعة');render()});
    $('#mr-list').addEventListener('submit',e=>{e.preventDefault();const li=e.target.closest('.mr-i');const f=e.target;setSt(li.dataset.id,{title:f.t.value.trim(),body:f.b.value});toast('حُفظ التعديل');render()});
    render()}
})();
