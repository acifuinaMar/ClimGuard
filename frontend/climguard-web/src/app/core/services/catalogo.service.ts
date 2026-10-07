import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NivelAlertaCat, TipoFenomenoCat, TipoSensorCat } from '../models/catalogo.model';

/**
 * Catálogos de solo lectura para los desplegables (p. ej. el formulario de reglas).
 *
 * - Nivel de alerta y Tipo de fenómeno vienen del backend (GET).
 * - Tipo de sensor aún no tiene endpoint, así que es una lista local con los
 *   mismos ids que usa el backend.
 *
 * Si el backend no responde en 5s, cada método cae a una lista de respaldo, para
 * que la app siga usable sin conexión. Cuando el backend esté arriba, usa lo real.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private http = inject(HttpClient);

  nivelesAlerta(): Observable<NivelAlertaCat[]> {
    return this.http.get<NivelAlertaCat[]>(`${environment.apiUrl}/NivelAlerta`).pipe(
      timeout(5000),
      catchError(() => of(NIVELES_RESPALDO))
    );
  }

  tiposFenomeno(): Observable<TipoFenomenoCat[]> {
    return this.http.get<TipoFenomenoCat[]>(`${environment.apiUrl}/TipoFenomeno`).pipe(
      timeout(5000),
      catchError(() => of(FENOMENOS_RESPALDO))
    );
  }

  tiposSensor(): Observable<TipoSensorCat[]> {
    return of(TIPOS_SENSOR);
  }
}

const NIVELES_RESPALDO: NivelAlertaCat[] = [
  { nivelAlertaId: 1, nombre: 'Verde',    colorHex: '#22c55e', activo: true },
  { nivelAlertaId: 2, nombre: 'Amarillo', colorHex: '#eab308', activo: true },
  { nivelAlertaId: 3, nombre: 'Naranja',  colorHex: '#f97316', activo: true },
  { nivelAlertaId: 4, nombre: 'Rojo',     colorHex: '#dc2626', activo: true }
];

const FENOMENOS_RESPALDO: TipoFenomenoCat[] = [
  { tipoFenomenoId: 1, nombre: 'Inundación',        activo: true },
  { tipoFenomenoId: 2, nombre: 'Sequía',            activo: true },
  { tipoFenomenoId: 3, nombre: 'Tormenta',          activo: true },
  { tipoFenomenoId: 4, nombre: 'Helada',            activo: true },
  { tipoFenomenoId: 5, nombre: 'Incendio forestal', activo: true }
];

const TIPOS_SENSOR: TipoSensorCat[] = [
  { tipoSensorId: 1, nombre: 'Temperatura' },
  { tipoSensorId: 2, nombre: 'Humedad' },
  { tipoSensorId: 3, nombre: 'Viento' },
  { tipoSensorId: 4, nombre: 'Lluvia' },
  { tipoSensorId: 5, nombre: 'Nivel de río' }
];
