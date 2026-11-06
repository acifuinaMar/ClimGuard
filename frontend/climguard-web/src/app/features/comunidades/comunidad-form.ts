import { Component, computed, inject, input, output, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comunidad } from '../../core/models/comunidad.model';
import { DEPARTAMENTOS_GT, PAIS_GT, municipiosDe } from '../../core/data/guatemala';

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

  // ---- Desplegables en cascada (solo para Guatemala) ----
  departamentos = DEPARTAMENTOS_GT.map(d => d.nombre);

  /** Valores elegidos, como señales para recalcular las opciones. */
  private paisSel = signal(PAIS_GT);
  private deptoSel = signal('');
  /** Valores con que llegó la comunidad al editar (para no perderlos si no están en el catálogo). */
  private deptoOriginal = signal('');
  private muniOriginal = signal('');

  /** Con otro país no hay catálogo: departamento y municipio vuelven a ser texto libre. */
  usaCatalogo = computed(() => this.paisSel() === PAIS_GT);

  /** Departamento guardado que no existe en el catálogo (p. ej. escrito sin tilde): se muestra igual. */
  deptoFueraDeCatalogo = computed(() => {
    const d = this.deptoOriginal();
    return d && !this.departamentos.includes(d) ? d : null;
  });

  municipios = computed(() => municipiosDe(this.deptoSel()));

  /** Municipio guardado que no está en la lista del departamento elegido: se muestra igual. */
  muniFueraDeCatalogo = computed(() => {
    const m = this.muniOriginal();
    return m && this.deptoSel() === this.deptoOriginal() && !this.municipios().includes(m) ? m : null;
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
        this.paisSel.set(c.pais);
        this.deptoSel.set(c.departamento);
        this.deptoOriginal.set(c.departamento);
        this.muniOriginal.set(c.municipio);
      }
    });
  }

  alCambiarPais(): void {
    this.paisSel.set(this.formulario.controls.pais.value.trim());
  }

  /** Al cambiar de departamento, el municipio anterior ya no aplica: se limpia. */
  alCambiarDepartamento(): void {
    this.deptoSel.set(this.formulario.controls.departamento.value);
    this.formulario.controls.municipio.setValue('');
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
