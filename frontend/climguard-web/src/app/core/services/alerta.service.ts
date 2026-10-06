import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Alerta } from '../models/alerta.model';
import { AuthService } from './auth.service';

/**
 * Trato con /api/Alerta. Leer y atender lo pueden hacer Operador y Administrador
 * (lo impone el backend). "Atender" una alerta es marcarla como no activa y dejar
 * constancia de quién la revisó.
 */
@Injectable({ providedIn: 'root' })
export class AlertaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get base(): string { return `${environment.apiUrl}/Alerta`; }
  private get usuario(): number { return this.auth.sesion()?.usuarioId ?? 1; }

  listar(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.base);
  }

  /**
   * PUT /api/Alerta/{id} (Operador o Administrador). El id va en la ruta Y en el
   * cuerpo. Se envía la alerta completa con los campos de auditoría.
   */
  actualizar(alerta: Alerta): Observable<Alerta> {
    const ahora = new Date().toISOString();
    return this.http.put<Alerta>(`${this.base}/${alerta.alertaId}`, {
      alertaId: alerta.alertaId,
      valorDetectado: alerta.valorDetectado,
      mensajeSnap: alerta.mensajeSnap,
      nivelAlertaIdSnap: alerta.nivelAlertaIdSnap,
      tipoFenomenoIdSnap: alerta.tipoFenomenoIdSnap,
      fechaHora: alerta.fechaHora,
      activo: alerta.activo,
      sensorId: alerta.sensorId,
      comunidadId: alerta.comunidadId,
      reglaAlertaId: alerta.reglaAlertaId,
      estadoAlertaId: alerta.estadoAlertaId,
      usuarioResponsableId: alerta.usuarioResponsableId ?? null,
      usuarioIng: alerta.usuarioIng ?? this.usuario,
      fechaIng: alerta.fechaIng ?? ahora,
      usuarioAct: this.usuario,
      fechaAct: ahora
    });
  }

  /**
   * "Atender" una alerta: la marca como NO activa y registra quién la atendió.
   * Es el caso del enunciado: el operador la revisa y la cierra.
   */
  atender(alerta: Alerta): Observable<Alerta> {
    return this.actualizar({
      ...alerta,
      activo: false,
      usuarioResponsableId: this.usuario
    });
  }
}
