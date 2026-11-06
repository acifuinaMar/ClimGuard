"""Metadata (RF-REP-09) y PDFs en MongoDB/GridFS. Stateless: nada en disco local."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional


def _public(doc):
    return {k: v for k, v in doc.items() if k != "_id"}


class MongoStore:
    def __init__(self, url: str, db_name: str):
        import gridfs
        from pymongo import MongoClient
        self._client = MongoClient(url, serverSelectionTimeoutMS=5000, tz_aware=True)
        self._db = self._client[db_name]
        self._reports, self._counters = self._db["reports"], self._db["counters"]
        self._fs = gridfs.GridFS(self._db, collection="pdfs")

    def ensure_indexes(self):
        self._reports.create_index("reportId", unique=True)
        self._reports.create_index([("generatedAt", -1)])
        self._reports.create_index([("generatedBy", 1), ("generatedAt", -1)])
        self._reports.create_index([("type", 1), ("status", 1)])

    def next_report_id(self, year):
        from pymongo import ReturnDocument
        doc = self._counters.find_one_and_update({"_id": f"report-{year}"}, {"$inc": {"seq": 1}}, upsert=True,
                                                 return_document=ReturnDocument.AFTER)
        return f"REP-{year}-{doc['seq']:06d}"

    def create(self, meta):
        self._reports.insert_one(dict(meta))

    def update(self, report_id, fields):
        self._reports.update_one({"reportId": report_id}, {"$set": fields})

    def get(self, report_id):
        d = self._reports.find_one({"reportId": report_id})
        return _public(d) if d else None

    def list(self, *, user_id, type_, status, date_from, date_to, page, page_size):
        q: dict[str, Any] = {}
        if user_id:
            q["generatedBy"] = user_id
        if type_:
            q["type"] = type_
        if status:
            q["status"] = status
        if date_from or date_to:
            q["generatedAt"] = {k: v for k, v in (("$gte", date_from), ("$lte", date_to)) if v}
        total = self._reports.count_documents(q)
        cur = self._reports.find(q).sort("generatedAt", -1).skip((page - 1) * page_size).limit(page_size)
        return [_public(d) for d in cur], total

    def save_pdf(self, report_id, file_name, data):
        for old in self._fs.find({"filename": report_id}):
            self._fs.delete(old._id)
        self._fs.put(data, filename=report_id, contentType="application/pdf", reportFileName=file_name)

    def save_pdf_file(self, report_id, file_name, path, chunk_size=256 * 1024):
        """Sube a GridFS leyendo el archivo temporal por bloques (nunca el PDF completo en memoria). Reemplaza el anterior solo
        después de subir el nuevo, para no dejar al reporte sin PDF si la subida falla."""
        olds = [o._id for o in self._fs.find({"filename": report_id})]
        with open(path, "rb") as src, self._fs.new_file(filename=report_id, contentType="application/pdf", reportFileName=file_name) as dst:
            while True:
                block = src.read(chunk_size)
                if not block:
                    break
                dst.write(block)
        for oid in olds:
            self._fs.delete(oid)

    def load_pdf(self, report_id):
        f = self._fs.find_one({"filename": report_id})
        return f.read() if f else None

    def open_pdf(self, report_id):
        """GridOut para leer por bloques (descarga en streaming), o None. El llamador debe cerrarlo."""
        return self._fs.find_one({"filename": report_id})

    def purge_pdfs_older_than(self, days: int) -> int:
        """Opcional (REPORT_PDF_RETENTION_DAYS>0): borra solo ARCHIVOS PDF antiguos, nunca los metadatos del historial."""
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        n = 0
        for f in self._fs.find({"uploadDate": {"$lt": cutoff}}):
            self._fs.delete(f._id)
            n += 1
        return n

    def count_active(self) -> int:
        return self._reports.count_documents({"status": {"$in": ["PENDING", "PROCESSING"]}})

    def register_download(self, report_id, when):
        self._reports.update_one({"reportId": report_id}, {"$inc": {"downloadCount": 1}, "$set": {"lastDownloadedAt": when}})

    def fail_stale(self, older_than: timedelta, reason: str) -> int:
        cutoff = datetime.now(timezone.utc) - older_than
        r = self._reports.update_many({"status": {"$in": ["PENDING", "PROCESSING"]}, "generatedAt": {"$lt": cutoff}},
                                      {"$set": {"status": "FAILED", "error": reason}})
        return r.modified_count

    def ping(self):
        try:
            self._client.admin.command("ping")
            return True
        except Exception:
            return False

    def close(self):
        self._client.close()


class MemoryStore:
    """Implementación en memoria para pruebas."""

    def __init__(self):
        self.reports, self.pdfs, self.counters = {}, {}, {}

    def next_report_id(self, year):
        self.counters[year] = self.counters.get(year, 0) + 1
        return f"REP-{year}-{self.counters[year]:06d}"

    def create(self, meta):
        self.reports[meta["reportId"]] = dict(meta)

    def update(self, report_id, fields):
        self.reports[report_id].update(fields)

    def get(self, report_id):
        return dict(self.reports[report_id]) if report_id in self.reports else None

    def list(self, *, user_id, type_, status, date_from, date_to, page, page_size):
        items = [r for r in self.reports.values()
                 if (not user_id or r["generatedBy"] == user_id) and (not type_ or r["type"] == type_)
                 and (not status or r["status"] == status) and (not date_from or r["generatedAt"] >= date_from)
                 and (not date_to or r["generatedAt"] <= date_to)]
        items.sort(key=lambda r: r["generatedAt"], reverse=True)
        s = (page - 1) * page_size
        return [dict(r) for r in items[s:s + page_size]], len(items)

    def save_pdf(self, report_id, file_name, data):
        self.pdfs[report_id] = data

    def save_pdf_file(self, report_id, file_name, path, chunk_size=256 * 1024):
        with open(path, "rb") as fh:
            self.pdfs[report_id] = fh.read()

    def load_pdf(self, report_id):
        return self.pdfs.get(report_id)

    def open_pdf(self, report_id):
        import io
        data = self.pdfs.get(report_id)
        if data is None:
            return None
        buf = io.BytesIO(data)
        buf.length = len(data)          # misma interfaz mínima que GridOut: read(n), close(), length
        return buf

    def purge_pdfs_older_than(self, days: int) -> int:
        return 0

    def count_active(self) -> int:
        return sum(1 for r in self.reports.values() if r["status"] in ("PENDING", "PROCESSING"))

    def register_download(self, report_id, when):
        r = self.reports[report_id]
        r["downloadCount"] = r.get("downloadCount", 0) + 1
        r["lastDownloadedAt"] = when

    def fail_stale(self, older_than, reason):
        cutoff, n = datetime.now(timezone.utc) - older_than, 0
        for r in self.reports.values():
            if r["status"] in ("PENDING", "PROCESSING") and r["generatedAt"] < cutoff:
                r["status"], r["error"] = "FAILED", reason
                n += 1
        return n

    def ping(self):
        return True
