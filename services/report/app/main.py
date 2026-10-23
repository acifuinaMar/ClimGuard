"""Report Service (FastAPI). Rutas expuestas por el gateway bajo /api/reports."""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import date, datetime, time as dtime, timedelta, timezone
from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from .audit_client import AuditClient
from .clients import HttpxFetcher
from .config import Settings
from .reports.catalog import REPORT_TYPES
from .reports.filters import FILTER_SPECS, FilterError
from .security import AuthError, Principal, authenticate, require
from .service import ReportService
from .store import MongoStore

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("report")


class GenerateRequest(BaseModel):
    type: str = Field(min_length=1, max_length=40)
    filters: dict[str, Any] = Field(default_factory=dict)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = Settings.from_env()
    store = MongoStore(settings.mongo_url, settings.mongo_db)
    fetcher, audit = HttpxFetcher(settings.http_timeout), AuditClient(settings.audit_api_url)
    app.state.settings, app.state.store, app.state.tasks = settings, store, set()
    app.state.service = ReportService(settings, store, fetcher, audit=audit.send)
    try:
        await asyncio.to_thread(store.ensure_indexes)
        n = await asyncio.to_thread(store.fail_stale, timedelta(minutes=15), "Interrumpido por reinicio del servicio")
        if n:
            log.warning("%s reportes pendientes marcados como FAILED", n)
    except Exception as exc:  # noqa: BLE001
        log.warning("MongoDB no disponible al iniciar: %s", type(exc).__name__)
    yield
    tasks = set(app.state.tasks)  # apagado ordenado (SIGTERM de Docker/K8s)
    if tasks:
        log.info("Esperando %s reportes en curso...", len(tasks))
        await asyncio.wait(tasks, timeout=settings.shutdown_grace_seconds)
    await fetcher.aclose()
    await audit.aclose()
    store.close()


app = FastAPI(title="ClimGuard Report Service", version="3.0.0", lifespan=lifespan)


@app.exception_handler(AuthError)
async def _auth(_: Request, exc: AuthError):
    return JSONResponse(status_code=exc.status, content={"detail": exc.detail},
                        headers={"WWW-Authenticate": "Bearer"} if exc.status == 401 else None)


@app.exception_handler(FilterError)
async def _filter(_: Request, exc: FilterError):
    return JSONResponse(status_code=422, content={"detail": str(exc)})


def principal(request: Request, authorization: Optional[str] = Header(None)) -> Principal:
    s: Settings = request.app.state.settings
    return authenticate(authorization, key=s.jwt_key, issuer=s.jwt_issuer, audience=s.jwt_audience)


def svc(request: Request) -> ReportService:
    return request.app.state.service


def _day(v, end):
    if not v:
        return None
    try:
        return datetime.combine(date.fromisoformat(v[:10]), dtime.max if end else dtime.min, tzinfo=timezone.utc)
    except ValueError:
        raise HTTPException(422, "Fecha inválida, use AAAA-MM-DD")


def _pdf(meta, pdf):
    return Response(content=pdf, media_type="application/pdf", headers={
        "Content-Disposition": f'attachment; filename="{meta["fileName"]}"', "X-Report-Id": meta["reportId"], "Cache-Control": "no-store"})


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}


@app.get("/ready", include_in_schema=False)
async def ready(request: Request):
    if not await asyncio.to_thread(request.app.state.store.ping):
        return JSONResponse(status_code=503, content={"status": "mongo-unavailable"})
    return {"status": "ready"}


@app.get("/api/reports/types")
def types(p: Principal = Depends(principal)):
    if not (p.has("reports.generate") or p.has("reports.history")):
        raise AuthError(403, "Permiso requerido: reports.generate")
    return [{"key": t.key, "name": t.label, "description": t.description, "filters": sorted(FILTER_SPECS[t.key])}
            for t in REPORT_TYPES.values()]


@app.get("/api/reports/history")
async def history(request: Request, p: Principal = Depends(principal), page: int = Query(1, ge=1), pageSize: int = Query(20, ge=1, le=100),
                  type: Optional[str] = None, status: Optional[str] = None, desde: Optional[str] = None, hasta: Optional[str] = None):
    require(p, "reports.history")
    store = request.app.state.store
    items, total = await asyncio.to_thread(lambda: store.list(
        user_id=None if p.is_admin else p.user_id, type_=type.upper() if type else None, status=status.upper() if status else None,
        date_from=_day(desde, False), date_to=_day(hasta, True), page=page, page_size=pageSize))
    return JSONResponse(content=jsonable_encoder(items), headers={"X-Total-Count": str(total)})


@app.get("/api/reports/dashboard")
async def dashboard(request: Request, p: Principal = Depends(principal), comunidadId: Optional[int] = None,
                    desde: Optional[str] = None, hasta: Optional[str] = None):
    require(p, "dashboard.view")
    return await svc(request).dashboard(p, {"comunidadId": comunidadId, "from": desde, "to": hasta})


@app.post("/api/reports")
async def generate(body: GenerateRequest, request: Request, p: Principal = Depends(principal), sync: bool = False):
    require(p, "reports.generate")
    service = svc(request)
    meta = await service.create(p, body.type, body.filters)
    if sync:
        require(p, "reports.download")
        pdf = await service.run(meta["reportId"], p)
        final = await asyncio.to_thread(request.app.state.store.get, meta["reportId"])
        if pdf is None:
            raise HTTPException(502, (final or {}).get("error", "No fue posible generar el reporte"))
        await asyncio.to_thread(request.app.state.store.register_download, meta["reportId"], datetime.now(timezone.utc))
        return _pdf(final, pdf)
    task = asyncio.create_task(service.run(meta["reportId"], p))
    request.app.state.tasks.add(task)
    task.add_done_callback(request.app.state.tasks.discard)
    return JSONResponse(status_code=202, content=jsonable_encoder(meta), headers={"Location": f"/api/reports/{meta['reportId']}"})


@app.get("/api/reports/{report_id}")
async def get_report(report_id: str, request: Request, p: Principal = Depends(principal)):
    require(p, "reports.history")
    meta = await asyncio.to_thread(request.app.state.store.get, report_id)
    if meta is None or (not p.is_admin and meta.get("generatedBy") != p.user_id):
        raise HTTPException(404, "Reporte no encontrado")
    return meta


@app.get("/api/reports/{report_id}/download")
async def download(report_id: str, request: Request, p: Principal = Depends(principal)):
    require(p, "reports.download")  # RF-REP-10: solo administradores autorizados
    meta, pdf = await svc(request).download(p, report_id)
    if meta is None:
        raise HTTPException(404, "Reporte no encontrado")
    if pdf is None:
        raise HTTPException(409, f"El reporte no está disponible (estado: {meta.get('status')})")
    return _pdf(meta, pdf)


@app.post("/api/reports/{kind}")
async def generate_legacy(kind: str, request: Request, p: Principal = Depends(principal)):
    """Compatibilidad con la ruta del avance previo: POST /api/reports/{sensors|communities|alerts|readings}."""
    require(p, "reports.generate")
    require(p, "reports.download")
    service = svc(request)
    meta = await service.create(p, kind, {})
    pdf = await service.run(meta["reportId"], p)
    if pdf is None:
        final = await asyncio.to_thread(request.app.state.store.get, meta["reportId"])
        raise HTTPException(502, (final or {}).get("error", "No fue posible generar el reporte"))
    await asyncio.to_thread(request.app.state.store.register_download, meta["reportId"], datetime.now(timezone.utc))
    return _pdf(meta, pdf)
