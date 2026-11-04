"""Ensamblado del PDF por trozos para acotar la memoria de WeasyPrint.

WeasyPrint construye en memoria el árbol completo de maquetación del documento (miles de filas de tabla = cientos de MB).
Aquí el documento se divide en trozos de `chunk_rows` filas; cada trozo se maqueta y se convierte a PDF por separado, se agrega al
PDF final y se descarta antes de procesar el siguiente. El PDF final se escribe en un archivo temporal (no en un `bytes`
más) y de ahí se sube a GridFS por bloques.

Solo usa pypdf (Python puro), también para estampar «Página X de N». No se agrega ningún servicio ni otra dependencia.
"""
from __future__ import annotations

import gc
import io
import logging
import os
import re
from dataclasses import replace
from typing import Callable, Iterator, Optional

from .reports.base import ReportDocument, Section

log = logging.getLogger("report.pdf")
logging.getLogger("pypdf").setLevel(logging.ERROR)   # PDFs de prueba inválidos no deben llenar el log


def total_rows(doc: ReportDocument) -> int:
    return sum(len(s.rows) for s in doc.sections)


def split_document(doc: ReportDocument, chunk_rows: int) -> list[ReportDocument]:
    """Divide el documento en trozos de a lo sumo `chunk_rows` filas de tabla, sin perder ni repetir filas.

    El primer trozo conserva título, filtros y tarjetas; los siguientes continúan la misma tabla (con encabezado repetido y
    el título de sección marcado «continuación»). Secciones pequeñas no se parten entre trozos salvo que excedan el cupo.
    """
    if chunk_rows < 1:
        raise ValueError("chunk_rows debe ser >= 1")
    if total_rows(doc) <= chunk_rows:
        return [doc]
    parts: list[list[Section]] = [[]]
    room = chunk_rows
    for sec in doc.sections:
        rows, first_piece = sec.rows, True
        if not rows:
            parts[-1].append(sec)
            continue
        i = 0
        while i < len(rows):
            if room <= 0:
                parts.append([])
                room = chunk_rows
            take = rows[i:i + room]
            piece = replace(sec, rows=take)
            if not first_piece:
                piece = replace(piece, title=(sec.title + " (continuación)").strip(), cards=[], note="")
            elif i + len(take) < len(rows):
                piece = replace(piece, note="")          # la nota va en el último trozo de la sección
            if i + len(take) >= len(rows) and not first_piece:
                piece = replace(piece, note=sec.note)
            parts[-1].append(piece)
            i += len(take)
            room -= len(take)
            first_piece = False
    out: list[ReportDocument] = []
    for n, secs in enumerate(parts):
        out.append(replace(doc, sections=secs, notes=doc.notes if n == len(parts) - 1 else []))
    return out


def _malloc_trim() -> None:
    """Devuelve a Linux la memoria libre del heap de glibc (WeasyPrint/Pango/cairo fragmentan mucho). Inofensivo si no existe."""
    try:
        import ctypes
        ctypes.CDLL("libc.so.6").malloc_trim(0)
    except Exception:  # noqa: BLE001
        pass


def assemble_pdf(parts: list[ReportDocument], render_part: Callable[[ReportDocument, bool, bool, bool], str],
                 pdf_fn: Callable[[str], bytes], out_path: str) -> int:
    """Genera el PDF final en `out_path`. `render_part(doc, first, last, stamp)` → HTML; `pdf_fn(html)` → bytes de PDF.

    Devuelve el número de páginas. Con un solo trozo escribe el PDF tal cual (numeración nativa de WeasyPrint).
    """
    if len(parts) == 1:
        data = pdf_fn(render_part(parts[0], True, True, False))
        with open(out_path, "wb") as fh:
            fh.write(data)
        n = _count_pages(data)
        del data
        return n
    from pypdf import PdfReader, PdfWriter
    writer = PdfWriter()
    for idx, part in enumerate(parts):
        html = render_part(part, idx == 0, idx == len(parts) - 1, True)
        data = pdf_fn(html)
        del html
        reader = PdfReader(io.BytesIO(data))
        for page in reader.pages:
            writer.add_page(page)
        del reader, data
        gc.collect()
        _malloc_trim()
    try:                                     # los subconjuntos de fuentes idénticos de cada trozo se guardan una sola vez
        writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)
    except Exception:  # noqa: BLE001
        log.debug("compress_identical_objects no disponible; se conserva el PDF sin deduplicar")
    pages = len(writer.pages)
    try:
        _stamp_page_numbers(writer, pages)
    except Exception:  # noqa: BLE001
        log.exception("No se pudo estampar «Página X de N»; el PDF se entrega sin numeración")
    with open(out_path, "wb") as fh:
        writer.write(fh)
    del writer
    gc.collect()
    _malloc_trim()
    return pages


_PAGE_RE = re.compile(rb"/Type\s*/Page(?![A-Za-z])")


def _count_pages(data: bytes) -> int:
    """Páginas de un PDF de un solo trozo SIN importar pypdf (importarlo cuesta ~24 MB residentes; los reportes pequeños no lo necesitan).

    Cuenta los objetos «/Type /Page» (WeasyPrint/pydyf los escribe sin comprimir). Si el PDF usa flujos de objetos, devuelve 0
    ('desconocido'): es solo un dato informativo del reporte, no afecta al archivo.
    """
    return len(_PAGE_RE.findall(data))


# Anchos Helvetica (milésimas de em) de los únicos caracteres del sello «Página X de N»; permite centrarlo sin reportlab.
_HELV = {"P": 667, "á": 556, "g": 556, "i": 222, "n": 556, "a": 556, "d": 556, "e": 556, " ": 278}
_HELV.update({str(d): 556 for d in range(10)})


def _stamp_page_numbers(writer, total: int) -> None:
    """Estampa «Página X de N» abajo al centro de cada página (equivale al pie CSS del documento de un solo trozo).

    Añade un flujo de contenido PEQUEÑO y comprimido a cada página y una referencia a la fuente estándar Helvetica (sin incrustar).
    No reescribe el contenido original: probado que `merge_page` descomprime cada página (≈20 KB/página en lugar de ≈1 KB) y el
    PDF final crecía varias veces.
    """
    from pypdf.generic import (ArrayObject, DecodedStreamObject, DictionaryObject, NameObject)
    font = DictionaryObject({NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type1"),
                             NameObject("/BaseFont"): NameObject("/Helvetica"), NameObject("/Encoding"): NameObject("/WinAnsiEncoding")})
    font_ref = writer._add_object(font)                            # una sola vez para todo el documento
    q = DecodedStreamObject()
    q.set_data(b"q")
    q_ref = writer._add_object(q)                                  # abre un estado gráfico antes del contenido original
    for i, page in enumerate(writer.pages, start=1):
        text = f"Página {i} de {total}"
        width = sum(_HELV.get(ch, 556) for ch in text) * 7 / 1000.0
        w = float(page.mediabox.width)
        x = (w - width) / 2.0
        body = (f"Q q BT /CGPN 7 Tf 0.392 0.455 0.545 rg {x:.2f} 26 Td ".encode("ascii")
                + b"(" + text.encode("cp1252") + b") Tj ET Q")
        st = DecodedStreamObject()
        st.set_data(body)
        st_ref = writer._add_object(st.flate_encode())
        cur = page.get(NameObject("/Contents"))
        parts = list(cur.get_object()) if isinstance(cur.get_object(), list) else [cur]
        page[NameObject("/Contents")] = ArrayObject([q_ref, *parts, st_ref])
        res = page.get(NameObject("/Resources"))
        res = res.get_object() if res is not None else None
        if res is None:
            res = DictionaryObject()
            page[NameObject("/Resources")] = res
        fonts = res.get(NameObject("/Font"))
        fonts = fonts.get_object() if fonts is not None else None
        if fonts is None:
            fonts = DictionaryObject()
            res[NameObject("/Font")] = fonts
        fonts[NameObject("/CGPN")] = font_ref
