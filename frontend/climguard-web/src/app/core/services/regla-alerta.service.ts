import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReglaAlerta } from '../models/regla-alerta.model';

/**
 * Trato con /api/ReglaAlerta. El backend solo expone GET (listar) y PUT (editar):
 * las reglas no se crean ni se borran desde aquí, solo se ajustan. Para desactivar
 * una regla se edita su campo `activo`.
 */
@Injectable({ providedIn: 'root' })
export class ReglaAlertaService {
  private http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}/ReglaAlerta`;
  }

  listar(): Observable<ReglaAlerta[]> {
    return this.http.get<ReglaAlerta[]>(this.base);
  }

  /**
   * PUT /api/ReglaAlerta/{id}. OJO: el backend exige el id en la RUTA y en el
   * CUERPO, y que coincidan (si no, responde 400). Por eso mandamos la regla
   * completa, que ya trae su reglaAlertaId. Solo el Administrador puede editar.
   */
  actualizar(regla: ReglaAlerta): Observable<ReglaAlerta> {
    return this.http.put<ReglaAlerta>(`${this.base}/${regla.reglaAlertaId}`, regla);
  }
}
