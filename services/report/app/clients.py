"""Clientes HTTP hacia las APIs de otros servicios (§16: nunca a sus bases de datos)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Awaitable, Callable, Optional


@dataclass
class FetchResult:
    status: int
    data: Any
    headers: dict = field(default_factory=dict)


Fetcher = Callable[[str, dict, dict], Awaitable[FetchResult]]


class UpstreamError(Exception):
    def __init__(self, service: str, status: int, detail: str = ""):
        super().__init__(f"{service} respondió {status}: {detail}")
        self.service, self.status, self.detail = service, status, detail


@dataclass
class Collected:
    items: list
    truncated: bool = False
    total: Optional[int] = None


class HttpxFetcher:
    def __init__(self, timeout: int):
        self._timeout, self._client = timeout, None

    async def __call__(self, url, params, headers) -> FetchResult:
        import httpx
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self._timeout)
        try:
            resp = await self._client.get(url, params=params, headers=headers)
        except httpx.HTTPError as exc:
            raise UpstreamError(url, 0, type(exc).__name__) from exc
        try:
            data = resp.json()
        except ValueError:
            data = None
        return FetchResult(resp.status_code, data, {k.lower(): v for k, v in resp.headers.items()})

    async def aclose(self):
        if self._client is not None:
            await self._client.aclose()
            self._client = None


def _unwrap(data: Any) -> list:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("items", "data", "results", "content"):
            if isinstance(data.get(key), list):
                return data[key]
        for v in data.values():
            if isinstance(v, list):
                return v
    if data is None:
        return []
    raise UpstreamError("respuesta", 502, "Formato de respuesta no compatible (se esperaba una lista)")


class ApiClient:
    def __init__(self, name, base_url, fetch: Fetcher, headers, page_size, max_rows):
        self.name, self.base_url, self._fetch = name, base_url.rstrip("/"), fetch
        self._headers, self.page_size, self.max_rows = headers, page_size, max_rows

    async def get_json(self, path, params=None):
        res = await self._fetch(self.base_url + path, {k: v for k, v in (params or {}).items() if v is not None}, self._headers)
        if res.status >= 400 or res.status == 0:
            raise UpstreamError(self.name, res.status, str(res.data)[:200])
        return res.data

    async def get_all(self, path, params=None, max_rows=None) -> Collected:
        """Pagina con page/pageSize (total en X-Total-Count) hasta max_rows (RNF-REP-05)."""
        limit, ps = max_rows or self.max_rows, self.page_size
        items, total, page, unpaged, last_len = [], None, 1, False, 0
        while True:
            q = {k: v for k, v in (params or {}).items() if v is not None}
            q.update({"page": page, "pageSize": ps})
            res = await self._fetch(self.base_url + path, q, self._headers)
            if res.status >= 400 or res.status == 0:
                raise UpstreamError(self.name, res.status, str(res.data)[:200])
            data = _unwrap(res.data)
            if total is None and "x-total-count" in res.headers:
                try:
                    total = int(res.headers["x-total-count"])
                except ValueError:
                    total = None
            last_len = len(data)
            if page == 1 and last_len > ps:
                unpaged = True
            items.extend(data)
            if unpaged or last_len < ps or len(items) >= limit or page >= 100000:
                break
            page += 1
        if total is not None:
            truncated = total > limit and len(items) >= limit
        else:
            truncated = len(items) > limit or (len(items) == limit and last_len == ps and not unpaged)
        return Collected(items[:limit], truncated, total)


@dataclass
class Apis:
    community: ApiClient
    sensor: ApiClient
    alert: ApiClient

    @staticmethod
    def for_user(settings, fetch: Fetcher, token: str) -> "Apis":
        h = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        mk = lambda n, u: ApiClient(n, u, fetch, h, settings.page_size, settings.max_rows)  # noqa: E731
        return Apis(mk("community-service", settings.community_api_url), mk("sensor-service", settings.sensor_api_url),
                    mk("alert-service", settings.alert_api_url))
