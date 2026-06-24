
(function(){
  'use strict';

  /* — Nav toggle — */
  var btn=document.querySelector('[data-nav-toggle]');
  var nav=document.querySelector('[data-nav]');
  if(btn&&nav){btn.addEventListener('click',function(){nav.classList.toggle('is-open');});}

  /* — Scroll progress bar — */
  var progressBar=document.getElementById('scroll-progress');
  if(progressBar){
    window.addEventListener('scroll',function(){
      var max=document.body.scrollHeight-window.innerHeight;
      if(max>0)progressBar.style.width=(window.scrollY/max*100)+'%';
    },{passive:true});
  }

  /* — Header scrolled state — */
  var header=document.querySelector('[data-header]');
  if(header){
    window.addEventListener('scroll',function(){
      header.classList.toggle('scrolled',window.scrollY>80);
    },{passive:true});
  }

  /* — Safe counter animation — */
  function parseCounter(text){
    var m=text.match(/(\d+\.?\d*)/);
    if(!m)return null;
    var numStr=m[1];
    var idx=text.indexOf(numStr);
    return{
      prefix:text.slice(0,idx),
      num:parseFloat(numStr),
      suffix:text.slice(idx+numStr.length),
      decimals:numStr.indexOf('.')>=0?numStr.split('.')[1].length:0,
      original:text
    };
  }
  function easeOutQuart(t){return 1-Math.pow(1-t,4);}
  function animateCounter(el){
    var parsed=parseCounter(el.dataset.final||el.textContent);
    if(!parsed)return;
    var startTime=null;
    var duration=1700;
    function step(ts){
      if(!startTime)startTime=ts;
      var p=Math.min((ts-startTime)/duration,1);
      var val=parsed.num*easeOutQuart(p);
      el.textContent=parsed.prefix+val.toFixed(parsed.decimals)+parsed.suffix;
      if(p<1)requestAnimationFrame(step);
      else el.textContent=parsed.original;
    }
    requestAnimationFrame(step);
  }

  /* — Stagger direct card/step/metric children — */
  function staggerChildren(parent){
    var kids=parent.querySelectorAll(':scope>.card,:scope>.step,:scope>.metric-card');
    kids.forEach(function(child,i){child.style.transitionDelay=(i*0.08)+'s';});
  }

  /* — Store counter final values — */
  document.querySelectorAll('[data-counter]').forEach(function(el){
    el.dataset.final=el.textContent;
  });

  /* — IntersectionObserver: reveals + counters — */
  var supportsIO='IntersectionObserver' in window;
  var countersDone=typeof WeakSet!=='undefined'?new WeakSet():{has:function(){return false;},add:function(){}};

  var io=supportsIO?new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      staggerChildren(e.target);
      e.target.classList.add('is-visible');
      e.target.querySelectorAll('[data-counter]').forEach(function(el){
        if(!countersDone.has(el)){countersDone.add(el);animateCounter(el);}
      });
      io.unobserve(e.target);
    });
  },{threshold:0.12}):null;

  document.querySelectorAll('[data-reveal]').forEach(function(el){
    if(io)io.observe(el);
    else{staggerChildren(el);el.classList.add('is-visible');}
  });

})();
