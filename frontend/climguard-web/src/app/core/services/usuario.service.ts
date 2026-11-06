import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, GuardarUsuario } from '../models/usuario.model';
import { AuthService } from './auth.service';

/**
 * Todo el trato con el endpoint /api/Usuario vive aquí.
 * Crear/editar/borrar es solo del Administrador (lo impone el backend).
 * La contraseña viaja EN CLARO y el backend la encripta (SHA256).
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get base(): string { return `${environment.apiUrl}/Usuario`; }
  private get suf(): string { return environment.sufijoArchivo; }
  private get usuario(): number { return this.auth.sesion()?.usuarioId ?? 1; }

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.base}${this.suf}`);
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}${this.suf}`);
  }

  /** POST /api/Usuario (solo Administrador). */
  crear(g: GuardarUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, {
      nombreCompleto: g.nombreCompleto,
      nombreUsuario: g.nombreUsuario,
      passwordHash: g.password,   // el backend la encripta
      activo: g.activo,
      rolId: g.rolId,
      usuarioLogeado: this.usuario
    });
  }

  /**
   * PUT /api/Usuario/{id} (solo Administrador). El id va en la ruta Y en el cuerpo.
   * OJO: el backend re-encripta la contraseña SIEMPRE, así que al editar se debe
   * volver a escribir (no hay forma de "conservar la anterior" con este endpoint).
   */
  actualizar(g: GuardarUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${g.usuarioId}`, {
      usuarioId: g.usuarioId,
      nombreCompleto: g.nombreCompleto,
      nombreUsuario: g.nombreUsuario,
      passwordHash: g.password,
      activo: g.activo,
      rolId: g.rolId,
      usuarioLogeado: this.usuario
    });
  }

  /** DELETE /api/Usuario/{id}?usuarioLogeado={id} (solo Administrador). */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?usuarioLogeado=${this.usuario}`);
  }
}
