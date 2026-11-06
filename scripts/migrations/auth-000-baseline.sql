-- ClimGuard · Auth Service (PostgreSQL, base climguard_auth) — ESQUEMA BASE (users, roles)
-- Solo para una base NUEVA con DB_SYNCHRONIZE=false (hasta ahora lo creaba TypeORM con synchronize).
-- Idempotente (CREATE … IF NOT EXISTS): en una base que ya tiene estas tablas no cambia nada.
-- Debe reflejar src/entities/{user,role}.entity.ts. Los roles/permisos los siembra el servicio al arrancar.
BEGIN;
CREATE TABLE IF NOT EXISTS roles (
    id          INTEGER PRIMARY KEY,           -- sin autoincremento: lo asigna el seed (1,2,3)
    name        VARCHAR(50) NOT NULL UNIQUE,
    permissions TEXT[]  NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(60)  NOT NULL,
    full_name     VARCHAR(200) NOT NULL,
    password_hash VARCHAR(300),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    role_id       INTEGER      NOT NULL REFERENCES roles(id),
    last_access   TIMESTAMPTZ,
    created_by    INTEGER,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_by    INTEGER,
    updated_at    TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username ON users (username);
COMMIT;
