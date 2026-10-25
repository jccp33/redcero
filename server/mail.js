// The provider expects JSON with its historical form content type.
export function createTeacherMailer({env=process.env,send=fetch}={}) {
  const enabled=env.MAIL_ENABLED==='true';
  const validEmail=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  if(enabled&&!validEmail(env.MAIL_ADMIN_RECEIVER))throw new Error('Configura MAIL_ADMIN_RECEIVER antes de habilitar correos');
  async function deliver(receiver,subject,message){
    if(!enabled)return 'disabled';
    if(!validEmail(receiver))return 'failed';
    try{
      const response=await send('https://appsevolution.com.mx/email.php',{
        method:'POST',redirect:'error',signal:AbortSignal.timeout(5000),
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body:JSON.stringify({receiver,subject,message})
      });
      if(!response.ok)return 'failed';
      const body=await response.json();
      return body.response===true?'sent':'failed';
    }catch{return 'failed';}
  }
  return async function notifyTeacher(event,user){
    const pending=event==='pending';
    const subject=pending?'Red Cero · Solicitud docente recibida':event==='approved'?'Red Cero · Solicitud docente aprobada':'Red Cero · Solicitud docente no aprobada';
    const message=pending
      ?`Hola ${user.displayName}. Recibimos tu solicitud docente en Red Cero. Está en revisión. Puedes consultar su estado en el Observatorio docente.`
      :event==='approved'
        ?`Hola ${user.displayName}. Tu solicitud docente fue aprobada. Inicia sesión en el Observatorio docente con tu alias ${user.username}. Ya puedes crear tus grupos e invitar a tus estudiantes para consultar sus estadísticas.`
        :`Hola ${user.displayName}. Tu solicitud docente no fue aprobada. Puedes consultar su estado en el Observatorio docente y contactar a la administración de tu institución para aclaraciones.`;
    const deliveries=[deliver(user.email,subject,message)];
    if(pending)deliveries.push(deliver(env.MAIL_ADMIN_RECEIVER,'Red Cero · Nueva solicitud docente',`Se recibió una solicitud docente.\nAlias: ${user.username}\nNombre: ${user.displayName}\nInstitución: ${user.institution}\nRevisa la solicitud en el Observatorio docente. La aprobación requiere una revisión administrativa.`));
    const results=await Promise.all(deliveries);
    if(results.includes('failed'))console.error('Notificación docente: envío no confirmado');
    return {status:results.includes('failed')?'failed':enabled?'sent':'disabled'};
  };
}
