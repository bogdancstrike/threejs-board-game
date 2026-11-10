"""Prepare the user-supplied CC-BY models; does not modify source files."""
import os, subprocess, json, struct
from pathlib import Path
source=Path('/home/bogdan/Downloads/3dmodels')
assets={
'purple-tree':'fantasy_tree_-_purple_leaves.glb',
'mushrooms':'colourful_mushrooms.glb',
'light-plant':'fantasy_light_plant.glb',
'fern':'fantasy_plant_2.glb',
'flowers':'crimson_cup_plants.glb',
'craftsman':'the_noble_craftsman.glb',
'warrior':'3drt_-_fantasy_warrior.glb',
'boutique':'dae_crib_-_fairys_magic_brew_boutique.glb',
'wizard-tower':'wizzard_tower.glb',
'castle':'wip_fantasy_castle.glb',
'tavern':'medieval_fantasy_tavern.glb',
'hut':'baba_yagas_hut.glb',
'whale':'whale_shark_fantasy.glb',
'phoenix':'phoenix_bird.glb',
'butterfly':'fantasy_butterfly_animation.glb',
'pet':'cute_fantasy_animal.glb',
'archer':'goblin_slayer_high_elf_archer.glb',
'demon-queen':'dark_fantasy_demon_queen.glb',
'dragon':'wrath_of_the_dragon.glb',
}
manifest=[]
for name,file in assets.items():
 target=Path('public/models/environment')/(name+'.glb')
 if not target.exists():
  result=subprocess.run(['npx','--yes','@gltf-transform/cli','optimize',str(source/file),str(target),'--compress','meshopt','--texture-size','1024','--texture-compress','webp','--simplify-ratio','0.6','--simplify-error','0.001','--instance','false'],capture_output=True,text=True)
  if result.returncode: print(name,'FAILED',result.stderr[-700:],flush=True);continue
 with open(source/file,'rb') as f:f.read(12);length,kind=struct.unpack('<II',f.read(8));doc=json.loads(f.read(length))
 meta=doc.get('asset',{}).get('extras',{})
 manifest.append({'id':name,'sourceFile':file,'url':'/models/environment/'+name+'.glb',**meta,'bytes':target.stat().st_size,'changes':'Textures resized to 1024px and encoded as WebP; geometry simplified with 0.001 extent error tolerance and compressed with Meshopt; redundant meshes/materials merged; runtime scale normalization and animation.'})
 print(name,round((source/file).stat().st_size/1e6,2),'->',round(target.stat().st_size/1e6,2),'MB',flush=True)
Path('public/models/environment/manifest.json').write_text(json.dumps(manifest,indent=2))
credits=Path('public/ASSET-CREDITS.md');base=credits.read_text().split('\n# Additional environment and character assets')[0]
with open(credits,'w') as f:
 f.write(base+'\n# Additional environment and character assets\n\n')
 for a in manifest:
  f.write('## '+a['id']+'\n\n- Original title: '+a.get('title','')+'\n- Creator: '+a.get('author','')+'\n- Source: '+a.get('source','')+'\n- License: '+a.get('license','')+'\n- Changes: '+a['changes']+'\n\n')
