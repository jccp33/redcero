import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import {randomBytes,createHash} from 'node:crypto';
import {act,initialState,sites,missions} from '../server/sector-two-rules.js';

test('Sector 02 conserva estado ante acciones inválidas y exige proximidad y ocho conexiones',()=>{
  const s=initialState();
  for(const c of [{type:'move',dx:2,dy:0},{type:'adjust',site:'water',field:'ml',delta:1},{type:'activate',site:'gate'},{type:'activate',site:'__proto__'}])assert.equal(act(s,c).outcome,'retry');
  assert.equal(act({...s,...sites.gate},{type:'activate',site:'gate'}).state.complete,false);
  const local={...s,...sites.water};assert.equal(act(local,{type:'adjust',site:'water',field:'ml',delta:100}).outcome,'retry');assert.equal(local.controls.ml,0);
  assert.equal(act(local,{type:'adjust',site:'water',field:'shield',delta:1}).outcome,'retry');
});
function solution(key,m){return {route:()=>({segments:m.distance/m.scale,power:m.reserve*m.percent/100}),workshop:()=>({panels:m.panels,connectors:m.connectors,shield:m.budget-m.panels*m.panelCost-m.connectors*m.connectorCost}),water:()=>({ml:m.capacity*m.numerator/m.denominator}),shelter:()=>({width:m.width,height:m.height,edge:2*(m.width+m.height),tiles:m.width*m.height})}[key]();}
test('Sector 02 completo, dos variantes por sistema y ayudas registradas sin conceder progreso',()=>{
  let s=initialState();
  for(const key of Object.keys(missions)){
    s={...s,...sites[key]};const before=s.progress[key];s=act(s,{type:'hint',site:key}).state;assert.equal(s.progress[key],before);assert.equal(s.hints[key],1);
    for(const m of missions[key]){
      assert.equal(act(s,{type:'activate',site:key}).outcome,'retry');
      for(const [field,target]of Object.entries(solution(key,m)))while(s.controls[field]!==target){const result=act(s,{type:'adjust',site:key,field,delta:Math.sign(target-s.controls[field])});assert.equal(result.outcome,'accepted');s=result.state;}
      const result=act(s,{type:'activate',site:key});assert.equal(result.outcome,'accepted');s=result.state;
    }
    assert.equal(s.progress[key],2);assert.equal(act(s,{type:'activate',site:key}).outcome,'retry');
  }
  s={...s,...sites.gate};s=act(s,{type:'activate',site:'gate'}).state;assert.equal(s.complete,true);
});
test('API Sector 02: desbloqueo, carrera de versiones, persistencia, evidencia y Sector 01 intacto',async()=>{
  assert.equal(process.env.NODE_ENV,'development');assert.match(process.env.DB_NAME,/_dev$/);
  const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
  let id;const base=process.env.TEST_BASE_URL||'http://localhost:3000',token=randomBytes(32).toString('hex');
  const call=(path,body,auth=true)=>fetch(base+'/api/sector-two'+path,{method:body===undefined?'GET':'POST',headers:{Origin:base,'Content-Type':'application/json',...(auth?{Cookie:'rc_session='+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  try{
    const [r]=await db.execute("INSERT INTO users (username,password_hash,global_role) VALUES (?,?,'player')",['sector2_'+randomBytes(5).toString('hex'),'test-not-login']);id=r.insertId;
    await db.execute('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 1 HOUR))',[createHash('sha256').update(token).digest('hex'),id]);
    assert.equal((await call('',undefined,false)).status,401);assert.equal((await call('/start',{})).status,403);
    const old=JSON.stringify({complete:true,x:5,y:0,metal:3});await db.execute('INSERT INTO player_sectors (user_id,avatar_json,state_json,version) VALUES (?,?,?,93)',[id,JSON.stringify({suit:'cyan',helmet:'round',skin:'medium'}),old]);
    let data=await (await call('/start',{})).json();assert.equal(data.version,1);
    const concurrent=await Promise.all([call('/action',{type:'move',dx:1,dy:0,version:1}),call('/action',{type:'move',dx:1,dy:0,version:1})]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
    data=await (await call('')).json();
    const apply=async command=>{const r=await call('/action',{...command,version:data.version});assert.equal(r.status,200);data=await r.json();return data;};
    const travel=async key=>{const target=sites[key];while(data.state.x!==target.x)await apply({type:'move',dx:Math.sign(target.x-data.state.x),dy:0});while(data.state.y!==target.y)await apply({type:'move',dx:0,dy:Math.sign(target.y-data.state.y)});};
    for(const key of Object.keys(missions)){
      await travel(key);await apply({type:'hint',site:key});
      for(const m of missions[key]){
        for(const [field,target]of Object.entries(solution(key,m)))while(data.state.controls[field]!==target)await apply({type:'adjust',site:key,field,delta:Math.sign(target-data.state.controls[field])});
        await apply({type:'activate',site:key});
      }
    }
    await travel('gate');await apply({type:'activate',site:'gate'});assert.equal(data.state.complete,true);
    const restored=await (await call('/start',{})).json();assert.deepEqual(restored.state,data.state);assert.equal(restored.version,data.version);
    const [evidence]=await db.execute("SELECT COUNT(*) AS total FROM learning_evidence WHERE user_id=? AND action='hint'",[id]);assert.equal(evidence[0].total,4);
    const [legacy]=await db.execute('SELECT state_json,version FROM player_sectors WHERE user_id=?',[id]);assert.equal(legacy[0].state_json,old);assert.equal(Number(legacy[0].version),93);
  }finally{if(id)await db.execute('DELETE FROM users WHERE id=?',[id]);await db.end();}
});
