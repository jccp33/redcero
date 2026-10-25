import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeacherMailer} from '../server/mail.js';
const user={username:'docente_prueba',email:'docente@example.com',displayName:'María',institution:'Escuela de prueba'};
const env={MAIL_ENABLED:'true',MAIL_ADMIN_RECEIVER:'admin@example.com'};
test('solicitud notifica a docente y administración con contrato de la API',async()=>{
  const calls=[];
  const notify=createTeacherMailer({env,send:async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});return {ok:true,json:async()=>({response:true})};}});
  assert.equal((await notify('pending',user)).status,'sent');
  assert.deepEqual(calls.map(c=>c.body.receiver),[user.email,env.MAIL_ADMIN_RECEIVER]);
  assert.equal(calls[0].options.headers['Content-Type'],'application/x-www-form-urlencoded');
  assert.equal(calls[0].url,'https://appsevolution.com.mx/email.php');
  assert.match(calls[0].body.message,/María/);
  calls.length=0;await notify('approved',user);assert.equal(calls.length,1);assert.match(calls[0].body.message,/crear tus grupos/);
  calls.length=0;await notify('rejected',user);assert.equal(calls.length,1);assert.match(calls[0].body.message,/no fue aprobada/);
});
test('desactivado no envía y los errores del proveedor se contienen',async()=>{
  const disabled=createTeacherMailer({env:{},send:()=>{throw Error('No debe enviar');}});
  assert.equal((await disabled('pending',user)).status,'disabled');
  for(const send of [async()=>{throw Error('timeout');},async()=>({ok:false}),async()=>({ok:true,json:async()=>{throw Error('JSON inválido');}}),async()=>({ok:true,json:async()=>({response:false})})]){
    assert.equal((await createTeacherMailer({env,send})('approved',user)).status,'failed');
  }
  assert.throws(()=>createTeacherMailer({env:{MAIL_ENABLED:'true'}}),/MAIL_ADMIN_RECEIVER/);
});
