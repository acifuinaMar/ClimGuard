import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReglaAlerta } from '../models/regla-alerta.model';
import { AuthService } from './auth.service';

/**
 * Trato con /api/ReglaAlerta. El backend ofrece crear (POST), editar (PUT) y
 * borrar (DELETE). El PUT lleva el id en el CUERPO (no en la dirección). Para
 * apagar una regla sin borrarla, se edita su campo `activo`. Solo el Administrador.
 */
@Injectable({ providedIn: 'root' })
export class ReglaAlertaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get base(): string { return `${environment.apiUrl}/ReglaAlerta`; }
  private get usuario(): number { return this.auth.sesion()?.usuarioId ?? 1; }

  listar(): Observable<ReglaAlerta[]> {
    return this.http.get<ReglaAlerta[]>(this.base);
  }

  /** POST /api/ReglaAlerta — crear (RF-ADM-29). El servidor asigna el id (va en 0). */
  crear(regla: ReglaAlerta): Observable<ReglaAlerta> {
    return this.http.post<ReglaAlerta>(this.base, this.aComando(regla, 0, true));
  }

  /** PUT /api/ReglaAlerta — editar. El id viaja en el cuerpo (reglaAlertaId). */
  actualizar(regla: ReglaAlerta): Observable<ReglaAlerta> {
    return this.http.put<ReglaAlerta>(this.base, this.aComando(regla, regla.reglaAlertaId, false));
  }

  /** DELETE /api/ReglaAlerta/{id}?usuarioLogeado={id}. */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}?usuarioLogeado=${this.usuario}`);
  }

  /** Arma el cuerpo EXACTO que espera el backend (Create/UpdateReglaAlertaCommand). */
  private aComando(r: ReglaAlerta, id: number, esNueva: boolean) {
    const ahora = new Date().toISOString();
    return {
      reglaAlertaId: id,
      nombre: r.nombre,
      valorMin: r.valorMin,
      valorMax: r.valorMax,
      mensaje: r.mensaje,
      activo: r.activo,
      tipoSensorId: r.tipoSensorId,
      tipoFenomenoId: r.tipoFenomenoId,
      nivelAlertaId: r.nivelAlertaId,
      usuarioIng: r.usuarioIng ?? this.usuario,
      fechaIng: r.fechaIng ?? ahora,
      usuarioAct: esNueva ? null : this.usuario,
      fechaAct: esNueva ? null : ahora,
      usuarioLogeado: this.usuario
    };
  }
}
