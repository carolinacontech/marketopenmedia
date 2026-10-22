/* Shared, lightweight inner-page motion. Never hides content without JS. */
(function(){
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;
  var header = document.querySelector('header.sh');
  function updateHeader(){ if(header) header.classList.toggle('scrolled', window.scrollY > 26); }
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});
  if(reduced || !('IntersectionObserver' in window)) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.mi-reveal'));
  if(!items.length) return;
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){entry.target.classList.add('mi-visible');observer.unobserve(entry.target);}
    });
  },{rootMargin:'0px 0px -35px 0px',threshold:.08});
  items.forEach(function(item){observer.observe(item);});
  body.setAttribute('data-mi-motion','on');
  requestAnimationFrame(function(){
    items.forEach(function(item){if(item.getBoundingClientRect().top < window.innerHeight*.95) item.classList.add('mi-visible');});
  });
})();
