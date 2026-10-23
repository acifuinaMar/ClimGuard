// Copia EXACTA de TipoFenomenoResultDto del backend (GET /api/TipoFenomeno).
export interface TipoFenomeno {
  tipoFenomenoId: number;
  nombre: string;
  activo: boolean;

  // Auditoría que maneja el backend; el frontend solo la conserva al editar.
  usuarioIng?: number;
  fechaIng?: string;
  usuarioAct?: number | null;
  fechaAct?: string | null;
}
