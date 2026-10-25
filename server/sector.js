import {createSectorOneState} from './challenge-variants.js';
import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
import {act,challengeFor,validAvatar,sites} from './sector-rules.js';

export function sectorRouter(db, authenticate) {
  const router=Router();
  router.use(authenticate);
  router.use(rateLimit({windowMs:60000,limit:600,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'Espera un momento antes de volver a moverte.'}}));
  const read = row => row ? {avatar:JSON.parse(row.avatar_json),state:JSON.parse(row.state_json),challenge:challengeFor(JSON.parse(row.state_json)),version:Number(row.version),sites} : {avatar:null,sites};
  router.get('/',async (req,res) => {
    const [rows]=await db.execute('SELECT * FROM player_sectors WHERE user_id=?',[req.playerId]);res.json(read(rows[0]));
  });
  router.post('/avatar',async (req,res) => {
    if(!validAvatar(req.body)) return res.status(400).json({error:'Elige un traje, un casco y un tono disponibles.'});
    const avatar={suit:req.body.suit,helmet:req.body.helmet,skin:req.body.skin};
    await db.execute('INSERT INTO player_sectors (user_id,avatar_json,state_json) VALUES (?,?,?) ON DUPLICATE KEY UPDATE avatar_json=VALUES(avatar_json)',[req.playerId,JSON.stringify(avatar),JSON.stringify(createSectorOneState())]);
    const [rows]=await db.execute('SELECT * FROM player_sectors WHERE user_id=?',[req.playerId]);res.json(read(rows[0]));
  });
  router.post('/action',async (req,res) => {
    const conn=await db.getConnection();
    try {
      await conn.beginTransaction();
      const [rows]=await conn.execute('SELECT * FROM player_sectors WHERE user_id=? FOR UPDATE',[req.playerId]);
      if(!rows.length) {await conn.rollback();return res.status(409).json({error:'Primero elige tu avatar.'});}
      const row=rows[0];
      if(req.body.version!==Number(row.version)) {await conn.rollback();return res.status(409).json({error:'Tu señal cambió. Vuelve a entrar al sector para recuperar el último avance.'});}
      const result=act(JSON.parse(row.state_json),req.body);
      await conn.execute('UPDATE player_sectors SET state_json=?,version=version+1,saved_at=UTC_TIMESTAMP(3) WHERE user_id=?',[JSON.stringify(result.state),req.playerId]);
      if(req.body.type!=='move') await conn.execute('INSERT INTO sector_events (user_id,action,outcome) VALUES (?,?,?)',[req.playerId,String(req.body.type||'unknown').slice(0,40),result.outcome]);
      if(req.body.type!=='move')await conn.execute('INSERT INTO learning_evidence (user_id,level_key,mechanism_key,action,outcome,details_json) VALUES (?,?,?,?,?,?)',[req.playerId,'sector_01',String(req.body.type==='hint'?req.body.site||'unknown':req.body.type||'unknown').slice(0,24),String(req.body.type||'unknown').slice(0,32),result.outcome,JSON.stringify({schemaVersion:1,assistance:req.body.type==='hint',before:JSON.parse(row.state_json),after:result.state})]);
      await conn.commit();
      res.json({...read({...row,state_json:JSON.stringify(result.state),version:Number(row.version)+1}),message:result.message});
    } catch(error) {await conn.rollback();throw error;} finally {conn.release();}
  });
  return router;
}
