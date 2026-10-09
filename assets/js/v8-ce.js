/* v8 — slim CE ad card: dismissible on phone/tablet (remembered for this session), focus moves to the languages heading. */
(function(){
  const side=document.getElementById('ce-side');if(!side)return;
  const x=side.querySelector('.ce-side-x'),K='ce-side-x';
  try{if(sessionStorage.getItem(K)==='1')side.classList.add('off')}catch(e){}
  x&&x.addEventListener('click',()=>{side.classList.add('off');try{sessionStorage.setItem(K,'1')}catch(e){}
    const h=document.getElementById('lang-h');if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}});
})();
