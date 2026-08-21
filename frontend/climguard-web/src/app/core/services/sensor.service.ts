import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sensor } from '../models/sensor.model';
import { AuthService } from './auth.service';

/**
 * Todo el trato con /api/Sensor vive aquí.
 *
 * Los componentes NUNCA llaman a la API por su cuenta: le piden a este
 * servicio. Así, si mañana cambia la dirección, el formato o hay que
 * agregar un token, se toca un solo archivo.
 */
@Injectable({ providedIn: 'root' })
export class SensorService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  /** Dirección base, armada una sola vez. */
  private get base(): string {
    return `${environment.apiUrl}/Sensor`;
  }
  private get suf(): string {
    return environment.sufijoArchivo;
  }

  listar(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.base}${this.suf}`);
  }

  obtener(id: number): Observable<Sensor> {
    return this.http.get<Sensor>(`${this.base}/${id}${this.suf}`);
  }

  /** POST — el servidor asigna el id, por eso se manda en 0. */
  crear(sensor: Sensor): Observable<Sensor> {
    return this.http.post<Sensor>(this.base, {
      ...sensor,
      usuarioLogeado: this.auth.sesion()?.usuarioId ?? 0
    });
  }

  /** PUT — reemplaza el registro completo. */
  actualizar(id: number, sensor: Sensor): Observable<Sensor> {
    return this.http.put<Sensor>(`${this.base}/${id}`, {
      ...sensor,
      usuarioLogeado: this.auth.sesion()?.usuarioId ?? 0
    });
  }

  /** DELETE — la API devuelve true si borró. */
  eliminar(id: number): Observable<boolean> {

    const usuario = this.auth.sesion()?.usuarioId ?? 0;

    return this.http.delete<boolean>(
      `${this.base}/${id}?usuarioLogeado=${usuario}`
    );
  }

  /**
   * Activar o desactivar. Es un caso del enunciado (Administración, punto 3).
   *
   * La API no tiene un endpoint dedicado, así que se manda el sensor
   * completo con el campo cambiado. Si mañana Mahuerk agrega algo como
   * PATCH /api/Sensor/{id}/estado, solo cambia este método.
   */
  cambiarEstado(sensor: Sensor, activo: boolean): Observable<Sensor> {
    return this.actualizar(sensor.sensorId, { ...sensor, activo });
  }

  /**
   * Pide al backend que genere nuevas lecturas simuladas para todos los
   * sensores activos. Es lo que el dashboard llama cada pocos segundos para
   * dar el efecto de tiempo real mientras no haya SignalR.
   * Endpoint real: POST /api/Sensor/simular
   */
  simular(): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/simular`, {});
  }
}
