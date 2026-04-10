// features/appointments/services/appointment.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, CreateAppointmentDto } from '../models/appointment.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Appointments`;

  /**
   * Maneja errores de las peticiones
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error al procesar la solicitud';

    if (error.status === 400) {
      errorMessage = error.error?.message || 'Datos inválidos';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Por favor inicia sesión nuevamente';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Crea una nueva cita
   */
  create(dto: CreateAppointmentDto): Observable<Appointment> {
    // ✅ Validaciones básicas
    if (!dto.id_user) throw new Error('ID de usuario requerido');
    if (!dto.id_pet) throw new Error('ID de mascota requerido');
    if (!dto.id_clinic) throw new Error('ID de clínica requerido');
    if (!dto.id_veterinarian) throw new Error('ID de veterinario requerido');
    if (!dto.appointment_date) throw new Error('Fecha de cita requerida');
    if (!dto.service) throw new Error('Servicio requerido');
    if (dto.cost < 0) throw new Error('El costo no puede ser negativo');

    return this.http.post<ApiResponse<Appointment>>(this.baseUrl, dto).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene las citas del usuario actual
   */
  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.baseUrl}/mias`).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene todas las citas (solo admin)
   */
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(this.baseUrl).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene los pacientes del veterinario (solo veterinario)
   */
  getMyPatients(): Observable<Appointment[]> {
    return this.http.get<ApiResponse<Appointment[]>>(`${this.baseUrl}/my-patients`).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene una cita por ID
   */
  getAppointmentById(id: string): Observable<Appointment> {
    if (!id) throw new Error('ID de cita requerido');

    return this.http.get<ApiResponse<Appointment>>(`${this.baseUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Cambia el estado de una cita
   */
  changeStatus(id_appointment: string, status: string): Observable<Appointment> {
    if (!id_appointment) throw new Error('ID de cita requerido');

    const validStatuses = ['pendiente', 'confirmada', 'atendida', 'cancelada'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`);
    }

    return this.http.patch<ApiResponse<Appointment>>(
      `${this.baseUrl}/${id_appointment}/status`,
      { status }
    ).pipe(
      map(r => r.data),
      catchError(e => this.handleError(e))
    );
  }

  // ── Cancelar propia cita (cliente) ────────────────────────
  cancelMyAppointment(id_appointment: string): Observable<Appointment> {
    if (!id_appointment) throw new Error('ID de cita requerido');

    return this.http.patch<ApiResponse<Appointment>>(
      `${this.baseUrl}/mias/${id_appointment}/cancelar`, {}
    ).pipe(
      map(r => r.data),
      catchError(e => this.handleError(e))
    );
  }


  /**
   * Actualiza una cita
   */
  updateAppointment(id_appointment: string, dto: any): Observable<Appointment> {
    if (!id_appointment) throw new Error('ID de cita requerido');

    return this.http.put<ApiResponse<Appointment>>(`${this.baseUrl}/${id_appointment}`, dto).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene fechas disponibles para un veterinario
   */
  getAvailableDates(veterinarianId: string): Observable<string[]> {
    if (!veterinarianId) throw new Error('ID de veterinario requerido');

    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/available-dates`, {
      params: { veterinarianId }
    }).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene horarios disponibles para un veterinario en una fecha específica
   * @param veterinarianId - ID del veterinario
   * @param date - Fecha en formato ISO (YYYY-MM-DD)
   */
  getAvailableSlots(veterinarianId: string, date: string): Observable<string[]> {
    if (!veterinarianId) throw new Error('ID de veterinario requerido');
    if (!date) throw new Error('Fecha requerida');

    // ✅ Validar formato de fecha
    const datePattern = /^\d{4}-\d{2}-\d{2}/;
    if (!datePattern.test(date)) {
      throw new Error('Formato de fecha inválido. Use YYYY-MM-DD');
    }

    // ✅ Convertir a UTC para la consulta
    const [year, month, day] = date.split('-');
    const utcDate = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    ));

    const utcDateString = utcDate.toISOString();

    return this.http.get<ApiResponse<string[]>>(`${this.baseUrl}/available-slots`, {
      params: {
        veterinarianId,
        date: utcDateString
      }
    }).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }
}