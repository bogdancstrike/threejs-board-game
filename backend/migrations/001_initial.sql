CREATE TABLE IF NOT EXISTS rooms (
 id uuid PRIMARY KEY,
 code varchar(6) UNIQUE NOT NULL,
 snapshot jsonb NOT NULL,
 revision bigint NOT NULL,
 event_seq bigint NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS room_members (
 id uuid PRIMARY KEY,
 room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
 name varchar(24) NOT NULL,
 character_id varchar(32) NOT NULL,
 token_hash bytea UNIQUE NOT NULL,
 expires_at timestamptz NOT NULL DEFAULT now() + interval '12 hours',
 UNIQUE(room_id, character_id)
);
CREATE TABLE IF NOT EXISTS room_events (
 room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
 seq bigint NOT NULL,
 event_type varchar(48) NOT NULL,
 actor_id uuid,
 payload jsonb NOT NULL,
 snapshot jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(room_id,seq)
);
CREATE TABLE IF NOT EXISTS room_commands (
 room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
 actor_id uuid NOT NULL,
 command_id uuid NOT NULL,
 request_hash varchar(64) NOT NULL,
 response jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(room_id,actor_id,command_id)
);
CREATE INDEX IF NOT EXISTS rooms_updated ON rooms(updated_at);
CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY, applied_at timestamptz DEFAULT now());
INSERT INTO schema_migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
