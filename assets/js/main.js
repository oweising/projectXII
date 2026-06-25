
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

  /* — Animate control-room sparkline on entry — */
  function initSparkline(root){
    var line1=root.querySelector('.cr-line-1');
    var line2=root.querySelector('.cr-line-2');
    var dot1=root.querySelector('.cr-dot-1');
    var dot2=root.querySelector('.cr-dot-2');
    if(line1){line1.classList.add('is-drawn');}
    if(line2){line2.classList.add('is-drawn');}
    if(dot1){setTimeout(function(){dot1.classList.add('is-drawn');},2100);}
    if(dot2){setTimeout(function(){dot2.classList.add('is-drawn');},2500);}
  }

  /* — Pulse metric cards on entry — */
  function pulseMetrics(root){
    root.querySelectorAll('.metric-card').forEach(function(el,i){
      setTimeout(function(){el.classList.add('metric-entered');},i*120);
    });
  }

  /* — IntersectionObserver: reveals + counters + sparklines — */
  var supportsIO='IntersectionObserver' in window;
  var countersDone=typeof WeakSet!=='undefined'?new WeakSet():{has:function(){return false;},add:function(){}};
  var sparkDone=typeof WeakSet!=='undefined'?new WeakSet():{has:function(){return false;},add:function(){}};

  var io=supportsIO?new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting)return;
      staggerChildren(e.target);
      e.target.classList.add('is-visible');
      e.target.querySelectorAll('[data-counter]').forEach(function(el){
        if(!countersDone.has(el)){countersDone.add(el);animateCounter(el);}
      });
      /* Sparkline in control-room */
      if(e.target.classList.contains('control-room')&&!sparkDone.has(e.target)){
        sparkDone.add(e.target);initSparkline(e.target);
      }
      /* Metric card entry pulse */
      if(e.target.classList.contains('proof-strip')){pulseMetrics(e.target);}
      io.unobserve(e.target);
    });
  },{threshold:0.12}):null;

  document.querySelectorAll('[data-reveal]').forEach(function(el){
    if(io)io.observe(el);
    else{staggerChildren(el);el.classList.add('is-visible');initSparkline(el);pulseMetrics(el);}
  });


  /* — v4: Guard helpers — */
  var noMotion=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var hasHover=window.matchMedia('(hover:hover)').matches;

  /* — v4: Cursor spotlight glow — */
  if(!noMotion&&hasHover){
    var glow=document.createElement('div');
    glow.id='cursor-glow';
    document.body.appendChild(glow);
    var gx=window.innerWidth/2,gy=window.innerHeight/2;
    var gtx=gx,gty=gy;
    document.addEventListener('mousemove',function(e){gtx=e.clientX;gty=e.clientY;},{passive:true});
    function lerpG(a,b,t){return a+(b-a)*t;}
    function glowTick(){
      gx=lerpG(gx,gtx,0.1);gy=lerpG(gy,gty,0.1);
      glow.style.left=gx+'px';glow.style.top=gy+'px';
      requestAnimationFrame(glowTick);
    }
    requestAnimationFrame(glowTick);
  }

  /* — v4: Background grid parallax — */
  if(!noMotion&&hasHover){
    var bgGrid=document.querySelector('.bg-grid');
    if(bgGrid){
      var halfW=window.innerWidth/2,halfH=window.innerHeight/2;
      window.addEventListener('resize',function(){halfW=window.innerWidth/2;halfH=window.innerHeight/2;},{passive:true});
      document.addEventListener('mousemove',function(e){
        bgGrid.style.setProperty('--mx',(e.clientX-halfW)+'px');
        bgGrid.style.setProperty('--my',(e.clientY-halfH)+'px');
      },{passive:true});
    }
  }

  /* — v4: KPI card 3D tilt — */
  if(!noMotion&&hasHover){
    document.querySelectorAll('.cr-kpi-strip .cr-kpi').forEach(function(card){
      card.addEventListener('mousemove',function(e){
        var r=card.getBoundingClientRect();
        var x=(e.clientX-r.left)/r.width-.5;
        var y=(e.clientY-r.top)/r.height-.5;
        card.style.setProperty('--ry',(x*8)+'deg');
        card.style.setProperty('--rx',(-y*6)+'deg');
      },{passive:true});
      card.addEventListener('mouseleave',function(){
        card.style.setProperty('--ry','0deg');
        card.style.setProperty('--rx','0deg');
      });
    });
  }

})();
