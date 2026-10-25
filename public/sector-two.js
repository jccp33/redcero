import {astronaut} from './sector.js';
const names={route:'Ruta solar',workshop:'Taller de rescate',water:'Depósitos de enlace',shelter:'Refugio exterior',gate:'Torre de enlace'};
const icons={route:'⌁',workshop:'⚒',water:'◈',shelter:'⌂',gate:'⌘'};
export function createSectorTwo(request){
  const root=document.createElement('section');root.id='sector-two';root.hidden=true;
  root.innerHTML=`<div class="sector-top"><span>SECTOR 02 <b>Reconstrucción del enlace</b></span><button class="game-button" data-exit>Volver al refugio</button></div><p class="transmission" role="status" aria-live="polite"></p><div class="game-layout"><div class="map-column"><div class="game-hud"><span data-location></span><span data-charge>ENLACE SIN SEÑAL</span></div><canvas width="780" height="540" tabindex="0" aria-label="Puesto de enlace. Toca una zona para acercarte. Usa flechas o WASD para caminar y E para explorar."></canvas><div class="movement"><div class="dpad"><button data-step="0,1" aria-label="Mover arriba">↑</button><button data-step="-1,0" aria-label="Mover izquierda">←</button><button data-step="0,-1" aria-label="Mover abajo">↓</button><button data-step="1,0" aria-label="Mover derecha">→</button></div><button class="primary" data-explore>Explorar</button></div><p class="map-help">Toca una zona para caminar · Flechas / WASD · E para explorar</p></div><aside class="station-panel"><div data-mechanism></div><div class="ship-log"><span class="eyebrow">CONEXIONES DEL PUESTO</span><ul data-log></ul></div></aside></div>`;
  document.body.append(root);
  const $=selector=>root.querySelector(selector),canvas=$('canvas'),ctx=canvas.getContext('2d');
  let data=null,visible=false,busy=false,active=null,frame=0,path=0,hold=null;
  const note=text=>{$('.transmission').textContent=text;};
  const at=key=>data&&Math.abs(data.state.x-data.sites[key].x)+Math.abs(data.state.y-data.sites[key].y)<=1;
  const nearest=()=>data&&Object.keys(data.sites).find(at);
  const dial=(field,label,value,unit='')=>`<div class="link-dial"><span>${label}</span><div><button class="game-button" data-field="${field}" data-delta="-1" aria-label="Reducir ${label}">−</button><strong>${value} ${unit}</strong><button class="game-button" data-field="${field}" data-delta="1" aria-label="Aumentar ${label}">+</button></div></div>`;
  function panel(){
    const focus=document.activeElement?.dataset,field=focus?.field,delta=focus?.delta;
    if(!active){$('[data-mechanism]').innerHTML='<span class="eyebrow">TRANSMISIÓN RECUPERADA</span><h2>Una estación al otro lado.</h2><p>La tormenta cortó el enlace con el siguiente refugio. Recorre el puesto y restablece sus cuatro sistemas. Cada uno necesita dos conexiones.</p><p>Toca una instalación del mapa para acercarte. Puedes recuperar y ajustar todos los materiales antes de activarla.</p>';return;}
    const s=data.state,k=active,v=s.controls,done=k==='gate'?s.complete:s.progress[k]===2;
    let body='';
    if(done)body='<div class="link-success">✓</div><p>La señal fluye por esta instalación. Tu trabajo está guardado.</p>';
    else if(k==='gate')body=`<div class="tower-signal">⌘</div><p>Las dos estaciones esperan el enlace. Activa la torre cuando los cuatro sistemas tengan sus dos conexiones.</p><button class="primary" data-activate>Encender el enlace</button>`;
    else {
      const m=data.missions[k][s.progress[k]];
      if(k==='route')body=`<div class="route-hologram">${'▰ '.repeat(v.segments)||'· · · ·'}</div><p>El siguiente puesto está a <strong>${m.distance} m</strong>. Cada tramo desplegado cubre <strong>${m.scale} m</strong>.</p><p>El banco guarda ${m.reserve} celdas. Envía el <strong>${m.percent}%</strong> a la ruta; el resto protegerá el puesto.</p>${dial('segments','Tramos de ruta',v.segments)}${dial('power','Celdas enviadas',v.power)}<p>Banco restante: ${m.reserve-v.power} celdas</p>`;
      if(k==='workshop')body=`<div class="cargo-manifest"><span>▰ ${m.panels} paneles</span><span>◇ ${m.connectors} conectores</span></div><p>Prepara este cargamento. Cada panel cuesta <strong>${m.panelCost}</strong> créditos y cada conector, <strong>${m.connectorCost}</strong>.</p><p>Presupuesto del puesto: <strong>${m.budget} créditos</strong>. Envía todo el sobrante al escudo.</p>${dial('panels','Paneles del pedido',v.panels)}${dial('connectors','Conectores del pedido',v.connectors)}${dial('shield','Créditos para el escudo',v.shield)}`;
      if(k==='water')body=`<div class="tank-shell"><div></div><span>${(v.ml/1000).toFixed(2)} L</span></div><p>El depósito completo contiene <strong>${m.capacity/1000} L</strong>. El circuito necesita <strong>${m.numerator}/${m.denominator}</strong> de su capacidad.</p><p>La válvula mueve 0.025 L (25 mL) por giro. Puedes devolver agua antes de conectar.</p>${dial('ml','Agua del circuito',v.ml/1000,'L')}`;
      if(k==='shelter')body=`<p>La baliza proyecta una huella de <strong>${m.width} m de ancho por ${m.height} m de fondo</strong>. Levanta el refugio sobre esa huella.</p><div class="floor-preview">${Array.from({length:v.width*v.height},()=>'<span>▧</span>').join('')}</div><p>Un tramo de borde cubre 1 m; un panel de piso cubre 1 m². Lleva materiales para cerrar los cuatro lados y cubrir todo el piso.</p>${dial('width','Ancho del refugio',v.width,'m')}${dial('height','Fondo del refugio',v.height,'m')}${dial('edge','Tramos de borde',v.edge)}${dial('tiles','Paneles de piso',v.tiles)}`;
      body+=`<button class="primary" data-activate>${{route:'Desplegar ruta',workshop:'Despachar cargamento',water:'Conectar circuito',shelter:'Construir refugio'}[k]}</button><button class="game-button" data-hint>Consultar la baliza</button>`;
    }
    $('[data-mechanism]').innerHTML=`<span class="eyebrow">${done?'SISTEMA ENLAZADO':k==='gate'?'LA SEÑAL NOS ESPERA':`CONEXIÓN ${s.progress[k]+1} / 2`}</span><h2>${names[k]}</h2>${body}`;
    const tank=$('.tank-shell>div');if(tank)tank.style.height=Math.min(100,v.ml/data.missions.water[s.progress.water].capacity*100)+'%';const floor=$('.floor-preview');if(floor)floor.style.gridTemplateColumns='repeat('+v.width+',1fr)';
    if(field&&delta)$(`[data-field="${field}"][data-delta="${delta}"]`)?.focus({preventScroll:true});
  }
  function render(){const s=data.state,total=Object.values(s.progress).reduce((a,b)=>a+b,0);$('[data-location]').textContent=`⌖ (${s.x}, ${s.y})`;$('[data-charge]').textContent=s.complete?'ENLACE ACTIVO':`${total} / 8 conexiones`;$('[data-log]').innerHTML=Object.keys(s.progress).map(k=>`<li class="${s.progress[k]===2?'restored':''}">${s.progress[k]===2?'✓':'○'} ${names[k]} · ${s.progress[k]}/2</li>`).join('');$('[data-explore]').textContent=nearest()?`Explorar ${names[nearest()]}`:'Explorar';panel();}
  function draw(t){if(matchMedia('(prefers-reduced-motion: reduce)').matches)t=0;
    if(!visible)return;
    if(data){const s=data.state;ctx.fillStyle='#080f1c';ctx.fillRect(0,0,780,540);
      for(let i=0;i<75;i++){ctx.fillStyle=i%3?'#44617c':'#b7d8ed';ctx.fillRect((i*137+31)%780,(i*79+21)%540,i%3?1:2,1);}
      const glow=ctx.createRadialGradient(390,270,10,390,270,370);glow.addColorStop(0,'#133447');glow.addColorStop(1,'#101a2a');ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(390,295,365,230,0,0,Math.PI*2);ctx.fill();
      for(let x=0;x<13;x++)for(let y=0;y<9;y++){ctx.strokeStyle='#253c4b55';ctx.strokeRect(x*60+2,y*60+2,56,56);}
      // Machinery is drawn in the world as well as on its instrument panel.
      for(let i=0;i<14;i++){const x=(i*173+53)%740+20,y=(i*97+63)%480+25;ctx.fillStyle='#1a2936';ctx.beginPath();ctx.ellipse(x,y,7+i%9,4+i%5,.4,0,7);ctx.fill();}
      ctx.fillStyle='#1b3448';ctx.strokeStyle='#4b7b8b';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(390,270,43,28,0,0,7);ctx.fill();ctx.stroke();ctx.fillStyle=s.complete?'#53f6b3':'#31576b';ctx.beginPath();ctx.ellipse(390,265,25,13,0,0,7);ctx.fill();
      // Solar collectors at the route, freight at the workshop, storage and shelter.
      ctx.fillStyle='#173d61';ctx.strokeStyle='#2c7192';ctx.lineWidth=1;
      for(let i=0;i<3;i++){ctx.fillRect(65+i*27,87,23,31);ctx.strokeRect(65+i*27,87,23,31);ctx.beginPath();ctx.moveTo(76+i*27,87);ctx.lineTo(76+i*27,118);ctx.moveTo(65+i*27,102);ctx.lineTo(88+i*27,102);ctx.stroke();}
      for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#7f603a':'#455667';ctx.fillRect(598+i%2*23,98+Math.floor(i/2)*19,19,15);ctx.strokeStyle='#bda774';ctx.strokeRect(598+i%2*23,98+Math.floor(i/2)*19,19,15);}
      for(let i=0;i<3;i++){ctx.fillStyle='#243b50';ctx.beginPath();ctx.roundRect(64+i*22,352,17,40,5);ctx.fill();ctx.fillStyle='#00bed1';ctx.fillRect(68+i*22,365,9,21);}
      const footprint=s.progress.shelter===2?{width:6,height:2}:s.controls;ctx.fillStyle='#18303d';ctx.strokeStyle='#3c7a79';ctx.strokeRect(587,351,64,43);for(let x=0;x<footprint.width;x++)for(let y=0;y<footprint.height;y++){ctx.fillStyle=s.progress.shelter===2?'#3b7c6a':'#2d5368';ctx.fillRect(590+x*7,354+y*5,5,3);}
      for(const [key,p]of Object.entries(data.sites)){const x=(p.x+6)*60+30,y=(4-p.y)*60+30,done=key==='gate'?s.complete:s.progress[key]===2;
        ctx.strokeStyle=done?'#10b981':'#33536d';ctx.lineWidth=done?4:2;ctx.beginPath();ctx.moveTo(390,270);ctx.lineTo(x,y);ctx.stroke();
        if(done){const f=(t/2000)%1;ctx.fillStyle='#8dffdb';ctx.beginPath();ctx.arc(390+(x-390)*f,270+(y-270)*f,3,0,7);ctx.fill();}
        ctx.shadowColor=done?'#10b981':'#00f0ff';ctx.shadowBlur=8+Math.sin(t/600)*3;ctx.fillStyle=done?'#143f3c':'#203b53';ctx.beginPath();ctx.roundRect(x-27,y-25,54,50,9);ctx.fill();ctx.strokeStyle=done?'#10b981':'#00f0ff';ctx.stroke();ctx.shadowBlur=0;
        ctx.textAlign='center';ctx.fillStyle='#d9faff';ctx.font='28px sans-serif';ctx.fillText(icons[key],x,y+9);ctx.font='11px Inter,sans-serif';ctx.fillText(names[key],x,y-34);if(key!=='gate'){ctx.fillStyle=done?'#6fffd0':'#9db7ce';ctx.fillText('●'.repeat(s.progress[key])+'○'.repeat(2-s.progress[key]),x,y+39);}ctx.textAlign='start';
      }
      astronaut(ctx,(s.x+6)*60+30,(4-s.y)*60+31,34,data.avatar);
      if(s.complete){ctx.fillStyle='#10b98115';ctx.fillRect(0,0,780,540);ctx.fillStyle='#9dffe0';ctx.textAlign='center';ctx.font='bold 25px Rajdhani,sans-serif';ctx.fillText('ENLACE RESTABLECIDO',390,525);ctx.textAlign='start';}
    }frame=requestAnimationFrame(draw);
  }
  async function command(body){if(busy||!visible||!data)return;busy=true;root.setAttribute('aria-busy','true');try{const next=await request('/sector-two/action',{...body,version:data.version});if(!visible)return;data=next;if(active&&!at(active))active=null;render();if(data.message)note(data.message);}catch(e){note(e.message||'La señal se perdió. Tu avance anterior está a salvo.');try{const saved=await request('/sector-two');if(saved.state&&visible){data=saved;active=null;render();}}catch{}}finally{busy=false;root.removeAttribute('aria-busy');}}
  function explore(){active=nearest()||null;panel();if(!active)note('Acércate a una instalación del mapa.');}
  async function walk(x,y,key){const generation=++path;while(visible&&generation===path&&(data.state.x!==x||data.state.y!==y)){if(busy)return;const before=data.version;await command({type:'move',dx:data.state.x===x?0:Math.sign(x-data.state.x),dy:data.state.x===x?Math.sign(y-data.state.y):0});if(data.version===before)return;}if(visible&&generation===path&&key&&at(key)){active=key;panel();}}
  canvas.onclick=e=>{if(busy||!data)return;const r=canvas.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)/r.width*13)-6,y=4-Math.floor((e.clientY-r.top)/r.height*9);if(Math.abs(x)>6||Math.abs(y)>4)return;const key=Object.keys(data.sites).find(k=>data.sites[k].x===x&&data.sites[k].y===y);walk(x,y,key);};
  root.addEventListener('click',e=>{if(!active)return;const target=e.target.closest('button');if(!target)return;if(target.dataset.field)command({type:'adjust',site:active,field:target.dataset.field,delta:Number(target.dataset.delta)});if(target.hasAttribute('data-activate'))command({type:'activate',site:active});if(target.hasAttribute('data-hint'))command({type:'hint',site:active});});
  const stop=()=>{clearInterval(hold);hold=null;};
  root.querySelectorAll('[data-step]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();++path;stop();b.setPointerCapture(e.pointerId);const [dx,dy]=b.dataset.step.split(',').map(Number);command({type:'move',dx,dy});hold=setInterval(()=>command({type:'move',dx,dy}),180);};b.onpointerup=stop;b.onpointercancel=stop;b.onlostpointercapture=stop;});
  document.addEventListener('keydown',e=>{if(!visible||!data||e.target.matches('input,button,select,textarea')||e.ctrlKey||e.metaKey||e.altKey)return;const dirs={ArrowUp:[0,1],w:[0,1],ArrowDown:[0,-1],s:[0,-1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};if(dirs[e.key]){e.preventDefault();++path;const [dx,dy]=dirs[e.key];command({type:'move',dx,dy});}if(e.key.toLowerCase()==='e'){e.preventDefault();explore();}});
  $('[data-explore]').onclick=explore;window.addEventListener('blur',()=>{stop();++path;});
  function close(){visible=false;++path;stop();cancelAnimationFrame(frame);root.hidden=true;document.body.classList.remove('playing');}
  $('[data-exit]').onclick=close;
  return {close,async open(){if(busy||visible)return;visible=true;active=null;data=null;root.hidden=false;document.body.classList.add('playing');note('Estableciendo enlace con el puesto exterior…');frame=requestAnimationFrame(draw);busy=true;try{const saved=await request('/sector-two/start',{});if(!visible)return;data=saved;render();note(data.state.complete?'Tu enlace sigue activo. El puesto te esperaba.':'La tormenta se aleja. Recupera las cuatro instalaciones para comunicar los refugios.');}catch(e){close();throw e;}finally{busy=false;}}};
}
