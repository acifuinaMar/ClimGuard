import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UmbralForm } from './umbral-form';
import { Umbral } from '../../core/models/umbral.model';
import { UmbralService } from '../../core/services/umbral.service';

@Component({
  selector: 'app-umbrales-page',
  standalone: true,
  imports: [
    CommonModule,
    UmbralForm
    ],
  templateUrl: './umbrales-page.html'
})
export class UmbralesPage implements OnInit {

  private servicio = inject(UmbralService);

  umbrales = signal<Umbral[]>([]);

  cargando = signal(false);

  error = signal('');
  umbralEditando = signal<Umbral | null>(null);

    mostrarFormulario = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {

        this.cargando.set(true);

        this.error.set('');

        this.servicio.listar().subscribe({

            next: lista => {

            this.umbrales.set(lista);

            this.cargando.set(false);

            },

            error: () => {

            this.error.set('No se pudieron cargar los umbrales.');

            this.cargando.set(false);

            }

        });

    }

    nombreTipoSensor(tipo: number): string {

  switch (tipo) {

    case 1:
      return 'Temperatura';

    case 2:
      return 'Humedad';

    case 3:
      return 'Viento';

    case 4:
      return 'Lluvia';

    case 5:
      return 'Nivel de Río';

    default:
      return 'Desconocido';

  }

}

unidadTipoSensor(tipo: number): string {

  switch (tipo) {

    case 1:
      return '°C';

    case 2:
      return '%';

    case 3:
      return 'km/h';

    case 4:
      return 'mm';

    case 5:
      return 'm';

    default:
      return '';

  }

}

editar(umbral: Umbral): void {

  this.umbralEditando.set(umbral);

  this.mostrarFormulario.set(true);

}

cancelarEdicion(): void {

  this.mostrarFormulario.set(false);

  this.umbralEditando.set(null);

}

guardar(umbral: Umbral): void {

  this.servicio.actualizar(umbral).subscribe({

    next: () => {

      this.mostrarFormulario.set(false);

      this.umbralEditando.set(null);

      this.cargar();

    },

    error: () => {

      this.error.set('No se pudo actualizar el umbral.');

    }

  });

}
}
