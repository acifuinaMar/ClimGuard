"""Validación y normalización de filtros por tipo de reporte."""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional


class FilterError(ValueError):
    pass


_INT, _DATE, _BOOL = "int", "date", "bool"
FILTER_SPECS = {
    "COMMUNITIES": {"activo": _BOOL},
    "SENSORS": {"comunidadId": _INT, "tipoSensorId": _INT, "estadoSensorId": _INT},
    "READINGS": {"sensorId": _INT, "comunidadId": _INT, "tipoSensorId": _INT, "from": _DATE, "to": _DATE},
    "ALERTS": {"comunidadId": _INT, "sensorId": _INT, "nivelAlertaId": _INT, "tipoFenomenoId": _INT,
               "estadoAlertaId": _INT, "from": _DATE, "to": _DATE},
    "EVENT_HISTORY": {"comunidadId": _INT, "tipoFenomenoId": _INT, "from": _DATE, "to": _DATE},
    "SENSOR_STATUS": {"comunidadId": _INT},
    "CLIMATE_STATS": {"comunidadId": _INT, "from": _DATE, "to": _DATE},
    "EXECUTIVE": {"comunidadId": _INT, "from": _DATE, "to": _DATE},
}
DEFAULT_READINGS_DAYS = 1  # lecturas: sin rango se limita al último día (RNF-REP-05)


def _coerce(name, kind, value):
    if kind == _INT:
        if isinstance(value, bool):
            raise FilterError(f"'{name}' debe ser entero")
        try:
            n = int(value)
        except (TypeError, ValueError):
            raise FilterError(f"'{name}' debe ser entero")
        if n <= 0:
            raise FilterError(f"'{name}' debe ser mayor que cero")
        return n
    if kind == _BOOL:
        if isinstance(value, bool):
            return value
        if str(value).lower() in ("true", "1", "si", "sí"):
            return True
        if str(value).lower() in ("false", "0", "no"):
            return False
        raise FilterError(f"'{name}' debe ser booleano")
    try:
        return date.fromisoformat(str(value)[:10]).isoformat()
    except ValueError:
        raise FilterError(f"'{name}' debe tener formato AAAA-MM-DD")


def normalize_filters(report_type: str, raw: Optional[dict], today: Optional[date] = None) -> dict:
    spec = FILTER_SPECS.get(report_type)
    if spec is None:
        raise FilterError(f"Tipo de reporte no soportado: {report_type}")
    raw = {k: v for k, v in (raw or {}).items() if v not in (None, "")}
    unknown = sorted(set(raw) - set(spec))
    if unknown:
        raise FilterError(f"Filtros no permitidos para {report_type}: {', '.join(unknown)}")
    clean = {k: _coerce(k, spec[k], v) for k, v in raw.items()}
    if "from" in clean and "to" in clean and clean["from"] > clean["to"]:
        raise FilterError("'from' no puede ser posterior a 'to'")
    if report_type == "READINGS" and "from" not in clean and "to" not in clean:
        t = today or datetime.now(timezone.utc).date()
        clean["from"] = (t - timedelta(days=DEFAULT_READINGS_DAYS)).isoformat()
        clean["to"] = t.isoformat()
    return clean


def date_params(f: dict) -> dict:
    """Límites del rango como instantes UTC ('Z'), interpretando las fechas en la zona horaria del reporte."""
    import os
    from datetime import datetime, time as dtime, timezone
    from zoneinfo import ZoneInfo
    tz = ZoneInfo(os.getenv("REPORT_TIMEZONE", "America/Guatemala"))

    def utc(d, t):
        local = datetime.combine(datetime.strptime(d, "%Y-%m-%d").date(), t, tzinfo=tz)
        return local.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    out = {}
    if f.get("from"):
        out["desde"] = utc(f["from"], dtime.min)
    if f.get("to"):
        out["hasta"] = utc(f["to"], dtime(23, 59, 59, 999000))
    return out
