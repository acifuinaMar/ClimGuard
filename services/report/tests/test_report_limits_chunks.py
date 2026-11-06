"""Límites explícitos, cola, troceado del PDF y limpieza de recursos (sin WeasyPrint real: se inyecta un generador de PDF de prueba)."""
import asyncio
import glob
import io
import os
import tempfile
import unittest
from dataclasses import replace
from datetime import datetime, timezone

from app.clients import ApiClient, FetchResult, ReportLimitError
from app.config import Settings
from app.pdfbuild import assemble_pdf, split_document, total_rows
from app.render import render_html
from app.reports.base import Card, ReportDocument, Section
from app.reports.catalog import _umbral
from app.security import Principal
from app.service import TMP_PREFIX, ReportBusy, ReportService
from app.store import MemoryStore
from tests import fixtures as fx

run = asyncio.run
ADMIN = Principal("5", "admin", ("Administrador",), frozenset({"reports.generate", "reports.download", "reports.history", "dashboard.view"}), "TOKEN")


def settings(**kw):
    base = dict(jwt_key="k" * 40, jwt_issuer="i", jwt_audience="a", page_size=1000, max_rows=5000, max_queue=50)
    base.update(kw)
    return Settings(**base)


def pdf_with_pages(n_pages_text, filler_lines=0):
    """PDF válido mínimo (solo pypdf) para probar el ensamblado sin WeasyPrint. Una página por cada elemento recibido.

    `filler_lines` agrega líneas de texto por página (contenido comprimible) para probar que el ensamblado no infla el tamaño.
    """
    from pypdf import PdfWriter
    from pypdf.generic import DecodedStreamObject, DictionaryObject, NameObject
    w = PdfWriter()
    font = w._add_object(DictionaryObject({NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type1"),
                                           NameObject("/BaseFont"): NameObject("/Helvetica")}))
    for t in n_pages_text:
        page = w.add_blank_page(width=842, height=595)
        lines = [f"BT /F1 10 Tf 50 500 Td ({t}) Tj ET"] + [f"BT /F1 7 Tf 50 {480 - i * 8} Td (fila {i} dato dato dato dato dato) Tj ET" for i in range(filler_lines)]
        st = DecodedStreamObject()
        st.set_data("\n".join(lines).encode("latin-1"))
        page[NameObject("/Contents")] = w._add_object(st.flate_encode())
        page[NameObject("/Resources")] = DictionaryObject({NameObject("/Font"): DictionaryObject({NameObject("/F1"): font})})
    buf = io.BytesIO()
    w.write(buf)
    return buf.getvalue()


def doc_with(n, extra_sections=()):
    rows = [[f"fila-{i}", str(i)] for i in range(n)]
    secs = [Section("Datos", ["Nombre", "Valor"], rows, cards=[Card("Total", str(n))], note="nota-final"), *extra_sections]
    return ReportDocument("TEST", "Reporte de prueba", "sub", [("Filtros", "ninguno")], secs, n, False, notes=["pie-notas"])


class SplitTests(unittest.TestCase):
    def test_small_doc_not_split(self):
        d = doc_with(10)
        self.assertEqual(split_document(d, 50), [d])

    def test_split_keeps_every_row_once_and_in_order(self):
        d = doc_with(1003)
        parts = split_document(d, 250)
        self.assertEqual(len(parts), 5)
        self.assertTrue(all(total_rows(p) <= 250 for p in parts))
        merged = [r for p in parts for s in p.sections for r in s.rows]
        self.assertEqual(merged, d.sections[0].rows)

    def test_header_cards_and_notes_placement(self):
        parts = split_document(doc_with(600), 250)
        self.assertEqual(parts[0].sections[0].cards[0].label, "Total")
        self.assertEqual(parts[0].sections[0].note, "")                  # la nota va al final de la sección
        self.assertTrue(parts[1].sections[0].title.endswith("(continuación)"))
        self.assertEqual(parts[1].sections[0].cards, [])
        self.assertEqual(parts[-1].sections[0].note, "nota-final")
        self.assertEqual(parts[-1].notes, ["pie-notas"])
        self.assertEqual(parts[0].notes, [])

    def test_multiple_sections_share_budget(self):
        extra = Section("Otra", ["A"], [[str(i)] for i in range(300)])
        parts = split_document(doc_with(200, [extra]), 250)
        self.assertEqual(sum(total_rows(p) for p in parts), 500)
        self.assertTrue(all(total_rows(p) <= 250 for p in parts))

    def test_rowless_sections_kept(self):
        kpi = Section("KPIs", cards=[Card("x", "1")])
        parts = split_document(doc_with(10, [kpi]), 5)
        self.assertEqual(sum(1 for p in parts for s in p.sections if s.title == "KPIs"), 1)


class RenderTests(unittest.TestCase):
    def test_first_last_flags(self):
        d = doc_with(3)
        full = render_html(d, report_id="REP-1", user="u", generated_at="x", tz="t", max_rows=10)
        self.assertIn('aria-label="ClimGuard"', full)
        self.assertIn("Reporte generado por ClimGuard", full)
        self.assertIn("counter(pages)", full)                           # documento de un trozo: numeración nativa
        mid = render_html(d, report_id="REP-1", user="u", generated_at="x", tz="t", max_rows=10, first=False, last=False, stamp_pages=True)
        self.assertNotIn('aria-label="ClimGuard"', mid)                  # solo el primer trozo lleva cabecera
        self.assertNotIn("Reporte generado por ClimGuard", mid)         # solo el último lleva el pie
        self.assertNotIn("counter(pages)", mid)                         # la numeración se estampa al final
        self.assertIn("fila-0", mid)


class AssembleTests(unittest.TestCase):
    def test_chunks_merge_and_number_pages(self):
        from pypdf import PdfReader
        parts = split_document(doc_with(10), 4)                         # 3 trozos
        seen = []

        def render_part(d, first, last, stamp):
            seen.append((first, last, stamp))
            return f"html:{total_rows(d)}"

        def pdf_fn(html):
            return pdf_with_pages([html, html + "-p2"])                 # 2 páginas por trozo

        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "o.pdf")
            pages = assemble_pdf(parts, render_part, pdf_fn, out)
            self.assertEqual(seen, [(True, False, True), (False, False, True), (False, True, True)])
            self.assertEqual(pages, 6)
            r = PdfReader(out)
            self.assertEqual(len(r.pages), 6)
            texts = [p.extract_text() for p in r.pages]
            self.assertIn("Página 1 de 6", texts[0])
            self.assertIn("Página 6 de 6", texts[5])
            self.assertIn("html:4", texts[0])

    def test_stamping_does_not_inflate_the_pdf_and_keeps_content(self):
        """Regresión: merge_page descomprimía cada página y el PDF final crecía ~4,5×. El sello debe ser un flujo pequeño añadido."""
        from pypdf import PdfReader
        n_parts = 12
        parts = split_document(doc_with(n_parts * 10), 10)
        self.assertEqual(len(parts), n_parts)
        raws = []

        def pdf_fn(html):
            raw = pdf_with_pages([html] * 3, filler_lines=60)
            raws.append(len(raw))
            return raw

        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "o.pdf")
            pages = assemble_pdf(parts, lambda d, f, l, s: "html", pdf_fn, out)
            final = os.path.getsize(out)
            self.assertEqual(pages, 3 * n_parts)
            self.assertLess(final, sum(raws) * 1.5, f"el PDF final ({final} B) no debe superar 1,5× la suma de los trozos ({sum(raws)} B)")
            r = PdfReader(out)
            first, last = r.pages[0].extract_text(), r.pages[-1].extract_text()
            self.assertIn("fila 59", first)                              # el contenido original sigue intacto
            self.assertIn("Página 1 de 36", first)
            self.assertIn(f"Página 36 de 36", last)

    def test_single_part_written_as_is(self):
        raw = pdf_with_pages(["una"])
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "o.pdf")
            self.assertEqual(assemble_pdf([doc_with(2)], lambda d, f, l, s: "h", lambda h: raw, out), 1)
            with open(out, "rb") as fh:
                self.assertEqual(fh.read(), raw)


class DefaultsTests(unittest.TestCase):
    def test_production_default_is_100_rows_and_conservative(self):
        env = {"JWT_KEY": "k" * 40, "JWT_ISSUER": "i", "JWT_AUDIENCE": "a"}
        keys = ("REPORT_MAX_ROWS", "REPORT_ON_LIMIT", "REPORT_CHUNK_ROWS", "REPORT_CONCURRENCY", "REPORT_MAX_QUEUE")
        saved = {k: os.environ.pop(k, None) for k in keys}
        try:
            os.environ.update(env)
            st = Settings.from_env()
            self.assertEqual((st.max_rows, st.on_limit, st.concurrency, st.max_queue), (100, "fail", 1, 4))
        finally:
            for k in env:
                os.environ.pop(k, None)
            for k, v in saved.items():
                if v is not None:
                    os.environ[k] = v


class LazyImportTests(unittest.TestCase):
    def test_single_part_does_not_import_pypdf(self):
        """pypdf cuesta ~24 MB residentes: los reportes de un solo trozo (los pequeños) no deben cargarlo."""
        import subprocess
        import sys
        code = (
            "import sys, io, os, tempfile; sys.path.insert(0, '.')\n"
            "from app.pdfbuild import assemble_pdf\n"
            "from app.reports.base import ReportDocument, Section\n"
            "d = ReportDocument('T','T','',[],[Section('S',['a'],[['1']])],1)\n"
            "raw = b'%PDF-1.4\\n1 0 obj << /Type /Page >> endobj\\n%%EOF'\n"
            "out = os.path.join(tempfile.mkdtemp(), 'o.pdf')\n"
            "n = assemble_pdf([d], lambda *a: 'h', lambda h: raw, out)\n"
            "print(n, 'pypdf' in sys.modules)\n")
        r = subprocess.run([sys.executable, "-c", code], capture_output=True, text=True, cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(r.stdout.split(), ["1", "False"])


class ServiceLimitTests(unittest.TestCase):
    def big_fetch(self, n):
        routes = dict(fx.ROUTES)
        routes["/api/readings"] = [{"lecturaId": i, "sensorId": 10, "valor": i % 40, "fechaHora": "2026-10-21T10:00:00"} for i in range(n)]
        return fx.make_fetch(routes)

    def svc(self, st, fetch, **kw):
        return ReportService(settings(**kw), st, fetch, pdf_fn=lambda h: pdf_with_pages(["x"]))

    def test_over_limit_fails_with_clear_message_and_no_truncation(self):
        st = MemoryStore()
        s = self.svc(st, self.big_fetch(1500), max_rows=1000)
        meta = run(s.create(ADMIN, "READINGS", {}))
        self.assertIsNone(run(s.run(meta["reportId"], ADMIN)))
        saved = st.get(meta["reportId"])
        self.assertEqual((saved["status"], saved["errorCode"], saved["limit"], saved["totalRows"]), ("FAILED", "LIMIT_EXCEEDED", 1000, 1500))
        self.assertIn("1500", saved["error"])
        self.assertIn("REPORT_MAX_ROWS", saved["error"])
        self.assertIn("filtros", saved["error"])
        self.assertNotIn(meta["reportId"], st.pdfs)                     # no se guardó ningún PDF parcial

    def test_at_limit_succeeds(self):
        st = MemoryStore()
        s = self.svc(st, self.big_fetch(1000), max_rows=1000)
        meta = run(s.create(ADMIN, "READINGS", {}))
        self.assertTrue(run(s.run(meta["reportId"], ADMIN, return_bytes=False)))
        saved = st.get(meta["reportId"])
        self.assertEqual((saved["status"], saved["rowCount"], saved["truncated"]), ("COMPLETED", 1000, False))

    def test_large_report_is_chunked_and_complete(self):
        st = MemoryStore()
        calls = []

        def pdf_fn(html):
            calls.append(len(html))
            return pdf_with_pages(["p"])
        s = ReportService(settings(max_rows=5000, chunk_rows=250), st, self.big_fetch(1200), pdf_fn=pdf_fn)
        meta = run(s.create(ADMIN, "READINGS", {}))
        self.assertTrue(run(s.run(meta["reportId"], ADMIN, return_bytes=False)))
        saved = st.get(meta["reportId"])
        self.assertEqual((saved["status"], saved["rowCount"], saved["chunks"], len(calls)), ("COMPLETED", 1200, 5, 5))
        self.assertEqual(saved["pages"], 5)

    def test_lookup_catalog_over_limit_fails_instead_of_dropping_names(self):
        st = MemoryStore()
        routes = dict(fx.ROUTES)
        routes["/api/sensors"] = [dict(fx.SENSORS[0], sensorId=1000 + i, codigo=f"S-{i}") for i in range(30)]
        s = self.svc(st, fx.make_fetch(routes), max_rows=5000, lookup_max_rows=20)
        meta = run(s.create(ADMIN, "READINGS", {}))
        run(s.run(meta["reportId"], ADMIN))
        saved = st.get(meta["reportId"])
        self.assertEqual((saved["status"], saved["errorCode"]), ("FAILED", "LIMIT_EXCEEDED"))
        self.assertIn("REPORT_LOOKUP_MAX_ROWS", saved["error"])

    def test_small_main_limit_does_not_break_lookups(self):
        """Con REPORT_MAX_ROWS=100 (valor desplegado) los catálogos de apoyo ya no se recortan a 100."""
        st = MemoryStore()
        routes = dict(fx.ROUTES)
        routes["/api/sensors"] = [dict(fx.SENSORS[0], sensorId=1000 + i, codigo=f"S-{i}") for i in range(300)]
        s = self.svc(st, fx.make_fetch(routes), max_rows=100)
        meta = run(s.create(ADMIN, "SENSOR_STATUS", {}))
        self.assertIsNone(run(s.run(meta["reportId"], ADMIN)))          # 300 sensores son el conjunto principal: supera 100
        self.assertEqual(st.get(meta["reportId"])["errorCode"], "LIMIT_EXCEEDED")
        meta2 = run(s.create(ADMIN, "READINGS", {}))                    # pero como catálogo de apoyo sí caben
        self.assertTrue(run(s.run(meta2["reportId"], ADMIN, return_bytes=False)))

    def test_queue_full_is_rejected(self):
        st = MemoryStore()
        s = self.svc(st, fx.make_fetch(), max_queue=2)
        run(s.create(ADMIN, "SENSORS", {}))
        run(s.create(ADMIN, "SENSORS", {}))
        with self.assertRaises(ReportBusy):
            run(s.create(ADMIN, "SENSORS", {}))
        self.assertEqual(st.count_active(), 2)                          # el rechazado no creó metadatos

    def test_temp_files_removed_on_success_and_failure(self):
        with tempfile.TemporaryDirectory() as tmp:
            st = MemoryStore()
            s = self.svc(st, fx.make_fetch(), tmp_dir=tmp)
            run(s.run(run(s.create(ADMIN, "SENSORS", {}))["reportId"], ADMIN))
            self.assertEqual(glob.glob(os.path.join(tmp, TMP_PREFIX + "*")), [])

            def boom(h):
                raise RuntimeError("x")
            s2 = ReportService(settings(tmp_dir=tmp), st, fx.make_fetch(), pdf_fn=boom)
            run(s2.run(run(s2.create(ADMIN, "SENSORS", {}))["reportId"], ADMIN))
            self.assertEqual(glob.glob(os.path.join(tmp, TMP_PREFIX + "*")), [])

    def test_orphan_cleanup_only_touches_own_old_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            mine = os.path.join(tmp, TMP_PREFIX + "abc.pdf")
            other = os.path.join(tmp, "otro.pdf")
            for f in (mine, other):
                open(f, "wb").close()
                os.utime(f, (1, 1))                                     # muy antiguos
            fresh = os.path.join(tmp, TMP_PREFIX + "nuevo.pdf")
            open(fresh, "wb").close()
            self.assertEqual(ReportService.cleanup_orphan_tmp(tmp), 1)
            self.assertFalse(os.path.exists(mine))
            self.assertTrue(os.path.exists(other) and os.path.exists(fresh))

    def test_open_download_streams(self):
        st = MemoryStore()
        s = self.svc(st, fx.make_fetch())
        meta = run(s.create(ADMIN, "SENSORS", {}))
        run(s.run(meta["reportId"], ADMIN, return_bytes=False))
        m, handle = run(s.open_download(ADMIN, meta["reportId"]))
        data = handle.read(1 << 20)
        self.assertTrue(data.startswith(b"%PDF"))
        self.assertEqual(st.get(meta["reportId"])["downloadCount"], 1)


class ThresholdTextTests(unittest.TestCase):
    def test_legacy_vs_interval_semantics(self):
        self.assertEqual(_umbral({"umbralMin": 10, "umbralMax": 35}, {}), "fuera de 10.00 – 35.00")
        self.assertEqual(_umbral({"umbralMin": 35, "umbralMax": 100, "semanticaRegla": 1}, {}), "fuera de 35.00 – 100.00")
        self.assertEqual(_umbral({"umbralMin": 35, "umbralMax": 100, "semanticaRegla": 2}, {}), "entre 35.00 y 100.00")


class ClientLimitTests(unittest.TestCase):
    def make(self, n, max_rows, on_limit="fail", headers=True):
        async def fetch(url, params, h):
            ps, pg = int(params["pageSize"]), int(params["page"])
            fetch.pages += 1
            return FetchResult(200, list(range(n))[(pg - 1) * ps: pg * ps], {"x-total-count": str(n)} if headers else {})
        fetch.pages = 0
        return ApiClient("svc", "http://x", fetch, {}, 100, max_rows, on_limit=on_limit), fetch

    def test_fail_mode_stops_after_first_page(self):
        c, f = self.make(5000, 1000)
        with self.assertRaises(ReportLimitError) as cm:
            run(c.get_all("/p"))
        self.assertEqual((cm.exception.total, cm.exception.limit, f.pages), (5000, 1000, 1))

    def test_fail_mode_without_total_header(self):
        c, _ = self.make(500, 300, headers=False)
        with self.assertRaises(ReportLimitError):
            run(c.get_all("/p"))

    def test_exact_limit_passes(self):
        c, _ = self.make(300, 300)
        self.assertEqual(len(run(c.get_all("/p")).items), 300)

    def test_truncate_mode_is_explicit(self):
        c, _ = self.make(500, 300, on_limit="truncate")
        g = run(c.get_all("/p"))
        self.assertEqual((len(g.items), g.truncated, g.total), (300, True, 500))


if __name__ == "__main__":
    unittest.main()
