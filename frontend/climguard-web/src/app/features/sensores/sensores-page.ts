import { Component, computed, inject, signal } from '@angular/core';
import { Sensor } from '../../core/models/sensor.model';
import { SensorService } from '../../core/services/sensor.service';
import { calcularNivel, textoNivel, unidadDe, variableDe, Nivel } from '../../core/nivel-alerta';
import { SensorForm } from './sensor-form';

interface SensorVista extends Sensor {
  nivel: Nivel;
  nivelTexto: string;
  unidad: string;
  variable: string;
}

@Component({
  selector: 'app-sensores-page',
  imports: [SensorForm],
  templateUrl: './sensores-page.html',
  styleUrl: './sensores-page.scss'
})
export class SensoresPage {
  private servicio = inject(SensorService);

  sensores = signal<SensorVista[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  /** Estado de la ventana modal. */
  formAbierto = signal(false);
  sensorEditando = signal<Sensor | null>(null);
  guardando = signal(false);

  /** Sensor pendiente de confirmar borrado. */
  porBorrar = signal<Sensor | null>(null);
  borrando = signal(false);

  /** Mensaje de éxito temporal, para dar retroalimentación al usuario. */
  aviso = signal<string | null>(null);

  activos = computed(() => this.sensores().filter(s => s.activo).length);

  constructor() {
    this.cargar();
  }

  // ==================== LEER ====================

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.servicio.listar().subscribe({
      next: (datos) => {
        this.sensores.set(datos.map(s => this.decorar(s)));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los sensores.');
        this.cargando.set(false);
      }
    });
  }

  /** Le agrega al sensor su nivel, unidad y nombre de variable, ya calculados. */
  private decorar(s: Sensor): SensorVista {
    const nivel = calcularNivel(s.tipoSensorId, s.valorActual);
    return {
      ...s,
      nivel,
      nivelTexto: textoNivel(nivel),
      unidad: unidadDe(s.tipoSensorId),
      variable: variableDe(s.tipoSensorId)
    };
  }

  // ==================== CREAR Y EDITAR ====================

  nuevo(): void {
    this.sensorEditando.set(null);
    this.formAbierto.set(true);
  }

  editar(s: Sensor): void {
    this.sensorEditando.set(s);
    this.formAbierto.set(true);
  }

  cerrarForm(): void {
    this.formAbierto.set(false);
    this.sensorEditando.set(null);
  }

  onGuardar(sensor: Sensor): void {
    this.guardando.set(true);

    // El mismo formulario sirve para crear y para editar. La diferencia es
    // solo qué método del servicio se llama.
    const peticion = sensor.sensorId === 0
      ? this.servicio.crear(sensor)
      : this.servicio.actualizar(sensor.sensorId, sensor);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(sensor.sensorId === 0 ? 'Sensor creado.' : 'Sensor actualizado.');
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar el sensor. Revisa la conexión.');
      }
    });
  }

  // ==================== ACTIVAR / DESACTIVAR ====================

  alternarEstado(s: SensorVista): void {
    // Cambio optimista: se pinta de inmediato para que la interfaz responda
    // al instante, y si el servidor falla se revierte.
    const previo = s.activo;
    this.sensores.update(lista =>
      lista.map(x => x.sensorId === s.sensorId ? { ...x, activo: !previo } : x)
    );

    this.servicio.cambiarEstado(s, !previo).subscribe({
      next: () => this.mostrarAviso(previo ? 'Sensor desactivado.' : 'Sensor activado.'),
      error: () => {
        this.sensores.update(lista =>
          lista.map(x => x.sensorId === s.sensorId ? { ...x, activo: previo } : x)
        );
        this.error.set('No se pudo cambiar el estado del sensor.');
      }
    });
  }

  // ==================== BORRAR ====================

  pedirBorrar(s: Sensor): void { this.porBorrar.set(s); }
  cancelarBorrar(): void { this.porBorrar.set(null); }

  confirmarBorrar(): void {
    const s = this.porBorrar();
    if (!s) return;

    this.borrando.set(true);
    this.servicio.eliminar(s.sensorId).subscribe({
      next: () => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.mostrarAviso('Sensor eliminado.');
        this.cargar();
      },
      error: () => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.error.set('No se pudo eliminar el sensor.');
      }
    });
  }

  // ==================== AVISOS ====================

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }
}
