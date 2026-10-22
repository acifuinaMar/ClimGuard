import os
from datetime import datetime,timezone
from fastapi import FastAPI,Header,HTTPException
from pydantic import BaseModel,Field
from pymongo import MongoClient
import jwt
app=FastAPI(title="ClimGuard Audit Service")
collection=MongoClient(os.getenv("MONGO_URL","mongodb://mongo:27017"),serverSelectionTimeoutMS=3000)["climguard_audit"]["events"]
class Event(BaseModel):
    action:str=Field(min_length=1,max_length=120)
    resource:str=Field(min_length=1,max_length=120)
    detail:dict={}
def auth(header):
    if not header or not header.startswith("Bearer "):raise HTTPException(401,"Token requerido")
    try:return jwt.decode(header[7:],os.environ["JWT_KEY"],algorithms=["HS256"],issuer=os.environ["JWT_ISSUER"],audience=os.environ["JWT_AUDIENCE"])
    except (jwt.PyJWTError,KeyError):raise HTTPException(401,"Token inválido")
@app.get("/health")
def health():return {"status":"ok"}
@app.post("/api/audit",status_code=201)
def create(event:Event,authorization:str|None=Header(None)):
    user=auth(authorization)
    username = (
        user.get("sub")
        or user.get("name")
        or user.get(
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        )
        or "unknown"
    )

    doc = {
        **event.model_dump(),
        "user": str(username),
        "timestamp": datetime.now(timezone.utc)
    }
    try:result=collection.insert_one(doc)
    except Exception:raise HTTPException(503,"MongoDB no disponible")
    return {"id":str(result.inserted_id)}
@app.get("/api/audit")
def list_events(authorization:str|None=Header(None)):
    user=auth(authorization)
    roles=user.get("role",user.get("http://schemas.microsoft.com/ws/2008/06/identity/claims/role",[]))
    if isinstance(roles,str):roles=[roles]
    if not any(r.lower() in ("administrador","admin") for r in roles):raise HTTPException(403,"Requiere administrador")
    try:return [{**{k:v for k,v in d.items() if k!="_id"},"id":str(d["_id"])} for d in collection.find().sort("timestamp",-1).limit(100)]
    except Exception:raise HTTPException(503,"MongoDB no disponible")
