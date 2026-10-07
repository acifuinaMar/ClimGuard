/**
 * Un registro de la bitácora, alineado con BitacoraResultDto del backend de Fase 2.
 *   { bitacoraId, nombreEntidad, entidadId, accion, descripcion, fechaHora, usuarioId }
 * (Antes el front usaba `fechaRegistro`; ahora es `fechaHora`, y hay campos nuevos:
 *  nombreEntidad, entidadId y descripcion.)
 */
export interface Bitacora {
  bitacoraId: number;
  nombreEntidad: string;
  entidadId: number;
  accion: string;
  descripcion: string;
  fechaHora: string;
  usuarioId: number;
}
