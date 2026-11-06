"""Flujo §11: obtener datos → preparar → HTML → PDF → registrar metadata."""
from __future__ import annotations

import asyncio
import logging
import os
import tempfile
import time
from datetime import datetime, timezone
from typing import Awaitable, Callable, Optional

from .clients import Apis, Fetcher, ReportLimitError, UpstreamError
from .config import Settings
from .pdfbuild import assemble_pdf, split_document
from .render import html_to_pdf, render_html
from .reports.base import BuildContext
from .reports.catalog import REPORT_TYPES, ReportType, collect_executive, executive_indicators, resolve_type
from .reports.filters import FilterError, normalize_filters
from .security import Principal
from .utils import fmt_datetime

log = logging.getLogger("report.service")
TMP_PREFIX = "climguard-report-"


class ReportBusy(Exception):
    """Ya hay REPORT_MAX_QUEUE reportes PENDING/PROCESSING: se rechaza uno nuevo (429) en lugar de acumular trabajo en memoria."""

    def __init__(self, active: int, limit: int):
        super().__init__(f"Hay {active} reportes en cola o procesándose (máximo {limit}). Intente de nuevo en unos minutos.")
        self.user_message = str(self)


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
        active = await self._db(self.store.count_active)
        if active >= self.settings.max_queue:
            raise ReportBusy(active, self.settings.max_queue)
        now = datetime.now(timezone.utc)
        rid = await self._db(self.store.next_report_id, now.year)
        meta = {"reportId": rid, "type": rt.key, "generatedBy": p.user_id, "generatedByName": p.username, "generatedAt": now,
                "filters": filters, "status": "PENDING", "fileName": f"{rt.slug}-{rid}.pdf", "downloadCount": 0, "lastDownloadedAt": None}
        await self._db(self.store.create, meta)
        await self._audit_event(p, "REPORT_REQUESTED", rid, {"type": rt.key, "filters": filters})
        return meta

    async def run(self, report_id, p: Principal, return_bytes: bool = True) -> Optional[bytes]:
        """Pipeline completo. Nunca lanza: deja FAILED con el motivo y un código (LIMIT_EXCEEDED, UPSTREAM, INTERNAL).

        return_bytes=False (ruta asíncrona normal) no vuelve a cargar el PDF en memoria: devuelve True/None. Las rutas síncronas
        (?sync=true y la heredada POST /api/reports/{tipo}) necesitan los bytes y usan el valor por defecto.
        """
        meta = await self._db(self.store.get, report_id)
        if meta is None:
            return None
        rt = REPORT_TYPES[meta["type"]]
        started = time.monotonic()
        tmp_path = None
        try:
            async with self._sem:                                    # PENDING mientras espera turno; PROCESSING al empezar
                await self._db(self.store.update, report_id, {"status": "PROCESSING"})
                data = await rt.collect(Apis.for_user(self.settings, self.fetch, p.token), meta["filters"])
                doc = rt.build(data, meta["filters"], self._ctx())
                del data                                             # los datos crudos ya no hacen falta: quedan solo las filas
                generated_at = fmt_datetime(datetime.now(timezone.utc), self.settings.timezone)
                parts = split_document(doc, self.settings.chunk_rows)
                tmp_path = self._new_tmp()

                def render_part(d, first, last, stamp):
                    return render_html(d, report_id=report_id, user=p.username, tz=self.settings.timezone, generated_at=generated_at,
                                       max_rows=self.settings.max_rows, first=first, last=last, stamp_pages=stamp)

                pages = await asyncio.to_thread(assemble_pdf, parts, render_part, self._pdf_fn, tmp_path)
                size = os.path.getsize(tmp_path)
                await self._db(self.store.save_pdf_file, report_id, meta["fileName"], tmp_path)
            await self._db(self.store.update, report_id, {
                "status": "COMPLETED", "fileSize": size, "rowCount": doc.row_count, "truncated": doc.truncated,
                "pages": pages, "chunks": len(parts), "completedAt": datetime.now(timezone.utc),
                "durationMs": int((time.monotonic() - started) * 1000)})
            await self._audit_event(p, "REPORT_GENERATED", report_id, {"type": rt.key, "rows": doc.row_count})
            if not return_bytes:
                return True
            with open(tmp_path, "rb") as fh:
                return fh.read()
        except ReportLimitError as exc:
            log.warning("Reporte %s: %s", report_id, exc.user_message)
            await self._fail(report_id, exc.user_message, "LIMIT_EXCEEDED",
                             {"limit": exc.limit, "totalRows": exc.total})
        except UpstreamError as exc:
            log.warning("Reporte %s: fallo upstream %s", report_id, exc)
            await self._fail(report_id, f"No fue posible obtener datos de {exc.service} (HTTP {exc.status})", "UPSTREAM")
        except Exception as exc:  # noqa: BLE001
            log.exception("Reporte %s falló", report_id)
            await self._fail(report_id, f"Error interno al generar el reporte: {type(exc).__name__}", "INTERNAL")
        finally:
            self._remove(tmp_path)
        return None

    async def _fail(self, report_id, reason, code="INTERNAL", extra=None):
        try:
            await self._db(self.store.update, report_id, {"status": "FAILED", "error": reason, "errorCode": code,
                                                          "completedAt": datetime.now(timezone.utc), **(extra or {})})
        except Exception:  # noqa: BLE001
            log.exception("No se pudo marcar %s como FAILED", report_id)

    # ---- archivos temporales: siempre se borran al terminar (éxito o error) y los huérfanos al arrancar ----
    def _new_tmp(self) -> str:
        fd, path = tempfile.mkstemp(prefix=TMP_PREFIX, suffix=".pdf", dir=self.settings.tmp_dir or None)
        os.close(fd)
        return path

    @staticmethod
    def _remove(path):
        if path:
            try:
                os.remove(path)
            except FileNotFoundError:
                pass
            except OSError:
                log.warning("No se pudo borrar el temporal %s", path)

    @staticmethod
    def cleanup_orphan_tmp(tmp_dir: str = "", older_than_s: int = 600) -> int:
        """Borra temporales de ejecuciones anteriores (p. ej. el proceso murió por falta de memoria a mitad de un reporte)."""
        base = tmp_dir or tempfile.gettempdir()
        n, limit = 0, time.time() - older_than_s
        try:
            for name in os.listdir(base):
                full = os.path.join(base, name)
                if name.startswith(TMP_PREFIX) and os.path.isfile(full) and os.path.getmtime(full) < limit:
                    os.remove(full)
                    n += 1
        except OSError:
            log.warning("No se pudo limpiar temporales en %s", base)
        return n

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

    async def open_download(self, p: Principal, report_id):
        """Como download(), pero devuelve un lector por bloques (read/close/length) para responder en streaming sin cargar el PDF."""
        meta = await self._db(self.store.get, report_id)
        if meta is None or meta.get("status") != "COMPLETED":
            return meta, None
        handle = await self._db(self.store.open_pdf, report_id)
        if handle is None:
            return meta, None
        await self._db(self.store.register_download, report_id, datetime.now(timezone.utc))
        await self._audit_event(p, "REPORT_DOWNLOADED", report_id, {"type": meta["type"]})
        return meta, handle

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
