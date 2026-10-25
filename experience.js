'use strict';
/* DAT Graphics experience layer: progressive, keyboard-safe, and motion-aware. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const $ = selector => document.querySelector(selector);
  const veil = $('#pageVeil');
  let navigating = false;

  // Keep keyboard and browser-native navigation working. No external dependencies.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href^="/dat-graphics/project.html?slug="]');
    if (!link || !veil || reduce.matches || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || navigating) return;
    const url = new URL(link.href, location.origin);
    if (url.origin !== location.origin) return;
    event.preventDefault(); navigating = true;
    const picture = link.querySelector('img');
    if (picture) {
      const bounds = picture.getBoundingClientRect();
      // Zoom a copy of the tapped project image into the viewport.
      const clone = picture.cloneNode();
      Object.assign(clone.style, {left:`${bounds.left}px`,top:`${bounds.top}px`,
        width:`${bounds.width}px`,height:`${bounds.height}px`});
      clone.className = 'transition-image';
      document.body.append(clone);
      requestAnimationFrame(() => clone.classList.add('is-expanding'));
    }
    veil.classList.add('is-active'); veil.setAttribute('aria-hidden','false');
    setTimeout(() => { location.assign(url.href); }, 540);
  });
  window.addEventListener('pageshow', () => {
    navigating = false;
    veil?.classList.remove('is-active');
    document.querySelectorAll('.transition-image').forEach(el => el.remove());
  });

  // Immersive DAT scene: progressive, mouse- and scroll-reactive enhancement.
  // Standard native cursor and project-link interactions are intentionally preserved.
  const hero = $('.hero');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const fineQuery = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const interpolate = (current, target, factor) => current + (target-current) * factor;

  // Frame-smoothed pseudo-3D scene with distinct depths for the portrait, halo,
  // metallic ribbons, volumetric light, headline and gallery. Scroll provides an
  // independent axis so the scene does not freeze when the mouse is stationary.
  if (hero) {
    const scene = {tx:0,ty:0,x:0,y:0,ts:0,s:0,raf:0,visible:true};
    function scrollTarget() {
      const rect = hero.getBoundingClientRect();
      scene.ts = clamp(-rect.top/Math.max(1,rect.height),0,1);
      requestScene();
    }
    function stepScene() {
      scene.raf=0;
      if (document.hidden || !scene.visible || motionQuery.matches) return;
      scene.x=interpolate(scene.x,scene.tx,.075);
      scene.y=interpolate(scene.y,scene.ty,.075);
      scene.s=interpolate(scene.s,scene.ts,.09);
      hero.style.setProperty('--scene-x',scene.x.toFixed(4));
      hero.style.setProperty('--scene-y',scene.y.toFixed(4));
      hero.style.setProperty('--scene-scroll',scene.s.toFixed(4));
      hero.style.setProperty('--light-x',((scene.x+1)*50).toFixed(2)+'%');
      hero.style.setProperty('--light-y',((scene.y+1)*50).toFixed(2)+'%');
      const needsFrame=Math.max(Math.abs(scene.x-scene.tx),Math.abs(scene.y-scene.ty),Math.abs(scene.s-scene.ts))>.001;
      if(needsFrame)scene.raf=requestAnimationFrame(stepScene);
    }
    function requestScene(){if (!scene.raf && !motionQuery.matches && scene.visible && !document.hidden)scene.raf=requestAnimationFrame(stepScene);}
    hero.addEventListener('pointermove', event => {
      if (event.pointerType!=='mouse' || !fineQuery.matches || motionQuery.matches) return;
      const r=hero.getBoundingClientRect();
      scene.tx=clamp((event.clientX-r.left)/Math.max(1,r.width)*2-1,-1,1);
      scene.ty=clamp((event.clientY-r.top)/Math.max(1,r.height)*2-1,-1,1);
      requestScene();
    },{passive:true});
    hero.addEventListener('pointerleave',()=>{scene.tx=0;scene.ty=0;requestScene()});
    window.addEventListener('scroll',scrollTarget,{passive:true});
    window.addEventListener('resize',scrollTarget,{passive:true});
    const observer = new IntersectionObserver(entries=>{
      scene.visible=entries[0].isIntersecting;
      if(scene.visible){scrollTarget();requestScene();}
      else if(scene.raf){cancelAnimationFrame(scene.raf);scene.raf=0;}
    },{threshold:0});
    observer.observe(hero);
    motionQuery.addEventListener('change',()=>{
      if (motionQuery.matches) {
        if(scene.raf) cancelAnimationFrame(scene.raf);
        scene.raf=0;scene.tx=scene.ty=scene.ts=scene.x=scene.y=scene.s=0;
        hero.style.setProperty('--scene-x','0');hero.style.setProperty('--scene-y','0');hero.style.setProperty('--scene-scroll','0');
      } else scrollTarget();
    });
    scrollTarget();
  }
})();
