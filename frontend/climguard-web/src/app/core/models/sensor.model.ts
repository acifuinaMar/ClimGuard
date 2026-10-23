// Copia del SensorResultDto del backend (GET /api/Sensor).
//
// OJO (cambios de Fase 2): el sensor ahora tiene `codigo`, `ubicacion` y
// `descripcion` (obligatorios al crear), `fechaUltimaConexion`, y el estado se
// maneja por catálogo con `estadoSensorId` (ya NO existe un booleano `activo`
// en el backend). Los campos `activo` y `ultimaActualizacion` de abajo los
// DERIVA el frontend al leer, para no reescribir todo el panel.
export interface Sensor {
  sensorId: number;
  nombre: string;
  codigo: string;
  ubicacion: string;
  descripcion: string;
  fechaInstalacion: string;
  fechaUltimaConexion: string;
  valorActual: number;
  comunidadId: number;
  tipoSensorId: number;
  estadoSensorId: number;

  // Auditoría del backend.
  usuarioIng?: number;
  fechaIng?: string;
  usuarioAct?: number | null;
  fechaAct?: string | null;

  // Derivados en el front (no vienen del backend):
  /** true si estadoSensorId === Activo. */
  activo?: boolean;
  /** Alias de fechaUltimaConexion, para el panel. */
  ultimaActualizacion?: string;
}

/** Catálogo EstadoSensor (según el seed del backend, QueryMain_P2.sql). */
export const ESTADOS_SENSOR = [
  { estadoSensorId: 1, nombre: 'Activo' },
  { estadoSensorId: 2, nombre: 'Inactivo' },
  { estadoSensorId: 3, nombre: 'Mantenimiento' },
  { estadoSensorId: 4, nombre: 'Fuera de línea' }
];

export const ESTADO_SENSOR_ACTIVO = 1;
export const ESTADO_SENSOR_INACTIVO = 2;
