"""Audit Service (FastAPI + MongoDB). Rutas bajo /api/audit."""
from __future__ import annotations

import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import date, datetime, time as dtime, timezone
from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .logic import build_event, internal_key_ok, to_bitacora
from .security import AuthError, Principal, authenticate, require

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("audit")


class EventIn(BaseModel):
    action: str = Field(min_length=1, max_length=120)
    resource: str = Field(min_length=1, max_length=120)
    detail: dict[str, Any] = Field(default_factory=dict)
    userId: Optional[str] = Field(default=None, max_length=60)  # solo con X-Internal-Key
    user: Optional[str] = Field(default=None, max_length=120)


@asynccontextmanager
async def lifespan(app: FastAPI):
    from pymongo import MongoClient
    key = os.getenv("JWT_KEY", "")
    if len(key.encode()) < 32 or not os.getenv("JWT_ISSUER") or not os.getenv("JWT_AUDIENCE"):
        raise RuntimeError("JWT_KEY (>=32 bytes), JWT_ISSUER y JWT_AUDIENCE son obligatorias")
    app.state.jwt = dict(key=key, issuer=os.environ["JWT_ISSUER"], audience=os.environ["JWT_AUDIENCE"])
    app.state.internal_key = os.getenv("INTERNAL_API_KEY", "")
    client = MongoClient(os.getenv("MONGO_URL", "mongodb://mongo:27017"), serverSelectionTimeoutMS=5000, tz_aware=True)
    app.state.client = client
    app.state.events = client[os.getenv("MONGO_DB", "climguard_audit")]["events"]
    try:
        ev = app.state.events
        await asyncio.to_thread(lambda: (ev.create_index([("timestamp", -1)]), ev.create_index("userId"),
                                         ev.create_index([("resource", 1), ("action", 1)])))
    except Exception as exc:  # noqa: BLE001
        log.warning("MongoDB no disponible al iniciar: %s", type(exc).__name__)
    yield
    client.close()


app = FastAPI(title="ClimGuard Audit Service", version="3.0.0", lifespan=lifespan)


@app.exception_handler(AuthError)
async def _auth(_: Request, exc: AuthError):
    return JSONResponse(status_code=exc.status, content={"detail": exc.detail},
                        headers={"WWW-Authenticate": "Bearer"} if exc.status == 401 else None)


def principal(request: Request, authorization: Optional[str] = Header(None)) -> Principal:
    return authenticate(authorization, **request.app.state.jwt)


def _day(v, end):
    if not v:
        return None
    try:
        return datetime.combine(date.fromisoformat(v[:10]), dtime.max if end else dtime.min, tzinfo=timezone.utc)
    except ValueError:
        raise HTTPException(422, "Fecha inválida, use AAAA-MM-DD")


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok"}


@app.get("/ready", include_in_schema=False)
async def ready(request: Request):
    try:
        await asyncio.to_thread(request.app.state.client.admin.command, "ping")
        return {"status": "ready"}
    except Exception:  # noqa: BLE001
        return JSONResponse(status_code=503, content={"status": "mongo-unavailable"})


@app.post("/api/audit", status_code=201)
async def create(event: EventIn, request: Request, authorization: Optional[str] = Header(None),
                 x_internal_key: Optional[str] = Header(None)):
    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else None)
    if internal_key_ok(x_internal_key, request.app.state.internal_key):
        uid, uname, source = event.userId or "system", event.user or "system", "internal"
    else:
        p = authenticate(authorization, **request.app.state.jwt)
        uid, uname, source = p.user_id, p.username, "user"
    doc = build_event(event.action, event.resource, event.detail, uid, uname, source, ip)
    if len(str(doc["detail"]).encode()) > 8192:
        raise HTTPException(413, "El detalle del evento excede 8 KB")
    try:
        res = await asyncio.to_thread(request.app.state.events.insert_one, doc)
    except Exception:  # noqa: BLE001
        raise HTTPException(503, "MongoDB no disponible")
    return {"id": str(res.inserted_id)}


@app.get("/api/audit")
async def list_events(request: Request, p: Principal = Depends(principal), page: int = Query(1, ge=1),
                      pageSize: int = Query(50, ge=1, le=200), user: Optional[str] = None, action: Optional[str] = None,
                      resource: Optional[str] = None, desde: Optional[str] = None, hasta: Optional[str] = None):
    require(p, "audit.read")
    q: dict[str, Any] = {k: v for k, v in (("user", user), ("action", action), ("resource", resource)) if v}
    a, b = _day(desde, False), _day(hasta, True)
    if a or b:
        q["timestamp"] = {k: v for k, v in (("$gte", a), ("$lte", b)) if v}
    col = request.app.state.events

    def fetch():
        total = col.count_documents(q)
        cur = col.find(q).sort("timestamp", -1).skip((page - 1) * pageSize).limit(pageSize)
        return [{**{k: v for k, v in d.items() if k != "_id"}, "id": str(d["_id"])} for d in cur], total
    try:
        items, total = await asyncio.to_thread(fetch)
    except Exception:  # noqa: BLE001
        raise HTTPException(503, "MongoDB no disponible")
    return JSONResponse(content=jsonable_encoder(items), headers={"X-Total-Count": str(total)})


@app.get("/api/audit/bitacora")
async def bitacora(request: Request, p: Principal = Depends(principal), limit: int = Query(200, ge=1, le=1000)):
    """Misma forma que /api/Bitacora de la Fase 2, para el Angular existente."""
    require(p, "audit.read")
    col = request.app.state.events
    try:
        docs = await asyncio.to_thread(lambda: list(col.find().sort("timestamp", -1).limit(limit)))
    except Exception:  # noqa: BLE001
        raise HTTPException(503, "MongoDB no disponible")
    return [to_bitacora(d, len(docs) - i) for i, d in enumerate(docs)]
