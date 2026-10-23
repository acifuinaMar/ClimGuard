#!/usr/bin/env python3
"""Genera k8s/climguard.yaml: Deployments + Services + probes (/health, /ready) y un Secret de plantilla."""
import yaml

NS = "climguard"
SECRET = "climguard-secrets"
def sec(key): return {"valueFrom": {"secretKeyRef": {"name": SECRET, "key": key}}}
def env(name, value=None, key=None):
    return {"name": name, **({"value": str(value)} if value is not None else sec(key))}

jwt_net = [env("Jwt__Key", key="JWT_KEY"), env("Jwt__Issuer", key="JWT_ISSUER"), env("Jwt__Audience", key="JWT_AUDIENCE")]
jwt_flat = [env("JWT_KEY", key="JWT_KEY"), env("JWT_ISSUER", key="JWT_ISSUER"), env("JWT_AUDIENCE", key="JWT_AUDIENCE"),
            env("INTERNAL_API_KEY", key="INTERNAL_API_KEY")]
# (nombre, puerto, entorno, memoria)
SERVICES = [
    ("gateway", 8080, jwt_net + [env("Cors__Origins", key="CORS_ORIGINS")], "256Mi"),
    ("auth-service", 3000, jwt_flat + [env("POSTGRES_HOST", "postgres"), env("POSTGRES_USER", "auth"), env("POSTGRES_PASSWORD", key="AUTH_DB_PASSWORD"),
        env("POSTGRES_DB", "climguard_auth"), env("AUDIT_API_URL", "http://audit-service:8000"), env("SEED_DEFAULT_USERS", "false")], "256Mi"),
    ("community-service", 8080, jwt_net + [env("ConnectionStrings__Default", key="COMMUNITY_DB_CONN"), env("InternalApiKey", key="INTERNAL_API_KEY")], "256Mi"),
    ("sensor-service", 8080, jwt_net + [env("ConnectionStrings__Default", key="SENSOR_DB_CONN"), env("InternalApiKey", key="INTERNAL_API_KEY"),
        env("Simulator__Enabled", "false")], "384Mi"),
    ("alert-service", 8080, jwt_flat + [env("DB_URL", "jdbc:postgresql://postgres:5432/climguard_alert"), env("DB_USER", "alert"),
        env("DB_PASSWORD", key="ALERT_DB_PASSWORD"), env("AUDIT_API_URL", "http://audit-service:8000")], "512Mi"),
    ("report-service", 8000, jwt_flat + [env("MONGO_URL", key="MONGO_URL"), env("MONGO_DB", "climguard_reports"),
        env("COMMUNITY_API_URL", "http://community-service:8080"), env("SENSOR_API_URL", "http://sensor-service:8080"),
        env("ALERT_API_URL", "http://alert-service:8080"), env("AUDIT_API_URL", "http://audit-service:8000")], "768Mi"),
    ("audit-service", 8000, jwt_flat + [env("MONGO_URL", key="MONGO_URL"), env("MONGO_DB", "climguard_audit")], "256Mi"),
]

docs = [{"apiVersion": "v1", "kind": "Namespace", "metadata": {"name": NS}},
        {"apiVersion": "v1", "kind": "Secret", "metadata": {"name": SECRET, "namespace": NS}, "type": "Opaque",
         "stringData": {k: "CAMBIAR" for k in ["JWT_KEY", "JWT_ISSUER", "JWT_AUDIENCE", "INTERNAL_API_KEY", "CORS_ORIGINS", "AUTH_DB_PASSWORD",
            "ALERT_DB_PASSWORD", "COMMUNITY_DB_CONN", "SENSOR_DB_CONN", "MONGO_URL"]}}]
for name, port, envs, mem in SERVICES:
    labels = {"app": name}
    docs.append({"apiVersion": "apps/v1", "kind": "Deployment", "metadata": {"name": name, "namespace": NS},
        "spec": {"replicas": 1 if name == "sensor-service" else 2, "selector": {"matchLabels": labels},
            "template": {"metadata": {"labels": labels}, "spec": {
                "terminationGracePeriodSeconds": 30,
                "containers": [{"name": name, "image": f"climguard/{name}:3.0.0", "imagePullPolicy": "IfNotPresent",
                    "ports": [{"containerPort": port}], "env": envs,
                    "resources": {"requests": {"memory": mem, "cpu": "100m"}, "limits": {"memory": mem}},
                    "startupProbe": {"httpGet": {"path": "/health", "port": port}, "failureThreshold": 30, "periodSeconds": 5},
                    "livenessProbe": {"httpGet": {"path": "/health", "port": port}, "periodSeconds": 20},
                    "readinessProbe": {"httpGet": {"path": "/ready", "port": port}, "periodSeconds": 10}}]}}}})
    docs.append({"apiVersion": "v1", "kind": "Service", "metadata": {"name": name, "namespace": NS},
        "spec": {"selector": labels, "ports": [{"port": port, "targetPort": port}]}})
open("k8s/climguard.yaml", "w").write("# Generado por scripts/gen-k8s.py — datastores y Ingress TLS se despliegan aparte (ver README).\n" + yaml.safe_dump_all(docs, sort_keys=False, allow_unicode=True))
print(len(docs), "recursos escritos en k8s/climguard.yaml")
