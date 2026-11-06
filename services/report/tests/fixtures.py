from __future__ import annotations

from app.clients import FetchResult

COMMUNITIES = [
    {"comunidadId": 1, "nombreComunidad": "San Juan", "municipio": "Escuintla", "departamento": "Escuintla", "pais": "Guatemala", "latitud": 14.3, "longitud": -90.78, "activo": True},
    {"comunidadId": 2, "nombreComunidad": "Río Frío", "municipio": "Cobán", "departamento": "Alta Verapaz", "pais": "Guatemala", "latitud": 15.47, "longitud": -90.37, "activo": True},
    {"comunidadId": 3, "nombreComunidad": "El Mirador", "municipio": "San Benito", "departamento": "Petén", "pais": "Guatemala", "latitud": 16.9, "longitud": -89.9, "activo": False},
]
TYPES = [{"tipoSensorId": 1, "nombre": "Temperatura", "unidadMedida": "°C"}, {"tipoSensorId": 2, "nombre": "Humedad", "unidadMedida": "%"},
         {"tipoSensorId": 4, "nombre": "Lluvia", "unidadMedida": "mm"}, {"tipoSensorId": 5, "nombre": "Nivel de río", "unidadMedida": "m"}]
STATES = [{"estadoSensorId": 1, "nombre": "Activo"}, {"estadoSensorId": 2, "nombre": "Inactivo"},
          {"estadoSensorId": 3, "nombre": "Mantenimiento"}, {"estadoSensorId": 4, "nombre": "Fuera de línea"}]
SENSORS = [
    {"sensorId": 10, "codigo": "T-001", "nombre": "Temp San Juan", "ubicacion": "Plaza", "comunidadId": 1, "tipoSensorId": 1, "estadoSensorId": 1, "fechaInstalacion": "2026-01-15T00:00:00", "fechaUltimaConexion": "2026-10-21T23:50:00", "valorActual": 24.5},
    {"sensorId": 11, "codigo": "R-001", "nombre": "Nivel Río Frío", "ubicacion": "Puente", "comunidadId": 2, "tipoSensorId": 5, "estadoSensorId": 1, "fechaInstalacion": "2026-02-01T00:00:00.1234567", "fechaUltimaConexion": "2026-10-10T00:00:00", "valorActual": 3.1},
    {"sensorId": 12, "codigo": "L-001", "nombre": "Lluvia Mirador", "ubicacion": "Torre", "comunidadId": 3, "tipoSensorId": 4, "estadoSensorId": 4, "fechaInstalacion": "2026-03-01T00:00:00", "fechaUltimaConexion": None, "valorActual": None},
    {"sensorId": 13, "codigo": "H-001", "nombre": "Humedad San Juan", "ubicacion": "Finca", "comunidadId": 1, "tipoSensorId": 2, "estadoSensorId": 2, "fechaInstalacion": "2026-03-05T00:00:00", "fechaUltimaConexion": "2026-09-01T00:00:00", "valorActual": 60},
    {"sensorId": 14, "codigo": "T-002", "nombre": "Temp Mirador", "ubicacion": "Camino", "comunidadId": 3, "tipoSensorId": 1, "estadoSensorId": 3, "fechaInstalacion": "2026-04-01T00:00:00", "fechaUltimaConexion": "2026-10-21T20:00:00", "valorActual": 19},
]
READINGS = [{"lecturaId": 1, "sensorId": 10, "valor": 24.5, "fechaHora": "2026-10-21T18:00:00"},
            {"lecturaId": 2, "sensorId": 10, "valor": 30.1, "fechaHora": "2026-10-21T19:00:00"},
            {"lecturaId": 3, "sensorId": 11, "valor": 4.25, "fechaHora": "2026-10-20T10:00:00"}]
LEVELS = [{"nivelAlertaId": 1, "nombre": "Normal", "colorHex": "#28A745"}, {"nivelAlertaId": 2, "nombre": "Precaución", "colorHex": "#FFC107"},
          {"nivelAlertaId": 3, "nombre": "Alerta", "colorHex": "#FD7E14"}, {"nivelAlertaId": 4, "nombre": "Emergencia", "colorHex": "#DC3545"}]
PHENOMENA = [{"tipoFenomenoId": i, "nombre": n} for i, n in enumerate(["Inundación", "Sequía", "Tormenta", "Helada", "Incendio Forestal"], 1)]
ALERT_STATES = [{"estadoAlertaId": 1, "nombre": "Activa"}, {"estadoAlertaId": 2, "nombre": "Atendida"}, {"estadoAlertaId": 3, "nombre": "Cerrada"}]
RULES = [{"reglaAlertaId": 7, "nombre": "Río", "valorMin": 0, "valorMax": 3.8}]
ALERTS = [
    {"alertaId": 100, "valorDetectado": 4.25, "mensajeSnap": "Nivel del río crítico <script>x</script>", "nivelAlertaIdSnap": 4, "tipoFenomenoIdSnap": 1, "fechaHora": "2026-10-20T10:00:05", "activo": True, "sensorId": 11, "comunidadId": 2, "reglaAlertaId": 7, "estadoAlertaId": 1, "umbralMin": 0, "umbralMax": 3.8},
    {"alertaId": 101, "valorDetectado": 0.5, "mensajeSnap": "Helada", "nivelAlertaIdSnap": 2, "tipoFenomenoIdSnap": 4, "fechaHora": "2026-10-21T04:00:00", "activo": False, "sensorId": 10, "comunidadId": 1, "reglaAlertaId": 7, "estadoAlertaId": 2},
]
EVENTS = [
    {"eventoId": 1, "descripcion": "Alerta generada", "fechaHora": "2026-10-20T10:00:05", "tipoEventoId": 1, "tipoEventoNombre": "Alerta generada", "alertaId": 100, "comunidadId": 2, "sensorId": 11, "tipoFenomenoId": 1, "nivelAlertaId": 4},
    {"eventoId": 2, "descripcion": "Alerta atendida", "fechaHora": "2026-10-21T05:00:00", "tipoEventoId": 2, "tipoEventoNombre": "Alerta atendida", "alertaId": 101, "comunidadId": 1, "sensorId": 10, "tipoFenomenoId": 4, "nivelAlertaId": 2},
]
SENSOR_STATS = [{"tipoSensorId": 1, "cantidad": 100, "minimo": 8.5, "promedio": 22.25, "maximo": 33.0, "suma": 2225.0},
                {"tipoSensorId": 4, "cantidad": 40, "minimo": 0, "promedio": 2.5, "maximo": 12.0, "suma": 100.0},
                {"tipoSensorId": 5, "cantidad": 40, "minimo": 1.2, "promedio": 2.1, "maximo": 4.25, "suma": 84.0}]
ALERT_STATS = {"total": 2, "activas": 1, "totalEventos": 2, "porNivel": [{"id": 2, "cantidad": 1}, {"id": 4, "cantidad": 1}],
               "porFenomeno": [{"id": 1, "cantidad": 1}, {"id": 4, "cantidad": 1}], "porEstado": [{"id": 1, "cantidad": 1}, {"id": 2, "cantidad": 1}],
               "porComunidad": [{"id": 2, "cantidad": 1}, {"id": 1, "cantidad": 1}]}
ROUTES = {"/api/communities": COMMUNITIES, "/api/sensors": SENSORS, "/api/sensor-types": TYPES, "/api/sensor-states": STATES,
          "/api/readings": READINGS, "/api/readings/stats": SENSOR_STATS, "/api/alerts": ALERTS, "/api/alerts/events": EVENTS,
          "/api/alerts/stats": ALERT_STATS, "/api/levels": LEVELS, "/api/phenomena": PHENOMENA, "/api/alert-states": ALERT_STATES, "/api/rules": RULES}


def make_fetch(routes=None, fail_paths=(), calls=None):
    routes = ROUTES if routes is None else routes

    async def fetch(url, params, headers):
        path = "/" + url.split("//", 1)[1].split("/", 1)[1]
        if calls is not None:
            calls.append((path, dict(params), dict(headers)))
        if path in fail_paths:
            return FetchResult(500, {"error": "boom"}, {})
        if path not in routes:
            return FetchResult(404, None, {})
        data = routes[path]
        if isinstance(data, list) and "page" in params:
            ps, pg = int(params["pageSize"]), int(params["page"])
            return FetchResult(200, data[(pg - 1) * ps: pg * ps], {"x-total-count": str(len(data))})
        return FetchResult(200, data, {})
    return fetch
