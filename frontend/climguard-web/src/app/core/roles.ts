/* ============================================================
   SISTEMA DE ROLES Y PERMISOS — el cerebro de la autorización
   ------------------------------------------------------------
   Idea central (y lo que se defiende ante el inge):

   En vez de preguntar "¿es administrador?" repartido por toda la app,
   trabajamos con PERMISOS. Cada rol tiene una lista de permisos, y la
   interfaz pregunta por el permiso, no por el rol.

   Ventaja — análisis lógico:
     - El "quién puede qué" vive en UN SOLO lugar (este archivo).
     - Si mañana el Operador puede hacer algo nuevo, se cambia una línea
       aquí y toda la app se entera. No hay que buscar "if admin" por todos
       lados.
     - Es el patrón RBAC (Role-Based Access Control) que usan los sistemas
       reales.
   ============================================================ */

/** Los tres roles que exige la Fase 2 (RF-ADM-06). */
export type Rol = 'Administrador' | 'Operador' | 'Consulta';

/**
 * Las acciones que se pueden hacer en el sistema.
 * Nombradas por "recurso.acción" para que se lean solas.
 */
export type Permiso =
  | 'usuarios.gestionar'      // crear/editar/activar usuarios
  | 'comunidades.gestionar'   // crear/editar/activar comunidades
  | 'sensores.gestionar'      // crear/editar/activar sensores
  | 'reglas.gestionar'        // crear/editar reglas de alerta
  | 'alertas.atender'         // atender/cerrar alertas
  | 'bitacora.ver'            // consultar la bitácora de auditoría
  | 'dashboard.ver'           // ver el panel
  | 'catalogos.ver';          // ver listados (solo lectura)

/**
 * EL MAPA: qué permisos tiene cada rol.
 *
 * - Administrador: todo.
 * - Operador: opera sensores, reglas y alertas, pero NO gestiona usuarios.
 * - Consulta: solo mira.
 */
const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  Administrador: [
    'usuarios.gestionar',
    'comunidades.gestionar',
    'sensores.gestionar',
    'reglas.gestionar',
    'alertas.atender',
    'bitacora.ver',
    'dashboard.ver',
    'catalogos.ver'
  ],
  Operador: [
    'sensores.gestionar',
    'reglas.gestionar',
    'alertas.atender',
    'dashboard.ver',
    'catalogos.ver'
  ],
  Consulta: [
    'dashboard.ver',
    'catalogos.ver'
  ]
};

/**
 * Normaliza lo que venga del backend a uno de los tres roles.
 * El token puede traer "administrador", "Admin", "Usuario de consulta", etc.
 * Aquí lo convertimos a nuestro tipo limpio.
 */
export function normalizarRol(valor: string | null | undefined): Rol {
  const r = (valor ?? '').trim().toLowerCase();
  if (r.startsWith('admin')) return 'Administrador';
  if (r.startsWith('oper')) return 'Operador';
  // "consulta", "usuario de consulta", "usuario", etc. → el rol más restringido
  return 'Consulta';
}

/** ¿El rol tiene este permiso? */
export function rolTienePermiso(rol: Rol, permiso: Permiso): boolean {
  return PERMISOS_POR_ROL[rol].includes(permiso);
}

/** Etiqueta bonita para mostrar en pantalla. */
export function etiquetaRol(rol: Rol): string {
  return rol === 'Consulta' ? 'Usuario de consulta' : rol;
}
