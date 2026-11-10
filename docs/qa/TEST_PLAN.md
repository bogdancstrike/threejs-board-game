# Testing strategy
## Unit and property-based tests
- Tile config always includes 0..N-1 once, each world transform finite, quaternions normalized.
- State transition graph rejects invalid actions (roll when not turn, response after deadline).
- Idempotency same command yields exactly one event; concurrent roll submissions one succeeds.
- Event replay yields exact canonical state for any generated valid sequence; snapshots equivalent.
- Skip, disconnect, tie and finish edge conditions.

## Integration tests
- WS connect/auth/join/reconnect and backfill.
- Multiple backend tasks racing on same room transactional lock.
- Room restart with Postgres data persisted.
- Rule schema validation and change-pinned ruleset version.
- No room cross-talk / privilege leakage.

## Browser e2e
- 4 users join room, select unique characters, start match, roll through tile, complete challenge, next turn.
- Disconnect at ROLL and RESOLVING_TILE, rejoin from saved seq.
- Fast repeated clicks, wrong turn, malicious injected die value.
- UI pixel diffs outside map viewport, camera fit/orbit, mobile sidebar behavior.
- Asset download timeout -> visible nonblocking fallback; tabs hidden -> reduced animations.

## Visual/render testing
- Six golden camera views, all 93 tiles readable with their distinct symbols.
- Check pawn feet contact and path transitions for all adjacent tile edges.
- Sample white-hot emissive effects under bloom, inspect oversaturation.
- LOD transition flicker, z-fighting, shadow acne, alpha sorting, water seams.
- Profile draw calls, textures, GPU time at 1080p and 1440p, low/medium/ultra.

## Load/security
- 100 rooms x 4 players synthetic load first (not an unmeasured capacity claim).
- WS reconnect burst, database failure recovery, Redis unavailable if enabled.
- Client tampering, command replay, invalid room/token, huge packets, JSON schema fuzz.

## Release gates
All critical correctness tests green, no accidental UI regressions, performance targets measured and documented, asset license manifest complete, deploy rollback exercise successful.
