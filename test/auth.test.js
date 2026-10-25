import test from 'node:test';
import assert from 'node:assert/strict';
import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';

test('registro, acceso, persistencia y revocación de sesión',async () => {
  assert.equal(process.env.NODE_ENV,'development','Solo ejecutar en desarrollo');
  assert.match(process.env.DB_NAME, /_dev$/);
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const username = `test_${randomBytes(6).toString('hex')}`;
  const email = username + '@example.com';
  const password = randomBytes(18).toString('hex');
  const db = await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
  const send = (path,body,cookie,origin = base) => fetch(`${base}/api/auth/${path}`,{method: body === undefined ? 'GET' : 'POST',headers:{Origin:origin,'Content-Type':'application/json',...(cookie ? {Cookie:cookie} : {})},...(body === undefined ? {} : {body:JSON.stringify(body)})});
  try {
    assert.equal((await send('register',{username,email,password:'short'})).status,400);
    assert.equal((await send('register',{username,email,password:'🔐'.repeat(25)})).status,400);
    assert.equal((await send('register',{username,email,password},undefined,'https://unknown.invalid')).status,403);
    assert.equal((await send('register',{username,password})).status,400);
    assert.equal((await send('register',{username,email:'invalid',password})).status,400);
    assert.equal((await send('register',{username,email,password,phone:'invalid'})).status,400);
    const registration = await send('register',{username,email:'  ' + email.toUpperCase() + '  ',password,phone:'+52 641 123 4567',global_role:'admin'});
    assert.equal(registration.status,201);
    const cookie = registration.headers.get('set-cookie').split(';')[0];
    assert.match(registration.headers.get('set-cookie'),/HttpOnly/i);
    assert.match(registration.headers.get('set-cookie'),/SameSite=Strict/i);
    const [rows] = await db.execute('SELECT password_hash,global_role,email FROM users WHERE username=?',[username]);
    assert.match(rows[0].password_hash,/^\$2[aby]\$12\$/); assert.equal(rows[0].global_role,'player'); assert.equal(rows[0].email,email);
    assert.equal((await send('register',{username,email,password})).status,409);
    assert.equal((await send('login',{username,password:'incorrect-password'})).status,401);
    assert.equal((await send('me')).status,401);
    assert.equal((await (await send('me',undefined,cookie)).json()).user.username,username);
    const me = await (await send('me',undefined,cookie)).json();
    assert.equal(Object.hasOwn(me.user,'email'),false);assert.equal(Object.hasOwn(me.user,'phone_e164'),false);
    const [phones]=await db.execute('SELECT phone_e164,phone_verified_at FROM users WHERE username=?',[username]);assert.equal(phones[0].phone_e164,'526411234567');assert.equal(phones[0].phone_verified_at,null);
    assert.equal((await send('register',{username:username + 'x',email,password})).status,409);
    const login = await send('login',{username,password},cookie);
    assert.equal(login.status,200);
    const renewed = login.headers.get('set-cookie').split(';')[0];
    assert.equal((await send('me',undefined,cookie)).status,401,'token anterior revocado');
    assert.equal((await send('me',undefined,renewed)).status,200);
    const sectorSend=(path,body,cookie=renewed)=>fetch(`${base}/api/sector${path}`,{method:body===undefined?'GET':'POST',headers:{Origin:base,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
    assert.equal((await sectorSend('/',undefined,'')).status,401);
    assert.equal((await (await sectorSend('/')).json()).avatar,null);
    assert.equal((await sectorSend('/avatar',{suit:'invalid'})).status,400);
    const profile=await (await sectorSend('/avatar',{suit:'cyan',helmet:'round',skin:'medium'})).json();
    assert.equal(profile.state.x,0);
    assert.equal((await sectorSend('/action',{type:'move',dx:1,dy:0,version:profile.version-1})).status,409);
    const moved=await (await sectorSend('/action',{type:'move',dx:1,dy:0,version:profile.version})).json();
    assert.equal(moved.state.x,1);
    const denied=await (await sectorSend('/action',{type:'supply',version:moved.version})).json();
    assert.equal(denied.state.battery,false);
    const edited=await (await sectorSend('/avatar',{suit:'violet',helmet:'square',skin:'dark'})).json();
    assert.equal(edited.state.x,1,'editar avatar conserva progreso');
    assert.equal(edited.avatar.suit,'violet');
    assert.equal((await (await sectorSend('/')).json()).state.x,1,'progreso persistido');
    let game=edited;
    const play=async action=>{const response=await sectorSend('/action',{...action,version:game.version});assert.equal(response.status,200);game=await response.json();};
    const walk=async (x,y)=>{
      // Travel along row +1 to avoid the unrepaired bridge at (-1, 0).
      while(game.state.y!==1)await play({type:'move',dx:0,dy:Math.sign(1-game.state.y)});
      while(game.state.x!==x)await play({type:'move',dx:Math.sign(x-game.state.x),dy:0});
      while(game.state.y!==y)await play({type:'move',dx:0,dy:Math.sign(y-game.state.y)});
    };
    await walk(-3,2);const beforeHelp=structuredClone(game.state);await play({type:'hint',site:'supply'});assert.deepEqual(game.state,beforeHelp);const [helps]=await db.execute("SELECT COUNT(*) AS total FROM learning_evidence WHERE user_id=? AND action='hint' AND mechanism_key='supply'",[me.user.id]);assert.equal(helps[0].total,1);await play({type:'supply'});assert.equal(game.state.metal,6);
    await walk(-1,1);for(let i=0;i<3;i++)await play({type:'build'});
    await walk(2,2);for(const [index,count]of [[0,6],[1,3],[2,3]])for(let i=0;i<count;i++)await play({type:'flow',index,delta:1});
    await walk(3,-2);for(let i=0;i<6;i++)await play({type:'pulse',delta:1});await play({type:'transmit'});
    await walk(-3,-2);for(const step of ['go','collect','return'])await play({type:'drone',step});
    await walk(5,0);await play({type:'open'});assert.equal(game.state.complete,true,'sector completo por API');
    assert.equal((await (await sectorSend('/')).json()).state.complete,true,'final guardado');
    assert.equal((await send('logout',{},renewed)).status,200);
    assert.equal((await send('me',undefined,renewed)).status,401);
    assert.equal((await send('login',"invalid")).status,400);
  } finally {
    await db.execute('DELETE FROM users WHERE username IN (?,?)',[username,username + 'x']);
    await db.end();
  }
});

