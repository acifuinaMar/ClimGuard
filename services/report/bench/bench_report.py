"""Prueba de rendimiento reproducible del Report Service (RAM, CPU y tiempo por etapa).

Uso (dentro del contenedor, donde está WeasyPrint real):
    docker compose exec report-service python -m bench.bench_report --rows 100,500,1000,5000
Uso local (sin WeasyPrint se miden solo recolección, armado y HTML; la etapa PDF se marca SKIPPED):
    cd services/report && python3 -m bench.bench_report --rows 100,500,1000,5000

Cada combinación (filas × modo) corre en un PROCESO HIJO nuevo para que el pico de memoria (ru_maxrss) no se contamine.
Modos:  monolitico = un único documento (comportamiento anterior)   |   trozos = REPORT_CHUNK_ROWS filas por trozo (actual).
No inventa datos: lo que no se pudo medir aparece como SKIPPED / n/d.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import resource
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone


def _rss_mb() -> float:
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0   # Linux: KiB → MiB


def _cgroup_peak_mb():
    for path in ("/sys/fs/cgroup/memory.peak", "/sys/fs/cgroup/memory/memory.max_usage_in_bytes"):
        try:
            with open(path) as fh:
                return int(fh.read().strip()) / 1048576.0
        except (OSError, ValueError):
            continue
    return None


def _fake_fetch(n_readings):
    from app.clients import FetchResult
    sensors = [{"sensorId": i, "codigo": f"S-{i:03d}", "nombre": f"Sensor {i}", "comunidadId": 1 + i % 5, "tipoSensorId": 1 + i % 4,
                "estadoSensorId": 1, "ubicacion": "Campo", "fechaInstalacion": "2026-01-01T00:00:00",
                "fechaUltimaConexion": "2026-10-21T10:00:00", "valorActual": 20} for i in range(1, 41)]
    comms = [{"comunidadId": i, "nombreComunidad": f"Comunidad {i}", "municipio": "M", "departamento": "D", "pais": "Guatemala",
              "latitud": 14.0, "longitud": -90.0, "activo": True} for i in range(1, 6)]
    types = [{"tipoSensorId": i, "nombre": f"Tipo {i}", "unidadMedida": "u"} for i in range(1, 5)]
    states = [{"estadoSensorId": 1, "nombre": "Activo"}]
    readings = [{"lecturaId": i, "sensorId": 1 + i % 40, "valor": round((i * 7919) % 10000 / 100, 2),
                 "fechaHora": f"2026-10-{1 + i % 28:02d}T{i % 24:02d}:{i % 60:02d}:00"} for i in range(n_readings)]
    routes = {"/api/readings": readings, "/api/sensors": sensors, "/api/communities": comms, "/api/sensor-types": types, "/api/sensor-states": states}

    async def fetch(url, params, headers):
        path = "/" + url.split("/", 3)[3]
        data = routes[path]
        if "page" in params:
            ps, pg = int(params["pageSize"]), int(params["page"])
            return FetchResult(200, data[(pg - 1) * ps: pg * ps], {"x-total-count": str(len(data))})
        return FetchResult(200, data, {})
    return fetch


def child(rows: int, mode: str, chunk: int) -> dict:
    from app.clients import Apis
    from app.config import Settings
    from app.pdfbuild import assemble_pdf, split_document
    from app.render import html_to_pdf, render_html
    from app.reports.base import BuildContext
    from app.reports.catalog import REPORT_TYPES

    try:
        import weasyprint  # noqa: F401
        pdf_fn, pdf_note = html_to_pdf, "weasyprint"
    except Exception:  # noqa: BLE001
        pdf_fn, pdf_note = None, "SKIPPED (weasyprint no instalado en este entorno)"

    st = Settings(jwt_key="k" * 40, jwt_issuer="i", jwt_audience="a", max_rows=max(rows, 1), lookup_max_rows=5000, chunk_rows=chunk)
    rt = REPORT_TYPES["READINGS"]
    res = {"rows": rows, "mode": mode, "chunk_rows": chunk if mode == "trozos" else rows, "pdf": pdf_note}
    cpu0, t0 = time.process_time(), time.perf_counter()

    async def collect():
        return await rt.collect(Apis.for_user(st, _fake_fetch(rows), "T"), {})
    data = asyncio.run(collect())
    res["collect_s"], res["rss_after_collect_mb"] = round(time.perf_counter() - t0, 3), round(_rss_mb(), 1)

    t1 = time.perf_counter()
    doc = rt.build(data, {}, BuildContext(now=datetime.now(timezone.utc), max_rows=rows))
    del data
    res["build_s"], res["rss_after_build_mb"] = round(time.perf_counter() - t1, 3), round(_rss_mb(), 1)

    parts = split_document(doc, chunk if mode == "trozos" else 10 ** 9)
    res["parts"] = len(parts)
    t2 = time.perf_counter()
    htmls = [render_html(p, report_id="REP-BENCH", user="bench", generated_at="x", tz="America/Guatemala", max_rows=rows,
                         first=i == 0, last=i == len(parts) - 1, stamp_pages=len(parts) > 1) for i, p in enumerate(parts)]
    res["html_s"], res["html_total_kb"] = round(time.perf_counter() - t2, 3), round(sum(len(h) for h in htmls) / 1024, 1)
    del htmls

    if pdf_fn is None:
        res.update(pdf_s=None, pdf_pages=None, pdf_kb=None)
    else:
        with tempfile.TemporaryDirectory() as tmp:
            out = os.path.join(tmp, "bench.pdf")
            t3 = time.perf_counter()
            it = iter(parts)
            pages = assemble_pdf(parts, lambda d, f, l, s: render_html(d, report_id="REP-BENCH", user="bench", generated_at="x",
                                                                      tz="America/Guatemala", max_rows=rows, first=f, last=l, stamp_pages=s),
                                 pdf_fn, out)
            res["pdf_s"], res["pdf_pages"], res["pdf_kb"] = round(time.perf_counter() - t3, 2), pages, round(os.path.getsize(out) / 1024, 1)
    res["cpu_s"] = round(time.process_time() - cpu0, 2)
    res["wall_s"] = round(time.perf_counter() - t0, 2)
    res["peak_rss_mb"] = round(_rss_mb(), 1)
    res["cgroup_peak_mb"] = None if _cgroup_peak_mb() is None else round(_cgroup_peak_mb(), 1)
    return res


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rows", default="100,500,1000,5000")
    ap.add_argument("--chunk", type=int, default=250)
    ap.add_argument("--modes", default="monolitico,trozos")
    ap.add_argument("--child", action="store_true")
    ap.add_argument("--mode", default="trozos")
    a = ap.parse_args()
    if a.child:
        print(json.dumps(child(int(a.rows), a.mode, a.chunk)))
        return
    results = []
    for n in [int(x) for x in a.rows.split(",")]:
        for m in a.modes.split(","):
            cp = subprocess.run([sys.executable, "-m", "bench.bench_report", "--child", "--rows", str(n), "--mode", m, "--chunk", str(a.chunk)],
                                capture_output=True, text=True)
            if cp.returncode != 0:
                results.append({"rows": n, "mode": m, "error": (cp.stderr or cp.stdout)[-400:]})
                continue
            results.append(json.loads(cp.stdout.strip().splitlines()[-1]))
    cols = ["rows", "mode", "parts", "pdf", "collect_s", "build_s", "html_s", "pdf_s", "pdf_pages", "pdf_kb", "cpu_s", "wall_s", "peak_rss_mb", "cgroup_peak_mb"]
    print("| " + " | ".join(cols) + " |\n|" + "---|" * len(cols))
    for r in results:
        print("| " + " | ".join("n/d" if r.get(c) is None else str(r.get(c, "n/d")) for c in cols) + " |")
    print("\nJSON:\n" + json.dumps(results, indent=1))


if __name__ == "__main__":
    main()
