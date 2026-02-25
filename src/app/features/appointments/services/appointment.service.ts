import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus, CreateAppointmentDto } from '../models/appointment.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/appointments`;

  // ── PÚBLICO ───────────────────────────────────────────────────────────
  createAppointment(dto: CreateAppointmentDto): Observable<Appointment> {
    return this.http.post<Appointment>(this.base, dto);
  }

  // ── ADMIN ─────────────────────────────────────────────────────────────
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.base);
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.base}/${id}/status`, { status });
  }

  assignVeterinarian(id: string, veterinarian: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.base}/${id}/assign`, { veterinarian });
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}