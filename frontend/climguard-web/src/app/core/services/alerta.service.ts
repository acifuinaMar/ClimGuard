import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Alerta } from '../models/alerta.model';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  private http = inject(HttpClient);

  private get base(): string {
    return `${environment.apiUrl}/Alerta`;
  }

  listar(): Observable<Alerta[]> {
    return this.http.get<Alerta[]>(this.base);
  }

}