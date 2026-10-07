/* Forma de un usuario, alineada con UsuarioResultDto del backend de Fase 2.
 *
 * OJO (cambios de Fase 2): el backend ahora devuelve `nombreCompleto` (un solo
 * campo, ya no nombre1/nombre2/apellido1/apellido2) y `rolId` (número, no el
 * texto del rol). También `ultimoAcceso` en vez de fechaRegistro.
 *
 * Nota de seguridad: NO declaramos ningún campo de contraseña aquí. Si el
 * backend algún día devolviera un hash, al no existir en esta interfaz,
 * TypeScript impide mostrarlo por accidente (defensa en profundidad).
 */
export interface Usuario {
  usuarioId: number;
  nombreCompleto: string;
  nombreUsuario: string;
  ultimoAcceso: string | null;
  activo: boolean;
  rolId: number;

  // Auditoría del backend.
  usuarioIng?: number;
  fechaIng?: string;
  usuarioAct?: number | null;
  fechaAct?: string | null;
}

/** Catálogo de roles (seed del backend): 1 Administrador, 2 Operador, 3 Consulta. */
export const ROLES = [
  { rolId: 1, nombre: 'Administrador' },
  { rolId: 2, nombre: 'Operador' },
  { rolId: 3, nombre: 'Consulta' }
];
