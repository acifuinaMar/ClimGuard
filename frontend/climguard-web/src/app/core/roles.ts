/* ============================================================
   SISTEMA DE ROLES Y PERMISOS — el cerebro de la autorización
   ------------------------------------------------------------
   Idea central (y lo que se defiende ante el inge):

   En vez de preguntar "¿es administrador?" repartido por toda la app,
   trabajamos con PERMISOS. Cada rol tiene una lista de permisos, y la
   interfaz pregunta por el permiso, no por el rol.

   Además separamos DOS cosas distintas:
     - VER un recurso (solo lectura).
     - GESTIONAR un recurso (crear / editar / borrar).
   Así, el "Usuario de consulta" puede VER los listados pero no tiene ni un
   botón para modificar nada. Es el principio de MÍNIMO PRIVILEGIO.

   Ventaja — análisis lógico:
     - El "quién puede qué" vive en UN SOLO lugar (este archivo).
     - Si mañana el Operador puede hacer algo nuevo, se cambia una línea
       aquí y toda la app se entera. No hay que buscar "if admin" por todos
       lados.
     - Es el patrón RBAC (Role-Based Access Control) que usan los sistemas
       reales.

   ⚠️ Recordatorio: esto es comodidad visual, NO seguridad. La seguridad real
   la impone la API, que rechaza con 403 si el rol no tiene permiso.
   ============================================================ */

/** Los tres roles que exige la Fase 2 (RF-ADM-06). */
export type Rol = 'Administrador' | 'Operador' | 'Consulta';

/**
 * Las acciones que se pueden hacer en el sistema.
 * Nombradas por "recurso.acción" para que se lean solas.
 */
export type Permiso =
  | 'usuarios.gestionar'      // crear/editar/activar usuarios
  | 'comunidades.ver'         // ver el listado de comunidades (solo lectura)
  | 'comunidades.gestionar'   // crear/editar/borrar comunidades
  | 'sensores.ver'            // ver el listado de sensores (solo lectura)
  | 'sensores.gestionar'      // crear/editar/activar sensores
  | 'reglas.ver'              // ver las reglas de alerta (solo lectura)
  | 'reglas.gestionar'        // crear/editar/activar reglas de alerta
  | 'alertas.atender'         // atender/cerrar alertas
  | 'bitacora.ver'            // consultar la bitácora de auditoría
  | 'dashboard.ver'           // ver el panel
  | 'catalogos.ver';          // ver catálogos (tipos de fenómeno, niveles…)

/**
 * EL MAPA: qué permisos tiene cada rol.
 *
 *  - Administrador: todo. Es el ÚNICO que crea/edita/borra sensores,
 *    comunidades y reglas (así lo exige el backend — mínimo privilegio).
 *  - Operador: VE sensores, comunidades y reglas, y atiende alertas.
 *  - Consulta: SOLO VE (sensores, comunidades, reglas, panel). No toca nada.
 *
 * No hace falta listar el permiso ".ver" de un recurso que el rol ya puede
 * ".gestionar": la función de abajo entiende que "gestionar implica ver".
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
    'sensores.ver',
    'comunidades.ver',
    'reglas.ver',
    'alertas.atender',
    'dashboard.ver',
    'catalogos.ver'
  ],
  Consulta: [
    'dashboard.ver',
    'sensores.ver',
    'comunidades.ver',
    'reglas.ver',
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

/**
 * ¿El rol tiene este permiso?
 *
 * Regla lógica: quien puede GESTIONAR un recurso, también puede VERLO. Así no
 * repetimos "sensores.ver" para un rol que ya tiene "sensores.gestionar".
 */
export function rolTienePermiso(rol: Rol, permiso: Permiso): boolean {
  const permisos = PERMISOS_POR_ROL[rol];
  if (permisos.includes(permiso)) return true;

  if (permiso.endsWith('.ver')) {
    const gestionar = permiso.replace('.ver', '.gestionar') as Permiso;
    return permisos.includes(gestionar);
  }
  return false;
}

/** Etiqueta bonita para mostrar en pantalla. */
export function etiquetaRol(rol: Rol): string {
  return rol === 'Consulta' ? 'Usuario de consulta' : rol;
}
