/* Forma de un usuario, verificada llamando a la API real.
 *
 * ⚠️ DECISIÓN DE SEGURIDAD, deliberada:
 *
 * La API hoy devuelve además un campo "passwordHash". Ese campo
 * NO está declarado aquí, y es a propósito.
 *
 * Al no existir en la interfaz, TypeScript impide que cualquier pantalla
 * lo muestre por accidente: si alguien escribe {{ usuario.passwordHash }}
 * el proyecto deja de compilar.
 *
 * Esto NO arregla el problema de fondo — la API no debería enviarlo, y eso
 * lo tiene que corregir el backend — pero evita que se filtre a la interfaz.
 * Se llama defensa en profundidad: cada capa se protege por su cuenta.
 */
export interface Usuario {
  usuarioId: number;
  nombre1: string;
  nombre2: string;
  apellido1: string;
  apellido2: string;
  nombreUsuario: string;
  rol: string;
  activo: boolean;
  fechaRegistro: string;
}
