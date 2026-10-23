import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IndicadoresEjecutivos, PaginaReportes, Reporte, TipoReporte } from '../models/reporte.model';

/** Todo el trato con el Report Service. El PDF lo genera SIEMPRE el backend; aquí solo se pide y se descarga. */
@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private get base(): string { return `${environment.apiUrl}/reports`; }

  tipos(): Observable<TipoReporte[]> {
    return this.http.get<TipoReporte[]>(`${this.base}/types`);
  }

  /** POST /api/reports → 202 con los metadatos; el PDF se genera en segundo plano. */
  generar(type: string, filters: Record<string, unknown>): Observable<Reporte> {
    return this.http.post<Reporte>(this.base, { type, filters });
  }

  obtener(id: string): Observable<Reporte> {
    return this.http.get<Reporte>(`${this.base}/${encodeURIComponent(id)}`);
  }

  historial(page: number, pageSize: number): Observable<PaginaReportes> {
    return this.http
      .get<Reporte[]>(`${this.base}/history`, { params: { page, pageSize }, observe: 'response' })
      .pipe(map((r: HttpResponse<Reporte[]>) => ({
        items: r.body ?? [],
        total: Number(r.headers.get('X-Total-Count') ?? r.body?.length ?? 0)
      })));
  }

  /** Descarga restringida (solo administradores autorizados): el token viaja en la cabecera Authorization. */
  descargar(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${encodeURIComponent(id)}/download`, { responseType: 'blob' });
  }

  indicadores(): Observable<IndicadoresEjecutivos> {
    return this.http.get<IndicadoresEjecutivos>(`${this.base}/dashboard`);
  }
}
