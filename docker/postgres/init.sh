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
# Se ejecuta COMO `auth` (dueño de la base; en PG15+ puede crear en `public`), así tablas,
# secuencias e índices nacen con dueño `auth`. Antes se usaba `REASSIGN OWNED BY postgres TO auth`,
# que en PostgreSQL 16 falla ("required by the database system") y abortaba la inicialización.
# (La rama fase4-correcciones-y-formularios corrigió lo mismo con `SET ROLE auth`; se conserva esta
#  variante porque es la que inicializó la base de producción en K3s. Ambas dejan el mismo resultado.)
psql -v ON_ERROR_STOP=1 \
  --username auth \
  --dbname climguard_auth \
  -f /opt/climguard/migrations/auth-000-baseline.sql

psql -v ON_ERROR_STOP=1 \
  --username auth \
  --dbname climguard_auth \
  -f /opt/climguard/migrations/auth-001-external-identities.sql
