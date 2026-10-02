import { Component, computed, inject, signal } from '@angular/core';
import { Sensor } from '../../core/models/sensor.model';
import { SensorService } from '../../core/services/sensor.service';
import { calcularNivel, textoNivel, unidadDe, variableDe, Nivel } from '../../core/nivel-alerta';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Alerta } from '../../core/models/alerta.model';
import { AlertaService } from '../../core/services/alerta.service';
import { DatePipe } from '@angular/common';

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
  styleUrl: './dashboard-page.scss',
  imports: [DatePipe]
})
export class DashboardPage {
  private servicio = inject(SensorService);
  private alertaService = inject(AlertaService);
  cargando = signal(true);
  error = signal<string | null>(null);
  sensores = signal<SensorConNivel[]>([]);
  historial = signal<number[]>([]);
  alertas = signal<Alerta[]>([]);

  /* ---- Indicadores calculados ----
     computed() se recalcula SOLO cuando cambia lo que usa dentro.
     No hay que acordarse de actualizarlo: Angular lo hace. */
  total     = computed(() => this.sensores().length);
  activos   = computed(() => this.sensores().filter(s => s.activo).length);
  enRiesgo  = computed(() => this.sensores().filter(s => s.nivel !== 'verde').length);
  emergencia = computed(() => this.sensores().filter(s => s.nivel === 'rojo').length);

  estadoGeneral = computed(() => {

    if (this.emergencia() > 0) {
      return {
        texto: 'Emergencia',
        clase: 'rojo'
      };
    }

    if (this.enRiesgo() > 0) {
      return {
        texto: 'Monitoreo preventivo',
        clase: 'naranja'
      };
    }

    return {
      texto: 'Operación normal',
      clase: 'verde'
    };
  });
  ultimaActualizacion = computed(() => {
    if (this.sensores().length === 0)
      return '--';

    const fechas = this.sensores()
      .map(s => new Date(s.ultimaActualizacion));

    const ultima = new Date(
      Math.max(...fechas.map(f => f.getTime()))
    );

    return ultima.toLocaleString('es-GT');

  });

  /** Los sensores en riesgo van primero: lo urgente arriba. */
  ordenados = computed(() => {
    const peso: Record<Nivel, number> = { rojo: 0, naranja: 1, amarillo: 2, verde: 3 };
    return [...this.sensores()].sort((a, b) => peso[a.nivel] - peso[b.nivel]);
  });
  private cargarSensores(): void {

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

        const temperatura = datos.find(s => s.tipoSensorId === 1);

          if (temperatura) {

              const nuevoHistorial = [
                  ...this.historial(),
                  Number(temperatura.valorActual)
              ];

              if (nuevoHistorial.length > 12) {
                  nuevoHistorial.shift();
              }

              this.historial.set(nuevoHistorial);

          }

        this.cargando.set(false);

      },

      error: () => {

        this.error.set('No se pudo conectar con el servidor de monitoreo.');

        this.cargando.set(false);

      }

    });

  }
  private cargarAlertas(): void {

    this.alertaService.listar().subscribe({

      next: datos => {

        const activas = datos
            .filter(a => a.activa)
            .sort(
                (a, b) =>
                    new Date(b.fechaHora).getTime() -
                    new Date(a.fechaHora).getTime()
            )
            .slice(0, 5);

        this.alertas.set(activas);

    },

    error: err => {

      console.error(err);

    }

  });

}
  constructor() {
   this.cargarSensores();
   this.cargarAlertas();
   // Cada 5 segundos:
  // 1. Simula nuevos valores
  // 2. Vuelve a cargar los sensores
  interval(5000)
    .pipe(
      switchMap(() => this.servicio.simular())
    )
    .subscribe({
      next: () => this.cargarSensores(),
      error: (err) => console.error('Error al simular sensores', err)
    });
    /*this.servicio.listar().subscribe({
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
    });*/
  }
  grafica = computed(() => {

    const datos = this.historial();

    if (datos.length < 2)
        return '';

    const ancho = 700;
    const alto = 220;
    const margen = 30;

    const min = Math.min(...datos);
    const max = Math.max(...datos);

    const rango = Math.max(max - min, 1);

    return datos.map((v, i) => {

        const x =
            margen +
            (i * (ancho - margen * 2)) /
            (datos.length - 1);

        const y =
            alto -
            margen -
            ((v - min) / rango) *
            (alto - margen * 2);

        return `${x},${y}`;

    }).join(' ');

});

tipoFenomeno(id: number): string {

  switch (id) {

    case 1:
      return 'Inundación';

    case 2:
      return 'Sequía';

    case 3:
      return 'Tormenta';

    case 4:
      return 'Helada';

    case 5:
      return 'Incendio Forestal';

    default:
      return 'Fenómeno desconocido';

  }

}

colorAlerta(id: number): string {

  switch (id) {

    case 1:
      return 'verde';

    case 2:
      return 'amarillo';

    case 3:
      return 'naranja';

    case 4:
      return 'rojo';

    default:
      return 'gris';

  }

}

nombreComunidad(id: number): string {

  switch (id) {

    case 1:
      return 'Comunidad Central';

    case 2:
      return 'Comunidad Norte';

    case 3:
      return 'Comunidad Sur';

    case 4:
      return 'Comunidad Oriente';

    case 5:
      return 'Comunidad Occidente';

    default:
      return `Comunidad ${id}`;

  }

}
}
