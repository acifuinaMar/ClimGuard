"""Mide SOLO el ensamblado final del PDF (unir trozos + deduplicar + «Página X de N» + escribir), no el renderizado.

Origen de los trozos de entrada (en este orden):
  1. WeasyPrint real, si está instalado (contenedor del servicio): los trozos salen del mismo render_html + html_to_pdf del servicio.
  2. Si no, PDFs SUSTITUTOS creados con reportlab (solo desarrollo; NO está en requirements.txt) y fuente TrueType incrustada.
     No son salida de WeasyPrint: su tamaño real por trozo puede ser mayor o menor.
  3. Si no hay ninguno, la prueba se marca SKIPPED. También puede indicar --pdf-dir con PDFs chunk_*.pdf propios.
Uso en el VPS:  docker compose -p climguard3 exec report-service python -m bench.bench_assembly --rows 100,500,1000,5000

Cada combinación corre en un proceso hijo nuevo. Se informa el RSS pico DURANTE el ensamblado (VmHWM reiniciado justo antes; incluye
cargar pypdf cuando hay más de un trozo, ≈ +24 MB) menos el RSS previo. En Linux sin /proc/self/clear_refs el pico incluye el arranque.
    python3 -m bench.bench_assembly --rows 100,500,1000,5000 --chunk 250
"""
from __future__ import annotations

import argparse
import glob
import io
import json
import os
import resource
import subprocess
import sys
import tempfile
import time
import tracemalloc

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def _rss_mb() -> float:
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0


def _cur_rss_mb() -> float:
    try:
        with open("/proc/self/statm") as fh:
            return int(fh.read().split()[1]) * os.sysconf("SC_PAGE_SIZE") / 1048576.0
    except OSError:
        return _rss_mb()


def _reset_peak() -> bool:
    """Reinicia el pico de RSS del proceso (VmHWM) para medir solo el ensamblado. Solo Linux; si no se puede, el pico incluye la importación."""
    try:
        with open("/proc/self/clear_refs", "w") as fh:
            fh.write("5")
        return True
    except OSError:
        return False


def _peak_mb() -> float:
    try:
        with open("/proc/self/status") as fh:
            for line in fh:
                if line.startswith("VmHWM:"):
                    return int(line.split()[1]) / 1024.0
    except OSError:
        pass
    return _rss_mb()


def _make_chunk_pdf(path: str, rows: int, first_row: int) -> None:
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.pdfgen import canvas
    name = "DejaVuSans"
    if name not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont(name, FONT))
    c = canvas.Canvas(path, pagesize=landscape(A4))
    y = 520
    for i in range(rows):
        c.setFont(name, 7)
        for j, w in enumerate((40, 120, 260, 380, 520, 650)):
            c.drawString(w, y, f"Sensor {first_row + i} col{j} Año {2026} ñandú °C")
        y -= 14
        if y < 40:
            c.showPage()
            y = 520
    c.showPage()
    c.save()


def _have_weasy() -> bool:
    try:
        import weasyprint  # noqa: F401
        return True
    except Exception:  # noqa: BLE001
        return False


def _make_real_chunks(d: str, n: int, chunk: int) -> int:
    """Genera los trozos con el pipeline real del servicio (WeasyPrint)."""
    from app.pdfbuild import split_document
    from app.render import html_to_pdf, render_html
    from app.reports.base import ReportDocument, Section
    rows = [[f"Sensor {i}", f"Comunidad {i % 40}", "Temperatura", f"{20 + (i % 15)}.{i % 10}", "°C", "2026-10-22 10:00:00"] for i in range(n)]
    doc = ReportDocument("BENCH", "Reporte de prueba", "bench", [("Filtros", "ninguno")],
                         [Section("Lecturas", ["Sensor", "Comunidad", "Tipo", "Valor", "Unidad", "Fecha"], rows)], n)
    parts = split_document(doc, chunk)
    for k, p in enumerate(parts):
        html = render_html(p, report_id="BENCH", user="bench", generated_at="2026-10-22", tz="America/Guatemala", max_rows=n,
                           first=k == 0, last=k == len(parts) - 1, stamp_pages=len(parts) > 1)
        with open(os.path.join(d, f"chunk_{k:04d}.pdf"), "wb") as fh:
            fh.write(html_to_pdf(html))
    return len(parts)


def _child(a) -> None:
    from app.pdfbuild import assemble_pdf
    from app.reports.base import ReportDocument, Section
    from app.pdfbuild import split_document
    tmp = a.workdir
    chunk_files = sorted(glob.glob(os.path.join(tmp, "chunk_*.pdf")))
    doc = ReportDocument("T", "T", "", [], [Section("S", ["a"], [[str(i)] for i in range(a.n_rows)])], a.n_rows)
    parts = split_document(doc, a.chunk)
    assert len(parts) == len(chunk_files), (len(parts), len(chunk_files))
    it = iter(chunk_files)

    def pdf_fn(_html: str) -> bytes:
        with open(next(it), "rb") as fh:       # se lee del disco: así no cuenta la generación de los trozos
            return fh.read()

    base = _cur_rss_mb()
    reset = _reset_peak()
    if a.trace:
        tracemalloc.start()
    t, c0 = time.perf_counter(), time.process_time()
    out = os.path.join(tmp, "final.pdf")
    pages = assemble_pdf(parts, lambda d, f, l, s: "<html></html>", pdf_fn, out)
    wall, cpu = time.perf_counter() - t, time.process_time() - c0
    py_peak = tracemalloc.get_traced_memory()[1] if a.trace else 0
    res = {"rows": a.n_rows, "chunk": a.chunk, "parts": len(parts), "pages": pages, "wall_s": round(wall, 2), "cpu_s": round(cpu, 2),
           "rss_base_mb": round(base, 1), "rss_peak_mb": round(_peak_mb(), 1), "rss_peak_delta_mb": round(_peak_mb() - base, 1), "peak_reset": reset,
           "py_heap_peak_mb": round(py_peak / 1048576, 1), "input_total_kb": round(sum(os.path.getsize(f) for f in chunk_files) / 1024),
           "final_kb": round(os.path.getsize(out) / 1024)}
    print(json.dumps(res))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", default="100,500,1000,5000")
    ap.add_argument("--chunk", type=int, default=250)
    ap.add_argument("--pdf-dir", default="", help="carpeta con chunk_*.pdf reales (opcional); si no, se generan sustitutos")
    ap.add_argument("--trace", action="store_true", help="medir también el heap de Python con tracemalloc (más lento e infla el RSS)")
    ap.add_argument("--child", action="store_true")
    ap.add_argument("--n-rows", type=int, default=0)
    ap.add_argument("--workdir", default="")
    a = ap.parse_args()
    if a.child:
        _child(a)
        return 0
    weasy = _have_weasy()
    if not weasy and not a.pdf_dir:
        try:
            import reportlab  # noqa: F401
            ok = os.path.exists(FONT)
        except ImportError:
            ok = False
        if not ok:
            print("SKIPPED: sin WeasyPrint ni reportlab+DejaVu para crear trozos, y sin --pdf-dir", file=sys.stderr)
            return 0
    print("origen de los trozos:", "--pdf-dir" if a.pdf_dir else ("WeasyPrint REAL" if weasy else "SUSTITUTOS reportlab (no es WeasyPrint)"))
    print(f"{'filas':>6} {'trozo':>5} {'partes':>6} {'págs':>5} {'seg':>6} {'CPU s':>6} {'RSS base':>9} {'RSS pico':>9} {'Δ pico':>7} {'heap py':>8} {'entrada KB':>10} {'final KB':>9}")
    for n in [int(x) for x in a.rows.split(",")]:
        with tempfile.TemporaryDirectory() as d:
            if a.pdf_dir:
                import shutil
                for k, f in enumerate(sorted(glob.glob(os.path.join(a.pdf_dir, "chunk_*.pdf")))):
                    shutil.copy(f, os.path.join(d, f"chunk_{k:04d}.pdf"))
            elif weasy:
                _make_real_chunks(d, n, a.chunk)
            else:
                k, done = 0, 0
                while done < n:
                    m = min(a.chunk, n - done)
                    _make_chunk_pdf(os.path.join(d, f"chunk_{k:04d}.pdf"), m, done)
                    k, done = k + 1, done + m
            r = subprocess.run([sys.executable, "-m", "bench.bench_assembly", "--child", "--n-rows", str(n), "--chunk", str(a.chunk), "--workdir", d] + (["--trace"] if a.trace else []),
                               capture_output=True, text=True)
            if r.returncode != 0:
                print(f"{n:>6} ERROR: {r.stderr.strip().splitlines()[-1] if r.stderr.strip() else r.returncode}")
                continue
            x = json.loads(r.stdout.strip().splitlines()[-1])
            print(f"{x['rows']:>6} {x['chunk']:>5} {x['parts']:>6} {x['pages']:>5} {x['wall_s']:>6} {x['cpu_s']:>6} {x['rss_base_mb']:>9} {x['rss_peak_mb']:>9} {x['rss_peak_delta_mb']:>7} {x['py_heap_peak_mb']:>8} {x['input_total_kb']:>10} {x['final_kb']:>9}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
