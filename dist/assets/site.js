const root=document.documentElement;
const stored=localStorage.getItem('island-theme');
if(stored)root.dataset.theme=stored;
document.querySelectorAll('[data-theme-toggle]').forEach(btn=>btn.addEventListener('click',()=>{
  const next=root.dataset.theme==='dark'?'light':'dark';root.dataset.theme=next;localStorage.setItem('island-theme',next);btn.setAttribute('aria-label',next==='dark'?'切换到浅色模式':'切换到深色模式');
}));
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;const s=document.createElement('span');s.className='sparkle';s.textContent='✦';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';document.body.append(s);setTimeout(()=>s.remove(),700)});
}
const progress=document.querySelector('.progress');
if(progress)addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--progress',(max?scrollY/max*100:0)+'%')},{passive:true});
