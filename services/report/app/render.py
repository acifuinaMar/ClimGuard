"""HTML (Jinja2) → PDF (WeasyPrint)."""
from __future__ import annotations

import re
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .reports.base import ReportDocument

_env = Environment(loader=FileSystemLoader(str(Path(__file__).parent / "templates")), autoescape=select_autoescape(["html"]))
_SAFE_ID = re.compile(r"[^A-Za-z0-9\-]")


def render_html(doc: ReportDocument, *, report_id, user, generated_at, tz, max_rows) -> str:
    meta = {"report_id": _SAFE_ID.sub("", report_id), "user": user, "generated_at": generated_at, "tz": tz, "max_rows": max_rows}
    return _env.get_template("report.html").render(doc=doc, meta=meta)


def html_to_pdf(html: str) -> bytes:
    from weasyprint import HTML  # import perezoso (dependencias nativas)
    return HTML(string=html).write_pdf()
