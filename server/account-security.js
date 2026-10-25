import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
import bcrypt from 'bcrypt';
import {randomBytes,randomInt,createHash} from 'node:crypto';
import {createAccountDelivery} from './account-delivery.js';

const digest=value=>createHash('sha256').update(value).digest('hex');
export function personalPhone(value){
  if(typeof value!=='string')throw Error('Escribe un celular válido de México.');
  const digits=value.trim().replace(/[+\s()-]/g,'');
  const phone=digits.length===10?'52'+digits:digits;
  if(!/^52[2-9]\d{9}$/.test(phone))throw Error('Escribe los 10 dígitos de tu celular de México, con lada 52 opcional.');
  return phone;
}
export const validPassword=value=>typeof value==='string'&&value.length>=10&&Buffer.byteLength(value,'utf8')<=72;
const maskPhone=value=>value?'+'+value.slice(0,2)+' ••• ••• '+value.slice(-4):null;
const generic='Si la cuenta tiene ese canal disponible, recibirás un código. Revisa también spam. Si no llega, espera antes de solicitar otro.';
export function accountSecurityRouter(db,{cookie,deliver=createAccountDelivery()}={}){
  const router=Router();
  const limiter=rateLimit({windowMs:15*60*1000,limit:20,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Demasiados intentos. Espera 15 minutos.'}});
  const fail=(res,message='El código no está disponible o ya venció. Solicita otro.')=>res.status(400).json({error:message});
  async function authenticated(req,res,next){
    const token=req.cookies.rc_session;if(!token)return res.status(401).json({error:'Inicia sesión para administrar tu cuenta.'});
    const [rows]=await db.execute('SELECT u.* FROM users u JOIN auth_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()',[digest(token)]);
    if(!rows.length)return res.status(401).json({error:'Tu sesión expiró. Vuelve a entrar.'});
    req.account=rows[0];next();
  }
  // Serialize issuance per account; cooldown applies across sessions and IPs.
  async function issue(user,purpose,channel,destination,token=randomBytes(32).toString('hex')){
    const code=String(randomInt(100000,1000000));
    const codeHash=await bcrypt.hash(code,12),conn=await db.getConnection();
    try{
      await conn.beginTransaction();const [current]=await conn.execute('SELECT password_hash,phone_e164,phone_verified_at,email FROM users WHERE id=? FOR UPDATE',[user.id]);
      if(!current.length||current[0].password_hash!==user.password_hash){await conn.rollback();return {status:'unavailable'};}
      if(purpose==='password_reset'&&(channel==='sms'?(!current[0].phone_verified_at||current[0].phone_e164!==destination):current[0].email!==destination)){await conn.rollback();return {status:'unavailable'};}
      const [recent]=await conn.execute('SELECT COUNT(*) AS total,COALESCE(SUM(created_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL 60 SECOND)),0) AS cooling FROM account_challenges WHERE user_id=? AND created_at>DATE_SUB(UTC_TIMESTAMP(),INTERVAL 1 HOUR)',[user.id]);
      if(Number(recent[0].total)>=5||Number(recent[0].cooling)>0){await conn.rollback();return {status:'limited'};}
      await conn.execute('UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE user_id=? AND purpose=? AND consumed_at IS NULL',[user.id,purpose]);
      await conn.execute('INSERT INTO account_challenges (token_hash,user_id,purpose,channel,destination,code_hash,credential_stamp,expires_at,created_at) VALUES (?,?,?,?,?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 15 MINUTE),UTC_TIMESTAMP(3))',[digest(token),user.id,purpose,channel,destination,codeHash,digest(user.password_hash)]);
      await conn.commit();
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
    const status=await deliver({channel,destination,code,purpose});
    if(status!=='sent')await db.execute('UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE token_hash=?',[digest(token)]);
    return {status,challenge:token};
  }
  router.get('/profile',authenticated,async(req,res)=>{
    const u=req.account;res.json({username:u.username,email:u.email,phone:u.phone_e164,phoneVerified:!!u.phone_verified_at});
  });
  router.post('/phone/request',limiter,authenticated,async(req,res)=>{
    if(typeof req.body.currentPassword!=='string'||Buffer.byteLength(req.body.currentPassword)>72||!await bcrypt.compare(req.body.currentPassword,req.account.password_hash))return fail(res,'Revisa tu contraseña actual.');
    let phone;try{phone=personalPhone(req.body.phone);}catch(e){return fail(res,e.message);}
    const result=await issue(req.account,'phone_verify','sms',phone);
    if(result.status==='limited')return res.status(429).json({error:'Espera un minuto entre códigos. Máximo cinco por hora.'});
    if(result.status!=='sent')return res.status(503).json({error:result.status==='simulated'?'El SMS está en modo de prueba. No se envió un código real.':'No pudimos enviar el código. Tu celular anterior y tu contraseña siguen vigentes.'});
    res.json({challenge:result.challenge,message:'Código enviado al celular '+maskPhone(phone)+'. Escribe los seis dígitos para verificarlo.'});
  });
  async function consume(req,res,purpose,apply){
    const {challenge,code}=req.body;
    if(typeof challenge!=='string'||!/^[a-f0-9]{64}$/.test(challenge)||typeof code!=='string'||!/^\d{6}$/.test(code))return fail(res);
    const [found]=await db.execute('SELECT user_id FROM account_challenges WHERE token_hash=?',[digest(challenge)]);
    if(!found.length||(purpose==='phone_verify'&&found[0].user_id!==req.account.id))return fail(res);
    const conn=await db.getConnection();
    try{
      await conn.beginTransaction();const [users]=await conn.execute('SELECT * FROM users WHERE id=? FOR UPDATE',[found[0].user_id]);
      const [rows]=await conn.execute('SELECT *,expires_at>UTC_TIMESTAMP(3) AS valid FROM account_challenges WHERE token_hash=? FOR UPDATE',[digest(challenge)]);
      const u=users[0],c=rows[0];
      if(!u||!c||c.purpose!==purpose||c.consumed_at||!c.valid||c.attempts>=5||c.credential_stamp!==digest(u.password_hash)||(purpose==='password_reset'&&(c.channel==='sms'?(!u.phone_verified_at||u.phone_e164!==c.destination):u.email!==c.destination))){await conn.rollback();return fail(res);}
      if(!await bcrypt.compare(code,c.code_hash)){await conn.execute('UPDATE account_challenges SET attempts=attempts+1 WHERE token_hash=?',[digest(challenge)]);await conn.commit();return fail(res);}
      await apply(conn,u,c);await conn.execute('UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE token_hash=?',[digest(challenge)]);await conn.commit();res.json({ok:true,message:purpose==='phone_verify'?'Celular verificado. Ya puedes usarlo para recuperar tu acceso.':'Contraseña actualizada. Inicia sesión con tu nueva clave.'});
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
  }
  router.post('/phone/verify',limiter,authenticated,(req,res)=>consume(req,res,'phone_verify',async(conn,u,c)=>{
    await conn.execute('UPDATE users SET phone_e164=?,phone_verified_at=UTC_TIMESTAMP(3) WHERE id=?',[c.destination,u.id]);
    await conn.execute("UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE user_id=? AND purpose='password_reset' AND consumed_at IS NULL",[u.id]);
  }));
  router.post('/phone/remove',limiter,authenticated,async(req,res)=>{
    if(typeof req.body.currentPassword!=='string'||Buffer.byteLength(req.body.currentPassword)>72||!await bcrypt.compare(req.body.currentPassword,req.account.password_hash))return fail(res,'Revisa tu contraseña actual.');
    const conn=await db.getConnection();try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT password_hash FROM users WHERE id=? FOR UPDATE',[req.account.id]);if(rows[0]?.password_hash!==req.account.password_hash){await conn.rollback();return fail(res,'Vuelve a iniciar sesión.');}await conn.execute('UPDATE users SET phone_e164=NULL,phone_verified_at=NULL WHERE id=?',[req.account.id]);await conn.execute('UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE user_id=? AND consumed_at IS NULL',[req.account.id]);await conn.commit();res.json({ok:true});}catch(e){await conn.rollback();throw e;}finally{conn.release();}
  });
  router.post('/password',limiter,authenticated,async(req,res)=>{
    const {currentPassword,newPassword,confirmPassword}=req.body;
    if(!validPassword(newPassword)||newPassword!==confirmPassword)return fail(res,'Usa al menos 10 caracteres, una clave de hasta 72 bytes y confirma la misma contraseña.');
    if(typeof currentPassword!=='string'||Buffer.byteLength(currentPassword)>72||!await bcrypt.compare(currentPassword,req.account.password_hash))return fail(res,'Revisa tu contraseña actual.');
    const passwordHash=await bcrypt.hash(newPassword,12),token=randomBytes(32).toString('hex'),conn=await db.getConnection();
    try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT password_hash FROM users WHERE id=? FOR UPDATE',[req.account.id]);if(rows[0]?.password_hash!==req.account.password_hash){await conn.rollback();return fail(res,'La cuenta cambió. Vuelve a iniciar sesión.');}
      await conn.execute('UPDATE users SET password_hash=? WHERE id=?',[passwordHash,req.account.id]);
      await conn.execute('DELETE FROM auth_sessions WHERE user_id=?',[req.account.id]);
      await conn.execute('UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE user_id=? AND consumed_at IS NULL',[req.account.id]);
      await conn.execute('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 12 HOUR))',[digest(token),req.account.id]);await conn.commit();res.cookie('rc_session',token,cookie).json({ok:true,message:'Contraseña cambiada. Tus otras sesiones se cerraron. Tu partida se conserva.'});
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
  });
  router.post('/recovery/request',limiter,async(req,res)=>{
    const {identifier,channel}=req.body;
    if(typeof identifier!=='string'||!identifier.trim()||identifier.length>254||!['sms','email'].includes(channel))return fail(res,'Indica tu alias o correo y elige un canal.');
    const [users]=await db.execute('SELECT * FROM users WHERE username=? OR email=?',[identifier.trim(),identifier.trim().toLowerCase()]);
    const challenge=randomBytes(32).toString('hex');
    res.json({challenge,message:generic});
    if(users.length===1){const u=users[0],destination=channel==='sms'?(u.phone_verified_at?u.phone_e164:null):u.email;if(destination)void issue(u,'password_reset',channel,destination,challenge).catch(()=>console.error('No se pudo preparar una recuperación de cuenta.'));}
  });
  router.post('/recovery/complete',limiter,async(req,res)=>{
    if(!validPassword(req.body.newPassword)||req.body.newPassword!==req.body.confirmPassword)return fail(res,'Usa al menos 10 caracteres, una clave de hasta 72 bytes y confirma la misma contraseña.');
    const passwordHash=await bcrypt.hash(req.body.newPassword,12);
    return consume(req,res,'password_reset',async(conn,u)=>{await conn.execute('UPDATE users SET password_hash=? WHERE id=?',[passwordHash,u.id]);await conn.execute('DELETE FROM auth_sessions WHERE user_id=?',[u.id]);await conn.execute('UPDATE account_challenges SET consumed_at=UTC_TIMESTAMP(3) WHERE user_id=? AND consumed_at IS NULL',[u.id]);});
  });
  return router;
}
