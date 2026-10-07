// Copia EXACTA de ReglaAlertaDomain del backend (lo que devuelve GET /api/ReglaAlerta
// y lo que espera PUT /api/ReglaAlerta/{id}). Si un nombre no coincide, el dato llega
// pero se muestra vacío — por eso respetamos los nombres tal cual.
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
}
