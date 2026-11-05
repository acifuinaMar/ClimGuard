/** Lo que el sistema recuerda de quien inició sesión. */
export interface Sesion {
  usuarioId: number;
  nombreUsuario: string;
  nombreMostrado: string;
  rol: string;

  /** El token JWT que la API exige en cada llamada. */
  token: string;
}

/** Lo que el usuario escribe en el formulario. */
export interface CredencialesLogin {
  nombreUsuario: string;
  password: string;
}

/**
 * Forma EXACTA de lo que devuelve POST /api/login.
 * Verificada contra el backend real (LoginResultDto):
 *   { usuarioID, usuario, token, mensaje }
 */
export interface RespuestaLogin {

  usuarioId: number;

  usuario: string;

  token: string;

  mensaje: string;

  /** Solo en el canje OAuth: nombre completo para mostrar (el login local no lo envía). */
  nombreCompleto?: string;

}

/** Proveedor de inicio de sesión externo habilitado en el servidor (Google, GitHub…). */
export interface ProveedorOAuth {
  id: string;
  label: string;
}
