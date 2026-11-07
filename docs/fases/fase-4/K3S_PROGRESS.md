# ClimGuard Fase 4 — progreso del despliegue en K3s

> **Registro de la Fase 4 — bitácora del despliegue en K3s (6 de noviembre de 2026).** Describe cómo se migró de Docker Compose a K3s. Para operar el clúster hoy, use [k8s/README.md](../../../k8s/README.md). Documentación vigente: [docs/README.md](../../README.md).


VPS: DigitalOcean `ns1-acifuina` (67.205.162.186) · Ubuntu 22.04.5 · 4 vCPU · 8 GB · 49 GB.
Dominio: `climguard.acifuina.online` (DNS autoritativo en BIND9 de esta misma VPS — **no tocado**).

**Estado: Fase 4 en producción sobre K3s desde 2026-11-06 02:29 UTC** (corte de 43 s sin servicio).

## Arquitectura
```
Internet ─► nginx del host :443 (Let's Encrypt/certbot, sin cambios de TLS) ─► 127.0.0.1:30443 Traefik (Ingress K3s, TLS)
            ├─ /api, /hubs ─► gateway ─► auth · community · sensor · alert · report · audit
            └─ /           ─► frontend
            PostgreSQL · SQL Server · MongoDB = StatefulSets con PVC (local-path)
```
- K3s v1.37.2+k3s1, un nodo (`climguard`), instalado **sin `servicelb`**: Traefik no toma 80/443.
- NodePorts solo en `127.0.0.1` (`--kube-proxy-arg=nodeport-addresses=127.0.0.1/32`). Verificado desde Internet: 6443, 30080, 30443, 8443, 8081, 1433 cerrados.
- Único cambio en nginx del host: `proxy_pass https://127.0.0.1:8443` → `https://127.0.0.1:30443` (copia: `/opt/climguard-backups/nginx-climguard.acifuina.online.20261106_022839`).
- UFW: añadidas `allow from 10.42.0.0/16` y `10.43.0.0/16` (tráfico interno de pods/servicios, recomendado por K3s).
- Swap de 4 GB (`/swapfile`, `vm.swappiness=10`) como colchón ante picos.

## Recursos Kubernetes (namespace `climguard`)
| Tipo | Recursos |
|---|---|
| Deployments (1 réplica, `maxSurge: 0`) | frontend, gateway, auth-service, community-service, sensor-service, alert-service, report-service, audit-service |
| StatefulSets + PVC | postgres (5Gi), sqlserver (10Gi), mongo (5Gi) — `local-path` en `/var/lib/rancher/k3s/storage` |
| Services (ClusterIP) | los 11 anteriores |
| ConfigMaps | `climguard-config` (20 claves no secretas), `postgres-init`, `postgres-migrations` |
| Secrets | `climguard-secrets` (12 claves), `climguard-tls` (certificado Let's Encrypt) |
| Ingress + Middleware | `climguard` (Traefik, TLS, `/api` `/hubs` `/`), `security-headers` (HSTS, nosniff, SAMEORIGIN, Referrer-Policy) |
| Health checks | startup + liveness `/health`, readiness `/ready` (comprueba la BD); BD con `pg_isready` / `sqlcmd` / TCP |

## Verificado
| Prueba | Resultado |
|---|---|
| `https://climguard.acifuina.online/` y rutas SPA | 200 (Angular) |
| HTTP → HTTPS | 301 |
| Cabeceras de seguridad | HSTS, nosniff, SAMEORIGIN, Referrer-Policy |
| Login local con credenciales falsas | 401 (auth + PostgreSQL responden) |
| `/api/auth/oauth/providers` | Google y GitHub habilitados |
| `/api/auth/oauth/{google,github}/start` | 302 con `redirect_uri=https://climguard.acifuina.online/api/auth/oauth/<p>/callback` |
| Salida a Internet del auth-service | accounts.google.com y api.github.com accesibles |
| Endpoints con JWT (token efímero de 5 min firmado dentro del pod, nunca impreso) | 200 en `auth/me`, `users`, `communities`, `sensors`, `sensor-types`, `readings`, `alerts`, `rules`, `levels`, `reports/types`, `reports/history`, `reports/dashboard`, `audit` |
| Reportes | descarga de PDF migrado (GridFS) 200; PDF nuevo COMMUNITIES en 1,8 s; ALERTS → 422 `LIMIT_EXCEEDED` (esperado: 105 486 filas > 5000) |
| SignalR `/hubs/monitoreo/negotiate` sin token | 401 (ruta y gateway correctos) |
| Datos migrados | users 3 · external_identities 0 · reports 42 · pdfs 34 · audit events 375 · sensores 9 · lecturas ≈1,05 M |
| Pods | 11/11 Running, 0 reinicios |

## Bitácora
| Hora (UTC) | Etapa | Resultado |
|---|---|---|
| 11-06 01:56 | 0 · Diagnóstico | Compatible (cgroup v2, kernel 5.15). Sin swap. proyecto2 corriendo con SQL Server público en 1433; 4200/8080 abiertos. |
| — | A · Manifiestos | `scripts/gen-k8s.py` reescrito (28 recursos); `scripts/k8s-secrets.sh` nuevo. |
| 02:05 | Limpieza proyecto2 | Eliminados contenedores `climguard-api/-frontend/-sqlserver/-db-init`, volumen `climguard-sqldata`, imágenes `climguard-api`, `climguard-frontend`, red `climguard_default`, cron 02:00, `/opt/scripts/backup_climguard.sh`, `/opt/backups/climguard`, `/opt/climguard`. Conservada `mssql/server:2022-latest` (Fase 3). RAM disp. 4,1 → 5,2 GB; disco 19 → 25 GB. |
| 02:11 | B · Código e imágenes | Commit `83d94aa` (`git archive`, sin `.env`) en `/opt/climguard-fase4`; 8 imágenes `climguard/*:4.0.0` construidas (8 min). |
| 02:13 | Respaldo en caliente | `/opt/climguard-backups/20261106_0213` (172 MB) + copia local `backups/fase3-vps-20261106_0213.tar.gz`. |
| 02:15 | K3s | Instalado; Traefik NodePort 30080/30443. |
| 02:17 | Secret | `/root/climguard-k8s.env` (600, root): claves de Fase 3 + **`sa` nueva** + OAuth del `.env` local. |
| 02:18 | **Bug** | `init.sh`: `REASSIGN OWNED BY postgres` falla en PG16 → corregido (migraciones auth se ejecutan como `auth`). |
| 02:18 | **Bug** | `ACCEPT_EULA: Y` se leía como booleano (YAML 1.1) → el generador ahora entrecomilla `Y/N/yes/on…`. |
| 02:23 | Restauración | `scripts/k8s-restore.sh` (bases recreadas vacías, `pg_restore --no-owner --role`, `auth-001`, mongorestore, RESTORE de SQL Server). Conteos idénticos a Fase 3. |
| 02:35 | Cierre | Retirada `/etc/sudoers.d/90-climguard-temp`; `sudo` vuelve a pedir contraseña. Dominio 200. |
| 02:28–02:29 | **Corte** | Escrituras de Fase 3 congeladas → respaldo final `final_20261106_022839` → restauración → 8/8 listos → nginx a 30443. 43 s sin servicio. |

## Recuperación de Fase 3 (mantener hasta dar por validada la Fase 4)
```bash
sudo bash /opt/climguard-fase4/rollback-fase3.sh
```
Arranca los contenedores `climguard3-*`, devuelve el `proxy_pass` a 8443, recarga nginx y detiene el simulador de K3s.
- Los volúmenes `climguard3_pgdata/_sqldata/_mongodata` están intactos (BD de Fase 3 siguen encendidas, sin escrituras desde 02:28).
- ⚠️ Lo escrito en K3s después del corte **no** está en Fase 3. Si se vuelve atrás tras días de uso, primero respaldar K3s.
- ⚠️ Al volver, Docker vuelve a publicar 8443/8081 en Internet (Docker se salta UFW).

## Seguridad
- La contraseña `sa` expuesta pertenecía solo a proyecto2 (Fase 3 usa otra, verificado por hash) y desapareció con él. SQL Server en K3s usa una clave nueva, solo en `/root/climguard-k8s.env` y en el Secret.
- Ningún secreto en Git, manifiestos ni registros. `/root/climguard-k8s.env` y `/opt/climguard-backups` son root-only (600/700).

## Pendientes
1. **OAuth en producción (acción del dueño de las cuentas):** las credenciales cargadas son las del `.env` local (registradas para `https://localhost:8443`).
   - Google Cloud Console → ese cliente → *Authorized redirect URIs*: añadir `https://climguard.acifuina.online/api/auth/oauth/google/callback`.
   - GitHub solo admite un callback por app: crear una OAuth App de producción con callback `https://climguard.acifuina.online/api/auth/oauth/github/callback` y actualizar `GITHUB_CLIENT_ID/SECRET` en `/root/climguard-k8s.env`, luego `sudo bash scripts/k8s-secrets.sh /root/climguard-k8s.env && sudo kubectl -n climguard rollout restart deploy/auth-service`.
2. **Prueba manual en navegador:** login local con un usuario real, Google, GitHub, dashboard en vivo (SignalR) y generación de un reporte.
3. **Liberar recursos (bloqueado por permisos de la herramienta, decide el dueño):** detener BD de Fase 3 (`docker stop climguard3-postgres-1 climguard3-mongo-1 climguard3-sqlserver-1`, ~2 GB de RAM; el rollback las arranca), `docker builder prune -f` (~14 GB de caché de compilación) y `docker image rm climguard/*:4.0.0` (copias ya importadas en containerd). Disco libre actual: 8 GB (84 %).
4. **Renovación TLS de Traefik:** `climguard-tls` es una copia del certificado (vence 2027-01-05). No rompe el servicio (nginx del host termina el TLS público y no verifica el salto interno), pero conviene un `deploy-hook` de certbot que actualice el Secret.
5. Opcional: NetworkPolicies para replicar el aislamiento de redes `internal` de Compose (auth-service necesita salida HTTPS a Google/GitHub).
6. Conocido, previo a K3s: el limitador por IP del gateway ve la IP del proxy (KnownProxies solo loopback); las claves de DataProtection de .NET no persisten (aviso en logs, sin impacto actual).
7. Traefik aparece como `LoadBalancer <pending>` (el chart ignora `service.type`); es inocuo sin `servicelb` y los NodePorts funcionan.
8. Git: commit local en `fase4-oauth-oidc` con scripts, manifiestos (revisados, sin secretos) y documentación; **sin push**. Operación diaria: [k8s/README.md](../../../k8s/README.md).

## Incidencia: el simulador no genera lecturas (2026-11-06)
- **Causa:** cambio de comportamiento de la Fase 4, no de K3s. En Fase 3 (`538add3`) el simulador escribía en **todos** los sensores activos (`EstadoSensorId == 1`), incluidos los físicos. Desde `dd733ee` solo escribe en los que tienen `Origen = 'SIMULADO'`, y `SchemaUpgrades` agregó la columna con `DEFAULT 'FISICO'` al arrancar sobre los datos migrados: los 9 sensores quedaron `FISICO`, así que el simulador no tiene sensores que simular.
- **Descartado:** configuración (`SIMULATOR_ENABLED=true` → `Simulator__Enabled`, igual que Compose), arranque del `BackgroundService`, BD (readiness 200), API y dashboard (las lecturas ESP8266 llegan y se muestran).
- **Corrección (solo datos, sin imagen nueva ni cambio de Deployment):** marcar como **Simulado** únicamente los sensores de demostración desde *Sensores → Editar → Origen de las lecturas* (los ESP8266 se quedan en Físico). El simulador los toma en el siguiente ciclo (5 s).

**Decisión (2026-11-06):** la Fase 4 en K3s queda como producción. Fase 3 se conserva solo como recuperación (contenedores detenidos, volúmenes y respaldos intactos).
