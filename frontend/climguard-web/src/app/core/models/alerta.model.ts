export interface Alerta {

  alertaId: number;

  comunidadId: number;

  sensorId: number;

  tipoFenomenoId: number;

  nivelAlertaId: number;

  mensaje: string;

  fechaHora: string;

  activa: boolean;

  fechaResolucion?: string | null;

}