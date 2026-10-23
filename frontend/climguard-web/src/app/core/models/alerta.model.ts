// Copia EXACTA de AlertaResultDto del backend (GET /api/Alerta).
//
// Los campos terminados en "...Snap" son una FOTO del momento en que se generó
// la alerta (nivel, fenómeno y mensaje tal como estaban en la regla). Así el
// historial no cambia aunque después se edite la regla.
export interface Alerta {
  alertaId: number;
  valorDetectado: number;
  mensajeSnap: string;
  nivelAlertaIdSnap: number;
  tipoFenomenoIdSnap: number;
  fechaHora: string;
  activo: boolean;
  sensorId: number;
  comunidadId: number;
  reglaAlertaId: number;
  estadoAlertaId: number;
  usuarioResponsableId?: number | null;

  // Auditoría que maneja el backend.
  usuarioIng?: number;
  fechaIng?: string;
  usuarioAct?: number | null;
  fechaAct?: string | null;
}
