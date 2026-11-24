# Wilder: App Summary

Wilder is a browser-based fantasy board game that turns a tabletop-style adventure into an animated 3D diorama. Players choose an adventurer and one of 37 themed worlds, then roll dice and travel along a connected route through encounters, treasure, portals, challenges, and changing landscapes.

## Gameplay

- Play solo, pass-and-play with a local party, or join an online multiplayer room.
- Choose from twelve adventurers, each with a 3D preview, action animations, and cosmetic aura options.
- Explore worlds with distinct terrain, scenery, destinations, and encounter themes.
- Collect gold, clues, and points; resolve mysteries and special roadside encounters; and play mini-games.
- Save local journey progress, or use persistent online rooms for shared multiplayer games.
- Finish a classic race by reaching the destination first, or play a score expedition and compare points.

## Presentation and settings

The game is rendered with Three.js and includes animated characters and scenery, changing weather and atmospheric effects, and an original procedurally generated soundscape. Players can adjust graphics quality, lighting, camera and movement behavior, audio levels, and accessibility-related preferences. The responsive interface includes a title screen, world previews, character selection, configuration, journey progress, and in-game controls.

## Technology

The frontend is written in TypeScript and built with Vite. Game rules and rendering run in the browser; local play and saves are available without an online account. Online rooms use a FastAPI backend, WebSockets, and PostgreSQL for authoritative game state and persistence.
