import asyncio
import unittest
from datetime import date

from app.clients import ApiClient, FetchResult, UpstreamError
from app.reports.filters import FilterError, date_params, normalize_filters
from tests.fixtures import make_fetch

run = asyncio.run


def client(data, page_size=1000, max_rows=5000, headers=True, unpaged=False):
    async def fetch(url, params, h):
        if unpaged:
            return FetchResult(200, data, {})
        ps, pg = int(params["pageSize"]), int(params["page"])
        return FetchResult(200, data[(pg - 1) * ps: pg * ps], {"x-total-count": str(len(data))} if headers else {})
    return ApiClient("svc", "http://x", fetch, {}, page_size, max_rows)


class ClientTests(unittest.TestCase):
    def test_paginates(self):
        g = run(client(list(range(2500))).get_all("/p"))
        self.assertEqual((len(g.items), g.truncated, g.total), (2500, False, 2500))

    def test_truncates(self):
        g = run(client(list(range(2500)), max_rows=1500).get_all("/p"))
        self.assertEqual((len(g.items), g.truncated), (1500, True))

    def test_exact_fit(self):
        self.assertFalse(run(client(list(range(2000)), max_rows=2000).get_all("/p")).truncated)

    def test_truncation_without_header(self):
        g = run(client(list(range(3000)), max_rows=1000, headers=False).get_all("/p"))
        self.assertEqual((len(g.items), g.truncated), (1000, True))

    def test_unpaged_upstream_no_infinite_loop(self):
        self.assertEqual(len(run(client(list(range(50)), page_size=10, unpaged=True).get_all("/p")).items), 50)

    def test_upstream_errors(self):
        c = ApiClient("sensor-service", "http://x", make_fetch(fail_paths=("/api/sensors",)), {}, 100, 100)
        with self.assertRaises(UpstreamError) as ctx:
            run(c.get_all("/api/sensors"))
        self.assertEqual((ctx.exception.service, ctx.exception.status), ("sensor-service", 500))
        with self.assertRaises(UpstreamError):
            run(ApiClient("s", "http://x", make_fetch({}), {}, 100, 100).get_json("/nada"))

    def test_none_params_dropped(self):
        calls = []
        run(ApiClient("s", "http://x", make_fetch(calls=calls), {}, 100, 100).get_all("/api/sensors", {"comunidadId": None, "tipoSensorId": 3}))
        self.assertNotIn("comunidadId", calls[0][1])
        self.assertEqual(calls[0][1]["tipoSensorId"], 3)


class FilterTests(unittest.TestCase):
    def test_valid(self):
        self.assertEqual(normalize_filters("ALERTS", {"comunidadId": "15", "from": "2026-09-01", "to": "2026-09-24"}),
                         {"comunidadId": 15, "from": "2026-09-01", "to": "2026-09-24"})

    def test_rejections(self):
        for t, raw in (("COMMUNITIES", {"sensorId": 1}), ("ALERTS", {"comunidadId": "abc"}), ("ALERTS", {"comunidadId": 0}),
                       ("ALERTS", {"from": "ayer"}), ("ALERTS", {"from": "2026-10-02", "to": "2026-10-01"}),
                       ("COMMUNITIES", {"activo": "quizás"}), ("NOPE", {})):
            with self.assertRaises(FilterError, msg=str((t, raw))):
                normalize_filters(t, raw)

    def test_readings_default_range_and_dates(self):
        f = normalize_filters("READINGS", {}, today=date(2026, 10, 21))
        self.assertEqual((f["from"], f["to"]), ("2026-10-20", "2026-10-21"))
        self.assertEqual(normalize_filters("READINGS", {"from": "2026-01-01"}, today=date(2026, 10, 21)), {"from": "2026-01-01"})
        self.assertEqual(normalize_filters("SENSORS", {"comunidadId": "", "tipoSensorId": None}), {})
        self.assertEqual(date_params({"from": "2026-09-01", "to": "2026-09-24"}), {"desde": "2026-09-01T06:00:00.000Z", "hasta": "2026-09-25T05:59:59.999Z"})
