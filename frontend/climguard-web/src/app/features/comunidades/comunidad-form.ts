import { Component, computed, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comunidad } from '../../core/models/comunidad.model';

/**
 * Ventana modal para crear o editar una comunidad.
 * Componente hijo: recibe una comunidad (o null si es alta) y avisa hacia
 * afuera cuando el usuario guarda o cancela. No sabe nada de la API.
 */
@Component({
  selector: 'app-comunidad-form',
  imports: [ReactiveFormsModule],
  templateUrl: './comunidad-form.html',
  styleUrl: './comunidad-form.scss'
})
export class ComunidadForm {
  private fb = inject(FormBuilder);

  comunidad = input<Comunidad | null>(null);
  guardando = input<boolean>(false);

  guardar = output<Comunidad>();
  cancelar = output<void>();

  esEdicion = computed(() => this.comunidad() !== null);
  titulo = computed(() => this.esEdicion() ? 'Editar comunidad' : 'Nueva comunidad');

  formulario = this.fb.nonNullable.group({
    nombre:      ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    descripcion: ['', [Validators.maxLength(250)]],
    // Latitud real: entre -90 y 90. Longitud: entre -180 y 180.
    // El dato de prueba tenía latitud 100, que no existe en la Tierra.
    latitud:     [0, [Validators.required, Validators.min(-90),  Validators.max(90)]],
    longitud:    [0, [Validators.required, Validators.min(-180), Validators.max(180)]]
  });

  get nombre()   { return this.formulario.controls.nombre; }
  get latitud()  { return this.formulario.controls.latitud; }
  get longitud() { return this.formulario.controls.longitud; }

  constructor() {
    queueMicrotask(() => {
      const c = this.comunidad();
      if (c) {
        this.formulario.patchValue({
          nombre: c.nombre,
          descripcion: c.descripcion,
          latitud: c.latitud,
          longitud: c.longitud
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
    const existente = this.comunidad();
    const hoy = new Date().toISOString().slice(0, 10); // AAAA-MM-DD

    this.guardar.emit({
      comunidadId: existente?.comunidadId ?? 0,
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim(),
      latitud: v.latitud,
      longitud: v.longitud,
      fechaRegistro: existente?.fechaRegistro ?? hoy
    });
  }
}
