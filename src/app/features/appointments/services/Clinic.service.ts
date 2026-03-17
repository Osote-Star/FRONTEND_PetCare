import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clinic } from '../models/Clinic.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class ClinicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clinics`;

  getAllClinics(): Observable<Clinic[]> {
    return this.http.get<ApiResponse<Clinic[]>>(this.baseUrl)
      .pipe(
        map(response => {
          console.log('✅ Respuesta completa:', response);
          console.log('✅ Datos de clínicas:', response.data);
          return response.data; // 👈 Extraemos el array del objeto response
        })
      );
  }

  getClinicById(id: string): Observable<Clinic> {
    return this.http.get<ApiResponse<Clinic>>(`${this.baseUrl}/${id}`)
      .pipe(
        map(response => response.data)
      );
  }
}