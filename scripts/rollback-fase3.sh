#!/bin/bash
# ClimGuard — VOLVER A FASE 3 (Docker Compose). Uso: sudo bash /opt/climguard-fase4/rollback-fase3.sh
# No borra nada de K3s: solo devuelve el tráfico del nginx del host al edge de Fase 3 (8443) y arranca sus contenedores.
set -e
SITE=/etc/nginx/sites-available/climguard.acifuina.online
docker start $(docker ps -a --filter label=com.docker.compose.project=climguard3 --format '{{.Names}}')
sed -i 's#proxy_pass https://127.0.0.1:30443;#proxy_pass https://127.0.0.1:8443;#' "$SITE"
nginx -t && systemctl reload nginx
kubectl -n climguard scale deploy sensor-service --replicas=0   # evita que el simulador de K3s siga escribiendo
echo "Fase 3 activa de nuevo en https://climguard.acifuina.online (K3s sigue instalado)."
