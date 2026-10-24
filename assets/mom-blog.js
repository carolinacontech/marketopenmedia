/* Accessible client-side filter for existing articles. Nothing hidden without user input. */
(function(){
  'use strict';
  var root=document.querySelector('body.mom-blog');
  if(!root)return;
  var buttons=[].slice.call(root.querySelectorAll('.mom-blog-filters button'));
  var search=root.querySelector('#mom-blog-search');
  var cards=[].slice.call(root.querySelectorAll('.grid > .card'));
  var empty=root.querySelector('.mom-blog-empty');
  var current='all';
  function refresh(){
    var q=(search&&search.value||'').trim().toLocaleLowerCase();
    var visible=0;
    cards.forEach(function(card){
      var matchesCategory=current==='all'||card.dataset.topic===current;
      var matchesQuery=!q||card.textContent.toLocaleLowerCase().indexOf(q)!==-1;
      var show=matchesCategory&&matchesQuery;
      card.hidden=!show;
      if(show)visible++;
    });
    if(empty)empty.hidden=visible!==0;
  }
  buttons.forEach(function(btn){
    btn.addEventListener('click',function(){
      current=btn.dataset.topic;
      buttons.forEach(function(b){b.setAttribute('aria-pressed',String(b===btn));});
      refresh();
    });
  });
  if(search)search.addEventListener('input',refresh);
})();
