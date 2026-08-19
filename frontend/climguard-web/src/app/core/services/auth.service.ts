import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CredencialesLogin, Sesion } from '../models/sesion.model';

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

  // ==========================================================
  //  INICIO DE SESIÓN
  // ==========================================================

  iniciarSesion(cred: CredencialesLogin): Observable<Sesion> {
    // ⚠️ TEMPORAL — ver la nota al final del archivo.
    return this.validacionProvisional(cred);

    /* CUANDO EL BACKEND PUBLIQUE EL ENDPOINT, esto se reemplaza por:
     *
     * return this.http.post<Sesion>(`${environment.apiUrl}/Auth/login`, cred)
     *          .pipe(tap(s => this.guardarSesion(s)));
     *
     * El resto de la aplicación no cambia ni una línea: las pantallas, las
     * guardas y el menú siguen preguntándole a este mismo servicio.
     */
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

  /* ============================================================
     ⚠️ VALIDACIÓN PROVISIONAL — BORRAR CUANDO EXISTA EL BACKEND
     ------------------------------------------------------------
     El backend todavía no publica POST /api/Auth/login (devuelve 404),
     así que esta lista permite navegar y presentar el sistema mientras
     tanto. NO es seguridad: cualquiera que abra el código la ve.

     ¿Por qué NO se valida contra GET /api/Usuario?
     Porque ese endpoint devuelve el campo passwordHash de todos los
     usuarios. Compararlo aquí obligaría al navegador a descargarse las
     contraseñas de todo el mundo para dejar entrar a uno. La verificación
     de credenciales SIEMPRE ocurre en el servidor: el navegador manda
     usuario y contraseña, y recibe un token o un rechazo. Nunca al revés.
     ============================================================ */
  private validacionProvisional(cred: CredencialesLogin): Observable<Sesion> {
    const demo = [
      { nombreUsuario: 'admin',    password: 'admin123',    rol: 'Administrador', nombre: 'Administrador del sistema', id: 1 },
      { nombreUsuario: 'operador', password: 'operador123', rol: 'Operador',      nombre: 'Operador de monitoreo',     id: 2 }
    ];

    const hallado = demo.find(
      d => d.nombreUsuario === cred.nombreUsuario.trim().toLowerCase() &&
           d.password === cred.password
    );

    if (!hallado) {
      // Mensaje genérico a propósito: no se revela si falló el usuario o
      // la contraseña, para no ayudar a quien esté probando combinaciones.
      return throwError(() => new Error('Usuario o contraseña incorrectos.')).pipe(delay(500));
    }

    const sesion: Sesion = {
      usuarioId: hallado.id,
      nombreUsuario: hallado.nombreUsuario,
      nombreMostrado: hallado.nombre,
      rol: hallado.rol,
      token: ''
    };

    this.guardarSesion(sesion);
    // El retraso simula el viaje a la red, para que se vea el estado "Entrando…".
    return of(sesion).pipe(delay(500));
  }
}
