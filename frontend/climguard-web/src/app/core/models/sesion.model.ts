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

}
