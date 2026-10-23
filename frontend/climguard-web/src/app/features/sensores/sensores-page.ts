import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Sensor, ESTADOS_SENSOR, ESTADO_SENSOR_ACTIVO, ESTADO_SENSOR_INACTIVO } from '../../core/models/sensor.model';
import { SensorService } from '../../core/services/sensor.service';
import { calcularNivel, textoNivel, unidadDe, variableDe, Nivel } from '../../core/nivel-alerta';
import { SensorForm } from './sensor-form';
import { SiPermisoDirective } from '../../shared/si-permiso.directive';
import { detalleError } from '../../core/http-error';

interface SensorVista extends Sensor {
  nivel: Nivel;
  nivelTexto: string;
  unidad: string;
  variable: string;
}

@Component({
  selector: 'app-sensores-page',
  imports: [SensorForm, SiPermisoDirective],
  templateUrl: './sensores-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sensores-page.scss'
})
export class SensoresPage {
  private servicio = inject(SensorService);

  sensores = signal<SensorVista[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  /** true si el backend no respondió y mostramos sensores de ejemplo. */
  usandoEjemplo = signal(false);

  /** Estado de la ventana modal. */
  formAbierto = signal(false);
  sensorEditando = signal<Sensor | null>(null);
  guardando = signal(false);

  /** Sensor pendiente de confirmar borrado. */
  porBorrar = signal<Sensor | null>(null);
  borrando = signal(false);

  /** Mensaje de éxito temporal, para dar retroalimentación al usuario. */
  aviso = signal<string | null>(null);

  activos = computed(() => this.sensores().filter(s => s.estadoSensorId === ESTADO_SENSOR_ACTIVO).length);

  /** Nombre legible del estado (Activo, Inactivo, Mantenimiento, Fuera de línea). */
  nombreEstado(id: number): string {
    return ESTADOS_SENSOR.find(e => e.estadoSensorId === id)?.nombre ?? 'Desconocido';
  }

  constructor() {
    this.cargar();
  }

  // ==================== LEER ====================

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    // Si el backend no responde en 5s, caemos a datos de ejemplo para poder ver
    // la pantalla. Al conectarlo, usa los sensores reales sin tocar nada.
    this.servicio.listar().pipe(
      timeout(5000),
      catchError(() => of<Sensor[]>([]))
    ).subscribe((datos) => {
      const fuente = datos.length === 0 ? this.sensoresEjemplo() : datos;
      this.usandoEjemplo.set(datos.length === 0);
      this.sensores.set(fuente.map(s => this.decorar(s)));
      this.cargando.set(false);
    });
  }

  /** Le agrega al sensor su nivel, unidad y nombre de variable, ya calculados. */
  private decorar(s: Sensor): SensorVista {
    const nivel = calcularNivel(s.tipoSensorId, s.valorActual);
    return {
      ...s,
      activo: s.estadoSensorId === ESTADO_SENSOR_ACTIVO,
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
      : this.servicio.actualizar(sensor);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(sensor.sensorId === 0 ? 'Sensor creado.' : 'Sensor actualizado.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar el sensor. ' + detalleError(err));
      }
    });
  }

  // ==================== ACTIVAR / DESACTIVAR ====================

  alternarEstado(s: SensorVista): void {
    // Cambio optimista: se pinta de inmediato y, si el servidor falla, se revierte.
    const activar = s.estadoSensorId !== ESTADO_SENSOR_ACTIVO;
    const nuevoEstado = activar ? ESTADO_SENSOR_ACTIVO : ESTADO_SENSOR_INACTIVO;
    const estadoPrevio = s.estadoSensorId;

    this.sensores.update(lista =>
      lista.map(x => x.sensorId === s.sensorId
        ? { ...x, estadoSensorId: nuevoEstado, activo: activar }
        : x)
    );

    this.servicio.cambiarEstado(s, activar).subscribe({
      next: () => this.mostrarAviso(activar ? 'Sensor activado.' : 'Sensor desactivado.'),
      error: (err) => {
        this.sensores.update(lista =>
          lista.map(x => x.sensorId === s.sensorId
            ? { ...x, estadoSensorId: estadoPrevio, activo: estadoPrevio === ESTADO_SENSOR_ACTIVO }
            : x)
        );
        this.error.set('No se pudo cambiar el estado del sensor. ' + detalleError(err));
      }
    });
  }

  // ==================== BORRAR ====================

  /*pedirBorrar(s: Sensor): void { this.porBorrar.set(s); }
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
  }*/

  // ==================== DATOS DE EJEMPLO ====================

  /** Sensores de ejemplo para ver la pantalla mientras el backend no responde. */
  private sensoresEjemplo(): Sensor[] {
    const ahora = new Date().toISOString();
    return [
      { sensorId: 1, nombre: 'Termómetro Xela',   codigo: 'SEN-001', ubicacion: 'Quetzaltenango',     descripcion: 'Temperatura ambiente', fechaInstalacion: ahora, fechaUltimaConexion: ahora, valorActual: 1,   comunidadId: 2, tipoSensorId: 1, estadoSensorId: 1 },
      { sensorId: 2, nombre: 'Río Dulce',         codigo: 'SEN-002', ubicacion: 'Puerto Barrios',      descripcion: 'Nivel del río',        fechaInstalacion: ahora, fechaUltimaConexion: ahora, valorActual: 3.9, comunidadId: 3, tipoSensorId: 5, estadoSensorId: 1 },
      { sensorId: 3, nombre: 'Anemómetro Centro', codigo: 'SEN-003', ubicacion: 'Ciudad de Guatemala', descripcion: 'Velocidad del viento', fechaInstalacion: ahora, fechaUltimaConexion: ahora, valorActual: 20,  comunidadId: 1, tipoSensorId: 3, estadoSensorId: 2 },
      { sensorId: 4, nombre: 'Pluviómetro Cobán', codigo: 'SEN-004', ubicacion: 'Cobán',               descripcion: 'Lluvia acumulada',     fechaInstalacion: ahora, fechaUltimaConexion: ahora, valorActual: 55,  comunidadId: 4, tipoSensorId: 4, estadoSensorId: 3 }
    ];
  }

  // ==================== AVISOS ====================

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }
}
