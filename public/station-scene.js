// Canvas-only scenery: coordinates, collisions and resources remain server-owned.
const point=p=>({x:(p.x+6)*60+30,y:(4-p.y)*60+30});
const line=(ctx,points,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();};
export function drawStation(ctx,data,paintAvatar,{time=0,marked=null,position=null,reduced=false}={}){
  const s=data.state;if(reduced)time=0;
  const restored={supply:s.battery,bridge:s.bridge===3,coolant:s.coolant,relay:s.relay,drone:s.drone==='done',hangar:s.complete};
  const p=Object.fromEntries(Object.entries(data.sites).map(([k,v])=>[k,point(v)]));
  const gradient=ctx.createLinearGradient(0,0,780,540);gradient.addColorStop(0,'#081522');gradient.addColorStop(1,'#030914');ctx.fillStyle=gradient;ctx.fillRect(0,0,780,540);
  for(let i=0;i<85;i++){ctx.fillStyle=i%4?'#3f6078':'#9bd6e9';ctx.fillRect((i*137+23)%780,(i*71+15)%540,i%4?1:2,1);}
  ctx.fillStyle='#112234';ctx.strokeStyle='#456274';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(9,19,762,505,30);ctx.fill();ctx.stroke();
  for(let row=0;row<9;row++)for(let col=0;col<13;col++){
    const x=col*60,y=row*60;ctx.fillStyle=(row+col)%2?'#14283a':'#162d40';ctx.fillRect(x+5,y+5,50,50);ctx.strokeStyle='#34566a40';ctx.lineWidth=1;ctx.strokeRect(x+5,y+5,50,50);
    if(col===6||row===4){ctx.fillStyle='#00f0ff0a';ctx.fillRect(x+5,y+5,50,50);ctx.fillStyle='#7696a6';ctx.font='10px monospace';if(col===6)ctx.fillText(String(4-row),x+8,y+15);if(row===4)ctx.fillText(String(col-6),x+44,y+51);}
  }
  // Cable conduits and flowing energy become visible as each system wakes up.
  const hub={x:390,y:270};
  for(const key of ['supply','coolant','relay','drone','hangar']){
    const dest=p[key],via={x:hub.x,y:dest.y};line(ctx,[hub,via,dest],'#081724',11);line(ctx,[hub,via,dest],restored[key]?'#208e79':'#345568',3);
    if(restored[key]){const total=Math.abs(via.y-hub.y)+Math.abs(dest.x-via.x),distance=(time/12)%total;const dot=distance<Math.abs(via.y-hub.y)?{x:hub.x,y:hub.y+Math.sign(via.y-hub.y)*distance}:{x:hub.x+Math.sign(dest.x-via.x)*(distance-Math.abs(via.y-hub.y)),y:via.y};ctx.fillStyle='#88ffe0';ctx.beginPath();ctx.arc(dot.x,dot.y,3,0,7);ctx.fill();}
  }
  // Three independently placed bridge segments over a visible service trench.
  ctx.fillStyle='#030a11';ctx.fillRect(p.bridge.x-28,p.bridge.y-27,56,54);ctx.strokeStyle='#587281';ctx.strokeRect(p.bridge.x-28,p.bridge.y-27,56,54);
  for(let i=0;i<3;i++){const x=p.bridge.x-23+i*16;ctx.fillStyle=i<s.bridge?'#547f8c':'#102030';ctx.fillRect(x,p.bridge.y-21,13,42);ctx.fillStyle=i<s.bridge?'#9dffce':'#e3a459';ctx.fillRect(x+3,p.bridge.y-17,7,3);}
  // Supply beacon, crates and battery pack.
  ctx.fillStyle='#6b5942';ctx.fillRect(p.supply.x-24,p.supply.y-9,23,27);ctx.strokeStyle='#caa372';ctx.strokeRect(p.supply.x-24,p.supply.y-9,23,27);
  ctx.fillStyle=s.battery?'#233f43':'#9cebf0';ctx.fillRect(p.supply.x+5,p.supply.y-12,18,30);ctx.fillStyle='#123342';ctx.fillRect(p.supply.x+10,p.supply.y-17,8,5);
  ctx.strokeStyle=s.battery?'#43e1ad':'#00edff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.supply.x,p.supply.y,34+Math.sin(time/350)*3,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
  // Three actual coolant tanks, with levels tied to the accepted server state.
  for(let i=0;i<3;i++){const x=p.coolant.x-29+i*21,y=p.coolant.y-21;ctx.fillStyle='#0a1929';ctx.fillRect(x,y,17,43);ctx.strokeStyle='#91b8c5';ctx.strokeRect(x,y,17,43);const h=s.flows[i]/12*37;ctx.fillStyle=s.coolant?'#3cd6ac':'#00b9e2';ctx.fillRect(x+3,y+40-h,11,h);}
  // Antenna and its visible repeating light groups.
  line(ctx,[{x:p.relay.x,y:p.relay.y+22},{x:p.relay.x,y:p.relay.y-15}],'#9ab9cb',6);
  ctx.strokeStyle=s.relay?'#42e6b3':'#5dcce7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.relay.x,p.relay.y-20,22,0,Math.PI);ctx.stroke();
  for(let i=0;i<3;i++){const phase=(time/650+i*.28)%1;ctx.globalAlpha=.7-phase*.5;ctx.strokeStyle=s.relay?'#50edbf':'#3b90a8';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.relay.x,p.relay.y-22,27+phase*15,Math.PI*1.12,Math.PI*1.88);ctx.stroke();}ctx.globalAlpha=1;
  // Drone stays near its own dock and carries a cell only after collecting it.
  ctx.strokeStyle='#536a8c';ctx.setLineDash([4,5]);line(ctx,[{x:p.drone.x-10,y:p.drone.y},{x:p.drone.x+90,y:p.drone.y}],'#6577a1');ctx.setLineDash([]);
  const droneX=['arrived','loaded'].includes(s.drone)?p.drone.x+76:p.drone.x,droneY=p.drone.y-5+Math.sin(time/240)*3;
  ctx.fillStyle='#9c8be7';ctx.beginPath();ctx.roundRect(droneX-13,droneY-8,26,15,5);ctx.fill();line(ctx,[{x:droneX-22,y:droneY-6},{x:droneX+22,y:droneY-6}],'#d7d4ff',2);ctx.fillStyle='#081a2d';ctx.fillRect(droneX-6,droneY-4,12,5);
  if(s.drone==='waiting'||s.drone==='arrived'){ctx.fillStyle='#ffc77d';ctx.fillRect(p.drone.x+72,p.drone.y+9,9,12);}else{ctx.fillStyle='#ffc77d';ctx.fillRect(droneX-4,droneY+8,9,10);}
  // Hangar doors reveal the route toward the second sector after restoration.
  ctx.fillStyle='#071522';ctx.fillRect(p.hangar.x-27,p.hangar.y-30,54,60);ctx.strokeStyle=s.complete?'#5bf7bd':'#718c9d';ctx.lineWidth=3;ctx.strokeRect(p.hangar.x-27,p.hangar.y-30,54,60);
  ctx.fillStyle=s.complete?'#235148':'#385167';ctx.fillRect(p.hangar.x-24,p.hangar.y-27,s.complete?8:23,54);ctx.fillRect(p.hangar.x+(s.complete?16:1),p.hangar.y-27,s.complete?8:23,54);
  if(s.complete){ctx.fillStyle='#91ffda';ctx.font='24px sans-serif';ctx.textAlign='center';ctx.fillText('↗',p.hangar.x,p.hangar.y+9);ctx.textAlign='start';}
  // Labels, state lights and an optional player-controlled destination marker.
  const labels={supply:'BALIZA',bridge:'PASARELA',coolant:'DEPÓSITOS',relay:'ANTENA',drone:'MUELLE',hangar:'HANGAR'};
  for(const [key,v]of Object.entries(p)){ctx.textAlign='center';ctx.font='bold 10px sans-serif';ctx.fillStyle='#d8eff7';ctx.fillText(labels[key],v.x,v.y-40);ctx.fillStyle=restored[key]?'#5df0ba':'#ffbd74';ctx.font='12px sans-serif';ctx.fillText(restored[key]?'✓':'○',v.x,v.y+38);if(marked===key){ctx.strokeStyle='#ffcb80';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(v.x,v.y,42,0,7);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#ffcb80';ctx.font='20px sans-serif';ctx.fillText('▼',v.x,v.y-53);}ctx.textAlign='start';}
  const player=position||{x:s.x,y:s.y};paintAvatar(ctx,(player.x+6)*60+30,(4-player.y)*60+31,35,data.avatar);
  if(s.complete){ctx.fillStyle='#071d22dd';ctx.fillRect(218,477,344,36);ctx.fillStyle='#9dffda';ctx.textAlign='center';ctx.font='bold 20px Rajdhani,sans-serif';ctx.fillText('LA ESTACIÓN VUELVE A RESPIRAR',390,501);ctx.textAlign='start';}
}
