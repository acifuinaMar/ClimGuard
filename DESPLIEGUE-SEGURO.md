# DESPLIEGUE-SEGURO (Docker Compose, proyecto `climguard3`)

No se ejecutó nada en el VPS. Todos los comandos usan `-p climguard3 -f docker-compose.yml` de forma explícita; ejecútelos desde la carpeta del proyecto desplegado (la que contiene `docker-compose.yml` y `.env`). **Nunca** use `down -v`, `--volumes`, `--remove-orphans` ni `system prune`.

Nombres verificados en `docker-compose.yml`: servicios `edge, frontend, gateway, auth-service, community-service, sensor-service, alert-service, report-service, audit-service, postgres, sqlserver, mongo`; volúmenes `pgdata, sqldata, mongodata` (se llamarán `climguard3_pgdata`, `climguard3_sqldata`, `climguard3_mongodata`); bases: PostgreSQL `climguard_alert` (usuario `alert`), SQL Server `ClimGuardSensor`, MongoDB `climguard_reports`. El compose no define `container_name` ni `name:`; por eso el nombre del proyecto depende de `-p`.

## 0. Comprobaciones previas (solo lectura)
```bash
cd /ruta/del/proyecto-desplegado
docker compose -p climguard3 -f docker-compose.yml ps
docker volume ls | grep climguard3          # deben existir climguard3_pgdata, climguard3_sqldata, climguard3_mongodata
docker compose -p climguard3 -f docker-compose.yml images
free -m; df -h /var/lib/docker
grep -E '^(REPORT_|SENSOR_MIGRATIONS|SIMULATOR_ENABLED|SEED_DEMO)' .env
```
**Si los volúmenes `climguard3_*` no aparecen, DETÉNGASE**: significa que el stack en ejecución usa otro nombre de proyecto y un `up` crearía volúmenes vacíos.

## 1. Respaldos (carpeta fuera del proyecto)
```bash
B=~/backups/climguard3/$(date +%F-%H%M); mkdir -p "$B"; cd /ruta/del/proyecto-desplegado
cp .env "$B/env.backup"; chmod 600 "$B/env.backup"

# PostgreSQL: todas las bases (auth, community, alert) y la de alertas en formato custom
docker compose -p climguard3 -f docker-compose.yml exec -T postgres pg_dumpall -U postgres > "$B/postgres_all.sql"
docker compose -p climguard3 -f docker-compose.yml exec -T postgres pg_dump -U postgres -d climguard_alert -Fc > "$B/climguard_alert.dump"
docker compose -p climguard3 -f docker-compose.yml exec -T postgres pg_restore --list < "$B/climguard_alert.dump" | head -5   # debe listar tablas

# SQL Server: el .bak se crea dentro del volumen, y se COPIA FUERA (un respaldo dentro del mismo volumen no protege contra perderlo)
docker compose -p climguard3 -f docker-compose.yml exec -T sqlserver bash -c "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"\$MSSQL_SA_PASSWORD\" -C -b -Q \"BACKUP DATABASE ClimGuardSensor TO DISK='/var/opt/mssql/data/ClimGuardSensor_prefase3.bak' WITH INIT, CHECKSUM\""
docker compose -p climguard3 -f docker-compose.yml exec -T sqlserver bash -c "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"\$MSSQL_SA_PASSWORD\" -C -b -Q \"RESTORE VERIFYONLY FROM DISK='/var/opt/mssql/data/ClimGuardSensor_prefase3.bak'\""
docker compose -p climguard3 -f docker-compose.yml cp sqlserver:/var/opt/mssql/data/ClimGuardSensor_prefase3.bak "$B/"

# MongoDB (reportes y auditoría). Verifique antes que la herramienta exista en la imagen: ... exec -T mongo mongodump --version
docker compose -p climguard3 -f docker-compose.yml exec -T mongo bash -c 'mongodump -u root -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive --gzip' > "$B/mongo.archive.gz"

ls -lh "$B"        # ningún archivo debe tener 0 bytes
```
Pase también `$B` a otra máquina o disco; el VPS es un único punto de fallo. (Estos comandos de respaldo NO se probaron; los de PostgreSQL y SQL Server usan binarios que están en las imágenes oficiales, confirme `mongodump --version`.)

## 2. Preparar la versión nueva
1. Descomprima `ClimGuard-Fase3-Corregido.zip` en una carpeta NUEVA y copie allí su `.env` real (el ZIP no trae secretos).
2. Compare `.env` con `.env.example`. Valores recomendados al inicio: `REPORT_MAX_ROWS=100`, `REPORT_ON_LIMIT=fail`, `REPORT_CONCURRENCY=1`, `REPORT_MAX_QUEUE=4`, `SENSOR_MIGRATIONS_AUTOAPPLY=true`.
3. Valide sin levantar nada: `docker compose -p climguard3 -f docker-compose.yml config -q && echo OK`.
4. Si usa otra carpeta, confirme que `docker compose -p climguard3 -f docker-compose.yml ps` desde la carpeta nueva ve los MISMOS contenedores y volúmenes del paso 0.

## 3. Orden de actualización (importa)
El frontend nuevo evalúa reglas con el campo `requiereRevision` que solo envía el backend nuevo: **primero alertas, luego frontend**.
```bash
cd /ruta/de/la-carpeta-nueva

# 3.1 Migración de PostgreSQL (aditiva). Sustituye al paso automático de Hibernate y deja las reglas como LEGADAS.
docker compose -p climguard3 -f docker-compose.yml exec -T postgres psql -U postgres -d climguard_alert -v ON_ERROR_STOP=1 < scripts/migrations/alert-001-rule-semantics.sql

# 3.2 Construir las imágenes (no toca los datos)
docker compose -p climguard3 -f docker-compose.yml build alert-service sensor-service report-service frontend

# 3.3 Alertas, sin recrear dependencias
docker compose -p climguard3 -f docker-compose.yml up -d --no-deps alert-service
docker compose -p climguard3 -f docker-compose.yml logs --tail=80 alert-service

# 3.4 Comprobar en la base: todas las reglas legadas y activas como antes
docker compose -p climguard3 -f docker-compose.yml exec -T postgres psql -U postgres -d climguard_alert -c "SELECT requiere_revision, activo, count(*) FROM regla_alerta GROUP BY 1,2"

# 3.5 Sensores (aplica SchemaUpgrades salvo SENSOR_MIGRATIONS_AUTOAPPLY=false; en ese caso ejecute antes sensor-001-origen.sql, ver 3.5b)
docker compose -p climguard3 -f docker-compose.yml up -d --no-deps sensor-service
docker compose -p climguard3 -f docker-compose.yml logs --tail=80 sensor-service

# 3.6 Reportes y frontend
docker compose -p climguard3 -f docker-compose.yml up -d --no-deps report-service
docker compose -p climguard3 -f docker-compose.yml up -d --no-deps frontend
docker compose -p climguard3 -f docker-compose.yml ps
```
3.5b (solo con `SENSOR_MIGRATIONS_AUTOAPPLY=false`): copie y ejecute el script antes de levantar el servicio:
```bash
docker compose -p climguard3 -f docker-compose.yml cp scripts/migrations/sensor-001-origen.sql sqlserver:/tmp/sensor-001-origen.sql
docker compose -p climguard3 -f docker-compose.yml exec -T sqlserver bash -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d ClimGuardSensor -b -i /tmp/sensor-001-origen.sql'
```

## 4. Verificación
```bash
docker compose -p climguard3 -f docker-compose.yml ps                         # todo healthy / Up
docker compose -p climguard3 -f docker-compose.yml exec -T sqlserver bash -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -d ClimGuardSensor -Q "SELECT Origen, COUNT(*) AS n FROM dbo.Sensor GROUP BY Origen"'
docker stats --no-stream
docker inspect -f '{{.State.OOMKilled}} {{.RestartCount}}' $(docker compose -p climguard3 -f docker-compose.yml ps -q report-service)
```
En la interfaz: Reglas (aviso de reglas con semántica anterior, todas siguen activas), Sensores (columna Origen), un reporte pequeño (≤ 100 filas) y uno que supere el tope (debe dar un error 422 claro, no un 502).
Prueba funcional de alertas: con un sensor FISICO de prueba, enviar una lectura que una regla legada considere fuera de rango y confirmar que se genera la alerta como antes.

## 5. Rollback
1. Código: volver a la carpeta anterior y repetir 3.2–3.6 desde ella (`up -d --no-deps` con el mismo `-p climguard3`).
2. Datos: las columnas nuevas no estorban a la versión anterior. **Pero** la versión anterior interpreta todas las reglas como rango normal: si ya convirtió/creó reglas con la semántica nueva, restaure `regla_alerta` (ver `MIGRACIONES.md` §2) antes de volver atrás.
3. Restauración completa solo si es imprescindible: `pg_restore -c -d climguard_alert` desde el `.dump`; `RESTORE DATABASE ClimGuardSensor` desde el `.bak`; `mongorestore --archive --gzip`. Detenga primero el servicio dueño de la base.
4. Restaure `.env` desde `env.backup`.
