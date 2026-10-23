"""Configuración del Report Service (solo variables de entorno: apto para ConfigMap/Secret de K8s)."""
from __future__ import annotations

import os
from dataclasses import dataclass


def _int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError as exc:
        raise RuntimeError(f"Variable {name} debe ser entera, recibida: {raw!r}") from exc


@dataclass(frozen=True)
class Settings:
    jwt_key: str
    jwt_issuer: str
    jwt_audience: str
    mongo_url: str = "mongodb://mongo:27017"
    mongo_db: str = "climguard_reports"
    community_api_url: str = "http://community-service:8080"
    sensor_api_url: str = "http://sensor-service:8080"
    alert_api_url: str = "http://alert-service:8080"
    audit_api_url: str = "http://audit-service:8000"
    internal_api_key: str = ""
    page_size: int = 1000
    max_rows: int = 5000
    concurrency: int = 2
    sensor_stale_minutes: int = 30
    http_timeout: int = 30
    timezone: str = "America/Guatemala"
    shutdown_grace_seconds: int = 25

    @staticmethod
    def from_env() -> "Settings":
        key = os.getenv("JWT_KEY", "")
        if len(key.encode()) < 32:
            raise RuntimeError("JWT_KEY es obligatoria y debe tener al menos 32 bytes")
        issuer = os.getenv("JWT_ISSUER", "")
        audience = os.getenv("JWT_AUDIENCE", "")
        if not issuer or not audience:
            raise RuntimeError("JWT_ISSUER y JWT_AUDIENCE son obligatorias")
        d = Settings.__dataclass_fields__
        return Settings(
            jwt_key=key, jwt_issuer=issuer, jwt_audience=audience,
            mongo_url=os.getenv("MONGO_URL", d["mongo_url"].default),
            mongo_db=os.getenv("MONGO_DB", d["mongo_db"].default),
            community_api_url=os.getenv("COMMUNITY_API_URL", d["community_api_url"].default).rstrip("/"),
            sensor_api_url=os.getenv("SENSOR_API_URL", d["sensor_api_url"].default).rstrip("/"),
            alert_api_url=os.getenv("ALERT_API_URL", d["alert_api_url"].default).rstrip("/"),
            audit_api_url=os.getenv("AUDIT_API_URL", d["audit_api_url"].default).rstrip("/"),
            internal_api_key=os.getenv("INTERNAL_API_KEY", ""),
            page_size=_int("REPORT_PAGE_SIZE", 1000), max_rows=_int("REPORT_MAX_ROWS", 5000),
            concurrency=max(1, _int("REPORT_CONCURRENCY", 2)),
            sensor_stale_minutes=_int("SENSOR_STALE_MINUTES", 30),
            http_timeout=_int("HTTP_TIMEOUT_SECONDS", 30),
            timezone=os.getenv("REPORT_TIMEZONE", "America/Guatemala"),
            shutdown_grace_seconds=_int("SHUTDOWN_GRACE_SECONDS", 25),
        )
