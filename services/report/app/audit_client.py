"""Eventos al Audit Service por API (un fallo de auditoría no rompe el reporte)."""
from __future__ import annotations

import logging

log = logging.getLogger("report.audit")


class AuditClient:
    def __init__(self, base_url: str, timeout: int = 5):
        self._base, self._timeout, self._client = base_url.rstrip("/"), timeout, None

    async def send(self, token, action, resource, detail):
        try:
            import httpx
            if self._client is None:
                self._client = httpx.AsyncClient(timeout=self._timeout)
            r = await self._client.post(f"{self._base}/api/audit", headers={"Authorization": f"Bearer {token}"},
                                        json={"action": action, "resource": resource, "detail": detail})
            if r.status_code >= 400:
                log.warning("Audit Service respondió %s para %s", r.status_code, action)
        except Exception as exc:  # noqa: BLE001
            log.warning("No se pudo auditar %s: %s", action, type(exc).__name__)

    async def aclose(self):
        if self._client is not None:
            await self._client.aclose()
