'use strict';
const $ = s => document.querySelector(s);
const escapeHtml = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fallbackImage = '/dat-graphics/uploads/cover-nail-by-eyu.webp';
let content={site:{},projects:[]}; let activeCategory='All';
function setText(selector,value) {const e=$(selector);if(e)e.textContent=value||'';}
function imageUrl(s) {const url=window.DAT_MEDIA?(window.DAT_MEDIA(s)||fallbackImage):typeof s==='string'&&(s.startsWith('/dat-graphics/assets/')||s.startsWith('/dat-graphics/uploads/'))?s:fallbackImage;return window.DAT_PREVIEW_URL?.(url)||url;}
function renderWork(){
 const published=content.projects.filter(p=>p.published); const cats=['All',...new Set(published.map(p=>p.category).filter(Boolean))];
 $('#workFilters').innerHTML=cats.map(cat=>`<button class="filter-chip ${cat===activeCategory?'active':''}" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`).join('');
 const items=published.filter(p=>activeCategory==='All'||p.category===activeCategory).sort((a,b)=>a.order-b.order);
 setText('#workCount',String(items.length).padStart(2,'0')+' / '+String(published.length).padStart(2,'0'));
 $('#projectGrid').innerHTML=items.length?items.map((p,i)=>`<a href="/dat-graphics/project.html?slug=${encodeURIComponent(p.slug)}" class="project-card" aria-label="Open ${escapeHtml(p.title)} case study"><img loading="lazy" alt="${escapeHtml(p.title)} artwork" src="${imageUrl(p.cover)}"><span class="project-overline">${String(i+1).padStart(2,'0')} / ${escapeHtml(p.category)}</span>${p.isDemo?'<span class="project-badge">CONCEPT</span>':''}<div class="project-data"><div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.year||p.category)}</p></div><span class="project-arrow">↗</span></div></a>`).join(''):'<div class="loading-project">No published projects in this category yet.</div>';
 $('#workFilters').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{activeCategory=b.dataset.filter;renderWork()}));
}
function renderHeroGallery(){
 const root=$('#heroGallery');if(!root)return;
 // Featured published case studies only; default to published work if none featured.
 const published=content.projects.filter(p=>p.published && p.slug);
 const featured=published.filter(p=>p.featured).sort((a,b)=>a.order-b.order);
 const items=(featured.length?featured:published).slice(0,4);
 if(!items.length){root.innerHTML='<span class="gallery-loading">Projects will appear here when published.</span>';return;}
 root.innerHTML=items.map((p,i)=>`<a class="gallery-panel panel-${['one','two','three','four'][i]}" data-panel="${i}" href="/dat-graphics/project.html?slug=${encodeURIComponent(p.slug)}" aria-label="Explore ${escapeHtml(p.title)} case study"><img draggable="false" src="${imageUrl(p.heroCover||p.cover)}" alt="${escapeHtml(p.title)} project artwork"><span class="panel-index">${String(i+1).padStart(2,'0')} / FEATURED WORK</span><span class="panel-title">${escapeHtml(String(p.title).split("/")[0].trim())}</span><span class="panel-category">${escapeHtml(p.category)} ${p.isDemo?'· CONCEPT':''}</span><span class="panel-arrow" aria-hidden="true">↗</span></a>`).join('');
 const finePointer=matchMedia('(hover:hover) and (pointer:fine)').matches;
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!finePointer || reduceMotion)return; // touch devices use native horizontal swipe
 root.querySelectorAll('.gallery-panel').forEach(panel=>{
  let drag=null;let moved=false;
  const updateTilt=e=>{
   const r=panel.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;
   panel.style.setProperty('--tilt-y',(x*12).toFixed(1)+'deg');
   panel.style.setProperty('--tilt-x',(-y*9).toFixed(1)+'deg');
  };
  panel.addEventListener('pointermove',e=>{
   if(e.pointerType!=='mouse')return;
   if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.hypot(dx,dy)>9)moved=true;
    panel.style.setProperty('--drag-x',Math.max(-70,Math.min(70,dx))+'px');
    panel.style.setProperty('--drag-y',Math.max(-45,Math.min(45,dy))+'px');
   } else updateTilt(e);
  });
  panel.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,y:e.clientY};moved=false;panel.classList.add('is-dragging');panel.setPointerCapture(e.pointerId)});
  const reset=()=>{drag=null;panel.classList.remove('is-dragging');panel.style.setProperty('--drag-x','0px');panel.style.setProperty('--drag-y','0px')};
  panel.addEventListener('pointerup',reset);
  panel.addEventListener('pointercancel',reset);
  panel.addEventListener('lostpointercapture',reset);
  panel.addEventListener('pointerleave',()=>{if(!drag){panel.style.setProperty('--tilt-x','0deg');panel.style.setProperty('--tilt-y','0deg')}});
  panel.addEventListener('click',e=>{if(moved){e.preventDefault();moved=false}});
  panel.addEventListener('dragstart',e=>e.preventDefault());
 });
}
function renderAbout(s){
 const paragraphs=String(s.aboutText||'').split(/\n\s*\n/).map(t=>t.trim()).filter(Boolean);
 const tools=String(s.aboutTools||'').split(/[,\n]+/).map(t=>t.trim()).filter(Boolean);
 $('#aboutText').innerHTML=`<p class="profile-intro">${escapeHtml(s.aboutIntro||'')}</p><div class="profile-description">${paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</div>`;
 setText('#profileLocation',s.location);
 const companies=Array.isArray(s.companies)?s.companies:[];
 $('#companyExperience').innerHTML=companies.map((c,i)=>`<details class="experience-entry" ${c.current?'open':''}><summary><span class="company-logo">${c.logo?`<img src="${imageUrl(c.logo)}" alt="${escapeHtml(c.company)} logo" loading="lazy">`:`<span>${escapeHtml(c.company.slice(0,2))}</span>`}</span><span class="experience-name"><span class="experience-status ${c.current?'is-current':''}">${c.current?'CURRENT POSITION':escapeHtml(c.period||'SELECTED EXPERIENCE')}</span><strong>${escapeHtml(c.company)}</strong><span class="experience-role">${escapeHtml(c.role)}</span></span><span class="experience-plus" aria-hidden="true">+</span></summary><div class="experience-detail"><p>${escapeHtml(c.description)}</p>${c.current?'':`<span>${escapeHtml(c.period)}</span>`}</div></details>`).join('');
 const collaborators=String(s.aboutCollaborators||'').split(/[,\n]+/).map(t=>t.trim()).filter(Boolean);
 $('#profileCollaborators').innerHTML=collaborators.length?`<div class="profile-collaborators"><span class="profile-micro">ALSO WORKED WITH</span><p>${collaborators.map(escapeHtml).join('<span aria-hidden="true"> / </span>')}</p></div>`:'';
 const initials={Photoshop:'Ps',Illustrator:'Ai',InDesign:'Id'};
 $('#profileTools').innerHTML=tools.length?`<span class="profile-micro">TOOLS OF THE TRADE</span><div class="profile-tools">${tools.map(t=>`<span title="Adobe ${escapeHtml(t)}"><b aria-hidden="true">${escapeHtml(initials[t]||t.slice(0,2))}</b><span>${escapeHtml(t)}</span></span>`).join('')}</div>`:'';
}
function renderSite(){
 const s=content.site;document.title='DAT Graphics · '+(s.name||'Dagim Tesfaye Shewangizaw')+' — Visual Portfolio';
 setText('#heroEyebrow',s.eyebrow||'GRAPHIC DESIGNER');
 // Respect an intentional newline but keep provided text plain and safe.
 setText('#headline1',s.headline1||'Visual Stories');setText('#headline2',s.headline2||'for Brands that Matter.');
 setText('#tagline',s.tagline);const aboutTitle=$('#aboutTitle');const words=(s.aboutTitle||'Design with Purpose.').trim().split(' ');const last=words.pop()||'';aboutTitle.textContent=words.join(' ')+(words.length?' ':'');const accent=document.createElement('i');accent.textContent=last;aboutTitle.append(accent);renderAbout(s);
 setText('#availability',s.availability);setText('#footerName',s.name||'Dagim Tesfaye Shewangizaw');
 setText('#footerNote',s.footerNote||'DESIGN WITH PURPOSE');
 if(s.portrait)$('#portrait').src=imageUrl(s.portrait);if(s.aboutImage)$('#aboutImage').src=imageUrl(s.aboutImage);if(s.aboutSecondaryImage)$('#aboutSecondaryImage').src=imageUrl(s.aboutSecondaryImage);
 $('#serviceList').innerHTML=(s.services||[]).map((sv,i)=>`<div class="service-row"><span class="num">${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHtml(sv.title)}</h3><p>${escapeHtml(sv.desc)}</p></div><span class="arr">↗</span></div>`).join('');
 $('#socialLinks').innerHTML=['facebook','instagram','youtube','behance','dribbble','linkedin'].filter(k=>/^https:\/\//.test(s[k]||'')).map(k=>`<a href="${escapeHtml(s[k])}" target="_blank" rel="noopener noreferrer">${k.toUpperCase()} ↗</a>`).join('');
 if(s.contactEmail)$('#socialLinks').insertAdjacentHTML('beforeend',`<a href="mailto:${encodeURIComponent(s.contactEmail).replace('%40','@')}">EMAIL ↗</a>`);
 if(s.contactPhone){const phone=String(s.contactPhone).replace(/[^\d+]/g,'');if(phone)$('#socialLinks').insertAdjacentHTML('beforeend',`<a href="tel:${phone}">${escapeHtml(s.contactPhone)} ↗</a>`);}
 setText('#contactIntro',`${s.location||'Addis Ababa, Ethiopia'} · Let’s talk brand identity, campaign artwork and social media content.`);
 const hasReel=!!s.showreel;
 $('#showreelBtn').innerHTML=`<span class="play-round">${hasReel?'▶':'↗'}</span><span>${hasReel?'WATCH SHOWREEL':'VIEW ARTWORK'}<small>${hasReel?'ART IN MOTION':'SELECTED DESIGN WORK'}</small></span>`;
 setText('#showreelTitle',hasReel?'Motion & Meaning':'Selected Artwork');
 $('#showreelModal').setAttribute('aria-label',hasReel?'Showreel':'Selected artwork');
 $('#demoTag').hidden=!s.isDemo;
}
function initScroll(){
 const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');obs.unobserve(e.target)}}),{threshold:.11});
 document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
 const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;$('#progress').style.width=(max>0?scrollY/max*100:0)+'%';let id='home';for(const section of document.querySelectorAll('main section[id]'))if(section.getBoundingClientRect().top<200)id=section.id;document.querySelectorAll('.rail-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));};
 window.addEventListener('scroll',update,{passive:true});update();
}
// Motion is managed centrally by experience.js to avoid conflicting transforms.
function initEvents(){
 $('#mobileMenu').addEventListener('click',()=>{const nav=$('#nav');const open=nav.classList.toggle('open');$('#mobileMenu').setAttribute('aria-expanded',open?'true':'false')});
 document.querySelectorAll('.rail-nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
 $('#showreelBtn').addEventListener('click',()=>{
  const url=content.site.showreel;const body=$('#showreelBody');body.textContent='';
  if(url&&(url.startsWith('/dat-graphics/uploads/')||window.DAT_MEDIA?.(url)) && /\.(mp4|webm)$/i.test(url)){const video=document.createElement('video');video.src=url;video.controls=true;video.playsInline=true;video.preload='metadata';body.append(video);video.play().catch(()=>{});}
  else if(url&&url.startsWith('https://')){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='OPEN SHOWREEL ↗';a.className='outline-pill';body.append(a)}
  else {
   const work=content.projects.filter(p=>p.published&&p.featured).slice(0,4);
   body.innerHTML='<p>Explore the design work of Dagim Tesfaye Shewangizaw.</p><div class="case-gallery">'+work.map(p=>`<a href="/dat-graphics/project.html?slug=${encodeURIComponent(p.slug)}"><img src="${imageUrl(p.cover)}" alt="${escapeHtml(p.title)}"><p>${escapeHtml(p.title)} ↗</p></a>`).join('')+'</div>';
  }
  $('#showreelModal').hidden=false;$('#modalClose').focus();
 });
 const close=()=>{$('#showreelModal').hidden=true;const v=$('#showreelModal video');if(v)v.pause();$('#showreelBtn').focus()};
 $('#modalClose').addEventListener('click',close);$('#showreelModal').addEventListener('click',e=>{if(e.target.id==='showreelModal')close()});addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 $('#contactForm').addEventListener('submit',async e=>{
   e.preventDefault();const form=e.currentTarget,btn=form.querySelector('[type=submit]');const status=$('#formStatus');status.textContent='Sending…';btn.disabled=true;
   try {if(window.DAT_DATA?.contact){await window.DAT_DATA.contact(Object.fromEntries(new FormData(form)))}else{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const result=await response.json();if(!response.ok)throw new Error(result.error||'Unable to send');}status.textContent='Message received. Thank you — we will be in touch.';form.reset()}
   catch(err){status.textContent=err.message||'Could not send your message.'}finally{btn.disabled=false}
 });
}
(async()=>{try{content=window.DAT_DATA?await window.DAT_DATA.site():await fetch('/api/site').then(r=>{if(!r.ok)throw Error('Site unavailable');return r.json()});renderSite();renderWork();renderHeroGallery();initScroll();initEvents();}catch(err){console.error(err);$('#projectGrid').innerHTML='<div class="loading-project">Could not load the portfolio. Please refresh.</div>';}finally{window.DAT_BOOT?.ready()}})();
