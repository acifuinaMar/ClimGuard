import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TipoFenomeno } from '../models/tipo-fenomeno.model';
import { AuthService } from './auth.service';

/**
 * Trato con /api/TipoFenomeno (catálogo). Leer, crear, editar y borrar lo pueden
 * hacer Operador y Administrador (lo impone el backend). El PUT NO lleva id en la
 * dirección: el id va en el cuerpo.
 */
@Injectable({ providedIn: 'root' })
export class TipoFenomenoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get base(): string { return `${environment.apiUrl}/TipoFenomeno`; }
  private get usuario(): number { return this.auth.sesion()?.usuarioId ?? 1; }

  listar(): Observable<TipoFenomeno[]> {
    return this.http.get<TipoFenomeno[]>(this.base);
  }

  crear(tf: TipoFenomeno): Observable<TipoFenomeno> {
    const ahora = new Date().toISOString();
    return this.http.post<TipoFenomeno>(this.base, {
      tipoFenomenoId: 0,
      nombre: tf.nombre,
      activo: tf.activo,
      usuarioIng: this.usuario,
      fechaIng: ahora,
      usuarioAct: this.usuario,
      fechaAct: ahora,
      usuarioLogeado: this.usuario
    });
  }

  actualizar(tf: TipoFenomeno): Observable<TipoFenomeno> {
    const ahora = new Date().toISOString();
    return this.http.put<TipoFenomeno>(this.base, {
      tipoFenomenoId: tf.tipoFenomenoId,
      nombre: tf.nombre,
      activo: tf.activo,
      usuarioIng: tf.usuarioIng ?? this.usuario,
      fechaIng: tf.fechaIng ?? ahora,
      usuarioAct: this.usuario,
      fechaAct: ahora,
      usuarioLogeado: this.usuario
    });
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?usuarioLogeado=${this.usuario}`);
  }
}
