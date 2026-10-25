import {drawStation} from './station-scene.js';
const colors={cyan:'#00F0FF',orange:'#FFA85C',violet:'#B6A0FF'};
const skins={light:'#f1c9a5',medium:'#b77e58',dark:'#674530'};
const titles={supply:'Baliza de suministros',bridge:'Pasarela',coolant:'Refrigeración',relay:'Antena de pulsos',drone:'Muelle de drones',hangar:'Hangar'};
const marks={supply:'▣',bridge:'═',coolant:'◈',relay:'⌁',drone:'◇',hangar:'⬡'};
export function astronaut(ctx,x,y,size,a) {
  ctx.save();ctx.translate(x,y);ctx.scale(size/40,size/40);
  ctx.fillStyle='#0007';ctx.beginPath();ctx.ellipse(0,18,17,5,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=colors[a.suit];ctx.fillRect(-12,0,24,22);ctx.fillRect(-17,2,5,13);ctx.fillRect(12,2,5,13);
  ctx.fillStyle='#334861';ctx.fillRect(-11,20,8,8);ctx.fillRect(3,20,8,8);
  ctx.fillStyle='#d9edf2';ctx.beginPath();ctx.roundRect(-16,-25,32,30,a.helmet==='round'?14:4);ctx.fill();
  ctx.fillStyle=skins[a.skin];ctx.beginPath();ctx.roundRect(-11,-19,22,17,7);ctx.fill();
  ctx.fillStyle='#092639';ctx.fillRect(-10,-17,20,9);ctx.fillStyle='#00f0ff';ctx.fillRect(-7,-16,8,2);
  ctx.fillStyle='#e6f5ff';ctx.fillRect(-5,4,10,6);ctx.restore();
}
export function createSector(request) {
  const root=document.createElement('section');root.id='sector';root.hidden=true;
  root.innerHTML=`<div class="sector-top"><span>SECTOR 01 <b>La estación despierta</b></span><button id="sector-exit" class="game-button">Volver al refugio</button></div>
  <p id="sector-message" role="status" aria-live="polite"></p>
  <div id="avatar-screen"><div class="avatar-stage"><span class="eyebrow">TU PRÓXIMA EXPEDICIÓN</span><h2>Encuentra tu estilo.</h2><canvas id="avatar-preview" width="260" height="280" aria-label="Vista previa de tu avatar"></canvas><p>Tu traje, tu señal. Puedes cambiarlo después.</p></div>
  <form id="avatar-form"><h3>Listo para explorar.</h3><fieldset><legend>Traje</legend><label><input type="radio" name="suit" value="cyan" checked> Azul ciber</label><label><input type="radio" name="suit" value="orange"> Ámbar solar</label><label><input type="radio" name="suit" value="violet"> Violeta orbital</label></fieldset><fieldset><legend>Casco</legend><label><input type="radio" name="helmet" value="round" checked> Explorador</label><label><input type="radio" name="helmet" value="square"> Constructor</label></fieldset><fieldset><legend>Tono de piel</legend><label><input type="radio" name="skin" value="light" checked> Claro</label><label><input type="radio" name="skin" value="medium"> Medio</label><label><input type="radio" name="skin" value="dark"> Oscuro</label></fieldset><button class="primary" id="launch" type="submit">Entrar a la estación ↗</button></form></div>
  <div id="game-screen" hidden><div class="station-beacon"><div><span class="eyebrow">TRANSMISIÓN DE LA ESTACIÓN</span><strong id="beacon-task"></strong></div><span id="station-progress"></span></div><div class="game-layout"><div class="map-column"><div class="game-hud"><span id="position"></span><span id="inventory"></span><span id="save-signal" role="status">Señal a salvo</span><button class="game-button" id="edit-avatar">Cambiar traje</button></div><canvas id="station-map" width="780" height="540" tabindex="0" aria-label="Mapa de la estación. Usa las flechas o WASD para moverte y E para interactuar."></canvas><div class="movement"><div class="dpad" aria-label="Movimiento"><button data-dir="0,1" aria-label="Mover arriba">↑</button><button data-dir="-1,0" aria-label="Mover izquierda">←</button><button data-dir="0,-1" aria-label="Mover abajo">↓</button><button data-dir="1,0" aria-label="Mover derecha">→</button></div><button id="interact" class="primary">Explorar</button></div><p class="map-help">Toca un destino para caminar · Flechas / WASD · E para explorar</p><div id="arrival-guide"><span>Tu señal aparece en el centro. Toca el suelo o usa las flechas para dar tus primeros pasos.</span><button type="button" class="game-button" id="dismiss-guide">Entendido</button></div></div><aside class="station-panel"><div id="object-panel"></div><div class="ship-log"><span class="eyebrow">SISTEMAS DE LA ESTACIÓN</span><ul id="objectives"></ul></div></aside></div></div>`;
  document.body.append(root);
  const $=id=>root.querySelector(`#${id}`);
  let data=null,loading=false,active=null,visible=false,hold=null,marked=null,helpOpen=null,guideDismissed=false,frame=0,lastPaint=0,motion=null;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const map=$('station-map'),ctx=map.getContext('2d');
  const avatar=()=>Object.fromEntries(new FormData($('avatar-form')));
  const note=text=>{$('sector-message').textContent=text;};
  function preview(){const c=$('avatar-preview').getContext('2d');c.clearRect(0,0,260,280);c.strokeStyle='#00f0ff44';c.beginPath();c.ellipse(130,233,90,24,0,0,Math.PI*2);c.stroke();astronaut(c,130,143,125,avatar());}
  function done(key){const s=data.state;return {supply:s.battery,bridge:s.bridge===3,coolant:s.coolant,relay:s.relay,drone:s.drone==='done',hangar:s.complete}[key];}
  function draw(time=performance.now()){
    if(!data?.state)return;
    let position=null;if(motion&&!reduced.matches){const f=Math.min(1,(time-motion.start)/125);position={x:motion.x+(data.state.x-motion.x)*f,y:motion.y+(data.state.y-motion.y)*f};if(f===1)motion=null;}
    drawStation(ctx,data,astronaut,{time,marked,position,reduced:reduced.matches});
  }
  function animate(time){if(!visible||$('game-screen').hidden){frame=0;return;}if(!document.hidden&&time-lastPaint>=32){draw(time);lastPaint=time;}frame=requestAnimationFrame(animate);}
  function startScene(){if(!frame)frame=requestAnimationFrame(animate);}
  const nextTarget=()=>Object.keys(titles).find(key=>!done(key));
  const tasks={supply:'Recupera la batería de la baliza.',bridge:'Cierra el hueco de la pasarela.',coolant:'Devuelve el agua a los sistemas.',relay:'Encuentra el pulso de la antena.',drone:'Trae la celda con tu dron.',hangar:'Todo está listo. Abre el hangar.'};
  function nearest(){return Object.keys(data.sites).filter(k=>Math.abs(data.state.x-data.sites[k].x)+Math.abs(data.state.y-data.sites[k].y)<=1).sort((a,b)=>{const p=data.sites[a],q=data.sites[b],s=data.state;return Math.abs(s.x-p.x)+Math.abs(s.y-p.y)-Math.abs(s.x-q.x)-Math.abs(s.y-q.y);})[0];}
  const actionButton=(type,label,extra='')=>`<button class="game-button" data-action="${type}" ${extra}>${label}</button>`;
  function panel(){
    const focus=document.activeElement?.closest('[data-action]'),focused=focus?{...focus.dataset}:null;
    const s=data.state,k=active,c=data.challenge||{coolantTotal:12,pulseTrail:[2,4,6]};
    if(!k){const target=nextTarget();$('object-panel').innerHTML=s.complete?'<span class="eyebrow">SEÑAL RECUPERADA</span><h2>Lo lograste, tripulante.</h2><p>Los sistemas vuelven a iluminar la estación. El puesto exterior espera al otro lado del hangar.</p><button class="primary" type="button" data-next-sector>Viajar al Sector 02 ↗</button>':'<span class="eyebrow">UNA ESTACIÓN A OSCURAS</span><h2>Tu señal hace falta.</h2><p>'+tasks[target]+' Puedes explorar los otros sistemas cuando quieras.</p><p>Marca un sistema en la lista para localizarlo en el mapa. Al acercarte, toca «Explorar».</p>';return;}    let body='';
    if(k==='supply')body=`<p>Una batería y piezas de repuesto esperan en esta baliza.</p>${actionButton('supply',s.battery?'Suministros recuperados ✓':'Recoger suministros')}`;
    if(k==='bridge')body=`<p>El hueco necesita 3 piezas. Cada tramo usa una; si lo desmontas, la recuperas.</p><div class="bridge-slots">${Array.from({length:3},(_,i)=>`<span>${i<s.bridge?'▰':'▱'}</span>`).join('')}</div><p>${s.bridge}/3 colocadas · ${s.metal} en la mochila</p>${actionButton('build','Colocar una pieza')}${actionButton('remove','Recuperar una pieza')}`;
    if(k==='coolant')body=`<p>Reparte los ${c.coolantTotal} depósitos: el reactor necesita <strong>la mitad</strong>; el escudo y la antena, <strong>un cuarto cada uno</strong>. Cierra una válvula para devolver agua a la reserva.</p><p>Reserva: <strong>${c.coolantTotal-s.flows.reduce((a,b)=>a+b,0)}</strong> / ${c.coolantTotal}</p>${['Reactor · ½','Escudo · ¼','Antena · ¼'].map((name,i)=>`<div class="valve"><span>${name}</span><div><button class="game-button" data-action="flow" data-index="${i}" data-delta="-1" aria-label="Cerrar válvula ${name}">−</button><strong>${s.flows[i]}</strong><button class="game-button" data-action="flow" data-index="${i}" data-delta="1" aria-label="Abrir válvula ${name}">+</button></div><meter min="0" max="${c.coolantTotal}" value="${s.flows[i]}" aria-label="Agua en ${name}"></meter></div>`).join('')}${s.coolant?'<p class="restored">Flujo estable ✓</p>':''}`;
    if(k==='relay')body=`<p>Las luces siguen un ritmo. Cada grupo tiene ${c.pulseTrail[1]-c.pulseTrail[0]} destellos más que el anterior. Ajusta el siguiente y deja que la antena lo transmita.</p><div class="pulse-trail">${c.pulseTrail.map(value=>`<span>${'•'.repeat(value)}<b>${value}</b></span>`).join('')}<span>${'•'.repeat(s.pulse)}<b>${s.pulse}</b></span></div><div class="pulse-controls">${actionButton('pulse','−','data-delta="-1"')}${actionButton('pulse','+','data-delta="1"')}</div>${actionButton('transmit','Transmitir pulso')}${s.relay?'<p class="restored">Señal enlazada ✓</p>':''}`;
    if(k==='drone')body=`<p>Una celda está al otro lado del muelle. Guía al dron con tres gestos: ir → recoger → volver.</p><div class="drone-route" aria-label="Estado del recorrido del dron">${{waiting:'◇ ····· ▣',arrived:'····· ◇▣',loaded:'····· ◆',done:'◆ ····· ✓'}[s.drone]}</div><p>${{waiting:'El dron espera en el muelle.',arrived:'Llegó junto a la celda.',loaded:'Lleva la celda. Hazlo volver.',done:'La celda ya está en el hangar.'}[s.drone]}</p>${actionButton('drone','Ir →','data-step="go"'+(s.drone!=='waiting'?' disabled':''))}${actionButton('drone','Recoger ◇','data-step="collect"'+(s.drone!=='arrived'?' disabled':''))}${actionButton('drone','← Volver','data-step="return"'+(s.drone!=='loaded'?' disabled':''))}`;
    if(k==='hangar')body=`<p>${s.complete?'La estación vuelve a estar viva. Explora tu refugio; el puesto exterior te espera. Vuelve al refugio para abrir el Sector 02.':'El hangar se abrirá cuando recuperes la batería y restaures los cuatro sistemas. Las luces de abajo te indican qué falta.'}</p>${s.complete?'<button class="primary" type="button" data-next-sector>Viajar al Sector 02 ↗</button>':actionButton('open','Abrir hangar')}`;
    $('object-panel').innerHTML=`<span class="eyebrow">${done(k)?'SISTEMA RESTAURADO':'MECANISMO CERCANO'}</span><h2>${titles[k]}</h2>${body}${!done(k)?'<button class="game-button station-assist" type="button" data-assist>Ver señal de ayuda ◇</button>':''}${helpOpen===k?helpScene(k):''}`;
    if(focused){const match=[...$('object-panel').querySelectorAll('[data-action]')].find(b=>['action','index','delta','step'].every(key=>b.dataset[key]===focused[key]));match?.focus({preventScroll:true});}
  }
  function helpScene(key){const trail=data.challenge?.pulseTrail||[2,4,6];return '<div class="station-demo demo-'+key+'"><span class="eyebrow">LA BALIZA PROYECTA UNA SEÑAL</span>'+({supply:'<div class="demo-motion">⌖ ··· ▣</div><p>Acércate a la caja iluminada y recoge la batería.</p>',bridge:'<div class="demo-motion">▣ → ▱ ▱ ▱</div><p>Coloca una pieza por tramo. Recuperarla devuelve el material a tu mochila.</p>',coolant:'<div class="water-model"><span>½</span><span>¼</span><span>¼</span></div><p>La reserva representa el depósito completo. Sus tres circuitos deben compartirlo sin perder agua.</p>',relay:'<div class="demo-motion">'+trail.map(n=>'•'.repeat(n)).join(' · ')+'</div><p>Observa cuánto crece cada grupo antes de transmitir el siguiente.</p>',drone:'<div class="demo-motion">◇ → ▣ → ◆</div><p>Primero señala el destino. Al llegar, recoge la celda. Después vuelve al muelle.</p>',hangar:'<div class="demo-motion">▣ ═ ◈ ⌁ ◇ → ⬡</div><p>Las luces verdes indican sistemas restaurados. El hangar espera todas sus señales.</p>'}[key])+'</div>';}
  function render(){const s=data.state;if(!marked||done(marked))marked=nextTarget()||null;$('position').textContent=`⌖ (${s.x}, ${s.y})`;$('inventory').textContent=`▣ ${s.metal} piezas`;
    $('beacon-task').textContent=s.complete?'La estación respira. El enlace exterior te espera.':tasks[marked||nextTarget()];
    $('station-progress').textContent=`${Object.keys(titles).filter(done).length} / 6 sistemas`;
    $('arrival-guide').hidden=guideDismissed||s.x!==0||s.y!==0||Object.keys(titles).some(done);
    $('objectives').innerHTML=Object.keys(titles).map(k=>`<li><button type="button" data-mark="${k}" aria-pressed="${marked===k}" class="${done(k)?'restored':''}"><span>${done(k)?'✓':'○'} ${titles[k]}</span><span>${marked===k?'⌖':'↗'}</span></button></li>`).join('');
    $('interact').textContent=nearest()?`Explorar ${titles[nearest()]}`:'Explorar';draw();panel();startScene();}
  async function command(body){
    if(loading||!visible||$('game-screen').hidden)return;
    loading=true;$('save-signal').textContent='Guardando…';root.setAttribute('aria-busy','true');
    try {const previous=data.state;const saved=await request('/sector/action',{...body,version:data.version});if(!visible)return;data=saved;if(previous.x!==data.state.x||previous.y!==data.state.y)motion={x:previous.x,y:previous.y,start:performance.now()};if(data.message)note(data.message);$('save-signal').textContent='Señal a salvo';if(active&&Math.abs(data.state.x-data.sites[active].x)+Math.abs(data.state.y-data.sites[active].y)>1)active=null;render();}
    catch(error){$('save-signal').textContent='Recuperando señal…';note(error.status===409?error.message:'No pudimos guardar tu movimiento. Comprueba la conexión y vuelve a intentarlo.');try{const saved=await request('/sector');if(saved.avatar&&visible){data=saved;active=null;$('save-signal').textContent='Señal recuperada';render();}}catch{} }
    finally{loading=false;root.removeAttribute('aria-busy');}
  }
  function explore(){if(!data?.state)return;active=nearest()||null;panel();if(!active)note('Acércate a un mecanismo iluminado. La baliza está en (−3, +2).');}
  root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;command({type:b.dataset.action,...(b.dataset.index!==undefined?{index:Number(b.dataset.index)}:{}),...(b.dataset.delta?{delta:Number(b.dataset.delta)}:{}),...(b.dataset.step?{step:b.dataset.step}:{})});});
  $('interact').onclick=()=>{explore();if(active&&matchMedia('(max-width:950px)').matches)$('object-panel').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});};
  $('dismiss-guide').onclick=()=>{guideDismissed=true;$('arrival-guide').hidden=true;};
  root.addEventListener('click',e=>{const mark=e.target.closest('[data-mark]');if(mark){marked=mark.dataset.mark;$('beacon-task').textContent=done(marked)?titles[marked]+' · restaurado':tasks[marked];note(titles[marked]+' marcado en el mapa.');if(Math.abs(data.state.x-data.sites[marked].x)+Math.abs(data.state.y-data.sites[marked].y)<=1){active=marked;panel();}draw();$('objectives').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===mark)));}if(e.target.closest('[data-assist]')&&active&&!loading){helpOpen=active;command({type:'hint',site:active});}if(e.target.closest('[data-next-sector]'))root.dispatchEvent(new CustomEvent('redcero:next-sector',{bubbles:true}));});
  $('avatar-form').onchange=preview;
  $('avatar-form').onsubmit=async e=>{e.preventDefault();if(loading)return;loading=true;$('launch').disabled=true;try{data=await request('/sector/avatar',avatar());$('avatar-screen').hidden=true;$('game-screen').hidden=false;active=null;note(data.state.complete?'Tu refugio te esperaba.':'Baliza detectada en (−3, +2). Encuentra los suministros.');render();}catch{note('No pudimos guardar tu traje. Vuelve a intentarlo.');}finally{loading=false;$('launch').disabled=false;}};
  $('edit-avatar').onclick=()=>{++pathGeneration;stopHold();$('game-screen').hidden=true;$('avatar-screen').hidden=false;preview();};
  let pathGeneration=0;
  map.onclick=async e=>{
    if(loading)return;const r=map.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*13)-6,y=4-Math.floor((e.clientY-r.top)/r.height*9);
    if(x<-6||x>6||y<-4||y>4)return;
    const key=Object.keys(data.sites).find(k=>data.sites[k].x===x&&data.sites[k].y===y);
    if(key&&Math.abs(data.state.x-x)+Math.abs(data.state.y-y)<=1){active=key;panel();return;}
    // Shortest valid route; the server validates every step and saves it.
    const queue=[[data.state.x,data.state.y,[]]],seen=new Set();let route=[];
    for(let i=0;i<queue.length;i++){const [cx,cy,p]=queue[i];if(cx===x&&cy===y){route=p;break;}for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]]){const nx=cx+dx,ny=cy+dy,id=`${nx},${ny}`;if(nx<-6||nx>6||ny<-4||ny>4||seen.has(id)||(nx===-1&&ny===0&&data.state.bridge<3))continue;seen.add(id);queue.push([nx,ny,[...p,[dx,dy]]]);}}
    const generation=++pathGeneration;
    for(const [dx,dy]of route){if(generation!==pathGeneration||!visible||$('game-screen').hidden)break;const before=data.version;await command({type:'move',dx,dy});if(data.version===before)break;await new Promise(resolve=>setTimeout(resolve,95));}
    if(visible&&key&&nearest()===key){active=key;panel();}
  };
  const stopHold=()=>{clearInterval(hold);hold=null;};
  root.querySelectorAll('[data-dir]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();++pathGeneration;stopHold();b.setPointerCapture(e.pointerId);const [dx,dy]=b.dataset.dir.split(',').map(Number);command({type:'move',dx,dy});hold=setInterval(()=>command({type:'move',dx,dy}),180);};b.onpointerup=stopHold;b.onpointercancel=stopHold;b.onlostpointercapture=stopHold;});
  document.addEventListener('keydown',e=>{if(!visible||$('game-screen').hidden||document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,button,select,textarea'))return;const dirs={ArrowUp:[0,1],w:[0,1],ArrowDown:[0,-1],s:[0,-1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};if(dirs[e.key]){e.preventDefault();++pathGeneration;const [dx,dy]=dirs[e.key];command({type:'move',dx,dy});}if(e.key.toLowerCase()==='e'){e.preventDefault();explore();}});
  window.addEventListener('blur',()=>{stopHold();++pathGeneration;});
  function close(){cancelAnimationFrame(frame);frame=0;motion=null;visible=false;++pathGeneration;stopHold();root.hidden=true;document.body.classList.remove('playing');}
  $('sector-exit').onclick=close;
  return {close,async open(){if(loading)return;visible=true;helpOpen=null;marked=null;root.hidden=false;document.body.classList.add('playing');$('avatar-screen').hidden=true;$('game-screen').hidden=true;note('Conectando con la estación…');try{data=await request('/sector');if(!visible)return;if(data.avatar){for(const [key,value]of Object.entries(data.avatar)){const input=root.querySelector(`input[name="${key}"][value="${value}"]`);if(input)input.checked=true;}$('game-screen').hidden=false;active=null;render();note(data.state.complete?'La estación te esperaba. El hangar está abierto.':'Una baliza sigue encendida. Tu avance está guardado.');}else{$('avatar-screen').hidden=false;preview();note('Elige tu equipo para la expedición.');}}catch{note('No pudimos conectar. Vuelve al refugio e inténtalo de nuevo.');}}};
}

