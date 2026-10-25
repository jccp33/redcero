export function createAccountDelivery({env=process.env,send=fetch}={}){
  return async({channel,destination,code,purpose})=>{
    const message=`Red Cero: tu codigo para ${purpose==='phone_verify'?'verificar tu celular':'cambiar tu contrasena'} es ${code}. Caduca en 15 minutos. No lo compartas.`;
    if(channel==='sms'&&(env.SMS_NOTIFICATIONS_ENABLED!=='true'||!env.LABSMOBILE_USERNAME||!env.LABSMOBILE_API_TOKEN))return 'disabled';
    if(channel==='email'&&env.MAIL_ENABLED!=='true')return 'disabled';
    try{
      const sms=channel==='sms',test=env.LABSMOBILE_TEST_MODE!=='false';
      const response=await send(sms?'https://api.labsmobile.com/json/send':'https://appsevolution.com.mx/email.php',{
        method:'POST',redirect:'error',signal:AbortSignal.timeout(10000),
        headers:sms?{Authorization:'Basic '+Buffer.from(`${env.LABSMOBILE_USERNAME}:${env.LABSMOBILE_API_TOKEN}`).toString('base64'),'Content-Type':'application/json',Accept:'application/json'}:{'Content-Type':'application/x-www-form-urlencoded'},
        body:JSON.stringify(sms?{message,recipient:[{msisdn:destination}],tpoa:env.LABSMOBILE_SENDER_ID||'RedCero',test:test?1:0}:{receiver:destination,subject:'Red Cero · Código de seguridad',message})
      });
      const body=await response.json();
      if(!response.ok||(sms?String(body.code)!=='0':body.response!==true))return 'failed';
      return sms&&test?'simulated':'sent';
    }catch{return 'failed';}
  };
}
