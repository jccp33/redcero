import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import {randomBytes} from 'node:crypto';
if(process.env.NODE_ENV!=='development'||!['localhost','127.0.0.1'].includes(process.env.DB_HOST)||!process.env.DB_NAME?.endsWith('_dev'))throw new Error('Este asistente solo admite la base local de desarrollo');
const db=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
try{
  await db.beginTransaction();
  const alias='docente_local';const [existing]=await db.execute('SELECT id,global_role FROM users WHERE username=?',[alias]);let password=null,id;
  if(existing.length){if(existing[0].global_role!=='admin')throw new Error('El alias reservado ya existe con otro rol');id=existing[0].id;}
  else{password=randomBytes(15).toString('base64url');const [r]=await db.execute("INSERT INTO users (username,password_hash,global_role) VALUES (?,?,'admin')",[alias,await bcrypt.hash(password,12)]);id=r.insertId;}
  const [groups]=await db.execute('SELECT id FROM learning_groups WHERE name=? ORDER BY id LIMIT 1',['Piloto de desarrollo']);
  let groupId=groups[0]?.id;if(!groupId){const [r]=await db.execute('INSERT INTO learning_groups (name) VALUES (?)',['Piloto de desarrollo']);groupId=r.insertId;}
  await db.execute("INSERT IGNORE INTO group_members (group_id,user_id,member_role) VALUES (?,?,'teacher')",[groupId,id]);
  await db.execute("INSERT IGNORE INTO group_members (group_id,user_id,member_role) SELECT ?,id,'player' FROM users WHERE global_role='player' AND id NOT IN (SELECT user_id FROM teacher_requests)",[groupId]);
  await db.commit();
  console.log('Panel local: /docentes/ · alias: '+alias);
  console.log(password?'Contraseña inicial (solo se muestra esta vez): '+password:'Cuenta existente conservada. No se cambió su contraseña.');
  console.log('Grupo Piloto de desarrollo: jugadores actuales relacionados sin cambiar su avance.');
}catch(e){await db.rollback();console.error(e.code||e.message);process.exitCode=1;}finally{await db.end();}

