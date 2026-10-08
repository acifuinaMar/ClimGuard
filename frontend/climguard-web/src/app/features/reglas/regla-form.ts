import { Component, computed, inject, input, output, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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

  formulario = this.fb.nonNullable.group({
    nombre:         ['', [Validators.required, Validators.minLength(3)]],
    tipoSensorId:   [1,  [Validators.required, Validators.min(1)]],
    valorMin:       [0,  [Validators.required]],
    valorMax:       [0,  [Validators.required]],
    nivelAlertaId:  [1,  [Validators.required, Validators.min(1)]],
    tipoFenomenoId: [1,  [Validators.required, Validators.min(1)]],
    mensaje:        ['', [Validators.required]],
    activo:         [true]
  });

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
      // Auditoría: se conserva la original al editar; el servicio completa el resto.
      usuarioIng: ex?.usuarioIng,
      fechaIng: ex?.fechaIng,
      usuarioAct: ex?.usuarioAct ?? null,
      fechaAct: ex?.fechaAct ?? null
    });
  }
}
