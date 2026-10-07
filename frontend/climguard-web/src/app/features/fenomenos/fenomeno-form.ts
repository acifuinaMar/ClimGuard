import { Component, computed, inject, input, output, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoFenomeno } from '../../core/models/tipo-fenomeno.model';

/**
 * Ventana modal para crear o editar un tipo de fenómeno. Componente hijo:
 * recibe el tipo (o null si es alta) y avisa al guardar o cancelar.
 */
@Component({
  selector: 'app-fenomeno-form',
  imports: [ReactiveFormsModule],
  templateUrl: './fenomeno-form.html',
  styleUrl: './fenomeno-form.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class FenomenoForm {
  private fb = inject(FormBuilder);

  tipo = input<TipoFenomeno | null>(null);
  guardando = input<boolean>(false);

  guardar = output<TipoFenomeno>();
  cancelar = output<void>();

  esEdicion = computed(() => this.tipo() !== null);
  titulo = computed(() => this.esEdicion() ? 'Editar tipo de fenómeno' : 'Nuevo tipo de fenómeno');

  formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    activo: [true]
  });

  get nombre() { return this.formulario.controls.nombre; }

  constructor() {
    effect(() => {
      const t = this.tipo();
      if (t) {
        this.formulario.patchValue({ nombre: t.nombre, activo: t.activo });
      }
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const v = this.formulario.getRawValue();
    const existente = this.tipo();

    this.guardar.emit({
      tipoFenomenoId: existente?.tipoFenomenoId ?? 0,
      nombre: v.nombre.trim(),
      activo: v.activo,
      usuarioIng: existente?.usuarioIng,
      fechaIng: existente?.fechaIng,
      usuarioAct: existente?.usuarioAct ?? null,
      fechaAct: existente?.fechaAct ?? null
    });
  }
}
