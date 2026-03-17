// src/app/features/appointments/services/appointmentservice.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Appointment, 
  CreateAppointmentDto,
  CambiarStatusDto,
  AssignVetDto
} from '../models/appointment.model';

import { ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AppointmentService {

  private api = inject(ApiService);

  private endpoint = `${environment.apiUrl}/appointments`;

  getMyAppointments() {
    return this.api.get<Appointment[]>(`${this.endpoint}/mias`);
  }

  getAll() {
    return this.api.get<Appointment[]>(this.endpoint);
  }

  getMyPatients() {
    return this.api.get<Appointment[]>(`${this.endpoint}/my-patients`);
  }

  create(dto: CreateAppointmentDto) {
    return this.api.post<Appointment>(this.endpoint, dto);
  }

  changeStatus(id: string, status: string) {
    return this.api.patch<Appointment>(`${this.endpoint}/${id}/status`, { status });
  }
  

}