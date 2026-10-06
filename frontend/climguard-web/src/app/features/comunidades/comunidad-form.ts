import { Component, computed, inject, input, output, effect, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
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
    nombreComunidad: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    pais:            ['Guatemala', [Validators.required, Validators.maxLength(60)]],
    departamento:    ['', [Validators.required, Validators.maxLength(60)]],
    municipio:       ['', [Validators.required, Validators.maxLength(60)]],
    descripcion:     ['', [Validators.maxLength(250)]],
    // Latitud real: entre -90 y 90. Longitud: entre -180 y 180.
    latitud:         [0, [Validators.required, Validators.min(-90),  Validators.max(90)]],
    longitud:        [0, [Validators.required, Validators.min(-180), Validators.max(180)]],
    activo:          [true]
  });

  get nombreComunidad() { return this.formulario.controls.nombreComunidad; }
  get departamento()    { return this.formulario.controls.departamento; }
  get municipio()       { return this.formulario.controls.municipio; }
  get latitud()         { return this.formulario.controls.latitud; }
  get longitud()        { return this.formulario.controls.longitud; }

  constructor() {
    // Cuando llega una comunidad a editar, se rellena el formulario.
    effect(() => {
      const c = this.comunidad();
      if (c) {
        this.formulario.patchValue({
          nombreComunidad: c.nombreComunidad,
          pais: c.pais,
          departamento: c.departamento,
          municipio: c.municipio,
          descripcion: c.descripcion ?? '',
          latitud: c.latitud,
          longitud: c.longitud,
          activo: c.activo
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

    this.guardar.emit({
      comunidadId: existente?.comunidadId ?? 0,
      nombreComunidad: v.nombreComunidad.trim(),
      descripcion: v.descripcion.trim() || null,
      pais: v.pais.trim(),
      departamento: v.departamento.trim(),
      municipio: v.municipio.trim(),
      latitud: v.latitud,
      longitud: v.longitud,
      activo: v.activo,
      // Auditoría: se conserva lo existente; el servicio completa el resto.
      usuarioIng: existente?.usuarioIng,
      fechaIng: existente?.fechaIng,
      usuarioAct: existente?.usuarioAct ?? null,
      fechaAct: existente?.fechaAct ?? null
    });
  }
}
