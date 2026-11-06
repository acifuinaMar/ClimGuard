import { Component, computed, inject, input, output, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ReglaAlerta } from '../../core/models/regla-alerta.model';
import { NivelAlertaCat, TipoFenomenoCat, TipoSensorCat } from '../../core/models/catalogo.model';

/**
 * Ventana modal para crear o editar una regla de alerta. Componente hijo: recibe
 * la regla (o null si es alta) y los catálogos (niveles, fenómenos, tipos de
 * sensor), y avisa al guardar o cancelar. No sabe nada de la API.
 */
@Component({
  selector: 'app-regla-form',
  imports: [ReactiveFormsModule],
  templateUrl: './regla-form.html',
  styleUrl: './regla-form.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ReglaForm {
  private fb = inject(FormBuilder);

  regla = input<ReglaAlerta | null>(null);
  niveles = input<NivelAlertaCat[]>([]);
  fenomenos = input<TipoFenomenoCat[]>([]);
  tiposSensor = input<TipoSensorCat[]>([]);
  guardando = input<boolean>(false);

  guardar = output<ReglaAlerta>();
  cancelar = output<void>();

  esEdicion = computed(() => this.regla() !== null);
  titulo = computed(() => this.esEdicion() ? 'Editar regla de alerta' : 'Nueva regla de alerta');

  /** Regla LEGADA: creada con la semántica anterior (min/max = rango normal; alerta FUERA del rango). */
  legado = computed(() => !!this.regla()?.requiereRevision);
  /** Mensaje de validación al intentar convertir sin cambiar el intervalo. */
  errorConversion = signal<string | null>(null);

  /** ¿Los campos mínimo/máximo se interpretan con la semántica nueva (intervalo que ACTIVA la alerta)? */
  semanticaNueva(): boolean {
    return !this.legado() || this.formulario.controls.convertir.value;
  }

  formulario = this.fb.nonNullable.group({
    nombre:         ['', [Validators.required, Validators.minLength(3)]],
    tipoSensorId:   [1,  [Validators.required, Validators.min(1)]],
    valorMin:       [0,  [Validators.required]],
    valorMax:       [0,  [Validators.required]],
    nivelAlertaId:  [1,  [Validators.required, Validators.min(1)]],
    tipoFenomenoId: [1,  [Validators.required, Validators.min(1)]],
    mensaje:        ['', [Validators.required]],
    activo:         [true],
    convertir:      [false]
  }, { validators: [ReglaForm.rangoValido] });

  /** El backend rechaza min > max; se avisa antes de enviar. */
  static rangoValido(g: AbstractControl): ValidationErrors | null {
    const min = Number(g.get('valorMin')?.value), max = Number(g.get('valorMax')?.value);
    return Number.isFinite(min) && Number.isFinite(max) && min > max ? { rangoInvalido: true } : null;
  }

  constructor() {
    // Cuando llega una regla a editar, se rellena el formulario. Si es null (alta
    // nueva), el formulario queda con sus valores por defecto.
    effect(() => {
      const r = this.regla();
      if (!r) return;
      this.formulario.patchValue({
        nombre: r.nombre,
        tipoSensorId: r.tipoSensorId,
        valorMin: r.valorMin,
        valorMax: r.valorMax,
        nivelAlertaId: r.nivelAlertaId,
        tipoFenomenoId: r.tipoFenomenoId,
        mensaje: r.mensaje,
        activo: r.activo
      });
    });
  }

  get nombre()  { return this.formulario.controls.nombre; }
  get mensaje() { return this.formulario.controls.mensaje; }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const v = this.formulario.getRawValue();
    const ex = this.regla();

    // Convertir una regla legada a la semántica nueva exige un intervalo NUEVO: los valores actuales son el rango NORMAL.
    const convertir = this.legado() && v.convertir;
    if (convertir && ex && Number(v.valorMin) === ex.valorMin && Number(v.valorMax) === ex.valorMax) {
      this.errorConversion.set('Para convertir la regla indique el intervalo que ACTIVA la alerta: los valores actuales son el rango normal de la versión anterior.');
      return;
    }
    this.errorConversion.set(null);

    // Los <select> devuelven texto; se convierten a número para el backend.
    this.guardar.emit({
      reglaAlertaId: ex?.reglaAlertaId ?? 0,
      nombre: v.nombre.trim(),
      tipoSensorId: Number(v.tipoSensorId),
      valorMin: Number(v.valorMin),
      valorMax: Number(v.valorMax),
      nivelAlertaId: Number(v.nivelAlertaId),
      tipoFenomenoId: Number(v.tipoFenomenoId),
      mensaje: v.mensaje.trim(),
      activo: v.activo,
      convertirSemantica: convertir,
      // Auditoría: se conserva la original al editar; el servicio completa el resto.
      usuarioIng: ex?.usuarioIng,
      fechaIng: ex?.fechaIng,
      usuarioAct: ex?.usuarioAct ?? null,
      fechaAct: ex?.fechaAct ?? null
    });
  }
}
