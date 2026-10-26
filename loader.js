/* Readiness comes from rendered content, fonts and decoded page images. */
(() => {
 'use strict';
 // One introduction per site, per tab session. Internal pages never show it.
 window.DAT_BOOT={ready(){}};
 const pathname=window.location?.pathname||'/';
 const base=window.DAT_CLOUD_CONFIG?.base||(pathname==='/admin'?'/admin':'/');
 const entry=base.endsWith('/')?base:base+'/';
 if(pathname!==base&&pathname!==entry&&pathname!==entry+'index.html')return;
 try{const storage=window.sessionStorage,key='dat-intro-seen:'+base;if(storage?.getItem(key))return;storage?.setItem(key,'1')}catch{}
 const root=document.documentElement,started=performance.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let mounted=false,contentReady=false,finished=false,target=0,shown=0,frame=0,failed=0,overlay,counter,meter,label,skip;
 const previousInert=new Map();root.classList.add('dat-loading');
 const tick=()=>{shown=Math.min(target,shown+Math.max(.3,(target-shown)*.14));if(counter)counter.textContent=String(Math.floor(shown)).padStart(3,'0');if(meter){meter.style.transform=`scaleX(${shown/100})`;meter.parentElement.setAttribute('aria-valuenow',String(Math.floor(shown)))}frame=requestAnimationFrame(tick)};
 const stage=(value,text)=>{target=Math.max(target,value);if(label)label.textContent=text};
 const release=(complete=true)=>{
  if(finished)return;finished=true;clearTimeout(watchdog);clearTimeout(offerSkip);
  if(complete){target=shown=100;if(counter)counter.textContent='100';if(meter){meter.style.transform='scaleX(1)';meter.parentElement.setAttribute('aria-valuenow','100')}if(label)label.textContent=failed?'READY TO EXPLORE':'EVERY DETAIL, IN PLACE'}
  setTimeout(()=>{root.classList.remove('dat-loading');root.classList.add('dat-entered');overlay?.classList.add('is-complete');for(const [node,value] of previousInert)node.inert=value;cancelAnimationFrame(frame);setTimeout(()=>overlay?.remove(),reduced?0:650);window.dispatchEvent(new Event('dat:revealed'))},complete?Math.max(0,650-(performance.now()-started))+180:0);
 };
 const imageReady=img=>new Promise(resolve=>{
  let settled=false;const done=async()=>{if(settled)return;settled=true;clearTimeout(timer);img.removeEventListener('load',done);img.removeEventListener('error',done);if(img.naturalWidth){try{await img.decode()}catch{}}else failed++;resolve()};
  const timer=setTimeout(done,15000);img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});img.loading='eager';if(img.complete)done();
 });
 async function prepare(){
  if(!mounted||!contentReady||prepare.running||finished)return;prepare.running=true;stage(15,'SETTING THE TYPE');
  const fonts=Promise.resolve(document.fonts?.ready).then(()=>stage(Math.max(target,25),'BRINGING THE WORK INTO FOCUS'));
  const images=[...document.images].filter(img=>img.getAttribute('src')&&!img.closest('[hidden], #datLoader, .modal, .library-modal'));let settled=0;
  await Promise.all([fonts,Promise.all(images.map(img=>imageReady(img).then(()=>{settled++;stage(25+74*settled/Math.max(1,images.length),'BRINGING THE WORK INTO FOCUS')})))]);release(true);
 }
 window.DAT_BOOT={ready(){contentReady=true;prepare()}};
 const watchdog=setTimeout(()=>release(false),22000),offerSkip=setTimeout(()=>{if(skip){skip.hidden=false;skip.textContent='CONNECTION TAKING A MOMENT? ENTER NOW ↗'}},8000);
 document.addEventListener('DOMContentLoaded',()=>{
  overlay=document.createElement('section');overlay.id='datLoader';overlay.className='dat-loader';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Preparing DAT Graphics');
  const studio=!!document.querySelector('#loginScreen'),logo=(window.DAT_CLOUD_CONFIG?.base||'/')+'assets/dat-graphics-logo.png';
  overlay.innerHTML=`<div class="dl-grid" aria-hidden="true"></div><div class="dl-top"><span class="dl-wordmark"><img src="${logo}" width="74" height="64" alt="DAT Graphics logo"></span><span>${studio?'PRIVATE CONTENT STUDIO':'THE VISUAL INDEX'}<br>ADDIS ABABA / ETHIOPIA</span><span class="dl-edition">DESIGN IN MOTION<br><i></i> ESTABLISHING CONNECTION</span></div><div class="dl-center"><div class="dl-orbit" aria-hidden="true"><span></span><span></span><span></span><b>✳</b></div><p class="dl-eyebrow">A LITTLE ANTICIPATION. A LOT OF INTENTION.</p><h1>${studio?'Behind every<br><em>great detail.</em>':'Good things<br><em>take shape.</em>'}</h1><div class="dl-counter" aria-hidden="true"><span data-count>000</span><sup>%</sup><span class="dl-count-note">LOADING<br>THE EXPERIENCE</span></div></div><div class="dl-bottom"><div class="dl-status"><span data-stage role="status" aria-live="polite">GATHERING THE STORY</span><span>FORM / COLOR / CONNECTION</span></div><div class="dl-track" role="progressbar" aria-label="Loading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span data-meter></span></div><div class="dl-foot"><span><i></i> DAT GRAPHICS</span><button type="button" data-skip hidden>ENTER NOW ↗</button><span>MADE TO MEAN SOMETHING.</span></div></div>`;
  document.body.prepend(overlay);counter=overlay.querySelector('[data-count]');meter=overlay.querySelector('[data-meter]');label=overlay.querySelector('[data-stage]');skip=overlay.querySelector('[data-skip]');skip.addEventListener('click',()=>release(false));
  if(!finished){for(const child of document.body.children){if(child!==overlay&&!['SCRIPT','STYLE'].includes(child.tagName)){previousInert.set(child,child.inert);child.inert=true}}frame=requestAnimationFrame(tick)}else{overlay.remove();root.classList.remove('dat-loading')}
  mounted=true;prepare();
 },{once:true});
 window.addEventListener('pageshow',e=>{if(e.persisted)release(false)});
})();
