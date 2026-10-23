#!/usr/bin/env bash
# Certificado autofirmado para HTTPS local (el navegador mostrará advertencia; en producción use un certificado real).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p nginx/certs
[ -f nginx/certs/server.crt ] && { echo "Ya existe nginx/certs/server.crt"; exit 0; }
openssl req -x509 -nodes -newkey rsa:2048 -days 365 -keyout nginx/certs/server.key -out nginx/certs/server.crt \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
chmod 600 nginx/certs/server.key
echo "Certificado generado en nginx/certs/"
