#!/bin/bash
# Una base y un usuario por servicio: cada servicio solo puede ver SU base (§16/§17).
set -euo pipefail
create() {  # $1=db $2=user $3=password
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<SQL
CREATE ROLE $2 LOGIN PASSWORD '$3';
CREATE DATABASE $1 OWNER $2;
REVOKE ALL ON DATABASE $1 FROM PUBLIC;
SQL
}
create climguard_auth      auth      "$AUTH_DB_PASSWORD"
create climguard_community community "$COMMUNITY_DB_PASSWORD"
create climguard_alert     alert     "$ALERT_DB_PASSWORD"

# Inicializar el esquema de Auth Service en instalaciones nuevas.
# SET ROLE auth: las tablas, secuencias e índices se crean directamente con dueño `auth`.
# (No usar REASSIGN OWNED BY postgres: falla porque postgres es dueño de objetos del sistema.)
# psql ejecuta los -c/-f en orden y en la misma sesión, así que el SET ROLE aplica a ambos scripts.
psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname climguard_auth \
  -c "SET ROLE auth;" \
  -f /opt/climguard/migrations/auth-000-baseline.sql \
  -f /opt/climguard/migrations/auth-001-external-identities.sql
