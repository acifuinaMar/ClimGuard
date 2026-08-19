/** Lo que el sistema recuerda de quien inició sesión. */
export interface Sesion {
  usuarioId: number;
  nombreUsuario: string;
  nombreMostrado: string;
  rol: string;

  /**
   * El token que la API pedirá en cada llamada.
   *
   * Hoy está vacío porque el backend todavía no publica el endpoint de
   * inicio de sesión. El campo ya existe para que, cuando llegue, no haya
   * que cambiar nada más que la forma de obtenerlo.
   */
  token: string;
}

/** Lo que el usuario escribe en el formulario. */
export interface CredencialesLogin {
  nombreUsuario: string;
  password: string;
}
