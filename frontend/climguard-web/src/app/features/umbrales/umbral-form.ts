import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Umbral } from '../../core/models/umbral.model';

@Component({
  selector: 'app-umbral-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './umbral-form.html'
})

export class UmbralForm {

  umbral = input<Umbral | null>(null);

  guardar = output<Umbral>();

  cancelar = output<void>();

  formulario;

  constructor(
    private fb: FormBuilder
  ) {

    this.formulario = this.fb.group({

      valorPrecaucion: [0, Validators.required],

      valorAlerta: [0, Validators.required],

      valorEmergencia: [0, Validators.required]

    });

    effect(() => {

      const dato = this.umbral();

      if (!dato) return;

      this.formulario.patchValue({

        valorPrecaucion: dato.valorPrecaucion,

        valorAlerta: dato.valorAlerta,

        valorEmergencia: dato.valorEmergencia

      });

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

  enviar(): void {
    console.log('Entré a enviar');
    const dato = this.umbral();

    if (!dato) return;

    if (this.formulario.invalid) {

      this.formulario.markAllAsTouched();

      return;

    }

    this.guardar.emit({

      umbralId: dato.umbralId,

      tipoSensorId: dato.tipoSensorId,

      valorPrecaucion: this.formulario.value.valorPrecaucion!,

      valorAlerta: this.formulario.value.valorAlerta!,

      valorEmergencia: this.formulario.value.valorEmergencia!

    });

  }

}