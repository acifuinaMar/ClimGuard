/**
 * Un registro de la bitácora: qué acción hizo un usuario y cuándo.
 * Forma verificada contra la API real:
 *   { bitacoraId, usuarioId, accion, fechaRegistro }
 */
export interface Bitacora {
  bitacoraId: number;
  usuarioId: number;
  accion: string;
  fechaRegistro: string;
}
