/* Minimal contact logos with a subtle selected-color state. */
(() => {
 'use strict';
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const svg=body=>`<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">${body}</svg>`;
 const icons={
  facebook:svg('<path fill="currentColor" d="M20.8 7.1h3.1V2.3a40 40 0 0 0-4.5-.3c-4.5 0-7.5 2.7-7.5 7.7V14H7v5.4h4.9V32h6V19.4h4.9l.8-5.4h-5.7V10c0-1.6.5-2.9 2.9-2.9Z"/>'),
  instagram:svg('<rect x="4" y="4" width="24" height="24" rx="7" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="16" cy="16" r="5.6" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="23.8" cy="8.7" r="1.8" fill="currentColor"/>'),
  youtube:svg('<path fill="currentColor" d="M30.5 8.4a4 4 0 0 0-2.8-2.8C25.2 5 16 5 16 5s-9.2 0-11.7.6a4 4 0 0 0-2.8 2.8C.8 10.9.8 16 .8 16s0 5.1.7 7.6a4 4 0 0 0 2.8 2.8C6.8 27 16 27 16 27s9.2 0 11.7-.6a4 4 0 0 0 2.8-2.8c.7-2.5.7-7.6.7-7.6s0-5.1-.7-7.6Z"/><path fill="var(--contact-surface)" d="m13 21 8-5-8-5Z"/>'),
  phone:svg('<path d="m8 4-3.2 1.3c-1 .4-1.5 1.5-1.2 2.6C7.2 19.4 12.6 24.8 24.1 28.4c1.1.3 2.2-.2 2.6-1.2L28 24c.3-.8 0-1.7-.8-2.1l-5-2.5c-.8-.4-1.7-.2-2.2.5l-1.3 1.7a22 22 0 0 1-8.3-8.3l1.7-1.3c.7-.5.9-1.4.5-2.2L10.1 4.8C9.7 4 8.8 3.7 8 4Z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>'),
  email:svg('<rect x="3.5" y="6.5" width="25" height="19" rx="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m5 9 11 8 11-8m-22 14 7-6m15 6-7-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>'),
  external:svg('<path d="M8 24 24 8M8 8h16v16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>')
 };
 const copyIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="3"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/></svg>';
 function gmailUrl(email){const compose='https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(String(email).trim());return 'https://accounts.google.com/AccountChooser/signinchooser?continue='+encodeURIComponent(compose)}
 function iconLink(key,url,label,external=true){return `<a class="contact-icon contact-icon--${key}" href="${esc(url)}" ${external?'target="_blank" rel="noopener noreferrer"':''} aria-label="${esc(label)}" title="${esc(label)}">${icons[key]||icons.external}</a>`}
 function render(site,root){
  if(!root)return;root.classList.add('contact-social');
  const social=['facebook','instagram','youtube'].filter(k=>/^https:\/\//.test(site[k]||''));
  const email=String(site.contactEmail||'').trim(),phone=String(site.contactPhone||'').replace(/[^\d+]/g,'');
  const names={facebook:'Facebook',instagram:'Instagram',youtube:'YouTube'};
  root.innerHTML=`<div class="contact-platforms">${social.map(k=>iconLink(k,site[k],names[k]+' profile')).join('')}${phone?iconLink('phone','tel:'+phone,'Call '+site.contactPhone,false):''}</div>${email?`<div class="contact-email-address"><a class="contact-email-link" href="${esc(gmailUrl(email))}" target="_blank" rel="noopener noreferrer" aria-label="Write an email to ${esc(email)} in Gmail">${esc(email)}</a><button type="button" class="contact-copy" aria-label="Copy email address" title="Copy email address">${copyIcon}</button></div><div class="contact-utilities"><a href="mailto:${encodeURIComponent(email).replace('%40','@')}" aria-label="Open your email app to write to ${esc(email)}">USE EMAIL APP ↗</a></div><span class="contact-email-note">Gmail · sign in if needed</span>`:''}<span class="contact-copy-status" role="status" aria-live="polite"></span>`;
  root.querySelectorAll('.contact-icon').forEach(link=>link.addEventListener('click',()=>{root.querySelectorAll('.contact-icon').forEach(item=>item.classList.remove('is-selected'));link.classList.add('is-selected')}));
  root.querySelector('.contact-copy')?.addEventListener('click',async()=>{
   const status=root.querySelector('.contact-copy-status');
   try{await navigator.clipboard.writeText(email);status.textContent='Email address copied.'}
   catch{status.textContent='Select the email address above to copy it.'}
  });
 }
 const api={render,gmailUrl};if(typeof module!=='undefined'&&module.exports)module.exports=api;else window.DAT_CONTACT_LINKS=api;
})();
