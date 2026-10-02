import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/* ============================================================
   SERVICIO DE TIEMPO REAL (SignalR)
   ------------------------------------------------------------
   Qué resuelve, y lo que se defiende ante el inge:

   Antes, el dashboard preguntaba al servidor cada 5 segundos "¿hay algo
   nuevo?" (eso se llama POLLING). Es como llamar a alguien cada 5 segundos
   para preguntar si ya llegó.

   Con SignalR es al revés: el SERVIDOR avisa al navegador en el instante
   exacto en que pasa algo (una lectura nueva, una alerta). Es como que te
   manden un mensaje cuando llegan, en vez de estar preguntando.

   Ventaja — análisis lógico:
     - Instantáneo: la alerta aparece apenas se genera, no hasta 5s después.
     - Menos carga: no se hacen cientos de peticiones inútiles "¿algo nuevo?".
     - Es el criterio de "comunicación en tiempo real" de verdad.
   ============================================================ */

/** Forma mínima de lo que empuja el Hub. La afinamos cuando el backend
 *  confirme los DTO exactos; por ahora es flexible. */
export interface LecturaTiempoReal {
  sensorId: number;
  valor: number;
  fechaHora: string;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private auth = inject(AuthService);

  private conexion?: signalR.HubConnection;

  /** Estado de la conexión, para mostrar un indicador en la interfaz. */
  conectado = signal(false);

  /* Canales por evento. Cualquier pantalla se puede "suscribir" a estos
     para reaccionar cuando el servidor empuje algo. */
  nuevaLectura$ = new Subject<LecturaTiempoReal>();
  nuevaAlerta$ = new Subject<unknown>();
  sensorActualizado$ = new Subject<unknown>();

  /**
   * Abre la conexión con el Hub. Se llama una vez, al entrar al sistema.
   * Si el servidor no está disponible, NO rompe la app: solo queda
   * desconectado y el dashboard sigue funcionando con sus datos normales.
   */
  conectar(): void {
    if (this.conexion) return; // ya conectado o conectando

    this.conexion = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        // Manda el token JWT para que el Hub sepa quién se conecta.
        accessTokenFactory: () => this.auth.token() ?? ''
      })
      .withAutomaticReconnect() // si se cae la red, reintenta solo
      .build();

    // --- Enganchar los eventos que el backend promete emitir ---
    this.conexion.on('NuevaLectura', (dato: LecturaTiempoReal) => this.nuevaLectura$.next(dato));
    this.conexion.on('NuevaAlerta', (dato: unknown) => this.nuevaAlerta$.next(dato));
    this.conexion.on('SensorActualizado', (dato: unknown) => this.sensorActualizado$.next(dato));

    // --- Estado de conexión ---
    this.conexion.onreconnected(() => this.conectado.set(true));
    this.conexion.onreconnecting(() => this.conectado.set(false));
    this.conexion.onclose(() => this.conectado.set(false));

    this.conexion.start()
      .then(() => this.conectado.set(true))
      .catch(() => {
        // El servidor no expone el Hub todavía, o está caído. No pasa nada:
        // el dashboard sigue con su actualización normal.
        this.conectado.set(false);
      });
  }

  /** Cierra la conexión (al cerrar sesión). */
  desconectar(): void {
    this.conexion?.stop().catch(() => { /* ignorar */ });
    this.conexion = undefined;
    this.conectado.set(false);
  }
}
