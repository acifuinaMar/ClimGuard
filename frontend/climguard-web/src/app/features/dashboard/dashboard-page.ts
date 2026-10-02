import { Component, computed, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Sensor } from '../../core/models/sensor.model';
import { SensorService } from '../../core/services/sensor.service';
import { calcularNivel, textoNivel, unidadDe, variableDe, Nivel } from '../../core/nivel-alerta';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Alerta } from '../../core/models/alerta.model';
import { AlertaService } from '../../core/services/alerta.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { AlarmaService } from '../../core/services/alarma.service';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe]
})
export class DashboardPage {
  private servicio = inject(SensorService);
  private alertaService = inject(AlertaService);
  private realtime = inject(RealtimeService);
  private alarma = inject(AlarmaService);

  /** true cuando el Hub de SignalR está conectado (para el indicador en vivo). */
  tiempoReal = this.realtime.conectado;

  /** Cuántas emergencias había la última vez, para detectar si apareció una nueva. */
  private emergenciasPrevias = 0;

  /**
   * Vigila el número de sensores en emergencia. Si SUBE (apareció una nueva),
   * dispara la alarma visual y sonora. Un effect se re-ejecuta solo cuando
   * cambia la señal que lee dentro (emergencia).
   */
  private vigilarEmergencias = effect(() => {
    const ahora = this.emergencia();
    if (ahora > this.emergenciasPrevias) {
      this.alarma.disparar(`¡Emergencia! ${ahora} sensor(es) en nivel crítico.`);
    }
    this.emergenciasPrevias = ahora;
  });

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

   // ===== TIEMPO REAL (SignalR) =====
   // Abrimos la conexión con el Hub. Cuando el servidor empuje algo,
   // actualizamos AL INSTANTE, sin esperar al polling.
   this.realtime.conectar();

   // Si llega una alerta nueva, recargamos las alertas de inmediato.
   this.realtime.nuevaAlerta$.subscribe(() => this.cargarAlertas());

   // Si llega una lectura nueva o cambia un sensor, recargamos sensores.
   this.realtime.nuevaLectura$.subscribe(() => this.cargarSensores());
   this.realtime.sensorActualizado$.subscribe(() => this.cargarSensores());

   // ===== POLLING (plan B) =====
   // Sigue como respaldo: si SignalR no está disponible, el dashboard igual
   // se mantiene al día. Además es lo que dispara la simulación de datos.
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
