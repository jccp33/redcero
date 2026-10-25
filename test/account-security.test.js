import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cookieParser from 'cookie-parser';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import {randomBytes,createHash} from 'node:crypto';
import {accountSecurityRouter,personalPhone} from '../server/account-security.js';
import {createAccountDelivery} from '../server/account-delivery.js';

test('celulares mexicanos se normalizan y las APIs usan el destino personal',async()=>{
  assert.equal(personalPhone('(641) 123-4567'),'526411234567');assert.equal(personalPhone('+52 641 123 4567'),'526411234567');
  for(const value of ['abc','5264112345678','+1 555 123 4567',1234567890])assert.throws(()=>personalPhone(value));
  const calls=[],env={MAIL_ENABLED:'true',SMS_NOTIFICATIONS_ENABLED:'true',LABSMOBILE_USERNAME:'test',LABSMOBILE_API_TOKEN:'fake',LABSMOBILE_SENDER_ID:'RedCero',LABSMOBILE_TEST_MODE:'false'};
  const deliver=createAccountDelivery({env,send:async(url,options)=>{calls.push({url,options,body:JSON.parse(options.body)});return {ok:true,json:async()=>url.includes('labsmobile')?{code:'0'}:{response:true}};}});
  assert.equal(await deliver({channel:'email',destination:'personal@example.com',code:'123456',purpose:'password_reset'}),'sent');assert.equal(calls[0].body.receiver,'personal@example.com');
  assert.equal(await deliver({channel:'sms',destination:'526411234567',code:'123456',purpose:'phone_verify'}),'sent');assert.equal(calls[1].body.recipient[0].msisdn,'526411234567');assert.equal(calls[1].body.test,0);assert.match(calls[1].body.message,/123456/);
  assert.equal(await createAccountDelivery({env:{}})({channel:'email'}),'disabled');
  assert.equal(await createAccountDelivery({env,send:async()=>{throw Error('network');}})({channel:'sms'}),'failed');
});

test('cuenta: verifica celular, recupera por SMS/email, cambia contraseña y conserva partida',async()=>{
  assert.equal(process.env.NODE_ENV,'development');assert.match(process.env.DB_NAME,/_dev$/);
  const db=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,connectionLimit:4});
  const app=express(),deliveries=[],ids=[];app.use(express.json(),cookieParser());app.use('/account',accountSecurityRouter(db,{cookie:{httpOnly:true,sameSite:'strict',path:'/'},deliver:async message=>{deliveries.push(message);return 'sent';}}));app.use((e,req,res,next)=>{res.status(500).json({error:e.code||e.name});});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
  const digest=v=>createHash('sha256').update(v).digest('hex');let session,otherSession,id,alias;
  const mint=async userId=>{const token=randomBytes(32).toString('hex');await db.execute('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))',[digest(token),userId]);return 'rc_session='+token;};
  const call=(path,body,auth=session)=>fetch(base+'/account'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json',...(auth?{Cookie:auth}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const cooldown=()=>db.execute('UPDATE account_challenges SET created_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 2 MINUTE) WHERE user_id=?',[id]);
  const waitDelivery=async count=>{for(let i=0;i<40&&deliveries.length<count;i++)await new Promise(r=>setTimeout(r,50));assert.equal(deliveries.length,count);};
  const originalPassword=randomBytes(15).toString('hex'),newPassword=randomBytes(15).toString('hex');
  try{
    const passwordHash=await bcrypt.hash(originalPassword,12);alias='account_'+randomBytes(4).toString('hex');
    const [created]=await db.execute("INSERT INTO users (username,email,password_hash,global_role) VALUES (?,?,?,'player')",[alias,alias+'@example.com',passwordHash]);id=created.insertId;ids.push(id);
    const [other]=await db.execute("INSERT INTO users (username,password_hash,global_role) VALUES (?,?,'player')",[alias+'_other',passwordHash]);ids.push(other.insertId);
    session=await mint(id);otherSession=await mint(other.insertId);
    await db.execute('INSERT INTO player_sectors (user_id,avatar_json,state_json,version) VALUES (?,?,?,93)',[id,'{}','{"complete":true}']);
    assert.equal((await call('/profile',undefined,null)).status,401);
    assert.equal((await call('/phone/request',{phone:'6411234567',currentPassword:'wrong'})).status,400);
    let response=await call('/phone/request',{phone:'6411234567',currentPassword:originalPassword});assert.equal(response.status,200);const phoneChallenge=(await response.json()).challenge;assert.equal(deliveries[0].destination,'526411234567');
    assert.equal((await call('/phone/verify',{challenge:phoneChallenge,code:deliveries[0].code},otherSession)).status,400);
    assert.equal((await call('/phone/verify',{challenge:phoneChallenge,code:'000000'})).status,400);
    assert.equal((await call('/phone/verify',{challenge:phoneChallenge,code:deliveries[0].code})).status,200);
    assert.equal((await call('/phone/verify',{challenge:phoneChallenge,code:deliveries[0].code})).status,400);
    const profile=await (await call('/profile')).json();assert.equal(profile.phone,'526411234567');assert.equal(profile.phoneVerified,true);
    assert.equal((await call('/phone/request',{phone:'6411234567',currentPassword:originalPassword})).status,429);
    await cooldown();
    const recovery=await (await call('/recovery/request',{identifier:alias,channel:'sms'},null)).json();await waitDelivery(2);assert.equal(deliveries[1].destination,profile.phone);
    const unknown=await (await call('/recovery/request',{identifier:'absent_'+alias,channel:'sms'},null)).json();assert.equal(unknown.message,recovery.message);assert.equal(unknown.challenge.length,recovery.challenge.length);
    const raced=await Promise.all([call('/recovery/complete',{challenge:recovery.challenge,code:deliveries[1].code,newPassword,confirmPassword:newPassword},null),call('/recovery/complete',{challenge:recovery.challenge,code:deliveries[1].code,newPassword,confirmPassword:newPassword},null)]);assert.deepEqual(raced.map(r=>r.status).sort(),[200,400]);
    assert.equal((await call('/profile')).status,401);
    assert.equal((await call('/recovery/complete',{challenge:recovery.challenge,code:deliveries[1].code,newPassword,confirmPassword:newPassword},null)).status,400);
    session=await mint(id);const revoked=await mint(id);
    response=await call('/password',{currentPassword:newPassword,newPassword:originalPassword,confirmPassword:originalPassword});assert.equal(response.status,200);const renewed=response.headers.get('set-cookie').split(';')[0];
    assert.equal((await call('/profile',undefined,revoked)).status,401);session=renewed;assert.equal((await call('/profile')).status,200);
    await cooldown();const emailRecovery=await (await call('/recovery/request',{identifier:alias+'@example.com',channel:'email'},null)).json();await waitDelivery(3);assert.equal(deliveries[2].destination,alias+'@example.com');
    response=await call('/recovery/complete',{challenge:emailRecovery.challenge,code:deliveries[2].code,newPassword,confirmPassword:newPassword},null);assert.equal(response.status,200);
    session=await mint(id);assert.equal((await call('/phone/remove',{currentPassword:newPassword})).status,200);assert.equal((await (await call('/profile')).json()).phone,null);
    const [users]=await db.execute('SELECT password_hash FROM users WHERE id=?',[id]);assert.equal(await bcrypt.compare(newPassword,users[0].password_hash),true);
    const [saved]=await db.execute('SELECT state_json,version FROM player_sectors WHERE user_id=?',[id]);assert.equal(saved[0].state_json,'{"complete":true}');assert.equal(Number(saved[0].version),93);
  }finally{for(const userId of ids)await db.execute('DELETE FROM users WHERE id=?',[userId]);await new Promise(r=>server.close(r));await db.end();}
});

test('códigos fallidos/caducados/simulados no verifican teléfonos ni cambian claves',async()=>{
  assert.equal(process.env.NODE_ENV,'development');assert.match(process.env.DB_NAME,/_dev$/);
  const db=mysql.createPool({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
  const app=express(),deliveries=[];let status='failed';app.use(express.json(),cookieParser());app.use('/account',accountSecurityRouter(db,{deliver:async m=>{deliveries.push(m);return status;}}));
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;let id;
  const password=randomBytes(15).toString('hex'),token=randomBytes(32).toString('hex'),digest=v=>createHash('sha256').update(v).digest('hex');
  const call=(path,body)=>fetch(base+'/account'+path,{method:'POST',headers:{'Content-Type':'application/json',Cookie:'rc_session='+token},body:JSON.stringify(body)});
  try{
    const [created]=await db.execute("INSERT INTO users (username,password_hash,global_role) VALUES (?,?,'player')",['codes_'+randomBytes(4).toString('hex'),await bcrypt.hash(password,12)]);id=created.insertId;
    await db.execute('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))',[digest(token),id]);
    const request=()=>call('/phone/request',{phone:'6411234567',currentPassword:password});const cool=()=>db.execute('UPDATE account_challenges SET created_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 2 MINUTE) WHERE user_id=?',[id]);
    assert.equal((await request()).status,503);await cool();status='simulated';assert.equal((await request()).status,503);await cool();status='sent';
    let challenge=(await (await request()).json()).challenge;await db.execute('UPDATE account_challenges SET expires_at=DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 MINUTE) WHERE token_hash=?',[digest(challenge)]);
    assert.equal((await call('/phone/verify',{challenge,code:deliveries.at(-1).code})).status,400);
    await cool();challenge=(await (await request()).json()).challenge;
    for(let i=0;i<5;i++)assert.equal((await call('/phone/verify',{challenge,code:'000000'})).status,400);
    assert.equal((await call('/phone/verify',{challenge,code:deliveries.at(-1).code})).status,400);
    const [users]=await db.execute('SELECT phone_e164,phone_verified_at,password_hash FROM users WHERE id=?',[id]);assert.equal(users[0].phone_verified_at,null);assert.equal(users[0].phone_e164,null);assert.equal(await bcrypt.compare(password,users[0].password_hash),true);
  }finally{if(id)await db.execute('DELETE FROM users WHERE id=?',[id]);await new Promise(r=>server.close(r));await db.end();}
});
