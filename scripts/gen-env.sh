#!/usr/bin/env bash
# Genera .env con secretos aleatorios a partir de .env.example (no sobrescribe uno existente).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && { echo ".env ya existe; no se modifica."; exit 0; }
rnd() { openssl rand -hex "${1:-24}"; }
cp .env.example .env
sed -i \
  -e "s|^JWT_KEY=.*|JWT_KEY=$(rnd 32)|" \
  -e "s|^INTERNAL_API_KEY=.*|INTERNAL_API_KEY=$(rnd 24)|" \
  -e "s|^POSTGRES_SUPERUSER_PASSWORD=.*|POSTGRES_SUPERUSER_PASSWORD=$(rnd 16)|" \
  -e "s|^AUTH_DB_PASSWORD=.*|AUTH_DB_PASSWORD=$(rnd 16)|" \
  -e "s|^COMMUNITY_DB_PASSWORD=.*|COMMUNITY_DB_PASSWORD=$(rnd 16)|" \
  -e "s|^ALERT_DB_PASSWORD=.*|ALERT_DB_PASSWORD=$(rnd 16)|" \
  -e "s|^MSSQL_SA_PASSWORD=.*|MSSQL_SA_PASSWORD=Cg$(rnd 10)_A1x|" \
  -e "s|^MONGO_ROOT_PASSWORD=.*|MONGO_ROOT_PASSWORD=$(rnd 16)|" .env
echo ".env generado. Revísalo antes de levantar el stack."
