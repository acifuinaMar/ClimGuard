import { Injectable, signal } from '@angular/core';

/* ============================================================
   SERVICIO DE ALARMA — aviso visual y sonoro de emergencia
   ------------------------------------------------------------
   Qué resuelve, y lo que se defiende ante el inge:

   Un sistema de alerta TEMPRANA no sirve si el operador no se da cuenta.
   Por eso, cuando entra una alerta de nivel Rojo (emergencia), el sistema:
     1. Hace SONAR un pitido (para llamar la atención aunque no mires).
     2. Muestra un AVISO visual que destella.

   El sonido se genera con Web Audio API — no usa ningún archivo .mp3, así
   que funciona sin internet y no pesa nada en la app.

   Detalle de análisis lógico: los navegadores bloquean el sonido hasta que
   el usuario interactúa con la página. Como el operador YA hizo clic para
   iniciar sesión, el sonido queda habilitado. Por eso la alarma funciona
   dentro del sistema (no en la pantalla de login).
   ============================================================ */

@Injectable({ providedIn: 'root' })
export class AlarmaService {
  /** ¿Hay una emergencia activa en pantalla? (para el aviso visual) */
  activa = signal(false);

  /** El mensaje de la emergencia actual. */
  mensaje = signal('');

  private audioContext?: AudioContext;
  private temporizador?: ReturnType<typeof setTimeout>;

  /**
   * Dispara la alarma: suena y muestra el aviso por unos segundos.
   * @param mensaje texto a mostrar en el aviso
   */
  disparar(mensaje: string): void {
    this.mensaje.set(mensaje);
    this.activa.set(true);
    this.sonar();

    // El aviso se oculta solo después de 8 segundos.
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.activa.set(false), 8000);
  }

  /** Oculta el aviso manualmente (botón "entendido"). */
  silenciar(): void {
    this.activa.set(false);
    clearTimeout(this.temporizador);
  }

  /**
   * Genera un pitido de alarma con Web Audio (dos tonos, como una sirena).
   * No necesita ningún archivo de sonido.
   */
  private sonar(): void {
    try {
      this.audioContext ??= new AudioContext();
      const ctx = this.audioContext;

      // Dos "bip" seguidos, para que suene a alarma y no a notificación suave.
      [0, 0.25].forEach((inicio) => {
        const osc = ctx.createOscillator();
        const vol = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 880; // tono agudo, llamativo
        vol.gain.value = 0.0001;

        osc.connect(vol);
        vol.connect(ctx.destination);

        const t = ctx.currentTime + inicio;
        // Subida y bajada suave del volumen para que no truene
        vol.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
        vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {
      // Si el navegador bloquea el audio, no pasa nada: el aviso visual queda.
    }
  }
}
