import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { fijarNiveles, fijarReglas } from '../nivel-alerta';
import { CatalogoService } from './catalogo.service';
import { ReglaAlertaService } from './regla-alerta.service';

/**
 * Carga las reglas de alerta del servidor (única fuente de verdad) y se las entrega a nivel-alerta.ts
 * para que dashboard, mapa y sensores calculen el nivel con el MISMO criterio que el backend.
 */
@Injectable({ providedIn: 'root' })
export class PeligroService {
  private reglasApi = inject(ReglaAlertaService);
  private catalogo = inject(CatalogoService);

  /** Cuántas reglas legadas (semántica anterior) faltan por convertir. Siguen evaluándose con su semántica original. */
  pendientesRevision = signal(0);
  /** false si no se pudieron leer las reglas: los niveles quedan en «Normal» y la UI debe advertirlo. */
  disponible = signal(true);

  private cargadoEn = 0;
  private firma = '';
  /** Vigencia corta: tras editar un umbral, cualquier pantalla abierta lo ve en <= ~15 s (el backend ya lo usa al instante). */
  private readonly vigenciaMs = 15_000;

  /**
   * Garantiza reglas frescas antes de calcular niveles. Nunca falla (el error se refleja en `disponible`).
   * Emite true si las reglas CAMBIARON respecto a la carga anterior (para que la pantalla se repinte).
   */
  asegurar(): Observable<boolean> {
    if (Date.now() - this.cargadoEn < this.vigenciaMs) return of(false);
    return this.recargar();
  }

  /** Fuerza la lectura de reglas. Emite true si cambiaron respecto a la carga anterior. */
  recargar(): Observable<boolean> {
    let cambio = false;
    return forkJoin({
      reglas: this.reglasApi.listar().pipe(timeout(5000)),
      niveles: this.catalogo.nivelesAlerta()
    }).pipe(
      tap(({ reglas, niveles }) => {
        fijarNiveles(niveles);
        fijarReglas(reglas);
        const nueva = JSON.stringify(reglas.map(r => [r.reglaAlertaId, r.tipoSensorId, r.valorMin, r.valorMax, r.nivelAlertaId, r.activo, !!r.requiereRevision]));
        cambio = nueva !== this.firma;
        this.firma = nueva;
        this.pendientesRevision.set(reglas.filter(r => r.requiereRevision).length);
        this.disponible.set(true);
        this.cargadoEn = Date.now();
      }),
      map(() => cambio),
      catchError(() => { this.disponible.set(false); return of(false); })
    );
  }
}
