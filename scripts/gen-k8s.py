#!/usr/bin/env python3
"""ClimGuard Fase 4 — genera los manifiestos de K3s.

Salida:
  k8s/climguard.yaml       Namespace, ConfigMaps, StatefulSets+PVC (PostgreSQL, SQL Server, MongoDB),
                           Deployments+Services (frontend, gateway y 6 microservicios), probes,
                           Middleware de cabeceras e Ingress TLS.
  k8s/traefik-config.yaml  HelmChartConfig de Traefik (NodePort 30080/30443, solo en 127.0.0.1 vía kube-proxy).
                           Se copia a /var/lib/rancher/k3s/server/manifests/ en la VPS.

NO contiene secretos: el Secret `climguard-secrets` se crea con scripts/k8s-secrets.sh desde un .env
y el Secret TLS `climguard-tls` desde el certificado de Let's Encrypt del host (ver k8s/README.md).

Uso:  python scripts/gen-k8s.py [--domain climguard.acifuina.online] [--tag 4.0.0] [--frontend-tag 4.1.0]
      Los valores por defecto reflejan lo que corre en producción: regenerar sin argumentos no debe
      cambiar ninguna imagen desplegada.
"""
import argparse
import os

import yaml

p = argparse.ArgumentParser()
p.add_argument("--domain", default="climguard.acifuina.online")
p.add_argument("--tag", default="4.0.0", help="etiqueta de las imágenes del backend (gateway y microservicios)")
p.add_argument("--frontend-tag", default="4.1.0", help="etiqueta de la imagen del frontend (se publica por separado)")
args = p.parse_args()

NS = "climguard"
SECRET = "climguard-secrets"
CONFIG = "climguard-config"
DOMAIN = args.domain
TAG = args.tag
FRONTEND_TAG = args.frontend_tag
PUBLIC_URL = f"https://{DOMAIN}"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Kubernetes interpreta YAML 1.1: "Y", "N", "yes", "on"... sin comillas serían booleanos (p. ej. ACCEPT_EULA=Y).
_YAML11_BOOLS = {"y", "n", "yes", "no", "on", "off", "true", "false"}
def _str_repr(dumper, data):
    style = '"' if data.lower() in _YAML11_BOOLS else ("|" if "\n" in data else None)
    return dumper.represent_scalar("tag:yaml.org,2002:str", data, style=style)
yaml.SafeDumper.add_representer(str, _str_repr)

# ---------------------------------------------------------------- helpers
def sec(name, key=None):
    return {"name": name, "valueFrom": {"secretKeyRef": {"name": SECRET, "key": key or name}}}

def cfg(name, key=None):
    return {"name": name, "valueFrom": {"configMapKeyRef": {"name": CONFIG, "key": key or name}}}

def val(name, value):
    return {"name": name, "value": str(value)}

def meta(name, labels=None):
    return {"name": name, "namespace": NS, "labels": {"app.kubernetes.io/part-of": "climguard", **(labels or {})}}

def http_probes(port, startup_seconds=150):
    return {
        "startupProbe": {"httpGet": {"path": "/health", "port": port}, "periodSeconds": 5,
                         "failureThreshold": startup_seconds // 5},
        "livenessProbe": {"httpGet": {"path": "/health", "port": port}, "periodSeconds": 20,
                          "timeoutSeconds": 5, "failureThreshold": 3},
        "readinessProbe": {"httpGet": {"path": "/ready", "port": port}, "periodSeconds": 10,
                           "timeoutSeconds": 5, "failureThreshold": 3},
    }

def resources(mem_limit, mem_request, cpu_request="50m", cpu_limit=None):
    r = {"requests": {"memory": mem_request, "cpu": cpu_request}, "limits": {"memory": mem_limit}}
    if cpu_limit:
        r["limits"]["cpu"] = cpu_limit
    return r

def service(name, port, target=None):
    return {"apiVersion": "v1", "kind": "Service", "metadata": meta(name, {"app": name}),
            "spec": {"selector": {"app": name}, "ports": [{"name": "http" if target is None else "tcp",
                                                           "port": port, "targetPort": target or port}]}}

def read(rel):
    with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
        return f.read()

# ---------------------------------------------------------------- configuración no secreta
# Valores tomados del .env de Fase 3 en producción (solo los no secretos) + Fase 4 (OAuth).
CONFIG_DATA = {
    "JWT_ISSUER": "climguard-auth",
    "JWT_AUDIENCE": "climguard-api",
    "JWT_EXPIRATION_MINUTES": "30",
    "CORS_ORIGINS": PUBLIC_URL,
    "OAUTH_PUBLIC_BASE_URL": PUBLIC_URL,
    "OAUTH_FRONTEND_URL": PUBLIC_URL,
    "OAUTH_AUTO_PROVISION": "true",
    "OAUTH_ALLOWED_EMAIL_DOMAINS": "",
    "DB_SYNCHRONIZE": "false",            # producción: esquema por scripts/migrations (auth-001 tras restaurar)
    "SEED_DEFAULT_USERS": "false",
    "SEED_DEMO": "false",                 # los datos vienen migrados de Fase 3
    "SIMULATOR_ENABLED": "true",
    "SENSOR_MIGRATIONS_AUTOAPPLY": "true",
    "REPORT_TIMEZONE": "America/Guatemala",
    "REPORT_MAX_ROWS": "5000",            # igual que Fase 3 en producción (ver RECURSOS-VPS.md)
    "REPORT_ON_LIMIT": "fail",
    "REPORT_CHUNK_ROWS": "250",
    "REPORT_CONCURRENCY": "2",
    "REPORT_MAX_QUEUE": "4",
    "REPORT_LOOKUP_MAX_ROWS": "5000",
}
SECRET_KEYS = ["JWT_KEY", "INTERNAL_API_KEY", "POSTGRES_SUPERUSER_PASSWORD", "AUTH_DB_PASSWORD",
               "COMMUNITY_DB_PASSWORD", "ALERT_DB_PASSWORD", "MSSQL_SA_PASSWORD", "MONGO_ROOT_PASSWORD",
               "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"]

jwt_net = [sec("Jwt__Key", "JWT_KEY"), cfg("Jwt__Issuer", "JWT_ISSUER"), cfg("Jwt__Audience", "JWT_AUDIENCE")]
jwt_flat = [sec("JWT_KEY"), cfg("JWT_ISSUER"), cfg("JWT_AUDIENCE"), sec("INTERNAL_API_KEY")]
mongo_url = [sec("MONGO_ROOT_PASSWORD"),
             val("MONGO_URL", "mongodb://root:$(MONGO_ROOT_PASSWORD)@mongo:27017/?authSource=admin")]

# ---------------------------------------------------------------- aplicaciones
# (nombre, puerto, entorno, límite RAM, request RAM, segundos máx. de arranque)
APPS = [
    ("frontend", 80, [], "128Mi", "32Mi", 60),
    ("gateway", 8080, jwt_net + [cfg("Cors__Origins", "CORS_ORIGINS")], "256Mi", "128Mi", 120),
    ("auth-service", 3000, jwt_flat + [
        cfg("JWT_EXPIRATION_MINUTES"), val("POSTGRES_HOST", "postgres"), val("POSTGRES_USER", "auth"),
        sec("POSTGRES_PASSWORD", "AUTH_DB_PASSWORD"), val("POSTGRES_DB", "climguard_auth"),
        val("AUDIT_API_URL", "http://audit-service:8000"), cfg("SEED_DEFAULT_USERS"), cfg("DB_SYNCHRONIZE"),
        cfg("OAUTH_PUBLIC_BASE_URL"), cfg("OAUTH_FRONTEND_URL"), cfg("OAUTH_AUTO_PROVISION"),
        cfg("OAUTH_ALLOWED_EMAIL_DOMAINS"), sec("GOOGLE_CLIENT_ID"), sec("GOOGLE_CLIENT_SECRET"),
        sec("GITHUB_CLIENT_ID"), sec("GITHUB_CLIENT_SECRET")], "256Mi", "128Mi", 120),
    ("community-service", 8080, jwt_net + [
        sec("COMMUNITY_DB_PASSWORD"),
        val("ConnectionStrings__Default",
            "Host=postgres;Database=climguard_community;Username=community;Password=$(COMMUNITY_DB_PASSWORD)"),
        sec("InternalApiKey", "INTERNAL_API_KEY"), cfg("Seed__Demo", "SEED_DEMO")], "256Mi", "128Mi", 120),
    ("sensor-service", 8080, jwt_net + [
        sec("MSSQL_SA_PASSWORD"),
        val("ConnectionStrings__Default",
            "Server=sqlserver;Database=ClimGuardSensor;User Id=sa;Password=$(MSSQL_SA_PASSWORD);TrustServerCertificate=True"),
        sec("InternalApiKey", "INTERNAL_API_KEY"), cfg("Cors__Origins", "CORS_ORIGINS"),
        cfg("Simulator__Enabled", "SIMULATOR_ENABLED"), cfg("Seed__Demo", "SEED_DEMO"),
        cfg("Migrations__AutoApply", "SENSOR_MIGRATIONS_AUTOAPPLY")], "384Mi", "192Mi", 180),
    ("alert-service", 8080, jwt_flat + [
        val("DB_URL", "jdbc:postgresql://postgres:5432/climguard_alert"), val("DB_USER", "alert"),
        sec("DB_PASSWORD", "ALERT_DB_PASSWORD"), val("AUDIT_API_URL", "http://audit-service:8000"),
        cfg("SEED_DEMO")], "512Mi", "320Mi", 240),
    ("report-service", 8000, jwt_flat + mongo_url + [
        val("MONGO_DB", "climguard_reports"),
        val("COMMUNITY_API_URL", "http://community-service:8080"), val("SENSOR_API_URL", "http://sensor-service:8080"),
        val("ALERT_API_URL", "http://alert-service:8080"), val("AUDIT_API_URL", "http://audit-service:8000"),
        *[cfg(k) for k in ["REPORT_TIMEZONE", "REPORT_MAX_ROWS", "REPORT_ON_LIMIT", "REPORT_CHUNK_ROWS",
                           "REPORT_CONCURRENCY", "REPORT_MAX_QUEUE", "REPORT_LOOKUP_MAX_ROWS"]],
        val("MALLOC_ARENA_MAX", "2")], "768Mi", "256Mi", 120),
    ("audit-service", 8000, jwt_flat + mongo_url + [val("MONGO_DB", "climguard_audit")], "256Mi", "96Mi", 120),
]

docs = [
    {"apiVersion": "v1", "kind": "Namespace", "metadata": {"name": NS}},
    {"apiVersion": "v1", "kind": "ConfigMap", "metadata": meta(CONFIG), "data": CONFIG_DATA},
    {"apiVersion": "v1", "kind": "ConfigMap", "metadata": meta("postgres-init"),
     "data": {"10-init.sh": read("docker/postgres/init.sh")}},
    {"apiVersion": "v1", "kind": "ConfigMap", "metadata": meta("postgres-migrations"),
     "data": {f: read(f"scripts/migrations/{f}") for f in sorted(os.listdir(os.path.join(ROOT, "scripts/migrations")))
              if f.endswith(".sql")}},
]

# ---------------------------------------------------------------- bases de datos (StatefulSet + PVC local-path)
def statefulset(name, image, port, env, mounts, volumes, probes, mem_limit, mem_request, pvc_size, data_path,
                args_=None, fs_group=None):
    container = {"name": name, "image": image, "ports": [{"containerPort": port}], "env": env,
                 "volumeMounts": [{"name": "data", "mountPath": data_path}] + mounts,
                 "resources": resources(mem_limit, mem_request, "100m"), **probes}
    if args_:
        container["args"] = args_
    pod_spec = {"terminationGracePeriodSeconds": 60, "containers": [container], "volumes": volumes}
    if fs_group:
        pod_spec["securityContext"] = {"fsGroup": fs_group}
    return {"apiVersion": "apps/v1", "kind": "StatefulSet", "metadata": meta(name, {"app": name}),
            "spec": {"serviceName": name, "replicas": 1, "selector": {"matchLabels": {"app": name}},
                     "template": {"metadata": {"labels": {"app": name}}, "spec": pod_spec},
                     "volumeClaimTemplates": [{"metadata": {"name": "data"}, "spec": {
                         "accessModes": ["ReadWriteOnce"], "storageClassName": "local-path",
                         "resources": {"requests": {"storage": pvc_size}}}}]}}

def exec_probe(cmd, period, timeout, failures, initial=0):
    pr = {"exec": {"command": ["sh", "-c", cmd]}, "periodSeconds": period, "timeoutSeconds": timeout,
          "failureThreshold": failures}
    if initial:
        pr["initialDelaySeconds"] = initial
    return pr

docs += [
    statefulset("postgres", "postgres:16-alpine", 5432,
                [val("POSTGRES_USER", "postgres"), sec("POSTGRES_PASSWORD", "POSTGRES_SUPERUSER_PASSWORD"),
                 sec("AUTH_DB_PASSWORD"), sec("COMMUNITY_DB_PASSWORD"), sec("ALERT_DB_PASSWORD"),
                 val("PGDATA", "/var/lib/postgresql/data/pgdata")],
                [{"name": "init", "mountPath": "/docker-entrypoint-initdb.d", "readOnly": True},
                 {"name": "migrations", "mountPath": "/opt/climguard/migrations", "readOnly": True}],
                [{"name": "init", "configMap": {"name": "postgres-init", "defaultMode": 0o555}},
                 {"name": "migrations", "configMap": {"name": "postgres-migrations"}}],
                {"readinessProbe": exec_probe("pg_isready -U postgres", 10, 5, 6),
                 "livenessProbe": exec_probe("pg_isready -U postgres", 20, 5, 6, 30)},
                "384Mi", "256Mi", "5Gi", "/var/lib/postgresql/data"),
    statefulset("sqlserver", "mcr.microsoft.com/mssql/server:2022-latest", 1433,
                [val("ACCEPT_EULA", "Y"), val("MSSQL_PID", "Developer"), sec("MSSQL_SA_PASSWORD"),
                 val("MSSQL_MEMORY_LIMIT_MB", "1536")],
                [], [],
                {"startupProbe": {"tcpSocket": {"port": 1433}, "periodSeconds": 5, "failureThreshold": 36},
                 "readinessProbe": exec_probe("/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \"$MSSQL_SA_PASSWORD\" "
                                              "-C -Q 'SELECT 1' -b -o /dev/null", 15, 10, 4),
                 "livenessProbe": {"tcpSocket": {"port": 1433}, "periodSeconds": 20, "failureThreshold": 6}},
                "2Gi", "1536Mi", "10Gi", "/var/opt/mssql", fs_group=10001),
    statefulset("mongo", "mongo:7", 27017,
                [val("MONGO_INITDB_ROOT_USERNAME", "root"), sec("MONGO_INITDB_ROOT_PASSWORD", "MONGO_ROOT_PASSWORD")],
                [], [],
                # mongosh consume ~200 MB por ejecución: readiness espaciada y liveness por TCP.
                {"readinessProbe": exec_probe("mongosh --quiet -u root -p \"$MONGO_INITDB_ROOT_PASSWORD\" "
                                              "--authenticationDatabase admin --eval 'db.adminCommand(\"ping\").ok' | grep -q 1",
                                              30, 15, 4),
                 "livenessProbe": {"tcpSocket": {"port": 27017}, "periodSeconds": 20, "failureThreshold": 6,
                                   "initialDelaySeconds": 20}},
                "512Mi", "384Mi", "5Gi", "/data/db", args_=["--wiredTigerCacheSizeGB", "0.25"]),
    service("postgres", 5432, 5432),
    service("sqlserver", 1433, 1433),
    service("mongo", 27017, 27017),
]

# ---------------------------------------------------------------- aplicaciones
for name, port, env, mem_limit, mem_request, startup in APPS:
    tag = FRONTEND_TAG if name == "frontend" else TAG
    container = {"name": name, "image": f"climguard/{name}:{tag}", "imagePullPolicy": "Never",
                 "ports": [{"containerPort": port}], "env": env,
                 "resources": resources(mem_limit, mem_request),
                 "securityContext": {"allowPrivilegeEscalation": False}}
    if name == "frontend":
        container.update({
            "startupProbe": {"httpGet": {"path": "/", "port": port}, "periodSeconds": 5, "failureThreshold": 12},
            "livenessProbe": {"httpGet": {"path": "/", "port": port}, "periodSeconds": 20},
            "readinessProbe": {"httpGet": {"path": "/", "port": port}, "periodSeconds": 10}})
    else:
        container.update(http_probes(port, startup))
    docs.append({"apiVersion": "apps/v1", "kind": "Deployment", "metadata": meta(name, {"app": name}),
                 "spec": {"replicas": 1, "revisionHistoryLimit": 3, "selector": {"matchLabels": {"app": name}},
                          # Backend: maxSurge 0 → no duplica la RAM durante una actualización (un solo nodo de 8 GB).
                          # Frontend: maxSurge 1 / maxUnavailable 0 → sin corte; la copia temporal pide 32Mi (límite 128Mi).
                          "strategy": {"type": "RollingUpdate", "rollingUpdate":
                                       {"maxSurge": 1, "maxUnavailable": 0} if name == "frontend"
                                       else {"maxSurge": 0, "maxUnavailable": 1}},
                          "template": {"metadata": {"labels": {"app": name}},
                                       "spec": {"terminationGracePeriodSeconds": 30, "containers": [container]}}}})
    docs.append(service(name, port))

# ---------------------------------------------------------------- borde: cabeceras + Ingress TLS
docs.append({"apiVersion": "traefik.io/v1alpha1", "kind": "Middleware", "metadata": meta("security-headers"),
             "spec": {"headers": {"stsSeconds": 31536000, "contentTypeNosniff": True, "frameDeny": False,
                                  "customFrameOptionsValue": "SAMEORIGIN",
                                  "referrerPolicy": "strict-origin-when-cross-origin"}}})
docs.append({"apiVersion": "networking.k8s.io/v1", "kind": "Ingress", "metadata": {
    **meta("climguard"), "annotations": {
        "traefik.ingress.kubernetes.io/router.entrypoints": "websecure",
        "traefik.ingress.kubernetes.io/router.tls": "true",
        "traefik.ingress.kubernetes.io/router.middlewares": f"{NS}-security-headers@kubernetescrd"}},
    "spec": {"ingressClassName": "traefik", "tls": [{"hosts": [DOMAIN], "secretName": "climguard-tls"}],
             "rules": [{"host": DOMAIN, "http": {"paths": [
                 {"path": "/api", "pathType": "Prefix", "backend": {"service": {"name": "gateway", "port": {"number": 8080}}}},
                 {"path": "/hubs", "pathType": "Prefix", "backend": {"service": {"name": "gateway", "port": {"number": 8080}}}},
                 {"path": "/", "pathType": "Prefix", "backend": {"service": {"name": "frontend", "port": {"number": 80}}}},
             ]}}]}})

TRAEFIK = {"apiVersion": "helm.cattle.io/v1", "kind": "HelmChartConfig",
           "metadata": {"name": "traefik", "namespace": "kube-system"},
           "spec": {"valuesContent": yaml.safe_dump({
               # Sin servicelb: Traefik NO toma 80/443 del host (los conserva el nginx del host + certbot).
               "service": {"type": "NodePort"},
               "ports": {"web": {"nodePort": 30080},
                         "websecure": {"nodePort": 30443,
                                       "forwardedHeaders": {"trustedIPs": ["127.0.0.1/32", "10.42.0.0/16"]}}},
               "resources": {"requests": {"memory": "64Mi", "cpu": "50m"}, "limits": {"memory": "192Mi"}},
           }, sort_keys=False)}}

os.makedirs(os.path.join(ROOT, "k8s"), exist_ok=True)
header = ("# Generado por scripts/gen-k8s.py — NO editar a mano. Sin secretos: ver scripts/k8s-secrets.sh.\n"
          f"# Dominio: {DOMAIN} · Imágenes: climguard/*:{TAG}, climguard/frontend:{FRONTEND_TAG} "
          "(importadas al containerd de K3s)\n")
with open(os.path.join(ROOT, "k8s/climguard.yaml"), "w", encoding="utf-8", newline="\n") as f:
    f.write(header + yaml.safe_dump_all(docs, sort_keys=False, allow_unicode=True))
with open(os.path.join(ROOT, "k8s/traefik-config.yaml"), "w", encoding="utf-8", newline="\n") as f:
    f.write("# Copiar a /var/lib/rancher/k3s/server/manifests/traefik-config.yaml\n" + yaml.safe_dump(TRAEFIK, sort_keys=False))
print(f"{len(docs)} recursos en k8s/climguard.yaml; HelmChartConfig en k8s/traefik-config.yaml")
print("Claves esperadas en el Secret:", ", ".join(SECRET_KEYS))
