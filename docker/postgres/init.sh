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
