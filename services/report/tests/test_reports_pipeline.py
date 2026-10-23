import asyncio
import unittest
from datetime import datetime, timedelta, timezone

from app.clients import Apis
from app.config import Settings
from app.render import render_html
from app.reports.base import BuildContext
from app.reports.catalog import REPORT_TYPES, collect_executive, executive_indicators, resolve_type
from app.reports.filters import FilterError, normalize_filters
from app.security import Principal
from app.service import ReportService
from app.store import MemoryStore
from tests import fixtures as fx

SETTINGS = Settings(jwt_key="k" * 40, jwt_issuer="i", jwt_audience="a", page_size=1000, max_rows=5000)
NOW = datetime(2026, 10, 22, 0, 0, tzinfo=timezone.utc)
CTX = BuildContext(tz="America/Guatemala", stale_minutes=30, now=NOW, max_rows=5000)
ADMIN = Principal("5", "admin", ("Administrador",), frozenset({"reports.generate", "reports.download", "reports.history", "dashboard.view"}), "TOKEN")
run = asyncio.run


def build(key, raw=None):
    rt = REPORT_TYPES[key]
    f = normalize_filters(key, raw or {})
    return rt.build(run(rt.collect(Apis.for_user(SETTINGS, fx.make_fetch(), "TOKEN"), f)), f, CTX), f


class BuilderTests(unittest.TestCase):
    def test_eight_types(self):
        self.assertEqual(sorted(REPORT_TYPES), sorted(["COMMUNITIES", "SENSORS", "READINGS", "ALERTS", "EVENT_HISTORY", "SENSOR_STATUS", "CLIMATE_STATS", "EXECUTIVE"]))

    def test_communities(self):
        doc, _ = build("COMMUNITIES")
        s = doc.sections[0]
        self.assertEqual(s.columns, ["Nombre", "Municipio", "Departamento", "País", "Coordenadas", "Estado", "Sensores"])
        row = {r[0]: r for r in s.rows}
        self.assertEqual((row["San Juan"][6], row["El Mirador"][5], row["San Juan"][4]), ("2", "Inactiva", "14.30000, -90.78000"))
        self.assertEqual([r[0] for r in build("COMMUNITIES", {"activo": False})[0].sections[0].rows], ["El Mirador"])

    def test_sensors(self):
        s = build("SENSORS", {"comunidadId": 1})[0].sections[0]
        self.assertEqual(s.columns, ["Código", "Nombre", "Tipo", "Comunidad", "Ubicación", "Unidad", "Estado", "Instalación"])
        self.assertEqual([r[0] for r in s.rows], ["H-001", "T-001"])
        self.assertEqual((s.rows[1][2], s.rows[1][5], s.rows[1][7]), ("Temperatura", "°C", "14/01/2026"))

    def test_readings(self):
        doc, _ = build("READINGS", {"from": "2026-10-01", "to": "2026-10-22"})
        s = doc.sections[0]
        self.assertEqual(s.columns, ["Sensor", "Comunidad", "Fecha", "Hora", "Valor", "Unidad", "Estado"])
        self.assertEqual((s.rows[0][:2], s.rows[0][2:5], doc.row_count), (["Temp San Juan", "San Juan"], ["21/10/2026", "13:00:00", "30.10"], 3))
        self.assertIn(("Desde", "01/10/2026"), doc.filters)
        self.assertIn("from", build("READINGS")[1])

    def test_alerts(self):
        s = build("ALERTS")[0].sections[0]
        self.assertEqual(s.columns, ["Fecha", "Hora", "Comunidad", "Sensor", "Fenómeno", "Nivel", "Valor", "Umbral", "Mensaje", "Estado"])
        self.assertEqual((s.rows[0][4], s.rows[0][5], s.rows[0][7]), ("Helada", "Precaución (Amarillo)", "fuera de 0.00 – 3.80"))
        self.assertEqual((s.rows[1][4], s.rows[1][5], s.rows[1][9]), ("Inundación", "Emergencia (Rojo)", "Activa"))
        self.assertEqual({c.label: c.value for c in s.cards}["Emergencia"], "1")

    def test_event_history(self):
        doc, _ = build("EVENT_HISTORY")
        self.assertEqual([c.label for c in doc.sections[0].cards], ["Inundación", "Sequía", "Tormenta", "Helada", "Incendio Forestal"])
        self.assertEqual(({c.label: c.value for c in doc.sections[0].cards}["Helada"], len(doc.sections[0].rows)), ("1", 2))

    def test_sensor_status(self):
        s = build("SENSOR_STATUS")[0].sections[0]
        self.assertEqual({c.label: c.value for c in s.cards}, {"Activos": "2", "Inactivos": "1", "En mantenimiento": "1", "Fuera de línea": "1", "Sin comunicación": "2"})
        comm = {r[0]: r[4] for r in s.rows}
        self.assertEqual((comm["T-001"], comm["R-001"], comm["L-001"]), ("Comunicando", "Sin comunicación", "Sin comunicación"))
        self.assertEqual({r[0]: r[5] for r in s.rows}["L-001"], "—")

    def test_climate_stats(self):
        doc, _ = build("CLIMATE_STATS", {"from": "2026-10-01", "to": "2026-10-22"})
        rows = {r[0]: r for r in doc.sections[0].rows}
        self.assertEqual((rows["Temperatura"][3:7], rows["Lluvia"][6]), (["22.25", "8.50", "33.00", "—"], "100.00"))
        self.assertEqual(([s.title for s in doc.sections[1:]], doc.sections[1].rows[1][0]), (["Alertas por nivel", "Alertas por fenómeno"], "Emergencia (Rojo)"))

    def test_executive(self):
        doc, _ = build("EXECUTIVE")
        c = {x.label: (x.value, x.tone) for x in doc.sections[0].cards}
        self.assertEqual((c["Situación climática global"], c["Comunidades activas"][0], c["Sensores sin comunicación"][0], c["Eventos registrados"][0]),
                         (("Emergencia", "danger"), "2 de 3", "2", "2"))
        self.assertIn("Comunidades con más alertas (top 10)", [s.title for s in doc.sections])

    def test_aliases(self):
        self.assertEqual((resolve_type("sensors").key, resolve_type("alert_history"), resolve_type("event_history").key), ("SENSORS", None, "EVENT_HISTORY"))

    def test_dashboard_indicators(self):
        ind = executive_indicators(run(collect_executive(Apis.for_user(SETTINGS, fx.make_fetch(), "T"), {})), {}, CTX)
        self.assertEqual(ind["comunidades"], {"total": 3, "activas": 2})
        self.assertEqual(ind["alertas"]["porNivel"][1], {"id": 4, "nombre": "Emergencia", "colorHex": "#DC3545", "cantidad": 1})
        self.assertEqual((ind["sensores"]["porEstado"][0], ind["clima"][0]["variable"]), ({"nombre": "Activo", "cantidad": 2}, "Temperatura"))

    def test_empty_data(self):
        empty = {p: [] for p in fx.ROUTES}
        empty["/api/alerts/stats"] = {}
        for key, rt in REPORT_TYPES.items():
            f = normalize_filters(key, {})
            doc = rt.build(run(rt.collect(Apis.for_user(SETTINGS, fx.make_fetch(empty), "T"), f)), f, CTX)
            self.assertIn(doc.title, render_html(doc, report_id="REP-2026-000001", user="u", generated_at="x", tz="t", max_rows=5000), key)


class RenderTests(unittest.TestCase):
    def test_rnf_rep_03_and_escaping(self):
        doc, _ = build("ALERTS")
        html = render_html(doc, report_id="REP-2026-000042", user="admin", generated_at="21/10/2026 18:00", tz="America/Guatemala", max_rows=5000)
        for n in ("ClimGuard", "<svg", "Reporte de alertas", "REP-2026-000042", "admin", "21/10/2026 18:00", "<table", "counter(page)", "counter(pages)", "Emergencia (Rojo)"):
            self.assertIn(n, html, n)
        self.assertNotIn("<script>x</script>", html)
        self.assertIn("&lt;script&gt;", html)

    def test_id_cannot_inject_css_and_truncation_notice(self):
        doc, _ = build("COMMUNITIES")
        self.assertNotIn('"; }', render_html(doc, report_id='REP"; } body{display:none', user="u", generated_at="x", tz="t", max_rows=1))
        doc.truncated = True
        self.assertIn("limitado a 5000", render_html(doc, report_id="REP-2026-000001", user="u", generated_at="x", tz="t", max_rows=5000))


class ServiceTests(unittest.TestCase):
    def make(self, fetch=None, pdf=lambda h: b"%PDF-1.7 fake"):
        self.store, self.audits = MemoryStore(), []

        async def audit(token, action, resource, detail):
            self.audits.append((action, detail.get("reportId")))
        return ReportService(SETTINGS, self.store, fetch or fx.make_fetch(), pdf_fn=pdf, audit=audit)

    def test_full_flow_metadata(self):
        s = self.make()
        meta = run(s.create(ADMIN, "ALERTS", {"comunidadId": 15, "from": "2026-09-01", "to": "2026-09-24"}))
        self.assertRegex(meta["reportId"], r"^REP-\d{4}-\d{6}$")
        self.assertEqual((meta["status"], meta["generatedBy"], meta["type"]), ("PENDING", "5", "ALERTS"))
        pdf = run(s.run(meta["reportId"], ADMIN))
        saved = self.store.get(meta["reportId"])
        self.assertEqual((pdf, saved["status"], saved["rowCount"], saved["downloadCount"]), (b"%PDF-1.7 fake", "COMPLETED", 2, 0))
        self.assertEqual(saved["filters"], {"comunidadId": 15, "from": "2026-09-01", "to": "2026-09-24"})
        self.assertTrue(saved["fileName"].endswith(".pdf") and saved["fileSize"] == len(pdf))
        self.assertEqual([a[0] for a in self.audits], ["REPORT_REQUESTED", "REPORT_GENERATED"])

    def test_html_has_data_and_alias(self):
        cap = {}
        s = self.make(pdf=lambda h: cap.setdefault("h", h).encode()[:8])
        meta = run(s.create(ADMIN, "communities", {}))
        run(s.run(meta["reportId"], ADMIN))
        self.assertIn("San Juan", cap["h"])
        self.assertEqual(meta["type"], "COMMUNITIES")

    def test_token_forwarded_and_only_apis(self):
        calls = []
        s = self.make(fetch=fx.make_fetch(calls=calls))
        run(s.run(run(s.create(ADMIN, "SENSORS", {}))["reportId"], ADMIN))
        self.assertTrue(calls and all(c[2]["Authorization"] == "Bearer TOKEN" and c[0].startswith("/api/") for c in calls))

    def test_failures_mark_failed(self):
        s = self.make(fetch=fx.make_fetch(fail_paths=("/api/alerts",)))
        meta = run(s.create(ADMIN, "ALERTS", {}))
        self.assertIsNone(run(s.run(meta["reportId"], ADMIN)))
        self.assertEqual(self.store.get(meta["reportId"])["status"], "FAILED")
        self.assertIn("alert-service", self.store.get(meta["reportId"])["error"])
        self.assertIsNone(run(s.download(ADMIN, meta["reportId"]))[1])

        def boom(h):
            raise RuntimeError("weasyprint")
        s2 = self.make(pdf=boom)
        m2 = run(s2.create(ADMIN, "SENSORS", {}))
        run(s2.run(m2["reportId"], ADMIN))
        self.assertEqual(self.store.get(m2["reportId"])["error"], "Error interno al generar el reporte: RuntimeError")

    def test_download_counts(self):
        s = self.make()
        meta = run(s.create(ADMIN, "SENSORS", {}))
        self.assertEqual(run(s.download(ADMIN, meta["reportId"]))[1], None)  # PENDING
        run(s.run(meta["reportId"], ADMIN))
        run(s.download(ADMIN, meta["reportId"]))
        run(s.download(ADMIN, meta["reportId"]))
        saved = self.store.get(meta["reportId"])
        self.assertEqual(saved["downloadCount"], 2)
        self.assertIsNotNone(saved["lastDownloadedAt"])
        self.assertIn("REPORT_DOWNLOADED", [a[0] for a in self.audits])

    def test_ids_history_and_stale(self):
        s = self.make()
        ids = [run(s.create(ADMIN, "SENSORS", {}))["reportId"] for _ in range(5)]
        self.assertEqual([i[-6:] for i in ids], ["000001", "000002", "000003", "000004", "000005"])
        items, total = self.store.list(user_id=None, type_="SENSORS", status=None, date_from=None, date_to=None, page=2, page_size=2)
        self.assertEqual((len(items), total), (2, 5))
        self.assertEqual(self.store.list(user_id="otro", type_=None, status=None, date_from=None, date_to=None, page=1, page_size=10)[0], [])
        self.store.reports[ids[0]]["generatedAt"] -= timedelta(hours=1)
        self.assertEqual(self.store.fail_stale(timedelta(minutes=15), "reinicio"), 1)

    def test_invalid_input(self):
        s = self.make()
        for t, f in (("NOPE", {}), ("SENSORS", {"sensorId": 3})):
            with self.assertRaises(FilterError):
                run(s.create(ADMIN, t, f))

    def test_dashboard_cache(self):
        calls = []
        s = self.make(fetch=fx.make_fetch(calls=calls))
        a = run(s.dashboard(ADMIN, {}))
        n = len(calls)
        self.assertEqual((run(s.dashboard(ADMIN, {})), len(calls)), (a, n))

    def test_large_volume_truncated(self):
        big = dict(fx.ROUTES)
        big["/api/readings"] = [{"lecturaId": i, "sensorId": 10, "valor": i % 40, "fechaHora": "2026-10-21T10:00:00"} for i in range(12000)]
        st = MemoryStore()
        s = ReportService(Settings(jwt_key="k" * 40, jwt_issuer="i", jwt_audience="a", page_size=1000, max_rows=3000), st, fx.make_fetch(big), pdf_fn=lambda h: b"%PDF")
        meta = run(s.create(ADMIN, "READINGS", {"from": "2026-10-21", "to": "2026-10-21"}))
        run(s.run(meta["reportId"], ADMIN))
        saved = st.get(meta["reportId"])
        self.assertEqual((saved["status"], saved["rowCount"], saved["truncated"]), ("COMPLETED", 3000, True))


if __name__ == "__main__":
    unittest.main()
