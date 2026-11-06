// Copia EXACTA de ReglaAlertaDomain del backend (lo que devuelve GET /api/ReglaAlerta
// y lo que espera PUT /api/ReglaAlerta/{id}). Si un nombre no coincide, el dato llega
// pero se muestra vacío — por eso respetamos los nombres tal cual.
// SEMÁNTICA: valorMin y valorMax delimitan el intervalo que ACTIVA la alerta (inclusivo: valor >= min && valor <= max).
export interface ReglaAlerta {
  reglaAlertaId: number;
  nombre: string;
  valorMin: number;
  valorMax: number;
  mensaje: string;
  activo: boolean;
  tipoSensorId: number;
  tipoFenomenoId: number;
  nivelAlertaId: number;

  /**
   * true = regla LEGADA: creada con la semántica anterior (min/max = rango NORMAL, alerta FUERA del rango).
   * El backend la sigue evaluando así hasta que un administrador la convierta de forma explícita. Solo lectura.
   */
  requiereRevision?: boolean;

  /** Solo cliente (no se envía en el cuerpo): el administrador confirmó convertir la regla legada a la semántica nueva. */
  convertirSemantica?: boolean;

  // Auditoría del backend (el front solo la conserva para reenviarla al editar).
  usuarioIng?: number;
  fechaIng?: string;
  usuarioAct?: number | null;
  fechaAct?: string | null;
}
