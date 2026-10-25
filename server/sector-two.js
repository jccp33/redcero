import {Router} from 'express';
import {rateLimit} from 'express-rate-limit';
import {act,initialState,sites,missions} from './sector-two-rules.js';
export function sectorTwoRouter(db,authenticate){
  const router=Router();router.use(authenticate);
  router.use(rateLimit({windowMs:60000,limit:600,standardHeaders:'draft-8',legacyHeaders:false}));
  const read=row=>({state:JSON.parse(row.state_json),version:Number(row.version),sites,missions});
  router.use(async(req,res,next)=>{
    const [rows]=await db.execute('SELECT avatar_json,state_json FROM player_sectors WHERE user_id=?',[req.playerId]);
    if(!rows.length||!JSON.parse(rows[0].state_json).complete)return res.status(403).json({error:'Restaura el Sector 01 para abrir el enlace.'});
    req.avatar=JSON.parse(rows[0].avatar_json);next();
  });
  router.get('/',async(req,res)=>{
    const [rows]=await db.execute('SELECT * FROM player_sector_two WHERE user_id=?',[req.playerId]);
    res.json({...rows.length?read(rows[0]):{state:null,sites,missions},avatar:req.avatar});
  });
  router.post('/start',async(req,res)=>{
    await db.execute('INSERT IGNORE INTO player_sector_two (user_id,state_json) VALUES (?,?)',[req.playerId,JSON.stringify(initialState())]);
    const [rows]=await db.execute('SELECT * FROM player_sector_two WHERE user_id=?',[req.playerId]);res.json({...read(rows[0]),avatar:req.avatar});
  });
  router.post('/action',async(req,res)=>{
    const conn=await db.getConnection();
    try{await conn.beginTransaction();const [rows]=await conn.execute('SELECT * FROM player_sector_two WHERE user_id=? FOR UPDATE',[req.playerId]);
      if(!rows.length){await conn.rollback();return res.status(409).json({error:'Vuelve a entrar al puesto.'});}
      const row=rows[0];if(req.body.version!==Number(row.version)){await conn.rollback();return res.status(409).json({error:'Tu señal cambió. Recupera el último avance.'});}
      const before=JSON.parse(row.state_json),result=act(before,req.body);
      await conn.execute('UPDATE player_sector_two SET state_json=?,version=version+1,saved_at=UTC_TIMESTAMP(3) WHERE user_id=?',[JSON.stringify(result.state),req.playerId]);
      if(req.body.type!=='move')await conn.execute('INSERT INTO learning_evidence (user_id,level_key,mechanism_key,action,outcome,details_json) VALUES (?,?,?,?,?,?)',[req.playerId,'sector_02',String(req.body.site||'unknown').slice(0,24),String(req.body.type||'unknown').slice(0,32),result.outcome,JSON.stringify({schemaVersion:1,variant:before.progress[req.body.site]??null,field:typeof req.body.field==='string'?req.body.field.slice(0,24):null,before:before.controls,after:result.state.controls,hints:result.state.hints,progress:result.state.progress})]);
      await conn.commit();res.json({...read({...row,state_json:JSON.stringify(result.state),version:Number(row.version)+1}),avatar:req.avatar,message:result.message});
    }catch(e){await conn.rollback();throw e;}finally{conn.release();}
  });return router;
}
