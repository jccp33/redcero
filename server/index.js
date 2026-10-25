import {accountSecurityRouter,personalPhone} from './account-security.js';
import {sectorTwoRouter} from './sector-two.js';
import {addGroupJoin} from './group-access.js';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {sectorRouter} from './sector.js';
import {teacherRouter} from './teacher.js';
import {createTeacherNotifier} from './notifications.js';

const app = express();
const notifyTeacher=createTeacherNotifier();
const db = mysql.createPool({host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, connectionLimit: 5, timezone: 'Z'});
const origins = new Set((process.env.APP_ORIGINS || '').split(','));
const production = process.env.NODE_ENV === 'production';
const connectSources = production ? "'self'" : "'self' http://localhost:3000 http://127.0.0.1:3000 http://192.168.1.150:3000";
if (process.env.DB_USER === 'root' && (production || process.env.DB_ALLOW_LOCAL_ROOT !== 'true')) throw new Error('Root requiere excepción local explícita y no está permitido en producción');
const cookie = { httpOnly: true, sameSite: 'strict', secure: production, path: '/', maxAge: 12 * 60 * 60 * 1000 };
const hash = token => createHash('sha256').update(token).digest('hex');
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'same-origin', 'Content-Security-Policy': `default-src 'self'; style-src 'self'; script-src 'self'; connect-src ${connectSources}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`});
  const origin = req.get('origin');
  if (origin && !origins.has(origin)) return res.status(403).json({error:'Origen no autorizado.'});
  if (origin) res.set({'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials':'true', 'Vary':'Origin', 'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Allow-Methods':'GET, POST, OPTIONS'});
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  if (req.method === 'POST' && (!origin || !req.is('application/json'))) return res.status(403).json({error:'Solicitud no autorizada.'});
  next();
});
app.use(express.json({limit:'4kb'}));
app.use((req,res,next) => {
  if(req.method === 'POST' && (!req.body || Array.isArray(req.body) || typeof req.body !== 'object')) return res.status(400).json({error:'Solicitud inválida.'});
  next();
});
app.use(cookieParser());
app.use('/api', (req,res,next) => {res.set('Cache-Control','no-store'); next();});
const limiter = rateLimit({windowMs: 15 * 60 * 1000, limit: 30, standardHeaders:'draft-8', legacyHeaders:false, message:{error:'Demasiados intentos. Espera 15 minutos.'}});
const dummyHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
async function session(req,res,user) {
  const token = randomBytes(32).toString('hex');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [currentUser]=await conn.execute('SELECT password_hash FROM users WHERE id=? FOR UPDATE',[user.id]);
    if(!currentUser.length||(user.password_hash&&currentUser[0].password_hash!==user.password_hash)){const changed=new Error('Credenciales actualizadas');changed.code='AUTH_CHANGED';throw changed;}
    if (req.cookies.rc_session) await conn.execute('DELETE FROM auth_sessions WHERE token_hash = ?', [hash(req.cookies.rc_session)]);
    await conn.execute('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(), INTERVAL 12 HOUR))',[hash(token),user.id]);
    await conn.commit();
  } catch (error) {await conn.rollback(); throw error;} finally {conn.release();}
  res.cookie('rc_session',token,cookie);
  return {user:{id:user.id,username:user.username,role:user.global_role||'player'}};
}
app.get('/api/health',async (req,res) => {await db.query('SELECT 1'); res.json({status:'ok'});});
const registerAccount = (isTeacher=false) => async (req,res) => {
  const {username,password,email} = req.body;
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (normalizedEmail.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(normalizedEmail) || normalizedEmail.startsWith('.') || normalizedEmail.includes('..') || normalizedEmail.includes('.@')) return res.status(400).json({error:'Escribe un correo electrónico válido.'});
  if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,24}$/.test(username) || typeof password !== 'string' || password.length < 10) return res.status(400).json({error:'Usa un alias de 3–24 letras, números o guion bajo y una contraseña de al menos 10 caracteres.'});
  if (Buffer.byteLength(password,'utf8') > 72) return res.status(400).json({error:'Tu contraseña es demasiado larga. Prueba una más corta o usa menos símbolos.'});
  const displayName=typeof req.body.displayName==='string'?req.body.displayName.trim():'';
  const institution=typeof req.body.institution==='string'?req.body.institution.trim():'';
  if(isTeacher&&(!displayName||displayName.length>100||!institution||institution.length>150))return res.status(400).json({error:'Indica tu nombre (hasta 100 caracteres) y escuela o institución (hasta 150).'});
  let phone=null;if(req.body.phone!==undefined&&req.body.phone!==''){try{phone=personalPhone(req.body.phone);}catch(e){return res.status(400).json({error:e.message});}}
  const passwordHash = await bcrypt.hash(password,12);
  const connection=await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute("INSERT INTO users (username,email,password_hash,phone_e164,global_role) VALUES (?,?,?,?,'player')",[username,normalizedEmail,passwordHash,phone]);
    if(isTeacher)await connection.execute('INSERT INTO teacher_requests (user_id,display_name,institution) VALUES (?,?,?)',[result.insertId,displayName,institution]);
    await connection.commit();
    const account=await session(req,res,{id:result.insertId,username,password_hash:passwordHash});
    if(isTeacher)account.notification=await notifyTeacher('pending',{username,email:normalizedEmail,displayName,institution});
    res.status(201).json(account);
  } catch(error) {await connection.rollback();if(error.code === 'ER_DUP_ENTRY') return res.status(409).json({error:'El alias o correo ya están registrados. Inicia sesión o revisa tus datos.'}); throw error;}finally{connection.release();}
};
app.post('/api/auth/register',limiter,registerAccount());
app.post('/api/auth/teacher-register',limiter,registerAccount(true));
app.post('/api/auth/login', limiter, async (req,res) => {
  const {username,password} = req.body;
  if(typeof username !== 'string' || username.length > 24 || typeof password !== 'string' || Buffer.byteLength(password,'utf8') > 72) return res.status(400).json({error:'Revisa tu alias y contraseña.'});
  const [users] = await db.execute('SELECT id,username,password_hash,global_role FROM users WHERE username = ?',[username]);
  const valid = await bcrypt.compare(password, users[0]?.password_hash || dummyHash);
  if(!users.length || !valid) return res.status(401).json({error:'Alias o contraseña incorrectos.'});
  res.json(await session(req,res,users[0]));
});
app.get('/api/auth/me',async (req,res) => {
  const token = req.cookies.rc_session;
  if(!token) return res.status(401).json({error:'Inicia sesión para conectar.'});
  const [users] = await db.execute('SELECT u.id,u.username,u.global_role AS role FROM users u JOIN auth_sessions s ON s.user_id=u.id WHERE s.token_hash=? AND s.expires_at > UTC_TIMESTAMP()',[hash(token)]);
  if(!users.length) {res.clearCookie('rc_session',cookie); return res.status(401).json({error:'Tu sesión expiró. Vuelve a conectar.'});}
  res.json({user:users[0]});
});
app.post('/api/auth/logout',async (req,res) => {
  if(req.cookies.rc_session) await db.execute('DELETE FROM auth_sessions WHERE token_hash=?',[hash(req.cookies.rc_session)]);
  res.clearCookie('rc_session',cookie).json({ok:true});
});
const authenticatePlayer=async (req,res,next) => {
  if(!req.cookies.rc_session) return res.status(401).json({error:'Tu enlace expiró. Vuelve a iniciar sesión.'});
  const [rows]=await db.execute('SELECT user_id FROM auth_sessions WHERE token_hash=? AND expires_at>UTC_TIMESTAMP()',[hash(req.cookies.rc_session)]);
  if(!rows.length) return res.status(401).json({error:'Tu enlace expiró. Vuelve a iniciar sesión.'});
  req.playerId=rows[0].user_id;next();
};
app.use('/api/account',accountSecurityRouter(db,{cookie}));
app.use('/api/sector',sectorRouter(db,authenticatePlayer));
app.use('/api/sector-two',sectorTwoRouter(db,authenticatePlayer));
addGroupJoin(app,db,hash);
app.use('/api/teacher',teacherRouter(db,hash,notifyTeacher));
app.use('/api', (req,res) => res.status(404).json({error:'Ruta desconocida.'}));
app.get('/docentes/',(req,res) => res.sendFile(fileURLToPath(new URL('../docentes/index.html',import.meta.url))));
app.get('/',(req,res) => res.sendFile(fileURLToPath(new URL('../index.html',import.meta.url))));
app.use('/public',express.static(fileURLToPath(new URL('../public',import.meta.url))));
app.use((err,req,res,next) => {
  if(err.code==='AUTH_CHANGED')return res.status(401).json({error:'Tu contraseña cambió. Vuelve a iniciar sesión.'});
  if(err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(400).json({error:'Solicitud inválida.'});
  console.error('Error de solicitud:',err.code || err.name);
  res.status(503).json({error:'No se pudo completar la conexión. Intenta de nuevo.'});
});
await db.query('SELECT 1');
const server = app.listen(Number(process.env.PORT || 3000),process.env.HOST || '127.0.0.1',() => console.log(`Red Cero: http://localhost:${process.env.PORT || 3000}`));
for(const signal of ['SIGINT','SIGTERM']) process.on(signal,() => server.close(async () => {await db.end(); process.exit(0);}));
