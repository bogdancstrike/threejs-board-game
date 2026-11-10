# Practical implementation roadmap (estimate in engineering phases, not calendar promises)
## Gate 0 — repo reconnaissance (must precede coding)
Inventory existing game code, UI screenshot, tile definition, game state, roll logic, camera implementation, render backend and deployed topology. Record preserved behavior; establish baseline screenshots and tests. Exit: data flow / component architecture documented and constraints known.

## Milestone 1 — deterministic game core
Implement/verify state machine, REST+WS contract, seeded tests for rolls, idempotency, events and persistence. Exit: browser-less simulated 1000-room games pass invariants, reconnect replay identical.

## Milestone 2 — 93-tile terrain graybox
Design four region terraces; export a world transform for each existing tile; validate clearance/elevation; animate proxy pawns across every adjacent pair; preserve UI. Exit: camera sees every tile; no clip or discontinuity.

## Milestone 3 — coherent environment
Add stylized cliffs, village, windmill, castle, portal, bridges, streams, trees and crystals, using licensed optimized GLB assets. Exit: art review and asset manifest accepted.

## Milestone 4 — lighting / animation
Create moonlight rig, soft shadows, emissive lanterns/crystals, bloom, fog, simple waterfall shaders and idle pawn loops. Exit: 60 FPS target on documented baseline at medium, no visibility regressions.

## Milestone 5 — character selection
Gallery cards, preview orbit/camera presets, 4 fully rigged playable characters, pawn LOD and selection. Exit: all four distinct/visible and survive reconnect.

## Milestone 6 — social challenge system
Event/choice/minigame modal, timers, options, scoring, timeout and skip flows, ruleset presets; localization. Exit: complete room lifecycle + challenge tests.

## Milestone 7 — production hardening
Accessibility, security, WS load, reconnect during turn, asset slow-load fallback, telemetry, deployment, backup/restore, rollback. Exit: release checklist and runbooks signed off.

## Phase 2
12-character roster, cosmetics, replay viewer, game skins, more minigame packs, editor and content controls.

## Dependencies / critical path
Repository audit -> frozen logical path -> ground mesh + tile transforms -> pawn traversal -> world details -> lighting -> performance -> character asset finalization. Avoid building the world around unverified tile coordinates.

## Staffing suggestion
One full-stack engineer can create functional MVP with temporary models; visually premium assets require dedicated 3D artist/technical artist or purchased licensed packs. Time varies chiefly with asset creation and original repo complexity.
