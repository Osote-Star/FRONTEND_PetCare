// features/appointments/services/appointment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, CreateAppointmentDto, AvailableDate, AvailableSlotsResponse } from '../models/appointment.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/appointments`;

  create(dto: CreateAppointmentDto): Observable<Appointment> {
    console.log('📅 Creando cita:', dto);
    return this.http.post<ApiResponse<Appointment>>(this.baseUrl, dto).pipe(
      map(response => response.data)
    );
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.baseUrl}/mias`).pipe(
      map(response => response.data)
    );
  }

  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(this.baseUrl).pipe(
      map(response => response.data)
    );
  }

  getMyPatients(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.baseUrl}/my-patients`).pipe(
      map(response => response.data)
    );
  }

  getAppointmentById(id: string): Observable<Appointment> {
    return this.http.get<ApiResponse<Appointment>>(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  changeStatus(id_appointment: string, status: string): Observable<Appointment> {
    return this.http.patch<ApiResponse<Appointment>>(`${this.baseUrl}/${id_appointment}/status`, { status }).pipe(
      map(response => response.data)
    );
  }

  updateAppointment(id_appointment: string, dto: any): Observable<Appointment> {
    return this.http.put<ApiResponse<Appointment>>(`${this.baseUrl}/${id_appointment}`, dto).pipe(
      map(response => response.data)
    );
  }

  // ✅ NUEVOS MÉTODOS PARA FECHAS Y HORARIOS
  getAvailableDates(clinicId: string, veterinarianId: string): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/available-dates`, {
      params: { clinicId, veterinarianId }
    }).pipe(map(response => response.data));
  }

  getAvailableSlots(clinicId: string, veterinarianId: string, date: string): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/available-slots`, {
      params: { clinicId, veterinarianId, date }
    }).pipe(map(response => response.data));
  }
}