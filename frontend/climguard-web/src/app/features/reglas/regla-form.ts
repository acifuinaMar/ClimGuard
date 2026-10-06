import { Component, inject, input, output, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReglaAlerta } from '../../core/models/regla-alerta.model';
import { NivelAlertaCat, TipoFenomenoCat, TipoSensorCat } from '../../core/models/catalogo.model';

/**
 * Ventana modal para EDITAR una regla de alerta. Componente hijo: recibe la regla
 * y los catálogos (niveles, fenómenos, tipos de sensor) y avisa hacia afuera cuando
 * el usuario guarda o cancela. No sabe nada de la API.
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

  regla = input.required<ReglaAlerta>();
  niveles = input<NivelAlertaCat[]>([]);
  fenomenos = input<TipoFenomenoCat[]>([]);
  tiposSensor = input<TipoSensorCat[]>([]);
  guardando = input<boolean>(false);

  guardar = output<ReglaAlerta>();
  cancelar = output<void>();

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
    // Cuando llega la regla a editar, se rellena el formulario con sus valores.
    effect(() => {
      const r = this.regla();
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

    // Los <select> devuelven texto; los convertimos a número para que coincida
    // con lo que espera el backend.
    this.guardar.emit({
      reglaAlertaId: this.regla().reglaAlertaId,
      nombre: v.nombre.trim(),
      tipoSensorId: Number(v.tipoSensorId),
      valorMin: Number(v.valorMin),
      valorMax: Number(v.valorMax),
      nivelAlertaId: Number(v.nivelAlertaId),
      tipoFenomenoId: Number(v.tipoFenomenoId),
      mensaje: v.mensaje.trim(),
      activo: v.activo
    });
  }
}
