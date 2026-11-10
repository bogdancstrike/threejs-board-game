# ADRs for incremental Wilder expansion

## ADR-001 Keep vanilla Three.js/TS/Vite, avoid migrating to React for visuals
**Status** Accepted for expansion. **Context** Existing app uses direct DOM + TypeScript and Three.js r180. **Decision** Maintain current stack and domain separation, add modular world builder; React only if a separately approved UI modernization is needed. **Consequences** No risky rewrite; existing preview & tests remain useful.

## ADR-002 Keep local multiplayer first, optional server later
**Status** Accepted for v2. **Context** Current `GameState` supports local 1–4 players; no network backend. **Decision** Keep local state / saves and current interaction. Optional separate future network feature with FastAPI WS, PostgreSQL and authoritative engine. **Consequences** Lower complexity and faster visual iteration; anti-cheat/network rooms not addressed by current version.

## ADR-003 Path-first world generator
**Status** Proposed. Protect tile `getTiles(map)` centers and tangent/height, then place rivers, terraces and decorations with collision constraints. Never deform route during island enlargement.

## ADR-004 Hero assets are licensed external inputs
**Status** Accepted. Never assume 12 production-ready models. Registry distinguishes `production`, `adapted`, `prototype`; later authored rigs replace placeholders without changing character IDs.

## ADR-005 World-local coordinates and origin rebasing only if measured necessary
**Status** Proposed. Expand from 19–27 extents toward 35–45, not infinite scale; normal float precision is adequate. Use a unified `WorldLayout` generator; avoid scene nesting scale hacks that break lighting/shadows.
