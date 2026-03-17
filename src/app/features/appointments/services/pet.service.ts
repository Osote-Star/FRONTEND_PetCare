// services/pet.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pet, CreatePetDto, PetFormData } from '../models/pet.model';
import { ApiResponse } from '../../auth/models/auth.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pets`;

  getMyPets(): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(`${this.baseUrl}/my-pets`)
      .pipe(map(response => response.data));
  }

  getPetsByUser(userId: string): Observable<Pet[]> {
    return this.http.get<ApiResponse<Pet[]>>(`${this.baseUrl}/user/${userId}`)
      .pipe(map(response => response.data));
  }

  createPet(dto: CreatePetDto): Observable<Pet> {
    return this.http.post<ApiResponse<Pet>>(this.baseUrl, dto)
      .pipe(map(response => response.data));
  }

  deletePet(id_pet: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id_pet}`)
      .pipe(map(response => response.data));
  }

  // Método helper para convertir PetFormData a CreatePetDto
  convertFormToDto(formData: PetFormData): CreatePetDto {
    return {
      name: formData.name,
      breed: formData.breed || '',
      weight: formData.weight || 0,
      age: formData.age || 0
    };
  }
}