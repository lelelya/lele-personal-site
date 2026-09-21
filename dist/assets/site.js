if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;const s=document.createElement('span');s.className='sparkle';s.textContent='✦';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';document.body.append(s);setTimeout(()=>s.remove(),700)});
}
const progress=document.querySelector('.progress');
if(progress)addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--progress',(max?scrollY/max*100:0)+'%')},{passive:true});
