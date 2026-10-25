export function normalizePhone(value,country='52') {
  const digits=String(value).trim().replace(/[+\s()-]/g,'');
  const phone=digits.length===10?country+digits:digits;
  if(!/^[1-9]\d{10,14}$/.test(phone))throw new Error('Número SMS inválido');
  return phone;
}
export function createTeacherSms({env=process.env,send=fetch}={}) {
  const enabled=env.SMS_NOTIFICATIONS_ENABLED==='true';
  const test=env.LABSMOBILE_TEST_MODE!=='false';
  const phones=enabled?[...new Set((env.SMS_ADMIN_PHONES||'').split(',').filter(s=>s.trim()).map(p=>normalizePhone(p,env.SMS_DEFAULT_COUNTRY_CODE||'52')))]:[];
  if(enabled&&(!phones.length||!env.LABSMOBILE_USERNAME||!env.LABSMOBILE_API_TOKEN))throw new Error('Configura credenciales y SMS_ADMIN_PHONES');
  const sender=env.LABSMOBILE_SENDER_ID||'RedCero';
  if(!/^[a-zA-Z0-9]{1,11}$/.test(sender))throw new Error('Remitente SMS inválido');
  return async(event)=>{
    if(!enabled||event!=='pending')return {status:'disabled'};
    try{
      const response=await send('https://api.labsmobile.com/json/send',{
        method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
        headers:{Authorization:'Basic '+Buffer.from(`${env.LABSMOBILE_USERNAME}:${env.LABSMOBILE_API_TOKEN}`).toString('base64'),'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({message:'Red Cero: nueva solicitud docente. Entra al Observatorio para revisar y gestionar su acceso.',recipient:phones.map(msisdn=>({msisdn})),tpoa:sender,test:test?1:0})
      });
      const body=await response.json();
      if(!response.ok||String(body.code)!=='0')return {status:'failed',code:String(body.code??response.status).slice(0,16)};
      return {status:test?'simulated':'sent',reference:typeof body.subid==='string'?body.subid.slice(0,40):undefined};
    }catch{return {status:'failed'};}
  };
}
