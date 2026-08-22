import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Portero de las rutas privadas.
 *
 * Angular lo llama ANTES de construir la pantalla. Si devuelve true, entra;
 * si devuelve un UrlTree, redirige ahí.
 *
 * ⚠️ IMPORTANTE PARA LA DEFENSA:
 * Esto NO es seguridad. Es comodidad para el usuario: evita que vea
 * pantallas vacías si no ha entrado. Cualquiera puede saltárselo editando
 * el JavaScript en su propio navegador.
 *
 * La seguridad REAL vive en el servidor: cada endpoint debe exigir el token
 * y comprobar el rol por su cuenta. Si la API confía en esta guarda, el
 * sistema está abierto de par en par.
 */
export const authGuard: CanActivateFn = (_ruta, estado) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) return true;

  // Recordamos a dónde quería ir, para llevarlo ahí después de entrar.
  return router.createUrlTree(['/login'], {
    queryParams: { destino: estado.url }
  });
};

/**
 * Variante que además exige el rol de administrador.
 * Se usa en pantallas como la bitácora, que solo el administrador consulta
 * (regla RN-019 de la documentación del equipo).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esAdministrador()) return true;
  return router.createUrlTree(['/panel']);
};
