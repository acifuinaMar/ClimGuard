import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, switchMap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CredencialesLogin, ProveedorOAuth, RespuestaLogin, Sesion } from '../models/sesion.model';
import { Usuario } from '../models/usuario.model';
import { Rol, Permiso, normalizarRol, rolTienePermiso, etiquetaRol } from '../roles';

const CLAVE_ALMACEN = 'climguard.sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  /** La sesión actual. Al arrancar se intenta recuperar la guardada. */
  sesion = signal<Sesion | null>(this.recuperarSesion());

  /** Atajos que las pantallas y las guardas consultan. */
  autenticado = computed(() => this.sesion() !== null);

  /** El rol actual, ya normalizado a uno de los tres (Administrador/Operador/Consulta). */
  rol = computed<Rol>(() => normalizarRol(this.sesion()?.rol));

  /** Etiqueta para mostrar (ej: "Usuario de consulta"). */
  rolEtiqueta = computed(() => etiquetaRol(this.rol()));

  /** Atajos por rol. */
  esAdministrador = computed(() => this.rol() === 'Administrador');
  esOperador      = computed(() => this.rol() === 'Operador');
  esConsulta      = computed(() => this.rol() === 'Consulta');

  /**
   * LA PREGUNTA CLAVE que usa toda la app: "¿el usuario puede hacer esto?"
   * En vez de preguntar por el rol, se pregunta por el permiso. El mapa de
   * quién puede qué vive en core/roles.ts, en un solo lugar.
   */
  puede(permiso: Permiso): boolean {
    return rolTienePermiso(this.rol(), permiso);
  }

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

    return this.http.post<RespuestaLogin>(`${environment.apiUrl}/auth/login`, cuerpo).pipe(
      switchMap(respuesta => {
        if (!respuesta.token) {
          // Login rechazado: el backend manda 200 con token vacío y un mensaje.
          throw new Error(respuesta.mensaje || 'Usuario o contraseña incorrectos.');
        }

        // El rol y el nombre vienen DENTRO del token (en los claims).
        const datos = this.leerToken(respuesta.token);
        const nombre = respuesta.usuario || datos.usuario || cred.nombreUsuario;

        // El backend NO devuelve el id numérico del usuario, y el token solo
        // trae el nombre. Pero las operaciones (crear sensor, borrar comunidad)
        // necesitan ese id para la bitácora: si mandan 0, el servidor da error
        // porque el usuario 0 no existe.
        // Por eso lo buscamos en /api/Usuario cruzando por el nombre.
        // Fase 3: Auth Service ya devuelve el id; la búsqueda solo queda como respaldo.
        const id$ = respuesta.usuarioId > 0 ? of(respuesta.usuarioId) : this.buscarIdUsuario(nombre, respuesta.token);
        return id$.pipe(
          map(usuarioId => {
            const sesion: Sesion = {
              usuarioId,
              nombreUsuario: nombre,
              nombreMostrado: nombre,
              rol: datos.rol,
              token: respuesta.token
            };
            this.guardarSesion(sesion);
            return sesion;
          })
        );
      })
    );
  }

  // ==========================================================
  //  INICIO DE SESIÓN EXTERNO (Google / GitHub) — Fase 4
  //  El navegador NUNCA ve secretos de OAuth ni recibe el JWT por la URL:
  //  el servidor redirige a /auth/callback#code=… (código de un solo uso)
  //  y aquí se canjea por POST, con la cookie httpOnly del flujo.
  // ==========================================================

  /** Proveedores habilitados en el servidor. Si falla o no hay ninguno, el login local sigue igual. */
  proveedoresOAuth(): Observable<ProveedorOAuth[]> {
    return this.http.get<{ providers: ProveedorOAuth[] }>(`${environment.apiUrl}/auth/oauth/providers`).pipe(
      map(r => r?.providers ?? []),
      catchError(() => of([] as ProveedorOAuth[]))
    );
  }

  /** Navegación completa hacia el servidor, que redirige al proveedor (no es una llamada AJAX). */
  iniciarOAuth(proveedor: string): void {
    window.location.assign(`${environment.apiUrl}/auth/oauth/${encodeURIComponent(proveedor)}/start`);
  }

  /** Canjea el código temporal por la sesión de ClimGuard (mismo JWT y roles que el login local). */
  canjearCodigoOAuth(code: string): Observable<Sesion> {
    return this.http.post<RespuestaLogin>(`${environment.apiUrl}/auth/oauth/exchange`, { code }, { withCredentials: true }).pipe(
      map(r => {
        if (!r.token) throw new Error(r.mensaje || 'No se pudo completar el inicio de sesión.');
        const datos = this.leerToken(r.token);
        const sesion: Sesion = {
          usuarioId: r.usuarioId, nombreUsuario: r.usuario,
          nombreMostrado: r.nombreCompleto || r.usuario, rol: datos.rol, token: r.token
        };
        this.guardarSesion(sesion);
        return sesion;
      })
    );
  }

  /** Vincula Google/GitHub a la cuenta con la sesión actual (el servidor exige el Bearer). */
  vincularOAuth(proveedor: string): Observable<void> {
    return this.http.post<{ authorizationUrl: string }>(
      `${environment.apiUrl}/auth/oauth/${encodeURIComponent(proveedor)}/link`, {}, { withCredentials: true }
    ).pipe(map(r => {
      if (!r.authorizationUrl?.startsWith('https://')) throw new Error('Respuesta inesperada del servidor.');
      window.location.assign(r.authorizationUrl);
    }));
  }

  /**
   * Busca el id numérico del usuario a partir de su nombre de usuario.
   * Si no lo encuentra (o la llamada falla), devuelve 1 como respaldo, que es
   * un usuario que siempre existe, para no bloquear las operaciones.
   */
  private buscarIdUsuario(nombreUsuario: string, token: string): Observable<number> {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/Usuario`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      map(usuarios => {
        const objetivo = nombreUsuario.trim().toLowerCase();
        const hallado = usuarios.find(u => u.nombreUsuario.trim().toLowerCase() === objetivo);
        return hallado?.usuarioId ?? 1;
      }),
      catchError(() => of(1))
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
