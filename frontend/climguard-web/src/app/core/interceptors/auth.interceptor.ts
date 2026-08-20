import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * INTERCEPTOR: se mete en medio de TODAS las llamadas HTTP.
 *
 * Hace dos cosas, una a la ida y otra a la vuelta:
 *
 *   A LA IDA  → le pega el token a cada petición, para no tener que
 *               acordarse de ponerlo en cada servicio (principio DRY).
 *
 *   A LA VUELTA → si el servidor responde 401 (token vencido o inválido),
 *                 cierra la sesión y manda al login, en vez de dejar la
 *                 pantalla rota.
 *
 * Se registra una sola vez, en app.config.ts, y cubre toda la aplicación.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();

  // No le pegamos el token a la propia petición de login: todavía no hay.
  const esLogin = req.url.includes('/login');

  const peticion = (token && !esLogin)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = el servidor no aceptó el token. La sesión ya no sirve.
      if (error.status === 401 && !esLogin) {
        auth.cerrarSesion();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
