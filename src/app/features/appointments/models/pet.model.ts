// src/app/models/pet.model.ts

// Para la API (lo que devuelve el backend)
export interface Pet {
  id_pet: string;
  name: string;
  breed: string;
  weight: number;
  age: number;
  user_name?: string;
  id_user?: number;
}

// Para crear una mascota (enviar al backend)
export interface CreatePetDto {
  name: string;
  breed: string;
  weight: number;
  age: number;
}

// Para el formulario extendido del wizard (con campos adicionales)
export interface PetFormData {
  id_pet?: string;
  name: string;
  breed: string;
  weight: number;
  age: number;
  species?: string;        // Campo adicional UI
  gender?: string;         // Campo adicional UI
  allergies?: string;      // Campo adicional UI
  photo?: string | null;   // Campo adicional UI
  neutered?: boolean | null;
}