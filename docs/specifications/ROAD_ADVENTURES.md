# Road adventures, mini-games and shared-device parties

Status: implemented 2026-11-10. This extends the v2 blueprint in response to the user's explicit request for a Python/FastAPI/PostgreSQL/WebSocket game, additional road dangers, and both remote and same-device multiplayer. Existing 93-tile routes, 30 map IDs, 12 heroes and offline Classic saves remain compatible.

## Play styles

- Solo Adventure: one named player, complete adventure rules, persistent server save.
- Same-device party: 2–8 named players take turns on one computer, phone or tablet. One room-scoped controller owns the seats. Each seat has a unique hero. The lobby permits character previews and selection for every seat. A handoff dialog identifies the next player. The host cannot use this permission in a remote room.
- Remote party: 1–8 browser sessions join by six-character code. Each session controls only its own character, readiness and active turn. The host controls world/start/rematch. Concurrent claims serialize through a PostgreSQL row lock and a unique database constraint.
- Offline Classic: original 1–4 local players, story encounters, browser save, no backend requirement. Expanded adventure mechanics run through the game server in both Solo Adventure and same-device parties.

## Road layout and priority

Seventeen authored stops appear on each world's existing route. Numbers below are the one-based numbers shown in the game; source IDs are one lower. Raised routes use their actual platform height. Dragon figures, boxes, danger stones, camp tents and magical shrines stand beside the path without occupying its center.

| Display tile | Category | Stop |
|---|---|---|
| 7 | Mystery box | Whispering mystery box |
| 12 | Danger | Crumbling crossing |
| 17 | Mini-game | Travelling arcade |
| 24 | Dare | Bard’s dare |
| 30 | Dragon | Guarded hoard |
| 34 | Protection | Warding shrine |
| 39 | Mystery box | Moonlit lockbox |
| 44 | Danger | Stormglass ravine |
| 49 | Mini-game | Runekeeper’s games |
| 54 | Curse | Mischievous hex |
| 60 | Dragon | Skywarden’s challenge |
| 65 | Dare | Lantern dare |
| 70 | Camp | Wayfarer’s camp |
| 75 | Mini-game | Final puzzle pavilion |
| 80 | Mystery box | Starfall coffer |
| 86 | Dragon | Elder at the gate |
| 90 | Danger | Last falling stones |

When adventures are enabled, landing on a new road stop resolves that encounter before the tile's Classic effect. A stop is visited once per player per expedition; revisits use the underlying Classic tile effect. Merely walking across a stop does not trigger it. Bonus movement does not trigger another encounter. The shared TypeScript catalogue is exported into backend JSON with `npm run catalogue`.

## Choices, rewards and setbacks

All outcomes are displayed before the player chooses a risk. Points, gold and position stay at or above zero. No player is eliminated and setbacks do not skip future turns.

| Encounter | Available actions and outcomes |
|---|---|
| Dragon guardian | Accept a mini-game trial: win **75 points, 4 gold, forward 2**; fail/forfeit/expire **back 3, lose up to 2 gold**. Alternatively pay **3 gold** or retreat **1 tile** safely. |
| Mystery box | Leave sealed, or open. Server draw: **50%** 4 gold +40 points; **25%** mimic loses up to 2 gold and 20 points; **25%** skill mini-game with normal rewards and no failure penalty. |
| Danger | Accept balance trial: win **50 points +2 gold**, fail/forfeit/expire **back 2 and lose up to 15 points**. Spend **1 clue** for safe passage or retreat **1 tile** instead. |
| Curse | Accept a trial for normal rewards, with a failed/forfeited/expired trial reducing the next move by **2, minimum 1**. Alternatively accept that next-roll hex for **1 clue +20 points**. |
| Dare | Six creative prompts: invent a dragon name, a backpack story, a victory pose, three imaginary creatures, a dragon speech, or a short spell. Self-reported attempt awards **25 points +1 gold**. A puzzle alternative and a no-penalty pass are always available. |
| Shrine | Choose **one ward** (maximum two) or **one clue +20 points**. |
| Camp | Recover **2 gold** and remove a pending hex, or receive a ward. |
| Mini-game pavilion | Play for **50 points +2 gold**, or pass without penalty. |

A ward absorbs one complete dragon, danger, failed hex-trial or mimic setback and is consumed. A voluntarily accepted hex applies as stated. Wards persist until used or a rematch. A hex modifies movement, not the displayed raw die; the journal records the reduced distance and clears the hex after that roll.

Unaccepted road decisions expire after 45 seconds with no penalty. Accepted mini-games have 30 seconds; dangerous trials apply their disclosed setback on failure, explicit forfeit or timeout. Ordinary puzzles and dares have no loss on passing. No physical risk, drinking, location access, camera or microphone is required by any dare. Attempts are deliberately self-reported rather than falsely described as server-verified.

## Ten mini-game types

| Game | Interaction | Server validation |
|---|---|---|
| Riddle | Choose an answer | Private answer index |
| Crystal count | Count symbols, choose total | Generated count and answer |
| Rune memory | Watch four runes for 4 seconds, repeat | No early answer; ordered rune sequence |
| Pattern | Complete a rune pattern | Answer index |
| Bridge balance | Stop a moving marker in a gold zone | Server receipt time and period, no client score/timing field |
| Bard’s rhythm | Four taps around a 700 ms beat | Server timestamps, each interval within ±220 ms |
| Arithmetic | Solve a merchant's total | Generated calculation |
| Mimic disguise | Spot the creature that differs | Answer index |
| Crystal maze | Click adjacent cells from start to star | Grid bounds, open cells, orthogonal steps, start/end, maximum 30 cells; rejects teleporting |
| Alchemy | Pick exactly 3 ingredients totaling 10 | Three valid indices and server-side sum; repeats allowed |

Choice answers and generated seeds stay private in canonical PostgreSQL snapshots and are stripped from public snapshots, WebSocket updates and event replay. Visual tasks necessarily expose their displayed clues; this is casual play, not a claim of cheat-proof competitive puzzles. Timing games use server receipt time, so network latency affects precision.

## Points and end conditions

Newly reached route progress awards 1 point per new maximum tile. Retreat/re-advance cannot farm progress points. Treasure grants 30 points, fortune grants 35, positive story gold awards 10 per gold and clues award 20 each. Mini-game and road rewards use the explicit values above. First arrival awards 100 finish points once.

Classic: first to tile 93 wins. Score: complete the current round once anyone arrives; highest points wins, then furthest tile, then earlier seat order. The victory dialog shows scores, and the host can request a rematch without losing names or unique hero claims. A rematch clears scores, items, wards, hexes, visited stops and readiness.

## Commands and persistence

`RESOLVE_ROAD {choice}` chooses only a key offered by the active encounter. `SUBMIT_CHALLENGE {answer}`, `CHALLENGE_TAP {}` and `SKIP_CHALLENGE {}` handle games. `SELECT_CHARACTER`, `SET_NAME` and `SET_READY` accept `playerId` only for a same-device host controlling its own party. Online callers cannot impersonate another seat. No command accepts dice, score or arbitrary reward fields.

Every mutation carries `expected_version` and a UUID `idempotency_key`. PostgreSQL commits state, event and command result atomically. Retry returns the recorded result rather than rolling twice. WebSockets broadcast the committed result; reload and reconnect restore pending encounters. Maps/previews and local Classic saves remain independent of room sessions.

## Acceptance

Automated coverage includes all encounter categories; success/failure/pass/ward outcomes; box probabilities via injected server RNG; unique heroes under simultaneous requests; same-device permission boundaries; bounded currencies; hex consumption; progress anti-farming; maze teleport rejection and a solvable route; alchemy; early-memory rejection; complete eight-player classic/score games; WebSocket Origin and ticket reuse; duplicate commands; two real browser sessions and same-device handoff.

Art remains a combination of supplied adapted models and explicit stylized props. Guardian markers are original small procedural dragons, not newly authored animated GLB creatures. Cross-device hardware performance and latency tolerance need broader device measurement.
