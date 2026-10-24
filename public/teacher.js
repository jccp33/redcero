const $=id=>document.getElementById(id);
const local=['localhost','127.0.0.1','192.168.1.150'].includes(location.hostname);
const api=local&&location.port!=='3000'?`${location.protocol}//${location.hostname}:3000`:'';
let groupId='',offset=0,total=0,detailId=null,eventOffset=0,requestId=0,detailRequest=0;
let applicationOffset=0;
const labels={supply:'Recoger suministros',build:'Colocar pieza',remove:'Recuperar pieza',flow:'Ajustar válvula',pulse:'Ajustar pulso',transmit:'Transmitir señal',drone:'Indicar acción al dron',open:'Abrir hangar'};
const date=value=>value?new Date(value).toLocaleString('es-MX'):'Sin actividad';
const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
function notice(message){$('notice').textContent=message;}
async function request(path,body){const r=await fetch(`${api}/api${path}`,{credentials:'include',...(body===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});const data=await r.json();if(!r.ok){const error=new Error(data.error||'No se pudo completar la consulta.');error.status=r.status;throw error;}return data;}
function error(e){notice(e instanceof TypeError?'No hay conexión con el servidor. Intenta actualizar.':e.message);if(e.status===401||e.status===403){++requestId;hideDetail();$('students').replaceChildren();$('dashboard').hidden=true;$('application-panel').hidden=true;$('login-panel').hidden=false;$('logout').hidden=e.status===401;}}
function hideDetail(){detailId=null;detailRequest++;$('detail').hidden=true;$('events').replaceChildren();}
async function load(){
  const generation=++requestId;hideDetail();$('students').replaceChildren();$('prev').disabled=true;$('next').disabled=true;
  if(!groupId){for(const id of ['total','started','complete'])$(id).textContent='0';$('result-count').textContent='Sin grupo';$('page').textContent='';notice('No tienes grupos asignados. Solicita una asignación a administración.');return;}
  try{const data=await request(`/teacher/students?groupId=${encodeURIComponent(groupId)}&q=${encodeURIComponent($('query').value)}&offset=${offset}`);if(generation!==requestId)return;
    for(const id of ['total','started','complete'])$(id).textContent=String(data.summary[id]);total=data.total;$('result-count').textContent=`${total} resultados`;
    for(const s of data.students){const row=el('tr'),identity=el('td');identity.append(el('strong',s.username),el('span',s.email||'Correo pendiente','private-email'));const status=el('td');status.append(el('span',s.complete?'Completado':s.started?'En exploración':'Sin iniciar',`status-tag ${s.complete?'done':''}`));const systems=el('td');const count=Object.values(s.systems).filter(Boolean).length;systems.append(el('span',`${count} / 6`));const bar=document.createElement('progress');bar.max=6;bar.value=count;bar.setAttribute('aria-label',`${count} de 6 mecanismos restaurados`);systems.append(bar);const action=el('td');const button=el('button','Ver recorrido','secondary');button.type='button';button.onclick=()=>detail(s.id);action.append(button);row.append(identity,status,systems,el('td',date(s.savedAt)),action);$('students').append(row);}
    if(!data.students.length){const td=el('td','No hay estudiantes que coincidan en este grupo.');td.colSpan=5;const tr=el('tr');tr.append(td);$('students').append(tr);}
    $('prev').disabled=offset===0;$('next').disabled=offset+25>=total;$('page').textContent=total?`${offset+1}–${Math.min(offset+25,total)} de ${total}`:'Sin resultados';notice('Datos actualizados.');
  }catch(e){if(generation===requestId)error(e);}
}
async function groups(preferred){const data=await request('/teacher/groups');$('login-panel').hidden=true;$('application-panel').hidden=true;$('dashboard').hidden=false;$('logout').hidden=false;$('admin-tools').hidden=data.user.role!=='admin';$('application-reviews').hidden=data.user.role!=='admin';$('group').replaceChildren(...data.groups.map(g=>{const o=el('option',g.name);o.value=g.id;return o;}));groupId=String(data.groups.some(g=>String(g.id)===String(preferred))?preferred:data.groups[0]?.id||'');$('group').value=groupId;offset=0;await load();if(data.user.role==='admin')await applications();}
function authTab(register){$('teacher-register').hidden=!register;$('teacher-login').hidden=register;$('register-tab').classList.toggle('active',register);$('login-tab').classList.toggle('active',!register);$('register-tab').setAttribute('aria-pressed',String(register));$('login-tab').setAttribute('aria-pressed',String(!register));notice('');}
async function account(){
  const data=await request('/teacher/status');
  if(['teacher','admin'].includes(data.user.role))return groups();
  ++requestId;hideDetail();$('dashboard').hidden=true;$('login-panel').hidden=true;$('application-panel').hidden=false;$('logout').hidden=false;
  const status=data.application?.status;
  $('application-title').textContent=status==='pending'?'Solicitud en revisión':status==='rejected'?'Solicitud no aprobada':status==='approved'?'Acceso docente deshabilitado':'Solicita acceso docente';
  $('application-status').textContent=status==='pending'?'Recibimos tu solicitud. Administración revisará tu nombre e institución. Cuando sea aprobada y tengas un grupo asignado, podrás consultar su recorrido.':status==='rejected'?'Administración no aprobó esta solicitud. Contacta a la persona responsable de tu institución para aclararla.':status==='approved'?'Tu solicitud fue aprobada anteriormente, pero tu rol actual no permite entrar. Contacta a administración.':'Tu cuenta todavía no tiene una solicitud docente. Completa estos datos para enviarla.';
  $('existing-application').hidden=!!data.application;notice(`Sesión de ${data.user.username}.`);
}
async function applications(){
  const data=await request(`/teacher/applications?offset=${applicationOffset}`);$('application-list').replaceChildren();
  for(const item of data.applications){const card=el('article',undefined,'request-card');card.append(el('h3',item.display_name),el('p',`${item.username} · ${item.email}`),el('p',item.institution),el('p',`Solicitud: ${date(item.created_at)}`));const actions=el('div',undefined,'request-actions');
    for(const [decision,label]of [['approved','Aprobar cuenta docente'],['rejected','Rechazar solicitud']]){const button=el('button',label,'secondary');button.type='button';button.onclick=async()=>{for(const b of actions.querySelectorAll('button'))b.disabled=true;try{await request(`/teacher/applications/${item.user_id}/review`,{decision});await applications();notice(decision==='approved'?`Cuenta ${item.username} aprobada. Asígnala ahora a un grupo como docente.`:'Solicitud rechazada.');}catch(e){error(e);for(const b of actions.querySelectorAll('button'))b.disabled=false;}};actions.append(button);}card.append(actions);$('application-list').append(card);}
  if(!data.applications.length)$('application-list').append(el('p','No hay solicitudes pendientes en esta página.'));
  $('application-prev').disabled=applicationOffset===0;$('application-next').disabled=applicationOffset+25>=data.total;$('application-page').textContent=`${data.total} pendientes`;
}
async function detail(id,more=false){
  const generation=++detailRequest;if(!more){detailId=id;eventOffset=0;$('events').replaceChildren();$('detail').hidden=true;}
  $('more-events').disabled=true;
  try{const data=await request(`/teacher/students/${id}?groupId=${encodeURIComponent(groupId)}&offset=${eventOffset}`);if(generation!==detailRequest||detailId!==id)return;
    $('detail').hidden=false;$('detail-title').textContent=`Recorrido de ${data.student.username}`;$('detail-email').textContent=data.student.email||'Correo pendiente';$('mechanisms').replaceChildren();
    for(const s of data.systems){const tr=el('tr');tr.append(el('td',s.label),el('td',s.restored?'Restaurado ✓':'Pendiente'),el('td',String(s.accepted)),el('td',String(s.retry)));$('mechanisms').append(tr);}
    for(const event of data.events){const li=el('li',`${labels[event.action]||'Interacción'} · ${event.outcome==='accepted'?'Aceptada':'Rechazada'}`);const time=el('time',date(event.created_at));time.dateTime=event.created_at;li.append(time);$('events').append(li);}
    if(!data.totalEvents)$('events').append(el('li','Todavía no hay interacciones registradas.'));
    eventOffset+=data.events.length;$('more-events').hidden=eventOffset>=data.totalEvents;$('more-events').disabled=false;if(!more)$('detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }catch(e){if(generation===detailRequest)error(e);}
}
$('teacher-login').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{await request('/auth/login',{username:$('alias').value,password:$('password').value});$('password').value='';await account();}catch(e){error(e);$('login-panel').hidden=false;$('logout').hidden=false;}finally{b.disabled=false;}};
$('logout').onclick=async()=>{try{await request('/auth/logout',{});++requestId;hideDetail();$('students').replaceChildren();$('dashboard').hidden=true;$('application-panel').hidden=true;$('login-panel').hidden=false;$('logout').hidden=true;authTab(false);notice('Sesión cerrada.');}catch(e){error(e);}};
$('group').onchange=()=>{groupId=$('group').value;offset=0;load();};$('search').onsubmit=e=>{e.preventDefault();offset=0;load();};$('refresh').onclick=()=>load();$('prev').onclick=()=>{offset=Math.max(0,offset-25);load();};$('next').onclick=()=>{offset+=25;load();};$('close-detail').onclick=hideDetail;$('more-events').onclick=()=>detail(detailId,true);
$('create-group').onsubmit=async e=>{e.preventDefault();e.submitter.disabled=true;try{const g=await request('/teacher/groups',{name:$('group-name').value});$('group-name').value='';await groups(g.id);}catch(e){error(e);}finally{e.submitter.disabled=false;}};
$('add-member').onsubmit=async e=>{e.preventDefault();if(!groupId)return notice('Primero crea o selecciona un grupo.');e.submitter.disabled=true;try{await request(`/teacher/groups/${groupId}/members`,{identifier:$('member').value,role:$('member-role').value});$('member').value='';await load();notice('Integrante asignado al grupo.');}catch(e){error(e);}finally{e.submitter.disabled=false;}};
$('login-tab').onclick=()=>authTab(false);$('register-tab').onclick=()=>authTab(true);
$('teacher-register').onsubmit=async e=>{
  e.preventDefault();const button=e.submitter;
  const password=$('register-password').value;
  if(password!==$('register-confirm').value)return notice('Las contraseñas no coinciden.');
  if(new TextEncoder().encode(password).length>72)return notice('La contraseña es demasiado larga. Prueba una más corta o usa menos símbolos.');
  button.disabled=true;
  try{await request('/auth/teacher-register',{username:$('register-alias').value,email:$('register-email').value,displayName:$('register-name').value,institution:$('register-institution').value,password});$('teacher-register').reset();await account();}catch(e){error(e);}finally{button.disabled=false;}
};
$('existing-application').onsubmit=async e=>{e.preventDefault();e.submitter.disabled=true;try{await request('/teacher/application',{displayName:$('existing-name').value,institution:$('existing-institution').value});$('existing-application').reset();await account();}catch(e){error(e);}finally{e.submitter.disabled=false;}};
$('check-application').onclick=()=>account().catch(error);
$('refresh-applications').onclick=()=>applications().catch(error);
$('application-prev').onclick=()=>{applicationOffset=Math.max(0,applicationOffset-25);applications().catch(error);};
$('application-next').onclick=()=>{applicationOffset+=25;applications().catch(error);};
account().catch(e=>{error(e);$('login-panel').hidden=false;$('logout').hidden=e.status===401;});

