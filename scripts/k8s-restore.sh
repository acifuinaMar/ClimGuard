#!/usr/bin/env bash
# ClimGuard Fase 4 — restaura en K3s un respaldo de Fase 3 (Docker Compose) sin imprimir credenciales.
# Uso (en la VPS, como root):  bash scripts/k8s-restore.sh /opt/climguard-backups/<fecha>
# El directorio debe contener: climguard_{auth,community,alert}.dump (pg_dump -Fc), mongo.archive.gz
# (mongodump --archive --gzip) y ClimGuardSensor.bak (BACKUP DATABASE de SQL Server).
# Las credenciales se leen DENTRO de cada Pod desde sus variables de entorno (Secret climguard-secrets).
set -euo pipefail
B="${1:?uso: k8s-restore.sh <directorio de respaldo>}"
K="kubectl -n ${NS:-climguard}"
MIG=/opt/climguard/migrations

echo "== PostgreSQL"
for pair in climguard_auth:auth climguard_community:community climguard_alert:alert; do
  db=${pair%%:*}; role=${pair##*:}
  # Base destino recreada vacía (solo la de K3s): evita choques entre el esquema de init.sh y el del respaldo.
  $K exec postgres-0 -- psql -v ON_ERROR_STOP=1 -q -U postgres -d postgres \
     -c "DROP DATABASE IF EXISTS $db WITH (FORCE)" -c "CREATE DATABASE $db OWNER $role" \
     -c "REVOKE ALL ON DATABASE $db FROM PUBLIC"
  # --no-owner/--role: todos los objetos quedan del usuario del servicio.
  $K exec -i postgres-0 -- pg_restore -U postgres -d "$db" --no-owner --no-privileges \
     --role="$role" --exit-on-error < "$B/$db.dump"
  echo "   $db restaurada"
done
# Fase 4: completa external_identities y crea oauth_flows/oauth_login_codes (idempotente).
$K exec postgres-0 -- psql -v ON_ERROR_STOP=1 -q -U auth -d climguard_auth -f $MIG/auth-001-external-identities.sql
echo "   auth-001-external-identities aplicada"

echo "== MongoDB"
$K exec -i mongo-0 -- sh -c 'mongorestore --quiet -u root -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin \
   --archive --gzip --drop --nsExclude "admin.*" --nsExclude "config.*"' < "$B/mongo.archive.gz"
echo "   reports + audit restauradas"

echo "== SQL Server"
$K exec -i sqlserver-0 -- bash -c 'cat > /var/opt/mssql/data/restore.bak' < "$B/ClimGuardSensor.bak"
$K exec sqlserver-0 -- bash -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -Q \
  "IF DB_ID(N'"'"'ClimGuardSensor'"'"') IS NOT NULL ALTER DATABASE [ClimGuardSensor] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
   RESTORE DATABASE [ClimGuardSensor] FROM DISK=N'"'"'/var/opt/mssql/data/restore.bak'"'"' WITH REPLACE;
   ALTER DATABASE [ClimGuardSensor] SET MULTI_USER;" >/dev/null && rm -f /var/opt/mssql/data/restore.bak'
echo "   ClimGuardSensor restaurada"

echo "== Conteos"
$K exec postgres-0 -- psql -U postgres -d climguard_auth -Atc \
  "select 'auth.users', count(*) from users union all select 'auth.external_identities', count(*) from external_identities"
$K exec mongo-0 -- sh -c 'mongosh --quiet -u root -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "
  for (const d of [\"climguard_reports\",\"climguard_audit\"]) { const x=db.getSiblingDB(d);
    print(d, JSON.stringify(x.getCollectionNames().map(c=>c+\":\"+x[c].countDocuments()))) }"'
$K exec sqlserver-0 -- bash -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -h -1 -W -d ClimGuardSensor -Q \
  "SET NOCOUNT ON; SELECT t.name + '"'"': '"'"' + CAST(SUM(p.rows) AS varchar) FROM sys.tables t JOIN sys.partitions p ON p.object_id=t.object_id AND p.index_id IN (0,1) GROUP BY t.name ORDER BY t.name"'
