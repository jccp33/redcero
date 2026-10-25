import {randomInt} from 'node:crypto';
import {initialState as firstInitial} from './sector-rules.js';
import {initialState as secondInitial} from './sector-two-rules.js';

export function createSectorOneState(){
  const trails=[[1,3,5],[2,4,6],[3,5,7],[1,4,7],[2,5,8],[2,3,4]];
  const pulseTrail=trails[randomInt(trails.length)];
  return {...firstInitial(),pulse:pulseTrail[0],challenge:{schemaVersion:1,coolantTotal:[12,16,20][randomInt(3)],pulseTrail:[...pulseTrail]}};
}
const pools={route:[],workshop:[],water:[],shelter:[]};
for(const scale of [3,4,5])for(const segments of [3,4,5,6,7,8])for(const reserve of [20,24,32,40])for(const percent of [25,50,75])pools.route.push({distance:scale*segments,scale,reserve,percent});
for(const panels of [2,3,4])for(const connectors of [1,2,3])for(const panelCost of [2,4,5])for(const connectorCost of [2,3])for(const spare of [4,7,10])pools.workshop.push({panels,connectors,panelCost,connectorCost,budget:panels*panelCost+connectors*connectorCost+spare});
for(const capacity of [1000,1200,2000])for(const [numerator,denominator]of [[1,4],[1,2],[3,4]])pools.water.push({capacity,numerator,denominator});
for(const width of [2,3,4,5,6])for(const height of [2,3,4,5])pools.shelter.push({width,height});
export function createSectorTwoState(){
  const missions={};for(const [key,pool]of Object.entries(pools)){
    const first=randomInt(pool.length);let second=randomInt(pool.length-1);if(second>=first)second++;
    missions[key]=[structuredClone(pool[first]),structuredClone(pool[second])];
  }
  return {...secondInitial(),challengeVersion:1,missions};
}
