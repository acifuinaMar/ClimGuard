import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Comunidad } from '../../core/models/comunidad.model';
import { NivelAlertaCat, TipoFenomenoCat, TipoSensorCat } from '../../core/models/catalogo.model';
import { Reporte, TipoReporte } from '../../core/models/reporte.model';
import { Sensor, ESTADOS_SENSOR } from '../../core/models/sensor.model';
import { CatalogoService } from '../../core/services/catalogo.service';
import { ComunidadService } from '../../core/services/comunidad.service';
import { ReporteService } from '../../core/services/reporte.service';
import { SensorService } from '../../core/services/sensor.service';
import { detalleError } from '../../core/http-error';

interface Opcion { valor: string; texto: string }
interface CampoFiltro { clave: string; etiqueta: string; tipo: 'select' | 'date'; opciones?: Opcion[] }

const ETIQUETAS: Record<string, string> = {
  comunidadId: 'Comunidad', sensorId: 'Sensor', tipoSensorId: 'Tipo de sensor', estadoSensorId: 'Estado del sensor',
  nivelAlertaId: 'Nivel de alerta', tipoFenomenoId: 'Fenómeno', estadoAlertaId: 'Estado de la alerta', activo: 'Activas',
  from: 'Desde', to: 'Hasta'
};
const ESTADOS_ALERTA: Opcion[] = [
  { valor: '1', texto: 'Activa' }, { valor: '2', texto: 'Atendida' }, { valor: '3', texto: 'Cerrada' }
];
const ESTADOS_REPORTE: Record<string, string> = {
  PENDING: 'En cola', PROCESSING: 'Generando…', COMPLETED: 'Listo', FAILED: 'Falló'
};
const TAM_PAGINA = 10;
const SONDEO_MS = 2000;
const SONDEO_MAX = 150; // ~5 minutos

@Component({
  selector: 'app-reportes-page',
  templateUrl: './reportes-page.html',
  styleUrl: './reportes-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe]
})
export class ReportesPage implements OnDestroy {
  private api = inject(ReporteService);
  private comunidadSvc = inject(ComunidadService);
  private sensorSvc = inject(SensorService);
  private catalogo = inject(CatalogoService);

  tipos = signal<TipoReporte[]>([]);
  tipoSel = signal<string>('');
  filtros = signal<Record<string, string>>({});
  historial = signal<Reporte[]>([]);
  total = signal(0);
  pagina = signal(1);
  cargando = signal(true);
  generando = signal(false);
  mensaje = signal<string | null>(null);
  error = signal<string | null>(null);

  private comunidades = signal<Comunidad[]>([]);
  private sensores = signal<Sensor[]>([]);
  private niveles = signal<NivelAlertaCat[]>([]);
  private fenomenos = signal<TipoFenomenoCat[]>([]);
  private tiposSensor = signal<TipoSensorCat[]>([]);

  private temporizador: ReturnType<typeof setTimeout> | null = null;
  private destruido = false;

  tipoActual = computed(() => this.tipos().find(t => t.key === this.tipoSel()) ?? null);
  paginas = computed(() => Math.max(1, Math.ceil(this.total() / TAM_PAGINA)));

  /** Campos de filtro que corresponden al tipo elegido (la lista viene del backend). */
  campos = computed<CampoFiltro[]>(() => {
    const t = this.tipoActual();
    if (!t) return [];
    return t.filters.map(clave => this.armarCampo(clave));
  });

  constructor() {
    forkJoin({
      tipos: this.api.tipos(),
      pagina: this.api.historial(1, TAM_PAGINA)
    }).subscribe({
      next: ({ tipos, pagina }) => {
        this.tipos.set(tipos);
        if (tipos.length) this.tipoSel.set(tipos[0].key);
        this.historial.set(pagina.items);
        this.total.set(pagina.total);
        this.cargando.set(false);
        this.reanudarPendientes();
      },
      error: (e) => { this.error.set(detalleError(e)); this.cargando.set(false); }
    });
    // Catálogos para los filtros: si alguno falla el filtro queda sin opciones, no se bloquea la pantalla.
    this.comunidadSvc.listar().subscribe({ next: c => this.comunidades.set(c), error: () => {} });
    this.sensorSvc.listar().subscribe({ next: s => this.sensores.set(s), error: () => {} });
    this.catalogo.nivelesAlerta().subscribe({ next: n => this.niveles.set(n), error: () => {} });
    this.catalogo.tiposFenomeno().subscribe({ next: f => this.fenomenos.set(f), error: () => {} });
    this.catalogo.tiposSensor().subscribe({ next: t => this.tiposSensor.set(t), error: () => {} });
  }

  ngOnDestroy(): void {
    this.destruido = true;
    if (this.temporizador) clearTimeout(this.temporizador);
  }

  private armarCampo(clave: string): CampoFiltro {
    const etiqueta = ETIQUETAS[clave] ?? clave;
    switch (clave) {
      case 'comunidadId': return { clave, etiqueta, tipo: 'select', opciones: this.comunidades().map(c => ({ valor: String(c.comunidadId), texto: c.nombreComunidad })) };
      case 'sensorId': return { clave, etiqueta, tipo: 'select', opciones: this.sensores().map(s => ({ valor: String(s.sensorId), texto: `${s.codigo} · ${s.nombre}` })) };
      case 'tipoSensorId': return { clave, etiqueta, tipo: 'select', opciones: this.tiposSensor().map(t => ({ valor: String(t.tipoSensorId), texto: t.nombre })) };
      case 'estadoSensorId': return { clave, etiqueta, tipo: 'select', opciones: ESTADOS_SENSOR.map(e => ({ valor: String(e.estadoSensorId), texto: e.nombre })) };
      case 'nivelAlertaId': return { clave, etiqueta, tipo: 'select', opciones: this.niveles().map(n => ({ valor: String(n.nivelAlertaId), texto: n.nombre })) };
      case 'tipoFenomenoId': return { clave, etiqueta, tipo: 'select', opciones: this.fenomenos().map(f => ({ valor: String(f.tipoFenomenoId), texto: f.nombre })) };
      case 'estadoAlertaId': return { clave, etiqueta, tipo: 'select', opciones: ESTADOS_ALERTA };
      case 'activo': return { clave, etiqueta, tipo: 'select', opciones: [{ valor: 'true', texto: 'Solo activas' }, { valor: 'false', texto: 'Solo inactivas' }] };
      default: return { clave, etiqueta, tipo: 'date' };
    }
  }

  elegirTipo(clave: string) {
    this.tipoSel.set(clave);
    this.filtros.set({});
    this.mensaje.set(null);
  }

  cambiarFiltro(clave: string, valor: string) {
    this.filtros.update(f => ({ ...f, [clave]: valor }));
  }

  valorFiltro(clave: string): string { return this.filtros()[clave] ?? ''; }

  generar() {
    const tipo = this.tipoSel();
    if (!tipo || this.generando()) return;
    const f = this.filtros();
    if (f['from'] && f['to'] && f['from'] > f['to']) {
      this.error.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    const limpio: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(f)) {
      if (v === '') continue;
      limpio[k] = k === 'activo' ? v === 'true' : v;
    }
    this.error.set(null);
    this.mensaje.set(null);
    this.generando.set(true);
    this.api.generar(tipo, limpio).subscribe({
      next: (meta) => {
        this.mensaje.set(`Reporte ${meta.reportId} en proceso…`);
        this.pagina.set(1);
        this.recargarHistorial();
        this.sondear(meta.reportId, 0);
      },
      error: (e) => { this.error.set(detalleError(e)); this.generando.set(false); }
    });
  }

  private sondear(id: string, intento: number) {
    if (this.destruido) return;
    this.temporizador = setTimeout(() => {
      this.api.obtener(id).subscribe({
        next: (meta) => {
          if (meta.status === 'COMPLETED') {
            this.generando.set(false);
            this.mensaje.set(`Reporte ${id} listo.` + (meta.truncated ? ' Atención: se limitó el número de filas (use filtros para acotar).' : ''));
            this.recargarHistorial();
          } else if (meta.status === 'FAILED') {
            this.generando.set(false);
            this.error.set(`El reporte ${id} falló: ${meta.error ?? 'error desconocido'}`);
            this.mensaje.set(null);
            this.recargarHistorial();
          } else if (intento >= SONDEO_MAX) {
            this.generando.set(false);
            this.mensaje.set(`El reporte ${id} sigue en proceso; revise el historial en unos minutos.`);
          } else {
            this.sondear(id, intento + 1);
          }
        },
        error: (e) => { this.generando.set(false); this.error.set(detalleError(e)); }
      });
    }, SONDEO_MS);
  }

  /** Si el usuario recarga la página con un reporte en curso, se vuelve a vigilar el más reciente. */
  private reanudarPendientes() {
    const pendiente = this.historial().find(r => r.status === 'PENDING' || r.status === 'PROCESSING');
    if (pendiente && !this.generando()) {
      this.generando.set(true);
      this.mensaje.set(`Reporte ${pendiente.reportId} en proceso…`);
      this.sondear(pendiente.reportId, 0);
    }
  }

  recargarHistorial() {
    this.api.historial(this.pagina(), TAM_PAGINA).subscribe({
      next: (p) => { this.historial.set(p.items); this.total.set(p.total); },
      error: (e) => this.error.set(detalleError(e))
    });
  }

  irAPagina(n: number) {
    if (n < 1 || n > this.paginas()) return;
    this.pagina.set(n);
    this.recargarHistorial();
  }

  descargar(r: Reporte) {
    this.error.set(null);
    this.api.descargar(r.reportId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = r.fileName || `${r.reportId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        this.recargarHistorial();
      },
      error: (e) => this.error.set(detalleError(e))
    });
  }

  nombreTipo(clave: string): string { return this.tipos().find(t => t.key === clave)?.name ?? clave; }
  estadoTexto(s: string): string { return ESTADOS_REPORTE[s] ?? s; }
  tamano(b?: number): string { return b == null ? '—' : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`; }

  resumenFiltros(r: Reporte): string {
    const partes = Object.entries(r.filters ?? {}).map(([k, v]) => `${ETIQUETAS[k] ?? k}: ${v}`);
    return partes.length ? partes.join(' · ') : 'Sin filtros';
  }
}
