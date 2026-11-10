# Security, fairness and privacy threat model
## Threats / mitigations
- Forged dice / movement / score: server-authoritative RNG and event reducer, no direct client writes.
- Duplicate WS commands: idempotency per actor+room+command key, return prior result.
- Race conditions: row lock or optimistic version transaction, monotonic event sequence.
- Replay stale commands: bound token and expected_version, expired phase/deadline rejected.
- Room hijacking: unguessable join tokens, room-scoped access, host permission checks.
- WebSocket cross-origin: validate Origin and authentication at handshake, drop unauthenticated sockets.
- Arbitrary text in content: escape UI, validate lengths/schema, optional content moderation before publication.
- Asset supply chain: pinned package versions, SPDX license manifest, checksums and content-type/size validation.
- Denial-of-service: rate limit roll/joins/WS messages, connection heartbeats, inactive room expiry, max players.
- Sensitive event analytics: no personal prompt answers in logs; clear retention policy and delete flow.

## Guest model
Guest receives short-lived signed JWT/session with room membership and rotating reconnect credential; store hashed reconnect tokens server-side. Do not rely on client-local UUID alone as identity proof. Later Keycloak provides account identities, but room permissions remain separate.

## Content safety / party mode
A drinking-themed game can offer non-alcoholic substitutions, opt-out of social/physical challenges, adult gating where relevant, no coercive instructions or hazardous challenges, privacy-safe prompts and skip/replace actions that don't punish refusal.

## Secrets / deployment
TLS everywhere, secure cookie or bearer best practices, DB credentials in secret store/environment not git, lock dependency versions, health checks, migrations, regular DB backups and tested restore.
