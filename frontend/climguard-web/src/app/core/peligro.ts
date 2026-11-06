/* ============================================================
   Condición de peligro de una lectura — MISMA semántica que el backend
   (services/alert/.../RuleEvaluator.java).

   Una regla se cumple cuando   valor >= valorMin  &&  valor <= valorMax
   (intervalo CERRADO: los extremos activan la regla). min/max NO son el
   rango normal: son la zona de peligro.

   - Solo cuentan las reglas activas.
   - TRANSICIÓN: una regla con requiereRevision = true es LEGADA (semántica anterior: min/max = rango
     normal, alerta FUERA de [min,max]). Se evalúa con su semántica original, igual que el backend, y nunca con la nueva.
   - Con varias reglas coincidentes gana el NIVEL más alto; a igual nivel, el menor id.
   - Sin reglas para el tipo de sensor, o con el valor fuera de todos los
     intervalos, NO hay condición de peligro (null).
   - El cooldown NO interviene aquí: solo decide si el backend CREA otra alerta.
     La condición de peligro sigue existiendo mientras el valor esté en el intervalo.

   Las reglas se leen del servidor (GET /api/rules), así que backend y pantalla
   usan la misma fuente de datos. peligro.spec.ts comparte vectores de prueba con
   RuleEvaluatorSelfTest.java.
   ============================================================ */

export interface ReglaPeligro {
  reglaAlertaId: number;
  tipoSensorId: number;
  valorMin: number;
  valorMax: number;
  nivelAlertaId: number;
  activo: boolean;
  /** true = regla LEGADA (semántica anterior, alerta fuera de [min,max]) aún no convertida; el backend la evalúa así. */
  requiereRevision?: boolean;
}

/** ¿La regla participa en la evaluación? (solo si está activa; las legadas también, con su semántica) */
export function reglaEvaluable(r: ReglaPeligro): boolean {
  return r.activo;
}

/** ¿El valor está dentro del intervalo cerrado [min, max] de la regla? */
export function enIntervalo(r: ReglaPeligro, valor: number): boolean {
  return valor >= r.valorMin && valor <= r.valorMax;
}

/** ¿La regla se cumple? Nueva: dentro de [min,max]. Legada: FUERA de [min,max]. */
export function cumpleRegla(r: ReglaPeligro, valor: number): boolean {
  return r.requiereRevision ? (valor < r.valorMin || valor > r.valorMax) : enIntervalo(r, valor);
}

/** Regla ganadora para la lectura, o null si no hay condición de peligro. */
export function evaluarPeligro(reglas: readonly ReglaPeligro[], tipoSensorId: number, valor: number): ReglaPeligro | null {
  if (!Number.isFinite(valor)) return null;
  let mejor: ReglaPeligro | null = null;
  for (const r of reglas) {
    if (!reglaEvaluable(r) || r.tipoSensorId !== tipoSensorId || !cumpleRegla(r, valor)) continue;
    if (mejor === null || r.nivelAlertaId > mejor.nivelAlertaId
        || (r.nivelAlertaId === mejor.nivelAlertaId && r.reglaAlertaId < mejor.reglaAlertaId)) {
      mejor = r;
    }
  }
  return mejor;
}
