// services/pet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pet, CreatePetDto, PetFormData, UpdatePetDto } from '../models/pet.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pets`;

  /**
   * Obtener mis mascotas (cliente logueado)
   * ✅ CORREGIDO: endpoint es /My-Pets (con mayúscula)
   */
  getMyPets(): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(`${this.baseUrl}/My-Pets`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener mascotas de un usuario (solo admin)
   */
  getPetsByUser(userId: string): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(`${this.baseUrl}/user/${userId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Obtener mascota por ID
   */
  // services/pet.service.ts
getPetById(id_pet: string): Observable<Pet> {
  return this.http.get<ApiResponse<Pet>>(`${this.baseUrl}/${id_pet}`).pipe(
    map(response => response.data)
  );
}
  /**
   * Crear una nueva mascota
   */
  createPet(dto: CreatePetDto): Observable<Pet> {
    console.log('📝 Creando mascota:', dto);
    return this.http.post<ApiResponse<Pet>>(this.baseUrl, dto)
      .pipe(map(response => {
        console.log('✅ Mascota creada:', response.data);
        return response.data;
      }));
  }

// services/pet.service.ts - Añadir este método
updatePet(id_pet: string, dto: UpdatePetDto): Observable<Pet> {
  console.log('✏️ Actualizando mascota:', { id_pet, dto });
  return this.http.put<ApiResponse<Pet>>(`${this.baseUrl}/${id_pet}`, dto).pipe(
    map(response => {
      console.log('✅ Mascota actualizada:', response.data);
      return response.data;
    })
  );
}

  /**
   * Eliminar mascota
   */
  deletePet(id_pet: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id_pet}`)
      .pipe(map(response => response.data));
  }

  /**
   * Método helper para convertir PetFormData a CreatePetDto
   */
  convertFormToDto(formData: PetFormData): CreatePetDto {
    return {
      name: formData.name,
      breed: formData.breed || 'No especificada',
      weight: formData.weight || 0,
      age: formData.age || 0
    };
  }
}