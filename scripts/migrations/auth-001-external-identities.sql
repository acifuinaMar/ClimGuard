-- ClimGuard Fase 4 · Auth Service (PostgreSQL, base climguard_auth)
-- Identidades externas (Google/GitHub) + flujos y códigos temporales de OAuth.
-- ADITIVA e IDEMPOTENTE: no borra ni reescribe datos; se puede ejecutar varias veces.
-- Requiere que existan `users` y `roles` (Auth Service ya arrancado alguna vez, o auth-000-baseline.sql).
-- Aplicar con el usuario dueño de la base, p. ej.:
--   docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d climguard_auth < scripts/migrations/auth-001-external-identities.sql
BEGIN;

CREATE TABLE IF NOT EXISTS external_identities (
    id            SERIAL PRIMARY KEY,
    provider      VARCHAR(60)  NOT NULL,
    subject       VARCHAR(200) NOT NULL,
    user_id       INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Si la tabla ya existía (Fase 3, vacía), se completan las columnas nuevas.
ALTER TABLE external_identities ADD COLUMN IF NOT EXISTS email          VARCHAR(320);
ALTER TABLE external_identities ADD COLUMN IF NOT EXISTS email_verified BOOLEAN      NOT NULL DEFAULT FALSE;
ALTER TABLE external_identities ADD COLUMN IF NOT EXISTS display_name   VARCHAR(200);
ALTER TABLE external_identities ADD COLUMN IF NOT EXISTS avatar_url     VARCHAR(500);
ALTER TABLE external_identities ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ  NOT NULL DEFAULT now();
ALTER TABLE external_identities ADD COLUMN IF NOT EXISTS last_login_at  TIMESTAMPTZ;

-- Una identidad externa pertenece a UN solo usuario (nunca se identifica por correo).
CREATE UNIQUE INDEX IF NOT EXISTS uq_external_identities_provider_subject ON external_identities (provider, subject);
CREATE INDEX        IF NOT EXISTS ix_external_identities_user_id          ON external_identities (user_id);

-- Flujo de autorización en curso (state hasheado, nonce, PKCE verifier). Vida corta.
CREATE TABLE IF NOT EXISTS oauth_flows (
    state_hash    VARCHAR(64)  PRIMARY KEY,
    provider      VARCHAR(30)  NOT NULL,
    nonce         VARCHAR(100) NOT NULL,
    code_verifier VARCHAR(128) NOT NULL,
    binding_hash  VARCHAR(64)  NOT NULL,
    link_user_id  INTEGER,
    expires_at    TIMESTAMPTZ  NOT NULL,
    consumed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_oauth_flows_expires_at ON oauth_flows (expires_at);

-- Código temporal de un solo uso (hasheado) que se canjea por el JWT de ClimGuard.
CREATE TABLE IF NOT EXISTS oauth_login_codes (
    code_hash     VARCHAR(64)  PRIMARY KEY,
    user_id       INTEGER      NOT NULL,
    binding_hash  VARCHAR(64)  NOT NULL,
    expires_at    TIMESTAMPTZ  NOT NULL,
    consumed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_oauth_login_codes_expires_at ON oauth_login_codes (expires_at);

COMMIT;
