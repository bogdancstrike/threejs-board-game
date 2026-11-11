import {createServer} from 'vite';
import {mkdir,writeFile} from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try {
  const {MAPS}=await server.ssrLoadModule('/src/game/maps.ts');
  const {getTiles}=await server.ssrLoadModule('/src/game/data.ts');
  const {geography}=await server.ssrLoadModule('/src/game/geography.ts');
  const {SKY_ROUTES}=await server.ssrLoadModule('/src/game/layers.ts');
  const metrics=MAPS.map(map=>{
    const tiles=getTiles(map.id), axes=Object.fromEntries(['x','y','z'].map(axis=>[axis,{min:Math.min(...tiles.map(t=>t[axis])),max:Math.max(...tiles.map(t=>t[axis]))}]));
    const transitions=tiles.slice(1).map((tile,i)=>({from:i,to:i+1,distance:Math.hypot(tile.x-tiles[i].x,tile.y-tiles[i].y,tile.z-tiles[i].z),rise:tile.y-tiles[i].y}));
    return {id:map.id,name:map.name,tileCount:tiles.length,terrain:geography(map.id),routeBounds:axes,skyExcursions:SKY_ROUTES[map.id]||[],maxStepDistance:Math.max(...transitions.map(t=>t.distance)),maxStepRise:Math.max(...transitions.map(t=>Math.abs(t.rise))),transitions};
  });
  await mkdir('reports',{recursive:true});
  await writeFile('reports/map_metrics.json',JSON.stringify({generatedAt:new Date().toISOString(),description:'Deterministic route geometry, not a GPU performance benchmark.',maps:metrics},null,2)+'\n');
  console.log(`Recorded route bounds, every transition, terrain floors and sky excursions for ${metrics.length} maps.`);
} finally {await server.close();}
