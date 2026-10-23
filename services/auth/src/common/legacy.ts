/** Formas de la API de la Fase 2 (UsuarioResultDto / LoginResultDto) para no romper el Angular. */
export interface UserLike {
  id: number; username: string; fullName: string; active: boolean; roleId: number;
  lastAccess: Date | null; createdBy: number | null; createdAt: Date; updatedBy: number | null; updatedAt: Date | null;
}
export function toUsuarioDto(u: UserLike) {
  return {
    usuarioId: u.id, nombreCompleto: u.fullName, nombreUsuario: u.username,
    ultimoAcceso: u.lastAccess?.toISOString() ?? null, activo: u.active, rolId: u.roleId,
    usuarioIng: u.createdBy ?? 0, fechaIng: u.createdAt.toISOString(),
    usuarioAct: u.updatedBy, fechaAct: u.updatedAt?.toISOString() ?? null,
  };
}
export const DEFAULT_ROLES: { id: number; name: string; permissions: string[] }[] = [
  { id: 1, name: 'Administrador', permissions: ['dashboard.view', 'reports.generate', 'reports.download', 'reports.history', 'audit.read', 'audit.write', 'users.manage'] },
  { id: 2, name: 'Operador', permissions: ['dashboard.view', 'audit.write'] },
  { id: 3, name: 'Consulta', permissions: ['dashboard.view', 'audit.write'] },
];
