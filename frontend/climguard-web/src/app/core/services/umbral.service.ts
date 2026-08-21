import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Umbral } from '../models/umbral.model';

@Injectable({
  providedIn: 'root'
})
export class UmbralService {

  private http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}/Umbral`;
  }

  listar(): Observable<Umbral[]> {
  return this.http.get<Umbral[]>(this.base);
}

obtenerPorTipo(tipoSensorId: number): Observable<Umbral> {
  return this.http.get<Umbral>(`${this.base}/${tipoSensorId}`);
}

actualizar(umbral: Umbral): Observable<Umbral> {
  return this.http.put<Umbral>(
    `${this.base}/${umbral.tipoSensorId}`,
    umbral
  );
}

}
