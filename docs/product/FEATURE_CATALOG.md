# Prioritized feature catalog
|ID|Priority|Feature|Behavior / acceptance|
|---|---|---|---|
|F-01|P0|Create/join room|Unique room code, host sees roster|
|F-02|P0|Reconnect/resume|Join with secure token, same state restored|
|F-03|P0|Authoritative roll|One accepted roll per eligible turn, server RNG|
|F-04|P0|Turn engine|Explicit phases and legal command validation|
|F-05|P0|93 tile mapping|All tile IDs unique; transforms and path valid|
|F-06|P0|Elevation-aware pawns|Step path doesn't clip cliffs or bridges|
|F-07|P0|Tile effect dispatcher|Unrecognized effect fails safely, no corrupted match|
|F-08|P0|Rewards/penalties|Server applies bounded, logged effects|
|F-09|P0|Challenge modal|Time limit, answer, result, timeout all deterministic|
|F-10|P0|Character gallery|Select one among available roster, enforce uniqueness optionally|
|F-11|P0|Animated GLB pawn|Idle/move/celebrate fallback clips supported|
|F-12|P0|Camera orbit/fit|Existing camera controls preserved|
|F-13|P0|Lighting presets|Low/med/high and reduced-motion compatibility|
|F-14|P0|Scoreboard|Recomputed from event log or canonical state|
|F-15|P0|Finish/rematch|Deterministic winner and reset semantics|
|F-16|P0|Consent-safe challenges|Opt-out and non-alcoholic alternatives|
|F-17|P0|Localization|RO strings externalized, EN fallback|
|F-18|P0|Observability|Room lifecycle, latency, error rates|
|F-19|P1|Choice events|Multiple valid decisions with audit trail|
|F-20|P1|Teleport/trap tiles|Bounded moves with max chain depth|
|F-21|P1|Cosmetic outfits|Visual only, no stat advantage|
|F-22|P1|Preview closeups|Face/full-body/equipment camera presets|
|F-23|P1|Match recap|Turns, dice and highlights summary|
|F-24|P1|Minigame pack|At least 6 pluggable challenge types|
|F-25|P1|Unlockables|Non-pay-to-win cosmetics|
|F-26|P1|Host rule presets|Config validated before game start|
|F-27|P1|Narrated events|Optional, with mute/text fallback|
|F-28|P1|Map skins|Same logical path multiple world layouts|
|F-29|P2|Replay viewer|Pure events -> deterministic state projector|
|F-30|P2|UGC event editor|Schema validation, moderation, safe content|

## Feature flag principles
Use flags for risky independent modules (3d_map_v2, fantasy_pawns, challenge_pack_v2, enhanced_lighting, cosmetics, replays). Evaluate server-side for gameplay behavior; client-side flags only visual features. All flag changes audited; game sessions pin a ruleset version at start.
