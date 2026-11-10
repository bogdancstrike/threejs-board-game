# Wilder — A Path of Mysteries

A playable Three.js browser board game built from `map-terrain.md`, `characters.md`, and `lighting.md`.

## Run

```bash
npm install
npm run dev
```

Open **http://localhost:7777**. Vite listens on `0.0.0.0:7777`, uses a strict port, and applies source changes through hot reload. The development server is already running in the implementation session.

```bash
npm run build       # Typecheck and build dist/
npm run preview -- --port 7778
npm test            # Deterministic rules, route, save and world tests
npm run test:e2e    # Actual Chromium/WebGL gameplay and rendering checks
```

Browser tests use Playwright Chromium. If unavailable, run `npx playwright install chromium`. WebGL 2 and hardware acceleration are required for the game. Browser tests use software WebGL for repeatable headless validation.

## Play

Choose **Adventurer** for a rotatable 3D preview, next/previous navigation, full-body/upper-body/close-up views, action previews, aura colors, and selection. Roll the die to travel along 93 tiles. The route rises through four chapters. Reach the final tile to win; an exact roll is unnecessary.

- **Mystery:** choose how an encounter unfolds. Some choices cost gold.
- **Treasure:** collect 3 gold.
- **Fortune:** collect 2 gold and a clue.
- **Portal:** travel 3 additional tiles.
- Bonus movement ends without triggering a second tile effect.
- Gold and clues record discoveries; they do not gate the finish.

**Settings** supports a new solo expedition or 2–4 local players taking turns on the same device, walking/running pace, and three graphics presets. Each player can select a different character. First arrival wins. **Journey** opens the progress, party member, inventory and journal drawer. The browser saves progress, character selection, aura colors, active turn and pending mystery. Choosing a different world or restarting asks for explicit confirmation before replacing the current save.

## Controls

| Input | Action |
|---|---|
| Drag | Orbit the island or character preview |
| Right-drag | Pan |
| Scroll / pinch | Zoom |
| Space | Roll the die |
| F | Find the active character |
| R | Reset the camera |
| Escape | Close an ordinary dialog |

Mystery dialogs require a choice. Sound starts muted and can be enabled in the header.

## Ten worlds

| World | Theme and destination |
|---|---|
| The Verdant Crown | Medieval village, woodland and Crownfall Castle |
| Dragonkind | Fourth Wing inspired dragon-rider academy, parapet, gauntlet, choosing and signet encounters |
| The Frostbound Passage | Snow, ice crystals and Winterglass Palace |
| Sands of the Oracle | Desert, palms, obelisks and stepped sun temple |
| Moonblossom Reach | Blossom trees, vermilion gates and mountain pagoda |
| Emberfall Caldera | Basalt, molten rivers and volcanic fortress |
| The Tideglass Isles | Palm groves, turquoise water and lighthouse |
| The Mycelium Hollow | Giant luminous mushrooms and fungal citadel |
| The Astral Observatory | Armillary spheres, celestial crystals and domed observatory |
| The Clockwork Citadel | Copper gardens, rotating gear and clock tower |

Worlds have deterministic route variations, distinct terrain/water/sky/vegetation palettes, four named regions, landmarks, and thematic encounter decks. They share the 93-tile rules. Dragonkind is an original fan-inspired setting, with no imported novel text or named novel characters.

## Implementation

- `src/game/data.ts`: twelve adult character identities, seeded generation, terrain elevations, ordered tiles, and base encounters.
- `src/game/maps.ts`: ten theme configurations, regions, and encounter decks.
- `src/game/engine.ts`: dice, bounds, effects, choices, turns, victory, validated saves.
- `src/world/world.ts`: sculpted floating island, four elevations, embedded weathered stones, tile-edge plants, river, falls, bridge, portal, windmill, scenery, clouds and batching.
- `src/world/landmarks.ts`: distinct destinations for each theme.
- `src/world/assets.ts`: shared assets/materials, source-model cache, normalized GLB characters and prototype figurines.
- `src/world/rig.ts`: approximate deforming rigs for static source figurines.
- `src/world/animation.ts`: idle, walk, run, rest, magic and celebration states.
- `src/world/scene.ts`: WebGL, orbit controls, movement across every intermediate tile, shared-tile offsets, lighting, bloom and preview.
- `src/main.ts`, `src/style.css`: responsive near-fullscreen board, controls, dialogs and persistence.

Lighting uses one shadow-casting directional light, hemisphere fill, a rim light, a limited portal light, emissive details, atmospheric fog and a coherent ACES/sRGB pipeline. Medium/Ultra enable controlled bloom; Low bypasses post-processing and shadows. Static scenery is batched by material, tiles use instancing and an atlas, pixel ratio is capped, hidden pages stop rendering, and the board pauses behind preview dialogs. Quality presets are practical options, not a measured 60 FPS guarantee on an unspecified GPU.

## Art status

Five characters and a bridge reuse GLBs supplied from `/home/bogdan/Downloads/3dmodels`. Seven roster characters use clearly labeled stylized prototype figurines. The imported models are adapted stand-ins and do not exactly match every written costume/hair specification. Authored animation clips, final facial animation, and production-quality skin weights for all twelve heroes remain an art-production task. Current movement and action poses are functional procedural animation, including approximate skin deformation for static GLBs.

See [asset integration and remaining art work](docs/ASSETS.md) and [third-party credits](public/ASSET-CREDITS.md). The initial folder contained design documents only, so there was no existing UI or game state implementation to preserve.
