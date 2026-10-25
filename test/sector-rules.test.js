import test from 'node:test';
import assert from 'node:assert/strict';
import {act,initialState,validAvatar,sites} from '../server/sector-rules.js';

test('avatar y límites: rechaza valores externos, saltos y acciones remotas',()=>{
  assert.ok(validAvatar({suit:'cyan',helmet:'round',skin:'medium'}));
  assert.ok(!validAvatar({suit:'unknown',helmet:'round',skin:'medium'}));
  const s=initialState();
  for(const command of [{type:'move',dx:20,dy:0},{type:'supply'},{type:'open'},{type:'flow',index:0,delta:1}])assert.equal(act(s,command).outcome,'retry');
  assert.equal(act({...s,x:6},{type:'move',dx:1,dy:0}).state.x,6);
});
test('recorrido completo conserva materiales y exige los mecanismos',()=>{
  let s=initialState();
  const at=key=>{s={...s,...sites[key]};};
  const apply=command=>{const result=act(s,command);s=result.state;return result;};
  at('hangar');assert.equal(apply({type:'open'}).outcome,'retry');
  at('supply');apply({type:'supply'});assert.equal(s.metal,6);
  assert.equal(apply({type:'supply'}).outcome,'retry');assert.equal(s.metal,6);
  at('bridge');apply({type:'build'});apply({type:'remove'});assert.equal(s.metal,6);
  for(let i=0;i<3;i++)apply({type:'build'});assert.equal(s.metal,3);assert.equal(s.bridge,3);
  assert.equal(apply({type:'build'}).outcome,'retry');
  at('coolant');assert.equal(apply({type:'flow',index:0,delta:-1}).outcome,'retry');
  for(let i=0;i<12;i++)apply({type:'flow',index:0,delta:1});
  assert.equal(apply({type:'flow',index:1,delta:1}).outcome,'retry');assert.ok(!s.coolant);
  for(let i=0;i<6;i++)apply({type:'flow',index:0,delta:-1});
  for(const index of [1,2])for(let i=0;i<3;i++)apply({type:'flow',index,delta:1});
  assert.ok(s.coolant);assert.deepEqual(s.flows,[6,3,3]);
  at('relay');assert.equal(apply({type:'transmit'}).outcome,'retry');
  for(let i=0;i<6;i++)apply({type:'pulse',delta:1});apply({type:'transmit'});assert.ok(s.relay);
  at('drone');assert.equal(apply({type:'drone',step:'return'}).outcome,'retry');
  for(const step of ['go','collect','return'])apply({type:'drone',step});assert.equal(s.drone,'done');
  at('hangar');apply({type:'open'});assert.ok(s.complete);
});

test('señales de ayuda requieren proximidad y no resuelven mecanismos ni gastan recursos',()=>{
  for(const site of Object.keys(sites)){
    const s={...initialState(),...sites[site]},before=structuredClone(s);
    const result=act(s,{type:'hint',site});assert.equal(result.outcome,'accepted');assert.ok(result.message);assert.deepEqual(result.state,before);assert.deepEqual(s,before);
  }
  assert.equal(act(initialState(),{type:'hint',site:'supply'}).outcome,'retry');
  assert.equal(act(initialState(),{type:'hint',site:'__proto__'}).outcome,'retry');
});
