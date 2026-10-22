import os, io, uuid
from datetime import datetime, timezone
from pathlib import Path
import httpx, jwt
from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pymongo import MongoClient
from weasyprint import HTML

app = FastAPI(title="ClimGuard Report Service")
client = MongoClient(os.getenv("MONGO_URL", "mongodb://mongo:27017"), serverSelectionTimeoutMS=3000)
collection = client["climguard_reports"]["history"]
templates = Environment(loader=FileSystemLoader(str(Path(__file__).parent / "templates")), autoescape=select_autoescape(["html"]))
REPORTS = {"communities": ("Comunidades", "/api/Comunidad"), "sensors": ("Sensores", "/api/Sensor"), "alerts": ("Alertas", "/api/Alerta"), "readings": ("Lecturas", "/api/LecturaSensor")}

def authorize(header: str | None, admin=False):
    if not header or not header.startswith("Bearer "): raise HTTPException(401, "Bearer token requerido")
    secret=os.getenv("JWT_KEY")
    if not secret: raise HTTPException(503, "JWT_KEY no configurada")
    try:
        claims=jwt.decode(header[7:],secret,algorithms=["HS256"],issuer=os.environ["JWT_ISSUER"],audience=os.environ["JWT_AUDIENCE"])
    except (jwt.PyJWTError, KeyError): raise HTTPException(401,"Token inválido")
    roles=claims.get("role",claims.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role",[]))
    if isinstance(roles,str):roles=[roles]
    if admin and not any(r.lower() in ("administrador","admin") for r in roles): raise HTTPException(403,"Requiere administrador")
    return claims

@app.get("/health")
def health(): return {"status":"ok"}

@app.get("/api/reports/types")
def types(authorization: str | None = Header(None)):
    authorize(authorization)
    return [{"key":key,"name":name} for key,(name,_) in REPORTS.items()]

@app.post("/api/reports/{kind}")
async def generate(kind: str, authorization: str | None = Header(None)):
    claims=authorize(authorization,admin=True)
    if kind not in REPORTS: raise HTTPException(404,"Reporte no implementado")
    title,endpoint=REPORTS[kind]
    url=os.getenv("LEGACY_API_URL","http://api:8080").rstrip("/")+endpoint
    try:
        async with httpx.AsyncClient(timeout=15) as http:
            response=await http.get(url,headers={"Authorization":authorization})
            response.raise_for_status()
            payload=response.json()
    except (httpx.HTTPError,ValueError) as exc:
        raise HTTPException(502,f"No fue posible obtener los datos de {kind}: {type(exc).__name__}")
    if isinstance(payload,list):rows=payload
    elif isinstance(payload,dict):
        rows=next((v for v in payload.values() if isinstance(v,list)),None)
        if rows is None: rows=[payload]
    else: raise HTTPException(502,"Formato de respuesta no compatible")
    if not all(isinstance(row,dict) for row in rows):raise HTTPException(502,"Los registros deben ser objetos")
    # Sustituir IDs por nombres en el reporte de sensores
    if kind == "sensors" and rows:
        base_url = os.getenv(
            "LEGACY_API_URL", "http://api:8080"
        ).rstrip("/")

        headers = {"Authorization": authorization}

        try:
            async with httpx.AsyncClient(timeout=15) as http:
                comunidades_resp = await http.get(
                    base_url + "/api/Comunidad",
                    headers=headers
                )
                estados_resp = await http.get(
                    base_url + "/api/EstadoSensor",
                    headers=headers
                )

                comunidades_resp.raise_for_status()
                estados_resp.raise_for_status()

                comunidades = comunidades_resp.json()
                estados = estados_resp.json()

            nombres_comunidad = {
                str(c["comunidadId"]): c["nombreComunidad"]
                for c in comunidades
            }

            nombres_estado = {
                str(e["estadoSensorId"]): e["nombre"]
                for e in estados
            }

            for row in rows:
                row["comunidadNombre"] = nombres_comunidad.get(
                    str(row.get("comunidadId")),
                    str(row.get("comunidadId") or "—")
                )

                row["estadoSensorNombre"] = nombres_estado.get(
                    str(row.get("estadoSensorId")),
                    str(row.get("estadoSensorId") or "—")
                )

        except (httpx.HTTPError, ValueError, KeyError, TypeError):
            # Si falla un catálogo, conservamos los IDs
            # y permitimos generar el reporte.
            pass
    columns=list(dict.fromkeys(k for row in rows[:50] for k in row.keys()))[:16] or ["Sin datos"]
    report_id=str(uuid.uuid4())
    now=datetime.now(timezone.utc)
    user = str(
        claims.get("sub")
        or claims.get("name")
        or claims.get(
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        )
        or "desconocido"
    )
    html=templates.get_template("report.html").render(title=f"Reporte de {title}",report_type=kind,rows=rows,columns=columns,generated_at=now.strftime("%Y-%m-%d %H:%M"),user=user)
    pdf=HTML(string=html).write_pdf()
    metadata={"reportId":report_id,"type":kind,"generatedBy":user,"generatedAt":now,"filters":{},"status":"COMPLETED","fileName":f"{kind}-{report_id}.pdf","downloadCount":1,"lastDownloadedAt":now}
    try:collection.insert_one(metadata)
    except Exception:raise HTTPException(503,"No se pudo registrar metadata; revise MongoDB")
    return StreamingResponse(io.BytesIO(pdf),media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="{kind}-{report_id}.pdf"',"X-Report-Id":report_id})

@app.get("/api/reports/history")
def history(authorization: str | None = Header(None)):
    authorize(authorization,admin=True)
    try:return list(collection.find({}, {"_id":0}).sort("generatedAt",-1).limit(100))
    except Exception:raise HTTPException(503,"MongoDB no disponible")
