/* Branded contact controls; email composition uses an ordinary browser link. */
(() => {
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svg=body=>`<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">${body}</svg>`;
 const icons={
  facebook:svg('<path fill="currentColor" d="M20.8 7.1h3.1V2.3a40 40 0 0 0-4.5-.3c-4.5 0-7.5 2.7-7.5 7.7V14H7v5.4h4.9V32h6V19.4h4.9l.8-5.4h-5.7V10c0-1.6.5-2.9 2.9-2.9Z"/>'),
  instagram:svg('<rect x="4" y="4" width="24" height="24" rx="7" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="16" cy="16" r="5.6" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="23.8" cy="8.7" r="1.8" fill="currentColor"/>'),
  youtube:svg('<path fill="currentColor" d="M30.5 8.4a4 4 0 0 0-2.8-2.8C25.2 5 16 5 16 5s-9.2 0-11.7.6a4 4 0 0 0-2.8 2.8C.8 10.9.8 16 .8 16s0 5.1.7 7.6a4 4 0 0 0 2.8 2.8C6.8 27 16 27 16 27s9.2 0 11.7-.6a4 4 0 0 0 2.8-2.8c.7-2.5.7-7.6.7-7.6s0-5.1-.7-7.6Z"/><path fill="#f00829" d="m13 21 8-5-8-5Z"/>'),
  email:svg('<rect x="3.5" y="6.5" width="25" height="19" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m5 9 11 8 11-8m-22 14 7-6m15 6-7-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>'),
  external:svg('<path d="M8 24 24 8M8 8h16v16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>')
 };
 const copyIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/></svg>';
 function gmailUrl(email){return 'https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(String(email).trim())}
 function tile(key,url,label){return `<a class="contact-tile contact-tile--${key}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}" title="${esc(label)}"><span class="contact-tile-back" aria-hidden="true"></span><span class="contact-tile-face">${icons[key]||icons.external}<span class="contact-tile-arrow" aria-hidden="true">↗</span></span><span class="contact-tile-tooltip" aria-hidden="true">${key==='email'?'Compose in Gmail':key.charAt(0).toUpperCase()+key.slice(1)}</span></a>`}
 function render(site,root){
  if(!root)return;root.classList.add('contact-social');
  const social=['facebook','instagram','youtube','behance','dribbble','linkedin'].filter(k=>/^https:\/\//.test(site[k]||''));
  const email=String(site.contactEmail||'').trim(),phone=String(site.contactPhone||'').replace(/[^\d+]/g,'');
  root.innerHTML=`<span class="contact-social-caption">A CONVERSATION AWAY<span aria-hidden="true">↗</span></span><div class="contact-platforms">${social.map(k=>tile(k,site[k],k.charAt(0).toUpperCase()+k.slice(1)+' profile')).join('')}${email?tile('email',gmailUrl(email),'Write an email to '+email+' in Gmail'):''}</div>${email?`<div class="contact-email-address"><span>${esc(email)}</span><button type="button" class="contact-copy" aria-label="Copy email address" title="Copy email address">${copyIcon}</button></div>`:''}<div class="contact-utilities">${email?`<a href="mailto:${encodeURIComponent(email).replace('%40','@')}" aria-label="Open your email app to write to ${esc(email)}">USE EMAIL APP <span aria-hidden="true">↗</span></a>`:''}${phone?`<a href="tel:${phone}" aria-label="Call ${esc(site.contactPhone)}">${esc(site.contactPhone)} <span aria-hidden="true">↗</span></a>`:''}</div><span class="contact-copy-status" role="status" aria-live="polite"></span>`;
  root.querySelector('.contact-copy')?.addEventListener('click',async()=>{
   const status=root.querySelector('.contact-copy-status');
   try{await navigator.clipboard.writeText(email);status.textContent='Email address copied.'}
   catch{status.textContent='Select the email address above to copy it.'}
  });
 }
 const api={render,gmailUrl};if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.DAT_CONTACT_LINKS=api;
})();
