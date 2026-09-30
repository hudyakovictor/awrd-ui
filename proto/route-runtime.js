(()=>{
  const cfg=window.ROUTE_CONFIG;
  const saved=JSON.parse(localStorage.getItem('route:'+cfg.mechanic)||'{}');
  const state={mode:saved.mode||'novice',phase:0,answer:null,started:Date.now()};
  const $=s=>document.querySelector(s);
  const current=()=>cfg.cases.find(x=>x.mode===state.mode)||cfg.cases[0];
  function persist(){localStorage.setItem('route:'+cfg.mechanic,JSON.stringify({mode:state.mode}))}
  function chart(seed,reveal=false){let s=seed,p=100,out='';for(let i=0;i<(reveal?22:15);i++){s=(s*9301+49297)%233280;let o=p,c=p+((s/233280)-.48)*8,h=Math.max(o,c)+2,l=Math.min(o,c)-2,x=18+i*15;p=c;out+=`<line x1="${x}" y1="${70-l/2}" x2="${x}" y2="${70-h/2}" stroke="#8aa7c9"/><rect x="${x-4}" y="${70-Math.max(o,c)/2}" width="8" height="${Math.max(4,Math.abs(o-c)/2)}" fill="${c>=o?'#2ee6c8':'#eb635b'}"/>`}return `<svg viewBox="0 0 360 180" role="img" aria-label="Исторический график"><g transform="translate(0 60)">${out}</g><line x1="242" y1="12" x2="242" y2="168" stroke="#f0a64d" stroke-dasharray="4 5"/></svg>`}
  function decision(){const c=current();return `<div class="tabs" aria-label="Сложность">${cfg.cases.map(x=>`<button class="tab ${x.mode===state.mode?'active':''}" data-mode="${x.mode}">${x.mode}</button>`).join('')}</div><div class="chart">${chart(cfg.seed,false)}</div><div class="card soft"><div class="row"><span>Задача</span><b>${c.decisions} реш. · ${c.sources} ист.</b></div><div class="row"><span>Давление</span><b>${c.pressure}</b></div></div><p class="callout">Будущее скрыто. Выберите действие и уверенность.</p><div class="grid two"><button class="choice" data-a="WAIT">WAIT</button><button class="choice" data-a="NO_TRADE">NO TRADE</button><button class="choice" data-a="ENTER">ENTER</button><button class="choice" data-a="SKIP">ДАННЫХ МАЛО</button></div><label class="card soft"><span class="row"><span>Уверенность</span><b id="confidenceValue">65%</b></span><input id="confidence" type="range" min="50" max="95" value="65"></label>${state.mode==='advanced'?'<textarea id="reason" placeholder="Коротко: факт · риск · инвалидация"></textarea>':''}`}
  function debrief(){return `<div class="chart">${chart(cfg.seed,true)}</div><div class="card good"><div class="label">РАЗБОР ПРОЦЕССА</div><div class="big">${state.answer==='ENTER'?'Результат не спасает слабые улики':'Протокол сохранён'}</div><p>${state.answer==='ENTER'?'Снизьте уверенность и назовите условие отмены до входа.':'Решение выдержало неопределённость. Повтор — в новом контексте.'}</p></div><div class="card"><div class="row"><span>Правило применено</span><b class="delta">да</b></div><div class="row"><span>Повтор</span><b>через 3 дня</b></div></div>`}
  function render(){
    $('#step').textContent=(state.phase+1)+'/2';
    $('#progress').style.setProperty('--p',((state.phase+1)/2*100)+'%');
    $('#app').innerHTML=`<div class="hero"><div class="eyebrow">${cfg.mechanic} · ${state.phase?'РАЗБОР':'РЕШЕНИЕ'}</div><h1>${cfg.name}</h1><p>${state.phase?'Короткая обратная связь без лишнего экрана.':state.mode+' fixture · seed '+cfg.seed}</p></div>${state.phase?debrief():decision()}`;
    document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;state.answer=null;persist();render()});
    document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{state.answer=b.dataset.a;document.querySelectorAll('[data-a]').forEach(x=>x.classList.toggle('selected',x===b));$('#next').disabled=false});
    const range=$('#confidence');if(range)range.oninput=()=>$('#confidenceValue').textContent=range.value+'%';
    $('#next').textContent=state.phase?'Повторить':'Зафиксировать и раскрыть';
    $('#next').disabled=!state.phase&&!state.answer;
  }
  $('#next').onclick=()=>{
    if(!state.phase){const reason=$('#reason');if(state.mode==='advanced'&&(!reason||reason.value.trim().length<18))return toast('Добавьте факт, риск и инвалидацию');const c=current(),ev={correct:state.answer!=='ENTER',latency:Date.now()-state.started,confidence:+$('#confidence').value/100,sources_on_screen:c.sources,decisions_count:c.decisions,slots_used:0,redundant_slots:0,chunk_id:null,context_id:cfg.mechanic+'-'+cfg.seed,rule_applied:true,failure_class:state.answer==='ENTER'?'discipline':'none'};localStorage.setItem('telemetry:'+cfg.mechanic,JSON.stringify(ev));state.phase=1}else{state.phase=0;state.answer=null;state.started=Date.now()}
    render();window.scrollTo({top:0,behavior:'smooth'});
  };
  function toast(x){let e=document.createElement('div');e.className='toast';e.setAttribute('role','status');e.textContent=x;document.body.append(e);setTimeout(()=>e.remove(),1300)}
  render();
})();
