const colors={cyan:'#00F0FF',orange:'#FFA85C',violet:'#B6A0FF'};
const skins={light:'#f1c9a5',medium:'#b77e58',dark:'#674530'};
const titles={supply:'Baliza de suministros',bridge:'Pasarela',coolant:'Refrigeración',relay:'Antena de pulsos',drone:'Muelle de drones',hangar:'Hangar'};
const marks={supply:'▣',bridge:'═',coolant:'◈',relay:'⌁',drone:'◇',hangar:'⬡'};
function astronaut(ctx,x,y,size,a) {
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
  <div id="game-screen" hidden><div class="game-layout"><div class="map-column"><div class="game-hud"><span id="position"></span><span id="inventory"></span><button class="game-button" id="edit-avatar">Cambiar traje</button></div><canvas id="station-map" width="780" height="540" tabindex="0" aria-label="Mapa de la estación. Usa las flechas o WASD para moverte y E para interactuar."></canvas><div class="movement"><div class="dpad" aria-label="Movimiento"><button data-dir="0,1" aria-label="Mover arriba">↑</button><button data-dir="-1,0" aria-label="Mover izquierda">←</button><button data-dir="0,-1" aria-label="Mover abajo">↓</button><button data-dir="1,0" aria-label="Mover derecha">→</button></div><button id="interact" class="primary">Explorar</button></div><p class="map-help">Toca el suelo para caminar · Flechas / WASD · E para interactuar</p></div><aside class="station-panel"><div id="object-panel"></div><div class="ship-log"><span class="eyebrow">SISTEMAS DE LA ESTACIÓN</span><ul id="objectives"></ul></div></aside></div></div>`;
  document.body.append(root);
  const $=id=>root.querySelector(`#${id}`);
  let data=null,loading=false,active=null,visible=false,hold=null;
  const map=$('station-map'),ctx=map.getContext('2d');
  const avatar=()=>Object.fromEntries(new FormData($('avatar-form')));
  const note=text=>{$('sector-message').textContent=text;};
  function preview(){const c=$('avatar-preview').getContext('2d');c.clearRect(0,0,260,280);c.strokeStyle='#00f0ff44';c.beginPath();c.ellipse(130,233,90,24,0,0,Math.PI*2);c.stroke();astronaut(c,130,143,125,avatar());}
  function done(key){const s=data.state;return {supply:s.battery,bridge:s.bridge===3,coolant:s.coolant,relay:s.relay,drone:s.drone==='done',hangar:s.complete}[key];}
  function draw(){
    if(!data?.state)return;
    const s=data.state;ctx.fillStyle='#0b0f19';ctx.fillRect(0,0,780,540);
    for(let row=0;row<9;row++)for(let col=0;col<13;col++){
      const x=col*60,y=row*60;ctx.fillStyle=(row+col)%2?'#152337':'#17273c';ctx.fillRect(x+2,y+2,56,56);
      ctx.strokeStyle='#23364d';ctx.strokeRect(x+2,y+2,56,56);
      if(col===6||row===4){ctx.fillStyle='#00f0ff15';ctx.fillRect(x+3,y+3,54,54);}
      ctx.fillStyle='#62758e';ctx.font='10px monospace';if(col===6)ctx.fillText(String(4-row),x+4,y+13);if(row===4)ctx.fillText(String(col-6),x+44,y+53);
    }
    for(const [key,p] of Object.entries(data.sites)){
      const x=(p.x+6)*60+30,y=(4-p.y)*60+30;
      ctx.fillStyle=done(key)?'#10b981':'#314965';ctx.fillRect(x-22,y-22,44,44);ctx.strokeStyle=done(key)?'#6fffd0':'#00f0ff';ctx.lineWidth=2;ctx.strokeRect(x-22,y-22,44,44);
      ctx.fillStyle='#f8fafc';ctx.font='25px sans-serif';ctx.textAlign='center';ctx.fillText(marks[key],x,y+8);ctx.font='9px sans-serif';ctx.fillText(key==='supply'?'BALIZA':key==='coolant'?'AGUA':key==='relay'?'ANTENA':key==='bridge'?'PASARELA':key==='drone'?'DRON':'HANGAR',x,y-27);ctx.textAlign='start';
      if(key==='bridge'&&!done(key)){ctx.fillStyle='#ffa85c';for(let i=0;i<s.bridge;i++)ctx.fillRect(x-18+i*13,y+14,10,5);}
    }
    if(s.drone!=='waiting'){const x=s.drone==='done'?210:270;ctx.fillStyle='#b6a0ff';ctx.fillRect(x,95,20,12);ctx.fillStyle='#fff';ctx.fillRect(x+7,98,6,4);}
    astronaut(ctx,(s.x+6)*60+30,(4-s.y)*60+31,32,data.avatar);
    if(s.complete){ctx.fillStyle='#10b98122';ctx.fillRect(0,0,780,540);}
  }
  function nearest(){return Object.keys(data.sites).filter(k=>Math.abs(data.state.x-data.sites[k].x)+Math.abs(data.state.y-data.sites[k].y)<=1).sort((a,b)=>{const p=data.sites[a],q=data.sites[b],s=data.state;return Math.abs(s.x-p.x)+Math.abs(s.y-p.y)-Math.abs(s.x-q.x)-Math.abs(s.y-q.y);})[0];}
  const actionButton=(type,label,extra='')=>`<button class="game-button" data-action="${type}" ${extra}>${label}</button>`;
  function panel(){
    const s=data.state,k=active;
    if(!k){$('object-panel').innerHTML='<span class="eyebrow">UNA SEÑAL DÉBIL…</span><h2>La estación te necesita.</h2><p>La baliza marca suministros en <strong>(−3, +2)</strong>. En el suelo, el centro es (0, 0): los números crecen hacia la derecha y hacia arriba.</p><p>Camina hasta un mecanismo y toca «Explorar». Puedes restaurarlos en el orden que quieras.</p>';return;}
    let body='';
    if(k==='supply')body=`<p>Una batería y piezas de repuesto esperan en esta baliza.</p>${actionButton('supply',s.battery?'Suministros recuperados ✓':'Recoger suministros')}`;
    if(k==='bridge')body=`<p>El hueco necesita 3 piezas. Cada tramo usa una; si lo desmontas, la recuperas.</p><div class="bridge-slots">${Array.from({length:3},(_,i)=>`<span>${i<s.bridge?'▰':'▱'}</span>`).join('')}</div><p>${s.bridge}/3 colocadas · ${s.metal} en la mochila</p>${actionButton('build','Colocar una pieza')}${actionButton('remove','Recuperar una pieza')}`;
    if(k==='coolant')body=`<p>Reparte los 12 depósitos: el reactor necesita <strong>la mitad</strong>; el escudo y la antena, <strong>un cuarto cada uno</strong>. Cierra una válvula para devolver agua a la reserva.</p><p>Reserva: <strong>${12-s.flows.reduce((a,b)=>a+b,0)}</strong> / 12</p>${['Reactor · ½','Escudo · ¼','Antena · ¼'].map((name,i)=>`<div class="valve"><span>${name}</span><div><button class="game-button" data-action="flow" data-index="${i}" data-delta="-1" aria-label="Cerrar válvula ${name}">−</button><strong>${s.flows[i]}</strong><button class="game-button" data-action="flow" data-index="${i}" data-delta="1" aria-label="Abrir válvula ${name}">+</button></div><meter min="0" max="12" value="${s.flows[i]}" aria-label="Agua en ${name}"></meter></div>`).join('')}${s.coolant?'<p class="restored">Flujo estable ✓</p>':''}`;
    if(k==='relay')body=`<p>Las luces siguen un ritmo. Cada grupo tiene dos destellos más que el anterior. Ajusta el siguiente y deja que la antena lo transmita.</p><div class="pulse-trail"><span>••<b>2</b></span><span>••••<b>4</b></span><span>••••••<b>6</b></span><span>${'•'.repeat(s.pulse)}<b>${s.pulse}</b></span></div><div class="pulse-controls">${actionButton('pulse','−','data-delta="-1"')}${actionButton('pulse','+','data-delta="1"')}</div>${actionButton('transmit','Transmitir pulso')}${s.relay?'<p class="restored">Señal enlazada ✓</p>':''}`;
    if(k==='drone')body=`<p>Una celda está al otro lado del muelle. Guía al dron con tres gestos: ir → recoger → volver.</p><div class="drone-route">${{waiting:'◇ ····· ▣',arrived:'····· ◇▣',loaded:'····· ◆',done:'◆ ····· ✓'}[s.drone]}</div><p>${{waiting:'El dron espera en el muelle.',arrived:'Llegó junto a la celda.',loaded:'Lleva la celda. Hazlo volver.',done:'La celda ya está en el hangar.'}[s.drone]}</p>${actionButton('drone','Ir →','data-step="go"')}${actionButton('drone','Recoger ◇','data-step="collect"')}${actionButton('drone','← Volver','data-step="return"')}`;
    if(k==='hangar')body=`<p>${s.complete?'La estación vuelve a estar viva. Explora tu refugio; el siguiente sector llegará en otra transmisión.':'El hangar se abrirá cuando recuperes la batería y restaures los cuatro sistemas. Las luces de abajo te indican qué falta.'}</p>${actionButton('open',s.complete?'Sector restaurado ✓':'Abrir hangar')}`;
    $('object-panel').innerHTML=`<span class="eyebrow">${done(k)?'SISTEMA RESTAURADO':'MECANISMO CERCANO'}</span><h2>${titles[k]}</h2>${body}`;
  }
  function render(){const s=data.state;$('position').textContent=`⌖ (${s.x}, ${s.y})`;$('inventory').textContent=`▣ ${s.metal} piezas`;$('objectives').innerHTML=Object.keys(titles).map(k=>`<li class="${done(k)?'restored':''}">${done(k)?'✓':'○'} ${titles[k]}</li>`).join('');$('interact').textContent=nearest()?`Explorar ${titles[nearest()]}`:'Explorar';draw();panel();}
  async function command(body){
    if(loading||!visible||$('game-screen').hidden)return;
    loading=true;root.setAttribute('aria-busy','true');
    try {data=await request('/sector/action',{...body,version:data.version});note(data.message||'Avance guardado');if(active&&Math.abs(data.state.x-data.sites[active].x)+Math.abs(data.state.y-data.sites[active].y)>1)active=null;render();}
    catch(error){note(error.status===409?error.message:'No pudimos guardar tu movimiento. Comprueba la conexión y vuelve a intentarlo.');try{const saved=await request('/sector');if(saved.avatar){data=saved;active=null;render();}}catch{} }
    finally{loading=false;root.removeAttribute('aria-busy');}
  }
  function explore(){if(!data?.state)return;active=nearest()||null;panel();if(!active)note('Acércate a un mecanismo iluminado. La baliza está en (−3, +2).');}
  root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;command({type:b.dataset.action,...(b.dataset.index!==undefined?{index:Number(b.dataset.index)}:{}),...(b.dataset.delta?{delta:Number(b.dataset.delta)}:{}),...(b.dataset.step?{step:b.dataset.step}:{})});});
  $('interact').onclick=explore;
  $('avatar-form').onchange=preview;
  $('avatar-form').onsubmit=async e=>{e.preventDefault();if(loading)return;loading=true;$('launch').disabled=true;try{data=await request('/sector/avatar',avatar());$('avatar-screen').hidden=true;$('game-screen').hidden=false;active=null;note(data.state.complete?'Tu refugio te esperaba.':'Baliza detectada en (−3, +2). Encuentra los suministros.');render();}catch{note('No pudimos guardar tu traje. Vuelve a intentarlo.');}finally{loading=false;$('launch').disabled=false;}};
  $('edit-avatar').onclick=()=>{$('game-screen').hidden=true;$('avatar-screen').hidden=false;preview();};
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
  document.addEventListener('keydown',e=>{if(!visible||$('game-screen').hidden||e.target.matches('input,button,select,textarea'))return;const dirs={ArrowUp:[0,1],w:[0,1],ArrowDown:[0,-1],s:[0,-1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};if(dirs[e.key]){e.preventDefault();++pathGeneration;const [dx,dy]=dirs[e.key];command({type:'move',dx,dy});}if(e.key.toLowerCase()==='e'){e.preventDefault();explore();}});
  window.addEventListener('blur',()=>{stopHold();++pathGeneration;});
  function close(){visible=false;++pathGeneration;stopHold();root.hidden=true;document.body.classList.remove('playing');}
  $('sector-exit').onclick=close;
  return {close,async open(){if(loading)return;visible=true;root.hidden=false;document.body.classList.add('playing');$('avatar-screen').hidden=true;$('game-screen').hidden=true;note('Conectando con la estación…');try{data=await request('/sector');if(!visible)return;if(data.avatar){for(const [key,value]of Object.entries(data.avatar)){const input=root.querySelector(`input[name="${key}"][value="${value}"]`);if(input)input.checked=true;}$('game-screen').hidden=false;active=null;render();note('Tu avance está listo. Explora la estación.');}else{$('avatar-screen').hidden=false;preview();note('Elige tu equipo para la expedición.');}}catch{note('No pudimos conectar. Vuelve al refugio e inténtalo de nuevo.');}}};
}

