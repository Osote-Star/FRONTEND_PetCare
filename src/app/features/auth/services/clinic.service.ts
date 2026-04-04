// features/auth/services/clinic.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Clinic, ApiResponse } from '../models/vet.model';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clinics`;

  getAll(): Observable<Clinic[]> {
    return this.http.get<ApiResponse<Clinic[]>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  getById(id: string): Observable<Clinic> {
    return this.http.get<ApiResponse<Clinic>>(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }
 create(data: { name: string; location: string; schedule: string }): Observable<Clinic> {
    return this.http.post<ApiResponse<Clinic>>(this.baseUrl, data).pipe(
      map(response => response.data)
    );
  }
}