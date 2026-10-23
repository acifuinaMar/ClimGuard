"""Catálogo RF-REP-01..08: collector (async, APIs de otros servicios) + builder (función pura)."""
from __future__ import annotations

import asyncio
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Awaitable, Callable, Optional

from ..clients import Apis, Collected, _unwrap
from ..utils import fmt_coord, fmt_date, fmt_datetime, fmt_num, fmt_time, parse_dt
from .base import BuildContext, Card, ReportDocument, Section, by_id
from .filters import date_params

DASH = "—"
COLOR_NAMES = {"#28A745": "Verde", "#FFC107": "Amarillo", "#FD7E14": "Naranja", "#DC3545": "Rojo"}
MIN_DT = datetime.min.replace(tzinfo=timezone.utc)


def _norm(t):
    return unicodedata.normalize("NFKD", str(t or "")).encode("ascii", "ignore").decode().strip().lower()


def _g(d, key, default=DASH):
    if not d:
        return default
    v = d.get(key)
    return default if v is None or v == "" else v


def _items(x):
    return x.items if isinstance(x, Collected) else _unwrap(x)


def _truncated(*cols):
    return any(isinstance(c, Collected) and c.truncated for c in cols)


def _level_label(level):
    if not level:
        return DASH
    color = COLOR_NAMES.get(str(level.get("colorHex", "")).upper(), "")
    name = _g(level, "nombre")
    return f"{name} ({color})" if color else str(name)


def _umbral(alert, rules):
    lo, hi = alert.get("umbralMin"), alert.get("umbralMax")
    if lo is None or hi is None:
        rule = rules.get(alert.get("reglaAlertaId"))
        lo, hi = (rule.get("valorMin"), rule.get("valorMax")) if rule else (None, None)
    if lo is None or hi is None:
        return DASH
    return f"fuera de {fmt_num(lo)} – {fmt_num(hi)}"


def _filter_lines(f, names, tz):
    labels = {"comunidadId": "Comunidad", "sensorId": "Sensor", "tipoSensorId": "Tipo de sensor",
              "estadoSensorId": "Estado del sensor", "nivelAlertaId": "Nivel", "tipoFenomenoId": "Fenómeno",
              "estadoAlertaId": "Estado de alerta", "activo": "Activas", "from": "Desde", "to": "Hasta"}
    out = []
    for k, v in f.items():
        if k in ("from", "to"):
            y, m, d = str(v).split("-")
            shown = f"{d}/{m}/{y}"
        elif k == "activo":
            shown = "Sí" if v else "No"
        elif k in names:
            shown = names[k](v)
        else:
            shown = str(v)
        out.append((labels.get(k, k), shown))
    return out or [("Filtros", "Sin filtros (todos los registros)")]


def _name(index, key):
    return lambda v: str(_g(index.get(v), key, f"#{v}"))


# 1 comunidades --------------------------------------------------------------
async def collect_communities(api: Apis, f):
    c, s = await asyncio.gather(api.community.get_all("/api/communities"), api.sensor.get_all("/api/sensors"))
    return {"communities": c, "sensors": s}


def build_communities(d, f, ctx):
    comms = _items(d["communities"])
    if "activo" in f:
        comms = [c for c in comms if bool(c.get("activo")) == f["activo"]]
    counts = {}
    for s in _items(d["sensors"]):
        counts[s.get("comunidadId")] = counts.get(s.get("comunidadId"), 0) + 1
    rows = [[str(_g(c, "nombreComunidad")), str(_g(c, "municipio")), str(_g(c, "departamento")), str(_g(c, "pais")),
             fmt_coord(c.get("latitud"), c.get("longitud")), "Activa" if c.get("activo") else "Inactiva",
             str(counts.get(c.get("comunidadId"), 0))]
            for c in sorted(comms, key=lambda c: str(c.get("nombreComunidad", "")).lower())]
    sec = Section("Comunidades registradas",
                  ["Nombre", "Municipio", "Departamento", "País", "Coordenadas", "Estado", "Sensores"], rows,
                  cards=[Card("Comunidades", str(len(rows))),
                         Card("Activas", str(sum(1 for c in comms if c.get("activo"))), "ok"),
                         Card("Sensores asociados", str(sum(counts.get(c.get("comunidadId"), 0) for c in comms)))])
    return ReportDocument("COMMUNITIES", "Reporte de comunidades", "Comunidades monitoreadas y sensores asociados",
                          _filter_lines(f, {}, ctx.tz), [sec], len(rows), _truncated(d["communities"], d["sensors"]))


# 2 sensores -----------------------------------------------------------------
async def collect_sensors(api, f):
    p = {k: f.get(k) for k in ("comunidadId", "tipoSensorId", "estadoSensorId")}
    s, c, t, st = await asyncio.gather(api.sensor.get_all("/api/sensors", p), api.community.get_all("/api/communities"),
                                       api.sensor.get_json("/api/sensor-types"), api.sensor.get_json("/api/sensor-states"))
    return {"sensors": s, "communities": c, "types": t, "states": st}


def build_sensors(d, f, ctx):
    comms, types, states = (by_id(_items(d["communities"]), "comunidadId"), by_id(_items(d["types"]), "tipoSensorId"),
                            by_id(_items(d["states"]), "estadoSensorId"))
    sensors = [s for s in _items(d["sensors"])
               if all(f.get(k) is None or s.get(k) == f[k] for k in ("comunidadId", "tipoSensorId", "estadoSensorId"))]
    rows = [[str(_g(s, "codigo")), str(_g(s, "nombre")), str(_g(types.get(s.get("tipoSensorId")), "nombre")),
             str(_g(comms.get(s.get("comunidadId")), "nombreComunidad")), str(_g(s, "ubicacion")),
             str(_g(types.get(s.get("tipoSensorId")), "unidadMedida")),
             str(_g(states.get(s.get("estadoSensorId")), "nombre")), fmt_date(parse_dt(s.get("fechaInstalacion")), ctx.tz)]
            for s in sorted(sensors, key=lambda s: str(s.get("codigo", "")))]
    names = {"comunidadId": _name(comms, "nombreComunidad"), "tipoSensorId": _name(types, "nombre"),
             "estadoSensorId": _name(states, "nombre")}
    sec = Section("Sensores registrados", ["Código", "Nombre", "Tipo", "Comunidad", "Ubicación", "Unidad", "Estado", "Instalación"],
                  rows, cards=[Card("Sensores", str(len(rows)))])
    return ReportDocument("SENSORS", "Reporte de sensores", "Inventario de sensores por tipo, comunidad y estado",
                          _filter_lines(f, names, ctx.tz), [sec], len(rows), _truncated(d["sensors"], d["communities"]))


# 3 lecturas -----------------------------------------------------------------
async def collect_readings(api, f):
    p = {k: f.get(k) for k in ("sensorId", "comunidadId", "tipoSensorId")}
    p.update(date_params(f))
    r, s, c, t, st = await asyncio.gather(api.sensor.get_all("/api/readings", p), api.sensor.get_all("/api/sensors"),
                                          api.community.get_all("/api/communities"), api.sensor.get_json("/api/sensor-types"),
                                          api.sensor.get_json("/api/sensor-states"))
    return {"readings": r, "sensors": s, "communities": c, "types": t, "states": st}


def build_readings(d, f, ctx):
    sensors, comms = by_id(_items(d["sensors"]), "sensorId"), by_id(_items(d["communities"]), "comunidadId")
    types, states = by_id(_items(d["types"]), "tipoSensorId"), by_id(_items(d["states"]), "estadoSensorId")
    readings = sorted(_items(d["readings"]), key=lambda r: parse_dt(r.get("fechaHora")) or MIN_DT, reverse=True)
    rows = []
    for r in readings:
        s = sensors.get(r.get("sensorId"))
        t = types.get((s or {}).get("tipoSensorId"))
        dt = parse_dt(r.get("fechaHora"))
        rows.append([str(_g(s, "nombre", f"Sensor #{r.get('sensorId')}")),
                     str(_g(comms.get((s or {}).get("comunidadId")), "nombreComunidad")),
                     fmt_date(dt, ctx.tz), fmt_time(dt, ctx.tz), fmt_num(r.get("valor")), str(_g(t, "unidadMedida")),
                     str(_g(states.get((s or {}).get("estadoSensorId")), "nombre"))])
    names = {"sensorId": _name(sensors, "nombre"), "comunidadId": _name(comms, "nombreComunidad"),
             "tipoSensorId": _name(types, "nombre")}
    sec = Section("Lecturas registradas", ["Sensor", "Comunidad", "Fecha", "Hora", "Valor", "Unidad", "Estado"], rows,
                  cards=[Card("Lecturas", str(len(rows)))])
    return ReportDocument("READINGS", "Reporte de lecturas", "Historial de lecturas de sensores",
                          _filter_lines(f, names, ctx.tz), [sec], len(rows), _truncated(d["readings"]))


# 4 alertas ------------------------------------------------------------------
async def collect_alerts(api, f):
    p = {k: f.get(k) for k in ("comunidadId", "sensorId", "nivelAlertaId", "tipoFenomenoId", "estadoAlertaId")}
    p.update(date_params(f))
    a, lv, ph, st, ru, se, co = await asyncio.gather(
        api.alert.get_all("/api/alerts", p), api.alert.get_json("/api/levels"), api.alert.get_json("/api/phenomena"),
        api.alert.get_json("/api/alert-states"), api.alert.get_json("/api/rules"), api.sensor.get_all("/api/sensors"),
        api.community.get_all("/api/communities"))
    return {"alerts": a, "levels": lv, "phenomena": ph, "states": st, "rules": ru, "sensors": se, "communities": co}


def build_alerts(d, f, ctx):
    levels, phen = by_id(_items(d["levels"]), "nivelAlertaId"), by_id(_items(d["phenomena"]), "tipoFenomenoId")
    states, rules = by_id(_items(d["states"]), "estadoAlertaId"), by_id(_items(d["rules"]), "reglaAlertaId")
    sensors, comms = by_id(_items(d["sensors"]), "sensorId"), by_id(_items(d["communities"]), "comunidadId")
    alerts = sorted(_items(d["alerts"]), key=lambda a: parse_dt(a.get("fechaHora")) or MIN_DT, reverse=True)
    rows, per_level = [], {}
    for a in alerts:
        dt = parse_dt(a.get("fechaHora"))
        per_level[a.get("nivelAlertaIdSnap")] = per_level.get(a.get("nivelAlertaIdSnap"), 0) + 1
        rows.append([fmt_date(dt, ctx.tz), fmt_time(dt, ctx.tz), str(_g(comms.get(a.get("comunidadId")), "nombreComunidad")),
                     str(_g(sensors.get(a.get("sensorId")), "nombre", f"Sensor #{a.get('sensorId')}")),
                     str(_g(phen.get(a.get("tipoFenomenoIdSnap")), "nombre")), _level_label(levels.get(a.get("nivelAlertaIdSnap"))),
                     fmt_num(a.get("valorDetectado")), _umbral(a, rules), str(_g(a, "mensajeSnap")),
                     str(_g(states.get(a.get("estadoAlertaId")), "nombre"))])
    top = max(levels) if levels else None
    cards = [Card("Alertas", str(len(rows)))]
    for lid in sorted(levels):
        cards.append(Card(str(levels[lid].get("nombre")), str(per_level.get(lid, 0)), "danger" if lid == top else ""))
    names = {"comunidadId": _name(comms, "nombreComunidad"), "sensorId": _name(sensors, "nombre"),
             "nivelAlertaId": _name(levels, "nombre"), "tipoFenomenoId": _name(phen, "nombre"),
             "estadoAlertaId": _name(states, "nombre")}
    sec = Section("Alertas generadas", ["Fecha", "Hora", "Comunidad", "Sensor", "Fenómeno", "Nivel", "Valor", "Umbral", "Mensaje", "Estado"],
                  rows, cards=cards)
    return ReportDocument("ALERTS", "Reporte de alertas", "Historial de alertas generadas por las reglas configuradas",
                          _filter_lines(f, names, ctx.tz), [sec], len(rows), _truncated(d["alerts"]))


# 5 historial de eventos -------------------------------------------------------
async def collect_event_history(api, f):
    p = {k: f.get(k) for k in ("comunidadId", "tipoFenomenoId")}
    p.update(date_params(f))
    e, lv, ph, se, co = await asyncio.gather(api.alert.get_all("/api/alerts/events", p), api.alert.get_json("/api/levels"),
                                             api.alert.get_json("/api/phenomena"), api.sensor.get_all("/api/sensors"),
                                             api.community.get_all("/api/communities"))
    return {"events": e, "levels": lv, "phenomena": ph, "sensors": se, "communities": co}


def build_event_history(d, f, ctx):
    levels, phen = by_id(_items(d["levels"]), "nivelAlertaId"), by_id(_items(d["phenomena"]), "tipoFenomenoId")
    sensors, comms = by_id(_items(d["sensors"]), "sensorId"), by_id(_items(d["communities"]), "comunidadId")
    events = sorted(_items(d["events"]), key=lambda e: parse_dt(e.get("fechaHora")) or MIN_DT, reverse=True)
    per, rows = {}, []
    for e in events:
        dt = parse_dt(e.get("fechaHora"))
        per[e.get("tipoFenomenoId")] = per.get(e.get("tipoFenomenoId"), 0) + 1
        rows.append([fmt_date(dt, ctx.tz), fmt_time(dt, ctx.tz), str(_g(phen.get(e.get("tipoFenomenoId")), "nombre")),
                     _level_label(levels.get(e.get("nivelAlertaId"))), str(_g(comms.get(e.get("comunidadId")), "nombreComunidad")),
                     str(_g(sensors.get(e.get("sensorId")), "nombre")), str(_g(e, "tipoEventoNombre")), str(_g(e, "descripcion"))])
    cards = [Card(str(phen[p].get("nombre")), str(per.get(p, 0))) for p in sorted(phen)]
    names = {"comunidadId": _name(comms, "nombreComunidad"), "tipoFenomenoId": _name(phen, "nombre")}
    sec = Section("Eventos registrados", ["Fecha", "Hora", "Fenómeno", "Nivel", "Comunidad", "Sensor", "Evento", "Descripción"], rows, cards=cards)
    return ReportDocument("EVENT_HISTORY", "Historial de eventos", "Registro de fenómenos climáticos detectados",
                          _filter_lines(f, names, ctx.tz), [sec], len(rows), _truncated(d["events"]))


# 6 estado de sensores ---------------------------------------------------------
async def collect_sensor_status(api, f):
    s, c, t, st = await asyncio.gather(api.sensor.get_all("/api/sensors", {"comunidadId": f.get("comunidadId")}),
                                       api.community.get_all("/api/communities"), api.sensor.get_json("/api/sensor-types"),
                                       api.sensor.get_json("/api/sensor-states"))
    return {"sensors": s, "communities": c, "types": t, "states": st}


def classify_sensor(sensor, state_name, ctx):
    """(activo, sin_comunicacion): 'Fuera de línea', o 'Activo' sin lecturas recientes."""
    st = _norm(state_name)
    last = parse_dt(sensor.get("fechaUltimaConexion"))
    now = ctx.now or datetime.now(timezone.utc)
    stale = last is None or (now - last) > timedelta(minutes=ctx.stale_minutes)
    return st == "activo", st == "fuera de linea" or (st == "activo" and stale)


def build_sensor_status(d, f, ctx):
    comms, types, states = (by_id(_items(d["communities"]), "comunidadId"), by_id(_items(d["types"]), "tipoSensorId"),
                            by_id(_items(d["states"]), "estadoSensorId"))
    sensors = [s for s in _items(d["sensors"]) if f.get("comunidadId") is None or s.get("comunidadId") == f["comunidadId"]]
    tally = {"activo": 0, "inactivo": 0, "mantenimiento": 0, "fuera de linea": 0}
    silent_n, rows = 0, []
    for s in sorted(sensors, key=lambda s: str(s.get("codigo", ""))):
        st_name = str(_g(states.get(s.get("estadoSensorId")), "nombre", ""))
        _, silent = classify_sensor(s, st_name, ctx)
        tally[_norm(st_name)] = tally.get(_norm(st_name), 0) + 1
        silent_n += 1 if silent else 0
        unit = _g(types.get(s.get("tipoSensorId")), "unidadMedida", "")
        rows.append([str(_g(s, "codigo")), str(_g(s, "nombre")), str(_g(comms.get(s.get("comunidadId")), "nombreComunidad")),
                     st_name or DASH, "Sin comunicación" if silent else "Comunicando",
                     fmt_datetime(parse_dt(s.get("fechaUltimaConexion")), ctx.tz),
                     f"{fmt_num(s.get('valorActual'))} {unit}".strip() if s.get("valorActual") is not None else DASH])
    cards = [Card("Activos", str(tally["activo"]), "ok"), Card("Inactivos", str(tally["inactivo"])),
             Card("En mantenimiento", str(tally["mantenimiento"]), "warn"),
             Card("Fuera de línea", str(tally["fuera de linea"]), "danger" if tally["fuera de linea"] else ""),
             Card("Sin comunicación", str(silent_n), "danger" if silent_n else "ok")]
    sec = Section("Estado actual de los sensores", ["Código", "Sensor", "Comunidad", "Estado", "Comunicación", "Última lectura", "Valor"],
                  rows, cards=cards, note=f"Se considera sin comunicación un sensor activo sin lecturas en {ctx.stale_minutes} minutos o fuera de línea.")
    return ReportDocument("SENSOR_STATUS", "Reporte de estado de sensores", "Disponibilidad y comunicación de la red de sensores",
                          _filter_lines(f, {"comunidadId": _name(comms, "nombreComunidad")}, ctx.tz), [sec], len(rows), _truncated(d["sensors"]))


# 7 estadísticas climáticas ----------------------------------------------------
async def collect_climate_stats(api, f):
    p = {"comunidadId": f.get("comunidadId"), **date_params(f)}
    st, ty, ast, lv, ph, co = await asyncio.gather(api.sensor.get_json("/api/readings/stats", p), api.sensor.get_json("/api/sensor-types"),
                                                   api.alert.get_json("/api/alerts/stats", p), api.alert.get_json("/api/levels"),
                                                   api.alert.get_json("/api/phenomena"), api.community.get_all("/api/communities"))
    return {"stats": st, "types": ty, "alert_stats": ast, "levels": lv, "phenomena": ph, "communities": co}


def _climate_rows(stats, types):
    rows = []
    for s in sorted(_items(stats), key=lambda s: (s.get("tipoSensorId") is None, s.get("tipoSensorId"))):
        t = types.get(s.get("tipoSensorId"))
        name = str(_g(t, "nombre", f"Tipo #{s.get('tipoSensorId')}"))
        rows.append([name, str(_g(t, "unidadMedida", "")), str(s.get("cantidad", 0)), fmt_num(s.get("promedio")),
                     fmt_num(s.get("minimo")), fmt_num(s.get("maximo")), fmt_num(s.get("suma")) if "lluvia" in _norm(name) else DASH])
    return rows


def _alert_dist(astats, levels, phen):
    astats = astats if isinstance(astats, dict) else {}
    lv = [[_level_label(levels.get(i.get("id"))), str(i.get("cantidad", 0))] for i in astats.get("porNivel", [])]
    fe = [[str(_g(phen.get(i.get("id")), "nombre", f"#{i.get('id')}")), str(i.get("cantidad", 0))] for i in astats.get("porFenomeno", [])]
    return [Section("Alertas por nivel", ["Nivel", "Cantidad"], lv, narrow=True),
            Section("Alertas por fenómeno", ["Fenómeno", "Cantidad"], fe, narrow=True)]


def build_climate_stats(d, f, ctx):
    types, levels = by_id(_items(d["types"]), "tipoSensorId"), by_id(_items(d["levels"]), "nivelAlertaId")
    phen, comms = by_id(_items(d["phenomena"]), "tipoFenomenoId"), by_id(_items(d["communities"]), "comunidadId")
    rows = _climate_rows(d["stats"], types)
    astats = d["alert_stats"] if isinstance(d["alert_stats"], dict) else {}
    main = Section("Variables climáticas", ["Variable", "Unidad", "Lecturas", "Promedio", "Mínimo", "Máximo", "Acumulado"], rows,
                   cards=[Card("Alertas en el período", str(astats.get("total", 0)), "danger" if astats.get("total") else "ok")],
                   note="El acumulado solo aplica a lluvia.")
    return ReportDocument("CLIMATE_STATS", "Estadísticas climáticas", "Resumen estadístico de variables y alertas",
                          _filter_lines(f, {"comunidadId": _name(comms, "nombreComunidad")}, ctx.tz),
                          [main, *_alert_dist(astats, levels, phen)], len(rows), False)


# 8 ejecutivo ------------------------------------------------------------------
async def collect_executive(api, f):
    p = {"comunidadId": f.get("comunidadId"), **date_params(f)}
    co, se, st, ty, rs, ast, lv, ph = await asyncio.gather(
        api.community.get_all("/api/communities"), api.sensor.get_all("/api/sensors", {"comunidadId": f.get("comunidadId")}),
        api.sensor.get_json("/api/sensor-states"), api.sensor.get_json("/api/sensor-types"),
        api.sensor.get_json("/api/readings/stats", p), api.alert.get_json("/api/alerts/stats", p),
        api.alert.get_json("/api/levels"), api.alert.get_json("/api/phenomena"))
    return {"communities": co, "sensors": se, "states": st, "types": ty, "stats": rs, "alert_stats": ast, "levels": lv, "phenomena": ph}


def executive_indicators(d, f, ctx):
    """Indicadores estructurados: alimentan el reporte ejecutivo y el dashboard (§15)."""
    comms_all = _items(d["communities"])
    comms = [c for c in comms_all if f.get("comunidadId") is None or c.get("comunidadId") == f["comunidadId"]]
    sensors = [s for s in _items(d["sensors"]) if f.get("comunidadId") is None or s.get("comunidadId") == f["comunidadId"]]
    states, types = by_id(_items(d["states"]), "estadoSensorId"), by_id(_items(d["types"]), "tipoSensorId")
    levels, phen = by_id(_items(d["levels"]), "nivelAlertaId"), by_id(_items(d["phenomena"]), "tipoFenomenoId")
    cidx = by_id(comms_all, "comunidadId")
    astats = d["alert_stats"] if isinstance(d["alert_stats"], dict) else {}
    por_estado, sin_com = {}, 0
    for s in sensors:
        n = str(_g(states.get(s.get("estadoSensorId")), "nombre", "Desconocido"))
        por_estado[n] = por_estado.get(n, 0) + 1
        sin_com += 1 if classify_sensor(s, n, ctx)[1] else 0
    nivel_max = None
    for i in astats.get("porNivel", []):
        if i.get("cantidad", 0) > 0 and (nivel_max is None or i["id"] > nivel_max):
            nivel_max = i["id"]
    top = max(levels) if levels else None
    situacion = _g(levels.get(nivel_max), "nombre", "Sin alertas") if nivel_max else "Sin alertas"
    tone = "ok" if not nivel_max else ("danger" if nivel_max == top else "warn")
    return {
        "generatedAt": (ctx.now or datetime.now(timezone.utc)).isoformat(),
        "situacion": {"nivel": situacion, "tono": tone},
        "comunidades": {"total": len(comms), "activas": sum(1 for c in comms if c.get("activo"))},
        "sensores": {"total": len(sensors), "sinComunicacion": sin_com,
                     "porEstado": [{"nombre": k, "cantidad": v} for k, v in sorted(por_estado.items())]},
        "alertas": {"total": astats.get("total", 0), "activas": astats.get("activas", 0),
                    "porNivel": [{"id": i.get("id"), "nombre": _g(levels.get(i.get("id")), "nombre", f"#{i.get('id')}"),
                                  "colorHex": _g(levels.get(i.get("id")), "colorHex", ""), "cantidad": i.get("cantidad", 0)}
                                 for i in astats.get("porNivel", [])],
                    "porFenomeno": [{"id": i.get("id"), "nombre": _g(phen.get(i.get("id")), "nombre", f"#{i.get('id')}"),
                                     "cantidad": i.get("cantidad", 0)} for i in astats.get("porFenomeno", [])],
                    "porComunidad": [{"id": i.get("id"), "nombre": _g(cidx.get(i.get("id")), "nombreComunidad", f"#{i.get('id')}"),
                                      "cantidad": i.get("cantidad", 0)} for i in astats.get("porComunidad", [])]},
        "eventos": {"total": astats.get("totalEventos", 0)},
        "clima": [{"variable": r[0], "unidad": r[1], "lecturas": r[2], "promedio": r[3], "minimo": r[4], "maximo": r[5],
                   "acumulado": r[6]} for r in _climate_rows(d["stats"], types)],
    }


def build_executive(d, f, ctx):
    ind = executive_indicators(d, f, ctx)
    levels, phen = by_id(_items(d["levels"]), "nivelAlertaId"), by_id(_items(d["phenomena"]), "tipoFenomenoId")
    types, comms = by_id(_items(d["types"]), "tipoSensorId"), by_id(_items(d["communities"]), "comunidadId")
    kpis = Section("Situación general", cards=[
        Card("Situación climática global", ind["situacion"]["nivel"], ind["situacion"]["tono"]),
        Card("Comunidades activas", f"{ind['comunidades']['activas']} de {ind['comunidades']['total']}"),
        Card("Sensores", str(ind["sensores"]["total"])),
        Card("Sensores sin comunicación", str(ind["sensores"]["sinComunicacion"]), "danger" if ind["sensores"]["sinComunicacion"] else "ok"),
        Card("Alertas en el período", str(ind["alertas"]["total"])),
        Card("Alertas activas", str(ind["alertas"]["activas"]), "warn" if ind["alertas"]["activas"] else "ok"),
        Card("Eventos registrados", str(ind["eventos"]["total"]))])
    sens = Section("Sensores por estado", ["Estado", "Cantidad"], [[i["nombre"], str(i["cantidad"])] for i in ind["sensores"]["porEstado"]], narrow=True)
    top_c = sorted(ind["alertas"]["porComunidad"], key=lambda i: -i["cantidad"])[:10]
    por_c = Section("Comunidades con más alertas (top 10)", ["Comunidad", "Alertas"], [[i["nombre"], str(i["cantidad"])] for i in top_c], narrow=True)
    climate = Section("Indicadores climáticos", ["Variable", "Unidad", "Lecturas", "Promedio", "Mínimo", "Máximo", "Acumulado"],
                      _climate_rows(d["stats"], types))
    astats = d["alert_stats"] if isinstance(d["alert_stats"], dict) else {}
    return ReportDocument("EXECUTIVE", "Reporte ejecutivo", "Situación climática global y principales indicadores",
                          _filter_lines(f, {"comunidadId": _name(comms, "nombreComunidad")}, ctx.tz),
                          [kpis, sens, *_alert_dist(astats, levels, phen), por_c, climate], len(ind["clima"]),
                          _truncated(d["communities"], d["sensors"]))


@dataclass(frozen=True)
class ReportType:
    key: str
    label: str
    description: str
    collect: Callable[[Apis, dict], Awaitable[dict]]
    build: Callable[[dict, dict, BuildContext], ReportDocument]
    slug: str


REPORT_TYPES = {t.key: t for t in [
    ReportType("COMMUNITIES", "Comunidades", "Comunidades, ubicación, estado y cantidad de sensores (RF-REP-01)", collect_communities, build_communities, "reporte-comunidades"),
    ReportType("SENSORS", "Sensores", "Inventario de sensores por tipo y comunidad (RF-REP-02)", collect_sensors, build_sensors, "reporte-sensores"),
    ReportType("READINGS", "Lecturas", "Lecturas por sensor, comunidad, rango de fechas y tipo (RF-REP-03)", collect_readings, build_readings, "reporte-lecturas"),
    ReportType("ALERTS", "Alertas", "Alertas generadas con valor, umbral y estado (RF-REP-04)", collect_alerts, build_alerts, "reporte-alertas"),
    ReportType("EVENT_HISTORY", "Historial de eventos", "Registro de fenómenos climáticos (RF-REP-05)", collect_event_history, build_event_history, "historial-eventos"),
    ReportType("SENSOR_STATUS", "Estado de sensores", "Activos, inactivos y sin comunicación (RF-REP-06)", collect_sensor_status, build_sensor_status, "estado-sensores"),
    ReportType("CLIMATE_STATS", "Estadísticas climáticas", "Promedios, mínimos, máximos y acumulados (RF-REP-07)", collect_climate_stats, build_climate_stats, "estadisticas-climaticas"),
    ReportType("EXECUTIVE", "Ejecutivo", "Situación global e indicadores consolidados (RF-REP-08)", collect_executive, build_executive, "reporte-ejecutivo"),
]}
LEGACY_ALIASES = {"communities": "COMMUNITIES", "sensors": "SENSORS", "alerts": "ALERTS", "readings": "READINGS"}


def resolve_type(name: str) -> Optional[ReportType]:
    return REPORT_TYPES.get(LEGACY_ALIASES.get(name.lower(), name.upper()))
