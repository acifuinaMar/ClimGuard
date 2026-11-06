# ClimGuard Fase 4 — operación en K3s

Producción: `https://climguard.acifuina.online` · VPS `adminacifuina@67.205.162.186` · namespace `climguard`.
Historia del despliegue y decisiones: [K3S_PROGRESS.md](../K3S_PROGRESS.md).

Todos los comandos se ejecutan **en la VPS** y piden la contraseña de `sudo` (el kubeconfig de K3s es solo de root):
```bash
ssh -t adminacifuina@67.205.162.186
alias k='sudo kubectl -n climguard'
```

## Archivos
| Archivo | Qué es | ¿Secretos? |
|---|---|---|
| `scripts/gen-k8s.py` | Genera `k8s/climguard.yaml` y `k8s/traefik-config.yaml` | No |
| `k8s/climguard.yaml` | Namespace, ConfigMaps, StatefulSets+PVC, Deployments, Services, Middleware, Ingress | No |
| `k8s/traefik-config.yaml` | HelmChartConfig de Traefik (NodePort 30080/30443) | No |
| `scripts/k8s-secrets.sh` | Crea/actualiza el Secret `climguard-secrets` desde un `.env` sin imprimir valores | No |
| `scripts/k8s-restore.sh` | Restaura en K3s un respaldo de Fase 3 (PostgreSQL, MongoDB, SQL Server) | No |
| `scripts/rollback-fase3.sh` | Devuelve el tráfico a Fase 3 (Docker Compose) | No |
| `/root/climguard-k8s.env` (solo VPS, 600) | Valores del Secret | **Sí — nunca al repo** |

## 1. Verificar el clúster
```bash
sudo kubectl get nodes
k get deploy,sts,pods,svc,pvc,cm,ingress
k get secrets                                  # solo nombres; NUNCA usar -o yaml en una pantalla compartida
sudo kubectl top node; k top pod
k get events --sort-by=.lastTimestamp | tail -20
curl -s -o /dev/null -w '%{http_code}\n' https://climguard.acifuina.online/api/auth/oauth/providers   # 200
```
Esperado: 8 Deployments `1/1`, 3 StatefulSets `1/1`, 3 PVC `Bound`, 11 Pods `Running` sin reinicios crecientes.

Salud de cada servicio (readiness comprueba la base de datos):
```bash
for s in auth-service:3000 community-service:8080 sensor-service:8080 alert-service:8080 report-service:8000 audit-service:8000; do
  printf '%-24s' $s; k exec deploy/gateway -- bash -c "exec 3<>/dev/tcp/${s%%:*}/${s##*:}; printf 'GET /ready HTTP/1.0\r\n\r\n' >&3; head -1 <&3"
done
```

## 2. Registros y reinicios
```bash
k logs deploy/auth-service --since=30m            # o -f para seguir; --previous tras un reinicio
k rollout restart deploy/auth-service             # reinicio ordenado de un servicio
k rollout status  deploy/auth-service
k rollout restart deploy                          # todas las aplicaciones (no toca las bases)
k delete pod postgres-0                           # reinicia una base (el PVC conserva los datos)
```
Los Deployments usan `maxSurge: 0`: durante un reinicio el servicio queda unos segundos sin réplica (no se duplica la RAM).

## 3. Cambiar configuración o secretos
- **No secretos** (`climguard-config`): editar `CONFIG_DATA` en `scripts/gen-k8s.py`, regenerar, copiar y aplicar:
  ```bash
  python scripts/gen-k8s.py                                     # en tu PC
  scp k8s/climguard.yaml adminacifuina@67.205.162.186:/opt/climguard-fase4/k8s/
  sudo kubectl apply -f /opt/climguard-fase4/k8s/climguard.yaml && k rollout restart deploy
  ```
- **Secretos**: editar en la VPS (no pegar valores en chats ni en commits):
  ```bash
  sudo nano /root/climguard-k8s.env
  sudo bash /opt/climguard-fase4/scripts/k8s-secrets.sh /root/climguard-k8s.env
  k rollout restart deploy/auth-service                         # o el servicio que use la clave
  ```
  ⚠️ Cambiar `*_DB_PASSWORD`, `MSSQL_SA_PASSWORD` o `MONGO_ROOT_PASSWORD` en el Secret **no** cambia la clave dentro de una base ya creada: primero `ALTER ROLE` / `ALTER LOGIN` / `db.changeUserPassword` y después el Secret.

## 4. Nueva versión de las imágenes
```bash
cd /opt/climguard-fase4            # código actualizado (git archive del commit a desplegar)
sudo docker build -t climguard/auth-service:4.0.1 services/auth
sudo docker save climguard/auth-service:4.0.1 | sudo k3s ctr -n k8s.io images import -
k set image deploy/auth-service auth-service=climguard/auth-service:4.0.1
```
(`imagePullPolicy: Never`: K3s solo usa imágenes importadas a su containerd; no hay registry.)

Después, fijar la misma etiqueta en el generador para que `k8s/climguard.yaml` siga igual a producción:
`--tag` (backend, hoy `4.0.0`) y `--frontend-tag` (hoy `4.1.0`) — cambie el valor por defecto en `scripts/gen-k8s.py`.
El frontend se actualiza sin corte (`maxSurge: 1`, `maxUnavailable: 0`); el backend usa `maxSurge: 0` para no duplicar RAM.
Volver a la versión anterior de un Deployment: `k rollout undo deploy/frontend` (la imagen previa sigue en containerd).

## 5. Respaldos
```bash
B=/opt/climguard-backups/k3s_$(date +%Y%m%d_%H%M); sudo mkdir -p $B && sudo chmod 700 $B
for db in climguard_auth climguard_community climguard_alert; do k exec postgres-0 -- pg_dump -U postgres -Fc $db | sudo tee $B/$db.dump >/dev/null; done
k exec mongo-0 -- sh -c 'mongodump --quiet -u root -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive --gzip' | sudo tee $B/mongo.archive.gz >/dev/null
k exec sqlserver-0 -- bash -c '/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -Q "BACKUP DATABASE [ClimGuardSensor] TO DISK=N'"'"'/var/opt/mssql/data/ClimGuardSensor.bak'"'"' WITH INIT, FORMAT, COPY_ONLY" >/dev/null && cat /var/opt/mssql/data/ClimGuardSensor.bak && rm /var/opt/mssql/data/ClimGuardSensor.bak' | sudo tee $B/ClimGuardSensor.bak >/dev/null
sudo ls -la $B
```
Restaurar ese mismo formato: `sudo bash /opt/climguard-fase4/scripts/k8s-restore.sh $B`.
Los datos viven en `/var/lib/rancher/k3s/storage/` (PVC `local-path`): **no** borrar los PVC (`kubectl delete pvc`) ni desinstalar K3s sin respaldo.

## 6. Recuperar Fase 3 (Docker Compose)
Mientras existan los contenedores y volúmenes `climguard3-*`:
```bash
sudo bash /opt/climguard-fase4/rollback-fase3.sh
```
Arranca los contenedores de Fase 3 (también sus bases si estaban detenidas), cambia `proxy_pass` del nginx del host a `127.0.0.1:8443`, recarga nginx y detiene el simulador de K3s.
- Los datos de Fase 3 son los del corte (2026-11-06 02:28 UTC). Lo escrito después en K3s no está ahí: respaldar K3s antes (sección 5).
- Volver a K3s: `sudo sed -i 's#127.0.0.1:8443;#127.0.0.1:30443;#' /etc/nginx/sites-available/climguard.acifuina.online && sudo nginx -t && sudo systemctl reload nginx`, detener `climguard3-*` y `k scale deploy sensor-service --replicas=1`.

## 7. TLS
El TLS público lo termina el nginx del host (certbot renueva solo). Traefik usa una copia en el Secret `climguard-tls` (vence 2027-01-05); el salto interno no verifica certificado, así que su vencimiento no corta el servicio. Para mantenerla al día:
```bash
L=/etc/letsencrypt/live/climguard.acifuina.online
sudo kubectl -n climguard create secret tls climguard-tls --cert=$L/fullchain.pem --key=$L/privkey.pem --dry-run=client -o yaml | sudo kubectl apply -f -
```
