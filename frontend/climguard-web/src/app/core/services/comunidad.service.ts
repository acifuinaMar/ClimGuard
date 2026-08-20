import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comunidad } from '../models/comunidad.model';

/**
 * Todo el trato con /api/Comunidad vive aquí.
 * Mismo patrón que SensorService: los componentes le piden a este servicio,
 * nunca llaman a la API por su cuenta.
 */
@Injectable({ providedIn: 'root' })
export class ComunidadService {
  private http = inject(HttpClient);

  private get base(): string { return `${environment.apiUrl}/Comunidad`; }
  private get suf(): string { return environment.sufijoArchivo; }

  listar(): Observable<Comunidad[]> {
    return this.http.get<Comunidad[]>(`${this.base}${this.suf}`);
  }

  obtener(id: number): Observable<Comunidad> {
    return this.http.get<Comunidad>(`${this.base}/${id}${this.suf}`);
  }

  crear(comunidad: Comunidad): Observable<Comunidad> {
    return this.http.post<Comunidad>(this.base, comunidad);
  }

  actualizar(id: number, comunidad: Comunidad): Observable<Comunidad> {
    return this.http.put<Comunidad>(`${this.base}/${id}`, comunidad);
  }

  /**
   * El backend pide el id del usuario que borra, como parámetro de consulta,
   * para registrarlo en la bitácora (quién eliminó qué).
   * Endpoint real: DELETE /api/Comunidad/{id}?usuarioLogeado={idUsuario}
   */
  eliminar(id: number, usuarioLogeado: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?usuarioLogeado=${usuarioLogeado}`);
  }
}
