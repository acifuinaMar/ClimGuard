import { Component, computed, inject, input, output, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sensor, ESTADOS_SENSOR, ESTADO_SENSOR_ACTIVO } from '../../core/models/sensor.model';

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

  formulario = this.fb.nonNullable.group({
    nombre:         ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    codigo:         ['', [Validators.required, Validators.maxLength(40)]],
    tipoSensorId:   [1,  [Validators.required, Validators.min(1)]],
    comunidadId:    [1,  [Validators.required, Validators.min(1)]],
    ubicacion:      ['', [Validators.required, Validators.maxLength(150)]],
    descripcion:    ['', [Validators.required, Validators.maxLength(250)]],
    valorActual:    [0,  [Validators.required]],
    estadoSensorId: [ESTADO_SENSOR_ACTIVO, [Validators.required, Validators.min(1)]]
  });

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
          estadoSensorId: s.estadoSensorId ?? ESTADO_SENSOR_ACTIVO
        });
      }
    });
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
      fechaInstalacion: existente?.fechaInstalacion ?? ahora,
      fechaUltimaConexion: ahora,
      usuarioIng: existente?.usuarioIng,
      fechaIng: existente?.fechaIng,
      usuarioAct: existente?.usuarioAct ?? null,
      fechaAct: existente?.fechaAct ?? null
    });
  }
}
