"""Utilidades de fecha/formato. Las fechas sin zona de la API se interpretan como UTC."""
from __future__ import annotations

import re
import unicodedata
from datetime import datetime, timezone
from typing import Any, Optional
from zoneinfo import ZoneInfo


def parse_dt(value: Any) -> Optional[datetime]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        text = re.sub(r"(\.\d{6})\d+", r"\1", str(value).strip().replace("Z", "+00:00"))
        try:
            dt = datetime.fromisoformat(text)
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def to_local(dt: Optional[datetime], tz_name: str) -> Optional[datetime]:
    return dt.astimezone(ZoneInfo(tz_name)) if dt else None


def fmt_date(dt, tz):
    l = to_local(dt, tz)
    return l.strftime("%d/%m/%Y") if l else "—"


def fmt_time(dt, tz):
    l = to_local(dt, tz)
    return l.strftime("%H:%M:%S") if l else "—"


def fmt_datetime(dt, tz):
    l = to_local(dt, tz)
    return l.strftime("%d/%m/%Y %H:%M") if l else "—"


def fmt_num(value: Any, decimals: int = 2) -> str:
    if value is None or value == "":
        return "—"
    try:
        return f"{float(value):,.{decimals}f}"
    except (TypeError, ValueError):
        return str(value)


def fmt_coord(lat: Any, lon: Any) -> str:
    try:
        return f"{float(lat):.5f}, {float(lon):.5f}"
    except (TypeError, ValueError):
        return "—"


def slugify(text: str) -> str:
    norm = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", norm).strip("-").lower() or "reporte"
