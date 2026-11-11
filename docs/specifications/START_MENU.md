# Start menu and session lifecycle

Implemented 2026-11-11. The title screen is the default entry point for desktop and phone browsers.

- **New game:** choose a featured world, then configure solo, same-device party, or an online room. Enter names, choose classic or score victory, and enable/disable road adventures. Characters remain unique within each party.
- **Continue journey:** enabled for a saved local journey or room session. Restores the current turn, pending encounter, challenge, or finished-game standings. Reloading returns to the title screen before resuming.
- **Settings:** independent music, ambience and effects volumes; audio toggle; graphics quality; walking/running preference. Local Classic party size is applied only when starting a new Classic journey.
- **World previews:** previous/next cycles through all 30 actual map thumbnails. Inspect a live orbitable 3D preview before choosing a world for New game.
- **How to play:** explains turn order, points, mysteries, road adventures and supported play styles.
- **Offline Classic:** available without the API; supports the original 1–4 local players. Adventure modes use FastAPI and PostgreSQL even on a single device.
- **Return to menu:** use the compass menu button or Wilder brand. Current local progress is saved. A moving hero completes its step before the menu can open.

The menu does not pause a live server room; this is stated on screen. Server deadlines remain authoritative. A new expedition from an existing room requires a deliberate New game choice, and the original room remains saved for its other players. Local Classic saves and room credentials use separate storage keys.

The title screen uses the existing 3D scene, with slow camera rotation and a responsive overlay. Reduced-motion preferences stop automatic rotation. On phones, menu content can scroll without widening the page; the game itself keeps its full-screen map.

When the host requests a rematch, all connected players return from the victory dialog to the lobby, with their names and hero claims retained and readiness reset.

Validation: `tests/e2e/menu.spec.ts`, `release-flows.spec.ts`, and `online.spec.ts` cover entry, preferences, previews, save restoration, completed games, rematches and returning to offline play.
