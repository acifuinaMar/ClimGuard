import { Component, computed, inject, input, output, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sensor, ESTADOS_SENSOR, ESTADO_SENSOR_ACTIVO, ORIGENES_SENSOR, OrigenSensor } from '../../core/models/sensor.model';
import { Comunidad } from '../../core/models/comunidad.model';

/**
 * Ventana modal para crear o editar un sensor. Componente hijo: recibe un sensor
 * (o nada, si es alta) y avisa al guardar o cancelar. No sabe nada de la API.
 */
@Component({
  selector: 'app-sensor-form',
  imports: [ReactiveFormsModule],
  templateUrl: './sensor-form.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sensor-form.scss'
})
export class SensorForm {
  private fb = inject(FormBuilder);

  sensor = input<Sensor | null>(null);
  guardando = input<boolean>(false);
  /** Comunidades registradas (las carga la página). El sensor guarda solo el id. */
  comunidades = input<Comunidad[]>([]);

  guardar = output<Sensor>();
  cancelar = output<void>();

  esEdicion = computed(() => this.sensor() !== null);
  titulo = computed(() => this.esEdicion() ? 'Editar sensor' : 'Nuevo sensor');

  /** Tipos de sensor (mismos ids que usa el cálculo de nivel). */
  tipos = [
    { id: 1, nombre: 'Temperatura' },
    { id: 2, nombre: 'Humedad' },
    { id: 3, nombre: 'Viento' },
    { id: 4, nombre: 'Lluvia' },
    { id: 5, nombre: 'Nivel de río' }
  ];

  /** Catálogo de estados del sensor. */
  estados = ESTADOS_SENSOR;

  /** Origen de las lecturas (físico o simulado). Se elige de forma explícita al crear. */
  origenes = ORIGENES_SENSOR;

  formulario = this.fb.nonNullable.group({
    nombre:         ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    codigo:         ['', [Validators.required, Validators.maxLength(40)]],
    tipoSensorId:   [1,  [Validators.required, Validators.min(1)]],
    // 0 = sin elegir: obliga a seleccionar una comunidad del desplegable.
    comunidadId:    [0,  [Validators.required, Validators.min(1)]],
    ubicacion:      ['', [Validators.required, Validators.maxLength(150)]],
    descripcion:    ['', [Validators.required, Validators.maxLength(250)]],
    valorActual:    [0,  [Validators.required]],
    estadoSensorId: [ESTADO_SENSOR_ACTIVO, [Validators.required, Validators.min(1)]],
    // Vacío al crear a propósito: obliga a decidir si es un dispositivo real o simulado.
    origen:         ['' as OrigenSensor | '', [Validators.required]]
  });

  get origenCtrl() { return this.formulario.controls.origen; }

  /** Texto de ayuda del origen elegido. */
  ayudaOrigen = computed(() => ORIGENES_SENSOR.find(o => o.valor === this.origenSel())?.ayuda ?? '');
  private origenSel = signal<OrigenSensor | ''>('');

  /**
   * Opciones del desplegable: comunidades activas, ordenadas por nombre. Al editar, la comunidad
   * actual del sensor se incluye aunque esté inactiva, para no cambiarla sin querer.
   */
  opcionesComunidad = computed(() => {
    const actual = this.sensor()?.comunidadId;
    return this.comunidades()
      .filter(c => c.activo || c.comunidadId === actual)
      .sort((a, b) => a.nombreComunidad.localeCompare(b.nombreComunidad, 'es'));
  });

  /** Id del sensor en edición que no aparece en la lista (borrada o no se pudo cargar). */
  comunidadFaltante = computed(() => {
    const actual = this.sensor()?.comunidadId;
    return actual && !this.comunidades().some(c => c.comunidadId === actual) ? actual : null;
  });

  get comunidad()   { return this.formulario.controls.comunidadId; }
  get nombre()      { return this.formulario.controls.nombre; }
  get codigo()      { return this.formulario.controls.codigo; }
  get ubicacion()   { return this.formulario.controls.ubicacion; }
  get descripcion() { return this.formulario.controls.descripcion; }

  constructor() {
    effect(() => {
      const s = this.sensor();
      if (s) {
        this.formulario.patchValue({
          nombre: s.nombre,
          codigo: s.codigo,
          tipoSensorId: s.tipoSensorId,
          comunidadId: s.comunidadId,
          ubicacion: s.ubicacion,
          descripcion: s.descripcion,
          valorActual: s.valorActual,
          estadoSensorId: s.estadoSensorId ?? ESTADO_SENSOR_ACTIVO,
          origen: s.origen ?? ''
        });
        this.origenSel.set(s.origen ?? '');
      }
    });
  }

  alCambiarOrigen(): void {
    this.origenSel.set(this.formulario.controls.origen.value);
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const v = this.formulario.getRawValue();
    const existente = this.sensor();
    const ahora = new Date().toISOString();

    this.guardar.emit({
      sensorId: existente?.sensorId ?? 0,
      nombre: v.nombre.trim(),
      codigo: v.codigo.trim(),
      ubicacion: v.ubicacion.trim(),
      descripcion: v.descripcion.trim(),
      tipoSensorId: Number(v.tipoSensorId),
      comunidadId: Number(v.comunidadId),
      valorActual: Number(v.valorActual),
      estadoSensorId: Number(v.estadoSensorId),
      origen: v.origen as OrigenSensor,
      fechaInstalacion: existente?.fechaInstalacion ?? ahora,
      fechaUltimaConexion: ahora,
      usuarioIng: existente?.usuarioIng,
      fechaIng: existente?.fechaIng,
      usuarioAct: existente?.usuarioAct ?? null,
      fechaAct: existente?.fechaAct ?? null
    });
  }
}
