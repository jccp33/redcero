import test from 'node:test';
import assert from 'node:assert/strict';
import {createTeacherSms,normalizePhone} from '../server/sms.js';
const env={SMS_NOTIFICATIONS_ENABLED:'true',LABSMOBILE_USERNAME:'test',LABSMOBILE_API_TOKEN:'fake',SMS_ADMIN_PHONES:'5551234567',LABSMOBILE_TEST_MODE:'true'};
test('SMS normaliza México, usa Basic y distingue simulación de envío',async()=>{
  assert.equal(normalizePhone('555 123 4567'),'525551234567');assert.throws(()=>normalizePhone('abc'));
  let body;const send=async(url,options)=>{assert.equal(url,'https://api.labsmobile.com/json/send');assert.equal(options.headers.Authorization,'Basic '+Buffer.from('test:fake').toString('base64'));body=JSON.parse(options.body);return {ok:true,json:async()=>({code:'0',subid:'test-reference'})};};
  assert.equal((await createTeacherSms({env,send})('pending')).status,'simulated');assert.equal(body.test,1);assert.equal(body.tpoa,'RedCero');
  assert.equal((await createTeacherSms({env:{...env,LABSMOBILE_TEST_MODE:'false'},send})('pending')).status,'sent');assert.equal(body.test,0);
  assert.equal((await createTeacherSms({env,send})('approved')).status,'disabled');
});
test('SMS contiene rechazos, respuestas inválidas y fallos de red',async()=>{
  for(const send of [async()=>({ok:true,json:async()=>({code:'35'})}),async()=>{throw Error('network');},async()=>({ok:true,json:async()=>{throw Error('invalid JSON');}})])assert.equal((await createTeacherSms({env,send})('pending')).status,'failed');
  assert.equal((await createTeacherSms({env:{},send:()=>{throw Error('no enviar');}})('pending')).status,'disabled');
  assert.throws(()=>createTeacherSms({env:{SMS_NOTIFICATIONS_ENABLED:'true'}}),/Configura/);
});
