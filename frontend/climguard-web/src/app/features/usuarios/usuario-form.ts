import { Component, computed, inject, input, output, effect, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuario, GuardarUsuario, ROLES } from '../../core/models/usuario.model';

/**
 * Ventana modal para crear o editar un usuario (RF-ADM-49+). Componente hijo:
 * recibe un usuario (o null si es alta) y avisa al guardar o cancelar.
 * No sabe nada de la API.
 */
@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class UsuarioForm {
  private fb = inject(FormBuilder);

  usuario = input<Usuario | null>(null);
  guardando = input<boolean>(false);

  guardar = output<GuardarUsuario>();
  cancelar = output<void>();

  roles = ROLES;
  esEdicion = computed(() => this.usuario() !== null);
  titulo = computed(() => this.esEdicion() ? 'Editar usuario' : 'Nuevo usuario');
  verClave = signal(false);

  formulario = this.fb.nonNullable.group({
    nombreCompleto: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    nombreUsuario:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    password:       ['', [Validators.required, Validators.minLength(6)]],
    rolId:          [2,  [Validators.required, Validators.min(1)]],
    activo:         [true]
  });

  get nombreCompleto() { return this.formulario.controls.nombreCompleto; }
  get nombreUsuario()  { return this.formulario.controls.nombreUsuario; }
  get password()       { return this.formulario.controls.password; }

  constructor() {
    effect(() => {
      const u = this.usuario();
      if (u) {
        // La contraseña NO se rellena (no la conocemos): en edición se escribe de nuevo.
        this.formulario.patchValue({
          nombreCompleto: u.nombreCompleto,
          nombreUsuario: u.nombreUsuario,
          rolId: u.rolId,
          activo: u.activo
        });
      }
    });
  }

  alternarClave() { this.verClave.update(v => !v); }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const v = this.formulario.getRawValue();
    this.guardar.emit({
      usuarioId: this.usuario()?.usuarioId ?? 0,
      nombreCompleto: v.nombreCompleto.trim(),
      nombreUsuario: v.nombreUsuario.trim(),
      password: v.password,
      rolId: Number(v.rolId),
      activo: v.activo
    });
  }
}
