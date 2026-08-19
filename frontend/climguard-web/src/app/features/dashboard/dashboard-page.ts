import { Component, computed, inject, signal } from '@angular/core';
import { Sensor } from '../../core/models/sensor.model';
import { SensorService } from '../../core/services/sensor.service';
import { calcularNivel, textoNivel, unidadDe, variableDe, Nivel } from '../../core/nivel-alerta';

/** Un sensor con su nivel ya calculado, listo para pintar. */
interface SensorConNivel extends Sensor {
  nivel: Nivel;
  nivelTexto: string;
  unidad: string;
  variable: string;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  private servicio = inject(SensorService);

  cargando = signal(true);
  error = signal<string | null>(null);
  sensores = signal<SensorConNivel[]>([]);

  /* ---- Indicadores calculados ----
     computed() se recalcula SOLO cuando cambia lo que usa dentro.
     No hay que acordarse de actualizarlo: Angular lo hace. */
  total     = computed(() => this.sensores().length);
  activos   = computed(() => this.sensores().filter(s => s.activo).length);
  enRiesgo  = computed(() => this.sensores().filter(s => s.nivel !== 'verde').length);
  emergencia = computed(() => this.sensores().filter(s => s.nivel === 'rojo').length);

  /** Los sensores en riesgo van primero: lo urgente arriba. */
  ordenados = computed(() => {
    const peso: Record<Nivel, number> = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };
    return [...this.sensores()].sort((a, b) => peso[a.nivel] - peso[b.nivel]);
  });

  constructor() {
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.sensores.set(datos.map(s => {
          const nivel = calcularNivel(s.tipoSensorId, s.valorActual);
          return {
            ...s,
            nivel,
            nivelTexto: textoNivel(nivel),
            unidad: unidadDe(s.tipoSensorId),
            variable: variableDe(s.tipoSensorId)
          };
        }));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor de monitoreo.');
        this.cargando.set(false);
      }
    });
  }
}
