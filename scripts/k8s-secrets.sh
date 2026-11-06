#!/usr/bin/env bash
# ClimGuard Fase 4 — crea/actualiza el Secret `climguard-secrets` desde un archivo .env SIN imprimir valores.
# Uso (en la VPS, con kubectl apuntando a K3s):
#   sudo bash scripts/k8s-secrets.sh /ruta/segura/climguard-k8s.env
# Solo toma las claves listadas; ignora comentarios, comillas y comentarios al final de la línea.
set -euo pipefail
ENV_FILE="${1:?uso: k8s-secrets.sh <archivo .env>}"
NS="${NS:-climguard}"
KUBECTL="${KUBECTL:-kubectl}"
KEYS=(JWT_KEY INTERNAL_API_KEY POSTGRES_SUPERUSER_PASSWORD AUTH_DB_PASSWORD COMMUNITY_DB_PASSWORD
      ALERT_DB_PASSWORD MSSQL_SA_PASSWORD MONGO_ROOT_PASSWORD
      GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET)

umask 077
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

missing=()
for k in "${KEYS[@]}"; do
  line="$(grep -E "^${k}=" "$ENV_FILE" | tail -n1 || true)"
  v="${line#*=}"
  v="$(printf '%s' "$v" | sed -E 's/[[:space:]]+#.*$//; s/^[[:space:]]+//; s/[[:space:]]+$//')"
  v="${v%\"}"; v="${v#\"}"; v="${v%\'}"; v="${v#\'}"
  if [[ -z "$v" ]]; then missing+=("$k"); fi
  printf '%s=%s\n' "$k" "$v" >> "$TMP"
done

if (( ${#missing[@]} )); then
  echo "Faltan o están vacías: ${missing[*]}" >&2
  echo "(GOOGLE_*/GITHUB_* vacías deshabilitan ese proveedor; las demás son obligatorias)" >&2
  for k in "${missing[@]}"; do [[ "$k" == GOOGLE_* || "$k" == GITHUB_* ]] || exit 1; done
fi

"$KUBECTL" -n "$NS" create secret generic climguard-secrets --from-env-file="$TMP" \
  --dry-run=client -o yaml | "$KUBECTL" apply -f - >/dev/null
echo "Secret climguard-secrets aplicado en '$NS' con ${#KEYS[@]} claves (valores no mostrados)."
