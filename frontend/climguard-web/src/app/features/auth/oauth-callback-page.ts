import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Destino al que el servidor redirige tras Google/GitHub:
 *   /auth/callback#code=<código de un solo uso>   → se canjea por POST y se entra al panel
 *   /auth/callback#linked=1                         → la cuenta quedó vinculada (ya había sesión)
 * El código va en el FRAGMENTO (no llega a logs del servidor ni al Referer) y se borra de la barra
 * de direcciones antes de hacer cualquier llamada. El JWT nunca viaja en la URL.
 */
@Component({
  selector: 'app-oauth-callback-page',
  template: `<main style="min-height:100vh;display:grid;place-items:center;font-family:inherit"><p role="status">{{ mensaje() }}</p></main>`
})
export class OauthCallbackPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  mensaje = signal('Completando el inicio de sesión…');

  ngOnInit(): void {
    const frag = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const code = frag.get('code');
    const vinculada = frag.get('linked') === '1';
    // Limpiar el fragmento YA: que no quede en historial ni se pueda copiar de la barra.
    window.history.replaceState(null, '', window.location.pathname);

    if (vinculada && this.auth.autenticado()) { this.router.navigateByUrl('/panel'); return; }
    if (!code) { this.fallar('invalid_state'); return; }

    this.auth.canjearCodigoOAuth(code).subscribe({
      next: () => this.router.navigateByUrl('/panel'),
      error: () => this.fallar('exchange_failed')
    });
  }

  private fallar(motivo: string): void {
    this.mensaje.set('No se pudo completar el inicio de sesión.');
    this.router.navigate(['/login'], { queryParams: { oauth_error: motivo } });
  }
}
