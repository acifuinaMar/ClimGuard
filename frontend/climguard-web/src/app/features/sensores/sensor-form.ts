import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Sensor } from '../../core/models/sensor.model';

/**
 * Ventana modal para crear o editar un sensor.
 *
 * Es un componente HIJO: no sabe nada de la API ni de la lista. Solo recibe
 * un sensor (o nada, si es alta nueva) y avisa hacia afuera cuando el usuario
 * guarda o cancela. El padre decide qué hacer con eso.
 *
 * Esa separación es lo que lo hace reutilizable y fácil de probar.
 */
@Component({
  selector: 'app-sensor-form',
  imports: [ReactiveFormsModule],
  templateUrl: './sensor-form.html',
  styleUrl: './sensor-form.scss'
})
export class SensorForm {
  private fb = inject(FormBuilder);

  /** ENTRADA: el sensor a editar. Si viene null, es un alta nueva. */
  sensor = input<Sensor | null>(null);

  /** ENTRADA: para mostrar "Guardando…" mientras el padre llama a la API. */
  guardando = input<boolean>(false);

  /** SALIDAS: avisos hacia el componente padre. */
  guardar = output<Sensor>();
  cancelar = output<void>();

  esEdicion = computed(() => this.sensor() !== null);
  titulo = computed(() => this.esEdicion() ? 'Editar sensor' : 'Nuevo sensor');

  /** Los tipos que maneja el enunciado. Cuando la API exponga el catálogo
   *  TipoSensor, esta lista se reemplaza por una consulta. */
  tipos = [
    { id: 1, nombre: 'Temperatura' },
    { id: 2, nombre: 'Nivel de río' },
    { id: 3, nombre: 'Lluvia' },
    { id: 4, nombre: 'Viento' },
    { id: 5, nombre: 'Humedad' }
  ];

  formulario = this.fb.nonNullable.group({
    nombre:       ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    tipoSensorId: [1,  [Validators.required, Validators.min(1)]],
    comunidadId:  [1,  [Validators.required, Validators.min(1)]],
    valorActual:  [0,  [Validators.required]],
    activo:       [true]
  });

  get nombre() { return this.formulario.controls.nombre; }

  constructor() {
    // Cuando el padre nos pasa un sensor, llenamos el formulario con sus datos.
    // Se usa un efecto implícito: al cambiar la entrada, recalculamos.
    queueMicrotask(() => {
      const s = this.sensor();
      if (s) {
        this.formulario.patchValue({
          nombre: s.nombre,
          tipoSensorId: s.tipoSensorId,
          comunidadId: s.comunidadId,
          valorActual: s.valorActual,
          activo: s.activo
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

    // Se arma el objeto COMPLETO que espera la API, no solo los campos del
    // formulario. Si mandáramos menos, el servidor podría borrar los demás.
    this.guardar.emit({
      sensorId: existente?.sensorId ?? 0,
      comunidadId: v.comunidadId,
      tipoSensorId: v.tipoSensorId,
      nombre: v.nombre.trim(),
      valorActual: v.valorActual,
      activo: v.activo,
      fechaInstalacion: existente?.fechaInstalacion ?? ahora,
      ultimaActualizacion: ahora
    });
  }
}
