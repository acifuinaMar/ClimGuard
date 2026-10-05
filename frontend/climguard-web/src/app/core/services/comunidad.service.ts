import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comunidad } from '../models/comunidad.model';
import { AuthService } from './auth.service';

/**
 * Todo el trato con /api/Comunidad vive aquí.
 * Mismo patrón que SensorService: los componentes le piden a este servicio,
 * nunca llaman a la API por su cuenta.
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
   * El backend exige saber QUIÉN crea, para registrarlo en la bitácora.
   * Si no se le manda `usuarioLogeado`, revienta con error 500 porque intenta
   * anotar "creado por usuario 0", y el usuario 0 no existe.
   */
  crear(comunidad: Comunidad): Observable<Comunidad> {
    return this.http.post<Comunidad>(this.base, {
      ...comunidad,
      usuarioLogeado: this.usuario
    });
  }

  /**
   * PUT /api/Comunidad — SIN id en la dirección.
   * El backend (validación de Mahuerk) ahora lee el id DENTRO del body, en
   * `comunidadId`, y exige que sea distinto de 0. Por eso lo fijamos aquí
   * de forma explícita, aunque también venga en `comunidad`.
   */
  actualizar(id: number, comunidad: Comunidad): Observable<Comunidad> {
    return this.http.put<Comunidad>(this.base, {
      ...comunidad,
      comunidadId: id,
      usuarioLogeado: this.usuario
    });
  }

  /**
   * El backend pide el id del usuario que borra, como parámetro de consulta,
   * para registrarlo en la bitácora (quién eliminó qué).
   * Endpoint real: DELETE /api/Comunidad/{id}?usuarioLogeado={idUsuario}
   */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?usuarioLogeado=${this.usuario}`);
  }
}
