# Game design document — original fantasy interpretation
## Principle
**This is not documentation of original Țapul Țicu game rules.** It is a proposed ruleset compatible with the user's existing 93-tile party board screenshot.

## Core loop
1. Active player requests roll; server verifies `AWAITING_ROLL`.
2. Server draws integer 1..6 using cryptographically secure RNG (or reproducible server seed stream logged with commitment strategy).
3. Movement is clamped to end condition; client animates each intermediate tile in order, following transform/elevation waypoints.
4. On landing, server resolves exactly one tile effect, including chained events with strict recursion/step cap (3).
5. If challenge/choice required, server transitions to `AWAITING_RESPONSE` with deadline; handles response or timeout.
6. Effects are applied, scores updated, `TURN_COMPLETED` logged, next eligible player begins.

## Game state machine
LOBBY -> CHARACTER_SELECTION -> READY -> ACTIVE_TURN -> FINISHED -> REMATCH/ARCHIVED.
ACTIVE_TURN child states: AWAITING_ROLL -> MOVING_VISUAL (authoritative position already decided) -> RESOLVING_TILE -> AWAITING_RESPONSE? -> TURN_COMPLETE.
Never trust the client's animation completion as a condition for authoritative state advancement; server can use bounded transition deadlines.

## Proposed tile mix (total 93)
- Normal: 38
- Event / surprise: 18
- Mini-challenge: 15
- Reward: 8
- Penalty: 7
- Choice: 4
- Special teleport/shortcut: 3
*Start tile index 0 is included within normal; last tile index 92 is finish metadata (overrides visual rendering but remains in category normal).* Mix is illustrative and configurable.

## Rule presets
- Classic race: first reaching tile 92 wins (exact roll optional, recommended no exact roll in MVP).
- Score race: winner by points after first player finishes and round closes.
- Party challenge mode: event difficulty set by host; opt-out supported; never require alcohol consumption.

## Example challenges (original)
- Rune Memory (sequence recall), Crystal Count (rapid observation), Mage's Choice (multiple choice), Bridge Balance (timing bar), Tavern Truth (opt-in social question), Portal Riddle (short puzzle), Lucky Forge (risk-reward selection), Forest Pattern (matching game), Bard's Rhythm (tap timing), Treasure Bluff (non-sensitive guessing).

## Balance / fairness
- Prevent repeated consecutive penalty cascades; hard cap on penalty severity.
- Keep event resolution mostly <30s; long challenges optional.
- A losing player should not be permanently locked out.
- Server uses schema-validated card content and timeouts.
- Avoid personal/sensitive prompts without explicit opt-in.

## Scoring / win
- Track authoritative tile index, points, rewards, penalties, completed challenge count.
- Use immutable event records with `seq` per room; derive recap from events.
- Define finish semantics before coding: exact roll vs clamp, tied finishes, bonus points, skipped turns, player departure.

## Anti-cheat and resilience
No client-supplied die value or direct score changes; every action requires room membership, active turn, expected version, and idempotency key. Same action retries return prior result, not a second roll.


## Wilder runtime extension · road adventures

The implemented Wilder rules for dragon-protected tiles, mystery boxes, dangers, dares, wards, hexes, camps, ten mini-games, score victory and solo/same-device/remote parties are defined in [ROAD_ADVENTURES](../specifications/ROAD_ADVENTURES.md). This later user-requested extension takes priority over conflicting historical Drink Up mechanics in this document. All setbacks are in-game, bounded and disclosed before accepting a risk.
