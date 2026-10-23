import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IndicadoresEjecutivos as Datos } from '../../core/models/reporte.model';
import { ReporteService } from '../../core/services/reporte.service';

/** Indicadores ejecutivos del panel, alimentados por el Report Service (GET /api/reports/dashboard). */
@Component({
  selector: 'app-indicadores-ejecutivos',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    @if (datos(); as d) {
      <section class="ind" aria-label="Indicadores ejecutivos">
        <div class="ind__item" [class]="'ind__item ind__item--' + d.situacion.tono">
          <span class="ind__valor">{{ d.situacion.nivel }}</span><span class="ind__rotulo">Situación general</span>
        </div>
        <div class="ind__item"><span class="ind__valor">{{ d.comunidades.activas }}/{{ d.comunidades.total }}</span><span class="ind__rotulo">Comunidades activas</span></div>
        <div class="ind__item"><span class="ind__valor">{{ d.sensores.total }}</span><span class="ind__rotulo">Sensores ({{ d.sensores.sinComunicacion }} sin comunicación)</span></div>
        <div class="ind__item"><span class="ind__valor">{{ d.alertas.activas }}</span><span class="ind__rotulo">Alertas activas ({{ d.alertas.total }} en total)</span></div>
        <div class="ind__item"><span class="ind__valor">{{ d.eventos.total }}</span><span class="ind__rotulo">Eventos registrados</span></div>
      </section>
    }
  `,
  styles: [`
    .ind { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: .8rem; margin-bottom: 1.3rem; }
    .ind__item { background: var(--cg-superficie); border: 1px solid var(--cg-borde); border-radius: var(--cg-radio); box-shadow: var(--cg-sombra);
      padding: .8rem 1rem; display: flex; flex-direction: column; gap: .2rem; }
    .ind__valor { font-size: 1.5rem; font-weight: 700; }
    .ind__rotulo { font-size: .78rem; color: var(--cg-texto-tenue); }
    .ind__item--ok .ind__valor { color: var(--cg-verde); }
    .ind__item--warn .ind__valor { color: var(--cg-naranja); }
    .ind__item--danger .ind__valor { color: var(--cg-rojo); }
  `]
})
export class IndicadoresEjecutivos {
  private api = inject(ReporteService);
  datos = signal<Datos | null>(null);

  constructor() {
    // Si el servicio de reportes no responde, el panel sigue funcionando sin esta franja.
    this.api.indicadores().subscribe({ next: d => this.datos.set(d), error: () => this.datos.set(null) });
  }
}
