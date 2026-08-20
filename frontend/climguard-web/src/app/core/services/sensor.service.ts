import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Sensor } from '../models/sensor.model';

// providedIn: 'root' = existe UNA sola copia en toda la aplicación.
// Cualquier pantalla que lo pida recibe la misma, no una nueva.
@Injectable({ providedIn: 'root' })
export class SensorService {

  // inject() pide la herramienta para hacer llamadas HTTP.
  // No la construimos nosotros: nos la entregan. Eso es inyección de dependencias.
  private http = inject(HttpClient);

  listar(): Observable<Sensor[]> {
    // La dirección NUNCA se escribe a mano: sale de environment.
    // Hoy vale  /datos-prueba/Sensor.json
    // Mañana valdrá  https://loquesea/api/Sensor
    // y esta línea no cambia.
    return this.http.get<Sensor[]>(
      `${environment.apiUrl}/Sensor${environment.sufijoArchivo}`
    );
  }

  simular(): Observable<boolean> {

    return this.http.post<boolean>(
      `${environment.apiUrl}/Sensor/simular`,
      {}
    );
  }
}