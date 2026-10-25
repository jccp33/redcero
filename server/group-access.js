import {randomBytes} from 'node:crypto';
import {rateLimit} from 'express-rate-limit';

export function addGroupAccess(router,db,hash,allowed){
  router.post('/groups/:id/invitation',async(req,res)=>{
    const id=Number(req.params.id);if(!await allowed(req,id))return res.status(404).json({error:'Grupo no disponible.'});
    const code=randomBytes(18).toString('base64url');
    await db.execute('INSERT INTO group_invites (group_id,token_hash,created_by,expires_at) VALUES (?,?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 7 DAY)) ON DUPLICATE KEY UPDATE token_hash=VALUES(token_hash),created_by=VALUES(created_by),expires_at=VALUES(expires_at)',[id,hash(code),req.teacher.id]);
    res.json({code,expiresInDays:7});
  });
  router.post('/groups/:id/revoke-invitation',async(req,res)=>{
    const id=Number(req.params.id);if(!await allowed(req,id))return res.status(404).json({error:'Grupo no disponible.'});
    await db.execute('DELETE FROM group_invites WHERE group_id=?',[id]);res.json({ok:true});
  });
  router.post('/groups/:id/remove-player',async(req,res)=>{
    const id=Number(req.params.id);if(!await allowed(req,id))return res.status(404).json({error:'Grupo no disponible.'});
    const userId=Number(req.body.userId);if(!Number.isSafeInteger(userId)||userId<1)return res.status(400).json({error:'Selecciona un estudiante.'});
    await db.execute("DELETE FROM group_members WHERE group_id=? AND user_id=? AND member_role='player'",[id,userId]);res.json({ok:true});
  });
}
export function addGroupJoin(app,db,hash){
  app.post('/api/groups/join',rateLimit({windowMs:60000,limit:10,standardHeaders:'draft-8',legacyHeaders:false}),async(req,res)=>{
    const token=req.cookies.rc_session;if(!token)return res.status(401).json({error:'Primero conecta tu cuenta.'});
    const [users]=await db.execute('SELECT u.id,u.global_role FROM users u JOIN auth_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()',[hash(token)]);
    if(!users.length)return res.status(401).json({error:'Vuelve a conectar tu cuenta.'});
    if(users[0].global_role!=='player')return res.status(403).json({error:'La invitación es para jugadores.'});
    const code=req.body.code;if(typeof code!=='string'||!/^[A-Za-z0-9_-]{24}$/.test(code))return res.status(400).json({error:'La invitación no está disponible. Pide una nueva.'});
    const conn=await db.getConnection();
    try{
      await conn.beginTransaction();
      const [invites]=await conn.execute("SELECT i.group_id,g.name FROM group_invites i JOIN learning_groups g ON g.id=i.group_id JOIN users u ON u.id=i.created_by WHERE i.token_hash=? AND i.expires_at>UTC_TIMESTAMP() AND (u.global_role='admin' OR (u.global_role='teacher' AND EXISTS (SELECT 1 FROM group_members m WHERE m.group_id=i.group_id AND m.user_id=u.id AND m.member_role='teacher'))) FOR UPDATE",[hash(code)]);
      if(!invites.length){await conn.rollback();return res.status(404).json({error:'La invitación no está disponible. Pide una nueva.'});}
      await conn.execute("INSERT IGNORE INTO group_members (group_id,user_id,member_role) VALUES (?,?,'player')",[invites[0].group_id,users[0].id]);
      await conn.commit();res.json({ok:true,name:invites[0].name});
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
  });
}
