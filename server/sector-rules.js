export const sites = {supply:{x:-3,y:2},bridge:{x:-1,y:0},coolant:{x:2,y:2},relay:{x:3,y:-2},drone:{x:-3,y:-2},hangar:{x:5,y:0}};
export const initialState = () => ({x:0,y:0,metal:0,battery:false,bridge:0,flows:[0,0,0],coolant:false,pulse:2,relay:false,drone:'waiting',complete:false});
export function validAvatar(a) {return a && ['cyan','orange','violet'].includes(a.suit) && ['round','square'].includes(a.helmet) && ['light','medium','dark'].includes(a.skin);}
export function act(previous, command) {
  const s = structuredClone(previous);
  const fail = message => ({state:previous,message,outcome:'retry'});
  const near = key => Math.abs(s.x-sites[key].x)+Math.abs(s.y-sites[key].y)<=1;
  let message = '';
  if(command.type === 'move') {
    const {dx,dy} = command;
    if(!Number.isInteger(dx)||!Number.isInteger(dy)||Math.abs(dx)+Math.abs(dy)!==1) return fail('Elige una dirección.');
    const x=s.x+dx,y=s.y+dy;
    if(x < -6 || x > 6 || y < -4 || y > 4) return fail('La estación termina aquí.');
    if(x===-1 && y===0 && s.bridge<3) return fail('Faltan piezas para cruzar la pasarela. Acércate y repara.');
    s.x=x;s.y=y;
  } else if(command.type === 'supply' && near('supply')) {
    if(s.battery) return fail('Ya recuperaste estos suministros.');
    s.battery=true;s.metal=6;message='¡Batería recuperada! Encontraste también 6 piezas para la pasarela.';
  } else if(command.type === 'build' && near('bridge')) {
    if(s.bridge>=3) return fail('La pasarela ya está lista.');
    if(!s.metal) return fail('Busca suministros en la baliza (−3, +2).');
    s.metal--;s.bridge++;message=s.bridge===3?'¡Pasarela restaurada! Conservas 3 piezas.':'La pasarela empieza a tomar forma.';
  } else if(command.type === 'remove' && near('bridge')) {
    if(!s.bridge) return fail('No hay piezas que recuperar.');
    s.bridge--;s.metal++;message='Pieza recuperada. Puedes volver a colocarla.';
  } else if(command.type === 'flow' && near('coolant')) {
    if(s.coolant) return fail('El circuito ya está estable.');
    const {index,delta}=command;
    if(!Number.isInteger(index)||index<0||index>2||![1,-1].includes(delta)) return fail('Elige una válvula.');
    if(s.flows[index]+delta<0 || s.flows.reduce((a,b)=>a+b,0)+delta>12) return fail('No queda agua en la reserva. Cierra otra válvula para recuperarla.');
    s.flows[index]+=delta;
    if(s.flows[0]===6&&s.flows[1]===3&&s.flows[2]===3) {s.coolant=true;message='¡Flujo estable! El reactor recibe la mitad y los otros dos sistemas un cuarto cada uno.';}
  } else if(command.type === 'pulse' && near('relay')) {
    if(s.relay) return fail('La antena ya transmite.');
    if(![-1,1].includes(command.delta)) return fail('Ajusta el regulador.');
    s.pulse=Math.max(1,Math.min(12,s.pulse+command.delta));
  } else if(command.type === 'transmit' && near('relay')) {
    if(s.pulse!==8) return fail('La luz no encaja todavía. Escucha: 2… 4… 6… cada pulso crece lo mismo.');
    s.relay=true;message='¡Señal enlazada! La antena vuelve a respirar.';
  } else if(command.type === 'drone' && near('drone')) {
    if(!['go','collect','return'].includes(command.step)) return fail('Elige un gesto para el dron.');
    const transitions={waiting:['go','arrived'],arrived:['collect','loaded'],loaded:['return','done']};
    const next=transitions[s.drone];
    if(!next || next[0]!==command.step) return fail('Mira al dron: primero va a la celda, luego la recoge y vuelve.');
    s.drone=next[1];message={arrived:'El dron llegó a la celda. Hazle una señal para recogerla.',loaded:'¡Celda asegurada! Indícale que vuelva.',done:'¡Dron de vuelta! La celda del hangar está lista.'}[s.drone];
  } else if(command.type === 'open' && near('hangar')) {
    if(!s.battery||s.bridge!==3||!s.coolant||!s.relay||s.drone!=='done') return fail('El hangar espera la batería, pasarela, refrigeración, antena y dron. Explora los sistemas que siguen apagados.');
    s.complete=true;message='¡Sector 01 restaurado! La estación vuelve a tener una señal. Puedes seguir explorando.';
  } else return fail('Acércate al mecanismo para interactuar.');
  return {state:s,message,outcome:'accepted'};
}
