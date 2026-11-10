-- Illustrative PostgreSQL persistence, adapt to existing migrations.
CREATE TABLE game_rooms (
 id UUID PRIMARY KEY,
 host_player_id UUID NOT NULL,
 phase TEXT NOT NULL,
 version BIGINT NOT NULL DEFAULT 0,
 ruleset_version TEXT NOT NULL,
 snapshot JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE game_events (
 room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
 seq BIGINT NOT NULL,
 event_type TEXT NOT NULL,
 actor_id UUID,
 payload JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(room_id, seq)
);
CREATE TABLE command_idempotency (
 room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
 actor_id UUID NOT NULL,
 idempotency_key UUID NOT NULL,
 response JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(room_id, actor_id, idempotency_key)
);
CREATE INDEX game_events_created_idx ON game_events(created_at);
