// Catálogos de solo lectura que alimentan los desplegables (reglas de alerta, etc.).

/** Nivel de peligro (GET /api/NivelAlerta). Trae su color real para pintarlo. */
export interface NivelAlertaCat {
  nivelAlertaId: number;
  nombre: string;
  colorHex: string;
  activo: boolean;
}

/** Tipo de fenómeno (GET /api/TipoFenomeno). */
export interface TipoFenomenoCat {
  tipoFenomenoId: number;
  nombre: string;
  activo: boolean;
}

/** Tipo de sensor. Aún no tiene endpoint en el backend; se usa una lista local. */
export interface TipoSensorCat {
  tipoSensorId: number;
  nombre: string;
}
