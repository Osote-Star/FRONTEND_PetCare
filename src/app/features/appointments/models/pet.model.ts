// src/app/models/pet.model.ts

/**
 * Modelo que devuelve la API (PetDto del backend)
 */
export interface Pet {
  id_pet: string;        // Guid → string
  name: string;          // nombre de la mascota
  breed: string;         // raza
  weight: number;        // decimal → number (peso en kg)
  age: number;           // edad en años
  user_name: string;     // nombre del dueño
  id_user: string;       // Guid → string (ID del dueño)
}

/**
 * DTO para crear mascota (CreatePetDto del backend)
 */
export interface CreatePetDto {
  name: string;
  breed: string;
  weight: number;
  age: number;
}

/**
 * DTO para actualizar mascota (UpdatePetDto del backend)
 */
export interface UpdatePetDto {
  name: string;
  breed: string;
  weight: number;
  age: number;
}

/**
 * Modelo extendido para el formulario del wizard (UI)
 * Campos adicionales que no están en la API pero se usan en el frontend
 */
export interface PetFormData {
  // Campos para la API
  id_pet?: string;           // Si es mascota existente
  name: string;              // nombre
  breed: string;             // raza
  weight: number;            // peso
  age: number;               // edad
  
  // Campos adicionales SOLO para UI (no se envían a la API)
  species?: string;          // especie (perro, gato, etc) - solo UI
  gender?: string;           // sexo - solo UI
  allergies?: string;        // alergias - solo UI
  photo?: string | null;     // foto base64 - solo UI
  neutered?: boolean | null; // esterilizado - solo UI
}

/**
 * Helper para convertir PetFormData a CreatePetDto
 */
export function convertToCreatePetDto(formData: PetFormData): CreatePetDto {
  return {
    name: formData.name,
    breed: formData.breed || 'No especificada',
    weight: formData.weight || 0,
    age: formData.age || 0
  };
}

/**
 * Helper para convertir Pet a PetFormData
 */
export function convertToPetFormData(pet: Pet): PetFormData {
  return {
    id_pet: pet.id_pet,
    name: pet.name,
    breed: pet.breed,
    weight: pet.weight,
    age: pet.age,
    species: '',        // La API no tiene este campo
    gender: '',         // La API no tiene este campo
    allergies: '',      // La API no tiene este campo
    photo: null,
    neutered: null
  };
}