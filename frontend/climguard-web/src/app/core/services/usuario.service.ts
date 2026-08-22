import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';

/**
 * Todo el trato con el endpoint /api/Usuario vive aquí.
 * Los componentes nunca llaman a la API por su cuenta: le piden a este servicio.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      `${environment.apiUrl}/Usuario${environment.sufijoArchivo}`
    );
  }

  obtener(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${environment.apiUrl}/Usuario/${id}${environment.sufijoArchivo}`
    );
  }
}
