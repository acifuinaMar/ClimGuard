import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comunidad } from '../models/comunidad.model';
import { AuthService } from './auth.service';

/**
 * Todo el trato con /api/Comunidad vive aquí.
 * Leer (GET) lo pueden hacer los tres roles; crear/editar/borrar solo el
 * Administrador (lo impone el backend). Por eso el frontend oculta esos botones
 * salvo al Administrador, pero el candado real es la API.
 */
@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get base(): string { return `${environment.apiUrl}/Comunidad`; }
  private get suf(): string { return environment.sufijoArchivo; }

  /** Id del usuario que hace la operación, para la bitácora del backend. */
  private get usuario(): number { return this.auth.sesion()?.usuarioId ?? 1; }

  listar(): Observable<Comunidad[]> {
    return this.http.get<Comunidad[]>(`${this.base}${this.suf}`);
  }

  obtener(id: number): Observable<Comunidad> {
    return this.http.get<Comunidad>(`${this.base}/${id}${this.suf}`);
  }

  /**
   * POST /api/Comunidad (solo Administrador). El backend registra quién crea
   * (usuarioIng / usuarioLogeado) para la bitácora.
   */
  crear(comunidad: Comunidad): Observable<Comunidad> {
    const ahora = new Date().toISOString();
    return this.http.post<Comunidad>(this.base, {
      comunidadId: 0,
      nombreComunidad: comunidad.nombreComunidad,
      descripcion: comunidad.descripcion,
      pais: comunidad.pais,
      departamento: comunidad.departamento,
      municipio: comunidad.municipio,
      latitud: comunidad.latitud,
      longitud: comunidad.longitud,
      activo: comunidad.activo,
      usuarioIng: this.usuario,
      fechaIng: ahora,
      usuarioAct: null,
      fechaAct: null,
      usuarioLogeado: this.usuario
    });
  }

  /**
   * PUT /api/Comunidad (solo Administrador). SIN id en la dirección: el id viaja
   * en el cuerpo (comunidadId). Se conservan usuarioIng/fechaIng originales y se
   * marca la modificación con usuarioAct/fechaAct.
   */
  actualizar(comunidad: Comunidad): Observable<Comunidad> {
    const ahora = new Date().toISOString();
    return this.http.put<Comunidad>(this.base, {
      comunidadId: comunidad.comunidadId,
      nombreComunidad: comunidad.nombreComunidad,
      descripcion: comunidad.descripcion,
      pais: comunidad.pais,
      departamento: comunidad.departamento,
      municipio: comunidad.municipio,
      latitud: comunidad.latitud,
      longitud: comunidad.longitud,
      activo: comunidad.activo,
      usuarioIng: comunidad.usuarioIng ?? this.usuario,
      fechaIng: comunidad.fechaIng ?? ahora,
      usuarioAct: this.usuario,
      fechaAct: ahora,
      usuarioLogeado: this.usuario
    });
  }

  /**
   * DELETE /api/Comunidad/{id}?usuarioLogeado={id} (solo Administrador).
   * El backend pide quién borra, como parámetro de consulta, para la bitácora.
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?usuarioLogeado=${this.usuario}`);
  }
}
