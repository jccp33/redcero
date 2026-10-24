import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {randomBytes,createHash} from 'node:crypto';
import {initialState} from '../server/sector-rules.js';

test('panel docente restringe grupo, correo, detalle y administración',async()=>{
  assert.equal(process.env.NODE_ENV,'development');assert.match(process.env.DB_NAME,/_dev$/);
  const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
  const prefix=`panel_${randomBytes(4).toString('hex')}`;const ids=[],groups=[],cookies={};
  const base=process.env.TEST_BASE_URL||'http://localhost:3000';
  const req=(path,who,body)=>fetch(`${base}/api/teacher${path}`,{method:body===undefined?'GET':'POST',headers:{Origin:base,'Content-Type':'application/json',...(cookies[who]?{Cookie:cookies[who]}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  try{
    for(const [name,role]of [['teacher','teacher'],['other','teacher'],['admin','admin'],['student','player'],['outsider','player']]){
      const [r]=await db.execute('INSERT INTO users (username,email,password_hash,global_role) VALUES (?,?,?,?)',[`${prefix}_${name}`,`${prefix}_${name}@example.com`,'test-only-not-a-login-hash',role]);ids.push(r.insertId);
      const token=randomBytes(32).toString('hex');cookies[name]=`rc_session=${token}`;await db.execute('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))',[createHash('sha256').update(token).digest('hex'),r.insertId]);
    }
    for(const name of ['A','B']){const[r]=await db.execute('INSERT INTO learning_groups (name) VALUES (?)',[`${prefix} ${name}`]);groups.push(r.insertId);}
    for(const [g,u,role]of [[groups[0],ids[0],'teacher'],[groups[1],ids[1],'teacher'],[groups[0],ids[3],'player'],[groups[1],ids[4],'player']])await db.execute('INSERT INTO group_members (group_id,user_id,member_role) VALUES (?,?,?)',[g,u,role]);
    const state={...initialState(),battery:true,bridge:3,coolant:true,relay:true,drone:'done',complete:true};
    await db.execute('INSERT INTO player_sectors (user_id,avatar_json,state_json) VALUES (?,?,?)',[ids[3],'{}',JSON.stringify(state)]);
    for(const outcome of ['accepted','accepted','retry'])await db.execute("INSERT INTO sector_events (user_id,action,outcome) VALUES (?,'flow',?)",[ids[3],outcome]);
    assert.equal((await req('/groups')).status,401);
    assert.equal((await req('/groups','student')).status,403);
    const assigned=await (await req('/groups','teacher')).json();assert.deepEqual(assigned.groups.map(g=>g.id),[groups[0]]);
    assert.equal((await req(`/students?groupId=${groups[1]}`,'teacher')).status,404);
    const listing=await (await req(`/students?groupId=${groups[0]}&q=${prefix}_student%40example.com`,'teacher')).json();assert.equal(listing.students.length,1);assert.equal(listing.summary.complete,1);assert.equal(listing.students[0].email,`${prefix}_student@example.com`);
    const absent=await (await req(`/students?groupId=${groups[0]}&q=outsider`,'teacher')).json();assert.equal(absent.total,0);
    assert.equal((await req(`/students/${ids[4]}?groupId=${groups[0]}`,'teacher')).status,404);
    assert.equal((await req(`/students/${ids[3]}?groupId=${groups[0]}`,'other')).status,404);
    const detail=await (await req(`/students/${ids[3]}?groupId=${groups[0]}`,'teacher')).json();assert.equal(detail.student.complete,true);assert.equal(detail.systems.find(s=>s.key==='coolant').accepted,2);assert.equal(detail.systems.find(s=>s.key==='coolant').retry,1);assert.equal(detail.totalEvents,3);
    assert.ok(!Object.hasOwn(detail.student,'password_hash'));
    assert.equal((await req('/groups','teacher',{name:'No autorizado'})).status,403);
    assert.equal((await req(`/groups/${groups[0]}/members`,'teacher',{identifier:`${prefix}_outsider`,role:'player'})).status,403);
    assert.equal((await req(`/groups/${groups[0]}/members`,'admin',{identifier:`${prefix}_outsider`,role:'teacher'})).status,400);
    assert.equal((await req(`/groups/${groups[0]}/members`,'admin',{identifier:`${prefix}_outsider`,role:'player'})).status,200);
    const after=await (await req(`/students?groupId=${groups[0]}`,'teacher')).json();assert.equal(after.total,2);
    assert.equal((await req('/status')).status,401);
    const password=randomBytes(18).toString('hex');
    const register=body=>fetch(`${base}/api/auth/teacher-register`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const account={username:`${prefix}_new`,email:`${prefix}_new@example.com`,password,displayName:'Docente de prueba',institution:'Escuela de prueba',global_role:'admin',status:'approved'};
    assert.equal((await register({...account,institution:''})).status,400);
    const registered=await register(account);assert.equal(registered.status,201);const registeredBody=await registered.json();ids.push(registeredBody.user.id);cookies.applicant=registered.headers.get('set-cookie').split(';')[0];
    assert.equal((await register(account)).status,409);
    let status=await (await req('/status','applicant')).json();assert.equal(status.application.status,'pending');assert.equal(status.user.role,'player');
    assert.equal((await req('/groups','applicant')).status,403);
    assert.equal((await req('/applications','teacher')).status,403);
    assert.equal((await req(`/applications/${registeredBody.user.id}/review`,'applicant',{decision:'approved'})).status,403);
    assert.equal((await req(`/applications/${registeredBody.user.id}/review`,'teacher',{decision:'approved'})).status,403);
    assert.equal((await req(`/applications/${registeredBody.user.id}/review`,'admin',{decision:'approved'})).status,200);
    status=await (await req('/status','applicant')).json();assert.equal(status.user.role,'teacher');assert.equal(status.application.status,'approved');
    assert.deepEqual((await (await req('/groups','applicant')).json()).groups,[],'aprobación no asigna grupos');
    assert.equal((await req(`/students?groupId=${groups[0]}`,'applicant')).status,404);
    assert.equal((await req(`/applications/${registeredBody.user.id}/review`,'admin',{decision:'rejected'})).status,409);
    assert.equal((await req(`/groups/${groups[0]}/members`,'admin',{identifier:account.username,role:'teacher'})).status,200);
    assert.equal((await req(`/students?groupId=${groups[0]}`,'applicant')).status,200);
    assert.equal((await req('/application','outsider',{displayName:'Otro docente',institution:'Otra escuela'})).status,201);
    assert.equal((await req('/application','outsider',{displayName:'Otro docente',institution:'Otra escuela'})).status,409);
    assert.equal((await req(`/applications/${ids[4]}/review`,'admin',{decision:'rejected'})).status,200);
    assert.equal((await (await req('/status','outsider')).json()).application.status,'rejected');
    assert.equal((await req('/groups','outsider')).status,403);
    await db.execute("UPDATE users SET global_role='player' WHERE id=?",[ids[0]]);assert.equal((await req('/groups','teacher')).status,403,'revocar rol afecta la sesión actual');
  }finally{
    for(const id of groups)await db.execute('DELETE FROM learning_groups WHERE id=?',[id]);for(const id of ids)await db.execute('DELETE FROM users WHERE id=?',[id]);await db.end();
  }
});
