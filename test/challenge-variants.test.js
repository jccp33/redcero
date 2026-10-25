import test from 'node:test';
import assert from 'node:assert/strict';
import {createSectorOneState,createSectorTwoState} from '../server/challenge-variants.js';
import {act as actOne,challengeFor,initialState as initialOne,sites as sitesOne} from '../server/sector-rules.js';
import {act as actTwo,missions,missionsFor,initialState as initialTwo,sites as sitesTwo} from '../server/sector-two-rules.js';

test('retos antiguos conservan parámetros y estados, sin sortear al leerlos',()=>{
  const first=initialOne(),second=initialTwo();const before=JSON.stringify({first,second});
  assert.deepEqual(challengeFor(first),{schemaVersion:0,coolantTotal:12,pulseTrail:[2,4,6]});assert.deepEqual(missionsFor(second),missions);
  assert.equal(JSON.stringify({first,second}),before);
});
test('variantes nuevas del Sector 01 son solubles y no obedecen objetivos enviados por cliente',()=>{
  for(let i=0;i<32;i++){
    let state=createSectorOneState();const cfg=structuredClone(state.challenge);assert.ok([12,16,20].includes(cfg.coolantTotal));
    state={...state,...sitesOne.coolant};for(const [index,n]of [[0,cfg.coolantTotal/2],[1,cfg.coolantTotal/4],[2,cfg.coolantTotal/4]])for(let j=0;j<n;j++)state=actOne(state,{type:'flow',index,delta:1,challenge:{coolantTotal:1}}).state;
    assert.equal(state.coolant,true);state={...state,...sitesOne.relay};const t=cfg.pulseTrail,target=t[2]+t[1]-t[0];while(state.pulse<target)state=actOne(state,{type:'pulse',delta:1}).state;
    state=actOne(state,{type:'transmit',target:999}).state;assert.equal(state.relay,true);assert.deepEqual(state.challenge,cfg);
  }
});
test('Sector 02 sortea dos situaciones distintas por sistema, dentro de controles y solubles',()=>{
  for(let i=0;i<24;i++){
    let state=createSectorTwoState();const assigned=structuredClone(state.missions);
    for(const key of Object.keys(assigned)){
      assert.notDeepEqual(assigned[key][0],assigned[key][1]);state={...state,...sitesTwo[key]};
      for(const m of assigned[key]){
        const solution={route:()=>({segments:m.distance/m.scale,power:m.reserve*m.percent/100}),workshop:()=>({panels:m.panels,connectors:m.connectors,shield:m.budget-m.panels*m.panelCost-m.connectors*m.connectorCost}),water:()=>({ml:m.capacity*m.numerator/m.denominator}),shelter:()=>({width:m.width,height:m.height,edge:2*(m.width+m.height),tiles:m.width*m.height})}[key]();
        for(const [field,target]of Object.entries(solution)){
          let steps=0;while(state.controls[field]!==target){assert.ok(++steps<100);const result=actTwo(state,{type:'adjust',site:key,field,delta:Math.sign(target-state.controls[field]),missions:{}});assert.equal(result.outcome,'accepted');state=result.state;}
        }
        const result=actTwo(state,{type:'activate',site:key});assert.equal(result.outcome,'accepted');state=result.state;
      }
    }
    assert.deepEqual(state.missions,assigned);state={...state,...sitesTwo.gate};assert.equal(actTwo(state,{type:'activate',site:'gate'}).state.complete,true);
  }
});
