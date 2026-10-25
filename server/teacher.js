import {addGroupAccess} from './group-access.js';
import {Router} from 'express';

const mechanisms=[['supply','Suministros',['supply']],['bridge','Pasarela',['build','remove']],['coolant','Refrigeración',['flow']],['relay','Antena',['pulse','transmit']],['drone','Dron',['drone']],['hangar','Hangar',['open']]];
function progress(row) {
  const s=row.state_json?JSON.parse(row.state_json):null;
  return {started:!!s,complete:!!s?.complete,systems:s?{supply:!!s.battery,bridge:s.bridge===3,coolant:!!s.coolant,relay:!!s.relay,drone:s.drone==='done',hangar:!!s.complete}:Object.fromEntries(mechanisms.map(([k])=>[k,false])),savedAt:row.saved_at};
}
export function teacherRouter(db,hash,notifyTeacher) {
  const router=Router();
  router.use(async(req,res,next)=>{
    const token=req.cookies.rc_session;
    if(!token)return res.status(401).json({error:'Inicia sesión con tu cuenta docente.'});
    const [users]=await db.execute('SELECT u.id,u.username,u.email,u.global_role FROM users u JOIN auth_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at>UTC_TIMESTAMP()',[hash(token)]);
    const user=users[0];if(!user)return res.status(401).json({error:'Tu sesión expiró.'});
    req.teacher=user;next();
  });
  router.get('/status',async(req,res)=>{
    const [rows]=await db.execute('SELECT display_name,institution,status,created_at,reviewed_at FROM teacher_requests WHERE user_id=?',[req.teacher.id]);
    res.json({user:{username:req.teacher.username,email:req.teacher.email,role:req.teacher.global_role},application:rows[0]||null});
  });
  router.post('/application',async(req,res)=>{
    if(req.teacher.global_role!=='player')return res.status(409).json({error:'Tu cuenta ya está habilitada.'});
    const name=typeof req.body.displayName==='string'?req.body.displayName.trim():'';
    const institution=typeof req.body.institution==='string'?req.body.institution.trim():'';
    if(!name||name.length>100||!institution||institution.length>150)return res.status(400).json({error:'Indica tu nombre y escuela o institución.'});
    try{await db.execute('INSERT INTO teacher_requests (user_id,display_name,institution) VALUES (?,?,?)',[req.teacher.id,name,institution]);
      const [users]=await db.execute('SELECT username,email FROM users WHERE id=?',[req.teacher.id]);
      const notification=await notifyTeacher('pending',{...users[0],displayName:name,institution});
      res.status(201).json({ok:true,notification});}catch(e){if(e.code==='ER_DUP_ENTRY')return res.status(409).json({error:'Tu cuenta ya tiene una solicitud. Consulta su estado.'});throw e;}
  });
  router.use((req,res,next)=>{if(!['teacher','admin'].includes(req.teacher.global_role))return res.status(403).json({error:'Esta sección requiere aprobación docente.'});next();});
  router.get('/applications',async(req,res)=>{
    if(req.teacher.global_role!=='admin')return res.status(403).json({error:'Solo administración revisa solicitudes.'});
    const offset=Math.max(0,Math.min(100000,Number.parseInt(req.query.offset,10)||0));
    const [rows]=await db.query(`SELECT r.user_id,u.username,u.email,r.display_name,r.institution,r.created_at FROM teacher_requests r JOIN users u ON u.id=r.user_id WHERE r.status='pending' ORDER BY r.created_at,r.user_id LIMIT 25 OFFSET ${offset}`);
    const [counts]=await db.query("SELECT COUNT(*) AS total FROM teacher_requests WHERE status='pending'");res.json({applications:rows,total:Number(counts[0].total),offset});
  });
  router.post('/applications/:id/review',async(req,res)=>{
    if(req.teacher.global_role!=='admin')return res.status(403).json({error:'Solo administración revisa solicitudes.'});
    const id=Number(req.params.id),decision=req.body.decision;
    if(!Number.isSafeInteger(id)||id<1||!['approved','rejected'].includes(decision))return res.status(400).json({error:'Revisión inválida.'});
    const conn=await db.getConnection();
    try{
      await conn.beginTransaction();const [rows]=await conn.execute('SELECT status FROM teacher_requests WHERE user_id=? FOR UPDATE',[id]);
      if(!rows.length||rows[0].status!=='pending'){await conn.rollback();return res.status(409).json({error:'La solicitud ya fue revisada o no está disponible.'});}
      const [users]=await conn.execute('SELECT global_role FROM users WHERE id=? FOR UPDATE',[id]);
      if(users[0].global_role!=='player'){await conn.rollback();return res.status(409).json({error:'El rol cambió. Revisa esta cuenta antes de continuar.'});}
      if(decision==='approved')await conn.execute("UPDATE users SET global_role='teacher' WHERE id=?",[id]);
      await conn.execute('UPDATE teacher_requests SET status=?,reviewed_at=UTC_TIMESTAMP(3),reviewed_by=? WHERE user_id=?',[decision,req.teacher.id,id]);
      const [recipients]=await conn.execute('SELECT u.username,u.email,r.display_name FROM users u JOIN teacher_requests r ON r.user_id=u.id WHERE u.id=?',[id]);
      await conn.commit();
      const notification=await notifyTeacher(decision,{...recipients[0],displayName:recipients[0].display_name});
      res.json({ok:true,notification});
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
  });
  async function allowed(req,groupId){
    if(!Number.isSafeInteger(groupId)||groupId<1)return false;
    const [rows]=req.teacher.global_role==='admin'?await db.execute('SELECT id FROM learning_groups WHERE id=?',[groupId]):await db.execute("SELECT group_id FROM group_members WHERE group_id=? AND user_id=? AND member_role='teacher'",[groupId,req.teacher.id]);return !!rows.length;
  }
  addGroupAccess(router,db,hash,allowed);
  router.get('/groups',async(req,res)=>{
    const [groups]=req.teacher.global_role==='admin'?await db.query('SELECT id,name FROM learning_groups ORDER BY name,id'):await db.execute("SELECT g.id,g.name FROM learning_groups g JOIN group_members m ON m.group_id=g.id WHERE m.user_id=? AND m.member_role='teacher' ORDER BY g.name,g.id",[req.teacher.id]);
    res.json({user:{username:req.teacher.username,email:req.teacher.email,role:req.teacher.global_role},groups});
  });
  router.post('/groups',async(req,res)=>{
    const name=typeof req.body.name==='string'?req.body.name.trim():'';
    if(!name||name.length>100)return res.status(400).json({error:'Escribe un nombre de grupo de hasta 100 caracteres.'});
    const conn=await db.getConnection();
    try{await conn.beginTransaction();const [result]=await conn.execute('INSERT INTO learning_groups (name) VALUES (?)',[name]);await conn.execute("INSERT INTO group_members (group_id,user_id,member_role) VALUES (?,?,'teacher')",[result.insertId,req.teacher.id]);await conn.commit();res.status(201).json({id:result.insertId,name});}catch(e){await conn.rollback();throw e;}finally{conn.release();}
  });
  router.post('/groups/:id/members',async(req,res)=>{
    if(req.teacher.global_role!=='admin')return res.status(403).json({error:'Solo administración puede asignar integrantes.'});
    const groupId=Number(req.params.id);if(!await allowed(req,groupId))return res.status(404).json({error:'Grupo no disponible.'});
    const identifier=typeof req.body.identifier==='string'?req.body.identifier.trim():'';
    const role=req.body.role;
    if(!identifier||identifier.length>254||!['player','teacher'].includes(role))return res.status(400).json({error:'Indica alias o correo y el tipo de integrante.'});
    const [users]=await db.execute('SELECT id,global_role FROM users WHERE username=? OR email=?',[identifier,identifier.toLowerCase()]);
    if(users.length!==1)return res.status(404).json({error:'No se encontró una cuenta única con esos datos.'});
    if(role==='teacher'&&!['teacher','admin'].includes(users[0].global_role))return res.status(400).json({error:'La cuenta debe habilitarse como docente mediante el procedimiento administrativo local.'});
    if(role==='player'&&users[0].global_role!=='player')return res.status(400).json({error:'Esta cuenta no es de jugador.'});
    await db.execute('INSERT INTO group_members (group_id,user_id,member_role) VALUES (?,?,?) ON DUPLICATE KEY UPDATE member_role=VALUES(member_role)',[groupId,users[0].id,role]);res.json({ok:true});
  });
  router.get('/students',async(req,res)=>{
    const groupId=Number(req.query.groupId);if(!await allowed(req,groupId))return res.status(404).json({error:'Grupo no disponible.'});
    const q=String(req.query.q||'').trim().slice(0,254).toLowerCase();
    const offset=Math.max(0,Math.min(100000,Number.parseInt(req.query.offset,10)||0));
    const filter="FROM group_members m JOIN users u ON u.id=m.user_id LEFT JOIN player_sectors p ON p.user_id=u.id WHERE m.group_id=? AND m.member_role='player'";
    const [all]=await db.execute(`SELECT p.state_json ${filter}`,[groupId]);
    const summary={total:all.length,started:0,complete:0};for(const row of all){const p=progress(row);if(p.started)summary.started++;if(p.complete)summary.complete++;}
    const search=" AND (?='' OR LOCATE(?,LOWER(u.username))>0 OR LOCATE(?,LOWER(COALESCE(u.email,'')))>0)";
    const args=[groupId,q,q,q];
    const [counts]=await db.execute(`SELECT COUNT(*) AS total ${filter}${search}`,args);
    const [rows]=await db.execute(`SELECT u.id,u.username,u.email,p.state_json,p.saved_at ${filter}${search} ORDER BY u.username,u.id LIMIT 25 OFFSET ${offset}`,args);
    res.json({summary,total:Number(counts[0].total),offset,students:rows.map(r=>({id:r.id,username:r.username,email:r.email,...progress(r)}))});
  });
  router.get('/students/:id',async(req,res)=>{
    const groupId=Number(req.query.groupId);if(!await allowed(req,groupId))return res.status(404).json({error:'Estudiante no disponible.'});
    const id=Number(req.params.id);if(!Number.isSafeInteger(id)||id<1)return res.status(404).json({error:'Estudiante no disponible.'});
    const [students]=await db.execute("SELECT u.id,u.username,u.email,p.state_json,p.saved_at FROM users u JOIN group_members m ON m.user_id=u.id LEFT JOIN player_sectors p ON p.user_id=u.id WHERE u.id=? AND m.group_id=? AND m.member_role='player'",[id,groupId]);
    if(!students.length)return res.status(404).json({error:'Estudiante no disponible.'});
    const [counts]=await db.execute('SELECT action,outcome,COUNT(*) AS total FROM sector_events WHERE user_id=? GROUP BY action,outcome',[id]);
    const offset=Math.max(0,Math.min(100000,Number.parseInt(req.query.offset,10)||0));
    const [events]=await db.execute(`SELECT id,action,outcome,created_at FROM sector_events WHERE user_id=? ORDER BY id DESC LIMIT 50 OFFSET ${offset}`,[id]);
    const student=students[0];const p=progress(student);
    const systems=mechanisms.map(([key,label,actions])=>({key,label,restored:p.systems[key],accepted:counts.filter(c=>actions.includes(c.action)&&c.outcome==='accepted').reduce((a,c)=>a+Number(c.total),0),retry:counts.filter(c=>actions.includes(c.action)&&c.outcome==='retry').reduce((a,c)=>a+Number(c.total),0)}));
    res.json({student:{id:student.id,username:student.username,email:student.email,...p},systems,events,totalEvents:counts.reduce((a,c)=>a+Number(c.total),0),offset});
  });
  return router;
}
