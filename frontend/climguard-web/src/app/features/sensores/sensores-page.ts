import { Component, inject, signal } from '@angular/core';
import { Sensor } from '../../core/models/sensor.model';
import { SensorService } from '../../core/services/sensor.service';

@Component({
  selector: 'app-sensores-page',
  templateUrl: './sensores-page.html',
  styleUrl: './sensores-page.scss'
})
export class SensoresPage {
  private servicio = inject(SensorService);

  // Una señal es una caja que avisa a la pantalla cuando su contenido cambia.
  // No hay que refrescar nada a mano: Angular lo detecta.
  sensores = signal<Sensor[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor() {
    // subscribe = "cuando lleguen los datos, haz esto".
    // La llamada NO es inmediata: viaja por la red y tarda.
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.sensores.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los sensores.');
        this.cargando.set(false);
      }
    });
  }
}