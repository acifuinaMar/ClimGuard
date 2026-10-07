import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Sensor, ESTADO_SENSOR_ACTIVO, ESTADO_SENSOR_INACTIVO } from '../models/sensor.model';
import { AuthService } from './auth.service';

/**
 * Todo el trato con /api/Sensor vive aquí.
 *
 * Crear/editar/borrar es solo del Administrador (lo impone el backend). El PUT
 * NO lleva id en la dirección: el id va en el cuerpo. Al crear/editar hay que
 * mandar codigo, ubicacion y descripcion (obligatorios) y el estadoSensorId.
 */
@Injectable({ providedIn: 'root' })
export class SensorService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private get base(): string { return `${environment.apiUrl}/Sensor`; }
  private get suf(): string { return environment.sufijoArchivo; }
  private get usuario(): number { return this.auth.sesion()?.usuarioId ?? 1; }

  listar(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.base}${this.suf}`).pipe(
      map(lista => lista.map(s => this.derivar(s)))
    );
  }

  obtener(id: number): Observable<Sensor> {
    return this.http.get<Sensor>(`${this.base}/${id}${this.suf}`).pipe(
      map(s => this.derivar(s))
    );
  }

  /** POST /api/Sensor (solo Administrador). El servidor asigna el id (va en 0). */
  crear(sensor: Sensor): Observable<Sensor> {
    return this.http.post<Sensor>(this.base, this.aComando(sensor, 0));
  }

  /** PUT /api/Sensor (solo Administrador). SIN id en la dirección: va en el cuerpo. */
  actualizar(sensor: Sensor): Observable<Sensor> {
    return this.http.put<Sensor>(this.base, this.aComando(sensor, sensor.sensorId));
  }

  /** DELETE /api/Sensor/{id}?usuarioLogeado={id} (solo Administrador). */
  eliminar(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.base}/${id}?usuarioLogeado=${this.usuario}`);
  }

  /** Activar o desactivar: cambia el estadoSensorId y reenvía el sensor. */
  cambiarEstado(sensor: Sensor, activo: boolean): Observable<Sensor> {
    return this.actualizar({
      ...sensor,
      estadoSensorId: activo ? ESTADO_SENSOR_ACTIVO : ESTADO_SENSOR_INACTIVO
    });
  }

  /** Pide al backend generar lecturas simuladas. POST /api/Sensor/simular */
  simular(): Observable<boolean> {
    return this.http.post<boolean>(`${this.base}/simular`, {});
  }

  /** Agrega los campos derivados que usa el resto del front. */
  private derivar(s: Sensor): Sensor {
    return {
      ...s,
      activo: s.estadoSensorId === ESTADO_SENSOR_ACTIVO,
      ultimaActualizacion: s.fechaUltimaConexion
    };
  }

  /** Arma el cuerpo EXACTO que espera el backend (Create/UpdateSensorCommand). */
  private aComando(s: Sensor, id: number) {
    const ahora = new Date().toISOString();
    return {
      sensorId: id,
      nombre: s.nombre,
      codigo: s.codigo,
      ubicacion: s.ubicacion,
      descripcion: s.descripcion,
      fechaInstalacion: s.fechaInstalacion ?? ahora,
      fechaUltimaConexion: s.fechaUltimaConexion ?? ahora,
      valorActual: s.valorActual,
      activo: s.estadoSensorId === ESTADO_SENSOR_ACTIVO,
      comunidadId: s.comunidadId,
      tipoSensorId: s.tipoSensorId,
      estadoSensorId: s.estadoSensorId,
      usuarioLogeado: this.usuario
    };
  }
}
