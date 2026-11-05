import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProveedorOAuth } from '../../core/models/sesion.model';

/** Motivos fijos que devuelve el servidor en ?oauth_error=… (nunca texto del proveedor). */
const MENSAJES_OAUTH: Record<string, string> = {
  not_registered: 'Tu cuenta externa no está registrada en ClimGuard. Pide acceso a un administrador.',
  account_disabled: 'Tu cuenta está desactivada. Contacta a un administrador.',
  email_not_verified: 'El proveedor no confirmó un correo verificado para tu cuenta.',
  domain_not_allowed: 'El dominio de tu correo no está autorizado para registrarse.',
  identity_in_use: 'Esa cuenta externa ya está vinculada a otro usuario.',
  provider_error: 'El proveedor canceló o rechazó el inicio de sesión.',
  provider_unavailable: 'No se pudo contactar al proveedor. Intenta de nuevo.',
  invalid_token: 'No se pudo validar la respuesta del proveedor.',
  invalid_state: 'La sesión de inicio expiró o no es válida. Intenta de nuevo.',
  exchange_failed: 'El código de acceso expiró o ya fue usado. Intenta de nuevo.',
  unknown_provider: 'Proveedor no disponible.'
};

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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

  /** Botones “Continuar con …”: solo los proveedores que el servidor tiene configurados. */
  proveedores = signal<ProveedorOAuth[]>([]);

  constructor() {
    const motivo = this.ruta.snapshot.queryParamMap.get('oauth_error');
    if (motivo) this.error.set(MENSAJES_OAUTH[motivo] ?? 'No se pudo iniciar sesión con el proveedor externo.');
    this.auth.proveedoresOAuth().subscribe(p => this.proveedores.set(p));
  }

  entrarCon(proveedor: string): void {
    if (this.entrando()) return;
    this.entrando.set(true);
    this.auth.iniciarOAuth(proveedor);
  }

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
