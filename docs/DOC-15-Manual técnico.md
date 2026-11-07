# ClimGuard
## Manual Técnico e Instalación

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Manual Técnico e Instalación |
| Código | DOC-15 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 – 2.0 | Agosto – octubre 2026 | Instalación del monolito de la Fase 2 (API .NET, `appsettings.json`, script `QueryMain_P2.sql`, Docker Compose). |
| 3.0 | Noviembre 2026 | Reescrito para ClimGuard 4.1: microservicios, OAuth, sensores físicos, migraciones, despliegue en K3s, seguridad, operación y recuperación. |

---

# Tabla de contenido
1. [Introducción](#1-introducción)
2. [Arquitectura en resumen](#2-arquitectura-en-resumen)
3. [Requisitos](#3-requisitos)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Configuración (variables de entorno)](#5-configuración-variables-de-entorno)
6. [Instalación local con Docker Compose](#6-instalación-local-con-docker-compose)
7. [Configuración de Google y GitHub (OAuth)](#7-configuración-de-google-y-github-oauth)
8. [Sensores físicos (ESP8266)](#8-sensores-físicos-esp8266)
9. [Bases de datos y migraciones](#9-bases-de-datos-y-migraciones)
10. [Despliegue en producción (K3s)](#10-despliegue-en-producción-k3s)
11. [Operación](#11-operación)
12. [Seguridad](#12-seguridad)
13. [Respaldo y recuperación](#13-respaldo-y-recuperación)
14. [Pruebas e integración continua](#14-pruebas-e-integración-continua)
15. [Solución de problemas](#15-solución-de-problemas)

---

# 1. Introducción
Este manual explica cómo instalar, configurar, desplegar, operar y recuperar ClimGuard 4.1. Está dirigido a quien administre el sistema o continúe su desarrollo. El uso funcional de las pantallas está en el [DOC-14 Manual de usuario](DOC-14-Manual%20de%20usuario.md).

# 2. Arquitectura en resumen
| Componente | Imagen / contexto de build | Puerto interno | Base de datos |
|---|---|---|---|
| frontend | `frontend/climguard-web` | 80 | — |
| gateway | `services/gateway` | 8080 | — |
| auth-service | `services/auth` | 3000 | PostgreSQL `climguard_auth` |
| community-service | `services/community` | 8080 | PostgreSQL `climguard_community` |
| sensor-service | `services/sensor` | 8080 | SQL Server `ClimGuardSensor` |
| alert-service | `services/alert` | 8080 | PostgreSQL `climguard_alert` |
| report-service | `services/report` | 8000 | MongoDB `climguard_reports` |
| audit-service | `services/audit` | 8000 | MongoDB `climguard_audit` |
| postgres / sqlserver / mongo | `postgres:16-alpine`, `mcr.microsoft.com/mssql/server:2022-latest`, `mongo:7` | 5432 / 1433 / 27017 | — |

Diagramas y decisiones: [DOC-13 Arquitectura](DOC-13-Arquitectura%20de%20Software.md). Rutas: [DOC-12 API](DOC-12-API.md).

# 3. Requisitos

## Desarrollo local
| Software | Versión | Para |
|---|---|---|
| Docker + Docker Compose v2 | reciente | Levantar el stack completo |
| Bash y OpenSSL | — | `scripts/gen-env.sh`, `scripts/gen-certs.sh` (en Windows: Git Bash) |
| Git | — | Control de versiones |
| Node.js 22, Python 3.12, JDK 21, .NET SDK 10 | opcionales | Ejecutar pruebas y builds fuera de Docker |

Hardware: unos 6 GB de RAM libres para el stack completo (SQL Server reserva hasta 1,5 GB) y 15 GB de disco para imágenes.

## Producción (configuración actual)
VPS Linux Ubuntu 22.04 con 4 vCPU, 8 GB de RAM y 50 GB de disco; K3s; nginx y certbot en el host; dominio con registro DNS apuntando a la VPS. Se recomienda un archivo de intercambio (swap) de 4 GB como margen ante picos de memoria.

# 4. Estructura del repositorio
| Ruta | Contenido |
|---|---|
| `frontend/climguard-web/` | Aplicación Angular ([README](../frontend/climguard-web/README.md)) |
| `services/` | Gateway y microservicios ([README](../services/README.md)) |
| `docker-compose.yml` | Stack completo para desarrollo |
| `docker-compose.oauth.yml` | Agrega salida a Internet **solo** al auth-service (necesaria para OAuth) |
| `docker/postgres/init.sh` | Crea las tres bases de PostgreSQL, sus usuarios y el esquema inicial de Auth |
| `nginx/edge.conf.template` | Borde HTTPS de Docker Compose (frontend en `/`, gateway en `/api` y `/hubs`) |
| `k8s/` | Manifiestos de producción generados y [guía de operación](../k8s/README.md) |
| `scripts/gen-env.sh`, `gen-certs.sh` | Generan `.env` con secretos aleatorios y un certificado autofirmado |
| `scripts/gen-k8s.py` | Genera los manifiestos de K3s |
| `scripts/k8s-secrets.sh`, `k8s-restore.sh`, `rollback-fase3.sh` | Secret de Kubernetes, restauración de respaldos, vuelta a la Fase 3 |
| `scripts/migrations/` | Scripts SQL ([MIGRACIONES.md](MIGRACIONES.md)) |
| `scripts/test-all.sh` | Pruebas de Report, Audit, Auth, Alert y sintaxis YAML |

# 5. Configuración (variables de entorno)
Toda la configuración entra por variables de entorno. En desarrollo vienen de `.env` (plantilla: `.env.example`, generada con `bash scripts/gen-env.sh`); en producción, del ConfigMap `climguard-config` (valores no secretos) y del Secret `climguard-secrets` (secretos). **`.env` nunca se versiona.**

| Variable | Secreta | Descripción |
|---|:-:|---|
| `JWT_KEY` | ✔ | Clave HS256 del JWT; la misma en todos los servicios |
| `JWT_ISSUER`, `JWT_AUDIENCE` | | Emisor (`climguard-auth`) y audiencia (`climguard-api`) |
| `JWT_EXPIRATION_MINUTES` | | Vida de la sesión (30) |
| `INTERNAL_API_KEY` | ✔ | Clave de las llamadas entre servicios (`X-Internal-Key`) |
| `POSTGRES_SUPERUSER_PASSWORD`, `AUTH_DB_PASSWORD`, `COMMUNITY_DB_PASSWORD`, `ALERT_DB_PASSWORD` | ✔ | Contraseñas de PostgreSQL (superusuario y una por servicio) |
| `MSSQL_SA_PASSWORD` | ✔ | Contraseña `sa` de SQL Server (mayúscula, minúscula, número y símbolo) |
| `MONGO_ROOT_PASSWORD` | ✔ | Contraseña `root` de MongoDB |
| `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID` | ✔* | Identificadores de las aplicaciones OAuth (*se guardan en el Secret) |
| `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET` | ✔ | Secretos OAuth; vacíos = proveedor deshabilitado |
| `OAUTH_PUBLIC_BASE_URL` | | URL pública sin `/` final; con ella se forman los *redirect URI* |
| `OAUTH_FRONTEND_URL` | | Origen de Angular si difiere del anterior |
| `OAUTH_AUTO_PROVISION` | | `true`: las cuentas externas nuevas se registran con rol Consulta |
| `OAUTH_ALLOWED_EMAIL_DOMAINS` | | Dominios de correo admitidos para el auto-registro (vacío = cualquiera) |
| `OAUTH_FLOW_TTL_SECONDS`, `OAUTH_CODE_TTL_SECONDS` | | Vida del flujo OAuth (600) y del código de canje (60) |
| `DB_SYNCHRONIZE` | | `true` en local (TypeORM crea el esquema); **`false` en producción** (esquema por migraciones) |
| `SEED_DEFAULT_USERS` | | Usuarios de demostración. **Solo desarrollo**: debe ser `false` en producción |
| `SEED_DEMO` | | Datos de ejemplo (comunidades, sensores, reglas) si las tablas están vacías |
| `SIMULATOR_ENABLED` | | Enciende el simulador (solo afecta sensores `SIMULADO` activos) |
| `SENSOR_MIGRATIONS_AUTOAPPLY` | | El sensor-service aplica su migración al arrancar |
| `REPORT_MAX_ROWS`, `REPORT_ON_LIMIT`, `REPORT_CHUNK_ROWS`, `REPORT_CONCURRENCY`, `REPORT_MAX_QUEUE`, `REPORT_LOOKUP_MAX_ROWS`, `REPORT_TIMEZONE` | | Límites y zona horaria de los reportes |
| `CORS_ORIGINS` | | Orígenes permitidos por el gateway |
| `EDGE_HTTP_PORT`, `EDGE_HTTPS_PORT` | | Puertos del borde en Docker Compose (8080 / 8443) |

Valores de producción no secretos: `CONFIG_DATA` en `scripts/gen-k8s.py`.

# 6. Instalación local con Docker Compose
```bash
git clone https://github.com/acifuinaMar/ClimGuard.git
cd ClimGuard
bash scripts/gen-env.sh         # crea .env con secretos aleatorios (no sobrescribe uno existente)
bash scripts/gen-certs.sh       # nginx/certs/server.{crt,key}, autofirmado
docker compose up --build -d    # el primer build tarda varios minutos
docker compose ps               # todos los servicios deben quedar "healthy"
```
Abra `https://localhost:8443`. Para tener usuarios con los que entrar en un entorno nuevo, ponga `SEED_DEFAULT_USERS=true` en `.env` antes del primer arranque (solo en local).

- **OAuth en local:** complete las variables de la sección 5 con `OAUTH_PUBLIC_BASE_URL=https://localhost:8443` y levante con `docker compose -f docker-compose.yml -f docker-compose.oauth.yml up --build -d`.
- **Logs:** `docker compose logs -f <servicio>`.
- **Reconstruir un servicio:** `docker compose up -d --build <servicio>`.
- **Detener:** `docker compose down`. **No use `docker compose down -v`**: elimina los volúmenes y con ellos todos los datos.

# 7. Configuración de Google y GitHub (OAuth)
Los *redirect URI* se forman con `OAUTH_PUBLIC_BASE_URL`:

| Proveedor | Producción | Local |
|---|---|---|
| Google | `https://climguard.acifuina.online/api/auth/oauth/google/callback` | `https://localhost:8443/api/auth/oauth/google/callback` |
| GitHub | `https://climguard.acifuina.online/api/auth/oauth/github/callback` | `https://localhost:8443/api/auth/oauth/github/callback` |

**Google Cloud:** APIs y servicios → Pantalla de consentimiento (ámbitos `openid`, `email`, `profile`; en modo *Testing* solo entran los usuarios de prueba registrados) → Credenciales → ID de cliente OAuth de tipo *Aplicación web* → agregar los URI anteriores en *URIs de redireccionamiento autorizados*. Un mismo cliente admite varios URI.

**GitHub:** Settings → Developer settings → OAuth Apps → New OAuth App. Cada aplicación admite **un solo** callback, por lo que se usa una aplicación para producción y otra para local.

Las credenciales se cargan en `.env` (local) o en el archivo de secretos de la VPS (producción, sección 10.4). Nunca en el repositorio. Funcionamiento detallado: [FASE4_CAMBIOS.md](fases/fase-4/FASE4_CAMBIOS.md).

# 8. Sensores físicos (ESP8266)
El firmware no forma parte de este repositorio. Contrato que usa el dispositivo:
1. `POST /api/auth/login` con un usuario de servicio de rol **Operador**; exige HTTP 200, `rol == "Operador"` y `token`.
2. `POST /api/readings` con `Authorization: Bearer <token>` y `{"sensorId", "valor", "fechaHora"}`; renueva el token antes de que venza (cada 5 minutos).

Requisitos en ClimGuard: el sensor debe existir, estar **Activo** y tener origen **Físico** (así el simulador no le genera lecturas). El usuario del dispositivo debe mantener el rol Operador y no tener cuentas externas vinculadas. Si cambia el contrato del login (ruta, campos o nombre del rol) el dispositivo deja de funcionar.

# 9. Bases de datos y migraciones
- **PostgreSQL:** al crearse por primera vez, `docker/postgres/init.sh` crea `climguard_auth`, `climguard_community` y `climguard_alert`, un usuario por base y el esquema de Auth (`auth-000` y `auth-001`, ejecutados como el usuario `auth`).
- **community-service y sensor-service** crean su esquema con Entity Framework al arrancar; el sensor-service además aplica `SchemaUpgrades` (columna `Origen`).
- **alert-service** usa Hibernate con `ddl-auto: update`.
- **auth-service** en producción usa `DB_SYNCHRONIZE=false`: los cambios de esquema se aplican con los scripts de `scripts/migrations/`.

Estado de cada script en producción y cómo aplicarlos: [MIGRACIONES.md](MIGRACIONES.md).

# 10. Despliegue en producción (K3s)
Procedimiento seguido en la Fase 4 (bitácora completa: [K3S_PROGRESS.md](fases/fase-4/K3S_PROGRESS.md)). Los comandos se ejecutan en la VPS con `sudo`.

## 10.1 K3s
```bash
sudo mkdir -p /var/lib/rancher/k3s/server/manifests
sudo cp k8s/traefik-config.yaml /var/lib/rancher/k3s/server/manifests/      # Traefik en NodePort 30080/30443
curl -sfL https://get.k3s.io -o k3s-install.sh
sudo INSTALL_K3S_CHANNEL=stable \
     INSTALL_K3S_EXEC="server --disable servicelb --write-kubeconfig-mode 600 --kube-proxy-arg=nodeport-addresses=127.0.0.1/32" \
     sh k3s-install.sh
sudo ufw allow from 10.42.0.0/16 to any      # tráfico de pods
sudo ufw allow from 10.43.0.0/16 to any      # tráfico de servicios
```
- `--disable servicelb`: Traefik no toma 80/443 del host.
- `nodeport-addresses=127.0.0.1/32`: los NodePorts solo se alcanzan desde la propia VPS.

## 10.2 Imágenes
No hay registro de imágenes: se construyen en la VPS y se importan al containerd de K3s.
```bash
sudo docker build -t climguard/<servicio>:<versión> services/<carpeta>
sudo docker save climguard/<servicio>:<versión> | sudo k3s ctr -n k8s.io images import -
```
Las etiquetas vigentes (`--tag` del backend y `--frontend-tag`) están en `scripts/gen-k8s.py`; los manifiestos usan `imagePullPolicy: Never`.

## 10.3 Manifiestos
```bash
python3 scripts/gen-k8s.py                       # regenera k8s/climguard.yaml (sin secretos)
sudo kubectl apply -f k8s/climguard.yaml
```

## 10.4 Secretos
```bash
sudo install -m 600 -o root -g root /dev/null /root/<archivo-de-secretos>.env
sudo nano /root/<archivo-de-secretos>.env        # claves de la sección 5 marcadas como secretas
sudo bash scripts/k8s-secrets.sh /root/<archivo-de-secretos>.env
L=/etc/letsencrypt/live/<dominio>
sudo kubectl -n climguard create secret tls climguard-tls --cert=$L/fullchain.pem --key=$L/privkey.pem \
     --dry-run=client -o yaml | sudo kubectl apply -f -
```
`k8s-secrets.sh` no imprime ningún valor.

## 10.5 Entrada HTTPS
El nginx del host termina el TLS público (certificado de Let's Encrypt renovado por certbot) y reenvía al Ingress:
```nginx
location / {
    proxy_pass https://127.0.0.1:30443;
    proxy_ssl_verify off;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;      # WebSocket (SignalR)
    proxy_set_header Connection "upgrade";
}
```

# 11. Operación
Referencia de comandos: [k8s/README.md](../k8s/README.md).

| Tarea | Comando |
|---|---|
| Estado general | `sudo kubectl -n climguard get deploy,sts,pods,svc,pvc,cm,ingress` |
| Registros de un servicio | `sudo kubectl -n climguard logs deploy/<servicio> --since=30m` |
| Reiniciar un servicio | `sudo kubectl -n climguard rollout restart deploy/<servicio>` |
| Publicar una imagen nueva | `sudo kubectl -n climguard set image deploy/<servicio> <servicio>=climguard/<servicio>:<versión>` y `rollout status` |
| Revertir la última actualización | `sudo kubectl -n climguard rollout undo deploy/<servicio>` |
| Salud de los servicios | Los pods deben estar `Running` y `READY 1/1`; las *probes* consultan `/health` y `/ready` |

Al publicar una versión, actualice también la etiqueta por defecto en `scripts/gen-k8s.py` para que `k8s/climguard.yaml` siga igual a producción.

# 12. Seguridad
Lista de comprobación:
- [ ] `SEED_DEFAULT_USERS=false` en producción y ninguna cuenta con contraseña de demostración o heredada de la Fase 2.
- [ ] Contraseñas y claves solo en `.env` (local) o en el archivo de secretos de la VPS (root, `600`) y en el Secret de Kubernetes.
- [ ] Solo los puertos 22, 80 y 443 abiertos desde Internet (más 53 si la VPS es servidor DNS); la API de K3s (6443), los NodePorts y las bases de datos, cerrados.
- [ ] Nada de `sudo` sin contraseña de forma permanente.
- [ ] Credenciales del firmware del ESP8266 fuera del control de versiones.
- [ ] Revisar los hallazgos abiertos de [riesgos-y-pendientes.md](riesgos-y-pendientes.md).

# 13. Respaldo y recuperación
| Situación | Procedimiento |
|---|---|
| Respaldo de las tres bases | [k8s/README.md](../k8s/README.md) §5 (`pg_dump`, `mongodump`, `BACKUP DATABASE`); copiar el resultado fuera de la VPS |
| Restaurar un respaldo en K3s | `sudo bash scripts/k8s-restore.sh <directorio>`: recrea las bases de PostgreSQL vacías, restaura con el usuario de cada servicio, aplica `auth-001`, restaura MongoDB y SQL Server y muestra conteos |
| Una actualización falló | `rollout undo` del Deployment afectado; la imagen anterior sigue en containerd |
| Volver a la Fase 3 (Docker Compose) | `sudo bash /opt/climguard-fase4/rollback-fase3.sh` mientras existan sus contenedores y volúmenes; ver [k8s/README.md](../k8s/README.md) §6 |

No elimine PersistentVolumeClaims (`kubectl delete pvc`) ni desinstale K3s sin un respaldo verificado: los datos viven en `/var/lib/rancher/k3s/storage/`.

# 14. Pruebas e integración continua
Comandos y resultados: [pruebas.md](pruebas.md). GitHub Actions (`.github/workflows/ci.yml`) ejecuta en cada cambio las pruebas, los builds de todos los servicios y del frontend, la validación de Compose y de los manifiestos y un escaneo de secretos. No despliega en la VPS.

# 15. Solución de problemas
| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Los botones de Google o GitHub no aparecen | Falta `*_CLIENT_ID` o `*_CLIENT_SECRET` | Completar el Secret o `.env` y reiniciar `auth-service` |
| `/login?oauth_error=provider_unavailable` | El auth-service no tiene salida a Internet | En Compose, usar `docker-compose.oauth.yml` |
| Google o GitHub responden *redirect_uri_mismatch* | El callback registrado no coincide | Revisar `OAUTH_PUBLIC_BASE_URL` y la sección 7 |
| `/login?oauth_error=not_registered` | Auto-registro deshabilitado | `OAUTH_AUTO_PROVISION=true` o crear el usuario |
| Todas las peticiones dan 401 tras un cambio | `JWT_KEY`, `JWT_ISSUER` o `JWT_AUDIENCE` distintos entre servicios | Usar el mismo Secret en todos y reiniciarlos |
| Los sensores simulados no reciben lecturas | El sensor no es `SIMULADO`, está inactivo, o el simulador está apagado | Editar el sensor (origen y estado); `GET /api/simulation` |
| Un sensor físico no muestra lecturas | Dispositivo sin conexión, usuario sin rol Operador o sensor inactivo | Revisar el sensor y los logs de `sensor-service` |
| Reporte con error 422 | Supera `REPORT_MAX_ROWS` | Acotar filtros (fechas, comunidad, sensor) |
| Reporte con error 429 | Cola de reportes llena | Esperar el tiempo de `Retry-After` |
| Pod en `ErrImageNeverPull` | La imagen no está en el containerd de K3s | Importarla (sección 10.2) |
| Pod en `CrashLoopBackOff` | Variable o secreto faltante, base de datos no disponible | `kubectl logs --previous` y `kubectl describe pod` |
| El panel no se actualiza en vivo | WebSocket bloqueado en el proxy | Revisar las cabeceras `Upgrade`/`Connection` (sección 10.5) |
