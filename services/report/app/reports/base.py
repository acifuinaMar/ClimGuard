from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass
class Card:
    label: str
    value: str
    tone: str = ""


@dataclass
class Section:
    title: str = ""
    columns: list = field(default_factory=list)
    rows: list = field(default_factory=list)
    cards: list = field(default_factory=list)
    note: str = ""
    empty_text: str = "Sin datos para los filtros seleccionados."
    narrow: bool = False


@dataclass
class ReportDocument:
    type: str
    title: str
    subtitle: str = ""
    filters: list = field(default_factory=list)
    sections: list = field(default_factory=list)
    row_count: int = 0
    truncated: bool = False
    notes: list = field(default_factory=list)


@dataclass
class BuildContext:
    tz: str = "America/Guatemala"
    stale_minutes: int = 30
    now: datetime | None = None
    max_rows: int = 5000


def by_id(items: list, key: str) -> dict:
    return {i.get(key): i for i in items if isinstance(i, dict)}
