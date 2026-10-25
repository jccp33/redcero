export const sites={route:{x:-4,y:2},workshop:{x:3,y:2},water:{x:-4,y:-2},shelter:{x:3,y:-2},gate:{x:0,y:3}};
export const missions={
  route:[{distance:20,scale:5,reserve:20,percent:75},{distance:18,scale:3,reserve:40,percent:25}],
  workshop:[{panels:3,connectors:2,panelCost:4,connectorCost:3,budget:25},{panels:2,connectors:3,panelCost:5,connectorCost:2,budget:30}],
  water:[{capacity:1000,numerator:1,denominator:4},{capacity:2000,numerator:3,denominator:4}],
  shelter:[{width:4,height:3},{width:6,height:2}]
};
export const initialState=()=>({x:0,y:0,progress:{route:0,workshop:0,water:0,shelter:0},controls:{segments:0,power:0,panels:0,connectors:0,shield:0,ml:0,width:1,height:1,edge:0,tiles:0},hints:{route:0,workshop:0,water:0,shelter:0},complete:false});
const ranges={segments:[0,12],power:[0,40],panels:[0,8],connectors:[0,8],shield:[0,30],ml:[0,2000],width:[1,8],height:[1,8],edge:[0,40],tiles:[0,64]};
const fields={route:['segments','power'],workshop:['panels','connectors','shield'],water:['ml'],shelter:['width','height','edge','tiles']};
export function act(previous,c){
  const s=structuredClone(previous),fail=message=>({state:previous,message,outcome:'retry'});
  if(!c||typeof c!=='object')return fail('La señal no llegó. Inténtalo de nuevo.');
  if(c.type==='move'){
    if(!Number.isInteger(c.dx)||!Number.isInteger(c.dy)||Math.abs(c.dx)+Math.abs(c.dy)!==1)return fail('Elige una dirección.');
    if(Math.abs(s.x+c.dx)>6||Math.abs(s.y+c.dy)>4)return fail('El borde del puesto está aquí.');
    s.x+=c.dx;s.y+=c.dy;return {state:s,message:'',outcome:'accepted'};
  }
  const key=c.site,p=sites[key];if(!Object.hasOwn(sites,key)||Math.abs(s.x-p.x)+Math.abs(s.y-p.y)>1)return fail('Acércate al mecanismo para usarlo.');
  if(key==='gate'){
    if(c.type!=='activate'||!Object.values(s.progress).every(v=>v===2))return fail('El enlace necesita las dos conexiones de cada sistema.');
    s.complete=true;return {state:s,message:'¡Enlace reconstruido! Las dos estaciones vuelven a comunicarse. Tu refugio está a salvo.',outcome:'accepted'};
  }
  if(s.progress[key]===2)return fail('Este sistema ya está enlazado.');
  if(c.type==='hint'){s.hints[key]++;return {state:s,outcome:'accepted',message:{route:'Compara una pieza con la distancia del plano. La reserva completa representa el 100%.',workshop:'Cada pieza tiene su coste. El presupuesto debe cubrir el pedido y el sobrante que envías al escudo.',water:'Mira la capacidad completa, divídela en partes iguales y toma las partes señaladas. Un litro son 1000 mL.',shelter:'El borde rodea los cuatro lados. El piso cubre filas completas de paneles de 1 m².'}[key]};}
  if(c.type==='adjust'){
    if(!fields[key].includes(c.field)||![-1,1].includes(c.delta))return fail('Usa un control del mecanismo.');
    const step=c.field==='ml'?25:1,[min,baseMax]=ranges[c.field],m=missions[key][s.progress[key]],max=c.field==='power'?m.reserve:c.field==='ml'?m.capacity:baseMax,value=s.controls[c.field]+c.delta*step;
    if(value<min||value>max)return fail('El control llegó a su límite.');
    s.controls[c.field]=value;return {state:s,message:'',outcome:'accepted'};
  }
  if(c.type!=='activate')return fail('Elige una acción del mecanismo.');
  const m=missions[key][s.progress[key]],v=s.controls;
  const correct={route:()=>v.segments*m.scale===m.distance&&v.power===m.reserve*m.percent/100,
    workshop:()=>v.panels===m.panels&&v.connectors===m.connectors&&v.shield===m.budget-v.panels*m.panelCost-v.connectors*m.connectorCost,
    water:()=>v.ml===m.capacity*m.numerator/m.denominator,
    shelter:()=>v.width===m.width&&v.height===m.height&&v.edge===2*(v.width+v.height)&&v.tiles===v.width*v.height}[key]();
  if(!correct)return fail({route:'La ruta o su carga todavía no encajan con el plano. Puedes recuperar todas las piezas.',workshop:'El pedido y la reserva del escudo no cuadran con el presupuesto. Revisa el manifiesto.',water:'El flujo no coincide con la marca del depósito. Devuelve agua o ajusta la válvula.',shelter:'El refugio necesita la huella del plano, borde para sus cuatro lados y paneles para todo el piso.'}[key]);
  s.progress[key]++;
  for(const field of fields[key])s.controls[field]=field==='width'||field==='height'?1:0;
  return {state:s,outcome:'accepted',message:s.progress[key]===2?'¡Sistema enlazado! La señal alcanza otra zona del puesto.':'¡Primera conexión lista! Llegó un nuevo plano para completar este sistema.'};
}
