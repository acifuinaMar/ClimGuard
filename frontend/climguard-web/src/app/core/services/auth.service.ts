import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CredencialesLogin, RespuestaLogin, Sesion } from '../models/sesion.model';

const CLAVE_ALMACEN = 'climguard.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  /** La sesión actual. Al arrancar se intenta recuperar la guardada. */
  sesion = signal<Sesion | null>(this.recuperarSesion());

  /** Atajos que las pantallas y las guardas consultan. */
  autenticado = computed(() => this.sesion() !== null);
  esAdministrador = computed(() =>
    (this.sesion()?.rol ?? '').toLowerCase() === 'administrador'
  );

  /** El token, para que el interceptor lo pegue a cada petición. */
  token = computed(() => this.sesion()?.token ?? null);

  // ==========================================================
  //  INICIO DE SESIÓN — contra el backend REAL
  // ==========================================================

  iniciarSesion(cred: CredencialesLogin): Observable<Sesion> {
    // El backend espera { nombreUsuario, contraseña }  (con ñ).
    const cuerpo = {
      nombreUsuario: cred.nombreUsuario.trim(),
      'contraseña': cred.password
    };

    return this.http.post<RespuestaLogin>(`${environment.apiUrl}/login`, cuerpo).pipe(
      map(respuesta => {
        if (!respuesta.token) {
          // Login rechazado: el backend manda 200 con token vacío y un mensaje.
          throw new Error(respuesta.mensaje || 'Usuario o contraseña incorrectos.');
        }

        // El rol viene DENTRO del token (en los claims), no en la respuesta.
        const datos = this.leerToken(respuesta.token);

        const sesion: Sesion = {
          usuarioId: 0, // el backend no lo devuelve; no lo necesitamos para operar
          nombreUsuario: respuesta.usuario || cred.nombreUsuario,
          nombreMostrado: respuesta.usuario || cred.nombreUsuario,
          rol: datos.rol,
          token: respuesta.token
        };

        this.guardarSesion(sesion);
        return sesion;
      })
    );
  }

  cerrarSesion(): void {
    this.sesion.set(null);
    sessionStorage.removeItem(CLAVE_ALMACEN);
    this.router.navigate(['/login']);
  }

  // ==========================================================
  //  Interno
  // ==========================================================

  private guardarSesion(s: Sesion): void {
    this.sesion.set(s);
    sessionStorage.setItem(CLAVE_ALMACEN, JSON.stringify(s));
  }

  private recuperarSesion(): Sesion | null {
    try {
      const guardado = sessionStorage.getItem(CLAVE_ALMACEN);
      return guardado ? JSON.parse(guardado) as Sesion : null;
    } catch {
      return null;
    }
  }

  /**
   * Un token JWT tiene tres partes separadas por punto. La del medio guarda
   * los datos del usuario (los "claims"), codificados en base64. Aquí solo
   * los LEEMOS para saber el rol; la VALIDACIÓN de verdad la hace el servidor
   * con su firma. El navegador nunca debe confiar en esto para seguridad.
   */
  private leerToken(token: string): { rol: string; usuario: string } {
    try {
      const payload = token.split('.')[1];
      const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

      // Los claims de .NET usan URLs largas como nombre de campo.
      const rol = json['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
                ?? json['role'] ?? 'Usuario';
      const usuario = json['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
                    ?? json['nameid'] ?? '';

      return { rol, usuario };
    } catch {
      return { rol: 'Usuario', usuario: '' };
    }
  }
}
