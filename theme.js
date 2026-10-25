/* Runs in the head: apply preference before first paint, then bind native buttons. */
(() => {
 'use strict';
 const key='dat-graphics-theme';
 const root=document.documentElement;
 const system=window.matchMedia('(prefers-color-scheme: light)');
 const read=()=>{try{const value=localStorage.getItem(key);return value==='light'||value==='dark'?value:null;}catch{return null;}};
 let chosen=read();
 const preferred=()=>chosen||(system.matches?'light':'dark');
 function apply(theme){
  root.dataset.theme=theme;
  root.style.colorScheme=theme;
  const light=theme==='light';
  const label=light?'Switch to dark mode':'Switch to light mode';
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>{
   button.setAttribute('aria-label',label);
   button.setAttribute('aria-pressed',String(light));
   button.title=label;
  });
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.content=light?'#FFFFFF':'#001220';
  const icon=document.querySelector('link[rel="icon"]');
  if(icon)icon.href=light?'/dat-graphics/assets/dat-graphics-icon-light.png':'/dat-graphics/assets/dat-graphics-icon.png';
 }
 apply(preferred());
 document.addEventListener('click',event=>{
  const button=event.target.closest?.('button[data-theme-toggle]');
  if(!button)return;
  chosen=root.dataset.theme==='light'?'dark':'light';
  try{localStorage.setItem(key,chosen);}catch{/* Theme switching still works if storage is blocked. */}
  apply(chosen);
 });
 document.addEventListener('DOMContentLoaded',()=>apply(preferred()));
 window.addEventListener('pageshow',()=>{chosen=read()||chosen;apply(preferred());});
 window.addEventListener('storage',event=>{if(event.key===key||event.key===null){chosen=read();apply(preferred());}});
 const systemChanged=()=>{if(!chosen)apply(preferred());};
 if(system.addEventListener)system.addEventListener('change',systemChanged);
 else system.addListener(systemChanged);
})();
