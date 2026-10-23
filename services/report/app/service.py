"""Flujo §11: obtener datos → preparar → HTML → PDF → registrar metadata."""
from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timezone
from typing import Awaitable, Callable, Optional

from .clients import Apis, Fetcher, UpstreamError
from .config import Settings
from .render import html_to_pdf, render_html
from .reports.base import BuildContext
from .reports.catalog import REPORT_TYPES, ReportType, collect_executive, executive_indicators, resolve_type
from .reports.filters import FilterError, normalize_filters
from .security import Principal
from .utils import fmt_datetime

log = logging.getLogger("report.service")


class ReportService:
    def __init__(self, settings: Settings, store, fetch: Fetcher, pdf_fn: Callable[[str], bytes] = html_to_pdf,
                 audit: Optional[Callable[..., Awaitable[None]]] = None):
        self.settings, self.store, self.fetch, self._pdf_fn, self._audit = settings, store, fetch, pdf_fn, audit
        self._sem = asyncio.Semaphore(settings.concurrency)
        self._dash_cache: dict = {}

    async def _db(self, fn, *a, **kw):
        return await asyncio.to_thread(fn, *a, **kw)

    async def _audit_event(self, p: Principal, action, report_id, detail):
        if self._audit:
            await self._audit(p.token, action, "Report", {"reportId": report_id, **detail})

    def _ctx(self):
        s = self.settings
        return BuildContext(tz=s.timezone, stale_minutes=s.sensor_stale_minutes, now=datetime.now(timezone.utc), max_rows=s.max_rows)

    def resolve(self, type_name) -> ReportType:
        rt = resolve_type(type_name)
        if rt is None:
            raise FilterError(f"Tipo de reporte no soportado: {type_name}")
        return rt

    async def create(self, p: Principal, type_name, raw_filters) -> dict:
        rt = self.resolve(type_name)
        filters = normalize_filters(rt.key, raw_filters)
        now = datetime.now(timezone.utc)
        rid = await self._db(self.store.next_report_id, now.year)
        meta = {"reportId": rid, "type": rt.key, "generatedBy": p.user_id, "generatedByName": p.username, "generatedAt": now,
                "filters": filters, "status": "PENDING", "fileName": f"{rt.slug}-{rid}.pdf", "downloadCount": 0, "lastDownloadedAt": None}
        await self._db(self.store.create, meta)
        await self._audit_event(p, "REPORT_REQUESTED", rid, {"type": rt.key, "filters": filters})
        return meta

    async def run(self, report_id, p: Principal) -> Optional[bytes]:
        """Pipeline completo. Nunca lanza: deja FAILED con el motivo."""
        meta = await self._db(self.store.get, report_id)
        if meta is None:
            return None
        rt = REPORT_TYPES[meta["type"]]
        await self._db(self.store.update, report_id, {"status": "PROCESSING"})
        started = time.monotonic()
        try:
            async with self._sem:
                data = await rt.collect(Apis.for_user(self.settings, self.fetch, p.token), meta["filters"])
                doc = rt.build(data, meta["filters"], self._ctx())
                html = render_html(doc, report_id=report_id, user=p.username, tz=self.settings.timezone,
                                   generated_at=fmt_datetime(datetime.now(timezone.utc), self.settings.timezone),
                                   max_rows=self.settings.max_rows)
                pdf = await asyncio.to_thread(self._pdf_fn, html)
            await self._db(self.store.save_pdf, report_id, meta["fileName"], pdf)
            await self._db(self.store.update, report_id, {
                "status": "COMPLETED", "fileSize": len(pdf), "rowCount": doc.row_count, "truncated": doc.truncated,
                "completedAt": datetime.now(timezone.utc), "durationMs": int((time.monotonic() - started) * 1000)})
            await self._audit_event(p, "REPORT_GENERATED", report_id, {"type": rt.key, "rows": doc.row_count})
            return pdf
        except UpstreamError as exc:
            log.warning("Reporte %s: fallo upstream %s", report_id, exc)
            await self._fail(report_id, f"No fue posible obtener datos de {exc.service} (HTTP {exc.status})")
        except Exception as exc:  # noqa: BLE001
            log.exception("Reporte %s falló", report_id)
            await self._fail(report_id, f"Error interno al generar el reporte: {type(exc).__name__}")
        return None

    async def _fail(self, report_id, reason):
        try:
            await self._db(self.store.update, report_id, {"status": "FAILED", "error": reason, "completedAt": datetime.now(timezone.utc)})
        except Exception:  # noqa: BLE001
            log.exception("No se pudo marcar %s como FAILED", report_id)

    async def download(self, p: Principal, report_id):
        meta = await self._db(self.store.get, report_id)
        if meta is None or meta.get("status") != "COMPLETED":
            return meta, None
        pdf = await self._db(self.store.load_pdf, report_id)
        if pdf is None:
            return meta, None
        await self._db(self.store.register_download, report_id, datetime.now(timezone.utc))
        await self._audit_event(p, "REPORT_DOWNLOADED", report_id, {"type": meta["type"]})
        return meta, pdf

    async def dashboard(self, p: Principal, filters, ttl=30):
        clean = normalize_filters("EXECUTIVE", filters)
        key = (p.user_id, tuple(sorted(clean.items())))
        hit = self._dash_cache.get(key)
        if hit and time.monotonic() - hit[0] < ttl:
            return hit[1]
        data = await collect_executive(Apis.for_user(self.settings, self.fetch, p.token), clean)
        result = executive_indicators(data, clean, self._ctx())
        self._dash_cache[key] = (time.monotonic(), result)
        if len(self._dash_cache) > 200:
            self._dash_cache.pop(next(iter(self._dash_cache)))
        return result
