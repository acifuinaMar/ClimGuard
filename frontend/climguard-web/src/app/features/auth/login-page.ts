import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);

  entrando = signal(false);
  error = signal<string | null>(null);
  verClave = signal(false);

  /**
   * FORMULARIO REACTIVO.
   *
   * Se define en TypeScript, no en el HTML. La ventaja: las reglas de
   * validación viven en un solo lugar y se pueden probar sin abrir el
   * navegador. Es lo que pide el enunciado para los formularios.
   */
  formulario = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    password:      ['', [Validators.required, Validators.minLength(6)]]
  });

  /** Atajos para el HTML, para no repetir formulario.controls por todos lados. */
  get usuario()  { return this.formulario.controls.nombreUsuario; }
  get password() { return this.formulario.controls.password; }

  alternarClave() { this.verClave.update(v => !v); }

  enviar(): void {
    // Si ya hay un intento en curso, ignoramos el segundo. Evita que un
    // doble clic mande dos peticiones y cree dos sesiones.
    if (this.entrando()) return;

    this.error.set(null);

    // Si el formulario está inválido, marcamos todo como "tocado" para que
    // aparezcan los mensajes de error debajo de cada campo.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.entrando.set(true);

    this.auth.iniciarSesion(this.formulario.getRawValue()).subscribe({
      next: () => {
        // Si la guarda nos mandó aquí, volvemos a donde el usuario quería ir.
        const destino = this.ruta.snapshot.queryParamMap.get('destino') ?? '/panel';
        this.router.navigateByUrl(destino);
      },
      error: (e) => {
        this.entrando.set(false);
        this.error.set(e?.message ?? 'No se pudo iniciar sesión.');
      }
    });
  }
}
