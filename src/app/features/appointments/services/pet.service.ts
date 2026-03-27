// services/pet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pet, CreatePetDto, PetFormData, UpdatePetDto } from '../models/pet.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pets`;

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
      errorMessage = 'Mascota no encontrada';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Obtiene las mascotas del usuario actual
   */
  getMyPets(): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(`${this.baseUrl}/My-Pets`)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Obtiene mascotas de un usuario (solo admin)
   */
  getPetsByUser(userId: string): Observable<Pet[]> {
    if (!userId) throw new Error('ID de usuario requerido');
    
    return this.http.get<ApiResponse<Pet[]>>(`${this.baseUrl}/user/${userId}`)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Obtiene una mascota por ID
   */
  getPetById(id_pet: string): Observable<Pet> {
    if (!id_pet) throw new Error('ID de mascota requerido');
    
    return this.http.get<ApiResponse<Pet>>(`${this.baseUrl}/${id_pet}`).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Crea una nueva mascota
   */
  createPet(dto: CreatePetDto): Observable<Pet> {
    // ✅ Validaciones
    if (!dto.name || dto.name.trim().length < 2) {
      throw new Error('El nombre de la mascota debe tener al menos 2 caracteres');
    }
    if (dto.weight !== undefined && dto.weight < 0) {
      throw new Error('El peso no puede ser negativo');
    }
    if (dto.age !== undefined && dto.age < 0) {
      throw new Error('La edad no puede ser negativa');
    }
    
    return this.http.post<ApiResponse<Pet>>(this.baseUrl, dto)
      .pipe(
        map(response => response.data),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Actualiza una mascota existente
   */
  updatePet(id_pet: string, dto: UpdatePetDto): Observable<Pet> {
    if (!id_pet) throw new Error('ID de mascota requerido');
    
    // ✅ Validaciones
    if (!dto.name || dto.name.trim().length < 2) {
      throw new Error('El nombre de la mascota debe tener al menos 2 caracteres');
    }
    
    return this.http.put<ApiResponse<Pet>>(`${this.baseUrl}/${id_pet}`, dto).pipe(
      map(response => response.data),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Elimina una mascota
   */
  deletePet(id_pet: string): Observable<void> {
    if (!id_pet) throw new Error('ID de mascota requerido');
    
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id_pet}`)
      .pipe(
        map(() => void 0),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Convierte PetFormData a CreatePetDto
   */
  convertFormToDto(formData: PetFormData): CreatePetDto {
    return {
      name: formData.name?.trim() || '',
      breed: formData.breed?.trim() || 'No especificada',
      weight: Math.max(0, formData.weight || 0),
      age: Math.max(0, formData.age || 0)
    };
  }
}