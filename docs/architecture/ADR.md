# Architecture decision records
## ADR-001 — Keep one authoritative FastAPI service (accepted for MVP)
Alternatives: client-authoritative pure static, Node WS backend, distributed game microservices. Choose FastAPI+Postgres transactional state. Pros: deterministic authorization, easier anti-cheat and recovery, matches engineering stack. Costs: server operations, state-sync latency. Revisit at proven large concurrency, not by default.

## ADR-002 — Preserve existing React UI (accepted)
Replace scene content only. Do not change sidebar, branding or layout. Use visual regression to enforce. Character selection can be an overlay, not a new shell.

## ADR-003 — Logical/visual separation (accepted)
Tile IDs/rules are independent of transforms and biome. Enables map changes without corrupting gameplay. Export validated map JSON. Avoid procedural-only layouts at runtime.

## ADR-004 — Handcrafted terrain + procedural decoration (accepted)
Manually composed four-layer island and tile route; deterministic vegetation scattering. All-procedural terrain risks unreadable tile path and broken world geometry.

## ADR-005 — WebGL-first unless existing project uses WebGPU (proposed)
WebGLRenderer broad support and known postprocessing; WebGPU/TSL optionally evaluated later. Use installed Three.js APIs only; no unconditional WebGPU promises.

## ADR-006 — Event-sourced turns with snapshots (proposed)
Append immutable events and update snapshot in same transaction. Benefits replay/reconnect/audit; cost is schema/version evolution. Maintain event upcasters and periodic snapshots.

## ADR-007 — No Kafka/Kubernetes/Keycloak requirement in MVP (accepted provisional)
Technology should fit workload; add Keycloak when accounts/SSO needed, Redis when multi-instance fanout justified, Kubernetes only if existing platform standards require it.

## ADR-008 — Original fantasy IP (accepted)
Nostalgia-inspired mechanics only; no copyrighted character likeness, art, sound, exact original text, or trademark use without license.
