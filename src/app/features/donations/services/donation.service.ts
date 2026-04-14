// features/donations/services/donation.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../auth/models/auth.model';
import { CreateDonationDto, CaptureDonationDto, Donation } from '../models/donation.model';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/Donations`;

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
   * Crea una orden de donación en PayPal
   */
  createOrder(dto: CreateDonationDto): Observable<Donation> {
    if (!dto.amount || dto.amount <= 0)
      throw new Error('El monto debe ser mayor a 0');

    return this.http.post<ApiResponse<Donation>>(`${this.baseUrl}/crear-orden`, dto).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Captura y confirma el pago aprobado por PayPal
   */
  captureOrder(dto: CaptureDonationDto): Observable<Donation> {
    if (!dto.paypal_order_id)
      throw new Error('ID de orden de PayPal requerido');

    return this.http.post<ApiResponse<Donation>>(`${this.baseUrl}/capturar-orden`, dto).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Obtiene todas las donaciones (solo admin)
   */
  getAll(): Observable<Donation[]> {
    return this.http.get<ApiResponse<Donation[]>>(this.baseUrl).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }
}