"""Lógica pura del Audit Service."""
from __future__ import annotations

import hmac
from datetime import datetime, timezone
from typing import Any, Optional

SENSITIVE = {"password", "contraseña", "passwordhash", "token", "authorization", "secret"}


def scrub(obj: Any, depth: int = 0) -> Any:
    if depth > 6:
        return "…"
    if isinstance(obj, dict):
        return {k: ("***" if str(k).lower() in SENSITIVE else scrub(v, depth + 1)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [scrub(v, depth + 1) for v in obj[:200]]
    return obj


def internal_key_ok(provided: Optional[str], expected: str) -> bool:
    return bool(expected) and bool(provided) and hmac.compare_digest(provided, expected)


def build_event(action, resource, detail, user_id, username, source, ip) -> dict:
    return {"action": action, "resource": resource, "detail": scrub(detail), "userId": user_id, "user": username,
            "source": source, "ip": ip, "timestamp": datetime.now(timezone.utc)}


def to_bitacora(doc: dict, seq: int) -> dict:
    """Forma legada BitacoraResultDto (Angular Fase 2)."""
    d = doc.get("detail") or {}
    eid = d.get("id") or d.get("sensorId") or d.get("comunidadId") or 0
    try:
        eid = int(eid)
    except (TypeError, ValueError):
        eid = 0
    try:
        uid = int(doc.get("userId"))
    except (TypeError, ValueError):
        uid = 0
    return {"bitacoraId": seq, "nombreEntidad": doc.get("resource", ""), "entidadId": eid, "accion": doc.get("action", ""),
            "descripcion": str(d.get("descripcion") or doc.get("action", "")), "fechaHora": doc["timestamp"].isoformat(),
            "usuarioId": uid, "usuario": doc.get("user", "")}
