/* Market Open Media — lightweight homepage motion; vanilla JS, no trackers/dependencies. */
(function(){
  'use strict';
  var body = document.body;
  if (!body || !body.classList.contains('mom-home')) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hero = document.querySelector('section.hero');
  var heroArt = document.querySelector('.mom-hero-art');
  var header = document.querySelector('header.sh');

  // Scroll effects use one passive listener and a requestAnimationFrame throttle.
  var waiting = false;
  function updateScroll() {
    waiting = false;
    var top = window.scrollY || document.documentElement.scrollTop || 0;
    if (header) header.classList.toggle('mom-is-scrolled', top > 24);
    if (heroArt && hero && !reduce && window.innerWidth > 768) {
      var heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom > -40) {
        heroArt.style.setProperty('--mom-parallax-y', Math.max(-34, -top * 0.07) + 'px');
      }
    }
  }
  function requestUpdate() {
    if (!waiting) { waiting = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', requestUpdate, {passive:true});
  window.addEventListener('resize', requestUpdate, {passive:true});
  updateScroll();

  // Add reveal targets without editing marketing copy, headings, or links.
  var revealTargets = [];
  function add(selector, baseDelay, step, limit) {
    var nodes = document.querySelectorAll(selector);
    Array.prototype.forEach.call(nodes, function(node, idx) {
      if (limit && idx >= limit) return;
      if (node.hasAttribute('data-mom-reveal')) return;
      node.setAttribute('data-mom-reveal','');
      node.style.setProperty('--mom-reveal-delay', (baseDelay + idx * step) + 'ms');
      revealTargets.push(node);
    });
  }
  add('#services > div:first-child',0,0);
  add('#services .card',70,100);
  add('#what-you-get > div > div:first-child',0,0);
  add('#what-you-get > div > div:nth-child(2) > div',35,65);
  add('#results > div:first-child',0,0);
  add('#results > div:nth-child(2) > div',0,100);
  add('#maps-results > div > div:first-child',0,0);
  add('#maps-results > div > div:nth-child(2) > div',60,120);
  add('#about h2, #video h2, #case-studies h2, #faq h2',0,0);
  add('#case-studies > div:last-child > div',70,90);
  add('#free-trial-cta > div:last-child',0,0);

  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('mom-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:0.06, rootMargin:'0px 0px -7% 0px'});
    revealTargets.forEach(function(node) {io.observe(node);});
    body.classList.add('mom-motion-ready');
  } else {
    revealTargets.forEach(function(node){node.classList.add('mom-visible');});
  }

  // Count-up only for existing visible result metrics (never replace stats with new claims).
  var countElements = [];
  var firstResults = document.querySelector('#results > div:first-child');
  if (firstResults && firstResults.children[1]) {
    Array.prototype.forEach.call(firstResults.children[1].children, function(item) {
      if (item.firstElementChild) countElements.push(item.firstElementChild);
    });
  }
  var otherResults = document.querySelector('#results > div:nth-child(2) > div:first-child');
  if (otherResults) {
    Array.prototype.forEach.call(otherResults.children, function(card) {
      if (card.children[1] && card.children[1].firstElementChild) {
        countElements.push(card.children[1].firstElementChild);
      }
    });
  }
  var countJobs = [];
  countElements.forEach(function(el) {
    var original = el.textContent.trim();
    var match = /^([+]?)(\d[\d,]*(?:\.\d+)?)(%|\s+Days)?$/.exec(original);
    if (!match) return;
    var number = Number(match[2].replace(/,/g,''));
    if (!Number.isFinite(number)) return;
    var decimals = (match[2].split('.')[1] || '').length;
    el.setAttribute('data-mom-count','');
    countJobs.push({node:el, original:original, number:number, decimals:decimals, prefix:match[1], suffix:match[3] || '', done:false});
  });
  function runCounter(job) {
    if (job.done) return;
    job.done = true;
    if (reduce) { job.node.textContent = job.original; return; }
    var duration = 1150;
    var start;
    function tick(now) {
      if (!job.node.isConnected) return;
      if (start === undefined) start = now;
      var x = Math.min(1,(now-start)/duration);
      var ease = 1-Math.pow(1-x,3);
      var shown = (job.number * ease).toLocaleString('en-US', {
        minimumFractionDigits:job.decimals, maximumFractionDigits:job.decimals
      });
      job.node.textContent = job.prefix + shown + job.suffix;
      if (x < 1) requestAnimationFrame(tick);
      else job.node.textContent = job.original;
    }
    requestAnimationFrame(tick);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var counterIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var job = countJobs.find(function(j){return j.node === entry.target;});
        if (job) runCounter(job);
        counterIo.unobserve(entry.target);
      });
    }, {threshold:0.5, rootMargin:'0px 0px -5% 0px'});
    countJobs.forEach(function(job){counterIo.observe(job.node);});
  } else {
    countJobs.forEach(function(job){job.node.textContent=job.original;});
  }
})();
