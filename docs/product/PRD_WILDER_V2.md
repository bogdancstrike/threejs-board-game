# PRD — Wilder Expanded Fantasy Worlds v2

## Problem
The game already has ten 93-tile worlds, mechanics and imported art but the world experience should feel MUCH larger, more geographically rich, more vertically layered and character-focused, without losing the current elegant UI or performant web delivery.

## Target user
PC web players, local solo/2–4-player tabletop sessions, fantasy/anime art enthusiasts. User plays short turns but also freely explores the map camera, recognizes landmarks and chooses characters.

## Outcomes (measure against before snapshots)
- World footprint / scenic visible area visually 2–3× larger in flagship map, subject to actual route bounds and camera requirements.
- Every world has distinctive sculpted macroterrain silhouette and regional landmarks, not palette-only reskins.
- 93/93 tiles indexed, accessible and traversable per map.
- 0 changes to existing gameplay scores, turn rules, save schema and UI structure.
- Target 60 FPS Medium on documented reference desktop; lower settings for integrated GPU.
- 12 character selection works, with clear production-vs-prototype art fidelity labels.

## Must-have features
Path-first island sculpting, 4 height regions, 3D rock cliffs/underside, river-waterfall system, bridge geometry, clustered biomes, world landmarks, camera fit recalibration, consistent stylized PBR/toon materials, quality presets, automated screenshot regression, asset manifest/licensing.

## Should-have
Cinematic close-up region camera presets, atmospheric particles, region-specific NPC fauna, authored character animation polish, async staged loading and progressive detail.

## Could-have (later)
Networked multiplayer, user-generated maps, story chapters, dynamic day-night, character skins marketplace, more minigames, backend persistent account.

## Hard scope exclusions
UI redesign, engine rewrite, server migration, replacing 93 tiles, altering dice probabilities, licensing original Țapul Țicu art without permission.

## Release criteria
Ten maps still playable; no broken saved sessions; screenshots show distinctive improved shape; no tile clipping or camera occlusion; assets attributed; performance measured; no false claim that historic Țapul Țicu had these modern features.
